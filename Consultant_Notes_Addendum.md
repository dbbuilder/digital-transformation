# Consultant Notes Addendum
**Date:** 2025-10-17  
**Purpose:** Internal guide for architects and consultants delivering the ServiceVision Dual-Path Transformation.

---

## A. Advisory Approach
- Maintain **AI-Free parity** as baseline before enabling AI.
- Validate **data contracts** and **lineage** pre-AI activation.
- Require human-in-the-loop for any generative output affecting business logic.

---

## B. Technical Implementation Standards
| Area | Standard | Tooling |
|------|-----------|----------|
| IaC | Terraform/Bicep, modular | GitHub Actions, Azure DevOps |
| API | Stored procedures via Dapper/SP calls | .NET Core, Azure Functions |
| Data | dbt/ADF, Purview lineage, contracts | Azure SQL, Fabric, Synapse |
| ML Ops | Model registry, eval harness, CI/CD | Azure ML, MLFlow |
| Observability | Unified traces UI→API→DB→Model | App Insights, Log Analytics |

---

## C. Decision Framework Usage
1. Score each tier (1–5) for readiness.
2. AI-Free path is default if:
   - Data quality <3
   - Compliance incomplete
   - Model governance absent
3. Move to AI-Included path after:
   - Contracts, lineage, telemetry live
   - Security/PII guardrails validated

---

## D. Governance Integration
- Architecture Review Board sign-off per phase.
- Risk reviews bi-weekly.
- FinOps tracking with predictive alerts.
- Post-deployment eval metrics stored in Purview.

---

## E. Deliverable Handover Checklist
- ✅ Updated architecture diagrams
- ✅ Contracts + lineage in Purview
- ✅ Deployment scripts
- ✅ Observability dashboards
- ✅ Risk register and eval metrics

---

## F. Communication Cadence
- Exec Steering: bi-weekly
- PM Sync: weekly
- Tech Stand-up: daily
- Risk/AI Governance: monthly

---

## G. Templates and Tools
Use generated playbook, interview CSVs, decision and roadmap workbooks.  
Future versions will include Power BI dashboards for KPI tracking.

---
**End of Consultant Notes**
