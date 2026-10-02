import type {Scene} from '@babylonjs/core/scene';
import type {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import type {AssetId,AssetService,Visual} from '../../contracts/visual';
import {entity} from '../shared';
import {freezeStatic} from '../freeze';

export interface PlaceOptions {y?:number;yaw?:number;scale?:number;
  /** Decor is skipped when only the code placeholder exists. Structure is not. */
  decor?:boolean;parent?:TransformNode}

/** Places one asset (or one kit part) as a visual only. No collider, not pickable. */
export function createPlacer(scene:Scene,assets:AssetService){
  const tasks:Promise<unknown>[]=[];
  async function place(id:AssetId,part:string|undefined,x:number,z:number,o:PlaceOptions={}):Promise<Visual|null>{
    const root=entity(scene,part?`${id}.${part}`:id,x,z);root.position.y=o.y??0;root.rotation.y=o.yaw??0;if(o.parent)root.parent=o.parent;
    const visual=await assets.create(id,scene,root,part);
    if(o.decor&&visual.root.metadata?.status==='placeholder'){visual.dispose();root.dispose();return null;}
    if(o.scale)visual.root.scaling.setAll(o.scale);
    for(const mesh of root.getChildMeshes(false))mesh.isPickable=false;
    freezeStatic(root);
    return visual;
  }
  return {place,queue(promise:Promise<unknown>){tasks.push(promise);},async flush(){await Promise.all(tasks);tasks.length=0;}};
}
