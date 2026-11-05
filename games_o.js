/* =====================================================
   GAME PACK O — 8 tactical games (FIXED)
   Ghost Hunt, Laser Web, Turret Wars, Warp Maze,
   Pressure Plates, Spinning Blades, Minefield Duel, Puzzle Arena
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* ---------- 1. GHOST HUNT ---------- */
micro({id:"ghosthuntGame",title:"Ghost Hunt",desc:"One invisible ghost leaves footprints. Hunter follows.",
cat:"reflex",key:"ghosthunt",win:3,
controls:"Ghost: WASD (invisible). Hunter: WASD — hunter touches ghost to win. Ghost survives 20s to win.",
round(g){
g.ghost=Math.random()<.5?0:1;g.hunter=1-g.ghost;
g.pos=[{x:200,y:200},{x:700,y:300}];
g.footprints=[];g.tl=20;g.fpT=0;
},
update(g,dt){
g.tl-=dt;g.fpT-=dt;
g.pos.forEach((p,i)=>{
const I=g.I[i],sp=i===g.ghost?250:220;
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*sp*dt,20,W-20);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*sp*dt,60,H-20);
});
if(g.fpT<=0){
const gpos=g.pos[g.ghost];
g.footprints.push({x:gpos.x,y:gpos.y,life:1.5});
g.fpT=.4;
}
g.footprints.forEach(f=>f.life-=dt);
g.footprints=g.footprints.filter(f=>f.life>0);
const gh=g.pos[g.ghost],hu=g.pos[g.hunter];
if(Math.hypot(gh.x-hu.x,gh.y-hu.y)<28){g.point(g.hunter,"CAUGHT!");return;}
if(g.tl<=0)g.point(g.ghost,"ESCAPED!");
},
draw(g,ctx){
g.floor("#0a0a1a","#101028");
g.footprints.forEach(f=>{
ctx.fillStyle=`rgba(100,234,255,${f.life*.6})`;
ctx.beginPath();ctx.arc(f.x,f.y,8,0,Math.PI*2);ctx.fill();
});
const hu=g.pos[g.hunter];
g.blob({x:hu.x,y:hu.y,r:16},col(g.hunter),hu.x+60,hu.y,false);
g.text((g.ghost===0?"P1":"P2")+" = GHOST",W/2,40,18,GOLD,"center");
g.text(Math.max(0,Math.ceil(g.tl))+"s",W/2,66,24,GOLD,"center");
}
});

/* ---------- 2. LASER WEB ---------- */
micro({id:"laserwebGame",title:"Laser Web",desc:"Navigate between moving lasers to the goal.",
cat:"reflex",key:"laserweb",win:3,
controls:"P1: WASD move　 P2: ARROWS — reach the green zone. Lasers drain HP on contact.",
round(g){
g.pl=[{x:100,y:250,hp:3,flash:0},{x:800,y:250,hp:3,flash:0}];
g.lasers=[
{type:"v",pos:200,amp:100,sp:1.2,ph:0},
{type:"h",pos:150,amp:100,sp:1.5,ph:1},
{type:"v",pos:450,amp:150,sp:1.0,ph:2},
{type:"h",pos:350,amp:100,sp:1.3,ph:3},
{type:"v",pos:700,amp:100,sp:1.7,ph:4}
];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*280*dt,20,W-20);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*280*dt,60,H-20);
p.flash=Math.max(0,p.flash-dt);
});
g.lasers.forEach(L=>{
if(L.type==="v"){
const x=L.pos+Math.sin(g.t*L.sp+L.ph)*L.amp;
g.pl.forEach((p,i)=>{
if(Math.abs(p.x-x)<6){p.hp-=dt*3;p.flash=.15;
if(p.hp<=0)g.point(1-i,"BURNED");}
});
}else{
const y=L.pos+Math.sin(g.t*L.sp+L.ph)*L.amp;
g.pl.forEach((p,i)=>{
if(Math.abs(p.y-y)<6){p.hp-=dt*3;p.flash=.15;
if(p.hp<=0)g.point(1-i,"BURNED");}
});
}
});
[0,1].forEach(i=>{
if(g.pl[i].hp>0&&g.pl[i].x>=W-50)g.point(i,"REACHED");
});
},
draw(g,ctx){
g.floor("#0a0a1a","#151528");
g.lasers.forEach(L=>{
if(L.type==="v"){
const x=L.pos+Math.sin(g.t*L.sp+L.ph)*L.amp;
ctx.fillStyle="rgba(255,90,120,.3)";ctx.fillRect(x-15,40,30,H-60);
ctx.fillStyle="#ff5a78";ctx.fillRect(x-3,40,6,H-60);
}else{
const y=L.pos+Math.sin(g.t*L.sp+L.ph)*L.amp;
ctx.fillStyle="rgba(255,90,120,.3)";ctx.fillRect(0,y-15,W,30);
ctx.fillStyle="#ff5a78";ctx.fillRect(0,y-3,W,6);
}
});
ctx.fillStyle=GREEN;ctx.fillRect(W-40,200,30,200);
g.pl.forEach((p,i)=>{
if(p.flash>0){ctx.fillStyle=`rgba(255,255,255,${p.flash*2})`;ctx.fillRect(i*450,0,450,H);}
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,false);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,6);
ctx.fillStyle=p.hp>1?GREEN:RED;
ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/3,6);
});
}
});

