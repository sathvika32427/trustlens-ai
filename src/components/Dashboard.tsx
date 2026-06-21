import { useMemo } from "react";
import {
  Shield,
  ShieldAlert,
  Scale,
  Gavel,
  Monitor,
  Bell,
  History,
  ChevronRight,
  Activity,
} from "lucide-react";
import { Role, RecommendationRow } from "../types/datasets";
import { useAppData } from "../context/AppDataContext";
import { filterRecommendationsByRole } from "../lib/dataLoader";
import { CURRENT_EMPLOYEE } from "../roleConfig";
import KpiSection from "./shared/KpiSection";
import RecommendationSummaryRow from "./shared/RecommendationSummaryRow";

interface Props {
  activeRole: Role;
  setSelectedId: (id: string) => void;
  setCurrentTab: (tab: string) => void;
}

export default function Dashboard({ activeRole, setSelectedId, setCurrentTab }: Props) {
  const { data, recommendations, orgMetrics, auditRecords } = useAppData();

  const filtered = useMemo(
    () => filterRecommendationsByRole(recommendations, activeRole, data?.manifest.current_employee ?? CURRENT_EMPLOYEE),
    [recommendations, activeRole, data],
  );

  const queue = filtered.filter((r) => r.status === "Pending").slice(0, 12);
  const metrics = orgMetrics!;

  const openExplorer = (rec: RecommendationRow) => {
    setSelectedId(rec.recommendation_id);
    setCurrentTab("explorer");
  };

  if (activeRole === Role.EMPLOYEE) {
    return (
      <EmployeeView
        recommendations={filtered}
        auditRecords={auditRecords.filter((a) =>
          filtered.some((r) => r.device_id === a.device_id),
        )}
        employeeDevice={data?.manifest.current_employee_device}
        onOpen={openExplorer}
        setCurrentTab={setCurrentTab}
      />
    );
  }

  if (activeRole === Role.SECURITY_ANALYST) {
    return (
      <AnalystView recommendations={filtered} onOpen={openExplorer} metrics={metrics} />
    );
  }

  return (
    <AdminView
      queue={queue}
      metrics={metrics}
      onOpen={openExplorer}
      setCurrentTab={setCurrentTab}
      overrideRate={metrics.total ? Math.round((metrics.overridden / metrics.total) * 100) : 0}
      escalationRate={metrics.total ? Math.round((metrics.escalated / metrics.total) * 100) : 0}
    />
  );
}

function PageHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) {
  return (
    <div className="border-b border-[var(--tl-border)] bg-[var(--tl-bg-sidebar)] px-6 py-6 lg:px-8">
      <p className="flex items-center gap-2 text-sm font-semibold text-[var(--tl-dell-blue-light)]">
        <Shield className="h-4 w-4" />
        {badge}
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white lg:text-4xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-base text-[var(--tl-text-secondary)]">{subtitle}</p>
    </div>
  );
}

