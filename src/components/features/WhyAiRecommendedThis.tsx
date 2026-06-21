import { Cpu, HelpCircle } from "lucide-react";
import { ReasoningChainRow, RecommendationRow } from "../../types/datasets";

interface Props {
  recommendation: RecommendationRow;
  reasoningChain: ReasoningChainRow[];
}

export default function WhyAiRecommendedThis({ recommendation, reasoningChain }: Props) {
  if (!reasoningChain || reasoningChain.length === 0) {
    return (
      <div className="tl-panel !p-4">
        <h3 className="tl-panel-title flex items-center gap-2 !text-base">
          <HelpCircle className="h-4.5 w-4.5 text-[var(--tl-dell-blue)]" />
          🧠 Why Did The AI Recommend This?
        </h3>
        <p className="mt-2 text-xs text-[var(--tl-text-secondary)] leading-relaxed">
          {recommendation.reasoning}
        </p>
      </div>
    );
  }

  // Emojis and step names
  const stepMeta = [
    { emoji: "🔍", title: "Evidence Collected" },
    { emoji: "⚖️", title: "Evidence Weighting" },
    { emoji: "🚨", title: "Risk Assessment" },
    { emoji: "📚", title: "Historical Similar Cases" },
    { emoji: "🎯", title: "Confidence Explanation" },
    { emoji: "⛓️", title: "Trust Ledger Analysis" },
    { emoji: "💼", title: "Business Impact Assessment" },
  ];

  return (
    <div className="tl-panel !p-4">
      <h3 className="tl-panel-title flex items-center gap-2 border-b border-[var(--tl-border)]/40 pb-3 !text-base">
        <Cpu className="h-4.5 w-4.5 text-[var(--tl-dell-blue)]/80" />
        🧠 Why Did The AI Recommend This?
      </h3>

      <div className="mt-4 relative pl-5 border-l border-slate-700/60 space-y-4">
        {reasoningChain.map((step, idx) => {
          // split step title and detail text
          const delimiterIndex = step.reasoning_step.indexOf(": ");
          let stepTitle = "";
          let stepText = step.reasoning_step;
          if (delimiterIndex !== -1) {
            stepTitle = step.reasoning_step.substring(0, delimiterIndex);
            stepText = step.reasoning_step.substring(delimiterIndex + 2);
          }

          const meta = stepMeta[idx % stepMeta.length];
          const emoji = meta ? meta.emoji : "📌";
          const displayTitle = meta ? meta.title : (stepTitle || `Step ${step.step_number}`);

          return (
            <div key={step.step_number} className="relative group">
              {/* Step indicator circle positioned absolutely on the timeline line */}
              <div className="absolute -left-[32px] top-1 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-[var(--tl-bg-card)] group-hover:border-[var(--tl-dell-blue-light)]/50 shadow transition-colors">
                <span className="font-mono text-[10px] font-bold text-white">
                  {step.step_number}
                </span>
              </div>

              <div className="rounded-xl border border-[var(--tl-border)]/50 bg-[var(--tl-bg-elevated)]/60 p-3 transition-colors hover:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--tl-border)]/30 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{emoji}</span>
                    <h4 className="font-display font-bold text-white text-xs">
                      {displayTitle}
                    </h4>
                  </div>
                  {step.evidence_weight > 0 && (
                    <span className="rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 text-[9px] font-bold">
                      Weight: {step.evidence_weight}%
                    </span>
                  )}
                </div>

                <p className="mt-2 text-[11px] leading-relaxed text-[var(--tl-text-secondary)]">
                  {stepText}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
