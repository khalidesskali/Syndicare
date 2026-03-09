import React, { useState, useEffect } from "react";
import useSyndics from "@/hooks/useSyndics";
import type { Syndic, SyndicFilters, SyndicFormData } from "@/types/syndics";
import SyndicsHeader from "@/components/syndic/SyndicsHeader";
import SyndicsStats from "@/components/syndic/SyndicsStats";
import SyndicsFilters from "@/components/syndic/SyndicsFilters";
import SyndicsTable from "@/components/syndic/SyndicsTable";
import { FormModal } from "@/components/ui/form-modal";
import { editSyndicFields } from "@/components/syndic/SyndicsFormConfig";

const Syndics: React.FC = () => {
  const [filters, setFilters] = useState<Partial<SyndicFilters>>({
    status: "active",
    page: 1,
    page_size: 10,
    search: "",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedSyndic, setSelectedSyndic] = useState<Syndic | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    syndics,
    loading,
    error,
    pagination,
    fetchSyndics,
    stats,
    updateSyndic,
    deleteSyndic,
  } = useSyndics();

  useEffect(() => {
    fetchSyndics(filters);
  }, [filters, fetchSyndics]);

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleEdit = (syndic: Syndic) => {
    setSelectedSyndic(syndic);
    setIsEditModalOpen(true);
  };

  const handleDelete = (syndic: Syndic) => {
    setSelectedSyndic(syndic);
    setIsDeleteModalOpen(true);
  };

  const handleEditSyndic = async (data: Record<string, unknown>) => {
    if (!selectedSyndic?.id) {
      console.error("No syndic selected for editing");
      return false;
    }

    setIsSubmitting(true);
    try {
      await updateSyndic(selectedSyndic.id, data as Partial<SyndicFormData>);
      setIsEditModalOpen(false);
      await fetchSyndics(filters);
      return true;
    } catch (error) {
      console.error("Error editing syndic:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSyndic = async () => {
    if (!selectedSyndic?.id) {
      console.error("No syndic selected for deletion");
      return false;
    }

    setIsSubmitting(true);
    try {
      await deleteSyndic(selectedSyndic.id);
      setIsDeleteModalOpen(false);
      setSelectedSyndic(null);
      return true;
    } catch (error) {
      console.error("Error deleting syndic:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate time since creation
  const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1)
      return `${interval} year${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1)
      return `${interval} month${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1)
      return `${interval} hour${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1)
      return `${interval} minute${interval === 1 ? "" : "s"} ago`;

    return "Just now";
  };

  return (
    <>
      {/* Header */}
      <SyndicsHeader />

      {/* Stats Cards */}
      <SyndicsStats stats={stats} />

      {/* Filters & Search */}
      <SyndicsFilters
        filters={filters}
        onSearchChange={(value) =>
          setFilters((prev) => ({ ...prev, search: value, page: 1 }))
        }
        onStatusChange={(value) =>
          setFilters((prev) => ({ ...prev, status: value, page: 1 }))
        }
      />

      {/* Syndics Table */}
      <SyndicsTable
        syndics={syndics}
        loading={loading}
        error={error}
        pagination={pagination}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
        formatDate={formatDate}
        timeSince={timeSince}
      />

      {/* Edit Syndic Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Syndic"
        fields={editSyndicFields}
        initialData={selectedSyndic || {}}
        onSubmit={handleEditSyndic}
        loading={isSubmitting}
        submitText="Update Syndic"
        size="md"
      />

      {/* Delete Confirmation Modal */}
      <FormModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Syndic"
        fields={[
          {
            name: "confirm",
            label: `Are you sure you want to delete ${
              selectedSyndic?.first_name || "this syndic"
            } ${
              selectedSyndic?.last_name || ""
            }? This action cannot be undone.`,
            type: "textarea",
            required: false,
          },
        ]}
        onSubmit={handleDeleteSyndic}
        loading={isSubmitting}
        submitText="Delete Syndic"
        size="sm"
      />
    </>
  );
};

export default Syndics;
