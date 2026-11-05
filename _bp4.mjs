/* _bp4.mjs — find where a game's ACTUAL live g lives when PDX_GAME_STATE has
   no entry for its catalog id (registerGame/NEW_GAMES route or renamed ids).
   Scans PDX_GAME_STATE values for objects whose constructor/internals match,
   plus checks NEW_GAMES.
   Usage: node _bp4.mjs warlordsGame */
import path from "path"; import os from "os"; import fs from "fs";
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
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Users\\timot\\AppData\\Local\\ms-playwright\\chromium-1248\\chrome-win64\\chrome.exe", timeout: 40000 });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Runtime.enable");
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto("http://127.0.0.1:8765/index.html?v=" + Date.now(), { waitUntil: "commit", timeout: 15000 }).catch(() => { });
await page.waitForTimeout(5500);
async function js(expr) {
  const ev = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (ev.exceptionDetails) return "EXC:" + String(ev.exceptionDetails.exception?.description || ev.exceptionDetails.text).slice(0, 200);
  return ev.result.value;
}
await js(`try{window.setAIMode('both_ai')}catch(e){}`);
const id = process.argv[2];
await js(`try{window.showMenu()}catch(e){}`);
await js(`try{window.openGame('${id}')}catch(e){}`);
await page.waitForTimeout(2000);
const info = await js(`(function(){
  var out={};
  out.active=(document.querySelector('.screen.active')||{}).id;
  out.hasSec=!!document.getElementById('${id}');
  out.cvEl=document.getElementById('${id}Cv')?'yes':'no';
  var st=window.PDX_GAME_STATE||{};
  out.gsKeys=Object.keys(st).slice(0,60);
  out.gsHas=out.gsKeys.indexOf('${id}')>=0||out.gsKeys.indexOf('${id.replace(/Game$/, "")}')>=0;
  out.newGames=window.NEW_GAMES?Object.keys(window.NEW_GAMES).slice(0,60):'no-access';
  out.fxFree=window.PD&&window.PD.FX?Object.keys(window.PD.FX).slice(0,20).join(','):'';
  return JSON.stringify(out);
})()`);
console.log(id, "=>", info);
await browser.close();
process.exit(0);
