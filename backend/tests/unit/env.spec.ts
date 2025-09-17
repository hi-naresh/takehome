import { validateEnvironment } from '../../src/common/env';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should validate successfully with all required environment variables', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';

    const result = validateEnvironment();

    expect(result.SUPABASE_URL).toBe('https://test.supabase.co');
    expect(result.SUPABASE_ANON_KEY).toBe('test-anon-key');
    expect(result.OPENAI_API_KEY).toBe('test-openai-key');
  });

  it('should skip validation in test environment', () => {
    process.env.NODE_ENV = 'test';

    const result = validateEnvironment();

    expect(result.NODE_ENV).toBe('test');
    expect(result.SUPABASE_URL).toBe('https://test.supabase.co');
    expect(result.SUPABASE_ANON_KEY).toBe('test-anon-key');
    expect(result.OPENAI_API_KEY).toBe('test-openai-key');
  });

  it('should throw error for missing required environment variables', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.OPENAI_API_KEY;

    expect(() => validateEnvironment()).toThrow(
      'Missing required environment variable: SUPABASE_URL',
    );
  });

  it('should use default values for optional environment variables', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.PORT = '3001';

    const result = validateEnvironment();

    expect(result.PORT).toBe(3001);
    expect(result.OPENAI_MODEL).toBe('gpt-3.5-turbo');
  });

  it('should handle GEMINI_API_KEY as optional', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.GEMINI_API_KEY = 'test-gemini-key';

    const result = validateEnvironment();

    expect(result.GEMINI_API_KEY).toBe('test-gemini-key');
  });
});
