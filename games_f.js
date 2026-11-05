/* =====================================================
   GAME PACK F — 15 games
   Hex, Minefield, 2048 Duel, Chomp, Chain Reaction, Odd Tile,
   Super Tic-Tac-Toe, Tennis, Curling, Mini Golf, Ski Slalom,
   Hammer Throw, Long Jump, Brick Duel, Knife Toss
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

/* ---------- HEX ---------- */
const HX=9,HN=[[0,1],[0,-1],[1,0],[-1,0],[-1,1],[1,-1]];
const hexXY=(r,c)=>({x:164+c*44+r*22,y:70+r*38});
function hexWin(b,p){
const seen=new Set(),st=[];
for(let k=0;k<HX;k++){const r=p===0?0:k,c=p===0?k:0;if(b[r*HX+c]===p){st.push([r,c]);seen.add(r*HX+c);}}
while(st.length){
const [r,c]=st.pop();
if(p===0?r===HX-1:c===HX-1)return true;
for(const [dr,dc] of HN){
const nr=r+dr,nc=c+dc;if(nr<0||nc<0||nr>=HX||nc>=HX)continue;
const k=nr*HX+nc;if(b[k]===p&&!seen.has(k)){seen.add(k);st.push([nr,nc]);}
}
}
return false;
}
micro({id:"hexGame",title:"Hex",desc:"Connect your two sides first. No draws.",cat:"board",key:"hex",win:1,hud:false,
controls:"Click a hex to claim it. P1 (cyan) connects TOP to BOTTOM. P2 (pink) connects LEFT to RIGHT.",
init(g){g.b=new Array(HX*HX).fill(-1);g.turn=0;g.msg.textContent="P1'S TURN";},
update(){},
click(g,x,y){
let best=-1,bd=24;
for(let r=0;r<HX;r++)for(let c=0;c<HX;c++){const p=hexXY(r,c),d=Math.hypot(x-p.x,y-p.y);if(d<bd&&g.b[r*HX+c]<0){bd=d;best=r*HX+c;}}
if(best<0)return;
g.b[best]=g.turn;const p=hexXY(Math.floor(best/HX),best%HX);
g.burst(p.x,p.y,col(g.turn),6,120);FX.tone(300+g.turn*120,.07,"triangle",.06);
if(hexWin(g.b,g.turn)){g.end(g.turn);return;}
g.turn=1-g.turn;g.msg.textContent=`P${g.turn+1}'S TURN`;
},
draw(g,ctx){
ctx.fillStyle="#12183a";ctx.fillRect(0,0,W,H);
const hexPath=(x,y,r)=>{ctx.beginPath();for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;ctx[k?"lineTo":"moveTo"](x+Math.cos(a)*r,y+Math.sin(a)*r);}ctx.closePath();};
const a=hexXY(0,0),b=hexXY(HX-1,HX-1),c=hexXY(0,HX-1),d=hexXY(HX-1,0);
ctx.lineWidth=8;ctx.strokeStyle=C1;ctx.beginPath();ctx.moveTo(a.x-20,a.y-30);ctx.lineTo(c.x+20,c.y-30);ctx.moveTo(d.x-20,d.y+30);ctx.lineTo(b.x+20,b.y+30);ctx.stroke();
ctx.strokeStyle=C2;ctx.beginPath();ctx.moveTo(a.x-30,a.y-14);ctx.lineTo(d.x-30,d.y+14);ctx.moveTo(c.x+30,c.y-14);ctx.lineTo(b.x+30,b.y+14);ctx.stroke();
for(let r=0;r<HX;r++)for(let k=0;k<HX;k++){
const p=hexXY(r,k),v=g.b[r*HX+k];
hexPath(p.x,p.y,24);ctx.fillStyle=v<0?"#222c5a":col(v);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
if(v>=0){ctx.fillStyle="rgba(255,255,255,.3)";hexPath(p.x-3,p.y-3,10);ctx.fill();}
}
g.text("P1 ▲▼",20,36,22,C1);g.text("◀▶ P2",W-20,36,22,C2,"right");
if(g.mode==="play")g.text(`P${g.turn+1}'S TURN`,W/2,36,18,col(g.turn),"center");
}
});

/* ---------- MINEFIELD ---------- */
micro({id:"mineGame",title:"Minefield",desc:"Take turns revealing. Hit a mine and you lose.",cat:"brain",key:"mine",win:1,hud:false,
controls:"Click a square. Numbers show nearby mines. Reveal the LAST safe square to win. Hit a mine and you lose.",
init(g){g.rev=new Array(81).fill(false);g.cnt=new Array(81).fill(0);g.mines=null;g.turn=0;g.safe=71;g.msg.textContent="P1'S TURN";},
update(){},
click(g,x,y){
const cx=Math.floor((x-234)/48),cy=Math.floor((y-40)/48);
if(cx<0||cy<0||cx>8||cy>8)return;
const k=cy*9+cx;if(g.rev[k])return;
if(!g.mines){
g.mines=new Array(81).fill(false);let n=0;
while(n<10){const m=ri(0,80);if(!g.mines[m]&&!(Math.abs(m%9-cx)<=1&&Math.abs(Math.floor(m/9)-cy)<=1)){g.mines[m]=true;n++;}}
for(let i=0;i<81;i++){let c=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=i%9+dx,ny=Math.floor(i/9)+dy;if(nx>=0&&ny>=0&&nx<9&&ny<9&&g.mines[ny*9+nx])c++;}g.cnt[i]=c;}
}
if(g.mines[k]){g.rev[k]=true;g.burst(234+cx*48+24,40+cy*48+24,RED,30,420);FX.playBoom();g.end(1-g.turn);return;}
const st=[k];
while(st.length){
const i=st.pop();if(g.rev[i])continue;g.rev[i]=true;g.safe--;
if(g.cnt[i]===0)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=i%9+dx,ny=Math.floor(i/9)+dy;if(nx>=0&&ny>=0&&nx<9&&ny<9&&!g.rev[ny*9+nx]&&!g.mines[ny*9+nx])st.push(ny*9+nx);}
}
FX.tone(500,.06,"triangle",.05);
if(g.safe<=0){g.end(g.turn);return;}
g.turn=1-g.turn;g.msg.textContent=`P${g.turn+1}'S TURN`;
},
draw(g,ctx){
ctx.fillStyle="#12183a";ctx.fillRect(0,0,W,H);
const NC=["","#4aa8ff","#4aff7a","#ff6a6a","#c04aff","#ff9a3a","#4affee","#fff","#aaa"];
for(let i=0;i<81;i++){
const x=234+(i%9)*48,y=40+Math.floor(i/9)*48,r=g.rev[i];
ctx.fillStyle=r?"#2a3260":((i%9+Math.floor(i/9))%2?"#4a5a9a":"#52639f");ctx.fillRect(x+1,y+1,46,46);
if(!r){ctx.fillStyle="rgba(255,255,255,.2)";ctx.fillRect(x+1,y+1,46,4);}
if(r&&g.mines&&g.mines[i]){ctx.fillStyle=RED;ctx.beginPath();ctx.arc(x+24,y+24,12,0,Math.PI*2);ctx.fill();}
else if(r&&g.cnt[i])g.text(String(g.cnt[i]),x+24,y+33,26,NC[g.cnt[i]],"center");
else if(g.mode==="over"&&g.mines&&g.mines[i]){ctx.fillStyle="rgba(255,90,90,.7)";ctx.beginPath();ctx.arc(x+24,y+24,9,0,Math.PI*2);ctx.fill();}
}
g.text("P1",20,36,24,C1);g.text("P2",W-20,36,24,C2,"right");
if(g.mode==="play")g.text(`P${g.turn+1}'S TURN`,g.turn?W-20:20,66,16,col(g.turn),g.turn?"right":"left");
g.text(g.safe+" SAFE LEFT",W/2,30,14,"#9fc0ff","center");
}
});

