export const uiStyles = `
html,body{margin:0;overflow:hidden;overscroll-behavior:none}
.lw-ui{position:fixed;inset:0;z-index:30;color:#fff7e8;font:16px/1.5 system-ui,sans-serif;pointer-events:none;box-sizing:border-box}
.lw-ui *{box-sizing:border-box}.lw-ui [hidden]{display:none!important}
.lw-ui button,.lw-ui textarea{font:inherit}.lw-ui button{min-height:48px;min-width:48px;border:1px solid #fff5d650;border-radius:10px;background:#33443d;color:#fff9ee;padding:10px 16px;cursor:pointer}
.lw-ui button:hover{background:#496055}.lw-ui button:focus-visible,.lw-ui textarea:focus-visible{outline:3px solid #f1cb7c;outline-offset:3px}
.lw-top{position:absolute;left:calc(18px + env(safe-area-inset-left));right:calc(18px + env(safe-area-inset-right));top:calc(14px + env(safe-area-inset-top));display:flex;justify-content:space-between;align-items:center;gap:12px}
.lw-world{font-size:13px;letter-spacing:.13em;text-transform:uppercase;text-shadow:0 2px 5px #000}.lw-top button{pointer-events:auto;background:#182727b8}
.lw-hint{position:absolute;top:calc(82px + env(safe-area-inset-top));left:18px;right:18px;max-width:510px;margin:0 auto;text-align:center;font-size:14px;text-shadow:0 2px 5px #000;background:#1827278f;padding:8px 12px;border-radius:8px}
.lw-prompt{position:absolute;bottom:calc(158px + env(safe-area-inset-bottom));left:18px;right:18px;text-align:center;margin:0 auto;max-width:480px;display:flex;align-items:center;justify-content:center;gap:12px;background:#152628d9;padding:12px 16px;border:1px solid #fff4d540;border-radius:12px}
.lw-hold{height:36px;width:36px;flex-shrink:0;border-radius:50%;background:conic-gradient(#edcd8b calc(var(--progress,0)*1turn),#ffffff20 0);padding:5px}.lw-hold::after{content:'';display:block;width:100%;height:100%;border-radius:50%;background:#152628}
.lw-modal-backdrop{position:absolute;inset:0;background:#091413b8;display:flex;align-items:center;justify-content:center;padding:calc(16px + env(safe-area-inset-top)) 18px calc(16px + env(safe-area-inset-bottom));pointer-events:auto;overflow:auto;touch-action:pan-y}
.lw-panel{width:100%;max-width:470px;max-height:100%;overflow:auto;border:1px solid #b5b69866;border-radius:18px;background:#192b2b;padding:24px;box-shadow:0 18px 70px #0008}
.lw-panel h1{font-size:24px;font-weight:500;line-height:1.3;margin:0 0 16px}.lw-panel p{font-size:14px;color:#d7dece;margin:0 0 16px}.lw-panel textarea{display:block;width:100%;min-height:145px;max-height:30vh;resize:vertical;padding:12px;background:#102323;color:#fff7e8;border:1px solid #b5b69880;border-radius:8px}
.lw-count{display:block;text-align:right;font-size:12px;margin:6px 0 16px;color:#ccd4c3}.lw-buttons{display:flex;flex-wrap:wrap;gap:10px}.lw-menu{display:grid;gap:12px}.lw-ui .lw-muted{background:#192b2b}
.lw-loading{position:absolute;inset:0;z-index:4;display:grid;place-content:center;gap:16px;text-align:center;background:#102222;pointer-events:auto;padding:24px}.lw-spinner{width:40px;height:40px;margin:auto;border:2px solid #ffffff30;border-top-color:#f1cb7c;border-radius:50%;animation:lw-spin 1s linear infinite}@keyframes lw-spin{to{transform:rotate(360deg)}}
@media(max-width:480px){.lw-panel{padding:20px}.lw-panel h1{font-size:21px}.lw-prompt{font-size:15px}.lw-hint{font-size:13px}}
@media(max-height:500px){.lw-prompt{bottom:calc(136px + env(safe-area-inset-bottom))}.lw-hint{top:68px;max-width:380px}.lw-panel{padding:16px}.lw-panel textarea{min-height:75px}}
@media(prefers-reduced-motion:reduce){.lw-spinner{animation:none}}
`;
