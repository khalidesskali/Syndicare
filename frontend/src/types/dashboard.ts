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
  user: any;
}

export interface ResidentDashboardStats {
  total_unpaid: number;
  overdue_charges: number;
  last_payment: {
    amount: number;
    date: string;
    reference: string;
    charge_description: string;
  } | null;
  recent_charges: any[];
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