/* ---------- 2048 DUEL ---------- */
function slideLine(a){
const t=a.filter(v=>v);let sc=0;
for(let i=0;i<t.length-1;i++)if(t[i]===t[i+1]){t[i]*=2;sc+=t[i];t.splice(i+1,1);}
while(t.length<4)t.push(0);
return{line:t,sc};
}
function slide(b,d){
let moved=false,sc=0;
for(let k=0;k<4;k++){
const idx=[0,1,2,3].map(j=>d<2?k*4+j:j*4+k);
if(d===1||d===3)idx.reverse();
const r=slideLine(idx.map(i=>b[i]));
r.line.forEach((v,j)=>{if(b[idx[j]]!==v)moved=true;b[idx[j]]=v;});sc+=r.sc;
}
return{moved,sc};
}
function spawn2048(b){const e=b.map((v,i)=>v?-1:i).filter(i=>i>=0);if(e.length)b[e[ri(0,e.length-1)]]=Math.random()<.9?2:4;}
micro({id:"g2048Game",title:"2048 Duel",desc:"Two boards, 75 seconds, highest score",cat:"brain",key:"g2048",win:1,hud:false,
controls:"P1: W/A/S/D slide tiles　 P2: ARROWS — merge equal tiles. Score = total of merges.",
init(g){g.time=75;g.s=[0,0];g.bd=[0,1].map(()=>{const b=new Array(16).fill(0);spawn2048(b);spawn2048(b);return b;});},
update(g,dt){
g.time-=dt;
for(let i=0;i<2;i++){
const I=g.I[i],d=I.pl?0:I.pr?1:I.pu?2:I.pd?3:-1;
if(d<0)continue;
const r=slide(g.bd[i],d);
if(r.moved){g.s[i]+=r.sc;spawn2048(g.bd[i]);FX.tone(r.sc?700:400,.04,"square",.03);if(r.sc)g.burst(i?675:225,250,col(i),4,140);}
}
if(g.time<=0)g.byScore(g.s);
},
draw(g,ctx){
ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
const TC={0:"#2a2f55",2:"#eee4da",4:"#ede0c8",8:"#f2b179",16:"#f59563",32:"#f67c5f",64:"#f65e3b",128:"#edcf72",256:"#edcc61",512:"#edc850",1024:"#edc53f",2048:"#edc22e"};
for(let i=0;i<2;i++){
const ox=i?515:65;
ctx.fillStyle="#1b2147";ctx.fillRect(ox-8,92,336,336);ctx.strokeStyle=col(i);ctx.lineWidth=3;ctx.strokeRect(ox-8,92,336,336);
g.bd[i].forEach((v,k)=>{
const x=ox+(k%4)*82,y=100+Math.floor(k/4)*82;
ctx.fillStyle=TC[v]||"#3c3a32";ctx.fillRect(x,y,74,74);
if(v)g.text(String(v),x+37,y+48,v>=1000?22:v>=100?28:34,v<=4?"#776e65":"#fff","center");
});
g.text("P"+(i+1)+"  "+g.s[i],ox+160,70,26,col(i),"center");
}
g.text(String(Math.max(0,Math.ceil(g.time))),W/2,70,28,g.time<10?RED:GOLD,"center");
}
});

/* ---------- CHOMP ---------- */
micro({id:"chompGame",title:"Chomp",desc:"Eat the bar. Don't eat the poison.",cat:"brain",key:"chomp",win:1,hud:false,
controls:"Click a square to eat it and everything right and below it. Whoever eats the poison (top-left) loses.",
init(g){g.al=Array.from({length:5},()=>new Array(8).fill(true));g.turn=0;g.msg.textContent="P1'S TURN";},
update(){},
click(g,x,y){
const c=Math.floor((x-170)/70),r=Math.floor((y-90)/70);
if(c<0||r<0||c>7||r>4||!g.al[r][c])return;
if(r===0&&c===0){g.burst(205,125,GREEN,30,380);FX.playBoom();g.end(1-g.turn);return;}
for(let a=r;a<5;a++)for(let b=c;b<8;b++)if(g.al[a][b]){g.al[a][b]=false;g.burst(170+b*70+35,90+a*70+35,"#8a5a2a",3,160);}
FX.tone(220,.1,"sawtooth",.05,-60);
g.turn=1-g.turn;g.msg.textContent=`P${g.turn+1}'S TURN`;
},
draw(g,ctx){
ctx.fillStyle="#241a2a";ctx.fillRect(0,0,W,H);
for(let r=0;r<5;r++)for(let c=0;c<8;c++){
if(!g.al[r][c])continue;
const x=170+c*70,y=90+r*70;
ctx.fillStyle="#6a3a1a";ctx.fillRect(x+2,y+2,66,66);ctx.fillStyle="#8a5a2a";ctx.fillRect(x+6,y+6,58,58);ctx.fillStyle="rgba(255,255,255,.2)";ctx.fillRect(x+6,y+6,58,5);
if(r===0&&c===0){ctx.fillStyle="#2a8a3a";ctx.fillRect(x+6,y+6,58,58);g.text("☠",x+35,y+48,36,"#cfff8a","center");}
}
g.text("P1",20,40,24,C1);g.text("P2",W-20,40,24,C2,"right");
if(g.mode==="play")g.text(`P${g.turn+1}'S TURN`,W/2,50,22,col(g.turn),"center");
}
});

