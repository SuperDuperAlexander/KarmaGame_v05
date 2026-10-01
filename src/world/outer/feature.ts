import type {Scene} from '@babylonjs/core/scene';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {CreateSphere} from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import type {AssetService,WorldView} from '../../contracts/visual';
import {solid,disk,entity} from '../shared';
import {material} from '../../assets/placeholders';
import {atmosphere} from '../../presentation/atmosphere';
import {sourceWater} from '../../presentation/sourceWater';
import {merchantMotion} from '../../npc/merchant';
export async function createOuterWorld(scene:Scene,assets:AssetService):Promise<WorldView>{
  scene.collisionsEnabled=true;const light=atmosphere(scene,'outer');const water=sourceWater(scene,false);
  solid(scene,'outer-ground',new Vector3(4,-.15,-14),new Vector3(72,.3,76),'#819577');
  solid(scene,'arrival-path',new Vector3(0,-.04,-36),new Vector3(5,.08,30),'#C4B492');
  disk(scene,'central-square',0,0,15,'#C7B99C');solid(scene,'market-path',new Vector3(23,-.04,0),new Vector3(30,.08,6),'#C7B99C');
  for(const [x,z,w,d] of [[-32,-14,1,76],[40,-14,1,76],[4,-52,72,1],[4,24,72,1]])solid(scene,'world-edge',new Vector3(x,3,z),new Vector3(w,6,d),'#87987A');
  for(const [x,w]of [[-17,30],[21,38]])solid(scene,'city-wall',new Vector3(x,2,-26),new Vector3(w,4,1.3),'#B2A083');
  await assets.create('CityGate',scene,entity(scene,'city-gate-shell',0,-26));
  const gate=entity(scene,'gate',0,-26);const door=solid(scene,'closed-gate',new Vector3(0,2.25,0),new Vector3(4,4.5,.35),'#786F51');door.parent=gate;
  const waystone=entity(scene,'waystone',1.2,-43.5);const base=solid(scene,'waystone-base',new Vector3(1.2,.35,-43.5),new Vector3(.9,.7,.8),'#8E9276');base.metadata={cameraBlocker:true};
  const packageRoot=entity(scene,'arrival-package',1.2,-43.5);packageRoot.position.y=.9;await assets.create('FinancePackage',scene,packageRoot);waystone.metadata={interaction:'waystone'};
  const tree=entity(scene,'central-tree',0,0);await assets.create('CentralTreeOuter',scene,tree);solid(scene,'tree-trunk',new Vector3(0,3,0),new Vector3(2,6,2));
  const spot=disk(scene,'look-within-spot',0,-2.8,.9,'#D6C995',.003);spot.metadata={interaction:'look-within'};
  // Distant shells close later alleys. They contain no later story.
  for(const [x,z]of [[-22,-8],[-22,4],[-16,17],[-5,19],[8,20],[20,19],[35,13],[37,-15]]){await assets.create('CityBuilding',scene,entity(scene,'city-house',x,z));solid(scene,'house-blocker',new Vector3(x,2.5,z),new Vector3(5,5,4));}
  for(const [i,x,z]of [[0,27,4],[1,33,3],[2,32,-4]]){const root=entity(scene,'market-stall-'+i,x,z);root.rotation.y=i===2?Math.PI:0;await assets.create(i===1?'MarketStallB':'MarketStallA',scene,root);solid(scene,'stall-counter',new Vector3(x,.7,z),new Vector3(3,1.4,1.2));}
  const merchant=entity(scene,'merchant',27.5,2);const visual=await assets.create('Merchant',scene,merchant);const move=merchantMotion(merchant,visual);
  solid(scene,'desire-table',new Vector3(26,.38,0),new Vector3(.9,.76,.75),'#9D764F');const desire=CreateSphere('desire-object',{diameter:.36,segments:10},scene);desire.position.set(26,1.1,0);desire.material=material(scene,'#D6AC51',.3);desire.metadata={interaction:'desire'};
  return {scene,spawn:new Vector3(0,0,-47),gate,beetle:null,packageRoot,update(state,dt,player){const owned=state.facts.includes('PACKAGE_RECEIVED');gate.setEnabled(!owned);packageRoot.setEnabled(!owned);light.update(state);water.update(dt,state.traits.attachment);move(dt,player);desire.rotation.y+=dt*.3;spot.scaling.setAll(state.facts.includes('TREE_DISCOVERED')?1:.85);},dispose(){light.dispose();water.dispose();}};
}
