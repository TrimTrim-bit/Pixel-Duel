/* _bp8.mjs — harness for engine "g"-returned games: openGame→open→GAME_HOOKS→wait→evaluate "uniq change on g" BUT through engine hook: instead we read PDX_GAME_STATE[<full>] which engine's own micro bridge publishes (bridge is installed in ai_universal2/state_bridge). We test slow games: use ~9 samples over 4s because 'fin' phases can be static.
   Usage: node _bp8.mjs "id1,id2,..."
*/
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
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Users\\timot\\AppData\\Local\\ms-playwright\\chromium-1248\\chrome-win64\\chrome.exe", timeout: 90000 });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Runtime.enable");
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto("http://127.0.0.1:8765/index.html?v=" + Date.now(), { waitUntil: "commit", timeout: 15000 }).catch(() => { });
await page.waitForTimeout(5500);
async function js(expr) {
  const ev = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (ev.exceptionDetails) return "EXC:" + String(ev.exceptionDetails.exception?.description || ev.exceptionDetails.text).slice(0, 170);
  return ev.result.value;
}
await js(`try{window.setAIMode('both_ai')}catch(e){}`);
for (const id of process.argv[2].split(",")) {
  await js(`try{window.showMenu()}catch(e){}`);
  await page.waitForTimeout(300);
  await js(`try{window.openGame('${id}')}catch(e){}`);
  await page.waitForTimeout(2500);
  const probe = await js(`(function(){
    return new Promise(function(res){
      var st=window.PDX_GAME_STATE||{};var s=st['${id}']||st['${id.replace(/Game$/,'')}'];
      if(!s)return res(JSON.stringify({nop:1}));
      var ser=function(){try{return JSON.stringify(s,function(k,v){return typeof v==='function'||k==='I'?undefined:(typeof v==='number'?Math.round(v*10)/10:v);});}catch(e){return 'SE'}};
      var h=[];
      var iv=setInterval(function(){var q=ser();h.push(q.length+':'+q.split('').reduce(function(a,c){return((a*31)+c.charCodeAt(0))%999983},0));},450);
      setTimeout(function(){clearInterval(iv);res(JSON.stringify({uniq:new Set(h).size,samples:h.length,top:Object.keys(s).filter(function(k){return typeof s[k]!=='function'}).slice(0,24).join(',')}));},4500);
    });
  })()`);
  console.log(`${id}: ${String(probe).slice(0, 220)}`);
}
await browser.close();
process.exit(0);