function AdminView({
  queue,
  metrics,
  onOpen,
  setCurrentTab,
  overrideRate,
  escalationRate,
}: {
  queue: RecommendationRow[];
  metrics: NonNullable<ReturnType<typeof useAppData>["orgMetrics"]>;
  onOpen: (r: RecommendationRow) => void;
  setCurrentTab: (t: string) => void;
  overrideRate: number;
  escalationRate: number;
}) {
  const compliance = useAppData().data!;
  const avgTrust =
    compliance.trustBreakdown.reduce((s, t) => s + t.trust_index, 0) /
    compliance.trustBreakdown.length;

  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader
        badge="IT Administrator · Organization View"
        title="Governance Dashboard"
        subtitle="Organization-wide recommendations, compliance, audit, and final approval authority."
      />
      <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 lg:px-8">
        <KpiSection metrics={metrics} />
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="tl-panel lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="tl-panel-title">Recommendation Queue</h2>
              <span className="text-sm text-[var(--tl-text-muted)]">{queue.length} pending (summary)</span>
            </div>
            <p className="mb-4 text-sm text-[var(--tl-text-muted)]">
              Summary rows only — open Explorer for Trust Ledger, evidence weighting, and controls.
            </p>
            <div className="space-y-2">
              {queue.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--tl-text-muted)] border border-[var(--tl-border)] border-dashed rounded-xl">
                  No Active Recommendations.
                </p>
              ) : (
                queue.map((rec) => (
                  <RecommendationSummaryRow key={rec.recommendation_id} recommendation={rec} onOpen={onOpen} />
                ))
              )}
            </div>
          </section>
          <div className="space-y-4">
            <Widget title="Compliance Metrics" icon={Scale}>
              <Row label="Avg Trust Index" value={`${avgTrust.toFixed(1)}%`} />
              <Row label="Outcome Success" value={`${metrics.outcomeSuccessRate}%`} />
              <Row label="False Positive Rate" value={`${metrics.falsePositiveRate}%`} />
              <Row label="Feedback Avg" value={metrics.avgFeedbackRating.toFixed(2)} />
            </Widget>
            <Widget title="Override & Escalation" icon={Gavel}>
              <Row label="Override Rate" value={`${overrideRate}%`} />
              <Row label="Escalation Rate" value={`${escalationRate}%`} />
              <Row label="Pending Review" value={String(metrics.pending)} warn={metrics.pending > 300} />
            </Widget>
            <Widget title="Governance" icon={Shield}>
              <NavBtn label="Trust Analytics" onClick={() => setCurrentTab("trust")} />
              <NavBtn label="AI Health Dashboard" onClick={() => setCurrentTab("ai-health")} />
              <NavBtn label="Audit Center" onClick={() => setCurrentTab("audit-center")} />
            </Widget>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalystView({
  recommendations,
  onOpen,
  metrics,
}: {
  recommendations: RecommendationRow[];
  onOpen: (r: RecommendationRow) => void;
  metrics: NonNullable<ReturnType<typeof useAppData>["orgMetrics"]>;
}) {
  const critical = recommendations.filter((r) => r.severity === "Critical").length;
  const high = recommendations.filter((r) => r.severity === "High").length;
  const queue = recommendations.filter((r) => r.status === "Pending").slice(0, 15);

  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader
        badge="Security Analyst · Threat Operations"
        title="Investigation Dashboard"
        subtitle="Threat analysis, evidence timelines, similar cases, and outcome learning."
      />
      <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MiniKpi label="Active Threats" value={recommendations.length} />
          <MiniKpi label="Critical" value={critical} accent="danger" />
          <MiniKpi label="High Severity" value={high} accent="warning" />
          <MiniKpi label="Escalated" value={metrics.escalated} accent="blue" />
        </div>
        <section className="tl-panel">
          <h2 className="tl-panel-title flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-[var(--tl-danger)]" />
            Incident Investigations
          </h2>
          <div className="mt-4 space-y-2">
            {queue.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--tl-text-muted)] border border-[var(--tl-border)] border-dashed rounded-xl">
                No Active Recommendations.
              </p>
            ) : (
              queue.map((rec) => (
                <RecommendationSummaryRow key={rec.recommendation_id} recommendation={rec} onOpen={onOpen} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function EmployeeView({
  recommendations,
  auditRecords,
  employeeDevice,
  onOpen,
  setCurrentTab,
}: {
  recommendations: RecommendationRow[];
  auditRecords: { id: string; outcome: string; timestamp: string; decision: string }[];
  employeeDevice?: string;
  onOpen: (r: RecommendationRow) => void;
  setCurrentTab: (t: string) => void;
}) {
  const deviceRec = recommendations[0];

  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader
        badge={`Employee · ${CURRENT_EMPLOYEE}`}
        title="My Security Dashboard"
        subtitle="Personal device status, your recommendations, and notifications only."
      />
      <div className="mx-auto max-w-4xl space-y-6 px-5 py-6 lg:px-8">
        <section className="tl-panel">
          <h2 className="tl-panel-title flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            My Device Status
          </h2>
          {deviceRec ? (
            <>
              <p className="text-xl font-bold text-white">{deviceRec.device_name}</p>
              <p className="text-sm text-[var(--tl-text-muted)]">
                {deviceRec.device_type} · {deviceRec.os} · {employeeDevice}
              </p>
              <p className="mt-2 text-sm text-[var(--tl-text-secondary)]">Last seen: {deviceRec.last_seen}</p>
            </>
          ) : (
            <p className="text-[var(--tl-text-muted)]">No devices assigned.</p>
          )}
        </section>
        <section className="tl-panel">
          <h2 className="tl-panel-title">My Recommendations</h2>
          {recommendations.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--tl-text-muted)] border border-[var(--tl-border)] border-dashed rounded-xl">
              No Active Recommendations.
            </p>
          ) : (
            recommendations.map((rec) => (
              <RecommendationSummaryRow key={rec.recommendation_id} recommendation={rec} onOpen={onOpen} />
            ))
          )}
        </section>
        <section className="tl-panel">
          <h2 className="tl-panel-title flex items-center gap-2">
            <History className="h-5 w-5" />
            My Incident History
          </h2>
          {auditRecords.slice(0, 5).map((a) => (
            <div key={a.id} className="mt-2 rounded-lg bg-[var(--tl-bg-elevated)] p-3 text-sm">
              <p className="text-white">{a.outcome}</p>
              <p className="text-xs text-[var(--tl-text-muted)]">{a.timestamp}</p>
            </div>
          ))}
        </section>
        <button type="button" onClick={() => setCurrentTab("notifications")} className="tl-btn-primary flex items-center gap-2">
          <Bell className="h-4 w-4" />
          View Notifications
        </button>
      </div>
    </div>
  );
}

function Widget({ title, icon: Icon, children }: { title: string; icon: typeof Shield; children: React.ReactNode }) {
  return (
    <section className="tl-panel !p-4">
      <h3 className="mb-3 flex items-center gap-2 font-display font-bold text-white">
        <Icon className="h-4 w-4 text-[var(--tl-dell-blue)]" />
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[var(--tl-text-muted)]">{label}</span>
      <span className={`font-bold ${warn ? "text-[var(--tl-warning)]" : "text-white"}`}>{value}</span>
    </div>
  );
}

function NavBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between rounded-lg bg-[var(--tl-bg-elevated)] px-3 py-2 text-sm font-semibold text-[var(--tl-text-secondary)] hover:text-[var(--tl-dell-blue-light)]">
      {label}
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}

function MiniKpi({ label, value, accent }: { label: string; value: number; accent?: string }) {
  const border =
    accent === "danger"
      ? "var(--tl-danger)"
      : accent === "warning"
        ? "var(--tl-warning)"
        : accent === "blue"
          ? "var(--tl-escalated)"
          : "var(--tl-dell-blue)";
  return (
    <div className="tl-kpi" style={{ borderTopColor: border }}>
      <p className="tl-kpi-label">{label}</p>
      <p className="tl-kpi-value">{value}</p>
    </div>
  );
}
