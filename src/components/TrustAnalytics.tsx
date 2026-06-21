import { BarChart3, Info, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { AIRecommendation, AuditRecord } from "../types";
import { computeTrustMetrics } from "../utils/metrics";

interface TrustAnalyticsProps {
  recommendations: AIRecommendation[];
  auditRecords: AuditRecord[];
}

export default function TrustAnalytics({
  recommendations,
  auditRecords,
}: TrustAnalyticsProps) {
  const trust = computeTrustMetrics(recommendations, auditRecords);

  const metrics = [
    { label: "Approval Rate", value: trust.approvalRate, color: "bg-emerald-500", suffix: "%" },
    { label: "Override Rate", value: trust.overrideRate, color: "bg-amber-500", suffix: "%" },
    {
      label: "Escalation Rate",
      value: trust.escalationRate,
      color: "bg-purple-500",
      suffix: "%",
    },
    {
      label: "Successful Outcomes",
      value: trust.successfulOutcomes,
      color: "bg-teal-500",
      suffix: "%",
    },
    {
      label: "False Positive Rate",
      value: trust.falsePositiveRate,
      color: "bg-red-500",
      suffix: "%",
    },
  ];

  return (
    <div className="mesh-bg flex-1 overflow-y-auto">
      <div className="border-b border-slate-200/60 bg-white/70 px-5 py-6 backdrop-blur-sm lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
            <BarChart3 className="h-4 w-4" />
            Trust Analytics · Organization
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 lg:text-4xl">
            AI Trust Index
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            Transparent metrics showing how human reviewers interact with AI recommendations.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-5 py-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hero-gradient relative overflow-hidden rounded-3xl p-8 text-white shadow-xl"
        >
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                Overall Trust Index
              </p>
              <p className="mt-2 font-display text-6xl font-bold">{trust.trustIndex}%</p>
              <p className="mt-3 flex items-center gap-2 text-sm text-blue-100">
                <TrendingUp className="h-4 w-4 text-emerald-300" />
                +4% improvement over last quarter
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase text-blue-200">Health Status</p>
              <p className="mt-1 text-lg font-bold">
                {trust.trustIndex >= 80 ? "Strong Trust" : "Needs Review"}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className={`mb-3 h-1.5 w-full rounded-full ${m.color}`} />
              <p className="text-sm font-medium text-slate-600">{m.label}</p>
              <p className="mt-1 font-display text-3xl font-bold text-slate-900">
                {m.value}
                {m.suffix}
              </p>
            </motion.div>
          ))}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                How the Trust Index is Calculated
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                The Overall Trust Index is a weighted composite score (0–100%) derived from human
                review patterns:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>
                  <strong>35%</strong> — Approval Rate (higher is better when decisions align with
                  outcomes)
                </li>
                <li>
                  <strong>25%</strong> — Inverse Override Rate (fewer overrides suggest better AI
                  alignment)
                </li>
                <li>
                  <strong>15%</strong> — Inverse Escalation Rate (fewer escalations suggest clearer
                  cases)
                </li>
                <li>
                  <strong>15%</strong> — Successful Outcomes (verified threat containment or
                  confirmed safe)
                </li>
                <li>
                  <strong>10%</strong> — Inverse False Positive Rate (lower false alarms improve
                  trust)
                </li>
              </ul>
              <div className="mt-5 rounded-xl bg-slate-50 p-4 font-mono text-xs text-slate-600">
                Trust Index = (Approval × 0.35) + ((100 − Override) × 0.25) + ((100 − Escalation) ×
                0.15) + (Successful Outcomes × 0.15) + ((100 − False Positive) × 0.10)
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Current calculation: ({trust.approvalRate} × 0.35) + ({100 - trust.overrideRate} ×
                0.25) + ({100 - trust.escalationRate} × 0.15) + ({trust.successfulOutcomes} ×
                0.15) + ({100 - trust.falsePositiveRate} × 0.10) ≈{" "}
                <strong>{trust.trustIndex}%</strong>
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-slate-900">Decision Distribution</h2>
          <div className="mt-4 flex h-8 overflow-hidden rounded-full">
            <div
              className="bg-emerald-500"
              style={{ width: `${trust.approvalRate}%` }}
              title={`Approved ${trust.approvalRate}%`}
            />
            <div
              className="bg-amber-500"
              style={{ width: `${trust.overrideRate}%` }}
              title={`Overridden ${trust.overrideRate}%`}
            />
            <div
              className="bg-purple-500"
              style={{ width: `${trust.escalationRate}%` }}
              title={`Escalated ${trust.escalationRate}%`}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Approved{" "}
              {trust.approvalRate}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Overridden{" "}
              {trust.overrideRate}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Escalated{" "}
              {trust.escalationRate}%
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
