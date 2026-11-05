/* =====================================================
   GAME PACK V — 8 games (FIXED — Draw Poker controls)
   Farkle, Knucklebones, Cee-lo, Horse Race,
   Draw Poker, Bullseye, Word Search, Sword Fight
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri,seeded}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;
const die=()=>ri(1,6);

/* ---------- 1. FARKLE ---------- */
function farkleScore(dice){
const cnt={};
dice.forEach(d=>cnt[d]=(cnt[d]||0)+1);
let s=0;
for(const [v,n] of Object.entries(cnt)){
const val=Number(v);
if(val===1){
if(n>=3)s+=1000+(n-3)*100;
else s+=n*100;
} else if(val===5){
if(n>=3)s+=500+(n-3)*50;
else s+=n*50;
} else if(n>=3){
s+=val*100+(n-3)*val*100;
}
}
return s;
}
micro({id:"farkleGame",title:"Farkle",desc:"Push your luck with 6 dice.",
cat:"brain",key:"farkle",win:1,hud:false,
controls:"Press SPACE/ENTER to roll 6 dice, press again to bank. No scoring dice = FARKLE. 1000 pts wins.",
init(g){
g.st=[0,1].map(()=>({score:0,turnScore:0,dice:[],lastRoll:[]}));
g.turn=0;
},
update(g,dt){
const I=g.I[g.turn];
if(!I.pa)return;
const s=g.st[g.turn];
if(s.dice.length===0){
s.dice=Array.from({length:6},()=>die());
s.turnScore=farkleScore(s.dice);
s.lastRoll=s.dice.slice();
FX.tone(500,.08,"square",.03);
if(s.turnScore===0){
g.banner_("FARKLE!",RED,1);
s.dice=[];
g.turn=1-g.turn;
FX.tone(150,.25,"sawtooth",.05,-40);
}
} else {
s.score+=s.turnScore;
s.turnScore=0;
s.dice=[];
g.turn=1-g.turn;
FX.tone(800,.1,"square",.04);
if(s.score>=1000){g.byScore(g.st.map(x=>x.score));}
}
},
draw(g,ctx){
g.floor("#1a1a3a","#22224a");
g.text("FARKLE",W/2,40,28,GOLD,"center");
[0,1].forEach(p=>{
const s=g.st[p];
g.text("P"+(p+1)+"  SCORE: "+s.score,p?W-30:30,70,18,col(p),p?"right":"left");
});
const s=g.st[g.turn];
if(s.dice.length>0){
s.dice.forEach((d,k)=>{
const x=200+k*90,y=180;
ctx.fillStyle="#fff";ctx.fillRect(x,y,70,70);
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(x,y,70,70);
g.text(String(d),x+35,y+52,44,"#111","center");
});
g.text("TURN VALUE: "+s.turnScore,W/2,300,24,GOLD,"center");
g.text("SPACE/ENTER to BANK",W/2,340,16,col(g.turn),"center");
} else {
g.text("P"+(g.turn+1)+" — SPACE/ENTER to ROLL",W/2,300,22,col(g.turn),"center");
}
g.text("Score 1000+ to win · No scoring dice = FARKLE",W/2,460,14,"#9fc0ff","center");
}
});

