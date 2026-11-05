/* =====================================================
   GAME PACK AE — 15 games
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* CHESS LITE */
micro({
  id:"chessliteGame",title:"Chess Lite",desc:"5x5 simplified chess. Capture the king.",
  cat:"board",key:"chesslite",win:1,hud:false,
  controls:"Click a piece then a destination. KING moves 1 step any direction. PAWN moves forward 1 (diagonal to capture).",
  init(g){
    g.b=new Array(25).fill(null);
    g.b[4*5+2]={t:"K",p:0};
    for(let c=0;c<5;c++)g.b[3*5+c]={t:"P",p:0};
    g.b[0*5+2]={t:"K",p:1};
    for(let c=0;c<5;c++)g.b[1*5+c]={t:"P",p:1};
    g.turn=0;g.sel=null;
  },
  update(){},
  click(g,x,y){
    const ox=250,oy=50,sz=80;
    if(x<ox||x>ox+sz*5||y<oy||y>oy+sz*5)return;
    const c=Math.floor((x-ox)/sz),r=Math.floor((y-oy)/sz);
    const idx=r*5+c,p=g.b[idx];
    if(g.sel!==null){
      const sp=g.b[g.sel];
      const sr=Math.floor(g.sel/5),sc=g.sel%5;
      const dr=r-sr,dc=c-sc,dir=sp.p===0?-1:1;
      let ok=false;
      if(sp.t==="K")ok=Math.abs(dr)<=1&&Math.abs(dc)<=1&&(dr||dc);
      else{
        ok=(dc===0&&dr===dir&&!p)||(Math.abs(dc)===1&&dr===dir&&p&&p.p!==sp.p);
      }
      if(ok){
        g.b[g.sel]=null;g.b[idx]=sp;
        if(p&&p.t==="K"){g.end(sp.p);return;}
        g.turn=1-g.turn;g.sel=null;
      }else if(p&&p.p===g.turn)g.sel=idx;
      else g.sel=null;
    }else if(p&&p.p===g.turn)g.sel=idx;
  },
  draw(g,ctx){
    ctx.fillStyle="#12183a";ctx.fillRect(0,0,W,H);
    const ox=250,oy=50,sz=80;
    for(let r=0;r<5;r++)for(let c=0;c<5;c++){
      const x=ox+c*sz,y=oy+r*sz;
      ctx.fillStyle=(r+c)%2?"#5a3a2a":"#e8c898";ctx.fillRect(x,y,sz,sz);
      if(g.sel===r*5+c){ctx.fillStyle="rgba(255,230,109,.4)";ctx.fillRect(x,y,sz,sz);}
      const p=g.b[r*5+c];
      if(p){
        ctx.fillStyle=col(p.p);
        ctx.beginPath();ctx.arc(x+sz/2,y+sz/2,28,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
        g.text(p.t,x+sz/2,y+sz/2+10,32,"#080b18","center");
      }
    }
    ctx.strokeStyle="#080b18";ctx.lineWidth=4;ctx.strokeRect(ox,oy,sz*5,sz*5);
    g.text("P1 KING",30,80,18,C1);g.text("P2 KING",W-30,80,18,C2,"right");
  }
});

/* BACKGAMMON MINI */
micro({
  id:"backgammonGame",title:"Backgammon Mini",desc:"Roll and race to the end.",
  cat:"board",key:"backgammon",win:1,hud:false,
  controls:"SPACE / ENTER to roll. Click a piece to advance it. First to move all pieces to 10+ wins.",
  init(g){g.pieces=[[0,0,0,0],[0,0,0,0]];g.turn=0;g.dice=0;g.rolling=0;},
  update(g,dt){
    if(g.rolling>0){
      g.rolling-=dt;
      if(g.rolling<=0){g.dice=ri(1,6);FX.tone(600,.08,"square",.04);}
      return;
    }
    if(!g.dice&&g.I[g.turn].pa){g.rolling=.4;FX.tone(400,.05,"square",.03);}
  },
  click(g,x,y){
    if(!g.dice||g.rolling)return;
    const off=g.turn?450:0,rowY=g.turn?130:410;
    for(let i=0;i<4;i++){
      if(Math.abs(x-(off+60+i*90))<40&&Math.abs(y-rowY)<30){
        g.pieces[g.turn][i]+=g.dice;g.dice=0;
        FX.tone(700,.08,"square",.04);
        if(g.pieces[g.turn].every(p=>p>=10)){g.end(g.turn);return;}
        g.turn=1-g.turn;return;
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#2a1a10";ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#7a4a2a";ctx.fillRect(40,100,820,300);
    ctx.strokeStyle="#3a1f10";ctx.lineWidth=6;ctx.strokeRect(40,100,820,300);
    for(let k=0;k<=10;k++){
      const x=60+k*80;
      g.text(String(k),x+30,280,14,"#fff","center");
    }
    [0,1].forEach(p=>{
      const off=p?450:0,rowY=p?130:410;
      g.pieces[p].forEach((pos,i)=>{
        const px=off+60+i*90;
        ctx.fillStyle=col(p);
        ctx.beginPath();ctx.arc(px,rowY,20,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
        g.text(String(Math.min(pos,10)),px,rowY+5,14,"#080b18","center");
      });
      g.text("P"+(p+1),off+225,70,18,col(p),"center");
    });
    g.text(g.dice?"ROLLED: "+g.dice:`P${g.turn+1}: SPACE TO ROLL`,W/2,450,22,g.dice?GOLD:col(g.turn),"center");
  }
});

/* TIC-TAC-TOE 3D */
function check3DW(b,p){
  for(let l=0;l<3;l++){
    for(let r=0;r<3;r++){
      if(b[l*9+r*3]===p&&b[l*9+r*3+1]===p&&b[l*9+r*3+2]===p)return true;
    }
    for(let c=0;c<3;c++){
      if(b[l*9+c]===p&&b[l*9+3+c]===p&&b[l*9+6+c]===p)return true;
    }
    if(b[l*9]===p&&b[l*9+4]===p&&b[l*9+8]===p)return true;
    if(b[l*9+2]===p&&b[l*9+4]===p&&b[l*9+6]===p)return true;
  }
  for(let r=0;r<3;r++)for(let c=0;c<3;c++){
    if(b[r*3+c]===p&&b[9+r*3+c]===p&&b[18+r*3+c]===p)return true;
  }
  return false;
}
micro({
  id:"ttt3dGame",title:"Tic-Tac-Toe 3D",desc:"3 layers of 3x3. Line of 3 wins.",
  cat:"board",key:"ttt3d",win:1,hud:false,
  controls:"Click cells on any layer. Winning lines exist within layers and across layers (columns).",
  init(g){g.b=new Array(27).fill(-1);g.turn=0;},
  update(){},
  click(g,x,y){
    const ox=120,oy=40,sz=60;
    for(let l=0;l<3;l++){
      const lx=ox+l*250;
      if(x<lx||x>lx+sz*3||y<oy||y>oy+sz*3)continue;
      const c=Math.floor((x-lx)/sz),r=Math.floor((y-oy)/sz);
      const idx=l*9+r*3+c;
      if(g.b[idx]>=0)return;
      g.b[idx]=g.turn;
      if(check3DW(g.b,g.turn)){g.end(g.turn);return;}
      if(!g.b.includes(-1)){g.end(-1);return;}
      g.turn=1-g.turn;return;
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
    const ox=120,oy=40,sz=60;
    for(let l=0;l<3;l++){
      const lx=ox+l*250;
      ctx.fillStyle="#1a2050";ctx.fillRect(lx-4,oy-4,sz*3+8,sz*3+8);
      for(let r=0;r<3;r++)for(let c=0;c<3;c++){
        const x=lx+c*sz,y=oy+r*sz,v=g.b[l*9+r*3+c];
        ctx.fillStyle="#2a2f63";ctx.fillRect(x+2,y+2,sz-4,sz-4);
        if(v>=0){
          ctx.strokeStyle=col(v);ctx.lineWidth=5;
          if(v===0){
            ctx.beginPath();ctx.moveTo(x+12,y+12);ctx.lineTo(x+sz-12,y+sz-12);
            ctx.moveTo(x+sz-12,y+12);ctx.lineTo(x+12,y+sz-12);ctx.stroke();
          }else{
            ctx.beginPath();ctx.arc(x+sz/2,y+sz/2,sz/3,0,Math.PI*2);ctx.stroke();
          }
        }
      }
      g.text("LAYER "+(l+1),lx+sz*1.5,oy+sz*3+20,14,"#9fc0ff","center");
    }
    g.text("P1",30,80,20,C1);g.text("P2",W-30,80,20,C2,"right");
  }
});

/* BUBBLE SORT */
micro({
  id:"bubblesortGame",title:"Bubble Sort",desc:"Click numbers in order. First sorted wins.",
  cat:"brain",key:"bubblesort",win:3,
  controls:"P1 clicks numbers 1-9 in order　 P2 uses number keys 1-9 — wrong click resets your progress",
  round(g){
    const base=[3,7,1,8,4,6,2,5,9];
    g.arr1=base.slice().sort(()=>Math.random()-.5);
    g.arr2=base.slice().sort(()=>Math.random()-.5);
    g.idx=[0,0];
    g.lock=[0,0];
  },
  update(g,dt){
    g.lock[0]=Math.max(0,g.lock[0]-dt);g.lock[1]=Math.max(0,g.lock[1]-dt);
    if(g.lock[1]<=0){
      for(let n=1;n<=9;n++){
        if(g.pk[String(n)]){
          const pos=g.arr2.indexOf(n);
          if(n===g.idx[1]+1){g.idx[1]++;FX.tone(500+n*50,.05,"square",.03);
            if(g.idx[1]>=9)g.point(1,"SORTED!");}
          else{g.idx[1]=0;FX.tone(120,.1,"sawtooth",.03);g.lock[1]=.3;}
        }
      }
    }
  },
  click(g,x,y){
    if(x>450)return;
    const sz=60,ox=40,oy=140;
    for(let k=0;k<9;k++){
      const px=ox+(k%3)*120,y2=oy+Math.floor(k/3)*120;
      if(x>px&&x<px+110&&y>y2&&y<y2+110){
        const val=g.arr1[k];
        if(val===g.idx[0]+1){g.idx[0]++;FX.tone(500+val*50,.05,"square",.03);
          if(g.idx[0]>=9)g.point(0,"SORTED!");}
        else{g.idx[0]=0;FX.tone(120,.1,"sawtooth",.03);}
        return;
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
    const ox=40,oy=140;
    for(let k=0;k<9;k++){
      const v=g.arr1[k];
      const px=ox+(k%3)*120,y2=oy+Math.floor(k/3)*120;
      ctx.fillStyle=v<=g.idx[0]?"#63f59a":"#2a2f63";
      ctx.fillRect(px,y2,110,110);
      ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.strokeRect(px,y2,110,110);
      g.text(String(v),px+55,y2+70,42,"#fff","center");
    }
    g.text("P2: PRESS "+(g.idx[1]+1)+"",W-225,140,20,C2,"center");
    g.text("SEQUENCE: "+g.idx[1]+"/9",W-225,180,16,"#9fc0ff","center");
    g.text("P1 CLICK 1→9",225,60,20,C1,"center");
    g.text("P2 PRESS 1→9",675,60,20,C2,"center");
  }
});

/* PATTERN FLASH */
micro({
  id:"patternflashGame",title:"Pattern Flash",desc:"Memorize the flashing pattern.",
  cat:"reflex",key:"patternflash",win:3,
  controls:"Watch the sequence, then repeat. P1: W/A/S/D　 P2: ARROWS",
  round(g){
    g.len=3+Math.min(4,g.score[0]+g.score[1]);
    g.seq=[];for(let i=0;i<g.len;i++)g.seq.push(ri(0,3));
    g.showing=true;g.showT=.5;g.showIdx=0;g.idx=[0,0];g.pressFlash=0;
  },
  update(g,dt){
    g.pressFlash=Math.max(0,g.pressFlash-dt);
    if(g.showing){
      g.showT-=dt;
      if(g.showT<=0){
        g.showIdx++;
        if(g.showIdx>=g.seq.length){g.showing=false;return;}
        g.showT=.5;
      }
      return;
    }
    for(let i=0;i<2;i++){
      const I=g.I[i],k=I.pu?0:I.pl?1:I.pd?2:I.pr?3:-1;
      if(k<0)continue;
      if(k===g.seq[g.idx[i]]){
        g.idx[i]++;g.pressFlash=.1;
        FX.tone(500+k*100,.05,"square",.03);
        if(g.idx[i]>=g.seq.length){g.point(i,"DONE");return;}
      }else{FX.tone(120,.15,"sawtooth",.03);g.idx[i]=0;}
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
    const P=[{x:250,y:130},{x:650,y:130},{x:250,y:330},{x:650,y:330}];
    const C=["#ff6a6a","#6aff8a","#ffd24a","#6ab0ff"];
    P.forEach((p,k)=>{
      const active=g.showing&&g.showIdx<g.seq.length&&g.seq[g.showIdx]===k;
      ctx.fillStyle=active?C[k]:"#2a2f63";
      ctx.fillRect(p.x-60,p.y-60,120,120);
      ctx.strokeStyle=C[k];ctx.lineWidth=3;ctx.strokeRect(p.x-60,p.y-60,120,120);
    });
    g.text("SEQ: "+g.len,W/2,440,18,GOLD,"center");
    g.text(g.showing?"WATCH":"REPEAT",W/2,40,22,g.showing?"#9fc0ff":GOLD,"center");
    [0,1].forEach(i=>g.text("P"+(i+1)+" "+g.idx[i]+"/"+g.len,i?W-40:40,60,14,col(i),i?"right":"left"));
  }
});

/* CAT AND MOUSE */
micro({
  id:"catmouseGame",title:"Cat and Mouse",desc:"Chase or flee. Catch within 20s.",
  cat:"action",key:"catmouse",win:3,
  controls:"P1: WASD　 P2: ARROWS — P1 is CAT (chase), P2 is MOUSE (flee)",
  round(g){
    g.pl=[{x:200,y:250,r:16,color:C1},{x:700,y:250,r:12,color:C2}];
    g.cat=0;g.tl=20;
  },
  update(g,dt){
    g.tl-=dt;
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      const sp=i===g.cat?220:290;
      const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0);
      const l=Math.hypot(ax,ay)||1;
      p.x+=ax/l*sp*dt;p.y+=ay/l*sp*dt;
      p.x=cl(p.x,20,W-20);p.y=cl(p.y,60,H-20);
    });
    const cat=g.pl[0],mouse=g.pl[1];
    if(Math.hypot(cat.x-mouse.x,cat.y-mouse.y)<cat.r+mouse.r)g.point(0,"CAUGHT!");
    if(g.tl<=0)g.point(1,"ESCAPED!");
  },
  draw(g,ctx){
    ctx.fillStyle="#1a2a1a";ctx.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=50)for(let y=60;y<H;y+=50){
      if(((x+y)/50)%2===0){ctx.fillStyle="#1a3020";ctx.fillRect(x,y,50,50);}
    }
    g.pl.forEach((p,i)=>{
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      if(i===0){
        ctx.beginPath();ctx.moveTo(p.x-8,p.y-p.r+2);ctx.lineTo(p.x-4,p.y-p.r-8);ctx.lineTo(p.x,p.y-p.r+2);ctx.fill();
        ctx.beginPath();ctx.moveTo(p.x+8,p.y-p.r+2);ctx.lineTo(p.x+4,p.y-p.r-8);ctx.lineTo(p.x,p.y-p.r+2);ctx.fill();
      }else{
        ctx.beginPath();ctx.arc(p.x,p.y-p.r,5,0,Math.PI*2);ctx.fill();
      }
    });
    g.text(Math.max(0,Math.ceil(g.tl))+"s",W/2,30,20,GOLD,"center");
  }
});

/* PING BALL MULTI */
micro({
  id:"pingballmultiGame",title:"Ping Ball Multi",desc:"Three balls at once. Score against rival.",
  cat:"arcade",key:"pingballmulti",win:7,
  controls:"P1: W/S　 P2: ↑/↓ — three balls bounce simultaneously",
  round(g){
    g.pd=[{x:24,y:200,h:100},{x:W-38,y:200,h:100}];
    g.balls=[];
    for(let i=0;i<3;i++){
      const dir=Math.random()<.5?-1:1;
      g.balls.push({x:450,y:100+i*130,vx:dir*220,vy:rnd(-120,120),r:8});
    }
  },
  update(g,dt){
    g.pd.forEach((p,i)=>{
      const I=g.I[i];
      p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*380*dt,30,H-30-p.h);
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
    while(g.balls.length<3){
      const dir=Math.random()<.5?-1:1;
      g.balls.push({x:450,y:rnd(100,400),vx:dir*220,vy:rnd(-120,120),r:8});
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

/* TARGET PRACTICE */
micro({
  id:"targetpracticeGame",title:"Target Practice",desc:"Hit moving targets. Bullseye scores more.",
  cat:"reflex",key:"targetpractice",win:1,hud:false,
  controls:"P1: WASD move crosshair, SPACE fire　 P2: ARROWS, ENTER — bullseye = 5, outer = 1",
  init(g){
    g.tl=30;g.s=[0,0];g.targets=[];g.spawn=0;
    g.cr=[{x:225,y:250,cd:0},{x:675,y:250,cd:0}];
  },
  update(g,dt){
    g.tl-=dt;g.spawn-=dt;
    if(g.spawn<=0&&g.targets.length<6){
      g.spawn=.7;
      g.targets.push({x:rnd(80,W-80),y:rnd(100,H-60),vx:rnd(-100,100),vy:rnd(-80,80),r:rnd(20,35)});
    }
    g.targets.forEach(t=>{
      t.x+=t.vx*dt;t.y+=t.vy*dt;
      if(t.x<60||t.x>W-60)t.vx*=-1;
      if(t.y<80||t.y>H-60)t.vy*=-1;
    });
    g.cr.forEach((c,i)=>{
      const I=g.I[i],off=i*450;
      c.cd=Math.max(0,c.cd-dt);
      c.x=cl(c.x+((I.r?1:0)-(I.l?1:0))*380*dt,off+20,off+430);
      c.y=cl(c.y+((I.d?1:0)-(I.u?1:0))*380*dt,70,H-20);
      if(I.a&&c.cd<=0){
        c.cd=.3;
        for(const t of g.targets){
          if(!t.dead&&Math.hypot(c.x-t.x,c.y-t.y)<t.r){
            t.dead=true;
            const d=Math.hypot(c.x-t.x,c.y-t.y);
            g.s[i]+=d<t.r*.3?5:d<t.r*.6?3:1;
            g.burst(t.x,t.y,GOLD,8,200);
            FX.tone(700,.05,"square",.03);
            break;
          }
        }
      }
    });
    g.targets=g.targets.filter(t=>!t.dead);
    if(g.tl<=0)g.byScore(g.s);
  },
  draw(g,ctx){
    ctx.fillStyle="#1a1230";ctx.fillRect(0,0,W,H);
    g.targets.forEach(t=>{
      [1,.7,.4].forEach((r,k)=>{
        ctx.fillStyle=["#ff6a6a","#fff","#ffd24a"][k];
        ctx.beginPath();ctx.arc(t.x,t.y,t.r*r,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#080b18";ctx.lineWidth=1;ctx.stroke();
      });
    });
    g.cr.forEach((c,i)=>{
      ctx.strokeStyle=col(i);ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(c.x,c.y,14,0,Math.PI*2);
      ctx.moveTo(c.x-22,c.y);ctx.lineTo(c.x+22,c.y);
      ctx.moveTo(c.x,c.y-22);ctx.lineTo(c.x,c.y+22);
      ctx.stroke();
      g.text("P"+(i+1)+" "+g.s[i],i?W-20:20,30,18,col(i),i?"right":"left");
    });
    g.text(Math.max(0,Math.ceil(g.tl))+"s",W/2,30,20,GOLD,"center");
  }
});

/* TRAMPOLINE DUEL */
micro({
  id:"trampolineGame",title:"Trampoline Duel",desc:"Bounce and collide. Push rival off edge.",
  cat:"action",key:"trampoline",win:3,
  controls:"P1: A/D move, SPACE jump-boost　 P2: ←/→, ENTER — collisions transfer momentum",
  round(g){
    g.pl=[
      {x:200,y:400,vx:0,vy:0},
      {x:700,y:400,vx:0,vy:0}
    ];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.vx=((I.r?1:0)-(I.l?1:0))*260;
      if(I.a&&p.y>=400){p.vy=-620;FX.tone(500,.06,"square",.03);}
      p.vy+=1400*dt;
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.y>=420){p.y=420;p.vy=-Math.max(300,Math.abs(p.vy)*1.05);}
      if(p.x<20||p.x>W-20){p.vx*=-1;p.x=cl(p.x,20,W-20);}
    });
    const [a,b]=g.pl,d=Math.hypot(a.x-b.x,a.y-b.y);
    if(d<40&&d>0){
      const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d,o=(40-d)/2;
      a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;
      const vn=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
      if(vn<0){const imp=-1.2*vn/2;a.vx-=imp*nx;a.vy-=imp*ny;b.vx+=imp*nx;b.vy+=imp*ny;}
    }
    [0,1].forEach(i=>{
      if(g.pl[i].y>H+50)g.point(1-i,"P"+(i+1)+" FELL");
    });
  },
  draw(g,ctx){
    ctx.fillStyle="#2a1a3a";ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#3a7a4a";ctx.fillRect(0,420,W,H-420);
    g.pl.forEach((p,i)=>{
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(p.x,p.y,16,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(p.x-5,p.y-3,3,0,Math.PI*2);ctx.fill();
    });
  }
});

/* SLIDING BALLS */
micro({
  id:"slidingballsGame",title:"Sliding Balls",desc:"Match ball colors to slot colors. First done wins.",
  cat:"brain",key:"slidingballs",win:3,
  controls:"P1 clicks a ball then a slot　 P2 does the same on their side — wrong match returns ball",
  round(g){
    const colors=["#ff6a6a","#6aff8a","#ffd24a","#6ab0ff"];
    g.boards=[];
    for(let p=0;p<2;p++){
      const balls=[];
      const slots=[];
      for(let i=0;i<4;i++){
        balls.push({x:0,y:0,color:colors[i],placed:null});
        slots.push({x:0,y:0,color:colors[(i+2)%4],filled:false});
      }
      balls.sort(()=>Math.random()-.5);
      for(let i=0;i<4;i++)balls[i].x=60+i*70;
      for(let i=0;i<4;i++)slots[i].x=60+i*70;
      g.boards.push({balls,slots,sel:null});
    }
  },
  update(){},
  click(g,x,y){
    for(let p=0;p<2;p++){
      const off=p*450,board=g.boards[p];
      if(x<off||x>off+450)continue;
      const lx=x-off;
      for(let i=0;i<board.balls.length;i++){
        const b=board.balls[i];
        if(b.placed)continue;
        if(Math.abs(lx-b.x)<28&&Math.abs(y-380)<28){board.sel=i;return;}
      }
      if(board.sel===null)return;
      const b=board.balls[board.sel];
      for(const s of board.slots){
        if(s.filled)continue;
        if(Math.abs(lx-s.x)<30&&Math.abs(y-120)<30){
          if(s.color===b.color){
            s.filled=true;b.placed=s;FX.playScore();
            if(board.slots.every(s2=>s2.filled)){g.point(p,"DONE!");return;}
          }else FX.tone(120,.15,"sawtooth",.03);
          board.sel=null;return;
        }
      }
    }
  },
  draw(g,ctx){
    for(let p=0;p<2;p++){
      const off=p*450,board=g.boards[p];
      ctx.fillStyle=p?"#1a1030":"#0f1530";ctx.fillRect(off,0,450,H);
      board.slots.forEach(s=>{
        ctx.fillStyle="#2a2f63";
        ctx.fillRect(off+s.x-30,120-30,60,60);
        ctx.strokeStyle=s.color;ctx.lineWidth=3;
        ctx.strokeRect(off+s.x-30,120-30,60,60);
        if(s.filled){ctx.fillStyle=s.color;ctx.beginPath();ctx.arc(off+s.x,120,22,0,Math.PI*2);ctx.fill();}
      });
      board.balls.forEach((b,i)=>{
        if(b.placed)return;
        ctx.fillStyle=b.color;
        ctx.beginPath();ctx.arc(off+b.x,380,22,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
        if(board.sel===i){ctx.strokeStyle=GOLD;ctx.lineWidth=4;ctx.stroke();}
      });
      g.text("P"+(p+1),off+225,40,20,col(p),"center");
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* BOUNCE TARGET PRO */
micro({
  id:"bouncetarget2Game",title:"Bounce Target Pro",desc:"Ricochet shots to hit many targets.",
  cat:"sports",key:"bouncetarget2",win:3,
  controls:"P1: A/D aim, SPACE fire　 P2: ←/→, ENTER — one shot can hit many targets",
  round(g){
    g.pl=[{aim:-.7,cd:0,score:0,shots:3},{aim:Math.PI+.7,cd:0,score:0,shots:3}];
    g.turn=0;
    g.targets=[];
    for(let i=0;i<5;i++)g.targets.push({x:180+i*140,y:150+Math.sin(i*2)*60,r:16,alive:true});
    g.bullets=[];
  },
  update(g,dt){
    const p=g.pl[g.turn],I=g.I[g.turn];
    if(p.shots<=0){
      g.turn=1-g.turn;
      if(g.pl[0].shots<=0&&g.pl[1].shots<=0)g.byScore(g.pl.map(x=>x.score));
      return;
    }
    p.cd=Math.max(0,p.cd-dt);
    if(I.l)p.aim-=.8*dt;
    if(I.r)p.aim+=.8*dt;
    if(I.a&&p.cd<=0){
      p.cd=.5;p.shots--;
      const sx=g.turn?W-40:40;
      g.bullets.push({x:sx,y:250,vx:Math.cos(p.aim)*400,vy:Math.sin(p.aim)*400,o:g.turn});
      FX.tone(500,.05,"square",.04);
      g.turn=1-g.turn;
    }
    g.bullets.forEach(b=>{
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.x<20||b.x>W-20){b.vx*=-1;b.x=cl(b.x,20,W-20);}
      if(b.y<40||b.y>H-20){b.vy*=-1;b.y=cl(b.y,40,H-20);}
      for(const t of g.targets){
        if(!t.alive)continue;
        if(Math.hypot(b.x-t.x,b.y-t.y)<t.r+4){
          t.alive=false;g.pl[b.o].score+=20;
          g.burst(t.x,t.y,GOLD,10,200);
        }
      }
    });
    g.bullets=g.bullets.filter(b=>!b.dead);
  },
  draw(g,ctx){
    ctx.fillStyle="#1a1230";ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="#4a3a6a";ctx.lineWidth=6;ctx.strokeRect(20,40,W-40,H-60);
    g.targets.forEach(t=>{
      if(!t.alive)return;
      ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
    });
    g.bullets.forEach(b=>{
      ctx.fillStyle=col(b.o);ctx.beginPath();ctx.arc(b.x,b.y,5,0,Math.PI*2);ctx.fill();
    });
    g.pl.forEach((p,i)=>{
      const sx=i?W-40:40;
      ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(sx,250,14,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      if(g.turn===i&&p.shots>0){
        ctx.strokeStyle=col(i);ctx.lineWidth=2;ctx.setLineDash([8,6]);
        ctx.beginPath();ctx.moveTo(sx,250);
        ctx.lineTo(sx+Math.cos(p.aim)*250,250+Math.sin(p.aim)*250);
        ctx.stroke();ctx.setLineDash([]);
      }
      g.text("P"+(i+1)+" "+p.score+" shot:"+p.shots,i?W-20:20,30,14,col(i),i?"right":"left");
    });
  }
});

/* LUDO MINI */
micro({
  id:"ludominiGame",title:"Ludo Mini",desc:"Roll and race 4 tokens home.",
  cat:"board",key:"ludomini",win:1,hud:false,
  controls:"SPACE / ENTER to roll. Click a token to advance. All tokens to 20 wins.",
  init(g){
    g.pos=[[0,0,0,0],[0,0,0,0]];
    g.turn=0;g.dice=0;g.rolling=0;
  },
  update(g,dt){
    if(g.rolling>0){
      g.rolling-=dt;
      if(g.rolling<=0){g.dice=ri(1,6);FX.tone(600,.08,"square",.04);}
      return;
    }
    if(!g.dice&&g.I[g.turn].pa){g.rolling=.4;FX.tone(400,.05,"square",.03);}
  },
  click(g,x,y){
    if(!g.dice||g.rolling)return;
    const off=g.turn?450:0,rowY=g.turn?150:400;
    for(let i=0;i<4;i++){
      if(Math.abs(x-(off+50+i*90))<40&&Math.abs(y-rowY)<35){
        g.pos[g.turn][i]=Math.min(20,g.pos[g.turn][i]+g.dice);
        g.dice=0;
        if(g.pos[g.turn].every(p=>p>=20)){g.end(g.turn);return;}
        g.turn=1-g.turn;return;
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#1a1a2a";ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#3a2a1a";ctx.fillRect(50,100,800,300);
    ctx.strokeStyle="#5a4a2a";ctx.lineWidth=4;ctx.strokeRect(50,100,800,300);
    for(let k=0;k<=20;k++){
      const x=70+k*38;
      ctx.fillStyle=(k%2)?"#8a5a3a":"#6a3a2a";
      ctx.fillRect(x,120,36,80);
    }
    g.text("P1",20,50,20,C1);
    g.text("P2",W-20,50,20,C2,"right");
    [0,1].forEach(p=>{
      const off=p?450:0,rowY=p?150:400;
      g.pos[p].forEach((pos,i)=>{
        const px=off+50+i*90;
        ctx.fillStyle=col(p);
        ctx.beginPath();ctx.arc(px,rowY,20,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
        g.text(String(pos),px,rowY+5,13,"#080b18","center");
      });
    });
    g.text(g.dice?"ROLLED: "+g.dice:`P${g.turn+1}: SPACE`,W/2,450,22,g.dice?GOLD:col(g.turn),"center");
  }
});

/* ANIMAL RACE */
const ANIMALS=["🐢","🐇","🐕","🦊","🐺","🐈"];
micro({
  id:"animalraceGame",title:"Animal Race",desc:"Bet on an animal. Watch them race.",
  cat:"board",key:"animalrace",win:1,hud:false,
  controls:"P1: A=🐢 W=🐇 D=🐕　 P2: ←=🦊 ↑=🐺 →=🐈 — then SPACE to start race",
  init(g){
    g.animals=ANIMALS.map((e,i)=>({emoji:e,pos:0,i}));
    g.bet=[null,null];g.phase="bet";g.raceT=0;
  },
  update(g,dt){
    if(g.phase==="bet"){
      for(let p=0;p<2;p++){
        if(g.bet[p]!==null)continue;
        const I=g.I[p];
        if(p===0){
          if(I.pl)g.bet[0]=0;else if(I.pu)g.bet[0]=1;else if(I.pr)g.bet[0]=2;
        }else{
          if(I.pl)g.bet[1]=3;else if(I.pu)g.bet[1]=4;else if(I.pr)g.bet[1]=5;
        }
      }
      if(g.bet[0]!==null&&g.bet[1]!==null&&g.I[0].pa)g.phase="race";
      return;
    }
    if(g.phase==="race"){
      g.raceT+=dt;
      g.animals.forEach(a=>{if(Math.random()<.05)a.pos+=1;});
      const w=g.animals.find(a=>a.pos>=20);
      if(w){
        g.phase="done";
        const wins=[];
        if(g.bet[0]===w.i)wins.push(0);
        if(g.bet[1]===w.i)wins.push(1);
        if(wins.length===1)g.end(wins[0]);
        else if(wins.length===2)g.next("BOTH BET WINNER");
        else g.next("NOBODY WON");
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1a0a";ctx.fillRect(0,0,W,H);
    g.animals.forEach((a,i)=>{
      const y=80+i*55;
      ctx.fillStyle=i%2?"#1a3a1a":"#0f2a0f";
      ctx.fillRect(0,y,900,45);
      ctx.fillStyle="#fff";ctx.font="36px serif";
      ctx.fillText(a.emoji,60+a.pos*38,y+38);
      g.text(a.pos+"/20",W-20,y+30,12,"#9fc0ff","right");
    });
    if(g.phase==="bet"){
      g.text("P1 BET: "+(g.bet[0]!==null?ANIMALS[g.bet[0]]:"?"),225,440,20,C1,"center");
      g.text("P2 BET: "+(g.bet[1]!==null?ANIMALS[g.bet[1]]:"?"),675,440,20,C2,"center");
      if(g.bet[0]!==null&&g.bet[1]!==null)g.text("P1: SPACE TO START",W/2,480,14,GOLD,"center");
    }else if(g.phase==="race"){
      g.text("RACE!",W/2,460,30,GOLD,"center");
    }
  }
});

/* WHACK SEQUENCE */
micro({
  id:"whacksequenceGame",title:"Whack Sequence",desc:"Whack numbers in order. Fastest wins.",
  cat:"reflex",key:"whacksequence",win:3,
  controls:"P1: QWE/ASD/ZXC　 P2: UIO/JKL/M,. — click cells in order 1→9",
  round(g){
    const base=[1,2,3,4,5,6,7,8,9];
    g.grids=[];
    for(let p=0;p<2;p++){
      const s=base.slice().sort(()=>Math.random()-.5);
      const grid=[];
      for(let i=0;i<9;i++)grid.push({num:s[i],hit:false});
      g.grids.push({cells:grid,idx:0});
    }
  },
  update(g,dt){
    const keysP1=["q","w","e","a","s","d","z","x","c"];
    const keysP2=["u","i","o","j","k","l","m",",","."];
    for(let p=0;p<2;p++){
      const keysArr=p?keysP2:keysP1;
      const grid=g.grids[p];
      for(let k=0;k<9;k++){
        if(g.pk[keysArr[k]]){
          const cell=grid.cells[k];
          if(cell.hit)continue;
          if(cell.num===grid.idx+1){
            cell.hit=true;grid.idx++;
            FX.tone(500+cell.num*50,.05,"square",.03);
            if(grid.idx>=9)g.point(p,"DONE!");
          }else FX.tone(120,.1,"sawtooth",.03);
        }
      }
    }
  },
  click(g,x,y){
    if(x>450)return;
    const sz=90,ox=80,oy=120;
    for(let k=0;k<9;k++){
      const px=ox+(k%3)*sz,y2=oy+Math.floor(k/3)*sz;
      if(x>px&&x<px+sz-10&&y>y2&&y<y2+sz-10){
        const cell=g.grids[0].cells[k];
        if(cell.hit)continue;
        if(cell.num===g.grids[0].idx+1){
          cell.hit=true;g.grids[0].idx++;
          FX.tone(500+cell.num*50,.05,"square",.03);
          if(g.grids[0].idx>=9)g.point(0,"DONE!");
        }else FX.tone(120,.1,"sawtooth",.03);
        return;
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#1a2a1a";ctx.fillRect(0,0,W,H);
    const sz=90,ox=80,oy=120;
    for(let p=0;p<2;p++){
      const off=p*450,grid=g.grids[p];
      for(let k=0;k<9;k++){
        const cell=grid.cells[k];
        const px=off+ox+(k%3)*sz-30,y2=oy+Math.floor(k/3)*sz;
        if(cell.hit){ctx.fillStyle="#0f2010";ctx.fillRect(px,y2,sz-10,sz-10);continue;}
        ctx.fillStyle="#2a5a2a";ctx.fillRect(px,y2,sz-10,sz-10);
        ctx.strokeStyle="#5a8a3a";ctx.lineWidth=3;ctx.strokeRect(px,y2,sz-10,sz-10);
        g.text(String(cell.num),px+(sz-10)/2,y2+55,32,"#fff","center");
      }
      g.text("P"+(p+1)+" NEXT: "+(grid.idx+1),off+225,60,18,col(p),"center");
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* COLOR PUSHER */
const CP_COLORS=["#ff6a6a","#6aff8a","#ffd24a","#6ab0ff"];
micro({
  id:"colorpusherGame",title:"Color Pusher",desc:"Push falling colors into matching bins.",
  cat:"brain",key:"colorpusher",win:3,
  controls:"P1: A/D move, W push　 P2: ←/→, ↑ — catch your color, reject the rest",
  round(g){
    g.pl=[
      {x:225,score:0,heldColor:CP_COLORS[0]},
      {x:675,score:0,heldColor:CP_COLORS[3]}
    ];
    g.falling=[[],[]];
    g.spawn=0;
  },
  update(g,dt){
    g.spawn-=dt;
    if(g.spawn<=0&&g.falling[0].length+g.falling[1].length<8){
      g.spawn=.6;
      for(let i=0;i<2;i++){
        g.falling[i].push({x:rnd(60,390),y:-20,vy:rnd(60,140),color:ri(0,3)});
      }
    }
    g.pl.forEach((p,i)=>{
      const I=g.I[i],off=i*450;
      p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*280*dt,off+50,off+400);
      for(let k=0;k<g.falling[i].length;k++){
        const f=g.falling[i][k];
        f.y+=f.vy*dt;
        if(f.y>430&&f.y<465&&Math.abs(f.x+off-p.x)<40){
          if(CP_COLORS[f.color]===p.heldColor){
            p.score++;FX.playScore();
            g.burst(f.x+off,450,CP_COLORS[f.color],8,200);
          }else{
            p.score=Math.max(0,p.score-1);
            FX.tone(120,.1,"sawtooth",.03);
          }
          g.falling[i].splice(k,1);k--;
        }
      }
      g.falling[i]=g.falling[i].filter(f=>f.y<H+20);
    });
    if(g.pl[0].score>=15)g.point(0,"15 POINTS");
    else if(g.pl[1].score>=15)g.point(1,"15 POINTS");
  },
  draw(g,ctx){
    for(let i=0;i<2;i++){
      const off=i*450,p=g.pl[i];
      ctx.fillStyle=i?"#2a1a3a":"#1a2a3a";ctx.fillRect(off,0,450,H);
      CP_COLORS.forEach((c,k)=>{
        const bx=off+60+k*95;
        const isMine=c===p.heldColor;
        ctx.fillStyle=isMine?c:"#3a3a5a";
        ctx.fillRect(bx,430,80,50);
        ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(bx,430,80,50);
      });
      g.falling[i].forEach(f=>{
        ctx.fillStyle=CP_COLORS[f.color];
        ctx.fillRect(off+f.x-15,f.y-15,30,30);
        ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(off+f.x-15,f.y-15,30,30);
      });
      ctx.fillStyle=p.heldColor;
      ctx.fillRect(off+p.x-35,H-35,70,12);
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;
      ctx.strokeRect(off+p.x-35,H-35,70,12);
      g.text("P"+(i+1)+" "+p.score+"/15",off+225,30,18,p.heldColor,"center");
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

})();