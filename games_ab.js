/* =====================================================
   GAME PACK AB — 10 games
   Breakout Duel, Slime Volley, Color Switch, Warlords,
   Zombie Survival, Chain Bomb, Joust, Ice Climber,
   Duck Duck Goose, Tank Battle
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* 1. BREAKOUT DUEL */
function makeBricks(off){
  const bricks=[];
  const colors=["#ff6a6a","#ffb03a","#ffe66d","#6aff8a","#6ab0ff"];
  for(let r=0;r<4;r++)for(let c=0;c<8;c++){
    bricks.push({
      x:off+8+c*54,y:60+r*24,
      w:50,h:20,
      hp:1,
      color:colors[r]
    });
  }
  return bricks;
}
micro({
  id:"breakoutGame",title:"Breakout Duel",desc:"Clear your bricks. Don't drop the ball.",
  cat:"arcade",key:"breakout",win:3,
  controls:"P1: A/D move paddle　 P2: ←/→ — ball bounces off bricks. Miss = ball resets",
  round(g){
    g.pl=[
      {x:225,br:makeBricks(0),ball:{x:225,y:400,vx:150,vy:-220},score:0},
      {x:675,br:makeBricks(450),ball:{x:675,y:400,vx:-150,vy:-220},score:0}
    ];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      const off=i*450;
      p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*320*dt,off+60,off+390);
      const b=p.ball;
      if(!b)return;
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.x<off+8){b.x=off+8;b.vx=Math.abs(b.vx);}
      if(b.x>off+442){b.x=off+442;b.vx=-Math.abs(b.vx);}
      if(b.y<40){b.y=40;b.vy=Math.abs(b.vy);}
      if(b.y>430&&b.y<460&&Math.abs(b.x-p.x)<55&&b.vy>0){
        b.vy=-Math.abs(b.vy)*1.02;
        b.vx+=(b.x-p.x)*3;
        b.vx=cl(b.vx,-500,500);
        FX.playBounce();
      }
      for(const br of p.br){
        if(br.hp<=0)continue;
        if(b.x+8>br.x&&b.x-8<br.x+br.w&&b.y+8>br.y&&b.y-8<br.y+br.h){
          br.hp=0;
          b.vy=-b.vy;
          p.score+=10;
          g.burst(br.x+br.w/2,br.y+br.h/2,br.color,6,160);
          FX.tone(500+(4-br.y/24)*80,.04,"square",.03);
          break;
        }
      }
      if(b.y>H+20){
        p.ball={x:off+225,y:400,vx:i?-150:150,vy:-220};
        FX.tone(150,.2,"sawtooth",.03,-60);
      }
      if(p.br.every(br=>br.hp<=0))g.point(i,"CLEARED!");
    });
  },
  draw(g,ctx){
    for(let i=0;i<2;i++){
      const off=i*450,p=g.pl[i];
      ctx.fillStyle=i?"#1a0d2a":"#0b1030";ctx.fillRect(off,0,450,H);
      for(let k=0;k<20;k++){ctx.fillStyle="#26386f";ctx.fillRect(off+(k*97)%450,(k*61)%H,2,2);}
      p.br.forEach(br=>{
        if(br.hp<=0)return;
        ctx.fillStyle=br.color;
        ctx.fillRect(br.x,br.y,br.w,br.h);
        ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(br.x,br.y,br.w,br.h);
        ctx.fillStyle="rgba(255,255,255,.3)";
        ctx.fillRect(br.x,br.y,br.w,3);
      });
      ctx.fillStyle=col(i);
      ctx.fillRect(p.x-50,445,100,12);
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(p.x-50,445,100,12);
      const b=p.ball;
      if(b){
        ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x,b.y,8,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.stroke();
      }
      g.text("SCORE: "+p.score,off+20,30,14,col(i));
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* 2. SLIME VOLLEY */
micro({
  id:"slimeGame",title:"Slime Volley",desc:"Bounce the ball over the net. Slime physics.",
  cat:"sports",key:"slime",win:5,
  controls:"P1: A/D move, W jump　 P2: ←/→, ↑ — first to 5",
  round(g){
    g.pl=[
      {x:200,y:420,vx:0,vy:0,grounded:false},
      {x:700,y:420,vx:0,vy:0,grounded:false}
    ];
    g.ball={x:450,y:200,vx:0,vy:0,r:10};
    const dir=Math.random()<.5?-1:1;
    g.ball.vx=dir*120;g.ball.vy=-280;
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.vx=(I.r?1:0)-(I.l?1:0);
      p.vx*=260;
      if(I.u&&p.grounded){p.vy=-680;p.grounded=false;FX.tone(400,.08,"square",.03);}
      p.vy+=1500*dt;
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.y>420){p.y=420;p.vy=0;p.grounded=true;}
      if(i===0)p.x=cl(p.x,30,430);
      else p.x=cl(p.x,470,870);
    });
    const b=g.ball;
    b.vy+=800*dt;
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.x<b.r+10){b.x=b.r+10;b.vx=Math.abs(b.vx)*.9;}
    if(b.x>W-b.r-10){b.x=W-b.r-10;b.vx=-Math.abs(b.vx)*.9;}
    if(b.y<b.r+40){b.y=b.r+40;b.vy=Math.abs(b.vy)*.9;}
    if(Math.abs(b.x-450)<8&&b.y>320){b.vx=-b.vx;b.x+=b.vx>0?3:-3;}
    for(let i=0;i<2;i++){
      const p=g.pl[i];
      if(Math.hypot(b.x-p.x,b.y-(p.y-16))<32){
        const dx=b.x-p.x,dy=b.y-(p.y-16);
        const d=Math.hypot(dx,dy)||1;
        const nx=dx/d,ny=dy/d;
        const sp=Math.max(420,Math.hypot(b.vx,b.vy)*1.05);
        b.vx=nx*sp+b.vx*.3;b.vy=ny*sp-150;
        b.x=p.x+nx*32;b.y=p.y-16+ny*32;
        FX.playBounce();
      }
    }
    if(b.y>H-30){
      if(b.x<450)g.point(1,"POINT P2");
      else g.point(0,"POINT P1");
    }
  },
  draw(g,ctx){
    const gr=ctx.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,"#3a7ac8");gr.addColorStop(1,"#a8d8ff");
    ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#2a7a4a";ctx.fillRect(0,440,W,60);
    ctx.fillStyle="#1a5a3a";ctx.fillRect(445,320,10,120);
    g.pl.forEach((p,i)=>{
      ctx.fillStyle=col(i);
      ctx.beginPath();
      ctx.ellipse(p.x,p.y-16,26,20,0,0,Math.PI*2);
      ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="rgba(255,255,255,.4)";
      ctx.beginPath();ctx.arc(p.x-8,p.y-24,5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#fff";
      ctx.fillRect(p.x-10,p.y-22,6,6);ctx.fillRect(p.x+4,p.y-22,6,6);
      ctx.fillStyle="#11152b";
      ctx.fillRect(p.x-8,p.y-20,3,3);ctx.fillRect(p.x+6,p.y-20,3,3);
    });
    const b=g.ball;
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(b.x-3,b.y-3,3,0,Math.PI*2);ctx.fill();
  }
});

