import type {Scene} from '@babylonjs/core/scene';
import {ShaderMaterial} from '@babylonjs/core/Materials/shaderMaterial';
import {CreateGround} from '@babylonjs/core/Meshes/Builders/groundBuilder';
import {CreateSphere} from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {material} from '../assets/placeholders';
export function sourceWater(scene:Scene,inner:boolean){
  const vertex='precision highp float; attribute vec3 position; attribute vec2 uv; uniform mat4 worldViewProjection; varying vec2 vUV; void main(){ vUV=uv; gl_Position=worldViewProjection*vec4(position,1.0); }';
  const fragment='precision highp float; varying vec2 vUV; uniform float time; uniform float tension; void main(){ float w=sin(vUV.y*45.0-time*1.4+sin(vUV.x*24.0+time)*0.8); float light=pow(max(0.0,w),12.0)*0.16; vec3 c=mix(vec3(0.07,0.31,0.39),vec3(0.22,0.56,0.62),vUV.x); gl_FragColor=vec4(c+light+vec3(tension*0.04,0.0,0.0),1.0); }';
  const shader=new ShaderMaterial('source-water',scene,{vertexSource:vertex,fragmentSource:fragment},{attributes:['position','uv'],uniforms:['worldViewProjection','time','tension']});
  const water=CreateGround('SourceWater',{width:inner?1.6:1.15,height:inner?15:8,subdivisions:1},scene);water.position.set(inner?-2.5:-3,.014,inner?0:1);water.material=shader;water.isPickable=false;
  const specks=new TransformNode('source-light-particles',scene);const dots:Mesh[]=[];
  for(let i=0;i<(inner?30:16);i++){const p=CreateSphere('light-speck',{diameter:.035,segments:3},scene);p.position.set((i%5)*.23-.5, .2+(i%7)*.18,(i*1.7)%11-5);dots.push(p);}
  const joined=Mesh.MergeMeshes(dots,true,true,undefined,false,false);if(joined){joined.parent=specks;joined.material=material(scene,'#8DD9DE',.7);joined.isPickable=false;}specks.position.copyFrom(water.position);
  let time=0;return {update(dt:number,tension:number){time+=dt;shader.setFloat('time',time);shader.setFloat('tension',tension);specks.rotation.y=Math.sin(time*.08)*.05;},dispose(){water.dispose();specks.dispose();shader.dispose();}};
}
