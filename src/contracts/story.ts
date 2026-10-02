import type {ActorId, Condition, SignalType, WorldId} from './state';
/** One button. Pressing it sends {type:'choice', id}. */
export interface StoryChoice {id:string;label:string}
export interface StoryStep {speaker:ActorId;lines:string[];choices:StoryChoice[]}
/** A micro story (spec 5.3): short, visible, with free choices. Every step can be left. */
export interface MicroStory {id:string;actor:ActorId;steps:Record<string,StoryStep>}
/** A press or hold spot. Pressing sends {type:signal, id:signalId ?? id}. */
export interface SpotData {id:string;world:WorldId;place:string;radius:number;text:string;signal:SignalType;signalId?:string;hold?:boolean;when:Condition}
/** An area. Entering sends {type:'zone-enter', id}. */
export interface ZoneData {id:string;world:WorldId;area:{kind:'circle';x:number;z:number;r:number}|{kind:'rect';minX:number;maxX:number;minZ:number;maxZ:number};when:Condition}
