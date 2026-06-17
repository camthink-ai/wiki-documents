---
description: "NeoMind dashboard component development guide: ZIP package structure, complete manifest.json reference, bundle.js IIFE format, component Props API, CSS variable theming, data source binding, complete Temperature Gauge example, installation and debugging."
keywords: [NeoMind, Dashboard, component development, widget, IIFE, React, CSS variables]
tags: [NeoMind, Developer Guide]
sidebar_label: "Dashboard Component Dev"
---

# Dashboard Component Development

This page covers how to build a NeoMind dashboard custom component from scratch — from ZIP package structure to IIFE bundle.js, through installation and debugging. By the end you can write your own visualization components.

> **Pure frontend** — no Rust backend code needed. Components use the IIFE JavaScript format, executed directly in the browser.

## Architecture Overview

```
Your Component (ZIP)
├── manifest.json        ← Metadata + config schema
└── bundle.js            ← IIFE React component

Installation Flow:
  ZIP → API upload → data/frontend-components/{id}/
                    → manifest.json + bundle.js on disk

Rendering Flow:
  Dashboard → ComponentRegistry → loads bundle.js via <script>
           → IIFE assigns to window[global_name]
           → ComponentRenderer calls the function with props
```

Key characteristics:

- **IIFE format** — no build tools required, runs directly in the browser
- **React runtime provided** — uses `window.React` from the dashboard shell, don't bundle React
- **CSS variable theming** — automatic light/dark mode support
- **ZIP packaging** — simple `manifest.json` + `bundle.js` structure

## Quick Start

### 1. Scaffold

```bash
neomind widget create "Temperature Gauge" --widget-type gauge
```

This creates a `temperature-gauge/` directory with template files.

### 2. Edit manifest.json

```json
{
  "id": "temperature-gauge",
  "name": { "en": "Temperature Gauge", "zh": "温度表" },
  "description": { "en": "Displays temperature with min/max range" },
  "icon": "thermometer",
  "category": "indicators",
  "global_name": "NeoMindTemperatureGauge",
  "export_name": "default",
  "version": "1.0.0",
  "size_constraints": {
    "min_w": 2, "min_h": 2,
    "default_w": 3, "default_h": 3,
    "max_w": 6, "max_h": 6
  },
  "has_data_source": true,
  "max_data_sources": 1,
  "has_display_config": true,
  "config_schema": {
    "display": {
      "type": "object",
      "properties": {
        "unit": { "type": "string", "description": "Temperature unit (°C, °F)" },
        "minValue": { "type": "number", "description": "Minimum value on gauge" },
        "maxValue": { "type": "number", "description": "Maximum value on gauge" }
      }
    },
    "config": { "type": "object", "properties": {} }
  },
  "default_config": {
    "display": { "unit": "°C", "minValue": -20, "maxValue": 50 }
  }
}
```

### 3. Edit bundle.js

```javascript
(function(global) {
  'use strict';
  var React = global.React;

  function TemperatureGauge(props) {
    var value = props.dataSource && props.dataSource[0]
      ? props.dataSource[0].value : null;
    var display = props.display || {};
    var unit = display.unit || '°C';
    var min = display.minValue !== undefined ? display.minValue : -20;
    var max = display.maxValue !== undefined ? display.maxValue : 50;
    var pct = value !== null
      ? Math.max(0, Math.min(100, (value - min) / (max - min) * 100))
      : 0;

    return React.createElement('div', {
      style: { width: '100%', height: '100%', display: 'flex',
               flexDirection: 'column', alignItems: 'center',
               justifyContent: 'center', gap: '0.5rem' }
    },
      React.createElement('div', {
        style: { fontSize: '2.5rem', fontWeight: 'bold',
                 color: 'var(--color-text-primary)' }
      }, value !== null ? value.toFixed(1) + unit : '--'),
      React.createElement('div', {
        style: { width: '80%', height: '6px', borderRadius: '3px',
                 background: 'var(--color-border)' }
      },
        React.createElement('div', {
          style: { width: pct + '%', height: '100%', borderRadius: '3px',
                   background: 'var(--color-success)',
                   transition: 'width 0.3s ease' }
        })
      )
    );
  }

  global['NeoMindTemperatureGauge'] = TemperatureGauge;
})(window);
```

### 4. Package and Install

```bash
cd temperature-gauge
zip -r ../temperature-gauge.zip manifest.json bundle.js
neomind widget install ../temperature-gauge.zip
```

### 5. Verify

```bash
neomind widget list                    # Should show temperature-gauge
neomind widget get temperature-gauge   # Check full manifest
```

