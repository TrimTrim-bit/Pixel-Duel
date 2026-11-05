/* =====================================================
   PIXEL DUEL — UI BOOST LAYER
   Card icons · Fullscreen buttons · True aspect-preserving fullscreen
   ===================================================== */
(function(){
"use strict";

/* =====================================================
   GAME CARD ICONS (menu)
   ===================================================== */
const CARD_ICONS={
  pong:"🏓",ttt:"⭕",connectGame:"🔴",duelGame:"🤠",tugGame:"🪢",
  breadGame:"🐦",hockeyGame:"🏒",bombGame:"💣",dodgeGame:"🎯",
  sumoGame:"🥋",snakeGame:"🐍",basketGame:"🏀",volleyGame:"🏐",
  memGame:"🧠",reactGame:"⚡",raceGame:"🏎️",platformGame:"🧗",
  tankGame:"🚜",spaceGame:"🚀",potatoGame:"🥔"
};
const CARD_COLORS={
  pong:"#64eaff",ttt:"#63f59a",connectGame:"#ff5878",duelGame:"#ffe66d",
  tugGame:"#ff8c42",breadGame:"#ff72c8",hockeyGame:"#64eaff",bombGame:"#ff5878",
  dodgeGame:"#63f59a",sumoGame:"#ffe66d",snakeGame:"#63f59a",basketGame:"#ff8c42",
  volleyGame:"#ff72c8",memGame:"#ff72c8",reactGame:"#ffe66d",raceGame:"#ff5878",
  platformGame:"#64eaff",tankGame:"#63f59a",spaceGame:"#ff72c8",potatoGame:"#ff8c42"
};

function decorateCards(){
  document.querySelectorAll(".menu-buttons .game-card").forEach(card=>{
    if(card.querySelector(".card-icon"))return;
    const onclick=card.getAttribute("onclick")||"";
    const m=onclick.match(/openGame\(['"]([^'"]+)['"]\)/);
    const id=m?m[1]:null;
    const icon=id?CARD_ICONS[id]||"🎮":"🎲";
    const el=document.createElement("span");
    el.className="card-icon";
    el.textContent=icon;
    if(id&&CARD_COLORS[id])el.style.color=CARD_COLORS[id];
    card.appendChild(el);
  });
}

/* =====================================================
   FULLSCREEN FOR GAME SCREENS
   Fullscreens the .screen section itself. The canvas
   scales with aspect ratio preserved via CSS (contain fit).
   ===================================================== */

function isFsSupported(){
  return !!(document.documentElement.requestFullscreen||
            document.documentElement.webkitRequestFullscreen);
}

function fsElement(){
  return document.fullscreenElement||document.webkitFullscreenElement||null;
}

function toggleFullscreen(screen){
  if(!isFsSupported())return;
  if(fsElement()){
    const cur=currentFsScreen();
    (document.exitFullscreen||document.webkitExitFullscreen).call(document);
    if(cur)setTimeout(()=>resetCanvases(cur),100);
  }else{
    const el=screen||document.querySelector(".screen.active");
    if(!el)return;
    const req=el.requestFullscreen?el.requestFullscreen.bind(el):el.webkitRequestFullscreen&&el.webkitRequestFullscreen.bind(el);
    if(req)Promise.resolve(req()).then(()=>setTimeout(()=>{const el2=fsElement();if(el2)fitFullscreen(el2);},100)).catch(()=>{});
  }
}

/* fullscreen toast hint */
document.addEventListener("fullscreenchange",()=>{
  const el=document.querySelector(".screen:fullscreen");
  if(el&&window.toast)window.toast("PRESS ESC TO EXIT FULLSCREEN");
});

document.addEventListener("webkitfullscreenchange",()=>{
  const el=document.querySelector(".screen:-webkit-full-screen");
  if(el&&window.toast)window.toast("PRESS ESC TO EXIT FULLSCREEN");
});

/* ---------- aspect-preserving canvas scaling ----------
   CSS 'width:auto' never grows past the intrinsic size, so we compute
   the largest size that fits the viewport and set it explicitly. */
function fitCanvases(screen,maxW,maxH){
  if(!screen)return;
  maxW=maxW||window.innerWidth*0.995;
  maxH=maxH||window.innerHeight*0.995;
  screen.querySelectorAll("canvas").forEach(c=>{
    if(!c.width||!c.height)return;
    const ratio=c.width/c.height;
    let w=maxH*ratio;
    if(w>maxW)w=maxW;
    c.style.width=Math.round(w)+"px";
    c.style.height="auto";
    c.style.maxWidth="none";
    c.style.maxHeight="none";
  });
}
function resetCanvases(screen){
  if(!screen)return;
  screen.querySelectorAll("canvas").forEach(c=>{
    c.style.width="";
    c.style.height="";
    c.style.maxWidth="";
    c.style.maxHeight="";
  });
}
function currentFsScreen(){
  const el=fsElement();
  return el&&el.classList&&el.classList.contains("screen")?el:null;
}
function onFsOrResize(){
  const s=currentFsScreen();
  if(s){fitFullscreen(s);return;}
  // not fullscreen: fit to the normal page bounds (max-height:78vh look)
  const active=document.querySelector(".screen.active");
  if(active){
    fitCanvases(active,window.innerWidth*0.92,window.innerHeight*0.75);
    unscaleBoards(active);
  }
}

/* ---------- fullscreen fitting: canvases AND DOM boards ----------
   Canvas games: largest aspect-true size that fits (never stretched).
   DOM-board games (ttt / connect / memory): transform-scaled with the
   same contain rule so they fill the screen instead of staying tiny. */
function fitFullscreen(screen){
  // reserve a slim band for the score/status bar overlay
  const maxW=window.innerWidth*0.985;
  const maxH=window.innerHeight*0.985;
  fitCanvases(screen,maxW,maxH);
  scaleBoards(screen,maxW,maxH);
}

function scaleBoards(screen,maxW,maxH){
  screen.querySelectorAll(".board,#connect,.mem-grid,.slot-grid").forEach(el=>{
    if(el.dataset.natW===undefined){
      el.style.transform="none";
      el.dataset.natW=el.offsetWidth;
      el.dataset.natH=el.offsetHeight;
    }
    const nw=parseFloat(el.dataset.natW)||1;
    const nh=parseFloat(el.dataset.natH)||1;
    const sc=Math.min(maxW/nw,maxH/nh,2.2);
    el.style.transformOrigin="center center";
    el.style.transform="scale("+sc.toFixed(3)+")";
    el.style.margin=(nh*sc-nh)/2+"px auto";
  });
  screen.querySelectorAll(".duel-arena").forEach(el=>{
    if(el.dataset.natW===undefined){
      el.style.transform="none";
      el.dataset.natW=el.offsetWidth;
      el.dataset.natH=el.offsetHeight;
    }
    const nw=parseFloat(el.dataset.natW)||1;
    const nh=parseFloat(el.dataset.natH)||1;
    const sc=Math.min(maxW/nw,maxH/nh,1.6);
    el.style.transformOrigin="center center";
    el.style.transform="scale("+sc.toFixed(3)+")";
  });
}
function unscaleBoards(screen){
  screen.querySelectorAll(".board,#connect,.duel-arena,.mem-grid,.slot-grid").forEach(el=>{
    el.style.transform="";
    el.style.transformOrigin="";
    el.style.margin="";
    delete el.dataset.natW;
    delete el.dataset.natH;
  });
}

/* double-click a game canvas to enter/leave fullscreen */
document.addEventListener("dblclick",e=>{
  const c=e.target.closest(".screen canvas");
  if(!c)return;
  if(e.target.closest("#menuAnimBg,#weatherCanvas,#fxCanvas"))return;
  const screen=c.closest(".screen");
  if(screen&&screen.id!=="menu")toggleFullscreen(screen);
});
window.addEventListener("resize",onFsOrResize);
document.addEventListener("fullscreenchange",onFsOrResize);
document.addEventListener("webkitfullscreenchange",onFsOrResize);

/* ---------- inject the ⛶ button into every game screen ---------- */
function injectFsButtons(){
  document.querySelectorAll(".screen").forEach(screen=>{
    if(screen.id==="menu")return;
    if(screen.querySelector(".fs-btn"))return;

    // inline fullscreen button next to restart button (only visible outside fullscreen)
    const btn=document.createElement("button");
    btn.className="fs-btn";
    btn.innerHTML="⛶ FULLSCREEN";
    btn.addEventListener("click",()=>toggleFullscreen(screen));

    // group it with the first non-back button (usually RESTART)
    const restart=Array.from(screen.children).find(
      c=>c.tagName==="BUTTON"&&!c.classList.contains("back")&&!c.classList.contains("icon-btn")
    );
    if(restart){
      const row=document.createElement("div");
      row.className="fs-row";
      screen.insertBefore(row,restart);
      row.appendChild(restart);
      row.appendChild(btn);
    }else{
      screen.appendChild(btn);
    }
  });
}

/* hide the inline fullscreen button while already fullscreen
   (Esc exits — no on-screen clutter) */
function syncFsPills(){
  const fs=!!fsElement();
  document.querySelectorAll(".fs-btn").forEach(b=>{
    b.style.display=fs?"none":"inline-flex";
  });
}
document.addEventListener("fullscreenchange",syncFsPills);
document.addEventListener("webkitfullscreenchange",syncFsPills);

/* =====================================================
   BOOT
   ===================================================== */
function boot(){
  decorateCards();
  injectFsButtons();
  onFsOrResize();
  // refit canvases whenever the active screen changes
  new MutationObserver(onFsOrResize).observe(document.body,{attributes:true,subtree:true,attributeFilter:["class"]});
}
if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",boot);
}else{
  boot();
}
})();
