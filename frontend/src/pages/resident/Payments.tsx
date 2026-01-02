import React, { useState, useEffect } from "react";
import { CreditCard, Banknote, Building2, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useResidentPayments } from "../../hooks/useResidentPayments";
import type { Payment } from "../../api/residentPayments";

const Payments: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<Payment["status"] | "ALL">(
    "ALL"
  );

  const { payments, loading, successMessage, errorMessage, fetchPayments } =
    useResidentPayments();

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments =
    statusFilter === "ALL"
      ? payments || []
      : (payments || []).filter((payment) => payment.status === statusFilter);

  const getPaymentStatusBadge = (status: Payment["status"]) => {
    const variants = {
      PENDING: "secondary",
      CONFIRMED: "default",
      REJECTED: "destructive",
      REFUNDED: "outline",
    } as const;

    const colors = {
      PENDING: "text-yellow-700",
      CONFIRMED: "text-green-700",
      REJECTED: "text-red-700",
      REFUNDED: "text-blue-700",
    } as const;

    return (
      <Badge variant={variants[status]} className={`${colors[status]}`}>
        {status}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method: Payment["payment_method"]) => {
    const icons = {
      CREDIT_CARD: CreditCard,
      BANK_TRANSFER: Building2,
      CASH: Banknote,
      CHECK: FileText,
    };
    return icons[method];
  };

  const getPaymentMethodBadge = (method: Payment["payment_method"]) => {
    const variants = {
      CREDIT_CARD: "default",
      BANK_TRANSFER: "secondary",
      CASH: "outline",
      CHECK: "destructive",
      PENDING: "secondary",
      CONFIRMED: "default",
      REJECTED: "destructive",
    } as const;

    const Icon = getPaymentMethodIcon(method);

    return (
      <Badge variant={variants[method]} className="flex items-center">
        <Icon className="h-3 w-3 mr-1" />
        {method.replace("_", " ")}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);

      // Check if the date is invalid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string:", dateString);
        return "Invalid Date";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Invalid Date";
    }
  };

  const totalPaid = (payments || []).reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Payments</h1>
          <p className="text-slate-600 mt-2">Loading your payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {successMessage && (
        <Alert>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Payments</h1>
          <p className="text-slate-600 mt-2">
            View your payment history and transaction details
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">Filter by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(
              ["ALL", "PENDING", "CONFIRMED", "REJECTED", "REFUNDED"] as const
            ).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => setStatusFilter(status)}
                size="sm"
                className={
                  statusFilter === status
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : ""
                }
              >
                {status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium">
              Total Paid (All Time)
            </CardTitle>
            <CardDescription>Complete payment history</CardDescription>
          </div>
          <div className="bg-green-100 rounded-lg p-3">
            <CreditCard className="h-8 w-8 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalPaid.toFixed(2)} MAD</div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your recent payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">
                    Transaction ID
                  </th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">
                    Amount Paid
                  </th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">
                    Payment Date
                  </th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">
                    Payment Method
                  </th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-slate-50">
                    <td className="p-2 text-sm text-muted-foreground font-mono">
                      TXN-{payment.id.toString().padStart(6, "0")}
                    </td>
                    <td className="p-2 text-sm font-semibold">
                      {payment.amount} MAD
                    </td>
                    <td className="p-2 text-sm">
                      {formatDate(payment.paid_at)}
                    </td>
                    <td className="p-2 text-sm">
                      {getPaymentMethodBadge(payment.payment_method)}
                    </td>
                    <td className="p-2 text-sm">
                      {getPaymentStatusBadge(payment.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No payments found for the selected filter.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods Used</CardTitle>
          <CardDescription>Breakdown of payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["CREDIT_CARD", "BANK_TRANSFER", "CASH", "CHECK"] as const).map(
              (method) => {
                const methodPayments = (payments || []).filter(
                  (p) => p.payment_method === method
                );
                const total = methodPayments.reduce(
                  (sum, p) => sum + Number(p.amount),
                  0
                );
                const Icon = getPaymentMethodIcon(method);

                return (
                  <Card key={method}>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Icon className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-sm text-muted-foreground">
                          {method.replace("_", " ")}
                        </p>
                        <p className="text-lg font-bold">
                          {total.toFixed(2)} MAD
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {methodPayments.length} transactions
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;