## manifest.json Complete Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | YES | Unique identifier. Lowercase, hyphens only. Cannot match built-in widget IDs |
| `name` | object/string | YES | Display name. Supports i18n: `{"en": "Name", "zh": "名称"}` |
| `description` | object/string | YES | Widget description. Supports i18n |
| `icon` | string | NO | Lucide icon name (default: "Box") |
| `category` | string | YES | One of: `indicators`, `charts`, `controls`, `display`, `spatial`, `business`, `custom` |
| `global_name` | string | YES | JS global variable name. Convention: `NeoMind{PascalCaseId}` |
| `export_name` | string | NO | Export method (default: "default") |
| `version` | string | NO | Semantic version (default: "1.0.0") |
| `author` | string | NO | Author name |
| `size_constraints` | object | YES | Grid size limits |
| `has_data_source` | boolean | YES | Whether widget accepts data source bindings |
| `max_data_sources` | number | NO | Maximum data sources (0 = none, omit = unlimited) |
| `has_display_config` | boolean | NO | Whether widget has display configuration |
| `has_actions` | boolean | NO | Whether widget sends commands (e.g., toggle) |
| `config_schema` | object | NO | JSON Schema for `display` and `config` fields |
| `default_config` | object | NO | Default configuration values |

### Built-in Widget IDs (reserved, cannot be used)

`value-card`, `led-indicator`, `sparkline`, `progress-bar`, `line-chart`, `area-chart`, `bar-chart`, `pie-chart`, `radar-chart`, `toggle-switch`, `markdown-display`, `image-display`, `image-history`, `web-display`, `map-display`, `video-display`, `custom-layer`, `agent-monitor-widget`, `ai-analyst`

### size_constraints

The dashboard uses a 12-column grid. Specify min/default/max width and height in grid units:

```json
{
  "min_w": 2, "min_h": 2,
  "default_w": 4, "default_h": 3,
  "max_w": 12, "max_h": 8
}
```

### config_schema

Describes the fields your widget accepts:

- `display` — visual configuration set by users in the dashboard editor (unit, color, etc.)
- `config` — internal configuration (content for markdown, URL for web display, etc.)

## bundle.js IIFE Format

### Rules

1. **IIFE only** — no `import`, `require`, or ES modules
2. **`React.createElement` only** — JSX is not available
3. **Use `global.React`** — React is provided by the dashboard shell
4. **Root element fills container** — `width: '100%', height: '100%'`
5. **CSS variables for colors** — use `var(--color-*)` tokens
6. **Match `global_name`** — the global assignment must match manifest
7. **Keep small** — target under 50KB

### Skeleton Template

```javascript
(function(global) {
  'use strict';
  var React = global.React;

  function MyWidget(props) {
    // Your component implementation
    return React.createElement('div', {
      style: { width: '100%', height: '100%' }
    }, 'Hello');
  }

  // MUST match global_name in manifest.json
  global['NeoMindMyWidget'] = MyWidget;

})(window);
```

## Component Props API

```typescript
interface WidgetProps {
  config: Record<string, any>;        // Internal config from manifest config_schema
  display: Record<string, any>;       // Display config from manifest config_schema
  dataSource: Array<{                 // Data source values
    value: number | string;           // Current value
    timestamp: number;                // Unix timestamp (ms)
    label?: string;                   // Data source label
    values?: Array<{                  // Time-series (for charts)
      value: number;
      timestamp: number;
    }>;
  }>;
  id: string;                         // Component instance ID
  title: string;                      // Widget title
  type: string;                       // Widget type
  actions?: {                         // Command actions (if has_actions: true)
    sendCommand: (cmd: string, payload?: any) => void;
  };
}
```

## CSS Variable Theming

**Never hardcode colors.** Use these design tokens:

| Variable | Usage |
|----------|-------|
| `var(--color-text-primary)` | Primary text |
| `var(--color-text-secondary)` | Secondary text |
| `var(--color-text-muted)` | Muted/hint text |
| `var(--color-bg-primary)` | Main background |
| `var(--color-bg-secondary)` | Card background |
| `var(--color-border)` | Borders |
| `var(--color-success)` | Positive/success |
| `var(--color-error)` | Error/danger |
| `var(--color-warning)` | Warning |
| `var(--color-info)` | Information |
| `var(--color-accent)` | Accent/highlight |

## Data Source Binding

When `has_data_source: true`, users bind metrics to your widget.

### Single Value (Indicators)

```javascript
var currentTemp = props.dataSource[0].value;
```

### Time-Series (Charts)

```javascript
var history = props.dataSource[0].values || [];
history.forEach(function(point) {
  // point.value, point.timestamp
});
```

### Multi-source (Charts)

When `max_data_sources > 1`, `dataSource` is an array where each element is a separate series:

