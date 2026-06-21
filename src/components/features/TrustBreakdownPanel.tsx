import { useState } from "react";
import { TrustBreakdownRow } from "../../types/datasets";
import Modal from "../Modal";

export default function TrustBreakdownPanel({ breakdown }: { breakdown?: TrustBreakdownRow }) {
  const [showModal, setShowModal] = useState(false);
  if (!breakdown) return null;

  const components = [
    { label: "Accuracy", value: breakdown.accuracy, weight: breakdown.weight_accuracy },
    { label: "Approval Rate", value: breakdown.approval_rate, weight: breakdown.weight_approval_rate },
    { label: "Outcome Success", value: breakdown.outcome_success, weight: breakdown.weight_outcome_success },
    {
      label: "False Positive Inverse",
      value: 100 - breakdown.false_positive_rate,
      weight: breakdown.weight_false_positive_inverse,
    },
  ];

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (breakdown.trust_index / 100) * circumference;

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="tl-panel tl-panel-interactive"
      >
        <div className="flex items-center gap-5 mb-4">
          <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
            <svg className="h-full w-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-[var(--tl-dell-blue-light)] transition-all duration-1000 ease-out"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-display font-bold text-white text-xs">
              {Math.round(breakdown.trust_index)}%
            </span>
          </div>
          <div>
            <h3 className="tl-panel-title">🛡️ Trust Breakdown</h3>
            <p className="text-xs text-[var(--tl-text-muted)]">
              Weighted governance components computed across organization logs.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {components.map((c) => (
            <div key={c.label}>
              <div className="mb-1 flex justify-between text-xs font-semibold">
                <span className="text-[var(--tl-text-secondary)]">
                  {c.label}{" "}
                  <span className="text-[var(--tl-text-muted)]">(×{c.weight})</span>
                </span>
                <span className="text-white">{c.value.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--tl-bg-elevated)] border border-slate-700/40">
                <div
                  className="h-full rounded-full bg-[var(--tl-dell-blue)] animate-progress"
                  style={{ width: `${c.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-[var(--tl-bg-elevated)]/50 p-2.5 font-mono text-[10px] leading-relaxed text-[var(--tl-text-muted)] border border-[var(--tl-border)]/30">
          Composite Index = (Accuracy × {breakdown.weight_accuracy}) + (Approval ×{" "}
          {breakdown.weight_approval_rate}) + (Outcome × {breakdown.weight_outcome_success}) + ((100
          − FP) × {breakdown.weight_false_positive_inverse})
        </p>
      </div>

      {/* 12. Trust Score Breakdown Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Trust Index Calculation" accent="blue" size="md">
        <div className="space-y-4">
          <p className="text-xs text-[var(--tl-text-secondary)] leading-relaxed">
            The Trust Index is a weighted metric computed across all historical case decisions to evaluate recommendation health:
          </p>
          <div className="rounded-xl bg-[var(--tl-bg-elevated)] p-4 space-y-3">
            <div className="flex justify-between border-b border-[var(--tl-border)] pb-2 text-xs">
              <span className="text-[var(--tl-text-muted)]">Accuracy (Weight: {breakdown.weight_accuracy})</span>
              <span className="font-bold text-white">{breakdown.accuracy.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between border-b border-[var(--tl-border)] pb-2 text-xs">
              <span className="text-[var(--tl-text-muted)]">Approval Rate (Weight: {breakdown.weight_approval_rate})</span>
              <span className="font-bold text-white">{breakdown.approval_rate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between border-b border-[var(--tl-border)] pb-2 text-xs">
              <span className="text-[var(--tl-text-muted)]">Outcome Success (Weight: {breakdown.weight_outcome_success})</span>
              <span className="font-bold text-white">{breakdown.outcome_success.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between border-b border-[var(--tl-border)] pb-2 text-xs">
              <span className="text-[var(--tl-text-muted)]">False Positive Rate (Weight: {breakdown.weight_false_positive_inverse})</span>
              <span className="font-bold text-white">{breakdown.false_positive_rate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between pb-1 text-xs">
              <span className="text-[var(--tl-text-muted)]">Composite Trust Index</span>
              <span className="font-bold text-[var(--tl-dell-blue-light)]">{breakdown.trust_index.toFixed(1)}%</span>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--tl-border)] p-3 bg-slate-950 font-mono text-[10px] leading-relaxed text-[var(--tl-text-muted)]">
            <strong>Calculation Method:</strong><br />
            Trust Index = (Accuracy × {breakdown.weight_accuracy}) + (Approval × {breakdown.weight_approval_rate}) + (Outcome Success × {breakdown.weight_outcome_success}) + ((100 - FP Rate) × {breakdown.weight_false_positive_inverse})
          </div>
        </div>
      </Modal>
    </>
  );
}
