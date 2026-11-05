/* =====================================================
   GAME PACK N — 8 classic duel games
   Darts, Pool, Blackjack, War, Arm Wrestling,
   Balance Beam, Juggler, Airplane Dogfight
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* ---------- 1. DARTS ---------- */
micro({id:"dartsGame",title:"Darts",desc:"Aim, charge, throw. Hit the bullseye.",
cat:"sports",key:"darts",win:3,
controls:"P1: A/D aim, hold W to charge, release to throw　 P2: ←/→ aim, hold ↑, release",
round(g){
g.pl=[{score:0,darts:3,aim:0,power:0,charging:false,throws:[]},
      {score:0,darts:3,aim:0,power:0,charging:false,throws:[]}];
g.cur=0;
},
update(g,dt){
if(g.pl[0].darts<=0&&g.pl[1].darts<=0){
const a=g.pl[0].score,b=g.pl[1].score;
if(a===b)g.next("TIE");else g.point(a>b?0:1,"HIGH SCORE");
return;
}
if(g.pl[g.cur].darts<=0)g.cur=1-g.cur;
const p=g.pl[g.cur],I=g.I[g.cur];
if(!p.charging){
if(I.l)p.aim-=1.5*dt;
if(I.r)p.aim+=1.5*dt;
p.aim=cl(p.aim,-1.2,1.2);
if(I.u){p.charging=true;p.power=0;}
}else{
p.power=Math.min(1,p.power+dt*1.5);
if(!I.u){
const tx=W/2+Math.sin(p.aim*.7)*p.power*180;
const ty=90+p.power*60;
const d=Math.hypot(tx-W/2,ty-90);
let pts=0;
if(d<18)pts=50;else if(d<38)pts=25;else if(d<58)pts=10;else if(d<78)pts=5;
p.score+=pts;p.darts--;
p.throws.push({x:tx,y:ty,pts});
FX.tone(pts===50?900:500+pts*5,.15,"square",.05,pts*10);
p.charging=false;p.power=0;
}
}
},
draw(g,ctx){
g.floor("#1a2a1a","#1a3a1a");
const cx=W/2,cy=90;
[[80,"#4a3a1a"],[60,"#8a6a3a"],[40,"#4a8a4a"],[20,"#8a3a3a"],[8,"#ffe66d"]].forEach(([r,c])=>{
ctx.fillStyle=c;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
});
g.pl.forEach((p,i)=>p.throws.forEach(t=>{
ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(t.x,t.y,4,0,Math.PI*2);ctx.fill();
}));
const cur=g.pl[g.cur];
if(cur.charging){
ctx.strokeStyle=GOLD;ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(W/2,440);
ctx.lineTo(cx+Math.sin(cur.aim*.7)*cur.power*180,90+cur.power*60);
ctx.stroke();
}
g.pl.forEach((p,i)=>{
g.text("P"+(i+1)+" "+p.score,i?W-40:40,40,20,col(i),i?"right":"left");
g.text("DARTS: "+p.darts,i?W-40:40,60,14,"#9fc0ff",i?"right":"left");
});
const hint=g.cur===0?"P1: A/D aim, hold W":"P2: ←/→ aim, hold ↑";
g.text(hint,W/2,470,14,col(g.cur),"center");
}
});

