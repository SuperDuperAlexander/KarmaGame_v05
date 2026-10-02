import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {VertexBuffer} from '@babylonjs/core/Buffers/buffer';
import type {Scene} from '@babylonjs/core/scene';
import type {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';
import {InstancedMesh} from '@babylonjs/core/Meshes/instancedMesh';
import type {LodSpec} from './registry/entry';
import type {AssetId} from '../contracts/visual';

/**
 * Far detail for static kit meshes (WP-36, spec 15.2). One simplified copy per source mesh, built once at load.
 * The copy comes from edge collapse with quadric error (Garland and Heckbert) on the welded shape. Vertices that share
 * a place move together, so texture seams do not open. Every vertex keeps its own UV and normal. The copy needs no
 * extra download and has the same local space and material as the source. Instances pick the level by distance.
 */
const done=new WeakSet<Mesh>();
type Quadric=Float64Array;
interface Candidate {c:number;a:number;b:number;va:number;vb:number}

function plane(q:Quadric,a:number,b:number,c:number,d:number,w:number){
  q[0]+=w*a*a;q[1]+=w*a*b;q[2]+=w*a*c;q[3]+=w*a*d;q[4]+=w*b*b;q[5]+=w*b*c;q[6]+=w*b*d;q[7]+=w*c*c;q[8]+=w*c*d;q[9]+=w*d*d;
}
function error(q:Quadric,x:number,y:number,z:number){
  return q[0]*x*x+2*q[1]*x*y+2*q[2]*x*z+2*q[3]*x+q[4]*y*y+2*q[5]*y*z+2*q[6]*y+q[7]*z*z+2*q[8]*z+q[9];
}

/** Indices of the triangles to keep and the new place of every vertex. */
export function collapse(pos:Float32Array,idx:ArrayLike<number>,ratio:number){
  const vertices=pos.length/3,triangles=idx.length/3;
  // Weld by place. Group g holds every vertex at one place, whatever its UV or normal.
  let size=0;for(let i=0;i<pos.length;i++)size=Math.max(size,Math.abs(pos[i]));const grid=size*1e-5||1e-6;
  const lookup=new Map<string,number>();const group=new Int32Array(vertices);const gx:number[]=[],gy:number[]=[],gz:number[]=[];
  for(let v=0;v<vertices;v++){
    const k=Math.round(pos[v*3]/grid)+','+Math.round(pos[v*3+1]/grid)+','+Math.round(pos[v*3+2]/grid);
    let g=lookup.get(k);if(g===undefined){g=gx.length;lookup.set(k,g);gx.push(pos[v*3]);gy.push(pos[v*3+1]);gz.push(pos[v*3+2]);}group[v]=g;
  }
  const n=gx.length;const tri=new Int32Array(triangles*3);const alive=new Uint8Array(triangles);let aliveCount=0;
  for(let t=0;t<triangles;t++){
    const a=group[idx[t*3]],b=group[idx[t*3+1]],c=group[idx[t*3+2]];tri[t*3]=a;tri[t*3+1]=b;tri[t*3+2]=c;
    if(a!==b&&b!==c&&a!==c){alive[t]=1;aliveCount++;}
  }
  const faces:number[][]=Array.from({length:n},()=>[]);for(let t=0;t<triangles;t++)if(alive[t])for(let k=0;k<3;k++)faces[tri[t*3+k]].push(t);
  const q:Quadric[]=Array.from({length:n},()=>new Float64Array(10));
  const nrm=[0,0,0,0];
  const normal=(t:number)=>{
    const a=tri[t*3],b=tri[t*3+1],c=tri[t*3+2];
    const ux=gx[b]-gx[a],uy=gy[b]-gy[a],uz=gz[b]-gz[a],vx=gx[c]-gx[a],vy=gy[c]-gy[a],vz=gz[c]-gz[a];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;nrm[0]=nx;nrm[1]=ny;nrm[2]=nz;nrm[3]=Math.hypot(nx,ny,nz);
  };
  const edgeUse=new Map<number,number>();
  for(let t=0;t<triangles;t++){
    if(!alive[t])continue;normal(t);const l=nrm[3];
    for(let k=0;k<3;k++){const a=tri[t*3+k],b=tri[t*3+(k+1)%3];const key=Math.min(a,b)*n+Math.max(a,b);edgeUse.set(key,(edgeUse.get(key)??0)+1);}
    if(l<1e-12)continue;const a=nrm[0]/l,b=nrm[1]/l,c=nrm[2]/l;const d=-(a*gx[tri[t*3]]+b*gy[tri[t*3]]+c*gz[tri[t*3]]);
    for(let k=0;k<3;k++)plane(q[tri[t*3+k]],a,b,c,d,l*.5);
  }
  // Open edges get a strong plane across them, so rims do not shrink.
  for(let t=0;t<triangles;t++){
    if(!alive[t])continue;normal(t);const l=nrm[3];if(l<1e-12)continue;
    for(let k=0;k<3;k++){
      const a=tri[t*3+k],b=tri[t*3+(k+1)%3];if(edgeUse.get(Math.min(a,b)*n+Math.max(a,b))!==1)continue;
      const ex=gx[b]-gx[a],ey=gy[b]-gy[a],ez=gz[b]-gz[a];const fx=nrm[0]/l,fy=nrm[1]/l,fz=nrm[2]/l;
      let px=ey*fz-ez*fy,py=ez*fx-ex*fz,pz=ex*fy-ey*fx;const pl=Math.hypot(px,py,pz);if(pl<1e-12)continue;const w=pl*8;px/=pl;py/=pl;pz/=pl;
      const d=-(px*gx[a]+py*gy[a]+pz*gz[a]);plane(q[a],px,py,pz,d,w);plane(q[b],px,py,pz,d,w);
    }
  }
  const version=new Int32Array(n);const dead=new Uint8Array(n);const into=new Int32Array(n).map((_,i)=>i);
  // Binary min heap of candidate collapses: cost, from, to and the versions they were made with.
  const heap:Candidate[]=[];
  const push=(e:Candidate)=>{let i=heap.push(e)-1;while(i>0){const p=(i-1)>>1;if(heap[p].c<=heap[i].c)break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}};
  const pop=()=>{const top=heap[0];const last=heap.pop()!;if(heap.length){heap[0]=last;let i=0;for(;;){let m=i;const l=2*i+1,r=l+1;if(l<heap.length&&heap[l].c<heap[m].c)m=l;if(r<heap.length&&heap[r].c<heap[m].c)m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m;}}return top;};
  const sum=new Float64Array(10);
  const queue=(a:number,b:number)=>{
    for(let i=0;i<10;i++)sum[i]=q[a][i]+q[b][i];
    const ab=error(sum,gx[b],gy[b],gz[b]),ba=error(sum,gx[a],gy[a],gz[a]);
    if(ab<=ba)push({c:ab,a,b,va:version[a],vb:version[b]});else push({c:ba,a:b,b:a,va:version[b],vb:version[a]});
  };
  const neighbours=(a:number)=>{const out=new Set<number>();for(const t of faces[a]){if(!alive[t])continue;for(let k=0;k<3;k++){const v=tri[t*3+k];if(v!==a)out.add(v);}}return out;};
  for(let a=0;a<n;a++)for(const b of neighbours(a))if(a<b)queue(a,b);
  // Would the move turn a nearby triangle over, or squash it? Then skip it.
  const flips=(a:number,b:number)=>{
    for(const t of faces[a]){
      if(!alive[t])continue;if(tri[t*3]===b||tri[t*3+1]===b||tri[t*3+2]===b)continue;
      normal(t);const ox=nrm[0],oy=nrm[1],oz=nrm[2],ol=nrm[3];
      const sx=gx[a],sy=gy[a],sz=gz[a];gx[a]=gx[b];gy[a]=gy[b];gz[a]=gz[b];normal(t);gx[a]=sx;gy[a]=sy;gz[a]=sz;
      if(nrm[3]<1e-12||ol<1e-12)return true;if((ox*nrm[0]+oy*nrm[1]+oz*nrm[2])/(ol*nrm[3])<.35)return true;
    }
    return false;
  };
  const target=Math.max(30,Math.floor(aliveCount*ratio));
  while(aliveCount>target&&heap.length){
    const e=pop();if(dead[e.a]||dead[e.b]||version[e.a]!==e.va||version[e.b]!==e.vb)continue;
    if(flips(e.a,e.b))continue;
    // Collapse a into b.
    for(const t of faces[e.a]){
      if(!alive[t])continue;
      if(tri[t*3]===e.b||tri[t*3+1]===e.b||tri[t*3+2]===e.b){alive[t]=0;aliveCount--;continue;}
      for(let k=0;k<3;k++)if(tri[t*3+k]===e.a)tri[t*3+k]=e.b;faces[e.b].push(t);
    }
    for(let i=0;i<10;i++)q[e.b][i]+=q[e.a][i];dead[e.a]=1;into[e.a]=e.b;version[e.b]++;faces[e.a]=[];
    faces[e.b]=faces[e.b].filter(t=>alive[t]);
    for(const m of neighbours(e.b))queue(e.b,m);
  }
  const root=(g:number)=>{while(into[g]!==g)g=into[g];return g;};
  const place=new Float32Array(pos.length);
  for(let v=0;v<vertices;v++){const r=root(group[v]);place[v*3]=gx[r];place[v*3+1]=gy[r];place[v*3+2]=gz[r];}
  const keep:number[]=[];for(let t=0;t<triangles;t++)if(alive[t])keep.push(idx[t*3],idx[t*3+1],idx[t*3+2]);
  return {place,keep};
}

function simplified(source:Mesh,scene:Scene,ratio:number):Mesh|null{
  const pos=source.getVerticesData(VertexBuffer.PositionKind),idx=source.getIndices();if(!pos||!idx||idx.length<150)return null;
  const result=collapse(Float32Array.from(pos),idx,ratio);if(result.keep.length>=idx.length*.9)return null;
  // Keep only the vertices the kept triangles use. Every vertex keeps its own normal, UV and colour.
  const remap=new Int32Array(pos.length/3).fill(-1);const used:number[]=[];const indices:number[]=[];
  for(const v of result.keep){if(remap[v]<0){remap[v]=used.length;used.push(v);}indices.push(remap[v]);}
  const pick=(kind:string,stride:number)=>{const data=source.getVerticesData(kind);if(!data)return null;const out=new Float32Array(used.length*stride);used.forEach((v,i)=>{for(let k=0;k<stride;k++)out[i*stride+k]=data[v*stride+k];});return out;};
  const data=new VertexData();data.indices=indices;
  const position=new Float32Array(used.length*3);used.forEach((v,i)=>{position[i*3]=result.place[v*3];position[i*3+1]=result.place[v*3+1];position[i*3+2]=result.place[v*3+2];});
  data.positions=position;const normals=pick(VertexBuffer.NormalKind,3),uvs=pick(VertexBuffer.UVKind,2),colors=pick(VertexBuffer.ColorKind,4);
  if(normals)data.normals=normals;if(uvs)data.uvs=uvs;if(colors)data.colors=colors;
  const mesh=new Mesh(source.name+'.lod',scene);data.applyToMesh(mesh);mesh.material=source.material;
  // The level draws through its instances. It must not draw on its own.
  mesh.isVisible=false;mesh.isPickable=false;mesh.doNotSyncBoundingInfo=true;
  return mesh;
}

/**
 * Add far levels to the source meshes behind the given meshes. `at` is the distance where the simple copy starts.
 * `far` hides the mesh. Meshes that are clones (skinned files) get only the far level.
 */
export function addLods(meshes:AbstractMesh[],scene:Scene,spec:LodSpec):void{
  for(const m of meshes){
    if(m instanceof InstancedMesh){
      const source=m.sourceMesh;if(done.has(source))continue;done.add(source);
      if(spec.at){const lod=simplified(source,scene,spec.ratio??.3);if(lod)source.addLODLevel(spec.at,lod);}
      if(spec.far)source.addLODLevel(spec.far,null);
    }else if(m instanceof Mesh&&spec.far&&!done.has(m)){done.add(m);m.addLODLevel(spec.far,null);}
  }
}

/**
 * Default far detail and fade rules per asset. A registry entry may set its own `lod` or `fade`. Distances are in metres.
 * The path and the square stay at full detail: nothing in the walk area is closer than the first `at` value.
 */
export const LOD_DEFAULTS:Partial<Record<AssetId,LodSpec>>={
  CityBuilding:{at:38,ratio:.4},CityWall:{at:34,ratio:.35,far:110},CityGate:{at:46,ratio:.4},
  MarketStallA:{at:30,ratio:.35},MarketStallB:{at:30,ratio:.35},MarketProps:{at:26,ratio:.4,far:75},
  Vegetation:{at:30,ratio:.4,far:85},Merchant:{far:52},
};
/** Parts that may fade when they hide the player. */
export const FADE_DEFAULTS:Partial<Record<AssetId,string[]|true>>={
  CityBuilding:true,CentralTreeOuter:['trunk','branches_left','branches_right','branches_center','leaves_left_01','leaves_left_02','leaves_right_01','leaves_right_02','leaves_center'],
  CentralTreeInner:true,
};
