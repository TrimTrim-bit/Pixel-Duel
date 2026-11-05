/* =====================================================
   GAME PACK AF — 10 games
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* FALLING BLOCKS */
micro({
  id:"fallblocksGame",title:"Falling Blocks",desc:"Dodge falling blocks. 3 hits loses.",
  cat:"reflex",key:"fallblocks",win:3,
  controls:"P1: A/D move　 P2: ←/→ — blocks fall faster over time",
  round(g){
    g.pl=[{x:225,hp:3,flash:0},{x:675,hp:3,flash:0}];
    g.blocks=[[],[]];g.spawnT=0;
  },
  update(g,dt){
    g.spawnT-=dt;
    if(g.spawnT<=0&&g.blocks[0].length+g.blocks[1].length<12){
      g.spawnT=Math.max(.15,.5-g.t*.005);
      for(let i=0;i<2;i++)g.blocks[i].push({x:rnd(60,390),y:-30,vy:180+g.t*8,w:rnd(30,50)});
    }
    g.pl.forEach((p,i)=>{
      p.flash=Math.max(0,p.flash-dt);
      const I=g.I[i];
      p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*380*dt,30,420);
      for(let k=0;k<g.blocks[i].length;k++){
        const b=g.blocks[i][k];
        b.y+=b.vy*dt;
        if(b.y>420&&b.y<470&&Math.abs(b.x-p.x)<b.w/2+16&&p.flash<=0){
          p.hp--;p.flash=1;
          g.burst(i*450+p.x,455,RED,14,320);playHitSound();
          g.blocks[i].splice(k,1);k--;
          if(p.hp<=0){g.point(1-i,"CRUSHED!");return;}
        }
      }
      g.blocks[i]=g.blocks[i].filter(b=>b.y<H+50);
    });
  },
  draw(g,ctx){
    for(let i=0;i<2;i++){
      const off=i*450,p=g.pl[i];
      ctx.fillStyle=i?"#1a1030":"#0f1530";ctx.fillRect(off,0,450,H);
      ctx.fillStyle="#1a1a2a";ctx.fillRect(off,480,450,20);
      g.blocks[i].forEach(b=>{
        ctx.fillStyle=RED;
        ctx.fillRect(off+b.x-b.w/2,b.y,b.w,40);
        ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(off+b.x-b.w/2,b.y,b.w,40);
        ctx.fillStyle="rgba(255,255,255,.3)";ctx.fillRect(off+b.x-b.w/2,b.y,b.w,4);
      });
      ctx.globalAlpha=p.flash>0&&Math.floor(p.flash*20)%2?.3:1;
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(off+p.x,455,18,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.globalAlpha=1;
      g.text("♥".repeat(Math.max(0,p.hp)),off+20,30,18,col(i));
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* BOUNCING BULLETS */
micro({
  id:"bouncybulletsGame",title:"Bouncing Bullets",desc:"Bullets bounce. Don't get hit.",
  cat:"action",key:"bouncybullets",win:3,
  controls:"P1: WASD move, SPACE fire　 P2: ARROWS, ENTER — bullets ricochet off walls",
  round(g){
    g.pl=[{x:200,y:250,cd:0,hp:3},{x:700,y:250,cd:0,hp:3}];
    g.bullets=[];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.cd=Math.max(0,p.cd-dt);
      p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*240*dt,20,W-20);
      p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*240*dt,60,H-20);
      if(I.a&&p.cd<=0){
        p.cd=.9;
        const ang=Math.random()*Math.PI*2;
        g.bullets.push({x:p.x,y:p.y,vx:Math.cos(ang)*280,vy:Math.sin(ang)*280,o:i,b:0,life:4});
        FX.playShoot();
      }
    });
    g.bullets.forEach(b=>{
      b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
      if(b.x<10){b.x=10;b.vx*=-1;b.b++;}
      if(b.x>W-10){b.x=W-10;b.vx*=-1;b.b++;}
      if(b.y<50){b.y=50;b.vy*=-1;b.b++;}
      if(b.y>H-10){b.y=H-10;b.vy*=-1;b.b++;}
      if(b.b>3||b.life<=0)b.dead=true;
      for(let j=0;j<2;j++){
        if(j===b.o||b.dead)continue;
        const t=g.pl[j];
        if(Math.hypot(b.x-t.x,b.y-t.y)<16){
          b.dead=true;t.hp--;
          g.burst(t.x,t.y,col(b.o),14,300);playHitSound();
          if(t.hp<=0){g.point(b.o,"HIT!");return;}
        }
      }
    });
    g.bullets=g.bullets.filter(b=>!b.dead);
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1020";ctx.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=50)for(let y=50;y<H;y+=50){
      if(((x+y)/50)%2===0){ctx.fillStyle="#141c40";ctx.fillRect(x,y,50,50);}
    }
    ctx.strokeStyle="#64eaff";ctx.lineWidth=3;ctx.strokeRect(8,48,W-16,H-58);
    g.bullets.forEach(b=>{
      ctx.fillStyle=col(b.o);
      ctx.beginPath();ctx.arc(b.x,b.y,6,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#fff";ctx.lineWidth=1;ctx.stroke();
    });
    g.pl.forEach((p,i)=>{
      g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,false);
      g.text("P"+(i+1)+" ♥"+p.hp,i?W-20:20,30,16,col(i),i?"right":"left");
    });
  }
});

