import axiosInstance from "./axios";
import type { Building, BuildingStats } from "../types/building";

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

export interface BuildingFilters {
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

const buildingAPI = {
  // Get all buildings with optional filters
  getBuildings: async (filters?: BuildingFilters): Promise<Building[]> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.status && filters.status !== "all")
      params.append("status", filters.status);
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);

    const response = await axiosInstance.get<Building[]>(
      `syndic/buildings/?${params.toString()}`
    );

    // Handle different response formats
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === "object" && "data" in data) {
      const responseData = data as { data: Building[] };
      if (Array.isArray(responseData.data)) {
        return responseData.data;
      }
    } else if (data && typeof data === "object" && "results" in data) {
      const responseData = data as { results: Building[] };
      if (Array.isArray(responseData.results)) {
        return responseData.results;
      }
    }
    // Log the actual response structure for debugging
    console.error("Unexpected API response format:", {
      type: typeof data,
      isArray: Array.isArray(data),
      keys: data && typeof data === "object" ? Object.keys(data) : "N/A",
      data: data,
    });
    return [];
  },

  // Get building by ID
  getBuildingById: async (id: number): Promise<Building> => {
    const response = await axiosInstance.get<Building>(
      `syndic/buildings/${id}/`
    );
    return response.data;
  },

  // Create new building
  createBuilding: async (data: CreateBuildingRequest): Promise<Building> => {
    const response = await axiosInstance.post<Building>(
      "syndic/buildings/",
      data
    );
    return response.data;
  },

  // Update building
  updateBuilding: async (
    id: number,
    data: UpdateBuildingRequest
  ): Promise<Building> => {
    const response = await axiosInstance.put<Building>(
      `syndic/buildings/${id}/`,
      data
    );
    return response.data;
  },

  // Delete building
  deleteBuilding: async (id: number): Promise<void> => {
    await axiosInstance.delete(`syndic/buildings/${id}/`);
  },

  // Get building statistics (calculated from buildings data)
  getBuildingStats: async (buildings?: Building[]): Promise<BuildingStats> => {
    // If buildings are provided, calculate stats locally
    if (buildings) {
      const totalBuildings = buildings.length;
      const activeBuildings = buildings.filter(
        (b) => b.status === "active"
      ).length;
      const inactiveBuildings = buildings.filter(
        (b) => b.status === "inactive"
      ).length;
      const totalApartments = buildings.reduce(
        (sum, b) => sum + b.total_apartments,
        0
      );
      const occupiedApartments = buildings.reduce(
        (sum, b) => sum + b.occupied_apartments,
        0
      );
      const averageOccupancy =
        totalApartments > 0
          ? Math.round((occupiedApartments / totalApartments) * 100)
          : 0;

      return {
        total_buildings: totalBuildings,
        total_apartments: totalApartments,
        occupied_apartments: occupiedApartments,
        average_occupancy: averageOccupancy,
        active_buildings: activeBuildings,
        inactive_buildings: inactiveBuildings,
      };
    }

    // Fallback to empty stats if no data provided
    return {
      total_buildings: 0,
      total_apartments: 0,
      occupied_apartments: 0,
      average_occupancy: 0,
      active_buildings: 0,
      inactive_buildings: 0,
    };
  },

  // Update building status
  updateBuildingStatus: async (
    id: number,
    status: Building["status"]
  ): Promise<Building> => {
    const response = await axiosInstance.patch<Building>(
      `syndic/buildings/${id}/status/`,
      { status }
    );
    return response.data;
  },
};

export default buildingAPI;
