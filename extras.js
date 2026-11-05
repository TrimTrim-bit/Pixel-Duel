/* =====================================================
   PIXEL DUEL — EXTRAS
   Loaded after script.js. Adds: richer audio, screen shake,
   confetti, 3-2-1 countdown, pause, better sprites,
   PARTY MODE, and three new games (Tank Arena, Space Duel,
   Hot Potato).
===================================================== */
window.GAME_HOOKS={};

(function(){
"use strict";

const C1="#64eaff",C2="#ff72c8",GOLD="#ffe66d",GREEN="#63f59a";
const DT=1/60;

/* =========================
   AUDIO
========================= */
let noiseBuf=null;
function getNoise(a){
if(noiseBuf)return noiseBuf;
noiseBuf=a.createBuffer(1,a.sampleRate*.5,a.sampleRate);
const d=noiseBuf.getChannelData(0);
for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
return noiseBuf;
}
function tone(freq,dur=.1,type="square",vol=.04,slide=0,delay=0){
if(!settings.sound)return;
const a=getAudio(),t=a.currentTime+delay;
const o=a.createOscillator(),g=a.createGain();
o.type=type;
o.frequency.setValueAtTime(freq,t);
if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),t+dur);
const v=Math.max(.0002,vol*settings.volume);
g.gain.setValueAtTime(v,t);
g.gain.exponentialRampToValueAtTime(.0001,t+dur);
o.connect(g);g.connect(a.destination);
o.start(t);o.stop(t+dur+.02);
}
function noise(dur=.2,vol=.06,delay=0,cutoff=1800){
if(!settings.sound)return;
const a=getAudio(),t=a.currentTime+delay;
const src=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();
src.buffer=getNoise(a);
f.type="lowpass";f.frequency.setValueAtTime(cutoff,t);
f.frequency.exponentialRampToValueAtTime(120,t+dur);
const v=Math.max(.0002,vol*settings.volume);
g.gain.setValueAtTime(v,t);
g.gain.exponentialRampToValueAtTime(.0001,t+dur);
src.connect(f);f.connect(g);g.connect(a.destination);
src.start(t);src.stop(t+dur+.02);
}

let lastWin=0;
window.playHitSound=function(){tone(170,.09,"square",.05,-70);noise(.07,.03,0,2600);shakeCanvas(3,120);};
window.playJumpSound=function(){tone(260,.1,"square",.022,300);};
window.playSelectSound=function(){tone(620,.04,"square",.022);};
window.playWinSound=function(){
const n=performance.now();
if(n-lastWin<450)return;
lastWin=n;
[392,523,659,784].forEach((f,i)=>tone(f,.14,"square",.04,0,i*.09));
tone(1046,.35,"triangle",.04,0,.38);
};
function playBounce(){tone(420,.06,"square",.03,200);}
function playScore(){tone(330,.08,"square",.04,0,0);tone(494,.12,"square",.04,0,.08);}
function playShoot(){tone(900,.12,"sawtooth",.025,-700);}
function playBoom(){noise(.45,.09,0,1400);tone(120,.4,"sawtooth",.05,-80);shakeCanvas(9,260);}
window.playBoomSound=playBoom;

/* =========================
   JUICE: SHAKE + CONFETTI
========================= */
let lastShake=0;
function shakeCanvas(px=4,ms=140){
if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
const now=performance.now();
if(now-lastShake<70)return;
lastShake=now;
document.querySelectorAll(".screen.active canvas").forEach(c=>{
if(!c.animate)return;
if(c._shake)c._shake.cancel();
c._shake=c.animate([
{transform:"translate(0,0)"},
{transform:`translate(${-px}px,${px/2}px)`},
{transform:`translate(${px}px,${-px/2}px)`},
{transform:`translate(${-px/2}px,${px/3}px)`},
{transform:"translate(0,0)"}
],{duration:ms,easing:"steps(5)"});
});
}

/* Overlays carry their own inline styles so they stay hidden/positioned even if style.css is stale or cached */
function setShow(el,on){el.classList.toggle("show",on);el.style.display=on?(el.dataset.disp||"flex"):"none";}
const fx=document.createElement("canvas");
fx.id="fxCanvas";
fx.style.cssText="position:fixed;left:0;top:0;width:100vw;height:100vh;margin:0;border:0;background:transparent;box-shadow:none;display:none;pointer-events:none;z-index:70;";
document.body.appendChild(fx);
const fctx=fx.getContext("2d");
function sizeFx(){fx.width=innerWidth;fx.height=innerHeight;}
sizeFx();addEventListener("resize",sizeFx);
let bits=[],fxRun=false,fxLast=0;
function confetti(colors,n=160){
for(let i=0;i<n;i++){
bits.push({
x:innerWidth/2+(Math.random()-.5)*innerWidth*.5,y:innerHeight*.35,
vx:(Math.random()-.5)*700,vy:-300-Math.random()*500,
w:5+Math.random()*7,h:4+Math.random()*6,
c:colors[i%colors.length],rot:Math.random()*6,vr:(Math.random()-.5)*14,
life:2.2+Math.random()
});
}
fx.style.display="block";
if(!fxRun){fxRun=true;fxLast=performance.now();requestAnimationFrame(fxLoop);}
}
function fxLoop(t){
const dt=Math.min((t-fxLast)/1000,.05);fxLast=t;
fctx.clearRect(0,0,fx.width,fx.height);
for(let i=bits.length-1;i>=0;i--){
const b=bits[i];
b.vy+=900*dt;b.vx*=.99;
b.x+=b.vx*dt;b.y+=b.vy*dt;b.rot+=b.vr*dt;b.life-=dt;
if(b.life<=0||b.y>innerHeight+40){bits.splice(i,1);continue;}
fctx.save();fctx.translate(b.x,b.y);fctx.rotate(b.rot);
fctx.globalAlpha=Math.min(1,b.life);
fctx.fillStyle=b.c;fctx.fillRect(-b.w/2,-b.h/2,b.w,b.h);
fctx.restore();
}
if(bits.length)requestAnimationFrame(fxLoop);else{fxRun=false;fx.style.display="none";}
}

/* Confetti whenever a status line announces a winner */
let lastConfetti=0;
const winObs=new MutationObserver(muts=>{
for(const m of muts){
const up=(m.target.textContent||"").toUpperCase();
if(/WINS|WINNER|CHAMPION/.test(up)&&performance.now()-lastConfetti>1500){
lastConfetti=performance.now();
const a=/PLAYER 1|P1|RED/.test(up),b=/PLAYER 2|P2|YELLOW/.test(up);
confetti(a&&!b?[C1,"#fff",GOLD]:b&&!a?[C2,"#fff",GOLD]:[C1,C2,GOLD,GREEN]);
}
}
});
document.querySelectorAll(".status").forEach(el=>winObs.observe(el,{childList:true,characterData:true,subtree:true}));