/* ICE SKATING */
micro({
  id:"iceskatingGame",title:"Ice Skating",desc:"Slide with momentum. Push rival off the ice.",
  cat:"action",key:"iceskating",win:3,
  controls:"P1: WASD push　 P2: ARROWS — no friction! Momentum carries you far",
  round(g){
    g.pl=[
      {x:225,y:250,vx:0,vy:0,color:C1},
      {x:675,y:250,vx:0,vy:0,color:C2}
    ];
    g.arena={x:W/2,y:H/2+20,r:200};
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0);
      const l=Math.hypot(ax,ay);
      if(l>0){p.vx+=ax/l*280*dt;p.vy+=ay/l*280*dt;}
      p.vx*=Math.pow(.99,60*dt);p.vy*=Math.pow(.99,60*dt);
      const sp=Math.hypot(p.vx,p.vy);
      if(sp>320){p.vx*=320/sp;p.vy*=320/sp;}
      p.x+=p.vx*dt;p.y+=p.vy*dt;
    });
    const [a,b]=g.pl,d=Math.hypot(a.x-b.x,a.y-b.y);
    if(d<36&&d>0){
      const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d,o=(36-d)/2;
      a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;
      const vn=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
      if(vn<0){const imp=-1.3*vn/2;a.vx-=imp*nx;a.vy-=imp*ny;b.vx+=imp*nx;b.vy+=imp*ny;}
    }
    const off=g.pl.map(p=>Math.hypot(p.x-g.arena.x,p.y-g.arena.y)>g.arena.r);
    if(off[0]&&off[1])g.next("BOTH FELL");
    else if(off[0]){g.burst(g.pl[0].x,g.pl[0].y,C1,24,400);g.point(1,"P2 WINS");}
    else if(off[1]){g.burst(g.pl[1].x,g.pl[1].y,C2,24,400);g.point(0,"P1 WINS");}
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1020";ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#bfe7ff";
    ctx.beginPath();ctx.arc(g.arena.x,g.arena.y,g.arena.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#5a8ad8";ctx.lineWidth=4;
    ctx.beginPath();ctx.arc(g.arena.x,g.arena.y,g.arena.r,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle="rgba(90,138,216,.3)";ctx.lineWidth=2;
    for(let k=-3;k<=3;k++){
      ctx.beginPath();ctx.moveTo(g.arena.x+k*40,g.arena.y-g.arena.r);
      ctx.lineTo(g.arena.x+k*40-60,g.arena.y+g.arena.r);ctx.stroke();
    }
    g.pl.forEach((p,i)=>{
      ctx.fillStyle=`rgba(${i?255:100},${i?114:234},${i?200:255},.3)`;
      ctx.beginPath();ctx.arc(p.x-p.vx*.05,p.y-p.vy*.05,14,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
    });
  }
});

