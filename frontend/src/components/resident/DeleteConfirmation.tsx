import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Reclamation } from "@/services/reclamationApi";

const DeleteConfirmation = ({
  confirmDelete,
  setConfirmDelete,
  handleConfirmDelete,
}: {
  confirmDelete: Reclamation | null;
  setConfirmDelete: (reclamation: Reclamation | null) => void;
  handleConfirmDelete: () => void;
}): React.ReactNode => {
  return (
    <Dialog
      open={!!confirmDelete}
      onOpenChange={(open) => !open && setConfirmDelete(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Complaint</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">
              "{confirmDelete?.title}"
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmation;
