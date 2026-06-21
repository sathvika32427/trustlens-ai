import { Clock } from "lucide-react";
import { RecommendationAgingRow, AgingStatus } from "../../types/datasets";

const STATUS_STYLE: Record<AgingStatus, string> = {
  Healthy: "bg-[var(--tl-success)]/20 text-[var(--tl-success)] border-[var(--tl-success)]/40",
  Warning: "bg-[var(--tl-warning)]/20 text-[var(--tl-warning)] border-[var(--tl-warning)]/40",
  Critical: "bg-[var(--tl-danger)]/20 text-[var(--tl-danger)] border-[var(--tl-danger)]/40",
};

export default function RecommendationAgingIndicator({ aging }: { aging?: RecommendationAgingRow }) {
  if (!aging) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${STATUS_STYLE[aging.aging_status]}`}
    >
      <Clock className="h-4 w-4" />
      {aging.age_days} days · {aging.aging_status}
      <span className="text-xs font-normal opacity-80">
        ({aging.aging_status === "Healthy" ? "0–7 days" : aging.aging_status === "Warning" ? "8–14 days" : "15+ days"})
      </span>
    </div>
  );
}
