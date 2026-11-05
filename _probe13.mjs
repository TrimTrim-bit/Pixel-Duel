/* probe13: does the live loop read g.I[1]? trap it */
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
await js(`window.setAIMode('off')`);
await js(`window.openGame('boxingGame')`);
await page.waitForTimeout(3200);
console.log("pre I:", await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];return JSON.stringify(g.I)})()`));
// trap reads on g.I[1]
await js(`(function(){
  var g=(window.PDX_GAME_STATE||{})['boxingGame'];
  window.__pr={r:0};
  var orig=g.I[1];
  Object.defineProperty(g.I,1,{get:function(){window.__pr.r++;return orig;},set:function(v){orig=v;},configurable:true});
})()`);
// press real key: game should read I[1] from readInputs — which REPLACES g.I entirely! g.I=[0,1].map(...) creates a NEW array each frame!
await page.keyboard.down("ArrowLeft");
await page.waitForTimeout(800);
console.log("I[1] reads while key held:", await js(`JSON.stringify(window.__pr)`));
console.log("x after:", await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];return Math.round(g.bx[1].x)})()`));
console.log("same I object? our trap survives:", await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];return !!Object.getOwnPropertyDescriptor(g.I,1)})()`));
await browser.close();
process.exit(0);
