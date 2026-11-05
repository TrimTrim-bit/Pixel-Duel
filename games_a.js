/* =====================================================
   GAME PACK A — 10 games
   Coin Rush, King of the Hill, Paint Wars, Mini Soccer,
   Snowball Fight, Crumbling Floor, Bumper Cars,
   Fruit Catch, Meteor Dodge, Runner Duel
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const mkp=(x,y,color,r=16)=>({x,y,r,color,vx:0,vy:0,fx:1,fy:0});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const col=i=>i?C2:C1;

/* ---------- 1. COIN RUSH ---------- */
micro({id:"coinGame",title:"Coin Rush",desc:"Grab the most coins in 25 seconds",cat:"arcade",key:"coin",win:1,hud:false,
controls:"P1: W/A/S/D　 P2: ARROWS — gold coins are worth 3",
init(g){g.s=[0,0];g.time=25;g.coins=[];g.spawn=0;g.pl=[mkp(200,250,C1),mkp(700,250,C2)];},
update(g,dt){
g.time-=dt;
g.pl.forEach((p,i)=>g.walk(p,i,235));
g.spawn-=dt;
if(g.spawn<=0&&g.coins.length<7){g.spawn=.5;g.coins.push({x:rnd(40,860),y:rnd(70,460),gold:Math.random()<.15,ph:rnd(0,6)});}
for(const c of g.coins)g.pl.forEach((p,i)=>{
if(!c.got&&Math.hypot(p.x-c.x,p.y-c.y)<p.r+12){
c.got=true;g.s[i]+=c.gold?3:1;g.burst(c.x,c.y,c.gold?GOLD:"#fff",8,200);
FX.tone(c.gold?1100:800,.07,"square",.04,300);
}
});
g.coins=g.coins.filter(c=>!c.got);
if(g.time<=0)g.byScore(g.s);
},
draw(g,ctx){
g.floor("#1a1530","#201a3a");
for(const c of g.coins){
const w=Math.abs(Math.cos(g.t*4+c.ph))*10+2;
ctx.fillStyle="rgba(0,0,0,.3)";ctx.fillRect(c.x-8,c.y+12,16,4);
ctx.fillStyle=c.gold?GOLD:"#e8c84a";ctx.beginPath();ctx.ellipse(c.x,c.y,w,12,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle=c.gold?"#fff":"#a88a20";ctx.lineWidth=2;ctx.stroke();
}
g.pl.forEach((p,i)=>g.blob(p,col(i),p.x+p.fx*9,p.y+p.fy*9,p.vx||p.vy));
g.timedHud(g.s,g.time);
}
});

/* ---------- 2. KING OF THE HILL ---------- */
micro({id:"hillGame",title:"King of the Hill",desc:"Hold the zone, shove your rival out",cat:"action",key:"hill",win:1,hud:false,
controls:"P1: W/A/S/D + SPACE dash　 P2: ARROWS + ENTER dash",
init(g){
g.s=[0,0];g.time=40;g.zt=0;g.zone={x:450,y:260,r:78};
g.pl=[mkp(250,260,C1,18),mkp(650,260,C2,18)];
g.pl.forEach(p=>{p.dash=0;p.cd=0;p.kx=0;p.ky=0;});
},
update(g,dt){
g.time-=dt;g.zt+=dt;
if(g.zt>7){g.zt=0;g.zone.x=rnd(170,730);g.zone.y=rnd(140,420);FX.tone(500,.15,"triangle",.04,300);}
g.pl.forEach((p,i)=>{
g.walk(p,i,200);
p.cd=Math.max(0,p.cd-dt);
if(g.I[i].pa&&p.cd<=0){p.dash=.15;p.cd=1.4;p.dx=p.fx;p.dy=p.fy;FX.tone(400,.1,"sawtooth",.03,400);}
if(p.dash>0){p.dash-=dt;p.x+=p.dx*620*dt;p.y+=p.dy*620*dt;}
p.x+=p.kx*dt;p.y+=p.ky*dt;p.kx*=.9;p.ky*=.9;
p.x=clamp(p.x,p.r,W-p.r);p.y=clamp(p.y,p.r+40,H-p.r);
});
const [a,b]=g.pl,d=dist(a,b);
if(d<a.r+b.r&&d>0){
const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d,o=(a.r+b.r-d)/2;
a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;
if(a.dash>0){b.kx+=nx*420;b.ky+=ny*420;g.burst((a.x+b.x)/2,(a.y+b.y)/2,GOLD,10);FX.playHitSound&&playHitSound();}
if(b.dash>0){a.kx-=nx*420;a.ky-=ny*420;g.burst((a.x+b.x)/2,(a.y+b.y)/2,GOLD,10);playHitSound();}
}
const inside=g.pl.map(p=>dist(p,g.zone)<g.zone.r-p.r*.3);
if(inside[0]&&!inside[1])g.s[0]+=dt;
if(inside[1]&&!inside[0])g.s[1]+=dt;
g.inside=inside;
if(g.time<=0)g.byScore(g.s.map(x=>Math.round(x*10)));
},
draw(g,ctx){
g.floor("#14233a","#182b46");
const z=g.zone,ins=g.inside||[false,false];
ctx.fillStyle=ins[0]&&!ins[1]?"rgba(100,234,255,.25)":ins[1]&&!ins[0]?"rgba(255,114,200,.25)":"rgba(255,230,109,.15)";
ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle=GOLD;ctx.lineWidth=4;ctx.setLineDash([14,10]);ctx.lineDashOffset=-g.t*30;
ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
ctx.fillStyle=GOLD;ctx.font="bold 40px Courier New";ctx.textAlign="center";ctx.fillText("♛",z.x,z.y+14);ctx.textAlign="left";
g.pl.forEach((p,i)=>{
if(p.dash>0){ctx.globalAlpha=.4;ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(p.x-p.dx*14,p.y-p.dy*14,p.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
g.blob(p,col(i),g.pl[1-i].x,g.pl[1-i].y,p.vx||p.vy);
});
g.text("P1 "+g.s[0].toFixed(1)+"s",20,30,20,C1);
g.text("P2 "+g.s[1].toFixed(1)+"s",W-20,30,20,C2,"right");
g.text(String(Math.max(0,Math.ceil(g.time))),W/2,32,28,GOLD,"center");
}
});

/* ---------- 3. PAINT WARS ---------- */
micro({id:"paintGame",title:"Paint Wars",desc:"Cover more floor in 30 seconds",cat:"arcade",key:"paint",win:1,hud:false,
controls:"P1: W/A/S/D　 P2: ARROWS — repaint your rival's tiles",
init(g){
g.time=30;g.cells=new Int8Array(30*16).fill(-1);g.s=[0,0];
g.pl=[mkp(120,260,C1,13),mkp(780,260,C2,13)];
},
update(g,dt){
g.time-=dt;
g.pl.forEach((p,i)=>{
g.walk(p,i,215,{x0:p.r,x1:W-p.r,y0:20+p.r,y1:500-p.r-20});
const cx=clamp(Math.floor(p.x/30),0,29),cy=clamp(Math.floor((p.y-20)/30),0,15),k=cy*30+cx;
if(g.cells[k]!==i){if(g.cells[k]>=0)g.s[g.cells[k]]--;g.cells[k]=i;g.s[i]++;if(Math.random()<.3)g.burst(p.x,p.y,col(i),2,90);}
});
if(g.time<=0)g.byScore(g.s);
},
draw(g,ctx){
ctx.fillStyle="#10162e";ctx.fillRect(0,0,W,H);
for(let i=0;i<480;i++){
const o=g.cells[i];
const x=(i%30)*30,y=Math.floor(i/30)*30+20;
ctx.fillStyle=o<0?((i%30+Math.floor(i/30))%2?"#141c3c":"#18224a"):(o?"rgba(255,114,200,.7)":"rgba(100,234,255,.7)");
ctx.fillRect(x,y,30,30);
if(o>=0){ctx.fillStyle="rgba(255,255,255,.18)";ctx.fillRect(x,y,30,4);}
}
g.pl.forEach((p,i)=>g.blob(p,col(i),p.x+p.fx*9,p.y+p.fy*9,p.vx||p.vy));
const tot=g.s[0]+g.s[1]||1;
ctx.fillStyle="#080b18";ctx.fillRect(0,0,W,20);
ctx.fillStyle=C1;ctx.fillRect(0,2,W*g.s[0]/480,16);
ctx.fillStyle=C2;ctx.fillRect(W-W*g.s[1]/480,2,W*g.s[1]/480,16);
g.text(String(Math.ceil(Math.max(0,g.time))),W/2,16,16,"#fff","center");
}
});

/* ---------- 4. MINI SOCCER ---------- */
micro({id:"soccerGame",title:"Mini Soccer",desc:"Top-down football, first to 5",cat:"sports",key:"soccer",win:5,
controls:"P1: W/A/S/D + SPACE kick　 P2: ARROWS + ENTER kick",
round(g){
g.pl=[mkp(200,250,C1,20),mkp(700,250,C2,20)];
g.ball={x:450,y:250,vx:0,vy:0,r:12};
},
update(g,dt){
const b=g.ball;
g.pl.forEach((p,i)=>{
g.walk(p,i,225,{x0:p.r,x1:W-p.r,y0:p.r+30,y1:H-p.r});
const d=dist(p,b);
if(d<p.r+b.r&&d>0){
const nx=(b.x-p.x)/d,ny=(b.y-p.y)/d;
b.x=p.x+nx*(p.r+b.r);b.y=p.y+ny*(p.r+b.r);
const sp=Math.max(260,Math.hypot(b.vx,b.vy)*.7);
b.vx=nx*sp+p.vx*.6;b.vy=ny*sp+p.vy*.6;FX.tone(220,.05,"square",.03);
}
if(g.I[i].pa&&d<p.r+b.r+16){
const nx=(b.x-p.x)/(d||1),ny=(b.y-p.y)/(d||1);
b.vx=nx*640;b.vy=ny*640;g.burst(b.x,b.y,"#fff",6,180);FX.tone(160,.08,"square",.05,-60);
}
});
b.x+=b.vx*dt;b.y+=b.vy*dt;b.vx*=.987;b.vy*=.987;
if(b.y<b.r+30){b.y=b.r+30;b.vy=Math.abs(b.vy);}
if(b.y>H-b.r){b.y=H-b.r;b.vy=-Math.abs(b.vy);}
const mouth=b.y>185&&b.y<315;
if(b.x<b.r&&!mouth){b.x=b.r;b.vx=Math.abs(b.vx);}
if(b.x>W-b.r&&!mouth){b.x=W-b.r;b.vx=-Math.abs(b.vx);}
if(b.x<-b.r){g.burst(20,b.y,C2,30,400);g.point(1,"GOAL P2!");}
if(b.x>W+b.r){g.burst(880,b.y,C1,30,400);g.point(0,"GOAL P1!");}
},
draw(g,ctx){
g.floor("#1f6b3a","#23773f",50);
ctx.strokeStyle="rgba(255,255,255,.7)";ctx.lineWidth=3;
ctx.strokeRect(6,36,W-12,H-42);
ctx.beginPath();ctx.moveTo(450,36);ctx.lineTo(450,H-6);ctx.stroke();
ctx.beginPath();ctx.arc(450,268,60,0,Math.PI*2);ctx.stroke();
ctx.strokeRect(6,150,90,200);ctx.strokeRect(W-96,150,90,200);
ctx.fillStyle="rgba(255,255,255,.18)";ctx.fillRect(0,185,12,130);ctx.fillRect(W-12,185,12,130);
ctx.fillStyle="#fff";ctx.fillRect(0,180,10,6);ctx.fillRect(0,314,10,6);ctx.fillRect(W-10,180,10,6);ctx.fillRect(W-10,314,10,6);
const b=g.ball;
ctx.fillStyle="rgba(0,0,0,.3)";ctx.beginPath();ctx.ellipse(b.x,b.y+10,b.r,4,0,0,Math.PI*2);ctx.fill();
g.pl.forEach((p,i)=>g.blob(p,col(i),b.x,b.y,p.vx||p.vy));
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle="#080b18";ctx.fillRect(b.x-3,b.y-3,6,6);
}
});

/* ---------- 5. SNOWBALL FIGHT ---------- */
micro({id:"snowGame",title:"Snowball Fight",desc:"Hide behind ice, three hits wins a round",cat:"action",key:"snow",win:3,
controls:"P1: W/A/S/D + SPACE throw　 P2: ARROWS + ENTER throw",
round(g){
g.pl=[mkp(90,250,C1),mkp(810,250,C2)];
g.pl[1].fx=-1;g.pl.forEach(p=>{p.hp=3;p.cd=0;});
g.shots=[];
const base=[{x:260,y:90,w:44,h:100},{x:420,y:215,w:60,h:70},{x:260,y:310,w:44,h:100}];
g.walls=[];base.forEach(w=>{g.walls.push(w);if(w.x!==420)g.walls.push({x:W-w.x-w.w,y:w.y,w:w.w,h:w.h});});
},
update(g,dt){
g.pl.forEach((p,i)=>{
g.walk(p,i,190,{x0:p.r,x1:W-p.r,y0:p.r+30,y1:H-p.r});
p.cd-=dt;
if(g.I[i].a&&p.cd<=0){p.cd=.45;g.shots.push({x:p.x+p.fx*20,y:p.y+p.fy*20,vx:p.fx*400,vy:p.fy*400,o:i});FX.tone(500,.08,"triangle",.04,-200);}
});
for(const s of g.shots){
s.x+=s.vx*dt;s.y+=s.vy*dt;
if(s.x<0||s.x>W||s.y<30||s.y>H||g.walls.some(w=>s.x>w.x&&s.x<w.x+w.w&&s.y>w.y&&s.y<w.y+w.h)){s.dead=true;g.burst(s.x,s.y,"#fff",4,100);}
const t=g.pl[1-s.o];
if(!s.dead&&dist(s,t)<t.r+5){
s.dead=true;t.hp--;g.burst(s.x,s.y,"#fff",12,260);playHitSound();
if(t.hp<=0){g.burst(t.x,t.y,t.color,24,360);g.point(s.o);}
}
}
g.shots=g.shots.filter(s=>!s.dead);
},
draw(g,ctx){
g.floor("#d4e8ff","#c4ddf7");
for(const w of g.walls){
ctx.fillStyle="rgba(0,0,40,.18)";ctx.fillRect(w.x+4,w.y+5,w.w,w.h);
ctx.fillStyle="#8fc8f5";ctx.fillRect(w.x,w.y,w.w,w.h);
ctx.fillStyle="#d6f0ff";ctx.fillRect(w.x,w.y,w.w,6);
ctx.fillStyle="#6aa8dc";ctx.fillRect(w.x,w.y+w.h-6,w.w,6);
ctx.strokeStyle="#3f78b0";ctx.lineWidth=2;ctx.strokeRect(w.x,w.y,w.w,w.h);
}
g.pl.forEach((p,i)=>{
g.blob(p,col(i),p.x+p.fx*9,p.y+p.fy*9,p.vx||p.vy);
g.text("♥".repeat(Math.max(0,p.hp)),p.x,p.y-p.r-8,14,"#ff3366","center");
});
for(const s of g.shots){ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(s.x,s.y,6,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#6aa8dc";ctx.lineWidth=2;ctx.stroke();}
}
});

/* ---------- 6. CRUMBLING FLOOR ---------- */
micro({id:"crumbleGame",title:"Crumbling Floor",desc:"Stay on the tiles. Shove your rival off.",cat:"action",key:"crumble",win:3,
controls:"P1: W/A/S/D　 P2: ARROWS — tiles crack when stepped on",
round(g){
g.tiles=[];for(let i=0;i<72;i++)g.tiles.push({s:0,t:0});
g.pl=[mkp(150,250,C1,14),mkp(750,250,C2,14)];
g.pl.forEach(p=>{p.fall=0;p.alive=true;p.scale=1;});
g.rt=0;
},
update(g,dt){
g.rt+=dt;
if(g.rt>1.1){g.rt=0;const solid=g.tiles.map((t,i)=>t.s===0?i:-1).filter(i=>i>=0);if(solid.length){const t=g.tiles[solid[ri(0,solid.length-1)]];t.s=1;t.t=.9;}}
g.tiles.forEach((t,i)=>{if(t.s===1){t.t-=dt;if(t.t<=0){t.s=2;g.burst((i%12)*75+37,Math.floor(i/12)*75+62,"#8a6a4a",8,160);FX.tone(120,.08,"sawtooth",.03,-60);}}});
const dead=[];
g.pl.forEach((p,i)=>{
if(!p.alive){p.scale=Math.max(0,p.scale-dt*3);return;}
g.walk(p,i,200,{x0:p.r,x1:W-p.r,y0:p.r,y1:H-p.r});
const cx=Math.floor(p.x/75),cy=Math.floor((p.y-25)/75),inG=cx>=0&&cx<12&&cy>=0&&cy<6;
const t=inG?g.tiles[cy*12+cx]:null;
if(t&&t.s===0){t.s=1;t.t=.8;}
if(!t||t.s===2){p.fall+=dt;if(p.fall>.2){p.alive=false;dead.push(i);}}else p.fall=0;
});
const [a,b]=g.pl,d=dist(a,b);
if(a.alive&&b.alive&&d<a.r+b.r&&d>0){const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d,o=(a.r+b.r-d)/2+1.2;a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;}
if(dead.length===2)g.next("BOTH FELL");
else if(dead.length===1)g.point(1-dead[0]);
},
draw(g,ctx){
ctx.fillStyle="#07091a";ctx.fillRect(0,0,W,H);
g.tiles.forEach((t,i)=>{
if(t.s===2)return;
const x=(i%12)*75,y=Math.floor(i/12)*75+25;
ctx.fillStyle=t.s===1&&Math.floor(t.t*14)%2?"#ff6a4a":((i%12+Math.floor(i/12))%2?"#3a4a8a":"#44559c");
ctx.fillRect(x+2,y+2,71,71);
ctx.fillStyle="rgba(255,255,255,.15)";ctx.fillRect(x+2,y+2,71,5);
if(t.s===1){ctx.strokeStyle="#1a0a0a";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+20,y+10);ctx.lineTo(x+40,y+38);ctx.lineTo(x+30,y+62);ctx.moveTo(x+40,y+38);ctx.lineTo(x+62,y+50);ctx.stroke();}
});
g.pl.forEach((p,i)=>{
if(p.scale<=0)return;
ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.scale,p.scale);ctx.translate(-p.x,-p.y);
g.blob(p,col(i),g.pl[1-i].x,g.pl[1-i].y,p.vx||p.vy,p.fall>0);
ctx.restore();
});
}
});

/* ---------- 7. BUMPER CARS ---------- */
micro({id:"bumperGame",title:"Bumper Cars",desc:"Icy arena that keeps shrinking",cat:"action",key:"bumper",win:3,
controls:"P1: W/A/S/D + SPACE boost　 P2: ARROWS + ENTER boost",
round(g){
g.R=230;
g.pl=[mkp(330,260,C1,20),mkp(570,260,C2,20)];
g.pl.forEach(p=>{p.cd=0;p.ang=0;});g.pl[1].ang=Math.PI;
},
update(g,dt){
g.R=Math.max(105,g.R-dt*3.2);
const cx=450,cy=262;
g.pl.forEach((p,i)=>{
const I=g.I[i];
const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0),l=Math.hypot(ax,ay);
if(l){p.vx+=ax/l*560*dt;p.vy+=ay/l*560*dt;p.ang=Math.atan2(ay,ax);}
p.cd=Math.max(0,p.cd-dt);
if(I.pa&&p.cd<=0){p.cd=2;p.vx+=Math.cos(p.ang)*420;p.vy+=Math.sin(p.ang)*420;FX.tone(300,.15,"sawtooth",.04,500);g.burst(p.x,p.y,"#fff",8,180);}
p.vx*=.985;p.vy*=.985;
const sp=Math.hypot(p.vx,p.vy);if(sp>460){p.vx*=460/sp;p.vy*=460/sp;}
p.x+=p.vx*dt;p.y+=p.vy*dt;
});
const [a,b]=g.pl,d=dist(a,b);
if(d<a.r+b.r&&d>0){
const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d,o=(a.r+b.r-d)/2;
a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;
const vn=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
if(vn<0){const j=-(1+1.1)*vn/2;a.vx-=j*nx;a.vy-=j*ny;b.vx+=j*nx;b.vy+=j*ny;g.burst((a.x+b.x)/2,(a.y+b.y)/2,GOLD,8,200);playHitSound();}
}
const out=g.pl.map(p=>Math.hypot(p.x-cx,p.y-cy)>g.R+8);
if(out[0]&&out[1])g.next("BOTH OUT");
else if(out[0])g.point(1);else if(out[1])g.point(0);
},
draw(g,ctx){
ctx.fillStyle="#0b1a3a";ctx.fillRect(0,0,W,H);
for(let i=0;i<30;i++){ctx.fillStyle="#17306a";ctx.fillRect((i*97)%W,(i*53+Math.floor(g.t*10))%H,18,3);}
ctx.fillStyle="#bfe7ff";ctx.beginPath();ctx.arc(450,262,g.R,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#7fb8e6";ctx.lineWidth=8;ctx.stroke();
ctx.strokeStyle="rgba(255,255,255,.7)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(450,262,g.R-14,.3,1.4);ctx.stroke();
g.pl.forEach((p,i)=>{
ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.ang);
ctx.fillStyle="rgba(0,0,0,.25)";ctx.fillRect(-18,-9,38,26);
ctx.fillStyle="#0c0f24";ctx.fillRect(-14,-17,10,6);ctx.fillRect(6,-17,10,6);ctx.fillRect(-14,11,10,6);ctx.fillRect(6,11,10,6);
ctx.fillStyle=col(i);ctx.fillRect(-19,-12,38,24);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(-19,-12,38,24);
ctx.fillStyle="#dff6ff";ctx.fillRect(2,-8,10,16);ctx.fillStyle=GOLD;ctx.fillRect(17,-9,3,5);ctx.fillRect(17,4,3,5);
ctx.restore();
});
}
});

/* ---------- 8. FRUIT CATCH ---------- */
micro({id:"fruitGame",title:"Fruit Catch",desc:"Catch fruit, dodge bombs, 30 seconds",cat:"arcade",key:"fruit",win:1,hud:false,
controls:"P1: A / D　 P2: LEFT / RIGHT — gold stars are worth 3, bombs stun you",
init(g){
g.s=[0,0];g.time=30;g.items=[];g.spawn=0;
g.pl=[{x:250,stun:0},{x:650,stun:0}];
},
update(g,dt){
g.time-=dt;
g.pl.forEach((p,i)=>{
if(p.stun>0){p.stun-=dt;return;}
const I=g.I[i];p.x=clamp(p.x+((I.r?1:0)-(I.l?1:0))*380*dt,45,W-45);
});
g.spawn-=dt;
if(g.spawn<=0){
g.spawn=.38;const r=Math.random();
g.items.push({x:rnd(40,860),y:-20,vy:rnd(170,290)+(30-g.time)*3,type:r<.14?"bomb":r<.22?"star":"fruit",c:["#ff4a4a","#ffb03a","#9be04a","#c04aff"][ri(0,3)]});
}
for(const it of g.items){
it.y+=it.vy*dt;
g.pl.forEach((p,i)=>{
if(it.got||p.stun>0)return;
if(it.y>H-70&&it.y<H-30&&Math.abs(it.x-p.x)<42){
it.got=true;
if(it.type==="bomb"){p.stun=.8;g.s[i]=Math.max(0,g.s[i]-3);g.burst(it.x,it.y,RED,18,360);FX.playBoom();}
else{g.s[i]+=it.type==="star"?3:1;g.burst(it.x,it.y,it.type==="star"?GOLD:it.c,8,200);FX.tone(it.type==="star"?1200:700,.06,"square",.04,300);}
}
});
}
g.items=g.items.filter(it=>!it.got&&it.y<H+30);
if(g.time<=0)g.byScore(g.s);
},
draw(g,ctx){
const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#2a3a8c");gr.addColorStop(1,"#6a4a9c");
ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
ctx.fillStyle="#2a6a3a";ctx.fillRect(0,H-26,W,26);
for(const it of g.items){
if(it.type==="bomb"){ctx.fillStyle="#1b1f3a";ctx.beginPath();ctx.arc(it.x,it.y,13,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle=Math.random()<.5?GOLD:RED;ctx.fillRect(it.x+2,it.y-20,4,6);}
else if(it.type==="star")g.text("★",it.x,it.y+10,30,GOLD,"center");
else{ctx.fillStyle=it.c;ctx.beginPath();ctx.arc(it.x,it.y,12,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(255,255,255,.5)";ctx.fillRect(it.x-6,it.y-7,4,4);ctx.fillStyle="#4ac04a";ctx.fillRect(it.x,it.y-18,5,7);}
}
g.pl.forEach((p,i)=>{
ctx.globalAlpha=p.stun>0&&Math.floor(p.stun*14)%2?.4:1;
ctx.fillStyle=col(i);ctx.beginPath();ctx.moveTo(p.x-42,H-70);ctx.lineTo(p.x+42,H-70);ctx.lineTo(p.x+32,H-28);ctx.lineTo(p.x-32,H-28);ctx.closePath();ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
ctx.strokeStyle="rgba(255,255,255,.35)";ctx.lineWidth=2;for(let k=-24;k<=24;k+=12){ctx.beginPath();ctx.moveTo(p.x+k,H-66);ctx.lineTo(p.x+k*.75,H-32);ctx.stroke();}
ctx.globalAlpha=1;
});
g.timedHud(g.s,g.time);
}
});

/* ---------- 9. METEOR DODGE ---------- */
micro({id:"meteorGame",title:"Meteor Dodge",desc:"Same sky, separate halves. Don't get hit.",cat:"reflex",key:"meteor",win:3,
controls:"P1: A / D　 P2: LEFT / RIGHT — identical meteors fall on both sides",
round(g){
g.rng=seeded(ri(1,1e6));g.rt=0;g.next_=.6;g.m=[[],[]];
g.pl=[{x:225,r:12},{x:675,r:12}];
},
update(g,dt){
g.rt+=dt;
while(g.next_<=g.rt){
const x=g.rng()*410+20,r=14+g.rng()*12,v=220+g.rt*7;
g.m[0].push({x,y:-30,r,v,a:0});g.m[1].push({x,y:-30,r,v,a:0});
g.next_+=Math.max(.14,.55-g.rt*.01)+g.rng()*.2;
}
const hit=[false,false];
g.pl.forEach((p,i)=>{
const I=g.I[i],off=i*450;
p.x=clamp(p.x+((I.r?1:0)-(I.l?1:0))*310*dt,off+16,off+434);
for(const m of g.m[i]){
m.y+=m.v*dt;m.a+=dt*3;
if(Math.hypot(m.x+off-p.x,m.y-455)<m.r+p.r-3)hit[i]=true;
}
g.m[i]=g.m[i].filter(m=>m.y<H+40);
});
if(hit[0]&&hit[1])g.next("BOTH HIT");
else if(hit[0]){g.burst(g.pl[0].x,455,C1,24,360);g.point(1);}
else if(hit[1]){g.burst(g.pl[1].x,455,C2,24,360);g.point(0);}
},
draw(g,ctx){
for(let i=0;i<2;i++){
const off=i*450;
ctx.fillStyle=i?"#140d2a":"#0b1430";ctx.fillRect(off,0,450,H);
for(let k=0;k<30;k++){ctx.fillStyle=k%3?"#4c5d99":"#9fc0ff";ctx.fillRect(off+(k*67)%450,(k*131+g.t*40*(1+k%3))%H,2,2);}
for(const m of g.m[i]){
ctx.save();ctx.translate(m.x+off,m.y);ctx.rotate(m.a);
ctx.fillStyle="rgba(255,140,60,.3)";ctx.fillRect(-m.r*.6,-m.r*2.6,m.r*1.2,m.r*2);
ctx.fillStyle="#8a6a5a";ctx.fillRect(-m.r,-m.r*.8,m.r*2,m.r*1.6);ctx.fillRect(-m.r*.8,-m.r,m.r*1.6,m.r*2);
ctx.fillStyle="#5a4238";ctx.fillRect(-m.r*.4,-m.r*.3,m.r*.5,m.r*.5);
ctx.restore();
}
const p=g.pl[i];
g.blob({x:p.x,y:455,r:p.r},col(i),p.x,300,false);
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
g.text(g.rt.toFixed(1)+"s",W/2,490,14,"#9fc0ff","center");
}
});

/* ---------- 10. RUNNER DUEL ---------- */
micro({id:"runnerGame",title:"Runner Duel",desc:"Auto-run and jump. Hit a cactus and you lose.",cat:"reflex",key:"runner",win:3,
controls:"P1: SPACE jump　 P2: ENTER jump — same obstacles in both lanes",
round(g){
g.rng=seeded(ri(1,1e6));g.dist=0;g.obs=[];g.lastX=700;
g.pl=[{y:0,vy:0},{y:0,vy:0}];
},
update(g,dt){
g.speed=320+g.dist/50;g.dist+=g.speed*dt;
while(g.lastX<g.dist+W+300){
g.lastX+=(380+g.rng()*320)*(g.speed/320);
const h=26+Math.floor(g.rng()*26),w=20+Math.floor(g.rng()*16);
g.obs.push({x:g.lastX,w,h});
if(g.rng()<.25)g.obs.push({x:g.lastX+w+28,w:18,h:h-8});
}
g.obs=g.obs.filter(o=>o.x>g.dist-100);
const hit=[false,false];
g.pl.forEach((p,i)=>{
if(g.I[i].pa&&p.y===0){p.vy=-660;FX.tone(300,.1,"square",.03,300);}
p.vy+=1900*dt;p.y=Math.min(0,p.y+p.vy*dt);if(p.y===0)p.vy=0;
for(const o of g.obs){
const sx=o.x-g.dist;
if(sx<172&&sx+o.w>148&&p.y>-o.h+4)hit[i]=true;
}
});
if(hit[0]&&hit[1])g.next("BOTH CRASHED");
else if(hit[0]){g.burst(160,210,C1,24,360);g.point(1);}
else if(hit[1]){g.burst(160,460,C2,24,360);g.point(0);}
},
draw(g,ctx){
for(let i=0;i<2;i++){
const top=i*250,gy=top+210;
ctx.fillStyle=i?"#2a1a4a":"#14305a";ctx.fillRect(0,top,W,250);
for(let k=0;k<8;k++){ctx.fillStyle=i?"#3a2a6a":"#1d4a7a";ctx.fillRect(((k*190-g.dist*.2)%1000+1000)%1000-100,top+60+(k%3)*20,120,10);}
ctx.fillStyle=i?"#4a3a2a":"#3a5a3a";ctx.fillRect(0,gy,W,40);
ctx.fillStyle="rgba(255,255,255,.18)";for(let x=-(g.dist%60);x<W;x+=60)ctx.fillRect(x,gy+14,30,3);
for(const o of g.obs){
const sx=o.x-g.dist;if(sx>W||sx<-60)continue;
ctx.fillStyle="#3aa05a";ctx.fillRect(sx,gy-o.h,o.w,o.h);
ctx.fillRect(sx-8,gy-o.h*.65,10,8);ctx.fillRect(sx-8,gy-o.h*.65-10,6,12);
ctx.fillRect(sx+o.w-2,gy-o.h*.5,10,8);ctx.fillRect(sx+o.w+4,gy-o.h*.5-12,6,14);
ctx.fillStyle="#1a6a3a";ctx.fillRect(sx+o.w-6,gy-o.h,4,o.h);
}
const p=g.pl[i];
ctx.save();ctx.translate(148,gy+p.y-34);
FX.drawFighter(ctx,22,34,col(i),1,p.y===0,false);ctx.restore();
}
ctx.fillStyle="#080b18";ctx.fillRect(0,248,W,4);
}
});
})();
