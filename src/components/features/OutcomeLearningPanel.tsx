import { Brain } from "lucide-react";
import { OutcomeRow, TrustLedgerRow } from "../../types/datasets";

interface Props {
  outcome?: OutcomeRow;
  ledger?: TrustLedgerRow;
  outcomeStats: Record<string, number>;
}

const OUTCOME_COLORS: Record<string, string> = {
  "Recommendation Correct": "var(--tl-success)",
  "Recommendation Incorrect": "var(--tl-danger)",
  "False Positive": "var(--tl-warning)",
  "False Negative": "var(--tl-danger)",
};

export default function OutcomeLearningPanel({ outcome, ledger, outcomeStats }: Props) {
  const adjustedReliability = ledger
    ? Math.min(
        100,
        Math.max(
          0,
          ledger.historical_reliability_score +
            (outcome?.outcome_type === "Recommendation Correct" ? 0.5 : 0) -
            (outcome?.outcome_type === "False Positive" ? 1.2 : 0) -
            (outcome?.outcome_type === "False Negative" ? 2 : 0),
        ),
      )
    : null;

  return (
    <div className="tl-panel">
      <h3 className="tl-panel-title flex items-center gap-2">
        <Brain className="h-5 w-5 text-[var(--tl-dell-blue)]" />
        Outcome Learning
      </h3>
      <p className="mb-4 text-sm text-[var(--tl-text-muted)]">
        Outcomes feed back into Trust Ledger reliability calculations automatically.
      </p>

      {outcome?.outcome_type ? (
        <div
          className="mb-4 rounded-xl border p-4"
          style={{
            borderColor: OUTCOME_COLORS[outcome.outcome_type] ?? "var(--tl-border)",
            background: `color-mix(in srgb, ${OUTCOME_COLORS[outcome.outcome_type] ?? "gray"} 8%, transparent)`,
          }}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--tl-text-muted)]">
            This Case Outcome
          </p>
          <p className="mt-1 text-lg font-bold text-white">{outcome.outcome_type}</p>
          <p className="mt-2 text-sm text-[var(--tl-text-secondary)]">{outcome.outcome_description}</p>
          {outcome.resolved_at && (
            <p className="mt-2 text-xs text-[var(--tl-text-muted)]">Resolved: {outcome.resolved_at}</p>
          )}
        </div>
      ) : (
        <p className="mb-4 text-sm text-[var(--tl-text-muted)]">Outcome pending — case still open.</p>
      )}

      {adjustedReliability !== null && ledger && (
        <p className="mb-4 text-sm text-[var(--tl-text-secondary)]">
          Trust Ledger adjusted reliability:{" "}
          <strong className="text-[var(--tl-dell-blue-light)]">
            {ledger.historical_reliability_score}% → {adjustedReliability.toFixed(1)}%
          </strong>{" "}
          based on outcome patterns.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Object.entries(outcomeStats).map(([type, count]) => (
          <div key={type} className="rounded-xl bg-[var(--tl-bg-elevated)] p-3">
            <p className="text-[10px] font-bold uppercase text-[var(--tl-text-muted)]">{type}</p>
            <p className="font-display text-2xl font-bold text-white">{count as number}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
