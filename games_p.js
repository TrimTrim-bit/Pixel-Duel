/* =====================================================
   GAME PACK P — 8 physics games (FIXED)
   Wrecking Ball, Bumper Chaos, Bowling Duel, Ice Slide,
   Gravity Paint, Tether Fight, Barrels, Avalanche
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* ---------- 1. WRECKING BALL ---------- */
micro({id:"wreckingballGame",title:"Wrecking Ball",desc:"Swing a heavy ball on a chain. Smash rival.",
cat:"action",key:"wreckingball",win:3,
controls:"P1: A/D swing direction, SPACE release　 P2: ←/→ swing, ENTER — the ball's momentum carries the damage. 3 HP.",
round(g){
g.pl=[{x:150,y:400,hp:3,ang:-Math.PI/2,angVel:0,ball:null},{x:750,y:400,hp:3,ang:-Math.PI/2,angVel:0,ball:null}];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
if(I.l)p.angVel-=3*dt;
if(I.r)p.angVel+=3*dt;
p.angVel-=Math.sin(p.ang)*4*dt;
p.angVel*=.985;
p.ang+=p.angVel*dt;
const bx=p.x+Math.cos(p.ang)*80,by=p.y+Math.sin(p.ang)*80;
if(I.a&&!p.ball){
p.ball={x:bx,y:by,vx:Math.cos(p.ang)*260+p.angVel*80,vy:Math.sin(p.ang)*260};
FX.tone(300,.1,"square",.04,-100);
}
if(p.ball){
p.ball.x+=p.ball.vx*dt;p.ball.y+=p.ball.vy*dt;
p.ball.vy+=600*dt;
p.ball.x=cl(p.ball.x,20,W-20);
if(p.ball.y>H-30){p.ball.y=H-30;p.ball.vy=-p.ball.vy*.5;p.ball.vx*=.9;}
if(p.ball.y<-40||Math.hypot(p.ball.vx,p.ball.vy)<60)p.ball=null;
const o=g.pl[1-i];
if(p.ball&&Math.hypot(p.ball.x-o.x,p.ball.y-o.y)<40){
const spd=Math.hypot(p.ball.vx,p.ball.vy);
if(spd>100){o.hp--;p.ball=null;
g.burst(o.x,o.y,col(i),20,380);playHitSound();
if(o.hp<=0)g.point(i,"KO");}
}
}
});
},
draw(g,ctx){
g.floor("#1a1a3a","#22224a");
g.pl.forEach((p,i)=>{
ctx.strokeStyle="#c8a46a";ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(p.x,p.y);
ctx.lineTo(p.x+Math.cos(p.ang)*80,p.y+Math.sin(p.ang)*80);ctx.stroke();
ctx.fillStyle="#6a4a2a";ctx.beginPath();ctx.arc(p.x+Math.cos(p.ang)*80,p.y+Math.sin(p.ang)*80,14,0,Math.PI*2);ctx.fill();
if(p.ball){ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(p.ball.x,p.ball.y,12,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();}
g.blob({x:p.x,y:p.y,r:16},col(i),p.x+60,p.y,false);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+30,60,6);
ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+30,60*Math.max(0,p.hp)/3,6);
});
}
});

