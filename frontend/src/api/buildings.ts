import axiosInstance from "./axios";
import type { Building, BuildingStats } from "../types/building";

export interface CreateBuildingRequest {
  name: string;
  address: string;
  floors: number;
}

export interface CreateBuildingResponse {
  success: boolean;
  message: string;
  data: Building;
}

export interface UpdateBuildingResponse {
  success: boolean;
  message: string;
  data: Building;
}

export interface DeleteBuildingResponse {
  success: boolean;
  message: string;
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

    const response = await axiosInstance.get<{
      success: boolean;
      data: Building[];
      count: number;
    }>(`syndic/buildings/?${params.toString()}`);

    // Handle the known response format
    const data = response.data;
    if (data && data.success && Array.isArray(data.data)) {
      return data.data;
    }

    // Fallback for unexpected formats
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
  createBuilding: async (
    data: CreateBuildingRequest
  ): Promise<CreateBuildingResponse> => {
    const response = await axiosInstance.post("syndic/buildings/", data);
    return response.data;
  },

  // Update building
  updateBuilding: async (
    id: number,
    data: UpdateBuildingRequest
  ): Promise<UpdateBuildingResponse> => {
    const response = await axiosInstance.put(`syndic/buildings/${id}/`, data);
    return response.data;
  },

  // Delete building
  deleteBuilding: async (id: number): Promise<DeleteBuildingResponse> => {
    const response = await axiosInstance.delete(`syndic/buildings/${id}/`);
    return response.data;
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
