/* =====================================================
   GAME PACK R — 8 asymmetric/tension games (FIXED)
   Bomb Plant, Sticky Walls, Elevator Rush, Line of Sight,
   Rocket Chase, Rope Climb, Signal Jumper, Traffic
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* ---------- 1. BOMB PLANT ---------- */
micro({id:"bombplantGame",title:"Bomb Plant",desc:"One plants bombs, one defuses. Roles swap.",
cat:"action",key:"bombplant",win:3,
controls:"Attacker: WASD, SPACE plant near site　 Defender: WASD, HOLD SPACE near bomb to defuse — 40s",
round(g){
const roundNum=g.score[0]+g.score[1];
g.attacker=roundNum%2===0?0:1;
g.defender=1-g.attacker;
g.tl=40;
g.sites=[{x:300,y:250},{x:600,y:250}];
g.pl=[{x:300,y:400},{x:600,y:400}];
g.bombs=[];
g.cd=[0,0];
g.plantCd=0;
},
update(g,dt){
g.tl-=dt;
g.cd[0]=Math.max(0,g.cd[0]-dt);
g.cd[1]=Math.max(0,g.cd[1]-dt);
g.plantCd=Math.max(0,g.plantCd-dt);
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*240*dt,20,W-20);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*240*dt,60,H-20);
});
const I=g.I[g.attacker];
if(I.pa&&g.plantCd<=0){
const p=g.pl[g.attacker];
for(const s of g.sites){
if(Math.hypot(p.x-s.x,p.y-s.y)<60&&!g.bombs.some(b=>!b.defused&&Math.hypot(b.x-s.x,b.y-s.y)<50)){
g.bombs.push({x:s.x,y:s.y,fuse:6,defusing:0,defused:false});
g.plantCd=1;
FX.tone(400,.15,"square",.05);
}
}
}
const ID=g.I[g.defender];
if(ID.a){
const p=g.pl[g.defender];
const b=g.bombs.find(bb=>!bb.defused&&Math.hypot(p.x-bb.x,p.y-bb.y)<40);
if(b){
b.defusing+=dt;
if(Math.random()<.3)FX.tone(700,.03,"square",.02);
if(b.defusing>2){b.defused=true;FX.playScore();}
}
}
g.bombs.forEach(b=>{
if(b.defused)return;
b.fuse-=dt;
if(b.fuse<=0){
b.exploded=true;
g.point(g.attacker,"DETONATED");
}
});
g.bombs=g.bombs.filter(b=>!b.exploded);
if(g.tl<=0){
const active=g.bombs.some(b=>!b.defused);
if(active)g.point(g.attacker,"BOMB LIVE");
else g.point(g.defender,"DEFENDED");
}
},
draw(g,ctx){
g.floor("#1a1530","#221a3a");
g.sites.forEach(s=>{
ctx.strokeStyle=GOLD;ctx.lineWidth=3;
ctx.strokeRect(s.x-40,s.y-40,80,80);
ctx.fillStyle="rgba(255,230,109,.1)";ctx.fillRect(s.x-40,s.y-40,80,80);
g.text("SITE",s.x,s.y+4,12,GOLD,"center");
});
g.bombs.forEach(b=>{
ctx.fillStyle=b.defused?GREEN:RED;
ctx.beginPath();ctx.arc(b.x,b.y,14,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
if(b.defusing>0&&!b.defused){
ctx.strokeStyle=GREEN;ctx.lineWidth=3;
ctx.beginPath();ctx.arc(b.x,b.y,22,-Math.PI/2,-Math.PI/2+b.defusing/2*Math.PI*2);ctx.stroke();
}
if(!b.defused)g.text(Math.ceil(b.fuse)+"s",b.x,b.y-22,12,"#fff","center");
});
g.pl.forEach((p,i)=>{
const role=i===g.attacker?"ATK":"DEF";
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,false);
g.text("P"+(i+1)+" "+role,i?W-40:40,40,14,col(i),i?"right":"left");
});
g.text("TIME "+Math.max(0,Math.ceil(g.tl)),W/2,30,22,GOLD,"center");
}
});

