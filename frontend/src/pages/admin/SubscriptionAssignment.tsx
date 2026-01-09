import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { UserPlus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import useSubscriptionAssignment from "@/hooks/useSubscriptionAssignment";

interface Syndic {
  id: number;
  user: {
    email: string;
    first_name: string;
    last_name: string;
  };
  syndic_profile?: {
    subscription?: {
      id: number;
      plan: {
        name: string;
      };
    };
  };
}

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  max_buildings: number;
  max_apartments: number;
  is_active: boolean;
}

const SubscriptionAssignment: React.FC = () => {
  const { syndics, plans, loading, error, assignSubscription } =
    useSubscriptionAssignment();
  const [selectedSyndic, setSelectedSyndic] = useState<Syndic | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [assigning, setAssigning] = useState(false);

  const handleAssignSubscription = async () => {
    if (!selectedSyndic || !selectedPlan) {
      alert("Please select both a syndic and a subscription plan");
      return;
    }

    setAssigning(true);

    try {
      const success = await assignSubscription({
        syndic_id: selectedSyndic.id,
        plan_id: Number(selectedPlan),
      });

      if (success) {
        alert("Subscription assigned successfully!");
        setSelectedSyndic(null);
        setSelectedPlan("");
      }
    } catch (error) {
      console.error("Subscription assignment failed:", error);
    } finally {
      setAssigning(false);
    }
  };

  const getSubscriptionBadge = (syndic: Syndic) => {
    if (!syndic.syndic_profile?.subscription) {
      return {
        color: "bg-gray-100 text-gray-800",
        label: "No Subscription",
        icon: Clock,
      };
    }

    const subscription = syndic.syndic_profile.subscription;
    const daysRemaining = (subscription as any).days_remaining || 0;
    const isActive = (subscription as any).is_active || false;

    if (!isActive) {
      return {
        color: "bg-red-100 text-red-800",
        label: "Inactive",
        icon: AlertCircle,
      };
    }

    if (daysRemaining <= 7) {
      return {
        color: "bg-orange-100 text-orange-800",
        label: "Expiring Soon",
        icon: Clock,
      };
    }

    return {
      color: "bg-green-100 text-green-800",
      label: "Active",
      icon: CheckCircle,
    };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Subscription Assignment 📋
          </h1>
          <p className="text-slate-600">
            Assign subscription plans to syndics and manage their access
          </p>
        </div>

        {/* Assignment Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Assign New Subscription
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Select Syndic */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Syndic
              </label>
              <Select
                value={selectedSyndic?.id || ""}
                onValueChange={(value) =>
                  setSelectedSyndic(
                    syndics.find((s) => s.id === Number(value)) || null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a syndic" />
                </SelectTrigger>
                <SelectContent>
                  {syndics.map((syndic) => (
                    <SelectItem key={syndic.id} value={syndic.id.toString()}>
                      {syndic.first_name} {syndic.last_name} ({syndic.email})
                      {syndic.syndic_profile?.subscription &&
                        ` - ${syndic.syndic_profile.subscription.plan.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Select Plan */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Subscription Plan
              </label>
              <Select
                value={selectedPlan}
                onValueChange={(value) => setSelectedPlan(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      <div className="flex items-center justify-between">
                        <span>{plan.name}</span>
                        <span className="text-slate-500">
                          ({plan.price} DH/{plan.duration_days} days)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Status */}
            {selectedSyndic?.syndic_profile?.subscription && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current Status
                </label>
                <div className="bg-slate-50 p-3 rounded">
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={getSubscriptionBadge(selectedSyndic).color}
                    >
                      <div className="flex items-center space-x-1">
                        {React.createElement(
                          getSubscriptionBadge(selectedSyndic).icon,
                          {
                            className: "h-4 w-4",
                          }
                        )}
                        <span>
                          {getSubscriptionBadge(selectedSyndic).label}
                        </span>
                      </div>
                    </Badge>
                    <span className="text-sm text-slate-600">
                      {selectedSyndic.syndic_profile.subscription.plan.name}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleAssignSubscription}
              disabled={assigning || !selectedSyndic || !selectedPlan}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {assigning ? "Assigning..." : "Assign Subscription"}
            </Button>
          </div>
        </div>

        {/* Syndics List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Syndics ({syndics.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Syndic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Current Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {syndics.map((syndic) => {
                  const badgeConfig = getSubscriptionBadge(syndic);

                  return (
                    <tr key={syndic.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {syndic.first_name[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {syndic.first_name} {syndic.last_name}
                            </p>
                            <p className="text-sm text-slate-600">
                              {syndic.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {syndic.email}
                      </td>
                      <td className="px-6 py-4">
                        {syndic.syndic_profile?.subscription ? (
                          <Badge className={badgeConfig.color}>
                            <div className="flex items-center space-x-1">
                              {React.createElement(badgeConfig.icon, {
                                className: "h-4 w-4",
                              })}
                              <span>{badgeConfig.label}</span>
                            </div>
                          </Badge>
                        ) : (
                          <span className="text-slate-500">
                            No Subscription
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {syndic.syndic_profile?.subscription?.plan.name || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={badgeConfig.color}>
                          {badgeConfig.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          onClick={() => {
                            setSelectedSyndic(syndic);
                            setSelectedPlan(
                              syndic.syndic_profile?.subscription?.plan?.id?.toString() ||
                                ""
                            );
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Edit Assignment
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SubscriptionAssignment;
