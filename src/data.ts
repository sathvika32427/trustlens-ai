import {
  AIRecommendation,
  DeviceInfo,
  DeviceStatus,
  Severity,
  ConfidenceLevel,
  AuditRecord,
  Role,
  EmployeeNotification,
} from "./types";

export const mockDevices: DeviceInfo[] = [
  {
    id: "DEV-143",
    name: "DEV-143-CORP-LTP",
    type: "Dell Latitude 5440",
    owner: "Sarah Jenkins",
    department: "Human Resources",
    status: DeviceStatus.HIGH_RISK,
    os: "Windows 11 Enterprise",
    lastSeen: "Jun 20, 2026 11:30 AM",
  },
  {
    id: "DEV-108",
    name: "DEV-108-DB-SRV",
    type: "Database Server",
    owner: "Markus Vance",
    department: "Data Platform",
    status: DeviceStatus.WARNING,
    os: "RHEL 9.3",
    lastSeen: "Jun 20, 2026 11:32 AM",
  },
  {
    id: "DEV-294",
    name: "DEV-294-ENG-DRD",
    type: "Dell Precision 3660",
    owner: "Aris Thorne",
    department: "Product R&D",
    status: DeviceStatus.WARNING,
    os: "Ubuntu 22.04 LTS",
    lastSeen: "Jun 20, 2026 11:28 AM",
  },
  {
    id: "DEV-882",
    name: "DEV-882-CEO-TAB",
    type: "Executive Tablet",
    owner: "Elena Rostova",
    department: "Executive Office",
    status: DeviceStatus.HIGH_RISK,
    os: "Windows 11 Pro",
    lastSeen: "Jun 20, 2026 11:15 AM",
  },
  {
    id: "DEV-556",
    name: "DEV-556-FIN-DESK",
    type: "Dell OptiPlex 7090",
    owner: "James Okonkwo",
    department: "Finance",
    status: DeviceStatus.WARNING,
    os: "Windows 11 Enterprise",
    lastSeen: "Jun 20, 2026 10:45 AM",
  },
  {
    id: "DEV-331",
    name: "DEV-331-STG-SRV",
    type: "Staging Server",
    owner: "Internal QA Team",
    department: "Engineering",
    status: DeviceStatus.HIGH_RISK,
    os: "Windows Server 2022",
    lastSeen: "Jun 20, 2026 09:20 AM",
  },
];

