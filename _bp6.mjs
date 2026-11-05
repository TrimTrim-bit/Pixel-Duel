/* _bp6.mjs — uses FX.registerGame hook info: probes def.update wrap state g via
   engine's FX registry (PD.FX.NEW_GAMES) for ALL frozen games quickly.
   Reports: found def? g stats mutating? canvas mutating?
   Usage: node _bp6.mjs "skijumpGame,warlordsGame,..." */
import path from "path"; import os from "os"; import fs from "fs";
function resolvePatchright() {
  const base = path.join(os.homedir(), ".vscode/extensions");
  const exts = fs.readdirSync(base).filter(d => d.includes("dscodegpt"));
  for (const e of exts) {
    const b = path.join(base, e);
    for (const sub of ["standalone/node_modules", ""]) {
      if (fs.existsSync(path.join(b, sub, "patchright"))) return path.join(b, sub);
    }
  }
  return null;
}
const pr = resolvePatchright();
const { chromium } = await import("file:///" + path.join(pr, "patchright", "index.mjs").replace(/\\/g, "/"));
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Users\\timot\\AppData\\Local\\ms-playwright\\chromium-1248\\chrome-win64\\chrome.exe", timeout: 90000 });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Runtime.enable");
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto("http://127.0.0.1:8765/index.html?v=" + Date.now(), { waitUntil: "commit", timeout: 15000 }).catch(() => { });
await page.waitForTimeout(5500);
async function js(expr) {
  const ev = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (ev.exceptionDetails) return "EXC:" + String(ev.exceptionDetails.exception?.description || ev.exceptionDetails.text).slice(0, 170);
  return ev.result.value;
}
// instrumentation once at startup: wrap registerGame captures into window.__DEFS
await js(`(function(){
  window.__DEFS={};
  if(window.PD&&window.PD.FX&&window.PD.FX.NEW_GAMES){
    // NEW_GAMES exists already (extras.js registerGame)
    var ng=window.PD.FX.NEW_GAMES;
    for(var k in ng)window.__DEFS[k]=ng[k];
  }
  // patch future registrations via GAME_HOOKS re-registration timing: poll
  window.__captureTimer=setInterval(function(){
    var ng=window.PD&&window.PD.FX&&window.PD.FX.NEW_GAMES||{};
    for(var k in ng)window.__DEFS[k]=ng[k];
  },400);
})()`);
const results = [];
for (const id of process.argv[2].split(",")) {
  await js(`try{window.showMenu()}catch(e){}`);
  await page.waitForTimeout(200);
  await js(`try{window.openGame('${id}')}catch(e){}`);
  await page.waitForTimeout(1500);
  const probe = await js(`(function(){
    return new Promise(function(res){
      var def=window.__DEFS['${id}'];
      if(!def)return res(JSON.stringify({noDef:1,captured:Object.keys(window.__DEFS).length}));
      var cv=document.getElementById('${id}Cv');
      var hs=[];
      var iv=setInterval(function(){try{var x=cv.getContext('2d');var d=x.getImageData(0,0,900,500).data;var s2=0;for(var i=0;i<d.length;i+=4013)s2+=d[i];hs.push(s2);}catch(e){hs.push(-1)}},320);
      setTimeout(function(){clearInterval(iv);res(JSON.stringify({cvUniq:new Set(hs).size,cv:hs.slice(0,3),isOver:def.isOver?def.isOver():'?'}))},2100);
    });
  })()`);
  results.push(`${id}: ${String(probe).slice(0, 160)}`);
  console.log(results[results.length - 1]);
}
await browser.close();
process.exit(0);
