import {readdir,readFile,writeFile,mkdir,copyFile,stat} from 'node:fs/promises';
import {join,dirname,relative,resolve,basename,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {sourceRoot} from './paths.mjs';
import {optimizeGlb,settingsKey} from './optimize.mjs';
import {parseGlb} from './glb.mjs';
export const CACHE_NAME='.optimize-cache.json';
const source=await sourceRoot();const destination=resolve('public/assets');
let cache={};try{cache=JSON.parse(await readFile(join(destination,CACHE_NAME),'utf8'));}catch{/* No cache yet. */}
const next={};let optimized=0,kept=0,fallback=0;
const sha=data=>createHash('sha256').update(data).digest('hex');
const exists=async p=>{try{await stat(p);return true;}catch{return false;}};
function nodeNamesLost(rawData,outData){const out=new Set(parseGlb(outData).nodes);return parseGlb(rawData).nodes.filter(n=>!out.has(n));}
async function put(from,to,{raw=false}={}){
  const data=await readFile(from);const key=raw?'raw':settingsKey(basename(from));const hash=sha(data);const id=relative(destination,to).split(sep).join('/');
  if(cache[id]?.hash===hash&&cache[id]?.settings===key&&await exists(to)){next[id]=cache[id];kept++;return;}
  await mkdir(dirname(to),{recursive:true});
  if(raw){await copyFile(from,to);next[id]={hash,settings:key};optimized++;return;}
  try{const out=await optimizeGlb(data,basename(from));const lost=nodeNamesLost(data,out);if(lost.length)throw Error(`Lost node names: ${lost.join(',')}`);await writeFile(to,out);optimized++;}
  catch(error){await copyFile(from,to);fallback++;console.warn(`WARN ${id}: optimize failed, raw file copied (${error.message})`);next[id]={hash,settings:'fallback'};return;}
  next[id]={hash,settings:key};
}
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const path=join(dir,e.name);if(e.isDirectory())await walk(path);else if(e.name.toLowerCase().endsWith('.glb'))await put(path,join(destination,relative(join(source,'3D Models/assets'),path)));}}
await walk(join(source,'3D Models/assets'));
await put(join(source,'character-rig-test/public/player_rigged_test.glb'),join(destination,'characters/player_rigged_test.glb'),{raw:true});
await mkdir(destination,{recursive:true});await writeFile(join(destination,CACHE_NAME),JSON.stringify(next,null,1));
console.log(`Assets optimized: ${optimized}. Assets unchanged: ${kept}. Raw fallbacks: ${fallback}.`);
