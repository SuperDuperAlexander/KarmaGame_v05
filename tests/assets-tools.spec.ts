import {describe,it,expect} from 'vitest';
import {readdir,readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {optimizeGlb,maxTexture,settingsKey} from '../tools/assets/optimize.mjs';
import {parseGlb} from '../tools/assets/glb.mjs';
const root=resolve('3D Models/assets');
async function glbFiles(dir:string):Promise<string[]>{const out:string[]=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())out.push(...await glbFiles(p));else if(e.name.endsWith('.glb'))out.push(p);}return out;}
describe('Asset optimizer',()=>{
  it('uses smaller textures for package_chain and a cache key per setting',()=>{expect(maxTexture('package_chain.glb')).toBe(512);expect(maxTexture('player.glb')).toBe(1024);expect(settingsKey('player.glb')).not.toBe(settingsKey('package_chain.glb'));});
  it('keeps every node name, skin and clip, and does not grow files',async()=>{
    for(const file of await glbFiles(root)){
      const raw=await readFile(file);const out=await optimizeGlb(raw,file);const a=parseGlb(raw),b=parseGlb(out);
      const names=new Set(b.nodes);expect(a.nodes.filter(n=>!names.has(n)),file).toEqual([]);
      expect(b.skins,file).toBe(a.skins);expect(b.joints,file).toBe(a.joints);expect([...b.animations].sort(),file).toEqual([...a.animations].sort());
      expect(out.length,file).toBeLessThan(raw.length);
    }
  },120000);
});
