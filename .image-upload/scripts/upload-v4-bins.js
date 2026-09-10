#!/usr/bin/env node
/**
 * 上传 12 个 NE301 verified 模型的 v4.0 OTA 包到 CDN（覆盖旧 v3.0 包）。
 * 只传 .bin（tflite/json 与 v3/v4 同源，CDN 上已有的不变）。
 * 本地源：models-bin/<model>/<model>_v4.0_pkg.bin
 * 远程：/img/neoeyes-ne301-series/application-guide/verified-model-list/<model>_pkg.bin（同名覆盖）
 *
 * 用法： node upload-v4-bins.js                  # 实际上传全部
 *        node upload-v4-bins.js --only <model>   # 只传一个（测试用）
 *        node upload-v4-bins.js --check          # 仅预检本地文件
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const https = require('https');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MODELS_BIN = '/Users/harryhua/Documents/GitHub/ne301/models-bin';
const REMOTE_BASE = '/img/neoeyes-ne301-series/application-guide/verified-model-list';

const ALL_MODELS = [
  'yolov8n_256_quant_pc_uf_od_coco',
  'yolov8n_256_quant_pc_ui_od_coco',
  'st_yolo_x_nano_480_1.0_0.25_3_int8',
  'yolov8n_256_quant_pc_uf_od_coco-person-st',
  'yolo11n_256_quant_pc_uf_od_coco-person-st',
  'yolov8n_256_quant_pc_uf_pose_coco-st',
  'yolov11n_256_quant_pc_uf_pose_coco-st',
  'yolov8n_256_quant_pc_ui_pose_coco',
  'yolov8n_256_quant_pc_ui_od_meter',
  'yolov8n_256_quant_pc_ui_pose_gauge',
  'yolov8n_256_quant_pc_ui_iseg_coco',
  'blazeface_128_fd_ui',
];

const CHECK_ONLY = process.argv.includes('--check');
const _onlyIdx = process.argv.indexOf('--only');
const ONLY = _onlyIdx > -1 ? process.argv[_onlyIdx + 1] : null;
const TARGETS = ONLY ? ALL_MODELS.filter(m => m === ONLY) : ALL_MODELS;
if (ONLY && TARGETS.length === 0) {
  console.error('模型不在列表中: ' + ONLY);
  process.exit(1);
}

function localPath(m) { return `${MODELS_BIN}/${m}/${m}_v4.0_pkg.bin`; }

async function main() {
  const missing = TARGETS.filter(m => !fs.existsSync(localPath(m)));
  if (missing.length) {
    console.error('❌ 缺少本地 v4.0 bin:');
    missing.forEach(m => console.error('   ' + localPath(m)));
    process.exit(1);
  }
  console.log(`✅ 预检通过：${TARGETS.length} 个 v4.0 bin 均存在\n`);
  console.log('上传清单（将覆盖 CDN 上同名 v3.0 包）：');
  TARGETS.forEach(m => {
    const sz = (fs.statSync(localPath(m)).size / 1024).toFixed(0);
    console.log(`   ${m}_pkg.bin  (${sz} KB)`);
  });

  if (CHECK_ONLY) { console.log('\n--check 模式，不上传。'); return; }

  const client = axios.create({
    baseURL: 'https://fsx.camthink.ai',
    timeout: 120000,
    httpsAgent: new https.Agent({ rejectUnauthorized: true, keepAlive: true }),
    proxy: false,
  });

  console.log('\n登录 File Browser...');
  const res = await client.post('/api/login', {
    username: process.env.FILE_BROWSER_USERNAME,
    password: process.env.FILE_BROWSER_PASSWORD,
  });
  const headers = { 'X-Auth': res.data, 'Content-Type': 'application/octet-stream' };
  console.log('登录成功。\n');

  let ok = 0, fail = 0;
  for (const m of TARGETS) {
    const buf = fs.readFileSync(localPath(m));
    const remote = `${REMOTE_BASE}/${m}_pkg.bin`;
    try {
      await client.post(`/api/resources${remote}?override=true`, buf, { headers });
      console.log(`  ✅ ${m}_pkg.bin (${(buf.length / 1024).toFixed(0)} KB)`);
      ok++;
    } catch (err) {
      console.error(`  ❌ ${m}_pkg.bin - ${err.message}`);
      fail++;
    }
  }
  console.log(`\n完成。成功 ${ok}，失败 ${fail}`);
  if (fail > 0) process.exit(1);
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