/* ---------- 2. STICKY WALLS ---------- */
micro({id:"stickywallGame",title:"Sticky Walls",desc:"Touch a wall, get stuck. Rival closes in.",
cat:"action",key:"stickywall",win:3,
controls:"P1: WASD, mash to escape stick　 P2: ARROWS — touching a wall sticks you for ~1s.",
round(g){
g.pl=[{x:200,y:200,hp:3,stuck:0},{x:700,y:300,hp:3,stuck:0}];
g.cd=[0,0];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.stuck=Math.max(0,p.stuck-dt);
if(p.stuck>0){
if(I.pl||I.pr||I.pu||I.pd)p.stuck-=.12;
}else{
p.x+=((I.r?1:0)-(I.l?1:0))*240*dt;
p.y+=((I.d?1:0)-(I.u?1:0))*240*dt;
if(p.x<30||p.x>W-30||p.y<70||p.y>H-30){
p.stuck=1.2;FX.tone(300,.1,"sawtooth",.04,-100);
}
p.x=cl(p.x,20,W-20);p.y=cl(p.y,60,H-20);
}
});
const [a,b]=g.pl,d=Math.hypot(a.x-b.x,a.y-b.y);
g.cd[0]=Math.max(0,g.cd[0]-dt);
g.cd[1]=Math.max(0,g.cd[1]-dt);
if(d<30&&d>0){
if(b.stuck>0&&g.cd[0]<=0){b.hp--;g.cd[0]=1;g.burst(b.x,b.y,C1,16,320);playHitSound();}
else if(a.stuck>0&&g.cd[1]<=0){a.hp--;g.cd[1]=1;g.burst(a.x,a.y,C2,16,320);playHitSound();}
}
if(a.hp<=0&&b.hp<=0)g.next("DRAW");
else if(a.hp<=0)g.point(1,"P2 WINS");
else if(b.hp<=0)g.point(0,"P1 WINS");
},
draw(g,ctx){
g.floor("#1a1a3a","#22224a");
ctx.strokeStyle="#6a8aff";ctx.lineWidth=6;
ctx.strokeRect(25,65,W-50,H-90);
g.pl.forEach((p,i)=>{
if(p.stuck>0){
ctx.strokeStyle=GOLD;ctx.lineWidth=3;
ctx.beginPath();ctx.arc(p.x,p.y,22,0,Math.PI*2);ctx.stroke();
}
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,p.stuck>0,p.stuck>0);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,6);
ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/3,6);
});
}
});

