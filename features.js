/* =====================================================
   PIXEL DUEL — FEATURES LAYER
   Coins · Shop · Avatar · Clock · Themes · Daily Rewards
   Monthly Calendar · Cinema · Tournament · School Mode
   Favicon · Moods
===================================================== */
(function(){
"use strict";

/* =====================================================
   PROFILE (localStorage)
===================================================== */
const STORAGE="pixelduel-profile-v2";
const DEFAULT_PROFILE={
  coins:0,
  gamesPlayed:0,
  theme:"auto",
  ownedThemes:["auto","neon"],
  ownedAvatars:[],
  equippedHat:null,
  avatar:{
    skin:"#f3bd83",hair:"#3d2b1f",style:"short",
    shirt:"#64eaff",pants:"#2a2f63",shoe:"#0c0f24",
    face:"happy",eye:"#11152b"
  },
  lastDaily:0,
  dailyStreak:0,
  monthlyPlayed:{},
  excludedGames:[],
  cinemaWatched:[],
  schoolUpgrades:[],
  tournamentPresets:{}
};
function loadProfile(){
  try{
    const raw=localStorage.getItem(STORAGE)||localStorage.getItem("pixelduel-profile-v1");
    if(raw){
      const p=JSON.parse(raw);
      return Object.assign({},DEFAULT_PROFILE,p,{
        avatar:Object.assign({},DEFAULT_PROFILE.avatar,p.avatar||{}),
        monthlyPlayed:p.monthlyPlayed||{},
        tournamentPresets:p.tournamentPresets||{},
        schoolUpgrades:p.schoolUpgrades||[]
      });
    }
  }catch(e){}
  return JSON.parse(JSON.stringify(DEFAULT_PROFILE));
}
let profile=loadProfile();
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(profile));}catch(e){}}
window.PDX_PROFILE=profile;
window.PDX_SAVE=save;

/* =====================================================
   FAVICONS
===================================================== */
function makeIcon(draw){
  const c=document.createElement("canvas");
  c.width=32;c.height=32;
  draw(c.getContext("2d"));
  return c.toDataURL("image/png");
}
const defaultFav=makeIcon(x=>{
  x.fillStyle="#080b18";x.fillRect(0,0,32,32);
  x.fillStyle="#64eaff";x.fillRect(3,20,11,9);
  x.fillStyle="#ff72c8";x.fillRect(18,20,11,9);
  x.fillStyle="#ffe66d";x.fillRect(11,6,10,10);
});
const schoolFav=makeIcon(x=>{
  x.fillStyle="#2a5a8a";x.fillRect(0,0,32,32);
  x.fillStyle="#fff";x.fillRect(6,10,20,14);
  x.fillStyle="#8a5a2a";x.fillRect(6,10,20,2);
});
function setFavicon(href){
  let link=document.querySelector("link[rel='icon']");
  if(!link){link=document.createElement("link");link.rel="icon";document.head.appendChild(link);}
  link.href=href;
}
setFavicon(defaultFav);

