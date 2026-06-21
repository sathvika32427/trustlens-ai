import { useState, useCallback, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { RecommendationBundle, Role, DecisionType, IncidentCardRow } from "../types/datasets";
import { getRoleConfig } from "../roleConfig";
import { useAppData } from "../context/AppDataContext";
import TrustLedgerPanel from "./features/TrustLedgerPanel";
import ImpactPreviewPanel from "./features/ImpactPreviewPanel";
import AdaptiveApprovalGate from "./features/AdaptiveApprovalGate";
import CounterConsiderationPanel from "./features/CounterConsiderationPanel";
import OutcomeLearningPanel from "./features/OutcomeLearningPanel";
import AIIncidentCardPanel from "./features/AIIncidentCardPanel";
import SimilarCasesPanel from "./features/SimilarCasesPanel";
import EvidenceWeightingChart from "./features/EvidenceWeightingChart";
import BusinessImpactScore from "./features/BusinessImpactScore";
import RecommendationAgingIndicator from "./features/RecommendationAgingIndicator";
import StatusBadge from "./shared/StatusBadge";
import Modal from "./Modal";
import WhyAiRecommendedThis from "./features/WhyAiRecommendedThis";
import DataSourceAttribution from "./features/DataSourceAttribution";
import AILimitationAwareness from "./features/AILimitationAwareness";
import { CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  activeRole: Role;
  bundle: RecommendationBundle;
  onDecision: (d: DecisionType, notes?: string, overrideReason?: string) => void;
  onBack: () => void;
}

export default function RecommendationExplorer({ activeRole, bundle, onDecision, onBack }: Props) {
  const { data: appData, outcomeStats, auditRecords } = useAppData();
  const [gateUnlocked, setGateUnlocked] = useState(
    () => !bundle.adaptiveApproval || bundle.adaptiveApproval.risk_level === "Low",
  );
  const [modal, setModal] = useState<"approve" | "override" | "escalate" | null>(null);
  const [overrideNotes, setOverrideNotes] = useState("");
  const roleConfig = getRoleConfig(activeRole);
  const rec = bundle.recommendation;

  // Premium Modal state handlers
  const [activeIncident, setActiveIncident] = useState<IncidentCardRow | null>(null);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [showBusinessImpactModal, setShowBusinessImpactModal] = useState(false);
  const [showAgingPopup, setShowAgingPopup] = useState(false);

  useEffect(() => {
    if (rec.status === "Pending" && bundle.aging && bundle.aging.age_days > 14) {
      setShowAgingPopup(true);
    }
  }, [rec.status, bundle.aging]);

  const handleGateChange = useCallback((unlocked: boolean) => {
    setGateUnlocked(unlocked);
  }, []);

  const canApprove = roleConfig.canDecide && rec.status === "Pending" && (gateUnlocked || !bundle.adaptiveApproval);

  const relatedAudit = auditRecords.filter((a) => a.recommendation_id === rec.recommendation_id || a.device_id === rec.device_id);

  return (
    <div className="flex-1 overflow-y-auto mesh-bg">
      <div className="border-b border-[var(--tl-border)] bg-[var(--tl-bg-sidebar)] px-6 py-4">
        <button type="button" onClick={onBack} className="mb-3 flex items-center gap-2 text-sm text-[var(--tl-text-muted)] hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm text-[var(--tl-dell-blue-light)]">{rec.recommendation_id}</span>
          <StatusBadge status={rec.status} />
          {bundle.aging && <RecommendationAgingIndicator aging={bundle.aging} />}
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">{rec.action}</h1>
        <p className="mt-2 text-[var(--tl-text-secondary)]">{rec.summary_line}</p>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-5 py-6 lg:px-8">
        <TrustLedgerPanel recommendation={rec} ledger={bundle.trustLedger} onClick={() => setShowLedgerModal(true)} />
        <CounterConsiderationPanel recommendation={rec} counter={bundle.counterConsideration} />
        <ImpactPreviewPanel impact={bundle.impactPreview} onClick={() => setShowImpactModal(true)} />
        <EvidenceWeightingChart weights={bundle.evidenceWeights} />
        <SimilarCasesPanel cases={bundle.similarCases} />
        <BusinessImpactScore impact={bundle.businessImpact} onClick={() => setShowBusinessImpactModal(true)} />
        <OutcomeLearningPanel outcome={bundle.outcome} ledger={bundle.trustLedger} outcomeStats={outcomeStats ?? {}} />
        <AIIncidentCardPanel incidents={bundle.incidents} onIncidentClick={(inc) => setActiveIncident(inc)} />

        <WhyAiRecommendedThis recommendation={rec} reasoningChain={bundle.reasoningChain} />
        <DataSourceAttribution sources={bundle.dataSources} />
        <AILimitationAwareness limitations={bundle.limitations} confidence={rec.confidence} />

        {roleConfig.canDecide && (
          <>
            <AdaptiveApprovalGate adaptive={bundle.adaptiveApproval} onGateChange={handleGateChange} />
            <section className="tl-panel">
              <h3 className="tl-panel-title">Human Review Controls</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button type="button" disabled={!canApprove} onClick={() => setModal("approve")} className="tl-btn-action-approve flex flex-col items-center gap-2 py-5 disabled:opacity-40">
                  <CheckCircle2 className="h-7 w-7" /> Approve
                </button>
                <button type="button" disabled={!canApprove} onClick={() => setModal("override")} className="tl-btn-action-override flex flex-col items-center gap-2 py-5 disabled:opacity-40">
                  <XCircle className="h-7 w-7" /> Override
                </button>
                <button type="button" disabled={!canApprove} onClick={() => setModal("escalate")} className="tl-btn-action-escalate flex flex-col items-center gap-2 py-5 disabled:opacity-40">
                  <ArrowUpRight className="h-7 w-7" /> Escalate
                </button>
              </div>
            </section>
          </>
        )}

        {relatedAudit.length > 0 && (
          <section className="tl-panel">
            <h3 className="tl-panel-title">Audit Trail</h3>
            {relatedAudit.map((a) => (
              <div key={a.id} className="mt-2 rounded-lg bg-[var(--tl-bg-elevated)] p-3 text-sm">
                <StatusBadge status={a.decision} /> · {a.outcome} · {a.timestamp}
              </div>
            ))}
          </section>
        )}
      </div>

      <Modal open={modal === "approve"} onClose={() => setModal(null)} title="Approve Recommendation?" accent="green"
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" className="tl-btn-secondary py-2" onClick={() => setModal(null)}>Cancel</button>
            <button type="button" className="tl-btn-approve-confirm" onClick={() => { onDecision("Approved"); setModal(null); }}>Approve</button>
          </div>
        }>
        <p className="text-sm text-[var(--tl-text-secondary)]">This action may isolate the affected device: <strong className="text-white">{rec.device_name}</strong>.</p>
      </Modal>
      <Modal open={modal === "escalate"} onClose={() => setModal(null)} title="Escalate Recommendation" accent="blue"
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" className="tl-btn-secondary py-2" onClick={() => setModal(null)}>Cancel</button>
            <button type="button" className="tl-btn-escalate-confirm" onClick={() => { onDecision("Escalated"); setModal(null); }}>Continue</button>
          </div>
        }>
        <p className="text-sm text-[var(--tl-text-secondary)]">This recommendation will be escalated for additional review.</p>
      </Modal>
      <Modal open={modal === "override"} onClose={() => setModal(null)} title="Override" accent="amber" size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" className="tl-btn-secondary py-2" onClick={() => setModal(null)}>Cancel</button>
            <button type="button" className="tl-btn-override-confirm" onClick={() => { onDecision("Overridden", overrideNotes, "Override"); setModal(null); }}>Submit</button>
          </div>
        }>
        <textarea className="tl-input w-full" rows={4} value={overrideNotes} onChange={(e) => setOverrideNotes(e.target.value)} placeholder="Reason for override..." />
      </Modal>

      {/* 5. Impact Preview Popup Modal */}
      <Modal open={showImpactModal} onClose={() => setShowImpactModal(false)} title="Impact Preview Details" accent="blue" size="lg">
        {bundle.impactPreview ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--tl-success)]/30 bg-[var(--tl-success)]/5 p-4">
              <h4 className="font-bold text-[var(--tl-success)] flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                If Approved (Benefits)
              </h4>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[var(--tl-text-secondary)]">
                <li>• {bundle.impactPreview.if_approved_threat_contained}</li>
                <li>• {bundle.impactPreview.if_approved_device_isolated}</li>
                <li>• {bundle.impactPreview.if_approved_user_impact}</li>
              </ul>
            </div>
            <div className="rounded-xl border border-[var(--tl-danger)]/30 bg-[var(--tl-danger)]/5 p-4">
              <h4 className="font-bold text-[var(--tl-danger)] flex items-center gap-2 text-sm">
                <XCircle className="h-4 w-4" />
                If Dismissed (Risks)
              </h4>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[var(--tl-text-secondary)]">
                <li>• {bundle.impactPreview.if_dismissed_malware_spread}</li>
                <li>• {bundle.impactPreview.if_dismissed_security_risk}</li>
                <li>• {bundle.impactPreview.if_dismissed_business_impact}</li>
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--tl-text-muted)]">No impact preview data available.</p>
        )}
      </Modal>

      {/* 6. Trust Ledger Expandable Modal */}
      <Modal open={showLedgerModal} onClose={() => setShowLedgerModal(false)} title="Trust Ledger Details" accent="blue" size="lg">
        {bundle.trustLedger ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[var(--tl-bg-elevated)] p-4 text-center">
                <p className="text-xs text-[var(--tl-text-muted)] font-bold uppercase">Correct Cases</p>
                <p className="mt-1 font-display text-2xl font-bold text-[var(--tl-success)]">{bundle.trustLedger.correct_recommendations}</p>
              </div>
              <div className="rounded-xl bg-[var(--tl-bg-elevated)] p-4 text-center">
                <p className="text-xs text-[var(--tl-text-muted)] font-bold uppercase">Incorrect Cases</p>
                <p className="mt-1 font-display text-2xl font-bold text-[var(--tl-danger)]">{bundle.trustLedger.incorrect_recommendations}</p>
              </div>
              <div className="rounded-xl bg-[var(--tl-bg-elevated)] p-4 text-center">
                <p className="text-xs text-[var(--tl-text-muted)] font-bold uppercase">Reliability Score</p>
                <p className="mt-1 font-display text-2xl font-bold text-[var(--tl-dell-blue-light)]">{bundle.trustLedger.historical_reliability_score}%</p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--tl-warning)]/30 bg-[var(--tl-warning)]/5 p-4">
              <p className="font-bold text-[var(--tl-warning)] text-sm">Known Weaknesses</p>
              <ul className="mt-2 space-y-1 text-xs text-[var(--tl-text-secondary)]">
                {bundle.trustLedger.known_weaknesses.split("; ").filter(Boolean).map((w) => (
                  <li key={w}>• {w}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-[var(--tl-bg-elevated)] p-4">
              <p className="text-sm font-bold text-white mb-2">Trust Score Trend (Aggregate Timeline)</p>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={appData?.trustTimeline ?? []} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid stroke="var(--tl-border)" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: "var(--tl-text-muted)", fontSize: 8 }} interval={8} />
                    <YAxis domain={[70, 100]} tick={{ fill: "var(--tl-text-muted)", fontSize: 8 }} />
                    <Tooltip contentStyle={{ background: "var(--tl-bg-elevated)", border: "1px solid var(--tl-border)", fontSize: 10 }} />
                    <Line type="monotone" dataKey="trust_score" stroke="var(--tl-dell-blue)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--tl-text-muted)]">No ledger data available.</p>
        )}
      </Modal>

      {/* 7. AI Incident Details Modal */}
      <Modal open={activeIncident !== null} onClose={() => setActiveIncident(null)} title="AI Incident Card Details" accent="red" size="lg">
        {activeIncident && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[var(--tl-bg-elevated)] p-4 space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--tl-text-muted)]">Incident Summary</p>
                <p className="text-sm font-semibold text-white mt-1">{activeIncident.incident_title}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--tl-text-muted)]">Root Cause</p>
                <p className="text-sm text-[var(--tl-text-secondary)] mt-1">{activeIncident.cause}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--tl-text-muted)]">Safeguard Failure</p>
                <p className="text-sm text-[var(--tl-text-secondary)] mt-1">{activeIncident.safeguard_failure}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--tl-text-muted)]">Corrective Action</p>
                <p className="text-sm font-semibold text-[var(--tl-success)] mt-1">{activeIncident.corrective_action}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--tl-text-muted)]">Lessons Learned</p>
                <p className="text-sm text-[var(--tl-text-secondary)] mt-1 italic">
                  Recommendations must incorporate user confirmation triggers for devices undergoing active parallel compiles, preventing threat misclassifications on active developer nodes.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 14. Recommendation Aging Warning Popup */}
      <Modal open={showAgingPopup} onClose={() => setShowAgingPopup(false)} title="Aging Recommendation Warning" accent="amber" size="md">
        <div className="space-y-3">
          <p className="text-sm text-white">
            This recommendation has been pending for <strong className="text-[var(--tl-warning)]">{bundle.aging?.age_days} days</strong>.
          </p>
          <p className="text-xs text-[var(--tl-text-secondary)] leading-relaxed">
            Recommendations pending for an extended period increase vulnerability exposure. Prompt review and response are recommended.
          </p>
          <div className="flex justify-end mt-4">
            <button onClick={() => setShowAgingPopup(false)} className="tl-btn-primary px-4 py-2">
              Acknowledge
            </button>
          </div>
        </div>
      </Modal>

      {/* 15. Business Impact Modal */}
      <Modal open={showBusinessImpactModal} onClose={() => setShowBusinessImpactModal(false)} title="Business Impact Assessment" accent="blue" size="md">
        {bundle.businessImpact ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-[var(--tl-bg-elevated)] p-4 space-y-3">
              <div className="flex justify-between border-b border-[var(--tl-border)] pb-2">
                <span className="text-xs text-[var(--tl-text-secondary)]">Affected Users</span>
                <span className="text-sm font-bold text-white">{bundle.businessImpact.affected_users}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--tl-border)] pb-2">
                <span className="text-xs text-[var(--tl-text-secondary)]">Downtime Estimate</span>
                <span className="text-sm font-bold text-white">{bundle.businessImpact.potential_downtime_hours} Hours</span>
              </div>
              <div className="flex justify-between border-b border-[var(--tl-border)] pb-2">
                <span className="text-xs text-[var(--tl-text-secondary)]">Risk Reduction</span>
                <span className="text-sm font-bold text-[var(--tl-success)]">{bundle.businessImpact.risk_reduction_pct}%</span>
              </div>
              <div className="flex justify-between border-b border-[var(--tl-border)] pb-2">
                <span className="text-xs text-[var(--tl-text-secondary)]">Impact Level</span>
                <span className={`text-sm font-bold ${bundle.businessImpact.impact_level === "High" ? "text-[var(--tl-warning)]" : "text-white"}`}>
                  {bundle.businessImpact.impact_level}
                </span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-xs text-[var(--tl-text-secondary)]">Financial Impact Estimate</span>
                <span className="text-sm font-bold text-[var(--tl-danger)]">
                  ${(bundle.businessImpact.affected_users * bundle.businessImpact.potential_downtime_hours * 85).toLocaleString()} USD
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--tl-text-muted)] leading-relaxed">
              Financial impact is estimated based on an average organizational labor rate of $85/hr for affected users during system isolation downtime.
            </p>
          </div>
        ) : (
          <p className="text-sm text-[var(--tl-text-muted)]">No business impact data available.</p>
        )}
      </Modal>
    </div>
  );
}
