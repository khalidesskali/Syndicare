import { Building, Calendar, User, FileText } from "lucide-react";
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
import type { Charge } from "../../types/charge";
import { format } from "date-fns";

interface ChargeTableProps {
  charges: Charge[];
  loading: boolean;
  onMarkAsPaid: (chargeId: number) => void;
  onEditCharge: (charge: Charge) => void;
  onDeleteCharge: (charge: Charge) => void;
}

export function ChargeTable({
  charges,
  loading,
  onMarkAsPaid,
  onEditCharge,
  onDeleteCharge,
}: ChargeTableProps) {
  const statusVariant = {
    UNPAID: "destructive",
    PAID: "default",
    OVERDUE: "destructive",
    PARTIALLY_PAID: "secondary",
  } as const;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-900">
              Apartment
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Resident
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Description
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Amount
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Due Date
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Status
            </TableHead>
            <TableHead className="text-right font-semibold text-slate-900">
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
          ) : charges.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-slate-600"
              >
                <div className="flex flex-col items-center space-y-2">
                  <FileText className="h-8 w-8 text-slate-400" />
                  <span>No charges found</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            charges.map((charge) => (
              <TableRow
                key={charge.id}
                className="hover:bg-slate-50 border-b border-slate-100"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Building className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {charge.apartment_number}
                      </div>
                      <div className="text-xs text-slate-500">
                        {charge.building_name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {charge.resident_name || "N/A"}
                      </div>
                      {charge.resident_email && (
                        <div className="text-xs text-slate-500">
                          {charge.resident_email}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <div className="text-slate-900">{charge.description}</div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-slate-900">
                    DH {Number(charge.amount).toFixed(2)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                    <div className="text-slate-900">
                      {format(new Date(charge.due_date), "MMM dd, yyyy")}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant[charge.status]}
                    className={`${
                      charge.status === "PAID"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : charge.status === "UNPAID" ||
                          charge.status === "OVERDUE"
                        ? "bg-red-100 text-red-700 border-red-200"
                        : "bg-orange-100 text-orange-700 border-orange-200"
                    }`}
                  >
                    {charge.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {charge.status !== "PAID" && (
                      <Button
                        size="sm"
                        onClick={() => onMarkAsPaid(charge.id)}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                      >
                        Mark Paid
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditCharge(charge)}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteCharge(charge)}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
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
