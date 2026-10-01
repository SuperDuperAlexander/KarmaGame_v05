import type {Scene} from '@babylonjs/core/scene';
export type PresentationQuality='low'|'medium'|'high';
// Keep the game and collisions unchanged when the visual setting changes.
export function setPresentationQuality(scene:Scene,quality:PresentationQuality):void{
  scene.metadata={...scene.metadata,presentationQuality:quality};
  scene.getTransformNodeByName('source-light-particles')?.setEnabled(quality!=='low');
}
