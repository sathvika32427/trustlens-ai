export enum Role {
  IT_ADMIN = "IT Administrator",
  SECURITY_ANALYST = "Security Analyst",
  EMPLOYEE = "Employee",
}

export enum ConfidenceLevel {
  HIGH = "High Confidence",
  MODERATE = "Moderate Confidence",
  REVIEW_RECOMMENDED = "Review Recommended",
  LOW = "Low Confidence",
}

export enum Severity {
  CRITICAL = "Critical",
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}

export enum DeviceStatus {
  HIGH_RISK = "High Risk",
  WARNING = "Warning",
  SECURE = "Secure",
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: string;
  owner: string;
  department: string;
  status: DeviceStatus;
  os: string;
  lastSeen: string;
}

export interface DetectedEvent {
  id: string;
  day: string;
  timestamp: string;
  title: string;
  description: string;
  severity: Severity;
}

export interface LimitationWarning {
  title: string;
  description: string;
}

export interface AlternativeOption {
  option: string;
  title: string;
  description: string;
  riskLevel: string;
  businessImpact: string;
  recommended: boolean;
  reasoning: string;
}

export interface AIRecommendation {
  id: string;
  deviceId: string;
  action: string;
  summaryLine: string;
  severity: Severity;
  confidence: ConfidenceLevel;
  confidenceReason: string;
  reasoning: string;
  dataSourceAttribution: string;
  detectedEvents: DetectedEvent[];
  limitations: LimitationWarning[];
  alternatives: AlternativeOption[];
  timestamp: string;
  status: "Pending" | "Approved" | "Overridden" | "Escalated";
}

export interface AuditRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  action: string;
  aiReasoning: string;
  severity: Severity;
  confidence: ConfidenceLevel;
  reviewer: string;
  reviewerRole: Role;
  decision: "Approved" | "Overridden" | "Escalated";
  overrideReason?: string;
  notes: string;
  outcome: string;
  timestamp: string;
}

export interface EmployeeNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "info" | "warning" | "action";
}

export type DecisionType = "Approved" | "Overridden" | "Escalated";

export interface ConfirmationState {
  decision: DecisionType;
  recommendation: AIRecommendation;
  notes?: string;
}

export interface DecisionMetrics {
  total: number;
  approved: number;
  overridden: number;
  escalated: number;
  pending: number;
  trends: {
    approved: number;
    overridden: number;
    escalated: number;
    pending: number;
  };
}

export interface TrustMetrics {
  approvalRate: number;
  overrideRate: number;
  escalationRate: number;
  successfulOutcomes: number;
  falsePositiveRate: number;
  trustIndex: number;
}
