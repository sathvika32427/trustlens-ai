import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { EvidenceWeightRow } from "../../types/datasets";

const COLORS = ["#007DB8", "#00A3E0", "#4CAF50", "#FF9800", "#9C27B0", "#607D8B", "#E91E63", "#795548"];

export default function EvidenceWeightingChart({ weights }: { weights: EvidenceWeightRow[] }) {
  if (!weights.length) return null;

  const chartData = weights.map((w) => ({
    name: w.evidence_type,
    value: w.weight_percentage,
    description: w.description,
  }));

  return (
    <div className="tl-panel">
      <h3 className="tl-panel-title">Evidence Weighting</h3>
      <p className="mb-4 text-sm text-[var(--tl-text-muted)]">
        Contribution percentages for each evidence signal — not a flat list.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--tl-bg-elevated)",
                  border: "1px solid var(--tl-border)",
                  borderRadius: 8,
                  color: "white",
                }}
                formatter={(v: number, _n, props) => [
                  `${v}%`,
                  (props.payload as { name: string }).name,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--tl-text-muted)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-2">
          {weights.map((w, i) => (
            <li
              key={w.evidence_type}
              className="flex items-start gap-3 rounded-lg bg-[var(--tl-bg-elevated)] p-3"
            >
              <span
                className="mt-1 h-3 w-3 shrink-0 rounded-full"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <div>
                <p className="font-bold text-white">
                  {w.evidence_type}{" "}
                  <span className="text-[var(--tl-dell-blue-light)]">{w.weight_percentage}%</span>
                </p>
                <p className="mt-1 text-xs text-[var(--tl-text-muted)]">{w.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
