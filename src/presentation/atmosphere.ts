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
  const horizon=inner?c3(.07,.19,.3):c3(.86,.8,.66);const fog=horizon;
  scene.clearColor=new Color4(horizon.r,horizon.g,horizon.b,1);
  scene.fogMode=3;scene.fogStart=inner?18:60;scene.fogEnd=inner?85:170;scene.fogColor=fog;
  const sunDir=inner?new Vector3(-.3,-1,.4):new Vector3(.62,-.5,.5);
  const sky=new HemisphericLight('sky',new Vector3(0,1,0),scene);
  sky.intensity=inner?1:.6;sky.diffuse=inner?c3(.55,.75,1):c3(.78,.86,1);sky.groundColor=inner?c3(.3,.75,.95):c3(.55,.44,.32);
  const sun=new DirectionalLight('sun',sunDir,scene);
  sun.intensity=inner?.6:1.05;sun.diffuse=inner?c3(.67,.8,1):c3(1,.84,.6);sun.specular=Color3.Black();
  const dome=createSky(scene,inner
    ?{top:c3(.015,.04,.1),horizon:c3(.07,.19,.3),bottom:c3(.03,.1,.17),sun:c3(.2,.4,.7),sunDir,sunPower:60}
    :{top:c3(.28,.5,.82),horizon:c3(.96,.86,.68),bottom:c3(.74,.7,.58),sun:c3(1,.7,.35),sunDir,sunPower:90});
  // Image processing: ACES, a small lift in contrast and colour, a light vignette.
  const ipc=scene.imageProcessingConfiguration;const curves=new ColorCurves();curves.globalSaturation=inner?14:22;
  ipc.colorCurves=curves;ipc.toneMappingType=ImageProcessingConfiguration.TONEMAPPING_ACES;
  ipc.vignetteColor=inner?new Color4(0,.02,.06,0):new Color4(.12,.06,.02,0);ipc.vignetteWeight=inner?1.4:.9;ipc.vignetteStretch=0;ipc.vignetteCameraFov=1.1;
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
  const particles=canPaint()?createParticles(scene,inner
    ?[{name:'motes',capacity:90,rate:11,life:[6,10],size:[.08,.2],color1:c4(.45,.8,1,.75),color2:c4(.6,.5,1,.55),speed:[.02,.08],place:o=>o.set((Math.random()-.5)*26,.4+Math.random()*7,(Math.random()-.5)*26)},
      {name:'gold',capacity:40,rate:6,life:[5,8],size:[.08,.18],color1:c4(1,.75,.25,.85),color2:c4(1,.55,.15,.6),speed:[.02,.08],place:o=>o.set(2+Math.random()*7,.5+Math.random()*4.5,-3+Math.random()*7)}]
    :[{name:'motes',capacity:70,rate:9,life:[6,9],size:[.06,.14],color1:c4(1,.9,.6,.6),color2:c4(1,.8,.45,.4),speed:[.02,.1],place:o=>o.set((Math.random()-.5)*34,.6+Math.random()*5,-14+(Math.random()-.5)*26)},
      {name:'crown',capacity:50,rate:7,life:[5,8],size:[.1,.22],color1:c4(1,.85,.4,.85),color2:c4(.85,.95,.4,.6),speed:[.05,.2],gravity:new Vector3(0,-.12,0),place:o=>o.set((Math.random()-.5)*7,8+Math.random()*4,2.2+(Math.random()-.5)*7)}]):null;
  const mood=inner?null:treeMood(scene);
  let discovered:boolean|null=null;
  onQuality(scene,q=>{
    const p=preset(scene,q);setShadow(p.shadow);ipc.isEnabled=p.imageProcessing;ipc.toneMappingEnabled=p.imageProcessing;ipc.vignetteEnabled=p.imageProcessing;ipc.colorCurvesEnabled=p.imageProcessing;
    ipc.exposure=p.imageProcessing?(inner?1.7:1.3):1;ipc.contrast=p.imageProcessing?1.1:1;particles?.scale(p.particles);
  });
  // Inner rocks and platforms get a faint cool self light from their own texture. They read as blue stone, not black holes.
  let fillWait=0;let filled=0;
  function coolFill(){
    const seen=new Set<unknown>();
    for(const m of scene.meshes){
      if(!/^(Rock|InnerPlatform)-/.test(m.name))continue;const mat=(m as Mesh).material as unknown as {albedoTexture?:unknown;emissiveTexture?:unknown;emissiveColor?:Color3}|null;
      if(!mat||seen.has(mat))continue;seen.add(mat);if(mat.albedoTexture&&!mat.emissiveTexture)mat.emissiveTexture=mat.albedoTexture;mat.emissiveColor=c3(.2,.36,.52);
    }
    filled=seen.size;
  }
  let player:TransformNode|null=null;
  return {
    update(state:Readonly<WorldState>){
      const tension=Math.min(1,state.traits.attachment);const dt=scene.getEngine().getDeltaTime()/1000;
      sun.diffuse=inner?c3(.65+tension*.2,.8,1-tension*.12):c3(1,.84-tension*.04,.6-tension*.04);
      if(shadow&&casting.length<MAX_CASTERS)gather();
      if(inner&&!filled&&fillWait--<=0){fillWait=60;coolFill();}
      if(!player)player=scene.getTransformNodeByName('player.entity') as TransformNode|null;
      if(player&&shadowSize){const p=player.getAbsolutePosition();sun.position.set(p.x-sunDir.x*35,p.y-sunDir.y*35,p.z-sunDir.z*35);}
      const now=state.facts.includes('TREE_DISCOVERED');
      if(discovered!==null&&now&&!discovered){mood?.pulse();particles?.burst(inner?'gold':'crown',24);}
      discovered=now;
      mood?.update(dt,tension,now);
      particles?.level(inner?'gold':'crown',inner?.25+tension*.75:(now?.6:.3)+tension*.4);
    },
    dispose(){particles?.dispose();dome?.dispose();shadow?.dispose();sky.dispose();sun.dispose();}
  };
}
