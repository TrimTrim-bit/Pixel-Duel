/* _ai_sweep2: for the STATIC list — diff FULL serialized game state over windows.
   alive  = serialized state changes over time (game loop running, AI acting on something)
   frozen = state identical every sample (game loop dead or never started)
   Also records top-level keys so we can see where AI entities live. */
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
await page.waitForTimeout(5500);
async function js(expr) {
  const ev = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true });
  if (ev.exceptionDetails) return "EXC:" + String(ev.exceptionDetails.exception?.description || ev.exceptionDetails.text).slice(0, 140);
  return ev.result.value;
}
await js(`window.setAIMode('both_ai')`);
const ids = JSON.parse(await js(`JSON.stringify((window.PDX_CATALOG||[]).map(g=>g.id))`));
const LIST = ids.slice();
const out = [];
for (const id of LIST) {
  await js(`try{window.showMenu()}catch(e){}`);
  await page.waitForTimeout(300);
  await js(`try{window.openGame('${id}')}catch(e){}`);
  await page.waitForTimeout(2200);
  const snap = `(function(){try{
    var st=window.PDX_GAME_STATE||{};var s=st['${id}']||st['${id.replace(/Game$/,'')}'];
    if(!s)return JSON.stringify({nop:1});
    var keys=Object.keys(s).filter(function(k){return k!=='I'&&k!=='I0'&&typeof s[k]!=='function'}).slice(0,30);
    var ser='';
    try{ser=JSON.stringify(s,function(k,v){return typeof v==='function'?undefined:(k==='I'?undefined:(typeof v==='number'?Math.round(v*10)/10:v));});}catch(e){ser='SERERR'}
    return JSON.stringify({k:keys,h:ser.length+':'+(ser.split('').reduce(function(a,c){return((a*31)+c.charCodeAt(0))%999983}),0)});
  }catch(e){return JSON.stringify({err:e.message})}})()`;
  const h1 = JSON.parse(await js(snap));
  await page.waitForTimeout(1000);
  const h2 = JSON.parse(await js(snap));
  await page.waitForTimeout(1000);
  const h3 = JSON.parse(await js(snap));
  const hashes = [h1.h, h2.h, h3.h].filter(Boolean);
  const uniq = new Set(hashes).size;
  const verdict = h1.nop ? "NOPUB" : h1.err ? "ERR" : uniq >= 2 ? "alive" : "frozen";
  out.push(`${verdict.padEnd(7)} ${id.padEnd(26)} keys=${(h1.k || []).join(",").slice(0, 90)}`);
  console.log(out[out.length - 1]);
  await js(`try{window.showMenu()}catch(e){}`);
}
fs.writeFileSync("_sweep2_log.txt", out.join("\n"));
await browser.close();
process.exit(0);
