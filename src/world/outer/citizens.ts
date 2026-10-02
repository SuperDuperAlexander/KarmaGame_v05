import type {Visual} from '../../contracts/visual';
import type {Vector3} from '@babylonjs/core/Maths/math.vector';
import type {TransformNode} from '@babylonjs/core/Meshes/transformNode';
/**
 * Light code idle for a static citizen mesh.
 * The mesh has 11-13k triangles. It is switched off when the player is far away, so the gate view stays cheap.
 */
export function citizenIdle(entity:TransformNode,visual:Visual,phase:number){
  let t=phase;let on=true;
  return (dt:number,player:Vector3)=>{
    const dx=entity.position.x-player.x,dz=entity.position.z-player.z;const d2=dx*dx+dz*dz;
    const next=on?d2<32*32:d2<28*28;if(next!==on){on=next;entity.setEnabled(on);}
    if(!on)return;
    t+=dt;visual.root.rotation.z=Math.sin(t*1.1)*.014;visual.root.rotation.x=Math.sin(t*.8+1)*.006;visual.root.position.y=Math.max(0,Math.sin(t*2.2))*.01;
  };
}