/* ---------- 2. BUMPER CHAOS ---------- */
micro({id:"bumperchaosGame",title:"Bumper Chaos",desc:"Momentum collisions. Bigger hits push rival further.",
cat:"action",key:"bumperchaos",win:3,
controls:"P1: WASD, SPACE burst　 P2: ARROWS, ENTER — collisions transfer momentum. Get pushed into a wall = damage.",
round(g){
g.pl=[{x:225,y:250,vx:0,vy:0,hp:3,burst:0,cd:0},{x:675,y:250,vx:0,vy:0,hp:3,burst:0,cd:0}];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.cd=Math.max(0,p.cd-dt);
if(p.burst>0){p.burst-=dt;}
else{
const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0),l=Math.hypot(ax,ay)||1;
p.vx+=ax/l*600*dt;p.vy+=ay/l*600*dt;
if(I.a&&p.cd<=0){p.burst=.15;p.cd=.7;p.vx*=3;p.vy*=3;
FX.tone(500,.1,"sawtooth",.03,300);}
}
p.vx*=.98;p.vy*=.98;
const sp=Math.hypot(p.vx,p.vy);
if(sp>500){p.vx*=500/sp;p.vy*=500/sp;}
p.x+=p.vx*dt;p.y+=p.vy*dt;
if(p.x<20||p.x>W-20){p.x=cl(p.x,20,W-20);
if(Math.abs(p.vx)>200&&p.burst<=0){p.hp-=dt*3;if(p.hp<=0)g.point(1-i,"SLAMMED");}
p.vx=-p.vx*.7;}
if(p.y<60||p.y>H-20){p.y=cl(p.y,60,H-20);
if(Math.abs(p.vy)>200&&p.burst<=0){p.hp-=dt*3;if(p.hp<=0)g.point(1-i,"SLAMMED");}
p.vy=-p.vy*.7;}
});
const [a,b]=g.pl,d=Math.hypot(a.x-b.x,a.y-b.y);
if(d<36&&d>0){
const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d;
const vn=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
a.x-=nx*(36-d)/2;a.y-=ny*(36-d)/2;b.x+=nx*(36-d)/2;b.y+=ny*(36-d)/2;
if(vn<0){
const imp=-1.5*vn/2;
a.vx-=imp*nx;a.vy-=imp*ny;b.vx+=imp*nx;b.vy+=imp*ny;
g.burst((a.x+b.x)/2,(a.y+b.y)/2,GOLD,6,160);playHitSound();
}
}
},
draw(g,ctx){
g.floor("#101a3a","#1a2548");
ctx.strokeStyle=RED;ctx.lineWidth=4;
ctx.strokeRect(18,58,W-36,H-78);
g.pl.forEach((p,i)=>{
if(p.burst>0){ctx.fillStyle="rgba(255,230,109,.5)";ctx.beginPath();ctx.arc(p.x,p.y,28,0,Math.PI*2);ctx.fill();}
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,Math.hypot(p.vx,p.vy)>100);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,6);
ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/3,6);
});
}
});

