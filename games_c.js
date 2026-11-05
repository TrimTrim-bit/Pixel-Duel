/* =====================================================
   GAME PACK C — 10 games
   Maze Dash, Gomoku, Cannon Duel, Crazy Pong,
   Capture the Flag, Tower Stack, Pixel Boxing,
   Copycat, Mole Mash, Dots and Boxes
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const mkp=(x,y,color,r=16)=>({x,y,r,color,vx:0,vy:0,fx:1,fy:0});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

/* ---------- 21. MAZE DASH ---------- */
micro({id:"mazeGame",title:"Maze Dash",desc:"Race through a fresh maze to the flag",cat:"arcade",key:"maze",win:3,
controls:"P1: W/A/S/D　 P2: ARROWS — both start together, first to the flag scores",
round(g){
const cols=29,rows=15,grid=[];
for(let y=0;y<rows;y++){grid.push(new Array(cols).fill(1));}
const stack=[[1,1]];grid[1][1]=0;
while(stack.length){
const [x,y]=stack[stack.length-1];
const nb=[[2,0],[-2,0],[0,2],[0,-2]].filter(([dx,dy])=>{const nx=x+dx,ny=y+dy;return nx>0&&ny>0&&nx<cols-1&&ny<rows-1&&grid[ny][nx]===1;});
if(!nb.length){stack.pop();continue;}
const [dx,dy]=nb[ri(0,nb.length-1)];
grid[y+dy/2][x+dx/2]=0;grid[y+dy][x+dx]=0;stack.push([x+dx,y+dy]);
}
g.grid=grid;g.cols=cols;g.rows=rows;g.cs=30;g.ox=15;g.oy=35;
g.pl=[mkp(g.ox+45,g.oy+40,C1,9),mkp(g.ox+45,g.oy+50,C2,9)];
},
update(g,dt){
g.pl.forEach((p,i)=>{
g.walk(p,i,135,{x0:p.r,x1:W-p.r,y0:p.r,y1:H-p.r});
const cx=Math.floor((p.x-g.ox)/g.cs),cy=Math.floor((p.y-g.oy)/g.cs);
for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++){
if(y<0||x<0||y>=g.rows||x>=g.cols||g.grid[y][x]!==1)continue;
FX.circleRectPush(p,{x:g.ox+x*g.cs,y:g.oy+y*g.cs,w:g.cs,h:g.cs});
}
});
const fx=g.ox+27*g.cs+15,fy=g.oy+13*g.cs+15;
const win=g.pl.map(p=>Math.hypot(p.x-fx,p.y-fy)<16);
if(win[0]&&win[1])g.next("PHOTO FINISH");else if(win[0])g.point(0);else if(win[1])g.point(1);
},
draw(g,ctx){
ctx.fillStyle="#0e1226";ctx.fillRect(0,0,W,H);
for(let y=0;y<g.rows;y++)for(let x=0;x<g.cols;x++){
const px=g.ox+x*g.cs,py=g.oy+y*g.cs;
if(g.grid[y][x]===1){ctx.fillStyle="#4a3a8a";ctx.fillRect(px,py,g.cs,g.cs);ctx.fillStyle="#6a56b8";ctx.fillRect(px,py,g.cs,5);ctx.fillStyle="#2f2560";ctx.fillRect(px,py+g.cs-4,g.cs,4);}
else{ctx.fillStyle=(x+y)%2?"#141a38":"#172044";ctx.fillRect(px,py,g.cs,g.cs);}
}
const fx=g.ox+27*g.cs+15,fy=g.oy+13*g.cs+15;
ctx.fillStyle="#fff";ctx.fillRect(fx-1,fy-12,3,24);ctx.fillStyle=GREEN;ctx.fillRect(fx+2,fy-12,13,9);
g.pl.forEach((p,i)=>{ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle="#fff";ctx.fillRect(p.x-4+p.fx*2,p.y-4,3,4);ctx.fillRect(p.x+1+p.fx*2,p.y-4,3,4);});
}
});

