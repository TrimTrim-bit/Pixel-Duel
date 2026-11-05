/* =====================================================
   GAME PACK K — 8 unique mechanics
   Spotlight, Clone Army, Charge Joust, Weight of Gold,
   Gravity Well, Boomerang Battle, Shockwave, Shrinking Ring
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* ---------- 1. SPOTLIGHT ---------- */
micro({id:"spotlightGame",title:"Spotlight",desc:"Moving light burns. Dash your rival into it.",
cat:"action",key:"spotlight",win:5,
controls:"P1: WASD move, SPACE dash　 P2: ARROWS, ENTER dash — the spotlight damages anyone inside. Dash to shove your rival in.",
round(g){
g.spot={x:450,y:250,r:90,vx:140,vy:100};
g.pl=[
{x:200,y:150,hp:3,dash:0,dashCd:0,ddx:1,ddy:0,dmg:0},
{x:700,y:350,hp:3,dash:0,dashCd:0,ddx:-1,ddy:0,dmg:0}
];
},
update(g,dt){
g.spot.x+=g.spot.vx*dt;g.spot.y+=g.spot.vy*dt;
if(g.spot.x<g.spot.r){g.spot.x=g.spot.r;g.spot.vx=Math.abs(g.spot.vx);}
if(g.spot.x>W-g.spot.r){g.spot.x=W-g.spot.r;g.spot.vx=-Math.abs(g.spot.vx);}
if(g.spot.y<g.spot.r+40){g.spot.y=g.spot.r+40;g.spot.vy=Math.abs(g.spot.vy);}
if(g.spot.y>H-g.spot.r){g.spot.y=H-g.spot.r;g.spot.vy=-Math.abs(g.spot.vy);}
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.dashCd=Math.max(0,p.dashCd-dt);
if(p.dash>0){p.dash-=dt;p.x+=p.ddx*720*dt;p.y+=p.ddy*720*dt;}
else{
const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0),l=Math.hypot(ax,ay)||1;
p.x+=ax/l*200*dt;p.y+=ay/l*200*dt;
if(I.a&&p.dashCd<=0&&(ax||ay)){p.dash=.16;p.dashCd=1.4;p.ddx=ax/l;p.ddy=ay/l;FX.tone(500,.1,"sawtooth",.04,300);}
}
p.x=cl(p.x,20,W-20);p.y=cl(p.y,60,H-20);
if(Math.hypot(p.x-g.spot.x,p.y-g.spot.y)<g.spot.r)p.dmg+=dt;
if(p.dmg>=.6){p.hp--;p.dmg=0;g.burst(p.x,p.y,RED,14,300);playHitSound();
if(p.hp<=0){g.point(1-i,"BURNED");return;}}
});
const [a,b]=g.pl,d=Math.hypot(a.x-b.x,a.y-b.y);
if(d<34&&d>0){
const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d;
if(a.dash>0){b.x+=nx*40;b.y+=ny*40;b.dmg+=.25;}
if(b.dash>0){a.x-=nx*40;a.y-=ny*40;a.dmg+=.25;}
else{a.x-=nx*3;a.y-=ny*3;b.x+=nx*3;b.y+=ny*3;}
}
},
draw(g,ctx){
g.floor("#0a1020","#121a3a");
const gr=ctx.createRadialGradient(g.spot.x,g.spot.y,10,g.spot.x,g.spot.y,g.spot.r);
gr.addColorStop(0,"rgba(255,230,109,.6)");
gr.addColorStop(.7,"rgba(255,180,60,.2)");
gr.addColorStop(1,"rgba(255,230,109,0)");
ctx.fillStyle=gr;ctx.beginPath();ctx.arc(g.spot.x,g.spot.y,g.spot.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle=GOLD;ctx.lineWidth=3;ctx.beginPath();ctx.arc(g.spot.x,g.spot.y,g.spot.r,0,Math.PI*2);ctx.stroke();
g.pl.forEach((p,i)=>{
ctx.globalAlpha=p.dash>0?.5:1;
g.blob({x:p.x,y:p.y,r:15},col(i),p.x+80,p.y,p.dash>0);
ctx.globalAlpha=1;
for(let k=0;k<3;k++){
ctx.fillStyle=k<p.hp?RED:"#2a2f63";
ctx.fillRect(i?W-30-k*20:10+k*20,55,16,10);
}
});
}
});

