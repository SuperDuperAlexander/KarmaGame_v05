import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('docs/evidence',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:720}});
const errors=[];const logs=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')logs.push(m.text());});
await page.goto(`http://127.0.0.1:${process.env.LW_PORT??'5186'}/?test&debug`);
try {
  await page.waitForFunction(()=>window.__lw?.read().ready,{timeout:30000});
  const before=await page.evaluate(()=>window.__lw.read());
  await page.keyboard.down('KeyW');await page.waitForTimeout(1100);await page.keyboard.up('KeyW');
  await page.waitForTimeout(150);
  const after=await page.evaluate(()=>window.__lw.read());
  await page.screenshot({path:'docs/evidence/outer-start-desktop.png'});
  await writeFile('docs/evidence/smoke.json',JSON.stringify({before,after,errors,logs},null,2));
  console.log(JSON.stringify({before:before.position,after:after.position,animation:after.animation,stats:after.stats,errors,logs}));
}catch(e) {await page.screenshot({path:'docs/evidence/boot-failure.png'});console.log(JSON.stringify({error:e.message,errors,logs}));process.exitCode=1;}
finally{await browser.close();}
