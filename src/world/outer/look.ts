import '@babylonjs/core/Meshes/thinInstanceMesh';
import type {Scene} from '@babylonjs/core/scene';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {Material} from '@babylonjs/core/Materials/material';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {CreateCylinder} from '@babylonjs/core/Meshes/Builders/cylinderBuilder';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {backdropStrip,canPaint} from '../../presentation/paint';

type Pbr={albedoColor?:Color3;albedoTexture?:unknown;emissiveColor?:Color3;emissiveTexture?:unknown};

/** One open ring far behind the city. Hills, mountains and a few towers painted in code. One draw call, no fog, no light. */
export function createBackdrop(scene:Scene){
  if(!canPaint())return null;
  const tex=backdropStrip(scene);tex.uScale=2;
  const ring=CreateCylinder('far-backdrop',{height:44,diameter:240,tessellation:40,cap:Mesh.NO_CAP,sideOrientation:Mesh.BACKSIDE},scene);
  ring.position.set(4,12,-14);ring.isPickable=false;ring.alwaysSelectAsActiveMesh=true;ring.metadata={cameraBlocker:false};
  const m=new StandardMaterial('far-backdrop',scene);m.disableLighting=true;m.emissiveTexture=tex;m.opacityTexture=tex;m.backFaceCulling=false;m.fogEnabled=false;m.specularColor=Color3.Black();
  ring.material=m;ring.freezeWorldMatrix();ring.doNotSyncBoundingInfo=true;
  return ring;
}

/**
 * Lift the two kit materials toward warm plaster and terracotta. The kit has one atlas per file, so one tint serves all parts.
 * The atlas also feeds a weak warm emissive, so shaded walls do not go grey. No new texture.
 */
export function warmKits(scene:Scene){
  for(const mat of scene.materials){
    if(!/^city_(building_kit|infrastructure)Mat$/.test(mat.name))continue;
    const m=mat as unknown as Pbr;if(!m.albedoTexture)continue;
    m.albedoColor=new Color3(1.16,1.02,.84);
    if(!m.emissiveTexture)m.emissiveTexture=m.albedoTexture;m.emissiveColor=new Color3(.2,.12,.06);
  }
}

