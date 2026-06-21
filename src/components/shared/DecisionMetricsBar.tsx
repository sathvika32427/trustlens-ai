import { TrendingDown, TrendingUp } from "lucide-react";

interface Metrics {
  total: number;
  approved: number;
  overridden: number;
  escalated: number;
  pending: number;
  trends: { approved: number; overridden: number; escalated: number; pending: number };
}

const ITEMS = [
  { key: "approved" as const, label: "Approved Decisions", trend: "approved" as const },
  { key: "overridden" as const, label: "Overridden Decisions", trend: "overridden" as const, invert: true },
  { key: "escalated" as const, label: "Escalated Decisions", trend: "escalated" as const },
  { key: "pending" as const, label: "Pending Decisions", trend: "pending" as const, invert: true },
];

export default function DecisionMetricsBar({ metrics, title = "Decision Overview" }: { metrics: Metrics; title?: string }) {
  return (
    <section className="tl-panel">
      <h2 className="tl-panel-title">{title}</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {ITEMS.map(({ key, label, trend, invert }) => {
          const value = metrics[key];
          const t = metrics.trends[trend];
          const positive = invert ? t <= 0 : t >= 0;
          const TrendIcon = positive ? TrendingUp : TrendingDown;
          return (
            <div key={key} className="rounded-xl bg-[var(--tl-bg-elevated)] p-4">
              <p className="text-sm text-[var(--tl-text-secondary)]">{label}</p>
              <p className="mt-1 font-display text-3xl font-bold text-white">{value}</p>
              <p className={`mt-2 flex items-center gap-1 text-xs font-semibold ${positive ? "text-[var(--tl-success)]" : "text-[var(--tl-warning)]"}`}>
                <TrendIcon className="h-3 w-3" />
                {t >= 0 ? "+" : ""}{t}%
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
