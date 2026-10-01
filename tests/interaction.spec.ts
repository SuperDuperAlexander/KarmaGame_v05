import {describe,it,expect,vi} from 'vitest';
import {createInteraction} from '../src/interaction/interaction';
import type {WorldState} from '../src/contracts/state';
import type {UiService} from '../src/contracts/ui';
const state:WorldState={schemaVersion:1,facts:['PACKAGE_RECEIVED','CITY_ENTERED','TREE_DISCOVERED'],firedRules:[],traits:{attachment:0,fear:0,trust:0,contentment:0},counters:{},world:'outer',positions:{outer:{x:0,y:0,z:-47},inner:{x:0,y:0,z:-7}},reflections:{},waveIds:[]};
const frame={x:0,z:0,run:false,pressed:false,held:false,lookX:0,lookY:0,zoom:0};
describe('interaction crossings and hold',()=>{
  it('sends one entry per crossing and resets hold on release',()=>{
    const emit=vi.fn();const ui={prompt:vi.fn(),hold:vi.fn()} as unknown as UiService;
    const interaction=createInteraction(ui,emit);
    interaction.update('outer',state,0,-2.8,frame,.05);
    interaction.update('outer',state,0,-2.8,frame,.05);
    expect(emit.mock.calls.filter(c=>c[0]==='tree-enter')).toHaveLength(1);
    interaction.update('outer',state,0,-2.8,{...frame,held:true},.7);
    interaction.update('outer',state,0,-2.8,frame,.05);
    interaction.update('outer',state,0,-2.8,{...frame,held:true},.7);
    expect(emit.mock.calls.filter(c=>c[0]==='look-within')).toHaveLength(0);
    interaction.update('outer',state,0,-2.8,{...frame,held:true},.5);
    interaction.update('outer',state,0,-2.8,{...frame,held:true},2);
    expect(emit.mock.calls.filter(c=>c[0]==='look-within')).toHaveLength(1);
  });
});
