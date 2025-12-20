import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  User,
  Home,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Reply,
} from "lucide-react";
import type { Complaint } from "../../types/complaint";
import { format } from "date-fns";

interface ComplaintDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onEdit: (complaint: Complaint) => void;
  onDelete: (complaint: Complaint) => void;
  onUpdateStatus: (complaintId: number, status: Complaint["status"]) => void;
  onRespond: (
    complaintId: number,
    response: string,
    status?: string
  ) => Promise<boolean>;
}

export function ComplaintDetailsModal({
  isOpen,
  onClose,
  complaint,
  onEdit,
  onDelete,
  onUpdateStatus,
  onRespond,
}: ComplaintDetailsModalProps) {
  const [response, setResponse] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);

  if (!complaint) return null;

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
    RESOLVED: "bg-green-100 text-green-700 border-green-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
  } as const;

  const priorityColors = {
    URGENT: "bg-red-100 text-red-700 border-red-200",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    LOW: "bg-green-100 text-green-700 border-green-200",
  } as const;

  const statusIcons = {
    PENDING: Clock,
    IN_PROGRESS: TrendingUp,
    RESOLVED: CheckCircle,
    REJECTED: XCircle,
  } as const;

  const handleRespond = async () => {
    if (!response.trim()) return;

    setIsResponding(true);
    const success = await onRespond(complaint.id, response);
    setIsResponding(false);

    if (success) {
      setResponse("");
      setShowResponseForm(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    onUpdateStatus(complaint.id, newStatus as Complaint["status"]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-white border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center">
            <MessageSquare className="mr-3 h-6 w-6 text-orange-600" />
            Complaint Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title and Priority */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {complaint.title}
            </h3>
            <div className="flex items-center space-x-3">
              <Badge className={priorityColors[complaint.priority]}>
                <AlertTriangle className="mr-1 h-3 w-3" />
                {complaint.priority}
              </Badge>
              <Badge className={statusColors[complaint.status]}>
                {React.createElement(statusIcons[complaint.status], {
                  className: "mr-1 h-3 w-3",
                })}
                {complaint.status.replace("_", " ")}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Resident and Apartment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 flex items-center">
                <User className="mr-2 h-4 w-4" />
                Resident
              </Label>
              <p className="mt-1 text-slate-900">{complaint.resident.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Apartment
              </Label>
              <p className="mt-1 text-slate-900">
                Apt {complaint.appartement.number} -{" "}
                {complaint.appartement.immeuble.name}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Created
              </Label>
              <p className="mt-1 text-slate-900">
                {format(
                  new Date(complaint.created_at),
                  "MMM dd, yyyy 'at' HH:mm"
                )}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Last Updated
              </Label>
              <p className="mt-1 text-slate-900">
                {format(
                  new Date(complaint.updated_at),
                  "MMM dd, yyyy 'at' HH:mm"
                )}
              </p>
            </div>
          </div>

          <Separator />

          {/* Content */}
          <div>
            <Label className="text-sm font-medium text-slate-700">
              Complaint Content
            </Label>
            <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-900 whitespace-pre-wrap">
                {complaint.content}
              </p>
            </div>
          </div>

          {/* Response */}
          <div>
            <Label className="text-sm font-medium text-slate-700 flex items-center">
              <Reply className="mr-2 h-4 w-4" />
              Response
            </Label>
            {complaint.response ? (
              <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-slate-900 whitespace-pre-wrap">
                  {complaint.response}
                </p>
              </div>
            ) : (
              <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-500 italic">No response yet</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Status Update */}
          <div>
            <Label className="text-sm font-medium text-slate-700">
              Update Status
            </Label>
            <Select
              value={complaint.status}
              onValueChange={handleStatusChange}
              disabled={
                complaint.status === "RESOLVED" ||
                complaint.status === "REJECTED"
              }
            >
              <SelectTrigger className="mt-2 border-slate-200 focus:border-orange-500 focus:ring-orange-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Response Form */}
          {complaint.status !== "RESOLVED" &&
            complaint.status !== "REJECTED" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Add Response
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResponseForm(!showResponseForm)}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    {showResponseForm ? "Cancel" : "Respond"}
                  </Button>
                </div>

                {showResponseForm && (
                  <div className="space-y-3">
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Type your response here..."
                      className="border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                      rows={4}
                    />
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleRespond}
                        disabled={!response.trim() || isResponding}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        {isResponding ? "Sending..." : "Send Response"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowResponseForm(false);
                          setResponse("");
                        }}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>

        <DialogFooter className="flex space-x-3 pt-6">
          <div className="flex-1">
            {complaint.status !== "RESOLVED" &&
              complaint.status !== "REJECTED" && (
                <Button
                  variant="outline"
                  onClick={() => onEdit(complaint)}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Edit Complaint
                </Button>
              )}
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(complaint)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
