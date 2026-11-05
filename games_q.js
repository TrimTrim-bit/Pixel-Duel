/* =====================================================
   GAME PACK Q — 8 puzzle/tactical games (FIXED)
   Mind Reader, Box Pusher, Word Chain, Path Drawer,
   Shadow Match, Jenga Tower, Cipher Duel, Tower Defense Duel
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* ---------- 1. MIND READER (Mastermind) ---------- */
const MRC=["#ff4a4a","#4aff7a","#4a8aff","#ffd24a","#c46aff","#ff9a3a"];
function evalGuess(guess,code){
let bulls=0,cows=0;
const gUsed=[],cUsed=[];
for(let i=0;i<4;i++){
if(guess[i]===code[i]){bulls++;gUsed.push(i);cUsed.push(i);}
}
for(let i=0;i<4;i++){
if(gUsed.includes(i))continue;
for(let j=0;j<4;j++){
if(cUsed.includes(j))continue;
if(guess[i]===code[j]){cows++;cUsed.push(j);break;}
}
}
return{bulls,cows};
}
micro({id:"mindreaderGame",title:"Mind Reader",desc:"Set a code. Crack rival's code faster.",
cat:"brain",key:"mindreader",win:1,hud:false,
controls:"Press 1-6 for colors, BACKSPACE to undo, SPACE to submit 4-color code. SET phase then alternate guesses.",
init(g){
g.phase="set";
g.codes=[null,null];
g.settingPlayer=0;
g.settingColors=[];
g.guessHist=[[],[]];
g.guessCount=[0,0];
g.guessPlayer=0;
g.currentGuess=[];
},
update(g,dt){
if(g.phase==="set"){
for(let k=0;k<6;k++){
if(g.pk[String(k+1)]&&g.settingColors.length<4){
g.settingColors.push(k);
FX.tone(500+k*60,.05,"square",.03);
}
}
if(g.pk["backspace"]&&g.settingColors.length>0){
g.settingColors.pop();
}
if(g.pk[" "]&&g.settingColors.length===4){
g.codes[g.settingPlayer]=g.settingColors.slice();
if(g.settingPlayer===0){g.settingPlayer=1;g.settingColors=[];}
else{g.phase="crack";g.guessPlayer=0;g.currentGuess=[];}
FX.tone(700,.1,"square",.05);
}
} else {
for(let k=0;k<6;k++){
if(g.pk[String(k+1)]&&g.currentGuess.length<4){
g.currentGuess.push(k);
FX.tone(500+k*60,.05,"square",.03);
}
}
if(g.pk["backspace"]&&g.currentGuess.length>0){
g.currentGuess.pop();
}
if(g.pk[" "]&&g.currentGuess.length===4){
const code=g.codes[1-g.guessPlayer];
const fb=evalGuess(g.currentGuess,code);
g.guessHist[g.guessPlayer].push({guess:g.currentGuess.slice(),fb});
g.guessCount[g.guessPlayer]++;
FX.tone(fb.bulls===4?1000:500,.12,"square",.05);
if(fb.bulls===4){g.end(g.guessPlayer);return;}
if(g.guessCount[g.guessPlayer]>=8){g.end(1-g.guessPlayer);return;}
g.currentGuess=[];
g.guessPlayer=1-g.guessPlayer;
}
}
},
draw(g,ctx){
ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
if(g.phase==="set"){
const p=g.settingPlayer;
g.text("P"+(p+1)+" SETS CODE",W/2,50,26,col(p),"center");
g.text("Press 1-6 · BACKSPACE undo · SPACE submit",W/2,80,14,"#9fc0ff","center");
for(let k=0;k<4;k++){
const x=320+k*90;
ctx.fillStyle="#2a2f63";ctx.fillRect(x-30,140,60,60);
ctx.strokeStyle=col(p);ctx.lineWidth=3;ctx.strokeRect(x-30,140,60,60);
if(k<g.settingColors.length){
ctx.fillStyle=MRC[g.settingColors[k]];
ctx.beginPath();ctx.arc(x,170,22,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
}
}
for(let k=0;k<6;k++){
const x=150+k*100;
ctx.fillStyle=MRC[k];ctx.fillRect(x-25,300,50,50);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(x-25,300,50,50);
g.text(String(k+1),x,380,16,"#fff","center");
}
if(g.codes[0])g.text("P1 code locked ✓",W/2,440,14,GREEN,"center");
} else {
const p=g.guessPlayer;
g.text("P"+(p+1)+" CRACKING — GUESSES "+g.guessCount[p]+"/8",W/2,40,22,col(p),"center");
g.guessHist[p].slice(-4).forEach((h,k)=>{
const y=80+k*70;
h.guess.forEach((c,j)=>{
const x=180+j*55;
ctx.fillStyle=MRC[c];
ctx.beginPath();ctx.arc(x,y+15,18,0,Math.PI*2);ctx.fill();
});
g.text("●".repeat(h.fb.bulls)+" ○".repeat(h.fb.cows),480,y+22,18,GOLD);
});
g.text("CURRENT GUESS",W/2,390,14,"#9fc0ff","center");
for(let k=0;k<4;k++){
const x=320+k*70;
ctx.fillStyle="#2a2f63";ctx.fillRect(x-25,410,50,50);
ctx.strokeStyle=col(p);ctx.lineWidth=2;ctx.strokeRect(x-25,410,50,50);
if(k<g.currentGuess.length){
ctx.fillStyle=MRC[g.currentGuess[k]];
ctx.beginPath();ctx.arc(x,435,20,0,Math.PI*2);ctx.fill();
}
}
for(let k=0;k<6;k++){
const x=110+k*50;
ctx.fillStyle=MRC[k];ctx.fillRect(x-18,485,36,10);
}
}
}
});

/* ---------- 2. BOX PUSHER ---------- */
const SOKO_MAP=[
"##########",
"#........#",
"#..B..B..#",
"#..G..G..#",
"#........#",
"#..P..P..#",
"##########"
];
function sokoSolved(grid){
return grid.every(row=>!row.includes("B")&&!row.includes("P"));
}
micro({id:"sokoGame",title:"Box Pusher",desc:"Push both boxes onto goals. First to solve wins.",
cat:"brain",key:"soko",win:3,
controls:"P1: WASD　 P2: ARROWS — push each box onto a goal. Can't pull, only push.",
round(g){
g.grids=[];
for(let i=0;i<2;i++){
const grid=[];
for(let r=0;r<SOKO_MAP.length;r++){
grid.push(SOKO_MAP[r].split("").map(c=>c==="P"?".":c));
}
g.grids.push(grid);
}
g.pl=[{x:3,y:5},{x:6,y:5}];
g.cd=[0,0];
},
update(g,dt){
g.cd[0]=Math.max(0,g.cd[0]-dt);
g.cd[1]=Math.max(0,g.cd[1]-dt);
const solved=[false,false];
for(let i=0;i<2;i++){
if(g.cd[i]>0)continue;
const I=g.I[i];
let dx=0,dy=0;
if(I.pl)dx=-1;else if(I.pr)dx=1;else if(I.pu)dy=-1;else if(I.pd)dy=1;
if(!dx&&!dy)continue;
const p=g.pl[i],grid=g.grids[i];
const tx=p.x+dx,ty=p.y+dy;
if(!grid[ty]||!grid[ty][tx])continue;
const target=grid[ty][tx];
if(target==="#")continue;
if(target==="B"||target==="O"){
const bx=tx+dx,by=ty+dy;
if(!grid[by]||!grid[by][bx])continue;
const bt=grid[by][bx];
if(bt==="."||bt==="G"){
grid[ty][tx]=target==="O"?"G":".";
grid[by][bx]=bt==="G"?"O":"B";
p.x=tx;p.y=ty;
g.cd[i]=.13;
FX.tone(500,.04,"square",.03);
}
} else {
p.x=tx;p.y=ty;
g.cd[i]=.11;
}
solved[i]=sokoSolved(grid);
}
if(solved[0]&&solved[1])g.next("BOTH SOLVED");
else if(solved[0])g.point(0,"P1 SOLVED");
else if(solved[1])g.point(1,"P2 SOLVED");
},
draw(g,ctx){
ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
for(let i=0;i<2;i++){
const sz=28,ox=i?525:125,oy=90;
ctx.fillStyle="#1a2050";ctx.fillRect(ox-6,oy-6,sz*10+12,sz*7+12);
ctx.strokeStyle=col(i);ctx.lineWidth=2;ctx.strokeRect(ox-6,oy-6,sz*10+12,sz*7+12);
for(let r=0;r<g.grids[i].length;r++)for(let c=0;c<g.grids[i][r].length;c++){
const x=ox+c*sz,y=oy+r*sz,v=g.grids[i][r][c];
if(v==="#"){ctx.fillStyle="#4a3a6a";ctx.fillRect(x,y,sz,sz);}
else if(v==="G"){ctx.fillStyle="#1a1a3a";ctx.fillRect(x,y,sz,sz);
ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(x+sz/2,y+sz/2,5,0,Math.PI*2);ctx.fill();}
else if(v==="B"){ctx.fillStyle="#1a1a3a";ctx.fillRect(x,y,sz,sz);
ctx.fillStyle="#c88a4a";ctx.fillRect(x+3,y+3,sz-6,sz-6);}
else if(v==="O"){ctx.fillStyle="#1a1a3a";ctx.fillRect(x,y,sz,sz);
ctx.fillStyle=GREEN;ctx.fillRect(x+3,y+3,sz-6,sz-6);}
else{ctx.fillStyle="#1a1a3a";ctx.fillRect(x,y,sz,sz);}
}
const p=g.pl[i];
g.blob({x:ox+p.x*sz+sz/2,y:oy+p.y*sz+sz/2,r:10},col(i),ox+p.x*sz+sz/2,oy+p.y*sz+sz/2,false);
g.text("P"+(i+1),ox+sz*5,70,20,col(i),"center");
}
}
});

/* ---------- 3. WORD CHAIN ---------- */
const WC_WORDS=["apple","elephant","tiger","rabbit","tree","eagle","lion","nail","lake","egg","goat","toad","dog","grape","eagle","ice","cat","top","pig","gum","man","nap","pear","rat","snake","ant","yak","kite","fox","ox"];
micro({id:"wordchainGame",title:"Word Chain",desc:"Pick a word starting with the last letter of the previous.",
cat:"brain",key:"wordchain",win:5,
controls:"P1: A/W/D pick　 P2: ←/↑/→ — one option correctly follows the chain",
round(g){
const cur=WC_WORDS[ri(0,WC_WORDS.length-1)];
const last=cur[cur.length-1];
const valid=WC_WORDS.filter(w=>w[0]===last&&w!==cur);
const correct=valid.length?valid[ri(0,valid.length-1)]:WC_WORDS[0];
const opts=[correct];
while(opts.length<3){
const w=WC_WORDS[ri(0,WC_WORDS.length-1)];
if(!opts.includes(w))opts.push(w);
}
opts.sort(()=>Math.random()-.5);
g.word=cur;g.opts=opts;g.answer=opts.indexOf(correct);
g.lock=[0,0];g.tl=8;
},
update(g,dt){
g.tl-=dt;
if(g.tl<=0){g.next("TIME UP");return;}
for(let i=0;i<2;i++){
g.lock[i]=Math.max(0,g.lock[i]-dt);
if(g.lock[i]>0)continue;
const I=g.I[i];
const k=I.pl?0:I.pu?1:I.pr?2:-1;
if(k<0)continue;
if(k===g.answer){g.point(i);return;}
g.lock[i]=1;FX.tone(120,.2,"sawtooth",.05,-40);
}
},
draw(g,ctx){
ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
g.text("STARTS WITH '"+g.word[g.word.length-1].toUpperCase()+"'",W/2,70,20,"#9fc0ff","center");
g.text(g.word.toUpperCase(),W/2,160,56,GOLD,"center");
g.opts.forEach((w,k)=>{
const x=180+k*280;
ctx.fillStyle="#2a2f63";ctx.fillRect(x-120,240,240,80);
ctx.strokeStyle=GOLD;ctx.lineWidth=3;ctx.strokeRect(x-120,240,240,80);
g.text(w.toUpperCase(),x,290,24,"#fff","center");
g.text(["◀","▲","▶"][k],x,350,20,"#9fc0ff","center");
});
for(let i=0;i<2;i++)if(g.lock[i]>0)g.text("P"+(i+1)+" WRONG",i?675:225,420,18,RED,"center");
ctx.fillStyle="#2a2f63";ctx.fillRect(250,455,400,8);ctx.fillStyle=GOLD;ctx.fillRect(250,455,400*Math.max(0,g.tl)/8,8);
}
});

/* ---------- 4. PATH DRAWER ---------- */
micro({id:"pathdrawerGame",title:"Path Drawer",desc:"Draw a path. Ball follows it. Hit the rings.",
cat:"brain",key:"pathdrawer",win:3,
controls:"P1: WASD move pen, SPACE launch　 P2: ARROWS, ENTER — pass through all 5 rings",
round(g){
g.pl=[
{pen:{x:100,y:250},points:[{x:100,y:250}],ball:null,ballX:0,ballY:0},
{pen:{x:800,y:250},points:[{x:800,y:250}],ball:null,ballX:0,ballY:0}
];
g.rings=Array.from({length:5},(_,k)=>({x:200+k*140,y:100+Math.sin(k*1.7)*80,r:22,hit:[false,false]}));
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
if(p.ball){
p.ball.t+=dt*1.6;
if(p.ball.t>=1){p.ball=null;}
return;
}
const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0),l=Math.hypot(ax,ay)||1;
if(l){
p.pen.x=cl(p.pen.x+ax/l*220*dt,40,W-40);
p.pen.y=cl(p.pen.y+ay/l*220*dt,60,H-40);
p.points.push({x:p.pen.x,y:p.pen.y});
if(p.points.length>500)p.points.shift();
}
if(I.pa&&p.points.length>5){
p.ball={t:0};
FX.tone(500,.1,"triangle",.04);
}
});
g.pl.forEach((p,i)=>{
if(!p.ball)return;
const t=p.ball.t;
const n=p.points.length-1;
const idx=Math.min(Math.floor(t*n),n-1);
const frac=t*n-idx;
const cur=p.points[idx],nxt=p.points[Math.min(idx+1,n)];
p.ballX=cur.x+(nxt.x-cur.x)*frac;
p.ballY=cur.y+(nxt.y-cur.y)*frac;
g.rings.forEach(r=>{
if(!r.hit[i]&&Math.hypot(p.ballX-r.x,p.ballY-r.y)<r.r+12){
r.hit[i]=true;
g.burst(r.x,r.y,GOLD,8,200);
FX.tone(700,.05,"square",.04);
if(g.rings.every(rr=>rr.hit[i]))g.point(i,"ALL RINGS");
}
});
});
},
draw(g,ctx){
g.floor("#13102a","#1a1a3a");
g.rings.forEach(r=>{
ctx.strokeStyle=GOLD;ctx.lineWidth=3;
ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,Math.PI*2);ctx.stroke();
if(!r.hit[0]){ctx.fillStyle=C1;ctx.beginPath();ctx.arc(r.x-28,r.y,4,0,Math.PI*2);ctx.fill();}
if(!r.hit[1]){ctx.fillStyle=C2;ctx.beginPath();ctx.arc(r.x+28,r.y,4,0,Math.PI*2);ctx.fill();}
});
g.pl.forEach((p,i)=>{
ctx.strokeStyle=col(i);ctx.lineWidth=3;ctx.globalAlpha=.6;
ctx.beginPath();
p.points.forEach((pt,k)=>{if(k===0)ctx.moveTo(pt.x,pt.y);else ctx.lineTo(pt.x,pt.y);});
ctx.stroke();ctx.globalAlpha=1;
if(p.ball){
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(p.ballX,p.ballY,8,0,Math.PI*2);ctx.fill();
}
g.blob({x:p.pen.x,y:p.pen.y,r:12},col(i),p.pen.x,p.pen.y,false);
});
}
});

