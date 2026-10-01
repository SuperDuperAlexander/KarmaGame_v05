import type {WorldId,WorldState,SignalType} from '../contracts/state';
import type {InputFrame} from '../contracts/input';
import type {UiService} from '../contracts/ui';
import {strings} from '../content/strings.en';
export interface Spot {id:string;x:number;z:number;radius:number;text:string;signal:SignalType;hold?:boolean}
export function spotsFor(world:WorldId,state:Readonly<WorldState>):Spot[] {
  const has=(fact:WorldState['facts'][number])=>state.facts.includes(fact);
  if(world==='outer') return [
    ...(!has('PACKAGE_RECEIVED')?[{id:'waystone',x:1.2,z:-43.5,radius:2.2,text:strings.receive,signal:'waystone' as const}]:[]),
    ...(has('TREE_DISCOVERED')?[{id:'tree',x:0,z:-2.8,radius:1.9,text:strings.look,signal:'look-within' as const,hold:true}]:[]),
    ...(has('MARKET_VISITED')&&!has('ATTACHMENT_TRIGGERED')?[{id:'desire',x:26,z:0,radius:2.4,text:strings.desire,signal:'desire' as const}]:[])
  ];
  return [
    ...(!has('MONEY_REFLECTION_SAVED')?[{id:'reflection',x:4,z:-2,radius:1.8,text:strings.reflect,signal:'reflect' as const}]:[]),
    {id:'return',x:0,z:-3.4,radius:1.4,text:strings.return,signal:'return',hold:true}
  ];
}
export function createInteraction(ui:UiService,dispatch:(signal:SignalType)=>void) {
  let active:string|null=null;let held=0;let latched=false;
  const zones=new Set<string>();
  const crossings:Record<string,number>={};
  return {crossings,
    update(world:WorldId,state:Readonly<WorldState>,x:number,z:number,frame:InputFrame,dt:number) {
      const inside:Record<string,boolean>=world==='outer'?{
        city:z>-24&&state.facts.includes('PACKAGE_RECEIVED'),
        tree:Math.hypot(x,z)<5.2&&state.facts.includes('CITY_ENTERED'),
        market:x>20&&x<37&&z>-8&&z<10&&state.facts.includes('CITY_ENTERED')
      }:{};
      for(const id of ['city','tree','market']) {
        const now=Boolean(inside[id]);
        if(now&&!zones.has(id)) {zones.add(id);crossings[`${id}:enter`]=(crossings[`${id}:enter`]??0)+1;dispatch(`${id}-enter` as SignalType);}
        else if(!now&&zones.delete(id)) crossings[`${id}:exit`]=(crossings[`${id}:exit`]??0)+1;
      }
      const spot=spotsFor(world,state).find(s=>Math.hypot(x-s.x,z-s.z)<s.radius);
      if(active!==(spot?.id??null)) {active=spot?.id??null;held=0;latched=false;}
      ui.prompt(spot?.text??null,spot?.hold);
      if(!spot) {ui.hold(0);return;}
      if(!frame.held) {held=0;latched=false;}
      if(spot.hold && frame.held && !latched) {
        held+=dt;ui.hold(Math.min(1,held/1.1));
        if(held>=1.1) {latched=true;dispatch(spot.signal);}
      } else if(!spot.hold&&frame.pressed) dispatch(spot.signal);
      if(!spot.hold || !frame.held) ui.hold(0);
    },
    reset(){active=null;held=0;latched=false;zones.clear();ui.prompt(null);ui.hold(0);}
  };
}
