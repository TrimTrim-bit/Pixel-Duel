/* =====================================================
   GAME PACK AA — 8 games
   Word Scramble, Simon Says, Laser Tag, Bubble Pop Race,
   Frogger Duel, Click Frenzy, Memory Grid, RPSLS
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* 1. WORD SCRAMBLE */
const SCR_WORDS=["PUZZLE","ROCKET","TARGET","DANGER","BRIDGE","CASTLE","FOREST","DRAGON","GUITAR","CIRCUS","PLANET","KNIGHT","WIZARD","TIGER","EAGLE","SILVER","GARDEN","WINTER","SUMMER","FLOWER"];
micro({
  id:"scrambleGame",title:"Word Scramble",desc:"Unscramble the word. First correct wins.",
  cat:"brain",key:"scramble",win:5,
  controls:"P1: A/W/D/S pick　 P2: ←/↑/→/↓ — 4 options, wrong = 2s lockout",
  round(g){
    const word=SCR_WORDS[ri(0,SCR_WORDS.length-1)];
    g.scr=word.split("").sort(()=>Math.random()-.5).join("");
    const opts=[word];
    while(opts.length<4){
      const w=SCR_WORDS[ri(0,SCR_WORDS.length-1)];
      if(!opts.includes(w))opts.push(w);
    }
    opts.sort(()=>Math.random()-.5);
    g.opts=opts;g.ans=opts.indexOf(word);g.lock=[0,0];
  },
  update(g,dt){
    g.lock[0]=Math.max(0,g.lock[0]-dt);g.lock[1]=Math.max(0,g.lock[1]-dt);
    for(let i=0;i<2;i++){
      if(g.lock[i]>0)continue;
      const I=g.I[i],k=I.pl?0:I.pu?1:I.pr?2:I.pd?3:-1;
      if(k<0)continue;
      if(k===g.ans){g.point(i);return;}
      g.lock[i]=2;FX.tone(120,.2,"sawtooth",.04);
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
    g.text("UNSCRAMBLE:",W/2,60,18,"#9fc0ff","center");
    g.text(g.scr.split("").join(" "),W/2,140,40,GOLD,"center");
    const P=[{x:180,y:250},{x:450,y:250},{x:180,y:380},{x:450,y:380}];
    g.opts.forEach((w,k)=>{
      const p=P[k];
      ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-130,p.y-28,260,56);
      ctx.strokeStyle=GOLD;ctx.lineWidth=3;ctx.strokeRect(p.x-130,p.y-28,260,56);
      g.text(w,p.x,p.y+8,22,"#fff","center");
      g.text(["◀","▲","▶","▼"][k],p.x,p.y+42,12,"#9fc0ff","center");
    });
    for(let i=0;i<2;i++)if(g.lock[i]>0)g.text("P"+(i+1)+" LOCK",i?W-60:60,455,14,RED,"center");
  }
});

