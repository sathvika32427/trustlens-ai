import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import RecommendationExplorer from "./components/RecommendationExplorer";
import AuditFeed from "./components/AuditFeed";
import AuditCenter from "./components/AuditCenter";
import TrustAnalytics from "./components/TrustAnalytics";
import Notifications from "./components/Notifications";
import Confirmation from "./components/Confirmation";
import WelcomeTour from "./components/WelcomeTour";
import {
  Role,
  AIRecommendation,
  AuditRecord,
  DecisionType,
  ConfirmationState,
} from "./types";
import { mockRecommendations, mockAuditHistory, getDeviceById } from "./data";
import { getReviewerName, getRoleConfig } from "./roleConfig";

export default function App() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [activeRole, setActiveRole] = useState<Role>(Role.IT_ADMIN);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    () => structuredClone(mockRecommendations),
  );
  const [selectedRec, setSelectedRec] = useState<AIRecommendation>(recommendations[0]);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(mockAuditHistory);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("trustlens-welcome");
    if (!seen) {
      setShowWelcome(true);
      sessionStorage.setItem("trustlens-welcome", "1");
    }
  }, []);

  const handleDecision = (decision: DecisionType, notes?: string, overrideReason?: string) => {
    const roleConfig = getRoleConfig(activeRole);
    if (!roleConfig.canDecide) return;

    const device = getDeviceById(selectedRec.deviceId);
    const outcomeMap: Record<DecisionType, string> = {
      Approved: "Action executed — threat response initiated",
      Overridden: "No threat detected — AI recommendation rejected",
      Escalated: "Under senior review — pending manual verification",
    };

    const newRecord: AuditRecord = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      deviceId: selectedRec.deviceId,
      deviceName: device?.name ?? selectedRec.deviceId,
      action: selectedRec.action,
      aiReasoning: selectedRec.reasoning,
      severity: selectedRec.severity,
      confidence: selectedRec.confidence,
      reviewer: getReviewerName(activeRole),
      reviewerRole: activeRole,
      decision,
      overrideReason,
      notes:
        notes ??
        (decision === "Approved"
          ? `Approved AI recommendation: ${selectedRec.action}`
          : decision === "Escalated"
            ? "Escalated to senior admin for manual review."
            : "Recommendation overridden."),
      outcome: outcomeMap[decision],
      timestamp: new Date().toLocaleString(),
    };

    const newStatus =
      decision === "Approved"
        ? "Approved"
        : decision === "Overridden"
          ? "Overridden"
          : "Escalated";

    setRecommendations((prev) =>
      prev.map((r) => (r.id === selectedRec.id ? { ...r, status: newStatus } : r)),
    );
    setSelectedRec((prev) => ({ ...prev, status: newStatus }));
    setAuditRecords((prev) => [newRecord, ...prev]);
    setConfirmation({ decision, recommendation: { ...selectedRec, status: newStatus }, notes });
    setCurrentTab("confirmation");
  };

  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <Dashboard
            activeRole={activeRole}
            recommendations={recommendations}
            auditRecords={auditRecords}
            setSelectedRec={setSelectedRec}
            setCurrentTab={setCurrentTab}
          />
        );
      case "explorer":
        return (
          <RecommendationExplorer
            activeRole={activeRole}
            selectedRec={selectedRec}
            auditRecords={auditRecords}
            onDecision={handleDecision}
            onBack={() => setCurrentTab("dashboard")}
          />
        );
      case "trust":
        return (
          <TrustAnalytics recommendations={recommendations} auditRecords={auditRecords} />
        );
      case "audit-center":
        return <AuditCenter auditRecords={auditRecords} />;
      case "audit":
        return (
          <AuditFeed
            auditRecords={auditRecords}
            recommendations={recommendations}
            activeRole={activeRole}
          />
        );
      case "notifications":
        return <Notifications />;
      case "confirmation":
        return confirmation ? (
          <Confirmation
            confirmation={confirmation}
            activeRole={activeRole}
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
          <Dashboard
            activeRole={activeRole}
            recommendations={recommendations}
            auditRecords={auditRecords}
            setSelectedRec={setSelectedRec}
            setCurrentTab={setCurrentTab}
          />
        );
      default:
        return (
          <Dashboard
            activeRole={activeRole}
            recommendations={recommendations}
            auditRecords={auditRecords}
            setSelectedRec={setSelectedRec}
            setCurrentTab={setCurrentTab}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900 antialiased">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
      />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {currentTab !== "confirmation" && (
          <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md">
            <span className="text-xs font-medium text-slate-500">
              Enterprise AI governance · Human-in-the-loop decisions
            </span>
            <span className="max-w-[200px] truncate rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
              {activeRole}
            </span>
          </header>
        )}
        <div className="flex flex-1 flex-col overflow-hidden">{renderContent()}</div>
      </main>

      <WelcomeTour open={showWelcome} onClose={() => setShowWelcome(false)} />
    </div>
  );
}
