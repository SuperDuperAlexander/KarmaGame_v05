import type {Scene} from '@babylonjs/core/scene';
import type {Mesh} from '@babylonjs/core/Meshes/mesh';
import type {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight';
import {DirectionalLight} from '@babylonjs/core/Lights/directionalLight';
import {ShadowGenerator} from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';
import {ImageProcessingConfiguration} from '@babylonjs/core/Materials/imageProcessingConfiguration';
import {ColorCurves} from '@babylonjs/core/Materials/colorCurves';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {Color3,Color4} from '@babylonjs/core/Maths/math.color';
import type {WorldId,WorldState} from '../contracts/state';
import {canPaint} from './paint';
import {createSky} from './sky';
import {createParticles} from './particles';
import {onQuality,preset} from './quality';
import {treeMood} from './treeMood';
import {createGlow} from './glow';
import {characterLook} from './characterLook';

const c3=(r:number,g:number,b:number)=>new Color3(r,g,b);
const c4=(r:number,g:number,b:number,a:number)=>new Color4(r,g,b,a);
/** Names of the nodes that cast shadows: player, people, tree, gate. Meshes are capped at 12 in all. */
const CASTERS:[string,RegExp][]=[['player.entity',/^Player-/],['central-tree',/leaves_(left_02|right_02|center)|trunk|branches_(left|right)/],['CityGate.gate',/./],['merchant',/./],['citizen-a',/./],['citizen-b',/./]];
const MAX_CASTERS=12;

/**
 * One sun and one hemispheric light (spec 15.2: one main light). Warm and low outside, cool and moonlike inside.
 * The hemispheric ground colour lights the roots from below. Sky dome, fog, image processing, one shadow map
 * and the mood particles live here. Look comes from state only (AD-9).
 */
export function atmosphere(scene:Scene,world:WorldId){
  const inner=world==='inner';
  // Outer: golden hour, a warm haze at the horizon. Inner: deep blue-violet.
  const horizon=inner?c3(.08,.17,.36):c3(.93,.76,.55);const fog=horizon;
  scene.clearColor=new Color4(horizon.r,horizon.g,horizon.b,1);
  scene.fogMode=3;scene.fogStart=inner?26:48;scene.fogEnd=inner?110:160;scene.fogColor=fog;
  const sunDir=inner?new Vector3(-.3,-1,.4):new Vector3(.66,-.4,.52);
  const sky=new HemisphericLight('sky',new Vector3(0,1,0),scene);
  // The sky light is the soft blue shadow fill outside and the blue-violet ambient inside. The ground colour is warm bounce outside.
  sky.intensity=inner?1:.66;sky.diffuse=inner?c3(.52,.66,1):c3(.66,.78,1);sky.groundColor=inner?c3(.25,.55,.85):c3(.62,.46,.32);
  const sun=new DirectionalLight('sun',sunDir,scene);
  sun.intensity=inner?.6:1.2;sun.diffuse=inner?c3(.66,.74,1):c3(1,.8,.52);sun.specular=Color3.Black();
  const dome=createSky(scene,inner
    ?{top:c3(.02,.03,.12),horizon,bottom:c3(.04,.08,.2),sun:c3(.3,.4,.8),sunDir,sunPower:60}
    :{top:c3(.24,.44,.8),horizon:c3(.99,.8,.56),bottom:c3(.8,.66,.5),sun:c3(1,.62,.28),sunDir,sunPower:70});
  // Image processing: ACES, a small lift in contrast and colour, a light vignette.
  const ipc=scene.imageProcessingConfiguration;// Colour grade: warm highlights, cool lifted shadows (no crushed blacks), more saturation.
  const curves=new ColorCurves();curves.globalSaturation=inner?18:30;
  if(inner){curves.shadowsHue=250;curves.shadowsDensity=22;curves.highlightsHue=45;curves.highlightsDensity=14;}
  else{curves.shadowsHue=225;curves.shadowsDensity=28;curves.highlightsHue=38;curves.highlightsDensity=26;}
  ipc.colorCurves=curves;ipc.toneMappingType=ImageProcessingConfiguration.TONEMAPPING_ACES;
  ipc.vignetteColor=inner?new Color4(.02,.02,.1,0):new Color4(.16,.07,.02,0);ipc.vignetteWeight=inner?1.3:.8;ipc.vignetteStretch=0;ipc.vignetteCameraFov=1.1;
  // One shadow map. The light follows the player. Only ground receives.
  let shadow:ShadowGenerator|null=null;let shadowSize=0;const casting:Mesh[]=[];const found=new Set<string>();
  sun.autoUpdateExtends=false;sun.shadowFrustumSize=inner?30:44;sun.shadowMinZ=1;sun.shadowMaxZ=90;
  function setShadow(size:number){
    if(size===shadowSize)return;shadowSize=size;
    if(shadow){shadow.dispose();shadow=null;}
    if(!size){sun.shadowEnabled=false;return;}
    sun.shadowEnabled=true;shadow=new ShadowGenerator(size,sun);shadow.bias=.0015;shadow.normalBias=.02;shadow.setDarkness(inner?.4:.3);
    shadow.usePercentageCloserFiltering=true;shadow.filteringQuality=ShadowGenerator.QUALITY_LOW;
    for(const m of casting)shadow.addShadowCaster(m);
  }
  function gather(){
    for(const [name,only] of CASTERS){
      if(found.has(name))continue;const node=scene.getTransformNodeByName(name) as TransformNode|null;if(!node)continue;
      const meshes=node.getChildMeshes(false).filter(m=>m.isEnabled()&&m.isVisible&&m.getTotalVertices()>0&&only.test(m.name)) as Mesh[];if(!meshes.length)continue;found.add(name);
      for(const m of meshes){if(casting.length>=MAX_CASTERS)break;casting.push(m);shadow?.addShadowCaster(m);}
    }
  }
  // Mood particles. The pollen and the specks follow the player, so they are always in view. Capacity in all: 190 (max 250).
  const focus=new Vector3(0,0,inner?-7:-30);
  const near=(o:Vector3,r:number,h:number)=>o.set(focus.x+(Math.random()-.5)*r*2,.3+Math.random()*h,focus.z+(Math.random()-.5)*r*2);
  const particles=canPaint()?createParticles(scene,inner
    ?[{name:'specks',capacity:60,rate:8,life:[4,7],size:[.05,.12],color1:c4(.7,.85,1,.7),color2:c4(.8,.6,1,.5),speed:[.02,.07],place:o=>near(o,11,4.5)},
      {name:'motes',capacity:90,rate:11,life:[6,10],size:[.08,.2],color1:c4(.45,.8,1,.75),color2:c4(.6,.5,1,.55),speed:[.02,.08],place:o=>o.set((Math.random()-.5)*26,.4+Math.random()*7,(Math.random()-.5)*26)},
      {name:'gold',capacity:40,rate:6,life:[5,8],size:[.08,.18],color1:c4(1,.75,.25,.85),color2:c4(1,.55,.15,.6),speed:[.02,.08],place:o=>o.set(2+Math.random()*7,.5+Math.random()*4.5,-3+Math.random()*7)}]
    :[{name:'pollen',capacity:80,rate:9,life:[5,9],size:[.05,.12],color1:c4(1,.9,.55,.7),color2:c4(1,.75,.4,.5),speed:[.02,.1],gravity:new Vector3(0,.01,0),place:o=>near(o,13,4.5)},
      {name:'motes',capacity:60,rate:6,life:[6,9],size:[.06,.14],color1:c4(1,.9,.6,.6),color2:c4(1,.8,.45,.4),speed:[.02,.1],place:o=>o.set((Math.random()-.5)*34,.6+Math.random()*5,-14+(Math.random()-.5)*26)},
      {name:'crown',capacity:50,rate:7,life:[5,8],size:[.1,.22],color1:c4(1,.85,.4,.85),color2:c4(.85,.95,.4,.6),speed:[.05,.2],gravity:new Vector3(0,-.12,0),place:o=>o.set((Math.random()-.5)*7,8+Math.random()*4,2.2+(Math.random()-.5)*7)}]):null;
  const mood=inner?null:treeMood(scene);
  const glow=createGlow(scene);
  const look=characterLook(scene,inner?c3(.45,.8,1):c3(1,.84,.64),inner?.34:.24);
  let discovered:boolean|null=null;
  onQuality(scene,q=>{
    const p=preset(scene,q);setShadow(p.shadow);ipc.isEnabled=p.imageProcessing;ipc.toneMappingEnabled=p.imageProcessing;ipc.vignetteEnabled=p.imageProcessing;ipc.colorCurvesEnabled=p.imageProcessing;
    ipc.exposure=p.imageProcessing?(inner?1.7:1.4):1;ipc.contrast=p.imageProcessing?1.15:1;glow.set(p.glow);particles?.scale(p.particles);
  });
  // Inner rocks and platforms get a faint cool self light from their own texture. They read as blue stone, not black holes.
  let fillWait=0;let filled=0;
  function coolFill(){
    const seen=new Set<unknown>();
    for(const m of scene.meshes){
      if(!/^(Rock|InnerPlatform)-/.test(m.name))continue;const mat=(m as Mesh).material as unknown as {albedoTexture?:unknown;emissiveTexture?:unknown;emissiveColor?:Color3}|null;
      if(!mat||seen.has(mat))continue;seen.add(mat);if(mat.albedoTexture&&!mat.emissiveTexture)mat.emissiveTexture=mat.albedoTexture;mat.emissiveColor=c3(.28,.46,.66);
    }
    filled=seen.size;
  }
  let player:TransformNode|null=null;
  return {
    update(state:Readonly<WorldState>){
      const tension=Math.min(1,state.traits.attachment);const dt=scene.getEngine().getDeltaTime()/1000;
      sun.diffuse=inner?c3(.64+tension*.2,.74,1-tension*.12):c3(1,.8-tension*.04,.52-tension*.04);
      if(shadow&&casting.length<MAX_CASTERS)gather();
      if(inner&&!filled&&fillWait--<=0){fillWait=60;coolFill();}
      if(!player)player=scene.getTransformNodeByName('player.entity') as TransformNode|null;
      if(player)focus.copyFrom(player.getAbsolutePosition());
      glow.update(dt);look.update(dt);
      if(player&&shadowSize){const p=player.getAbsolutePosition();sun.position.set(p.x-sunDir.x*35,p.y-sunDir.y*35,p.z-sunDir.z*35);}
      const now=state.facts.includes('TREE_DISCOVERED');
      if(discovered!==null&&now&&!discovered){mood?.pulse();particles?.burst(inner?'gold':'crown',24);}
      discovered=now;
      mood?.update(dt,tension,now);
      particles?.level(inner?'gold':'crown',inner?.25+tension*.75:(now?.6:.3)+tension*.4);
    },
    dispose(){glow.dispose();particles?.dispose();dome?.dispose();shadow?.dispose();sky.dispose();sun.dispose();}
  };
}