/* 3. COLOR SWITCH */
micro({
  id:"colorswitchGame",title:"Color Switch",desc:"Pass through the color you're wearing.",
  cat:"reflex",key:"colorswitch",win:3,
  controls:"P1: SPACE jump through　 P2: ENTER — your color must match the ring's slot",
  round(g){
    g.pl=[
      {y:440,vy:0,color:0,score:0,alive:true},
      {y:440,vy:0,color:2,score:0,alive:true}
    ];
    g.rings=[[],[]];
    for(let i=0;i<2;i++){
      const r=seeded(ri(1,1e6));
      for(let k=0;k<20;k++){
        const slots=[];
        for(let s=0;s<4;s++)slots.push(s);
        slots.sort(()=>Math.random()-.5);
        g.rings[i].push({y:300-k*180,slots:slots.slice(0,4),passed:false,spinning:r()<.5?1:-1,rot:0});
      }
    }
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      if(!p.alive)return;
      if(g.I[i].pa&&p.vy===0){p.vy=-400;}
      p.vy+=800*dt;
      p.y+=p.vy*dt;
      if(p.y>440){p.y=440;p.vy=0;}
      if(p.y<0){p.y=0;p.vy=0;}
      for(const ring of g.rings[i]){
        ring.rot+=ring.spinning*dt*1.5;
        if(!ring.passed&&Math.abs(p.y-ring.y)<15){
          ring.passed=true;
          const ringCol=ring.slots[Math.floor(((ring.rot%(Math.PI*2))+Math.PI*2)%(Math.PI*2)/(Math.PI/2))%4];
          if(ringCol!==p.color){p.alive=false;g.burst(i*450+225,p.y,col(i),20,300);FX.playBoom();}
          else{p.score++;FX.tone(600+i*100,.05,"square",.04);}
        }
        if(p.y>ring.y+150&&Math.random()<.01){p.color=(p.color+1)%4;}
      }
      if(p.score>=20)g.point(i,"20!");
    });
    if(!g.pl[0].alive&&!g.pl[1].alive)g.next("BOTH CRASHED");
    else if(!g.pl[0].alive)g.point(1,"P2 WINS");
    else if(!g.pl[1].alive)g.point(0,"P1 WINS");
  },
  draw(g,ctx){
    const C=["#ff4a6a","#6aff8a","#6ab0ff","#ffd24a"];
    for(let i=0;i<2;i++){
      const off=i*450;
      ctx.fillStyle=i?"#1a1030":"#0f1530";ctx.fillRect(off,0,450,H);
      const cam=p=>Math.max(0,-p.y+400);
      const p=g.pl[i];
      const cy=cam(p);
      g.rings[i].forEach(ring=>{
        const ry=ring.y+cy;
        if(ry<-40||ry>H+40)return;
        const cx=off+225;
        for(let s=0;s<4;s++){
          const a1=s*Math.PI/2+ring.rot;
          const a2=a1+Math.PI/2;
          ctx.fillStyle=C[ring.slots[s]];
          ctx.beginPath();
          ctx.moveTo(cx,ry);
          ctx.arc(cx,ry,80,a1,a2);
          ctx.closePath();ctx.fill();
          ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
        }
        ctx.fillStyle="#0f1530";
        ctx.beginPath();ctx.arc(cx,ry,50,0,Math.PI*2);ctx.fill();
      });
      if(p.alive){
        ctx.fillStyle=C[p.color];
        ctx.beginPath();ctx.arc(off+225,p.y+cy,14,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#fff";ctx.lineWidth=3;ctx.stroke();
      }
      g.text("P"+(i+1)+" "+p.score+"/20",off+20,30,16,col(i));
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* 4. WARLORDS */
micro({
  id:"warlordsGame",title:"Warlords",desc:"Defend your castle. Destroy the rival's.",
  cat:"arcade",key:"warlords",win:3,
  controls:"P1: A/D move shield　 P2: ←/→ — bounce balls into rival castle",
  round(g){
    g.pl=[
      {x:100,hp:8,shield:60},
      {x:800,hp:8,shield:60}
    ];
    g.balls=[
      {x:225,y:200,vx:120,vy:80,r:6},
      {x:675,y:300,vx:-120,vy:-80,r:6}
    ];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      const min=i?W-160:20,max=i?W-40:180;
      p.shield=cl(p.shield+((I.r?1:0)-(I.l?1:0))*280*dt,min,max);
      p.x=i?W-100:100;
    });
    g.balls.forEach(b=>{
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.y<b.r+40){b.y=b.r+40;b.vy=Math.abs(b.vy);}
      if(b.y>H-b.r){b.y=H-b.r;b.vy=-Math.abs(b.vy);}
      for(let i=0;i<2;i++){
        const p=g.pl[i];
        if(i===0&&b.x<b.r+20+p.shield-100&&b.x>0&&Math.abs(b.y-(H-100))<60&&b.vx<0){
          b.x=b.r+20+p.shield-100;
          b.vx=Math.abs(b.vx)*1.02;
          FX.playBounce();
        }
        if(i===1&&b.x>W-b.r-(p.shield+100-W+40)&&b.x<W&&Math.abs(b.y-(H-100))<60&&b.vx>0){
          b.vx=-Math.abs(b.vx)*1.02;
          FX.playBounce();
        }
        if(b.x<b.r+10){b.x=b.r+10;b.vx=Math.abs(b.vx);}
        if(b.x>W-b.r-10){b.x=W-b.r-10;b.vx=-Math.abs(b.vx);}
      }
      if(b.x>40&&b.x<140&&b.y<80&&g.pl[0].hp>0){g.pl[0].hp--;b.dead=true;FX.playBoom();g.burst(90,60,C1,15,300);}
      if(b.x>W-140&&b.x<W-40&&b.y<80&&g.pl[1].hp>0){g.pl[1].hp--;b.dead=true;FX.playBoom();g.burst(W-90,60,C2,15,300);}
    });
    g.balls=g.balls.filter(b=>!b.dead);
    if(g.balls.length===0){
      g.balls.push({x:450,y:250,vx:Math.random()<.5?-150:150,vy:100,r:6});
    }
    if(g.pl[0].hp<=0)g.point(1,"CASTLE DOWN");
    else if(g.pl[1].hp<=0)g.point(0,"CASTLE DOWN");
  },
  draw(g,ctx){
    ctx.fillStyle="#1a1230";ctx.fillRect(0,0,W,H);
    for(let k=0;k<40;k++){ctx.fillStyle="#26386f";ctx.fillRect((k*97)%W,(k*61)%H,2,2);}
    g.pl.forEach((p,i)=>{
      const cX=i?W-140:40;
      ctx.fillStyle=col(i);
      ctx.fillRect(cX,20,100,80);
      ctx.fillStyle="rgba(255,255,255,.3)";
      for(let k=0;k<5;k++){ctx.fillRect(cX+k*22,14,14,10);}
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(cX,20,100,80);
      for(let k=0;k<8;k++){
        ctx.fillStyle=k<p.hp?GOLD:"#2a2f63";
        ctx.fillRect(i?W-40-k*16:20+k*16,110,10,14);
      }
      ctx.fillStyle=col(i);
      ctx.fillRect(i?p.shield-8:p.shield-8,H-140,16,80);
      ctx.strokeStyle="#fff";ctx.lineWidth=2;
      ctx.strokeRect(i?p.shield-8:p.shield-8,H-140,16,80);
    });
    g.balls.forEach(b=>{
      ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.stroke();
    });
  }
});

