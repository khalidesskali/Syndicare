// User roles
export type UserRole = "ADMIN" | "SYNDIC" | "RESIDENT";

// User interface
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  has_valid_subscription?: boolean | null;
}

// Subscription interface
export interface Subscription {
  plan_name: string;
  status: string;
  days_remaining: number;
  end_date: string;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Login response
export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

// Change password request
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password2: string;
}

// API Error response
export interface ApiError {
  detail?: string;
  errors?: Record<string, string[]>;
  [key: string]: any;
}

// Auth context state
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | Record<string, string[]> | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: () => Promise<ProfileResult>;
  changePassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<PasswordChangeResult>;
  hasRole: (role: UserRole) => boolean;
  isAuthenticated: boolean;
  // hasValidSubscription: () => boolean;
  setError: (error: string | Record<string, string[]> | null) => void;
}

// Auth action results
export interface AuthResult {
  user: User | null;
  // detail?: string;
}

export interface ProfileResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface PasswordChangeResult {
  success: boolean;
  message?: string;
  error?: string;
}

// Check auth response
export interface CheckAuthResponse {
  authenticated: boolean;
  user: User;
}

// Refresh token response
export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}
