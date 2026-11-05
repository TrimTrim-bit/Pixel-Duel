(function(){
"use strict";
const isTouch="ontouchstart" in window||navigator.maxTouchPoints>0;
if(!isTouch)return;
const BTNS={
  p1:{up:"w",down:"s",left:"a",right:"d",act:" "},
  p2:{up:"arrowup",down:"arrowdown",left:"arrowleft",right:"arrowright",act:"enter"}
};
function makePad(side){
  const b=BTNS[side];
  const div=document.createElement("div");
  div.className="touch-ctl touch-ctl-"+side;
  div.innerHTML=`<div class="t-left"><button class="t-btn" data-key="${b.up}">▲</button><div class="t-row"><button class="t-btn" data-key="${b.left}">◀</button><button class="t-btn" data-key="${b.down}">▼</button><button class="t-btn" data-key="${b.right}">▶</button></div></div><button class="t-btn t-act" data-key="${b.act}">GO</button>`;
  return div;
}
function addStyles(){
  if(document.getElementById("touchStyles"))return;
  const s=document.createElement("style");
  s.id="touchStyles";
  s.textContent=`.touch-ctl{position:fixed;bottom:12px;display:none;z-index:200;padding:8px;background:rgba(8,11,24,.65);border-radius:12px;gap:6px;align-items:flex-end;flex-direction:column;touch-action:none;}.touch-ctl.active{display:flex;}.touch-ctl-p1{left:12px;border:2px solid #64eaff;}.touch-ctl-p2{right:12px;border:2px solid #ff72c8;}.t-left{display:flex;flex-direction:column;align-items:center;gap:4px;}.t-row{display:flex;gap:4px;}.t-btn{width:52px;height:52px;background:#1a2050;color:#fff;border:2px solid #3a4a8a;border-radius:8px;font-family:'Courier New',monospace;font-weight:bold;font-size:18px;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;touch-action:none;}.t-btn:active{background:#4a5a9a;transform:scale(.93);}.t-act{width:110px;height:60px;background:#1a2050;border-color:#ffe66d;color:#ffe66d;font-size:14px;}.t-act:active{background:#3a2a10;}@media (pointer:fine){.touch-ctl{display:none !important;}}`;
  document.head.appendChild(s);
}
addStyles();
const p1=makePad("p1"),p2=makePad("p2");
document.body.appendChild(p1);document.body.appendChild(p2);
document.querySelectorAll(".t-btn").forEach(btn=>{
  const key=btn.dataset.key;
  const press=e=>{e.preventDefault();keys[key]=true;};
  const release=e=>{e.preventDefault();keys[key]=false;};
  btn.addEventListener("touchstart",press,{passive:false});
  btn.addEventListener("touchend",release,{passive:false});
  btn.addEventListener("touchcancel",release,{passive:false});
  btn.addEventListener("mousedown",press);
  btn.addEventListener("mouseup",release);
  btn.addEventListener("mouseleave",release);
});
function updatePads(){
  const inGame=window.activeScreen&&!["menu","shopScreen","avatarScreen","cinemaScreen","tournamentScreen","historyScreen","mpConfigScreen"].includes(window.activeScreen);
  p1.classList.toggle("active",inGame);
  p2.classList.toggle("active",inGame);
}
setInterval(updatePads,400);
})();