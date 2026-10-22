#!/usr/bin/env bash
# 演示遥测循环:每 25 秒向两台环境传感器发布正弦波温度/湿度,直到被 kill
# 用法: ./telemetry-loop.sh [api-key](仅用于读取设备列表)
set -uo pipefail
K="${1:?usage: telemetry-loop.sh <api-key>}"
SENSORS=$(curl -s -H "Authorization: Bearer $K" "http://localhost:9375/api/devices?limit=100" \
  | python3 -c "import json,sys
print(' '.join(d['id'] for d in json.load(sys.stdin)['data']['devices'] if d['device_type']=='env_sensor'))")
echo "sensors: $SENSORS"
T0=$(date +%s)
N=0
while true; do
  NOW=$(date +%s)
  i=0
  for dev in $SENSORS; do
    TEMP=$(python3 -c "import math,random; t=$NOW-$T0; print(round(24+4*math.sin(t/300+$i*1.7)+random.uniform(-.3,.3),1))")
    HUM=$(python3 -c "import math,random; t=$NOW-$T0; print(round(50+10*math.cos(t/420+$i)+random.uniform(-1,1),1))")
    mosquitto_pub -h 127.0.0.1 -p 1883 -t "device/env_sensor/$dev/uplink" -m "{\"temperature\":$TEMP,\"humidity\":$HUM}"
    i=$((i+1)); N=$((N+1))
  done
  echo "published $N messages"
  sleep 25
done
