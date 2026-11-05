/* probe14: patch the actual def.update of the LIVE boxing game and force I[1] */
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
console.log("before:", await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];return Math.round(g.bx[1].x)})()`));
/* with AI on, the PRE_UPDATE hook (which runs inside def.update, after
   readInputs rebuilt g.I) should write the plan into the FRESH array */
await js(`window.setAIMode('both_ai')`);
// hold real key via CDP for 2s and watch if AI-mode writing on the fresh I works:
await js(`window.setAIMode('both_ai')`);
await page.waitForTimeout(2500);
console.log("with AI on:", await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];return JSON.stringify({x:Math.round(g.bx[1].x),I:JSON.stringify(g.I[1])})})()`));
await page.waitForTimeout(2000);
console.log("later:", await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];return JSON.stringify({x:Math.round(g.bx[1].x)})})()`));
await browser.close();
process.exit(0);
