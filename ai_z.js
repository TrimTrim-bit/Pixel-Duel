(function(){
"use strict";
if(!window.PD||!window.PD.AI)return;
const {register}=window.PD.AI;
function aiPress(k){if(typeof window.aiPress==="function")window.aiPress(k);keys[k]=true;setTimeout(()=>{keys[k]=false;},80);}

let triviaDelay=null;
register("triviaGame",(g)=>{
  if(g.reveal!==null)return;
  if(g.lock[1]>0||triviaDelay)return;
  if(Math.random()<.03){
    const base=window.PDX_AI&&window.PDX_AI.difficulty==="hard"?400:window.PDX_AI&&window.PDX_AI.difficulty==="easy"?1800:900;
    triviaDelay=base+Math.random()*800;
    setTimeout(()=>{
      const key=String((g.q.c+7)%10);
      aiPress(key);
      triviaDelay=null;
    },triviaDelay);
  }
});

register("pinballGame",(g)=>{
  if(!g||!g.pl)return;
  const p=g.pl[1];
  if(!p.ball)return;
  const b=p.ball;
  if(b.y>380){
    if(b.x<675+230)aiPress("arrowleft");
    if(b.x>675+230)aiPress("arrowright");
  }
});

register("asteroidsGame",(g)=>{
  if(!g||!g.pl||!g.asteroids)return;
  const p=g.pl[1];
  const ast=g.asteroids[1];
  if(!ast.length)return;
  let target=null,bd=Infinity;
  for(const a of ast){const d=Math.hypot(a.x-p.x,a.y-p.y);if(d<bd){bd=d;target=a;}}
  if(!target)return;
  if(target.x<p.x-15)aiPress("arrowleft");
  if(target.x>p.x+15)aiPress("arrowright");
  if(Math.abs(target.x-p.x)<40&&target.y<p.y-40)aiPress("enter");
});

register("copterGame",(g)=>{
  if(!g||!g.pl||!g.track)return;
  const p=g.pl[1];
  let next=null;
  for(const t of g.track){if(t.x>p.dist&&t.x<p.dist+300){if(!next||t.x<next.x)next=t;}}
  if(!next)return;
  if(p.y>next.y+10)aiPress("enter");
});

register("wheelGame",(g)=>{
  if(!g||!g.pl)return;
  const p=g.pl[1];
  if(!p.spinning&&g.turn===1&&Math.random()<.03)aiPress("enter");
});

let hangmanLetters=["E","T","A","O","I","N","S","H","R","D","L","U","C","M","F","W","Y","G","P","B"];
register("hangmanGame",(g)=>{
  if(!g||g.turn!==1)return;
  if(Math.random()<.02){
    for(const L of hangmanLetters){if(!g.guessed.includes(L)){aiPress(L.toLowerCase());break;}}
  }
});

register("invadersGame",(g)=>{
  if(!g||!g.pl||!g.inv)return;
  const me=g.pl[1];
  const alive=g.inv[1].filter(x=>x.alive);
  if(!alive.length)return;
  let near=alive[0],nd=Infinity;
  for(const inv of alive){const d=Math.abs(inv.x+450-me.x);if(d<nd){nd=d;near=inv;}}
  const tx=450+near.x;
  if(tx<me.x-10)aiPress("arrowleft");
  if(tx>me.x+10)aiPress("arrowright");
  if(Math.random()<.35)aiPress("arrowup");
});

})();