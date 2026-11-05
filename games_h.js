/* =====================================================
   GAME PACK H — 8 UNIQUE games
   One Bullet, Gravity Flip Fight, Shark and Fish,
   Blind Traverse, Static Attract, Bounce Battle,
   Ceiling Walker, Inverted Race
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* ---------- 1. ONE BULLET ---------- */
micro({id:"onebulletGame",title:"One Bullet",desc:"One shot per round. Aim carefully — miss and you lose.",
cat:"reflex",key:"onebullet",win:3,
controls:"P1: A/D aim, SPACE fire　 P2: ←/→ aim, ENTER fire — ONE bullet each per round. Walls block shots.",
round(g){
g.pl=[{x:80,y:250,ang:0,shot:false,dead:false},{x:820,y:250,ang:Math.PI,shot:false,dead:false}];
g.bullets=[];
g.walls=[{x:430,y:150,w:40,h:110},{x:430,y:340,w:40,h:110}];
},
update(g,dt){
g.pl.forEach((p,i)=>{
if(p.shot||p.dead)return;
const I=g.I[i];
if(I.l)p.ang-=1.1*dt;
if(I.r)p.ang+=1.1*dt;
if(I.a){
p.shot=true;
g.bullets.push({x:p.x+Math.cos(p.ang)*20,y:p.y+Math.sin(p.ang)*20,vx:Math.cos(p.ang)*500,vy:Math.sin(p.ang)*500,o:i});
FX.playShoot();
}
});
for(const b of g.bullets){
b.x+=b.vx*dt;b.y+=b.vy*dt;
if(b.x<0||b.x>W||b.y<0||b.y>H)b.dead=true;
for(const w of g.walls)if(b.x>w.x&&b.x<w.x+w.w&&b.y>w.y&&b.y<w.y+w.h)b.dead=true;
for(let i=0;i<2;i++){
if(i===b.o||g.pl[i].dead)continue;
if(Math.hypot(b.x-g.pl[i].x,b.y-g.pl[i].y)<20){
g.pl[i].dead=true;b.dead=true;
g.burst(g.pl[i].x,g.pl[i].y,col(i),24,360);FX.playBoom();
}
}
}
g.bullets=g.bullets.filter(b=>!b.dead);
if(g.pl[0].dead&&g.pl[1].dead)g.next("MUTUAL KILL");
else if(g.pl[0].dead)g.point(1,"P2 WINS");
else if(g.pl[1].dead)g.point(0,"P1 WINS");
else if(g.pl.every(p=>p.shot)&&g.bullets.length===0)g.next("BOTH MISSED");
},
draw(g,ctx){
g.floor("#1a1230","#201a3a");
for(const w of g.walls){
ctx.fillStyle="#4a3a6a";ctx.fillRect(w.x,w.y,w.w,w.h);
ctx.fillStyle="#6a56b8";ctx.fillRect(w.x,w.y,w.w,4);
}
g.pl.forEach((p,i)=>{
if(p.dead)return;
if(!p.shot){
ctx.strokeStyle=col(i);ctx.globalAlpha=.35;ctx.setLineDash([6,8]);
ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(p.ang)*700,p.y+Math.sin(p.ang)*700);ctx.stroke();
ctx.setLineDash([]);ctx.globalAlpha=1;
}
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+Math.cos(p.ang)*40,p.y+Math.sin(p.ang)*40,false);
});
g.bullets.forEach(b=>{ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x,b.y,5,0,Math.PI*2);ctx.fill();});
}
});

