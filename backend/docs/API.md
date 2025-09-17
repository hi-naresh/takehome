# API Reference

## 📊 API Endpoints

### Contracts API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/contracts/upload` | Upload and extract contract data | `multipart/form-data` | `ContractExtractionResult` |
| GET | `/contracts/user/:userId` | Get all contracts for a user | - | `ContractResponseDto[]` |
| GET | `/contracts/:id` | Get specific contract | - | `ContractResponseDto` |
| PUT | `/contracts/:id` | Update contract | `UpdateContractDto` | `ContractResponseDto` |
| POST | `/contracts/:id/reminder` | Schedule reminder | `ScheduleReminderDto` | `{ success: boolean }` |
| GET | `/contracts/:id/reminder/status` | Get reminder status | - | `ReminderStatusDto` |
| GET | `/contracts/user/:userId/upcoming-renewals` | Get upcoming renewals | - | `UpcomingRenewalsResponse` |

### Health Check

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/health` | Application health check | `{ status: string, timestamp: string }` |

## 📝 Data Transfer Objects (DTOs)

### UploadDto
```typescript
{
  fileName: string;
  contentType: string;
  userId?: string;
}
```

### UpdateContractDto
```typescript
{
  contractHolderName?: string;
  contractIdentifier?: string;
  renewalDate?: string;
  serviceProduct?: string;
  contactEmail?: string;
  filePath?: string;
}
```

### ScheduleReminderDto
```typescript
{
  contractId: string;
  renewalDate: string;
  daysBeforeRenewal: number;
  enabled: boolean;
}
```

### ContractResponseDto
```typescript
{
  id: string;
  userId?: string;
  contractHolderName?: string;
  contractIdentifier?: string;
  renewalDate?: string;
  serviceProduct?: string;
  contactEmail?: string;
  filePath?: string;
  createdAt: string;
  updatedAt: string;
}
```

### ReminderStatusDto
```typescript
{
  contractId: string;
  daysUntilRenewal: number;
  reminderScheduled: boolean;
}
```

## 🔄 Request/Response Examples

### Upload Contract

**Request:**
```bash
POST /contracts/upload?userId=user-123
Content-Type: multipart/form-data

file: [PDF file]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "extractedData": {
      "contractHolderName": "Acme Corp",
      "contractIdentifier": "ACME-2023-001",
      "renewalDate": "2024-12-31",
      "serviceProduct": "Cloud Services",
      "contactEmail": "contracts@acme.com",
      "userId": "user-123",
      "filePath": "/uploads/contract.pdf"
    },
    "filePath": "/uploads/contract.pdf",
    "publicUrl": "https://supabase.co/storage/v1/object/public/contracts/contract.pdf"
  }
}
```

### Get User Contracts

**Request:**
```bash
GET /contracts/user/user-123
```

**Response:**
```json
[
  {
    "id": "contract-123",
    "userId": "user-123",
    "contractHolderName": "Acme Corp",
    "contractIdentifier": "ACME-2023-001",
    "renewalDate": "2024-12-31",
    "serviceProduct": "Cloud Services",
    "contactEmail": "contracts@acme.com",
    "filePath": "/uploads/contract.pdf",
    "createdAt": "2023-01-01T10:00:00Z",
    "updatedAt": "2023-01-01T10:00:00Z"
  }
]
```

### Schedule Reminder

**Request:**
```bash
POST /contracts/contract-123/reminder
Content-Type: application/json

{
  "renewalDate": "2024-12-31",
  "daysBeforeRenewal": 30,
  "enabled": true
}
```

**Response:**
```json
{
  "success": true
}
```

## 🚨 Error Responses

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Contract not found",
  "error": "Not Found"
}
```

### Internal Server Error (500)
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## 🔐 Authentication

Currently, the API uses a simple user ID parameter for demonstration purposes. In production, this would be replaced with proper authentication:

- JWT tokens
- OAuth 2.0
- API keys
- Session-based authentication

## 📊 Rate Limiting

The API implements rate limiting to prevent abuse:

- **Upload Endpoint**: 10 requests per minute per IP
- **Extraction Endpoint**: 5 requests per minute per IP
- **General API**: 100 requests per minute per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📝 File Upload

### Supported Formats
- **PDF**: Primary format for contract extraction
- **Size Limit**: 10MB maximum file size
- **Validation**: MIME type and file extension validation

### Upload Process
1. File validation (type, size)
2. Upload to Supabase Storage
3. PDF text extraction
4. AI-powered data extraction
5. Return structured data

## 🔄 Webhooks (Future)

Planned webhook support for:
- Contract extraction completion
- Reminder notifications
- Error notifications
- Status updates

## 📚 OpenAPI Documentation

Interactive API documentation is available at:
- **Development**: `http://localhost:3001/api/docs`
- **Production**: `https://your-domain.com/api/docs`

The OpenAPI specification is automatically generated from the NestJS decorators and can be exported as JSON or YAML.
