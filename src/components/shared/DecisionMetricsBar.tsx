import { TrendingDown, TrendingUp } from "lucide-react";
import { DecisionMetrics } from "../../types";

interface DecisionMetricsBarProps {
  metrics: DecisionMetrics;
  title?: string;
}

const items: {
  key: keyof Pick<DecisionMetrics, "approved" | "overridden" | "escalated" | "pending">;
  label: string;
  color: string;
  trendKey: keyof DecisionMetrics["trends"];
  invertTrend?: boolean;
}[] = [
  {
    key: "approved",
    label: "Approved Decisions",
    color: "from-emerald-500 to-teal-500",
    trendKey: "approved",
  },
  {
    key: "overridden",
    label: "Overridden Decisions",
    color: "from-amber-500 to-orange-500",
    trendKey: "overridden",
    invertTrend: true,
  },
  {
    key: "escalated",
    label: "Escalated Decisions",
    color: "from-purple-500 to-violet-500",
    trendKey: "escalated",
  },
  {
    key: "pending",
    label: "Pending Decisions",
    color: "from-blue-500 to-indigo-500",
    trendKey: "pending",
    invertTrend: true,
  },
];

export default function DecisionMetricsBar({
  metrics,
  title = "Decision Overview",
}: DecisionMetricsBarProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((item) => {
          const value = metrics[item.key];
          const trend = metrics.trends[item.trendKey];
          const positive = item.invertTrend ? trend <= 0 : trend >= 0;
          const TrendIcon = positive ? TrendingUp : TrendingDown;

          return (
            <div key={item.key} className="rounded-xl bg-slate-50 p-4">
              <div className={`mb-3 h-1 w-12 rounded-full bg-gradient-to-r ${item.color}`} />
              <p className="text-sm font-medium text-slate-600">{item.label}</p>
              <p className="mt-1 font-display text-3xl font-bold text-slate-900">{value}</p>
              <p
                className={`mt-2 flex items-center gap-1 text-xs font-semibold ${positive ? "text-emerald-600" : "text-amber-600"}`}
              >
                <TrendIcon className="h-3 w-3" />
                {trend >= 0 ? "+" : ""}
                {trend}% trend
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
