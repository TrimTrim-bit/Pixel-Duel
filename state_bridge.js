/* =====================================================
   STATE BRIDGE — exposes each micro game's `g` object
   so ai.js can read it. Loads after engine.js so that
   PD.micro exists, wraps it once, and captures every
   game's state into window.PDX_GAME_STATE[id].
===================================================== */
(function(){
"use strict";
window.PDX_GAME_STATE=window.PDX_GAME_STATE||{};

/* ---------- bridge 1: micro games (engine.js PD.micro) ---------- */
if(window.PD&&window.PD.micro){
  const _micro=window.PD.micro;
  window.PD.micro=function(def){
    const originalUpdate=def.update;
    def.update=function(g,dt){
      window.PDX_GAME_STATE[def.id]=g;
      // run the universal AI's decision FIRST so the game sees AI input
      // in the same frame (hook installed by ai_universal2.js)
      if(typeof window.PDX_AI_PRE_UPDATE==="function"){
        try{window.PDX_AI_PRE_UPDATE(def.id,g,dt);}catch(e){}
      }
      return originalUpdate.apply(this,arguments);
    };
    return _micro(def);
  };
}else{
  console.warn("state_bridge: PD.micro not available yet, AI state capture skipped.");
}

/* ---------- bridge 2: core games in script.js ----------
   Their state lives in top-level let/const bindings that are not on
   window. We reach them through an indirect eval bridge and publish. */
const CORE_IDS=["pong","duel","tug","bread","hockey","bomb","dodge","sumo","snake","basket","volley","mem","react","race","platformGame","tankGame","spaceGame","potatoGame"];

function publishCore(){
  let count=0;
  /* publish into HOLD slots so consumers never see the published id vanish:
     hold[k] keeps the most recent object per game, so stale/null windows from
     one game closing + a new one opening never produce a missing publish. */
  window.PDX_GAME_HOLD=window.PDX_GAME_HOLD||{};
  const viaEval=["pong","duel","tug","bread","hockey","bomb","dodge","sumo","snake","basket","volley","mem","react","race","platformGame"];
  for(const id of viaEval){
    try{
      const v=(new Function("return typeof "+id+"!=='undefined'?"+id+":undefined"))();
      if(v&&typeof v==="object"){
        if(window.PDX_GAME_STATE[id]!==v){
          window.PDX_GAME_HOLD[id]=window.PDX_GAME_STATE[id];
          window.PDX_GAME_STATE[id]=v;
        }
        count++;
      }
    }catch(e){}
  }
  /* extras.js games (tank/space/potato) publish their state objects on window */
  const mapped={__PDX_TANK_STATE:"tankGame",__PDX_SPACE_STATE:"spaceGame",__PDX_POTATO_STATE:"potatoGame"};
  for(const [wkey,id] of Object.entries(mapped)){
    try{
      const v=window[wkey];
      if(v&&typeof v==="object"&&!window.PDX_GAME_STATE[id]){
        window.PDX_GAME_STATE[id]=v;
        count++;
      }
    }catch(e){}
  }
  return count;
}
publishCore();
let coreRetries=0;
const coreTimer=setInterval(()=>{
  if(publishCore()>=CORE_IDS.length||++coreRetries>40)clearInterval(coreTimer);
},250);
window.PDX_BRIDGE_RETRY=publishCore;
})();