/* recheck: games the sweep flagged STATIC but should have strategies (2048, boxing, ski/long jump, rope, lava, marble, geometry) */
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
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Users\\timot\\AppData\\Local\\ms-playwright\\chromium-1248\\chrome-win64\\chrome.exe", timeout: 40000 });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Runtime.enable");
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto("http://127.0.0.1:8765/index.html?v=" + Date.now(), { waitUntil: "commit", timeout: 15000 }).catch(() => { });
await page.waitForTimeout(6000);
async function js(expr) {
  const ev = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true });
  if (ev.exceptionDetails) return "EXC:" + String(ev.exceptionDetails.exception?.description || ev.exceptionDetails.text).slice(0, 200);
  return JSON.stringify(ev.result.value);
}
await js(`window.setAIMode('both_ai')`);
const targets = process.argv[2] ? process.argv[2].split(",") : ["g2048Game", "boxingGame", "skijumpGame", "jumpGame", "ropeGame", "lavaescapeGame", "marbleGame", "geometryGame"];
for (const gid of targets) {
  await js(`try{window.showMenu()}catch(e){}`);
  await page.waitForTimeout(700);
  await js(`try{window.setAIMode('both_ai');window.openGame('${gid}')}catch(e){}`);
  await page.waitForTimeout(2600);   // countdown passes
  const snaps = [];
  const snapExpr = `(function(){
    var g=(window.PDX_GAME_STATE||{})['${gid}']||(window.PDX_GAME_STATE||{})['${gid.replace(/Game$/, "")}'];
    if(!g) return 'nopub';
    var probe=[];
    if(g.bx) probe=[Math.round(g.bx[1].x),Math.round(g.bx[1].hp),Math.round(g.bx[0].hp)];
    else if(g.bd) probe=JSON.stringify(g.bd[1]).slice(0,40);
    else if(g.st&&g.st[1]) probe=[g.st[1].ph||'',Math.round(g.st[1].x||0)];
    else if(g.pl&&g.pl[1]) probe=[Math.round(g.pl[1].x||0),Math.round(g.pl[1].y||0),(g.pl[1].h!==undefined?Math.round(g.pl[1].h):'')];
    else probe=Object.keys(g).slice(0,6).join(',');
    var sc=g.score?JSON.stringify(g.score):'-';
    return JSON.stringify(probe)+'|'+sc;
  })()`;
  for (let i = 0; i < 4; i++) {
    snaps.push(await js(snapExpr));
    await page.waitForTimeout(1100);
  }
  const uniq = new Set(snaps).size;
  const calls = await js(`(window.__STRAT_CALLS||{})['${gid}']`);
  console.log((uniq > 1 ? "LIVE  " : "STATIC") + " " + gid + " stratCalls=" + calls + "  [" + snaps.join(" → ") + "]");
}
await browser.close();
process.exit(0);
