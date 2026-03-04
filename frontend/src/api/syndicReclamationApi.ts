import axiosInstance from "./axios";
import type {
  Complaint,
  ComplaintStats,
  CreateComplaintRequest,
  UpdateComplaintRequest,
  ComplaintFilters,
} from "../types/complaint";

const normalizeComplaint = (raw: any): Complaint => {
  const residentId = typeof raw?.resident === "number" ? raw.resident : 0;
  const appartementId =
    typeof raw?.appartement === "number" ? raw.appartement : 0;

  return {
    id: raw.id,
    resident: {
      id: residentId,
      email: raw?.resident_email ?? "",
      first_name: raw?.resident_name?.split(" ")?.[0],
      last_name:
        raw?.resident_name?.split(" ")?.slice(1).join(" ") || undefined,
    },
    syndic: {
      id: typeof raw?.syndic === "number" ? raw.syndic : 0,
      email: raw?.syndic_email ?? "",
      first_name: raw?.syndic_name?.split(" ")?.[0],
      last_name: raw?.syndic_name?.split(" ")?.slice(1).join(" ") || undefined,
    },
    appartement: {
      id: appartementId,
      number: raw?.apartment_number ?? "",
      floor: 0,
      immeuble: {
        id: typeof raw?.building_id === "number" ? raw.building_id : 0,
        name: raw?.building_name ?? "",
        address: raw?.building_address ?? "",
      },
    },
    title: raw.title,
    content: raw.content,
    status: raw.status,
    priority: raw.priority,
    response: raw.response ?? undefined,
    category: raw.category ?? null,
    ai_urgency_level: raw.ai_urgency_level ?? null,
    priority_score: raw.priority_score ?? null,
    ai_summary: raw.ai_summary ?? null,
    suggested_department: raw.suggested_department ?? null,
    sentiment: raw.sentiment ?? null,
    confidence_score: raw.confidence_score ?? null,
    ai_processed: raw.ai_processed ?? false,
    ai_processed_at: raw.ai_processed_at ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
};

export const syndicReclamationApi = {
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
      `/syndic/reclamations/?${params.toString()}`,
    );
    return (response.data.data ?? []).map(normalizeComplaint);
  },

  // Get single complaint details
  getComplaint: async (id: number): Promise<Complaint> => {
    const response = await axiosInstance.get(`/syndic/reclamations/${id}/`);
    return normalizeComplaint(response.data.data);
  },

  // Create new complaint (for residents, but syndic might need this)
  createComplaint: async (data: CreateComplaintRequest): Promise<Complaint> => {
    const response = await axiosInstance.post("/resident/reclamations/", data);
    return normalizeComplaint(response.data.data);
  },

  // Update complaint
  updateComplaint: async (
    id: number,
    data: UpdateComplaintRequest,
  ): Promise<Complaint> => {
    const response = await axiosInstance.patch(
      `/syndic/reclamations/${id}/`,
      data,
    );
    return normalizeComplaint(response.data.data);
  },

  // Delete complaint
  deleteComplaint: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/syndic/reclamations/${id}/`);
  },

  // Respond to complaint
  respondToComplaint: async (
    id: number,
    response: string,
    status?: string,
  ): Promise<Complaint> => {
    const response_data = {
      response,
      status: status || "IN_PROGRESS",
    };
    const result = await axiosInstance.post(
      `/syndic/reclamations/${id}/respond/`,
      response_data,
    );
    return normalizeComplaint(result.data.data);
  },

  // Mark complaint as resolved
  markAsResolved: async (id: number): Promise<Complaint> => {
    const result = await axiosInstance.post(
      `/syndic/reclamations/${id}/change_status/`,
      { status: "RESOLVED" },
    );
    return normalizeComplaint(result.data.data);
  },

  // Mark complaint as in progress
  markAsInProgress: async (id: number): Promise<Complaint> => {
    const result = await axiosInstance.post(
      `/syndic/reclamations/${id}/change_status/`,
      { status: "IN_PROGRESS" },
    );
    return normalizeComplaint(result.data.data);
  },

  // Reject complaint
  rejectComplaint: async (id: number, response: string): Promise<Complaint> => {
    // 1) Save the rejection response text
    await axiosInstance.patch(`/syndic/reclamations/${id}/`, { response });

    // 2) Move through the validated lifecycle
    const result = await axiosInstance.post(
      `/syndic/reclamations/${id}/change_status/`,
      { status: "REJECTED", comment: "Rejected" },
    );
    return normalizeComplaint(result.data.data);
  },

  // (Re)run AI triage on a complaint
  triageAI: async (id: number): Promise<Complaint> => {
    const result = await axiosInstance.post(
      `/syndic/reclamations/${id}/triage_ai/`,
    );
    return normalizeComplaint(result.data.data);
  },

  // Get complaint statistics
  getComplaintStats: async (): Promise<ComplaintStats> => {
    const response = await axiosInstance.get(
      "/syndic/reclamations/statistics/",
    );
    return response.data.data;
  },
};
