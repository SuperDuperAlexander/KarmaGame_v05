export type WorldId = 'outer' | 'inner';
export type Fact = 'PACKAGE_RECEIVED' | 'CITY_ENTERED' | 'TREE_DISCOVERED' | 'INNER_WORLD_ENTERED' | 'MONEY_REFLECTION_SAVED' | 'MARKET_VISITED' | 'ATTACHMENT_TRIGGERED' | 'ATTACHMENT_SEEN';
export type Trait = 'attachment' | 'fear' | 'trust' | 'contentment';
export interface Position {x:number; y:number; z:number}
export interface WorldState {
  schemaVersion:1; facts:Fact[]; firedRules:string[];
  traits:Record<Trait,number>; counters:Record<string,number>;
  world:WorldId; positions:Record<WorldId,Position>;
  reflections:Record<string,string>; waveIds:string[];
}
export interface WorldStore {
  get():Readonly<WorldState>;
  update(change:(draft:WorldState)=>void):void;
  subscribe(listener:(state:Readonly<WorldState>)=>void):()=>void;
  reset():void;
}
export type SignalType = 'waystone' | 'city-enter' | 'tree-enter' | 'look-within' | 'inner-active' | 'reflect' | 'reflection-done' | 'return' | 'market-enter' | 'desire';
export interface Signal {type:SignalType}
export type Condition = {kind:'fact';fact:Fact;value?:boolean} | {kind:'all'|'any';conditions:Condition[]} | {kind:'trait';trait:Trait;min?:number;max?:number} | {kind:'counter';counter:string;min:number} | {kind:'always'};
export type Effect = {kind:'fact';fact:Fact} | {kind:'trait';trait:Trait;delta:number} | {kind:'save'} | {kind:'wave';id:string;text:string} | {kind:'panel';panel:'reflection'} | {kind:'transition';world:WorldId} | {kind:'hint';text:string};
export interface Rule {id:string;signal:SignalType;condition:Condition;once:boolean;effects:Effect[]}
export interface RuleEngine {dispatch(signal:Signal):void}
export interface SaveService {load():WorldState|null;request():void;flush():boolean;dispose():void;clear():void}
