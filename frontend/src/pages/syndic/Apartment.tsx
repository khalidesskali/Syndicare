import React, { useState } from "react";
import SyndicLayout from "@/layouts/SyndicLayout";
import { ApartmentHeader } from "@/components/apartments/ApartmentHeader";
import { ApartmentStats as ApartmentStatsComponent } from "@/components/apartments/ApartmentStats";
import { ApartmentFilters } from "@/components/apartments/ApartmentFilters";
import { ApartmentTable } from "@/components/apartments/ApartmentTable";
import { ApartmentCreateModal } from "@/components/apartments/ApartmentCreateModal";
import { ApartmentEditModal } from "@/components/apartments/ApartmentEditModal";
import { ApartmentDetailsModal } from "@/components/apartments/ApartmentDetailsModal";
import { ApartmentAssignResidentModal } from "@/components/apartments/ApartmentAssignResidentModal";
import { SuccessMessage } from "@/components/ui/success-message";
import { ErrorMessage } from "@/components/ui/error-message";
import { useApartment } from "../../hooks/useApartment";
import type { Apartment } from "../../types/apartment";
import { useBuilding } from "@/hooks/useBuilding";

const ApartmentPage: React.FC = () => {
  const {
    apartments,
    stats,
    loading,
    error,
    successMessage,
    searchTerm,
    buildingFilter,
    occupancyFilter,
    setSearchTerm,
    setBuildingFilter,
    setOccupancyFilter,
    createApartment,
    deleteApartment,
    assignResident,
    removeResident,
    clearMessages,
    refetch,
  } = useApartment();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignResidentModal, setShowAssignResidentModal] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null,
  );
  const [modalLoading, setModalLoading] = useState(false);

  const { buildings } = useBuilding();

  // Modal action handlers
  const handleCreateApartment = () => {
    setShowCreateModal(true);
  };

  const handleEditApartment = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setShowEditModal(true);
  };

  const handleDeleteApartment = async (apartment: Apartment) => {
    if (
      window.confirm(
        `Are you sure you want to delete apartment "${apartment.number}"?`,
      )
    ) {
      setModalLoading(true);
      const success = await deleteApartment(apartment.id);
      setModalLoading(false);

      if (success) {
        await refetch(); // Auto-refresh after successful deletion
        setShowDetailsModal(false);
      }
    }
  };

  const handleViewDetails = (apartmentId: number) => {
    const apartment = apartments.find((a) => a.id === apartmentId);
    if (apartment) {
      setSelectedApartment(apartment);
      setShowDetailsModal(true);
    }
  };

  const handleAssignResident = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setShowAssignResidentModal(true);
  };

  const handleRemoveResident = async (apartment: Apartment) => {
    if (
      window.confirm(
        `Are you sure you want to remove resident from apartment "${apartment.number}"?`,
      )
    ) {
      setModalLoading(true);
      const result = await removeResident(apartment.id);
      setModalLoading(false);

      if (result) {
        await refetch(); // Auto-refresh after successful resident removal
      }
    }
  };

  const handleSearch = () => {
    // Search is handled by the reactive hook
  };

  // Modal form handlers
  const handleCreateSubmit = async (data: any) => {
    setModalLoading(true);
    const result = await createApartment(data);
    setModalLoading(false);

    if (result) {
      await refetch(); // Auto-refresh after successful creation
      setShowCreateModal(false);
      return true;
    }
    return false;
  };

  const handleAssignResidentSubmit = async (
    apartmentId: number,
    residentId: number,
  ) => {
    setModalLoading(true);
    const result = await assignResident(apartmentId, residentId);
    setModalLoading(false);

    if (result) {
      await refetch(); // Auto-refresh after successful resident assignment
      setShowAssignResidentModal(false);
      setSelectedApartment(null);
      return true;
    }
    return false;
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDetailsModal(false);
    setShowAssignResidentModal(false);
    setSelectedApartment(null);
    clearMessages();
  };

  // Wrapper functions for table
  const handleEditApartmentFromTable = (apartmentId: number) => {
    const apartment = apartments.find((a) => a.id === apartmentId);
    if (apartment) {
      handleEditApartment(apartment);
    }
  };

  const handleDeleteApartmentFromTable = (apartmentId: number) => {
    const apartment = apartments.find((a) => a.id === apartmentId);
    if (apartment) {
      handleDeleteApartment(apartment);
    }
  };

  const handleViewDetailsFromTable = (apartmentId: number) => {
    handleViewDetails(apartmentId);
  };

  const handleAssignResidentFromTable = (apartmentId: number) => {
    const apartment = apartments.find((a) => a.id === apartmentId);
    if (apartment) {
      handleAssignResident(apartment);
    }
  };

  const handleRemoveResidentFromTable = (apartmentId: number) => {
    const apartment = apartments.find((a) => a.id === apartmentId);
    if (apartment) {
      handleRemoveResident(apartment);
    }
  };

  return (
    <SyndicLayout>
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6">
          <SuccessMessage message={successMessage} />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      <ApartmentHeader onCreateApartment={handleCreateApartment} />

      <ApartmentStatsComponent stats={stats} />

      <ApartmentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        buildingFilter={buildingFilter}
        onBuildingChange={setBuildingFilter}
        occupancyFilter={occupancyFilter}
        onOccupancyChange={setOccupancyFilter}
        onSearch={handleSearch}
        buildings={buildings}
      />

      <ApartmentTable
        apartments={apartments}
        loading={loading}
        onEditApartment={handleEditApartmentFromTable}
        onDeleteApartment={handleDeleteApartmentFromTable}
        onViewDetails={handleViewDetailsFromTable}
        onAssignResident={handleAssignResidentFromTable}
        onRemoveResident={handleRemoveResidentFromTable}
      />

      {/* Modals */}
      <ApartmentCreateModal
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        onCreateApartment={handleCreateSubmit}
        loading={modalLoading}
        buildings={buildings}
      />

      <ApartmentEditModal
        isOpen={showEditModal}
        onClose={handleCloseModals}
        loading={modalLoading}
        apartment={selectedApartment}
        buildings={buildings}
      />

      <ApartmentDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseModals}
        apartment={selectedApartment}
        onEdit={handleEditApartment}
        onDelete={handleDeleteApartment}
        onAssignResident={handleAssignResident}
        onRemoveResident={handleRemoveResident}
      />

      <ApartmentAssignResidentModal
        isOpen={showAssignResidentModal}
        onClose={handleCloseModals}
        onAssignResident={handleAssignResidentSubmit}
        loading={modalLoading}
        apartment={selectedApartment}
      />
    </SyndicLayout>
  );
};

export default ApartmentPage;
