/* probe16: definitive — does state_bridge's wrapper run for boxing? monkeypatch console/time */
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
/* Count PRE_UPDATE calls per second AND whether it happens before or after I is rebuilt.
   Tag each fresh I array with a counter; PRE_UPDATE runs orig. Then in wrapper, check tag */
await js(`(function(){
  window.__cnt={pu:0, newI:0};
  var orig=window.PDX_AI_PRE_UPDATE;
  window.PDX_AI_PRE_UPDATE=function(id,g,dt){ window.__cnt.pu++; return orig(id,g,dt); };
  // also patch readInputs indirectly: we can't. Instead count how often g.I identity changes:
  var lastI=null;
  var iv=setInterval(function(){
    var g=(window.PDX_GAME_STATE||{})['boxingGame'];
    if(g&&g.I&&g.I!==lastI){window.__cnt.newI++;lastI=g.I;}
  },0);
  setTimeout(function(){clearInterval(iv);},4000);
})()`);
await page.waitForTimeout(4500);
console.log("4s window:", await js(`JSON.stringify(window.__cnt)`));
await browser.close();
process.exit(0);
