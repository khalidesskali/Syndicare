import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import type { DeleteModalConfig } from "@/types/common";

interface DeleteActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DeleteModalConfig;
  loading?: boolean;
}

export function DeleteActionModal({
  isOpen,
  onClose,
  config,
  loading = false,
}: DeleteActionModalProps) {
  const [confirmText, setConfirmText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if confirmation text matches (if required)
    if (config.confirmText && confirmText !== config.confirmText) {
      return;
    }

    const success = await config.action();
    if (success) {
      onClose();
      setConfirmText("");
    }
  };

  const isConfirmed = !config.confirmText || confirmText === config.confirmText;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white border-slate-200 shadow-xl">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {config.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-slate-600">{config.description}</p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800">
              <strong>Item to delete:</strong> {config.itemName}
            </p>
          </div>

          {config.confirmText && (
            <div className="space-y-2">
              <Label
                htmlFor="confirmText"
                className="text-sm font-medium text-slate-700"
              >
                Type{" "}
                <span className="font-mono bg-slate-100 px-1 rounded">
                  {config.confirmText}
                </span>{" "}
                to confirm:
              </Label>
              <Input
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={config.confirmText}
                className="border-slate-200 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex space-x-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
            disabled={loading || !isConfirmed}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
