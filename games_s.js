/* =====================================================
   GAME PACK S — 8 new games
   Battleship, Spin Battle, Tower of Hanoi, Lights Out,
   Magnetic Maze, Balloon Fight, Minesweeper Duel,
   Speed Tic-Tac-Toe
===================================================== */
(function(){
"use strict";
const {micro,FX,W,H,C1,C2,GOLD,GREEN,RED,rnd,ri}=PD;
const col=i=>i?C2:C1;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* ---------- 1. BATTLESHIP ---------- */
function bbFleet(){
const grid=Array.from({length:10},()=>new Array(10).fill(null));
const ships=[];
for(const len of [5,4,3,2,1]){
for(let tries=0;tries<300;tries++){
const horiz=Math.random()<.5;
const sx=ri(0,horiz?10-len:9),sy=ri(0,horiz?9:10-len);
let ok=true;
for(let k=0;k<len;k++){
const x=sx+(horiz?k:0),y=sy+(horiz?0:k);
if(grid[y][x]!==null){ok=false;break;}
}
if(ok){
const ship={size:len,hits:0};
ships.push(ship);
for(let k=0;k<len;k++){
const x=sx+(horiz?k:0),y=sy+(horiz?0:k);
grid[y][x]={shipIdx:ships.length-1,hit:false};
}
break;
}
}
}
return{grid,ships,alive:ships.length};
}
micro({id:"battleshipGame",title:"Battleship",desc:"Sink 5 ships before rival sinks yours.",
cat:"brain",key:"battleship",win:1,hud:false,
controls:"Click the enemy grid to fire. Hit = keep your turn, miss = switch. Sink all 5 ships.",
init(g){
g.fleets=[bbFleet(),bbFleet()];g.turn=0;
},
click(g,x,y){
const ox=250,oy=80,sz=40;
if(x<ox||x>ox+sz*10||y<oy||y>oy+sz*10)return;
const cx=Math.floor((x-ox)/sz),cy=Math.floor((y-oy)/sz);
const target=g.fleets[1-g.turn];
const cell=target.grid[cy][cx];
if(cell&&cell.hit)return;
if(!cell){target.grid[cy][cx]={miss:true};FX.tone(200,.1,"square",.03);g.turn=1-g.turn;return;}
cell.hit=true;
const ship=target.ships[cell.shipIdx];
ship.hits++;
if(ship.hits>=ship.size){
target.alive--;
if(target.alive<=0){g.byScore(g.turn===0?[1,0]:[0,1]);return;}
FX.playBoom();
} else FX.tone(500,.05,"square",.04);
},
draw(g,ctx){
ctx.fillStyle="#0a1a3a";ctx.fillRect(0,0,W,H);
const target=g.fleets[1-g.turn];
const ox=250,oy=80,sz=40;
for(let r=0;r<10;r++)for(let c=0;c<10;c++){
const v=target.grid[r][c];
const x=ox+c*sz,y=oy+r*sz;
if(!v){ctx.fillStyle="#1a2a5a";}
else if(v.miss){ctx.fillStyle="#3a4a7a";}
else if(v.hit){ctx.fillStyle=RED;}
ctx.fillRect(x+1,y+1,sz-2,sz-2);
ctx.strokeStyle="#0a0a1a";ctx.lineWidth=1;ctx.strokeRect(x+1,y+1,sz-2,sz-2);
if(v&&v.miss){ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x+sz/2,y+sz/2,4,0,Math.PI*2);ctx.fill();}
if(v&&v.hit){ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x+sz/2,y+sz/2,6,0,Math.PI*2);ctx.fill();}
}
g.text("P"+(g.turn+1)+" FIRING AT P"+(2-g.turn),W/2,40,24,col(g.turn),"center");
g.text("Enemy ships remaining: "+target.alive,W/2,65,14,"#9fc0ff","center");
}
});

