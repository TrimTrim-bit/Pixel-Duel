/* =====================================================
   GAME PACK X — 5 wishlist games
   Flappy Duo, Golf Island, Boat Wars, Chain Dodge,
   Geometry Duel
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* ---------- FLAPPY DUO ---------- */
micro({id:"flappyDuoGame",title:"Flappy Duo",desc:"Shared pipe course. Last bird flying wins.",
cat:"reflex",key:"flappyduo",win:3,
controls:"P1: SPACE flap　 P2: ENTER flap — same pipes for both",
round(g){
  g.rng=seeded(ri(1,1e6));
  g.dist=0;g.pipes=[];g.lastX=380;
  g.b=[{y:250,vy:0,go:false},{y:250,vy:0,go:false}];
  g.pass=0;
},
update(g,dt){
  g.dist+=165*dt;
  while(g.lastX<g.dist+560){
    g.lastX+=250+g.rng()*60;
    g.pipes.push({x:g.lastX,gy:110+g.rng()*280});
  }
  g.pipes=g.pipes.filter(p=>p.x>g.dist-140);
  const dead=[false,false];
  g.b.forEach((b,i)=>{
    if(g.I[i].pa){b.go=true;b.vy=-380;FX.tone(500,.06,"square",.03,200);}
    if(b.go){b.vy+=1250*dt;b.y+=b.vy*dt;}
    else b.y=250+Math.sin(g.t*5)*6;
    if(b.y<10||b.y>H-10)dead[i]=true;
    for(const p of g.pipes){
      const sx=p.x-g.dist;
      if(sx<460+12&&sx+52>460-12&&(b.y-10<p.gy-70||b.y+10>p.gy+70))dead[i]=true;
    }
  });
  if(dead[0]&&dead[1])g.next("BOTH CRASHED");
  else if(dead[0]){g.burst(460,g.b[0].y,C1,22,320);g.point(1);}
  else if(dead[1]){g.burst(460,g.b[1].y,C2,22,320);g.point(0);}
},
draw(g,ctx){
  const gr=ctx.createLinearGradient(0,0,0,H);
  gr.addColorStop(0,"#3a7ac8");gr.addColorStop(1,"#a8d8ff");
  ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="rgba(255,255,255,.35)";
  for(let k=0;k<5;k++){ctx.fillRect(((k*200-g.dist*.2)%900+900)%900-100,60+k*60,110,22);}
  ctx.fillStyle="#5aa04a";ctx.fillRect(0,H-16,W,16);
  for(const p of g.pipes){
    const sx=p.x-g.dist;
    if(sx>W||sx<-60)continue;
    ctx.fillStyle="#3ac060";ctx.fillRect(sx,0,52,p.gy-70);ctx.fillRect(sx,p.gy+70,52,H);
    ctx.fillStyle="#2a9048";ctx.fillRect(sx-4,p.gy-88,60,20);ctx.fillRect(sx-4,p.gy+70,60,20);
    ctx.strokeStyle="#0d3a1f";ctx.lineWidth=2;ctx.strokeRect(sx,0,52,p.gy-70);ctx.strokeRect(sx,p.gy+70,52,H);
  }
  g.b.forEach((b,i)=>{
    const bx=i?580:320;
    ctx.save();ctx.translate(bx,b.y);ctx.rotate(cl(b.vy/700,-.5,.9));
    ctx.fillStyle=col(i);ctx.fillRect(-14,-11,28,22);
    ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(-14,-11,28,22);
    ctx.fillStyle="#fff";ctx.fillRect(3,-7,9,9);
    ctx.fillStyle="#11152b";ctx.fillRect(9,-4,4,4);
    ctx.fillStyle=GOLD;ctx.fillRect(13,1,9,6);
    ctx.restore();
  });
}
});

