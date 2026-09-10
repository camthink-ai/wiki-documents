---
description: "NeoMind 数据转换使用指南：用 JavaScript 代码实时转换设备遥测数据、生成派生指标、调用扩展命令，含转换构建器 UI、作用域、测试、CLI/API 管理与导入导出。"
keywords: [NeoMind, 数据转换, transform, JavaScript, 派生指标, 实时处理]
tags: [NeoMind, 用户指南]
sidebar_label: "Data Transforms"
sidebar_position: 7.5
---

# 数据转换

数据转换（Transform）让 NeoMind 在**设备数据写入后**自动加工遥测数据（由写入事件触发，毫秒级）——用一段 JavaScript 函数将原始指标转换为派生指标。例如：

- 摄氏度 → 华氏度
- 原始电压 + 电流 → 计算功率
- 设备在线状态 → 人类可读的状态文本
- 调用扩展命令处理数据（如 YOLO 检测 → 提取置信度）

转换后的派生指标可以像普通设备指标一样用于[仪表板](./4-use-dashboard.md)、[规则](./7-automation-rules.md)和 [AI Agent](./6-ai-agent.md)。

## 与规则的区别

| 维度 | 规则（Rules） | 数据转换（Transforms） |
|------|--------------|----------------------|
| 目的 | 条件判断 → 执行动作 | 数据加工 → 生成新指标 |
| 输出 | 通知 / 指令 / Agent 调用 | 新的遥测指标（可绑定到仪表板/规则） |
| 逻辑 | JSON 条件 + 动作 | JavaScript 代码 |
| 实时性 | 条件满足时触发 | 每条数据实时转换 |

## 界面概览

在自动化页面切换到 **Transforms** 页签：

<img src="https://resources.camthink.ai/NeoMind/v0923/automation-transforms.png" alt="数据转换页面 — 转换列表、作用域、代码摘要、启用状态" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

页面以表格形式展示所有转换，每行包含：

| 列 | 说明 |
|------|------|
| **名称** | 转换的显示名称 |
| **作用域** | Global（全局）/ Device Type（设备类型）/ Device（指定设备） |
| **创建时间** | 转换的创建时间 |
| **最近执行** | 上次执行时间 |
| **状态开关** | 启用 / 禁用切换 |
| **操作菜单** | 编辑、导出、删除 |

右上角的 **Import / Export** 按钮可批量导入导出转换 JSON。

## 通过 Web UI 创建转换

### 步骤 1：打开转换构建器

在 Transforms 页签点击 **Create** 按钮，打开全屏构建器：

<img src="https://resources.camthink.ai/NeoMind/v0923/transform-builder.png" alt="转换构建器 — 左侧配置栏（名称、作用域、输出前缀），右侧代码编辑器" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

构建器采用**左右分栏**布局：

| 区域 | 说明 |
|------|------|
| **左侧 · 配置栏** | 名称、描述、作用域、输出前缀、复杂度 |
| **右侧 · 代码工作区** | JavaScript 代码编辑器 + 变量面板 + 测试栏 |

### 步骤 2：填写基本信息

| 字段 | 说明 |
|------|------|
| **Name（名称）** | 转换的显示名称 |
| **Description（描述）** | 可选，说明转换用途 |
| **Output Prefix（输出前缀）** | 派生指标的命名前缀。如设为 `converted`，输出的指标名为 `converted.temp_f` |
| **Complexity（复杂度）** | 1–5 的数字，用于执行顺序排序（低复杂度先执行） |

### 步骤 3：选择作用域

作用域决定转换处理哪些设备的数据：

| 作用域 | 说明 | 适用场景 |
|--------|------|---------|
| **Global（全局）** | 处理所有设备的数据 | 通用转换（如单位换算） |
| **Device Type（设备类型）** | 仅处理指定设备类型的数据 | 同类设备的批量转换 |
| **Device（指定设备）** | 仅处理单个设备的数据 | 特定设备的定制转换 |

### 步骤 4：编写转换代码