/* LAVA ESCAPE */
micro({
  id:"lavaescapeGame",title:"Lava Escape",desc:"Climb higher as the lava rises.",
  cat:"action",key:"lavaescape",win:3,
  controls:"P1: A/D move, W jump　 P2: ←/→, ↑ — lava rises constantly",
  round(g){
    g.lava=H;
    g.plats=[[],[]];
    for(let i=0;i<2;i++){
      const r=seeded(ri(1,1e6));
      // build the tower from the ground up: bottom platform at y=430 (near the
      // floor), then steps going up. Players spawn standing on platform 0.
      for(let k=0;k<10;k++){
        g.plats[i].push({x:60+r()*320,y:430-k*46,w:80});
      }
    }
    g.pl=[
      {x:225,y:430,vx:0,vy:0,grounded:true},
      {x:675,y:430,vx:0,vy:0,grounded:true}
    ];
  },
  update(g,dt){
    g.lava-=18*dt;
    const dead=[];
    g.pl.forEach((p,i)=>{
      const I=g.I[i],off=i*450;
      p.vx=((I.r?1:0)-(I.l?1:0))*240;
      if(I.u&&p.grounded){p.vy=-560;p.grounded=false;FX.tone(500,.06,"square",.03);}
      p.vy+=1400*dt;
      p.x=cl(p.x+p.vx*dt,off+20,off+430);
      p.y+=p.vy*dt;
      p.grounded=false;
      for(const pl of g.plats[i]){
        if(p.x>pl.x-14&&p.x<pl.x+pl.w+14&&p.vy>=0&&p.y>=pl.y&&p.y-pl.y<30){
          p.y=pl.y;p.vy=0;p.grounded=true;
        }
      }
      if(p.y>g.lava)dead.push(i);
    });
    if(dead.length===2)g.next("BOTH BURNED");
    else if(dead.length===1){g.burst(g.pl[dead[0]].x,g.lava,RED,30,400);FX.playBoom();g.point(1-dead[0],"BURNED");}
  },
  draw(g,ctx){
    const gr=ctx.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,"#2a1a3a");gr.addColorStop(1,"#4a2a3a");
    ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    g.lava=cl(g.lava,0,H);
    ctx.fillStyle="#ff6a2a";ctx.fillRect(0,g.lava,W,H-g.lava);
    ctx.fillStyle="#ffb03a";
    for(let x=0;x<W;x+=30)ctx.fillRect(x+Math.sin(g.t*3+x)*8,g.lava-3+Math.sin(x+g.t*4)*3,20,5);
    for(let i=0;i<2;i++){
      g.plats[i].forEach(pl=>{
        if(pl.y<g.lava-20)return;
        ctx.fillStyle="#4a3a6a";ctx.fillRect(pl.x,pl.y,pl.w,10);
        ctx.fillStyle="#6a56b8";ctx.fillRect(pl.x,pl.y,pl.w,3);
      });
      const p=g.pl[i];
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(p.x,p.y-12,14,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      g.text("P"+(i+1),i?W-20:20,30,16,col(i),i?"right":"left");
    }
  }
});

