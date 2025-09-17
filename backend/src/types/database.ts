export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          user_id: string | null;
          contract_holder_name: string | null;
          contract_identifier: string | null;
          renewal_date: string | null;
          service_product: string | null;
          contact_email: string | null;
          file_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          contract_holder_name?: string | null;
          contract_identifier?: string | null;
          renewal_date?: string | null;
          service_product?: string | null;
          contact_email?: string | null;
          file_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          contract_holder_name?: string | null;
          contract_identifier?: string | null;
          renewal_date?: string | null;
          service_product?: string | null;
          contact_email?: string | null;
          file_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Contract = Database['public']['Tables']['contracts']['Row'];
export type ContractInsert =
  Database['public']['Tables']['contracts']['Insert'];
export type ContractUpdate =
  Database['public']['Tables']['contracts']['Update'];

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
