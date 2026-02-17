import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Plan {
  id: number;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
}

interface PaymentCheckoutProps {
  plan: Plan;
  billingCycle: "monthly" | "annual";
  onBack: () => void;
  onSuccess: () => void;
}

const PaymentCheckout = ({
  plan,
  billingCycle,
  onBack,
  onSuccess,
}: PaymentCheckoutProps) => {
  const amount =
    billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
  const clientId = "test";

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <Button variant="ghost" className="pl-0 gap-2 mb-2" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" /> Back to plans
      </Button>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Order Summary</h3>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-lg">{plan.name} Plan</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {billingCycle} billing
                </p>
              </div>
              <span className="font-bold text-lg">{amount} DH</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total due today</span>
              <span className="font-bold">{amount} DH</span>
            </div>
          </CardContent>
        </Card>

        <div className="bg-slate-50 p-4 rounded-lg flex items-start gap-3 text-sm text-slate-600 border border-slate-100">
          <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
          <p>
            Secure payment processing. Your subscription will start immediately
            after successful payment.
          </p>
        </div>

        <div className="pt-4">
          <PayPalScriptProvider
            options={{ clientId: clientId, currency: "USD" }}
          >
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: (amount / 10).toFixed(2), // Mock conversion to USD for sandbox
                      },
                      description: `Syndicare Subscription - ${plan.name} (${billingCycle})`,
                    },
                  ],
                });
              }}
              onApprove={async (data, actions) => {
                if (actions.order) {
                  const details = await actions.order.capture();
                  console.log("Payment successful:", details);
                  onSuccess();
                }
              }}
            />
          </PayPalScriptProvider>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckout;
