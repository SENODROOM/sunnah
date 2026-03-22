// Node ESM entry
import fs   from 'fs';
import zlib from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';
import { Nasai } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadData() {
  const gzPath   = path.join(__dirname, '..', 'data', 'nasai.json.gz');
  const jsonPath = path.join(__dirname, '..', 'data', 'nasai.json');
  if (fs.existsSync(gzPath))   return JSON.parse(zlib.gunzipSync(fs.readFileSync(gzPath)).toString('utf8'));
  if (fs.existsSync(jsonPath)) return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  throw new Error('Data file not found. Expected data/nasai.json.gz or data/nasai.json');
}
export { Nasai };
export default new Nasai(loadData());
