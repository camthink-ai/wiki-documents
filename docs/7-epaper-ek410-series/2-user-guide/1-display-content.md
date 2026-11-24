---
id: ek410-display-content
title: Displaying Content
sidebar_position: 1
description: Image / Editor / Markdown 三模式完整说明：控件、逐步操作、预览与推屏注意。
keywords: [EK410, 显示内容, 图片上传, 画布编辑器, Markdown, Spectra 6, Push to screen]
tags: [EK410, 用户指南, 内容显示]
---

# Displaying Content

「显示 / **Display**」页顶部有三个**互斥**模式 Tab。三种模式最后都是同一件事：

**在浏览器（或设备）生成 Spectra 6 六色画面 → 点「刷到屏幕 / Push to screen」→ 全刷约 20–40 秒。**

| 模式（英文 UI） | 中文 UI | 适合场景 | 设备侧路径 |
| :--- | :--- | :--- | :--- |
| **Image** | 图片 | 换一张整屏照片 / 海报 | 浏览器量化 → `uploadFrame` |
| **Editor** | 编辑器 | 门牌、会议牌：文字 + 色块 + 二维码 + 局部贴图 | `renderCanvas` |
| **Markdown** | Markdown | 公告、条目列表 | 解析成画布后再刷 |

下文截图与控件名以**英文界面**为准（**System → Preferences → Language** 可切中文；中文对应名见上表）。手机布局多为「画布在上、操作在下」；桌面为「左侧 / 中间画布 + 右侧控件」。

---

## 三个模式共用的顶栏

无论哪个 Tab，右上角工具一致：

| 控件 | 作用 | 建议 |
| :--- | :--- | :--- |
| **Original**（原色） | 看源图 / 设计色，**不代表**墨水最终效果 | 只用来对比 |
| **E-ink 6**（墨水六色） | 浏览器侧 Floyd–Steinberg + Spectra 6 量化预览 | **推屏前务必看这个** |
| **Layout guides**（布局辅助） | 安全区、中线、分辨率角标 | 构图时打开 |
| **Push to screen**（刷到屏幕） | 把**当前模式**的预览刷上墨水屏 | 全刷中勿断电、勿连点 |

面板可显色只有：**黑 / 白 / 黄 / 红 / 蓝 / 绿**。逻辑画布固定 **1600×1200**（与预览角标一致）。照片、渐变、细字请以 **E-ink 6** 为准，避免「网页好看、上屏糊成一团」。

:::warning 全刷期间
接口会返回忙（busy）；连续猛点 **Push to screen** 容易失败。失败可到 **System → Event log** 查看，或接串口看日志。
:::

---

## Image mode（图片）

### 页面长什么样

顶栏选中 **Image**。中间是 **Content preview**（内容预览）；右侧是 **Image source**（图片来源）。

首次进入可能看到示例渐变图（文案类似 *Sample · replace by upload*）——**不会自动上屏**；你上传 / 加载预览并 Push 之后才会变成你的画面。

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/display-image.png" alt="Display · Image：Content preview + Image source" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 控件一览

| 区域 / 控件 | 说明 |
| :--- | :--- |
| **Upload image** | 虚线框：**Click or drop**，支持 **JPG / PNG / WebP**；点选或拖入 |
| **URL** | 填可访问的图片地址（需设备能出网） |
| **Load preview** | 让设备经 STA 代拉 URL（`proxyImage`），再生成预览。SoftAP 时手机浏览器常上不了外网，**必须走设备代拉** |
| **Fit → Cover** | 铺满 1600×1200，可能裁边（英文 Cover / 中文「铺满裁切」） |
| **Fit → Contain** | 完整入画，可能留边（英文 Contain / 中文「完整显示」）——**第一次建议用这个** |
| **Fit → Stretch** | 强制拉满，可能变形（英文 Stretch / 中文「拉伸」） |
| **Load from panel** | 读取设备 Flash 里已保存的当前屏（`lastfrm`）进预览，再改再推 |

### 逐步操作

1. 打开 **Display**，确认顶栏是 **Image**。
2. **二选一准备画面：**
   - 本地：点虚线框或拖入 JPG / PNG / WebP；或
   - URL：粘贴地址 → **Load preview**（先确认设备已连家里 Wi‑Fi）。
3. 选 **Fit**（不确定就先 **Contain**）。
4. 顶栏切到 **E-ink 6**，对照预览；需要时开 **Layout guides**。
5. 点 **Push to screen**，等待约 **25–35 秒**（有的机上接近 40 秒）。
6. 墨水屏应显示你的图；回 **Overview**，**Current panel** 应出现快照（可点 Refresh）。
7. （可选）以后要微调：再进 Image → **Load from panel** → 改 Fit / 换图 → 再 Push。

### 常见问题

