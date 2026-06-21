import { useState } from "react";
import { Search, ClipboardList, Filter } from "lucide-react";
import { motion } from "motion/react";
import { Role } from "../types/datasets";
import { useAppData } from "../context/AppDataContext";
import { filterRecommendationsByRole } from "../lib/dataLoader";
import { CURRENT_EMPLOYEE } from "../roleConfig";
import DecisionMetricsBar from "./shared/DecisionMetricsBar";
import AuditRecordCard from "./shared/AuditRecordCard";

export default function AuditFeed({ activeRole }: { activeRole: Role }) {
  const { data, recommendations, auditRecords, orgMetrics } = useAppData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Approved" | "Overridden" | "Escalated">("All");

  if (!orgMetrics) return null;

  const scopedRecs = filterRecommendationsByRole(
    recommendations,
    activeRole,
    data?.manifest.current_employee ?? CURRENT_EMPLOYEE,
  );
  const scopedIds = new Set(scopedRecs.map((r) => r.recommendation_id));

  const filtered = auditRecords
    .filter(
      (r) =>
        activeRole === Role.IT_ADMIN ||
        scopedIds.has(r.recommendation_id) ||
        scopedRecs.some((s) => s.device_id === r.device_id),
    )
    .filter((record) => {
      const q = search.toLowerCase();
      const match =
        record.device_name.toLowerCase().includes(q) ||
        record.action.toLowerCase().includes(q) ||
        record.outcome.toLowerCase().includes(q) ||
        record.reviewer.toLowerCase().includes(q);
      const f = filter === "All" || record.decision === filter;
      return match && f;
    });

  return (
    <div className="mesh-bg flex-1 overflow-y-auto">
      <div className="border-b border-[var(--tl-border)] bg-[var(--tl-bg-sidebar)] px-8 py-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--tl-dell-blue-light)]">
            <ClipboardList className="h-4 w-4" />
            Activity Log
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold text-[var(--tl-text-primary)] lg:text-4xl">
            Decision Activity
          </h1>
          <p className="mt-2 max-w-2xl text-base text-[var(--tl-text-secondary)]">
            KPI summary first, then searchable audit timeline.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-8 py-8">
        <DecisionMetricsBar metrics={orgMetrics} title="Decision Summary" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tl-text-muted)]" />
            <input
              type="text"
              placeholder="Search by device, action, reviewer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="tl-input w-full pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[var(--tl-text-muted)]" />
            {(["All", "Approved", "Overridden", "Escalated"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  filter === f
                    ? "bg-[var(--tl-dell-blue)] text-white"
                    : "border border-[var(--tl-border)] bg-[var(--tl-bg-card)] text-[var(--tl-text-primary)] hover:border-[var(--tl-dell-blue)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.length === 0 && (
            <p className="py-16 text-center text-[var(--tl-text-muted)]">No matching records found.</p>
          )}
          {filtered.map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <AuditRecordCard record={record} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
