import { Calendar, Clock, Users } from "lucide-react";

interface Reunion {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  participants_count?: number;
}

interface DashboardReunionsProps {
  reunions: Reunion[];
  loading?: boolean;
}

export function DashboardReunions({
  reunions = [],
  loading = false,
}: DashboardReunionsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!reunions || reunions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No Upcoming Meetings
          </h3>
          <p className="text-slate-600">Schedule your next community meeting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Upcoming Meetings
        </h3>
        <Calendar className="h-5 w-5 text-slate-400" />
      </div>

      <div className="space-y-4">
        {reunions.map((reunion) => (
          <div
            key={reunion.id}
            className="border-l-4 border-purple-500 pl-4 py-2 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 mb-1">
                  {reunion.title}
                </h4>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {reunion.date}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {reunion.time}
                  </div>
                  {reunion.participants_count && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {reunion.participants_count} participants
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {reunion.location}
                </p>
              </div>
              <div className="ml-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    reunion.status === "SCHEDULED"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {reunion.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
