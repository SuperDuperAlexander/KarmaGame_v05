import type {Scene} from '@babylonjs/core/scene';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';

/** Seeded random. Every reload gives the same shapes (AD-9). */
export function seeded(seed:number){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export type V3=[number,number,number];
export type RGB=[number,number,number];
/**
 * Flat shaded triangles with one colour per face, shade baked in. Many small shapes become one mesh and one draw call.
 * Light comes from the top and a little from the side, so facets read without a dynamic light.
 */
export class FacetBuilder{
  positions:number[]=[];colors:number[]=[];indices:number[]=[];
  tri(a:V3,b:V3,c:V3,color:RGB,shade=1){
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
    const lit=(.45+.4*Math.max(0,ny)+.25*Math.max(0,nx*.5+nz*.5)+.12*Math.max(0,-ny))*shade;
    const base=this.positions.length/3;
    for(const p of [a,b,c]){this.positions.push(p[0],p[1],p[2]);this.colors.push(Math.min(1.6,color[0]*lit),Math.min(1.6,color[1]*lit),Math.min(1.6,color[2]*lit),1);}
    this.indices.push(base,base+1,base+2);
  }
  /** Both sides of a quad would double the cost. Callers wind the points so the face looks outward. */
  quad(a:V3,b:V3,c:V3,d:V3,color:RGB,shade=1){this.tri(a,b,c,color,shade);this.tri(a,c,d,color,shade);}
  /** Pointed prism: `sides` flat faces from a base ring to a tip. Axis is up. */
  spike(x:number,y:number,z:number,r:number,h:number,sides:number,color:RGB,lean:[number,number]=[0,0],tipColor?:RGB,spin=0){
    const ring:V3[]=[];for(let i=0;i<sides;i++){const a=spin+i/sides*Math.PI*2;ring.push([x+Math.cos(a)*r,y,z+Math.sin(a)*r]);}
    const tip:V3=[x+lean[0],y+h,z+lean[1]];
    for(let i=0;i<sides;i++){const j=(i+1)%sides;this.tri(ring[j],ring[i],tip,tipColor&&i%2?tipColor:color);}
  }
  /** Rough rock: a flattened ring of 7 sides with a jittered crown and a skirt. */
  rock(x:number,y:number,z:number,rx:number,ry:number,rz:number,rand:()=>number,top:RGB,side:RGB){
    const n=7;const low:V3[]=[],mid:V3[]=[];const crown:V3=[x+(rand()-.5)*rx*.3,y+ry,z+(rand()-.5)*rz*.3];
    for(let i=0;i<n;i++){const a=i/n*Math.PI*2+rand()*.4;const k=.8+rand()*.4;low.push([x+Math.cos(a)*rx*k,y,z+Math.sin(a)*rz*k]);mid.push([x+Math.cos(a)*rx*.75*k,y+ry*(.55+rand()*.3),z+Math.sin(a)*rz*.75*k]);}
    for(let i=0;i<n;i++){const j=(i+1)%n;this.quad(low[i],mid[i],mid[j],low[j],side);this.tri(mid[i],crown,mid[j],top);}
  }
  build(scene:Scene,name:string):Mesh{
    const mesh=new Mesh(name,scene);const data=new VertexData();data.positions=this.positions;data.indices=this.indices;data.colors=this.colors;
    const normals:number[]=[];VertexData.ComputeNormals(this.positions,this.indices,normals);data.normals=normals;data.applyToMesh(mesh);
    mesh.isPickable=false;return mesh;
  }
}
/** Unlit vertex colour material. It keeps an emissive colour so the glow layer can use it (contract: metadata.glow). */
export function facetMaterial(scene:Scene,name:string,emissive=1){
  const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.Black();m.specularColor=Color3.Black();m.emissiveColor=new Color3(emissive,emissive,emissive);m.disableLighting=true;m.backFaceCulling=true;
  return m;
}
