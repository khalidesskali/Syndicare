import React, { useState, useEffect, forwardRef } from "react";
import {
  X,
  Save,
  Loader2,
  Building2,
  User,
  Phone,
  Mail,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Syndic, SyndicFormData } from "@/types/syndics";
import useSyndics from "@/hooks/useSyndics";

interface EditSyndicModalProps {
  isOpen: boolean;
  onClose: () => void;
  syndic: Syndic | null;
}

const EditSyndicModal = forwardRef<HTMLDivElement, EditSyndicModalProps>(
  ({ isOpen, onClose, syndic }, ref) => {
    const { updateSyndic } = useSyndics();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<SyndicFormData>>({
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      is_active: true,
    });

    // Update form data when syndic changes
    useEffect(() => {
      if (syndic) {
        setFormData({
          email: syndic.email,
          first_name: syndic.first_name,
          last_name: syndic.last_name,
          phone: syndic.phone || "",
          is_active: syndic.is_active,
        });
        setError(null);
      }
    }, [syndic]);

    const handleChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value, type } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!syndic) return;

      try {
        setLoading(true);
        setError(null);

        await updateSyndic(syndic.id, formData as Partial<SyndicFormData>);
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to update syndic");
      } finally {
        setLoading(false);
      }
    };

    if (!isOpen || !syndic) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div
          ref={ref}
          className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border animate-in fade-in-0 zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Edit Syndic
                </h2>
                <p className="text-sm text-muted-foreground">
                  {syndic.first_name} {syndic.last_name}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-4 w-4 text-primary" />
                <h3 className="text-lg font-medium text-foreground">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="flex items-center space-x-2 text-sm font-medium text-foreground"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>Email *</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                {/* First Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="first_name"
                    className="flex items-center space-x-2 text-sm font-medium text-foreground"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>First Name *</span>
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="John"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="last_name"
                    className="flex items-center space-x-2 text-sm font-medium text-foreground"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Last Name *</span>
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="Doe"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="flex items-center space-x-2 text-sm font-medium text-foreground"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>Phone</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-4 w-4 text-primary" />
                <h3 className="text-lg font-medium text-foreground">
                  Account Status
                </h3>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg border border-border">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
                />
                <div className="flex-1">
                  <label
                    htmlFor="is_active"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Active Status
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Deactivating will prevent the syndic from accessing the
                    system
                  </p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    formData.is_active ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
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
                type="submit"
                disabled={loading}
                className="min-w-[140px] bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

EditSyndicModal.displayName = "EditSyndicModal";

export default EditSyndicModal;