/* =====================================================
   THEMES + MOODS + SEASONS
===================================================== */
const THEMES={
  neon:{bg1:"#05060f",bg2:"#0d1430",accent:"#64eaff",accent2:"#ff72c8",text:"#e0e8ff"},
  dawn:{bg1:"#1a1530",bg2:"#3a2a5a",accent:"#ffb07a",accent2:"#ff72c8",text:"#f0e8ff"},
  day:{bg1:"#0e1a3a",bg2:"#1a3a6a",accent:"#7ad8ff",accent2:"#ffb0e0",text:"#eef4ff"},
  dusk:{bg1:"#2a1530",bg2:"#4a2040",accent:"#ff7a9a",accent2:"#b07aff",text:"#f5e6f5"},
  night:{bg1:"#02030a",bg2:"#0a0a20",accent:"#64eaff",accent2:"#ff72c8",text:"#d0d8ff"},
  ember:{bg1:"#140a06",bg2:"#2a1208",accent:"#ff8c42",accent2:"#ffd24a",text:"#ffe8d0"},
  forest:{bg1:"#08140c",bg2:"#122a18",accent:"#63f59a",accent2:"#a0ffa0",text:"#d8f0e0"},
  candy:{bg1:"#140a12",bg2:"#241020",accent:"#ff8ac8",accent2:"#ffe66d",text:"#ffe4f4"},
  ice:{bg1:"#0a1418",bg2:"#122830",accent:"#bfe8ff",accent2:"#8fd0f0",text:"#e8f8ff"},
  sunset:{bg1:"#160c20",bg2:"#2a1028",accent:"#ff6a8a",accent2:"#ffd24a",text:"#ffe0ec"},
  void:{bg1:"#000000",bg2:"#0a0a12",accent:"#8a2aff",accent2:"#c08aff",text:"#d8c8ff"},
  toxic:{bg1:"#0a1006",bg2:"#122008",accent:"#7dff3a",accent2:"#d0ff6a",text:"#e0ffcc"},
  sakura:{bg1:"#160c12",bg2:"#281420",accent:"#ffb7c5",accent2:"#ff8ac8",text:"#ffe8f0"},
  ocean:{bg1:"#04121c",bg2:"#0a2230",accent:"#4ad8e8",accent2:"#ff7a6a",text:"#d0f0ff"},
  magma:{bg1:"#100604",bg2:"#200a06",accent:"#ff5a2a",accent2:"#ffc04a",text:"#ffd8c0"},
  aurora2:{bg1:"#04101a",bg2:"#0a1e28",accent:"#5affc8",accent2:"#8a7aff",text:"#d8fff0"},
  monochrome:{bg1:"#0a0a0a",bg2:"#161616",accent:"#e0e0e0",accent2:"#8a8a8a",text:"#f0f0f0"},
  sepia:{bg1:"#14100a",bg2:"#241e12",accent:"#d4b878",accent2:"#a08a5a",text:"#f0e4c8"},
  /* ---- new unique palettes (2026 batch) ---- */
  limepop:{bg1:"#0a1a0a",bg2:"#12300f",accent:"#a8ff3a",accent2:"#ffd800",text:"#eeffd0"},
  bubblegum:{bg1:"#1a0a14",bg2:"#3a1030",accent:"#ff5ad8",accent2:"#3affd8",text:"#ffe0f8"},
  copper:{bg1:"#140e08",bg2:"#2a1a0c",accent:"#e88a3a",accent2:"#ffb066",text:"#ffeedd"},
  cyberlime:{bg1:"#04120a",bg2:"#082014",accent:"#00ff9a",accent2:"#ff0080",text:"#ccffec"},
  denim:{bg1:"#0a1220",bg2:"#142a4a",accent:"#5a9aff",accent2:"#ffb84a",text:"#ddeaff"},
  desert:{bg1:"#1a1408",bg2:"#33240f",accent:"#ffc44d",accent2:"#ff7a3a",text:"#fff4dc"},
  aurora3:{bg1:"#031318",bg2:"#062030",accent:"#3affd0",accent2:"#b07aff",text:"#d0fff5"},
  bloodmoon:{bg1:"#0f0406",bg2:"#1a080c",accent:"#ff3a4a",accent2:"#ffa0aa",text:"#ffdcdc"},
  mintchip:{bg1:"#061410",bg2:"#0e241a",accent:"#5affb0",accent2:"#8a5a3a",text:"#dafff0"},
  ultraviolet:{bg1:"#0c0418",bg2:"#1a0830",accent:"#a83aff",accent2:"#ff5ad8",text:"#e8d0ff"},
  storm:{bg1:"#0a0e14",bg2:"#161c26",accent:"#8ab0d8",accent2:"#ffd84a",text:"#dfe8f0"},
  creamsicle:{bg1:"#180e08",bg2:"#2a180c",accent:"#ffa03a",accent2:"#ff5a8a",text:"#ffeadd"},
  arctic:{bg1:"#08141c",bg2:"#0e2030",accent:"#7ad4ff",accent2:"#e0f8ff",text:"#eafaff"},
  jade:{bg1:"#041410",bg2:"#0a241c",accent:"#3ad88a",accent2:"#c8f5a0",text:"#d0ffe8"},
  rose:{bg1:"#180a10",bg2:"#2a1020",accent:"#ff4a7a",accent2:"#ffb0c8",text:"#ffe0e8"},
  amberglow:{bg1:"#120c04",bg2:"#221a08",accent:"#ffb03a",accent2:"#ffe08a",text:"#fff0d0"},
  deepspace:{bg1:"#020208",bg2:"#060a18",accent:"#5a7aff",accent2:"#b8d0ff",text:"#c8d4ff"},
  carnival:{bg1:"#12061a",bg2:"#200a2a",accent:"#ff3a8a",accent2:"#3affd8",text:"#ffd8ec"},
  slate:{bg1:"#0c1014",bg2:"#1a2228",accent:"#c8d8e0",accent2:"#6a8898",text:"#e8f0f4"},
  sunsetgold:{bg1:"#140a0e",bg2:"#24121a",accent:"#ffc04a",accent2:"#ff5a6a",text:"#ffe8d8"},
  quantum:{bg1:"#050a14",bg2:"#0a1428",accent:"#3aff9a",accent2:"#9a5aff",text:"#c8ffe8"},
  cola:{bg1:"#120606",bg2:"#1e0a0a",accent:"#c83a2a",accent2:"#f0d8a8",text:"#ffe8d0"},
  vintagewin:{bg1:"#100a08",bg2:"#1c1208",accent:"#d8a04a",accent2:"#8a5a3a",text:"#f5e0c8"}
};
const SEASONS={
  default:{name:"Standard"},
  halloween:{name:"Halloween",accent:"#ff8c42",secondary:"#a020f0"},
  christmas:{name:"Christmas",accent:"#ff2244",secondary:"#20aa44"},
  easter:{name:"Easter",accent:"#ffcc44",secondary:"#88cc66"},
  valentines:{name:"Valentine's",accent:"#ff4488",secondary:"#ff88aa"}
};
function getSeason(){
  const d=new Date(),m=d.getMonth(),day=d.getDate();
  if(m===9&&day>=15&&day<=31)return "halloween";
  if((m===11&&day>=15)||(m===0&&day<=5))return "christmas";
  if(m===3&&day>=1&&day<=29)return "easter";
  if(m===1&&day>=10&&day<=14)return "valentines";
  return "default";
}
function getMood(){
  const h=new Date().getHours();
  if(h>=5&&h<8)return "dawn";
  if(h>=8&&h<17)return "day";
  if(h>=17&&h<20)return "dusk";
  return "night";
}
function applyTheme(){
  const name=profile.theme==="auto"?getMood():profile.theme;
  const t=THEMES[name]||THEMES.neon;
  const root=document.documentElement.style;
  root.setProperty("--bg1",t.bg1);
  root.setProperty("--bg2",t.bg2);
  root.setProperty("--accent",t.accent);
  root.setProperty("--accent2",t.accent2);
  root.setProperty("--text",t.text);
  const s=SEASONS[getSeason()];
  if(s.accent){
    root.setProperty("--season-accent",s.accent);
    root.setProperty("--season-secondary",s.secondary);
  }
}
applyTheme();
window.PDX_APPLY_THEME=applyTheme;

/* =====================================================
   CLOCK — REMOVED (user request)
   The digital clock and analog clock have been removed.
   The sidebar/menu system handles all controls now.
===================================================== */

/* =====================================================
   COINS + PLAY COUNTER
===================================================== */
const coinHud=document.createElement("div");
coinHud.id="pixelCoins";
document.body.appendChild(coinHud);
function updateCoins(){coinHud.textContent=`🪙 ${profile.coins} COINS`;}
updateCoins();
function addCoins(n){
  if(n>0&&(profile.perks||[]).includes("perk_lucky"))n=Math.ceil(n*1.25);
  profile.coins=Math.max(0,profile.coins+n);
  save();updateCoins();
  if(n>0)showToast(`+${n} coin${n>1?"s":""}! 🪙`);
}
window.PDX_ADD_COINS=addCoins;

const _recordWin=window.recordWin;
window.recordWin=function(game,player){
  const before=Math.floor(profile.gamesPlayed/10);
  profile.gamesPlayed++;
  profile.monthlyPlayed[new Date().toISOString().slice(0,10)]=true;
  if(Math.floor(profile.gamesPlayed/10)>before){
    addCoins(1);
  }
  save();
  return _recordWin.apply(this,arguments);
};

/* =====================================================
   TOAST
===================================================== */
function showToast(text){
  const old=document.getElementById("pixelToast");
  if(old)old.remove();
  const t=document.createElement("div");
  t.id="pixelToast";t.textContent=text;
  document.body.appendChild(t);
  setTimeout(()=>{if(t.parentNode)t.remove();},3200);
}
window.showToast=showToast;

/* =====================================================
   DAILY REWARD + STREAK
===================================================== */
function checkDaily(){
  const today=new Date().toDateString();
  const lastDate=profile.lastDaily?new Date(profile.lastDaily).toDateString():"";
  if(today===lastDate)return;
  const yesterday=new Date(Date.now()-86400000).toDateString();
  if(profile.lastDaily&&new Date(profile.lastDaily).toDateString()===yesterday){
    profile.dailyStreak++;
  }else profile.dailyStreak=1;
  profile.lastDaily=Date.now();
  const reward=profile.dailyStreak>=7?20:Math.min(10,5+profile.dailyStreak);
  addCoins(reward);
  if(profile.dailyStreak===7){
    if(!profile.ownedAvatars.includes("hat_crown")){
      profile.ownedAvatars.push("hat_crown");
      showToast("🔥 7-day streak! CROWN unlocked!");
    }
  }
  save();
  showToast(`Daily reward +${reward} coins! 🔥 ${profile.dailyStreak}-day streak`);
}
setTimeout(checkDaily,800);

/* =====================================================
   MONTHLY CALENDAR
===================================================== */
function monthlyDaysPlayed(){
  const now=new Date();
  const prefix=now.toISOString().slice(0,7);
  return Object.keys(profile.monthlyPlayed).filter(k=>k.startsWith(prefix)).length;
}
function daysInMonth(){
  const now=new Date();
  return new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
}

