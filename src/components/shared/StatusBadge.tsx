type StatusType = "Approved" | "Overridden" | "Escalated" | "Pending";

const styles: Record<StatusType, string> = {
  Approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Overridden: "bg-amber-100 text-amber-800 border-amber-200",
  Escalated: "bg-purple-100 text-purple-800 border-purple-200",
  Pending: "bg-slate-100 text-slate-700 border-slate-200",
};

interface StatusBadgeProps {
  status: StatusType;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold uppercase tracking-wide ${sizeClass} ${styles[status]}`}
    >
      {status === "Pending" ? "Pending Review" : status}
    </span>
  );
}
