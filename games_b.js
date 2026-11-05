/* =====================================================
   GAME PACK B — 10 games
   Flappy Duel, Beat Tap, Archery, Dead Center,
   Red Light Green Light, Rocket Launch, Rock Paper Scissors,
   Penalty Kicks, Balloon Pop, Snake Feast
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;

/* ---------- 11. FLAPPY DUEL ---------- */
micro({id:"flappyGame",title:"Flappy Duel",desc:"Two birds, one pipe course",cat:"reflex",key:"flappy",win:3,
controls:"P1: SPACE flap　 P2: ENTER flap — first crash loses the round",
round(g){
g.rng=seeded(ri(1,1e6));g.dist=0;g.pipes=[];g.lastX=420;
g.b=[{y:250,vy:0,go:false,n:0},{y:250,vy:0,go:false,n:0}];
},
update(g,dt){
g.dist+=175*dt;
while(g.lastX<g.dist+500){g.lastX+=230;g.pipes.push({x:g.lastX,gy:110+g.rng()*280});}
g.pipes=g.pipes.filter(p=>p.x>g.dist-120);
const dead=[false,false];
g.b.forEach((b,i)=>{
if(g.I[i].pa){b.go=true;b.vy=-400;FX.tone(500,.07,"square",.03,200);}
if(b.go){b.vy+=1300*dt;b.y+=b.vy*dt;}else b.y=250+Math.sin(g.t*6)*6;
if(b.y<8||b.y>H-8)dead[i]=true;
for(const p of g.pipes){
const sx=p.x-g.dist;
if(sx<110+12&&sx+60>110-12&&(b.y-11<p.gy-75||b.y+11>p.gy+75))dead[i]=true;
if(!p.passed&&sx+60<98){p.passed=true;}
}
});
if(dead[0]&&dead[1])g.next("BOTH CRASHED");
else if(dead[0]){g.burst(110,g.b[0].y,C1,20,300);g.point(1);}
else if(dead[1]){g.burst(560,g.b[1].y,C2,20,300);g.point(0);}
},
draw(g,ctx){
for(let i=0;i<2;i++){
const off=i*450;
ctx.save();ctx.beginPath();ctx.rect(off,0,450,H);ctx.clip();
ctx.fillStyle=i?"#4a3a8a":"#3a7ac8";ctx.fillRect(off,0,450,H);
ctx.fillStyle="rgba(255,255,255,.35)";for(let k=0;k<4;k++){ctx.fillRect(off+((k*170-g.dist*.3)%520+520)%520-40,60+k*55,90,22);}
ctx.fillStyle="#5aa04a";ctx.fillRect(off,H-18,450,18);
for(const p of g.pipes){
const sx=p.x-g.dist+off;if(sx>off+450||sx<off-70)continue;
ctx.fillStyle="#3ac060";ctx.fillRect(sx,0,60,p.gy-75);ctx.fillRect(sx,p.gy+75,60,H);
ctx.fillStyle="#2a9048";ctx.fillRect(sx-4,p.gy-95,68,20);ctx.fillRect(sx-4,p.gy+75,68,20);
ctx.fillStyle="rgba(255,255,255,.3)";ctx.fillRect(sx+6,0,8,p.gy-95);ctx.fillRect(sx+6,p.gy+95,8,H);
ctx.strokeStyle="#0d3a1f";ctx.lineWidth=2;ctx.strokeRect(sx,0,60,p.gy-75);ctx.strokeRect(sx,p.gy+75,60,H);
}
const b=g.b[i],bx=off+110;
ctx.save();ctx.translate(bx,b.y);ctx.rotate(clamp(b.vy/700,-.5,.9));
ctx.fillStyle=col(i);ctx.fillRect(-13,-11,26,22);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(-13,-11,26,22);
ctx.fillStyle="#fff";ctx.fillRect(3,-8,9,9);ctx.fillStyle="#11152b";ctx.fillRect(8,-5,4,4);
ctx.fillStyle=GOLD;ctx.fillRect(12,0,9,6);
const wing=Math.sin(g.t*18)*5;ctx.fillStyle="rgba(255,255,255,.8)";ctx.fillRect(-10,1+wing*.3,12,6);
ctx.restore();
ctx.restore();
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* ---------- 12. BEAT TAP ---------- */
micro({id:"beatGame",title:"Beat Tap",desc:"Tap on the beat. Best timing wins.",cat:"reflex",key:"beat",win:1,hud:false,
controls:"P1: SPACE　 P2: ENTER — tap when a note reaches the line",
init(g){
const r=seeded(ri(1,1e6));g.notes=[];let t=2;
for(let i=0;i<26;i++){t+=.42+r()*.4;g.notes.push({t,h:[false,false],m:[false,false]});}
g.sc=[0,0];g.combo=[0,0];g.fb=["",""];g.fbT=[0,0];g.clk=0;
},
update(g,dt){
g.clk+=dt;
for(let i=0;i<2;i++){
g.fbT[i]-=dt;
if(g.I[i].pa){
let best=null;
for(const n of g.notes)if(!n.h[i]&&!n.m[i]&&Math.abs(n.t-g.clk)<.22&&(!best||Math.abs(n.t-g.clk)<Math.abs(best.t-g.clk)))best=n;
if(best){
const e=Math.abs(best.t-g.clk);best.h[i]=true;
const perfect=e<.08;g.sc[i]+=perfect?2:1;g.combo[i]++;
g.fb[i]=perfect?"PERFECT!":"GOOD";g.fbT[i]=.5;
g.burst(i?675:225,400,col(i),8,200);FX.tone(perfect?880:660,.06,"square",.04);
}else{g.combo[i]=0;g.fb[i]="MISS";g.fbT[i]=.4;}
}
for(const n of g.notes)if(!n.h[i]&&!n.m[i]&&g.clk>n.t+.22){n.m[i]=true;g.combo[i]=0;}
}
if(g.clk>g.notes[g.notes.length-1].t+.8)g.byScore(g.sc);
},
draw(g,ctx){
ctx.fillStyle="#0d0a22";ctx.fillRect(0,0,W,H);
for(let i=0;i<2;i++){
const cx=i?675:225;
ctx.fillStyle=i?"#1c1038":"#0f1a3a";ctx.fillRect(cx-70,0,140,H);
ctx.strokeStyle=col(i);ctx.lineWidth=2;ctx.strokeRect(cx-70,0,140,H);
ctx.fillStyle=col(i);ctx.globalAlpha=.25+.25*Math.sin(g.clk*Math.PI*2*2.2);ctx.fillRect(cx-70,392,140,16);ctx.globalAlpha=1;
ctx.fillStyle="#fff";ctx.fillRect(cx-70,398,140,4);
for(const n of g.notes){
if(n.h[i])continue;
const y=400-(n.t-g.clk)*300;
if(y<-30||y>H+30)continue;
ctx.fillStyle=n.m[i]?"#444":col(i);ctx.fillRect(cx-40,y-14,80,28);
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(cx-40,y-14,80,28);
ctx.fillStyle="rgba(255,255,255,.4)";ctx.fillRect(cx-36,y-12,72,5);
}
g.text("P"+(i+1)+" "+g.sc[i],cx,34,22,col(i),"center");
g.text("COMBO "+g.combo[i],cx,62,14,GOLD,"center");
if(g.fbT[i]>0)g.text(g.fb[i],cx,360,24,g.fb[i]==="MISS"?RED:GREEN,"center");
}
}
});

/* ---------- 13. ARCHERY ---------- */
micro({id:"archeryGame",title:"Archery",desc:"Five arrows each. Closest to gold wins.",cat:"reflex",key:"archery",win:1,hud:false,
controls:"P1: SPACE shoot　 P2: ENTER shoot — time the swaying crosshair",
init(g){g.sc=[0,0];g.arrows=[[],[]];g.cd=[0,0];g.endT=0;g.lastPts=["",""];g.tl=0;
g.cross=i=>{const n=g.arrows[i].length,a=95,f=1.5+n*.38;return{x:(i?675:225)+Math.sin(g.t*f+i)*a,y:250+Math.sin(g.t*f*1.31+i*2)*a*.9};};
},
update(g,dt){
for(let i=0;i<2;i++){
g.cd[i]-=dt;
const n=g.arrows[i].length;
if(n<5&&g.cd[i]<=0&&g.I[i].pa){
const c=g.cross(i);
const x=c.x+rnd(-3,3),y=c.y+rnd(-3,3),d=Math.hypot(x-(i?675:225),y-250);
const pts=Math.max(0,10-Math.floor(d/10));
g.arrows[i].push({x,y,pts});g.sc[i]+=pts;g.cd[i]=.6;g.lastPts[i]=pts+(pts===10?" BULLSEYE!":"");
g.burst(x,y,pts>=9?GOLD:"#fff",8,160);FX.tone(260,.12,"sawtooth",.05,-120);
}
}
g.tl+=dt;
if((g.arrows[0].length===5&&g.arrows[1].length===5)||g.tl>25){g.endT+=dt;if(g.endT>1.2)g.byScore(g.sc);}
},
draw(g,ctx){
ctx.fillStyle="#2a5a3a";ctx.fillRect(0,0,W,H);
ctx.fillStyle="#244d32";for(let x=0;x<W;x+=60)ctx.fillRect(x,0,30,H);
for(let i=0;i<2;i++){
const cx=i?675:225;
ctx.fillStyle="#5a3a1a";ctx.fillRect(cx-6,330,12,170);
const cols=["#fff","#111","#4aa8ff","#ff4a4a",GOLD];
for(let k=0;k<5;k++){ctx.fillStyle=cols[4-k];ctx.beginPath();ctx.arc(cx,250,100-k*20,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=1;ctx.stroke();}
g.arrows[i].forEach(a=>{ctx.strokeStyle="#c8a46a";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x-12,a.y+12);ctx.stroke();ctx.fillStyle=col(i);ctx.fillRect(a.x-16,a.y+9,7,7);});
if(g.arrows[i].length<5){
const c=g.cross(i);
ctx.strokeStyle=col(i);ctx.lineWidth=3;ctx.beginPath();ctx.arc(c.x,c.y,13,0,Math.PI*2);ctx.moveTo(c.x-20,c.y);ctx.lineTo(c.x+20,c.y);ctx.moveTo(c.x,c.y-20);ctx.lineTo(c.x,c.y+20);ctx.stroke();
}
g.text("P"+(i+1)+"  "+g.sc[i],cx,34,22,col(i),"center");
g.text(g.arrows[i].length+"/5 arrows",cx,58,14,"#fff","center");
if(g.lastPts[i])g.text("+"+g.lastPts[i],cx,420,18,GOLD,"center");
}
}
});

/* ---------- 14. DEAD CENTER ---------- */
micro({id:"centerGame",title:"Dead Center",desc:"Stop the marker on the line. Five rounds.",cat:"reflex",key:"center",win:1,hud:false,
controls:"P1: SPACE stop　 P2: ENTER stop — lowest total error wins",
init(g){g.rd=0;g.err=[0,0];g.stage="play";g.stT=0;g.mk=[0,0];g.stopped=[null,null];g.ph=[rnd(0,6),rnd(0,6)];g.rt=0;},
update(g,dt){
if(g.stage==="show"){g.stT-=dt;if(g.stT<=0){g.rd++;if(g.rd>=5){g.byScore([g.err[1],g.err[0]]);return;}g.stage="play";g.stopped=[null,null];g.ph=[rnd(0,6),rnd(0,6)];g.rt=0;}return;}
g.rt+=dt;
const sp=2.2+g.rd*.7;
for(let i=0;i<2;i++){
if(g.stopped[i]===null){
const m=Math.sin(g.rt*sp*2+g.ph[i]);g.mk[i]=m;
if(g.I[i].pa||g.rt>7){g.stopped[i]=m*160;g.err[i]+=Math.abs(m*160);FX.tone(400,.1,"square",.05);g.burst(i?675:225,250+m*160,col(i),10,200);}
}
}
if(g.stopped[0]!==null&&g.stopped[1]!==null){g.stage="show";g.stT=1.5;}
},
draw(g,ctx){
ctx.fillStyle="#11152e";ctx.fillRect(0,0,W,H);
g.text("ROUND "+Math.min(5,g.rd+1)+" / 5",W/2,34,22,GOLD,"center");
for(let i=0;i<2;i++){
const cx=i?675:225;
ctx.fillStyle="#1d2550";ctx.fillRect(cx-30,80,60,340);ctx.strokeStyle=col(i);ctx.lineWidth=3;ctx.strokeRect(cx-30,80,60,340);
ctx.fillStyle=GREEN;ctx.fillRect(cx-40,246,80,8);
ctx.fillStyle="rgba(99,245,154,.2)";ctx.fillRect(cx-30,230,60,40);
const v=g.stopped[i]!==null?g.stopped[i]:(g.mk[i]||0)*160;
ctx.fillStyle=col(i);ctx.fillRect(cx-44,250+v-6,88,12);ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.strokeRect(cx-44,250+v-6,88,12);
g.text("P"+(i+1),cx,70,22,col(i),"center");
g.text("ERROR "+Math.round(g.err[i]),cx,450,18,"#fff","center");
if(g.stopped[i]!==null)g.text(Math.abs(Math.round(g.stopped[i]))+"px off",cx,476,16,Math.abs(g.stopped[i])<12?GREEN:GOLD,"center");
}
}
});

/* ---------- 15. RED LIGHT GREEN LIGHT ---------- */
micro({id:"lightGame",title:"Red Light Green Light",desc:"Run on green. Freeze on red.",cat:"reflex",key:"light",win:3,
controls:"P1: hold SPACE to run　 P2: hold ENTER to run — moving on red sends you back",
round(g){g.pos=[0,0];g.light="green";g.lt=rnd(1.5,3);g.grace=[0,0];g.hit=[0,0];},
update(g,dt){
g.lt-=dt;
if(g.lt<=0){
if(g.light==="green"){g.light="yellow";g.lt=.55;}
else if(g.light==="yellow"){g.light="red";g.lt=rnd(1,2.2);FX.tone(200,.25,"sawtooth",.05,-80);}
else{g.light="green";g.lt=rnd(1.4,3);FX.tone(700,.12,"square",.04,300);}
}
for(let i=0;i<2;i++){
g.hit[i]=Math.max(0,g.hit[i]-dt);
const run=g.I[i].a&&g.hit[i]<=0;
if(g.light==="red"){
if(run){g.grace[i]+=dt;if(g.grace[i]>.2){g.pos[i]=0;g.hit[i]=.9;g.grace[i]=0;g.burst(120+g.pos[i]*680,i?390:160,RED,14,300);FX.playBoom();}}
else g.grace[i]=0;
}else{g.grace[i]=0;if(run)g.pos[i]=Math.min(1,g.pos[i]+.115*dt);}
}
if(g.pos[0]>=1&&g.pos[1]>=1)g.next("PHOTO FINISH");
else if(g.pos[0]>=1)g.point(0);
else if(g.pos[1]>=1)g.point(1);
},
draw(g,ctx){
ctx.fillStyle="#0e1426";ctx.fillRect(0,0,W,H);
for(let i=0;i<2;i++){
const ty=i?300:105;
ctx.fillStyle=i?"#3a2a4a":"#1f3a5a";ctx.fillRect(0,ty,W,120);
ctx.fillStyle="rgba(255,255,255,.2)";for(let x=0;x<W;x+=60)ctx.fillRect(x,ty+58,30,4);
ctx.fillStyle="#fff";ctx.fillRect(800,ty,10,120);for(let k=0;k<6;k++){ctx.fillStyle=k%2?"#111":"#fff";ctx.fillRect(800,ty+k*20,10,20);}
const x=100+g.pos[i]*680;
ctx.save();ctx.translate(x,ty+46);
ctx.globalAlpha=g.hit[i]>0&&Math.floor(g.hit[i]*14)%2?.4:1;
FX.drawFighter(ctx,26,40,col(i),1,g.I[i].a&&g.light!=="red"&&g.hit[i]<=0,g.hit[i]>0);
ctx.restore();
g.text("P"+(i+1),30,ty+30,20,col(i));
}
ctx.fillStyle="#222";ctx.fillRect(W/2-34,36,68,150);ctx.strokeStyle="#000";ctx.lineWidth=3;ctx.strokeRect(W/2-34,36,68,150);
[["red","#ff2244"],["yellow","#ffd23a"],["green","#2aff6a"]].forEach(([n,c],k)=>{
ctx.fillStyle=g.light===n?c:"#3a3a3a";ctx.beginPath();ctx.arc(W/2,66+k*44,17,0,Math.PI*2);ctx.fill();
});
if(g.light==="red")g.text("FREEZE!",W/2,235,22,RED,"center");
}
});

/* ---------- 16. ROCKET LAUNCH ---------- */
micro({id:"rocketGame",title:"Rocket Launch",desc:"Mash to fuel. First liftoff wins the round.",cat:"reflex",key:"rocket",win:3,
controls:"P1: mash SPACE　 P2: mash ENTER",
round(g){g.fuel=[0,0];g.lift=null;g.liftAt=0;},
update(g,dt){
for(let i=0;i<2;i++){
if(g.I[i].pa){g.fuel[i]=Math.min(100,g.fuel[i]+5.2);FX.tone(200+g.fuel[i]*5,.04,"square",.03);g.burst(i?675:225,400,"#ff8c42",2,120);}
g.fuel[i]=Math.max(0,g.fuel[i]-14*dt);
}
for(let i=0;i<2;i++)if(g.fuel[i]>=100&&!g.lift){g.lift=i;g.liftAt=g.t;FX.playBoom();g.point(i,"LIFTOFF!");break;}
},
draw(g,ctx){
ctx.fillStyle="#0a1030";ctx.fillRect(0,0,W,H);
for(let k=0;k<50;k++){ctx.fillStyle=k%3?"#4c5d99":"#fff";ctx.fillRect((k*83)%W,(k*47)%380,2,2);}
ctx.fillStyle="#2a3a2a";ctx.fillRect(0,430,W,70);
for(let i=0;i<2;i++){
const cx=i?675:225;
let y=0;
if(g.lift===i){const lt=g.t-g.liftAt;y=-lt*lt*220;}
const sh=g.lift===null?Math.sin(g.t*60)*g.fuel[i]*.04:0;
ctx.save();ctx.translate(cx+sh,360+y);
if(g.fuel[i]>10||g.lift===i){ctx.fillStyle=Math.random()<.5?GOLD:"#ff8c42";ctx.beginPath();ctx.moveTo(-14,60);ctx.lineTo(0,60+20+g.fuel[i]*.5+Math.random()*14);ctx.lineTo(14,60);ctx.closePath();ctx.fill();}
ctx.fillStyle="#e6ecff";ctx.fillRect(-16,-30,32,90);ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(-16,-30,32,90);
ctx.fillStyle=col(i);ctx.beginPath();ctx.moveTo(-16,-30);ctx.lineTo(0,-64);ctx.lineTo(16,-30);ctx.closePath();ctx.fill();ctx.stroke();
ctx.fillRect(-28,34,12,26);ctx.fillRect(16,34,12,26);
ctx.fillStyle="#6ac8ff";ctx.beginPath();ctx.arc(0,-6,9,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.restore();
ctx.fillStyle="#080b18";ctx.fillRect(cx-90,458,180,20);ctx.fillStyle=g.fuel[i]>80?GOLD:col(i);ctx.fillRect(cx-88,460,176*g.fuel[i]/100,16);
ctx.strokeStyle="#9fc0ff";ctx.lineWidth=2;ctx.strokeRect(cx-90,458,180,20);
g.text("MASH!",cx,60,20,col(i),"center");
}
}
});

/* ---------- 17. ROCK PAPER SCISSORS ---------- */
micro({id:"rpsGame",title:"Rock Paper Scissors",desc:"Pick in secret, reveal together",cat:"brain",key:"rps",win:3,
controls:"P1: A rock, S paper, D scissors　 P2: LEFT rock, DOWN paper, RIGHT scissors",
round(g){g.ch=[-1,-1];g.rev=null;g.tl=5;},
update(g,dt){
g.tl-=dt;
for(let i=0;i<2;i++){
if(g.ch[i]<0){
const I=g.I[i];
const c=I.pl?0:I.pd?1:I.pr?2:-1;
if(c>=0){g.ch[i]=c;FX.tone(500,.06,"square",.04);}
else if(g.tl<=0)g.ch[i]=ri(0,2);
}
}
if(g.ch[0]>=0&&g.ch[1]>=0){
g.rev=g.ch.slice();
const d=(g.ch[0]-g.ch[1]+3)%3;
FX.tone(300,.2,"triangle",.05,200);
if(d===0)g.next("TIE!");
else g.point(d===1?0:1);
}
},
draw(g,ctx){
ctx.fillStyle="#14102e";ctx.fillRect(0,0,W,H);
const E=["✊","✋","✌️"],N=["ROCK","PAPER","SCISSORS"];
for(let i=0;i<2;i++){
const cx=i?675:225;
ctx.fillStyle=i?"#2a1a4a":"#14305a";ctx.fillRect(cx-150,90,300,300);ctx.strokeStyle=col(i);ctx.lineWidth=4;ctx.strokeRect(cx-150,90,300,300);
g.text("PLAYER "+(i+1),cx,70,24,col(i),"center");
const show=g.rev?g.rev[i]:-1;
ctx.font="150px serif";ctx.textAlign="center";ctx.fillStyle="#fff";
const wob=g.rev?0:Math.sin(g.t*10)*6;
if(show>=0){ctx.fillText(E[show],cx,300);g.text(N[show],cx,360,22,"#fff","center");}
else if(g.ch[i]>=0){g.text("LOCKED IN",cx,250,26,GREEN,"center");}
else{ctx.fillText("✊",cx,300+wob);g.text("CHOOSE...",cx,360,18,"#9fc0ff","center");}
ctx.textAlign="left";
}
if(!g.rev)g.text(String(Math.max(0,Math.ceil(g.tl))),W/2,250,40,GOLD,"center");
else g.text("VS",W/2,250,34,GOLD,"center");
}
});

/* ---------- 18. PENALTY KICKS ---------- */
micro({id:"penaltyGame",title:"Penalty Kicks",desc:"Pick a corner. Guess the keeper.",cat:"sports",key:"penalty",win:3,
controls:"Kicker and keeper pick at the same time. P1: A left, W middle, D right　 P2: ← ↑ →",
init(g){g.kicks=0;},
round(g){
if(g.kicks>=10&&g.score[0]!==g.score[1]){g.end(g.score[0]>g.score[1]?0:1);return;}
g.kicker=g.kicks%2;g.kicks++;g.ch=[-1,-1];g.rv=null;g.rvAt=0;
},
update(g,dt){
for(let i=0;i<2;i++){
if(g.ch[i]<0){const I=g.I[i];const c=I.pl?0:I.pu?1:I.pr?2:-1;if(c>=0){g.ch[i]=c;FX.tone(500,.06,"square",.04);}}
}
if(g.ch[0]>=0&&g.ch[1]>=0){
g.rv={k:g.ch[g.kicker],kp:g.ch[1-g.kicker]};g.rvAt=g.t;
FX.tone(160,.12,"square",.06,-60);
if(g.rv.k===g.rv.kp)g.next("SAVED!",GOLD);
else{g.point(g.kicker,"GOAL!");}
}
},
draw(g,ctx){
g.floor("#2a7a42","#2e8648",50);
ctx.fillStyle="#1f5a32";ctx.fillRect(0,0,W,150);
ctx.fillStyle="rgba(255,255,255,.12)";ctx.fillRect(250,60,400,170);
ctx.strokeStyle="rgba(255,255,255,.35)";ctx.lineWidth=1;for(let x=250;x<=650;x+=20){ctx.beginPath();ctx.moveTo(x,60);ctx.lineTo(x,230);ctx.stroke();}for(let y=60;y<=230;y+=20){ctx.beginPath();ctx.moveTo(250,y);ctx.lineTo(650,y);ctx.stroke();}
ctx.fillStyle="#fff";ctx.fillRect(244,56,12,176);ctx.fillRect(644,56,12,176);ctx.fillRect(244,52,412,10);
const px=[300,450,600],t=g.rv?clamp((g.t-g.rvAt)/.35,0,1):0;
const kx=g.rv?450+(px[g.rv.kp]-450)*Math.min(1,t*1.4):450;
const ky=g.rv?170-Math.sin(Math.min(1,t*1.4)*Math.PI)*20:170;
ctx.fillStyle=col(1-g.kicker);ctx.fillRect(kx-16,ky-10,32,50);ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(kx-16,ky-10,32,50);
ctx.fillStyle="#f3bd83";ctx.fillRect(kx-12,ky-30,24,22);ctx.fillStyle=col(1-g.kicker);ctx.fillRect(kx-40,ky-6+(g.rv?-20*t:0),24,10);ctx.fillRect(kx+16,ky-6+(g.rv?-20*t:0),24,10);
const bx=g.rv?450+(px[g.rv.k]-450)*t:450,by=g.rv?420-(420-150)*t:420;
ctx.fillStyle="rgba(0,0,0,.3)";ctx.beginPath();ctx.ellipse(450,440,14,5,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(bx,by,15-8*t,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle=col(g.kicker);ctx.fillRect(420,435,26,40);ctx.fillStyle="#f3bd83";ctx.fillRect(424,418,18,18);
g.text("P"+(g.kicker+1)+" KICKS",W/2,300,26,col(g.kicker),"center");
for(let i=0;i<2;i++){
const lab=i===g.kicker?"KICKER":"KEEPER";
g.text("P"+(i+1)+" "+lab+(g.ch[i]>=0&&!g.rv?" ✓":""),i?W-30:30,300,16,col(i),i?"right":"left");
}
g.text("KICK "+Math.min(10,g.kicks)+" / 10",W/2,490,14,"#fff","center");
}
});

/* ---------- 19. BALLOON POP ---------- */
micro({id:"balloonGame",title:"Balloon Pop",desc:"Aim your crosshair, pop the balloons",cat:"arcade",key:"balloon",win:1,hud:false,
controls:"P1: W/A/S/D move, SPACE pop　 P2: ARROWS move, ENTER pop — gold = 3, black = -2",
init(g){
g.s=[0,0];g.time=30;g.bl=[];g.spawn=0;
g.cr=[{x:250,y:250,r:14,cd:0,vx:0,vy:0,fx:1,fy:0},{x:650,y:250,r:14,cd:0,vx:0,vy:0,fx:1,fy:0}];
},
update(g,dt){
g.time-=dt;g.spawn-=dt;
if(g.spawn<=0){g.spawn=.33;const r=Math.random();g.bl.push({x:rnd(40,860),y:H+40,vy:rnd(70,150),r:rnd(22,30),type:r<.08?"gold":r<.18?"bomb":"n",c:["#ff4a6a","#4aa8ff","#9be04a","#c04aff","#ff9a3a"][ri(0,4)],ph:rnd(0,6)});}
g.bl.forEach(b=>{b.y-=b.vy*dt;});
g.cr.forEach((c,i)=>{
g.walk(c,i,400,{x0:10,x1:W-10,y0:50,y1:H-10});
c.cd-=dt;
if(g.I[i].pa&&c.cd<=0){
c.cd=.18;
let best=null,bd=1e9;
for(const b of g.bl){if(b.dead)continue;const d=Math.hypot(b.x-c.x,b.y-c.y);if(d<b.r+8&&d<bd){best=b;bd=d;}}
if(best){
best.dead=true;
if(best.type==="bomb"){g.s[i]=Math.max(0,g.s[i]-2);g.burst(best.x,best.y,RED,18,360);FX.playBoom();}
else{g.s[i]+=best.type==="gold"?3:1;g.burst(best.x,best.y,best.type==="gold"?GOLD:best.c,12,260);FX.tone(best.type==="gold"?1200:900,.05,"square",.04,200);}
}else FX.tone(140,.05,"square",.02);
}
});
g.bl=g.bl.filter(b=>!b.dead&&b.y>-60);
if(g.time<=0)g.byScore(g.s);
},
draw(g,ctx){
const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#5ab0ff");gr.addColorStop(1,"#c8e6ff");
ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
ctx.fillStyle="rgba(255,255,255,.6)";for(let k=0;k<4;k++)ctx.fillRect(((k*260+g.t*8)%1100)-100,80+k*70,110,26);
for(const b of g.bl){
const sw=Math.sin(g.t*3+b.ph)*4;
ctx.strokeStyle="rgba(0,0,0,.4)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(b.x+sw,b.y+b.r*1.2);ctx.lineTo(b.x,b.y+b.r*2.6);ctx.stroke();
ctx.fillStyle=b.type==="gold"?GOLD:b.type==="bomb"?"#1b1f3a":b.c;
ctx.beginPath();ctx.ellipse(b.x+sw,b.y,b.r*.86,b.r,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle="rgba(255,255,255,.5)";ctx.fillRect(b.x+sw-b.r*.45,b.y-b.r*.6,5,8);
if(b.type==="bomb")g.text("☠",b.x+sw,b.y+7,18,"#fff","center");
}
g.cr.forEach((c,i)=>{
ctx.strokeStyle=col(i);ctx.lineWidth=3;ctx.beginPath();ctx.arc(c.x,c.y,15,0,Math.PI*2);ctx.moveTo(c.x-24,c.y);ctx.lineTo(c.x+24,c.y);ctx.moveTo(c.x,c.y-24);ctx.lineTo(c.x,c.y+24);ctx.stroke();
ctx.fillStyle=col(i);ctx.fillRect(c.x-2,c.y-2,4,4);
});
g.timedHud(g.s,g.time);
}
});

/* ---------- 20. SNAKE FEAST ---------- */
function dropFood(g){
for(let n=0;n<40;n++){
const f={x:ri(1,28),y:ri(1,14)};
if(!g.sn.some(s=>s.c.some(c=>c.x===f.x&&c.y===f.y))&&!g.food.some(o=>o.x===f.x&&o.y===f.y)){g.food.push(f);return;}
}
}
micro({id:"feastGame",title:"Snake Feast",desc:"Classic snake, head to head",cat:"arcade",key:"feast",win:3,
controls:"P1: W/A/S/D　 P2: ARROWS — first to length 14 scores, crash and your rival scores",
round(g){
g.sn=[
{c:[{x:5,y:8},{x:4,y:8},{x:3,y:8}],d:{x:1,y:0},nd:{x:1,y:0}},
{c:[{x:24,y:8},{x:25,y:8},{x:26,y:8}],d:{x:-1,y:0},nd:{x:-1,y:0}}
];
g.food=[];for(let i=0;i<3;i++)dropFood(g);
g.acc=0;
},
update(g,dt){
g.sn.forEach((s,i)=>{
const I=g.I[i];
const n=I.pl?{x:-1,y:0}:I.pr?{x:1,y:0}:I.pu?{x:0,y:-1}:I.pd?{x:0,y:1}:null;
if(n&&!(n.x===-s.d.x&&n.y===-s.d.y))s.nd=n;
});
g.acc+=dt;
if(g.acc<.105)return;
g.acc=0;
const heads=g.sn.map(s=>{s.d=s.nd;return{x:s.c[0].x+s.d.x,y:s.c[0].y+s.d.y};});
const dead=[false,false];
heads.forEach((h,i)=>{
if(h.x<0||h.x>=30||h.y<0||h.y>=16)dead[i]=true;
g.sn.forEach(s=>s.c.forEach((c,k)=>{if(c.x===h.x&&c.y===h.y&&k<s.c.length-1)dead[i]=true;}));
});
if(heads[0].x===heads[1].x&&heads[0].y===heads[1].y)dead[0]=dead[1]=true;
if(dead[0]||dead[1]){
g.sn.forEach((s,i)=>{if(dead[i])g.burst(s.c[0].x*30+15,s.c[0].y*30+35,col(i),24,360);});
FX.playBoom();
if(dead[0]&&dead[1])g.next("BOTH CRASHED");else g.point(dead[0]?1:0);
return;
}
heads.forEach((h,i)=>{
const s=g.sn[i];s.c.unshift(h);
const f=g.food.findIndex(o=>o.x===h.x&&o.y===h.y);
if(f>=0){g.food.splice(f,1);dropFood(g);FX.tone(800,.06,"square",.04,300);g.burst(h.x*30+15,h.y*30+35,"#ff4a4a",6,160);}
else s.c.pop();
});
const w=g.sn.findIndex(s=>s.c.length>=14);
if(w>=0)g.point(w,"LENGTH 14!");
},
draw(g,ctx){
ctx.fillStyle="#0e1226";ctx.fillRect(0,0,W,H);
for(let i=0;i<480;i++){const x=(i%30)*30,y=Math.floor(i/30)*30+20;ctx.fillStyle=(i%30+Math.floor(i/30))%2?"#141a38":"#172044";ctx.fillRect(x,y,30,30);}
ctx.strokeStyle="#4c5d99";ctx.lineWidth=3;ctx.strokeRect(1,21,W-2,480-2);
for(const f of g.food){ctx.fillStyle="#ff4a4a";ctx.beginPath();ctx.arc(f.x*30+15,f.y*30+35,10,0,Math.PI*2);ctx.fill();ctx.fillStyle="#4ac04a";ctx.fillRect(f.x*30+14,f.y*30+22,4,6);ctx.fillStyle="rgba(255,255,255,.5)";ctx.fillRect(f.x*30+10,f.y*30+29,4,4);}
g.sn.forEach((s,i)=>{
s.c.forEach((c,k)=>{
ctx.fillStyle=k===0?"#fff":col(i);ctx.fillRect(c.x*30+2,c.y*30+22,26,26);
ctx.fillStyle="rgba(0,0,0,.25)";ctx.fillRect(c.x*30+2,c.y*30+40,26,8);
if(k===0){ctx.fillStyle=col(i);ctx.fillRect(c.x*30+4,c.y*30+24,22,22);ctx.fillStyle="#fff";ctx.fillRect(c.x*30+8+s.d.x*4,c.y*30+28+s.d.y*4,6,6);ctx.fillRect(c.x*30+17+s.d.x*4,c.y*30+28+s.d.y*4,6,6);ctx.fillStyle="#11152b";ctx.fillRect(c.x*30+10+s.d.x*6,c.y*30+30+s.d.y*6,3,3);ctx.fillRect(c.x*30+19+s.d.x*6,c.y*30+30+s.d.y*6,3,3);}
});
});
g.text("P1 LEN "+g.sn[0].c.length,60,16,14,C1);g.text("LEN "+g.sn[1].c.length+" P2",W-60,16,14,C2,"right");
}
});
})();