/* 2. SIMON SAYS */
micro({
  id:"simonGame",title:"Simon Says",desc:"Repeat the color sequence. Mistake = lose round.",
  cat:"reflex",key:"simon",win:3,
  controls:"P1: W/A/S/D　 P2: ←/↑/↓/→ — watch the sequence, repeat in order",
  round(g){
    const rn=g.score[0]+g.score[1];
    const seqLen=Math.min(5,2+rn);
    g.seq=[];
    for(let i=0;i<seqLen;i++)g.seq.push(ri(0,3));
    g.showing=true;g.showT=.55;g.showIdx=0;
    g.idx=[0,0];g.lock=[false,false];
    FX.tone([440,523,659,784][g.seq[0]],.15,"square",.04);
  },
  update(g,dt){
    if(g.showing){
      g.showT-=dt;
      if(g.showT<=0){
        g.showIdx++;
        if(g.showIdx>=g.seq.length){g.showing=false;return;}
        g.showT=.55;
        FX.tone([440,523,659,784][g.seq[g.showIdx]],.15,"square",.04);
      }
      return;
    }
    for(let i=0;i<2;i++){
      if(g.lock[i])continue;
      const I=g.I[i],k=I.pu?0:I.pl?1:I.pd?2:I.pr?3:-1;
      if(k<0)continue;
      if(k===g.seq[g.idx[i]]){
        FX.tone([440,523,659,784][k],.08,"square",.03);
        g.idx[i]++;
        if(g.idx[i]>=g.seq.length){g.point(i,"DONE!");return;}
      }else{
        g.lock[i]=true;
        FX.tone(120,.3,"sawtooth",.05,-40);
        g.point(1-i,"WRONG");
        return;
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
      g.text(["W","A","S","D"][k],p.x-95,p.y,13,"#9fc0ff","center");
      g.text(["↑","←","↓","→"][k],p.x+95,p.y,13,"#9fc0ff","center");
    });
    g.text("SEQ LENGTH: "+g.seq.length,W/2,450,16,GOLD,"center");
    g.text(g.showing?"WATCH...":"REPEAT!",W/2,30,18,g.showing?"#9fc0ff":GOLD,"center");
    [0,1].forEach(i=>{
      g.text("P"+(i+1)+" "+g.idx[i]+"/"+g.seq.length,i?W-40:40,60,14,col(i),i?"right":"left");
    });
  }
});

/* 3. LASER TAG */
micro({
  id:"lasertagGame",title:"Laser Tag",desc:"Hide behind cover, shoot the rival.",
  cat:"action",key:"lasertag",win:3,
  controls:"P1: WASD move, SPACE fire　 P2: ARROWS, ENTER — cover blocks shots",
  round(g){
    g.pl=[
      {x:100,y:250,aim:0,hp:3,cd:0},
      {x:800,y:250,aim:Math.PI,hp:3,cd:0}
    ];
    g.beams=[];
    g.cover=[
      {x:200,y:130,w:80,h:80},
      {x:200,y:290,w:80,h:80},
      {x:620,y:130,w:80,h:80},
      {x:620,y:290,w:80,h:80},
      {x:420,y:210,w:60,h:80}
    ];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      p.cd=Math.max(0,p.cd-dt);
      if(I.l)p.x-=180*dt;
      if(I.r)p.x+=180*dt;
      if(I.u)p.y-=180*dt;
      if(I.d)p.y+=180*dt;
      p.x=cl(p.x,20,W-20);p.y=cl(p.y,60,H-20);
      for(const c of g.cover){
        if(p.x>c.x-14&&p.x<c.x+c.w+14&&p.y>c.y-14&&p.y<c.y+c.h+14){
          const dx=p.x-(c.x+c.w/2),dy=p.y-(c.y+c.h/2);
          if(Math.abs(dx)>Math.abs(dy))p.x=dx>0?c.x+c.w+14:c.x-14;
          else p.y=dy>0?c.y+c.h+14:c.y-14;
        }
      }
      const o=g.pl[1-i];
      p.aim=Math.atan2(o.y-p.y,o.x-p.x);
      if(I.a&&p.cd<=0){
        p.cd=.7;
        g.beams.push({x:p.x,y:p.y,ang:p.aim,o:i,life:.15,endD:600});
        FX.playShoot();
      }
    });
    g.beams.forEach(b=>{
      b.life-=dt;
      if(b.life<=0)return;
      for(let d=0;d<600;d+=4){
        const tx=b.x+Math.cos(b.ang)*d,ty=b.y+Math.sin(b.ang)*d;
        let blocked=false;
        for(const c of g.cover){
          if(tx>c.x&&tx<c.x+c.w&&ty>c.y&&ty<c.y+c.h){blocked=true;break;}
        }
        if(blocked){b.endD=d;break;}
        const t=g.pl[1-b.o];
        if(Math.hypot(tx-t.x,ty-t.y)<16){
          t.hp--;b.endD=d;
          g.burst(t.x,t.y,col(b.o),14,300);
          playHitSound();
          if(t.hp<=0)g.point(b.o,"K.O.");
          break;
        }
        b.endD=d;
      }
    });
    g.beams=g.beams.filter(b=>b.life>0);
  },
  draw(g,ctx){
    ctx.fillStyle="#1a1230";ctx.fillRect(0,0,W,H);
    for(let k=0;k<50;k++){ctx.fillStyle="#26386f";ctx.fillRect((k*97)%W,(k*61)%H,2,2);}
    for(const c of g.cover){
      ctx.fillStyle="#4a3a6a";ctx.fillRect(c.x,c.y,c.w,c.h);
      ctx.fillStyle="#6a56b8";ctx.fillRect(c.x,c.y,c.w,4);
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(c.x,c.y,c.w,c.h);
    }
    g.beams.forEach(b=>{
      ctx.strokeStyle=col(b.o);ctx.lineWidth=3;ctx.globalAlpha=b.life/.15;
      ctx.beginPath();ctx.moveTo(b.x,b.y);
      ctx.lineTo(b.x+Math.cos(b.ang)*b.endD,b.y+Math.sin(b.ang)*b.endD);
      ctx.stroke();ctx.globalAlpha=1;
    });
    g.pl.forEach((p,i)=>{
      g.blob({x:p.x,y:p.y,r:14},col(i),p.x+Math.cos(p.aim)*30,p.y+Math.sin(p.aim)*30,false);
      ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,6);
      ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/3,6);
    });
  }
});

