#!/usr/bin/env bash
# NeoMind 文档截图流水线 — 演示数据铺设(按名称幂等,重复执行安全)
# 前提:干净实例已启动
#   NEOMIND_DATA_DIR=/tmp/neomind-shots NEOMIND_STRICT_DATA_DIR=1 \
#     <neomind-binary> serve --port 9375
# 用法: ./seed.sh [api-key]
set -euo pipefail
BASE="http://localhost:9375/api"
K="${1:?usage: seed.sh <api-key>}"
AUTH=(-H "Authorization: Bearer $K" -H "Content-Type: application/json")

j() { python3 -c "import json,sys; d=json.load(sys.stdin); print(json.dumps(d.get('data') or d, ensure_ascii=False)[:150])" 2>/dev/null || echo "(no json)"; }

echo "== 1. LLM 后端 =="
BACKEND_ID=$(curl -s "${AUTH[@]}" "$BASE/llm-backends" | python3 -c "
import json,sys
bs = json.load(sys.stdin)['data']
bs = bs if isinstance(bs, list) else bs.get('backends', [])
print(next((b['id'] for b in bs if b['name']=='Local Qwen 3.5 4B'), ''))")
if [ -z "$BACKEND_ID" ]; then
  BACKEND_ID=$(curl -s -X POST "${AUTH[@]}" "$BASE/llm-backends" -d '{
    "name":"Local Qwen 3.5 4B","backend_type":"ollama","model":"qwen3.5:4b",
    "endpoint":"http://localhost:11434","temperature":0.7}' | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['id'])")
fi
curl -s -o /dev/null -X POST "${AUTH[@]}" "$BASE/llm-backends/$BACKEND_ID/activate" || true
echo "backend: $BACKEND_ID"

echo "== 2. 演示设备(存在即跳过) =="
existing=$(curl -s "${AUTH[@]}" "$BASE/devices?limit=100" | python3 -c "import json,sys; print(len(json.load(sys.stdin)['data']['devices']))")
if [ "$existing" -eq 0 ]; then
  curl -s -X POST "${AUTH[@]}" "$BASE/device-types" -d '{
    "device_type":"env_sensor","name":"Environment Sensor","description":"Temperature & humidity sensor demo type","mode":"Simple",
    "metrics":[{"name":"temperature","display_name":"Temperature","data_type":"Float","unit":"°C"},
               {"name":"humidity","display_name":"Humidity","data_type":"Float","unit":"%"}]}' >/dev/null
  for d in ne101_camera:NE101-Front-Gate ne301_camera:NE301-Workshop-Cam env_sensor:Office-Environment env_sensor:Workshop-Environment; do
    t="${d%%:*}"; n="${d##*:}"
    curl -s -X POST "${AUTH[@]}" "$BASE/devices" -d "{\"device_type\":\"$t\",\"name\":\"$n\",\"adapter_type\":\"mqtt\",\"connection_config\":{}}" >/dev/null
  done
