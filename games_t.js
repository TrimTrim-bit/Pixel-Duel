/* =====================================================
   GAME PACK T — 8 games (FIXED)
   Snakes and Ladders, Pachinko, Crossfire, Freeze Tag,
   Bomberman, Marble Madness, Duck Hunt, Bump Battle
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* ---------- 1. SNAKES AND LADDERS ---------- */
const SL_SNAKES={17:7,54:34,62:19,64:60,87:24,93:73,95:75,98:79};
const SL_LADDERS={1:38,4:14,9:31,21:42,28:84,36:44,51:67,71:91,80:100};
function gtext(ctx,s,x,y,size,color){
ctx.font="bold "+size+"px Courier New";ctx.textAlign="center";
ctx.fillStyle=color||"#fff";ctx.fillText(s,x,y);ctx.textAlign="left";
}
function slDrawBoard(ctx){
for(let r=0;r<10;r++)for(let c=0;c<10;c++){
const row=9-r;
const x=c*50+200,y=row*50+20;
const isEven=r%2===0;
const num2=isEven?r*10+c+1:r*10+(10-c);
ctx.fillStyle=(r+c)%2?"#2a2f5a":"#222548";
ctx.fillRect(x,y,50,50);
ctx.strokeStyle="#3a4a8a";ctx.lineWidth=1;ctx.strokeRect(x,y,50,50);
gtext(ctx,String(num2),x+25,y+30,12,"#9fc0ff");
}
}
micro({id:"snakeladderGame",title:"Snakes and Ladders",desc:"Roll dice. Reach 100 first.",
cat:"brain",key:"snakeladder",win:1,hud:false,
controls:"P1: SPACE roll　 P2: ENTER roll — first to land exactly on 100 wins. Overshoot = no move.",
init(g){
g.pos=[0,0];g.turn=0;g.die=0;g.dieT=0;g.cd=[0,0];
},
update(g,dt){
g.dieT=Math.max(0,g.dieT-dt);
g.cd[0]=Math.max(0,g.cd[0]-dt);
g.cd[1]=Math.max(0,g.cd[1]-dt);
for(let i=0;i<2;i++){
if(g.I[i].pa&&g.dieT<=0&&g.cd[i]<=0){
g.die=ri(1,6);
g.dieT=.8;
let np=g.pos[i]+g.die;
if(np>100)np=g.pos[i];
if(SL_SNAKES[np])np=SL_SNAKES[np];
if(SL_LADDERS[np])np=SL_LADDERS[np];
g.pos[i]=np;
FX.tone(400+g.die*60,.1,"square",.04);
g.cd[i]=1;
if(np>=100){g.byScore(i===0?[100,0]:[0,100]);return;}
g.turn=1-g.turn;
}
}
},
draw(g,ctx){
ctx.fillStyle="#0a1020";ctx.fillRect(0,0,W,H);
slDrawBoard(ctx);
Object.entries(SL_LADDERS).forEach(([from,to])=>{
const f=+from,t=+to;
const fx=200+((f-1)%10)*50+25,fy=20+(9-Math.floor((f-1)/10))*50+25;
const tx=200+((t-1)%10)*50+25,ty=20+(9-Math.floor((t-1)/10))*50+25;
ctx.strokeStyle=GREEN;ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(tx,ty);ctx.stroke();
});
Object.entries(SL_SNAKES).forEach(([from,to])=>{
const f=+from,t=+to;
const fx=200+((f-1)%10)*50+25,fy=20+(9-Math.floor((f-1)/10))*50+25;
const tx=200+((t-1)%10)*50+25,ty=20+(9-Math.floor((t-1)/10))*50+25;
ctx.strokeStyle=RED;ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(tx,ty);ctx.stroke();
});
g.pos.forEach((p,i)=>{
if(p<=0)return;
const x=200+((p-1)%10)*50+25,y=20+(9-Math.floor((p-1)/10))*50+25;
ctx.fillStyle=col(i);
ctx.beginPath();ctx.arc(x+i*4-2,y,10,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
});
ctx.fillStyle="#080b18";ctx.fillRect(0,H-60,W,60);
g.text("P1: "+g.pos[0],140,H-30,20,C1,"center");
g.text("P2: "+g.pos[1],W-140,H-30,20,C2,"center");
if(g.die>0&&g.dieT>0)g.text("DICE: "+g.die,W/2,H-30,24,GOLD,"center");
else g.text("P"+(g.turn+1)+"'S TURN",W/2,H-30,20,col(g.turn),"center");
}
});

/* ---------- 2. PACHINKO (with pin physics) ---------- */
micro({id:"pachinkoGame",title:"Pachinko",desc:"Drop balls. Land in high-scoring slots.",
cat:"arcade",key:"pachinko",win:1,hud:false,
controls:"P1: A/D aim, SPACE drop　 P2: ←/→ aim, ENTER — 20 balls each. Slots multiply score.",
init(g){
g.s=[0,0];g.balls=[];
g.aim=[.5,.5];
g.remaining=[20,20];
g.slots=[
{x:130,v:50},{x:230,v:25},{x:330,v:10},{x:430,v:100},{x:530,v:10},{x:630,v:25},{x:730,v:50}
];
},
update(g,dt){
for(let i=0;i<2;i++){
const I=g.I[i];
if(I.l)g.aim[i]=Math.max(.1,g.aim[i]-1.5*dt);
if(I.r)g.aim[i]=Math.min(.9,g.aim[i]+1.5*dt);
if(I.pa&&g.remaining[i]>0){
g.remaining[i]--;
const sx=i===0?150:750;
const drift=(g.aim[i]-.5)*200+(i?-60:60);
g.balls.push({x:sx,y:60,vx:drift,vy:200,r:8,owner:i});
FX.tone(500,.06,"square",.03);
}
}
g.balls.forEach(b=>{
b.vy+=400*dt;
b.x+=b.vx*dt;b.y+=b.vy*dt;
for(let r=0;r<8;r++)for(let c=0;c<10;c++){
const px=180+c*60,py=100+r*40;
const d=Math.hypot(b.x-px,b.y-py);
if(d<8&&d>0){
const nx=(b.x-px)/d,ny=(b.y-py)/d;
b.x=px+nx*8;b.y=py+ny*8;
const dot=b.vx*nx+b.vy*ny;
b.vx-=2*dot*nx;b.vy-=2*dot*ny;
b.vx*=.7;b.vy*=.7;
}
}
if(b.x<40||b.x>W-40)b.vx*=-.6;
if(b.y>H-60){
const slotX=g.slots.reduce((best,s)=>Math.abs(s.x-b.x)<Math.abs(best.x-b.x)?s:best);
g.s[b.owner]+=slotX.v;
g.burst(b.x,H-60,GOLD,8,200);
b.dead=true;
}
});
g.balls=g.balls.filter(b=>!b.dead);
},
draw(g,ctx){
ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
for(let r=0;r<8;r++)for(let c=0;c<10;c++){
ctx.fillStyle="#3a3a6a";
ctx.beginPath();ctx.arc(180+c*60,100+r*40,4,0,Math.PI*2);ctx.fill();
}
ctx.fillStyle="#2a2f63";ctx.fillRect(0,H-60,W,60);
g.slots.forEach(s=>{
ctx.fillStyle=GOLD;ctx.fillRect(s.x-40,H-60,80,60);
g.text(String(s.v),s.x,H-25,20,"#080b18","center");
});
g.balls.forEach(b=>{
ctx.fillStyle=col(b.owner);
ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
});
[0,1].forEach(i=>{
g.text("P"+(i+1)+" "+g.s[i],i?W-40:40,30,20,col(i),i?"right":"left");
g.text("left: "+g.remaining[i],i?W-40:40,55,14,GOLD,i?"right":"left");
});
g.text("P1: A/D·SPACE　 P2: ←/→·ENTER",W/2,25,12,"#9fc0ff","center");
}
});

/* ---------- 3. CROSSFIRE ---------- */
micro({id:"crossfireGame",title:"Crossfire",desc:"Dodge crossing bullet waves. Survive longest.",
cat:"reflex",key:"crossfire",win:3,
controls:"P1: WASD move　 P2: ARROWS — bullets fly across in waves. Same pattern on both sides.",
round(g){
g.tl=0;g.rng=(function(s){return()=>{s=(s*9301+49297)%233280;return s/233280;};})(ri(1,1e6));
g.bullets=[];
g.spawnT=0;
g.pl=[{x:225,y:250},{x:675,y:250}];
},
update(g,dt){
g.tl+=dt;g.spawnT-=dt;
if(g.spawnT<=0){
g.spawnT=Math.max(.3,1-g.tl*.02);
const y=g.rng()*400+80,v=100+g.tl*8;
g.bullets.push({x:-20,y,vx:v,dir:1});
g.bullets.push({x:W+20,y,vx:-v,dir:-1});
}
g.bullets.forEach(b=>b.x+=b.vx*dt);
g.bullets=g.bullets.filter(b=>b.x>-40&&b.x<W+40);
const hit=[false,false];
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*280*dt,i*450+30,i*450+420);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*280*dt,60,H-20);
for(const b of g.bullets){
if(Math.abs(b.x-p.x)<14&&Math.abs(b.y-p.y)<14)hit[i]=true;
}
});
if(hit[0]&&hit[1])g.next("BOTH HIT");
else if(hit[0]){g.burst(g.pl[0].x,g.pl[0].y,C1,20,320);FX.playBoom();g.point(1);}
else if(hit[1]){g.burst(g.pl[1].x,g.pl[1].y,C2,20,320);FX.playBoom();g.point(0);}
else if(g.tl>30)g.next("BOTH SURVIVE");
},
draw(g,ctx){
for(let i=0;i<2;i++){
ctx.fillStyle=i?"#1a0d2a":"#0b1030";
ctx.fillRect(i*450,0,450,H);
ctx.save();ctx.beginPath();ctx.rect(i*450,0,450,H);ctx.clip();
g.bullets.forEach(b=>{
const off=i*450;
ctx.fillStyle="#ff5a78";
ctx.fillRect(off+b.x-14,b.y-4,28,8);
});
g.blob({x:g.pl[i].x,y:g.pl[i].y,r:12},col(i),g.pl[i].x+60,g.pl[i].y,false);
ctx.restore();
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
g.text(g.tl.toFixed(1)+"s",W/2,490,14,"#9fc0ff","center");
}
});