/* ---------- 3. TURRET WARS ---------- */
micro({id:"turretwarsGame",title:"Turret Wars",desc:"Place turrets. They auto-fire. Destroy rival.",
cat:"action",key:"turretwars",win:3,
controls:"P1: WASD move, SPACE place turret　 P2: ARROWS, ENTER — turrets fire at rival automatically. 3 HP each.",
round(g){
g.pl=[{x:200,y:250,hp:3,cd:0},{x:700,y:250,hp:3,cd:0}];
g.turrets=[];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.cd=Math.max(0,p.cd-dt);
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*240*dt,20,W-20);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*240*dt,60,H-20);
if(I.a&&p.cd<=0){
p.cd=.6;
g.turrets.push({x:p.x,y:p.y,o:i,fireT:.8,hp:2});
FX.tone(400,.1,"square",.04);
}
});
g.turrets.forEach(t=>{
if(t.dead)return;
t.fireT-=dt;
if(t.fireT<=0){
t.fireT=1;
const o=g.pl[1-t.o];
const dx=o.x-t.x,dy=o.y-t.y,d=Math.hypot(dx,dy)||1;
g.turrets.push({bullet:true,x:t.x,y:t.y,vx:dx/d*360,vy:dy/d*360,o:t.o,life:1.5});
}
});
for(const t of g.turrets){
if(t.bullet){
t.x+=t.vx*dt;t.y+=t.vy*dt;t.life-=dt;
if(t.life<=0)t.dead=true;
const o=g.pl[1-t.o];
if(!t.dead&&Math.hypot(t.x-o.x,t.y-o.y)<22){
t.dead=true;o.hp--;
g.burst(o.x,o.y,col(t.o),14,300);playHitSound();
if(o.hp<=0)g.point(t.o,"DESTROYED");
}
}
}
g.turrets.forEach(t=>{
if(t.bullet||t.dead)return;
const o=g.pl[1-t.o];
if(Math.hypot(o.x-t.x,o.y-t.y)<22){t.hp-=dt*2;if(t.hp<=0)t.dead=true;}
});
g.turrets=g.turrets.filter(t=>!t.dead);
},
draw(g,ctx){
g.floor("#101a3a","#1a2548");
g.turrets.forEach(t=>{
if(t.bullet){ctx.fillStyle=col(t.o);ctx.beginPath();ctx.arc(t.x,t.y,5,0,Math.PI*2);ctx.fill();return;}
ctx.fillStyle=col(t.o);ctx.fillRect(t.x-12,t.y-12,24,24);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(t.x-12,t.y-12,24,24);
ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(t.x,t.y,5,0,Math.PI*2);ctx.fill();
});
g.pl.forEach((p,i)=>{
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,false);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,6);
ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/3,6);
});
}
});

