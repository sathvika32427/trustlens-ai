import { Role, RecommendationRow, TrustLensDatasets } from "../types/datasets";
import { filterRecommendationsByRole } from "./dataLoader";
import { CURRENT_EMPLOYEE } from "../roleConfig";

export type NotificationType = "pending" | "escalated" | "critical" | "incident" | "feedback" | "info";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  type: NotificationType;
  recommendation_id?: string;
}

export function buildNotifications(
  data: TrustLensDatasets,
  recommendations: RecommendationRow[],
  role: Role,
): AppNotification[] {
  const employee = data.manifest.current_employee ?? CURRENT_EMPLOYEE;
  const scoped = filterRecommendationsByRole(recommendations, role, employee);
  const items: AppNotification[] = [];

  if (role === Role.EMPLOYEE) {
    for (const rec of scoped) {
      if (rec.status === "Pending") {
        items.push({
          id: `N-P-${rec.recommendation_id}`,
          title: "Action needed on your device",
          message: `${rec.action} recommended for ${rec.device_name}. IT may contact you.`,
          timestamp: rec.timestamp,
          unread: true,
          type: "pending",
          recommendation_id: rec.recommendation_id,
        });
      }
      if (rec.status === "Escalated") {
        items.push({
          id: `N-E-${rec.recommendation_id}`,
          title: "Case under review",
          message: rec.summary_line,
          timestamp: rec.timestamp,
          unread: true,
          type: "escalated",
          recommendation_id: rec.recommendation_id,
        });
      }
    }
    return items.sort((a, b) => (a.unread === b.unread ? 0 : a.unread ? -1 : 1));
  }

  const pending = scoped.filter((r) => r.status === "Pending");
  const critical = pending.filter((r) => r.severity === "Critical").slice(0, 5);
  const escalated = scoped.filter((r) => r.status === "Escalated").slice(0, 5);

  for (const rec of critical) {
    items.push({
      id: `C-${rec.recommendation_id}`,
      title: "Critical recommendation pending",
      message: `${rec.recommendation_id}: ${rec.action} on ${rec.device_name}`,
      timestamp: rec.timestamp,
      unread: true,
      type: "critical",
      recommendation_id: rec.recommendation_id,
    });
  }

  for (const rec of escalated) {
    items.push({
      id: `E-${rec.recommendation_id}`,
      title: "Escalated case requires review",
      message: rec.summary_line,
      timestamp: rec.timestamp,
      unread: true,
      type: "escalated",
      recommendation_id: rec.recommendation_id,
    });
  }

  if (role === Role.IT_ADMIN) {
    const recentIncidents = data.incidentCards.slice(0, 3);
    for (const inc of recentIncidents) {
      items.push({
        id: inc.incident_id,
        title: `AI Incident: ${inc.incident_title}`,
        message: inc.corrective_action,
        timestamp: inc.created_at,
        unread: true,
        type: "incident",
        recommendation_id: inc.recommendation_id,
      });
    }

    const lowFeedback = data.feedback.filter((f) => f.rating <= 2).slice(0, 3);
    for (const f of lowFeedback) {
      items.push({
        id: f.decision_id,
        title: "Low decision satisfaction",
        message: f.feedback_comment,
        timestamp: f.submitted_at,
        unread: false,
        type: "feedback",
        recommendation_id: f.recommendation_id,
      });
    }
  }

  if (role === Role.SECURITY_ANALYST && pending.length > 0) {
    items.push({
      id: "ANALYST-QUEUE",
      title: `${pending.length} investigations in queue`,
      message: "High and critical severity cases awaiting threat analysis.",
      timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
      unread: true,
      type: "info",
    });
  }

  return items.sort((a, b) => (a.unread === b.unread ? 0 : a.unread ? -1 : 1));
}

export function countUnread(notifications: AppNotification[]): number {
  return notifications.filter((n) => n.unread).length;
}
