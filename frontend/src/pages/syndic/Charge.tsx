import React, { useState, useCallback, useEffect } from "react";
import SyndicLayout from "@/layouts/SyndicLayout";
import { ChargeHeader } from "@/components/charges/ChargeHeader";
import { ChargeStats } from "@/components/charges/ChargeStats";
import { ChargeFilters } from "@/components/charges/ChargeFilters";
import { ChargeTable } from "@/components/charges/ChargeTable";
import { ChargeModals } from "@/components/charges/ChargeModals";
import { ChargeSkeleton } from "@/components/charges/ChargeSkeleton";
import { SuccessMessage } from "@/components/ui/success-message";
import { ErrorMessage } from "@/components/ui/error-message";
import { useCharge } from "@/hooks/useCharge";
import type { Charge } from "@/types/charge";
import { useBuilding } from "@/hooks/useBuilding";
import { useApartment } from "@/hooks/useApartment";

const Charge: React.FC = () => {
  const {
    charges,
    stats,
    loading,
    successMessage,
    errorMessage,
    createCharge,
    updateCharge,
    deleteCharge,
    bulkCreateCharges,
    fetchFilteredCharges,
    refetchStats,
    clearError,
  } = useCharge();

  const { buildings } = useBuilding();
  const { apartments } = useApartment();

  // Transform apartments to match ChargeModals expected structure
  const transformedApartments = apartments.map((apt) => ({
    id: apt.id,
    number: apt.number,
    building_id: apt.immeuble, // Map immeuble to building_id
    building_name: apt.building_name,
  }));

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState<number | undefined>();
  const [apartmentFilter, setApartmentFilter] = useState<number | undefined>();
  const [overdueFilter, setOverdueFilter] = useState(false);

  const handleDeleteCharge = (charge: Charge) => {
    setSelectedCharge(charge);
    setShowDeleteModal(true);
  };

  const handleEditCharge = (charge: Charge) => {
    setSelectedCharge(charge);
    setShowEditModal(true);
  };

  const handleBulkCreate = () => {
    setShowBulkModal(true);
  };

  const handleCreateCharge = () => {
    setShowAddModal(true);
  };

  const handleClearFilters = async () => {
    setSearchTerm("");
    setStatusFilter("all");
    setBuildingFilter(undefined);
    setApartmentFilter(undefined);
    setOverdueFilter(false);
    await fetchFilteredCharges({});
  };

  const handleModalSuccess = async () => {
    // Refetch charges after any successful modal operation
    await fetchFilteredCharges({
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: searchTerm.trim() || undefined,
      building_id: buildingFilter,
      apartment_id: apartmentFilter,
      overdue: overdueFilter || undefined,
    });
    await refetchStats();
  };

  const handleSearch = useCallback(async () => {
    const filters = {
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: searchTerm.trim() || undefined,
      building_id: buildingFilter,
      apartment_id: apartmentFilter,
      overdue: overdueFilter || undefined,
    };

    await fetchFilteredCharges(filters);
  }, [
    statusFilter,
    searchTerm,
    buildingFilter,
    apartmentFilter,
    overdueFilter,
    fetchFilteredCharges,
  ]);

  // Fetch initial data on mount
  useEffect(() => {
    fetchFilteredCharges({});
    refetchStats(); // Fetch stats for initial load
  }, [fetchFilteredCharges, refetchStats]);

  return (
    <SyndicLayout>
      {loading ? (
        <ChargeSkeleton />
      ) : (
        <>
          {/* Header */}
          <ChargeHeader
            onBulkCreate={handleBulkCreate}
            onCreateCharge={handleCreateCharge}
          />

          {/* Stats */}
          <ChargeStats stats={stats} />

          {/* Filters */}
          <ChargeFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            buildingFilter={buildingFilter}
            onBuildingChange={setBuildingFilter}
            apartmentFilter={apartmentFilter}
            onApartmentChange={setApartmentFilter}
            overdueFilter={overdueFilter}
            onOverdueChange={setOverdueFilter}
            buildings={buildings}
            apartments={transformedApartments}
            onSearch={handleSearch}
            onClearFilters={handleClearFilters}
          />

          {/* Table */}
          <ChargeTable
            charges={charges}
            loading={loading}
            onEditCharge={handleEditCharge}
            onDeleteCharge={handleDeleteCharge}
          />
        </>
      )}

      {/* Charge Modals */}
      <ChargeModals
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        showBulkModal={showBulkModal}
        setShowBulkModal={setShowBulkModal}
        selectedCharge={selectedCharge}
        createCharge={createCharge}
        updateCharge={updateCharge}
        deleteCharge={deleteCharge}
        bulkCreateCharges={bulkCreateCharges}
        buildings={buildings}
        apartments={transformedApartments}
        onModalSuccess={handleModalSuccess}
      />

      {/* Success and Error Messages */}
      {successMessage && <SuccessMessage message={successMessage} />}
      {errorMessage && (
        <ErrorMessage message={errorMessage} onClose={clearError} />
      )}
    </SyndicLayout>
  );
};

export default Charge;
