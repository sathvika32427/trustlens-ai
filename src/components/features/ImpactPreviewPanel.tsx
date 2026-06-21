import { CheckCircle2, XCircle } from "lucide-react";
import { ImpactPreviewRow } from "../../types/datasets";

export default function ImpactPreviewPanel({ impact, onClick }: { impact?: ImpactPreviewRow; onClick?: () => void }) {
  if (!impact) return null;

  return (
    <div 
      onClick={onClick}
      className={`tl-panel ${onClick ? "tl-panel-interactive" : ""}`}
    >
      <h3 className="tl-panel-title">Impact Preview</h3>
      <p className="mb-4 text-sm text-[var(--tl-text-muted)]">
        Understand trade-offs before acting on this recommendation.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--tl-success)]/30 bg-[var(--tl-success)]/5 p-4">
          <p className="mb-3 flex items-center gap-2 font-bold text-[var(--tl-success)]">
            <CheckCircle2 className="h-5 w-5" />
            If Approved
          </p>
          <ul className="space-y-2 text-sm text-[var(--tl-text-secondary)]">
            <li>• {impact.if_approved_threat_contained}</li>
            <li>• {impact.if_approved_device_isolated}</li>
            <li>• {impact.if_approved_user_impact}</li>
          </ul>
        </div>
        <div className="rounded-xl border border-[var(--tl-danger)]/30 bg-[var(--tl-danger)]/5 p-4">
          <p className="mb-3 flex items-center gap-2 font-bold text-[var(--tl-danger)]">
            <XCircle className="h-5 w-5" />
            If Dismissed
          </p>
          <ul className="space-y-2 text-sm text-[var(--tl-text-secondary)]">
            <li>• {impact.if_dismissed_malware_spread}</li>
            <li>• {impact.if_dismissed_security_risk}</li>
            <li>• {impact.if_dismissed_business_impact}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
