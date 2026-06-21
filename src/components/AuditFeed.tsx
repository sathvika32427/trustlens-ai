import { useState } from "react";
import { motion } from "motion/react";
import { Search, ClipboardList, Filter } from "lucide-react";
import { AuditRecord } from "../types";
import { getConfidenceStyles } from "../data";

interface AuditFeedProps {
  auditRecords: AuditRecord[];
}

export default function AuditFeed({ auditRecords }: AuditFeedProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Approved" | "Overridden" | "Escalated">("All");

  const filtered = auditRecords.filter((record) => {
    const q = search.toLowerCase();
    const matchesSearch =
      record.deviceName.toLowerCase().includes(q) ||
      record.action.toLowerCase().includes(q) ||
      record.decision.toLowerCase().includes(q) ||
      record.reviewer.toLowerCase().includes(q) ||
      record.notes.toLowerCase().includes(q) ||
      record.aiReasoning.toLowerCase().includes(q);
    const matchesFilter = filter === "All" || record.decision === filter;
    return matchesSearch && matchesFilter;
  });

  const decisionStyles: Record<string, string> = {
    Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Overridden: "bg-amber-100 text-amber-700 border-amber-200",
    Escalated: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <div className="mesh-bg flex-1 overflow-y-auto">
      <div className="border-b border-slate-200/60 bg-white/60 px-6 py-8 backdrop-blur-sm lg:px-10">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
          <ClipboardList className="h-4 w-4" />
          Audit Trail
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">Activity Log</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Searchable record of past AI recommendations, their reasoning, and what humans decided.
        </p>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8 lg:px-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
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
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
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

          {filtered.map((record, i) => {
            const confStyles = getConfidenceStyles(record.confidence);
            return (
              <motion.article
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-100/60"
              >
                <div className={`h-0.5 bg-gradient-to-r ${confStyles.gradient}`} />
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-slate-400">{record.id}</p>
                      <h3 className="mt-1 font-bold text-slate-900">{record.deviceName}</h3>
                      <p className="text-sm text-slate-500">Action: {record.action}</p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${decisionStyles[record.decision]}`}
                    >
                      {record.decision}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-blue-50/50 p-3 text-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        AI Reasoning
                      </p>
                      <p className="mt-1 text-slate-700">{record.aiReasoning}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Human Decision Notes
                      </p>
                      <p className="mt-1 text-slate-700">{record.notes}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <span
                      className={`rounded-full border px-2 py-0.5 font-semibold ${confStyles.bg} ${confStyles.text} ${confStyles.border}`}
                    >
                      {record.confidence}
                    </span>
                    <span>{record.reviewer} · {record.reviewerRole}</span>
                    <span>·</span>
                    <span>{record.timestamp}</span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
