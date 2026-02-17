import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import PlanCard from "./PlanCard";
import PaymentCheckout from "./PaymentCheckout";

interface Plan {
  id: number;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  popular: boolean;
}

interface SubscriptionPlansProps {
  plans: Plan[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SubscriptionPlans = ({
  plans,
  isOpen,
  onClose,
  onSuccess,
}: SubscriptionPlansProps) => {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const billingCycle = "monthly";
  const [step, setStep] = useState<"selection" | "checkout">("selection");

  const handleSelectPlan = (id: number) => setSelectedPlanId(id);
  const handleProceed = () => {
    if (selectedPlanId) setStep("checkout");
  };
  const handleBack = () => setStep("selection");
  const getSelectedPlan = () => plans.find((p) => p.id === selectedPlanId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        style={{ maxWidth: "900px" }}
        className="
          w-[calc(100vw-2rem)]
          p-0
          gap-0
          rounded-2xl
          shadow-2xl
          border-0
          flex
          flex-col
          max-h-[92vh]
          overflow-hidden
        "
      >
        {/* ── Header ── */}
        <DialogHeader className="px-8 pt-7 pb-5 border-b border-gray-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 leading-tight">
                Renew Subscription
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-sm mt-0.5">
                Choose the plan that fits your needs. Upgrade or downgrade
                anytime.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto bg-gray-50/60 min-h-0">
          {step === "selection" ? (
            <div className="p-8">
              <div className="grid grid-cols-3 gap-5">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    billingCycle={billingCycle}
                    selected={selectedPlanId === plan.id}
                    onSelect={handleSelectPlan}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8">
              {selectedPlanId && (
                <PaymentCheckout
                  plan={getSelectedPlan()!}
                  billingCycle={billingCycle}
                  onBack={handleBack}
                  onSuccess={() => {
                    onSuccess();
                    onClose();
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {step === "selection" && (
          <DialogFooter className="px-8 py-5 border-t border-gray-100 bg-white shrink-0">
            <div className="flex items-center justify-between w-full gap-4">
              <p className="text-xs text-gray-400">
                🔒 Secure payment · Cancel anytime · No hidden fees
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  size="lg"
                  className="rounded-xl px-6 border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProceed}
                  disabled={!selectedPlanId}
                  size="lg"
                  className="rounded-xl px-8 font-semibold min-w-[190px]"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionPlans;