fi
DEVICE_IDS=$(curl -s "${AUTH[@]}" "$BASE/devices?limit=100" | python3 -c "
import json,sys
for d in json.load(sys.stdin)['data']['devices']: print(d['id'], d['device_type'], d['name'], sep='|')")
echo "$DEVICE_IDS"
OFFICE=$(echo "$DEVICE_IDS" | grep env_sensor | grep Office | cut -d'|' -f1)
WORKSHOP=$(echo "$DEVICE_IDS" | grep env_sensor | grep Workshop | cut -d'|' -f1)

echo "== 3. AI Agent ×3(按名称幂等) =="
have_agents=$(curl -s "${AUTH[@]}" "$BASE/agents" | python3 -c "
import json,sys
d = json.load(sys.stdin)['data']
a = d if isinstance(d, list) else d.get('agents', [])
print(' '.join(x['name'] for x in a))")
mk_agent() { # name json
  if echo "$have_agents" | grep -q "$1"; then echo "  skip: $1"; else curl -s -X POST "${AUTH[@]}" "$BASE/agents" -d "$2" | j; fi
}
mk_agent "温度巡检" '{
  "name":"温度巡检","description":"每 30 分钟巡检环境温度,超温告警",
  "user_prompt":"读取绑定的温度传感器最新读数:全部低于 30°C 时用一句话汇报正常及最高温;任一超过 30°C 发送告警消息(标题含设备名与温度);journal 显示上轮已发过相同告警则不重复发。",
  "execution_mode":"focused",
  "resources":[
    {"resource_id":"device:'"$OFFICE"':temperature","resource_type":"metric","name":"Office 温度"},
    {"resource_id":"device:'"$WORKSHOP"':temperature","resource_type":"metric","name":"Workshop 温度"}],
  "schedule":{"schedule_type":"cron","cron_expression":"0 */30 * * * *"}}'
mk_agent "设备健康监测" '{
  "name":"设备健康监测","description":"设备数据变化时评估健康状态",
  "user_prompt":"分析刚上报的设备数据是否异常(读数突变、超量程、长时间未更新)。异常时发送告警消息并说明依据;正常则一句话记录。必要时查询该设备历史数据交叉验证。",
  "execution_mode":"free",
  "schedule":{"schedule_type":"event"}}'
mk_agent "每日环境日报" '{
  "name":"每日环境日报","description":"每天 8 点汇总昨日环境数据",
  "user_prompt":"汇总两个环境传感器过去 24 小时的温度与湿度:计算均值、峰值,与明显趋势;生成 200 字以内日报并发送到运维邮箱;结尾给出一句建议。",
  "execution_mode":"focused",
  "resources":[
    {"resource_id":"device:'"$OFFICE"':temperature","resource_type":"metric","name":"Office 温度"},
    {"resource_id":"device:'"$WORKSHOP"':temperature","resource_type":"metric","name":"Workshop 温度"}],
  "schedule":{"schedule_type":"cron","cron_expression":"0 0 8 * * *"}}'

echo "== 4. 自动化规则 ×2(按名称幂等) =="
have_rules=$(curl -s "${AUTH[@]}" "$BASE/rules" | python3 -c "
import json,sys
r = json.load(sys.stdin)['data'].get('rules', [])
print(' '.join(x['name'] for x in r))")
mk_rule() {
  if echo "$have_rules" | grep -q "$1"; then echo "  skip: $1"; else curl -s -X POST "${AUTH[@]}" "$BASE/rules" -d "$2" | j; fi
}
mk_rule "高温告警" '{
  "name":"高温告警","enabled":true,
  "trigger":{"trigger_type":"data_change"},
  "condition":{"condition_type":"comparison","source":"device:'"$OFFICE"':temperature","operator":"greater_than","threshold":30},
  "actions":[{"type":"notify","message":"Office 温度过高:{value}°C","severity":"critical"}]}'
mk_rule "离线巡检提醒" '{
  "name":"离线巡检提醒","enabled":true,
  "trigger":{"trigger_type":"schedule","cron":"0 5 * * * *"},
  "condition":{"condition_type":"comparison","source":"device:env_sensor_07673742:temperature","operator":"greater_than","threshold":-999},
  "actions":[{"type":"notify","message":"整点巡检:请确认设备在线状态","severity":"warning"}]}'

