import type {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {InstancedMesh} from '@babylonjs/core/Meshes/instancedMesh';
import {Color3} from '@babylonjs/core/Maths/math.color';
import type {Material} from '@babylonjs/core/Materials/material';
import type {WorldState} from '../../contracts/state';

type Glow={transparencyMode?:number|null;albedoColor?:Color3;albedoTexture?:unknown;emissiveColor?:Color3;emissiveTexture?:unknown;diffuseColor?:Color3};
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
  // Gold roots glow with a flat colour, not through the dark bark texture, so they read as gold veins from far.
  for(const m of attach)m.emissiveTexture=null;
  // Every other root, the trunk and the branches glow a little from inside, cool and blue, so the roots read as a canopy and not as a black ceiling.
  const own=new Set<Material>([...attach,...fear].map(m=>m as unknown as Material));
  for(const mesh of tree.getChildMeshes(false)){const target=mesh instanceof InstancedMesh?mesh.sourceMesh:mesh;const m=target.material as unknown as Glow|null;
    if(!m||own.has(m as unknown as Material))continue;own.add(m as unknown as Material);m.emissiveColor=new Color3(.07,.17,.34);}
  // The file already paints fear roots cold. Only dim them a little, no glow.
  for(const m of fear){if(m.albedoColor)m.albedoColor=dim;m.emissiveTexture=null;m.emissiveColor=new Color3(.07,.2,.42);}
  // Why the screen filled with a flat dark shape: the file marks its material OPAQUE, so PBR ignores mesh.visibility. The camera fade then showed the inside of a root at full strength. With no mode set, visibility below 1 blends again.
  for(const mesh of tree.getChildMeshes(false)){const target=mesh instanceof InstancedMesh?mesh.sourceMesh:mesh;const m=target.material as unknown as Glow|null;if(m)m.transparencyMode=null;}
  // Glow contract: roots and veins carry the tag. The glow layer (WP-42) reads it.
  for(const mesh of tree.getChildMeshes(false))if(/root_/.test(mesh.name)){mesh.metadata={...mesh.metadata,glow:true};}
  return (state:Readonly<WorldState>,dt:number)=>{
    t+=dt;const level=.03+Math.min(1,state.traits.attachment)*.12+Math.sin(t*1.6)*.015;
    for(const m of attach)if(m.emissiveColor)m.emissiveColor=gold.scale(level);
  };
}
