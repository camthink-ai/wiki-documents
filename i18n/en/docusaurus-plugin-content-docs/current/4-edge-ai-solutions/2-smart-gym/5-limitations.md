---
sidebar_label: "Limitations & Boundaries"
description: "Boundaries: environment, AI limits, hardware limits, recommended conditions."
---
# Limitations & Boundaries

## 5.1 Environmental Conditions

- Entrance backlight lowers counting accuracy
- Occlusion (beams/stacked equipment) causes misses; use two cameras to complement
- Mounting too low shrinks coverage; too high shrinks targets

## 5.2 AI Limitations

- Generic person model: no identity recognition or individual tracking (a design boundary — and a privacy feature)
- Dense overlapping crowds undercount
- Fall/behavior events need a custom model (official apps cover presence/occupancy)

## 5.3 Hardware Limitations

- 20 TOPS per camera: one zone per unit; split larger zones
- PoE required (no battery mode)

## 5.4 Recommended Deployment Conditions

| Parameter | Recommended |
|---|---|
| Entrance mount | top-down at the narrowest lane point |
| Zone coverage | 4–6 machines per camera |
| Height | 2.5–3.5 m |
| Lighting | normal store lighting; dark areas rely on AI-ISP |

**Not Recommended**: identifying *who* (individual identity); sites where PoE cabling is impossible.
