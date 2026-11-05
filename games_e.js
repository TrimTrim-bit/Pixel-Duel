/* =====================================================
   GAME PACK E — 12 action & reflex games
   Gravity Duel, Sky Climb, Bullet Dance, Blast Grid,
   Maze Munch, Road Dash, Pin Strike, Free Throw,
   Sprint, Jump Rope, Fencing, Hungry Hippos
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const mkp=(x,y,color,r=16)=>({x,y,r,color,vx:0,vy:0,fx:1,fy:0});

/* ---------- GRAVITY DUEL ---------- */
micro({id:"gravityGame",title:"Gravity Duel",desc:"Flip gravity to dodge spikes",cat:"reflex",key:"gravity",win:3,
controls:"P1: SPACE flips gravity　 P2: ENTER flips gravity — same spikes in both lanes",
round(g){
g.rng=seeded(ri(1,1e6));g.dist=0;g.obs=[];g.lastX=700;
g.pl=[{y:213,dir:1},{y:213,dir:1}];
},
update(g,dt){
g.speed=300+g.dist/60;g.dist+=g.speed*dt;
while(g.lastX<g.dist+W+300){
g.lastX+=(300+g.rng()*220)*(g.speed/300);
g.obs.push({x:g.lastX,side:g.rng()<.5?0:1,w:30+Math.floor(g.rng()*20),h:60+Math.floor(g.rng()*30)});
}
g.obs=g.obs.filter(o=>o.x>g.dist-80);
const hit=[false,false];
g.pl.forEach((p,i)=>{
if(g.I[i].pa){p.dir*=-1;FX.tone(p.dir>0?300:500,.08,"square",.04,200);}
const target=p.dir>0?213:37;
p.y+=(target-p.y)*Math.min(1,13*dt);
for(const o of g.obs){
const sx=o.x-g.dist;
if(sx<172&&sx+o.w>148){
const top=o.side===0?225-o.h:25,bot=o.side===0?225:25+o.h;
if(p.y+11>top&&p.y-11<bot)hit[i]=true;
}
}
});
if(hit[0]&&hit[1])g.next("BOTH HIT");
else if(hit[0]){g.burst(160,g.pl[0].y,C1,22,360);g.point(1);}
else if(hit[1]){g.burst(160,250+g.pl[1].y,C2,22,360);g.point(0);}
},
draw(g,ctx){
for(let i=0;i<2;i++){
const top=i*250;
ctx.fillStyle=i?"#1f1038":"#0f1a3a";ctx.fillRect(0,top,W,250);
for(let k=0;k<14;k++){ctx.fillStyle="rgba(255,255,255,.08)";ctx.fillRect(((k*90-g.dist*.4)%1000+1000)%1000-60,top+30+(k%4)*50,50,4);}
ctx.fillStyle="#3a3f7a";ctx.fillRect(0,top,W,25);ctx.fillRect(0,top+225,W,25);
ctx.fillStyle="#5a60a0";ctx.fillRect(0,top+22,W,3);ctx.fillRect(0,top+225,W,3);
for(const o of g.obs){
const sx=o.x-g.dist;if(sx>W||sx<-60)continue;
ctx.fillStyle="#ff4a6a";ctx.beginPath();
if(o.side===0){ctx.moveTo(sx,top+225);ctx.lineTo(sx+o.w/2,top+225-o.h);ctx.lineTo(sx+o.w,top+225);}
else{ctx.moveTo(sx,top+25);ctx.lineTo(sx+o.w/2,top+25+o.h);ctx.lineTo(sx+o.w,top+25);}
ctx.closePath();ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
}
const p=g.pl[i];
g.blob({x:160,y:top+p.y,r:12},col(i),400,top+p.y,true,false);
}
ctx.fillStyle="#080b18";ctx.fillRect(0,248,W,4);
}
});

