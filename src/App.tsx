import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import RecommendationExplorer from "./components/RecommendationExplorer";
import AuditFeed from "./components/AuditFeed";
import AuditCenter from "./components/AuditCenter";
import TrustAnalytics from "./components/TrustAnalytics";
import AIHealthPage from "./components/AIHealthPage";
import Notifications from "./components/Notifications";
import Confirmation from "./components/Confirmation";
import WelcomeTour from "./components/WelcomeTour";
import LoadingScreen from "./components/LoadingScreen";
import NotificationBell from "./components/NotificationBell";
import { Role, DecisionType, ConfirmationState } from "./types/datasets";
import { getRoleConfig } from "./roleConfig";
import { createAuditRecord, useAppData } from "./context/AppDataContext";
import { getRecommendationBundle } from "./lib/dataLoader";
import GuidedTour from "./components/GuidedTour";
import ToastContainer, { Toast } from "./components/shared/ToastContainer";
import { motion, AnimatePresence } from "motion/react";

function roleBadgeClass(role: Role): string {
  switch (role) {
    case Role.IT_ADMIN:
      return "tl-role-admin";
    case Role.SECURITY_ANALYST:
      return "tl-role-analyst";
    case Role.EMPLOYEE:
      return "tl-role-employee";
    default:
      return "tl-role-admin";
  }
}

