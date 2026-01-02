import axiosInstance from "./axios";
import type { Charge } from "../types/residentPortal";

export interface ResidentChargePaymentRequest {
  amount: number;
  payment_method: "CASH" | "BANK_TRANSFER" | "CHECK" | "CREDIT_CARD";
  reference?: string;
  paid_at?: string;
}

export interface ResidentChargePaymentResponse {
  success: boolean;
  message: string;
  data?: {
    payment_id: number;
    charge_id: number;
    amount: number;
    payment_method: string;
    reference: string;
    paid_at: string;
    status: string;
  };
}

const residentChargeAPI = {
  // Get all resident charges
  getResidentCharges: async (): Promise<Charge[]> => {
    const response = await axiosInstance.get("resident/charges/");
    return response.data.results || response.data;
  },

  // Get single charge by ID
  getResidentChargeById: async (id: number): Promise<Charge> => {
    const response = await axiosInstance.get(`resident/charges/${id}/`);
    return response.data;
  },

  // Pay a charge
  payResidentCharge: async (
    id: number,
    paymentData: ResidentChargePaymentRequest
  ): Promise<ResidentChargePaymentResponse> => {
    const response = await axiosInstance.post(
      `resident/charges/${id}/pay/`,
      paymentData
    );
    return response.data;
  },
};

export default residentChargeAPI;
