import type {Scene} from '@babylonjs/core/scene';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import type {AssetId,AssetService,WorldView} from '../../contracts/visual';
import {solid,disk,entity} from '../shared';
import {atmosphere} from '../../presentation/atmosphere';
import {sourceWater} from '../../presentation/sourceWater';
import {createInnerChain} from '../../props/chain';
import {beetleMotion} from '../../creatures/beetle';
import {selectors} from '../../state/selectors';
import {treeGlow} from './treeGlow';

interface Place{x:number;y?:number;z:number;s?:number;ry?:number}
/** Put one kit part at a place. Kit parts sit in a row along X in the file, so the row offset is reset. */
async function part(scene:Scene,assets:AssetService,id:AssetId,name:string,at:Place){
  const node=entity(scene,`${id.toLowerCase()}-${name}`,at.x,at.z);node.position.y=at.y??0;node.scaling.setAll(at.s??1);node.rotation.y=at.ry??0;
  const visual=await assets.create(id,scene,node,name);
  if(visual.root.metadata?.status!=='placeholder')for(const m of visual.root.getChildMeshes(false))m.position.x=0;
  return node;
}
export async function createInnerWorld(scene:Scene,assets:AssetService):Promise<WorldView>{
  scene.collisionsEnabled=true;const light=atmosphere(scene,'inner');const water=sourceWater(scene,true);
  const ground=solid(scene,'inner-ground',new Vector3(0,-.25,0),new Vector3(24,.5,24));ground.metadata={cameraBlocker:false};disk(scene,'inner-platform',0,0,11,'#4F6670');
  for(let i=0;i<24;i++){const a=i*Math.PI*2/24;const blocker=solid(scene,'inner-ring',new Vector3(Math.cos(a)*11.65,1.5,Math.sin(a)*11.65),new Vector3(3,3,1));blocker.rotation.y=-a+Math.PI/2;}
  // The glTF loader turns the file X axis. Mirror X so attachment roots lie east, fear roots west. Scale 1.2 and turn -40 degrees: the root feet form a wall at the ring and leave arrival, package, return spot and beetle free.
  const tree=entity(scene,'inner-tree',0,0);tree.scaling.set(-1.2,1.2,1.2);tree.rotation.y=-40*Math.PI/180;await assets.create('CentralTreeInner',scene,tree);solid(scene,'inner-trunk',new Vector3(0,5,0),new Vector3(2.7,10,2.7));
  const glow=treeGlow(tree);
  // Rim rocks sit just outside the invisible ring blocker. The cliff closes the view to the north.
  const rim:[string,number,number][]=[['small_A',0,.7],['medium_A',1,.9],['small_B',2,.8],['medium_B',3,.8],['large',4,.55],['small_A',5,.8],['medium_B',6,.9],['small_B',7,.7],['medium_A',8,.9],['large',9,.5],['small_A',10,.8],['medium_B',11,.8]];
  for(const [name,i,s] of rim){const a=(i+.5)*Math.PI*2/12+.2;await part(scene,assets,'Rock',name,{x:Math.cos(a)*12.9,z:Math.sin(a)*12.9,s,ry:-a});}
  await part(scene,assets,'Rock','cliff_wall',{x:0,y:-1,z:21,s:2.2,ry:Math.PI});
  await part(scene,assets,'Rock','arch',{x:-19,y:-1,z:-2,s:1.3,ry:Math.PI/2});
  await part(scene,assets,'Rock','stalagmite',{x:15,y:-1,z:12,s:1.6});
  // Floating islands. They are far from the ring and have no collider.
  await part(scene,assets,'InnerPlatform','large',{x:-19,y:-1.5,z:9,s:1.2,ry:.4});
  await part(scene,assets,'InnerPlatform','long',{x:17,y:-1.8,z:-11,s:1,ry:-.5});
  await part(scene,assets,'InnerPlatform','medium',{x:-4,y:-2.2,z:-21,s:1.3});
  await part(scene,assets,'InnerPlatform','small',{x:-15,y:-1.2,z:-13,s:1.3});
  await part(scene,assets,'InnerPlatform','round',{x:19,y:-1.4,z:5,s:1.4});
  const returnSpot=disk(scene,'return-spot',0,-3.4,.9,'#AEC7B6',.003);returnSpot.metadata={interaction:'return'};
  const packageRoot=entity(scene,'reflection-package',4,-2);packageRoot.position.y=.75;await assets.create('FinancePackage',scene,packageRoot);disk(scene,'package-root',4,-2,1.3,'#8E9D87',-.045);packageRoot.metadata={interaction:'reflect'};
  const beetle=entity(scene,'attachment-beetle',7.5,-.5);const beetleVisual=await assets.create('AttachmentBeetle',scene,beetle);
  // Model faces +Z. Turn it so the chain anchor side looks to the package.
  const yaw=Math.atan2(4-7.5,-2+.5);const motion=beetleMotion(beetle,yaw,beetleVisual.root);disk(scene,'beetle-zone',7.5,-.5,1.8,'#888E72',-.043);
  const chain=await createInnerChain(scene,assets,new Vector3(4,.58,-2),new Vector3(7,.34,-.5));
  const crystals:[string,number,number,number][]=[['cluster',-7,-4,1.4],['medium',-8,2,1.6],['tall',-5,7,.45],['cluster',6,7,1.4],['medium',9,4,1.6]];
  for(const [name,x,z,s] of crystals)await part(scene,assets,'Crystal',name,{x,z,s});
  return {scene,spawn:new Vector3(0,0,-7),gate:null,beetle,packageRoot,update(state,dt,_player){light.update(state);water.update(dt,state.traits.attachment);glow(state,dt);motion(state,dt);chain.setEnabled(selectors.chainState(state)==='attached');returnSpot.scaling.setAll(selectors.reflectionDone(state)?1:.85);},dispose(){light.dispose();water.dispose();}};
}
