import type {Scene} from '@babylonjs/core/scene';
export type PresentationQuality='low'|'medium'|'high';
export interface QualityPreset {
  /** Shadow map size. 0 is off. */
  shadow:number;
  /** Tone mapping, contrast, saturation and vignette. */
  imageProcessing:boolean;
  /** Share of the particles that stay alive. */
  particles:number;
}
const WIDE=(scene:Scene)=>scene.getEngine().getRenderWidth()>800;
/** Presets. Low is the Simple mode and ?safe: no shadow, no image processing, half the particles. */
export function preset(scene:Scene,quality:PresentationQuality):QualityPreset{
  if(quality==='low')return {shadow:0,imageProcessing:false,particles:.5};
  if(quality==='medium')return {shadow:WIDE(scene)?1024:512,imageProcessing:true,particles:1};
  return {shadow:1024,imageProcessing:true,particles:1};
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
