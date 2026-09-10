---
description: "Engineering case studies — 7 selected real-world cases from 27 extensions + 6 components, with full engineering analysis"
keywords: [NeoMind, extension development, engineering case studies, best practices]
tags: [NeoMind, Developer Guide, Case Studies]
sidebar_label: Overview
---

# Case Studies Overview

This series is distinct from the [Extension API reference](../7-extension-development.md) and the [Dashboard Component API reference](../8-dashboard-component-dev.md) — those cover "what the API looks like and what it can do." This series focuses purely on **real engineering practice**: why a design was chosen, what pitfalls were hit, and how engineering standards are applied on the ground. Every case is selected from a real NeoMind ecosystem repository and audited by hand into a reproducible engineering write-up.

## The 7 Cases at a Glance

| # | Case | Type | Difficulty | Size | Key Value |
|---|------|------|-----------|------|-----------|
| 1 | [weather-forecast](./1-weather-forecast.md) | Data extension | Beginner | ~700 LOC | First-extension template (HTTP fetch + periodic metrics + React frontend) |
| 2 | [yolo-device-inference](./2-yolo-device-inference.md) | AI inference | Intermediate | ~1950 LOC | Lazy model loading / cross-session reuse / device camera integration |
| 3 | [yolo-video](./3-yolo-video-v2.md) | Streaming extension | Intermediate | ~3900 LOC | stream session + video-frame processing + VLM dashboard interop |
| 4 | [onvif-bridge](./4-onvif-bridge.md) | Protocol bridge | Intermediate | ~2700 LOC | IP camera / standard protocol integration (parallels NeoEyes) |
| 5 | [uink-rms-bridge](./5-uink-rms-bridge.md) | Protocol bridge | Intermediate | ~2250 LOC | Production-verified bridging |
| 6 | [metric_card](./6-metric-card-component.md) | Dashboard component | Beginner | ~400 LOC | Component template (value card + threshold / trend / unit) |
| 7 | [ne101_camera](./7-ne101-camera-component/index.md) | Extension + component interop | Flagship | ~2500-3500 LOC (8 sub-pages) | End-to-end deep tutorial |

## Reading Paths

Pick the shortest path for your role and goal:

- **Path 1 (Newcomer)**: [1](./1-weather-forecast.md) → [6](./6-metric-card-component.md) → [7](./7-ne101-camera-component/index.md) — Build intuition with the simplest extension and component, then tackle the end-to-end flagship case.
- **Path 2 (AI Engineer)**: [2](./2-yolo-device-inference.md) → [3](./3-yolo-video-v2.md) → [7](./7-ne101-camera-component/index.md) — From single-frame inference to video-stream processing, then full product integration.
- **Path 3 (Industrial Integrator)**: [4](./4-onvif-bridge.md) → [5](./5-uink-rms-bridge.md) → [7](./7-ne101-camera-component/index.md) — Two protocol-bridge cases as foundation, then a camera-grade product integration.
- **Path 4 (Component Developer)**: [6](./6-metric-card-component.md) → [7](./7-ne101-camera-component/index.md) → any extension case — Master the component paradigm first, then learn how to interop with extensions.

## Version Alignment Table

Case code is aligned with the source repository's release; the audit locks to a specific commit.

| Case | Source repo version | SDK version | Last audit |
|------|---------------------|-------------|------------|
| 1 weather-forecast | v2.7.6 | SDK 0.6 | 2026-06-22 |
| 2 yolo-device-inference | v2.7.6 | SDK 0.6 | 2026-06-22 |
| 3 yolo-video | v2.7.6 | SDK 0.6 | 2026-06-22 |
| 4 onvif-bridge | v2.7.6 | SDK 0.6 | 2026-06-22 |
| 5 uink-rms-bridge | v2.7.6 | SDK 0.6 | 2026-06-22 |
| 6 metric_card | v1.7.0 | — | 2026-06-22 |
| 7 ne101_camera | v2.14.9 | — | 2026-06-22 |

> Note: since the last audit the source repository has kept evolving — the current versions are weather-forecast 2.7.7, yolo-device-inference / yolo-video 2.7.8, and ne101_camera 2.14.12. Each case page's audit-time snapshot is pinned by the banner at the top of that page.

A case audit is triggered when the source repository cuts a release (manual, not automated).

## Component Source Format Note

> NeoMind Dashboard Components ship as **hand-written IIFE JavaScript** — the file is named `bundle.js`, but it is **not a compiled artifact**; it is human-authored source.
>
> Conventions:
>
> - Runtime dependencies are injected via `var React = window.React` + `var jsx = window.jsxRuntime.jsx` (React / JSX runtime are provided by the host page).
> - Full comments and reasonable line breaks are preserved; readability is close to plain source code — you can read it directly without a source map.
> - Current sizes: `metric_card` is 328 lines, `ne101_camera` is 2036 lines.
>
> Therefore the "key code walkthroughs" in cases 6 / 7 point directly at specific line numbers in `bundle.js` — readers can open the source file and follow along.

## Further Reading

- [Extension API reference](../7-extension-development.md) — API docs for extension traits, macros, capabilities, lifecycle, and ML model loading.
- [Dashboard Component API reference](../8-dashboard-component-dev.md) — API docs for component schema, data-source binding, and the render pipeline.
- [Shared Engineering Standards Appendix](./appendix-standards.md) — Engineering standards shared across all cases (code style, error handling, logging, testing, version alignment, etc.).

---

*Last updated: 2026-09-08*