/* FROZEN LAKE */
micro({
  id:"frozenlakeGame",title:"Frozen Lake",desc:"Ice breaks under your feet. Stay on solid ground.",
  cat:"reflex",key:"frozenlake",win:3,
  controls:"P1: WASD move　 P2: ARROWS — 3 HP. Ice regenerates over time",
  round(g){
    g.pl=[
      {x:225,y:250,hp:3,inv:0},
      {x:675,y:250,hp:3,inv:0}
    ];
    g.tiles=[[],[]];
    for(let i=0;i<2;i++)for(let y=0;y<8;y++)for(let x=0;x<10;x++){
      g.tiles[i].push({x:x*45,y:60+y*55,w:45,h:55,crackT:0,alive:true});
    }
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i],off=i*450;
      p.inv=Math.max(0,p.inv-dt);
      p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*220*dt,off+10,off+440);
      p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*220*dt,70,H-30);
      const tx=Math.floor((p.x-off)/45),ty=Math.floor((p.y-60)/55);
      if(tx>=0&&tx<10&&ty>=0&&ty<8){
        const tile=g.tiles[i][ty*10+tx];
        if(tile.alive){
          tile.crackT+=dt;
          if(tile.crackT>1.5){
            tile.alive=false;
            tile.regrowT=2.5;
            g.burst(off+tx*45+22.5,60+ty*55+27.5,"#8fc8f5",8,180);
            if(p.inv<=0){p.hp--;p.inv=1;
              g.burst(p.x,p.y,RED,15,300);playHitSound();
              if(p.hp<=0){g.point(1-i,"DROWNED");return;}
            }
          }
        }
      }
      g.tiles[i].forEach(t=>{
        if(!t.alive){
          t.regrowT-=dt;
          if(t.regrowT<=0){t.alive=true;t.crackT=0;}
        }
      });
    });
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1030";ctx.fillRect(0,0,W,H);
    for(let i=0;i<2;i++){
      const off=i*450;
      g.tiles[i].forEach(t=>{
        if(t.alive){
          ctx.fillStyle=t.crackT>1?"#a8d8ff":"#bfe7ff";
          ctx.fillRect(off+t.x+1,t.y+1,t.w-2,t.h-2);
          ctx.strokeStyle="#6aa8dc";ctx.lineWidth=1;
          ctx.strokeRect(off+t.x+1,t.y+1,t.w-2,t.h-2);
          if(t.crackT>.5){
            ctx.strokeStyle="rgba(90,60,60,.5)";ctx.lineWidth=2;
            ctx.beginPath();
            ctx.moveTo(off+t.x+t.w/2,t.y+5);
            ctx.lineTo(off+t.x+t.w/2-8,t.y+t.h/2);
            ctx.lineTo(off+t.x+t.w/2+5,t.y+t.h-5);
            ctx.stroke();
          }
        }
      });
      const p=g.pl[i];
      ctx.globalAlpha=p.inv>0&&Math.floor(p.inv*20)%2?.4:1;
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(p.x,p.y,12,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.globalAlpha=1;
      g.text("P"+(i+1)+" ♥"+p.hp,off+20,30,16,col(i));
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* MAGNET BATTLE */
micro({
  id:"magnetbattleGame",title:"Magnet Battle",desc:"Switch polarity. Push rival into spikes.",
  cat:"action",key:"magnetbattle",win:3,
  controls:"P1: WASD move, SPACE flip polarity　 P2: ARROWS, ENTER — same polarity = repel",
  round(g){
    g.pl=[
      {x:200,y:250,pol:1,hp:3,cd:0,color:C1},
      {x:700,y:250,pol:-1,hp:3,cd:0,color:C2}
    ];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.cd=Math.max(0,p.cd-dt);
      p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*180*dt,60,W-60);
      p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*180*dt,80,H-80);
      if(I.a&&p.cd<=0){p.pol*=-1;p.cd=.8;FX.tone(p.pol>0?440:660,.06,"square",.04);}
    });
    const [a,b]=g.pl,d=Math.hypot(b.x-a.x,b.y-a.y);
    if(d<250&&d>20){
      const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d;
      const sign=a.pol===b.pol?-1:1;
      const mag=1800*dt;
      a.vx=(a.vx||0)+sign*nx*mag;a.vy=(a.vy||0)+sign*ny*mag;
      b.vx=(b.vx||0)-sign*nx*mag;b.vy=(b.vy||0)-sign*ny*mag;
    }
    g.pl.forEach(p=>{
      p.x+=p.vx||0;p.y+=p.vy||0;
      p.vx=(p.vx||0)*.85;p.vy=(p.vy||0)*.85;
      p.x=cl(p.x,60,W-60);p.y=cl(p.y,80,H-80);
    });
    const inSpike=p=>(p.x<130&&p.y<180)||(p.x>W-130&&p.y<180)||(p.x<130&&p.y>H-100)||(p.x>W-130&&p.y>H-100);
    g.pl.forEach((p,i)=>{
      if(inSpike(p)&&p.hp>0){
        p.hp-=dt*2;
        if(p.hp<=0){g.burst(p.x,p.y,col(i),20,400);FX.playBoom();g.point(1-i,"SPIKED");}
      }
    });
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1020";ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#3a3a5a";
    for(let k=0;k<5;k++){
      ctx.beginPath();ctx.moveTo(k*22,0);ctx.lineTo(k*22+11,60);ctx.lineTo(k*22+22,0);ctx.fill();
      ctx.beginPath();ctx.moveTo(W-k*22,0);ctx.lineTo(W-k*22-11,60);ctx.lineTo(W-k*22-22,0);ctx.fill();
      ctx.beginPath();ctx.moveTo(k*22,H);ctx.lineTo(k*22+11,H-60);ctx.lineTo(k*22+22,H);ctx.fill();
      ctx.beginPath();ctx.moveTo(W-k*22,H);ctx.lineTo(W-k*22-11,H-60);ctx.lineTo(W-k*22-22,H);ctx.fill();
    }
    g.pl.forEach((p,i)=>{
      const c=p.pol>0?"#ff4a6a":"#4a8aff";
      ctx.fillStyle=c;
      ctx.beginPath();ctx.arc(p.x,p.y,20,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      g.text(p.pol>0?"+":"−",p.x,p.y+7,26,"#fff","center");
      g.text("♥"+(Math.max(0,Math.ceil(p.hp))),i?W-20:20,30,16,col(i),i?"right":"left");
    });
  }
});

