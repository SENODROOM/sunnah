import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Majah } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const majahData = JSON.parse(fs.readFileSync(path.join(__dirname, 'bin', 'majah.json'), 'utf8'));
const majah     = new Majah(majahData);

export { Majah };
export default majah;
