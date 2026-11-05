/* =====================================================
   GAME FIXES — Re-registers fixed versions of games
   that were on the redesign wishlist.

   Runs after all game packs. Uses unregister → re-register
   pattern (removes old DOM/catalog entry, then PD.micro
   adds new one).
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

function unregister(id){
  const sec=document.getElementById(id);
  if(sec)sec.remove();
  const card=document.querySelector(`.game-card[data-id="${id}"]`);
  if(card)card.remove();
  const idx=(window.PDX_CATALOG||[]).findIndex(g=>g.id===id);
  if(idx>=0)window.PDX_CATALOG.splice(idx,1);
  delete window.GAME_HOOKS[id];
  const oldCv=document.getElementById(id+"Cv");
  if(oldCv){const c=oldCv.getContext("2d");if(c)c.clearRect(0,0,900,500);}
}

/* MOLE MASH — clearer controls display */
unregister("moleGame");
micro({id:"moleGame",title:"Mole Mash",desc:"Hit the correct key before your rival",
cat:"reflex",key:"mole",win:10,
controls:"P1 uses the BLUE keys · P2 uses the PINK keys — mash the key that lights up",
round(g){
  g.hole=-1;g.tm=.7;g.lock=[0,0];g.gold=false;g.pop=0;
},
update(g,dt){
  g.pop+=dt;
  g.lock=g.lock.map(x=>Math.max(0,x-dt));
  g.tm-=dt;
  if(g.tm<=0){
    if(g.hole<0){g.hole=ri(0,8);g.gold=Math.random()<.15;g.tm=rnd(.9,1.5);g.pop=0;}
    else{g.hole=-1;g.tm=rnd(.25,.6);}
  }
  const P1K=["q","w","e","a","s","d","z","x","c"];
  const P2K=["u","i","o","j","k","l","m",",","."];
  for(let i=0;i<2;i++){
    if(g.lock[i]>0)continue;
    const keysArr=i?P2K:P1K;
    for(let k=0;k<9;k++){
      if(g.pk[keysArr[k]]&&k===g.hole){
        const v=g.gold?2:1;
        for(let n=0;n<v;n++)g.add(i);
        g.burst(300+(k%3)*150,150+Math.floor(k/3)*110,col(i),12,260);
        FX.tone(g.gold?1100:800,.08,"square",.05,300);
        g.hole=-1;g.tm=rnd(.3,.6);
        break;
      }
    }
  }
},
draw(g,ctx){
  ctx.fillStyle="#2a5a2a";ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#2f6a30";for(let x=0;x<W;x+=60)ctx.fillRect(x,0,30,H);
  const P1K=["Q","W","E","A","S","D","Z","X","C"];
  const P2K=["U","I","O","J","K","L","M",",","."];
  for(let k=0;k<9;k++){
    const x=300+(k%3)*150,y=150+Math.floor(k/3)*110;
    ctx.fillStyle="#1a0f08";ctx.beginPath();ctx.ellipse(x,y+10,48,18,0,0,Math.PI*2);ctx.fill();
    if(g.hole===k){
      const up=Math.min(1,g.pop/.12);
      ctx.save();ctx.beginPath();ctx.rect(x-60,y-70,120,80);ctx.clip();
      ctx.fillStyle=g.gold?GOLD:"#8a5a3a";ctx.fillRect(x-28,y-50+(1-up)*60,56,60);
      ctx.beginPath();ctx.arc(x,y-50+(1-up)*60,28,Math.PI,0);ctx.fill();
      ctx.fillStyle="#fff";ctx.fillRect(x-16,y-48+(1-up)*60,10,10);ctx.fillRect(x+6,y-48+(1-up)*60,10,10);
      ctx.fillStyle="#11152b";ctx.fillRect(x-12,y-44+(1-up)*60,5,5);ctx.fillRect(x+10,y-44+(1-up)*60,5,5);
      ctx.restore();
    }
    ctx.fillStyle="#2f1a0d";ctx.fillRect(x-48,y+6,96,8);
    ctx.fillStyle=C1;ctx.fillRect(x-90,y-6,34,26);
    ctx.fillStyle="#fff";ctx.font="bold 20px Courier New";ctx.textAlign="center";
    ctx.fillText(P1K[k],x-73,y+14);
    ctx.fillStyle=C2;ctx.fillRect(x+56,y-6,34,26);
    ctx.fillStyle="#fff";ctx.fillText(P2K[k],x+73,y+14);
    ctx.textAlign="left";
  }
  for(let i=0;i<2;i++){
    g.text("P"+(i+1)+"  "+g.score[i]+"/10",i?W-20:20,40,22,col(i),i?"right":"left");
    if(g.lock[i]>0)g.text("WRONG KEY",i?675:225,460,18,RED,"center");
  }
}
});