<img src="https://resources.camthink.ai/NeoMind/v0923/transform-builder-code.png" alt="转换构建器 — JavaScript 代码编辑器与变量面板" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

代码编辑器中使用 JavaScript 编写转换函数。**`input` 变量代表输入值**——单键指标对象（如 `{"temperature": 25}`）会自动解包为标量，可直接参与运算；完整输入对象用 `input_raw` 访问。`return` 一个对象作为输出：

```javascript
// 摄氏度转华氏度
return {
  temp_f: input * 9/5 + 32
}
```

**可用变量**：

| 变量 | 说明 |
|------|------|
| `input` | 输入数据：单键指标对象（如 `{"temperature": 25}`）会自动解包为标量，可直接参与运算 |
| `input_raw` | 完整的输入数据对象（不做自动解包） |
| `extensions.invoke(ext_id, command, params)` | 调用扩展命令，返回扩展执行结果 |

**`input` 自动解包规则**——写代码前先搞清楚拿到的是什么，这是转换代码「跑通还是报错」的最大变量：

| 设备数据形态 | `input` 的值 | `input_raw` 的值 | 代码写法 |
|-------------|-------------|------------------|---------|
| 标量（如 `25`） | `25` | `25` | `input * 9/5 + 32` |
| 单键对象 `{"temperature": 25}` | `25`（自动解包） | `{"temperature": 25}` | 直接 `input * 9/5 + 32`；要键名时用 `input_raw.temperature` |
| 多键对象 `{"temperature": 25, "humidity": 60}` | 原样对象 | 同 `input` | `input.temperature * 9/5 + 32` |

