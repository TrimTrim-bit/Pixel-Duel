/* =====================================================
   MULTIPLAYER — 3 to 6 players

   KEY RULE:
   - 3 players: 5 keys each (WASD+Space / Arrows+Enter / IJKL+O)
   - 4-6 players: 1 key each (Space / Enter / F / J / Q / P)

   5-key games are hidden for 4-6P.
   1-key games show for all counts.
===================================================== */
(function(){
"use strict";
const W=900,H=500;

const COLORS=["#64eaff","#ff72c8","#ffe66d","#63f59a","#ff8c42","#b07aff"];

const FIVE_KEY=[
  {u:"w",d:"s",l:"a",r:"d",a:" "},
  {u:"arrowup",d:"arrowdown",l:"arrowleft",r:"arrowright",a:"enter"},
  {u:"i",d:"k",l:"j",r:"l",a:"o"}
];

const SINGLE_KEYS=[" ","enter","f","j","q","p"];

function getPlayerSetup(count,keysPerPlayer){
  if(keysPerPlayer===1){
    return Array.from({length:count},(_,i)=>({
      name:"P"+(i+1),
      color:COLORS[i],
      keys:{a:SINGLE_KEYS[i],u:null,d:null,l:null,r:null},
      single:true
    }));
  }
  return Array.from({length:count},(_,i)=>({
    name:"P"+(i+1),
    color:COLORS[i],
    keys:FIVE_KEY[i],
    single:false
  }));
}

const MP_GAMES={};
function multiplayer(def){
  MP_GAMES[def.id]=def;
  return def;
}
window.PDX_MP={games:MP_GAMES,players:COLORS,multiplayer};
window.multiplayer=multiplayer;

function addMPButton(){
  const grid=document.querySelector("#menu .menu-buttons");
  if(!grid||document.getElementById("mpBtn"))return;
  const btn=document.createElement("button");
  btn.id="mpBtn";
  btn.className="game-card utility-card";
  btn.style.borderColor="#63f59a";
  btn.innerHTML=`<strong style="color:#63f59a">MULTIPLAYER (3-6P)</strong><small>Party games — 1 key for 4+ players</small>`;
  btn.onclick=openMPConfig;
  const ref=document.getElementById("aiMenuBlock")||grid.firstChild;
  ref.parentNode.insertBefore(btn,ref.nextSibling);
}

window.openMPConfig=function(){
  let sec=document.getElementById("mpConfigScreen");
  if(!sec){
    sec=document.createElement("section");
    sec.id="mpConfigScreen";
    sec.className="screen";
    sec.style.cssText="background:linear-gradient(135deg,#0a1a10,#0a0f24);min-height:100vh;padding:20px;";
    document.body.insertBefore(sec,document.querySelector(".touch-pad"));
  }
  document.querySelectorAll(".screen.active").forEach(s=>{if(s!==sec)s.classList.remove("active");});
  sec.classList.add("active");
  activeScreen="mpConfigScreen";
  renderMPConfig(sec);
};

let mpPlayerCount=4;
function renderMPConfig(sec){
  sec.innerHTML=`
    <button class="back" onclick="showMenu()">MENU</button>
    <h2 style="color:#63f59a;font-family:'Courier New',monospace;text-align:center;">🎮 MULTIPLAYER</h2>
    <div style="max-width:750px;margin:0 auto;text-align:center;">
      <div style="color:#9fc0ff;font-family:monospace;margin-bottom:12px;">How many players?</div>
      <div style="display:flex;gap:8px;justify-content:center;margin-bottom:20px;">
        ${[3,4,5,6].map(n=>`<button class="mp-count-btn" data-n="${n}"
          style="background:${n===mpPlayerCount?"#63f59a":"#1a2050"};color:${n===mpPlayerCount?"#080b18":"#63f59a"};
          border:2px solid #63f59a;padding:14px 22px;font-family:monospace;font-weight:bold;cursor:pointer;font-size:18px;">${n}P</button>`).join("")}
      </div>
      <div style="color:#9fc0ff;font-family:monospace;font-size:12px;margin-bottom:16px;line-height:1.8;">
        <strong style="color:#63f59a;">KEYS:</strong>
        ${mpPlayerCount<=3
          ? `<br>3-player mode uses 5 keys per player:<br>${["W/A/S/D + SPACE","ARROWS + ENTER","I/J/K/L + O"].slice(0,mpPlayerCount).map((k,i)=>`<span style="color:${COLORS[i]}">P${i+1}</span> — ${k}`).join(" · ")}`
          : `<br>${mpPlayerCount}-player mode uses <strong>1 key per player</strong>:<br>${SINGLE_KEYS.slice(0,mpPlayerCount).map((k,i)=>`<span style="color:${COLORS[i]}">P${i+1}</span> — ${k===" "?"SPACE":k.toUpperCase()}`).join(" · ")}`
        }
      </div>
      <div id="mpGameList" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;"></div>
    </div>
  `;
  sec.querySelectorAll(".mp-count-btn").forEach(b=>{
    b.onclick=()=>{mpPlayerCount=parseInt(b.dataset.n);renderMPConfig(sec);};
  });
  const list=sec.querySelector("#mpGameList");
  const available=Object.values(MP_GAMES).filter(def=>{
    if(mpPlayerCount<def.min||mpPlayerCount>def.max)return false;
    if(def.keysPerPlayer===5&&mpPlayerCount>3)return false;
    return true;
  });
  if(!available.length){
    list.innerHTML=`<div style="grid-column:1/-1;color:#9fc0ff;font-family:monospace;padding:20px;">No games available for ${mpPlayerCount} players in this build.</div>`;
    return;
  }
  available.forEach(def=>{
    const card=document.createElement("button");
    card.style.cssText="background:#141a3a;border:2px solid #63f59a;color:#fff;padding:14px;font-family:'Courier New',monospace;cursor:pointer;text-align:left;";
    const kp=def.keysPerPlayer===1?"1 KEY EACH":"5 KEYS EACH";
    card.innerHTML=`<div style="color:#63f59a;font-weight:bold;font-size:15px;margin-bottom:4px;">${def.title}</div>
                    <div style="color:#9fc0ff;font-size:11px;">${def.desc}</div>
                    <div style="color:#ffe66d;font-size:10px;margin-top:6px;">${def.min}-${def.max}P · ${kp}</div>`;
    card.onclick=()=>startMPGame(def.id);
    list.appendChild(card);
  });
}

let mpLoopToken=0;
window.startMPGame=function(id){
  const def=MP_GAMES[id];
  if(!def)return;
  let old=document.getElementById("mpPlayScreen");
  if(old)old.remove();
  const sec=document.createElement("section");
  sec.id="mpPlayScreen";
  sec.className="screen";
  document.body.insertBefore(sec,document.querySelector(".touch-pad"));
  document.querySelectorAll(".screen.active").forEach(s=>{if(s!==sec)s.classList.remove("active");});
  sec.classList.add("active");
  activeScreen="mpPlayScreen";
  sec.innerHTML=`
    <button class="back" onclick="exitMPGame()">MENU</button>
    <h2 style="text-align:center;font-family:'Courier New',monospace;color:#63f59a;">${def.title.toUpperCase()}</h2>
    <canvas id="mpCanvas" width="900" height="500" style="display:block;margin:0 auto;max-width:100%;"></canvas>
    <div id="mpStatus" style="text-align:center;color:#9fc0ff;font-family:'Courier New',monospace;padding:10px;"></div>
    <div style="text-align:center;"><button onclick="startMPGame('${id}')" style="background:#1a2050;color:#63f59a;border:2px solid #63f59a;padding:10px 20px;font-family:monospace;cursor:pointer;">RESTART</button></div>
  `;
  const cv=sec.querySelector("#mpCanvas");
  const ctx=cv.getContext("2d");
  const msg=sec.querySelector("#mpStatus");

  const g={
    w:W,h:H,t:0,
    players:[],
    mode:"play",banner:"",bannerT:0,winner:null,
    parts:[],finished:[],
    ctx,msg,
    inputs:[],prev:{},
    text(s,x,y,size,color,align){
      ctx.font=`bold ${size||16}px Courier New`;ctx.textAlign=align||"left";
      ctx.fillStyle="#080b18";ctx.fillText(s,x+2,y+2);
      ctx.fillStyle=color||"#fff";ctx.fillText(s,x,y);ctx.textAlign="left";
    },
    burst(x,y,c,n,sp){
      for(let i=0;i<(n||10);i++){
        g.parts.push({x,y,vx:(Math.random()-.5)*(sp||260),vy:(Math.random()-.5)*(sp||260),
          life:.5+Math.random()*.3,maxLife:.8,color:c});
      }
    },
    end(winnerIdx){
      if(g.mode==="over")return;
      g.mode="over";g.winner=winnerIdx;
      msg.textContent=winnerIdx>=0?`${g.players[winnerIdx].name} WINS!`:"DRAW";
      if(window.playWinSound)playWinSound();
      if(winnerIdx>=0&&window.recordWin)recordWin(id,"p"+(winnerIdx+1));
    },
    done(){
      const active=[];
      for(let i=0;i<g.players.length;i++)if(!g.finished[i])active.push(i);
      if(active.length===1)g.end(active[0]);
      else if(active.length===0)g.end(-1);
    }
  };

  const setup=getPlayerSetup(mpPlayerCount,def.keysPerPlayer||5);
  for(let i=0;i<setup.length;i++){
    const p=setup[i];
    g.players.push({
      idx:i,name:p.name,color:p.color,keys:p.keys,
      x:0,y:0,vx:0,vy:0,score:0,alive:true,extra:{}
    });
    g.finished[i]=false;
  }

  const token=++mpLoopToken;

  function readInputs(){
    g.inputs=g.players.map(p=>{
      const k=p.keys;
      const np={};
      for(const key of ["u","d","l","r","a"]){
        if(!k[key]){np[key]=false;continue;}
        const cur=!!keys[k[key]];
        const was=!!g.prev[p.idx+"_"+key];
        np[key]=cur&&!was;
        g.prev[p.idx+"_"+key]=cur;
      }
      return {
        u:k.u?!!keys[k.u]:false,
        d:k.d?!!keys[k.d]:false,
        l:k.l?!!keys[k.l]:false,
        r:k.r?!!keys[k.r]:false,
        a:k.a?!!keys[k.a]:false,
        pu:np.u,pd:np.d,pl:np.l,pr:np.r,pa:np.a
      };
    });
  }

  def.init(g);
  msg.textContent=def.hint||"";

  let last=performance.now();
  function loop(now){
    if(token!==mpLoopToken)return;
    if(activeScreen!=="mpPlayScreen")return;
    const dt=Math.min((now-last)/1000,.04);last=now;
    readInputs();
    g.t+=dt;
    for(let i=g.parts.length-1;i>=0;i--){
      const p=g.parts[i];
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;p.life-=dt;
      if(p.life<=0)g.parts.splice(i,1);
    }
    if(g.bannerT>0)g.bannerT-=dt;
    if(g.mode==="play")def.update(g,dt);
    def.draw(g,ctx);
    for(const p of g.parts){
      ctx.globalAlpha=Math.max(0,p.life/p.maxLife);
      ctx.fillStyle=p.color;
      ctx.fillRect(p.x,p.y,4,4);
    }
    ctx.globalAlpha=1;
    if(g.bannerT>0){
      ctx.font="bold 30px Courier New";ctx.textAlign="center";
      ctx.fillStyle="#080b18";ctx.fillText(g.banner,W/2+2,H/2+2);
      ctx.fillStyle="#ffe66d";ctx.fillText(g.banner,W/2,H/2);
      ctx.textAlign="left";
    }
    if(g.mode==="over"){
      ctx.fillStyle="rgba(8,11,24,.85)";ctx.fillRect(200,200,500,100);
      ctx.strokeStyle="#ffe66d";ctx.lineWidth=3;ctx.strokeRect(200,200,500,100);
      ctx.font="bold 28px Courier New";ctx.textAlign="center";
      ctx.fillStyle="#ffe66d";
      ctx.fillText(g.winner<0?"DRAW":`${g.players[g.winner].name} WINS!`,W/2,250);
      ctx.font="14px Courier New";ctx.fillStyle="#9fc0ff";
      ctx.fillText("PRESS RESTART TO PLAY AGAIN",W/2,280);
      ctx.textAlign="left";
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
};
window.exitMPGame=function(){
  mpLoopToken++;
  const s=document.getElementById("mpPlayScreen");
  if(s)s.remove();
  window.showMenu();
};

addEventListener("keydown",e=>{
  if(activeScreen!=="mpPlayScreen")return;
  const k=e.key.toLowerCase();
  const prevent=[" ","enter","f","j","q","p","w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","i","k","l","o","t","g","h","y","8","2","4","6","0","9","3","7","1","5"];
  if(prevent.includes(k))e.preventDefault();
},true);

addEventListener("load",()=>setTimeout(addMPButton,500));
setTimeout(addMPButton,900);

})();