/* BUBBLE BATTLE */
micro({
  id:"bubblebattleGame",title:"Bubble Battle",desc:"Trap rival in a bubble, then pop it for damage.",
  cat:"action",key:"bubblebattle",win:3,
  controls:"P1: WASD move, SPACE bubble　 P2: ARROWS, ENTER — bubbled rival is stunned",
  round(g){
    g.pl=[
      {x:200,y:250,hp:3,cd:0,stun:0,color:C1},
      {x:700,y:250,hp:3,cd:0,stun:0,color:C2}
    ];
    g.bubbles=[];
    g.projectiles=[];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      p.cd=Math.max(0,p.cd-dt);
      p.stun=Math.max(0,p.stun-dt);
      const I=g.I[i];
      if(p.stun>0)return;
      p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*240*dt,20,W-20);
      p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*240*dt,60,H-20);
      if(I.a&&p.cd<=0){
        p.cd=.6;
        const other=g.pl[1-i];
        const dx=other.x-p.x,dy=other.y-p.y,d=Math.hypot(dx,dy)||1;
        g.projectiles.push({x:p.x,y:p.y,vx:dx/d*340,vy:dy/d*340,o:i,life:1.2});
        FX.tone(500+i*100,.05,"square",.03);
      }
    });
    g.projectiles.forEach(pr=>{
      pr.x+=pr.vx*dt;pr.y+=pr.vy*dt;pr.life-=dt;
      if(pr.life<=0||pr.x<0||pr.x>W||pr.y<0||pr.y>H)pr.dead=true;
      const t=g.pl[1-pr.o];
      if(!pr.dead&&Math.hypot(pr.x-t.x,pr.y-t.y)<20&&t.stun<=0){
        pr.dead=true;
        t.stun=1.5;
        g.bubbles.push({x:t.x,y:t.y,o:1-pr.o,life:1.5,hp:1});
        FX.tone(600,.1,"triangle",.05);
      }
      if(!pr.dead&&t.stun>0){
        const bub=g.bubbles.find(b=>b.o===1-pr.o);
        if(bub&&Math.hypot(pr.x-t.x,pr.y-t.y)<40){
          pr.dead=true;bub.life=0;
          t.hp--;t.stun=0;
          g.burst(t.x,t.y,col(pr.o),20,400);playHitSound();
          if(t.hp<=0){g.point(pr.o,"POPPED!");return;}
        }
      }
    });
    g.projectiles=g.projectiles.filter(p=>!p.dead);
    g.bubbles.forEach(b=>{b.life-=dt;if(b.life<=0){b.dead=true;}});
    g.bubbles=g.bubbles.filter(b=>!b.dead);
    g.bubbles.forEach(b=>{
      const owner=g.pl[1-b.o];
      b.x=owner.x;b.y=owner.y;
    });
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1020";ctx.fillRect(0,0,W,H);
    g.projectiles.forEach(pr=>{
      ctx.fillStyle=col(pr.o);ctx.globalAlpha=.7;
      ctx.beginPath();ctx.arc(pr.x,pr.y,8,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
      ctx.strokeStyle="#fff";ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(pr.x,pr.y,10,0,Math.PI*2);ctx.stroke();
    });
    g.bubbles.forEach(b=>{
      ctx.strokeStyle=col(b.o);ctx.globalAlpha=.6;ctx.lineWidth=4;
      ctx.beginPath();ctx.arc(b.x,b.y,30,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=1;
      ctx.fillStyle="rgba(255,255,255,.15)";
      ctx.beginPath();ctx.arc(b.x,b.y,28,0,Math.PI*2);ctx.fill();
    });
    g.pl.forEach((p,i)=>{
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(p.x,p.y,16,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      g.text("♥"+(Math.max(0,p.hp)),i?W-20:20,30,16,col(i),i?"right":"left");
    });
  }
});

