import type {AssetId} from '../../contracts/visual';
export interface AssetEntry {
  status:'placeholder'|'temporary'|'final'; file?:string;
  scale:number; rotation:[number,number,number]; offset:[number,number,number];
  normalize?:{height?:number;width?:number;ground:boolean};
  clips:Record<string,{names:string[];authoredSpeed?:number;fallback?:string}>;
  nodes:Record<string,string[]>; hideNodes:string[]; placeholder:AssetId;
  collision:{radius:number;height:number}; notes:string[];
}
function entry(id:AssetId,patch:Partial<AssetEntry>={}):AssetEntry {
  return {status:'placeholder',scale:1,rotation:[0,0,0],offset:[0,0,0],clips:{},nodes:{},hideNodes:[],placeholder:id,collision:{radius:.5,height:1},notes:['Code placeholder. Final art is not approved.'],...patch};
}
export const registry:Record<AssetId,AssetEntry> = {
  Player:entry('Player',{status:'temporary',file:'/assets/characters/player_rigged_v2.glb',normalize:{height:1.7,ground:true},rotation:[0,0,0],clips:{idle:{names:['Idle']},walk:{names:['Walk'],authoredSpeed:2.8},run:{names:['Run'],fallback:'walk',authoredSpeed:4.6}},nodes:{handR:['rightHandGrip','RightHand'],handL:['leftHandGrip','LeftHand']},collision:{radius:.32,height:1.65},notes:['Local 17-bone v2 rig with five clips and two grips. Fast steps need a human bend check. Geometry exceeds the final person target.']}),
  Merchant:entry('Merchant',{status:'temporary',file:'/assets/characters/merchant.glb',normalize:{height:1.7,ground:true},rotation:[0,Math.PI,0],notes:['Static temporary mesh. Code idle sway. No claimed action clips.']}),
  FinancePackage:entry('FinancePackage',{status:'temporary',file:'/assets/core/finance_package.glb',normalize:{width:.46,ground:false},rotation:[0,Math.PI/2,0],offset:[0,.188,0],nodes:{chain:['chainAnchor'],grip:['packageGrip']}}),
  ChainLink:entry('ChainLink',{status:'temporary',file:'/assets/core/package_chain.glb',scale:.24,rotation:[Math.PI/2,0,0],nodes:{start:['linkStart'],end:['linkEnd']},notes:['Temporary link has wrong axes and sockets. Runtime chain uses one merged code mesh.']}),
  MarketStallA:entry('MarketStallA',{status:'temporary',file:'/assets/market/market_stall_A.glb',normalize:{width:3.3,ground:true}}),
  MarketStallB:entry('MarketStallB'), CentralTreeOuter:entry('CentralTreeOuter'),CentralTreeInner:entry('CentralTreeInner'),AttachmentBeetle:entry('AttachmentBeetle'),CityGate:entry('CityGate'),CityWall:entry('CityWall'),CityBuilding:entry('CityBuilding'),Citizen:entry('Citizen'),InnerPlatform:entry('InnerPlatform'),Rock:entry('Rock'),Crystal:entry('Crystal'),Vegetation:entry('Vegetation'),
};
