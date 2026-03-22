// CommonJS entry — require('sunan-abi-dawud')
'use strict';
const fs   = require('fs');
const zlib = require('zlib');
const path = require('path');

function loadData() {
  const gzPath   = path.join(__dirname, '..', 'data', 'dawud.json.gz');
  const jsonPath = path.join(__dirname, '..', 'data', 'dawud.json');
  if (fs.existsSync(gzPath))   return JSON.parse(zlib.gunzipSync(fs.readFileSync(gzPath)).toString('utf8'));
  if (fs.existsSync(jsonPath)) return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  throw new Error('Data file not found. Expected data/dawud.json.gz or data/dawud.json');
}
const dawudData = loadData();

class Dawud {
  constructor(dawudData) {
    this._hadiths = dawudData.hadiths;
    return new Proxy(this._hadiths, {
      get: (target, prop) => {
        if (!isNaN(prop))   return target[parseInt(prop)];
        if (prop in target) return target[prop];
        switch (prop) {
          case 'metadata':     return dawudData.metadata;
          case 'chapters':     return dawudData.chapters;
          case 'get':          return (id) => this._hadiths.find(h => h.id === id);
          case 'getByChapter': return (id) => this._hadiths.filter(h => h.chapterId === id);
          case 'search':       return (q, limit = 0) => {
            const ql = q.toLowerCase();
            const r  = this._hadiths.filter(h =>
              h.english?.text?.toLowerCase().includes(ql) ||
              h.english?.narrator?.toLowerCase().includes(ql)
            );
            return limit > 0 ? r.slice(0, limit) : r;
          };
          case 'getRandom': return () => this._hadiths[Math.floor(Math.random() * this._hadiths.length)];
          case 'length':    return target.length;
          default:          return target[prop];
        }
      },
      ownKeys: (target) => [
        'length',
        ...Array.from({ length: target.length }, (_, i) => String(i)),
        'metadata', 'chapters', 'get', 'getByChapter', 'search', 'getRandom'
      ]
    });
  }
}
const dawud = new Dawud(dawudData);
module.exports = dawud;
module.exports.Dawud   = Dawud;
module.exports.default = dawud;
