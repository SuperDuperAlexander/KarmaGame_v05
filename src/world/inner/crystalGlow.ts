import type {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {InstancedMesh} from '@babylonjs/core/Meshes/instancedMesh';
import {Color3} from '@babylonjs/core/Maths/math.color';
import type {Material} from '@babylonjs/core/Materials/material';

type Pbr={albedoTexture?:unknown;emissiveTexture?:unknown;emissiveColor?:Color3;transparencyMode?:number|null};
/**
 * The kit crystals light themselves from their own texture and carry the glow tag (contract in _COMMON_LOOK).
 * The material is cloned once, so other kit parts keep their look.
 */
export function glowCrystals(nodes:TransformNode[]){
  const copies=new Map<Material,Material>();
  for(const node of nodes)for(const mesh of node.getChildMeshes(false)){
    const target=mesh instanceof InstancedMesh?mesh.sourceMesh:mesh;const old=target.material;if(!old)continue;
    let copy=copies.get(old);
    if(!copy){copy=old.clone(old.name+'-glow')??old;copies.set(old,copy);const m=copy as unknown as Pbr;
      if(m.albedoTexture&&!m.emissiveTexture)m.emissiveTexture=m.albedoTexture;m.emissiveColor=new Color3(.75,.75,.75);}
    target.material=copy;mesh.metadata={...mesh.metadata,glow:true};target.metadata={...target.metadata,glow:true};
  }
}
