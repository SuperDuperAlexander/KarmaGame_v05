import type {AssetId} from '../../contracts/visual';
/** Far detail for static meshes. `at`: metres where a simpler copy starts. `ratio`: share of triangles it keeps. `far`: metres where the mesh is hidden. */
export interface LodSpec {at?:number;ratio?:number;far?:number}
export interface AssetEntry {
  status:'placeholder'|'temporary'|'final'; file?:string;
  scale:number; rotation:[number,number,number]; offset:[number,number,number];
  normalize?:{height?:number;width?:number;ground:boolean};
  clips:Record<string,{names:string[];authoredSpeed?:number;fallback?:string}>;
  nodes:Record<string,string[]>; hideNodes:string[]; placeholder:AssetId;
  // Kit files: logical part -> GLB node names. `create(id,scene,parent,part)` keeps only that subtree.
  parts?:Record<string,string[]>;
  // Optional (WP-36). `lod`: far detail for static meshes. `fade`: node names (or true for all) that may fade when they hide the player.
  lod?:LodSpec;fade?:string[]|true;
  collision:{radius:number;height:number}; notes:string[];
}
export function entry(id:AssetId,patch:Partial<AssetEntry>={}):AssetEntry {
  return {status:'placeholder',scale:1,rotation:[0,0,0],offset:[0,0,0],clips:{},nodes:{},hideNodes:[],placeholder:id,collision:{radius:.5,height:1},notes:['Code placeholder. Final art is not approved.'],...patch};
}