/* ---------- 3. ELEVATOR RUSH ---------- */
function makePax(){return{floor:ri(0,5),dest:ri(0,5)};}
micro({id:"elevatorGame",title:"Elevator Rush",desc:"Pick up passengers. Drop at floors. Most delivered wins.",
cat:"action",key:"elevator",win:1,hud:false,
controls:"P1: W/S move elevator, SPACE pick up/drop　 P2: ↑/↓, ENTER — deliver passengers. 30 seconds.",
init(g){
g.tl=0;g.delivered=[0,0];
g.passengers=[];
for(let k=0;k<4;k++)g.passengers.push(makePax());
g.pl=[{x:225,y:5,carrying:null},{x:675,y:5,carrying:null}];
g.spawnT=2;
},
update(g,dt){
g.tl+=dt;g.spawnT-=dt;
if(g.spawnT<=0&&g.passengers.length<6){g.spawnT=2;g.passengers.push(makePax());}
g.pl.forEach((p,i)=>{
const I=g.I[i];
if(I.u)p.y=Math.max(0,p.y-dt*6);
if(I.d)p.y=Math.min(5,p.y+dt*6);
if(I.pa){
if(p.carrying){
if(Math.abs(p.y-p.carrying.dest)<.6){
g.delivered[i]++;
g.burst(i*450+225,p.y*70+60,GOLD,10,200);
FX.tone(800,.08,"square",.04,200);
p.carrying=null;
}
} else {
const near=g.passengers.find(px=>Math.abs(px.floor-p.y)<.6);
if(near){
p.carrying=near;
g.passengers.splice(g.passengers.indexOf(near),1);
FX.tone(500,.06,"square",.03);
}
}
}
});
if(g.tl>30)g.byScore(g.delivered);
},
draw(g,ctx){
for(let i=0;i<2;i++){
const off=i*450;
ctx.fillStyle=i?"#1a1a3a":"#101a3a";ctx.fillRect(off,0,450,H);
for(let f=0;f<6;f++){
const y=60+f*70;
ctx.fillStyle=(f+i)%2?"#2a2548":"#22224a";
ctx.fillRect(off+40,y,370,60);
ctx.fillStyle="#4a4a6a";ctx.fillRect(off+40,y+58,370,2);
g.text("F"+f,off+60,y+34,14,"#9fc0ff");
}
g.passengers.forEach(px=>{
if(px.floor<0||px.floor>5)return;
const y=90+px.floor*70;
ctx.fillStyle=GOLD;
ctx.beginPath();ctx.arc(off+360,y,10,0,Math.PI*2);ctx.fill();
g.text("→F"+px.dest,off+400,y+6,12,"#ffd24a","center");
});
const p=g.pl[i];
const y=90+p.y*70;
ctx.fillStyle=col(i);ctx.fillRect(off+200,y-28,50,56);
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(off+200,y-28,50,56);
g.blob({x:off+225,y:y,r:12},col(i),off+225,y,false);
if(p.carrying)g.text("→F"+p.carrying.dest,off+225,y-46,12,GOLD,"center");
g.text("P"+(i+1)+" delivered: "+g.delivered[i],off+225,30,18,col(i),"center");
}
g.text(Math.max(0,Math.ceil(30-g.tl))+"s",W/2,470,20,GOLD,"center");
}
});

/* ---------- 4. LINE OF SIGHT ---------- */
micro({id:"lineofsightGame",title:"Line of Sight",desc:"Peek, shoot, hide. Walls block shots.",
cat:"action",key:"los",win:3,
controls:"P1: WASD, SPACE shoot　 P2: ARROWS, ENTER — walls block shots",
round(g){
g.pl=[{x:150,y:250,hp:3,cd:0},{x:750,y:250,hp:3,cd:0}];
g.walls=[
{x:400,y:180,w:40,h:140},
{x:400,y:340,w:40,h:140},
{x:280,y:60,w:20,h:80},
{x:600,y:360,w:20,h:80}
];
g.bullets=[];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.cd=Math.max(0,p.cd-dt);
const ox=p.x,oy=p.y;
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*240*dt,20,W-20);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*240*dt,60,H-20);
for(const w of g.walls){
if(p.x>w.x-14&&p.x<w.x+w.w+14&&p.y>w.y-14&&p.y<w.y+w.h+14){
p.x=ox;p.y=oy;break;
}
}
if(I.a&&p.cd<=0){
p.cd=.5;
const o=g.pl[1-i];
const dx=o.x-p.x,dy=o.y-p.y,d=Math.hypot(dx,dy)||1;
g.bullets.push({x:p.x,y:p.y,vx:dx/d*600,vy:dy/d*600,o:i,life:1.5});
FX.playShoot();
}
});
for(const b of g.bullets){
b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
if(b.x<0||b.x>W||b.y<0||b.y>H)b.dead=true;
for(const w of g.walls)if(b.x>w.x&&b.x<w.x+w.w&&b.y>w.y&&b.y<w.y+w.h)b.dead=true;
const o=g.pl[1-b.o];
if(!b.dead&&Math.hypot(b.x-o.x,b.y-o.y)<20){
b.dead=true;o.hp--;
g.burst(o.x,o.y,col(b.o),16,320);playHitSound();
}
}
g.bullets=g.bullets.filter(b=>!b.dead&&b.life>0);
if(g.pl[0].hp<=0&&g.pl[1].hp<=0)g.next("DRAW");
else if(g.pl[0].hp<=0)g.point(1,"P2 WINS");
else if(g.pl[1].hp<=0)g.point(0,"P1 WINS");
},
draw(g,ctx){
g.floor("#1a1a3a","#22224a");
for(const w of g.walls){
ctx.fillStyle="#6a5a8a";ctx.fillRect(w.x,w.y,w.w,w.h);
ctx.fillStyle="#8a7aaa";ctx.fillRect(w.x,w.y,w.w,4);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(w.x,w.y,w.w,w.h);
}
g.bullets.forEach(b=>{
ctx.fillStyle=col(b.o);ctx.fillRect(b.x-3,b.y-3,6,6);
ctx.fillStyle="#fff";ctx.fillRect(b.x-1,b.y-1,2,2);
});
g.pl.forEach((p,i)=>{
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,false);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,6);
ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/3,6);
});
}
});

