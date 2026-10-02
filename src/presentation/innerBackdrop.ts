import type {Scene} from '@babylonjs/core/scene';
import type {Mesh} from '@babylonjs/core/Meshes/mesh';
import {Mesh as MeshClass} from '@babylonjs/core/Meshes/mesh';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {CreateSphere} from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import {ShaderMaterial} from '@babylonjs/core/Materials/shaderMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {Constants} from '@babylonjs/core/Engines/constants';
import {FacetBuilder,facetMaterial,seeded,type RGB} from './innerGeo';

/**
 * Backdrop of the inner world (spec 8.2, concept panel K): a deep blue-violet space with a soft nebula and stars,
 * far floating islands and long, faint light shafts. Three draw calls in all. No collider, no light, no texture file.
 */
const domeVertex='precision highp float; attribute vec3 position; uniform mat4 worldViewProjection; varying vec3 vDir; void main(){ vDir=position; gl_Position=worldViewProjection*vec4(position,1.0); }';
// Value noise on the view direction. Three octaves make clouds, a hash grid makes stars. Alpha is added, so black is empty.
const domeFragment=`precision highp float; varying vec3 vDir; uniform float time;
float h(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float n(vec3 x){ vec3 i=floor(x); vec3 f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
void main(){
  vec3 d=normalize(vDir);
  float c=n(d*2.2+vec3(0.0,time*0.004,0.0))*0.55+n(d*4.6+7.0)*0.3+n(d*9.0+3.0)*0.15;
  float band=smoothstep(0.38,0.82,c);
  float low=smoothstep(0.55,-0.25,d.y);
  vec3 violet=vec3(0.34,0.14,0.62); vec3 blue=vec3(0.08,0.32,0.72); vec3 gold=vec3(0.75,0.45,0.12);
  vec3 col=mix(blue,violet,smoothstep(0.35,0.7,n(d*1.7+11.0)))*band*(0.45+low*0.55);
  col+=gold*pow(max(0.0,n(d*3.1+21.0)-0.55),2.0)*2.2*low;
  // Stars: one per hash cell, a few bright. They fade out toward the horizon haze.
  vec3 sp=d*70.0; vec3 cell=floor(sp); float r=h(cell); vec3 q=fract(sp)-0.5;
  float star=step(0.972,r)*smoothstep(0.32,0.0,length(q))*(0.5+0.5*sin(time*(1.0+r*3.0)+r*40.0));
  col+=vec3(0.8,0.9,1.0)*star*smoothstep(-0.1,0.3,d.y)*1.1;
  gl_FragColor=vec4(col,1.0);
}`;
export const shaftFragment='precision highp float; varying vec2 vUV; uniform float time; uniform vec3 tint; void main(){ float across=1.0-abs(vUV.x-0.5)*2.0; across=pow(clamp(across,0.0,1.0),1.6); float along=smoothstep(0.0,0.35,vUV.y)*smoothstep(1.0,0.55,vUV.y); float sway=0.8+0.2*sin(time*0.35+vUV.y*5.0+tint.r*9.0); gl_FragColor=vec4(tint*across*along*sway*0.55,1.0); }';
export const shaftVertex='precision highp float; attribute vec3 position; attribute vec2 uv; uniform mat4 worldViewProjection; varying vec2 vUV; void main(){ vUV=uv; gl_Position=worldViewProjection*vec4(position,1.0); }';

export interface Island{x:number;y:number;z:number;r:number;h:number}
/** Far islands. Anchors for the waterfalls too. Kept outside the ring (radius 24 to 70), no collider. */
export const ISLANDS:Island[]=[
  {x:-34,y:9,z:34,r:7,h:6},{x:30,y:14,z:42,r:9,h:8},{x:-52,y:3,z:6,r:8,h:7},{x:50,y:6,z:14,r:7,h:6},
  {x:8,y:20,z:62,r:11,h:9},{x:-26,y:-2,z:-46,r:8,h:7},{x:36,y:2,z:-40,r:7,h:6},{x:62,y:20,z:44,r:6,h:5},{x:-62,y:16,z:36,r:6,h:5},
];
const TOP:RGB[]=[[.2,.5,.62],[.28,.42,.7],[.22,.55,.55]];
const ROCK:RGB[]=[[.2,.24,.46],[.26,.2,.48],[.16,.26,.44]];

