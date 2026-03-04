import React, { useState, useEffect, useCallback } from "react";
import ReclamationForm from "@/components/resident/ReclamationForm";
import ReclamationList from "@/components/resident/ReclamationList";
import ReclamationStats from "@/components/resident/ReclamationStats";
import { SuccessMessage } from "@/components/ui/success-message";
import { ErrorMessage } from "@/components/ui/error-message";
import {
  reclamationApi,
  type Reclamation,
  type ReclamationStatistics,
} from "@/services/reclamationApi";
import DeleteConfirmation from "@/components/resident/DeleteConfirmation";

const Reclamations: React.FC = () => {
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [statistics, setStatistics] = useState<ReclamationStatistics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Reclamation | null>(null);

  const fetchReclamations = useCallback(async () => {
    try {
      setError(null);
      const response = await reclamationApi.getReclamations();
      const payload = (response as any)?.data;
      const reclamationsData = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];
      setReclamations(reclamationsData);
    } catch (err) {
      console.error("Failed to fetch reclamations:", err);
      setError("Failed to load reclamations");
      setErrorMessage("Failed to load your reclamations. Please try again.");
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await reclamationApi.getStatistics();
      const payload = (response as any)?.data;
      const statisticsData = payload?.data ?? payload ?? null;
      setStatistics(statisticsData);
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchReclamations(), fetchStatistics()]);
    setLoading(false);
  }, [fetchReclamations, fetchStatistics]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const hasUnprocessed = reclamations.some((r) => r.ai_processed === false);
    if (!hasUnprocessed) return;

    let attempts = 0;
    const intervalId = window.setInterval(() => {
      attempts += 1;
      fetchReclamations();
      fetchStatistics();

      if (attempts >= 6) {
        window.clearInterval(intervalId);
      }
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [reclamations, fetchReclamations, fetchStatistics]);

  const handleReclamationCreated = () => {
    // Refresh data when a new reclamation is created
    loadData();
    setSuccessMessage("Reclamation submitted successfully!");
  };

  const handleReclamationError = (error: string) => {
    setErrorMessage(error);
  };

  const handleReclamationClick = (reclamation: Reclamation) => {
    // TODO: Navigate to reclamation details or show details modal
    console.log("Reclamation clicked:", reclamation);
  };

  const handleDeleteRequest = (reclamation: Reclamation) => {
    setConfirmDelete(reclamation);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete.id;
    setConfirmDelete(null);
    setDeletingId(id);
    try {
      await reclamationApi.deleteReclamation(id);
      setSuccessMessage("Complaint deleted successfully.");
      loadData();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Failed to delete complaint. Please try again.";
      setErrorMessage(message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-muted-foreground">Loading reclamations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reclamations</h1>
          <p className="text-slate-600 mt-2">
            Submit and track your complaints and requests
          </p>
        </div>
        <ReclamationForm
          onReclamationCreated={handleReclamationCreated}
          onError={handleReclamationError}
          loading={loading}
        />
      </div>

      {/* Summary Stats */}
      {statistics && <ReclamationStats statistics={statistics} />}

      {/* Reclamations List */}
      <ReclamationList
        reclamations={reclamations}
        onReclamationClick={handleReclamationClick}
        onDelete={handleDeleteRequest}
        deletingId={deletingId}
      />

      {/* Success and Error Messages */}
      {successMessage && (
        <SuccessMessage message={successMessage} duration={5000} />
      )}

      {errorMessage && <ErrorMessage message={errorMessage} duration={5000} />}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        confirmDelete={confirmDelete}
        setConfirmDelete={setConfirmDelete}
        handleConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default Reclamations;