/* ---------- 4. WARP MAZE ---------- */
micro({id:"warpmazeGame",title:"Warp Maze",desc:"Random teleporters fling you around. Reach goal.",
cat:"reflex",key:"warpmaze",win:3,
controls:"P1: WASD　 P2: ARROWS — step on a warp zone to teleport. Reach the green goal first.",
round(g){
g.pl=[{x:80,y:250},{x:820,y:250}];
g.warps=Array.from({length:5},(_,k)=>({
a:{x:100+Math.random()*(W-200),y:100+Math.random()*(H-200)},
b:{x:100+Math.random()*(W-200),y:100+Math.random()*(H-200)}
}));
g.cd=[0,0];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
g.cd[i]=Math.max(0,g.cd[i]-dt);
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*280*dt,20,W-20);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*280*dt,60,H-20);
if(g.cd[i]<=0){
for(const w of g.warps){
if(Math.hypot(p.x-w.a.x,p.y-w.a.y)<20){
p.x=w.b.x;p.y=w.b.y;g.cd[i]=.6;
FX.tone(800,.1,"triangle",.05,-300);
g.burst(p.x,p.y,col(i),12,250);break;
}
if(Math.hypot(p.x-w.b.x,p.y-w.b.y)<20){
p.x=w.a.x;p.y=w.a.y;g.cd[i]=.6;
FX.tone(800,.1,"triangle",.05,-300);
g.burst(p.x,p.y,col(i),12,250);break;
}
}
}
if(i===0&&p.x>=W-50)g.point(0,"P1 GOAL");
if(i===1&&p.x<=50)g.point(1,"P2 GOAL");
});
},
draw(g,ctx){
g.floor("#0e1228","#1a1a3a");
g.warps.forEach(w=>{
ctx.fillStyle="rgba(200,100,255,.4)";
ctx.beginPath();ctx.arc(w.a.x,w.a.y,20,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(w.b.x,w.b.y,20,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#c46aff";ctx.lineWidth=2;
ctx.beginPath();ctx.arc(w.a.x,w.a.y,20,0,Math.PI*2);ctx.stroke();
ctx.beginPath();ctx.arc(w.b.x,w.b.y,20,0,Math.PI*2);ctx.stroke();
});
ctx.fillStyle=C2;ctx.fillRect(W-40,200,30,200);
ctx.fillStyle=C1;ctx.fillRect(10,200,30,200);
g.pl.forEach((p,i)=>g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,false));
}
});

/* ---------- 5. PRESSURE PLATES (FIXED) ---------- */
micro({id:"platesGame",title:"Pressure Plates",desc:"Step on plates to trap them for rival.",
cat:"action",key:"plates",win:3,
controls:"P1: WASD, W to trap the plate under you　 P2: ARROWS — when rival steps on your trap, they get hit",
round(g){
g.pl=[{x:150,y:250,hp:3},{x:750,y:250,hp:3}];
g.plates=[
{x:200,y:200,o:-1,trap:false},{x:300,y:350,o:-1,trap:false},
{x:400,y:150,o:-1,trap:false},{x:500,y:250,o:-1,trap:false},
{x:600,y:400,o:-1,trap:false},{x:250,y:100,o:-1,trap:false},
{x:650,y:200,o:-1,trap:false},{x:350,y:420,o:-1,trap:false}
];
},
update(g,dt){
for(let i=0;i<2;i++){
const p=g.pl[i],I=g.I[i];
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*240*dt,20,W-20);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*240*dt,60,H-20);
for(const pl of g.plates){
const d=Math.hypot(p.x-pl.x,p.y-pl.y);
if(pl.trap&&pl.o>=0&&pl.o!==i&&d<22){
p.hp--;pl.trap=false;
g.burst(pl.x,pl.y,RED,16,320);FX.playBoom();
if(p.hp<=0){g.point(pl.o,"TRAPPED");return;}
}
if(!pl.trap&&pl.o<0&&d<30&&I.a){
pl.o=i;pl.trap=true;FX.tone(300,.1,"square",.03);
}
}
}
},
draw(g,ctx){
g.floor("#1a1a2a","#22223a");
g.plates.forEach(pl=>{
ctx.fillStyle=pl.trap?col(pl.o):"#2a2f63";
ctx.fillRect(pl.x-20,pl.y-20,40,40);
ctx.strokeStyle=pl.o>=0?col(pl.o):"#4a4a6a";
ctx.lineWidth=2;ctx.strokeRect(pl.x-20,pl.y-20,40,40);
if(pl.trap){ctx.fillStyle=RED;ctx.beginPath();ctx.arc(pl.x,pl.y,6,0,Math.PI*2);ctx.fill();}
});
g.pl.forEach((p,i)=>{
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,false);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,6);
ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/3,6);
});
}
});