/* ---------- 2. SPIN BATTLE ---------- */
micro({id:"spinbattleGame",title:"Spin Battle",desc:"Ram rival to drain their spin. Last one spinning wins.",
cat:"action",key:"spinbattle",win:3,
controls:"P1: WASD accelerate　 P2: ARROWS — ram rival to drain their spin. Higher speed = more damage.",
round(g){
g.pl=[
{x:200,y:250,vx:0,vy:0,hp:100,spin:1},
{x:700,y:250,vx:0,vy:0,hp:100,spin:1}
];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0);
const l=Math.hypot(ax,ay)||1;
p.vx+=ax/l*300*dt;p.vy+=ay/l*300*dt;
p.vx*=.98;p.vy*=.98;
p.spin=Math.max(0,p.spin-dt*.02);
p.x+=p.vx*dt;p.y+=p.vy*dt;
if(p.x<60||p.x>W-60){p.x=cl(p.x,60,W-60);p.vx*=-.7;}
if(p.y<60||p.y>H-60){p.y=cl(p.y,60,H-60);p.vy*=-.7;}
});
const [a,b]=g.pl,d=Math.hypot(a.x-b.x,a.y-b.y);
if(d<50&&d>0){
const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d;
const relV=Math.abs((a.vx-b.vx)*nx+(a.vy-b.vy)*ny);
const dmg=Math.max(2,relV*.15);
a.hp-=dmg*.3;b.hp-=dmg*.3;
const ov=(50-d)/2;
a.x-=nx*ov;a.y-=ny*ov;b.x+=nx*ov;b.y+=ny*ov;
const imp=Math.min(300,relV*.8);
a.vx=-nx*imp;a.vy=-ny*imp;
b.vx=nx*imp;b.vy=ny*imp;
g.burst((a.x+b.x)/2,(a.y+b.y)/2,GOLD,8,200);
playHitSound();
}
if(a.hp<=0&&b.hp<=0)g.next("DOUBLE KO");
else if(a.hp<=0)g.point(1,"P2 WINS");
else if(b.hp<=0)g.point(0,"P1 WINS");
},
draw(g,ctx){
g.floor("#1a1a3a","#22224a");
ctx.strokeStyle="#4a4a7a";ctx.lineWidth=4;
ctx.beginPath();ctx.arc(W/2,H/2+20,240,0,Math.PI*2);ctx.stroke();
g.pl.forEach((p,i)=>{
ctx.save();ctx.translate(p.x,p.y);ctx.rotate(g.t*(4+i*2));
ctx.fillStyle=col(i);
for(let k=0;k<6;k++){
ctx.rotate(Math.PI/3);
ctx.fillRect(-4,-28,8,20);
}
ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
ctx.restore();
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-40,p.y+40,80,6);
ctx.fillStyle=p.hp>50?GREEN:p.hp>20?GOLD:RED;
ctx.fillRect(p.x-40,p.y+40,80*Math.max(0,p.hp)/100,6);
});
}
});

