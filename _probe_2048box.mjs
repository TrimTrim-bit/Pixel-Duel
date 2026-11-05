/* probe_2048box: what state do g2048Game and boxingGame publish? */
import path from "path";
import os from "os";
import fs from "fs";
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
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Users\\timot\\AppData\\Local\\ms-playwright\\chromium-1248\\chrome-win64\\chrome.exe", timeout: 30000 });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Runtime.enable");
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto("http://127.0.0.1:8765/index.html?v=" + Date.now(), { waitUntil: "commit", timeout: 15000 }).catch(() => { });
await page.waitForTimeout(5500);
async function js(expr) {
  const ev = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true });
  if (ev.exceptionDetails) return "EXC:" + String(ev.exceptionDetails.exception?.description || ev.exceptionDetails.text).slice(0, 250);
  return JSON.stringify(ev.result.value);
}
for (const gid of ["g2048Game", "boxingGame"]) {
  await js(`try{window.showMenu()}catch(e){}`);
  await page.waitForTimeout(300);
  await js(`try{window.setAIMode('both_ai');window.openGame('${gid}')}catch(e){}`);
  await page.waitForTimeout(2500);
  console.log(gid, "state:", await js(`(function(){
    var st=window.PDX_GAME_STATE||{};
    var found=[];
    for(var k in st){ if(k.toLowerCase().indexOf('2048')>=0||k.toLowerCase().indexOf('box')>=0) found.push(k); }
    var g=st['${gid}']||st['${gid.replace(/Game$/, '')}'];
    if(!g) return 'NO KEY; candidates='+found.join(',');
    var keys=Object.keys(g).slice(0,20).join(',');
    var bd=g.bd?('bd len='+(Array.isArray(g.bd)?g.bd.length+' rows, r1='+JSON.stringify(g.bd[1]).slice(0,60):('shape?'+typeof g.bd))):'no bd';
    var bx=g.bx?('bx len='+g.bx.length+' f1='+JSON.stringify({x:Math.round(g.bx[1]&&g.bx[1].x||0),y:Math.round(g.bx[1]&&g.bx[1].y||0),pu:g.bx[1]&&g.bx[1].pu})):'no bx';
    var stratCalls=(window.__STRAT_CALLS||{})['${gid}'];
    return 'keys='+keys+' | '+bd+' | '+bx+' | stratCalls='+stratCalls;
  })()`));
  // second sample to see movement/change
  await page.waitForTimeout(2000);
  console.log(gid, "later:", await js(`(function(){
    var g=(window.PDX_GAME_STATE||{})['${gid}']||(window.PDX_GAME_STATE||{})['${gid.replace(/Game$/, "")}'];
    if(!g) return 'gone';
    var out={};
    if(g.bd) out.bdRow=JSON.stringify(g.bd[1]).slice(0,50);
    if(g.bx) out.bx1=[Math.round(g.bx[1]&&g.bx[1].x||0),Math.round(g.bx[1]&&g.bx[1].y||0)].join(',');
    out.stratCalls=(window.__STRAT_CALLS||{})['${gid}'];
    out.score=g.score?JSON.stringify(g.score).slice(0,40):undefined;
    return JSON.stringify(out);
  })()`));
}
await browser.close();
process.exit(0);
