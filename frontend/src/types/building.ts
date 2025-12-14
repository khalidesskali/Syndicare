export interface Building {
  id: number;
  name: string;
  address: string;
  total_apartments: number;
  occupied_apartments: number;
  year_built: number;
  floors: number;
  status: "active" | "inactive" | "maintenance";
  created_at: string;
  updated_at: string;
}

export interface BuildingStats {
  total_buildings: number;
  total_apartments: number;
  occupied_apartments: number;
  average_occupancy: number;
  active_buildings: number;
  inactive_buildings: number;
}

export interface BuildingFilters {
  searchTerm: string;
  statusFilter: string;
  dateRange: { from?: Date; to?: Date } | undefined;
}

export interface CreateBuildingRequest {
  name: string;
  address: string;
  total_apartments: number;
  year_built: number;
  floors: number;
  status: "active" | "inactive" | "maintenance";
}

export interface UpdateBuildingRequest extends Partial<CreateBuildingRequest> {
  occupied_apartments?: number;
}
