import React from "react";
import { Megaphone, Calendar, User, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockAnnouncements } from "../../data/mockData";
import { useResidentMeetings } from "@/hooks/useResidentMeetings";

const Announcements: React.FC = () => {
  const {
    upcomingMeetings,
    loading: meetingsLoading,
    error: meetingsError,
  } = useResidentMeetings();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
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
    if (diffDays <= 30) return `In ${Math.floor(diffDays / 7)} weeks`;
    return `In ${diffDays} days`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Announcements</h1>
        <p className="text-slate-600 mt-2">
          Stay updated with the latest building news and notices
        </p>
      </div>

      {/* Scheduled Meetings Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-900">
            Scheduled Meetings
          </h2>
        </div>

        {meetingsLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading meetings...</p>
            </CardContent>
          </Card>
        ) : meetingsError ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600">
                Error loading meetings: {meetingsError}
              </p>
            </CardContent>
          </Card>
        ) : upcomingMeetings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No Scheduled Meetings
              </h3>
              <p className="text-muted-foreground">
                There are no upcoming meetings scheduled at this time.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <Card
                key={meeting.id}
                className="hover:shadow-md transition-shadow duration-200 border-blue-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="bg-blue-100 rounded-lg p-3">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {meeting.title}
                          </h3>
                          <Badge variant="secondary" className="mb-2">
                            {meeting.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600">
                            {getMeetingRelativeTime(meeting.date_time)}
                          </div>
                        </div>
                      </div>

                      <p className="text-slate-600 mb-4 leading-relaxed">
                        {meeting.topic}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateTime(meeting.date_time)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {meeting.location || "Building Community Hall"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Building:</span>{" "}
                          {meeting.building_name}
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

      {/* Empty State (for when no announcements) */}
      {mockAnnouncements.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No Announcements
            </h3>
            <p className="text-muted-foreground">
              There are no announcements at this time.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-900">
                Stay Informed
              </h3>
              <p className="text-blue-700">
                Check this page regularly for important building updates,
                maintenance schedules, and community events.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Announcements;
