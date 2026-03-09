import React from "react";
import {
  Mail,
  Phone,
  Building,
  User,
  Calendar,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResidentProfile } from "../../hooks/useResidentProfile";
import { Skeleton } from "@/components/ui/skeleton";

const Profile: React.FC = () => {
  const { data, loading, error } = useResidentProfile();

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-800">
          Error Loading Profile
        </h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-600 mt-1">
            Manage your personal information and apartment details
          </p>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="border-none shadow-md bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 relative">
              <div className="bg-white/20 backdrop-blur-md rounded-full p-1 border border-white/30">
                <div className="bg-white rounded-full p-6">
                  <User className="h-14 w-14 text-blue-600" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white w-6 h-6 rounded-full shadow-lg"></div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight">
                {data?.first_name} {data?.last_name}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-blue-100 text-sm">
                  <Mail className="h-4 w-4" />
                  {data?.email}
                </div>
                <div className="flex items-center gap-1.5 text-blue-100 text-sm">
                  <Calendar className="h-4 w-4" />
                  Member since {formatDate(data?.created_at || "")}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        {/* Abstract background shape */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl text-white"></div>
      </Card>

      {/* Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <Card className="hover:shadow-md transition-shadow border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  First Name
                </p>
                <p className="text-slate-900 font-medium">
                  {data?.first_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Last Name
                </p>
                <p className="text-slate-900 font-medium">
                  {data?.last_name || "N/A"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Email Address
              </p>
              <div className="flex items-center gap-2">
                <p className="text-slate-900 font-medium">{data?.email}</p>
                <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-200 font-bold">
                  VERIFIED
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Account Role
              </p>
              <p className="text-slate-900 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Resident
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Home Information */}
        <Card className="hover:shadow-md transition-shadow border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              Apartment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.appartements && data.appartements.length > 0 ? (
              <div className="space-y-6">
                {data.appartements.map((apt, idx) => (
                  <div
                    key={apt.id}
                    className={`${idx > 0 ? "pt-6 border-t border-slate-100" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-slate-900">
                        {apt.building_name}
                      </h4>
                      <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded font-bold">
                        #{apt.number}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Floor
                        </p>
                        <p className="text-slate-900 font-medium">
                          {apt.floor}th Floor
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Monthly Charge
                        </p>
                        <p className="text-blue-600 font-bold">
                          {apt.monthly_charge} MAD
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <Building className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">
                  No apartments assigned yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Notice */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
        <div className="relative z-10 flex-1">
          <h3 className="text-xl font-bold mb-2">
            Need to change your details?
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
            For security reasons, some profile details can only be changed by
            the building management. Send a request if you need to update your
            primary email or apartment association.
          </p>
        </div>
        <div className="relative z-10">
          <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg">
            Send Request
          </button>
        </div>
        <User className="absolute -bottom-10 -right-10 h-48 w-48 text-white/5 group-hover:scale-105 transition-transform" />
      </div>
    </div>
  );
};

export default Profile;
