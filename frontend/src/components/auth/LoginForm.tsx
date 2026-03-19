import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { AuthAlert } from "./AuthAlert";

export function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const { login, error, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  useEffect(() => {
    if (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : Object.values(error).flat().join(", ") || "An error occurred";
      setErrors({ general: errorMessage });
    }
  }, [error]);

  // Clear global error on unmount
  useEffect(() => {
    return () => {
      setError(null);
    };
  }, [setError]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await login(email, password);

      if (result.user) {
        const user = result.user;
        if (user.role === "ADMIN") {
          navigate("/admin/dashboard");
        } else if (user.role === "SYNDIC") {
          navigate("/syndic/dashboard");
        } else if (user.role === "RESIDENT") {
          navigate("/resident/dashboard");
        } else {
          navigate(from, { replace: true });
        }
      } else {
        setErrors({ general: "Login failed" });
      }
    } catch (err) {
      console.error("Login failed:", err);
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full md:w-[55%] p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
      <div className="mb-8 lg:mb-10">
        {/* Mobile Branding Logo */}
        <div className="flex items-center gap-2 mb-8 md:hidden">
          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-md">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            SyndicApp
          </span>
        </div>

        <h2 className="text-[28px] font-bold tracking-tight text-slate-900 mb-2">
          Welcome back
        </h2>
        <p className="text-[15px] text-slate-500">
          Enter your credentials to securely access your account.
        </p>
      </div>

      <AuthAlert
        message={errors.general}
        onClose={() => {
          setErrors((prev) => ({ ...prev, general: undefined }));
          setError(null);
        }}
      />

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email Field */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-semibold text-slate-700"
          >
            Email address
          </Label>
          <div className="relative group">
            <Mail className="absolute left-3 top-3.5 h-[18px] w-[18px] text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              className={`pl-10 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all text-[15px] ${
                errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[13px] text-red-500 flex items-center gap-1.5 mt-1.5 font-medium"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.email}
            </motion.p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-slate-700"
            >
              Password
            </Label>
            <Link
              to="/forgot-password"
              className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-3 top-3.5 h-[18px] w-[18px] text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors({ ...errors, password: undefined });
              }}
              className={`pl-10 pr-10 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all text-base tracking-wide ${
                errors.password
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[13px] text-red-500 flex items-center gap-1.5 mt-1.5 font-medium"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.password}
            </motion.p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 mt-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-[15px] rounded-xl transition-all shadow-md active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold underline text-slate-900 hover:text-indigo-600 transition-colors"
        >
          Signup here
        </Link>
      </div>
    </div>
  );
}
