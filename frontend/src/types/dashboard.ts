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
  has_valid_subscription: boolean;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
  message?: string;
}
