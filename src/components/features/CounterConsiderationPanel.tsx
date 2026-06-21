import { Scale } from "lucide-react";
import { CounterConsiderationRow, RecommendationRow } from "../../types/datasets";

interface Props {
  recommendation: RecommendationRow;
  counter?: CounterConsiderationRow;
}

export default function CounterConsiderationPanel({ recommendation, counter }: Props) {
  if (!counter) return null;

  return (
    <div className="tl-panel border-[var(--tl-warning)]/25 bg-[var(--tl-warning)]/5">
      <h3 className="tl-panel-title flex items-center gap-2">
        <Scale className="h-5 w-5 text-[var(--tl-warning)]" />
        Counter Consideration
      </h3>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-[var(--tl-bg-card)] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--tl-text-muted)]">
            Recommendation
          </p>
          <p className="mt-2 text-lg font-bold text-white">{recommendation.action}</p>
        </div>
        <div className="rounded-xl border border-[var(--tl-warning)]/30 bg-[var(--tl-bg-card)] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--tl-warning)]">
            Counter Consideration
          </p>
          <p className="mt-2 text-base leading-relaxed text-[var(--tl-text-secondary)]">
            {counter.counter_consideration}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--tl-text-muted)]">
        Purpose: reduce automation bias and encourage critical thinking before approval.
      </p>
    </div>
  );
}