/* ---------- 2. GRAVITY FLIP FIGHT ---------- */
micro({id:"gravflipGame",title:"Gravity Flip Fight",desc:"The floor becomes the ceiling. Adapt or die.",
cat:"action",key:"gravflip",win:5,
controls:"P1: A/D move, W jump, SPACE dash　 P2: ←/→, ↑, ENTER — dash into your rival. Gravity flips every few seconds.",
round(g){
g.pl=[
{x:150,y:440,vy:0,grounded:true,dash:0,dashCd:0,dashDir:1,stun:0},
{x:750,y:440,vy:0,grounded:true,dash:0,dashCd:0,dashDir:1,stun:0}
];
g.gravity=1;g.flipT=3;g.floorY=450;g.ceilY=50;
},
update(g,dt){
g.flipT-=dt;
if(g.flipT<=0){
g.gravity*=-1;g.flipT=2.5+Math.random()*2;
FX.tone(300,.3,"sawtooth",.05,g.gravity>0?200:-200);
g.pl.forEach(p=>{p.grounded=false;p.vy=0;});
g.banner_("FLIP!",GOLD,.6);
}
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.dashCd=Math.max(0,p.dashCd-dt);
p.stun=Math.max(0,p.stun-dt);
if(p.dash>0){p.dash-=dt;p.x+=p.dashDir*720*dt;}
else if(p.stun<=0)p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*280*dt,20,W-20);
p.vy+=g.gravity*1500*dt;
p.y+=p.vy*dt;
if(g.gravity>0){
if(p.y>=g.floorY){p.y=g.floorY;p.vy=0;p.grounded=true;}
if(p.y<g.ceilY){p.y=g.ceilY;p.vy=0;}
}else{
if(p.y<=g.ceilY){p.y=g.ceilY;p.vy=0;p.grounded=true;}
if(p.y>g.floorY){p.y=g.floorY;p.vy=0;}
}
if(I.u&&p.grounded&&p.stun<=0){
p.vy=-g.gravity*620;p.grounded=false;
FX.tone(400,.08,"square",.03,200);
}
if(I.a&&p.dashCd<=0&&p.stun<=0){
p.dash=.16;p.dashCd=1.2;p.dashDir=I.r?1:-1;
FX.tone(500,.1,"sawtooth",.03,300);
}
});
const [a,b]=g.pl;
if(Math.hypot(a.x-b.x,a.y-b.y)<38){
if(a.dash>0&&b.stun<=0){b.stun=.7;b.x=a.x<b.x?b.x+50:b.x-50;g.point(0,"P1 HITS");return;}
if(b.dash>0&&a.stun<=0){a.stun=.7;a.x=b.x<a.x?a.x+50:a.x-50;g.point(1,"P2 HITS");return;}
}
},
draw(g,ctx){
g.floor("#1a1230","#201a3a");
ctx.fillStyle="#4a3a6a";ctx.fillRect(0,0,W,g.ceilY);ctx.fillRect(0,g.floorY,W,H-g.floorY);
ctx.fillStyle="#6a56b8";ctx.fillRect(0,g.ceilY-5,W,5);ctx.fillRect(0,g.floorY,W,5);
g.text(g.gravity>0?"GRAVITY ▼":"GRAVITY ▲",W/2,25,18,GOLD,"center");
g.pl.forEach((p,i)=>{
if(p.stun>0&&Math.floor(p.stun*14)%2)ctx.globalAlpha=.4;
g.blob({x:p.x,y:p.y,r:16},col(i),p.x,p.y+(g.gravity>0?80:-80),p.dash>0,p.stun>0);
if(p.dash>0){ctx.fillStyle=col(i);ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(p.x-p.dashDir*20,p.y,18,0,Math.PI*2);ctx.fill();}
ctx.globalAlpha=1;
});
}
});