export const mockRecommendations: AIRecommendation[] = [
  {
    id: "REC-4012",
    deviceId: "DEV-143",
    action: "Quarantine Device",
    summaryLine:
      "Active malware detected with outbound traffic — isolate before it spreads.",
    severity: Severity.CRITICAL,
    confidence: ConfidenceLevel.HIGH,
    confidenceReason:
      "The same pattern of failed logins, missing patches, and active malware appeared in 47 similar cases that were all confirmed threats.",
    reasoning:
      "This device has run hotter than similar devices for the past 6 days, has not been patched in 45 days, and is now sending data to an unknown external server. These three signals together strongly match past confirmed infections in your fleet.",
    dataSourceAttribution:
      "Based on telemetry from 342 similar devices in your fleet over the last 14 days, plus endpoint protection logs and network connection records.",
    detectedEvents: [
      {
        id: "EVT-101",
        day: "Day 1",
        timestamp: "Jun 17, 8:14 AM",
        title: "15 failed login attempts",
        description:
          "Multiple failed sign-in attempts in a short window — typical of a brute-force attack.",
        severity: Severity.MEDIUM,
      },
      {
        id: "EVT-102",
        day: "Day 2",
        timestamp: "Jun 18, 10:30 AM",
        title: "Missing critical security patch",
        description:
          "A required security update has not been installed for 45 days.",
        severity: Severity.HIGH,
      },
      {
        id: "EVT-103",
        day: "Day 3",
        timestamp: "Jun 19, 2:15 PM",
        title: "Malware signature found",
        description:
          "Endpoint protection flagged a known malicious file on this device.",
        severity: Severity.CRITICAL,
      },
      {
        id: "EVT-104",
        day: "Day 4",
        timestamp: "Jun 20, 9:44 AM",
        title: "Suspicious outbound traffic",
        description:
          "The device is connecting to an external address linked to known attack infrastructure.",
        severity: Severity.CRITICAL,
      },
    ],
    limitations: [
      {
        title: "Device model not fully validated",
        description:
          "This recommendation has not been validated on this specific device model in your environment.",
      },
      {
        title: "14-day data window only",
        description:
          "Based on the last 14 days of data only — longer-term trends were not considered.",
      },
      {
        title: "15-minute offline gap today",
        description:
          "The device was disconnected from the network between 10:15 and 10:30 AM; some activity during that window may be untracked.",
      },
    ],
    alternatives: [
      {
        option: "A",
        title: "Monitor Only",
        description:
          "Keep the device online and increase log collection frequency.",
        riskLevel: "Low protection — malware may spread to other devices",
        businessImpact: "No downtime for the employee",
        recommended: false,
        reasoning:
          "Too passive. Active outbound traffic to a suspicious server is already confirmed.",
      },
      {
        option: "B",
        title: "Deploy Security Patch",
        description:
          "Install the missing update and reboot the device.",
        riskLevel: "Medium — closes the patch gap but may not remove active malware",
        businessImpact: "Brief reboot required (~5 minutes)",
        recommended: false,
        reasoning:
          "Patching alone does not stop malware that is already running and communicating externally.",
      },
      {
        option: "C",
        title: "Restrict Network Access",
        description:
          "Block external internet but keep internal network access.",
        riskLevel: "High — stops external communication but not local spread",
        businessImpact: "Employee loses web and cloud app access",
        recommended: false,
        reasoning:
          "Strong option, but quarantine is safer when active malware is confirmed.",
      },
      {
        option: "D",
        title: "Quarantine Device",
        description:
          "Fully isolate the device from all networks except the security remediation channel.",
        riskLevel: "Maximum — stops spread and data exfiltration",
        businessImpact: "Employee needs a backup device for urgent work",
        recommended: true,
        reasoning:
          "Safest choice when malware is active and communicating with an external server.",
      },
    ],
    timestamp: "Jun 20, 2026 9:45 AM",
    status: "Pending",
  },
  {
    id: "REC-4013",
    deviceId: "DEV-108",
    action: "Deploy Security Patch",
    summaryLine:
      "Database server is running outdated software with a known security hole.",
    severity: Severity.HIGH,
    confidence: ConfidenceLevel.MODERATE,
    confidenceReason:
      "The vulnerability is confirmed in your software version, but no active attack has been detected on this server yet.",
    reasoning:
      "Your database container is running a version with a published security flaw. No malicious activity has been seen, but the hole could be exploited at any time. Patching now closes the gap before anything happens.",
    dataSourceAttribution:
      "Cross-referenced against your organization's patch compliance policy (Policy #44) and the national vulnerability database.",
    detectedEvents: [
      {
        id: "EVT-201",
        day: "Day 1",
        timestamp: "Jun 19, 12:00 PM",
        title: "Outdated container version flagged",
        description:
          "A routine compliance scan found the database container is behind on security updates.",
        severity: Severity.MEDIUM,
      },
    ],
    limitations: [
      {
        title: "Restart impact unknown",
        description:
          "The AI cannot guarantee whether a container restart will disrupt dependent applications during peak load.",
      },
    ],
    alternatives: [
      {
        option: "A",
        title: "Monitor Only",
        description: "Review again at the next weekly maintenance window.",
        riskLevel: "None — vulnerability remains open",
        businessImpact: "No downtime",
        recommended: false,
        reasoning: "This server handles employee records — waiting is risky.",
      },
      {
        option: "B",
        title: "Deploy Security Patch",
        description: "Update the container with the latest secure version (~15 seconds).",
        riskLevel: "High — eliminates the known vulnerability",
        businessImpact: "Brief handoff (~15 seconds)",
        recommended: true,
        reasoning: "Low-risk fix that eliminates exposure with minimal disruption.",
      },
    ],
    timestamp: "Jun 20, 2026 10:20 AM",
    status: "Pending",
  },
  {
    id: "REC-4014",
    deviceId: "DEV-294",
    action: "Restrict Network Access",
    summaryLine:
      "Developer machine is scanning external servers — may indicate credential theft.",
    severity: Severity.HIGH,
    confidence: ConfidenceLevel.HIGH,
    confidenceReason:
      "Repeated outbound connection attempts to unrecognized addresses match patterns from 23 prior confirmed incidents.",
    reasoning:
      "This developer workstation sent over 100 outbound connection attempts to servers outside your company network in the last 24 hours. The employee is not assigned to any authorized security testing. Restricting external access stops the scanning while preserving internal development tools.",
    dataSourceAttribution:
      "Based on network flow logs from your enterprise firewall and command audit logs from the last 7 days.",
    detectedEvents: [
      {
        id: "EVT-301",
        day: "Day 1",
        timestamp: "Jun 19, 6:22 PM",
        title: "Unusual admin commands logged",
        description:
          "Root-level commands were used to map external IP ranges — uncommon for daily development work.",
        severity: Severity.HIGH,
      },
      {
        id: "EVT-302",
        day: "Day 2",
        timestamp: "Jun 20, 10:14 AM",
        title: "112 outbound SSH attempts",
        description:
          "The device tried to connect to many external addresses on port 22.",
        severity: Severity.HIGH,
      },
    ],
    limitations: [
      {
        title: "Pen-test authorization unclear",
        description:
          "The AI cannot verify whether the employee received verbal approval for security testing today.",
      },
    ],
    alternatives: [
      {
        option: "A",
        title: "Monitor Only",
        description: "Continue logging outbound connections.",
        riskLevel: "None — scanning continues",
        businessImpact: "No downtime",
        recommended: false,
        reasoning: "Outbound scans could be leaking credentials to external parties.",
      },
      {
        option: "B",
        title: "Restrict Network Access",
        description: "Block external connections but keep internal dev tools accessible.",
        riskLevel: "Very high — stops outbound scanning immediately",
        businessImpact: "Developer cannot reach external client servers",
        recommended: true,
        reasoning: "Protects the company without fully locking down the workstation.",
      },
    ],
    timestamp: "Jun 20, 2026 11:00 AM",
    status: "Pending",
  },
  {
    id: "REC-4015",
    deviceId: "DEV-882",
    action: "Escalate to Human Review",
    summaryLine:
      "CEO tablet downloaded a large file at 2 AM — needs human verification before any action.",
    severity: Severity.CRITICAL,
    confidence: ConfidenceLevel.REVIEW_RECOMMENDED,
    confidenceReason:
      "The activity looks suspicious, but the device belongs to an executive. Automatic lockout could disrupt active business negotiations.",
    reasoning:
      "The CEO's tablet copied a 14 GB customer database file at 2:11 AM. This could be a data exfiltration attempt, or it could be a scheduled backup before an international flight. Because of the executive role, a senior admin should verify by phone before any containment action.",
    dataSourceAttribution:
      "Based on file activity logs from the device and your organization's executive access policy records.",
    detectedEvents: [
      {
        id: "EVT-401",
        day: "Today",
        timestamp: "Jun 20, 2:11 AM",
        title: "Large file download at night",
        description:
          "A 14 GB database export was saved to the tablet's local storage during off-hours.",
        severity: Severity.CRITICAL,
      },
    ],
    limitations: [
      {
        title: "Personal backup schedule unknown",
        description:
          "The AI cannot verify whether the CEO scheduled a manual backup before travel.",
      },
    ],
    alternatives: [
      {
        option: "A",
        title: "Immediate Quarantine",
        description: "Lock the tablet instantly and cut all network access.",
        riskLevel: "Maximum — but may be a false alarm",
        businessImpact: "CEO locked out during active negotiations",
        recommended: false,
        reasoning: "Too aggressive without human verification for an executive device.",
      },
      {
        option: "B",
        title: "Escalate to CISO",
        description: "Alert the security lead for phone verification before any action.",
        riskLevel: "High — human-guided containment without blind lockout",
        businessImpact: "Minimal disruption",
        recommended: true,
        reasoning: "Executive devices require human judgment before automated actions.",
      },
    ],
    timestamp: "Jun 20, 2026 11:15 AM",
    status: "Pending",
  },
  {
    id: "REC-4016",
    deviceId: "DEV-556",
    action: "Quarantine Device",
    summaryLine:
      "Finance workstation accessed banking portal from an unrecognized location.",
    severity: Severity.HIGH,
    confidence: ConfidenceLevel.MODERATE,
    confidenceReason:
      "The login location differs from the employee's usual pattern, but they may be working remotely from a new site.",
    reasoning:
      "This finance desktop signed into the company banking portal from a city the employee has never logged in from before. Combined with an expired VPN certificate, this could indicate a compromised session. Quarantine prevents further financial system access until verified.",
    dataSourceAttribution:
      "Based on authentication logs from your finance gateway and VPN connection records over the last 30 days.",
    detectedEvents: [
      {
        id: "EVT-501",
        day: "Today",
        timestamp: "Jun 20, 10:30 AM",
        title: "Login from new location",
        description:
          "Banking portal accessed from a city 800 miles from the employee's usual office.",
        severity: Severity.HIGH,
      },
      {
        id: "EVT-502",
        day: "Today",
        timestamp: "Jun 20, 10:28 AM",
        title: "Expired VPN certificate",
        description:
          "The device's VPN certificate expired 3 days ago — traffic may not be encrypted.",
        severity: Severity.MEDIUM,
      },
    ],
    limitations: [
      {
        title: "Remote work policy gap",
        description:
          "The AI does not know if the employee was approved to work from the detected location.",
      },
    ],
    alternatives: [
      {
        option: "A",
        title: "Reset VPN Certificate",
        description: "Issue a new certificate without restricting access.",
        riskLevel: "Low — fixes encryption but not potential compromise",
        businessImpact: "Employee continues working normally",
        recommended: false,
        reasoning: "Does not address the suspicious login location.",
      },
      {
        option: "B",
        title: "Quarantine Device",
        description: "Block access to financial systems until identity is verified.",
        riskLevel: "High — prevents unauthorized financial transactions",
        businessImpact: "Finance employee paused until verification call",
        recommended: true,
        reasoning: "Protects financial systems when identity cannot be confirmed.",
      },
    ],
    timestamp: "Jun 20, 2026 10:45 AM",
    status: "Pending",
  },
  {
    id: "REC-4017",
    deviceId: "DEV-331",
    action: "Monitor Device Activity",
    summaryLine:
      "Unusual network traffic on staging server — may be an internal test, not an attack.",
    severity: Severity.MEDIUM,
    confidence: ConfidenceLevel.LOW,
    confidenceReason:
      "Traffic patterns are unusual but this device is in a staging environment where stress tests are common. Very limited comparable data exists.",
    reasoning:
      "The staging server sent bursts of traffic to several internal addresses overnight. This matches stress-test patterns used by your QA team, but the AI has very few similar cases to compare against. Monitoring with increased logging is safer than quarantine for a non-production system.",
    dataSourceAttribution:
      "Based on internal network logs from 12 staging servers over the last 7 days.",
    detectedEvents: [
      {
        id: "EVT-601",
        day: "Last night",
        timestamp: "Jun 20, 2:00 AM",
        title: "Burst traffic to internal hosts",
        description:
          "High-volume connections to 8 internal servers between 2:00 and 4:00 AM.",
        severity: Severity.MEDIUM,
      },
    ],
    limitations: [
      {
        title: "Outside trained scope",
        description:
          "Staging environments behave differently from production — the AI has limited training data for this context.",
      },
      {
        title: "QA schedule not available",
        description:
          "The AI cannot access the QA team's test schedule to confirm planned activity.",
      },
    ],
    alternatives: [
      {
        option: "A",
        title: "Monitor Device Activity",
        description: "Increase logging frequency and review in 24 hours.",
        riskLevel: "Low — passive observation",
        businessImpact: "No impact on QA workflows",
        recommended: true,
        reasoning: "Appropriate for low-confidence alerts on non-production systems.",
      },
      {
        option: "B",
        title: "Quarantine Device",
        description: "Isolate the staging server from the network.",
        riskLevel: "High — may disrupt active QA cycles",
        businessImpact: "QA testing halted until investigation completes",
        recommended: false,
        reasoning: "Too aggressive given low confidence and staging context.",
      },
    ],
    timestamp: "Jun 20, 2026 9:20 AM",
    status: "Pending",
  },
];

