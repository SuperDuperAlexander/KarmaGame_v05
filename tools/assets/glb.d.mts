export interface GlbInfo {bytes:number;triangles:number;materials:number;textures:{embedded:boolean;size?:number[]|null;uri?:string}[];nodes:string[];animations:string[];skins:number;joints:number;json:unknown}
export function readGlb(file:string):Promise<GlbInfo>;
