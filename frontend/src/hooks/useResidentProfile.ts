import { useState, useEffect } from "react";
import authAPI from "../api/auth";

export interface ResidentProfileData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  appartements: any[];
}

export const useResidentProfile = () => {
  const [data, setData] = useState<ResidentProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await authAPI.getResidentProfile();
      if (result.success) {
        setData(result.data);
      } else {
        setError("Failed to fetch profile");
      }
    } catch (err: any) {
      setError("An error occurred while fetching profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { data, loading, error, refetch: fetchProfile };
};
