import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { ReclamationCreateData } from "@/services/reclamationApi";
import { reclamationApi } from "@/services/reclamationApi";

interface ReclamationFormProps {
  onReclamationCreated?: () => void;
  onError?: (error: string) => void;
  trigger?: React.ReactNode;
  loading?: boolean;
}

const ReclamationForm: React.FC<ReclamationFormProps> = ({
  onReclamationCreated,
  onError,
  trigger,
  loading: externalLoading,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ReclamationCreateData>({
    title: "",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await reclamationApi.createReclamation(formData);

      // Reset form
      setFormData({ title: "", content: "" });
      setOpen(false);

      // Notify parent
      onReclamationCreated?.();
    } catch (error: any) {
      console.error("Failed to create reclamation:", error);

      // Extract error message from response or use default
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to submit reclamation. Please try again.";

      // Notify parent of error
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
      <Plus className="h-4 w-4 mr-2" />
      New Reclamation
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Reclamation</DialogTitle>
            <DialogDescription>
              Submit a new complaint or request to the building management.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Brief description of the issue"
                required
                disabled={loading || externalLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Detailed description of the issue"
                rows={4}
                required
                disabled={loading || externalLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading || externalLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || externalLoading}
            >
              {loading ? "Creating..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReclamationForm;
