/* probe15: check whether PRE_UPDATE is actually called during a frame where I was rebuilt.
   Hook via state_bridge's own wrapper identity: sample I-array identity every 50ms. */
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
await page.waitForTimeout(6000);
async function js(expr) {
  const ev = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (ev.exceptionDetails) return "EXC:" + String(ev.exceptionDetails.exception?.description || ev.exceptionDetails.text).slice(0, 250);
  return JSON.stringify(ev.result.value);
}
await js(`window.setAIMode('both_ai')`);
await js(`window.openGame('boxingGame')`);
await page.waitForTimeout(3200);
/* Determine WHO writes I[1].l=1: is it the aiLoop (pre-update, gets wiped) or PRE_UPDATE (post-rebuild)?
   Test: freeze the array — readInputs creates a new array each frame. If AI wrote into the fresh one,
   the published g.I reference would change every frame. Track identity of g.I. */
console.log("I identity churn:", await js(`new Promise(function(res){
  var ids=[],n=0;
  var iv=setInterval(function(){
    n++;
    var g=(window.PDX_GAME_STATE||{})['boxingGame'];
    if(g&&g.I) ids.push(g.I.__tag||(g.I.__tag='T'+ids.length));
    if(n>=24){clearInterval(iv);res('distinct I arrays over 1.2s: '+new Set(ids).size+'  tags:'+ids.slice(-4).join(','));}
  },50);
})`));
/* Also: does anything ever see I[1].pa=1 (the punch flag)? Sample rapidly for 3s */
console.log("punch observed:", await js(`new Promise(function(res){
  var pa=0,frames=0;
  var iv=setInterval(function(){
    var g=(window.PDX_GAME_STATE||{})['boxingGame'];
    if(g&&g.I&&g.I[1]){frames++;if(g.I[1].pa)pa++;}
  },33);
  setTimeout(function(){clearInterval(iv);res('pa frames='+pa+'/'+frames);},3000);
})`));
await browser.close();
process.exit(0);
