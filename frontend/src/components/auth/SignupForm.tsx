import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { AuthAlert } from "./AuthAlert";

export function SignupForm() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    password2?: string;
    general?: string;
  }>({});

  const { register, error, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      if (typeof error === "string") {
        setErrors({ general: error });
      } else {
        const newErrors: Record<string, string> = {};
        Object.entries(error).forEach(([key, value]) => {
          newErrors[key] = Array.isArray(value) ? value[0] : (value as string);
        });
        setErrors(newErrors);
      }
    }
  }, [error]);

  // Clear global error on unmount
  useEffect(() => {
    return () => {
      setError(null);
    };
  }, [setError]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.password2) {
      newErrors.password2 = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await register(formData);
      if (result.user) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/syndic/dashboard");
        }, 2000);
      }
    } catch (err) {
      console.error("Signup failed:", err);
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full md:w-[55%] p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
      <div className="mb-8 ">
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
          Create Account
        </h2>
        <p className="text-[15px] text-slate-500">
          Join thousands of syndics managing properties with ease.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success-message"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-3 border border-emerald-100/50 text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-emerald-500" />
              <p className="flex-1 text-[14px] font-medium leading-snug">
                Account created successfully! Redirecting...
              </p>
            </div>
          </motion.div>
        ) : (
          <AuthAlert
            message={errors.general}
            onClose={() => {
              setErrors((prev) => ({ ...prev, general: undefined }));
              setError(null);
            }}
          />
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label
              htmlFor="first_name"
              className="text-sm font-semibold text-slate-700"
            >
              First Name
            </Label>
            <div className="relative group">
              <UserIcon className="absolute left-3 top-3.5 h-[18px] w-[18px] text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <Input
                id="first_name"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
                className={`pl-10 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 transition-all text-[15px] ${
                  errors.first_name
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                disabled={isLoading || isSuccess}
              />
            </div>
            {errors.first_name && (
              <p className="text-[12px] text-red-500 font-medium px-1">
                {errors.first_name}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label
              htmlFor="last_name"
              className="text-sm font-semibold text-slate-700"
            >
              Last Name
            </Label>
            <div className="relative group">
              <UserIcon className="absolute left-3 top-3.5 h-[18px] w-[18px] text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <Input
                id="last_name"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
                className={`pl-10 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 transition-all text-[15px] ${
                  errors.last_name
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                disabled={isLoading || isSuccess}
              />
            </div>
            {errors.last_name && (
              <p className="text-[12px] text-red-500 font-medium px-1">
                {errors.last_name}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
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
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              className={`pl-10 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 transition-all text-[15px] ${
                errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
              disabled={isLoading || isSuccess}
            />
          </div>
          {errors.email && (
            <p className="text-[12px] text-red-500 font-medium px-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-slate-700"
            >
              Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 h-[18px] w-[18px] text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`pl-10 pr-10 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 transition-all text-base ${
                  errors.password
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                disabled={isLoading || isSuccess}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-[12px] text-red-500 font-medium px-1">
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password2"
              className="text-sm font-semibold text-slate-700"
            >
              Confirm
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 h-[18px] w-[18px] text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <Input
                id="password2"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password2}
                onChange={handleChange}
                className={`pl-10 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 transition-all text-base ${
                  errors.password2
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                disabled={isLoading || isSuccess}
              />
            </div>
            {errors.password2 && (
              <p className="text-[12px] text-red-500 font-medium px-1">
                {errors.password2}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || isSuccess}
          className={`w-full h-12 mt-4 text-white font-medium text-[15px] rounded-xl transition-all shadow-md active:scale-[0.98] ${
            isSuccess
              ? "bg-emerald-600 hover:bg-emerald-600"
              : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : isSuccess ? (
            "Account Created!"
          ) : (
            "Sign Up"
          )}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold underline text-slate-900 hover:text-indigo-600 transition-colors"
        >
          Login here
        </Link>
      </div>
    </div>
  );
}