/* 5. ZOMBIE SURVIVAL */
micro({
  id:"zombieGame",title:"Zombie Survival",desc:"Kill zombies. Stay alive.",
  cat:"action",key:"zombie",win:1,hud:false,
  controls:"P1: WASD move, SPACE shoot　 P2: ARROWS, ENTER — 30 seconds, most kills wins",
  init(g){
    g.tl=30;g.s=[0,0];g.zombies=[];g.bullets=[];g.spawnT=0;
    g.pl=[{x:225,y:250,cd:0,hp:3},{x:675,y:250,cd:0,hp:3}];
  },
  update(g,dt){
    g.tl-=dt;g.spawnT-=dt;
    if(g.spawnT<=0&&g.zombies.length<15){
      g.spawnT=.6;
      const side=ri(0,3);
      const z={hp:1,id:0};
      if(side===0){z.x=rnd(0,W);z.y=-20;}
      else if(side===1){z.x=rnd(0,W);z.y=H+20;}
      else if(side===2){z.x=-20;z.y=rnd(0,H);}
      else{z.x=W+20;z.y=rnd(0,H);}
      z.speed=40+Math.random()*50;
      z.target=Math.random()<.5?0:1;
      g.zombies.push(z);
    }
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.cd=Math.max(0,p.cd-dt);
      const cx=i?675:225;
      if(I.l)p.x-=220*dt;
      if(I.r)p.x+=220*dt;
      if(I.u)p.y-=220*dt;
      if(I.d)p.y+=220*dt;
      p.x=cl(p.x,i?470:20,i?880:430);
      p.y=cl(p.y,40,H-40);
      if(I.a&&p.cd<=0){
        p.cd=.25;
        const gx=i?675:225,gy=250;
        const dx=gx-p.x,dy=gy-p.y,d=Math.hypot(dx,dy)||1;
        g.bullets.push({x:p.x,y:p.y,vx:dx/d*500,vy:dy/d*500,o:i,life:1});
        FX.tone(600,.04,"square",.02);
      }
    });
    g.zombies.forEach(z=>{
      const t=g.pl[z.target];
      const dx=t.x-z.x,dy=t.y-z.y,d=Math.hypot(dx,dy)||1;
      z.x+=dx/d*z.speed*dt;z.y+=dy/d*z.speed*dt;
      if(d<18){t.hp-=dt*1.5;if(t.hp<=0)g.byScore(g.s);}
    });
    g.bullets.forEach(b=>{
      b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
      if(b.life<=0)b.dead=true;
      for(const z of g.zombies){
        if(Math.hypot(b.x-z.x,b.y-z.y)<15){
          z.hp--;b.dead=true;
          if(z.hp<=0){g.s[b.o]++;z.dead=true;g.burst(z.x,z.y,GREEN,10,200);FX.tone(700,.05,"square",.04);}
          break;
        }
      }
    });
    g.bullets=g.bullets.filter(b=>!b.dead);
    g.zombies=g.zombies.filter(z=>!z.dead);
    if(g.tl<=0)g.byScore(g.s);
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1a0a";ctx.fillRect(0,0,W,H);
    for(let i=0;i<2;i++){
      const off=i*450;
      ctx.fillStyle=i?"#0a1a0a":"#0a0a1a";ctx.fillRect(off,0,450,H);
    }
    g.zombies.forEach(z=>{
      ctx.fillStyle="#4a8a3a";
      ctx.fillRect(z.x-10,z.y-14,20,28);
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(z.x-10,z.y-14,20,28);
      ctx.fillStyle="#ff4a4a";
      ctx.fillRect(z.x-6,z.y-8,4,4);ctx.fillRect(z.x+2,z.y-8,4,4);
    });
    g.bullets.forEach(b=>{
      ctx.fillStyle=GOLD;ctx.fillRect(b.x-2,b.y-4,4,8);
    });
    g.pl.forEach((p,i)=>{
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";
      ctx.fillRect(p.x-6,p.y-4,4,4);ctx.fillRect(p.x+2,p.y-4,4,4);
    });
    g.text("P1 KILLS: "+g.s[0],20,30,18,C1);
    g.text("P2 KILLS: "+g.s[1],W-20,30,18,C2,"right");
    g.text(Math.max(0,Math.ceil(g.tl))+"s",W/2,30,22,GOLD,"center");
  }
});