/* ---------- 5. ROCKET CHASE ---------- */
micro({id:"rocketchaseGame",title:"Rocket Chase",desc:"Fire homing rockets. Dodge to redirect.",
cat:"action",key:"rocketchase",win:3,
controls:"P1: WASD, SPACE fire rocket　 P2: ARROWS, ENTER — rockets home in on your rival",
round(g){
g.pl=[{x:200,y:250,hp:3,cd:0},{x:700,y:250,hp:3,cd:0}];
g.rockets=[];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.cd=Math.max(0,p.cd-dt);
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*240*dt,20,W-20);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*240*dt,60,H-20);
if(I.a&&p.cd<=0){
p.cd=1.2;
g.rockets.push({x:p.x,y:p.y,vx:(i?-200:200),vy:0,o:i,life:5,turn:.5});
FX.tone(400,.15,"sawtooth",.03,300);
}
});
g.rockets.forEach(r=>{
r.life-=dt;
r.turn=Math.max(0,r.turn-dt*.2);
const target=g.pl[1-r.o];
const dx=target.x-r.x,dy=target.y-r.y,d=Math.hypot(dx,dy)||1;
const turnRate=2+r.turn*2;
const tvx=dx/d*280,tvy=dy/d*280;
r.vx+=(tvx-r.vx)*turnRate*dt;
r.vy+=(tvy-r.vy)*turnRate*dt;
const sp=Math.hypot(r.vx,r.vy);
if(sp>340){r.vx*=340/sp;r.vy*=340/sp;}
r.x+=r.vx*dt;r.y+=r.vy*dt;
if(r.x<0||r.x>W||r.y<0||r.y>H)r.dead=true;
if(Math.hypot(r.x-target.x,r.y-target.y)<22){
r.dead=true;target.hp--;
g.burst(target.x,target.y,col(r.o),18,340);playHitSound();
}
});
g.rockets=g.rockets.filter(r=>!r.dead&&r.life>0);
if(g.pl[0].hp<=0&&g.pl[1].hp<=0)g.next("DRAW");
else if(g.pl[0].hp<=0)g.point(1,"P2 WINS");
else if(g.pl[1].hp<=0)g.point(0,"P1 WINS");
},
draw(g,ctx){
g.floor("#1a1a3a","#22224a");
g.rockets.forEach(r=>{
const ang=Math.atan2(r.vy,r.vx);
ctx.fillStyle="rgba(255,140,60,.6)";
ctx.beginPath();
ctx.arc(r.x-Math.cos(ang)*20,r.y-Math.sin(ang)*20,10,0,Math.PI*2);ctx.fill();
ctx.fillStyle=col(r.o);ctx.beginPath();ctx.arc(r.x,r.y,8,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
});
g.pl.forEach((p,i)=>{
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,false);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,6);
ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/3,6);
});
}
});

