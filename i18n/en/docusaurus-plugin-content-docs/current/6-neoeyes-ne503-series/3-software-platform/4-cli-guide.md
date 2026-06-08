---
description: Complete reference for the NE503 aipc-cli command-line tool, covering 12 command groups including application management, model management, device control, stream management, event bus, media configuration, system management, file management, log viewing, resource monitoring, plugin management, event logging, process management, and shell completion.
keywords: [aipc-cli, CLI tool, NE503 command line, application management, device control, model management, event bus, system management]
tags: [CLI reference, NE503, command line tool, system management, device control]
---

# CLI Tool Reference

aipc-cli is the command-line management tool for the NE503 platform (current version 0.3.0), providing 12 command groups including application management, model management, device control, stream management, event bus, and system management. It is available after logging into the device via SSH.

## 1. Global Parameters

All aipc-cli commands support the following global parameters:

| Parameter | Short | Description | Default |
|-----------|-------|-------------|---------|
| `--api` | | API server address | `http://localhost:8080` |
| `--output` | `-o` | Output format (table / json / yaml) | `table` |
| `--verbose` | `-v` | Show verbose output | `false` |
| `--app-manager` | | App Manager gRPC address | `unix:///run/aipc/app-manager.sock` |
| `--event-bus` | | Event Bus gRPC address | `unix:///run/aipc/event-bus.sock` |

```bash
aipc-cli app list -o json       # Output in JSON format
aipc-cli system info -o yaml    # Output in YAML format
```

---

## 2. app — Application Management

```bash
aipc-cli app list                                    # List all applications
aipc-cli app info <app-id>                           # View application details
aipc-cli app install <manifest> <image>              # Install an application
aipc-cli app start <app-id>                          # Start an application
aipc-cli app stop <app-id>                           # Stop an application
aipc-cli app restart <app-id>                        # Restart an application
aipc-cli app remove <app-id>                         # Uninstall an application
aipc-cli app update <app-id> <manifest> <image>      # Update application (preserves data)
aipc-cli app dev <app-id>                            # Development mode (hot reload)
aipc-cli app stats <app-id>                          # View resource statistics
aipc-cli app logs <app-id> [-f] [--tail N]           # View application logs
aipc-cli app exec <app-id> -- <command> [args...]    # Execute command inside container
```

**exec examples**:

```bash
aipc-cli app exec myapp -- /bin/sh                  # Enter container shell
aipc-cli app exec myapp -- ls -la /app              # List application directory
aipc-cli app exec myapp -u root -- cat /etc/os-release  # Execute as root
```

**update example**:

```bash
aipc-cli app update my-app app.yaml new-image.tar   # Hot update, preserves volume data
```

**dev mode example**:

```bash
aipc-cli app dev my-app    # Bind-mount host source code, auto-reload on file changes
```

---

## 3. model — Model Management

```bash
aipc-cli model list                                  # List all models
aipc-cli model info <model-id>                       # View model details
aipc-cli model register <model-path> [--id ID]       # Register a model
aipc-cli model unregister <model-id>                 # Unregister a model
aipc-cli model stats                                 # AI runtime statistics
```

---

## 4. device — Device Control

```bash
aipc-cli device status                               # View device status
aipc-cli device light <level>                        # White fill light (0-100)
aipc-cli device ir <on|off>                          # IR infrared light on/off
aipc-cli device ircut <auto|day|night>               # IR-Cut filter mode
aipc-cli device ptz <action> [speed]                 # PTZ pan-tilt control
aipc-cli device zoom <in|out|stop> [speed]           # Zoom control
aipc-cli device focus <near|far|auto|manual|stop>    # Focus control
aipc-cli device gpio <read|write> <pin> [value]      # GPIO read/write
```

**PTZ actions**: `left`, `right`, `up`, `down`, `stop`, `preset`, `save`

**focus subcommands** (5):

| Subcommand | Description |
|------------|-------------|
| `near` | Near focus |
| `far` | Far focus |
| `auto` | Auto focus |
| `manual` | Manual focus |
| `stop` | Stop focusing |

**Examples**:

```bash
aipc-cli device ptz left 50          # Rotate left at speed 50
aipc-cli device ptz preset 1         # Call preset position 1

> The `<id>` in `ptz preset <id>` is the preset position number (1-16), not a speed parameter.

aipc-cli device ptz save 1           # Save preset position 1
aipc-cli device zoom in 30           # Zoom in at speed 30
aipc-cli device focus auto           # Auto focus
aipc-cli device gpio read 12         # Read GPIO 12
aipc-cli device gpio write 21 1      # Set GPIO 21 output high
```

---

## 5. stream — Video Streams

```bash
aipc-cli stream list                                 # List all streams
aipc-cli stream info <stream-id>                     # View stream details
aipc-cli stream url <stream-id> [--format rtsp|hls]  # Get stream URL
```

