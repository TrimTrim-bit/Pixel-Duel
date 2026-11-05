/* probe10: real ArrowLeft keydown — does the P2 boxer respond? */
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
await js(`window.openGame('boxingGame')`);
await page.waitForTimeout(3500);
console.log("x before:", await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];return Math.round(g.bx[1].x)})()`));
// press and hold ArrowLeft for 1.2s via CDP (real input)
await page.keyboard.down("ArrowLeft");
await page.waitForTimeout(1200);
console.log("x after hold:", await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];return Math.round(g.bx[1].x)+' keys.arrowleft='+(keys.arrowleft!==undefined?keys.arrowleft:'nokeysvar')})()`));
await page.keyboard.up("ArrowLeft");
// how many registrations? count screens with id boxingGame
console.log("screens:", await js(`document.querySelectorAll('.screen[id="boxingGame"]').length`));
console.log("GAMES gen:", await js(`typeof GAME_GEN!=='undefined'?JSON.stringify({boxing:GAME_GEN['boxingGame']}):'nogen'`));
await browser.close();
process.exit(0);
