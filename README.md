# AI-Powered PDF Contract Extraction System

A production-ready full-stack application that extracts structured data from contract PDFs using AI, built with SOLID principles and hexagonal architecture.

## 🏗️ Architecture Overview

This system consists of two main applications:

- **Backend**: NestJS API with AI-powered PDF extraction
- **Frontend**: Next.js application with shadcn/ui components

## 📋 Developer Overview

See [backend/docs/OVERVIEW.md](backend/docs/OVERVIEW.md) for architectural decisions, future vision, and development perspective.

## 🎯 What's Achieved

✅ **AI-Powered Extraction**: Automated contract data extraction using OpenAI GPT  
✅ **RESTful API**: Complete CRUD operations for contract management  
✅ **File Upload**: PDF upload with validation and processing  
✅ **Reminder System**: Contract renewal reminder scheduling  
✅ **Comprehensive Testing**: 90+ tests with 100% coverage  
✅ **Production Ready**: Error handling, validation, logging, and monitoring  

## 🚀 Quick Setup

### Prerequisites
- Node.js >= 20
- [Supabase account (free tier)](https://supabase.com/)
- [OpenAI API key](https://platform.openai.com/account/api-keys)

### Clone the repository

```bash
git clone https://github.com/hi-naresh/takehome.git
cd takehome
```

### Setup

- Set up supabase project and create a new database and run the migration either using supabase cli or supabase studio manually: [Migration](backend/migrations/001_initial_schema.sql)
- Setup supabase Storage bucket : [Storage](backend/migrations/003_storage_bucket.sql)
- Insert a mock user to the users table: [Users](backend/migrations/002_insert_mock_user.sql)
- Set up openai api key
- Setup frontend and backend environment variables from above setup and change the values to your own.

### Setup Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

## 🚀 Quick Start

### Use Quick Script to run the application but make sure you have setup the environment variables first.

### Run the quick script

```bash
./quick-start.sh
```

### Start the application manually by running the following commands in separate terminals

Backend:

```bash
cd backend
npm install
npm run start:dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

### Open the application in the browser

```bash
open http://localhost:3000
```

### Open the backend in the browser

```bash
open http://localhost:3001/api/docs
```

## 📊 API Endpoints

### Contracts API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/contracts/upload` | Upload and extract contract data |
| GET | `/contracts/user/:userId` | Get all contracts for a user |
| GET | `/contracts/:id` | Get specific contract |
| PUT | `/contracts/:id` | Update contract |
| POST | `/contracts/:id/reminder` | Schedule reminder |
| GET | `/contracts/:id/reminder/status` | Get reminder status |
| GET | `/contracts/user/:userId/upcoming-renewals` | Get upcoming renewals |

## 🚀 Deployment

### Backend Deployment

1. Set up production environment variables
2. Build the application: `npm run build`
3. Deploy to your preferred platform (Vercel, Railway, etc.)
4. Configure Supabase production database

### Frontend Deployment

1. Configure production API URL
2. Build the application: `npm run build`
3. Deploy to Vercel, Netlify, or similar platform

## 🤝 Contributing

1. Follow SOLID principles
2. Maintain type safety with TypeScript
3. Write comprehensive tests
4. Update documentation
5. Follow existing code patterns

---
