export interface Syndic {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  has_valid_subscription: boolean;
  company_name?: string;
  license_number?: string;
  address?: string;
}

export interface SyndicFormData {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  is_active?: boolean;
}

export interface SyndicFilters {
  search?: string;
  status?: "active" | "inactive" | "all";
  page?: number;
  page_size?: number;
}

export interface SyndicStats {
  total_syndics: number;
  active_syndics: number;
  inactive_syndics: number;
  active_subscriptions: number;
}
