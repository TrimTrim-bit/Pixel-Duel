/* =====================================================
   GAME PACK M — 8 unique mechanics
   Slide Puzzle, Scope Shot, Chain Lightning, Vampire,
   Jetpack Race, Auction War, Merge Combat, Tetris Duel
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* ---------- 1. SLIDE PUZZLE ---------- */
function isSolved(t){for(let i=0;i<8;i++)if(t[i]!==i+1)return false;return t[8]===0;}
function scramblePuzzle(){
const tiles=[1,2,3,4,5,6,7,8,0];
let blank=8;
for(let k=0;k<80;k++){
const moves=[];
if(blank%3!==0)moves.push(-1);
if(blank%3!==2)moves.push(1);
if(blank>=3)moves.push(-3);
if(blank<6)moves.push(3);
const m=moves[Math.floor(Math.random()*moves.length)];
const nb=blank+m;
[tiles[blank],tiles[nb]]=[tiles[nb],tiles[blank]];
blank=nb;
}
if(isSolved(tiles))return scramblePuzzle();
return tiles;
}
function trySlide(tiles,dir){
const blank=tiles.indexOf(0);
const bx=blank%3,by=Math.floor(blank/3);
let nx=bx,ny=by;
if(dir===0)ny--;
else if(dir===1)nx++;
else if(dir===2)ny++;
else if(dir===3)nx--;
if(nx<0||nx>2||ny<0||ny>2)return false;
const nb=ny*3+nx;
[tiles[blank],tiles[nb]]=[tiles[nb],tiles[blank]];
return true;
}
micro({id:"slidepuzzleGame",title:"Slide Puzzle",desc:"Slide tiles into order. First to solve wins.",
cat:"brain",key:"slidepuzzle",win:3,
controls:"P1: W/A/S/D slide blank　 P2: ARROWS — press the direction the BLANK should move. First to arrange 1-8 wins.",
round(g){
g.tiles=[scramblePuzzle(),scramblePuzzle()];
g.cd=[0,0];
},
update(g,dt){
g.cd[0]=Math.max(0,g.cd[0]-dt);
g.cd[1]=Math.max(0,g.cd[1]-dt);
for(let i=0;i<2;i++){
if(g.cd[i]>0)continue;
const I=g.I[i];
let dir=-1;
if(I.pu)dir=0;else if(I.pr)dir=1;else if(I.pd)dir=2;else if(I.pl)dir=3;
if(dir<0)continue;
if(trySlide(g.tiles[i],dir)){
g.cd[i]=0.08;
FX.tone(500+i*100,.04,"square",.03);
if(isSolved(g.tiles[i])){g.point(i,"SOLVED!");return;}
}
}
},
draw(g,ctx){
ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
for(let i=0;i<2;i++){
const ox=i?525:75,oy=100,sz=100;
ctx.fillStyle="#1a2050";ctx.fillRect(ox-8,oy-8,sz*3+16,sz*3+16);
ctx.strokeStyle=col(i);ctx.lineWidth=3;ctx.strokeRect(ox-8,oy-8,sz*3+16,sz*3+16);
g.tiles[i].forEach((v,k)=>{
if(v===0)return;
const x=ox+(k%3)*sz,y=oy+Math.floor(k/3)*sz;
ctx.fillStyle=col(i);ctx.fillRect(x+3,y+3,sz-6,sz-6);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(x+3,y+3,sz-6,sz-6);
g.text(String(v),x+sz/2,y+sz/2+14,40,"#080b18","center");
});
g.text("P"+(i+1),ox+sz*1.5,70,22,col(i),"center");
}
}
});

