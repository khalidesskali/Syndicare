import React from "react";
import { Megaphone, Calendar, MapPin, Users, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useResidentMeetings } from "@/hooks/useResidentMeetings";
import { Skeleton } from "@/components/ui/skeleton";

const Announcements: React.FC = () => {
  const {
    upcomingMeetings,
    loading: meetingsLoading,
    error: meetingsError,
  } = useResidentMeetings();

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMeetingRelativeTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Passed";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `In ${diffDays} days`;
    return `In ${Math.floor(diffDays / 7)} weeks`;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Building Notices
          </h1>
          <p className="text-slate-600 mt-2">
            Important schedules and meetings for your building community
          </p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-100 flex items-center gap-2 text-blue-700 text-sm font-medium">
          <Megaphone className="h-4 w-4" />
          {upcomingMeetings.length} Scheduled Events
        </div>
      </div>

      {/* Scheduled Meetings Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">
            Upcoming General Meetings
          </h2>
        </div>

        {meetingsLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))}
          </div>
        ) : meetingsError ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-10 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
              <h3 className="text-red-800 font-bold mb-1">
                Failed to Load Meetings
              </h3>
              <p className="text-red-600 text-sm">{meetingsError}</p>
            </CardContent>
          </Card>
        ) : upcomingMeetings.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
            <CardContent className="p-16 text-center">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                All Clear!
              </h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                There are no upcoming meetings scheduled for your building at
                the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {upcomingMeetings.map((meeting) => (
              <Card
                key={meeting.id}
                className="hover:shadow-lg transition-all duration-300 border-none shadow-sm overflow-hidden"
              >
                <div className="bg-blue-600 h-2 w-full"></div>
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-bold uppercase tracking-widest text-[10px]">
                          {meeting.status}
                        </Badge>
                        <span className="text-blue-600 font-bold text-xs uppercase tracking-tighter">
                          {getMeetingRelativeTime(meeting.date_time)}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-slate-900 mb-3">
                        {meeting.title}
                      </h3>

                      <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                        {meeting.topic}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <Calendar className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              Date & Time
                            </p>
                            <p className="text-xs font-semibold">
                              {formatDateTime(meeting.date_time)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <MapPin className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              Location
                            </p>
                            <p className="text-xs font-semibold">
                              {meeting.location || "Community Hall"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white flex items-center gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-blue-400" />
            Participation Matters
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Building meetings are your chance to voice concerns and vote on
            important building decisions. We encourage all residents to attend
            and stay engaged with the community.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      </div>
    </div>
  );
};

export default Announcements;
