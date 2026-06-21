import { TrendingDown, TrendingUp, LayoutList, CheckCircle2, XCircle, ArrowUpRight, Clock } from "lucide-react";

interface Metrics {
  total: number;
  approved: number;
  overridden: number;
  escalated: number;
  pending: number;
  trends: { approved: number; overridden: number; escalated: number; pending: number };
}

const CONFIG = [
  { key: "total" as const, label: "Total Recommendations", icon: LayoutList },
  { key: "approved" as const, label: "Approved", icon: CheckCircle2, trend: "approved" as const },
  { key: "overridden" as const, label: "Overridden", icon: XCircle, trend: "overridden" as const, invert: true },
  { key: "escalated" as const, label: "Escalated", icon: ArrowUpRight, trend: "escalated" as const },
  { key: "pending" as const, label: "Pending Review", icon: Clock, trend: "pending" as const, invert: true },
];

export default function KpiSection({ metrics }: { metrics: Metrics }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {CONFIG.map(({ key, label, icon: Icon, trend, invert }) => {
        const value = metrics[key];
        const t = trend ? metrics.trends[trend] : null;
        const positive = t === null ? null : invert ? t <= 0 : t >= 0;
        const TrendIcon = positive ? TrendingUp : TrendingDown;
        return (
          <div key={key} className="tl-kpi">
            <div className="mb-2 flex items-center gap-2">
              <Icon className="h-4 w-4 text-[var(--tl-dell-blue)]" />
              <p className="tl-kpi-label">{label}</p>
            </div>
            <p className="tl-kpi-value">{value}</p>
            {t !== null && (
              <p className={`mt-2 flex items-center gap-1 text-xs font-semibold ${positive ? "text-[var(--tl-success)]" : "text-[var(--tl-warning)]"}`}>
                <TrendIcon className="h-3 w-3" />
                {t >= 0 ? "+" : ""}
                {t}% vs last week
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
