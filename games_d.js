/* =====================================================
   GAME PACK D — 8 board & brain games
   Reversi, Nim, Mancala, Pig, Checkers,
   Quick Math, Color Clash, Shell Game
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri}=PD;
const col=i=>i?C2:C1;

/* ---------- REVERSI ---------- */
const R8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const inb=(x,y)=>x>=0&&y>=0&&x<8&&y<8;
function rflips(b,x,y,p){
if(b[y*8+x]>=0)return[];
const out=[];
for(const [dx,dy] of R8){
const line=[];let cx=x+dx,cy=y+dy;
while(inb(cx,cy)&&b[cy*8+cx]===1-p){line.push(cy*8+cx);cx+=dx;cy+=dy;}
if(line.length&&inb(cx,cy)&&b[cy*8+cx]===p)out.push(...line);
}
return out;
}
function rany(b,p){for(let i=0;i<64;i++)if(rflips(b,i%8,Math.floor(i/8),p).length)return true;return false;}
micro({id:"reversiGame",title:"Reversi",desc:"Flip your rival's discs, own the board",cat:"board",key:"reversi",win:1,hud:false,
controls:"Click a highlighted square. Trap rival discs between yours to flip them. Most discs wins.",
init(g){
g.b=new Array(64).fill(-1);g.b[27]=1;g.b[36]=1;g.b[28]=0;g.b[35]=0;g.turn=0;
g.msg.textContent="P1'S TURN";
},
update(){},
click(g,x,y){
const cx=Math.floor((x-230)/55),cy=Math.floor((y-30)/55);
if(!inb(cx,cy))return;
const f=rflips(g.b,cx,cy,g.turn);
if(!f.length)return;
g.b[cy*8+cx]=g.turn;f.forEach(i=>g.b[i]=g.turn);
FX.tone(350+g.turn*120,.08,"triangle",.06);g.burst(230+cx*55+27,30+cy*55+27,col(g.turn),8,160);
g.turn=1-g.turn;
if(!rany(g.b,g.turn)){
g.turn=1-g.turn;
if(!rany(g.b,g.turn)){g.byScore([g.b.filter(v=>v===0).length,g.b.filter(v=>v===1).length]);return;}
g.banner_(`P${2-g.turn} HAS NO MOVE`,GOLD,1.2);
}
g.msg.textContent=`P${g.turn+1}'S TURN`;
},
draw(g,ctx){
ctx.fillStyle="#12183a";ctx.fillRect(0,0,W,H);
ctx.fillStyle="#1f7a4a";ctx.fillRect(225,25,450,450);
for(let y=0;y<8;y++)for(let x=0;x<8;x++){
ctx.fillStyle=(x+y)%2?"#1b6e42":"#228552";ctx.fillRect(230+x*55,30+y*55,55,55);
const v=g.b[y*8+x];
if(v>=0){
ctx.fillStyle="rgba(0,0,0,.3)";ctx.beginPath();ctx.arc(230+x*55+29,30+y*55+31,22,0,Math.PI*2);ctx.fill();
ctx.fillStyle=col(v);ctx.beginPath();ctx.arc(230+x*55+27,30+y*55+27,22,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
ctx.fillStyle="rgba(255,255,255,.4)";ctx.beginPath();ctx.arc(230+x*55+19,30+y*55+19,6,0,Math.PI*2);ctx.fill();
}else if(g.mode==="play"&&rflips(g.b,x,y,g.turn).length){
ctx.fillStyle="rgba(255,255,255,.35)";ctx.beginPath();ctx.arc(230+x*55+27,30+y*55+27,6,0,Math.PI*2);ctx.fill();
}
}
ctx.strokeStyle="#0a3a22";ctx.lineWidth=2;ctx.strokeRect(230,30,440,440);
g.text("P1  "+g.b.filter(v=>v===0).length,20,60,26,C1);
g.text("P2  "+g.b.filter(v=>v===1).length,W-20,60,26,C2,"right");
if(g.mode==="play")g.text(`P${g.turn+1}'S TURN`,g.turn?W-20:20,92,16,col(g.turn),g.turn?"right":"left");
}
});

/* ---------- NIM ---------- */
micro({id:"nimGame",title:"Nim",desc:"Take 1-3 sticks. Take the last and you lose.",cat:"brain",key:"nim",win:1,hud:false,
controls:"Click TAKE 1, 2 or 3. Whoever takes the LAST stick loses.",
init(g){g.n=21;g.turn=0;g.msg.textContent="P1'S TURN";g.gone=[];},
update(){},
click(g,x,y){
for(let k=1;k<=3;k++){
const bx=230+(k-1)*150;
if(x>bx&&x<bx+130&&y>390&&y<445&&k<=g.n){
for(let i=0;i<k;i++)g.gone.push({x:70+(g.n-1-i)*32,y:250,t:0});
g.n-=k;FX.tone(300+k*80,.08,"square",.05);
if(g.n===0){g.end(1-g.turn);return;}
g.turn=1-g.turn;g.msg.textContent=`P${g.turn+1}'S TURN`;
}
}
},
draw(g,ctx){
ctx.fillStyle="#1a1230";ctx.fillRect(0,0,W,H);
for(let i=0;i<g.n;i++){
const x=70+i*32,last=i>=g.n-3;
ctx.fillStyle="rgba(0,0,0,.3)";ctx.fillRect(x+4,130,14,190);
ctx.fillStyle=last?GOLD:"#c8a46a";ctx.fillRect(x,120,14,190);
ctx.fillStyle="rgba(255,255,255,.35)";ctx.fillRect(x+2,120,3,190);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(x,120,14,190);
}
g.text(g.n+" STICKS LEFT",W/2,80,26,"#fff","center");
for(let k=1;k<=3;k++){
const bx=230+(k-1)*150,ok=k<=g.n&&g.mode==="play";
ctx.fillStyle=ok?col(g.turn):"#2a2f63";ctx.fillRect(bx,390,130,55);ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(bx,390,130,55);
g.text("TAKE "+k,bx+65,425,20,ok?"#080b18":"#6a72a8","center");
}
g.text("P1",30,40,24,C1);g.text("P2",W-30,40,24,C2,"right");
if(g.mode==="play")g.text(`P${g.turn+1}'S TURN`,W/2,360,20,col(g.turn),"center");
}
});

/* ---------- MANCALA ---------- */
const mPos=i=>{
if(i===6)return{x:820,y:260};
if(i===13)return{x:80,y:260};
if(i<6)return{x:200+i*100,y:340};
return{x:200+(5-(i-7))*100,y:180};
};
micro({id:"mancalaGame",title:"Mancala",desc:"Sow stones, capture, grab extra turns",cat:"board",key:"mancala",win:1,hud:false,
controls:"Click one of your pits (P1 bottom, P2 top). Land in your store for another turn. Most stones wins.",
init(g){g.p=[4,4,4,4,4,4,0,4,4,4,4,4,4,0];g.turn=0;g.msg.textContent="P1'S TURN";},
update(){},
click(g,x,y){
const lo=g.turn?7:0;
for(let i=lo;i<lo+6;i++){
const c=mPos(i);
if(Math.hypot(x-c.x,y-c.y)<42&&g.p[i]>0){
let s=g.p[i],j=i;g.p[i]=0;
const own=g.turn?13:6,skip=g.turn?6:13;
while(s>0){j=(j+1)%14;if(j===skip)continue;g.p[j]++;s--;}
FX.tone(400,.06,"triangle",.05);
g.burst(mPos(j).x,mPos(j).y,col(g.turn),6,140);
if(j===own){g.banner_("EXTRA TURN",GOLD,.9);}
else{
const mine=g.turn?(j>=7&&j<=12):(j<=5);
if(mine&&g.p[j]===1&&g.p[12-j]>0){g.p[own]+=g.p[12-j]+1;g.p[j]=0;g.p[12-j]=0;g.banner_("CAPTURE!",GREEN,.9);FX.playScore();}
g.turn=1-g.turn;
}
const a=g.p.slice(0,6).reduce((x,y)=>x+y,0),b=g.p.slice(7,13).reduce((x,y)=>x+y,0);
if(a===0||b===0){g.p[6]+=a;g.p[13]+=b;for(let k=0;k<6;k++){g.p[k]=0;g.p[k+7]=0;}g.byScore([g.p[6],g.p[13]]);return;}
g.msg.textContent=`P${g.turn+1}'S TURN`;
return;
}
}
},
draw(g,ctx){
ctx.fillStyle="#2a1a10";ctx.fillRect(0,0,W,H);
ctx.fillStyle="#7a4a2a";ctx.fillRect(40,100,820,300);ctx.strokeStyle="#3a1f10";ctx.lineWidth=6;ctx.strokeRect(40,100,820,300);
for(let i=0;i<14;i++){
const c=mPos(i),store=i===6||i===13;
ctx.fillStyle="#2a1408";
if(store){ctx.beginPath();ctx.ellipse(c.x,c.y,38,100,0,0,Math.PI*2);ctx.fill();}
else{ctx.beginPath();ctx.arc(c.x,c.y,42,0,Math.PI*2);ctx.fill();}
const mine=g.mode==="play"&&!store&&((g.turn===0&&i<6)||(g.turn===1&&i>=7&&i<=12))&&g.p[i]>0;
if(mine){ctx.strokeStyle=col(g.turn);ctx.lineWidth=3;ctx.beginPath();ctx.arc(c.x,c.y,45,0,Math.PI*2);ctx.stroke();}
const n=g.p[i];
for(let k=0;k<Math.min(n,14);k++){
const a=k*2.4,r=store?(k%7)*11:(k<7?(k%7)*4+8:20);
const sx=store?c.x+((k%3)-1)*14:c.x+Math.cos(a)*Math.min(r,26),sy=store?c.y-70+Math.floor(k/3)*14:c.y+Math.sin(a)*Math.min(r,26);
ctx.fillStyle=["#ff6a6a","#6aff8a","#6ab0ff","#ffd24a","#c46aff"][k%5];ctx.beginPath();ctx.arc(sx,sy,6,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=1.5;ctx.stroke();
}
g.text(String(n),c.x,store?c.y+100+22:c.y+60,18,"#fff","center");
}
g.text("P2 STORE",80,86,14,C2,"center");g.text("P1 STORE",820,86,14,C1,"center");
g.text("P1",30,40,22,C1);g.text("P2",W-30,40,22,C2,"right");
if(g.mode==="play")g.text(`P${g.turn+1}'S TURN`,W/2,60,18,col(g.turn),"center");
}
});

/* ---------- PIG ---------- */
micro({id:"pigGame",title:"Pig",desc:"Push your luck. Roll a 1 and lose it all.",cat:"brain",key:"pig",win:1,hud:false,
controls:"Click ROLL to add to your turn total. Click HOLD to bank it. A roll of 1 wipes your turn. First to 50 wins.",
init(g){g.s=[0,0];g.tot=0;g.turn=0;g.die=0;g.shake=0;g.msg.textContent="P1'S TURN";},
update(g,dt){g.shake=Math.max(0,g.shake-dt);},
click(g,x,y){
if(y<395||y>450)return;
if(x>250&&x<430){
g.die=ri(1,6);g.shake=.35;FX.tone(300+g.die*60,.1,"square",.05);
if(g.die===1){g.tot=0;g.banner_("PIG OUT!",RED,1);g.turn=1-g.turn;FX.tone(120,.3,"sawtooth",.06,-50);}
else g.tot+=g.die;
}else if(x>470&&x<650&&g.tot>0){
g.s[g.turn]+=g.tot;g.tot=0;FX.playScore();
if(g.s[g.turn]>=50){g.end(g.turn);return;}
g.turn=1-g.turn;
}else return;
g.msg.textContent=`P${g.turn+1}'S TURN`;
},
draw(g,ctx){
ctx.fillStyle="#14223a";ctx.fillRect(0,0,W,H);
for(let i=0;i<2;i++){
const cx=i?750:150;
ctx.fillStyle=g.turn===i&&g.mode==="play"?"#1f3a60":"#182a48";ctx.fillRect(cx-110,70,220,200);ctx.strokeStyle=col(i);ctx.lineWidth=g.turn===i?5:2;ctx.strokeRect(cx-110,70,220,200);
g.text("PLAYER "+(i+1),cx,105,20,col(i),"center");
g.text(String(g.s[i]),cx,200,70,"#fff","center");
g.text("/ 50",cx,240,18,"#9fc0ff","center");
}
const jx=W/2+(g.shake>0?Math.sin(g.t*60)*8:0),jy=190+(g.shake>0?Math.cos(g.t*50)*6:0);
ctx.fillStyle="#fff";ctx.fillRect(jx-55,jy-55,110,110);ctx.strokeStyle="#080b18";ctx.lineWidth=4;ctx.strokeRect(jx-55,jy-55,110,110);
const P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
ctx.fillStyle=g.die===1?RED:"#11152b";
(P[g.die]||[]).forEach(([a,b])=>{ctx.beginPath();ctx.arc(jx+a*28,jy+b*28,9,0,Math.PI*2);ctx.fill();});
g.text("TURN TOTAL: "+g.tot,W/2,330,26,GOLD,"center");
ctx.fillStyle=col(g.turn);ctx.fillRect(250,395,180,55);ctx.fillStyle="#2a2f63";ctx.fillRect(470,395,180,55);
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(250,395,180,55);ctx.strokeRect(470,395,180,55);
g.text("ROLL",340,432,24,"#080b18","center");g.text("HOLD",560,432,24,g.tot>0?"#fff":"#6a72a8","center");
}
});

/* ---------- CHECKERS ---------- */
const DG=[[-1,-1],[1,-1],[-1,1],[1,1]];
function cmoves(b,x,y){
const pc=b[y*8+x],mv=[],cp=[];
const dirs=pc.k?DG:(pc.p===0?[DG[0],DG[1]]:[DG[2],DG[3]]);
for(const [dx,dy] of dirs){
const nx=x+dx,ny=y+dy;
if(!inb(nx,ny))continue;
const t=b[ny*8+nx];
if(!t)mv.push({x:nx,y:ny});
else if(t.p!==pc.p){const jx=nx+dx,jy=ny+dy;if(inb(jx,jy)&&!b[jy*8+jx])cp.push({x:jx,y:jy,cx:nx,cy:ny});}
}
return{mv,cp};
}
function cside(b,p){
let anyCap=false,anyMove=false;
for(let i=0;i<64;i++){const pc=b[i];if(pc&&pc.p===p){const m=cmoves(b,i%8,Math.floor(i/8));if(m.cp.length)anyCap=true;if(m.mv.length)anyMove=true;}}
return{anyCap,anyMove};
}
micro({id:"checkersGame",title:"Checkers",desc:"Jump, crown, and corner your rival",cat:"board",key:"checkers",win:1,hud:false,
controls:"Click a piece, then click where it goes. Captures are mandatory. Reach the far row to crown a king.",
init(g){
g.b=new Array(64).fill(null);
for(let y=0;y<8;y++)for(let x=0;x<8;x++){
if((x+y)%2===1){if(y<3)g.b[y*8+x]={p:1,k:false};if(y>4)g.b[y*8+x]={p:0,k:false};}
}
g.turn=0;g.sel=null;g.chain=false;g.msg.textContent="P1'S TURN";
},
update(){},
allowed(g){
if(!g.sel)return[];
const m=cmoves(g.b,g.sel.x,g.sel.y),must=g.chain||cside(g.b,g.turn).anyCap;
return must?m.cp:m.mv;
},
click(g,x,y){
const cx=Math.floor((x-230)/55),cy=Math.floor((y-30)/55);
if(!inb(cx,cy))return;
const pc=g.b[cy*8+cx];
const ok=gAllowed(g);
const tgt=ok.find(m=>m.x===cx&&m.y===cy);
if(tgt){
const p=g.b[g.sel.y*8+g.sel.x];
g.b[g.sel.y*8+g.sel.x]=null;g.b[cy*8+cx]=p;
let cap=false;
if(tgt.cx!==undefined){g.b[tgt.cy*8+tgt.cx]=null;cap=true;g.burst(230+tgt.cx*55+27,30+tgt.cy*55+27,col(1-g.turn),10,220);playHitSound();}
else FX.tone(380,.06,"triangle",.05);
if((p.p===0&&cy===0)||(p.p===1&&cy===7)){if(!p.k){p.k=true;g.banner_("KING!",GOLD,.8);FX.playScore();}}
g.sel={x:cx,y:cy};
if(cap&&cmoves(g.b,cx,cy).cp.length&&!(tgt.king)){g.chain=true;return;}
g.chain=false;g.sel=null;g.turn=1-g.turn;
const s=cside(g.b,g.turn);
if(!s.anyCap&&!s.anyMove){g.end(1-g.turn);return;}
g.msg.textContent=`P${g.turn+1}'S TURN`;
return;
}
if(g.chain)return;
if(pc&&pc.p===g.turn){
const m=cmoves(g.b,cx,cy),must=cside(g.b,g.turn).anyCap;
if((must?m.cp:m.mv).length)g.sel={x:cx,y:cy};
}
},
draw(g,ctx){
ctx.fillStyle="#12183a";ctx.fillRect(0,0,W,H);
const ok=g.sel?gAllowed(g):[];
for(let y=0;y<8;y++)for(let x=0;x<8;x++){
ctx.fillStyle=(x+y)%2?"#6a3a2a":"#e8c898";ctx.fillRect(230+x*55,30+y*55,55,55);
if(g.sel&&g.sel.x===x&&g.sel.y===y){ctx.fillStyle="rgba(255,230,109,.5)";ctx.fillRect(230+x*55,30+y*55,55,55);}
if(ok.some(m=>m.x===x&&m.y===y)){ctx.fillStyle="rgba(99,245,154,.5)";ctx.fillRect(230+x*55,30+y*55,55,55);}
const pc=g.b[y*8+x];
if(pc){
const px=230+x*55+27,py=30+y*55+27;
ctx.fillStyle="rgba(0,0,0,.35)";ctx.beginPath();ctx.arc(px+2,py+4,21,0,Math.PI*2);ctx.fill();
ctx.fillStyle=col(pc.p);ctx.beginPath();ctx.arc(px,py,21,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
ctx.strokeStyle="rgba(255,255,255,.4)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,14,0,Math.PI*2);ctx.stroke();
if(pc.k)g.text("♛",px,py+9,24,"#fff","center");
}
}
ctx.strokeStyle="#080b18";ctx.lineWidth=4;ctx.strokeRect(230,30,440,440);
const c=[0,0];g.b.forEach(p=>{if(p)c[p.p]++;});
g.text("P1  "+c[0],20,60,24,C1);g.text("P2  "+c[1],W-20,60,24,C2,"right");
if(g.mode==="play")g.text(`P${g.turn+1}'S TURN`,g.turn?W-20:20,92,16,col(g.turn),g.turn?"right":"left");
}
});
function gAllowed(g){
if(!g.sel)return[];
const m=cmoves(g.b,g.sel.x,g.sel.y),must=g.chain||cside(g.b,g.turn).anyCap;
return must?m.cp:m.mv;
}

/* ---------- QUICK MATH ---------- */
micro({id:"mathGame",title:"Quick Math",desc:"First to the right answer scores",cat:"brain",key:"math",win:5,
controls:"P1: A / W / D pick left / middle / right　 P2: ← / ↑ / →　 wrong answers lock you out for a second",
round(g){
const op=ri(0,2),a=ri(2,12),b=ri(2,12);
let ans,q;
if(op===0){ans=a+b;q=`${a} + ${b}`;}else if(op===1){ans=a*2+b;q=`${a} × 2 + ${b}`;}else{ans=a*b;q=`${a} × ${b}`;}
const opts=[ans];
while(opts.length<3){const w=ans+ri(-9,9);if(w!==ans&&w>0&&!opts.includes(w))opts.push(w);}
opts.sort(()=>Math.random()-.5);
g.q=q;g.opts=opts;g.ans=ans;g.lock=[0,0];g.tl=9;
},
update(g,dt){
g.tl-=dt;
if(g.tl<=0){g.next("TIME UP");return;}
for(let i=0;i<2;i++){
g.lock[i]=Math.max(0,g.lock[i]-dt);
if(g.lock[i]>0)continue;
const I=g.I[i],k=I.pl?0:I.pu?1:I.pr?2:-1;
if(k<0)continue;
if(g.opts[k]===g.ans){g.point(i);return;}
g.lock[i]=1;FX.tone(120,.2,"sawtooth",.05,-40);
}
},
draw(g,ctx){
ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
g.text(g.q+" = ?",W/2,170,80,"#fff","center");
g.opts.forEach((o,k)=>{
const x=170+k*280;
ctx.fillStyle="#2a2f63";ctx.fillRect(x-90,260,180,110);ctx.strokeStyle=GOLD;ctx.lineWidth=3;ctx.strokeRect(x-90,260,180,110);
g.text(String(o),x,335,54,"#fff","center");
g.text(["◀","▲","▶"][k],x,395,20,"#9fc0ff","center");
});
for(let i=0;i<2;i++)if(g.lock[i]>0)g.text("P"+(i+1)+" LOCKED",i?W-110:110,450,18,RED,"center");
ctx.fillStyle="#2a2f63";ctx.fillRect(250,445,400,10);ctx.fillStyle=GOLD;ctx.fillRect(250,445,400*Math.max(0,g.tl)/9,10);
}
});

/* ---------- COLOR CLASH ---------- */
const CN=["RED","GREEN","BLUE"],CH=["#ff4a4a","#4aff7a","#4a8aff"];
micro({id:"clashGame",title:"Color Clash",desc:"Read the COLOR of the word, not the word",cat:"brain",key:"clash",win:5,
controls:"Press the button for the INK color. P1: A red, W green, D blue　 P2: ← red, ↑ green, → blue",
round(g){
g.word=ri(0,2);g.ink=ri(0,2);if(Math.random()<.8)while(g.ink===g.word)g.ink=ri(0,2);
g.lock=[0,0];g.tl=7;
},
update(g,dt){
g.tl-=dt;
if(g.tl<=0){g.next("TIME UP");return;}
for(let i=0;i<2;i++){
g.lock[i]=Math.max(0,g.lock[i]-dt);
if(g.lock[i]>0)continue;
const I=g.I[i],k=I.pl?0:I.pu?1:I.pr?2:-1;
if(k<0)continue;
if(k===g.ink){g.point(i);return;}
g.lock[i]=1;FX.tone(120,.2,"sawtooth",.05,-40);
}
},
draw(g,ctx){
ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
g.text(CN[g.word],W/2,230,130,CH[g.ink],"center");
CN.forEach((n,k)=>{
const x=170+k*280;
ctx.fillStyle=CH[k];ctx.fillRect(x-90,310,180,80);ctx.strokeStyle="#080b18";ctx.lineWidth=4;ctx.strokeRect(x-90,310,180,80);
g.text(["◀","▲","▶"][k]+" "+n,x,360,22,"#080b18","center");
});
for(let i=0;i<2;i++)if(g.lock[i]>0)g.text("P"+(i+1)+" LOCKED",i?W-110:110,450,18,RED,"center");
ctx.fillStyle="#2a2f63";ctx.fillRect(250,445,400,10);ctx.fillStyle=GOLD;ctx.fillRect(250,445,400*Math.max(0,g.tl)/7,10);
}
});

/* ---------- SHELL GAME ---------- */
const SX=[300,450,600];
micro({id:"shellGame",title:"Shell Game",desc:"Follow the ball, pick the right cup",cat:"brain",key:"shell",win:3,
controls:"Watch the cups, then pick: P1: A / W / D (left / middle / right)　 P2: ← / ↑ / →",
round(g){
const n=5+Math.min(6,g.score[0]+g.score[1]*1);
g.slot=[0,1,2];g.ball=ri(0,2);g.swaps=[];
for(let i=0;i<n;i++){let a=ri(0,2),b=ri(0,2);while(b===a)b=ri(0,2);g.swaps.push([a,b]);}
g.stage="show";g.st=1.3;g.si=0;g.ch=[-1,-1];g.rev=false;g.sw=null;
},
update(g,dt){
if(g.stage==="show"){g.st-=dt;if(g.st<=0){g.stage="shuffle";g.sw={t:0};}return;}
if(g.stage==="shuffle"){
const dur=Math.max(.16,.38-g.swaps.length*.012);
g.sw.t+=dt;
if(g.sw.t>=dur){
const [a,b]=g.swaps[g.si];
const ca=g.slot.indexOf(a),cb=g.slot.indexOf(b);
g.slot[ca]=b;g.slot[cb]=a;
g.si++;g.sw={t:0};FX.tone(300,.04,"square",.02);
if(g.si>=g.swaps.length){g.stage="pick";g.sw=null;g.banner_("PICK!",GOLD,.6);}
}
return;
}
for(let i=0;i<2;i++){
if(g.ch[i]>=0)continue;
const I=g.I[i],k=I.pl?0:I.pu?1:I.pr?2:-1;
if(k>=0){g.ch[i]=k;FX.tone(500,.06,"square",.04);}
}
if(g.ch[0]>=0&&g.ch[1]>=0){
g.rev=true;
const r=g.ch.map(c=>g.slot[c]===g.ball);
if(r[0]&&!r[1])g.point(0);else if(r[1]&&!r[0])g.point(1);else g.next(r[0]?"BOTH RIGHT":"BOTH WRONG");
}
},
draw(g,ctx){
ctx.fillStyle="#1d1a3a";ctx.fillRect(0,0,W,H);
ctx.fillStyle="#3a2a1a";ctx.fillRect(150,340,600,40);ctx.fillStyle="#5a3f26";ctx.fillRect(150,340,600,8);
const pos=[0,1,2].map(slot=>SX[slot]);
const cx=new Array(3).fill(0),cy=new Array(3).fill(0);
for(let c=0;c<3;c++){cx[c]=SX[g.slot.indexOf(c)];}
if(g.stage==="shuffle"&&g.sw){
const dur=Math.max(.16,.38-g.swaps.length*.012),e=Math.min(1,g.sw.t/dur),[a,b]=g.swaps[g.si];
const sa=g.slot.indexOf(a),sb=g.slot.indexOf(b);
cx[a]=SX[sa]+(SX[sb]-SX[sa])*e;cx[b]=SX[sb]+(SX[sa]-SX[sb])*e;
cy[a]=-Math.sin(e*Math.PI)*40;cy[b]=Math.sin(e*Math.PI)*28;
}
for(let c=0;c<3;c++){
const lifted=(g.stage==="show"&&c===g.ball)||(g.rev&&c===g.ball);
const x=cx[c],y=300+cy[c]-(lifted?60:0);
if(c===g.ball&&(lifted||g.stage==="show")){ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(x,340,16,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();}
ctx.fillStyle="#c8503a";ctx.beginPath();ctx.moveTo(x-48,y+40);ctx.lineTo(x-34,y-34);ctx.lineTo(x+34,y-34);ctx.lineTo(x+48,y+40);ctx.closePath();ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=4;ctx.stroke();ctx.fillStyle="rgba(255,255,255,.25)";ctx.fillRect(x-30,y-30,10,60);
}
if(g.stage==="show")g.text("REMEMBER THE BALL",W/2,120,26,"#fff","center");
else if(g.stage==="shuffle")g.text("FOLLOW IT...",W/2,120,26,"#fff","center");
else for(let i=0;i<2;i++)g.text("P"+(i+1)+(g.ch[i]>=0?" ✓":" ?"),i?W-120:120,120,24,col(i),"center");
}
});
})();