/* =====================================================
   SHOP
===================================================== */
const SHOP_ITEMS={
  themes:[
    {id:"neon",name:"NEON",desc:"Classic cyberpunk colors",price:0},
    {id:"auto",name:"AUTO",desc:"Follows time of day",price:0},
    {id:"dawn",name:"DAWN",desc:"Warm sunrise tones",price:5},
    {id:"day",name:"DAY",desc:"Bright blue skies",price:5},
    {id:"dusk",name:"DUSK",desc:"Pink and purple sunset",price:5},
    {id:"night",name:"NIGHT",desc:"Deep midnight palette",price:5},
    {id:"ember",name:"EMBER",desc:"Campfire orange and ash",price:6},
    {id:"forest",name:"FOREST",desc:"Deep green woodland",price:6},
    {id:"candy",name:"CANDY",desc:"Bubblegum pink and gold",price:7},
    {id:"ice",name:"ICE",desc:"Frosty pale blue tones",price:7},
    {id:"sunset",name:"SUNSET",desc:"Coral, peach, magenta",price:8},
    {id:"void",name:"VOID",desc:"Pure black with violet glow",price:9},
    {id:"toxic",name:"TOXIC",desc:"Radioactive green on black",price:9},
    {id:"sakura",name:"SAKURA",desc:"Cherry blossom softness",price:8},
    {id:"ocean",name:"OCEAN",desc:"Deep sea blue and coral",price:8},
    {id:"magma",name:"MAGMA",desc:"Molten rock and heat",price:9},
    {id:"aurora2",name:"AURORA",desc:"Northern lights shimmer",price:10},
    {id:"monochrome",name:"MONOCHROME",desc:"Pure grayscale retro",price:7},
    {id:"sepia",name:"SEPIA",desc:"Warm vintage paper tones",price:7},
    {id:"limepop",name:"LIME POP",desc:"Acid lime and yellow",price:8},
    {id:"bubblegum",name:"BUBBLEGUM 2",desc:"Hot pink and aqua",price:9},
    {id:"copper",name:"COPPER",desc:"Burnt copper on dark bronze",price:8},
    {id:"cyberlime",name:"CYBER LIME",desc:"Neon mint + hot magenta",price:11},
    {id:"denim",name:"DENIM",desc:"Jean blue and amber",price:7},
    {id:"desert",name:"DESERT",desc:"Sand gold and terracotta",price:8},
    {id:"aurora3",name:"AURORA PRIME",desc:"Turquoise-violet sky",price:10},
    {id:"bloodmoon",name:"BLOOD MOON",desc:"Crimson on black-red",price:10},
    {id:"mintchip",name:"MINT CHIP",desc:"Mint green and chocolate",price:8},
    {id:"ultraviolet",name:"ULTRAVIOLET",desc:"Deep violet and orchid",price:10},
    {id:"storm",name:"STORM",desc:"Cold grey-blue and lightning",price:7},
    {id:"creamsicle",name:"CREAMSICLE",desc:"Orange and strawberry",price:8},
    {id:"arctic",name:"ARCTIC",desc:"Pale blue and white frost",price:8},
    {id:"jade",name:"JADE",desc:"Polished jade and cream",price:9},
    {id:"rose",name:"ROSE",desc:"True rose red on plum",price:8},
    {id:"amberglow",name:"AMBER GLOW",desc:"Amber lamp on dark wood",price:8},
    {id:"deepspace",name:"DEEP SPACE",desc:"Near-black and starlight blue",price:9},
    {id:"carnival",desc:"Fuchsia and teal party",name:"CARNIVAL",price:10},
    {id:"slate",name:"SLATE",desc:"Minimal slate and steel",price:7},
    {id:"sunsetgold",name:"SUNSET GOLD",desc:"Gold hour and rose sky",price:9},
    {id:"quantum",name:"QUANTUM",desc:"Emerald and violet duotone",price:10},
    {id:"cola",name:"COLA",desc:"Soda brown and cream",price:8},
    {id:"vintagewin",name:"VINTAGE WIN",desc:"Antique gold and leather",price:9}
  ],
  hats:[
    {id:"hat_cap",name:"CAP",desc:"Classic baseball cap",price:3},
    {id:"hat_crown",name:"CROWN",desc:"Royal headwear",price:8},
    {id:"hat_helmet",name:"HELMET",desc:"Space protection",price:6},
    {id:"hat_tophat",name:"TOP HAT",desc:"Formal occasion",price:7}
  ],
  school:[
    {id:"school_physics",name:"PHYSICS SECTION",desc:"Adds Physics to School Mode",price:10},
    {id:"school_chem",name:"CHEMISTRY SECTION",desc:"Adds Chemistry to School Mode",price:10},
    {id:"school_geo",name:"GEOGRAPHY SECTION",desc:"Adds Geography to School Mode",price:10}
  ],
  perks:[
    {id:"perk_lucky",name:"LUCKY COINS",desc:"+25% coins from every win",price:20},
    {id:"perk_streak",name:"STREAK SHIELD",desc:"Keep your daily streak for 1 missed day",price:15},
    {id:"perk_ai_hard",name:"AI ELITE",desc:"Unlocks AI vs AI hardest difficulty",price:12},
    {id:"perk_party_plus",name:"PARTY+",desc:"Party Mode: first to 5 wins, bigger variety",price:10},
    {id:"perk_rematch",name:"QUICK REMATCH",desc:"One-key rematch banner is always enabled",price:8},
    {id:"perk_gold_cursor",name:"GOLD TRAIL",desc:"Golden particle trail on menu hover",price:6},
    {id:"perk_speedrun",name:"SPEEDRUN TIMER",desc:"Track your fastest solo runs",price:9},
    {id:"perk_ghost_mode",name:"GHOST MODE",desc:"Preview random picks before they start",price:11},
    {id:"perk_daily_double",name:"DAILY DOUBLE",desc:"Daily bonus coins are doubled",price:14},
    {id:"perk_vip",name:"VIP BADGE",desc:"Shiny badge next to your name",price:16}
  ],
  mood:[
    {id:"cozy",name:"COZY",desc:"Soft glows, gentle corners (default)",price:0},
    {id:"energetic",name:"ENERGETIC",desc:"Bright hover pops, punchy glow",price:0},
    {id:"premium",name:"PREMIUM",desc:"Sleek gradients, gold accents",price:0}
  ]
};
window.PDX_SHOP_ITEMS=SHOP_ITEMS;   // expose for mega_shop.js

let shopTab="themes";
function openShop(){
  const existing=document.getElementById("shopScreen");
  if(existing){existing.classList.add("active");activeScreen="shopScreen";return;}
  const sec=document.createElement("section");
  sec.id="shopScreen";sec.className="screen shop-screen";
  document.body.insertBefore(sec,document.querySelector(".touch-pad"));
  activeScreen="shopScreen";
  document.querySelectorAll(".screen.active").forEach(s=>{if(s!==sec)s.classList.remove("active");});
  sec.classList.add("active");
  renderShop(sec);
}
window.openShop=openShop;

