import { Contract } from '../../src/types/database';
import { v4 as uuidv4 } from 'uuid';

export class ContractFactory {
  static create(overrides: Partial<Contract> = {}): Contract {
    return {
      id: uuidv4(),
      user_id: uuidv4(),
      contract_holder_name: 'Test Company Inc.',
      contract_identifier: 'TEST-2024-001',
      renewal_date: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 1 year from now
      service_product: 'Cloud Services',
      contact_email: 'test@example.com',
      file_path: '/uploads/test-contract.pdf',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }

  static createMany(
    count: number,
    overrides: Partial<Contract> = {},
  ): Contract[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createExpiring(overrides: Partial<Contract> = {}): Contract {
    return this.create({
      renewal_date: new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 15 days from now
      ...overrides,
    });
  }

  static createExpired(overrides: Partial<Contract> = {}): Contract {
    return this.create({
      renewal_date: new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 30 days ago
      ...overrides,
    });
  }
}
