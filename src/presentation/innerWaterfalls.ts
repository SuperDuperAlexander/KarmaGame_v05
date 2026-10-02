import type {Scene} from '@babylonjs/core/scene';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {ShaderMaterial} from '@babylonjs/core/Materials/shaderMaterial';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {Color3,Color4} from '@babylonjs/core/Maths/math.color';
import {Constants} from '@babylonjs/core/Engines/constants';
import {canPaint} from './paint';
import {createParticles} from './particles';
import {onQuality,preset} from './quality';
import {ISLANDS} from './innerBackdrop';

/**
 * Waterfalls (concept panels A and K): thin ribbons that fall from the far islands into the void.
 * One merged mesh, one scrolling shader, soft alpha edges. Mist billboards sit at the foot (one particle system).
 * Looks only. No collider, no light. The glow layer may add the mesh (metadata.glow).
 */
const vertex='precision highp float; attribute vec3 position; attribute vec2 uv; attribute float seed; uniform mat4 worldViewProjection; varying vec2 vUV; varying float vSeed; varying float vY; void main(){ vUV=uv; vSeed=seed; vY=position.y; gl_Position=worldViewProjection*vec4(position,1.0); }';
const fragment=`precision highp float; varying vec2 vUV; varying float vSeed; varying float vY; uniform float time; uniform vec3 core; uniform vec3 rim;
void main(){
  float across=1.0-abs(vUV.x-0.5)*2.0;
  float edge=smoothstep(0.0,0.35,across);
  float flow=vUV.y*9.0+time*(2.2+vSeed*0.5);
  float streak=0.55+0.45*sin(vUV.x*(18.0+vSeed*7.0)+vSeed*30.0)*sin(flow+vUV.x*5.0);
  float drops=pow(max(0.0,sin(flow*1.7+vUV.x*11.0)),12.0);
  float top=smoothstep(0.0,0.06,vUV.y);
  float foot=smoothstep(1.0,0.72,vUV.y);
  vec3 c=mix(rim,core,across*0.8+streak*0.25)+vec3(0.9,1.0,1.0)*drops*0.5;
  gl_FragColor=vec4(c,edge*top*foot*(0.5+streak*0.25+drops*0.3));
}`;
const FALLS=[{island:0,width:3.2,drop:48},{island:1,width:4,drop:58},{island:2,width:2.6,drop:42},{island:5,width:3,drop:46}];
export function innerWaterfalls(scene:Scene){
  const pos:number[]=[],uv:number[]=[],seed:number[]=[],idx:number[]=[];const feet:Vector3[]=[];
  FALLS.forEach((f,k)=>{
    const s=ISLANDS[f.island];const yaw=Math.atan2(-s.x,-s.z);// quad faces the middle of the world
    const cx=Math.cos(yaw)*f.width/2,cz=-Math.sin(yaw)*f.width/2;
    // The ribbon starts at the island rim nearest the middle and widens a little as it falls.
    const dist=Math.hypot(s.x,s.z);const px=s.x-s.x/dist*s.r*.7,pz=s.z-s.z/dist*s.r*.7,top=s.y-.4,bottom=top-f.drop;
    const base=pos.length/3;const wide=1.5;
    pos.push(px-cx,top,pz-cz,px+cx,top,pz+cz,px+cx*wide,bottom,pz+cz*wide,px-cx*wide,bottom,pz-cz*wide);
    uv.push(0,0,1,0,1,1,0,1);seed.push(k,k,k,k);idx.push(base,base+2,base+1,base,base+3,base+2);
    feet.push(new Vector3(px,bottom+3,pz));
  });
  const mesh=new Mesh('inner-waterfalls',scene);const d=new VertexData();d.positions=pos;d.uvs=uv;d.indices=idx;d.applyToMesh(mesh);
  mesh.setVerticesData('seed',seed,false,1);mesh.isPickable=false;mesh.alwaysSelectAsActiveMesh=true;mesh.metadata={glow:true};
  const mat=new ShaderMaterial('inner-waterfalls',scene,{vertexSource:vertex,fragmentSource:fragment},{attributes:['position','uv','seed'],uniforms:['worldViewProjection','time','core','rim'],needAlphaBlending:true});
  mat.backFaceCulling=false;mat.disableDepthWrite=true;mat.alphaMode=Constants.ALPHA_ADD;mat.fogEnabled=false;
  mat.setColor3('core',new Color3(.55,.95,1.1));mat.setColor3('rim',new Color3(.1,.35,.8));mesh.material=mat;mesh.alphaIndex=5;
  // Mist at the feet. Large soft billboards, 14 in all (half on low).
  const mist=canPaint()?createParticles(scene,[{name:'fall-mist',capacity:14,rate:2.2,life:[5,8],size:[5,9],color1:new Color4(.35,.6,1,.22),color2:new Color4(.5,.45,1,.16),speed:[.05,.2],place:o=>{const f=feet[(Math.random()*feet.length)|0];o.set(f.x+(Math.random()-.5)*4,f.y+(Math.random()-.5)*3,f.z+(Math.random()-.5)*4);}}]):null;
  if(mist)onQuality(scene,q=>mist.scale(preset(scene,q).particles));
  let t=0;
  return {update(dt:number){t+=dt;mat.setFloat('time',t);},dispose(){mist?.dispose();mesh.dispose();mat.dispose();}};
}