/* ---------- 2. CLONE ARMY ---------- */
micro({id:"cloneGame",title:"Clone Army",desc:"Spawn clones. March them into your rival.",
cat:"action",key:"clone",win:3,
controls:"P1: A/D move, SPACE spawn clone　 P2: ←/→, ENTER — clones march forward and damage the rival. 3 HP each.",
round(g){
g.pl=[
{x:100,y:250,meter:0,hp:3},
{x:800,y:250,meter:0,hp:3}
];
g.clones=[];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*220*dt,40,W-40);
p.meter=Math.min(1,p.meter+dt*.4);
if(I.a&&p.meter>=1){
p.meter=0;
g.clones.push({x:p.x+((i?-1:1)*30),y:p.y,i,vx:(i?-1:1)*80,life:6});
FX.tone(500,.15,"triangle",.05,200);
}
});
g.clones.forEach(c=>{
c.x+=c.vx*dt;c.life-=dt;
const t=g.pl[1-c.i];
if(Math.hypot(c.x-t.x,c.y-t.y)<28){
t.hp--;c.life=0;
g.burst(t.x,t.y,col(c.i),12,300);playHitSound();
if(t.hp<=0){g.point(c.i,"DESTROYED");return;}
}
});
g.clones=g.clones.filter(c=>c.life>0&&c.x>20&&c.x<W-20);
},
draw(g,ctx){
g.floor("#101a3a","#1a2548");
ctx.fillStyle="rgba(255,255,255,.1)";ctx.fillRect(W/2-3,40,6,H-40);
g.clones.forEach(c=>{
ctx.fillStyle=col(c.i);ctx.globalAlpha=Math.min(1,c.life/2);
ctx.beginPath();ctx.arc(c.x,c.y,12,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.globalAlpha=1;
});
g.pl.forEach((p,i)=>{
g.blob({x:p.x,y:p.y,r:18},col(i),p.x+60,p.y,false);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+30,60,8);
ctx.fillStyle=p.meter>=1?GOLD:"#4a8aff";
ctx.fillRect(p.x-30,p.y+30,60*p.meter,8);
for(let k=0;k<3;k++){
ctx.fillStyle=k<p.hp?RED:"#2a2f63";
ctx.fillRect(i?W-80-k*18:20+k*18,55,14,14);
}
});
}
});

/* ---------- 3. CHARGE JOUST ---------- */
micro({id:"chargejoustGame",title:"Charge Joust",desc:"Hold to charge, release to fire. First hit scores.",
cat:"reflex",key:"chargejoust",win:3,
controls:"P1: hold SPACE to charge, release to fire　 P2: hold ENTER — the longer you charge the faster the shot. But charging telegraphs.",
round(g){
g.pl=[
{x:120,y:250,charge:0,cooldown:0,proj:null},
{x:780,y:250,charge:0,cooldown:0,proj:null}
];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.cooldown=Math.max(0,p.cooldown-dt);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*260*dt,80,H-80);
if(p.proj){
p.proj.x+=p.proj.vx*dt;p.proj.y+=p.proj.vy*dt;
if(p.proj.x<-30||p.proj.x>W+30||p.proj.y<40||p.proj.y>H-40)p.proj=null;
}else if(p.cooldown<=0){
if(I.a){p.charge=Math.min(1,p.charge+dt*1.6);}
else if(p.charge>0){
const t=g.pl[1-i];
const dx=t.x-p.x,dy=t.y-p.y,d=Math.hypot(dx,dy)||1;
const speed=300+p.charge*450;
p.proj={x:p.x+dx/d*30,y:p.y+dy/d*30,vx:dx/d*speed,vy:dy/d*speed,o:i,charged:p.charge};
p.charge=0;p.cooldown=.4;
FX.playShoot();
}
}
});
g.pl.forEach((p,i)=>{
if(!p.proj)return;
const t=g.pl[1-i];
if(Math.hypot(p.proj.x-t.x,p.proj.y-t.y)<24){
g.burst(t.x,t.y,col(i),24,400);
FX.playBoom();
g.point(i,"DIRECT HIT");
}
});
},
draw(g,ctx){
g.floor("#1a1030","#241848");
g.pl.forEach((p,i)=>{
if(p.charge>0){
const r=22+p.charge*30;
ctx.strokeStyle=GOLD;ctx.lineWidth=4;
ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.stroke();
ctx.globalAlpha=.2;ctx.fillStyle=GOLD;
ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
}
ctx.fillStyle=col(i);
ctx.beginPath();ctx.arc(p.x,p.y,22,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
if(p.proj){
ctx.fillStyle=col(i);
ctx.beginPath();ctx.arc(p.proj.x,p.proj.y,10,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#fff";
ctx.beginPath();ctx.arc(p.proj.x,p.proj.y,4,0,Math.PI*2);ctx.fill();
}
});
g.text("P1: SPACE",200,60,16,C1,"center");
g.text("P2: ENTER",700,60,16,C2,"center");
}
});