function renderShop(sec){
  sec.innerHTML=`
    <button class="back" onclick="showMenu()">MENU</button>
    <h1 class="shop-title">🛒 PIXEL SHOP</h1>
    <p class="shop-coins">🪙 ${profile.coins} COINS · PLAYED ${profile.gamesPlayed} GAMES</p>
    <div class="shop-tabs">
      <button class="shop-tab ${shopTab==="themes"?"active":""}" data-tab="themes">THEMES</button>
      <button class="shop-tab ${shopTab==="mood"?"active":""}" data-tab="mood">MOOD</button>
      <button class="shop-tab ${shopTab==="hats"?"active":""}" data-tab="hats">HATS</button>
      <button class="shop-tab ${shopTab==="perks"?"active":""}" data-tab="perks">PERKS</button>
      <button class="shop-tab ${shopTab==="school"?"active":""}" data-tab="school">SCHOOL MODE</button>
    </div>
    <div class="shop-grid" id="shopGrid"></div>
  `;
  sec.querySelectorAll(".shop-tab").forEach(b=>{
    b.addEventListener("click",()=>{shopTab=b.dataset.tab;renderShop(sec);});
  });
  const grid=sec.querySelector("#shopGrid");
  const items=SHOP_ITEMS[shopTab]||[];
  items.forEach(item=>{
    let owned,equipped;
    if(shopTab==="themes"){
      owned=profile.ownedThemes.includes(item.id);
      equipped=profile.theme===item.id;
    }else if(shopTab==="mood"){
      owned=true;equipped=(profile.energy||"cozy")===item.id;
    }else if(shopTab==="hats"){
      owned=profile.ownedAvatars.includes(item.id);
      equipped=profile.equippedHat===item.id;
    }else if(shopTab==="perks"){
      owned=(profile.perks||[]).includes(item.id);
      equipped=false;
    }else{
      owned=profile.schoolUpgrades.includes(item.id);
      equipped=false;
    }
    const card=document.createElement("div");
    card.className="shop-item"+(owned?" owned":"")+(equipped?" equipped":"");
    card.innerHTML=`
      <div class="name">${item.name}</div>
      <div class="desc">${item.desc}</div>
      <div class="price">${owned?(equipped?"EQUIPPED":"OWNED"):"🪙 "+item.price}</div>
    `;
    card.addEventListener("click",()=>{
      if(owned){
        if(shopTab==="themes"){profile.theme=item.id;applyTheme();save();renderShop(sec);showToast(`Theme set: ${item.name}`);}
        else if(shopTab==="mood"){profile.energy=item.id;if(window.PDX_SET_ENERGY)window.PDX_SET_ENERGY(item.id);else{save();renderShop(sec);showToast(`Mood set: ${item.name}`);}}
        else if(shopTab==="hats"){profile.equippedHat=profile.equippedHat===item.id?null:item.id;save();renderShop(sec);}
        return;
      }
      if(profile.coins<item.price){showToast("Not enough coins!");return;}
      profile.coins-=item.price;
      if(shopTab==="themes"){profile.ownedThemes.push(item.id);profile.theme=item.id;applyTheme();}
      else if(shopTab==="hats"){profile.ownedAvatars.push(item.id);profile.equippedHat=item.id;}
      else if(shopTab==="perks"){profile.perks=profile.perks||[];profile.perks.push(item.id);if(item.id==="perk_ai_hard")window.PDX_AI&&(window.PDX_AI.eliteUnlocked=true);}
      else{profile.schoolUpgrades.push(item.id);}
      save();updateCoins();renderShop(sec);
      showToast(`Purchased ${item.name}!`);
    });
    grid.appendChild(card);
  });
  updateCoins();
}

/* =====================================================
   AVATAR
===================================================== */
const SKIN_COLORS=["#f3bd83","#e0ac69","#c68642","#8d5524","#5c3317","#ffd8c0"];
const HAIR_COLORS=["#3d2b1f","#1a100a","#a8743a","#ffe66d","#ff72c8","#64eaff","#63f59a","#ff4a4a","#888","#fff"];
const SHIRT_COLORS=["#64eaff","#ff72c8","#ffe66d","#63f59a","#ff8c42","#b07aff","#ffffff","#222","#ff5878"];
const PANTS_COLORS=["#2a2f63","#1a100a","#8a5a2a","#3a3f6a","#5a3f8a"];
const SHOE_COLORS=["#0c0f24","#ffffff","#ff5878","#a8743a"];
const HAIR_STYLES=["short","long","bald","mohawk","ponytail"];
const FACES=["happy","serious","surprised"];
const EYE_COLORS=["#11152b","#3a8a4a","#4a8aff","#a8743a","#c83030"];

function openAvatar(){
  const existing=document.getElementById("avatarScreen");
  if(existing){existing.classList.add("active");activeScreen="avatarScreen";return;}
  const sec=document.createElement("section");
  sec.id="avatarScreen";sec.className="screen avatar-screen";
  document.body.insertBefore(sec,document.querySelector(".touch-pad"));
  activeScreen="avatarScreen";
  document.querySelectorAll(".screen.active").forEach(s=>{if(s!==sec)s.classList.remove("active");});
  sec.classList.add("active");
  renderAvatar(sec);
}
window.openAvatar=openAvatar;

