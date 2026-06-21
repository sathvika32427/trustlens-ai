import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import RecommendationDetail from "./components/RecommendationDetail";
import Alternatives from "./components/Alternatives";
import AuditFeed from "./components/AuditFeed";
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

export default function App() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [activeRole, setActiveRole] = useState<Role>(Role.IT_ADMIN);
  const [selectedRec, setSelectedRec] = useState<AIRecommendation>(mockRecommendations[0]);
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
    const device = getDeviceById(selectedRec.deviceId);
    const newRecord: AuditRecord = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      deviceId: selectedRec.deviceId,
      deviceName: device?.name ?? selectedRec.deviceId,
      action: selectedRec.action,
      aiReasoning: selectedRec.reasoning,
      severity: selectedRec.severity,
      confidence: selectedRec.confidence,
      reviewer:
        activeRole === Role.IT_ADMIN
          ? "Alex Morgan"
          : activeRole === Role.SECURITY_ANALYST
            ? "Priya Sharma"
            : "Stakeholder View",
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
      timestamp: new Date().toLocaleString(),
    };

    selectedRec.status =
      decision === "Approved"
        ? "Approved"
        : decision === "Overridden"
          ? "Overridden"
          : "Escalated";

    setAuditRecords((prev) => [newRecord, ...prev]);
    setConfirmation({ decision, recommendation: selectedRec, notes });
    setCurrentTab("confirmation");
  };

  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <Dashboard
            activeRole={activeRole}
            setSelectedRec={setSelectedRec}
            setCurrentTab={setCurrentTab}
          />
        );
      case "details":
        return (
          <RecommendationDetail
            activeRole={activeRole}
            selectedRec={selectedRec}
            onDecision={handleDecision}
            setCurrentTab={setCurrentTab}
            onBack={() => setCurrentTab("dashboard")}
          />
        );
      case "alternatives":
        return (
          <Alternatives
            selectedRec={selectedRec}
            onBack={() => setCurrentTab("details")}
          />
        );
      case "audit":
        return <AuditFeed auditRecords={auditRecords} />;
      case "confirmation":
        return confirmation ? (
          <Confirmation
            confirmation={confirmation}
            onBackToDashboard={() => {
              setConfirmation(null);
              setCurrentTab("dashboard");
            }}
            onViewActivityLog={() => {
              setConfirmation(null);
              setCurrentTab("audit");
            }}
          />
        ) : (
          <Dashboard
            activeRole={activeRole}
            setSelectedRec={setSelectedRec}
            setCurrentTab={setCurrentTab}
          />
        );
      default:
        return (
          <Dashboard
            activeRole={activeRole}
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
              Fleet endpoint management · Simulated AI recommendations
            </span>
            <span className="max-w-[180px] truncate rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
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
