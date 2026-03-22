#!/usr/bin/env node
// CLI for sunan-ibn-majah

import fs   from 'fs';
import zlib from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';
import { Majah } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const pkg        = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

function loadData() {
  const gzPath   = path.join(__dirname, '..', 'data', 'majah.json.gz');
  const jsonPath = path.join(__dirname, '..', 'data', 'majah.json');
  if (fs.existsSync(gzPath))   return JSON.parse(zlib.gunzipSync(fs.readFileSync(gzPath)).toString('utf8'));
  if (fs.existsSync(jsonPath)) return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  throw new Error('Data file not found. Expected data/majah.json.gz or data/majah.json');
}

const majahData = loadData();
const { hadiths, chapters, metadata } = majahData;
const _byId      = new Map();
const _byChapter = new Map();
hadiths.forEach(h => {
  _byId.set(h.id, h);
  if (!_byChapter.has(h.chapterId)) _byChapter.set(h.chapterId, []);
  _byChapter.get(h.chapterId).push(h);
});

const majah = new Majah(majahData);
export default majah;
export { Majah };

const c = { reset:'\x1b[0m',bold:'\x1b[1m',dim:'\x1b[2m',cyan:'\x1b[36m',green:'\x1b[32m',yellow:'\x1b[33m',magenta:'\x1b[35m',gray:'\x1b[90m',red:'\x1b[31m',blue:'\x1b[34m' };
const cyan=s=>`${c.cyan}${c.bold}${s}${c.reset}`,green=s=>`${c.green}${s}${c.reset}`,yellow=s=>`${c.yellow}${s}${c.reset}`,magenta=s=>`${c.magenta}${s}${c.reset}`,bold=s=>`${c.bold}${s}${c.reset}`,dim=s=>`${c.dim}${s}${c.reset}`,gray=s=>`${c.gray}${s}${c.reset}`,red=s=>`${c.red}${s}${c.reset}`,blue=s=>`${c.blue}${s}${c.reset}`;
const DIV=()=>gray('═'.repeat(60)),DIV2=()=>gray('─'.repeat(60));

function getChapterName(id){const ch=chapters.find(c=>c.id===id);return ch?ch.english:'Unknown Chapter';}
function highlightMatch(text,q){if(!q)return text;const re=new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'gi');return text.replace(re,`${c.green}${c.bold}$1${c.reset}`);}
function wrapText(text,indent=2,width=78){const words=text.split(' '),lines=[];let line=' '.repeat(indent);for(const word of words){if(line.length+word.length+1>width){lines.push(line);line=' '.repeat(indent)+word;}else{line+=(line.trim()?' ':'')+word;}}if(line.trim())lines.push(line);return lines.join('\n');}

function printHadith(h, mode, query) {
  if(!h){console.log(yellow('\n  Hadith not found.\n'));return;}
  const chName=getChapterName(h.chapterId);
  console.log('\n'+DIV());
  if(mode==='-a'){
    console.log(`\n  ${cyan('Hadith #'+h.id)}  ${gray('|')}  ${bold('Chapter: '+h.chapterId)} ${gray('—')} ${yellow(chName)}\n`);
    console.log(wrapText(h.arabic)+'\n');
  } else if(mode==='-b'){
    console.log(`\n  ${cyan('Hadith #'+h.id)}  ${gray('|')}  ${bold('Chapter: '+h.chapterId)} ${gray('—')} ${yellow(chName)}\n`);
    console.log(wrapText(h.arabic)+'\n');
    console.log(`  ${bold('Narrator:')} ${magenta(h.english.narrator)}\n`);
    console.log(wrapText(h.english.text)+'\n');
  } else {
    console.log(`\n  ${cyan('Hadith #'+h.id)}  ${gray('|')}  ${bold('Chapter: '+h.chapterId)} ${gray('—')} ${yellow(chName)}\n`);
    console.log(`  ${bold('Narrator:')} ${magenta(query?highlightMatch(h.english.narrator,query):h.english.narrator)}\n`);
    console.log(wrapText(query?highlightMatch(h.english.text,query):h.english.text)+'\n');
  }
  console.log(DIV()+'\n');
}

const args = process.argv.slice(2);

