import type {Scene} from '@babylonjs/core/scene';
export type PresentationQuality='low'|'medium'|'high';
export interface QualityPreset {
  /** Shadow map size. 0 is off. */
  shadow:number;
  /** Tone mapping, contrast, saturation and vignette. */
  imageProcessing:boolean;
  /** Share of the particles that stay alive. */
  particles:number;
  /** Glow layer. Null is off. */
  glow:GlowPreset|null;
}
/** Texture size as a share of the screen, blur width and strength of the glow layer. */
export interface GlowPreset {ratio:number;kernel:number;intensity:number}
const PHONE=(scene:Scene)=>scene.getEngine().getRenderWidth()<=800;
const WIDE=(scene:Scene)=>scene.getEngine().getRenderWidth()>800;
/** Presets. Low is the Simple mode and ?safe: no shadow, no image processing, no glow, half the particles.
 *  Medium is the default, also on touch: small glow. High: full glow. */
export function preset(scene:Scene,quality:PresentationQuality):QualityPreset{
  if(quality==='low')return {shadow:0,imageProcessing:false,particles:.5,glow:null};
  if(quality==='medium')return {shadow:WIDE(scene)?1024:512,imageProcessing:true,particles:1,glow:PHONE(scene)?{ratio:.25,kernel:16,intensity:.45}:{ratio:.35,kernel:24,intensity:.5}};
  return {shadow:1024,imageProcessing:true,particles:1,glow:{ratio:.5,kernel:32,intensity:.65}};
}
const handlers=new WeakMap<Scene,Set<(q:PresentationQuality)=>void>>();
const current=new WeakMap<Scene,PresentationQuality>();
/** A presentation part (light, water, particles) asks to hear about quality changes. It is called once at once. */
export function onQuality(scene:Scene,handler:(q:PresentationQuality)=>void):void{
  let set=handlers.get(scene);if(!set){set=new Set();handlers.set(scene,set);}set.add(handler);
  handler(current.get(scene)??'medium');
}
// Keep the game and collisions unchanged when the visual setting changes.
export function setPresentationQuality(scene:Scene,quality:PresentationQuality):void{
  current.set(scene,quality);scene.metadata={...scene.metadata,presentationQuality:quality};
  for(const handler of handlers.get(scene)??[])handler(quality);
}