/* ---------- 22. GOMOKU ---------- */
micro({id:"gomokuGame",title:"Gomoku",desc:"Five in a row on a 15x15 board",cat:"board",key:"gomoku",win:1,hud:false,noRestart:false,
controls:"Click to place a stone. P1 (cyan) goes first. First to five in a row wins.",
init(g){g.b=new Array(225).fill(-1);g.turn=0;g.last=-1;g.cells=[];g.line=null;g.msg.textContent="P1'S TURN";},
update(){},
click(g,x,y){
const cx=Math.round((x-225)/30),cy=Math.round((y-25)/30);
if(cx<0||cy<0||cx>14||cy>14||g.b[cy*15+cx]>=0)return;
const k=cy*15+cx;g.b[k]=g.turn;g.last=k;FX.tone(300+g.turn*100,.08,"triangle",.06);
g.burst(225+cx*30,25+cy*30,col(g.turn),6,120);
const dirs=[[1,0],[0,1],[1,1],[1,-1]];
for(const [dx,dy] of dirs){
let n=1,line=[[cx,cy]];
for(const s of[1,-1]){let x2=cx+dx*s,y2=cy+dy*s;while(x2>=0&&y2>=0&&x2<15&&y2<15&&g.b[y2*15+x2]===g.turn){n++;line.push([x2,y2]);x2+=dx*s;y2+=dy*s;}}
if(n>=5){g.line=line;g.end(g.turn);return;}
}
if(!g.b.includes(-1)){g.end(-1);return;}
g.turn=1-g.turn;g.msg.textContent=`P${g.turn+1}'S TURN`;
},
move(g,x,y){g.hv={cx:Math.round((x-225)/30),cy:Math.round((y-25)/30)};},
draw(g,ctx){
ctx.fillStyle="#c89a5a";ctx.fillRect(0,0,W,H);
ctx.fillStyle="#d8aa68";ctx.fillRect(205,5,490,490);
ctx.strokeStyle="#5a3a1a";ctx.lineWidth=1.5;
for(let i=0;i<15;i++){ctx.beginPath();ctx.moveTo(225+i*30,25);ctx.lineTo(225+i*30,445);ctx.stroke();ctx.beginPath();ctx.moveTo(225,25+i*30);ctx.lineTo(645,25+i*30);ctx.stroke();}
ctx.fillStyle="#5a3a1a";[[3,3],[11,3],[3,11],[11,11],[7,7]].forEach(([x,y])=>ctx.fillRect(225+x*30-3,25+y*30-3,6,6));
if(g.mode==="play"&&g.hv&&g.hv.cx>=0&&g.hv.cy>=0&&g.hv.cx<15&&g.hv.cy<15&&g.b[g.hv.cy*15+g.hv.cx]<0){
ctx.globalAlpha=.4;ctx.fillStyle=col(g.turn);ctx.beginPath();ctx.arc(225+g.hv.cx*30,25+g.hv.cy*30,12,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
}
g.b.forEach((v,k)=>{
if(v<0)return;
const x=225+(k%15)*30,y=25+Math.floor(k/15)*30;
ctx.fillStyle="rgba(0,0,0,.3)";ctx.beginPath();ctx.arc(x+2,y+3,13,0,Math.PI*2);ctx.fill();
ctx.fillStyle=col(v);ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle="rgba(255,255,255,.5)";ctx.beginPath();ctx.arc(x-4,y-4,4,0,Math.PI*2);ctx.fill();
if(k===g.last){ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.strokeRect(x-5,y-5,10,10);}
});
if(g.line)g.line.forEach(([x,y])=>{ctx.strokeStyle=GOLD;ctx.lineWidth=4;ctx.beginPath();ctx.arc(225+x*30,25+y*30,16,0,Math.PI*2);ctx.stroke();});
g.text("P1",20,34,22,C1);g.text("P2",W-20,34,22,C2,"right");
if(g.mode==="play"){g.text(`P${g.turn+1}'S TURN`,g.turn?W-20:20,64,14,col(g.turn),g.turn?"right":"left");}
}
});

/* ---------- 23. CANNON DUEL ---------- */
micro({id:"cannonGame",title:"Cannon Duel",desc:"Aim, charge, fire over the wall",cat:"action",key:"cannon",win:3,
controls:"P1: W/S angle, hold SPACE to charge, release to fire　 P2: ↑/↓ angle, hold ENTER, release",
round(g){
g.wall={x:440,w:20,h:rnd(90,210)};g.wind=rnd(-70,70);
g.c=[{x:90,ang:45,pow:0,ch:false,shot:null},{x:810,ang:45,pow:0,ch:false,shot:null}];
g.groundY=430;
},
update(g,dt){
const GY=g.groundY;
g.c.forEach((c,i)=>{
const I=g.I[i];
if(I.u)c.ang=Math.min(80,c.ang+55*dt);
if(I.d)c.ang=Math.max(10,c.ang-55*dt);
if(!c.shot){
if(I.a){c.ch=true;c.pow=Math.min(100,c.pow+75*dt);}
else if(c.ch){
c.ch=false;
const a=c.ang*Math.PI/180,v=140+c.pow*5.2,dir=i?-1:1;
c.shot={x:c.x+dir*Math.cos(a)*38,y:GY-24-Math.sin(a)*38,vx:dir*Math.cos(a)*v,vy:-Math.sin(a)*v};
c.pow=0;FX.playShoot();g.burst(c.shot.x,c.shot.y,"#ff8c42",10,200);
}
}
const s=c.shot;
if(s){
s.vy+=520*dt;s.vx+=g.wind*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;
const t=g.c[1-i];
if(Math.hypot(s.x-t.x,s.y-(GY-14))<34){g.burst(t.x,GY-14,RED,30,420);FX.playBoom();c.shot=null;g.point(i);return;}
if(s.x>g.wall.x&&s.x<g.wall.x+g.wall.w&&s.y>GY-g.wall.h){g.burst(s.x,s.y,"#a88a6a",12,220);c.shot=null;FX.tone(140,.1,"square",.04);}
else if(s.y>GY||s.x<-40||s.x>W+40){g.burst(s.x,GY,"#8a6a4a",10,200);c.shot=null;FX.tone(120,.1,"sawtooth",.03,-40);}
}
});
},
draw(g,ctx){
const GY=g.groundY;
const gr=ctx.createLinearGradient(0,0,0,GY);gr.addColorStop(0,"#2a2a6a");gr.addColorStop(1,"#c88a6a");
ctx.fillStyle=gr;ctx.fillRect(0,0,W,GY);
ctx.fillStyle="#3a5a2a";ctx.fillRect(0,GY,W,H-GY);ctx.fillStyle="#4a7a3a";ctx.fillRect(0,GY,W,6);
ctx.fillStyle="#7a6a8a";ctx.fillRect(g.wall.x,GY-g.wall.h,g.wall.w,g.wall.h);ctx.fillStyle="#9a8aaa";ctx.fillRect(g.wall.x,GY-g.wall.h,g.wall.w,5);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(g.wall.x,GY-g.wall.h,g.wall.w,g.wall.h);
g.text("WIND "+(g.wind<0?"◀ ":"")+Math.abs(Math.round(g.wind))+(g.wind>0?" ▶":""),W/2,60,16,"#fff","center");
g.c.forEach((c,i)=>{
const dir=i?-1:1;
ctx.save();ctx.translate(c.x,GY-14);
ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(0,0,22,Math.PI,0);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
ctx.fillStyle="#1b2147";ctx.fillRect(-20,0,40,14);ctx.fillStyle="#0c0f24";ctx.beginPath();ctx.arc(-12,14,9,0,Math.PI*2);ctx.arc(12,14,9,0,Math.PI*2);ctx.fill();
ctx.save();ctx.scale(dir,1);ctx.rotate(-c.ang*Math.PI/180);ctx.fillStyle="#3a3f6a";ctx.fillRect(0,-7,40,14);ctx.strokeRect(0,-7,40,14);ctx.restore();
ctx.restore();
ctx.fillStyle="#080b18";ctx.fillRect(c.x-40,GY+22,80,12);ctx.fillStyle=c.pow>80?RED:GOLD;ctx.fillRect(c.x-38,GY+24,76*c.pow/100,8);ctx.strokeStyle="#9fc0ff";ctx.lineWidth=1;ctx.strokeRect(c.x-40,GY+22,80,12);
g.text(Math.round(c.ang)+"°",c.x,GY+56,14,col(i),"center");
if(c.shot){ctx.fillStyle="#222";ctx.beginPath();ctx.arc(c.shot.x,c.shot.y,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();}
});
}
});

/* ---------- 24. CRAZY PONG ---------- */
function serve(g,i){
const dir=Math.random()<.5?-1:1;
g.balls[i]={x:450,y:ri(100,400),vx:dir*rnd(240,300),vy:rnd(-180,180),r:9};
}
micro({id:"crazyPongGame",title:"Crazy Pong",desc:"Three balls and bouncy bumpers",cat:"sports",key:"crazypong",win:7,
controls:"P1: W / S　 P2: ↑ / ↓ — every ball that gets past you is a point for your rival",
init(g){
g.pd=[{x:24,y:250,h:90},{x:W-24-14,y:250,h:90}];
g.bumpers=[{x:450,y:140,r:26},{x:450,y:360,r:26},{x:450,y:250,r:16}];
g.balls=[];for(let i=0;i<3;i++)serve(g,i);
},
update(g,dt){
g.pd.forEach((p,i)=>{
const I=g.I[i];p.y=clamp(p.y+((I.d?1:0)-(I.u?1:0))*440*dt,30,H-30-p.h);
});
g.balls.forEach((b,i)=>{
b.x+=b.vx*dt;b.y+=b.vy*dt;
if(b.y<b.r+30){b.y=b.r+30;b.vy=Math.abs(b.vy);}
if(b.y>H-b.r){b.y=H-b.r;b.vy=-Math.abs(b.vy);}
for(const m of g.bumpers){
const d=Math.hypot(b.x-m.x,b.y-m.y);
if(d<b.r+m.r&&d>0){
const nx=(b.x-m.x)/d,ny=(b.y-m.y)/d;b.x=m.x+nx*(b.r+m.r);b.y=m.y+ny*(b.r+m.r);
const sp=Math.min(620,Math.hypot(b.vx,b.vy)*1.04+30);b.vx=nx*sp;b.vy=ny*sp;m.flash=.15;FX.tone(700,.05,"square",.03,200);
}
}
g.pd.forEach((p,k)=>{
if(b.x+b.r>p.x&&b.x-b.r<p.x+14&&b.y>p.y&&b.y<p.y+p.h&&((k===0&&b.vx<0)||(k===1&&b.vx>0))){
b.vx=-b.vx*1.05;b.vy+=((b.y-(p.y+p.h/2))/(p.h/2))*180;b.x=k?p.x-b.r:p.x+14+b.r;
b.vx=clamp(b.vx,-640,640);FX.playBounce();g.burst(b.x,b.y,col(k),6,160);
}
});
if(b.x<-10){g.add(1);serve(g,i);}
else if(b.x>W+10){g.add(0);serve(g,i);}
});
g.bumpers.forEach(m=>{if(m.flash)m.flash-=dt;});
},
draw(g,ctx){
g.floor("#0f1530","#121a3a");
ctx.strokeStyle="rgba(255,255,255,.15)";ctx.setLineDash([12,12]);ctx.beginPath();ctx.moveTo(450,30);ctx.lineTo(450,H);ctx.stroke();ctx.setLineDash([]);
ctx.fillStyle="#080b18";ctx.fillRect(0,0,W,30);
g.bumpers.forEach(m=>{ctx.fillStyle=m.flash>0?"#fff":"#ff9a3a";ctx.beginPath();ctx.arc(m.x,m.y,m.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();ctx.fillStyle="rgba(255,255,255,.4)";ctx.beginPath();ctx.arc(m.x-m.r*.3,m.y-m.r*.3,m.r*.3,0,Math.PI*2);ctx.fill();});
g.pd.forEach((p,i)=>{ctx.fillStyle=col(i);ctx.fillRect(p.x,p.y,14,p.h);ctx.fillStyle="rgba(255,255,255,.35)";ctx.fillRect(p.x+2,p.y+2,4,p.h-4);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(p.x,p.y,14,p.h);});
g.balls.forEach(b=>{ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.stroke();});
}
});

/* ---------- 25. CAPTURE THE FLAG ---------- */
micro({id:"flagGame",title:"Capture the Flag",desc:"Steal the flag, bring it home",cat:"action",key:"flag",win:3,
controls:"P1: W/A/S/D　 P2: ARROWS — touch the flag carrier to knock it loose",
round(g){
g.pl=[mkp(110,250,C1,16),mkp(790,250,C2,16)];
g.pl.forEach(p=>{p.has=false;p.stun=0;});
g.home=[{x:70,y:250},{x:830,y:250}];
g.flag=[{x:70,y:250,carried:false},{x:830,y:250,carried:false}];
g.walls=[{x:250,y:90,w:40,h:110},{x:250,y:300,w:40,h:110},{x:610,y:90,w:40,h:110},{x:610,y:300,w:40,h:110},{x:430,y:215,w:40,h:70}];
},
update(g,dt){
g.pl.forEach((p,i)=>{
p.stun=Math.max(0,p.stun-dt);
if(p.stun<=0)g.walk(p,i,p.has?170:215,{x0:p.r,x1:W-p.r,y0:p.r+30,y1:H-p.r});
const ef=g.flag[1-i];
if(!ef.carried&&dist(p,ef)<p.r+12){ef.carried=true;p.has=true;FX.tone(900,.12,"square",.05,300);}
if(p.has){ef.x=p.x;ef.y=p.y-26;}
if(p.has&&dist(p,g.home[i])<34&&!g.flag[i].carried){
p.has=false;g.burst(p.x,p.y,GOLD,30,400);g.point(i,`P${i+1} CAPTURES!`);
}
});
const [a,b]=g.pl,d=dist(a,b);
if(d<a.r+b.r&&d>0){
const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d,o=(a.r+b.r-d)/2+1;a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;
g.pl.forEach((p,i)=>{
if(p.has&&p.stun<=0&&g.pl[1-i].stun<=0){
p.has=false;p.stun=1;const f=g.flag[1-i];f.carried=false;f.x=g.home[1-i].x;f.y=g.home[1-i].y;
g.burst(p.x,p.y,"#fff",14,280);playHitSound();
}
});
}
},
draw(g,ctx){
g.floor("#1d3a2a","#214330");
[0,1].forEach(i=>{ctx.fillStyle=i?"rgba(255,114,200,.15)":"rgba(100,234,255,.15)";ctx.beginPath();ctx.arc(g.home[i].x,g.home[i].y,38,0,Math.PI*2);ctx.fill();ctx.strokeStyle=col(i);ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.stroke();ctx.setLineDash([]);});
for(const w of g.walls){ctx.fillStyle="rgba(0,0,0,.3)";ctx.fillRect(w.x+4,w.y+5,w.w,w.h);ctx.fillStyle="#6a5a8a";ctx.fillRect(w.x,w.y,w.w,w.h);ctx.fillStyle="#8a7aaa";ctx.fillRect(w.x,w.y,w.w,5);ctx.strokeStyle="#241a3a";ctx.lineWidth=2;ctx.strokeRect(w.x,w.y,w.w,w.h);}
g.flag.forEach((f,i)=>{
ctx.fillStyle="#fff";ctx.fillRect(f.x-1,f.y-14,3,28);
const w=Math.sin(g.t*8+i)*3;ctx.fillStyle=col(i);ctx.beginPath();ctx.moveTo(f.x+2,f.y-14);ctx.lineTo(f.x+22+w,f.y-8);ctx.lineTo(f.x+2,f.y);ctx.closePath();ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=1.5;ctx.stroke();
});
g.pl.forEach((p,i)=>{ctx.globalAlpha=p.stun>0&&Math.floor(p.stun*14)%2?.4:1;g.blob(p,col(i),g.pl[1-i].x,g.pl[1-i].y,p.vx||p.vy,p.has);ctx.globalAlpha=1;});
}
});

/* ---------- 26. TOWER STACK ---------- */
micro({id:"towerGame",title:"Tower Stack",desc:"Drop blocks. Misalign and they get trimmed.",cat:"reflex",key:"tower",win:1,hud:false,
controls:"P1: SPACE drop　 P2: ENTER drop — highest tower wins",
init(g){
g.tw=[0,1].map(i=>({cx:i?675:225,stack:[{x:-90,w:180}],cur:{x:-200,w:180,d:1},sp:150,alive:true,h:0}));
g.tl=0;
},
update(g,dt){
g.tw.forEach((t,i)=>{
if(!t.alive)return;
const c=t.cur;c.x+=c.d*t.sp*dt;
if(c.x>190-c.w*.2){c.d=-1;}if(c.x<-190-c.w*.8){c.d=1;}
if(g.I[i].pa){
const top=t.stack[t.stack.length-1];
const l=Math.max(c.x,top.x),r=Math.min(c.x+c.w,top.x+top.w),w=r-l;
if(w<=2){t.alive=false;g.burst(t.cx+c.x+c.w/2,150,col(i),20,300);FX.playBoom();}
else{
const perfect=Math.abs(c.x-top.x)<5;
t.stack.push({x:perfect?top.x:l,w:perfect?top.w:w});t.h++;
FX.tone(perfect?1000:500+t.h*20,.08,"square",.05);
g.burst(t.cx+l+w/2,330,col(i),6,150);
t.cur={x:-220,w:perfect?top.w:w,d:1};t.sp=Math.min(380,150+t.h*9);
}
}
});
g.tl+=dt;
if(g.tw.every(t=>!t.alive)||g.tl>75){g.endT=(g.endT||0)+dt;if(g.endT>1)g.byScore(g.tw.map(t=>t.h));}
},
draw(g,ctx){
ctx.fillStyle="#12183a";ctx.fillRect(0,0,W,H);
for(let k=0;k<40;k++){ctx.fillStyle="#2a3a6a";ctx.fillRect((k*97)%W,(k*61)%H,2,2);}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
g.tw.forEach((t,i)=>{
const camY=Math.max(0,(t.stack.length-6)*24);
ctx.save();ctx.beginPath();ctx.rect(i*450,0,450,H);ctx.clip();
ctx.fillStyle="#2a3a2a";ctx.fillRect(i*450,470+camY,450,40);
t.stack.forEach((b,k)=>{
const y=446-k*24+camY;
ctx.fillStyle=`hsl(${(k*28+(i?300:190))%360},70%,${k===0?35:58}%)`;ctx.fillRect(t.cx+b.x,y,b.w,22);
ctx.fillStyle="rgba(255,255,255,.3)";ctx.fillRect(t.cx+b.x,y,b.w,4);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(t.cx+b.x,y,b.w,22);
});
if(t.alive){const y=446-t.stack.length*24+camY;ctx.fillStyle=col(i);ctx.fillRect(t.cx+t.cur.x,y,t.cur.w,22);ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.strokeRect(t.cx+t.cur.x,y,t.cur.w,22);}
ctx.restore();
g.text("P"+(i+1)+"  HEIGHT "+t.h,t.cx,36,20,col(i),"center");
if(!t.alive)g.text("TOPPLED",t.cx,70,18,RED,"center");
});
}
});

/* ---------- 27. PIXEL BOXING ---------- */
micro({id:"boxingGame",title:"Pixel Boxing",desc:"Jab, block, knock them out",cat:"action",key:"boxing",win:2,
controls:"P1: A/D move, SPACE punch, S block　 P2: ←/→ move, ENTER punch, ↓ block",
round(g){
g.bx=[{x:230,hp:100,cd:0,pu:0,bl:false,hit:0,dir:1},{x:670,hp:100,cd:0,pu:0,bl:false,hit:0,dir:-1}];
},
update(g,dt){
g.bx.forEach((b,i)=>{
const I=g.I[i],o=g.bx[1-i];
b.cd=Math.max(0,b.cd-dt);b.pu=Math.max(0,b.pu-dt);b.hit=Math.max(0,b.hit-dt);
b.bl=I.d&&b.pu<=0&&b.hit<=0;
b.dir=o.x>b.x?1:-1;
if(!b.bl&&b.hit<=0&&b.pu<=0){b.x+=((I.r?1:0)-(I.l?1:0))*170*dt;}
b.x=clamp(b.x,90,810);
if(I.pa&&b.cd<=0&&!b.bl&&b.hit<=0){
b.cd=.5;b.pu=.2;FX.tone(300,.06,"sawtooth",.03,-100);
if(Math.abs(o.x-b.x)<82){
const dmg=o.bl&&o.dir===-b.dir?3:11;
o.hp-=dmg;o.x+=b.dir*(o.bl?8:26);o.hit=o.bl?0:.28;
g.burst(o.x,385,o.bl?"#9fc0ff":"#fff",o.bl?5:14,o.bl?160:340);
if(o.bl)FX.tone(200,.06,"square",.04);else playHitSound();
if(o.hp<=0){g.burst(o.x,380,col(1-i),30,420);g.point(i,"K.O.!");}
}
}
});
const [a,b]=g.bx;
if(Math.abs(a.x-b.x)<46){const o=(46-Math.abs(a.x-b.x))/2;if(a.x<b.x){a.x-=o;b.x+=o;}else{a.x+=o;b.x-=o;}}
},
draw(g,ctx){
const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#2a1a3a");gr.addColorStop(1,"#4a2a3a");ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
ctx.fillStyle="#6a3a2a";ctx.fillRect(0,420,W,80);ctx.fillStyle="#8a4a3a";ctx.fillRect(0,420,W,6);
ctx.fillStyle="rgba(255,255,255,.08)";for(let k=0;k<12;k++)ctx.fillRect(k*80+10,20+(k%3)*18,40,40);
[[50,420],[850,420]].forEach(([x,y])=>{ctx.fillStyle="#bbb";ctx.fillRect(x-5,y-170,10,170);});
["#ff4a4a","#fff","#4a8aff"].forEach((c,k)=>{ctx.fillStyle=c;ctx.fillRect(50,250+k*50,800,5);});
g.bx.forEach((b,i)=>{
ctx.save();ctx.translate(b.x,420);ctx.scale(b.dir,1);
const lean=b.hit>0?-8:b.pu>0?6:0;
ctx.save();ctx.translate(-22+lean,-68);ctx.scale(2,2);
if(b.hit>0&&Math.floor(b.hit*30)%2)ctx.globalAlpha=.5;
FX.drawFighter(ctx,22,34,col(i),1,false,b.hit>0);
ctx.restore();ctx.globalAlpha=1;
ctx.fillStyle=col(i);
if(b.bl){ctx.fillStyle="#fff";ctx.fillRect(10,-62,18,36);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(10,-62,18,36);}
else{const ext=b.pu>0?60:14;ctx.fillStyle="#e83a3a";ctx.fillRect(14+lean,-48,ext,16);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(14+lean,-48,ext,16);ctx.fillStyle="#fff";ctx.fillRect(14+lean+ext-4,-46,4,12);}
ctx.restore();
ctx.fillStyle="#080b18";ctx.fillRect(i?W-340:40,50,300,20);ctx.fillStyle=col(i);
const w=296*Math.max(0,b.hp)/100;ctx.fillRect(i?W-42-w:42,52,w,16);
ctx.strokeStyle="#9fc0ff";ctx.lineWidth=2;ctx.strokeRect(i?W-340:40,50,300,20);
});
}
});

/* ---------- 28. COPYCAT ---------- */
micro({id:"copycatGame",title:"Copycat",desc:"Watch the pattern, repeat it faster",cat:"brain",key:"copycat",win:3,
controls:"P1: W/A/S/D　 P2: ARROWS — memorize the arrows, then type them first. Mistakes lock you out.",
round(g){
const n=3+Math.min(5,Math.floor((g.score[0]+g.score[1])/1.5));
g.seq=Array.from({length:n},()=>ri(0,3));g.phase="show";g.si=0;g.st=.6;g.idx=[0,0];g.lock=[0,0];
},
update(g,dt){
if(g.phase==="show"){
g.st-=dt;
if(g.st<=0){
if(g.si<g.seq.length){g.cur=g.seq[g.si];FX.tone([440,523,659,784][g.cur],.25,"triangle",.06);g.si++;g.st=.55;g.flash=.4;}
else if(g.cur!==-1){g.cur=-1;g.st=.4;}
else{g.phase="go";g.banner_("GO!",GOLD,.6);}
}
if(g.flash>0)g.flash-=dt;
return;
}
for(let i=0;i<2;i++){
g.lock[i]=Math.max(0,g.lock[i]-dt);
if(g.lock[i]>0)continue;
const I=g.I[i];
const k=I.pl?0:I.pu?1:I.pr?2:I.pd?3:-1;
if(k<0)continue;
FX.tone([440,523,659,784][k],.08,"triangle",.04);
if(k===g.seq[g.idx[i]]){g.idx[i]++;if(g.idx[i]>=g.seq.length){g.point(i);return;}}
else{g.lock[i]=1.4;g.idx[i]=0;FX.tone(120,.3,"sawtooth",.05,-40);}
}
},
draw(g,ctx){
ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
const A=["◀","▲","▶","▼"];
g.text("PATTERN: "+g.seq.length,W/2,70,22,GOLD,"center");
if(g.phase==="show"){
ctx.font="190px Courier New";ctx.textAlign="center";ctx.fillStyle=g.cur>=0?["#ff6a6a","#6aff8a","#6ab0ff","#ffd24a"][g.cur]:"#2a2450";
ctx.fillText(g.cur>=0?A[g.cur]:"●",W/2,320);ctx.textAlign="left";
g.text("WATCH...",W/2,400,24,"#fff","center");
}else{
for(let i=0;i<2;i++){
const cx=i?675:225;
ctx.fillStyle=i?"#2a1a4a":"#14305a";ctx.fillRect(cx-170,110,340,300);ctx.strokeStyle=col(i);ctx.lineWidth=3;ctx.strokeRect(cx-170,110,340,300);
g.text("P"+(i+1),cx,140,22,col(i),"center");
const per=g.seq.length;
for(let k=0;k<per;k++){ctx.fillStyle=k<g.idx[i]?GREEN:"#2a2f63";ctx.fillRect(cx-per*14+k*28,200,22,22);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(cx-per*14+k*28,200,22,22);}
g.text(g.lock[i]>0?"LOCKED "+g.lock[i].toFixed(1):g.idx[i]+" / "+per,cx,300,g.lock[i]>0?26:30,g.lock[i]>0?RED:"#fff","center");
}
}
}
});

/* ---------- 29. MOLE MASH ---------- */
const MK=[["q","w","e","a","s","d","z","x","c"],["u","i","o","j","k","l","m",",","."]];
micro({id:"moleGame",title:"Mole Mash",desc:"Hit the right key before your rival",cat:"reflex",key:"mole",win:10,
controls:"P1 keys: Q W E / A S D / Z X C　 P2 keys: U I O / J K L / M , .  — first to 10 whacks",
round(g){g.hole=-1;g.tm=.7;g.lock=[0,0];g.cool=[0,0];g.gold=false;},
init(g){g.hole=-1;g.tm=.7;g.lock=[0,0];g.pop=0;},
update(g,dt){
g.pop+=dt;
g.lock=g.lock.map(x=>Math.max(0,x-dt));
g.tm-=dt;
if(g.tm<=0){
if(g.hole<0){g.hole=ri(0,8);g.gold=Math.random()<.15;g.tm=rnd(.9,1.5);g.pop=0;}
else{g.hole=-1;g.tm=rnd(.25,.6);}
}
for(let i=0;i<2;i++){
if(g.lock[i]>0)continue;
for(let k=0;k<9;k++){
if(!g.pk[MK[i][k]])continue;
if(k===g.hole){
const v=g.gold?2:1;
for(let n=0;n<v;n++)g.add(i);
g.burst(300+(k%3)*150,150+Math.floor(k/3)*110,col(i),12,260);FX.tone(g.gold?1100:800,.08,"square",.05,300);
g.hole=-1;g.tm=rnd(.3,.6);
}else{g.lock[i]=.5;FX.tone(130,.15,"sawtooth",.04,-40);}
}
}
},
draw(g,ctx){
ctx.fillStyle="#2a5a2a";ctx.fillRect(0,0,W,H);
ctx.fillStyle="#2f6a30";for(let x=0;x<W;x+=60)ctx.fillRect(x,0,30,H);
for(let k=0;k<9;k++){
const x=300+(k%3)*150,y=150+Math.floor(k/3)*110;
ctx.fillStyle="#1a0f08";ctx.beginPath();ctx.ellipse(x,y+10,48,18,0,0,Math.PI*2);ctx.fill();
if(g.hole===k){
const up=Math.min(1,g.pop/.12);
ctx.save();ctx.beginPath();ctx.rect(x-60,y-70,120,80);ctx.clip();
ctx.fillStyle=g.gold?GOLD:"#8a5a3a";ctx.fillRect(x-28,y-50+(1-up)*60,56,60);ctx.beginPath();ctx.arc(x,y-50+(1-up)*60,28,Math.PI,0);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(x-28,y-50+(1-up)*60,56,60);
ctx.fillStyle="#fff";ctx.fillRect(x-16,y-48+(1-up)*60,10,10);ctx.fillRect(x+6,y-48+(1-up)*60,10,10);ctx.fillStyle="#11152b";ctx.fillRect(x-12,y-44+(1-up)*60,5,5);ctx.fillRect(x+10,y-44+(1-up)*60,5,5);
ctx.fillStyle="#e8a8a8";ctx.fillRect(x-6,y-34+(1-up)*60,12,8);
ctx.restore();
}
ctx.fillStyle="#2f1a0d";ctx.fillRect(x-48,y+6,96,8);
g.text(MK[0][k].toUpperCase(),x-70,y+6,18,C1,"center");
g.text(MK[1][k].toUpperCase(),x+70,y+6,18,C2,"center");
}
for(let i=0;i<2;i++){
g.text("P"+(i+1)+"  "+g.score[i]+" / 10",i?W-20:20,40,22,col(i),i?"right":"left");
if(g.lock[i]>0)g.text("OOPS!",i?675:225,460,22,RED,"center");
}
}
});

/* ---------- 30. DOTS AND BOXES ---------- */
function dotsEdge(g,x,y){
let best=null,bd=22;
for(let r=0;r<=g.rows;r++)for(let c=0;c<g.cols;c++){
if(g.hl[r][c]>=0)continue;
const d=Math.hypot(x-(g.ox+c*g.sp+g.sp/2),y-(g.oy+r*g.sp));if(d<bd){bd=d;best={t:"h",r,c};}
}
for(let r=0;r<g.rows;r++)for(let c=0;c<=g.cols;c++){
if(g.vl[r][c]>=0)continue;
const d=Math.hypot(x-(g.ox+c*g.sp),y-(g.oy+r*g.sp+g.sp/2));if(d<bd){bd=d;best={t:"v",r,c};}
}
return best;
}
micro({id:"dotsGame",title:"Dots and Boxes",desc:"Claim boxes. Completing one gives another turn.",cat:"board",key:"dots",win:1,hud:false,
controls:"Click between two dots to draw a line. Close a box to claim it and go again.",
init(g){
g.cols=6;g.rows=5;g.sp=90;g.ox=180;g.oy=50;
g.hl=Array.from({length:g.rows+1},()=>new Array(g.cols).fill(-1));
g.vl=Array.from({length:g.rows},()=>new Array(g.cols+1).fill(-1));
g.bx=Array.from({length:g.rows},()=>new Array(g.cols).fill(-1));
g.turn=0;g.sc=[0,0];g.hv=null;g.msg.textContent="P1'S TURN";
},
update(){},
move(g,x,y){g.hv=dotsEdge(g,x,y);},
click(g,x,y){
const e=dotsEdge(g,x,y);if(!e)return;
(e.t==="h"?g.hl:g.vl)[e.r][e.c]=g.turn;
FX.tone(400+g.turn*120,.07,"triangle",.06);
let got=0;
for(let r=0;r<g.rows;r++)for(let c=0;c<g.cols;c++){
if(g.bx[r][c]<0&&g.hl[r][c]>=0&&g.hl[r+1][c]>=0&&g.vl[r][c]>=0&&g.vl[r][c+1]>=0){
g.bx[r][c]=g.turn;g.sc[g.turn]++;got++;g.burst(g.ox+c*g.sp+g.sp/2,g.oy+r*g.sp+g.sp/2,col(g.turn),10,200);
}
}
if(got){FX.playScore();}
if(g.sc[0]+g.sc[1]===g.rows*g.cols){g.byScore(g.sc);return;}
if(!got)g.turn=1-g.turn;
g.msg.textContent=`P${g.turn+1}'S TURN`;
},
draw(g,ctx){
ctx.fillStyle="#12183a";ctx.fillRect(0,0,W,H);
for(let r=0;r<g.rows;r++)for(let c=0;c<g.cols;c++){
if(g.bx[r][c]>=0){ctx.fillStyle=g.bx[r][c]?"rgba(255,114,200,.45)":"rgba(100,234,255,.45)";ctx.fillRect(g.ox+c*g.sp+4,g.oy+r*g.sp+4,g.sp-8,g.sp-8);g.text("P"+(g.bx[r][c]+1),g.ox+c*g.sp+g.sp/2,g.oy+r*g.sp+g.sp/2+7,20,"#fff","center");}
}
const hv=g.hv;
for(let r=0;r<=g.rows;r++)for(let c=0;c<g.cols;c++){
const o=g.hl[r][c],x=g.ox+c*g.sp,y=g.oy+r*g.sp,isH=hv&&hv.t==="h"&&hv.r===r&&hv.c===c;
if(o>=0||isH){ctx.strokeStyle=o>=0?col(o):col(g.turn);ctx.globalAlpha=o>=0?1:.5;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x+8,y);ctx.lineTo(x+g.sp-8,y);ctx.stroke();ctx.globalAlpha=1;}
}
for(let r=0;r<g.rows;r++)for(let c=0;c<=g.cols;c++){
const o=g.vl[r][c],x=g.ox+c*g.sp,y=g.oy+r*g.sp,isH=hv&&hv.t==="v"&&hv.r===r&&hv.c===c;
if(o>=0||isH){ctx.strokeStyle=o>=0?col(o):col(g.turn);ctx.globalAlpha=o>=0?1:.5;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x,y+8);ctx.lineTo(x,y+g.sp-8);ctx.stroke();ctx.globalAlpha=1;}
}
ctx.fillStyle="#fff";
for(let r=0;r<=g.rows;r++)for(let c=0;c<=g.cols;c++){ctx.beginPath();ctx.arc(g.ox+c*g.sp,g.oy+r*g.sp,6,0,Math.PI*2);ctx.fill();}
g.text("P1  "+g.sc[0],20,40,24,C1);g.text("P2  "+g.sc[1],W-20,40,24,C2,"right");
if(g.mode==="play")g.text(`P${g.turn+1}'S TURN`,W/2,486,16,col(g.turn),"center");
}
});
})();