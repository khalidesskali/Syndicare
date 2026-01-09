import axiosInstance from "./axios";

export interface SyndicPayment {
  id: number;
  charge: number;
  appartement: number;
  amount: number;
  payment_method: "CASH" | "BANK_TRANSFER" | "CHECK" | "ONLINE";
  reference?: string;
  paid_at?: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  created_at: string;
  // Additional fields from SyndicPaymentSerializer
  apartment_number: string;
  building_name: string;
  resident_email?: string;
  resident_name?: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment_id: number;
    charge_id: number;
    payment_status: string;
    charge_status: string;
  };
}

export interface RejectPaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment_id: number;
    payment_status: string;
    reason?: string;
  };
}

const syndicPaymentAPI = {
  // Get all resident payments for syndic (standard DRF list endpoint)
  getSyndicPayments: async (filters?: {
    status?: string;
    building_id?: string;
    apartment_id?: string;
    payment_method?: string;
    searchTerm?: string;
  }): Promise<SyndicPayment[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response = await axiosInstance.get(
      `syndic/payments/${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data.results || response.data;
  },

  // Get single payment by ID (standard DRF retrieve endpoint)
  getSyndicPaymentById: async (id: number): Promise<SyndicPayment> => {
    const response = await axiosInstance.get(`syndic/payments/${id}/`);
    return response.data;
  },

  // Confirm a payment (custom action)
  confirmPayment: async (id: number): Promise<ConfirmPaymentResponse> => {
    const response = await axiosInstance.post(`syndic/payments/${id}/confirm/`);
    return response.data;
  },

  // Reject a payment (custom action)
  rejectPayment: async (
    id: number,
    reason?: string
  ): Promise<RejectPaymentResponse> => {
    const response = await axiosInstance.post(`syndic/payments/${id}/reject/`, {
      reason,
    });
    return response.data;
  },
};

export default syndicPaymentAPI;
