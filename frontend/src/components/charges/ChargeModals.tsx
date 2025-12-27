import { useState } from "react";
import { AddActionModal } from "@/components/common/AddActionModal";
import { EditActionModal } from "@/components/common/EditActionModal";
import { DeleteActionModal } from "@/components/common/DeleteActionModal";
import type { ActionModalConfig, DeleteModalConfig } from "@/types/common";
import type { Charge } from "@/types/charge";
import type { CreateChargeRequest, UpdateChargeRequest } from "@/types/charge";

interface ChargeModalsProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  showBulkModal: boolean;
  setShowBulkModal: (show: boolean) => void;
  selectedCharge: Charge | null;
  createCharge: (data: CreateChargeRequest) => Promise<Charge | null>;
  updateCharge: (
    id: number,
    data: UpdateChargeRequest
  ) => Promise<Charge | null>;
  deleteCharge: (id: number) => Promise<boolean>;
  bulkCreateCharges: (data: {
    building_id: number;
    description: string;
    due_date: string;
  }) => Promise<Charge[] | null>;
  buildings: Array<{ id: number; name: string }>;
  apartments: Array<{
    id: number;
    number: string;
    building_id: number;
    building_name: string;
  }>;
  onModalSuccess: () => void;
}

export function ChargeModals({
  showAddModal,
  setShowAddModal,
  showEditModal,
  setShowEditModal,
  showDeleteModal,
  setShowDeleteModal,
  showBulkModal,
  setShowBulkModal,
  selectedCharge,
  createCharge,
  updateCharge,
  deleteCharge,
  bulkCreateCharges,
  buildings,
  apartments,
  onModalSuccess,
}: ChargeModalsProps) {
  const [loading, setLoading] = useState(false);

  // Add charge configuration
  const addChargeConfig: ActionModalConfig = {
    title: "Add New Charge",
    description: "Create a new charge for an apartment",
    fields: [
      {
        name: "appartement",
        label: "Apartment",
        type: "select",
        required: true,
        options: apartments.map((apt) => ({
          value: apt.id.toString(),
          label: `${apt.building_name} - Apt ${apt.number}`,
        })),
      },
      {
        name: "description",
        label: "Description",
        type: "text",
        required: true,
        placeholder: "e.g., Monthly charge - December 2024",
        validation: {
          min: 3,
          max: 200,
        },
      },
      {
        name: "amount",
        label: "Amount",
        type: "number",
        required: true,
        placeholder: "500.00",
        validation: {
          min: 0.01,
          max: 999999.99,
        },
      },
      {
        name: "due_date",
        label: "Due Date",
        type: "date",
        required: true,
        validation: {
          custom: (value: string) => {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
              return "Due date must be today or in the future";
            }
            return null;
          },
        },
      },
    ],
    submitButtonText: "Add Charge",
    submitButtonVariant: "default",
    action: async (data) => {
      setLoading(true);
      try {
        const result = await createCharge({
          ...data,
          appartement: parseInt(data.appartement as string),
        } as CreateChargeRequest);
        if (result !== null) {
          onModalSuccess();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to create charge:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
  };

  // Edit charge configuration
  const editChargeConfig: ActionModalConfig = {
    title: "Edit Charge",
    description: "Update the charge information",
    fields: [
      {
        name: "appartement",
        label: "Apartment",
        type: "select",
        required: true,
        options: apartments.map((apt) => ({
          value: apt.id.toString(),
          label: `${apt.building_name} - Apt ${apt.number}`,
        })),
      },
      {
        name: "description",
        label: "Description",
        type: "text",
        required: true,
        placeholder: "e.g., Monthly charge - December 2024",
        validation: {
          min: 3,
          max: 200,
        },
      },
      {
        name: "amount",
        label: "Amount",
        type: "number",
        required: true,
        placeholder: "500.00",
        validation: {
          min: 0.01,
          max: 999999.99,
        },
      },
      {
        name: "due_date",
        label: "Due Date",
        type: "date",
        required: true,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "UNPAID", label: "Unpaid" },
          { value: "PAID", label: "Paid" },
          { value: "PARTIALLY_PAID", label: "Partially Paid" },
        ],
      },
      {
        name: "paid_amount",
        label: "Paid Amount",
        type: "number",
        required: false,
        placeholder: "0.00",
        validation: {
          min: 0,
          max: 999999.99,
        },
      },
      {
        name: "paid_date",
        label: "Paid Date",
        type: "date",
        required: false,
      },
    ],
    submitButtonText: "Update Charge",
    submitButtonVariant: "default",
    action: async (data) => {
      if (!selectedCharge) return false;

      setLoading(true);
      try {
        const result = await updateCharge(selectedCharge.id, {
          ...data,
          appartement: parseInt(data.appartement as string),
        } as UpdateChargeRequest);
        if (result !== null) {
          onModalSuccess();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to update charge:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
  };

  // Bulk create configuration
  const bulkCreateConfig: ActionModalConfig = {
    title: "Bulk Create Charges",
    description: "Create charges for all apartments in a building",
    fields: [
      {
        name: "building_id",
        label: "Building",
        type: "select",
        required: true,
        options: buildings.map((building) => ({
          value: building.id.toString(),
          label: building.name,
        })),
      },
      {
        name: "description",
        label: "Description",
        type: "text",
        required: true,
        placeholder: "e.g., Monthly charge - December 2024",
        validation: {
          min: 3,
          max: 200,
        },
      },
      {
        name: "due_date",
        label: "Due Date",
        type: "date",
        required: true,
        validation: {
          custom: (value: string) => {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
              return "Due date must be today or in the future";
            }
            return null;
          },
        },
      },
    ],
    submitButtonText: "Create Charges",
    submitButtonVariant: "default",
    action: async (data) => {
      setLoading(true);
      try {
        await bulkCreateCharges({
          ...data,
          building_id: parseInt(data.building_id as string),
        } as { building_id: number; description: string; due_date: string });

        // If we reach here, the operation was successful
        onModalSuccess();
        return true;
      } catch (error) {
        console.error("Failed to bulk create charges:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
  };

  // Delete charge configuration
  const getDeleteChargeConfig = (charge: Charge): DeleteModalConfig => ({
    title: "Delete Charge",
    description:
      "Are you sure you want to delete this charge? This action cannot be undone and will remove all payment records associated with this charge.",
    itemName: `${charge.description} - ${charge.apartment_number} (${charge.building_name})`,
    action: async () => {
      setLoading(true);
      try {
        const success = await deleteCharge(charge.id);
        if (success) {
          onModalSuccess();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to delete charge:", error);
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
        config={addChargeConfig}
        loading={loading}
      />

      {/* Edit Modal */}
      <EditActionModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        config={editChargeConfig}
        loading={loading}
        initialData={selectedCharge || undefined}
      />

      {/* Delete Modal */}
      <DeleteActionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        config={
          selectedCharge
            ? getDeleteChargeConfig(selectedCharge)
            : {
                title: "",
                description: "",
                itemName: "",
                action: async () => false,
              }
        }
        loading={loading}
      />

      {/* Bulk Create Modal */}
      <AddActionModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        config={bulkCreateConfig}
        loading={loading}
      />
    </>
  );
}
