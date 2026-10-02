import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {InstancedMesh} from '@babylonjs/core/Meshes/instancedMesh';
import type {Material} from '@babylonjs/core/Materials/material';
import type {Scene} from '@babylonjs/core/scene';

/**
 * Freeze the meshes under a node that never move (spec 15.2). The world matrix is computed once and kept,
 * and the bounding box is no longer synced each frame. Do not use it on anything that code animates.
 * Materials stay live on purpose: the quality menu and the inner glow change them at run time.
 */
export function freezeStatic(root:TransformNode):void{
  root.computeWorldMatrix(true);
  for(const node of root.getDescendants(false))if(node instanceof TransformNode)node.computeWorldMatrix(true);
  for(const mesh of root.getChildMeshes(false)){mesh.computeWorldMatrix(true);mesh.freezeWorldMatrix();mesh.doNotSyncBoundingInfo=true;}
}

/**
 * Join the static meshes under the nodes whose name matches into one mesh per material. Used for the code placeholders,
 * which are many small meshes with few materials. Only for visuals that never move and have no collider.
 */
export function mergeStatic(scene:Scene,nodeName:RegExp):void{
  const groups=new Map<Material,Mesh[]>();
  for(const node of scene.transformNodes){
    if(!nodeName.test(node.name))continue;
    for(const mesh of node.getChildMeshes(false)){
      if(!(mesh instanceof Mesh)||mesh instanceof InstancedMesh||!mesh.material||mesh.getTotalIndices()===0||mesh.checkCollisions)continue;
      const list=groups.get(mesh.material)??[];list.push(mesh);groups.set(mesh.material,list);
    }
  }
  for(const list of groups.values()){
    if(list.length<2)continue;
    const merged=Mesh.MergeMeshes(list,true,true,undefined,false,false);
    if(merged){merged.name='merged-static';merged.isPickable=false;merged.freezeWorldMatrix();merged.doNotSyncBoundingInfo=true;}
  }
}