/* ---------- 4. WEIGHT OF GOLD ---------- */
micro({id:"goldweightGame",title:"Weight of Gold",desc:"Collect coins. Get slower. Balance greed.",
cat:"arcade",key:"goldweight",win:1,hud:false,
controls:"P1: WASD move　 P2: ARROWS — each coin makes you heavier and slower. Most coins in 30s wins.",
init(g){
g.s=[0,0];g.tl=0;g.spawnT=0;
g.pl=[
{x:200,y:150,w:1},
{x:700,y:350,w:1}
];
g.coins=[];
},
update(g,dt){
g.tl+=dt;g.spawnT-=dt;
if(g.spawnT<=0&&g.coins.length<6){g.spawnT=1.2;
g.coins.push({x:80+rnd(0,W-160),y:80+rnd(0,H-160)});
}
g.pl.forEach((p,i)=>{
const I=g.I[i];
const speed=Math.max(80,260-(p.w-1)*30);
const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0);
const l=Math.hypot(ax,ay)||1;
p.x+=ax/l*speed*dt;p.y+=ay/l*speed*dt;
p.x=cl(p.x,20,W-20);p.y=cl(p.y,60,H-20);
for(const c of g.coins){
if(!c.got&&Math.hypot(p.x-c.x,p.y-c.y)<20){
c.got=true;p.w+=1;g.s[i]++;
g.burst(c.x,c.y,GOLD,8,200);
FX.tone(700,.05,"square",.04,200);
}
}
});
g.coins=g.coins.filter(c=>!c.got);
if(g.tl>30)g.byScore(g.s);
},
draw(g,ctx){
g.floor("#141020","#1a1430");
g.coins.forEach(c=>{
ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(c.x,c.y,12,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(c.x-4,c.y-4,3,0,Math.PI*2);ctx.fill();
});
g.pl.forEach((p,i)=>{
const r=14+Math.min(14,(p.w-1)*1.5);
g.blob({x:p.x,y:p.y,r},col(i),p.x+60,p.y,false);
g.text("P"+(i+1)+" ×"+p.w,i?W-40:40,40,16,col(i),i?"right":"left");
});
g.text("P1 "+g.s[0],20,80,22,C1);
g.text("P2 "+g.s[1],W-20,80,22,C2,"right");
g.text(Math.max(0,Math.ceil(30-g.tl))+"s",W/2,30,22,GOLD,"center");
}
});

