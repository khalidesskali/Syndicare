import { useNavigate } from "react-router-dom";
import { useResidentDashboard } from "../hooks/useResidentDashboard";
import ResidentDashboardStats from "../components/dashboard/ResidentDashboardStats";
import ResidentRecentCharges from "../components/dashboard/ResidentRecentCharges";
import {
  AlertCircle,
  PlusCircle,
  MessageSquare,
  CreditCard,
  Info,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Internal sub-components for widgets (can be moved to separate files later)
const MeetingWidget: React.FC<{ meetings: any[]; loading: boolean }> = ({
  meetings,
  loading,
}) => {
  if (loading) return <Skeleton className="h-48 w-full rounded-xl" />;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-500" />
          Upcoming Meetings
        </h3>
      </div>
      <div className="p-4 space-y-4">
        {meetings.length > 0 ? (
          meetings.map((m) => (
            <div key={m.id} className="border-l-4 border-blue-500 pl-3 py-1">
              <p className="font-medium text-slate-900 text-sm">{m.title}</p>
              <p className="text-xs text-slate-500">
                {new Date(m.date_time).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-1">{m.location}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 italic py-4 text-center">
            No upcoming meetings
          </p>
        )}
      </div>
    </div>
  );
};

const ReclamationWidget: React.FC<{
  reclamations: any[];
  loading: boolean;
}> = ({ reclamations, loading }) => {
  if (loading) return <Skeleton className="h-48 w-full rounded-xl" />;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-orange-500" />
          Recent Reclamations
        </h3>
      </div>
      <div className="p-4 space-y-4">
        {reclamations.length > 0 ? (
          reclamations.map((r) => (
            <div key={r.id} className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="font-medium text-slate-900 text-sm truncate">
                  {r.title}
                </p>
                <p className="text-[10px] text-slate-500">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  r.status === "RESOLVED"
                    ? "bg-green-100 text-green-700"
                    : r.status === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-700"
                }`}
              >
                {r.status}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 italic py-4 text-center">
            No recent complaints
          </p>
        )}
      </div>
    </div>
  );
};

const ResidentDashboard: React.FC = () => {
  const { data, loading, error } = useResidentDashboard();
  const navigate = useNavigate();

  const dashboardData = data?.data;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Header with Welcome and Apartment Info */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {dashboardData?.user.name || "Resident"}!
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-slate-600">
              <span className="text-sm bg-slate-200 px-2 py-1 rounded text-slate-700 font-medium">
                Resident Portal
              </span>
              {dashboardData?.apartments.map((apt, idx) => (
                <span
                  key={apt.id}
                  className="text-sm text-slate-500 flex items-center gap-1"
                >
                  {idx > 0 && " • "}
                  <span className="font-semibold">{apt.building_name}</span> Apt
                  #{apt.number}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/resident/charges")}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-sm"
            >
              <CreditCard className="h-4 w-4" />
              Pay Charges
            </button>
            <button
              onClick={() => navigate("/resident/reclamations")}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              New Complaint
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <ResidentDashboardStats
          stats={
            dashboardData?.stats || {
              total_unpaid: 0,
              overdue_count: 0,
              total_paid_all_time: 0,
              total_paid_this_year: 0,
            }
          }
          lastPayment={dashboardData?.last_payment || null}
          loading={loading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Activity Feed / Charges */}
          <div className="lg:col-span-2 space-y-8">
            <ResidentRecentCharges
              charges={dashboardData?.recent_charges || []}
              loading={loading}
            />
          </div>

          {/* Right Column: Mini Widgets */}
          <div className="space-y-6">
            <MeetingWidget
              meetings={dashboardData?.upcoming_meetings || []}
              loading={loading}
            />
            <ReclamationWidget
              reclamations={dashboardData?.recent_reclamations || []}
              loading={loading}
            />

            <div className="p-6 bg-blue-600 rounded-xl text-white shadow-lg relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-bold text-lg mb-2">Need a document?</h4>
                <p className="text-blue-100 text-sm mb-4 opacity-90">
                  Request building documents or certifications directly from
                  your syndic.
                </p>
                <button className="px-4 py-2 bg-white text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">
                  Request Service
                </button>
              </div>
              <Info className="absolute -bottom-4 -right-4 h-24 w-24 text-white/10 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