/* ---------- SKY CLIMB ---------- */
micro({id:"skyGame",title:"Sky Climb",desc:"Bounce up the clouds, don't fall",cat:"action",key:"sky",win:3,
controls:"P1: A / D steer　 P2: ← / → steer — you bounce automatically. Reach the top or outlast your rival.",
round(g){
const r=seeded(ri(1,1e6));g.plats=[{x:225,y:480,w:220}];
let y=480;while(y>-3300){y-=ri(62,92);g.plats.push({x:r()*390+30,y,w:78});}
g.p=[0,1].map(()=>({x:225,y:440,vy:-720,cam:0}));
},
update(g,dt){
const dead=[false,false],won=[false,false];
g.p.forEach((p,i)=>{
const I=g.I[i];
p.x=(p.x+((I.r?1:0)-(I.l?1:0))*290*dt+450)%450;
const ob=p.y+14;
p.vy+=1500*dt;p.y+=p.vy*dt;
if(p.vy>0){
for(const pl of g.plats){
if(ob<=pl.y+2&&p.y+14>=pl.y&&Math.abs(p.x-pl.x)<pl.w/2+8){p.vy=-720;p.y=pl.y-14;FX.tone(500,.05,"square",.025,200);g.burst(p.x+i*450,pl.y-g.p[i].cam,"#fff",3,90);break;}
}
}
p.cam=Math.min(p.cam,p.y-300);
if(p.y>p.cam+540)dead[i]=true;
if(p.y<-3250)won[i]=true;
});
if(won[0]&&won[1])g.next("PHOTO FINISH");
else if(won[0])g.point(0);else if(won[1])g.point(1);
else if(dead[0]&&dead[1])g.next("BOTH FELL");
else if(dead[0])g.point(1);else if(dead[1])g.point(0);
},
draw(g,ctx){
for(let i=0;i<2;i++){
const p=g.p[i],off=i*450,cam=p.cam;
ctx.save();ctx.beginPath();ctx.rect(off,0,450,H);ctx.clip();
const k=clamp(-p.y/3300,0,1);
ctx.fillStyle=`rgb(${Math.round(70-50*k)},${Math.round(150-110*k)},${Math.round(230-150*k)})`;ctx.fillRect(off,0,450,H);
if(k>.3)for(let s=0;s<30;s++){ctx.fillStyle="rgba(255,255,255,.7)";ctx.fillRect(off+(s*73)%450,(s*131+cam*.1)%H,2,2);}
for(const pl of g.plats){
const y=pl.y-cam;if(y<-20||y>H+20)continue;
ctx.fillStyle="#3ac060";ctx.fillRect(off+pl.x-pl.w/2,y,pl.w,10);ctx.fillStyle="#7a5a3a";ctx.fillRect(off+pl.x-pl.w/2,y+10,pl.w,6);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(off+pl.x-pl.w/2,y,pl.w,16);
}
g.blob({x:off+p.x,y:p.y-cam,r:13},col(i),off+p.x,p.y-cam+60,false,p.vy>300);
ctx.restore();
g.text(Math.max(0,Math.round(-p.y/10))+"m",off+225,40,20,col(i),"center");
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* ---------- BULLET DANCE ---------- */
micro({id:"bulletGame",title:"Bullet Dance",desc:"Weave through the same bullet storm",cat:"reflex",key:"bullet",win:3,
controls:"P1: W/A/S/D　 P2: ARROWS — first to get hit loses the round. Tiny hitbox, big patterns.",
round(g){g.rt=0;g.bl=[];g.ang=0;g.r1=.5;g.r2=1;g.pl=[{x:225,y:420,r:5},{x:225,y:420,r:5}];},
update(g,dt){
g.rt+=dt;
g.r1-=dt;g.r2-=dt;
if(g.r1<=0){g.r1=.85;const n=12+Math.min(8,Math.floor(g.rt/6));g.ang+=.21;for(let k=0;k<n;k++){const a=g.ang+k*Math.PI*2/n;g.bl.push({x:225,y:60,vx:Math.cos(a)*(120+g.rt*2),vy:Math.sin(a)*(120+g.rt*2)});}FX.tone(260,.08,"triangle",.03);}
if(g.r2<=0){g.r2=.14;g.ang2=(g.ang2||0)+.55;const a=g.ang2;g.bl.push({x:225,y:60,vx:Math.cos(a)*150,vy:Math.abs(Math.sin(a))*150+30});}
const dead=[false,false];
g.pl.forEach((p,i)=>{
const I=g.I[i];
const dx=(I.r?1:0)-(I.l?1:0),dy=(I.d?1:0)-(I.u?1:0),l=Math.hypot(dx,dy)||1;
const sp=I.a?110:230;
p.x=clamp(p.x+dx/l*sp*dt,10,440);p.y=clamp(p.y+dy/l*sp*dt,100,490);
for(const b of g.bl)if(Math.hypot(b.x-p.x,b.y-p.y)<p.r+4)dead[i]=true;
});
for(const b of g.bl){b.x+=b.vx*dt;b.y+=b.vy*dt;}
g.bl=g.bl.filter(b=>b.x>-20&&b.x<470&&b.y>-20&&b.y<520);
if(dead[0]&&dead[1])g.next("BOTH HIT");
else if(dead[0]){g.burst(g.pl[0].x,g.pl[0].y,C1,20,300);g.point(1);}
else if(dead[1]){g.burst(450+g.pl[1].x,g.pl[1].y,C2,20,300);g.point(0);}
else if(g.rt>35)g.next("BOTH SURVIVED");
},
draw(g,ctx){
for(let i=0;i<2;i++){
const off=i*450;
ctx.fillStyle=i?"#1a0d2a":"#0b1030";ctx.fillRect(off,0,450,H);
for(let k=0;k<24;k++){ctx.fillStyle="#2a3a6a";ctx.fillRect(off+(k*67)%450,(k*113+g.t*30)%H,2,2);}
ctx.fillStyle="#6a2a4a";ctx.beginPath();ctx.arc(off+225,60,22+Math.sin(g.t*8)*2,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#ff6a9a";ctx.lineWidth=3;ctx.stroke();
ctx.fillStyle="#fff";ctx.fillRect(off+214,54,8,6);ctx.fillRect(off+228,54,8,6);
for(const b of g.bl){ctx.fillStyle="#ff5a9a";ctx.beginPath();ctx.arc(off+b.x,b.y,5,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.fillRect(off+b.x-1,b.y-1,2,2);}
const p=g.pl[i];
ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(off+p.x,p.y,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(off+p.x,p.y,5,0,Math.PI*2);ctx.fill();
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
g.text(g.rt.toFixed(1)+"s",W/2,490,14,"#9fc0ff","center");
}
});

/* ---------- BLAST GRID ---------- */
micro({id:"blastGame",title:"Blast Grid",desc:"Drop bombs, blow up crates, outlast your rival",cat:"action",key:"blast",win:3,
controls:"P1: W/A/S/D move, SPACE bomb　 P2: ARROWS move, ENTER bomb — tap to drop a bomb",
round(g){
g.T=[];
for(let y=0;y<11;y++){const row=[];for(let x=0;x<13;x++){
let v=0;
if(x%2===1&&y%2===1)v=1;
else if(!((x<2&&y<2)||(x>10&&y>8))&&Math.random()<.55)v=2;
row.push(v);}g.T.push(row);}
g.pl=[{gx:0,gy:0,mt:0,fx:1},{gx:12,gy:10,mt:0,fx:-1}];
g.bombs=[];g.fl=[];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];p.mt-=dt;
if(p.mt<=0){
const d=I.l?[-1,0]:I.r?[1,0]:I.u?[0,-1]:I.d?[0,1]:null;
if(d){
const nx=p.gx+d[0],ny=p.gy+d[1];
if(nx>=0&&ny>=0&&nx<13&&ny<11&&g.T[ny][nx]===0&&!g.bombs.some(b=>b.x===nx&&b.y===ny)){p.gx=nx;p.gy=ny;p.mt=.14;}
}
}
if(I.pa&&!g.bombs.some(b=>b.o===i)&&!g.bombs.some(b=>b.x===p.gx&&b.y===p.gy)){g.bombs.push({x:p.gx,y:p.gy,t:2,o:i});FX.tone(220,.1,"square",.05);}
});
let again=true;
const popped=[];
for(const b of g.bombs)b.t-=dt;
while(again){
again=false;
for(const b of g.bombs){
if(b.t>0||b.done)continue;
b.done=true;again=true;popped.push(b);
g.fl.push({x:b.x,y:b.y,t:.45});
for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
for(let s=1;s<=2;s++){
const x=b.x+dx*s,y=b.y+dy*s;
if(x<0||y<0||x>=13||y>=11||g.T[y][x]===1)break;
g.fl.push({x,y,t:.45});
const ob=g.bombs.find(o=>o.x===x&&o.y===y&&!o.done);if(ob)ob.t=0;
if(g.T[y][x]===2){g.T[y][x]=0;g.burst(190+x*40+20,30+y*40+20,"#c8a46a",8,200);break;}
}
}
}
}
if(popped.length)FX.playBoom();
g.bombs=g.bombs.filter(b=>!b.done);
g.fl.forEach(f=>f.t-=dt);g.fl=g.fl.filter(f=>f.t>0);
const dead=g.pl.map(p=>g.fl.some(f=>f.x===p.gx&&f.y===p.gy));
if(dead[0]&&dead[1])g.next("BOTH BLASTED");
else if(dead[0]){g.burst(190+g.pl[0].gx*40+20,30+g.pl[0].gy*40+20,C1,24,360);g.point(1);}
else if(dead[1]){g.burst(190+g.pl[1].gx*40+20,30+g.pl[1].gy*40+20,C2,24,360);g.point(0);}
},
draw(g,ctx){
ctx.fillStyle="#12142a";ctx.fillRect(0,0,W,H);
for(let y=0;y<11;y++)for(let x=0;x<13;x++){
const px=190+x*40,py=30+y*40,v=g.T[y][x];
ctx.fillStyle=(x+y)%2?"#1c2a4a":"#203054";ctx.fillRect(px,py,40,40);
if(v===1){ctx.fillStyle="#5a60a0";ctx.fillRect(px,py,40,40);ctx.fillStyle="#7a82c8";ctx.fillRect(px,py,40,6);ctx.fillStyle="#3a4078";ctx.fillRect(px,py+34,40,6);ctx.strokeStyle="#12142a";ctx.lineWidth=2;ctx.strokeRect(px,py,40,40);}
if(v===2){ctx.fillStyle="#a8743a";ctx.fillRect(px+2,py+2,36,36);ctx.strokeStyle="#5a3a1a";ctx.lineWidth=3;ctx.strokeRect(px+2,py+2,36,36);ctx.beginPath();ctx.moveTo(px+2,py+2);ctx.lineTo(px+38,py+38);ctx.moveTo(px+38,py+2);ctx.lineTo(px+2,py+38);ctx.stroke();}
}
for(const f of g.fl){const px=190+f.x*40,py=30+f.y*40;ctx.fillStyle="#ff8c42";ctx.fillRect(px+3,py+3,34,34);ctx.fillStyle=GOLD;ctx.fillRect(px+10,py+10,20,20);ctx.fillStyle="#fff";ctx.fillRect(px+16,py+16,8,8);}
for(const b of g.bombs){
const px=190+b.x*40+20,py=30+b.y*40+22,s=1+Math.sin(g.t*(b.t<.8?30:12))*.1;
ctx.fillStyle="#1b1f3a";ctx.beginPath();ctx.arc(px,py,13*s,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle="rgba(255,255,255,.4)";ctx.fillRect(px-6,py-7,4,4);
ctx.fillStyle=Math.random()<.5?GOLD:RED;ctx.fillRect(px+5,py-18,4,5);
}
g.pl.forEach((p,i)=>g.blob({x:190+p.gx*40+20,y:30+p.gy*40+20,r:14},col(i),190+g.pl[1-i].gx*40+20,30+g.pl[1-i].gy*40+20,false));
}
});

/* ---------- MAZE MUNCH ---------- */
function makeMaze(cols,rows){
const grid=[];for(let y=0;y<rows;y++)grid.push(new Array(cols).fill(1));
const st=[[1,1]];grid[1][1]=0;
while(st.length){
const [x,y]=st[st.length-1];
const nb=[[2,0],[-2,0],[0,2],[0,-2]].filter(([dx,dy])=>{const nx=x+dx,ny=y+dy;return nx>0&&ny>0&&nx<cols-1&&ny<rows-1&&grid[ny][nx]===1;});
if(!nb.length){st.pop();continue;}
const [dx,dy]=nb[ri(0,nb.length-1)];
grid[y+dy/2][x+dx/2]=0;grid[y+dy][x+dx]=0;st.push([x+dx,y+dy]);
}
return grid;
}
micro({id:"munchGame",title:"Maze Munch",desc:"Gobble pellets, dodge the ghost",cat:"arcade",key:"munch",win:1,hud:false,
controls:"P1: W/A/S/D　 P2: ARROWS — most pellets in 45 seconds. The ghost steals 3 of your pellets.",
init(g){
g.time=45;g.grid=makeMaze(29,15);g.s=[0,0];g.ox=15;g.oy=35;g.cs=30;
g.pel=[];
for(let y=0;y<15;y++)for(let x=0;x<29;x++)if(g.grid[y][x]===0)g.pel.push({x:g.ox+x*30+15,y:g.oy+y*30+15});
g.pl=[mkp(g.ox+45,g.oy+45,C1,9),mkp(g.ox+27*30+15,g.oy+13*30+15,C2,9)];
g.pl.forEach(p=>p.stun=0);
g.gh={x:g.ox+14*30+15,y:g.oy+7*30+15,cx:14,cy:7,tx:14,ty:7,px:-1,py:-1,cd:0};
},
update(g,dt){
g.time-=dt;
g.pl.forEach((p,i)=>{
p.stun=Math.max(0,p.stun-dt);
if(p.stun<=0)g.walk(p,i,150,{x0:p.r,x1:W-p.r,y0:p.r,y1:H-p.r});
const cx=Math.floor((p.x-g.ox)/g.cs),cy=Math.floor((p.y-g.oy)/g.cs);
for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++){
if(y<0||x<0||y>=15||x>=29||g.grid[y][x]!==1)continue;
FX.circleRectPush(p,{x:g.ox+x*30,y:g.oy+y*30,w:30,h:30});
}
for(const q of g.pel)if(!q.got&&Math.hypot(p.x-q.x,p.y-q.y)<11){q.got=true;g.s[i]++;if(g.s[i]%4===0)FX.tone(900,.03,"square",.02);}
});
g.pel=g.pel.filter(q=>!q.got);
const h=g.gh;h.cd=Math.max(0,h.cd-dt);
const tx=g.ox+h.tx*30+15,ty=g.oy+h.ty*30+15,d=Math.hypot(tx-h.x,ty-h.y);
if(d<3){
h.cx=h.tx;h.cy=h.ty;
const opts=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>g.grid[h.cy+dy]&&g.grid[h.cy+dy][h.cx+dx]===0);
const fwd=opts.filter(([dx,dy])=>!(h.cx+dx===h.px&&h.cy+dy===h.py));
const pick=(fwd.length?fwd:opts)[ri(0,(fwd.length?fwd:opts).length-1)];
h.px=h.cx;h.py=h.cy;h.tx=h.cx+pick[0];h.ty=h.cy+pick[1];
}else{h.x+=(tx-h.x)/d*105*dt;h.y+=(ty-h.y)/d*105*dt;}
g.pl.forEach((p,i)=>{
if(h.cd<=0&&p.stun<=0&&Math.hypot(p.x-h.x,p.y-h.y)<17){p.stun=.9;h.cd=1.2;g.s[i]=Math.max(0,g.s[i]-3);g.burst(p.x,p.y,RED,14,300);playHitSound();}
});
if(g.time<=0||g.pel.length===0)g.byScore(g.s);
},
draw(g,ctx){
ctx.fillStyle="#0a0e22";ctx.fillRect(0,0,W,H);
for(let y=0;y<15;y++)for(let x=0;x<29;x++){
if(g.grid[y][x]===1){ctx.fillStyle="#2a3a9a";ctx.fillRect(g.ox+x*30,g.oy+y*30,30,30);ctx.fillStyle="#4a5ad8";ctx.fillRect(g.ox+x*30+3,g.oy+y*30+3,24,24);ctx.fillStyle="#0a0e22";ctx.fillRect(g.ox+x*30+7,g.oy+y*30+7,16,16);}
}
ctx.fillStyle="#ffd9a0";for(const q of g.pel)ctx.fillRect(q.x-2,q.y-2,4,4);
const h=g.gh;
ctx.fillStyle=h.cd>0?"#8a8aff":"#ff5a5a";ctx.beginPath();ctx.arc(h.x,h.y-2,12,Math.PI,0);ctx.lineTo(h.x+12,h.y+11);for(let k=0;k<4;k++)ctx.lineTo(h.x+12-(k+.5)*6,h.y+(k%2?11:6));ctx.lineTo(h.x-12,h.y+11);ctx.closePath();ctx.fill();
ctx.fillStyle="#fff";ctx.fillRect(h.x-7,h.y-6,5,6);ctx.fillRect(h.x+2,h.y-6,5,6);ctx.fillStyle="#11152b";ctx.fillRect(h.x-5,h.y-4,3,3);ctx.fillRect(h.x+4,h.y-4,3,3);
g.pl.forEach((p,i)=>{
ctx.globalAlpha=p.stun>0&&Math.floor(p.stun*14)%2?.4:1;
ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(p.x,p.y,10,0.3,Math.PI*2-.3);ctx.lineTo(p.x,p.y);ctx.closePath();ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;
});
ctx.fillStyle="#080b18";ctx.fillRect(0,0,W,30);
g.text("P1 "+g.s[0],20,22,18,C1);g.text("P2 "+g.s[1],W-20,22,18,C2,"right");g.text(String(Math.max(0,Math.ceil(g.time))),W/2,24,22,g.time<8?RED:GOLD,"center");
}
});

/* ---------- ROAD DASH ---------- */
micro({id:"roadGame",title:"Road Dash",desc:"Cross the highway before your rival",cat:"reflex",key:"road",win:3,
controls:"P1: W/A/S/D hop　 P2: ARROWS hop — tap to move one square. Get hit and you restart.",
round(g){
const r=seeded(ri(1,1e6));g.rt=0;g.lanes=[];
for(let k=0;k<10;k++){const w=50+Math.floor(r()*50),gap=w+110+r()*140;g.lanes.push({dir:r()<.5?-1:1,sp:50+r()*90,w,gap,off:r()*400,c:["#ff4a4a","#ffb03a","#4aa8ff","#c04aff","#4aff9a"][k%5]});}
g.p=[0,1].map(()=>({col:7,row:11,stun:0}));
},
update(g,dt){
g.rt+=dt;
g.p.forEach((p,i)=>{
p.stun=Math.max(0,p.stun-dt);
if(p.stun>0)return;
const I=g.I[i];
if(I.pl)p.col=Math.max(0,p.col-1);
if(I.pr)p.col=Math.min(14,p.col+1);
if(I.pu){p.row=Math.max(0,p.row-1);FX.tone(500,.04,"square",.03);}
if(I.pd)p.row=Math.min(11,p.row+1);
if(p.row>=1&&p.row<=10){
const L=g.lanes[p.row-1],n=Math.ceil((450+L.w*2)/L.gap)+1,P=L.gap*n,px=p.col*30+15;
for(let k=0;k<n;k++){
const x=(((L.off+k*L.gap+L.dir*L.sp*g.rt)%P)+P)%P-L.w;
if(px+9>x&&px-9<x+L.w){p.row=11;p.col=7;p.stun=.6;g.burst(i*450+px,p.row*40,col(i),12,260);playHitSound();break;}
}
}
});
const w=g.p.map(p=>p.row===0);
if(w[0]&&w[1])g.next("PHOTO FINISH");else if(w[0])g.point(0);else if(w[1])g.point(1);
},
draw(g,ctx){
for(let i=0;i<2;i++){
const off=i*450;
ctx.save();ctx.beginPath();ctx.rect(off,0,450,H);ctx.clip();
ctx.fillStyle="#2a6a3a";ctx.fillRect(off,0,450,480);
ctx.fillStyle="#2f7a42";ctx.fillRect(off,0,450,40);ctx.fillRect(off,440,450,40);
for(let k=0;k<10;k++){
const L=g.lanes[k],y=40+k*40;
ctx.fillStyle="#2a2f45";ctx.fillRect(off,y,450,40);
ctx.fillStyle="rgba(255,255,255,.35)";for(let x=0;x<450;x+=40)ctx.fillRect(off+x,y+38,20,2);
const n=Math.ceil((450+L.w*2)/L.gap)+1,P=L.gap*n;
for(let c=0;c<n;c++){
const x=(((L.off+c*L.gap+L.dir*L.sp*g.rt)%P)+P)%P-L.w;
ctx.fillStyle=L.c;ctx.fillRect(off+x,y+8,L.w,24);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(off+x,y+8,L.w,24);
ctx.fillStyle="#cfe8ff";const wx=L.dir>0?x+L.w-18:x+4;ctx.fillRect(off+wx,y+11,14,18);
ctx.fillStyle=GOLD;ctx.fillRect(off+(L.dir>0?x+L.w-3:x),y+11,3,5);ctx.fillRect(off+(L.dir>0?x+L.w-3:x),y+24,3,5);
}
}
const p=g.p[i];
ctx.globalAlpha=p.stun>0&&Math.floor(p.stun*14)%2?.4:1;
g.blob({x:off+p.col*30+15,y:p.row*40+22,r:12},col(i),off+p.col*30+15,p.row*40-30,false);ctx.globalAlpha=1;
ctx.fillStyle="#fff";ctx.fillRect(off,0,450,4);
ctx.restore();
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* ---------- PIN STRIKE ---------- */
function pinSpots(cx){
const out=[];
for(let r=0;r<4;r++){const n=4-r;for(let k=0;k<n;k++)out.push({x:cx+(k-(n-1)/2)*38,y:100+r*34});}
return out;
}
micro({id:"bowlGame",title:"Pin Strike",desc:"Time your aim, knock down the pins",cat:"sports",key:"bowl",win:1,hud:false,
controls:"P1: SPACE rolls　 P2: ENTER rolls — the aim swings, press to lock it. Five rolls each.",
init(g){
g.st=[0,1].map(i=>({cx:i?675:225,n:0,tot:0,phase:"aim",t:0,pins:pinSpots(i?675:225),knock:[],res:"",ang:0,fall:{}}));
g.fin=0;
},
update(g,dt){
g.st.forEach((s,i)=>{
if(s.phase==="done")return;
if(s.phase==="aim"){
s.ang=Math.sin(g.t*(1.8+s.n*.35)+i)*.32;
if(g.I[i].pa){
s.phase="roll";s.t=0;s.a=s.ang;
const dx=Math.sin(s.a),dy=-Math.cos(s.a);
const k=new Set(),fall={};
s.pins.forEach((p,j)=>{
const vx=p.x-s.cx,vy=p.y-440,proj=vx*dx+vy*dy,perp=Math.abs(vx*dy-vy*dx);
if(proj>0&&perp<20){k.add(j);fall[j]=(440-p.y)/380;}
});
let grew=true;
while(grew){grew=false;s.pins.forEach((p,j)=>{if(k.has(j))return;s.pins.forEach((q,m)=>{if(k.has(m)&&Math.hypot(p.x-q.x,p.y-q.y)<44&&Math.random()<.62&&!k.has(j)){k.add(j);fall[j]=fall[m]+.12;grew=true;}});});}
s.knock=[...k];s.fall=fall;FX.tone(180,.3,"sawtooth",.04,60);
}
}else{
s.t+=dt;
if(s.t>1.0&&!s.counted){s.counted=true;s.tot+=s.knock.length;s.res=s.knock.length===10?"STRIKE!":s.knock.length+" PINS";if(s.knock.length)FX.playScore();FX.tone(300,.08,"square",.04);}
if(s.t>2.1){s.n++;s.counted=false;s.knock=[];s.pins=pinSpots(s.cx);s.phase=s.n>=5?"done":"aim";s.res="";}
}
});
if(g.st.every(s=>s.phase==="done")){g.fin+=dt;if(g.fin>1)g.byScore(g.st.map(s=>s.tot));}
},
draw(g,ctx){
ctx.fillStyle="#2a1a2a";ctx.fillRect(0,0,W,H);
g.st.forEach((s,i)=>{
const cx=s.cx;
ctx.fillStyle="#c8964a";ctx.fillRect(cx-120,60,240,420);
ctx.fillStyle="#a8763a";for(let k=0;k<8;k++)ctx.fillRect(cx-120+k*30,60,2,420);
ctx.fillStyle="#1a1a1a";ctx.fillRect(cx-140,60,20,420);ctx.fillRect(cx+120,60,20,420);
ctx.fillStyle="#3a2a1a";ctx.fillRect(cx-120,60,240,30);
s.pins.forEach((p,j)=>{
const ki=s.knock.indexOf(j);
const down=ki>=0&&s.phase!=="aim"&&s.t>(s.fall[j]||0)*.9;
ctx.save();ctx.translate(p.x,p.y);
if(down){ctx.rotate((j%2?1:-1)*1.3);ctx.globalAlpha=.55;}
ctx.fillStyle="#fff";ctx.beginPath();ctx.ellipse(0,0,8,14,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#e8403a";ctx.fillRect(-7,-4,14,4);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,8,14,0,0,Math.PI*2);ctx.stroke();
ctx.restore();
});
if(s.phase==="aim"){
ctx.strokeStyle=col(i);ctx.lineWidth=3;ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(cx,440);ctx.lineTo(cx+Math.sin(s.ang)*380,440-Math.cos(s.ang)*380);ctx.stroke();ctx.setLineDash([]);
ctx.fillStyle="#222";ctx.beginPath();ctx.arc(cx,440,13,0,Math.PI*2);ctx.fill();ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(cx-4,436,4,0,Math.PI*2);ctx.fill();
}else if(s.phase==="roll"&&s.t<1){
const t=Math.min(1,s.t/.9);
ctx.fillStyle="#222";ctx.beginPath();ctx.arc(cx+Math.sin(s.a)*380*t,440-Math.cos(s.a)*380*t,13*(1-t*.3),0,Math.PI*2);ctx.fill();ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(cx+Math.sin(s.a)*380*t-4,440-Math.cos(s.a)*380*t-4,4,0,Math.PI*2);ctx.fill();
}
g.text("P"+(i+1)+"  "+s.tot,cx,36,22,col(i),"center");
g.text("ROLL "+Math.min(5,s.n+(s.phase==="done"?0:1))+"/5",cx,56,13,"#fff","center");
if(s.res)g.text(s.res,cx,330,26,GOLD,"center");
});
}
});

/* ---------- FREE THROW ---------- */
micro({id:"hoopGame",title:"Free Throw",desc:"Stop the meter in the green. Eight shots each.",cat:"sports",key:"hoop",win:1,hud:false,
controls:"P1: SPACE shoot　 P2: ENTER shoot — release timing: stop the marker inside the green zone",
init(g){g.st=[0,1].map(()=>({n:0,tot:0,busy:0,res:"",made:false,swish:false,shot:null}));g.fin=0;},
update(g,dt){
g.st.forEach((s,i)=>{
if(s.busy>0){
s.busy-=dt;
if(s.busy<=0&&s.n>=8)s.done=true;
return;
}
if(s.n>=8)return;
s.m=(Math.sin(g.t*(3.2+s.n*.22)+i*1.7)+1)/2;
if(g.I[i].pa){
const tol=.09-s.n*.005,e=Math.abs(s.m-.65);
s.made=e<tol;s.swish=e<.03;
s.res=s.swish?"SWISH! +3":s.made?"BASKET +2":(s.m<.65?"SHORT":"LONG");
if(s.made)s.tot+=s.swish?3:2;
s.n++;s.busy=1.3;s.t0=g.t;
FX.tone(s.made?900:200,.15,"triangle",.05,s.made?200:-60);
if(s.made)g.burst(i*450+345,230,GOLD,12,200);
}
});
if(g.st.every(s=>s.n>=8&&s.busy<=0)){g.fin+=dt;if(g.fin>.8)g.byScore(g.st.map(s=>s.tot));}
},
draw(g,ctx){
for(let i=0;i<2;i++){
const s=g.st[i],off=i*450;
ctx.fillStyle=i?"#2a1a3a":"#14243a";ctx.fillRect(off,0,450,H);
ctx.fillStyle="#8a5a2a";ctx.fillRect(off,420,450,80);ctx.fillStyle="#a8743a";ctx.fillRect(off,420,450,6);
ctx.fillStyle="#fff";ctx.fillRect(off+330,150,10,100);ctx.fillStyle="#cfd6ff";ctx.fillRect(off+330,140,10,6);
ctx.strokeStyle="#e8403a";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(off+300,235);ctx.lineTo(off+330,235);ctx.stroke();
ctx.strokeStyle="rgba(255,255,255,.7)";ctx.lineWidth=1.5;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(off+302+k*7,236);ctx.lineTo(off+306+k*4,262);ctx.stroke();}
ctx.save();ctx.translate(off+110,420-70);FX.drawFighter(ctx,24,70,col(i),1,false,false);ctx.restore();
let bx=off+150,by=370;
if(s.busy>0){
const t=clamp((g.t-s.t0)/.7,0,1);
const tx=s.made?off+318:off+(s.m<.65?290:345);
bx=off+150+(tx-off-150)*t;by=370+(235-370)*t-Math.sin(t*Math.PI)*(90+(s.made?0:20));
if(!s.made&&t>=1){bx+=(g.t-s.t0-.7)*80;by+=Math.abs(Math.sin((g.t-s.t0-.7)*8))*-30+(g.t-s.t0-.7)*120;}
if(s.made&&t>=1)by=235+(g.t-s.t0-.7)*260;
}
ctx.fillStyle="#e8803a";ctx.beginPath();ctx.arc(bx,by,11,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.moveTo(bx-11,by);ctx.lineTo(bx+11,by);ctx.stroke();
ctx.fillStyle="#080b18";ctx.fillRect(off+30,100,34,260);
const tol=.09-Math.min(7,s.n)*.005;
ctx.fillStyle="#1d2550";ctx.fillRect(off+32,102,30,256);
ctx.fillStyle=GREEN;ctx.fillRect(off+32,102+256*(1-(.65+tol)),30,256*tol*2);
ctx.fillStyle=GOLD;ctx.fillRect(off+32,102+256*(1-(.65+.03)),30,256*.06);
const mm=s.n<8?(s.m||0):0;
ctx.fillStyle="#fff";ctx.fillRect(off+26,102+256*(1-mm)-3,42,6);
g.text("P"+(i+1)+"  "+s.tot,off+225,36,22,col(i),"center");
g.text("SHOT "+Math.min(8,s.n+1)+"/8",off+225,60,14,"#fff","center");
if(s.busy>0)g.text(s.res,off+225,140,26,s.made?GOLD:RED,"center");
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* ---------- SPRINT ---------- */
micro({id:"sprintGame",title:"Sprint",desc:"Alternate your keys to run 100m",cat:"reflex",key:"sprint",win:3,
controls:"P1: alternate A and D　 P2: alternate ← and → — pressing the same key twice does nothing",
round(g){g.d=[0,0];g.last=["",""];g.flash=[0,0];},
update(g,dt){
for(let i=0;i<2;i++){
g.flash[i]=Math.max(0,g.flash[i]-dt);
const I=g.I[i];
for(const k of["l","r"]){
if(I["p"+k]){
if(g.last[i]!==k){g.last[i]=k;g.d[i]+=1.7;if(Math.floor(g.d[i])%2===0)FX.tone(200,.02,"square",.015);}
else g.flash[i]=.25;
}
}
}
if(g.d[0]>=100&&g.d[1]>=100)g.next("PHOTO FINISH");
else if(g.d[0]>=100)g.point(0);else if(g.d[1]>=100)g.point(1);
},
draw(g,ctx){
for(let i=0;i<2;i++){
const top=i*250;
ctx.fillStyle=i?"#4a2a3a":"#1f3a5a";ctx.fillRect(0,top,W,250);
ctx.fillStyle="#b0503a";ctx.fillRect(0,top+150,W,80);
ctx.fillStyle="rgba(255,255,255,.5)";ctx.fillRect(0,top+150,W,3);ctx.fillRect(0,top+228,W,3);
const d=g.d[i];
for(let m=Math.floor(d/10)*10-10;m<=d+80;m+=10){
const x=200+(m-d)*18;
if(x<-30||x>W+30)continue;
ctx.fillStyle="rgba(255,255,255,.6)";ctx.fillRect(x,top+150,3,80);
g.text(m+"m",x,top+142,12,"#fff","center");
if(m===100){ctx.fillStyle="#fff";for(let k=0;k<8;k++){ctx.fillStyle=k%2?"#111":"#fff";ctx.fillRect(x,top+150+k*10,10,10);}}
}
ctx.save();ctx.translate(180,top+110);FX.drawFighter(ctx,28,44,col(i),1,g.d[i]>0&&g.last[i]!=="",false);ctx.restore();
g.text("P"+(i+1),24,top+36,22,col(i));
g.text(Math.min(100,d).toFixed(1)+" m",W-24,top+36,22,"#fff","right");
if(g.flash[i]>0)g.text("ALTERNATE!",450,top+90,18,RED,"center");
ctx.fillStyle="#080b18";ctx.fillRect(250,top+50,400,10);ctx.fillStyle=col(i);ctx.fillRect(250,top+50,400*Math.min(1,d/100),10);
}
ctx.fillStyle="#080b18";ctx.fillRect(0,248,W,4);
}
});

/* ---------- JUMP ROPE ---------- */
micro({id:"ropeGame",title:"Jump Rope",desc:"Jump as the rope hits the ground",cat:"reflex",key:"rope",win:3,
controls:"P1: SPACE jump　 P2: ENTER jump — the rope speeds up. Get clipped and you lose the round.",
round(g){g.ph=0;g.rt=0;g.pl=[{h:0,vy:0},{h:0,vy:0}];g.prevPh=0;},
update(g,dt){
g.rt+=dt;
const T=Math.max(.62,1.45-g.rt*.03);
g.prevPh=g.ph;g.ph+=dt/T;
const crossed=Math.floor(g.ph+.5)>Math.floor(g.prevPh+.5);
const hit=[false,false];
g.pl.forEach((p,i)=>{
if(g.I[i].pa&&p.h<=0){p.vy=560;FX.tone(400,.08,"square",.03,200);}
p.vy-=1900*dt;p.h=Math.max(0,p.h+p.vy*dt);if(p.h===0)p.vy=0;
if(crossed&&p.h<14)hit[i]=true;
});
if(crossed)FX.tone(160,.05,"square",.03);
if(hit[0]&&hit[1])g.next("BOTH TRIPPED");
else if(hit[0]){g.burst(225,400,C1,16,260);g.point(1);}
else if(hit[1]){g.burst(675,400,C2,16,260);g.point(0);}
},
draw(g,ctx){
for(let i=0;i<2;i++){
const cx=i?675:225,off=i*450;
ctx.fillStyle=i?"#2a1a3a":"#14243a";ctx.fillRect(off,0,450,H);
ctx.fillStyle="#5a8a3a";ctx.fillRect(off,420,450,80);
const p=g.pl[i];
ctx.save();ctx.translate(cx-17,420-70-p.h);FX.drawFighter(ctx,34,70,col(i),1,false,false);ctx.restore();
const c=Math.cos(g.ph*Math.PI*2);
ctx.strokeStyle="#ffd24a";ctx.lineWidth=5;ctx.beginPath();
for(let u=-1;u<=1.001;u+=.1){const x=cx+u*110,y=340-c*80*(1-u*u);if(u<-.99)ctx.moveTo(x,y);else ctx.lineTo(x,Math.min(420,y));}
ctx.stroke();
ctx.fillStyle="#fff";ctx.fillRect(cx-114,334,8,12);ctx.fillRect(cx+106,334,8,12);
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* ---------- FENCING ---------- */
micro({id:"fencingGame",title:"Fencing",desc:"Lunge, parry, strike first",cat:"action",key:"fencing",win:5,
controls:"P1: A/D move, SPACE lunge, S parry　 P2: ←/→ move, ENTER lunge, ↓ parry — a parried lunge stuns the attacker",
round(g){g.f=[{x:300,lunge:0,cd:0,parry:0,pcd:0,stun:0,dir:1},{x:600,lunge:0,cd:0,parry:0,pcd:0,stun:0,dir:-1}];g.spark=0;},
update(g,dt){
g.spark=Math.max(0,g.spark-dt);
const hit=[false,false];
g.f.forEach((p,i)=>{
const I=g.I[i],o=g.f[1-i];
p.cd=Math.max(0,p.cd-dt);p.pcd=Math.max(0,p.pcd-dt);p.parry=Math.max(0,p.parry-dt);p.stun=Math.max(0,p.stun-dt);
if(p.lunge>0){p.lunge-=dt;p.x+=p.dir*540*dt;if(p.lunge<=0)p.cd=.55;}
else if(p.stun<=0&&p.parry<=0){
p.x+=((I.r?1:0)-(I.l?1:0))*165*dt;
if(I.pa&&p.cd<=0){p.lunge=.2;FX.tone(500,.1,"sawtooth",.04,-200);}
if(I.pd&&p.pcd<=0){p.parry=.28;p.pcd=.6;FX.tone(900,.06,"square",.03);}
}
p.x=clamp(p.x,80,820);
});
const [a,b]=g.f;
if(a.x>b.x-46){const m=(a.x+b.x)/2;a.x=m-23;b.x=m+23;}
g.f.forEach((p,i)=>{
const o=g.f[1-i];
if(p.lunge>0&&Math.abs(o.x-p.x)<78){
if(o.parry>0){p.lunge=0;p.stun=.8;p.cd=.5;g.spark=.25;g.burst((p.x+o.x)/2,330,"#fff",16,300);FX.tone(1200,.1,"square",.05);}
else hit[i]=true;
}
});
if(hit[0]&&hit[1])g.next("DOUBLE HIT");
else if(hit[0]){g.burst(g.f[1].x,330,C2,20,320);playHitSound();g.point(0);}
else if(hit[1]){g.burst(g.f[0].x,330,C1,20,320);playHitSound();g.point(1);}
},
draw(g,ctx){
const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#2a1a3a");gr.addColorStop(1,"#5a2a3a");ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
ctx.fillStyle="rgba(255,255,255,.07)";for(let k=0;k<10;k++)ctx.fillRect(k*95+10,40,50,90);
ctx.fillStyle="#d8d8e8";ctx.fillRect(60,390,780,14);ctx.fillStyle="#a8a8c0";ctx.fillRect(60,404,780,6);
ctx.fillStyle="#3a2a2a";ctx.fillRect(0,410,W,90);
g.f.forEach((p,i)=>{
ctx.save();ctx.translate(p.x,390);ctx.scale(p.dir,1);
if(p.stun>0&&Math.floor(p.stun*14)%2)ctx.globalAlpha=.5;
ctx.save();ctx.translate(-20,-95);ctx.scale(1.7,1.7);FX.drawFighter(ctx,22,34,col(i),1,false,p.stun>0);ctx.restore();
ctx.globalAlpha=1;
const ext=p.lunge>0?95:p.parry>0?40:58;
ctx.strokeStyle="#e8e8ff";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(14,-58);ctx.lineTo(14+ext,p.parry>0?-78:-62);ctx.stroke();
ctx.fillStyle=GOLD;ctx.fillRect(10,-64,6,12);
if(p.parry>0){ctx.strokeStyle=GOLD;ctx.lineWidth=3;ctx.beginPath();ctx.arc(30,-62,26,-1.2,1.2);ctx.stroke();}
ctx.restore();
});
if(g.spark>0)g.text("PARRY!",W/2,200,30,GOLD,"center");
}
});

/* ---------- HUNGRY HIPPOS ---------- */
micro({id:"hippoGame",title:"Hungry Hippos",desc:"Chomp more marbles than your rival",cat:"arcade",key:"hippo",win:1,hud:false,
controls:"P1: A / D slide, SPACE chomp　 P2: ← / → slide, ENTER chomp — 40 seconds, 20 marbles",
init(g){
g.time=40;g.s=[0,0];
g.balls=Array.from({length:20},()=>{const a=rnd(0,6.28),v=rnd(110,190);return{x:rnd(300,600),y:rnd(120,300),vx:Math.cos(a)*v,vy:Math.sin(a)*v,c:["#ff6a6a","#6aff8a","#6ab0ff","#ffd24a","#c46aff"][ri(0,4)]};});
g.h=[{x:220,bite:0,cd:0},{x:680,bite:0,cd:0}];
},
update(g,dt){
g.time-=dt;
g.h.forEach((h,i)=>{
const I=g.I[i];
h.x=clamp(h.x+((I.r?1:0)-(I.l?1:0))*330*dt,i?470:40,i?860:430);
h.cd=Math.max(0,h.cd-dt);h.bite=Math.max(0,h.bite-dt);
if(I.pa&&h.cd<=0){h.bite=.16;h.cd=.4;FX.tone(250,.08,"sawtooth",.04,-100);}
if(h.bite>0)for(const b of g.balls){if(!b.got&&Math.hypot(b.x-h.x,b.y-400)<62){b.got=true;g.s[i]++;g.burst(b.x,b.y,b.c,8,180);FX.tone(800,.06,"square",.04,300);}}
});
g.balls=g.balls.filter(b=>!b.got);
for(const b of g.balls){
b.x+=b.vx*dt;b.y+=b.vy*dt;
if(b.x<14||b.x>W-14)b.vx*=-1;
if(b.y<50||b.y>H-60)b.vy*=-1;
b.x=clamp(b.x,14,W-14);b.y=clamp(b.y,50,H-60);
}
if(g.time<=0||!g.balls.length)g.byScore(g.s);
},
draw(g,ctx){
ctx.fillStyle="#2a5a3a";ctx.fillRect(0,0,W,H);
ctx.fillStyle="#3a7a4a";ctx.fillRect(30,44,W-60,H-100);ctx.strokeStyle="#6a4a2a";ctx.lineWidth=10;ctx.strokeRect(30,44,W-60,H-100);
for(const b of g.balls){ctx.fillStyle=b.c;ctx.beginPath();ctx.arc(b.x,b.y,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle="rgba(255,255,255,.5)";ctx.fillRect(b.x-5,b.y-6,4,4);}
g.h.forEach((h,i)=>{
const open=h.bite>0;
ctx.fillStyle=col(i);ctx.fillRect(h.x-44,430,88,50);ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(h.x-44,430,88,50);
ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(h.x,430,44,Math.PI,0);ctx.fill();ctx.stroke();
if(open){ctx.fillStyle="#3a0a14";ctx.beginPath();ctx.ellipse(h.x,418,34,28,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";for(let k=-2;k<=2;k++)ctx.fillRect(h.x+k*12-3,392,6,10);}
else{ctx.fillStyle="#080b18";ctx.fillRect(h.x-24,420,48,4);}
ctx.fillStyle="#fff";ctx.fillRect(h.x-26,396,12,12);ctx.fillRect(h.x+14,396,12,12);ctx.fillStyle="#11152b";ctx.fillRect(h.x-22,400,5,6);ctx.fillRect(h.x+18,400,5,6);
});
ctx.fillStyle="#080b18";ctx.fillRect(0,0,W,38);
g.text("P1 "+g.s[0],20,28,20,C1);g.text("P2 "+g.s[1],W-20,28,20,C2,"right");g.text(String(Math.max(0,Math.ceil(g.time))),W/2,30,24,g.time<8?RED:GOLD,"center");
}
});
})();