/* ---------- 6. SPINNING BLADES ---------- */
micro({id:"bladesGame",title:"Spinning Blades",desc:"Dodge rotating blades. Push rival into them.",
cat:"action",key:"blades",win:3,
controls:"P1: WASD move, SPACE dash　 P2: ARROWS, ENTER dash — blades rotate. Dash rival into a blade to damage.",
round(g){
g.pl=[{x:225,y:250,hp:3,dash:0,dashCd:0,ddx:1,ddy:0},{x:675,y:250,hp:3,dash:0,dashCd:0,ddx:-1,ddy:0}];
g.hubs=[
{cx:450,cy:150,r:60,arms:3,rot:0,sp:1.2},
{cx:450,cy:350,r:60,arms:3,rot:0,sp:-1.2}
];
},
update(g,dt){
g.hubs.forEach(h=>{h.rot+=h.sp*dt;});
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.dashCd=Math.max(0,p.dashCd-dt);
if(p.dash>0){p.dash-=dt;p.x+=p.ddx*600*dt;p.y+=p.ddy*600*dt;}
else{
const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0),l=Math.hypot(ax,ay)||1;
p.x+=ax/l*220*dt;p.y+=ay/l*220*dt;
if(I.a&&p.dashCd<=0&&(ax||ay)){p.dash=.15;p.dashCd=1.3;p.ddx=ax/l;p.ddy=ay/l;FX.tone(500,.1,"sawtooth",.04,300);}
}
p.x=cl(p.x,20,W-20);p.y=cl(p.y,60,H-20);
for(const h of g.hubs){
for(let k=0;k<h.arms;k++){
const ang=h.rot+k*Math.PI*2/h.arms;
for(let d=20;d<h.r;d+=10){
const bx=h.cx+Math.cos(ang)*d,by=h.cy+Math.sin(ang)*d;
if(Math.hypot(p.x-bx,p.y-by)<18){
p.hp-=dt*2;
if(p.hp<=0){g.point(1-i,"SHREDDED");return;}
}
}
}
}
});
const [a,b]=g.pl,d=Math.hypot(a.x-b.x,a.y-b.y);
if(d<34&&d>0){
const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d;
if(a.dash>0){b.x+=nx*50;b.y+=ny*50;}
if(b.dash>0){a.x-=nx*50;a.y-=ny*50;}
}
},
draw(g,ctx){
g.floor("#101a3a","#1a2548");
g.hubs.forEach(h=>{
ctx.fillStyle="#4a3a6a";ctx.beginPath();ctx.arc(h.cx,h.cy,15,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#6a56b8";ctx.lineWidth=2;ctx.stroke();
for(let k=0;k<h.arms;k++){
const ang=h.rot+k*Math.PI*2/h.arms;
ctx.strokeStyle="#9fc0ff";ctx.lineWidth=6;
ctx.beginPath();ctx.moveTo(h.cx,h.cy);
ctx.lineTo(h.cx+Math.cos(ang)*h.r,h.cy+Math.sin(ang)*h.r);ctx.stroke();
ctx.fillStyle="#fff";
ctx.beginPath();ctx.arc(h.cx+Math.cos(ang)*h.r,h.cy+Math.sin(ang)*h.r,6,0,Math.PI*2);ctx.fill();
}
});
g.pl.forEach((p,i)=>{ctx.globalAlpha=p.dash>0?.5:1;
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,p.dash>0);ctx.globalAlpha=1;
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,6);
ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/3,6);});
}
});

