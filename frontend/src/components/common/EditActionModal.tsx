import React, { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { ActionModalConfig, FieldConfig } from "@/types/common";

interface EditActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ActionModalConfig;
  loading?: boolean;
  initialData?: Record<string, any>;
}

export function EditActionModal({
  isOpen,
  onClose,
  config,
  loading = false,
  initialData,
}: EditActionModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const data: Record<string, any> = {};
    config.fields.forEach((field) => {
      data[field.name] =
        initialData?.[field.name] ||
        field.defaultValue ||
        (field.type === "checkbox" ? false : "");
    });
    return data;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showCalendar, setShowCalendar] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      const data: Record<string, any> = {};
      config.fields.forEach((field) => {
        const value = initialData[field.name];
        data[field.name] =
          value !== undefined
            ? value
            : field.defaultValue || (field.type === "checkbox" ? false : "");

        // Handle date fields
        if (field.type === "date" && value) {
          setSelectedDate(new Date(value));
        }
      });
      setFormData(data);
    }
  }, [initialData, config.fields]);

  const validateField = (field: FieldConfig, value: any): string | null => {
    if (field.required && (!value || value === "")) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      const { min, max, pattern, custom } = field.validation;

      if (field.type === "number" && value) {
        const numValue = Number(value);
        if (min !== undefined && numValue < min) {
          return `${field.label} must be at least ${min}`;
        }
        if (max !== undefined && numValue > max) {
          return `${field.label} must be at most ${max}`;
        }
      }

      if (field.type === "text" || field.type === "textarea") {
        if (min !== undefined && value.length < min) {
          return `${field.label} must be at least ${min} characters`;
        }
        if (max !== undefined && value.length > max) {
          return `${field.label} must be at most ${max} characters`;
        }
        if (pattern && value && !pattern.test(value)) {
          return `${field.label} format is invalid`;
        }
      }

      if (custom) {
        return custom(value);
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    config.fields.forEach((field) => {
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

    const success = await config.action(formData);
    if (success) {
      onClose();
      setErrors({});
    }
  };

  const handleDateSelect = (date: Date | undefined, fieldName: string) => {
    if (date) {
      setSelectedDate(date);
      setFormData((prev) => ({
        ...prev,
        [fieldName]: date.toISOString().split("T")[0],
      }));
      setShowCalendar(false);
    }
  };

  const renderField = (field: FieldConfig) => {
    const error = errors[field.name];
    const value = formData[field.name];

    switch (field.type) {
      case "text":
      case "number":
      case "email":
      case "time":
      case "currency":
        return (
          <div key={field.name} className="space-y-2">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-slate-700"
            >
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type === "currency" ? "number" : field.type}
              value={value}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.name]:
                    field.type === "number" || field.type === "currency"
                      ? Number(e.target.value) || 0
                      : e.target.value,
                }))
              }
              placeholder={field.placeholder}
              className="mt-1 border-slate-200 focus:border-green-500 focus:ring-green-500"
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        );

      case "date":
        return (
          <div key={field.name} className="space-y-2">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-slate-700"
            >
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                className="w-full mt-1 border-slate-200 focus:border-green-500 focus:ring-green-500 justify-start text-left"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {selectedDate
                  ? format(selectedDate, "MMM dd, yyyy")
                  : field.placeholder || "Select date"}
              </Button>
              {showCalendar && (
                <div className="absolute top-full mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => handleDateSelect(date, field.name)}
                    className="rounded-md"
                  />
                </div>
              )}
            </div>
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="space-y-2">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-slate-700"
            >
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: e.target.value,
                }))
              }
              placeholder={field.placeholder}
              className="mt-1 border-slate-200 focus:border-green-500 focus:ring-green-500"
              rows={3}
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
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: value,
                }))
              }
            >
              <SelectTrigger className="mt-1 border-slate-200 focus:border-green-500 focus:ring-green-500">
                <SelectValue
                  placeholder={
                    field.placeholder || `Select ${field.label.toLowerCase()}`
                  }
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

      case "checkbox":
        return (
          <div key={field.name} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.name}
                checked={value}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    [field.name]: checked,
                  }))
                }
              />
              <Label
                htmlFor={field.name}
                className="text-sm font-medium text-slate-700"
              >
                {field.label}
              </Label>
            </div>
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white border-slate-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {config.title}
          </DialogTitle>
          {config.description && (
            <p className="text-slate-600 mt-2">{config.description}</p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.fields.map(renderField)}
          </div>
        </form>

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
            onClick={handleSubmit}
            variant={config.submitButtonVariant || "default"}
            className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
            disabled={loading}
          >
            {loading ? "Updating..." : config.submitButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