function renderAvatar(sec){
  const a=profile.avatar;
  sec.innerHTML=`
    <button class="back" onclick="showMenu()">MENU</button>
    <h1 class="avatar-title">🎭 AVATAR CUSTOMIZER</h1>
    <div class="avatar-layout">
      <div class="avatar-preview-box">
        <canvas id="avatarPreview" width="240" height="320"></canvas>
      </div>
      <div class="avatar-controls">
        <div class="avatar-row"><label>Skin</label>
          <div class="avatar-swatches" data-key="skin">
            ${SKIN_COLORS.map(c=>`<div class="avatar-swatch${a.skin===c?" selected":""}" style="background:${c}" data-color="${c}"></div>`).join("")}
          </div></div>
        <div class="avatar-row"><label>Hair Color</label>
          <div class="avatar-swatches" data-key="hair">
            ${HAIR_COLORS.map(c=>`<div class="avatar-swatch${a.hair===c?" selected":""}" style="background:${c}" data-color="${c}"></div>`).join("")}
          </div></div>
        <div class="avatar-row"><label>Hair Style</label>
          <div class="avatar-swatches">
            ${HAIR_STYLES.map(s=>`<button class="shop-tab ${a.style===s?"active":""}" data-style="${s}">${s.toUpperCase()}</button>`).join("")}
          </div></div>
        <div class="avatar-row"><label>Eye Color</label>
          <div class="avatar-swatches" data-key="eye">
            ${EYE_COLORS.map(c=>`<div class="avatar-swatch${a.eye===c?" selected":""}" style="background:${c}" data-color="${c}"></div>`).join("")}
          </div></div>
        <div class="avatar-row"><label>Shirt</label>
          <div class="avatar-swatches" data-key="shirt">
            ${SHIRT_COLORS.map(c=>`<div class="avatar-swatch${a.shirt===c?" selected":""}" style="background:${c}" data-color="${c}"></div>`).join("")}
          </div></div>
        <div class="avatar-row"><label>Pants</label>
          <div class="avatar-swatches" data-key="pants">
            ${PANTS_COLORS.map(c=>`<div class="avatar-swatch${a.pants===c?" selected":""}" style="background:${c}" data-color="${c}"></div>`).join("")}
          </div></div>
        <div class="avatar-row"><label>Shoes</label>
          <div class="avatar-swatches" data-key="shoe">
            ${SHOE_COLORS.map(c=>`<div class="avatar-swatch${a.shoe===c?" selected":""}" style="background:${c}" data-color="${c}"></div>`).join("")}
          </div></div>
        <div class="avatar-row"><label>Expression</label>
          <div class="avatar-swatches">
            ${FACES.map(f=>`<button class="shop-tab ${a.face===f?"active":""}" data-face="${f}">${f.toUpperCase()}</button>`).join("")}
          </div></div>
        <button onclick="resetAvatarToDefault()" style="background:#3a4a8a;color:#fff;padding:12px;border:none;font-family:monospace;font-weight:bold;cursor:pointer;margin-top:10px;">RESET</button>
      </div>
    </div>
  `;
  drawAvatarPreview(sec.querySelector("#avatarPreview"));
  sec.querySelectorAll("[data-key]").forEach(group=>{
    const key=group.dataset.key;
    group.querySelectorAll(".avatar-swatch").forEach(sw=>{
      sw.addEventListener("click",()=>{profile.avatar[key]=sw.dataset.color;save();renderAvatar(sec);});
    });
  });
  sec.querySelectorAll("[data-style]").forEach(b=>{
    b.addEventListener("click",()=>{profile.avatar.style=b.dataset.style;save();renderAvatar(sec);});
  });
  sec.querySelectorAll("[data-face]").forEach(b=>{
    b.addEventListener("click",()=>{profile.avatar.face=b.dataset.face;save();renderAvatar(sec);});
  });
}

function drawAvatarPreview(cv){
  const x=cv.getContext("2d");
  const a=profile.avatar;
  const hat=profile.equippedHat;
  x.imageSmoothingEnabled=false;
  for(let i=0;i<12;i++)for(let j=0;j<16;j++){
    x.fillStyle=(i+j)%2===0?"#1a2050":"#141a3a";x.fillRect(i*20,j*20,20,20);
  }
  const cx=120,baseY=260;
  x.fillStyle="rgba(0,0,0,.35)";
  x.beginPath();x.ellipse(cx,baseY+2,42,10,0,0,Math.PI*2);x.fill();
  x.fillStyle=a.pants;
  x.fillRect(cx-22,baseY-60,18,60);
  x.fillRect(cx+4,baseY-60,18,60);
  x.fillStyle=a.shoe;
  x.fillRect(cx-24,baseY-8,24,10);
  x.fillRect(cx+2,baseY-8,24,10);
  x.fillStyle=a.shirt;
  x.fillRect(cx-32,baseY-140,64,86);
  x.strokeStyle="#080b18";x.lineWidth=3;
  x.strokeRect(cx-32,baseY-140,64,86);
  x.fillStyle=a.skin;
  x.fillRect(cx-28,baseY-220,56,82);
  x.strokeStyle="#080b18";x.lineWidth=3;
  x.strokeRect(cx-28,baseY-220,56,82);
  x.fillStyle=a.hair;
  if(a.style==="short")x.fillRect(cx-32,baseY-226,64,16);
  else if(a.style==="long"){x.fillRect(cx-32,baseY-226,64,20);x.fillRect(cx-32,baseY-210,10,46);x.fillRect(cx+22,baseY-210,10,46);}
  else if(a.style==="mohawk")x.fillRect(cx-8,baseY-240,16,24);
  else if(a.style==="ponytail"){x.fillRect(cx-32,baseY-226,64,16);x.fillRect(cx+22,baseY-210,14,42);}
  if(hat==="hat_cap"){x.fillStyle="#ff5878";x.fillRect(cx-30,baseY-234,60,16);x.fillRect(cx-40,baseY-220,46,8);}
  else if(hat==="hat_crown"){x.fillStyle="#ffe66d";x.fillRect(cx-26,baseY-238,52,20);x.fillRect(cx-22,baseY-248,8,12);x.fillRect(cx-6,baseY-250,12,14);x.fillRect(cx+14,baseY-248,8,12);}
  else if(hat==="hat_helmet"){x.fillStyle="#9fc0ff";x.fillRect(cx-32,baseY-234,64,24);x.fillStyle="#6a8adc";x.fillRect(cx-30,baseY-220,60,8);}
  else if(hat==="hat_tophat"){x.fillStyle="#111";x.fillRect(cx-24,baseY-250,48,24);x.fillRect(cx-34,baseY-226,68,8);}
  x.fillStyle="#fff";
  x.fillRect(cx-18,baseY-186,10,10);
  x.fillRect(cx+8,baseY-186,10,10);
  x.fillStyle=a.eye;
  x.fillRect(cx-15,baseY-183,5,6);
  x.fillRect(cx+11,baseY-183,5,6);
  x.fillStyle="#11152b";
  if(a.face==="happy")x.fillRect(cx-10,baseY-158,20,4);
  else if(a.face==="serious")x.fillRect(cx-8,baseY-158,16,3);
  else{x.beginPath();x.arc(cx,baseY-156,6,0,Math.PI);x.strokeStyle="#11152b";x.lineWidth=2;x.stroke();}
}

window.resetAvatarToDefault=function(){
  profile.avatar=JSON.parse(JSON.stringify(DEFAULT_PROFILE.avatar));
  profile.equippedHat=null;
  save();
  const s=document.getElementById("avatarScreen");
  if(s)renderAvatar(s);
};

