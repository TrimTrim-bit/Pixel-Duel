/* =====================================================
   GAME PACK AG — 8 games
   Gravity Hockey, Lawn Darts, Crokinole, Rope Pull,
   Stack Em, Color Spread, Snowball Frenzy, Bomb Toss
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* 1. GRAVITY HOCKEY */
micro({
  id:"gravhockeyGame",title:"Gravity Hockey",desc:"Black hole in center. Slingshot the puck.",
  cat:"sports",key:"gravhockey",win:5,
  controls:"P1: WASD mallet　 P2: ARROWS — gravity pulls the puck toward center. Use it to curve shots.",
  round(g){
    g.pl=[
      {x:150,y:250,vx:0,vy:0,r:22,color:C1,side:0},
      {x:750,y:250,vx:0,vy:0,r:22,color:C2,side:1}
    ];
    g.puck={x:450,y:250,vx:0,vy:0,r:12};
    g.hole={x:450,y:250,mass:60000};
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.vx=((I.r?1:0)-(I.l?1:0))*420;
      p.vy=((I.d?1:0)-(I.u?1:0))*420;
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(i===0)p.x=cl(p.x,60,440);
      else p.x=cl(p.x,460,840);
      p.y=cl(p.y,70,430);
    });
    const dx=g.hole.x-g.puck.x,dy=g.hole.y-g.puck.y;
    const d=Math.max(Math.hypot(dx,dy),40);
    const gForce=g.hole.mass/(d*d);
    g.puck.vx+=dx/d*gForce*dt;
    g.puck.vy+=dy/d*gForce*dt;
    g.puck.x+=g.puck.vx*dt;g.puck.y+=g.puck.vy*dt;
    g.puck.vx*=Math.pow(.995,60*dt);g.puck.vy*=Math.pow(.995,60*dt);
    if(g.puck.y<g.puck.r+60||g.puck.y>H-g.puck.r){g.puck.vy*=-.85;g.puck.y=cl(g.puck.y,g.puck.r+60,H-g.puck.r);}
    g.pl.forEach(p=>{
      const d=Math.hypot(g.puck.x-p.x,g.puck.y-p.y);
      if(d<p.r+g.puck.r&&d>0){
        const nx=(g.puck.x-p.x)/d,ny=(g.puck.y-p.y)/d;
        g.puck.x=p.x+nx*(p.r+g.puck.r);
        g.puck.y=p.y+ny*(p.r+g.puck.r);
        const vn=g.puck.vx*nx+g.puck.vy*ny;
        if(vn<0){g.puck.vx-=1.8*vn*nx;g.puck.vy-=1.8*vn*ny;}
        g.puck.vx+=p.vx*.3;g.puck.vy+=p.vy*.3;
        FX.playBounce();
      }
    });
    if(g.puck.x<g.puck.r&&g.puck.y>200&&g.puck.y<300){g.point(1,"GOAL P2!");}
    if(g.puck.x>W-g.puck.r&&g.puck.y>200&&g.puck.y<300){g.point(0,"GOAL P1!");}
    if(g.puck.x<g.puck.r&&!(g.puck.y>200&&g.puck.y<300)){
      g.puck.x=g.puck.r;g.puck.vx=Math.abs(g.puck.vx)*.85;
    }
    if(g.puck.x>W-g.puck.r&&!(g.puck.y>200&&g.puck.y<300)){
      g.puck.x=W-g.puck.r;g.puck.vx=-Math.abs(g.puck.vx)*.85;
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1020";ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="rgba(255,255,255,.2)";ctx.lineWidth=2;
    ctx.strokeRect(60,60,W-120,H-120);
    ctx.beginPath();ctx.moveTo(W/2,60);ctx.lineTo(W/2,H-60);ctx.stroke();
    ctx.beginPath();ctx.arc(W/2,H/2,60,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle="rgba(255,255,255,.15)";ctx.fillRect(0,200,60,100);ctx.fillRect(W-60,200,60,100);
    const gr=ctx.createRadialGradient(W/2,H/2,10,W/2,H/2,150);
    gr.addColorStop(0,"rgba(196,106,255,.8)");
    gr.addColorStop(1,"rgba(196,106,255,0)");
    ctx.fillStyle=gr;ctx.beginPath();ctx.arc(W/2,H/2,150,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#080b18";ctx.beginPath();ctx.arc(W/2,H/2,16,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(g.puck.x,g.puck.y,g.puck.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.stroke();
    g.pl.forEach(p=>{
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(p.x,p.y,p.r*.4,0,Math.PI*2);ctx.fill();
    });
  }
});

/* 2. LAWN DARTS */
micro({
  id:"lawndartsGame",title:"Lawn Darts",desc:"Throw darts at the target rings.",
  cat:"sports",key:"lawndarts",win:1,hud:false,
  controls:"P1: A/D aim, hold W power, release to throw　 P2: ←/→, ↑ — 3 throws each",
  init(g){
    g.st=[0,1].map(()=>({aim:0,power:0,charging:false,throws:[],score:0,turn:3}));
    g.cur=0;
  },
  update(g,dt){
    const p=g.st[g.cur],I=g.I[g.cur];
    if(p.turn<=0){g.cur=1-g.cur;if(g.st[g.cur].turn<=0){g.byScore(g.st.map(x=>x.score));}return;}
    if(!p.charging){
      if(I.l)p.aim-=.7*dt;
      if(I.r)p.aim+=.7*dt;
      p.aim=cl(p.aim,-.6,.6);
      if(I.u){p.charging=true;p.power=0;}
    }else{
      p.power=Math.min(1,p.power+dt*1.5);
      if(!I.u){
        const tx=W/2+Math.sin(p.aim)*p.power*220;
        const ty=250+p.power*60;
        const d=Math.hypot(tx-W/2,ty-250);
        let pts=0;
        if(d<25)pts=100;else if(d<55)pts=50;else if(d<90)pts=25;else pts=10;
        p.throws.push({x:tx,y:ty,pts});
        p.score+=pts;p.turn--;
        FX.tone(400+pts*3,.15,"triangle",.04,pts*3);
        p.charging=false;p.power=0;
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#2a5a3a";ctx.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=50){ctx.fillStyle="#2f6a40";ctx.fillRect(x,0,25,H);}
    [[90,"#8a6a3a"],[60,"#a87a3a"],[30,GOLD],[15,"#ff4a4a"]].forEach(([r,c])=>{
      ctx.fillStyle=c;ctx.beginPath();ctx.arc(W/2,250,r,0,Math.PI*2);ctx.fill();
    });
    g.st.forEach((s,i)=>s.throws.forEach(t=>{
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.moveTo(t.x,t.y);
      ctx.lineTo(t.x-8,t.y-12);ctx.lineTo(t.x+8,t.y-12);
      ctx.closePath();ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
    }));
    const p=g.st[g.cur];
    if(p.charging){
      const tx=W/2+Math.sin(p.aim)*p.power*220;
      const ty=250+p.power*60;
      ctx.strokeStyle=col(g.cur);ctx.lineWidth=3;ctx.setLineDash([8,6]);
      ctx.beginPath();ctx.moveTo(W/2,H-40);ctx.lineTo(tx,ty);ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle="#080b18";ctx.fillRect(W/2-100,H-20,200,8);
      ctx.fillStyle=col(g.cur);ctx.fillRect(W/2-100,H-20,200*p.power,8);
    }
    g.st.forEach((s,i)=>{
      g.text("P"+(i+1)+" "+s.score+" ("+s.turn+")",i?W-30:30,50,18,col(i),i?"right":"left");
    });
    g.text("P"+(g.cur+1)+"'S TURN",W/2,30,16,col(g.cur),"center");
  }
});

/* 3. CROKINOLE */
micro({
  id:"crokinoleGame",title:"Crokinole",desc:"Flick discs into the center. Knock rivals out.",
  cat:"sports",key:"crokinole",win:1,hud:false,
  controls:"P1: A/D aim, SPACE launch　 P2: ←/→, ENTER — closest disc to center scores each round",
  init(g){
    g.discs=[[],[]];
    g.turn=0;g.shotsLeft=[4,4];
    g.aim=0;g.charge=0;g.charging=false;
    for(let i=0;i<4;i++){
      g.discs[0].push({x:140,y:200+i*40,vx:0,vy:0,r:15,o:0});
      g.discs[1].push({x:760,y:200+i*40,vx:0,vy:0,r:15,o:1});
    }
    g.round=1;
  },
  update(g,dt){
    const all=g.discs[0].concat(g.discs[1]);
    all.forEach(d=>{
      if(Math.abs(d.vx)<3&&Math.abs(d.vy)<3){d.vx=0;d.vy=0;return;}
      d.x+=d.vx*dt;d.y+=d.vy*dt;
      d.vx*=Math.pow(.94,60*dt);d.vy*=Math.pow(.94,60*dt);
      if(Math.hypot(d.x-W/2,d.y-250)>240)d.dead=true;
    });
    for(let a=0;a<all.length;a++)for(let b=a+1;b<all.length;b++){
      const p=all[a],q=all[b];
      if(p.dead||q.dead)continue;
      const dx=q.x-p.x,dy=q.y-p.y,dist=Math.hypot(dx,dy);
      if(dist<p.r+q.r&&dist>0){
        const nx=dx/dist,ny=dy/dist,over=(p.r+q.r-dist)/2;
        p.x-=nx*over;p.y-=ny*over;q.x+=nx*over;q.y+=ny*over;
        const vn=(q.vx-p.vx)*nx+(q.vy-p.vy)*ny;
        if(vn<0){const imp=-1.4*vn/2;p.vx-=imp*nx;p.vy-=imp*ny;q.vx+=imp*nx;q.vy+=imp*ny;}
      }
    }
    g.discs=[g.discs[0].filter(d=>!d.dead),g.discs[1].filter(d=>!d.dead)];
    const p=g.discs[g.turn];
    if(g.shotsLeft[g.turn]>0&&p.length){
      const I=g.I[g.turn];
      if(!g.charging){
        if(I.l)g.aim-=1.5*dt;
        if(I.r)g.aim+=1.5*dt;
        if(I.a){g.charging=true;g.charge=0;}
      }else{
        g.charge=Math.min(1,g.charge+dt*1.5);
        if(!I.a){
          const d=p[p.length-1];
          const v=200+g.charge*400;
          d.vx=Math.cos(g.aim)*v;
          d.vy=Math.sin(g.aim)*v;
          g.shotsLeft[g.turn]--;
          g.charging=false;g.charge=0;
          FX.tone(400,.1,"triangle",.03,300);
          g.turn=1-g.turn;
        }
      }
    }
    if(g.shotsLeft[0]<=0&&g.shotsLeft[1]<=0){
      const all2=g.discs[0].concat(g.discs[1]);
      if(all2.every(d=>d.vx===0&&d.vy===0)){
        let near0=Infinity,near1=Infinity;
        g.discs[0].forEach(d=>{const dist=Math.hypot(d.x-W/2,d.y-250);if(dist<near0)near0=dist;});
        g.discs[1].forEach(d=>{const dist=Math.hypot(d.x-W/2,d.y-250);if(dist<near1)near1=dist;});
        const sc=[0,0];
        if(near0<near1){sc[0]=20;}else if(near1<near0){sc[1]=20;}
        g.byScore(sc);
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#1a2a1a";ctx.fillRect(0,0,W,H);
    [[240,"#8a5a2a"],[220,"#a87a3a"],[180,"#8a5a2a"],[140,"#a87a3a"],[100,"#8a5a2a"],[60,"#a87a3a"],[30,GOLD]].forEach(([r,c])=>{
      ctx.fillStyle=c;ctx.beginPath();ctx.arc(W/2,250,r,0,Math.PI*2);ctx.fill();
    });
    g.discs[0].forEach(d=>{
      ctx.fillStyle=C1;ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
    });
    g.discs[1].forEach(d=>{
      ctx.fillStyle=C2;ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
    });
    if(g.charging){
      const p=g.discs[g.turn];
      if(p.length){
        const d=p[p.length-1];
        ctx.strokeStyle=col(g.turn);ctx.lineWidth=3;ctx.setLineDash([8,6]);
        ctx.beginPath();ctx.moveTo(d.x,d.y);
        ctx.lineTo(d.x+Math.cos(g.aim)*(50+g.charge*200),d.y+Math.sin(g.aim)*(50+g.charge*200));
        ctx.stroke();ctx.setLineDash([]);
      }
    }
    g.text("P1 ("+g.shotsLeft[0]+")",20,30,18,C1);
    g.text("P2 ("+g.shotsLeft[1]+")",W-20,30,18,C2,"right");
    g.text("P"+(g.turn+1)+"'S SHOT",W/2,30,16,col(g.turn),"center");
  }
});

/* 4. ROPE PULL */
micro({
  id:"ropepullGame",title:"Rope Pull",desc:"Physics tug-of-war. Yank rival into the pit.",
  cat:"action",key:"ropepull",win:3,
  controls:"P1: alternate A and D　 P2: alternate ← and → — but you can also pull BACKWARD when rival is off-balance",
  round(g){
    g.pos=0;
    g.last=["",""];
    g.flash=[0,0];
    g.sway=0;
  },
  update(g,dt){
    g.sway=Math.sin(g.t*1.5)*6;
    for(let i=0;i<2;i++){
      g.flash[i]=Math.max(0,g.flash[i]-dt);
      const I=g.I[i],dir=i===0?-1:1;
      if(I.pl&&g.last[i]!=="l"){g.pos+=dir*32;g.last[i]="l";g.flash[i]=.1;}
      if(I.pr&&g.last[i]!=="r"){g.pos+=dir*32;g.last[i]="r";g.flash[i]=.1;}
    }
    g.pos*=Math.pow(.94,60*dt);
    g.pos+=g.sway*dt*.4;
    if(g.pos<=-120)g.point(0,"P1 WINS!");
    else if(g.pos>=120)g.point(1,"P2 WINS!");
  },
  draw(g,ctx){
    ctx.fillStyle="#1a2a3a";ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#5a2a1a";ctx.fillRect(0,H-100,W,100);
    ctx.fillStyle="#ff6a2a";ctx.fillRect(0,H-20,W,20);
    for(let x=0;x<W;x+=30)ctx.fillRect(x,H-20+Math.sin(x+g.t*4)*2,18,4);
    ctx.strokeStyle="#fff";ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(W/2,60);ctx.lineTo(W/2,H-100);ctx.stroke();
    const cx=W/2+g.pos*2;
    ctx.strokeStyle="#c8a46a";ctx.lineWidth=6;
    ctx.beginPath();ctx.moveTo(100,H-140);ctx.quadraticCurveTo(cx,H-160+Math.sin(g.t*6)*10,cx+80,H-140);ctx.stroke();
    [0,1].forEach(i=>{
      const px=i?W-100:100;
      const shift=g.pos*(i?-1:1)*.4;
      ctx.save();ctx.translate(px+shift,H-140);
      if(g.flash[i]>0){ctx.globalAlpha=.6+Math.random()*.4;}
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(0,-30,18,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(-5,-32,3,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
      ctx.restore();
    });
    ctx.fillStyle="#080b18";ctx.fillRect(W/2-200,60,400,20);
    const w=Math.abs(g.pos)*1.6;
    if(g.pos<0){ctx.fillStyle=C1;ctx.fillRect(W/2-200+w,60,200-w,20);}
    else if(g.pos>0){ctx.fillStyle=C2;ctx.fillRect(W/2,60,w,20);}
    ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.strokeRect(W/2-200,60,400,20);
    g.text(g.pos<-40?"P1 PULLING":g.pos>40?"P2 PULLING":"EVEN",W/2,110,16,GOLD,"center");
  }
});

/* 5. STACK EM */
micro({
  id:"stackemGame",title:"Stack Em",desc:"Blocks fall faster. Stack higher than rival.",
  cat:"reflex",key:"stackem",win:3,
  controls:"P1: A/D move, SPACE drop　 P2: ←/→, ENTER — block shrinks on bad alignment",
  round(g){
    g.pl=[
      {blocks:[{x:-70,w:140}],cur:{x:0,w:140,speed:200,dir:1},alive:true},
      {blocks:[{x:-70,w:140}],cur:{x:0,w:140,speed:200,dir:1},alive:true}
    ];
  },
  update(g,dt){
    const dead=[];
    g.pl.forEach((p,i)=>{
      if(!p.alive)return;
      const c=p.cur;
      c.x+=c.dir*c.speed*dt;
      if(c.x>200-c.w/2){c.dir=-1;c.x=200-c.w/2;}
      if(c.x<-200+c.w/2){c.dir=1;c.x=-200+c.w/2;}
      if(g.I[i].pa){
        const top=p.blocks[p.blocks.length-1];
        const l=Math.max(c.x-c.w/2,top.x);
        const r=Math.min(c.x+c.w/2,top.x+top.w);
        const w=r-l;
        if(w<=3){p.alive=false;dead.push(i);FX.playBoom();g.burst(i*450+225,H-100,C1,25,400);}
        else{
          const perfect=Math.abs((l+r)/2-(top.x+top.w/2))<4;
          p.blocks.push({x:perfect?top.x:l,w:perfect?top.w:w});
          FX.tone(perfect?900:400+p.blocks.length*20,.08,"square",.04);
          c.x=0;c.w=perfect?top.w:w;
          c.dir=Math.random()<.5?1:-1;
          c.speed=Math.min(340,200+p.blocks.length*10);
          g.burst(i*450+225+(l+w/2),H-100-p.blocks.length*20,col(i),6,150);
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
      if(!p.alive){
        g.text("TOPPLED",off+225,250,28,RED,"center");
        g.text("HEIGHT: "+p.blocks.length,off+225,290,18,"#9fc0ff","center");
        continue;
      }
      p.blocks.forEach((b,k)=>{
        const y=H-60-k*20;
        if(y<60)return;
        ctx.fillStyle=`hsl(${(k*28+i*80)%360},70%,${k===0?35:58}%)`;
        ctx.fillRect(off+225+b.x,y,b.w,18);
        ctx.fillStyle="rgba(255,255,255,.3)";
        ctx.fillRect(off+225+b.x,y,b.w,3);
        ctx.strokeStyle="#080b18";ctx.lineWidth=1;
        ctx.strokeRect(off+225+b.x,y,b.w,18);
      });
      const c=p.cur,y=H-60-p.blocks.length*20;
      ctx.fillStyle=col(i);
      ctx.fillRect(off+225+c.x-c.w/2,y,c.w,18);
      ctx.strokeStyle="#fff";ctx.lineWidth=2;
      ctx.strokeRect(off+225+c.x-c.w/2,y,c.w,18);
      g.text("P"+(i+1)+" H:"+p.blocks.length,off+225,30,18,col(i),"center");
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* 6. COLOR SPREAD */
micro({
  id:"colorspreadGame",title:"Color Spread",desc:"Claim tiles by touch. Most tiles wins.",
  cat:"action",key:"colorspread",win:1,hud:false,
  controls:"P1: WASD move　 P2: ARROWS — 20 seconds. Every tile you touch claims it.",
  init(g){
    g.grid=[];
    for(let r=0;r<8;r++){const row=[];for(let c=0;c<14;c++)row.push(-1);g.grid.push(row);}
    g.pl=[
      {x:W/2-80,y:H/2,r:16,color:C1},
      {x:W/2+80,y:H/2,r:16,color:C2}
    ];
    g.tl=20;
  },
  update(g,dt){
    g.tl-=dt;
    const cellW=W/14,cellH=H/8;
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*260*dt,20,W-20);
      p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*260*dt,20,H-20);
      const cx=Math.floor(p.x/cellW),cy=Math.floor(p.y/cellH);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        const tx=cx+dx,ty=cy+dy;
        if(tx>=0&&tx<14&&ty>=0&&ty<8)g.grid[ty][tx]=i;
      }
    });
    if(g.tl<=0){
      let n=[0,0];
      g.grid.forEach(r=>r.forEach(v=>{if(v>=0)n[v]++;}));
      g.byScore(n);
    }
  },
  draw(g,ctx){
    const cellW=W/14,cellH=H/8;
    for(let r=0;r<8;r++)for(let c=0;c<14;c++){
      const v=g.grid[r][c];
      ctx.fillStyle=v<0?((r+c)%2?"#141c3c":"#18224a"):(v?`rgba(255,114,200,.6)`:`rgba(100,234,255,.6)`);
      ctx.fillRect(c*cellW,r*cellH,cellW,cellH);
    }
    g.pl.forEach(p=>{
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
    });
    g.text(Math.max(0,Math.ceil(g.tl))+"s",W/2,25,20,GOLD,"center");
  }
});

/* 7. SNOWBALL FRENZY */
micro({
  id:"snowfrenzyGame",title:"Snowball Frenzy",desc:"Fast snowball fight. First to 5 hits.",
  cat:"action",key:"snowfrenzy",win:5,
  controls:"P1: WASD move, SPACE throw　 P2: ARROWS, ENTER — cover blocks. Snowballs arc.",
  round(g){
    g.pl=[
      {x:100,y:400,hp:3,cd:0,fx:1,fy:0,color:C1},
      {x:W-100,y:400,hp:3,cd:0,fx:-1,fy:0,color:C2}
    ];
    g.balls=[];
    g.cover=[
      {x:300,y:300,w:60,h:140},
      {x:540,y:300,w:60,h:140},
      {x:400,y:150,w:100,h:60}
    ];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.cd=Math.max(0,p.cd-dt);
      let ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0);
      const l=Math.hypot(ax,ay);
      if(l>0){p.fx=ax;if(Math.abs(ay)>Math.abs(ax))p.fy=ay;else p.fy=0;}
      p.x=cl(p.x+ax*220*dt,20,W-20);
      p.y=cl(p.y+ay*220*dt,60,H-20);
      for(const c of g.cover){
        if(p.x>c.x-16&&p.x<c.x+c.w+16&&p.y>c.y-16&&p.y<c.y+c.h+16){
          const dx=p.x-(c.x+c.w/2),dy=p.y-(c.y+c.h/2);
          if(Math.abs(dx)>Math.abs(dy))p.x=dx>0?c.x+c.w+16:c.x-16;
          else p.y=dy>0?c.y+c.h+16:c.y-16;
        }
      }
      if(I.a&&p.cd<=0){
        p.cd=.5;
        const dir=Math.atan2(p.fy||0,p.fx||1);
        g.balls.push({x:p.x,y:p.y-10,vx:Math.cos(dir)*400,vy:-100,o:i});
        FX.tone(500+i*100,.06,"triangle",.03);
      }
    });
    g.balls.forEach(b=>{
      b.vy+=300*dt;
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      for(const c of g.cover){
        if(b.x>c.x&&b.x<c.x+c.w&&b.y>c.y&&b.y<c.y+c.h){b.dead=true;g.burst(b.x,b.y,"#fff",6,150);break;}
      }
      if(b.x<-20||b.x>W+20||b.y>H+20)b.dead=true;
      if(!b.dead){
        const t=g.pl[1-b.o];
        if(Math.hypot(b.x-t.x,b.y-t.y)<20){
          b.dead=true;t.hp--;
          g.burst(t.x,t.y,col(b.o),12,300);playHitSound();
          if(t.hp<=0){g.point(b.o,"HIT!");return;}
        }
      }
    });
    g.balls=g.balls.filter(b=>!b.dead);
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1a2a";ctx.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=60)for(let y=60;y<H;y+=60){
      if(((x+y)/60)%2===0){ctx.fillStyle="#142440";ctx.fillRect(x,y,60,60);}
    }
    ctx.fillStyle="#d4e8ff";ctx.fillRect(0,H-40,W,40);
    g.cover.forEach(c=>{
      ctx.fillStyle="#8fc8f5";ctx.fillRect(c.x,c.y,c.w,c.h);
      ctx.strokeStyle="#3f78b0";ctx.lineWidth=2;ctx.strokeRect(c.x,c.y,c.w,c.h);
    });
    g.balls.forEach(b=>{
      ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x,b.y,6,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#6aa8dc";ctx.lineWidth=2;ctx.stroke();
    });
    g.pl.forEach((p,i)=>{
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(p.x,p.y,16,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      g.text("♥"+(Math.max(0,p.hp)),i?W-20:20,30,16,col(i),i?"right":"left");
    });
  }
});

/* 8. BOMB TOSS */
micro({
  id:"bombtossGame",title:"Bomb Toss",desc:"Lob bombs over the wall. Land near rival.",
  cat:"action",key:"bombtoss",win:3,
  controls:"P1: A/D angle, hold W power, release to throw　 P2: ←/→, ↑ — bombs arc over the wall",
  round(g){
    g.pl=[
      {x:100,y:H-100,angle:-.8,power:0,charging:false,hp:3,cd:0},
      {x:W-100,y:H-100,angle:Math.PI+.8,power:0,charging:false,hp:3,cd:0}
    ];
    g.wall={x:W/2-20,y:200,w:40,h:200};
    g.bombs=[];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      if(!p.charging){
        if(I.l)p.angle-=.7*dt;
        if(I.r)p.angle+=.7*dt;
        if(I.u&&p.cd<=0){p.charging=true;p.power=0;}
      }else{
        p.power=Math.min(1,p.power+dt*1.2);
        if(!I.u){
          const speed=300+p.power*500;
          g.bombs.push({
            x:p.x,y:p.y,vx:Math.cos(p.angle)*speed,vy:Math.sin(p.angle)*speed,
            o:i,life:2.5,fuse:0
          });
          p.charging=false;p.power=0;
          p.cd=.6;
          FX.tone(400,.1,"triangle",.03,-200);
        }
      }
      p.cd=Math.max(0,p.cd-dt);
    });
    g.bombs.forEach(b=>{
      b.vy+=800*dt;
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      b.life-=dt;b.fuse+=dt;
      if(b.x>b.wall.x-b.wall.w/2&&b.x<b.wall.x+g.wall.w&&b.y>b.wall.y&&b.y<H){
        b.vx*=-.5;b.x=b.vx>0?b.wall.x-b.wall.w/2-5:b.wall.x+g.wall.w+5;
      }
      if(b.y>H-20){
        const t=g.pl[1-b.o];
        if(Math.hypot(b.x-t.x,b.y-t.y)<80){
          t.hp--;g.burst(b.x,b.y,RED,20,400);FX.playBoom();
          if(t.hp<=0){g.point(b.o,"HIT!");}
        }else{
          g.burst(b.x,H-20,GOLD,8,200);
        }
        b.dead=true;
      }
      if(b.life<=0)b.dead=true;
    });
    g.bombs=g.bombs.filter(b=>!b.dead);
  },
  draw(g,ctx){
    const gr=ctx.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,"#3a5a8a");gr.addColorStop(1,"#8a5a3a");
    ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#3a7a3a";ctx.fillRect(0,H-40,W,40);
    ctx.fillStyle="#6a4a3a";ctx.fillRect(g.wall.x-g.wall.w/2,g.wall.y,g.wall.w,g.wall.h);
    ctx.strokeStyle="#3a2a1a";ctx.lineWidth=2;
    ctx.strokeRect(g.wall.x-g.wall.w/2,g.wall.y,g.wall.w,g.wall.h);
    g.bombs.forEach(b=>{
      ctx.fillStyle="#1b1f3a";
      ctx.beginPath();ctx.arc(b.x,b.y,10,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=col(b.o);ctx.lineWidth=2;ctx.stroke();
      if(Math.random()<.6){ctx.fillStyle=GOLD;ctx.fillRect(b.x+3,b.y-14,3,4);}
    });
    g.pl.forEach((p,i)=>{
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(p.x,p.y-15,15,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      if(p.charging){
        const v=300+p.power*500;
        ctx.strokeStyle=col(i);ctx.lineWidth=2;ctx.setLineDash([8,6]);
        ctx.beginPath();ctx.moveTo(p.x,p.y-15);
        ctx.lineTo(p.x+Math.cos(p.angle)*v*.3,p.y-15+Math.sin(p.angle)*v*.3);
        ctx.stroke();ctx.setLineDash([]);
      }
      g.text("♥"+p.hp,i?W-20:20,30,16,col(i),i?"right":"left");
    });
  }
});

})();