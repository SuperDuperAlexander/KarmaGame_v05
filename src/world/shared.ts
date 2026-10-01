import type {Scene} from '@babylonjs/core/scene';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {CreateBox} from '@babylonjs/core/Meshes/Builders/boxBuilder';
import {CreateCylinder} from '@babylonjs/core/Meshes/Builders/cylinderBuilder';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {material} from '../assets/placeholders';
export function solid(scene:Scene,name:string,position:Vector3,size:Vector3,color?:string){
  const box=CreateBox(name,{width:size.x,height:size.y,depth:size.z},scene);box.position.copyFrom(position);box.checkCollisions=true;box.metadata={cameraBlocker:true};box.isPickable=false;
  if(color)box.material=material(scene,color);else box.isVisible=false;
  return box;
}
export function disk(scene:Scene,name:string,x:number,z:number,r:number,color:string,y=-.052){
  const d=CreateCylinder(name,{height:.12,diameter:r*2,tessellation:48},scene);d.position.set(x,y,z);d.material=material(scene,color);d.isPickable=false;return d;
}
export function entity(scene:Scene,name:string,x:number,z:number):TransformNode{const root=new TransformNode(name,scene);root.position.set(x,0,z);return root;}
