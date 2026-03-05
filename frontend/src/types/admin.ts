export interface AdminDashboardResponse {
  success: boolean;
  data: {
    overview: StatsOverview;
    recent_syndics: RecentSyndic[];
  };
}

interface StatsOverview {
  total_syndics: number;
  syndics_this_month: number;
}

interface RecentSyndic {
  id: number;
  name: string;
  time_ago: string;
}