export const mockAuditHistory: AuditRecord[] = [
  {
    id: "AUD-9011",
    deviceId: "DEV-107",
    deviceName: "DEV-107-EMP-MBL",
    action: "Quarantine Device",
    aiReasoning:
      "Active malware was sending data to an external server. Missing patches made the device vulnerable.",
    severity: Severity.HIGH,
    confidence: ConfidenceLevel.HIGH,
    reviewer: "Alex Morgan",
    reviewerRole: Role.IT_ADMIN,
    decision: "Approved",
    notes: "Confirmed malware was active. Approved quarantine immediately.",
    outcome: "Threat contained — device remediated successfully",
    timestamp: "Jun 20, 2026 10:14 AM",
  },
  {
    id: "AUD-9012",
    deviceId: "DEV-331",
    deviceName: "DEV-331-STG-SRV",
    action: "Quarantine Device",
    aiReasoning:
      "Unusual traffic patterns detected on staging server overnight.",
    severity: Severity.HIGH,
    confidence: ConfidenceLevel.MODERATE,
    reviewer: "Priya Sharma",
    reviewerRole: Role.SECURITY_ANALYST,
    decision: "Overridden",
    overrideReason: "False Positive — Internal Test",
    notes:
      "Traffic was from scheduled stress tests by the QA team. No malware found.",
    outcome: "No threat detected — internal QA activity confirmed",
    timestamp: "Jun 20, 2026 9:30 AM",
  },
  {
    id: "AUD-9013",
    deviceId: "DEV-402",
    deviceName: "DEV-402-SALES-LTP",
    action: "Deploy Security Patch",
    aiReasoning:
      "Missing security update left the device open to a known vulnerability.",
    severity: Severity.MEDIUM,
    confidence: ConfidenceLevel.HIGH,
    reviewer: "Alex Morgan",
    reviewerRole: Role.IT_ADMIN,
    decision: "Approved",
    notes: "Scheduled patch deployment for after work hours.",
    outcome: "Patch deployed — vulnerability closed",
    timestamp: "Jun 19, 2026 4:45 PM",
  },
  {
    id: "AUD-9014",
    deviceId: "DEV-554",
    deviceName: "DEV-554-FIN-DESK",
    action: "Restrict Network Access",
    aiReasoning:
      "Suspicious database access from an admin account on a remote terminal.",
    severity: Severity.HIGH,
    confidence: ConfidenceLevel.REVIEW_RECOMMENDED,
    reviewer: "Alex Morgan",
    reviewerRole: Role.IT_ADMIN,
    decision: "Escalated",
    notes:
      "Escalated to Finance Controller to verify whether the database access was authorized.",
    outcome: "Under senior review — access temporarily restricted",
    timestamp: "Jun 19, 2026 11:15 AM",
  },
  {
    id: "AUD-9015",
    deviceId: "DEV-882",
    deviceName: "DEV-882-CEO-TAB",
    action: "Escalate to Human Review",
    aiReasoning:
      "Large file download on executive device during off-hours requires human verification.",
    severity: Severity.CRITICAL,
    confidence: ConfidenceLevel.REVIEW_RECOMMENDED,
    reviewer: "Priya Sharma",
    reviewerRole: Role.SECURITY_ANALYST,
    decision: "Escalated",
    notes:
      "CISO notified. CEO confirmed scheduled backup before flight — no action needed.",
    outcome: "No threat detected — authorized executive backup",
    timestamp: "Jun 18, 2026 8:00 AM",
  },
  {
    id: "AUD-9016",
    deviceId: "DEV-143",
    deviceName: "DEV-143-CORP-LTP",
    action: "Quarantine Device",
    aiReasoning:
      "Multiple failed logins and suspicious outbound traffic detected on employee laptop.",
    severity: Severity.HIGH,
    confidence: ConfidenceLevel.HIGH,
    reviewer: "Priya Sharma",
    reviewerRole: Role.SECURITY_ANALYST,
    decision: "Escalated",
    notes: "Contacting employee to verify activity before quarantine.",
    outcome: "Under review — awaiting employee verification",
    timestamp: "Jun 19, 2026 3:20 PM",
  },
];

