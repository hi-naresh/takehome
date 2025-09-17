import type { ReminderStatus, UpcomingRenewal } from '../types/contracts';
import type { HttpClient, RemindersApi } from './index';

export class RemindersApiImpl implements RemindersApi {
  constructor(private readonly http: HttpClient) {}

  scheduleReminder(
    contractId: string,
    renewalDate: string,
    daysBeforeRenewal: number,
    enabled: boolean,
  ): Promise<{ success: boolean }> {
    return this.http.request(`/contracts/${contractId}/reminder`, {
      method: 'POST',
      body: JSON.stringify({ renewalDate, daysBeforeRenewal, enabled }),
    });
  }

  getReminderStatus(contractId: string): Promise<ReminderStatus> {
    return this.http.request(`/contracts/${contractId}/reminder/status`);
  }

  async getUpcomingRenewals(userId: string, daysAhead: number): Promise<UpcomingRenewal[]> {
    const result = await this.http.request<{ success: boolean; data: UpcomingRenewal[] }>(
      `/contracts/user/${userId}/upcoming-renewals?daysAhead=${daysAhead}`,
    );
    return result.data;
  }
}