/* ---------- CHAIN REACTION ---------- */
const CR=5,CC=6;
const capOf=(r,c)=>(r>0?1:0)+(r<CR-1?1:0)+(c>0?1:0)+(c<CC-1?1:0);
micro({id:"chainGame",title:"Chain Reaction",desc:"Overload cells to conquer the board",cat:"brain",key:"chain",win:1,hud:false,
controls:"Click an empty or your own cell to add an orb. A cell explodes when full and converts its neighbors. Wipe out your rival.",
init(g){g.c=Array.from({length:CR*CC},()=>({n:0,o:-1}));g.turn=0;g.moves=[0,0];g.msg.textContent="P1'S TURN";},
update(){},
click(g,x,y){
const c=Math.floor((x-210)/80),r=Math.floor((y-50)/80);
if(c<0||r<0||c>=CC||r>=CR)return;
const cell=g.c[r*CC+c];
if(cell.o!==-1&&cell.o!==g.turn)return;
cell.o=g.turn;cell.n++;g.moves[g.turn]++;FX.tone(400+g.turn*100,.05,"square",.05);
const q=[[r,c]];let steps=0;
while(q.length&&steps<600){
steps++;
const [a,b]=q.shift(),cl=g.c[a*CC+b],cap=capOf(a,b);
if(cl.n<cap)continue;
cl.n-=cap;if(cl.n===0)cl.o=-1;
g.burst(210+b*80+40,50+a*80+40,col(g.turn),8,220);
for(const [dr,dc] of[[1,0],[-1,0],[0,1],[0,-1]]){
const nr=a+dr,nc=b+dc;if(nr<0||nc<0||nr>=CR||nc>=CC)continue;
const nb=g.c[nr*CC+nc];nb.n++;nb.o=g.turn;if(nb.n>=capOf(nr,nc))q.push([nr,nc]);
}
if(cl.n>=cap)q.push([a,b]);
}
if(steps>1)FX.playBoom();
if(g.moves[0]>0&&g.moves[1]>0){
const t=[0,0];g.c.forEach(k=>{if(k.o>=0)t[k.o]+=k.n;});
if(t[0]===0){g.end(1);return;}if(t[1]===0){g.end(0);return;}
}
g.turn=1-g.turn;g.msg.textContent=`P${g.turn+1}'S TURN`;
},
draw(g,ctx){
ctx.fillStyle="#12183a";ctx.fillRect(0,0,W,H);
for(let r=0;r<CR;r++)for(let c=0;c<CC;c++){
const x=210+c*80,y=50+r*80,cl=g.c[r*CC+c],cap=capOf(r,c);
ctx.fillStyle="#1d2550";ctx.fillRect(x+2,y+2,76,76);
ctx.strokeStyle=cl.o>=0?col(cl.o):"#3a4a8a";ctx.lineWidth=3;ctx.strokeRect(x+2,y+2,76,76);
g.text(String(cap),x+70,y+16,11,"#4c5d99","right");
const crit=cl.n===cap-1&&cl.n>0,wob=crit?Math.sin(g.t*20)*2:0;
for(let k=0;k<cl.n;k++){
const ang=k*Math.PI*2/Math.max(cl.n,1)+g.t*(cl.n>1?1:0),rr=cl.n>1?14:0;
const ox=x+40+Math.cos(ang)*rr+wob,oy=y+40+Math.sin(ang)*rr;
ctx.fillStyle=col(cl.o);ctx.beginPath();ctx.arc(ox,oy,11,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle="rgba(255,255,255,.5)";ctx.fillRect(ox-5,oy-6,4,4);
}
}
g.text("P1",20,40,24,C1);g.text("P2",W-20,40,24,C2,"right");
if(g.mode==="play")g.text(`P${g.turn+1}'S TURN`,g.turn?W-20:20,70,16,col(g.turn),g.turn?"right":"left");
}
});

/* ---------- ODD TILE ---------- */
micro({id:"oddGame",title:"Odd Tile",desc:"Spot the slightly different tile first",cat:"brain",key:"odd",win:5,
controls:"P1: W/A/S/D move, SPACE pick　 P2: ARROWS move, ENTER pick — wrong picks lock you out",
round(g){
const n=g.score[0]+g.score[1];
g.h=ri(0,360);g.diff=Math.max(5,20-n*2);g.odd=ri(0,35);g.lock=[0,0];
g.cr=[{x:300,y:250,r:12,fx:1,fy:0,vx:0,vy:0},{x:600,y:250,r:12,fx:1,fy:0,vx:0,vy:0}];
},
update(g,dt){
g.cr.forEach((c,i)=>{
g.walk(c,i,380,{x0:10,x1:W-10,y0:40,y1:H-10});
g.lock[i]=Math.max(0,g.lock[i]-dt);
if(g.I[i].pa&&g.lock[i]<=0){
const tx=Math.floor((c.x-252)/66),ty=Math.floor((c.y-70)/66);
if(tx>=0&&ty>=0&&tx<6&&ty<6&&c.x-252-tx*66<60&&c.y-70-ty*66<60){
if(ty*6+tx===g.odd){g.point(i);return;}
g.lock[i]=1;FX.tone(120,.2,"sawtooth",.05,-40);
}
}
});
},
draw(g,ctx){
ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
for(let k=0;k<36;k++){
const x=252+(k%6)*66,y=70+Math.floor(k/6)*66;
ctx.fillStyle=`hsl(${g.h},60%,${k===g.odd?50+g.diff:50}%)`;ctx.fillRect(x,y,60,60);
}
g.cr.forEach((c,i)=>{
ctx.strokeStyle=col(i);ctx.lineWidth=3;ctx.beginPath();ctx.arc(c.x,c.y,13,0,Math.PI*2);ctx.moveTo(c.x-20,c.y);ctx.lineTo(c.x+20,c.y);ctx.moveTo(c.x,c.y-20);ctx.lineTo(c.x,c.y+20);ctx.stroke();
if(g.lock[i]>0)g.text("LOCKED",c.x,c.y-24,14,RED,"center");
});
}
});

/* ---------- SUPER TIC-TAC-TOE ---------- */
const TL=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const tWin=(a,p)=>TL.some(l=>l.every(i=>a[i]===p));
micro({id:"superTttGame",title:"Super Tic-Tac-Toe",desc:"Nine boards. Your move sends them elsewhere.",cat:"board",key:"supertt",win:1,hud:false,
controls:"Click a cell. The cell you pick decides which board your rival must play in. Win three boards in a line.",
init(g){g.sm=Array.from({length:9},()=>new Array(9).fill(-1));g.big=new Array(9).fill(-1);g.next=-1;g.turn=0;g.msg.textContent="P1'S TURN";},
update(){},
click(g,x,y){
const rx=x-213,ry=y-12;
const bX=Math.floor(rx/162),bY=Math.floor(ry/162);
if(bX<0||bY<0||bX>2||bY>2)return;
const ix=rx-bX*162,iy=ry-bY*162;if(ix>=150||iy>=150)return;
const cx=Math.floor(ix/50),cy=Math.floor(iy/50),bi=bY*3+bX,ci=cy*3+cx;
if(g.big[bi]!==-1||g.sm[bi][ci]!==-1)return;
if(g.next>=0&&bi!==g.next)return;
g.sm[bi][ci]=g.turn;FX.tone(300+g.turn*120,.07,"triangle",.06);
g.burst(213+bX*162+cx*50+25,12+bY*162+cy*50+25,col(g.turn),5,120);
if(tWin(g.sm[bi],g.turn)){g.big[bi]=g.turn;FX.playScore();g.banner_("BOARD WON",col(g.turn),.8);}
else if(!g.sm[bi].includes(-1))g.big[bi]=2;
if(tWin(g.big,g.turn)){g.end(g.turn);return;}
if(!g.big.includes(-1)){g.byScore([g.big.filter(v=>v===0).length,g.big.filter(v=>v===1).length]);return;}
g.next=g.big[ci]===-1?ci:-1;g.turn=1-g.turn;g.msg.textContent=`P${g.turn+1}'S TURN`;
},
draw(g,ctx){
ctx.fillStyle="#12183a";ctx.fillRect(0,0,W,H);
for(let bi=0;bi<9;bi++){
const ox=213+(bi%3)*162,oy=12+Math.floor(bi/3)*162,act=g.mode==="play"&&g.big[bi]===-1&&(g.next<0||g.next===bi);
ctx.fillStyle=act?"#262f66":"#1a2048";ctx.fillRect(ox,oy,150,150);
ctx.strokeStyle=act?GOLD:"#3a4a8a";ctx.lineWidth=act?4:2;ctx.strokeRect(ox,oy,150,150);
ctx.strokeStyle="#4c5d99";ctx.lineWidth=2;ctx.beginPath();for(let k=1;k<3;k++){ctx.moveTo(ox+k*50,oy+6);ctx.lineTo(ox+k*50,oy+144);ctx.moveTo(ox+6,oy+k*50);ctx.lineTo(ox+144,oy+k*50);}ctx.stroke();
g.sm[bi].forEach((v,ci)=>{if(v<0)return;const x=ox+(ci%3)*50+25,y=oy+Math.floor(ci/3)*50+25;ctx.strokeStyle=col(v);ctx.lineWidth=5;ctx.beginPath();if(v===0){ctx.moveTo(x-12,y-12);ctx.lineTo(x+12,y+12);ctx.moveTo(x+12,y-12);ctx.lineTo(x-12,y+12);}else ctx.arc(x,y,13,0,Math.PI*2);ctx.stroke();});
if(g.big[bi]>=0){ctx.fillStyle="rgba(8,11,24,.65)";ctx.fillRect(ox,oy,150,150);if(g.big[bi]<2){g.text(g.big[bi]===0?"✕":"◯",ox+75,oy+105,90,col(g.big[bi]),"center");}}
}
g.text("P1",20,40,24,C1);g.text("P2",W-20,40,24,C2,"right");
if(g.mode==="play")g.text(`P${g.turn+1}'S TURN`,g.turn?W-20:20,70,16,col(g.turn),g.turn?"right":"left");
}
});

/* ---------- TENNIS ---------- */
micro({id:"tennisGame",title:"Tennis",desc:"Side-view rally. One bounce, then smash it back.",cat:"sports",key:"tennis",win:5,
controls:"P1: A/D move, SPACE swing (hold W lob, S drive)　 P2: ←/→, ENTER (↑ lob, ↓ drive)",
round(g){
const sv=(g.score[0]+g.score[1])%2;
g.p=[{x:200,swing:0},{x:700,swing:0}];
g.b={x:g.p[sv].x,y:260,vx:0,vy:0,last:-1,side:-1,bn:0};
},
update(g,dt){
const b=g.b;let lose=-1;
g.p.forEach((p,i)=>{
const I=g.I[i];
p.x=clamp(p.x+((I.r?1:0)-(I.l?1:0))*270*dt,i?490:30,i?870:410);
p.swing=Math.max(0,p.swing-dt);
if(I.pa&&p.swing<=0){
p.swing=.25;
if(Math.abs(b.x-p.x)<62&&b.y>310&&b.y<452){
const dir=i?-1:1;
let vx=330,vy=-440;
if(I.u){vx=240;vy=-600;}else if(I.d){vx=470;vy=-290;}
b.vx=dir*vx;b.vy=vy;b.last=i;b.side=-1;b.bn=0;FX.playBounce();g.burst(b.x,b.y,"#fff",5,140);
}
}
});
b.vy+=900*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
if(b.y>=432&&b.vy>0){
b.y=432;b.vy*=-.72;if(Math.abs(b.vy)<40)b.vy=0;
const s=b.x<450?0:1;
if(s!==b.side){b.side=s;b.bn=1;}else b.bn++;
if(b.last>=0&&b.bn===1&&s===b.last)lose=b.last;
else if(b.bn>=2)lose=s;
FX.tone(180,.04,"square",.03);
}
if(Math.abs(b.x-450)<8&&b.y>368){b.vx*=-.4;if(b.last>=0)lose=b.last;}
if((b.x<0||b.x>W)&&b.last>=0)lose=b.last;
if(lose>=0)g.point(1-lose);
},
draw(g,ctx){
const gr=ctx.createLinearGradient(0,0,0,440);gr.addColorStop(0,"#3a7ac8");gr.addColorStop(1,"#a8d8ff");ctx.fillStyle=gr;ctx.fillRect(0,0,W,440);
ctx.fillStyle="#2a7a4a";ctx.fillRect(0,440,W,60);ctx.fillStyle="#fff";ctx.fillRect(0,440,W,3);
ctx.fillStyle="rgba(255,255,255,.7)";ctx.fillRect(450,300,2,140);
ctx.fillStyle="#e8e8f0";ctx.fillRect(446,368,8,72);ctx.fillStyle="rgba(255,255,255,.35)";for(let y=372;y<440;y+=8)ctx.fillRect(432,y,36,1);
g.p.forEach((p,i)=>{
ctx.save();ctx.translate(p.x-15,440-62);FX.drawFighter(ctx,30,62,col(i),i?-1:1,false,false);ctx.restore();
const sw=p.swing>0?1:0;
ctx.strokeStyle="#fff";ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(p.x+(i?-30:30)*(1+sw*.3),440-48-sw*10,11,15,0,0,Math.PI*2);ctx.stroke();
});
const b=g.b;
ctx.fillStyle="rgba(0,0,0,.25)";ctx.beginPath();ctx.ellipse(b.x,442,8,3,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#e8ff6a";ctx.beginPath();ctx.arc(b.x,b.y,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
}
});

/* ---------- CURLING ---------- */
micro({id:"curlingGame",title:"Curling",desc:"Slide stones to the bullseye",cat:"sports",key:"curling",win:1,hud:false,
controls:"On your turn press your key to lock the aim, then again to lock the power. P1: SPACE　 P2: ENTER. Four stones each.",
init(g){g.stones=[];g.n=0;g.ph="aim";g.ang=0;g.pw=0;g.sl=0;g.msg.textContent="P1 THROWS";},
update(g,dt){
const cur=g.n%2,I=g.I[cur];
for(const s of g.stones){
if(s.out)continue;
s.x+=s.vx*dt;s.y+=s.vy*dt;s.vx*=.985;s.vy*=.985;
if(Math.hypot(s.vx,s.vy)<5){s.vx=0;s.vy=0;}
if(s.x>850||s.y<55||s.y>445||s.x<20)s.out=true;
}
for(let a=0;a<g.stones.length;a++)for(let b=a+1;b<g.stones.length;b++){
const p=g.stones[a],q=g.stones[b];if(p.out||q.out)continue;
const d=dist(p,q);
if(d<32&&d>0){
const nx=(q.x-p.x)/d,ny=(q.y-p.y)/d,o=(32-d)/2;p.x-=nx*o;p.y-=ny*o;q.x+=nx*o;q.y+=ny*o;
const vn=(q.vx-p.vx)*nx+(q.vy-p.vy)*ny;
if(vn<0){p.vx+=vn*nx;p.vy+=vn*ny;q.vx-=vn*nx;q.vy-=vn*ny;FX.tone(200,.05,"square",.04);g.burst((p.x+q.x)/2,(p.y+q.y)/2,"#fff",5,140);}
}
}
if(g.ph==="aim"){
g.ang=Math.sin(g.t*2.2)*.28;
if(I.pa){g.ph="power";g.aA=g.ang;}
}else if(g.ph==="power"){
g.pw=(Math.sin(g.t*3.4)+1)/2;
if(I.pa){
const v=330+g.pw*420;
g.stones.push({x:90,y:250,vx:Math.cos(g.aA)*v,vy:Math.sin(g.aA)*v,o:cur,out:false});
g.ph="slide";g.sl=0;FX.tone(200,.2,"triangle",.05,-60);
}
}else{
g.sl+=dt;
if(g.sl>.8&&g.stones.every(s=>s.out||(s.vx===0&&s.vy===0))){
g.n++;
if(g.n>=8){
const best=[1e9,1e9];
g.stones.forEach(s=>{if(!s.out){const d=Math.hypot(s.x-720,s.y-250);if(d<best[s.o])best[s.o]=d;}});
const sc=[0,0],w=best[0]<best[1]?0:1,l=1-w;
if(best[w]<95)g.stones.forEach(s=>{if(!s.out&&s.o===w){const d=Math.hypot(s.x-720,s.y-250);if(d<best[l]&&d<95)sc[w]++;}});
g.byScore(sc);
}else{g.ph="aim";g.msg.textContent=`P${g.n%2+1} THROWS`;}
}
}
},
draw(g,ctx){
ctx.fillStyle="#cfe8ff";ctx.fillRect(0,50,W,400);ctx.fillStyle="#b8d8f5";for(let x=0;x<W;x+=60)ctx.fillRect(x,50,30,400);
ctx.fillStyle="#12183a";ctx.fillRect(0,0,W,50);ctx.fillRect(0,450,W,50);
ctx.fillStyle="#fff";ctx.fillRect(150,50,3,400);
[[95,"#4a8aff"],[65,"#fff"],[38,"#ff4a4a"],[12,"#fff"]].forEach(([r,c])=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(720,250,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#6a8aa8";ctx.lineWidth=2;ctx.stroke();});
ctx.fillStyle="#6a8aa8";ctx.fillRect(70,248,40,4);
for(const s of g.stones){
if(s.out)continue;
ctx.fillStyle="rgba(0,0,0,.25)";ctx.beginPath();ctx.arc(s.x+3,s.y+4,16,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#9aa0b8";ctx.beginPath();ctx.arc(s.x,s.y,16,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle=col(s.o);ctx.beginPath();ctx.arc(s.x,s.y,9,0,Math.PI*2);ctx.fill();
}
const cur=g.n%2;
if(g.ph==="aim"||g.ph==="power"){
const a=g.ph==="aim"?g.ang:g.aA;
ctx.strokeStyle=col(cur);ctx.lineWidth=3;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(90,250);ctx.lineTo(90+Math.cos(a)*600,250+Math.sin(a)*600);ctx.stroke();ctx.setLineDash([]);
ctx.fillStyle=col(cur);ctx.beginPath();ctx.arc(90,250,16,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
}
if(g.ph==="power"){ctx.fillStyle="#080b18";ctx.fillRect(250,462,400,22);ctx.fillStyle=g.pw>.85?RED:GOLD;ctx.fillRect(252,464,396*g.pw,18);ctx.strokeStyle="#9fc0ff";ctx.lineWidth=2;ctx.strokeRect(250,462,400,22);}
g.text("P1",20,34,22,C1);g.text("P2",W-20,34,22,C2,"right");
g.text(`STONE ${Math.min(8,g.n+1)}/8 — P${cur+1}`,W/2,34,16,col(cur),"center");
}
});

/* ---------- MINI GOLF ---------- */
function golfSetup(g){
const H0=HOLES[g.h];
g.balls=[0,1].map(()=>({x:H0.tee.x,y:H0.tee.y,vx:0,vy:0,a:Math.atan2(H0.hole.y-H0.tee.y,H0.hole.x-H0.tee.x),st:0,in:false}));
g.cur=0;g.pw=0;g.ho=0;
}
const HOLES=[
{tee:{x:100,y:260},hole:{x:790,y:260},w:[{x:430,y:130,w:30,h:260}],par:3},
{tee:{x:100,y:430},hole:{x:790,y:110},w:[{x:290,y:200,w:30,h:290},{x:560,y:40,w:30,h:260}],par:4},
{tee:{x:100,y:100},hole:{x:800,y:430},w:[{x:250,y:40,w:30,h:300},{x:500,y:190,w:30,h:300},{x:700,y:40,w:30,h:260}],par:4}
];
micro({id:"golfGame",title:"Mini Golf",desc:"Three holes, fewest strokes wins",cat:"sports",key:"golf",win:1,hud:false,
controls:"Take turns. Hold LEFT/RIGHT (P1: A/D, P2: ←/→) to aim, hold SPACE/ENTER to charge, release to hit.",
init(g){g.h=0;g.tot=[0,0];golfSetup(g);},
update(g,dt){
if(!g.balls)return;
const H0=HOLES[g.h],cur=g.cur,b=g.balls[cur],I=g.I[cur];
g.balls.forEach((q,i)=>{
if(q.in)return;
if(Math.hypot(q.vx,q.vy)>0){
const px=q.x,py=q.y;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.985;q.vy*=.985;
if(Math.hypot(q.vx,q.vy)<8){q.vx=0;q.vy=0;}
if(q.x<28){q.x=28;q.vx=Math.abs(q.vx)*.8;}if(q.x>872){q.x=872;q.vx=-Math.abs(q.vx)*.8;}
if(q.y<48){q.y=48;q.vy=Math.abs(q.vy)*.8;}if(q.y>472){q.y=472;q.vy=-Math.abs(q.vy)*.8;}
for(const w of H0.w){
if(q.x+7>w.x&&q.x-7<w.x+w.w&&q.y+7>w.y&&q.y-7<w.y+w.h){
if(px+7<=w.x||px-7>=w.x+w.w){q.vx*=-.8;q.x=px;}else{q.vy*=-.8;q.y=py;}
FX.tone(200,.04,"square",.03);
}
}
if(Math.hypot(q.x-H0.hole.x,q.y-H0.hole.y)<13&&Math.hypot(q.vx,q.vy)<430){q.in=true;q.x=H0.hole.x;q.y=H0.hole.y;g.tot[i]+=q.st;FX.playScore();g.burst(q.x,q.y,GOLD,16,240);}
}
});
const moving=g.balls.some(q=>!q.in&&(q.vx||q.vy));
if(g.balls.every(q=>q.in)){
g.ho=(g.ho||0)+dt;
if(g.ho>1.2){g.ho=0;g.h++;if(g.h>=3){g.byScore([-g.tot[0],-g.tot[1]]);return;}golfSetup(g);}
return;
}
if(moving)return;
if(b.in||b.st>=7){if(!b.in){b.in=true;g.tot[cur]+=7;}g.cur=g.balls[1-cur].in?cur:1-cur;return;}
if(I.l)b.a-=2*dt;if(I.r)b.a+=2*dt;
if(I.a){g.pw=Math.min(1,g.pw+.9*dt);}
else if(g.pw>0){
const v=140+g.pw*700;b.vx=Math.cos(b.a)*v;b.vy=Math.sin(b.a)*v;b.st++;g.pw=0;FX.tone(250,.1,"triangle",.05,-80);
g.cur=g.balls[1-cur].in?cur:1-cur;
}
},
draw(g,ctx){
if(!g.balls)return;
const H0=HOLES[g.h];
ctx.fillStyle="#1a3a2a";ctx.fillRect(0,0,W,H);
ctx.fillStyle="#2f8a4a";ctx.fillRect(20,40,860,450);for(let x=20;x<880;x+=60){ctx.fillStyle="#34964f";ctx.fillRect(x,40,30,450);}
ctx.strokeStyle="#6a4a2a";ctx.lineWidth=8;ctx.strokeRect(20,40,860,450);
for(const w of H0.w){ctx.fillStyle="#7a5a3a";ctx.fillRect(w.x,w.y,w.w,w.h);ctx.fillStyle="#9a7a5a";ctx.fillRect(w.x,w.y,w.w,5);ctx.strokeStyle="#3a2a1a";ctx.lineWidth=2;ctx.strokeRect(w.x,w.y,w.w,w.h);}
ctx.fillStyle="#111";ctx.beginPath();ctx.arc(H0.hole.x,H0.hole.y,13,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#fff";ctx.fillRect(H0.hole.x,H0.hole.y-40,2,40);ctx.fillStyle=RED;ctx.beginPath();ctx.moveTo(H0.hole.x+2,H0.hole.y-40);ctx.lineTo(H0.hole.x+20,H0.hole.y-33);ctx.lineTo(H0.hole.x+2,H0.hole.y-26);ctx.fill();
ctx.fillStyle="rgba(255,255,255,.2)";ctx.beginPath();ctx.arc(H0.tee.x,H0.tee.y,14,0,Math.PI*2);ctx.fill();
g.balls.forEach((q,i)=>{
if(q.in)return;
ctx.fillStyle="rgba(0,0,0,.3)";ctx.beginPath();ctx.ellipse(q.x+2,q.y+4,8,4,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(q.x,q.y,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();
});
const b=g.balls[g.cur];
if(!b.in&&!g.balls.some(q=>!q.in&&(q.vx||q.vy))){
ctx.strokeStyle=col(g.cur);ctx.lineWidth=3;ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x+Math.cos(b.a)*(40+g.pw*150),b.y+Math.sin(b.a)*(40+g.pw*150));ctx.stroke();ctx.setLineDash([]);
ctx.fillStyle="#080b18";ctx.fillRect(350,12,200,16);ctx.fillStyle=g.pw>.85?RED:GOLD;ctx.fillRect(352,14,196*g.pw,12);
}
g.text("P1 "+g.tot[0]+(g.balls[0].in?"":" +"+g.balls[0].st),14,24,16,C1);
g.text((g.balls[1].in?"":g.balls[1].st+"+ ")+"P2 "+g.tot[1],W-14,24,16,C2,"right");
g.text("HOLE "+(g.h+1)+"/3  PAR "+H0.par,W/2,500,12,"#9fc0ff","center");
if(g.mode==="play"&&!b.in)g.text("P"+(g.cur+1)+" AIM",450,50,14,col(g.cur),"center");
}
});
/* ---------- SKI SLALOM ---------- */
micro({id:"skiGame",title:"Ski Slalom",desc:"Carve through the gates, dodge the trees",cat:"action",key:"ski",win:1,hud:false,
controls:"P1: A / D steer　 P2: ← / → steer — pass between the flags for points. Trees stun you.",
init(g){
g.time=35;g.s=[0,0];g.dist=0;g.rng=seeded(ri(1,1e6));g.obj=[];g.lastG=300;
g.sk=[{x:225,stun:0,last:-1},{x:225,stun:0,last:-1}];
},
update(g,dt){
g.time-=dt;
const sp=270+(35-g.time)*5;g.dist+=sp*dt;
while(g.lastG<g.dist+700){
g.lastG+=210+g.rng()*80;
const gx=90+g.rng()*270;g.obj.push({t:"gate",d:g.lastG,x:gx});
for(let k=0;k<2;k++){const tx=30+g.rng()*390;if(Math.abs(tx-gx)>85)g.obj.push({t:"tree",d:g.lastG-60-k*90+g.rng()*40,x:tx});}
}
g.obj=g.obj.filter(o=>o.d>g.dist-120);
g.sk.forEach((s,i)=>{
const I=g.I[i];s.stun=Math.max(0,s.stun-dt);
if(s.stun<=0)s.x=clamp(s.x+((I.r?1:0)-(I.l?1:0))*290*dt,18,432);
for(const o of g.obj){
const oy=o.d-g.dist+120;
if(o.t==="tree"&&s.stun<=0&&Math.abs(oy-120)<14&&Math.abs(o.x-s.x)<16){s.stun=.8;FX.tone(120,.2,"sawtooth",.05,-40);g.burst(i*450+s.x,120,"#fff",10,200);}
if(o.t==="gate"&&!o["p"+i]&&oy<=120){
o["p"+i]=true;
if(Math.abs(s.x-o.x)<52){g.s[i]++;FX.tone(900,.05,"square",.04,300);g.burst(i*450+s.x,120,GOLD,6,140);}
}
}
});
if(g.time<=0)g.byScore(g.s);
},
draw(g,ctx){
for(let i=0;i<2;i++){
const off=i*450;
ctx.save();ctx.beginPath();ctx.rect(off,0,450,H);ctx.clip();
ctx.fillStyle="#eef6ff";ctx.fillRect(off,0,450,H);
for(let k=0;k<14;k++){ctx.fillStyle="#d4e6f8";ctx.fillRect(off+((k*83)%450),((k*131-g.dist*.9)%H+H)%H,22,4);}
for(const o of g.obj){
const y=o.d-g.dist+120;if(y<-40||y>H+40)continue;
if(o.t==="tree"){ctx.fillStyle="#1f6a3a";ctx.beginPath();ctx.moveTo(off+o.x,y-24);ctx.lineTo(off+o.x+16,y+10);ctx.lineTo(off+o.x-16,y+10);ctx.fill();ctx.fillStyle="#2a8a4a";ctx.beginPath();ctx.moveTo(off+o.x,y-34);ctx.lineTo(off+o.x+12,y-8);ctx.lineTo(off+o.x-12,y-8);ctx.fill();ctx.fillStyle="#5a3a1a";ctx.fillRect(off+o.x-3,y+10,6,6);}
else{ctx.fillStyle="#ff4a4a";ctx.fillRect(off+o.x-55,y-16,4,32);ctx.fillStyle="#4a8aff";ctx.fillRect(off+o.x+51,y-16,4,32);ctx.fillStyle=o["p"+i]?GREEN:"rgba(255,255,255,.5)";ctx.fillRect(off+o.x-50,y-2,100,3);}
}
const s=g.sk[i];
ctx.globalAlpha=s.stun>0&&Math.floor(s.stun*14)%2?.4:1;
ctx.save();ctx.translate(off+s.x,120);
ctx.fillStyle="#2a2f63";ctx.fillRect(-9,0,5,26);ctx.fillRect(4,0,5,26);
g.blob({x:0,y:-4,r:11},col(i),0,60,false,s.stun>0);
ctx.restore();ctx.globalAlpha=1;
ctx.restore();
g.text("P"+(i+1)+"  "+g.s[i],off+225,36,22,col(i),"center");
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
g.text(String(Math.max(0,Math.ceil(g.time))),W/2,490,18,GOLD,"center");
}
});

/* ---------- HAMMER THROW ---------- */
micro({id:"hammerGame",title:"Hammer Throw",desc:"Mash to spin, release at the right angle",cat:"sports",key:"hammer",win:1,hud:false,
controls:"P1: mash SPACE to spin, press S to release　 P2: mash ENTER, press ↓ — release when the hammer points to the green zone. Three throws.",
init(g){g.st=[0,1].map(()=>({n:0,sp:0,a:0,best:0,tot:0,ph:"spin",res:"",t:0,fly:null}));g.fin=0;},
update(g,dt){
g.st.forEach((s,i)=>{
const I=g.I[i];
if(s.ph==="spin"){
if(I.pa){s.sp=Math.min(14,s.sp+.55);FX.tone(150+s.sp*20,.02,"square",.015);}
s.sp=Math.max(0,s.sp-2.2*dt);s.a+=s.sp*dt;
if(I.pd&&s.sp>1){
const f=Math.cos(((s.a%(Math.PI*2))-.9));
const d=f>0?Math.round(s.sp*f*7):0;
s.fly={d,t:0};s.ph="fly";s.res=d>0?d+" m":"FOUL";s.tot+=d;if(d>s.best)s.best=d;
FX.tone(d>0?500:130,.2,"triangle",.05,d>0?300:-60);
}
}else if(s.ph==="fly"){
s.t+=dt;
if(s.t>1.8){s.n++;s.sp=0;s.a=0;s.res="";s.fly=null;s.ph=s.n>=3?"done":"spin";}
}
});
if(g.st.every(s=>s.ph==="done")){g.fin+=dt;if(g.fin>1)g.byScore(g.st.map(s=>s.best));}
},
draw(g,ctx){
ctx.fillStyle="#13243a";ctx.fillRect(0,0,W,H);
g.st.forEach((s,i)=>{
const cx=i?675:225;
ctx.fillStyle="#2a6a3a";ctx.fillRect(cx-210,330,420,170);
ctx.fillStyle="#3a3f6a";ctx.beginPath();ctx.arc(cx,300,26,0,Math.PI*2);ctx.fill();
ctx.fillStyle="rgba(99,245,154,.3)";ctx.beginPath();ctx.moveTo(cx,300);ctx.arc(cx,300,90,.9-1.57,.9+1.57);ctx.closePath();ctx.fill();
ctx.save();ctx.translate(cx,300);
ctx.fillStyle=col(i);ctx.beginPath();ctx.arc(0,0,16,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
if(s.ph!=="fly"){const hx=Math.cos(s.a)*80,hy=Math.sin(s.a)*80;ctx.strokeStyle="#ccc";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(hx,hy);ctx.stroke();ctx.fillStyle="#444";ctx.beginPath();ctx.arc(hx,hy,14,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();}
ctx.restore();
if(s.ph==="fly"&&s.fly){const t=s.t/1.5;ctx.fillStyle="#444";ctx.beginPath();ctx.arc(cx+Math.min(1,t)*Math.min(190,s.fly.d*3),300-Math.sin(Math.min(1,t)*Math.PI)*140,12,0,Math.PI*2);ctx.fill();}
ctx.fillStyle="#080b18";ctx.fillRect(cx-100,440,200,16);ctx.fillStyle=GOLD;ctx.fillRect(cx-98,442,196*s.sp/14,12);
g.text("P"+(i+1)+"  BEST "+s.best,cx,36,22,col(i),"center");
g.text("THROW "+Math.min(3,s.n+(s.ph==="done"?0:1))+"/3",cx,60,14,"#fff","center");
if(s.res)g.text(s.res,cx,160,34,s.res==="FOUL"?RED:GOLD,"center");
});
}
});

/* ---------- LONG JUMP ---------- */
micro({id:"jumpGame",title:"Long Jump",desc:"Sprint, then leap before the line",cat:"sports",key:"longjump",win:1,hud:false,
controls:"P1: mash SPACE to sprint, press S to jump　 P2: mash ENTER, press ↓ — jump just before the foul line. Three attempts.",
init(g){g.st=[0,1].map(()=>({n:0,x:0,sp:0,ph:"run",best:0,res:"",t:0,j:0}));g.fin=0;},
update(g,dt){
g.st.forEach((s,i)=>{
const I=g.I[i];
if(s.ph==="run"){
if(I.pa){s.sp=Math.min(10,s.sp+.45);FX.tone(180,.02,"square",.015);}
s.sp=Math.max(0,s.sp-1.6*dt);s.x+=s.sp*55*dt;
if(s.x>=430){s.ph="air";s.t=0;s.j=0;s.res="FOUL";FX.tone(130,.3,"sawtooth",.05,-60);}
else if(I.pd&&s.sp>1){s.ph="air";s.t=0;s.j=Math.round(s.sp*.55*(.6+.4*s.x/430)*10)/10;s.res=s.j.toFixed(2)+" m";if(s.j>s.best)s.best=s.j;FX.tone(600,.2,"triangle",.05,300);}
}else if(s.ph==="air"){
s.t+=dt;if(s.t>1.6){s.n++;s.x=0;s.sp=0;s.res="";s.ph=s.n>=3?"done":"run";}
}
});
if(g.st.every(s=>s.ph==="done")){g.fin+=dt;if(g.fin>1)g.byScore(g.st.map(s=>s.best));}
},
draw(g,ctx){
ctx.fillStyle="#2a4a7a";ctx.fillRect(0,0,W,H);
g.st.forEach((s,i)=>{
const cx=i?675:225,off=i?450:0;
ctx.fillStyle="#b0503a";ctx.fillRect(off+10,330,430,40);ctx.fillStyle="#e8d8a0";ctx.fillRect(off+440,340,10,30);
ctx.fillStyle="#fff";ctx.fillRect(off+10+430-6,330,6,40);
ctx.fillStyle="#e8d8a0";ctx.fillRect(off+10+430,350,0,0);
const x=off+20+s.x*.95;
let y=330,jx=0;
if(s.ph==="air"&&s.j>0){const t=Math.min(1,s.t/1.2);jx=t*s.j*7;y=330-Math.sin(t*Math.PI)*90;}
else if(s.ph==="air")jx=0;
ctx.save();ctx.translate(x+jx-14,y-52);FX.drawFighter(ctx,28,52,col(i),1,s.ph==="run"&&s.sp>.5,false);ctx.restore();
ctx.fillStyle="#080b18";ctx.fillRect(off+125,430,200,16);ctx.fillStyle=GOLD;ctx.fillRect(off+127,432,196*s.sp/10,12);
g.text("P"+(i+1)+"  BEST "+s.best.toFixed(2),cx,36,22,col(i),"center");
g.text("ATTEMPT "+Math.min(3,s.n+(s.ph==="done"?0:1))+"/3",cx,60,14,"#fff","center");
if(s.res)g.text(s.res,cx,170,34,s.res==="FOUL"?RED:GOLD,"center");
});
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* ---------- BRICK DUEL ---------- */
function brickServe(g){g.ball={x:450,y:250,vx:Math.random()<.5?-160:160,vy:Math.random()<.5?-220:220,last:-1};}
micro({id:"brickGame",title:"Brick Duel",desc:"Break bricks for points, don't miss the ball",cat:"arcade",key:"brick",win:15,
controls:"P1 (bottom): A / D　 P2 (top): ← / → — bricks score for whoever touched the ball last. A miss gives your rival 3.",
init(g){g.pd=[{x:450},{x:450}];g.br=null;},
round(g){brickServe(g);},
update(g,dt){
if(!g.br||!g.br.some(b=>b.a)){g.br=[];for(let r=0;r<5;r++)for(let c=0;c<12;c++)g.br.push({x:54+c*66,y:170+r*24,a:true,r});}
g.pd.forEach((p,i)=>{const I=g.I[i];p.x=clamp(p.x+((I.r?1:0)-(I.l?1:0))*520*dt,50,850);});
const b=g.ball;
b.x+=b.vx*dt;b.y+=b.vy*dt;
if(b.x<8){b.x=8;b.vx=Math.abs(b.vx);}if(b.x>W-8){b.x=W-8;b.vx=-Math.abs(b.vx);}
g.pd.forEach((p,i)=>{
const py=i?30:470;
if(Math.abs(b.y-py)<12&&Math.abs(b.x-p.x)<58&&(i?b.vy<0:b.vy>0)){
const sp=Math.min(560,Math.hypot(b.vx,b.vy)*1.04),off=(b.x-p.x)/58;
b.vx=off*sp*.85;b.vy=(i?1:-1)*Math.sqrt(Math.max(sp*sp-b.vx*b.vx,(sp*.5)**2));b.last=i;FX.playBounce();
}
});
for(const k of g.br){
if(!k.a)continue;
if(b.x+7>k.x&&b.x-7<k.x+64&&b.y+7>k.y&&b.y-7<k.y+22){
k.a=false;b.vy*=-1;
if(b.last>=0){g.add(b.last);}
g.burst(k.x+32,k.y+11,["#ff6a6a","#ffb03a","#ffe66d","#6aff8a","#6ab0ff"][k.r],5,150);FX.tone(500+k.r*80,.04,"square",.03);
break;
}
}
if(b.y>H+10){g.add(1);g.add(1);g.add(1);FX.playBoom();brickServe(g);}
else if(b.y<-10){g.add(0);g.add(0);g.add(0);FX.playBoom();brickServe(g);}
},
draw(g,ctx){
ctx.fillStyle="#0f1330";ctx.fillRect(0,0,W,H);
for(const k of g.br||[]){if(!k.a)continue;ctx.fillStyle=["#ff6a6a","#ffb03a","#ffe66d","#6aff8a","#6ab0ff"][k.r];ctx.fillRect(k.x,k.y,64,22);ctx.fillStyle="rgba(255,255,255,.35)";ctx.fillRect(k.x,k.y,64,5);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(k.x,k.y,64,22);}
g.pd.forEach((p,i)=>{const y=i?22:470;ctx.fillStyle=col(i);ctx.fillRect(p.x-50,y,100,12);ctx.fillStyle="rgba(255,255,255,.4)";ctx.fillRect(p.x-46,y+2,92,3);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(p.x-50,y,100,12);});
const b=g.ball;ctx.fillStyle=b.last<0?"#fff":col(b.last);ctx.beginPath();ctx.arc(b.x,b.y,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();
g.text("P1 "+g.score[0],20,300,18,C1);g.text("P2 "+g.score[1],20,200,18,C2);
}
});

/* ---------- KNIFE TOSS ---------- */
micro({id:"knifeGame",title:"Knife Toss",desc:"Stick knives in the spinning log. Don't hit one.",cat:"reflex",key:"knife",win:3,
controls:"P1: SPACE throw　 P2: ENTER throw — first to stick 8 knives wins the round. Hit any stuck knife and you lose it.",
round(g){g.rot=0;g.stuck=[];g.fly=[];g.cnt=[0,0];g.cd=[0,0];},
update(g,dt){
g.rot+=(1.5*Math.sin(g.t*.8)+1.4*(Math.sin(g.t*.37)>0?1:-1))*dt;
for(let i=0;i<2;i++){
g.cd[i]=Math.max(0,g.cd[i]-dt);
if(g.I[i].pa&&g.cd[i]<=0){g.fly.push({x:i?600:300,y:470,i,vy:-900});g.cd[i]=.4;FX.tone(500,.06,"sawtooth",.03,-200);}
}
let lose=-1;
for(const f of g.fly){
f.y+=f.vy*dt;
if(f.y<=330&&!f.done){
f.done=true;
const a=Math.PI/2-g.rot;
if(g.stuck.some(k=>Math.abs(Math.atan2(Math.sin(k.a-a),Math.cos(k.a-a)))<.24)){lose=f.i;g.burst(450,320,col(f.i),16,300);FX.tone(130,.2,"sawtooth",.05,-40);}
else{g.stuck.push({a,i:f.i});g.cnt[f.i]++;g.burst(450,330,"#fff",5,160);FX.tone(700,.05,"square",.04);}
}
}
g.fly=g.fly.filter(f=>!f.done);
if(lose>=0)g.point(1-lose);
else if(g.cnt[0]>=8)g.point(0,"8 KNIVES!");else if(g.cnt[1]>=8)g.point(1,"8 KNIVES!");
},
draw(g,ctx){
ctx.fillStyle="#1d1530";ctx.fillRect(0,0,W,H);
ctx.fillStyle="#8a5a2a";ctx.beginPath();ctx.arc(450,250,78,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#3a2a1a";ctx.lineWidth=5;ctx.stroke();
ctx.strokeStyle="#a8743a";ctx.lineWidth=3;for(const r of[56,34,14]){ctx.beginPath();ctx.arc(450,250,r,0,Math.PI*2);ctx.stroke();}
for(const k of g.stuck){
const A=k.a+g.rot;
const x=450+Math.cos(A)*78,y=250+Math.sin(A)*78;
ctx.save();ctx.translate(x,y);ctx.rotate(A);
ctx.fillStyle="#e8e8f0";ctx.fillRect(0,-4,46,8);ctx.fillStyle=col(k.i);ctx.fillRect(40,-5,26,10);ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(0,-4,46,8);
ctx.restore();
}
for(const f of g.fly){ctx.fillStyle="#e8e8f0";ctx.fillRect(f.x-4,f.y-24,8,48);ctx.fillStyle=col(f.i);ctx.fillRect(f.x-5,f.y+14,10,16);}
for(let i=0;i<2;i++){const cx=i?600:300;ctx.fillStyle="#e8e8f0";ctx.fillRect(cx-4,446,8,48);ctx.fillStyle=col(i);ctx.fillRect(cx-5,480,10,16);g.text("P"+(i+1)+"  "+g.cnt[i]+"/8",cx,436,16,col(i),"center");}
}
});
})();
