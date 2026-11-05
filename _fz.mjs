/* _fz.mjs — deep probe of FROZEN game ids: does the g object mutate at all?
   Also captures pageerror + whether the canvas is actually drawing (rAF alive).
   Usage: node _fz.mjs "tetrisGame,froggerGame,breakoutGame" */
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
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Users\\timot\\AppData\\Local\\ms-playwright\\chromium-1248\\chrome-win64\\chrome.exe", timeout: 40000 });
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
  if (ev.exceptionDetails) return "EXC:" + String(ev.exceptionDetails.exception?.description || ev.exceptionDetails.text).slice(0, 170);
  return ev.result.value;
}
await js(`try{window.setAIMode('both_ai')}catch(e){}`);
for (const id of process.argv[2].split(",")) {
  errs.length = 0;
  await js(`try{window.showMenu()}catch(e){}`);
  await page.waitForTimeout(250);
  await js(`try{window.openGame('${id}')}catch(e){}`);
  await page.waitForTimeout(1800);
  const probe = await js(`(function(){
    return new Promise(function(res){
      var st=window.PDX_GAME_STATE||{};var s=st['${id}']||st['${id.replace(/Game$/, '')}'];
      if(!s)return res('NOPUB screen='+(document.querySelector('.screen.active')||{}).id);
      var hashes=[],gTicks=window.__GT||0;
      var iv=setInterval(function(){
        try{var h='';try{h=(JSON.stringify(s,function(k,v){return typeof v==='function'||k==='I'?undefined:(typeof v==='number'?Math.round(v*10)/10:v)})||'').length+':'+((JSON.stringify(s)||'').split('').reduce(function(a,c){return((a*31)+c.charCodeAt(0))%999983},0));}catch(e){h='SE';}
        hashes.push(h);
      },400);
      setTimeout(function(){clearInterval(iv);
        // canvas moving?
        var cv=document.getElementById('${id}Cv');var cd=0;
        try{if(cv){var x=cv.getContext('2d');var d=x.getImageData(0,0,900,500).data;for(var i=0;i<d.length;i+=997)cd+=d[i];}}catch(e){cd=-1}
        window.__CVD=cd; window.__CVH=[];
        var iv2=setInterval(function(){try{var x2=cv.getContext('2d');var d2=x2.getImageData(0,0,900,500).data;var s2=0;for(var i=0;i<d2.length;i+=997)s2+=d2[i];window.__CVH.push(s2);}catch(e){window.__CVH.push(-1)}},350);
        setTimeout(function(){clearInterval(iv2);res(JSON.stringify({uniq:new Set(hashes).size,n:hashes.length,cv:window.__CVH,top:Object.keys(s).filter(function(k){return typeof s[k]!=='function'}).slice(0,28).join(',')}));},1300);
      },1400);
    });
  })()`);
  let p = {}; try { p = JSON.parse(probe); } catch (e) { p = { raw: probe }; }
  const cvMoving = Array.isArray(p.cv) && new Set(p.cv).size > 1;
  console.log(`${id}: stateUniq=${p.uniq} canvasMoves=${cvMoving}${Array.isArray(p.cv) ? " [" + p.cv.slice(0, 4).join(",") + "]" : ""} top=${(p.top || "").slice(0, 100)}`);
  if (errs.length) console.log("   errs:", errs.slice(0, 2).join(" || "));
}
await browser.close();
process.exit(0);