/* ---------- 2. SCOPE SHOT ---------- */
micro({id:"scopeshotGame",title:"Scope Shot",desc:"Wait for the sway to align. Fire on target.",
cat:"reflex",key:"scopeshot",win:3,
controls:"P1: SPACE fire　 P2: ENTER — your crosshair sways in a figure-8. Hit the rival silhouette to score.",
round(g){
g.pl=[
{x:180,y:250,cd:0,sway:Math.random()*6,flash:0},
{x:720,y:250,cd:0,sway:Math.random()*6,flash:0}
];
g.tl=0;
},
update(g,dt){
g.tl+=dt;
g.pl.forEach((p,i)=>{
p.cd=Math.max(0,p.cd-dt);
p.flash=Math.max(0,p.flash-dt);
p.cx=p.x+Math.sin(g.tl*2.2+p.sway)*140;
p.cy=p.y+Math.sin(g.tl*3.4+p.sway*1.7)*70;
if(g.I[i].pa&&p.cd<=0){
p.cd=.6;
const t=g.pl[1-i];
if(Math.hypot(p.cx-t.x,p.cy-t.y)<28){
t.flash=.5;
g.burst(t.x,t.y,col(1-i),16,300);
playHitSound();
g.point(i,"SCOPED");
return;
}
FX.tone(150,.1,"square",.03);
}
});
},
draw(g,ctx){
g.floor("#0a1a2a","#122540");
g.pl.forEach((p,i)=>{
const t=g.pl[1-i];
ctx.fillStyle=col(1-i);ctx.globalAlpha=.55;
ctx.beginPath();ctx.arc(t.x,t.y,25,0,Math.PI*2);ctx.fill();
ctx.globalAlpha=1;
ctx.strokeStyle=col(i);ctx.lineWidth=2;
ctx.beginPath();ctx.arc(p.cx,p.cy,14,0,Math.PI*2);ctx.stroke();
ctx.beginPath();
ctx.moveTo(p.cx-20,p.cy);ctx.lineTo(p.cx-4,p.cy);
ctx.moveTo(p.cx+4,p.cy);ctx.lineTo(p.cx+20,p.cy);
ctx.moveTo(p.cx,p.cy-20);ctx.lineTo(p.cx,p.cy-4);
ctx.moveTo(p.cx,p.cy+4);ctx.lineTo(p.cx,p.cy+20);ctx.stroke();
});
g.pl.forEach((p,i)=>{
if(p.flash>0){
ctx.fillStyle=`rgba(255,90,120,${p.flash})`;
ctx.fillRect(i*450,0,450,H);
}
});
}
});

