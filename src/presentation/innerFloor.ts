import type {Scene} from '@babylonjs/core/scene';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {ShaderMaterial} from '@babylonjs/core/Materials/shaderMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {Constants} from '@babylonjs/core/Engines/constants';
import {canPaint} from './paint';
import {FacetBuilder,facetMaterial,seeded,type RGB,type V3} from './innerGeo';
import {shaftFragment,shaftVertex} from './innerBackdrop';

/**
 * The stone disk gets depth (concept panel K): a rock skirt under it, a rim of rocks and roots at the edge,
 * groups of emissive crystals and glowing plants, soft light pools and a gold-blue beam at the tree foot.
 * Visual only. No collider. The walk area (radius 10.5) stays free except for small plants at the edge.
 * Three draw calls: skirt + rim, crystals + plants (tagged glow), pools. One more for the beam.
 */
const KEEP_CLEAR:[number,number,number][]=[[0,-7,3],[0,-3.8,2.4],[4,-2,2.8],[7.5,-.5,3],[3.5,-3,3],[0,0,3]];
const clear=(x:number,z:number,pad=0)=>KEEP_CLEAR.every(([cx,cz,r])=>Math.hypot(x-cx,z-cz)>r+pad);
const CRYSTAL:RGB[]=[[.55,.4,1.25],[.3,.62,1.3],[1.3,.85,.28],[.5,.9,1.3]];
const PLANT:RGB[]=[[.25,1.05,1.2],[.5,.8,1.3],[1.15,.8,.3],[.7,.45,1.2]];

function ringPoint(r:number,a:number):V3{return [Math.cos(a)*r,0,Math.sin(a)*r];}