if(!args.length||args[0]==='--help'){
  console.log(`\n${DIV()}\n  ${cyan('majah')}  ${gray('·')}  ${bold('Sunan Ibn Majah')}  ${gray('v'+pkg.version)}\n${DIV()}\n\n  ${bold('Usage:')}\n\n    ${cyan('majah')} ${yellow('<id>')}                   Hadith by ID\n    ${cyan('majah')} ${yellow('<id>')} ${gray('-a')}                Arabic only\n    ${cyan('majah')} ${yellow('<id>')} ${gray('-b')}                Arabic + English\n    ${cyan('majah')} ${yellow('<chapter>')} ${yellow('<n>')}           nth hadith of a chapter\n    ${cyan('majah')} ${gray('--search')} ${yellow('"<query>"')}       Search in English text\n    ${cyan('majah')} ${gray('--search')} ${yellow('"<query>"')} ${gray('--all')}   Show all results\n    ${cyan('majah')} ${gray('--random')}                 Random hadith\n    ${cyan('majah')} ${gray('--chapter')} ${yellow('<id>')}           All hadiths in chapter\n    ${cyan('majah')} ${gray('--chapters')}               List all chapters\n    ${cyan('majah')} ${gray('--info')}                   Book metadata\n    ${cyan('majah')} ${gray('--react')}                  Generate React hook\n    ${cyan('majah')} ${gray('--version')}\n    ${cyan('majah')} ${gray('--help')}\n\n${DIV()}\n`);
  process.exit(0);
}

if(args[0]==='--version'){console.log(`\n  ${cyan('sunan-ibn-majah')} ${gray('v'+pkg.version)}\n`);process.exit(0);}

if(args[0]==='--info'){
  console.log(`\n${DIV()}\n  ${cyan('Sunan Ibn Majah')}\n${DIV()}\n\n  ${bold('Title:')}        ${metadata.english.title}\n  ${bold('Author:')}       ${metadata.english.author}\n  ${bold('Total Hadiths:')} ${yellow(String(hadiths.length))}\n  ${bold('Chapters:')}     ${yellow(String(chapters.length))}\n\n${DIV()}\n`);
  process.exit(0);
}

if(args[0]==='--chapters'){
  console.log(`\n${DIV()}\n  ${cyan('Chapters')} ${gray('—')} ${bold('Sunan Ibn Majah')}\n${DIV()}\n`);
  chapters.forEach(ch=>console.log(`  ${cyan('#'+String(ch.id).padEnd(5))} ${ch.english}`));
  console.log(`\n${DIV()}\n`);process.exit(0);
}

if(args[0]==='--random'){printHadith(hadiths[Math.floor(Math.random()*hadiths.length)],args[1]);process.exit(0);}

if(args[0]==='--chapter'){
  const chapterId=parseInt(args[1]);
  const results=hadiths.filter(h=>h.chapterId===chapterId);
  const chName=getChapterName(chapterId);
  if(!results.length){console.log(yellow(`\n  No hadiths found for chapter ${chapterId}.\n`));process.exit(0);}
  console.log(`\n${DIV()}\n  ${cyan('Chapter '+chapterId)} ${gray('—')} ${bold(chName)}  ${gray('('+results.length+' hadiths)')}\n${DIV()}`);
  results.forEach(h=>{console.log(`\n  ${cyan('Hadith #'+h.id)}`);console.log(`  ${bold('Narrator:')} ${magenta(h.english.narrator)}`);console.log(wrapText(h.english.text));console.log('\n'+DIV2());});
  console.log('');process.exit(0);
}

