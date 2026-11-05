(function(){
"use strict";
function getSeason(){
  const d=new Date(),m=d.getMonth(),day=d.getDate();
  if(m===9&&day>=15&&day<=31)return "halloween";
  if((m===11&&day>=15)||(m===0&&day<=5))return "christmas";
  if(m===3&&day>=1&&day<=29)return "easter";
  if(m===1&&day>=10&&day<=14)return "valentines";
  return null;
}
const SEASONAL_CARDS={
  halloween:[
    {id:"pong",banner:"🎃 SPOOKY PONG",desc:"Classic pong with pumpkin energy",color:"#ff8c42"},
    {id:"snakeGame",banner:"🎃 SPOOKY SNAKE",desc:"Creepy crawly Tron-style",color:"#a020f0"}
  ],
  christmas:[
    {id:"pong",banner:"🎄 FESTIVE PONG",desc:"Jingle bells paddle battle",color:"#ff2244"},
    {id:"hockeyGame",banner:"🎄 SNOW HOCKEY",desc:"Ice, ice, baby",color:"#20aa44"}
  ],
  easter:[
    {id:"memGame",banner:"🐰 EGG HUNT",desc:"Match the Easter eggs",color:"#ffcc44"}
  ],
  valentines:[
    {id:"reactGame",banner:"💝 LOVE REACTION",desc:"Cupid's arrow awaits",color:"#ff4488"}
  ]
};
function addSeasonalCards(){
  const season=getSeason();
  if(!season)return;
  if(document.getElementById("seasonalBlock"))return;
  const grid=document.querySelector("#menu .menu-buttons");
  if(!grid)return;
  const block=document.createElement("div");
  block.id="seasonalBlock";
  block.style.cssText="display:contents;";
  const cards=SEASONAL_CARDS[season]||[];
  cards.forEach(c=>{
    const btn=document.createElement("button");
    btn.className="game-card";
    btn.style.borderColor=c.color;
    btn.innerHTML=`<strong style="color:${c.color}">${c.banner}</strong><small>${c.desc}</small>`;
    btn.onclick=()=>window.openGame(c.id);
    block.appendChild(btn);
  });
  const aiBlock=document.getElementById("aiMenuBlock");
  const insertAfter=aiBlock||grid.firstChild;
  insertAfter.parentNode.insertBefore(block,insertAfter.nextSibling);
}
addEventListener("load",()=>setTimeout(addSeasonalCards,700));
setTimeout(addSeasonalCards,1200);
})();