function skirtAndRim(scene:Scene):Mesh{
  const b=new FacetBuilder();const rand=seeded(515);
  // Skirt: rings of rock under the platform, narrowing to a point, so the disk floats.
  const rings=[{r:11.15,y:-.12},{r:10.1,y:-2.2},{r:7.4,y:-4.8},{r:4,y:-7.8},{r:1.2,y:-11.5}];const n=26;
  const pts:V3[][]=rings.map((g,i)=>Array.from({length:n},(_,k)=>{const a=k/n*Math.PI*2;const j=i===0?1:.75+rand()*.5;const p=ringPoint(g.r*j,a);return [p[0],g.y-(i?rand()*.7:0),p[2]] as V3;}));
  for(let i=0;i<rings.length-1;i++)for(let k=0;k<n;k++){const j=(k+1)%n;
    const c:RGB=i<1?[.2,.27,.48]:i<2?[.17,.2,.42]:[.14,.15,.36];
    b.quad(pts[i][k],pts[i+1][k],pts[i+1][j],pts[i][j],c,.9+rand()*.25);
  }
  // Hanging crystals under the skirt, cool blue and violet.
  for(let i=0;i<12;i++){const a=rand()*Math.PI*2,d=2+rand()*7;const y=-3.5-d*.35-rand()*2;const col=CRYSTAL[(i%2)?1:0];b.spike(Math.cos(a)*d*.8,y,Math.sin(a)*d*.8,.3+rand()*.25,-(1.2+rand()*1.8),5,col);}
  // Rim: rocks sit on the edge of the platform, just outside the walk area. Gaps stay between them.
  for(let i=0;i<46;i++){
    const a=i/46*Math.PI*2+rand()*.08;const r=11.05+rand()*.9;const p=ringPoint(r,a);
    const s=.35+rand()*.65*(i%5===0?1.5:1);
    b.rock(p[0],-.15,p[2],s*(1+rand()*.5),s*(.9+rand()*1.1),s*(1+rand()*.5),rand,[.28,.42,.56],[.16,.2,.34]);
    // A few of them carry a short gold or blue root tip, like roots that crawl over the stone.
    if(i%3===0){const col:RGB=i%6===0?[1.2,.8,.3]:[.3,.9,1.25];b.spike(p[0]*.97,s*.8,p[2]*.97,.08+rand()*.05,.6+rand()*.6,4,col,[(rand()-.5)*.3,(rand()-.5)*.3]);}
  }
  const mesh=b.build(scene,'inner-skirt-rim');const m=facetMaterial(scene,'inner-skirt-rim');m.backFaceCulling=false;mesh.material=m;mesh.freezeWorldMatrix();mesh.doNotSyncBoundingInfo=true;
  return mesh;
}
function crystalsAndPlants(scene:Scene):Mesh{
  const b=new FacetBuilder();const rand=seeded(616);
  const groups:{x:number;z:number;k:number}[]=[];
  const tryAdd=(x:number,z:number,k:number)=>{if(Math.hypot(x,z)<10.6&&clear(x,z,.5)&&groups.every(g=>Math.hypot(g.x-x,g.z-z)>2.6))groups.push({x,z,k});};
  // Rings of groups at the edge (large) and sparse small ones inside (plants).
  for(let i=0;i<40;i++){const a=i/40*Math.PI*2+rand()*.15,r=8.2+rand()*2.1;tryAdd(Math.cos(a)*r,Math.sin(a)*r,i%3===0?0:1);}
  for(let i=0;i<30;i++){const a=rand()*Math.PI*2,r=3+rand()*5.2;tryAdd(Math.cos(a)*r,Math.sin(a)*r,2);}
  groups.forEach((g,gi)=>{
    if(g.k<2){
      const n=g.k===0?7:4;const base=CRYSTAL[(gi+g.k)%CRYSTAL.length];
      // Near the camera side (south) crystals stay low, so they never fill the screen.
      const size=g.z<-4?.4:1;
      for(let i=0;i<n;i++){const a=rand()*Math.PI*2,d=rand()*.7;const tall=i===0?1:.35+rand()*.6;const h=((g.k===0?1.7:1)*tall+.25)*size;
        const col:RGB=[base[0]*(.8+rand()*.4),base[1]*(.8+rand()*.4),base[2]*(.8+rand()*.4)];
        b.spike(g.x+Math.cos(a)*d,0,g.z+Math.sin(a)*d,(g.k===0?.22:.16)*(.7+tall*.6)*(size<1?.7:1),h,5,col,[(rand()-.5)*.5,(rand()-.5)*.5],[Math.min(1.5,col[0]*1.25),Math.min(1.5,col[1]*1.25),Math.min(1.5,col[2]*1.25)],rand());}
    }else{
      // Glowing plants: a thin stem, a bulb, and sometimes a cap like a mushroom.
      const col=PLANT[gi%PLANT.length];const n=3+((rand()*3)|0);
      for(let i=0;i<n;i++){const a=rand()*Math.PI*2,d=.15+rand()*.6;const x=g.x+Math.cos(a)*d,z=g.z+Math.sin(a)*d;const h=.35+rand()*.5;
        b.spike(x,0,z,.035,h,3,[.1,.3,.45],[0,0]);
        if(i%2)b.spike(x,h*.9,z,.14+rand()*.08,.12,6,col,[0,0],[col[0]*1.3,col[1]*1.3,col[2]*1.3]);
        else{b.spike(x,h,z,.09,.18,5,col,[0,0],[1.3,1.3,1.3]);b.spike(x,h,z,.09,-.14,5,col);}
      }
    }
  });
  const mesh=b.build(scene,'inner-crystals-plants');const m=facetMaterial(scene,'inner-crystals-plants');m.backFaceCulling=false;mesh.material=m;mesh.metadata={glow:true};
  mesh.freezeWorldMatrix();mesh.doNotSyncBoundingInfo=true;
  return mesh;
}
function poolTexture(scene:Scene){
  const t=new DynamicTexture('inner-pool',{width:128,height:128},scene,true);const c=t.getContext() as CanvasRenderingContext2D;
  const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.35,'rgba(255,255,255,.45)');g.addColorStop(.7,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;c.fillRect(0,0,128,128);t.update(true);t.hasAlpha=true;return t;
}
/** Soft light pools on the stone: under the crystal groups, round the tree foot and where the story spots are. */
function pools(scene:Scene,groups:{x:number;z:number;r:number;c:RGB}[]):{mesh:Mesh;texture:DynamicTexture}|null{
  if(!canPaint())return null;
  const pos:number[]=[],uv:number[]=[],col:number[]=[],idx:number[]=[];
  for(const g of groups){const base=pos.length/3;const y=.035;
    pos.push(g.x-g.r,y,g.z-g.r,g.x+g.r,y,g.z-g.r,g.x+g.r,y,g.z+g.r,g.x-g.r,y,g.z+g.r);uv.push(0,0,1,0,1,1,0,1);
    for(let i=0;i<4;i++)col.push(g.c[0],g.c[1],g.c[2],1);idx.push(base,base+2,base+1,base,base+3,base+2);}
  const mesh=new Mesh('inner-pools',scene);const d=new VertexData();d.positions=pos;d.uvs=uv;d.colors=col;d.indices=idx;d.applyToMesh(mesh);mesh.isPickable=false;
  const texture=poolTexture(scene);const m=new StandardMaterial('inner-pools',scene);m.diffuseColor=Color3.Black();m.emissiveColor=Color3.White();m.specularColor=Color3.Black();m.disableLighting=true;
  m.diffuseTexture=texture;m.useAlphaFromDiffuseTexture=true;m.alphaMode=Constants.ALPHA_ADD;m.disableDepthWrite=true;m.zOffset=-6;m.backFaceCulling=false;
  mesh.material=m;mesh.alphaIndex=1;mesh.freezeWorldMatrix();mesh.doNotSyncBoundingInfo=true;return {mesh,texture};
}
export function innerFloor(scene:Scene){
  const skirt=skirtAndRim(scene);const deco=crystalsAndPlants(scene);
  const rand=seeded(717);const spots:{x:number;z:number;r:number;c:RGB}[]=[{x:0,z:0,r:6.5,c:[.5,.4,.15]},{x:0,z:0,r:9,c:[.1,.22,.45]},
    {x:4,z:-2,r:2.2,c:[.22,.15,.05]},{x:7.5,z:-.5,r:2.4,c:[.2,.13,.04]},{x:0,z:-3.8,r:1.6,c:[.06,.16,.22]},{x:-7,z:-4,r:3.4,c:[.4,.25,.8]},{x:-8,z:2,r:3.4,c:[.2,.35,.9]},{x:6,z:7,r:3.4,c:[.4,.3,.9]},{x:9,z:4,r:3.4,c:[.8,.5,.15]}];
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2+rand()*.3,r=8+rand()*2.4;spots.push({x:Math.cos(a)*r,z:Math.sin(a)*r,r:2+rand()*1.2,c:CRYSTAL[i%4].map(v=>v*.3) as RGB});}
  const pool=pools(scene,spots);
  // Beam at the tree foot: the heart of the world. Gold on the inside, blue outside, very soft.
  const pos:number[]=[],uv:number[]=[],idx:number[]=[];
  for(const turn of [0,Math.PI/2,Math.PI/4,-Math.PI/4]){const w=3.2;const cx=Math.cos(turn)*w,cz=Math.sin(turn)*w;const base=pos.length/3;pos.push(-cx,0,-cz,cx,0,cz,cx*1.6,34,cz*1.6,-cx*1.6,34,-cz*1.6);uv.push(0,0,1,0,1,1,0,1);idx.push(base,base+1,base+2,base,base+2,base+3);}
  const beam=new Mesh('inner-heart-beam',scene);const bd=new VertexData();bd.positions=pos;bd.uvs=uv;bd.indices=idx;bd.applyToMesh(beam);beam.isPickable=false;
  const bm=new ShaderMaterial('inner-heart-beam',scene,{vertexSource:shaftVertex,fragmentSource:shaftFragment},{attributes:['position','uv'],uniforms:['worldViewProjection','time','tint'],needAlphaBlending:true});
  bm.backFaceCulling=false;bm.disableDepthWrite=true;bm.alphaMode=Constants.ALPHA_ADD;bm.setColor3('tint',new Color3(.55,.5,.28));bm.fogEnabled=false;beam.material=bm;beam.alphaIndex=3;beam.alwaysSelectAsActiveMesh=true;
  let t=0;
  return {update(dt:number){t+=dt;bm.setFloat('time',t);},dispose(){for(const m of [skirt,deco]){m.material?.dispose();m.dispose();}pool?.mesh.material?.dispose();pool?.mesh.dispose();pool?.texture.dispose();beam.dispose();bm.dispose();}};
}
