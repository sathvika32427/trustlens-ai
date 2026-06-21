import { AlertOctagon, CheckCircle2 } from "lucide-react";
import { IncidentCardRow } from "../../types/datasets";

export default function AIIncidentCardPanel({ incidents, onIncidentClick }: { incidents: IncidentCardRow[]; onIncidentClick?: (inc: IncidentCardRow) => void }) {
  if (!incidents.length) {
    return (
      <div className="tl-panel border-emerald-500/20 bg-emerald-500/5">
        <h3 className="tl-panel-title flex items-center gap-2 text-[var(--tl-success)]">
          <CheckCircle2 className="h-5 w-5" />
          AI Incident Cards
        </h3>
        <p className="mt-4 text-sm font-bold text-white">No Incidents Found</p>
        <p className="text-xs text-[var(--tl-text-muted)] mt-1">System operating normally.</p>
      </div>
    );
  }

  return (
    <div className="tl-panel border-[var(--tl-danger)]/30">
      <h3 className="tl-panel-title flex items-center gap-2 text-[var(--tl-danger)]">
        <AlertOctagon className="h-5 w-5" />
        AI Incident Cards
      </h3>
      <p className="mb-4 text-sm text-[var(--tl-text-muted)]">
        Transparency, accountability, and continuous learning when recommendations fail.
      </p>
      <div className="space-y-4">
        {incidents.map((inc) => (
          <article
            key={inc.incident_id}
            onClick={() => onIncidentClick?.(inc)}
            className={`rounded-xl border border-[var(--tl-danger)]/25 bg-[var(--tl-bg-elevated)] p-4 transition-all ${onIncidentClick ? "cursor-pointer hover:border-[var(--tl-danger)]/65 hover:scale-[1.01] shadow-md" : ""}`}
          >
            <p className="font-mono text-xs text-[var(--tl-text-muted)]">{inc.incident_id}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Incident" value={inc.incident_title} />
              <Field label="Cause" value={inc.cause} />
              <Field label="Safeguard Failure" value={inc.safeguard_failure} />
              <Field label="Corrective Action" value={inc.corrective_action} highlight />
            </div>
            <p className="mt-2 text-xs text-[var(--tl-text-muted)]">{inc.created_at}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--tl-text-muted)]">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-semibold ${highlight ? "text-[var(--tl-success)]" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}
