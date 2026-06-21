import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, ArrowUpRight, ArrowLeft, ClipboardList, Star } from "lucide-react";
import { ConfirmationState, RecommendationRow, Role } from "../types/datasets";
import { getRoleConfig } from "../roleConfig";
import Modal from "./Modal";

interface Props {
  confirmation: ConfirmationState;
  recommendation: RecommendationRow;
  activeRole: Role;
  onSubmitFeedback: (rating: number, comment: string) => void;
  onBackToDashboard: () => void;
  onViewActivityLog: () => void;
}

const CFG = {
  Approved: { icon: CheckCircle2, color: "var(--tl-success)", title: "Action Approved" },
  Overridden: { icon: XCircle, color: "var(--tl-warning)", title: "Recommendation Overridden" },
  Escalated: { icon: ArrowUpRight, color: "#1DA1F2", title: "Escalated for Review" },
};

export default function Confirmation({
  confirmation,
  recommendation,
  activeRole,
  onSubmitFeedback,
  onBackToDashboard,
  onViewActivityLog,
}: Props) {
  const cfg = CFG[confirmation.decision];
  const Icon = cfg.icon;
  const auditLabel = getRoleConfig(activeRole).canAccessAuditCenter ? "Audit Center" : "Activity Log";
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleFeedbackSubmit = () => {
    onSubmitFeedback(rating, comment);
    setShowFeedbackModal(false);
  };

  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="tl-panel w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: `${cfg.color}22`, color: cfg.color }}>
          <Icon className="h-8 w-8" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-white">{cfg.title}</h1>
        <p className="mt-2 text-sm text-[var(--tl-text-muted)]">Decision recorded for {recommendation.recommendation_id}</p>
        <p className="mt-4 text-xs text-[var(--tl-text-muted)] border border-[var(--tl-border)] bg-[var(--tl-bg-elevated)] p-3 rounded-lg leading-relaxed">
          The Trust Ledger has been adjusted dynamically based on this outcome. Compliance audit trails have been generated.
        </p>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onBackToDashboard} className="tl-btn-secondary flex flex-1 items-center justify-center gap-2 py-3">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </button>
          <button type="button" onClick={onViewActivityLog} className="tl-btn-primary flex flex-1 items-center justify-center gap-2 py-3">
            <ClipboardList className="h-4 w-4" /> {auditLabel}
          </button>
        </div>
      </motion.div>

      {/* 8. Human Feedback Popup Modal */}
      <Modal
        open={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Decision Feedback"
        subtitle="How useful was this recommendation?"
        icon={<Star className="h-6 w-6 text-yellow-400" />}
        accent="blue"
        footer={
          <button
            type="button"
            disabled={rating === 0}
            onClick={handleFeedbackSubmit}
            className="tl-btn-primary w-full disabled:opacity-40"
          >
            Submit Feedback
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-[var(--tl-text-secondary)] text-center">
            Your feedback directly helps calibrate AI confidence scores for similar hardware profiles.
          </p>
          <div className="flex justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRating(r)}
                className={`rounded-lg p-2 transition hover:scale-110 ${
                  rating >= r ? "text-yellow-400" : "text-[var(--tl-text-muted)]"
                }`}
              >
                <Star className={`h-8 w-8 ${rating >= r ? "fill-current" : ""}`} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Optional comments on decision support accuracy..."
            className="tl-input w-full"
          />
        </div>
      </Modal>
    </div>
  );
}