/* ---------- 2. POOL ---------- */
micro({id:"poolGame",title:"Pool",desc:"Sink both of your balls to win the round.",
cat:"sports",key:"pool",win:3,
controls:"P1: A/D aim, hold W to charge, release to shoot　 P2: ←/→ aim, hold ↑ — first to pocket BOTH of your balls wins",
round(g){
g.balls=[
{x:225,y:250,vx:0,vy:0,r:11,type:"cue"},
{x:675,y:250,vx:0,vy:0,r:11,type:"cue"},
{x:320,y:180,vx:0,vy:0,r:11,type:"p1",c:C1},
{x:280,y:320,vx:0,vy:0,r:11,type:"p1",c:C1},
{x:580,y:180,vx:0,vy:0,r:11,type:"p2",c:C2},
{x:620,y:320,vx:0,vy:0,r:11,type:"p2",c:C2}
];
g.pocketed=[0,0];g.turn=0;
g.aim=[0,0];g.charging=[false,false];g.power=[0,0];
},
update(g,dt){
const moving=g.balls.some(b=>Math.hypot(b.vx,b.vy)>6);
g.balls.forEach(b=>{
if(b.x<-900)return;
if(moving){
b.x+=b.vx*dt;b.y+=b.vy*dt;
b.vx*=.985;b.vy*=.985;
if(Math.abs(b.vx)<5)b.vx=0;
if(Math.abs(b.vy)<5)b.vy=0;
if(b.x<b.r+85){b.x=b.r+85;b.vx=Math.abs(b.vx)*.92;}
if(b.x>W-b.r-85){b.x=W-b.r-85;b.vx=-Math.abs(b.vx)*.92;}
if(b.y<55+b.r){b.y=55+b.r;b.vy=Math.abs(b.vy)*.92;}
if(b.y>H-25-b.r){b.y=H-25-b.r;b.vy=-Math.abs(b.vy)*.92;}
[[85,55],[W-85,55],[85,H-25],[W-85,H-25]].forEach(([px,py])=>{
if(b.type!=="cue"&&Math.hypot(b.x-px,b.y-py)<22){
b.x=-999;
if(b.type==="p1")g.pocketed[0]++;
if(b.type==="p2")g.pocketed[1]++;
FX.playScore();
if(g.pocketed[0]>=2)g.point(0,"P1 WINS");
else if(g.pocketed[1]>=2)g.point(1,"P2 WINS");
}
});
}
});
for(let a=0;a<g.balls.length;a++)for(let b=a+1;b<g.balls.length;b++){
const p=g.balls[a],q=g.balls[b];
if(p.x<-900||q.x<-900)continue;
const d=Math.hypot(p.x-q.x,p.y-q.y);
if(d<p.r+q.r&&d>0){
const nx=(q.x-p.x)/d,ny=(q.y-p.y)/d;
const ov=(p.r+q.r-d)/2;
p.x-=nx*ov;p.y-=ny*ov;q.x+=nx*ov;q.y+=ny*ov;
const vn=(q.vx-p.vx)*nx+(q.vy-p.vy)*ny;
if(vn<0){
const imp=-1.8*vn/2;
p.vx-=imp*nx;p.vy-=imp*ny;
q.vx+=imp*nx;q.vy+=imp*ny;
}
}
}
if(!moving){
const I=g.I[g.turn],cue=g.balls[g.turn];
if(!g.charging[g.turn]){
if(I.l)g.aim[g.turn]-=1.5*dt;
if(I.r)g.aim[g.turn]+=1.5*dt;
g.aim[g.turn]=cl(g.aim[g.turn],-Math.PI/2,Math.PI/2);
if(I.u){g.charging[g.turn]=true;g.power[g.turn]=0;}
}else{
g.power[g.turn]=Math.min(1,g.power[g.turn]+dt*1.5);
if(!I.u){
const sp=300+g.power[g.turn]*700;
cue.vx=Math.cos(g.aim[g.turn])*sp;
cue.vy=Math.sin(g.aim[g.turn])*sp;
g.charging[g.turn]=false;g.power[g.turn]=0;
g.turn=1-g.turn;
}
}
}
},
draw(g,ctx){
ctx.fillStyle="#5a3a1a";ctx.fillRect(70,40,W-140,H-60);
ctx.fillStyle="#0a5a1a";ctx.fillRect(82,52,W-164,H-84);
[[85,55],[W-85,55],[85,H-25],[W-85,H-25]].forEach(([px,py])=>{
ctx.fillStyle="#000";ctx.beginPath();ctx.arc(px,py,20,0,Math.PI*2);ctx.fill();
});
g.balls.forEach(b=>{
if(b.x<-900)return;
ctx.fillStyle="rgba(0,0,0,.3)";ctx.beginPath();ctx.arc(b.x+2,b.y+2,b.r,0,Math.PI*2);ctx.fill();
ctx.fillStyle=b.type==="cue"?"#fff":b.c;
ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
});
const cue=g.balls[g.turn];
if(g.charging[g.turn]){
ctx.strokeStyle=GOLD;ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(cue.x,cue.y);
ctx.lineTo(cue.x+Math.cos(g.aim[g.turn])*(60+g.power[g.turn]*120),
cue.y+Math.sin(g.aim[g.turn])*(60+g.power[g.turn]*120));
ctx.stroke();
}
g.text("P1 pocketed: "+g.pocketed[0],20,30,16,C1);
g.text("P2 pocketed: "+g.pocketed[1],W-20,30,16,C2,"right");
g.text("P"+(g.turn+1)+" TURN",W/2,30,18,col(g.turn),"center");
}
});

