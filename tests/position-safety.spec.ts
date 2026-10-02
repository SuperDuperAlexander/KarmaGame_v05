import {describe,it,expect} from 'vitest';
import {recoverWalkPosition} from '../src/world/positionSafety';

const bounds={minX:-35,maxX:40,minZ:-52,maxZ:47};
const anchors=[{x:0,y:0,z:-47},{x:0,y:0,z:-3.8},{x:0,y:0,z:24}];
describe('Saved walking position',()=>{
  it('keeps a safe position in the new north approach',()=>{
    expect(recoverWalkPosition({x:0,y:0,z:25},bounds,[],anchors)).toEqual({x:0,y:0,z:25});
  });
  it('moves an old house position to the nearest safe route',()=>{
    const house={minX:-3,maxX:3,minZ:18,maxZ:22,minY:0,maxY:8};
    expect(recoverWalkPosition({x:0,y:0,z:20},bounds,[house],anchors)).toEqual(anchors[2]);
  });
  it('checks body clearance and ignores the ground slab',()=>{
    const ground={...bounds,minY:-.3,maxY:0};
    const house={minX:2,maxX:4,minZ:-3,maxZ:0,minY:0,maxY:8};
    expect(recoverWalkPosition({x:1.8,y:0,z:-2},bounds,[ground,house],anchors)).toEqual(anchors[1]);
    expect(recoverWalkPosition(anchors[0],bounds,[ground],anchors)).toEqual(anchors[0]);
  });
  it('returns new data and rejects an unsafe last anchor',()=>{
    expect(recoverWalkPosition(anchors[0],bounds,[],anchors)).not.toBe(anchors[0]);
    expect(()=>recoverWalkPosition({x:999,y:0,z:999},bounds,[],[{x:999,y:0,z:999}])).toThrow('No safe');
  });
});
