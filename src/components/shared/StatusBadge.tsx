import { RecommendationStatus } from "../../types/datasets";

const MAP: Record<RecommendationStatus | "Approved" | "Overridden" | "Escalated", string> = {
  Approved: "tl-badge-approved",
  Overridden: "tl-badge-overridden",
  Escalated: "tl-badge-escalated",
  Pending: "tl-badge-pending",
};

const LABELS: Record<string, string> = {
  Approved: "🟢 Approved",
  Overridden: "🔴 Overridden",
  Escalated: "🟠 Escalated",
  Pending: "🟡 Pending Review",
};

export default function StatusBadge({
  status,
}: {
  status: RecommendationStatus | "Approved" | "Overridden" | "Escalated" | "Pending";
}) {
  const label = LABELS[status] ?? status;
  return <span className={MAP[status] ?? "tl-badge-pending"}>{label}</span>;
}

