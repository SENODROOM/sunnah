import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Tirmidhi } from './index.js';

const __dirname      = path.dirname(fileURLToPath(import.meta.url));
const tirmidhiData   = JSON.parse(fs.readFileSync(path.join(__dirname, 'bin', 'tirmidhi.json'), 'utf8'));
const tirmidhi       = new Tirmidhi(tirmidhiData);

export { Tirmidhi };
export default tirmidhi;