/* ---------- 4. FREEZE TAG (FIXED — fair freeze) ---------- */
micro({id:"freezetagGame",title:"Freeze Tag",desc:"Tag to freeze rival. They must mash to escape.",
cat:"action",key:"freezetag",win:3,
controls:"P1: WASD move　 P2: ARROWS — touching a moving rival freezes them. Frozen rival mashes any key to break free.",
round(g){
g.pl=[
{x:200,y:250,hp:3,stuck:0,cd:0},
{x:700,y:250,hp:3,stuck:0,cd:0}
];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.cd=Math.max(0,p.cd-dt);
p.stuck=Math.max(0,p.stuck-dt);
if(p.stuck>0){
if(I.pl||I.pr||I.pu||I.pd)p.stuck-=.05;
}else{
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*240*dt,20,W-20);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*240*dt,60,H-20);
}
});
const [a,b]=g.pl,d=Math.hypot(a.x-b.x,a.y-b.y);
if(d<30&&d>0){
if(a.stuck<=0&&b.stuck<=0){
if(Math.random()<.5){
a.stuck=1.5;b.cd=1;
g.burst(a.x,a.y,C2,14,320);
}else{
b.stuck=1.5;a.cd=1;
g.burst(b.x,b.y,C1,14,320);
}
FX.tone(400,.15,"sawtooth",.04,200);
} else if(a.stuck>0&&b.cd<=0){
b.hp--;b.cd=1;
g.burst(b.x,b.y,C2,16,320);playHitSound();
if(b.hp<=0)g.point(1,"P2 FROZEN OUT");
} else if(b.stuck>0&&a.cd<=0){
a.hp--;a.cd=1;
g.burst(a.x,a.y,C1,16,320);playHitSound();
if(a.hp<=0)g.point(0,"P1 FROZEN OUT");
}
}
if(a.hp<=0&&b.hp<=0)g.next("BOTH FROZEN");
else if(a.hp<=0)g.point(1,"P2 WINS");
else if(b.hp<=0)g.point(0,"P1 WINS");
},
draw(g,ctx){
g.floor("#0a1a3a","#122540");
g.pl.forEach((p,i)=>{
if(p.stuck>0){
ctx.fillStyle="rgba(100,234,255,.3)";
ctx.beginPath();ctx.arc(p.x,p.y,26,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#6aeaff";ctx.lineWidth=3;
ctx.beginPath();ctx.arc(p.x,p.y,26,0,Math.PI*2);ctx.stroke();
}
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,p.stuck>0,p.stuck>0);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,6);
ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/3,6);
});
}
});

