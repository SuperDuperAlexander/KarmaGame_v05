import type {Scene} from '@babylonjs/core/scene';
import {ShaderMaterial} from '@babylonjs/core/Materials/shaderMaterial';
import {CreateSphere} from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import type {Color3} from '@babylonjs/core/Maths/math.color';
import {canPaint,skyClouds} from './paint';

export interface SkyColors {top:Color3;horizon:Color3;bottom:Color3;sun:Color3;sunDir:Vector3;sunPower:number}
const vertex='precision highp float; attribute vec3 position; uniform mat4 worldViewProjection; varying vec3 vDir; void main(){ vDir=position; gl_Position=worldViewProjection*vec4(position,1.0); }';
const fragment=`precision highp float; varying vec3 vDir; uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; uniform vec3 sun; uniform vec3 sunDir; uniform float sunPower;
void main(){ vec3 d=normalize(vDir); float h=d.y;
  vec3 c=h>0.0?mix(horizon,top,pow(clamp(h*1.6,0.0,1.0),0.6)):mix(horizon,bottom,clamp(-h*4.0,0.0,1.0));
  float s=max(dot(d,normalize(-sunDir)),0.0); c+=sun*(pow(s,sunPower)*0.55+pow(s,6.0)*0.12);
  gl_FragColor=vec4(c,1.0); }`;
/**
 * Painted outer sky: golden horizon band, blue zenith, soft clouds from one small code texture (WP-40).
 * The outer sky is the one with a bright horizon. It is still one dome and one draw call.
 */
const painted=`precision highp float; varying vec3 vDir; uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; uniform vec3 sun; uniform vec3 sunDir; uniform float sunPower; uniform sampler2D clouds;
void main(){ vec3 d=normalize(vDir); float h=d.y;
  vec3 gold=vec3(1.0,0.74,0.42); vec3 mid=vec3(0.52,0.68,0.92); vec3 c;
  if(h>0.0){ c=mix(gold,mid,smoothstep(0.0,0.32,h)); c=mix(c,top,smoothstep(0.2,0.9,h)); }
  else c=mix(horizon,bottom,clamp(-h*4.0,0.0,1.0));
  float s=max(dot(d,normalize(-sunDir)),0.0);
  c+=sun*(pow(s,sunPower)*0.55+pow(s,5.0)*0.22)+vec3(0.5,0.2,0.04)*pow(s,2.2)*0.4*(1.0-smoothstep(0.0,0.6,h));
  vec2 uv=vec2(atan(d.z,d.x)*0.159155+0.5,clamp(h/0.62,0.0,1.0));
  vec4 cl=texture2D(clouds,uv,-8.0); float fade=(1.0-smoothstep(0.7,1.0,h/0.62))*smoothstep(0.0,0.02,h);
  c=mix(c,cl.rgb,cl.a*fade);
  gl_FragColor=vec4(c,1.0); }`;
/** One cheap gradient dome that follows the camera. One draw call. The outer sky reads one small painted cloud texture. */
export function createSky(scene:Scene,colors:SkyColors){
  const paint=colors.horizon.r>.5&&canPaint();
  const mat=new ShaderMaterial('sky-dome',scene,{vertexSource:vertex,fragmentSource:paint?painted:fragment},{attributes:['position'],uniforms:['worldViewProjection','top','horizon','bottom','sun','sunDir','sunPower'],samplers:paint?['clouds']:[]});
  mat.setColor3('top',colors.top);mat.setColor3('horizon',colors.horizon);mat.setColor3('bottom',colors.bottom);mat.setColor3('sun',colors.sun);
  mat.setVector3('sunDir',colors.sunDir);mat.setFloat('sunPower',colors.sunPower);
  if(paint)mat.setTexture('clouds',skyClouds(scene));
  mat.backFaceCulling=false;mat.disableDepthWrite=true;mat.fogEnabled=false;
  const dome=CreateSphere('sky-dome',{diameter:300,segments:12},scene);dome.material=mat;dome.infiniteDistance=true;dome.isPickable=false;
  dome.alwaysSelectAsActiveMesh=true;dome.renderingGroupId=0;dome.position=Vector3.Zero();
  return {dome,mat,dispose(){dome.dispose();mat.dispose();}};
}