/* 6. CHAIN BOMB */
micro({
  id:"chainbombGame",title:"Chain Bomb",desc:"Click to place bombs. Chain explosions.",
  cat:"brain",key:"chainbomb",win:1,hud:false,
  controls:"P1: A/D move cursor, SPACE drop bomb　 P2: ARROWS, ENTER — 30 seconds, chain reactions score big",
  init(g){
    g.tl=30;g.s=[0,0];
    g.cursor=[{x:150,y:250},{x:750,y:250}];
    g.bombs=[];g.blasts=[];
  },
  update(g,dt){
    g.tl-=dt;
    g.cursor.forEach((c,i)=>{
      const I=g.I[i];
      c.x=cl(c.x+((I.r?1:0)-(I.l?1:0))*280*dt,i?470:20,i?870:430);
      c.y=cl(c.y+((I.d?1:0)-(I.u?1:0))*280*dt,40,H-40);
      if(I.pa){
        g.bombs.push({x:c.x,y:c.y,o:i,fuse:1.5,hp:1});
        FX.tone(400,.08,"square",.03);
      }
    });
    g.bombs.forEach(b=>{b.fuse-=dt;if(b.fuse<=0)b.dead=true;});
    const fired=g.bombs.filter(b=>b.dead);
    fired.forEach(fire=>{
      const toExplode=[fire];
      let changed=true;
      while(changed){
        changed=false;
        for(const b of g.bombs){
          if(b.dead||toExplode.includes(b))continue;
          if(toExplode.some(t=>Math.hypot(b.x-t.x,b.y-t.y)<70)){
            toExplode.push(b);changed=true;
          }
        }
      }
      toExplode.forEach(b=>{
        if(b.dead&&b!==fire)return;
        b.dead=true;
        g.blasts.push({x:b.x,y:b.y,o:b.o,t:.4});
        g.burst(b.x,b.y,GOLD,10,240);
        FX.playBoom();
      });
      const chainLen=toExplode.length;
      const pts=chainLen===1?1:chainLen===2?3:chainLen===3?8:chainLen*5;
      g.s[fire.o]+=pts;
      if(chainLen>1){
        g.banner_("CHAIN x"+chainLen+" +"+pts,fire.o?C2:C1,.6);
      }
    });
    g.bombs=g.bombs.filter(b=>!b.dead);
    g.blasts.forEach(bl=>bl.t-=dt);
    g.blasts=g.blasts.filter(bl=>bl.t>0);
    if(g.tl<=0)g.byScore(g.s);
  },
  draw(g,ctx){
    ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
    for(let k=0;k<40;k++){ctx.fillStyle="#26386f";ctx.fillRect((k*97)%W,(k*61)%H,2,2);}
    g.blasts.forEach(bl=>{
      ctx.fillStyle=`rgba(255,230,109,${bl.t*2})`;
      ctx.beginPath();ctx.arc(bl.x,bl.y,40,0,Math.PI*2);ctx.fill();
    });
    g.bombs.forEach(b=>{
      ctx.fillStyle=col(b.o);
      ctx.beginPath();ctx.arc(b.x,b.y,12+b.fuse,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle="#fff";
      ctx.beginPath();ctx.arc(b.x-3,b.y-3,4,0,Math.PI*2);ctx.fill();
    });
    g.cursor.forEach((c,i)=>{
      ctx.strokeStyle=col(i);ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(c.x-20,c.y);ctx.lineTo(c.x+20,c.y);
      ctx.moveTo(c.x,c.y-20);ctx.lineTo(c.x,c.y+20);
      ctx.stroke();
      ctx.beginPath();ctx.arc(c.x,c.y,15,0,Math.PI*2);ctx.stroke();
    });
    g.text("P1: "+g.s[0],20,30,18,C1);
    g.text("P2: "+g.s[1],W-20,30,18,C2,"right");
    g.text(Math.max(0,Math.ceil(g.tl))+"s",W/2,30,22,GOLD,"center");
  }
});

/* 7. JOUST (flying knights) */
micro({
  id:"joustGame2",title:"Joust",desc:"Flying knights. Higher hit wins.",
  cat:"action",key:"joust2",win:3,
  controls:"P1: A/D move, W flap　 P2: ←/→, ↑ flap — who is HIGHER on collision wins",
  round(g){
    g.pl=[
      {x:200,y:300,vx:0,vy:0,dir:1,alive:true},
      {x:700,y:300,vx:0,vy:0,dir:-1,alive:true}
    ];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      if(!p.alive)return;
      const I=g.I[i];
      p.vx=(I.r?1:0)-(I.l?1:0);
      p.vx*=260;
      if(I.u){p.vy-=420;}
      p.vy+=500*dt;
      p.vy=cl(p.vy,-400,400);
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.y<40){p.y=40;p.vy=Math.max(0,p.vy);}
      if(p.y>H-20)p.alive=false;
      if(p.x<20||p.x>W-20)p.vx*=-1;
    });
    const [a,b]=g.pl;
    if(a.alive&&b.alive&&Math.hypot(a.x-b.x,a.y-b.y)<40){
      const higher=a.y<b.y?0:1;
      g.pl[1-higher].alive=false;
      g.burst(g.pl[1-higher].x,g.pl[1-higher].y,col(higher),20,300);
      g.point(higher,"JOUSTED!");
    }
    if(!a.alive&&!b.alive)g.next("BOTH FELL");
    else if(!a.alive)g.point(1,"P1 FELL");
    else if(!b.alive)g.point(0,"P2 FELL");
  },
  draw(g,ctx){
    const gr=ctx.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,"#2a1a4a");gr.addColorStop(1,"#6a2a3a");
    ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#ff6a2a";ctx.fillRect(0,H-30,W,30);
    ctx.fillStyle="#ffb03a";
    for(let x=0;x<W;x+=30)ctx.fillRect(x+((g.t*40)%30),H-30+Math.sin(x+g.t*4)*3,18,5);
    g.pl.forEach((p,i)=>{
      if(!p.alive)return;
      const flap=Math.sin(g.t*20)*4*(p.vy<0?1:.3);
      ctx.fillStyle="rgba(255,255,255,.8)";
      ctx.beginPath();
      ctx.ellipse(p.x-p.dir*10,p.y+2,14,6+flap,-.3*p.dir,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.ellipse(p.x,p.y+6,16,11,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle=GOLD;
      ctx.fillRect(p.x+p.dir*14,p.y+4,10,5);
      ctx.fillStyle="#f3bd83";
      ctx.fillRect(p.x-5,p.y-16,10,10);
      ctx.fillStyle=col(i);
      ctx.fillRect(p.x-6,p.y-19,12,5);
      ctx.strokeStyle="#e8e8ff";ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(p.x,p.y-8);ctx.lineTo(p.x+p.dir*30,p.y-22);ctx.stroke();
    });
    g.text("HIGHER HIT WINS",W/2,30,14,"#ffe66d","center");
  }
});

