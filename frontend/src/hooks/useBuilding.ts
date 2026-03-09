import { useState, useEffect, useCallback } from "react";
import type { Building, BuildingStats } from "../types/building";
import buildingAPI, {
  type CreateBuildingRequest,
  type CreateBuildingResponse,
  type UpdateBuildingRequest,
  type UpdateBuildingResponse,
  type DeleteBuildingResponse,
} from "../api/buildings";

// Helper function to calculate stats from buildings data
const calculateStats = (buildings: Building[]): BuildingStats => {
  // Ensure buildings is an array
  const buildingsArray = Array.isArray(buildings) ? buildings : [];

  const totalBuildings = buildingsArray.length;
  const activeBuildings = buildingsArray.filter(
    (b) => b.status === "active",
  ).length;
  const inactiveBuildings = buildingsArray.filter(
    (b) => b.status === "inactive",
  ).length;
  const totalApartments = buildingsArray.reduce(
    (sum, b) => sum + b.total_apartments,
    0,
  );
  const occupiedApartments = buildingsArray.reduce(
    (sum, b) => sum + b.occupied_apartments,
    0,
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
};

export const useBuilding = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<
    { from?: Date; to?: Date } | undefined
  >();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<BuildingStats>({
    total_buildings: 0,
    total_apartments: 0,
    occupied_apartments: 0,
    average_occupancy: 0,
    active_buildings: 0,
    inactive_buildings: 0,
  });

  // Fetch buildings and calculate stats
  const fetchBuildings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build filters for API
      const filters = {
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        date_from: dateRange?.from
          ? dateRange.from.toISOString().split("T")[0]
          : undefined,
        date_to: dateRange?.to
          ? dateRange.to.toISOString().split("T")[0]
          : undefined,
      };

      const buildingsData = await buildingAPI.getBuildings(filters);
      setBuildings(buildingsData);

      // Calculate stats from the fetched buildings data
      const statsData = calculateStats(buildingsData);
      setStats(statsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch buildings";
      setError(errorMessage);
      console.error("Error fetching buildings:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, dateRange]);

  const createBuilding = useCallback(
    async (data: CreateBuildingRequest): Promise<Building | null> => {
      try {
        const response: CreateBuildingResponse =
          await buildingAPI.createBuilding(data);

        // Extract building data and message from backend response
        const newBuilding = response.data;
        const successMessage = response.message;

        setBuildings((prev) => [...prev, newBuilding]);
        await fetchBuildings(); // Refresh stats

        setSuccessMessage(successMessage);
        return newBuilding;
      } catch (err) {
        let errorMessage = "Failed to create building";

        // Extract error message from API response
        if (err && typeof err === "object" && "response" in err) {
          const errorObj = err as any;
          if (errorObj.response?.data?.message) {
            errorMessage = errorObj.response.data.message;
          } else if (errorObj.response?.data?.error) {
            errorMessage = errorObj.response.data.error;
          } else if (errorObj.message) {
            errorMessage = errorObj.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error("Error creating building:", err);
        return null;
      }
    },
    [fetchBuildings],
  );

  const updateBuilding = useCallback(
    async (
      id: number,
      data: UpdateBuildingRequest,
    ): Promise<Building | null> => {
      try {
        const response: UpdateBuildingResponse =
          await buildingAPI.updateBuilding(id, data);

        // Extract building data and message from backend response
        const updatedBuilding = response.data;
        const successMessage = response.message;

        setBuildings((prev) =>
          prev.map((b) => (b.id === id ? updatedBuilding : b)),
        );
        await fetchBuildings(); // Refresh stats

        setSuccessMessage(successMessage);
        return updatedBuilding;
      } catch (err) {
        let errorMessage = "Failed to update building";

        // Extract error message from API response
        if (err && typeof err === "object" && "response" in err) {
          const errorObj = err as any;
          if (errorObj.response?.data?.message) {
            errorMessage = errorObj.response.data.message;
          } else if (errorObj.response?.data?.error) {
            errorMessage = errorObj.response.data.error;
          } else if (errorObj.message) {
            errorMessage = errorObj.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error("Error updating building:", err);
        return null;
      }
    },
    [fetchBuildings],
  );

  const deleteBuilding = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const response: DeleteBuildingResponse =
          await buildingAPI.deleteBuilding(id);

        // Extract success message from backend response
        const successMessage = response.message;

        setBuildings((prev) => prev.filter((b) => b.id !== id));
        await fetchBuildings(); // Refresh stats

        setSuccessMessage(successMessage);
        return true;
      } catch (err) {
        let errorMessage = "Failed to delete building";

        // Extract error message from API response
        if (err && typeof err === "object" && "response" in err) {
          const errorObj = err as any;
          if (errorObj.response?.data?.message) {
            errorMessage = errorObj.response.data.message;
          } else if (errorObj.response?.data?.error) {
            errorMessage = errorObj.response.data.error;
          } else if (errorObj.message) {
            errorMessage = errorObj.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error("Error deleting building:", err);
        return false;
      }
    },
    [fetchBuildings],
  );

  const updateBuildingStatus = useCallback(
    async (
      id: number,
      status: Building["status"],
    ): Promise<Building | null> => {
      try {
        const updatedBuilding = await buildingAPI.updateBuildingStatus(
          id,
          status,
        );
        setBuildings((prev) =>
          prev.map((b) => (b.id === id ? updatedBuilding : b)),
        );
        await fetchBuildings(); // Refresh stats
        return updatedBuilding;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to update building status";
        setError(errorMessage);
        console.error("Error updating building status:", err);
        return null;
      }
    },
    [fetchBuildings],
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  // Initialize data and refetch when filters change
  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  return {
    // Data
    buildings,
    stats,
    loading,
    error,

    // Filter state
    searchTerm,
    statusFilter,
    dateRange,

    // Filter setters
    setSearchTerm,
    setStatusFilter,
    setDateRange,

    // API actions
    createBuilding,
    updateBuilding,
    deleteBuilding,
    updateBuildingStatus,

    // Messages
    successMessage,

    // Utility
    refetch: fetchBuildings,
    clearError,
  };
};
