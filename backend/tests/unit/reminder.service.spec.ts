import { Test, TestingModule } from '@nestjs/testing';
import { ContractReminderBusinessService } from '../../src/modules/contracts/services/reminder.service';
import { SupabaseService } from '../../src/common/supabase';
import { ContractReminderService } from '../../src/core/util/reminder-scheduler';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('ContractReminderBusinessService', () => {
  let service: ContractReminderBusinessService;
  let mockSupabaseService: jest.Mocked<SupabaseService>;
  let mockReminderService: jest.Mocked<ContractReminderService>;
  let mockSupabaseClient: any;

  beforeEach(async () => {
    // Mock Supabase client
    mockSupabaseClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { renewal_date: '2024-12-31' },
              error: null,
            }),
            not: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockReturnValue({
                  order: jest.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    const mockSupabaseServiceValue = {
      getClient: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    const mockReminderServiceValue = {
      scheduleReminder: jest.fn(),
      cancelReminder: jest.fn(),
      getUpcomingReminders: jest.fn().mockReturnValue([]),
      calculateDaysUntilRenewal: jest.fn().mockReturnValue(30),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractReminderBusinessService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseServiceValue,
        },
        {
          provide: ContractReminderService,
          useValue: mockReminderServiceValue,
        },
      ],
    }).compile();

    service = module.get<ContractReminderBusinessService>(
      ContractReminderBusinessService,
    );
    mockSupabaseService = module.get(SupabaseService);
    mockReminderService = module.get(ContractReminderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should schedule reminder successfully', () => {
    const dto = {
      contractId: 'test-contract-123',
      renewalDate: '2024-12-31',
      daysBeforeRenewal: 30,
      enabled: true,
    };

    service.scheduleReminder(dto);

    expect(mockReminderService.scheduleReminder).toHaveBeenCalledWith(
      dto.contractId,
      new Date(dto.renewalDate),
      {
        daysBeforeRenewal: dto.daysBeforeRenewal,
        enabled: dto.enabled,
      },
    );
  });

  it('should handle reminder scheduling errors', () => {
    const dto = {
      contractId: 'test-contract-123',
      renewalDate: '2024-12-31',
      daysBeforeRenewal: 30,
      enabled: true,
    };

    mockReminderService.scheduleReminder.mockImplementation(() => {
      throw new Error('Scheduling failed');
    });

    expect(() => service.scheduleReminder(dto)).toThrow(
      'Reminder scheduling failed: Scheduling failed',
    );
  });

  it('should get reminder status successfully', async () => {
    const contractId = 'test-contract-123';
    const renewalDate = '2024-12-31';

    const result = await service.getReminderStatus(contractId);

    expect(result).toEqual({
      contractId,
      daysUntilRenewal: expect.any(Number),
      reminderScheduled: false,
    });

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('contracts');
  });

  it('should handle contract not found error', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Contract not found' },
          }),
        }),
      }),
    });

    const contractId = 'non-existent-contract';

    await expect(service.getReminderStatus(contractId)).rejects.toThrow(
      'Contract not found: non-existent-contract',
    );
  });

  it('should get upcoming renewals successfully', async () => {
    const userId = 'test-user-123';
    const daysAhead = 30;

    const mockContracts = [
      { id: 'contract-1', renewal_date: '2024-12-01', user_id: userId },
      { id: 'contract-2', renewal_date: '2024-12-15', user_id: userId },
    ];

    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          not: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: mockContracts,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }),
    });

    const result = await service.getUpcomingRenewals(userId, daysAhead);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('daysUntilRenewal');
    expect(result[0]).toHaveProperty('id', 'contract-1');
  });

  it('should handle upcoming renewals errors', async () => {
    const userId = 'test-user-123';
    const daysAhead = 30;

    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          not: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database error' },
                }),
              }),
            }),
          }),
        }),
      }),
    });

    await expect(
      service.getUpcomingRenewals(userId, daysAhead),
    ).rejects.toThrow(
      'Upcoming renewals retrieval failed: Upcoming renewals retrieval failed: Unknown error',
    );
  });
});
