import axiosInstance from "./axios";

export interface ResidentPaymentListResponse {
  success: boolean;
  count: number;
  payments: Payment[];
}

export interface ResidentPaymentResponse {
  success: boolean;
  payment: Payment;
}

export interface Payment {
  id: number;
  charge_reference: string;
  amount: number;
  paid_at: string;
  payment_method: "CASH" | "BANK_TRANSFER";
  reference?: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "REFUNDED";
  appartement: {
    number: string;
    building: {
      name: string;
    };
  };
  created_at: string;
}

const residentPaymentAPI = {
  // Get all resident payments
  getResidentPayments: async (): Promise<Payment[]> => {
    const response = await axiosInstance.get<ResidentPaymentListResponse>(
      "resident/payments/"
    );
    return response.data.payments || response.data;
  },

  // Get single payment by ID
  getResidentPaymentById: async (id: number): Promise<Payment> => {
    const response = await axiosInstance.get<ResidentPaymentResponse>(
      `resident/payments/${id}/`
    );
    return response.data.payment;
  },
};

export default residentPaymentAPI;
