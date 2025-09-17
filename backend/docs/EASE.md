## Diagrams (ASCII)

### 1) High-level Architecture
```
+------------------+           +---------------------+           +----------------+
|     Frontend     |  HTTPS    |      Backend        |  SDK/API  |    Supabase    |
|  (Next.js)       +---------->+  (NestJS REST API)  +---------->+  (Postgres &   |
|                  |           |                     |           |   Storage)     |
+------------------+           +---------------------+           +----------------+
                                         |                                 
                                         | AI Provider SDK                  
                                         v                                 
                                   +--------------+                         
                                   |   OpenAI     |                         
                                   |   (Models)   |                         
                                   +--------------+                         
```

### 2) Module & Layering
```
src/
├─ common/                (cross-cutting)
│  ├─ env.ts              -> env validation & typed config
│  ├─ error-handling.ts   -> global exception filter
│  └─ rate-limiting.ts    -> in-memory rate limiter
│
├─ core/                  (reusable building blocks)
│  ├─ util/
│  │  ├─ file-uploader.ts -> Supabase Storage wrapper (public URL)
│  │  └─ reminder-scheduler.ts -> in-memory scheduler (interface-based)
│  │
│  └─ ai/
│     ├─ providers/openai.provider.ts   -> AI_PROVIDER impl
│     ├─ services/prompt.service.ts     -> PROMPT_SERVICE strategy
│     └─ services/extraction.service.ts -> orchestrates AI extraction
│
├─ modules/
│  └─ contracts/
│     ├─ controllers/contracts.controller.ts  -> HTTP endpoints
│     ├─ services/upload.service.ts           -> upload + pdf-parse
│     ├─ services/extract.service.ts          -> business logic + DB
│     └─ services/reminder.service.ts         -> reminder orchestration
│
└─ types/database.ts   -> typed Supabase tables (Contract, User)
```

### 3) Dependency Wiring (contracts module)
```
ContractsController
   | uses
   v
+----------------------+         +-----------------------------+
| ContractUploadService|         | ContractExtractService      |
+----------+-----------+         +---------------+-------------+
           |                                     |
           | uses                                 | uses
           v                                     v
+----------------------+         +-----------------------------+
| FileUploadService    |         | ContractExtractionService   |
| (core/util)          |         | (core/ai/services)          |
+----------+-----------+         +---------------+-------------+
           |                                     |
           | Supabase Storage                    | AI_PROVIDER + PROMPT_SERVICE
           v                                     v
     Supabase (Storage)                     OpenAIProvider + ContractPromptService
                                                |
                                                v
                                           OpenAI API

ContractExtractService -> SupabaseService -> Supabase (Postgres)
ContractReminderBusinessService -> ContractReminderService (in-memory)
```

### 4) Request Flow: Upload -> Extract (no DB save)
```
Client                        Backend                            Supabase/AI
  |   POST /contracts/upload     |                                       |
  |----------------------------->|                                       |
  | file (multipart)             |                                       |
  |                              |-- uploadService.uploadAndParsePdf --->| (Storage: upload)
  |                              |<--------------------------- public URL|
  |                              |-- pdf-parse (buffer) ---------------->|
  |                              |<------------------------------ text ---|
  |                              |-- extractService.extractContractData ->| (AI: prompt+complete)
  |                              |<------------------------- extracted ---|
  |<-----------------------------|                                       |
  |  {extractedData, filePath, publicUrl}                                |
```

### 5) Request Flow: Save Extracted Data
```
Client                        Backend                          Supabase (Postgres)
  |   POST /contracts/save        |                                       |
  |------------------------------>|                                       |
  |  extractedData, userId, path  |-- extractService.saveContract ------->|
  |                               |   (insert contracts)                  |
  |                               |<-------------------------- row -------|
  |<------------------------------|                                       |
  |  { contract }                 |                                       |
```

### 6) Reminders Flow (In-memory Scheduler)
```
Client                         Backend
  |  POST /contracts/:id/reminder   |
  |-------------------------------->|
  |  { renewalDate, daysBefore }    |
  |                                 |-- reminderService.scheduleReminder
  |                                 |     (setTimeout for reminderDate)
  |<--------------------------------|
  |  { success: true }              |

Note: Current scheduler is process-local. Replaceable with BullMQ/Redis for durability.
```

### 7) Error Handling & Validation (Cross-cutting)
```
HTTP Request -> ValidationPipe (DTOs) -> Controller -> Services
                                       -> throws Error/HttpException
                                  GlobalExceptionFilter -> JSON error response
```

### 8) Database & Storage (Conceptual)
```
Postgres (public schema)
  users(id uuid PK, email text, created_at timestamptz)
  contracts(id uuid PK, user_id uuid FK, contract fields..., file_path text,
            created_at timestamptz, updated_at timestamptz, trigger set_updated_at)

Storage (bucket: contracts)
  uploads/<uuid>.pdf  --> public URL
  Policies: Prefer authenticated write, public read (configurable)
```

### 9) Provider Abstraction (AI)
```
ContractExtractionService
   | uses AI_PROVIDER + PROMPT_SERVICE
   v
+--------------------+     +---------------------+
| OpenAIProvider     |     | ContractPromptService|
+--------------------+     +---------------------+

Swap providers by DI token without changing business logic.
```

### 10) Future Extension Notes
```
- Upload validation pipeline: validate locally, only upload if data is valid.
- Durable reminders via BullMQ/Redis and real notification channels (email/SMS).
- Add OCR/image extraction path using vision models where needed.
- Introduce auth and RLS for per-user data access controls.
```