/* ---------- 5. SHADOW MATCH ---------- */
function makeShape(seed){
const s=[];
const r=seeded(seed);
const n=6+Math.floor(r()*3);
for(let k=0;k<n;k++){
const a=k/n*Math.PI*2;
s.push({x:Math.cos(a)*(30+r()*20),y:Math.sin(a)*(30+r()*20)});
}
return s;
}
function drawShape(ctx,cx,cy,pts,color){
ctx.fillStyle=color;
ctx.beginPath();
pts.forEach((p,k)=>{if(k===0)ctx.moveTo(cx+p.x,cy+p.y);else ctx.lineTo(cx+p.x,cy+p.y);});
ctx.closePath();ctx.fill();
}
micro({id:"shadowmatchGame",title:"Shadow Match",desc:"Pick the shadow that matches the shape.",
cat:"brain",key:"shadowmatch",win:5,
controls:"P1: A/W/D pick　 P2: ←/↑/→ — three shadows shown, one matches",
round(g){
const seed=ri(1,1e6);
const correct=makeShape(seed);
const opts=[correct];
while(opts.length<3)opts.push(makeShape(seed+ri(1,100)));
opts.sort(()=>Math.random()-.5);
g.shape=correct;g.opts=opts;g.answer=opts.indexOf(correct);
g.lock=[0,0];g.tl=8;
},
update(g,dt){
g.tl-=dt;
if(g.tl<=0){g.next("TIME UP");return;}
for(let i=0;i<2;i++){
g.lock[i]=Math.max(0,g.lock[i]-dt);
if(g.lock[i]>0)continue;
const I=g.I[i];
const k=I.pl?0:I.pu?1:I.pr?2:-1;
if(k<0)continue;
if(k===g.answer){g.point(i);return;}
g.lock[i]=1;FX.tone(120,.2,"sawtooth",.05,-40);
}
},
draw(g,ctx){
ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
g.text("MATCH THE SHAPE",W/2,50,24,"#9fc0ff","center");
drawShape(ctx,450,160,g.shape,"#fff");
g.opts.forEach((sh,k)=>{
const x=180+k*280,y=350;
ctx.fillStyle="#2a2f63";ctx.fillRect(x-90,y-70,180,140);
drawShape(ctx,x,y,sh,"#000");
g.text(["◀","▲","▶"][k],x,y+90,20,"#9fc0ff","center");
});
for(let i=0;i<2;i++)if(g.lock[i]>0)g.text("P"+(i+1)+" WRONG",i?675:225,470,16,RED,"center");
}
});

