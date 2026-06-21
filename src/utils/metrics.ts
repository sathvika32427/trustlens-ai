import {
  AIRecommendation,
  AuditRecord,
  DecisionMetrics,
  Role,
  Severity,
  TrustMetrics,
} from "../types";
import { CURRENT_EMPLOYEE } from "../roleConfig";
import { getDeviceById } from "../data";

export function computeDecisionMetrics(
  recommendations: AIRecommendation[],
  auditRecords: AuditRecord[],
): DecisionMetrics {
  const approved =
    recommendations.filter((r) => r.status === "Approved").length +
    auditRecords.filter((r) => r.decision === "Approved").length;
  const overridden =
    recommendations.filter((r) => r.status === "Overridden").length +
    auditRecords.filter((r) => r.decision === "Overridden").length;
  const escalated =
    recommendations.filter((r) => r.status === "Escalated").length +
    auditRecords.filter((r) => r.decision === "Escalated").length;
  const pending = recommendations.filter((r) => r.status === "Pending").length;
  const total = approved + overridden + escalated + pending;

  return {
    total,
    approved,
    overridden,
    escalated,
    pending,
    trends: {
      approved: 8,
      overridden: -3,
      escalated: 5,
      pending: -12,
    },
  };
}

export function computeTrustMetrics(
  recommendations: AIRecommendation[],
  auditRecords: AuditRecord[],
): TrustMetrics {
  const metrics = computeDecisionMetrics(recommendations, auditRecords);
  const decided = metrics.approved + metrics.overridden + metrics.escalated;

  const approvalRate = decided ? Math.round((metrics.approved / decided) * 100) : 0;
  const overrideRate = decided ? Math.round((metrics.overridden / decided) * 100) : 0;
  const escalationRate = decided ? Math.round((metrics.escalated / decided) * 100) : 0;

  const falsePositiveRate = 5;
  const successfulOutcomes = Math.round(
    ((metrics.approved + auditRecords.filter((r) => r.outcome.includes("No threat")).length) /
      Math.max(decided, 1)) *
      100,
  );

  const trustIndex = Math.round(
    approvalRate * 0.35 +
      (100 - overrideRate) * 0.25 +
      (100 - escalationRate) * 0.15 +
      successfulOutcomes * 0.15 +
      (100 - falsePositiveRate) * 0.1,
  );

  return {
    approvalRate,
    overrideRate,
    escalationRate,
    successfulOutcomes,
    falsePositiveRate,
    trustIndex: Math.min(trustIndex, 100),
  };
}

export function filterRecommendationsForRole(
  role: Role,
  recommendations: AIRecommendation[],
): AIRecommendation[] {
  switch (role) {
    case Role.SECURITY_ANALYST:
      return recommendations.filter(
        (r) =>
          r.severity === Severity.CRITICAL ||
          r.severity === Severity.HIGH ||
          r.action.includes("Escalate") ||
          r.status === "Escalated",
      );
    case Role.EMPLOYEE:
      return recommendations.filter((r) => {
        const device = getDeviceById(r.deviceId);
        return device?.owner === CURRENT_EMPLOYEE;
      });
    default:
      return recommendations;
  }
}

export function filterAuditRecordsForRole(
  role: Role,
  auditRecords: AuditRecord[],
): AuditRecord[] {
  switch (role) {
    case Role.SECURITY_ANALYST:
      return auditRecords.filter(
        (r) => r.severity === Severity.CRITICAL || r.severity === Severity.HIGH,
      );
    case Role.EMPLOYEE:
      return auditRecords.filter((r) => {
        const device = getDeviceById(r.deviceId);
        return device?.owner === CURRENT_EMPLOYEE;
      });
    default:
      return auditRecords;
  }
}