/* ---------- 3. TOWER OF HANOI ---------- */
micro({id:"hanoiGame",title:"Tower of Hanoi",desc:"Move all 5 discs to the right peg. Smallest on top.",
cat:"brain",key:"hanoi",win:3,
controls:"Click a peg to pick up its top disc, click another peg to drop it. Never place bigger on smaller.",
round(g){
g.towers=[
[[5,4,3,2,1],[],[]],
[[5,4,3,2,1],[],[]]
];
g.sel=[-1,-1];
},
click(g,x,y){
if(y<180||y>460)return;
for(let p=0;p<2;p++){
const ox=p?525:75;
for(let k=0;k<3;k++){
const px=ox+k*110+55;
if(Math.abs(x-px)<50){
const tw=g.towers[p];
if(g.sel[p]>=0){
const from=tw[g.sel[p]],to=tw[k];
if(from.length&&(!to.length||to[to.length-1]>from[from.length-1])){
to.push(from.pop());
FX.tone(400,.06,"square",.03);
if(tw[2].length===5){g.point(p,"SOLVED");return;}
}
g.sel[p]=-1;
} else if(tw[k].length)g.sel[p]=k;
}
}
}
},
draw(g,ctx){
g.floor("#13102a","#1a1a3a");
for(let p=0;p<2;p++){
const ox=p?525:75;
ctx.fillStyle="#4a3a2a";ctx.fillRect(ox+20,440,290,20);
for(let k=0;k<3;k++)ctx.fillStyle="#8a6a3a",ctx.fillRect(ox+k*110+52,180,8,260);
const tw=g.towers[p];
for(let k=0;k<3;k++){
tw[k].forEach((size,idx)=>{
const cx=ox+k*110+56,cy=430-idx*32;
const w=size*18+20;
const isSel=g.sel[p]===k&&idx===tw[k].length-1;
ctx.fillStyle=isSel?GOLD:["#ff6a6a","#ffb03a","#ffe66d","#6aff8a","#6ab0ff"][size-1];
ctx.fillRect(cx-w/2,cy-28,w,28);
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(cx-w/2,cy-28,w,28);
});
}
g.text("P"+(p+1),ox+165,150,20,col(p),"center");
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* ---------- 4. LIGHTS OUT ---------- */
function lightsNew(){
const g=[];
for(let r=0;r<4;r++){const row=[];for(let c=0;c<4;c++)row.push(Math.random()<.5);g.push(row);}
for(let k=0;k<4;k++){
const r=ri(0,3),c=ri(0,3);
toggleCell(g,r,c);
}
return g;
}
function toggleCell(g,r,c){
for(const [dr,dc] of[[0,0],[1,0],[-1,0],[0,1],[0,-1]]){
const nr=r+dr,nc=c+dc;
if(nr>=0&&nc>=0&&nr<4&&nc<4)g[nr][nc]=!g[nr][nc];
}
}
function lightsSolved(g){return g.every(row=>row.every(v=>!v));}
micro({id:"lightsoutGame",title:"Lights Out",desc:"Toggle lights to turn them all off.",
cat:"brain",key:"lightsout",win:3,
controls:"Click a cell to toggle it and its 4 neighbors. Turn all lights off to win the round.",
round(g){
g.grids=[lightsNew(),lightsNew()];
},
click(g,x,y){
for(let p=0;p<2;p++){
const ox=p?560:140,oy=130,sz=55;
if(x>ox&&x<ox+sz*4&&y>oy&&y<oy+sz*4){
const c=Math.floor((x-ox)/sz),r=Math.floor((y-oy)/sz);
toggleCell(g.grids[p],r,c);
FX.tone(400,.05,"square",.03);
if(lightsSolved(g.grids[p]))g.point(p,"SOLVED");
return;
}
}
},
draw(g,ctx){
g.floor("#0a1020","#121a3a");
for(let p=0;p<2;p++){
const ox=p?560:140,oy=130,sz=55;
ctx.fillStyle="#1a2548";ctx.fillRect(ox-6,oy-6,sz*4+12,sz*4+12);
ctx.strokeStyle=col(p);ctx.lineWidth=2;ctx.strokeRect(ox-6,oy-6,sz*4+12,sz*4+12);
for(let r=0;r<4;r++)for(let c=0;c<4;c++){
const x=ox+c*sz,y=oy+r*sz;
ctx.fillStyle=g.grids[p][r][c]?GOLD:"#2a3a5a";
ctx.fillRect(x+2,y+2,sz-4,sz-4);
ctx.strokeStyle="#080b18";ctx.lineWidth=1;ctx.strokeRect(x+2,y+2,sz-4,sz-4);
}
g.text("P"+(p+1),ox+sz*2,110,20,col(p),"center");
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* ---------- 5. MAGNETIC MAZE ---------- */
function mazeBuild(){
const walls=[];
for(let k=0;k<8;k++){
const horiz=Math.random()<.5;
const x=horiz?rnd(150,700):rnd(150,700);
const y=horiz?rnd(100,400):rnd(100,400);
walls.push({x,y,w:horiz?rnd(80,150):12,h:horiz?12:rnd(80,150)});
}
return walls;
}
micro({id:"magnetmazeGame",title:"Magnetic Maze",desc:"Magnet pulls your ball. Navigate it to goal.",
cat:"reflex",key:"magnetmaze",win:3,
controls:"P1: WASD move magnet　 P2: ARROWS — ball follows magnet. Steer through maze to reach green goal.",
round(g){
g.walls=mazeBuild();
g.pl=[
{x:100,y:250,ball:{x:100,y:250}},
{x:800,y:250,ball:{x:800,y:250}}
];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.x=cl(p.x+((I.r?1:0)-(I.l?1:0))*300*dt,20,W-20);
p.y=cl(p.y+((I.d?1:0)-(I.u?1:0))*300*dt,60,H-20);
const dx=p.x-p.ball.x,dy=p.y-p.ball.y;
const d=Math.max(Math.hypot(dx,dy),30);
p.ball.x+=dx/d*Math.min(d*4,280)*dt;
p.ball.y+=dy/d*Math.min(d*4,280)*dt;
for(const w of g.walls){
const nx=cl(p.ball.x,w.x,w.x+w.w),ny=cl(p.ball.y,w.y,w.y+w.h);
const ddx=p.ball.x-nx,ddy=p.ball.y-ny;
const dd=Math.hypot(ddx,ddy);
if(dd<10&&dd>0){p.ball.x=nx+ddx/dd*10;p.ball.y=ny+ddy/dd*10;}
}
});
if(g.pl[0].ball.x>W-40)g.point(0,"GOAL");
if(g.pl[1].ball.x<40)g.point(1,"GOAL");
},
draw(g,ctx){
g.floor("#13102a","#1a1a3a");
g.walls.forEach(w=>{
ctx.fillStyle="#4a3a6a";ctx.fillRect(w.x,w.y,w.w,w.h);
ctx.fillStyle="#6a56b8";ctx.fillRect(w.x,w.y,w.w,3);
});
ctx.fillStyle=C2;ctx.fillRect(W-40,100,20,340);
ctx.fillStyle=C1;ctx.fillRect(20,100,20,340);
g.pl.forEach((p,i)=>{
ctx.strokeStyle=col(i);ctx.lineWidth=2;ctx.globalAlpha=.4;
ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.ball.x,p.ball.y);ctx.stroke();
ctx.globalAlpha=1;
g.blob({x:p.ball.x,y:p.ball.y,r:10},col(i),p.ball.x,p.ball.y,false);
ctx.strokeStyle=col(i);ctx.lineWidth=3;
ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.stroke();
});
}
});

/* ---------- 6. BALLOON FIGHT ---------- */
micro({id:"balloonfightGame",title:"Balloon Fight",desc:"Float around. Pop rival's balloon. 2 balloons each.",
cat:"action",key:"balloonfight",win:3,
controls:"P1: WASD float, SPACE flap up　 P2: ARROWS, ENTER flap — hit rival from above to pop their balloon",
round(g){
g.pl=[
{x:200,y:250,vx:0,vy:0,hp:2,cd:0},
{x:700,y:250,vx:0,vy:0,hp:2,cd:0}
];
},
update(g,dt){
g.pl.forEach((p,i)=>{
const I=g.I[i];
p.cd=Math.max(0,p.cd-dt);
p.vx+=((I.r?1:0)-(I.l?1:0))*220*dt;
p.vy+=600*dt;
if(I.u)p.vy-=500*dt;
if(I.a&&p.cd<=0){p.vy=-320;p.cd=.3;FX.tone(400,.06,"square",.03);}
p.vx*=.98;
p.x+=p.vx*dt;p.y+=p.vy*dt;
if(p.x<20||p.x>W-20){p.x=cl(p.x,20,W-20);p.vx*=-.5;}
if(p.y<60){p.y=60;p.vy=Math.max(0,p.vy);}
if(p.y>H-20){p.y=H-20;p.vy=Math.min(0,p.vy);}
});
const [a,b]=g.pl,d=Math.hypot(a.x-b.x,a.y-b.y);
if(d<40&&d>0){
const aAbove=a.y<b.y-8;
const bAbove=b.y<a.y-8;
if(aAbove&&b.cd<=0&&a.cd<=0){b.hp--;b.cd=1;g.burst(b.x,b.y,C1,18,320);playHitSound();
if(b.hp<=0)g.point(0,"P2 DOWN");return;}
if(bAbove&&a.cd<=0&&b.cd<=0){a.hp--;a.cd=1;g.burst(a.x,a.y,C2,18,320);playHitSound();
if(a.hp<=0)g.point(1,"P1 DOWN");return;}
const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d;
a.x-=nx*6;a.y-=ny*6;b.x+=nx*6;b.y+=ny*6;
}
},
draw(g,ctx){
g.floor("#1a3a5a","#0a2040");
g.pl.forEach((p,i)=>{
ctx.strokeStyle="rgba(255,255,255,.3)";ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x,p.y-30);ctx.stroke();
ctx.fillStyle=GOLD;ctx.beginPath();ctx.ellipse(p.x,p.y-38,14,18,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
g.blob({x:p.x,y:p.y,r:14},col(i),p.x+60,p.y,Math.abs(p.vy)>50);
ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-24,p.y+22,48,6);
ctx.fillStyle=RED;ctx.fillRect(p.x-24,p.y+22,48*Math.max(0,p.hp)/2,6);
});
}
});

/* ---------- 7. MINESWEEPER DUEL ---------- */
function msNewGrid(){
const g=Array.from({length:6},()=>new Array(6).fill(-1));
let mines=0;
while(mines<6){
const x=ri(0,5),y=ri(0,5);
if(g[y][x]===-1){g[y][x]=-2;mines++;}
}
for(let y=0;y<6;y++)for(let x=0;x<6;x++){
if(g[y][x]===-2)continue;
let c=0;
for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
const nx=x+dx,ny=y+dy;
if(nx>=0&&ny>=0&&nx<6&&ny<6&&g[ny][nx]===-2)c++;
}
g[y][x]=c;
}
return g;
}
micro({id:"minesweeperGame",title:"Minesweeper Duel",desc:"Clear all safe tiles. Step on a mine and lose.",
cat:"brain",key:"minesweeper",win:1,hud:false,
controls:"Click a tile to reveal it. Reveal all safe tiles to win. Hit a mine and you lose.",
init(g){
g.grids=[msNewGrid(),msNewGrid()];
g.revealed=[Array.from({length:6},()=>new Array(6).fill(false)),
            Array.from({length:6},()=>new Array(6).fill(false))];
g.dead=[false,false];
g.safeLeft=[30,30];
},
click(g,x,y){
if(g.dead[0]||g.dead[1])return;
for(let p=0;p<2;p++){
const ox=p?510:110,oy=80,sz=45;
if(x>ox&&x<ox+sz*6&&y>oy&&y<oy+sz*6){
const c=Math.floor((x-ox)/sz),r=Math.floor((y-oy)/sz);
if(g.revealed[p][r][c])return;
const tile=g.grids[p][r][c];
if(tile===-2){g.revealed[p][r][c]=true;g.dead[p]=true;
g.burst(ox+c*sz+sz/2,oy+r*sz+sz/2,RED,20,320);FX.playBoom();
if(g.dead[0]&&g.dead[1])g.next("BOTH DEAD");
else g.byScore(g.dead[0]?[0,1]:[1,0]);
return;}
g.revealed[p][r][c]=true;
g.safeLeft[p]--;
FX.tone(500,.04,"square",.03);
if(g.safeLeft[p]<=0){g.byScore(p===0?[1,0]:[0,1]);return;}
}
}
},
draw(g,ctx){
g.floor("#0a1020","#121a3a");
for(let p=0;p<2;p++){
const ox=p?510:110,oy=80,sz=45;
ctx.fillStyle="#1a2050";ctx.fillRect(ox-4,oy-4,sz*6+8,sz*6+8);
ctx.strokeStyle=col(p);ctx.lineWidth=2;ctx.strokeRect(ox-4,oy-4,sz*6+8,sz*6+8);
for(let r=0;r<6;r++)for(let c=0;c<6;c++){
const x=ox+c*sz,y=oy+r*sz;
const rev=g.revealed[p][r][c];
if(rev){
const v=g.grids[p][r][c];
ctx.fillStyle=v===-2?RED:"#2a3260";
ctx.fillRect(x+1,y+1,sz-2,sz-2);
if(v>0)g.text(String(v),x+sz/2,y+sz/2+7,18,v===1?"#6ab0ff":v===2?"#6aff8a":"#ff6a6a","center");
} else {
ctx.fillStyle="#4a5a9a";ctx.fillRect(x+1,y+1,sz-2,sz-2);
}
}
g.text("P"+(p+1)+" safe: "+g.safeLeft[p],ox+sz*3,70,14,col(p),"center");
}
ctx.fillStyle="#080b18";ctx.fillRect(448,0,4,H);
}
});

/* ---------- 8. SPEED TIC-TAC-TOE ---------- */
function checkWin(b,p){
const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
return L.some(line=>line.every(i=>b[i]===p));
}
micro({id:"speedtttGame",title:"Speed Tic-Tac-Toe",desc:"Tic-tac-toe with 3 seconds per move.",
cat:"reflex",key:"speedttt",win:3,
controls:"Click cells on your turn. 3 seconds per move or a random move is made.",
round(g){
g.board=new Array(9).fill(-1);
g.turn=0;g.timer=3;
},
update(g,dt){
g.timer-=dt;
if(g.timer<=0){
const empty=g.board.map((v,i)=>v<0?i:-1).filter(i=>i>=0);
if(empty.length){
const cell=empty[ri(0,empty.length-1)];
g.board[cell]=g.turn;
FX.tone(300,.1,"square",.03);
if(checkWin(g.board,g.turn)){g.point(g.turn,"TIMEOUT WIN");return;}
if(!g.board.includes(-1)){g.next("DRAW");return;}
g.turn=1-g.turn;g.timer=3;
}
}
},
click(g,x,y){
if(x<270||x>630||y<100||y>460)return;
const cx=Math.floor((x-270)/120),cy=Math.floor((y-100)/120);
const idx=cy*3+cx;
if(idx<0||idx>8||g.board[idx]>=0)return;
g.board[idx]=g.turn;
if(checkWin(g.board,g.turn)){g.point(g.turn,"WIN");return;}
if(!g.board.includes(-1)){g.next("DRAW");return;}
g.turn=1-g.turn;g.timer=3;
},
draw(g,ctx){
ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
ctx.strokeStyle=GOLD;ctx.lineWidth=4;
for(let k=1;k<3;k++){
ctx.beginPath();ctx.moveTo(270+k*120,100);ctx.lineTo(270+k*120,460);ctx.stroke();
ctx.beginPath();ctx.moveTo(270,100+k*120);ctx.lineTo(630,100+k*120);ctx.stroke();
}
g.board.forEach((v,k)=>{
if(v<0)return;
const cx=270+(k%3)*120+60,cy=100+Math.floor(k/3)*120+60;
ctx.strokeStyle=col(v);ctx.lineWidth=6;
if(v===0){
ctx.beginPath();ctx.moveTo(cx-30,cy-30);ctx.lineTo(cx+30,cy+30);ctx.moveTo(cx+30,cy-30);ctx.lineTo(cx-30,cy+30);ctx.stroke();
} else {
ctx.beginPath();ctx.arc(cx,cy,32,0,Math.PI*2);ctx.stroke();
}
});
g.text("P"+(g.turn+1)+"'S TURN",W/2,50,24,col(g.turn),"center");
ctx.fillStyle="#2a2f63";ctx.fillRect(250,480,400,10);
ctx.fillStyle=g.timer<1?RED:GOLD;ctx.fillRect(250,480,400*Math.max(0,g.timer)/3,10);
}
});
})();