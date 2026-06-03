#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const https = require('https');

dotenv.config({ path: path.join(__dirname, '../.env') });

const WEIGHTS = '/Users/harryhua/Documents/GitHub/ne301/Model/weights';
const MODELS_BIN = '/Users/harryhua/Documents/GitHub/ne301/models-bin';
const REMOTE_BASE = '/img/neoeyes-ne301-series/application-guide/verified-model-list';

const MODELS = [
  'yolov8n_256_quant_pc_uf_od_coco',
  'yolov8n_256_quant_pc_ui_od_coco',
  'st_yolo_x_nano_480_1.0_0.25_3_int8',
  'st_yololcv1_192_od_person',
  'st_yololcv1_224_od_person',
  'st_yololcv1_256_od_person',
  'yolov8n_256_quant_pc_uf_od_coco-person-st',
  'yolo11n_256_quant_pc_uf_od_coco-person-st',
  'yolov8n_256_quant_pc_uf_pose_coco-st',
  'yolov11n_256_quant_pc_uf_pose_coco-st',
  'yolov8n_256_quant_pc_ui_pose_coco',
  'yolov8n_256_quant_pc_ui_iseg_coco',
  'blazeface_128_fd_ui',
];

const PUBLIC_BASE = 'https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/verified-model-list';

const client = axios.create({
  baseURL: 'https://fsx.camthink.ai',
  timeout: 120000,
  httpsAgent: new https.Agent({ rejectUnauthorized: true, keepAlive: true }),
  proxy: false,
});

async function main() {
  console.log('Logging in...');
  const res = await client.post('/api/login', {
    username: process.env.FILE_BROWSER_USERNAME,
    password: process.env.FILE_BROWSER_PASSWORD,
  });
  const token = res.data;
  const headers = { 'X-Auth': token, 'Content-Type': 'application/octet-stream' };
  console.log('Login OK.\n');

  let uploaded = 0;
  let errors = 0;

  for (const model of MODELS) {
    const files = [
      { local: `${WEIGHTS}/${model}.tflite`, suffix: '.tflite' },
      { local: `${WEIGHTS}/${model}.json`, suffix: '.json' },
      { local: `${MODELS_BIN}/${model}/${model}_pkg.bin`, suffix: '_pkg.bin' },
    ];

    for (const { local, suffix } of files) {
      const basename = `${model}${suffix}`;
      const remotePath = `${REMOTE_BASE}/${basename}`;
      try {
        const buf = fs.readFileSync(local);
        await client.post(`/api/resources${remotePath}?override=true`, buf, { headers });
        console.log(`  OK: ${basename} (${(buf.length / 1024).toFixed(0)} KB)`);
        uploaded++;
      } catch (err) {
        console.error(`  FAIL: ${basename} - ${err.message}`);
        errors++;
      }
    }
  }

  console.log(`\nDone. Uploaded: ${uploaded}, Errors: ${errors}`);

  // Output public URLs for verification
  if (uploaded > 0) {
    console.log('\nPublic URLs:');
    for (const model of MODELS) {
      for (const suffix of ['.tflite', '.json', '_pkg.bin']) {
        console.log(`  ${PUBLIC_BASE}/${model}${suffix}`);
      }
    }
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