if(args[0]==='--search'){
  const showAll=args.includes('--all');
  const query=args.slice(1).filter(a=>a!=='--all').join(' ').replace(/^["']|["']$/g,'');
  if(!query){console.log(yellow('\n  Usage: majah --search "<query>" [--all]\n'));process.exit(1);}
  const t0=Date.now();
  const results=hadiths.filter(h=>h.english?.text?.toLowerCase().includes(query.toLowerCase())||h.english?.narrator?.toLowerCase().includes(query.toLowerCase()));
  const ms=Date.now()-t0;
  console.log('\n'+DIV());
  console.log(`  ${bold('Search:')} ${yellow('"'+query+'"')}  ${gray('—')}  ${cyan(results.length+' results')}  ${gray('('+ms+'ms)')}`);
  console.log(DIV());
  if(!results.length){console.log(yellow(`\n  No results for "${query}"\n`));process.exit(0);}
  const toShow=showAll?results:results.slice(0,5);
  toShow.forEach((h,i)=>{
    const chName=getChapterName(h.chapterId);
    console.log(`\n  ${cyan('#'+(i+1))}  ${bold('Hadith '+h.id)}  ${gray('|')}  ${bold('Chapter: '+h.chapterId)} ${gray('—')} ${yellow(chName)}`);
    console.log(`  ${bold('Narrator:')} ${magenta(highlightMatch(h.english.narrator,query))}`);
    console.log(wrapText(highlightMatch(h.english.text,query)));
    console.log('\n'+DIV2());
  });
  if(!showAll&&results.length>5){console.log(`\n  ${dim('Showing')} ${cyan('5')} ${dim('of')} ${cyan(String(results.length))} ${dim('results.')}  ${yellow('Run with --all to see all results')}`);console.log(`  ${gray('majah --search "'+query+'" --all')}\n`);}
  else{console.log(`\n  ${dim('Showing all')} ${cyan(String(results.length))} ${dim('results.')}\n`);}
  process.exit(0);
}

if(args[0]==='--react'){
  const CDN='https://cdn.jsdelivr.net/npm/sunan-ibn-majah@'+pkg.version+'/data/majah.json.gz';
  const hookSrc="// Auto-generated by: majah --react\nimport { useState, useEffect } from 'react';\nconst CDN = '"+CDN+"';\nlet _cache=null,_promise=null;\nconst _subs=new Set();\nfunction _load(){if(_cache)return Promise.resolve(_cache);if(_promise)return _promise;_promise=fetch(CDN).then(r=>r.arrayBuffer()).then(buf=>{const stream=new DecompressionStream('gzip');const writer=stream.writable.getWriter();const reader=stream.readable.getReader();writer.write(new Uint8Array(buf));writer.close();const chunks=[];return(function pump(){return reader.read().then(({done,value})=>{if(done){const text=new TextDecoder().decode(new Uint8Array(chunks.reduce((a,b)=>[...a,...b],[])));const data=JSON.parse(text);const hadiths=data.hadiths;const _byId=new Map();hadiths.forEach(h=>_byId.set(h.id,h));_cache=Object.assign([],hadiths,{metadata:data.metadata,chapters:data.chapters,get:id=>_byId.get(id),getByChapter:id=>hadiths.filter(h=>h.chapterId===id),search:(q,limit=0)=>{const ql=q.toLowerCase();const r=hadiths.filter(h=>h.english?.text?.toLowerCase().includes(ql)||h.english?.narrator?.toLowerCase().includes(ql));return limit>0?r.slice(0,limit):r;},getRandom:()=>hadiths[Math.floor(Math.random()*hadiths.length)]});_subs.forEach(fn=>fn(_cache));_subs.clear();return _cache;}chunks.push(value);return pump();});})();});return _promise;}\n_load();\nexport function useMajah(){const[majah,setMajah]=useState(_cache);useEffect(()=>{if(_cache){setMajah(_cache);}else{_subs.add(setMajah);return()=>_subs.delete(setMajah);}},[]);return majah;}\nexport default useMajah;\n";
  const hooksDir=path.join(process.cwd(),'src','hooks');
  if(!fs.existsSync(hooksDir))fs.mkdirSync(hooksDir,{recursive:true});
  fs.writeFileSync(path.join(hooksDir,'useMajah.js'),hookSrc,'utf8');
  console.log(green('\n\u2713 Generated: src/hooks/useMajah.js\n'));
  process.exit(0);
}

if(args.length>=2&&!isNaN(parseInt(args[0]))&&!isNaN(parseInt(args[1]))){
  const chapterId=parseInt(args[0]),n=parseInt(args[1]);
  const inChapter=_byChapter.get(chapterId)||[];
  printHadith(inChapter[n-1]??null,args[2]);process.exit(0);
}

const id=parseInt(args[0]);
if(isNaN(id)){console.log(yellow(`\n  Unknown command: ${args[0]}. Run majah --help\n`));process.exit(1);}
printHadith(_byId.get(id)||null,args[1]);
