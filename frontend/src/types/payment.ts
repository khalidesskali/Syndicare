export interface Payment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  notes?: string;
  paymentDate: string;
  processedBy: string;
  paymentProof?: string;
  rib?: string;
}

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CARD" | "CHECK";
