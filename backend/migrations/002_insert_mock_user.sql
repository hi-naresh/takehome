-- Insert a mock user for development/testing
INSERT INTO public.users (id, email, created_at) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'mock-user@example.com',
  NOW()
) ON CONFLICT (id) DO NOTHING;
