import { useState } from "react";
import { Search } from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import StatusBadge from "./shared/StatusBadge";

export default function AuditCenter() {
  const { auditRecords, data } = useAppData();
  const [search, setSearch] = useState("");

  const outcomeMap = new Map<string, any>(data?.outcomes.map((o) => [o.recommendation_id, o]) ?? []);

  const filtered = auditRecords
    .filter((r) => {
      const q = search.toLowerCase();
      return (
        r.device_name.toLowerCase().includes(q) ||
        r.action.toLowerCase().includes(q) ||
        r.outcome.toLowerCase().includes(q) ||
        r.reviewer.toLowerCase().includes(q)
      );
    })
    .slice(0, 50);

  return (
    <div className="mesh-bg flex-1 overflow-y-auto">
      <div className="border-b border-[var(--tl-border)] bg-[var(--tl-bg-sidebar)] px-8 py-6">
        <h1 className="font-display text-3xl font-bold text-[var(--tl-text-primary)]">Audit Center</h1>
        <p className="mt-2 text-[var(--tl-text-secondary)]">
          Full accountability from audit records + outcomes.csv
        </p>
      </div>
      <div className="mx-auto max-w-5xl px-8 py-8">
        <input
          className="tl-input mb-6 w-full"
          placeholder="Search audit records..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="space-y-4">
          {filtered.map((record) => {
            const outcome = outcomeMap.get(record.recommendation_id);
            return (
              <article key={record.id} className="tl-panel">
                <div className="flex justify-between border-b border-[var(--tl-border)] pb-3">
                  <span className="font-mono text-sm text-[var(--tl-text-muted)]">{record.id}</span>
                  <StatusBadge status={record.decision} />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="AI Recommendation" value={record.action} />
                  <Field label="Human Decision" value={record.decision} />
                  <Field label="Reason" value={record.override_reason ?? record.notes} />
                  <Field label="Outcome" value={outcome?.outcome_description || record.outcome} />
                  <Field label="Timestamp" value={record.timestamp} />
                  <Field label="Reviewer" value={`${record.reviewer} · ${record.reviewer_role}`} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--tl-bg-elevated)] p-4">
      <span className="tl-field-label">{label}</span>
      <p className="tl-field-value">{value}</p>
    </div>
  );
}