/* 4. BUBBLE POP RACE */
micro({
  id:"bubbleShooterGame",title:"Bubble Pop Race",desc:"Pop bubbles faster than rival.",
  cat:"arcade",key:"bubble2",win:1,hud:false,
  controls:"P1: WASD crosshair, SPACE pop　 P2: ARROWS, ENTER — first to 30 points wins",
  init(g){
    g.s=[0,0];g.bubbles=[];g.spawnT=0;
    g.cr=[{x:250,y:250,cd:0},{x:650,y:250,cd:0}];
  },
  update(g,dt){
    g.spawnT-=dt;
    if(g.spawnT<=0&&g.bubbles.length<12){
      g.spawnT=.3;
      g.bubbles.push({
        x:rnd(50,W-50),y:rnd(70,H-70),r:rnd(15,25),
        color:["#ff6a6a","#6aff8a","#6ab0ff","#ffd24a"][ri(0,3)],
        life:rnd(3,6),vy:-rnd(20,40)
      });
    }
    g.cr.forEach((c,i)=>{
      const I=g.I[i];
      c.cd=Math.max(0,c.cd-dt);
      if(I.l)c.x-=300*dt;
      if(I.r)c.x+=300*dt;
      if(I.u)c.y-=300*dt;
      if(I.d)c.y+=300*dt;
      c.x=cl(c.x,20,W-20);c.y=cl(c.y,60,H-20);
      if(I.a&&c.cd<=0){
        c.cd=.15;
        for(const b of g.bubbles){
          if(!b.dead&&Math.hypot(c.x-b.x,c.y-b.y)<b.r+15){
            b.dead=true;
            g.s[i]+=1;
            g.burst(b.x,b.y,b.color,10,200);
            FX.tone(700+i*100,.05,"square",.04);
            if(g.s[i]>=30){g.byScore(g.s);return;}
            break;
          }
        }
      }
    });
    g.bubbles.forEach(b=>{b.y+=b.vy*dt;b.life-=dt;if(b.life<=0)b.dead=true;});
    g.bubbles=g.bubbles.filter(b=>!b.dead&&b.y>-30);
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1030";ctx.fillRect(0,0,W,H);
    for(const b of g.bubbles){
      ctx.fillStyle=b.color;
      ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle="rgba(255,255,255,.4)";
      ctx.beginPath();ctx.arc(b.x-b.r*.35,b.y-b.r*.35,b.r*.3,0,Math.PI*2);ctx.fill();
    }
    g.cr.forEach((c,i)=>{
      ctx.strokeStyle=col(i);ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(c.x,c.y,15,0,Math.PI*2);
      ctx.moveTo(c.x-25,c.y);ctx.lineTo(c.x+25,c.y);
      ctx.moveTo(c.x,c.y-25);ctx.lineTo(c.x,c.y+25);
      ctx.stroke();
      g.text("P"+(i+1)+" "+g.s[i]+"/30",i?W-20:20,30,20,col(i),i?"right":"left");
    });
  }
});

