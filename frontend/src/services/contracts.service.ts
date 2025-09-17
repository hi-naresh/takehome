import type {
  Contract,
  ExtractionResponse,
  ExtractionData,
  ExtractionResult,
  ReminderStatus,
  UpcomingRenewal,
} from "../types/contracts";
import defaultApiClient from "../api";
import type { ApiClient } from "../api";

export interface ContractFormData {
  contractHolderName?: string;
  contractIdentifier?: string;
  renewalDate?: string;
  serviceProduct?: string;
  contactEmail?: string;
}

export class ContractsService {
  private static instance?: ContractsService;
  private readonly api: ApiClient;
  private contracts: Contract[] = [];
  private currentContract: Contract | null = null;

  private constructor(api?: ApiClient) {
    this.api = api ?? defaultApiClient;
  }

  static getInstance(api?: ApiClient): ContractsService {
    if (!ContractsService.instance) {
      ContractsService.instance = new ContractsService(api);
    } else if (api) {
      // Optional: allow swapping api for tests within same process
      ContractsService.instance = new ContractsService(api);
    }
    return ContractsService.instance;
  }

  async extractContractData(
    file: File,
    userId: string = "550e8400-e29b-41d4-a716-446655440000",
  ): Promise<ExtractionResponse> {
    try {
      const result = await this.api.extractContractData(file, userId);
      return result;
    } catch (error) {
      console.error("Extraction failed:", error);
      throw error;
    }
  }

  async saveContract(extractedData: ExtractionData): Promise<ExtractionResult> {
    try {
      const result = await this.api.saveContract(extractedData);
      this.currentContract = result.contract;
      await this.refreshUserContracts(extractedData.userId);
      return result;
    } catch (error) {
      console.error("Save failed:", error);
      throw error;
    }
  }

  // Keep the old method for backward compatibility
  async uploadAndExtract(
    file: File,
    userId: string = "550e8400-e29b-41d4-a716-446655440000",
  ): Promise<ExtractionResult> {
    try {
      const extractionResponse = await this.extractContractData(file, userId);
      return await this.saveContract(extractionResponse.extractedData);
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  }

  async refreshUserContracts(
    userId: string = "550e8400-e29b-41d4-a716-446655440000",
  ): Promise<Contract[]> {
    try {
      this.contracts = await this.api.getUserContracts(userId);
      return this.contracts;
    } catch (error) {
      console.error("Failed to fetch contracts:", error);
      throw error;
    }
  }

  async updateContract(
    contractId: string,
    updates: ContractFormData,
  ): Promise<Contract> {
    try {
      const updatedContract = await this.api.updateContract(contractId, updates);

      // Update local state
      const index = this.contracts.findIndex((c) => c.id === contractId);
      if (index !== -1) {
        this.contracts[index] = updatedContract;
      }

      if (this.currentContract?.id === contractId) {
        this.currentContract = updatedContract;
      }

      return updatedContract;
    } catch (error) {
      console.error("Update failed:", error);
      throw error;
    }
  }

  async scheduleReminder(
    contractId: string,
    renewalDate: string,
    daysBeforeRenewal: number,
    enabled: boolean = true,
  ): Promise<void> {
    try {
      await this.api.scheduleReminder(
        contractId,
        renewalDate,
        daysBeforeRenewal,
        enabled,
      );
    } catch (error) {
      console.error("Reminder scheduling failed:", error);
      throw error;
    }
  }

  async getReminderStatus(contractId: string): Promise<ReminderStatus> {
    try {
      return await this.api.getReminderStatus(contractId);
    } catch (error) {
      console.error("Failed to get reminder status:", error);
      throw error;
    }
  }

  async getUpcomingRenewals(
    userId: string = "550e8400-e29b-41d4-a716-446655440000",
    daysAhead: number = 30,
  ): Promise<UpcomingRenewal[]> {
    try {
      return await this.api.getUpcomingRenewals(userId, daysAhead);
    } catch (error) {
      console.error("Failed to get upcoming renewals:", error);
      throw error;
    }
  }

  getContracts(): Contract[] {
    return [...this.contracts];
  }

  getCurrentContract(): Contract | null {
    return this.currentContract;
  }

  setCurrentContract(contract: Contract | null): void {
    this.currentContract = contract;
  }

  calculateDaysUntilRenewal(renewalDate: string): number {
    const now = new Date();
    const renewal = new Date(renewalDate);
    const timeDiff = renewal.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  isRenewalDue(renewalDate: string, daysThreshold: number = 30): boolean {
    const daysUntil = this.calculateDaysUntilRenewal(renewalDate);
    return daysUntil <= daysThreshold && daysUntil >= 0;
  }
}

export const contractsService = ContractsService.getInstance();


