import { useState, useEffect } from "react";
import { Lock, Unlock, FileText, Eye, AlertTriangle } from "lucide-react";
import { AdaptiveApprovalRow, RiskLevel } from "../../types/datasets";

interface Props {
  adaptive?: AdaptiveApprovalRow;
  onGateChange: (unlocked: boolean) => void;
}

const riskCopy: Record<RiskLevel, string> = {
  Low: "One-click approval permitted after review.",
  Medium: "Evidence review required before approval.",
  High: "Evidence and impact review required before approval.",
  Critical: "Evidence, impact review, and written justification required.",
};

export default function AdaptiveApprovalGate({ adaptive, onGateChange }: Props) {
  const [evidenceDone, setEvidenceDone] = useState(false);
  const [impactDone, setImpactDone] = useState(false);
  const [justification, setJustification] = useState("");

  if (!adaptive) return null;

  const needsEvidence = adaptive.requires_evidence_review;
  const needsImpact = adaptive.requires_impact_review;
  const needsJustification = adaptive.requires_written_justification;

  const unlocked =
    (!needsEvidence || evidenceDone) &&
    (!needsImpact || impactDone) &&
    (!needsJustification || justification.trim().length >= 20);

  useEffect(() => {
    onGateChange(unlocked);
  }, [unlocked, onGateChange]);

  return (
    <div className="tl-panel border-[var(--tl-dell-blue)]/20">
      <h3 className="tl-panel-title">Adaptive Approval Gate</h3>
      <p className="mb-2 text-sm text-[var(--tl-text-muted)]">
        Risk level:{" "}
        <span className="font-bold text-[var(--tl-dell-blue-light)]">{adaptive.risk_level}</span>
      </p>
      <p className="mb-4 text-sm text-[var(--tl-text-secondary)]">{riskCopy[adaptive.risk_level]}</p>

      <div className="space-y-3">
        {needsEvidence && (
          <GateStep
            done={evidenceDone}
            label="Evidence Review Required"
            icon={<Eye className="h-4 w-4" />}
            onComplete={() => setEvidenceDone(true)}
          />
        )}
        {needsImpact && (
          <GateStep
            done={impactDone}
            label="Impact Review Required"
            icon={<AlertTriangle className="h-4 w-4" />}
            onComplete={() => setImpactDone(true)}
          />
        )}
        {needsJustification && (
          <div className="rounded-xl bg-[var(--tl-bg-elevated)] p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
              <FileText className="h-4 w-4 text-[var(--tl-dell-blue)]" />
              Written Justification Required
            </p>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={3}
              placeholder="Provide written justification (min 20 characters)..."
              className="tl-input w-full"
            />
          </div>
        )}
      </div>

      <div
        className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-bold ${
          unlocked
            ? "bg-[var(--tl-success)]/15 text-[var(--tl-success)]"
            : "bg-[var(--tl-danger)]/15 text-[var(--tl-danger)]"
        }`}
      >
        {unlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        {unlocked ? "Approval gate unlocked" : "Approval locked until required reviews complete"}
      </div>
    </div>
  );
}

function GateStep({
  done,
  label,
  icon,
  onComplete,
}: {
  done: boolean;
  label: string;
  icon: React.ReactNode;
  onComplete: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[var(--tl-bg-elevated)] px-4 py-3">
      <span className="flex items-center gap-2 text-sm font-semibold text-white">
        {icon}
        {label}
      </span>
      {done ? (
        <span className="text-xs font-bold text-[var(--tl-success)]">✓ Complete</span>
      ) : (
        <button type="button" onClick={onComplete} className="tl-btn-secondary text-xs">
          Mark Reviewed
        </button>
      )}
    </div>
  );
}