// ---------------------------------------------------------------------------------------------
import {Vector3,Matrix,Quaternion} from '@babylonjs/core/Maths/math.vector';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {CreateSphere} from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import {CreatePlane} from '@babylonjs/core/Meshes/Builders/planeBuilder';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import type {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';
import {Constants} from '@babylonjs/core/Engines/constants';
import {dotTexture,tuftTexture,clothTexture} from '../../presentation/paint';
import type {HousePlan} from './layout';

function rng(seed:number){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const glow=(m:AbstractMesh)=>{m.metadata={...(m.metadata??{}),glow:true};};

/**
 * Warm flames and soft halos for the street lamps. No point light: a small emissive ball (tagged for the glow layer)
 * and one additive billboard. Every lamp shares one source mesh per kind, so the cost is two draw calls.
 */
export function createLampGlow(scene:Scene){
  const flameMat=new StandardMaterial('lamp-flame',scene);flameMat.disableLighting=true;flameMat.emissiveColor=new Color3(1,.78,.36);flameMat.diffuseColor=Color3.Black();flameMat.specularColor=Color3.Black();flameMat.fogEnabled=false;
  const haloMat=new StandardMaterial('lamp-halo',scene);haloMat.disableLighting=true;haloMat.diffuseColor=Color3.Black();haloMat.emissiveColor=new Color3(1,.6,.22);haloMat.specularColor=Color3.Black();haloMat.alpha=.8;
  const dot=canPaint()?dotTexture(scene,'paint-halo'):null;if(dot){haloMat.diffuseTexture=dot;haloMat.useAlphaFromDiffuseTexture=true;}
  haloMat.alphaMode=Constants.ALPHA_ADD;haloMat.disableDepthWrite=true;haloMat.backFaceCulling=false;
  let flameSrc:Mesh|null=null,haloSrc:Mesh|null=null;const halos:AbstractMesh[]=[];
  return {
    add(x:number,y:number,z:number,size=1){
      const flame=flameSrc?flameSrc.createInstance('lamp-flame'):(flameSrc=CreateSphere('lamp-flame',{diameter:.3,segments:6},scene));
      if(flame===flameSrc)flame.material=flameMat;
      flame.position.set(x,y,z);flame.scaling.setAll(size);flame.isPickable=false;glow(flame);
      const halo=haloSrc?haloSrc.createInstance('lamp-halo'):(haloSrc=CreatePlane('lamp-halo',{size:1},scene));
      if(halo===haloSrc)halo.material=haloMat;
      halo.position.set(x,y,z);halo.scaling.setAll(2.4*size);halo.billboardMode=Mesh.BILLBOARDMODE_ALL;halo.isPickable=false;halo.renderingGroupId=0;halos.push(halo);
    },
    dispose(){flameMat.dispose();haloMat.dispose();},
  };
}

/** Window openings measured on the kit houses (meters from the house centre line and the ground). w and h are the glass size. */
const WINDOWS:Record<string,{x:number;y:number;w:number;h:number}[]>={
  small:[{x:0,y:2.1,w:.62,h:.8}],
  medium:[{x:.9,y:2.1,w:.72,h:.9},{x:.9,y:5.1,w:.72,h:.95}],
  corner:[{x:-.78,y:2.65,w:.62,h:.9}],
  tower:[{x:.3,y:3.9,w:.42,h:1.05}],
};
/** Warm window lights on the house fronts: one arched shape per kit window, all in one mesh with one emissive material (tagged for the glow layer). */
export function createWindowLights(scene:Scene,houses:HousePlan[]){
  const r=rng(5);const pos:number[]=[],nor:number[]=[],idx:number[]=[];
  const arch=(cx:number,cy:number,cz:number,tx:number,tz:number,nx:number,nz:number,ww:number,hh:number)=>{
    const base=pos.length/3;const rect=hh-ww/2;const pts:[number,number][]=[[-ww/2,0],[ww/2,0],[ww/2,rect]];
    for(let k=1;k<6;k++){const a=k*Math.PI/6;pts.push([Math.cos(a)*ww/2,rect+Math.sin(a)*ww/2]);}pts.push([-ww/2,rect]);
    pos.push(cx,cy,cz);nor.push(nx,0,nz);
    for(const [u,v] of pts){pos.push(cx+tx*u,cy+v,cz+tz*u);nor.push(nx,0,nz);}
    for(let k=1;k<pts.length;k++)idx.push(base,base+k,base+k+1);
  };
  const lift=-.25;
  for(const h of houses){
    const tx=Math.cos(h.yaw),tz=-Math.sin(h.yaw),nx=-Math.sin(h.yaw),nz=-Math.cos(h.yaw);
    const depth=Math.abs(tx)>.5?h.d:h.w;
    for(const win of WINDOWS[h.kind])if(r()<.6){
      const o=depth/2+lift;arch(h.x+nx*o+tx*win.x,win.y-win.h/2,h.z+nz*o+tz*win.x,tx,tz,nx,nz,win.w,win.h);
    }
  }
  if(!idx.length)return null;
  const mesh=new Mesh('window-lights',scene);const vd=new VertexData();vd.positions=pos;vd.normals=nor;vd.indices=idx;vd.applyToMesh(mesh);
  const m=new StandardMaterial('window-lights',scene);m.disableLighting=true;m.emissiveColor=new Color3(1,.76,.38);m.diffuseColor=Color3.Black();m.specularColor=Color3.Black();m.backFaceCulling=false;
  mesh.material=m;mesh.isPickable=false;mesh.alwaysSelectAsActiveMesh=true;glow(mesh);mesh.freezeWorldMatrix();mesh.doNotSyncBoundingInfo=true;
  return mesh;
}

/**
 * Cloth banners on thin poles. The cloth swings a little with a sine on its pivot (no per frame allocation).
 * Poles and bars are merged in one static mesh. Cloth uses three instanced sources, one per colour.
 */
export function createBanners(scene:Scene,spots:{x:number;z:number;yaw:number;color:0|1|2;height?:number}[]){
  if(!canPaint()||!spots.length)return {update(_dt:number){},dispose(){}};
  const looks=[['#B3262E','#F2C14E','sun'],['#2A5FA8','#F2C14E','tree'],['#E08A1E','#7A1F2B','stripe']] as const;
  const cloth=looks.map(([main,trim,sign],i)=>{
    const m=new StandardMaterial('banner-'+i,scene);const t=clothTexture(scene,'paint-cloth-'+i,main,trim,sign);m.diffuseTexture=t;m.useAlphaFromDiffuseTexture=true;t.hasAlpha=true;
    m.transparencyMode=Material.MATERIAL_ALPHATEST;m.alphaCutOff=.5;m.backFaceCulling=false;m.specularColor=Color3.Black();m.emissiveColor=new Color3(.22,.16,.1);
    const src=CreatePlane('banner-src-'+i,{width:.95,height:2.3},scene);src.material=m;src.isPickable=false;return src;
  });
  const pole=new StandardMaterial('banner-pole',scene);pole.diffuseColor=new Color3(.32,.2,.1);pole.specularColor=Color3.Black();pole.emissiveColor=new Color3(.1,.06,.03);
  const usedSrc=[false,false,false];const parts:Mesh[]=[];const swing:{node:TransformNode;phase:number;amp:number}[]=[];
  spots.forEach((s,i)=>{
    const hgt=s.height??4.6;const root=new TransformNode('banner-'+i,scene);root.position.set(s.x,0,s.z);root.rotation.y=s.yaw;
    const post=CreateCylinder('bp',{height:hgt+.3,diameter:.14,tessellation:6},scene);post.position.set(s.x,(hgt+.3)/2,s.z);parts.push(post);
    const bar=CreateCylinder('bb',{height:1.1,diameter:.09,tessellation:5},scene);bar.rotation.z=Math.PI/2;bar.rotation.y=s.yaw;bar.position.set(s.x,hgt,s.z);parts.push(bar);
    const pivot=new TransformNode('banner-pivot-'+i,scene);pivot.parent=root;pivot.position.set(0,hgt-.02,.06);
    // The first banner of a colour uses the source mesh. The others are instances of it, so all share one draw call.
    const used=usedSrc[s.color];usedSrc[s.color]=true;const c=used?cloth[s.color].createInstance('banner-cloth-'+i):cloth[s.color];c.parent=pivot;c.position.set(0,-1.17,0);c.isPickable=false;
    swing.push({node:pivot,phase:i*1.7,amp:.05+(i%3)*.012});
  });
  const merged=parts.length?Mesh.MergeMeshes(parts,true,true):null;if(merged){merged.name='banner-poles';merged.material=pole;merged.isPickable=false;merged.freezeWorldMatrix();}
  let t=0;
  return {
    update(dt:number){t+=dt;for(const s of swing){s.node.rotation.z=Math.sin(t*.9+s.phase)*s.amp;s.node.rotation.x=Math.sin(t*1.3+s.phase*.7)*s.amp*.6;}},
    dispose(){for(const c of cloth)c.dispose();merged?.dispose();pole.dispose();},
  };
}

/** Grass and flower tufts as thin instances: two draw calls for the whole world. Placed at the edges only, never on the walk line. */
export function createTufts(scene:Scene,houses:HousePlan[]){
  if(!canPaint())return null;
  const r=rng(1234);
  const walk=(x:number,z:number)=>
    (Math.abs(x)<3.3&&z>-53&&z<-13)||Math.hypot(x,z)<15.4||(x>6&&x<40&&Math.abs(z)<3.7)||Math.hypot(x-1.2,z+43.5)<1.8||(Math.abs(x)<2.6&&z>-27.5&&z<-24.5)
    ||(Math.abs(z+26)<1.2&&Math.abs(x)<2.8);
  const inHouse=(x:number,z:number)=>houses.some(h=>Math.abs(x-h.x)<h.w/2+.6&&Math.abs(z-h.z)<h.d/2+.6);
  const inWorld=(x:number,z:number)=>x>-31&&x<39&&z>-51&&z<23;
  const pts:{x:number;z:number;flower:boolean;s:number}[]=[];
  const tryAdd=(x:number,z:number,flowerChance:number,s=1)=>{if(!inWorld(x,z)||walk(x,z)||inHouse(x,z))return;pts.push({x,z,flower:r()<flowerChance,s:s*(.7+r()*.8)});};
  for(let i=0;i<190;i++){const side=r()<.5?-1:1;tryAdd(side*(3.2+r()*r()*7),-51+r()*24,.22);}          // both sides of the arrival path
  for(let i=0;i<70;i++)tryAdd((r()-.5)*72,-27.8-r()*1.4,.1);                                         // foot of the city wall
  for(let i=0;i<150;i++){const a=r()*6.283,d=15.6+r()*r()*5;tryAdd(Math.cos(a)*d,Math.sin(a)*d,.25);} // rim of the square
  for(let i=0;i<60;i++)tryAdd(8+r()*30,(r()<.5?-1:1)*(3.8+r()*3),.2);                                // along the market path
  for(let i=0;i<90;i++)tryAdd(-31+r()*70,-26+r()*49,.12);                                              // sparse rest
  const make=(flower:boolean)=>{
    const m=new Mesh(flower?'tufts-flowers':'tufts-grass',scene);const pos:number[]=[],uv:number[]=[],nor:number[]=[],idx:number[]=[];
    for(let k=0;k<3;k++){const a=k*Math.PI/3,cx=Math.cos(a)*.5,cz=Math.sin(a)*.5,i=pos.length/3;
      pos.push(-cx,0,-cz,cx,0,cz,cx,.9,cz,-cx,.9,-cz);uv.push(0,0,1,0,1,1,0,1);nor.push(0,1,0,0,1,0,0,1,0,0,1,0);idx.push(i,i+1,i+2,i,i+2,i+3);}
    const vd=new VertexData();vd.positions=pos;vd.indices=idx;vd.uvs=uv;vd.normals=nor;vd.applyToMesh(m);
    const mat=new StandardMaterial(m.name,scene);const t=tuftTexture(scene,flower);mat.diffuseTexture=t;t.hasAlpha=true;mat.useAlphaFromDiffuseTexture=true;mat.transparencyMode=Material.MATERIAL_ALPHATEST;mat.alphaCutOff=.45;
    mat.backFaceCulling=false;mat.specularColor=Color3.Black();mat.emissiveColor=new Color3(.22,.2,.1);m.material=mat;m.isPickable=false;m.alwaysSelectAsActiveMesh=true;
    const list=pts.filter(p=>p.flower===flower);const buf=new Float32Array(list.length*16);const q=new Quaternion(),sc=new Vector3(),p=new Vector3(),mt=new Matrix();
    list.forEach((pt,i)=>{Quaternion.RotationYawPitchRollToRef(r()*6.283,0,0,q);sc.set(pt.s*1.2,pt.s*(.7+r()*.5),pt.s*1.2);p.set(pt.x,0,pt.z);Matrix.ComposeToRef(sc,q,p,mt);mt.copyToArray(buf,i*16);});
    if(list.length)m.thinInstanceSetBuffer('matrix',buf,16,true);else m.setEnabled(false);
    return m;
  };
  return [make(false),make(true)];
}

/** Terracotta planter pots, merged into one static mesh. The plants on top come from the vegetation kit. */
export function createPlanters(scene:Scene,spots:[number,number][]){
  const parts:Mesh[]=[];
  for(const [x,z] of spots){
    const pot=CreateCylinder('pot',{height:.62,diameterTop:.98,diameterBottom:.64,tessellation:10},scene);pot.position.set(x,.31,z);parts.push(pot);
    const rim=CreateCylinder('rim',{height:.12,diameter:1.08,tessellation:10},scene);rim.position.set(x,.64,z);parts.push(rim);
    const soil=CreateCylinder('soil',{height:.04,diameter:.92,tessellation:10},scene);soil.position.set(x,.68,z);parts.push(soil);
  }
  if(!parts.length)return null;
  const merged=Mesh.MergeMeshes(parts,true,true);if(!merged)return null;
  const m=new StandardMaterial('planter',scene);m.diffuseColor=new Color3(.86,.46,.26);m.specularColor=Color3.Black();m.emissiveColor=new Color3(.16,.07,.03);
  merged.name='planters';merged.material=m;merged.isPickable=false;merged.freezeWorldMatrix();return merged;
}
