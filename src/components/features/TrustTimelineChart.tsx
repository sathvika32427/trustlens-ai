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
  return (
    <div className="tl-panel">
      <h3 className="tl-panel-title">Trust Timeline</h3>
      <p className="mb-4 text-sm text-[var(--tl-text-muted)]">
        Monthly trust score evolution over 36 months.
      </p>
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
          Latest: <strong className="text-white">{data[data.length - 1]?.trust_score}%</strong>
        </span>
        <span>
          Start: <strong className="text-white">{data[0]?.trust_score}%</strong>
        </span>
      </div>
    </div>
  );
}
