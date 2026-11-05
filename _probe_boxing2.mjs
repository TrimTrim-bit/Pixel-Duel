/* probe3: boxing + 2048 AI behavior with fixed page */
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

/* BOXING */
await js(`window.openGame('boxingGame')`);
await page.waitForTimeout(2200);
const b1 = await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];if(!g||!g.bx)return 'nopub';var b=g.bx[1];return Math.round(b.x)+','+Math.round(b.hp)+'/'+g.bx[0].hp})()`);
await page.waitForTimeout(3000);
const b2 = await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];if(!g||!g.bx)return 'nopub';var b=g.bx[1];return Math.round(b.x)+','+Math.round(b.hp)+'/'+g.bx[0].hp})()`);
await page.waitForTimeout(3000);
const b3 = await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];if(!g||!g.bx)return 'nopub';var b=g.bx[1];return Math.round(b.x)+','+Math.round(b.hp)+'/'+g.bx[0].hp})()`);
console.log("BOXING samples:", b1, "->", b2, "->", b3);
console.log("BOXING stratCalls:", await js(`(window.__STRAT_CALLS||{}).boxingGame`));
await js(`try{window.showMenu()}catch(e){}`);

/* 2048 */
await page.waitForTimeout(400);
await js(`window.openGame('g2048Game')`);
await page.waitForTimeout(2200);
const g1 = await js(`(function(){var g=(window.PDX_GAME_STATE||{})['g2048Game'];if(!g||!g.bd)return 'nopub';return JSON.stringify(g.bd[1])})()`);
await page.waitForTimeout(3000);
const g2 = await js(`(function(){var g=(window.PDX_GAME_STATE||{})['g2048Game'];if(!g||!g.bd)return 'nopub';return JSON.stringify(g.bd[1])})()`);
await page.waitForTimeout(4000);
const g3 = await js(`(function(){var g=(window.PDX_GAME_STATE||{})['g2048Game'];if(!g||!g.bd)return 'nopub';return JSON.stringify(g.bd[1])+' sc='+JSON.stringify(g.score)})()`);
console.log("2048 rows(P2):", g1, "->", g2, "->", g3);
console.log("2048 stratCalls:", await js(`(window.__STRAT_CALLS||{}).g2048Game`));
await browser.close();
process.exit(0);
