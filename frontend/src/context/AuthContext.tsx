import React, { createContext, useState, useContext, useEffect } from "react";
import { AxiosError } from "axios";
import authAPI from "../api/auth";
import type {
  User,
  UserRole,
  AuthContextType,
  AuthResult,
  ProfileResult,
  PasswordChangeResult,
  ApiError,
} from "../types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | Record<string, string[]> | null>(
    null
  );

  // Listen for token refresh events
  useEffect(() => {
    const handleTokenRefreshed = () => {
      // Token is updated in localStorage by the axios interceptor
      // No need to update state here since we're not tracking accessToken state
    };

    const handleAuthError = () => {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    };

    window.addEventListener("tokenRefreshed", handleTokenRefreshed);
    window.addEventListener("authError", handleAuthError);

    return () => {
      window.removeEventListener("tokenRefreshed", handleTokenRefreshed);
      window.removeEventListener("authError", handleAuthError);
    };
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const token = localStorage.getItem("access_token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser) as User;
          setUser(parsedUser);
          setIsAuthenticated(true);

          // Verify token is still valid
          const userData = await authAPI.checkAuth();
          setUser(userData.user);
          localStorage.setItem("user", JSON.stringify(userData.user));
        } catch (error) {
          console.error("Auth verification failed:", error);
          // Token invalid, clear storage
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      setError(null);
      setLoading(true);

      console.log("Login attempt:", { email });

      const data = await authAPI.login(email, password);

      console.log("Login response:", data);

      // Save tokens
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      setIsAuthenticated(true);
      setLoading(false);

      return { user: data.user };
    } catch (err) {
      console.error("Login error:", err);

      const error = err as AxiosError<ApiError>;
      let errorMessage = "Login failed";

      if (error.response) {
        // Server responded with error
        errorMessage = `${error.response.data.detail}`;
        console.log("Server error response:", error.response.data.detail);
      } else if (error.request) {
        // Request made but no response
        errorMessage =
          "No response from server. Please check if the backend is running.";
        console.log("No response error");
      } else {
        // Error in request setup
        errorMessage = error.message || "Network error";
        console.log("Request setup error:", error.message);
      }
      setError(errorMessage);
      setLoading(false);
      setIsAuthenticated(false);
      return { user: null };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  };

  // Update user profile
  const updateProfile = async (): Promise<ProfileResult> => {
    try {
      const userData = await authAPI.getProfile();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error("Profile update failed:", error);
      return { success: false, error: "Failed to update profile" };
    }
  };

  // Change password
  const changePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<PasswordChangeResult> => {
    try {
      setError(null);
      await authAPI.changePassword(oldPassword, newPassword);

      // Logout after password change
      await logout();

      return {
        success: true,
        message: "Password changed successfully. Please login again.",
      };
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const errorMessage =
        error.response?.data?.old_password?.[0] ||
        error.response?.data?.new_password?.[0] ||
        error.response?.data?.detail ||
        "Password change failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Check if user has specific role
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  // Check if Syndic has valid subscription
  // const hasValidSubscription = (): boolean => {
  //   if (user?.role === "SYNDIC") {
  //     return user?.has_valid_subscription === true;
  //   }
  //   return true; // Non-syndics always have access
  // };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    changePassword,
    hasRole,
    isAuthenticated,
    // hasValidSubscription,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
