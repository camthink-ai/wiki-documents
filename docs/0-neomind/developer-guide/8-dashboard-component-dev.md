---
description: "NeoMind Dashboard 组件开发指南：ZIP 包结构、manifest.json 完整字段、bundle.js IIFE 格式、组件 Props API、CSS 变量主题、数据源绑定、Temperature Gauge 完整示例、安装与调试。"
keywords: [NeoMind, Dashboard, 组件开发, widget, IIFE, React, CSS变量]
tags: [NeoMind, 开发指南]
sidebar_label: "Dashboard Component Dev"
---

# Dashboard 组件开发

本文讲解如何从零开发一个 NeoMind Dashboard 自定义组件——从 ZIP 包结构到 IIFE bundle.js，再到安装和调试。读完你能写出自己的可视化组件。

> **纯前端**——无需写 Rust 后端代码。组件用 IIFE JavaScript 格式，浏览器直接执行。

## 架构概览

```
你的组件 (ZIP)
├── manifest.json        ← 元数据 + 配置 schema
└── bundle.js            ← IIFE 格式的 React 组件

安装流程：
  ZIP → API 上传 → data/frontend-components/{id}/
                    → manifest.json + bundle.js 落盘

渲染流程：
  Dashboard → ComponentRegistry → 通过 <script> 加载 bundle.js
           → IIFE 赋值到 window[global_name]
           → ComponentRenderer 以 props 调用该函数
```

关键特性：

- **IIFE 格式**——无需构建工具，浏览器直接运行
- **React 运行时由宿主提供**——用 `window.React`，不打包 React
- **CSS 变量主题**——自动适配亮色/暗色模式
- **ZIP 打包**——`manifest.json` + `bundle.js` 两个文件

## 快速开始

### 1. 创建脚手架

```bash
neomind widget create "Temperature Gauge" --widget-type gauge
```

这会创建一个 `temperature-gauge/` 目录，内含模板文件。

### 2. 编辑 manifest.json

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

### 3. 编辑 bundle.js

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

### 4. 打包安装

```bash
cd temperature-gauge
zip -r ../temperature-gauge.zip manifest.json bundle.js
neomind widget install ../temperature-gauge.zip
```

### 5. 验证

```bash
neomind widget list                    # 应能看到 temperature-gauge
neomind widget get temperature-gauge   # 查看完整 manifest
```

## manifest.json 完整参考

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 唯一标识，小写+连字符，不能与内置组件 ID 冲突 |
| `name` | object/string | 是 | 显示名，支持 i18n：`{"en": "Name", "zh": "名称"}` |
| `description` | object/string | 是 | 描述，支持 i18n |
| `icon` | string | 否 | Lucide 图标名（默认 "Box"） |
| `category` | string | 是 | 分类：`indicators` / `charts` / `controls` / `display` / `spatial` / `business` / `custom` |
| `global_name` | string | 是 | JS 全局变量名，约定格式 `NeoMind{PascalCaseId}` |
| `export_name` | string | 否 | 导出方式（默认 "default"） |
| `version` | string | 否 | 语义版本（默认 "1.0.0"） |
| `author` | string | 否 | 作者 |
| `size_constraints` | object | 是 | 网格尺寸限制 |
| `has_data_source` | boolean | 是 | 是否接受数据源绑定 |
| `max_data_sources` | number | 否 | 最大数据源数（0 = 无，省略 = 不限） |
| `has_display_config` | boolean | 否 | 是否有显示配置 |
| `has_actions` | boolean | 否 | 是否发送命令（如 toggle 开关） |
| `config_schema` | object | 否 | `display` 和 `config` 字段的 JSON Schema |
| `default_config` | object | 否 | 默认配置值 |

### 内置组件 ID（保留，不可使用）

`value-card`、`led-indicator`、`sparkline`、`progress-bar`、`line-chart`、`area-chart`、`bar-chart`、`pie-chart`、`radar-chart`、`toggle-switch`、`markdown-display`、`image-display`、`image-history`、`web-display`、`map-display`、`video-display`、`custom-layer`、`agent-monitor-widget`、`ai-analyst`

### size_constraints（网格尺寸）

Dashboard 使用 12 列网格。宽高以网格单元为单位：

```json
{
  "min_w": 2, "min_h": 2,
  "default_w": 4, "default_h": 3,
  "max_w": 12, "max_h": 8
}
```

### config_schema（配置 Schema）

描述组件接受的字段：

- `display`——用户在 Dashboard 编辑器中设置的视觉配置（单位、颜色等）
- `config`——内部配置（如 markdown 内容、web URL 等）

## bundle.js IIFE 格式

### 必须遵守的规则

1. **只能用 IIFE**——不能 `import`、`require`、ES module
2. **只能用 `React.createElement`**——不支持 JSX
3. **用 `global.React`**——React 由 Dashboard 宿主提供
4. **根元素填满容器**——`width: '100%', height: '100%'`
5. **颜色用 CSS 变量**——`var(--color-*)`
6. **`global_name` 必须匹配**——全局赋值与 manifest 中的 `global_name` 一致
7. **保持精简**——目标 50KB 以内

