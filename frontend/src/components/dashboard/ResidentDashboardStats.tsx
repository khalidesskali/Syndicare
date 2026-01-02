import React from "react";
import { DollarSign, AlertTriangle, CreditCard } from "lucide-react";

interface ResidentDashboardStatsProps {
  totalUnpaid: number;
  overdueCharges: number;
  lastPayment: {
    amount: number;
    date: string;
    reference: string;
    charge_description: string;
  } | null;
}

const ResidentDashboardStats: React.FC<ResidentDashboardStatsProps> = ({
  totalUnpaid,
  overdueCharges,
  lastPayment,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Unpaid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1">Total Unpaid</p>
            <p className="text-2xl font-bold text-slate-900">
              {totalUnpaid.toFixed(2)} MAD
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
            <p className="text-2xl font-bold text-slate-900">
              {overdueCharges}
            </p>
          </div>
          <div className="p-3 bg-orange-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Last Payment */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Last Payment</h3>
          </div>
        </div>

        {lastPayment ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Amount:</span>
              <span className="font-semibold text-slate-900">
                {lastPayment.amount.toFixed(2)} MAD
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Date:</span>
              <span className="text-slate-900">
                {formatDate(lastPayment.date)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Reference:</span>
              <span className="text-slate-900 text-sm">
                {lastPayment.reference}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-sm text-slate-600 mb-1">Description:</p>
              <p className="text-slate-900 text-sm">
                {lastPayment.charge_description}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No payments made yet</p>
        )}
      </div>
    </div>
  );
};

export default ResidentDashboardStats;
