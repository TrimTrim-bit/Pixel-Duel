const keys={};
let activeScreen="menu";
/* title helper: respects the custom site name (look_feel) and special modes */
window.PDX_titleFor=function(sub){
  try{
    if(window.PDX_ACTIVE_MODE&&window.PDX_ACTIVE_MODE()!=="arcade")return document.title;
    const nm=(window.PDX_SITE_NAME&&window.PDX_SITE_NAME())||"Pixel Duel";
    return sub&&sub!=="Arcade"?nm+" � "+sub:nm+" � Arcade";
  }catch(e){return "Pixel Duel � Arcade";}
};
window.PDX_ACTIVE_MODE=window.PDX_ACTIVE_MODE||function(){
  try{
    if(window.schoolActiveV2)return "school";
    if(window.PDX_FAKE_ERROR_ACTIVE&&window.PDX_FAKE_ERROR_ACTIVE())return "error";
    if(window.PDX_PANIC_ACTIVE&&window.PDX_PANIC_ACTIVE())return "panic";
    if(typeof cinemaScreenActive!=="undefined"&&cinemaScreenActive)return "cinema";
  }catch(e){}
  return "arcade";
};
let countdownActive=false;
let paused=false;

/* Fixed 60Hz simulation step so games run at the same speed on 60/120/144Hz screens */
const STEP=1/60;
let _stepAcc=0,_stepLast=performance.now();
function stepGame(fn){
const now=performance.now();
_stepAcc=Math.min(_stepAcc+(now-_stepLast)/1000,.05);
_stepLast=now;
while(_stepAcc>STEP*.9){
if(!countdownActive&&!paused)fn();
_stepAcc-=STEP;
}
}
window.stepGame=stepGame;

const GAMES=["pong","ttt","connect","duel","tug","bread","race","platform","hockey","bomb","dodge","sumo","snake","basket","volley","mem","react"];

function safeStorageGet(key,fallback){
try{
const raw=sessionStorage.getItem(key);
if(raw===null)return fallback;
const parsed=JSON.parse(raw);
return parsed===null||parsed===undefined?fallback:parsed;
}catch(e){return fallback;}
}
function safeStorageSet(key,value){
try{sessionStorage.setItem(key,JSON.stringify(value));}catch(e){}
}

let wins={};
function recordWin(game,player){
const key=`${game}-${player}`;
wins[key]=(wins[key]||0)+1;
safeStorageSet("pixelduel-wins",wins);
renderScoreboard();
}
function loadWins(){
wins=safeStorageGet("pixelduel-wins",{});
renderScoreboard();
}
function winCount(game,player){return wins[`${game}-${player}`]||0;}
function renderScoreboard(){
const totals={p1:0,p2:0};
GAMES.forEach(game=>{
const p1Key=`${game}-p1`;
const p2Key=`${game}-p2`;
totals.p1+=(wins[p1Key]||0);
totals.p2+=(wins[p2Key]||0);
});
const el1=document.getElementById("w1");
const el2=document.getElementById("w2");
if(el1)el1.textContent=totals.p1;
if(el2)el2.textContent=totals.p2;
}

/* Settings */
let settings={
sound:true,
scanlines:true,
volume:1
};
function loadSettings(){
Object.assign(settings,safeStorageGet("pixelduel-settings",{}));
syncSettingsUI();
}
function saveSettings(){
safeStorageSet("pixelduel-settings",settings);
applyScanlines(settings.scanlines);
}
function applyScanlines(on){
let ov=document.getElementById("scanlineOverlay");
if(!ov){
ov=document.createElement("div");
ov.id="scanlineOverlay";
document.body.appendChild(ov);
}
ov.style.display=on?"block":"none";
}

function syncSettingsUI(){
const sndToggle=document.getElementById("sndToggle");
const scanToggle=document.getElementById("scanToggle");
const volRange=document.getElementById("volRange");
const volVal=document.getElementById("volVal");
if(sndToggle)sndToggle.checked=settings.sound;
if(scanToggle)scanToggle.checked=settings.scanlines;
if(volRange)volRange.value=settings.volume;
if(volVal)volVal.textContent=Math.round(settings.volume*100)+"%";
const btn=document.getElementById("menuVolume");
if(btn)btn.textContent=settings.sound?"🔊":"🔇";
}

function toggleSettings(){
const panel=document.getElementById("settingsPanel");
if(!panel)return;
panel.classList.toggle("open");
if(panel.classList.contains("open")){
getAudio();
}
}

function toggleMute(){
settings.sound=!settings.sound;
syncSettingsUI();
saveSettings();
}

syncSettingsUI();

document.getElementById("sndToggle").addEventListener("change",e=>{
settings.sound=e.target.checked;saveSettings();
});
document.getElementById("scanToggle").addEventListener("change",e=>{
settings.scanlines=e.target.checked;saveSettings();
});
document.getElementById("volRange").addEventListener("input",e=>{
settings.volume=parseFloat(e.target.value);
document.getElementById("volVal").textContent=Math.round(settings.volume*100)+"%";
saveSettings();
});

addEventListener("keydown",event=>{
const key=event.key.toLowerCase();

const settingsOpen=document.getElementById("settingsPanel").classList.contains("open");
if(activeScreen!=="menu" && !settingsOpen && [" ","arrowup","arrowdown","arrowleft","arrowright"].includes(key)){
event.preventDefault();
}

if(event.repeat && ["a","l"].includes(key)){
event.preventDefault();
return;
}

keys[key]=true;
});

addEventListener("keyup",event=>{
keys[event.key.toLowerCase()]=false;
});
addEventListener("blur",()=>{for(const k in keys)keys[k]=false;});

/* =========================
NEON PONG
========================= */

const pongCanvas=document.getElementById("pongCanvas");
const pongCtx=pongCanvas.getContext("2d");

/**
 * @typedef {Object} PongState
 * @property {Object|null} p1
 * @property {Object|null} p2
 * @property {Object|null} ball
 * @property {number} score1
 * @property {number} score2
 * @property {any[]} particles
 * @property {number} shake
 * @property {boolean} running
 * @property {string} winner
 */
/** @type {PongState} */
let pong={
p1:null,
p2:null,
ball:null,
score1:0,
score2:0,
particles:[],
shake:0,
running:true,
winner:""
};

function resetPong(){
pong.p1={
x: 30,
y:205,
width:18,
height:90,
speed:420
};

pong.p2={
x:852,
y:205,
width:18,
height:90,
speed:420
};

pong.score1=0;
pong.score2=0;
pong.particles=[];
pong.winner="";
pong.running=true;
servePong(Math.random()<.5?-1:1);
document.getElementById("pongStatus").textContent="FIRST TO 7 WINS";
}

function servePong(direction){
pong.ball={
x:450,
y:250,
size:12,
vx:direction*330,
vy:(Math.random()-.5)*260
};
}

function clamp(value,min,max){
return Math.max(min,Math.min(max,value));
}

function spawnParticles(list,x,y,color,count,spread){
for(let i=0;i<count;i++){
list.push({
x,
y,
vx:(Math.random()-.5)*spread,
vy:(Math.random()-.5)*spread,
life:.45+Math.random()*.35,
maxLife:.8,
color
});
}
}

function updateParticles(list,dt,gravity){
for(let i=list.length-1;i>=0;i--){
const p=list[i];
p.x+=p.vx*dt;
p.y+=p.vy*dt;
p.vy+=gravity*dt;
p.life-=dt;
if(p.life<=0)list.splice(i,1);
}
}

function movePaddle(paddle,up,down,dt){
let direction=0;

if(keys[up]) direction-=1;
if(keys[down]) direction+=1;

paddle.y+=direction*paddle.speed*dt;
paddle.y=clamp(paddle.y,10,500-paddle.height-10);
}

function pongCollision(paddle){
const ball=pong.ball;

return ball.x-ball.size/2<paddle.x+paddle.width &&
ball.x+ball.size/2>paddle.x &&
ball.y-ball.size/2<paddle.y+paddle.height &&
ball.y+ball.size/2>paddle.y;
}

function createPongParticles(x,y,color,count=12){
spawnParticles(pong.particles,x,y,color,count,260);
}

function updatePongParticles(dt){
updateParticles(pong.particles,dt,300);
}

function handlePongWalls(ball){
if(ball.y-ball.size/2<0){
ball.y=ball.size/2;
ball.vy=Math.abs(ball.vy);
createPongParticles(ball.x,ball.y,"#64eaff",5);
}

if(ball.y+ball.size/2>500){
ball.y=500-ball.size/2;
ball.vy=-Math.abs(ball.vy);
createPongParticles(ball.x,ball.y,"#64eaff",5);
}
}

function handlePongPaddleHit(paddle,color){
const ball=pong.ball;
if(!pongCollision(paddle))return false;
if(color==="#64eaff" && !(ball.vx<0))return false;
if(color==="#ff72c8" && !(ball.vx>0))return false;

const hitPosition=(ball.y-(paddle.y+paddle.height/2))/40;
const toward=color==="#64eaff"?1:-1;

ball.x=toward>0?paddle.x+paddle.width+ball.size/2:paddle.x-ball.size/2;
ball.vx=toward*Math.min(Math.abs(ball.vx)*1.06,700);
ball.vy+=hitPosition*180;

createPongParticles(ball.x,ball.y,color,16);
pong.shake=5;
return true;
}

function handlePongScore(scorer){
const ball=pong.ball;
if(scorer==="p2"){
pong.score2++;
createPongParticles(20,ball.y,"#ff72c8",30);
}else{
pong.score1++;
createPongParticles(880,ball.y,"#64eaff",30);
}
checkPongWinner();
if(pong.running)servePong(scorer==="p2"?1:-1);
}

function updatePong(dt){
if(!pong.running)return;

movePaddle(pong.p1,"w","s",dt);
movePaddle(pong.p2,"arrowup","arrowdown",dt);

const ball=pong.ball;
ball.x+=ball.vx*dt;
ball.y+=ball.vy*dt;

handlePongWalls(ball);
handlePongPaddleHit(pong.p1,"#64eaff");
handlePongPaddleHit(pong.p2,"#ff72c8");

if(ball.x<0)handlePongScore("p2");
if(ball.x>900)handlePongScore("p1");

updatePongParticles(dt);
pong.shake=Math.max(0,pong.shake-dt*25);
}

function checkPongWinner(){
if(pong.score1>=7 || pong.score2>=7){
pong.running=false;
pong.winner=pong.score1>pong.score2?"PLAYER 1 WINS!":"PLAYER 2 WINS!";
document.getElementById("pongStatus").textContent=pong.winner;
recordWin("pong",pong.score1>pong.score2?"p1":"p2");
}
}

function drawPixelRect(ctx,x,y,w,h,color){
ctx.fillStyle=color;
ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
}

function drawPong(){
const ctx=pongCtx;

ctx.save();

if(pong.shake>0){
ctx.translate(
(Math.random()-.5)*pong.shake,
(Math.random()-.5)*pong.shake
);
}

ctx.fillStyle="#0d1430";
ctx.fillRect(0,0,900,500);

/* Background pixel stars */
for(let i=0;i<45;i++){
const x=(i*83)%900;
const y=(i*47)%500;
ctx.fillStyle=i%2?"#273b70":"#39518b";
ctx.fillRect(x,y,3,3);
}

/* Center line */
ctx.fillStyle="#ffffff38";
for(let y=10;y<500;y+=28){
ctx.fillRect(447,y,6,14);
}

/* Score */
ctx.font="bold 54px Courier New";
ctx.fillStyle="#64eaff";
ctx.fillText(pong.score1,390,65);
ctx.fillStyle="#ff72c8";
ctx.fillText(pong.score2,490,65);

/* Paddles */
ctx.shadowBlur=18;
ctx.shadowColor="#64eaff";
drawPixelRect(
ctx,
pong.p1.x,
pong.p1.y,
pong.p1.width,
pong.p1.height,
"#64eaff"
);

ctx.shadowColor="#ff72c8";
drawPixelRect(
ctx,
pong.p2.x,
pong.p2.y,
pong.p2.width,
pong.p2.height,
"#ff72c8"
);

/* Paddle highlights */
ctx.shadowBlur=0;
drawPixelRect(ctx,pong.p1.x+4,pong.p1.y+8,4,pong.p1.height-16,"#dfffff");
drawPixelRect(ctx,pong.p2.x+4,pong.p2.y+8,4,pong.p2.height-16,"#ffe0f5");

/* Ball */
ctx.shadowBlur=25;
ctx.shadowColor="#fff";
drawPixelRect(
ctx,
pong.ball.x-pong.ball.size/2,
pong.ball.y-pong.ball.size/2,
pong.ball.size,
pong.ball.size,
"#ffffff"
);
ctx.shadowBlur=0;

/* Particles */
pong.particles.forEach(p=>{
ctx.globalAlpha=Math.max(0,p.life/p.maxLife);
drawPixelRect(ctx,p.x,p.y,5,5,p.color);
});

ctx.globalAlpha=1;

if(!pong.running){
ctx.fillStyle="#080b18cc";
ctx.fillRect(150,185,600,120);

ctx.strokeStyle="#ffe66d";
ctx.lineWidth=4;
ctx.strokeRect(150,185,600,120);

ctx.fillStyle="#ffe66d";
ctx.font="bold 34px Courier New";
ctx.textAlign="center";
ctx.fillText(pong.winner,450,255);
ctx.font="16px Courier New";
ctx.fillText("PRESS RESTART TO PLAY AGAIN",450,285);
ctx.textAlign="left";
}

ctx.restore();
}

let pongLastTime=performance.now();

function pongLoop(now){
if(activeScreen!=="pong"){
pongLastTime=now;
requestAnimationFrame(pongLoop);
return;
}

const dt=Math.min((now-pongLastTime)/1000,.035);
pongLastTime=now;

if(!countdownActive&&!paused)updatePong(dt);
drawPong();

requestAnimationFrame(pongLoop);
}

resetPong();
requestAnimationFrame(pongLoop);

/* =========================
WESTERN DUEL
========================= */

const duelCanvas=document.getElementById("duelCanvas");
const duelCtx=duelCanvas.getContext("2d");
const duelCue=document.getElementById("duelCue");
const duelMsg=document.getElementById("duelMsg");

/**
 * @typedef {Object} DuelState
 * @property {boolean} active
 * @property {boolean} ready
 * @property {any} timer
 * @property {number} idleTime
 * @property {string} winner
 * @property {string} shotBy
 * @property {number} shootAnim
 * @property {number} hitAnim
 * @property {number} shooterX
 * @property {number} shooterY
 * @property {number} targetX
 * @property {number} targetY
 * @property {Object|null} bulletTrail
 * @property {any[]} muzzleFlashes
 * @property {number} cowboyBob
 */
/** @type {DuelState} */
let duel = {
active:false,
ready:false,
timer:null,
idleTime:0,
winner:"",
shotBy:"",
shootAnim:0,
hitAnim:0,
shooterX:0,
shooterY:0,
targetX:0,
targetY:0,
bulletTrail:null,
muzzleFlashes:[],
cowboyBob:0
};

function drawCowboy(x, y, facing, shoot, hit){
const ctx=duelCtx;
ctx.save();
ctx.translate(x, y);
if(facing < 0) ctx.scale(-1, 1);

if(shoot > 0){
ctx.translate(0, -Math.sin(shoot * Math.PI) * 8);
ctx.rotate(Math.sin(shoot * Math.PI) * 0.15);
}

if(hit > 0){
ctx.translate(Math.sin(hit * Math.PI) * 30, 0);
ctx.rotate(hit * Math.PI * 1.2);
ctx.globalAlpha = 1 - hit * 0.5;
}

/* Shadow */
ctx.fillStyle="rgba(0,0,0,0.3)";
ctx.beginPath();ctx.ellipse(0, 62, 26, 6, 0, 0, Math.PI*2);ctx.fill();

/* Legs */
ctx.fillStyle="#4a3728";
ctx.fillRect(-12, 14, 12, 30);
ctx.fillRect(0, 14, 12, 30);

/* Boots */
ctx.fillStyle="#1a100a";
ctx.fillRect(-14, 44, 16, 10);
ctx.fillRect(-2, 44, 16, 10);

/* Body */
ctx.fillStyle="#d8b45a";
ctx.fillRect(-16, -16, 32, 48);
ctx.fillStyle="#8b0000";
ctx.fillRect(-16, -4, 32, 10);
ctx.fillStyle="#5c4033";
ctx.fillRect(-12, -8, 24, 18);

/* Head */
ctx.fillStyle="#f0c080";
ctx.beginPath();ctx.arc(0, -36, 18, 0, Math.PI*2);ctx.fill();
ctx.fillStyle="#3d2b1f";
ctx.fillRect(-4, -46, 4, 4);
ctx.fillRect(0, -46, 4, 4);

/* Hat */
ctx.fillStyle="#3d2b1f";
ctx.fillRect(-22, -50, 44, 12);
ctx.fillRect(-14, -58, 28, 10);

/* Gun */
ctx.fillStyle="#2a1e15";
const gunX = facing > 0 ? 16 : -30;
const gunY = -10;
ctx.fillRect(gunX, gunY, 26, 10);
ctx.fillStyle="#5c4033";
ctx.fillRect(gunX + (facing > 0 ? 4 : -14), gunY + 2, 8, 6);
ctx.fillStyle="#ffe66d";
ctx.fillRect(gunX + (facing > 0 ? 22 : -6), gunY + 1, 4, 4);

/* Muzzle flash when shooting */
if(shoot > 0.8 && shoot < 0.95){
ctx.fillStyle="#ffe66d";
ctx.beginPath();ctx.arc(gunX + (facing > 0 ? 26 : -10), gunY + 2, 6, 0, Math.PI*2);ctx.fill();
}

ctx.restore();
}

function drawDuelScene(ctx){
ctx.fillStyle="#ed9a5a";
ctx.fillRect(0,0,900,360);

/* Ground */
ctx.fillStyle="#75412f";
ctx.fillRect(0, 240, 900, 120);
ctx.fillStyle="#4a292c";
ctx.fillRect(0, 240, 900, 4);

/* Sun */
ctx.fillStyle="#ffe878";
ctx.beginPath();ctx.arc(450, 60, 34, 0, Math.PI*2);ctx.fill();
ctx.strokeStyle="#d87542";ctx.lineWidth=4;ctx.beginPath();ctx.arc(450, 60, 34, 0, Math.PI*2);ctx.stroke();

/* Draw cowboys */
const p1X = 150 + duel.cowboyBob;
const p2X = 750 - duel.cowboyBob;

drawCowboy(p1X, 210, 1, duel.shootAnim, 0);
drawCowboy(p2X, 210, -1, 0, duel.shotBy==="l" ? duel.hitAnim : 0);
}

