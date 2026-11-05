/* =====================================================
   GAME PACK U — 8 games (FIXED)
   Liar's Dice, Nonogram 5x5, Boggle, Dominoes,
   Yacht, Sudoku 4x4, Fishing Duel, Slot Machine
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;
const rollN=n=>Array.from({length:n},()=>ri(1,6));

function drawPips(ctx,x,y,v){
const P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
ctx.fillStyle="#11152b";
(P[v]||[]).forEach(([a,b])=>{ctx.beginPath();ctx.arc(x+25+a*15,y+25+b*15,4,0,Math.PI*2);ctx.fill();});
}

/* ---------- 1. LIAR'S DICE ---------- */
micro({id:"liarsdiceGame",title:"Liar's Dice",desc:"Bluff about dice. Challenge when they're lying.",
cat:"brain",key:"liarsdice",win:1,hud:false,
controls:"Your dice shown. Press 1-6 to bid 'current qty + 1 of face X'. SPACE challenges the rival's last bid.",
init(g){
g.p1=rollN(5);g.p2=rollN(5);
g.p1Count=5;g.p2Count=5;
g.turn=0;
g.bid={qty:0,face:0,bidder:-1};
},
update(g,dt){
for(let k=1;k<=6;k++){
if(g.pk[String(k)]){
if(g.turn===0&&g.p1Count>0){g.bid={qty:g.bid.qty+1,face:k,bidder:0};g.turn=1;FX.tone(400+k*40,.08,"square",.04);}
else if(g.turn===1&&g.p2Count>0){g.bid={qty:g.bid.qty+1,face:k,bidder:1};g.turn=0;FX.tone(400+k*40,.08,"square",.04);}
}
}
if(g.pk[" "]){
if(g.bid.bidder<0||g.bid.bidder===g.turn)return;
const challenger=g.turn;
const allDice=[...g.p1,...g.p2];
const count=allDice.filter(d=>d===g.bid.face).length;
const liar=count<g.bid.qty;
const loser=liar?g.bid.bidder:challenger;
FX.playBoom();
if(loser===0){g.p1Count--;g.p1=rollN(g.p1Count);}
else{g.p2Count--;g.p2=rollN(g.p2Count);}
if(g.p1Count<=0){g.byScore([0,1]);return;}
if(g.p2Count<=0){g.byScore([1,0]);return;}
g.bid={qty:0,face:0,bidder:-1};
g.turn=loser===0?1:0;
}
},
draw(g,ctx){
g.floor("#1a1530","#221a3a");
g.text("LIAR'S DICE",W/2,40,28,GOLD,"center");
for(let k=0;k<g.p1.length;k++){
const x=60+k*60,y=140;
ctx.fillStyle="#fff";ctx.fillRect(x,y,50,50);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(x,y,50,50);
drawPips(ctx,x,y,g.p1[k]);
}
for(let k=0;k<g.p2.length;k++){
const x=W-60-k*60-50,y=140;
ctx.fillStyle="#fff";ctx.fillRect(x,y,50,50);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(x,y,50,50);
drawPips(ctx,x,y,g.p2[k]);
}
g.text("P1 DICE ("+g.p1Count+")",150,220,16,C1,"center");
g.text("P2 DICE ("+g.p2Count+")",W-150,220,16,C2,"center");
if(g.bid.qty>0){
g.text("BID: "+g.bid.qty+" × "+g.bid.face+"s",W/2,280,32,GOLD,"center");
g.text("by P"+(g.bid.bidder+1),W/2,315,16,"#9fc0ff","center");
}else g.text("NO BID YET",W/2,290,22,"#9fc0ff","center");
ctx.fillStyle=col(g.turn);
ctx.fillRect(g.turn?W-40:20,340,20,200);
g.text("P"+(g.turn+1)+"'S TURN",W/2,380,24,col(g.turn),"center");
g.text("Press 1-6 to bid · SPACE to challenge",W/2,430,14,"#9fc0ff","center");
}
});

