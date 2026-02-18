import React, { useState } from "react";
import SyndicLayout from "@/layouts/SyndicLayout";
import { ResidentsHeader } from "@/components/residents/ResidentsHeader";
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
    clearError,
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
    <SyndicLayout>
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="p-6">
        <ResidentsHeader onCreateResident={handleCreateResident} />
        <ResidentsStats stats={stats} loading={loading} />
        <ResidentsFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
        />
        <ResidentsTable
          residents={residents}
          loading={loading}
          onEdit={handleEditResident}
          onDelete={handleDeleteResident}
        />
      </div>

      {/* Modal */}
      <ResidentsModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingResident={editingResident}
        loading={modalLoading}
      />
    </SyndicLayout>
  );
};

export default ResidentsPage;