/* ROPE SWING */
micro({
  id:"ropeswingGame",title:"Rope Swing",desc:"Swing between ropes. Reach the goal first.",
  cat:"action",key:"ropeswing",win:3,
  controls:"P1: A/D swing, W release/jump　 P2: ←/→, ↑ — miss a rope and you fall",
  round(g){
    g.pl=[
      {x:100,y:250,vy:0,grabbed:true,ropeX:150,ropeY:100},
      {x:100,y:250,vy:0,grabbed:true,ropeX:150,ropeY:100}
    ];
    g.ropes=[];
    for(let i=0;i<8;i++){
      g.ropes.push({x:250+i*90,y:80+Math.sin(i*1.5)*30});
    }
    g.dist=[0,0];
    g.goalX=W-80;
  },
  update(g,dt){
    let winner=-1;
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      if(p.grabbed){
        const t=g.t*3+i;
        p.x=p.ropeX+Math.sin(t)*60;
        p.y=p.ropeY+60+Math.cos(t)*60;
        if(I.a){p.grabbed=false;p.vy=-300;p.vx=Math.cos(t)*200;}
      }else{
        p.x+=(p.vx||0)*dt;p.vy+=800*dt;p.y+=p.vy*dt;
        for(const r of g.ropes){
          if(Math.hypot(p.x-r.x,p.y-(r.y+120))<40){
            p.grabbed=true;p.ropeX=r.x;p.ropeY=r.y;
            break;
          }
        }
        if(p.y>H+30){
          p.x=50;p.y=250;p.grabbed=false;p.vy=0;
          FX.tone(120,.3,"sawtooth",.05,-60);
        }
      }
      p.dist=Math.max(p.dist,p.x);
      if(p.x>g.goalX&&winner<0)winner=i;
    });
    if(winner>=0)g.point(winner,"REACHED!");
  },
  draw(g,ctx){
    const gr=ctx.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,"#3a8ac8");gr.addColorStop(1,"#a8d8ff");
    ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#2a7a4a";ctx.fillRect(0,H-20,W,20);
    ctx.fillStyle=GREEN;ctx.fillRect(W-60,80,6,380);
    for(let k=0;k<20;k++){ctx.fillStyle=k%2?"#111":"#fff";ctx.fillRect(W-60,80+k*19,6,19);}
    g.ropes.forEach(r=>{
      ctx.strokeStyle="#8a5a3a";ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.lineTo(r.x,r.y+120);ctx.stroke();
    });
    g.pl.forEach((p,i)=>{
      if(p.grabbed){
        ctx.strokeStyle=col(i);ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(p.ropeX,p.ropeY);
        ctx.lineTo(p.x,p.y);ctx.stroke();
      }
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      g.text("P"+(i+1),i?W-20:20,30,16,col(i),i?"right":"left");
    });
  }
});

