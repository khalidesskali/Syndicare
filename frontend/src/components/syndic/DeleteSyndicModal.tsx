import React, { forwardRef } from "react";
import { X, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Syndic } from "@/types/syndics";
import useSyndics from "@/hooks/useSyndics";

interface DeleteSyndicModalProps {
  isOpen: boolean;
  onClose: () => void;
  syndic: Syndic | null;
}

const DeleteSyndicModal = forwardRef<HTMLDivElement, DeleteSyndicModalProps>(
  ({ isOpen, onClose, syndic }, ref) => {
    const { deleteSyndic } = useSyndics();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleDelete = async () => {
      if (!syndic) return;

      try {
        setLoading(true);
        setError(null);

        await deleteSyndic(syndic.id);
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete syndic");
      } finally {
        setLoading(false);
      }
    };

    if (!isOpen || !syndic) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div
          ref={ref}
          className="bg-card rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-border animate-in fade-in-0 zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Delete Syndic
                </h2>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {syndic.first_name[0]}
                      {syndic.last_name[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">
                      {syndic.first_name} {syndic.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {syndic.email}
                    </p>
                    {syndic.company_name && (
                      <p className="text-sm text-muted-foreground">
                        {syndic.company_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Warning:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>All syndic data will be permanently deleted</li>
                  <li>Associated properties and records may be affected</li>
                  <li>This action cannot be reversed</li>
                </ul>
              </div>

              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm text-destructive font-medium">
                  Are you sure you want to delete this syndic?
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={loading}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                variant="destructive"
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DeleteSyndicModal.displayName = "DeleteSyndicModal";

export default DeleteSyndicModal;