/* ---------- 3. BOWLING DUEL (FIXED) ---------- */
micro({id:"bowlduelGame",title:"Bowling Duel",desc:"Roll balls at pins. Most pins knocked down wins.",
cat:"sports",key:"bowlduel",win:3,
controls:"P1: A/D aim, hold W to charge, release to throw　 P2: ←/→ aim, hold ↑ — knock over your pins, most wins",
round(g){
g.pl=[{pins:10,total:0,aim:0,power:0,charging:false,balls:5},
      {pins:10,total:0,aim:0,power:0,charging:false,balls:5}];
g.pins=[
Array.from({length:10},(_,k)=>({x:225+(k%4-1.5)*30,y:120+Math.floor(k/4)*30,dead:false})),
Array.from({length:10},(_,k)=>({x:675+(k%4-1.5)*30,y:120+Math.floor(k/4)*30,dead:false}))
];
g.cur=0;g.ball=null;
},
update(g,dt){
const p=g.pl[g.cur],I=g.I[g.cur];
if(g.ball){
g.ball.y+=g.ball.vy*dt;g.ball.vy+=800*dt;
g.pins[g.cur].forEach(pin=>{
if(!pin.dead&&Math.hypot(g.ball.x-pin.x,g.ball.y-pin.y)<24){
pin.dead=true;p.pins--;
FX.tone(500,.08,"square",.05);
}
});
if(g.ball.y>H+30){
g.ball=null;p.balls--;
p.total+=10-p.pins;p.pins=10;
g.pins[g.cur].forEach(pin=>pin.dead=false);
if(g.pl[0].balls<=0&&g.pl[1].balls<=0){g.byScore(g.pl.map(x=>x.total));return;}
g.cur=1-g.cur;
}
return;
}
if(p.balls<=0){g.cur=1-g.cur;return;}
if(!p.charging){
if(I.l)p.aim-=.6*dt;
if(I.r)p.aim+=.6*dt;
p.aim=cl(p.aim,-.8,.8);
if(I.u){p.charging=true;p.power=0;}
}else{
p.power=Math.min(1,p.power+dt*1.5);
if(!I.u){
g.ball={x:g.cur===0?225:675,y:380,vx:Math.sin(p.aim)*(200+p.power*300),vy:-400-p.power*500};
p.charging=false;p.power=0;
FX.tone(400,.1,"square",.04);
}
}
},
draw(g,ctx){
g.floor("#8a5a2a","#a86a3a");
ctx.fillStyle="#1a1a1a";ctx.fillRect(0,50,W,30);
g.pins.forEach(pins=>pins.forEach(pin=>{
if(pin.dead)return;
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(pin.x,pin.y,10,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
}));
if(g.ball){
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(g.ball.x,g.ball.y,14,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
}
const p=g.pl[g.cur];
if(p.charging){
const cx=g.cur===0?225:675;
ctx.strokeStyle=GOLD;ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(cx,380);
ctx.lineTo(cx+Math.sin(p.aim)*p.power*180,380-p.power*180);ctx.stroke();
}
g.pl.forEach((pl,i)=>g.text("P"+(i+1)+" total:"+pl.total+" balls:"+pl.balls,i?W-40:40,30,16,col(i),i?"right":"left"));
g.text("P"+(g.cur+1)+" THROWS",W/2,30,18,col(g.cur),"center");
}
});

/* ---------- 4. ICE SLIDE ---------- */
micro({id:"iceslideGame",title:"Ice Slide",desc:"Slippery arena. Momentum doesn't stop easily.",
cat:"reflex",key:"iceslide",win:3,
controls:"P1: WASD accelerate　 P2: ARROWS — you slide without friction. Reach goal first.",
round(g){
g.pl=[{x:100,y:250,vx:0,vy:0},{x:800,y:250,vx:0,vy:0}];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0),l=Math.hypot(ax,ay)||1;
p.vx+=ax/l*400*dt;p.vy+=ay/l*400*dt;
p.vx*=.995;p.vy*=.995;
const sp=Math.hypot(p.vx,p.vy);
if(sp>420){p.vx*=420/sp;p.vy*=420/sp;}
p.x+=p.vx*dt;p.y+=p.vy*dt;
if(p.x<20||p.x>W-20){p.x=cl(p.x,20,W-20);p.vx*=-.6;}
if(p.y<60||p.y>H-20){p.y=cl(p.y,60,H-20);p.vy*=-.6;}
});
[0,1].forEach(i=>{
const p=g.pl[i];
if(i===0&&p.x>W-50)g.point(0,"GOAL");
if(i===1&&p.x<50)g.point(1,"GOAL");
});
},
draw(g,ctx){
g.floor("#bfe7ff","#d8f0ff");
ctx.strokeStyle="rgba(255,255,255,.6)";ctx.lineWidth=2;
for(let k=0;k<8;k++){
ctx.beginPath();ctx.moveTo(k*120,60);ctx.lineTo(k*120-60,H);ctx.stroke();
}
ctx.fillStyle=C2;ctx.fillRect(W-40,200,30,200);
ctx.fillStyle=C1;ctx.fillRect(10,200,30,200);
g.pl.forEach((p,i)=>g.blob({x:p.x,y:p.y,r:14},col(i),p.x+p.vx*.2,p.y+p.vy*.2,Math.hypot(p.vx,p.vy)>60));
}
});