/* ---------- 3. CHAIN LIGHTNING ---------- */
micro({id:"chainlightningGame",title:"Chain Lightning",desc:"Chain shots through orbs. Longer chain = more points.",
cat:"reflex",key:"chainlightning",win:1,hud:false,
controls:"P1: A/D aim, SPACE fire　 P2: ←/→ aim, ENTER — hit an orb to start a chain. Longer chain scores more.",
init(g){
g.s=[0,0];g.tl=0;
g.pl=[{x:120,y:250,ang:0,cd:0},{x:780,y:250,ang:Math.PI,cd:0}];
g.orbs=Array.from({length:10},()=>({x:rnd(100,W-100),y:rnd(80,H-80),alive:true,respawnT:0}));
g.chains=[];
},
update(g,dt){
g.tl+=dt;
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.cd=Math.max(0,p.cd-dt);
if(I.l)p.ang-=2*dt;
if(I.r)p.ang+=2*dt;
if(I.a&&p.cd<=0){
let best=null,bestD=Infinity;
for(const o of g.orbs){
if(!o.alive)continue;
const dx=o.x-p.x,dy=o.y-p.y,d=Math.hypot(dx,dy);
const angle=Math.atan2(dy,dx);
const diff=Math.abs(Math.atan2(Math.sin(angle-p.ang),Math.cos(angle-p.ang)));
if(diff<.5&&d<bestD){bestD=d;best=o;}
}
if(best){
const visited=new Set([best]);
const chain=[best];
let cur=best;
for(let k=0;k<5;k++){
let next=null,nd=Infinity;
for(const o of g.orbs){
if(!o.alive||visited.has(o))continue;
const d=Math.hypot(o.x-cur.x,o.y-cur.y);
if(d<200&&d<nd){nd=d;next=o;}
}
if(!next)break;
chain.push(next);visited.add(next);cur=next;
}
g.chains.push({points:chain.map(o=>({x:o.x,y:o.y})),o:i,life:.6});
chain.forEach(o=>{o.alive=false;o.respawnT=1.5;});
g.s[i]+=chain.length;
g.burst(best.x,best.y,col(i),8+chain.length*2,240);
FX.tone(500+chain.length*120,.12,"square",.05,chain.length*100);
p.cd=.5;
} else {
FX.tone(150,.1,"sawtooth",.03,-40);
p.cd=.3;
}
}
});
g.chains.forEach(c=>c.life-=dt);
g.chains=g.chains.filter(c=>c.life>0);
g.orbs.forEach(o=>{if(!o.alive){o.respawnT-=dt;if(o.respawnT<=0){o.alive=true;o.x=rnd(100,W-100);o.y=rnd(80,H-80);}}});
if(g.tl>30)g.byScore(g.s);
},
draw(g,ctx){
g.floor("#0a1020","#121a3a");
g.orbs.forEach(o=>{
if(!o.alive)return;
const pulse=1+Math.sin(g.t*3+o.x*.01)*.15;
ctx.fillStyle=GOLD;
ctx.beginPath();ctx.arc(o.x,o.y,12*pulse,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
});
g.chains.forEach(c=>{
ctx.strokeStyle=col(c.o);ctx.globalAlpha=c.life*1.2;ctx.lineWidth=3;
ctx.beginPath();
c.points.forEach((pt,k)=>{if(k===0)ctx.moveTo(pt.x,pt.y);else ctx.lineTo(pt.x,pt.y);});
ctx.stroke();ctx.globalAlpha=1;
});
g.pl.forEach((p,i)=>{
ctx.strokeStyle=col(i);ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(p.ang)*40,p.y+Math.sin(p.ang)*40);ctx.stroke();
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+Math.cos(p.ang)*80,p.y+Math.sin(p.ang)*80,false);
g.text("P"+(i+1)+" "+g.s[i],i?W-40:40,30,18,col(i),i?"right":"left");
});
g.text(Math.max(0,Math.ceil(30-g.tl))+"s",W/2,30,22,GOLD,"center");
}
});

/* ---------- 4. VAMPIRE ---------- */
micro({id:"vampireGame",title:"Vampire",desc:"Running into rival drains their HP.",
cat:"action",key:"vampire",win:3,
controls:"P1: WASD move　 P2: ARROWS — contact while moving toward rival drains their HP. First to drain all wins.",
round(g){
g.pl=[
{x:200,y:250,vx:0,vy:0,hp:5,flash:0},
{x:700,y:250,vx:0,vy:0,hp:5,flash:0}
];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.flash=Math.max(0,p.flash-dt);
const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0),l=Math.hypot(ax,ay)||1;
p.vx=ax/l*240;p.vy=ay/l*240;
p.x+=p.vx*dt;p.y+=p.vy*dt;
p.x=cl(p.x,20,W-20);p.y=cl(p.y,60,H-20);
});
const [a,b]=g.pl,d=Math.hypot(a.x-b.x,a.y-b.y);
if(d<34&&d>0){
const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d;
const aAp=a.vx*nx+a.vy*ny;
const bAp=b.vx*(-nx)+b.vy*(-ny);
if(aAp>20){b.hp-=aAp*.003*dt*60;b.flash=.15;}
if(bAp>20){a.hp-=bAp*.003*dt*60;a.flash=.15;}
if(d<30){
const o=(30-d)/2;
a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;
}
}
if(a.hp<=0&&b.hp<=0)g.next("DRAW");
else if(a.hp<=0)g.point(1,"DRAINED");
else if(b.hp<=0)g.point(0,"DRAINED");
},
draw(g,ctx){
g.floor("#1a0a1a","#2a1024");
g.pl.forEach((p,i)=>{
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+(i?-60:60),p.y,p.vx!==0,p.flash>0);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,8);
ctx.fillStyle=p.hp>2?GREEN:RED;
ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/5,8);
g.text("P"+(i+1)+" "+Math.ceil(Math.max(0,p.hp)),i?W-40:40,40,18,col(i),i?"right":"left");
});
}
});

