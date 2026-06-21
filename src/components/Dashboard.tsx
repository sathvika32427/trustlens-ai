import {
  Shield,
  ShieldAlert,
  Scale,
  Gavel,
  ArrowUpRight,
  Monitor,
  Bell,
  History,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import {
  AIRecommendation,
  AuditRecord,
  Role,
  DeviceStatus,
  Severity,
} from "../types";
import { complianceMetrics, getDeviceById, mockNotifications } from "../data";
import { CURRENT_EMPLOYEE } from "../roleConfig";
import {
  computeDecisionMetrics,
  filterRecommendationsForRole,
  filterAuditRecordsForRole,
} from "../utils/metrics";
import KpiSection from "./shared/KpiSection";
import RecommendationSummaryRow from "./shared/RecommendationSummaryRow";
import StatusBadge from "./shared/StatusBadge";

interface DashboardProps {
  activeRole: Role;
  recommendations: AIRecommendation[];
  auditRecords: AuditRecord[];
  setSelectedRec: (rec: AIRecommendation) => void;
  setCurrentTab: (tab: string) => void;
}

export default function Dashboard({
  activeRole,
  recommendations,
  auditRecords,
  setSelectedRec,
  setCurrentTab,
}: DashboardProps) {
  const filteredRecs = filterRecommendationsForRole(activeRole, recommendations);
  const filteredAudit = filterAuditRecordsForRole(activeRole, auditRecords);
  const metrics = computeDecisionMetrics(recommendations, auditRecords);

  const handleOpen = (rec: AIRecommendation) => {
    setSelectedRec(rec);
    setCurrentTab("explorer");
  };

  if (activeRole === Role.EMPLOYEE) {
    return (
      <EmployeeDashboard
        recommendations={filteredRecs}
        auditRecords={filteredAudit}
        onOpen={handleOpen}
        setCurrentTab={setCurrentTab}
      />
    );
  }

  if (activeRole === Role.SECURITY_ANALYST) {
    return (
      <AnalystDashboard
        recommendations={filteredRecs}
        metrics={metrics}
        onOpen={handleOpen}
      />
    );
  }

  return (
    <AdminDashboard
      recommendations={filteredRecs}
      metrics={metrics}
      onOpen={handleOpen}
      setCurrentTab={setCurrentTab}
    />
  );
}

function AdminDashboard({
  recommendations,
  metrics,
  onOpen,
  setCurrentTab,
}: {
  recommendations: AIRecommendation[];
  metrics: ReturnType<typeof computeDecisionMetrics>;
  onOpen: (rec: AIRecommendation) => void;
  setCurrentTab: (tab: string) => void;
}) {
  const overrideRate = metrics.total
    ? Math.round((metrics.overridden / metrics.total) * 100)
    : 0;
  const escalationRate = metrics.total
    ? Math.round((metrics.escalated / metrics.total) * 100)
    : 0;

  return (
    <div className="mesh-bg flex-1 overflow-y-auto">
      <PageHeader
        badge="IT Administrator · Organization View"
        title="Governance Dashboard"
        subtitle="Organization-wide recommendations, compliance metrics, and final approval authority."
      />

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 lg:px-8">
        <KpiSection metrics={metrics} />

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Recommendation Queue
              </h2>
              <span className="text-sm text-slate-500">{recommendations.length} open cases</span>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Summary only — open the Recommendation Explorer for full reasoning, evidence, and
              controls.
            </p>
            <div className="space-y-2">
              {recommendations.map((rec) => (
                <RecommendationSummaryRow key={rec.id} recommendation={rec} onOpen={onOpen} />
              ))}
            </div>
          </section>

          <div className="space-y-4">
            <WidgetCard title="Compliance Metrics" icon={Scale}>
              <MetricRow label="SOC 2 Compliance" value={`${complianceMetrics.soc2Compliance}%`} />
              <MetricRow label="Patch Compliance" value={`${complianceMetrics.patchCompliance}%`} />
              <MetricRow label="Audit Coverage" value={`${complianceMetrics.auditCoverage}%`} />
              <MetricRow
                label="Open Violations"
                value={String(complianceMetrics.policyViolations)}
                warn
              />
            </WidgetCard>

            <WidgetCard title="Human Override Stats" icon={Gavel}>
              <MetricRow label="Override Rate" value={`${overrideRate}%`} />
              <MetricRow label="Escalation Rate" value={`${escalationRate}%`} />
              <MetricRow label="Pending Review" value={String(metrics.pending)} />
            </WidgetCard>

            <WidgetCard title="Governance Controls" icon={Shield}>
              <button
                type="button"
                onClick={() => setCurrentTab("trust")}
                className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              >
                Trust Analytics
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab("audit-center")}
                className="mt-2 flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              >
                Audit Center
                <ChevronRight className="h-4 w-4" />
              </button>
            </WidgetCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalystDashboard({
  recommendations,
  metrics,
  onOpen,
}: {
  recommendations: AIRecommendation[];
  metrics: ReturnType<typeof computeDecisionMetrics>;
  onOpen: (rec: AIRecommendation) => void;
}) {
  const criticalCount = recommendations.filter((r) => r.severity === Severity.CRITICAL).length;
  const highCount = recommendations.filter((r) => r.severity === Severity.HIGH).length;

  return (
    <div className="mesh-bg flex-1 overflow-y-auto">
      <PageHeader
        badge="Security Analyst · Threat Operations"
        title="Investigation Dashboard"
        subtitle="Threat analysis, evidence timelines, risk assessments, and incident investigations."
      />

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Active Threats" value={recommendations.length} color="red" />
          <StatCard label="Critical Severity" value={criticalCount} color="orange" />
          <StatCard label="High Severity" value={highCount} color="amber" />
          <StatCard label="Escalated Cases" value={metrics.escalated} color="purple" />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <h2 className="font-display text-xl font-bold text-slate-900">
              Incident Investigations
            </h2>
          </div>
          <p className="mb-4 text-sm text-slate-600">
            Cases requiring threat analysis. Detailed reasoning and evidence live in the
            Recommendation Explorer.
          </p>
          <div className="space-y-2">
            {recommendations.length === 0 ? (
              <p className="py-8 text-center text-slate-400">No active investigations.</p>
            ) : (
              recommendations.map((rec) => (
                <RecommendationSummaryRow key={rec.id} recommendation={rec} onOpen={onOpen} />
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5">
          <h3 className="font-display text-lg font-bold text-slate-900">Risk Assessment Summary</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {criticalCount} critical and {highCount} high-severity cases need analyst review.
            Alternative action analysis and recommendation reasoning are available per case in the
            Explorer.
          </p>
        </section>
      </div>
    </div>
  );
}

function EmployeeDashboard({
  recommendations,
  auditRecords,
  onOpen,
  setCurrentTab,
}: {
  recommendations: AIRecommendation[];
  auditRecords: AuditRecord[];
  onOpen: (rec: AIRecommendation) => void;
  setCurrentTab: (tab: string) => void;
}) {
  const device = getDeviceById("DEV-143");
  const unread = mockNotifications.filter((n) => !n.read).length;

  return (
    <div className="mesh-bg flex-1 overflow-y-auto">
      <PageHeader
        badge={`Employee · ${CURRENT_EMPLOYEE}`}
        title="My Security Dashboard"
        subtitle="Your device status, recommendations affecting you, and personal notifications."
      />

      <div className="mx-auto max-w-4xl space-y-6 px-5 py-6 lg:px-8">
        {device && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-blue-100 p-3">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl font-bold text-slate-900">My Device Status</h2>
                <p className="mt-1 text-lg font-semibold text-slate-800">{device.name}</p>
                <p className="text-sm text-slate-500">
                  {device.type} · {device.os}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      device.status === DeviceStatus.HIGH_RISK
                        ? "bg-red-100 text-red-700"
                        : device.status === DeviceStatus.WARNING
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {device.status}
                  </span>
                  <span className="text-sm text-slate-500">Last seen: {device.lastSeen}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-slate-900">My Recommendations</h2>
          <p className="mt-1 mb-4 text-sm text-slate-600">
            AI recommendations that may affect your device. Tap to see what it means for you.
          </p>
          {recommendations.length === 0 ? (
            <p className="py-6 text-center text-slate-400">No recommendations for your devices.</p>
          ) : (
            recommendations.map((rec) => (
              <RecommendationSummaryRow key={rec.id} recommendation={rec} onOpen={onOpen} />
            ))
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-slate-600" />
            <h2 className="font-display text-lg font-bold text-slate-900">My Incident History</h2>
          </div>
          {auditRecords.length === 0 ? (
            <p className="py-4 text-sm text-slate-400">No incidents on your devices.</p>
          ) : (
            <div className="space-y-3">
              {auditRecords.map((record) => (
                <div key={record.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-xs text-slate-400">{record.id}</p>
                    <StatusBadge status={record.decision} size="sm" />
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{record.outcome}</p>
                  <p className="mt-1 text-xs text-slate-500">{record.timestamp}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <h2 className="font-display text-lg font-bold text-slate-900">My Notifications</h2>
            </div>
            {unread > 0 && (
              <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
                {unread} new
              </span>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {mockNotifications.slice(0, 2).map((n) => (
              <div
                key={n.id}
                className={`rounded-xl border p-3 ${n.read ? "border-slate-100 bg-slate-50" : "border-blue-200 bg-blue-50/50"}`}
              >
                <p className="font-semibold text-slate-900">{n.title}</p>
                <p className="mt-1 text-sm text-slate-600">{n.message}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setCurrentTab("notifications")}
            className="mt-4 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all notifications
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </section>
      </div>
    </div>
  );
}

function PageHeader({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="border-b border-slate-200/60 bg-white/70 px-5 py-6 backdrop-blur-sm lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
          <Shield className="h-4 w-4" />
          {badge}
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 lg:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-base text-slate-600">{subtitle}</p>
      </div>
    </div>
  );
}

function WidgetCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Shield;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-blue-600" />
        <h3 className="font-display font-bold text-slate-900">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function MetricRow({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <span className={`font-bold ${warn ? "text-amber-600" : "text-slate-900"}`}>{value}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "red" | "orange" | "amber" | "purple";
}) {
  const gradients = {
    red: "from-red-500 to-rose-600",
    orange: "from-orange-500 to-red-500",
    amber: "from-amber-500 to-orange-500",
    purple: "from-purple-500 to-violet-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className={`h-1 bg-gradient-to-r ${gradients[color]}`} />
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 font-display text-4xl font-bold text-slate-900">{value}</p>
      </div>
    </motion.div>
  );
}
