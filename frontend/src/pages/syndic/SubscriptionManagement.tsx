import { useState } from "react";
import SyndicLayout from "@/layouts/SyndicLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, History, Zap } from "lucide-react";

import CurrentSubscriptionCard from "./components/CurrentSubscriptionCard";
import SubscriptionBanner from "./components/SubscriptionBanner";
import SubscriptionPlans from "./components/SubscriptionPlans";
import PaymentHistory from "./components/PaymentHistory";

// Mock Data
const mockSubscription = {
  plan: "Enterprise Plan",
  status: "active", // active | expiring | expired
  startDate: "2026-02-11",
  endDate: "2027-02-11",
  amount: 999.0,
  currency: "DH",
  billingCycle: "annual", // monthly | annual
  features: [
    "Unlimited buildings",
    "Unlimited residents",
    "Advanced reporting",
    "Priority support",
    "Custom integrations",
  ],
};

const plans = [
  {
    id: 1,
    name: "Basic",
    monthlyPrice: 29,
    annualPrice: 299,
    description: "Perfect for small properties",
    features: [
      "Up to 5 buildings",
      "Up to 100 residents",
      "Basic reporting",
      "Email support",
    ],
    popular: false,
  },
  {
    id: 2,
    name: "Professional",
    monthlyPrice: 59,
    annualPrice: 599,
    description: "Ideal for growing communities",
    features: [
      "Up to 20 buildings",
      "Up to 500 residents",
      "Advanced reporting",
      "Priority email support",
      "Custom branding",
    ],
    popular: true,
  },
  {
    id: 3,
    name: "Enterprise",
    monthlyPrice: 99,
    annualPrice: 999,
    description: "For large-scale operations",
    features: [
      "Unlimited buildings",
      "Unlimited residents",
      "Advanced reporting & analytics",
      "24/7 Priority support",
      "Custom integrations",
      "Dedicated account manager",
    ],
    popular: false,
  },
];

const mockPaymentHistory = [
  {
    id: 1,
    date: "2026-02-11",
    amount: 999.0,
    currency: "DH",
    method: "Bank Transfer",
    status: "completed",
    reference: "TXN-882930",
    proof: null,
    notes: "Initial subscription payment for Enterprise Plan",
  },
  {
    id: 2,
    date: "2025-02-11",
    amount: 999.0,
    currency: "DH",
    method: "Bank Transfer",
    status: "completed",
    reference: "TXN-772110",
    proof: null,
    notes: "Renewal payment",
  },
];

const SubscriptionManagement = () => {
  const [isPlansOpen, setIsPlansOpen] = useState(false);

  // Calculate days remaining
  const today = new Date();
  const endDate = new Date(mockSubscription.endDate);
  const daysRemaining = Math.ceil(
    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const handleRenewClick = () => {
    setIsPlansOpen(true);
  };

  const handlePaymentSuccess = () => {
    // Here you would refresh subscription data
    console.log("Subscription renewed!");
    setIsPlansOpen(false);
  };

  return (
    <SyndicLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Subscription & Billing
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your plan, billing details, and payment history.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRenewClick}
              className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
            >
              <Zap className="mr-2 h-4 w-4" />
              {daysRemaining <= 0 ? "Renew Now" : "Extend Subscription"}
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <SubscriptionBanner
          status={mockSubscription.status}
          daysRemaining={daysRemaining}
          onRenewClick={handleRenewClick}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-600" /> Current Plan
              </h2>
              <CurrentSubscriptionCard subscription={mockSubscription} />
            </section>

            <section>
              <Tabs defaultValue="history" className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <History className="h-5 w-5 text-emerald-600" /> Recent
                    Activity
                  </h2>
                  <TabsList>
                    <TabsTrigger value="history">Payment History</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="history" className="m-0">
                  <PaymentHistory payments={mockPaymentHistory} />
                </TabsContent>
                <TabsContent value="invoices" className="m-0">
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No invoices available for download at this time.
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </section>
          </div>

          {/* Right Column - Quick Actions / Plan Comparison */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleRenewClick}
                >
                  <Zap className="mr-2 h-4 w-4" /> Change Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
                <CardDescription>
                  Contact our support team for any billing questions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Subscription Plans Modal */}
        <SubscriptionPlans
          plans={plans}
          isOpen={isPlansOpen}
          onClose={() => setIsPlansOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </SyndicLayout>
  );
};

export default SubscriptionManagement;
