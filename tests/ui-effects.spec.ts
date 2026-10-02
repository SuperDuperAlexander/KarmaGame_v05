import {describe,it,expect,vi} from 'vitest';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {buildStoryView,runStoryEffect,wavePosition} from '../src/ui/storyEffects';
import type {MicroStory} from '../src/contracts/story';
const stories:Record<string,MicroStory>={crate:{id:'crate',actor:'merchant',steps:{start:{speaker:'merchant',lines:['a','b','c','d'],choices:[{id:'help',label:'Lift'},{id:'no',label:'Not now'}]}}}};
const names={merchant:'Merchant'};
function context() {
  const ui={story:vi.fn(),prompt:vi.fn(),hold:vi.fn()};const act=vi.fn();const opened=vi.fn();
  return {ui,act,opened,ctx:{ui,world:{act},stories,names,leave:'Leave',opened}};
}
describe('story effect wiring',()=>{
  it('builds a view with the speaker name and at most 3 lines',()=>{
    expect(buildStoryView(stories,names,'crate','start','Leave')).toEqual({speaker:'Merchant',lines:['a','b','c'],choices:[{id:'help',label:'Lift'},{id:'no',label:'Not now'}],leave:'Leave'});
    expect(buildStoryView(stories,names,'crate','missing','Leave')).toBeNull();
  });
  it('opens and closes the panel',()=>{
    const {ui,opened,ctx}=context();
    expect(runStoryEffect({kind:'story',story:'crate',step:'start'},ctx)).toBe(true);
    expect(ui.story).toHaveBeenCalledWith(expect.objectContaining({speaker:'Merchant'}));
    expect(opened).toHaveBeenLastCalledWith('crate');expect(ui.prompt).toHaveBeenCalledWith(null);
    runStoryEffect({kind:'story-end'},ctx);
    expect(ui.story).toHaveBeenLastCalledWith(null);expect(opened).toHaveBeenLastCalledWith(null);
  });
  it('ignores an unknown step without opening',()=>{
    const {ui,ctx}=context();const warn=vi.spyOn(console,'warn').mockImplementation(()=>undefined);
    runStoryEffect({kind:'story',story:'crate',step:'nope'},ctx);
    expect(ui.story).not.toHaveBeenCalled();warn.mockRestore();
  });
  it('forwards act to the world and skips other effects',()=>{
    const {act,ctx}=context();
    expect(runStoryEffect({kind:'act',actor:'merchant',action:'carry'},ctx)).toBe(true);
    expect(act).toHaveBeenCalledWith('merchant','carry');
    expect(runStoryEffect({kind:'save'},ctx)).toBe(false);
  });
  it('places a wave at the actor, else at the player',()=>{
    const player=new Vector3(1,0,1),actor=new Vector3(5,0,5);
    expect(wavePosition({actorPosition:a=>a==='darkNpc'?actor:null},'darkNpc',player)).toBe(actor);
    expect(wavePosition({actorPosition:()=>null},'darkNpc',player)).toBe(player);
    expect(wavePosition({},'darkNpc',player)).toBe(player);
    expect(wavePosition({actorPosition:()=>actor},undefined,player)).toBe(player);
  });
});
