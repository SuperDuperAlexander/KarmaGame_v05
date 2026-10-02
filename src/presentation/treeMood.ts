import type {Scene} from '@babylonjs/core/scene';
import type {Material} from '@babylonjs/core/Materials/material';
import {InstancedMesh} from '@babylonjs/core/Meshes/instancedMesh';
import {Color3} from '@babylonjs/core/Maths/math.color';
import type {TransformNode} from '@babylonjs/core/Meshes/transformNode';

type Leaf={albedoColor?:Color3;diffuseColor?:Color3;emissiveColor?:Color3};
const white=new Color3(1,1,1),warm=new Color3(1.18,.96,.55),glow=new Color3(.3,.24,.05);
/**
 * Outer tree leaves (registry node map `leaves`). A slight warm gold shift with traits.attachment, and a soft
 * pulse when TREE_DISCOVERED turns on. The steady look comes from state only, so a reload shows the same mood (AD-9).
 */
export function treeMood(scene:Scene){
  let mats:Leaf[]|null=null;let pulse=0;let t=0;let wait=0;
  function find(){
    const tree=scene.getTransformNodeByName('central-tree') as TransformNode|null;if(!tree)return;
    const out=new Map<Material,Material>();
    for(const m of tree.getChildMeshes(false)){
      if(!/leaves/i.test(m.name))continue;
      const target=m instanceof InstancedMesh?m.sourceMesh:m;const old=target.material;if(!old)continue;
      let copy=out.get(old);if(!copy){copy=old.clone(old.name+'-leaves')??old;out.set(old,copy);}target.material=copy;
    }
    if(out.size)mats=[...out.values()].map(m=>m as unknown as Leaf);
  }
  return {
    pulse(){pulse=1;},
    update(dt:number,attachment:number,discovered:boolean){
      if(!mats){if(wait--<=0){wait=90;find();}if(!mats)return;}
      t+=dt;pulse=Math.max(0,pulse-dt*.6);
      const k=Math.min(1,attachment)*.55;const breathe=discovered?.04+Math.sin(t*1.2)*.02:0;
      for(const m of mats){
        const tint=Color3.Lerp(white,warm,k);
        if(m.albedoColor)m.albedoColor=tint;else if(m.diffuseColor)m.diffuseColor=tint;
        m.emissiveColor=glow.scale(pulse*pulse*1.2+breathe+k*.12);
      }
    },
  };
}
