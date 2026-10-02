import type {Signal,SignalType,WorldId,WorldState} from '../contracts/state';
import type {InputFrame} from '../contracts/input';
import type {UiService} from '../contracts/ui';
import type {SpotData,ZoneData} from '../contracts/story';
import {strings} from '../content/strings.en';
import {places} from '../content/places';
import {matchesCondition} from '../rules/ruleEngine';
import {spots as narrativeSpots,zones as narrativeZones} from '../narrative';
export interface Spot {id:string;x:number;z:number;radius:number;text:string;signal:Signal;hold?:boolean}
export interface InteractionData {spots:readonly SpotData[];zones:readonly ZoneData[]}
const sig=(type:SignalType,id?:string):Signal=>id===undefined?{type}:{type,id};
/** Slice spots. Used only while the narrative data has no spots (fallback). */
function legacySpots(world:WorldId,state:Readonly<WorldState>):Spot[] {
  const has=(fact:WorldState['facts'][number])=>state.facts.includes(fact);
  if(world==='outer') return [
    ...(!has('PACKAGE_RECEIVED')?[{id:'waystone',x:1.2,z:-43.5,radius:2.2,text:strings.receive,signal:sig('waystone')}]:[]),
    ...(has('TREE_DISCOVERED')?[{id:'tree',x:0,z:-2.8,radius:1.9,text:strings.look,signal:sig('look-within'),hold:true}]:[]),
    ...(has('MARKET_VISITED')&&!has('ATTACHMENT_TRIGGERED')?[{id:'desire',x:26,z:0,radius:2.4,text:strings.desire,signal:sig('desire')}]:[])
  ];
  return [
    ...(!has('MONEY_REFLECTION_SAVED')?[{id:'reflection',x:4,z:-2,radius:1.8,text:strings.reflect,signal:sig('reflect')}]:[]),
    {id:'return',x:0,z:-3.4,radius:1.4,text:strings.return,signal:sig('return'),hold:true}
  ];
}
/** Spots of one world whose condition holds. Data replaces the slice fallback once it is not empty. */
export function spotsFor(world:WorldId,state:Readonly<WorldState>,data:readonly SpotData[]=narrativeSpots):Spot[] {
  if(data.length===0) return legacySpots(world,state);
  return data.filter(spot=>spot.world===world&&matchesCondition(state,spot.when)).map((spot):Spot|null=>{
    const place=places[spot.place as keyof typeof places] as {x:number;z:number}|undefined;
    return place?{id:spot.id,x:place.x,z:place.z,radius:spot.radius,text:spot.text,signal:sig(spot.signal,spot.signalId??spot.id),...(spot.hold?{hold:true}:{})}:null;
  }).filter((spot):spot is Spot=>spot!==null);
}
interface Zone {id:string;signal:Signal;inside(x:number,z:number):boolean}
/** Slice zones always run. They send the slice signals. Data zones are added to them. */
function legacyZones(world:WorldId,state:Readonly<WorldState>):Zone[] {
  if(world!=='outer') return [];
  const city=state.facts.includes('PACKAGE_RECEIVED'),entered=state.facts.includes('CITY_ENTERED');
  return [
    {id:'city',signal:sig('city-enter'),inside:(_x,z)=>z>-24&&city},
    {id:'tree',signal:sig('tree-enter'),inside:(x,z)=>Math.hypot(x,z)<5.2&&entered},
    {id:'market',signal:sig('market-enter'),inside:(x,z)=>x>20&&x<37&&z>-8&&z<10&&entered}
  ];
}
function dataZones(world:WorldId,state:Readonly<WorldState>,data:readonly ZoneData[]):Zone[] {
  return data.filter(zone=>zone.world===world).map(zone=>({id:zone.id,signal:sig('zone-enter',zone.id),inside:(x:number,z:number)=>{
    const a=zone.area;
    const geometry=a.kind==='circle'?Math.hypot(x-a.x,z-a.z)<a.r:x>=a.minX&&x<=a.maxX&&z>=a.minZ&&z<=a.maxZ;
    return geometry&&matchesCondition(state,zone.when);
  }}));
}
export function createInteraction(ui:UiService,dispatch:(signal:Signal)=>void,data:InteractionData={spots:narrativeSpots,zones:narrativeZones}) {
  let active:string|null=null;let held=0;let latched=false;
  const zones=new Set<string>();
  const crossings:Record<string,number>={};
  return {crossings,
    update(world:WorldId,state:Readonly<WorldState>,x:number,z:number,frame:InputFrame,dt:number) {
      const list=[...legacyZones(world,state),...dataZones(world,state,data.zones)];
      const key=(id:string)=>`${world}:${id}`;
      const present=new Set(list.map(zone=>key(zone.id)));
      for(const zone of list) {
        const now=zone.inside(x,z),id=key(zone.id);
        if(now&&!zones.has(id)) {zones.add(id);crossings[`${zone.id}:enter`]=(crossings[`${zone.id}:enter`]??0)+1;dispatch(zone.signal);}
        else if(!now&&zones.delete(id)) crossings[`${zone.id}:exit`]=(crossings[`${zone.id}:exit`]??0)+1;
      }
      // A zone that is gone (world change) counts as left.
      for(const id of [...zones]) if(id.startsWith(`${world}:`)&&!present.has(id)) zones.delete(id);
      let spot:Spot|undefined;let best=Infinity;
      for(const candidate of spotsFor(world,state,data.spots)) {
        const d=Math.hypot(x-candidate.x,z-candidate.z);
        if(d<candidate.radius&&d<best) {best=d;spot=candidate;}
      }
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