The `--format` parameter supports `rtsp` (default) and `hls` formats.

---

## 6. event — Event Bus

```bash
aipc-cli event topics                                # List all topics
aipc-cli event info <topic>                          # View topic details
aipc-cli event stats [topic]                         # View statistics
aipc-cli event publish <topic> <json> [--source S]   # Publish event
aipc-cli event subscribe <topic> [-f] [--raw]        # Subscribe to events
```

**Examples**:

```bash
aipc-cli event publish app/alert '{"msg":"hello"}'       # Publish alert event
aipc-cli event subscribe 'model/*/detections' -f         # Wildcard subscription, real-time tracking
aipc-cli event subscribe app/test --raw --id my-sub      # Raw format subscription with custom subscription ID
```

---

## 7. media — Media Configuration

```bash
aipc-cli media config                                # View media configuration
aipc-cli media image [--brightness N] [--contrast N] # ISP image parameters
aipc-cli media encoder --stream <name> [--bitrate N] # Encoder parameters
aipc-cli media rtsp --enable|--disable               # Enable/disable RTSP
aipc-cli media ai-overlay --enable [--show-label]    # AI detection overlay
aipc-cli media osd <json-config>                     # On-screen display overlay
```

**encoder parameters**:

| Parameter | Description |
|-----------|-------------|
| `--stream` | Stream name (main / sub / third) |
| `--bitrate` | Bitrate |
| `--fps` | Frame rate |
| `--gop` | GOP group size |

---

## 8. system — System Management

```bash
aipc-cli system info                                 # View system information
aipc-cli system stats                                # View system statistics
aipc-cli system health                               # System health check
aipc-cli system status                               # View service status
aipc-cli system start                                # Start all services
aipc-cli system stop                                 # Stop all services
aipc-cli system restart                              # Restart all services
aipc-cli system enable                               # Enable auto-start on boot
aipc-cli system disable                              # Disable auto-start on boot
```

---

## 9. files — File Management

```bash
aipc-cli files list [path]                           # List files
aipc-cli files get <path>                            # Read file content
aipc-cli files put <path> <content>                  # Write file
aipc-cli files upload <local> <remote>               # Upload file
aipc-cli files download <remote> [local]             # Download file
aipc-cli files delete <path>                         # Delete file
aipc-cli files mkdir <path>                          # Create directory
aipc-cli files rename <old> <new>                    # Rename file or directory
```

---

## 10. logs — Log Viewing

```bash
aipc-cli logs services                               # List all services
aipc-cli logs files                                  # List log files
aipc-cli logs show [service] [--lines N] [--level L] # View logs
aipc-cli logs download <file>                        # Download log file
```

---

## 11. monitor — Resource Monitoring

```bash
aipc-cli monitor summary                             # Resource overview
aipc-cli monitor cpu                                 # CPU usage
aipc-cli monitor memory                              # Memory usage
aipc-cli monitor disk                                # Disk usage
aipc-cli monitor network                             # Network statistics
```

---

## 12. plugin — Plugin Management

```bash
aipc-cli plugin list                                 # List all plugins
aipc-cli plugin info <app-id>                        # View plugin details
aipc-cli plugin capabilities                         # List all capabilities
aipc-cli plugin check <app-id>                       # Check plugin dependencies
```

---

## 13. event-log — Event Logging

```bash
aipc-cli event-log list [--category C] [--level L]   # List event logs
aipc-cli event-log stats                             # View statistics
aipc-cli event-log cleanup [--days N]                # Clean up historical logs
```

---

## 14. process — Process Management

```bash
aipc-cli process list [--sort cpu|mem|pid]           # List processes
aipc-cli process info <pid>                          # View process details
aipc-cli process kill <pid> [--signal SIGTERM]       # Terminate process
```

---

## 15. Other Features

### Shell Completion

```bash
source <(aipc-cli completion bash)                   # Bash completion
source <(aipc-cli completion zsh)                    # Zsh completion
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `AIPC_API` | API server address |
| `AIPC_OUTPUT_FORMAT` | Output format (table / json / yaml) |
| `AIPC_VERBOSE` | Enable verbose output |

### Configuration File

The default configuration file is located at `~/.aipc/config.yaml`:

```yaml
grpc:
  app_manager: unix:///run/aipc/app-manager.sock
  ai_runtime: unix:///run/aipc/ai-runtime.sock
  event_bus: unix:///run/aipc/event-bus.sock
  device_control: unix:///run/aipc/device-control.sock
  timeout: 30s
output:
  format: table
  color: true
```

---

## 16. Related Documentation

- [Platform Architecture](./0-platform-architecture.md) — NE503 software platform architecture overview
- [Application Development Guide](./1-app-development.md) — Complete application development workflow
- [RESTful API Reference](./5-restful-api.md) — HTTP API interface reference
