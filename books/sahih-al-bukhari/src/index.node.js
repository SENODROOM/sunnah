// Node ESM entry — import bukhari from 'sahih-al-bukhari'
import fs   from 'fs';
import zlib from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';
import { Bukhari } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadData() {
  const gzPath   = path.join(__dirname, '..', 'data', 'bukhari.json.gz');
  const jsonPath = path.join(__dirname, '..', 'data', 'bukhari.json');
  if (fs.existsSync(gzPath))   return JSON.parse(zlib.gunzipSync(fs.readFileSync(gzPath)).toString('utf8'));
  if (fs.existsSync(jsonPath)) return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  throw new Error('Data file not found. Expected data/bukhari.json.gz or data/bukhari.json');
}

const bukhari = new Bukhari(loadData());

export { Bukhari };
export default bukhari;
