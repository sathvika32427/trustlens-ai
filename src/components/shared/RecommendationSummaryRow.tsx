import { ChevronRight } from "lucide-react";
import { AIRecommendation, Severity } from "../../types";
import StatusBadge from "./StatusBadge";

interface RecommendationSummaryRowProps {
  recommendation: AIRecommendation;
  onOpen: (rec: AIRecommendation) => void;
}

const severityColors: Record<Severity, string> = {
  [Severity.CRITICAL]: "bg-red-500",
  [Severity.HIGH]: "bg-orange-500",
  [Severity.MEDIUM]: "bg-amber-500",
  [Severity.LOW]: "bg-blue-500",
};

export default function RecommendationSummaryRow({
  recommendation,
  onOpen,
}: RecommendationSummaryRowProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(recommendation)}
      className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left transition hover:border-blue-300 hover:shadow-md"
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${severityColors[recommendation.severity]}`} />
      <span className="w-24 shrink-0 font-mono text-sm font-medium text-slate-500">
        {recommendation.id}
      </span>
      <span className="hidden flex-1 text-sm text-slate-600 sm:block">
        {recommendation.severity} priority · {recommendation.timestamp}
      </span>
      <StatusBadge status={recommendation.status} size="sm" />
      <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
        Open Explorer
        <ChevronRight className="h-4 w-4" />
      </span>
    </button>
  );
}
