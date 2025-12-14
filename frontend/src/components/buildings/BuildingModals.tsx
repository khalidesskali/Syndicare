import { useState } from "react";
import { AddActionModal } from "@/components/common/AddActionModal";
import { EditActionModal } from "@/components/common/EditActionModal";
import { DeleteActionModal } from "@/components/common/DeleteActionModal";
import type { ActionModalConfig, DeleteModalConfig } from "@/types/common";
import type { Building } from "@/types/building";
import type { CreateBuildingRequest } from "@/api/buildings";

interface BuildingModalsProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  selectedBuilding: Building | null;
  createBuilding: (data: CreateBuildingRequest) => Promise<Building | null>;
  updateBuilding: (
    id: number,
    data: Partial<CreateBuildingRequest>
  ) => Promise<Building | null>;
  deleteBuilding: (id: number) => Promise<boolean>;
}

export function BuildingModals({
  showAddModal,
  setShowAddModal,
  showEditModal,
  setShowEditModal,
  showDeleteModal,
  setShowDeleteModal,
  selectedBuilding,
  createBuilding,
  updateBuilding,
  deleteBuilding,
}: BuildingModalsProps) {
  const [loading, setLoading] = useState(false);

  // Add building configuration
  const addBuildingConfig: ActionModalConfig = {
    title: "Add New Building",
    description: "Register a new building in your property management system",
    fields: [
      {
        name: "name",
        label: "Building Name",
        type: "text",
        required: true,
        placeholder: "e.g., Al Wafa Building",
        validation: {
          min: 3,
          max: 100,
        },
      },
      {
        name: "address",
        label: "Address",
        type: "text",
        required: true,
        placeholder: "e.g., 123 Rue Mohammed V, Casablanca",
        validation: {
          min: 10,
          max: 200,
        },
      },
      {
        name: "total_apartments",
        label: "Total Apartments",
        type: "number",
        required: true,
        placeholder: "24",
        validation: {
          min: 1,
          max: 1000,
        },
      },
      {
        name: "year_built",
        label: "Year Built",
        type: "number",
        required: true,
        placeholder: "2018",
        validation: {
          min: 1900,
          max: new Date().getFullYear(),
        },
      },
      {
        name: "floors",
        label: "Number of Floors",
        type: "number",
        required: true,
        placeholder: "8",
        validation: {
          min: 1,
          max: 100,
        },
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        defaultValue: "active",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "maintenance", label: "Under Maintenance" },
        ],
      },
    ],
    submitButtonText: "Add Building",
    submitButtonVariant: "default",
    action: async (data) => {
      setLoading(true);
      try {
        const result = await createBuilding(data as CreateBuildingRequest);
        return result !== null;
      } catch (error) {
        console.error("Failed to create building:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
  };

  // Edit building configuration
  const editBuildingConfig: ActionModalConfig = {
    title: "Edit Building",
    description: "Update the building information",
    fields: [
      {
        name: "name",
        label: "Building Name",
        type: "text",
        required: true,
        placeholder: "e.g., Al Wafa Building",
        validation: {
          min: 3,
          max: 100,
        },
      },
      {
        name: "address",
        label: "Address",
        type: "text",
        required: true,
        placeholder: "e.g., 123 Rue Mohammed V, Casablanca",
        validation: {
          min: 10,
          max: 200,
        },
      },
      {
        name: "total_apartments",
        label: "Total Apartments",
        type: "number",
        required: true,
        placeholder: "24",
        validation: {
          min: 1,
          max: 1000,
        },
      },
      {
        name: "occupied_apartments",
        label: "Occupied Apartments",
        type: "number",
        required: false,
        placeholder: "20",
        validation: {
          min: 0,
        },
      },
      {
        name: "year_built",
        label: "Year Built",
        type: "number",
        required: true,
        placeholder: "2018",
        validation: {
          min: 1900,
          max: new Date().getFullYear(),
        },
      },
      {
        name: "floors",
        label: "Number of Floors",
        type: "number",
        required: true,
        placeholder: "8",
        validation: {
          min: 1,
          max: 100,
        },
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "maintenance", label: "Under Maintenance" },
        ],
      },
    ],
    submitButtonText: "Update Building",
    submitButtonVariant: "default",
    action: async (data) => {
      if (!selectedBuilding) return false;

      setLoading(true);
      try {
        const result = await updateBuilding(selectedBuilding.id, data);
        return result !== null;
      } catch (error) {
        console.error("Failed to update building:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
  };

  // Delete building configuration
  const getDeleteBuildingConfig = (building: Building): DeleteModalConfig => ({
    title: "Delete Building",
    description:
      "Are you sure you want to delete this building? This action cannot be undone and will also delete all associated data.",
    itemName: `${building.name} - ${building.address}`,
    confirmText: "DELETE",
    action: async () => {
      setLoading(true);
      try {
        const success = await deleteBuilding(building.id);
        return success;
      } catch (error) {
        console.error("Failed to delete building:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      {/* Add Modal */}
      <AddActionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        config={addBuildingConfig}
        loading={loading}
      />

      {/* Edit Modal */}
      <EditActionModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        config={editBuildingConfig}
        loading={loading}
        initialData={selectedBuilding || undefined}
      />

      {/* Delete Modal */}
      {selectedBuilding && (
        <DeleteActionModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          config={getDeleteBuildingConfig(selectedBuilding)}
          loading={loading}
        />
      )}
    </>
  );
}
