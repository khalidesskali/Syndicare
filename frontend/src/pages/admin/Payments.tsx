import React from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Download,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import useAdminPayments from "@/hooks/useAdminPayments";
import { format } from "date-fns";

const Payments: React.FC = () => {
  const {
    payments,
    loading,
    filters,
    setFilters,
    updatePaymentStatus,
    refundPayment,
    stats,
  } = useAdminPayments();

  const statusBadgeClasses = {
    COMPLETED: "bg-green-100 text-green-800",
    COMPLETE: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    FAILED: "bg-red-100 text-red-800",
    REJECTED: "bg-red-100 text-red-800",
    REFUNDED: "bg-blue-100 text-blue-800",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Payments</h2>
            <p className="text-slate-600">
              View and manage all payment records
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Revenue
                </p>
                <p className="text-xl font-semibold text-slate-900">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "MAD",
                    minimumFractionDigits: 2,
                  }).format(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Completed</p>
                <p className="text-xl font-semibold text-slate-900">
                  {stats.completedPayments}{" "}
                  <span className="text-sm font-normal text-slate-500">
                    payments
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Pending</p>
                <p className="text-xl font-semibold text-slate-900">
                  {stats.pendingPayments}{" "}
                  <span className="text-sm font-normal text-slate-500">
                    payments
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Failed</p>
                <p className="text-xl font-semibold text-slate-900">
                  {payments.filter((p) => p.status === "FAILED").length}{" "}
                  <span className="text-sm font-normal text-slate-500">
                    payments
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search payments..."
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters({ ...filters, searchTerm: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <select
                  className="appearance-none bg-white pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="all">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="COMPLETE">Complete</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>

              <div className="relative">
                <select
                  className="appearance-none bg-white pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.paymentMethod}
                  onChange={(e) =>
                    setFilters({ ...filters, paymentMethod: e.target.value })
                  }
                >
                  <option value="all">All Methods</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>

              <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                <Filter className="h-4 w-4" />
              </button>

              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Syndic
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Method
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Payment Proof
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center space-x-2 text-slate-500">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading payments...</span>
                      </div>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                        <DollarSign className="h-8 w-8 text-slate-400" />
                        <p className="text-sm">No payments found</p>
                        <p className="text-xs text-slate-400">
                          {filters.searchTerm ||
                          filters.status !== "all" ||
                          filters.paymentMethod !== "all"
                            ? "Try adjusting your search or filters"
                            : "Get started by recording a new payment"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {payment.planName}
                          </div>
                          <div className="text-sm text-slate-500">
                            {payment.syndicName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "MAD",
                          minimumFractionDigits: 2,
                        }).format(parseFloat(payment.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center">
                          <span className="ml-2 text-sm text-slate-900">
                            {payment.paymentMethod.replace("_", " ")}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {format(new Date(payment.paymentDate), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.paymentProof ? (
                          <button
                            onClick={() =>
                              window.open(payment.paymentProof, "_blank")
                            }
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Proof
                          </button>
                        ) : (
                          <span className="text-slate-400 text-sm">
                            No proof
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            statusBadgeClasses[
                              payment.status as keyof typeof statusBadgeClasses
                            ]
                          }`}
                        >
                          {payment.status.charAt(0) +
                            payment.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {payment.status === "PENDING" && (
                            <>
                              <button
                                onClick={() =>
                                  updatePaymentStatus(
                                    payment.id.toString(),
                                    "approve"
                                  )
                                }
                                className="text-green-600 hover:text-green-900 mr-2"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() =>
                                  updatePaymentStatus(
                                    payment.id.toString(),
                                    "reject"
                                  )
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {payment.status === "COMPLETED" && (
                            <button
                              onClick={() =>
                                refundPayment(payment.id.toString())
                              }
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Refund
                            </button>
                          )}
                          {payment.status === "FAILED" && (
                            <button
                              onClick={() =>
                                updatePaymentStatus(
                                  payment.id.toString(),
                                  "COMPLETED"
                                )
                              }
                              className="text-green-600 hover:text-green-900"
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Payments;
