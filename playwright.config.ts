import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'tests/e2e',timeout:180000,expect:{timeout:15000},fullyParallel:false,workers:1,
  reporter:[['list'],['html',{open:'never'}]],
  use:{baseURL:'http://127.0.0.1:5186',trace:'retain-on-failure',screenshot:'only-on-failure',launchOptions:{args:process.env.LW_SOFTWARE==='1'?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:process.platform==='win32'?['--use-angle=d3d11']:[]}},
  projects:[{name:'desktop',use:{viewport:{width:1280,height:720}}},{name:'mobile',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}}],
  webServer:{command:'npm run dev',url:'http://127.0.0.1:5186',reuseExistingServer:!process.env.CI,timeout:30000}
});
