import {describe,it,expect} from 'vitest';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {createAssetService} from '../src/assets/feature';
import {registry} from '../src/assets/registry';
import {createWorldFactory} from '../src/world/feature';
import {HOUSES,HEDGES,LAMPS,houseRow} from '../src/world/outer/layout';

const rect=(h:{x:number;z:number;w:number;d:number})=>({x0:h.x-h.w/2,x1:h.x+h.w/2,z0:h.z-h.d/2,z1:h.z+h.d/2});
const hit=(a:ReturnType<typeof rect>,b:ReturnType<typeof rect>)=>a.x0<b.x1&&a.x1>b.x0&&a.z0<b.z1&&a.z1>b.z0;

describe('Outer world layout',()=>{
  it('keeps houses apart from each other',()=>{
    for(let i=0;i<HOUSES.length;i++)for(let j=i+1;j<HOUSES.length;j++)expect(hit(rect(HOUSES[i]),rect(HOUSES[j])),`${i} vs ${j}`).toBe(false);
  });
  it('keeps houses off the walk lines',()=>{
    const walk=[{x0:-2.5,x1:2.5,z0:-51,z1:-21},{x0:8,x1:38,z0:-3,z1:3},{x0:-2,x1:2,z0:-27,z1:-25},{x0:22,x1:35,z0:-6,z1:6}];
    for(const h of HOUSES){for(const w of walk)expect(hit(rect(h),w)).toBe(false);
      const r=rect(h);const nearX=Math.max(r.x0,Math.min(0,r.x1)),nearZ=Math.max(r.z0,Math.min(0,r.z1));expect(Math.hypot(nearX,nearZ)).toBeGreaterThan(15);}
  });
  it('closes the north and west alleys with a gap smaller than the player',()=>{
    const north=HOUSES.filter(h=>h.z>17&&Math.abs(h.yaw)<.01).sort((a,b)=>a.x-b.x);
    for(let i=1;i<north.length;i++)expect(rect(north[i]).x0-rect(north[i-1]).x1).toBeLessThan(.6);
    const west=HOUSES.filter(h=>h.x<-20&&h.z>-18&&h.z<15).sort((a,b)=>a.z-b.z);
    for(let i=1;i<west.length;i++)expect(rect(west[i]).z0-rect(west[i-1]).z1).toBeLessThan(.6);
    expect(north.length).toBeGreaterThanOrEqual(8);expect(west.length).toBeGreaterThanOrEqual(4);
  });
  it('keeps hedges and lamps off the walk lines',()=>{
    for(const [x,z] of HEDGES){expect(z<-49||Math.abs(x)>29).toBe(true);}
    for(const [x,z] of LAMPS)expect(Math.abs(x)>=3.4||z>-20).toBe(true);
  });
  it('lays a row facing the right way',()=>{
    const [h]=houseRow(['small'],'S',17,0);expect(h.z).toBeCloseTo(17+h.d/2);expect(h.yaw).toBe(0);
    const [e]=houseRow(['small'],'E',-18.5,0);expect(e.x).toBeCloseTo(-18.5-e.w/2);
  });
});

describe('Outer world registry',()=>{
  it('gives each kit entry the parts the world uses, as temporary art',()=>{
    for(const id of ['CityGate','CityWall','CityBuilding','MarketProps','Vegetation'] as const){expect(registry[id].status).toBe('temporary');expect(Object.keys(registry[id].parts??{}).length).toBeGreaterThan(0);}
    for(const part of ['small','medium','corner','tower'])expect(registry.CityBuilding.parts?.[part]).toBeTruthy();
    expect(registry.CityGate.parts?.gate).toEqual(['city_gate']);
    expect(registry.Citizen.file).toBe('/assets/characters/citizen_female.glb');expect(registry.CitizenMale.file).toBe('/assets/characters/citizen_male.glb');
    expect(Object.keys(registry.CentralTreeOuter.nodes)).toEqual(expect.arrayContaining(['leaves','trunk','roots']));
  });
});

describe('Outer world scene',()=>{
  it('keeps gameplay coordinates and invisible blockers',async()=>{
    const engine=new NullEngine();const scene=new Scene(engine);const view=await createWorldFactory().create('outer',scene,createAssetService(true));
    expect([view.spawn.x,view.spawn.z]).toEqual([0,-47]);
    const at=(name:string)=>scene.getTransformNodeByName(name)!;
    expect([at('waystone').position.x,at('waystone').position.z]).toEqual([1.2,-43.5]);expect([at('gate').position.x,at('gate').position.z]).toEqual([0,-26]);expect([at('central-tree').position.x,at('central-tree').position.z]).toEqual([0,0]);
    const door=scene.getMeshByName('closed-gate')!;expect(door.getBoundingInfo().boundingBox.extendSize.x*2).toBeCloseTo(4);expect(door.checkCollisions).toBe(true);
    for(const m of scene.meshes.filter(m=>m.name==='house-blocker'))expect(m.checkCollisions).toBe(true);
    expect(scene.getMeshByName('desire-object')!.metadata.interaction).toBe('desire');expect(scene.getMeshByName('look-within-spot')!.metadata.interaction).toBe('look-within');
    expect(scene.getMeshByName('outer-ground')!.isPickable).toBe(false);
    view.dispose();scene.dispose();engine.dispose();
  });
});