/* ---------- 6. JENGA TOWER ---------- */
micro({id:"jengaGame",title:"Jenga Tower",desc:"Pull blocks. Whoever topples it loses.",
cat:"brain",key:"jenga",win:3,
controls:"Click a block to pull it out. If the tower falls, you lose the round. Take turns.",
round(g){
g.blocks=[];
for(let lvl=0;lvl<8;lvl++){
const horiz=lvl%2===0;
for(let k=0;k<3;k++){
g.blocks.push({
x:horiz?350+k*80:380,
y:H-100-lvl*40,
w:horiz?76:220,
h:36,
lvl,alive:true,
color:`hsl(${30+lvl*30},70%,55%)`
});
}
}
g.turn=0;g.falling=0;
},
click(g,x,y){
if(g.falling>0)return;
for(const b of g.blocks){
if(!b.alive)continue;
if(x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h){
b.alive=false;
const above=g.blocks.filter(o=>o.alive&&o.lvl>b.lvl).length;
if(Math.random()<above*.08){g.falling=.8;FX.playBoom();}
else{FX.tone(400+Math.random()*200,.1,"square",.04);g.turn=1-g.turn;}
break;
}
}
},
update(g,dt){
if(g.falling>0){g.falling-=dt;if(g.falling<=0)g.point(1-g.turn,"TOWER FELL");}
},
draw(g,ctx){
g.floor("#1a1a3a","#22224a");
g.blocks.forEach(b=>{
if(!b.alive)return;
ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y,b.w,b.h);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(b.x,b.y,b.w,b.h);
});
ctx.fillStyle="#4a3a2a";ctx.fillRect(340,H-60,240,30);
g.text("P"+(g.turn+1)+" TURN",W/2,40,24,col(g.turn),"center");
}
});

