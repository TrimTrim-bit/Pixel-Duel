/* =====================================================
   GAME PACK AC — 5 games
   Paintball, Ski Jump, Balloon Rise, Bowling Brawl,
   Space Defense
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* 1. PAINTBALL */
micro({
  id:"paintballGame",title:"Paintball",desc:"Splat the rival. 15 hits wins.",
  cat:"action",key:"paintball",win:3,
  controls:"P1: WASD move, SPACE fire　 P2: ARROWS, ENTER — paint sticks to the arena",
  round(g){
    g.pl=[
      {x:150,y:250,ang:0,hp:3,cd:0,splats:0},
      {x:750,y:250,ang:Math.PI,hp:3,cd:0,splats:0}
    ];
    g.paint=[];
    g.balls=[];
    g.covers=[
      {x:300,y:100,w:80,h:80},{x:300,y:320,w:80,h:80},
      {x:520,y:100,w:80,h:80},{x:520,y:320,w:80,h:80}
    ];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.cd=Math.max(0,p.cd-dt);
      let ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0);
      const l=Math.hypot(ax,ay);
      if(l>0){p.ang=Math.atan2(ay,ax);}
      p.x+=ax*180*dt;p.y+=ay*180*dt;
      p.x=cl(p.x,20,W-20);p.y=cl(p.y,60,H-20);
      for(const c of g.covers){
        if(p.x>c.x-14&&p.x<c.x+c.w+14&&p.y>c.y-14&&p.y<c.y+c.h+14){
          const dx=p.x-(c.x+c.w/2),dy=p.y-(c.y+c.h/2);
          if(Math.abs(dx)>Math.abs(dy))p.x=dx>0?c.x+c.w+14:c.x-14;
          else p.y=dy>0?c.y+c.h+14:c.y-14;
        }
      }
      if(I.a&&p.cd<=0){
        p.cd=.35;
        g.balls.push({x:p.x+Math.cos(p.ang)*18,y:p.y+Math.sin(p.ang)*18,
          vx:Math.cos(p.ang)*440,vy:Math.sin(p.ang)*440,o:i,life:1});
        FX.tone(500+i*100,.05,"square",.03);
      }
    });
    g.balls.forEach(b=>{
      b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
      if(b.life<=0||b.x<0||b.x>W||b.y<0||b.y>H)b.dead=true;
      for(const c of g.covers){
        if(b.x>c.x&&b.x<c.x+c.w&&b.y>c.y&&b.y<c.y+c.h){b.dead=true;break;}
      }
      if(!b.dead)for(let j=0;j<2;j++){
        if(j===b.o)continue;
        const t=g.pl[j];
        if(Math.hypot(b.x-t.x,b.y-t.y)<16){
          b.dead=true;t.hp--;
          g.burst(t.x,t.y,col(b.o),12,300);
          playHitSound();
          if(t.hp<=0)g.point(b.o,"SPLATTED!");
        }
      }
      if(b.dead&&Math.random()<.5){
        g.paint.push({x:b.x,y:b.y,color:col(b.o),life:8});
      }
    });
    g.balls=g.balls.filter(b=>!b.dead);
    g.paint.forEach(p=>p.life-=dt);
    g.paint=g.paint.filter(p=>p.life>0);
  },
  draw(g,ctx){
    ctx.fillStyle="#1a1230";ctx.fillRect(0,0,W,H);
    g.paint.forEach(p=>{
      ctx.fillStyle=p.color;ctx.globalAlpha=p.life/8*.5;
      ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    });
    for(const c of g.covers){
      ctx.fillStyle="#4a3a6a";ctx.fillRect(c.x,c.y,c.w,c.h);
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(c.x,c.y,c.w,c.h);
    }
    g.balls.forEach(b=>{
      ctx.fillStyle=col(b.o);
      ctx.beginPath();ctx.arc(b.x,b.y,5,0,Math.PI*2);ctx.fill();
    });
    g.pl.forEach((p,i)=>{
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.strokeStyle="#fff";ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(p.x,p.y);
      ctx.lineTo(p.x+Math.cos(p.ang)*20,p.y+Math.sin(p.ang)*20);ctx.stroke();
      ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-20,p.y+22,40,4);
      ctx.fillStyle=GREEN;ctx.fillRect(p.x-20,p.y+22,40*Math.max(0,p.hp)/3,4);
    });
  }
});

