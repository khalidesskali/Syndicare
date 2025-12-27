import axiosInstance from "./axios";
import type {
  Charge,
  ChargeStats,
  ChargeFilters,
  ChargeResponse,
  ChargeStatsResponse,
  BulkCreateRequest,
  BulkCreateResponse,
  MarkPaidRequest,
  MarkPaidResponse,
  ChargesListResponse,
  CreateChargeRequest,
  DeleteChargeResponse,
  UpdateChargeRequest,
} from "../types/charge";

const chargeAPI = {
  // Get all charges with optional filters
  getCharges: async (filters?: ChargeFilters): Promise<Charge[]> => {
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.building_id)
      params.append("building_id", filters.building_id.toString());
    if (filters?.apartment_id)
      params.append("apartment_id", filters.apartment_id.toString());
    if (filters?.overdue) params.append("overdue", filters.overdue.toString());

    const response = await axiosInstance.get<ChargesListResponse>(
      `syndic/charges/?${params.toString()}`
    );
    return response.data.data;
  },

  // Get charge by ID
  getChargeById: async (id: number): Promise<Charge> => {
    const response = await axiosInstance.get<ChargeResponse>(
      `syndic/charges/${id}/`
    );
    return response.data.data;
  },

  // Create new charge
  createCharge: async (data: CreateChargeRequest): Promise<ChargeResponse> => {
    const response = await axiosInstance.post<ChargeResponse>(
      "syndic/charges/",
      data
    );
    return response.data;
  },

  // Update charge
  updateCharge: async (
    id: number,
    data: UpdateChargeRequest
  ): Promise<ChargeResponse> => {
    const response = await axiosInstance.put<ChargeResponse>(
      `syndic/charges/${id}/`,
      data
    );
    return response.data;
  },

  // Partial update charge
  partialUpdateCharge: async (
    id: number,
    data: UpdateChargeRequest
  ): Promise<ChargeResponse> => {
    const response = await axiosInstance.patch<ChargeResponse>(
      `syndic/charges/${id}/`,
      data
    );
    return response.data;
  },

  // Delete charge
  deleteCharge: async (id: number): Promise<DeleteChargeResponse> => {
    const response = await axiosInstance.delete<DeleteChargeResponse>(
      `syndic/charges/${id}/`
    );
    return response.data;
  },

  // Mark charge as paid
  markPaid: async (
    id: number,
    data: MarkPaidRequest
  ): Promise<MarkPaidResponse> => {
    const response = await axiosInstance.post<MarkPaidResponse>(
      `syndic/charges/${id}/mark_paid/`,
      data
    );
    return response.data;
  },

  // Bulk create charges
  bulkCreateCharges: async (
    data: BulkCreateRequest
  ): Promise<BulkCreateResponse> => {
    const response = await axiosInstance.post<BulkCreateResponse>(
      "syndic/charges/bulk_create/",
      data
    );
    return response.data;
  },

  // Get charge statistics
  getChargeStats: async (): Promise<ChargeStats> => {
    const response = await axiosInstance.get<ChargeStatsResponse>(
      "syndic/charges/statistics/"
    );
    return response.data.data;
  },
};

export default chargeAPI;