/* ---------- 6. ROPE CLIMB ---------- */
micro({id:"ropeclimbGame",title:"Rope Climb",desc:"Climb your rope. Shake rival's rope to slow them.",
cat:"reflex",key:"ropeclimb",win:3,
controls:"P1: alternate A/D to climb, S to shake rival　 P2: alternate ←/→, ↓ — first to top wins",
round(g){
g.progress=[0,0];
g.last=["",""];
g.shake=[0,0];
g.fatigue=[0,0];
},
update(g,dt){
[0,1].forEach(i=>{
g.shake[i]=Math.max(0,g.shake[i]-dt);
g.fatigue[i]=Math.max(0,g.fatigue[i]-dt);
});
const wantShake=[g.I[0].pd,g.I[1].pd];
const climbL=[g.I[0].pl,g.I[1].pl];
const climbR=[g.I[0].pr,g.I[1].pr];
[0,1].forEach(i=>{
const other=1-i;
if(wantShake[i]&&g.fatigue[i]<=0&&g.shake[other]<=0){
g.shake[other]=.6;
g.fatigue[i]=.5;
FX.tone(300,.1,"sawtooth",.03,-100);
}
});
[0,1].forEach(i=>{
if(g.shake[i]>0||g.fatigue[i]>0)return;
if(climbL[i]&&g.last[i]!=="l"){g.last[i]="l";g.progress[i]+=1.8;}
if(climbR[i]&&g.last[i]!=="r"){g.last[i]="r";g.progress[i]+=1.8;}
});
g.progress[0]=Math.max(0,g.progress[0]-.5*dt);
g.progress[1]=Math.max(0,g.progress[1]-.5*dt);
if(g.progress[0]>=100)g.point(0,"P1 TOPS");
else if(g.progress[1]>=100)g.point(1,"P2 TOPS");
},
draw(g,ctx){
g.floor("#2a4a2a","#1a3a1a");
[0,1].forEach(i=>{
const cx=i?675:225;
ctx.strokeStyle="#8a6a3a";ctx.lineWidth=8;
ctx.beginPath();ctx.moveTo(cx,60);ctx.lineTo(cx,H-40);ctx.stroke();
const y=H-60-g.progress[i]*3;
g.blob({x:cx,y:y,r:14},col(i),cx,y-60,false);
if(g.shake[i]>0){
ctx.strokeStyle="rgba(255,90,120,"+g.shake[i]+")";
ctx.lineWidth=3;
ctx.strokeRect(cx-40,60,80,H-100);
}
g.text("P"+(i+1)+" "+Math.round(g.progress[i])+"%",cx,40,20,col(i),"center");
});
g.text("P1: A/D climb, S shake",W/2-200,490,12,C1,"center");
g.text("P2: ←/→ climb, ↓ shake",W/2+200,490,12,C2,"center");
}
});

/* ---------- 7. SIGNAL JUMPER ---------- */
micro({id:"signalGame",title:"Signal Jumper",desc:"Blind target. Use signal strength to find it.",
cat:"reflex",key:"signal",win:3,
controls:"P1: WASD move probe　 P2: ARROWS — both hunting the same hidden target",
round(g){
g.target={x:rnd(100,W-100),y:rnd(100,H-100)};
g.pl=[{x:150,y:250,dist:0},{x:750,y:250,dist:0}];
g.hit=[false,false];
},
update(g,dt){
let winner=-1;
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*220*dt,20,W-20);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*220*dt,60,H-20);
p.dist=Math.hypot(p.x-g.target.x,p.y-g.target.y);
if(p.dist<25&&winner<0)winner=i;
});
if(winner>=0)g.point(winner,"FOUND!");
},
draw(g,ctx){
g.floor("#0a1a2a","#122540");
g.pl.forEach((p,i)=>{
const strength=Math.max(0,1-p.dist/500);
const gr=ctx.createRadialGradient(p.x,p.y,10,p.x,p.y,60+strength*80);
gr.addColorStop(0,`rgba(${i?255:100},${i?114:234},${i?200:255},${strength*.4})`);
gr.addColorStop(1,`rgba(${i?255:100},${i?114:234},${i?200:255},0)`);
ctx.fillStyle=gr;ctx.beginPath();ctx.arc(p.x,p.y,60+strength*80,0,Math.PI*2);ctx.fill();
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,false);
g.text("P"+(i+1)+" SIGNAL "+Math.round(strength*100)+"%",i?W-40:40,40,14,col(i),i?"right":"left");
});
}
});

