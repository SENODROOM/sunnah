import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Dawud } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dawudData = JSON.parse(fs.readFileSync(path.join(__dirname, 'bin', 'dawud.json'), 'utf8'));
const dawud     = new Dawud(dawudData);

export { Dawud };
export default dawud;