/* ---------- 5. GRAVITY WELL ---------- */
micro({id:"gravitywellGame",title:"Gravity Well",desc:"Fight the pull. Shove rival into the well.",
cat:"action",key:"gravitywell",win:3,
controls:"P1: WASD move, SPACE dash　 P2: ARROWS, ENTER dash — the center pulls you in. Last one out wins.",
round(g){
g.well={x:W/2,y:H/2+20,r:60};
g.pl=[
{x:150,y:150,vx:0,vy:0,dash:0,dashCd:0,ddx:1,ddy:0},
{x:750,y:350,vx:0,vy:0,dash:0,dashCd:0,ddx:-1,ddy:0}
];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.dashCd=Math.max(0,p.dashCd-dt);
const dx=g.well.x-p.x,dy=g.well.y-p.y,d=Math.max(Math.hypot(dx,dy),40);
const pull=18000/(d*d);
p.vx+=dx/d*pull*dt;p.vy+=dy/d*pull*dt;
if(p.dash>0){p.dash-=dt;p.x+=p.ddx*600*dt;p.y+=p.ddy*600*dt;}
else{
const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0),l=Math.hypot(ax,ay)||1;
p.vx+=ax/l*400*dt;p.vy+=ay/l*400*dt;
if(I.a&&p.dashCd<=0&&(ax||ay)){p.dash=.14;p.dashCd=1.2;p.ddx=ax/l;p.ddy=ay/l;FX.tone(500,.08,"sawtooth",.04,300);}
}
p.vx*=.96;p.vy*=.96;
p.x=cl(p.x+p.vx*dt,20,W-20);p.y=cl(p.y+p.vy*dt,60,H-20);
if(Math.hypot(p.x-g.well.x,p.y-g.well.y)<g.well.r){
g.burst(p.x,p.y,col(i),20,400);FX.playBoom();
g.point(1-i,"SWALLOWED");
return;
}
});
const [a,b]=g.pl,d=Math.hypot(a.x-b.x,a.y-b.y);
if(d<34&&d>0){
const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d;
if(a.dash>0){b.vx+=nx*400;b.vy+=ny*400;}
if(b.dash>0){a.vx-=nx*400;a.vy-=ny*400;}
else{a.x-=nx*3;a.y-=ny*3;b.x+=nx*3;b.y+=ny*3;}
}
},
draw(g,ctx){
g.floor("#0a1020","#121a3a");
const gr=ctx.createRadialGradient(g.well.x,g.well.y,10,g.well.x,g.well.y,g.well.r*2);
gr.addColorStop(0,"rgba(120,60,200,.9)");
gr.addColorStop(1,"rgba(120,60,200,0)");
ctx.fillStyle=gr;ctx.beginPath();ctx.arc(g.well.x,g.well.y,g.well.r*2,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#9c4aff";ctx.lineWidth=3;
ctx.beginPath();ctx.arc(g.well.x,g.well.y,g.well.r,0,Math.PI*2);ctx.stroke();
for(let k=0;k<3;k++){
ctx.beginPath();ctx.arc(g.well.x,g.well.y,g.well.r-k*15,g.t*.5,Math.PI*2+g.t*.5);ctx.stroke();
}
g.pl.forEach((p,i)=>{ctx.globalAlpha=p.dash>0?.5:1;
g.blob({x:p.x,y:p.y,r:15},col(i),g.well.x,g.well.y,p.dash>0);ctx.globalAlpha=1;});
}
});

