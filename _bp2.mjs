/* _bp2.mjs — probe AI behavior of DOM-board games (ttt, connect, chess etc.)
   Usage: node _bp2.mjs "ttt,connectGame,boxGame,bd21Game,solitaireGame,chessGame" */
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
await js(`try{window.setAIMode&&window.setAIMode('p2_ai')}catch(e){}`);
const targets = process.argv[2].split(",");
for (const id of targets) {
  await js(`try{window.showMenu()}catch(e){}`);
  await page.waitForTimeout(300);
  const open = await js(`(function(){try{window.openGame('${id}');var sc=document.querySelector('.screen.active');return (sc?sc.id:'?')+'|cards:'+(window.PDX_AI?window.PDX_AI.mode:'nomode');}catch(e){return 'ERR:'+e.message}})()`);
  await page.waitForTimeout(1500);
  // board games: DOM children — click a cell as P1 then see if AI responds
  const before = await js(`(function(){var s=document.querySelector('.screen.active');if(!s)return 'noscreen';var txt=s.textContent.replace(/\\s+/g,' ').slice(0,140);var nb=s.querySelectorAll('.cell,.board-cell,.sq,td,button[id*="ell"]').length;return JSON.stringify({txt,nb});})()`);
  let clicked = false;
  try {
    await js(`(function(){
      var s=document.querySelector('.screen.active');
      var c=[...s.querySelectorAll('.cell,.board-cell,.sq,td,[id*="ell"]')].filter(function(x){return !x.textContent.trim()});
      if(c.length){var r=c[Math.floor(Math.random()*c.length)];r.click();return 'clicked';}return 'noclick';
    })()`);
    clicked = true;
  } catch (e) { }
  await page.waitForTimeout(1600);
  const after = await js(`(function(){var s=document.querySelector('.screen.active');if(!s)return 'noscreen';return s.textContent.replace(/\\s+/g,' ').slice(0,140);})()`);
  const changed = typeof after === "string" && typeof before === "string" &&
    JSON.parse((before.match(/\{[\s\S]*\}/) || ["{}"])[0]).txt !== after;
  console.log(`${id}: open=${open} pre=${(before.match(/\{[\s\S]*\}/) || ["?"])[0].slice(0, 90)} changed=${changed}`);
}
await browser.close();
process.exit(0);
