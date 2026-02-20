import React from "react";
import {
  Plus,
  Search,
  Filter,
  Sparkles,
  Building2,
  Home,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import useSubscriptionPlans from "@/hooks/useSubscriptionPlans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import PlansModal from "@/components/admin/Plans/PlansModal";

const SubscriptionPlans: React.FC = () => {
  const {
    loading,
    filters,
    showCreateModal,
    setShowCreateModal,
    editingPlan,
    deletePlan,
    setFilters,
    filteredPlans,
    searchTerm,
    setSearchTerm,
    togglePlanStatus,
    setEditingPlan,
    handleSubmitPlan,
  } = useSubscriptionPlans();

  const planIcons = [Sparkles, TrendingUp, Building2];

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* ── Header with gradient accent ── */}
        <div className="relative">
          <div className="absolute inset-0 h-32 bg-gradient-to-br from-blue-50 via-slate-50 to-transparent rounded-3xl -z-10" />
          <div className="pt-2">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-200">
                    <Sparkles
                      className="w-5 h-5 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Subscription Plans
                  </h1>
                </div>
                <p className="text-slate-500 ml-12">
                  Manage your subscription tiers, pricing, and feature limits
                </p>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                size="lg"
                className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200 bg-blue-600 hover:bg-blue-700 shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Plan
              </Button>
            </div>
          </div>
        </div>

        {/* ── Filters bar with glassmorphism ── */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search plans by name or description..."
                className="pl-10 h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger className="w-full md:w-[180px] h-11 rounded-xl">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ── Plans grid ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-blue-400 animate-spin animation-delay-150" />
            </div>
            <p className="text-sm text-slate-500">Loading plans...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No plans found
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm text-center">
              {searchTerm || filters.status !== "all"
                ? "Try adjusting your search or filter to find what you're looking for."
                : "Get started by creating your first subscription plan."}
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Plan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan, idx) => {
              const Icon = planIcons[idx % planIcons.length];

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "group relative flex flex-col rounded-2xl border-2 bg-white",
                    "transition-all duration-300 ease-out",
                    "hover:shadow-xl hover:-translate-y-1",
                    plan.is_active
                      ? "border-blue-200 shadow-md shadow-blue-100/50"
                      : "border-slate-200 shadow-sm",
                  )}
                  style={{
                    animationDelay: `${idx * 50}ms`,
                    animation: "slideUp 0.4s ease-out both",
                  }}
                >
                  {/* Popular badge for most subscribed */}
                  {plan.total_subscriptions && plan.total_subscriptions > 1 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-lg px-3 py-1 text-xs font-semibold">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {/* Card header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                            plan.is_active
                              ? "bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-200"
                              : "bg-slate-100",
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-6 h-6",
                              plan.is_active ? "text-white" : "text-slate-500",
                            )}
                            strokeWidth={2}
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                            {plan.name}
                          </h3>
                          <Badge
                            variant={plan.is_active ? "default" : "secondary"}
                            className={cn(
                              "mt-1 text-xs font-medium",
                              plan.is_active
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200",
                            )}
                          >
                            {plan.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed min-h-[2.5rem]">
                      {plan.description}
                    </p>

                    {/* Pricing */}
                    <div className="mt-6 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                        {typeof plan.price === "number"
                          ? plan.price.toFixed(2)
                          : parseFloat(plan.price || "0").toFixed(2)}
                      </span>
                      <span className="text-lg font-semibold text-slate-400">
                        dhs
                      </span>
                      <span className="text-sm text-slate-500">
                        / {plan.duration_days} days
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Features */}
                  <div className="px-6 py-5 space-y-3 flex-1">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-slate-600">Max Buildings</span>
                        <p className="font-semibold text-slate-900">
                          {plan.max_buildings}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                        <Home className="w-4 h-4 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-slate-600">Max Apartments</span>
                        <p className="font-semibold text-slate-900">
                          {plan.max_apartments}
                        </p>
                      </div>
                    </div>

                    {plan.total_subscriptions !== undefined && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-slate-600">Subscribers</span>
                          <p className="font-semibold text-slate-900">
                            {plan.active_subscriptions || 0} /{" "}
                            {plan.total_subscriptions}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Actions footer */}
                  <div className="px-6 py-4 bg-slate-50/50 rounded-b-2xl">
                    <div className="flex items-center justify-between gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePlanStatus(plan.id)}
                        className={cn(
                          "rounded-lg text-xs font-medium",
                          plan.is_active
                            ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50",
                        )}
                      >
                        {plan.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingPlan(plan);
                            setShowCreateModal(true);
                          }}
                          className="rounded-lg text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePlan(plan.id)}
                          className="rounded-lg text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* ── Create/Edit Modal ── */}
      <PlansModal
        handleSubmitPlan={handleSubmitPlan}
        editingPlan={editingPlan}
        showCreateModal={showCreateModal}
        setEditingPlan={setEditingPlan}
        setShowCreateModal={setShowCreateModal}
      />
    </AdminLayout>
  );
};

export default SubscriptionPlans;