/* ---------- 8. TRAFFIC (replaces Traffic Cop) ---------- */
micro({id:"trafficGame",title:"Traffic",desc:"Dodge cars. Speed rises. First to crash loses.",
cat:"reflex",key:"traffic",win:3,
controls:"P1: A/D change lane　 P2: ←/→ — dodging incoming wall of cars. Speed increases over time.",
round(g){
g.lane=[1,1];
g.cd=[0,0];
g.speed=280;
g.tl=0;
g.cars=[];
g.spawnT=1.2;
},
update(g,dt){
g.tl+=dt;
g.cd[0]=Math.max(0,g.cd[0]-dt);
g.cd[1]=Math.max(0,g.cd[1]-dt);
g.speed=280+g.tl*12;
g.spawnT-=dt;
if(g.spawnT<=0){
g.spawnT=Math.max(.7,1.5-g.tl*.02);
const gap=ri(0,3);
for(let l=0;l<4;l++){
if(l!==gap)g.cars.push({lane:l,y:-40});
}
}
g.cars.forEach(c=>c.y+=g.speed*dt);
g.cars=g.cars.filter(c=>c.y<H+40);
for(let i=0;i<2;i++){
const I=g.I[i];
if(I.pl&&g.lane[i]>0&&g.cd[i]<=0){g.lane[i]--;g.cd[i]=.15;}
if(I.pr&&g.lane[i]<3&&g.cd[i]<=0){g.lane[i]++;g.cd[i]=.15;}
}
const crash=[false,false];
for(const c of g.cars){
if(c.y>350&&c.y<440){
for(let i=0;i<2;i++){
if(c.lane===g.lane[i])crash[i]=true;
}
}
}
if(crash[0]&&crash[1])g.next("BOTH CRASHED");
else if(crash[0])g.point(1,"P2 SURVIVES");
else if(crash[1])g.point(0,"P1 SURVIVES");
},
draw(g,ctx){
for(let i=0;i<2;i++){
const off=i*450;
ctx.fillStyle="#2a2a3a";ctx.fillRect(off,0,450,H);
ctx.fillStyle="#1a1a2a";ctx.fillRect(off+30,0,390,H);
for(let k=1;k<4;k++){
ctx.fillStyle="rgba(255,255,255,.3)";
for(let y=(g.tl*g.speed*.5)%40;y<H;y+=40)ctx.fillRect(off+30+k*97-2,y,4,20);
}
g.cars.forEach(c=>{
const x=off+30+c.lane*97+48;
ctx.fillStyle="#ff4a4a";ctx.fillRect(x-20,c.y-30,40,60);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(x-20,c.y-30,40,60);
ctx.fillStyle="#cfe8ff";ctx.fillRect(x-15,c.y-22,30,12);
});
const px=off+30+g.lane[i]*97+48;
ctx.fillStyle=col(i);ctx.fillRect(px-25,H-120,50,80);
ctx.fillStyle="#cfe8ff";ctx.fillRect(px-18,H-100,36,20);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(px-25,H-120,50,80);
g.text("P"+(i+1),off+225,30,18,col(i),"center");
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});
})();