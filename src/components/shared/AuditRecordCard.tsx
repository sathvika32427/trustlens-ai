import { AuditRecord } from "../../types/datasets";
import StatusBadge from "./StatusBadge";

export default function AuditRecordCard({ record }: { record: AuditRecord }) {
  return (
    <article className="tl-audit-card">
      <div className="tl-audit-card-header">
        <span className="tl-audit-id">{record.id}</span>
        <StatusBadge status={record.decision} />
      </div>
      <div className="tl-audit-grid">
        <DetailField label="AI Recommendation" value={record.action} highlight />
        <DetailField label="Human Decision" value={record.decision} />
        <DetailField label="Outcome" value={record.outcome} />
        <DetailField label="Reviewer" value={`${record.reviewer} · ${record.reviewer_role}`} />
        <DetailField label="Device" value={record.device_name} />
        <DetailField label="Timestamp" value={record.timestamp} />
      </div>
      {record.notes && (
        <div className="tl-audit-notes">
          <span className="tl-field-label">Notes</span>
          <p className="tl-field-value mt-1">{record.notes}</p>
        </div>
      )}
    </article>
  );
}

export function DetailField({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`tl-detail-field ${highlight ? "tl-detail-field-highlight" : ""}`}>
      <span className="tl-field-label">{label}</span>
      <p className="tl-field-value">{value}</p>
    </div>
  );
}
