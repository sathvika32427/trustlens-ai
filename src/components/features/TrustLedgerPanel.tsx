import { Shield, AlertCircle, TrendingUp } from "lucide-react";
import { TrustLedgerRow, RecommendationRow } from "../../types/datasets";

interface Props {
  recommendation: RecommendationRow;
  ledger?: TrustLedgerRow;
  onClick?: () => void;
}

export default function TrustLedgerPanel({ recommendation, ledger, onClick }: Props) {
  if (!ledger) {
    return (
      <div className="tl-panel">
        <h3 className="tl-panel-title">Trust Ledger</h3>
        <p className="text-sm text-[var(--tl-text-muted)]">No historical ledger data for this case.</p>
      </div>
    );
  }

  const weaknesses = ledger.known_weaknesses.split("; ").filter(Boolean);

  return (
    <div 
      onClick={onClick}
      className={`tl-panel border-[var(--tl-dell-blue)]/30 ${onClick ? "tl-panel-interactive" : ""}`}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="tl-panel-title flex items-center gap-2">
          <Shield className="h-5 w-5 text-[var(--tl-dell-blue)]" />
          Trust Ledger
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group rounded-lg bg-[var(--tl-bg-elevated)] px-4 py-2 text-center cursor-help">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--tl-text-muted)]">
              Confidence
            </p>
            <p className="text-lg font-bold text-[var(--tl-dell-blue-light)]">
              {recommendation.confidence}
            </p>
            <p className="text-xs text-[var(--tl-text-muted)]">{recommendation.confidence_score}%</p>

            {/* AI Explanation Tooltip */}
            <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 scale-95 rounded-xl border border-[var(--tl-border)] bg-slate-900/95 p-3 text-left text-xs text-[var(--tl-text-secondary)] shadow-2xl transition-all duration-150 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto">
              <p className="font-bold text-white mb-1">Why this confidence?</p>
              <ul className="space-y-1 list-disc pl-3 text-[10px] leading-tight text-[var(--tl-text-muted)]">
                <li>Evidence strength ({recommendation.confidence_score}%)</li>
                <li>Historical reliability</li>
                <li>Outcome history</li>
              </ul>
            </div>
          </div>
          <div className="rounded-lg bg-[var(--tl-success)]/15 px-4 py-2 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--tl-success)]">
              Reliability
            </p>
            <p className="text-lg font-bold text-[var(--tl-success)]">
              {ledger.historical_reliability_score}%
            </p>
          </div>
        </div>
      </div>

      <p className="mb-4 text-xs text-[var(--tl-text-muted)]">
        Confidence and historical reliability are shown together — never in isolation.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Past Similar Cases" value={ledger.past_similar_cases} />
        <Stat label="Correct Recommendations" value={ledger.correct_recommendations} positive />
        <Stat label="Incorrect Recommendations" value={ledger.incorrect_recommendations} warn />
        <Stat
          label="Historical Reliability"
          value={`${ledger.historical_reliability_score}%`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="mt-5 rounded-xl border border-[var(--tl-warning)]/30 bg-[var(--tl-warning)]/5 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-[var(--tl-warning)]">
          <AlertCircle className="h-4 w-4" />
          Known Weaknesses
        </p>
        <ul className="mt-2 space-y-1">
          {weaknesses.map((w) => (
            <li key={w} className="text-sm text-[var(--tl-text-secondary)]">
              • {w}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  positive,
  warn,
  icon,
}: {
  label: string;
  value: string | number;
  positive?: boolean;
  warn?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-[var(--tl-bg-elevated)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--tl-text-muted)]">
        {label}
      </p>
      <p
        className={`mt-1 flex items-center gap-2 font-display text-2xl font-bold ${
          positive ? "text-[var(--tl-success)]" : warn ? "text-[var(--tl-warning)]" : "text-white"
        }`}
      >
        {value}
        {icon}
      </p>
    </div>
  );
}
