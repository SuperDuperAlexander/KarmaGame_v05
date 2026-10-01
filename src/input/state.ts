import type { InputFrame } from '../contracts/input';

export function stickVector(x: number, z: number, radius: number, deadZone = 0.16): { x: number; z: number } {
  const length = Math.hypot(x, z) / radius;
  if (length <= deadZone) return { x: 0, z: 0 };
  const strength = (Math.min(1, length) - deadZone) / (1 - deadZone);
  const norm = Math.hypot(x, z);
  return { x: x / norm * strength, z: z / norm * strength };
}

export class InputState {
  readonly keys = new Set<string>();
  private locks = new Set<symbol>();
  touchX = 0;
  touchZ = 0;
  touchRun = false;
  touchHeld = false;
  pressed = false;
  lookX = 0;
  lookY = 0;
  zoom = 0;

  get locked(): boolean { return this.locks.size > 0; }

  key(code: string, down: boolean): void {
    if (down && this.locked) return;
    if (down) {
      if (code === 'KeyE' && !this.keys.has(code)) this.pressed = true;
      this.keys.add(code);
    } else this.keys.delete(code);
  }

  clear(): void {
    this.keys.clear();
    this.touchX = this.touchZ = this.lookX = this.lookY = this.zoom = 0;
    this.touchRun = this.touchHeld = this.pressed = false;
  }

  lock(reason: string): () => void {
    const token = Symbol(reason);
    this.locks.add(token);
    this.clear();
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.locks.delete(token);
      this.clear();
    };
  }

  read(): InputFrame {
    const x = this.touchX + Number(this.keys.has('KeyD') || this.keys.has('ArrowRight')) - Number(this.keys.has('KeyA') || this.keys.has('ArrowLeft'));
    const z = this.touchZ + Number(this.keys.has('KeyW') || this.keys.has('ArrowUp')) - Number(this.keys.has('KeyS') || this.keys.has('ArrowDown'));
    const divisor = Math.max(1, Math.hypot(x, z));
    const frame: InputFrame = this.locked
      ? { x: 0, z: 0, run: false, pressed: false, held: false, lookX: 0, lookY: 0, zoom: 0 }
      : { x: x / divisor, z: z / divisor, run: this.touchRun || this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'), pressed: this.pressed, held: this.touchHeld || this.keys.has('KeyE'), lookX: this.lookX, lookY: this.lookY, zoom: this.zoom };
    this.pressed = false;
    this.lookX = this.lookY = this.zoom = 0;
    return frame;
  }
}
