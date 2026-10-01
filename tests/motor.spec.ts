import {describe,it,expect} from 'vitest';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {CreateBox} from '@babylonjs/core/Meshes/Builders/boxBuilder';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {createCharacterMotor} from '../src/player/characterMotor';
import {createFollowCamera} from '../src/camera/followCamera';
import {placeholder} from '../src/assets/placeholders';
const frame={x:0,z:1,run:false,pressed:false,held:false,lookX:0,lookY:0,zoom:0};
function setup() {
  const engine=new NullEngine();const scene=new Scene(engine);scene.collisionsEnabled=true;
  const ground=CreateBox('ground',{width:20,height:.2,depth:20},scene);ground.position.y=-.1;ground.checkCollisions=true;
  const root=new TransformNode('entity',scene);
  const motor=createCharacterMotor(scene,root,placeholder('Player',scene,root),Vector3.Zero(),-10);
  return {scene,engine,motor,ground};
}
describe('movement and camera against physical blockers',()=>{
  it('walks and runs at the stated speeds on the collision ground',()=>{
    const {scene,engine,motor}=setup();
    for(let i=0;i<20;i++)motor.update({...frame,z:0},0,.05);
    for(let i=0;i<20;i++)motor.update(frame,0,.05);
    expect(motor.position().z).toBeCloseTo(2.8,1);
    const before=motor.position().z;
    for(let i=0;i<20;i++)motor.update({...frame,run:true},0,.05);
    expect(motor.position().z-before).toBeCloseTo(4.6,1);
    expect(Math.abs(motor.position().y)).toBeLessThan(.04);
    scene.dispose();engine.dispose();
  });
  it('blocks a 0.3 metre ledge and restores a fall',()=>{
    const {scene,engine,motor,ground}=setup();
    const ledge=CreateBox('ledge',{width:4,height:.3,depth:.8},scene);ledge.position.set(0,.15,2);ledge.checkCollisions=true;
    for(let i=0;i<50;i++)motor.update(frame,0,.05);
    expect(motor.position().z).toBeLessThan(1.65);
    ground.checkCollisions=false;ledge.checkCollisions=false;
    for(let i=0;i<60;i++)motor.update({...frame,z:0},0,.05);
    expect(motor.position().y).toBeGreaterThan(-10);
    scene.dispose();engine.dispose();
  });
  it('pulls in for an enabled wall and ignores a disabled gate',()=>{
    const {scene,engine}=setup();const camera=createFollowCamera(scene);
    const wall=CreateBox('camera-blocker',{width:8,height:8,depth:.3},scene);wall.position.set(0,2,-3);wall.metadata={cameraBlocker:true};wall.computeWorldMatrix(true);
    camera.update({...frame,z:0},Vector3.Zero());expect(camera.camera.position.z).toBeGreaterThan(-3);
    wall.setEnabled(false);camera.update({...frame,z:0},Vector3.Zero());expect(camera.camera.position.z).toBeLessThan(-4);
    scene.dispose();engine.dispose();
  });
});
