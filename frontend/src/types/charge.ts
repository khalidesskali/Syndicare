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