/* 8. ICE CLIMBER */
micro({
  id:"iceclimberGame",title:"Ice Climber",desc:"Climb the platforms. First to top wins.",
  cat:"action",key:"iceclimber",win:3,
  controls:"P1: A/D move, W jump　 P2: ←/→, ↑ — reach the top platform",
  round(g){
    g.pl=[
      {x:200,y:440,vx:0,vy:0,grounded:false},
      {x:700,y:440,vx:0,vy:0,grounded:false}
    ];
    g.plats=[
      {x:0,y:440,w:900},
      {x:60,y:380,w:300},{x:540,y:380,w:300},
      {x:200,y:320,w:500},
      {x:60,y:260,w:300},{x:540,y:260,w:300},
      {x:200,y:200,w:500},
      {x:60,y:140,w:300},{x:540,y:140,w:300},
      {x:300,y:80,w:300}
    ];
  },
  update(g,dt){
    let winner=-1;
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.vx=((I.r?1:0)-(I.l?1:0))*300;
      if(I.u&&p.grounded){p.vy=-660;p.grounded=false;FX.tone(400,.06,"square",.03);}
      p.vy+=1500*dt;
      const oldY=p.y;
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      p.grounded=false;
      for(const pl of g.plats){
        if(p.x>pl.x-14&&p.x<pl.x+pl.w+14&&p.vy>=0&&oldY<=pl.y&&p.y>=pl.y){
          p.y=pl.y;p.vy=0;p.grounded=true;
        }
      }
      if(p.y<50&&winner<0)winner=i;
    });
    if(winner>=0)g.point(winner,"TOP!");
  },
  draw(g,ctx){
    const gr=ctx.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,"#3a8ac8");gr.addColorStop(1,"#a8d8ff");
    ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    g.plats.forEach(pl=>{
      ctx.fillStyle="#4a3a2a";
      ctx.fillRect(pl.x,pl.y,pl.w,12);
      ctx.fillStyle="#fff";ctx.fillRect(pl.x,pl.y,pl.w,4);
    });
    ctx.fillStyle=GREEN;
    ctx.fillRect(W/2-3,60,6,20);
    ctx.fillStyle="#fff";
    ctx.fillRect(W/2+3,60,20,10);
    g.pl.forEach((p,i)=>{
      ctx.fillStyle=col(i);
      ctx.fillRect(p.x-10,p.y-30,20,30);
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(p.x-10,p.y-30,20,30);
      ctx.fillStyle="#f3bd83";
      ctx.fillRect(p.x-7,p.y-42,14,14);
      ctx.fillStyle="#fff";
      ctx.fillRect(p.x-4,p.y-38,3,3);ctx.fillRect(p.x+1,p.y-38,3,3);
    });
  }
});

