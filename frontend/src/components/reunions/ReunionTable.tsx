import { Calendar, MapPin, Clock, CalendarDays, Building } from "lucide-react";
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
import type { Reunion } from "../../types/reunion";
import { format } from "date-fns";

interface ReunionTableProps {
  reunions: Reunion[];
  loading: boolean;
  onEditReunion: (reunionId: number) => void;
  onDeleteReunion: (reunionId: number) => void;
  onViewDetails: (reunionId: number) => void;
}

export function ReunionTable({
  reunions,
  loading,
  onEditReunion,
  onDeleteReunion: _onDeleteReunion,
  onViewDetails,
}: ReunionTableProps) {
  const statusVariant = {
    SCHEDULED: "default",
    COMPLETED: "outline",
    CANCELLED: "destructive",
  } as const;

  // Ensure reunions is an array
  const reunionsArray = Array.isArray(reunions) ? reunions : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-900 pl-5">
              Reunion
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Date & Time
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Location
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Building
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Status
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
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-500"></div>
                  <span>Loading...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : reunionsArray.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-slate-600"
              >
                <div className="flex flex-col items-center space-y-2">
                  <CalendarDays className="h-8 w-8 text-slate-400" />
                  <span>No reunions found</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            reunionsArray.map((reunion) => (
              <TableRow
                key={reunion.id}
                className="hover:bg-slate-50 border-b border-slate-100"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {reunion.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {reunion.topic.length > 50
                          ? `${reunion.topic.substring(0, 50)}...`
                          : reunion.topic}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-slate-400" />
                    <div>
                      <div className="text-slate-900">
                        {format(new Date(reunion.date_time), "MMM dd, yyyy")}
                      </div>
                      <div className="text-xs text-slate-500">
                        {format(new Date(reunion.date_time), "h:mm a")}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                    <div className="text-slate-900">{reunion.location}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4 text-slate-400" />
                    <div className="text-slate-900">
                      {reunion.building_name}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant[reunion.status]}
                    className={`${
                      reunion.status === "SCHEDULED"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : reunion.status === "COMPLETED"
                        ? "bg-gray-100 text-gray-700 border-gray-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    {reunion.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(reunion.id)}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      View
                    </Button>
                    {reunion.status !== "COMPLETED" &&
                      reunion.status !== "CANCELLED" && (
                        <Button
                          size="sm"
                          onClick={() => onEditReunion(reunion.id)}
                          className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
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
