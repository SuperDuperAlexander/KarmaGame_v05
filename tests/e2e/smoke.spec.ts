import { expect, test } from '@playwright/test';
import { createDriver, readGame, waitReady } from './driver';

test('boots and moves with real input', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/?test&assets=placeholder');
  await waitReady(page);
  const mobile = testInfo.project.name === 'mobile';
  const driver = await createDriver(page, mobile);
  const start = await readGame(page);
  await driver.moveTo(start.position.x, start.position.z + 2, 0.45);
  expect((await readGame(page)).position.z).toBeGreaterThan(start.position.z + 1.5);
  if (mobile) await page.getByRole('button', { name: 'Pause', exact: true }).tap();
  else await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeVisible();
  const paused = await readGame(page);
  expect(paused.paused).toBe(true);
  expect(await page.locator('.lw-touch').evaluate(element => element.parentElement?.inert)).toBe(true);
  if (!mobile) {
    await page.keyboard.down('w');
    await page.waitForTimeout(400);
    await page.keyboard.up('w');
    const after = (await readGame(page)).position;
    expect(Math.hypot(after.x - paused.position.x, after.z - paused.position.z)).toBeLessThan(0.01);
  }
  if (mobile) await page.getByRole('button', { name: 'Resume', exact: true }).tap();
  else await page.getByRole('button', { name: 'Resume', exact: true }).click();
  expect((await readGame(page)).paused).toBe(false);
  await driver.dispose();
  expect(errors).toEqual([]);
});
