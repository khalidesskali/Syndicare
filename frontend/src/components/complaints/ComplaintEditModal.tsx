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
import { MessageSquare } from "lucide-react";
import type { Complaint, UpdateComplaintRequest } from "../../types/complaint";

interface ComplaintEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateComplaint: (data: UpdateComplaintRequest) => Promise<boolean>;
  loading?: boolean;
  complaint: Complaint | null;
}

export function ComplaintEditModal({
  isOpen,
  onClose,
  onUpdateComplaint,
  loading = false,
  complaint,
}: ComplaintEditModalProps) {
  const [formData, setFormData] = useState<UpdateComplaintRequest>({
    title: "",
    content: "",
    status: "PENDING",
    priority: "MEDIUM",
    response: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (complaint) {
      setFormData({
        title: complaint.title,
        content: complaint.content,
        status: complaint.status,
        priority: complaint.priority,
        response: complaint.response || "",
      });
    }
  }, [complaint]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.content?.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const success = await onUpdateComplaint(formData);
    if (success) {
      onClose();
      setErrors({});
    }
  };

  const handleInputChange = (
    field: keyof UpdateComplaintRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!complaint) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white border-slate-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center">
            <MessageSquare className="mr-3 h-6 w-6 text-orange-600" />
            Edit Complaint
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-slate-700"
              >
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="mt-1 border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Enter complaint title"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label
                htmlFor="content"
                className="text-sm font-medium text-slate-700"
              >
                Content *
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                className="mt-1 border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Describe the complaint details"
                rows={4}
              />
              {errors.content && (
                <p className="text-sm text-red-600 mt-1">{errors.content}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="status"
                className="text-sm font-medium text-slate-700"
              >
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
                disabled={
                  complaint.status === "RESOLVED" ||
                  complaint.status === "REJECTED"
                }
              >
                <SelectTrigger className="mt-1 border-slate-200 focus:border-orange-500 focus:ring-orange-500">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="priority"
                className="text-sm font-medium text-slate-700"
              >
                Priority
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger className="mt-1 border-slate-200 focus:border-orange-500 focus:ring-orange-500">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label
                htmlFor="response"
                className="text-sm font-medium text-slate-700"
              >
                Response
              </Label>
              <Textarea
                id="response"
                value={formData.response}
                onChange={(e) => handleInputChange("response", e.target.value)}
                className="mt-1 border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Add your response to the complaint"
                rows={3}
              />
            </div>
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
            className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Complaint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