function drawDuelBulletEffects(ctx){
/* Bullet trail */
if(duel.bulletTrail){
const {x1,y1,x2,y2,alpha} = duel.bulletTrail;
ctx.save();
ctx.globalAlpha = alpha;
ctx.strokeStyle="#ffe66d";
ctx.lineWidth=5;
ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
ctx.shadowBlur=12;ctx.shadowColor="#fff";
ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
ctx.restore();
}

/* Muzzle flashes */
duel.muzzleFlashes.forEach(m=>{
ctx.save();
ctx.globalAlpha = m.alpha;
ctx.fillStyle="#ffe66d";
ctx.beginPath();ctx.arc(m.x, m.y, 8, 0, Math.PI*2);ctx.fill();
ctx.restore();
});
}

function drawDuelCue(ctx){
/* Cue text */
if(duel.ready){
ctx.fillStyle="#ffe66d";
ctx.font="bold 32px Courier New";
ctx.textAlign="center";
ctx.fillText("DRAW!", 450, 180);
} else if(duel.active){
ctx.fillStyle="#ffffff";
ctx.font="bold 24px Courier New";
ctx.textAlign="center";
ctx.fillText("WAIT...", 450, 180);
}
}

function drawDuel(){
const ctx=duelCtx;
drawDuelScene(ctx);
drawDuelBulletEffects(ctx);
drawDuelCue(ctx);
}

function startDuel(){
clearTimeout(duel.timer);

duel.active=true;
duel.ready=false;
duel.winner="";
duel.shotBy="";
duel.shootAnim=0;
duel.hitAnim=0;
duel.bulletTrail=null;
duel.muzzleFlashes=[];
duel.cowboyBob=0;

duelCue.textContent="WAIT...";
duelMsg.textContent="DON'T DRAW TOO EARLY";

duel.timer=setTimeout(()=>{
if(!duel.active)return;

duel.ready=true;
duelMsg.textContent="PRESS YOUR SHOOT KEY!";
},2500+Math.random()*3000);
}

function duelKey(key){
if(!duel.active)return;
if(key!=="a" && key!=="l")return;

if(!duel.ready){
clearTimeout(duel.timer);
duel.active=false;
duelMsg.textContent=key==="a"
?"PLAYER 2 WINS — PLAYER 1 DREW EARLY"
:"PLAYER 1 WINS — PLAYER 2 DREW EARLY";
recordWin("duel",key==="a"?"p2":"p1");
setTimeout(()=>{if(activeScreen==="duelGame")startDuel();},1800);
return;
}

duel.active=false;
duel.ready=false;
duel.shotBy=key;
duel.shootAnim=0;
duel.hitAnim=0;

if(key==="a"){
duel.winner="PLAYER 1 WINS!";
duel.shooterX=176; duel.shooterY=200;
duel.targetX=724; duel.targetY=200;
recordWin("duel","p1");
}else{
duel.winner="PLAYER 2 WINS!";
duel.shooterX=724; duel.shooterY=200;
duel.targetX=176; duel.targetY=200;
recordWin("duel","p2");
}

duel.bulletTrail={x1:duel.shooterX,y1:duel.shooterY,x2:duel.targetX,y2:duel.targetY,alpha:1};
duel.muzzleFlashes=[
{x:duel.shooterX,y:duel.shooterY,alpha:1},
{x:duel.targetX,y:duel.targetY,alpha:1}
];

duelMsg.textContent=duel.winner;
setTimeout(()=>{if(activeScreen==="duelGame")startDuel();},1800);
}

function updateDuel(dt){
if(!duel.active && duel.shootAnim<=0 && duel.hitAnim<=0)return;

if(duel.active && !duel.ready){
duel.cowboyBob=Math.sin(duel.idleTime*3)*3;
duel.idleTime+=dt;
}

if(duel.shootAnim<1){
duel.shootAnim+=dt*3;
if(duel.shootAnim>=1)duel.shootAnim=1;
}

if(duel.hitAnim<1){
duel.hitAnim+=dt*2;
if(duel.hitAnim>=1)duel.hitAnim=1;
}

if(duel.bulletTrail){
duel.bulletTrail.alpha-=dt*3;
if(duel.bulletTrail.alpha<=0)duel.bulletTrail=null;
}

duel.muzzleFlashes.forEach(m=>{
m.alpha-=dt*4;
});
duel.muzzleFlashes=duel.muzzleFlashes.filter(m=>m.alpha>0);
}

let duelLastTime=performance.now();

function duelLoop(now){
if(activeScreen!=="duelGame"){
duelLastTime=now;
requestAnimationFrame(duelLoop);
return;
}

const dt=(now-duelLastTime)/1000;
duelLastTime=now;

updateDuel(dt);
drawDuel();
requestAnimationFrame(duelLoop);
}

requestAnimationFrame(duelLoop);

/* =========================
TUG OF WAR (REMAKE)
========================= */

const tugCanvas=document.getElementById("tugCanvas");
const tugCtx=tugCanvas.getContext("2d");
const tugMsg=document.getElementById("tugMsg");

/**
 * @typedef {Object} TugState
 * @property {boolean} active
 * @property {number} position
 * @property {number} velocity
 * @property {number} p1Presses
 * @property {number} p2Presses
 * @property {any[]} particles
 * @property {number} lastP1
 * @property {number} lastP2
 * @property {number} shake
 */
/** @type {TugState} */
let tug={
active:false,
position:0,
velocity:0,
p1Presses:0,
p2Presses:0,
particles:[],
lastP1:0,
lastP2:0,
shake:0
};

function startTug(){
tug.active=true;
tug.position=0;
tug.velocity=0;
tug.p1Presses=0;
tug.p2Presses=0;
tug.particles=[];
tug.shake=0;
tugMsg.textContent="PULL! A / L — FIRST TO THE END WINS";
}

function tugPress(key){
if(!tug.active)return;

const now=performance.now();

if(key==="a" && now-tug.lastP1>70){
tug.lastP1=now;
tug.p1Presses++;
tug.velocity-=22;
tug.shake=6;
createTugParticles(230,"#64eaff",10);
playHitSound();
}

if(key==="l" && now-tug.lastP2>70){
tug.lastP2=now;
tug.p2Presses++;
tug.velocity+=22;
tug.shake=6;
createTugParticles(670,"#ff72c8",10);
playHitSound();
}
}

function createTugParticles(x,color,count=10){
spawnParticles(tug.particles,x,205,color,count,140);
}

function updateTug(dt){
if(tug.active){
/* Velocity decay */
tug.velocity*=Math.pow(.15,dt);
tug.position+=tug.velocity*dt*12;

tug.position=clamp(tug.position,-300,300);

if(tug.position<=-300){
tug.position=-300;
tug.active=false;
tugMsg.textContent="PLAYER 1 WINS!";
recordWin("tug","p1");
playWinSound();
}

if(tug.position>=300){
tug.position=300;
tug.active=false;
tugMsg.textContent="PLAYER 2 WINS!";
recordWin("tug","p2");
playWinSound();
}
}

updateParticles(tug.particles,dt,400);

tug.shake=Math.max(0,tug.shake-dt*30);
}

function drawTug(){
const ctx=tugCtx;

ctx.fillStyle="#101936";
ctx.fillRect(0,0,900,400);

/* Pixel background */
for(let i=0;i<35;i++){
ctx.fillStyle=i%2?"#1c2d5d":"#263b72";
ctx.fillRect((i*97)%900,(i*43)%180,4,4);
}

/* Ground */
ctx.fillStyle="#26304d";
ctx.fillRect(0,270,900,130);

for(let x=0;x<900;x+=40){
ctx.fillStyle=x%80?"#354365":"#45557a";
ctx.fillRect(x,270,20,6);
}

/* Win zones */
ctx.fillStyle="#64eaff";
ctx.fillRect(20,150,130,125);

ctx.fillStyle="#ff72c8";
ctx.fillRect(750,150,130,125);

/* Center line */
ctx.fillStyle="#ffe66d";
ctx.fillRect(448,130,5,140);

/* Rope - sag depends on tension */
const tension=Math.abs(tug.position)/300;
const sag=40-tension*25;
const ropeX=450+tug.position;

ctx.save();
ctx.translate(0,0);
ctx.strokeStyle="#d6a15a";
ctx.lineWidth=16;
ctx.lineCap="round";
ctx.beginPath();
ctx.moveTo(130,205);
ctx.quadraticCurveTo(450+tug.position*0.4,205-sag,770,205);
ctx.stroke();

/* Rope strands */
ctx.strokeStyle="#a67c3e";
ctx.lineWidth=5;
ctx.beginPath();
ctx.moveTo(130,200);
ctx.quadraticCurveTo(450+tug.position*0.4,200-sag+8,770,200);
ctx.stroke();

ctx.strokeStyle="#8e5c3a";
ctx.lineWidth=4;
for(let x=150;x<750;x+=26){
const t=(x-150)/600;
const sx=130+(770-130)*t;
const sy=205-sag*Math.sin(t*Math.PI);
ctx.beginPath();
ctx.moveTo(sx-6,sy-4);
ctx.lineTo(sx+6,sy+4);
ctx.stroke();
}
ctx.restore();

/* Flag at center */
ctx.fillStyle="#ffe66d";
ctx.fillRect(ropeX-4,140,8,50);
ctx.fillStyle="#ff5878";
ctx.fillRect(ropeX+4,140,34,22);

/* Players pulling */
ctx.save();
if(tug.shake>0){
ctx.translate(
(Math.random()-.5)*tug.shake,
(Math.random()-.5)*tug.shake
);
}

/* P1 - left, facing right, pulling */
drawTugPlayer(170,210,"#64eaff",false);

/* P2 - right, facing left, pulling */
drawTugPlayer(730,210,"#ff72c8",true);

ctx.restore();

/* Labels */
ctx.font="bold 20px Courier New";
ctx.fillStyle="#dfffff";
ctx.fillText("PLAYER 1",45,125);
ctx.fillStyle="#ffe0f5";
ctx.fillText("PLAYER 2",735,125);

/* Pressure meter */
ctx.fillStyle="#080b18";
ctx.fillRect(220,365,460,18);

ctx.fillStyle="#64eaff";
if(tug.position<0){
ctx.fillRect(450+tug.position,365,-tug.position,18);
}

ctx.fillStyle="#ff72c8";
if(tug.position>0){
ctx.fillRect(450,365,tug.position,18);
}

ctx.strokeStyle="#ffffff";
ctx.strokeRect(220,365,460,18);

/* Particles */
tug.particles.forEach(p=>{
ctx.globalAlpha=Math.max(0,p.life/.9);
ctx.fillStyle=p.color;
ctx.fillRect(p.x,p.y,6,6);
});

ctx.globalAlpha=1;

if(!tug.active && Math.abs(tug.position)>=300){
ctx.fillStyle="#080b18cc";
ctx.fillRect(230,70,440,75);
ctx.fillStyle="#ffe66d";
ctx.font="bold 27px Courier New";
ctx.textAlign="center";
ctx.fillText(tug.position<0?"PLAYER 1 WINS!":"PLAYER 2 WINS!",450,115);
ctx.textAlign="left";
}
}

function drawTugPlayer(x,y,color,flip){
const ctx=tugCtx;

ctx.save();
ctx.translate(x,y);
if(flip)ctx.scale(-1,1);

/* Body */
ctx.fillStyle=color;
ctx.fillRect(-24,-50,48,64);

/* Arms gripping rope - reach toward center */
ctx.fillStyle="#2a1e15";
if(!flip){
ctx.fillRect(20,-22,26,10);
ctx.fillRect(46,-26,10,14);
} else {
ctx.fillRect(-46,-22,26,10);
ctx.fillRect(-56,-26,10,14);
}

/* Head */
ctx.fillStyle="#f0c080";
ctx.fillRect(-16,-86,32,30);
ctx.fillStyle="#3d2b1f";
ctx.fillRect(-8,-76,6,6);
ctx.fillRect(2,-76,6,6);

/* Hat */
ctx.fillStyle="#3d2b1f";
ctx.fillRect(-20,-92,40,10);
ctx.fillRect(-14,-100,28,10);

/* Legs braced */
ctx.fillStyle="#4a3728";
ctx.fillRect(-20,14,16,36);
ctx.fillRect(4,14,16,36);

/* Boots */
ctx.fillStyle="#1a100a";
ctx.fillRect(-22,50,20,8);
ctx.fillRect(2,50,20,8);

ctx.restore();
}

let tugLast=performance.now();

function tugLoop(now){
if(activeScreen!=="tugGame"){
tugLast=now;
requestAnimationFrame(tugLoop);
return;
}

const dt=Math.min((now-tugLast)/1000,.04);
tugLast=now;

updateTug(dt);
drawTug();

requestAnimationFrame(tugLoop);
}

function handleTugKey(key){
if(document.getElementById("tugGame").classList.contains("active")){
tugPress(key);
}
}

addEventListener("keydown",event=>{
if(event.repeat)return;
handleTugKey(event.key.toLowerCase());
});

startTug();
tug.active=false;
tugMsg.textContent="PRESS START";
requestAnimationFrame(tugLoop);
/* BREAD WARS (REMAKE)
========================= */

const breadCanvas=document.getElementById("breadCanvas");
const breadCtx=breadCanvas.getContext("2d");
const breadMsg=document.getElementById("breadMsg");

/**
 * @typedef {Object} BreadState
 * @property {boolean} active
 * @property {Object} p1
 * @property {Object} p2
 * @property {Object} loaf
 * @property {any[]} particles
 * @property {boolean} throwLock
 * @property {string} winner
 */
/** @type {BreadState} */
let bread={
active:true,
p1:null,
p2:null,
loaf:null,
particles:[],
throwLock:false,
winner:""
};

function resetBread(){
bread.p1={x:180,y:370,vx:0,dir:1,score:0,stun:0,color:"#64eaff",facing:1};
bread.p2={x:720,y:370,vx:0,dir:-1,score:0,stun:0,color:"#ff72c8",facing:-1};
bread.loaf={x:450,y:340,vx:0,vy:0,held:null,thrown:false,owner:null};
bread.particles=[];
bread.throwLock=false;
bread.winner="";
bread.active=true;
breadMsg.textContent="GRAB THE BREAD — THROW IT INTO THEIR HOME!";
}

function moveBird(bird,left,right,dt){
if(bird.stun>0){bird.stun-=dt;bird.vx=0;return;}
bird.vx=0;
if(keys[left]){bird.vx=-260;bird.facing=-1;}
if(keys[right]){bird.vx=260;bird.facing=1;}
bird.x+=bird.vx*dt;
bird.x=clamp(bird.x,50,850);
}

function overlapsRect(a,b){
return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
}

function birdBox(bird){
return {x:bird.x-28,y:bird.y-40,w:56,h:64};
}

function updateBread(){
if(!bread.active)return;

const dt=1/60;

moveBird(bread.p1,"a","d",dt);
moveBird(bread.p2,"arrowleft","arrowright",dt);

handleBreadGrab();
handleBreadThrow();

const loaf=bread.loaf;

if(loaf.thrown){
loaf.x+=loaf.vx*dt;
loaf.y+=loaf.vy*dt;
loaf.vy+=900*dt;

const target=loaf.owner==="p1"?bread.p2:bread.p1;
if(target.stun<=0 && overlapsRect({x:loaf.x-14,y:loaf.y-14,w:28,h:28},birdBox(target))){
target.stun=1.4;
loaf.thrown=false;
createBreadParticles(target.x,target.y,"#fff",24);
playHitSound();
}
}

resolveLoafLanding();
updateBreadParticles(dt);
}

function handleBreadGrab(){
const loaf=bread.loaf;
if(loaf.held || loaf.thrown)return;
if(overlapsRect(birdBox(bread.p1),{x:loaf.x-16,y:loaf.y-16,w:32,h:32})){
loaf.held="p1";loaf.owner="p1";
createBreadParticles(loaf.x,loaf.y,bread.p1.color);
}else if(overlapsRect(birdBox(bread.p2),{x:loaf.x-16,y:loaf.y-16,w:32,h:32})){
loaf.held="p2";loaf.owner="p2";
createBreadParticles(loaf.x,loaf.y,bread.p2.color);
}
}

function handleBreadThrow(){
const loaf=bread.loaf;
if(!loaf.held)return;
const carrier=loaf.held==="p1"?bread.p1:bread.p2;
loaf.x=carrier.x;
loaf.y=carrier.y-52;
const throwKey=loaf.held==="p1"?"w":"arrowup";
if(keys[throwKey] && !bread.throwLock){
bread.throwLock=true;
loaf.thrown=true;
loaf.held=null;
loaf.vx=carrier.facing*300;
loaf.vy=-420;
createBreadParticles(loaf.x,loaf.y,carrier.color,20);
}
if(!keys["w"] && !keys["arrowup"])bread.throwLock=false;
}

function resolveLoafLanding(){
const loaf=bread.loaf;
if(!loaf.thrown || loaf.y+16<330)return;
loaf.thrown=false;
const zoneX=loaf.x;
let scored=null;
if(zoneX<130 && loaf.owner==="p2")scored="p2";
if(zoneX>770 && loaf.owner==="p1")scored="p1";
if(scored){
bread[scored==="p1"?"p1":"p2"].score++;
createBreadParticles(loaf.x,loaf.y,scored==="p1"?"#64eaff":"#ff72c8",30);
playWinSound();
if(bread.p1.score>=3||bread.p2.score>=3){
bread.active=false;
bread.winner=bread.p1.score>=3?"PLAYER 1 WINS!":"PLAYER 2 WINS!";
breadMsg.textContent=bread.winner;
recordWin("bread",bread.winner.includes("1")?"p1":"p2");
}else{
breadMsg.textContent="POINT! GRAB THE BREAD AGAIN!";
loaf.x=450;loaf.y=340;loaf.vx=0;loaf.vy=0;loaf.held=null;loaf.owner=null;
}
}else{
breadMsg.textContent="BREAD DROPPED — GRAB IT!";
loaf.x=450;loaf.y=340;loaf.vx=0;loaf.vy=0;loaf.held=null;loaf.owner=null;
}
}

