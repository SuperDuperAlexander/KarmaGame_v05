import {Scene} from '@babylonjs/core/scene';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import type {Engine} from '@babylonjs/core/Engines/engine';
import type {AssetService,WorldFactory,WorldView,WaveService} from '../contracts/visual';
import type {WorldId,WorldStore} from '../contracts/state';
import {createCharacterMotor} from '../player/characterMotor';
import {createFollowCamera} from '../camera/followCamera';
export async function createSceneManager(engine:Engine,assets:AssetService,factory:WorldFactory,store:WorldStore,makeWaves:(scene:Scene)=>WaveService) {
  type Entry={world:WorldView;player:ReturnType<typeof createCharacterMotor>;camera:ReturnType<typeof createFollowCamera>;waves:WaveService;carry:TransformNode};
  const entries=new Map<WorldId,Entry>();
  let current:Entry;
  async function get(id:WorldId) {
    const cached=entries.get(id);if(cached)return cached;
    const scene=new Scene(engine);scene.collisionsEnabled=true;
    const world=await factory.create(id,scene,assets);
    const root=new TransformNode('player.entity',scene);
    const visual=await assets.create('Player',scene,root);
    const saved=store.get().positions[id];
    const spawn=new Vector3(saved.x,saved.y,saved.z);
    const player=createCharacterMotor(scene,root,visual,spawn,id==='inner'?-12:-10);
    const camera=createFollowCamera(scene);
    const waves=makeWaves(scene);
    const socket=visual.socket('socket.handR');
    const carry=(await assets.create('FinancePackage',scene,socket??root)).root;
    carry.position.copyFromFloats(socket?0:.5,socket?-.10:1.0,socket?.15:.1);
    carry.scaling.scaleInPlace(.85);
    const entry={world,player,camera,waves,carry};entries.set(id,entry);return entry;
  }
  return {
    get current(){return current;},get entries(){return entries;},
    async activate(id:WorldId) {
      if(current) current.world.scene.animatables.forEach(a=>a.pause());
      current=await get(id);
      current.world.scene.animatables.forEach(a=>a.restart());
      for(const entry of entries.values()) if(entry!==current) entry.waves.update(100,entry.player.position());
      return current;
    },
    dispose(){for(const entry of entries.values()) {entry.waves.dispose();entry.player.dispose();entry.world.dispose();}entries.clear();}
  };
}