```javascript
props.dataSource.forEach(function(ds, i) {
  var label = ds.label || 'Series ' + (i + 1);
  var points = ds.values || [];
  // render each series...
});
```

> DataSourceId format: `device:{device_id}:{metric_name}` or `extension:{ext_id}:{metric_name}`. The dashboard editor's data source picker auto-lists all available metrics.

## Installation Methods

### Method 1: Local ZIP

```bash
cd my-widget && zip -r ../my-widget.zip manifest.json bundle.js
neomind widget install ../my-widget.zip
```

### Method 2: Web UI

In NeoMind's **Extensions** page, click **Install Widget** and upload the ZIP file.

### Method 3: Uninstall

```bash
neomind widget uninstall my-widget
```

## Using Components in Dashboards

```bash
# Check the component's config_schema first
neomind widget get my-widget

# Add to a dashboard
neomind dashboard update <DASHBOARD_ID> --components '[{
  "id": "c1",
  "type": "my-widget",
  "title": "My Widget",
  "position": {"x": 0, "y": 0, "w": 4, "h": 3},
  "data_source": {
    "type": "device",
    "sourceId": "sensor-01",
    "property": "temperature"
  },
  "display": {"unit": "°C"},
  "config": {}
}]'
```

## Complete Example: Line Chart Component

Here is a component that draws a simple SVG line chart from time-series data:

```javascript
(function(global) {
  'use strict';
  var React = global.React;

  function SimpleLineChart(props) {
    var ds = props.dataSource && props.dataSource[0];
    var points = (ds && ds.values) || [];
    var display = props.display || {};
    var strokeColor = display.color || 'var(--color-accent)';

    if (points.length < 2) {
      return React.createElement('div', {
        style: { width: '100%', height: '100%',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 color: 'var(--color-text-muted)' }
      }, 'Waiting for data...');
    }

    var w = 300, h = 100, pad = 10;
    var values = points.map(function(p) { return p.value; });
    var minV = Math.min.apply(null, values);
    var maxV = Math.max.apply(null, values);
    var range = maxV - minV || 1;
    var stepX = (w - pad * 2) / (points.length - 1);

    var pathData = points.map(function(p, i) {
      var x = pad + i * stepX;
      var y = h - pad - ((p.value - minV) / range) * (h - pad * 2);
      return (i === 0 ? 'M' : 'L') + x + ',' + y;
    }).join(' ');

    return React.createElement('svg', {
      width: '100%', height: '100%', viewBox: '0 0 ' + w + ' ' + h,
      preserveAspectRatio: 'none'
    },
      React.createElement('path', {
        d: pathData, fill: 'none',
        stroke: strokeColor, strokeWidth: 2
      })
    );
  }

  global['NeoMindSimpleLineChart'] = SimpleLineChart;
})(window);
```

Corresponding manifest.json:

```json
{
  "id": "simple-line-chart",
  "name": { "en": "Simple Line Chart", "zh": "简单折线图" },
  "description": { "en": "A minimal SVG line chart" },
  "category": "charts",
  "global_name": "NeoMindSimpleLineChart",
  "size_constraints": {
    "min_w": 3, "min_h": 2,
    "default_w": 6, "default_h": 4
  },
  "has_data_source": true,
  "max_data_sources": 1,
  "has_display_config": true,
  "config_schema": {
    "display": {
      "type": "object",
      "properties": {
        "color": { "type": "string", "description": "Line color (CSS variable or hex)" }
      }
    }
  }
}
```

## Debugging Tips

1. **Test in the browser first**: open the browser Console, directly define `window.NeoMindMyWidget = function(props) { ... }`, then add the component type in the dashboard to test
2. **console.log debugging**: add `console.log(props)` in the component body to see the actual data structure received
3. **Check global assignment**: verify `window.NeoMindMyWidget` is a function after the component loads
4. **ZIP structure**: `manifest.json` and `bundle.js` must be at the ZIP root level, not nested in a subfolder

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Widget not in library | IIFE didn't assign to global | Verify `global['{global_name}'] = Component` matches manifest |
| Renders blank | Root not filling container | Add `width: '100%', height: '100%'` to outer div |
| "Reserved ID" error | ID matches built-in | Check `neomind widget list`, choose different ID |
| Data not showing | Wrong data source field | Verify with `neomind device get <ID>` |
| Colors wrong | Hardcoded CSS | Use `var(--color-*)` variables |
| Install fails | Invalid ZIP structure | ZIP must have `manifest.json` + `bundle.js` at root |

## Next Steps

- Component data sources from devices → [Device Type Development](./6-device-type-development.md)
- Component data sources from extensions → [Extension Development](./7-extension-development.md)
- Dashboard API → [REST API — Dashboards](./4-rest-api.md#dashboards)

---

*Last updated: 2026-06-15*
