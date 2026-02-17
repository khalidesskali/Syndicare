import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Shield, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
  id: number;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  popular: boolean;
}

interface PlanCardProps {
  plan: Plan;
  billingCycle: "monthly" | "annual";
  selected: boolean;
  onSelect: (planId: number) => void;
}

type PlanName = "Basic" | "Professional" | "Enterprise";

const planConfig: Record<
  PlanName,
  {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    activeIconBg: string;
    border: string;
    activeBorder: string;
    activeRing: string;
    activeBg: string;
    checkCircle: string;
    activeCheckCircle: string;
    checkColor: string;
    nameColor: string;
    badgeClass: string;
    btnActive: string;
  }
> = {
  Basic: {
    icon: Shield,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    activeIconBg: "bg-slate-600",
    border: "border-gray-200 hover:border-slate-400",
    activeBorder: "border-slate-600",
    activeRing: "ring-2 ring-slate-200",
    activeBg: "bg-slate-50/50",
    checkCircle: "bg-slate-100",
    activeCheckCircle: "bg-slate-600",
    checkColor: "text-slate-500",
    nameColor: "text-slate-700",
    badgeClass: "bg-slate-600 text-white hover:bg-slate-700",
    btnActive: "bg-slate-600 hover:bg-slate-700 text-white border-transparent",
  },
  Professional: {
    icon: Zap,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    activeIconBg: "bg-blue-500",
    border: "border-gray-200 hover:border-blue-400",
    activeBorder: "border-blue-500",
    activeRing: "ring-2 ring-blue-100",
    activeBg: "bg-blue-50/40",
    checkCircle: "bg-blue-50",
    activeCheckCircle: "bg-blue-500",
    checkColor: "text-blue-500",
    nameColor: "text-blue-600",
    badgeClass: "bg-blue-500 text-white hover:bg-blue-600",
    btnActive: "bg-blue-500 hover:bg-blue-600 text-white border-transparent",
  },
  Enterprise: {
    icon: Star,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    activeIconBg: "bg-emerald-500",
    border: "border-gray-200 hover:border-emerald-400",
    activeBorder: "border-emerald-500",
    activeRing: "ring-2 ring-emerald-100",
    activeBg: "bg-emerald-50/40",
    checkCircle: "bg-emerald-50",
    activeCheckCircle: "bg-emerald-500",
    checkColor: "text-emerald-500",
    nameColor: "text-emerald-600",
    badgeClass: "bg-emerald-500 text-white hover:bg-emerald-600",
    btnActive:
      "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent",
  },
};

const PlanCard = ({
  plan,
  billingCycle,
  selected,
  onSelect,
}: PlanCardProps) => {
  const price =
    billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
  const cfg = planConfig[plan.name as PlanName] ?? planConfig["Basic"];
  const Icon = cfg.icon;

  return (
    <div
      onClick={() => onSelect(plan.id)}
      className={cn(
        // Structure
        "relative w-full min-w-0 h-full flex flex-col",
        "rounded-xl border-2 bg-white cursor-pointer",
        // Transitions
        "transition-all duration-200 ease-out shadow-sm hover:shadow-md",
        // State
        selected
          ? cn(cfg.activeBorder, cfg.activeRing, cfg.activeBg)
          : cfg.border,
      )}
    >
      {/* Popular badge — centered at top */}
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
          <Badge
            className={cn(
              "px-3 py-1 text-xs font-semibold rounded-full shadow-sm",
              cfg.badgeClass,
            )}
          >
            <Star className="w-3 h-3 mr-1 fill-white" />
            Most Popular
          </Badge>
        </div>
      )}

      {/* Selected tick — top right */}
      {selected && (
        <div
          className={cn(
            "absolute top-3.5 right-3.5 w-6 h-6 rounded-full flex items-center justify-center shadow-sm",
            cfg.activeIconBg,
          )}
        >
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
      )}

      {/* ── All content in one padded block ── */}
      <div className="flex flex-col h-full p-5 pt-6 gap-4">
        {/* Plan identity row */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              selected ? cfg.activeIconBg : cfg.iconBg,
            )}
          >
            <Icon
              className={cn("w-5 h-5", selected ? "text-white" : cfg.iconColor)}
            />
          </div>
          <div className="min-w-0">
            <p className={cn("font-bold text-sm leading-tight", cfg.nameColor)}>
              {plan.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed break-words">
              {plan.description}
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tracking-tight text-gray-900 leading-none">
            {price}
          </span>
          <span className="text-base font-semibold text-gray-400 mb-0.5">
            DH
          </span>
          <span className="text-xs text-gray-400 ml-0.5">/month</span>
        </div>

        <Separator />

        {/* Features — flex-1 pushes button to bottom */}
        <ul className="space-y-2 flex-1">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <div
                className={cn(
                  "mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center",
                  selected ? cfg.activeCheckCircle : cfg.checkCircle,
                )}
              >
                <Check
                  className={cn(
                    "w-2.5 h-2.5",
                    selected ? "text-white" : cfg.checkColor,
                  )}
                  strokeWidth={3}
                />
              </div>
              <span className="text-xs text-gray-600 leading-relaxed min-w-0 break-words">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* Select button */}
        <button
          className={cn(
            "w-full py-2.5 rounded-lg text-xs font-semibold border",
            "flex items-center justify-center gap-1.5",
            "transition-all duration-150",
            selected
              ? cfg.btnActive
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700",
          )}
        >
          {selected ? (
            <>
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              Selected
            </>
          ) : (
            "Select Plan"
          )}
        </button>
      </div>
    </div>
  );
};

export default PlanCard;