/* =========================
   COUNTDOWN + PAUSE + ESC
========================= */
const cd=document.createElement("div");
cd.id="countdown";cd.innerHTML='<small></small><b></b>';
cd.style.cssText="position:fixed;left:0;top:0;right:0;bottom:0;display:none;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;z-index:80;";
cd.querySelector("small").style.cssText="color:#9fc0ff;font-size:18px;letter-spacing:4px;";
cd.querySelector("b").style.cssText="color:#ffff00;font-size:clamp(70px,16vw,170px);text-shadow:6px 6px 0 #6e3449;";
document.body.appendChild(cd);
let cdToken=0;
function hideCountdown(){setShow(cd,false);}
function startCountdown(){
const token=++cdToken;
countdownActive=true;
cd.querySelector("small").textContent=(gameTitles[activeScreen]||"").toUpperCase();
const steps=["3","2","1","GO!"];
steps.forEach((txt,i)=>{
setTimeout(()=>{
if(token!==cdToken)return;
const b=cd.querySelector("b");
b.textContent=txt;
setShow(cd,false);void cd.offsetWidth;setShow(cd,true);
if(i<3)tone(440,.1,"square",.035);
else{tone(880,.3,"square",.04);countdownActive=false;}
},i*620);
});
setTimeout(()=>{if(token===cdToken)hideCountdown();},3*620+520);
}

const pauseEl=document.createElement("div");
pauseEl.id="pauseOverlay";
pauseEl.style.cssText="position:fixed;left:0;top:0;right:0;bottom:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(8,11,24,.78);color:#9fc0ff;z-index:75;";
pauseEl.innerHTML="<b>PAUSED</b><span>Click or press P to resume · ESC for menu</span>";
pauseEl.addEventListener("click",()=>setPaused(false));
document.body.appendChild(pauseEl);
function setPaused(v){paused=v;setShow(pauseEl,v);}

const REALTIME=["pong","breadGame","hockeyGame","bombGame","dodgeGame","sumoGame","snakeGame","basketGame","volleyGame","raceGame","platformGame","tankGame","spaceGame","potatoGame"];

addEventListener("keydown",e=>{
const k=e.key.toLowerCase();
const panel=document.getElementById("settingsPanel");
if(k==="escape"){
if(panel.classList.contains("open")){toggleSettings();return;}
if(activeScreen!=="menu"){setPaused(false);window.showMenu();}
return;
}
if(k==="p"&&!e.repeat&&REALTIME.includes(activeScreen)&&!countdownActive){
setPaused(!paused);
}
});
document.addEventListener("visibilitychange",()=>{
if(document.hidden&&REALTIME.includes(activeScreen)&&!countdownActive)setPaused(true);
});

/* Wrap resets so every real-time game gets a 3-2-1-GO */
["resetPong","resetBread","resetHockey","resetBomb","resetDodge","resetSumo","resetSnake","resetBasket","resetVolley","resetRace","resetPlatform"].forEach(n=>{
const f=window[n];
window[n]=function(){f.apply(this,arguments);setPaused(false);startCountdown();};
});

/* Sound + feel hooks for Pong (it had none) */
const _paddle=window.handlePongPaddleHit;
window.handlePongPaddleHit=function(p,c){const r=_paddle(p,c);if(r){playBounce();shakeCanvas(3,100);}return r;};
const _walls=window.handlePongWalls;
window.handlePongWalls=function(b){const vy=b.vy;_walls(b);if(b.vy!==vy)tone(300,.05,"square",.025);};
const _score=window.handlePongScore;
window.handlePongScore=function(s){playScore();shakeCanvas(7,200);_score(s);};
const _explode=window.explodeBomb;
window.explodeBomb=function(){playBoom();return _explode.apply(this,arguments);};

/* Leaving to menu cancels countdown/pause/party */
const _showMenu=window.showMenu;
window.showMenu=function(){
cdToken++;hideCountdown();setPaused(false);
if(party.active)quitParty();
_showMenu();
};
const _openGame=window.openGame;
window.openGame=function(id){cdToken++;hideCountdown();setPaused(false);_openGame(id);};

/* =========================
   SPRITES
========================= */
function drawFighter(ctx,w,h,color,dir,moving,hit){
const t=performance.now()/90;
const bob=moving?Math.round(Math.sin(t)):0;
const leg=moving?Math.round(Math.sin(t)*3):0;
const lw=Math.max(5,Math.round(w*.3)),lh=Math.round(h*.26);
ctx.lineWidth=2;ctx.strokeStyle="#080b18";
/* legs + boots */
ctx.fillStyle="#2a2f63";
ctx.fillRect(w*.12+leg,h-lh,lw,lh);ctx.fillRect(w*.88-lw-leg,h-lh,lw,lh);
ctx.fillStyle="#0c0f24";
ctx.fillRect(w*.12+leg-1,h-4,lw+3,4);ctx.fillRect(w*.88-lw-leg-1,h-4,lw+3,4);
/* torso */
const ty=h*.34+bob;
ctx.fillStyle=hit?"#ffffff":color;
ctx.fillRect(1,ty,w-2,h*.4);ctx.strokeRect(1,ty,w-2,h*.4);
ctx.fillStyle="rgba(255,255,255,.28)";ctx.fillRect(3,ty+2,w-8,3);
ctx.fillStyle=GOLD;ctx.fillRect(1,ty+h*.4-5,w-2,3);
/* arm toward facing side */
ctx.fillStyle="#f3bd83";
ctx.fillRect(dir>0?w-3:-3,ty+4,6,6);
/* head */
ctx.fillStyle="#f3bd83";
ctx.fillRect(w*.1,bob,w*.8,h*.32);ctx.strokeRect(w*.1,bob,w*.8,h*.32);
ctx.fillStyle=color;ctx.fillRect(w*.1,bob+2,w*.8,4);
ctx.fillStyle="#fff";
const ex=dir>0?w*.5:w*.14;
ctx.fillRect(ex,bob+h*.13,w*.34,5);
ctx.fillStyle="#11152b";
ctx.fillRect(dir>0?ex+w*.18:ex,bob+h*.13+1,w*.16,4);
}
window.drawFighter=drawFighter;

