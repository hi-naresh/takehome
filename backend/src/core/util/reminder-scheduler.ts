import { Injectable, Logger } from '@nestjs/common';

export interface ReminderConfig {
  daysBeforeRenewal: number;
  enabled: boolean;
}

export interface ReminderService {
  scheduleReminder(
    contractId: string,
    renewalDate: Date,
    config: ReminderConfig,
  ): void;
  cancelReminder(contractId: string): void;
  getUpcomingReminders(): Array<{ contractId: string; reminderDate: Date }>;
}

@Injectable()
export class ContractReminderService implements ReminderService {
  private readonly logger = new Logger(ContractReminderService.name);
  private readonly scheduledReminders = new Map<string, NodeJS.Timeout>();

  scheduleReminder(
    contractId: string,
    renewalDate: Date,
    config: ReminderConfig,
  ): void {
    if (!config.enabled) {
      this.logger.log(`Reminders disabled for contract ${contractId}`);
      return;
    }

    // Cancel existing reminder if any
    this.cancelReminder(contractId);

    const reminderDate = new Date(renewalDate);
    reminderDate.setDate(reminderDate.getDate() - config.daysBeforeRenewal);

    const now = new Date();
    const delayMs = reminderDate.getTime() - now.getTime();

    if (delayMs <= 0) {
      this.logger.warn(
        `Reminder date for contract ${contractId} is in the past`,
      );
      return;
    }

    const timeout = setTimeout(() => {
      void this.sendReminder(contractId, renewalDate);
    }, delayMs);

    this.scheduledReminders.set(contractId, timeout);

    this.logger.log(
      `Reminder scheduled for contract ${contractId} on ${reminderDate.toISOString()}`,
    );
  }

  cancelReminder(contractId: string): void {
    const timeout = this.scheduledReminders.get(contractId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledReminders.delete(contractId);
      this.logger.log(`Reminder cancelled for contract ${contractId}`);
    }
  }

  getUpcomingReminders(): Array<{ contractId: string; reminderDate: Date }> {
    // In a real implementation, this would query the database
    // For now, return empty array as reminders are handled in-memory
    return [];
  }

  private sendReminder(contractId: string, renewalDate: Date): void {
    try {
      this.logger.log(`Sending renewal reminder for contract ${contractId}`);

      // In a real implementation, this would:
      // 1. Fetch contract details from database
      // 2. Send email/SMS notification
      // 3. Log the reminder in audit table

      // For now, just log the action
      this.logger.log(
        `Reminder sent: Contract ${contractId} expires on ${renewalDate.toISOString()}`,
      );

      // Remove from scheduled reminders
      this.scheduledReminders.delete(contractId);
    } catch (error) {
      this.logger.error(
        `Failed to send reminder for contract ${contractId}`,
        error,
      );
    }
  }

  // Utility method to calculate days until renewal
  calculateDaysUntilRenewal(renewalDate: Date): number {
    const now = new Date();
    const timeDiff = renewalDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}
