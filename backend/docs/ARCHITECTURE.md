# Architecture & Design

## 🏗️ System Architecture

This backend follows **SOLID principles** and **hexagonal architecture** patterns:

- **Single Responsibility**: Each service has one clear purpose
- **Open/Closed**: Extensible without modification
- **Liskov Substitution**: Interchangeable implementations
- **Interface Segregation**: Focused, specific contracts
- **Dependency Inversion**: Depend on abstractions, not concretions

## 📁 Project Structure

```
src/
├── common/           # Shared utilities and configurations
│   ├── env.ts       # Environment validation
│   ├── supabase.ts  # Supabase client
│   ├── error-handling.ts # Global exception filter
│   └── rate-limiting.ts  # Rate limiting service
├── core/            # Domain services and contracts
│   ├── ai/          # AI-related services
│   │   ├── ai.contracts.ts    # AI interfaces
│   │   ├── ai.tokens.ts       # Injection tokens
│   │   ├── providers/         # AI provider implementations
│   │   └── services/          # AI services
│   └── util/        # Utility services
│       ├── file-uploader.ts   # File upload service
│       └── reminder-scheduler.ts # Reminder service
├── modules/         # Feature modules
│   └── contracts/   # Contract management
│       ├── controllers/       # API controllers
│       ├── services/          # Business services
│       ├── dtos/             # Data transfer objects
│       └── contracts.module.ts # Module definition
└── types/           # Type definitions
    └── database.ts  # Database types
```

## 🔧 Core Components

### AI Integration

The AI system is built with loose coupling:

```typescript
// Contracts define the interface
interface AIProvider {
  complete(request: CompletionRequest): Promise<CompletionResult>;
  isHealthy(): Promise<boolean>;
}

// Providers implement the interface
@Injectable()
export class OpenAIProvider implements AIProvider {
  // Implementation details
}

// Services depend on the interface
@Injectable()
export class ContractExtractionService {
  constructor(
    @Inject(AI_PROVIDER) private readonly aiProvider: AIProvider
  ) {}
}
```

### Dependency Injection

Uses symbol-based injection tokens for type safety:

```typescript
export const AI_PROVIDER = Symbol('AI_PROVIDER');
export const EXTRACTION_SERVICE = Symbol('EXTRACTION_SERVICE');
```

## 🗄️ Database Integration

### Supabase Integration

```typescript
@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;
  
  constructor(private configService: ConfigService) {
    this.client = createClient(url, key);
  }
  
  async isHealthy(): Promise<boolean> {
    // Health check implementation
  }
}
```

### Database Types

Auto-generated TypeScript types from Supabase schema:

```typescript
export interface Contract {
  id: string;
  user_id: string | null;
  contract_holder_name: string | null;
  contract_identifier: string | null;
  renewal_date: string | null;
  service_product: string | null;
  contact_email: string | null;
  file_path: string | null;
  created_at: string;
  updated_at: string;
}
```

## 🔄 AI Provider System

### Current Providers

- **OpenAI Provider**: GPT models for text extraction
- **Extensible**: Easy to add new providers (Gemini, Claude, etc.)

### Adding New Providers

1. Implement the `AIProvider` interface
2. Register in the module with injection token
3. Configure environment variables
4. Add tests

## 📝 Logging

Comprehensive logging throughout the application:

```typescript
private readonly logger = new Logger(ServiceName.name);

// Usage
this.logger.log('Operation successful');
this.logger.error('Operation failed', error);
this.logger.warn('Warning message');
```

## 🔐 Security Features

- **Environment Validation**: Strict environment variable validation
- **Input Validation**: DTO validation with class-validator
- **Global Exception Handling**: Centralized error handling
- **Rate Limiting**: In-memory rate limiting service
- **CORS Configuration**: Secure cross-origin requests

## 📈 Performance Features

- **Async/Await**: Non-blocking operations throughout
- **Connection Pooling**: Efficient database connections
- **Memory Caching**: Rate limit caching
- **Stream Processing**: Efficient PDF processing
- **Optimized Queries**: Database query optimization

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start:prod
```

### Environment Variables

Required production environment variables:

- `NODE_ENV=production`
- `PORT=3001`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

### Health Checks

- **Application Health**: `GET /health`
- **Database Health**: Built into Supabase service
- **AI Provider Health**: Built into AI providers

## 🔧 Development Scripts

```bash
npm run start:dev      # Development server with hot reload
npm run start:debug    # Debug mode
npm run build          # Build for production
npm run lint           # Lint code
npm run format         # Format code
npm run typecheck      # TypeScript check
```

## 🐛 Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure all required variables are set
2. **Database Connection**: Verify Supabase configuration
3. **AI Provider**: Check OpenAI API key and quota
4. **Port Conflicts**: Ensure port 3001 is available

### Debug Mode

```bash
npm run start:debug
```

### Logs

Check application logs for detailed error information.