/* ---------- 3. SHARK AND FISH ---------- */
micro({id:"sharkfishGame",title:"Shark and Fish",desc:"One chases, one flees. Roles swap every round.",
cat:"action",key:"sharkfish",win:3,
controls:"Shark: touch the fish. Fish: survive 20s. P1 starts as shark, then roles alternate.",
init(g){g.roles=[0,1];},
round(g){
g.tl=20;
g.shark=g.roles[0];g.fish=g.roles[1];
g.pl=[{x:200,y:250,vx:0,vy:0},{x:700,y:250,vx:0,vy:0}];
},
update(g,dt){
g.tl-=dt;
g.pl.forEach((p,i)=>{
const I=g.I[i],sp=i===g.shark?180:250;
p.vx+=((I.r?1:0)-(I.l?1:0))*sp*4*dt;
p.vy+=((I.d?1:0)-(I.u?1:0))*sp*4*dt;
const v=Math.hypot(p.vx,p.vy);
if(v>sp){p.vx*=sp/v;p.vy*=sp/v;}
p.vx*=.96;p.vy*=.96;
p.x=cl(p.x+p.vx*dt,20,W-20);p.y=cl(p.y+p.vy*dt,60,H-20);
});
const shark=g.pl[g.shark],fish=g.pl[g.fish];
if(Math.hypot(shark.x-fish.x,shark.y-fish.y)<32){
g.point(g.shark,"CAUGHT!");
g.roles=[1-g.roles[0],1-g.roles[1]];return;
}
if(g.tl<=0){
g.point(g.fish,"ESCAPED!");
g.roles=[1-g.roles[0],1-g.roles[1]];
}
},
draw(g,ctx){
const gr=ctx.createLinearGradient(0,0,0,H);
gr.addColorStop(0,"#0a3a7a");gr.addColorStop(1,"#0a1a4a");
ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
for(let k=0;k<30;k++){ctx.fillStyle="rgba(255,255,255,.05)";ctx.fillRect((k*97)%W,(k*61)%H,3,3);}
g.pl.forEach((p,i)=>{
const shark=i===g.shark,ang=Math.atan2(p.vy,p.vx)||0;
ctx.save();ctx.translate(p.x,p.y);
if(shark){
ctx.rotate(ang);ctx.fillStyle=col(i);
ctx.beginPath();ctx.moveTo(28,0);ctx.lineTo(-18,-22);ctx.lineTo(-10,0);ctx.lineTo(-18,22);ctx.closePath();
ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle="#fff";ctx.fillRect(10,-5,4,4);
}else{
ctx.rotate(ang);ctx.fillStyle=col(i);
ctx.beginPath();ctx.ellipse(0,0,18,12,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.beginPath();ctx.moveTo(-16,0);ctx.lineTo(-32,-10);ctx.lineTo(-32,10);ctx.closePath();ctx.fill();ctx.stroke();
ctx.fillStyle="#fff";ctx.fillRect(6,-4,4,4);
}
ctx.restore();
});
g.text((g.shark===0?"P1":"P2")+" = SHARK",20,30,16,"#ff8c42","left");
g.text((g.fish===0?"P1":"P2")+" = FISH",W-20,30,16,GREEN,"right");
g.text(Math.max(0,Math.ceil(g.tl))+"s",W/2,30,24,GOLD,"center");
}
});

/* ---------- 4. BLIND TRAVERSE ---------- */
micro({id:"blindtravGame",title:"Blind Traverse",desc:"The world goes dark. Memorize it while you can.",
cat:"reflex",key:"blindtrav",win:3,
controls:"P1: A/D move, W jump　 P2: ←/→, ↑ — the lights go out after 3 seconds. Race to the green flag.",
round(g){
g.plats=[{x:0,y:400,w:150},{x:220,y:360,w:100},{x:400,y:320,w:120},{x:600,y:380,w:100},{x:780,y:340,w:120}];
g.pl=[{x:60,y:360,vx:0,vy:0,grounded:false},{x:80,y:360,vx:0,vy:0,grounded:false}];
g.lightsOn=3;g.finishX=850;
},
update(g,dt){
g.lightsOn-=dt;
let winner=-1,wmsg="";
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.vx=((I.r?1:0)-(I.l?1:0))*240;
p.vy+=1400*dt;
const oldB=p.y+20;
p.x=cl(p.x+p.vx*dt,10,W-10);
p.y+=p.vy*dt;
p.grounded=false;
for(const pl of g.plats){
if(p.x+14>pl.x&&p.x-14<pl.x+pl.w&&oldB<=pl.y&&p.y+20>=pl.y&&p.vy>=0){
p.y=pl.y-20;p.vy=0;p.grounded=true;
}
}
if(I.u&&p.grounded){p.vy=-500;p.grounded=false;}
if(p.y>H+60&&winner<0){winner=1-i;wmsg="RIVAL FELL";}
else if(p.x>g.finishX-20&&p.y<420&&winner<0){winner=i;wmsg="REACHED GOAL";}
});
if(winner>=0)g.point(winner,wmsg);
},
draw(g,ctx){
const visible=g.lightsOn>0;
ctx.fillStyle=visible?"#1a2a4a":"#050510";
ctx.fillRect(0,0,W,H);
if(visible){
g.plats.forEach(pl=>{
ctx.fillStyle="#4a5a8a";ctx.fillRect(pl.x,pl.y,pl.w,20);
ctx.fillStyle="#6a7aaa";ctx.fillRect(pl.x,pl.y,pl.w,4);
});
ctx.fillStyle=GREEN;ctx.fillRect(g.finishX,300,4,120);
}
g.pl.forEach((p,i)=>{
if(!visible){
const gr=ctx.createRadialGradient(p.x,p.y,10,p.x,p.y,85);
gr.addColorStop(0,"rgba(255,230,109,.35)");
gr.addColorStop(1,"rgba(255,230,109,0)");
ctx.fillStyle=gr;ctx.beginPath();ctx.arc(p.x,p.y,85,0,Math.PI*2);ctx.fill();
}
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+80,p.y,p.vx!==0);
});
g.text(visible?"MEMORIZE "+Math.ceil(g.lightsOn):"DARK",W/2,40,22,visible?GOLD:"#6a72a8","center");
}
});