/* ---------- 3. BLACKJACK ---------- */
function bjCard(){return 1+Math.floor(Math.random()*13);}
function bjVal(v){return v>10?10:v;}
function bjStr(v){return ["","A","2","3","4","5","6","7","8","9","10","J","Q","K"][v];}
function bjTotal(cs){
let t=0,a=0;
cs.forEach(v=>{if(v===1){a++;t+=11;}else t+=bjVal(v);});
while(t>21&&a>0){t-=10;a--;}
return t;
}
micro({id:"blackjackGame",title:"Blackjack",desc:"Hit or stand. Closest to 21 without busting.",
cat:"brain",key:"blackjack",win:5,
controls:"P1: A=HIT, D=STAND　 P2: ←=HIT, →=STAND — closest to 21 wins the round",
round(g){
g.p1=[bjCard(),bjCard()];g.p2=[bjCard(),bjCard()];
g.done=[false,false];g.lock=[0,0];
},
update(g,dt){
for(let i=0;i<2;i++){
g.lock[i]=Math.max(0,g.lock[i]-dt);
if(g.lock[i]>0||g.done[i])continue;
const hand=i===0?g.p1:g.p2;
if(bjTotal(hand)>=21){g.done[i]=true;continue;}
const I=g.I[i];
if(I.pl){hand.push(bjCard());g.lock[i]=.3;FX.tone(500,.06,"square",.04);
if(bjTotal(hand)>21)g.done[i]=true;}
else if(I.pr){g.done[i]=true;FX.tone(300,.08,"square",.03);}
}
if(g.done[0]&&g.done[1]){
const t1=bjTotal(g.p1),t2=bjTotal(g.p2);
const b1=t1>21?0:t1,b2=t2>21?0:t2;
if(b1===b2)g.next("TIE");else g.point(b1>b2?0:1,"WIN");
}
},
draw(g,ctx){
ctx.fillStyle="#0a3a1a";ctx.fillRect(0,0,W,H);
[0,1].forEach(i=>{
const cx=i?675:225,hand=i===0?g.p1:g.p2;
g.text("P"+(i+1),cx,40,22,col(i),"center");
const t=bjTotal(hand);
g.text("TOTAL "+t,cx,70,20,t>21?RED:"#fff","center");
hand.forEach((v,k)=>{
const x=cx-60+k*50,y=200;
ctx.fillStyle="#fff";ctx.fillRect(x,y,40,60);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(x,y,40,60);
g.text(bjStr(v),x+20,y+40,22,v===1?"#ff4a4a":"#080b18","center");
});
if(g.done[i]){
ctx.fillStyle="rgba(0,0,0,.6)";ctx.fillRect(cx-100,300,200,40);
g.text("STOOD",cx,330,20,GOLD,"center");
}
g.text(i?"← HIT   → STAND":"A HIT   D STAND",cx,450,16,col(i),"center");
});
}
});

