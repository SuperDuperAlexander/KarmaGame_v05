import { test } from '@playwright/test';
import { createDriver, readGame, waitFact, waitReady } from './driver';
test('glow', async ({ page }, info) => {
  test.setTimeout(400000);
  const mobile = info.project.name === 'mobile';
  const p = mobile ? 'phone' : 'desktop';
  const res: Record<string, unknown> = {};
  await page.goto('/?test&debug'); await waitReady(page);
  const d = await createDriver(page, mobile);
  await d.moveTo(1.2, -45, 0.4); await d.act(); await waitFact(page, 'PACKAGE_RECEIVED');
  await d.moveTo(0, -23); await d.moveTo(0, -3.8, 0.35); await waitFact(page, 'TREE_DISCOVERED');
  await d.act(1500); await waitFact(page, 'INNER_WORLD_ENTERED'); await d.moveTo(4, -3, 0.45);
  for (const q of ['low', 'medium', 'high', 'medium', 'low']) {
    await page.locator('.lw-top select').selectOption(q);
    await page.waitForTimeout(2500);
    const dc: number[] = []; let tri = 0; let fps = 0;
    for (let i = 0; i < 5; i++) { const r = await readGame(page); dc.push(r.stats.drawCalls); tri = r.stats.triangles; fps = r.stats.fps; await page.waitForTimeout(250); }
    res[q + Object.keys(res).length] = { dc, tri: Math.round(tri), fps: Math.round(fps) };
    if (!res['shot' + q]) { res['shot' + q] = 1; await page.screenshot({ path: `docs/evidence/wp-42/${p}-inner-${q}.png` }); }
  }
  console.log('GLOWRES ' + JSON.stringify(res));
  await d.dispose();
});