/* 5. FROGGER DUEL */
micro({
  id:"froggerGame",title:"Frogger Duel",desc:"Cross the road. Dodge traffic.",
  cat:"reflex",key:"frogger",win:3,
  controls:"P1: W/A/S/D hop　 P2: ARROWS hop — reach the top first",
  round(g){
    g.pl=[{x:200,y:440},{x:650,y:440}];
    g.lanes=[];
    const r=seeded(ri(1,1e6));
    for(let k=0;k<8;k++){
      g.lanes.push({y:80+k*45,dir:r()<.5?1:-1,speed:60+r()*100,count:2+Math.floor(r()*2)});
    }
    g.cars=[];
    for(let i=0;i<g.lanes.length;i++){
      const L=g.lanes[i];
      for(let j=0;j<L.count;j++)g.cars.push({lane:i,x:(j*220+L.gap)%600});
    }
  },
  update(g,dt){
    g.cars.forEach(car=>{
      const L=g.lanes[car.lane];
      car.x+=L.dir*L.speed*dt;
      if(car.x<-80)car.x=W+80;
      if(car.x>W+80)car.x=-80;
    });
    const dead=[false,false];
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      const off=i*450;
      if(I.pu)p.y-=45;
      else if(I.pd)p.y+=45;
      else if(I.pl)p.x-=30;
      else if(I.pr)p.x+=30;
      p.x=cl(p.x,off+20,off+430);
      p.y=cl(p.y,60,H-40);
      if(I.pu||I.pd||I.pl||I.pr)FX.tone(400,.03,"square",.02);
      for(const car of g.cars){
        const L=g.lanes[car.lane];
        if(Math.abs(p.y-L.y)<20&&Math.abs(p.x-(off+car.x))<30)dead[i]=true;
      }
      if(p.y<60&&!dead[i]){g.point(i,"ACROSS!");return;}
    });
    if(dead[0]&&dead[1])g.next("BOTH HIT");
    else if(dead[0]){g.burst(g.pl[0].x,g.pl[0].y,C1,20,300);g.point(1);}
    else if(dead[1]){g.burst(g.pl[1].x,g.pl[1].y,C2,20,300);g.point(0);}
  },
  draw(g,ctx){
    for(let i=0;i<2;i++){
      const off=i*450;
      ctx.fillStyle="#2a5a2a";ctx.fillRect(off,0,450,H);
      g.lanes.forEach((L,idx)=>{
        ctx.fillStyle=idx%2?"#3a3a3a":"#2a2a2a";
        ctx.fillRect(off,L.y-18,450,36);
        ctx.fillStyle="rgba(255,255,255,.3)";
        for(let x=0;x<450;x+=40)ctx.fillRect(off+x,L.y-1,20,2);
      });
      ctx.fillStyle=GREEN;ctx.fillRect(off+40,40,370,20);
      ctx.fillStyle="#4a5a3a";ctx.fillRect(off+40,460,370,20);
      g.cars.forEach(car=>{
        const L=g.lanes[car.lane];
        ctx.fillStyle=["#ff4a6a","#ffd24a","#6ab0ff"][car.lane%3];
        ctx.fillRect(off+car.x-25,L.y-12,50,24);
        ctx.strokeStyle="#080b18";ctx.lineWidth=2;
        ctx.strokeRect(off+car.x-25,L.y-12,50,24);
      });
      const p=g.pl[i];
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";
      ctx.fillRect(p.x-6,p.y-4,4,4);ctx.fillRect(p.x+2,p.y-4,4,4);
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* 6. CLICK FRENZY */
micro({
  id:"clickFrenzyGame",title:"Click Frenzy",desc:"Mash to 50 clicks fastest.",
  cat:"reflex",key:"clickfrenzy",win:3,
  controls:"P1: mash SPACE　 P2: mash ENTER — first to 50 wins",
  round(g){g.counts=[0,0];g.flash=[0,0];},
  update(g,dt){
    g.flash[0]=Math.max(0,g.flash[0]-dt);
    g.flash[1]=Math.max(0,g.flash[1]-dt);
    if(g.I[0].pa){g.counts[0]++;g.flash[0]=.1;FX.tone(400+g.counts[0]*10,.03,"square",.02);}
    if(g.I[1].pa){g.counts[1]++;g.flash[1]=.1;FX.tone(500+g.counts[1]*10,.03,"square",.02);}
    if(g.counts[0]>=50)g.point(0,"50!");
    else if(g.counts[1]>=50)g.point(1,"50!");
  },
  draw(g,ctx){
    ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
    for(let i=0;i<2;i++){
      const cx=i?675:225;
      if(g.flash[i]>0){
        ctx.fillStyle=col(i);ctx.globalAlpha=.3;
        ctx.fillRect(cx-150,80,300,380);ctx.globalAlpha=1;
      }
      ctx.fillStyle=col(i);
      ctx.beginPath();ctx.arc(cx,250,90,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#080b18";ctx.font="bold 90px Courier New";ctx.textAlign="center";
      ctx.fillText(String(g.counts[i]),cx,285);ctx.textAlign="left";
      g.text(i?"ENTER":"SPACE",cx,390,20,"#fff","center");
      g.text("P"+(i+1),cx,60,24,col(i),"center");
    }
    g.text("FIRST TO 50",W/2,30,18,GOLD,"center");
  }
});

/* 7. MEMORY GRID */
micro({
  id:"memoryGridGame",title:"Memory Grid",desc:"Memorize numbers, click in order.",
  cat:"brain",key:"memgrid",win:3,
  controls:"3x3 grid of 1-9 shown briefly. P1: QWE/ASD/ZXC　 P2: UIO/JKL/M,. — click cells in ascending order",
  round(g){
    g.positions=Array.from({length:9},(_,i)=>i).sort(()=>Math.random()-.5);
    g.grid=[];
    for(let i=0;i<9;i++)g.grid[g.positions[i]]=i+1;
    g.showing=true;g.showT=2.5;
    g.idx=[0,0];g.lock=[false,false];g.done=[false,false];
  },
  update(g,dt){
    if(g.showing){
      g.showT-=dt;
      if(g.showT<=0)g.showing=false;
      return;
    }
    const keysP1=["q","w","e","a","s","d","z","x","c"];
    const keysP2=["u","i","o","j","k","l","m",",","."];
    for(let i=0;i<2;i++){
      if(g.done[i]||g.lock[i])continue;
      const keysArr=i?keysP2:keysP1;
      for(let k=0;k<9;k++){
        if(g.pk[keysArr[k]]){
          const target=g.idx[i]+1;
          if(g.grid[k]===target){
            g.idx[i]++;
            FX.tone(500+k*40,.05,"square",.03);
            if(g.idx[i]>=9){g.point(i,"DONE!");return;}
          }else{
            g.lock[i]=true;
            FX.tone(120,.3,"sawtooth",.05,-40);
            g.point(1-i,"WRONG");
            return;
          }
        }
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
    for(let i=0;i<2;i++){
      const off=i*450,sz=75,ox=off+37,oy=90;
      for(let r=0;r<3;r++)for(let c=0;c<3;c++){
        const idx=r*3+c,x=ox+c*sz,y=oy+r*sz;
        ctx.fillStyle="#2a2f63";ctx.fillRect(x+2,y+2,sz-4,sz-4);
        ctx.strokeStyle=col(i);ctx.lineWidth=2;ctx.strokeRect(x+2,y+2,sz-4,sz-4);
        const val=g.grid[idx];
        if(g.showing){
          g.text(String(val),x+sz/2,y+sz/2+12,28,"#fff","center");
        }else if(g.idx[i]>=val){
          ctx.fillStyle=col(i);ctx.globalAlpha=.3;
          ctx.fillRect(x+2,y+2,sz-4,sz-4);ctx.globalAlpha=1;
          g.text(String(val),x+sz/2,y+sz/2+12,28,col(i),"center");
        }
      }
      g.text("P"+(i+1)+" "+g.idx[i]+"/9",off+225,45,18,col(i),"center");
    }
    g.text(g.showing?"MEMORIZE! "+Math.ceil(g.showT)+"s":"CLICK IN ORDER!",W/2,30,18,GOLD,"center");
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* 8. RPS LIZARD SPOCK */
micro({
  id:"rpslsGame",title:"RPS Lizard Spock",desc:"5-way RPS variant.",
  cat:"brain",key:"rpsls",win:3,
  controls:"P1: Q=Rock W=Paper E=Scissors A=Lizard S=Spock　 P2: U I O J K — first winner scores",
  round(g){
    g.ch=[-1,-1];g.tl=5;g.rev=false;
  },
  update(g,dt){
    g.tl-=dt;
    const p1k=["q","w","e","a","s"];
    const p2k=["u","i","o","j","k"];
    for(let i=0;i<2;i++){
      if(g.ch[i]>=0)continue;
      const keysArr=i?p2k:p1k;
      for(let k=0;k<5;k++){
        if(g.pk[keysArr[k]]){g.ch[i]=k;FX.tone(500,.06,"square",.04);break;}
      }
      if(g.ch[i]<0&&g.tl<=0)g.ch[i]=ri(0,4);
    }
    if(g.ch[0]>=0&&g.ch[1]>=0&&!g.rev){
      g.rev=true;
      const beats={0:[2,3],1:[0,4],2:[1,3],3:[1,4],4:[0,2]};
      if(g.ch[0]===g.ch[1])g.next("TIE");
      else if(beats[g.ch[0]].includes(g.ch[1]))g.point(0,"P1 WINS");
      else g.point(1,"P2 WINS");
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
    const ICONS=["✊","✋","✌️","🦎","🖖"];
    const NAMES=["ROCK","PAPER","SCISSORS","LIZARD","SPOCK"];
    const k1=["Q","W","E","A","S"];
    const k2=["U","I","O","J","K"];
    for(let i=0;i<2;i++){
      const cx=i?675:225;
      ctx.fillStyle=i?"#2a1a4a":"#14305a";ctx.fillRect(cx-170,80,340,340);
      ctx.strokeStyle=col(i);ctx.lineWidth=3;ctx.strokeRect(cx-170,80,340,340);
      g.text("PLAYER "+(i+1),cx,60,20,col(i),"center");
      if(g.rev){
        ctx.font="120px serif";ctx.textAlign="center";ctx.fillStyle="#fff";
        ctx.fillText(ICONS[g.ch[i]],cx,260);
        g.text(NAMES[g.ch[i]],cx,330,22,"#fff","center");ctx.textAlign="left";
      }else if(g.ch[i]>=0){
        g.text("LOCKED",cx,250,26,GREEN,"center");
      }else{
        ctx.font="100px serif";ctx.textAlign="center";ctx.fillStyle="#2a2f63";
        ctx.fillText("✊",cx,270);
        g.text("CHOOSE...",cx,340,18,"#9fc0ff","center");ctx.textAlign="left";
      }
    }
    for(let k=0;k<5;k++){
      g.text(k1[k]+" / "+k2[k]+" = "+NAMES[k],W/2,440+k*12,11,"#9fc0ff","center");
    }
    if(!g.rev)g.text(String(Math.max(0,Math.ceil(g.tl))),W/2,250,40,GOLD,"center");
    else g.text("VS",W/2,250,34,GOLD,"center");
  }
});

})();