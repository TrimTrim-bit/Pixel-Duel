/* =====================================================
   GAME FIXES 2 — remaining redesign wishlist items
   Loads after games_fixes.js
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
}

/* SLOT MACHINE — better RTP, animations */
unregister("slotGame");
micro({id:"slotGame",title:"Slot Machine",desc:"Spin 3 reels. Match 3 to win big.",
cat:"arcade",key:"slot",win:1,hud:false,
controls:"P1: SPACE spin　 P2: ENTER — 3 match pays big. 20 spins each.",
init(g){
  g.money=[100,100];
  g.reels=[[0,0,0],[0,0,0]];
  g.spinning=[false,false];
  g.spinT=[0,0];
  g.spinsLeft=[20,20];
  g.result=["",""];
},
update(g,dt){
  [0,1].forEach(p=>{
    if(!g.spinning[p])return;
    g.spinT[p]+=dt;
    if(g.spinT[p]>=.3+p*.15){
      for(let k=0;k<3;k++)g.reels[p][k]=ri(0,5);
    }
    if(g.spinT[p]>=1.0+p*.2){
      g.spinning[p]=false;
      const [a,b,c]=g.reels[p];
      if(a===b&&b===c){
        const prize=a===5?300:a===4?120:a===3?60:a===2?30:20;
        g.money[p]+=prize;
        g.result[p]="WIN +"+prize;
        FX.playScore();
        g.burst(p?675:225,300,GOLD,20,400);
      }else if(a===b||b===c||a===c){
        g.money[p]+=15;
        g.result[p]="PAIR +15";
        FX.tone(600,.1,"square",.04);
      }else{
        g.result[p]="";
        FX.tone(200,.1,"square",.03);
      }
    }
  });
  for(let p=0;p<2;p++){
    if(g.I[p].pa&&!g.spinning[p]&&g.spinsLeft[p]>0&&g.money[p]>=5){
      g.money[p]-=5;
      g.spinsLeft[p]--;
      g.spinning[p]=true;
      g.spinT[p]=0;
      g.result[p]="";
      FX.tone(700,.08,"square",.04);
    }
  }
  if(g.spinsLeft[0]<=0&&g.spinsLeft[1]<=0&&!g.spinning[0]&&!g.spinning[1])g.byScore(g.money);
},
draw(g,ctx){
  ctx.fillStyle="#2a1a10";ctx.fillRect(0,0,W,H);
  const SY=["🍒","🍋","🍇","⭐","🔔","💎"];
  for(let p=0;p<2;p++){
    const off=p?450:0;
    ctx.fillStyle="rgba(0,0,0,.3)";ctx.fillRect(off,120,450,280);
    g.text("P"+(p+1)+"'S SLOTS",off+225,50,22,col(p),"center");
    for(let k=0;k<3;k++){
      const x=off+80+k*100,y=170;
      ctx.fillStyle="#fff";ctx.fillRect(x,y,80,80);
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(x,y,80,80);
      ctx.font="44px serif";ctx.textAlign="center";ctx.fillStyle="#111";
      ctx.fillText(SY[g.reels[p][k]],x+40,y+60);
      ctx.textAlign="left";
    }
    g.text("$"+g.money[p],off+225,320,28,GOLD,"center");
    g.text("Spins: "+g.spinsLeft[p],off+225,350,16,"#9fc0ff","center");
    if(g.result[p])g.text(g.result[p],off+225,390,24,GREEN,"center");
    if(g.spinning[p])g.text("SPINNING...",off+225,420,16,col(p),"center");
  }
  ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  g.text("P1: SPACE   P2: ENTER",W/2,490,14,"#9fc0ff","center");
}
});

