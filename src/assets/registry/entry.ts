import type {AssetId} from '../../contracts/visual';
export interface AssetEntry {
  status:'placeholder'|'temporary'|'final'; file?:string;
  scale:number; rotation:[number,number,number]; offset:[number,number,number];
  normalize?:{height?:number;width?:number;ground:boolean};
  clips:Record<string,{names:string[];authoredSpeed?:number;fallback?:string}>;
  nodes:Record<string,string[]>; hideNodes:string[]; placeholder:AssetId;
  // Kit files: logical part -> GLB node names. `create(id,scene,parent,part)` keeps only that subtree.
  parts?:Record<string,string[]>;
  collision:{radius:number;height:number}; notes:string[];
}
export function entry(id:AssetId,patch:Partial<AssetEntry>={}):AssetEntry {
  return {status:'placeholder',scale:1,rotation:[0,0,0],offset:[0,0,0],clips:{},nodes:{},hideNodes:[],placeholder:id,collision:{radius:.5,height:1},notes:['Code placeholder. Final art is not approved.'],...patch};
}
