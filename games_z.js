/* =====================================================
   GAME PACK Z — 6 games
   Trivia Duel, Pinball Duel, Asteroids Duel,
   Copter Race, Wheel Spin, Hangman Duel
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* ---------- TRIVIA DUEL ---------- */
const TRIVIA=[
  {q:"7 × 8 = ?",a:["56","48","64","72"],c:0},
  {q:"Capital of France?",a:["Berlin","Madrid","Paris","Rome"],c:2},
  {q:"Planet closest to Sun?",a:["Venus","Mercury","Mars","Earth"],c:1},
  {q:"2³ = ?",a:["6","9","8","12"],c:2},
  {q:"H₂O is...",a:["Salt","Water","Air","Oxygen"],c:1},
  {q:"Fastest land animal?",a:["Tiger","Horse","Cheetah","Lion"],c:2},
  {q:"Blue + Yellow = ?",a:["Orange","Green","Purple","Red"],c:1},
  {q:"100 ÷ 4 = ?",a:["20","25","30","40"],c:1},
  {q:"Largest ocean?",a:["Atlantic","Indian","Pacific","Arctic"],c:2},
  {q:"12 × 12 = ?",a:["124","132","144","156"],c:2},
  {q:"Colors in a rainbow?",a:["6","7","8","9"],c:1},
  {q:"Which is a mammal?",a:["Shark","Dolphin","Trout","Tuna"],c:1},
  {q:"Continents on Earth?",a:["5","6","7","8"],c:2},
  {q:"√16 = ?",a:["2","3","4","5"],c:2},
  {q:"Largest planet?",a:["Mars","Saturn","Neptune","Jupiter"],c:3},
  {q:"The Moon orbits...",a:["Sun","Earth","Mars","Nebula"],c:1},
  {q:"9² = ?",a:["18","72","81","99"],c:2},
  {q:"Author of Romeo and Juliet?",a:["Dickens","Shakespeare","Twain","Austen"],c:1},
  {q:"Gas we breathe?",a:["O₂","CO₂","N₂","H₂"],c:0},
  {q:"Days in a leap year?",a:["364","365","366","367"],c:2}
];
micro({
  id:"triviaGame",title:"Trivia Duel",desc:"First correct answer wins the point.",
  cat:"brain",key:"trivia",win:5,
  controls:"P1: 1/2/3/4 pick answer　 P2: 7/8/9/0 pick answer — wrong answers lock you out for 2s",
  round(g){
    g.q=TRIVIA[ri(0,TRIVIA.length-1)];
    g.lock=[0,0];
    g.reveal=null;
  },
  update(g,dt){
    g.lock[0]=Math.max(0,g.lock[0]-dt);
    g.lock[1]=Math.max(0,g.lock[1]-dt);
    if(g.reveal!==null)return;
    if(g.lock[0]<=0){
      for(let k=0;k<4;k++){
        if(g.pk[String(k+1)]){
          if(k===g.q.c){g.reveal="p1";g.point(0,"CORRECT!");return;}
          g.lock[0]=2;FX.tone(120,.2,"sawtooth",.04);
        }
      }
    }
    if(g.lock[1]<=0){
      for(let k=0;k<4;k++){
        const key=String((k+7)%10);
        if(g.pk[key]){
          if(k===g.q.c){g.reveal="p2";g.point(1,"CORRECT!");return;}
          g.lock[1]=2;FX.tone(120,.2,"sawtooth",.04);
        }
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
    g.text(g.q.q,W/2,100,34,"#fff","center");
    const positions=[
      {x:200,y:220},{x:450,y:220},{x:200,y:340},{x:450,y:340}
    ];
    const p1Keys=["1","2","3","4"];
    const p2Keys=["7","8","9","0"];
    g.q.a.forEach((ans,k)=>{
      const p=positions[k];
      ctx.fillStyle="#2a2f63";
      ctx.fillRect(p.x-110,p.y-45,220,90);
      ctx.strokeStyle=GOLD;ctx.lineWidth=3;
      ctx.strokeRect(p.x-110,p.y-45,220,90);
      g.text(ans,p.x,p.y+10,26,"#fff","center");
      ctx.fillStyle=C1;ctx.fillRect(p.x-100,p.y-38,22,22);
      g.text(p1Keys[k],p.x-89,p.y-20,14,"#080b18","center");
      ctx.fillStyle=C2;ctx.fillRect(p.x+78,p.y-38,22,22);
      g.text(p2Keys[k],p.x+89,p.y-20,14,"#080b18","center");
    });
    if(g.lock[0]>0)g.text("P1 LOCKED "+g.lock[0].toFixed(1),225,460,16,RED,"center");
    if(g.lock[1]>0)g.text("P2 LOCKED "+g.lock[1].toFixed(1),675,460,16,RED,"center");
  }
});

/* ---------- PINBALL DUEL ---------- */
function pinMakeBall(i){
  return {x:i*450+225,y:80,vx:rnd(-80,80),vy:rnd(50,120),r:8};
}
micro({
  id:"pinballGame",title:"Pinball Duel",desc:"Flipper battle. Highest score in 30s wins.",
  cat:"arcade",key:"pinball",win:3,
  controls:"P1: A=left flipper, D=right flipper　 P2: ← left, → right — 30 seconds, most points wins",
  round(g){
    g.tl=30;
    g.pl=[{score:0,ball:pinMakeBall(0)},{score:0,ball:pinMakeBall(1)}];
    g.bumpers=[];
    for(let i=0;i<2;i++){
      g.bumpers.push([
        {x:i*450+150,y:140,r:26},
        {x:i*450+300,y:140,r:26},
        {x:i*450+225,y:230,r:22},
        {x:i*450+110,y:290,r:20},
        {x:i*450+340,y:290,r:20}
      ]);
    }
  },
  update(g,dt){
    g.tl-=dt;
    if(g.tl<=0){
      if(g.pl[0].score>g.pl[1].score)g.point(0,"HIGH SCORE");
      else if(g.pl[1].score>g.pl[0].score)g.point(1,"HIGH SCORE");
      else g.next("TIE");
      return;
    }
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      const off=i*450;
      const b=p.ball;
      if(!b)return;
      b.vy+=400*dt;
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.x<b.r+off+22){b.x=b.r+off+22;b.vx=Math.abs(b.vx)*.85;}
      if(b.x>off+428-b.r){b.x=off+428-b.r;b.vx=-Math.abs(b.vx)*.85;}
      if(b.y<b.r+28){b.y=b.r+28;b.vy=Math.abs(b.vy)*.85;}
      for(const bump of g.bumpers[i]){
        const d=Math.hypot(b.x-bump.x,b.y-bump.y);
        if(d<b.r+bump.r){
          const nx=(b.x-bump.x)/d,ny=(b.y-bump.y)/d;
          b.x=bump.x+nx*(b.r+bump.r);
          b.y=bump.y+ny*(b.r+bump.r);
          const sp=Math.max(240,Math.hypot(b.vx,b.vy));
          b.vx=nx*sp;b.vy=ny*sp;
          p.score+=10;
          FX.tone(800,.04,"square",.02);
        }
      }
      if(b.y>430 && b.y<455){
        if(I.pl && b.x>=off+80 && b.x<=off+220){
          b.vy=-430;b.vx+=(b.x-(off+150))*3;
          p.score+=5;FX.tone(600,.05,"square",.03);
        }
        if(I.pr && b.x>=off+230 && b.x<=off+370){
          b.vy=-430;b.vx-=(b.x-(off+300))*3;
          p.score+=5;FX.tone(600,.05,"square",.03);
        }
      }
      if(b.y>H+20){
        p.ball=pinMakeBall(i);
        FX.tone(200,.2,"sawtooth",.04,-40);
      }
    });
  },
  draw(g,ctx){
    ctx.fillStyle="#0a0a20";ctx.fillRect(0,0,W,H);
    for(let i=0;i<2;i++){
      const off=i*450;
      ctx.fillStyle=i?"#2a1a3a":"#1a1a3a";ctx.fillRect(off,0,450,H);
      ctx.fillStyle="#5a4a6a";
      ctx.fillRect(off+15,20,6,H-20);
      ctx.fillRect(off+428,20,6,H-20);
      ctx.fillRect(off+15,20,420,6);
      g.bumpers[i].forEach(bump=>{
        ctx.fillStyle=GOLD;
        ctx.beginPath();ctx.arc(bump.x,bump.y,bump.r,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
        ctx.fillStyle="rgba(255,255,255,.5)";
        ctx.beginPath();ctx.arc(bump.x-bump.r*.3,bump.y-bump.r*.3,bump.r*.3,0,Math.PI*2);ctx.fill();
      });
      const I=g.I[i];
      ctx.fillStyle=col(i);
      ctx.save();ctx.translate(off+150,445);ctx.rotate(I.pl?-0.4:0.2);
      ctx.fillRect(-70,-8,140,16);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(-70,-8,140,16);
      ctx.restore();
      ctx.save();ctx.translate(off+300,445);ctx.rotate(I.pr?0.4:-0.2);
      ctx.fillRect(-70,-8,140,16);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(-70,-8,140,16);
      ctx.restore();
      const b=g.pl[i].ball;
      if(b){
        ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.stroke();
      }
      g.text("SCORE: "+g.pl[i].score,off+25,48,16,col(i));
      g.text(Math.max(0,Math.ceil(g.tl))+"s",off+225,22,16,GOLD,"center");
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* ---------- ASTEROIDS DUEL ---------- */
micro({
  id:"asteroidsGame",title:"Asteroids Duel",desc:"Classic shooter. 15 kills wins.",
  cat:"arcade",key:"asteroids",win:3,
  controls:"P1: A/D move, SPACE fire　 P2: ←/→, ENTER — split screen, avoid asteroid hits",
  round(g){
    g.pl=[
      {x:225,y:440,cd:0,kills:0,hp:3},
      {x:675,y:440,cd:0,kills:0,hp:3}
    ];
    g.asteroids=[[],[]];
    g.bullets=[[],[]];
    g.spawnT=[1.5,1.5];
    g.rng=[seeded(ri(1,1e6)),seeded(ri(1,1e6))];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      const off=i*450;
      p.cd=Math.max(0,p.cd-dt);
      if(I.l)p.x-=280*dt;
      if(I.r)p.x+=280*dt;
      p.x=cl(p.x,off+20,off+430);
      if(I.a&&p.cd<=0){
        p.cd=.25;
        g.bullets[i].push({x:p.x,y:p.y-15,vy:-500});
        FX.tone(700,.05,"square",.03);
      }
    });
    g.spawnT.forEach((t,i)=>{g.spawnT[i]-=dt;});
    for(let i=0;i<2;i++){
      if(g.spawnT[i]<=0&&g.asteroids[i].length<6){
        g.spawnT[i]=Math.max(.6,2-g.t*.03);
        const off=i*450;
        g.asteroids[i].push({
          x:off+50+g.rng[i]()*350,
          y:20,
          vx:rnd(-90,90),
          vy:rnd(60,130),
          r:14+g.rng[i]()*10,
          hp:2
        });
      }
      const off=i*450;
      g.asteroids[i].forEach(a=>{
        a.x+=a.vx*dt;a.y+=a.vy*dt;
        if(a.x<a.r+off+15){a.x=a.r+off+15;a.vx=Math.abs(a.vx);}
        if(a.x>off+435-a.r){a.x=off+435-a.r;a.vx=-Math.abs(a.vx);}
        const p=g.pl[i];
        if(Math.hypot(a.x-p.x,a.y-p.y)<a.r+14){
          p.hp--;a.dead=true;
          g.burst(a.x,a.y,col(i),14,300);FX.playBoom();
          if(p.hp<=0){g.point(1-i,"SHOT DOWN");return;}
        }
        if(a.y>H+20)a.dead=true;
      });
      g.asteroids[i]=g.asteroids[i].filter(a=>!a.dead);
      g.bullets[i].forEach(b=>{
        b.y+=b.vy*dt;
        if(b.y<0)b.dead=true;
        for(const a of g.asteroids[i]){
          if(!a.dead&&Math.hypot(b.x-a.x,b.y-a.y)<a.r+5){
            a.hp--;b.dead=true;
            g.burst(a.x,a.y,col(i),6,160);
            FX.tone(500,.04,"square",.03);
            if(a.hp<=0){a.dead=true;g.pl[i].kills++;FX.tone(700,.06,"square",.05);}
            break;
          }
        }
      });
      g.bullets[i]=g.bullets[i].filter(b=>!b.dead);
    }
    if(g.pl[0].kills>=15)g.point(0,"15 KILLS");
    else if(g.pl[1].kills>=15)g.point(1,"15 KILLS");
  },
  draw(g,ctx){
    for(let i=0;i<2;i++){
      const off=i*450;
      ctx.fillStyle=i?"#1a0d2a":"#0b1030";ctx.fillRect(off,0,450,H);
      for(let k=0;k<30;k++){
        ctx.fillStyle="#4c5d99";
        ctx.fillRect(off+(k*97)%450,(k*61)%H,2,2);
      }
      g.asteroids[i].forEach(a=>{
        ctx.fillStyle=a.hp===2?"#8a6a5a":"#a87868";
        ctx.beginPath();
        for(let k=0;k<6;k++){
          const ang=k*Math.PI/3;
          const r2=a.r*(.8+Math.sin(k*3.1)*.2);
          ctx[k?"lineTo":"moveTo"](a.x+Math.cos(ang)*r2,a.y+Math.sin(ang)*r2);
        }
        ctx.closePath();ctx.fill();
        ctx.strokeStyle="#5a4238";ctx.lineWidth=2;ctx.stroke();
      });
      g.bullets[i].forEach(b=>{
        ctx.fillStyle=GOLD;
        ctx.fillRect(b.x-2,b.y-8,4,12);
      });
      const p=g.pl[i];
      ctx.fillStyle=col(i);
      ctx.beginPath();
      ctx.moveTo(p.x,p.y-16);
      ctx.lineTo(p.x+16,p.y+16);
      ctx.lineTo(p.x-16,p.y+16);
      ctx.closePath();ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
      g.text("KILLS: "+p.kills,off+20,30,14,col(i));
      g.text("♥".repeat(Math.max(0,p.hp)),off+20,55,14,RED);
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* ---------- COPTER RACE ---------- */
micro({
  id:"copterGame",title:"Copter Race",desc:"One-button helicopter. Dodge the cave.",
  cat:"reflex",key:"copter",win:3,
  controls:"P1: hold SPACE to rise　 P2: hold ENTER — split screen, first to finish wins",
  round(g){
    g.pl=[
      {y:250,vy:0,dist:0},
      {y:250,vy:0,dist:0}
    ];
    g.track=[];
    let y=250;
    for(let x=250;x<3000;x+=180){
      y=cl(y+rnd(-60,60),110,390);
      g.track.push({x,y,gap:130});
    }
  },
  update(g,dt){
    const speed=210;
    let winner=-1;
    g.pl.forEach((p,i)=>{
      const I=g.I[i];
      if(I.a)p.vy-=620*dt;
      p.vy+=900*dt;
      p.vy=cl(p.vy,-320,420);
      p.y+=p.vy*dt;
      p.dist+=speed*dt;
      if(p.y<30||p.y>H-30){
        if(winner<0){g.burst(i*450+150,p.y,col(i),15,300);FX.playBoom();winner=1-i;}
      }
      for(const t of g.track){
        if(Math.abs(p.dist-t.x)<10){
          if(p.y<t.y-t.gap/2||p.y>t.y+t.gap/2){
            if(winner<0){g.burst(i*450+150,p.y,col(i),15,300);FX.playBoom();winner=1-i;}
          }
        }
      }
      if(p.dist>2900&&winner<0)winner=i;
    });
    if(winner>=0)g.point(winner,"FINISHED!");
  },
  draw(g,ctx){
    for(let i=0;i<2;i++){
      const off=i*450;
      const p=g.pl[i];
      ctx.fillStyle=i?"#1a2a3a":"#0a1a3a";ctx.fillRect(off,0,450,H);
      const camX=p.dist-150;
      g.track.forEach(t=>{
        const sx=off+t.x-camX;
        if(sx>=-30&&sx<=480){
        ctx.fillStyle="#5a3a2a";
        ctx.fillRect(sx,0,8,t.y-t.gap/2);
        ctx.fillRect(sx,t.y+t.gap/2,8,H);
        ctx.fillStyle="#7a5a3a";
        ctx.fillRect(sx,0,8,3);
        ctx.fillRect(sx,t.y+t.gap/2,8,3);
        }
      });
      ctx.fillStyle=col(i);
      ctx.fillRect(off+150-15,p.y-8,30,16);
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(off+150-15,p.y-8,30,16);
      ctx.fillStyle=GOLD;
      const rot=Math.sin(g.t*30)*6;
      ctx.fillRect(off+150-20+rot,p.y-16,40,4);
      ctx.fillStyle="#fff";
      ctx.beginPath();ctx.arc(off+150+8,p.y,5,0,Math.PI*2);ctx.fill();
      g.text("P"+(i+1)+" "+Math.round(p.dist/29)+"%",off+225,20,14,col(i),"center");
      ctx.fillStyle="#080b18";ctx.fillRect(off+150,42,150,6);
      ctx.fillStyle=col(i);ctx.fillRect(off+152,44,146*Math.min(1,p.dist/2900),2);
    }
    ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
  }
});

/* ---------- WHEEL SPIN ---------- */
const WHEEL=[5,10,15,20,25,30,-10,50];
micro({
  id:"wheelGame",title:"Wheel Spin",desc:"Spin the wheel. Reach 100 first.",
  cat:"arcade",key:"wheel",win:1,hud:false,
  controls:"SPACE / ENTER — spin your wheel on your turn. Land on a segment to add its value. First to 100 wins.",
  round(g){
    g.pl=[
      {score:0,ang:0,spinV:0,spinning:false},
      {score:0,ang:0,spinV:0,spinning:false}
    ];
    g.turn=0;
    g.result=[0,0];
  },
  update(g,dt){
    g.pl.forEach((p,i)=>{
      if(!p.spinning)return;
      p.ang+=p.spinV*dt;
      p.spinV*=Math.pow(.35,dt);
      if(Math.abs(p.spinV)<0.6){
        p.spinning=false;
        const n=WHEEL.length;
        const norm=((p.ang%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
        const pointerAng=-Math.PI/2;
        const diff=((pointerAng-norm)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
        const seg=Math.floor(diff/(Math.PI*2/n))%n;
        const val=WHEEL[seg];
        p.score=Math.max(0,p.score+val);
        g.result[i]=val;
        FX.tone(val>0?800:150,.15,"square",.05);
        if(val>0)g.burst(i?675:225,200,GOLD,15,300);
        g.turn=1-g.turn;
        if(p.score>=100){g.end(i);return;}
      }
    });
    if(!g.pl[g.turn].spinning && g.I[g.turn].pa){
      g.pl[g.turn].spinning=true;
      g.pl[g.turn].spinV=9+Math.random()*6;
      g.result[g.turn]=0;
      FX.tone(400,.1,"triangle",.03);
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
    [0,1].forEach(i=>{
      const cx=i?675:225,cy=220;
      const p=g.pl[i];
      const n=WHEEL.length;
      for(let k=0;k<n;k++){
        const a1=p.ang+k*Math.PI*2/n;
        const a2=a1+Math.PI*2/n;
        ctx.fillStyle=WHEEL[k]>0?(k%2?GOLD:"#ffe87a"):RED;
        ctx.beginPath();
        ctx.moveTo(cx,cy);
        ctx.arc(cx,cy,95,a1,a2);
        ctx.closePath();ctx.fill();
        ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
        const ma=(a1+a2)/2;
        const tx=cx+Math.cos(ma)*65,ty=cy+Math.sin(ma)*65;
        g.text(String(WHEEL[k]),tx,ty+6,16,"#080b18","center");
      }
      ctx.fillStyle="#fff";
      ctx.beginPath();ctx.moveTo(cx,cy-115);ctx.lineTo(cx-12,cy-105);ctx.lineTo(cx+12,cy-105);ctx.fill();
      ctx.fillStyle="#111";ctx.beginPath();ctx.arc(cx,cy,15,0,Math.PI*2);ctx.fill();
      g.text("P"+(i+1)+"  SCORE: "+p.score,cx,360,20,col(i),"center");
      if(g.result[i]!==0)g.text((g.result[i]>0?"+":"")+g.result[i],cx,390,22,g.result[i]>0?GREEN:RED,"center");
      if(g.turn===i&&!p.spinning)g.text("SPACE / ENTER TO SPIN",cx,415,14,col(i),"center");
    });
    g.text("FIRST TO 100",W/2,30,18,GOLD,"center");
  }
});

/* ---------- HANGMAN DUEL ---------- */
const HANG_WORDS=["PUZZLE","ARENA","GAMING","SIMPLE","ROCKET","PLANET","CASTLE","BRIDGE","FOREST","DRAGON","KNIGHT","GUITAR","TIGER","PILOT","CIRCUS","FALCON"];
const ALPHA="abcdefghijklmnopqrstuvwxyz".split("");
micro({
  id:"hangmanGame",title:"Hangman Duel",desc:"Guess letters. Complete the word first.",
  cat:"brain",key:"hangman",win:3,
  controls:"Alternating turns — type letters on your turn. Correct = keep turn. 6 wrong = you lose the round.",
  round(g){
    g.word=HANG_WORDS[ri(0,HANG_WORDS.length-1)];
    g.guessed=[];
    g.wrong=[0,0];
    g.turn=0;
  },
  update(g,dt){
    const pressed=Object.keys(g.pk);
    let letter=null;
    for(const k of pressed){
      const lk=k.toLowerCase();
      if(ALPHA.includes(lk)&&!g.guessed.includes(lk.toUpperCase())){
        letter=lk.toUpperCase();
        break;
      }
    }
    if(!letter)return;
    g.guessed.push(letter);
    if(g.word.includes(letter)){
      FX.tone(800,.1,"square",.04);
      if(g.word.split("").every(l=>g.guessed.includes(l))){
        g.point(g.turn,"SOLVED!");
        return;
      }
    }else{
      g.wrong[g.turn]++;
      FX.tone(150,.15,"sawtooth",.04,-60);
      if(g.wrong[g.turn]>=6){
        g.point(1-g.turn,"HUNG!");
        return;
      }
      g.turn=1-g.turn;
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
    const display=g.word.split("").map(c=>g.guessed.includes(c)?c:"_").join(" ");
    g.text(display,W/2,100,42,GOLD,"center");
    [0,1].forEach(i=>{
      const cx=i?675:225;
      ctx.strokeStyle=col(i);ctx.lineWidth=3;
      ctx.beginPath();
      ctx.moveTo(cx-50,380);
      ctx.lineTo(cx-50,160);
      ctx.lineTo(cx+10,160);
      ctx.lineTo(cx+10,180);
      ctx.stroke();
      const wrong=g.wrong[i];
      if(wrong>=1){ctx.beginPath();ctx.arc(cx+10,200,18,0,Math.PI*2);ctx.stroke();}
      if(wrong>=2){ctx.beginPath();ctx.moveTo(cx+10,218);ctx.lineTo(cx+10,300);ctx.stroke();}
      if(wrong>=3){ctx.beginPath();ctx.moveTo(cx+10,240);ctx.lineTo(cx-20,270);ctx.stroke();}
      if(wrong>=4){ctx.beginPath();ctx.moveTo(cx+10,240);ctx.lineTo(cx+40,270);ctx.stroke();}
      if(wrong>=5){ctx.beginPath();ctx.moveTo(cx+10,300);ctx.lineTo(cx-15,350);ctx.stroke();}
      if(wrong>=6){ctx.beginPath();ctx.moveTo(cx+10,300);ctx.lineTo(cx+35,350);ctx.stroke();}
      g.text("P"+(i+1)+" WRONG: "+wrong+"/6",cx,415,16,col(i),"center");
    });
    const guessedStr=g.guessed.length?g.guessed.join(" "):"—";
    g.text("GUESSED: "+guessedStr,W/2,455,14,"#9fc0ff","center");
    g.text("P"+(g.turn+1)+"'S TURN — TYPE A LETTER",W/2,40,18,col(g.turn),"center");
  }
});

})();