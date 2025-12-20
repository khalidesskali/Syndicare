import React from "react";
import {
  MessageSquare,
  User,
  Home,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Complaint } from "../../types/complaint";
import { format } from "date-fns";

interface ComplaintTableProps {
  complaints: Complaint[];
  loading: boolean;
  onEditComplaint: (complaintId: number) => void;
  onDeleteComplaint: (complaintId: number) => void;
  onViewDetails: (complaintId: number) => void;
}

export function ComplaintTable({
  complaints,
  loading,
  onEditComplaint,
  onDeleteComplaint: _onDeleteComplaint,
  onViewDetails,
}: ComplaintTableProps) {
  const statusVariant = {
    PENDING: "default",
    IN_PROGRESS: "secondary",
    RESOLVED: "outline",
    REJECTED: "destructive",
  } as const;

  const priorityColors = {
    URGENT: "bg-red-100 text-red-700 border-red-200",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    LOW: "bg-green-100 text-green-700 border-green-200",
  } as const;

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
    RESOLVED: "bg-green-100 text-green-700 border-green-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
  } as const;

  const statusIcons = {
    PENDING: Clock,
    IN_PROGRESS: TrendingUp,
    RESOLVED: CheckCircle,
    REJECTED: XCircle,
  } as const;

  // Ensure complaints is an array
  const complaintsArray = Array.isArray(complaints) ? complaints : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-900 pl-5">
              Complaint
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Resident
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Apartment
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Priority
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Status
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Created
            </TableHead>
            <TableHead className="text-right font-semibold text-slate-900 pr-5">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-slate-600"
              >
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-500"></div>
                  <span>Loading...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : complaintsArray.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-slate-600"
              >
                <div className="flex flex-col items-center space-y-2">
                  <MessageSquare className="h-8 w-8 text-slate-400" />
                  <span>No complaints found</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            complaintsArray.map((complaint) => (
              <TableRow
                key={complaint.id}
                className="hover:bg-slate-50 border-b border-slate-100"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <MessageSquare className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {complaint.title}
                      </div>
                      <div className="text-xs text-slate-500 max-w-md truncate">
                        {complaint.content}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-slate-400" />
                    <div className="text-slate-900">
                      {complaint.resident.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Home className="mr-2 h-4 w-4 text-slate-400" />
                    <div>
                      <div className="text-slate-900">
                        Apt {complaint.appartement.number}
                      </div>
                      <div className="text-xs text-slate-500">
                        {complaint.appartement.immeuble.name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4 text-slate-400" />
                    <Badge
                      variant="outline"
                      className={priorityColors[complaint.priority]}
                    >
                      {complaint.priority}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {React.createElement(statusIcons[complaint.status], {
                      className: "mr-2 h-4 w-4 text-slate-400",
                    })}
                    <Badge
                      variant={statusVariant[complaint.status]}
                      className={statusColors[complaint.status]}
                    >
                      {complaint.status.replace("_", " ")}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-slate-900">
                    {format(new Date(complaint.created_at), "MMM dd, yyyy")}
                  </div>
                  <div className="text-xs text-slate-500">
                    {format(new Date(complaint.created_at), "HH:mm")}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(complaint.id)}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      View
                    </Button>
                    {complaint.status !== "RESOLVED" &&
                      complaint.status !== "REJECTED" && (
                        <Button
                          size="sm"
                          onClick={() => onEditComplaint(complaint.id)}
                          className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                        >
                          Edit
                        </Button>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
