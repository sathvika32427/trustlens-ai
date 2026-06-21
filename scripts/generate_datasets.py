#!/usr/bin/env python3
"""Generate synthetic cybersecurity governance datasets for TrustLens AI."""

from __future__ import annotations

import json
import shutil
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
from faker import Faker

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
PUBLIC_DATA_DIR = ROOT / "public" / "data"

fake = Faker()
Faker.seed(42)
np.random.seed(42)

ACTIONS = [
    "Quarantine Device",
    "Deploy Security Patch",
    "Restrict Network Access",
    "Escalate to Human Review",
    "Monitor Device Activity",
    "Revoke Admin Credentials",
    "Isolate Endpoint",
    "Force Password Reset",
]

SEVERITIES = ["Critical", "High", "Medium", "Low"]
CONFIDENCE_LEVELS = ["High Confidence", "Moderate Confidence", "Review Recommended", "Low Confidence"]
STATUSES = ["Pending", "Approved", "Overridden", "Escalated"]
RISK_LEVELS = ["Low", "Medium", "High", "Critical"]
OUTCOME_TYPES = [
    "Recommendation Correct",
    "Recommendation Incorrect",
    "False Positive",
    "False Negative",
]
EVIDENCE_TYPES = [
    "Malware Signature",
    "Failed Logins",
    "Network Activity",
    "Patch Violation",
    "Anomalous Process",
    "Data Exfiltration Pattern",
    "Privilege Escalation",
    "Suspicious DNS Query",
]
WEAKNESSES_POOL = [
    "Over-flags Linux devices",
    "Less reliable on previously unseen device models",
    "Elevated false positives during patch windows",
    "Reduced accuracy on staging environments",
    "Struggles with executive device context",
    "Limited visibility during VPN outages",
    "Overweights failed login signals on shared kiosks",
]
COUNTER_CONSIDERATIONS = [
    "Similar behavior has previously occurred during software updates.",
    "This device model often triggers benign network scans during backup jobs.",
    "Historical false positives were linked to scheduled QA stress tests.",
    "Executive devices frequently show off-hours file activity before travel.",
    "Finance remote logins may reflect approved work-from-new-location policy.",
    "Staging servers routinely generate burst traffic during nightly test runs.",
    "Patch deployment windows correlate with elevated endpoint telemetry noise.",
    "Internal pen-test activity can mimic external scanning patterns.",
]
DEPARTMENTS = ["Human Resources", "Finance", "Engineering", "Executive Office", "Data Platform", "Sales", "Legal", "IT Operations"]
DEVICE_TYPES = ["Dell Latitude 5440", "Dell OptiPlex 7090", "Dell Precision 3660", "Database Server", "Staging Server", "Executive Tablet"]
OS_LIST = ["Windows 11 Enterprise", "Windows 11 Pro", "RHEL 9.3", "Ubuntu 22.04 LTS", "Windows Server 2022"]

CURRENT_EMPLOYEE = "Sarah Jenkins"
CURRENT_EMPLOYEE_DEVICE = "DEV-0143"


def ensure_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)


def gen_recommendations(n: int = 1000) -> pd.DataFrame:
    rows = []
    base_date = datetime(2026, 6, 21)
    for i in range(1, n + 1):
        rec_id = f"REC-{i:04d}"
        device_num = np.random.randint(1, 251)
        device_id = f"DEV-{device_num:04d}"
        case_id = f"CASE-{i:04d}"
        severity = np.random.choice(SEVERITIES, p=[0.12, 0.28, 0.38, 0.22])
        risk_map = {"Critical": "Critical", "High": "High", "Medium": "Medium", "Low": "Low"}
        risk_level = risk_map[severity]
        confidence = np.random.choice(CONFIDENCE_LEVELS, p=[0.35, 0.30, 0.20, 0.15])
        conf_score = {"High Confidence": np.random.uniform(82, 98),
                      "Moderate Confidence": np.random.uniform(65, 81),
                      "Review Recommended": np.random.uniform(45, 64),
                      "Low Confidence": np.random.uniform(20, 44)}[confidence]
        owner = fake.name()
        if i == 143:
            owner = CURRENT_EMPLOYEE
            device_id = CURRENT_EMPLOYEE_DEVICE
        status = np.random.choice(STATUSES, p=[0.35, 0.30, 0.20, 0.15])
        created = base_date - timedelta(days=int(np.random.randint(0, 45)))
        incident_id = ""
        if status == "Overridden" and np.random.random() < 0.25:
            incident_id = f"INC-{np.random.randint(1, 201):04d}"
        rows.append({
            "recommendation_id": rec_id,
            "device_id": device_id,
            "case_id": case_id,
            "incident_id": incident_id,
            "action": np.random.choice(ACTIONS),
            "summary_line": fake.sentence(nb_words=14),
            "severity": severity,
            "risk_level": risk_level,
            "confidence": confidence,
            "confidence_score": round(conf_score, 1),
            "reasoning": fake.paragraph(nb_sentences=3),
            "data_source_attribution": f"Telemetry from {np.random.randint(120, 900)} similar devices over {np.random.randint(7, 30)} days.",
            "status": status,
            "timestamp": created.strftime("%Y-%m-%d %H:%M"),
            "device_name": f"{device_id}-CORP",
            "device_type": np.random.choice(DEVICE_TYPES),
            "device_owner": owner,
            "department": np.random.choice(DEPARTMENTS),
            "os": np.random.choice(OS_LIST),
            "last_seen": (base_date - timedelta(hours=np.random.randint(1, 72))).strftime("%b %d, %Y %I:%M %p"),
        })
    return pd.DataFrame(rows)


