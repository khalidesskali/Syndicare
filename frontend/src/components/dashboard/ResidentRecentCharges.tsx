import React from "react";
import { Clock, DollarSign, AlertCircle } from "lucide-react";

interface Charge {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  status: string;
  created_at: string;
}

interface ResidentRecentChargesProps {
  charges: Charge[];
}

const ResidentRecentCharges: React.FC<ResidentRecentChargesProps> = ({
  charges,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "UNPAID":
        return "bg-red-100 text-red-800";
      case "PARTIALLY_PAID":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <DollarSign className="h-4 w-4" />;
      case "UNPAID":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status === "UNPAID" && new Date(dueDate) < new Date();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Recent Charges
          </h3>
          <Clock className="h-5 w-5 text-slate-400" />
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {charges.length > 0 ? (
          charges.map((charge) => (
            <div
              key={charge.id}
              className={`p-4 hover:bg-slate-50 transition-colors ${
                isOverdue(charge.due_date, charge.status) ? "bg-red-50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-slate-900">
                      {charge.description}
                    </h4>
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        charge.status
                      )}`}
                    >
                      {getStatusIcon(charge.status)}
                      <span>{charge.status.replace("_", " ")}</span>
                    </span>
                    {isOverdue(charge.due_date, charge.status) && (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="h-3 w-3" />
                        <span>Overdue</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <span>Due: {formatDate(charge.due_date)}</span>
                    <span>Created: {formatDate(charge.created_at)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-900">
                    {charge.amount} MAD
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-slate-100 rounded-full">
                <DollarSign className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-600">No charges found</p>
              <p className="text-sm text-slate-500">
                Your charges will appear here once they are created
              </p>
            </div>
          </div>
        )}
      </div>

      {charges.length > 0 && (
        <div className="p-4 border-t border-slate-200">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Charges →
          </button>
        </div>
      )}
    </div>
  );
};

export default ResidentRecentCharges;
