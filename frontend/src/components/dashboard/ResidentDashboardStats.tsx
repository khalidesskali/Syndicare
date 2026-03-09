import React from "react";
import { DollarSign, AlertTriangle, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ResidentDashboardStatsProps {
  stats: {
    total_unpaid: number;
    overdue_count: number;
    total_paid_all_time: number;
    total_paid_this_year: number;
  };
  lastPayment: {
    amount: number;
    date: string;
    reference: string;
    charge_description: string;
    apartment_number: string;
    status: string;
  } | null;
  loading?: boolean;
}

const ResidentDashboardStats: React.FC<ResidentDashboardStatsProps> = ({
  stats,
  lastPayment,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8 mb-8">
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Unpaid */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Unpaid</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.total_unpaid.toFixed(2)} MAD
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Overdue Charges */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Overdue Charges</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.overdue_count}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Paid This Year */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Paid This Year</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.total_paid_this_year.toFixed(2)} MAD
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Paid All Time */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-indigo-600">
                {stats.total_paid_all_time.toFixed(2)} MAD
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Info Area (Last Payment + Quick Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl shadow-md p-6 text-white overflow-hidden relative">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-semibold">Last Payment Receipt</h3>
              </div>

              {lastPayment ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-8">
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                        Amount
                      </p>
                      <p className="text-xl font-bold">
                        {lastPayment.amount.toFixed(2)} MAD
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                        Date
                      </p>
                      <p className="text-slate-100">
                        {formatDate(lastPayment.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                        Apt
                      </p>
                      <p className="text-slate-100">
                        #{lastPayment.apartment_number}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                      Reference
                    </p>
                    <p className="text-slate-300 font-mono text-xs truncate max-w-[200px] md:max-w-none">
                      {lastPayment.reference}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 italic">
                  No payments recorded yet
                </p>
              )}
            </div>

            {lastPayment && (
              <div className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 min-w-[120px]">
                <p className="text-slate-300 text-[10px] uppercase tracking-widest mb-2 font-bold">
                  Status
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    lastPayment.status === "CONFIRMED"
                      ? "bg-green-500/20 text-green-400"
                      : lastPayment.status === "PENDING"
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {lastPayment.status}
                </span>
                <p className="text-[10px] text-slate-400 mt-2 text-center opacity-70">
                  CONFIRMED BY SYNDIC
                </p>
              </div>
            )}
          </div>

          {/* Subtle background pattern */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10">
            <CreditCard size={200} />
          </div>
        </div>

        {/* Quick Action Placeholder (can be moved here or kept elsewhere) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Need Help?</h3>
          <p className="text-sm text-slate-600 mb-4">
            File a complaint or contact your syndic directly.
          </p>
          <button className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboardStats;
