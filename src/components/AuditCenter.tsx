import { useState } from "react";
import { ClipboardCheck, Search } from "lucide-react";
import { motion } from "motion/react";
import { AuditRecord } from "../types";
import StatusBadge from "./shared/StatusBadge";

interface AuditCenterProps {
  auditRecords: AuditRecord[];
}

export default function AuditCenter({ auditRecords }: AuditCenterProps) {
  const [search, setSearch] = useState("");

  const filtered = auditRecords.filter((record) => {
    const q = search.toLowerCase();
    return (
      record.deviceName.toLowerCase().includes(q) ||
      record.action.toLowerCase().includes(q) ||
      record.reviewer.toLowerCase().includes(q) ||
      record.outcome.toLowerCase().includes(q) ||
      (record.overrideReason?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="mesh-bg flex-1 overflow-y-auto">
      <div className="border-b border-slate-200/60 bg-white/70 px-5 py-6 backdrop-blur-sm lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
            <ClipboardCheck className="h-4 w-4" />
            Audit Center · Compliance & Accountability
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 lg:text-4xl">
            Decision Audit Records
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            Full accountability trail — AI recommendation, human decision, reason, outcome, and
            reviewer for every case.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by device, action, reviewer, outcome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="space-y-5">
          {filtered.map((record, i) => (
            <motion.article
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3">
                <span className="font-mono text-sm text-slate-500">{record.id}</span>
                <StatusBadge status={record.decision} />
              </div>

              <div className="grid gap-0 md:grid-cols-2">
                <AuditField label="AI Recommendation" value={record.action} highlight="blue" />
                <AuditField label="Human Decision" value={record.decision} highlight="slate" />
                <AuditField
                  label="Reason"
                  value={record.overrideReason ?? record.notes}
                  highlight="amber"
                />
                <AuditField label="Outcome" value={record.outcome} highlight="emerald" />
                <AuditField label="Timestamp" value={record.timestamp} />
                <AuditField
                  label="Reviewer"
                  value={`${record.reviewer} · ${record.reviewerRole}`}
                />
              </div>

              <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Device
                </p>
                <p className="text-sm font-medium text-slate-800">{record.deviceName}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuditField({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "blue" | "amber" | "emerald" | "slate";
}) {
  const bg = {
    blue: "bg-blue-50/50",
    amber: "bg-amber-50/50",
    emerald: "bg-emerald-50/50",
    slate: "bg-white",
  }[highlight ?? "slate"];

  return (
    <div className={`border-b border-slate-100 p-5 md:border-r ${bg}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold leading-snug text-slate-900">{value}</p>
    </div>
  );
}
