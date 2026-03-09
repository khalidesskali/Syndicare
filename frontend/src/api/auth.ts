import axiosInstance from "./axios";
import type {
  LoginResponse,
  User,
  CheckAuthResponse,
  RegisterRequest,
  RegisterResponse,
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

  // Register
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>(
      "/auth/register/",
      data,
    );
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
    newPassword: string,
  ): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>(
      "/auth/change-password/",
      {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword,
      },
    );
    return response.data;
  },

  // Check authentication status
  checkAuth: async (): Promise<CheckAuthResponse> => {
    const response = await axiosInstance.get<CheckAuthResponse>("/auth/check/");
    return response.data;
  },

  // Verify token
  verifyToken: async (): Promise<{
    valid: boolean;
    user?: User;
    error?: string;
  }> => {
    try {
      const response = await axiosInstance.get<{ valid: boolean; user: User }>(
        "/auth/verify/",
      );
      return response.data;
    } catch (error) {
      return { valid: false, error: "Token verification failed" };
    }
  },
};

export default authAPI;
