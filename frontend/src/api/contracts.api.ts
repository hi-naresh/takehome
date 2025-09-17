import type { ExtractionResponse, ExtractionData, ExtractionResult, Contract } from '../types/contracts';
import type { HttpClient, ContractsApi } from './index';

export class ContractsApiImpl implements ContractsApi {
  constructor(private readonly http: HttpClient) {}

  async extractContractData(file: File, userId: string): Promise<ExtractionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await this.http.upload(`/contracts/upload?userId=${userId}`, formData);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Extraction failed: ${res.statusText}`);
    }
    const result = await res.json();
    return {
      extractedData: { ...result.data.extractedData, userId, filePath: result.data.filePath },
      filePath: result.data.filePath,
      publicUrl: result.data.publicUrl,
    };
  }

  async saveContract(extractedData: ExtractionData): Promise<ExtractionResult> {
    const response = await this.http.request<{ success: boolean; data: { contract: Contract } }>(
      '/contracts/save',
      { method: 'POST', body: JSON.stringify({ extractedData, userId: extractedData.userId, filePath: extractedData.filePath }) },
    );
    const contract: Contract | undefined = response.data.contract;
    if (!contract) throw new Error('Contract data not found in response');
    return { contract, filePath: extractedData.filePath, publicUrl: '' };
  }

  async getContract(contractId: string): Promise<Contract> {
    return this.http.request(`/contracts/${contractId}`);
  }

  async getUserContracts(userId: string): Promise<Contract[]> {
    const response: Contract[] | { data: Contract[] } = await this.http.request(
      `/contracts/user/${userId}`,
    );
    const list = Array.isArray(response)
      ? response
      : (response as { data: Contract[] }).data;
    return list;
  }

  async updateContract(contractId: string, updates: Partial<Contract>): Promise<Contract> {
    return this.http.request(`/contracts/${contractId}`, { method: 'PUT', body: JSON.stringify(updates) });
  }
}


