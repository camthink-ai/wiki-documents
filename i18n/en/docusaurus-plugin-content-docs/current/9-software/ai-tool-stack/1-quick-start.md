---
sidebar_label: "Quick Start"
sidebar_position: 1
description: "Requirements, Docker deployment steps and common environment variables for AIToolStack."
---
# Quick Start (Docker)

### Prerequisites

**Docker & docker-compose**: Please refer to the [Docker official installation guide](https://docs.docker.com/get-docker/) and [docker-compose installation documentation](https://docs.docker.com/compose/install/) for installation. Ensure that the server or computer deploying AI Tool Stack has a basic Docker environment.

### AI Tool Stack Installation

**1. Clone Repository**

```sh
git clone https://github.com/camthink-ai/AIToolStack.git
cd AIToolStack
```

**2. Deploy with Docker**

> **Note**: To modify parameters such as `MQTT_BROKER_HOST`, please edit the environment variables in `docker-compose.yml`. Ensure that the MQTT service address can be accessed by NE301 devices, usually using the host's actual accessible IP address instead of localhost.

```sh
docker-compose build
docker-compose up
```

### NE301 Development Environment Installation

To generate NE301-usable quantized model packages, AI Tool Stack must reference the NE301 project compilation environment. Please pull the image in advance:

```sh
docker pull camthink/ne301-dev:latest
```

### Installation Verification

#### AI Tool Stack Installation Verification

After installation, you can verify whether the AI Tool Stack service has started successfully through the following methods:

**Check Service Status**

Use the command below to ensure you can see services such as `camthink/aitoolstack:latest` running.

```sh
docker ps
```

**Access Frontend Webpage**

Enter the deployment server's IP address and corresponding port in the browser, default is `http://<your_server_ip>:8000` or `http://localhost:8000`. If you can access the AI Tool Stack Web interface, the deployment is successful.

#### NE301 Development Environment Installation Verification

**Check Service Status**

Use the command below to ensure you can see services related to `camthink/ne301-dev:latest` running.

```sh
docker ps
```

## Local Development (Optional)

To run frontend and backend separately for development:

```bash
cd frontend  && npm install && npm start
cd backend   && pip install -r requirements.txt && uvicorn main:app --reload
```

## Common Environment Variables

Full list: repository `docs/ENV.md`. Common entries:

| Variable | Default | Description |
|----------|---------|-------------|
| `MQTT_USE_BUILTIN_BROKER` | true | Use the built-in MQTT broker (set false for an external broker) |
| `MQTT_BROKER` | - | External broker hostname (required when built-in disabled) |
| `MQTT_BROKER_HOST` | - | Broker IP reachable by devices (use the server's actual IP) |
| `MQTT_PORT` / `MQTT_BUILTIN_PORT` | 1883 | MQTT port |
| `DATASETS_ROOT` | /app/datasets | Dataset storage path |
| `MAX_IMAGE_SIZE_MB` | 10 | Max upload size (MB) |
