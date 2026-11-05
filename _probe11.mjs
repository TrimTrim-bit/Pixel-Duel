/* probe11: count PRE_UPDATE invocations + what it writes for boxing */
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
  const ev = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true });
  if (ev.exceptionDetails) return "EXC:" + String(ev.exceptionDetails.exception?.description || ev.exceptionDetails.text).slice(0, 250);
  return JSON.stringify(ev.result.value);
}
await js(`window.setAIMode('both_ai')`);
await js(`window.openGame('boxingGame')`);
await page.waitForTimeout(3000);
// wrap PRE_UPDATE with a counter
await js(`(function(){
  var orig=window.PDX_AI_PRE_UPDATE;
  window.__PU={calls:0,wrote:0,self:0};
  window.PDX_AI_PRE_UPDATE=function(id,g,dt){
    window.__PU.calls++;
    if(!g)return;
    if(!g.I||g.I.length<2)return;
    var before=g.bx?g.bx[1].x:-1;
    orig(id,g,dt);
    if(g.bx&&g.bx[1].x!==before)window.__PU.wrote++;
    if(window.__STRAT_CALLS&&window.__STRAT_CALLS[id])window.__PU.self=window.__STRAT_CALLS[id];
  };
})()`);
await page.waitForTimeout(2000);
console.log("PU:", await js(`JSON.stringify(window.__PU)`));
console.log("micro wrapper chain len:", await js(`(function(){var s=window.PD.micro.toString();return s.slice(0,120)})()`));
await browser.close();
process.exit(0);
