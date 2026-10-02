// Pure layout data for the city shell. No Babylon imports. Meters. +Z north, +X east.
export type HouseKind='small'|'medium'|'corner'|'tower';
export type Facing='S'|'N'|'E'|'W';
// Scaled footprint: w is the width along the row, d is the depth, h is the roof height. Raw sizes are in docs/wp notes.
export const HOUSE:Record<HouseKind,{s:number;w:number;d:number;h:number}>={
  small:{s:.9,w:5.4,d:6.9,h:7.1},medium:{s:.8,w:7.2,d:8.1,h:10},corner:{s:.65,w:5.85,d:8.9,h:5.8},tower:{s:.9,w:4.6,d:4.6,h:12.6},
};
export interface HousePlan {kind:HouseKind;x:number;z:number;yaw:number;w:number;d:number;h:number;s:number}
// The native front of a kit house looks to -Z, so facing S needs yaw 0.
const YAW:Record<Facing,number>={S:0,N:Math.PI,E:-Math.PI/2,W:Math.PI/2};
/** Lays houses side by side. `front` is the line the doors look at. `start` is the first edge along the row. */
export function houseRow(kinds:HouseKind[],facing:Facing,front:number,start:number,gap=.5):HousePlan[]{
  let cursor=start;const out:HousePlan[]=[];
  for(const kind of kinds){
    const k=HOUSE[kind];const along=cursor+k.w/2;cursor+=k.w+gap;
    const x=facing==='S'||facing==='N'?along:facing==='E'?front-k.d/2:front+k.d/2;
    const z=facing==='S'?front+k.d/2:facing==='N'?front-k.d/2:along;
    out.push({kind,x,z,yaw:YAW[facing],w:facing==='S'||facing==='N'?k.w:k.d,d:facing==='S'||facing==='N'?k.d:k.w,h:k.h,s:k.s});
  }
  return out;
}
export const HOUSES:HousePlan[]=[
  // North closes the north alley. West closes the west alley. South rows sit behind the city wall. East rows frame the market.
  ...houseRow(['medium','small','corner','tower','medium','small','medium','corner','small'],'S',17,-27),
  ...houseRow(['small','medium','tower','corner','small'],'E',-18.5,-17),
  ...houseRow(['small','medium'],'N',-18,-30),
  ...houseRow(['small','tower','medium','small'],'N',-18,14),
  ...houseRow(['small','medium'],'W',35.8,8),
  ...houseRow(['small','small'],'W',35.8,-15),
];
// Hedge mounds hide the world edge. Never on the walk line.
export const HEDGES:[number,number][]=[
  [-29,-50.5],[-20.5,-50.5],[-12,-50.5],[12,-50.5],[20.5,-50.5],[29,-50.5],[37,-50.5],
  [-30.5,-44],[-30.5,-35],[38.5,-44],[38.5,-35],
];
export const LAMPS:[number,number][]=[[-3.6,-42],[3.6,-42],[-3.6,-31],[3.6,-31],[-9.5,-8.5],[9.5,-8.5],[-9.5,8.5],[9.5,8.5],[19,3.8],[19,-3.8],[-10.6,-1.2],[10.6,-3.2]];
// Cloth banners on poles. yaw 0 shows the cloth to the south. Colour index: 0 red, 1 blue, 2 orange. Off the walk lines.
export const BANNERS:{x:number;z:number;yaw:number;color:0|1|2;height?:number}[]=[
  {x:-6.4,z:-29,yaw:0,color:0,height:5.2},{x:6.4,z:-29,yaw:0,color:1,height:5.2},{x:-6,z:-13,yaw:0,color:2},{x:6,z:-13,yaw:0,color:0},
  {x:-12.5,z:2.5,yaw:Math.PI/2,color:1},{x:17.5,z:-6.5,yaw:Math.PI/2,color:2},
];
// Planter pots on the square. Keep |x| above 3.3 near the walk line and off the market path.
export const PLANTERS:[number,number][]=[[-4.8,-11.5],[4.8,-11.5],[-12.6,-6],[12.6,-8],[-11,11.5],[11.5,11.5],[-4.6,-18.5],[4.6,-18.5]];
