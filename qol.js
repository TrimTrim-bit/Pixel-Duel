(function(){
"use strict";
const RECENT_KEY="pixelduel-recent-v1";
function loadRecent(){try{return JSON.parse(localStorage.getItem(RECENT_KEY))||[];}catch(e){return[];}}
function saveRecent(arr){try{localStorage.setItem(RECENT_KEY,JSON.stringify(arr.slice(0,10)));}catch(e){}}
let recent=loadRecent();
const _openGame=window.openGame;
window.openGame=function(id){
  if(id&&id!=="menu"){
    recent=recent.filter(x=>x!==id);
    recent.unshift(id);
    if(recent.length>10)recent.length=10;
    saveRecent(recent);
    updateRecentStrip();
    showTipsIfFirstTime(id);
  }
  return _openGame.apply(this,arguments);
};
function updateRecentStrip(){
  let strip=document.getElementById("recentStrip");
  if(!strip){
    strip=document.createElement("div");
    strip.id="recentStrip";
    strip.style.cssText="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:10px auto;max-width:1000px;padding:0 10px;";
    const grid=document.querySelector("#menu .menu-buttons");
    if(!grid)return;
    const tools=document.getElementById("menuTools");
    if(tools&&tools.parentNode)tools.parentNode.insertBefore(strip,tools);
    else grid.parentNode.insertBefore(strip,grid);
  }
  if(!recent.length){strip.style.display="none";return;}
  strip.style.display="flex";
  const catalog=window.PDX_CATALOG||[];
  strip.innerHTML=`<div style="width:100%;text-align:center;color:#9fc0ff;font-family:'Courier New',monospace;font-size:12px;letter-spacing:2px;margin-bottom:4px;">RECENTLY PLAYED</div>`+
    recent.map(id=>{
      const g=catalog.find(c=>c.id===id);
      if(!g)return "";
      return `<button class="game-card" style="flex:0 0 auto;min-width:130px;padding:8px 10px;font-size:11px;" onclick="openGame('${id}')"><strong style="font-size:11px;">${g.title}</strong></button>`;
    }).join("");
}
const TIPS_KEY="pixelduel-tips-seen-v1";
function loadTipsSeen(){try{return JSON.parse(localStorage.getItem(TIPS_KEY))||{};}catch(e){return{};}}
function saveTipsSeen(obj){try{localStorage.setItem(TIPS_KEY,JSON.stringify(obj));}catch(e){}}
let tipsSeen=loadTipsSeen();
const GAME_TIPS={
  pong:"Hit the ball with the EDGE of your paddle for sharper angles.",
  connectGame:"Control the center columns early.",
  duelGame:"Don't shoot before DRAW! — you'll lose instantly.",
  tugGame:"Rhythm beats mashing. Alternate fast but steady.",
  hockeyGame:"Angle your mallet to curve shots.",
  bombGame:"Bombs bounce — bank shots work.",
  dodgeGame:"Throw while jumping for a higher arc.",
  sumoGame:"Push when rival is off-balance, not head-on.",
  snakeGame:"Cut your rival off — don't chase.",
  basketGame:"Shoot from the corner for a wider margin.",
  volleyGame:"Jump late, not early — timing matters.",
  raceGame:"Hold the accelerator. Obstacles slow you more than steering around them.",
  platformGame:"Wall-jump off walls for extra height.",
  breakoutGame:"Aim with the paddle edge to change ball angle.",
  slimeGame:"Jump into the ball from below — momentum carries it over.",
  colorswitchGame:"Watch the ring rotation before jumping.",
  warlordsGame:"Bounce off walls — you can hit the rival's castle from behind.",
  zombieGame:"Aim for the head (center) — it's faster to kill.",
  chainbombGame:"Place bombs near other bombs for chain bonuses.",
  joustGame2:"Flap right before impact — being higher wins.",
  iceclimberGame:"Jump when you're AT the edge of a platform.",
  duckgooseGame:"Corner your rival — don't chase in circles.",
  tankbattleGame:"Bank shots off walls to hit from behind.",
  triviaGame:"Read the question carefully — some answers are traps.",
  pinballGame:"Let the ball settle before flipping.",
  asteroidsGame:"Aim ahead of the asteroid's path.",
  copterGame:"Small taps beat long holds.",
  wheelGame:"Avoid RED segments. Hit gold when possible.",
  hangmanGame:"Start with E, T, A, O.",
  scrambleGame:"Look for common letter pairs first.",
  simonGame:"Say the sequence aloud as you see it.",
  lasertagGame:"Use cover to reload safety.",
  bubbleShooterGame:"Aim for clusters — pop 2+ at once.",
  froggerGame:"Time your jumps between car passes.",
  clickFrenzyGame:"Use two fingers for fast mashing.",
  memoryGridGame:"Say the numbers in order — don't just look.",
  rpslsGame:"Rock beats scissors and lizard. Memorize the chart.",
  bubbleTroubleGame:"Fire straight up, not at angles.",
  ninjaJumpGame:"Alternate sides — don't pause on walls.",
  slingshotSiegeGame:"Charge full power for hard-to-reach bricks.",
  invadersGame:"Clear one column at a time."
};
function showTipsIfFirstTime(id){
  if(tipsSeen[id])return;
  tipsSeen[id]=Date.now();
  saveTipsSeen(tipsSeen);
  const tip=GAME_TIPS[id];
  if(!tip)return;
  setTimeout(()=>{
    const el=document.createElement("div");
    el.style.cssText="position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#080b18;border:3px solid #ffe66d;color:#ffe66d;padding:12px 24px;font-family:'Courier New',monospace;font-size:13px;z-index:200;max-width:600px;text-align:center;box-shadow:0 0 30px #ffe66d66;";
    el.innerHTML=`<strong>💡 TIP:</strong> ${tip}`;
    document.body.appendChild(el);
    setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el);},6000);
  },500);
}
function watchSearch(){
  const search=document.getElementById("gameSearch");
  if(!search||search.dataset.qolWatched)return;
  search.dataset.qolWatched="1";
  search.addEventListener("input",()=>{
    const strip=document.getElementById("recentStrip");
    if(!strip)return;
    const q=search.value.trim();
    strip.style.display=q||!recent.length?"none":"flex";
  });
}
function init(){updateRecentStrip();watchSearch();}
addEventListener("load",init);
setTimeout(init,700);
setInterval(()=>{updateRecentStrip();watchSearch();},3000);
})();