/* ---------- 7. CIPHER DUEL ---------- */
const CD_WORDS=["cat","dog","sun","map","ice","box","key","owl","pen","ear","arm","eye","jar","sky","red","bit","few","old","new","hat"];
const CD_ALPHA="abcdefghijklmnopqrstuvwxyz";
function makeCipher(shift){
return w=>w.split("").map(c=>CD_ALPHA[(CD_ALPHA.indexOf(c)+shift+26)%26]).join("");
}
micro({id:"cipherGame",title:"Cipher Duel",desc:"Decode the shifted word. Fastest wins.",
cat:"brain",key:"cipher",win:5,
controls:"P1: A/W/D pick　 P2: ←/↑/→ — identify the original word",
round(g){
const word=CD_WORDS[ri(0,CD_WORDS.length-1)];
const shift=ri(1,25);
const cipher=makeCipher(shift)(word);
const opts=[word];
while(opts.length<3){
const w=CD_WORDS[ri(0,CD_WORDS.length-1)];
if(!opts.includes(w))opts.push(w);
}
opts.sort(()=>Math.random()-.5);
g.cipher=cipher.toUpperCase();g.opts=opts;g.answer=opts.indexOf(word);
g.lock=[0,0];g.tl=10;
},
update(g,dt){
g.tl-=dt;
if(g.tl<=0){g.next("TIME UP");return;}
for(let i=0;i<2;i++){
g.lock[i]=Math.max(0,g.lock[i]-dt);
if(g.lock[i]>0)continue;
const I=g.I[i];
const k=I.pl?0:I.pu?1:I.pr?2:-1;
if(k<0)continue;
if(k===g.answer){g.point(i);return;}
g.lock[i]=1;FX.tone(120,.2,"sawtooth",.05,-40);
}
},
draw(g,ctx){
ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
g.text("DECODE THIS (SHIFTED ALPHABET)",W/2,50,20,"#9fc0ff","center");
g.text(g.cipher,W/2,160,72,GOLD,"center");
g.opts.forEach((w,k)=>{
const x=180+k*280;
ctx.fillStyle="#2a2f63";ctx.fillRect(x-110,250,220,80);
ctx.strokeStyle=GOLD;ctx.lineWidth=3;ctx.strokeRect(x-110,250,220,80);
g.text(w.toUpperCase(),x,300,28,"#fff","center");
g.text(["◀","▲","▶"][k],x,360,20,"#9fc0ff","center");
});
for(let i=0;i<2;i++)if(g.lock[i]>0)g.text("P"+(i+1)+" WRONG",i?675:225,430,18,RED,"center");
ctx.fillStyle="#2a2f63";ctx.fillRect(250,460,400,8);ctx.fillStyle=GOLD;ctx.fillRect(250,460,400*Math.max(0,g.tl)/10,8);
}
});