/* ---------- 5. BOMBERMAN ---------- */
micro({id:"bombermanGame",title:"Bomberman",desc:"Bomb maze. Blow up rival. Watch your own blast!",
cat:"action",key:"bomberman",win:3,
controls:"P1: WASD, SPACE drop bomb　 P2: ARROWS, ENTER — bombs explode in cross pattern. 3 HP.",
round(g){
g.grid=[];
for(let r=0;r<9;r++){
const row=[];
for(let c=0;c<13;c++){
if(r===0||c===0||r===8||c===12||(r%2===0&&c%2===0))row.push(1);
else if(Math.random()<.35&&!((r<2&&c<2)||(r>6&&c>10)))row.push(2);
else row.push(0);
}
g.grid.push(row);
}
g.pl=[
{x:1,y:1,hp:3,bombCd:0,flashing:0},
{x:11,y:7,hp:3,bombCd:0,flashing:0}
];
g.bombs=[];g.blasts=[];
g.ct=[0,0];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.bombCd=Math.max(0,p.bombCd-dt);
p.flashing=Math.max(0,p.flashing-dt);
g.ct[i]=Math.max(0,g.ct[i]-dt);
if(p.flashing>0||g.ct[i]>0)return;
let dx=0,dy=0;
if(I.pl)dx=-1;else if(I.pr)dx=1;else if(I.pu)dy=-1;else if(I.pd)dy=1;
if(dx||dy){
const nx=p.x+dx,ny=p.y+dy;
if(g.grid[ny]&&g.grid[ny][nx]!==1&&!g.bombs.some(b=>b.x===nx&&b.y===ny)){p.x=nx;p.y=ny;g.ct[i]=.12;}
}
if(I.a&&p.bombCd<=0&&!g.bombs.some(b=>b.x===p.x&&b.y===p.y)){
g.bombs.push({x:p.x,y:p.y,fuse:2.2,owner:i});
p.bombCd=.5;FX.tone(300,.1,"square",.04);
}
});
g.bombs.forEach(b=>{
b.fuse-=dt;
if(b.fuse<=0){
b.dead=true;
FX.playBoom();
const dirs=[[0,0]];
for(const [dx,dy] of[[1,0],[-1,0],[0,1],[0,-1]]){
for(let s=1;s<=2;s++){
const x=b.x+dx*s,y=b.y+dy*s;
if(!g.grid[y]||g.grid[y][x]===1)break;
dirs.push([x,y]);
if(g.grid[y][x]===2){g.grid[y][x]=0;g.burst(190+x*40+20,30+y*40+20,"#c8a46a",6,180);break;}
}
}
dirs.forEach(([x,y])=>{g.blasts.push({x,y,life:.4});});
g.pl.forEach((p,i)=>{
if(dirs.some(([x,y])=>x===p.x&&y===p.y)){
p.hp--;p.flashing=1;
g.burst(190+p.x*40+20,30+p.y*40+20,col(1-i),14,320);
}
});
}
});
g.blasts.forEach(bl=>bl.life-=dt);
g.blasts=g.blasts.filter(bl=>bl.life>0);
g.bombs=g.bombs.filter(b=>!b.dead);
g.pl.forEach((p,i)=>{if(p.hp<=0)g.point(1-i,"BOOM");});
},
draw(g,ctx){
ctx.fillStyle="#0a0e20";ctx.fillRect(0,0,W,H);
for(let r=0;r<9;r++)for(let c=0;c<13;c++){
const px=190+c*40,py=30+r*40;
ctx.fillStyle=(r+c)%2?"#1c2a4a":"#203054";
ctx.fillRect(px,py,40,40);
if(g.grid[r][c]===1){ctx.fillStyle="#5a60a0";ctx.fillRect(px,py,40,40);ctx.fillStyle="#7a82c8";ctx.fillRect(px,py,40,5);}
if(g.grid[r][c]===2){ctx.fillStyle="#a8743a";ctx.fillRect(px+3,py+3,34,34);ctx.strokeStyle="#5a3a1a";ctx.lineWidth=2;ctx.strokeRect(px+3,py+3,34,34);}
}
g.blasts.forEach(bl=>{
const px=190+bl.x*40,py=30+bl.y*40;
ctx.fillStyle=`rgba(255,140,60,${bl.life*2})`;
ctx.fillRect(px+2,py+2,36,36);
});
g.bombs.forEach(b=>{
const px=190+b.x*40+20,py=30+b.y*40+22;
const s=1+Math.sin(g.t*(b.fuse<.6?30:12))*.1;
ctx.fillStyle="#1b1f3a";ctx.beginPath();ctx.arc(px,py,12*s,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle=b.fuse<.5?GOLD:RED;ctx.fillRect(px+4,py-16,4,6);
});
g.pl.forEach((p,i)=>{
const px=190+p.x*40+20,py=30+p.y*40+20;
ctx.globalAlpha=p.flashing>0&&Math.floor(p.flashing*14)%2?.4:1;
g.blob({x:px,y:py,r:13},col(i),px,py,false);
ctx.globalAlpha=1;
for(let k=0;k<3;k++){
ctx.fillStyle=k<p.hp?RED:"#2a2f63";
ctx.fillRect(i?W-40-k*18:20+k*18,30,14,10);
}
});
}
});

