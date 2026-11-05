(function(){
"use strict";
function daysInMonth(){const now=new Date();return new Date(now.getFullYear(),now.getMonth()+1,0).getDate();}
function currentMonth(){const now=new Date();return now.toLocaleString("default",{month:"long"})+" "+now.getFullYear();}
function getPlayedDays(){
  const prefix=new Date().toISOString().slice(0,7);
  const set=new Set();
  const profile=window.PDX_PROFILE||{monthlyPlayed:{}};
  Object.keys(profile.monthlyPlayed||{}).forEach(k=>{if(k.startsWith(prefix))set.add(parseInt(k.slice(8,10),10));});
  return set;
}
function renderCalendar(container){
  if(!container)return;
  const now=new Date();
  const firstDay=new Date(now.getFullYear(),now.getMonth(),1).getDay();
  const total=daysInMonth();
  const played=getPlayedDays();
  const today=now.getDate();
  let html=`<div class="cal-wrap"><div class="cal-header">📅 ${currentMonth()}</div><div class="cal-grid">
    <div class="cal-day-name">S</div><div class="cal-day-name">M</div><div class="cal-day-name">T</div><div class="cal-day-name">W</div><div class="cal-day-name">T</div><div class="cal-day-name">F</div><div class="cal-day-name">S</div>`;
  for(let i=0;i<firstDay;i++)html+=`<div class="cal-cell empty"></div>`;
  for(let d=1;d<=total;d++){
    const cls=["cal-cell"];
    if(played.has(d))cls.push("played");
    if(d===today)cls.push("today");
    html+=`<div class="${cls.join(" ")}">${d}</div>`;
  }
  html+=`</div><div class="cal-stats">🔥 ${played.size} / ${total} day${played.size===1?"":"s"} this month</div></div>`;
  container.innerHTML=html;
}
window.PDX_RENDER_CALENDAR=renderCalendar;
function addStyles(){
  if(document.getElementById("calStyles"))return;
  const s=document.createElement("style");
  s.id="calStyles";
  s.textContent=`.cal-wrap{background:#141a3a;border:2px solid #64eaff;padding:14px;font-family:'Courier New',monospace;margin:14px 0;max-width:400px;}.cal-header{color:#64eaff;text-align:center;font-size:18px;margin-bottom:10px;letter-spacing:1px;}.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}.cal-day-name{text-align:center;color:#9fc0ff;font-size:11px;padding:4px 0;}.cal-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:#1a2050;color:#6a72a8;font-size:12px;border:1px solid #2a3260;}.cal-cell.empty{background:transparent;border:none;}.cal-cell.played{background:#64eaff22;color:#64eaff;border-color:#64eaff;}.cal-cell.today{outline:2px solid #ffe66d;outline-offset:-2px;}.cal-stats{text-align:center;color:#9fc0ff;font-size:13px;margin-top:10px;}`;
  document.head.appendChild(s);
}
addEventListener("load",()=>{addStyles();});
setTimeout(addStyles,500);
})();