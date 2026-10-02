import {describe,it,expect,vi} from 'vitest';
import {createInteraction,spotsFor} from '../src/interaction/interaction';
import type {Signal,WorldState} from '../src/contracts/state';
import type {SpotData,ZoneData} from '../src/contracts/story';
import type {UiService} from '../src/contracts/ui';
const base:WorldState={schemaVersion:1,facts:[],firedRules:[],traits:{attachment:0,fear:0,trust:0,contentment:0},counters:{},world:'outer',positions:{outer:{x:0,y:0,z:0},inner:{x:0,y:0,z:0}},reflections:{},waveIds:[]};
const frame={x:0,z:0,run:false,pressed:false,held:false,lookX:0,lookY:0,zoom:0};
const ui=()=>({prompt:vi.fn(),hold:vi.fn()} as unknown as UiService);
const crate:SpotData={id:'crate',world:'outer',place:'serviceCrate',radius:2,text:'Lift',signal:'spot',when:{kind:'fact',fact:'MERCHANT_MET'}};
const hold:SpotData={id:'sit',world:'outer',place:'finale',radius:2,text:'Sit',signal:'spot',signalId:'finale',hold:true,when:{kind:'always'}};
const zone:ZoneData={id:'dark-district',world:'outer',area:{kind:'rect',minX:-30,maxX:-20,minZ:0,maxZ:8},when:{kind:'always'}};
describe('data-driven spots',()=>{
  it('falls back to the slice spots while the data is empty',()=>{
    expect(spotsFor('outer',base,[]).map(s=>s.id)).toEqual(['waystone']);
  });
  it('gates a spot by its condition and reads the place table',()=>{
    expect(spotsFor('outer',base,[crate])).toEqual([]);
    const spots=spotsFor('outer',{...base,facts:['MERCHANT_MET']},[crate]);
    expect(spots).toHaveLength(1);
    expect(spots[0]).toMatchObject({x:17,z:-9,radius:2,signal:{type:'spot',id:'crate'}});
  });
  it('sends signalId when set and ignores spots of the other world',()=>{
    expect(spotsFor('outer',base,[hold])[0].signal).toEqual({type:'spot',id:'finale'});
    expect(spotsFor('inner',base,[hold])).toEqual([]);
  });
  it('presses once per press and holds for 1.1 seconds',()=>{
    const emit=vi.fn<(s:Signal)=>void>();const i=createInteraction(ui(),emit,{spots:[{...crate,when:{kind:'always'}},hold],zones:[]});
    i.update('outer',base,17,-9,{...frame,pressed:true},.05);
    expect(emit).toHaveBeenCalledWith({type:'spot',id:'crate'});
    i.update('outer',base,-3,3.5,{...frame,held:true},.6);
    expect(emit).toHaveBeenCalledTimes(1);
    i.update('outer',base,-3,3.5,{...frame,held:true},.6);
    expect(emit).toHaveBeenLastCalledWith({type:'spot',id:'finale'});
  });
});
describe('data-driven zones',()=>{
  it('enters once per crossing with zone-enter and the id',()=>{
    const emit=vi.fn<(s:Signal)=>void>();const i=createInteraction(ui(),emit,{spots:[],zones:[zone]});
    for(const x of [-25,-26,-25]) i.update('outer',base,x,4,frame,.05);
    expect(emit.mock.calls.filter(c=>c[0].type==='zone-enter')).toEqual([[{type:'zone-enter',id:'dark-district'}]]);
    i.update('outer',base,-10,4,frame,.05);
    i.update('outer',base,-25,4,frame,.05);
    expect(emit.mock.calls.filter(c=>c[0].type==='zone-enter')).toHaveLength(2);
  });
  it('does not enter while the condition fails',()=>{
    const emit=vi.fn<(s:Signal)=>void>();
    const gated:ZoneData={...zone,when:{kind:'fact',fact:'CITY_ENTERED'}};
    const i=createInteraction(ui(),emit,{spots:[],zones:[gated]});
    i.update('outer',base,-25,4,frame,.05);
    expect(emit).not.toHaveBeenCalled();
    i.update('outer',{...base,facts:['CITY_ENTERED']},-25,4,frame,.05);
    expect(emit).toHaveBeenCalledTimes(1);
  });
  it('supports circle zones',()=>{
    const emit=vi.fn<(s:Signal)=>void>();
    const circle:ZoneData={id:'c',world:'outer',area:{kind:'circle',x:0,z:0,r:2},when:{kind:'always'}};
    const i=createInteraction(ui(),emit,{spots:[],zones:[circle]});
    i.update('outer',base,3,0,frame,.05);i.update('outer',base,1,0,frame,.05);
    expect(emit).toHaveBeenCalledTimes(1);
  });
});