/* LONG JUMP */
unregister("jumpGame");
micro({id:"jumpGame",title:"Long Jump",desc:"Sprint, then leap before the line",
cat:"sports",key:"longjump",win:1,hud:false,
controls:"P1: mash SPACE to sprint, press S to jump　 P2: mash ENTER, press ↓ — 3 attempts",
init(g){
  g.st=[0,1].map(()=>({n:0,x:0,sp:0,ph:"run",best:0,res:"",t:0,j:0}));
  g.fin=0;
},
update(g,dt){
  g.st.forEach((s,i)=>{
    const I=g.I[i];
    if(s.ph==="run"){
      if(I.pa){s.sp=Math.min(12,s.sp+.55);FX.tone(180,.02,"square",.015);}
      s.sp=Math.max(0,s.sp-1.2*dt);
      s.x+=s.sp*48*dt;
      if(s.x>=440){s.ph="air";s.t=0;s.j=0;s.res="FOUL";FX.tone(130,.3,"sawtooth",.05,-60);}
      else if(I.pd&&s.sp>2){
        s.ph="air";s.t=0;
        s.j=2.4+s.sp*.28*(0.7+0.3*s.x/440);
        s.j=Math.round(s.j*100)/100;
        s.res=s.j.toFixed(2)+" m";
        if(s.j>s.best)s.best=s.j;
        FX.tone(600,.2,"triangle",.05,300);
      }
    }else if(s.ph==="air"){
      s.t+=dt;
      if(s.t>1.6){s.n++;s.x=0;s.sp=0;s.res="";s.ph=s.n>=3?"done":"run";}
    }
  });
  if(g.st.every(s=>s.ph==="done")){g.fin+=dt;if(g.fin>1)g.byScore(g.st.map(s=>s.best));}
},
draw(g,ctx){
  ctx.fillStyle="#2a4a7a";ctx.fillRect(0,0,W,H);
  g.st.forEach((s,i)=>{
    const cx=i?675:225,off=i?450:0;
    ctx.fillStyle="#b0503a";ctx.fillRect(off+10,330,430,40);
    ctx.fillStyle="#e8d8a0";ctx.fillRect(off+440,340,10,30);
    ctx.fillStyle="#fff";ctx.fillRect(off+10+430-6,330,6,40);
    const x=off+20+s.x*.92;
    let y=330,jx=0;
    if(s.ph==="air"&&s.j>0){
      const t=Math.min(1,s.t/1.2);
      jx=t*s.j*22;
      y=330-Math.sin(t*Math.PI)*90;
    }
    ctx.save();ctx.translate(x+jx-14,y-52);
    FX.drawFighter(ctx,28,52,col(i),1,s.ph==="run"&&s.sp>.5,false);
    ctx.restore();
    ctx.fillStyle="#080b18";ctx.fillRect(off+125,430,200,16);
    ctx.fillStyle=GOLD;ctx.fillRect(off+127,432,196*s.sp/12,12);
    g.text("P"+(i+1)+"  BEST "+s.best.toFixed(2),cx,36,22,col(i),"center");
    g.text("ATTEMPT "+Math.min(3,s.n+(s.ph==="done"?0:1))+"/3",cx,60,14,"#fff","center");
    if(s.res)g.text(s.res,cx,170,34,s.res==="FOUL"?RED:GOLD,"center");
  });
  ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* SNAKES AND LADDERS */
unregister("snakeladderGame");
micro({id:"snakeladderGame",title:"Snakes and Ladders",desc:"Roll dice. Reach 100 first.",
cat:"board",key:"snakeladder",win:1,hud:false,
controls:"P1: SPACE roll　 P2: ENTER roll — exact 100 wins.",
init(g){g.pos=[0,0];g.turn=0;g.die=0;g.dieT=0;g.cd=[0,0];},
update(g,dt){
  g.dieT=Math.max(0,g.dieT-dt);
  g.cd[0]=Math.max(0,g.cd[0]-dt);
  g.cd[1]=Math.max(0,g.cd[1]-dt);
  for(let i=0;i<2;i++){
    if(g.I[i].pa&&g.dieT<=0&&g.cd[i]<=0){
      g.die=ri(1,6);
      g.dieT=.7;
      let np=g.pos[i]+g.die;
      if(np>100)np=g.pos[i];
      const SNAKES={17:7,54:34,62:19,64:60,87:24,93:73,95:75,98:79};
      const LADDERS={1:38,4:14,9:31,21:42,28:84,36:44,51:67,71:91,80:100};
      if(SNAKES[np]){np=SNAKES[np];g.burst(450,300,RED,15,300);FX.tone(130,.2,"sawtooth",.05,-60);}
      else if(LADDERS[np]){np=LADDERS[np];g.burst(450,200,GREEN,15,300);FX.tone(900,.15,"triangle",.05,300);}
      g.pos[i]=np;
      FX.tone(400+g.die*60,.1,"square",.04);
      g.cd[i]=.9;
      if(np>=100){g.byScore(i===0?[100,0]:[0,100]);return;}
      g.turn=1-g.turn;
    }
  }
},
draw(g,ctx){
  ctx.fillStyle="#0a1020";ctx.fillRect(0,0,W,H);
  const cs=42,ox=240,oy=40;
  for(let r=0;r<10;r++)for(let c=0;c<10;c++){
    const row=9-r;
    const x=ox+c*cs,y=oy+row*cs;
    const isEven=r%2===0;
    const num=isEven?r*10+c+1:r*10+(10-c);
    ctx.fillStyle=(r+c)%2?"#2a2f5a":"#222548";
    ctx.fillRect(x,y,cs,cs);
    ctx.strokeStyle="#3a4a8a";ctx.lineWidth=1;ctx.strokeRect(x,y,cs,cs);
    g.text(String(num),x+cs/2,y+cs/2+5,12,"#9fc0ff","center");
  }
  const SN={17:7,54:34,62:19,64:60,87:24,93:73,95:75,98:79};
  const LD={1:38,4:14,9:31,21:42,28:84,36:44,51:67,71:91,80:100};
  const pt=n=>{
    const row=Math.floor((n-1)/10),col=(n-1)%10;
    const isEven=row%2===0;
    const c=isEven?col:9-col;
    return{x:ox+c*cs+cs/2,y:oy+(9-row)*cs+cs/2};
  };
  Object.entries(LD).forEach(([f,t])=>{
    const a=pt(+f),b=pt(+t);
    ctx.strokeStyle="rgba(99,245,154,.5)";ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  });
  Object.entries(SN).forEach(([f,t])=>{
    const a=pt(+f),b=pt(+t);
    ctx.strokeStyle="rgba(255,88,120,.5)";ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  });
  g.pos.forEach((p,i)=>{
    if(p<=0)return;
    const pp=pt(p);
    ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(pp.x+i*4-2,pp.y,8,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
  });
  ctx.fillStyle="#080b18";ctx.fillRect(0,H-50,W,50);
  g.text("P1: "+g.pos[0],140,H-20,20,C1,"center");
  g.text("P2: "+g.pos[1],W-140,H-20,20,C2,"center");
  if(g.die>0&&g.dieT>0)g.text("DICE: "+g.die,W/2,H-20,24,GOLD,"center");
  else g.text("P"+(g.turn+1)+"'S TURN",W/2,H-20,20,col(g.turn),"center");
}
});

/* MAZE DASH — equal start */
unregister("mazeGame");
micro({id:"mazeGame",title:"Maze Dash",desc:"Race through a fresh maze to the flag",
cat:"arcade",key:"maze",win:3,
controls:"P1: W/A/S/D　 P2: ARROWS — same maze, first to the flag wins",
round(g){
  const cols=29,rows=15,grid=[];
  for(let y=0;y<rows;y++)grid.push(new Array(cols).fill(1));
  const stack=[[1,1]];grid[1][1]=0;
  while(stack.length){
    const [x,y]=stack[stack.length-1];
    const nb=[[2,0],[-2,0],[0,2],[0,-2]].filter(([dx,dy])=>{
      const nx=x+dx,ny=y+dy;
      return nx>0&&ny>0&&nx<cols-1&&ny<rows-1&&grid[ny][nx]===1;
    });
    if(!nb.length){stack.pop();continue;}
    const [dx,dy]=nb[ri(0,nb.length-1)];
    grid[y+dy/2][x+dx/2]=0;grid[y+dy][x+dx]=0;
    stack.push([x+dx,y+dy]);
  }
  g.grid=grid;g.cols=cols;g.rows=rows;g.cs=30;g.ox=15;g.oy=35;
  g.pl=[
    {x:g.ox+45,y:g.oy+35,r:9,color:C1,vx:0,vy:0,fx:1,fy:0},
    {x:g.ox+45,y:g.oy+55,r:9,color:C2,vx:0,vy:0,fx:1,fy:0}
  ];
},
update(g,dt){
  g.pl.forEach((p,i)=>{
    g.walk(p,i,135,{x0:p.r,x1:W-p.r,y0:p.r,y1:H-p.r});
    const cx=Math.floor((p.x-g.ox)/g.cs),cy=Math.floor((p.y-g.oy)/g.cs);
    for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++){
      if(y<0||x<0||y>=g.rows||x>=g.cols||g.grid[y][x]!==1)continue;
      FX.circleRectPush(p,{x:g.ox+x*g.cs,y:g.oy+y*g.cs,w:g.cs,h:g.cs});
    }
  });
  const fx=g.ox+27*g.cs+15,fy=g.oy+13*g.cs+15;
  const win=g.pl.map(p=>Math.hypot(p.x-fx,p.y-fy)<16);
  if(win[0]&&win[1])g.next("PHOTO FINISH");
  else if(win[0])g.point(0);
  else if(win[1])g.point(1);
},
draw(g,ctx){
  ctx.fillStyle="#0e1226";ctx.fillRect(0,0,W,H);
  for(let y=0;y<g.rows;y++)for(let x=0;x<g.cols;x++){
    const px=g.ox+x*g.cs,py=g.oy+y*g.cs;
    if(g.grid[y][x]===1){
      ctx.fillStyle="#4a3a8a";ctx.fillRect(px,py,g.cs,g.cs);
      ctx.fillStyle="#6a56b8";ctx.fillRect(px,py,g.cs,5);
    }else{
      ctx.fillStyle=(x+y)%2?"#141a38":"#172044";ctx.fillRect(px,py,g.cs,g.cs);
    }
  }
  const fx=g.ox+27*g.cs+15,fy=g.oy+13*g.cs+15;
  ctx.fillStyle="#fff";ctx.fillRect(fx-1,fy-12,3,24);
  ctx.fillStyle=GREEN;ctx.fillRect(fx+2,fy-12,13,9);
  g.pl.forEach((p,i)=>{
    ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle="#fff";ctx.fillRect(p.x-4+p.fx*2,p.y-4,3,4);
    ctx.fillRect(p.x+1+p.fx*2,p.y-4,3,4);
  });
}
});

/* KNUCKLEBONES — polish */
unregister("knucklebonesGame");
micro({id:"knucklebonesGame",title:"Knucklebones",desc:"Place dice, match to destroy rival dice.",
cat:"brain",key:"knucklebones",win:3,
controls:"SPACE roll, then A/W/D (P1) or ←/↑/→ (P2) to place in column 1/2/3",
round(g){
  g.boards=[[[],[],[]],[[],[],[]]];
  g.rolled=null;
  g.turn=0;
  g.lastKill=[[0,0,0],[0,0,0]];
},
update(g,dt){
  const I=g.I[g.turn],b=g.boards[g.turn];
  g.lastKill.forEach(row=>row.fill(0));
  if(g.rolled===null){
    if(I.pa){g.rolled=ri(1,6);FX.tone(500,.08,"square",.04);}
    return;
  }
  let col=-1;
  if(I.pl)col=0;else if(I.pu)col=1;else if(I.pr)col=2;
  if(col<0||b[col].length>=3)return;
  const val=g.rolled;
  b[col].push(val);
  const oppB=g.boards[1-g.turn];
  let removed=0;
  for(let r=oppB[col].length-1;r>=0;r--){
    if(oppB[col][r]===val){oppB[col].splice(r,1);removed++;g.lastKill[1-g.turn][col]=.6;}
  }
  if(removed)FX.tone(300,.15,"sawtooth",.04,-100);
  else FX.tone(600,.08,"square",.03);
  g.rolled=null;
  g.turn=1-g.turn;
  const p1Full=g.boards[0].every(c=>c.length>=3);
  const p2Full=g.boards[1].every(c=>c.length>=3);
  if(p1Full&&p2Full){
    const s1=g.boards[0].reduce((sum,c)=>sum+c.reduce((a,b)=>a+b*b,0),0);
    const s2=g.boards[1].reduce((sum,c)=>sum+c.reduce((a,b)=>a+b*b,0),0);
    if(s1>s2)g.point(0,"P1 "+s1+"-"+s2);
    else if(s2>s1)g.point(1,"P2 "+s2+"-"+s1);
    else g.next("TIE");
  }
},
draw(g,ctx){
  ctx.fillStyle="#1a1230";ctx.fillRect(0,0,W,H);
  g.text("KNUCKLEBONES",W/2,34,24,GOLD,"center");
  [0,1].forEach(p=>{
    const off=p?520:80;
    g.text("P"+(p+1)+(g.turn===p?" ◀":"")+(g.mode==="play"&&g.turn===p?" PLAYING":""),off+135,66,16,col(p),"center");
    for(let c=0;c<3;c++){
      for(let r=0;r<3;r++){
        const x=off+c*90,y=90+r*90;
        ctx.fillStyle=g.lastKill[p][c]>0?"#5a2a2a":"#2a2f63";
        ctx.fillRect(x,y,80,80);
        ctx.strokeStyle=col(p);ctx.lineWidth=2;ctx.strokeRect(x,y,80,80);
        const v=g.boards[p][c][r];
        if(v){
          ctx.fillStyle="#fff";ctx.fillRect(x+10,y+10,60,60);
          g.text(String(v),x+40,y+52,32,"#111","center");
        }
      }
      const sum=g.boards[p][c].reduce((a,b)=>a+b*b,0);
      g.text("="+sum,off+c*90+40,398,14,GOLD,"center");
    }
  });
  if(g.rolled!==null){
    ctx.fillStyle="#fff";ctx.fillRect(W/2-40,430,80,80);
    ctx.strokeStyle=col(g.turn);ctx.lineWidth=4;ctx.strokeRect(W/2-40,430,80,80);
    g.text(String(g.rolled),W/2,492,44,"#111","center");
    g.text("P"+(g.turn+1)+": pick column",W/2,430-8,14,col(g.turn),"center");
  }else{
    g.text("P"+(g.turn+1)+" — SPACE to ROLL",W/2,470,18,col(g.turn),"center");
  }
}
});

/* CROSSFIRE — clearer */
unregister("crossfireGame");
micro({id:"crossfireGame",title:"Crossfire",desc:"Dodge crossing bullet waves. Survive longest.",
cat:"reflex",key:"crossfire",win:3,
controls:"P1: WASD　 P2: ARROWS — identical bullet patterns on both sides",
round(g){
  g.tl=0;
  g.rng=(function(s){return()=>{s=(s*9301+49297)%233280;return s/233280;};})(ri(1,1e6));
  g.bullets=[];
  g.spawnT=1.2;
  g.pl=[{x:225,y:250},{x:675,y:250}];
},
update(g,dt){
  g.tl+=dt;
  g.spawnT-=dt;
  if(g.spawnT<=0){
    g.spawnT=Math.max(.4,1.3-g.tl*.015);
    const y=g.rng()*400+80,v=110+g.tl*6;
    g.bullets.push({x:-20,y,vx:v});
    g.bullets.push({x:W+20,y,vx:-v});
  }
  g.bullets.forEach(b=>b.x+=b.vx*dt);
  g.bullets=g.bullets.filter(b=>b.x>-40&&b.x<W+40);
  const hit=[false,false];
  g.pl.forEach((p,i)=>{
    const I=g.I[i];
    p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*280*dt,i*450+30,i*450+420);
    p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*280*dt,60,H-20);
    for(const b of g.bullets){
      if(Math.abs(b.x-p.x)<14&&Math.abs(b.y-p.y)<14)hit[i]=true;
    }
  });
  if(hit[0]&&hit[1])g.next("BOTH HIT");
  else if(hit[0]){g.burst(g.pl[0].x,g.pl[0].y,C1,20,320);FX.playBoom();g.point(1);}
  else if(hit[1]){g.burst(g.pl[1].x,g.pl[1].y,C2,20,320);FX.playBoom();g.point(0);}
  else if(g.tl>30)g.next("BOTH SURVIVE");
},
draw(g,ctx){
  for(let i=0;i<2;i++){
    ctx.fillStyle=i?"#1a0d2a":"#0b1030";
    ctx.fillRect(i*450,0,450,H);
    ctx.save();ctx.beginPath();ctx.rect(i*450,0,450,H);ctx.clip();
    g.bullets.forEach(b=>{
      const off=i*450;
      ctx.fillStyle="#ff5a78";
      ctx.fillRect(off+b.x-14,b.y-4,28,8);
    });
    g.blob({x:g.pl[i].x,y:g.pl[i].y,r:12},col(i),g.pl[i].x+60,g.pl[i].y,false);
    ctx.restore();
  }
  ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  g.text(g.tl.toFixed(1)+"s",W/2,490,14,"#9fc0ff","center");
}
});

/* CEE-LO */
unregister("ceeloGame");
micro({id:"ceeloGame",title:"Cee-lo",desc:"Roll 3 dice. 4-5-6 wins instantly, 1-2-3 loses.",
cat:"brain",key:"ceelo",win:5,
controls:"P1: SPACE　 P2: ENTER — Triples beat pairs beat nothing",
round(g){g.p1=null;g.p2=null;},
update(g,dt){
  if(g.p1===null&&g.I[0].pa){g.p1=[ri(1,6),ri(1,6),ri(1,6)].sort((a,b)=>a-b);FX.tone(500,.1,"square",.04);}
  if(g.p2===null&&g.I[1].pa){g.p2=[ri(1,6),ri(1,6),ri(1,6)].sort((a,b)=>a-b);FX.tone(500,.1,"square",.04);}
  if(g.p1&&g.p2){
    const v1=ceeLoVal(g.p1),v2=ceeLoVal(g.p2);
    if(v1>v2)g.point(0,ceeLoName(g.p1));
    else if(v2>v1)g.point(1,ceeLoName(g.p2));
    else g.next("TIE");
  }
},
draw(g,ctx){
  ctx.fillStyle="#1a1230";ctx.fillRect(0,0,W,H);
  g.text("CEE-LO",W/2,50,32,GOLD,"center");
  [0,1].forEach(p=>{
    const off=p?520:80;
    const dice=p===0?g.p1:g.p2;
    g.text("P"+(p+1),off+90,120,22,col(p),"center");
    if(dice){
      dice.forEach((d,k)=>{
        const x=off+k*60,y=170;
        ctx.fillStyle="#fff";ctx.fillRect(x,y,50,50);
        ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(x,y,50,50);
        g.text(String(d),x+25,y+38,32,"#111","center");
      });
      g.text(ceeLoName(dice),off+90,270,16,col(p),"center");
    }else{
      g.text(p===0?"SPACE":"ENTER",off+90,210,18,col(p),"center");
    }
  });
}
});
function ceeLoVal(dice){
  const s=dice.join("");
  if(s==="456")return 1000;
  if(s==="123")return -1;
  if(dice[0]===dice[1]&&dice[1]===dice[2])return 500+dice[0]*10;
  if(dice[0]===dice[1])return dice[2];
  if(dice[1]===dice[2])return dice[0];
  return 0;
}
function ceeLoName(dice){
  const s=dice.join("");
  if(s==="456")return "4-5-6!";
  if(s==="123")return "1-2-3";
  if(dice[0]===dice[1]&&dice[1]===dice[2])return "TRIPLE "+dice[0];
  if(dice[0]===dice[1])return "PAIR + "+dice[2];
  if(dice[1]===dice[2])return "PAIR + "+dice[0];
  return "NO HAND";
}

/* PIG — polish */
unregister("pigGame");
micro({id:"pigGame",title:"Pig",desc:"Push your luck. Roll a 1 and lose it all.",
cat:"brain",key:"pig",win:1,hud:false,
controls:"Click ROLL to add to your turn total. Click HOLD to bank it. First to 50 wins.",
init(g){g.s=[0,0];g.tot=0;g.turn=0;g.die=0;g.shake=0;},
update(g,dt){g.shake=Math.max(0,g.shake-dt);},
click(g,x,y){
  if(y<395||y>450)return;
  if(x>250&&x<430){
    g.die=ri(1,6);g.shake=.35;FX.tone(300+g.die*60,.1,"square",.05);
    if(g.die===1){g.tot=0;g.banner_("PIG OUT!",RED,1);g.turn=1-g.turn;FX.tone(120,.3,"sawtooth",.06,-50);}
    else g.tot+=g.die;
  }else if(x>470&&x<650&&g.tot>0){
    g.s[g.turn]+=g.tot;
    g.tot=0;
    FX.playScore();
    if(g.s[g.turn]>=50){g.end(g.turn);return;}
    g.turn=1-g.turn;
  }else return;
},
draw(g,ctx){
  ctx.fillStyle="#14223a";ctx.fillRect(0,0,W,H);
  for(let i=0;i<2;i++){
    const cx=i?750:150;
    const active=g.turn===i&&g.mode==="play";
    ctx.fillStyle=active?"#1f3a60":"#182a48";
    ctx.fillRect(cx-110,70,220,200);
    ctx.strokeStyle=col(i);ctx.lineWidth=active?5:2;
    ctx.strokeRect(cx-110,70,220,200);
    g.text("PLAYER "+(i+1),cx,105,20,col(i),"center");
    g.text(String(g.s[i]),cx,200,70,"#fff","center");
    g.text("/ 50",cx,240,18,"#9fc0ff","center");
    if(active)g.text("▶ TURN",cx,265,14,col(i),"center");
  }
  const jx=W/2+(g.shake>0?Math.sin(g.t*60)*8:0);
  const jy=190+(g.shake>0?Math.cos(g.t*50)*6:0);
  ctx.fillStyle="#fff";ctx.fillRect(jx-55,jy-55,110,110);
  ctx.strokeStyle="#080b18";ctx.lineWidth=4;ctx.strokeRect(jx-55,jy-55,110,110);
  const P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
  ctx.fillStyle=g.die===1?RED:"#11152b";
  (P[g.die]||[]).forEach(([a,b])=>{
    ctx.beginPath();ctx.arc(jx+a*28,jy+b*28,9,0,Math.PI*2);ctx.fill();
  });
  g.text("TURN TOTAL: "+g.tot,W/2,330,26,GOLD,"center");
  ctx.fillStyle=col(g.turn);ctx.fillRect(250,395,180,55);
  ctx.fillStyle="#2a2f63";ctx.fillRect(470,395,180,55);
  ctx.strokeStyle="#080b18";ctx.lineWidth=3;
  ctx.strokeRect(250,395,180,55);ctx.strokeRect(470,395,180,55);
  g.text("ROLL",340,432,24,"#080b18","center");
  g.text("HOLD",560,432,24,g.tot>0?"#fff":"#6a72a8","center");
}
});

/* NONOGRAM */
unregister("nonogramGame");
micro({id:"nonogramGame",title:"Nonogram 5x5",desc:"Fill cells to match row and column clues.",
cat:"brain",key:"nonogram",win:3,
controls:"Click cells to toggle. Solve your puzzle before rival solves theirs.",
round(g){
  const PUZZLES=[
    {grid:[[1,1,0,1,1],[1,1,0,1,1],[0,0,0,0,0],[1,1,1,1,0],[0,1,1,1,0]],
     rows:[[2,2],[2,2],[],[4],[3]],cols:[[2,2],[2,2],[0],[3,1],[3]]},
    {grid:[[0,1,1,0,0],[1,1,1,0,0],[0,1,1,1,0],[0,0,1,1,1],[0,0,1,1,0]],
     rows:[[2],[3],[3],[3],[2]],cols:[[1],[3],[5],[2],[1]]},
    {grid:[[1,1,1,1,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
     rows:[[5],[1,1],[1],[1,1],[1,1]],cols:[[2],[3],[1],[3],[2]]}
  ];
  const idx=ri(0,PUZZLES.length-1);
  g.puzzle=PUZZLES[idx];
  g.grids=[Array.from({length:5},()=>new Array(5).fill(0)),
           Array.from({length:5},()=>new Array(5).fill(0))];
},
click(g,x,y){
  for(let p=0;p<2;p++){
    const ox=p?540:100,oy=140,sz=50;
    if(x>ox&&x<ox+sz*5&&y>oy&&y<oy+sz*5){
      const c=Math.floor((x-ox)/sz),r=Math.floor((y-oy)/sz);
      g.grids[p][r][c]=g.grids[p][r][c]?0:1;
      FX.tone(500,.03,"square",.02);
      const solved=g.grids[p].every((row,r)=>row.every((v,c)=>!!v===!!g.puzzle.grid[r][c]));
      if(solved)g.point(p,"SOLVED");
      return;
    }
  }
},
draw(g,ctx){
  ctx.fillStyle="#1a2050";ctx.fillRect(0,0,W,H);
  for(let p=0;p<2;p++){
    const ox=p?540:100,oy=140,sz=50;
    for(let c=0;c<5;c++){
      const clue=g.puzzle.cols[c];
      clue.forEach((n,i)=>{
        g.text(String(n),ox+c*sz+sz/2,oy-40+(i-clue.length+1)*18,14,col(p),"center");
      });
    }
    for(let r=0;r<5;r++){
      const clue=g.puzzle.rows[r];
      clue.forEach((n,i)=>{
        g.text(String(n),ox-25-(clue.length-1-i)*18,oy+r*sz+sz/2+6,14,col(p),"center");
      });
    }
    ctx.fillStyle="#1a1a3a";ctx.fillRect(ox-4,oy-4,sz*5+8,sz*5+8);
    for(let r=0;r<5;r++)for(let c=0;c<5;c++){
      const x=ox+c*sz,y=oy+r*sz;
      ctx.fillStyle=g.grids[p][r][c]?"#64eaff":"#2a2f63";
      ctx.fillRect(x+1,y+1,sz-2,sz-2);
      ctx.strokeStyle="#080b18";ctx.lineWidth=1;ctx.strokeRect(x+1,y+1,sz-2,sz-2);
    }
    g.text("P"+(p+1),ox+sz*2.5,110,20,col(p),"center");
  }
  ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* FARKLE */
unregister("farkleGame");
micro({id:"farkleGame",title:"Farkle",desc:"Push your luck with 6 dice.",
cat:"brain",key:"farkle",win:1,hud:false,
controls:"SPACE/ENTER to roll 6 dice, press again to bank. 1000 pts wins.",
init(g){
  g.st=[0,1].map(()=>({score:0,turnScore:0,dice:[],lastRoll:[]}));
  g.turn=0;
},
update(g,dt){
  const I=g.I[g.turn];
  if(!I.pa)return;
  const s=g.st[g.turn];
  if(s.dice.length===0){
    s.dice=Array.from({length:6},()=>ri(1,6));
    s.turnScore=farkleScore(s.dice);
    s.lastRoll=s.dice.slice();
    FX.tone(500,.08,"square",.03);
    if(s.turnScore===0){
      g.banner_("FARKLE!",RED,1);
      s.dice=[];
      g.turn=1-g.turn;
      FX.tone(150,.25,"sawtooth",.05,-40);
    }
  }else{
    s.score+=s.turnScore;
    s.turnScore=0;
    s.dice=[];
    g.turn=1-g.turn;
    FX.tone(800,.1,"square",.04);
    if(s.score>=1000)g.byScore(g.st.map(x=>x.score));
  }
},
draw(g,ctx){
  ctx.fillStyle="#1a1a3a";ctx.fillRect(0,0,W,H);
  g.text("FARKLE",W/2,40,28,GOLD,"center");
  [0,1].forEach(p=>{
    const s=g.st[p];
    g.text("P"+(p+1)+"  SCORE: "+s.score,p?W-30:30,70,18,col(p),p?"right":"left");
  });
  const s=g.st[g.turn];
  if(s.dice.length>0){
    s.dice.forEach((d,k)=>{
      const x=200+k*90,y=180;
      ctx.fillStyle="#fff";ctx.fillRect(x,y,70,70);
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(x,y,70,70);
      g.text(String(d),x+35,y+52,44,"#111","center");
    });
    g.text("TURN VALUE: "+s.turnScore,W/2,300,24,GOLD,"center");
    g.text("SPACE/ENTER to BANK",W/2,340,16,col(g.turn),"center");
  }else{
    g.text("P"+(g.turn+1)+" — SPACE/ENTER to ROLL",W/2,300,22,col(g.turn),"center");
  }
  g.text("Score 1000+ to win · No scoring dice = FARKLE",W/2,460,14,"#9fc0ff","center");
}
});
function farkleScore(dice){
  const cnt={};
  dice.forEach(d=>cnt[d]=(cnt[d]||0)+1);
  let s=0;
  for(const [v,n] of Object.entries(cnt)){
    const val=Number(v);
    if(val===1){
      if(n>=3)s+=1000+(n-3)*100;
      else s+=n*100;
    }else if(val===5){
      if(n>=3)s+=500+(n-3)*50;
      else s+=n*50;
    }else if(n>=3){
      s+=val*100+(n-3)*val*100;
    }
  }
  return s;
}

/* TOWER OF HANOI */
unregister("hanoiGame");
micro({id:"hanoiGame",title:"Tower of Hanoi",desc:"Move all 5 discs to the right peg.",
cat:"brain",key:"hanoi",win:3,
controls:"Click a peg to pick up its top disc, click another peg to drop it. Bigger on smaller blocked.",
round(g){
  g.towers=[[[5,4,3,2,1],[],[]],[[5,4,3,2,1],[],[]]];
  g.sel=[-1,-1];
},
click(g,x,y){
  if(y<180||y>460)return;
  for(let p=0;p<2;p++){
    const ox=p?525:75;
    for(let k=0;k<3;k++){
      const px=ox+k*110+55;
      if(Math.abs(x-px)<50){
        const tw=g.towers[p];
        if(g.sel[p]>=0){
          const from=tw[g.sel[p]],to=tw[k];
          if(from.length&&(!to.length||to[to.length-1]>from[from.length-1])){
            to.push(from.pop());
            FX.tone(400,.06,"square",.03);
            if(tw[2].length===5){g.point(p,"SOLVED");return;}
          }
          g.sel[p]=-1;
        }else if(tw[k].length)g.sel[p]=k;
      }
    }
  }
},
draw(g,ctx){
  ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
  for(let p=0;p<2;p++){
    const ox=p?525:75;
    ctx.fillStyle="#4a3a2a";ctx.fillRect(ox+20,440,290,20);
    for(let k=0;k<3;k++){ctx.fillStyle="#8a6a3a";ctx.fillRect(ox+k*110+52,180,8,260);}
    const tw=g.towers[p];
    for(let k=0;k<3;k++){
      tw[k].forEach((size,idx)=>{
        const cx=ox+k*110+56,cy=430-idx*32;
        const w=size*18+20;
        const isSel=g.sel[p]===k&&idx===tw[k].length-1;
        ctx.fillStyle=isSel?GOLD:["#ff6a6a","#ffb03a","#ffe66d","#6aff8a","#6ab0ff"][size-1];
        ctx.fillRect(cx-w/2,cy-28,w,28);
        ctx.strokeStyle="#080b18";ctx.lineWidth=2;
        ctx.strokeRect(cx-w/2,cy-28,w,28);
        g.text(String(size),cx,cy-6,14,"#080b18","center");
      });
    }
    g.text("P"+(p+1),ox+165,150,20,col(p),"center");
  }
  ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* CLONE ARMY — visual clarity */
unregister("cloneGame");
micro({id:"cloneGame",title:"Clone Army",desc:"Spawn clones. March them into your rival.",
cat:"action",key:"clone",win:3,
controls:"P1: A/D move, SPACE spawn　 P2: ←/→, ENTER — clones march forward and hit rival",
round(g){
  g.pl=[
    {x:100,y:250,meter:0,hp:3},
    {x:800,y:250,meter:0,hp:3}
  ];
  g.clones=[];
},
update(g,dt){
  g.pl.forEach((p,i)=>{
    const I=g.I[i];
    p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*220*dt,40,W-40);
    p.meter=Math.min(1,p.meter+dt*.25);
    if(I.pa&&p.meter>=1){
      p.meter=0;
      g.clones.push({x:p.x+((i?-1:1)*30),y:p.y,i,vx:(i?-1:1)*100,life:8});
      FX.tone(500,.15,"triangle",.05,200);
    }
  });
  g.clones.forEach(c=>{
    c.x+=c.vx*dt;c.life-=dt;
    const t=g.pl[1-c.i];
    if(Math.hypot(c.x-t.x,c.y-t.y)<28){
      t.hp--;c.life=0;
      g.burst(t.x,t.y,col(c.i),12,300);playHitSound();
      if(t.hp<=0){g.point(c.i,"DESTROYED");return;}
    }
  });
  g.clones=g.clones.filter(c=>c.life>0&&c.x>20&&c.x<W-20);
},
draw(g,ctx){
  ctx.fillStyle="#101a3a";ctx.fillRect(0,0,W,H);
  ctx.fillStyle="rgba(255,255,255,.1)";ctx.fillRect(W/2-3,40,6,H-40);
  g.clones.forEach(c=>{
    ctx.fillStyle=col(c.i);ctx.globalAlpha=Math.min(1,c.life/2);
    ctx.beginPath();ctx.arc(c.x,c.y,12,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
    ctx.globalAlpha=1;
  });
  g.pl.forEach((p,i)=>{
    g.blob({x:p.x,y:p.y,r:18},col(i),p.x+60,p.y,false);
    ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+30,60,8);
    ctx.fillStyle=p.meter>=1?GOLD:"#4a8aff";
    ctx.fillRect(p.x-30,p.y+30,60*p.meter,8);
    g.text("P"+(i+1)+(p.meter>=1?" READY":""),p.x,p.y-40,12,col(i),"center");
    for(let k=0;k<3;k++){
      ctx.fillStyle=k<p.hp?RED:"#2a2f63";
      ctx.fillRect(i?W-80-k*18:20+k*18,55,14,14);
    }
  });
}
});

/* GRAVITY PAINT */
unregister("gravpaintGame");
micro({id:"gravpaintGame",title:"Gravity Paint",desc:"Paint the floor, pull rival to it.",
cat:"action",key:"gravpaint",win:3,
controls:"P1: WASD move, SPACE paint　 P2: ARROWS, ENTER — paint pulls your rival",
round(g){
  g.pl=[{x:200,y:200,hp:3,paint:0,cd:0},{x:700,y:300,hp:3,paint:0,cd:0}];
  g.paint=[];
},
update(g,dt){
  g.pl.forEach((p,i)=>{
    const I=g.I[i];
    p.cd=Math.max(0,p.cd-dt);
    if(I.a&&p.cd<=0){
      p.cd=1.5;
      g.paint.push({x:p.x,y:p.y,o:i,life:5});
    }
    const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0),l=Math.hypot(ax,ay)||1;
    p.x+=ax/l*240*dt;p.y+=ay/l*240*dt;
    let gx=0,gy=0;
    g.paint.forEach(pt=>{
      if(pt.o===i)return;
      const dx=pt.x-p.x,dy=pt.y-p.y,d=Math.max(Math.hypot(dx,dy),40);
      gx+=dx/d*(120/d)*40;gy+=dy/d*(120/d)*40;
    });
    p.x+=gx*dt;p.y+=gy*dt;
    p.x=cl(p.x,20,W-20);p.y=cl(p.y,60,H-20);
    const inSpike=(p.x<100&&p.y<140)||(p.x>W-100&&p.y<140)||(p.x<100&&p.y>H-100)||(p.x>W-100&&p.y>H-100);
    if(inSpike){p.hp-=dt*2;if(p.hp<=0)g.point(1-i,"SPIKED");}
  });
  g.paint.forEach(pt=>pt.life-=dt);
  g.paint=g.paint.filter(pt=>pt.life>0);
},
draw(g,ctx){
  ctx.fillStyle="#0a1020";ctx.fillRect(0,0,W,H);
  g.paint.forEach(pt=>{
    ctx.fillStyle=col(pt.o);ctx.globalAlpha=pt.life/5*.4;
    ctx.beginPath();ctx.arc(pt.x,pt.y,45,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
  });
  ctx.fillStyle="#3a3a4a";
  for(let k=0;k<5;k++){
    ctx.beginPath();ctx.moveTo(k*18,0);ctx.lineTo(k*18+9,60);ctx.lineTo(k*18+18,0);ctx.fill();
    ctx.beginPath();ctx.moveTo(W-k*18,0);ctx.lineTo(W-k*18-9,60);ctx.lineTo(W-k*18-18,0);ctx.fill();
    ctx.beginPath();ctx.moveTo(k*18,H);ctx.lineTo(k*18+9,H-60);ctx.lineTo(k*18+18,H);ctx.fill();
    ctx.beginPath();ctx.moveTo(W-k*18,H);ctx.lineTo(W-k*18-9,H-60);ctx.lineTo(W-k*18-18,H);ctx.fill();
  }
  g.pl.forEach((p,i)=>{
    g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,false);
    ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,6);
    ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/3,6);
    g.text("P"+(i+1),p.x,p.y-30,12,col(i),"center");
  });
}
});

/* COVER FIRE — proper duck animation */
unregister("coverGame");
micro({id:"coverGame",title:"Cover Fire",desc:"Peek, shoot, duck. Three hits and you're out.",
cat:"action",key:"cover",win:3,
controls:"P1: hold S to duck, SPACE shoot　 P2: hold ↓ to duck, ENTER shoot",
round(g){
  g.p=[
    {hp:3,ammo:3,cd:0,hid:false,rl:0,hit:0,animHid:0},
    {hp:3,ammo:3,cd:0,hid:false,rl:0,hit:0,animHid:0}
  ];
  g.bl=[];
},
update(g,dt){
  g.p.forEach((p,i)=>{
    const I=g.I[i];
    p.hid=!!I.d;
    p.animHid += ((p.hid?1:0)-p.animHid)*Math.min(1,dt*12);
    p.cd=Math.max(0,p.cd-dt);
    p.hit=Math.max(0,p.hit-dt);
    if(p.hid&&p.ammo<3){
      p.rl+=dt;
      if(p.rl>.45){p.rl=0;p.ammo++;FX.tone(700,.04,"square",.03);}
    }else if(!p.hid)p.rl=0;
    if(I.pa&&!p.hid&&p.cd<=0&&p.ammo>0){
      p.cd=.45;p.ammo--;
      g.bl.push({x:i?770:130,vx:i?-780:780,o:i});
      FX.playShoot();
      g.burst(i?740:160,320,GOLD,4,150);
    }
  });
  for(const b of g.bl){
    b.x+=b.vx*dt;
    const t=g.p[1-b.o],tx=b.o?130:770;
    if(!b.dead&&(b.vx>0?b.x>=tx-12:b.x<=tx+12)){
      b.dead=true;
      if(!t.hid){
        t.hp--;t.hit=.4;
        g.burst(tx,330,RED,16,320);
        playHitSound();
        if(t.hp<=0){g.point(b.o);return;}
      }else{
        g.burst(tx,300,"#fff",3,100);
      }
    }
  }
  g.bl=g.bl.filter(b=>!b.dead&&b.x>-20&&b.x<W+20);
},
draw(g,ctx){
  const gr=ctx.createLinearGradient(0,0,0,H);
  gr.addColorStop(0,"#e8a05a");gr.addColorStop(.6,"#c8703a");gr.addColorStop(1,"#6a3a2a");
  ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#8a4a2a";ctx.fillRect(0,400,W,100);
  ctx.fillStyle="#d8c070";
  ctx.beginPath();ctx.arc(450,140,40,0,Math.PI*2);ctx.fill();
  g.p.forEach((p,i)=>{
    const x=i?770:130;
    const dir=i?-1:1;
    const crate=i?650:210;
    const crouchY = p.animHid*60;
    const crouchX = p.animHid*20*dir;
    ctx.save();
    ctx.translate(x+crouchX,400+crouchY);
    ctx.scale(dir*1.6, 1.6);
    if(p.hit>0&&Math.floor(p.hit*30)%2)ctx.globalAlpha=.4;
    FX.drawFighter(ctx,22,34,col(i),1,false,p.hit>0);
    if(!p.hid){
      ctx.fillStyle="#2a1e15";
      ctx.fillRect(20,-48,34,10);
      ctx.fillStyle=GOLD;
      ctx.fillRect(50,-46,6,6);
    }
    ctx.globalAlpha=1;
    ctx.restore();
    ctx.fillStyle="#7a4a22";
    ctx.fillRect(crate,335,70,65);
    ctx.strokeStyle="#3a2210";
    ctx.lineWidth=3;
    ctx.strokeRect(crate,335,70,65);
    ctx.beginPath();ctx.moveTo(crate,335);ctx.lineTo(crate+70,400);
    ctx.moveTo(crate+70,335);ctx.lineTo(crate,400);ctx.stroke();
    g.text("♥".repeat(Math.max(0,p.hp)),i?W-20:20,60,22,"#ff3366",i?"right":"left");
    for(let k=0;k<3;k++){
      ctx.fillStyle=k<p.ammo?GOLD:"#3a3f6a";
      ctx.fillRect((i?W-30-k*16:20+k*16),72,10,16);
    }
    if(p.hid)g.text("DUCKED",i?W-20:20,105,14,"#9fc0ff",i?"right":"left");
    else if(p.rl>0){
      ctx.fillStyle="#3a3f6a";ctx.fillRect(i?W-70:20,105,50,4);
      ctx.fillStyle=GOLD;ctx.fillRect(i?W-70:20,105,50*(p.rl/.45),4);
    }
  });
  for(const b of g.bl){
    ctx.fillStyle="rgba(255,230,109,.5)";
    ctx.fillRect(b.vx>0?b.x-40:b.x,318,40,4);
    ctx.fillStyle="#fff";
    ctx.fillRect(b.x-4,317,8,6);
  }
}
});

})();