import {
  LayoutDashboard,
  Search,
  History,
  ShieldCheck,
  BarChart3,
  ClipboardCheck,
  Bell,
  LucideIcon,
} from "lucide-react";
import { Role } from "./types";

export const CURRENT_EMPLOYEE = "Sarah Jenkins";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface RoleConfig {
  shortLabel: string;
  description: string;
  navItems: NavItem[];
  canDecide: boolean;
  canAccessGovernance: boolean;
  canAccessTrustAnalytics: boolean;
  canAccessAuditCenter: boolean;
  canAccessOrgData: boolean;
}

export const roleConfigs: Record<Role, RoleConfig> = {
  [Role.IT_ADMIN]: {
    shortLabel: "IT Admin",
    description:
      "Organization-wide governance — approve, override, audit, and manage compliance.",
    navItems: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "explorer", label: "Recommendation Explorer", icon: Search },
      { id: "trust", label: "Trust Analytics", icon: BarChart3 },
      { id: "audit-center", label: "Audit Center", icon: ClipboardCheck },
      { id: "audit", label: "Activity Log", icon: History },
    ],
    canDecide: true,
    canAccessGovernance: true,
    canAccessTrustAnalytics: true,
    canAccessAuditCenter: true,
    canAccessOrgData: true,
  },
  [Role.SECURITY_ANALYST]: {
    shortLabel: "Security Analyst",
    description:
      "Threat investigation — evidence timelines, risk analysis, and incident response.",
    navItems: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "explorer", label: "Recommendation Explorer", icon: Search },
      { id: "audit", label: "Activity Log", icon: History },
    ],
    canDecide: true,
    canAccessGovernance: false,
    canAccessTrustAnalytics: false,
    canAccessAuditCenter: false,
    canAccessOrgData: true,
  },
  [Role.EMPLOYEE]: {
    shortLabel: "Employee",
    description: "Personal device status, your recommendations, and notifications only.",
    navItems: [
      { id: "dashboard", label: "My Dashboard", icon: LayoutDashboard },
      { id: "explorer", label: "My Recommendation", icon: Search },
      { id: "notifications", label: "Notifications", icon: Bell },
    ],
    canDecide: false,
    canAccessGovernance: false,
    canAccessTrustAnalytics: false,
    canAccessAuditCenter: false,
    canAccessOrgData: false,
  },
};

export function getRoleConfig(role: Role): RoleConfig {
  return roleConfigs[role];
}

export function getReviewerName(role: Role): string {
  switch (role) {
    case Role.IT_ADMIN:
      return "Alex Morgan";
    case Role.SECURITY_ANALYST:
      return "Priya Sharma";
    default:
      return CURRENT_EMPLOYEE;
  }
}