/* ---------- 8. TOWER DEFENSE DUEL ---------- */
micro({id:"tdduelGame",title:"Tower Defense Duel",desc:"Build turrets. Stop rival's creeps from reaching your base.",
cat:"action",key:"tdduel",win:3,
controls:"P1: A/D move cursor, W/S change height, SPACE build turret (30 gold)　 P2: ARROWS, ENTER — creeps damage enemy base",
round(g){
g.gold=[50,50];
g.hp=[10,10];
g.turrets=[[],[]];
g.creeps=[];
g.bullets=[];
g.cursors=[{x:150,y:250},{x:W-150,y:250}];
g.waveT=1.5;
g.tl=0;
},
update(g,dt){
g.tl+=dt;
g.gold[0]+=6*dt;g.gold[1]+=6*dt;
for(let i=0;i<2;i++){
const I=g.I[i];
const minX=i===0?60:480,maxX=i===0?420:840;
g.cursors[i].x=cl(g.cursors[i].x+((I.r?1:0)-(I.l?1:0))*150*dt,minX,maxX);
g.cursors[i].y=cl(g.cursors[i].y+((I.d?1:0)-(I.u?1:0))*150*dt,120,380);
if(I.pa&&g.gold[i]>=30){
const ok=g.turrets[i].every(t=>Math.hypot(t.x-g.cursors[i].x,t.y-g.cursors[i].y)>44);
if(ok){
g.gold[i]-=30;
g.turrets[i].push({x:g.cursors[i].x,y:g.cursors[i].y,cd:0});
FX.tone(500,.1,"square",.04);
}
}
}
g.waveT-=dt;
if(g.waveT<=0){
g.waveT=Math.max(1.5,3-g.tl*.03);
g.creeps.push({x:-30,y:250,hp:5,owner:0,sp:60});
g.creeps.push({x:W+30,y:250,hp:5,owner:1,sp:-60});
}
for(const c of g.creeps)c.x+=c.sp*dt;
for(let i=0;i<2;i++){
for(const t of g.turrets[i]){
t.cd=Math.max(0,t.cd-dt);
if(t.cd<=0){
const enemies=g.creeps.filter(c=>c.owner!==i&&c.hp>0);
if(enemies.length){
let near=enemies[0],nd=Math.hypot(enemies[0].x-t.x,enemies[0].y-t.y);
for(const e of enemies){
const d=Math.hypot(e.x-t.x,e.y-t.y);
if(d<nd){nd=d;near=e;}
}
t.cd=.7;
const dx=near.x-t.x,dy=near.y-t.y,d=Math.hypot(dx,dy)||1;
g.bullets.push({x:t.x,y:t.y,vx:dx/d*400,vy:dy/d*400,owner:i,life:1.5});
}
}
}
}
for(const b of g.bullets){
b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
if(b.life<=0){b.dead=true;continue;}
for(const c of g.creeps){
if(c.hp<=0||c.owner===b.owner)continue;
if(Math.hypot(c.x-b.x,c.y-b.y)<18){
c.hp--;b.dead=true;
g.burst(b.x,b.y,col(b.owner),4,120);
if(c.hp<=0){g.burst(c.x,c.y,col(b.owner),10,200);FX.tone(600,.05,"square",.03);}
break;
}
}
}
g.bullets=g.bullets.filter(b=>!b.dead);
for(const c of g.creeps){
if(c.hp<=0)continue;
if(c.owner===0&&c.x>W-40){
g.hp[1]-=2;c.hp=0;
g.burst(W-20,c.y,RED,20,300);FX.playBoom();
}
if(c.owner===1&&c.x<40){
g.hp[0]-=2;c.hp=0;
g.burst(20,c.y,RED,20,300);FX.playBoom();
}
}
g.creeps=g.creeps.filter(c=>c.hp>0);
if(g.hp[0]<=0&&g.hp[1]<=0)g.next("BOTH DESTROYED");
else if(g.hp[0]<=0)g.point(1,"P1 BASE FALLS");
else if(g.hp[1]<=0)g.point(0,"P2 BASE FALLS");
else if(g.tl>60)g.byScore([g.hp[0],g.hp[1]]);
},
draw(g,ctx){
g.floor("#0a1020","#121a3a");
ctx.fillStyle=C1;ctx.fillRect(0,150,60,200);
ctx.fillStyle=C2;ctx.fillRect(W-60,150,60,200);
g.text("P1 BASE "+g.hp[0],80,50,14,C1);
g.text("P2 BASE "+g.hp[1],W-80,50,14,C2,"right");
g.text("GOLD "+Math.floor(g.gold[0]),80,70,12,GOLD);
g.text("GOLD "+Math.floor(g.gold[1]),W-80,70,12,GOLD,"right");
g.turrets.forEach((arr,i)=>{
arr.forEach(t=>{
ctx.fillStyle=col(i);ctx.fillRect(t.x-12,t.y-12,24,24);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(t.x-12,t.y-12,24,24);
ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(t.x,t.y,5,0,Math.PI*2);ctx.fill();
});
});
g.creeps.forEach(c=>{
ctx.fillStyle=col(c.owner);
ctx.fillRect(c.x-10,c.y-10,20,20);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(c.x-10,c.y-10,20,20);
ctx.fillStyle="#2a2f63";ctx.fillRect(c.x-10,c.y-18,20,3);
ctx.fillStyle=GREEN;ctx.fillRect(c.x-10,c.y-18,20*Math.max(0,c.hp)/5,3);
});
g.bullets.forEach(b=>{
ctx.fillStyle=col(b.owner);ctx.beginPath();ctx.arc(b.x,b.y,4,0,Math.PI*2);ctx.fill();
});
g.cursors.forEach((c,i)=>{
ctx.strokeStyle=col(i);ctx.lineWidth=2;
ctx.strokeRect(c.x-14,c.y-14,28,28);
});
g.text(Math.max(0,Math.ceil(60-g.tl))+"s",W/2,30,20,GOLD,"center");
}
});
})();