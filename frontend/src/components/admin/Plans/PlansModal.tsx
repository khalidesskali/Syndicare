import { Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Plan } from "@/hooks/useSubscriptionPlans";

interface PlansModalProps {
  showCreateModal: boolean;
  setShowCreateModal: (e: boolean) => void;
  editingPlan: Plan | null;
  setEditingPlan: (e: Plan | null) => void;
  handleSubmitPlan: (e: React.FormEvent, planData?: Partial<Plan>) => void;
}

const PlansModal = ({
  showCreateModal,
  setShowCreateModal,
  editingPlan,
  handleSubmitPlan,
  setEditingPlan,
}: PlansModalProps) => {
  return (
    <div>
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                {editingPlan ? (
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                ) : (
                  <Plus className="w-4 h-4 text-blue-600" />
                )}
              </div>
              {editingPlan ? "Edit Subscription Plan" : "Create New Plan"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              const formData = new FormData(e.currentTarget);
              const planData = {
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                price: parseFloat(formData.get("price") as string),
                duration_days: parseInt(
                  formData.get("duration_days") as string,
                ),
                max_buildings: parseInt(
                  formData.get("max_buildings") as string,
                ),
                max_apartments: parseInt(
                  formData.get("max_apartments") as string,
                ),
                is_active: formData.get("is_active") === "on",
              };
              handleSubmitPlan(e, planData);
            }}
            className="px-6 py-4"
          >
            <div className="space-y-5">
              {/* Plan Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">
                  Plan Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingPlan?.name}
                  required
                  placeholder="e.g., Professional Plan"
                  className="h-11 rounded-xl"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={editingPlan?.description}
                  placeholder="Describe what this plan offers..."
                  className="rounded-xl resize-none"
                />
              </div>

              {/* Price & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-semibold">
                    Price (DH) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    id="price"
                    name="price"
                    step="0.01"
                    min="0"
                    defaultValue={editingPlan?.price}
                    required
                    placeholder="0.00"
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="duration_days"
                    className="text-sm font-semibold"
                  >
                    Duration <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    name="duration_days"
                    defaultValue={editingPlan?.duration_days?.toString()}
                    required
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Days (Monthly)</SelectItem>
                      <SelectItem value="90">90 Days (Quarterly)</SelectItem>
                      <SelectItem value="365">365 Days (Yearly)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="max_buildings"
                    className="text-sm font-semibold"
                  >
                    Max Buildings
                  </Label>
                  <Input
                    type="number"
                    id="max_buildings"
                    name="max_buildings"
                    min="1"
                    defaultValue={editingPlan?.max_buildings}
                    placeholder="Unlimited"
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="max_apartments"
                    className="text-sm font-semibold"
                  >
                    Max Apartments
                  </Label>
                  <Input
                    type="number"
                    id="max_apartments"
                    name="max_apartments"
                    min="1"
                    defaultValue={editingPlan?.max_apartments}
                    placeholder="Per building"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingPlan?.is_active ?? true}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="is_active"
                    className="text-sm font-semibold cursor-pointer"
                  >
                    Active Plan
                  </Label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This plan will be immediately available for new
                    subscriptions
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 pt-4 border-t flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingPlan(null);
                }}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {editingPlan ? "Update Plan" : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlansModal;