/* 2. SKI JUMP */
micro({
  id:"skijumpGame",title:"Ski Jump",desc:"Jump at the right moment. Longest jump wins.",
  cat:"sports",key:"skijump",win:1,hud:false,
  controls:"P1: hold SPACE to build speed, press W to jump　 P2: hold ENTER, press ↑ — 3 attempts",
  init(g){
    g.st=[0,1].map(()=>({x:0,speed:0,jumped:false,landed:false,res:0,best:0,attempt:0}));
    g.fin=0;
  },
  update(g,dt){
    g.st.forEach((s,i)=>{
      const I=g.I[i];
      if(s.landed){
        if(s.res>s.best)s.best=s.res;
        s.attempt++;
        if(s.attempt>=3){s.done=true;return;}
        s.x=0;s.speed=0;s.jumped=false;s.landed=false;s.res=0;
      }
      if(!s.jumped){
        if(I.a)s.speed=Math.min(1,s.speed+dt*1.2);
        s.x+=s.speed*500*dt;
        if(I.pu&&s.speed>.3&&s.x>100){
          s.jumped=true;
          s.jy=0;s.jvy=-250-s.speed*300;
          FX.tone(500,.1,"square",.04);
        }
      }else{
        s.jy+=s.jvy*dt;s.jvy+=900*dt;
        s.x+=s.speed*400*dt;
        if(s.jy>0){s.landed=true;s.res=Math.round(100+s.x/8+Math.random()*20);}
      }
    });
    if(g.st.every(s=>s.done||s.attempt>=3)){g.fin+=dt;if(g.fin>.8)g.byScore(g.st.map(s=>s.best));}
  },
  draw(g,ctx){
    const gr=ctx.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,"#3a8ac8");gr.addColorStop(1,"#a8d8ff");
    ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    g.st.forEach((s,i)=>{
      const off=i*450;
      ctx.fillStyle="#e8f4ff";ctx.fillRect(off,380,450,120);
      ctx.fillStyle="#8a6a4a";
      ctx.beginPath();
      ctx.moveTo(off+40,420);ctx.lineTo(off+200,420);
      ctx.lineTo(off+200,180);ctx.lineTo(off+120,180);
      ctx.closePath();ctx.fill();
      ctx.strokeStyle="#3a2a1a";ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle="#5a8ac8";ctx.fillRect(off+200,420,250,10);
      const sx=off+40+s.x;
      const sy=420-(s.jumped?s.jy:Math.min(200,s.x>120?200:s.x*1.5));
      ctx.fillStyle=col(i);
      ctx.fillRect(sx-8,sy-20,16,20);
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(sx-8,sy-20,16,20);
      ctx.fillStyle="#f3bd83";ctx.fillRect(sx-6,sy-32,12,12);
      ctx.strokeStyle="#fff";ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(sx-15,sy+2);ctx.lineTo(sx+15,sy+2);ctx.stroke();
      g.text("P"+(i+1)+" BEST: "+s.best+"m",off+225,30,18,col(i),"center");
      g.text("ATTEMPT "+Math.min(3,s.attempt+(s.done?0:1))+"/3",off+225,55,14,"#fff","center");
      ctx.fillStyle="#2a2f63";ctx.fillRect(off+100,440,250,8);
      ctx.fillStyle=col(i);ctx.fillRect(off+100,440,250*s.speed,8);
      if(s.landed)g.text(s.res+"m",off+225,120,24,GOLD,"center");
    });
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* 3. BALLOON RISE */
micro({
  id:"balloonriseGame",title:"Balloon Rise",desc:"Tap to rise. First to top wins.",
  cat:"reflex",key:"balloonrise",win:3,
  controls:"P1: mash SPACE　 P2: mash ENTER — each tap adds lift, gravity pulls down",
  round(g){
    g.pl=[
      {y:440,vy:0,taps:0},
      {y:440,vy:0,taps:0}
    ];
    g.plats=[[],[]];
    const r=seeded(ri(1,1e6));
    for(let i=0;i<2;i++){
      for(let k=0;k<10;k++){
        const y=400-k*44;
        g.plats[i].push({x:r()*350+50,y});
      }
    }
  },
  update(g,dt){
    let winner=-1;
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.vy+=260*dt;
      if(I.pa){p.vy=-260;p.taps++;}
      p.vy=cl(p.vy,-300,300);
      p.y+=p.vy*dt;
      for(const pl of g.plats[i]){
        if(p.y>pl.y-15&&p.y<pl.y+15&&p.vy>0){
          p.y=pl.y-15;p.vy=0;
        }
      }
      if(p.y<-20&&winner<0)winner=i;
    });
    if(winner>=0)g.point(winner,"TOP!");
  },
  draw(g,ctx){
    const gr=ctx.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,"#3a8ac8");gr.addColorStop(1,"#c8e6ff");
    ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    g.pl.forEach((p,i)=>{
      const off=i*450;
      g.plats[i].forEach(pl=>{
        ctx.fillStyle="#8a5a3a";ctx.fillRect(off+pl.x-40,pl.y,80,10);
        ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(off+pl.x-40,pl.y,80,10);
      });
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.ellipse(off+225,p.y-20,25,32,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle="rgba(255,255,255,.5)";
      ctx.beginPath();ctx.arc(off+215,p.y-30,6,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#666";ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(off+225,p.y+12);ctx.lineTo(off+225,p.y+30);ctx.stroke();
      g.text("P"+(i+1),off+225,30,20,col(i),"center");
    });
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* 4. BOWLING BRAWL */
micro({
  id:"bowlbrawlGame",title:"Bowling Brawl",desc:"Knock down rival's pins. Rival knocks yours.",
  cat:"sports",key:"bowlbrawl",win:3,
  controls:"P1: A/D aim, SPACE roll　 P2: ←/→ aim, ENTER — each player has 5 pins to defend",
  round(g){
    g.pl=[
      {aim:-.3,balls:3,pins:[],pinHP:5},
      {aim:Math.PI+.3,balls:3,pins:[],pinHP:5}
    ];
    for(let k=0;k<5;k++){
      g.pl[0].pins.push({x:80+k*80,y:H-60,hp:1,alive:true});
      g.pl[1].pins.push({x:W-80-k*80,y:H-60,hp:1,alive:true});
    }
    g.roll=[];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      if(I.l)p.aim-=1.2*dt;
      if(I.r)p.aim+=1.2*dt;
      if(I.pa&&p.balls>0){
        p.balls--;
        const sx=i?W-80:80;
        const sy=H-80;
        g.roll.push({x:sx,y:sy,vx:Math.cos(p.aim)*380,vy:Math.sin(p.aim)*380,o:i});
        FX.tone(400,.1,"triangle",.03,-60);
      }
    });
    g.roll.forEach(r=>{
      r.x+=r.vx*dt;r.y+=r.vy*dt;
      r.vx*=.99;r.vy*=.99;
      if(r.x<10||r.x>W-10)r.vx*=-.9;
      if(r.y<40||r.y>H-10)r.vy*=-.9;
      const opp=g.pl[1-r.o];
      for(const pin of opp.pins){
        if(!pin.alive)continue;
        if(Math.hypot(r.x-pin.x,r.y-pin.y)<25){
          pin.alive=false;opp.pinHP--;
          g.burst(pin.x,pin.y,col(r.o),10,200);
          FX.tone(600,.08,"square",.04);
          if(opp.pinHP<=0)g.point(r.o,"ALL PINS!");
        }
      }
      if(Math.hypot(r.vx,r.vy)<30)r.dead=true;
    });
    g.roll=g.roll.filter(r=>!r.dead);
    if(!g.pinRespawn)g.pinRespawn=0;
    g.pinRespawn-=dt;
    if(g.pinRespawn<=0){
      g.pinRespawn=3;
      g.pl.forEach((p,i)=>{
        if(p.pinHP<=0)return;
        for(const pin of p.pins){
          if(!pin.alive&&Math.random()<.5){pin.alive=true;p.pinHP=Math.min(5,p.pinHP+1);}
        }
      });
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#8a5a2a";ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#a86a3a";for(let x=0;x<W;x+=50)ctx.fillRect(x,0,2,H);
    g.pl.forEach((p,i)=>{
      ctx.fillStyle=col(i);
      p.pins.forEach(pin=>{
        if(!pin.alive)return;
        ctx.beginPath();ctx.arc(pin.x,pin.y,10,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
      });
      ctx.strokeStyle=col(i);ctx.lineWidth=2;ctx.setLineDash([8,6]);
      const sx=i?W-80:80;
      ctx.beginPath();ctx.moveTo(sx,H-80);
      ctx.lineTo(sx+Math.cos(p.aim)*80,H-80+Math.sin(p.aim)*80);ctx.stroke();
      ctx.setLineDash([]);
      g.text("P"+(i+1)+" BALLS:"+p.balls,i?W-20:20,30,16,col(i),i?"right":"left");
      g.text("PINS:"+p.pinHP,i?W-20:20,55,14,"#fff",i?"right":"left");
    });
    g.roll.forEach(r=>{
      ctx.fillStyle="#fff";
      ctx.beginPath();ctx.arc(r.x,r.y,10,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
    });
  }
});

/* 5. SPACE DEFENSE */
micro({
  id:"spacedefenseGame",title:"Space Defense",desc:"Defend your base from asteroids. Destroy rival's.",
  cat:"arcade",key:"spacedefense",win:3,
  controls:"P1: A/D move turret, SPACE fire　 P2: ←/→, ENTER — asteroids target BOTH bases",
  round(g){
    g.pl=[
      {x:150,y:H-40,hp:10,turret:0},
      {x:W-150,y:H-40,hp:10,turret:0}
    ];
    g.ast=[];
    g.astBullets=[];
    g.spawn=0;
  },
  update(g,dt){
    g.spawn-=dt;
    if(g.spawn<=0&&g.ast.length<8){
      g.spawn=Math.max(.5,2-g.t*.03);
      const target=Math.random()<.5?0:1;
      const tx=g.pl[target].x,ty=g.pl[target].y;
      const angle=Math.atan2(ty-50,tx-W/2)+(Math.random()-.5)*.5;
      g.ast.push({x:W/2,y:50,vx:Math.cos(angle)*80,vy:Math.sin(angle)*80,target,r:14+Math.random()*10});
    }
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.turret=cl(p.turret+((I.r?1:0)-(I.l?1:0))*280*dt,50,W/2-50+i*(W/2));
      p.turret=cl(p.turret+(i?0:0),i?W/2+20:50,i?W-50:W/2-20);
      if(I.l)p.turret=Math.max(i?W/2+20:50,p.turret-280*dt);
      if(I.r)p.turret=Math.min(i?W-50:W/2-20,p.turret+280*dt);
      if(I.a){
        g.astBullets.push({x:p.turret,y:H-90,vy:-500,o:i});
        FX.tone(700,.04,"square",.03);
      }
    });
    g.ast.forEach(a=>{
      a.x+=a.vx*dt;a.y+=a.vy*dt;
      const t=g.pl[a.target];
      if(Math.hypot(a.x-t.x,a.y-t.y)<30){
        t.hp--;a.dead=true;
        g.burst(a.x,a.y,col(1-a.target),15,300);
        FX.playBoom();
        if(t.hp<=0)g.point(1-a.target,"BASE DOWN");
      }
    });
    g.ast=g.ast.filter(a=>!a.dead);
    g.astBullets.forEach(b=>{
      b.y+=b.vy*dt;
      if(b.y<40)b.dead=true;
      for(const a of g.ast){
        if(!a.dead&&Math.hypot(b.x-a.x,b.y-a.y)<a.r+4){
          a.dead=true;b.dead=true;
          g.burst(a.x,a.y,col(b.o),10,200);
        }
      }
    });
    g.astBullets=g.astBullets.filter(b=>!b.dead);
  },
  draw(g,ctx){
    ctx.fillStyle="#0a0a1a";ctx.fillRect(0,0,W,H);
    for(let k=0;k<40;k++){ctx.fillStyle="#4c5d99";ctx.fillRect((k*97)%W,(k*61)%H,2,2);}
    g.pl.forEach((p,i)=>{
      ctx.fillStyle=col(i);
      ctx.fillRect(p.x-40,p.y-20,80,30);
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(p.x-40,p.y-20,80,30);
      ctx.fillStyle="#9fc0ff";
      ctx.fillRect(p.turret-8,H-90,16,50);
      ctx.fillStyle=col(i);
      ctx.fillRect(p.turret-3,H-90,6,30);
      g.text("P"+(i+1)+" HP:"+p.hp,i?W-20:20,30,16,col(i),i?"right":"left");
    });
    g.ast.forEach(a=>{
      ctx.fillStyle="#8a6a5a";
      ctx.beginPath();
      for(let k=0;k<6;k++){
        const ang=k*Math.PI/3;
        const r2=a.r*(.8+Math.sin(k*3.1)*.2);
        ctx[k?"lineTo":"moveTo"](a.x+Math.cos(ang)*r2,a.y+Math.sin(ang)*r2);
      }
      ctx.closePath();ctx.fill();
      ctx.strokeStyle="#5a4238";ctx.lineWidth=2;ctx.stroke();
    });
    g.astBullets.forEach(b=>{
      ctx.fillStyle=col(b.o);
      ctx.fillRect(b.x-2,b.y-8,4,12);
    });
    ctx.fillStyle="#080b18";ctx.fillRect(W/2-2,0,4,H);
  }
});

})();