export default function App() {
  const {
    loading,
    error,
    data,
    indexes,
    recommendations,
    selectedId,
    setSelectedId,
    updateRecommendationStatus,
    addFeedback,
    orgMetrics,
  } = useAppData();

  const [currentTab, setCurrentTab] = useState("dashboard");
  const [activeRole, setActiveRole] = useState<Role>(Role.IT_ADMIN);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showRolePopup, setShowRolePopup] = useState(false);
  const [lastRole, setLastRole] = useState<Role | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const showToast = useCallback((message: string, type: "success" | "info" | "warning") => {
    setToasts((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, message, type },
    ]);
  }, []);

  useEffect(() => {
    const seen = sessionStorage.getItem("trustlens-welcome");
    if (!seen) {
      setShowWelcome(true);
      sessionStorage.setItem("trustlens-welcome", "1");
    }
  }, []);

  // Role Switching Responsibilities Alert
  useEffect(() => {
    if (lastRole && lastRole !== activeRole) {
      setShowRolePopup(true);
      const timer = setTimeout(() => setShowRolePopup(false), 3000);
      return () => clearTimeout(timer);
    }
    setLastRole(activeRole);
  }, [activeRole, lastRole]);

  // Achievement Popups
  useEffect(() => {
    if (orgMetrics) {
      const timer = setTimeout(() => {
        showToast("Achievement Unlocked: 30 Days Without AI Incident 🛡️", "success");
        if (orgMetrics.trustIndex >= 90) {
          showToast("Achievement Unlocked: Trust Index Reached 90% 🎯", "success");
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [orgMetrics, showToast]);

  const selectedRec = recommendations.find((r) => r.recommendation_id === selectedId);

  const openDetailsModal = useCallback((id: string) => {
    setSelectedId(id);
    setShowDetailsModal(true);
  }, [setSelectedId]);

  const handleDecision = useCallback(
    (decision: DecisionType, notes?: string, overrideReason?: string) => {
      if (!selectedRec) return;
      const roleConfig = getRoleConfig(activeRole);
      if (!roleConfig.canDecide) return;

      const audit = createAuditRecord(selectedRec, activeRole, decision, notes, overrideReason);
      const status =
        decision === "Approved" ? "Approved" : decision === "Overridden" ? "Overridden" : "Escalated";

      updateRecommendationStatus(selectedRec.recommendation_id, status, audit);
      
      // Toast notification alerts
      if (decision === "Approved") {
        showToast(`Recommendation Approved: Isolated ${selectedRec.device_name}`, "success");
      } else if (decision === "Overridden") {
        showToast(`Recommendation Overridden for ${selectedRec.recommendation_id}`, "warning");
      } else {
        showToast(`Recommendation Escalated for senior review`, "info");
      }
      showToast("Trust Ledger Updated", "success");

      setConfirmation({ decision, recommendation_id: selectedRec.recommendation_id, notes });
      setCurrentTab("confirmation");
    },
    [selectedRec, activeRole, updateRecommendationStatus, showToast],
  );

  if (loading) return <LoadingScreen />;
  if (error || !data || !indexes) {
    return (
      <LoadingScreen message={error ?? "Dataset load failed. Run: python scripts/generate_datasets.py"} />
    );
  }

  const bundle = getRecommendationBundle(data, indexes, selectedId);

  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <Dashboard
            activeRole={activeRole}
            setSelectedId={openDetailsModal}
            setCurrentTab={setCurrentTab}
          />
        );
      case "explorer":
        return bundle ? (
          <RecommendationExplorer
            activeRole={activeRole}
            bundle={bundle}
            onDecision={handleDecision}
            onBack={() => setCurrentTab("dashboard")}
          />
        ) : (
          <Dashboard activeRole={activeRole} setSelectedId={openDetailsModal} setCurrentTab={setCurrentTab} />
        );
      case "trust":
        return <TrustAnalytics />;
      case "ai-health":
        return <AIHealthPage />;
      case "audit-center":
        return <AuditCenter />;
      case "audit":
        return <AuditFeed activeRole={activeRole} />;
      case "notifications":
        return (
          <Notifications
            activeRole={activeRole}
            onOpenRecommendation={openDetailsModal}
          />
        );
      case "confirmation":
        return confirmation && selectedRec ? (
          <Confirmation
            confirmation={confirmation}
            recommendation={selectedRec}
            activeRole={activeRole}
            onSubmitFeedback={(rating, comment) => {
              addFeedback({
                recommendation_id: confirmation.recommendation_id,
                decision_id: `DEC-${Date.now()}`,
                rating,
                feedback_comment: comment,
                reviewer: getRoleConfig(activeRole).shortLabel,
                submitted_at: new Date().toISOString(),
              });
            }}
            onBackToDashboard={() => {
              setConfirmation(null);
              setCurrentTab("dashboard");
            }}
            onViewActivityLog={() => {
              setConfirmation(null);
              setCurrentTab(getRoleConfig(activeRole).canAccessAuditCenter ? "audit-center" : "audit");
            }}
          />
        ) : (
          <Dashboard activeRole={activeRole} setSelectedId={openDetailsModal} setCurrentTab={setCurrentTab} />
        );
      default:
        return <Dashboard activeRole={activeRole} setSelectedId={openDetailsModal} setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="tl-shell flex min-h-screen">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
      />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {currentTab !== "confirmation" && (
          <header className="tl-main-header flex h-14 shrink-0 items-center justify-between gap-4 px-6">
            <span className="text-sm font-medium text-[var(--tl-text-secondary)]">
              TrustLens AI · Enterprise Governance Platform
            </span>
            <div className="flex items-center gap-3">
              <NotificationBell
                activeRole={activeRole}
                onOpenNotifications={() => setCurrentTab("notifications")}
                onOpenRecommendation={openDetailsModal}
              />
              <span className={`hidden rounded-full px-4 py-1.5 text-xs font-bold sm:inline ${roleBadgeClass(activeRole)}`}>
                {activeRole}
              </span>
            </div>
          </header>
        )}
        <div className="flex flex-1 flex-col overflow-hidden">{renderContent()}</div>
      </main>

      {/* 1. Welcome Modal & 13. Guided Tour */}
      <WelcomeTour open={showWelcome} onClose={() => setShowWelcome(false)} onTakeTour={() => setTourActive(true)} />
      <GuidedTour open={tourActive} onClose={() => setTourActive(false)} setCurrentTab={setCurrentTab} />

      {/* 2. Role Switch Responsibilities Popup */}
      <AnimatePresence>
        {showRolePopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-6 left-6 z-50 w-80 max-w-sm rounded-xl border border-[var(--tl-border)] bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md text-white"
          >
            <p className="text-[10px] text-[var(--tl-text-muted)] font-bold uppercase tracking-wider">Persona Changed</p>
            <h4 className="mt-1 font-display text-sm font-bold text-white">Viewing as: {activeRole}</h4>
            <p className="mt-2 text-xs leading-relaxed text-[var(--tl-text-secondary)]">
              {activeRole === Role.IT_ADMIN
                ? "Key Duties: Overall system governance, regulatory compliance audits, aggregate trust indices evaluation, and final override authority."
                : activeRole === Role.SECURITY_ANALYST
                  ? "Key Duties: Threat investigation queue monitoring, evidence timelines weighting, anomaly analysis, and outcome patterns review."
                  : "Key Duties: Individual device safety tracking, personal recommendation checklists, and notification alerts review."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Full-Screen Recommendation Details slide-up modal */}
      <AnimatePresence>
        {showDetailsModal && bundle && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed inset-0 z-40 bg-[var(--tl-bg-main)] flex flex-col"
          >
            <div className="absolute right-6 top-4 z-50 flex items-center gap-2">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="rounded-xl border border-[var(--tl-border)] bg-[var(--tl-bg-elevated)] px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700 shadow-md"
              >
                Close View
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <RecommendationExplorer
                activeRole={activeRole}
                bundle={bundle}
                onDecision={(decision, notes, reason) => {
                  handleDecision(decision, notes, reason);
                  setShowDetailsModal(false);
                }}
                onBack={() => setShowDetailsModal(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. Success Toasts Container */}
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}