/* ---------- 5. JETPACK RACE ---------- */
micro({id:"jetpackGame",title:"Jetpack Race",desc:"Fly through all 5 rings. Refuel on the ground.",
cat:"action",key:"jetpack",win:3,
controls:"P1: A/D move, W thrust, S dive　 P2: ←/→, ↑, ↓ — jetpack drains fuel. Land to refill.",
round(g){
g.pl=[
{x:150,y:400,vx:0,vy:0,fuel:1,grounded:false},
{x:750,y:400,vx:0,vy:0,fuel:1,grounded:false}
];
g.rings=Array.from({length:5},(_,k)=>({x:180+k*140,y:110+Math.sin(k*1.4)*50,got:[false,false]}));
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.vx=((I.r?1:0)-(I.l?1:0))*280;
p.x=cl(p.x+p.vx*dt,20,W-20);
const thrust=I.u&&p.fuel>0;
if(thrust){p.vy-=1800*dt;p.fuel=Math.max(0,p.fuel-dt*.5);}
else if(I.d){p.vy+=1000*dt;}
p.vy+=1200*dt;
p.vy=cl(p.vy,-400,600);
p.y+=p.vy*dt;
if(p.y>=440){p.y=440;p.vy=0;p.grounded=true;p.fuel=Math.min(1,p.fuel+dt*.8);}
else p.grounded=false;
if(p.y<60){p.y=60;p.vy=0;}
g.rings.forEach(r=>{
if(r.got[i])return;
if(Math.hypot(p.x-r.x,p.y-r.y)<26){
r.got[i]=true;
g.burst(r.x,r.y,GOLD,10,250);
FX.tone(700,.08,"square",.04,200);
if(g.rings.every(rr=>rr.got[i])){g.point(i,"ALL RINGS");}
}
});
});
},
draw(g,ctx){
g.floor("#1a2a4a","#122840");
g.rings.forEach(r=>{
if(r.got[0]&&r.got[1])return;
const pulse=1+Math.sin(g.t*4)*.1;
ctx.strokeStyle=GOLD;ctx.lineWidth=3;
ctx.beginPath();ctx.arc(r.x,r.y,22*pulse,0,Math.PI*2);ctx.stroke();
if(!r.got[0]){ctx.fillStyle=C1;ctx.beginPath();ctx.arc(r.x-30,r.y,5,0,Math.PI*2);ctx.fill();}
if(!r.got[1]){ctx.fillStyle=C2;ctx.beginPath();ctx.arc(r.x+30,r.y,5,0,Math.PI*2);ctx.fill();}
});
g.pl.forEach((p,i)=>{
if(p.fuel>0&&g.I[i].u){
ctx.fillStyle="rgba(255,140,60,.7)";
ctx.beginPath();
ctx.moveTo(p.x-8,p.y+8);
ctx.lineTo(p.x,p.y+22+Math.random()*6);
ctx.lineTo(p.x+8,p.y+8);ctx.fill();
}
g.blob({x:p.x,y:p.y,r:14},col(i),p.x,p.y-40,false);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+30,60,6);
ctx.fillStyle=p.fuel>0.3?GREEN:RED;
ctx.fillRect(p.x-30,p.y+30,60*p.fuel,6);
g.text("P"+(i+1),i?W-40:40,40,18,col(i),i?"right":"left");
});
}
});

