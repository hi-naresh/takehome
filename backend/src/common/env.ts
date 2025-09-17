export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  GEMINI_API_KEY?: string;
}

export const validateEnvironment = (): Environment => {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'OPENAI_API_KEY'];

  // Skip validation in test environment
  if (process.env.NODE_ENV === 'test') {
    return {
      NODE_ENV: 'test',
      PORT: parseInt(process.env.PORT || '3001', 10),
      SUPABASE_URL: process.env.SUPABASE_URL || 'https://test.supabase.co',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY:
        process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'test-openai-key',
      OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    };
  }

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    NODE_ENV:
      (process.env.NODE_ENV as Environment['NODE_ENV']) || 'development',
    PORT: parseInt(process.env.PORT || '3001', 10),
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  };
};
