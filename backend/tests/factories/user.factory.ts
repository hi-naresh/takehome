import { v4 as uuidv4 } from 'uuid';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export class UserFactory {
  static create(overrides: Partial<TestUser> = {}): TestUser {
    return {
      id: uuidv4(),
      email: 'test@example.com',
      name: 'Test User',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      ...overrides,
    };
  }

  static createMany(
    count: number,
    overrides: Partial<TestUser> = {},
  ): TestUser[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
