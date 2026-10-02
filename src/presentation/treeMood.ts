import type {Scene} from '@babylonjs/core/scene';
import type {Material} from '@babylonjs/core/Materials/material';
import {InstancedMesh} from '@babylonjs/core/Meshes/instancedMesh';
import {Color3} from '@babylonjs/core/Maths/math.color';
import type {TransformNode} from '@babylonjs/core/Meshes/transformNode';

type Leaf={albedoColor?:Color3;diffuseColor?:Color3;emissiveColor?:Color3;albedoTexture?:unknown;diffuseTexture?:unknown;emissiveTexture?:unknown};
// rich is the steady leaf tint: warmer, more saturated green. tips is a gold lift that follows the leaf texture, so light leaf tips glow gold.
const white=new Color3(1.08,1.3,.7),warm=new Color3(1.3,1.12,.5),glow=new Color3(.3,.24,.05),tips=new Color3(.26,.2,.03);
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
    if(out.size)mats=[...out.values()].map(m=>{const l=m as unknown as Leaf;const tex=l.albedoTexture??l.diffuseTexture;if(tex&&!l.emissiveTexture)l.emissiveTexture=tex;return l;});
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
        m.emissiveColor=glow.scale(pulse*pulse*1.2+breathe+k*.12).addInPlace(tips);
      }
    },
  };
}
