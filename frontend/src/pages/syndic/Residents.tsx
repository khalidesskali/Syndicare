import React, { useState } from "react";
import { ResidentsHeader } from "@/components/residents/ResidentsHeader";
import { ErrorMessage } from "@/components/ui/error-message";
import { ErrorState } from "@/components/ui/error-state";
import { ResidentsStats } from "@/components/residents/ResidentsStats";
import { ResidentsFilters } from "@/components/residents/ResidentsFilters";
import { ResidentsTable } from "@/components/residents/ResidentsTable";
import { ResidentsModal } from "@/components/residents/ResidentsModal";
import { useResidents } from "../../hooks/useResidents";
import type { Resident } from "../../types/resident";

const ResidentsPage: React.FC = () => {
  const {
    residents,
    stats,
    loading,
    error,
    searchTerm,
    statusFilter,
    setSearchTerm,
    setStatusFilter,
    createResident,
    updateResident,
    deleteResident,
    refreshData,
    clearError,
    allResidents,
  } = useResidents();

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Modal action handlers
  const handleCreateResident = () => {
    setEditingResident(null);
    setShowModal(true);
  };

  const handleEditResident = (resident: Resident) => {
    setEditingResident(resident);
    setShowModal(true);
  };

  const handleDeleteResident = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this resident?")) {
      try {
        await deleteResident(id);
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleModalSubmit = async (data: any) => {
    setModalLoading(true);
    try {
      if (editingResident) {
        await updateResident(editingResident.id, data);
      } else {
        await createResident(data);
      }
      setShowModal(false);
      setEditingResident(null);
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingResident(null);
    clearError();
  };

  return (
    <>
      {/* Error Display */}
      {error && allResidents.length > 0 && (
        <ErrorMessage message={error} onClose={clearError} />
      )}

      {error && allResidents.length === 0 && !loading ? (
        <ErrorState
          message={error}
          onRetry={refreshData}
          errorType={
            error.toLowerCase().includes("network") ||
            error.toLowerCase().includes("fetch")
              ? "network"
              : "server"
          }
        />
      ) : (
        <div className="p-6">
          <ResidentsHeader
            onCreateResident={handleCreateResident}
            loading={loading}
          />
          <ResidentsStats stats={stats} loading={loading} />
          <ResidentsFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            loading={loading}
          />
          <ResidentsTable
            residents={residents}
            loading={loading}
            onEdit={handleEditResident}
            onDelete={handleDeleteResident}
          />
        </div>
      )}

      {/* Modal */}
      <ResidentsModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingResident={editingResident}
        loading={modalLoading}
      />
    </>
  );
};

export default ResidentsPage;
