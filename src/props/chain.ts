import type {Scene} from '@babylonjs/core/scene';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {CreateTorus} from '@babylonjs/core/Meshes/Builders/torusBuilder';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {Vector3,Quaternion,Matrix} from '@babylonjs/core/Maths/math.vector';
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
 *
 * Carry mode (WP-42): when the chain hangs under the player entity, its start follows the package in the hand and
 * it hangs as one loose chain with a real sag between hand and hip. Links are only moved, never added, so it stays one draw call.
 */
export async function createInnerChain(scene:Scene,assets:AssetService,start:Vector3,end:Vector3,sag=.13):Promise<TransformNode>{
  const length=Vector3.Distance(start,end);const pitch=.24;
  // A short carry chain still gets enough links to read as a chain (loose 9, tense 6).
  const n=Math.max(sag>=.2?9:6,Math.round(length/pitch)+1);
  const root=new TransformNode('package-chain',scene);
  const first=await assets.create('ChainLink',scene,root);
  if(first.root.metadata?.status==='placeholder'){first.dispose();root.dispose();return createChain(scene,start,end);}
  const visuals:Visual[]=[first];
  for(let i=1;i<n;i++)visuals.push(await assets.create('ChainLink',scene,root));
  const up=Vector3.Up();
  const a=new Vector3(),b=new Vector3(),dir=new Vector3(),from=start.clone(),to=end.clone();
  const point=(t:number,out:Vector3,depth:number)=>{Vector3.LerpToRef(from,to,t,out);out.y-=4*t*(1-t)*depth;return out;};
  const align=new Quaternion(),roll=new Quaternion();
  /** Put every link on the sagging line from `from` to `to`. */
  function pose(depth:number){
    visuals.forEach((visual,i)=>{
      const t=i/(n-1);point(t,visual.root.position,depth);
      point(Math.min(1,t+.02),a,depth);point(Math.max(0,t-.02),b,depth);a.subtractToRef(b,dir).normalize();
      // Model long axis is Y. Turn Y onto the chain direction, then roll every second link by 90 degrees.
      Quaternion.FromUnitVectorsToRef(up,dir,align);Quaternion.RotationAxisToRef(up,i%2?Math.PI/2:0,roll);
      if(!visual.root.rotationQuaternion)visual.root.rotationQuaternion=new Quaternion();
      align.multiplyToRef(roll,visual.root.rotationQuaternion);
    });
  }
  pose(sag);
  // Carry mode. The app puts the chain under the player after it is built, so the parent is checked while it runs.
  let carried:TransformNode|null=null;const handLocal=new Vector3();
  const inverse=new Matrix();
  const observer=scene.onBeforeRenderObservable.add(()=>{
    const owner=root.parent;if(!owner||owner.name!=='player.entity'||!root.isEnabled())return;
    if(!carried||carried.isDisposed())carried=scene.transformNodes.find(node=>node.name==='FinancePackage-visual'&&node.isDescendantOf(owner))??null;
    if(!carried)return;
    root.computeWorldMatrix(true).invertToRef(inverse);Vector3.TransformCoordinatesToRef(carried.getAbsolutePosition(),inverse,handLocal);
    // The chain leaves the lower part of the package, so the hanging end is the hand point shifted a little down.
    from.copyFrom(handLocal);from.y-=.1;to.copyFrom(end);
    const chord=Vector3.Distance(from,to);const slack=Math.max(0,(n-1)*pitch-chord);
    pose(Math.min((n-1)*pitch*.55,Math.sqrt(.375*chord*slack)));
  });
  root.onDisposeObservable.add(()=>scene.onBeforeRenderObservable.remove(observer));
  root.metadata={drawCalls:1,links:n};return root;
}
