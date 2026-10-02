import type {Scene} from '@babylonjs/core/scene';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {CreateSphere} from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import type {AssetService,WorldView} from '../../contracts/visual';
import {solid,disk,entity} from '../shared';
import {material} from '../../assets/placeholders';
import {atmosphere} from '../../presentation/atmosphere';
import {sourceWater} from '../../presentation/sourceWater';
import {paintOuterGround} from '../../presentation/paint';
import {merchantMotion} from '../../npc/merchant';
import {createPlacer} from './decor';
import {citizenIdle} from './citizens';
import {HOUSES,HEDGES,LAMPS} from './layout';
export async function createOuterWorld(scene:Scene,assets:AssetService):Promise<WorldView>{
  scene.collisionsEnabled=true;const light=atmosphere(scene,'outer');const water=sourceWater(scene,false);
  const {place,queue,flush}=createPlacer(scene,assets);
  // Probe once: do the real files exist? If not, keep the old colored boxes so the placeholder swap still plays.
  const probe=await assets.create('CityWall',scene,undefined,'straight');const realKit=probe.root.metadata?.status!=='placeholder';probe.dispose();
  const probeTree=await assets.create('CentralTreeOuter',scene);const realTree=probeTree.root.metadata?.status!=='placeholder';probeTree.dispose();
  const box=(color:string)=>realKit?undefined:color;
  solid(scene,'outer-ground',new Vector3(4,-.15,-14),new Vector3(72,.3,76),'#819577');
  const arrivalPath=solid(scene,'arrival-path',new Vector3(0,-.028,-33),new Vector3(5,.08,36),'#C4B492');arrivalPath.checkCollisions=false;arrivalPath.metadata={cameraBlocker:false};
  disk(scene,'central-square',0,0,15,'#C7B99C');const marketPath=solid(scene,'market-path',new Vector3(23,-.024,0),new Vector3(30,.08,6),'#C7B99C');marketPath.checkCollisions=false;marketPath.metadata={cameraBlocker:false};paintOuterGround(scene);
  // World edges are invisible blockers. Hedges and houses hide them.
  for(const [x,z,w,d] of [[-32,-14,1,76],[40,-14,1,76],[4,-52,72,1],[4,24,72,1]])solid(scene,'world-edge',new Vector3(x,3,z),new Vector3(w,6,d),box('#87987A'));
  // City wall: invisible blockers (z -26, gate opening 4 m) with wall pieces on top.
  for(const [x,w]of [[-17,30],[21,38]])solid(scene,'city-wall',new Vector3(x,2,-26),new Vector3(w,4,1.8),box('#B2A083'));
  for(let x=-8.7;x>-33.5;x-=7)queue(place('CityWall','straight',x,-26,{scale:1.75,decor:true}));
  for(let x=8.7;x<40.5;x+=7)queue(place('CityWall','straight',x,-26,{scale:1.75,decor:true}));
  queue(place('CityGate','gate',0,-26,{scale:1.3}));
  // Gate: invisible blocker plus a wooden barrier in the opening. Both leave with the package.
  const gate=entity(scene,'gate',0,-26);const door=solid(scene,'closed-gate',new Vector3(0,2.25,0),new Vector3(4,4.5,.35),box('#786F51'));door.parent=gate;
  queue(place('CityWall','fence',0,0,{parent:gate,yaw:Math.PI/2,scale:.47,decor:true}));
  const waystone=entity(scene,'waystone',1.2,-43.5);const base=solid(scene,'waystone-base',new Vector3(1.2,.35,-43.5),new Vector3(.9,.7,.8),box('#8E9276'));base.metadata={cameraBlocker:true};
  queue(place('CityWall','fountain',1.2,-43.5,{scale:.55,decor:true}));
  const packageRoot=entity(scene,'arrival-package',1.2,-43.5);packageRoot.position.y=.9;queue(assets.create('FinancePackage',scene,packageRoot));waystone.metadata={interaction:'waystone'};
  // Tree: the visual sits 2.2 m north of the entity so the Look Within spot stays in front of the roots. Entity and spot keep the gameplay coordinates.
  const tree=entity(scene,'central-tree',0,0);
  queue(assets.create('CentralTreeOuter',scene,tree).then(v=>{if(realTree){v.root.position.z=2.2;v.root.scaling.scaleInPlace(16/15);}}));
  if(realTree)solid(scene,'tree-trunk',new Vector3(0,3,2.2),new Vector3(5,6,5.2));else solid(scene,'tree-trunk',new Vector3(0,3,0),new Vector3(2,6,2));
  const spot=disk(scene,'look-within-spot',0,-2.8,.9,'#D6C995',.003);spot.metadata={interaction:'look-within'};
  // Houses close the north and west alleys and frame the square. Each has one invisible blocker.
  HOUSES.forEach((h,i)=>{
    queue(place('CityBuilding',h.kind,h.x,h.z,{yaw:h.yaw,scale:h.s,decor:i>=8}));
    solid(scene,'house-blocker',new Vector3(h.x,h.h/2,h.z),new Vector3(h.w,h.h,h.d));
  });
  // Market: three stalls, props, merchant, desire object.
  for(const [i,x,z]of [[0,27,4],[1,33,3],[2,32,-4]]){
    const root=entity(scene,'market-stall-'+i,x,z);root.rotation.y=i===2?Math.PI:i===1?-Math.PI/2:0;queue(assets.create(i===1?'MarketStallB':'MarketStallA',scene,root));
    solid(scene,'stall-counter',new Vector3(x,.7,z),i===1?new Vector3(2.4,1.4,4):new Vector3(3,1.4,2.2));
  }
  const merchant=entity(scene,'merchant',27.5,2);const visual=await assets.create('Merchant',scene,merchant);const move=merchantMotion(merchant,visual);
  solid(scene,'desire-table',new Vector3(26,.38,0),new Vector3(.9,.76,.75),box('#9D764F'));queue(place('MarketProps','table',26,0,{scale:1.25,decor:true}));
  const desire=CreateSphere('desire-object',{diameter:.36,segments:10},scene);desire.position.set(26,1.1,0);desire.material=material(scene,'#D6AC51',.45);desire.metadata={interaction:'desire'};
  // Props along the market. Decor only: no colliders.
  const props:[string,number,number,number,number][]=[
    ['barrel',24.2,4.9,0,1.3],['crate',25.1,5.3,.4,1.5],['basketLarge',29.9,3.4,0,1.8],['fruitCrate',30.6,3.6,.2,2],
    ['barrel',29.5,-4.5,0,1.3],['crate',34.6,-4.7,0,1.5],['jug',35.2,-3.6,0,2],['cloth',29.2,-3.2,0,2.4],['basketSmall',24.8,-2.7,0,2.2],['crate',22.4,3.9,0,1.4],
    ['barrel',36.2,.4,0,1.3],['box',36,1.4,0,1.8],['sign',20.6,3.5,Math.PI/2,1.7],
  ];
  for(const [part,x,z,yaw,s] of props)queue(place('MarketProps',part,x,z,{yaw:part==='sign'?yaw:yaw+x,scale:s,decor:true}));
  // Street furniture.
  for(const [x,z] of LAMPS)queue(place('CityWall','lamp',x,z,{scale:1.3,decor:true}));
  for(const [x,z] of [[-9,0],[9,-2]])queue(place('CityWall','bench',x,z,{scale:.8,yaw:Math.atan2(-x,-z)+Math.PI,decor:true}));
  queue(place('CityWall','fountain',-8,7,{scale:1.7,decor:true}));solid(scene,'fountain-blocker',new Vector3(-8,.7,7),new Vector3(4.6,1.4,4.6));
  queue(place('CityWall','banner',19,4.9,{scale:1.2,decor:true}));
  // Vegetation at the edges and beside the path. Never on the walk line (x +-2.5 on the path, z +-3 on the market path).
  for(const [x,z] of HEDGES)queue(place('Vegetation','bushMedium',x,z,{scale:3,yaw:x*3.1,decor:true}));
  const plants:[string,number,number,number][]=[
    ['flowerCluster',-3.9,-47,2],['flowerCluster',4.3,-45.5,2],['fern',-4.8,-40,1.8],['fern',4.8,-38.5,1.6],['flowerCluster',-4.2,-35,2],['grass',3.9,-33,2],['bushSmall',-5.2,-29,1.5],['bushSmall',5.2,-29,1.5],
    ['flowerSmall',.5,-44.7,2],['mushroomSmall',2.4,-44.1,2],['grass',-.4,-42.9,1.4],['flowerCluster',-12,-12,2],['fern',12.5,-12.5,1.8],['bushSmall',-15,12,1.4],['bushSmall',16,13,1.4],['flowerCluster',12,12.5,2],
  ];
  for(const [part,x,z,s] of plants)queue(place('Vegetation',part,x,z,{scale:s,yaw:x*2.3,decor:true}));
  // Two citizens talk on the square. Static mesh with a light code idle. No story, no interaction.
  const folks:[string,'Citizen'|'CitizenMale',number,number,number,number][]=[['citizen-a','Citizen',-6.8,-7.2,.5,0],['citizen-b','CitizenMale',-5.4,-6.2,-2.4,1.7]];
  const idles:((dt:number,player:Vector3)=>void)[]=[];
  for(const [name,id,x,z,yaw,phase] of folks){
    const root=entity(scene,name,x,z);root.rotation.y=yaw;queue(assets.create(id,scene,root).then(v=>{idles.push(citizenIdle(root,v,phase));}));
    solid(scene,name+'-blocker',new Vector3(x,.85,z),new Vector3(.5,1.7,.5));
  }
  await flush();
  return {scene,spawn:new Vector3(0,0,-47),gate,beetle:null,packageRoot,update(state,dt,player){const owned=state.facts.includes('PACKAGE_RECEIVED');gate.setEnabled(!owned);packageRoot.setEnabled(!owned);light.update(state);water.update(dt,state.traits.attachment);move(dt,player);for(const idle of idles)idle(dt,player);desire.rotation.y+=dt*.3;spot.scaling.setAll(state.facts.includes('TREE_DISCOVERED')?1:.85);},dispose(){light.dispose();water.dispose();}};
}