/* ---------- 5. GRAVITY PAINT ---------- */
micro({id:"gravpaintGame",title:"Gravity Paint",desc:"Paint the floor to redirect gravity. Get rival into spikes.",
cat:"action",key:"gravpaint",win:3,
controls:"P1: WASD move, SPACE paint (lasts 4s)　 P2: ARROWS, ENTER — standing on rival's paint pulls you toward it",
round(g){
g.pl=[{x:200,y:200,hp:3,paint:0,cd:0},{x:700,y:300,hp:3,paint:0,cd:0}];
g.paint=[];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.cd=Math.max(0,p.cd-dt);
if(I.a&&p.cd<=0){
p.cd=1.2;
g.paint.push({x:p.x,y:p.y,o:i,life:4});
}
const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0),l=Math.hypot(ax,ay)||1;
p.x+=ax/l*240*dt;p.y+=ay/l*240*dt;
let gx=0,gy=0;
g.paint.forEach(pt=>{
if(pt.o===i)return;
const dx=pt.x-p.x,dy=pt.y-p.y,d=Math.max(Math.hypot(dx,dy),40);
gx+=dx/d*(120/d)*40;gy+=dy/d*(120/d)*40;
});
p.x+=gx*dt;p.y+=gy*dt;
p.x=cl(p.x,20,W-20);p.y=cl(p.y,60,H-20);
const inSpike=(p.x<100&&p.y<140)||(p.x>W-100&&p.y<140)||(p.x<100&&p.y>H-100)||(p.x>W-100&&p.y>H-100);
if(inSpike){p.hp-=dt*2;if(p.hp<=0)g.point(1-i,"SPIKED");}
});
g.paint.forEach(pt=>pt.life-=dt);
g.paint=g.paint.filter(pt=>pt.life>0);
},
draw(g,ctx){
g.floor("#0a1020","#151838");
g.paint.forEach(pt=>{
ctx.fillStyle=col(pt.o);ctx.globalAlpha=pt.life/4*.4;
ctx.beginPath();ctx.arc(pt.x,pt.y,45,0,Math.PI*2);ctx.fill();
ctx.globalAlpha=1;
});
ctx.fillStyle="#3a3a4a";
for(let k=0;k<5;k++){
ctx.beginPath();ctx.moveTo(k*18,0);ctx.lineTo(k*18+9,60);ctx.lineTo(k*18+18,0);ctx.fill();
ctx.beginPath();ctx.moveTo(W-k*18,0);ctx.lineTo(W-k*18-9,60);ctx.lineTo(W-k*18-18,0);ctx.fill();
ctx.beginPath();ctx.moveTo(k*18,H);ctx.lineTo(k*18+9,H-60);ctx.lineTo(k*18+18,H);ctx.fill();
ctx.beginPath();ctx.moveTo(W-k*18,H);ctx.lineTo(W-k*18-9,H-60);ctx.lineTo(W-k*18-18,H);ctx.fill();
}
g.pl.forEach((p,i)=>{
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,false);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,6);
ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/3,6);
});
}
});

/* ---------- 6. TETHER FIGHT ---------- */
micro({id:"tetherGame",title:"Tether Fight",desc:"Roped together. Yank rival into hazards.",
cat:"action",key:"tether",win:3,
controls:"P1: WASD move　 P2: ARROWS — you're roped together. Rope tension damages the slacker.",
round(g){
g.pl=[{x:350,y:250,hp:3},{x:550,y:250,hp:3}];
g.ropeLen=120;
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*260*dt,20,W-20);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*260*dt,60,H-20);
});
const [a,b]=g.pl;
const d=Math.hypot(a.x-b.x,a.y-b.y);
if(d>g.ropeLen){
const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d;
const over=d-g.ropeLen;
a.x+=nx*over/2;a.y+=ny*over/2;
b.x-=nx*over/2;b.y-=ny*over/2;
if(over>15){
a.hp-=dt*1.5;b.hp-=dt*1.5;
}
}
if(a.hp<=0&&b.hp<=0)g.next("BOTH SNAP");
else if(a.hp<=0)g.point(1,"P1 SNAPPED");
else if(b.hp<=0)g.point(0,"P2 SNAPPED");
},
draw(g,ctx){
g.floor("#101a3a","#1a2548");
ctx.strokeStyle="#c8a46a";ctx.lineWidth=4;
ctx.beginPath();ctx.moveTo(g.pl[0].x,g.pl[0].y);ctx.lineTo(g.pl[1].x,g.pl[1].y);ctx.stroke();
g.pl.forEach((p,i)=>{
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,false);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,6);
ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/3,6);
});
const d=Math.hypot(g.pl[0].x-g.pl[1].x,g.pl[0].y-g.pl[1].y);
g.text("ROPE: "+Math.round(d)+" / "+g.ropeLen,W/2,40,16,d>g.ropeLen?RED:"#9fc0ff","center");
}
});

