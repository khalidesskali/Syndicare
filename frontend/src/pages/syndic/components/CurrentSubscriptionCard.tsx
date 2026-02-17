import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Calendar,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrentSubscriptionCardProps {
  subscription: {
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    amount: number;
    currency: string;
    billingCycle: string;
  };
}

const CurrentSubscriptionCard = ({
  subscription,
}: CurrentSubscriptionCardProps) => {
  const { plan, startDate, endDate, amount, currency } = subscription;

  const today = new Date();
  const end = new Date(endDate);
  const start = new Date(startDate);
  const remainingDays = Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const isExpiringSoon = remainingDays > 0 && remainingDays <= 30;
  const isExpired = remainingDays <= 0;

  // ── Status config ──────────────────────────────────────────
  const statusConfig = isExpired
    ? {
        icon: XCircle,
        label: "Expired",
        badgeClass: "bg-red-100 text-red-700 border-red-200",
        daysClass: "text-red-600",
        progressClass: "[&>div]:bg-red-500",
        glow: "shadow-red-100",
      }
    : isExpiringSoon
      ? {
          icon: AlertTriangle,
          label: "Expiring Soon",
          badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
          daysClass: "text-amber-600",
          progressClass: "[&>div]:bg-amber-500",
          glow: "shadow-amber-100",
        }
      : {
          icon: CheckCircle2,
          label: "Active",
          badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
          daysClass: "text-emerald-600",
          progressClass: "[&>div]:bg-emerald-500",
          glow: "shadow-emerald-100",
        };

  const StatusIcon = statusConfig.icon;

  return (
    <Card
      className={cn(
        "w-full border-0 shadow-lg overflow-hidden",
        statusConfig.glow,
      )}
    >
      {/* ── Green gradient top band ── */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600" />

      <CardContent className="p-0">
        {/* ── Main content area ── */}
        <div className="p-6 pb-5">
          <div className="flex items-start justify-between gap-4">
            {/* Left — plan identity */}
            <div className="flex items-center gap-4">
              {/* Icon blob */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shadow-emerald-200 shrink-0">
                <Zap className="w-7 h-7 text-white" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-0.5">
                  Current Plan
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 leading-none">
                  {plan}
                </h2>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Billed monthly
                </p>
              </div>
            </div>

            {/* Right — status badge */}
            <Badge
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shrink-0",
                statusConfig.badgeClass,
              )}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </Badge>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {/* Start date */}
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                  Start Date
                </span>
              </div>
              <p className="text-sm font-bold text-gray-800">
                {new Date(startDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* End date */}
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                  Renews On
                </span>
              </div>
              <p className="text-sm font-bold text-gray-800">
                {new Date(endDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Monthly amount */}
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[11px] font-medium text-emerald-500 uppercase tracking-wide">
                  Monthly
                </span>
              </div>
              <p className="text-sm font-bold text-emerald-700 flex items-baseline gap-1">
                <span className="text-lg">{amount}</span>
                <span className="text-xs font-semibold">{currency}</span>
                <span className="text-[11px] font-normal text-emerald-500">
                  /mo
                </span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentSubscriptionCard;
