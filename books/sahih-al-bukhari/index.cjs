// CommonJS entry — require('sahih-al-bukhari')
// Works in: Node.js (Express, serverless, etc.)
'use strict';

const fs   = require('fs');
const path = require('path');

const bukhariData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'bin', 'bukhari.json'), 'utf8')
);

class Bukhari {
  constructor(bukhariData) {
    this._hadiths = bukhariData.hadiths;

    return new Proxy(this._hadiths, {
      get: (target, prop) => {
        if (!isNaN(prop))   return target[parseInt(prop)];
        if (prop in target) return target[prop];
        switch (prop) {
          case 'metadata':     return bukhariData.metadata;
          case 'chapters':     return bukhariData.chapters;
          case 'get':          return (id) => this._hadiths.find(h => h.id === id);
          case 'getByChapter': return (id) => this._hadiths.filter(h => h.chapterId === id);
          case 'search':       return (q)  => this._hadiths.filter(h =>
            h.english?.text?.toLowerCase().includes(q.toLowerCase()) ||
            h.english?.narrator?.toLowerCase().includes(q.toLowerCase())
          );
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

const bukhari = new Bukhari(bukhariData);
module.exports = bukhari;
module.exports.Bukhari = Bukhari;
module.exports.default = bukhari;
