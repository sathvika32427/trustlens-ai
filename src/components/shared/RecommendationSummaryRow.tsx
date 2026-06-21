import { RecommendationRow } from "../../types/datasets";
import StatusBadge from "./StatusBadge";
import { ChevronRight, AlertTriangle, Database } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";

const SEV_COLOR: Record<string, string> = {
  Critical: "bg-[var(--tl-danger)]",
  High: "bg-[var(--tl-warning)]",
  Medium: "bg-[var(--tl-dell-blue)]",
  Low: "bg-[var(--tl-text-muted)]",
};

export default function RecommendationSummaryRow({
  recommendation,
  onOpen,
}: {
  recommendation: RecommendationRow;
  onOpen: (rec: RecommendationRow) => void;
}) {
  const { indexes } = useAppData();
  const limitations = indexes?.limitations.get(recommendation.recommendation_id) ?? [];
  const sources = indexes?.dataSources.get(recommendation.recommendation_id) ?? [];
  const hasLimitations = limitations.length > 0;

  return (
    <button
      type="button"
      onClick={() => onOpen(recommendation)}
      className="flex w-full items-center gap-4 rounded-xl border border-[var(--tl-border)] bg-[var(--tl-bg-elevated)] px-4 py-3.5 text-left transition hover:border-[var(--tl-dell-blue)]"
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${SEV_COLOR[recommendation.severity] ?? SEV_COLOR.Low}`} />
      <span className="w-28 shrink-0 font-mono text-sm text-[var(--tl-dell-blue-light)]">
        {recommendation.recommendation_id}
      </span>
      <div className="hidden flex-1 items-center gap-3 text-sm text-[var(--tl-text-muted)] sm:flex">
        <span>{recommendation.severity} · {recommendation.timestamp}</span>
        {hasLimitations && (
          <span className="flex items-center gap-1 rounded-full border border-[var(--tl-warning)]/20 bg-[var(--tl-warning)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--tl-warning)]">
            <AlertTriangle className="h-3 w-3" />
            {limitations.length} Gaps
          </span>
        )}
        <span className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-[var(--tl-text-secondary)]">
          <Database className="h-3 w-3 text-[var(--tl-dell-blue-light)]" />
          {sources.length} Sources
        </span>
      </div>
      <StatusBadge status={recommendation.status} />
      <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--tl-dell-blue-light)]">
        Explorer
        <ChevronRight className="h-4 w-4" />
      </span>
    </button>
  );
}
