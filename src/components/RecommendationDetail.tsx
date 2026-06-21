import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Brain,
  Database,
  AlertTriangle,
  HelpCircle,
  GitCompare,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Shield,
  Clock,
  Monitor,
  User,
  Sparkles,
  Info,
} from "lucide-react";
import { AIRecommendation, Role, DecisionType, Severity } from "../types";
import { getDeviceById, getConfidenceStyles } from "../data";
import Modal from "./Modal";

interface RecommendationDetailProps {
  activeRole: Role;
  selectedRec: AIRecommendation;
  onDecision: (decision: DecisionType, notes?: string, overrideReason?: string) => void;
  setCurrentTab: (tab: string) => void;
  onBack: () => void;
}

const severityColors: Record<Severity, string> = {
  [Severity.CRITICAL]: "bg-red-500/20 text-red-300 border-red-400/30",
  [Severity.HIGH]: "bg-orange-500/20 text-orange-300 border-orange-400/30",
  [Severity.MEDIUM]: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  [Severity.LOW]: "bg-blue-500/20 text-blue-300 border-blue-400/30",
};

export default function RecommendationDetail({
  activeRole,
  selectedRec,
  onDecision,
  setCurrentTab,
  onBack,
}: RecommendationDetailProps) {
  const [modal, setModal] = useState<
    "approve" | "escalate" | "why" | "confidence" | "limitations" | "override" | null
  >(null);
  const [overrideReason, setOverrideReason] = useState("False Positive Alert");
  const [overrideNotes, setOverrideNotes] = useState("");

  const device = getDeviceById(selectedRec.deviceId);
  const styles = getConfidenceStyles(selectedRec.confidence);
  const isStakeholder = activeRole === Role.STAKEHOLDER;

  const closeModal = () => setModal(null);

  const handleOverrideSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!overrideNotes.trim()) return;
    onDecision("Overridden", overrideNotes, overrideReason);
    closeModal();
  };

  const transparencyItems = [
    { label: "Reasoning", done: true },
    { label: "Confidence", done: true },
    { label: "Data Source", done: true },
    { label: "Limitations", done: true },
    { label: "Human Controls", done: !isStakeholder },
  ];

  return (
    <div className="mesh-bg flex-1 overflow-y-auto">
      {/* Hero header */}
      <div className="hero-gradient relative overflow-hidden px-6 pb-8 pt-6 lg:px-10">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute -bottom-10 left-1/3 h-48 w-48 rounded-full bg-indigo-500 blur-3xl" />
        </div>

        <button
          onClick={onBack}
          className="relative mb-6 flex items-center gap-2 text-sm font-medium text-blue-200 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-white/10 px-2.5 py-1 font-mono text-xs text-blue-200 backdrop-blur-sm">
                {selectedRec.id}
              </span>
              <span
                className={`rounded-md border px-2.5 py-1 text-xs font-bold ${severityColors[selectedRec.severity]}`}
              >
                {selectedRec.severity}
              </span>
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-white/70">
                {selectedRec.status}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white lg:text-4xl">
              {selectedRec.action}
            </h1>
            {device && (
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-blue-100">
                <span className="flex items-center gap-1.5">
                  <Monitor className="h-4 w-4 text-blue-300" />
                  {device.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-blue-300" />
                  {device.owner}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-300" />
                  {selectedRec.timestamp}
                </span>
              </div>
            )}
            <p className="mt-4 text-lg leading-relaxed text-blue-100/90">
              {selectedRec.summaryLine}
            </p>
          </div>

          <button
            onClick={() => setModal("confidence")}
            className={`group shrink-0 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md transition hover:bg-white/20 hover:shadow-lg ${styles.glow}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Confidence Level
            </p>
            <p
              className={`mt-2 bg-gradient-to-r ${styles.gradient} bg-clip-text text-xl font-bold text-transparent`}
            >
              {selectedRec.confidence}
            </p>
            <p className="mt-2 flex items-center gap-1 text-xs text-blue-200/70 group-hover:text-blue-100">
              <Info className="h-3 w-3" /> Tap to learn why
            </p>
          </button>
        </div>

        {/* Transparency checklist strip */}
        <div className="relative mt-6 flex flex-wrap gap-2">
          {transparencyItems.map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Content grid */}
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 lg:px-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Reasoning */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 shadow-lg shadow-slate-200/50"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-slate-900">Why the AI Recommends This</h2>
                  <span className="text-xs font-semibold text-blue-600">Transparency · Reasoning</span>
                </div>
              </div>
              <button
                onClick={() => setModal("why")}
                className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
              >
                Ask Why ↗
              </button>
            </div>
            <p className="leading-relaxed text-slate-700">{selectedRec.reasoning}</p>
          </motion.section>

          {/* Confidence */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card rounded-2xl p-6 shadow-lg shadow-slate-200/50"
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-emerald-100 p-2">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-display font-bold text-slate-900">Confidence Level</h2>
                <span className="text-xs font-semibold text-emerald-600">Qualitative · No percentages</span>
              </div>
            </div>
            <span
              className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-bold shadow-sm ${styles.bg} ${styles.text} ${styles.border}`}
            >
              {selectedRec.confidence}
            </span>
            <p className="mt-3 leading-relaxed text-slate-600">{selectedRec.confidenceReason}</p>
          </motion.section>

          {/* Data Source */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 shadow-lg shadow-slate-200/50"
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-indigo-100 p-2">
                <Database className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-display font-bold text-slate-900">Data Source Attribution</h2>
                <span className="text-xs font-semibold text-indigo-600">Verifiable by admin</span>
              </div>
            </div>
            <p className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 leading-relaxed text-slate-700">
              {selectedRec.dataSourceAttribution}
            </p>
          </motion.section>

          {/* Limitations */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-lg shadow-amber-100/50"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-amber-100 p-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-slate-900">Known Limitations</h2>
                  <span className="text-xs font-semibold text-amber-600">What the AI doesn&apos;t know</span>
                </div>
              </div>
              <button
                onClick={() => setModal("limitations")}
                className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-200"
              >
                View all ↗
              </button>
            </div>
            <ul className="space-y-2">
              {selectedRec.limitations.slice(0, 2).map((lim, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-amber-100 bg-white/80 p-3 text-sm backdrop-blur-sm"
                >
                  <p className="font-semibold text-slate-800">{lim.title}</p>
                  <p className="mt-0.5 text-slate-600">{lim.description}</p>
                </li>
              ))}
            </ul>
          </motion.section>
        </div>

        {/* Human-in-the-loop controls */}
        {!isStakeholder ? (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-white p-6 shadow-xl shadow-blue-100/50"
          >
            <div className="absolute inset-x-0 top-0 h-1 shimmer-border" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Human-in-the-Loop Controls
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  No action executes automatically — you always decide.
                </p>
              </div>
              <Sparkles className="hidden h-8 w-8 text-blue-300 sm:block animate-float" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <button
                onClick={() => setModal("approve")}
                className="group flex flex-col items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 p-4 text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-emerald-500/50"
              >
                <CheckCircle2 className="h-6 w-6" />
                <span className="text-sm font-bold">Approve</span>
              </button>
              <button
                onClick={() => setModal("override")}
                className="group flex flex-col items-center gap-2 rounded-xl bg-gradient-to-b from-amber-500 to-orange-500 p-4 text-white shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5 hover:shadow-amber-500/50"
              >
                <XCircle className="h-6 w-6" />
                <span className="text-sm font-bold">Override</span>
              </button>
              <button
                onClick={() => setModal("why")}
                className="group flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 bg-white p-4 text-slate-700 shadow-md transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
              >
                <HelpCircle className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-bold">Ask Why</span>
              </button>
              <button
                onClick={() => setCurrentTab("alternatives")}
                className="group flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 bg-white p-4 text-slate-700 shadow-md transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg"
              >
                <GitCompare className="h-6 w-6 text-indigo-600" />
                <span className="text-sm font-bold">See Alternatives</span>
              </button>
              <button
                onClick={() => setModal("escalate")}
                className="group flex flex-col items-center gap-2 rounded-xl bg-gradient-to-b from-purple-600 to-violet-600 p-4 text-white shadow-lg shadow-purple-500/30 transition hover:-translate-y-0.5 hover:shadow-purple-500/50 sm:col-span-1 col-span-2"
              >
                <ArrowUpRight className="h-6 w-6" />
                <span className="text-sm font-bold">Escalate</span>
              </button>
            </div>
          </motion.section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white/80 p-8 text-center backdrop-blur-sm">
            <User className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 font-semibold text-slate-700">Read-only stakeholder view</p>
            <p className="mt-1 text-sm text-slate-500">
              Decision controls are available to IT Administrators and Security Analysts.
            </p>
          </section>
        )}
      </div>

      {/* ── Modals ── */}

      <Modal
        open={modal === "approve"}
        onClose={closeModal}
        title="Confirm Approval"
        subtitle="This will execute the recommended action"
        icon={<CheckCircle2 className="h-6 w-6" />}
        accent="green"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              onClick={() => { onDecision("Approved"); closeModal(); }}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg"
            >
              Yes, Approve Action
            </button>
          </div>
        }
      >
        <p className="text-slate-600">
          You are about to approve <strong>{selectedRec.action}</strong> for{" "}
          <strong>{device?.name}</strong>.
        </p>
        <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          <strong>AI reasoning:</strong> {selectedRec.reasoning.slice(0, 160)}…
        </div>
        <p className="mt-3 text-xs text-slate-400">
          This decision will be logged in the Activity Log for audit traceability.
        </p>
      </Modal>

      <Modal
        open={modal === "escalate"}
        onClose={closeModal}
        title="Escalate to Human Review"
        subtitle="Hand off to a senior admin or analyst"
        icon={<ArrowUpRight className="h-6 w-6" />}
        accent="purple"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              onClick={() => { onDecision("Escalated"); closeModal(); }}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg"
            >
              Escalate Now
            </button>
          </div>
        }
      >
        <p className="text-slate-600">
          This case will be forwarded to your security team for manual review before any action is taken.
        </p>
        <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50 p-4 text-sm text-purple-800">
          Confidence: <strong>{selectedRec.confidence}</strong> — {selectedRec.confidenceReason}
        </div>
      </Modal>

      <Modal
        open={modal === "why"}
        onClose={closeModal}
        title="Ask Why — Full Explanation"
        subtitle="Evidence timeline and reasoning breakdown"
        icon={<HelpCircle className="h-6 w-6" />}
        accent="blue"
        size="xl"
      >
        <p className="mb-5 leading-relaxed text-slate-700">{selectedRec.reasoning}</p>
        <h3 className="mb-3 font-display font-bold text-slate-900">Evidence Timeline</h3>
        <div className="relative space-y-0 pl-6">
          <div className="timeline-line absolute bottom-2 left-[7px] top-2 w-0.5 rounded-full" />
          {selectedRec.detectedEvents.map((evt, i) => (
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
              {i === selectedRec.detectedEvents.length - 1 && (
                <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                  → AI conclusion: {selectedRec.action}
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={modal === "confidence"}
        onClose={closeModal}
        title="Understanding Confidence Levels"
        subtitle="Qualitative labels — never raw percentages"
        icon={<Shield className="h-6 w-6" />}
        accent="green"
        size="lg"
      >
        <div className={`rounded-xl border p-4 ${styles.bg} ${styles.border}`}>
          <p className={`text-lg font-bold ${styles.text}`}>{selectedRec.confidence}</p>
          <p className="mt-2 text-sm text-slate-700">{selectedRec.confidenceReason}</p>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          {[
            { label: "High Confidence", color: "bg-emerald-500", desc: "Strong match with many similar confirmed cases" },
            { label: "Moderate Confidence", color: "bg-amber-500", desc: "Partial match — some uncertainty in inputs" },
            { label: "Review Recommended", color: "bg-orange-500", desc: "Conflicting or limited data — human judgment needed" },
            { label: "Low Confidence", color: "bg-red-500", desc: "Outside AI scope or very sparse data" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <span className={`h-3 w-3 shrink-0 rounded-full ${item.color}`} />
              <div>
                <p className="font-semibold text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={modal === "limitations"}
        onClose={closeModal}
        title="Known Limitations & Scope Boundaries"
        subtitle="What this recommendation has NOT validated"
        icon={<AlertTriangle className="h-6 w-6" />}
        accent="amber"
        size="lg"
      >
        <ul className="space-y-3">
          {selectedRec.limitations.map((lim, i) => (
            <li key={i} className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
              <p className="font-bold text-slate-900">{lim.title}</p>
              <p className="mt-1 text-sm text-slate-600">{lim.description}</p>
            </li>
          ))}
        </ul>
      </Modal>

      <Modal
        open={modal === "override"}
        onClose={closeModal}
        title="Override Recommendation"
        subtitle="Reject the AI suggestion and record your reason"
        icon={<XCircle className="h-6 w-6" />}
        accent="amber"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              form="override-form"
              type="submit"
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg"
            >
              Submit Override
            </button>
          </div>
        }
      >
        <form id="override-form" onSubmit={handleOverrideSubmit} className="space-y-4">
          <p className="text-sm text-slate-600">
            Overriding means the AI&apos;s recommendation of <strong>{selectedRec.action}</strong> will
            not be executed. Your reason is saved to the audit log.
          </p>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Reason category</label>
            <select
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            >
              <option value="False Positive Alert">False positive</option>
              <option value="Executive Clearance Approved">Executive clearance</option>
              <option value="Urgent Business Priority">Urgent business need</option>
              <option value="Internal Test Activity">Internal test activity</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Your explanation (required)
            </label>
            <textarea
              required
              rows={4}
              value={overrideNotes}
              onChange={(e) => setOverrideNotes(e.target.value)}
              placeholder="Describe why you are overriding this recommendation..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
