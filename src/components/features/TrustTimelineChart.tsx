import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrustTimelineRow } from "../../types/datasets";

export default function TrustTimelineChart({ data }: { data: TrustTimelineRow[] }) {
  const lastScore = data[data.length - 1]?.trust_score ?? 0;
  const prevScore = data[data.length - 2]?.trust_score ?? 0;
  const diff = lastScore - prevScore;
  
  let trendArrow = "➡ Stable";
  let trendClass = "text-[var(--tl-text-muted)]";
  
  if (diff > 0.1) {
    trendArrow = "⬆ Increasing";
    trendClass = "text-[var(--tl-success)]";
  } else if (diff < -0.1) {
    trendArrow = "⬇ Decreasing";
    trendClass = "text-[var(--tl-danger)]";
  }

  return (
    <div className="tl-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--tl-border)]/40 pb-3 mb-4">
        <div>
          <h3 className="tl-panel-title">📈 Trust Timeline</h3>
          <p className="text-xs text-[var(--tl-text-muted)]">
            Monthly trust score evolution over 36 months.
          </p>
        </div>
        <div className={`rounded-xl border border-slate-700/60 bg-slate-800/80 px-2.5 py-1 text-xs font-bold ${trendClass}`}>
          {trendArrow}
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--tl-border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={{ fill: "var(--tl-text-muted)", fontSize: 10 }}
              interval={5}
            />
            <YAxis
              domain={[65, 100]}
              tick={{ fill: "var(--tl-text-muted)", fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--tl-bg-elevated)",
                border: "1px solid var(--tl-border)",
                borderRadius: 8,
                color: "white",
              }}
              formatter={(v: number) => [`${v}%`, "Trust Score"]}
            />
            <Line
              type="monotone"
              dataKey="trust_score"
              stroke="var(--tl-dell-blue)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: "var(--tl-dell-blue-light)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--tl-text-muted)]">
        <span>
          Latest: <strong className="text-white">{lastScore}%</strong>
        </span>
        <span>
          Start: <strong className="text-white">{data[0]?.trust_score}%</strong>
        </span>
        <span>
          Shift: <strong className={trendClass}>{diff > 0 ? "+" : ""}{diff.toFixed(2)}% vs last month</strong>
        </span>
      </div>
    </div>
  );
}
