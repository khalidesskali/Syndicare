import React, { useState } from "react";
import { useSyndicPayments } from "@/hooks/useSyndicPayments";
import { ErrorMessage } from "@/components/ui/error-message";
import { ErrorState } from "@/components/ui/error-state";
import type { SyndicPayment } from "@/api/syndicPayments";
import { PaymentFilters } from "../../components/payments/PaymentFilters";
import { PaymentTable } from "../../components/payments/PaymentTable";
import { PaymentDetailsModal } from "../../components/payments/PaymentDetailsModal";
import { PaymentRejectModal } from "../../components/payments/PaymentRejectModal";

const SyndicPayments: React.FC = () => {
  const {
    payments,
    loading,
    error,
    filters,
    setFilters,
    refreshPayments,
    confirmPayment,
    rejectPayment,
    clearError,
  } = useSyndicPayments();

  const [localError, setLocalError] = useState<string | null>(null);

  const [selectedPayment, setSelectedPayment] = useState<SyndicPayment | null>(
    null,
  );
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleConfirmPayment = async (paymentId: number) => {
    setActionLoading(true);
    try {
      await confirmPayment(paymentId);
    } catch (error: any) {
      setLocalError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment) return;

    setActionLoading(true);
    try {
      await rejectPayment(selectedPayment.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedPayment(null);
    } catch (error: any) {
      setLocalError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (payment: SyndicPayment) => {
    setSelectedPayment(payment);
    setShowRejectModal(true);
  };

  return (
    <>
      {/* Error Display */}
      {(error || localError) && payments.length > 0 && (
        <ErrorMessage
          message={error || localError || ""}
          onClose={() => {
            if (error) clearError();
            if (localError) setLocalError(null);
          }}
        />
      )}

      {error && payments.length === 0 && !loading ? (
        <ErrorState
          message={error}
          onRetry={refreshPayments}
          errorType={
            error.toLowerCase().includes("network") ||
            error.toLowerCase().includes("fetch")
              ? "network"
              : "server"
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Resident Payments
              </h1>
              <p className="text-muted-foreground">
                View and manage payments from residents
              </p>
            </div>
          </div>

          {/* Filters */}
          <PaymentFilters
            filters={filters}
            setFilters={setFilters}
            refreshPayments={refreshPayments}
            loading={loading}
          />

          {/* Payments Table */}
          <PaymentTable
            payments={payments}
            loading={loading}
            onViewDetails={setSelectedPayment}
            onConfirmPayment={handleConfirmPayment}
            onRejectPayment={openRejectModal}
            actionLoading={actionLoading}
            filters={filters}
          />

          {/* Payment Details Modal */}
          <PaymentDetailsModal
            payment={selectedPayment}
            onClose={() => setSelectedPayment(null)}
          />

          {/* Reject Payment Modal */}
          <PaymentRejectModal
            payment={selectedPayment}
            open={showRejectModal}
            onClose={() => {
              setShowRejectModal(false);
              setRejectReason("");
              setSelectedPayment(null);
            }}
            onReject={handleRejectPayment}
            reason={rejectReason}
            onReasonChange={setRejectReason}
            loading={actionLoading}
          />
        </div>
      )}
    </>
  );
};

export default SyndicPayments;
