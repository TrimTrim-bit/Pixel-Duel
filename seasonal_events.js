(function(){
"use strict";
function getSeason(){
  const d=new Date(),m=d.getMonth(),day=d.getDate();
  if(m===9&&day>=15&&day<=31)return "halloween";
  if((m===11&&day>=15)||(m===0&&day<=5))return "christmas";
  if(m===3&&day>=1&&day<=29)return "easter";
  if(m===1&&day>=10&&day<=14)return "valentines";
  return "none";
}
const BONUS={
  halloween:{name:"Halloween",coinBonus:1,msg:"🎃 HALLOWEEN EVENT — +1 coin per win!"},
  christmas:{name:"Christmas",coinBonus:2,msg:"🎄 CHRISTMAS EVENT — +2 coins per win!"},
  easter:{name:"Easter",coinBonus:1,msg:"🐰 EASTER EVENT — +1 coin per win!"},
  valentines:{name:"Valentine's",coinBonus:1,msg:"💝 VALENTINE'S EVENT — +1 coin per win!"},
  none:{name:"Standard",coinBonus:0,msg:""}
};
function showSeasonBanner(){
  const season=getSeason();
  if(season==="none")return;
  if(document.getElementById("seasonBanner"))return;
  const menu=document.getElementById("menu");
  if(!menu)return;
  const b=document.createElement("div");
  b.id="seasonBanner";
  b.style.cssText="text-align:center;font-family:'Courier New',monospace;font-size:14px;padding:8px 16px;margin:8px auto;max-width:600px;border:2px solid "+(season==="halloween"?"#ff8c42":season==="christmas"?"#ff2244":season==="easter"?"#ffcc44":"#ff4488")+";color:#ffe66d;background:rgba(8,11,24,.7);";
  b.textContent=BONUS[season].msg;
  const sb=document.getElementById("scoreboard");
  if(sb&&sb.parentNode===menu)sb.after(b);
  else menu.insertBefore(b,menu.firstChild);
}
const _recordWin=window.recordWin;
window.recordWin=function(game,player){
  const res=_recordWin.apply(this,arguments);
  const season=getSeason();
  const bonus=BONUS[season].coinBonus;
  if(bonus>0&&window.PDX_PROFILE&&window.PDX_ADD_COINS)window.PDX_ADD_COINS(bonus);
  return res;
};
addEventListener("load",()=>setTimeout(showSeasonBanner,600));
setTimeout(showSeasonBanner,1000);
setInterval(showSeasonBanner,60000);
})();