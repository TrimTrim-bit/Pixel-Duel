/* _bp: browser probe for a list of game ids — nopublish/alive/frozen + keys
   Usage: node _bp.mjs <id,id,...> */
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
const errors = [];
page.on("pageerror", e => errors.push(String(e).slice(0, 160)));
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto("http://127.0.0.1:8765/index.html?v=" + Date.now(), { waitUntil: "commit", timeout: 15000 }).catch(() => { });
await page.waitForTimeout(5500);
async function js(expr) {
  const ev = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true });
  if (ev.exceptionDetails) return "EXC:" + String(ev.exceptionDetails.exception?.description || ev.exceptionDetails.text).slice(0, 200);
  return ev.result.value;
}
const targets = process.argv[2].split(",");
for (const id of targets) {
  await js(`try{window.showMenu()}catch(e){}`);
  await page.waitForTimeout(300);
  const opened = await js(`(function(){try{window.openGame('${id}');return 'open:'+ (document.querySelector('.screen.active')||{}).id;}catch(e){return 'ERR:'+e.message}})()`);
  await page.waitForTimeout(2200);
  const state = await js(`(function(){
    var st=window.PDX_GAME_STATE||{};var s=st['${id}']||st['${id.replace(/Game$/, '')}'];
    if(!s)return JSON.stringify({nop:1,screen:(document.querySelector('.screen.active')||{}).id,msg:(document.getElementById('${id}Msg')||{}).textContent});
    var top=Object.keys(s).filter(function(k){return typeof s[k]!=='function'}).slice(0,40).join(',');
    var iv=null,sers=[];
    var cv=document.getElementById('${id}Cv')||(document.querySelector('.screen.active canvas')||{});
    var ticks=0;
    var ivP=setInterval(function(){
      try{var h=JSON.stringify(s,function(k,v){return typeof v==='function'||k==='I'?undefined:(typeof v==='number'?Math.round(v*10)/10:v)});
      sers.push(h.length+':'+h.split('').reduce(function(a,c){return((a*31)+c.charCodeAt(0))%999983},0));ticks++;}catch(e){}
    },330);
    window.__BP={get:function(){clearInterval(ivP);return {top:top,h:sers};}};
    return 'armed';
  })()`);
  await page.waitForTimeout(2200);
  const res = await js(`(function(){var r=window.__BP&&window.__BP.get();window.__BP=null;return JSON.stringify(r||{});})()`);
  let parsed = {}; try { parsed = JSON.parse(res || "{}"); } catch (e) { parsed = { raw: res }; }
  const uniq = parsed.h ? new Set(parsed.h).size : 0;
  console.log(`${id}: ${opened} | uniq=${uniq}${parsed.top ? " | keys=" + parsed.top.slice(0, 120) : ""}${parsed.msg ? " | msg=" + parsed.msg.slice(0, 40) : ""}`);
}
console.log("pageerrors:", JSON.stringify(errors.slice(0, 6)));
await browser.close();
process.exit(0);
