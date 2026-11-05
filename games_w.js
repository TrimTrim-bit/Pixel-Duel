/* =====================================================
   GAME PACK W — FINAL 4 games (reaches 200 total)
   Roulette, Baccarat, Craps, Slapjack
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri}=PD;
const col=i=>i?C2:C1;

const RANKS=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const SUITS=["♠","♣","♥","♦"];

function drawCardFace(ctx,x,y,r,suit){
ctx.fillStyle="#fff";ctx.fillRect(x,y,50,70);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(x,y,50,70);
ctx.font="bold 22px Courier New";ctx.textAlign="center";
ctx.fillStyle=suit>=2?"#c83030":"#111";
ctx.fillText(r,x+25,y+32);
ctx.font="22px serif";
ctx.fillText(SUITS[suit],x+25,y+56);
ctx.textAlign="left";
}
function drawDie(ctx,x,y,v,size){
ctx.fillStyle="#fff";ctx.fillRect(x,y,size,size);
ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.strokeRect(x,y,size,size);
const P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
ctx.fillStyle="#111";
const d=size/6;
(P[v]||[]).forEach(([a,b])=>{
ctx.beginPath();ctx.arc(x+size/2+a*size/3,y+size/2+b*size/3,d,0,Math.PI*2);ctx.fill();
});
}

/* ---------- 1. ROULETTE ---------- */
micro({
id:"rouletteGame",
title:"Roulette",
desc:"Pick a dozen. Spin. +2 if your dozen hits.",
cat:"brain",key:"roulette",win:1,hud:false,
controls:"P1: A/W/D pick 1-12/13-24/25-36　 P2: ←/↑/→ — 6 spins, most points wins.",
init(g){
g.picks=[-1,-1];g.scores=[0,0];g.round=0;
g.phase="pick";g.spinT=0;g.winner=-1;
},
update(g,dt){
if(g.phase==="pick"){
if(g.picks[0]<0){
if(g.I[0].pl)g.picks[0]=0;
else if(g.I[0].pu)g.picks[0]=1;
else if(g.I[0].pr)g.picks[0]=2;
}
if(g.picks[1]<0){
if(g.I[1].pl)g.picks[1]=0;
else if(g.I[1].pu)g.picks[1]=1;
else if(g.I[1].pr)g.picks[1]=2;
}
if(g.picks[0]>=0&&g.picks[1]>=0){
g.phase="spin";g.spinT=0;
g.winner=ri(1,36);
}
}else if(g.phase==="spin"){
g.spinT+=dt;
if(Math.random()<.3)FX.tone(400+Math.random()*200,.02,"square",.02);
if(g.spinT>1.2){
g.phase="reveal";g.spinT=0;
const d=Math.floor((g.winner-1)/12);
if(g.picks[0]===d)g.scores[0]+=2;
if(g.picks[1]===d)g.scores[1]+=2;
g.round++;
FX.tone(700,.1,"square",.04);
}
}else{
g.spinT+=dt;
if(g.spinT>1.5){
if(g.round>=6)g.byScore(g.scores);
else{g.phase="pick";g.picks=[-1,-1];}
}
}
},
draw(g,ctx){
g.floor("#0a2a1a","#1a4a2a");
g.text("ROULETTE",W/2,40,28,GOLD,"center");
g.text("ROUND "+Math.min(g.round+1,6)+"/6",W/2,72,16,"#9fc0ff","center");
const labels=["1-12","13-24","25-36"];
const dozen=g.phase==="reveal"?Math.floor((g.winner-1)/12):-1;
[0,1,2].forEach(d=>{
const x=200+d*180;
const hl=dozen===d;
ctx.fillStyle=hl?"#ffd24a":"#2a2f63";
ctx.fillRect(x-70,120,140,60);
ctx.strokeStyle=hl?"#fff":GOLD;ctx.lineWidth=hl?4:2;
ctx.strokeRect(x-70,120,140,60);
g.text(labels[d],x,158,18,hl?"#111":"#fff","center");
});
[0,1].forEach(p=>{
const pick=g.picks[p];
g.text("P"+(p+1),p?W-40:40,220,18,col(p));
g.text("PICK: "+(pick<0?"?":labels[pick]),p?W-40:40,245,16,GOLD);
g.text("SCORE: "+g.scores[p],p?W-40:40,270,16,col(p));
});
if(g.phase==="spin"){
g.text(String(ri(1,36)),W/2,340,80,"#fff","center");
g.text("SPINNING...",W/2,420,18,GOLD,"center");
}else if(g.phase==="reveal"){
g.text(String(g.winner),W/2,340,80,GOLD,"center");
g.text("DOZEN "+labels[dozen],W/2,420,20,GOLD,"center");
if(g.picks[0]===dozen&&g.picks[1]===dozen)g.text("BOTH SCORED!",W/2,450,16,GOLD,"center");
else if(g.picks[0]===dozen)g.text("P1 +2",W/2,450,16,C1,"center");
else if(g.picks[1]===dozen)g.text("P2 +2",W/2,450,16,C2,"center");
else g.text("NO SCORE",W/2,450,16,"#9fc0ff","center");
}
}
});

