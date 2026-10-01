import {
  AnimationGroup, Color3, Color4, DirectionalLight, Engine, FreeCamera,
  HemisphericLight, MeshBuilder, PBRMaterial, Scene, SceneLoader,
  TransformNode, Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

const canvas = document.querySelector<HTMLCanvasElement>('#view')!;
const debug = document.querySelector<HTMLElement>('#debug')!;
const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: false });
const scene = new Scene(engine);
scene.clearColor = new Color4(.61, .69, .74, 1);

new HemisphericLight('sky light', new Vector3(0, 1, 0), scene).intensity = 1.4;
const sun = new DirectionalLight('sun', new Vector3(-.5, -1, -.35), scene);
sun.intensity = .7;
const ground = MeshBuilder.CreateGround('ground', { width: 30, height: 30 }, scene);
const groundMaterial = new PBRMaterial('ground material', scene);
groundMaterial.albedoColor = new Color3(.34, .39, .37);
groundMaterial.roughness = 1;
ground.material = groundMaterial;

// The camera uses a simple orbit around the moving player.
const camera = new FreeCamera('third person', new Vector3(0, 1.9, -3), scene);
camera.minZ = .05;
camera.fov = .72;
scene.activeCamera = camera;
let yaw = Math.PI;
let pitch = .29;
let distance = 3.1;
let player: TransformNode | undefined;
let idle: AnimationGroup | undefined;
let walk: AnimationGroup | undefined;
let walkWeight = 0;
let heading = 0;
let triangles = 0;
let bones = 0;
let loadStatus = 'Loading...';
const keys = new Set<string>();
const testParams = new URLSearchParams(location.search);
let previewWalk = testParams.has('walk');
const autoWalk = testParams.has('autowalk');
const posePhase = testParams.has('phase') ? Number(testParams.get('phase')) : NaN;
const freezePose = Number.isFinite(posePhase) && posePhase >= 0 && posePhase <= 1;
if (freezePose) previewWalk = true;
if (testParams.get('view') === 'side') yaw = Math.PI / 2;
if (testParams.get('view') === 'front') yaw = 0;
const previewButton = document.querySelector<HTMLButtonElement>('#walk-preview')!;
previewButton.textContent = freezePose ? 'Fixed walk pose' : previewWalk ? 'Stop walk test' : 'Walk test';
previewButton.disabled = freezePose;
previewButton.addEventListener('click', () => {
  previewWalk = !previewWalk;
  previewButton.textContent = previewWalk ? 'Stop walk test' : 'Walk test';
});

window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if ('wasd'.includes(key) && key.length === 1) {
    keys.add(key);
    event.preventDefault();
  }
});
window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
window.addEventListener('blur', () => keys.clear());
for (const button of document.querySelectorAll<HTMLButtonElement>('#touch button')) {
  const key = button.dataset.key!;
  button.addEventListener('pointerdown', e => { e.preventDefault(); button.setPointerCapture(e.pointerId); keys.add(key); });
  button.addEventListener('pointerup', () => keys.delete(key));
  button.addEventListener('pointercancel', () => keys.delete(key));
}

let dragging = false;
let lastX = 0;
let lastY = 0;
canvas.addEventListener('pointerdown', e => {
  dragging = true; lastX = e.clientX; lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if (!dragging) return;
  yaw += (e.clientX - lastX) * .006;
  pitch = Math.max(.13, Math.min(1.05, pitch + (e.clientY - lastY) * .004));
  lastX = e.clientX; lastY = e.clientY;
});
canvas.addEventListener('pointerup', () => dragging = false);
canvas.addEventListener('pointercancel', () => dragging = false);
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  distance = Math.max(1.9, Math.min(5.5, distance + Math.sign(e.deltaY) * .25));
}, { passive: false });

SceneLoader.ImportMeshAsync('', '/', 'player_rigged_test.glb', scene).then(result => {
  player = result.transformNodes.find(n => n.name === 'player');
  idle = result.animationGroups.find(a => a.name === 'Idle');
  walk = result.animationGroups.find(a => a.name === 'Walk');
  bones = result.skeletons[0]?.bones.length ?? 0;
  triangles = result.meshes.filter(m => m.name !== '__root__').reduce((n, m) => n + (m.getTotalIndices() / 3), 0);
  if (!player || !idle || !walk || bones < 17) throw new Error('The GLB has no complete rig or clips.');
  idle.start(true);
  walk.start(true);
  idle.setWeightForAllAnimatables(1);
  walk.setWeightForAllAnimatables(0);
  if (freezePose) {
    walkWeight = 1;
    idle.setWeightForAllAnimatables(0);
    walk.setWeightForAllAnimatables(1);
    walk.goToFrame(walk.from + (walk.to - walk.from) * posePhase);
    idle.pause();
    walk.pause();
  }
  loadStatus = 'Ready';
}).catch(error => {
  console.error(error);
  loadStatus = 'Error: ' + (error instanceof Error ? error.message : String(error));
});

let debugTime = 0;
engine.runRenderLoop(() => {
  const dt = Math.min(engine.getDeltaTime() / 1000, .05);
  if (player) {
    const forward = new Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new Vector3(forward.z, 0, -forward.x);
    const move = forward.scale(Number(keys.has('w') || autoWalk) - Number(keys.has('s')))
      .addInPlace(right.scale(Number(keys.has('d')) - Number(keys.has('a'))));
    const moving = move.lengthSquared() > 0;
    if (moving) {
      move.normalize();
      player.position.addInPlace(move.scale(1.3 * dt));
      const target = Math.atan2(move.x, move.z);
      const delta = Math.atan2(Math.sin(target - heading), Math.cos(target - heading));
      heading += delta * Math.min(1, dt * 11);
      player.rotation.y = heading;
    }
    walkWeight += (((moving || previewWalk) ? 1 : 0) - walkWeight) * Math.min(1, dt * 7);
    idle?.setWeightForAllAnimatables(1 - walkWeight);
    walk?.setWeightForAllAnimatables(walkWeight);
  }
  const target = (player?.position ?? Vector3.Zero()).add(new Vector3(0, 1.1, 0));
  const flat = Math.cos(pitch) * distance;
  camera.position.copyFromFloats(target.x + Math.sin(yaw) * flat,
    Math.max(.45, target.y + Math.sin(pitch) * distance),
    target.z + Math.cos(yaw) * flat);
  camera.setTarget(target);
  scene.render();
  debugTime += dt;
  if (debugTime >= .25) {
    debugTime = 0;
    const p = player?.position ?? Vector3.Zero();
    debug.textContent = `FPS: ${engine.getFps().toFixed(0)}\nAnimation: ${walkWeight > .5 ? 'Walk' : 'Idle'}\nPosition: ${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}\nTriangles: ${triangles.toLocaleString()}\nBones: ${bones}\nGLB load: ${loadStatus}`;
  }
});
window.addEventListener('resize', () => engine.resize());
