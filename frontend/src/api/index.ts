export interface HttpClient {
  request<T>(endpoint: string, options?: RequestInit): Promise<T>;
  upload(endpoint: string, formData: FormData): Promise<Response>;
}

export class FetchHttpClient implements HttpClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
      });
    } catch {
      throw new Error(`Server offline. Could not reach API at ${this.baseUrl}`);
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async upload(endpoint: string, formData: FormData): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      return await fetch(url, { method: 'POST', body: formData });
    } catch {
      throw new Error(`Server offline. Could not reach API at ${this.baseUrl}`);
    }
  }
}

export interface ContractsApi {
  extractContractData(file: File, userId: string): Promise<import('../types/contracts').ExtractionResponse>;
  saveContract(extractedData: import('../types/contracts').ExtractionData): Promise<import('../types/contracts').ExtractionResult>;
  getContract(contractId: string): Promise<import('../types/contracts').Contract>;
  getUserContracts(userId: string): Promise<import('../types/contracts').Contract[]>;
  updateContract(contractId: string, updates: Partial<import('../types/contracts').Contract>): Promise<import('../types/contracts').Contract>;
}

export interface RemindersApi {
  scheduleReminder(contractId: string, renewalDate: string, daysBeforeRenewal: number, enabled: boolean): Promise<{ success: boolean }>;
  getReminderStatus(contractId: string): Promise<import('../types/contracts').ReminderStatus>;
  getUpcomingRenewals(userId: string, daysAhead: number): Promise<import('../types/contracts').UpcomingRenewal[]>;
}

export interface ApiClient extends ContractsApi, RemindersApi {}

export function createApiClient(baseUrl: string): ApiClient {
  const http = new FetchHttpClient(baseUrl);
  return {
    // ContractsApi
    async extractContractData(file, userId) {
      const formData = new FormData();
      formData.append('file', file);
      const res: Response = await http.upload(`/contracts/upload?userId=${userId}`, formData);
      if (!res.ok) {
        const errorData: { message?: string } | object = await res
          .json()
          .catch(() => ({} as object));
        const message = (errorData as { message?: string }).message;
        throw new Error(message || `Extraction failed: ${res.statusText}`);
      }
      const result: { data: { extractedData: import('../types/contracts').ExtractionData; filePath: string; publicUrl: string } } = await res.json();
      const data = result.data;
      return {
        extractedData: { ...data.extractedData, userId, filePath: data.filePath },
        filePath: data.filePath,
        publicUrl: data.publicUrl,
      } as import('../types/contracts').ExtractionResponse;
    },
    async saveContract(extractedData) {
      const response = await http.request<{ success: boolean; data: { contract: import('../types/contracts').Contract } }>(
        '/contracts/save',
        { method: 'POST', body: JSON.stringify({ extractedData, userId: extractedData.userId, filePath: extractedData.filePath }) },
      );
      const contract: import('../types/contracts').Contract | undefined = response.data.contract;
      if (!contract) throw new Error('Contract data not found in response');
      return { contract, filePath: extractedData.filePath, publicUrl: '' } as import('../types/contracts').ExtractionResult;
    },
    async getContract(contractId) {
      return http.request(`/contracts/${contractId}`);
    },
    async getUserContracts(userId) {
      const response: import('../types/contracts').Contract[] | { data: import('../types/contracts').Contract[] } = await http.request(
        `/contracts/user/${userId}`,
      );
      const list = Array.isArray(response)
        ? response
        : (response as { data: import('../types/contracts').Contract[] }).data;
      return list as import('../types/contracts').Contract[];
    },
    async updateContract(contractId, updates) {
      return http.request(`/contracts/${contractId}`, { method: 'PUT', body: JSON.stringify(updates) });
    },

    // RemindersApi
    async scheduleReminder(contractId, renewalDate, daysBeforeRenewal, enabled) {
      return http.request(`/contracts/${contractId}/reminder`, {
        method: 'POST',
        body: JSON.stringify({ renewalDate, daysBeforeRenewal, enabled }),
      });
    },
    async getReminderStatus(contractId) {
      return http.request(`/contracts/${contractId}/reminder/status`);
    },
    async getUpcomingRenewals(userId, daysAhead) {
      const result = await http.request<{ success: boolean; data: import('../types/contracts').UpcomingRenewal[] }>(
        `/contracts/user/${userId}/upcoming-renewals?daysAhead=${daysAhead}`,
      );
      return result.data;
    },
  };
}

export function getDefaultApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

// Default client instance for app usage
export const apiClient = createApiClient(getDefaultApiBaseUrl());
export default apiClient;


