export interface CompletionRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ImageCompletionRequest extends CompletionRequest {
  imageBuffer: Buffer;
}

export interface CompletionResult {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

export interface AIProvider {
  complete(request: CompletionRequest): Promise<CompletionResult>;
  completeWithImage?(
    request: ImageCompletionRequest,
  ): Promise<CompletionResult>;
  isHealthy(): Promise<boolean>;
}

export interface ExtractionResult {
  contractHolderName: string | null;
  contractId: string | null;
  renewalDate: string | null;
  serviceProduct: string | null;
  contactEmail: string | null;
}

export interface ExtractionRequest {
  pdfText: string;
  fileName: string;
}

export interface ExtractionService {
  extractContractData(request: ExtractionRequest): Promise<ExtractionResult>;
}
