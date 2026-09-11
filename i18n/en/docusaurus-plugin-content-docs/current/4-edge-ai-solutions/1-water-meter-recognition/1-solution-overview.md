---
sidebar_label: "Solution Overview"
description: "Water-meter solution overview: what it is, the problem it solves, value and scenarios."
---
# Solution Overview

## 1.1 Solution Introduction

Automatic meter reading for water/electricity/gas meters: CamThink **NE101 low-power cameras** capture dials on schedule; NeoMind runs **on-host OCR** and pushes validated readings to business systems — replacing manual door-to-door reads.

- **What it is**: camera + edge-platform automatic meter-reading and data solution
- **Problem solved**: scattered meters, costly manual reads, smart-meter retrofit over budget
- **Who uses it**: water utilities, property managers, energy operators and their integrators
- **Outcome**: readings auto-ingested (accuracy up to 99%, site-dependent), every read archived with its snapshot

## 1.2 Solution Value

**Business**
- Fewer manual reads, lower labor cost
- Higher collection frequency (daily/weekly/monthly, configurable)
- Scales: adding meters only adds cameras

**Technical**
- On-host AI inference — no continuous cloud connection
- Capture → OCR → validation all local; minimal bandwidth
- Privacy: video never leaves the site, only structured readings leave

**Deployment**
- No meter swap, no outage works; fraction of retrofit cost
- Battery powered, no wiring — fits unpowered wells
- Small starter kit (≤10 meters: 10× NE101 + 1 host)

## 1.3 Application Scenarios

| Scenario | Description |
|---|---|
| Residential | Scattered stairwell/well meters, monthly settlement |
| Commercial Building | Master/sub-meter energy accounting |
| Factory | Workshop water/gas monitoring and anomaly detection |
| Utility | Wide-area survey reads and loss analysis |

## 1.4 Solution Benefits

| Item | Description |
|---|---|
| Problem | Manual reading: costly, low frequency, error-prone |
| AI Capability | Dial localization + digit OCR (on-host) |
| Input | NE101 scheduled snapshots |
| Output | Structured reading (metric + timestamp + snapshot) |
| Processing | Edge (on host) |
| Target Users | Utilities / property / operators & integrators |
| Main Benefit | Unattended reading with full audit trail |
