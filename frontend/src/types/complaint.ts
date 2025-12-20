export interface Complaint {
  id: number;
  resident: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  syndic: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  appartement: {
    id: number;
    number: string;
    floor: number;
    immeuble: {
      id: number;
      name: string;
      address: string;
    };
  };
  title: string;
  content: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  response?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
  by_priority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface CreateComplaintRequest {
  title: string;
  content: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  appartement_id: number;
  resident_email: string;
}

export interface UpdateComplaintRequest {
  title?: string;
  content?: string;
  status?: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  response?: string;
}

export interface ComplaintFilters {
  search?: string;
  status?: string;
  priority?: string;
  building_id?: string;
  date_from?: string;
  date_to?: string;
}
