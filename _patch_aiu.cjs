/* patch_aiu.cjs — apply the FRESH_I hook fixes to ai_universal2.js on disk */
const fs = require("fs");
let t = fs.readFileSync("ai_universal2.js", "utf8");
let ok = true;
function sub(oldS, newS, tag) {
  if (!t.includes(oldS)) { console.log("MISS:", tag); ok = false; return; }
  t = t.replace(oldS, newS);
  console.log("ok:", tag);
}

/* 1. add bx to findSelf */
sub(
  `    if (g.f && g.f[1] && g.f[1].x !== undefined) return g.f[1];\n    return null;\n  }\n  /* find P1's entity (opponent) */`,
  `    if (g.f && g.f[1] && g.f[1].x !== undefined) return g.f[1];\n    if (g.bx && g.bx[1] && g.bx[1].x !== undefined) return g.bx[1];\n    return null;\n  }\n  /* find P1's entity (opponent) */`,
  "findSelf+bx");

/* 2. add bx to findOpp */
sub(
  `    if (g.me && g.me[0]) return g.me[0];\n    return null;\n  }\n  /* collect threat/target entities */`,
  `    if (g.me && g.me[0]) return g.me[0];\n    if (g.bx && g.bx[0] && g.bx[0].x !== undefined) return g.bx[0];\n    return null;\n  }\n  /* collect threat/target entities */`,
  "findOpp+bx");

/* 3. named idle fn */
sub(
  `  const NO_ENTITY = new Set(["poolGame", "warGame", "armwrestleGame", "balanceGame", "blackjackGame", "ghosthuntGame"]);\n  for (const nid of NO_ENTITY) STRAT[nid] = function () { return NI(); };  // idle: no dumb wandering`,
  `  const NO_ENTITY = new Set(["poolGame", "warGame", "armwrestleGame", "balanceGame", "blackjackGame", "ghosthuntGame"]);\n  function NO_ENTITY_IDLE() { return NI(); }   // idle: no dumb wandering\n  for (const nid of NO_ENTITY) STRAT[nid] = NO_ENTITY_IDLE;`,
  "no-entity-idle");

/* 4. add PDX_AI_FRESH_I in boot() */
sub(
  `  function boot() {\n    installBridge();`,
  `  function boot() {\n    installBridge();\n    // PRIMARY injection point: engine.js's readInputs() calls this right after\n    // building the fresh g.I array each frame — the ONLY reliable place, since\n    // readInputs replaces g.I wholesale every frame and any earlier write dies.\n    window.PDX_AI_FRESH_I = function (g) {\n      try {\n        if (!aiMode()) return;\n        if (!g.I || !Array.isArray(g.I) || g.I.length < 2) return;\n        const id = (typeof activeScreen !== "undefined") ? activeScreen : window.activeScreen;\n        if (!id || id === "menu") return;\n        const sid = id.replace(/Game$/, "");\n        const stratId = STRAT[id] ? id : (STRAT[sid] ? sid : null);\n        const hasStrat = !!stratId && STRAT[stratId] !== NO_ENTITY_IDLE;\n        if (!hasStrat && !findSelf(g)) return;\n        window.__FRESH_CALLS = (window.__FRESH_CALLS || {});\n        window.__FRESH_CALLS[id] = (window.__FRESH_CALLS[id] || 0) + 1;\n        const plan = stratId ? applyStrategy(stratId, g, 1 / 60) : null;\n        if (plan) {\n          g.I[1] = plan;\n          if (bothAI()) g.I[0] = decideAI1(g, stratId, 1 / 60);\n        } else if (findSelf(g)) {\n          g.I[1] = decide(g, id + "#p2", 1 / 60);\n          if (bothAI() && findOpp(g)) g.I[0] = decideAI1(g, id, 1 / 60);\n        }\n      } catch (e) { }\n    };`,
  "fresh-i-hook");

fs.writeFileSync("ai_universal2.js", t);
console.log(ok ? "ALL PATCHES APPLIED" : "SOME PATCHES MISSED");
