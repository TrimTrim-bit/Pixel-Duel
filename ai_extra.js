/* =====================================================
   AI EXTRA — key-merge fix + many hooks
===================================================== */
(function(){
"use strict";
if(!window.PD||!window.PD.AI)return;
const {register}=window.PD.AI;
const KEY_MAP={};
window.PDX_AI_KEYS=window.PDX_AI_KEYS||KEY_MAP;

function aiPress(k){
  /* prefer the framework press — it dispatches REAL key events (verified:
     plain keys-object writes don't reach script.js games' fresh snapshot) */
  if(typeof window.aiPress==="function"){window.aiPress(k);}
  if(typeof keys==="undefined")return;
  keys[k]=true;
  setTimeout(()=>{keys[k]=false;},80);
}

register("pong",(g)=>{
  if(!g||!g.p2||!g.ball)return;
  const me=g.p2,p=g.ball;
  const ty=me.y+me.height/2;
  if(p.y<ty-10)aiPress("arrowup");
  if(p.y>ty+10)aiPress("arrowdown");
});
register("breadGame",(g)=>{
  if(!g||!g.p2)return;
  const me=g.p2;
  // stay mid-arena when not carrying; move toward opponent to body-check
  if(me.x>820)aiPress("arrowleft");else if(me.x<80)aiPress("arrowright");
});
register("sumoGame",(g)=>{
  if(!g||!g.p2||!g.p1)return;
  if(g.p1.x>g.p2.x)aiPress("arrowright");else aiPress("arrowleft");
});
register("hockeyGame",(g)=>{
  if(!g||!g.p2||!g.puck)return;
  const me=g.p2,p=g.puck;
  if(p.x>450){
    if(p.y<me.y-15)aiPress("arrowup");
    if(p.y>me.y+15)aiPress("arrowdown");
  }
});
register("dodgeGame",(g)=>{
  if(!g||!g.p1||!g.p2)return;
  const me=g.p2,them=g.p1;
  const diff=window.PDX_AI&&window.PDX_AI.difficulty||"normal";
  // 1. DODGE: predictive dodge of any incoming ball
  for(const b of g.balls||[]){
    if(b.owner!=="p1")continue;
    const dx=me.x-b.x,dy=me.y-b.y;
    const d=Math.hypot(dx,dy)||1;
    const closing=b.vx>0&&b.x<me.x;
    if(!closing||d>300)continue;
    const tti=d/Math.max(1,Math.abs(b.vx));
    if(tti>1.2)continue;
    // dodge perpendicular or jump
    if(me.grounded&&tti<0.5)aiPress("arrowup");
    else if(dx>0&&Math.abs(dy)>Math.abs(dx))aiPress("arrowright");
    else if(dx<0)aiPress("arrowleft");
    else if(dy>0)aiPress("arrowup");
    return;
  }
  // 2. ATTACK: get in range and throw at P1
  const d=Math.hypot(them.x-me.x,them.y-me.y);
  if(d>420){
    // close the gap
    if(them.x<me.x-20)aiPress("arrowleft");else if(them.x>me.x+20)aiPress("arrowright");
    if(them.y<me.y-40&&me.grounded)aiPress("arrowup");
    else if(them.y>me.y+40&&me.grounded)aiPress("arrowup");
  } else {
    // in range: throw on cooldown
    if(Math.random()<(diff==="hard"?0.5:diff==="easy"?0.12:0.25))aiPress("enter");
    // also reposition to keep them at the edge of our throw range
    if(d<120){ if(them.x<me.x)aiPress("arrowright");else aiPress("arrowleft"); }
  }
});
register("snakeGame",(g)=>{
  if(!g||!g.p2)return;
  if(g.p2.x<100)aiPress("arrowright");
  else if(g.p2.x>800)aiPress("arrowleft");
  else if(g.p2.y<80)aiPress("arrowdown");
  else if(g.p2.y>460)aiPress("arrowup");
});
register("basketGame",(g)=>{
  if(!g||!g.p2||!g.ball)return;
  const me=g.p2,b=g.ball;
  if(!b.held){if(b.x>me.x)aiPress("arrowright");if(b.x<me.x)aiPress("arrowleft");}
  if(b.held==="p2"&&Math.random()<.05)aiPress("enter");
});
register("volleyGame",(g)=>{
  if(!g||!g.p2||!g.ball)return;
  const me=g.p2,b=g.ball;
  if(b.x>me.x)aiPress("arrowright");
  if(b.x<me.x)aiPress("arrowleft");
  if(Math.hypot(b.x-me.x,b.y-me.y)<40)aiPress("arrowup");
});
register("raceGame",(g)=>{
  if(!g||!g.pl)return;
  const me=g.pl[1];
  // keep moving forward — steady press, not mash
  if(!me||me.x===undefined||me.x<800)aiPress("arrowup");
});
register("platformGame",(g)=>{
  if(!g||!g.p2)return;
  const me=g.p2,them=g.p1;
  // chase opponent, jump when grounded and close
  if(!them)return;
  if(them.x>me.x+20)aiPress("arrowright");else if(them.x<me.x-20)aiPress("arrowleft");
  if(me.grounded&&Math.abs(them.x-me.x)<200&&Math.random()<0.6)aiPress("arrowup");
});
register("bombGame",(g)=>{
  if(!g||!g.p2||!g.bomb)return;
  const me=g.p2,b=g.bomb;
  // dodge the bomb if it's headed for me, else reposition and throw at P1
  const dbx=b.x-(me.x+15),dby=b.y-me.y;
  const dist=Math.hypot(dbx,dby);
  const incoming=(b.vx<0&&b.x>me.x)||(b.vx>0&&b.x<me.x);
  if(b.active&&incoming&&dist<200){
    if(me.grounded)aiPress("arrowup");else if(dbx>0)aiPress("arrowleft");else aiPress("arrowright");
    return;
  }
  const them=g.p1;
  if(them){
    if(them.x<me.x-60)aiPress("arrowleft");else if(them.x>me.x+60)aiPress("arrowright");
    else if(Math.random()<(window.PDX_AI&&window.PDX_AI.difficulty==="hard"?0.35:0.12))aiPress("enter");
    if(them.y<me.y-40&&me.grounded&&Math.random()<0.5)aiPress("arrowup");
  }
});
register("tankGame",(g)=>{
  if(!g||!g.tanks)return;
  const me=g.tanks[1],them=g.tanks[0];
  if(!me||!them||!me.alive)return;
  const target=Math.atan2(them.y-me.y,them.x-me.x);
  let diff=target-me.a;while(diff>Math.PI)diff-=Math.PI*2;while(diff<-Math.PI)diff+=Math.PI*2;
  if(diff>0.06)aiPress("arrowright");else if(diff<-0.06)aiPress("arrowleft");
  const dist=Math.hypot(them.x-me.x,them.y-me.y);
  if(Math.abs(diff)<0.2&&Math.random()<(window.PDX_AI&&window.PDX_AI.difficulty==="hard"?0.4:0.18))aiPress("enter");
  if(dist>260)aiPress("arrowup");
});
register("spaceGame",(g)=>{
  if(!g||!g.ships||!g.ships[1])return;
  const me=g.ships[1],them=g.ships[0];
  if(!me||!them||!me.alive)return;
  let dx=them.x-me.x,dy=them.y-me.y;
  const dist=Math.hypot(dx,dy);
  const target=Math.atan2(dy,dx);
  let diff=target-me.a;
  while(diff>Math.PI)diff-=Math.PI*2;
  while(diff<-Math.PI)diff+=Math.PI*2;
  const turn=diff*0.9;
  if(turn>0.05)aiPress("arrowright");
  else if(turn<-0.05)aiPress("arrowleft");
  if(Math.abs(diff)<0.6&&dist>60)aiPress("arrowup");
  if(Math.abs(diff)<0.35&&dist<420&&Math.random()<.12)aiPress("enter");
});

})();