/* ---------- 2. KNUCKLEBONES ---------- */
micro({id:"knucklebonesGame",title:"Knucklebones",desc:"Place dice in 3 columns. Match values destroy rival's dice.",
cat:"brain",key:"knucklebones",win:3,
controls:"SPACE roll, then A/W/D (P1) or ←/↑/→ (P2) to place in column 1/2/3. Matching value kills rival's dice.",
round(g){
g.boards=[[[],[],[]],[[],[],[]]];
g.rolled=null;
g.turn=0;
},
update(g,dt){
const I=g.I[g.turn];
const b=g.boards[g.turn];
if(g.rolled===null){
if(I.pa){g.rolled=die();FX.tone(500,.08,"square",.04);}
return;
}
let col=-1;
if(I.pl)col=0;else if(I.pu)col=1;else if(I.pr)col=2;
if(col<0||b[col].length>=3)return;
const val=g.rolled;
b[col].push(val);
const oppB=g.boards[1-g.turn];
let removed=false;
for(let r=oppB[col].length-1;r>=0;r--){
if(oppB[col][r]===val){oppB[col].splice(r,1);removed=true;}
}
if(removed)FX.tone(300,.15,"sawtooth",.04,-100);
else FX.tone(600,.08,"square",.03);
g.rolled=null;
g.turn=1-g.turn;
const p1Full=g.boards[0].every(c=>c.length>=3);
const p2Full=g.boards[1].every(c=>c.length>=3);
if(p1Full&&p2Full){
const s1=g.boards[0].reduce((sum,c)=>sum+c.reduce((a,b)=>a+b*b,0),0);
const s2=g.boards[1].reduce((sum,c)=>sum+c.reduce((a,b)=>a+b*b,0),0);
if(s1>s2)g.point(0,"P1 "+s1+"-"+s2);
else if(s2>s1)g.point(1,"P2 "+s2+"-"+s1);
else g.next("TIE");
}
},
draw(g,ctx){
g.floor("#1a1230","#2a1a3a");
g.text("KNUCKLEBONES",W/2,40,24,GOLD,"center");
[0,1].forEach(p=>{
const off=p?520:80;
g.text("P"+(p+1),off+135,80,20,col(p),"center");
for(let c=0;c<3;c++){
for(let r=0;r<3;r++){
const x=off+c*90,y=100+r*90;
ctx.fillStyle="#2a2f63";ctx.fillRect(x,y,80,80);
ctx.strokeStyle=col(p);ctx.lineWidth=2;ctx.strokeRect(x,y,80,80);
const v=g.boards[p][c][r];
if(v){
ctx.fillStyle="#fff";ctx.fillRect(x+10,y+10,60,60);
g.text(String(v),x+40,y+52,32,"#111","center");
}
}
const sum=g.boards[p][c].reduce((a,b)=>a+b*b,0);
g.text("="+sum,off+c*90+40,410,14,GOLD,"center");
}
});
if(g.rolled!==null){
ctx.fillStyle="#fff";ctx.fillRect(W/2-40,440,80,80);
ctx.strokeStyle=col(g.turn);ctx.lineWidth=4;ctx.strokeRect(W/2-40,440,80,80);
g.text(String(g.rolled),W/2,502,44,"#111","center");
g.text("P"+(g.turn+1)+": pick a column",W/2,545,14,col(g.turn),"center");
} else {
g.text("P"+(g.turn+1)+" — SPACE to ROLL",W/2,470,20,col(g.turn),"center");
}
}
});