/* ---------- 5. STATIC ATTRACT ---------- */
micro({id:"staticGame",title:"Static Attract",desc:"Magnetic polarity combat. Push rival into spikes.",
cat:"action",key:"static",win:5,
controls:"P1: A/D move, SPACE flip polarity　 P2: ←/→, ENTER — same polarity = repel, opposite = attract. Corner spikes kill.",
round(g){
g.pl=[
{x:200,y:250,vx:0,vy:0,pol:1,flipCd:0},
{x:700,y:250,vx:0,vy:0,pol:-1,flipCd:0}
];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.flipCd=Math.max(0,p.flipCd-dt);
p.vx+=((I.r?1:0)-(I.l?1:0))*260*4*dt;
p.vy+=((I.d?1:0)-(I.u?1:0))*260*4*dt;
if(I.a&&p.flipCd<=0){p.pol*=-1;p.flipCd=.8;FX.tone(p.pol>0?440:660,.08,"square",.04);}
const sp=Math.hypot(p.vx,p.vy);
if(sp>360){p.vx*=360/sp;p.vy*=360/sp;}
p.vx*=.94;p.vy*=.94;
p.x+=p.vx*dt;p.y+=p.vy*dt;
if(p.x<60){p.x=60;p.vx=Math.abs(p.vx)*.4;}
if(p.x>W-60){p.x=W-60;p.vx=-Math.abs(p.vx)*.4;}
if(p.y<80){p.y=80;p.vy=Math.abs(p.vy)*.4;}
if(p.y>H-60){p.y=H-60;p.vy=-Math.abs(p.vy)*.4;}
});
const [a,b]=g.pl;
const dx=b.x-a.x,dy=b.y-a.y,d=Math.max(Math.hypot(dx,dy),50);
const sign=a.pol===b.pol?-1:1;
const mag=2600*dt;
a.vx+=sign*(dx/d)*mag;a.vy+=sign*(dy/d)*mag;
b.vx-=sign*(dx/d)*mag;b.vy-=sign*(dy/d)*mag;
if(d<46&&d>0){
const nx=dx/d,ny=dy/d,o=(46-d)/2;
a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;
}
const inSpike=p=>(p.x<100&&p.y<140)||(p.x>W-100&&p.y<140)||(p.x<100&&p.y>H-100)||(p.x>W-100&&p.y>H-100);
if(inSpike(a)){g.burst(a.x,a.y,C1,24,360);FX.playBoom();g.point(1,"P1 SPIKED");}
else if(inSpike(b)){g.burst(b.x,b.y,C2,24,360);FX.playBoom();g.point(0,"P2 SPIKED");}
},
draw(g,ctx){
g.floor("#0a0e22","#101a3a");
ctx.fillStyle="#3a3a4a";
for(let k=0;k<5;k++){
const s=18;
ctx.beginPath();ctx.moveTo(k*s,0);ctx.lineTo(k*s+s/2,60);ctx.lineTo(k*s+s,0);ctx.fill();
ctx.beginPath();ctx.moveTo(W-k*s,0);ctx.lineTo(W-k*s-s/2,60);ctx.lineTo(W-k*s-s,0);ctx.fill();
ctx.beginPath();ctx.moveTo(k*s,H);ctx.lineTo(k*s+s/2,H-60);ctx.lineTo(k*s+s,H);ctx.fill();
ctx.beginPath();ctx.moveTo(W-k*s,H);ctx.lineTo(W-k*s-s/2,H-60);ctx.lineTo(W-k*s-s,H);ctx.fill();
}
g.pl.forEach((p,i)=>{
const c=p.pol>0?"#ff4a6a":"#4a8aff";
ctx.fillStyle=c;
ctx.beginPath();ctx.arc(p.x,p.y,18,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
g.text(p.pol>0?"+":"−",p.x,p.y+8,26,"#fff","center");
if(p.flipCd>0){
ctx.strokeStyle=col(i);ctx.lineWidth=3;
ctx.beginPath();ctx.arc(p.x,p.y,24,-Math.PI/2,-Math.PI/2+(1-p.flipCd/.8)*Math.PI*2);ctx.stroke();
}
});
}
});