/* ---------- 7. MINEFIELD DUEL ---------- */
micro({id:"minefieldGame",title:"Minefield Duel",desc:"Place mines. Watch where you step.",
cat:"action",key:"minefield",win:3,
controls:"P1: WASD, SPACE plant mine (3 max)　 P2: ARROWS — step on a mine and you take damage. Mines fade after 8s.",
round(g){
g.pl=[{x:150,y:250,hp:3,mines:3},{x:750,y:250,hp:3,mines:3}];
g.mines=[];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*240*dt,20,W-20);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*240*dt,60,H-20);
if(I.a&&p.mines>0){
p.mines--;
g.mines.push({x:p.x,y:p.y,o:i,life:8,armT:.5});
FX.tone(250,.1,"square",.04,-100);
}
});
g.mines.forEach(m=>{
m.life-=dt;m.armT=Math.max(0,m.armT-dt);
if(m.armT>0)return;
g.pl.forEach((p,i)=>{
if(i!==m.o&&Math.hypot(p.x-m.x,p.y-m.y)<22){
p.hp--;m.dead=true;
g.burst(m.x,m.y,RED,20,350);FX.playBoom();
if(p.hp<=0){g.point(m.o,"BLOWN UP");return;}
}
});
});
g.mines=g.mines.filter(m=>!m.dead&&m.life>0);
},
draw(g,ctx){
g.floor("#101a3a","#1a2548");
g.mines.forEach(m=>{
if(m.armT>0){ctx.fillStyle="rgba(255,255,255,.3)";}
else ctx.fillStyle=col(m.o);
ctx.beginPath();ctx.arc(m.x,m.y,10,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
if(m.armT<=0&&Math.floor(g.t*4)%2){ctx.fillStyle=RED;
ctx.beginPath();ctx.arc(m.x,m.y,4,0,Math.PI*2);ctx.fill();}
});
g.pl.forEach((p,i)=>{
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,false);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,6);
ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/3,6);
g.text("MINES: "+p.mines,i?W-40:40,80,14,GOLD,i?"right":"left");
});
}
});

/* ---------- 8. PUZZLE ARENA ---------- */
micro({id:"puzzlearenaGame",title:"Puzzle Arena",desc:"Arena shatters into regions. Last safe spot wins.",
cat:"reflex",key:"puzzlearena",win:3,
controls:"P1: WASD move　 P2: ARROWS — the arena loses tiles over time. Last one on solid ground wins.",
round(g){
const r=seeded(ri(1,1e6));
g.tiles=[];
for(let y=0;y<5;y++)for(let x=0;x<10;x++){
g.tiles.push({x:x*90,y:y*80+60,w:90,h:80,alive:true});
}
g.pl=[{x:150,y:250},{x:750,y:250}];
g.tl=0;g.nextDrop=1.5;g.rng=r;
},
update(g,dt){
g.tl+=dt;
g.nextDrop-=dt;
if(g.nextDrop<=0){
g.nextDrop=Math.max(.4,1.5-g.tl*.05);
const solid=g.tiles.filter(t=>t.alive);
if(solid.length>2){
const pick=solid[Math.floor(g.rng()*solid.length)];
pick.alive=false;
g.burst(pick.x+pick.w/2,pick.y+pick.h/2,"#4a3a6a",10,250);
FX.tone(150,.1,"sawtooth",.03,-40);
}
}
const dead=[false,false];
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*260*dt,20,W-20);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*260*dt,60,H-20);
const t=g.tiles.find(t=>t.alive&&p.x>t.x&&p.x<t.x+t.w&&p.y>t.y&&p.y<t.y+t.h);
if(!t)dead[i]=true;
});
if(dead[0]&&dead[1])g.next("BOTH FELL");
else if(dead[0])g.point(1,"P2 WINS");
else if(dead[1])g.point(0,"P1 WINS");
},
draw(g,ctx){
ctx.fillStyle="#050510";ctx.fillRect(0,0,W,H);
g.tiles.forEach(t=>{
if(!t.alive)return;
ctx.fillStyle="#3a4a8a";ctx.fillRect(t.x+2,t.y+2,t.w-4,t.h-4);
ctx.fillStyle="#5a6aaa";ctx.fillRect(t.x+2,t.y+2,t.w-4,4);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(t.x+2,t.y+2,t.w-4,t.h-4);
});
g.pl.forEach((p,i)=>g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,false));
}
});
})();