(function(){
"use strict";
const STORAGE="pixelduel-history-v1";
const MAX=50;
function loadHistory(){try{return JSON.parse(localStorage.getItem(STORAGE))||[];}catch(e){return[];}}
function saveHistory(arr){try{localStorage.setItem(STORAGE,JSON.stringify(arr.slice(0,MAX)));}catch(e){}}
let history=loadHistory();
const _recordWin=window.recordWin;
window.recordWin=function(game,player){
  history.unshift({game,player,ts:Date.now()});
  if(history.length>MAX)history.length=MAX;
  saveHistory(history);
  return _recordWin.apply(this,arguments);
};
function openHistory(){
  const existing=document.getElementById("historyScreen");
  if(existing){existing.classList.add("active");activeScreen="historyScreen";return;}
  const sec=document.createElement("section");
  sec.id="historyScreen";sec.className="screen";
  sec.style.cssText="background:#0a0f24;padding:20px;min-height:100vh;";
  document.body.insertBefore(sec,document.querySelector(".touch-pad"));
  activeScreen="historyScreen";
  document.querySelectorAll(".screen.active").forEach(s=>{if(s!==sec)s.classList.remove("active");});
  sec.classList.add("active");
  sec.innerHTML=`<button class="back" onclick="showMenu()">MENU</button><h2 style="color:#64eaff;font-family:'Courier New',monospace;text-align:center;">📜 MATCH HISTORY</h2><div id="histList" style="max-width:700px;margin:0 auto;"></div><div style="text-align:center;margin-top:20px;"><button onclick="clearHistory()" style="background:#ff5878;color:#fff;border:none;padding:10px 20px;font-family:monospace;cursor:pointer;">CLEAR HISTORY</button></div>`;
  renderHistory();
}
window.openHistory=openHistory;
function renderHistory(){
  const list=document.getElementById("histList");
  if(!list)return;
  if(!history.length){list.innerHTML='<p style="color:#9fc0ff;text-align:center;font-family:monospace;">No matches yet.</p>';return;}
  list.innerHTML=history.map(h=>{
    const d=new Date(h.ts);
    const time=d.toLocaleString();
    const winColor=h.player==="p1"?"#64eaff":"#ff72c8";
    return `<div style="background:#141a3a;border:2px solid #2a3260;padding:10px 14px;margin-bottom:8px;font-family:monospace;color:#9fc0ff;"><span style="color:${winColor};font-weight:bold;">P${h.player==="p1"?"1":"2"}</span> won <span style="color:#fff;">${h.game}</span><span style="float:right;color:#4c5d99;font-size:11px;">${time}</span></div>`;
  }).join("");
}
window.clearHistory=function(){history=[];saveHistory(history);renderHistory();};
window.exportProfile=function(){
  const data={profile:window.PDX_PROFILE,history:history,exported:new Date().toISOString()};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="pixelduel-profile-"+Date.now()+".json";a.click();
  URL.revokeObjectURL(url);
  if(window.showToast)window.showToast("Profile exported!");
};
window.importProfile=function(){
  const input=document.createElement("input");
  input.type="file";input.accept=".json";
  input.onchange=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(data.profile){
          Object.assign(window.PDX_PROFILE,data.profile);
          if(window.PDX_SAVE)window.PDX_SAVE();
          if(data.history){history=data.history;saveHistory(history);}
          if(window.showToast)window.showToast("Profile imported!");
          setTimeout(()=>location.reload(),800);
        }
      }catch(err){if(window.showToast)window.showToast("Invalid file");}
    };
    reader.readAsText(file);
  };
  input.click();
};
function addMetaButtons(){
  const panel=document.querySelector(".settings-box");
  if(!panel||document.getElementById("metaBtns"))return;
  const div=document.createElement("div");
  div.id="metaBtns";
  div.style.cssText="display:flex;gap:6px;flex-wrap:wrap;margin-top:14px;justify-content:center;";
  div.innerHTML=`<button onclick="openHistory()" style="background:#1a2050;border:2px solid #64eaff;color:#64eaff;padding:8px 14px;font-family:monospace;cursor:pointer;font-size:12px;">HISTORY</button><button onclick="exportProfile()" style="background:#1a2050;border:2px solid #63f59a;color:#63f59a;padding:8px 14px;font-family:monospace;cursor:pointer;font-size:12px;">EXPORT</button><button onclick="importProfile()" style="background:#1a2050;border:2px solid #ffe66d;color:#ffe66d;padding:8px 14px;font-family:monospace;cursor:pointer;font-size:12px;">IMPORT</button>`;
  panel.appendChild(div);
}
setTimeout(addMetaButtons,1000);
addEventListener("load",()=>setTimeout(addMetaButtons,500));
})();