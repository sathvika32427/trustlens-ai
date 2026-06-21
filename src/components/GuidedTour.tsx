import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";

interface Step {
  id: string;
  targetId: string;
  title: string;
  description: string;
}

const TOUR_STEPS: Step[] = [
  {
    id: "dashboard",
    targetId: "tour-nav-dashboard",
    title: "Governance Dashboard",
    description: "Overview of organization-wide AI recommendations, trust indexes, and overall decision telemetry.",
  },
  {
    id: "explorer",
    targetId: "tour-nav-explorer",
    title: "Recommendation Explorer",
    description: "Investigate individual AI suggestions. Inspect the Trust Ledger, counter-considerations, and access manual override controls.",
  },
  {
    id: "trust",
    targetId: "tour-nav-trust",
    title: "Trust Analytics",
    description: "Deep dive into monthly trust trends, rating satisfaction distribution, and performance metrics breakdown.",
  },
  {
    id: "audit-center",
    targetId: "tour-nav-audit-center",
    title: "Audit Center",
    description: "Full regulatory trail tracking and logs of every human override, escalation, and outcome resolution.",
  },
  {
    id: "ai-health",
    targetId: "tour-nav-ai-health",
    title: "AI Health Dashboard",
    description: "Monitor real-time system performance, false positive rates, and safeguards reliability analytics.",
  },
];

interface GuidedTourProps {
  open: boolean;
  onClose: () => void;
  setCurrentTab: (tab: string) => void;
}

interface Coords {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function GuidedTour({ open, onClose, setCurrentTab }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<Coords | null>(null);

  const step = TOUR_STEPS[currentStep];

  useEffect(() => {
    if (!open) return;
    
    // Auto-navigate tab to let the user see the target page
    const tabName = step.id === "explorer" ? "explorer" : step.id === "trust" ? "trust" : step.id === "audit-center" ? "audit-center" : step.id === "ai-health" ? "ai-health" : "dashboard";
    
    const targetElement = document.getElementById(step.targetId);
    if (targetElement) {
      setCurrentTab(tabName);
      const updateCoords = () => {
        const rect = targetElement.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      };
      // Short delay to allow sidebar tab to switch and update layout
      const timer = setTimeout(updateCoords, 100);
      window.addEventListener("resize", updateCoords);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updateCoords);
      };
    } else {
      setCoords(null);
    }
  }, [open, currentStep, step.targetId, step.id, setCurrentTab]);

  if (!open) return null;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Transparent highlight overlay backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
          onClick={onClose}
        />

        {/* Dynamic Highlight Box */}
        {coords && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1,
              top: coords.top - 4,
              left: coords.left - 4,
              width: coords.width + 8,
              height: coords.height + 8,
            }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="absolute rounded-xl border-2 border-[var(--tl-dell-blue-light)] shadow-[0_0_20px_rgba(29,161,242,0.4)] pointer-events-none"
          />
        )}

        {/* Tooltip Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            // Position near the coordinate if available, otherwise center
            ...(coords
              ? {
                  top: Math.min(window.innerHeight - 260, Math.max(20, coords.top - 40)),
                  left: coords.left + coords.width + 16,
                }
              : {
                  top: window.innerHeight / 2 - 100,
                  left: window.innerWidth / 2 - 180,
                }),
          }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="absolute z-50 w-90 max-w-sm rounded-xl border border-[var(--tl-border)] bg-[var(--tl-bg-card)] p-5 shadow-2xl pointer-events-auto"
          style={!coords ? { transform: "translate(-50%, -50%)" } : undefined}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 text-[var(--tl-dell-blue-light)] font-bold text-sm">
              <Sparkles className="h-4 w-4" />
              Onboarding Tour ({currentStep + 1}/{TOUR_STEPS.length})
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-[var(--tl-text-muted)] hover:bg-[var(--tl-bg-elevated)] hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h4 className="mt-3 font-display text-lg font-bold text-white">{step.title}</h4>
          <p className="mt-2 text-sm leading-relaxed text-[var(--tl-text-secondary)]">{step.description}</p>

          <div className="mt-5 flex items-center justify-between border-t border-[var(--tl-border)] pt-4">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-[var(--tl-text-muted)] hover:text-white transition"
            >
              Skip Tour
            </button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 rounded-lg border border-[var(--tl-border)] bg-[var(--tl-bg-elevated)] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"
                >
                  <ChevronLeft className="h-3 w-3" /> Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 rounded-lg bg-[var(--tl-dell-blue)] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[var(--tl-dell-blue-light)] shadow-lg shadow-blue-500/25"
              >
                {currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"} <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
