import {SceneInstrumentation} from '@babylonjs/core/Instrumentation/sceneInstrumentation';
import type {Engine} from '@babylonjs/core/Engines/engine';
import type {Scene} from '@babylonjs/core/scene';
export function sceneStats(engine:Engine,scene:Scene,instrumentation:SceneInstrumentation) {
  const active=scene.getActiveMeshes();let triangles=0;
  // Count the level that is drawn. A far level can be a simpler mesh or nothing.
  const camera=scene.activeCamera;
  for(let i=0;i<active.length;i++){const m=active.data[i];const source=(m as {sourceMesh?:typeof m}).sourceMesh??m;const drawn=camera&&'getLOD' in source?(source as unknown as {getLOD(c:typeof camera,s:unknown):typeof m|null}).getLOD(camera,m.getBoundingInfo().boundingSphere):m;if(drawn)triangles+=drawn.getTotalIndices()/3;}
  return {fps:engine.getFps(),drawCalls:instrumentation.drawCallsCounter.current,meshes:active.length,triangles,textures:scene.textures.length,gpu:String(engine.getGlInfo().renderer)};
}
export function createDebug(engine:Engine,enabled:boolean) {
  const stats=new Map<Scene,SceneInstrumentation>();
  const panel=enabled?document.createElement('pre'):null;
  if(panel) {panel.id='debug';panel.style.cssText='position:fixed;right:12px;top:80px;color:#fff;background:#10201bd9;padding:10px;font-size:11px;pointer-events:none;z-index:8;max-width:200px;white-space:pre-wrap';document.body.append(panel);}
  let time=0;
  function read(scene:Scene) {
    let meter=stats.get(scene);
    if(!meter) {meter=new SceneInstrumentation(scene);stats.set(scene,meter);}
    return sceneStats(engine,scene,meter);
  }
  return {read,update(scene:Scene,dt:number){time+=dt;if(panel&&time>.35) {time=0;const s=read(scene);panel.textContent=`FPS [frames per second]: ${s.fps.toFixed(0)}\nDraw calls: ${s.drawCalls}\nMeshes: ${s.meshes}\nTriangles: ${Math.round(s.triangles)}\nTextures: ${s.textures}\nGPU [graphics processor]: ${s.gpu}`;}},dispose(){panel?.remove();for(const meter of stats.values())meter.dispose();}};
}
