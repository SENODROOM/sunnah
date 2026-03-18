// ESM browser-safe entry (class only — no data)
export class Dawud {
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
export default Dawud;
