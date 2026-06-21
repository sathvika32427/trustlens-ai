import { useState } from "react";
import { Star } from "lucide-react";

interface Props {
  average: number;
  total: number;
  byRating: { rating: number; count: number }[];
}

export default function HumanFeedbackAnalytics({ average, total, byRating }: Props) {
  const max = Math.max(...byRating.map((b) => b.count), 1);

  return (
    <div className="tl-panel">
      <h3 className="tl-panel-title flex items-center gap-2">
        <Star className="h-5 w-5 text-[var(--tl-warning)]" />
        Human Feedback Analytics
      </h3>
      <div className="mb-4 flex items-end gap-4">
        <div>
          <p className="text-xs uppercase text-[var(--tl-text-muted)]">Average Rating</p>
          <p className="font-display text-4xl font-bold text-white">{average.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-[var(--tl-text-muted)]">Total Responses</p>
          <p className="font-display text-2xl font-bold text-[var(--tl-dell-blue-light)]">{total}</p>
        </div>
      </div>
      <div className="space-y-2">
        {byRating.map((b) => (
          <div key={b.rating} className="flex items-center gap-3">
            <span className="w-16 text-sm text-[var(--tl-text-muted)]">{b.rating} ★</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--tl-bg-elevated)]">
              <div
                className="h-full rounded-full bg-[var(--tl-dell-blue)]"
                style={{ width: `${(b.count / max) * 100}%` }}
              />
            </div>
            <span className="w-10 text-right text-sm font-bold text-white">{b.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CaptureProps {
  onSubmit: (rating: number, comment: string) => void;
}

export function HumanFeedbackCapture({ onSubmit }: CaptureProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="text-center text-sm text-[var(--tl-success)]">Thank you — feedback recorded.</p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--tl-text-secondary)]">
        Rate this decision experience (required after every decision):
      </p>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRating(r)}
            className={`rounded-lg p-2 transition ${
              rating >= r ? "text-[var(--tl-warning)]" : "text-[var(--tl-text-muted)]"
            }`}
          >
            <Star className={`h-8 w-8 ${rating >= r ? "fill-current" : ""}`} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Optional feedback comments..."
        className="tl-input w-full"
      />
      <button
        type="button"
        disabled={rating === 0}
        onClick={() => {
          onSubmit(rating, comment);
          setSubmitted(true);
        }}
        className="tl-btn-primary w-full disabled:opacity-40"
      >
        Submit Feedback
      </button>
    </div>
  );
}
