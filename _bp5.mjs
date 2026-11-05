/* _bp5.mjs — probe via FX.NEW_GAMES: is the game running (update called,
   state mutating), and what does its update/draw look like (game-level).
   Usage: node _bp5.mjs "warlordsGame,skijumpGame,catmouseGame,wordchainGame" */
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
      var def=(window.PD&&window.PD.FX&&window.PD.FX.NEW_GAMES||{})['${id}'];
      if(!def)return res(JSON.stringify({noDef:1,keys:Object.keys(window.PD&&window.PD.FX&&window.PD.FX.NEW_GAMES||{}).length}));
      var g=def.g||def.state||null;
      if(!g){ // engine-style: def.reset/update/draw closures, state hidden; wrap update
        var calls=0,muts=0,last='';
        var ou=def.update;
        def.update=function(){calls++;try{var h=JSON.stringify(g);}catch(e){}
          return ou.apply(this,arguments);};
        // we can't see g directly; instead count render diffs on canvas
        var cv=document.getElementById('${id}Cv');var hs=[];
        var iv=setInterval(function(){try{var x=cv.getContext('2d');var d=x.getImageData(0,0,900,500).data;var s2=0;for(var i=0;i<d.length;i+=4009)s2+=d[i];hs.push(s2);}catch(e){hs.push(-1)}},300);
        setTimeout(function(){clearInterval(iv);res(JSON.stringify({cvUniq:new Set(hs).size,cv:hs.slice(0,4)}))},2100);
        return;
      }
      var ser=function(){try{return JSON.stringify(g,function(k,v){if(typeof v==='function'||k==='I')return undefined;if(typeof v==='number')return Math.round(v*10)/10;return v;});}catch(e){return 'SE'}};
      var h=[];
      var iv=setInterval(function(){h.push(ser().length+':'+(ser().split('').reduce(function(a,c){return((a*31)+c.charCodeAt(0))%999983},0)));},380);
      setTimeout(function(){clearInterval(iv);res(JSON.stringify({gUniq:new Set(h).size,top:Object.keys(g).filter(function(k){return typeof g[k]!=='function'}).slice(0,30).join(',')}))},2300);
    });
  })()`);
  console.log(`${id}: ${String(probe).slice(0, 220)}${errs.length ? "  errs:" + errs.slice(0, 2).join("||") : ""}`);
}
await browser.close();
process.exit(0);