echo "== 5. 通知渠道 ×3(按名称幂等,带类型配置) =="
have_ch=$(curl -s "${AUTH[@]}" "$BASE/messages/channels" | python3 -c "
import json,sys
print(' '.join(c['name'] for c in json.load(sys.stdin)['data']['channels']))")
mk_ch() { # name type config-json(平铺到顶层,serde flatten)
  if echo "$have_ch" | grep -qw "$1"; then echo "  skip: $1"; else
    curl -s -X POST "${AUTH[@]}" "$BASE/messages/channels" -d "{\"name\":\"$1\",\"channel_type\":\"$2\",\"enabled\":true,$3}" | j; fi
}
mk_ch "ops-email" email '"smtp_server":"smtp.example.com","smtp_port":587,"username":"ops@example.com","password":"demo","from_address":"ops@example.com","use_tls":true'
mk_ch "ops-telegram" telegram '"token":"123456:ABC-demo-token","chat_id":"-1000000000"'
mk_ch "ops-webhook" webhook '"url":"https://httpbin.org/post","timeout_secs":30'

echo "== 6. Data Push ×2(按名称幂等) =="
have_push=$(curl -s "${AUTH[@]}" "$BASE/data-push" | python3 -c "
import json,sys
t = json.load(sys.stdin)['data'].get('targets', [])
print(' '.join(x['name'] for x in t))")
mk_push() {
  if echo "$have_push" | grep -q "$1"; then echo "  skip: $1"; else curl -s -X POST "${AUTH[@]}" "$BASE/data-push" -d "$2" | j; fi
}
mk_push "运维大屏同步" '{
  "name":"运维大屏同步","enabled":true,"target_type":"webhook",
  "config":{"url":"https://httpbin.org/post","method":"POST"},
  "schedule":{"type":"event_driven","event_types":["device_metric"]},
  "data_filter":{"source_patterns":["device:'"$OFFICE"':","device:'"$WORKSHOP"':"],"only_changes":true}}'
mk_push "历史归档" '{
  "name":"历史归档","enabled":false,"target_type":"webhook",
  "config":{"url":"https://archive.example.com/ingest","method":"POST"},
  "schedule":{"type":"interval","interval_secs":3600},
  "data_filter":{"source_patterns":["device:"],"only_changes":false}}'

echo "== 7. 仪表板 ×2(按名称幂等) =="
have_dash=$(curl -s "${AUTH[@]}" "$BASE/dashboards" | python3 -c "
import json,sys
d = json.load(sys.stdin)['data']
d = d if isinstance(d, list) else d.get('dashboards', [])
print(' '.join(x['name'] for x in d))")
if echo "$have_dash" | grep -q "Operations Overview"; then echo "  skip: Operations Overview"; else
curl -s -X POST "${AUTH[@]}" "$BASE/dashboards" -d '{
  "name":"Operations Overview","description":"Demo operations dashboard",
  "components":[
    {"type":"value-card","title":"Office Temperature","position":{"x":0,"y":0,"w":3,"h":2},
     "data_source":{"source":"device:'"$OFFICE"':temperature","aggregate":"last"},"display":{"unit":"°C"}},
    {"type":"value-card","title":"Workshop Temperature","position":{"x":3,"y":0,"w":3,"h":2},
     "data_source":{"source":"device:'"$WORKSHOP"':temperature","aggregate":"last"},"display":{"unit":"°C"}},
    {"type":"gauge","title":"Office Humidity","position":{"x":6,"y":0,"w":3,"h":2},
     "data_source":{"source":"device:'"$OFFICE"':humidity","aggregate":"last"},"display":{"unit":"%","max":100}},
    {"type":"line-chart","title":"Temperature Trend (1h)","position":{"x":0,"y":2,"w":6,"h":3},
     "data_source":{"source":"device:'"$OFFICE"':temperature","aggregate":"avg","window":"1h"}},
    {"type":"line-chart","title":"Workshop Temperature (1h)","position":{"x":6,"y":2,"w":6,"h":3},
     "data_source":{"source":"device:'"$WORKSHOP"':temperature","aggregate":"avg","window":"1h"}},
    {"type":"markdown-display","title":"Notes","position":{"x":0,"y":5,"w":12,"h":1},
     "config":{"content":"Demo data only. Devices publish over the built-in MQTT broker every 25s."}}
  ]}' | j; fi
if echo "$have_dash" | grep -q "Pilot Dashboard"; then echo "  skip: Pilot Dashboard"; else
curl -s -X POST "${AUTH[@]}" "$BASE/dashboards" -d '{"name":"Pilot Dashboard","description":"Blank dashboard for pilot","components":[]}' | j; fi

echo "== 完成 =="
