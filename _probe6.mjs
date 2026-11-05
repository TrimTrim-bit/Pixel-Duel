/* probe6: why nopub for boxing/jump/lavaescape/geometry — check PD.micro wrapper chain intact */
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
console.log("cat ids:", await js(`JSON.stringify((window.PDX_CATALOG||[]).filter(g=>['boxingGame','jumpGame','lavaescapeGame','geometryGame'].includes(g.id)))`));
for (const gid of ["boxingGame", "jumpGame", "lavaescapeGame", "geometryGame"]) {
  await js(`try{window.showMenu()}catch(e){}`);
  await page.waitForTimeout(300);
  const open = await js(`(function(){try{window.openGame('${gid}');return 'ok '+document.querySelector('.screen.active').id}catch(e){return 'ERR:'+e.message}})()`);
  await page.waitForTimeout(2600);
  console.log(gid, "open:", open, "| keys:", await js(`(function(){var st=window.PDX_GAME_STATE||{};var k=Object.keys(st);return k.filter(x=>x.indexOf('${gid.slice(0,5)}')===0).join(',')||'none'})()`));
}
await browser.close();
process.exit(0);
