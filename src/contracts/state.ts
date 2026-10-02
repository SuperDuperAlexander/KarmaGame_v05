export type WorldId = 'outer' | 'inner';
export type SliceFact = 'PACKAGE_RECEIVED' | 'CITY_ENTERED' | 'TREE_DISCOVERED' | 'INNER_WORLD_ENTERED' | 'MONEY_REFLECTION_SAVED' | 'MARKET_VISITED' | 'ATTACHMENT_TRIGGERED' | 'ATTACHMENT_SEEN';
/** Spec 5.2 events after the slice. */
export type MvpEventFact = 'FEAR_TRIGGERED' | 'FEAR_SEEN' | 'SERVICE_OFFERED' | 'GIVE_COMPLETED' | 'RECEIVE_COMPLETED' | 'EXCHANGE_UNDERSTOOD' | 'ATTACHMENT_TRANSFORMED' | 'FINANCE_MVP_COMPLETE';
/** Story steps of the micro stories (spec 5.3). Facts only record what happened. No fact is a score. */
export type StoryFact =
  | 'MERCHANT_MET' | 'CRATE_CARRIED' | 'GIFT_OFFERED' | 'GIFT_ACCEPTED' | 'GIFT_DECLINED'
  | 'CHILD_MET' | 'COIN_SEARCHED' | 'COIN_FOUND' | 'CHILD_LISTENED' | 'CHILD_GIVEN'
  | 'DARK_MET' | 'DARK_LISTENED'
  | 'GIVER_MET' | 'GIVER_RESTED' | 'GIVER_GIFT_ACCEPTED'
  | 'RECEIVER_MET' | 'RECEIVER_ACCEPTED'
  | 'EXCHANGE_HOUSE_ENTERED' | 'GUIDE_MET' | 'GUIDE_TEA_ACCEPTED'
  | 'BEETLE_OBSERVED' | 'BEETLE_RELEASED'
  | 'FINALE_SEEN' | 'ENOUGH_REFLECTION_SAVED';
export type Fact = SliceFact | MvpEventFact | StoryFact;
/** People and things that act in a story. Visuals map these ids to entities. */
export type ActorId = 'player' | 'merchant' | 'fearChild' | 'darkNpc' | 'giver' | 'receiver' | 'guide' | 'beetle';
/** Short visible actions. Lower position is 'help' or 'carry': active service, never kneeling (spec 1). */
export type ActAction = 'help' | 'carry' | 'give' | 'receive' | 'talk' | 'listen' | 'search' | 'relief' | 'refuse' | 'welcome' | 'observe' | 'release';
export type ReflectionPrompt = 'money' | 'enough';
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
export type SignalType = 'waystone' | 'city-enter' | 'tree-enter' | 'look-within' | 'inner-active' | 'reflect' | 'reflection-done' | 'return' | 'market-enter' | 'desire'
  // Data-driven signals. `id` names the spot, zone, choice, story or reflection prompt.
  | 'spot' | 'zone-enter' | 'choice' | 'story-closed';
export interface Signal {type:SignalType;id?:string}
export type Condition = {kind:'fact';fact:Fact;value?:boolean} | {kind:'all'|'any';conditions:Condition[]} | {kind:'trait';trait:Trait;min?:number;max?:number} | {kind:'counter';counter:string;min:number} | {kind:'always'};
export type Effect = {kind:'fact';fact:Fact} | {kind:'trait';trait:Trait;delta:number} | {kind:'save'}
  | {kind:'wave';id:string;text:string;actor?:ActorId;tone?:'attachment'|'fear'|'service'|'calm'}
  | {kind:'panel';panel:'reflection';prompt?:ReflectionPrompt} | {kind:'transition';world:WorldId} | {kind:'hint';text:string}
  | {kind:'counter';counter:'serviceActs'|'giveCount'|'receiveCount';delta:number}
  /** Open one step of a micro story in the story panel. */
  | {kind:'story';story:string;step:string}
  /** Close the story panel. */
  | {kind:'story-end'}
  /** A short visible action: animation, prop move or small effect. Transient only (AD-9). */
  | {kind:'act';actor:ActorId;action:ActAction};
/** `signalId` set: the rule fires only for a signal with the same `id`. */
export interface Rule {id:string;signal:SignalType;signalId?:string;condition:Condition;once:boolean;effects:Effect[]}
export interface RuleEngine {dispatch(signal:Signal):void}
export interface SaveService {load():WorldState|null;request():void;flush():boolean;dispose():void;clear():void}
