import React, { useState } from "react";
import SyndicLayout from "@/components/SyndicLayout";
import { ReunionHeader } from "@/components/reunions/ReunionHeader";
import { ReunionStats as ReunionStatsComponent } from "@/components/reunions/ReunionStats";
import { ReunionFilters } from "@/components/reunions/ReunionFilters";
import { ReunionTable } from "@/components/reunions/ReunionTable";
import { ReunionCreateModal } from "@/components/reunions/ReunionCreateModal";
import { ReunionEditModal } from "@/components/reunions/ReunionEditModal";
import { ReunionDetailsModal } from "@/components/reunions/ReunionDetailsModal";
import { ReunionBulkCreateModal } from "@/components/reunions/ReunionBulkCreateModal";
import { useReunion } from "../../hooks/useReunion";
import { useBuilding } from "../../hooks/useBuilding";
import type { Reunion, UpdateReunionRequest } from "../../types/reunion";

const ReunionPage: React.FC = () => {
  const {
    reunions,
    stats,
    loading,
    error,
    searchTerm,
    statusFilter,
    buildingFilter,
    dateRange,
    setSearchTerm,
    setStatusFilter,
    setBuildingFilter,
    setDateRange,
    createReunion,
    updateReunion,
    deleteReunion,
    bulkCreateReunions,
    updateReunionStatus,
  } = useReunion();

  const { buildings, loading: buildingsLoading } = useBuilding();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [selectedReunion, setSelectedReunion] = useState<Reunion | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Modal action handlers
  const handleCreateReunion = () => {
    setShowCreateModal(true);
  };

  const handleScheduleMultiple = () => {
    setShowBulkCreateModal(true);
  };

  const handleEditReunion = (reunion: Reunion) => {
    setSelectedReunion(reunion);
    setShowEditModal(true);
  };

  const handleDeleteReunion = (reunion: Reunion) => {
    if (window.confirm(`Are you sure you want to delete "${reunion.title}"?`)) {
      setModalLoading(true);
      deleteReunion(reunion.id).then((success) => {
        setModalLoading(false);
        if (success) {
          setShowDetailsModal(false);
        }
      });
    }
  };

  const handleEditReunionFromTable = (reunionId: number) => {
    const reunion = reunions.find((r) => r.id === reunionId);
    if (reunion) {
      handleEditReunion(reunion);
    }
  };

  const handleDeleteReunionFromTable = (reunionId: number) => {
    const reunion = reunions.find((r) => r.id === reunionId);
    if (reunion) {
      handleDeleteReunion(reunion);
    }
  };

  const handleViewDetails = (reunionId: number) => {
    const reunion = reunions.find((r) => r.id === reunionId);
    if (reunion) {
      setSelectedReunion(reunion);
      setShowDetailsModal(true);
    }
  };

  // Modal form handlers
  const handleCreateSubmit = async (data: any) => {
    setModalLoading(true);
    const result = await createReunion(data);
    setModalLoading(false);

    if (result) {
      setShowCreateModal(false);
      return true;
    }
    return false;
  };

  const handleEditSubmit = async (id: number, data: UpdateReunionRequest) => {
    console.log("handleEditSubmit called with:", { id, data });
    console.log("data type:", typeof data);
    console.log("data keys:", Object.keys(data || {}));

    setModalLoading(true);
    const result = await updateReunion(id, data);
    setModalLoading(false);

    if (result) {
      setShowEditModal(false);
      setSelectedReunion(null);
      return true;
    }
    return false;
  };

  const handleBulkCreateSubmit = async (reunionsData: any[]) => {
    setModalLoading(true);
    const result = await bulkCreateReunions(reunionsData);
    setModalLoading(false);

    if (result) {
      setShowBulkCreateModal(false);
      return true;
    }
    return false;
  };

  const handleStatusUpdate = async (
    reunionId: number,
    status: Reunion["status"]
  ) => {
    setModalLoading(true);
    await updateReunionStatus(reunionId, status);
    setModalLoading(false);
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDetailsModal(false);
    setShowBulkCreateModal(false);
    setSelectedReunion(null);
    // clearError();
  };

  return (
    <SyndicLayout>
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-red-700">{error}</p>
            <button
              // onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <ReunionHeader
        onCreateReunion={handleCreateReunion}
        onScheduleMultiple={handleScheduleMultiple}
      />

      <ReunionStatsComponent stats={stats} />

      <ReunionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        buildingFilter={buildingFilter}
        onBuildingChange={setBuildingFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        buildings={buildings}
        buildingsLoading={buildingsLoading}
      />

      <ReunionTable
        reunions={reunions}
        loading={loading}
        onEditReunion={handleEditReunionFromTable}
        onDeleteReunion={handleDeleteReunionFromTable}
        onViewDetails={handleViewDetails}
      />

      {/* Modals */}
      <ReunionCreateModal
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        onCreateReunion={handleCreateSubmit}
        loading={modalLoading}
      />

      <ReunionEditModal
        isOpen={showEditModal}
        onClose={handleCloseModals}
        onUpdateReunion={handleEditSubmit}
        loading={modalLoading}
        reunion={selectedReunion}
      />

      <ReunionDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseModals}
        reunion={selectedReunion}
        onEdit={handleEditReunion}
        onDelete={handleDeleteReunion}
        onUpdateStatus={handleStatusUpdate}
      />

      <ReunionBulkCreateModal
        isOpen={showBulkCreateModal}
        onClose={handleCloseModals}
        onBulkCreate={handleBulkCreateSubmit}
        loading={modalLoading}
      />
    </SyndicLayout>
  );
};

export default ReunionPage;