/* ---------- 2. BACCARAT ---------- */
function bacCard(){
const r=ri(1,13);
if(r===1)return{r:1,label:"A",v:1,suit:ri(0,3)};
if(r>=10)return{r,label:["10","J","Q","K"][r-10],v:0,suit:ri(0,3)};
return{r,label:String(r),v:r,suit:ri(0,3)};
}
function bacScore(hand){return hand.reduce((a,c)=>a+c.v,0)%10;}
micro({
id:"baccaratGame",
title:"Baccarat",
desc:"Draw to 9. Closest hand wins.",
cat:"brain",key:"baccarat",win:5,
controls:"P1: W hit, S stand　 P2: ↑ hit, ↓ stand — highest score (mod 10) wins. Max 3 cards each.",
round(g){
g.p=[bacCard(),bacCard()];
g.b=[bacCard(),bacCard()];
g.pDone=false;g.bDone=false;
g.pWait=0;g.bWait=0;
},
update(g,dt){
if(!g.pDone){
g.pWait+=dt;
if(g.I[0].pu){g.p.push(bacCard());g.pDone=true;FX.tone(500,.08,"square",.03);}
else if(g.I[0].pd||g.pWait>5){g.pDone=true;FX.tone(300,.06,"square",.03);}
}
if(!g.bDone){
g.bWait+=dt;
if(g.I[1].pu){g.b.push(bacCard());g.bDone=true;FX.tone(500,.08,"square",.03);}
else if(g.I[1].pd||g.bWait>5){g.bDone=true;FX.tone(300,.06,"square",.03);}
}
if(g.pDone&&g.bDone){
const pv=bacScore(g.p),bv=bacScore(g.b);
FX.tone(700,.1,"square",.04);
if(pv>bv)g.point(0,"P1 "+pv+"-"+bv);
else if(bv>pv)g.point(1,"P2 "+bv+"-"+pv);
else g.next("TIE "+pv+"-"+bv);
}
},
draw(g,ctx){
g.floor("#0a3a1a","#1a5a2a");
g.text("BACCARAT",W/2,40,26,GOLD,"center");
g.text("Closest to 9 wins",W/2,68,14,"#9fc0ff","center");
[0,1].forEach(p=>{
const hand=p===0?g.p:g.b,off=p?490:40;
g.text("P"+(p+1)+" "+(p===0?"(HIT=W STAND=S)":"(HIT=↑ STAND=↓)"),off+180,100,14,col(p),"center");
hand.forEach((c,k)=>{
drawCardFace(ctx,off+k*70,130,c.label,c.suit);
});
g.text("SCORE: "+bacScore(hand),off+180,240,20,GOLD,"center");
const done=p===0?g.pDone:g.bDone;
if(done)g.text("STANDING",off+180,265,14,GREEN,"center");
});
}
});

