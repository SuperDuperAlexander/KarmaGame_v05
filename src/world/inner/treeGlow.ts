import type {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {InstancedMesh} from '@babylonjs/core/Meshes/instancedMesh';
import {Color3} from '@babylonjs/core/Maths/math.color';
import type {Material} from '@babylonjs/core/Materials/material';
import type {WorldState} from '../../contracts/state';

type Glow={albedoColor?:Color3;albedoTexture?:unknown;emissiveColor?:Color3;emissiveTexture?:unknown;diffuseColor?:Color3};
/** Own a material copy for the meshes whose names match, so only they change. */
function split(root:TransformNode,pattern:RegExp){
  const out=new Map<Material,Material>();
  for(const m of root.getChildMeshes(false)){
    if(!pattern.test(m.name))continue;
    const target=m instanceof InstancedMesh?m.sourceMesh:m;const old=target.material;if(!old)continue;
    let copy=out.get(old);if(!copy){copy=old.clone(old.name+'-roots')??old;out.set(old,copy);}
    target.material=copy;
  }
  return [...out.values()].map(m=>m as unknown as Glow);
}
const gold=new Color3(1,.68,.2),dim=new Color3(.62,.68,.8);
/**
 * Mirror table (spec 8.3): desire -> golden, tight root veins. Fear roots stay dim and cool.
 * Level comes from traits.attachment only, so a reload shows the same look (AD-9).
 */
export function treeGlow(tree:TransformNode){
  const attach=split(tree,/root_attachment_/),fear=split(tree,/root_fear_/);let t=0;
  for(const m of attach)if(m.albedoTexture&&!m.emissiveTexture)m.emissiveTexture=m.albedoTexture;
  // The file already paints fear roots cold. Only dim them a little, no glow.
  for(const m of fear)if(m.albedoColor)m.albedoColor=dim;
  return (state:Readonly<WorldState>,dt:number)=>{
    t+=dt;const level=.25+Math.min(1,state.traits.attachment)*1.3+Math.sin(t*1.6)*.07;
    for(const m of attach)if(m.emissiveColor)m.emissiveColor=gold.scale(level);
  };
}
