import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const phase=process.env.LW_PHASE??'after';
const root=`docs/evidence/v0.2/${phase}`;
await mkdir(root,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11']});
const views=[
  ['01-start','outer',0,-45,0],['02-gate','outer',0,-24,0],
  ['03-square-wide','outer',0,-12,0],['04-tree-close','outer',0,-3.8,0],
  ['05-tree-market','outer',18,0,-Math.PI/2],['06-market-entry','outer',19,-5,.65],
  ['07-market-counter','outer',25,-1.5,.55],['08-dark-entry','outer',-17,4,-Math.PI/2],
  ['09-dark-court','outer',-27,4,-1],['10-exchange','outer',0,24,0],
  ['11-inner-arrival','inner',0,-7,.45],['12-inner-source','inner',-3,-3,.5],
  ['13-inner-package','inner',4,-3,.45],['14-inner-beetle','inner',5.5,-2.4,.45],
  ['15-boundary-west','outer',-33,0,-Math.PI/2],['15-boundary-east','outer',38,12,Math.PI/2],
  ['15-boundary-north','outer',12,44,0],['15-boundary-south','outer',0,-49,Math.PI],
];
const capture=[];const performance=[];
function state(world,x,z){return {schemaVersion:1,facts:['PACKAGE_RECEIVED','CITY_ENTERED','TREE_DISCOVERED','INNER_WORLD_ENTERED','MONEY_REFLECTION_SAVED','MARKET_VISITED','ATTACHMENT_TRIGGERED','ATTACHMENT_SEEN'],firedRules:[],traits:{attachment:.45,fear:0,trust:0,contentment:0},counters:{},world,positions:{outer:{x:world==='outer'?x:0,y:0,z:world==='outer'?z:-3.8},inner:{x:world==='inner'?x:0,y:0,z:world==='inner'?z:-7}},reflections:{money:'Local art review.'},waveIds:['attachment-desire']};}
for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
  for(const [id,world,x,z,yaw] of views){
    if(mobile&&!['03-square-wide','04-tree-close','06-market-entry','07-market-counter','11-inner-arrival','13-inner-package','14-inner-beetle'].includes(id))continue;
    const page=await context.newPage();const errors=[];const transfers=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    page.on('response',async r=>{const size=Number(r.headers()['content-length']);if(size>0)transfers.push({url:new URL(r.url()).pathname,bytes:size});});
    await page.addInitScript(s=>localStorage.setItem('light-within-save-v1',JSON.stringify(s)),state(world,x,z));
    const started=Date.now();await page.goto(`http://127.0.0.1:${process.env.LW_PORT??'5196'}/?test&debug`);
    await page.waitForFunction(()=>window.__lw?.read().ready&&!window.__lw.read().busy,{timeout:60000});
    const loadMs=Date.now()-started;
    await page.waitForTimeout(2200);
    // Preview saved art state only. Rotate through the real input service.
    const current=await page.evaluate(()=>window.__lw.read().camera.yaw);
    await page.mouse.move(160,350);await page.mouse.down();await page.mouse.move(160+(yaw-current)/.005,350,{steps:8});await page.mouse.up();
    await page.waitForTimeout(300);
    const modes=['medium'];if(['03-square-wide','07-market-counter','11-inner-arrival'].includes(id))modes.push('low');
    for(const quality of modes){
      await page.getByLabel('View detail',{exact:true}).selectOption(quality);await page.waitForTimeout(400);
      const read=await page.evaluate(()=>window.__lw.read());
      const file=`${mobile?'touch390':'desktop'}-${id}-${quality}.png`;
      await page.screenshot({path:`${root}/${file}`});
      capture.push({id,phase,world,quality,viewport:mobile?'390x844 touch browser':'1280x720 desktop',requestedPosition:{x,z},actualPosition:read.position,camera:read.camera,state:read.state.facts,renderer:read.stats.gpu,file:`${phase}/${file}`,errors});
      if(quality==='medium'&&['03-square-wide','07-market-counter','11-inner-arrival'].includes(id)){
        await page.waitForTimeout(Number(process.env.LW_WARM_MS??15000));
        const sample=await page.evaluate(async ms=>{
          const frames=[];const stats=[];let last=performance.now();const start=last;
          await new Promise(resolve=>{function tick(t){frames.push(t-last);last=t;if(frames.length%15===0)stats.push(window.__lw.read().stats);if(t-start<ms)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});
          frames.sort((a,b)=>a-b);return {durationMs:performance.now()-start,medianFrameMs:frames[Math.floor(frames.length*.5)],p95FrameMs:frames[Math.floor(frames.length*.95)],maxFrameMs:frames.at(-1),peakDrawCalls:Math.max(...stats.map(s=>s.drawCalls)),peakTriangles:Math.max(...stats.map(s=>s.triangles)),samples:stats};
        },Number(process.env.LW_SAMPLE_MS??60000));
        performance.push({id,phase,quality,device:'Windows desktop; browser touch viewport is not a phone',viewport:mobile?'390x844':'1280x720',renderer:read.stats.gpu,pixelRatio:1,loadMs,transfers,errors,...sample});
        console.log(`${phase} ${mobile?'touch':'desktop'} ${id}: ${sample.peakDrawCalls} draws, ${Math.round(sample.peakTriangles)} triangles, ${sample.medianFrameMs.toFixed(1)} ms median`);
      }
    }
    // Extra angles use actual camera drag. Original source frames are kept.
    if(!mobile&&['03-square-wide','07-market-counter','11-inner-arrival'].includes(id))for(const [angle,dx]of [['reverse',Math.PI/.005],['corner',-Math.PI/2/.005]]){
      await page.mouse.move(200,350);await page.mouse.down();await page.mouse.move(200+dx,350,{steps:12});await page.mouse.up();await page.waitForTimeout(200);
      const read=await page.evaluate(()=>window.__lw.read());const file=`desktop-${id}-${angle}.png`;await page.screenshot({path:`${root}/${file}`});capture.push({id,angle,phase,world,viewport:'1280x720 desktop',quality:read.quality??'low',camera:read.camera,actualPosition:read.position,renderer:read.stats.gpu,file:`${phase}/${file}`,errors});
    }
    await page.close();
    await writeFile(`docs/evidence/v0.2/${phase}-captures.json`,JSON.stringify(capture,null,2));
    await writeFile(`docs/evidence/v0.2/${phase}-performance.json`,JSON.stringify(performance,null,2));
  }
  await context.close();
}
await browser.close();
console.log(`${phase}: ${capture.length} captures, ${performance.length} performance views`);