/* ---------- 3. CEE-LO ---------- */
function roll3(){return[die(),die(),die()].sort((a,b)=>a-b);}
function ceeLoVal(dice){
const s=dice.join("");
if(s==="456")return 1000;
if(s==="123")return -1;
if(dice[0]===dice[1]&&dice[1]===dice[2])return 500+dice[0]*10;
if(dice[0]===dice[1])return dice[2];
if(dice[1]===dice[2])return dice[0];
return 0;
}
function ceeLoName(dice){
const s=dice.join("");
if(s==="456")return "4-5-6!";
if(s==="123")return "1-2-3";
if(dice[0]===dice[1]&&dice[1]===dice[2])return "TRIPLE "+dice[0];
if(dice[0]===dice[1])return "PAIR + "+dice[2];
if(dice[1]===dice[2])return "PAIR + "+dice[0];
return "NO HAND";
}
micro({id:"ceeloGame",title:"Cee-lo",desc:"Roll 3 dice. 4-5-6 wins instantly, 1-2-3 loses.",
cat:"brain",key:"ceelo",win:5,
controls:"P1: SPACE　 P2: ENTER — Triples beat pairs beat nothing.",
round(g){
g.p1=null;g.p2=null;
},
update(g,dt){
if(g.p1===null&&g.I[0].pa){g.p1=roll3();FX.tone(500,.1,"square",.04);}
if(g.p2===null&&g.I[1].pa){g.p2=roll3();FX.tone(500,.1,"square",.04);}
if(g.p1&&g.p2){
const v1=ceeLoVal(g.p1),v2=ceeLoVal(g.p2);
if(v1>v2)g.point(0,ceeLoName(g.p1));
else if(v2>v1)g.point(1,ceeLoName(g.p2));
else g.next("TIE");
}
},
draw(g,ctx){
g.floor("#1a1230","#2a1a3a");
g.text("CEE-LO",W/2,50,32,GOLD,"center");
[0,1].forEach(p=>{
const off=p?520:80;
const dice=p===0?g.p1:g.p2;
g.text("P"+(p+1),off+90,120,20,col(p),"center");
if(dice){
dice.forEach((d,k)=>{
const x=off+k*60,y=160;
ctx.fillStyle="#fff";ctx.fillRect(x,y,50,50);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(x,y,50,50);
g.text(String(d),x+25,y+38,32,"#111","center");
});
g.text(ceeLoName(dice),off+90,260,14,col(p),"center");
} else {
g.text(p===0?"SPACE":"ENTER",off+90,200,18,col(p),"center");
}
});
}
});

/* ---------- 4. HORSE RACE ---------- */
micro({id:"horseraceGame",title:"Horse Race",desc:"Bet on a horse. Roll dice to move them.",
cat:"brain",key:"horserace",win:1,hud:false,
controls:"P1: SPACE to bet / roll　 P2: ENTER — pick a horse 1-6. Roll 2 dice, that horse advances. First to 8 wins.",
init(g){
g.horses=[1,2,3,4,5,6].map(n=>({n,pos:0}));
g.bets=[null,null];
g.money=[100,100];
g.rolling=false;
g.rollT=0;
g.lastSum=0;
},
update(g,dt){
if(g.rolling){
g.rollT+=dt;
if(g.rollT>=.5){
g.rolling=false;
const a=die(),b=die();
g.lastSum=a+b;
const h=g.horses.find(h=>h.n===a+b);
if(h)h.pos++;
FX.tone(400+(a+b)*30,.1,"square",.03);
const win=g.horses.find(h=>h.pos>=8);
if(win){
[0,1].forEach(p=>{
if(g.bets[p]===win.n)g.money[p]+=50;
});
g.byScore(g.money);
}
}
return;
}
if(g.bets[0]===null||g.bets[1]===null){
if(g.I[0].pa&&g.bets[0]===null)g.bets[0]=ri(1,6);
if(g.I[1].pa&&g.bets[1]===null)g.bets[1]=ri(1,6);
return;
}
if(g.I[0].pa||g.I[1].pa){g.rolling=true;g.rollT=0;}
},
draw(g,ctx){
g.floor("#0a3a1a","#1a5a2a");
g.text("HORSE RACE",W/2,40,26,GOLD,"center");
g.horses.forEach(h=>{
const y=90+(h.n-1)*55;
g.text("H"+h.n,80,y+22,20,GOLD);
const x=130+h.pos*70;
ctx.fillStyle="#ff9a3a";
ctx.fillRect(x-14,y,28,22);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(x-14,y,28,22);
g.text(h.pos+"/8",x,y-6,12,"#fff","center");
});
ctx.fillStyle="#fff";ctx.fillRect(W-70,85,4,340);
g.text("FINISH",W-35,440,14,GOLD,"center");
[0,1].forEach(p=>{
g.text("P"+(p+1)+"  $"+g.money[p]+"  bet:"+(g.bets[p]||"?")+" /6",p?W-20:20,480,16,col(p),p?"right":"left");
});
if(g.bets[0]!==null&&g.bets[1]!==null&&!g.rolling&&g.lastSum)g.text("Rolled "+(g.lastSum)+" · horse "+g.lastSum+" advances",W/2,510,14,"#9fc0ff","center");
}
});