function updateBreadParticles(dt){
updateParticles(bread.particles,dt,500);
}

function createBreadParticles(x,y,color,count=12){
spawnParticles(bread.particles,x,y,color,count,220);
}

function drawBird(bird){
const ctx=breadCtx;
ctx.save();
ctx.translate(bird.x,bird.y);
if(bird.facing<0)ctx.scale(-1,1);

/* Stun flash */
const flash=bird.stun>0 && Math.floor(bird.stun*20)%2===0;
if(flash)ctx.globalAlpha=.5;

/* Body */
ctx.fillStyle=bird.color;
ctx.fillRect(-28,-22,56,44);
ctx.fillRect(-38,-5,16,28);

/* Wings */
ctx.fillStyle="#dffcff";
ctx.fillRect(-44,0,22,12);
ctx.fillRect(22,0,22,12);

/* Head */
ctx.fillStyle="#f1f5ff";
ctx.fillRect(-22,-52,44,36);

/* Eye */
ctx.fillStyle="#11152b";
ctx.fillRect(6,-44,6,6);

/* Beak */
ctx.fillStyle="#ffe66d";
ctx.fillRect(22,-36,22,10);

/* Feet */
ctx.fillStyle="#ffb84d";
ctx.fillRect(-16,22,9,14);
ctx.fillRect(7,22,9,14);

/* Stun stars */
if(bird.stun>0){
ctx.fillStyle="#ffe66d";
ctx.font="14px Courier New";
ctx.fillText("!!",-10,-68);
}

ctx.restore();
ctx.globalAlpha=1;
}

function drawBread(){
const ctx=breadCtx;

ctx.fillStyle="#9ad8ef";
ctx.fillRect(0,0,900,500);

/* Clouds */
ctx.fillStyle="#dff8ff";
for(let x=40;x<900;x+=170){
ctx.fillRect(x,75+(x%3)*10,90,16);
ctx.fillRect(x+20,58+(x%3)*10,45,18);
}

/* Grass */
ctx.fillStyle="#4cae67";
ctx.fillRect(0,330,900,170);
for(let x=0;x<900;x+=28){
ctx.fillStyle=x%56?"#388b59":"#66c879";
ctx.fillRect(x,330,14,6);
}

/* Home zones */
ctx.fillStyle="#64eaff88";
ctx.fillRect(8,340,104,120);
ctx.fillStyle="#ff72c888";
ctx.fillRect(788,340,104,120);
ctx.fillStyle="#11152b";
ctx.font="bold 14px Courier New";
ctx.fillText("P1 HOME",18,380);
ctx.fillText("P2 HOME",798,380);

/* Score */
ctx.fillStyle="#11152b";
ctx.font="bold 20px Courier New";
ctx.textAlign="center";
ctx.fillStyle=bread.p1.color;
ctx.fillText(bread.p1.score,240,42);
ctx.fillStyle=bread.p2.color;
ctx.fillText(bread.p2.score,660,42);
ctx.fillStyle="#ffe66d";
ctx.fillText("FIRST TO 3",450,42);
ctx.textAlign="left";

/* Bread */
const loaf=bread.loaf;
ctx.fillStyle="#b96b36";
ctx.fillRect(loaf.x-14,loaf.y-10,28,20);
ctx.fillStyle="#f5bd61";
ctx.fillRect(loaf.x-10,loaf.y-6,20,12);

/* Arc aim line when holding */
if(loaf.held){
const carrier=loaf.held==="p1"?bread.p1:bread.p2;
ctx.strokeStyle="#ffe66d";
ctx.lineWidth=2;
ctx.beginPath();
ctx.moveTo(carrier.x,carrier.y-52);
ctx.lineTo(carrier.x+carrier.facing*90,carrier.y-80);
ctx.stroke();
}

drawBird(bread.p1);
drawBird(bread.p2);

/* Particles */
bread.particles.forEach(p=>{
ctx.globalAlpha=Math.max(0,p.life/.9);
ctx.fillStyle=p.color;
ctx.fillRect(p.x,p.y,5,5);
});
ctx.globalAlpha=1;

/* Stun timers */
[bread.p1,bread.p2].forEach((b,i)=>{
if(b.stun>0){
ctx.fillStyle="rgba(255,255,255,.35)";
ctx.fillRect(b.x-22,b.y-70,44,6);
ctx.fillStyle="#ffe66d";
ctx.fillRect(b.x-22,b.y-70,44*(b.stun/1.4),6);
}
});

if(!bread.active){
ctx.fillStyle="#11152bdd";
ctx.fillRect(245,175,410,90);
ctx.fillStyle="#ffe66d";
ctx.font="bold 28px Courier New";
ctx.textAlign="center";
ctx.fillText(bread.winner,450,225);
ctx.font="15px Courier New";
ctx.fillText("PRESS RESTART TO REMATCH",450,255);
ctx.textAlign="left";
}
}

function breadLoop(){
if(activeScreen!=="breadGame"){
requestAnimationFrame(breadLoop);
return;
}
stepGame(updateBread);
drawBread();
requestAnimationFrame(breadLoop);
}

addEventListener("keydown",event=>{
if(document.getElementById("breadGame").classList.contains("active")){
const k=event.key.toLowerCase();
if(["a","d","arrowleft","arrowright","w","arrowup"].includes(k))event.preventDefault();
}
});

resetBread();
requestAnimationFrame(breadLoop);

/* =========================
AIR HOCKEY
========================= */

const hockeyCanvas=document.getElementById("hockeyCanvas");
const hockeyCtx=hockeyCanvas.getContext("2d");
const hockeyMsg=document.getElementById("hockeyMsg");

let hockey={
active:true,
p1:null,
p2:null,
puck:null,
score1:0,
score2:0,
particles:[],
winner:""
};

function resetHockey(){
hockey.p1={x:150,y:250,vx:0,vy:0,r:24,color:"#64eaff",dir:1};
hockey.p2={x:750,y:250,vx:0,vy:0,r:24,color:"#ff72c8",dir:-1};
hockey.puck={x:450,y:250,vx:0,vy:0,r:14};
hockey.score1=0;
hockey.score2=0;
hockey.particles=[];
hockey.winner="";
hockey.active=true;
hockeyMsg.textContent="FIRST TO 5 WINS";
}

function moveMallet(m,up,down,left,right,dt){
m.vx=0;m.vy=0;
if(keys[up])m.vy=-420;
if(keys[down])m.vy=420;
if(keys[left])m.vx=-420;
if(keys[right])m.vx=420;
m.x+=m.vx*dt;
m.y+=m.vy*dt;
/* Stay in own half plus neutral zone */
const half=m===hockey.p1?450:450;
const minX=m===hockey.p1?60:450;
const maxX=m===hockey.p1?440:840;
m.x=clamp(m.x,minX,maxX);
m.y=clamp(m.y,70,430);
}

function resolveCircle(c1,c2){
const dx=c2.x-c1.x;
const dy=c2.y-c1.y;
const dist=Math.sqrt(dx*dx+dy*dy);
const minDist=c1.r+c2.r;
if(dist<minDist){
const nx=dx/dist,ny=dy/dist;
const overlap=minDist-dist;
c1.x-=nx*overlap*0.5;
c1.y-=ny*overlap*0.5;
c2.x+=nx*overlap*0.5;
c2.y+=ny*overlap*0.5;
/* Relative velocity along normal */
const rvx=c2.vx-c1.vx;
const rvy=c2.vy-c1.vy;
const velAlongNormal=rvx*nx+rvy*ny;
if(velAlongNormal<0){
const e=0.9;
const j=-(1+e)*velAlongNormal;
const im1=1/(c1.mass||1);
const im2=1/(c2.mass||1);
c1.vx-=j*im1*nx;
c1.vy-=j*im1*ny;
c2.vx+=j*im2*nx;
c2.vy+=j*im2*ny;
}
}
}

function updateHockey(){
if(!hockey.active)return;
const dt=1/60;

moveMallet(hockey.p1,"w","s","a","d",dt);
moveMallet(hockey.p2,"arrowup","arrowdown","arrowleft","arrowright",dt);

const p=hockey.puck;
p.x+=p.vx*dt;
p.y+=p.vy*dt;
p.vx*=Math.pow(0.99,dt*60);
p.vy*=Math.pow(0.99,dt*60);

/* Bounce off top/bottom walls */
if(p.y-p.r<30){p.y=30+p.r;p.vy=-p.vy*1.05;createHockeyParticles(p.x,p.y,"#fff",6);}
if(p.y+p.r>470){p.y=470-p.r;p.vy=-p.vy*1.05;createHockeyParticles(p.x,p.y,"#fff",6);}

/* Bounce off side walls except goals */
if(p.x-p.r<10){
if(p.y>170 && p.y<330){/* goal left */scoreHockey(2);}else{p.x=10+p.r;p.vx=-p.vx;}
}
if(p.x+p.r>890){
if(p.y>170 && p.y<330){/* goal right */scoreHockey(1);}else{p.x=890-p.r;p.vx=-p.vx;}
}

/* Mallet collisions */
const hit1=resolveCircle(hockey.p1,p);
const hit2=resolveCircle(hockey.p2,p);
/* add a little kick on hit */
if(hit1||hit2){p.vx*=1.08;p.vy*=1.08;}

/* Friction on mallets */
hockey.p1.vx*=Math.pow(0.85,dt*60);
hockey.p1.vy*=Math.pow(0.85,dt*60);
hockey.p2.vx*=Math.pow(0.85,dt*60);
hockey.p2.vy*=Math.pow(0.85,dt*60);

hockey.particles.forEach(p2=>{
p2.x+=p2.vx*dt;
p2.y+=p2.vy*dt;
p2.vy+=300*dt;
p2.life-=dt;
});
hockey.particles=hockey.particles.filter(p2=>p2.life>0);
}

function scoreHockey(player){
if(player===1){hockey.score1++;createHockeyParticles(450,250,"#64eaff",40);playWinSound();}
else{hockey.score2++;createHockeyParticles(450,250,"#ff72c8",40);playWinSound();}
hockeyMsg.textContent=`P1 ${hockey.score1}  -  P2 ${hockey.score2}`;
if(hockey.score1>=5||hockey.score2>=5){
hockey.active=false;
hockey.winner=hockey.score1>=5?"PLAYER 1 WINS!":"PLAYER 2 WINS!";
hockeyMsg.textContent=hockey.winner;
recordWin("hockey",hockey.score1>=5?"p1":"p2");
resetPuck();
}
}

function resetPuck(){
hockey.puck.x=450;hockey.puck.y=250;hockey.puck.vx=0;hockey.puck.vy=0;
hockey.p1.x=150;hockey.p1.y=250;hockey.p1.vx=0;hockey.p1.vy=0;
hockey.p2.x=750;hockey.p2.y=250;hockey.p2.vx=0;hockey.p2.vy=0;
}

function createHockeyParticles(x,y,color,count=10){
for(let i=0;i<count;i++){
hockey.particles.push({
x,y,
vx:(Math.random()-.5)*300,
vy:(Math.random()-.5)*300,
life:.4+Math.random()*.4,
color
});
}
}

