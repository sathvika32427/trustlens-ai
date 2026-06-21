import {
  LayoutDashboard,
  Search,
  History,
  ShieldCheck,
  Shield,
  BarChart3,
  ClipboardCheck,
  Bell,
  Activity,
  LucideIcon,
} from "lucide-react";
import { Role } from "./types/datasets";

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
  canAccessAIHealth: boolean;
  canAccessOrgData: boolean;
}

export const roleConfigs: Record<Role, RoleConfig> = {
  [Role.IT_ADMIN]: {
    shortLabel: "IT Admin",
    description: "Governance, audit, trust analytics, AI health, and compliance.",
    navItems: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "explorer", label: "Recommendation Explorer", icon: Search },
      { id: "trust", label: "Trust Analytics", icon: BarChart3 },
      { id: "ai-health", label: "AI Health", icon: Activity },
      { id: "audit-center", label: "Audit Center", icon: ClipboardCheck },
      { id: "audit", label: "Activity Log", icon: History },
      { id: "notifications", label: "Notifications", icon: Bell },
    ],
    canDecide: true,
    canAccessGovernance: true,
    canAccessTrustAnalytics: true,
    canAccessAuditCenter: true,
    canAccessAIHealth: true,
    canAccessOrgData: true,
  },
  [Role.SECURITY_ANALYST]: {
    shortLabel: "Security Analyst",
    description: "Threat analysis, evidence, similar cases, and outcome learning.",
    navItems: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "explorer", label: "Recommendation Explorer", icon: Search },
      { id: "audit", label: "Activity Log", icon: History },
      { id: "notifications", label: "Notifications", icon: Bell },
    ],
    canDecide: true,
    canAccessGovernance: false,
    canAccessTrustAnalytics: false,
    canAccessAuditCenter: false,
    canAccessAIHealth: false,
    canAccessOrgData: true,
  },
  [Role.EMPLOYEE]: {
    shortLabel: "Employee",
    description: "Personal device status, recommendations, and notifications.",
    navItems: [
      { id: "dashboard", label: "My Dashboard", icon: LayoutDashboard },
      { id: "explorer", label: "My Recommendation", icon: Search },
      { id: "notifications", label: "Notifications", icon: Bell },
    ],
    canDecide: false,
    canAccessGovernance: false,
    canAccessTrustAnalytics: false,
    canAccessAuditCenter: false,
    canAccessAIHealth: false,
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

export const personaIcons: Record<Role, LucideIcon> = {
  [Role.IT_ADMIN]: ShieldCheck,
  [Role.SECURITY_ANALYST]: Shield,
  [Role.EMPLOYEE]: Bell,
};
