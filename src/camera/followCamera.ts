import {FreeCamera} from '@babylonjs/core/Cameras/freeCamera';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {Ray} from '@babylonjs/core/Culling/ray';
import type {Scene} from '@babylonjs/core/scene';
import type {InputFrame} from '../contracts/input';
import {createBlockerFade} from './blockerFade';
export function createFollowCamera(scene:Scene,initialYaw=0) {
  const camera=new FreeCamera('follow.camera',new Vector3(0,3,-6),scene);
  camera.minZ=.08;camera.maxZ=180;camera.fov=1.1;
  scene.activeCamera=camera;const fade=createBlockerFade(scene);
  let yaw=initialYaw;let pitch=20*Math.PI/180;let distance=5.8;
  return {camera,get yaw(){return yaw;},get pitch(){return pitch;},get distance(){return distance;},
    update(frame:InputFrame,player:Vector3) {
      yaw+=frame.lookX*.005;
      pitch=Math.max(20*Math.PI/180,Math.min(55*Math.PI/180,pitch+frame.lookY*.004));
      distance=Math.max(4.5,Math.min(6.5,distance+frame.zoom*.25));
      const target=player.add(new Vector3(0,1.2,0));
      const away=new Vector3(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
      const hit=scene.pickWithRay(new Ray(target,away,distance+.3),mesh=>mesh.isEnabled()&&Boolean(mesh.metadata?.cameraBlocker));
      const actual=hit?.hit?Math.max(.2,Math.min(distance,hit.distance-.3)):distance;
      camera.position.copyFrom(target.add(away.scale(actual)));
      camera.setTarget(target);
      fade.update(camera.position,target,Math.min(scene.getEngine().getDeltaTime()/1000,.05));
    }
  };
}