function islands(scene:Scene):Mesh{
  const b=new FacetBuilder();const rand=seeded(404);
  ISLANDS.forEach((s,k)=>{
    const n=9;const top:[number,number,number][]=[],bot:[number,number,number][]=[];
    for(let i=0;i<n;i++){const a=i/n*Math.PI*2+rand()*.3;const f=.82+rand()*.3;top.push([s.x+Math.cos(a)*s.r*f,s.y+(rand()-.5)*.6,s.z+Math.sin(a)*s.r*f]);bot.push([s.x+Math.cos(a)*s.r*.18*f,s.y-s.h*(.85+rand()*.3),s.z+Math.sin(a)*s.r*.18*f]);}
    const mid:[number,number,number][]=top.map(p=>[s.x+(p[0]-s.x)*.62+(rand()-.5)*.8,s.y-s.h*.42,s.z+(p[2]-s.z)*.62+(rand()-.5)*.8]);
    const rock=ROCK[k%3],grass=TOP[k%3];const centre:[number,number,number]=[s.x,s.y+.35,s.z];
    for(let i=0;i<n;i++){const j=(i+1)%n;
      b.tri(top[i],centre,top[j],grass,1.15);
      b.quad(top[i],mid[i],mid[j],top[j],rock,1);
      b.tri(mid[i],bot[i],mid[j],rock,.8);b.tri(mid[j],bot[i],bot[j],rock,.7);}
    // Glowing crystals on top, gold and violet and blue. They are the only bright spots, so the islands read from far.
    const tint:RGB[]=[[.55,.5,1.15],[.35,.75,1.2],[1.2,.8,.3]];
    for(let c=0;c<5;c++){const a=rand()*Math.PI*2,d=rand()*s.r*.55;const col=tint[(c+k)%3];b.spike(s.x+Math.cos(a)*d,s.y+.3,s.z+Math.sin(a)*d,.35+rand()*.3,1.2+rand()*2.2,5,col,[(rand()-.5)*.5,(rand()-.5)*.5],[col[0]*1.15,col[1]*1.15,col[2]*1.15]);}
  });
  const mesh=b.build(scene,'inner-far-islands');const m=facetMaterial(scene,'inner-far-islands');mesh.material=m;
  mesh.alwaysSelectAsActiveMesh=true;mesh.freezeWorldMatrix();return mesh;
}
/** Long, faint beams from above. One mesh of crossed quads, one draw call. */
function shafts(scene:Scene):{mesh:Mesh;mat:ShaderMaterial}{
  const rand=seeded(77);const pos:number[]=[],uv:number[]=[],idx:number[]=[];
  const place:[number,number,number,number][]=[[-18,28,28,5],[22,36,30,6],[-40,10,20,6],[44,12,16,5],[0,46,-26,6],[-28,-30,10,5]];
  for(const [x,z,h,w] of place){
    const lean=(rand()-.5)*8;
    for(const turn of [0,Math.PI/2]){
      const cx=Math.cos(turn)*w/2,cz=Math.sin(turn)*w/2;const base=pos.length/3;
      pos.push(x-cx,-6,z-cz,x+cx,-6,z+cz,x+cx+lean,70,z+cz,x-cx+lean,70,z-cz);uv.push(0,0,1,0,1,1,0,1);idx.push(base,base+1,base+2,base,base+2,base+3);void h;
    }
  }
  const mesh=new MeshClass('inner-shafts',scene);const d=new VertexData();d.positions=pos;d.uvs=uv;d.indices=idx;d.applyToMesh(mesh);mesh.isPickable=false;
  const mat=new ShaderMaterial('inner-shafts',scene,{vertexSource:shaftVertex,fragmentSource:shaftFragment},{attributes:['position','uv'],uniforms:['worldViewProjection','time','tint'],needAlphaBlending:true});
  mat.backFaceCulling=false;mat.disableDepthWrite=true;mat.alphaMode=Constants.ALPHA_ADD;mat.setColor3('tint',new Color3(.12,.2,.34));mat.fogEnabled=false;
  mesh.material=mat;mesh.alwaysSelectAsActiveMesh=true;mesh.alphaIndex=2;return {mesh,mat};
}
export function innerBackdrop(scene:Scene){
  const dome=CreateSphere('inner-nebula',{diameter:280,segments:12},scene);
  const mat=new ShaderMaterial('inner-nebula',scene,{vertexSource:domeVertex,fragmentSource:domeFragment},{attributes:['position'],uniforms:['worldViewProjection','time'],needAlphaBlending:true});
  mat.backFaceCulling=false;mat.disableDepthWrite=true;mat.fogEnabled=false;mat.alphaMode=Constants.ALPHA_ADD;
  dome.material=mat;dome.infiniteDistance=true;dome.isPickable=false;dome.alwaysSelectAsActiveMesh=true;dome.alphaIndex=0;
  const far=islands(scene);const beam=shafts(scene);
  let t=0;
  return {
    update(dt:number){t+=dt;mat.setFloat('time',t);beam.mat.setFloat('time',t);},
    dispose(){dome.dispose();mat.dispose();far.material?.dispose();far.dispose();beam.mesh.dispose();beam.mat.dispose();}
  };
}
