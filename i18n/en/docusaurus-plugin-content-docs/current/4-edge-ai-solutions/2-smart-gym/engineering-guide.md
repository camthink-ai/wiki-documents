---
title: Engineering Guide
sidebar_label: "Engineering Guide"
sidebar_position: 2
description: "Smart gym engineering implementation: scenarios and installation, BOM, network topology, NeoMind setup, camera installation, commissioning, business usage and data integration."
---

# Engineering Guide

This page is for implementation and integration engineers — the complete engineering process from equipment selection, deployment and commissioning through business usage and data integration.

## 1. Deployment Scenarios

Typical sites are **mid-size gyms, personal-training studios, and hotel/apartment gyms** — 10–20 people training simultaneously, dense equipment, mixed lighting. One NE503 camera covers the whole floor, with all analytics and data on-premises.

### Typical Environments

| Environment | Characteristics | How the solution adapts |
|---|---|---|
| Mid-size gym (primary) | equipment + free-weight zones, 2.8–4m ceilings | single ceiling camera covers 10–20 people; 2×2 tiling serves near and far fields |
| PT studio | small area, close targets, large movements | mount at the lower height limit; near-field pose covered by tiling |
| Hotel / apartment gym | concentrated usage windows, high turnover | auto member enrollment + visitor mode; time-of-day traffic stats |
| Large venue | one camera cannot cover everything | deploy one camera per zone, aggregate at the platform |

### Mounting Position

- **Height**: 2.5–3.5m ceiling mount, 15–30° downward tilt
- **Aim**: recommended **diagonal corner mount** — the frame cuts across the room covering **the main equipment area and the entrance** — the entrance ensures members are identified on arrival, the equipment area drives occupancy stats
- **Lens options**: if the standard lens doesn't cover the area (deep rooms / wider views needed), the NE503 supports **custom wider-FOV lenses** — contact CamThink for an on-site assessment
- **Avoid**: strong backlight from windows; pillars or pendant lights occluding key equipment
- **Night**: confirm lighting stays on; NE503 supports IR, but face recognition works best with visible light

![Mounting position: one ceiling-mounted NE503 covering the entrance and main equipment zones](/img/solutions/smart-gym/mounting-position-en.svg)

**Install verification**: before locking the bracket, check the live preview in the camera web UI — far-side members are recognizable (full skeletons), the entrance is in frame, no major occlusion.

## 2. Bill of Materials

