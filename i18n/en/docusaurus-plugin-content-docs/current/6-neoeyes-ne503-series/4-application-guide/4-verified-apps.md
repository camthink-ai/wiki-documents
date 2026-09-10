---
id: verified-apps
title: NE503 Verified Apps
sidebar_position: 4
description: NE503 verified applications and deployment packages.
keywords: [NE503, Verified Apps, Person Detection, Occupancy Monitor, Safety Helmet, App Download]
tags: [NE503, App Deployment, Container App, Person Detection, Occupancy Monitor, Safety Helmet, Edge AI]
---

# NE503 Verified Apps

The apps below are verified on real NE503 hardware and can be downloaded for testing.

For models, see the [CamThink Model Zoo](https://www.camthink.ai/developer-center/models/); this page provides verified app packages.

## App List


| App | Scenario | Inference Model | Preview | Verification Result | Download |
|:-----|:-----|:--------:|:-------:|:-------:|:------:|
| Person Detection | Perimeter intrusion / area intrusion detection | hailo_yolov8n_384_640 | <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/pd-verify-04-detail.png" alt="Person Detection: app detail" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/pd-01-apps-running.png" alt="Person Detection: running status" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/pd-verify-03-statistics.png" alt="Person Detection: detection result" style={{width:'110px',borderRadius:'6px'}} /></div> | Continuously detected 3 persons · 4.26M+ frames · <span style={{color:'#4caf50'}}>✅ Passed</span> | <a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/person-detection.yaml" download style={{background:'#f3e5f5',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>app.yaml</a><br/><a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/person-detection.tar" download style={{background:'#e3f2fd',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>image.tar</a> |
| Occupancy Monitor | Area people counting + occupancy monitoring | hailo_yolov8n_384_640 | <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/pd-verify-04-detail.png" alt="Occupancy Monitor: app detail" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/occupancy-app-status.png" alt="Occupancy Monitor: app status" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/occupancy-detection-result.png" alt="Occupancy Monitor: detection result" style={{width:'110px',borderRadius:'6px'}} /></div> | Occupancy rate published periodically · frames 50→550 · <span style={{color:'#4caf50'}}>✅ Passed</span> | <a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/occupancy-monitor/occupancy-monitor.yaml" download style={{background:'#f3e5f5',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>app.yaml</a><br/><a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/occupancy-monitor/occupancy-monitor.tar" download style={{background:'#e3f2fd',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>image.tar</a> |
| Safety Helmet Detection | Construction safety PPE compliance — helmet / no-helmet detection with real-time alerts | safety_helmet_yolov8n_384_640 | <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/ne503-dashboard.jpeg" alt="Safety Helmet Detection: app status" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/sh-detection-detail.png" alt="Safety Helmet Detection: live detection" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/sh-app-running.png" alt="Safety Helmet Detection: detection result" style={{width:'110px',borderRadius:'6px'}} /></div> | Live detection of 9 persons (6 helmet + 3 no-helmet) · <span style={{color:'#4caf50'}}>✅ Passed</span> | <a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/safety-helmet-detection/safety-helmet-detection.yaml" download style={{background:'#f3e5f5',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>app.yaml</a><br/><a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/safety-helmet-detection/safety-helmet-detection.tar" download style={{background:'#e3f2fd',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>image.tar</a> |

---

## Deployment

After downloading app.yaml and image.tar, deploy through the Web Console:

Open Web Console → **App Management** → **Import** → **Upload Package**, upload `app.yaml` and `image.tar` separately, then click **Install**. After installation, click **Start** to launch the app.

![Deploy app: upload app.yaml and image.tar](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/upload-app.png)

:::note Model preloading required
Before first use, load the required model in Web Console **Model Management**:

- **Person Detection / Occupancy Monitor**: scan and load the preinstalled `hailo_yolov8n_384_640`.
- **Safety Helmet Detection**: import and load `safety_helmet_yolov8n_384_640` HEF; the app package does not include the model.

![Model preload: scan and load model](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/upload-model.png)
:::

> More app use cases are being adapted. For custom app development material, see [Resources](./3-resources.md).

---