/* ---------- 6. BOOMERANG BATTLE ---------- */
micro({id:"boomerangGame",title:"Boomerang Battle",desc:"Throw boomerangs. Catch them to reload.",
cat:"reflex",key:"boomerang",win:5,
controls:"P1: WASD move, SPACE throw　 P2: ARROWS, ENTER — boomerangs come back. Catch to recharge.",
round(g){
g.pl=[
{x:200,y:250,ammo:2,max:2,cd:0,hp:5},
{x:700,y:250,ammo:2,max:2,cd:0,hp:5}
];
g.band=[];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.cd=Math.max(0,p.cd-dt);
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*260*dt,30,W-30);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*260*dt,60,H-30);
if(I.a&&p.cd<=0&&p.ammo>0){
const t=g.pl[1-i];
const dx=t.x-p.x,dy=t.y-p.y,d=Math.hypot(dx,dy)||1;
g.band.push({x:p.x,y:p.y,vx:dx/d*400,vy:dy/d*400,o:i,phase:"out",life:1.4,hit:false});
p.ammo--;p.cd=.4;
FX.tone(600,.08,"triangle",.04,-200);
}
g.band.forEach(b=>{
if(b.phase==="back"&&b.o===i&&Math.hypot(b.x-p.x,b.y-p.y)<30){
b.done=true;p.ammo=Math.min(p.max,p.ammo+1);
FX.tone(800,.08,"square",.04,200);
}
});
});
g.band.forEach(b=>{
b.x+=b.vx*dt;b.y+=b.vy*dt;
b.life-=dt;
if(b.phase==="out"&&b.life<=0)b.phase="back";
if(b.phase==="back"){
const t=g.pl[b.o];
const dx=t.x-b.x,dy=t.y-b.y,d=Math.hypot(dx,dy)||1;
b.vx=dx/d*450;b.vy=dy/d*450;
if(b.x<0||b.x>W||b.y<40||b.y>H)b.done=true;
}else if(b.x<0||b.x>W)b.vx*=-1;
const opp=g.pl[1-b.o];
if(b.phase==="out"&&!b.hit&&Math.hypot(b.x-opp.x,b.y-opp.y)<28){
b.hit=true;opp.hp--;b.phase="back";
g.burst(opp.x,opp.y,col(b.o),10,300);playHitSound();
if(opp.hp<=0){g.point(b.o,"K.O.");return;}
}
});
g.band=g.band.filter(b=>!b.done);
},
draw(g,ctx){
g.floor("#101a3a","#1a2548");
g.band.forEach(b=>{
ctx.fillStyle=col(b.o);ctx.globalAlpha=.9;
ctx.beginPath();ctx.arc(b.x,b.y,10,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#fff";ctx.lineWidth=2;
ctx.beginPath();ctx.arc(b.x,b.y,5,b.life*10,b.life*10+Math.PI);ctx.stroke();
ctx.globalAlpha=1;
});
g.pl.forEach((p,i)=>{
g.blob({x:p.x,y:p.y,r:15},col(i),p.x+60,p.y,false);
for(let k=0;k<p.ammo;k++){
ctx.fillStyle=GOLD;
ctx.beginPath();ctx.arc(i?W-30-k*16:20+k*16,55,7,0,Math.PI*2);ctx.fill();
}
g.text("HP "+(p.hp),i?W-40:40,80,14,col(i),i?"right":"left");
});
}
});

/* ---------- 7. SHOCKWAVE ---------- */
micro({id:"shockwaveGame",title:"Shockwave",desc:"Slam the ground. Jump to dodge the wave.",
cat:"action",key:"shockwave",win:5,
controls:"P1: A/D move, W jump, SPACE slam　 P2: ←/→, ↑, ENTER — slam sends a wave along the ground. Jump to dodge.",
round(g){
g.pl=[
{x:150,y:400,vy:0,grounded:true,cd:0,hp:3},
{x:750,y:400,vy:0,grounded:true,cd:0,hp:3}
];
g.waves=[];
g.ground=440;
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.cd=Math.max(0,p.cd-dt);
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*280*dt,30,W-30);
p.vy+=1500*dt;
p.y+=p.vy*dt;
if(p.y>=g.ground){p.y=g.ground;p.vy=0;p.grounded=true;}else{p.grounded=false;}
if(I.u&&p.grounded){p.vy=-620;p.grounded=false;FX.tone(400,.08,"square",.03,200);}
if(I.a&&p.grounded&&p.cd<=0){
p.cd=.7;
g.waves.push({x:p.x,y:g.ground,vx:(i?-1:1)*400,o:i,life:1.2,hit:false});
FX.playBoom();
}
});
g.waves.forEach(w=>{
w.x+=w.vx*dt;w.life-=dt;
const t=g.pl[1-w.o];
if(!w.hit&&t.y>=g.ground-25&&Math.abs(t.x-w.x)<25){
w.hit=true;t.hp--;
g.burst(t.x,g.ground,col(w.o),16,320);playHitSound();
if(t.hp<=0){g.point(w.o,"K.O.");}
}
});
g.waves=g.waves.filter(w=>!w.hit&&w.life>0&&w.x>-30&&w.x<W+30);
},
draw(g,ctx){
g.floor("#1a1030","#241848");
ctx.fillStyle="#4a3a6a";ctx.fillRect(0,g.ground,W,H-g.ground);
ctx.fillStyle="#6a56b8";ctx.fillRect(0,g.ground,W,5);
g.waves.forEach(w=>{
const h=25+Math.sin(g.t*20)*5;
ctx.fillStyle=col(w.o);ctx.globalAlpha=.6;
ctx.beginPath();ctx.ellipse(w.x,g.ground,18,h,0,Math.PI,0);ctx.fill();
ctx.strokeStyle=col(w.o);ctx.lineWidth=3;ctx.globalAlpha=1;
ctx.beginPath();ctx.ellipse(w.x,g.ground,18,h,0,Math.PI,0);ctx.stroke();
});
g.pl.forEach((p,i)=>{
g.blob({x:p.x,y:p.y,r:16},col(i),p.x+60,p.y,p.vy!==0);
for(let k=0;k<3;k++){
ctx.fillStyle=k<p.hp?RED:"#2a2f63";
ctx.fillRect(i?W-30-k*18:20+k*18,55,14,12);
}
});
}
});

