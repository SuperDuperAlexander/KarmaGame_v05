import {expect,test} from '@playwright/test';
import {createDriver,readGame,waitReady} from './driver';

test('city routes, closed north threshold and view controls use real input',async({page},info)=>{
  test.setTimeout(300000);
  const errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  // This is an art-route fixture. The full journey proves how the facts are earned.
  await page.addInitScript(()=>localStorage.setItem('light-within-save-v1',JSON.stringify({schemaVersion:1,
    facts:['PACKAGE_RECEIVED','CITY_ENTERED','TREE_DISCOVERED'],firedRules:[],
    traits:{attachment:.1,fear:0,trust:0,contentment:0},counters:{},world:'outer',
    positions:{outer:{x:0,y:0,z:-8},inner:{x:0,y:0,z:-7}},reflections:{money:'Keep these local words.'},waveIds:[]})));
  await page.goto('/?test');await waitReady(page);
  const driver=await createDriver(page,info.project.name==='mobile');
  try{
    await driver.moveTo(-8,-3);
    await driver.moveTo(-11,4);
    await driver.moveTo(-18,4);
    await driver.moveTo(-24,4);
    await driver.moveTo(-27,4);
    await driver.moveTo(-24,4);
    await driver.moveTo(-18,4);
    await driver.moveTo(-10,4);
    await driver.moveTo(-5,10);
    await driver.moveTo(0,20);
    await driver.moveTo(0,26, .4);
    const at=await readGame(page);
    expect(at.state.facts).not.toContain('EXCHANGE_HOUSE_ENTERED');
    // A visible closed threshold stops travel into the deferred hall.
    await page.keyboard.down('w');await page.waitForTimeout(900);await page.keyboard.up('w');
    expect((await readGame(page)).position.z).toBeLessThan(28);
    await page.getByLabel('View detail',{exact:true}).selectOption('low');
    const low=await readGame(page);
    expect(low.state.reflections.money).toBe('Keep these local words.');
    expect(low.state.facts).toEqual(at.state.facts);
    await page.getByLabel('View detail',{exact:true}).selectOption('high');
    await page.mouse.move(180,360);await page.mouse.down();await page.mouse.move(480,420,{steps:10});await page.mouse.up();
    const turned=await readGame(page);
    expect(Math.abs(turned.camera.yaw-at.camera.yaw)).toBeGreaterThan(.5);
    expect(turned.camera.pitch).toBeGreaterThanOrEqual(20*Math.PI/180);
    expect(turned.camera.pitch).toBeLessThanOrEqual(55*Math.PI/180);
    if(info.project.name==='mobile')await page.getByRole('button',{name:'Pause',exact:true}).tap();
    else await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeVisible();
    const mute=page.getByRole('button',{name:'Mute sound',exact:true});
    await mute.click();await expect(page.getByRole('button',{name:'Play sound',exact:true})).toBeVisible();
    await page.getByLabel('Sound volume',{exact:true}).fill('0.25');
    await page.getByRole('button',{name:'Resume',exact:true}).click();
    expect((await readGame(page)).paused).toBe(false);
    expect(errors).toEqual([]);
  }finally{await driver.dispose();}
});
