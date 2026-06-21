import { Building2, Users, Clock, Shield } from "lucide-react";
import { BusinessImpactRow } from "../../types/datasets";

export default function BusinessImpactScore({ impact, onClick }: { impact?: BusinessImpactRow; onClick?: () => void }) {
  if (!impact) return null;

  return (
    <div 
      onClick={onClick}
      className={`tl-panel border-[var(--tl-dell-blue)]/20 ${onClick ? "tl-panel-interactive" : ""}`}
    >
      <h3 className="tl-panel-title flex items-center gap-2">
        <Building2 className="h-5 w-5 text-[var(--tl-dell-blue)]" />
        Business Impact Score
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<Users className="h-5 w-5" />} label="Affected Users" value={impact.affected_users} />
        <Metric icon={<Clock className="h-5 w-5" />} label="Potential Downtime" value={`${impact.potential_downtime_hours}h`} />
        <Metric icon={<Shield className="h-5 w-5" />} label="Risk Reduction" value={`${impact.risk_reduction_pct}%`} />
        <Metric icon={<Building2 className="h-5 w-5" />} label="Impact Level" value={impact.impact_level} />
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-[var(--tl-bg-elevated)] p-4">
      <div className="mb-2 text-[var(--tl-dell-blue)]">{icon}</div>
      <p className="text-xs font-semibold uppercase text-[var(--tl-text-muted)]">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
