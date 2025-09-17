# AI-Powered Contract Extraction API

A production-ready NestJS backend that extracts structured data from contract PDFs using AI, built with SOLID principles and hexagonal architecture.

> 📋 **Developer Overview**: See [docs/OVERVIEW.md](docs/OVERVIEW.md) for architectural decisions, future vision, and development perspective.

## 🎯 What's Achieved

✅ **AI-Powered Extraction**: Automated contract data extraction using OpenAI GPT  
✅ **RESTful API**: Complete CRUD operations for contract management  
✅ **File Upload**: PDF upload with validation and processing  
✅ **Reminder System**: Contract renewal reminder scheduling  
✅ **Comprehensive Testing**: 90+ tests with 100% coverage  
✅ **Production Ready**: Error handling, validation, logging, and monitoring  

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- Supabase account
- OpenAI API key

### Installation & Setup
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
# (See Database Setup in docs/ARCHITECTURE.md)

# Start development server
npm run start:dev
```

### Essential Environment Variables
```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

## 📊 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/contracts/upload` | Upload and extract contract data |
| GET | `/contracts/user/:userId` | Get user contracts |
| GET | `/contracts/:id` | Get specific contract |
| PUT | `/contracts/:id` | Update contract |
| POST | `/contracts/:id/reminder` | Schedule reminder |
| GET | `/contracts/:id/reminder/status` | Get reminder status |

**API Documentation**: `http://localhost:3001/api/docs`

## 🧪 Testing

```bash
# Run all tests
npm test

# Specific test types
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests  
npm run test:e2e          # End-to-end tests

# Coverage report
npm run test:cov
```

**Test Results**: 90/90 tests passing ✅  
**Coverage**: 100% across all modules

## 📁 Project Structure

```
src/
├── common/           # Shared utilities (env, supabase, error handling)
├── core/            # Domain services (AI, file upload, reminders)
├── modules/         # Feature modules (contracts)
└── types/           # Type definitions
```

## 📚 Documentation

- **[Architecture & Design](docs/ARCHITECTURE.md)** - Detailed system design and patterns
- **[High-Level Understanding](docs/EASE.md)** - High-level understanding of the system
- **[Testing Guide](docs/TESTING.md)** - Comprehensive testing documentation  
- **[Developer Overview](docs/OVERVIEW.md)** - Future vision and architectural decisions
- **[API Reference](docs/API.md)** - Complete API documentation

## 🔧 Development

```bash
npm run start:dev      # Development with hot reload
npm run build          # Production build
npm run lint           # Code linting
npm run format         # Code formatting
```

## 🚀 Production

```bash
npm run build
npm run start:prod
```

**Health Check**: `GET /health`

## 🔐 Security & Performance

- Environment validation
- Input validation with DTOs
- Global exception handling
- Rate limiting
- CORS configuration
- Async/await throughout
- Connection pooling

## 🤝 Contributing

1. Follow SOLID principles
2. Write comprehensive tests
3. Update documentation
4. Use TypeScript strictly

---

*Built using NestJS, TypeScript, and OpenAI*