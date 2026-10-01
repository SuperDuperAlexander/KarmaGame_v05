import type {Scene} from '@babylonjs/core/scene';
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight';
import {DirectionalLight} from '@babylonjs/core/Lights/directionalLight';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {Color3,Color4} from '@babylonjs/core/Maths/math.color';
import type {WorldId,WorldState} from '../contracts/state';
export function atmosphere(scene:Scene,world:WorldId){
  const inner=world==='inner';scene.clearColor=inner?new Color4(.055,.105,.16,1):new Color4(.68,.78,.8,1);
  scene.fogMode=3;scene.fogStart=inner?20:45;scene.fogEnd=inner?70:125;scene.fogColor=inner?new Color3(.055,.105,.16):new Color3(.68,.78,.8);
  const sky=new HemisphericLight('sky',new Vector3(0,1,0),scene);sky.intensity=inner?.55:.45;sky.groundColor=inner?new Color3(.09,.16,.2):new Color3(.42,.33,.25);
  const sun=new DirectionalLight('sun',new Vector3(-.4,-1,.3),scene);sun.intensity=inner?.55:.65;sun.diffuse=inner?new Color3(.67,.8,1):new Color3(1,.89,.68);
  return {update(state:Readonly<WorldState>){const tension=state.traits.attachment;sun.diffuse=inner?new Color3(.65+tension*.2,.8,1-tension*.12):new Color3(1,.89-tension*.04,.68-tension*.03);},dispose(){sky.dispose();sun.dispose();}};
}
