/* probe9: manually force I[1] and check bl/hit/pu + x response */
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
await page.waitForTimeout(3500);
/* manual: hold left via real keyboard event (the game listens to keys) */
console.log("before:", await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];return JSON.stringify({x:Math.round(g.bx[1].x),bl:g.bx[1].bl?1:0,I:JSON.stringify(g.I[1])})})()`));
/* install a frame-hook: every rAF set I[1].l=1 BEFORE update by wrapping FX loop is hard; instead patch def via NEW registration is impossible. Use rAF loop with high priority: set every frame continuously. */
await js(`(function(){
  window.__force=(function f(){requestAnimationFrame(f);var g=(window.PDX_GAME_STATE||{})['boxingGame'];if(g&&g.I){g.I[1].l=1;g.I[1].r=0;}})();
})()`);
await page.waitForTimeout(1500);
console.log("forced-left 1.5s:", await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];return JSON.stringify({x:Math.round(g.bx[1].x),I:JSON.stringify(g.I[1])})})()`));
await page.waitForTimeout(1500);
console.log("forced-left 3s:", await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];return JSON.stringify({x:Math.round(g.bx[1].x)})})()`));
console.log("AI mode off so nothing else writes");
await browser.close();
process.exit(0);
