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
