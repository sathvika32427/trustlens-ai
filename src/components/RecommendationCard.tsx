import type { FC } from "react";
import { ChevronRight, HelpCircle, Zap } from "lucide-react";
import type { AIRecommendation } from "../types";
import { getDeviceById, getConfidenceStyles } from "../data";

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  onReview: (rec: AIRecommendation) => void;
  compact?: boolean;
}

const RecommendationCard: FC<RecommendationCardProps> = ({
  recommendation,
  onReview,
  compact = false,
}) => {
  const device = getDeviceById(recommendation.deviceId);
  const styles = getConfidenceStyles(recommendation.confidence);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-200/40 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/60">
      <div className={`h-1 bg-gradient-to-r ${styles.gradient}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400">{recommendation.id}</span>
              {recommendation.status === "Pending" && (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                  <Zap className="h-3 w-3" /> Pending
                </span>
              )}
            </div>
            <h3 className="mt-1.5 font-display text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
              {recommendation.action}
            </h3>
            {device && (
              <p className="mt-1 text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{device.name}</span>
                {!compact && <span> · {device.owner}</span>}
              </p>
            )}
          </div>
          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold shadow-sm ${styles.bg} ${styles.text} ${styles.border}`}
          >
            {recommendation.confidence.split(" ")[0]}
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">{recommendation.summaryLine}</p>

        {!compact && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Reasoning", "Source", "Limits"].map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500"
              >
                ✓ {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <HelpCircle className="h-3.5 w-3.5" />
            5 transparency elements
          </span>
          <button
            onClick={() => onReview(recommendation)}
            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition hover:shadow-lg hover:shadow-blue-500/40"
          >
            Review
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default RecommendationCard;
