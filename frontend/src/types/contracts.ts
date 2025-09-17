export interface Contract {
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

export interface ExtractionResult {
  contract: Contract;
  filePath: string;
  publicUrl: string;
}

export interface ExtractionData {
  contractHolderName?: string;
  contractId?: string;
  renewalDate?: string;
  serviceProduct?: string;
  contactEmail?: string;
  userId: string;
  filePath: string;
  wordCount?: number;
  isImageBasedPdf?: boolean;
}

export interface ExtractionResponse {
  extractedData: ExtractionData;
  filePath: string;
  publicUrl: string;
}

export interface ReminderStatus {
  contractId: string;
  daysUntilRenewal: number;
  reminderScheduled: boolean;
  reminderDate?: string;
}

export interface UpcomingRenewal extends Contract {
  daysUntilRenewal: number;
}


