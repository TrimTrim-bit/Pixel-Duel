/* _bp3.mjs — smarter probe for board/turn games: uniq states + entity x/y motion
   sampling that handles st[] and chess-style boards.
   Usage: node _bp3.mjs "wordchainGame,warlordsGame,skijumpGame,..." */
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
const errs = [];
cdp.on("Runtime.exceptionThrown", e => errs.push(String(e.exceptionDetails?.exception?.description || e.exceptionDetails?.text).slice(0, 130)));
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
  errs.length = 0;
  await js(`try{window.showMenu()}catch(e){}`);
  await page.waitForTimeout(250);
  await js(`try{window.openGame('${id}')}catch(e){}`);
  await page.waitForTimeout(2000);
  const probe = await js(`(function(){
    return new Promise(function(res){
      var st=window.PDX_GAME_STATE||{};var s=st['${id}']||st['${id.replace(/Game$/, '')}'];
      if(!s)return res(JSON.stringify({nop:1}));
      var ser=function(){try{return JSON.stringify(s,function(k,v){if(typeof v==='function'||k==='I')return undefined;if(typeof v==='number')return Math.round(v*10)/10;return v;});}catch(e){return 'SE'}};
      var h=[];for(var i=0;i<7;i++){h.push(ser().length+':'+(ser().split('').reduce(function(a,c){return((a*31)+c.charCodeAt(0))%999983},0)));if(i<6){/*wait*/}}
      var done=false;
      var iv=setInterval(function(){
        h.shift();h.push(ser().length+':'+(ser().split('').reduce(function(a,c){return((a*31)+c.charCodeAt(0))%999983},0)));
      },400);
      setTimeout(function(){clearInterval(iv);res(JSON.stringify({uniq:new Set(h).size,top:Object.keys(s).filter(function(k){return typeof s[k]!=='function'}).slice(0,30).join(',')}))},3000);
    });
  })()`);
  console.log(`${id}: ${String(probe).slice(0, 220)}`);
  if (errs.length) console.log("   errs:", errs.slice(0, 2).join(" || "));
}
await browser.close();
process.exit(0);
