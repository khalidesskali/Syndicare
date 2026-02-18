import React, { useState } from "react";
import SyndicLayout from "../../layouts/SyndicLayout";
import { useSyndicPayments } from "@/hooks/useSyndicPayments";
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
  } = useSyndicPayments();

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
      alert(error.message);
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
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (payment: SyndicPayment) => {
    setSelectedPayment(payment);
    setShowRejectModal(true);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={refreshPayments}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <SyndicLayout>
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
    </SyndicLayout>
  );
};

export default SyndicPayments;
