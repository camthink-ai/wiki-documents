---
sidebar_label: "Limitations & Boundaries"
description: "Boundaries: environment, AI limits, hardware limits, recommended conditions."
---
# Limitations & Boundaries

## 5.1 Environmental Conditions

- Lighting: dark sites need fill light; glare/reflection hurts OCR
- Angle: lens must face the wheels squarely
- Occlusion: dirt/condensation requires cleaning
- Distance: stay within the bracket spec

## 5.2 AI Limitations

- Mid-carry wheel states may flip a digit — mitigate with a "two consecutive identical reads" rule
- Pointer-type dials are out of scope for this OCR flow
- Badly blurred/low-res images lower confidence (flagged by rules)

## 5.3 Hardware Limitations

- NE101: scheduled capture only (no video); frequency trades with battery
- Host throughput grows with meter count — split hosts for very large estates

## 5.4 Recommended Deployment Conditions

| Parameter | Recommended |
|---|---|
| Lens-to-dial distance | official bracket range |
| Angle | < 10° off-axis |
| Lighting | even ambient or fill light |
| Wheel share of frame | ≥ 1/3 |
| Capture frequency | 1–4/day (settlement needs) |

**Not Recommended**: pointer dials; unfixable glare; minute-level monitoring needs.
