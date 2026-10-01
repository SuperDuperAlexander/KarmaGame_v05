import type { InputService } from '../contracts/input';
import { strings } from '../content/strings.en';
import { InputState, stickVector } from './state';

export function createInputService(canvas: HTMLCanvasElement, touchRoot: HTMLElement): InputService {
  const state = new InputState();
  const events = new AbortController();
  const options = { signal: events.signal };
  let touch = false;
  let stickPointer: number | null = null;
  let lookPointer: number | null = null;
  let lastX = 0;
  let lastY = 0;
  const layer = document.createElement('div');
  layer.className = 'lw-touch';
  layer.hidden = true;
  const style = document.createElement('style');
  style.textContent = `
    .lw-touch[hidden]{display:none}.lw-touch{position:fixed;inset:0;z-index:20;pointer-events:none;touch-action:none}
    .lw-stick,.lw-touch-actions{position:absolute;bottom:calc(24px + env(safe-area-inset-bottom));pointer-events:auto}
    .lw-stick{left:calc(20px + env(safe-area-inset-left));width:112px;height:112px;border:1px solid #f4e7ca70;border-radius:50%;background:#17232680;touch-action:none}
    .lw-stick-knob{position:absolute;width:42px;height:42px;left:35px;top:35px;border-radius:50%;background:#f4e7ca90;pointer-events:none}
    .lw-touch-actions{right:calc(20px + env(safe-area-inset-right));display:flex;gap:10px;align-items:end}
    .lw-touch button{min-width:64px;min-height:64px;border-radius:50%;border:1px solid #f4e7ca70;color:#fff9ed;background:#172326c9;font:600 15px system-ui;touch-action:none;user-select:none;-webkit-user-select:none}
    .lw-touch button:last-child{width:76px;height:76px}.lw-touch button:active{background:#536457}
    @media(max-height:500px){.lw-stick,.lw-touch-actions{bottom:calc(14px + env(safe-area-inset-bottom))}}
  `;
  const stick = document.createElement('div');
  stick.className = 'lw-stick';
  stick.setAttribute('role', 'group');
  stick.setAttribute('aria-label', strings.touchMove);
  const knob = document.createElement('div');
  knob.className = 'lw-stick-knob';
  stick.append(knob);
  const actions = document.createElement('div');
  actions.className = 'lw-touch-actions';
  const run = document.createElement('button');
  run.type = 'button';
  run.textContent = strings.run;
  const act = document.createElement('button');
  act.type = 'button';
  act.textContent = strings.act;
  act.setAttribute('aria-label', strings.act);
  actions.append(run, act);
  layer.append(style, stick, actions);
  touchRoot.append(layer);
  const oldTouchAction = canvas.style.touchAction;
  canvas.style.touchAction = 'none';

  const reveal = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') return;
    touch = true;
    layer.hidden = false;
  };
  window.addEventListener('pointerdown', reveal, options);
  const isEditor = (target: EventTarget | null) => target instanceof HTMLElement && (target.matches('input,textarea,select') || target.isContentEditable);
  const gameKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyE', 'ShiftLeft', 'ShiftRight']);
  window.addEventListener('keydown', event => {
    if (isEditor(event.target) || !gameKeys.has(event.code)) return;
    event.preventDefault();
    state.key(event.code, true);
  }, options);
  window.addEventListener('keyup', event => state.key(event.code, false), options);
  window.addEventListener('blur', () => state.clear(), options);
  document.addEventListener('visibilitychange', () => { if (document.hidden) state.clear(); }, options);
  const resetStick = () => {
    stickPointer = null;
    state.touchX = state.touchZ = 0;
    knob.style.transform = '';
  };
  stick.addEventListener('pointerdown', event => {
    if (state.locked || stickPointer !== null) return;
    event.preventDefault();
    stickPointer = event.pointerId;
    stick.setPointerCapture(event.pointerId);
  }, options);
  stick.addEventListener('pointermove', event => {
    if (event.pointerId !== stickPointer || state.locked) return;
    const box = stick.getBoundingClientRect();
    const x = event.clientX - box.left - box.width / 2;
    const y = event.clientY - box.top - box.height / 2;
    const vector = stickVector(x, -y, 45);
    state.touchX = vector.x;
    state.touchZ = vector.z;
    knob.style.transform = `translate(${vector.x * 35}px,${-vector.z * 35}px)`;
  }, options);
  stick.addEventListener('pointerup', resetStick, options);
  stick.addEventListener('pointercancel', resetStick, options);
  stick.addEventListener('lostpointercapture', resetStick, options);
  const holdButton = (button: HTMLButtonElement, action: 'run' | 'act') => {
    let pointer: number | null = null;
    button.addEventListener('pointerdown', event => {
      if (state.locked || pointer !== null) return;
      event.preventDefault();
      pointer = event.pointerId;
      button.setPointerCapture(event.pointerId);
      if (action === 'run') state.touchRun = true;
      else { state.touchHeld = true; state.pressed = true; }
    }, options);
    const end = () => { pointer = null; if (action === 'run') state.touchRun = false; else state.touchHeld = false; };
    button.addEventListener('pointerup', end, options);
    button.addEventListener('pointercancel', end, options);
    button.addEventListener('lostpointercapture', end, options);
  };
  holdButton(run, 'run');
  holdButton(act, 'act');
  canvas.addEventListener('contextmenu', event => event.preventDefault(), options);
  canvas.addEventListener('pointerdown', event => {
    if (state.locked || lookPointer !== null || (event.pointerType === 'mouse' && event.button !== 0 && event.button !== 2)) return;
    lookPointer = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  }, options);
  canvas.addEventListener('pointermove', event => {
    if (event.pointerId !== lookPointer || state.locked) return;
    state.lookX += event.clientX - lastX;
    state.lookY += event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
  }, options);
  const endLook = () => { lookPointer = null; };
  canvas.addEventListener('pointerup', endLook, options);
  canvas.addEventListener('pointercancel', endLook, options);
  canvas.addEventListener('lostpointercapture', endLook, options);
  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    if (!state.locked) state.zoom += Math.sign(event.deltaY);
  }, { ...options, passive: false });
  return {
    read: () => state.read(),
    isTouch: () => touch,
    lock: reason => { resetStick(); endLook(); return state.lock(reason); },
    dispose: () => { events.abort(); state.clear(); layer.remove(); canvas.style.touchAction = oldTouchAction; },
  };
}
