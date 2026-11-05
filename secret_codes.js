/* =====================================================
   SECRET CODES — a hidden input where typing a code unlocks
   rewards: coins, secret games, IMPOSSIBLE AI, secret music,
   secret avatars, pop-culture nods, season skips.
   Codes are case-insensitive, checked live as you type.
   A "CLEAR SECRETS" button removes most unlocks but keeps
   permanent ones (meta-games, achievements).
   ===================================================== */
(function(){
"use strict";
if(window.__PDX_CODES__)return;window.__PDX_CODES__=true;

const SEASON_ORDER=["halloween","christmas","easter","valentines"];
function prof(){const p=window.PDX_PROFILE||{};p.secrets=p.secrets||{};return p;}

/* ---------- the codebook ---------- */
const CODES={
  "COINRAIN":{label:"coinrain",desc:"+250 coins",once:true,fn:p=>{p.coins=(p.coins||0)+250;window.showToast&&showToast("+250 COINS! 🪙");}},
  "GIMMEGEMS":{label:"gimmegems",desc:"+1000 coins (one time)",once:true,fn:p=>{p.coins=(p.coins||0)+1000;window.showToast&&showToast("+1000 COINS! 💎");}},
  "BIGBRAIN":{label:"bigbrain",desc:"SmartScore boost in School Mode",once:true,fn:p=>{p.secrets.bigBrain=true;window.showToast&&showToast("BIG BRAIN unlocked! 🧠");}},
  "IMPOSSIBLE":{label:"impossible",desc:"Unlock IMPOSSIBLE AI difficulty",once:true,fn:p=>{p.secrets.impossibleAI=true;if(window.PDX_AI)window.PDX_AI.impossible=true;window.showToast&&showToast("IMPOSSIBLE AI unlocked! 🤖");}},
  "OMEGA":{label:"omega",desc:"Unlock secret game: OMEGA PROTOCOL",once:true,fn:p=>{p.ownedGames=p.ownedGames||[];if(!p.ownedGames.includes("game_omega"))p.ownedGames.push("game_omega");window.showToast&&showToast("OMEGA PROTOCOL unlocked! 🔒");}},
  "RETROBOWL":{label:"retrobowl",desc:"Unlock secret game: PIXEL BOWL",once:true,fn:p=>{p.ownedGames=p.ownedGames||[];if(!p.ownedGames.includes("game_bowl"))p.ownedGames.push("game_bowl");window.showToast&&showToast("PIXEL BOWL unlocked! 🏈");}},
  "DOOMED":{label:"doomed",desc:"Unlock secret game: DOOMED DUEL",once:true,fn:p=>{p.ownedGames=p.ownedGames||[];if(!p.ownedGames.includes("game_doom"))p.ownedGames.push("game_doom");window.showToast&&showToast("DOOMED DUEL unlocked! 👹");}},
  "PIRATE":{label:"pirate",desc:"Secret avatar: Pirate P1",once:true,fn:p=>{p.ownedAvatars=p.ownedAvatars||[];if(!p.ownedAvatars.includes("av_pirate"))p.ownedAvatars.push("av_pirate");window.showToast&&showToast("PIRATE avatar unlocked! 🏴‍☠️");}},
  "MASTERCHIEF":{label:"masterchief",desc:"Secret avatar: SPARTAN P1 (Halo nod)",once:true,fn:p=>{p.ownedAvatars=p.ownedAvatars||[];if(!p.ownedAvatars.includes("av_spartan"))p.ownedAvatars.push("av_spartan");window.showToast&&showToast("SPARTAN avatar unlocked! 💪");}},
  "GREENHILL":{label:"greenhill",desc:"Secret music: GREEN HILL ZONE vibes",once:true,fn:p=>{p.ownedMusic=p.ownedMusic||[];if(!p.ownedMusic.includes("greenhill"))p.ownedMusic.push("greenhill");window.showToast&&showToast("GREEN HILL music unlocked! 💨");}},
  "MEGALOVANIA":{label:"megalovania",desc:"Secret music: BAD TIME (Undertale nod)",once:true,fn:p=>{p.ownedMusic=p.ownedMusic||[];if(!p.ownedMusic.includes("badtime"))p.ownedMusic.push("badtime");window.showToast&&showToast("BAD TIME music unlocked! 💀");}},
  "HANSZIMMER":{label:"hanszimmer",desc:"Secret music: EPIC ORCHESTRAL",once:true,fn:p=>{p.ownedMusic=p.ownedMusic||[];if(!p.ownedMusic.includes("epic"))p.ownedMusic.push("epic");window.showToast&&showToast("EPIC music unlocked! 🎻");}},
  "SPRINGSKIP":{label:"springskip",desc:"Force Easter season (until cleared)",once:false,fn:p=>{p.secrets.seasonSkip="easter";applySeasonSkip();window.showToast&&showToast("Season forced: EASTER 🐰");}},
  "HOCUSPOCUS":{label:"hocuspocus",desc:"Force Halloween season (until cleared)",once:false,fn:p=>{p.secrets.seasonSkip="halloween";applySeasonSkip();window.showToast&&showToast("Season forced: HALLOWEEN 🎃");}},
  "LETITSNOW":{label:"letitsnow",desc:"Force Christmas season (until cleared)",once:false,fn:p=>{p.secrets.seasonSkip="christmas";applySeasonSkip();window.showToast&&showToast("Season forced: CHRISTMAS 🎄");}},
  "CUPTID":{label:"cupid",desc:"Force Valentine season (until cleared)",once:false,fn:p=>{p.secrets.seasonSkip="valentines";applySeasonSkip();window.showToast&&showToast("Season forced: VALENTINE'S 💝");}},
  "SEASONRESET":{label:"seasonreset",desc:"Return season to the real calendar",once:false,fn:p=>{p.secrets.seasonSkip=null;applySeasonSkip();window.showToast&&showToast("Season back to real date 📅");}},
  "COINRESET":{label:"coinreset",desc:"Reset coins to 100",once:false,fn:p=>{p.coins=100;window.showToast&&showToast("Coins reset to 100 🪙");}},
  "SECRETCLEAR":{label:"secretclear",desc:"Clear removable secrets (keeps permanent unlocks)",once:false,fn:p=>{clearSecrets(false);}}
};

/* ---------- secret games (registered only if unlocked) ---------- */
function registerSecretGames(){
  if(!window.PD)return;
  const p=prof();
  const owned=p.ownedGames||[];
  if(owned.includes("game_omega")&&!document.getElementById("omegaGame")){
    PD.micro({id:"omegaGame",title:"Omega Protocol",desc:"Secret unlock game",cat:"action",key:"omega",win:3,
      controls:"P1: WASD · P2: ARROWS — hack the terminal, dodge the sentinel",
      round(g){g.pl=[null,{x:200,y:250,r:14},{x:700,y:250,r:14}];g.bits=[];g.cd=[0,0];},
      update(g,dt){g.cd[0]=Math.max(0,g.cd[0]-dt);g.cd[1]=Math.max(0,g.cd[1]-dt);
        g.pl.forEach((p2,i)=>{if(!p2||!i)return;const I=g.I[i];
          p2.x+=((I.r?1:0)-(I.l?1:0))*230*dt;p2.y+=((I.d?1:0)-(I.u?1:0))*230*dt;
          p2.x=Math.max(20,Math.min(880,p2.x));p2.y=Math.max(60,Math.min(480,p2.y));
          if(I.pa&&g.cd[i]<=0){g.cd[i]=.7;g.bits.push({x:p2.x,y:p2.y,vx:i?-320:320,owner:i});}});
        for(const b of g.bits){b.x+=b.vx*dt;
          const foe=g.pl[1-b.owner];
          if(foe&&Math.hypot(b.x-foe.x,b.y-foe.y)<22){b.dead=true;g.point(b.owner);return;}
          if(b.x<0||b.x>900)b.dead=true;}
        g.bits=g.bits.filter(b=>!b.dead);},
      draw(g,ctx){ctx.fillStyle="#041208";ctx.fillRect(0,0,900,500);
        for(let i=0;i<20;i++){ctx.fillStyle="rgba(99,245,154,.12)";ctx.fillRect((i*61)%900,(i*43)%500,2,10);}
        for(const b of g.bits){ctx.fillStyle="#63f59a";ctx.fillRect(b.x-8,b.y-2,16,4);}
        g.pl.forEach((p2,i)=>{if(!p2||!i)return;ctx.fillStyle=i?"#ff72c8":"#63f59a";ctx.fillRect(p2.x-12,p2.y-14,24,28);});}
    });
  }
  if(owned.includes("game_bowl")&&!document.getElementById("bowlGame")){
    PD.micro({id:"bowlGame",title:"Pixel Bowl",desc:"Secret unlock game",cat:"sports",key:"bowl",win:3,
      controls:"P1: A/D + SPACE throw · P2: ←/→ + ENTER — reach the endzone",
      round(g){g.pl=[null,{x:150,y:250,r:13},{x:150,y:290,r:13}];g.ball={x:450,y:250};},
      update(g,dt){
        g.pl.forEach((p2,i)=>{if(!p2||!i)return;const I=g.I[i];
          p2.x+=((I.r?1:0)-(I.l?1:0))*240*dt;p2.x=Math.max(30,Math.min(870,p2.x));
          if(Math.hypot(p2.x-g.ball.x,p2.y-g.ball.y)<24){g.ball.holder=i;}
          if(g.ball.holder===i&&p2.x>=860){g.add(i,"TOUCHDOWN!");g.ball.x=450;g.ball.holder=null;}
          if(I.pa&&g.ball.holder===i){g.ball.holder=null;g.ball.vx=420;g.ball.fly=1;}});
        if(g.ball.holder==null&&g.ball.fly){g.ball.x+=g.ball.vx*dt;g.ball.vx*=.985;
          g.pl.forEach((p2,i)=>{if(p2&&Math.hypot(p2.x-g.ball.x,p2.y-g.ball.y)<24)g.ball.holder=i;});
          if(g.ball.x>900||g.ball.x<0){g.ball.x=450;g.ball.vx=0;g.ball.fly=0;}}},
      draw(g,ctx){for(let y=0;y<500;y+=25){ctx.fillStyle=(y/25)%2?"#1a4a1a":"#205420";ctx.fillRect(0,y,900,25);}
        ctx.fillStyle="#ffffff";for(let i=0;i<10;i++)ctx.fillRect(i*90,0,2,500);
        ctx.fillStyle="#8a5a2a";ctx.beginPath();ctx.ellipse(g.ball.x,g.ball.y,8,5,0,0,Math.PI*2);ctx.fill();
        g.pl.forEach((p2,i)=>{if(!p2||!i)return;ctx.fillStyle=i?"#ff72c8":"#64eaff";ctx.beginPath();ctx.arc(p2.x,p2.y,13,0,Math.PI*2);ctx.fill();});}
    });
  }
  if(owned.includes("game_doom")&&!document.getElementById("doomGame")){
    PD.micro({id:"doomGame",title:"Doomed Duel",desc:"Secret unlock game",cat:"action",key:"doom",win:3,
      controls:"P1: WASD + SPACE shoot · P2: ARROWS + ENTER — last demon standing",
      round(g){g.pl=[null,{x:200,y:250,r:15,hp:3},{x:700,y:250,r:15,hp:3}];g.shots=[];g.cd=[0,0];g.imps=[];},
      update(g,dt){g.cd[0]=Math.max(0,g.cd[0]-dt);g.cd[1]=Math.max(0,g.cd[1]-dt);
        g.pl.forEach((p2,i)=>{if(!p2||!i)return;const I=g.I[i];
          p2.x+=((I.r?1:0)-(I.l?1:0))*220*dt;p2.y+=((I.d?1:0)-(I.u?1:0))*220*dt;
          p2.x=Math.max(20,Math.min(880,p2.x));p2.y=Math.max(60,Math.min(480,p2.y));
          if(I.pa&&g.cd[i]<=0){g.cd[i]=.55;g.shots.push({x:p2.x+20,y:p2.y,vx:i?-420:420,owner:i});}});
        if(Math.random()<.02)g.imps.push({x:Math.random()<.5?-20:920,y:60+Math.random()*380,vx:(Math.random()<.5?1:-1)*(60+Math.random()*80),hp:2});
        for(const im of g.imps){im.x+=im.vx*dt;
          for(const s of g.shots){if(!s.dead&&Math.hypot(s.x-im.x,s.y-im.y)<18){s.dead=true;im.hp--;if(im.hp<=0){im.dead=true;g.burst(im.x,im.y,"#ff5878",12,240);}}}}
        for(const s of g.shots){s.x+=s.vx*dt;if(s.x<0||s.x>900)s.dead=true;}
        g.shots=g.shots.filter(s=>!s.dead);g.imps=g.imps.filter(i2=>!i2.dead);},
      draw(g,ctx){ctx.fillStyle="#1a0a0a";ctx.fillRect(0,0,900,500);
        for(let i=0;i<14;i++){ctx.fillStyle="rgba(255,80,40,.08)";ctx.fillRect(0,i*36,900,2);}
        for(const im of g.imps){ctx.fillStyle="#c84a4a";ctx.beginPath();ctx.arc(im.x,im.y,11,0,Math.PI*2);ctx.fill();}
        for(const s of g.shots){ctx.fillStyle="#ffe66d";ctx.fillRect(s.x-6,s.y-2,12,4);}
        g.pl.forEach((p2,i)=>{if(!p2||!i)return;ctx.fillStyle=i?"#ff72c8":"#64eaff";ctx.beginPath();ctx.arc(p2.x,p2.y,15,0,Math.PI*2);ctx.fill();});}
    });
  }
  // secret avatar painters
  if(window.PDX_FAVICON_ICONS)return;  // not needed here; avatar painting is in mega_shop
}
function registerSecretAvatars(){
  const p=prof();
  // avatars render through mega_shop AVATAR_PREVIEWS — inject ours
  if(window.PDX_SECRET_AVATAR_PREVIEWS)return;
  window.PDX_SECRET_AVATAR_PREVIEWS={
    av_pirate:x=>{const c=window.__drawDude||(x2=>{});x.fillStyle="#0a0e22";x.fillRect(0,0,120,160);
      x.fillStyle="#f3bd83";x.fillRect(46,50,28,40);          // face
      x.fillStyle="#1a1a2a";x.fillRect(44,46,32,10);          // bandana
      x.fillStyle="#e8443a";x.fillRect(44,46,32,4);
      x.fillStyle="#11152b";x.fillRect(52,66,5,6);x.fillRect(66,66,5,6);
      x.fillStyle="#8a5a2a";x.fillRect(40,60,6,26);x.fillRect(80,64,4,40);  // hair/sideburns
      x.fillStyle="#8a2a2a";x.fillRect(40,92,40,50);          // coat
      x.fillStyle="#fff";x.fillRect(52,96,16,22);
      x.fillStyle="#2a2a3a";x.fillRect(44,140,14,18);x.fillRect(64,140,14,18);
      x.fillStyle="#111";x.fillRect(58,62,3,4);              // eyepatch
      x.strokeStyle="#111";x.lineWidth=1;x.beginPath();x.moveTo(52,68);x.lineTo(60,62);x.stroke();},
    av_spartan:x=>{x.fillStyle="#0a0e22";x.fillRect(0,0,120,160);
      x.fillStyle="#4a8a3a";x.fillRect(46,92,30,50);           // armor
      x.fillStyle="#6aa85a";x.fillRect(46,92,30,8);
      x.fillStyle="#4a8a3a";x.fillRect(48,50,26,40);           // helmet
      x.fillStyle="#2a5a1a";x.fillRect(46,58,30,12);           // visor
      x.fillStyle="#a0ffa0";x.fillRect(50,62,22,6);
      x.fillStyle="#2a5a1a";x.fillRect(38,96,8,34);x.fillRect(76,96,8,34);  // shoulder pads
      x.fillStyle="#1a3a1a";x.fillRect(48,142,10,16);x.fillRect(64,142,10,16);}
  };
}

/* ---------- secret music tracks (added to shop music catalog) ---------- */
const SECRET_MUSIC={
  greenhill:{name:"GREEN HILL",desc:"Secret: sunny blue-zone bounce",notes:[392,440,494,587,440,392,330,392],type:"square",speed:170},
  badtime:{name:"BAD TIME",desc:"Secret: you're gonna have a bad time",notes:[110,116,110,98,110,98,92,98],type:"sawtooth",speed:140},
  epic:{name:"EPIC ORCHESTRA",desc:"Secret: brass & drums finale",notes:[130,164,196,261,196,164,130,98],type:"triangle",speed:260}
};
window.PDX_SECRET_MUSIC=SECRET_MUSIC;

/* ---------- season skip integration ---------- */
function applySeasonSkip(){
  const p=prof();
  const forced=p.secrets.seasonSkip||null;
  window.PDX_FORCE_SEASON=forced;
  // seasonal_themes.js + mega_shop.js read PDX_FORCE_SEASON via patched getSeason
  if(window.PDX_OVERRIDE_SEASON)window.PDX_OVERRIDE_SEASON(forced);
}
window.PDX_APPLY_SEASON_SKIP=applySeasonSkip;
applySeasonSkip();

/* ---------- clearing ---------- */
function clearSecrets(keepMeta){
  const p=prof();
  const removed=[];
  // music: remove secret tracks, revert to default if equipped
  if(p.ownedMusic){
    ["greenhill","badtime","epic"].forEach(t=>{
      const i=p.ownedMusic.indexOf(t);
      if(i>=0){p.ownedMusic.splice(i,1);removed.push(t);}
    });
    if(removed.includes(p.music))p.music="none";
  }
  // avatars: remove secret ones
  if(p.ownedAvatars){
    ["av_pirate","av_spartan"].forEach(a=>{
      const i=p.ownedAvatars.indexOf(a);
      if(i>=0){p.ownedAvatars.splice(i,1);removed.push(a);}
    });
  }
  // secret games: keep permanent unlocks (meta-games persist)
  // coins: reset bonus from secret codes but don't strip regular earnings
  p.secrets.bigBrain=false;
  p.secrets.impossibleAI=false;
  if(window.PDX_AI)window.PDX_AI.impossible=false;
  // season skip always resets on clear
  p.secrets.seasonSkip=null;applySeasonSkip();
  window.PDX_SAVE&&window.PDX_SAVE();
  window.showToast&&showToast(removed.length?("Cleared: "+removed.join(", ")):"No removable secrets active.");
}
window.PDX_CLEAR_SECRETS=()=>clearSecrets(false);

/* ---------- registration on load ---------- */
addEventListener("load",()=>{
  setTimeout(()=>{
    registerSecretGames();
    registerSecretAvatars();
    // merge secret music into the shop music catalog if mega shop exposes it
    if(window.PDX_MERGE_SECRET_MUSIC)window.PDX_MERGE_SECRET_MUSIC(SECRET_MUSIC);
  },1600);
});

/* ---------- the input UI (hidden by default) ---------- */
const overlay=document.createElement("div");
overlay.id="codeEntryOverlay";
overlay.style.cssText="position:fixed;inset:0;z-index:250000;background:rgba(4,6,16,.9);display:none;align-items:center;justify-content:center;font-family:'Courier New',monospace;";
overlay.innerHTML=`
  <div style="background:#0d1326;border:3px solid #63f59a;padding:26px;border-radius:10px;width:420px;color:#e0e8ff;">
    <h2 style="color:#63f59a;margin:0 0 4px;font-size:18px;">🔐 ENTER CODE</h2>
    <p style="color:#9fc0ff;font-size:12px;margin:0 0 14px;">Type a secret code and press Enter.</p>
    <input id="codeInput" type="text" placeholder="CODE" autocomplete="off" spellcheck="false"
      style="width:100%;box-sizing:border-box;padding:10px 12px;background:#0a0f24;border:2px solid #2a3260;color:#63f59a;font-family:monospace;font-size:16px;letter-spacing:3px;border-radius:6px;text-transform:uppercase;">
    <div id="codeMsg" style="margin-top:10px;font-size:12px;min-height:16px;color:#ff8a8a;"></div>
    <div style="margin-top:12px;display:flex;gap:8px;">
      <button id="codeGo" style="flex:1;padding:8px;background:#2a5a3a;border:1px solid #63f59a;color:#63f59a;font-family:monospace;cursor:pointer;border-radius:6px;">APPLY</button>
      <button id="codeClear" style="flex:1;padding:8px;background:#5a2a2a;border:1px solid #aa4444;color:#ff8a8a;font-family:monospace;cursor:pointer;border-radius:6px;">CLEAR SECRETS</button>
      <button id="codeClose" style="padding:8px 14px;background:#1a2050;border:1px solid #64eaff;color:#64eaff;font-family:monospace;cursor:pointer;border-radius:6px;">✕</button>
    </div>
  </div>`;
document.body.appendChild(overlay);

let buffer="";
function tryCode(code){
  const c=code.trim().toUpperCase();
  if(!c)return;
  const entry=CODES[c];
  const msg=document.getElementById("codeMsg");
  if(!entry){
    if(msg){msg.style.color="#ff8a8a";msg.textContent="Unknown code.";}
    return;
  }
  const p=prof();
  if(entry.once&&p.usedCodes&&p.usedCodes.includes(c)){
    if(msg){msg.style.color="#ffe66d";msg.textContent="Already used.";}
    return;
  }
  p.usedCodes=p.usedCodes||[];
  if(entry.once)p.usedCodes.push(c);
  try{entry.fn(p);}catch(e){}
  window.PDX_SAVE&&window.PDX_SAVE();
  if(msg){msg.style.color="#63f59a";msg.textContent="✓ "+(entry.desc||"Applied!");}
}
function showOverlay(){
  overlay.style.display="flex";
  const inp=document.getElementById("codeInput");
  if(inp){inp.value="";setTimeout(()=>inp.focus(),30);}
}
function hideOverlay(){overlay.style.display="none";}
document.getElementById("codeGo").addEventListener("click",()=>tryCode(document.getElementById("codeInput").value));
document.getElementById("codeClose").addEventListener("click",hideOverlay);
document.getElementById("codeClear").addEventListener("click",()=>{tryCode("SECRETCLEAR");});
document.getElementById("codeInput").addEventListener("keydown",e=>{
  if(e.key==="Enter"){tryCode(e.target.value);}
  if(e.key==="Escape"){hideOverlay();}
  e.stopPropagation();
});
overlay.addEventListener("click",e=>{if(e.target===overlay)hideOverlay();});

/* global trigger: Ctrl+Shift+C opens the code entry */
addEventListener("keydown",e=>{
  if(e.ctrlKey&&e.shiftKey&&(e.key==="C"||e.key==="c")){
    e.preventDefault();e.stopPropagation();
    overlay.style.display==="flex"?hideOverlay():showOverlay();
  }
});

/* also expose for settings */
window.PDX_SHOW_CODES=showOverlay;

console.log("[SecretCodes] Ready — Ctrl+Shift+C. Codes loaded:",Object.keys(CODES).length);

/* ---------- settings buttons ---------- */
function addSettingsButtons(){
  const panel=document.querySelector("#settingsPanel .settings-box");
  if(!panel||document.getElementById("codeBtns"))return;
  const div=document.createElement("div");
  div.id="codeBtns";
  div.style.cssText="margin-top:14px;padding-top:12px;border-top:1px solid #2a3260;display:flex;flex-direction:column;gap:8px;";
  div.innerHTML=
    '<h3 style="color:#63f59a;margin:0;font-size:14px;letter-spacing:1px;">&#128274; SECRET CODES</h3>'+
    '<button id="openCodes" style="padding:8px;background:#2a5a3a;border:1px solid #63f59a;color:#63f59a;font-family:inherit;font-size:12px;cursor:pointer;border-radius:6px;">ENTER CODE (Ctrl+Shift+C)</button>'+
    '<button id="clearCodes" style="padding:8px;background:#5a2a2a;border:1px solid #aa4444;color:#ff8a8a;font-family:inherit;font-size:12px;cursor:pointer;border-radius:6px;">CLEAR SECRETS</button>';
  panel.appendChild(div);
  document.getElementById("openCodes").addEventListener("click",function(){if(window.PDX_SHOW_CODES)window.PDX_SHOW_CODES();});
  document.getElementById("clearCodes").addEventListener("click",function(){if(window.PDX_CLEAR_SECRETS)window.PDX_CLEAR_SECRETS();});
}
function hookSettings(){
  const orig=window.toggleSettings;
  window.toggleSettings=function(){
    if(orig)orig.apply(this,arguments);
    setTimeout(addSettingsButtons,90);
  };
  const panel=document.getElementById("settingsPanel");
  if(panel)new MutationObserver(function(){
    if(panel.classList.contains("open"))setTimeout(addSettingsButtons,110);
  }).observe(panel,{attributes:true,attributeFilter:["class"]});
}
if(document.readyState==="loading")addEventListener("DOMContentLoaded",hookSettings);
else hookSettings();
setTimeout(hookSettings,800);
})();