function drawHockey(){
const ctx=hockeyCtx;
ctx.fillStyle="#101936";
ctx.fillRect(0,0,900,500);

/* Field lines */
ctx.strokeStyle="#ffffff33";
ctx.lineWidth=3;
ctx.strokeRect(55,35,790,430);
ctx.beginPath();ctx.moveTo(450,35);ctx.lineTo(450,465);ctx.stroke();
ctx.beginPath();ctx.moveTo(450,250);ctx.arc(450,250,60,0,Math.PI*2);ctx.stroke();

/* Goals */
ctx.fillStyle="#080b18";
ctx.fillRect(0,170,55,160);
ctx.fillRect(845,170,55,160);
ctx.fillStyle="#ffe66d";
ctx.fillRect(5,170,5,160);
ctx.fillRect(890-10,170,5,160);

/* Score */
ctx.font="bold 34px Courier New";
ctx.textAlign="center";
ctx.fillStyle=hockey.p1.color;ctx.fillText(hockey.score1,360,60);
ctx.fillStyle=hockey.p2.color;ctx.fillText(hockey.score2,540,60);
ctx.fillStyle="#ffe66d";ctx.font="15px Courier New";ctx.fillText("FIRST TO 5",450,28);
ctx.textAlign="left";

/* Puck */
ctx.shadowBlur=18;ctx.shadowColor="#fff";
ctx.fillStyle="#fff";
ctx.beginPath();ctx.arc(hockey.puck.x,hockey.puck.y,hockey.puck.r,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;

/* Mallets */
ctx.shadowBlur=12;
ctx.fillStyle=hockey.p1.color;ctx.shadowColor=hockey.p1.color;
ctx.beginPath();ctx.arc(hockey.p1.x,hockey.p1.y,hockey.p1.r,0,Math.PI*2);ctx.fill();
ctx.fillStyle=hockey.p2.color;ctx.shadowColor=hockey.p2.color;
ctx.beginPath();ctx.arc(hockey.p2.x,hockey.p2.y,hockey.p2.r,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;

/* Handles */
ctx.fillStyle="#dfffff";
ctx.beginPath();ctx.arc(hockey.p1.x,hockey.p1.y,9,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffe0f5";
ctx.beginPath();ctx.arc(hockey.p2.x,hockey.p2.y,9,0,Math.PI*2);ctx.fill();

hockey.particles.forEach(pt=>{
ctx.globalAlpha=Math.max(0,pt.life/.8);
ctx.fillStyle=pt.color;ctx.fillRect(pt.x,pt.y,5,5);
});
ctx.globalAlpha=1;

if(!hockey.active){
ctx.fillStyle="#080b18cc";
ctx.fillRect(230,190,440,90);
ctx.fillStyle="#ffe66d";
ctx.font="bold 28px Courier New";ctx.textAlign="center";
ctx.fillText(hockey.winner,450,235);
ctx.font="15px Courier New";ctx.fillText("PRESS RESTART TO REMATCH",450,265);
ctx.textAlign="left";
}
}

function hockeyLoop(){
if(activeScreen!=="hockeyGame"){
requestAnimationFrame(hockeyLoop);
return;
}
stepGame(updateHockey);
drawHockey();
requestAnimationFrame(hockeyLoop);
}

addEventListener("keydown",event=>{
if(document.getElementById("hockeyGame").classList.contains("active")){
if(["w","a","s","d","arrowleft","arrowright","arrowup","arrowdown"].includes(event.key.toLowerCase())){
event.preventDefault();
}
}
});

resetHockey();
requestAnimationFrame(hockeyLoop);

/* =========================
BOMB DUEL
========================= */

const bombCanvas=document.getElementById("bombCanvas");
const bombCtx=bombCanvas.getContext("2d");
const bombMsg=document.getElementById("bombMsg");

let bomb={
active:true,
p1:null,p2:null,
bomb:null,
hp1:3,hp2:3,
particles:[],
winner:"",
explodeCooldown:0
};

const bombPlatforms=[
{x:0,y:445,w:900,h:55},
{x:150,y:350,w:200,h:18},
{x:550,y:350,w:200,h:18},
{x:300,y:250,w:160,h:18},
{x:100,y:170,w:140,h:18},
{x:660,y:170,w:140,h:18}
];

function resetBomb(){
bomb.p1={x:150,y:400,vx:0,vy:0,w:22,h:34,color:"#64eaff",grounded:false,jumps:0,hit:0};
bomb.p2={x:750,y:400,vx:0,vy:0,w:22,h:34,color:"#ff72c8",grounded:false,jumps:0,hit:0};
bomb.bomb={x:450,y:250,vx:0,vy:0,r:16,active:false,owner:null,fuse:1.6,bounced:false};
bomb.hp1=3;bomb.hp2=3;bomb.particles=[];bomb.winner="";bomb.active=true;bomb.explodeCooldown=0;
bombMsg.textContent="FIRST TO 3 HITS WINS";
}

function moveBombPlayer(p,left,right,jump,dt){
if(p.hit>0){p.hit-=dt;p.vx*=0.9;return;}
p.vx=0;
if(keys[left])p.vx=-250;
if(keys[right])p.vx=250;
if(keys[jump] && p.grounded){
p.vy=-640;p.grounded=false;p.jumps++;createBombParticles(p.x+p.w/2,p.y+p.h,p.color,6);playJumpSound();
}
p.vy+=1500*dt;
p.x+=p.vx*dt;
p.x=clamp(p.x,20,858-p.w);

const oldBottom=p.y+p.h;
p.y+=p.vy*dt;
p.grounded=false;
for(const pl of bombPlatforms){
if(p.x+p.w>pl.x && p.x<pl.x+pl.w && oldBottom<=pl.y && p.y+p.h>=pl.y && p.vy>=0){
p.y=pl.y-p.h;p.vy=0;p.grounded=true;p.jumps=0;
}
}
if(p.y+p.h>500){p.y=500-p.h;p.vy=0;p.grounded=true;}
}

function throwBomb(){
const b=bomb.bomb;
if(b.active)return;
let shooter=null;
if(keys[" "] && bomb.hp1>0 && bomb.hp2>0){shooter=bomb.p1;b.owner="p1";}
else if(keys["enter"] && bomb.hp1>0 && bomb.hp2>0){shooter=bomb.p2;b.owner="p2";}
if(!shooter)return;
b.active=true;
b.x=shooter.x+shooter.w/2+(shooter===bomb.p1?28:-28);
b.y=shooter.y+10;
b.vx=(shooter===bomb.p1?1:-1)*330;
b.vy=-400;
b.fuse=1.6;b.bounced=false;b.active=true;
playHitSound();
bomb.explodeCooldown=0.15;
}

function updateBomb(){
if(!bomb.active)return;
const dt=1/60;
if(bomb.explodeCooldown>0)bomb.explodeCooldown-=dt;

moveBombPlayer(bomb.p1,"a","d","w",dt);
moveBombPlayer(bomb.p2,"arrowleft","arrowright","arrowup",dt);
throwBomb();

const b=bomb.bomb;
if(b.active){
b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=1100*dt;b.fuse-=dt;
let exploded=false;
/* Wall/floor bounce */
if(b.x-b.r<10){b.x=10+b.r;b.vx=-b.vx*0.6;if(!b.bounced){b.bounced=true;}else exploded=true;}
if(b.x+b.r>890){b.x=890-b.r;b.vx=-b.vx*0.6;if(!b.bounced){b.bounced=true;}else exploded=true;}
if(b.y-b.r<10){b.y=10+b.r;b.vy=-b.vy*0.6;}
if(b.y+b.r>445){b.y=445-b.r;b.vy=-b.vy*0.6;if(!b.bounced){b.bounced=true;}else exploded=true;}
/* Hit player */
const target=b.owner==="p1"?bomb.p2:bomb.p1;
if(target.hit<=0 && b.x>target.x && b.x<target.x+target.w && b.y>target.y && b.y<target.y+target.h){
exploded=true;applyBombDamage(target,b.owner==="p1"?"p1":"p2");
}
/* Platform bounce */
for(const pl of bombPlatforms){
if(b.x>pl.x && b.x<pl.x+pl.w && b.y+b.r>=pl.y && b.y-b.r<=pl.y+pl.h && b.vy>0){
b.y=pl.y-b.r;b.vy=-b.vy*0.6;b.bounced=true;
}
}
if(b.fuse<=0)exploded=true;
if(exploded)explodeBomb(b.x,b.y,b.owner);
}

bomb.particles.forEach(pk=>{
pk.x+=pk.vx*dt;pk.y+=pk.vy*dt;pk.vy+=400*dt;pk.life-=dt;
});
bomb.particles=bomb.particles.filter(pk=>pk.life>0);

if(bomb.hp1<=0){endBomb("p2");}
else if(bomb.hp2<=0){endBomb("p1");}
}

function applyBombDamage(player,byWhom){
if(player.hit>0)return;
player.hit=0.5;
if(byWhom==="p1"){bomb.hp2--;}else{bomb.hp1--;}
bombMsg.textContent=`P1: ${bomb.hp1}  |  P2: ${bomb.hp2}`;
createBombParticles(player.x+player.w/2,player.y+player.h/2,"#ff5878",30);
playHitSound();
}

function explodeBomb(x,dy,owner){
const b=bomb.bomb;b.active=false;
createBombParticles(x,dy,"#ffe66d",40);
createBombParticles(x,dy,"#ff5878",20);
playHitSound();
/* Knockback players */
[bomb.p1,bomb.p2].forEach(p=>{
const dx=(p.x+p.w/2)-x;
const dist=Math.abs(dx)+40;
if(dist<160){
const force=120*(1-dist/160);
p.vx=(dx<0?-1:1)*force;
p.vy=-260;
p.hit=0.5;
if(p===bomb.p1)bomb.hp1--;
else bomb.hp2--;
}
});
bombMsg.textContent=`P1: ${bomb.hp1}  |  P2: ${bomb.hp2}`;
}

function endBomb(winner){
bomb.active=false;bomb.winner=winner==="p1"?"PLAYER 1 WINS!":"PLAYER 2 WINS!";
bombMsg.textContent=bomb.winner;recordWin("bomb",winner);
}

function createBombParticles(x,y,color,count=10){
for(let i=0;i<count;i++){
bomb.particles.push({
x,y,
vx:(Math.random()-.5)*340,
vy:(Math.random()-.5)*340-80,
life:.45+Math.random()*.35,
color
});
}
}

function drawBomb(){
const ctx=bombCtx;
ctx.fillStyle="#101936";ctx.fillRect(0,0,900,500);

/* Background */
for(let i=0;i<40;i++){
ctx.fillStyle=i%2?"#26386f":"#354d88";
ctx.fillRect((i*83)%900,(i*47)%300,4,4);
}

/* Platforms */
ctx.fillStyle="#744b83";
bombPlatforms.forEach(pl=>{
ctx.fillRect(pl.x,pl.y,pl.w,pl.h);
ctx.fillStyle="#63f59a";ctx.fillRect(pl.x,pl.y,pl.w,5);ctx.fillStyle="#744b83";
});

/* Health bars */
ctx.fillStyle="#080b18";ctx.fillRect(40,26,260,16);ctx.fillRect(600,26,260,16);
ctx.fillStyle="#64eaff";ctx.fillRect(40,26,260*(bomb.hp1/3),16);
ctx.fillStyle="#ff72c8";ctx.fillRect(600,26,260*(bomb.hp2/3),16);
ctx.fillStyle="#9fc0ff";ctx.font="bold 14px Courier New";ctx.fillText("P1",40,20);ctx.fillText("P2",600,20);

/* Bomb */
const b=bomb.bomb;
if(b.active){
ctx.fillStyle="#ff5878";ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x-5,b.y-5,5,0,Math.PI*2);ctx.fill();
if(b.fuse<0.6 && Math.floor(b.fuse*30)%2===0){
ctx.fillStyle="#ffe66d";ctx.beginPath();ctx.arc(b.x,b.y,b.r+8,0,Math.PI*2);ctx.stroke();
}
}

/* Players */
[bomb.p1,bomb.p2].forEach(p=>{
ctx.save();ctx.translate(p.x,p.y);
const flash=p.hit>0 && Math.floor(p.hit*25)%2===0;if(flash)ctx.globalAlpha=.45;
drawFighter(ctx,p.w,p.h,p.color,(bomb.p1.x<bomb.p2.x)===(p===bomb.p1)?1:-1,Math.abs(p.vx)>20,false);
ctx.restore();ctx.globalAlpha=1;
});

bomb.particles.forEach(pk=>{
ctx.globalAlpha=Math.max(0,pk.life/.8);ctx.fillStyle=pk.color;ctx.fillRect(pk.x,pk.y,5,5);
});
ctx.globalAlpha=1;

ctx.fillStyle="#9fc0ff";ctx.font="15px Courier New";ctx.textAlign="center";
ctx.fillText("SPACE=throw  ENTER=throw",450,470);
ctx.textAlign="left";

if(!bomb.active){
ctx.fillStyle="#080b18cc";ctx.fillRect(230,190,440,90);
ctx.fillStyle="#ffe66d";ctx.font="bold 28px Courier New";ctx.textAlign="center";
ctx.fillText(bomb.winner,450,235);ctx.font="15px Courier New";
ctx.fillText("PRESS RESTART TO REMATCH",450,265);ctx.textAlign="left";
}
}

function bombLoop(){
if(activeScreen!=="bombGame"){
requestAnimationFrame(bombLoop);
return;
}
stepGame(updateBomb);
drawBomb();
requestAnimationFrame(bombLoop);
}

addEventListener("keydown",event=>{
if(document.getElementById("bombGame").classList.contains("active")){
const k=event.key.toLowerCase();
if(["a","d","w","arrowleft","arrowright","arrowup"," ","enter"].includes(k))event.preventDefault();
}
});

resetBomb();
requestAnimationFrame(bombLoop);

/* =========================
DODGEBALL (PATCHED — stronger throw, less bounce)
========================= */

const dodgeCanvas=document.getElementById("dodgeCanvas");
const dodgeCtx=dodgeCanvas.getContext("2d");
const dodgeMsg=document.getElementById("dodgeMsg");

let dodge={
active:true,
p1:null,p2:null,
balls:[],
score1:0,score2:0,
particles:[],
winner:""
};

function resetDodge(){
dodge.p1={x:200,y:350,vx:0,vy:0,r:20,color:"#64eaff",grounded:false,jumps:0,hit:0};
dodge.p2={x:700,y:350,vx:0,vy:0,r:20,color:"#ff72c8",grounded:false,jumps:0,hit:0};
dodge.balls=[];
dodge.score1=0;dodge.score2=0;dodge.particles=[];dodge.winner="";dodge.active=true;
dodgeMsg.textContent="HIT THEM 3 TIMES TO WIN";
}

function moveDodgePlayer(p,left,right,jump,dt){
if(p.hit>0){p.hit-=dt;p.vx*=0.92;return;}
p.vx=0;
if(keys[left])p.vx=-270;
if(keys[right])p.vx=270;
if(keys[jump] && p.grounded){p.vy=-620;p.grounded=false;p.jumps++;createDodgeParticles(p.x,p.y+p.r,p.color,6);playJumpSound();}
p.vy+=1400*dt;
p.x+=p.vx*dt;p.x=clamp(p.x,40,860-p.r*2);
const oldBottom=p.y+p.r*2;
p.y+=p.vy*dt;p.grounded=false;
if(p.y+p.r*2>440){p.y=440-p.r*2;p.vy=0;p.grounded=true;p.jumps=0;}
}

function throwDodgeBall(){
let shooter=null;
let owner=null;
if(keys[" "]&&dodge.active&&dodge.score1<3&&dodge.score2<3){shooter=dodge.p1;owner="p1";}
else if(keys["enter"]&&dodge.active&&dodge.score1<3&&dodge.score2<3){shooter=dodge.p2;owner="p2";}
if(!shooter)return;
const b={x:shooter.x+shooter.r,y:shooter.y+shooter.r*.5,vx:0,vy:0,r:12,owner,life:2.5};
b.vx=(owner==="p1"?1:-1)*560;
b.vy=-180;
dodge.balls.push(b);
playHitSound();
}

dodge.hpCheck=function(){return dodge.score1<3 && dodge.score2<3 && dodge.active;};

function updateDodge(){
if(!dodge.active)return;
const dt=1/60;
moveDodgePlayer(dodge.p1,"a","d","w",dt);
moveDodgePlayer(dodge.p2,"arrowleft","arrowright","arrowup",dt);
throwDodgeBall();

for(let i=dodge.balls.length-1;i>=0;i--){
const b=dodge.balls[i];
b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=620*dt;b.life-=dt;
b.vx*=Math.pow(0.995,60);
let hit=false;
/* walls */
if(b.x-b.r<20){b.x=20+b.r;b.vx=-b.vx*0.85;}
if(b.x+b.r>880){b.x=880-b.r;b.vx=-b.vx*0.85;}
if(b.y-b.r<20){b.y=20+b.r;b.vy=-b.vy*0.85;}
if(b.y+b.r>440){b.y=440-b.r;b.vy=-b.vy*0.85;}
/* hit player */
const target=b.owner==="p1"?dodge.p2:dodge.p1;
if(target.hit<=0 && b.x>target.x-b.r && b.x<target.x+target.r*2 && b.y>target.y-b.r && b.y<target.y+target.r*2){
hit=true;
if(b.owner==="p1"){dodge.score1++;}else{dodge.score2++;}
createDodgeParticles(target.x+target.r,target.y+target.r,"#ffe66d",20);playWinSound();
target.hit=0.5;
dodgeMsg.textContent=`P1 ${dodge.score1}  -  P2 ${dodge.score2}`;
if(dodge.score1>=3){dodge.active=false;dodge.winner="PLAYER 1 WINS!";recordWin("dodge","p1");playWinSound();}
else if(dodge.score2>=3){dodge.active=false;dodge.winner="PLAYER 2 WINS!";recordWin("dodge","p2");playWinSound();}
}
if(hit || b.life<=0 || b.x<0||b.x>900||b.y<0||b.y>500){dodge.balls.splice(i,1);}
}

dodge.particles.forEach(pk=>{
pk.x+=pk.vx*dt;pk.y+=pk.vy*dt;pk.vy+=400*dt;pk.life-=dt;
});
dodge.particles=dodge.particles.filter(pk=>pk.life>0);
}

function createDodgeParticles(x,y,color,count=10){
for(let i=0;i<count;i++){
dodge.particles.push({
x,y,
vx:(Math.random()-.5)*300,
vy:(Math.random()-.5)*300-60,
life:.45+Math.random()*.35,
color
});
}
}

function drawDodge(){
const ctx=dodgeCtx;
ctx.fillStyle="#101936";ctx.fillRect(0,0,900,500);

/* Court */
ctx.fillStyle="#72bf65";ctx.fillRect(0,0,900,500);
ctx.fillStyle="#373b55";ctx.fillRect(100,100,700,300);
ctx.fillStyle="#ffe66d";ctx.fillRect(100,100,12,300);ctx.fillRect(788,100,12,300);
ctx.fillStyle="#ffffff";for(let y=100;y<400;y+=40){ctx.fillRect(445,y,10,20);}

/* Score */
ctx.font="bold 30px Courier New";ctx.textAlign="center";
ctx.fillStyle=dodge.p1.color;ctx.fillText(dodge.score1,340,60);
ctx.fillStyle=dodge.p2.color;ctx.fillText(dodge.score2,560,60);
ctx.fillStyle="#ffe66d";ctx.font="16px Courier New";ctx.fillText("FIRST TO 3",450,30);
ctx.textAlign="left";

/* Balls */
dodge.balls.forEach(b=>{
ctx.fillStyle="#ffe66d";ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x-3,b.y-3,5,0,Math.PI*2);ctx.fill();
});

/* Players */
[dodge.p1,dodge.p2].forEach(p=>{
ctx.save();ctx.translate(p.x+p.r,p.y+p.r);
const flash=p.hit>0 && Math.floor(p.hit*25)%2===0;if(flash)ctx.globalAlpha=.45;
ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#f3bd83";ctx.fillRect(-6,-p.r+6,12,10);
ctx.fillStyle="#11152b";ctx.fillRect(2,-p.r+10,3,3);
ctx.restore();ctx.globalAlpha=1;
});

dodge.particles.forEach(pk=>{
ctx.globalAlpha=Math.max(0,pk.life/.8);ctx.fillStyle=pk.color;ctx.fillRect(pk.x,pk.y,5,5);
});
ctx.globalAlpha=1;

if(!dodge.active){
ctx.fillStyle="#080b18cc";ctx.fillRect(230,190,440,90);
ctx.fillStyle="#ffe66d";ctx.font="bold 28px Courier New";ctx.textAlign="center";
ctx.fillText(dodge.winner,450,235);ctx.font="15px Courier New";
ctx.fillText("PRESS RESTART OR SPACE TO REMATCH",450,265);ctx.textAlign="left";
}
}

function dodgeLoop(){
if(activeScreen!=="dodgeGame"){
requestAnimationFrame(dodgeLoop);
return;
}
stepGame(updateDodge);
drawDodge();
requestAnimationFrame(dodgeLoop);
}

addEventListener("keydown",event=>{
if(document.getElementById("dodgeGame").classList.contains("active")){
if(["a","d","w","arrowleft","arrowright","arrowup"," ","enter"].includes(event.key.toLowerCase())){
event.preventDefault();
}
}
});

resetDodge();
requestAnimationFrame(dodgeLoop);

/* =========================
SUMO RUSH
========================= */

const sumoCanvas=document.getElementById("sumoCanvas");
const sumoCtx=sumoCanvas.getContext("2d");
const sumoMsg=document.getElementById("sumoMsg");

let sumo={
active:true,
p1:null,p2:null,
ring:{cx:450,cy:300,r:220},
particles:[],
winner:""
};

function resetSumo(){
sumo.p1={x:330,y:300,vx:0,vy:0,r:26,color:"#64eaff",dir:1,hit:0};
sumo.p2={x:570,y:300,vx:0,vy:0,r:26,color:"#ff72c8",dir:-1,hit:0};
sumo.particles=[];sumo.winner="";sumo.active=true;
sumoMsg.textContent="PUSH THEM OUT OF THE RING";
}

function moveSumo(p,left,right,dt){
if(p.hit>0){p.hit-=dt;p.vx*=0.9;return;}
p.vx=0;
if(keys[left]){p.vx=-260;p.dir=-1;}
if(keys[right]){p.vx=260;p.dir=1;}
p.x+=p.vx*dt;
/* ring boundary bounce */
const dx=p.x-sumo.ring.cx;
const dy=p.y-sumo.ring.cy;
const dist=Math.sqrt(dx*dx+dy*dy);
if(dist+p.r>sumo.ring.r){
const nx=dx/dist,ny=dy/dist;
p.x=sumo.ring.cx+(sumo.ring.r-p.r)*nx;
p.y=sumo.ring.cy+(sumo.ring.r-p.r)*ny;
p.vx=-p.vx*0.5;
}
/* out of ring check */
if(dist>sumo.ring.r+60){return "out";}
return null;
}

function updateSumo(){
if(!sumo.active)return;
const dt=1/60;
let r1=moveSumo(sumo.p1,"a","d",dt);
let r2=moveSumo(sumo.p2,"arrowleft","arrowright",dt);

/* Player collision - push */
const ddx=sumo.p2.x-sumo.p1.x;
const ddy=sumo.p2.y-sumo.p1.y;
const ddist=Math.sqrt(ddx*ddx+ddy*ddy);
const minD=sumo.p1.r+sumo.p2.r;
if(ddist<minD){
const nx=ddx/ddist,ny=ddy/ddist;
const overlap=minD-ddist;
sumo.p1.x-=nx*overlap*0.5;sumo.p1.y-=ny*overlap*0.5;
sumo.p2.x+=nx*overlap*0.5;sumo.p2.y+=ny*overlap*0.5;
/* momentum transfer */
const rvx=sumo.p2.vx-sumo.p1.vx;
const velN=rvx*nx;
if(velN>0){
const j=-(1+0.6)*velN;
sumo.p1.vx-=j*0.5*nx;
sumo.p2.vx+=j*0.5*nx;
}
}

/* Out of ring */
if(r1==="out"){endSumo("p2");}
else if(r2==="out"){endSumo("p1");}

sumo.particles.forEach(pk=>{
pk.x+=pk.vx*dt;pk.y+=pk.vy*dt;pk.vy+=300*dt;pk.life-=dt;
});
sumo.particles=sumo.particles.filter(pk=>pk.life>0);
}

function endSumo(winner){
sumo.active=false;sumo.winner=winner==="p1"?"PLAYER 1 WINS!":"PLAYER 2 WINS!";
sumoMsg.textContent=sumo.winner;recordWin("sumo",winner);playWinSound();
}

function drawSumo(){
const ctx=sumoCtx;
ctx.fillStyle="#101936";ctx.fillRect(0,0,900,500);

/* Background */
for(let i=0;i<40;i++){
ctx.fillStyle=i%2?"#26386f":"#354d88";
ctx.fillRect((i*83)%900,(i*47)%350,4,4);
}

/* Ring */
ctx.strokeStyle="#ffe66d";ctx.lineWidth=6;
ctx.beginPath();ctx.arc(sumo.ring.cx,sumo.ring.cy,sumo.ring.r,0,Math.PI*2);ctx.stroke();
ctx.strokeStyle="#fff";ctx.lineWidth=3;
ctx.beginPath();ctx.arc(sumo.ring.cx,sumo.ring.cy,sumo.ring.r-8,0,Math.PI*2);ctx.stroke();
ctx.fillStyle="#3a4d8a";ctx.font="bold 16px Courier New";ctx.textAlign="center";
ctx.fillText("RING",sumo.ring.cx,sumo.ring.cy+6);

/* Players */
[sumo.p1,sumo.p2].forEach(p=>{
ctx.save();ctx.translate(p.x,p.y);
const flash=p.hit>0 && Math.floor(p.hit*25)%2===0;if(flash)ctx.globalAlpha=.45;
drawSumoWrestler(ctx,p);
ctx.restore();ctx.globalAlpha=1;
});

sumo.particles.forEach(pk=>{
ctx.globalAlpha=Math.max(0,pk.life/.8);ctx.fillStyle=pk.color;ctx.fillRect(pk.x,pk.y,5,5);
});
ctx.globalAlpha=1;

if(!sumo.active){
ctx.fillStyle="#080b18cc";ctx.fillRect(230,190,440,90);
ctx.fillStyle="#ffe66d";ctx.font="bold 28px Courier New";ctx.textAlign="center";
ctx.fillText(sumo.winner,450,235);ctx.font="15px Courier New";
ctx.fillText("PRESS RESTART OR SPACE TO REMATCH",450,265);ctx.textAlign="left";
}
}

function sumoLoop(){
if(activeScreen!=="sumoGame"){
requestAnimationFrame(sumoLoop);
return;
}
stepGame(updateSumo);
drawSumo();
requestAnimationFrame(sumoLoop);
}

addEventListener("keydown",event=>{
if(document.getElementById("sumoGame").classList.contains("active")){
if(["a","d","arrowleft","arrowright"].includes(event.key.toLowerCase())){
event.preventDefault();
}
}
});

resetSumo();
requestAnimationFrame(sumoLoop);

/* =========================
SNAKE TRON
========================= */

const snakeCanvas=document.getElementById("snakeCanvas");
const snakeCtx=snakeCanvas.getContext("2d");
const snakeMsg=document.getElementById("snakeMsg");

let snake={
active:true,
p1:null,p2:null,
trail1:[],trail2:[],
particles:[],
winner:"",
cell:10
};

function resetSnake(){
snake.p1={x:150,y:250,vx:snake.cell,vy:0,color:"#64eaff",dir:"r",alive:true};
snake.p2={x:750,y:250,vx:-snake.cell,vy:0,color:"#ff72c8",dir:"l",alive:true};
snake.trail1=[];snake.trail2=[];snake.particles=[];snake.winner="";snake.active=true;
snakeMsg.textContent="DON'T CROSS THE LINES — LAST ONE STANDING";
for(let i=0;i<5;i++){
snake.trail1.push({x:snake.p1.x-i*snake.cell,y:snake.p1.y});
snake.trail2.push({x:snake.p2.x+i*snake.cell,y:snake.p2.y});
}
}

function moveSnake(p,trail,left,right,up,down,dt){
if(!p.alive)return;
if(keys[left] && p.dir!=="r"){p.dir="l";p.vx=-snake.cell;p.vy=0;}
if(keys[right] && p.dir!=="l"){p.dir="r";p.vx=snake.cell;p.vy=0;}
if(keys[up] && p.dir!=="d"){p.dir="u";p.vx=0;p.vy=-snake.cell;}
if(keys[down] && p.dir!=="u"){p.dir="d";p.vx=0;p.vy=snake.cell;}
p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;
trail.push({x:p.x,y:p.y});
if(trail.length>600)trail.shift();
const out=p.x<0||p.x>890||p.y<60||p.y>490;
const hitSelf=trail.slice(0,-1).some(t=>Math.abs(t.x-p.x)<snake.cell&&Math.abs(t.y-p.y)<snake.cell);
return out||hitSelf;
}

function updateSnake(){
if(!snake.active)return;
const dt=1/60;
let d1=moveSnake(snake.p1,snake.trail1,"a","d","w","s",dt);
let d2=moveSnake(snake.p2,snake.trail2,"arrowleft","arrowright","arrowup","arrowdown",dt);
const hitOther1=snake.trail2.some(t=>Math.abs(t.x-snake.p1.x)<snake.cell&&Math.abs(t.y-snake.p1.y)<snake.cell);
const hitOther2=snake.trail1.some(t=>Math.abs(t.x-snake.p2.x)<snake.cell&&Math.abs(t.y-snake.p2.y)<snake.cell);
if(d1||hitOther1){snake.p1.alive=false;createSnakeParticles(snake.p1.x,snake.p1.y,snake.p1.color,20);playHitSound();}
if(d2||hitOther2){snake.p2.alive=false;createSnakeParticles(snake.p2.x,snake.p2.y,snake.p2.color,20);playHitSound();}
if(!snake.p1.alive&&!snake.p2.alive){snake.active=false;snake.winner="DOUBLE KO!";snakeMsg.textContent=snake.winner;recordWin("snake","p1");recordWin("snake","p2");playWinSound();}
else if(!snake.p1.alive){snake.active=false;snake.winner="PLAYER 2 WINS!";snakeMsg.textContent=snake.winner;recordWin("snake","p2");playWinSound();}
else if(!snake.p2.alive){snake.active=false;snake.winner="PLAYER 1 WINS!";snakeMsg.textContent=snake.winner;recordWin("snake","p1");playWinSound();}
snake.particles.forEach(pk=>{
pk.x+=pk.vx*dt;pk.y+=pk.vy*dt;pk.vy+=400*dt;pk.life-=dt;
});
snake.particles=snake.particles.filter(pk=>pk.life>0);
}

function createSnakeParticles(x,y,color,count=10){
for(let i=0;i<count;i++){
snake.particles.push({
x,y,
vx:(Math.random()-.5)*300,
vy:(Math.random()-.5)*300-60,
life:.45+Math.random()*.35,
color
});
}
}

function drawSnake(){
const ctx=snakeCtx;
ctx.fillStyle="#101936";ctx.fillRect(0,0,900,500);

/* Border */
ctx.fillStyle="#ffe66d";ctx.fillRect(0,60,900,4);ctx.fillRect(0,490,900,4);ctx.fillRect(0,60,4,430);ctx.fillRect(896,60,4,430);

/* Trails */
snake.trail1.forEach((t,i)=>{
ctx.fillStyle=i%2===0?snake.p1.color:"#9ccbff";ctx.fillRect(t.x,t.y,snake.cell,snake.cell);
});
snake.trail2.forEach((t,i)=>{
ctx.fillStyle=i%2===0?snake.p2.color:"#ff9edc";ctx.fillRect(t.x,t.y,snake.cell,snake.cell);
});

/* Players */
[snake.p1,snake.p2].forEach(p=>{
if(!p.alive)return;
ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,snake.cell,snake.cell);
ctx.fillStyle="#fff";ctx.fillRect(p.x+2,p.y+2,4,4);
});

/* Score */
ctx.fillStyle="#11152b";ctx.font="bold 16px Courier New";ctx.textAlign="center";
ctx.fillStyle=snake.p1.color;ctx.fillText("P1",120,30);
ctx.fillStyle=snake.p2.color;ctx.fillText("P2",780,30);
ctx.fillStyle="#ffe66d";ctx.fillText("TRON STYLE — CUT THEM OFF",450,30);
ctx.textAlign="left";

snake.particles.forEach(pk=>{
ctx.globalAlpha=Math.max(0,pk.life/.8);ctx.fillStyle=pk.color;ctx.fillRect(pk.x,pk.y,5,5);
});
ctx.globalAlpha=1;

if(!snake.active){
ctx.fillStyle="#080b18cc";ctx.fillRect(230,190,440,90);
ctx.fillStyle="#ffe66d";ctx.font="bold 28px Courier New";ctx.textAlign="center";
ctx.fillText(snake.winner,450,235);ctx.font="15px Courier New";
ctx.fillText("PRESS RESTART OR SPACE TO REMATCH",450,265);ctx.textAlign="left";
}
}

