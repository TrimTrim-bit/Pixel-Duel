/* =====================================================
   GAME PACK AD — 5 games
   Tower Stack, Precision Shot, Warp Dash,
   Bounce Target, Whack Duel
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* 1. TOWER STACK (2P) */
micro({
  id:"towerstackGame",title:"Tower Stack",desc:"Stack blocks higher than rival.",
  cat:"reflex",key:"towerstack",win:3,
  controls:"P1: SPACE drop block　 P2: ENTER — block shrinks on overlap, miss = out",
  round(g){
    g.pl=[
      {stack:[{x:-70,w:140}],cur:{x:-140,w:140,dir:1},speed:140,alive:true},
      {stack:[{x:-70,w:140}],cur:{x:-140,w:140,dir:1},speed:140,alive:true}
    ];
  },
  update(g,dt){
    const dead=[];
    g.pl.forEach((p,i)=>{
      if(!p.alive)return;
      const c=p.cur;
      c.x+=c.dir*p.speed*dt;
      if(c.x>200-c.w*.2){c.dir=-1;}
      if(c.x<-200-c.w*.8){c.dir=1;}
      if(g.I[i].pa){
        const top=p.stack[p.stack.length-1];
        const l=Math.max(c.x,top.x),r=Math.min(c.x+c.w,top.x+top.w);
        const w=r-l;
        if(w<=2){p.alive=false;dead.push(i);FX.playBoom();g.burst(i*450+225,H-100,C1,25,400);}
        else{
          const perfect=Math.abs(c.x-top.x)<5;
          p.stack.push({x:perfect?top.x:l,w:perfect?top.w:w});
          FX.tone(perfect?900:500+p.stack.length*20,.08,"square",.04);
          g.burst(i*450+225+(l+w/2),H-100-p.stack.length*20,col(i),6,150);
          p.cur={x:-220,w:perfect?top.w:w,dir:1};
          p.speed=Math.min(340,140+p.stack.length*8);
        }
      }
    });
    if(dead.length===2)g.next("BOTH TOPPLED");
    else if(dead.length===1)g.point(1-dead[0],"RIVAL OUT");
  },
  draw(g,ctx){
    for(let i=0;i<2;i++){
      const off=i*450,p=g.pl[i];
      ctx.fillStyle=i?"#1a1030":"#0f1530";ctx.fillRect(off,0,450,H);
      ctx.fillStyle="rgba(255,255,255,.1)";ctx.fillRect(off+225-1,0,2,H);
      if(!p.alive){g.text("OUT",off+225,250,40,RED,"center");continue;}
      p.stack.forEach((b,k)=>{
        const y=H-60-k*20;
        if(y<80)return;
        ctx.fillStyle=`hsl(${(k*28+i*80)%360},70%,${k===0?35:58}%)`;
        ctx.fillRect(off+225+b.x,y,b.w,18);
        ctx.fillStyle="rgba(255,255,255,.3)";
        ctx.fillRect(off+225+b.x,y,b.w,3);
        ctx.strokeStyle="#080b18";ctx.lineWidth=1;
        ctx.strokeRect(off+225+b.x,y,b.w,18);
      });
      const c=p.cur,y=H-60-p.stack.length*20;
      ctx.fillStyle=col(i);
      ctx.fillRect(off+225+c.x,y,c.w,18);
      ctx.strokeStyle="#fff";ctx.lineWidth=2;
      ctx.strokeRect(off+225+c.x,y,c.w,18);
      g.text("P"+(i+1)+" H:"+p.stack.length,off+225,30,18,col(i),"center");
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* 2. PRECISION SHOT */
micro({
  id:"precisionGame",title:"Precision Shot",desc:"Aim and hit the smallest ring. 5 shots each.",
  cat:"reflex",key:"precision",win:3,
  controls:"P1: WASD aim, SPACE fire　 P2: ARROWS, ENTER — center hits score more",
  round(g){
    g.pl=[{aim:0,cd:0,score:0,shots:5},{aim:Math.PI,cd:0,score:0,shots:5}];
    g.turn=0;
    g.target={x:W/2,y:250,r:60};
    g.bullets=[];
  },
  update(g,dt){
    const p=g.pl[g.turn],I=g.I[g.turn];
    if(p.shots<=0){g.turn=1-g.turn;if(g.pl[g.turn].shots<=0){g.byScore(g.pl.map(x=>x.score));}return;}
    p.cd=Math.max(0,p.cd-dt);
    if(I.l)p.aim-=.8*dt;
    if(I.r)p.aim+=.8*dt;
    if(I.u)p.aim=-Math.abs(p.aim)-.8*dt;
    if(I.d)p.aim=Math.abs(p.aim)+.8*dt;
    if(I.a&&p.cd<=0){
      p.cd=.5;p.shots--;
      const sx=g.turn?W-80:80,sy=250;
      g.bullets.push({x:sx,y:sy,vx:Math.cos(p.aim)*500,vy:Math.sin(p.aim)*500,o:g.turn});
      FX.tone(500,.05,"square",.04);
      g.turn=1-g.turn;
    }
    g.bullets.forEach(b=>{
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.x<0||b.x>W||b.y<0||b.y>H)b.dead=true;
      const d=Math.hypot(b.x-g.target.x,b.y-g.target.y);
      if(d<g.target.r){
        b.dead=true;
        const pts=d<g.target.r*.2?100:d<g.target.r*.5?50:20;
        g.pl[b.o].score+=pts;
        g.burst(b.x,b.y,GOLD,12,300);
        FX.playScore();
      }
    });
    g.bullets=g.bullets.filter(b=>!b.dead);
  },
  draw(g,ctx){
    ctx.fillStyle="#1a1230";ctx.fillRect(0,0,W,H);
    const t=g.target;
    [1,.6,.25].forEach((r,k)=>{
      ctx.strokeStyle=k===0?"#4a4a6a":k===1?"#8a3a3a":GOLD;
      ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(t.x,t.y,t.r*r,0,Math.PI*2);ctx.stroke();
    });
    ctx.fillStyle=GOLD;
    ctx.beginPath();ctx.arc(t.x,t.y,4,0,Math.PI*2);ctx.fill();
    g.bullets.forEach(b=>{
      ctx.fillStyle=col(b.o);
      ctx.beginPath();ctx.arc(b.x,b.y,5,0,Math.PI*2);ctx.fill();
    });
    g.pl.forEach((p,i)=>{
      const sx=i?W-80:80,sy=250;
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(sx,sy,16,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      if(g.turn===i&&p.shots>0){
        ctx.strokeStyle=col(i);ctx.lineWidth=2;ctx.setLineDash([8,6]);
        ctx.beginPath();ctx.moveTo(sx,sy);
        ctx.lineTo(sx+Math.cos(p.aim)*200,sy+Math.sin(p.aim)*200);
        ctx.stroke();ctx.setLineDash([]);
      }
      g.text("P"+(i+1)+" SCORE:"+p.score+" SHOTS:"+p.shots,i?W-20:20,30,16,col(i),i?"right":"left");
    });
    g.text("P"+(g.turn+1)+"'S TURN",W/2,30,18,col(g.turn),"center");
  }
});

/* 3. WARP DASH */
micro({
  id:"warpdashGame",title:"Warp Dash",desc:"Race through teleporters. First to finish wins.",
  cat:"reflex",key:"warpdash",win:3,
  controls:"P1: A/D move, W jump, SPACE dash　 P2: ←/→, ↑, ENTER — teleport portals boost you ahead",
  round(g){
    g.pl=[
      {x:50,y:400,vx:0,vy:0,dist:0,grounded:false},
      {x:50,y:400,vx:0,vy:0,dist:0,grounded:false}
    ];
    g.portals=[];
    const r=seeded(ri(1,1e6));
    for(let i=0;i<5;i++){
      g.portals.push({x:300+i*500,y:300,exitX:300+i*500+400,exitY:280});
    }
    g.finish=3000;
  },
  update(g,dt){
    let winner=-1;
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.vx=((I.r?1:0)-(I.l?1:0))*260;
      if(I.u&&p.grounded){p.vy=-560;p.grounded=false;}
      p.vy+=1300*dt;
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.y>=440){p.y=440;p.vy=0;p.grounded=true;}
      p.dist=Math.max(p.dist,p.x);
      for(const pt of g.portals){
        if(Math.abs(p.x-pt.x)<24&&Math.abs(p.y-pt.y)<40){
          p.x=pt.exitX;p.y=pt.exitY;
          g.burst(pt.exitX,pt.exitY,col(i),15,300);
          FX.tone(900,.15,"triangle",.05,300);
        }
      }
      if(p.dist>=g.finish&&winner<0)winner=i;
    });
    if(winner>=0)g.point(winner,"FINISHED!");
  },
  draw(g,ctx){
    const gr=ctx.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,"#2a1a4a");gr.addColorStop(1,"#0a0a20");
    ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    g.pl.forEach((p,i)=>{
      const camX=p.dist-225;
      ctx.save();
      ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();
      for(let x=Math.floor(camX/60)*60;x<camX+W;x+=60){
        const sx=x-camX;
        ctx.fillStyle="#3a3f6a";ctx.fillRect(sx,440,30,60);
      }
      for(const pt of g.portals){
        const sx=pt.x-camX;
        if(sx<-30||sx>W+30)continue;
        ctx.strokeStyle="#c46aff";ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(sx,pt.y,24,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle="rgba(196,106,255,.3)";
        ctx.beginPath();ctx.arc(sx,pt.y,20,0,Math.PI*2);ctx.fill();
      }
      const fx=g.finish-camX;
      if(fx>-30&&fx<W+30){
        ctx.fillStyle=GREEN;ctx.fillRect(fx,80,8,360);
        for(let k=0;k<20;k++){
          ctx.fillStyle=k%2?"#111":"#fff";
          ctx.fillRect(fx,80+k*18,8,18);
        }
      }
      const px=p.x-camX;
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(px,p.y-16,14,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.restore();
    });
    ctx.fillStyle="#080b18";ctx.fillRect(0,248,W,4);
    g.text("P1 "+(g.pl[0].dist/g.finish*100).toFixed(0)+"%",20,30,16,C1);
    g.text("P2 "+(g.pl[1].dist/g.finish*100).toFixed(0)+"%",W-20,280,16,C2,"right");
  }
});

/* 4. BOUNCE TARGET */
micro({
  id:"bouncetargetGame",title:"Bounce Target",desc:"Bank shots off walls to hit the moving target.",
  cat:"sports",key:"bouncetarget",win:3,
  controls:"P1: A/D aim, SPACE fire　 P2: ←/→, ENTER — walls bounce your shots",
  round(g){
    g.pl=[{aim:-.5,cd:0,score:0,shots:5},{aim:Math.PI+.5,cd:0,score:0,shots:5}];
    g.turn=0;
    g.target={x:W/2,y:250,vx:80,vy:60,r:20};
    g.bullets=[];
  },
  update(g,dt){
    g.target.x+=g.target.vx*dt;g.target.y+=g.target.vy*dt;
    if(g.target.x<40||g.target.x>W-40)g.target.vx*=-1;
    if(g.target.y<60||g.target.y>H-40)g.target.vy*=-1;
    const p=g.pl[g.turn],I=g.I[g.turn];
    if(p.shots<=0){g.turn=1-g.turn;if(g.pl[g.turn].shots<=0){g.byScore(g.pl.map(x=>x.score));}return;}
    p.cd=Math.max(0,p.cd-dt);
    if(I.l)p.aim-=.7*dt;
    if(I.r)p.aim+=.7*dt;
    if(I.a&&p.cd<=0){
      p.cd=.6;p.shots--;
      const sx=g.turn?W-50:50,sy=250;
      g.bullets.push({x:sx,y:sy,vx:Math.cos(p.aim)*380,vy:Math.sin(p.aim)*380,o:g.turn,b:0});
      FX.tone(500,.05,"square",.04);
      g.turn=1-g.turn;
    }
    g.bullets.forEach(b=>{
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.x<10||b.x>W-10){b.vx*=-1;b.x=cl(b.x,10,W-10);b.b++;}
      if(b.y<40||b.y>H-10){b.vy*=-1;b.y=cl(b.y,40,H-10);b.b++;}
      if(Math.hypot(b.x-g.target.x,b.y-g.target.y)<g.target.r+4){
        b.dead=true;
        const pts=b.b===0?100:b.b===1?50:25;
        g.pl[b.o].score+=pts;
        g.burst(b.x,b.y,GOLD,12,300);
        FX.playScore();
        g.target.x=rnd(80,W-80);g.target.y=rnd(100,H-80);
      }
      if(b.b>4)b.dead=true;
    });
    g.bullets=g.bullets.filter(b=>!b.dead);
  },
  draw(g,ctx){
    ctx.fillStyle="#1a1230";ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="#4a3a6a";ctx.lineWidth=6;
    ctx.strokeRect(6,36,W-12,H-42);
    ctx.fillStyle=GOLD;
    ctx.beginPath();ctx.arc(g.target.x,g.target.y,g.target.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle=RED;
    ctx.beginPath();ctx.arc(g.target.x,g.target.y,6,0,Math.PI*2);ctx.fill();
    g.bullets.forEach(b=>{
      ctx.fillStyle=col(b.o);
      ctx.beginPath();ctx.arc(b.x,b.y,5,0,Math.PI*2);ctx.fill();
    });
    g.pl.forEach((p,i)=>{
      const sx=i?W-50:50;
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(sx,250,14,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      if(g.turn===i&&p.shots>0){
        ctx.strokeStyle=col(i);ctx.lineWidth=2;ctx.setLineDash([8,6]);
        ctx.beginPath();ctx.moveTo(sx,250);
        ctx.lineTo(sx+Math.cos(p.aim)*250,250+Math.sin(p.aim)*250);
        ctx.stroke();ctx.setLineDash([]);
      }
      g.text("P"+(i+1)+" "+p.score+" ("+p.shots+")",i?W-20:20,30,16,col(i),i?"right":"left");
    });
  }
});

/* 5. WHACK DUEL */
micro({
  id:"whackGame",title:"Whack Duel",desc:"Whack targets in sequence. Timing matters.",
  cat:"reflex",key:"whack",win:1,hud:false,
  controls:"P1: 1/2/3 (top/middle/bottom target)　 P2: 7/8/9 — 30s, most hits wins",
  init(g){
    g.tl=30;g.s=[0,0];
    g.targets=[[],[]];
    g.spawnT=0;
    g.lastHit=[0,0];
  },
  update(g,dt){
    g.tl-=dt;g.spawnT-=dt;
    if(g.spawnT<=0){
      g.spawnT=Math.max(.4,1-g.tl*.02);
      for(let i=0;i<2;i++){
        const lane=ri(0,2);
        if(!g.targets[i].some(t=>t.lane===lane&&!t.dead)){
          g.targets[i].push({lane,t:1.5,dead:false});
        }
      }
    }
    g.targets.forEach((arr,i)=>{
      arr.forEach(t=>{if(!t.dead)t.t-=dt;if(t.t<=0)t.dead=true;});
    });
    g.targets=g.targets.map(arr=>arr.filter(t=>!t.dead));
    const p1Keys=["1","2","3"];
    const p2Keys=["7","8","9"];
    for(let i=0;i<2;i++){
      const keysArr=i?p2Keys:p1Keys;
      for(let k=0;k<3;k++){
        if(g.pk[keysArr[k]]){
          const hit=g.targets[i].find(t=>t.lane===k&&!t.dead);
          if(hit){
            hit.dead=true;
            g.s[i]++;
            g.burst(i?675:225,130+k*130,col(i),10,200);
            FX.tone(700+i*100,.05,"square",.04);
          }
        }
      }
    }
    if(g.tl<=0)g.byScore(g.s);
  },
  draw(g,ctx){
    for(let i=0;i<2;i++){
      const off=i*450;
      ctx.fillStyle=i?"#2a1a3a":"#1a2a3a";ctx.fillRect(off,0,450,H);
      for(let k=0;k<3;k++){
        const y=130+k*130;
        ctx.fillStyle="#3a2a1a";
        ctx.fillRect(off+80,y-40,290,80);
        ctx.strokeStyle="#080b18";ctx.lineWidth=2;
        ctx.strokeRect(off+80,y-40,290,80);
        g.text(String(k===0?(i?7:1):k===1?(i?8:2):(i?9:3)),off+30,y+6,24,"#9fc0ff","center");
        const t=g.targets[i].find(t=>t.lane===k&&!t.dead);
        if(t){
          ctx.fillStyle=col(i);
          ctx.beginPath();ctx.arc(off+225,y,30,0,Math.PI*2);ctx.fill();
          ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
          ctx.fillStyle="#fff";
          ctx.font="bold 16px Courier New";ctx.textAlign="center";
          ctx.fillText("!",off+225,y+6);ctx.textAlign="left";
        }
      }
      g.text("P"+(i+1)+" "+g.s[i],off+225,40,22,col(i),"center");
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
    g.text(Math.max(0,Math.ceil(g.tl))+"s",W/2,490,18,GOLD,"center");
  }
});

})();