/* ---------- 6. BOUNCE BATTLE ---------- */
micro({id:"bouncebattleGame",title:"Bounce Battle",desc:"Multiple balls. Keep them off your side.",
cat:"sports",key:"bouncebattle",win:1,hud:false,
controls:"P1: A/D move paddle　 P2: ←/→ — balls that escape your side score for your rival. 30 seconds.",
init(g){
g.s=[0,0];g.tl=0;g.pd=[{x:225},{x:675}];g.balls=[];g.spawnT=0;
},
update(g,dt){
g.tl+=dt;g.spawnT-=dt;
if(g.spawnT<=0&&g.balls.length<6){
g.spawnT=1.1;
const i=ri(0,1),ang=rnd(-.6,.6),spd=rnd(200,280);
g.balls.push({x:i?675:225,y:rnd(150,350),vx:Math.cos(ang)*spd*(i?-1:1),vy:Math.sin(ang)*spd});
}
g.pd.forEach((p,i)=>{
const I=g.I[i];
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*340*dt,i*450+40,i*450+410);
});
g.balls.forEach(b=>{
b.x+=b.vx*dt;b.y+=b.vy*dt;
if(b.y<40||b.y>H-40)b.vy*=-1;
g.pd.forEach((p,i)=>{
if(b.y>440&&b.y<460&&Math.abs(b.x-p.x)<55&&((i===0&&b.vx<0)||(i===1&&b.vx>0))){
b.vx=-b.vx*1.05;b.vy+=(b.x-p.x)*4;FX.tone(400,.05,"square",.03);
}
});
});
g.balls=g.balls.filter(b=>{
if(b.x<-20){g.s[1]++;FX.playScore();return false;}
if(b.x>W+20){g.s[0]++;FX.playScore();return false;}
return true;
});
if(g.tl>30)g.byScore(g.s);
},
draw(g,ctx){
g.floor("#0a0e22","#101a3a");
ctx.fillStyle="rgba(255,255,255,.15)";
for(let y=60;y<H-40;y+=20)ctx.fillRect(W/2-2,y,4,10);
g.pd.forEach((p,i)=>{
ctx.fillStyle=col(i);ctx.fillRect(p.x-50,440,100,14);
ctx.fillStyle="rgba(255,255,255,.4)";ctx.fillRect(p.x-46,442,92,3);
});
g.balls.forEach(b=>{
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x,b.y,10,0,Math.PI*2);ctx.fill();
ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.stroke();
});
g.text("P1 "+g.s[0],20,30,20,C1);
g.text("P2 "+g.s[1],W-20,30,20,C2,"right");
g.text(Math.max(0,Math.ceil(30-g.tl))+"s",W/2,30,22,GOLD,"center");
}
});