/* ---------- GOLF ISLAND ---------- */
micro({id:"golfIslandGame",title:"Golf Island",desc:"Land your ball on the island hole. First to sink wins.",
cat:"sports",key:"golfisland",win:3,
controls:"Hold your key to charge, release to swing — P1: SPACE　 P2: ENTER — 3 balls each per round",
round(g){
  g.island={x:W/2,y:H/2,r:90};
  g.hole={x:W/2,y:H/2,r:16};
  g.balls=[[],[]];
  g.turn=0;
  g.shotsLeft=[3,3];
  g.charge=[0,0];g.charging=[false,false];
  g.aim=[0,0];
  g.curBall=null;
  g.moving=false;
},
update(g,dt){
  const cur=g.turn;
  if(g.curBall){
    const b=g.curBall;
    if(Math.abs(b.vx)<8&&Math.abs(b.vy)<8){
      b.vx=0;b.vy=0;
      if(Math.hypot(b.x-g.hole.x,b.y-g.hole.y)<g.hole.r){
        g.point(cur,"HOLE IN ONE!");
        return;
      }
      g.shotsLeft[cur]--;
      if(g.shotsLeft[cur]<=0){g.turn=1-cur;g.shotsLeft[1-cur]=3;g.curBall=null;}
      else g.curBall=null;
      return;
    }
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    b.vx*=Math.pow(.15,dt);b.vy*=Math.pow(.15,dt);
    if(!(Math.hypot(b.x-g.island.x,b.y-g.island.y)<g.island.r)){
      if(Math.hypot(b.x-g.island.x,b.y-g.island.y)<g.island.r+30){
        b.vx=0;b.vy=0;
      }
    }
    return;
  }
  if(!g.charging[cur]){
    if(g.I[cur].pl)g.aim[cur]-=1.2*dt;
    if(g.I[cur].pr)g.aim[cur]+=1.2*dt;
    if(g.I[cur].pa){g.charging[cur]=true;g.charge[cur]=0;}
  }else{
    g.charge[cur]=Math.min(1,g.charge[cur]+dt*1.2);
    if(!g.I[cur].pa){
      const a=g.aim[cur];
      const v=200+g.charge[cur]*520;
      g.curBall={x:cur?750:150,y:H/2-100,vx:Math.cos(a)*v,vy:Math.sin(a)*v};
      g.balls[cur].push({...g.curBall});
      g.charging[cur]=false;g.charge[cur]=0;
      FX.tone(300,.1,"triangle",.04,200);
    }
  }
},
draw(g,ctx){
  const gr=ctx.createLinearGradient(0,0,0,H);
  gr.addColorStop(0,"#0a5a8a");gr.addColorStop(1,"#0a3a6a");
  ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  for(let k=0;k<30;k++){ctx.fillStyle="rgba(255,255,255,.06)";ctx.fillRect((k*97)%W,(k*61)%H,30,3);}
  ctx.fillStyle="#63f59a";ctx.beginPath();ctx.arc(g.island.x,g.island.y,g.island.r,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#3aa050";ctx.lineWidth=5;ctx.stroke();
  ctx.fillStyle="#111";ctx.beginPath();ctx.arc(g.hole.x,g.hole.y,g.hole.r,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle="rgba(100,234,255,.4)";ctx.fillRect(140,H/2-110,20,220);
  ctx.fillStyle="rgba(255,114,200,.4)";ctx.fillRect(740,H/2-110,20,220);
  g.balls.flat().forEach((b,i)=>{
    const owner=g.balls[0].includes(b)?0:1;
    ctx.fillStyle="rgba(0,0,0,.3)";ctx.beginPath();ctx.arc(b.x+2,b.y+3,8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=col(owner);ctx.beginPath();ctx.arc(b.x,b.y,8,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();
  });
  if(g.curBall){
    ctx.fillStyle=col(g.turn);ctx.beginPath();ctx.arc(g.curBall.x,g.curBall.y,8,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();
  }
  const cur=g.turn;
  if(g.charging[cur]){
    const a=g.aim[cur],v=200+g.charge[cur]*520;
    const sx=cur?750:150;
    ctx.strokeStyle=col(cur);ctx.lineWidth=3;ctx.setLineDash([10,8]);
    ctx.beginPath();ctx.moveTo(sx,H/2-100);ctx.lineTo(sx+Math.cos(a)*v*.5,H/2-100+Math.sin(a)*v*.5);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle="#080b18";ctx.fillRect(250,H-40,400,16);
    ctx.fillStyle=cur?C2:C1;ctx.fillRect(252,H-38,396*g.charge[cur],12);
  }
  g.text("P1 balls:"+g.shotsLeft[0],20,30,18,C1);
  g.text("P2 balls:"+g.shotsLeft[1],W-20,30,18,C2,"right");
  g.text("P"+(cur+1)+" AIM",W/2,30,18,col(cur),"center");
}
});

/* ---------- BOAT WARS ---------- */
micro({id:"boatwarsGame",title:"Boat Wars",desc:"Bump rival into whirlpools. Survive longest.",
cat:"action",key:"boatwars",win:3,
controls:"Hold your key to spin, release to drive forward — P1: SPACE　 P2: ENTER",
round(g){
  g.pl=[
    {x:200,y:250,a:0,vx:0,vy:0,spin:0,hp:3,charge:0},
    {x:700,y:250,a:Math.PI,vx:0,vy:0,spin:0,hp:3,charge:0}
  ];
  g.whirls=[
    {x:450,y:110,r:55},
    {x:450,y:390,r:55},
    {x:200,y:400,r:45},
    {x:700,y:100,r:45}
  ];
},
update(g,dt){
  g.pl.forEach((p,i)=>{
    const I=g.I[i];
    if(I.a){
      p.spin=Math.min(1,p.spin+dt*2.5);
      p.charge=Math.min(1,p.charge+dt*1.5);
    }else{
      if(p.charge>0.1){
        const v=200+p.charge*400;
        p.vx+=Math.cos(p.a)*v*.4;
        p.vy+=Math.sin(p.a)*v*.4;
        p.charge=0;
        FX.tone(300,.1,"sawtooth",.04,300);
      }
      p.spin=Math.max(0,p.spin-dt*2);
    }
    p.a+=p.spin*4*dt;
    p.vx*=Math.pow(.9,dt);p.vy*=Math.pow(.9,dt);
    p.x+=p.vx*dt;p.y+=p.vy*dt;
    p.x=cl(p.x,20,W-20);p.y=cl(p.y,20,H-20);
  });
  const [a,b]=g.pl,d=Math.hypot(b.x-a.x,b.y-a.y);
  if(d<34&&d>0){
    const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d,o=(34-d)/2;
    a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;
    const vn=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
    if(vn<0){
      const imp=-1.5*vn/2;
      a.vx-=imp*nx;a.vy-=imp*ny;b.vx+=imp*nx;b.vy+=imp*ny;
      FX.tone(200,.1,"square",.04);
      g.burst((a.x+b.x)/2,(a.y+b.y)/2,GOLD,10,260);
    }
  }
  const dead=[false,false];
  g.pl.forEach((p,i)=>{
    for(const wh of g.whirls){
      const d=Math.hypot(p.x-wh.x,p.y-wh.y);
      if(d<wh.r*1.5&&d>0){
        const pull=80*(1-d/(wh.r*1.5));
        p.vx+=(wh.x-p.x)/d*pull*dt;
        p.vy+=(wh.y-p.y)/d*pull*dt;
      }
      if(d<wh.r-8){
        p.hp-=dt*3;
        if(p.hp<=0)dead[i]=true;
      }
    }
  });
  if(dead[0]&&dead[1])g.next("BOTH DROWNED");
  else if(dead[0]){g.burst(g.pl[0].x,g.pl[0].y,C1,24,400);g.point(1);}
  else if(dead[1]){g.burst(g.pl[1].x,g.pl[1].y,C2,24,400);g.point(0);}
},
draw(g,ctx){
  const gr=ctx.createRadialGradient(W/2,H/2,100,W/2,H/2,600);
  gr.addColorStop(0,"#1a5a9a");gr.addColorStop(1,"#0a2a5a");
  ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  for(let k=0;k<40;k++){
    ctx.fillStyle="rgba(255,255,255,.08)";
    const x=(k*97+Math.sin(g.t+k)*30)%W,y=(k*61+Math.cos(g.t*1.3+k)*20)%H;
    ctx.fillRect(x,y,20,2);
  }
  g.whirls.forEach((wh,i)=>{
    for(let r=1;r<=4;r++){
      ctx.strokeStyle="rgba(100,234,255,"+(0.5-r*0.1)+")";
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.arc(wh.x,wh.y,wh.r*(r/4)+Math.sin(g.t*2+i)*3,0,Math.PI*2);
      ctx.stroke();
    }
    ctx.fillStyle="rgba(0,0,0,.5)";ctx.beginPath();ctx.arc(wh.x,wh.y,wh.r*.4,0,Math.PI*2);ctx.fill();
  });
  g.pl.forEach((p,i)=>{
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);
    ctx.fillStyle=col(i);
    ctx.beginPath();
    ctx.moveTo(22,0);ctx.lineTo(-14,-12);ctx.lineTo(-8,0);ctx.lineTo(-14,12);
    ctx.closePath();ctx.fill();
    ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
    if(p.charge>0.1){
      ctx.fillStyle=`rgba(255,230,109,${p.charge})`;
      ctx.beginPath();ctx.arc(0,0,24+p.charge*10,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle="#fff";ctx.fillRect(8,-4,4,4);
    ctx.restore();
    for(let k=0;k<3;k++){
      ctx.fillStyle=k<Math.ceil(p.hp)?col(i):"#3a3f6a";
      ctx.fillRect(i?W-30-k*20:20+k*20,50,14,10);
    }
  });
}
});

/* ---------- CHAIN DODGE ---------- */
micro({id:"chaindodgeGame",title:"Chain Dodge",desc:"Wrecking balls swing down. Duck or get crushed.",
cat:"reflex",key:"chaindodge",win:3,
controls:"P1: hold SPACE to duck　 P2: hold ENTER to duck — balls never hit the ground, so timing is everything",
round(g){
  g.rng=seeded(ri(1,1e6));
  g.balls=[];
  g.spawnT=0;
  g.pl=[{x:300,duck:0},{x:600,duck:0}];
  g.tl=0;
},
update(g,dt){
  g.tl+=dt;
  g.spawnT-=dt;
  if(g.spawnT<=0){
    g.spawnT=Math.max(.35,1-g.tl*.02);
    g.balls.push({x:rnd(80,W-80),y:-80,vy:0,phase:0,swing:0});
  }
  g.pl.forEach((p,i)=>{p.duck=g.I[i].d?1:0;});
  g.balls.forEach(b=>{
    b.phase+=dt;
    if(b.phase<0.6){
      b.y=-80+b.phase*300;
    }else if(b.phase<1.0){
      b.y=100+Math.sin((b.phase-0.6)*Math.PI/.4)*40;
    }else if(b.phase<1.6){
      b.y=100-(b.phase-1.0)*300;
    }else{
      b.y=-300;
    }
  });
  g.balls=g.balls.filter(b=>b.phase<2);
  const dead=[false,false];
  g.balls.forEach(b=>{
    g.pl.forEach((p,i)=>{
      if(Math.abs(b.x-p.x)<50 && !p.duck && b.y>180 && b.y<290){
        dead[i]=true;
      }
    });
  });
  if(dead[0]&&dead[1])g.next("BOTH CRUSHED");
  else if(dead[0]){g.burst(g.pl[0].x,250,C1,20,320);g.point(1);}
  else if(dead[1]){g.burst(g.pl[1].x,250,C2,20,320);g.point(0);}
},
draw(g,ctx){
  const gr=ctx.createLinearGradient(0,0,0,H);
  gr.addColorStop(0,"#2a1a3a");gr.addColorStop(1,"#1a1a2a");
  ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#3a2a3a";ctx.fillRect(0,0,W,30);
  ctx.fillStyle="rgba(0,0,0,.3)";for(let x=0;x<W;x+=60)ctx.fillRect(x,0,30,30);
  g.balls.forEach(b=>{
    if(b.y<-40)return;
    ctx.strokeStyle="#888";ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(b.x,30);ctx.lineTo(b.x,b.y);ctx.stroke();
    ctx.fillStyle="#2a2a3a";ctx.beginPath();ctx.arc(b.x,b.y,26,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#111";ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle="rgba(255,255,255,.2)";ctx.beginPath();ctx.arc(b.x-8,b.y-8,8,0,Math.PI*2);ctx.fill();
  });
  g.pl.forEach((p,i)=>{
    const y=p.duck?380:320;
    ctx.fillStyle=col(i);
    if(p.duck){ctx.fillRect(p.x-20,y-20,40,20);}
    else{ctx.fillRect(p.x-12,y-60,24,60);}
    ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(p.duck?p.x-20:p.x-12,p.duck?y-20:y-60,p.duck?40:24,p.duck?20:60);
    ctx.fillStyle="#f3bd83";ctx.beginPath();
    ctx.arc(p.x,p.duck?y-10:y-75,10,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#080b18";ctx.stroke();
  });
  ctx.fillStyle="#5a3a2a";ctx.fillRect(0,410,W,90);
  ctx.fillStyle="#7a5a3a";ctx.fillRect(0,410,W,4);
}
});

/* ---------- GEOMETRY DUEL ---------- */
micro({id:"geometryGame",title:"Geometry Duel",desc:"Same level, same obstacles. First to finish wins.",
cat:"reflex",key:"geometry",win:3,
controls:"P1: SPACE jump (hold to hold jump)　 P2: ENTER — split screen, same track",
round(g){
  g.rng=seeded(ri(1,1e6));
  g.track=[];g.genX=600;
  for(let i=0;i<30;i++){
    const gx=g.genX+i*180+g.rng()*80;
    const type=g.rng()<.5?"spike":"platform";
    if(type==="spike")g.track.push({x:gx,type:"spike",w:30,h:40,y:0});
    else g.track.push({x:gx,type:"platform",w:80,h:20,y:80+g.rng()*60});
  }
  g.dist=[0,0];
  g.pl=[
    {y:0,vy:0,x:150,rot:0,grounded:true,cd:0},
    {y:0,vy:0,x:150,rot:0,grounded:true,cd:0}
  ];
  g.finish=3500;
},
update(g,dt){
  const speed=280;
  let winner=-1;
  g.pl.forEach((p,i)=>{
    p.cd=Math.max(0,p.cd-dt);
    if(g.I[i].pa&&p.grounded){p.vy=-620;p.grounded=false;FX.tone(400,.06,"square",.03,200);}
    p.vy+=1800*dt;
    p.y+=p.vy*dt;
    p.rot+=speed*dt/24;
    if(p.y>=0){p.y=0;p.vy=0;p.grounded=true;}
    const worldX=g.dist[i]+p.x;
    for(const o of g.track){
      const sx=o.x-worldX;
      if(sx>-40&&sx<300){
        if(o.type==="spike"){
          if(Math.abs(sx)<20&&p.y>-40)winner=1-i;
        }else{
          if(Math.abs(sx)<40&&p.y>-o.y)winner=1-i;
        }
      }
    }
    g.dist[i]+=speed*dt;
    if(g.dist[i]>=g.finish&&winner<0)winner=i;
  });
  if(winner>=0){
    g.burst(450,250,col(winner),20,320);
    g.point(winner,"FINISHED!");
  }
},
draw(g,ctx){
  for(let i=0;i<2;i++){
    const off=i*450,y=H/2;
    ctx.save();ctx.beginPath();ctx.rect(off,0,450,H);ctx.clip();
    ctx.fillStyle=i?"#1a1038":"#0f1a3a";ctx.fillRect(off,0,450,H);
    for(let k=0;k<12;k++){ctx.fillStyle="rgba(255,255,255,.05)";ctx.fillRect(off+(k*80-g.dist[i]*.1%80),30+k*40,60,10);}
    ctx.fillStyle="#4a4a7a";ctx.fillRect(off,y,450,H-y);
    ctx.fillStyle="#6a6aaa";ctx.fillRect(off,y,450,4);
    const worldX=g.dist[i];
    for(const o of g.track){
      const sx=o.x-worldX;
      if(sx<-60||sx>500)continue;
      if(o.type==="spike"){
        ctx.fillStyle="#ff4a6a";
        ctx.beginPath();
        ctx.moveTo(off+sx,y+2);ctx.lineTo(off+sx+15,y-o.h);ctx.lineTo(off+sx+30,y+2);
        ctx.fill();
        ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
      }else{
        ctx.fillStyle="#6a56b8";ctx.fillRect(off+sx,y-o.y-2,o.w,o.h);
        ctx.strokeStyle="#4a3a8a";ctx.lineWidth=2;ctx.strokeRect(off+sx,y-o.y-2,o.w,o.h);
      }
    }
    const p=g.pl[i];
    ctx.save();ctx.translate(off+p.x,y+p.y-12);ctx.rotate(p.rot);
    ctx.fillStyle=col(i);
    ctx.fillRect(-12,-12,24,24);
    ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(-12,-12,24,24);
    ctx.fillStyle="#fff";ctx.fillRect(-4,-6,4,4);ctx.fillRect(3,-6,4,4);
    ctx.restore();
    ctx.fillStyle="#080b18";ctx.fillRect(off+50,20,350,12);
    ctx.fillStyle=col(i);ctx.fillRect(off+52,22,346*Math.min(1,g.dist[i]/g.finish),8);
    ctx.restore();
    g.text("P"+(i+1)+" "+Math.round(g.dist[i]/g.finish*100)+"%",off+225,14,12,col(i),"center");
  }
  ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

})();