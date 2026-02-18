import React, { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Eye, X, AlertCircle, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PendingPayment {
  id: number;
  amount: number;
  payment_method: "CASH" | "BANK_TRANSFER";
  reference?: string;
  notes?: string;
  payment_date: string;
  syndic: {
    id: number;
    user: {
      email: string;
      first_name: string;
      last_name: string;
    };
  };
  subscription?: {
    id: number;
    plan: {
      name: string;
    };
  };
}

const PaymentConfirmation: React.FC = () => {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    // TODO: Replace with actual API call to fetch pending payments
    const mockPayments: PendingPayment[] = [
      {
        id: 1,
        amount: 1000,
        payment_method: "CASH",
        reference: "CASH-001",
        notes: "Monthly subscription payment",
        payment_date: "2024-01-20",
        syndic: {
          id: 1,
          user: {
            email: "syndic1@example.com",
            first_name: "John",
            last_name: "Doe",
          },
        },
        subscription: {
          id: 1,
          plan: { name: "Premium Plan" },
        },
      },
      {
        id: 2,
        amount: 500,
        payment_method: "BANK_TRANSFER",
        reference: "BANK-002",
        notes: "Partial payment for subscription renewal",
        payment_date: "2024-01-21",
        syndic: {
          id: 2,
          user: {
            email: "syndic2@example.com",
            first_name: "Jane",
            last_name: "Smith",
          },
        },
        subscription: {
          id: 2,
          plan: { name: "Basic Plan" },
        },
      },
    ];
    setPendingPayments(mockPayments);
  }, []);

  const handleApprove = async (payment: PendingPayment) => {
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      console.log(`Approving payment: ${payment}`);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Remove from pending list
      setPendingPayments((prev) => prev.filter((p) => p.id !== payment.id));
      setSelectedPayment(null);
    } catch (error) {
      console.error("Payment approval failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual API call
      console.log("Rejecting payment:", {
        payment: selectedPayment,
        reason: rejectionReason,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Remove from pending list
      setPendingPayments((prev) =>
        prev.filter((p) => p.id !== selectedPayment?.id),
      );
      setSelectedPayment(null);
      setRejectionReason("");
      setShowRejectionForm(false);
    } catch (error) {
      console.error("Payment rejection failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    const methodIcons = {
      CASH: Banknote,
      BANK_TRANSFER: Banknote,
    };
    return methodIcons[method as keyof typeof methodIcons] || Banknote;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Payment Confirmation ✅
          </h1>
          <p className="text-slate-600">
            Review and confirm pending payments from syndics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {pendingPayments.length}
                </p>
                <p className="text-sm text-slate-600">Pending Payments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Payments List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Pending Payments
            </h2>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-500">
              <p>No pending payments to review.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {pendingPayments.map((payment) => {
                const MethodIcon = getMethodIcon(payment.payment_method);

                return (
                  <div key={payment.id} className="p-6 hover:bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Payment Info */}
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold">
                              {payment.syndic.user.first_name[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {payment.syndic.user.first_name}{" "}
                              {payment.syndic.user.last_name}
                            </p>
                            <p className="text-sm text-slate-600">
                              {payment.syndic.user.email}
                            </p>
                            {payment.subscription && (
                              <p className="text-sm text-blue-600">
                                Subscription: {payment.subscription.plan.name}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Amount:</span>
                            <span className="font-medium text-slate-900">
                              {payment.amount.toFixed(2)} DH
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Method:</span>
                            <div className="flex items-center space-x-2">
                              <MethodIcon className="h-4 w-4 text-slate-400" />
                              <span>
                                {payment.payment_method.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500">Date:</span>
                            <span className="font-medium text-slate-900">
                              {new Date(
                                payment.payment_date,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Reference:</span>
                            <span className="font-medium text-slate-900">
                              {payment.reference || "-"}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {payment.notes && (
                          <div>
                            <span className="text-slate-500">Notes:</span>
                            <p className="text-slate-700 bg-slate-50 p-2 rounded">
                              {payment.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          onClick={() => setSelectedPayment(payment)}
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Review Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Review Payment
                  </h2>
                  <Button
                    onClick={() => setSelectedPayment(null)}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Payment Summary */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-medium text-slate-900 mb-3">
                      Payment Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Syndic:</span>
                        <span className="font-medium text-slate-900">
                          {selectedPayment.syndic.user.first_name}{" "}
                          {selectedPayment.syndic.user.last_name}
                        </span>
                        <span className="text-slate-600">
                          ({selectedPayment.syndic.user.email})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Amount:</span>
                        <span className="font-medium text-slate-900">
                          {selectedPayment.amount.toFixed(2)} DH
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Method:</span>
                        <div className="flex items-center space-x-2">
                          {React.createElement(
                            getMethodIcon(selectedPayment.payment_method),
                            {
                              className: "h-4 w-4 text-slate-400",
                            },
                          )}
                          <span>
                            {selectedPayment.payment_method.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">Date:</span>
                        <span className="font-medium text-slate-900">
                          {new Date(
                            selectedPayment.payment_date,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedPayment.notes && (
                    <div>
                      <h3 className="font-medium text-slate-900 mb-2">Notes</h3>
                      <div className="bg-slate-50 p-3 rounded">
                        {selectedPayment.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rejection Form */}
                {!showRejectionForm ? (
                  <div className="space-y-4">
                    <Button
                      onClick={() => setShowRejectionForm(true)}
                      variant="destructive"
                      className="w-full"
                    >
                      Reject Payment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Label htmlFor="rejection_reason">Rejection Reason</Label>
                    <Textarea
                      id="rejection_reason"
                      placeholder="Please provide a reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="min-h-[80px]"
                    />
                    <div className="flex space-x-3 pt-2">
                      <Button
                        onClick={() => setShowRejectionForm(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleReject}
                        disabled={loading}
                        variant="destructive"
                        className="flex-1"
                      >
                        {loading ? "Processing..." : "Reject Payment"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Approve Button */}
              {!showRejectionForm && (
                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <Button
                    onClick={handleApprove}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading ? "Processing..." : "Approve Payment"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PaymentConfirmation;