/* ---------- 4. WAR ---------- */
micro({id:"warGame",title:"War",desc:"Higher card wins the round. Simple as that.",
cat:"brain",key:"war",win:5,
controls:"P1: SPACE flip　 P2: ENTER flip — higher card wins. Ties redraw.",
round(g){
g.c1=bjCard();g.c2=bjCard();
g.pick=[-1,-1];g.rev=false;g.revT=0;
},
update(g,dt){
if(g.rev){
g.revT-=dt;
if(g.revT<=0){
if(g.c1===g.c2)g.next("TIE — REDRAW");
else g.point(g.c1>g.c2?0:1,"P"+(g.c1>g.c2?"1":"2")+" WINS");
}
return;
}
for(let i=0;i<2;i++){
if(g.pick[i]>=0)continue;
if(g.I[i].pa){g.pick[i]=1;FX.tone(500,.06,"square",.04);}
}
if(g.pick[0]>=0&&g.pick[1]>=0){g.rev=true;g.revT=.9;}
},
draw(g,ctx){
ctx.fillStyle="#1a3a1a";ctx.fillRect(0,0,W,H);
g.text("WAR",W/2,60,44,GOLD,"center");
g.text("HIGHER CARD WINS",W/2,100,18,"#9fc0ff","center");
[0,1].forEach(i=>{
const cx=i?675:225,card=g.rev?(i===0?g.c1:g.c2):0;
ctx.fillStyle=g.rev?"#fff":"#2a2f63";
ctx.fillRect(cx-50,200,100,140);
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(cx-50,200,100,140);
if(g.rev)g.text(bjStr(card),cx,290,54,card===1?"#ff4a4a":"#080b18","center");
else g.text("?",cx,290,54,"#9fc0ff","center");
g.text("P"+(i+1),cx,180,20,col(i),"center");
if(!g.rev)g.text(i?"ENTER":"SPACE",cx,380,16,col(i),"center");
});
}
});

/* ---------- 5. ARM WRESTLING ---------- */
micro({id:"armwrestleGame",title:"Arm Wrestling",desc:"Mash alternate keys to push the arm over.",
cat:"reflex",key:"armwrestle",win:3,
controls:"P1: alternate A and D　 P2: alternate ← and → — mashing the SAME key does nothing",
round(g){
g.pos=0;
g.lastP=["",""];
g.flash=[0,0];
},
update(g,dt){
for(let i=0;i<2;i++){
g.flash[i]=Math.max(0,g.flash[i]-dt);
const I=g.I[i],dir=i===0?-1:1;
if(I.pl){
if(g.lastP[i]!=="l"){g.pos+=dir*35;g.lastP[i]="l";g.flash[i]=.1;}
else g.flash[i]=.2;
}
if(I.pr){
if(g.lastP[i]!=="r"){g.pos+=dir*35;g.lastP[i]="r";g.flash[i]=.1;}
else g.flash[i]=.2;
}
}
g.pos*=.98;
if(g.pos<=-100)g.point(0,"P1 WINS");
else if(g.pos>=100)g.point(1,"P2 WINS");
},
draw(g,ctx){
g.floor("#1a1a3a","#22224a");
const cx=W/2,cy=H/2;
ctx.fillStyle="#6a4a2a";ctx.fillRect(150,cy,600,80);
[0,1].forEach(i=>{
const sign=i?1:-1;
const endX=cx+g.pos*2*sign*.5;
ctx.strokeStyle=col(i);ctx.lineWidth=20;
ctx.beginPath();ctx.moveTo(i?W-60:60,cy);
ctx.lineTo(endX,cy+g.pos*1.5);ctx.stroke();
ctx.fillStyle=col(i);
ctx.beginPath();ctx.arc(i?W-60:60,cy,30,0,Math.PI*2);ctx.fill();
});
ctx.fillStyle="#2a2f63";ctx.fillRect(cx-200,80,400,20);
const w=Math.abs(g.pos)*2;
if(g.pos<0){ctx.fillStyle=C1;ctx.fillRect(cx-200,80,w,20);}
else if(g.pos>0){ctx.fillStyle=C2;ctx.fillRect(cx+200-w,80,w,20);}
ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.strokeRect(cx-200,80,400,20);
[0,1].forEach(i=>{
if(g.flash[i]>0){ctx.fillStyle=`rgba(255,255,255,${g.flash[i]*1.5})`;
ctx.fillRect(i?450:0,0,450,H);}
g.text("P"+(i+1),i?675:225,H-40,22,col(i),"center");
});
const s=g.pos<-50?"P1 WINNING":g.pos>50?"P2 WINNING":"NEUTRAL";
g.text(s,W/2,420,20,GOLD,"center");
}
});

