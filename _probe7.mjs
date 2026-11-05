/* probe7: duplicate registrations + g identity churn for boxing/2048 */
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
// track identity churn of the published g for 2s
console.log("identity churn:", await js(`new Promise(res=>{
  var seen=new Set(),n=0;
  var iv=setInterval(function(){
    n++;
    var g=(window.PDX_GAME_STATE||{})['boxingGame'];
    if(g) seen.add(g);
    if(n>=20){clearInterval(iv);res('distinct g objects in 2s: '+seen.size);}
  },100);
})`));
console.log("mode:", await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];return g?g.mode:'nopub'})()`));
console.log("screen active:", await js(`document.querySelector('.screen.active').id`));
console.log("canvas exists:", await js(`!!document.getElementById('boxingGameCv')`));
console.log("msg text:", await js(`(function(){var m=document.getElementById('boxingMsg');return m?m.textContent:'none'})()`));
console.log("t (frames):", await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];return g?g.t:'-'})()`));
await page.waitForTimeout(1000);
console.log("t after 1s:", await js(`(function(){var g=(window.PDX_GAME_STATE||{})['boxingGame'];return g?g.t:'-'})()`));
await browser.close();
process.exit(0);
