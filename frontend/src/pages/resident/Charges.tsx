import React, { useState, useEffect } from "react";
import { Filter, Eye, CreditCard } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { PaymentModal } from "@/components/residents/PaymentModal";
import { useResidentCharges } from "../../hooks/useResidentCharges";
import type { Charge } from "../../types/residentPortal";

const Charges: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<Charge["status"] | "ALL">(
    "ALL"
  );
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const {
    loading,
    successMessage,
    errorMessage,
    payingChargeId,
    fetchCharges,
    payCharge,
    getFilteredCharges,
    getChargeStats,
  } = useResidentCharges();

  useEffect(() => {
    fetchCharges();
  }, [fetchCharges]);

  const filteredCharges = getFilteredCharges(statusFilter);
  const stats = getChargeStats();

  const handlePayCharge = (charge: Charge) => {
    setSelectedCharge(charge);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    if (!selectedCharge) return false;
    return await payCharge(selectedCharge.id, paymentData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: Charge["status"]) => {
    const variants = {
      PAID: "default",
      UNPAID: "secondary",
      OVERDUE: "destructive",
    } as const;

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Charges</h1>
          <p className="text-slate-600 mt-2">Loading your charges...</p>
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

      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Charges</h1>
        <p className="text-slate-600 mt-2">
          View and manage all your charges and payments
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filter by Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(["ALL", "PAID", "UNPAID", "OVERDUE"] as const).map((status) => (
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

      {/* Charges Table */}
      <Card>
        <CardHeader>
          <CardTitle>Charges</CardTitle>
          <CardDescription>
            {filteredCharges.length} charge
            {filteredCharges.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">
                    Description
                  </th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">
                    Due Date
                  </th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">
                    Reference
                  </th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCharges.map((charge) => (
                  <tr key={charge.id} className="border-b hover:bg-slate-50">
                    <td className="p-2 text-sm font-medium">
                      {charge.description}
                    </td>
                    <td className="p-2 text-sm font-semibold">
                      {charge.amount} MAD
                    </td>
                    <td className="p-2 text-sm">
                      {formatDate(charge.due_date)}
                    </td>
                    <td className="p-2 text-sm">
                      {getStatusBadge(charge.status)}
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {charge.reference}
                    </td>
                    <td className="p-2 text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:text-blue-700 hover:bg-blue-50 bg-blue-50 text-blue-700"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View Details
                        </Button>
                        {charge.status !== "PAID" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePayCharge(charge)}
                            disabled={payingChargeId === charge.id}
                            className="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
                          >
                            <CreditCard className="mr-1 h-3 w-3" />
                            {payingChargeId === charge.id
                              ? "Processing..."
                              : "Pay"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCharges.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No charges found for the selected filter.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Charges</p>
              <p className="text-2xl font-bold">{stats.totalAmount} MAD</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Unpaid Amount</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.unpaidAmount} MAD
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.paidAmount} MAD
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <PaymentModal
        charge={selectedCharge}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPayment={handlePaymentSubmit}
        isProcessing={payingChargeId !== null}
      />
    </div>
  );
};

export default Charges;