/* ---------- 2. NONOGRAM 5x5 ---------- */
const NONO_PUZZLES=[
{grid:[[1,1,0,1,1],[1,1,0,1,1],[0,0,0,0,0],[1,1,1,1,0],[0,1,1,1,0]],
rows:[[2,2],[2,2],[],[4],[3]],cols:[[2,2],[2,2],[0],[3,1],[3]]},
{grid:[[0,1,1,0,0],[1,1,1,0,0],[0,1,1,1,0],[0,0,1,1,1],[0,0,1,1,0]],
rows:[[2],[3],[3],[3],[2]],cols:[[1],[3],[5],[2],[1]]},
{grid:[[1,1,1,1,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
rows:[[5],[1,1],[1],[1,1],[1,1]],cols:[[2],[3],[1],[3],[2]]}
];
micro({id:"nonogramGame",title:"Nonogram 5x5",desc:"Fill cells to match row and column clues.",
cat:"brain",key:"nonogram",win:3,
controls:"Click cells to toggle. Solve your puzzle before rival solves theirs.",
round(g){
const idx=ri(0,NONO_PUZZLES.length-1);
g.puzzle=NONO_PUZZLES[idx];
g.grids=[Array.from({length:5},()=>new Array(5).fill(0)),
         Array.from({length:5},()=>new Array(5).fill(0))];
},
click(g,x,y){
for(let p=0;p<2;p++){
const ox=p?540:100,oy=140,sz=50;
if(x>ox&&x<ox+sz*5&&y>oy&&y<oy+sz*5){
const c=Math.floor((x-ox)/sz),r=Math.floor((y-oy)/sz);
g.grids[p][r][c]=g.grids[p][r][c]?0:1;
FX.tone(500,.03,"square",.02);
const solved=g.grids[p].every((row,r)=>row.every((v,c)=>!!v===!!g.puzzle.grid[r][c]));
if(solved)g.point(p,"SOLVED");
return;
}
}
},
draw(g,ctx){
g.floor("#1a2050","#0a1020");
for(let p=0;p<2;p++){
const ox=p?540:100,oy=140,sz=50;
for(let c=0;c<5;c++){
const clue=g.puzzle.cols[c];
clue.forEach((n,i)=>{g.text(String(n),ox+c*sz+sz/2,oy-40+(i-clue.length+1)*18,14,col(p),"center");});
}
for(let r=0;r<5;r++){
const clue=g.puzzle.rows[r];
clue.forEach((n,i)=>{g.text(String(n),ox-25-(clue.length-1-i)*18,oy+r*sz+sz/2+6,14,col(p),"center");});
}
ctx.fillStyle="#1a1a3a";ctx.fillRect(ox-4,oy-4,sz*5+8,sz*5+8);
for(let r=0;r<5;r++)for(let c=0;c<5;c++){
const x=ox+c*sz,y=oy+r*sz;
ctx.fillStyle=g.grids[p][r][c]?"#64eaff":"#2a2f63";
ctx.fillRect(x+1,y+1,sz-2,sz-2);
ctx.strokeStyle="#080b18";ctx.lineWidth=1;ctx.strokeRect(x+1,y+1,sz-2,sz-2);
}
g.text("P"+(p+1),ox+sz*2.5,110,20,col(p),"center");
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* ---------- 3. BOGGLE ---------- */
const BOGGLE_WORDS=["cat","dog","run","sun","fun","big","fig","top","pup","cup","bat","hat","mat","rat","sat","wit","bit","dig","pig","wig","hot","pot","got","dot","net","pet","set","wet","bet","jet","log","fog","jog","bug","hug","mug","rug","tug","map","nap","tap","cap","lap","red","bed","fed","led","god","mod","nod","rod","sod","cod","die","lie","pie","tie","vie"];
micro({id:"boggleGame",title:"Boggle",desc:"Find words in the letter grid. 30 seconds.",
cat:"brain",key:"boggle",win:1,hud:false,
controls:"Click letters to spell a word. SPACE to submit. Must be ≥3 letters.",
init(g){
const letters="AAAABBCCDDEEFFGGHHIIKKLLMMNNNOOOPPQRRSSTTTUVWYYZZ";
g.letters=[];
const pool=letters.split("");
for(let i=0;i<16;i++){
const k=Math.floor(Math.random()*pool.length);
g.letters.push(pool.splice(k,1)[0]);
}
g.s=[0,0];g.words=[[],[]];g.tl=30;g.sel=[[],[]];g.found=new Set();
},
update(g,dt){
g.tl-=dt;
if(g.tl<=0)g.byScore(g.s);
for(let p=0;p<2;p++){
if(g.pk[" "]&&g.sel[p].length>=3){
const word=g.sel[p].map(i=>g.letters[i].toLowerCase()).join("");
if(BOGGLE_WORDS.includes(word)&&!g.found.has(word)){
g.found.add(word);
g.words[p].push(word);
g.s[p]+=word.length;
FX.tone(700,.1,"square",.04);
} else if(g.found.has(word))FX.tone(200,.1,"square",.03);
g.sel[p]=[];
}
}
},
click(g,x,y){
const sz=80,ox=290,oy=120;
if(x<ox||x>ox+sz*4||y<oy||y>oy+sz*4)return;
const c=Math.floor((x-ox)/sz),r=Math.floor((y-oy)/sz);
const idx=r*4+c;
for(let p=0;p<2;p++){
if(g.sel[p].length===0){g.sel[p].push(idx);return;}
const last=g.sel[p][g.sel[p].length-1];
const lr=Math.floor(last/4),lc=last%4;
if(Math.abs(lr-r)<=1&&Math.abs(lc-c)<=1&&last!==idx&&!g.sel[p].includes(idx)){
g.sel[p].push(idx);
return;
}
}
},
draw(g,ctx){
g.floor("#13102a","#1a1a3a");
const sz=80,ox=290,oy=120;
for(let r=0;r<4;r++)for(let c=0;c<4;c++){
const idx=r*4+c,x=ox+c*sz,y=oy+r*sz;
const inP1=g.sel[0].includes(idx),inP2=g.sel[1].includes(idx);
let bg="#2a2f63",border="#4a5a9a";
if(inP1){bg="#1a3a5a";border=C1;}
if(inP2){bg="#3a1a3a";border=C2;}
ctx.fillStyle=bg;ctx.fillRect(x+2,y+2,sz-4,sz-4);
ctx.strokeStyle=border;ctx.lineWidth=3;ctx.strokeRect(x+2,y+2,sz-4,sz-4);
g.text(g.letters[idx],x+sz/2,y+sz/2+14,44,"#fff","center");
}
g.text("P1 "+g.s[0]+" · "+g.words[0].length+" words",20,40,18,C1);
g.text("P2 "+g.s[1]+" · "+g.words[1].length+" words",W-20,40,18,C2,"right");
g.text(Math.max(0,Math.ceil(g.tl))+"s",W/2,30,22,g.tl<10?RED:GOLD,"center");
[0,1].forEach(p=>{
const word=g.sel[p].map(i=>g.letters[i].toLowerCase()).join("");
if(word)g.text(word,p?675:225,500,20,col(p),"center");
});
g.text("Click letters to spell · SPACE to submit · Must be ≥3 letters",W/2,520,12,"#9fc0ff","center");
}
});

/* ---------- 4. DOMINOES ---------- */
function makeDominoSet(){
const set=[];
for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)set.push({a,b});
for(let i=set.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[set[i],set[j]]=[set[j],set[i]];}
return set;
}
function drawDomino(ctx,x,y,t,w,fill){
const h=w*.5;
ctx.fillStyle=fill||"#fff";ctx.fillRect(x,y,w,h);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
ctx.beginPath();ctx.moveTo(x+w/2,y);ctx.lineTo(x+w/2,y+h);ctx.stroke();
const P={0:[],1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
ctx.fillStyle="#11152b";
const s=w*.06;
(P[t.a]||[]).forEach(([a,b])=>{ctx.beginPath();ctx.arc(x+w/4+a*(w/4)*.5,y+h/2+b*(h/2)*.5,s,0,Math.PI*2);ctx.fill();});
(P[t.b]||[]).forEach(([a,b])=>{ctx.beginPath();ctx.arc(x+3*w/4+a*(w/4)*.5,y+h/2+b*(h/2)*.5,s,0,Math.PI*2);ctx.fill();});
}
micro({id:"dominoesGame",title:"Dominoes",desc:"Match pips to ends. First to play all tiles wins.",
cat:"brain",key:"dominoes",win:3,
controls:"Click a tile from your hand, then LEFT or RIGHT end of the board to place it.",
round(g){
const set=makeDominoSet();
g.hands=[set.slice(0,7),set.slice(7,14)];
g.board=[];
g.pile=set.slice(14);
g.turn=0;
g.selected=-1;
const starter=g.hands[0].findIndex(t=>t.a===t.b);
if(starter>=0){
g.board.push(g.hands[0][starter]);
g.hands[0].splice(starter,1);
}
},
update(g,dt){},
click(g,x,y){
const p=g.turn;
const hs=90;
for(let k=0;k<g.hands[p].length;k++){
const x0=30+k*(hs+10),y0=450;
if(x>x0&&x<x0+hs&&y>y0&&y<y0+hs){
g.selected=k;
FX.tone(400,.05,"square",.03);
return;
}
}
if(g.selected===undefined||g.selected<0)return;
const tile=g.hands[p][g.selected];
if(g.board.length===0)return;
const leftEnd=g.board[0];
const rightEnd=g.board[g.board.length-1];
if(x<W/2-100&&y>250&&y<400){
if(tile.b===leftEnd.a){
g.board.unshift({a:tile.a,b:tile.b});
g.hands[p].splice(g.selected,1);g.turn=1-g.turn;g.selected=-1;
FX.tone(600,.06,"square",.04);
}else if(tile.a===leftEnd.a){
g.board.unshift({a:tile.b,b:tile.a});
g.hands[p].splice(g.selected,1);g.turn=1-g.turn;g.selected=-1;
FX.tone(600,.06,"square",.04);
}else FX.tone(150,.1,"square",.03);
if(g.hands[p].length===0)g.point(p,"DOMINO!");
return;
}
if(x>W/2+100&&y>250&&y<400){
if(tile.a===rightEnd.b){
g.board.push({a:tile.a,b:tile.b});
g.hands[p].splice(g.selected,1);g.turn=1-g.turn;g.selected=-1;
FX.tone(600,.06,"square",.04);
}else if(tile.b===rightEnd.b){
g.board.push({a:tile.b,b:tile.a});
g.hands[p].splice(g.selected,1);g.turn=1-g.turn;g.selected=-1;
FX.tone(600,.06,"square",.04);
}else FX.tone(150,.1,"square",.03);
if(g.hands[p].length===0)g.point(p,"DOMINO!");
return;
}
},
draw(g,ctx){
g.floor("#0a3a1a","#1a5a2a");
g.text("DOMINOES",W/2,30,24,GOLD,"center");
if(g.board.length>0){
const tw=Math.min(70,700/g.board.length);
g.board.forEach((t,i)=>{
const x=W/2-(g.board.length*tw)/2+i*tw;
drawDomino(ctx,x,290,t,tw);
});
}
[0,1].forEach(p=>{
const hs=90;
g.hands[p].forEach((t,k)=>{
const x=p===0?30+k*(hs+10):W-30-(k+1)*(hs+10),y=450;
const sel=(p===g.turn&&g.selected===k);
drawDomino(ctx,x,y,t,hs,sel?GOLD:"#fff");
});
});
g.text("◀ LEFT",W/2-200,250,14,"#9fc0ff","center");
g.text("RIGHT ▶",W/2+200,250,14,"#9fc0ff","center");
g.text("P1: "+g.hands[0].length+" tiles",20,440,16,C1);
g.text("P2: "+g.hands[1].length+" tiles",W-20,440,16,C2,"right");
g.text("P"+(g.turn+1)+" TURN",W/2,410,18,col(g.turn),"center");
}
});

/* ---------- 5. YACHT (FIXED) ---------- */
function scoreYacht(dice,cat){
const cnt={};
dice.forEach(d=>cnt[d]=(cnt[d]||0)+1);
const sum=dice.reduce((a,b)=>a+b,0);
switch(cat){
case "ones":return cnt[1]||0;
case "twos":return (cnt[2]||0)*2;
case "threes":return (cnt[3]||0)*3;
case "fours":return (cnt[4]||0)*4;
case "fives":return (cnt[5]||0)*5;
case "sixes":return (cnt[6]||0)*6;
case "three-kind":return Object.values(cnt).some(v=>v>=3)?sum:0;
case "four-kind":return Object.values(cnt).some(v=>v>=4)?sum:0;
case "full-house":return Object.values(cnt).sort().join(",")==="2,3"?25:0;
case "small-straight":{
const s=new Set(dice);
const runs=[[1,2,3,4],[2,3,4,5],[3,4,5,6]];
return runs.some(r=>r.every(n=>s.has(n)))?30:0;
}
case "large-straight":{
const s=new Set(dice);
return[[1,2,3,4,5],[2,3,4,5,6]].some(r=>r.every(n=>s.has(n)))?40:0;
}
case "yacht":return Object.values(cnt).some(v=>v===5)?50:0;
case "chance":return sum;
}
return 0;
}
micro({id:"yachtGame",title:"Yacht",desc:"Roll 5 dice, reroll twice, score in a category.",
cat:"brain",key:"yacht",win:1,hud:false,
controls:"Current player: SPACE rolls. Click dice to hold. Click category to score.",
init(g){
g.st=[0,1].map(()=>({
dice:rollN(5),
held:[false,false,false,false,false],
rolls:3,
scores:{},
cur:0,
phase:"roll"
}));
g.activeCat=["ones","twos","threes","fours","fives","sixes","three-kind","four-kind","full-house","small-straight","large-straight","yacht","chance"];
},
update(g,dt){
const s=g.st[g.cur];
if(g.I[g.cur].pa&&s.phase==="roll"){
for(let k=0;k<5;k++)if(!s.held[k])s.dice[k]=ri(1,6);
s.rolls--;
FX.tone(500,.1,"square",.04);
if(s.rolls<=0){s.phase="score";}
}
},
click(g,x,y){
const s=g.st[g.cur];
if(s.phase==="roll"&&y>=100&&y<=200){
for(let k=0;k<5;k++){
const dx=100+k*120+40;
if(Math.abs(x-dx)<50){
s.held[k]=!s.held[k];
FX.tone(400,.05,"square",.03);
}
}
}
if(s.phase==="score"){
const cats=g.activeCat;
for(let k=0;k<cats.length;k++){
const cx=100+(k%3)*250,cy=250+Math.floor(k/3)*40;
if(x>cx-120&&x<cx+120&&y>cy-15&&y<cy+15){
const cat=cats[k];
if(s.scores[cat]!==undefined)return;
s.scores[cat]=scoreYacht(s.dice,cat);
FX.tone(700,.1,"square",.04);
s.rolls=3;s.phase="roll";
s.held=[false,false,false,false,false];
g.cur=1-g.cur;
const s0=g.st[0],s1=g.st[1];
const done0=Object.keys(s0.scores).length>=13;
const done1=Object.keys(s1.scores).length>=13;
if(done0&&done1){
const t0=Object.values(s0.scores).reduce((a,b)=>a+b,0);
const t1=Object.values(s1.scores).reduce((a,b)=>a+b,0);
if(t0>t1)g.point(0,"P1 WINS "+t0+"-"+t1);
else if(t1>t0)g.point(1,"P2 WINS "+t1+"-"+t0);
else g.next("TIE "+t0+"-"+t0);
}
return;
}
}
}
},
draw(g,ctx){
g.floor("#0a2a1a","#1a3a2a");
const s=g.st[g.cur];
g.text("YACHT — P"+(g.cur+1)+"'S TURN",W/2,40,24,col(g.cur),"center");
g.text("Rolls left: "+s.rolls,W/2,65,14,"#9fc0ff","center");
for(let k=0;k<5;k++){
const x=100+k*120,y=110;
ctx.fillStyle=s.held[k]?GOLD:"#fff";
ctx.fillRect(x,y,80,80);
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(x,y,80,80);
drawPips(ctx,x,y,s.dice[k]);
if(s.held[k]){
ctx.strokeStyle=col(g.cur);ctx.lineWidth=4;ctx.strokeRect(x-3,y-3,86,86);
}
}
if(s.phase==="score"){
g.text("PICK CATEGORY",W/2,215,16,"#9fc0ff","center");
g.activeCat.forEach((cat,k)=>{
const cx=100+(k%3)*250,cy=250+Math.floor(k/3)*40;
if(s.scores[cat]!==undefined)return;
ctx.fillStyle="#2a2f63";ctx.fillRect(cx-120,cy-15,240,30);
ctx.strokeStyle=col(g.cur);ctx.lineWidth=2;ctx.strokeRect(cx-120,cy-15,240,30);
g.text(cat.replace("-"," ").toUpperCase(),cx,cy+5,14,"#fff","center");
});
}
[0,1].forEach(p=>{
const allSt=g.st[p];
const total=Object.values(allSt.scores).reduce((a,b)=>a+b,0);
g.text("P"+(p+1)+" TOTAL: "+total,p?W-20:20,490,16,col(p),p?"right":"left");
});
g.text("SPACE to roll · Click dice to hold",W/2,515,12,"#9fc0ff","center");
}
});

/* ---------- 6. SUDOKU 4x4 ---------- */
const SUDO_PUZZLES=[
{sol:[[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]],puz:[[1,0,0,4],[0,4,1,0],[0,0,4,0],[4,0,2,1]]},
{sol:[[2,3,1,4],[4,1,3,2],[3,4,2,1],[1,2,4,3]],puz:[[2,0,0,0],[0,1,0,2],[0,4,0,1],[1,0,0,0]]},
{sol:[[3,1,4,2],[2,4,1,3],[4,2,3,1],[1,3,2,4]],puz:[[3,0,0,2],[0,0,1,0],[0,2,0,0],[1,0,0,4]]}
];
micro({id:"sudokuGame",title:"Sudoku 4x4",desc:"Fill each row, column, and 2×2 box with 1-4.",
cat:"brain",key:"sudoku",win:3,
controls:"Click cell to cycle value. Solve your grid first.",
round(g){
const p=SUDO_PUZZLES[ri(0,SUDO_PUZZLES.length-1)];
g.puz=p.puz;
g.grids=p.puz.map(row=>row.map(v=>v));
},
click(g,x,y){
for(let p=0;p<2;p++){
const ox=p?540:100,oy=150,sz=80;
if(x>ox&&x<ox+sz*4&&y>oy&&y<oy+sz*4){
const c=Math.floor((x-ox)/sz),r=Math.floor((y-oy)/sz);
if(g.puz[r][c]!==0)return;
g.grids[p][r][c]=(g.grids[p][r][c]+1)%5;
FX.tone(500,.03,"square",.02);
const rowOK=g.grids[p].every(row=>{const s=new Set(row);return s.size===4&&!s.has(0);});
const colOK=[0,1,2,3].every(c=>{const s=new Set(g.grids[p].map(r=>r[c]));return s.size===4&&!s.has(0);});
const boxOK=[[0,0],[0,2],[2,0],[2,2]].every(([rr,cc])=>{
const s=new Set();
for(let dr=0;dr<2;dr++)for(let dc=0;dc<2;dc++)s.add(g.grids[p][rr+dr][cc+dc]);
return s.size===4&&!s.has(0);
});
if(rowOK&&colOK&&boxOK)g.point(p,"SOLVED");
return;
}
}
},
draw(g,ctx){
g.floor("#1a1a3a","#0a0a20");
for(let p=0;p<2;p++){
const ox=p?540:100,oy=150,sz=80;
for(let r=0;r<4;r++)for(let c=0;c<4;c++){
const x=ox+c*sz,y=oy+r*sz;
const isGiven=g.puz[r][c]!==0;
ctx.fillStyle=isGiven?"#4a5a9a":"#2a2f63";
ctx.fillRect(x+2,y+2,sz-4,sz-4);
ctx.strokeStyle="#080b18";ctx.lineWidth=1;ctx.strokeRect(x+2,y+2,sz-4,sz-4);
if(g.grids[p][r][c]>0)g.text(String(g.grids[p][r][c]),x+sz/2,y+sz/2+14,40,isGiven?"#9fc0ff":"#fff","center");
}
ctx.strokeStyle="#fff";ctx.lineWidth=3;
ctx.strokeRect(ox+2*sz,oy,2*sz,2*sz);
ctx.strokeRect(ox,oy+2*sz,2*sz,2*sz);
g.text("P"+(p+1),ox+sz*2,120,20,col(p),"center");
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* ---------- 7. FISHING DUEL (FIXED) ---------- */
micro({id:"fishingGame",title:"Fishing Duel",desc:"Cast your line and time the catch.",
cat:"reflex",key:"fishing",win:3,
controls:"P1: hold W to cast, release to hook, SPACE to stop　 P2: hold ↑, ENTER — stop the bar in the green zone",
round(g){
g.pl=[
{state:"cast",charge:0,barT:0,barDir:1,caught:0,fishPos:ri(200,600)},
{state:"cast",charge:0,barT:0,barDir:1,caught:0,fishPos:ri(200,600)}
];
},
update(g,dt){
for(let p=0;p<2;p++){
const pl=g.pl[p],I=g.I[p];
if(pl.state==="cast"){
if(I.u)pl.charge=Math.min(1,pl.charge+dt*1.5);
else if(pl.charge>0){
pl.charge=0;pl.state="hook";
pl.barT=0;pl.barDir=1;
pl.fishPos=ri(200,600);
}
}else if(pl.state==="hook"){
pl.barT+=pl.barDir*dt*2.5;
if(pl.barT>1){pl.barT=1;pl.barDir=-1;}
if(pl.barT<0){pl.barT=0;pl.barDir=1;}
if(I.a){
const target=(pl.fishPos-200)/400;
const diff=Math.abs(pl.barT-target);
if(diff<.08){
pl.caught++;pl.state="result";
FX.playScore();
g.burst(p?675:225,300,GOLD,12,250);
if(pl.caught>=3)g.point(p,"FISHED!");
}else{
pl.state="result";
FX.tone(150,.1,"square",.03);
}
pl.resultT=.8;
}
}else if(pl.state==="result"){
pl.resultT-=dt;
if(pl.resultT<=0){pl.state="cast";pl.charge=0;}
}
}
},
draw(g,ctx){
const gr=ctx.createLinearGradient(0,0,0,H);
gr.addColorStop(0,"#0a3a5a");gr.addColorStop(.7,"#0a2a5a");gr.addColorStop(1,"#0a1a3a");
ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
for(let p=0;p<2;p++){
const off=p*450;
ctx.fillStyle="rgba(255,255,255,.05)";ctx.fillRect(off,0,450,H);
const pl=g.pl[p];
ctx.fillStyle="rgba(100,200,255,.2)";
for(let k=0;k<10;k++){ctx.fillRect(off+k*45,250+Math.sin(g.t+k)*3,30,2);}
if(pl.state==="hook"||pl.state==="result"){
const fishX=off+(pl.fishPos-200)/400*450+50;
const fishY=300;
ctx.strokeStyle="rgba(255,255,255,.6)";ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(off+225,120);ctx.lineTo(fishX,fishY);ctx.stroke();
ctx.fillStyle="#ff9a3a";
ctx.beginPath();ctx.ellipse(fishX,fishY,20,10,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#fff";ctx.fillRect(fishX+8,fishY-3,4,4);
}
if(pl.state==="hook"){
const barX=off+130,barY=440,barW=190,barH=25;
ctx.fillStyle="#2a2f63";ctx.fillRect(barX,barY,barW,barH);
const target=(pl.fishPos-200)/400;
ctx.fillStyle=GREEN;
ctx.fillRect(barX+target*barW-barW*.04,barY,barW*.08,barH);
ctx.fillStyle=GOLD;
ctx.fillRect(barX+pl.barT*barW-3,barY,6,barH);
}
g.text("P"+(p+1)+" caught: "+pl.caught,off+225,40,20,col(p),"center");
if(pl.state==="cast"){
ctx.fillStyle="#2a2f63";ctx.fillRect(off+150,150,150,20);
ctx.fillStyle=col(p);ctx.fillRect(off+150,150,150*pl.charge,20);
g.text(p?"HOLD ↑ TO CAST":"HOLD W TO CAST",off+225,190,14,col(p),"center");
}else if(pl.state==="hook"){
g.text(p?"PRESS ENTER":"PRESS SPACE",off+225,410,14,col(p),"center");
}else if(pl.state==="result"){
g.text("...",off+225,410,20,GOLD,"center");
}
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* ---------- 8. SLOT MACHINE ---------- */
const SLOT_SYMBOLS=["🍒","🍋","🍇","⭐","🔔","💎"];
micro({id:"slotGame",title:"Slot Machine",desc:"Spin 3 reels. Match 3 to win big.",
cat:"arcade",key:"slot",win:1,hud:false,
controls:"P1: SPACE spin (bet 5)　 P2: ENTER — 3 matching = payout. 15 spins each.",
init(g){
g.money=[50,50];
g.reels=[[0,0,0],[0,0,0]];
g.spinning=[false,false];
g.spinT=[0,0];
g.spinsLeft=[15,15];
g.result=["",""];
},
update(g,dt){
[0,1].forEach(p=>{
if(!g.spinning[p])return;
g.spinT[p]+=dt;
if(g.spinT[p]>=.5+p*.2){
for(let k=0;k<3;k++)g.reels[p][k]=ri(0,SLOT_SYMBOLS.length-1);
}
if(g.spinT[p]>=1.5+p*.3){
g.spinning[p]=false;
const [a,b,c]=g.reels[p];
if(a===b&&b===c){
const prize=a===5?500:a===4?100:a===3?50:20;
g.money[p]+=prize;
g.result[p]="WIN +"+prize;
FX.playScore();
g.burst(p?675:225,300,GOLD,20,400);
}else if(a===b||b===c||a===c){
g.money[p]+=10;
g.result[p]="+10";
FX.tone(600,.1,"square",.04);
}else{
g.result[p]="";
FX.tone(200,.1,"square",.03);
}
}
});
for(let p=0;p<2;p++){
if(g.I[p].pa&&!g.spinning[p]&&g.spinsLeft[p]>0&&g.money[p]>=5){
g.money[p]-=5;
g.spinsLeft[p]--;
g.spinning[p]=true;
g.spinT[p]=0;
g.result[p]="";
FX.tone(700,.08,"square",.04);
}
}
if(g.spinsLeft[0]<=0&&g.spinsLeft[1]<=0&&!g.spinning[0]&&!g.spinning[1])g.byScore(g.money);
},
draw(g,ctx){
g.floor("#2a1a10","#3a2414");
for(let p=0;p<2;p++){
const off=p?450:0;
ctx.fillStyle="rgba(0,0,0,.3)";ctx.fillRect(off,120,450,280);
g.text("SLOT MACHINE — P"+(p+1),off+225,50,20,col(p),"center");
for(let k=0;k<3;k++){
const x=off+80+k*100,y=170;
ctx.fillStyle="#fff";ctx.fillRect(x,y,80,80);
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(x,y,80,80);
ctx.font="44px serif";ctx.textAlign="center";ctx.fillStyle="#111";
ctx.fillText(SLOT_SYMBOLS[g.reels[p][k]],x+40,y+60);
ctx.textAlign="left";
}
g.text("$"+g.money[p],off+225,320,28,GOLD,"center");
g.text("Spins: "+g.spinsLeft[p],off+225,350,16,"#9fc0ff","center");
if(g.result[p])g.text(g.result[p],off+225,390,24,GREEN,"center");
if(g.spinning[p])g.text("SPINNING...",off+225,420,16,col(p),"center");
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
g.text("P1: SPACE   P2: ENTER",W/2,490,14,"#9fc0ff","center");
}
});
})();