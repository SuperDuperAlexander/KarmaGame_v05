import {readdir,readFile,mkdir,copyFile} from 'node:fs/promises';
import {join,dirname,relative,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {sourceRoot} from './paths.mjs';
const source=await sourceRoot();const destination=resolve('public/assets');let copied=0,kept=0;
async function copy(from,to){const data=await readFile(from);const hash=createHash('sha256').update(data).digest('hex');try{if(createHash('sha256').update(await readFile(to)).digest('hex')===hash){kept++;return;}}catch{/* New file. */}await mkdir(dirname(to),{recursive:true});await copyFile(from,to);copied++;}
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const path=join(dir,e.name);if(e.isDirectory())await walk(path);else if(e.name.toLowerCase().endsWith('.glb'))await copy(path,join(destination,relative(join(source,'3D Models/assets'),path)));}}
await walk(join(source,'3D Models/assets'));await copy(join(source,'character-rig-test/public/player_rigged_test.glb'),join(destination,'characters/player_rigged_test.glb'));
console.log(`Assets copied: ${copied}. Assets unchanged: ${kept}.`);
