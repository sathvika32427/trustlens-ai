import { Sparkles, Compass, HelpCircle } from "lucide-react";
import Modal from "./Modal";

interface WelcomeTourProps {
  open: boolean;
  onClose: () => void;
  onTakeTour: () => void;
}

export default function WelcomeTour({ open, onClose, onTakeTour }: WelcomeTourProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Welcome to TrustLens AI"
      subtitle="Understand, evaluate, and trust AI recommendations through transparency, governance, and human oversight."
      icon={<Sparkles className="h-6 w-6 text-yellow-400" />}
      accent="blue"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl border border-[var(--tl-border)] bg-[var(--tl-bg-elevated)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            <Compass className="h-4 w-4" />
            Explore Platform
          </button>
          <button
            onClick={() => {
              onClose();
              onTakeTour();
            }}
            className="flex items-center gap-2 rounded-xl bg-[var(--tl-dell-blue)] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-[var(--tl-dell-blue-light)]"
          >
            <HelpCircle className="h-4 w-4" />
            Take Quick Tour
          </button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        <p className="text-sm leading-relaxed text-[var(--tl-text-secondary)]">
          TrustLens AI is an enterprise-grade AI governance platform designed to ensure clarity and safety around automated recommendation workflows. Explore our multi-layered approach to transparency:
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--tl-border)] bg-[var(--tl-bg-elevated)] p-4 text-center">
            <h5 className="font-bold text-white text-sm">Trust Ledger</h5>
            <p className="mt-1 text-xs text-[var(--tl-text-muted)]">Historical accuracy & reliability patterns</p>
          </div>
          <div className="rounded-xl border border-[var(--tl-border)] bg-[var(--tl-bg-elevated)] p-4 text-center">
            <h5 className="font-bold text-white text-sm">Impact Preview</h5>
            <p className="mt-1 text-xs text-[var(--tl-text-muted)]">Trade-offs & containment analysis</p>
          </div>
          <div className="rounded-xl border border-[var(--tl-border)] bg-[var(--tl-bg-elevated)] p-4 text-center">
            <h5 className="font-bold text-white text-sm">Human Controls</h5>
            <p className="mt-1 text-xs text-[var(--tl-text-muted)]">Direct review, override, & escalation</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