function drawSumoWrestler(ctx,p){
const r=p.r,d=p.dir;
ctx.fillStyle="rgba(0,0,0,.3)";
ctx.beginPath();ctx.ellipse(0,5,r,r*.85,0,0,Math.PI*2);ctx.fill();
/* belly */
ctx.fillStyle="#f3bd83";ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
/* mawashi belt */
ctx.strokeStyle=p.color;ctx.lineWidth=9;
ctx.beginPath();ctx.arc(0,0,r-8,0,Math.PI*2);ctx.stroke();
ctx.fillStyle="rgba(255,255,255,.25)";ctx.beginPath();ctx.arc(-r*.35,-r*.35,r*.2,0,Math.PI*2);ctx.fill();
/* head */
const hx=d*r*.3;
ctx.fillStyle="#f3bd83";ctx.beginPath();ctx.arc(hx,0,r*.46,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle="#1a1022";ctx.beginPath();ctx.arc(hx-d*r*.12,0,r*.4,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#f3bd83";ctx.beginPath();ctx.arc(hx+d*r*.1,0,r*.34,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#fff";ctx.fillRect(hx+d*r*.12-3,-6,6,5);ctx.fillRect(hx+d*r*.12-3,2,6,5);
ctx.fillStyle="#11152b";ctx.fillRect(hx+d*r*.2-1,-5,3,3);ctx.fillRect(hx+d*r*.2-1,3,3,3);
/* hands pushing */
ctx.fillStyle="#f3bd83";
ctx.beginPath();ctx.arc(d*(r+4),-11,6,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(d*(r+4),11,6,0,Math.PI*2);ctx.fill();
}
window.drawSumoWrestler=drawSumoWrestler;

/* =========================
   SHARED HELPERS FOR NEW GAMES
========================= */
function circleRectPush(c,r){
const nx=clamp(c.x,r.x,r.x+r.w),ny=clamp(c.y,r.y,r.y+r.h);
const dx=c.x-nx,dy=c.y-ny,d2=dx*dx+dy*dy;
if(d2>=c.r*c.r)return false;
if(d2===0){
const l=c.x-r.x,rt=r.x+r.w-c.x,t=c.y-r.y,b=r.y+r.h-c.y,m=Math.min(l,rt,t,b);
if(m===l)c.x=r.x-c.r;else if(m===rt)c.x=r.x+r.w+c.r;else if(m===t)c.y=r.y-c.r;else c.y=r.y+r.h+c.r;
return true;
}
const d=Math.sqrt(d2),push=c.r-d;
c.x+=dx/d*push;c.y+=dy/d*push;
return true;
}
function drawParts(ctx,list,size=4){
for(const p of list){
ctx.globalAlpha=clamp(p.life/.8,0,1);
ctx.fillStyle=p.color;
ctx.fillRect(Math.round(p.x),Math.round(p.y),size,size);
}
ctx.globalAlpha=1;
}
function drawPips(ctx,x,y,n,max,color,dir){
for(let i=0;i<max;i++){
const px=x+i*dir*20;
ctx.fillStyle=i<n?color:"#26386f";
ctx.fillRect(px,y,14,14);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(px,y,14,14);
}
}
function drawBox(ctx,title,sub,color){
ctx.fillStyle="#080b18dd";ctx.fillRect(220,185,460,100);
ctx.strokeStyle=color||GOLD;ctx.lineWidth=3;ctx.strokeRect(220,185,460,100);
ctx.textAlign="center";
ctx.fillStyle=color||GOLD;ctx.font="bold 30px Courier New";ctx.fillText(title,450,232);
if(sub){ctx.fillStyle="#9fc0ff";ctx.font="15px Courier New";ctx.fillText(sub,450,262);}
ctx.textAlign="left";
}
function drawBanner(ctx,text,color){
ctx.textAlign="center";
ctx.font="bold 38px Courier New";
ctx.fillStyle="#080b18";ctx.fillText(text,454,254);
ctx.fillStyle=color;ctx.fillText(text,450,250);
ctx.textAlign="left";
}

/* Registers a game: reset hook (with countdown), loop, Space-to-restart */
const NEW_GAMES={};
const GAME_GEN={};   // screenId -> generation; stale rAF loops self-terminate
function registerGame(screenId,def){
GAME_GEN[screenId]=(GAME_GEN[screenId]||0)+1;
const myGen=GAME_GEN[screenId];
def.ctx=document.getElementById(def.canvas).getContext("2d");
def.msg=document.getElementById(def.msgEl);
const start=()=>{def.reset();setPaused(false);startCountdown();};
GAME_HOOKS[screenId]=start;
window[def.resetName]=start;
NEW_GAMES[screenId]=def;
def.reset();
(function loop(){
    if(myGen!==GAME_GEN[screenId])return;   // a newer registration replaced us — stop
    if(activeScreen===screenId){
      stepGame(()=>def.update());
      def.draw();
    }
    requestAnimationFrame(loop);
})();
winObs.observe(def.msg,{childList:true,characterData:true,subtree:true});
gameTitles[screenId]=def.title;
}
addEventListener("keydown",e=>{
if(e.code!=="Space"||e.repeat)return;
const g=NEW_GAMES[activeScreen];
if(g&&g.isOver()&&!countdownActive){e.preventDefault();GAME_HOOKS[activeScreen]();}
});
["tank","space","potato"].forEach(g=>{if(!GAMES.includes(g))GAMES.push(g);});

/* =========================
   TANK ARENA
========================= */
(function(){
const W=900,H=500,TR=15,WIN=5;
const T={active:true,s1:0,s2:0,tanks:[],bullets:[],walls:[],parts:[],freeze:0,banner:"",bannerColor:"#fff",winner:""};
window.__PDX_TANK_STATE=T;   // AI bridge reads this
const msg=document.getElementById("tankMsg");

function nearSpawn(r){
return [[70,250],[830,250]].some(([sx,sy])=>{
const nx=clamp(sx,r.x,r.x+r.w),ny=clamp(sy,r.y,r.y+r.h);
return Math.hypot(sx-nx,sy-ny)<70;
});
}
function makeWalls(){
const list=[];
const n=3+Math.floor(Math.random()*3);
for(let i=0;i<n;i++){
const horiz=Math.random()<.5;
const w=horiz?80+Math.floor(Math.random()*4)*20:24+Math.floor(Math.random()*2)*8;
const h=horiz?24+Math.floor(Math.random()*2)*8:80+Math.floor(Math.random()*4)*20;
const x=Math.round(140+Math.random()*(W/2-140-w-10));
const y=Math.round(40+Math.random()*(H-80-h));
const r={x,y,w,h};
if(nearSpawn(r))continue;
list.push(r,{x:W-x-w,y,w,h});
}
if(Math.random()<.6)list.push({x:W/2-14,y:H/2-50,w:28,h:100});
return list;
}
function mk(x,y,a,color){return{x,y,a,color,r:TR,alive:true,cool:0,track:0};}
function newRound(){
T.walls=makeWalls();T.bullets=[];T.freeze=0;T.banner="";
T.tanks=[mk(70,250,0,C1),mk(830,250,Math.PI,C2)];
}
function reset(){
T.s1=0;T.s2=0;T.parts=[];T.active=true;T.winner="";newRound();
msg.textContent="FIRST TO 5 — BOUNCE SHOTS OFF THE WALLS";
}
function explode(t){
spawnParticles(T.parts,t.x,t.y,t.color,30,380);
spawnParticles(T.parts,t.x,t.y,GOLD,16,300);
spawnParticles(T.parts,t.x,t.y,"#ffffff",8,220);
}
function drive(t,idx,L,R,F,B,FIRE){
if(!t.alive)return;
if(keys[L])t.a-=3.1*DT;
if(keys[R])t.a+=3.1*DT;
let v=0;
if(keys[F])v=150;
if(keys[B])v=-100;
t.x+=Math.cos(t.a)*v*DT;t.y+=Math.sin(t.a)*v*DT;t.track+=v*DT;
for(const w of T.walls)circleRectPush(t,w);
t.x=clamp(t.x,TR+4,W-TR-4);t.y=clamp(t.y,TR+4,H-TR-4);
t.cool-=DT;
if(keys[FIRE]&&t.cool<=0&&T.bullets.filter(b=>b.o===idx).length<4){
t.cool=.28;
const cx=Math.cos(t.a),cy=Math.sin(t.a);
T.bullets.push({x:t.x+cx*(TR+8),y:t.y+cy*(TR+8),vx:cx*330,vy:cy*330,b:0,age:0,o:idx});
spawnParticles(T.parts,t.x+cx*(TR+10),t.y+cy*(TR+10),GOLD,4,140);
playShoot();
}
}
function finish(){
T.active=false;
const p1=T.s1>=WIN;
T.winner=p1?"PLAYER 1 WINS!":"PLAYER 2 WINS!";
msg.textContent=T.winner;
recordWin("tank",p1?"p1":"p2");
playWinSound();
}
function update(){
updateParticles(T.parts,DT,0);
if(!T.active)return;
if(T.freeze>0){
T.freeze-=DT;
if(T.freeze<=0){if(T.s1>=WIN||T.s2>=WIN)finish();else newRound();}
return;
}
drive(T.tanks[0],0,"a","d","w","s"," ");
drive(T.tanks[1],1,"arrowleft","arrowright","arrowup","arrowdown","enter");

const died=[false,false];
for(const bl of T.bullets){
const ox=bl.x,oy=bl.y;
bl.x+=bl.vx*DT;bl.y+=bl.vy*DT;bl.age+=DT;
let bounced=false;
if(bl.x<6){bl.x=6;bl.vx=Math.abs(bl.vx);bounced=true;}
if(bl.x>W-6){bl.x=W-6;bl.vx=-Math.abs(bl.vx);bounced=true;}
if(bl.y<6){bl.y=6;bl.vy=Math.abs(bl.vy);bounced=true;}
if(bl.y>H-6){bl.y=H-6;bl.vy=-Math.abs(bl.vy);bounced=true;}
for(const w of T.walls){
if(bl.x>w.x-3&&bl.x<w.x+w.w+3&&bl.y>w.y-3&&bl.y<w.y+w.h+3){
const cameFromSide=!(ox>w.x-3&&ox<w.x+w.w+3);
if(cameFromSide){bl.vx*=-1;bl.x=ox;}else{bl.vy*=-1;bl.y=oy;}
bounced=true;break;
}
}
if(bounced){bl.b++;playBounce();spawnParticles(T.parts,bl.x,bl.y,"#fff",3,120);}
T.tanks.forEach((t,i)=>{
if(!t.alive||bl.dead)return;
if(bl.o===i&&bl.age<.2)return;
if(Math.hypot(bl.x-t.x,bl.y-t.y)<TR+3){died[i]=true;bl.dead=true;}
});
}
T.bullets=T.bullets.filter(b=>!b.dead&&b.b<=3&&b.age<6);

if(died[0]||died[1]){
T.tanks.forEach((t,i)=>{if(died[i]){t.alive=false;explode(t);}});
if(died[0]&&died[1]){T.banner="BOTH DESTROYED";T.bannerColor="#fff";}
else if(died[0]){T.s2++;T.banner="P2 SCORES";T.bannerColor=C2;}
else{T.s1++;T.banner="P1 SCORES";T.bannerColor=C1;}
T.freeze=1.4;T.bullets=[];
playBoom();
if(!(died[0]&&died[1]))msg.textContent=`P1 ${T.s1} : ${T.s2} P2 — FIRST TO ${WIN}`;
}
}

function drawTank(t){
if(!t.alive)return;
const ctx=NEW_GAMES.tankGame.ctx;
ctx.save();ctx.translate(Math.round(t.x),Math.round(t.y));ctx.rotate(t.a);
ctx.fillStyle="rgba(0,0,0,.35)";ctx.fillRect(-12,-9,28,22);
/* treads */
ctx.fillStyle="#0e1230";
ctx.fillRect(-15,-13,30,6);ctx.fillRect(-15,7,30,6);
ctx.fillStyle="#2d3a74";
const off=((t.track%6)+6)%6;
for(let x=-15;x<15;x+=6){
const px=x+off;
if(px<14){ctx.fillRect(px,-13,2,6);ctx.fillRect(px,7,2,6);}
}
/* hull */
ctx.fillStyle=t.color;ctx.fillRect(-12,-8,24,16);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(-12,-8,24,16);
ctx.fillStyle="rgba(255,255,255,.3)";ctx.fillRect(-10,-6,16,3);
ctx.fillStyle="rgba(0,0,0,.25)";ctx.fillRect(-10,3,20,3);
/* barrel + turret */
ctx.fillStyle="#1b2147";ctx.fillRect(2,-3,20,6);ctx.strokeRect(2,-3,20,6);
ctx.fillStyle=t.color;ctx.fillRect(20,-4,4,8);
ctx.fillStyle="#dfe9ff";ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle=t.color;ctx.beginPath();ctx.arc(0,0,3.5,0,Math.PI*2);ctx.fill();
ctx.restore();
}
function draw(){
const ctx=NEW_GAMES.tankGame.ctx;
ctx.fillStyle="#141c40";ctx.fillRect(0,0,W,H);
for(let x=0;x<W;x+=50)for(let y=0;y<H;y+=50){
if(((x+y)/50)%2===0){ctx.fillStyle="#182349";ctx.fillRect(x,y,50,50);}
}
/* walls */
for(const w of T.walls){
ctx.fillStyle="rgba(0,0,0,.35)";ctx.fillRect(w.x+4,w.y+5,w.w,w.h);
ctx.fillStyle="#6b4b86";ctx.fillRect(w.x,w.y,w.w,w.h);
ctx.fillStyle="#563a6e";
for(let y=w.y+10;y<w.y+w.h;y+=10)ctx.fillRect(w.x,y,w.w,2);
for(let y=w.y,row=0;y<w.y+w.h;y+=10,row++){
for(let x=w.x+(row%2?8:0);x<w.x+w.w;x+=16)ctx.fillRect(x,y,2,10);
}
ctx.fillStyle="#9b6bd1";ctx.fillRect(w.x,w.y,w.w,4);
ctx.strokeStyle="#2a1a3a";ctx.lineWidth=2;ctx.strokeRect(w.x,w.y,w.w,w.h);
}
ctx.strokeStyle=C1;ctx.lineWidth=4;ctx.strokeRect(2,2,W-4,H-4);
/* bullets */
for(const b of T.bullets){
ctx.strokeStyle="rgba(255,230,109,.5)";ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(b.x-b.vx*.03,b.y-b.vy*.03);ctx.lineTo(b.x,b.y);ctx.stroke();
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x,b.y,3.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(b.x,b.y,2,0,Math.PI*2);ctx.fill();
}
T.tanks.forEach(drawTank);
drawParts(ctx,T.parts,5);
/* HUD */
ctx.font="bold 16px Courier New";ctx.textAlign="left";
ctx.fillStyle=C1;ctx.fillText("P1",16,28);drawPips(ctx,46,15,T.s1,WIN,C1,1);
ctx.textAlign="right";ctx.fillStyle=C2;ctx.fillText("P2",W-16,28);drawPips(ctx,W-46-14,15,T.s2,WIN,C2,-1);
ctx.textAlign="left";
if(T.freeze>0&&T.banner)drawBanner(ctx,T.banner,T.bannerColor);
if(!T.active)drawBox(ctx,T.winner,"SPACE OR RESTART TO REMATCH",GOLD);
}
registerGame("tankGame",{title:"Tank Arena",canvas:"tankCanvas",msgEl:"tankMsg",resetName:"resetTank",reset,update,draw,isOver:()=>!T.active});
})();

/* =========================
   SPACE DUEL (Spacewar-style)
========================= */
(function(){
const W=900,H=500,CX=450,CY=250,WIN=5,GRAV=5.2e6;
const S={active:true,ships:[],bullets:[],parts:[],stars:[],s1:0,s2:0,winner:"",banner:"",bannerColor:"#ffffff"};
window.__PDX_SPACE_STATE=S;   // AI bridge reads thisf",bannerT:0,t:0};
const msg=document.getElementById("spaceMsg");
for(let i=0;i<110;i++)S.stars.push({x:Math.random()*W,y:Math.random()*H,tw:Math.random()*6,s:Math.random()<.2?3:2});

function mk(x,y,a,color){return{x,y,vx:0,vy:0,a,color,alive:true,respawn:0,cool:0,inv:0,thrust:false,sx:x,sy:y,sa:a};}
function reset(){
S.s1=0;S.s2=0;S.parts=[];S.bullets=[];S.active=true;S.winner="";S.banner="";S.bannerT=0;
S.ships=[mk(120,250,0,C1),mk(780,250,Math.PI,C2)];
msg.textContent="FIRST TO 5 — MIND THE SUN";
}
function score(idx){
if(idx===0)S.s1++;else S.s2++;
S.banner=idx===0?"P1 SCORES":"P2 SCORES";S.bannerColor=idx===0?C1:C2;S.bannerT=1.1;
msg.textContent=`P1 ${S.s1} : ${S.s2} P2 — FIRST TO ${WIN}`;
if(S.s1>=WIN||S.s2>=WIN){
S.active=false;
S.winner=S.s1>=WIN?"PLAYER 1 WINS!":"PLAYER 2 WINS!";
msg.textContent=S.winner;
recordWin("space",S.s1>=WIN?"p1":"p2");
playWinSound();
}
}
function die(i,byIdx){
const sh=S.ships[i];
if(!sh.alive)return;
sh.alive=false;sh.respawn=1.6;
spawnParticles(S.parts,sh.x,sh.y,sh.color,28,420);
spawnParticles(S.parts,sh.x,sh.y,GOLD,14,320);
spawnParticles(S.parts,sh.x,sh.y,"#fff",8,240);
playBoom();
if(byIdx!==null&&byIdx!==undefined)score(byIdx);
}
function control(i,L,R,TH,F){
const sh=S.ships[i];
if(!sh.alive){
sh.respawn-=DT;
if(sh.respawn<=0){sh.alive=true;sh.x=sh.sx;sh.y=sh.sy;sh.a=sh.sa;sh.vx=0;sh.vy=0;sh.inv=2;}
return;
}
if(keys[L])sh.a-=3.6*DT;
if(keys[R])sh.a+=3.6*DT;
sh.thrust=!!keys[TH];
if(sh.thrust){
sh.vx+=Math.cos(sh.a)*260*DT;sh.vy+=Math.sin(sh.a)*260*DT;
if(Math.random()<.6)spawnParticles(S.parts,sh.x-Math.cos(sh.a)*12,sh.y-Math.sin(sh.a)*12,"#ff8c42",1,60);
}
const dx=CX-sh.x,dy=CY-sh.y,d2=Math.max(dx*dx+dy*dy,2500),d=Math.sqrt(d2);
sh.vx+=dx/d*GRAV/d2*DT;sh.vy+=dy/d*GRAV/d2*DT;
const sp=Math.hypot(sh.vx,sh.vy);
if(sp>330){sh.vx*=330/sp;sh.vy*=330/sp;}
sh.x=(sh.x+sh.vx*DT+W)%W;sh.y=(sh.y+sh.vy*DT+H)%H;
sh.cool-=DT;sh.inv=Math.max(0,sh.inv-DT);
if(Math.hypot(dx,dy)<24){die(i,1-i);return;}
if(keys[F]&&sh.cool<=0&&S.bullets.filter(b=>b.o===i).length<5){
sh.cool=.28;
S.bullets.push({x:sh.x+Math.cos(sh.a)*16,y:sh.y+Math.sin(sh.a)*16,vx:Math.cos(sh.a)*480+sh.vx*.4,vy:Math.sin(sh.a)*480+sh.vy*.4,life:1.3,o:i});
playShoot();
}
}
function update(){
S.t+=DT;
updateParticles(S.parts,DT,0);
S.bannerT=Math.max(0,S.bannerT-DT);
if(!S.active)return;
control(0,"a","d","w"," ");
control(1,"arrowleft","arrowright","arrowup","enter");
for(const b of S.bullets){
b.x=(b.x+b.vx*DT+W)%W;b.y=(b.y+b.vy*DT+H)%H;b.life-=DT;
if(Math.hypot(b.x-CX,b.y-CY)<26)b.life=0;
S.ships.forEach((sh,i)=>{
if(b.life<=0||i===b.o||!sh.alive||sh.inv>0)return;
if(Math.hypot(b.x-sh.x,b.y-sh.y)<14){b.life=0;die(i,b.o);}
});
}
S.bullets=S.bullets.filter(b=>b.life>0);
const [a,b]=S.ships;
if(a.alive&&b.alive&&a.inv<=0&&b.inv<=0&&Math.hypot(a.x-b.x,a.y-b.y)<18){
die(0,null);die(1,null);
S.banner="COLLISION";S.bannerColor="#fff";S.bannerT=1;
}
}
function drawShip(ctx,sh){
if(!sh.alive)return;
ctx.save();ctx.translate(sh.x,sh.y);ctx.rotate(sh.a);
if(sh.inv>0&&Math.floor(sh.inv*12)%2)ctx.globalAlpha=.35;
if(sh.thrust){
ctx.fillStyle=Math.random()<.5?GOLD:"#ff8c42";
ctx.beginPath();ctx.moveTo(-7,-4);ctx.lineTo(-17-Math.random()*9,0);ctx.lineTo(-7,4);ctx.closePath();ctx.fill();
}
ctx.fillStyle=sh.color;ctx.strokeStyle="#fff";ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-10,-10);ctx.lineTo(-5,0);ctx.lineTo(-10,10);ctx.closePath();
ctx.fill();ctx.stroke();
ctx.fillStyle="#101936";ctx.fillRect(1,-2,6,4);
ctx.restore();
}
function draw(){
const ctx=NEW_GAMES.spaceGame.ctx;
ctx.fillStyle="#070b1f";ctx.fillRect(0,0,W,H);
for(const st of S.stars){
ctx.fillStyle=Math.sin(S.t*2+st.tw)>0?"#9fc0ff":"#4c5d99";
ctx.fillRect(st.x,st.y,st.s,st.s);
}
/* sun */
const pulse=Math.sin(S.t*3)*2;
ctx.fillStyle="rgba(255,170,60,.10)";ctx.beginPath();ctx.arc(CX,CY,64+pulse*2,0,Math.PI*2);ctx.fill();
ctx.fillStyle="rgba(255,170,60,.18)";ctx.beginPath();ctx.arc(CX,CY,42+pulse,0,Math.PI*2);ctx.fill();
ctx.save();ctx.translate(CX,CY);ctx.rotate(S.t*.6);
ctx.fillStyle="#ff8c42";
for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.fillRect(22,-3,10+pulse,6);}
ctx.restore();
ctx.fillStyle="#ff8c42";ctx.beginPath();ctx.arc(CX,CY,22,0,Math.PI*2);ctx.fill();
ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(CX,CY,16,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#fff6b0";ctx.beginPath();ctx.arc(CX-3,CY-3,8,0,Math.PI*2);ctx.fill();
/* bullets */
for(const b of S.bullets){
ctx.fillStyle=S.ships[b.o].color;ctx.fillRect(b.x-3,b.y-3,6,6);
ctx.fillStyle="#fff";ctx.fillRect(b.x-1,b.y-1,2,2);
}
S.ships.forEach(sh=>drawShip(ctx,sh));
drawParts(ctx,S.parts,4);
ctx.font="bold 16px Courier New";ctx.textAlign="left";
ctx.fillStyle=C1;ctx.fillText("P1",16,28);drawPips(ctx,46,15,S.s1,WIN,C1,1);
ctx.textAlign="right";ctx.fillStyle=C2;ctx.fillText("P2",W-16,28);drawPips(ctx,W-46-14,15,S.s2,WIN,C2,-1);
ctx.textAlign="left";
if(S.bannerT>0&&S.active)drawBanner(ctx,S.banner,S.bannerColor);
if(!S.active)drawBox(ctx,S.winner,"SPACE OR RESTART TO REMATCH",GOLD);
}
registerGame("spaceGame",{title:"Space Duel",canvas:"spaceCanvas",msgEl:"spaceMsg",resetName:"resetSpace",reset,update,draw,isOver:()=>!S.active});
})();

/* =========================
   HOT POTATO
========================= */
(function(){
const W=900,H=500,R=18,WIN=3;
const P={active:true,players:[],holder:0,fuse:10,fuseMax:10,tagCd:0,s1:0,s2:0,parts:[],freeze:0,banner:"",bannerColor:"#fff",winner:"",tickT:0,t:0};
window.__PDX_POTATO_STATE=P;   // AI bridge reads this
const msg=document.getElementById("potatoMsg");
const base=[{x:250,y:100,w:36,h:110},{x:430,y:225,w:40,h:50},{x:130,y:360,w:90,h:30}];
const walls=[];
base.forEach(b=>{walls.push(b,{x:W-b.x-b.w,y:H-b.y-b.h,w:b.w,h:b.h});});

function mk(x,y,color){return{x,y,r:R,color,vx:0,vy:0,fx:1,fy:0,dash:0,dashCd:0,dx:1,dy:0,trail:[]};}
function newRound(){
P.players=[mk(150,250,C1),mk(750,250,C2)];
P.holder=Math.random()<.5?0:1;
P.fuseMax=P.fuse=9+Math.random()*5;
P.tagCd=.8;P.freeze=0;P.banner="";P.tickT=0;
}
function reset(){P.s1=0;P.s2=0;P.parts=[];P.active=true;P.winner="";newRound();msg.textContent="PASS THE BOMB — FIRST TO 3";}
function move(i,U,D,L,Rk,DASH){
const p=P.players[i];
let ix=(keys[Rk]?1:0)-(keys[L]?1:0),iy=(keys[D]?1:0)-(keys[U]?1:0);
const len=Math.hypot(ix,iy);
if(len>0){ix/=len;iy/=len;p.fx=ix;p.fy=iy;}
p.dashCd=Math.max(0,p.dashCd-DT);
if(keys[DASH]&&p.dashCd<=0&&p.dash<=0){
p.dash=.14;p.dashCd=1.6;p.dx=len>0?ix:p.fx;p.dy=len>0?iy:p.fy;
tone(500,.12,"sawtooth",.03,500);
}
let vx,vy;
if(p.dash>0){p.dash-=DT;vx=p.dx*700;vy=p.dy*700;p.trail.push({x:p.x,y:p.y,a:.6});}
else{const sp=(P.holder===i)?238:216;vx=ix*sp;vy=iy*sp;}
p.vx=vx;p.vy=vy;
p.x+=vx*DT;p.y+=vy*DT;
for(const w of walls)circleRectPush(p,w);
p.x=clamp(p.x,R+4,W-R-4);p.y=clamp(p.y,R+4,H-R-4);
for(const t of p.trail)t.a-=DT*3;
p.trail=p.trail.filter(t=>t.a>0);
}
function finish(){
P.active=false;
const p1=P.s1>=WIN;
P.winner=p1?"PLAYER 1 WINS!":"PLAYER 2 WINS!";
msg.textContent=P.winner;
recordWin("potato",p1?"p1":"p2");
playWinSound();
}
function update(){
P.t+=DT;
updateParticles(P.parts,DT,0);
if(!P.active)return;
if(P.freeze>0){
P.freeze-=DT;
if(P.freeze<=0){if(P.s1>=WIN||P.s2>=WIN)finish();else newRound();}
return;
}
move(0,"w","s","a","d"," ");
move(1,"arrowup","arrowdown","arrowleft","arrowright","enter");
P.tagCd=Math.max(0,P.tagCd-DT);
const [a,b]=P.players;
if(P.tagCd<=0&&Math.hypot(a.x-b.x,a.y-b.y)<a.r+b.r){
P.holder=1-P.holder;P.tagCd=.7;
spawnParticles(P.parts,(a.x+b.x)/2,(a.y+b.y)/2,GOLD,14,300);
tone(700,.08,"square",.045,300);shakeCanvas(4,120);
/* knock apart */
const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
a.x-=dx/d*10;a.y-=dy/d*10;b.x+=dx/d*10;b.y+=dy/d*10;
}
P.fuse-=DT;
P.tickT-=DT;
if(P.tickT<=0){
P.tickT=clamp(P.fuse/9,.1,.6);
tone(P.fuse<3?1100:800,.03,"square",.03);
}
if(P.fuse<=0){
const h=P.players[P.holder];
spawnParticles(P.parts,h.x,h.y,"#ff5878",40,500);
spawnParticles(P.parts,h.x,h.y,GOLD,24,400);
spawnParticles(P.parts,h.x,h.y,"#fff",10,300);
playBoom();
if(P.holder===0){P.s2++;P.banner="P2 SCORES";P.bannerColor=C2;}
else{P.s1++;P.banner="P1 SCORES";P.bannerColor=C1;}
P.players[P.holder].gone=true;
P.freeze=1.6;
msg.textContent=`P1 ${P.s1} : ${P.s2} P2 — FIRST TO ${WIN}`;
}
}
function drawPlayer(ctx,p,i){
if(p.gone)return;
for(const t of p.trail){ctx.globalAlpha=Math.max(0,t.a)*.5;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(t.x,t.y,p.r,0,Math.PI*2);ctx.fill();}
ctx.globalAlpha=1;
const x=Math.round(p.x),y=Math.round(p.y);
const moving=Math.hypot(p.vx,p.vy)>10;
const step=moving?Math.sin(P.t*22)*4:0;
ctx.fillStyle="rgba(0,0,0,.35)";ctx.beginPath();ctx.ellipse(x,y+p.r,p.r*.9,6,0,0,Math.PI*2);ctx.fill();
/* feet */
ctx.fillStyle="#0c0f24";
ctx.fillRect(x-11+step,y+p.r-5,9,6);ctx.fillRect(x+2-step,y+p.r-5,9,6);
/* body */
ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
ctx.fillStyle="rgba(255,255,255,.3)";ctx.beginPath();ctx.arc(x-6,y-7,5,0,Math.PI*2);ctx.fill();
/* eyes look at the other player */
const o=P.players[1-i];
const ang=Math.atan2(o.y-p.y,o.x-p.x),px=Math.cos(ang)*2,py=Math.sin(ang)*2;
const scared=P.holder===i&&P.fuse<3;
ctx.fillStyle="#fff";
ctx.fillRect(x-9,y-8,8,scared?10:8);ctx.fillRect(x+1,y-8,8,scared?10:8);
ctx.fillStyle="#11152b";
ctx.fillRect(x-6+px,y-5+py,4,4);ctx.fillRect(x+3+px,y-5+py,4,4);
/* mouth */
ctx.fillStyle="#11152b";
if(P.holder===i)ctx.fillRect(x-4,y+5,8,scared?6:3);
else ctx.fillRect(x-4,y+6,8,2);
/* bomb on the holder */
if(P.holder===i){
const pulse=1+Math.sin(P.t*(P.fuse<3?30:10))*.12;
const bx=x,by=y-p.r-12-(Math.sin(P.t*8)*2);
ctx.fillStyle=P.fuse<3&&Math.floor(P.t*10)%2?"#ff5878":"#1b1f3a";
ctx.beginPath();ctx.arc(bx,by,10*pulse,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle="rgba(255,255,255,.4)";ctx.fillRect(bx-5,by-5,3,3);
ctx.strokeStyle="#c8a46a";ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(bx+4,by-8);ctx.lineTo(bx+9,by-15);ctx.stroke();
ctx.fillStyle=Math.random()<.5?GOLD:"#ff8c42";
ctx.fillRect(bx+8,by-19,4,4);
}
}
function draw(){
const ctx=NEW_GAMES.potatoGame.ctx;
ctx.fillStyle="#1a1530";ctx.fillRect(0,0,W,H);
for(let x=0;x<W;x+=50)for(let y=0;y<H;y+=50){
if(((x+y)/50)%2===0){ctx.fillStyle="#201a3a";ctx.fillRect(x,y,50,50);}
}
const danger=P.active&&P.freeze<=0&&P.fuse<3;
if(danger){ctx.fillStyle=`rgba(255,0,85,${.05+.05*Math.sin(P.t*20)})`;ctx.fillRect(0,0,W,H);}
for(const w of walls){
ctx.fillStyle="rgba(0,0,0,.35)";ctx.fillRect(w.x+4,w.y+5,w.w,w.h);
ctx.fillStyle="#5a5f8a";ctx.fillRect(w.x,w.y,w.w,w.h);
ctx.fillStyle="#7f86b8";ctx.fillRect(w.x,w.y,w.w,4);
ctx.fillStyle="#454a70";ctx.fillRect(w.x,w.y+w.h-5,w.w,5);
ctx.strokeStyle="#1a1d33";ctx.lineWidth=2;ctx.strokeRect(w.x,w.y,w.w,w.h);
}
ctx.strokeStyle=C2;ctx.lineWidth=4;ctx.strokeRect(2,2,W-4,H-4);
P.players.forEach((p,i)=>drawPlayer(ctx,p,i));
drawParts(ctx,P.parts,5);
/* HUD */
ctx.font="bold 16px Courier New";ctx.textAlign="left";
ctx.fillStyle=C1;ctx.fillText("P1",16,28);drawPips(ctx,46,15,P.s1,WIN,C1,1);
ctx.textAlign="right";ctx.fillStyle=C2;ctx.fillText("P2",W-16,28);drawPips(ctx,W-46-14,15,P.s2,WIN,C2,-1);
ctx.textAlign="left";
/* fuse bar */
if(P.active&&P.freeze<=0){
const frac=clamp(P.fuse/P.fuseMax,0,1);
ctx.fillStyle="#080b18";ctx.fillRect(330,14,240,14);
ctx.fillStyle=danger?"#ff0055":GOLD;ctx.fillRect(332,16,236*frac,10);
ctx.strokeStyle="#4c5d99";ctx.lineWidth=2;ctx.strokeRect(330,14,240,14);
/* dash cooldown dots */
P.players.forEach((p,i)=>{
ctx.fillStyle=p.dashCd<=0?(i?C2:C1):"#26386f";
ctx.fillRect(i?W-70:16,H-24,54,8);
});
}
if(P.freeze>0&&P.banner)drawBanner(ctx,P.banner,P.bannerColor);
if(!P.active)drawBox(ctx,P.winner,"SPACE OR RESTART TO REMATCH",GOLD);
}
registerGame("potatoGame",{title:"Hot Potato",canvas:"potatoCanvas",msgEl:"potatoMsg",resetName:"resetPotato",reset,update,draw,isOver:()=>!P.active});
})();

/* =========================
   PARTY MODE
========================= */
const PARTY_POOL=["pong","duelGame","tugGame","breadGame","hockeyGame","bombGame","dodgeGame","sumoGame","snakeGame","basketGame","volleyGame","raceGame","platformGame","tankGame","spaceGame","potatoGame"];
const party={active:false,p1:0,p2:0,target:3,last:null,pending:false};

const bar=document.createElement("div");
bar.id="partyBar";
bar.dataset.disp="block";
bar.style.cssText="position:fixed;top:10px;left:50%;transform:translateX(-50%);display:none;padding:8px 16px;z-index:65;background:#080b18;border:3px solid #ffff00;font-weight:700;font-size:14px;white-space:nowrap;";
document.body.appendChild(bar);
const champ=document.createElement("div");
champ.id="partyOverlay";
champ.style.cssText="position:fixed;left:0;top:0;right:0;bottom:0;display:none;align-items:center;justify-content:center;background:rgba(8,11,24,.88);z-index:85;";
champ.innerHTML='<div class="settings-box"><h3 id="champTitle"></h3><p id="champSub"></p><button id="champAgain">PLAY AGAIN</button> <button id="champMenu">MENU</button></div>';
document.body.appendChild(champ);

function dots(n){return "●".repeat(n)+"○".repeat(Math.max(0,party.target-n));}
function updatePartyBar(){
if(!party.active){setShow(bar,false);return;}
bar.innerHTML=`PARTY MODE &nbsp; <span style="color:${C1}">P1 ${dots(party.p1)}</span> &nbsp;VS&nbsp; <span style="color:${C2}">${dots(party.p2)} P2</span>`;
setShow(bar,true);
}
function nextPartyGame(){
const pool=PARTY_POOL.filter(g=>g!==party.last);
const id=pool[Math.floor(Math.random()*pool.length)];
party.last=id;party.pending=false;
window.openGame(id);
updatePartyBar();
}
function quitParty(){
party.active=false;party.pending=false;
setShow(champ,false);
updatePartyBar();
}
window.startParty=function(){
party.active=true;party.p1=0;party.p2=0;party.last=null;party.pending=false;
setShow(champ,false);
nextPartyGame();
};
function showChampion(){
const p1=party.p1>party.p2;
document.getElementById("champTitle").textContent=(p1?"PLAYER 1":"PLAYER 2")+" IS THE PARTY CHAMPION!";
document.getElementById("champSub").textContent=`Final score — P1 ${party.p1} : ${party.p2} P2`;
setShow(champ,true);
confetti(p1?[C1,"#fff",GOLD]:[C2,"#fff",GOLD],220);
playWinSound();
}
document.getElementById("champAgain").addEventListener("click",()=>window.startParty());
document.getElementById("champMenu").addEventListener("click",()=>{setShow(champ,false);window.showMenu();});

const _recordWin=window.recordWin;
window.recordWin=function(game,player){
_recordWin(game,player);
if(!party.active||!PARTY_POOL.includes(activeScreen))return;
party[player]++;
updatePartyBar();
if(party.pending)return;
party.pending=true;
setTimeout(()=>{
if(!party.active)return;
if((party.p1>=party.target||party.p2>=party.target)&&party.p1!==party.p2){party.pending=false;showChampion();}
else nextPartyGame();
},2400);
};

/* Shared toolkit for the game packs (engine.js and games_*.js) */
window.PDX_FX={tone,noise,shakeCanvas,confetti,playBounce,playScore,playShoot,playBoom,registerGame,startCountdown,setPaused,circleRectPush,drawParts,drawPips,drawBox,drawBanner,drawFighter,PARTY_POOL,REALTIME,NEW_GAMES};

})();
