import { useState, useEffect, useCallback } from "react";
import { contractsService, ContractFormData } from "@/services/contracts.service";
import type {
  Contract,
  ExtractionResult,
  ExtractionResponse,
  ExtractionData,
  ReminderStatus,
  UpcomingRenewal,
} from "@/types/contracts";

interface UseContractsReturn {
  contracts: Contract[];
  currentContract: Contract | null;
  loading: boolean;
  error: string | null;
  extractContractData: (file: File) => Promise<ExtractionResponse>;
  saveContract: (extractedData: ExtractionData) => Promise<ExtractionResult>;
  uploadContract: (file: File) => Promise<ExtractionResult>; // Keep for backward compatibility
  updateContract: (
    contractId: string,
    updates: ContractFormData,
  ) => Promise<void>;
  scheduleReminder: (
    contractId: string,
    renewalDate: string,
    daysBeforeRenewal: number,
  ) => Promise<void>;
  getReminderStatus: (contractId: string) => Promise<ReminderStatus>;
  getUpcomingRenewals: (daysAhead?: number) => Promise<UpcomingRenewal[]>;
  refreshContracts: () => Promise<void>;
  setCurrentContract: (contract: Contract | null) => void;
}

export function useContracts(
  userId: string = "550e8400-e29b-41d4-a716-446655440000",
): UseContractsReturn {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userContracts = await contractsService.refreshUserContracts(userId);
      setContracts(userContracts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch contracts",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const extractContractData = useCallback(
    async (file: File): Promise<ExtractionResponse> => {
      try {
        setLoading(true);
        setError(null);
        const result = await contractsService.extractContractData(file, userId);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Extraction failed";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const saveContract = useCallback(
    async (extractedData: ExtractionData): Promise<ExtractionResult> => {
      try {
        setLoading(true);
        setError(null);
        const result = await contractsService.saveContract(extractedData);
        setCurrentContract(result.contract);
        await refreshContracts();
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Save failed";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshContracts],
  );

  // Keep the old method for backward compatibility
  const uploadContract = useCallback(
    async (file: File): Promise<ExtractionResult> => {
      try {
        setLoading(true);
        setError(null);
        const result = await contractsService.uploadAndExtract(file, userId);
        setCurrentContract(result.contract);
        await refreshContracts();
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, refreshContracts],
  );

  const updateContract = useCallback(
    async (contractId: string, updates: ContractFormData): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const updatedContract = await contractsService.updateContract(
          contractId,
          updates,
        );

        // Update local state
        setContracts((prev) =>
          prev.map((c) => (c.id === contractId ? updatedContract : c)),
        );
        if (currentContract?.id === contractId) {
          setCurrentContract(updatedContract);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Update failed";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentContract],
  );

  const scheduleReminder = useCallback(
    async (
      contractId: string,
      renewalDate: string,
      daysBeforeRenewal: number,
    ): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        await contractsService.scheduleReminder(
          contractId,
          renewalDate,
          daysBeforeRenewal,
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Reminder scheduling failed";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getReminderStatus = useCallback(
    async (contractId: string): Promise<ReminderStatus> => {
      try {
        return await contractsService.getReminderStatus(contractId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get reminder status";
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  const getUpcomingRenewals = useCallback(
    async (daysAhead: number = 30): Promise<UpcomingRenewal[]> => {
      try {
        return await contractsService.getUpcomingRenewals(userId, daysAhead);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to get upcoming renewals";
        setError(errorMessage);
        throw err;
      }
    },
    [userId],
  );

  // Load contracts on mount
  useEffect(() => {
    refreshContracts();
  }, [refreshContracts]);

  return {
    contracts,
    currentContract,
    loading,
    error,
    extractContractData,
    saveContract,
    uploadContract,
    updateContract,
    scheduleReminder,
    getReminderStatus,
    getUpcomingRenewals,
    refreshContracts,
    setCurrentContract,
  };
}
