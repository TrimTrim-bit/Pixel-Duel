(function(){
"use strict";
if(!window.PD||!window.PD.AI)return;
const {register}=window.PD.AI;
function aiPress(k){if(typeof window.aiPress==="function")window.aiPress(k);keys[k]=true;setTimeout(()=>{keys[k]=false;},80);}

/* Word Scramble */
let scrDelay=null;
register("scrambleGame",(g)=>{
  if(g.lock[1]>0||scrDelay)return;
  if(Math.random()<.03){
    const base=window.PDX_AI.difficulty==="hard"?300:window.PDX_AI.difficulty==="easy"?1500:700;
    scrDelay=base+Math.random()*500;
    setTimeout(()=>{
      const k=["arrowleft","arrowup","arrowright","arrowdown"][g.ans];
      aiPress(k);scrDelay=null;
    },scrDelay);
  }
});

register("simonGame",(g)=>{
  if(g.showing||g.idx[1]>=g.seq.length||g.lock[1])return;
  const target=g.seq[g.idx[1]];
  if(Math.random()<.1){
    const keys=["arrowup","arrowleft","arrowdown","arrowright"];
    aiPress(keys[target]);
  }
});

register("lasertagGame",(g)=>{
  if(!g.pl)return;
  const me=g.pl[1],you=g.pl[0];
  if(Math.random()<.3){
    if(you.x<me.x-10)aiPress("arrowleft");
    if(you.x>me.x+10)aiPress("arrowright");
    if(you.y<me.y-10)aiPress("arrowup");
    if(you.y>me.y+10)aiPress("arrowdown");
  }
  if(Math.random()<.03)aiPress("enter");
});

register("bubbleShooterGame",(g)=>{
  if(!g.cr||!g.bubbles.length)return;
  const me=g.cr[1];
  let near=g.bubbles[0],nd=Infinity;
  for(const b of g.bubbles){const d=Math.hypot(b.x-me.x,b.y-me.y);if(d<nd){nd=d;near=b;}}
  if(near.x<me.x-15)aiPress("arrowleft");
  if(near.x>me.x+15)aiPress("arrowright");
  if(near.y<me.y-15)aiPress("arrowup");
  if(near.y>me.y+15)aiPress("arrowdown");
  if(nd<40)aiPress("enter");
});

register("froggerGame",()=>{if(Math.random()<.12)aiPress("arrowup");});

register("clickFrenzyGame",()=>{aiPress("enter");});

register("memoryGridGame",(g)=>{
  if(g.showing||g.done[1]||g.lock[1])return;
  const target=g.idx[1]+1;
  for(let i=0;i<9;i++){
    if(g.grid[i]===target){
      const keys=["u","i","o","j","k","l","m",",","."];
      if(Math.random()<.15)aiPress(keys[i]);
      break;
    }
  }
});

register("rpslsGame",(g)=>{
  if(g.rev)return;
  if(Math.random()<.03){const keys=["u","i","o","j","k"];aiPress(keys[Math.floor(Math.random()*5)]);}
});

register("breakoutGame",(g)=>{
  if(!g||!g.pl)return;
  const p=g.pl[1],b=p.ball;
  if(!b)return;
  if(b.x<p.x-10)aiPress("arrowleft");
  if(b.x>p.x+10)aiPress("arrowright");
});

register("slimeGame",(g)=>{
  if(!g||!g.pl||!g.ball)return;
  const me=g.pl[1],b=g.ball;
  if(b.x>me.x+10)aiPress("arrowright");
  if(b.x<me.x-10)aiPress("arrowleft");
  if(b.x>me.x-40&&b.x<me.x+40&&b.y>me.y-160&&b.y<me.y-60&&me.grounded)aiPress("arrowup");
});

register("colorswitchGame",(g)=>{
  if(!g||!g.pl)return;
  const p=g.pl[1];
  if(!p.alive||p.vy!==0)return;
  if(Math.random()<.2)aiPress("enter");
});

register("warlordsGame",(g)=>{
  if(!g||!g.pl||!g.balls.length)return;
  const p=g.pl[1];
  const b=g.balls[0];
  if(!b)return;
  if(b.x>p.shield-30&&b.vx>0&&Math.random()<.6)aiPress("arrowright");
  if(b.x<p.shield-30&&b.vx<0&&Math.random()<.6)aiPress("arrowleft");
});

register("zombieGame",(g)=>{
  if(!g||!g.pl)return;
  const me=g.pl[1];
  let near=null,nd=Infinity;
  for(const z of g.zombies){const d=Math.hypot(z.x-me.x,z.y-me.y);if(d<nd){nd=d;near=z;}}
  if(!near)return;
  if(near.x<me.x-20)aiPress("arrowleft");
  if(near.x>me.x+20)aiPress("arrowright");
  if(near.y<me.y-20)aiPress("arrowup");
  if(near.y>me.y+20)aiPress("arrowdown");
  if(nd<200)aiPress("enter");
});

register("chainbombGame",(g)=>{
  if(!g||!g.cursor)return;
  if(g.bombs.length>0&&Math.random()<.15){aiPress("enter");return;}
  const dx=(Math.random()-.5)*280,dy=(Math.random()-.5)*280;
  if(dx>20)aiPress("arrowright");else if(dx<-20)aiPress("arrowleft");
  if(dy>20)aiPress("arrowdown");else if(dy<-20)aiPress("arrowup");
});

register("joustGame2",(g)=>{
  if(!g||!g.pl)return;
  const me=g.pl[1],you=g.pl[0];
  if(!me.alive)return;
  if(you.x<me.x-10)aiPress("arrowleft");
  if(you.x>me.x+10)aiPress("arrowright");
  if(me.y>you.y-20&&me.y>100&&Math.random()<.3)aiPress("arrowup");
});

register("iceclimberGame",()=>{
  if(Math.random()<.3)aiPress("arrowup");
  if(Math.random()<.15)aiPress("arrowleft");
  if(Math.random()<.15)aiPress("arrowright");
});

register("duckgooseGame",(g)=>{
  if(!g||!g.pl)return;
  const me=g.pl[1],you=g.pl[0];
  if(me.isGoose){
    if(you.x<me.x-10)aiPress("arrowleft");
    if(you.x>me.x+10)aiPress("arrowright");
    if(you.y<me.y-10)aiPress("arrowup");
    if(you.y>me.y+10)aiPress("arrowdown");
  }else{
    if(you.x<me.x+10)aiPress("arrowright");
    if(you.x>me.x-10)aiPress("arrowleft");
  }
});

register("tankbattleGame",(g)=>{
  if(!g||!g.pl)return;
  const me=g.pl[1],you=g.pl[0];
  if(!me.alive)return;
  const targetAng=Math.atan2(you.y-me.y,you.x-me.x);
  const diff=Math.atan2(Math.sin(targetAng-me.a),Math.cos(targetAng-me.a));
  if(diff>0.1)aiPress("arrowright");
  if(diff<-0.1)aiPress("arrowleft");
  if(Math.random()<.05)aiPress("enter");
});

})();