def gen_trust_ledger(recs: pd.DataFrame, n: int = 1000) -> pd.DataFrame:
    subset = recs.head(n) if n >= len(recs) else recs.sample(n=n, random_state=42)
    rows = []
    for _, r in subset.iterrows():
        correct = int(np.random.randint(20, 80))
        incorrect = int(np.random.randint(0, max(2, correct // 10)))
        total = correct + incorrect
        reliability = round((correct / total) * 100, 1) if total else 0
        weaknesses = "; ".join(np.random.choice(WEAKNESSES_POOL, size=np.random.randint(1, 4), replace=False))
        rows.append({
            "recommendation_id": r["recommendation_id"],
            "device_id": r["device_id"],
            "case_id": r["case_id"],
            "past_similar_cases": int(np.random.randint(15, 120)),
            "correct_recommendations": correct,
            "incorrect_recommendations": incorrect,
            "historical_reliability_score": reliability,
            "known_weaknesses": weaknesses,
        })
    return pd.DataFrame(rows)


def gen_impact_preview(recs: pd.DataFrame, n: int = 1000) -> pd.DataFrame:
    subset = recs.head(n) if n >= len(recs) else recs.sample(n=n, random_state=43)
    rows = []
    for _, r in subset.iterrows():
        rows.append({
            "recommendation_id": r["recommendation_id"],
            "device_id": r["device_id"],
            "case_id": r["case_id"],
            "if_approved_threat_contained": "Threat contained and lateral movement prevented",
            "if_approved_device_isolated": f"{r['device_name']} isolated from corporate network",
            "if_approved_user_impact": "User temporarily loses access; backup device issued if critical",
            "if_dismissed_malware_spread": "Potential malware spread to adjacent endpoints",
            "if_dismissed_security_risk": "Increased security risk and possible data exfiltration",
            "if_dismissed_business_impact": f"Business impact to {r['department']} workflows if threat is real",
        })
    return pd.DataFrame(rows)


def gen_adaptive_approval(recs: pd.DataFrame, n: int = 1000) -> pd.DataFrame:
    subset = recs.head(n) if n >= len(recs) else recs.sample(n=n, random_state=44)
    rows = []
    for _, r in subset.iterrows():
        risk = r["risk_level"]
        rows.append({
            "recommendation_id": r["recommendation_id"],
            "device_id": r["device_id"],
            "case_id": r["case_id"],
            "risk_level": risk,
            "requires_evidence_review": risk in ("Medium", "High", "Critical"),
            "requires_impact_review": risk in ("High", "Critical"),
            "requires_written_justification": risk == "Critical",
        })
    return pd.DataFrame(rows)


def gen_counter_considerations(recs: pd.DataFrame, n: int = 1000) -> pd.DataFrame:
    subset = recs.head(n) if n >= len(recs) else recs.sample(n=n, random_state=45)
    rows = []
    for _, r in subset.iterrows():
        rows.append({
            "recommendation_id": r["recommendation_id"],
            "device_id": r["device_id"],
            "case_id": r["case_id"],
            "counter_consideration": np.random.choice(COUNTER_CONSIDERATIONS),
        })
    return pd.DataFrame(rows)


def gen_outcomes(recs: pd.DataFrame) -> pd.DataFrame:
    rows = []
    base = datetime(2026, 6, 21)
    for _, r in recs.iterrows():
        if r["status"] == "Pending":
            outcome_type = ""
            desc = ""
            resolved = ""
        else:
            outcome_type = np.random.choice(OUTCOME_TYPES, p=[0.55, 0.12, 0.25, 0.08])
            desc = {
                "Recommendation Correct": "Verified threat or vulnerability; action validated post-review.",
                "Recommendation Incorrect": "Action was unnecessary; root cause differed from AI assessment.",
                "False Positive": "Benign activity misclassified; no actual security incident.",
                "False Negative": "Threat existed but was missed or dismissed incorrectly.",
            }[outcome_type]
            resolved = (base - timedelta(days=np.random.randint(0, 30))).strftime("%Y-%m-%d")
        rows.append({
            "recommendation_id": r["recommendation_id"],
            "device_id": r["device_id"],
            "case_id": r["case_id"],
            "outcome_type": outcome_type,
            "outcome_description": desc,
            "resolved_at": resolved,
        })
    return pd.DataFrame(rows)


def gen_incident_cards(n: int = 200) -> pd.DataFrame:
    rows = []
    incidents = [
        ("Wrong Device Quarantined", "Software update mistaken for malware", "Update verification missing", "Update detection logic added"),
        ("Executive Lockout During Negotiations", "Off-hours backup flagged as exfiltration", "Executive context not applied", "Executive policy rules integrated"),
        ("QA Environment Disrupted", "Stress test traffic classified as attack", "Staging scope boundary missing", "Environment tagging enforced"),
        ("False Quarantine on Linux Dev Box", "Package manager activity misread", "Linux behavioral model gap", "Linux training data expanded"),
        ("Delayed Patch on Critical Server", "Low confidence led to dismissal", "Impact preview not reviewed", "Mandatory impact review for servers"),
        ("Credential Reset on Valid User", "Travel login flagged as compromise", "Geo-velocity threshold too aggressive", "Travel-aware auth baselines added"),
    ]
    for i in range(1, n + 1):
        inc = incidents[i % len(incidents)]
        rec_id = f"REC-{np.random.randint(1, 1001):04d}"
        rows.append({
            "incident_id": f"INC-{i:04d}",
            "recommendation_id": rec_id,
            "device_id": f"DEV-{np.random.randint(1, 251):04d}",
            "case_id": f"CASE-{np.random.randint(1, 1001):04d}",
            "incident_title": inc[0],
            "cause": inc[1],
            "safeguard_failure": inc[2],
            "corrective_action": inc[3],
            "created_at": fake.date_between(start_date="-120d", end_date="today").isoformat(),
        })
    return pd.DataFrame(rows)


def gen_trust_timeline(months: int = 36) -> pd.DataFrame:
    rows = []
    start = datetime(2023, 7, 1)
    score = 72.0
    for m in range(months):
        dt = start + timedelta(days=30 * m)
        score = min(95, score + np.random.uniform(0.2, 1.8))
        rows.append({
            "month": dt.strftime("%b %Y"),
            "month_index": m + 1,
            "trust_score": round(score, 1),
            "approval_rate": round(min(90, 60 + m * 0.7 + np.random.uniform(-2, 2)), 1),
            "override_rate": round(max(5, 22 - m * 0.35 + np.random.uniform(-1, 1)), 1),
        })
    return pd.DataFrame(rows)


def gen_similar_cases(recs: pd.DataFrame, n: int = 1000) -> pd.DataFrame:
    rows = []
    for _, r in recs.iterrows():
        if len(rows) >= n:
            break
        sim_id = f"CASE-{np.random.randint(1, 1001):04d}"
        outcome = np.random.choice(OUTCOME_TYPES, p=[0.6, 0.1, 0.22, 0.08])
        resolution = {
            "Recommendation Correct": "Approved and threat verified",
            "Recommendation Incorrect": "Overridden after investigation",
            "False Positive": "Dismissed; benign root cause confirmed",
            "False Negative": "Escalated; incident response initiated",
        }[outcome]
        rows.append({
            "recommendation_id": r["recommendation_id"],
            "device_id": r["device_id"],
            "similar_case_id": sim_id,
            "outcome": outcome,
            "resolution": resolution,
        })
    return pd.DataFrame(rows)


def gen_evidence_weights(recs: pd.DataFrame, n: int = 3000) -> pd.DataFrame:
    rows = []
    rec_sample = recs.sample(n=min(750, len(recs)), random_state=46)
    for _, r in rec_sample.iterrows():
        types = list(np.random.choice(EVIDENCE_TYPES, size=np.random.randint(3, 6), replace=False))
        weights = np.random.dirichlet(np.ones(len(types))) * 100
        for et, w in zip(types, weights):
            rows.append({
                "recommendation_id": r["recommendation_id"],
                "device_id": r["device_id"],
                "case_id": r["case_id"],
                "evidence_type": et,
                "weight_percentage": round(float(w), 1),
                "description": f"{et} detected on {r['device_name']} with elevated correlation to {r['action'].lower()}.",
            })
        if len(rows) >= n:
            break
    return pd.DataFrame(rows[:n])


def gen_trust_breakdown(recs: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for _, r in recs.iterrows():
        accuracy = round(np.random.uniform(72, 96), 1)
        approval = round(np.random.uniform(55, 88), 1)
        outcome_success = round(np.random.uniform(65, 94), 1)
        fp_rate = round(np.random.uniform(2, 12), 1)
        trust_index = round(
            accuracy * 0.30 + approval * 0.25 + outcome_success * 0.25 + (100 - fp_rate) * 0.20,
            1,
        )
        rows.append({
            "recommendation_id": r["recommendation_id"],
            "device_id": r["device_id"],
            "case_id": r["case_id"],
            "accuracy": accuracy,
            "approval_rate": approval,
            "outcome_success": outcome_success,
            "false_positive_rate": fp_rate,
            "trust_index": trust_index,
            "weight_accuracy": 0.30,
            "weight_approval_rate": 0.25,
            "weight_outcome_success": 0.25,
            "weight_false_positive_inverse": 0.20,
        })
    return pd.DataFrame(rows)


def gen_feedback(recs: pd.DataFrame) -> pd.DataFrame:
    rows = []
    decided = recs[recs["status"] != "Pending"].sample(n=min(1000, len(recs[recs["status"] != "Pending"])), random_state=47)
    for _, r in decided.iterrows():
        rows.append({
            "recommendation_id": r["recommendation_id"],
            "device_id": r["device_id"],
            "case_id": r["case_id"],
            "decision_id": f"DEC-{fake.uuid4()[:8].upper()}",
            "rating": int(np.random.randint(1, 6)),
            "feedback_comment": fake.sentence(nb_words=12),
            "submitted_at": r["timestamp"],
            "reviewer": fake.name(),
        })
    while len(rows) < 1000:
        r = recs.sample(1).iloc[0]
        rows.append({
            "recommendation_id": r["recommendation_id"],
            "device_id": r["device_id"],
            "case_id": r["case_id"],
            "decision_id": f"DEC-{fake.uuid4()[:8].upper()}",
            "rating": int(np.random.randint(1, 6)),
            "feedback_comment": fake.sentence(nb_words=12),
            "submitted_at": r["timestamp"],
            "reviewer": fake.name(),
        })
    return pd.DataFrame(rows[:1000])


def gen_recommendation_aging(recs: pd.DataFrame) -> pd.DataFrame:
    rows = []
    base = datetime(2026, 6, 21)
    for _, r in recs.iterrows():
        created = datetime.strptime(r["timestamp"], "%Y-%m-%d %H:%M")
        age = (base - created).days
        if age <= 7:
            status = "Healthy"
        elif age <= 14:
            status = "Warning"
        else:
            status = "Critical"
        rows.append({
            "recommendation_id": r["recommendation_id"],
            "device_id": r["device_id"],
            "case_id": r["case_id"],
            "created_at": r["timestamp"],
            "age_days": age,
            "aging_status": status,
        })
    return pd.DataFrame(rows)


def gen_ai_health(days: int = 365) -> pd.DataFrame:
    rows = []
    start = datetime(2025, 6, 21)
    trust = 78.0
    for d in range(days):
        dt = start + timedelta(days=d)
        trust = min(92, max(70, trust + np.random.uniform(-0.4, 0.5)))
        rows.append({
            "date": dt.strftime("%Y-%m-%d"),
            "recommendations_today": int(np.random.randint(8, 45)),
            "accuracy": round(np.random.uniform(82, 96), 1),
            "false_positives": int(np.random.randint(0, 8)),
            "incidents": int(np.random.poisson(0.8)),
            "trust_index": round(trust, 1),
        })
    return pd.DataFrame(rows)


def gen_business_impact(recs: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for _, r in recs.iterrows():
        impact = {"Critical": "Severe", "High": "High", "Medium": "Moderate", "Low": "Low"}[r["severity"]]
        rows.append({
            "recommendation_id": r["recommendation_id"],
            "device_id": r["device_id"],
            "case_id": r["case_id"],
            "affected_users": int(np.random.randint(1, 120)),
            "potential_downtime_hours": round(np.random.uniform(0.25, 24), 1),
            "risk_reduction_pct": round(np.random.uniform(15, 98), 1),
            "impact_level": impact,
        })
    return pd.DataFrame(rows)



def gen_data_sources(recs: pd.DataFrame) -> pd.DataFrame:
    pool = [
        {
            "name": "Device Telemetry",
            "type": "Endpoint Agent",
            "desc": "Real-time process, memory, and registry events from local device agent.",
            "collected": "Process creation flags, DLL injection traces, registry modification events"
        },
        {
            "name": "Security Logs",
            "type": "SIEM Stream",
            "desc": "Aggregated operating system and active security services events.",
            "collected": "Event ID 4624 (successful login), privilege service requests, firewall logs"
        },
        {
            "name": "Network Activity",
            "type": "NetFlow Collector",
            "desc": "Metadata for ingress/egress connections and internal network hops.",
            "collected": "Connection durations, data transferred (bytes), destination ports"
        },
        {
            "name": "Patch Compliance Records",
            "type": "Systems Management",
            "desc": "Compliance matrix listing applied vs pending software/security patches.",
            "collected": "KB patch IDs, installation date, OS build version numbers"
        },
        {
            "name": "Endpoint Detection Systems",
            "type": "EDR Engine",
            "desc": "Automated endpoint threat analysis, behavior tracking, and detection warnings.",
            "collected": "Heuristic trigger scores, suspicious command-line execution patterns"
        },
        {
            "name": "Threat Intelligence Feeds",
            "type": "External Threat Intel",
            "desc": "Reputation tracking database for bad IPs, domains, and known hash blocks.",
            "collected": "Bad actor infrastructure IPs, malicious DNS names, hash signatures"
        },
        {
            "name": "Authentication Events",
            "type": "Identity Provider",
            "desc": "Sign-in requests, MFA status, authentication tokens, and access evaluations.",
            "collected": "Failed login status, geo-location velocity alerts, MFA approval logs"
        },
        {
            "name": "Historical Incident Records",
            "type": "Incident Registry",
            "desc": "Database archives of past organizational threats and remediation histories.",
            "collected": "Similar dev box compromise records, past false positive incident resolutions"
        },
        {
            "name": "Malware Detection Engine",
            "type": "Antivirus Scanner",
            "desc": "Active file scanner matching signatures against global virus databases.",
            "collected": "File hash signatures, virus definition release dates, quarantine status"
        },
        {
            "name": "Network Anomaly Detection",
            "type": "IDS/IPS System",
            "desc": "Deep packet analysis searching for payload abnormalities and network threats.",
            "collected": "Suspected port scans, unexpected SMB payloads, DNS tunnel signatures"
        }
    ]
    rows = []
    source_idx = 1
    for _, r in recs.iterrows():
        # Choose 3 to 5 sources
        n_sources = np.random.randint(3, 6)
        chosen = np.random.choice(pool, size=n_sources, replace=False)
        rec_time = datetime.strptime(r["timestamp"], "%Y-%m-%d %H:%M")
        for c in chosen:
            # last_updated is 2 to 59 minutes before the recommendation
            updated_time = rec_time - timedelta(minutes=int(np.random.randint(2, 60)))
            trust_lvl = np.random.choice(["Very High", "High", "Moderate", "Low"], p=[0.35, 0.45, 0.15, 0.05])
            rows.append({
                "source_id": f"SRC-{source_idx:05d}",
                "recommendation_id": r["recommendation_id"],
                "source_name": c["name"],
                "source_type": c["type"],
                "trust_level": trust_lvl,
                "last_updated": updated_time.strftime("%Y-%m-%d %H:%M"),
                "description": c["desc"],
                "data_collected": c["collected"]
            })
            source_idx += 1
    return pd.DataFrame(rows)


def gen_limitations(recs: pd.DataFrame) -> pd.DataFrame:
    limits_pool = [
        {
            "limitation": "Missing telemetry data",
            "severity": "High",
            "impact": "Device telemetry unavailable for last 6 hours; security health checks degraded."
        },
        {
            "limitation": "Offline endpoints",
            "severity": "Medium",
            "impact": "Host is currently unreachable over VPN; cannot run live diagnostics."
        },
        {
            "limitation": "Incomplete logs",
            "severity": "Medium",
            "impact": "Active Directory auth logs delayed; cannot cross-verify session continuity."
        },
        {
            "limitation": "Limited historical examples",
            "severity": "Low",
            "impact": "Rare incident type; pattern not seen in the last 180 days."
        },
        {
            "limitation": "New device models",
            "severity": "Low",
            "impact": "Model behavior baseline not fully trained; using general device profiles."
        },
        {
            "limitation": "Delayed event ingestion",
            "severity": "Medium",
            "impact": "SIEM log pipeline experiencing a 15-minute queue latency."
        },
        {
            "limitation": "Sparse threat intelligence",
            "severity": "Low",
            "impact": "IP address reputation has not been categorized by secondary feeds."
        },
        {
            "limitation": "Unknown device states",
            "severity": "Medium",
            "impact": "Device state unclear due to parallel endpoint configuration changes."
        }
    ]
    rows = []
    limit_idx = 1
    for _, r in recs.iterrows():
        # High confidence recs have 0 or 1 limitation
        # Moderate or low confidence recs have 1 or 2 limitations
        conf = r["confidence"]
        if conf == "High Confidence":
            n_limits = np.random.choice([0, 1], p=[0.6, 0.4])
        elif conf == "Moderate Confidence":
            n_limits = np.random.choice([1, 2], p=[0.7, 0.3])
        else:
            n_limits = np.random.choice([1, 2], p=[0.4, 0.6])

        if n_limits > 0:
            chosen = np.random.choice(limits_pool, size=n_limits, replace=False)
            for c in chosen:
                rows.append({
                    "limitation_id": f"LIM-{limit_idx:05d}",
                    "recommendation_id": r["recommendation_id"],
                    "limitation": c["limitation"],
                    "severity": c["severity"],
                    "impact": c["impact"]
                })
                limit_idx += 1
    return pd.DataFrame(rows)


def gen_reasoning_chain(recs: pd.DataFrame) -> pd.DataFrame:
    rows = []
    
    # We will generate steps 1 to 7 for each recommendation
    for _, r in recs.iterrows():
        rec_id = r["recommendation_id"]
        action = r["action"]
        dev_name = r["device_name"]
        dept = r["department"]
        sev = r["severity"]
        conf = r["confidence"]
        score = r["confidence_score"]

        # Step 1: Evidence Collected
        step_1_text = f"Collected telemetry indicating anomalous {action.lower()} triggers on {dev_name}. "
        if action == "Quarantine Device":
            step_1_text += "Detected potential ransomware signature matching active ransomware hashes, coupled with 3+ failed MFA attempts."
        elif action == "Deploy Security Patch":
            step_1_text += "Discovered out-of-date library CVE-2024-4321 on core runtime environment, leaving server open to remote code execution."
        elif action == "Restrict Network Access":
            step_1_text += "Detected persistent outbound connection bursts to blacklisted external IPs in unauthorized region."
        else:
            step_1_text += f"Observed suspicious credential enumeration behavior originating from {dev_name} targeting internal active directory."

        # Step 2: Evidence Weighting
        w1 = int(np.random.randint(45, 65))
        w2 = int(np.random.randint(15, 30))
        w3 = 100 - w1 - w2
        step_2_text = f"Weighted primary alert signals: Primary indicator ({action}) assigned {w1}% weight, secondary audit log anomaly assigned {w2}% weight, and device state profiling assigned {w3}% weight."

        # Step 3: Risk Assessment
        step_3_text = f"Calculated system risk profile as {sev}. "
        if sev == "Critical":
            step_3_text += f"Threat poses immediate systemic compromise risk to {dept} subnetwork. Rapid containment is mandatory."
        elif sev == "High":
            step_3_text += f"Threat displays active lateral traversal indicators. Failure to remediate exposes key {dept} nodes."
        elif sev == "Medium":
            step_3_text += f"Vulnerability exposed, but network constraints limit spread risk. Moderate operational impact."
        else:
            step_3_text += "Low vulnerability exposure. Local containment is stable; recommend scheduling standard resolution."

        # Step 4: Historical Similar Cases
        cases_count = np.random.randint(12, 110)
        correct_count = int(cases_count * np.random.uniform(0.85, 0.98))
        accuracy_pct = round((correct_count / cases_count) * 100, 1)
        step_4_text = f"Evaluated {cases_count} historical similar cases in organization. Of those, {correct_count} cases were resolved correctly by taking action {action} (historical precision: {accuracy_pct}%)."

        # Step 5: Confidence Explanation
        step_5_text = f"Determined {conf} score of {score}%. "
        if conf == "High Confidence":
            step_5_text += "High confidence is driven by concurrent alerts across EDR agents, SIEM flows, and threat intelligence directories."
        elif conf == "Moderate Confidence":
            step_5_text += "Moderate confidence due to partial data logs or recently updated OS models with sparse historic telemetry."
        else:
            step_5_text += "Review recommended. Alert confidence is constrained by device agent offline status and low-level data ingest latencies."

        # Step 6: Trust Ledger Analysis
        step_6_text = f"Queried corporate trust ledger. AI model's historical reliability score for {action} currently registers at 91.4% accuracy across corporate {dept} endpoints."

        # Step 7: Business Impact Assessment
        downtime = round(np.random.uniform(0.5, 4.0), 1)
        step_7_text = f"Predicted business impact: temporary isolation of {dev_name} will result in ~{downtime} hours workflow downtime for {dept}. Risk reduction of 95%+ outweighs operational drag."

        steps = [
            (1, "Evidence Collected", step_1_text, w1),
            (2, "Evidence Weighting", step_2_text, w2),
            (3, "Risk Assessment", step_3_text, 0),
            (4, "Historical Similar Cases", step_4_text, 0),
            (5, "Confidence Explanation", step_5_text, 0),
            (6, "Trust Ledger Analysis", step_6_text, 0),
            (7, "Business Impact Assessment", step_7_text, 0)
        ]

        for num, title, txt, weight in steps:
            rows.append({
                "recommendation_id": rec_id,
                "step_number": num,
                "reasoning_step": f"{title}: {txt}",
                "evidence_weight": weight
            })

    return pd.DataFrame(rows)


def export_df(df: pd.DataFrame, name: str) -> None:
    path = DATA_DIR / f"{name}.csv"
    df.to_csv(path, index=False)
    shutil.copy(path, PUBLIC_DATA_DIR / f"{name}.csv")
    print(f"  {name}.csv — {len(df):,} rows")


def main() -> None:
    ensure_dirs()
    print("Generating TrustLens AI datasets...")
    recs = gen_recommendations(1000)
    datasets = {
        "recommendations": recs,
        "trust_ledger": gen_trust_ledger(recs, 1000),
        "impact_preview": gen_impact_preview(recs, 1000),
        "adaptive_approval": gen_adaptive_approval(recs, 1000),
        "counter_considerations": gen_counter_considerations(recs, 1000),
        "outcomes": gen_outcomes(recs),
        "incident_cards": gen_incident_cards(200),
        "trust_timeline": gen_trust_timeline(36),
        "similar_cases": gen_similar_cases(recs, 1000),
        "evidence_weights": gen_evidence_weights(recs, 3000),
        "trust_breakdown": gen_trust_breakdown(recs),
        "feedback": gen_feedback(recs),
        "recommendation_aging": gen_recommendation_aging(recs),
        "ai_health": gen_ai_health(365),
        "business_impact": gen_business_impact(recs),
        "data_sources": gen_data_sources(recs),
        "limitations": gen_limitations(recs),
        "reasoning_chain": gen_reasoning_chain(recs),
    }
    for name, df in datasets.items():
        export_df(df, name)

    meta = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "files": list(datasets.keys()),
        "relationship_keys": ["recommendation_id", "device_id", "case_id", "incident_id"],
        "current_employee": CURRENT_EMPLOYEE,
        "current_employee_device": CURRENT_EMPLOYEE_DEVICE,
    }
    meta_path = DATA_DIR / "manifest.json"
    meta_path.write_text(json.dumps(meta, indent=2))
    shutil.copy(meta_path, PUBLIC_DATA_DIR / "manifest.json")
    print(f"\nDone. Exported to {DATA_DIR} and {PUBLIC_DATA_DIR}")



if __name__ == "__main__":
    main()