/* =====================================================
   CINEMA
===================================================== */
const VIDEOS=[
  {id:"history_rome",title:"The Fall of Rome",desc:"How the Roman Empire collapsed from within",icon:"🏛️",cat:"History"},
  {id:"sci_blackholes",title:"Black Holes Explained",desc:"What happens past the event horizon",icon:"🌌",cat:"Science"},
  {id:"ai_future",title:"AI in 2050",desc:"How artificial intelligence may reshape society",icon:"🤖",cat:"Technology"},
  {id:"bio_cells",title:"Inside a Cell",desc:"A tour of the microscopic factory of life",icon:"🧬",cat:"Science"},
  {id:"hist_egypt",title:"Ancient Egypt",desc:"Pyramids, pharaohs, and the Nile",icon:"🦅",cat:"History"},
  {id:"math_infinity",title:"Infinity Explained",desc:"Different sizes of infinity — yes, really",icon:"∞",cat:"Mathematics"},
  {id:"space_mars",title:"Journey to Mars",desc:"How we might reach the red planet",icon:"🚀",cat:"Science"},
  {id:"psych_habits",title:"The Science of Habits",desc:"Why habits form and how to break them",icon:"🧠",cat:"Psychology"},
  {id:"zombie_school",title:"30 Days in a Zombie School",desc:"What would happen if you were trapped in a school during an outbreak?",icon:"🧟",cat:"What If"},
  {id:"stop_time",title:"What If You Could Stop Time?",desc:"The physics and philosophy of frozen time",icon:"⏸️",cat:"What If"},
  {id:"sci_volcano",title:"How Volcanoes Work",desc:"From magma chambers to pyroclastic flows",icon:"🌋",cat:"Science"},
  {id:"math_pi",title:"The Story of Pi",desc:"Why π shows up everywhere in math",icon:"🥧",cat:"Mathematics"},
  {id:"hist_pompeii",title:"Pompeii: The Day It Rained Fire",desc:"The eruption that froze a city in time",icon:"🗿",cat:"History"},
  {id:"space_iss",title:"Life on the Space Station",desc:"Astronauts share what daily life is like in orbit",icon:"🛰️",cat:"Science"},
  {id:"tech_internet",title:"How the Internet Actually Works",desc:"Packets, routers, and the wires under the sea",icon:"🌐",cat:"Technology"},
  {id:"bio_dna",title:"DNA: The Instruction Manual",desc:"How four letters write every living thing",icon:"🧬",cat:"Science"}
];
const VIDEOS_SHOP_REAL={
  vid_ocean:{id:"vid_ocean",title:"Deep Ocean",desc:"Life in the abyss — bioluminescence and pressure",icon:"🌊",cat:"Science"},
  vid_volcano:{id:"vid_volcano",title:"Volcanoes",desc:"How eruptions work",icon:"🌋",cat:"Science"},
  vid_rome:{id:"vid_rome",title:"Roman Army",desc:"Legions and conquest",icon:"🛡️",cat:"History"},
  vid_space:{id:"vid_space",title:"The Moon",desc:"Apollo missions to the Moon",icon:"🌙",cat:"Science"},
  vid_dino:{id:"vid_dino",title:"Dinosaurs",desc:"The age of reptiles",icon:"🦖",cat:"Science"},
  vid_coding:{id:"vid_coding",title:"How Games Are Made",desc:"Behind the code",icon:"💻",cat:"Technology"}
};
function openCinema(){
  const existing=document.getElementById("cinemaScreen");
  if(existing){existing.classList.add("active");activeScreen="cinemaScreen";return;}
  const sec=document.createElement("section");
  sec.id="cinemaScreen";sec.className="screen cinema-screen";
  document.body.insertBefore(sec,document.querySelector(".touch-pad"));
  activeScreen="cinemaScreen";
  document.querySelectorAll(".screen.active").forEach(s=>{if(s!==sec)s.classList.remove("active");});
  sec.classList.add("active");
  sec.innerHTML=`
    <button class="back" onclick="showMenu()">MENU</button>
    <h1 class="cinema-title">🎬 CINEMA</h1>
    <div class="cinema-grid" id="cinemaGrid"></div>
  `;
  const grid=sec.querySelector("#cinemaGrid");
  const vids=VIDEOS.slice();
  // append purchased shop videos
  const owned=profile.ownedVideos||[];
  owned.forEach(id=>{const v=VIDEOS_SHOP_REAL[id];if(v&&!vids.find(x=>x.id===id))vids.push(v);});
  // locked teasers for unpurchased videos
  const SHOP_LOCKED=[
    {id:"vid_ocean",name:"DEEP OCEAN",icon:"🌊"},{id:"vid_volcano",name:"VOLCANOES",icon:"🌋"},
    {id:"vid_rome",name:"ROMAN ARMY",icon:"🛡️"},{id:"vid_space",name:"THE MOON",icon:"🌙"},
    {id:"vid_dino",name:"DINOSAURS",icon:"🦖"},{id:"vid_coding",name:"HOW GAMES ARE MADE",icon:"💻"}
  ];
  SHOP_LOCKED.forEach(sl=>{
    if(!owned.includes(sl.id)&&!vids.find(x=>x.id===sl.id))
      vids.push({id:sl.id,title:sl.name,desc:"🔒 Unlock in the Pixel Shop",icon:sl.icon,cat:"LOCKED",url:""});
  });
  vids.forEach(v=>{
    const card=document.createElement("div");
    card.className="cinema-card";
    card.innerHTML=`
      <div class="cinema-thumb">${v.icon}</div>
      <div class="cinema-info"><h3>${v.title}</h3><p>${v.desc}</p>
      <p style="color:#63f59a;margin-top:6px;font-size:10px;">${v.cat}${profile.cinemaWatched.includes(v.id)?" · ✓ WATCHED":""}</p></div>
    `;
    card.addEventListener("click",()=>{ if(v.cat==="LOCKED"){showToast("?? Unlock this video in the Pixel Shop!");return;} playVideo(v); });
    grid.appendChild(card);
  });
}
window.openCinema=openCinema;

function playVideo(v){
  // all videos are self-made local productions (no external embeds)
  if(window.PDX_playLocalVideo){window.PDX_playLocalVideo(v);return;}
  // fallback: generic modal
  const modal=document.createElement("div");
  modal.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;";
  modal.innerHTML=`
    <div style="background:#0f1a2e;border:3px solid #63f59a;max-width:800px;width:100%;padding:20px;font-family:'Courier New',monospace;color:#e0e8ff;position:relative;">
      <button onclick="this.closest('div').parentElement.remove()" style="position:absolute;top:8px;right:8px;background:transparent;border:2px solid #63f59a;color:#63f59a;cursor:pointer;padding:4px 10px;font-family:monospace;z-index:1;">✕</button>
      <div style="font-size:64px;text-align:center;margin:20px 0;">${v.icon}</div>
      <h2 style="color:#63f59a;margin:12px 0 8px;">${v.title}</h2>
      <p style="color:#9fc0ff;line-height:1.6;font-size:14px;">${v.desc}</p>
    </div>
  `;
  modal.addEventListener("click",e=>{if(e.target===modal)modal.remove();});
  document.body.appendChild(modal);
}

/* =====================================================
   TOURNAMENT
===================================================== */
let tournamentState=null;
function openTournament(){
  const existing=document.getElementById("tournamentScreen");
  if(existing){existing.classList.add("active");activeScreen="tournamentScreen";return;}
  const sec=document.createElement("section");
  sec.id="tournamentScreen";sec.className="screen tournament-screen";
  document.body.insertBefore(sec,document.querySelector(".touch-pad"));
  activeScreen="tournamentScreen";
  document.querySelectorAll(".screen.active").forEach(s=>{if(s!==sec)s.classList.remove("active");});
  sec.classList.add("active");
  renderTournamentSetup(sec);
}
window.openTournament=openTournament;

function getTournamentPool(){
  const pool=(window.PDX_CATALOG||[]).filter(g=>!profile.excludedGames.includes(g.id));
  return pool.map(g=>g.id);
}