| # | Item | Model / Spec | Qty | Purpose |
|---|---|---|---|---|
| 1 | [**NE503 AI camera**](https://www.camthink.ai/product/neoeyes-503/) | Hailo-15H 20 TOPS・PoE・4K+720p dual streams | 1 per zone | on-device pose/face/ReID inference |
| 2 | **NeoMind platform** (on the customer PC or the NE503) | Docker deployment, incl. gym-tracker extension | 1 set | device onboarding, pose/face inference, dashboards & reports |
| 3 | Gym installer package | `gym-suite-&lt;version&gt;.tar.gz` (from CamThink) | 1 | one-command install (image, models, manual) |
| 4 | Ethernet cables | Cat5e or better | as needed | camera PoE power + data uplink |

> Starter setup (single zone, ≤20 people): **1 × NE503 (PoE powered) + NeoMind on the customer PC or the NE503**. To grow, add one camera per zone and register it in the extension config (≤4 cameras per extension recommended).

## 3. Network Topology

```
┌────────┐  PoE cable  ┌─────────────────────────┐
│ NE503  │────────────▶│ Customer host (NeoMind) │
│ cam ×N │     LAN     │ gym-tracker ext         │
└────────┘             └────────────┬────────────┘
                                    │ OpenAPI / Data Push
                            (optional)▶ business / CRM systems
```

General requirements:

- Camera and host on the **same LAN**; the host needs no public IP
- Bandwidth: video uses the 720p sub-stream (~2–4Mbps) per camera plus an event stream under 100KB/s — a regular LAN handles 4 cameras easily
- Power: cameras are PoE-powered from the customer-side network (PoE switch or injector) — no separate power cabling needed
- The camera uses self-signed HTTPS; set `tls_insecure: true` on the edge side
- All data stays on-premises; nothing is sent outside the venue unless you integrate a business system (see 4.6)

## 4. Building the Solution

Work in this order: platform first, then the extension bound to the camera, then the one-command camera install, then the four-link commissioning.

### 4.1 Deploy the Gym Application on the NE503


<div style={{ display: 'flex', justifyContent: 'center' }}>
  <img src="https://resources.camthink.ai/official-site/ne503/ne503.png" alt="NeoEyes NE503 edge AI camera" style={{ maxWidth: '46%', height: 'auto' }} />
</div>

#### 4.1.1 Bring the Camera Online (after physical install)

**Port & cabling** — plug the Ethernet cable into the PoE port on the camera body; the other end goes into the customer-side PoE switch or injector:

<div style={{ display: 'flex', justifyContent: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/hardware-guide/aipc-board-connection/terminal-block-annotation.png" alt="NE503 terminal block annotation (PoE port location)" style={{ maxWidth: '62%', height: 'auto' }} />
</div>

**Bring-online steps:**

1. Plug one end of the cable into the camera's PoE port until the clip clicks; the other end goes to the customer-side PoE switch / injector
2. Power the camera via PoE and wait ~2 minutes for boot
3. Find the camera IP from the router (or the CamThink discovery tool)
4. Browse to `https://&lt;camera-ip&gt;` (self-signed cert — click "proceed") — the camera web UI confirms it is online

#### 4.1.2 Initial Security Setup

1. Log in with the factory default: `admin / password`
2. **Top-right → System Settings → Change Password** — set a strong password and record it (the extension config uses it too)
3. Confirm firmware >= v1.0.2 on the system info page; if older, request a firmware package from [CamThink](https://www.camthink.ai/company/contact-us/) and upload it via web **System Upgrade** (~10 min, auto-restarts)

#### 4.1.3 Verify the View

1. Web home → **live preview**: confirm the frame covers the equipment area + entrance, no occlusion, adequate lighting at night
2. Adjust focus/tilt now if needed (see section 1 mounting guidance)

#### 4.1.4 One-Command App Install

**Where is the package:** it is the smart gym installer `gym-suite-&lt;version&gt;.tar.gz` from BOM item 3 — delivered by CamThink with the order. Copy it to any laptop **on the same network as the camera** (requires curl + python3 — Mac/Linux/Windows+WSL all work), then in that laptop's terminal:

**How to run:** extract the package → enter the folder → run the script (enter the camera IP and the new password set in 4.1.2 when prompted):

```bash
tar xzf gym-suite-1.0.0.tar.gz && cd gym-suite-1.0.0
./camera-install.sh &lt;camera-ip&gt; &lt;the new password from 4.1.2&gt;
```

The script runs:

| Step | What | Time |
|---|---|---|
| 1 | Login to the camera API | under 1s |
| 2 | Check firmware version | under 1s |
| 3 | Upload models (pose S/M HEF tiers) | ~10s |
| 4 | Upload and install the app container image | ~15s |
| 5 | Start the app | ~2s |
| 6 | Health check (wait for stream + fps stats) | ~40s |

Success looks like:

```
Install OK! Producer running: stats: 19.8 fps
```

The script is idempotent — re-running performs an overwrite upgrade without touching member data.

#### 4.1.5 App Management (web UI)

After installation, manage the app from camera web → **Apps**:

- **Status**: running / installed
- **Logs**: open gym-native for live logs — `stats: xx fps, pub ok` is the healthy heartbeat
- **Stop/Start**: one click, no SSH
- **Uninstall**: removes the app (model files are kept)


### 4.2 Install the NeoMind Platform (customer PC or NE503)

NeoMind can run on the **customer's own PC** — any Linux server or Mac mini (Docker, 4GB+ RAM) — or **directly on the NE503**. 

**Option A: Docker Compose (recommended)**

```bash
# 1. Confirm Docker is installed 
docker --version

# 2. Use the compose file from the installer package (or the NeoMind repo)
cd gym-suite-1.0.0/edge/
docker compose up -d

# 3. Wait for the first image pull and startup (~1-2 min)
docker compose logs -f neomind    # ready when you see "listening on 0.0.0.0:9375"
```

**Option B: One-line install script**

```bash
curl -fsSL https://get.neomind.camthink.ai | sh
```

**First-time setup:**

1. Browse to `http://&lt;host-ip&gt;:9375`
2. Register the admin account (email + password — keep it safe: platform encryption keys derive from it)
3. Confirm the "Extensions" page in the left navigation opens correctly

Full platform installation details (manual deploy / HTTPS reverse proxy / volume backup): see [Install & Upgrade](/docs/neomind/user-guide/install-setup).

### 4.3 Install the Gym Extension and Bind the Camera

**Install the extension (two ways):**

- **Local import (offline delivery)**: platform web → **Extensions → Import** → select `gym-tracker-*.nep` from the package → it appears in the extension list after import
- **Marketplace (online)**: platform web → **Extension Marketplace** → search "Gym Tracker" → Install (available once the extension is published)

![Extension marketplace: one-click Gym Tracker install](/img/solutions/smart-gym/extension-marketplace.webp)

*Marketplace: search "Gym Tracker" and install in one click; offline delivery uses Upload Extension*

![Upload extension: drop the .nep package to install](/img/solutions/smart-gym/extension-upload.webp)

*Offline delivery: the Upload Extension dialog — drop or pick the `.nep` package, Upload & Install*

**Configure the camera connection:**

1. Open gym-tracker **config** from the extension list
2. Fill in the camera connection:

```yaml
device:
  host: 192.168.x.x        # camera IP (check the router, or use the CamThink discovery tool)
  username: admin
  password: &lt;camera password&gt;
  tls_insecure: true       # camera self-signed cert — keep true
```

3. Save; the extension turns green within ~5s once the camera event stream (WSS) connects
4. If it keeps flipping red: verify the camera IP is reachable (`ping &lt;camera-ip&gt;`) and the password is correct

![Extension detail: run state and health](/img/solutions/smart-gym/extension-detail.webp)

*Extension detail: Running (Isolated) state, health check, Config / Commands / Metrics / Logs tabs*

![Extension config: UI language and privacy options](/img/solutions/smart-gym/extension-config.webp)

*Extension config: UI language (English default), face-mosaic default, Save Reload*

**UI language**: extension dashboards default to English; set `ui.language: zh` in the extension config for Chinese.

Multi-camera: add more `device` entries in the config, after each camera has completed 4.3.

### 4.4 Commissioning (Four-Link Verification)

Verify in order; if a link fails, debug that link first:

1. **Streaming**: camera web → Apps → gym-native shows `stats: xx fps` (≥15) — on-camera inference healthy
2. **Events**: the platform extension is green with no reconnect alerts — the event stream reaches the platform
3. **Detection**: walk into frame and wave; skeleton + bbox appear within 1s — the tracking chain works
4. **Recognition**: face the camera 3s → an "unrecognized person" card appears → register a name → the name shows on the next appearance — the recognition chain works

All four green = site acceptance passed.

### 4.5 Data Storage & Display

- **Member library / zone config / training records**: stored in the NeoMind host data volume, auto-backed up daily; the camera holds no persistent business data — replacing a camera is just a re-install
- **Video**: the dashboard live view uses the camera 720p sub-stream; the platform does not store raw video
- **Dashboards**: recommended trio — live headcount & occupancy overview, equipment-zone utilization, member training report entry; see [Using Dashboards](/docs/neomind/user-guide/use-dashboard)

![Smart gym dashboard: live monitoring and equipment occupancy](/img/solutions/smart-gym/dashboard-top.webp)

*Dashboard top: live video (skeleton/boxes/zone overlay), equipment occupancy panel (0/15 busy), workout summary, traffic trend*

![Smart gym dashboard — full view](/img/solutions/smart-gym/dashboard-full.webp)

*Full dashboard: door flow, heatmap, trails, alerts (fall suspects), member visits, live headcount*

### 4.6 Data Forwarding (optional)

To integrate a member-management system / video wall / mini-program, choose by real-time needs:

| Method | Description | Fits |
|---|---|---|
| **Data Push** | pushes selected data (check-in events, training summaries) to business HTTP endpoints in real time, with retries | live walls, door integration |
| **OpenAPI pull** | business systems pull data on a schedule via REST API | daily/weekly reporting |

- Configuration: [Data Push](/docs/neomind/user-guide/7c-data-push) / [Platform API](/docs/neomind/developer-guide/rest-api)
- **Field mapping example**: member ↔ member ID + name; arrival/departure ↔ event timestamps; training detail ↔ exercise × reps; equipment usage ↔ zone name + duration

## 5. Business Usage

### 5.1 Member Enrollment (face)

1. The member walks naturally in front of the camera for 1–3s (1–3m, front face best)
2. An "unrecognized person" card appears on the dashboard → click → enter name / phone → save
3. From then on the member is recognized automatically (after front-face registration, side views and lowered heads also work)
4. Bulk import of member photos is available from the admin console (contact CamThink)

Privacy note: the system stores only irreversible face **feature vectors**, never raw footage; admins can delete a member and all their data with one click.

### 5.2 Equipment Zone Configuration

1. Dashboard → **Zones → New zone**
2. Draw the zone on the video snapshot and name it (e.g. "Treadmill 1", "Dumbbell Area"); rectangles and polygons supported
3. Changes take effect immediately; usage starts when a person's foot points stay in a zone ≥3s (passing-by is filtered)
4. Per zone the system reports: current occupancy, session duration, daily utilization, time-of-day distribution

Tuning tip: prefer smaller zones — overlapping adjacent zones double-count people standing between two machines.

### 5.3 Training Reports

- **Per member**: every session automatically produces a breakdown (duration, equipment, exercises and rep counts) with comparable history
- **Per venue**: headcount curve, equipment occupancy ranking, time-of-day traffic — the basis for class scheduling and floor patrols
- Rep counting: squat, bench press, bicep curl, row and other built-in exercises are counted by joint-angle state machines; partial-range reps are not counted

### 5.4 Optional Tuning

| Symptom | Adjustment |
|---|---|
| Occasional flickering boxes | raise `confidence_threshold` 0.6 → 0.7 in `GYM_POSE_VARIANT_JSON` |
| Missing far-field small targets | contact CamThink to tune tiling parameters (2×2 coverage ratio / refresh cadence) |
| Noticeable skeleton lag | check bandwidth; confirm the sub-stream is in use |

## 6. Daily Operations

### 6.1 Self-Healing (no human action)

| Fault | System behavior | Recovery |
|---|---|---|
| Stream hiccup | auto-reconnect | seconds |
| Stream dead over 30s | app auto-restarts (built-in watchdog) | ~2 min |
| Camera / host power cycle | app and platform auto-start, data preserved | ~30s |

### 6.2 When to Intervene

| Symptom | Action |
|---|---|
| No dashboard data over 10 min | camera web → Apps → gym-native → Stop/Start |
| Video stutter | check bandwidth and network; confirm sub-stream |
| Camera unreachable | check PoE power; power-cycle the camera |
| Need logs | camera web → Logs → gym-native |

All camera-side operations go through the HTTPS API (no SSH). Log keyword quick reference:

| Log keyword | Meaning | Action |
|---|---|---|
| `stats: xx fps, pub ok` | healthy heartbeat | none |
| `stream watchdog — exiting(1)` | self-healing from stream loss | wait 2 min; if recurring, check the network |
| `HAILO_TIMEOUT / VDevice` | NPU anomaly | restart the app; if recurring, contact support |

### 6.3 Upgrades

- **App upgrade**: re-run `camera-install.sh` with the new package (overwrite, ~2 min, member data preserved)
- **Firmware upgrade**: camera web → System upgrade → upload the package (~10 min; installed apps are preserved)

## 7. Performance & Specifications

| Metric | Value |
|---|---|
| Detection frame rate | ~20fps (720p sub-stream, rotating 2×2 tiling) |
| Full-field refresh | ~200ms |
| Face recognition latency | within 1s |
| Coverage per camera | 10–20 members, mid-size venue |
| Self-healing | stream loss \~2 min; power loss \~30s |
| Bandwidth per camera | video 2–4Mbps + event stream under 100KB/s |

Recognition and statistics accuracy depend on lighting, crowd density and occlusion — validate on site at deployment.

## 8. Support

- **Community**: [Discord](https://discord.gg/a8NbPGAJw9) / [GitHub Discussions](https://github.com/camthink-ai/community/discussions)
- **Customization & volume deployment**: [contact us](https://www.camthink.ai/company/contact-us/) — the CamThink support team will follow up
- **Exercise library extension / multi-venue aggregation / CRM integration**: same channel; include venue size and your existing member system

## Learn More

- [Solution Description](/docs/edge-ai-solutions/smart-gym/solution-description)
- [NeoEyes NE503 Overview](/docs/neoeyes-ne503-series/overview)
- [NeoMind Platform Docs](/docs/neomind/product-overview/what-is-neomind)
- gym-tracker extension open-source repo: [github.com/camthink-ai/NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions)
