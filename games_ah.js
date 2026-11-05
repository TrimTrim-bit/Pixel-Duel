/* =====================================================
   GAME PACK AH — 6 games (final pack to hit 300)
   Also works standalone; no dependencies on prior packs.
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* 1. BUBBLE SHOOTER */
micro({
  id:"bubbleShooterRealGame",title:"Bubble Shooter",desc:"Pop bubbles of 3+ before they hit bottom.",
  cat:"arcade",key:"bubbleshooter",win:3,
  controls:"P1: A/D aim, SPACE fire　 P2: ←/→, ENTER — match 3+ colors to pop. Bubbles reaching bottom = you lose",
  round(g){
    g.grid=[];
    g.cols=12;g.rows=8;g.r=18;
    const colors=["#ff4a6a","#4aa8ff","#9be04a","#ffd24a","#c04aff"];
    for(let r=0;r<g.rows;r++){
      const row=[];
      for(let c=0;c<g.cols;c++){
        row.push(r<4?{color:colors[ri(0,colors.length-1)]}:null);
      }
      g.grid.push(row);
    }
    g.balls=[[],[]];
    g.aim=[0,Math.PI];
    g.next=[{color:colors[ri(0,colors.length-1)]},{color:colors[ri(0,colors.length-1)]}];
    g.lost=[false,false];
    g.deadZ=H-40;
    g.flash=[[],[]];
  },
  update(g,dt){
    for(let p=0;p<2;p++){
      if(g.lost[p])continue;
      const I=g.I[p];
      const off=p*450;
      if(I.l)g.aim[p]-=2*dt;
      if(I.r)g.aim[p]+=2*dt;
      g.aim[p]=cl(g.aim[p],p?Math.PI-1.2:0.2,p?Math.PI+.5:1.2);
      if(I.pa){
        const speed=400;
        g.balls[p].push({x:off+225,y:H-30,vx:Math.cos(g.aim[p])*speed,vy:Math.sin(g.aim[p])*speed,color:g.next[p].color,life:3});
        g.next[p]={color:["#ff4a6a","#4aa8ff","#9be04a","#ffd24a","#c04aff"][ri(0,4)]};
      }
      g.balls[p].forEach(b=>{
        b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
        if(b.x<off+20||b.x>off+430){b.vx*=-1;b.x=cl(b.x,off+20,off+430);}
        if(b.y<40)b.dead=true;
        const cx=Math.floor((b.x-off)/45),cy=Math.floor(b.y/45);
        if(cx>=0&&cx<g.cols&&cy>=0&&cy<g.rows&&g.grid[cy][cx]&&g.grid[cy][cx].color===b.color){
          g.grid[cy][cx]=null;b.dead=true;
          g.burst(b.x,b.y,b.color,8,200);
          FX.tone(700,.05,"square",.03);
        }
        if(b.y>g.deadZ){b.dead=true;g.lost[p]=true;}
        if(b.life<=0)b.dead=true;
      });
      g.balls[p]=g.balls[p].filter(b=>!b.dead);
      if(g.grid.every(row=>row.every(c=>c===null))){
        g.point(p,"CLEARED!");
        return;
      }
    }
    if(g.lost[0]&&g.lost[1])g.next("BOTH LOST");
    else if(g.lost[0])g.point(1,"BUBBLES DOWN");
    else if(g.lost[1])g.point(0,"BUBBLES DOWN");
  },
  draw(g,ctx){
    for(let p=0;p<2;p++){
      const off=p*450;
      ctx.fillStyle=p?"#1a0d2a":"#0b1030";ctx.fillRect(off,0,450,H);
      for(let r=0;r<g.rows;r++)for(let c=0;c<g.cols;c++){
        const cell=g.grid[r][c];
        if(!cell)continue;
        const x=off+c*45+22.5,y=r*45+50;
        ctx.fillStyle=cell.color;
        ctx.beginPath();ctx.arc(x,y,20,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
        ctx.fillStyle="rgba(255,255,255,.4)";
        ctx.beginPath();ctx.arc(x-6,y-6,5,0,Math.PI*2);ctx.fill();
      }
      g.balls[p].forEach(b=>{
        ctx.fillStyle=b.color;
        ctx.beginPath();ctx.arc(b.x,b.y,14,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();
      });
      if(!g.lost[p]){
        const nx=off+225,ny=H-30;
        ctx.fillStyle=g.next[p].color;
        ctx.beginPath();ctx.arc(nx,ny,14,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();
        ctx.strokeStyle=col(p);ctx.lineWidth=2;ctx.setLineDash([8,6]);
        ctx.beginPath();ctx.moveTo(nx,ny);
        ctx.lineTo(nx+Math.cos(g.aim[p])*300,ny+Math.sin(g.aim[p])*300);
        ctx.stroke();ctx.setLineDash([]);
      }
      ctx.fillStyle="#ff5878";ctx.fillRect(off,g.deadZ,450,4);
      g.text("P"+(p+1),off+20,30,18,col(p));
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* 2. HEX CLICKER */
micro({
  id:"hexclickerGame",title:"Hex Clicker",desc:"Click hexagons to claim them. Most wins.",
  cat:"board",key:"hexclicker",win:1,hud:false,
  controls:"Click a hex to claim it for your color. Adjacent rival hexes flip to yours. Most owned at 0 tiles wins.",
  init(g){
    g.cols=7;g.rows=6;g.hexes=[];
    for(let r=0;r<g.rows;r++)for(let c=0;c<g.cols;c++){
      g.hexes.push({r,c,owner:-1});
    }
    g.turn=0;
    g.turnCount=0;
    g.maxTurns=20;
  },
  click(g,x,y){
    const size=42;
    for(let r=0;r<g.rows;r++)for(let c=0;c<g.cols;c++){
      const cx=140+c*75+(r%2)*37;
      const cy=80+r*72;
      const d=Math.hypot(x-cx,y-cy);
      if(d<size){
        const h=g.hexes[r*g.cols+c];
        if(h.owner===g.turn)return;
        h.owner=g.turn;
        // Flip adjacent rival hexes
        for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
          if(dr===0&&dc===0)continue;
          const nr=r+dr,nc=c+dc;
          if(nr<0||nc<0||nr>=g.rows||nc>=g.cols)continue;
          const nh=g.hexes[nr*g.cols+nc];
          if(nh.owner===1-g.turn)nh.owner=g.turn;
        }
        FX.tone(400+g.turn*100,.05,"square",.03);
        g.burst(cx,cy,col(g.turn),8,200);
        g.turnCount++;
        g.turn=1-g.turn;
        if(g.turnCount>=g.maxTurns){
          const p1=g.hexes.filter(h=>h.owner===0).length;
          const p2=g.hexes.filter(h=>h.owner===1).length;
          if(p1>p2)g.point(0,"MOST HEXES");
          else if(p2>p1)g.point(1,"MOST HEXES");
          else g.next("TIE");
        }
        return;
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
    for(let r=0;r<g.rows;r++)for(let c=0;c<g.cols;c++){
      const h=g.hexes[r*g.cols+c];
      const cx=140+c*75+(r%2)*37;
      const cy=80+r*72;
      ctx.beginPath();
      for(let k=0;k<6;k++){
        const a=Math.PI/6+k*Math.PI/3;
        const x=cx+Math.cos(a)*40,y=cy+Math.sin(a)*40;
        if(k===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.fillStyle=h.owner<0?"#2a2f63":col(h.owner);
      ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
    }
    const p1=g.hexes.filter(h=>h.owner===0).length;
    const p2=g.hexes.filter(h=>h.owner===1).length;
    g.text("P1: "+p1,20,30,20,C1);
    g.text("P2: "+p2,W-20,30,20,C2,"right");
    g.text("TURN "+(g.turnCount+1)+"/"+g.maxTurns,W/2,30,16,col(g.turn),"center");
  }
});

/* 3. MEMORY LANE (Simon-style for 2P) */
micro({
  id:"memorylaneGame",title:"Memory Lane",desc:"Recall the sequence. First correct wins.",
  cat:"brain",key:"memorylane",win:3,
  controls:"Watch the sequence of colors. Then repeat. P1: A/W/D/S　 P2: ←/↑/→/↓",
  round(g){
    const n=4+Math.min(4,g.score[0]+g.score[1]);
    g.seq=[];
    for(let i=0;i<n;i++)g.seq.push(ri(0,3));
    g.showing=true;
    g.showT=.6;
    g.showIdx=0;
    g.idx=[0,0];
    g.wrong=[false,false];
  },
  update(g,dt){
    if(g.showing){
      g.showT-=dt;
      if(g.showT<=0){
        g.showIdx++;
        if(g.showIdx>=g.seq.length){g.showing=false;return;}
        g.showT=.55;
        FX.tone([392,523,659,784][g.seq[g.showIdx]],.15,"square",.04);
      }
      return;
    }
    for(let i=0;i<2;i++){
      if(g.wrong[i])continue;
      const I=g.I[i];
      const k=I.pl?0:I.pu?1:I.pr?2:I.pd?3:-1;
      if(k<0)continue;
      if(k===g.seq[g.idx[i]]){
        FX.tone([392,523,659,784][k],.08,"square",.03);
        g.idx[i]++;
        if(g.idx[i]>=g.seq.length){g.point(i);return;}
      }else{
        g.wrong[i]=true;
        FX.tone(120,.3,"sawtooth",.05,-40);
        if(g.wrong[0]&&g.wrong[1])g.next("BOTH WRONG");
        else if(g.wrong[0])g.point(1,"P1 WRONG");
        else g.point(0,"P2 WRONG");
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
    const POS=[{x:300,y:130},{x:600,y:130},{x:300,y:330},{x:600,y:330}];
    const C=["#ff6a6a","#6aff8a","#ffd24a","#6ab0ff"];
    POS.forEach((p,k)=>{
      const active=g.showing&&g.showIdx<g.seq.length&&g.seq[g.showIdx]===k;
      ctx.fillStyle=active?C[k]:"#2a2f63";
      ctx.fillRect(p.x-70,p.y-70,140,140);
      ctx.strokeStyle=C[k];ctx.lineWidth=3;
      ctx.strokeRect(p.x-70,p.y-70,140,140);
    });
    g.text("SEQ: "+g.seq.length,W/2,450,18,GOLD,"center");
    g.text(g.showing?"WATCH":"REPEAT!",W/2,30,22,g.showing?"#9fc0ff":GOLD,"center");
    [0,1].forEach(i=>g.text("P"+(i+1)+" "+g.idx[i]+"/"+g.seq.length,i?W-40:40,60,14,col(i),i?"right":"left"));
  }
});

/* 4. PADDLES DUEL */
micro({
  id:"paddlesGame",title:"Paddles Duel",desc:"Two paddles, two balls per side. Highest score wins.",
  cat:"sports",key:"paddles",win:7,
  controls:"P1: W/S　 P2: ↑/↓ — 2 balls per side",
  round(g){
    g.pd=[
      {x:24,y:200,h:100},
      {x:W-38,y:200,h:100}
    ];
    g.balls=[];
    for(let i=0;i<2;i++){
      const dir=Math.random()<.5?-1:1;
      g.balls.push({x:450,y:100+i*300,vx:dir*260,vy:rnd(-160,160),r:10});
    }
  },
  update(g,dt){
    g.pd.forEach((p,i)=>{
      const I=g.I[i];
      p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*420*dt,30,H-30-p.h);
    });
    g.balls.forEach(b=>{
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.y<b.r+10||b.y>H-b.r){b.vy*=-1;b.y=cl(b.y,b.r+10,H-b.r);}
      g.pd.forEach((p,k)=>{
        if(b.x+b.r>p.x&&b.x-b.r<p.x+14&&b.y>p.y&&b.y<p.y+p.h){
          if(k===0&&b.vx<0){b.vx=-b.vx;b.x=p.x+14+b.r;FX.playBounce();}
          if(k===1&&b.vx>0){b.vx=-b.vx;b.x=p.x-b.r;FX.playBounce();}
        }
      });
    });
    const keep=[];
    g.balls.forEach(b=>{
      if(b.x<-20)g.add(1);
      else if(b.x>W+20)g.add(0);
      else keep.push(b);
    });
    g.balls=keep;
    while(g.balls.length<2){
      const dir=Math.random()<.5?-1:1;
      g.balls.push({x:450,y:rnd(100,400),vx:dir*260,vy:rnd(-160,160),r:10});
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#0f1530";ctx.fillRect(0,0,W,H);
    g.pd.forEach((p,i)=>{ctx.fillStyle=col(i);ctx.fillRect(p.x,p.y,14,p.h);});
    g.balls.forEach(b=>{
      ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.stroke();
    });
    ctx.fillStyle="#080b18";ctx.fillRect(447,0,6,H);
  }
});

/* 5. FROG HOP RACE */
micro({
  id:"froghopGame",title:"Frog Hop Race",desc:"Hop your frog to the finish line.",
  cat:"reflex",key:"froghop",win:3,
  controls:"P1: hold W to charge, release to hop　 P2: hold ↑, release — jump distance depends on hold time",
  round(g){
    g.pl=[{x:100,charge:0,charging:false,hp:3},{x:100,charge:0,charging:false,hp:3}];
    g.goal=W-100;
    g.hopping=[false,false];
    g.hopY=[0,0];
  },
  update(g,dt){
    let winner=-1;
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      const off=i*450;
      const cx=off+50+p.x;
      if(!p.charging&&!g.hopping[i]){
        if(I.u){p.charging=true;p.charge=0;}
        else if(I.pu&&!p.charging&&p.charge===0){}
      }
      if(p.charging){
        p.charge=Math.min(1,p.charge+dt*1.5);
        if(!I.u){
          const dist=30+p.charge*180;
          p.x+=dist;
          p.charge=0;p.charging=false;
          g.hopping[i]=true;
          g.hopY[i]=0;
          FX.tone(400+dist*2,.1,"triangle",.03,300);
        }
      }
      if(g.hopping[i]){
        g.hopY[i]+=dt*600;
        if(g.hopY[i]>=40){g.hopping[i]=false;g.hopY[i]=0;}
      }
      if(p.x>=g.goal-50&&winner<0)winner=i;
    });
    if(winner>=0)g.point(winner,"FINISHED!");
  },
  draw(g,ctx){
    for(let i=0;i<2;i++){
      const off=i*450;
      ctx.fillStyle=i?"#1a1030":"#0f1530";ctx.fillRect(off,0,450,H);
      ctx.fillStyle="#2a5a3a";ctx.fillRect(off,50,450,H-100);
      ctx.fillStyle="#3a7a3a";ctx.fillRect(off,50,450,4);
      ctx.fillStyle=GREEN;ctx.fillRect(off+400,50,4,H-100);
      for(let x=0;x<450;x+=80){
        ctx.fillStyle="rgba(255,255,255,.1)";
        ctx.fillRect(off+x,50,2,H-100);
      }
      const p=g.pl[i];
      const px=off+50+p.x;
      const py=250-g.hopY[i];
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.ellipse(px,py,22,18,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";
      ctx.fillRect(px-8,py-8,5,5);ctx.fillRect(px+3,py-8,5,5);
      ctx.fillStyle="#11152b";
      ctx.fillRect(px-6,py-6,3,3);ctx.fillRect(px+5,py-6,3,3);
      if(p.charging){
        ctx.fillStyle="#080b18";ctx.fillRect(off+100,H-40,250,10);
        ctx.fillStyle=col(i);ctx.fillRect(off+102,H-38,246*p.charge,6);
      }
      g.text("P"+(i+1),off+225,30,18,col(i),"center");
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* 6. ARROWS CLASH */
micro({
  id:"arrowsclashGame",title:"Arrows Clash",desc:"Fire arrows. Rival dodges. Score hits.",
  cat:"action",key:"arrowsclash",win:5,
  controls:"P1: A/D aim, SPACE fire　 P2: WASD move to dodge — arrows home toward rival",
  round(g){
    g.pl=[
      {x:100,y:250,aim:0,cd:0},
      {x:800,y:250,cd:0}
    ];
    g.arrows=[];
  },
  update(g,dt){
    const p1=g.pl[0],p2=g.pl[1];
    const I0=g.I[0],I1=g.I[1];
    p1.cd=Math.max(0,p1.cd-dt);
    p2.cd=Math.max(0,p2.cd-dt);
    if(I0.l)p1.aim-=.8*dt;
    if(I0.r)p1.aim+=.8*dt;
    p1.aim=cl(p1.aim,-.8,.8);
    if(I0.a&&p1.cd<=0){
      p1.cd=.7;
      g.arrows.push({x:p1.x+20,y:p1.y,vx:Math.cos(p1.aim)*400,vy:Math.sin(p1.aim)*400,o:0,life:2});
      FX.tone(600,.05,"square",.03);
    }
    // P2 dodges
    p2.x=cl(p2.x+((I1.r?1:0)-(I1.l?1:0))*300*dt,500,W-30);
    p2.y=cl(p2.y+((I1.d?1:0)-(I1.u?1:0))*300*dt,60,H-30);
    g.arrows.forEach(a=>{
      a.x+=a.vx*dt;a.y+=a.vy*dt;a.life-=dt;
      if(a.x<0||a.x>W||a.y<0||a.y>H||a.life<=0)a.dead=true;
      if(!a.dead&&Math.hypot(a.x-p2.x,a.y-p2.y)<24){
        a.dead=true;
        g.burst(p2.x,p2.y,GOLD,12,250);
        g.point(0,"HIT!");
      }
    });
    g.arrows=g.arrows.filter(a=>!a.dead);
  },
  draw(g,ctx){
    ctx.fillStyle="#1a1230";ctx.fillRect(0,0,W,H);
    g.arrows.forEach(a=>{
      const ang=Math.atan2(a.vy,a.vx);
      ctx.save();ctx.translate(a.x,a.y);ctx.rotate(ang);
      ctx.strokeStyle=col(a.o);ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(-15,0);ctx.lineTo(15,0);ctx.stroke();
      ctx.fillStyle=GOLD;ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(8,-6);ctx.lineTo(8,6);ctx.fill();
      ctx.restore();
    });
    const p1=g.pl[0],p2=g.pl[1];
    ctx.fillStyle=C1;
    ctx.beginPath();ctx.arc(p1.x,p1.y,18,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
    ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.setLineDash([6,6]);
    ctx.beginPath();ctx.moveTo(p1.x,p1.y);
    ctx.lineTo(p1.x+Math.cos(p1.aim)*200,p1.y+Math.sin(p1.aim)*200);
    ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=C2;
    ctx.beginPath();ctx.arc(p2.x,p2.y,20,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
    g.text("P1 SHOOTER",20,30,16,C1);
    g.text("P2 DODGER",W-20,30,16,C2,"right");
  }
});

})();