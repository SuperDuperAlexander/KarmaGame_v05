import {describe,it,expect} from 'vitest';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {CreateBox} from '@babylonjs/core/Meshes/Builders/boxBuilder';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {createFollowCamera} from '../src/camera/followCamera';
import {createBlockerFade} from '../src/camera/blockerFade';
const frame={x:0,z:0,run:false,pressed:false,held:false,lookX:0,lookY:0,zoom:0};
describe('camera framing and blocker fade',()=>{
  it('keeps distance and pitch in spec 11.2 and aims above and ahead of the player',()=>{
    const engine=new NullEngine();const scene=new Scene(engine);const cam=createFollowCamera(scene);
    cam.update(frame,Vector3.Zero());
    expect(cam.distance).toBeGreaterThanOrEqual(4.5);expect(cam.distance).toBeLessThanOrEqual(6.5);
    expect(cam.pitch).toBeGreaterThanOrEqual(20*Math.PI/180);expect(cam.pitch).toBeLessThanOrEqual(55*Math.PI/180);
    const dir=cam.camera.getForwardRay(1).direction;
    // The view looks down by less than the orbit pitch, so the horizon shows.
    expect(Math.asin(-dir.y)).toBeLessThan(cam.pitch);expect(Math.asin(-dir.y)).toBeGreaterThan(0);
    // The orbit point stays 1.2 m above the player.
    const orbit=cam.camera.position.add(new Vector3(0,-Math.sin(cam.pitch)*cam.distance,Math.cos(cam.pitch)*cam.distance));
    expect(orbit.y).toBeCloseTo(1.2,1);
    scene.dispose();engine.dispose();
  });
  it('switches a blocker fully off while it hides the player, and back on after',()=>{
    const engine=new NullEngine();const scene=new Scene(engine);
    const wall=CreateBox('root',{width:6,height:6,depth:.5},scene);wall.metadata={viewFade:true};wall.position.set(0,1,-3);wall.computeWorldMatrix(true);
    const fade=createBlockerFade(scene);const camera=new Vector3(0,1.2,-6),target=new Vector3(0,1.2,0);
    for(let i=0;i<30;i++)fade.update(camera,target,.05);
    expect(wall.isVisible).toBe(false);
    for(let i=0;i<30;i++)fade.update(new Vector3(8,1.2,-6),target.add(new Vector3(8,0,0)),.05);
    expect(wall.isVisible).toBe(true);expect(wall.visibility).toBe(1);
    fade.dispose();scene.dispose();engine.dispose();
  });
});
