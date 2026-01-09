import api from "./axios";

export interface Meeting {
  id: number;
  syndic: number;
  immeuble: number;
  building_name: string;
  building_address: string;
  title: string;
  topic: string;
  date_time: string;
  location: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  created_at: string;
}

export const residentMeetingsAPI = {
  getMeetings: async (): Promise<Meeting[]> => {
    const response = await api.get("/resident/reunions/");
    return response.data.data;
  },

  getUpcomingMeetings: async (): Promise<Meeting[]> => {
    const response = await api.get("/resident/reunions/upcoming/");
    return response.data.data;
  },

  getPastMeetings: async (): Promise<Meeting[]> => {
    const response = await api.get("/resident/reunions/past/");
    return response.data.data;
  },

  getMeetingDetails: async (id: number): Promise<Meeting> => {
    const response = await api.get(`/resident/reunions/${id}/`);
    return response.data.data;
  },
};