/* 9. DUCK DUCK GOOSE */
micro({
  id:"duckgooseGame",title:"Duck Duck Goose",desc:"Chase and tag. Whoever is 'goose' is it.",
  cat:"action",key:"duckgoose",win:3,
  controls:"P1: WASD move　 P2: ARROWS — one is duck, one is goose. Goose must catch duck.",
  round(g){
    g.pl=[
      {x:200,y:250,isGoose:false},
      {x:700,y:250,isGoose:true}
    ];
    g.tl=20;
    g.safe=[{x:80,y:80,w:100,h:80},{x:720,y:80,w:100,h:80}];
  },
  update(g,dt){
    g.tl-=dt;
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*260*dt,20,W-20);
      p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*260*dt,60,H-20);
    });
    const [a,b]=g.pl;
    const gooseIdx=a.isGoose?0:1;
    const goose=g.pl[gooseIdx],duck=g.pl[1-gooseIdx];
    if(Math.hypot(goose.x-duck.x,goose.y-duck.y)<30){
      g.point(gooseIdx,"CAUGHT!");
    }
    if(g.tl<=0)g.point(1-gooseIdx,"ESCAPED!");
  },
  draw(g,ctx){
    ctx.fillStyle="#2a5a2a";ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#3a7a3a";ctx.fillRect(0,0,W,60);
    g.safe.forEach(s=>{
      ctx.fillStyle="rgba(255,255,255,.2)";
      ctx.fillRect(s.x,s.y,s.w,s.h);
    });
    g.pl.forEach((p,i)=>{
      const isGoose=p.isGoose;
      ctx.fillStyle=isGoose?"#ff4a4a":col(i);
      ctx.beginPath();ctx.arc(p.x,p.y,18,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";
      ctx.beginPath();ctx.arc(p.x-6,p.y-6,4,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=GOLD;ctx.beginPath();
      ctx.moveTo(p.x+16,p.y);
      ctx.lineTo(p.x+26,p.y-4);
      ctx.lineTo(p.x+26,p.y+4);
      ctx.fill();
      g.text(isGoose?"GOOSE":"DUCK",p.x,p.y-28,12,"#fff","center");
    });
    g.text("P"+(g.pl[0].isGoose?"1":"2")+" IS GOOSE",W/2,30,16,GOLD,"center");
    g.text(Math.max(0,Math.ceil(g.tl))+"s",W/2,55,18,"#fff","center");
  }
});

