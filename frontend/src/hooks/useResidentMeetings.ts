import { useState, useEffect } from "react";
import { residentMeetingsAPI, type Meeting } from "@/api/residentMeetings";

interface UseResidentMeetingsReturn {
  meetings: Meeting[];
  upcomingMeetings: Meeting[];
  pastMeetings: Meeting[];
  loading: boolean;
  error: string | null;
  refreshMeetings: () => void;
}

export const useResidentMeetings = (): UseResidentMeetingsReturn => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [pastMeetings, setPastMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allMeetingsData, upcomingData, pastData] = await Promise.all([
        residentMeetingsAPI.getMeetings(),
        residentMeetingsAPI.getUpcomingMeetings(),
        residentMeetingsAPI.getPastMeetings(),
      ]);

      setMeetings(allMeetingsData);
      setUpcomingMeetings(upcomingData);
      setPastMeetings(pastData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch meetings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const refreshMeetings = () => {
    fetchMeetings();
  };

  return {
    meetings,
    upcomingMeetings,
    pastMeetings,
    loading,
    error,
    refreshMeetings,
  };
};
