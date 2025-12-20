import React, { useState } from "react";
import SyndicLayout from "@/components/SyndicLayout";
import { ComplaintHeader } from "@/components/complaints/ComplaintHeader";
import { ComplaintStats } from "@/components/complaints/ComplaintStats";
import { ComplaintFilters } from "@/components/complaints/ComplaintFilters";
import { ComplaintTable } from "@/components/complaints/ComplaintTable";
import { ComplaintEditModal } from "@/components/complaints/ComplaintEditModal";
import { ComplaintDetailsModal } from "@/components/complaints/ComplaintDetailsModal";
import { useComplaint } from "../../hooks/useComplaint";
import type { Complaint } from "../../types/complaint";

const ComplaintPage: React.FC = () => {
  const {
    complaints,
    stats,
    loading,
    error,
    searchTerm,
    statusFilter,
    priorityFilter,
    buildingFilter,
    dateRange,
    setSearchTerm,
    setStatusFilter,
    setPriorityFilter,
    setBuildingFilter,
    setDateRange,
    updateComplaint,
    deleteComplaint,
    respondToComplaint,
    markAsResolved,
    markAsInProgress,
    rejectComplaint,
    clearError,
  } = useComplaint();

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [modalLoading, setModalLoading] = useState(false);

  // Modal action handlers
  const handleEditComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowEditModal(true);
  };

  const handleDeleteComplaint = (complaint: Complaint) => {
    if (
      window.confirm(`Are you sure you want to delete "${complaint.title}"?`)
    ) {
      setModalLoading(true);
      deleteComplaint(complaint.id).then((success) => {
        setModalLoading(false);
        if (success) {
          setShowDetailsModal(false);
        }
      });
    }
  };

  const handleEditComplaintFromTable = (complaintId: number) => {
    const complaint = complaints.find((c) => c.id === complaintId);
    if (complaint) {
      handleEditComplaint(complaint);
    }
  };

  const handleDeleteComplaintFromTable = (complaintId: number) => {
    const complaint = complaints.find((c) => c.id === complaintId);
    if (complaint) {
      handleDeleteComplaint(complaint);
    }
  };

  const handleViewDetails = (complaintId: number) => {
    const complaint = complaints.find((c) => c.id === complaintId);
    if (complaint) {
      setSelectedComplaint(complaint);
      setShowDetailsModal(true);
    }
  };

  const handleSearch = () => {
    // Search is handled by the reactive hook
  };

  // Modal form handlers
  const handleEditSubmit = async (data: any) => {
    if (!selectedComplaint) return false;

    setModalLoading(true);
    const result = await updateComplaint(selectedComplaint.id, data);
    setModalLoading(false);

    if (result) {
      setShowEditModal(false);
      setSelectedComplaint(null);
      return true;
    }
    return false;
  };

  const handleRespond = async (
    complaintId: number,
    response: string,
    status?: string
  ) => {
    setModalLoading(true);
    const result = await respondToComplaint(complaintId, response, status);
    setModalLoading(false);
    return result !== null;
  };

  const handleStatusUpdate = async (
    complaintId: number,
    status: Complaint["status"]
  ) => {
    setModalLoading(true);
    await updateComplaint(complaintId, { status });
    setModalLoading(false);
  };

  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowDetailsModal(false);
    setSelectedComplaint(null);
    clearError();
  };

  return (
    <SyndicLayout>
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <ComplaintHeader />

      <ComplaintStats stats={stats} />

      <ComplaintFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        buildingFilter={buildingFilter}
        onBuildingChange={setBuildingFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onSearch={handleSearch}
      />

      <ComplaintTable
        complaints={complaints}
        loading={loading}
        onEditComplaint={handleEditComplaintFromTable}
        onDeleteComplaint={handleDeleteComplaintFromTable}
        onViewDetails={handleViewDetails}
      />

      {/* Modals */}
      <ComplaintEditModal
        isOpen={showEditModal}
        onClose={handleCloseModals}
        onUpdateComplaint={handleEditSubmit}
        loading={modalLoading}
        complaint={selectedComplaint}
      />

      <ComplaintDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseModals}
        complaint={selectedComplaint}
        onEdit={handleEditComplaint}
        onDelete={handleDeleteComplaint}
        onUpdateStatus={handleStatusUpdate}
        onRespond={handleRespond}
      />
    </SyndicLayout>
  );
};

export default ComplaintPage;
