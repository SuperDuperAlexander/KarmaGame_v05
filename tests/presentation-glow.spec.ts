import {describe,it,expect} from 'vitest';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {CreateBox} from '@babylonjs/core/Meshes/Builders/boxBuilder';
import {preset} from '../src/presentation/quality';
import {wantsGlow} from '../src/presentation/glow';
describe('glow presets and contract',()=>{
  it('has no glow on low, a small glow on medium and a full glow on high',()=>{
    const engine=new NullEngine();const scene=new Scene(engine);
    expect(preset(scene,'low').glow).toBeNull();
    const medium=preset(scene,'medium').glow!,high=preset(scene,'high').glow!;
    expect(medium).not.toBeNull();expect(medium.ratio).toBeLessThan(high.ratio);expect(medium.kernel).toBeLessThanOrEqual(high.kernel);
    scene.dispose();engine.dispose();
  });
  it('selects only meshes with metadata.glow === true',()=>{
    const engine=new NullEngine();const scene=new Scene(engine);
    const a=CreateBox('a',{},scene),b=CreateBox('b',{},scene),c=CreateBox('c',{},scene);
    a.metadata={glow:true};b.metadata={glow:'yes'};
    expect(wantsGlow(a)).toBe(true);expect(wantsGlow(b)).toBe(false);expect(wantsGlow(c)).toBe(false);
    scene.dispose();engine.dispose();
  });
});