/* BULLSEYE — visible aim line */
unregister("bullseyeGame");
micro({id:"bullseyeGame",title:"Bullseye",desc:"Aim, charge, throw. Wind pushes your dart.",
cat:"reflex",key:"bullseye",win:3,
controls:"P1: A/D aim, hold W → release　 P2: ←/→, hold ↑ — dotted aim line shows your target",
round(g){
  g.pl=[
    {aim:0,power:0,charging:false,darts:0,score:0,throw:null,throwT:0},
    {aim:0,power:0,charging:false,darts:0,score:0,throw:null,throwT:0}
  ];
  g.wind=rnd(-1,1);
  g.turn=0;
},
update(g,dt){
  const p=g.pl[g.turn],I=g.I[g.turn];
  if(p.throw){
    p.throwT+=dt;
    if(p.throwT>.7){
      p.throw=null;
      if(g.pl[0].darts>=5&&g.pl[1].darts>=5){
        const a=g.pl[0].score,b=g.pl[1].score;
        if(a>b)g.point(0,"HIGH SCORE");
        else if(b>a)g.point(1,"HIGH SCORE");
        else g.next("TIE");
      }else{g.wind=rnd(-1,1);g.turn=1-g.turn;}
    }
    return;
  }
  if(!p.charging){
    if(I.l)p.aim-=1.5*dt;
    if(I.r)p.aim+=1.5*dt;
    p.aim=cl(p.aim,-1.5,1.5);
    if(I.u){p.charging=true;p.power=0;}
  }else{
    p.power=Math.min(1,p.power+dt*1.2);
    if(!I.u){
      const tx=W/2+Math.sin(p.aim)*p.power*180+g.wind*p.power*80;
      const ty=200+p.power*40;
      const d=Math.hypot(tx-W/2,ty-200);
      let pts=0;
      if(d<15)pts=100;else if(d<40)pts=50;else if(d<80)pts=20;else if(d<140)pts=5;
      p.score+=pts;p.darts++;
      p.throw={x:tx,y:ty,pts};p.throwT=0;
      p.charging=false;p.power=0;
      FX.tone(pts>50?900:500+pts*3,.15,"square",.05,pts*3);
    }
  }
},
draw(g,ctx){
  ctx.fillStyle="#1a1a3a";ctx.fillRect(0,0,W,H);
  [[80,"#4a4a6a"],[40,"#8a3a3a"],[15,"#ffd24a"]].forEach(([r,c])=>{
    ctx.fillStyle=c;ctx.beginPath();ctx.arc(W/2,200,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
  });
  [0,1].forEach(p=>{
    const pl=g.pl[p];
    if(pl.throw){
      ctx.fillStyle=col(p);ctx.beginPath();ctx.arc(pl.throw.x,pl.throw.y,6,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
    }
  });
  const p=g.pl[g.turn];
  const power=p.charging?p.power:0.5;
  const tx=W/2+Math.sin(p.aim)*power*180+g.wind*power*80;
  const ty=200+power*40;
  ctx.strokeStyle=col(g.turn);ctx.lineWidth=2;ctx.setLineDash([6,6]);
  ctx.beginPath();ctx.moveTo(W/2,H-40);ctx.lineTo(tx,ty);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle=col(g.turn);
  ctx.beginPath();ctx.arc(tx,ty,8,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();
  g.text("WIND: "+(g.wind<0?"◀ ":"")+Math.abs(g.wind*100).toFixed(0)+(g.wind>0?" ▶":""),W/2,H-60,16,"#fff","center");
  g.text("P1: "+g.pl[0].score+" ("+g.pl[0].darts+"/5)",20,40,16,C1);
  g.text("P2: "+g.pl[1].score+" ("+g.pl[1].darts+"/5)",W-20,40,16,C2,"right");
  g.text("P"+(g.turn+1)+"'S THROW",W/2,60,16,col(g.turn),"center");
}
});

/* SKYCLIMB — fair gap distances */
unregister("skyGame");
micro({id:"skyGame",title:"Sky Climb",desc:"Bounce up the clouds, don't fall",
cat:"action",key:"sky",win:3,
controls:"P1: A / D steer　 P2: ← / → — you bounce automatically. Reach the top or outlast your rival.",
round(g){
  const r=seeded(ri(1,1e6));
  g.plats=[{x:225,y:480,w:220}];
  let y=480;
  while(y>-3300){y-=ri(50,68);g.plats.push({x:r()*390+30,y,w:88});}
  g.p=[0,1].map(()=>({x:225,y:440,vy:-720,cam:0}));
},
update(g,dt){
  const dead=[false,false],won=[false,false];
  g.p.forEach((p,i)=>{
    const I=g.I[i];
    p.x=(p.x+((I.r?1:0)-(I.l?1:0))*290*dt+450)%450;
    const ob=p.y+14;
    p.vy+=1500*dt;p.y+=p.vy*dt;
    if(p.vy>0){
      for(const pl of g.plats){
        if(ob<=pl.y+2&&p.y+14>=pl.y&&Math.abs(p.x-pl.x)<pl.w/2+8){p.vy=-720;p.y=pl.y-14;FX.tone(500,.05,"square",.025,200);break;}
      }
    }
    p.cam=Math.min(p.cam,p.y-300);
    if(p.y>p.cam+540)dead[i]=true;
    if(p.y<-3250)won[i]=true;
  });
  if(won[0]&&won[1])g.next("PHOTO FINISH");
  else if(won[0])g.point(0);else if(won[1])g.point(1);
  else if(dead[0]&&dead[1])g.next("BOTH FELL");
  else if(dead[0])g.point(1);else if(dead[1])g.point(0);
},
draw(g,ctx){
  for(let i=0;i<2;i++){
    const p=g.p[i],off=i*450,cam=p.cam;
    ctx.save();ctx.beginPath();ctx.rect(off,0,450,H);ctx.clip();
    const k=cl(-p.y/3300,0,1);
    ctx.fillStyle=`rgb(${Math.round(70-50*k)},${Math.round(150-110*k)},${Math.round(230-150*k)})`;ctx.fillRect(off,0,450,H);
    for(const pl of g.plats){
      const y=pl.y-cam;if(y<-20||y>H+20)continue;
      ctx.fillStyle="#3ac060";ctx.fillRect(off+pl.x-pl.w/2,y,pl.w,10);
      ctx.fillStyle="#7a5a3a";ctx.fillRect(off+pl.x-pl.w/2,y+10,pl.w,6);
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(off+pl.x-pl.w/2,y,pl.w,16);
    }
    ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(off+p.x,p.y-cam,13,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
    ctx.restore();
    g.text(Math.max(0,Math.round(-p.y/10))+"m",off+225,40,20,col(i),"center");
  }
  ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* ROCKET CHASE — deadlier, more visible rockets */
unregister("rocketchaseGame");
micro({id:"rocketchaseGame",title:"Rocket Chase",desc:"Fire homing rockets. Dodge to redirect.",
cat:"action",key:"rocketchase",win:3,
controls:"P1: WASD, SPACE fire　 P2: ARROWS, ENTER — rockets aggressively home in on your rival",
round(g){
  g.pl=[{x:200,y:250,hp:3,cd:0},{x:700,y:250,hp:3,cd:0}];
  g.rockets=[];
},
update(g,dt){
  g.pl.forEach((p,i)=>{
    const I=g.I[i];
    p.cd=Math.max(0,p.cd-dt);
    p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*240*dt,20,W-20);
    p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*240*dt,60,H-20);
    if(I.a&&p.cd<=0){
      p.cd=1.5;
      g.rockets.push({x:p.x,y:p.y,vx:(i?-250:250),vy:0,o:i,life:7,turn:.6,t:0});
      FX.tone(400,.15,"sawtooth",.03,300);
    }
  });
  g.rockets.forEach(r=>{
    r.life-=dt;r.t+=dt;
    r.turn=Math.max(0,r.turn-dt*.12);
    const target=g.pl[1-r.o];
    const dx=target.x-r.x,dy=target.y-r.y,d=Math.hypot(dx,dy)||1;
    const turnRate=4+r.turn*5;
    const tvx=dx/d*380,tvy=dy/d*380;
    r.vx+=(tvx-r.vx)*turnRate*dt;
    r.vy+=(tvy-r.vy)*turnRate*dt;
    const sp=Math.hypot(r.vx,r.vy);
    if(sp>460){r.vx*=460/sp;r.vy*=460/sp;}
    r.x+=r.vx*dt;r.y+=r.vy*dt;
    if(r.x<0||r.x>W||r.y<0||r.y>H)r.dead=true;
    if(Math.hypot(r.x-target.x,r.y-target.y)<24){
      r.dead=true;target.hp--;
      g.burst(target.x,target.y,col(r.o),24,400);playHitSound();
    }
  });
  g.rockets=g.rockets.filter(r=>!r.dead&&r.life>0);
  if(g.pl[0].hp<=0&&g.pl[1].hp<=0)g.next("DRAW");
  else if(g.pl[0].hp<=0)g.point(1,"P2 WINS");
  else if(g.pl[1].hp<=0)g.point(0,"P1 WINS");
},
draw(g,ctx){
  ctx.fillStyle="#1a1a3a";ctx.fillRect(0,0,W,H);
  g.rockets.forEach(r=>{
    const ang=Math.atan2(r.vy,r.vx);
    ctx.save();ctx.translate(r.x,r.y);ctx.rotate(ang);
    for(let k=1;k<=4;k++){
      ctx.fillStyle=`rgba(255,140,60,${0.5-k*0.1})`;
      ctx.beginPath();ctx.arc(-k*8,0,8-k*1.5,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle=col(r.o);ctx.fillRect(-10,-6,20,12);
    ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(-10,-6,20,12);
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=GOLD;ctx.beginPath();ctx.moveTo(10,-4);ctx.lineTo(16,0);ctx.lineTo(10,4);ctx.closePath();ctx.fill();
    ctx.restore();
  });
  g.pl.forEach((p,i)=>{
    ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(p.x-4,p.y-4,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,6);
    ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/3,6);
  });
}
});

/* GLASS BRIDGE — status no longer changes */
unregister("glassGame");
micro({id:"glassGame",title:"Glass Bridge",desc:"Pick the safe glass panel. Wrong ones shatter.",
cat:"brain",key:"glass",win:3,
controls:"P1: A (left) or D (right)　 P2: ← or → — safe panels are FIXED for the round",
round(g){
  g.safe=Array.from({length:8},()=>ri(0,1));
  g.pos=[0,0];g.br=Array.from({length:8},()=>[false,false]);g.cd=[0,0];
},
update(g,dt){
  for(let i=0;i<2;i++){
    g.cd[i]=Math.max(0,g.cd[i]-dt);
    const I=g.I[i],d=I.pl?0:I.pr?1:-1;
    if(d<0||g.cd[i]>0)continue;
    const s=g.pos[i];
    if(s>=8)continue;
    if(g.safe[s]===d){
      g.pos[i]++;g.cd[i]=.18;
      FX.tone(500+s*50,.06,"square",.04);
      if(g.pos[i]>=8){g.point(i,"ACROSS!");return;}
    }else{
      g.br[s][d]=true;
      g.burst(450+(d?70:-70),430-s*48,"#bfe7ff",24,380);FX.playBoom();
      g.pos[i]=-1;g.point(1-i,i?"P2 FELL":"P1 FELL");return;
    }
  }
},
draw(g,ctx){
  const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#1a2a5a");gr.addColorStop(1,"#0a0f2a");
  ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  for(let k=0;k<8;k++){
    const y=430-k*48;
    for(let d=0;d<2;d++){
      const x=450+(d?70:-70)-52;
      if(g.br[k][d]){
        ctx.strokeStyle="rgba(191,231,255,.3)";ctx.lineWidth=2;ctx.strokeRect(x,y-18,104,36);
        ctx.beginPath();ctx.moveTo(x,y-18);ctx.lineTo(x+52,y);ctx.lineTo(x+104,y-18);ctx.stroke();
        continue;
      }
      ctx.fillStyle="rgba(191,231,255,.35)";ctx.fillRect(x,y-18,104,36);
      ctx.strokeStyle="#dff6ff";ctx.lineWidth=3;ctx.strokeRect(x,y-18,104,36);
      ctx.fillStyle="rgba(255,255,255,.25)";ctx.fillRect(x+6,y-14,40,5);
    }
  }
  ctx.fillStyle="#3a3f6a";ctx.fillRect(330,456,240,20);
  ctx.fillStyle="#5a60a0";ctx.fillRect(330,70,240,20);
  g.text("FINISH",450,58,16,GREEN,"center");
  g.text("START",450,494,14,"#9fc0ff","center");
  for(let i=0;i<2;i++){
    const p=g.pos[i];if(p<0)continue;
    let x=450+(i?36:-36),y=436;
    if(p>0){const k=p-1;x=450+(g.safe[k]?70:-70)+(i?16:-16);y=430-k*48-20;}
    ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
  }
}
});

/* LIGHTS OUT — bigger, clearer grid */
unregister("lightsoutGame");
function lightsNew(){
  const g=[];
  for(let r=0;r<4;r++){const row=[];for(let c=0;c<4;c++)row.push(Math.random()<.5);g.push(row);}
  for(let k=0;k<4;k++){const r=ri(0,3),c=ri(0,3);toggleCell(g,r,c);}
  return g;
}
function toggleCell(g,r,c){
  for(const [dr,dc] of[[0,0],[1,0],[-1,0],[0,1],[0,-1]]){
    const nr=r+dr,nc=c+dc;
    if(nr>=0&&nc>=0&&nr<4&&nc<4)g[nr][nc]=!g[nr][nc];
  }
}
function lightsSolved(g){return g.every(row=>row.every(v=>!v));}
micro({id:"lightsoutGame",title:"Lights Out",desc:"Toggle lights to turn them all off.",
cat:"brain",key:"lightsout",win:3,
controls:"Click a cell to toggle it and its 4 neighbors. Turn all lights off to win the round.",
round(g){g.grids=[lightsNew(),lightsNew()];},
click(g,x,y){
  for(let p=0;p<2;p++){
    const ox=p?560:140,oy=130,sz=55;
    if(x>ox&&x<ox+sz*4&&y>oy&&y<oy+sz*4){
      const c=Math.floor((x-ox)/sz),r=Math.floor((y-oy)/sz);
      toggleCell(g.grids[p],r,c);
      FX.tone(400,.05,"square",.03);
      if(lightsSolved(g.grids[p]))g.point(p,"SOLVED");
      return;
    }
  }
},
draw(g,ctx){
  ctx.fillStyle="#0a1020";ctx.fillRect(0,0,W,H);
  for(let p=0;p<2;p++){
    const ox=p?560:140,oy=130,sz=55;
    ctx.fillStyle="#1a2548";ctx.fillRect(ox-6,oy-6,sz*4+12,sz*4+12);
    ctx.strokeStyle=col(p);ctx.lineWidth=2;ctx.strokeRect(ox-6,oy-6,sz*4+12,sz*4+12);
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){
      const x=ox+c*sz,y=oy+r*sz;
      ctx.fillStyle=g.grids[p][r][c]?GOLD:"#2a3a5a";
      ctx.fillRect(x+2,y+2,sz-4,sz-4);
      ctx.strokeStyle="#080b18";ctx.lineWidth=1;ctx.strokeRect(x+2,y+2,sz-4,sz-4);
    }
    g.text("P"+(p+1),ox+sz*2,110,20,col(p),"center");
  }
  ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* FISHING DUEL — visible action */
unregister("fishingGame");
micro({id:"fishingGame",title:"Fishing Duel",desc:"Cast your line and time the catch.",
cat:"reflex",key:"fishing",win:3,
controls:"P1: hold W to cast, release to hook, SPACE to snap　 P2: hold ↑, ENTER — stop the bar in the green",
round(g){
  g.pl=[
    {state:"cast",charge:0,barT:0,barDir:1,caught:0,fishPos:ri(200,600),resultT:0},
    {state:"cast",charge:0,barT:0,barDir:1,caught:0,fishPos:ri(200,600),resultT:0}
  ];
},
update(g,dt){
  for(let p=0;p<2;p++){
    const pl=g.pl[p],I=g.I[p];
    if(pl.state==="cast"){
      if(I.u)pl.charge=Math.min(1,pl.charge+dt*1.5);
      else if(pl.charge>0){
        pl.charge=0;pl.state="hook";
        pl.barT=0;pl.barDir=1;
        pl.fishPos=ri(200,600);
      }
    }else if(pl.state==="hook"){
      pl.barT+=pl.barDir*dt*2.5;
      if(pl.barT>1){pl.barT=1;pl.barDir=-1;}
      if(pl.barT<0){pl.barT=0;pl.barDir=1;}
      if(I.a){
        const target=(pl.fishPos-200)/400;
        const diff=Math.abs(pl.barT-target);
        if(diff<.08){
          pl.caught++;pl.state="result";
          FX.playScore();
          g.burst(p?675:225,300,GOLD,12,250);
          if(pl.caught>=3)g.point(p,"FISHED!");
        }else{
          pl.state="result";
          FX.tone(150,.1,"square",.03);
        }
        pl.resultT=.8;
      }
    }else if(pl.state==="result"){
      pl.resultT-=dt;
      if(pl.resultT<=0){pl.state="cast";pl.charge=0;}
    }
  }
},
draw(g,ctx){
  const gr=ctx.createLinearGradient(0,0,0,H);
  gr.addColorStop(0,"#0a3a5a");gr.addColorStop(.7,"#0a2a5a");gr.addColorStop(1,"#0a1a3a");
  ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  for(let p=0;p<2;p++){
    const off=p*450;
    ctx.fillStyle="rgba(255,255,255,.05)";ctx.fillRect(off,0,450,H);
    const pl=g.pl[p];
    ctx.fillStyle="rgba(100,200,255,.2)";
    for(let k=0;k<10;k++){ctx.fillRect(off+k*45,250+Math.sin(g.t+k)*3,30,2);}
    if(pl.state==="hook"||pl.state==="result"){
      const fishX=off+(pl.fishPos-200)/400*450+50;
      const fishY=300;
      ctx.strokeStyle="rgba(255,255,255,.6)";ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(off+225,120);ctx.lineTo(fishX,fishY);ctx.stroke();
      ctx.fillStyle="#ff9a3a";
      ctx.beginPath();ctx.ellipse(fishX,fishY,20,10,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#fff";ctx.fillRect(fishX+8,fishY-3,4,4);
    }
    if(pl.state==="hook"){
      const barX=off+130,barY=440,barW=190,barH=25;
      ctx.fillStyle="#2a2f63";ctx.fillRect(barX,barY,barW,barH);
      const target=(pl.fishPos-200)/400;
      ctx.fillStyle=GREEN;
      ctx.fillRect(barX+target*barW-barW*.04,barY,barW*.08,barH);
      ctx.fillStyle=GOLD;
      ctx.fillRect(barX+pl.barT*barW-3,barY,6,barH);
    }
    g.text("P"+(p+1)+" caught: "+pl.caught,off+225,40,20,col(p),"center");
    if(pl.state==="cast"){
      ctx.fillStyle="#2a2f63";ctx.fillRect(off+150,150,150,20);
      ctx.fillStyle=col(p);ctx.fillRect(off+150,150,150*pl.charge,20);
      g.text(p?"HOLD ↑ TO CAST":"HOLD W TO CAST",off+225,190,14,col(p),"center");
    }else if(pl.state==="hook"){
      g.text(p?"PRESS ENTER":"PRESS SPACE",off+225,410,14,col(p),"center");
    }else if(pl.state==="result"){
      g.text("...",off+225,410,20,GOLD,"center");
    }
  }
  ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* MINI SOCCER — bigger ball, better sprites */
unregister("soccerGame");
micro({id:"soccerGame",title:"Mini Soccer",desc:"Top-down football, first to 5",
cat:"sports",key:"soccer",win:5,
controls:"P1: W/A/S/D + SPACE kick　 P2: ARROWS + ENTER kick",
round(g){
  g.pl=[
    {x:200,y:250,r:22,color:C1,vx:0,vy:0,fx:1,fy:0},
    {x:700,y:250,r:22,color:C2,vx:0,vy:0,fx:-1,fy:0}
  ];
  g.ball={x:450,y:250,vx:0,vy:0,r:18};
},
update(g,dt){
  const b=g.ball;
  g.pl.forEach((p,i)=>{
    const I=g.I[i];
    let dx=(I.r?1:0)-(I.l?1:0),dy=(I.d?1:0)-(I.u?1:0);
    const l=Math.hypot(dx,dy);
    if(l){dx/=l;dy/=l;p.fx=dx;p.fy=dy;}
    p.vx=dx*225;p.vy=dy*225;
    p.x+=p.vx*dt;p.y+=p.vy*dt;
    p.x=cl(p.x,p.r,W-p.r);p.y=cl(p.y,p.r+30,H-p.r);
    const d=Math.hypot(p.x-b.x,p.y-b.y);
    if(d<p.r+b.r&&d>0){
      const nx=(b.x-p.x)/d,ny=(b.y-p.y)/d;
      b.x=p.x+nx*(p.r+b.r);b.y=p.y+ny*(p.r+b.r);
      const sp=Math.max(260,Math.hypot(b.vx,b.vy)*.7);
      b.vx=nx*sp+p.vx*.6;b.vy=ny*sp+p.vy*.6;
      FX.tone(220,.05,"square",.03);
    }
    if(g.I[i].pa&&d<p.r+b.r+16){
      const nx=(b.x-p.x)/(d||1),ny=(b.y-p.y)/(d||1);
      b.vx=nx*640;b.vy=ny*640;
      g.burst(b.x,b.y,"#fff",6,180);
      FX.tone(160,.08,"square",.05,-60);
    }
  });
  b.x+=b.vx*dt;b.y+=b.vy*dt;b.vx*=.987;b.vy*=.987;
  if(b.y<b.r+30){b.y=b.r+30;b.vy=Math.abs(b.vy);}
  if(b.y>H-b.r){b.y=H-b.r;b.vy=-Math.abs(b.vy);}
  const mouth=b.y>185&&b.y<315;
  if(b.x<b.r&&!mouth){b.x=b.r;b.vx=Math.abs(b.vx);}
  if(b.x>W-b.r&&!mouth){b.x=W-b.r;b.vx=-Math.abs(b.vx);}
  if(b.x<-b.r){g.burst(20,b.y,C2,30,400);g.point(1,"GOAL P2!");}
  if(b.x>W+b.r){g.burst(880,b.y,C1,30,400);g.point(0,"GOAL P1!");}
},
draw(g,ctx){
  ctx.fillStyle="#1f6b3a";ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#23773f";for(let x=0;x<W;x+=100){ctx.fillRect(x,0,50,H);}
  ctx.strokeStyle="rgba(255,255,255,.7)";ctx.lineWidth=3;
  ctx.strokeRect(6,36,W-12,H-42);
  ctx.beginPath();ctx.moveTo(450,36);ctx.lineTo(450,H-6);ctx.stroke();
  ctx.beginPath();ctx.arc(450,268,60,0,Math.PI*2);ctx.stroke();
  ctx.strokeRect(6,150,90,200);ctx.strokeRect(W-96,150,90,200);
  ctx.fillStyle="rgba(255,255,255,.18)";ctx.fillRect(0,185,12,130);ctx.fillRect(W-12,185,12,130);
  const b=g.ball;
  ctx.fillStyle="rgba(0,0,0,.3)";ctx.beginPath();ctx.ellipse(b.x,b.y+14,b.r,5,0,0,Math.PI*2);ctx.fill();
  g.pl.forEach((p,i)=>{
    ctx.save();ctx.translate(p.x,p.y);
    FX.drawFighter(ctx,p.r*1.4,p.r*1.4,p.color,p.fx>=0?1:-1,true,false);
    ctx.restore();
  });
  ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle="#080b18";
  ctx.beginPath();ctx.arc(b.x,b.y,4,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(b.x+6,b.y-4,3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(b.x-5,b.y+3,3,0,Math.PI*2);ctx.fill();
}
});

/* FENCING — proper sprite animation */
unregister("fencingGame");
micro({id:"fencingGame",title:"Fencing",desc:"Lunge, parry, strike first",
cat:"action",key:"fencing",win:5,
controls:"P1: A/D move, SPACE lunge, S parry　 P2: ←/→ move, ENTER lunge, ↓ parry",
round(g){
  g.f=[
    {x:300,lunge:0,cd:0,parry:0,pcd:0,stun:0,dir:1,fx:1},
    {x:600,lunge:0,cd:0,parry:0,pcd:0,stun:0,dir:-1,fx:-1}
  ];
  g.spark=0;
},
update(g,dt){
  g.spark=Math.max(0,g.spark-dt);
  const hit=[false,false];
  g.f.forEach((p,i)=>{
    const I=g.I[i];
    p.cd=Math.max(0,p.cd-dt);p.pcd=Math.max(0,p.pcd-dt);
    p.parry=Math.max(0,p.parry-dt);p.stun=Math.max(0,p.stun-dt);
    if(p.lunge>0){
      p.lunge-=dt;
      p.x+=p.dir*540*dt;
      if(p.lunge<=0)p.cd=.55;
    }else if(p.stun<=0&&p.parry<=0){
      p.x+=((I.r?1:0)-(I.l?1:0))*165*dt;
      if(I.pa&&p.cd<=0){p.lunge=.2;FX.tone(500,.1,"sawtooth",.04,-200);}
      if(I.pd&&p.pcd<=0){p.parry=.28;p.pcd=.6;FX.tone(900,.06,"square",.03);}
    }
    p.x=cl(p.x,80,820);
  });
  const [a,b]=g.f;
  if(a.x>b.x-46){const m=(a.x+b.x)/2;a.x=m-23;b.x=m+23;}
  g.f.forEach((p,i)=>{
    const o=g.f[1-i];
    if(p.lunge>0&&Math.abs(o.x-p.x)<78){
      if(o.parry>0){
        p.lunge=0;p.stun=.8;p.cd=.5;g.spark=.25;
        g.burst((p.x+o.x)/2,330,"#fff",16,300);
        FX.tone(1200,.1,"square",.05);
      }else hit[i]=true;
    }
  });
  if(hit[0]&&hit[1])g.next("DOUBLE HIT");
  else if(hit[0]){g.burst(g.f[1].x,330,C2,20,320);playHitSound();g.point(0);}
  else if(hit[1]){g.burst(g.f[0].x,330,C1,20,320);playHitSound();g.point(1);}
},
draw(g,ctx){
  const gr=ctx.createLinearGradient(0,0,0,H);
  gr.addColorStop(0,"#2a1a3a");gr.addColorStop(1,"#5a2a3a");
  ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="rgba(255,255,255,.07)";
  for(let k=0;k<10;k++)ctx.fillRect(k*95+10,40,50,90);
  ctx.fillStyle="#d8d8e8";ctx.fillRect(60,390,780,14);
  ctx.fillStyle="#a8a8c0";ctx.fillRect(60,404,780,6);
  ctx.fillStyle="#3a2a2a";ctx.fillRect(0,410,W,90);
  g.f.forEach((p,i)=>{
    const lungeExt=p.lunge>0?15:0;
    const x=p.x + (p.dir>0?lungeExt:-lungeExt);
    ctx.save();
    ctx.translate(x,390);
    if(p.stun>0&&Math.floor(p.stun*14)%2)ctx.globalAlpha=.5;
    ctx.fillStyle="#0c0f24";
    ctx.fillRect(-10+p.dir*4,-4,10,6);
    ctx.fillRect(2-p.dir*4,-4,10,6);
    ctx.fillStyle="#2a2f63";
    ctx.fillRect(-12,-40,10,42);
    ctx.fillRect(4,-40,10,42);
    ctx.fillStyle=col(i);
    ctx.fillRect(-14,-95,28,58);
    ctx.strokeStyle="#080b18";ctx.lineWidth=3;
    ctx.strokeRect(-14,-95,28,58);
    ctx.fillStyle="#e8e8f0";
    ctx.beginPath();ctx.arc(0,-115,16,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle="#1a1a2a";
    ctx.fillRect(-8,-120,16,6);
    ctx.save();
    ctx.translate(p.dir>0?12:-12,-85);
    ctx.rotate(p.dir>0?-0.1:Math.PI+0.1);
    const ext=p.lunge>0?95:p.parry>0?50:58;
    ctx.strokeStyle="#e8e8ff";ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(ext,0);ctx.stroke();
    ctx.fillStyle=GOLD;ctx.fillRect(-4,-6,8,12);
    ctx.restore();
    if(p.parry>0){
      ctx.strokeStyle=GOLD;ctx.lineWidth=3;
      ctx.beginPath();
      ctx.arc(p.dir>0?30:-30,-85,32,-1.2,1.2);
      ctx.stroke();
    }
    ctx.globalAlpha=1;
    ctx.restore();
  });
  if(g.spark>0)g.text("PARRY!",W/2,200,30,GOLD,"center");
}
});

/* ONE BULLET — extend round with visible aiming line */
unregister("onebulletGame");
micro({id:"onebulletGame",title:"One Bullet",desc:"One shot per round. Aim carefully — miss and you lose.",
cat:"reflex",key:"onebullet",win:3,
controls:"P1: A/D aim, SPACE fire　 P2: ←/→ aim, ENTER fire — one bullet each per round. Walls block shots.",
round(g){
  g.pl=[
    {x:80,y:250,ang:0,shot:false,dead:false,aim:0.4},
    {x:820,y:250,ang:Math.PI,shot:false,dead:false,aim:0.4}
  ];
  g.bullets=[];
  g.walls=[{x:430,y:150,w:40,h:110},{x:430,y:340,w:40,h:110}];
  g.tl=0;
},
update(g,dt){
  g.tl+=dt;
  g.pl.forEach((p,i)=>{
    if(p.shot||p.dead)return;
    const I=g.I[i];
    if(I.l)p.ang-=1.1*dt;
    if(I.r)p.ang+=1.1*dt;
    if(I.a){
      p.shot=true;
      g.bullets.push({x:p.x+Math.cos(p.ang)*20,y:p.y+Math.sin(p.ang)*20,vx:Math.cos(p.ang)*500,vy:Math.sin(p.ang)*500,o:i});
      FX.playShoot();
    }
  });
  for(const b of g.bullets){
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.x<0||b.x>W||b.y<0||b.y>H)b.dead=true;
    for(const w of g.walls)if(b.x>w.x&&b.x<w.x+w.w&&b.y>w.y&&b.y<w.y+w.h)b.dead=true;
    for(let i=0;i<2;i++){
      if(i===b.o||g.pl[i].dead)continue;
      if(Math.hypot(b.x-g.pl[i].x,b.y-g.pl[i].y)<20){
        g.pl[i].dead=true;b.dead=true;
        g.burst(g.pl[i].x,g.pl[i].y,col(i),24,360);FX.playBoom();
      }
    }
  }
  g.bullets=g.bullets.filter(b=>!b.dead);
  if(g.pl[0].dead&&g.pl[1].dead)g.next("MUTUAL KILL");
  else if(g.pl[0].dead)g.point(1,"P2 WINS");
  else if(g.pl[1].dead)g.point(0,"P1 WINS");
  else if(g.pl.every(p=>p.shot)&&g.bullets.length===0)g.next("BOTH MISSED");
  else if(g.tl>20)g.next("TIME UP");
},
draw(g,ctx){
  ctx.fillStyle="#1a1230";ctx.fillRect(0,0,W,H);
  for(const w of g.walls){
    ctx.fillStyle="#4a3a6a";ctx.fillRect(w.x,w.y,w.w,w.h);
    ctx.fillStyle="#6a56b8";ctx.fillRect(w.x,w.y,w.w,4);
  }
  g.pl.forEach((p,i)=>{
    if(p.dead)return;
    if(!p.shot){
      ctx.strokeStyle=col(i);ctx.globalAlpha=.5;ctx.setLineDash([6,8]);
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(p.ang)*700,p.y+Math.sin(p.ang)*700);ctx.stroke();
      ctx.setLineDash([]);ctx.globalAlpha=1;
      const ex=p.x+Math.cos(p.ang)*400,ey=p.y+Math.sin(p.ang)*400;
      ctx.strokeStyle=col(i);ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(ex,ey,12,0,Math.PI*2);
      ctx.moveTo(ex-18,ey);ctx.lineTo(ex+18,ey);
      ctx.moveTo(ex,ey-18);ctx.lineTo(ex,ey+18);
      ctx.stroke();
    }
    ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
    ctx.strokeStyle="#1b2147";ctx.lineWidth=6;
    ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(p.ang)*20,p.y+Math.sin(p.ang)*20);ctx.stroke();
  });
  g.bullets.forEach(b=>{ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x,b.y,5,0,Math.PI*2);ctx.fill();});
  g.text(Math.round(g.tl)+"s",W/2,30,16,"#9fc0ff","center");
}
});

})();