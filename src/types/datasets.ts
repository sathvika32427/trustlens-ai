export type RecommendationStatus = "Pending" | "Approved" | "Overridden" | "Escalated";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type AgingStatus = "Healthy" | "Warning" | "Critical";
export type OutcomeType =
  | "Recommendation Correct"
  | "Recommendation Incorrect"
  | "False Positive"
  | "False Negative"
  | "";

export interface RecommendationRow {
  recommendation_id: string;
  device_id: string;
  case_id: string;
  incident_id: string;
  action: string;
  summary_line: string;
  severity: string;
  risk_level: RiskLevel;
  confidence: string;
  confidence_score: number;
  reasoning: string;
  data_source_attribution: string;
  status: RecommendationStatus;
  timestamp: string;
  device_name: string;
  device_type: string;
  device_owner: string;
  department: string;
  os: string;
  last_seen: string;
}

export interface TrustLedgerRow {
  recommendation_id: string;
  device_id: string;
  case_id: string;
  past_similar_cases: number;
  correct_recommendations: number;
  incorrect_recommendations: number;
  historical_reliability_score: number;
  known_weaknesses: string;
}

export interface ImpactPreviewRow {
  recommendation_id: string;
  device_id: string;
  case_id: string;
  if_approved_threat_contained: string;
  if_approved_device_isolated: string;
  if_approved_user_impact: string;
  if_dismissed_malware_spread: string;
  if_dismissed_security_risk: string;
  if_dismissed_business_impact: string;
}

export interface AdaptiveApprovalRow {
  recommendation_id: string;
  device_id: string;
  case_id: string;
  risk_level: RiskLevel;
  requires_evidence_review: boolean;
  requires_impact_review: boolean;
  requires_written_justification: boolean;
}

export interface CounterConsiderationRow {
  recommendation_id: string;
  device_id: string;
  case_id: string;
  counter_consideration: string;
}

export interface OutcomeRow {
  recommendation_id: string;
  device_id: string;
  case_id: string;
  outcome_type: OutcomeType;
  outcome_description: string;
  resolved_at: string;
}

export interface IncidentCardRow {
  incident_id: string;
  recommendation_id: string;
  device_id: string;
  case_id: string;
  incident_title: string;
  cause: string;
  safeguard_failure: string;
  corrective_action: string;
  created_at: string;
}

export interface TrustTimelineRow {
  month: string;
  month_index: number;
  trust_score: number;
  approval_rate: number;
  override_rate: number;
}

export interface SimilarCaseRow {
  recommendation_id: string;
  device_id: string;
  similar_case_id: string;
  outcome: string;
  resolution: string;
}

export interface EvidenceWeightRow {
  recommendation_id: string;
  device_id: string;
  case_id: string;
  evidence_type: string;
  weight_percentage: number;
  description: string;
}

export interface TrustBreakdownRow {
  recommendation_id: string;
  device_id: string;
  case_id: string;
  accuracy: number;
  approval_rate: number;
  outcome_success: number;
  false_positive_rate: number;
  trust_index: number;
  weight_accuracy: number;
  weight_approval_rate: number;
  weight_outcome_success: number;
  weight_false_positive_inverse: number;
}

export interface FeedbackRow {
  recommendation_id: string;
  device_id: string;
  case_id: string;
  decision_id: string;
  rating: number;
  feedback_comment: string;
  submitted_at: string;
  reviewer: string;
}

export interface RecommendationAgingRow {
  recommendation_id: string;
  device_id: string;
  case_id: string;
  created_at: string;
  age_days: number;
  aging_status: AgingStatus;
}

export interface AIHealthRow {
  date: string;
  recommendations_today: number;
  accuracy: number;
  false_positives: number;
  incidents: number;
  trust_index: number;
}

export interface BusinessImpactRow {
  recommendation_id: string;
  device_id: string;
  case_id: string;
  affected_users: number;
  potential_downtime_hours: number;
  risk_reduction_pct: number;
  impact_level: string;
}

export interface DatasetManifest {
  generated_at: string;
  files: string[];
  relationship_keys: string[];
  current_employee: string;
  current_employee_device: string;
}

export interface RecommendationBundle {
  recommendation: RecommendationRow;
  trustLedger?: TrustLedgerRow;
  impactPreview?: ImpactPreviewRow;
  adaptiveApproval?: AdaptiveApprovalRow;
  counterConsideration?: CounterConsiderationRow;
  outcome?: OutcomeRow;
  incidents: IncidentCardRow[];
  similarCases: SimilarCaseRow[];
  evidenceWeights: EvidenceWeightRow[];
  trustBreakdown?: TrustBreakdownRow;
  feedback: FeedbackRow[];
  aging?: RecommendationAgingRow;
  businessImpact?: BusinessImpactRow;
}

export interface TrustLensDatasets {
  manifest: DatasetManifest;
  recommendations: RecommendationRow[];
  trustLedger: TrustLedgerRow[];
  impactPreview: ImpactPreviewRow[];
  adaptiveApproval: AdaptiveApprovalRow[];
  counterConsiderations: CounterConsiderationRow[];
  outcomes: OutcomeRow[];
  incidentCards: IncidentCardRow[];
  trustTimeline: TrustTimelineRow[];
  similarCases: SimilarCaseRow[];
  evidenceWeights: EvidenceWeightRow[];
  trustBreakdown: TrustBreakdownRow[];
  feedback: FeedbackRow[];
  recommendationAging: RecommendationAgingRow[];
  aiHealth: AIHealthRow[];
  businessImpact: BusinessImpactRow[];
}

export type DecisionType = "Approved" | "Overridden" | "Escalated";

export interface AuditRecord {
  id: string;
  recommendation_id: string;
  device_id: string;
  device_name: string;
  action: string;
  ai_reasoning: string;
  severity: string;
  confidence: string;
  reviewer: string;
  reviewer_role: string;
  decision: DecisionType;
  override_reason?: string;
  notes: string;
  outcome: string;
  timestamp: string;
}

export interface FeedbackSubmission {
  recommendation_id: string;
  decision_id: string;
  rating: number;
  feedback_comment: string;
  reviewer: string;
  submitted_at: string;
}

export interface ConfirmationState {
  decision: DecisionType;
  recommendation_id: string;
  notes?: string;
}

export enum Role {
  IT_ADMIN = "IT Administrator",
  SECURITY_ANALYST = "Security Analyst",
  EMPLOYEE = "Employee",
}
