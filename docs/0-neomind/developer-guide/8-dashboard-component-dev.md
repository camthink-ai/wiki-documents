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

> `config_schema` 是**一份扁平的 JSON Schema**：`properties` 里的字段会在组件设置面板自动生成表单，值写入组件的 `config`，并**直接展开到顶层 props**（见下文 Props API）。

### 3. 编辑 bundle.js

```javascript
(function(global) {
  'use strict';
  var React = global.React;

  function TemperatureGauge(props) {
    // config_schema 里的字段直接挂在顶层 props 上（unit / minValue / maxValue）
    var unit = props.unit || '°C';
    var min = props.minValue !== undefined ? props.minValue : -20;
    var max = props.maxValue !== undefined ? props.maxValue : 50;

    // 数据值用 fetchData() 异步解析（dataSource prop 是绑定配置，不是解析后的数值）
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
| `id` | string | 是 | 唯一标识，小写+连字符或下划线，不能与内置组件 ID 冲突 |
| `name` | object/string | 是 | 显示名，支持 i18n：`{"en": "Name", "zh": "名称"}` |
| `description` | object/string | 是 | 描述，支持 i18n |
| `icon` | string | 否 | Lucide 图标名（默认 "Box"） |
| `category` | string | 否 | 自由字符串分类（默认 "custom"）。内置组件用 `indicator` / `chart` / `control` / `display` / `spatial` / `layout`，社区组件常用 `display` / `device` / `visualization` |
| `global_name` | string | 是 | JS 全局变量名，常见格式 `NeoMind_<Name>` 或 `<Name>PascalCase`（如 `NeoMind_MetricCard`、`NE101CameraPanel`） |
| `export_name` | string | 否 | 导出名（解析顺序：`global[export_name]` → `global.default` → global 本身是函数；默认 "default"） |
| `version` | string | 否 | 语义版本（默认 "1.0.0"） |
| `author` | string | 否 | 作者 |
| `size_constraints` | object | 是 | 网格尺寸限制 |
| `has_data_source` | boolean | 是 | 是否接受数据源绑定 |
| `max_data_sources` | number | 否 | 最大数据源数（0 = 无，省略 = 不限） |
| `has_device_binding` | boolean | 否 | 是否支持**设备绑定**——置 true 时组件会收到 `deviceContext` prop（设备在线状态、最新指标等），并与设备详情联动 |
| `device_type_filter` | string[] | 否 | 与 `has_device_binding` 搭配：限定可绑定的设备类型（如 `["ne101_camera"]`） |
| `has_display_config` | boolean | 否 | 是否有显示配置 |
| `has_actions` | boolean | 否 | 是否发送命令（如 toggle 开关） |
| `config_schema` | object | 否 | 组件配置的 JSON Schema（`properties` 自动生成配置表单） |
| `default_config` | object | 否 | 默认配置值 |

### 内置组件 ID（保留，不可使用）

`value-card`、`counter`、`metric-card`、`led-indicator`、`sparkline`、`progress-bar`、`line-chart`、`area-chart`、`bar-chart`、`pie-chart`、`toggle-switch`、`markdown-display`、`image-display`、`image-history`、`web-display`、`map-display`、`video-display`、`custom-layer`，以及业务组件 `agent-monitor-widget`、`ai-analyst`

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

一份**扁平的 JSON Schema**（`type: "object"` + `properties`，可带 `ui_hints` 控制字段顺序/可见性）：

- `properties` 里的每个字段会在组件设置面板自动生成表单控件
- 用户填写的值写入组件实例的 `config` 对象，并**直接展开到顶层 props**（`props.unit` 而非 `props.display.unit`）
- 若 bundle 导出了 `ConfigPanel` / `AdvancedPanel` 自定义组件，会优先使用它们渲染配置界面

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

渲染器（`ComponentRenderer`）传给组件的 props（以真实代码为准）：

```typescript
interface WidgetProps {
  config: Record<string, any>;        // 组件配置对象（config_schema 生成的表单值）
  // config_schema.properties 的字段还会直接展开到顶层 props：
  // 例如 schema 里有 "unit"，则 props.unit 可直接读取
  dataSource: object | object[];      // 数据源【绑定配置】（单对象或多对象数组）——不是解析后的数值！
  fetchData?: (options?: {            // 解析数据源（社区/扩展组件注入）
    timeRange?: number; limit?: number;
  }) => Promise<FetchResult | FetchResult[]>;
  deviceContext?: {                   // has_device_binding: true 时注入
    device: {                         // 绑定的设备
      id: string; name: string; deviceType: string;
      status: 'online' | 'offline'; lastSeen: number;
      currentValues: Record<string, any>;   // 最新指标值
    };
    deviceType?: {                    // 设备类型定义（指标/命令）
      name: string; deviceType: string;
      metrics: any[]; commands: any[];
    };
  };
  sendDeviceCommand?: (cmd: string,   // 设备绑定组件可用：向绑定设备发命令
    params?: Record<string, unknown>) => Promise<any>;
  title: string;                      // 组件标题
  editMode: boolean;                  // 是否处于编辑模式
  onConfigChange?: (fn: any) => void; // 持久化配置回调
  onDataSourceChange?: (fn: any) => void;
}

