import type {Scene} from '@babylonjs/core/scene';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {CreateTorus} from '@babylonjs/core/Meshes/Builders/torusBuilder';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {material} from '../assets/placeholders';
export function createChain(scene:Scene,start:Vector3,end:Vector3){
  const root=new TransformNode('package-chain',scene);const links:Mesh[]=[];const length=Vector3.Distance(start,end);const n=Math.max(4,Math.ceil(length/.19));
  for(let i=0;i<n;i++){const t=i/(n-1);const link=CreateTorus('chain-link',{diameter:.17,thickness:.038,tessellation:8},scene);link.position.copyFrom(Vector3.Lerp(start,end,t));link.position.y-=Math.sin(t*Math.PI)*.13;link.rotation.x=Math.PI/2;link.rotation.z=i%2?Math.PI/2:0;links.push(link);}
  const chain=Mesh.MergeMeshes(links,true,true,undefined,false,false);if(chain){chain.parent=root;chain.material=material(scene,'#B89D63');chain.isPickable=false;}root.metadata={drawCalls:1};return root;
}
