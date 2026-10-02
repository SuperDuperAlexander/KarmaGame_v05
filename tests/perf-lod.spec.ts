import {describe,it,expect} from 'vitest';
import {collapse,LOD_DEFAULTS,FADE_DEFAULTS} from '../src/assets/lod';

/** A flat grid of n x n squares (two triangles each) with a bump so the shape is not a plane. */
function grid(n:number){
  const pos:number[]=[];for(let y=0;y<=n;y++)for(let x=0;x<=n;x++)pos.push(x,Math.sin(x*.5)*Math.cos(y*.5),y);
  const idx:number[]=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++){const a=y*(n+1)+x,b=a+1,c=a+n+1,d=c+1;idx.push(a,c,b,b,c,d);}
  return {pos:Float32Array.from(pos),idx};
}
describe('Far detail (edge collapse)',()=>{
  it('keeps about the asked share of triangles and no broken triangle',()=>{
    const {pos,idx}=grid(20);const r=collapse(pos,idx,.4);const before=idx.length/3,after=r.keep.length/3;
    expect(after).toBeLessThan(before*.55);expect(after).toBeGreaterThan(before*.25);
    for(let t=0;t<after;t++){const a=r.keep[t*3],b=r.keep[t*3+1],c=r.keep[t*3+2];
      const p=(v:number)=>[r.place[v*3],r.place[v*3+1],r.place[v*3+2]];const [A,B,C]=[p(a),p(b),p(c)];
      const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],vx=C[0]-A[0],vy=C[1]-A[1],vz=C[2]-A[2];
      expect(Math.hypot(uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx)).toBeGreaterThan(1e-9);}
  });
  it('keeps the outline of a flat patch',()=>{
    const {pos,idx}=grid(12);const r=collapse(pos,idx,.3);let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
    for(const v of r.keep){minX=Math.min(minX,r.place[v*3]);maxX=Math.max(maxX,r.place[v*3]);minZ=Math.min(minZ,r.place[v*3+2]);maxZ=Math.max(maxZ,r.place[v*3+2]);}
    expect([minX,maxX,minZ,maxZ]).toEqual([0,12,0,12]);
  });
  it('moves vertices that share a place together, so seams stay closed',()=>{
    // A grid cut in two along x = 5. The cut column exists twice: once for each side.
    const n=10;const g=grid(n);const pos=[...g.pos];const dup=new Map<number,number>();
    for(let y=0;y<=n;y++){const v=y*(n+1)+5;dup.set(v,pos.length/3);pos.push(g.pos[v*3],g.pos[v*3+1],g.pos[v*3+2]);}
    const idx=g.idx.slice();
    for(let t=0;t<idx.length;t+=3){const xs=[0,1,2].map(k=>idx[t+k]%(n+1));if(Math.min(...xs)>=5)for(let k=0;k<3;k++)if(dup.has(idx[t+k]))idx[t+k]=dup.get(idx[t+k])!;}
    const r=collapse(Float32Array.from(pos),idx,.3);
    for(const [a,b] of dup)for(let k=0;k<3;k++)expect(r.place[a*3+k]).toBe(r.place[b*3+k]);
    expect(r.keep.length/3).toBeLessThan(idx.length/3*.6);
  });
  it('has a rule table that names only far levels and fade parts',()=>{
    for(const spec of Object.values(LOD_DEFAULTS)){expect(spec.at===undefined||spec.at>=20).toBe(true);expect(spec.ratio===undefined||(spec.ratio>0&&spec.ratio<1)).toBe(true);expect(spec.far===undefined||spec.far>(spec.at??0)||spec.at===undefined).toBe(true);}
    expect(FADE_DEFAULTS.CityBuilding).toBe(true);expect(FADE_DEFAULTS.CentralTreeInner).toBeTruthy();
  });
});