/* CONVEYOR CLASH */
micro({
  id:"conveyorGame",title:"Conveyor Clash",desc:"Conveyor belts push you. Stay on the ground.",
  cat:"action",key:"conveyor",win:3,
  controls:"P1: WASD move　 P2: ARROWS — belts change direction every few seconds",
  round(g){
    g.pl=[
      {x:225,y:250,hp:3},
      {x:675,y:250,hp:3}
    ];
    g.belts=[[],[]];
    for(let i=0;i<2;i++){
      const r=seeded(ri(1,1e6));
      for(let k=0;k<4;k++){
        g.belts[i].push({y:80+k*100,dir:r()<.5?1:-1,speed:100});
      }
    }
    g.flipT=2;
  },
  update(g,dt){
    g.flipT-=dt;
    if(g.flipT<=0){
      g.flipT=2+Math.random();
      g.belts.forEach(b=>b.forEach(x=>x.dir*=-1));
      FX.tone(400,.15,"sine",.04,200);
    }
    g.pl.forEach((p,i)=>{
      const I=g.I[i],off=i*450;
      p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*240*dt,off+20,off+430);
      p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*240*dt,70,H-20);
      for(const b of g.belts[i]){
        if(p.y>b.y&&p.y<b.y+100){
          p.x+=b.dir*b.speed*dt;
        }
      }
      if(p.x<off+20||p.x>off+430){p.x=cl(p.x,off+20,off+430);}
    });
  },
  draw(g,ctx){
    for(let i=0;i<2;i++){
      const off=i*450;
      ctx.fillStyle=i?"#1a1030":"#0f1530";ctx.fillRect(off,0,450,H);
      g.belts[i].forEach((b,k)=>{
        ctx.fillStyle="#2a2f63";ctx.fillRect(off,60,b.y-60,450);
        ctx.fillStyle=b.dir>0?"#64eaff":"#ff72c8";
        for(let x=0;x<450;x+=40){
          const off2=(x+g.t*80*b.dir)%450;
          ctx.fillRect(off+off2,60+b.y+40,20,3);
        }
        g.text(b.dir>0?"→":"←",off+225,60+b.y+50,16,b.dir>0?C1:C2,"center");
      });
      const p=g.pl[i];
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* SUMO PUSH */
micro({
  id:"sumopushGame",title:"Sumo Push",desc:"Charged sumo. Push rival outside the ring.",
  cat:"action",key:"sumopush",win:3,
  controls:"P1: A/D move, SPACE charge　 P2: ←/→, ENTER — charge gives extra push power",
  round(g){
    g.ring={x:W/2,y:H/2+20,r:200};
    g.pl=[
      {x:W/2-100,y:H/2+20,vx:0,vy:0,charge:0,cd:0,r:22,color:C1},
      {x:W/2+100,y:H/2+20,vx:0,vy:0,charge:0,cd:0,r:22,color:C2}
    ];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.cd=Math.max(0,p.cd-dt);
      p.charge=Math.max(0,p.charge-dt);
      const sp=p.charge>0?520:220;
      p.vx=((I.r?1:0)-(I.l?1:0))*sp;
      p.vy=((I.d?1:0)-(I.u?1:0))*sp;
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(I.a&&p.cd<=0){p.charge=.3;p.cd=1.2;FX.tone(400,.1,"sawtooth",.03,400);}
    });
    const [a,b]=g.pl,d=Math.hypot(b.x-a.x,b.y-a.y);
    if(d<a.r+b.r&&d>0){
      const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d,o=(a.r+b.r-d)/2;
      a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;
      const aPow=a.charge>0?1.5:1;
      const bPow=b.charge>0?1.5:1;
      a.x-=nx*8*aPow;a.y-=ny*8*aPow;b.x+=nx*8*bPow;b.y+=ny*8*bPow;
    }
    const out=[0,1].map(i=>Math.hypot(g.pl[i].x-g.ring.x,g.pl[i].y-g.ring.y)>g.ring.r);
    if(out[0]&&out[1])g.next("BOTH OUT");
    else if(out[0])g.point(1,"P2 WINS");
    else if(out[1])g.point(0,"P1 WINS");
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1a2a";ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#bfe7ff";
    ctx.beginPath();ctx.arc(g.ring.x,g.ring.y,g.ring.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#5a8ad8";ctx.lineWidth=5;
    ctx.beginPath();ctx.arc(g.ring.x,g.ring.y,g.ring.r,0,Math.PI*2);ctx.stroke();
    g.pl.forEach((p,i)=>{
      if(p.charge>0){
        ctx.fillStyle=`rgba(${i?255:100},${i?114:234},${i?200:255},.4)`;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r+10,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(p.x-6,p.y-6,4,0,Math.PI*2);ctx.fill();
    });
  }
});

})();