function snakeLoop(){
if(activeScreen!=="snakeGame"){
requestAnimationFrame(snakeLoop);
return;
}
stepGame(updateSnake);
drawSnake();
requestAnimationFrame(snakeLoop);
}

addEventListener("keydown",event=>{
if(document.getElementById("snakeGame").classList.contains("active")){
if(["a","d","w","s","arrowleft","arrowright","arrowup","arrowdown"].includes(event.key.toLowerCase())){
event.preventDefault();
}
}
});

resetSnake();
requestAnimationFrame(snakeLoop);

/* =========================
BASKETBALL HOOPS
========================= */

const basketCanvas=document.getElementById("basketCanvas");
const basketCtx=basketCanvas.getContext("2d");
const basketMsg=document.getElementById("basketMsg");

let basket={
active:true,
p1:null,p2:null,
ball:null,
hoop1:null,hoop2:null,
score1:0,score2:0,
particles:[],
winner:""
};

function resetBasket(){
basket.p1={x:200,y:380,vx:0,vy:0,r:16,color:"#64eaff",has:false,grounded:false,jumps:0};
basket.p2={x:700,y:380,vx:0,vy:0,r:16,color:"#ff72c8",has:false,grounded:false,jumps:0};
basket.ball={x:450,y:300,vx:0,vy:0,r:12,held:null,owner:null};
basket.score1=0;basket.score2=0;basket.particles=[];basket.winner="";basket.active=true;
basketMsg.textContent="DUNK IT IN THEIR HOOP — FIRST TO 5";
}

function moveBasket(p,left,right,jump,dt){
if(keys[left])p.vx=-280;
if(keys[right])p.vx=280;
if(keys[jump] && p.grounded){p.vy=-560;p.grounded=false;p.jumps++;createBasketParticles(p.x,p.y+14,p.color,6);playJumpSound();}
p.vy+=1300*dt;
p.x+=p.vx*dt;p.x=clamp(p.x,40,860-p.r*2);
p.y+=p.vy*dt;
if(p.y+p.r>440){p.y=440-p.r;p.vy=0;p.grounded=true;p.jumps=0;}
}

function updateBasket(){
if(!basket.active)return;
const dt=1/60;
moveBasket(basket.p1,"a","d","w",dt);
moveBasket(basket.p2,"arrowleft","arrowright","arrowup",dt);

const b=basket.ball;
/* Pickup */
if(!b.held){
if(Math.abs(b.x-basket.p1.x)<28&&Math.abs(b.y-basket.p1.y)<28){b.held="p1";b.owner="p1";createBasketParticles(b.x,b.y,"#64eaff",8);}
else if(Math.abs(b.x-basket.p2.x)<28&&Math.abs(b.y-basket.p2.y)<28){b.held="p2";b.owner="p2";createBasketParticles(b.x,b.y,"#ff72c8",8);}
/* Throw */
const throwKey=b.held?"p1":"p2";
if(keys[" "]&&b.held==="p1"){b.held=null;b.vx=420;b.vy=-560;playHitSound();createBasketParticles(b.x,b.y,"#64eaff",12);}
if(keys["enter"]&&b.held==="p2"){b.held=null;b.vx=-420;b.vy=-560;playHitSound();createBasketParticles(b.x,b.y,"#ff72c8",12);}
} else {
const carrier=b.held==="p1"?basket.p1:basket.p2;
b.x=carrier.x+(carrier===basket.p1?18:-18);b.y=carrier.y-10;
}

/* Physics */
if(!b.held){b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=900*dt;}
/* Floor bounce */
if(b.y+b.r>440){b.y=440-b.r;b.vy=-b.vy*0.5;}
/* Hoop checks */
const h1={x:80,y:70,w:70,h:14};const h2={x:750,y:70,w:70,h:14};
if(!b.held&&b.x>h1.x&&b.x<h1.x+h1.w&&b.y>h1.y&&b.y<h1.y+h1.h&&b.owner==="p2"){
basket.score2++;createBasketParticles(450,300,"#ff72c8",30);playWinSound();resetBall();
if(basket.score2>=5){endBasket("p2");}
}
if(!b.held&&b.x>h2.x&&b.x<h2.x+h2.w&&b.y>h2.y&&b.y<h2.y+h2.h&&b.owner==="p1"){
basket.score1++;createBasketParticles(450,300,"#64eaff",30);playWinSound();resetBall();
if(basket.score1>=5){endBasket("p1");}
}

basket.particles.forEach(pk=>{
pk.x+=pk.vx*dt;pk.y+=pk.vy*dt;pk.vy+=400*dt;pk.life-=dt;
});
basket.particles=basket.particles.filter(pk=>pk.life>0);
}

function resetBall(){
basket.ball.x=450;basket.ball.y=300;basket.ball.vx=0;basket.ball.vy=0;basket.ball.held=null;basket.ball.owner=null;
basket.p1.x=200;basket.p1.y=380;basket.p1.vx=0;basket.p1.vy=0;
basket.p2.x=700;basket.p2.y=380;basket.p2.vx=0;basket.p2.vy=0;
}

function endBasket(winner){
basket.active=false;basket.winner=winner==="p1"?"PLAYER 1 WINS!":"PLAYER 2 WINS!";
basketMsg.textContent=basket.winner;recordWin("basket",winner);playWinSound();
}

function createBasketParticles(x,y,color,count=10){
for(let i=0;i<count;i++){
basket.particles.push({
x,y,
vx:(Math.random()-.5)*300,
vy:(Math.random()-.5)*300-60,
life:.45+Math.random()*.35,
color
});
}
}

