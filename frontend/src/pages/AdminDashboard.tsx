import React from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Users,
  CheckCircle2,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  CreditCard,
  BarChart3,
  AlertCircle,
  Activity,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Dashboard Overview 📊
        </h2>
        <p className="text-slate-600">
          Monitor your platform's performance and key metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Syndics */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <span className="flex items-center text-sm font-medium text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              12%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">248</h3>
          <p className="text-sm text-slate-600">Total Syndics</p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">+23 this month</p>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <span className="flex items-center text-sm font-medium text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              8%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">189</h3>
          <p className="text-sm text-slate-600">Active Subscriptions</p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">76% conversion rate</p>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <span className="flex items-center text-sm font-medium text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              18%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">$45,231</h3>
          <p className="text-sm text-slate-600">Monthly Revenue</p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">+$8,234 this month</p>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <span className="flex items-center text-sm font-medium text-red-600">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              3%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">23</h3>
          <p className="text-sm text-slate-600">Pending Payments</p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">$12,450 total</p>
          </div>
        </div>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Quick Actions
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex items-center p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4 text-left">
                  <p className="font-semibold text-slate-900">Create Syndic</p>
                  <p className="text-sm text-slate-600">
                    Add new syndic account
                  </p>
                </div>
              </button>

              <button className="flex items-center p-4 border-2 border-slate-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4 text-left">
                  <p className="font-semibold text-slate-900">
                    New Subscription
                  </p>
                  <p className="text-sm text-slate-600">
                    Create subscription plan
                  </p>
                </div>
              </button>

              <button className="flex items-center p-4 border-2 border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4 text-left">
                  <p className="font-semibold text-slate-900">
                    Process Payment
                  </p>
                  <p className="text-sm text-slate-600">Record new payment</p>
                </div>
              </button>

              <button className="flex items-center p-4 border-2 border-slate-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4 text-left">
                  <p className="font-semibold text-slate-900">View Reports</p>
                  <p className="text-sm text-slate-600">Analytics & insights</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Alerts</h3>
            <span className="h-6 w-6 bg-red-100 text-red-600 text-xs font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  5 subscriptions expiring soon
                </p>
                <p className="text-xs text-red-700 mt-1">Within 7 days</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  23 pending payments
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Requires attention
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  System update available
                </p>
                <p className="text-xs text-blue-700 mt-1">Version 2.3.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Syndics */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Recent Syndics
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {[
              {
                name: "Mohamed Alami",
                company: "Alami Properties",
                date: "2 hours ago",
                status: "active",
              },
              {
                name: "Fatima Zahra",
                company: "Casa Buildings",
                date: "5 hours ago",
                status: "active",
              },
              {
                name: "Ahmed Bennis",
                company: "Bennis Syndic",
                date: "1 day ago",
                status: "pending",
              },
              {
                name: "Karim El Fassi",
                company: "El Fassi Group",
                date: "2 days ago",
                status: "active",
              },
            ].map((syndic, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {syndic.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{syndic.name}</p>
                    <p className="text-sm text-slate-600">{syndic.company}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      syndic.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {syndic.status}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">{syndic.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Recent Payments
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {[
              {
                syndic: "Alami Properties",
                amount: "$450",
                plan: "Premium",
                date: "1 hour ago",
                status: "completed",
              },
              {
                syndic: "Casa Buildings",
                amount: "$350",
                plan: "Standard",
                date: "3 hours ago",
                status: "completed",
              },
              {
                syndic: "Bennis Syndic",
                amount: "$450",
                plan: "Premium",
                date: "1 day ago",
                status: "pending",
              },
              {
                syndic: "El Fassi Group",
                amount: "$250",
                plan: "Basic",
                date: "2 days ago",
                status: "completed",
              },
            ].map((payment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      payment.status === "completed"
                        ? "bg-green-100"
                        : "bg-orange-100"
                    }`}
                  >
                    <DollarSign
                      className={`h-5 w-5 ${
                        payment.status === "completed"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {payment.syndic}
                    </p>
                    <p className="text-sm text-slate-600">
                      {payment.plan} Plan
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">
                    {payment.amount}
                  </p>
                  <p className="text-xs text-slate-500">{payment.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
