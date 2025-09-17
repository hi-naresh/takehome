import { Test, TestingModule } from '@nestjs/testing';
import { ContractReminderService } from '../../src/core/util/reminder-scheduler';

describe('ContractReminderService', () => {
  let service: ContractReminderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractReminderService],
    }).compile();

    service = module.get<ContractReminderService>(ContractReminderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should schedule reminder successfully', () => {
    const contractId = 'test-contract-123';
    const renewalDate = new Date('2025-12-31'); // Future date
    const config = {
      daysBeforeRenewal: 30,
      enabled: true,
    };

    // Mock setTimeout to avoid actual delays
    const setTimeoutSpy = jest
      .spyOn(global, 'setTimeout')
      .mockImplementation((callback: any) => {
        // Don't call the callback immediately
        return 123 as any;
      });

    service.scheduleReminder(contractId, renewalDate, config);

    expect(setTimeoutSpy).toHaveBeenCalled();
  });

  it('should not schedule reminder when disabled', () => {
    const contractId = 'test-contract-123';
    const renewalDate = new Date('2024-12-31');
    const config = {
      daysBeforeRenewal: 30,
      enabled: false,
    };

    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

    service.scheduleReminder(contractId, renewalDate, config);

    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  it('should cancel existing reminder before scheduling new one', () => {
    const contractId = 'test-contract-123';
    const renewalDate = new Date('2025-12-31'); // Future date
    const config = {
      daysBeforeRenewal: 30,
      enabled: true,
    };

    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const setTimeoutSpy = jest
      .spyOn(global, 'setTimeout')
      .mockImplementation(() => 123 as any);

    // Schedule first reminder
    service.scheduleReminder(contractId, renewalDate, config);

    // Schedule second reminder (should cancel first)
    service.scheduleReminder(contractId, renewalDate, config);

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenCalledTimes(2);
  });

  it('should not schedule reminder for past dates', () => {
    const contractId = 'test-contract-123';
    const pastDate = new Date('2020-01-01');
    const config = {
      daysBeforeRenewal: 30,
      enabled: true,
    };

    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

    service.scheduleReminder(contractId, pastDate, config);

    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  it('should cancel reminder successfully', () => {
    const contractId = 'test-contract-123';
    const renewalDate = new Date('2025-12-31'); // Future date
    const config = {
      daysBeforeRenewal: 30,
      enabled: true,
    };

    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const setTimeoutSpy = jest
      .spyOn(global, 'setTimeout')
      .mockImplementation(() => 123 as any);

    service.scheduleReminder(contractId, renewalDate, config);
    service.cancelReminder(contractId);

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should get upcoming reminders', () => {
    const contractId = 'test-contract-123';
    const renewalDate = new Date('2025-12-31'); // Future date
    const config = {
      daysBeforeRenewal: 30,
      enabled: true,
    };

    jest.spyOn(global, 'setTimeout').mockImplementation(() => 123 as any);

    service.scheduleReminder(contractId, renewalDate, config);

    const upcomingReminders = service.getUpcomingReminders();

    // The service returns empty array as it's designed to query database
    expect(upcomingReminders).toHaveLength(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
