import { AlertTriangle } from "lucide-react";
import { LimitationRow } from "../../types/datasets";

interface Props {
  limitations: LimitationRow[];
  confidence: string;
}

export default function AILimitationAwareness({ limitations, confidence }: Props) {
  const hasLimitations = limitations && limitations.length > 0;

  // Determine overall severity based on the highest limitation severity
  let overallSeverity: "Low" | "Medium" | "High" = "Low";
  if (hasLimitations) {
    if (limitations.some((l) => l.severity === "High")) {
      overallSeverity = "High";
    } else if (limitations.some((l) => l.severity === "Medium")) {
      overallSeverity = "Medium";
    }
  }

  const severityColors = {
    High: "border-[var(--tl-danger)]/20 bg-[var(--tl-danger)]/5 text-[var(--tl-danger)]/80",
    Medium: "border-[var(--tl-warning)]/20 bg-[var(--tl-warning)]/5 text-[var(--tl-warning)]/80",
    Low: "border-[var(--tl-dell-blue)]/20 bg-[var(--tl-dell-blue)]/5 text-[var(--tl-dell-blue-light)]/80",
  };

  const badgeEmojis = {
    High: "🔴 High",
    Medium: "🟡 Medium",
    Low: "⚪ Low",
  };

  const getConfidenceLabel = (conf: string) => {
    if (conf === "High Confidence") return "🟢 High Confidence";
    if (conf === "Moderate Confidence") return "🟡 Moderate Confidence";
    return "🔴 Review Required";
  };

  return (
    <div className={`tl-panel !p-4 ${hasLimitations ? "border-[var(--tl-warning)]/15" : "border-slate-800"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--tl-border)]/40 pb-3">
        <div>
          <h3 className="tl-panel-title flex items-center gap-1.5 !text-base">
            <AlertTriangle className={`h-4.5 w-4.5 ${hasLimitations ? "text-[var(--tl-warning)]/80" : "text-[var(--tl-success)]/80"}`} />
            ⚠️ AI Limitation Awareness
          </h3>
          <p className="text-xs text-[var(--tl-text-muted)]">
            Identifies modeling gaps, missing event telemetry, or offline context parameters.
          </p>
        </div>
        <div className="flex gap-1.5">
          <div className="rounded-xl bg-slate-800/80 px-2.5 py-1 text-xs border border-slate-700/60">
            <span className="text-[var(--tl-text-muted)] font-medium">Confidence: </span>
            <span className="font-bold text-white">{getConfidenceLabel(confidence)}</span>
          </div>
          {hasLimitations && (
            <div className={`rounded-xl border px-2.5 py-1 text-xs font-bold bg-slate-800/60 border-slate-700/60 text-white`}>
              Severity: {badgeEmojis[overallSeverity]}
            </div>
          )}
        </div>
      </div>

      {!hasLimitations ? (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-[var(--tl-success)]/15 bg-[var(--tl-success)]/5 p-3 text-[var(--tl-success)]/80 text-xs">
          <span className="text-sm">🛡️</span>
          <div>
            <p className="font-bold text-white text-xs">Full Telemetry Coverage</p>
            <p className="mt-1 text-[11px] text-[var(--tl-text-secondary)] leading-relaxed">
              No known data limitations or device state anomalies detected. Telemetry streams are complete and historical models match the alert pattern.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-3.5">
          <div className={`flex items-start gap-2.5 rounded-xl border p-3 ${severityColors[overallSeverity]} text-xs`}>
            <span className="text-sm">⚠️</span>
            <div>
              <p className="font-bold text-white text-xs">AI Limitation Warning</p>
              <p className="mt-1 text-[11px] text-[var(--tl-text-secondary)] leading-relaxed">
                Known data boundaries have been flagged for this recommendation. Review the telemetry gaps below to identify missing logs or out-of-bounds parameters.
              </p>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[var(--tl-warning)]/80 uppercase tracking-wider">
                👥 Human review recommended.
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--tl-text-muted)]">
              Flagged Telemetry Gaps
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {limitations.map((lim) => (
                <div
                  key={lim.limitation_id}
                  className="rounded-xl border border-[var(--tl-border)]/50 bg-[var(--tl-bg-elevated)]/60 p-3 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-[var(--tl-border)]/30 pb-1.5">
                    <span className="font-display font-semibold text-white text-xs">
                      📌 {lim.limitation}
                    </span>
                    <span className="text-[9px] font-bold text-[var(--tl-text-secondary)]">
                      {badgeEmojis[lim.severity as "High" | "Medium" | "Low"]}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-[var(--tl-text-secondary)]">
                    <strong className="text-white">Impact: </strong>
                    {lim.impact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