/* 10. TANK BATTLE */
micro({
  id:"tankbattleGame",title:"Tank Battle",desc:"Classic arena. One hit, one kill.",
  cat:"action",key:"tankbattle",win:5,
  controls:"P1: W/S move, A/D turn, SPACE fire　 P2: ↑/↓, ←/→, ENTER — shots bounce off walls",
  round(g){
    g.pl=[
      {x:100,y:250,a:0,cd:0,alive:true},
      {x:800,y:250,a:Math.PI,cd:0,alive:true}
    ];
    g.bullets=[];
    g.walls=[{x:440,y:100,w:20,h:300}];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      if(!p.alive)return;
      const I=g.I[i];
      p.cd=Math.max(0,p.cd-dt);
      if(I.l)p.a-=3*dt;
      if(I.r)p.a+=3*dt;
      let speed=0;
      if(I.u)speed=130;
      if(I.d)speed=-90;
      p.x+=Math.cos(p.a)*speed*dt;
      p.y+=Math.sin(p.a)*speed*dt;
      p.x=cl(p.x,20,W-20);p.y=cl(p.y,60,H-20);
      for(const w of g.walls){
        if(p.x>w.x-16&&p.x<w.x+w.w+16&&p.y>w.y-16&&p.y<w.y+w.h+16){
          const dx=p.x-(w.x+w.w/2),dy=p.y-(w.y+w.h/2);
          if(Math.abs(dx)>Math.abs(dy))p.x=dx>0?w.x+w.w+16:w.x-16;
          else p.y=dy>0?w.y+w.h+16:w.y-16;
        }
      }
      if(I.a&&p.cd<=0){
        p.cd=.6;
        g.bullets.push({x:p.x+Math.cos(p.a)*18,y:p.y+Math.sin(p.a)*18,
                        vx:Math.cos(p.a)*380,vy:Math.sin(p.a)*380,o:i,b:0});
        FX.playShoot();
      }
    });
    g.bullets.forEach(b=>{
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.x<10||b.x>W-10){b.vx*=-1;b.b++;b.x=cl(b.x,10,W-10);FX.playBounce();}
      if(b.y<50||b.y>H-10){b.vy*=-1;b.b++;b.y=cl(b.y,50,H-10);FX.playBounce();}
      for(const w of g.walls){
        if(b.x>w.x&&b.x<w.x+w.w&&b.y>w.y&&b.y<w.y+w.h){
          const cx=w.x+w.w/2,cy=w.y+w.h/2;
          if(Math.abs(b.x-cx)>Math.abs(b.y-cy)){b.vx*=-1;b.x=b.vx>0?w.x+w.w:b.x;}
          else{b.vy*=-1;}
          b.b++;FX.playBounce();
        }
      }
      const t=g.pl[1-b.o];
      if(t.alive&&Math.hypot(b.x-t.x,b.y-t.y)<18){
        t.alive=false;b.dead=true;
        g.burst(t.x,t.y,col(b.o),25,400);
        FX.playBoom();
        g.point(b.o,"K.O.!");
      }
      if(b.b>3||b.x<-20||b.x>W+20||b.y<30||b.y>H+20)b.dead=true;
    });
    g.bullets=g.bullets.filter(b=>!b.dead);
    if(!g.pl[0].alive&&!g.pl[1].alive)g.next("DOUBLE KO");
    else if(!g.pl[0].alive)g.point(1,"P2 WINS");
    else if(!g.pl[1].alive)g.point(0,"P1 WINS");
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1020";ctx.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=40)for(let y=0;y<H;y+=40){
      if(((x+y)/40)%2===0){ctx.fillStyle="#141c40";ctx.fillRect(x,y,40,40);}
    }
    for(const w of g.walls){
      ctx.fillStyle="#4a3a6a";ctx.fillRect(w.x,w.y,w.w,w.h);
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(w.x,w.y,w.w,w.h);
    }
    ctx.strokeStyle="#64eaff";ctx.lineWidth=3;
    ctx.strokeRect(2,40,W-4,H-44);
    g.bullets.forEach(b=>{
      ctx.fillStyle=GOLD;
      ctx.beginPath();ctx.arc(b.x,b.y,4,0,Math.PI*2);ctx.fill();
    });
    g.pl.forEach((p,i)=>{
      if(!p.alive)return;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);
      ctx.fillStyle="#0e1230";
      ctx.fillRect(-15,-10,30,6);ctx.fillRect(-15,4,30,6);
      ctx.fillStyle=col(i);
      ctx.fillRect(-12,-8,24,16);
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(-12,-8,24,16);
      ctx.fillStyle="#1b2147";
      ctx.fillRect(2,-3,20,6);
      ctx.fillStyle="#dfe9ff";
      ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
    g.text("P1",16,28,16,C1);
    g.text("P2",W-16,28,16,C2,"right");
  }
});

})();