/* ---------- 7. BARRELS ---------- */
micro({id:"barrelsGame",title:"Barrels",desc:"Roll barrels down the hill. Smash rival's tower.",
cat:"sports",key:"barrels",win:3,
controls:"P1: SPACE roll barrel (3 max)　 P2: ENTER — barrels roll and hit rival's tower. 3 HP each.",
round(g){
g.pl=[{x:225,y:100,hp:3,barrels:3},{x:675,y:100,hp:3,barrels:3}];
g.rolls=[];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
if(I.a&&p.barrels>0){
p.barrels--;
g.rolls.push({x:p.x,y:p.y,vx:0,vy:260,o:i,spin:0});
FX.tone(400,.1,"square",.03);
}
});
g.rolls.forEach(r=>{
r.x+=r.vx*dt;r.y+=r.vy*dt;
r.vy+=800*dt;r.spin+=r.vy*dt*.05;
const o=g.pl[1-r.o];
if(Math.hypot(r.x-o.x,r.y-o.y)<30){
o.hp--;r.dead=true;
g.burst(o.x,o.y,col(r.o),16,350);FX.playBoom();
if(o.hp<=0)g.point(r.o,"SMASHED");
}
if(r.y>H+30)r.dead=true;
});
g.rolls=g.rolls.filter(r=>!r.dead);
},
draw(g,ctx){
const gr=ctx.createLinearGradient(0,0,0,H);
gr.addColorStop(0,"#3a8a3a");gr.addColorStop(1,"#6aaa4a");
ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
g.rolls.forEach(r=>{
ctx.save();ctx.translate(r.x,r.y);ctx.rotate(r.spin);
ctx.fillStyle="#8a5a2a";ctx.fillRect(-16,-12,32,24);
ctx.fillStyle="#a86a3a";ctx.fillRect(-14,-4,28,4);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(-16,-12,32,24);
ctx.restore();
});
g.pl.forEach((p,i)=>{
g.blob({x:p.x,y:p.y,r:16},col(i),p.x,p.y+40,false);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+30,60,6);
ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+30,60*Math.max(0,p.hp)/3,6);
g.text("BARRELS: "+p.barrels,i?W-40:40,80,14,GOLD,i?"right":"left");
});
}
});

/* ---------- 8. AVALANCHE ---------- */
micro({id:"avalancheGame",title:"Avalanche",desc:"Dodge falling rocks. Push rival into the line of fire.",
cat:"reflex",key:"avalanche",win:3,
controls:"P1: WASD move　 P2: ARROWS — rocks fall randomly. Push rival into one to score.",
round(g){
g.pl=[{x:225,y:250,hp:3},{x:675,y:250,hp:3}];
g.rocks=[];
g.spawnT=0;
},
update(g,dt){
g.spawnT-=dt;
if(g.spawnT<=0){g.spawnT=Math.max(.4,.8-Math.random()*.3);
g.rocks.push({x:rnd(60,W-60),y:-30,v:200+Math.random()*150,r:18+Math.random()*10});
}
g.rocks.forEach(r=>r.y+=r.v*dt);
g.rocks=g.rocks.filter(r=>r.y<H+30);
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*260*dt,20,W-20);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*260*dt,60,H-20);
for(const r of g.rocks){
if(Math.hypot(r.x-p.x,r.y-p.y)<r.r+12){
p.hp--;r.y=H+50;
g.burst(r.x,r.y,col(1-i),14,300);playHitSound();
if(p.hp<=0)g.point(1-i,"CRUSHED");
}
}
});
const [a,b]=g.pl,d=Math.hypot(a.x-b.x,a.y-b.y);
if(d<34&&d>0){
const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d;
a.x-=nx*4;a.y-=ny*4;b.x+=nx*4;b.y+=ny*4;
}
},
draw(g,ctx){
const gr=ctx.createLinearGradient(0,0,0,H);
gr.addColorStop(0,"#8aa8c8");gr.addColorStop(1,"#c8d8e8");
ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
g.rocks.forEach(r=>{
ctx.fillStyle="#6a5a4a";ctx.beginPath();
for(let k=0;k<6;k++){
const a=k*Math.PI/3;
const r2=r.r*(.8+Math.sin(k*3.1)*.2);
ctx[k?"lineTo":"moveTo"](r.x+Math.cos(a)*r2,r.y+Math.sin(a)*r2);
}
ctx.closePath();ctx.fill();
ctx.strokeStyle="#3a2a1a";ctx.lineWidth=2;ctx.stroke();
});
g.pl.forEach((p,i)=>{
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,false);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-30,p.y+28,60,6);
ctx.fillStyle=GREEN;ctx.fillRect(p.x-30,p.y+28,60*Math.max(0,p.hp)/3,6);
});
}
});
})();