:::warning 单键 vs 多键，代码不通用
同一段 `input * 9/5 + 32`，在 `{"temperature": 25}`（单键，自动解包）下正常，在 `{"temperature": 25, "humidity": 60}`（多键）下会得到 `NaN`。如果转换要跨设备类型复用、输入形态不确定，防御性写法是：`return { temp_f: (input_raw.temperature ?? input) * 9/5 + 32 }`。写完务必用[测试栏](#步骤-5测试转换)分别验证两种输入。
:::

**变量面板**：左侧的变量面板可插入设备指标和扩展数据源。选择设备类型后，该类型的所有指标会列出，点击即可插入代码。也可从扩展面板选择扩展命令生成调用代码。

### 步骤 5：测试转换

构建器底部的测试栏可以用模拟数据验证转换效果：

1. 在测试输入框填入模拟值（如 `25`）
2. 点击 **Test** 按钮
3. 查看输出结果是否正确

测试通过后点击 **Save** 保存转换。

## 转换的工作原理

```mermaid
flowchart LR
    A[设备数据写入 Telemetry] --> B{匹配作用域?}
    B -- 是 --> C[执行 JS 转换代码]
    B -- 否 --> A
    C --> D[输出派生指标]
    D --> E[写入时序数据库]
    E --> F[可用于仪表板/规则/Agent]
```

转换输出的派生指标以 DataSourceId 格式 `transform:<transform_id>:<前缀>.<字段>` 注册（如 `transform:9a1b2c3d…:converted.temp_f`），在数据源选择器中按 Transform 类型分组显示。这些指标可以：
- 在仪表板中绑定为数据源
- 在规则条件中引用
- 在 Agent 的 Focused 模式中绑定

## 转换示例

### 1. 摄氏度转华氏度

```javascript
return {
  temp_f: input * 9 / 5 + 32
}
```

输出指标：`converted.temp_f`

### 2. 计算功率（电压 × 电流）

```javascript
// 假设输入包含 voltage 和 current
return {
  power: input.voltage * input.current,
  power_kw: (input.voltage * input.current) / 1000
}
```

### 3. 设备状态文本化

```javascript
return {
  status_text: input === 1 ? "在线" : "离线",
  is_online: input === 1
}
```

### 4. 调用扩展处理图像

```javascript
// 调用 YOLO 扩展做目标检测
const result = extensions.invoke('yolo-video', 'detect', {
  data: input
})

return {
  detections: result.detections,
  object_count: result.detections.length,
  has_person: result.detections.some(d => d.class === 'person')
}
```

### 5. 调用扩展查询外部数据（extensions.invoke）

`extensions.invoke(扩展ID, 命令, 参数)` 不限于图像——任何已安装扩展的命令都能调。比如用天气扩展给温度数据补充外部上下文：

```javascript
// 拉取上海当前天气（扩展 ID 与命令名以扩展管理页为准）
const weather = extensions.invoke('weather.ext', 'get_current', { location: 'Beijing' })

return {
  temp_f: input * 9/5 + 32,
  outdoor_temp: weather.temp_f || 0
}
```

:::note 执行机制
转换引擎会在运行你的代码**之前**扫描代码中的 `extensions.invoke(...)` 调用、先异步执行扩展命令，再把结果注入代码上下文——所以上面写法是同步取值，无需 await。扩展不存在或执行失败会记录在执行记录的 `warnings` 里（见[完整生命周期示例](#完整生命周期示例从创建到仪表板)第 3 步的 `output.warning_count`）。
:::

### 6. 数值区间分类

```javascript
let level = 'normal'
if (input > 80) level = 'critical'
else if (input > 60) level = 'warning'
else if (input > 40) level = 'notice'

return {
  level: level,
  level_value: { normal: 0, notice: 1, warning: 2, critical: 3 }[level]
}
```

## 完整生命周期示例：从创建到仪表板

下面用一个真实场景把所有环节串起来：设备上报摄氏温度，我们生成华氏度派生指标并放到仪表板上。

**第 1 步 · 用 CLI 创建转换**

```bash
# （可选）先验证代码逻辑，不落库
neomind transform test-code \
  --code 'return { temp_f: input * 9/5 + 32 }' \
  --input '{"temperature": 25}'

# 创建并启用
neomind transform create \
  --name "Fahrenheit Converter" \
  --scope global \
  --code 'return { temp_f: input * 9/5 + 32 }' \
  --output-prefix converted \
  --enabled true
```

创建成功后，`neomind transform list` 能看到它（含 ID、作用域、输出前缀）。`--scope` 支持 `global`（全部设备）、`device_type:TH Sensor`（指定类型）、`device:sensor-01`（指定设备）三种写法。

**第 2 步 · 设备数据到达，转换自动执行**

无需任何手动触发——当 sensor-01 发布 `{"temperature": 25}` 时，转换引擎按作用域匹配、毫秒级执行代码，输出派生指标 `converted.temp_f = 77` 并写入时序库。派生指标的完整标识是 `transform:<transform_id>:converted.temp_f`。

**第 3 步 · 确认执行结果**

```bash
neomind transform executions <transform_id> --limit 20
```

一条真实执行记录长这样（`status: "completed"` 即成功）：

```json
{
  "id": "7c44cb8f-…",
  "automation_id": "f010c73c-…",
  "automation_type": "transform",
  "started_at": 1788930297329,
  "ended_at": 1788930297338,
  "status": "completed",
  "error": null,
  "output": { "metric_count": 1, "warning_count": 0 }
}
```

想看生成的指标值本身，可以给转换发一条测试数据并观察输出指标：

```bash
curl -X POST http://localhost:9375/api/automations/transforms/<transform_id>/test \
  -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" \
  -d '{ "device_id": "sensor-01", "data": {"temperature": 25} }'
```

响应里的 `metrics` 数组就是转换产出的派生指标（与真实数据到达时写入时序库的内容一致）：

```json
{
  "success": true,
  "data": {
    "transform_id": "f010c73c-…",
    "metrics": [{
      "device_id": "sensor-01",
      "transform_id": "f010c73c-…",
      "metric": "converted.temp_f",
      "value": 77.0,
      "timestamp": 1788930297,
      "quality": 1.0
    }],
    "count": 1,
    "warnings": []
  }
}
```

**第 4 步 · 绑定到仪表板**

进入 [仪表板](./4-use-dashboard.md) 编辑器，添加组件（如 Chart / Value）→ 在数据源选择器中找到 **Transform** 分组 → 选中 `converted.temp_f`（完整 ID 形如 `transform:f010c73c-…:converted.temp_f`）→ 保存。此后每条设备数据到达，仪表板上的派生指标都会随之实时更新。同样地，规则条件里也能引用这个指标（如 `converted.temp_f > 170` 触发告警）。

## CLI 管理

```bash
# 创建转换（摄氏 → 华氏；JS 中用 input 访问输入值）
neomind transform create \
  --name "Fahrenheit Converter" \
  --scope global \
  --code 'return { temp_f: input * 9/5 + 32 }' \
  --output-prefix converted \
  --enabled true

# 列出所有转换 / 查看详情
neomind transform list
neomind transform get <id>

# 查看最近执行记录（排查"代码跑了但没输出"的第一现场）
neomind transform executions <id> --limit 20

# 启用 / 禁用
neomind transform enable <id>
neomind transform disable <id>

# 删除
neomind transform delete <id>
```

## REST API

```bash
# 创建转换
curl -X POST http://localhost:9375/api/automations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fahrenheit Converter",
    "description": "Convert Celsius to Fahrenheit",
    "type": "transform",
    "enabled": true,
    "definition": {
      "scope": "global",
      "js_code": "return { temp_f: input * 9/5 + 32 }",
      "output_prefix": "converted",
      "complexity": 2
    }
  }'

# 列出所有转换
curl http://localhost:9375/api/automations

# 更新转换
curl -X PUT http://localhost:9375/api/automations/<id> \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name", "definition": {"scope": "global", "js_code": "...", "output_prefix": "converted", "complexity": 2}}'
```

## 导入 / 导出

Transforms 页签右上角的 **Import / Export** 按钮支持批量管理。也可以在单个转换的操作菜单中选择 **Export** 导出单个转换。

导出文件格式为 `neomind-transforms-YYYY-MM-DD.json`。

## 与其他模块联动

| 模块 | 说明 |
|------|------|
| [仪表板](./4-use-dashboard.md) | 转换输出的派生指标可绑定为仪表板组件数据源 |
| [自动化规则](./7-automation-rules.md) | 规则条件可引用转换输出的 `transform:<prefix>:<field>` 指标 |
| [AI Agent](./6-ai-agent.md) | Agent 的 Focused 模式可绑定转换输出指标 |
| [设备](./3-onboard-device.md) | 转换处理设备发布的原始遥测数据 |
| [扩展](./9-extensions.md) | 转换代码可调用 `extensions.invoke()` 执行扩展命令 |

## 最佳实践

- **善用 Output Prefix**：为不同转换设置不同前缀（如 `converted`、`status`、`aggregated`），避免指标名冲突
- **先测试再保存**：构建器的 Test 功能可快速验证代码逻辑，无需等真实数据
- **Complexity 排序**：依赖其他转换输出的转换设更高复杂度，确保执行顺序正确
- **作用域最小化**：能用 Device Type 就不用 Global，减少不必要的转换开销
- **代码简洁**：转换对每条数据执行，保持代码轻量（避免复杂循环/递归）

## 移动端

<img src="https://resources.camthink.ai/NeoMind/v0923/automation-transforms-mobile.png" alt="数据转换移动端 — 单列表格自适应" style={{width: '50%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

移动端自动切换为单列布局，支持查看列表、切换状态。编辑转换请在桌面端操作（代码编辑器需要大屏空间）。

## 下一步

- [自动化规则](./7-automation-rules.md) — 在规则条件中引用转换输出的派生指标
- [使用仪表板](./4-use-dashboard.md) — 把派生指标绑定为仪表板组件数据源
- [扩展管理](./9-extensions.md) — 在转换中用 `extensions.invoke()` 调用扩展命令

---

*最后更新: 2026-09-09*
