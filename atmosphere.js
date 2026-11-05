(function(){
"use strict";
const wx=document.createElement("canvas");
wx.id="weatherCanvas";
wx.style.cssText="position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:2;";
document.body.appendChild(wx);
const wctx=wx.getContext("2d");
function resizeWx(){wx.width=innerWidth;wx.height=innerHeight;}
resizeWx();addEventListener("resize",resizeWx);
const PARTS=[];
function spawnWeather(type){
  for(let i=0;i<80;i++){
    PARTS.push({
      x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      vx:(Math.random()-.5)*30,
      vy:type==="snow"?20+Math.random()*20:10+Math.random()*20,
      size:type==="snow"?2+Math.random()*3:3+Math.random()*4,
      type,rot:Math.random()*Math.PI*2,vr:(Math.random()-.5)*3
    });
  }
}
function getSeason(){
  // honor secret-code season override first (prevents "heart trail outside season")
  try{ if(window.PDX_FORCE_SEASON!==undefined) return window.PDX_FORCE_SEASON||"default"; }catch(e){}
  const d=new Date(),m=d.getMonth(),day=d.getDate();
  if(m===9&&day>=15&&day<=31)return "halloween";
  if((m===11&&day>=15)||(m===0&&day<=5))return "christmas";
  if(m===3&&day>=1&&day<=29)return "easter";
  if(m===1&&day>=10&&day<=14)return "valentines";
  return "default";
}
let currentSeason="";
function checkSeason(){
  const s=getSeason();
  if(s===currentSeason)return;
  currentSeason=s;
  PARTS.length=0;
  if(s==="christmas")spawnWeather("snow");
  else if(s==="halloween")spawnWeather("bat");
  else if(s==="easter")spawnWeather("egg");
  else if(s==="valentines")spawnWeather("heart");
}
checkSeason();setInterval(checkSeason,60000);
let last=0;
function loop(t){
  requestAnimationFrame(loop);
  if(t-last<16)return;
  last=t;
  wctx.clearRect(0,0,wx.width,wx.height);
  if(window.activeScreen!=="menu"||!PARTS.length)return;
  for(const p of PARTS){
    p.x+=p.vx/60;p.y+=p.vy/60;p.rot+=p.vr/60;
    if(p.y>innerHeight+20){p.y=-20;p.x=Math.random()*innerWidth;}
    if(p.x<0)p.x=innerWidth;
    if(p.x>innerWidth)p.x=0;
    if(p.type==="snow"){wctx.fillStyle="rgba(255,255,255,.8)";wctx.beginPath();wctx.arc(p.x,p.y,p.size,0,Math.PI*2);wctx.fill();}
    else if(p.type==="bat"){wctx.fillStyle="rgba(60,20,40,.85)";wctx.save();wctx.translate(p.x,p.y);wctx.rotate(p.rot);wctx.beginPath();wctx.moveTo(-p.size,0);wctx.lineTo(0,-p.size);wctx.lineTo(p.size,0);wctx.lineTo(0,p.size/2);wctx.closePath();wctx.fill();wctx.restore();}
    else if(p.type==="heart"){wctx.fillStyle="rgba(255,100,150,.75)";wctx.save();wctx.translate(p.x,p.y);wctx.rotate(p.rot);wctx.beginPath();wctx.arc(-3,-2,p.size*.6,0,Math.PI*2);wctx.arc(3,-2,p.size*.6,0,Math.PI*2);wctx.moveTo(-6,0);wctx.lineTo(0,p.size*1.5);wctx.lineTo(6,0);wctx.fill();wctx.restore();}
    else if(p.type==="egg"){wctx.fillStyle=`hsl(${(p.x*.5)%360},70%,70%)`;wctx.save();wctx.translate(p.x,p.y);wctx.rotate(p.rot);wctx.beginPath();wctx.ellipse(0,0,p.size,p.size*1.4,0,0,Math.PI*2);wctx.fill();wctx.restore();}
  }
}
requestAnimationFrame(loop);

let actx=null,ambientGain=null,started=false;
function startAmbient(){
  if(started)return;
  if(!window.settings||!window.settings.sound)return;
  started=true;
  try{
    actx=new (window.AudioContext||window.webkitAudioContext)();
    ambientGain=actx.createGain();
    ambientGain.gain.value=0.008*(window.settings.volume||1);
    ambientGain.connect(actx.destination);
    [196,247,294,392].forEach((freq,idx)=>{
      const o=actx.createOscillator();o.type="sine";o.frequency.value=freq;
      const g=actx.createGain();g.gain.value=0.25;
      o.connect(g);g.connect(ambientGain);o.start();
      const lfo=actx.createOscillator();lfo.frequency.value=0.05+idx*0.02;
      const lg=actx.createGain();lg.gain.value=0.5;
      lfo.connect(lg);lg.connect(o.frequency);lfo.start();
    });
  }catch(e){}
}
addEventListener("click",startAmbient,{once:true});
})();