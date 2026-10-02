import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {Ray} from '@babylonjs/core/Culling/ray';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {InstancedMesh} from '@babylonjs/core/Meshes/instancedMesh';
import type {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';
import type {Scene} from '@babylonjs/core/scene';

/**
 * Spec 11.2: buildings and the tree may fade softly when they hide the player.
 * Meshes tagged `metadata.viewFade` (the asset service sets it) are tested with a small cone of rays from the camera
 * to the player. A mesh that stands in that cone fades to a see-through level. It comes back when the cone is clear.
 * Instances cannot hold an own alpha, so a faded instance swaps to a plain clone while it is not solid.
 */
// Low enough that glowing inner roots do not leave a pale band across a phone screen.
const SEE_THROUGH=.06,SPEED=5,CONE=.7,RAYS=10,NEAR=1,AXES=6;

interface Item {mesh:AbstractMesh;source:Mesh|null;clone:Mesh|null;alpha:number;hiding:boolean}

export function createBlockerFade(scene:Scene){
  const items:Item[]=[];const known=new Set<AbstractMesh>();let count=-1;let frame=0;
  function refresh(){
    if(scene.meshes.length===count)return;count=scene.meshes.length;
    for(const m of scene.meshes){
      if(known.has(m)||!m.metadata?.viewFade)continue;known.add(m);
      const source=m instanceof InstancedMesh?m.sourceMesh:m instanceof Mesh?null:undefined;if(source===undefined)continue;
      items.push({mesh:m,source,clone:null,alpha:1,hiding:false});
    }
  }
  const rays:Ray[]=[];for(let i=0;i<=RAYS+AXES;i++)rays.push(new Ray(Vector3.Zero(),Vector3.Forward(),1));
  const axes=[new Vector3(1,0,0),new Vector3(-1,0,0),new Vector3(0,1,0),new Vector3(0,-1,0),new Vector3(0,0,1),new Vector3(0,0,-1)];
  const base=new Vector3(),u=new Vector3(),v=new Vector3(),dir=new Vector3();
  function ensureClone(item:Item){
    if(item.clone)return item.clone;
    const source=item.source??(item.mesh as Mesh);
    const clone=item.source?source.clone(source.name+'.fade',null,true):null;if(!clone)return null;
    clone.material=source.material;clone.isPickable=false;clone.checkCollisions=false;clone.metadata=null;clone.doNotSyncBoundingInfo=true;
    clone.freezeWorldMatrix(item.mesh.computeWorldMatrix(true).clone());clone.setEnabled(false);item.clone=clone;return clone;
  }
  function apply(item:Item){
    if(item.source){
      const solid=item.alpha>=.999;const clone=solid?item.clone:ensureClone(item);
      if(!clone){item.mesh.setEnabled(true);return;}
      if(solid){clone.setEnabled(false);item.mesh.setEnabled(true);}else{clone.visibility=item.alpha;clone.setEnabled(true);item.mesh.setEnabled(false);}
    }else item.mesh.visibility=item.alpha;
  }
  return {
    update(camera:Vector3,target:Vector3,dt:number){
      refresh();if(!items.length)return;
      base.copyFrom(target).subtractInPlace(camera);const length=base.length();if(length<.01)return;base.scaleInPlace(1/length);
      // Two axes across the view direction build the cone.
      Vector3.CrossToRef(base,Vector3.UpReadOnly,u);if(u.lengthSquared()<1e-4)Vector3.CrossToRef(base,Vector3.RightReadOnly,u);u.normalize();Vector3.CrossToRef(base,u,v);
      rays[0].origin.copyFrom(camera);rays[0].direction.copyFrom(base);rays[0].length=length;
      for(let i=1;i<=RAYS;i++){
        const a=i/RAYS*Math.PI*2;dir.copyFrom(base).scaleInPlace(Math.cos(CONE)).addInPlace(u.scale(Math.cos(a)*Math.sin(CONE))).addInPlace(v.scale(Math.sin(a)*Math.sin(CONE)));
        rays[i].origin.copyFrom(camera);rays[i].direction.copyFrom(dir);rays[i].length=length;
      }
      // A short ray in every axis finds a mesh that the camera touches or sits inside.
      for(let i=0;i<AXES;i++){const r=rays[RAYS+1+i];r.origin.copyFrom(camera);r.direction.copyFrom(axes[i]);r.length=NEAR;}
      // The ray test runs on every second frame. The fade itself moves on every frame.
      const test=(frame++&1)===0;
      for(const item of items){
        const mesh=item.mesh;if(mesh.isDisposed())continue;
        const sphere=mesh.getBoundingInfo().boundingSphere;const reach=sphere.radiusWorld+length;
        const dx=sphere.centerWorld.x-camera.x,dy=sphere.centerWorld.y-camera.y,dz=sphere.centerWorld.z-camera.z;
        if(test){
          let hiding=false;
          if(dx*dx+dy*dy+dz*dz<reach*reach){
            // A switched off instance still holds its geometry, so the test works while its clone shows.
            for(let i=0;i<=RAYS+AXES&&!hiding;i++){const hit=rays[i].intersectsMesh(mesh,true);if(hit.hit&&hit.distance<=rays[i].length)hiding=true;}
          }
          item.hiding=hiding;
        }
        const goal=item.hiding?SEE_THROUGH:1;
        const next=item.alpha+Math.sign(goal-item.alpha)*Math.min(Math.abs(goal-item.alpha),dt*SPEED);
        if(next!==item.alpha){item.alpha=next;apply(item);}
      }
    },
    dispose(){for(const item of items)item.clone?.dispose();items.length=0;known.clear();}
  };
}