/* ---------- 6. AUCTION WAR ---------- */
const AUCTION_ITEMS=[
{name:"SPEED",power:2},{name:"HEALTH",power:2},{name:"DAMAGE",power:2},
{name:"SHIELD",power:2},{name:"POWER",power:3}
];
micro({id:"auctionGame",title:"Auction War",desc:"Bid gold for stat buffs. Most total power wins.",
cat:"brain",key:"auction",win:1,hud:false,
controls:"P1: SPACE bid, S pass　 P2: ENTER bid, ↓ pass — highest bid gets the buff. Passing saves gold.",
init(g){
g.gold=[10,10];g.buffs=[0,0];g.round=0;g.item=null;
g.bids=[0,0];g.pass=[false,false];g.phase="intro";g.timer=1;
},
update(g,dt){
g.timer-=dt;
if(g.phase==="intro"){
if(g.timer<=0){
g.item=AUCTION_ITEMS[g.round];
g.bids=[0,0];g.pass=[false,false];g.phase="bid";g.timer=5;
}
} else if(g.phase==="bid"){
for(let i=0;i<2;i++){
if(g.pass[i])continue;
if(g.I[i].pd){g.pass[i]=true;}
else if(g.I[i].pa&&g.bids[i]<g.gold[i]){g.bids[i]++;FX.tone(400+g.bids[i]*30,.04,"square",.03);}
}
if((g.pass[0]&&g.pass[1])||g.timer<=0){
const w=g.bids[0]>g.bids[1]?0:g.bids[1]>g.bids[0]?1:-1;
if(w>=0){g.gold[w]-=g.bids[w];g.buffs[w]+=g.item.power;FX.tone(900,.2,"triangle",.05,200);}
g.phase="result";g.timer=1.5;
}
} else if(g.phase==="result"){
if(g.timer<=0){
g.round++;
if(g.round>=5)g.byScore([g.buffs[0]*10+g.gold[0],g.buffs[1]*10+g.gold[1]]);
else{g.phase="intro";g.timer=1;}
}
}
},
draw(g,ctx){
ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
g.text("ROUND "+Math.min(5,g.round+1)+"/5",W/2,30,18,"#9fc0ff","center");
if(g.phase==="intro"){
g.text("AUCTION",W/2,220,64,GOLD,"center");
} else if(g.item){
g.text("ITEM: "+g.item.name+"  (+"+g.item.power+" POWER)",W/2,80,24,GOLD,"center");
[0,1].forEach(i=>{
const cx=i?675:225;
g.text("P"+(i+1),cx,150,22,col(i),"center");
g.text("GOLD "+g.gold[i],cx,200,20,"#fff","center");
g.text("BID "+g.bids[i],cx,270,48,GOLD,"center");
if(g.pass[i])g.text("PASSED",cx,320,22,RED,"center");
g.text("POWER "+g.buffs[i],cx,390,18,col(i),"center");
});
g.text("SPACE/ENTER = BID   S/↓ = PASS",W/2,460,16,"#9fc0ff","center");
}
if(g.phase==="result"){
const w=g.bids[0]>g.bids[1]?0:g.bids[1]>g.bids[0]?1:-1;
if(w>=0)g.text("P"+(w+1)+" WINS THE ITEM",W/2,430,24,col(w),"center");
else g.text("NO BIDS",W/2,430,20,"#9fc0ff","center");
}
}
});