interface FetchResult {               // fetchData 的返回
  value?: unknown;                    // latest 模式：单个当前值
  series?: Array<{ timestamp: number; value: number }>;  // timeseries 模式：时间序列
}
```

## CSS 变量主题

**永远不要硬编码颜色**。使用以下设计令牌（与 `web/src/index.css` 中的真实变量一致）：

| 变量 | 用途 |
|------|------|
| `var(--foreground)` | 主要文字 |
| `var(--muted-foreground)` | 次要/提示文字 |
| `var(--background)` | 主背景 |
| `var(--card)` | 卡片背景 |
| `var(--border)` | 边框 |
| `var(--color-success)` / `var(--color-success-bg)` | 正向/成功 |
| `var(--color-error)` / `var(--color-error-bg)` | 错误/危险 |
| `var(--color-warning)` / `var(--color-warning-bg)` | 警告 |
| `var(--color-info)` / `var(--color-info-bg)` | 信息 |
| `var(--primary)` | 强调/主色 |
| `var(--chart-1)` … `var(--chart-6)` | 图表配色 |

## 数据源绑定

当 `has_data_source: true` 时，用户可以把指标绑定到组件。注意：`props.dataSource` 是**绑定配置**，实际取值要通过 `props.fetchData()`：

### 单值（指示器类）

```javascript
// fetchData() 返回 { value: <当前值> }
props.fetchData().then(function(result) {
  var currentTemp = result.value;
});
```

### 时间序列（图表类）

```javascript
// 数据源配置为 timeseries 模式时，fetchData() 返回 { series: [{timestamp, value}, ...] }
props.fetchData({ timeRange: 24, limit: 200 }).then(function(result) {
  (result.series || []).forEach(function(point) {
    // point.value, point.timestamp
  });
});
```

### 多数据源（多系列图表）

当 `max_data_sources > 1` 时，`props.dataSource` 是绑定配置数组，`fetchData()` 返回对应的结果数组：

```javascript
props.fetchData().then(function(results) {
  results.forEach(function(result, i) {
    var binding = props.dataSource[i];        // 每个绑定的配置
    var points = result.series || [];          // 每个绑定的数据
    // 渲染每个系列...
  });
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

在仪表板编辑模式打开 **Add Component → Custom** 页签，点击 **Import Component** 上传 ZIP 文件（见[仪表板使用指南](../user-guide/4-use-dashboard.md)）。

### 方式 3：卸载

```bash
neomind widget uninstall my-widget
```

## 在 Dashboard 中使用

```bash
# 先查看组件的 config_schema
neomind widget get my-widget

# 添加到 Dashboard（--components 会整体替换，必须配合 --replace-all；
# 只是追加组件则用 neomind dashboard add-components <ID> --components '[...]'
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

## 完整示例：折线图组件

以下是一个使用 `fetchData` 拉取时间序列并绘制简单折线图的组件：

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
      // 数据源为 timeseries 模式时返回 { series: [{timestamp, value}, ...] }
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

对应的 manifest.json（`config_schema` 是扁平 JSON Schema，`color` 字段会出现在 props 顶层）：

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

## 实战参考

本篇是组件 API 通用参考。真实工程案例：

- [工程实践案例集 · 总览](./case-studies/0-overview.md)
- [#6 metric_card](./case-studies/6-metric-card-component.md) — 入门组件
- [#7 ne101_camera](./case-studies/7-ne101-camera-component/index.md) — 扩展联动嵌入式组件（旗舰案例）

---

*最后更新: 2026-09-08*
