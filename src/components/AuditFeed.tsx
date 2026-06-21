import { useState } from "react";
import { Search, ClipboardList, Filter } from "lucide-react";
import { motion } from "motion/react";
import { AIRecommendation, AuditRecord, Role } from "../types";
import { computeDecisionMetrics, filterAuditRecordsForRole } from "../utils/metrics";
import DecisionMetricsBar from "./shared/DecisionMetricsBar";
import StatusBadge from "./shared/StatusBadge";

interface AuditFeedProps {
  auditRecords: AuditRecord[];
  recommendations: AIRecommendation[];
  activeRole: Role;
}

export default function AuditFeed({
  auditRecords,
  recommendations,
  activeRole,
}: AuditFeedProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Approved" | "Overridden" | "Escalated">("All");

  const scopedRecords = filterAuditRecordsForRole(activeRole, auditRecords);
  const metrics = computeDecisionMetrics(recommendations, auditRecords);

  const filtered = scopedRecords.filter((record) => {
    const q = search.toLowerCase();
    const matchesSearch =
      record.deviceName.toLowerCase().includes(q) ||
      record.action.toLowerCase().includes(q) ||
      record.decision.toLowerCase().includes(q) ||
      record.reviewer.toLowerCase().includes(q) ||
      record.outcome.toLowerCase().includes(q);
    const matchesFilter = filter === "All" || record.decision === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="mesh-bg flex-1 overflow-y-auto">
      <div className="border-b border-slate-200/60 bg-white/70 px-5 py-6 backdrop-blur-sm lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
            <ClipboardList className="h-4 w-4" />
            Activity Log
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 lg:text-4xl">
            Decision Activity
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            Searchable record of AI recommendations and human decisions across your scope.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-5 py-6 lg:px-8">
        <DecisionMetricsBar metrics={metrics} />

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by device, action, decision, reviewer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            {(["All", "Approved", "Overridden", "Escalated"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-md"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.length === 0 && (
            <p className="py-16 text-center text-slate-400">No matching records found.</p>
          )}

          {filtered.map((record, i) => (
            <motion.article
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
                <div>
                  <span className="font-mono text-xs text-slate-400">{record.id}</span>
                  <p className="font-semibold text-slate-900">{record.deviceName}</p>
                </div>
                <StatusBadge status={record.decision} />
              </div>
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                <Field label="AI Recommendation" value={record.action} />
                <Field label="Human Decision" value={record.decision} />
                <Field label="Outcome" value={record.outcome} />
                <Field label="Reviewer" value={`${record.reviewer} · ${record.timestamp}`} />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
