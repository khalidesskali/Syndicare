import React, { useState } from "react";
import { Plus } from "lucide-react";
import SyndicLayout from "../../components/SyndicLayout";
import { BuildingModals } from "../../components/buildings/BuildingModals";
import { BuildingStats } from "../../components/buildings/BuildingStats";
import { BuildingFilters } from "../../components/buildings/BuildingFilters";
import { BuildingTable } from "../../components/buildings/BuildingTable";
import { SuccessMessage } from "../../components/ui/success-message";
import { ErrorMessage } from "../../components/ui/error-message";
import { useBuilding } from "../../hooks/useBuilding";
import type { Building } from "../../types/building";

const Buildings: React.FC = () => {
  const {
    buildings,
    stats,
    loading,
    searchTerm,
    statusFilter,
    dateRange,
    setSearchTerm,
    setStatusFilter,
    setDateRange,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    refetch,
    successMessage,
    errorMessage,
  } = useBuilding();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );

  // Action handlers
  const handleEditBuilding = (building: Building) => {
    setSelectedBuilding(building);
    setShowEditModal(true);
  };

  const handleDeleteBuilding = (building: Building) => {
    setSelectedBuilding(building);
    setShowDeleteModal(true);
  };

  const handleFilter = () => {
    refetch();
  };

  const handleClearFilters = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <SyndicLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Buildings Management
            </h2>
            <p className="text-slate-600 mt-1">
              Manage your properties and track occupancy
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Building</span>
          </button>
        </div>

        {/* Stats Cards */}
        <BuildingStats stats={stats} />

        {/* Search and Filters */}
        <BuildingFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onFilter={handleFilter}
          onClear={handleClearFilters}
        />

        {/* Buildings Table */}
        <BuildingTable
          buildings={buildings}
          onEdit={handleEditBuilding}
          onDelete={handleDeleteBuilding}
        />
      </div>

      {/* Building Modals */}
      <BuildingModals
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        selectedBuilding={selectedBuilding}
        createBuilding={createBuilding}
        updateBuilding={updateBuilding}
        deleteBuilding={deleteBuilding}
      />
      {/* Success and Error Messages */}
      {successMessage && <SuccessMessage message={successMessage} />}
      {errorMessage && <ErrorMessage message={errorMessage} />}
    </SyndicLayout>
  );
};

export default Buildings;
