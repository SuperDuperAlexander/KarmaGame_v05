import {describe,it,expect} from 'vitest';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {createAssetService} from '../src/assets/feature';
import {createWorldFactory} from '../src/world/feature';
import type {WorldState} from '../src/contracts/state';
function state():WorldState{return {schemaVersion:1,facts:[],firedRules:[],traits:{attachment:0,fear:0,trust:0,contentment:0},counters:{},world:'outer',positions:{outer:{x:0,y:0,z:-47},inner:{x:0,y:0,z:-7}},reflections:{},waveIds:[]};}
describe('State-driven worlds',()=>{
  it('opens gate and removes arrival package from restored facts',async()=>{const engine=new NullEngine();const scene=new Scene(engine);const view=await createWorldFactory().create('outer',scene,createAssetService(true));const s=state();view.update(s,.016,view.spawn);expect(view.gate?.isEnabled()).toBe(true);expect(view.packageRoot?.isEnabled()).toBe(true);s.facts.push('PACKAGE_RECEIVED');view.update(s,.016,view.spawn);expect(view.gate?.isEnabled()).toBe(false);expect(view.packageRoot?.isEnabled()).toBe(false);const ground=scene.getMeshByName('outer-ground')!;expect(ground.position.y+ground.getBoundingInfo().boundingBox.extendSize.y).toBeCloseTo(0);expect(scene.meshes.filter(m=>m.isVisible).length).toBeLessThan(80);view.dispose();scene.dispose();engine.dispose();});
  it('reveals attached beetle only from ATTACHMENT_SEEN',async()=>{const engine=new NullEngine();const scene=new Scene(engine);const view=await createWorldFactory().create('inner',scene,createAssetService(true));const s=state();s.facts.push('ATTACHMENT_TRIGGERED');view.update(s,.016,Vector3.Zero());expect(view.beetle?.isEnabled()).toBe(false);s.facts.push('ATTACHMENT_SEEN');view.update(s,.016,Vector3.Zero());expect(view.beetle?.isEnabled()).toBe(true);expect(view.beetle?.metadata.state).toBe('attached');expect(scene.getTransformNodeByName('package-chain')?.getChildMeshes()).toHaveLength(1);view.dispose();scene.dispose();engine.dispose();});
});
