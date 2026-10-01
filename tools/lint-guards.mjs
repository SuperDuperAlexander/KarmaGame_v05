import {readdir, readFile} from 'node:fs/promises';
async function check(dir) {
  for(const entry of await readdir(dir,{withFileTypes:true})) {
    const file = `${dir}/${entry.name}`;
    if(entry.isDirectory()) {await check(file);continue;}
    if(!file.endsWith('.ts')) continue;
    const source=await readFile(file,'utf8');
    if(/from\s+['"]@babylonjs\/core['"]/.test(source)) throw Error(`Barrel import: ${file}`);
    if(!file.startsWith('src/assets/registry/') && /['"][^'"\n]*\.glb['"]/.test(source)) throw Error(`Asset path outside registry: ${file}`);
    if(/^src\/(state|rules|save|reflection|narrative)\//.test(file) && source.includes('@babylonjs/')) throw Error(`Render code in pure module: ${file}`);
  }
}
await check('src');
console.log('Code guards passed.');
