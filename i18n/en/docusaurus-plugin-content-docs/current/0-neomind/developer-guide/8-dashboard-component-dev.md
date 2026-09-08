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
  "category": "display",
  "global_name": "NeoMindTemperatureGauge",
  "export_name": "NeoMindTemperatureGauge",
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
    "type": "object",
    "properties": {
      "unit": { "type": "string", "description": "Temperature unit (°C, °F)", "default": "°C" },
      "minValue": { "type": "number", "description": "Minimum value on gauge", "default": -20 },
      "maxValue": { "type": "number", "description": "Maximum value on gauge", "default": 50 }
    }
  },
  "default_config": {
    "unit": "°C", "minValue": -20, "maxValue": 50
  }
}
```

> `config_schema` is **a single flat JSON Schema**: fields under `properties` automatically generate the settings form, their values go into the component's `config`, and they are **spread directly onto top-level props** (see the Props API below).

### 3. Edit bundle.js

```javascript
(function(global) {
  'use strict';
  var React = global.React;

  function TemperatureGauge(props) {
    // config_schema fields land directly on top-level props (unit / minValue / maxValue)
    var unit = props.unit || '°C';
    var min = props.minValue !== undefined ? props.minValue : -20;
    var max = props.maxValue !== undefined ? props.maxValue : 50;

    // Data values are resolved asynchronously via fetchData()
    // (the dataSource prop is the binding config, not resolved values)
    var state = React.useState(null);
    var value = state[0], setValue = state[1];
    React.useEffect(function() {
      if (!props.fetchData) return;
      props.fetchData().then(function(r) {
        setValue(r.value !== undefined ? r.value : null);
      });
    }, []);

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
                 color: 'var(--foreground)' }
      }, value !== null ? Number(value).toFixed(1) + unit : '--'),
      React.createElement('div', {
        style: { width: '80%', height: '6px', borderRadius: '3px',
                 background: 'var(--border)' }
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
| `id` | string | YES | Unique identifier. Lowercase with hyphens or underscores. Cannot match built-in widget IDs |
| `name` | object/string | YES | Display name. Supports i18n: `{"en": "Name", "zh": "名称"}` |
| `description` | object/string | YES | Widget description. Supports i18n |
| `icon` | string | NO | Lucide icon name (default: "Box") |
| `category` | string | NO | Free-form category string (default: "custom"). Built-in widgets use `indicator` / `chart` / `control` / `display` / `spatial` / `layout`; community components commonly use `display` / `device` / `visualization` |
| `global_name` | string | YES | JS global variable name. Common formats: `NeoMind_<Name>` or `<Name>PascalCase` (e.g. `NeoMind_MetricCard`, `NE101CameraPanel`) |
| `export_name` | string | NO | Export name (resolution order: `global[export_name]` → `global.default` → the global itself if it's a function; default "default") |
| `version` | string | NO | Semantic version (default: "1.0.0") |
| `author` | string | NO | Author name |
| `size_constraints` | object | YES | Grid size limits |
| `has_data_source` | boolean | YES | Whether widget accepts data source bindings |
| `max_data_sources` | number | NO | Maximum data sources (0 = none, omit = unlimited) |
| `has_device_binding` | boolean | NO | Whether the component supports **device binding** — when true, the component receives a `deviceContext` prop (device online state, latest metrics, etc.) and links with the device detail view |
| `device_type_filter` | string[] | NO | Paired with `has_device_binding`: restricts the bindable device types (e.g. `["ne101_camera"]`) |
| `has_display_config` | boolean | NO | Whether widget has display configuration |
| `has_actions` | boolean | NO | Whether widget sends commands (e.g., toggle) |
| `config_schema` | object | NO | JSON Schema for the widget's configuration (`properties` auto-generates the settings form) |
| `default_config` | object | NO | Default configuration values |

### Built-in Widget IDs (reserved, cannot be used)

`value-card`, `counter`, `metric-card`, `led-indicator`, `sparkline`, `progress-bar`, `line-chart`, `area-chart`, `bar-chart`, `pie-chart`, `toggle-switch`, `markdown-display`, `image-display`, `image-history`, `web-display`, `map-display`, `video-display`, `custom-layer`, plus the business components `agent-monitor-widget` and `ai-analyst`

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

A **single flat JSON Schema** (`type: "object"` + `properties`, optionally `ui_hints` for field order/visibility):

- Each entry under `properties` automatically generates a form control in the widget's settings panel
- User-entered values are stored in the component instance's `config` object and **spread directly onto top-level props** (`props.unit`, not `props.display.unit`)
- If the bundle exports custom `ConfigPanel` / `AdvancedPanel` components, they take priority for rendering the config UI

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

Props passed to your component by the renderer (`ComponentRenderer`), per the actual code:

```typescript
interface WidgetProps {
  config: Record<string, any>;        // Widget config object (values produced by config_schema forms)
  // config_schema.properties fields are ALSO spread onto top-level props:
  // e.g. a "unit" field in the schema is readable directly as props.unit
  dataSource: object | object[];      // Data source [binding config] (single object or array) — NOT resolved values!
  fetchData?: (options?: {            // Resolves the data sources (injected for community/extension components)
    timeRange?: number; limit?: number;
  }) => Promise<FetchResult | FetchResult[]>;
  deviceContext?: {                   // Injected when has_device_binding: true
    device: {                         // The bound device
      id: string; name: string; deviceType: string;
      status: 'online' | 'offline'; lastSeen: number;
      currentValues: Record<string, any>;   // Latest metric values
    };
    deviceType?: {                    // Device type definition (metrics/commands)
      name: string; deviceType: string;
      metrics: any[]; commands: any[];
    };
  };
  sendDeviceCommand?: (cmd: string,   // Device-bound components: send a command to the bound device
    params?: Record<string, unknown>) => Promise<any>;
  title: string;                      // Widget title
  editMode: boolean;                  // Whether the dashboard is in edit mode
  onConfigChange?: (fn: any) => void; // Config persistence callbacks
  onDataSourceChange?: (fn: any) => void;
}

interface FetchResult {               // fetchData return value
  value?: unknown;                    // latest mode: single current value
  series?: Array<{ timestamp: number; value: number }>;  // timeseries mode: time series
}
```

## CSS Variable Theming

**Never hardcode colors.** Use these design tokens (the actual variables from `web/src/index.css`):

| Variable | Usage |
|----------|-------|
| `var(--foreground)` | Primary text |
| `var(--muted-foreground)` | Secondary/muted text |
| `var(--background)` | Main background |
| `var(--card)` | Card background |
| `var(--border)` | Borders |
| `var(--color-success)` / `var(--color-success-bg)` | Positive/success |
| `var(--color-error)` / `var(--color-error-bg)` | Error/danger |
| `var(--color-warning)` / `var(--color-warning-bg)` | Warning |
| `var(--color-info)` / `var(--color-info-bg)` | Information |
| `var(--primary)` | Accent/primary color |
| `var(--chart-1)` … `var(--chart-6)` | Chart palette |

## Data Source Binding

When `has_data_source: true`, users bind metrics to your widget. Note: `props.dataSource` is the **binding config**; actual values are fetched via `props.fetchData()`:

### Single Value (Indicators)

```javascript
// fetchData() resolves to { value: <current value> }
props.fetchData().then(function(result) {
  var currentTemp = result.value;
});
```

### Time-Series (Charts)

```javascript
// With the data source in timeseries mode, fetchData() returns { series: [{timestamp, value}, ...] }
props.fetchData({ timeRange: 24, limit: 200 }).then(function(result) {
  (result.series || []).forEach(function(point) {
    // point.value, point.timestamp
  });
});
```

### Multi-source (Charts)

When `max_data_sources > 1`, `props.dataSource` is an array of binding configs and `fetchData()` returns a matching array of results:

```javascript
props.fetchData().then(function(results) {
  results.forEach(function(result, i) {
    var binding = props.dataSource[i];        // each binding's config
    var points = result.series || [];          // each binding's data
    // render each series...
  });
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

In the dashboard edit mode, open the **Add Component → Custom** tab and click **Import Component** to upload the ZIP file (see the [Dashboard User Guide](../user-guide/4-use-dashboard.md)).

### Method 3: Uninstall

```bash
neomind widget uninstall my-widget
```

## Using Components in Dashboards

```bash
# Check the component's config_schema first
neomind widget get my-widget

# Add to a dashboard (--components replaces ALL components, so --replace-all is
# required; to only append use `neomind dashboard add-components <ID> --components '[...]'
neomind dashboard update <DASHBOARD_ID> --replace-all --components '[{
  "id": "c1",
  "type": "my-widget",
  "title": "My Widget",
  "position": {"x": 0, "y": 0, "w": 4, "h": 3},
  "data_source": {
    "type": "device",
    "sourceId": "sensor-01",
    "property": "temperature"
  },
  "config": {"unit": "°C"}
}]'
```

## Complete Example: Line Chart Component

Here is a component that pulls a time series via `fetchData` and draws a simple SVG line chart:

```javascript
(function(global) {
  'use strict';
  var React = global.React;

  function SimpleLineChart(props) {
    var state = React.useState([]);
    var points = state[0], setPoints = state[1];
    var strokeColor = props.color || 'var(--primary)';

    React.useEffect(function() {
      if (!props.fetchData) return;
      // With the data source in timeseries mode this resolves to { series: [{timestamp, value}, ...] }
      props.fetchData().then(function(result) {
        setPoints(result.series || []);
      });
    }, []);

    if (points.length < 2) {
      return React.createElement('div', {
        style: { width: '100%', height: '100%',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 color: 'var(--muted-foreground)' }
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

Corresponding manifest.json (`config_schema` is a flat JSON Schema; the `color` field appears at the top level of props):

```json
{
  "id": "simple-line-chart",
  "name": { "en": "Simple Line Chart", "zh": "简单折线图" },
  "description": { "en": "A minimal SVG line chart" },
  "category": "chart",
  "global_name": "NeoMindSimpleLineChart",
  "size_constraints": {
    "min_w": 3, "min_h": 2,
    "default_w": 6, "default_h": 4
  },
  "has_data_source": true,
  "max_data_sources": 1,
  "has_display_config": true,
  "config_schema": {
    "type": "object",
    "properties": {
      "color": { "type": "string", "description": "Line color (CSS variable or hex)" }
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

## Practical Case Studies

This page is the component API reference. Real-world engineering examples:

- [Case Studies Overview](./case-studies/0-overview.md)
- [#6 metric_card](./case-studies/6-metric-card-component.md) — Starter component
- [#7 ne101_camera](./case-studies/7-ne101-camera-component/index.md) — Extension-linked embedded component (flagship)

---

*Last updated: 2026-09-08*
