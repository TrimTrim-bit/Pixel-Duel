/* _bp7.mjs — DIAGNOSE dead games: does FX.NEW_GAMES[id].update mutate its g?
   We re-wrap reset to capture the g via def.reset call (engine calls reset in
   registerGame with def.reset closure). Instead: hook JSON.stringify on g via
   Error stack probing is fragile — instead detect if update() itself runs
   (wrap def.update and count calls).
   Usage: node _bp7.mjs "catmouseGame,gravhockeyGame,..." */
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
const errs = [];
cdp.on("Runtime.exceptionThrown", e => errs.push(String(e.exceptionDetails?.exception?.description || e.exceptionDetails?.text).slice(0, 130)));
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto("http://127.0.0.1:8765/index.html?v=" + Date.now(), { waitUntil: "commit", timeout: 15000 }).catch(() => { });
await page.waitForTimeout(5500);
async function js(expr) {
  const ev = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (ev.exceptionDetails) return "EXC:" + String(ev.exceptionDetails.exception?.description || ev.exceptionDetails.text).slice(0, 200);
  return ev.result.value;
}
await js(`(function(){
  window.__DEFS={};
  window.__cap=setInterval(function(){
    var ng=window.PD&&window.PD.FX&&window.PD.FX.NEW_GAMES||{};
    for(var k in ng){window.__DEFS[k]=ng[k];}
  },300);
})()`);
await js(`try{window.setAIMode('both_ai')}catch(e){}`);
for (const id of process.argv[2].split(",")) {
  errs.length = 0;
  await js(`try{window.showMenu()}catch(e){}`);
  await page.waitForTimeout(200);
  await js(`try{window.openGame('${id}')}catch(e){}`);
  await page.waitForTimeout(1400);
  const probe = await js(`(function(){
    return new Promise(function(res){
      var def=window.__DEFS['${id}'];
      if(!def)return res(JSON.stringify({noDef:1}));
      // wrap update to count calls and capture g by hooking 'this'
      var calls=0,err=null;
      var ou=def.update;
      def.update=function(g,dt){calls++;window.__LASTG=g;try{return ou.call(this,g,dt);}catch(e){err=String(e.message).slice(0,120);throw e;}};
      setTimeout(function(){
        var g=window.__LASTG;
        var gser='';
        if(g){try{var s1=JSON.stringify(g,function(k,v){return typeof v==='function'||k==='I'?undefined:(typeof v==='number'?Math.round(v*10)/10:v)});gser=s1;}catch(e){gser='SE'}}
        res(JSON.stringify({calls,err,gKeys:g?Object.keys(g).filter(function(k){return typeof g[k]!=='function'}).slice(0,26).join(','):'',gserLen:gser.length}));
      },1200);
    });
  })()`);
  console.log(`${id}: ${String(probe).slice(0, 300)}${errs.length ? " errs:" + errs.slice(0, 2).join("||") : ""}`);
}
await browser.close();
process.exit(0);
