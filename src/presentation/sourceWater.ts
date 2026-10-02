import type {Scene} from '@babylonjs/core/scene';
import {ShaderMaterial} from '@babylonjs/core/Materials/shaderMaterial';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {Color3,Color4} from '@babylonjs/core/Maths/math.color';
import {Constants} from '@babylonjs/core/Engines/constants';
import {canPaint} from './paint';
import {createParticles} from './particles';
import {onQuality,preset} from './quality';

// Source Water (spec 9): a narrow ribbon from under the tree roots. Moving UVs, soft alpha edges. No fluid simulation.
/** Centre line (x, z) and width in metres. Outer: from the root foot west, off the walk lines. Inner: from the trunk foot to the south-west, ends before the fear root feet (x -2 to -14, z -4 to -14). */
const OUTER:[number,number,number][]=[[-2.2,2.6,.9],[-4.2,3.4,1.4],[-6.8,3.5,1.7],[-9.6,2.7,1.7],[-12.4,1.4,1.5],[-15.2,.4,1.3],[-17.2,-.2,.8]];
const INNER:[number,number,number][]=[[-1,-1.4,.8],[-2.4,-2.5,1.2],[-4.2,-3.3,1.4],[-6,-4,1.3],[-7.4,-4.4,.8]];
const vertex='precision highp float; attribute vec3 position; attribute vec2 uv; uniform mat4 worldViewProjection; varying vec2 vUV; void main(){ vUV=uv; gl_Position=worldViewProjection*vec4(position,1.0); }';
const fragment=`precision highp float; varying vec2 vUV; uniform float time; uniform float tension; uniform float len; uniform float glow; uniform vec3 deep; uniform vec3 shallow; uniform vec3 foam;
void main(){
  float edge=smoothstep(0.0,0.3,vUV.x)*smoothstep(1.0,0.7,vUV.x);
  float centre=1.0-abs(vUV.x-0.5)*2.0;
  float a=vUV.y;
  float w1=sin(a*3.6-time*1.7+sin(vUV.x*8.0+time*0.6)*0.9);
  float w2=sin(a*6.1-time*2.4+vUV.x*7.0);
  float ripple=pow(max(0.0,w1),9.0)*0.55+pow(max(0.0,w2),14.0)*0.35;
  vec3 c=mix(deep,shallow,clamp(centre*0.75+ripple*0.35,0.0,1.0))+foam*ripple*0.55+foam*glow*centre*0.35+vec3(tension*0.05,0.0,0.0);
  float ends=smoothstep(0.0,0.9,a)*smoothstep(len,len-3.0,a);
  gl_FragColor=vec4(c,edge*ends*(0.62+ripple*0.3)*(1.0-glow*0.2));
}`;
function spline(points:[number,number,number][],steps:number){
  const out:{x:number;z:number;w:number}[]=[];
  const at=(i:number)=>points[Math.max(0,Math.min(points.length-1,i))];
  for(let i=0;i<points.length-1;i++)for(let s=0;s<steps;s++){
    const t=s/steps,p0=at(i-1),p1=at(i),p2=at(i+1),p3=at(i+2);
    const cr=(k:number)=>.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t*t+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t*t*t);
    out.push({x:cr(0),z:cr(1),w:p1[2]+(p2[2]-p1[2])*t});
  }
  const last=points[points.length-1];out.push({x:last[0],z:last[1],w:last[2]});return out;
}
export function sourceWater(scene:Scene,inner:boolean){
  const line=spline(inner?INNER:OUTER,6);const y=inner?.03:.045;
  const positions:number[]=[],uvs:number[]=[],indices:number[]=[];let along=0;
  line.forEach((p,i)=>{
    const prev=line[Math.max(0,i-1)],next=line[Math.min(line.length-1,i+1)];
    const dx=next.x-prev.x,dz=next.z-prev.z,l=Math.hypot(dx,dz)||1;const nx=-dz/l,nz=dx/l;
    if(i>0)along+=Math.hypot(p.x-line[i-1].x,p.z-line[i-1].z);
    positions.push(p.x+nx*p.w/2,y,p.z+nz*p.w/2,p.x-nx*p.w/2,y,p.z-nz*p.w/2);uvs.push(0,along,1,along);
    if(i>0){const a=(i-1)*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}
  });
  const water=new Mesh('SourceWater',scene);const data=new VertexData();data.positions=positions;data.uvs=uvs;data.indices=indices;
  data.normals=positions.map((_,i)=>i%3===1?1:0);data.applyToMesh(water);water.isPickable=false;
  const shader=new ShaderMaterial('source-water',scene,{vertexSource:vertex,fragmentSource:fragment},{attributes:['position','uv'],uniforms:['worldViewProjection','time','tension','len','glow','deep','shallow','foam'],needAlphaBlending:true});
  shader.backFaceCulling=false;shader.zOffset=-4;shader.alphaMode=Constants.ALPHA_COMBINE;
  const c=(r:number,g:number,b:number)=>new Color3(r,g,b);
  shader.setFloat('len',along);shader.setFloat('glow',inner?1:.25);
  shader.setColor3('deep',inner?c(.05,.36,.58):c(.1,.5,.66));shader.setColor3('shallow',inner?c(.25,.8,.95):c(.35,.85,.9));shader.setColor3('foam',inner?c(.55,.95,1):c(.9,.97,.95));
  water.material=shader;water.renderingGroupId=0;water.alphaIndex=10;
  let time=0;
  const place=(out:Vector3)=>{const p=line[(Math.random()*(line.length-1))|0];out.set(p.x+(Math.random()-.5)*p.w*.7,y+.05+Math.random()*.25,p.z+(Math.random()-.5)*p.w*.7);};
  // Light specks ride the flow: billboards, 36 or 50 at most, half on low.
  const specks=canPaint()?createParticles(scene,[{name:'water-specks',capacity:inner?50:36,rate:inner?15:11,life:[2.5,4],size:[.07,.17],color1:inner?new Color4(.5,.95,1,.9):new Color4(1,.98,.85,.8),color2:inner?new Color4(.3,.7,1,.7):new Color4(.8,.95,.95,.6),speed:[.02,.1],gravity:new Vector3(0,.05,0),place}]):null;
  if(specks)onQuality(scene,q=>specks.scale(preset(scene,q).particles));
  return {update(dt:number,tension:number){time+=dt;shader.setFloat('time',time);shader.setFloat('tension',tension);},dispose(){specks?.dispose();water.dispose();shader.dispose();}};
}
