import {defineConfig} from '@playwright/test';
// Each helper worktree sets its own LW_PORT so parallel test runs never share a dev server.
const port=process.env.LW_PORT??'5186';
export default defineConfig({
  testDir:'tests/e2e',timeout:180000,expect:{timeout:15000},fullyParallel:false,workers:1,
  reporter:[['list'],['html',{open:'never'}]],
  use:{baseURL:`http://127.0.0.1:${port}`,trace:'retain-on-failure',screenshot:'only-on-failure',launchOptions:{args:process.env.LW_SOFTWARE==='1'?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:process.platform==='win32'?['--use-angle=d3d11']:[]}},
  projects:[{name:'desktop',use:{viewport:{width:1280,height:720}}},{name:'mobile',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}}],
  webServer:{command:`npx vite --host 0.0.0.0 --port ${port} --strictPort`,url:`http://127.0.0.1:${port}`,reuseExistingServer:!process.env.CI,timeout:30000}
});