function renderTournamentSetup(sec){
  const pool=getTournamentPool();
  sec.innerHTML=`
    <button class="back" onclick="showMenu()">MENU</button>
    <h1 class="tournament-title">🏆 TOURNAMENT</h1>
    <div class="tournament-setup">
      <h3>SETUP</h3>
      <label>Mode</label>
      <select id="tournMode">
        <option value="fixed">Best of N (fixed length)</option>
        <option value="infinite">Infinite (play until you stop)</option>
      </select>
      <label>Number of games (fixed mode)</label>
      <select id="tournCount">
        <option value="3">Best of 3</option>
        <option value="5" selected>Best of 5</option>
        <option value="7">Best of 7</option>
        <option value="9">Best of 9</option>
      </select>
      <label>Excluded games (click to toggle)</label>
      <input type="text" id="tournSearch" placeholder="Search games to exclude..." style="background:#0a0f24;border:2px solid #ff8c42;color:#fff;padding:8px;font-family:monospace;width:100%;box-sizing:border-box;margin-bottom:8px;">
      <div class="exclude-list" id="tournExclude"></div>
      <button class="start-btn" onclick="startTournament()">START TOURNAMENT</button>
    </div>
  `;
  renderExcludeList();
  sec.querySelector("#tournSearch").addEventListener("input",renderExcludeList);
}

function renderExcludeList(){
  const list=document.getElementById("tournExclude");
  if(!list)return;
  const q=(document.getElementById("tournSearch")?.value||"").toLowerCase();
  const pool=getTournamentPool();
  list.innerHTML=pool.filter(id=>{
    if(!q)return true;
    const g=window.PDX_CATALOG.find(c=>c.id===id)||{title:id};
    return g.title.toLowerCase().includes(q)||id.toLowerCase().includes(q);
  }).map(id=>{
    const g=window.PDX_CATALOG.find(c=>c.id===id)||{title:id};
    const ex=profile.excludedGames.includes(id);
    return `<div class="exclude-item" style="${ex?"opacity:.4;text-decoration:line-through;":""}" onclick="toggleExclude('${id}')">
      <input type="checkbox" ${ex?"checked":""} onclick="event.stopPropagation()">
      <span>${g.title}</span>
    </div>`;
  }).join("");
}

window.toggleExclude=function(id){
  if(profile.excludedGames.includes(id))profile.excludedGames=profile.excludedGames.filter(x=>x!==id);
  else profile.excludedGames.push(id);
  save();
  renderExcludeList();
};

window.startTournament=function(){
  const mode=document.getElementById("tournMode").value;
  const n=parseInt(document.getElementById("tournCount").value);
  const pool=getTournamentPool();
  if(pool.length<3){showToast("Not enough games available!");return;}
  const shuffled=pool.slice().sort(()=>Math.random()-0.5);
  const games=shuffled.slice(0,mode==="infinite"?pool.length:n);
  tournamentState={
    mode,games,current:0,p1:0,p2:0,wins:[],
    target:mode==="infinite"?9999:Math.ceil(n/2)
  };
  runNextTournamentGame();
};

function runNextTournamentGame(){
  if(!tournamentState)return;
  const {games,current,p1,p2,target}=tournamentState;
  if(p1>=target||p2>=target){endTournament();return;}
  if(current>=games.length){endTournament();return;}
  const gameId=games[current];
  window.__origRecordWin=window.__origRecordWin||window.recordWin;
  window.recordWin=function(game,player){
    const res=window.__origRecordWin.apply(this,arguments);
    if(tournamentState){
      if(player==="p1")tournamentState.p1++;
      else if(player==="p2")tournamentState.p2++;
      tournamentState.current++;
      updateTournamentBar();
      setTimeout(()=>{
        if(tournamentState){
          if(tournamentState.p1>=tournamentState.target||tournamentState.p2>=tournamentState.target){
            endTournament();
          }else{
            runNextTournamentGame();
          }
        }
      },1800);
    }
    return res;
  };
  updateTournamentBar();
  window.openGame(gameId);
}

function updateTournamentBar(){
  if(!tournamentState)return;
  let bar=document.getElementById("tournBar");
  if(!bar){bar=document.createElement("div");bar.id="tournBar";bar.className="tournament-progress";document.body.appendChild(bar);}
  const {p1,p2,target,mode,current,games}=tournamentState;
  bar.textContent=`🏆 P1 ${p1} : ${p2} P2 · ${mode==="infinite"?`Game ${current+1}`:`First to ${target} · Game ${Math.min(current+1,games.length)}/${games.length}`}`;
}

function endTournament(){
  if(!tournamentState)return;
  const {p1,p2}=tournamentState;
  const winner=p1>p2?"PLAYER 1":p2>p1?"PLAYER 2":"TIE";
  window.recordWin=window.__origRecordWin||window.recordWin;
  tournamentState=null;
  const bar=document.getElementById("tournBar");
  if(bar)bar.remove();
  if(winner==="TIE")showToast(`🏆 Tournament tied ${p1}:${p2}`);
  else showToast(`🏆 ${winner} WINS THE TOURNAMENT! ${p1}:${p2}`);
  setTimeout(()=>window.showMenu(),2500);
}

/* =====================================================
   SCHOOL MODE
===================================================== */
const schoolOverlay=document.createElement("div");
schoolOverlay.id="schoolMode";
document.body.appendChild(schoolOverlay);

let schoolActive=false;
let savedTitle="Pixel Duel Arcade";

function buildSchoolNav(){
  const nav=[
    ["home","Home"],["math","Mathematics"],["science","Science"],
    ["history","History"],["english","English"]
  ];
  if(profile.schoolUpgrades.includes("school_physics"))nav.push(["physics","Physics"]);
  if(profile.schoolUpgrades.includes("school_chem"))nav.push(["chemistry","Chemistry"]);
  if(profile.schoolUpgrades.includes("school_geo"))nav.push(["geography","Geography"]);
  return nav;
}

