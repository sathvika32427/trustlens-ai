import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Brain,
  Database,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Shield,
  Clock,
  Monitor,
  User,
  Sparkles,
  History,
  GitCompare,
} from "lucide-react";
import { AIRecommendation, AuditRecord, Role, DecisionType, Severity } from "../types";
import { getDeviceById, getConfidenceStyles } from "../data";
import { getRoleConfig } from "../roleConfig";
import Modal from "./Modal";
import StatusBadge from "./shared/StatusBadge";

interface RecommendationExplorerProps {
  activeRole: Role;
  selectedRec: AIRecommendation;
  auditRecords: AuditRecord[];
  onDecision: (decision: DecisionType, notes?: string, overrideReason?: string) => void;
  onBack: () => void;
}

const severityColors: Record<Severity, string> = {
  [Severity.CRITICAL]: "bg-red-100 text-red-800 border-red-200",
  [Severity.HIGH]: "bg-orange-100 text-orange-800 border-orange-200",
  [Severity.MEDIUM]: "bg-amber-100 text-amber-800 border-amber-200",
  [Severity.LOW]: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function RecommendationExplorer({
  activeRole,
  selectedRec,
  auditRecords,
  onDecision,
  onBack,
}: RecommendationExplorerProps) {
  const [modal, setModal] = useState<"approve" | "escalate" | "override" | null>(null);
  const [overrideReason, setOverrideReason] = useState("False Positive Alert");
  const [overrideNotes, setOverrideNotes] = useState("");

  const device = getDeviceById(selectedRec.deviceId);
  const styles = getConfidenceStyles(selectedRec.confidence);
  const roleConfig = getRoleConfig(activeRole);
  const relatedAudit = auditRecords.filter((r) => r.deviceId === selectedRec.deviceId);

  const closeModal = () => setModal(null);

  const handleOverrideSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!overrideNotes.trim()) return;
    onDecision("Overridden", overrideNotes, overrideReason);
    closeModal();
  };

  return (
    <div className="mesh-bg flex-1 overflow-y-auto">
      <div className="border-b border-slate-200/60 bg-white/80 px-5 py-5 backdrop-blur-sm lg:px-8">
        <div className="mx-auto max-w-6xl">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
            <Sparkles className="h-4 w-4" />
            Recommendation Explorer
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-5 py-6 lg:px-8">
        {/* 1. Recommendation Summary */}
        <Section title="1. Recommendation Summary" id="summary">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm text-slate-500">{selectedRec.id}</span>
                <span
                  className={`rounded-md border px-2 py-0.5 text-xs font-bold ${severityColors[selectedRec.severity]}`}
                >
                  {selectedRec.severity}
                </span>
                <StatusBadge status={selectedRec.status} />
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold text-slate-900">
                {selectedRec.action}
              </h1>
              {device && (
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Monitor className="h-4 w-4" /> {device.name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" /> {device.owner}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {selectedRec.timestamp}
                  </span>
                </div>
              )}
              <p className="mt-4 text-lg leading-relaxed text-slate-700">{selectedRec.summaryLine}</p>
            </div>
          </div>
        </Section>

        {/* 2. Why AI Recommended This */}
        <Section title="2. Why AI Recommended This" icon={Brain}>
          <p className="text-base leading-relaxed text-slate-700">{selectedRec.reasoning}</p>
        </Section>

        {/* 3. Evidence Timeline */}
        <Section title="3. Evidence Timeline" icon={History}>
          <div className="relative space-y-0 pl-6">
            <div className="timeline-line absolute bottom-2 left-[7px] top-2 w-0.5 rounded-full" />
            {selectedRec.detectedEvents.map((evt) => (
              <div key={evt.id} className="relative pb-5">
                <div className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-blue-600 shadow-md" />
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded bg-blue-100 px-2 py-0.5 font-mono font-bold text-blue-700">
                      {evt.day}
                    </span>
                    <span>{evt.timestamp}</span>
                  </div>
                  <p className="mt-2 font-bold text-slate-900">{evt.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 4. Confidence Explanation */}
          <Section title="4. Confidence Explanation" icon={Shield}>
            <span
              className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-bold ${styles.bg} ${styles.text} ${styles.border}`}
            >
              {selectedRec.confidence}
            </span>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              {selectedRec.confidenceReason}
            </p>
          </Section>

          {/* 5. Data Sources Used */}
          <Section title="5. Data Sources Used" icon={Database}>
            <p className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-base leading-relaxed text-slate-700">
              {selectedRec.dataSourceAttribution}
            </p>
          </Section>
        </div>

        {/* 6. What AI Might Not Know */}
        <Section title="6. What AI Might Not Know" icon={AlertTriangle} variant="warning">
          <ul className="space-y-3">
            {selectedRec.limitations.map((lim, i) => (
              <li key={i} className="rounded-xl border border-amber-100 bg-white/80 p-4">
                <p className="font-semibold text-slate-900">{lim.title}</p>
                <p className="mt-1 text-sm text-slate-600">{lim.description}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* 7. Alternative Actions */}
        <Section title="7. Alternative Actions" icon={GitCompare}>
          <div className="space-y-4">
            {selectedRec.alternatives.map((alt) => (
              <div
                key={alt.option}
                className={`rounded-xl border p-5 ${
                  alt.recommended ? "border-blue-300 bg-blue-50/30" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600">
                      Option {alt.option}
                    </span>
                    <h3 className="mt-1 font-display text-lg font-bold text-slate-900">
                      {alt.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">{alt.description}</p>
                  </div>
                  {alt.recommended && (
                    <span className="shrink-0 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                      AI Pick
                    </span>
                  )}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-3 text-sm">
                    <span className="text-xs font-bold uppercase text-slate-400">Risk</span>
                    <p className="mt-1 text-slate-700">{alt.riskLevel}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 text-sm">
                    <span className="text-xs font-bold uppercase text-slate-400">Impact</span>
                    <p className="mt-1 text-slate-700">{alt.businessImpact}</p>
                  </div>
                </div>
                <p className="mt-3 border-t border-slate-100 pt-3 text-sm italic text-slate-500">
                  {alt.reasoning}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* 8. Human Review Controls */}
        <Section title="8. Human Review Controls" id="controls">
          {roleConfig.canDecide ? (
            <div>
              <p className="mb-5 text-sm text-slate-600">
                {activeRole === Role.IT_ADMIN
                  ? "As IT Administrator, you have final approval authority. No action executes automatically."
                  : "Review the evidence and record your decision. No action executes automatically."}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setModal("approve")}
                  disabled={selectedRec.status !== "Pending"}
                  className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 p-5 text-white shadow-lg disabled:opacity-50"
                >
                  <CheckCircle2 className="h-7 w-7" />
                  <span className="font-bold">Approve</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModal("override")}
                  disabled={selectedRec.status !== "Pending"}
                  className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-b from-amber-500 to-orange-500 p-5 text-white shadow-lg disabled:opacity-50"
                >
                  <XCircle className="h-7 w-7" />
                  <span className="font-bold">Override</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModal("escalate")}
                  disabled={selectedRec.status !== "Pending"}
                  className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-b from-purple-600 to-violet-600 p-5 text-white shadow-lg disabled:opacity-50"
                >
                  <ArrowUpRight className="h-7 w-7" />
                  <span className="font-bold">Escalate</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 p-6 text-center">
              <User className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 font-semibold text-slate-700">Read-only view</p>
              <p className="mt-1 text-sm text-slate-500">
                Your IT team will review this recommendation. You will be notified of any actions
                affecting your device.
              </p>
            </div>
          )}
        </Section>

        {/* 9. Audit Trail */}
        <Section title="9. Audit Trail" icon={History}>
          {relatedAudit.length === 0 ? (
            <p className="text-sm text-slate-500">No prior decisions recorded for this device.</p>
          ) : (
            <div className="space-y-3">
              {relatedAudit.map((record) => (
                <div key={record.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs text-slate-400">{record.id}</span>
                    <StatusBadge status={record.decision} size="sm" />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <p>
                      <span className="font-semibold text-slate-600">AI: </span>
                      {record.action}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-600">Outcome: </span>
                      {record.outcome}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-600">Reviewer: </span>
                      {record.reviewer}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-600">When: </span>
                      {record.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <Modal
        open={modal === "approve"}
        onClose={closeModal}
        title="Confirm Approval"
        subtitle="Execute the recommended action"
        icon={<CheckCircle2 className="h-6 w-6" />}
        accent="green"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onDecision("Approved");
                closeModal();
              }}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-bold text-white"
            >
              Approve
            </button>
          </div>
        }
      >
        <p className="text-slate-600">
          Approve <strong>{selectedRec.action}</strong> for <strong>{device?.name}</strong>?
        </p>
      </Modal>

      <Modal
        open={modal === "escalate"}
        onClose={closeModal}
        title="Escalate for Review"
        subtitle="Forward to senior admin or analyst"
        icon={<ArrowUpRight className="h-6 w-6" />}
        accent="purple"
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onDecision("Escalated");
                closeModal();
              }}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white"
            >
              Escalate
            </button>
          </div>
        }
      >
        <p className="text-slate-600">This case will be forwarded for manual review before any action.</p>
      </Modal>

      <Modal
        open={modal === "override"}
        onClose={closeModal}
        title="Override Recommendation"
        subtitle="Reject the AI suggestion"
        icon={<XCircle className="h-6 w-6" />}
        accent="amber"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              form="override-form"
              type="submit"
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-sm font-bold text-white"
            >
              Submit Override
            </button>
          </div>
        }
      >
        <form id="override-form" onSubmit={handleOverrideSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Reason category</label>
            <select
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="False Positive Alert">False positive</option>
              <option value="Business-critical device">Business-critical device</option>
              <option value="Executive Clearance Approved">Executive clearance</option>
              <option value="Internal Test Activity">Internal test activity</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Explanation (required)</label>
            <textarea
              required
              rows={4}
              value={overrideNotes}
              onChange={(e) => setOverrideNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              placeholder="Why are you overriding this recommendation?"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  variant,
}: {
  title: string;
  icon?: typeof Brain;
  children: React.ReactNode;
  variant?: "warning";
  id?: string;
}) {
  const bg =
    variant === "warning"
      ? "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
      : "border-slate-200 bg-white";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-6 shadow-sm ${bg}`}
    >
      <div className="mb-4 flex items-center gap-2">
        {Icon && (
          <div className="rounded-lg bg-blue-100 p-2">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
        )}
        <h2 className="font-display text-xl font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}
