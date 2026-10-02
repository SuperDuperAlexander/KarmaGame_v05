import {describe,it,expect} from 'vitest';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import type {DirectionalLight} from '@babylonjs/core/Lights/directionalLight';
import {createAssetService} from '../src/assets/feature';
import {createWorldFactory} from '../src/world/feature';
import {preset,setPresentationQuality} from '../src/presentation/quality';
import type {WorldId,WorldState} from '../src/contracts/state';

function state(world:WorldId):WorldState{return {schemaVersion:1,facts:[],firedRules:[],traits:{attachment:0,fear:0,trust:0,contentment:0},counters:{},world,positions:{outer:{x:0,y:0,z:-47},inner:{x:0,y:0,z:-7}},reflections:{},waveIds:[]};}
async function make(world:WorldId){const engine=new NullEngine();const scene=new Scene(engine);const view=await createWorldFactory().create(world,scene,createAssetService(true));return {engine,scene,view};}

describe('Presentation quality presets',()=>{
  it('keeps shadow, image processing and particles in budget',async()=>{
    const {engine,scene,view}=await make('outer');
    const low=preset(scene,'low'),medium=preset(scene,'medium'),high=preset(scene,'high');
    expect(low.shadow).toBe(0);expect(low.imageProcessing).toBe(false);expect(low.particles).toBe(.5);
    expect(medium.shadow).toBeGreaterThan(0);expect(medium.shadow).toBeLessThanOrEqual(1024);expect(high.shadow).toBe(1024);
    expect(medium.imageProcessing).toBe(true);expect(high.particles).toBe(1);
    view.dispose();scene.dispose();engine.dispose();
  });
  it('switches shadows and image processing live, in both worlds',async()=>{
    for(const world of ['outer','inner'] as const){
      const {engine,scene,view}=await make(world);
      const sun=scene.getLightByName('sun') as DirectionalLight;
      setPresentationQuality(scene,'medium');
      expect(sun.shadowEnabled).toBe(true);expect(scene.imageProcessingConfiguration.toneMappingEnabled).toBe(true);expect(scene.imageProcessingConfiguration.vignetteEnabled).toBe(true);
      setPresentationQuality(scene,'low');
      expect(sun.shadowEnabled).toBe(false);expect(scene.imageProcessingConfiguration.toneMappingEnabled).toBe(false);expect(scene.imageProcessingConfiguration.vignetteEnabled).toBe(false);
      setPresentationQuality(scene,'high');
      expect(sun.shadowEnabled).toBe(true);
      view.dispose();scene.dispose();engine.dispose();
    }
  });
  it('uses one sun, one hemispheric light and at most 12 shadow casters',async()=>{
    const {engine,scene,view}=await make('outer');
    expect(scene.lights.length).toBe(2);
    view.update(state('outer'),.016,view.spawn);
    const casters=(scene.getLightByName('sun') as DirectionalLight).getShadowGenerator()?.getShadowMap()?.renderList??[];
    expect(casters.length).toBeLessThanOrEqual(12);
    view.dispose();scene.dispose();engine.dispose();
  });
});

describe('Source Water and ground',()=>{
  it('starts under the tree roots outside and stays off the fear roots inside',async()=>{
    const outer=await make('outer');const o=outer.scene.getMeshByName('SourceWater')!.getBoundingInfo().boundingBox;
    // The tree stands at x 0, z 2.2. The first point of the stream is within 3 m of the trunk.
    expect(Math.hypot(o.maximumWorld.x-0,o.maximumWorld.z-2.2)).toBeLessThan(3.4);
    outer.view.dispose();outer.scene.dispose();outer.engine.dispose();
    const inner=await make('inner');const b=inner.scene.getMeshByName('SourceWater')!.getBoundingInfo().boundingBox;
    // Fear root feet stand at x -2 to -14 and z -4 to -14. The stream ends before them.
    expect(b.minimumWorld.z).toBeGreaterThan(-5.3);expect(b.minimumWorld.x).toBeGreaterThan(-8.5);
    inner.view.dispose();inner.scene.dispose();inner.engine.dispose();
  });
  it('keeps ground boxes and their collision flags',async()=>{
    const {engine,scene,view}=await make('outer');
    const path=scene.getMeshByName('arrival-path')!;expect(path.checkCollisions).toBe(false);
    expect(scene.getMeshByName('outer-ground')!.checkCollisions).toBe(true);
    view.dispose();scene.dispose();engine.dispose();
  });
});
