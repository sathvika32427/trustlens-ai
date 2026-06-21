import { useState } from "react";
import { Database } from "lucide-react";
import { DataSourceRow } from "../../types/datasets";
import Modal from "../Modal";

interface Props {
  sources: DataSourceRow[];
}

export default function DataSourceAttribution({ sources }: Props) {
  const [selectedSource, setSelectedSource] = useState<DataSourceRow | null>(null);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="tl-panel !p-4">
      <h3 className="tl-panel-title flex items-center gap-2 !text-base">
        <Database className="h-4.5 w-4.5 text-[var(--tl-dell-blue)]/80" />
        🗃️ Data Source Attribution
      </h3>
      <p className="mb-3 text-xs text-[var(--tl-text-muted)]">
        Underlying data feeds utilized by the AI agent to compute recommendation risk and confidence.
      </p>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((src) => (
          <div
            key={src.source_id}
            className="flex flex-col justify-between rounded-xl border border-[var(--tl-border)]/50 bg-[var(--tl-bg-elevated)]/60 p-3 transition hover:border-[var(--tl-dell-blue)]/50"
          >
            <div>
              <div className="flex items-start justify-between gap-1.5">
                <span className="font-display font-bold text-white text-xs">📊 {src.source_name}</span>
                <span className="text-[9px] rounded bg-slate-800 px-1.5 py-0.5 text-[var(--tl-text-muted)] border border-slate-700">
                  {src.source_type}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-[var(--tl-text-secondary)] line-clamp-2 leading-relaxed">
                {src.description}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[var(--tl-border)]/30 pt-2">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--tl-success)]/80">
                🟢 {src.trust_level} Trust
              </span>
              <button
                type="button"
                onClick={() => setSelectedSource(src)}
                className="flex items-center gap-0.5 text-[11px] font-semibold text-[var(--tl-dell-blue-light)] hover:underline"
              >
                🔎 View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={selectedSource !== null}
        onClose={() => setSelectedSource(null)}
        title="View Source Details"
        accent="blue"
      >
        {selectedSource && (
          <div className="space-y-3.5 text-xs">
            <div>
              <span className="tl-field-label">Source Name</span>
              <p className="font-bold text-white text-sm">📊 {selectedSource.source_name}</p>
            </div>
            <div>
              <span className="tl-field-label">Source Type</span>
              <p className="text-[var(--tl-text-secondary)] font-medium">{selectedSource.source_type}</p>
            </div>
            <div>
              <span className="tl-field-label">Source Description</span>
              <p className="text-xs text-[var(--tl-text-secondary)] leading-relaxed bg-[var(--tl-bg-elevated)]/50 border border-[var(--tl-border)]/50 rounded-xl p-3">
                {selectedSource.description}
              </p>
            </div>
            <div>
              <span className="tl-field-label">Data Collected</span>
              <p className="text-xs text-[var(--tl-text-secondary)] leading-relaxed bg-[var(--tl-bg-elevated)]/50 border border-[var(--tl-border)]/50 rounded-xl p-3">
                {selectedSource.data_collected || "General event streams and diagnostic signals."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="tl-field-label">Trust Level</span>
                <span className="inline-block rounded-full bg-[var(--tl-success)]/10 border border-[var(--tl-success)]/20 text-[var(--tl-success)]/90 px-2.5 py-0.5 text-[10px] font-bold">
                  🟢 {selectedSource.trust_level} Trust
                </span>
              </div>
              <div>
                <span className="tl-field-label">Timestamp</span>
                <p className="text-[10px] text-[var(--tl-text-muted)] mt-1 font-mono">
                  ⏱️ {selectedSource.last_updated}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
