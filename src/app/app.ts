import {Engine} from '@babylonjs/core/Engines/engine';
import {createWorldStore} from '../state';
import {createSaveService,RECOVERY_KEY} from '../save';
import {createRuleEngine} from '../rules';
import {allRules,stories,speakerNames,nextHint} from '../narrative';
import {deleteReflections} from '../reflection';
import {MAX_REFLECTION_LENGTH} from '../state/worldStore';
import {createInputService} from '../input';
import {createUiService} from '../ui';
import {runStoryEffect,wavePosition} from '../ui/storyEffects';
import {createWaveService} from '../thought-waves';
import {createAssetService} from '../assets/feature';
import {createWorldFactory} from '../world/feature';
import {createSceneManager} from './sceneManager';
import {createInteraction} from '../interaction/interaction';
import {createTransition} from '../transition/transition';
import {createDebug} from '../debug/debug';
import {strings} from '../content/strings.en';
import {setPresentationQuality,type PresentationQuality} from '../presentation/quality';
import type {Effect,ReflectionPrompt,Signal,SignalType} from '../contracts/state';

/** Text that WP-B1 may add to strings.en.ts. Until then these labels are used. */
const label=(key:string,fallback:string)=>(strings as Record<string,string>)[key]??fallback;

export async function startGame(canvas:HTMLCanvasElement,uiRoot:HTMLElement) {
  const params=new URLSearchParams(location.search);
  const engine=new Engine(canvas,true,{stencil:false,preserveDrawingBuffer:false,adaptToDeviceRatio:false});
  engine.setHardwareScalingLevel(1);
  const store=createWorldStore();const save=createSaveService(store);
  const loaded=save.load();if(loaded)store.update(draft=>Object.assign(draft,loaded));
  const touchRoot=document.createElement('div');document.body.append(touchRoot);
  const waveRoot=document.createElement('div');document.body.append(waveRoot);
  const input=createInputService(canvas,touchRoot);
  const assets=createAssetService(params.get('assets')==='placeholder');
  const debug=createDebug(engine,params.has('debug'));
  let pauseRelease:(()=>void)|undefined;let reflectionRelease:(()=>void)|undefined;
  let frameReady=false;let failed=false;let busyEffects=0;
  let quality:PresentationQuality=params.has('safe')?'low':'medium';
  let storageWarning=false;
  // Open story id and open reflection prompt. Used to route leave, save and skip.
  let storyId:string|null=null;let reflectionPrompt:ReflectionPrompt='money';
  let queue=Promise.resolve();
  const wavesShown:string[]=[];
  function positionToStore() {
    if(!frameReady)return;
    const p=manager.current.player.position();
    store.update(state=>{state.positions[state.world]={x:p.x,y:p.y,z:p.z};});
  }
  async function flushSave() {
    positionToStore();save.request();
    const deadline=performance.now()+1500;
    while(!save.flush() && performance.now()<deadline) await new Promise(resolve=>setTimeout(resolve,60));
    if(!save.flush()&&!storageWarning){storageWarning=true;ui.hint(strings.storageNotice);}
  }
  function closeReflection() {ui.closeReflection();reflectionRelease?.();reflectionRelease=undefined;}
  function storeReflection(prompt:ReflectionPrompt,answer:string|null) {
    if(answer!==null&&answer.length>MAX_REFLECTION_LENGTH)throw new Error('Reflection exceeds limit');
    store.update(draft=>{if(answer===null)delete draft.reflections[prompt];else draft.reflections[prompt]=answer;});
  }
  function finishReflection(answer:string|null) {
    const prompt=reflectionPrompt;storeReflection(prompt,answer);closeReflection();
    dispatch({type:'reflection-done',id:prompt});
    if(prompt==='money')ui.hint(answer===null?strings.skippedHelp:strings.savedHelp);
  }
  const ui=createUiService(uiRoot,{
    saveReflection(text) {finishReflection(text);},
    choose(choiceId) {dispatch({type:'choice',id:choiceId});},
    leaveStory() {const id=storyId;storyId=null;dispatch(id===null?{type:'story-closed'}:{type:'story-closed',id});},
    skipReflection() {finishReflection(null);},
    deleteReflections() {deleteReflections(store);try{localStorage.removeItem(RECOVERY_KEY);}catch{/* The game also works without storage. */}save.request();},
    newGame() {frameReady=false;store.reset();save.clear();location.reload();},
    pause(paused) {if(paused&&!pauseRelease)pauseRelease=input.lock('pause');if(!paused){pauseRelease?.();pauseRelease=undefined;}if(frameReady)manager.current.world.scene.animationsEnabled=!paused;},
  },input);
  ui.loading(true,strings.loading);const bootRelease=input.lock('boot');
  const manager=await createSceneManager(engine,assets,createWorldFactory(),store,scene=>{
    const layer=document.createElement('div');layer.dataset.scene=String(scene.uniqueId);waveRoot.append(layer);
    return createWaveService(scene,layer);
  });
  // One hint source for scene changes, reload and every rule run.
  const hintFor=()=>nextHint(store.get(),store.get().world);
  const interaction=createInteraction(ui,signal=>dispatch(signal));
  const transition=createTransition({
    lock:()=>input.lock('transition'),veil:on=>ui.loading(on,strings.loading),save:flushSave,
    async prepare(id) {frameReady=false;await manager.activate(id);setPresentationQuality(manager.current.world.scene,quality);},
    switch(id) {store.update(state=>{state.world=id;});interaction.reset();ui.world(id==='outer'?strings.outer:strings.inner);},
    activated(id) {frameReady=true;save.request();if(id==='inner')dispatch('inner-active');ui.hint(hintFor());},
    reset:()=>interaction.reset()
  });
  function onEffect(effect:Effect) {
    // Facts, traits and counters are applied by the rule engine.
    if(effect.kind==='fact'||effect.kind==='trait'||effect.kind==='counter')return;
    busyEffects++;
    queue=queue.then(async()=>{
      if(effect.kind==='save') await flushSave();
      if(effect.kind==='transition') await transition.go(effect.world);
      if(effect.kind==='panel') {
        reflectionPrompt=effect.prompt??'money';reflectionRelease??=input.lock('reflection');
        ui.reflection(store.get().reflections[reflectionPrompt]??'',reflectionPrompt==='enough'?label('enoughQuestion','What is enough for you?'):undefined);
      }
      if(!(effect.kind==='story'&&reflectionRelease))runStoryEffect(effect,{ui,world:manager.current.world,stories,names:speakerNames,leave:label('leave','Leave'),opened:id=>{storyId=id;}});
      if(effect.kind==='wave') {
        // The rule fact and fired rule are saved before any thought is shown.
        await flushSave();
        const at=wavePosition(manager.current.world,effect.actor,manager.current.player.position());
        if(manager.current.waves.show(effect.id,effect.text,at,effect.tone))wavesShown.push(effect.id);
      }
      if(effect.kind==='hint')ui.hint(effect.text);
    }).catch(error=>{failed=true;console.error(error);ui.loading(true,strings.bootError);}).finally(()=>busyEffects--);
  }
  const rules=createRuleEngine(store,allRules,onEffect);
  function dispatch(signal:Signal|SignalType) {rules.dispatch(typeof signal==='string'?{type:signal}:signal);ui.hint(hintFor());}
  await manager.activate(store.get().world);frameReady=true;
  setPresentationQuality(manager.current.world.scene,quality);
  const qualityControl=document.createElement('select');qualityControl.setAttribute('aria-label',strings.quality);
  qualityControl.style.cssText='pointer-events:auto;min-height:48px;max-width:110px;color:#fff7e8;background:#182727b8;border:1px solid #fff5d650;border-radius:10px;padding:8px;font:inherit';
  for(const [value,label] of [['low',strings.simple],['medium',strings.full],['high',strings.high]]) {const option=document.createElement('option');option.value=value;option.textContent=label;qualityControl.append(option);}
  qualityControl.value=quality;
  qualityControl.addEventListener('change',()=>{quality=qualityControl.value as PresentationQuality;engine.setHardwareScalingLevel(quality==='low'?1.3:1);for(const entry of manager.entries.values())setPresentationQuality(entry.world.scene,quality);});
  uiRoot.querySelector('.lw-top')?.insertBefore(qualityControl,uiRoot.querySelector('.lw-top button'));
  if(store.get().world==='inner')dispatch('inner-active');
  ui.world(store.get().world==='outer'?strings.outer:strings.inner);
  ui.hint(hintFor());
  ui.loading(false);bootRelease();
  let saveClock=0;
  engine.runRenderLoop(()=>{
    if(!frameReady||failed)return;
    const dt=Math.min(engine.getDeltaTime()/1000,.05);
    const current=manager.current;const frame=input.read();
    for(const layer of waveRoot.children) if(layer instanceof HTMLElement)layer.hidden=layer.dataset.scene!==String(current.world.scene.uniqueId);
    if(!pauseRelease) {
      current.player.update(frame,current.camera.yaw,dt);
      current.camera.update(frame,current.player.position());
      const state=store.get();
      current.world.update(state,dt,current.player.position());
      current.carry.setEnabled(state.world==='outer'&&state.facts.includes('PACKAGE_RECEIVED'));
      current.chainLoose.setEnabled(state.world==='outer'&&state.facts.includes('PACKAGE_RECEIVED')&&!state.facts.includes('ATTACHMENT_TRIGGERED'));
      current.chainTense.setEnabled(state.world==='outer'&&state.facts.includes('PACKAGE_RECEIVED')&&state.facts.includes('ATTACHMENT_TRIGGERED'));
      if(!transition.busy&&!reflectionRelease&&storyId===null&&!busyEffects)interaction.update(state.world,state,current.player.position().x,current.player.position().z,frame,dt);
      current.waves.update(dt,current.player.position());
      saveClock+=dt;if(saveClock>1){saveClock=0;positionToStore();save.request();}
    }
    current.world.scene.render();debug.update(current.world.scene,dt);
  });
  const resize=()=>engine.resize();window.addEventListener('resize',resize);
  const pagehide=()=>{if(frameReady){positionToStore();save.request();save.flush();}};window.addEventListener('pagehide',pagehide,true);
  if(import.meta.env.DEV && (params.has('test')||params.has('debug'))) {
    const read=()=>{
      const current=manager.current;const p=current.player.position();
      return {ready:frameReady,busy:transition.busy||busyEffects>0,paused:Boolean(pauseRelease),world:store.get().world,
        position:{x:p.x,y:p.y,z:p.z},state:JSON.parse(JSON.stringify(store.get())),
        camera:{yaw:current.camera.yaw,pitch:current.camera.pitch,distance:current.camera.distance,position:current.camera.camera.position.asArray()},
        stats:debug.read(current.world.scene),waves:current.waves.count(),wavesShown:[...wavesShown],
        beetle:current.world.beetle?.isEnabled()??false,
        animation:{groups:current.world.scene.animationGroups.map(g=>({name:g.name,playing:g.isPlaying}))},
        transitions:[...transition.logs],crossings:{...interaction.crossings},assets:assets.status()};
    };
    Object.defineProperty(window,'__lw',{value:{read},configurable:true});
  }
  if(params.has('viewer')) {
    const panel=document.createElement('div');panel.id='asset-viewer';panel.style.cssText='position:fixed;inset:90px 16px auto;max-height:50vh;overflow:auto;background:#142522ee;color:#fff;padding:16px;z-index:5;font:12px monospace';
    panel.textContent=assets.status().map(asset=>{
      const nodes=[...manager.entries.values()].flatMap(entry=>entry.world.scene.transformNodes).filter(node=>node.metadata?.assetId===asset.id);
      const missingNodes=[...new Set(nodes.flatMap(node=>node.metadata?.missingNodes??[]))];
      const missingClips=[...new Set(nodes.flatMap(node=>node.metadata?.missingClips??[]))];
      return `${asset.id}: ${asset.status} ${asset.file??'code placeholder'}\n  Missing nodes: ${missingNodes.join(', ')||'none found'}; missing clips: ${missingClips.join(', ')||'none found'}; instances: ${nodes.length}`;
    }).join('\n');panel.style.whiteSpace='pre-wrap';document.body.append(panel);
  }
  return {dispose(){engine.stopRenderLoop();window.removeEventListener('resize',resize);window.removeEventListener('pagehide',pagehide,true);save.dispose();input.dispose();ui.dispose();debug.dispose();manager.dispose();engine.dispose();}};
}