/* ---------- 5. DRAW POKER (FIXED — per-player control) ---------- */
const POKE_RANKS=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const POKE_SUITS=["♠","♥","♦","♣"];
function makeDeck(){
const d=[];
POKE_RANKS.forEach((r,ri)=>POKE_SUITS.forEach((s,si)=>d.push({r,ri,s,si})));
for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}
return d;
}
function rankHand(cards){
const ranks=cards.map(c=>c.ri).sort((a,b)=>b-a);
const suits=cards.map(c=>c.si);
const isFlush=suits.every(s=>s===suits[0]);
const uniq=[...new Set(ranks)];
const isStraight=uniq.length===5&&uniq[0]-uniq[4]===4;
const counts={};
ranks.forEach(r=>counts[r]=(counts[r]||0)+1);
const groups=Object.values(counts).sort((a,b)=>b-a);
if(isStraight&&isFlush&&ranks[0]===12)return{rank:9,name:"ROYAL FLUSH"};
if(isStraight&&isFlush)return{rank:8,name:"STRAIGHT FLUSH"};
if(groups[0]===4)return{rank:7,name:"FOUR OF A KIND"};
if(groups[0]===3&&groups[1]===2)return{rank:6,name:"FULL HOUSE"};
if(isFlush)return{rank:5,name:"FLUSH"};
if(isStraight)return{rank:4,name:"STRAIGHT"};
if(groups[0]===3)return{rank:3,name:"THREE OF A KIND"};
if(groups[0]===2&&groups[1]===2)return{rank:2,name:"TWO PAIR"};
if(groups[0]===2)return{rank:1,name:"PAIR"};
return{rank:0,name:"HIGH CARD"};
}
micro({id:"drawpokerGame",title:"Draw Poker",desc:"Deal 5, discard, draw. Best hand wins.",
cat:"brain",key:"drawpoker",win:3,
controls:"Click cards to discard. P1 presses SPACE, P2 presses ENTER to confirm draw. Highest hand wins.",
round(g){
g.deck=makeDeck();
g.hands=[g.deck.slice(0,5),g.deck.slice(5,10)];
g.deck=g.deck.slice(10);
g.discard=[[false,false,false,false,false],[false,false,false,false,false]];
g.phase="p1";
},
update(g,dt){
if(g.phase==="p1"&&g.I[0].pa){
g.hands[0]=g.hands[0].map((c,i)=>g.discard[0][i]?g.deck.pop():c);
g.discard[0]=[false,false,false,false,false];
g.phase="p2";
FX.tone(500,.1,"square",.04);
} else if(g.phase==="p2"&&g.I[1].pa){
g.hands[1]=g.hands[1].map((c,i)=>g.discard[1][i]?g.deck.pop():c);
g.discard[1]=[false,false,false,false,false];
g.phase="show";
const r1=rankHand(g.hands[0]);
const r2=rankHand(g.hands[1]);
if(r1.rank>r2.rank)g.point(0,r1.name);
else if(r2.rank>r1.rank)g.point(1,r2.name);
else g.next("TIE");
}
},
click(g,x,y){
if(y<180||y>360)return;
if(g.phase==="p1"&&x<450){
const k=Math.floor((x-50)/80);
if(k>=0&&k<5){g.discard[0][k]=!g.discard[0][k];FX.tone(400,.03,"square",.02);}
}
if(g.phase==="p2"&&x>=450){
const k=Math.floor((x-490)/80);
if(k>=0&&k<5){g.discard[1][k]=!g.discard[1][k];FX.tone(400,.03,"square",.02);}
}
},
draw(g,ctx){
g.floor("#0a2a1a","#1a4a2a");
g.text("DRAW POKER",W/2,40,26,GOLD,"center");
[0,1].forEach(p=>{
const off=p?490:50;
g.text("P"+(p+1),off+160,80,20,col(p),"center");
g.hands[p].forEach((c,k)=>{
const x=off+k*80,y=200;
const disc=g.discard[p][k];
ctx.fillStyle=disc?"#3a2a1a":"#fff";
ctx.fillRect(x,y,70,120);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(x,y,70,120);
if(disc){
g.text("↻",x+35,y+75,40,RED,"center");
} else {
g.text(c.r,x+35,y+65,26,c.si%2?"#c80000":"#111","center");
g.text(c.s,x+35,y+100,24,c.si%2?"#c80000":"#111","center");
}
});
const remaining=g.hands[p].filter((c,i)=>!g.discard[p][i]);
if(remaining.length===5){
const hand=rankHand(remaining);
g.text(hand.name,off+160,345,14,GOLD,"center");
}
});
g.text(g.phase==="p1"?"P1: click to discard · SPACE to draw":
g.phase==="p2"?"P2: click to discard · ENTER to draw":"SHOWDOWN",
W/2,400,16,"#9fc0ff","center");
}
});

