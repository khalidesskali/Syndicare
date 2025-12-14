import React, { useState, forwardRef } from "react";
import { X, Plus, Loader2, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useSyndics from "@/hooks/useSyndics";
import { toast } from "sonner";
import type { SyndicFormData } from "@/types/syndics";

interface AddSyndicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSyndicModal = forwardRef<HTMLDivElement, AddSyndicModalProps>(
  ({ isOpen, onClose }, ref) => {
    const { createSyndic } = useSyndics();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<SyndicFormData>({
      email: "",
      password: "",
      password2: "",
      first_name: "",
      last_name: "",
      role: "SYNDIC",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};

      if (!formData.email.includes("@")) {
        newErrors.email = "Please enter a valid email address";
      }
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      if (formData.password !== formData.password2) {
        newErrors.password2 = "Passwords don't match";
      }
      if (!formData.first_name.trim()) {
        newErrors.first_name = "First name is required";
      }
      if (!formData.last_name.trim()) {
        newErrors.last_name = "Last name is required";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      try {
        setIsSubmitting(true);
        await createSyndic({
          ...formData,
          role: "SYNDIC",
        });
        toast.success("Syndic created successfully");
        onClose();
        // Reset form
        setFormData({
          email: "",
          password: "",
          password2: "",
          first_name: "",
          last_name: "",
          role: "SYNDIC",
        });
      } catch (error) {
        toast.error("Failed to create syndic");
        console.error("Error creating syndic:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    if (!isOpen) return null;

    const inputClasses = (field: string) =>
      `w-full px-4 py-3 rounded-lg border ${
        errors[field]
          ? "border-red-500 focus:ring-2 focus:ring-red-200"
          : "border-gray-300 focus:ring-2 focus:ring-blue-500"
      } focus:outline-none transition-all duration-200`;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="flex min-h-screen items-center justify-center p-4">
          <div
            ref={ref}
            className="relative w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Create New Syndic Account
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-white/80 hover:bg-white/10 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <User className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Personal Information
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="first_name"
                      className="text-sm font-medium text-gray-700"
                    >
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={inputClasses("first_name")}
                        placeholder="John"
                      />
                      {errors.first_name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.first_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="last_name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={inputClasses("last_name")}
                        placeholder="Doe"
                      />
                      {errors.last_name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.last_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${inputClasses("email")} pl-10`}
                        placeholder="john.doe@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company & Security */}
                <div className="space-y-5">
                  <div className="space-y-1">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`${inputClasses("password")} pl-10`}
                        placeholder="••••••••"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="password2"
                      className="text-sm font-medium text-gray-700"
                    >
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="password2"
                        type="password"
                        name="password2"
                        value={formData.password2}
                        onChange={handleChange}
                        className={`${inputClasses("password2")} pl-10`}
                        placeholder="••••••••"
                      />
                      {errors.password2 && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.password2}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-2.5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-5 w-5" />
                      Create Syndic
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
);

AddSyndicModal.displayName = "AddSyndicModal";

export default AddSyndicModal;
