import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building2,
  Calendar,
} from "lucide-react";

const Syndics: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const syndics = [
    {
      id: 1,
      name: "Mohamed Alami",
      email: "mohamed.alami@email.com",
      company: "Alami Properties",
      phone: "+212 6 12 34 56 78",
      buildings: 12,
      residents: 156,
      status: "active",
      subscription: "Premium",
      subscriptionEnd: "2025-01-15",
      joinedDate: "2024-01-15",
      lastLogin: "2 hours ago",
    },
    {
      id: 2,
      name: "Fatima Zahra",
      email: "fatima.zahra@email.com",
      company: "Casa Buildings",
      phone: "+212 6 23 45 67 89",
      buildings: 8,
      residents: 94,
      status: "active",
      subscription: "Standard",
      subscriptionEnd: "2025-02-20",
      joinedDate: "2024-02-20",
      lastLogin: "5 hours ago",
    },
    {
      id: 3,
      name: "Ahmed Bennis",
      email: "ahmed.bennis@email.com",
      company: "Bennis Syndic",
      phone: "+212 6 34 56 78 90",
      buildings: 5,
      residents: 67,
      status: "pending",
      subscription: "Basic",
      subscriptionEnd: "2024-12-10",
      joinedDate: "2024-03-10",
      lastLogin: "1 day ago",
    },
    {
      id: 4,
      name: "Karim El Fassi",
      email: "karim.elfassi@email.com",
      company: "El Fassi Group",
      phone: "+212 6 45 67 89 01",
      buildings: 15,
      residents: 203,
      status: "inactive",
      subscription: "Premium",
      subscriptionEnd: "2024-11-05",
      joinedDate: "2023-12-05",
      lastLogin: "3 weeks ago",
    },
    {
      id: 5,
      name: "Laila Amrani",
      email: "laila.amrani@email.com",
      company: "Amrani Immobilier",
      phone: "+212 6 56 78 90 12",
      buildings: 6,
      residents: 78,
      status: "active",
      subscription: "Standard",
      subscriptionEnd: "2025-03-15",
      joinedDate: "2024-03-15",
      lastLogin: "1 hour ago",
    },
    {
      id: 6,
      name: "Youssef Tazi",
      email: "youssef.tazi@email.com",
      company: "Tazi Properties",
      phone: "+212 6 67 89 01 23",
      buildings: 10,
      residents: 132,
      status: "active",
      subscription: "Premium",
      subscriptionEnd: "2025-04-01",
      joinedDate: "2024-04-01",
      lastLogin: "30 minutes ago",
    },
  ];

  const filteredSyndics = syndics.filter((syndic) => {
    const matchesSearch =
      syndic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      syndic.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      syndic.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || syndic.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: syndics.length,
    active: syndics.filter((s) => s.status === "active").length,
    pending: syndics.filter((s) => s.status === "pending").length,
    inactive: syndics.filter((s) => s.status === "inactive").length,
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Syndics Management 👥
            </h2>
            <p className="text-slate-600">
              Manage all syndic accounts and their subscriptions
            </p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl">
            <Plus className="h-5 w-5" />
            <span className="font-medium">Add Syndic</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-600">Total Syndics</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.active}
              </p>
              <p className="text-sm text-slate-600">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.pending}
              </p>
              <p className="text-sm text-slate-600">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.inactive}
              </p>
              <p className="text-sm text-slate-600">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Syndics Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Syndic
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Properties
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSyndics.map((syndic) => (
                <tr
                  key={syndic.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {syndic.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {syndic.name}
                        </p>
                        <p className="text-sm text-slate-600 truncate">
                          {syndic.company}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-slate-900">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="truncate">{syndic.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{syndic.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-900">
                          {syndic.buildings} buildings
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-slate-600">
                          {syndic.residents} residents
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          syndic.subscription === "Premium"
                            ? "bg-purple-100 text-purple-700"
                            : syndic.subscription === "Standard"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {syndic.subscription}
                      </span>
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Until{" "}
                          {new Date(
                            syndic.subscriptionEnd
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        syndic.status === "active"
                          ? "bg-green-100 text-green-700"
                          : syndic.status === "pending"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {syndic.status.charAt(0).toUpperCase() +
                        syndic.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">
                      {syndic.lastLogin}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredSyndics.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">
              No syndics found
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredSyndics.length > 0 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-medium">{filteredSyndics.length}</span> of{" "}
              <span className="font-medium">{syndics.length}</span> syndics
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                1
              </button>
              <button className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-white transition-colors">
                2
              </button>
              <button className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-white transition-colors">
                3
              </button>
              <button className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-white transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Syndics;