| 现象 | 处理 |
| :--- | :--- |
| SoftAP 下 URL 预览失败 | 先配好家里 Wi‑Fi，让设备能出网；或改用本地上传 |
| 上屏颜色和网页差很多 | 推之前是否切到了 **E-ink 6**？原色预览不能当真 |
| 图被裁掉 / 留白太多 | 换 **Cover / Contain / Stretch** 再预览 |
| Push 报错 / 忙 | 等上一次全刷结束；查 Event log |
| 上传后无反应 | 确认格式是 JPG / PNG / WebP；过大文件可先缩小再试 |

---

## Editor mode（编辑器）

### 适合做什么

不是「整屏换一张照片」，而是在白底（或六色底）上**叠图层**：标题、正文、色块分隔、二维码、小图 logo。适合会议室门牌、工位牌、简易导视。

### 页面长什么样

顶栏选中 **Editor**。中间是 **Layout preview**（可拖拽）；左侧竖条工具；右侧 **Quick add / Canvas / Layers / Properties**。

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/display-editor.png" alt="Display · Editor：工具 + Layers + Properties" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

手机上常用底部 **Add / Layers** 抽屉代替右侧面板，逻辑相同。

### 区域说明

| 区域 | 做什么 |
| :--- | :--- |
| 画布左侧工具 / 右侧 **Quick add** | **Text**（文字）、**Image**（图片图层）、**Box**（方框 / 色块）、**QR code**（二维码） |
| **Canvas → Background** | 整页底色，六色之一（如 White / Black / Red…） |
| **Layers** | 图层列表；点选后可 **Up / Down / Delete**（上层 / 下层 / 删除） |
| **Properties** | 编辑**当前选中**图层；未选中时提示 *Select a layer to edit* |
| 画布内拖拽 | 选中元素可拖到目标位置（预览角标：*Drag to place*） |

### 各图层类型与属性

| 类型 | 怎么加 | Properties 里常见项 |
| :--- | :--- | :--- |
| **Text** | 工具 **T** / Quick add **Text** | **Content** 文案；**Color**；**X / Y**；**Scale**（字号倍数，界面也可能标成字号） |
| **Box** | **Box** | **Color**；**X / Y**；尺寸相关滑条（铺色块、色条、分隔） |
| **QR code** | **QR** | **URL**（链接或文本内容）；**X / Y**；**Scale / Size** |
| **Image**（图层） | **Image** | 上传局部图；**Replace image** 更换；**X / Y** / 尺寸——这是**贴一小块图**，不是 Image 模式那种整屏换图 |

默认示例图层（如 *CamThink EK410*、*Hello, world*、色块、二维码）可直接改或删掉重排。

### 逐步操作（门牌示例）

1. 顶栏切到 **Editor**。
2. **Canvas → Background** 选 **White**（或你要的底色）。
3. 用 **Text** 加标题 → 在 **Properties** 改文案、**Color**、**Scale**；在画布上拖到合适位置。
4. 再加一行副标题 / 时间等正文 Text。
5. 需要色条时加 **Box**，颜色选六色之一（品牌橙在墨水上往往会落到红等近似色——以 **E-ink 6** 为准）。
6. 需要扫码时加 **QR**，在 **URL** 填链接。
7. 在 **Layers** 里调上下层，避免文字被色块挡住。
8. 顶栏切 **E-ink 6**，开 **Layout guides** 检查边距。
9. **Push to screen**，等待全刷结束。

### 限制与注意

| 项目 | 说明 |
| :--- | :--- |
| 画布 | 逻辑 **1600×1200**，预览所见即所得（量化后） |
| 元素数量 | 建议 **≤ 48**；二维码建议 **≤ 2** |
| 字库 | 面板字库**无彩色 emoji**，会替换成文字符号 |
| 推屏路径 | 浏览器提交图层 JSON → 设备 `renderCanvas` → 全刷 |
| 与 Image 模式 | 切换 Tab **不会**自动把整屏照片变成图层；各模式预览相互独立 |

---

## Markdown mode（Markdown）

### 适合做什么

用 Markdown 写公告、日程、条目列表，由页面**映射成画布布局**再推屏。适合「以文字为主、偶尔插图」的内容；不适合精细海报排版（那种用 Editor 或 Image）。

### 页面长什么样

顶栏选中 **Markdown**。左侧 **Write Markdown**；右侧 **Layout preview**（角标类似 *Markdown → canvas · E-ink 6*）。

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/display-markdown.png" alt="Display · Markdown：编辑框 + Layout preview" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

:::important 不是 Word 式所见即所得
改左边文字**不会**实时等于右边最终布局。必须点 **Generate preview（生成预览）**，**以右侧预览为准**再 **Push to screen**。
:::

### 控件一览

