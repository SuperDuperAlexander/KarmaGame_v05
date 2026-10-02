import {describe,it,expect} from 'vitest';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {createAssetService} from '../src/assets/feature';
import {registry} from '../src/assets/registry';
import {beetleMotion} from '../src/creatures/beetle';
import {createInnerChain} from '../src/props/chain';
import {createInitialState} from '../src/state/worldStore';
import type {Fact} from '../src/contracts/state';

const stateWith=(facts:Fact[])=>({...createInitialState(),facts});
describe('Attachment beetle and chain',()=>{
  it('registers the new files as temporary with kit parts',()=>{
    for(const id of ['CentralTreeInner','AttachmentBeetle','InnerPlatform','Rock','Crystal','ChainLink'] as const)expect(registry[id].status).toBe('temporary');
    expect(registry.InnerPlatform.parts?.large).toEqual(['platform_large']);expect(registry.Rock.parts?.cliff_wall).toEqual(['cliff_wall']);expect(registry.Crystal.parts?.tall).toEqual(['crystal_tall']);
    expect(registry.CentralTreeInner.nodes.rootAttachment).toContain('root_attachment_main');
  });
  it('shows the beetle only when attached and reads state from selectors',async()=>{
    const engine=new NullEngine();const scene=new Scene(engine);const assets=createAssetService(true);
    const root=new TransformNode('beetle',scene);const visual=await assets.create('AttachmentBeetle',scene,root);const update=beetleMotion(root,0,visual.root);
    update(stateWith([]),.016);expect(root.isEnabled()).toBe(false);expect(root.metadata.state).toBe('hidden');
    update(stateWith(['ATTACHMENT_TRIGGERED']),.016);expect(root.isEnabled()).toBe(false);expect(root.metadata.state).toBe('dormant');
    update(stateWith(['ATTACHMENT_TRIGGERED','ATTACHMENT_SEEN']),.016);expect(root.isEnabled()).toBe(true);expect(root.metadata.state).toBe('attached');
    scene.dispose();engine.dispose();
  });
  it('uses the code chain with placeholder assets',async()=>{
    const engine=new NullEngine();const scene=new Scene(engine);const chain=await createInnerChain(scene,createAssetService(true),new Vector3(4,.58,-2),new Vector3(7,.34,-.5));
    expect(chain.metadata.drawCalls).toBe(1);scene.dispose();engine.dispose();
  });
});
