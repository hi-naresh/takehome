import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase';
import { ContractReminderService } from '../../../core/util/reminder-scheduler';
import { ScheduleReminderDto, ReminderStatusDto } from '../dtos/reminder.dto';

@Injectable()
export class ContractReminderBusinessService {
  private readonly logger = new Logger(ContractReminderBusinessService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly reminderService: ContractReminderService,
  ) {}

  scheduleReminder(dto: ScheduleReminderDto): void {
    try {
      this.logger.log(`Scheduling reminder for contract: ${dto.contractId}`);

      const renewalDate = new Date(dto.renewalDate);

      this.reminderService.scheduleReminder(dto.contractId, renewalDate, {
        daysBeforeRenewal: dto.daysBeforeRenewal,
        enabled: dto.enabled,
      });

      this.logger.log(
        `Reminder scheduled successfully for contract: ${dto.contractId}`,
      );
    } catch (error) {
      this.logger.error('Reminder scheduling failed', error);
      throw new Error(
        `Reminder scheduling failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getReminderStatus(contractId: string): Promise<ReminderStatusDto> {
    try {
      // Get contract details from database
      const { data: contract, error } = await this.supabaseService
        .getClient()
        .from('contracts')
        .select('renewal_date')
        .eq('id', contractId)
        .single();

      if (error || !contract) {
        throw new Error(`Contract not found: ${contractId}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!(contract as any).renewal_date) {
        return {
          contractId,
          daysUntilRenewal: 0,
          reminderScheduled: false,
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const renewalDate = new Date((contract as any).renewal_date as string);
      const daysUntilRenewal =
        this.reminderService.calculateDaysUntilRenewal(renewalDate);

      // Check if reminder is scheduled (in real implementation, this would query a reminders table)
      const upcomingReminders = this.reminderService.getUpcomingReminders();
      const reminderScheduled = upcomingReminders.some(
        (r) => r.contractId === contractId,
      );

      return {
        contractId,
        daysUntilRenewal,
        reminderScheduled,
      };
    } catch (error) {
      this.logger.error('Reminder status retrieval failed', error);
      throw new Error(
        `Reminder status retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getUpcomingRenewals(
    userId: string,
    daysAhead: number = 30,
  ): Promise<Array<Record<string, unknown> & { daysUntilRenewal: number }>> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const { data, error } = await this.supabaseService
        .getClient()
        .from('contracts')
        .select('*')
        .eq('user_id', userId)
        .not('renewal_date', 'is', null)
        .gte('renewal_date', new Date().toISOString())
        .lte('renewal_date', futureDate.toISOString())
        .order('renewal_date', { ascending: true });

      if (error) {
        throw new Error(
          `Upcoming renewals retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }

      return (data || []).map((contract) => {
        const contractData = contract as Record<string, unknown>;
        return {
          ...contractData,
          daysUntilRenewal: this.reminderService.calculateDaysUntilRenewal(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            new Date((contract as any).renewal_date as string),
          ),
        };
      }) as Array<Record<string, unknown> & { daysUntilRenewal: number }>;
    } catch (error) {
      this.logger.error('Upcoming renewals retrieval failed', error);
      throw new Error(
        `Upcoming renewals retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
