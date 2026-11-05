/* =====================================================
   AI FRAMEWORK
===================================================== */
(function(){
"use strict";

const AI_STATE={enabled:false,mode:"off",difficulty:"normal"};
window.PDX_AI=AI_STATE;

/* Keys the human is not allowed to press because AI controls them.
   Currently unused (games don't enumerate per-player key sets), kept
   as a hook for future games that want to block human input on the
   AI side. */
const AI_OWNED=new Set();
window.PDX_AI_OWNED=AI_OWNED;
function refreshOwnedKeys(){
  AI_OWNED.clear();
}

const AI_KEYS={};
window.PDX_AI_KEYS=AI_KEYS;

function aiPress(k){AI_KEYS[k]=true;setTimeout(()=>{delete AI_KEYS[k];},80);}
window.aiPress=aiPress;

/* Real-event key merge: browsers/games whose per-frame `keys` snapshot is
   rebuilt from real OS key events (script.js reads a fresh object each
   frame) don't respond to plain writes into the OLD object — verified via
   probe: real KeyboardEvent moves the paddle, direct write does not.
   So: dispatch keydown on press, keyup on release, and ALSO write keys[k]. */
const AI_HELD={};
let _heldFlushQueued=false;
function flushHeld(){
  _heldFlushQueued=false;
  for(const k in AI_HELD){keyEventFor(k,false);delete AI_HELD[k];}
}
function keyEventFor(k,down){
  const lower=k.toLowerCase();
  const codes={arrowup:["ArrowUp",38],arrowdown:["ArrowDown",40],arrowleft:["ArrowLeft",37],arrowright:["ArrowRight",39],enter:["Enter",13]," ":[" ",32],space:[" ",32]};
  let key,code,kc;
  if(codes[lower]){[key,kc]=codes[lower];code=key;}
  else if(lower.length===1){key=lower.toUpperCase();code="Key"+key;kc=key.charCodeAt(0);}
  else {key=lower;code=lower;kc=0;}
  try{document.dispatchEvent(new KeyboardEvent(down?"keydown":"keyup",{key,code,keyCode:kc,which:kc,bubbles:true,cancelable:true}));}catch(e){}
}
function mergeAI(){
  if(window.PDX_AI&&window.PDX_AI.enabled){
    for(const k in AI_KEYS){
      if(AI_KEYS[k]&&typeof keys!=="undefined")keys[k]=true;
      if(AI_KEYS[k]&&!AI_HELD[k]){AI_HELD[k]=true;keyEventFor(k,true);}
    }
    /* release any held key no longer requested (also handles aiPress's
       auto-release racing the merge: schedule one deferred flush) */
    for(const k in AI_HELD){
      if(!AI_KEYS[k])break;
    }
    if(!_heldFlushQueued){_heldFlushQueued=true;setTimeout(flushHeld,140);}
  } else if(Object.keys(AI_HELD).length){
    flushHeld();
  }
  requestAnimationFrame(mergeAI);
}
requestAnimationFrame(mergeAI);

const AI_HOOKS={};
function registerAI(id,fn){AI_HOOKS[id]=fn;}
function getAI(id){return AI_HOOKS[id];}

let lastActiveScreen=null;
function runAI(){
  if(!AI_STATE.enabled)return;
  for(const k in AI_KEYS)delete AI_KEYS[k];
  const id=typeof activeScreen!=="undefined"?activeScreen:window.activeScreen;
  if(!id||id==="menu")return;
  lastActiveScreen=id;
  const hook=AI_HOOKS[id];
  if(!hook)return;
  const G=window.PDX_GAME_STATE||{};
  // core games publish under short ids ("bread") while activeScreen is
  // "breadGame" — try the exact id, then the stripped suffix, then scan
  let g=G[id];
  if(!g){
    const short=id.replace(/Game$/,'');
    g=G[short];
    if(!g){for(const k in G){if(k.toLowerCase()===id.toLowerCase()){g=G[k];break;}}}
  }
  if(!g){
    // state not published yet (lazy init) — ask the bridge to retry now
    if(window.PDX_BRIDGE_RETRY)window.PDX_BRIDGE_RETRY();
    return;
  }
  try{hook(g);}catch(e){}
}

/* run every frame — core games (pong, hockey, …) have their own rAF
   loops that never call stepGame, so hooking only stepGame skipped them */
(function aiLoop(){
  runAI();
  requestAnimationFrame(aiLoop);
})();

if(typeof window.stepGame==="function"){
  const _stepGame=window.stepGame;
  window.stepGame=function(fn){runAI();return _stepGame(fn);};
}

/* Sync the settings-panel chip highlight with the current mode. */
function updateAIChips(){
  const map={off:"aiOffBtn",p2_ai:"aiP2Btn",both_ai:"aiBothBtn"};
  for(const m in map){
    const el=document.getElementById(map[m]);
    if(el)el.classList.toggle("active",AI_STATE.mode===m);
  }
}
window.updateAIChips=updateAIChips;

window.setAIMode=function(mode){
  AI_STATE.mode=mode;
  AI_STATE.enabled=mode!=="off";
  updateAIBadge();
  updateAIChips();
  const chipMap={p2_ai:"aiChipP2",both_ai:"aiChipBoth",off:"aiChipOff"};
  for(const m in chipMap){
    const el=document.getElementById(chipMap[m]);
    if(el)el.classList.toggle("on",m===mode);
  }
  if(window.showToast)showToast(mode==="off"?"AI OFF":mode==="p2_ai"?"P2 IS AI":mode==="p1_ai"?"P1 IS AI":"AI vs AI");
};

/* Persistent badge showing the current AI mode on every screen. */
function updateAIBadge(){
  let b=document.getElementById("aiModeBadge");
  if(!b){
    b=document.createElement("div");
    b.id="aiModeBadge";
    b.style.cssText="position:fixed;right:14px;bottom:14px;z-index:9999;padding:6px 12px;border-radius:8px;font-family:inherit;font-weight:700;font-size:12px;letter-spacing:1px;background:rgba(10,12,24,.85);border:2px solid var(--accent,#4ef0ff);color:var(--accent,#4ef0ff);cursor:pointer;user-select:none;box-shadow:0 0 12px rgba(78,240,255,.25);display:none;";
    b.title="Click to turn AI off";
    b.onclick=()=>setAIMode("off");
    document.body.appendChild(b);
  }
  const m=AI_STATE.mode;
  if(m==="off"){b.style.display="none";return;}
  b.textContent=m==="p2_ai"?"P2 = AI":m==="p1_ai"?"P1 = AI":"AI vs AI";
  b.style.display="block";
}
window.updateAIBadge=updateAIBadge;

/* P1-only mode: keyboard shortcut 'i' toggles AI mode quickly mid-game. */
addEventListener("keydown",e=>{
  if(e.key==="i"||e.key==="I"){
    if(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;
    const order=["off","p2_ai","both_ai"];
    const i=order.indexOf(AI_STATE.mode);
    setAIMode(order[(i+1)%order.length]);
  }
});

function addAIMenu(){
  const grid=document.querySelector("#menu .menu-buttons");
  if(!grid||document.getElementById("aiMenuBlock"))return;
  const block=document.createElement("div");
  block.id="aiMenuBlock";
  block.style.cssText="display:flex;gap:8px;justify-content:center;margin:8px 0 10px;flex-wrap:wrap;";
  block.innerHTML=`
    <button class="chip" onclick="setAIMode('p2_ai')" id="aiChipP2" style="cursor:pointer;">🤖 P2 = AI</button>
    <button class="chip" onclick="setAIMode('both_ai')" id="aiChipBoth" style="cursor:pointer;">🤖 AI vs AI</button>
    <button class="chip on" onclick="setAIMode('off')" id="aiChipOff" style="cursor:pointer;">👥 2-PLAYER</button>
  `;
  grid.parentNode.insertBefore(block,grid);
}
addEventListener("load",()=>setTimeout(addAIMenu,600));
setTimeout(addAIMenu,1000);
setTimeout(updateAIBadge,50);

window.PD=window.PD||{};
window.PD.AI={register:registerAI,get:getAI,state:AI_STATE};

})();