| 控件 | 说明 |
| :--- | :--- |
| **Background** | 页面背景色（六色） |
| **Text** | 默认文字色（六色） |
| 编辑框 | 输入 / 粘贴 Markdown；首次可能带有示例文案，可整段替换 |
| **Open file** | 选择本地 `.md` 文件载入 |
| **Paste** | 粘贴示例或剪贴板内容（界面会提示已粘贴） |
| **Generate preview** | 把 Markdown **映射**成右侧布局预览（H1→大字、段落→正文、列表→多行等） |

提示文案会说明：面板字库无彩色表情，已自动替换为文字符号。

### 语法与映射习惯

| 写法 | 预览上大致效果 |
| :--- | :--- |
| `# 标题` | 大号标题（H1） |
| `## 小标题` | 次级标题（H2） |
| 普通段落 | 正文行 |
| `-` / `*` 列表 | 多行条目 |
| `![](https://…/a.png)` | 走图片管线插入（**设备必须能拉到该 URL**；SoftAP 仅热点、未入网时容易失败） |

内容过长时，预览可能**截断末尾**（toast 类似 *Content truncated…*）：缩短文字，或减小映射字号后再 **Generate preview**。

### 逐步操作

1. 顶栏切到 **Markdown**。
2. 选好 **Background** / **Text** 颜色。
3. 清空或改写编辑框；或用 **Open file** / **Paste**。
4. 点 **Generate preview**，看右侧 Layout preview。
5. 不满意 → 改 Markdown → **再次 Generate preview**（每次改完都要重新生成）。
6. 切到 **E-ink 6** 确认观感。
7. **Push to screen**，等待全刷。

### 常见问题

| 现象 | 处理 |
| :--- | :--- |
| 改了字但屏上还是旧的 | 是否点了 **Generate preview**？是否又点了 **Push**？ |
| 预览缺行 / 提示截断 | 缩短内容；少用超大标题堆叠 |
| `![](url)` 不出图 | 设备是否已连家里网？URL 是否公网可达？ |
| emoji 变怪字符 | 预期行为；改用文字或符号 |

---

## 当前画面（lastfrm）怎么用

- 每次**成功的用户刷屏**（Image 上传、URL 推屏、Editor、Markdown 等）会写入 Flash 分区 `lastfrm`（画面没变则跳过擦写）。
- SoftAP 引导页、开机 CamThink logo **不会**写入。
- **Overview** 右侧显示快照；Image 模式 **Load from panel** 可拉回再编辑。
- 休眠 / 断电后墨水屏仍保持最后一帧；快照主要用于网页预览与二次编辑。

---

## 平台 / 唤醒拉图（不经浏览器 Display 页）

MQTT `display_url`、电源 **Wake image**（`wakeUrl`）走设备侧解码，**不经过**浏览器 Image / Editor / Markdown Tab：

| 格式 | 说明 |
| :--- | :--- |
| 原生帧 | 960000 字节 4bpp；可按块读入，受 PSRAM 碎片影响较小 |
| JPEG / PNG | 设备解码后墨色渲染；**仅 baseline JPEG**（渐进式 JPEG 会 `JPEG decode fail`）；超大图在「速度优先」下可能下采样 |
| WebP | **不支持**（2MB PSRAM 限制），请先转 JPEG / PNG |

**System → Preferences → URL image：Quality / Speed（效果优先 / 速度优先）** 只影响这条设备解码路径，**不影响**浏览器 Image 模式本地上传推屏。

设备侧 URL（`displayUrl` / `proxyImage` / `wakeUrl`）其它限制（固件 1.3.10）：

- 名义体积上限约 **1280 KB**；实际能否放下取决于当时 **PSRAM 最大连续块**（拒绝时常见 `need …KB, max block …KB`）。
- HTTP(S) **最多跟随 5 次跳转**；https 不会降级到 http。
- 网页若高频轮询 `getDevInfo`，可能暂占 TCP 控制块、缩小可用块——大图失败时可稍等再试，或用原生帧 / 缩小图。
- 可用 `GET /api/v1/system/getDiag` 看 `heap` / `stackMin`（勿当作状态轮询）。

URL / OTA 下载期间 MQTT 可能暂时停掉（`deferred_heap` / 临时 stop），结束后应恢复。

---

## 刷新时注意（三模式通用）

| 现象 | 说明 |
| :--- | :--- |
| 全刷 20–40 秒 | 正常；勿断电 |
| 提示忙 / render busy | 上一次还没刷完，等完成再推 |
| 连续点推屏 | 无效或报错，等一次完成 |
| SoftAP 下 URL / Markdown 插图失败 | 确认已连家里 Wi‑Fi（设备要能出网） |
| 切 Tab 后预览变了 | 三模式状态独立；推屏只推**当前 Tab** 的预览 |

---

## 相关资料

- [快速入门](../1-quick-start.md)
- [配网与连接](./0-softap-provisioning.md)
- [HTTP API](../4-software-guide/1-http-api.md)
- [屏幕与显示特性](../3-hardware-guide/1-display-panel.md)
