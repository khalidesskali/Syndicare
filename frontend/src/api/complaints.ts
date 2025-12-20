import axiosInstance from "./axios";
import type {
  Complaint,
  ComplaintStats,
  CreateComplaintRequest,
  UpdateComplaintRequest,
  ComplaintFilters,
} from "../types/complaint";

export const complaintAPI = {
  // Get all complaints for the syndic
  getComplaints: async (filters?: ComplaintFilters): Promise<Complaint[]> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.status && filters.status !== "all")
      params.append("status", filters.status);
    if (filters?.priority && filters.priority !== "all")
      params.append("priority", filters.priority);
    if (filters?.building_id && filters.building_id !== "all")
      params.append("building_id", filters.building_id);
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);

    const response = await axiosInstance.get(
      `/syndic/reclamations/?${params.toString()}`
    );
    return response.data.data;
  },

  // Get single complaint details
  getComplaint: async (id: number): Promise<Complaint> => {
    const response = await axiosInstance.get(`/syndic/reclamations/${id}/`);
    return response.data.data;
  },

  // Create new complaint (for residents, but syndic might need this)
  createComplaint: async (data: CreateComplaintRequest): Promise<Complaint> => {
    const response = await axiosInstance.post("/syndic/reclamations/", data);
    return response.data.data;
  },

  // Update complaint
  updateComplaint: async (
    id: number,
    data: UpdateComplaintRequest
  ): Promise<Complaint> => {
    const response = await axiosInstance.patch(
      `/syndic/reclamations/${id}/`,
      data
    );
    return response.data.data;
  },

  // Delete complaint
  deleteComplaint: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/syndic/reclamations/${id}/`);
  },

  // Respond to complaint
  respondToComplaint: async (
    id: number,
    response: string,
    status?: string
  ): Promise<Complaint> => {
    const response_data = {
      response,
      status: status || "IN_PROGRESS",
    };
    const result = await axiosInstance.post(
      `/syndic/reclamations/${id}/respond/`,
      response_data
    );
    return result.data.data;
  },

  // Mark complaint as resolved
  markAsResolved: async (id: number): Promise<Complaint> => {
    const response = await axiosInstance.post(
      `/syndic/reclamations/${id}/mark_resolved/`
    );
    return response.data.data;
  },

  // Mark complaint as in progress
  markAsInProgress: async (id: number): Promise<Complaint> => {
    const response = await axiosInstance.post(
      `/syndic/reclamations/${id}/mark_in_progress/`
    );
    return response.data.data;
  },

  // Reject complaint
  rejectComplaint: async (id: number, response: string): Promise<Complaint> => {
    const response_data = {
      response,
    };
    const result = await axiosInstance.post(
      `/syndic/reclamations/${id}/reject/`,
      response_data
    );
    return result.data.data;
  },

  // Get complaint statistics
  getComplaintStats: async (): Promise<ComplaintStats> => {
    const response = await axiosInstance.get(
      "/syndic/reclamations/statistics/"
    );
    return response.data.data;
  },
};