### 骨架模板

```javascript
(function(global) {
  'use strict';
  var React = global.React;

  function MyWidget(props) {
    // 组件实现
    return React.createElement('div', {
      style: { width: '100%', height: '100%' }
    }, 'Hello');
  }

  // 必须与 manifest.json 的 global_name 匹配
  global['NeoMindMyWidget'] = MyWidget;

})(window);
```

## 组件 Props API

```typescript
interface WidgetProps {
  config: Record<string, any>;        // 内部配置（来自 config_schema.config）
  display: Record<string, any>;       // 显示配置（来自 config_schema.display）
  dataSource: Array<{                 // 数据源值
    value: number | string;           // 当前值
    timestamp: number;                // Unix 时间戳（毫秒）
    label?: string;                   // 数据源标签
    values?: Array<{                  // 时间序列（图表用）
      value: number;
      timestamp: number;
    }>;
  }>;
  id: string;                         // 组件实例 ID
  title: string;                      // 组件标题
  type: string;                       // 组件类型
  actions?: {                         // 命令动作（has_actions: true 时可用）
    sendCommand: (cmd: string, payload?: any) => void;
  };
}
```

## CSS 变量主题

**永远不要硬编码颜色**。使用以下设计令牌：

| 变量 | 用途 |
|------|------|
| `var(--color-text-primary)` | 主要文字 |
| `var(--color-text-secondary)` | 次要文字 |
| `var(--color-text-muted)` | 提示文字 |
| `var(--color-bg-primary)` | 主背景 |
| `var(--color-bg-secondary)` | 卡片背景 |
| `var(--color-border)` | 边框 |
| `var(--color-success)` | 正向/成功 |
| `var(--color-error)` | 错误/危险 |
| `var(--color-warning)` | 警告 |
| `var(--color-info)` | 信息 |
| `var(--color-accent)` | 强调/高亮 |

## 数据源绑定

当 `has_data_source: true` 时，用户可以把指标绑定到组件。

### 单值（指示器类）

```javascript
var currentTemp = props.dataSource[0].value;
```

### 时间序列（图表类）

```javascript
var history = props.dataSource[0].values || [];
history.forEach(function(point) {
  // point.value, point.timestamp
});
```

### 多数据源（多系列图表）

当 `max_data_sources > 1` 时，`dataSource` 是数组，每个元素是一个独立系列：

```javascript
props.dataSource.forEach(function(ds, i) {
  var label = ds.label || 'Series ' + (i + 1);
  var points = ds.values || [];
  // 渲染每个系列...
});
```

> DataSourceId 格式：`device:{device_id}:{metric_name}` 或 `extension:{ext_id}:{metric_name}`。Dashboard 编辑器的数据源选择器会自动列出所有可用指标。

## 安装方式

### 方式 1：本地 ZIP

```bash
cd my-widget && zip -r ../my-widget.zip manifest.json bundle.js
neomind widget install ../my-widget.zip
```

### 方式 2：Web UI

在 NeoMind 的 **Extensions** 页点击 **Install Widget**，上传 ZIP 文件。

### 方式 3：卸载

```bash
neomind widget uninstall my-widget
```

## 在 Dashboard 中使用

```bash
# 先查看组件的 config_schema
neomind widget get my-widget

# 添加到 Dashboard
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

## 完整示例：折线图组件

以下是一个使用时间序列数据绘制简单折线图的组件：

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

对应的 manifest.json：

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

## 调试技巧

1. **先在浏览器里测**：打开浏览器 Console，直接定义 `window.NeoMindMyWidget = function(props) { ... }`，然后在 Dashboard 里添加该组件类型测试
2. **console.log 调试**：在组件函数体里 `console.log(props)` 看实际收到的数据结构
3. **检查全局赋值**：`window.NeoMindMyWidget` 在组件加载后是否为 function
4. **ZIP 结构**：`manifest.json` 和 `bundle.js` 必须在 ZIP 根目录，不能嵌套在子文件夹里

## 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 组件不在库中 | IIFE 没赋值到全局 | 检查 `global['{global_name}'] = Component` 与 manifest 是否匹配 |
| 渲染空白 | 根元素没填满容器 | 添加 `width: '100%', height: '100%'` |
| "Reserved ID" 错误 | ID 与内置组件冲突 | 查 `neomind widget list`，换一个 ID |
| 数据不显示 | 数据源字段不对 | 用 `neomind device get <ID>` 核对指标名 |
| 颜色不对 | 硬编码了 CSS 颜色 | 改用 `var(--color-*)` 变量 |
| 安装失败 | ZIP 结构错误 | 确认 `manifest.json` + `bundle.js` 在 ZIP 根目录 |

## 下一步

- 组件数据源来自设备 → [设备类型开发](./6-device-type-development.md)
- 组件数据源来自扩展 → [扩展开发实战](./7-extension-development.md)
- Dashboard API → [REST API — Dashboards](./4-rest-api.md)

---

*最后更新: 2026-06-15*
