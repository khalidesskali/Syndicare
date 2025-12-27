import axiosInstance from "./axios";
import type {
  Reunion,
  ReunionStats,
  UpdateReunionRequest,
} from "../types/reunion";

export interface CreateReunionRequest {
  title: string;
  topic: string;
  date_time: string;
  location: string;
  immeuble: number; // building ID
}

export interface ReunionFilters {
  search?: string;
  status?: string;
  building?: string;
  date_from?: string;
  date_to?: string;
}

const reunionAPI = {
  // Get all reunions with optional filters
  getReunions: async (filters?: ReunionFilters): Promise<Reunion[]> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.status && filters.status !== "all")
      params.append("status", filters.status);
    if (filters?.building && filters.building !== "all")
      params.append("building", filters.building);
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);

    const response = await axiosInstance.get<{
      success: boolean;
      data: Reunion[];
      count: number;
    }>(`syndic/reunions/?${params.toString()}`);

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

  getReunionById: async (id: number): Promise<Reunion> => {
    const response = await axiosInstance.get<Reunion>(`syndic/reunions/${id}/`);
    return response.data;
  },

  createReunion: async (data: CreateReunionRequest): Promise<Reunion> => {
    const response = await axiosInstance.post<Reunion>(
      "syndic/reunions/",
      data
    );
    return response.data;
  },

  updateReunion: async (
    id: number,
    data: UpdateReunionRequest
  ): Promise<Reunion> => {
    const response = await axiosInstance.put<Reunion>(
      `syndic/reunions/${id}/`,
      data
    );
    return response.data;
  },

  // Delete reunion
  deleteReunion: async (id: number): Promise<void> => {
    await axiosInstance.delete(`syndic/reunions/${id}/`);
  },

  // Get reunion statistics (calculated from reunions data)
  getReunionStats: async (reunions?: Reunion[]): Promise<ReunionStats> => {
    // If reunions are provided, calculate stats locally
    if (reunions) {
      const totalReunions = reunions.length;
      const scheduledReunions = reunions.filter(
        (r) => r.status === "SCHEDULED"
      ).length;
      const completedReunions = reunions.filter(
        (r) => r.status === "COMPLETED"
      ).length;

      // Calculate completion rate instead of attendance
      const completionRate =
        totalReunions > 0
          ? Math.round((completedReunions / totalReunions) * 100)
          : 0;

      return {
        total_reunions: totalReunions,
        upcoming_reunions: scheduledReunions,
        completed_reunions: completedReunions,
        total_participants: 0, // Not available in backend
        average_attendance: completionRate,
      };
    }

    // Fallback to empty stats if no data provided
    return {
      total_reunions: 0,
      upcoming_reunions: 0,
      completed_reunions: 0,
      total_participants: 0,
      average_attendance: 0,
    };
  },

  // Bulk create reunions
  bulkCreateReunions: async (
    reunions: CreateReunionRequest[]
  ): Promise<Reunion[]> => {
    const response = await axiosInstance.post<Reunion[]>(
      "syndic/reunions/bulk-create/",
      { reunions }
    );
    return response.data;
  },

  // Update reunion status
  updateReunionStatus: async (
    id: number,
    status: Reunion["status"]
  ): Promise<Reunion> => {
    const response = await axiosInstance.patch<Reunion>(
      `syndic/reunions/${id}/status/`,
      { status }
    );
    return response.data;
  },

  // Add participant to reunion
  addParticipant: async (
    reunionId: number,
    participantEmail: string
  ): Promise<Reunion> => {
    const response = await axiosInstance.post<Reunion>(
      `syndic/reunions/${reunionId}/participants/`,
      {
        participant_email: participantEmail,
      }
    );
    return response.data;
  },

  removeParticipant: async (
    reunionId: number,
    participantEmail: string
  ): Promise<Reunion> => {
    const response = await axiosInstance.delete<Reunion>(
      `syndic/reunions/${reunionId}/participants/`,
      { data: { participant_email: participantEmail } }
    );
    return response.data;
  },
};

export default reunionAPI;
