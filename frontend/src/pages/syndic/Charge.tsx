import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import type { Charge as ChargeType, ChargeStats } from "../../types/charge";
import { ChargeHeader } from "@/components/charges/ChargeHeader";
import { ChargeStats as ChargeStatsComponent } from "@/components/charges/ChargeStats";
import { ChargeFilters } from "@/components/charges/ChargeFilters";
import { ChargeTable } from "@/components/charges/ChargeTable";
import SyndicLayout from "@/components/SyndicLayout";

const Charge: React.FC = () => {
  const [charges, setCharges] = useState<ChargeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<
    { from?: Date; to?: Date } | undefined
  >();
  const [stats, setStats] = useState<ChargeStats>({
    total_charges: 0,
    paid: 0,
    unpaid: 0,
    overdue: 0,
    partially_paid: 0,
    total_amount: 0,
    paid_amount: 0,
    unpaid_amount: 0,
    overdue_amount: 0,
    collection_rate: 0,
  });

  // Fetch charges
  const fetchCharges = async () => {
    try {
      setLoading(true);
      // Build query params based on filters
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (dateRange?.from)
        params.append("start_date", format(dateRange.from, "yyyy-MM-dd"));
      if (dateRange?.to)
        params.append("end_date", format(dateRange.to, "yyyy-MM-dd"));
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/syndic/charges/?${params.toString()}`);
      const data = await response.json();
      setCharges(data.results || []);
    } catch (error) {
      console.error("Failed to fetch charges:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch("/api/syndic/charges/statistics/");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = async (chargeId: number) => {
    try {
      const response = await fetch(
        `/api/syndic/charges/${chargeId}/mark_paid/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paid_amount: charges.find((c) => c.id === chargeId)?.amount,
            paid_date: new Date().toISOString().split("T")[0],
          }),
        }
      );

      if (response.ok) {
        console.log("Charge marked as paid successfully");
        fetchCharges();
        fetchStatistics();
      } else {
        throw new Error("Failed to mark as paid");
      }
    } catch (error) {
      console.error("Failed to mark charge as paid:", error);
    }
  };

  // Handle bulk create
  const handleBulkCreate = () => {
    // Implementation would open a modal or navigate to a bulk create form
    console.log("Bulk create charges");
  };

  // Handle create new charge
  const handleCreateCharge = () => {
    // Implementation would open a modal or navigate to a create form
    console.log("Create new charge");
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchCharges();
    fetchStatistics();
  }, [statusFilter, dateRange]);

  return (
    <SyndicLayout>
      <ChargeHeader
        onBulkCreate={handleBulkCreate}
        onCreateCharge={handleCreateCharge}
      />

      <ChargeStatsComponent stats={stats} />

      <ChargeFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onSearch={fetchCharges}
      />

      <ChargeTable
        charges={charges}
        loading={loading}
        onMarkAsPaid={handleMarkAsPaid}
      />
    </SyndicLayout>
  );
};

export default Charge;