/* ---------- 7. CEILING WALKER ---------- */
micro({id:"ceilingGame",title:"Ceiling Walker",desc:"One on the floor, one on the ceiling. Vertical combat.",
cat:"action",key:"ceiling",win:5,
controls:"P1 (ceiling): A/D move, SPACE shoot　 P2 (floor): ←/→, ENTER — bullets travel straight up/down. Lead your shots.",
round(g){
g.p1={x:200,y:80,cd:0};
g.p2={x:200,y:H-80,cd:0};
g.bullets=[];
},
update(g,dt){
g.p1.cd=Math.max(0,g.p1.cd-dt);
g.p2.cd=Math.max(0,g.p2.cd-dt);
g.p1.x=cl(g.p1.x+((g.I[0].r?1:0)-(g.I[0].l?1:0))*320*dt,20,W-20);
g.p2.x=cl(g.p2.x+((g.I[1].r?1:0)-(g.I[1].l?1:0))*320*dt,20,W-20);
if(g.I[0].a&&g.p1.cd<=0){g.p1.cd=.45;g.bullets.push({x:g.p1.x,y:g.p1.y+22,vy:420,o:0});FX.tone(700,.06,"square",.03,-300);}
if(g.I[1].a&&g.p2.cd<=0){g.p2.cd=.45;g.bullets.push({x:g.p2.x,y:g.p2.y-22,vy:-420,o:1});FX.tone(700,.06,"square",.03,-300);}
for(const b of g.bullets){
b.y+=b.vy*dt;
if(b.y<-20||b.y>H+20)b.dead=true;
const t=b.o===0?g.p2:g.p1;
if(!b.dead&&Math.hypot(b.x-t.x,b.y-t.y)<24){
b.dead=true;g.burst(t.x,t.y,col(b.o),16,320);playHitSound();
g.point(b.o,"HIT");return;
}
}
g.bullets=g.bullets.filter(b=>!b.dead);
},
draw(g,ctx){
g.floor("#1a1230","#201a3a");
ctx.fillStyle="#4a3a6a";ctx.fillRect(0,0,W,60);ctx.fillRect(0,H-60,W,60);
ctx.fillStyle="#6a56b8";ctx.fillRect(0,55,W,5);ctx.fillRect(0,H-60,W,5);
g.bullets.forEach(b=>{
const dir=b.vy>0?1:-1;
ctx.fillStyle=col(b.o);ctx.fillRect(b.x-2,b.y-8*dir,4,8*dir);
ctx.fillStyle="#fff";ctx.fillRect(b.x-1,b.y-4*dir,2,4*dir);
});
g.blob({x:g.p1.x,y:g.p1.y,r:16},C1,g.p1.x,g.p1.y+80,false);
g.blob({x:g.p2.x,y:g.p2.y,r:16},C2,g.p2.x,g.p2.y-80,false);
g.text("P1 ▲",20,30,18,C1);g.text("P2 ▼",W-20,30,18,C2,"right");
}
});

/* ---------- 8. INVERTED RACE ---------- */
micro({id:"invertraceGame",title:"Inverted Race",desc:"Same track. P2's controls are flipped.",
cat:"action",key:"invertrace",win:3,
controls:"P1: A/D normal　 P2: ←/→ REVERSED — first to 4000m wins. P2's handicap: pressing RIGHT moves LEFT.",
round(g){
g.dist=[0,0];
g.pl=[{x:225,vx:0},{x:225,vx:0}];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
const rawDir=(I.r?1:0)-(I.l?1:0);
const dir=i===1?-rawDir:rawDir;
p.vx+=dir*500*dt;
p.vx*=.92;
if(Math.abs(p.vx)>320)p.vx=320*Math.sign(p.vx);
p.x=cl(p.x+p.vx*dt,60,390);
g.dist[i]+=180*dt;
});
const done=g.dist.map(d=>d>=4000);
if(done[0]&&done[1])g.next("PHOTO FINISH");
else if(done[0])g.point(0,"P1 FIRST");
else if(done[1])g.point(1,"P2 FIRST");
},
draw(g,ctx){
for(let i=0;i<2;i++){
const off=i*450;
ctx.fillStyle=i?"#1a2a5a":"#2a1a5a";ctx.fillRect(off,0,450,H);
ctx.fillStyle="#2a2f45";ctx.fillRect(off,380,450,80);
ctx.fillStyle="rgba(255,255,255,.3)";for(let x=0;x<450;x+=60)ctx.fillRect(off+x,416,30,4);
g.text("P"+(i+1)+(i===1?" (INVERTED)":""),off+225,40,18,col(i),"center");
g.text(Math.round(g.dist[i])+" / 4000m",off+225,70,16,"#fff","center");
ctx.fillStyle="#2a2f63";ctx.fillRect(off+75,90,300,8);
ctx.fillStyle=col(i);ctx.fillRect(off+75,90,300*(g.dist[i]/4000),8);
g.blob({x:off+g.pl[i].x,y:420,r:16},col(i),off+g.pl[i].x+g.pl[i].vx*.2,420,g.pl[i].vx!==0);
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});
})();