/* =====================================================
   PIXEL DUEL — ENGINE
   Micro-game framework + catalog-driven menu (search,
   categories, random game). Loaded after extras.js and
   before the games_*.js packs.

   A game is one call:
     PD.micro({id,title,desc,cat,key,controls,win,party, init,round,update,draw,click,move})
   The framework supplies: screen + canvas + restart button,
   menu card, countdown, pause, loop, scoring/rounds, HUD,
   banners, particles, win sound, confetti, Space-rematch,
   and Party Mode support.
===================================================== */
(function(){
"use strict";
const FX=window.PDX_FX;
const W=900,H=500,DT=1/60;
const C1="#64eaff",C2="#ff72c8",GOLD="#ffe66d",GREEN="#63f59a",RED="#ff5878";
const KEYS=[
{l:"a",r:"d",u:"w",d:"s",a:" "},
{l:"arrowleft",r:"arrowright",u:"arrowup",d:"arrowdown",a:"enter"}
];
const RANDOM_UNLOCK=50;
const CATS=[["all","ALL"],["action","ACTION"],["sports","SPORTS"],["reflex","REFLEX"],["brain","BRAIN"],["board","BOARD"],["arcade","ARCADE"]];

/* ---------- catalog (existing games + every micro game) ---------- */
const catalog=[];
window.PDX_CATALOG=catalog;
const OLD_CATS={pong:"sports",ttt:"board",connectGame:"board",duelGame:"reflex",tugGame:"reflex",breadGame:"action",hockeyGame:"sports",bombGame:"action",dodgeGame:"action",sumoGame:"action",snakeGame:"arcade",basketGame:"sports",volleyGame:"sports",memGame:"brain",reactGame:"reflex",raceGame:"arcade",platformGame:"action",tankGame:"action",spaceGame:"arcade",potatoGame:"action"};
const grid=document.querySelector("#menu .menu-buttons");
grid.querySelectorAll(".game-card").forEach(card=>{
const m=/openGame\('(\w+)'\)/.exec(card.getAttribute("onclick")||"");
if(!m)return;
const id=m[1];
card.dataset.id=id;card.dataset.cat=OLD_CATS[id]||"arcade";
catalog.push({id,title:card.querySelector("strong").textContent,desc:card.querySelector("small").textContent,cat:card.dataset.cat});
});

function addCard(d){
catalog.push({id:d.id,title:d.title,desc:d.desc,cat:d.cat});
const b=document.createElement("button");
b.className="game-card";b.dataset.id=d.id;b.dataset.cat=d.cat;
b.setAttribute("onclick",`openGame('${d.id}')`);
b.innerHTML=`<strong>${d.title.toUpperCase()}</strong><small>${d.desc}</small>`;
b.addEventListener("click",()=>window.playSelectSound&&playSelectSound());
pendingCards.push(b);
scheduleFlush();
}
let pendingCards=[],flushTimer=null;
function scheduleFlush(){
if(flushTimer)return;
flushTimer=requestAnimationFrame(()=>{flushTimer=null;if(pendingCards.length){
const frag=document.createDocumentFragment();
pendingCards.forEach(c=>frag.appendChild(c));
grid.appendChild(frag);pendingCards=[];updateMenu();}
});
}

/* ---------- menu: search, categories, random ---------- */
const tools=document.createElement("div");
tools.id="menuTools";
tools.innerHTML='<input id="gameSearch" type="text" placeholder="SEARCH GAMES..." autocomplete="off"><div id="catChips"></div><div id="gameCount"></div>';
grid.parentNode.insertBefore(tools,grid);
const search=tools.querySelector("#gameSearch");
const chips=tools.querySelector("#catChips");
let activeCat="all";
CATS.forEach(([k,label])=>{
const c=document.createElement("button");
c.className="chip"+(k==="all"?" on":"");c.textContent=label;c.dataset.cat=k;
c.addEventListener("click",()=>{
activeCat=k;chips.querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",x===c));applyFilter();
});
chips.appendChild(c);
});
search.addEventListener("input",applyFilter);

const randomCard=document.createElement("button");
randomCard.className="game-card random-card";
randomCard.innerHTML="<strong>RANDOM GAME</strong><small>Let the arcade decide (or press R)</small>";
randomCard.addEventListener("click",()=>window.randomGame());
grid.insertBefore(randomCard,grid.children[1]||null);

function applyFilter(){
const q=search.value.trim().toLowerCase();
const filtering=q!==""||activeCat!=="all";
let shown=0;
grid.querySelectorAll(".game-card").forEach(card=>{
if(!card.dataset.id){card.style.display=filtering?"none":"";return;}
const t=card.textContent.toLowerCase();
const ok=(activeCat==="all"||card.dataset.cat===activeCat)&&(q===""||t.includes(q));
card.style.display=ok?"":"none";
if(ok)shown++;
});
tools.querySelector("#gameCount").textContent=filtering?`${shown} OF ${catalog.length} GAMES`:`${catalog.length} GAMES`;
}
let menuDirty=false;
function updateMenu(){
menuDirty=true;
randomCard.dataset.locked=catalog.length>=RANDOM_UNLOCK?"0":"1";
randomCard.style.display=(catalog.length>=RANDOM_UNLOCK&&search.value===""&&activeCat==="all")?"":"none";
}
/* applyFilter is O(cards) — defer it once per frame instead of running it
   inside every micro() registration (260 games = quadratic hang) */
requestAnimationFrame(function flushMenu(){
if(menuDirty){menuDirty=false;applyFilter();}
requestAnimationFrame(flushMenu);
});
let lastRandom=null;
window.randomGame=function(){
if(catalog.length<RANDOM_UNLOCK)return;
const pool=catalog.filter(g=>g.id!==lastRandom);
const pick=pool[Math.floor(Math.random()*pool.length)];
lastRandom=pick.id;
openGame(pick.id);
};
addEventListener("keydown",e=>{
if(e.key.toLowerCase()==="r"&&!e.repeat&&activeScreen==="menu"&&document.activeElement!==search&&!e.ctrlKey&&!e.metaKey){
window.randomGame();
}
});
/* menu clicks should never leave the search box eating game keys */
search.addEventListener("keydown",e=>{if(e.key==="Escape")search.blur();e.stopPropagation();});

/* ---------- helpers ---------- */
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rnd(a,b+1));
function seeded(seed){
let a=seed>>>0;
return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
}
function blob(ctx,x,y,r,color,tx,ty,moving,t,scared){
x=Math.round(x);y=Math.round(y);
const step=moving?Math.sin(t*22)*4:0;
ctx.fillStyle="rgba(0,0,0,.35)";ctx.beginPath();ctx.ellipse(x,y+r,r*.9,r*.33,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#0c0f24";
ctx.fillRect(x-r*.6+step,y+r-5,r*.5,6);ctx.fillRect(x+r*.1-step,y+r-5,r*.5,6);
ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
ctx.fillStyle="rgba(255,255,255,.3)";ctx.beginPath();ctx.arc(x-r*.35,y-r*.4,r*.28,0,Math.PI*2);ctx.fill();
const ang=Math.atan2((ty??y)-y,(tx??x+1)-x),px=Math.cos(ang)*2,py=Math.sin(ang)*2;
const e=r*.45,es=scared?r*.55:r*.45;
ctx.fillStyle="#fff";ctx.fillRect(x-e-r*.2,y-r*.45,e,es);ctx.fillRect(x+r*.2,y-r*.45,e,es);
ctx.fillStyle="#11152b";ctx.fillRect(x-e-r*.05+px,y-r*.3+py,r*.22,r*.22);ctx.fillRect(x+r*.35+px,y-r*.3+py,r*.22,r*.22);
ctx.fillRect(x-r*.22,y+r*.32,r*.44,scared?r*.3:r*.12);
}

/* ---------- the micro-game factory ---------- */
function micro(def){
const id=def.id;
const sec=document.createElement("section");
sec.id=id;sec.className="screen";
sec.innerHTML=`<button class="back" onclick="showMenu()">MENU</button><h2>${def.title.toUpperCase()}</h2><p>${def.controls||""}</p><canvas id="${id}Cv" width="900" height="500"></canvas><div id="${id}Msg" class="status"></div>${def.noRestart?"":`<button id="${id}Re">RESTART</button>`}`;
document.body.insertBefore(sec,document.querySelector(".touch-pad"));
const cv=sec.querySelector("canvas"),msg=sec.querySelector(".status");

const prev={};
const g={
w:W,h:H,t:0,score:[0,0],win:def.win||3,mode:"play",timer:0,banner:"",bannerC:"#fff",bannerT:0,parts:[],winner:null,
msg,cv,walls:null,I:[{},{}],pk:{},hover:null,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded,blob
};
const ctx=cv.getContext("2d");
g.ctx=ctx;

function readInputs(){
g.pk={};
for(const k in keys){if(keys[k]&&!prev[k])g.pk[k]=true;}
for(const k in prev)delete prev[k];
for(const k in keys){if(keys[k])prev[k]=true;}
g.I=[0,1].map(i=>{const k=KEYS[i];return{
l:!!keys[k.l],r:!!keys[k.r],u:!!keys[k.u],d:!!keys[k.d],a:!!keys[k.a],
pl:!!g.pk[k.l],pr:!!g.pk[k.r],pu:!!g.pk[k.u],pd:!!g.pk[k.d],pa:!!g.pk[k.a]};});
// AI hook: let the universal AI (if enabled) replace P2/P1 inputs right after
// the fresh I array is built, so the game's update reads AI decisions this frame
if(window.PDX_AI_FRESH_I){try{window.PDX_AI_FRESH_I(g);}catch(e){}}
}
g.walk=(p,i,sp,b)=>{
b=b||{x0:p.r+6,x1:W-p.r-6,y0:p.r+6,y1:H-p.r-6};
const I=g.I[i];let dx=(I.r?1:0)-(I.l?1:0),dy=(I.d?1:0)-(I.u?1:0);
const l=Math.hypot(dx,dy);
if(l){dx/=l;dy/=l;p.fx=dx;p.fy=dy;}
p.vx=dx*sp;p.vy=dy*sp;p.x+=p.vx*DT;p.y+=p.vy*DT;
if(g.walls)for(const w of g.walls)FX.circleRectPush(p,w);
p.x=clamp(p.x,b.x0,b.x1);p.y=clamp(p.y,b.y0,b.y1);
return l>0;
};
g.floor=(a,b,s)=>{
s=s||50;ctx.fillStyle=a;ctx.fillRect(0,0,W,H);ctx.fillStyle=b;
for(let x=0;x<W;x+=s)for(let y=0;y<H;y+=s)if(((x+y)/s)%2===0)ctx.fillRect(x,y,s,s);
};
g.text=(s,x,y,size,color,align)=>{
ctx.font=`bold ${size||16}px Courier New`;ctx.textAlign=align||"left";
ctx.fillStyle="#080b18";ctx.fillText(s,x+2,y+2);
ctx.fillStyle=color||"#fff";ctx.fillText(s,x,y);ctx.textAlign="left";
};
g.burst=(x,y,c,n,sp)=>spawnParticles(g.parts,x,y,c,n||12,sp||260);
g.blob=(p,color,tx,ty,moving,scared)=>blob(ctx,p.x,p.y,p.r,color,tx,ty,moving,g.t,scared);
g.timedHud=(s,time)=>{
g.text("P1 "+s[0],20,30,22,C1);
g.text("P2 "+s[1],W-20,30,22,C2,"right");
g.text(String(Math.max(0,Math.ceil(time))),W/2,32,28,time<6?RED:GOLD,"center");
};
g.banner_=(t,c,sec)=>{g.banner=t;g.bannerC=c||"#fff";g.bannerT=sec||1;};
g.point=(i,text)=>{
if(g.mode!=="play")return;
g.score[i]++;
g.banner_(text||`P${i+1} SCORES`,i?C2:C1,1.3);
FX.playScore();
if(g.score[i]>=g.win)g.end(i);
else{g.mode="between";g.timer=1.3;msg.textContent=`P1 ${g.score[0]} : ${g.score[1]} P2`;}
};
g.add=(i,text)=>{
if(g.mode!=="play")return;
g.score[i]++;
if(text)g.banner_(text,i?C2:C1,.7);
FX.playScore();
if(g.score[i]>=g.win)g.end(i);
};
g.next=(text,color)=>{
if(g.mode!=="play")return;
g.banner_(text,color||"#fff",1.3);g.mode="between";g.timer=1.3;
};
g.end=i=>{
if(g.mode==="over")return;
g.mode="over";g.winner=i;
msg.textContent=i<0?"DRAW!":`PLAYER ${i+1} WINS!`;
if(i>=0)recordWin(def.key||id,i?"p2":"p1");
playWinSound();
if(i<0)setTimeout(()=>{if(g.mode==="over"&&activeScreen===id)window.GAME_HOOKS[id]();},1800);
};
g.byScore=s=>g.end(s[0]>s[1]?0:s[1]>s[0]?1:-1);

function reset(){
g.score=[0,0];g.mode="play";g.banner="";g.bannerT=0;g.parts=[];g.winner=null;g.t=0;
msg.textContent=def.hint||(g.win>1?`FIRST TO ${g.win}`:"");
readInputs();
def.init&&def.init(g);
def.round&&def.round(g);
}
function update(){
g.t+=DT;
updateParticles(g.parts,DT,0);
g.bannerT=Math.max(0,g.bannerT-DT);
readInputs();
if(g.mode==="between"){
g.timer-=DT;
if(g.timer<=0){g.mode="play";def.round&&def.round(g);}
return;
}
if(g.mode!=="play")return;
def.update(g,DT);
}
function draw(){
def.draw(g,ctx);
FX.drawParts(ctx,g.parts,4);
if(g.win>1&&def.hud!==false){
ctx.font="bold 15px Courier New";ctx.textAlign="left";ctx.fillStyle=C1;ctx.fillText("P1",12,22);
FX.drawPips(ctx,40,10,g.score[0],Math.min(g.win,10),C1,1);
ctx.textAlign="right";ctx.fillStyle=C2;ctx.fillText("P2",W-12,22);
FX.drawPips(ctx,W-40-14,10,g.score[1],Math.min(g.win,10),C2,-1);
ctx.textAlign="left";
}
if(g.bannerT>0&&g.mode!=="over")FX.drawBanner(ctx,g.banner,g.bannerC);
if(g.mode==="over")FX.drawBox(ctx,g.winner<0?"DRAW!":`PLAYER ${g.winner+1} WINS!`,"SPACE OR RESTART TO REMATCH",GOLD);
}
function pos(e){
const r=cv.getBoundingClientRect();
return{x:(e.clientX-r.left)*(W/(r.width||W)),y:(e.clientY-r.top)*(H/(r.height||H))};
}
if(def.click)cv.addEventListener("click",e=>{if(g.mode==="over"||countdownActive||paused)return;const p=pos(e);def.click(g,p.x,p.y);});
if(def.move)cv.addEventListener("mousemove",e=>{const p=pos(e);g.hover=p;def.move(g,p.x,p.y);});

FX.registerGame(id,{
title:def.title,canvas:id+"Cv",msgEl:id+"Msg",resetName:"reset_"+id,
reset,update,draw,isOver:()=>g.mode==="over"
});
const re=sec.querySelector("#"+id+"Re");
if(re)re.addEventListener("click",()=>window.GAME_HOOKS[id]());

if(def.party!==false&&!def.click){FX.PARTY_POOL.push(id);FX.REALTIME.push(id);}
else if(def.click){FX.REALTIME.push(id);}
if(!GAMES.includes(def.key||id))GAMES.push(def.key||id);
addCard({id,title:def.title,desc:def.desc,cat:def.cat||"arcade"});
return g;
}

window.PD={micro,FX,W,H,DT,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded,blob};
updateMenu();
})();
