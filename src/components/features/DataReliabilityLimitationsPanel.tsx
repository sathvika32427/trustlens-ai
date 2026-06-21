import { Activity, ShieldAlert, CheckCircle2 } from "lucide-react";
import { DataSourceRow, LimitationRow } from "../../types/datasets";

interface Props {
  dataSources: DataSourceRow[];
  limitations: LimitationRow[];
}

export default function DataReliabilityLimitationsPanel({ dataSources, limitations }: Props) {
  // 1. Aggregate Data Source Trust Indices
  const sourceStats: Record<string, { count: number; sumTrust: number }> = {};
  const trustValueMap: Record<string, number> = {
    "Very High": 98,
    "High": 88,
    "Moderate": 72,
    "Low": 45,
  };

  dataSources.forEach((src) => {
    if (!sourceStats[src.source_name]) {
      sourceStats[src.source_name] = { count: 0, sumTrust: 0 };
    }
    sourceStats[src.source_name].count += 1;
    sourceStats[src.source_name].sumTrust += trustValueMap[src.trust_level] ?? 85;
  });

  const sourceList = Object.entries(sourceStats).map(([name, stat]) => ({
    name,
    count: stat.count,
    avgTrust: Math.round(stat.sumTrust / stat.count),
  })).sort((a, b) => b.avgTrust - a.avgTrust);

  // 2. Aggregate Limitation Frequencies
  const limitStats: Record<string, { count: number; High: number; Medium: number; Low: number }> = {};
  limitations.forEach((lim) => {
    if (!limitStats[lim.limitation]) {
      limitStats[lim.limitation] = { count: 0, High: 0, Medium: 0, Low: 0 };
    }
    limitStats[lim.limitation].count += 1;
    limitStats[lim.limitation][lim.severity] += 1;
  });

  const limitList = Object.entries(limitStats).map(([label, stat]) => ({
    label,
    count: stat.count,
    high: stat.High,
    medium: stat.Medium,
    low: stat.Low,
  })).sort((a, b) => b.count - a.count);

  return (
    <section className="tl-panel">
      <div className="flex items-center gap-2 border-b border-[var(--tl-border)] pb-4 mb-5">
        <Activity className="h-5 w-5 text-[var(--tl-dell-blue-light)]" />
        <div>
          <h3 className="tl-panel-title">Data Feeds & Telemetry Health Analysis</h3>
          <p className="text-xs text-[var(--tl-text-muted)]">
            Aggregate trust profiles computed from {dataSources.length} source entries and {limitations.length} limitation logs.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Data Source Trust Index */}
        <div className="rounded-xl border border-[var(--tl-border)] bg-[var(--tl-bg-elevated)] p-4 space-y-4">
          <h4 className="font-display font-bold text-white text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--tl-success)]" />
            Data Source Trust Index
          </h4>
          <div className="space-y-3.5">
            {sourceList.slice(0, 5).map((src) => (
              <div key={src.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">{src.name}</span>
                  <span className="text-[var(--tl-dell-blue-light)]">{src.avgTrust}% Trust ({src.count} uses)</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-[var(--tl-dell-blue-light)] transition-all"
                    style={{ width: `${src.avgTrust}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Flagged Telemetry Gaps */}
        <div className="rounded-xl border border-[var(--tl-border)] bg-[var(--tl-bg-elevated)] p-4 space-y-4">
          <h4 className="font-display font-bold text-white text-sm flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[var(--tl-warning)]" />
            Telemetry Gaps Profile
          </h4>
          <div className="space-y-2">
            {limitList.slice(0, 5).map((lim) => (
              <div
                key={lim.label}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">{lim.label}</p>
                  <p className="text-[10px] text-[var(--tl-text-muted)]">
                    Total occurrences: {lim.count}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {lim.high > 0 && (
                    <span className="rounded bg-[var(--tl-danger)]/15 border border-[var(--tl-danger)]/35 text-[var(--tl-danger)] px-1.5 py-0.5 text-[9px] font-bold">
                      {lim.high} High
                    </span>
                  )}
                  {lim.medium > 0 && (
                    <span className="rounded bg-[var(--tl-warning)]/15 border border-[var(--tl-warning)]/35 text-[var(--tl-warning)] px-1.5 py-0.5 text-[9px] font-bold">
                      {lim.medium} Med
                    </span>
                  )}
                  {lim.low > 0 && (
                    <span className="rounded bg-slate-800 border border-slate-700 text-[var(--tl-text-muted)] px-1.5 py-0.5 text-[9px] font-bold">
                      {lim.low} Low
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