/* ---------- 7. MERGE COMBAT ---------- */
micro({id:"mergecombatGame",title:"Merge Combat",desc:"Eat dots to grow. Bigger fighter damages smaller.",
cat:"action",key:"mergecombat",win:3,
controls:"P1: WASD move　 P2: ARROWS — eating dots grows you. Bigger fighter damages smaller on contact.",
round(g){
g.pl=[
{x:200,y:250,r:14},
{x:700,y:250,r:14}
];
g.dots=Array.from({length:30},()=>({x:rnd(20,W-20),y:rnd(60,H-20)}));
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
const sp=Math.max(80,280-p.r*8);
const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0),l=Math.hypot(ax,ay)||1;
p.x+=ax/l*sp*dt;p.y+=ay/l*sp*dt;
p.x=cl(p.x,20,W-20);p.y=cl(p.y,60,H-20);
for(const d of g.dots){
if(d.eaten)continue;
if(Math.hypot(p.x-d.x,p.y-d.y)<p.r+8){
d.eaten=true;p.r+=1.5;
g.burst(d.x,d.y,col(i),5,150);
}
}
});
g.dots=g.dots.filter(d=>!d.eaten);
while(g.dots.length<30)g.dots.push({x:rnd(20,W-20),y:rnd(60,H-20)});
const [a,b]=g.pl,d=Math.hypot(a.x-b.x,a.y-b.y);
if(d<a.r+b.r-4&&d>0){
const bigger=a.r>b.r?a:b, smaller=bigger===a?b:a;
smaller.r=Math.max(6,smaller.r-(bigger.r-smaller.r)*.02*dt*60);
const push=(a.r+b.r-d)/2;
const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d;
a.x-=nx*push;a.y-=ny*push;b.x+=nx*push;b.y+=ny*push;
}
const dead=g.pl.map(p=>p.r<=7),won=g.pl.map(p=>p.r>=45);
if(dead[0]&&dead[1])g.next("BOTH DEAD");
else if(won[0])g.point(0,"GREW HUGE");
else if(won[1])g.point(1,"GREW HUGE");
else if(dead[0])g.point(1,"P2 WINS");
else if(dead[1])g.point(0,"P1 WINS");
},
draw(g,ctx){
g.floor("#0a1020","#121a3a");
g.dots.forEach(d=>{
ctx.fillStyle=GOLD;
ctx.beginPath();ctx.arc(d.x,d.y,5,0,Math.PI*2);ctx.fill();
});
g.pl.forEach((p,i)=>{
ctx.fillStyle=col(i);
ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle="rgba(255,255,255,.3)";
ctx.beginPath();ctx.arc(p.x-p.r*.3,p.y-p.r*.3,p.r*.3,0,Math.PI*2);ctx.fill();
});
}
});

