import { format } from "date-fns";
import { Eye, Check, X, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SyndicPayment } from "@/api/syndicPayments";

interface PaymentTableProps {
  payments: SyndicPayment[];
  loading: boolean;
  onViewDetails: (payment: SyndicPayment) => void;
  onConfirmPayment: (paymentId: number) => void;
  onRejectPayment: (payment: SyndicPayment) => void;
  actionLoading: boolean;
  filters: {
    searchTerm: string;
    status: string;
    payment_method: string;
  };
}

const paymentMethodIcons = {
  CASH: "💵",
  BANK_TRANSFER: "🏦",
};

export function PaymentTable({
  payments,
  loading,
  onViewDetails,
  onConfirmPayment,
  onRejectPayment,
  actionLoading,
  filters,
}: PaymentTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Apartment</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4 animate-spin" />
                    <span>Loading payments...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                    <div className="text-4xl">💳</div>
                    <p className="text-sm">No payments found</p>
                    <p className="text-xs">
                      {filters.searchTerm ||
                      filters.status ||
                      filters.payment_method
                        ? "Try adjusting your search or filters"
                        : "No resident payments available"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="font-medium">
                      {payment.apartment_number || payment.appartement}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {payment.amount} MAD
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {
                          paymentMethodIcons[
                            payment.payment_method as keyof typeof paymentMethodIcons
                          ]
                        }
                      </span>
                      <span className="text-sm">
                        {payment.payment_method.replace("_", " ")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {payment.paid_at
                      ? format(new Date(payment.paid_at), "MMM d, yyyy")
                      : format(new Date(payment.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "PENDING"
                          ? "secondary"
                          : payment.status === "CONFIRMED"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {payment.status.charAt(0) +
                        payment.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onViewDetails(payment)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {payment.status === "PENDING" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onConfirmPayment(payment.id)}
                              disabled={actionLoading}
                              className="text-green-600 focus:text-green-600"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Confirm Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onRejectPayment(payment)}
                              disabled={actionLoading}
                              className="text-red-600 focus:text-red-600"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Reject Payment
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