function renderSchoolTab(tab){
  const nav=buildSchoolNav();
  schoolOverlay.innerHTML=`
    <header class="school-header">
      <div class="school-logo">📚 SCHOLAR ACADEMY</div>
      <nav class="school-nav" id="schoolNav">
        ${nav.map(([k,label])=>`<a href="#" data-tab="${k}" class="${k===tab?"active":""}">${label}</a>`).join("")}
      </nav>
      <div class="school-user">Student Portal</div>
    </header>
    <main class="school-main" id="schoolContent"></main>
  `;
  document.getElementById("schoolNav").addEventListener("click",e=>{
    if(e.target.dataset.tab){e.preventDefault();renderSchoolTab(e.target.dataset.tab);}
  });
  const c=document.getElementById("schoolContent");
  const pages={
    home:()=>`
      <h1>Welcome to Scholar Academy</h1>
      <p>Scholar Academy provides comprehensive coursework for students in grades 8 through 12. Select a subject from the navigation above to begin your lesson.</p>
      <h2>Today's Assignments</h2>
      <div class="school-card"><strong>Mathematics:</strong> Practice multi-step algebra. 5 problems assigned below.</div>
      <div class="school-card"><strong>Science:</strong> Read about cellular respiration. Complete the review questions.</div>
      <div class="school-card"><strong>History:</strong> Chapter 7 — The Industrial Revolution. Read pages 145-178.</div>
      <div class="school-card"><strong>English:</strong> Essay draft due Friday. See the assignment page for details.</div>
      <h2>This Month</h2>
      <p>You have played <strong>${monthlyDaysPlayed()}</strong> study days this month out of ${daysInMonth()}.</p>
    `,
    math:()=>{
      const problems=[
        {t:"2 × 8 + 3",a:19},{t:"15 − 4",a:11},{t:"3 × 7 + 2",a:23},
        {t:"24 ÷ 6",a:4},{t:"9 × 9",a:81}
      ];
      return `
        <h1>Mathematics — Algebra & Arithmetic</h1>
        <p>Complete the following problems. Type your answer and click <em>Check</em>.</p>
        ${problems.map((p,i)=>`
          <div class="school-problem">${p.t} = ?
            <input type="number" id="mi${i}">
            <button class="school-btn" onclick="checkMath(${i},${p.a})">Check</button>
            <span class="school-feedback" id="mf${i}"></span>
          </div>`).join("")}
        <h2>Lesson Notes</h2>
        <p><strong>Order of operations:</strong> PEMDAS — Parentheses, Exponents, Multiplication/Division (left to right), Addition/Subtraction (left to right).</p>
      `;
    },
    science:()=>`
      <h1>Science — Biology</h1>
      <h2>Cell Structure</h2>
      <p>All living organisms are composed of cells. The cell theory states that:</p>
      <ul><li>All living things are made of one or more cells</li>
      <li>The cell is the basic unit of structure and function in organisms</li>
      <li>All cells come from pre-existing cells</li></ul>
      <div class="school-card"><strong>Nucleus:</strong> Contains DNA, controls cell activities.</div>
      <div class="school-card"><strong>Mitochondria:</strong> Produces ATP through cellular respiration.</div>
      <div class="school-card"><strong>Ribosomes:</strong> Site of protein synthesis.</div>
    `,
    history:()=>`
      <h1>History — The Industrial Revolution</h1>
      <p>The Industrial Revolution (c. 1760–1840) began in Britain and spread throughout Europe and North America.</p>
      <div class="school-card"><strong>Steam Engine (James Watt, 1769):</strong> Powered factories, trains, and ships.</div>
      <div class="school-card"><strong>Spinning Jenny (James Hargreaves, 1764):</strong> Increased textile production speed.</div>
      <h2>Social Impact</h2>
      <ul><li>Urbanization</li><li>Rise of the working class</li>
      <li>Child labor laws introduced</li><li>Economic growth alongside pollution</li></ul>
    `,
    english:()=>`
      <h1>English — Literature & Composition</h1>
      <h2>Essay Assignment</h2>
      <div class="school-card">
        <p><strong>Prompt:</strong> Analyze the theme of isolation in Mary Shelley's <em>Frankenstein</em>. Write 500-750 words.</p>
        <p><strong>Due:</strong> Friday, 11:59 PM</p>
      </div>
      <h2>Grammar Review</h2>
      <p>A complete sentence has a subject and a predicate.</p>
    `,
    physics:()=>`
      <h1>Physics — Motion & Forces</h1>
      <p>Newton's three laws of motion form the foundation of classical mechanics.</p>
      <div class="school-card"><strong>First Law:</strong> An object in motion stays in motion unless acted upon by an outside force.</div>
      <div class="school-card"><strong>Second Law:</strong> F = ma. Force equals mass times acceleration.</div>
      <div class="school-card"><strong>Third Law:</strong> For every action there is an equal and opposite reaction.</div>
    `,
    chemistry:()=>`
      <h1>Chemistry — Atomic Structure</h1>
      <p>Atoms consist of protons, neutrons, and electrons. The atomic number is the number of protons.</p>
      <div class="school-card"><strong>Periodic Table:</strong> Elements are arranged by atomic number.</div>
      <div class="school-card"><strong>Chemical Bonds:</strong> Ionic bonds transfer electrons; covalent bonds share electrons.</div>
    `,
    geography:()=>`
      <h1>Geography — Earth's Systems</h1>
      <p>The four spheres of Earth: lithosphere, hydrosphere, atmosphere, and biosphere.</p>
      <div class="school-card"><strong>Plate Tectonics:</strong> The lithosphere is divided into moving plates.</div>
      <div class="school-card"><strong>Water Cycle:</strong> Evaporation, condensation, precipitation, collection.</div>
    `
  };
  if(pages[tab])c.innerHTML=pages[tab]();
}

window.checkMath=function(i,ans){
  const inp=document.getElementById("mi"+i);
  const fb=document.getElementById("mf"+i);
  if(!inp||!fb)return;
  const val=parseFloat(inp.value);
  if(Math.abs(val-ans)<0.001){fb.textContent="✓ Correct!";fb.className="school-feedback correct";}
  else{fb.textContent="✗ Try again";fb.className="school-feedback wrong";}
};

function enterSchool(){
  if(schoolActive)return;
  schoolActive=true;
  window.__schoolState={
    sound:window.settings?window.settings.sound:true,
    scanlines:window.settings?window.settings.scanlines:true,
    title:document.title
  };
  if(window.settings)window.settings.sound=false;
  if(window.setPaused)window.setPaused(true);
  const sl=document.getElementById("scanlineOverlay");
  if(sl)sl.style.display="none";
  document.title="School Subjects 8th-12th";
  setFavicon(schoolFav);
  schoolOverlay.style.display="block";
  renderSchoolTab("home");
  document.querySelectorAll("#pixelClock,#pixelCoins,#schoolTrigger").forEach(el=>el.style.display="none");
  document.querySelectorAll(".screen").forEach(s=>{s.style.display="none";});
}
function exitSchool(){
  if(!schoolActive)return;
  schoolActive=false;
  schoolOverlay.style.display="none";
  if(window.__schoolState){
    if(window.settings)window.settings.sound=window.__schoolState.sound;
    document.title=window.__schoolState.title||"Pixel Duel Arcade";
  }
  const sl=document.getElementById("scanlineOverlay");
  if(sl)sl.style.display=(window.settings&&window.settings.scanlines)?"block":"none";
  setFavicon(defaultFav);
  if(window.setPaused)window.setPaused(false);
  document.querySelectorAll("#pixelClock,#pixelCoins,#schoolTrigger").forEach(el=>el.style.display="");
  document.querySelectorAll(".screen").forEach(s=>{s.style.display="";});
}
window.enterSchool=enterSchool;
window.exitSchool=exitSchool;

// (school trigger button is provided by school_mode.js — V2 replaces this)
const trigger=null;
if(trigger)document.body.appendChild(trigger);

addEventListener("keydown",e=>{
  if(schoolActive&&e.key==="Escape"){e.preventDefault();exitSchool();}
},true);

/* =====================================================
   NAV HOOK
===================================================== */
const _origOpenGame=window.openGame;
window.openGame=function(id){
  ["shopScreen","avatarScreen","cinemaScreen","tournamentScreen"].forEach(sid=>{
    const el=document.getElementById(sid);
    if(el)el.classList.remove("active");
  });
  return _origOpenGame.apply(this,arguments);
};

})();