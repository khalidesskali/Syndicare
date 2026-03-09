import type { Apartment } from "./apartment";
import type { Charge } from "./charge";
import type { Complaint } from "./complaint";
import type { Reunion } from "./reunion";

export interface DashboardStats {
  overview: {
    total_buildings: number;
    buildings_this_month: number;
    total_residents: number;
    residents_this_month: number;
    pending_charges: number;
    upcoming_reunions: number;
    open_complaints: number;
    urgent_complaints: number;
  };
  financial: {
    monthly_revenue: number;
    revenue_change: number;
    total_monthly_charges: number;
    last_month_revenue: number;
  };
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

export interface ResidentDashboardStats {
  user: {
    id: number;
    name: string;
    email: string;
  };
  apartments: Apartment[];
  stats: {
    total_unpaid: number;
    overdue_count: number;
    total_paid_all_time: number;
    total_paid_this_year: number;
    charge_breakdown: {
      total: number;
      paid: number;
      unpaid: number;
      overdue: number;
      partially_paid: number;
    };
  };
  last_payment: {
    id: number;
    amount: number;
    date: string;
    reference: string;
    charge_description: string;
    apartment_number: string;
    status: string;
  } | null;
  upcoming_meetings: Reunion[];
  recent_reclamations: Complaint[];
  recent_charges: Charge[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
  message?: string;
}

export interface ResidentDashboardResponse {
  success: boolean;
  data: ResidentDashboardStats;
  message?: string;
}
