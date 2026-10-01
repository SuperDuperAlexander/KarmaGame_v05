import type {Scene} from '@babylonjs/core/scene';
import type {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import type {Vector3} from '@babylonjs/core/Maths/math.vector';
import type {WorldId, WorldState} from './state';
export type AssetId = 'Player'|'Merchant'|'FinancePackage'|'ChainLink'|'MarketStallA'|'MarketStallB'|'CentralTreeOuter'|'CentralTreeInner'|'AttachmentBeetle'|'CityGate'|'CityWall'|'CityBuilding'|'Citizen'|'InnerPlatform'|'Rock'|'Crystal'|'Vegetation';
export interface Visual {root:TransformNode;animate(clip:'idle'|'walk'|'run',speed:number):void;socket(name:string):TransformNode|null;dispose():void}
export interface AssetService {create(id:AssetId,scene:Scene,parent?:TransformNode):Promise<Visual>;status():{id:AssetId;status:string;file?:string}[]}
export interface WorldView {scene:Scene;spawn:Vector3;gate:TransformNode|null;beetle:TransformNode|null;packageRoot:TransformNode|null;update(state:Readonly<WorldState>,dt:number,player:Vector3):void;dispose():void}
export interface WorldFactory {create(world:WorldId,scene:Scene,assets:AssetService):Promise<WorldView>}
export interface WaveService {show(id:string,text:string,position:Vector3):boolean;update(dt:number,position:Vector3):void;dispose():void;count():number}
