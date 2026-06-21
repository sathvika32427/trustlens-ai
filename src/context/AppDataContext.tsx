import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildIndexes,
  computeFeedbackAnalytics,
  computeOrgMetrics,
  computeOutcomeStats,
  loadAllDatasets,
} from "../lib/dataLoader";
import {
  AuditRecord,
  DecisionType,
  FeedbackSubmission,
  RecommendationRow,
  Role,
  TrustLensDatasets,
} from "../types/datasets";
import { getReviewerName } from "../roleConfig";

function buildInitialAuditRecords(data: TrustLensDatasets): AuditRecord[] {
  const outcomeMap = new Map(data.outcomes.map((o) => [o.recommendation_id, o]));
  return data.recommendations
    .filter((r) => r.status !== "Pending")
    .slice(0, 40)
    .map((r, i) => {
      const outcome = outcomeMap.get(r.recommendation_id);
      const decision =
        r.status === "Approved" ? "Approved" : r.status === "Overridden" ? "Overridden" : "Escalated";
      return {
        id: `AUD-${9000 + i}`,
        recommendation_id: r.recommendation_id,
        device_id: r.device_id,
        device_name: r.device_name,
        action: r.action,
        ai_reasoning: r.reasoning,
        severity: r.severity,
        confidence: r.confidence,
        reviewer: i % 2 === 0 ? "Alex Morgan" : "Priya Sharma",
        reviewer_role: i % 2 === 0 ? Role.IT_ADMIN : Role.SECURITY_ANALYST,
        decision: decision as DecisionType,
        notes: outcome?.outcome_description ?? `Recorded decision for ${r.recommendation_id}`,
        outcome: outcome?.outcome_description ?? "Recorded from outcomes.csv",
        timestamp: r.timestamp,
      };
    });
}

interface AppDataContextValue {
  loading: boolean;
  error: string | null;
  data: TrustLensDatasets | null;
  indexes: ReturnType<typeof buildIndexes> | null;
  recommendations: RecommendationRow[];
  auditRecords: AuditRecord[];
  liveFeedback: FeedbackSubmission[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  updateRecommendationStatus: (
    id: string,
    status: RecommendationRow["status"],
    audit: AuditRecord,
  ) => void;
  addFeedback: (fb: FeedbackSubmission) => void;
  orgMetrics: ReturnType<typeof computeOrgMetrics> | null;
  feedbackAnalytics: ReturnType<typeof computeFeedbackAnalytics> | null;
  outcomeStats: ReturnType<typeof computeOutcomeStats> | null;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TrustLensDatasets | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationRow[]>([]);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [liveFeedback, setLiveFeedback] = useState<FeedbackSubmission[]>([]);
  const [selectedId, setSelectedId] = useState("REC-0001");

  useEffect(() => {
    loadAllDatasets()
      .then((datasets) => {
        setData(datasets);
        setRecommendations(datasets.recommendations);
        setAuditRecords(buildInitialAuditRecords(datasets));
        setSelectedId(datasets.recommendations[0]?.recommendation_id ?? "REC-0001");
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load datasets");
        setLoading(false);
      });
  }, []);

  const indexes = useMemo(() => (data ? buildIndexes(data) : null), [data]);

  const updateRecommendationStatus = useCallback(
    (id: string, status: RecommendationRow["status"], audit: AuditRecord) => {
      setRecommendations((prev) =>
        prev.map((r) => (r.recommendation_id === id ? { ...r, status } : r)),
      );
      setAuditRecords((prev) => [audit, ...prev]);
    },
    [],
  );

  const addFeedback = useCallback((fb: FeedbackSubmission) => {
    setLiveFeedback((prev) => [fb, ...prev]);
  }, []);

  const orgMetrics = useMemo(
    () => (data ? computeOrgMetrics({ ...data, recommendations }) : null),
    [data, recommendations],
  );

  const feedbackAnalytics = useMemo(() => {
    if (!data) return null;
    return computeFeedbackAnalytics({
      ...data,
      feedback: [
        ...data.feedback,
        ...liveFeedback.map((f) => ({
          recommendation_id: f.recommendation_id,
          device_id: "",
          case_id: "",
          decision_id: f.decision_id,
          rating: f.rating,
          feedback_comment: f.feedback_comment,
          submitted_at: f.submitted_at,
          reviewer: f.reviewer,
        })),
      ],
    });
  }, [data, liveFeedback]);

  const outcomeStats = useMemo(() => (data ? computeOutcomeStats(data) : null), [data]);

  const value: AppDataContextValue = {
    loading,
    error,
    data,
    indexes,
    recommendations,
    auditRecords,
    liveFeedback,
    selectedId,
    setSelectedId,
    updateRecommendationStatus,
    addFeedback,
    orgMetrics,
    feedbackAnalytics,
    outcomeStats,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

export function createAuditRecord(
  rec: RecommendationRow,
  role: Role,
  decision: DecisionType,
  notes?: string,
  overrideReason?: string,
): AuditRecord {
  const outcomeMap: Record<DecisionType, string> = {
    Approved: "Action executed — threat response initiated",
    Overridden: "No threat detected — AI recommendation rejected",
    Escalated: "Under senior review — pending manual verification",
  };
  return {
    id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
    recommendation_id: rec.recommendation_id,
    device_id: rec.device_id,
    device_name: rec.device_name,
    action: rec.action,
    ai_reasoning: rec.reasoning,
    severity: rec.severity,
    confidence: rec.confidence,
    reviewer: getReviewerName(role),
    reviewer_role: role,
    decision,
    override_reason: overrideReason,
    notes:
      notes ??
      (decision === "Approved"
        ? `Approved: ${rec.action}`
        : decision === "Escalated"
          ? "Escalated for manual review."
          : "Recommendation overridden."),
    outcome: outcomeMap[decision],
    timestamp: new Date().toLocaleString(),
  };
}