/* ---------- 6. MARBLE MADNESS (FIXED — reachable goal) ---------- */
micro({id:"marbleGame",title:"Marble Madness",desc:"Roll your marble to goal. Don't fall off.",
cat:"action",key:"marble",win:3,
controls:"P1: WASD tilt　 P2: ARROWS — marbles roll with physics. Reach your colored goal at edge.",
round(g){
g.pl=[
{x:70,y:250,vx:0,vy:0},
{x:530,y:250,vx:0,vy:0}
];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0);
p.vx+=ax*300*dt;p.vy+=ay*300*dt;
p.vy+=200*dt;
p.vx*=.985;p.vy*=.985;
const sp=Math.hypot(p.vx,p.vy);
if(sp>320){p.vx*=320/sp;p.vy*=320/sp;}
p.x+=p.vx*dt;p.y+=p.vy*dt;
const minX=i*450+20,maxX=i*450+430;
if(p.x<minX||p.x>maxX)p.dead=true;
if(p.y>H+30)p.dead=true;
if(i===0&&p.x>410&&!p.won){p.won=true;g.point(0,"P1 GOAL");return;}
if(i===1&&p.x<490&&!p.won){p.won=true;g.point(1,"P2 GOAL");return;}
});
g.pl.forEach((p,i)=>{if(p.dead&&!p.won)g.point(1-i,"FELL");});
},
draw(g,ctx){
for(let i=0;i<2;i++){
ctx.fillStyle=i?"#1a2a1a":"#1a1a2a";ctx.fillRect(i*450,0,450,H);
ctx.fillStyle="#2a5a2a";ctx.fillRect(i*450+40,H-60,370,60);
ctx.fillStyle="#4a8a4a";ctx.fillRect(i*450+40,H-60,370,4);
}
ctx.fillStyle=C1;ctx.fillRect(410,80,20,340);
ctx.fillStyle=C2;ctx.fillRect(470,80,20,340);
g.pl.forEach((p,i)=>{
if(!p.dead){
ctx.fillStyle=col(i);
ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle="rgba(255,255,255,.5)";
ctx.beginPath();ctx.arc(p.x-4,p.y-4,4,0,Math.PI*2);ctx.fill();
}
});
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* ---------- 7. DUCK HUNT ---------- */
micro({id:"duckhuntGame",title:"Duck Hunt",desc:"Shoot flying ducks. Miss 3 and you lose.",
cat:"reflex",key:"duckhunt",win:1,hud:false,
controls:"Click flying ducks to shoot. 30 seconds. Miss 3 = game over.",
init(g){
g.s=[0,0];g.miss=[0,0];g.tl=0;g.ducks=[];g.spawnT=0;
},
click(g,x,y){
for(const d of g.ducks){
if(d.dead)continue;
if(Math.hypot(d.x-x,d.y-y)<28){
d.dead=true;
g.burst(d.x,d.y,GOLD,10,220);
g.s[0]+=Math.floor(100/d.r*10);
FX.tone(700,.06,"square",.05);
break;
}
}
},
update(g,dt){
g.tl+=dt;g.spawnT-=dt;
if(g.spawnT<=0&&g.ducks.length<5){
g.spawnT=.9;
const dir=Math.random()<.5?1:-1;
g.ducks.push({x:dir>0?-30:W+30,y:80+Math.random()*350,vx:dir*(80+Math.random()*60),vy:0,phase:Math.random()*6,r:22});
}
g.ducks.forEach(d=>{
d.x+=d.vx*dt;
d.vy=Math.sin(g.t*3+d.phase)*30;
d.y+=d.vy*dt;
});
g.ducks=g.ducks.filter(d=>{
if(d.dead)return false;
if(d.x<-50||d.x>W+50){g.miss[0]++;return false;}
return true;
});
if(g.miss[0]>=3||g.tl>30)g.byScore([g.s[0],0]);
},
draw(g,ctx){
const gr=ctx.createLinearGradient(0,0,0,H);
gr.addColorStop(0,"#5ab0ff");gr.addColorStop(1,"#a8d8a0");
ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
for(let k=0;k<5;k++){ctx.fillStyle="rgba(255,255,255,.4)";ctx.fillRect((k*180+g.t*20)%W,80+k*40,80,20);}
g.ducks.forEach(d=>{
ctx.fillStyle="#3a2a1a";
ctx.beginPath();ctx.ellipse(d.x,d.y,20,12,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#2a1a0a";
ctx.beginPath();ctx.arc(d.x+(d.vx>0?12:-12),d.y-6,8,0,Math.PI*2);ctx.fill();
ctx.fillStyle=GOLD;
ctx.beginPath();ctx.moveTo(d.x+(d.vx>0?18:-18),d.y-6);ctx.lineTo(d.x+(d.vx>0?26:-26),d.y-2);ctx.lineTo(d.x+(d.vx>0?18:-18),d.y+2);ctx.fill();
});
ctx.fillStyle="#080b18";ctx.fillRect(0,H-40,W,40);
g.text("SCORE "+g.s[0],40,H-12,20,GOLD);
g.text("MISS "+g.miss[0]+"/3",W-40,H-12,18,g.miss[0]>=2?RED:"#fff","right");
g.text(Math.max(0,Math.ceil(30-g.tl))+"s",W/2,H-12,18,GOLD,"center");
}
});

/* ---------- 8. BUMP BATTLE ---------- */
micro({id:"bumpbattleGame",title:"Bump Battle",desc:"Physics brawl. Knock rival off the platform.",
cat:"action",key:"bumpbattle",win:3,
controls:"P1: WASD, SPACE jump　 P2: ARROWS, ENTER — momentum carries. Knock rival off edges.",
round(g){
g.pl=[
{x:200,y:400,vx:0,vy:0,grounded:false,hp:3,jumps:0,cd:0},
{x:700,y:400,vx:0,vy:0,grounded:false,hp:3,jumps:0,cd:0}
];
g.plats=[
{x:100,y:440,w:250},
{x:550,y:440,w:250},
{x:400,y:320,w:120}
];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.cd=Math.max(0,p.cd-dt);
const ax=(I.r?1:0)-(I.l?1:0);
p.vx+=ax*350*dt;
if(I.a&&p.jumps>0){p.vy=-500;p.jumps--;FX.tone(400,.08,"square",.04);}
p.vy+=1000*dt;
const oldB=p.y+20;
p.x+=p.vx*dt;p.y+=p.vy*dt;
p.vx*=.98;p.vy*=.98;
p.grounded=false;
for(const pl of g.plats){
if(p.x+14>pl.x&&p.x-14<pl.x+pl.w&&oldB<=pl.y&&p.y+20>=pl.y&&p.vy>=0){
p.y=pl.y-20;p.vy=0;p.grounded=true;p.jumps=2;
}
}
if(p.grounded)p.x=cl(p.x,20,W-20);
if(p.y>H+40){
p.hp--;p.x=i===0?200:700;p.y=400;p.vx=0;p.vy=0;
g.burst(p.x,p.y,col(i),16,320);playHitSound();
if(p.hp<=0)g.point(1-i,"FELL");
}
});
const [a,b]=g.pl,d=Math.hypot(a.x-b.x,a.y-b.y);
if(d<36&&d>0){
const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d;
const relV=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
if(relV<0){
const imp=-relV*.6;
a.vx+=imp*nx;a.vy+=imp*ny;
b.vx-=imp*nx;b.vy-=imp*ny;
g.burst((a.x+b.x)/2,(a.y+b.y)/2,GOLD,6,150);
}
}
},
draw(g,ctx){
g.floor("#1a2a4a","#0a1a3a");
g.plats.forEach(pl=>{
ctx.fillStyle="#4a5a8a";ctx.fillRect(pl.x,pl.y,pl.w,20);
ctx.fillStyle="#6a7aba";ctx.fillRect(pl.x,pl.y,pl.w,4);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(pl.x,pl.y,pl.w,20);
});
g.pl.forEach((p,i)=>{
ctx.globalAlpha=p.hp<=0?.3:1;
g.blob({x:p.x,y:p.y,r:16},col(i),p.x+60,p.y,Math.abs(p.vx)>80);
ctx.globalAlpha=1;
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-24,p.y+28,48,6);
ctx.fillStyle=GREEN;ctx.fillRect(p.x-24,p.y+28,48*Math.max(0,p.hp)/3,6);
});
}
});
})();