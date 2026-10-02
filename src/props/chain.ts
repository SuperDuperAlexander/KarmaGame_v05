import type {Scene} from '@babylonjs/core/scene';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {CreateTorus} from '@babylonjs/core/Meshes/Builders/torusBuilder';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {Vector3,Quaternion} from '@babylonjs/core/Maths/math.vector';
import type {AssetService,Visual} from '../contracts/visual';
import {material} from '../assets/placeholders';
export function createChain(scene:Scene,start:Vector3,end:Vector3){
  const root=new TransformNode('package-chain',scene);const links:Mesh[]=[];const length=Vector3.Distance(start,end);const n=Math.max(4,Math.ceil(length/.19));
  for(let i=0;i<n;i++){const t=i/(n-1);const link=CreateTorus('chain-link',{diameter:.17,thickness:.038,tessellation:8},scene);link.position.copyFrom(Vector3.Lerp(start,end,t));link.position.y-=Math.sin(t*Math.PI)*.13;link.rotation.x=Math.PI/2;link.rotation.z=i%2?Math.PI/2:0;links.push(link);}
  const chain=Mesh.MergeMeshes(links,true,true,undefined,false,false);if(chain){chain.parent=root;chain.material=material(scene,'#B89D63');chain.isPickable=false;}root.metadata={drawCalls:1};return root;
}

/**
 * Inner-world chain from the package to the beetle, built from the real link model.
 * Every link is an instance of one mesh, so the chain costs one draw call.
 * With placeholder assets the old code chain is used.
 */
export async function createInnerChain(scene:Scene,assets:AssetService,start:Vector3,end:Vector3,sag=.13):Promise<TransformNode>{
  const length=Vector3.Distance(start,end);const pitch=.24;const n=Math.max(4,Math.round(length/pitch)+1);
  const root=new TransformNode('package-chain',scene);
  const point=(t:number)=>{const p=Vector3.Lerp(start,end,t);p.y-=Math.sin(t*Math.PI)*sag;return p;};
  const first=await assets.create('ChainLink',scene,root);
  if(first.root.metadata?.status==='placeholder'){first.dispose();root.dispose();return createChain(scene,start,end);}
  const visuals:Visual[]=[first];
  for(let i=1;i<n;i++)visuals.push(await assets.create('ChainLink',scene,root));
  const up=Vector3.Up();
  visuals.forEach((visual,i)=>{
    const t=i/(n-1);const p=point(t);const dir=point(Math.min(1,t+.02)).subtract(point(Math.max(0,t-.02))).normalize();
    // Model long axis is Y. Turn Y onto the chain direction, then roll every second link by 90 degrees.
    const align=Quaternion.FromUnitVectorsToRef(up,dir,new Quaternion());
    const roll=Quaternion.RotationAxis(up,i%2?Math.PI/2:0);
    visual.root.position.copyFrom(p);visual.root.rotationQuaternion=align.multiply(roll);
  });
  root.metadata={drawCalls:1,links:n};return root;
}
