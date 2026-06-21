import { motion } from "motion/react";
import {
  TrendingDown,
  TrendingUp,
  LayoutList,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Clock,
  LucideIcon,
} from "lucide-react";
import { DecisionMetrics } from "../../types";

interface KpiSectionProps {
  metrics: DecisionMetrics;
}

const kpiConfig: {
  key: keyof Pick<DecisionMetrics, "total" | "approved" | "overridden" | "escalated" | "pending">;
  label: string;
  gradient: string;
  icon: LucideIcon;
  trendKey?: keyof DecisionMetrics["trends"];
}[] = [
  {
    key: "total",
    label: "Total Recommendations",
    gradient: "from-slate-600 to-slate-800",
    icon: LayoutList,
  },
  {
    key: "approved",
    label: "Approved",
    gradient: "from-emerald-500 to-teal-600",
    icon: CheckCircle2,
    trendKey: "approved",
  },
  {
    key: "overridden",
    label: "Overridden",
    gradient: "from-amber-500 to-orange-600",
    icon: XCircle,
    trendKey: "overridden",
  },
  {
    key: "escalated",
    label: "Escalated",
    gradient: "from-purple-500 to-violet-600",
    icon: ArrowUpRight,
    trendKey: "escalated",
  },
  {
    key: "pending",
    label: "Pending Review",
    gradient: "from-blue-500 to-indigo-600",
    icon: Clock,
    trendKey: "pending",
  },
];

export default function KpiSection({ metrics }: KpiSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {kpiConfig.map((kpi, i) => {
        const value = metrics[kpi.key];
        const trend = kpi.trendKey ? metrics.trends[kpi.trendKey] : null;
        const TrendIcon = trend !== null && trend >= 0 ? TrendingUp : TrendingDown;
        const trendColor =
          trend === null
            ? ""
            : kpi.key === "overridden" || kpi.key === "pending"
              ? trend <= 0
                ? "text-emerald-600"
                : "text-amber-600"
              : trend >= 0
                ? "text-emerald-600"
                : "text-amber-600";

        return (
          <motion.div
            key={kpi.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="kpi-card overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md"
          >
            <div className={`h-1.5 bg-gradient-to-r ${kpi.gradient}`} />
            <div className="p-4 lg:p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {kpi.label}
              </p>
              <p className="mt-1 font-display text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
                {value}
              </p>
              {trend !== null && (
                <p className={`mt-2 flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
                  <TrendIcon className="h-3.5 w-3.5" />
                  {trend >= 0 ? "+" : ""}
                  {trend}% vs last week
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