/* ---------- 6. BALANCE BEAM ---------- */
micro({id:"balanceGame",title:"Balance Beam",desc:"Stay on the beam. Don't tip over.",
cat:"reflex",key:"balance",win:3,
controls:"P1: A/D tilt　 P2: ←/→ tilt — wind pushes you off balance. First to fall loses.",
round(g){
g.p=[{angle:0,vel:0,pos:0,dead:false},{angle:0,vel:0,pos:0,dead:false}];
g.ph=Math.random()*6;
},
update(g,dt){
const wind=Math.sin(g.t*2+g.ph)*3+Math.sin(g.t*5.7)*2;
g.p.forEach((p,i)=>{
const I=g.I[i];
p.vel+=(wind+((I.r?1:0)-(I.l?1:0))*5+p.angle*1.5)*dt;
p.vel*=.985;p.angle+=p.vel*dt;
p.pos+=p.angle*50*dt;
if(Math.abs(p.angle)>1.5||Math.abs(p.pos)>200)p.dead=true;
});
if(g.p[0].dead&&g.p[1].dead)g.next("BOTH FELL");
else if(g.p[0].dead)g.point(1,"P2 WINS");
else if(g.p[1].dead)g.point(0,"P1 WINS");
},
draw(g,ctx){
g.floor("#1a2a4a","#1a2a4a");
[0,1].forEach(i=>{
const off=i*450,p=g.p[i],cx=off+225;
ctx.save();
ctx.translate(cx,300);ctx.rotate(p.angle*.4);
ctx.fillStyle="#8a6a3a";ctx.fillRect(-200,-10,400,20);
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(-200,-10,400,20);
ctx.restore();
const chX=cx+p.pos*.5,chY=280;
ctx.save();ctx.translate(chX,chY);ctx.rotate(p.angle*.4);
ctx.fillStyle=col(i);ctx.fillRect(-15,-50,30,50);
ctx.fillStyle="#f3bd83";ctx.fillRect(-10,-70,20,20);
ctx.fillStyle="#111";ctx.fillRect(-4,-62,4,4);ctx.fillRect(2,-62,4,4);
ctx.restore();
if(p.dead){ctx.fillStyle="rgba(255,0,0,.3)";ctx.fillRect(off,0,450,H);
g.text("FELL",cx,300,32,RED,"center");}
g.text("P"+(i+1),cx,50,20,col(i),"center");
});
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* ---------- 7. JUGGLER ---------- */
micro({id:"jugglerGame",title:"Juggler",desc:"Catch falling balls. Avoid the bombs.",
cat:"reflex",key:"juggler",win:1,hud:false,
controls:"P1: A/D move paddle　 P2: ←/→ — catch balls, dodge bombs. 25 seconds.",
init(g){
g.s=[0,0];g.tl=0;g.spawn=0;g.items=[];
g.pl=[{x:225},{x:675}];
},
update(g,dt){
g.tl+=dt;g.spawn-=dt;
if(g.spawn<=0){g.spawn=Math.max(.25,.6-g.tl*.01);
const i=ri(0,1),type=Math.random()<.2?"bomb":"ball";
g.items.push({x:i*450+40+rnd(0,370),y:-20,type,i});
}
g.items.forEach(it=>{it.y+=200*dt;});
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*300*dt,i*450+40,i*450+410);
});
g.items=g.items.filter(it=>{
const p=g.pl[it.i];
if(it.y>H-80&&it.y<H-40&&Math.abs(it.x-p.x)<40){
if(it.type==="bomb"){g.s[it.i]=Math.max(0,g.s[it.i]-2);
g.burst(it.x,it.y,RED,14,300);FX.playBoom();}
else{g.s[it.i]++;g.burst(it.x,it.y,GOLD,8,200);
FX.tone(700,.05,"square",.04,200);}
return false;
}
return it.y<H+30;
});
if(g.tl>25)g.byScore(g.s);
},
draw(g,ctx){
g.floor("#1a1a2a","#22223a");
g.items.forEach(it=>{
if(it.type==="bomb"){
ctx.fillStyle="#1b1f3a";ctx.beginPath();ctx.arc(it.x,it.y,12,0,Math.PI*2);ctx.fill();
ctx.fillStyle=GOLD;ctx.fillRect(it.x+4,it.y-20,4,4);
}else{
ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(it.x,it.y,10,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
}
});
g.pl.forEach((p,i)=>{
ctx.fillStyle=col(i);ctx.fillRect(p.x-30,H-60,60,20);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(p.x-30,H-60,60,20);
g.text("P"+(i+1)+" "+g.s[i],i?675:225,30,20,col(i),"center");
});
g.text(Math.max(0,Math.ceil(25-g.tl))+"s",W/2,30,22,GOLD,"center");
}
});

/* ---------- 8. AIRPLANE DOGFIGHT ---------- */
micro({id:"planeGame",title:"Airplane Dogfight",desc:"Two planes, one sky. Shoot the other down.",
cat:"action",key:"plane",win:5,
controls:"P1: A/D turn, W thrust, SPACE fire　 P2: ←/→ turn, ↑ thrust, ENTER fire",
round(g){
g.pl=[
{x:150,y:250,a:0,vx:0,vy:0,cd:0},
{x:750,y:250,a:Math.PI,vx:0,vy:0,cd:0}
];
g.bullets=[];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.cd=Math.max(0,p.cd-dt);
if(I.l)p.a-=2.5*dt;
if(I.r)p.a+=2.5*dt;
if(I.u){p.vx+=Math.cos(p.a)*150*dt;p.vy+=Math.sin(p.a)*150*dt;}
const sp=Math.hypot(p.vx,p.vy);
if(sp>320){p.vx*=320/sp;p.vy*=320/sp;}
p.vx*=.99;p.vy*=.99;
p.x=(p.x+p.vx*dt+W)%W;p.y=(p.y+p.vy*dt+H)%H;
if(I.a&&p.cd<=0){p.cd=.25;
g.bullets.push({x:p.x+Math.cos(p.a)*16,y:p.y+Math.sin(p.a)*16,
vx:Math.cos(p.a)*500+p.vx,vy:Math.sin(p.a)*500+p.vy,o:i,life:1.2});
FX.tone(600,.06,"square",.04,-300);
}
});
g.bullets.forEach(b=>{
b.x=(b.x+b.vx*dt+W)%W;b.y=(b.y+b.vy*dt+H)%H;b.life-=dt;
const t=g.pl[1-b.o];
if(b.life>0&&Math.hypot(b.x-t.x,b.y-t.y)<18){
b.life=0;g.burst(t.x,t.y,col(b.o),24,400);
FX.playBoom();g.point(b.o,"SHOT DOWN");
}
});
g.bullets=g.bullets.filter(b=>b.life>0);
},
draw(g,ctx){
ctx.fillStyle="#1a3a5a";ctx.fillRect(0,0,W,H);
for(let k=0;k<20;k++){
ctx.fillStyle="rgba(255,255,255,.05)";
ctx.fillRect((k*83+g.t*40)%W,(k*47+g.t*20)%H,40,6);
}
g.bullets.forEach(b=>{ctx.fillStyle=col(b.o);
ctx.fillRect(b.x-3,b.y-3,6,6);});
g.pl.forEach((p,i)=>{
ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);
ctx.fillStyle=col(i);ctx.fillRect(-12,-8,24,16);
ctx.fillStyle="#fff";ctx.fillRect(2,-4,8,8);
ctx.fillStyle=GOLD;ctx.fillRect(-12,-8,4,4);
ctx.restore();
});
}
});
})();