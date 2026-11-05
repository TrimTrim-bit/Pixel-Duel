/* =====================================================
   GAME PACK G — 15 games
   Laser Grid, Joust, Cover Fire, Gold Claw, Arrow Rhythm,
   Disc Flick, Sheep Herd, Orbit Pong, Blind Timer, Number Rush,
   Penguin Dash, Speedway, Glass Bridge, Tightrope, Fly Catch
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const mkp=(x,y,color,r=16)=>({x,y,r,color,vx:0,vy:0,fx:1,fy:0});
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));

/* ---------- LASER GRID ---------- */
const LY=[110,190,270,350,430];
micro({id:"laserGame",title:"Laser Grid",desc:"Hop between rows when the lasers fire",cat:"reflex",key:"laser",win:3,
controls:"P1: W / S change row　 P2: ↑ / ↓ — lasers flash a warning, then fire. Same pattern on both sides.",
round(g){g.rt=0;g.nt=1.2;g.rng=seeded(ri(1,1e6));g.ls=[];g.r=[2,2];},
update(g,dt){
g.rt+=dt;
if(g.rt>=g.nt){
const n=1+Math.min(2,Math.floor(g.rt/12)),rows=[];
while(rows.length<n){const r=Math.floor(g.rng()*5);if(!rows.includes(r))rows.push(r);}
g.ls.push({rows,t:0});g.nt+=Math.max(.85,1.7-g.rt*.02);FX.tone(300,.1,"triangle",.03);
}
for(const l of g.ls)l.t+=dt;
g.ls=g.ls.filter(l=>l.t<1.3);
const hit=[false,false];
g.r.forEach((_,i)=>{
const I=g.I[i];
if(I.pu)g.r[i]=Math.max(0,g.r[i]-1);if(I.pd)g.r[i]=Math.min(4,g.r[i]+1);
for(const l of g.ls)if(l.t>=.9&&l.t<1.25&&l.rows.includes(g.r[i]))hit[i]=true;
});
if(hit[0]&&hit[1])g.next("BOTH HIT");
else if(hit[0]){g.burst(80,LY[g.r[0]],C1,20,300);FX.playBoom();g.point(1);}
else if(hit[1]){g.burst(530,LY[g.r[1]],C2,20,300);FX.playBoom();g.point(0);}
else if(g.rt>40)g.next("BOTH SURVIVED");
},
draw(g,ctx){
for(let i=0;i<2;i++){
const off=i*450;
ctx.fillStyle=i?"#1a0d2a":"#0b1030";ctx.fillRect(off,0,450,H);
LY.forEach((y,k)=>{
ctx.fillStyle="rgba(255,255,255,.05)";ctx.fillRect(off,y-30,450,60);
ctx.fillStyle="#3a3f7a";ctx.fillRect(off,y-4,14,8);ctx.fillRect(off+436,y-4,14,8);
for(const l of g.ls)if(l.rows.includes(k)){
if(l.t<.9){if(Math.floor(l.t*10)%2){ctx.fillStyle="rgba(255,90,90,.35)";ctx.fillRect(off+14,y-3,422,6);}}
else if(l.t<1.25){ctx.fillStyle="rgba(255,60,60,.35)";ctx.fillRect(off+14,y-18,422,36);ctx.fillStyle="#ff4a4a";ctx.fillRect(off+14,y-8,422,16);ctx.fillStyle="#fff";ctx.fillRect(off+14,y-3,422,6);}
}
});
g.blob({x:off+80,y:LY[g.r[i]],r:14},col(i),off+300,LY[g.r[i]],false);
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
g.text(g.rt.toFixed(1)+"s",W/2,490,14,"#9fc0ff","center");
}
});

/* ---------- JOUST ---------- */
const JP=[{x:80,y:340,w:220},{x:600,y:340,w:220},{x:340,y:220,w:220}];
micro({id:"joustGame",title:"Joust",desc:"Flap high and land on your rival's head",cat:"action",key:"joust",win:3,
controls:"P1: A/D move, SPACE flap　 P2: ←/→ move, ENTER flap — whoever is HIGHER on impact wins. Don't touch the lava.",
round(g){g.pl=[{x:150,y:300,vx:0,vy:0,r:14,f:1},{x:750,y:300,vx:0,vy:0,r:14,f:-1}];},
update(g,dt){
const lose=[false,false];
g.pl.forEach((p,i)=>{
const I=g.I[i];
const ax=((I.r?1:0)-(I.l?1:0));
p.vx=clamp(p.vx+ax*650*dt,-250,250);if(!ax)p.vx*=.97;
if(ax)p.f=ax;
if(I.pa){p.vy=-320;FX.tone(300,.05,"square",.03,100);}
const pb=p.y+p.r;
p.vy+=820*dt;p.x=(p.x+p.vx*dt+W)%W;p.y+=p.vy*dt;
if(p.vy>0)for(const pl of JP){if(pb<=pl.y+3&&p.y+p.r>=pl.y&&p.x>pl.x-8&&p.x<pl.x+pl.w+8){p.y=pl.y-p.r;p.vy=0;}}
if(p.y<p.r){p.y=p.r;p.vy=Math.abs(p.vy)*.3;}
if(p.y>470)lose[i]=true;
});
const [a,b]=g.pl,d=dist(a,b);
if(d<30&&d>0){
const dy=a.y-b.y;
if(Math.abs(dy)>9){const w=dy<0?0:1;g.burst(g.pl[1-w].x,g.pl[1-w].y,col(1-w),18,320);playHitSound();g.point(w);return;}
const nx=(b.x-a.x)/d;a.vx-=nx*200;b.vx+=nx*200;a.x-=nx*3;b.x+=nx*3;FX.tone(240,.05,"square",.04);
}
if(lose[0]&&lose[1])g.next("BOTH BURNED");else if(lose[0])g.point(1,"LAVA!");else if(lose[1])g.point(0,"LAVA!");
},
draw(g,ctx){
const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#2a1a4a");gr.addColorStop(1,"#6a2a3a");ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
for(const pl of JP){ctx.fillStyle="#6a5a8a";ctx.fillRect(pl.x,pl.y,pl.w,16);ctx.fillStyle="#8a7aaa";ctx.fillRect(pl.x,pl.y,pl.w,5);ctx.strokeStyle="#241a3a";ctx.lineWidth=2;ctx.strokeRect(pl.x,pl.y,pl.w,16);}
ctx.fillStyle="#ff6a2a";ctx.fillRect(0,480,W,20);ctx.fillStyle="#ffb03a";for(let x=0;x<W;x+=30)ctx.fillRect(x+((g.t*40)%30),480+Math.sin(x+g.t*4)*3,18,5);
g.pl.forEach((p,i)=>{
const fl=Math.sin(g.t*22)*5*(p.vy<0?1:.2);
ctx.fillStyle="rgba(255,255,255,.85)";ctx.beginPath();ctx.ellipse(p.x-p.f*10,p.y+2,14,6+fl*.5,-.3*p.f,0,Math.PI*2);ctx.fill();
ctx.fillStyle=col(i);ctx.beginPath();ctx.ellipse(p.x,p.y+6,16,11,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle=GOLD;ctx.fillRect(p.x+p.f*14,p.y+4,10,5);ctx.fillStyle="#f3bd83";ctx.fillRect(p.x-5,p.y-16,10,10);ctx.fillStyle=col(i);ctx.fillRect(p.x-6,p.y-19,12,5);
ctx.strokeStyle="#e8e8ff";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x,p.y-8);ctx.lineTo(p.x+p.f*30,p.y-22);ctx.stroke();
});
}
});

/* ---------- COVER FIRE ---------- */
micro({id:"coverGame",title:"Cover Fire",desc:"Peek, shoot, duck. Three hits and you're out.",cat:"action",key:"cover",win:3,
controls:"P1: hold S to duck behind cover, SPACE shoot　 P2: hold ↓ to duck, ENTER shoot — you can only shoot while standing, and reload while ducked.",
round(g){g.p=[{hp:3,ammo:3,cd:0,hid:false,rl:0,hit:0},{hp:3,ammo:3,cd:0,hid:false,rl:0,hit:0}];g.bl=[];},
update(g,dt){
g.p.forEach((p,i)=>{
const I=g.I[i];
p.hid=!!I.d;p.cd=Math.max(0,p.cd-dt);p.hit=Math.max(0,p.hit-dt);
if(p.hid&&p.ammo<3){p.rl+=dt;if(p.rl>.45){p.rl=0;p.ammo++;FX.tone(700,.04,"square",.03);}}else if(!p.hid)p.rl=0;
if(I.pa&&!p.hid&&p.cd<=0&&p.ammo>0){
p.cd=.45;p.ammo--;g.bl.push({x:i?770:130,vx:i?-780:780,o:i});FX.playShoot();g.burst(i?740:160,320,GOLD,4,150);
}
});
for(const b of g.bl){
b.x+=b.vx*dt;
const t=g.p[1-b.o],tx=b.o?130:770;
if(!b.dead&&(b.vx>0?b.x>=tx-12:b.x<=tx+12)){
b.dead=true;
if(!t.hid){t.hp--;t.hit=.4;g.burst(tx,330,RED,16,320);playHitSound();if(t.hp<=0){g.point(b.o);return;}}
else g.burst(tx,300,"#fff",3,100);
}
}
g.bl=g.bl.filter(b=>!b.dead&&b.x>-20&&b.x<W+20);
},
draw(g,ctx){
const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#e8a05a");gr.addColorStop(.6,"#c8703a");gr.addColorStop(1,"#6a3a2a");ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
ctx.fillStyle="#8a4a2a";ctx.fillRect(0,400,W,100);
ctx.fillStyle="#d8c070";ctx.beginPath();ctx.arc(450,140,40,0,Math.PI*2);ctx.fill();
g.p.forEach((p,i)=>{
const x=i?770:130,crate=i?650:210;
ctx.save();ctx.translate(x,400);ctx.scale(i?-1:1,1);
ctx.globalAlpha=p.hit>0&&Math.floor(p.hit*30)%2?.4:1;
if(p.hid){ctx.save();ctx.translate(-20,-60);ctx.scale(1.8,1.1);FX.drawFighter(ctx,22,34,col(i),1,false,false);ctx.restore();}
else{ctx.save();ctx.translate(-20,-125);ctx.scale(1.8,1.8);FX.drawFighter(ctx,22,34,col(i),1,false,p.hit>0);ctx.restore();ctx.fillStyle="#2a1e15";ctx.fillRect(20,-86,34,10);}
ctx.restore();
ctx.fillStyle="#7a4a22";ctx.fillRect(crate,335,70,65);ctx.strokeStyle="#3a2210";ctx.lineWidth=3;ctx.strokeRect(crate,335,70,65);ctx.beginPath();ctx.moveTo(crate,335);ctx.lineTo(crate+70,400);ctx.moveTo(crate+70,335);ctx.lineTo(crate,400);ctx.stroke();
const px=i?W-40:40;
g.text("♥".repeat(Math.max(0,p.hp)),i?W-20:20,60,22,"#ff3366",i?"right":"left");
for(let k=0;k<3;k++){ctx.fillStyle=k<p.ammo?GOLD:"#3a3f6a";ctx.fillRect((i?W-30-k*16:20+k*16),72,10,16);}
});
for(const b of g.bl){ctx.fillStyle="rgba(255,230,109,.5)";ctx.fillRect(b.vx>0?b.x-40:b.x,318,40,4);ctx.fillStyle="#fff";ctx.fillRect(b.x-4,317,8,6);}
}
});

/* ---------- GOLD CLAW ---------- */
const CITEM=[{r:26,v:60,w:2.2,c:"#ffd24a"},{r:14,v:20,w:1.2,c:"#ffe27a"},{r:22,v:8,w:2.6,c:"#8a8a9a"},{r:9,v:50,w:.8,c:"#6aeaff"}];
micro({id:"clawGame",title:"Gold Claw",desc:"Time the swing, grab the loot",cat:"arcade",key:"claw",win:1,hud:false,
controls:"P1: SPACE drops the claw　 P2: ENTER — heavy gold is slow to reel in. 40 seconds, same loot on both sides.",
init(g){
g.time=40;g.s=[0,0];
const r=seeded(ri(1,1e6)),items=[];
let tries=0;
while(items.length<11&&tries++<300){
const t=CITEM[Math.floor(r()*4)],x=60+r()*330,y=190+r()*240;
if(items.every(o=>Math.hypot(o.x-x,o.y-y)>o.r+t.r+14))items.push({x,y,...t});
}
g.items=[0,1].map(()=>items.map(o=>({...o,got:false})));
g.cl=[0,1].map(()=>({st:"swing",L:30,item:null,ang:0}));
},
update(g,dt){
g.time-=dt;
g.cl.forEach((c,i)=>{
const px=i*450+225,py=70;
if(c.st==="swing"){c.ang=Math.sin(g.t*1.6)*1.15;if(g.I[i].pa){c.st="out";FX.tone(300,.1,"sawtooth",.03,-100);}}
else if(c.st==="out"){
c.L+=380*dt;
const tx=px+Math.sin(c.ang)*c.L,ty=py+Math.cos(c.ang)*c.L;
for(const it of g.items[i]){if(it.got)continue;if(Math.hypot(i*450+it.x-tx,it.y-ty)<it.r+6){c.item=it;c.st="back";break;}}
if(c.st==="out"&&(c.L>480||tx<i*450+8||tx>i*450+442||ty>492))c.st="back";
}else{
c.L-=(c.item?300/c.item.w:420)*dt;
if(c.L<=30){c.L=30;if(c.item){g.s[i]+=c.item.v;c.item.got=true;g.burst(px,py+30,c.item.c,10,220);FX.tone(c.item.v>=50?1100:700,.08,"square",.05,300);c.item=null;}c.st="swing";}
}
});
if(g.time<=0)g.byScore(g.s);
},
draw(g,ctx){
for(let i=0;i<2;i++){
const off=i*450,c=g.cl[i],px=off+225,py=70;
ctx.fillStyle="#2a3a6a";ctx.fillRect(off,0,450,70);ctx.fillStyle="#6a4a2a";ctx.fillRect(off,70,450,430);
for(let k=0;k<20;k++){ctx.fillStyle="#5a3a1c";ctx.fillRect(off+(k*89)%440,90+(k*61)%400,22,6);}
for(const it of g.items[i]){
if(it.got)continue;
ctx.fillStyle=it.c;ctx.beginPath();ctx.arc(off+it.x,it.y,it.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle="rgba(255,255,255,.4)";ctx.fillRect(off+it.x-it.r*.5,it.y-it.r*.6,it.r*.5,4);
}
const tx=px+Math.sin(c.ang)*c.L,ty=py+Math.cos(c.ang)*c.L;
ctx.strokeStyle="#ddd";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(tx,ty);ctx.stroke();
ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(tx,ty,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
if(c.item){ctx.fillStyle=c.item.c;ctx.beginPath();ctx.arc(tx,ty+c.item.r,c.item.r,0,Math.PI*2);ctx.fill();ctx.stroke();}
ctx.fillStyle=col(i);ctx.fillRect(px-18,40,36,30);ctx.fillStyle="#080b18";ctx.fillRect(px-6,50,12,6);
g.text("P"+(i+1)+"  $"+g.s[i],off+225,26,20,col(i),"center");
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
g.text(String(Math.max(0,Math.ceil(g.time))),W/2,490,20,g.time<8?RED:GOLD,"center");
}
});

/* ---------- ARROW RHYTHM ---------- */
const AR=["◀","▲","▶","▼"],AC=["#ff6a6a","#6aff8a","#6ab0ff","#ffd24a"];
micro({id:"arrowGame",title:"Arrow Rhythm",desc:"Hit the arrows on the beat",cat:"reflex",key:"arrow",win:1,hud:false,
controls:"P1: A / W / D / S = ◀ ▲ ▶ ▼　 P2: arrow keys — press when an arrow reaches the line",
init(g){
const r=seeded(ri(1,1e6));g.notes=[];let t=2;
for(let k=0;k<34;k++){t+=.42+r()*.34;g.notes.push({t,l:Math.floor(r()*4),h:[false,false],m:[false,false]});}
g.sc=[0,0];g.cb=[0,0];g.fb=["",""];g.fbT=[0,0];g.clk=0;
},
update(g,dt){
g.clk+=dt;
for(let i=0;i<2;i++){
g.fbT[i]-=dt;
const I=g.I[i],pr=[I.pl,I.pu,I.pr,I.pd];
for(let l=0;l<4;l++){
if(!pr[l])continue;
let best=null;
for(const n of g.notes)if(n.l===l&&!n.h[i]&&!n.m[i]&&Math.abs(n.t-g.clk)<.22&&(!best||Math.abs(n.t-g.clk)<Math.abs(best.t-g.clk)))best=n;
if(best){const e=Math.abs(best.t-g.clk),pf=e<.08;best.h[i]=true;g.sc[i]+=pf?2:1;g.cb[i]++;g.fb[i]=pf?"PERFECT!":"GOOD";g.fbT[i]=.5;g.burst(i?675:225,400,AC[l],6,180);FX.tone(440+l*110,.06,"square",.04);}
else{g.cb[i]=0;g.fb[i]="MISS";g.fbT[i]=.4;}
}
for(const n of g.notes)if(!n.h[i]&&!n.m[i]&&g.clk>n.t+.22){n.m[i]=true;g.cb[i]=0;}
}
if(g.clk>g.notes[g.notes.length-1].t+.8)g.byScore(g.sc);
},
draw(g,ctx){
ctx.fillStyle="#0d0a22";ctx.fillRect(0,0,W,H);
for(let i=0;i<2;i++){
const cx=i?675:225;
ctx.fillStyle=i?"#1c1038":"#0f1a3a";ctx.fillRect(cx-130,0,260,H);ctx.strokeStyle=col(i);ctx.lineWidth=2;ctx.strokeRect(cx-130,0,260,H);
for(let l=0;l<4;l++){const x=cx-97+l*64;ctx.fillStyle="rgba(255,255,255,.12)";ctx.fillRect(x-26,394,52,32);g.text(AR[l],x,420,30,"rgba(255,255,255,.55)","center");}
for(const n of g.notes){
if(n.h[i])continue;
const y=410-(n.t-g.clk)*300;if(y<-30||y>H+30)continue;
g.text(AR[n.l],cx-97+n.l*64,y+12,38,n.m[i]?"#555":AC[n.l],"center");
}
g.text("P"+(i+1)+"  "+g.sc[i],cx,34,22,col(i),"center");g.text("COMBO "+g.cb[i],cx,60,14,GOLD,"center");
if(g.fbT[i]>0)g.text(g.fb[i],cx,350,22,g.fb[i]==="MISS"?RED:GREEN,"center");
}
}
});

/* ---------- DISC FLICK ---------- */
micro({id:"flickGame",title:"Disc Flick",desc:"Flick discs, knock off your rival's, own the board",cat:"sports",key:"flick",win:1,hud:false,
controls:"On your turn press your key (P1 SPACE, P2 ENTER) to lock the aim, then again to lock the power. Five discs each. Discs near the center count double.",
init(g){g.d=[];g.n=0;g.ph="aim";g.ang=0;g.pw=0;g.sl=0;g.msg.textContent="P1 FLICKS";},
update(g,dt){
const cur=g.n%2,I=g.I[cur],dir=cur?-1:1;
for(const s of g.d){
if(s.out)continue;
s.x+=s.vx*dt;s.y+=s.vy*dt;s.vx*=.982;s.vy*=.982;
if(Math.hypot(s.vx,s.vy)<6){s.vx=0;s.vy=0;}
if(s.x<110||s.x>790||s.y<50||s.y>470){s.out=true;g.burst(s.x,s.y,col(s.o),8,160);}
}
for(let a=0;a<g.d.length;a++)for(let b=a+1;b<g.d.length;b++){
const p=g.d[a],q=g.d[b];if(p.out||q.out)continue;
const dd=dist(p,q);
if(dd<40&&dd>0){const nx=(q.x-p.x)/dd,ny=(q.y-p.y)/dd,o=(40-dd)/2;p.x-=nx*o;p.y-=ny*o;q.x+=nx*o;q.y+=ny*o;const vn=(q.vx-p.vx)*nx+(q.vy-p.vy)*ny;if(vn<0){p.vx+=vn*nx;p.vy+=vn*ny;q.vx-=vn*nx;q.vy-=vn*ny;FX.tone(220,.05,"square",.04);g.burst((p.x+q.x)/2,(p.y+q.y)/2,"#fff",4,130);}}
}
if(g.ph==="aim"){g.ang=Math.sin(g.t*2.4)*.55;if(I.pa){g.ph="power";g.aA=g.ang;}}
else if(g.ph==="power"){
g.pw=(Math.sin(g.t*3.4)+1)/2;
if(I.pa){const v=260+g.pw*620;g.d.push({x:cur?750:150,y:250,vx:Math.cos(g.aA)*v*dir,vy:Math.sin(g.aA)*v,o:cur,out:false});g.ph="slide";g.sl=0;FX.tone(220,.15,"triangle",.05,-60);}
}else{
g.sl+=dt;
if(g.sl>.6&&g.d.every(s=>s.out||(s.vx===0&&s.vy===0))){
g.n++;
if(g.n>=10){
const sc=[0,0];g.d.forEach(s=>{if(!s.out)sc[s.o]+=Math.hypot(s.x-450,s.y-260)<85?2:1;});
g.byScore(sc);
}else{g.ph="aim";g.msg.textContent=`P${g.n%2+1} FLICKS`;}
}
}
},
draw(g,ctx){
ctx.fillStyle="#1a1230";ctx.fillRect(0,0,W,H);
ctx.fillStyle="#b8864a";ctx.fillRect(110,50,680,420);ctx.fillStyle="#a8763a";for(let x=110;x<790;x+=40)ctx.fillRect(x,50,2,420);
ctx.strokeStyle="#4a2a10";ctx.lineWidth=10;ctx.strokeRect(105,45,690,430);
ctx.strokeStyle="#6a3a1a";ctx.lineWidth=3;ctx.beginPath();ctx.arc(450,260,85,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(450,260,35,0,Math.PI*2);ctx.stroke();
ctx.fillStyle="rgba(100,234,255,.25)";ctx.fillRect(140,50,6,420);ctx.fillStyle="rgba(255,114,200,.25)";ctx.fillRect(754,50,6,420);
for(const s of g.d){
if(s.out)continue;
ctx.fillStyle="rgba(0,0,0,.3)";ctx.beginPath();ctx.arc(s.x+3,s.y+4,20,0,Math.PI*2);ctx.fill();
ctx.fillStyle=col(s.o);ctx.beginPath();ctx.arc(s.x,s.y,20,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
ctx.fillStyle="rgba(255,255,255,.4)";ctx.beginPath();ctx.arc(s.x-6,s.y-6,6,0,Math.PI*2);ctx.fill();
}
const cur=g.n%2,dir=cur?-1:1;
if(g.ph==="aim"||g.ph==="power"){
const a=g.ph==="aim"?g.ang:g.aA,sx=cur?750:150;
ctx.strokeStyle=col(cur);ctx.lineWidth=3;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(sx,250);ctx.lineTo(sx+Math.cos(a)*dir*500,250+Math.sin(a)*500);ctx.stroke();ctx.setLineDash([]);
ctx.fillStyle=col(cur);ctx.globalAlpha=.6;ctx.beginPath();ctx.arc(sx,250,20,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
}
if(g.ph==="power"){ctx.fillStyle="#080b18";ctx.fillRect(250,486,400,10);ctx.fillStyle=g.pw>.85?RED:GOLD;ctx.fillRect(252,487,396*g.pw,8);}
const sc=[0,0];g.d.forEach(s=>{if(!s.out)sc[s.o]++;});
g.text("P1  "+sc[0]+" on board",20,34,20,C1);g.text("P2  "+sc[1]+" on board",W-20,34,20,C2,"right");
g.text(`SHOT ${Math.min(10,g.n+1)}/10`,W/2,34,14,"#fff","center");
}
});

/* ---------- SHEEP HERD ---------- */
const PEN=[{x:18,y:180,w:92,h:140},{x:790,y:180,w:92,h:140}];
micro({id:"sheepGame",title:"Sheep Herd",desc:"Scare the flock into your pen",cat:"action",key:"sheep",win:1,hud:false,
controls:"P1: W/A/S/D　 P2: ARROWS — sheep run away from dogs. Chase them into YOUR pen (P1 left, P2 right).",
init(g){
g.time=45;g.s=[0,0];
g.pl=[mkp(200,150,C1,14),mkp(700,400,C2,14)];
g.sh=Array.from({length:14},()=>({x:rnd(300,600),y:rnd(120,420),vx:rnd(-30,30),vy:rnd(-30,30),pen:-1,ph:rnd(0,6)}));
},
update(g,dt){
g.time-=dt;
g.pl.forEach((p,i)=>g.walk(p,i,250,{x0:p.r,x1:W-p.r,y0:50+p.r,y1:H-p.r}));
for(const s of g.sh){
if(s.pen>=0){s.x+=s.vx*dt*.3;s.y+=s.vy*dt*.3;const pn=PEN[s.pen];s.x=clamp(s.x,pn.x+14,pn.x+pn.w-14);s.y=clamp(s.y,pn.y+14,pn.y+pn.h-14);if(Math.random()<.02){s.vx=rnd(-40,40);s.vy=rnd(-40,40);}continue;}
let fx=0,fy=0;
for(const p of g.pl){const d=dist(s,p);if(d<130&&d>0){fx+=(s.x-p.x)/d*(130-d)*4;fy+=(s.y-p.y)/d*(130-d)*4;}}
s.vx+=(fx+Math.sin(g.t+s.ph)*14)*dt;s.vy+=(fy+Math.cos(g.t*1.1+s.ph)*14)*dt;
s.vx*=.94;s.vy*=.94;
const sp=Math.hypot(s.vx,s.vy);if(sp>170){s.vx*=170/sp;s.vy*=170/sp;}
s.x+=s.vx*dt;s.y+=s.vy*dt;
s.x=clamp(s.x,14,W-14);s.y=clamp(s.y,64,H-14);
PEN.forEach((pn,i)=>{if(s.pen<0&&s.x>pn.x+10&&s.x<pn.x+pn.w-10&&s.y>pn.y+10&&s.y<pn.y+pn.h-10){s.pen=i;g.s[i]++;g.burst(s.x,s.y,col(i),8,160);FX.tone(700,.08,"square",.04,200);}});
}
if(g.time<=0||g.sh.every(s=>s.pen>=0))g.byScore(g.s);
},
draw(g,ctx){
ctx.fillStyle="#3a8a3a";ctx.fillRect(0,0,W,H);for(let x=0;x<W;x+=60){ctx.fillStyle="#3f943f";ctx.fillRect(x,0,30,H);}
PEN.forEach((pn,i)=>{ctx.fillStyle=i?"rgba(255,114,200,.25)":"rgba(100,234,255,.25)";ctx.fillRect(pn.x,pn.y,pn.w,pn.h);ctx.strokeStyle="#7a4a22";ctx.lineWidth=6;ctx.strokeRect(pn.x,pn.y,pn.w,pn.h);ctx.fillStyle="#3a8a3a";ctx.fillRect(i?pn.x-4:pn.x+pn.w-4,pn.y+30,8,pn.h-60);});
for(const s of g.sh){
const bob=Math.sin(g.t*8+s.ph)*1.5;
ctx.fillStyle="rgba(0,0,0,.25)";ctx.beginPath();ctx.ellipse(s.x,s.y+11,12,4,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#f4f4ff";for(const [dx,dy] of[[-7,0],[7,0],[0,-6],[0,5],[0,0]]){ctx.beginPath();ctx.arc(s.x+dx,s.y+dy+bob,9,0,Math.PI*2);ctx.fill();}
ctx.fillStyle="#2a2030";ctx.beginPath();ctx.arc(s.x+(s.vx>=0?9:-9),s.y-1+bob,5,0,Math.PI*2);ctx.fill();
if(s.pen>=0){ctx.strokeStyle=col(s.pen);ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.x,s.y+bob,12,0,Math.PI*2);ctx.stroke();}
}
g.pl.forEach((p,i)=>g.blob(p,col(i),p.x+p.fx*9,p.y+p.fy*9,p.vx||p.vy));
ctx.fillStyle="#080b18";ctx.fillRect(0,0,W,40);
g.text("P1 "+g.s[0],20,28,20,C1);g.text("P2 "+g.s[1],W-20,28,20,C2,"right");g.text(String(Math.max(0,Math.ceil(g.time))),W/2,30,24,g.time<8?RED:GOLD,"center");
}
});

/* ---------- ORBIT PONG ---------- */
const OC={x:450,y:262,R:208};
micro({id:"orbitGame",title:"Orbit Pong",desc:"Defend your half of the ring",cat:"sports",key:"orbit",win:7,
controls:"P1 (left half): W / S slide your paddle　 P2 (right half): ↑ / ↓ — a ball that escapes your half scores for your rival.",
round(g){
g.a=[Math.PI,0];
const ang=rnd(0,Math.PI*2);g.b={x:OC.x,y:OC.y,vx:Math.cos(ang)*250,vy:Math.sin(ang)*250};
},
update(g,dt){
const lim=Math.PI/2-.5;
g.a[0]=clamp(wrapA(g.a[0]-Math.PI)+((g.I[0].u?1:0)-(g.I[0].d?1:0))*2.4*dt,-lim,lim);
g.a[1]=clamp(wrapA(g.a[1])+((g.I[1].d?1:0)-(g.I[1].u?1:0))*2.4*dt,-lim,lim);
g.a[0]+=Math.PI;
const b=g.b;
b.x+=b.vx*dt;b.y+=b.vy*dt;
const dx=b.x-OC.x,dy=b.y-OC.y,r=Math.hypot(dx,dy);
if(r>OC.R-10){
const ph=Math.atan2(dy,dx),zone=Math.cos(ph)<0?0:1;
const nx=Math.cos(ph),ny=Math.sin(ph);
if(Math.abs(wrapA(ph-g.a[zone]))<.5&&b.vx*nx+b.vy*ny>0){
const dot=b.vx*nx+b.vy*ny;b.vx-=2*dot*nx;b.vy-=2*dot*ny;
const sp=Math.min(540,Math.hypot(b.vx,b.vy)*1.06);const k=sp/Math.hypot(b.vx,b.vy);b.vx*=k;b.vy*=k;
b.x=OC.x+nx*(OC.R-11);b.y=OC.y+ny*(OC.R-11);FX.playBounce();g.burst(b.x,b.y,col(zone),6,160);
}else if(r>OC.R+14){g.burst(b.x,b.y,col(zone),14,260);g.point(1-zone);}
}
},
draw(g,ctx){
ctx.fillStyle="#0c1030";ctx.fillRect(0,0,W,H);
ctx.fillStyle="#141c48";ctx.beginPath();ctx.arc(OC.x,OC.y,OC.R,0,Math.PI*2);ctx.fill();
ctx.lineWidth=10;
ctx.strokeStyle="rgba(100,234,255,.25)";ctx.beginPath();ctx.arc(OC.x,OC.y,OC.R,Math.PI/2,Math.PI*1.5);ctx.stroke();
ctx.strokeStyle="rgba(255,114,200,.25)";ctx.beginPath();ctx.arc(OC.x,OC.y,OC.R,-Math.PI/2,Math.PI/2);ctx.stroke();
for(let i=0;i<2;i++){ctx.strokeStyle=col(i);ctx.lineWidth=14;ctx.lineCap="round";ctx.beginPath();ctx.arc(OC.x,OC.y,OC.R,g.a[i]-.5,g.a[i]+.5);ctx.stroke();ctx.lineCap="butt";}
ctx.strokeStyle="rgba(255,255,255,.12)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(OC.x,OC.y-OC.R);ctx.lineTo(OC.x,OC.y+OC.R);ctx.stroke();
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(g.b.x,g.b.y,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle=GOLD;ctx.lineWidth=3;ctx.stroke();
}
});

/* ---------- BLIND TIMER ---------- */
micro({id:"blindGame",title:"Blind Timer",desc:"Stop the clock after it disappears",cat:"brain",key:"blind",win:1,hud:false,
controls:"P1: SPACE stops your clock　 P2: ENTER — the display vanishes after 2 seconds. Stop exactly on the target. Five rounds.",
init(g){g.rd=0;g.err=[0,0];blindStart(g);},
update(g,dt){
if(g.stage==="show"){g.st-=dt;if(g.st<=0){g.rd++;if(g.rd>=5){g.byScore([g.err[1],g.err[0]]);return;}blindStart(g);}return;}
g.rt+=dt;
for(let i=0;i<2;i++){
if(g.stop[i]===null&&(g.I[i].pa||g.rt>16)){g.stop[i]=g.rt;g.err[i]+=Math.abs(g.rt-g.tg);FX.tone(500,.1,"square",.05);}
}
if(g.stop[0]!==null&&g.stop[1]!==null){g.stage="show";g.st=2.2;}
},
draw(g,ctx){
if(!g.tg)return;
ctx.fillStyle="#11152e";ctx.fillRect(0,0,W,H);
g.text("ROUND "+Math.min(5,g.rd+1)+" / 5",W/2,40,22,GOLD,"center");
g.text("STOP AT "+g.tg.toFixed(2),W/2,110,50,"#fff","center");
for(let i=0;i<2;i++){
const cx=i?675:225;
ctx.fillStyle=i?"#2a1a4a":"#14305a";ctx.fillRect(cx-180,160,360,200);ctx.strokeStyle=col(i);ctx.lineWidth=3;ctx.strokeRect(cx-180,160,360,200);
g.text("P"+(i+1),cx,192,22,col(i),"center");
const done=g.stop[i]!==null,showNum=done&&g.stage==="show"||(!done&&g.rt<2);
const val=done?g.stop[i]:g.rt;
g.text(showNum?val.toFixed(2):done?"LOCKED":"?.??",cx,300,done&&g.stage!=="show"?36:62,done?GREEN:"#fff","center");
if(g.stage==="show")g.text((Math.abs(g.stop[i]-g.tg)).toFixed(2)+" off",cx,340,18,GOLD,"center");
g.text("TOTAL ERROR "+g.err[i].toFixed(2),cx,420,18,"#9fc0ff","center");
}
}
});
function blindStart(g){g.tg=rnd(6,10);g.rt=0;g.stop=[null,null];g.stage="run";g.st=0;}

/* ---------- NUMBER RUSH ---------- */
micro({id:"numGame",title:"Number Rush",desc:"Claim 1 to 20 in order, faster than your rival",cat:"brain",key:"num",win:1,hud:false,
controls:"P1: W/A/S/D move, SPACE claim　 P2: ARROWS move, ENTER claim — claim the next number in sequence. Wrong tiles lock you out.",
init(g){
const nums=Array.from({length:20},(_,i)=>i+1).sort(()=>Math.random()-.5);
g.t2=nums.map(n=>({n,o:-1}));g.next_=1;g.s=[0,0];g.lock=[0,0];g.tl=0;
g.cr=[mkp(260,60,C1,12),mkp(640,60,C2,12)];
},
update(g,dt){
g.cr.forEach((c,i)=>{
g.walk(c,i,380,{x0:10,x1:W-10,y0:30,y1:H-10});
g.lock[i]=Math.max(0,g.lock[i]-dt);
if(g.I[i].pa&&g.lock[i]<=0){
const tx=Math.floor((c.x-225)/90),ty=Math.floor((c.y-70)/90);
if(tx>=0&&ty>=0&&tx<5&&ty<4){
const t=g.t2[ty*5+tx];
if(t.o<0&&t.n===g.next_){t.o=i;g.s[i]++;g.next_++;g.burst(225+tx*90+45,70+ty*90+45,col(i),10,200);FX.tone(500+t.n*30,.06,"square",.04);}
else if(t.o<0){g.lock[i]=.8;FX.tone(120,.15,"sawtooth",.04,-40);}
}
}
});
g.tl+=dt;
if(g.next_>20||g.tl>90)g.byScore(g.s);
},
draw(g,ctx){
ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
g.t2.forEach((t,k)=>{
const x=225+(k%5)*90,y=70+Math.floor(k/5)*90;
ctx.fillStyle=t.o<0?(t.n===g.next_?"#3a3f8a":"#262b5a"):col(t.o);ctx.fillRect(x+3,y+3,84,84);
if(t.n===g.next_&&t.o<0){ctx.strokeStyle=GOLD;ctx.lineWidth=3;ctx.strokeRect(x+3,y+3,84,84);}
g.text(String(t.n),x+45,y+57,38,t.o<0?"#fff":"#080b18","center");
});
g.cr.forEach((c,i)=>{ctx.strokeStyle=col(i);ctx.lineWidth=3;ctx.beginPath();ctx.arc(c.x,c.y,13,0,Math.PI*2);ctx.moveTo(c.x-20,c.y);ctx.lineTo(c.x+20,c.y);ctx.moveTo(c.x,c.y-20);ctx.lineTo(c.x,c.y+20);ctx.stroke();if(g.lock[i]>0)g.text("LOCKED",c.x,c.y-24,14,RED,"center");});
g.text("P1 "+g.s[0],20,34,22,C1);g.text("P2 "+g.s[1],W-20,34,22,C2,"right");g.text("NEXT: "+Math.min(20,g.next_),W/2,34,22,GOLD,"center");
}
});

/* ---------- PENGUIN DASH ---------- */
micro({id:"penguinGame",title:"Penguin Dash",desc:"Slide around the ice, grab the fish",cat:"arcade",key:"penguin",win:1,hud:false,
controls:"P1: W/A/S/D　 P2: ARROWS — it's slippery! Golden fish are worth 3. 30 seconds.",
init(g){g.time=30;g.s=[0,0];g.fish=[];g.sp=0;g.pl=[mkp(250,260,C1,18),mkp(650,260,C2,18)];},
update(g,dt){
g.time-=dt;g.sp-=dt;
if(g.sp<=0&&g.fish.length<6){g.sp=.7;g.fish.push({x:rnd(50,850),y:rnd(80,450),gold:Math.random()<.14,ph:rnd(0,6)});}
g.pl.forEach((p,i)=>{
const I=g.I[i],ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0),l=Math.hypot(ax,ay);
if(l){p.vx+=ax/l*560*dt;p.vy+=ay/l*560*dt;p.fx=ax/l;p.fy=ay/l;}
p.vx*=.99;p.vy*=.99;p.x+=p.vx*dt;p.y+=p.vy*dt;
if(p.x<p.r){p.x=p.r;p.vx=Math.abs(p.vx)*.6;}if(p.x>W-p.r){p.x=W-p.r;p.vx=-Math.abs(p.vx)*.6;}
if(p.y<50+p.r){p.y=50+p.r;p.vy=Math.abs(p.vy)*.6;}if(p.y>H-p.r){p.y=H-p.r;p.vy=-Math.abs(p.vy)*.6;}
for(const f of g.fish)if(!f.got&&dist(p,f)<p.r+12){f.got=true;g.s[i]+=f.gold?3:1;g.burst(f.x,f.y,f.gold?GOLD:"#ff9a6a",8,200);FX.tone(f.gold?1100:800,.06,"square",.04,300);}
});
g.fish=g.fish.filter(f=>!f.got);
const [a,b]=g.pl,d=dist(a,b);
if(d<a.r+b.r&&d>0){const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d,o=(a.r+b.r-d)/2;a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;const vn=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(vn<0){const j=-1.8*vn/2;a.vx-=j*nx;a.vy-=j*ny;b.vx+=j*nx;b.vy+=j*ny;FX.tone(200,.05,"square",.04);}}
if(g.time<=0)g.byScore(g.s);
},
draw(g,ctx){
g.floor("#bfe7ff","#b0dcf8",50);
ctx.strokeStyle="rgba(255,255,255,.7)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(120,200);ctx.lineTo(220,240);ctx.lineTo(260,330);ctx.moveTo(700,150);ctx.lineTo(640,220);ctx.stroke();
for(const f of g.fish){const w=Math.sin(g.t*8+f.ph)*3;ctx.fillStyle=f.gold?GOLD:"#ff9a6a";ctx.beginPath();ctx.ellipse(f.x,f.y,13,7,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(f.x+11,f.y);ctx.lineTo(f.x+20,f.y-6+w);ctx.lineTo(f.x+20,f.y+6+w);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle="#080b18";ctx.fillRect(f.x-8,f.y-3,3,3);}
g.pl.forEach((p,i)=>{
ctx.fillStyle="rgba(0,0,0,.2)";ctx.beginPath();ctx.ellipse(p.x,p.y+p.r,p.r,5,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#2a2a3a";ctx.beginPath();ctx.ellipse(p.x,p.y,p.r-2,p.r+2,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle="#f4f4ff";ctx.beginPath();ctx.ellipse(p.x,p.y+3,p.r-7,p.r-3,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle=col(i);ctx.fillRect(p.x-p.r+2,p.y-p.r+3,p.r*2-4,5);
const s=p.fx>=0?1:-1;
ctx.fillStyle="#ff9a3a";ctx.beginPath();ctx.moveTo(p.x+s*8,p.y-4);ctx.lineTo(p.x+s*18,p.y);ctx.lineTo(p.x+s*8,p.y+2);ctx.fill();
ctx.fillStyle="#fff";ctx.fillRect(p.x+s*3-2,p.y-9,5,5);ctx.fillStyle="#11152b";ctx.fillRect(p.x+s*5-1,p.y-8,2,3);
});
ctx.fillStyle="#080b18";ctx.fillRect(0,0,W,40);
g.text("P1 "+g.s[0],20,28,20,C1);g.text("P2 "+g.s[1],W-20,28,20,C2,"right");g.text(String(Math.max(0,Math.ceil(g.time))),W/2,30,24,g.time<8?RED:GOLD,"center");
}
});

/* ---------- SPEEDWAY ---------- */
const SW={cx:450,cy:262,orx:390,ory:210,irx:240,iry:100};
const onTrack=(x,y)=>(((x-SW.cx)/SW.orx)**2+((y-SW.cy)/SW.ory)**2<=1)&&(((x-SW.cx)/SW.irx)**2+((y-SW.cy)/SW.iry)**2>=1);
micro({id:"speedGame",title:"Speedway",desc:"Three laps around the oval",cat:"arcade",key:"speed",win:2,
controls:"P1: A / D steer, SPACE nitro　 P2: ← / → steer, ENTER nitro — you accelerate automatically. Stay on the asphalt!",
round(g){
g.car=[{x:430,y:392,a:0,v:0,prog:0,la:Math.PI/2,nit:0,cd:0},{x:430,y:440,a:0,v:0,prog:0,la:Math.PI/2,nit:0,cd:0}];
},
update(g,dt){
g.car.forEach((c,i)=>{
const I=g.I[i];
c.nit=Math.max(0,c.nit-dt);c.cd=Math.max(0,c.cd-dt);
if(I.pa&&c.cd<=0){c.nit=1.1;c.cd=4;FX.tone(300,.3,"sawtooth",.04,500);}
const on=onTrack(c.x,c.y),max=(on?235:85)+(c.nit>0&&on?90:0);
if(c.v<max)c.v=Math.min(max,c.v+220*dt);else c.v=Math.max(max,c.v-300*dt);
const st=(I.r?1:0)-(I.l?1:0);
c.a+=st*2.7*dt*(.35+.65*Math.min(1,c.v/180));
c.x+=Math.cos(c.a)*c.v*dt;c.y+=Math.sin(c.a)*c.v*dt;
c.x=clamp(c.x,10,W-10);c.y=clamp(c.y,10,H-10);
const ang=Math.atan2(c.y-SW.cy,c.x-SW.cx);
c.prog+=wrapA(c.la-ang);c.la=ang;
});
const fin=g.car.map(c=>c.prog>=Math.PI*2*3);
if(fin[0]&&fin[1])g.next("PHOTO FINISH");else if(fin[0])g.point(0,"P1 FINISHES");else if(fin[1])g.point(1,"P2 FINISHES");
},
draw(g,ctx){
ctx.fillStyle="#2a6a3a";ctx.fillRect(0,0,W,H);
ctx.fillStyle="#c84a3a";ctx.beginPath();ctx.ellipse(SW.cx,SW.cy,SW.orx+8,SW.ory+8,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#3a3f4a";ctx.beginPath();ctx.ellipse(SW.cx,SW.cy,SW.orx,SW.ory,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#fff";ctx.beginPath();ctx.ellipse(SW.cx,SW.cy,SW.irx+8,SW.iry+8,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#2a6a3a";ctx.beginPath();ctx.ellipse(SW.cx,SW.cy,SW.irx,SW.iry,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#fff";for(let k=0;k<8;k++){ctx.fillStyle=k%2?"#111":"#fff";ctx.fillRect(448,SW.cy+SW.iry+k*(SW.ory-SW.iry)/8,8,(SW.ory-SW.iry)/8);}
g.text("SPEEDWAY",SW.cx,SW.cy+6,22,"rgba(255,255,255,.3)","center");
g.car.forEach((c,i)=>{
ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.a);
if(c.nit>0){ctx.fillStyle=Math.random()<.5?GOLD:"#ff8c42";ctx.beginPath();ctx.moveTo(-14,-4);ctx.lineTo(-28-Math.random()*8,0);ctx.lineTo(-14,4);ctx.fill();}
ctx.fillStyle="rgba(0,0,0,.3)";ctx.fillRect(-14,-8,30,20);
ctx.fillStyle="#0c0f24";ctx.fillRect(-11,-11,8,5);ctx.fillRect(5,-11,8,5);ctx.fillRect(-11,7,8,5);ctx.fillRect(5,7,8,5);
ctx.fillStyle=col(i);ctx.fillRect(-15,-8,30,16);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(-15,-8,30,16);
ctx.fillStyle="#dff6ff";ctx.fillRect(1,-5,8,10);ctx.fillStyle=GOLD;ctx.fillRect(13,-7,3,4);ctx.fillRect(13,3,3,4);
ctx.restore();
const lap=Math.min(3,Math.floor(c.prog/(Math.PI*2))+1);
g.text("P"+(i+1)+" LAP "+lap+"/3",i?W-20:20,32,18,col(i),i?"right":"left");
ctx.fillStyle="#080b18";ctx.fillRect(i?W-120:20,40,100,8);ctx.fillStyle=c.cd<=0?GREEN:"#3a3f6a";ctx.fillRect(i?W-118:22,41,96*(1-c.cd/4),6);
});
}
});

/* ---------- GLASS BRIDGE ---------- */
micro({id:"glassGame",title:"Glass Bridge",desc:"Pick the safe glass panel. Wrong ones shatter.",cat:"brain",key:"glass",win:3,
controls:"P1: A (left) or D (right)　 P2: ← or → — one panel in each pair is safe. Watch what your rival breaks!",
round(g){g.safe=Array.from({length:8},()=>ri(0,1));g.pos=[0,0];g.br=Array.from({length:8},()=>[false,false]);g.cd=[0,0];},
update(g,dt){
for(let i=0;i<2;i++){
g.cd[i]=Math.max(0,g.cd[i]-dt);
const I=g.I[i],d=I.pl?0:I.pr?1:-1;
if(d<0||g.cd[i]>0)continue;
const s=g.pos[i];
if(g.safe[s]===d){g.pos[i]++;g.cd[i]=.18;FX.tone(500+s*50,.06,"square",.04);if(g.pos[i]>=8){g.point(i,"ACROSS!");return;}}
else{
g.br[s][d]=true;g.burst(450+(d?70:-70),430-s*48,"#bfe7ff",24,380);FX.playBoom();
g.pos[i]=-1;g.point(1-i,i?"P2 FELL":"P1 FELL");return;
}
}
},
draw(g,ctx){
const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#1a2a5a");gr.addColorStop(1,"#0a0f2a");ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
for(let k=0;k<8;k++){
const y=430-k*48;
for(let d=0;d<2;d++){
const x=450+(d?70:-70)-52;
if(g.br[k][d]){ctx.strokeStyle="rgba(191,231,255,.3)";ctx.lineWidth=2;ctx.strokeRect(x,y-18,104,36);ctx.beginPath();ctx.moveTo(x,y-18);ctx.lineTo(x+52,y);ctx.lineTo(x+104,y-18);ctx.stroke();continue;}
ctx.fillStyle="rgba(191,231,255,.35)";ctx.fillRect(x,y-18,104,36);ctx.strokeStyle="#dff6ff";ctx.lineWidth=3;ctx.strokeRect(x,y-18,104,36);
ctx.fillStyle="rgba(255,255,255,.25)";ctx.fillRect(x+6,y-14,40,5);
}
}
ctx.fillStyle="#3a3f6a";ctx.fillRect(330,456,240,20);ctx.fillStyle="#5a60a0";ctx.fillRect(330,70,240,20);
g.text("FINISH",450,58,16,GREEN,"center");g.text("START",450,494,14,"#9fc0ff","center");
for(let i=0;i<2;i++){
const p=g.pos[i];if(p<0)continue;
let x=450+(i?36:-36),y=436;
if(p>0){const k=p-1;x=450+(g.safe[k]?70:-70)+(i?16:-16);y=430-k*48-20;}
g.blob({x,y,r:13},col(i),450,60,false);
}
}
});

/* ---------- TIGHTROPE ---------- */
micro({id:"tightGame",title:"Tightrope",desc:"Keep your balance in the wind",cat:"reflex",key:"tight",win:3,
controls:"P1: A / D lean left / right　 P2: ← / → — the wind pushes you over. First to fall loses, or cross to win.",
round(g){g.ph=rnd(0,6);g.p=[{a:0,w:0,pr:0},{a:0,w:0,pr:0}];},
update(g,dt){
const wind=Math.sin(g.t*1.3+g.ph)*2.3+Math.sin(g.t*2.9+g.ph*2)*1.6+Math.sin(g.t*.5)*1.2;
const fall=[false,false],fin=[false,false];
g.p.forEach((p,i)=>{
const I=g.I[i];
p.w+=(wind+p.a*2.4+((I.r?1:0)-(I.l?1:0))*6.5)*dt;
p.w*=.992;p.a+=p.w*dt;
p.pr+=(.034-Math.abs(p.a)*.015)*dt;
if(Math.abs(p.a)>1)fall[i]=true;
if(p.pr>=1)fin[i]=true;
});
if(fall[0]&&fall[1])g.next("BOTH FELL");
else if(fall[0]){g.burst(225,300,C1,18,300);g.point(1,"P1 FELL");}
else if(fall[1]){g.burst(675,300,C2,18,300);g.point(0,"P2 FELL");}
else if(fin[0]&&fin[1])g.next("TIE");else if(fin[0])g.point(0,"ACROSS!");else if(fin[1])g.point(1,"ACROSS!");
},
draw(g,ctx){
for(let i=0;i<2;i++){
const off=i*450,p=g.p[i];
const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,i?"#4a3a8a":"#3a6ac8");gr.addColorStop(1,i?"#c8a0d8":"#b8e0ff");ctx.fillStyle=gr;ctx.fillRect(off,0,450,H);
ctx.fillStyle="#6a5a8a";ctx.fillRect(off,360,60,140);ctx.fillRect(off+390,360,60,140);
ctx.strokeStyle="#2a1e15";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(off+60,360);ctx.lineTo(off+390,360);ctx.stroke();
const x=off+60+p.pr*330;
ctx.save();ctx.translate(x,360);ctx.rotate(p.a*.5);
ctx.save();ctx.translate(-14,-70);FX.drawFighter(ctx,28,70,col(i),1,true,false);ctx.restore();
ctx.strokeStyle="#c8a46a";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-90,-48);ctx.lineTo(90,-48);ctx.stroke();ctx.restore();
ctx.fillStyle="#080b18";ctx.fillRect(off+60,470,330,10);ctx.fillStyle=col(i);ctx.fillRect(off+60,470,330*p.pr,10);
const bal=Math.abs(p.a);ctx.fillStyle="#080b18";ctx.fillRect(off+135,40,180,14);ctx.fillStyle=bal>.7?RED:GREEN;ctx.fillRect(off+225+clamp(p.a,-1,1)*86-4,38,8,18);ctx.fillStyle="#fff";ctx.fillRect(off+224,40,2,14);
g.text("P"+(i+1),off+225,32,20,col(i),"center");
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* ---------- FLY CATCH ---------- */
micro({id:"flyGame",title:"Fly Catch",desc:"Flick your tongue at the buzzing flies",cat:"reflex",key:"fly",win:1,hud:false,
controls:"P1: SPACE shoots your tongue　 P2: ENTER — gold flies are worth 3, striped wasps cost you 2. 30 seconds.",
init(g){
g.time=30;g.s=[0,0];
const r=seeded(ri(1,1e6));
g.fl=Array.from({length:9},(_,k)=>({ax:60+r()*130,ay:50+r()*80,f1:.7+r()*1.2,f2:.9+r()*1.3,ph:r()*6,type:k<1?"gold":k<3?"wasp":"fly"}));
g.dead=[0,1].map(()=>new Array(9).fill(-1));
g.tg=[0,1].map(()=>({st:"ready",L:0,ang:0}));
},
update(g,dt){
g.time-=dt;
g.tg.forEach((t,i)=>{
const cx=i*450+225;
if(t.st==="ready"){t.ang=Math.sin(g.t*1.7+i)*1.0;if(g.I[i].pa){t.st="out";t.L=0;FX.tone(500,.1,"sawtooth",.03,300);}}
else if(t.st==="out"){
t.L+=900*dt;
const tx=cx+Math.sin(t.ang)*t.L,ty=455-Math.cos(t.ang)*t.L;
g.fl.forEach((f,k)=>{
if(t.st!=="out"||g.dead[i][k]>g.t)return;
const p=flyPos(g,f,i);
if(Math.hypot(p.x-tx,p.y-ty)<20){
g.dead[i][k]=g.t+2;t.st="back";
const v=f.type==="gold"?3:f.type==="wasp"?-2:1;g.s[i]=Math.max(0,g.s[i]+v);
g.burst(p.x,p.y,v<0?RED:v>1?GOLD:"#fff",10,220);FX.tone(v<0?130:v>1?1200:800,.1,"square",.05,v<0?-40:300);
}
});
if(t.L>420)t.st="back";
}else{t.L-=1100*dt;if(t.L<=0){t.L=0;t.st="ready";}}
});
if(g.time<=0)g.byScore(g.s);
},
draw(g,ctx){
for(let i=0;i<2;i++){
const off=i*450,cx=off+225,t=g.tg[i];
const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,i?"#3a2a5a":"#2a5a4a");gr.addColorStop(1,i?"#2a1a3a":"#1a3a2a");ctx.fillStyle=gr;ctx.fillRect(off,0,450,H);
for(let k=0;k<6;k++){ctx.fillStyle="#1f4a30";ctx.fillRect(off+k*78+10,H-50-(k%3)*10,40,50+(k%3)*10);}
g.fl.forEach((f,k)=>{
if(g.dead[i][k]>g.t)return;
const p=flyPos(g,f,i),w=Math.sin(g.t*50)*3;
ctx.fillStyle="rgba(255,255,255,.6)";ctx.beginPath();ctx.ellipse(p.x-4,p.y-6+w,6,3,0,0,Math.PI*2);ctx.ellipse(p.x+4,p.y-6-w,6,3,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle=f.type==="gold"?GOLD:f.type==="wasp"?"#ffd23a":"#2a2a3a";ctx.beginPath();ctx.ellipse(p.x,p.y,8,6,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=1.5;ctx.stroke();
if(f.type==="wasp"){ctx.fillStyle="#111";ctx.fillRect(p.x-3,p.y-5,2,10);ctx.fillRect(p.x+2,p.y-5,2,10);}
});
const tx=cx+Math.sin(t.ang)*t.L,ty=455-Math.cos(t.ang)*t.L;
if(t.st==="ready"){ctx.strokeStyle="rgba(255,255,255,.35)";ctx.lineWidth=2;ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(cx,455);ctx.lineTo(cx+Math.sin(t.ang)*420,455-Math.cos(t.ang)*420);ctx.stroke();ctx.setLineDash([]);}
if(t.L>0){ctx.strokeStyle="#ff6a9a";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(cx,455);ctx.lineTo(tx,ty);ctx.stroke();ctx.fillStyle="#ff4a7a";ctx.beginPath();ctx.arc(tx,ty,9,0,Math.PI*2);ctx.fill();}
ctx.fillStyle=col(i);ctx.beginPath();ctx.ellipse(cx,470,36,26,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(cx-20,448,11,0,Math.PI*2);ctx.arc(cx+20,448,11,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle="#11152b";ctx.fillRect(cx-22,444,6,8);ctx.fillRect(cx+16,444,6,8);
g.text("P"+(i+1)+"  "+g.s[i],cx,36,22,col(i),"center");
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
g.text(String(Math.max(0,Math.ceil(g.time))),W/2,490,20,g.time<8?RED:GOLD,"center");
}
});
function flyPos(g,f,i){return{x:i*450+225+Math.sin(g.t*f.f1+f.ph)*f.ax,y:230+Math.sin(g.t*f.f2+f.ph*1.7)*f.ay};}
})();