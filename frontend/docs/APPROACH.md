# Current Implementation & Future Approach

- For now, I’ve used a monorepo structure, but for a scalable system we’ll adopt better practices. This will avoid tight dependencies or single commits across projects. Since our CI/CD pipeline will handle automated deployments, we’ll eventually keep services isolated once I join the team.

- Currently, the system is written in TypeScript only, but we plan to move toward a microservices architecture. For example, our AI/ML microservices will be implemented in Python, which is more suitable for long-term scalability and performance.

- At this stage, deployment was not a priority, so I kept it simple. In the future, we’ll introduce CI/CD pipelines with Docker-based containerization. Once the backend structure is fully planned, we’ll decide on the appropriate architecture—such as event-driven or another suitable pattern.

- We’ll enforce rate limiting and file size limits on uploads, as well as rate limiting on extraction processes, to ensure stability and performance.

- An AI abstraction provider will be introduced, which will act as a unified interface across the system. Once initialized, this provider will support multiple AI service implementations, allowing flexibility and extensibility.

- At present, we’re using OpenAI GPT, but we can integrate other models as needed in the future.

## Future Architecture Proposed

Below architecture is proposed by me to make scalable and extensible application.

### Architecture Flow

UI (components/hooks) → Application/Service (use-cases) → Domain (entities, rules) → Ports → Adapters (infra: HTTP/Supabase) → External services/DB

### Key Features Implemented

1. **✅ Domain-Driven Design**
   - Clean separation between business logic and UI
   - Framework-agnostic domain layer
   - Comprehensive validation with Zod schemas

2. **✅ Feature-Based Organization**
   - Self-contained feature modules
   - Reusable components and hooks
   - Centralized string management

3. **✅ Server Actions & API Routes**
   - "use server" actions for data operations
   - RESTful API endpoints
   - Proper error handling and validation

4. **✅ Type Safety**
   - Full TypeScript coverage
   - Zod validation schemas
   - Proper type definitions throughout

5. **✅ Testing Infrastructure**
   - Vitest configuration
   - Domain logic tests (17/23 passing)
   - Component testing setup

6. **✅ Build & Lint Success**
   - ✅ No build errors
   - ✅ No lint errors
   - ✅ TypeScript compilation successful

### Future Architecture of the application

```src/
├── app/
│   ├── (dashboard)/
│   │   └── contracts/
│   │       ├── page.tsx                      # Single screen: Upload → Extract → Edit → Save
│   │       └── actions/
│   │           ├── extractFields.ts          # "use server" – PDF → fields
│   │           └── saveContract.ts           # "use server" – persist to Supabase
│   └── api/
│       └── contracts/
│           ├── route.ts                      # POST /api/contracts
│           ├── extract/route.ts              # POST /api/contracts/extract
│           └── [id]/route.ts                 # PUT /api/contracts/[id]
├── features/
│   └── contracts/
│       ├── components/
│       │   ├── ContractUpload.tsx            # Small upload control (reuses shadcn/ui)
│       │   └── ContractEditor.tsx            # Inline editable fields; minimal copy
│       ├── hooks/
│       │   └── useContract.ts                # Manages current contract state
│       ├── services/
│       │   └── contractClient.ts             # Client-side API communication
│       └── strings/
│           └── en.ts                         # Centralized UI strings
├── domains/                                  # Framework-agnostic, domain-first
│   └── contracts/
│       ├── model.ts                          # Zod schemas/types
│       ├── renewal.ts                        # daysUntilRenewal(date) helper
│       ├── service.ts                        # Orchestrates: extract → normalize → validate
│       ├── api.ts                            # External extractor/NLP HTTP client
│       └── index.ts                          # Public surface for the domain
├── infra/                                    # Pure infrastructure (no React, no domain knowledge)
│   └── http/
│       └── client.ts                         # Fetch wrapper for external APIs
└── shared/
    └── language/
        └── en.ts                             # Shared UI strings
```

### **Industry Standards Followed**

- **Clean Architecture**: Domain → Features → Infrastructure
- **Separation of Concerns**: Business logic isolated from UI
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Single Responsibility**: Each module has one clear purpose
- **Testability**: Easy to unit test domain logic and components
- **Scalability**: Easy to add new features and domains
- **Maintainability**: Clear structure and naming conventions
