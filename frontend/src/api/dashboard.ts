import axiosInstance from "./axios";
import type { DashboardResponse } from "../types/dashboard";

export const dashboardAPI = {
  /**
   * Fetch syndic dashboard statistics
   */
  getDashboardStats: async (): Promise<DashboardResponse> => {
    const response = await axiosInstance.get("/syndic/dashboard/");
    return response.data;
  },
};

export default dashboardAPI;
