import { useAppData } from "../context/AppDataContext";
import TrustTimelineChart from "./features/TrustTimelineChart";
import TrustBreakdownPanel from "./features/TrustBreakdownPanel";
import HumanFeedbackAnalytics from "./features/HumanFeedbackPanel";
import OutcomeLearningPanel from "./features/OutcomeLearningPanel";
import KpiSection from "./shared/KpiSection";
import DataReliabilityLimitationsPanel from "./features/DataReliabilityLimitationsPanel";

export default function TrustAnalytics() {
  const { data, orgMetrics, feedbackAnalytics, outcomeStats, selectedId, indexes } = useAppData();
  if (!data || !orgMetrics || !feedbackAnalytics) return null;

  const sampleBreakdown = indexes?.trustBreakdown.get(selectedId) ?? data.trustBreakdown[0];
  const aggregateBreakdown = {
    accuracy: data.trustBreakdown.reduce((s, t) => s + t.accuracy, 0) / data.trustBreakdown.length,
    approval_rate: data.trustBreakdown.reduce((s, t) => s + t.approval_rate, 0) / data.trustBreakdown.length,
    outcome_success: data.trustBreakdown.reduce((s, t) => s + t.outcome_success, 0) / data.trustBreakdown.length,
    false_positive_rate: data.trustBreakdown.reduce((s, t) => s + t.false_positive_rate, 0) / data.trustBreakdown.length,
    trust_index: orgMetrics.trustIndex,
    weight_accuracy: 0.30,
    weight_approval_rate: 0.25,
    weight_outcome_success: 0.25,
    weight_false_positive_inverse: 0.20,
    recommendation_id: "ORG",
    device_id: "",
    case_id: "",
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-[var(--tl-border)] bg-[var(--tl-bg-sidebar)] px-6 py-6">
        <h1 className="font-display text-3xl font-bold text-white">Trust Analytics</h1>
        <p className="mt-2 text-[var(--tl-text-secondary)]">
          Computed from trust_timeline.csv, trust_breakdown.csv, outcomes.csv, and feedback.csv
        </p>
      </div>
      <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 lg:px-8">
        <KpiSection metrics={orgMetrics} />
        <div className="grid gap-6 lg:grid-cols-2">
          <TrustTimelineChart data={data.trustTimeline} />
          <TrustBreakdownPanel breakdown={{ ...aggregateBreakdown, trust_index: orgMetrics.trustIndex }} />
        </div>
        <DataReliabilityLimitationsPanel dataSources={data.dataSources} limitations={data.limitations} />
        <TrustBreakdownPanel breakdown={sampleBreakdown} />
        <HumanFeedbackAnalytics
          average={feedbackAnalytics.average}
          total={feedbackAnalytics.total}
          byRating={feedbackAnalytics.byRating}
        />
        <OutcomeLearningPanel outcomeStats={outcomeStats ?? {}} />
      </div>
    </div>
  );
}

