export interface Payment {
  [x: string]: ReactNode;
  syndic_name: ReactNode;
  id: string;
  subscriptionId: string;
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
  subscription?: {
    id: string;
    planName: string;
    syndic_name: string;
    company_name: string;
  };
}

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CARD" | "CHECK";
