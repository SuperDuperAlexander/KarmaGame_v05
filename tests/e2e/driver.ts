import { expect, type CDPSession, type Page } from '@playwright/test';

export interface GameRead {
  ready: boolean;
  busy: boolean;
  paused: boolean;
  world: 'outer' | 'inner';
  position: { x: number; y: number; z: number };
  state: { facts: string[]; reflections: Record<string, string>; traits: { attachment: number }; waveIds: string[] };
  camera: { yaw: number; pitch: number; distance: number };
  beetle: boolean;
  waves: number;
  wavesShown: string[];
  animation: { groups: { name: string; playing: boolean }[] };
  transitions: { world: string; step: string; time: number }[];
  stats: { fps: number; drawCalls: number; triangles: number; gpu: string };
}

export async function readGame(page: Page): Promise<GameRead> {
  return page.evaluate(() => (window as unknown as { __lw: { read(): GameRead } }).__lw.read());
}

export async function waitReady(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const hook = (window as unknown as { __lw?: { read(): GameRead } }).__lw;
    if (!hook) return false;
    const state = hook.read();
    return state.ready && !state.busy;
  }, undefined, { timeout: 30000 });
}

export async function waitFact(page: Page, fact: string): Promise<void> {
  await expect.poll(async () => (await readGame(page)).state.facts, { timeout: 20000 }).toContain(fact);
  await waitReady(page);
}

export async function createDriver(page: Page, mobile: boolean) {
  const session: CDPSession | null = mobile ? await page.context().newCDPSession(page) : null;
  let heldKeys = new Set<string>();
  let touchActive = false;
  let disposed = false;
  const sendKeys = async (next: Set<string>) => {
    for (const key of heldKeys) if (!next.has(key)) await page.keyboard.up(key);
    for (const key of next) await page.keyboard.down(key);
    heldKeys = next;
  };
  const touchEvent = async (type: 'touchStart' | 'touchMove' | 'touchEnd', points: { x: number; y: number; id: number }[]) => {
    if (type === 'touchEnd' && !touchActive) return;
    await session?.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(point => ({ ...point, radiusX: 3, radiusY: 3, force: 1 })) });
    touchActive = type !== 'touchEnd';
  };
  const center = async (selector: string) => {
    const box = await page.locator(selector).boundingBox();
    if (!box) throw new Error(`Control is not visible: ${selector}`);
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  };
  const stop = async () => {
    if (mobile) await touchEvent('touchEnd', []);
    else await sendKeys(new Set());
  };
  if (mobile) {
    await page.touchscreen.tap(195, 380);
    await expect(page.locator('.lw-stick')).toBeVisible();
    for (const control of ['.lw-stick', '.lw-touch button']) {
      for (const element of await page.locator(control).all()) {
        const box = await element.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(48);
        expect(box?.height).toBeGreaterThanOrEqual(48);
      }
    }
  } else await expect(page.locator('.lw-stick')).toBeHidden();

  return {
    stop,
    async moveTo(x: number, z: number, tolerance = 0.7) {
      await waitReady(page);
      const deadline = Date.now() + 40000;
      let touchStarted = false;
      let stick = { x: 0, y: 0 };
      let run = { x: 0, y: 0 };
      let last = (await readGame(page)).position;
      let stuckTime = 0;
      if (mobile) {
        stick = await center('.lw-stick');
        run = await center('.lw-touch button:first-child');
      }
      try {
        while (Date.now() < deadline) {
          const snapshot = await readGame(page);
          const dx = x - snapshot.position.x;
          const dz = z - snapshot.position.z;
          const distance = Math.hypot(dx, dz);
          if (distance < tolerance) {
            await stop();
            touchStarted = false;
            await page.waitForTimeout(120);
            const settled = (await readGame(page)).position;
            if (Math.hypot(x - settled.x, z - settled.z) < tolerance + 0.1) return;
            continue;
          }
          if (snapshot.busy || !snapshot.ready) { await stop(); touchStarted = false; await waitReady(page); continue; }
          const yaw = snapshot.camera.yaw;
          const localX = dx * Math.cos(yaw) - dz * Math.sin(yaw);
          const localZ = dx * Math.sin(yaw) + dz * Math.cos(yaw);
          if (mobile) {
            if (!touchStarted) {
              await touchEvent('touchStart', [{ ...stick, id: 1 }, { ...run, id: 2 }]);
              touchStarted = true;
            }
            const length = Math.hypot(localX, localZ);
            const radius = distance < 1.5 ? 20 : 45;
            await touchEvent('touchMove', [
              { x: stick.x + localX / length * radius, y: stick.y - localZ / length * radius, id: 1 },
              { ...run, id: 2 },
            ]);
          } else {
            const keys = new Set<string>();
            if (Math.abs(localX) > 0.12) keys.add(localX > 0 ? 'd' : 'a');
            if (Math.abs(localZ) > 0.12) keys.add(localZ > 0 ? 'w' : 's');
            if (distance > 1.5) keys.add('Shift');
            await sendKeys(keys);
          }
          await page.waitForTimeout(distance < 1.5 ? 80 : 200);
          await stop();
          touchStarted = false;
          const after = (await readGame(page)).position;
          stuckTime = Math.hypot(after.x - last.x, after.z - last.z) < 0.02 ? stuckTime + 200 : 0;
          last = after;
          if (stuckTime > 5000) throw new Error(`Move blocked at (${after.x.toFixed(2)}, ${after.z.toFixed(2)}) toward (${x}, ${z})`);
        }
        const snapshot = await readGame(page);
        throw new Error(`Move timed out at (${snapshot.position.x.toFixed(2)}, ${snapshot.position.z.toFixed(2)}) toward (${x}, ${z})`);
      } finally { await stop(); }
    },
    async act(milliseconds = 100) {
      await waitReady(page);
      const oldWorld = (await readGame(page)).world;
      const waitHeld = async () => {
        await page.waitForTimeout(milliseconds);
        if (milliseconds >= 1100) {
          await expect.poll(async () => (await readGame(page)).world, { timeout: 15000 }).not.toBe(oldWorld);
        }
      };
      if (mobile) {
        const point = await center('.lw-touch button:last-child');
        await touchEvent('touchStart', [{ ...point, id: 3 }]);
        try { await waitHeld(); } finally { await touchEvent('touchEnd', []); }
      } else {
        await page.keyboard.down('e');
        try { await waitHeld(); } finally { await page.keyboard.up('e'); }
      }
      await page.waitForTimeout(100);
    },
    async dispose() { if (disposed) return; disposed = true; await stop(); await session?.detach(); },
  };
}