export const mockNotifications: EmployeeNotification[] = [
  {
    id: "NTF-001",
    title: "Security review on your device",
    message:
      "IT is reviewing an AI recommendation for DEV-143-CORP-LTP. You may be asked to use a backup laptop.",
    timestamp: "Jun 20, 2026 9:50 AM",
    read: false,
    type: "warning",
  },
  {
    id: "NTF-002",
    title: "Patch reminder",
    message: "Your device is missing a critical security update. IT may schedule maintenance.",
    timestamp: "Jun 19, 2026 2:00 PM",
    read: true,
    type: "info",
  },
  {
    id: "NTF-003",
    title: "Action required: verify login",
    message: "Please confirm recent login activity when contacted by the security team.",
    timestamp: "Jun 18, 2026 11:00 AM",
    read: false,
    type: "action",
  },
];

export const complianceMetrics = {
  soc2Compliance: 98,
  patchCompliance: 94,
  auditCoverage: 100,
  policyViolations: 3,
  lastAudit: "Jun 15, 2026",
};

export function getDeviceById(id: string): DeviceInfo | undefined {
  return mockDevices.find((d) => d.id === id);
}

export function getConfidenceStyles(level: ConfidenceLevel): {
  bg: string;
  text: string;
  border: string;
  glow: string;
  gradient: string;
} {
  switch (level) {
    case ConfidenceLevel.HIGH:
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        glow: "shadow-emerald-500/20",
        gradient: "from-emerald-500 to-teal-500",
      };
    case ConfidenceLevel.MODERATE:
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        glow: "shadow-amber-500/20",
        gradient: "from-amber-500 to-yellow-500",
      };
    case ConfidenceLevel.REVIEW_RECOMMENDED:
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        glow: "shadow-orange-500/20",
        gradient: "from-orange-500 to-amber-500",
      };
    case ConfidenceLevel.LOW:
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        glow: "shadow-red-500/20",
        gradient: "from-red-500 to-rose-500",
      };
  }
}
