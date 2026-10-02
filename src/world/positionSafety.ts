import type {Position} from '../contracts/state';

export interface WalkBounds {minX:number;maxX:number;minZ:number;maxZ:number}
export interface WalkObstacle extends WalkBounds {minY:number;maxY:number}

/** Restore a safe point without changing facts or words in the save. */
export function recoverWalkPosition(point:Position,bounds:WalkBounds,obstacles:readonly WalkObstacle[],anchors:readonly Position[]):Position{
  const radius=.34;
  const safe=(p:Position)=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z)
    &&Math.abs(p.y)<=2&&p.x>=bounds.minX+radius&&p.x<=bounds.maxX-radius&&p.z>=bounds.minZ+radius&&p.z<=bounds.maxZ-radius
    &&!obstacles.some(o=>o.maxY>p.y+.25&&o.minY<p.y+1.65&&p.x>o.minX-radius&&p.x<o.maxX+radius&&p.z>o.minZ-radius&&p.z<o.maxZ+radius);
  if(safe(point))return {...point};
  const next=anchors.filter(safe).sort((a,b)=>Math.hypot(a.x-point.x,a.z-point.z)-Math.hypot(b.x-point.x,b.z-point.z))[0];
  if(!next)throw new Error('No safe saved-position anchor');
  return {...next};
}
