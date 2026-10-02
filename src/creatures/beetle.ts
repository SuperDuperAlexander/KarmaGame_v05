import type {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {InstancedMesh} from '@babylonjs/core/Meshes/instancedMesh';
import {Color3} from '@babylonjs/core/Maths/math.color';
import type {Material} from '@babylonjs/core/Materials/material';
import type {WorldState} from '../contracts/state';
import {selectors} from '../state/selectors';

/** Warm gold emissive on the shell. The material is cloned so no other mesh glows. */
function glowMaterials(root:TransformNode){
  const seen=new Map<Material,Material>();const list:Material[]=[];
  for(const m of root.getChildMeshes(false)){
    const target=m instanceof InstancedMesh?m.sourceMesh:m;const old=target.material;if(!old)continue;
    let copy=seen.get(old);if(!copy){copy=old.clone(old.name+'-beetle')??old;seen.set(old,copy);list.push(copy);
      // PBR glTF material: let the albedo texture (gold veins) light itself.
      const pbr=copy as unknown as {albedoTexture?:unknown;emissiveTexture?:unknown};if(pbr.albedoTexture&&!pbr.emissiveTexture)pbr.emissiveTexture=pbr.albedoTexture;}
    target.material=copy;
  }
  return list;
}
const gold=new Color3(1,.72,.28);
/**
 * Beetle state comes from selectors (spec 18.8): hidden, dormant, attached.
 * Only `attached` shows the beetle in the slice. It is tense, breathes small and fast, and glows warm.
 * `yaw` turns the model. `visual` is the asset root; its scale is used for the breath only.
 */
export function beetleMotion(root:TransformNode,yaw=0,visual?:TransformNode){
  let t=0;const mats=glowMaterials(root);
  return (state:Readonly<WorldState>,dt:number)=>{
    const mode=selectors.beetleState(state);const shown=mode==='attached';
    root.setEnabled(shown);root.metadata={...root.metadata,state:mode};
    if(!shown)return;
    t+=dt;root.rotation.y=yaw+Math.sin(t*1.2)*.05;
    const breath=Math.sin(t*3.4);
    if(visual)visual.scaling.set(1+breath*.012,1+breath*.022,1+breath*.012);
    // Glow follows the attachment trait: a little more when desire is high.
    const level=.5+Math.min(1,state.traits.attachment)*.5+breath*.08;
    for(const m of mats){const g=m as unknown as {emissiveColor?:Color3;emissiveIntensity?:number};if(g.emissiveColor){g.emissiveColor=gold.scale(level);}}
  };
}
