export type ChargeStatus = "UNPAID" | "PAID" | "OVERDUE" | "PARTIALLY_PAID";

export interface Charge {
  id: number;
  appartement: number;
  apartment_number: string;
  building_name: string;
  resident_email: string | null;
  resident_name: string | null;
  description: string;
  amount: number;
  due_date: string;
  status: ChargeStatus;
  paid_amount: number;
  paid_date: string | null;
  is_overdue: boolean;
  created_at: string;
}

export interface ChargeStats {
  total_charges: number;
  paid: number;
  unpaid: number;
  overdue: number;
  partially_paid: number;
  total_amount: number;
  paid_amount: number;
  unpaid_amount: number;
  overdue_amount: number;
  collection_rate: number;
}

export interface CreateChargeRequest {
  appartement: number;
  description: string;
  amount: number;
  due_date: string;
}

export interface UpdateChargeRequest extends Partial<CreateChargeRequest> {
  paid_amount?: number;
  paid_date?: string;
  status?: "UNPAID" | "PAID" | "PARTIALLY_PAID";
}

export interface MarkPaidRequest {
  paid_amount: number;
  paid_date?: string;
}

export interface BulkCreateRequest {
  building_id: number;
  description: string;
  due_date: string;
}

// Response types
export interface ChargeResponse {
  success: boolean;
  data: Charge;
  message: string;
}

export interface ChargesListResponse {
  success: boolean;
  data: Charge[];
  count: number;
}

export interface ChargeStatsResponse {
  success: boolean;
  data: ChargeStats;
}

export interface BulkCreateResponse {
  success: boolean;
  message: string;
  data: Charge[];
}

export interface MarkPaidResponse {
  success: boolean;
  message: string;
  data: Charge;
}

export interface DeleteChargeResponse {
  success: boolean;
  message: string;
}

export interface ChargeFilters {
  status?: string;
  building_id?: number;
  apartment_id?: number;
  overdue?: boolean;
}