/* ---------- 8. TETRIS DUEL ---------- */
const TETRO=[
[[1,1,1,1]],
[[1,1],[1,1]],
[[0,1,0],[1,1,1]],
[[1,0,0],[1,1,1]],
[[0,0,1],[1,1,1]],
[[0,1,1],[1,1,0]],
[[1,1,0],[0,1,1]]
];
const TETRO_COLORS=["#4af","#fa4","#f4a","#af4","#4fa","#a4f","#fa4"];
function tetRotate(m){
const R=m.length,C=m[0].length;
const out=Array.from({length:C},()=>new Array(R).fill(0));
for(let r=0;r<R;r++)for(let c=0;c<C;c++)out[c][R-1-r]=m[r][c];
return out;
}
function tetFits(b,s,ox,oy){
for(let r=0;r<s.length;r++)for(let c=0;c<s[r].length;c++){
if(!s[r][c])continue;
const x=ox+c,y=oy+r;
if(x<0||x>=10||y>=20)return false;
if(y>=0&&b[y][x])return false;
}
return true;
}
function tetNew(){
const idx=Math.floor(Math.random()*TETRO.length);
return {shape:TETRO[idx].map(r=>r.slice()),color:TETRO_COLORS[idx],x:3,y:0};
}
function tetLock(b,p){
let topped=false;
for(let r=0;r<p.shape.length;r++)for(let c=0;c<p.shape[r].length;c++){
if(!p.shape[r][c])continue;
const y=p.y+r,x=p.x+c;
if(y<0||y>=20||x<0||x>=10){topped=true;continue;}
b[y][x]=p.color;
}
return topped;
}
function tetClear(b){
let n=0;
for(let y=19;y>=0;y--){
if(b[y].every(c=>c)){
b.splice(y,1);
b.unshift(new Array(10).fill(null));
n++;y++;
}
}
return n;
}
micro({id:"tetrisGame",title:"Tetris Duel",desc:"Clear lines. Top out and you lose the round.",
cat:"arcade",key:"tetris",win:3,
controls:"P1: A/D move, W rotate, S soft-drop, SPACE hard-drop　 P2: ←/→, ↑, ↓, ENTER — clear lines to survive.",
round(g){
g.bd=[Array.from({length:20},()=>new Array(10).fill(null)),
      Array.from({length:20},()=>new Array(10).fill(null))];
g.pc=[null,null];
g.fallT=[0,0];g.moveCd=[0,0];
g.alive=[true,true];g.lines=[0,0];
},
update(g,dt){
for(let i=0;i<2;i++){
if(!g.alive[i])continue;
if(!g.pc[i]){
g.pc[i]=tetNew();
if(!tetFits(g.bd[i],g.pc[i].shape,g.pc[i].x,g.pc[i].y)){
g.alive[i]=false;g.pc[i]=null;continue;
}
g.fallT[i]=0;g.moveCd[i]=0;
}
const I=g.I[i],pc=g.pc[i];
g.moveCd[i]=Math.max(0,g.moveCd[i]-dt);
if(g.moveCd[i]<=0){
if(I.l&&tetFits(g.bd[i],pc.shape,pc.x-1,pc.y)){pc.x--;g.moveCd[i]=.1;}
else if(I.r&&tetFits(g.bd[i],pc.shape,pc.x+1,pc.y)){pc.x++;g.moveCd[i]=.1;}
}
if(I.pu){
const rot=tetRotate(pc.shape);
if(tetFits(g.bd[i],rot,pc.x,pc.y))pc.shape=rot;
else if(tetFits(g.bd[i],rot,pc.x-1,pc.y)){pc.shape=rot;pc.x--;}
else if(tetFits(g.bd[i],rot,pc.x+1,pc.y)){pc.shape=rot;pc.x++;}
}
if(I.pa){
while(tetFits(g.bd[i],pc.shape,pc.x,pc.y+1))pc.y++;
g.fallT[i]=999;
}
const speed=I.d?.03:.5;
g.fallT[i]+=dt;
if(g.fallT[i]>=speed){
g.fallT[i]=0;
if(tetFits(g.bd[i],pc.shape,pc.x,pc.y+1))pc.y++;
else{
const topped=tetLock(g.bd[i],pc);
g.lines[i]+=tetClear(g.bd[i]);
if(topped){g.alive[i]=false;g.pc[i]=null;continue;}
g.pc[i]=tetNew();
if(!tetFits(g.bd[i],g.pc[i].shape,g.pc[i].x,g.pc[i].y)){
g.alive[i]=false;g.pc[i]=null;continue;
}
}
}
}
if(!g.alive[0]&&!g.alive[1])g.next("BOTH TOPPED OUT");
else if(!g.alive[0])g.point(1,"P1 TOPS OUT");
else if(!g.alive[1])g.point(0,"P2 TOPS OUT");
},
draw(g,ctx){
ctx.fillStyle="#05081a";ctx.fillRect(0,0,W,H);
const cell=18;
for(let i=0;i<2;i++){
const ox=i?585:135,oy=90;
ctx.fillStyle="#1a2050";ctx.fillRect(ox-4,oy-4,cell*10+8,cell*20+8);
ctx.strokeStyle=col(i);ctx.lineWidth=3;ctx.strokeRect(ox-4,oy-4,cell*10+8,cell*20+8);
for(let y=0;y<20;y++)for(let x=0;x<10;x++){
const c=g.bd[i][y][x];
if(!c)continue;
ctx.fillStyle=c;
ctx.fillRect(ox+x*cell,oy+y*cell,cell-1,cell-1);
}
const pc=g.pc[i];
if(pc){
for(let r=0;r<pc.shape.length;r++)for(let k=0;k<pc.shape[r].length;k++){
if(!pc.shape[r][k])continue;
const x=ox+(pc.x+k)*cell,y=oy+(pc.y+r)*cell;
if(pc.y+r<0)continue;
ctx.fillStyle=pc.color;ctx.fillRect(x,y,cell-1,cell-1);
ctx.strokeStyle="rgba(255,255,255,.4)";ctx.lineWidth=1;ctx.strokeRect(x,y,cell-1,cell-1);
}
}
g.text("P"+(i+1)+"  LINES "+g.lines[i],i?675:225,70,16,col(i),"center");
if(!g.alive[i])g.text("TOPPED OUT",i?675:225,490,16,RED,"center");
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});
})();