import type {Scene} from '@babylonjs/core/scene';
import type {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import type {Vector3} from '@babylonjs/core/Maths/math.vector';
import type {ActAction, ActorId, WorldId, WorldState} from './state';
export type AssetId = 'Player'|'Merchant'|'FinancePackage'|'ChainLink'|'MarketStallA'|'MarketStallB'|'CentralTreeOuter'|'CentralTreeInner'|'AttachmentBeetle'|'CityGate'|'CityWall'|'CityBuilding'|'Citizen'|'InnerPlatform'|'Rock'|'Crystal'|'Vegetation'|'CitizenMale'|'MarketProps'|'FearChild'|'DarkNpc'|'ExchangeGuide'|'ExchangeHouse';
export interface Visual {root:TransformNode;animate(clip:'idle'|'walk'|'run',speed:number):void;socket(name:string):TransformNode|null;dispose():void;
  /** Play a one-shot or looping action clip by logical name (for example 'help', 'give'). Returns false when the clip is missing. */
  play?(action:string,loop?:boolean):boolean}
export interface AssetService {create(id:AssetId,scene:Scene,parent?:TransformNode,part?:string):Promise<Visual>;status():{id:AssetId;status:string;file?:string}[]}
export interface WorldView {scene:Scene;spawn:Vector3;gate:TransformNode|null;beetle:TransformNode|null;packageRoot:TransformNode|null;update(state:Readonly<WorldState>,dt:number,player:Vector3):void;dispose():void;
  /** Play a transient story action (animation, prop move). Lasting looks still come from state. */
  act?(actor:ActorId,action:ActAction):void;
  /** World position of an actor, for thought waves. Null when the actor is not in this world. */
  actorPosition?(actor:ActorId):Vector3|null}
export interface WorldFactory {create(world:WorldId,scene:Scene,assets:AssetService):Promise<WorldView>}
/** Colour shows the theme, never good or bad (spec 10.2). */
export type WaveTone = 'attachment'|'fear'|'service'|'calm';
export interface WaveService {show(id:string,text:string,position:Vector3,tone?:WaveTone):boolean;update(dt:number,position:Vector3):void;dispose():void;count():number}
