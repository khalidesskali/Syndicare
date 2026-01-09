import React, { useState } from "react";
import SyndicLayout from "@/components/SyndicLayout";
import { Banknote, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import usePayments from "@/hooks/usePayments";
import type { PaymentFormData } from "@/hooks/usePayments";

const PaymentManagement: React.FC = () => {
  const { payments, plans, loading, error, createPayment } = usePayments();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: "",
    payment_method: "BANK_TRANSFER",
    reference: "",
    notes: "",
    subscription_id: "",
    rib: "",
    payment_proof: undefined,
  });

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
    const plan = plans.find((p) => p.id.toString() === planId);
    if (plan) {
      setFormData((prev) => ({
        ...prev,
        subscription_id: planId,
        amount: plan.price.toString(),
      }));
    }
  };

  // Handle API errors
  if (error) {
    return (
      <SyndicLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </SyndicLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.amount ||
      !formData.payment_method ||
      !formData.subscription_id
    ) {
      alert("Please select a subscription plan");
      return;
    }

    // Validate payment proof (always required for digital tracking)
    if (!formData.payment_proof) {
      alert("Payment proof is required for all payments");
      return;
    }

    try {
      const success = await createPayment(formData);

      if (success) {
        // Reset form
        setSelectedPlan("");
        setFormData({
          amount: "",
          payment_method: "BANK_TRANSFER",
          reference: "",
          notes: "",
          subscription_id: "",
          rib: "",
          payment_proof: undefined,
        });
        setShowPaymentForm(false);
      }
    } catch (error) {
      console.error("Payment submission failed:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
      COMPLETED: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Completed",
      },
      FAILED: {
        color: "bg-red-100 text-red-800",
        icon: AlertCircle,
        label: "Failed",
      },
      REFUNDED: {
        color: "bg-gray-100 text-gray-800",
        icon: AlertCircle,
        label: "Refunded",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return config || statusConfig.PENDING;
  };

  return (
    <SyndicLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Payment Management 💳️
          </h1>
          <p className="text-slate-600">
            Make payments for your subscriptions and track payment history
          </p>
          <div className="mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  View Admin Bank Information
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Admin Bank Information</DialogTitle>
                  <DialogDescription>
                    Please use the following bank details for bank transfer
                    payments.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3">
                      Bank Transfer Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 font-medium">Bank:</span>
                        <span className="font-mono text-blue-900">
                          Attijariwafa Bank
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 font-medium">
                          Account Holder:
                        </span>
                        <span className="font-mono text-blue-900">
                          Syndic App Admin
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 font-medium">RIB:</span>
                        <span className="font-mono text-blue-900 text-xs">
                          007 780 0001234567000001 18
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 font-medium">IBAN:</span>
                        <span className="font-mono text-blue-900 text-xs">
                          MA64 007 780 0001234567000001 18
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      <strong>Important:</strong> In case of bank transfer
                      payment, please include your reference number in the
                      transfer description and keep the transaction receipt for
                      verification.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Make New Payment
            </h2>
            <Button
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              variant="outline"
              size="sm"
            >
              {showPaymentForm ? "Cancel" : "New Payment"}
            </Button>
          </div>

          {showPaymentForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subscription Plan */}
                <div className="space-y-2">
                  <Label htmlFor="subscription_plan">Subscription Plan *</Label>
                  <Select value={selectedPlan} onValueChange={handlePlanChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subscription plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{plan.name}</span>
                            <span className="text-sm text-gray-500">
                              {plan.price} DH - {plan.duration_days} days
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (DH) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="Amount will be auto-filled"
                    value={formData.amount}
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-600">
                    Amount is automatically set based on selected plan
                  </p>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <div className="flex items-center space-x-2 p-2 border rounded-lg bg-gray-50">
                    <Banknote className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700 font-medium">
                      Bank Transfer
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    All payments are processed via bank transfer for digital
                    tracking
                  </p>
                </div>

                {/* Admin Bank Information */}
                <div className="space-y-2 md:col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Admin Bank Information
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Bank:</span>
                        <span className="font-mono text-blue-900">
                          Attijariwafa Bank
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Account Holder:</span>
                        <span className="font-mono text-blue-900">
                          Syndic App Admin
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">RIB:</span>
                        <span className="font-mono text-blue-900">
                          007 780 0001234567000001 18
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">IBAN:</span>
                        <span className="font-mono text-blue-900">
                          MA64 007 780 0001234567000001 18
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reference */}
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input
                    id="reference"
                    placeholder="Transaction reference"
                    value={formData.reference}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reference: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes or comments"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                {/* Payment Proof */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="payment_proof">
                    Payment Proof
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      id="payment_proof"
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData((prev) => ({
                            ...prev,
                            payment_proof: file,
                          }));
                        }
                      }}
                      required
                      className="hidden"
                    />
                    <label
                      htmlFor="payment_proof"
                      className="cursor-pointer flex flex-col items-center justify-center text-center"
                    >
                      {formData.payment_proof ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">
                            {formData.payment_proof.name}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="text-gray-400 mb-2">
                            <svg
                              className="mx-auto h-12 w-12"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium text-blue-600">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, PDF, DOC, DOCX (MAX. 10MB)
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                  <p className="text-xs text-blue-600">
                    Upload payment proof (transaction receipt, screenshot, etc.)
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? "Processing..." : "Submit Payment"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Payment History
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Payment Proof
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payments.map((payment) => {
                  const statusConfig = getStatusBadge(payment.status);
                  const MethodIcon = Banknote;

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {payment.amount} DH
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <MethodIcon className="h-4 w-4 text-slate-400" />
                          <span>
                            {payment.payment_method.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge className={statusConfig.color}>
                          <div className="flex items-center space-x-1">
                            <statusConfig.icon className="h-3 w-3" />
                            <span>{statusConfig.label}</span>
                          </div>
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                        {payment.reference || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {payment.payment_proof ? (
                          <a
                            href={payment.payment_proof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline flex items-center space-x-1"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span>View</span>
                          </a>
                        ) : (
                          <span className="text-gray-400">No proof</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {payment.notes || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SyndicLayout>
  );
};

export default PaymentManagement;