/* ---------- 3. CRAPS ---------- */
micro({
id:"crapsGame",
title:"Craps",
desc:"Roll 7/11 to win, 2/3/12 loses. Hit point to win.",
cat:"brain",key:"craps",win:3,
controls:"SPACE (P1) or ENTER (P2) to roll when you're the shooter. Come-out 7/11 wins, 2/3/12 loses, else point.",
init(g){g.roundNum=0;},
round(g){
g.shooter=g.roundNum%2;
g.roundNum++;
g.point=0;
g.phase="come";
g.rolling=false;
g.rollT=0;
g.dice=[0,0];
g.lastSum=0;
},
update(g,dt){
if(g.rolling){
g.rollT+=dt;
if(g.rollT>.7){
g.rolling=false;
const sum=g.dice[0]+g.dice[1];
g.lastSum=sum;
FX.tone(sum===7?800:600,.1,"square",.04);
if(g.phase==="come"){
if(sum===7||sum===11)g.point(g.shooter,"P"+(g.shooter+1)+" WINS "+sum);
else if(sum===2||sum===3||sum===12)g.next("CRAPS "+sum);
else{g.point=sum;g.phase="point";}
}else{
if(sum===g.point)g.point(g.shooter,"P"+(g.shooter+1)+" HITS "+sum);
else if(sum===7)g.next("SEVEN OUT");
}
}
return;
}
if(g.I[g.shooter].pa){
g.dice=[ri(1,6),ri(1,6)];
g.rolling=true;
g.rollT=0;
FX.tone(400,.06,"square",.03);
}
},
draw(g,ctx){
g.floor("#0a2a3a","#1a3a4a");
g.text("CRAPS",W/2,40,28,GOLD,"center");
g.text("P"+(g.shooter+1)+" SHOOTS",W/2,80,20,col(g.shooter),"center");
if(g.phase==="point")g.text("POINT: "+g.point,W/2,110,22,GOLD,"center");
else g.text("COME-OUT ROLL",W/2,110,18,"#9fc0ff","center");
g.dice.forEach((d,k)=>{
drawDie(ctx,W/2-80+k*90,180,d,70);
});
g.text("SUM: "+(g.dice[0]+g.dice[1]),W/2,300,24,"#fff","center");
g.text(g.rolling?"ROLLING...":(g.I[g.shooter].pa?"":"PRESS "+(g.shooter===0?"SPACE":"ENTER")+" TO ROLL"),W/2,350,16,col(g.shooter),"center");
[0,1].forEach(p=>{
g.text("P"+(p+1),p?W-40:40,440,16,col(p));
});
}
});

/* ---------- 4. SLAPJACK ---------- */
micro({
id:"slapjackGame",
title:"Slapjack",
desc:"See a Jack? Slap fast. First to 5 wins.",
cat:"reflex",key:"slapjack",win:5,
controls:"Cards flip. When a JACK appears, first to press SPACE (P1) or ENTER (P2) scores. Wrong slap = 1s lockout.",
round(g){
g.flipT=0;
g.currentCard=null;
g.cd=[0,0];
g.cards=0;
},
update(g,dt){
g.cd[0]=Math.max(0,g.cd[0]-dt);
g.cd[1]=Math.max(0,g.cd[1]-dt);
g.flipT-=dt;
if(g.flipT<=0){
g.flipT=Math.max(.3,.7-g.cards*.01);
g.currentCard={r:ri(0,12),suit:ri(0,3)};
g.cards++;
}
if(g.currentCard===null)return;
if(g.cd[0]<=0&&g.I[0].pa){
if(g.currentCard.r===9){g.point(0,"P1 SLAP!");return;}
g.cd[0]=1;FX.tone(150,.15,"sawtooth",.04,-40);
}
if(g.cd[1]<=0&&g.I[1].pa){
if(g.currentCard.r===9){g.point(1,"P2 SLAP!");return;}
g.cd[1]=1;FX.tone(150,.15,"sawtooth",.04,-40);
}
},
draw(g,ctx){
g.floor("#1a1a3a","#2a2a4a");
g.text("SLAPJACK",W/2,40,28,GOLD,"center");
g.text("SLAP WHEN YOU SEE A JACK!",W/2,75,16,"#9fc0ff","center");
if(g.currentCard){
const c=g.currentCard;
const cx=W/2-60,cy=140;
drawCardFace(ctx,cx,cy,RANKS[c.r],c.suit);
if(c.r===9){
ctx.strokeStyle=RED;ctx.lineWidth=4;
ctx.strokeRect(cx-4,cy-4,58,78);
}
}
[0,1].forEach(p=>{
const active=g.cd[p]<=0;
g.text("P"+(p+1),p?W-40:40,420,20,col(p));
g.text(active?(p===0?"SPACE":"ENTER"):"LOCKED",p?W-40:40,450,16,active?col(p):RED);
});
}
});
})();