/* ---------- 8. SHRINKING RING ---------- */
micro({id:"shrinkringGame",title:"Shrinking Ring",desc:"Arena collapses. Stay inside. Push rival out.",
cat:"action",key:"shrinkring",win:3,
controls:"P1: WASD move, SPACE dash　 P2: ARROWS, ENTER dash — the safe ring shrinks. Push your rival outside.",
round(g){
g.ring={x:W/2,y:H/2+20,r:280,target:60,shrinkRate:.3};
g.pl=[
{x:W/2-150,y:H/2,vx:0,vy:0,dash:0,dashCd:0,ddx:1,ddy:0},
{x:W/2+150,y:H/2,vx:0,vy:0,dash:0,dashCd:0,ddx:-1,ddy:0}
];
g.deadT=0;
},
update(g,dt){
if(g.ring.r>g.ring.target)g.ring.r-=g.ring.shrinkRate*dt;
const out=[false,false];
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.dashCd=Math.max(0,p.dashCd-dt);
if(p.dash>0){p.dash-=dt;p.x+=p.ddx*600*dt;p.y+=p.ddy*600*dt;}
else{
const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0),l=Math.hypot(ax,ay)||1;
p.x+=ax/l*240*dt;p.y+=ay/l*240*dt;
if(I.a&&p.dashCd<=0&&(ax||ay)){p.dash=.14;p.dashCd=1.2;p.ddx=ax/l;p.ddy=ay/l;FX.tone(500,.08,"sawtooth",.04,300);}
}
p.x=cl(p.x,20,W-20);p.y=cl(p.y,60,H-20);
if(Math.hypot(p.x-g.ring.x,p.y-g.ring.y)>g.ring.r-16)out[i]=true;
});
const [a,b]=g.pl,d=Math.hypot(a.x-b.x,a.y-b.y);
if(d<34&&d>0){
const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d;
if(a.dash>0){b.x+=nx*40;b.y+=ny*40;}
if(b.dash>0){a.x-=nx*40;a.y-=ny*40;}
else{a.x-=nx*2;a.y-=ny*2;b.x+=nx*2;b.y+=ny*2;}
}
g.deadT+=dt;
if(out[0]&&out[1]){g.next("BOTH OUT");return;}
if(out[0]){if(g.deadT>.4)g.point(1,"P1 OUT");return;}
if(out[1]){if(g.deadT>.4)g.point(0,"P2 OUT");return;}
g.deadT=0;
},
draw(g,ctx){
g.floor("#0a1020","#121a3a");
const gr=ctx.createRadialGradient(g.ring.x,g.ring.y,g.ring.r*.7,g.ring.x,g.ring.y,g.ring.r);
gr.addColorStop(0,"rgba(100,234,255,.1)");
gr.addColorStop(1,"rgba(255,90,120,.5)");
ctx.fillStyle=gr;ctx.beginPath();ctx.arc(g.ring.x,g.ring.y,g.ring.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ff5a78";ctx.lineWidth=6;
ctx.beginPath();ctx.arc(g.ring.x,g.ring.y,g.ring.r,0,Math.PI*2);ctx.stroke();
g.pl.forEach((p,i)=>{ctx.globalAlpha=p.dash>0?.5:1;
g.blob({x:p.x,y:p.y,r:15},col(i),p.x+60,p.y,p.dash>0);ctx.globalAlpha=1;});
}
});
})();