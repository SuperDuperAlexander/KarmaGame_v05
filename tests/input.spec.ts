import { describe, expect, it } from 'vitest';
import { InputState, stickVector } from '../src/input/state';

describe('input', () => {
  it('uses rising act presses and consumes the press and look delta', () => {
    const input = new InputState();
    input.key('KeyE', true);
    input.lookX = 16;
    expect(input.read()).toMatchObject({ pressed: true, held: true, lookX: 16 });
    input.key('KeyE', true);
    expect(input.read()).toMatchObject({ pressed: false, held: true, lookX: 0 });
    input.key('KeyE', false);
    input.key('KeyE', true);
    expect(input.read().pressed).toBe(true);
  });
  it('keeps same-name locks separate and clears held input on each release', () => {
    const input = new InputState();
    input.key('KeyW', true);
    input.key('KeyE', true);
    const unlockA = input.lock('modal');
    const unlockB = input.lock('modal');
    unlockA();
    unlockA();
    input.key('KeyW', true);
    expect(input.read()).toMatchObject({ z: 0, held: false, pressed: false });
    unlockB();
    expect(input.read().z).toBe(0);
    input.key('KeyW', true);
    expect(input.read().z).toBe(1);
  });
  it('uses a radial dead zone and clamps touch drag length', () => {
    expect(stickVector(5, 5, 50)).toEqual({ x: 0, z: 0 });
    expect(stickVector(500, 0, 50)).toEqual({ x: 1, z: 0 });
    const diagonal = stickVector(50, 50, 50);
    expect(Math.hypot(diagonal.x, diagonal.z)).toBeCloseTo(1);
  });
  it('keeps keyboard and mixed touch diagonal speed at or below one', () => {
    const input = new InputState();
    input.key('KeyW', true);
    input.key('KeyD', true);
    input.touchX = input.touchZ = 1;
    const frame = input.read();
    expect(Math.hypot(frame.x, frame.z)).toBeCloseTo(1);
    input.clear();
    expect(input.read()).toMatchObject({ x: 0, z: 0, held: false });
  });
});
