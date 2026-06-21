import Papa from "papaparse";
import {
  AdaptiveApprovalRow,
  AIHealthRow,
  BusinessImpactRow,
  CounterConsiderationRow,
  DatasetManifest,
  EvidenceWeightRow,
  FeedbackRow,
  ImpactPreviewRow,
  IncidentCardRow,
  OutcomeRow,
  RecommendationAgingRow,
  RecommendationBundle,
  RecommendationRow,
  SimilarCaseRow,
  TrustBreakdownRow,
  TrustLedgerRow,
  TrustLensDatasets,
  TrustTimelineRow,
} from "../types/datasets";

const DATA_BASE = "/data";

function parseBool(v: string | boolean): boolean {
  if (typeof v === "boolean") return v;
  return v === "True" || v === "true" || v === "1";
}

async function loadCsv<T>(file: string): Promise<T[]> {
  const res = await fetch(`${DATA_BASE}/${file}.csv`);
  if (!res.ok) throw new Error(`Failed to load ${file}.csv`);
  const text = await res.text();
  const parsed = Papa.parse<T>(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
  if (parsed.errors.length) {
    console.warn(`CSV parse warnings for ${file}:`, parsed.errors.slice(0, 3));
  }
  return parsed.data;
}

function normalizeRecommendations(rows: RecommendationRow[]): RecommendationRow[] {
  return rows.map((r) => ({
    ...r,
    confidence_score: Number(r.confidence_score),
  }));
}

function normalizeAdaptive(rows: AdaptiveApprovalRow[]): AdaptiveApprovalRow[] {
  return rows.map((r) => ({
    ...r,
    requires_evidence_review: parseBool(r.requires_evidence_review as unknown as string),
    requires_impact_review: parseBool(r.requires_impact_review as unknown as string),
    requires_written_justification: parseBool(
      r.requires_written_justification as unknown as string,
    ),
  }));
}

function normalizeTrustLedger(rows: TrustLedgerRow[]): TrustLedgerRow[] {
  return rows.map((r) => ({
    ...r,
    past_similar_cases: Number(r.past_similar_cases),
    correct_recommendations: Number(r.correct_recommendations),
    incorrect_recommendations: Number(r.incorrect_recommendations),
    historical_reliability_score: Number(r.historical_reliability_score),
  }));
}

function normalizeAging(rows: RecommendationAgingRow[]): RecommendationAgingRow[] {
  return rows.map((r) => ({ ...r, age_days: Number(r.age_days) }));
}

function normalizeEvidence(rows: EvidenceWeightRow[]): EvidenceWeightRow[] {
  return rows.map((r) => ({ ...r, weight_percentage: Number(r.weight_percentage) }));
}

function normalizeFeedback(rows: FeedbackRow[]): FeedbackRow[] {
  return rows.map((r) => ({ ...r, rating: Number(r.rating) }));
}

function normalizeBusiness(rows: BusinessImpactRow[]): BusinessImpactRow[] {
  return rows.map((r) => ({
    ...r,
    affected_users: Number(r.affected_users),
    potential_downtime_hours: Number(r.potential_downtime_hours),
    risk_reduction_pct: Number(r.risk_reduction_pct),
  }));
}

function normalizeHealth(rows: AIHealthRow[]): AIHealthRow[] {
  return rows.map((r) => ({
    ...r,
    recommendations_today: Number(r.recommendations_today),
    accuracy: Number(r.accuracy),
    false_positives: Number(r.false_positives),
    incidents: Number(r.incidents),
    trust_index: Number(r.trust_index),
  }));
}

function normalizeTimeline(rows: TrustTimelineRow[]): TrustTimelineRow[] {
  return rows.map((r) => ({
    ...r,
    month_index: Number(r.month_index),
    trust_score: Number(r.trust_score),
    approval_rate: Number(r.approval_rate),
    override_rate: Number(r.override_rate),
  }));
}

function normalizeBreakdown(rows: TrustBreakdownRow[]): TrustBreakdownRow[] {
  return rows.map((r) => ({
    ...r,
    accuracy: Number(r.accuracy),
    approval_rate: Number(r.approval_rate),
    outcome_success: Number(r.outcome_success),
    false_positive_rate: Number(r.false_positive_rate),
    trust_index: Number(r.trust_index),
    weight_accuracy: Number(r.weight_accuracy),
    weight_approval_rate: Number(r.weight_approval_rate),
    weight_outcome_success: Number(r.weight_outcome_success),
    weight_false_positive_inverse: Number(r.weight_false_positive_inverse),
  }));
}

export async function loadAllDatasets(): Promise<TrustLensDatasets> {
  const manifestRes = await fetch(`${DATA_BASE}/manifest.json`);
  const manifest = (await manifestRes.json()) as DatasetManifest;

  const [
    recommendations,
    trustLedger,
    impactPreview,
    adaptiveApproval,
    counterConsiderations,
    outcomes,
    incidentCards,
    trustTimeline,
    similarCases,
    evidenceWeights,
    trustBreakdown,
    feedback,
    recommendationAging,
    aiHealth,
    businessImpact,
  ] = await Promise.all([
    loadCsv<RecommendationRow>("recommendations"),
    loadCsv<TrustLedgerRow>("trust_ledger"),
    loadCsv<ImpactPreviewRow>("impact_preview"),
    loadCsv<AdaptiveApprovalRow>("adaptive_approval"),
    loadCsv<CounterConsiderationRow>("counter_considerations"),
    loadCsv<OutcomeRow>("outcomes"),
    loadCsv<IncidentCardRow>("incident_cards"),
    loadCsv<TrustTimelineRow>("trust_timeline"),
    loadCsv<SimilarCaseRow>("similar_cases"),
    loadCsv<EvidenceWeightRow>("evidence_weights"),
    loadCsv<TrustBreakdownRow>("trust_breakdown"),
    loadCsv<FeedbackRow>("feedback"),
    loadCsv<RecommendationAgingRow>("recommendation_aging"),
    loadCsv<AIHealthRow>("ai_health"),
    loadCsv<BusinessImpactRow>("business_impact"),
  ]);

  return {
    manifest,
    recommendations: normalizeRecommendations(recommendations),
    trustLedger: normalizeTrustLedger(trustLedger),
    impactPreview,
    adaptiveApproval: normalizeAdaptive(adaptiveApproval),
    counterConsiderations,
    outcomes,
    incidentCards,
    trustTimeline: normalizeTimeline(trustTimeline),
    similarCases,
    evidenceWeights: normalizeEvidence(evidenceWeights),
    trustBreakdown: normalizeBreakdown(trustBreakdown),
    feedback: normalizeFeedback(feedback),
    recommendationAging: normalizeAging(recommendationAging),
    aiHealth: normalizeHealth(aiHealth),
    businessImpact: normalizeBusiness(businessImpact),
  };
}

export function buildIndexes(data: TrustLensDatasets) {
  const byRecId = <T extends { recommendation_id: string }>(rows: T[]) => {
    const map = new Map<string, T>();
    for (const row of rows) {
      if (!map.has(row.recommendation_id)) map.set(row.recommendation_id, row);
    }
    return map;
  };

  const groupByRecId = <T extends { recommendation_id: string }>(rows: T[]) => {
    const map = new Map<string, T[]>();
    for (const row of rows) {
      const list = map.get(row.recommendation_id) ?? [];
      list.push(row);
      map.set(row.recommendation_id, list);
    }
    return map;
  };

  return {
    trustLedger: byRecId(data.trustLedger),
    impactPreview: byRecId(data.impactPreview),
    adaptiveApproval: byRecId(data.adaptiveApproval),
    counterConsiderations: byRecId(data.counterConsiderations),
    outcomes: byRecId(data.outcomes),
    incidents: groupByRecId(data.incidentCards),
    similarCases: groupByRecId(data.similarCases),
    evidenceWeights: groupByRecId(data.evidenceWeights),
    trustBreakdown: byRecId(data.trustBreakdown),
    feedback: groupByRecId(data.feedback),
    aging: byRecId(data.recommendationAging),
    businessImpact: byRecId(data.businessImpact),
  };
}

export function getRecommendationBundle(
  data: TrustLensDatasets,
  indexes: ReturnType<typeof buildIndexes>,
  recommendationId: string,
): RecommendationBundle | null {
  const recommendation = data.recommendations.find((r) => r.recommendation_id === recommendationId);
  if (!recommendation) return null;

  return {
    recommendation,
    trustLedger: indexes.trustLedger.get(recommendationId),
    impactPreview: indexes.impactPreview.get(recommendationId),
    adaptiveApproval: indexes.adaptiveApproval.get(recommendationId),
    counterConsideration: indexes.counterConsiderations.get(recommendationId),
    outcome: indexes.outcomes.get(recommendationId),
    incidents: indexes.incidents.get(recommendationId) ?? [],
    similarCases: (indexes.similarCases.get(recommendationId) ?? []).slice(0, 8),
    evidenceWeights: indexes.evidenceWeights.get(recommendationId) ?? [],
    trustBreakdown: indexes.trustBreakdown.get(recommendationId),
    feedback: indexes.feedback.get(recommendationId) ?? [],
    aging: indexes.aging.get(recommendationId),
    businessImpact: indexes.businessImpact.get(recommendationId),
  };
}

export function computeOrgMetrics(data: TrustLensDatasets) {
  const recs = data.recommendations;
  const approved = recs.filter((r) => r.status === "Approved").length;
  const overridden = recs.filter((r) => r.status === "Overridden").length;
  const escalated = recs.filter((r) => r.status === "Escalated").length;
  const pending = recs.filter((r) => r.status === "Pending").length;
  const total = recs.length;

  const outcomes = data.outcomes.filter((o) => o.outcome_type);
  const falsePositives = outcomes.filter((o) => o.outcome_type === "False Positive").length;
  const correct = outcomes.filter((o) => o.outcome_type === "Recommendation Correct").length;

  const latestHealth = data.aiHealth[data.aiHealth.length - 1];
  const latestTimeline = data.trustTimeline[data.trustTimeline.length - 1];

  return {
    total,
    approved,
    overridden,
    escalated,
    pending,
    trends: { approved: 8, overridden: -3, escalated: 5, pending: -12 },
    falsePositiveRate: outcomes.length
      ? Math.round((falsePositives / outcomes.length) * 100)
      : 0,
    outcomeSuccessRate: outcomes.length ? Math.round((correct / outcomes.length) * 100) : 0,
    trustIndex: latestHealth?.trust_index ?? latestTimeline?.trust_score ?? 0,
    avgFeedbackRating:
      data.feedback.reduce((s, f) => s + f.rating, 0) / Math.max(data.feedback.length, 1),
  };
}

export function computeFeedbackAnalytics(data: TrustLensDatasets) {
  const byRating = [1, 2, 3, 4, 5].map((r) => ({
    rating: r,
    count: data.feedback.filter((f) => f.rating === r).length,
  }));
  const avg = data.feedback.reduce((s, f) => s + f.rating, 0) / Math.max(data.feedback.length, 1);
  return { byRating, average: avg, total: data.feedback.length };
}

export function computeOutcomeStats(data: TrustLensDatasets) {
  const withOutcome = data.outcomes.filter((o) => o.outcome_type);
  const counts: Record<string, number> = {};
  for (const o of withOutcome) {
    counts[o.outcome_type] = (counts[o.outcome_type] ?? 0) + 1;
  }
  return counts;
}

export function filterRecommendationsByRole(
  recs: RecommendationRow[],
  role: string,
  employeeName: string,
) {
  if (role === "Employee") {
    return recs.filter((r) => r.device_owner === employeeName);
  }
  if (role === "Security Analyst") {
    return recs.filter(
      (r) => r.severity === "Critical" || r.severity === "High" || r.status === "Escalated",
    );
  }
  return recs;
}
