import axiosInstance from "./axios";
import type {
  LoginResponse,
  User,
  CheckAuthResponse,
  RefreshTokenResponse,
} from "../types/auth";

const authAPI = {
  // Login
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>("/auth/login/", {
      email,
      password,
    });
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem("refresh_token");
    try {
      await axiosInstance.post("/auth/logout/", {
        refresh: refreshToken,
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await axiosInstance.get<User>("/auth/profile/");
    return response.data;
  },

  // Change password
  changePassword: async (
    oldPassword: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>(
      "/auth/change-password/",
      {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword,
      }
    );
    return response.data;
  },

  // Check authentication status
  checkAuth: async (): Promise<CheckAuthResponse> => {
    const response = await axiosInstance.get<CheckAuthResponse>("/auth/check/");
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await axiosInstance.post<RefreshTokenResponse>(
      "/auth/refresh/",
      {
        refresh: refreshToken,
      }
    );
    return response.data;
  },
};

export default authAPI;
