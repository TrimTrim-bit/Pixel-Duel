/* =====================================================
   GAME PACK Y — 4 more games
   Bubble Trouble, Ninja Jump, Slingshot Siege, Space Invaders
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* ---------- BUBBLE TROUBLE ---------- */
micro({
  id:"bubbleTroubleGame",title:"Bubble Trouble",desc:"Pop bouncing balls. Avoid getting hit.",
  cat:"arcade",key:"bubble",win:3,
  controls:"P1: A/D move, W fire　 P2: ←/→ move, ↑ fire — 3 HP each, split screens",
  round(g){
    g.pl=[
      {x:225,y:440,cd:0,hp:3,color:C1},
      {x:675,y:440,cd:0,hp:3,color:C2}
    ];
    g.bullets=[];
    g.balls=[[],[]];
    g.spawnT=[1,1];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.cd=Math.max(0,p.cd-dt);
      if(I.l)p.x-=260*dt;
      if(I.r)p.x+=260*dt;
      p.x=cl(p.x,i?475:25,i?875:425);
      if(I.a&&p.cd<=0){
        p.cd=.35;
        g.bullets.push({x:p.x,y:p.y-20,vx:0,vy:-460,o:i});
        FX.tone(600,.05,"square",.03);
      }
    });
    g.spawnT.forEach((t,i)=>{
      g.spawnT[i]-=dt;
      if(g.spawnT[i]<=0&&g.balls[i].length<6){
        g.spawnT[i]=Math.max(1,2-g.t*.05);
        const a=rnd(0,Math.PI*2);
        g.balls[i].push({x:i*450+225,y:200,vx:Math.cos(a)*150,vy:Math.sin(a)*150,r:16});
      }
    });
    for(let i=0;i<2;i++){
      const x0=i*450+20,x1=i*450+430;
      g.balls[i].forEach(b=>{
        b.x+=b.vx*dt;b.y+=b.vy*dt;
        if(b.x<b.r+x0){b.x=b.r+x0;b.vx=Math.abs(b.vx);}
        if(b.x>x1-b.r){b.x=x1-b.r;b.vx=-Math.abs(b.vx);}
        if(b.y<b.r+20){b.y=b.r+20;b.vy=Math.abs(b.vy);}
        if(b.y>H-b.r){b.y=H-b.r;b.vy=-Math.abs(b.vy);}
        const p=g.pl[i];
        if(Math.hypot(b.x-p.x,b.y-p.y)<b.r+16){
          p.hp--;b.dead=true;
          g.burst(p.x,p.y,col(i),14,300);FX.playBoom();
          if(p.hp<=0)g.point(1-i,"HIT!");
        }
      });
      g.balls[i]=g.balls[i].filter(b=>!b.dead);
    }
    g.bullets.forEach(b=>{
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.y<0)b.dead=true;
      for(const ball of g.balls[b.o]){
        if(Math.hypot(b.x-ball.x,b.y-ball.y)<ball.r+6){
          ball.dead=true;b.dead=true;
          g.burst(ball.x,ball.y,col(b.o),10,240);
          FX.tone(900,.05,"square",.05);
          break;
        }
      }
    });
    g.bullets=g.bullets.filter(b=>!b.dead);
  },
  draw(g,ctx){
    for(let i=0;i<2;i++){
      const off=i*450;
      ctx.fillStyle=i?"#1a1030":"#0f1530";ctx.fillRect(off,0,450,H);
      ctx.fillStyle="rgba(255,255,255,.05)";
      for(let k=0;k<15;k++)ctx.fillRect(off+(k*97)%450,(k*61)%H,30,3);
      g.balls[i].forEach(b=>{
        ctx.fillStyle=col(i);
        ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
        ctx.fillStyle="rgba(255,255,255,.4)";
        ctx.beginPath();ctx.arc(b.x-4,b.y-4,4,0,Math.PI*2);ctx.fill();
      });
    }
    g.bullets.forEach(b=>{
      ctx.fillStyle=GOLD;
      ctx.fillRect(b.x-3,b.y-8,6,16);
    });
    g.pl.forEach((p,i)=>{
      ctx.fillStyle=col(i);
      ctx.fillRect(p.x-16,p.y-16,32,32);
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(p.x-16,p.y-16,32,32);
      ctx.fillStyle="#fff";
      ctx.fillRect(p.x-8,p.y-6,6,6);ctx.fillRect(p.x+2,p.y-6,6,6);
      g.text("♥".repeat(Math.max(0,p.hp)),i?W-20:20,30,16,"#ff3366",i?"right":"left");
    });
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* ---------- NINJA JUMP ---------- */
micro({
  id:"ninjaJumpGame",title:"Ninja Jump",desc:"Wall-jump up to the top. First up wins.",
  cat:"action",key:"ninja",win:3,
  controls:"P1: A (jump off right wall) / D (jump off left wall)　 P2: ← / → — alternate to climb",
  round(g){
    g.pl=[
      {x:225,y:440,vy:0,side:1,hp:3},
      {x:675,y:440,vy:0,side:-1,hp:3}
    ];
    g.best=[440,440];
  },
  update(g,dt){
    const reach=[false,false];
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      const cx=i*450;
      p.vy+=1400*dt;
      p.y+=p.vy*dt;
      p.x=cx+(p.side>0?370:80);
      if(((p.side>0&&I.l)||(p.side<0&&I.r))&&p.y>80){
        p.vy=-660;
        p.side*=-1;
        FX.tone(400,.08,"square",.04,200);
      }
      if(p.y>440){p.y=440;p.vy=0;}
      if(p.y<g.best[i])g.best[i]=p.y;
      if(p.y<80)reach[i]=true;
    });
    if(reach[0]&&reach[1])g.next("PHOTO FINISH");
    else if(reach[0])g.point(0,"TOP!");
    else if(reach[1])g.point(1,"TOP!");
  },
  draw(g,ctx){
    for(let i=0;i<2;i++){
      const cx=i*450;
      ctx.fillStyle=i?"#2a1020":"#102030";ctx.fillRect(cx,0,450,H);
      ctx.fillStyle="#5a3a8a";ctx.fillRect(cx+40,0,20,H);
      ctx.fillRect(cx+390,0,20,H);
      ctx.fillStyle="#3a2a4a";ctx.fillRect(cx,450,450,50);
      const p=g.pl[i];
      ctx.save();ctx.translate(p.x,p.y);
      ctx.fillStyle=col(i);
      ctx.fillRect(-12,-12,24,24);
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(-12,-12,24,24);
      ctx.fillStyle="#fff";
      ctx.fillRect(-6,-4,4,4);ctx.fillRect(2,-4,4,4);
      ctx.restore();
      g.text("P"+(i+1),cx+225,30,20,col(i),"center");
      g.text("BEST: "+Math.round(440-g.best[i])+"m",cx+225,55,14,"#9fc0ff","center");
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* ---------- SLINGSHOT SIEGE ---------- */
micro({
  id:"slingshotSiegeGame",title:"Slingshot Siege",desc:"Knock down your tower. First to clear wins.",
  cat:"action",key:"slingshot",win:3,
  controls:"Aim with A/D or ←/→. Hold W or ↑ to charge, release to fire at your target tower",
  round(g){
    g.towers=[[],[]];
    for(let r=0;r<4;r++)for(let c=0;c<3;c++){
      g.towers[0].push({x:520+c*45,y:H-60-r*40,w:40,h:36,hp:2,fallen:false});
      g.towers[1].push({x:W-520-c*45-40,y:H-60-r*40,w:40,h:36,hp:2,fallen:false});
    }
    g.pl=[
      {x:80,y:H-60,ang:-.4,charge:0,charging:false},
      {x:W-80,y:H-60,ang:Math.PI+.4,charge:0,charging:false}
    ];
    g.projectiles=[];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      const dir=i?-1:1;
      if(!p.charging){
        if(I.l)p.ang-=1.4*dt*dir;
        if(I.r)p.ang+=1.4*dt*dir;
        if(I.u){p.charging=true;p.charge=0;}
      }else{
        p.charge=Math.min(1,p.charge+dt*1.4);
        if(!I.u){
          const speed=340+p.charge*440;
          g.projectiles.push({x:p.x,y:p.y-20,vx:Math.cos(p.ang)*speed,vy:Math.sin(p.ang)*speed,o:i});
          p.charging=false;p.charge=0;
          FX.tone(300,.15,"sawtooth",.04,-200);
        }
      }
    });
    g.projectiles.forEach(pr=>{
      pr.vy+=600*dt;
      pr.x+=pr.vx*dt;pr.y+=pr.vy*dt;
      for(const b of g.towers[pr.o]){
        if(b.fallen)continue;
        if(pr.x>b.x-10&&pr.x<b.x+b.w+10&&pr.y>b.y-10&&pr.y<b.y+b.h+10){
          b.hp--;pr.dead=true;
          g.burst(b.x+b.w/2,b.y+b.h/2,col(pr.o),10,240);
          FX.tone(300,.08,"square",.04);
          if(b.hp<=0){
            b.fallen=true;
            if(g.towers[pr.o].every(t=>t.fallen))g.point(pr.o,"TOWER DOWN!");
          }
          break;
        }
      }
      if(pr.y>H+50||pr.x<-50||pr.x>W+50)pr.dead=true;
    });
    g.projectiles=g.projectiles.filter(p=>!p.dead);
  },
  draw(g,ctx){
    const gr=ctx.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,"#2a5a8a");gr.addColorStop(1,"#0a2a4a");
    ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#4a6a2a";ctx.fillRect(0,H-40,W,40);
    ctx.fillStyle="#3a5a1a";ctx.fillRect(0,H-40,W,4);
    [0,1].forEach(ti=>{
      g.towers[ti].forEach(b=>{
        if(b.fallen)return;
        ctx.fillStyle=ti?C2:C1;
        ctx.globalAlpha=.3;
        ctx.fillRect(b.x,b.y,b.w,b.h);
        ctx.globalAlpha=1;
        ctx.fillStyle="#8a5a3a";ctx.fillRect(b.x,b.y,b.w,b.h);
        ctx.strokeStyle="#3a2010";ctx.lineWidth=3;ctx.strokeRect(b.x,b.y,b.w,b.h);
        ctx.fillStyle="rgba(255,255,255,.15)";ctx.fillRect(b.x,b.y,b.w,4);
      });
    });
    g.projectiles.forEach(p=>{
      ctx.fillStyle="#111";
      ctx.beginPath();ctx.arc(p.x,p.y,8,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=col(p.o);ctx.lineWidth=2;ctx.stroke();
    });
    g.pl.forEach((p,i)=>{
      ctx.fillStyle="#7a4a22";ctx.fillRect(p.x-8,p.y-40,16,40);
      ctx.fillRect(p.x-20,p.y-40,40,4);
      if(p.charging){
        const speed=340+p.charge*440;
        const endX=p.x+Math.cos(p.ang)*speed*.15;
        const endY=p.y-20+Math.sin(p.ang)*speed*.15;
        ctx.strokeStyle=col(i);ctx.lineWidth=2;ctx.setLineDash([6,6]);
        ctx.beginPath();ctx.moveTo(p.x,p.y-20);ctx.lineTo(endX,endY);ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle="#080b18";ctx.fillRect(p.x-40,p.y+20,80,8);
        ctx.fillStyle=col(i);ctx.fillRect(p.x-40,p.y+20,80*p.charge,8);
      }
      ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(p.x,p.y+20,12,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
    });
  }
});

/* ---------- SPACE INVADERS ---------- */
micro({
  id:"invadersGame",title:"Space Invaders",desc:"Classic invader waves. First to clear wins.",
  cat:"arcade",key:"invaders",win:3,
  controls:"P1: A/D move, W fire　 P2: ←/→, ↑ — identical starting formations, clear yours first",
  round(g){
    g.pl=[
      {x:225,y:440,cd:0},
      {x:675,y:440,cd:0}
    ];
    g.inv=[[],[]];
    g.bullets=[[],[]];
    g.invDir=[1,1];
    for(let r=0;r<3;r++)for(let c=0;c<6;c++){
      g.inv[0].push({x:70+c*50,y:60+r*40,alive:true});
      g.inv[1].push({x:70+c*50,y:60+r*40,alive:true});
    }
    g.invT=0;
  },
  update(g,dt){
    g.invT+=dt;
    const cleared=[false,false];
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      const off=i*450;
      p.cd=Math.max(0,p.cd-dt);
      if(I.l)p.x-=260*dt;
      if(I.r)p.x+=260*dt;
      p.x=cl(p.x,off+20,off+430);
      if(I.a&&p.cd<=0){
        p.cd=.3;
        g.bullets[i].push({x:p.x,y:p.y-15,vy:-500});
        FX.tone(500,.05,"square",.03);
      }
    });
    g.bullets.forEach((arr,i)=>{
      arr.forEach(b=>{
        b.y+=b.vy*dt;
        if(b.y<0)b.dead=true;
        for(const inv of g.inv[i]){
          if(!inv.alive)continue;
          if(Math.abs(b.x-inv.x)<20&&Math.abs(b.y-inv.y)<20){
            inv.alive=false;b.dead=true;
            g.burst(i*450+inv.x,inv.y,col(i),8,180);
            FX.tone(700,.05,"square",.04);
            if(g.inv[i].every(x=>!x.alive))cleared[i]=true;
            break;
          }
        }
      });
      g.bullets[i]=arr.filter(b=>!b.dead);
    });
    if(g.invT>.5){
      g.invT=0;
      g.inv.forEach((arr,i)=>{
        const alive=arr.filter(x=>x.alive);
        if(!alive.length)return;
        const minX=Math.min(...alive.map(x=>x.x));
        const maxX=Math.max(...alive.map(x=>x.x));
        if((g.invDir[i]>0&&maxX>390)||(g.invDir[i]<0&&minX<40)){
          g.invDir[i]*=-1;
          arr.forEach(x=>{if(x.alive)x.y+=16;});
        }else{
          arr.forEach(x=>{if(x.alive)x.x+=g.invDir[i]*15;});
        }
      });
    }
    if(cleared[0]&&cleared[1])g.next("PHOTO FINISH");
    else if(cleared[0])g.point(0,"CLEARED!");
    else if(cleared[1])g.point(1,"CLEARED!");
  },
  draw(g,ctx){
    for(let i=0;i<2;i++){
      const off=i*450;
      ctx.fillStyle=i?"#1a0d2a":"#0b1030";ctx.fillRect(off,0,450,H);
      ctx.fillStyle="#2a3a6a";
      for(let k=0;k<20;k++)ctx.fillRect(off+(k*67)%450,(k*43)%H,2,2);
      g.inv[i].forEach(inv=>{
        if(!inv.alive)return;
        ctx.fillStyle=col(i);
        ctx.fillRect(off+inv.x-15,inv.y-10,30,20);
        ctx.fillStyle="#fff";
        ctx.fillRect(off+inv.x-8,inv.y-6,6,6);
        ctx.fillRect(off+inv.x+2,inv.y-6,6,6);
        ctx.fillStyle="#11152b";
        ctx.fillRect(off+inv.x-6,inv.y-4,3,3);
        ctx.fillRect(off+inv.x+4,inv.y-4,3,3);
      });
      g.bullets[i].forEach(b=>{
        ctx.fillStyle=GOLD;
        ctx.fillRect(b.x-2,b.y-8,4,12);
      });
      const p=g.pl[i];
      ctx.fillStyle=col(i);
      ctx.beginPath();
      ctx.moveTo(p.x,p.y-18);
      ctx.lineTo(p.x+18,p.y+18);
      ctx.lineTo(p.x-18,p.y+18);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

})();