/* ---------- 6. BULLSEYE ---------- */
micro({id:"bullseyeGame",title:"Bullseye",desc:"Aim, charge, throw. Wind pushes your dart.",
cat:"reflex",key:"bullseye",win:3,
controls:"P1: A/D aim, hold W, release to throw　 P2: ←/→, hold ↑ — 5 throws each. Wind pushes horizontal.",
round(g){
g.pl=[
{aim:0,power:0,charging:false,darts:0,score:0,throw:null,throwT:0},
{aim:0,power:0,charging:false,darts:0,score:0,throw:null,throwT:0}
];
g.wind=rnd(-1,1);
g.turn=0;
},
update(g,dt){
const p=g.pl[g.turn],I=g.I[g.turn];
if(p.throw){
p.throwT+=dt;
if(p.throwT>.6){
p.throw=null;
if(g.pl[0].darts>=5&&g.pl[1].darts>=5){
const a=g.pl[0].score,b=g.pl[1].score;
if(a>b)g.point(0,"HIGH SCORE");
else if(b>a)g.point(1,"HIGH SCORE");
else g.next("TIE");
} else {
g.wind=rnd(-1,1);
g.turn=1-g.turn;
}
}
return;
}
if(!p.charging){
if(I.l)p.aim-=1.5*dt;
if(I.r)p.aim+=1.5*dt;
p.aim=cl(p.aim,-1.5,1.5);
if(I.u){p.charging=true;p.power=0;}
} else {
p.power=Math.min(1,p.power+dt*1.2);
if(!I.u){
const tx=W/2+Math.sin(p.aim)*p.power*180+g.wind*p.power*80;
const ty=200+p.power*40;
const d=Math.hypot(tx-W/2,ty-200);
let pts=0;
if(d<15)pts=100;else if(d<40)pts=50;else if(d<80)pts=20;else if(d<140)pts=5;
p.score+=pts;p.darts++;
p.throw={x:tx,y:ty,pts};p.throwT=0;
p.charging=false;p.power=0;
FX.tone(pts>50?900:500+pts*3,.15,"square",.05,pts*3);
}
}
},
draw(g,ctx){
g.floor("#1a1a3a","#22224a");
[[80,"#4a4a6a"],[40,"#8a3a3a"],[15,"#ffd24a"]].forEach(([r,c])=>{
ctx.fillStyle=c;
ctx.beginPath();ctx.arc(W/2,200,r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
});
[0,1].forEach(p=>{
const pl=g.pl[p];
if(pl.throw){
ctx.fillStyle=col(p);
ctx.beginPath();ctx.arc(pl.throw.x,pl.throw.y,6,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
}
});
const p=g.pl[g.turn];
if(p.charging){
const tx=W/2+Math.sin(p.aim)*p.power*180+g.wind*p.power*80;
const ty=200+p.power*40;
ctx.strokeStyle=col(g.turn);ctx.lineWidth=2;ctx.setLineDash([4,4]);
ctx.beginPath();ctx.moveTo(W/2,H-40);ctx.lineTo(tx,ty);ctx.stroke();
ctx.setLineDash([]);
}
g.text("WIND: "+(g.wind<0?"◀ ":"")+Math.abs(g.wind*100).toFixed(0)+(g.wind>0?" ▶":""),W/2,H-60,16,"#fff","center");
g.text("P1: "+g.pl[0].score+" ("+g.pl[0].darts+"/5)",20,40,16,C1);
g.text("P2: "+g.pl[1].score+" ("+g.pl[1].darts+"/5)",W-20,40,16,C2,"right");
g.text("P"+(g.turn+1)+"'S THROW",W/2,60,16,col(g.turn),"center");
}
});

/* ---------- 7. WORD SEARCH ---------- */
const WS_POOL=["CAT","DOG","SUN","MAP","ICE","BOX","KEY","OWL","PEN","EAR","BAT","FAN","JAM","LAP","NET","PIG","RAT","TAP","VAN","WEB","CAT","RUN","FUN","BIG","TOP","CUP","HAT","MAT","SAT","BIT","DIG","HOT","POT","GOT","DOT","PET","SET","WET","LOG","FOG","BUG","HUG","RUG","NAP","CAP","RED","BED","FED","GOD","NOD","COD","LIE","PIE","TIE"];
function makeWS(){
const grid=Array.from({length:10},()=>new Array(10).fill(""));
const dirs=[[1,0],[0,1],[1,1]];
const chosen=WS_POOL.slice().sort(()=>Math.random()-.5).slice(0,4);
const words=[];
chosen.forEach(w=>{
for(let tries=0;tries<60;tries++){
const dir=dirs[Math.floor(Math.random()*dirs.length)];
const maxX=dir[0]?10-w.length:9;
const maxY=dir[1]?10-w.length:9;
const x=Math.floor(Math.random()*(maxX+1));
const y=Math.floor(Math.random()*(maxY+1));
let ok=true;
for(let k=0;k<w.length;k++){
const cx=x+k*dir[0],cy=y+k*dir[1];
if(grid[cy][cx]&&grid[cy][cx]!==w[k]){ok=false;break;}
}
if(ok){
for(let k=0;k<w.length;k++)grid[y+k*dir[1]][x+k*dir[0]]=w[k];
words.push({w,found:[false,false]});
break;
}
}
});
const ALPHA="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
for(let y=0;y<10;y++)for(let x=0;x<10;x++){
if(!grid[y][x])grid[y][x]=ALPHA[Math.floor(Math.random()*ALPHA.length)];
}
return{grid,words};
}
micro({id:"wordsearchGame",title:"Word Search",desc:"Find all 4 hidden words first.",
cat:"brain",key:"wordsearch",win:3,
controls:"Click cells in order to spell a word (horizontal, vertical, diagonal).",
round(g){
const ws=makeWS();
g.grid=ws.grid;g.words=ws.words;
g.sel=[[],[]];
g.found=[0,0];
},
click(g,x,y){
if(x<140||x>140+10*55||y<80||y>80+10*55)return;
const cx=Math.floor((x-140)/55),cy=Math.floor((y-80)/55);
for(let p=0;p<2;p++){
const sel=g.sel[p];
if(sel.length===0){sel.push([cy,cx]);continue;}
const last=sel[sel.length-1];
const isAdj=Math.abs(last[0]-cy)<=1&&Math.abs(last[1]-cx)<=1&&!(last[0]===cy&&last[1]===cx);
const notDup=!sel.some(([r,c])=>r===cy&&c===cx);
if(isAdj&&notDup&&sel.length<8){
sel.push([cy,cx]);
const word=sel.map(([r,c])=>g.grid[r][c]).join("");
const f=g.words.find(w=>w.w===word&&!w.found[p]);
if(f){
f.found[p]=true;
g.found[p]++;
sel.length=0;
FX.tone(700,.1,"square",.04);
g.burst(140+cx*55+27,80+cy*55+27,GOLD,10,200);
if(g.found[p]>=4)g.point(p,"ALL FOUND");
}
} else {
sel.length=0;
sel.push([cy,cx]);
}
}
},
draw(g,ctx){
g.floor("#1a1a3a","#22224a");
for(let r=0;r<10;r++)for(let c=0;c<10;c++){
const x=140+c*55,y=80+r*55;
const inP1=g.sel[0].some(([rr,cc])=>rr===r&&cc===c);
const inP2=g.sel[1].some(([rr,cc])=>rr===r&&cc===c);
ctx.fillStyle=inP1?"#2a5a8a":inP2?"#8a2a5a":"#2a2f63";
ctx.fillRect(x,y,50,50);
ctx.strokeStyle="#080b18";ctx.lineWidth=1;ctx.strokeRect(x,y,50,50);
g.text(g.grid[r][c],x+25,y+36,26,"#fff","center");
}
g.words.forEach((w,k)=>{
const y=680-40+k*18;
const s=(w.found[0]?"✓":" ")+(w.found[1]?"✓":" ")+" "+w.w;
g.text(s,W-120,y,14,GOLD);
});
g.text("P1: "+g.found[0]+"/4",20,40,16,C1);
g.text("P2: "+g.found[1]+"/4",W-20,40,16,C2,"right");
}
});

/* ---------- 8. SWORD FIGHT ---------- */
micro({id:"swordfightGame",title:"Sword Fight",desc:"Attack, parry, hit. Timing combat.",
cat:"action",key:"swordfight",win:5,
controls:"P1: A = attack, D = parry　 P2: ← = attack, → = parry — parry blocks the next attack. First to drain HP wins.",
round(g){
g.pl=[
{hp:3,cd:0,parry:0,flash:0},
{hp:3,cd:0,parry:0,flash:0}
];
},
update(g,dt){
g.pl.forEach((p,i)=>{
p.cd=Math.max(0,p.cd-dt);
p.parry=Math.max(0,p.parry-dt);
p.flash=Math.max(0,p.flash-dt);
if(p.cd>0)return;
const I=g.I[i];
if(I.pr){p.parry=.4;p.cd=.35;}
else if(I.pl){attack(g,i);}
});
},
draw(g,ctx){
g.floor("#1a1230","#2a1a3a");
[0,1].forEach(i=>{
const cx=i?675:225,p=g.pl[i];
if(p.flash>0){ctx.fillStyle=`rgba(255,90,120,${p.flash*1.5})`;ctx.fillRect(i?450:0,0,450,H);}
g.text("P"+(i+1),cx,50,20,col(i),"center");
g.text("HP "+p.hp,cx,80,26,GOLD,"center");
ctx.fillStyle=col(i);ctx.fillRect(cx-60,150,120,180);
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(cx-60,150,120,180);
ctx.save();
const angle=p.parry>0?-.8:.3;
ctx.translate(cx+(i?-70:70),230);ctx.rotate(angle);
ctx.fillStyle="#e8e8ff";ctx.fillRect(-3,-90,6,90);
ctx.fillStyle=GOLD;ctx.fillRect(-8,-20,16,6);
ctx.restore();
if(p.parry>0){
ctx.strokeStyle=GOLD;ctx.lineWidth=3;
ctx.beginPath();ctx.arc(cx+(i?-60:60),280,40,-.8,.8);ctx.stroke();
}
});
g.text("A: ATTACK  D: PARRY",W/2-200,440,14,C1,"center");
g.text("← ATTACK  → PARRY",W/2+200,440,14,C2,"center");
}
});
function attack(g,i){
const a=g.pl[i],b=g.pl[1-i];
a.cd=.55;
if(b.parry>0){
b.cd=.4;
FX.tone(300,.1,"square",.03);
g.burst(i?675:225,300,"#fff",8,140);
} else {
b.hp--;b.flash=.2;
g.burst(i?675:225,300,col(i),14,300);
playHitSound();
if(b.hp<=0)g.point(i,"K.O.");
}
}
})();