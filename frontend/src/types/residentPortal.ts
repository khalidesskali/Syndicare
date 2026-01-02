export interface Charge {
  id: number;
  description: string;
  amount: number;
  due_date: string;
  status: "PAID" | "UNPAID" | "OVERDUE";
  reference: string;
  appartement: {
    id: number;
    number: string;
    building: {
      name: string;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  charge_reference: string;
  amount: number;
  payment_date: string;
  payment_method: "CASH" | "BANK_TRANSFER" | "CHECK" | "CREDIT_CARD";
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

export interface Reclamation {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdDate: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export interface DashboardSummary {
  totalUnpaid: number;
  overdueChargesCount: number;
  lastPaymentDate: string;
  recentCharges: Charge[];
}
