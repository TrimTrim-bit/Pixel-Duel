/* probe12: what id does boxing actually register under? list PDX_GAME_STATE keys after opening */
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
await page.waitForTimeout(3200);
console.log("all keys containing 'box':", await js(`(function(){var k=Object.keys(window.PDX_GAME_STATE||{});return k.filter(x=>/box/i.test(x)).join(',')})()`));
console.log("activeScreen:", await js(`(typeof activeScreen!=='undefined')?activeScreen:window.activeScreen`));
console.log("bx x:", await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];return g&&g.bx?Math.round(g.bx[1].x):'?'})()`));
// try writing via BOTH paths: aiLoop's g (fetched by activeScreen) — but which g does the LIVE loop use?
// definitive test: register a getter trap on bx[1].x
await js(`(function(){
  var g=(window.PDX_GAME_STATE||{})['boxingGame'];
  window.__probe={};
  var orig=g.bx[1];
  Object.defineProperty(g.bx,1,{get:function(){window.__probe.reads=(window.__probe.reads||0)+1;return orig;},set:function(v){orig=v;},configurable:true});
})()`);
await page.waitForTimeout(1200);
console.log("bx[1] reads in 1.2s:", await js(`JSON.stringify(window.__probe)`));
await browser.close();
process.exit(0);
