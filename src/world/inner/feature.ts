import type {Scene} from '@babylonjs/core/scene';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import type {AssetService,WorldView} from '../../contracts/visual';
import {solid,disk,entity} from '../shared';
import {atmosphere} from '../../presentation/atmosphere';
import {sourceWater} from '../../presentation/sourceWater';
import {createChain} from '../../props/chain';
import {beetleMotion} from '../../creatures/beetle';
export async function createInnerWorld(scene:Scene,assets:AssetService):Promise<WorldView>{
  scene.collisionsEnabled=true;const light=atmosphere(scene,'inner');const water=sourceWater(scene,true);
  const ground=solid(scene,'inner-ground',new Vector3(0,-.25,0),new Vector3(24,.5,24));ground.metadata={cameraBlocker:false};disk(scene,'inner-platform',0,0,11,'#607C83');
  for(let i=0;i<24;i++){const a=i*Math.PI*2/24;const blocker=solid(scene,'inner-ring',new Vector3(Math.cos(a)*11.65,1.5,Math.sin(a)*11.65),new Vector3(3,3,1));blocker.rotation.y=-a+Math.PI/2;}
  await assets.create('CentralTreeInner',scene,entity(scene,'inner-tree',0,0));solid(scene,'inner-trunk',new Vector3(0,5,0),new Vector3(2.7,10,2.7));
  const returnSpot=disk(scene,'return-spot',0,-3.4,.9,'#AEC7B6',.003);returnSpot.metadata={interaction:'return'};
  const packageRoot=entity(scene,'reflection-package',4,-2);packageRoot.position.y=.75;await assets.create('FinancePackage',scene,packageRoot);disk(scene,'package-root',4,-2,1.3,'#8E9D87',-.045);packageRoot.metadata={interaction:'reflect'};
  const beetle=entity(scene,'attachment-beetle',7.5,-.5);await assets.create('AttachmentBeetle',scene,beetle);const motion=beetleMotion(beetle);disk(scene,'beetle-zone',7.5,-.5,1.8,'#888E72',-.043);
  const chain=createChain(scene,new Vector3(4,.58,-2),new Vector3(7,.28,-.5));
  for(const [x,z]of [[-7,-4],[-8,2],[-5,7],[6,7],[9,4]]){const crystal=entity(scene,'crystal',x,z);await assets.create('Crystal',scene,crystal);}
  return {scene,spawn:new Vector3(0,0,-7),gate:null,beetle,packageRoot,update(state,dt,_player){light.update(state);water.update(dt,state.traits.attachment);motion(state,dt);chain.setEnabled(state.facts.includes('ATTACHMENT_SEEN'));returnSpot.scaling.setAll(state.facts.includes('MONEY_REFLECTION_SAVED')?1:.85);},dispose(){light.dispose();water.dispose();}};
}