function drawBasket(){
const ctx=basketCtx;
ctx.fillStyle="#101936";ctx.fillRect(0,0,900,500);

/* Court */
ctx.fillStyle="#9ad8ef";ctx.fillRect(0,0,900,500);
ctx.fillStyle="#4cae67";ctx.fillRect(0,440,900,60);
ctx.fillStyle="#ffe66d";ctx.fillRect(0,440,900,4);

/* Hoops */
const h1={x:80,y:70,w:70,h:14};const h2={x:750,y:70,w:70,h:14};
ctx.fillStyle="#3d2b1f";ctx.fillRect(h1.x-4,h1.y+h1.h-4,h1.w+8,8);ctx.fillRect(h2.x-4,h2.y+h2.h-4,h2.w+8,8);
ctx.fillStyle="#ffe66d";ctx.fillRect(h1.x,h1.y,h1.w,h1.h);ctx.fillRect(h2.x,h2.y,h2.w,h2.h);
ctx.fillStyle="#ff5878";ctx.fillRect(h1.x+8,h1.y-18,h1.w-16,18);ctx.fillRect(h2.x+8,h2.y-18,h2.w-16,18);

/* Score */
ctx.font="bold 30px Courier New";ctx.textAlign="center";
ctx.fillStyle=basket.p1.color;ctx.fillText(basket.score1,340,60);
ctx.fillStyle=basket.p2.color;ctx.fillText(basket.score2,560,60);
ctx.fillStyle="#ffe66d";ctx.font="16px Courier New";ctx.fillText("FIRST TO 5",450,30);
ctx.textAlign="left";

/* Ball */
ctx.fillStyle="#ffe66d";ctx.beginPath();ctx.arc(basket.ball.x,basket.ball.y,basket.ball.r,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(basket.ball.x-3,basket.ball.y-3,4,0,Math.PI*2);ctx.fill();

/* Players */
[basket.p1,basket.p2].forEach(p=>{
ctx.save();ctx.translate(p.x+p.r,p.y+p.r);
ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#f3bd83";ctx.fillRect(-6,-p.r+4,12,10);
ctx.fillStyle="#11152b";ctx.fillRect(2,-p.r+8,3,3);
ctx.restore();
});

basket.particles.forEach(pk=>{
ctx.globalAlpha=Math.max(0,pk.life/.8);ctx.fillStyle=pk.color;ctx.fillRect(pk.x,pk.y,5,5);
});
ctx.globalAlpha=1;

if(!basket.active){
ctx.fillStyle="#080b18cc";ctx.fillRect(230,190,440,90);
ctx.fillStyle="#ffe66d";ctx.font="bold 28px Courier New";ctx.textAlign="center";
ctx.fillText(basket.winner,450,235);ctx.font="15px Courier New";
ctx.fillText("PRESS RESTART OR SPACE TO REMATCH",450,265);ctx.textAlign="left";
}
}

function basketLoop(){
if(activeScreen!=="basketGame"){
requestAnimationFrame(basketLoop);
return;
}
stepGame(updateBasket);
drawBasket();
requestAnimationFrame(basketLoop);
}

addEventListener("keydown",event=>{
if(document.getElementById("basketGame").classList.contains("active")){
if(["a","d","w","arrowleft","arrowright","arrowup"," ","enter"].includes(event.key.toLowerCase())){
event.preventDefault();
}
}
});

resetBasket();
requestAnimationFrame(basketLoop);

/* =========================
VOLLEYBALL (PATCHED — faster arcade)
========================= */

const volleyCanvas=document.getElementById("volleyCanvas");
const volleyCtx=volleyCanvas.getContext("2d");
const volleyMsg=document.getElementById("volleyMsg");

let volley={
active:true,
p1:null,p2:null,
ball:null,
score1:0,score2:0,
particles:[],
winner:"",
netY:130,
server:1
};

/* Serve: ball starts above the SERVER's side and arcs over the net */
function serveVolley(){
const sx=volley.server===1?200:700;
const dir=volley.server===1?1:-1;
volley.ball={x:sx,y:150,vx:dir*170,vy:-220,r:10,owner:null,hits:0,cool:0,cool2:0};
volley.server=volley.server===1?2:1;
}

function resetVolley(){
volley.p1={x:200,y:340,vx:0,vy:0,r:18,color:"#64eaff",grounded:false,jumps:0,touches:0};
volley.p2={x:700,y:340,vx:0,vy:0,r:18,color:"#ff72c8",grounded:false,jumps:0,touches:0};
volley.score1=0;volley.score2=0;volley.particles=[];volley.winner="";volley.active=true;volley.server=1;
serveVolley();
volleyMsg.textContent="SERVE! — FIRST TO 7";
}

function moveVolley(p,left,right,jump,dt){
if(keys[left])p.vx=-300;
if(keys[right])p.vx=300;
if(keys[jump] && p.grounded && p.jumps<2){p.vy=-600;p.grounded=false;p.jumps++;createVolleyParticles(p.x,p.y+p.r,p.color,5);playJumpSound();}
p.vy+=1500*dt;
p.x+=p.vx*dt;p.x=clamp(p.x,40,430-p.r*2);
if(p===volley.p2)p.x=clamp(p.x,470,860-p.r*2);
p.y+=p.vy*dt;
if(p.y+p.r>440){p.y=440-p.r;p.vy=0;p.grounded=true;p.jumps=0;}
}

function updateVolley(){
if(!volley.active)return;
const dt=1/60;
moveVolley(volley.p1,"a","d","w",dt);
moveVolley(volley.p2,"arrowleft","arrowright","arrowup",dt);
const b=volley.ball;
b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=780*dt;
if(b.cool>0)b.cool-=dt;if(b.cool2>0)b.cool2-=dt;
if(b.x-b.r<10){b.x=10+b.r;b.vx=Math.abs(b.vx);}
if(b.x+b.r>890){b.x=890-b.r;b.vx=-Math.abs(b.vx);}
if(b.y-b.r<20){b.y=20+b.r;b.vy=Math.abs(b.vy);}
if(b.y+b.r>440){
if(b.x<450){volley.score2++;}else{volley.score1++;}
createVolleyParticles(b.x,b.y,"#ffe66d",30);playWinSound();
volleyMsg.textContent=`P1 ${volley.score1}  -  P2 ${volley.score2}`;
if(volley.score1>=7||volley.score2>=7){
volley.active=false;volley.winner=volley.score1>=7?"PLAYER 1 WINS!":"PLAYER 2 WINS!";
volleyMsg.textContent=volley.winner;recordWin("volley",volley.score1>=7?"p1":"p2");playWinSound();
} else {resetBallVolley();}
}
/* Player hit — with a per-player cooldown so the ball can't be "carried" frame after frame */
[volley.p1,volley.p2].forEach((p,idx)=>{
const cd=idx===0?b.cool:b.cool2;
if(cd<=0&&Math.abs(b.x-p.x)<30&&Math.abs(b.y-p.y)<30){
const dx=b.x-p.x,dy=b.y-p.y;
const len=Math.sqrt(dx*dx+dy*dy)||1;
const away=dx>=0?1:-1;
b.vx=away*Math.max(240,Math.abs((dx/len)*380+(p.vx*0.4)));
b.vy=-Math.max(320,Math.abs(dy/len)*200);
b.owner=p;
if(idx===0)b.cool=0.3;else b.cool2=0.3;
/* push the ball clear of the player so it can't re-trigger */
b.x=p.x+away*34;
createVolleyParticles(p.x,p.y-10,p.color,10);playHitSound();
}
});
/* Net collision — full net column (drawn from netY down to netY+260) */
if(b.y+b.r>volley.netY&&b.y-b.r<volley.netY+260&&b.x+b.r>445&&b.x-b.r<455){
  if(b.x<450){b.x=445-b.r;b.vx=-Math.abs(b.vx)*0.85;}
  else{b.x=455+b.r;b.vx=Math.abs(b.vx)*0.85;}
  if(Math.abs(b.vx)<90)b.vx=(b.x<450?-1:1)*120;
  b.vy*=0.9;
}
if(b.x<b.r||b.x>900-b.r){
  /* ball escaped the side walls — award the point to the far side */
  if(b.x<450){volley.score2++;}else{volley.score1++;}
  volleyMsg.textContent=`P1 ${volley.score1}  -  P2 ${volley.score2}`;
  if(volley.score1>=7||volley.score2>=7){
    volley.active=false;volley.winner=volley.score1>=7?"PLAYER 1 WINS!":"PLAYER 2 WINS!";
    volleyMsg.textContent=volley.winner;recordWin("volley",volley.score1>=7?"p1":"p2");playWinSound();
  } else {resetBallVolley();}
}
volley.particles.forEach(pk=>{
pk.x+=pk.vx*dt;pk.y+=pk.vy*dt;pk.vy+=300*dt;pk.life-=dt;
});
volley.particles=volley.particles.filter(pk=>pk.life>0);
}

function resetBallVolley(){
serveVolley();
volley.p1.x=200;volley.p1.y=340;volley.p1.vx=0;volley.p1.vy=0;
volley.p2.x=700;volley.p2.y=340;volley.p2.vx=0;volley.p2.vy=0;
volleyMsg.textContent="SERVE! — FIRST TO 7";
}

function createVolleyParticles(x,y,color,count=10){
for(let i=0;i<count;i++){
volley.particles.push({
x,y,
vx:(Math.random()-.5)*280,
vy:(Math.random()-.5)*280-60,
life:.45+Math.random()*.35,
color
});
}
}

function drawVolley(){
const ctx=volleyCtx;
ctx.fillStyle="#101936";ctx.fillRect(0,0,900,500);

/* Court */
ctx.fillStyle="#9ad8ef";ctx.fillRect(0,60,900,440);
ctx.fillStyle="#4cae67";ctx.fillRect(0,440,900,60);
ctx.fillStyle="#ffe66d";ctx.fillRect(0,440,900,4);
ctx.fillStyle="#ffe66d";ctx.fillRect(0,60,900,4);

/* Net */
ctx.fillStyle="#ffffff";ctx.fillRect(445,volley.netY,10,260);
for(let y=volley.netY;y<volley.netY+260;y+=20){
ctx.fillStyle="#a0a0a0";ctx.fillRect(442,y,6,8);ctx.fillRect(452,y,6,8);
}

/* Score */
ctx.font="bold 30px Courier New";ctx.textAlign="center";
ctx.fillStyle=volley.p1.color;ctx.fillText(volley.score1,340,42);
ctx.fillStyle=volley.p2.color;ctx.fillText(volley.score2,560,42);
ctx.fillStyle="#ffe66d";ctx.font="16px Courier New";ctx.fillText("FIRST TO 7",450,22);
ctx.textAlign="left";

/* Ball */
ctx.fillStyle="#ffe66d";ctx.beginPath();ctx.arc(volley.ball.x,volley.ball.y,volley.ball.r,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(volley.ball.x-2,volley.ball.y-2,3,0,Math.PI*2);ctx.fill();

/* Players */
[volley.p1,volley.p2].forEach(p=>{
ctx.save();ctx.translate(p.x+p.r,p.y+p.r);
ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#f3bd83";ctx.fillRect(-6,-p.r+4,12,10);
ctx.fillStyle="#11152b";ctx.fillRect(2,-p.r+8,3,3);
ctx.restore();
});

volley.particles.forEach(pk=>{
ctx.globalAlpha=Math.max(0,pk.life/.8);ctx.fillStyle=pk.color;ctx.fillRect(pk.x,pk.y,5,5);
});
ctx.globalAlpha=1;

if(!volley.active){
ctx.fillStyle="#080b18cc";ctx.fillRect(230,190,440,90);
ctx.fillStyle="#ffe66d";ctx.font="bold 28px Courier New";ctx.textAlign="center";
ctx.fillText(volley.winner,450,235);ctx.font="15px Courier New";
ctx.fillText("PRESS RESTART OR SPACE TO REMATCH",450,265);ctx.textAlign="left";
}
}

function volleyLoop(){
if(activeScreen!=="volleyGame"){
requestAnimationFrame(volleyLoop);
return;
}
stepGame(updateVolley);
drawVolley();
requestAnimationFrame(volleyLoop);
}

addEventListener("keydown",event=>{
if(document.getElementById("volleyGame").classList.contains("active")){
if(["a","d","w","arrowleft","arrowright","arrowup"].includes(event.key.toLowerCase())){
event.preventDefault();
}
}
});

resetVolley();
requestAnimationFrame(volleyLoop);

/* =========================
MEMORY MATCH
========================= */

const memCanvas=document.getElementById("memCanvas");
const memCtx=memCanvas.getContext("2d");
const memMsg=document.getElementById("memMsg");

const MEM_SYMBOLS=["🍄","⭐","👾","🍕","🚀","💎","🔥","🐸"];
let mem={
active:true,
p1:null,p2:null,
cards:[],
particles:[],
flipped:[],
matched:[],
score1:0,score2:0,
winner:"",
turn:"p1",
lock:false
};

function resetMem(){
mem.cards=[];
for(let i=0;i<MEM_SYMBOLS.length;i++){mem.cards.push(MEM_SYMBOLS[i],MEM_SYMBOLS[i]);}
mem.cards=mem.cards.sort(()=>Math.random()-0.5);
mem.flipped=[];mem.matched=[];mem.score1=0;mem.score2=0;mem.winner="";mem.active=true;mem.turn="p1";mem.lock=false;
mem.p1={color:"#64eaff"};mem.p2={color:"#ff72c8"};
memMsg.textContent="MEMORY MATCH — CLICK PAIRS, P1 STARTS";
drawMem();
}

function memCellSymbol(idx){return mem.cards[idx];}
function memIsFlipped(idx){return mem.flipped.includes(idx)||mem.matched.includes(idx);}
function memIsMatched(idx){return mem.matched.includes(idx);}

function flipCard(idx){
if(mem.lock||memIsFlipped(idx))return;
mem.flipped.push(idx);
drawMem();
if(mem.flipped.length===2){
mem.lock=true;
setTimeout(()=>{
const [a,b]=mem.flipped;
if(mem.cards[a]===mem.cards[b]){
mem.matched.push(a,b);createMemParticles(a,b);
if(mem.turn==="p1"){mem.score1++;memMsg.textContent="P1 MATCH!"}else{mem.score2++;memMsg.textContent="P2 MATCH!"}
if(mem.matched.length===MEM_SYMBOLS.length*2){
mem.active=false;
mem.winner=mem.score1>mem.score2?"PLAYER 1 WINS!":mem.score2>mem.score1?"PLAYER 2 WINS!":"TIE!";
memMsg.textContent=mem.winner;
if(mem.score1!==mem.score2)recordWin("mem",mem.score1>mem.score2?"p1":"p2");playWinSound();
}
} else {
mem.turn=mem.turn==="p1"?"p2":"p1";
memMsg.textContent=mem.turn==="p1"?"P1'S TURN":"P2'S TURN";
}
mem.flipped=[];mem.lock=false;drawMem();
},600);
}
}

function createMemParticles(a,b){
const cx=a%4*190+95,cy=Math.floor(a/4)*120+140;
for(let i=0;i<14;i++){
mem.particles.push({x:cx,y:cy,vx:(Math.random()-.5)*200,vy:(Math.random()-.5)*200,life:.5,color:"#ffe66d"});
}
}

function drawMem(){
const ctx=memCtx;
ctx.fillStyle="#101936";ctx.fillRect(0,0,900,500);
ctx.fillStyle="#ffe66d";ctx.font="bold 20px Courier New";ctx.textAlign="center";
ctx.fillStyle=mem.turn==="p1"?"#64eaff":"#ff72c8";ctx.fillText(mem.turn==="p1"?"P1'S TURN":"P2'S TURN",450,34);
ctx.fillStyle="#11152b";ctx.font="14px Courier New";
ctx.fillStyle=mem.p1.color;ctx.fillText(mem.score1,330,58);
ctx.fillStyle=mem.p2.color;ctx.fillText(mem.score2,570,58);
ctx.fillStyle="#ffe66d";ctx.fillText("MEMORY MATCH",450,58);
ctx.textAlign="left";

const gw=160,gh=100,ox=130,oy=120;
for(let i=0;i<16;i++){
const x=ox+(i%4)*gw, y=oy+Math.floor(i/4)*gh;
const flipped=memIsFlipped(i);
const matched=memIsMatched(i);
ctx.fillStyle=matched?"#63f59a":(flipped?"#2a3a7a":"#1f2d5a");
ctx.fillRect(x,y,gw-10,gh-10);
ctx.strokeStyle="#ffe66d";ctx.lineWidth=2;ctx.strokeRect(x,y,gw-10,gh-10);
if(flipped||matched){
ctx.fillStyle=matched?"#11152b":"#ffffff";ctx.font="bold 42px Courier New";ctx.textAlign="center";
ctx.fillText(mem.cards[i],x+(gw-10)/2,y+(gh-10)/2+14);
ctx.textAlign="left";
}
}

mem.particles.forEach(pk=>{
pk.x+=pk.vx;pk.y+=pk.vy;pk.life-=0.02;
ctx.globalAlpha=Math.max(0,pk.life);ctx.fillStyle=pk.color;ctx.fillRect(pk.x,pk.y,5,5);
});
ctx.globalAlpha=1;

if(!mem.active){
ctx.fillStyle="#080b18cc";ctx.fillRect(230,190,440,90);
ctx.fillStyle="#ffe66d";ctx.font="bold 28px Courier New";ctx.textAlign="center";
ctx.fillText(mem.winner,450,235);ctx.font="15px Courier New";
ctx.fillText("CLICK TO RESTART",450,265);ctx.textAlign="left";
}
}

function memLoop(){
if(activeScreen!=="memGame"){
requestAnimationFrame(memLoop);
return;
}
drawMem();
requestAnimationFrame(memLoop);
}

memCanvas.addEventListener("click",e=>{
if(!document.getElementById("memGame").classList.contains("active"))return;
const rect=memCanvas.getBoundingClientRect();
const mx=(e.clientX-rect.left)*(900/rect.width),my=(e.clientY-rect.top)*(500/rect.height);
const gw=160,gh=100,ox=130,oy=120;
for(let i=0;i<16;i++){
const x=ox+(i%4)*gw,y=oy+Math.floor(i/4)*gh;
if(mx>x&&mx<x+gw-10&&my>y&&my<y+gh-10){flipCard(i);break;}
}
});

resetMem();
requestAnimationFrame(memLoop);

/* =========================
REACTION DUEL
========================= */

const reactCanvas=document.getElementById("reactCanvas");
const reactCtx=reactCanvas.getContext("2d");
const reactMsg=document.getElementById("reactMsg");

let react={
active:false,ready:false,timer:null,p1:0,p2:0,winner:"",startTime:0
};

function resetReact(){
clearTimeout(react.timer);
react.active=false;react.ready=false;react.p1=0;react.p2=0;react.winner="";react.startTime=0;
reactMsg.textContent="PRESS START — REACT TO THE COLOR";
const ctx=reactCtx;ctx.fillStyle="#101936";ctx.fillRect(0,0,900,500);
ctx.fillStyle="#ffe66d";ctx.font="bold 28px Courier New";ctx.textAlign="center";
ctx.fillText("PRESS START",450,240);ctx.textAlign="left";
}

function startReact(){
clearTimeout(react.timer);react.active=false;react.ready=false;react.winner="";react.startTime=0;
reactMsg.textContent="WAIT FOR IT...";
reactCtx.fillStyle="#101936";reactCtx.fillRect(0,0,900,500);
reactCtx.fillStyle="#ffe66d";reactCtx.font="bold 28px Courier New";reactCtx.textAlign="center";
reactCtx.fillText("WAIT FOR IT...",450,240);reactCtx.textAlign="left";
react.timer=setTimeout(()=>{
if(!react.active)return;
react.ready=true;react.startTime=performance.now();
reactCtx.fillStyle="#00f2ff";reactCtx.fillRect(0,0,900,500);
reactCtx.fillStyle="#11152b";reactCtx.font="bold 48px Courier New";reactCtx.textAlign="center";
reactCtx.fillText("GO!",450,240);reactCtx.textAlign="left";
reactMsg.textContent="GO! PRESS YOUR KEY!";
},1500+Math.random()*2500);
}

function reactKey(key){
if(!react.active||!react.ready)return;
if(key!=="a"&&key!=="l")return;
const now=performance.now();
const rt=now-react.startTime;
react.active=false;react.ready=false;clearTimeout(react.timer);
if(key==="a"){react.p1=rt;react.winner="PLAYER 1: "+rt.toFixed(0)+"ms";}
else{react.p2=rt;react.winner="PLAYER 2: "+rt.toFixed(0)+"ms";}
reactCtx.fillStyle="#101936";reactCtx.fillRect(0,0,900,500);
reactCtx.fillStyle="#ffe66d";reactCtx.font="bold 32px Courier New";reactCtx.textAlign="center";
reactCtx.fillText(react.winner,450,220);
reactCtx.font="18px Courier New";
reactCtx.fillText("P1: A   P2: L",450,260);
reactCtx.textAlign="left";
reactMsg.textContent=react.winner+" — FASTEST REACTION WINS";
recordWin("react",key==="a"?"p1":"p2");playWinSound();
}

function drawReact(){
const ctx=reactCtx;
if(react.active&&react.ready){
ctx.fillStyle="#00f2ff";ctx.fillRect(0,0,900,500);
ctx.fillStyle="#11152b";ctx.font="bold 48px Courier New";ctx.textAlign="center";
ctx.fillText("GO!",450,240);ctx.textAlign="left";
}
}

function reactLoop(){
if(activeScreen!=="reactGame"){
requestAnimationFrame(reactLoop);
return;
}
drawReact();
requestAnimationFrame(reactLoop);
}

addEventListener("keydown",event=>{
if(document.getElementById("reactGame").classList.contains("active")){
reactKey(event.key.toLowerCase());
}
});

resetReact();
requestAnimationFrame(reactLoop);

/* =========================
PIXEL RACERS (PATCHED — split screen + obstacles)
========================= */

const raceCanvas=document.getElementById("raceCanvas");
const raceCtx=raceCanvas.getContext("2d");
const raceMsg=document.getElementById("raceMsg");

let race={
active:true,
p1:null,
p2:null,
winner:""
};

function resetRace(){
race.p1={x:0,y:0,speed:0,progress:0,color:"#64eaff",vy:0,grounded:true,jumps:0};
race.p2={x:0,y:0,speed:0,progress:0,color:"#ff72c8",vy:0,grounded:true,jumps:0};
race.splitScreen=true;
race.obstacles=[];
for(let x=400;x<4800;x+=320+Math.random()*200){
race.obstacles.push({x:x,w:40,h:40+Math.random()*40});
}
race.winner="";
race.active=true;
raceMsg.textContent="REACH THE FINISH LINE!";
}

function updateRace(){
if(!race.active)return;
const speedBase=520;
const gravity=1400;
{
const p=race.p1;
if(keys.a)p.x-=speedBase*.8;
if(keys.d)p.x+=speedBase*.8;
if(keys.w&&p.grounded){p.vy=-680;p.grounded=false;}
p.vy+=gravity/60;
p.y+=p.vy/60;
if(p.y>=0){p.y=0;p.vy=0;p.grounded=true;}
if(p.x>p.progress)p.progress=p.x;
for(const o of race.obstacles){
if(Math.abs(p.x-o.x)<40 && p.y>-o.h){p.x-=200;playHitSound&&playHitSound();}
}
}
{
const p=race.p2;
if(keys.arrowleft)p.x-=speedBase*.8;
if(keys.arrowright)p.x+=speedBase*.8;
if(keys.arrowup&&p.grounded){p.vy=-680;p.grounded=false;}
p.vy+=gravity/60;
p.y+=p.vy/60;
if(p.y>=0){p.y=0;p.vy=0;p.grounded=true;}
if(p.x>p.progress)p.progress=p.x;
for(const o of race.obstacles){
if(Math.abs(p.x-o.x)<40 && p.y>-o.h){p.x-=200;playHitSound&&playHitSound();}
}
}
if(race.p1.progress>=4800){
race.active=false;race.winner="PLAYER 1 WINS!";raceMsg.textContent=race.winner;
recordWin("race","p1");return;
}
if(race.p2.progress>=4800){
race.active=false;race.winner="PLAYER 2 WINS!";raceMsg.textContent=race.winner;
recordWin("race","p2");return;
}
}

function drawRace(){
const ctx=raceCtx;
ctx.fillStyle="#72bf65";ctx.fillRect(0,0,900,500);
ctx.fillStyle="#373b55";ctx.fillRect(100,0,700,500);
ctx.fillStyle="#ffe66d";ctx.fillRect(100,0,12,500);ctx.fillRect(788,0,12,500);

const drawHalf=(player,otherY,labelY,progressY)=>{
ctx.save();
ctx.beginPath();ctx.rect(0,otherY,900,250);ctx.clip();
const camX=player.progress-150;
ctx.fillStyle="#fff";
for(let x=-(camX%80);x<900;x+=80){
ctx.fillRect(x,otherY+125,40,4);
}
for(const o of race.obstacles){
const sx=o.x-camX;
if(sx<-100||sx>1000)continue;
ctx.fillStyle="#222";
ctx.fillRect(sx,otherY+180-o.h,o.w,o.h);
ctx.fillStyle="#333";
ctx.fillRect(sx,otherY+180-o.h,o.w,4);
}
const fx=4800-camX;
if(fx>-50&&fx<950){
for(let k=0;k<10;k++){
ctx.fillStyle=k%2?"#111":"#fff";
ctx.fillRect(fx,otherY+40+k*18,20,18);
ctx.fillRect(fx+20,otherY+40+k*18,20,18);
}
}
const carY=otherY+150-player.y;
ctx.save();ctx.translate(150,carY);
ctx.fillStyle="#0c0f24";ctx.fillRect(-18,-4,8,12);ctx.fillRect(10,-4,8,12);
ctx.fillStyle=player.color;ctx.fillRect(-20,-15,40,20);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(-20,-15,40,20);
ctx.fillStyle="#dff6ff";ctx.fillRect(-12,-10,8,8);
ctx.restore();
ctx.fillStyle="#11152b";ctx.fillRect(250,progressY,400,8);
ctx.fillStyle=player.color;ctx.fillRect(250,progressY,400*(player.progress/4800),8);
ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.strokeRect(250,progressY,400,8);
ctx.fillStyle="#11152b";ctx.font="bold 18px Courier New";ctx.textAlign="center";
ctx.fillText("P1",450,labelY);ctx.textAlign="left";
ctx.restore();
};

drawHalf(race.p1,0,270,20);
ctx.fillStyle="#ffe66d";ctx.fillRect(448,0,4,500);
drawHalf(race.p2,250,470,270);

if(!race.active){
ctx.fillStyle="#080b18cc";ctx.fillRect(230,190,440,90);
ctx.fillStyle="#ffe66d";ctx.font="bold 28px Courier New";ctx.textAlign="center";
ctx.fillText(race.winner,450,235);
ctx.font="15px Courier New";ctx.fillText("PRESS RESTART TO REMATCH",450,265);
ctx.textAlign="left";
}
}

function raceLoop(){
if(activeScreen!=="raceGame"){
requestAnimationFrame(raceLoop);
return;
}

stepGame(updateRace);
drawRace();
requestAnimationFrame(raceLoop);
}

addEventListener("keydown",event=>{
if(document.getElementById("raceGame").classList.contains("active")){
if(["a","d","w","arrowleft","arrowright","arrowup"].includes(event.key.toLowerCase())){
event.preventDefault();
}
}
});

resetRace();
requestAnimationFrame(raceLoop);

/* =========================
MINI PARKOUR CLASH
========================= */

const platformCanvas=document.getElementById("platformCanvas");
const platformCtx=platformCanvas.getContext("2d");
const platformMsg=document.getElementById("platformMsg");

const platformWorld={
width:2400,
height:500,
gravity:1400,

platforms:[
{x:0,y:445,w:360,h:55},
{x:430,y:390,w:180,h:18},
{x:680,y:330,w:150,h:18},
{x:900,y:410,w:170,h:18},
{x:1140,y:350,w:190,h:18},
{x:1390,y:285,w:150,h:18},
{x:1600,y:380,w:190,h:18},
{x:1870,y:315,w:170,h:18},
{x:2110,y:245,w:190,h:18},
{x:2320,y:445,w:80,h:55}
],

hazards:[
{x:360,y:445,w:70,h:55},
{x:610,y:445,w:70,h:55},
{x:830,y:445,w:70,h:55},
{x:1070,y:445,w:70,h:55},
{x:1330,y:445,w:60,h:55},
{x:1540,y:445,w:60,h:55},
{x:1790,y:445,w:80,h:55},
{x:2040,y:445,w:70,h:55},
{x:2220,y:445,w:100,h:55},

{x:500,y:360,w:35,h:30},
{x:970,y:380,w:35,h:30},
{x:1200,y:320,w:35,h:30},
{x:1640,y:350,w:35,h:30},
{x:1930,y:285,w:35,h:30}
]
};

let platformGame={
active:true,
p1:null,
p2:null,
winner:"",
particles:[]
};

function makePlatformPlayer(x,color,controls){
return{
x,
y:400,
w:18,
h:30,
vx:0,
vy:0,
speed:190,
jump:525,
grounded:false,
color,
controls,
alive:true
};
}

function resetPlatform(){
platformGame.p1=makePlatformPlayer(
45,
"#64eaff",
{left:"a",right:"d",jump:"w"}
);

platformGame.p2=makePlatformPlayer(
80,
"#ff72c8",
{left:"arrowleft",right:"arrowright",jump:"arrowup"}
);

platformGame.active=true;
platformGame.winner="";
platformGame.particles=[];
platformGame.splitScreen=true;

platformMsg.textContent="RACE TO THE FINISH!";
}

function platformOverlap(a,b){
return a.x<b.x+b.w &&
a.x+a.w>b.x &&
a.y<b.y+b.h &&
a.y+a.h>b.y;
}

function platformInput(player){
player.vx=0;

if(keys[player.controls.left]){
player.vx=-player.speed;
}

if(keys[player.controls.right]){
player.vx=player.speed;
}

if(
keys[player.controls.jump] &&
player.grounded
){
player.vy=-player.jump;
player.grounded=false;
createPlatformParticles(
player.x+player.w/2,
player.y+player.h,
player.color,
8
);
}
}

function movePlatformPlayer(player,dt){
platformInput(player);

player.vy+=platformWorld.gravity*dt;

player.x+=player.vx*dt;
player.x=clamp(
player.x,
0,
platformWorld.width-player.w
);

const oldBottom=player.y+player.h;

player.y+=player.vy*dt;
player.grounded=false;

for(const platform of platformWorld.platforms){
const horizontal=
player.x+player.w>platform.x &&
player.x<platform.x+platform.w;

const landing=
horizontal &&
oldBottom<=platform.y &&
player.y+player.h>=platform.y &&
player.vy>=0;

if(landing){
player.y=platform.y-player.h;
player.vy=0;
player.grounded=true;
}
}

for(const hazard of platformWorld.hazards){
if(platformOverlap(player,hazard)){
player.alive=false;
createPlatformParticles(
player.x+player.w/2,
player.y+player.h/2,
"#ff5878",
18
);
}
}

if(player.y>550){
player.alive=false;
}
}

function createPlatformParticles(x,y,color,count){
for(let i=0;i<count;i++){
platformGame.particles.push({
x,
y,
vx:(Math.random()-.5)*260,
vy:(Math.random()-.5)*260,
life:.5+Math.random()*.3,
color
});
}
}

function updatePlatformParticles(dt){
platformGame.particles.forEach(p=>{
p.x+=p.vx*dt;
p.y+=p.vy*dt;
p.vy+=700*dt;
p.life-=dt;
});

platformGame.particles=
platformGame.particles.filter(p=>p.life>0);
}

function updatePlatform(){
if(!platformGame.active)return;

const dt=1/60;
const p1=platformGame.p1;
const p2=platformGame.p2;

if(p1.alive)movePlatformPlayer(p1,dt);
if(p2.alive)movePlatformPlayer(p2,dt);

updatePlatformParticles(dt);

const finishX=platformWorld.width-80;

if(p1.alive && p1.x+p1.w>=finishX){
platformGame.active=false;
platformGame.winner="PLAYER 1 FINISHED!";
platformMsg.textContent=platformGame.winner;
recordWin("platform","p1");
}

if(p2.alive && p2.x+p2.w>=finishX){
platformGame.active=false;
platformGame.winner="PLAYER 2 FINISHED!";
platformMsg.textContent=platformGame.winner;
recordWin("platform","p2");
}

if(
platformGame.active &&
!p1.alive &&
!p2.alive
){
platformGame.active=false;
platformGame.winner="BOTH PLAYERS FELL!";
platformMsg.textContent=platformGame.winner;
}else if(
platformGame.active &&
!p1.alive
){
platformGame.active=false;
platformGame.winner="PLAYER 2 WINS!";
platformMsg.textContent=platformGame.winner;
recordWin("platform","p2");
}
else if(
platformGame.active &&
!p2.alive
){
platformGame.active=false;
platformGame.winner="PLAYER 1 WINS!";
platformMsg.textContent=platformGame.winner;
recordWin("platform","p1");
}

}

function drawPlatformPlayer(player){
if(!player.alive)return;

const ctx=platformCtx;

ctx.fillStyle=player.color;
ctx.fillRect(player.x,player.y+7,player.w,player.h-7);

ctx.fillStyle="#f3bd83";
ctx.fillRect(player.x+3,player.y,12,12);

ctx.fillStyle="#11152b";
ctx.fillRect(player.x+11,player.y+4,3,3);

ctx.fillStyle="#11152b";
ctx.fillRect(player.x+2,player.y+player.h-3,5,6);
ctx.fillRect(player.x+11,player.y+player.h-3,5,6);
}

function drawPlatform(){
const ctx=platformCtx;
ctx.fillStyle="#101936";
ctx.fillRect(0,0,900,500);

const drawWorld=(cameraX,ox)=>{
ctx.save();
ctx.translate(ox-cameraX,0);

/* Background */
for(let i=0;i<90;i++){
ctx.fillStyle=i%2?"#26386f":"#354d88";
ctx.fillRect(
(i*83)%platformWorld.width,
(i*47)%330,
4,
4
);
}

/* Finish flag */
ctx.fillStyle="#ffe66d";
ctx.fillRect(platformWorld.width-70,100,6,345);
ctx.fillStyle="#ff5878";
ctx.fillRect(platformWorld.width-64,100,60,35);

/* Platforms */
platformWorld.platforms.forEach((platform,index)=>{
ctx.fillStyle=index%2?"#744b83":"#354d70";
ctx.fillRect(
platform.x,
platform.y,
platform.w,
platform.h
);

ctx.fillStyle="#63f59a";
ctx.fillRect(
platform.x,
platform.y,
platform.w,
5
);
});

/* Spikes and hazards */
platformWorld.hazards.forEach(hazard=>{
ctx.fillStyle="#ff5878";

for(let x=hazard.x;x<hazard.x+hazard.w;x+=18){
ctx.beginPath();
ctx.moveTo(x,hazard.y+hazard.h);
ctx.lineTo(x+9,hazard.y);
ctx.lineTo(x+18,hazard.y+hazard.h);
ctx.fill();
}
});

/* Finish text */
ctx.fillStyle="#ffe66d";
ctx.font="bold 16px Courier New";
ctx.fillText("FINISH",platformWorld.width-100,85);

ctx.restore();
};

const cam1=clamp(platformGame.p1.x-225,0,platformWorld.width-450);
const cam2=clamp(platformGame.p2.x-225,0,platformWorld.width-450);

/* P1 viewport - left half */
ctx.save();
ctx.beginPath();ctx.rect(0,0,450,500);ctx.clip();
drawWorld(cam1,0);
drawPlatformPlayer(platformGame.p1);
platformGame.particles.forEach(p=>{
ctx.globalAlpha=Math.max(0,p.life/.8);
ctx.fillStyle=p.color;
ctx.fillRect(p.x-cam1,p.y,5,5);
});
ctx.restore();

/* Center divider */
ctx.fillStyle="#ffe66d";
ctx.fillRect(448,0,4,500);

/* P2 viewport - right half */
ctx.save();
ctx.beginPath();ctx.rect(450,0,450,500);ctx.clip();
drawWorld(cam2,450);
drawPlatformPlayer(platformGame.p2);
platformGame.particles.forEach(p=>{
ctx.globalAlpha=Math.max(0,p.life/.8);
ctx.fillStyle=p.color;
ctx.fillRect(p.x-cam2+450,p.y,5,5);
});
ctx.restore();

if(!platformGame.active){
ctx.fillStyle="#080b18dd";
ctx.fillRect(220,190,460,90);

ctx.fillStyle="#ffe66d";
ctx.font="bold 25px Courier New";
ctx.textAlign="center";
ctx.fillText(
platformGame.winner,
450,
235
);

ctx.font="14px Courier New";
ctx.fillText(
"PRESS RESTART TO RACE AGAIN",
450,
260
);

ctx.textAlign="left";
}
}

function platformLoop(){
if(activeScreen!=="platformGame"){
requestAnimationFrame(platformLoop);
return;
}

stepGame(updatePlatform);
drawPlatform();
requestAnimationFrame(platformLoop);
}

resetPlatform();
requestAnimationFrame(platformLoop);

/* =========================
TIC-TAC-TOE POLISH
========================= */

const tttBoard=document.getElementById("board");
let tttCells=[];
let tttTurn="X";
let tttOver=false;

function resetTTT(){
tttBoard.innerHTML="";
tttCells=Array(9).fill("");
tttTurn="X";
tttOver=false;
document.getElementById("tttMsg").textContent="PLAYER X'S TURN";

for(let i=0;i<9;i++){
const cell=document.createElement("button");
cell.className="cell";
cell.dataset.index=i;
cell.onclick=()=>playTTT(i);
tttBoard.appendChild(cell);
}
}

function playTTT(index){
if(tttOver || tttCells[index])return;

tttCells[index]=tttTurn;

const cell=tttBoard.children[index];
cell.textContent=tttTurn;
cell.style.color=tttTurn==="X"?"#64eaff":"#ff72c8";

const winningLines=[
[0,1,2],[3,4,5],[6,7,8],
[0,3,6],[1,4,7],[2,5,8],
[0,4,8],[2,4,6]
];

const winningLine=winningLines.find(line=>
line.every(position=>tttCells[position]===tttTurn)
);

if(winningLine){
tttOver=true;

winningLine.forEach(position=>{
tttBoard.children[position].classList.add("winning-cell");
});

document.getElementById("tttMsg").textContent=
`PLAYER ${tttTurn} WINS!`;
recordWin("ttt",tttTurn==="X"?"p1":"p2");

return;
}

if(tttCells.every(Boolean)){
tttOver=true;
document.getElementById("tttMsg").textContent="DRAW!";
return;
}

tttTurn=tttTurn==="X"?"O":"X";
document.getElementById("tttMsg").textContent=
`PLAYER ${tttTurn}'S TURN`;
}

const tttStyle=document.createElement("style");

tttStyle.textContent=`
.cell{
transition:.15s;
}

.cell:not(:disabled):hover{
background:#253364;
}

.winning-cell{
animation:winningCell .45s steps(2) infinite alternate;
background:#ffe66d!important;
color:#11152b!important;
}

@keyframes winningCell{
from{transform:scale(1)}
to{transform:scale(1.08);filter:brightness(1.5)}
}
`;

document.head.appendChild(tttStyle);

resetTTT();


/* =========================
CONNECT FOUR POLISH
========================= */

let connectGrid=[];
let connectTurn="red";
let connectOver=false;

function resetConnect(){
connectGrid=Array.from(
{length:6},
()=>Array(7).fill("")
);

connectTurn="red";
connectOver=false;
document.getElementById("connectMsg").textContent="RED'S TURN";
drawConnect();
}

function drawConnect(){
const connect=document.getElementById("connect");
connect.innerHTML="";

for(let row=0;row<6;row++){
for(let col=0;col<7;col++){
const slot=document.createElement("button");

slot.className="slot";
if(connectGrid[row][col]){
slot.classList.add(connectGrid[row][col]);
}

slot.onclick=()=>dropConnectPiece(col);
connect.appendChild(slot);
}
}
}

function dropConnectPiece(column){
if(connectOver)return;

let row=-1;

for(let r=5;r>=0;r--){
if(!connectGrid[r][column]){
row=r;
break;
}
}

if(row===-1)return;

const connect=document.getElementById("connect");
const slots=[...connect.children];

const topSlot=slots[column];
const targetSlot=slots[row*7+column];

const preview=document.createElement("div");
preview.className="connect-drop-preview";
preview.style.background=
connectTurn==="red"?"#ff5878":"#ffe66d";

const connectBox=connect.getBoundingClientRect();
const topBox=topSlot.getBoundingClientRect();

preview.style.left=
`${topBox.left-connectBox.left}px`;

preview.style.top=
`${topBox.top-connectBox.top}px`;

connect.appendChild(preview);

setTimeout(()=>{
preview.remove();

connectGrid[row][column]=connectTurn;
drawConnect();

const landedSlot=connect.children[row*7+column];
landedSlot.style.animation="connectDrop .38s cubic-bezier(.2,.9,.3,1)";

const winningCells=findConnectWinner(row,column);

if(winningCells){
connectOver=true;

winningCells.forEach(([r,c])=>{
connect.children[r*7+c].classList.add("connect-win");
});

document.getElementById("connectMsg").textContent=
`${connectTurn.toUpperCase()} WINS!`;
recordWin("connect",connectTurn==="red"?"p1":"p2");

return;
}

if(connectGrid.every(row=>row.every(Boolean))){
connectOver=true;
document.getElementById("connectMsg").textContent="DRAW!";
return;
}

connectTurn=connectTurn==="red"?"yellow":"red";
document.getElementById("connectMsg").textContent=
`${connectTurn.toUpperCase()}'S TURN`;

},80);
}
function findConnectWinner(row,col){
const color=connectGrid[row][col];
const directions=[
[1,0],
[0,1],
[1,1],
[1,-1]
];

for(const [dr,dc] of directions){
const cells=[[row,col]];

for(const sign of [-1,1]){
let r=row+dr*sign;
let c=col+dc*sign;

while(
r>=0&&r<6&&
c>=0&&c<7&&
connectGrid[r][c]===color
){
cells.push([r,c]);
r+=dr*sign;
c+=dc*sign;
}
}

if(cells.length>=4)return cells;
}

return null;
}

const connectStyle=document.createElement("style");

connectStyle.textContent=`
.slot{
transition:.12s;
}

.slot.connect-win{
animation:connectWin .4s steps(2) infinite alternate;
border-color:#fff;
}

@keyframes connectWin{
from{filter:brightness(1)}
to{filter:brightness(1.8);transform:scale(1.08)}
}
`;

document.head.appendChild(connectStyle);

resetConnect();

const touchBtn=(id,key,fn)=>{
const b=document.getElementById(id);
if(!b)return;
const start=()=>{fn(key);};
b.addEventListener("mousedown",e=>{e.preventDefault();start();});
b.addEventListener("touchstart",e=>{e.preventDefault();start();});
};

touchBtn("touchDuelP1","a",duelKey);
touchBtn("touchDuelP2","l",duelKey);
touchBtn("touchTugP1","a",tugPress);
touchBtn("touchTugP2","l",tugPress);

/* Number-key controls for Connect Four */
addEventListener("keydown",event=>{
if(!document.getElementById("connectGame").classList.contains("active")){
return;
}

if(event.key>="1" && event.key<="7"){
dropConnectPiece(Number(event.key)-1);
}
});

/* Space to restart the current active game when it's over */
addEventListener("keydown",event=>{
if(event.code!=="Space")return;
const s=document.querySelector(".screen.active");
if(!s || s.id==="menu")return;
const resets={
pong:resetPong,ttt:resetTTT,connectGame:resetConnect,duelGame:startDuel,
tugGame:startTug,breadGame:resetBread,hockeyGame:resetHockey,bombGame:resetBomb,
raceGame:resetRace,platformGame:resetPlatform,dodgeGame:resetDodge,sumoGame:resetSumo,
snakeGame:resetSnake,basketGame:resetBasket,volleyGame:resetVolley,memGame:resetMem,reactGame:resetReact
};
const fn=resets[s.id];
let canRestart=false;
if(s.id==="pong")canRestart=!pong.running;
if(s.id==="ttt")canRestart=tttOver;
if(s.id==="connectGame")canRestart=connectOver;
if(s.id==="duelGame")canRestart=!duel.active;
if(s.id==="tugGame")canRestart=!tug.active;
if(s.id==="breadGame")canRestart=!bread.active;
if(s.id==="hockeyGame")canRestart=!hockey.active;
if(s.id==="bombGame")canRestart=!bomb.active;
if(s.id==="dodgeGame")canRestart=!dodge.active;
if(s.id==="sumoGame")canRestart=!sumo.active;
if(s.id==="raceGame")canRestart=!race.active;
if(s.id==="platformGame")canRestart=!platformGame.active;
if(s.id==="snakeGame")canRestart=!snake.active;
if(s.id==="basketGame")canRestart=!basket.active;
if(s.id==="volleyGame")canRestart=!volley.active;
if(s.id==="memGame")canRestart=!mem.active;
if(s.id==="reactGame")canRestart=!react.active;
if(fn && canRestart){
event.preventDefault();
fn();
}
});

/* Fullscreen toggle (F11) */
addEventListener("keydown",event=>{
if(event.key!=="F11")return;
event.preventDefault();
const el=document.documentElement;
if(!document.fullscreenElement){
el.requestFullscreen().catch(()=>{});
}else{
document.exitFullscreen().catch(()=>{});
}
});

/* =========================
ARCADE SOUND EFFECTS
========================= */

let audioContext=null;

function getAudio(){
if(!audioContext){
audioContext=new (window.AudioContext||window.webkitAudioContext)();
}

if(audioContext.state==="suspended"){
audioContext.resume();
}

return audioContext;
}

function playTone(frequency,duration=.08,type="square",volume=.035){
if(!settings.sound)return;
const audio=getAudio();
const oscillator=audio.createOscillator();
const gain=audio.createGain();

oscillator.type=type;
oscillator.frequency.value=frequency;
gain.gain.value=volume*settings.volume;

oscillator.connect(gain);
gain.connect(audio.destination);

oscillator.start();
gain.gain.exponentialRampToValueAtTime(
.001,
audio.currentTime+duration
);
oscillator.stop(audio.currentTime+duration);
}

function playHitSound(){
playTone(180,.06,"square",.04);
setTimeout(()=>playTone(280,.06,"square",.03),35);
}

function playWinSound(){
playTone(330,.1,"square",.04);
setTimeout(()=>playTone(440,.1,"square",.04),100);
setTimeout(()=>playTone(660,.18,"square",.04),200);
}

function playJumpSound(){
playTone(260,.08,"square",.025);
}

function playSelectSound(){
playTone(520,.05,"square",.025);
}

/* Menu button feedback */
document.querySelectorAll("button").forEach(button=>{
button.addEventListener("click",()=>{
playSelectSound();
button.blur();
});
});

/* Audio unlock: resume/schedule on the FIRST real user gesture so previews
   and SFX are reliably audible (Chrome autoplay policy). */
(function(){
const unlock=()=>{
try{getAudio();}catch(e){}
["pointerdown","keydown","touchstart"].forEach(ev=>removeEventListener(ev,unlock,{capture:true}));
};
["pointerdown","keydown","touchstart"].forEach(ev=>addEventListener(ev,unlock,{capture:true,once:false}));
})();


/* Watch status messages for victory feedback */
const statusElements=[
document.getElementById("pongStatus"),
document.getElementById("tttMsg"),
document.getElementById("connectMsg"),
document.getElementById("duelMsg"),
document.getElementById("tugMsg"),
document.getElementById("breadMsg"),
document.getElementById("hockeyMsg"),
document.getElementById("bombMsg"),
document.getElementById("dodgeMsg"),
document.getElementById("sumoMsg"),
document.getElementById("snakeMsg"),
document.getElementById("basketMsg"),
document.getElementById("volleyMsg"),
document.getElementById("memMsg"),
document.getElementById("reactMsg"),
document.getElementById("raceMsg"),
document.getElementById("platformMsg")
];

const statusWatcher=new MutationObserver(mutations=>{
mutations.forEach(mutation=>{
const text=mutation.target.textContent.toLowerCase();

if(
text.includes("wins") ||
text.includes("winner") ||
text.includes("photo finish") ||
text.includes("double ko")
){
playWinSound();
}
});
});

statusElements.forEach(element=>{
if(element){
statusWatcher.observe(element,{
childList:true,
characterData:true,
subtree:true
});
}
});

/* =========================
ARCADE TITLE EFFECTS
========================= */

const menuTitle=document.querySelector("#menu h1");
const menuSubtitle=document.querySelector("#menu p");

let titleFrame=0;
let titleTime=0;

function animateTitle(){
titleTime+=.02;
titleFrame++;

const pulse=(Math.sin(titleTime*1.5)+1)/2;
const shift=Math.round(Math.sin(titleTime*2)*1.5);

menuTitle.style.transform=
`translate(${shift}px,${shift}px)`;

menuTitle.style.textShadow=`
0 0 ${18+Math.round(pulse*15)}px #64eaff
`;

if(titleFrame%45===0){
menuSubtitle.style.opacity=
menuSubtitle.style.opacity==="0"?"1":"0";
}

requestAnimationFrame(animateTitle);
}

animateTitle();


/* =========================
SCREEN TRANSITIONS
========================= */

function transitionTo(screen){
const current=document.querySelector(".screen.active");

if(current){
current.classList.add("screen-out");

setTimeout(()=>{
current.classList.remove("active","screen-out");
screen.classList.add("active","screen-in");

setTimeout(()=>{
screen.classList.remove("screen-in");
},260);
},180);
}else{
screen.classList.add("active");
}
}

const transitionStyle=document.createElement("style");

transitionStyle.textContent=`
.screen-out{
display:block!important;
animation:screenOut .18s steps(3) forwards!important;
}

.screen-in{
animation:screenInArcade .26s steps(4) forwards!important;
}

@keyframes screenOut{
0%{opacity:1;transform:translateX(0)}
50%{opacity:.5;transform:translateX(-12px)}
100%{opacity:0;transform:translateX(30px)}
}

@keyframes screenInArcade{
0%{opacity:0;transform:translateX(-30px);filter:brightness(2)}
50%{opacity:.6;transform:translateX(12px);filter:brightness(1.5)}
100%{opacity:1;transform:translateX(0);filter:brightness(1)}
}
`;

document.head.appendChild(transitionStyle);

/* Replace normal screen switching with animated switching */
const gameTitles={
pong:"Neon Pong",ttt:"Grid Duel",connectGame:"Four in a Row",duelGame:"Western Duel",
tugGame:"Tug of War",breadGame:"Bread Wars",raceGame:"Pixel Racers",platformGame:"Platform Clash",
hockeyGame:"Air Hockey",bombGame:"Bomb Duel",dodgeGame:"Dodgeball",sumoGame:"Sumo Rush",
snakeGame:"Snake Tron",basketGame:"Basketball Hoops",volleyGame:"Volleyball",memGame:"Memory Match",reactGame:"Reaction Duel"
};

let navUntil=0;
function openGame(id){
try{
const next=document.getElementById(id);
const current=document.querySelector(".screen.active");
if(current===next)return;
if(performance.now()<navUntil)return;
navUntil=performance.now()+460;
document.title=PDX_titleFor(gameTitles[id]||"Arcade");

try{playSelectSound();}catch(e){}

if(current){
current.classList.add("screen-out");

setTimeout(()=>{
current.classList.remove("active","screen-out");
next.classList.add("active","screen-in");
activeScreen=id;

document.querySelectorAll(".touch-pad").forEach(p=>p.classList.remove("active"));

if(id==="pong") resetPong();
if(id==="tugGame"){ startTug(); document.getElementById("tugTouch").classList.add("active"); }
if(id==="breadGame") resetBread();
if(id==="hockeyGame") resetHockey();
if(id==="bombGame") resetBomb();
if(id==="dodgeGame") resetDodge();
if(id==="sumoGame") resetSumo();
if(id==="snakeGame") resetSnake();
if(id==="basketGame") resetBasket();
if(id==="volleyGame") resetVolley();
if(id==="memGame") resetMem();
if(id==="reactGame") resetReact();
if(id==="raceGame") resetRace();
if(id==="platformGame") resetPlatform();
if(id==="duelGame"){ startDuel(); document.getElementById("duelTouch").classList.add("active"); }
if(id==="connectGame") resetConnect();
if(window.GAME_HOOKS&&GAME_HOOKS[id]) GAME_HOOKS[id]();
Object.keys(keys).forEach(k=>keys[k]=false);

setTimeout(()=>{
next.classList.remove("screen-in");
},260);
},180);
}else{
next.classList.add("active");
activeScreen=id;
}
}catch(e){console.error("openGame error",e);}
}

function showMenu(){
try{
const menu=document.getElementById("menu");
const current=document.querySelector(".screen.active");
if(current===menu)return;
if(performance.now()<navUntil)return;
navUntil=performance.now()+460;
document.title=PDX_titleFor("Arcade");
paused=false;countdownActive=false;

try{playSelectSound();}catch(e){}
activeScreen="menu";

document.querySelectorAll(".touch-pad").forEach(p=>p.classList.remove("active"));

current.classList.add("screen-out");

setTimeout(()=>{
current.classList.remove("active","screen-out");
menu.classList.add("active","screen-in");

setTimeout(()=>{
menu.classList.remove("screen-in");
},260);
},180);
loadWins();
}catch(e){console.error("showMenu error",e);}
}

loadSettings();
initMenuFilter();

/* Game menu organization: search + category filters */
const GAME_CATS={
 pong:"classic",ttt:"classic","connectGame":"classic",memGame:"classic",reactGame:"classic",
 duelGame:"action",tugGame:"action",breadGame:"action",bombGame:"action",dodgeGame:"action",sumoGame:"action",potatoGame:"action",
 hockeyGame:"sports",basketGame:"sports",volleyGame:"sports",raceGame:"sports",
 snakeGame:"skill",platformGame:"skill",tankGame:"skill",spaceGame:"skill",
};
const CAT_LABELS={all:"All",action:"Action",sports:"Sports",classic:"Classic",skill:"Skill",multiplayer:"Multiplayer"};
let currentCat="all";
let currentSearch="";

function initMenuFilter(){
 const search=document.getElementById("gameSearch");
 const chips=document.getElementById("catChips");
 if(!search||!chips)return;
 Object.entries(CAT_LABELS).forEach(([key,label])=>{
  const c=document.createElement("button");
  c.className="chip"+(key===currentCat?" on":"");
  c.textContent=label;
  c.dataset.cat=key;
  c.onclick=()=>{currentCat=key;document.querySelectorAll("#catChips .chip").forEach(x=>x.classList.toggle("on",x.dataset.cat===key));filterGames();};
  chips.appendChild(c);
 });
 search.addEventListener("input",()=>{currentSearch=search.value.toLowerCase();filterGames();});
 document.querySelectorAll(".game-card").forEach(btn=>{
  const id=btn.getAttribute("onclick")||"";
  const m=id.match(/openGame\('([^']+)'\)/);
  if(m&&GAME_CATS[m[1]])btn.dataset.category=GAME_CATS[m[1]];
  else if(btn.classList.contains("party-card"))btn.dataset.category="multiplayer";
 });
 filterGames();
 const el=document.getElementById("gameCount");
 if(el)el.textContent=document.querySelectorAll(".game-card").length+" games";
}

function filterGames(){
 const q=currentSearch;
 const cat=currentCat;
 let count=0;
 document.querySelectorAll(".game-card").forEach(btn=>{
  const catMatch=cat==="all"||btn.dataset.category===cat;
  const text=(btn.textContent||"").toLowerCase();
  const searchMatch=!q||text.includes(q);
  const show=catMatch&&searchMatch;
  btn.style.display=show?"":"none";
  if(show)count++;
 });
 const el=document.getElementById("gameCount");
 if(el)el.textContent=count+" games";
}

/* =========================
PIXEL SHOP (cosmetic titles + coins)
========================= */
let shop={coins:100,owned:["nova"],equipped:null};
const SHOP_ITEMS=[
 {id:"nova",name:"Nova",price:50,desc:"Neon title",title:"Nova"},
 {id:"void",name:"Void",price:120,desc:"Dark title",title:"Ø"},
 {id:"gold",name:"Gold",price:250,desc:"Golden title",title:"★"},
 {id:"glitch",name:"Glitch",price:400,desc:"Glitched title",title:"<>"},
];
function loadShop(){
 const raw=safeStorageGet("pixelduel-shop",null);
 if(raw){shop.coins=raw.coins||0;shop.owned=raw.owned||["nova"];shop.equipped=raw.equipped||null;}
}
function saveShop(){safeStorageSet("pixelduel-shop",shop);}
function toggleShop(){
 // the menu 💎 opens the REAL Pixel Shop (mega_shop.js) — the old
 // decorative panel is no longer used
 if(typeof window.openShop==='function'){window.openShop();return;}
 const panel=document.getElementById("shopPanel");
 if(!panel)return;
 panel.classList.toggle("open");
 if(panel.classList.contains("open"))renderShop();
}
function renderShop(){
 const grid=document.getElementById("shopGrid");
 const coinsEl=document.getElementById("shopCoins");
 const msg=document.getElementById("shopMsg");
 const badge=document.getElementById("shopBadge");
 if(!grid)return;
 coinsEl.textContent=shop.coins;
 badge.textContent=shop.equipped?"["+SHOP_ITEMS.find(i=>i.id===shop.equipped).title+"]":"";
 badge.style.display=shop.equipped?"inline-block":"none";
 grid.innerHTML="";
 SHOP_ITEMS.forEach(it=>{
  const owned=shop.owned.includes(it.id);
  const equipped=shop.equipped===it.id;
  const card=document.createElement("div");
  card.style.cssText="background:var(--panel);border:2px solid var(--panel-border);padding:10px;border-radius:8px;display:flex;flex-direction:column;gap:6px;";
  card.innerHTML=`
 <div style="font-weight:bold;color:var(--accent3)">${it.name}</div>
 <div style="color:var(--muted);font-size:12px">${it.desc}</div>
 <div style="color:var(--text);font-size:13px">$${it.price}</div>
 <div style="margin-top:auto"></div>
 <button style="width:100%;padding:6px;border:none;border-radius:4px;font-family:inherit;font-weight:bold;cursor:pointer">${owned?(equipped?"EQUIPPED":(shop.equipped?"EQUIP":"OWNED")):("BUY")}</button>
 `;
  const btn=card.querySelector("button");
  if(!owned){
   btn.style.background="var(--accent3)";btn.style.color="#05060f";
   btn.onclick=()=>{buyItem(it.id);};
  }else if(equipped){
   btn.style.background="#2a3260";btn.style.color=varSafe("--muted");btn.disabled=true;
  }else{
   btn.style.background="var(--accent)";btn.style.color=varSafe("--bg1");
   btn.onclick=()=>{equipItem(it.id);};
  }
  grid.appendChild(card);
 });
 if(msg)msg.textContent=shop.equipped?"Equipped: "+SHOP_ITEMS.find(i=>i.id===shop.equipped).title:"";
}
function varSafe(name){const s=getComputedStyle(document.documentElement);return s.getPropertyValue(name).trim();}
function buyItem(id){
 const it=SHOP_ITEMS.find(i=>i.id===id);
 if(!it)return;
 if(shop.owned.includes(id))return;
 if(shop.coins<it.price){const m=document.getElementById("shopMsg");if(m)m.textContent="Not enough coins!";return;}
 shop.coins-=it.price;shop.owned.push(id);saveShop();renderShop();
}
function equipItem(id){shop.equipped=id;saveShop();renderShop();}
function initShop(){loadShop();renderShop();}
initShop();