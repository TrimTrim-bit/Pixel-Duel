(function(){
"use strict";
function addAnimatedBg(){
  if(document.getElementById("menuAnimBg"))return;
  const cv=document.createElement("canvas");
  cv.id="menuAnimBg";
  cv.style.cssText="position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:0;opacity:.4;";
  document.body.insertBefore(cv,document.body.firstChild);
  const ctx=cv.getContext("2d");
  function size(){cv.width=innerWidth;cv.height=innerHeight;}
  size();addEventListener("resize",size);
  const stars=[];
  for(let i=0;i<60;i++){
    stars.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:1+Math.random()*2,vx:(Math.random()-.5)*20,vy:10+Math.random()*30,tw:Math.random()*Math.PI*2,hue:Math.random()<.5?190:320});
  }
  let gridOffset=0,last=0;
  function loop(t){
    requestAnimationFrame(loop);
    if(t-last<16)return;last=t;
    if(window.activeScreen!=="menu"){ctx.clearRect(0,0,cv.width,cv.height);return;}
    ctx.clearRect(0,0,cv.width,cv.height);
    gridOffset=(gridOffset+0.3)%40;
    ctx.strokeStyle="rgba(100,234,255,.06)";
    ctx.lineWidth=1;
    for(let x=-gridOffset;x<cv.width;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,cv.height);ctx.stroke();}
    for(let y=-gridOffset;y<cv.height;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(cv.width,y);ctx.stroke();}
    for(const s of stars){
      s.x+=s.vx/60;s.y+=s.vy/60;s.tw+=0.05;
      if(s.x<0)s.x=cv.width;if(s.x>cv.width)s.x=0;
      if(s.y>cv.height){s.y=-5;s.x=Math.random()*cv.width;}
      const alpha=.3+Math.abs(Math.sin(s.tw))*.7;
      ctx.fillStyle=`hsla(${s.hue},80%,70%,${alpha*.6})`;
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();
    }
  }
  requestAnimationFrame(loop);
}
function addTipsBar(){
  try{
    if(document.getElementById("menuTipsBar"))return;
    const bar=document.createElement("div");
    bar.id="menuTipsBar";
    bar.style.cssText="position:fixed;bottom:8px;left:50%;transform:translateX(-50%);background:rgba(8,11,24,.7);border:1px solid var(--accent,#64eaff);color:#9fc0ff;font-family:'Courier New',monospace;font-size:11px;letter-spacing:1px;padding:5px 14px;border-radius:10px;z-index:60;pointer-events:none;max-width:80vw;text-align:center;";
    const TIPS=["TIP: Press R for a random game","TIP: Right-click a game card to exclude it from Party mode","TIP: Double-click a canvas for fullscreen","TIP: Press I mid-game to toggle the AI","TIP: Claim your daily reward in the Calendar","TIP: Press ~ to disguise the page","TIP: Spend coins in the Pixel Shop","TIP: New games added every pack!"];
    bar.textContent=TIPS[Math.floor(Math.random()*TIPS.length)];
    document.body.appendChild(bar);
  }catch(e){}
}
function addDailyFact(){
  try{
    if(document.getElementById("menuDailyFact"))return;
    const FACTS=["Frog hearts are in their heads.","Octopuses have three hearts.","Bananas are berries, strawberries aren't.","Honey never spoils.","A day on Venus is longer than its year.","Sharks existed before trees.","Hot water freezes faster than cold.","Cats sleep 70% of their lives."];
    const el=document.createElement("div");
    el.id="menuDailyFact";
    el.style.cssText="position:fixed;top:8px;left:12px;background:rgba(8,11,24,.6);border:1px solid rgba(255,230,109,.4);color:#ffe66d;font-family:'Courier New',monospace;font-size:10px;letter-spacing:1px;padding:4px 10px;border-radius:8px;z-index:60;pointer-events:none;";
    el.textContent="💡 "+FACTS[new Date().getDate()%FACTS.length];
    document.body.appendChild(el);
  }catch(e){}
}
addEventListener("load",()=>{addAnimatedBg();addTipsBar();addDailyFact();});
setTimeout(()=>{addAnimatedBg();addTipsBar();addDailyFact();},500);
})();