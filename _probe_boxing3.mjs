/* probe5: is the g we see the one the running loop mutates? sample x + I over time */
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
await page.waitForTimeout(2200);
// install a probe INSIDE the game: monkeypatch boxing's update by re-wrapping the published g is too late.
// Instead: sample identity + x + I at 200ms intervals
const samples = [];
for (let i = 0; i < 12; i++) {
  const s = await js(`(function(){
    var g=(window.PDX_GAME_STATE||{})['boxingGame'];
    if(!g||!g.bx) return 'nopub';
    var I=g.I&&g.I[1]||{};
    return g.__id+':x'+Math.round(g.bx[1].x)+':hp'+Math.round(g.bx[1].hp)+'/'+Math.round(g.bx[0].hp)+':I(l'+(I.l||0)+'r'+(I.r||0)+'pa'+(I.pa||0)+')';
  })()`);
  samples.push(s);
  await page.waitForTimeout(320);
}
console.log(samples.join("\n"));
// identity: does __id change? inject one
await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];if(g)g.__id='A'+Math.floor(Math.random()*999);})()`);
await page.waitForTimeout(400);
console.log("after 0.4s id still:", await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];return g?g.__id:'gone';})()`));
await browser.close();
process.exit(0);
