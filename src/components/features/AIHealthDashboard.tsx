import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { AIHealthRow } from "../../types/datasets";
import Modal from "../Modal";

export default function AIHealthDashboard({ data }: { data: AIHealthRow[] }) {
  const [showHealthModal, setShowHealthModal] = useState(false);
  const latest = data[data.length - 1];
  const last30 = data.slice(-30);
  const avgAccuracy = last30.reduce((s, r) => s + r.accuracy, 0) / last30.length;

  const kpis = [
    { label: "Recommendations Today", value: latest.recommendations_today },
    { label: "Accuracy", value: `${latest.accuracy}%` },
    { label: "False Positives", value: latest.false_positives },
    { label: "Incidents", value: latest.incidents },
    { label: "Trust Index", value: `${latest.trust_index}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="tl-kpi">
            <p className="tl-kpi-label">{k.label}</p>
            <p className="tl-kpi-value">{k.value}</p>
          </div>
        ))}
      </div>

      <div onClick={() => setShowHealthModal(true)} className="tl-panel tl-panel-interactive">
        <h3 className="tl-panel-title">AI Performance Trends (30 days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last30}>
              <CartesianGrid stroke="var(--tl-border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "var(--tl-text-muted)", fontSize: 9 }} interval={6} />
              <YAxis yAxisId="left" tick={{ fill: "var(--tl-text-muted)", fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "var(--tl-text-muted)", fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--tl-bg-elevated)",
                  border: "1px solid var(--tl-border)",
                  borderRadius: 8,
                }}
              />
              <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="#4CAF50" strokeWidth={2} dot={false} name="Accuracy %" />
              <Line yAxisId="right" type="monotone" dataKey="trust_index" stroke="var(--tl-dell-blue)" strokeWidth={2} dot={false} name="Trust Index" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-sm text-[var(--tl-text-muted)]">
          30-day average accuracy: <strong className="text-white">{avgAccuracy.toFixed(1)}%</strong>
        </p>
      </div>

      <div className="tl-panel">
        <h3 className="tl-panel-title">Daily Incident & False Positive Volume</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last30}>
              <CartesianGrid stroke="var(--tl-border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "var(--tl-text-muted)", fontSize: 9 }} interval={6} />
              <YAxis tick={{ fill: "var(--tl-text-muted)", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "var(--tl-bg-elevated)", border: "1px solid var(--tl-border)" }} />
              <Bar dataKey="false_positives" fill="var(--tl-warning)" name="False Positives" radius={[2, 2, 0, 0]} />
              <Bar dataKey="incidents" fill="var(--tl-danger)" name="Incidents" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 16. AI Health Details Modal */}
      <Modal open={showHealthModal} onClose={() => setShowHealthModal(false)} title="AI Safeguard Diagnostics" accent="blue" size="md">
        <div className="space-y-4">
          <p className="text-xs text-[var(--tl-text-secondary)] leading-relaxed">
            Real-time diagnostics and continuous validation telemetry from AI safety layers:
          </p>
          <div className="rounded-xl bg-[var(--tl-bg-elevated)] p-4 space-y-3">
            <div className="flex justify-between border-b border-[var(--tl-border)] pb-2 text-xs">
              <span className="text-[var(--tl-text-muted)]">Latest Model Accuracy</span>
              <span className="font-bold text-[var(--tl-success)]">{latest.accuracy}%</span>
            </div>
            <div className="flex justify-between border-b border-[var(--tl-border)] pb-2 text-xs">
              <span className="text-[var(--tl-text-muted)]">30-Day Average Accuracy</span>
              <span className="font-bold text-white">{avgAccuracy.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between border-b border-[var(--tl-border)] pb-2 text-xs">
              <span className="text-[var(--tl-text-muted)]">False Positive Rate</span>
              <span className="font-bold text-[var(--tl-warning)]">{latest.false_positives} cases</span>
            </div>
            <div className="flex justify-between border-b border-[var(--tl-border)] pb-2 text-xs">
              <span className="text-[var(--tl-text-muted)]">Recent Incidents Count</span>
              <span className="font-bold text-[var(--tl-danger)]">{latest.incidents} active</span>
            </div>
            <div className="flex justify-between pb-1 text-xs">
              <span className="text-[var(--tl-text-muted)]">System Reliability Score</span>
              <span className="font-bold text-[var(--tl-dell-blue-light)]">99.98%</span>
            </div>
          </div>
          <p className="text-[10px] text-[var(--tl-text-muted)] leading-relaxed">
            Safeguards validation checks occur every 5 minutes across all active endpoint monitoring groups.
          </p>
        </div>
      </Modal>
    </div>
  );
}