/* =====================================================
   TURN-BASED / DOM GAMES — real P2 AI
   These games don't run through PD.micro or keyboard keys,
   so we drive their state directly. Loaded after script.js.
===================================================== */
(function(){
"use strict";

/* script.js declares its game state with top-level `let`, which does NOT
   create window properties. Use an indirect eval to read them. */
function GS(name){
  try{return (new Function("return "+name))();}catch(e){return undefined;}
}

function modeAllowsP2(){
  const m=window.PDX_AI&&window.PDX_AI.mode;
  return m==="p2_ai"||m==="both_ai";
}

/* ---------- GRID DUEL (tic-tac-toe) — minimax ---------- */
function tttWinner(b){
  const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const [a,c,d] of L) if(b[a]&&b[a]===b[c]&&b[a]===b[d]) return b[a];
  return b.every(Boolean)?"draw":null;
}
function tttBest(b,player){
  const other=player==="X"?"O":"X";
  let best=null,bestScore=-Infinity;
  for(let i=0;i<9;i++){
    if(b[i])continue;
    b[i]=player;
    const w=tttWinner(b);
    let s;
    if(w===player)s=10;
    else if(w==="draw")s=0;
    else if(w===other)s=-10;
    else s=tttBest(b,other).score;
    b[i]="";
    const depthPenalty=-Math.sign(s)*0.1;
    if(s+depthPenalty>bestScore){bestScore=s+depthPenalty;best=i;}
  }
  return {move:best,score:bestScore};
}

let tttThinking=false;
function tttAI(){
  const board=GS("tttCells"), over=GS("tttOver");
  if(!board||over||tttThinking)return;
  if(GS("tttTurn")!=="O")return;
  if(!modeAllowsP2())return;
  tttThinking=true;
  setTimeout(()=>{
    tttThinking=false;
    if(GS("tttOver")||GS("tttTurn")!=="O")return;
    const empty=board.filter(c=>!c).length;
    // easy-ish: 15% chance of a random move so it's beatable
    let move;
    if(window.PDX_AI.difficulty==="easy"||Math.random()<.15){
      const opts=[];
      for(let i=0;i<9;i++)if(!board[i])opts.push(i);
      move=opts[Math.floor(Math.random()*opts.length)];
    }else{
      move=tttBest(board.slice(),"O").move;
    }
    if(move!=null&&typeof window.playTTT==="function")window.playTTT(move);
  },350+Math.random()*400);
}

/* ---------- FOUR IN A ROW — win/block/center heuristic ---------- */
let connectThinking=false;
function connectAI(){
  const grid=GS("connectGrid"), over=GS("connectOver");
  if(!grid||over||connectThinking)return;
  if(GS("connectTurn")!=="yellow")return;
  if(!modeAllowsP2())return;
  connectThinking=true;
  setTimeout(()=>{
    connectThinking=false;
    if(GS("connectOver")||GS("connectTurn")!=="yellow")return;
    const cols=[];
    for(let c=0;c<7;c++){
      let r=-1;
      for(let rr=5;rr>=0;rr--){if(!grid[rr][c]){r=rr;break;}}
      if(r!==-1)cols.push(c);
    }
    if(!cols.length)return;
    const tryCol=(color)=>{
      for(const c of cols){
        let r=-1;
        for(let rr=5;rr>=0;rr--){if(!grid[rr][c]){r=rr;break;}}
        grid[r][c]=color;
        let win=false;
        const dirs=[[1,0],[0,1],[1,1],[1,-1]];
        for(const [dr,dc] of dirs){
          let n=1;
          for(const s of [-1,1]){
            let rr=r+dr*s,cc=c+dc*s;
            while(rr>=0&&rr<6&&cc>=0&&cc<7&&grid[rr][cc]===color){n++;rr+=dr*s;cc+=dc*s;}
          }
          if(n>=4){win=true;break;}
        }
        grid[r][c]="";
        if(win)return c;
      }
      return null;
    };
    // 1. win now  2. block their win  3. center  4. random
    let col=tryCol("yellow");
    if(col===null)col=tryCol("red");
    if(col===null)col=cols.includes(3)?3:cols[Math.floor(Math.random()*cols.length)];
    if(typeof window.dropConnectPiece==="function")window.dropConnectPiece(col);
  },400+Math.random()*400);
}

/* ---------- WESTERN DUEL — AI reacts to the READY signal ---------- */
let duelArmed=false;
function duelAI(){
  if(!modeAllowsP2())return;
  const over=document.getElementById("duelMsg").textContent.includes("WINS");
  if(over){duelArmed=false;return;}
  if(GS("duel")&&GS("duel").ready){
    if(!duelArmed){
      duelArmed=true;
      const diff=window.PDX_AI.difficulty;
      const delay=diff==="easy"?450+Math.random()*400:
                  diff==="hard"?150+Math.random()*120:
                  260+Math.random()*220;
      setTimeout(()=>{
        if(GS("duel")&&GS("duel").ready&&!over)duelKey("l");
      },delay);
    }
  }else{duelArmed=false;}
}

/* ---------- TUG OF WAR — hammer P2's key ("l"), not P1's ---------- */
let tugNext=0;
function tugAI(now){
  if(!modeAllowsP2())return;
  const tugState=GS("tug");
  if(!tugState||!tugState.active)return;
  const diff=window.PDX_AI.difficulty;
  const interval=diff==="easy"?240:diff==="hard"?90:150;
  if(now>tugNext){tugNext=now+interval;handleTugKey("l");}
}

/* ---------- MEMORY MATCH — remember seen cards, pick pairs ---------- */
let memKnown={};      // idx -> symbol
let memBusy=false;
function memAI(){
  if(!modeAllowsP2())return;
  const m=GS("mem");
  if(!m||!m.active||m.lock||memBusy)return;
  if(m.turn!=="p2")return;
  // learn from face-up cards
  for(const i of m.flipped)memKnown[i]=m.cards[i];
  for(const i of m.matched)delete memKnown[i];
  // find a known pair among unrevealed cards
  let pair=null;
  const seen=Object.keys(memKnown).map(Number);
  outer: for(let a=0;a<seen.length;a++){
    for(let b=a+1;b<seen.length;b++){
      if(memKnown[seen[a]]===memKnown[seen[b]]){pair=[seen[a],seen[b]];break outer;}
    }
  }
  const hidden=[];
  for(let i=0;i<16;i++)if(!mIsFlippedSafe(i))hidden.push(i);
  memBusy=true;
  const diff=window.PDX_AI.difficulty;
  const step=diff==="easy"?900:diff==="hard"?380:600;
  const flip=(idx)=>{
    if(!GS("mem").active||GS("mem").turn!=="p2"||GS("mem").lock)return;
    flipCard(idx);
  };
  setTimeout(()=>{
    if(pair){flip(pair[0]);
      setTimeout(()=>{flip(pair[1]);memBusy=false;},step);
    }else{
      // remember what we reveal
      const i1=hidden.length?hidden[Math.floor(Math.random()*hidden.length)]:null;
      if(i1==null){memBusy=false;return;}
      flip(i1);
      setTimeout(()=>{
        const m2=GS("mem");
        if(m2&&m2.flipped.length===1){
          memKnown[i1]=m2.cards[i1];
          const rem=hidden.filter(x=>x!==i1);
          let pick=null;
          for(const x of rem){if(memKnown[x]===memKnown[i1]){pick=x;break;}}
          if(pick==null)pick=rem.length?rem[Math.floor(Math.random()*rem.length)]:null;
          if(pick!=null){memKnown[pick]=m2.cards[pick];flip(pick);}
        }
        setTimeout(()=>{memBusy=false;},step);
      },step);
    }
  },step*0.6);
}
function mIsFlippedSafe(i){
  const m2=GS("mem");
  return m2.flipped.includes(i)||m2.matched.includes(i);
}

/* ---------- REACTION DUEL — AI presses when GO appears ---------- */
let reactArmed=false;
function reactAI(){
  if(!modeAllowsP2())return;
  const r=GS("react");
  if(!r||!r.active){reactArmed=false;return;}
  if(r.ready){
    if(!reactArmed){
      reactArmed=true;
      const diff=window.PDX_AI.difficulty;
      const delay=diff==="easy"?420+Math.random()*300:
                  diff==="hard"?140+Math.random()*90:
                  240+Math.random()*160;
      setTimeout(()=>{if(GS("react")&&GS("react").ready)reactKey("l");},delay);
    }
  }else{reactArmed=false;}
}

/* main tick for all DOM-game AIs */
(function domAILoop(){
  try{
    const active=typeof activeScreen!=="undefined"?activeScreen:window.activeScreen;
    if(active){
      if(active==="ttt")tttAI();
      else if(active==="connectGame")connectAI();
      else if(active==="duelGame")duelAI();
      else if(active==="memGame")memAI();
    }
    tugAI(performance.now());
    reactAI();
    /* P1-side AI in both_ai mode — core script games */
    p1AI(performance.now());
  }catch(e){}
  requestAnimationFrame(domAILoop);
})();

/* =====================================================
   P1 AI (both_ai mode) — core script games use fixed
   P1 keys (W/S/A/D/Space), so drive them via aiPress.
   ===================================================== */
let p1PongNext=0,p1TugNext=0;
function p1AI(now){
  if(!window.PDX_AI||window.PDX_AI.mode!=="both_ai")return;
  try{
    const active=typeof activeScreen!=="undefined"?activeScreen:window.activeScreen;
    /* PONG: track ball with W/S */
    if(active==="pong"){
      const p=GS("pong");
      if(p&&p.running&&p.ball){
        const me=p.p1,ty=me.y+me.height/2;
        if(now>p1PongNext){
          p1PongNext=now+60;
          if(Math.abs(p.ball.y-ty)>12){
            if(p.ball.y<ty)aiPress("w");else aiPress("s");
          }
        }
      }
    }
    /* TUG OF WAR: hammer 'a' */
    else if(active==="tugGame"){
      const t=GS("tug");
      if(t&&t.active&&now>p1TugNext){
        p1TugNext=now+(window.PDX_AI.difficulty==="hard"?110:170);
        aiPress("a");
      }
    }
    /* DUEL / REACTION: press 'a' on ready */
    else if(active==="duelGame"){
      const d=GS("duel");
      if(d&&d.ready)aiPress("a");
    }else if(active==="reactGame"){
      const r=GS("react");
      if(r&&r.ready)aiPress("a");
    }
  }catch(e){}
}

})();