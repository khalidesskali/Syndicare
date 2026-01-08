import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "date";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: (value: any, formData?: Record<string, any>) => string | null;
  min?: number;
  max?: number;
  step?: string;
}

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<boolean>;
  loading?: boolean;
  submitText?: string;
  size?: "sm" | "md" | "lg";
}

export function FormModal({
  isOpen,
  onClose,
  title,
  fields,
  initialData = {},
  onSubmit,
  loading = false,
  submitText = "Submit",
  size = "md",
}: FormModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCalendar, setShowCalendar] = useState<string | null>(null);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setErrors({});
      setShowCalendar(null);
    }
  }, [isOpen]);

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value === "")) {
      return `${field.label} is required`;
    }

    if (field.type === "number" && value) {
      const numValue = parseFloat(value);
      if (field.min !== undefined && numValue < field.min) {
        return `${field.label} must be at least ${field.min}`;
      }
      if (field.max !== undefined && numValue > field.max) {
        return `${field.label} must not exceed ${field.max}`;
      }
    }

    if (field.validation) {
      return field.validation(value, formData);
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const success = await onSubmit(formData);
    if (success) {
      onClose();
    }
  };

  const updateField = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDateSelect = (fieldName: string, date: Date | undefined) => {
    if (date) {
      updateField(fieldName, date.toISOString().split("T")[0]);
      setShowCalendar(null);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || "";
    const error = errors[field.name];

    switch (field.type) {
      case "textarea":
        return (
          <div key={field.name} className="space-y-2">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-slate-700"
            >
              {field.label} {field.required && "*"}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => updateField(field.name, e.target.value)}
              className="border-slate-200 focus:border-green-500 focus:ring-green-500"
              placeholder={field.placeholder}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="space-y-2">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-slate-700"
            >
              {field.label} {field.required && "*"}
            </Label>
            <Select
              value={value?.toString() || ""}
              onValueChange={(val) => updateField(field.name, val)}
            >
              <SelectTrigger className="border-slate-200 focus:border-green-500 focus:ring-green-500">
                <SelectValue
                  placeholder={field.placeholder || "Select an option"}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        );

      case "date":
        const selectedDate = value ? new Date(value) : undefined;
        return (
          <div key={field.name} className="space-y-2">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-slate-700"
            >
              {field.label} {field.required && "*"}
            </Label>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-200 focus:border-green-500 focus:ring-green-500 justify-start text-left"
                onClick={() =>
                  setShowCalendar(
                    showCalendar === field.name ? null : field.name
                  )
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate
                  ? format(selectedDate, "MMM dd, yyyy")
                  : "Select date"}
              </Button>
              {showCalendar === field.name && (
                <div className="absolute top-full mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => handleDateSelect(field.name, date)}
                    className="rounded-md"
                  />
                </div>
              )}
            </div>
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        );

      default: // text, number, email
        return (
          <div key={field.name} className="space-y-2">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-slate-700"
            >
              {field.label} {field.required && "*"}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              value={value}
              onChange={(e) => updateField(field.name, e.target.value)}
              className="border-slate-200 focus:border-green-500 focus:ring-green-500"
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        );
    }
  };

  const sizeClasses = {
    sm: "sm:max-w-[400px]",
    md: "sm:max-w-[600px]",
    lg: "sm:max-w-[800px]",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${sizeClasses[size]} bg-white border-slate-200 shadow-xl`}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(renderField)}
          </div>

          <DialogFooter className="flex space-x-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
              disabled={loading}
            >
              {loading ? "Processing..." : submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
