export interface Reunion {
  max_participants: number;
  participants_count: number;
  id: number;
  title: string;
  topic: string;
  date_time: string;
  location: string;
  immeuble: number;
  building_name: string;
  building_address: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  created_at: string;
  syndic: number;
}

export interface ReunionStats {
  total_reunions: number;
  upcoming_reunions: number;
  completed_reunions: number;
  total_participants: number;
  average_attendance: number;
}

export interface ReunionFilters {
  searchTerm: string;
  statusFilter: string;
  buildingFilter: string;
  dateRange: { from?: Date; to?: Date } | undefined;
}

export interface UpdateReunionRequest {
  immeuble: number;
  title: string;
  topic: string;
  date_time: string;
  location: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}
