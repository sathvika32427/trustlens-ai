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

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="tl-panel tl-panel-interactive"
      >
        <h3 className="tl-panel-title">Trust Breakdown</h3>
        <p className="mb-2 text-sm text-[var(--tl-text-muted)]">
          Trust Index is not a black box — weighted components shown below.
        </p>
        <p className="mb-4 font-display text-4xl font-bold text-[var(--tl-dell-blue-light)]">
          {breakdown.trust_index}%
        </p>
        <div className="space-y-3">
          {components.map((c) => (
            <div key={c.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-[var(--tl-text-secondary)]">
                  {c.label}{" "}
                  <span className="text-[var(--tl-text-muted)]">(×{c.weight})</span>
                </span>
                <span className="font-bold text-white">{c.value.toFixed(1)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--tl-bg-elevated)]">
                <div
                  className="h-full rounded-full bg-[var(--tl-dell-blue)]"
                  style={{ width: `${c.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-[var(--tl-bg-elevated)] p-3 font-mono text-xs text-[var(--tl-text-muted)]">
          Trust Index = (Accuracy × {breakdown.weight_accuracy}) + (Approval ×{" "}
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
