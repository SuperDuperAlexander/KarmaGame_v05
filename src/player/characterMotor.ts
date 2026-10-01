import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {CreateCapsule} from '@babylonjs/core/Meshes/Builders/capsuleBuilder';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Vector3, Quaternion} from '@babylonjs/core/Maths/math.vector';
import type {Scene} from '@babylonjs/core/scene';
import type {Visual} from '../contracts/visual';
import type {InputFrame} from '../contracts/input';
export interface CharacterMotor {
  root:TransformNode;collider:Mesh;visual:Visual;
  update(frame:InputFrame,yaw:number,dt:number):void;
  teleport(position:Vector3):void;position():Vector3;dispose():void;
}
export function createCharacterMotor(scene:Scene,root:TransformNode,visual:Visual,spawn:Vector3,killY:number):CharacterMotor {
  const body=CreateCapsule('player.collider',{height:1.65,radius:.32,subdivisions:1,tessellation:8},scene);
  body.isVisible=false;body.isPickable=false;body.checkCollisions=true;
  body.ellipsoid=new Vector3(.32,.825,.32);
  const safe=spawn.clone();let gravity=0;let heading=0;
  function teleport(position:Vector3) {root.position.copyFrom(position);body.position.copyFrom(position).y+=.825;gravity=0;}
  teleport(spawn);
  return {root,collider:body,visual,teleport,position:()=>root.position,
    update(frame,yaw,dt) {
      const forward=new Vector3(Math.sin(yaw),0,Math.cos(yaw));
      const right=new Vector3(Math.cos(yaw),0,-Math.sin(yaw));
      const direction=forward.scale(frame.z).addInPlace(right.scale(frame.x));
      const amount=Math.min(1,direction.length());
      if(amount>0) direction.normalize();
      const speed=(frame.run?4.6:2.8)*amount;
      gravity=Math.max(-20,gravity-9.81*dt);
      const before=body.position.clone();
      body.moveWithCollisions(direction.scale(speed*dt).add(new Vector3(0,gravity*dt,0)));
      const grounded=Math.abs(body.position.y-before.y)<.002 && gravity<0;
      if(grounded) gravity=0;
      root.position.copyFrom(body.position);root.position.y-=.825;
      if(root.position.y<killY || !Number.isFinite(root.position.x+root.position.y+root.position.z)) teleport(safe);
      if(grounded && root.position.y>-1) safe.copyFrom(root.position);
      if(amount>.01) {
        const target=Math.atan2(direction.x,direction.z);
        heading+=Math.atan2(Math.sin(target-heading),Math.cos(target-heading))*Math.min(1,dt*12);
        root.rotationQuaternion=Quaternion.RotationAxis(Vector3.Up(),heading);
      }
      const moved=Vector3.Distance(new Vector3(before.x,0,before.z),new Vector3(body.position.x,0,body.position.z));
      const realSpeed=moved/Math.max(dt,.001);
      visual.animate(realSpeed<.1?'idle':frame.run?'run':'walk',realSpeed);
    },
    dispose(){visual.dispose();body.dispose();root.dispose();}
  };
}
