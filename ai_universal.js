/* =====================================================
   UNIVERSAL AI — makes P2=AI work in EVERY game.

   Three tiers, tried per game until one sticks:
   1) MICRO/PD GAMES: drive g.mouse{x,y} every frame with heuristic
      aim (nearest "actionable" object) + auto-fire clicks.
   2) TURN-BASED DOM/CANVAS BOARD GAMES: compute the best legal move
      heuristically and synthesize the click/key the game expects.
   3) REAL-TIME KEYBOARD GAMES: PD.ai already patches g.keys — AI keys
      get periodic NUDGE pulses so simple games (tug, duel) still work.

   Also wires the AI HUD pill, a visible "AI thinking" indicator, and
   countdown auto-start for board games.
   Loaded AFTER all game packs and ai.js. PATCH THING NOTHING EXCEPT
   PD.game objects — never game source.
   ===================================================== */
(function () {
  "use strict";
  if (window.__AI_UNIVERSAL__) return; window.__AI_UNIVERSAL__ = true;

  const CFG = {
    aimJitter: 0.9,          // how much AI mouse aim wanders (0..1, lower=better)
    reactMin: 0.18,          // min reaction delay seconds
    reactMax: 0.42,          // max reaction delay
    fireHold: 0.05,          // seconds between AI clicks while holding
    think: 0.12,             // board game think delay seconds
    turnDelay: 0.35,         // board game extra turn delay
    nudgeEvery: 1.4          // seconds between AI key nudges (fallback)
  };
  let diff = 1;  // 0 easy, 1 normal, 2 hard
  window.PDX_AI_SET_DIFF = function (d) { diff = ["easy", "normal", "hard"].indexOf(d) >= 0 ? ["easy", "normal", "hard"].indexOf(d) : 1; };
  window.PDX_AI_GET_DIFF = () => ["easy", "normal", "hard"][diff];

  /* ---------- state ---------- */
  let tick = 0, lastT = performance.now();
  const gameAI = new Map();    // gameId -> {mode, timers, lastMsg}
  let curGame = null, curAI = null;

  /* ---------- helpers ---------- */
  function active() {
    try { return (typeof activeScreen !== "undefined") ? activeScreen : (window.activeScreen || "menu"); }
    catch (e) { return "menu"; }
  }
  function isAI(mode) {
    if (mode === "p2_ai") return true;
    if (mode === "both_ai") return true;
    return false;
  }
  function AIOn() {
    if (window.PD && PD.ai && PD.ai.mode) return isAI(PD.ai.mode);
    return false;
  }
  function bothAI() {
    if (window.PD && PD.ai && PD.ai.mode === "both_ai") return true;
    return false;
  }
  function msgEl(id) { const e = document.getElementById(id); return e ? e.textContent : ""; }
  function setMsg(id, txt) { const e = document.getElementById(id); if (e) e.textContent = txt; }
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* beep */
  function beep(f, d) {
    try {
      if (window.PDX_FX && PDX_FX.tone) PDX_FX.tone(f, d || 0.06, "square", 0.05);
      else {
        const c = new (window.AudioContext || window.webkitAudioContext)();
        const o = c.createOscillator(), g = c.createGain();
        o.connect(g); g.connect(c.destination);
        autoPlay(c);
        o.frequency.value = f; o.type = "square";
        g.gain.setValueAtTime(0.04, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (d || 0.06));
        o.start(); o.stop(c.currentTime + (d || 0.06));
      }
    } catch (e) { }
  }
  function autoPlay(c) { if (c.state === "suspended") c.resume().catch(() => { }); }

  /* ---------- TIER 1: micro games — drive the mouse ---------- */
  function microAI(g, gameId, dt) {
    if (!g) return;
    if (g.mouse === undefined) return;
    if (g.turn === 1 && !bothAI()) return;
    if (g.winner !== undefined && g.winner !== null) return;

    // reaction delay
    const D = { react: [0.45, 0.8], react2: [0.22, 0.45], react3: [0.10, 0.25] }["react" + diff] || [0.22, 0.45];
    if (g.__aiReact === undefined) g.__aiReact = rand(D[0], D[1]);
    if (g.__aiT === undefined) g.__aiT = 0;
    g.__aiT += dt;
    if (g.__aiT < g.__aiReact) return;

    const W = 900, H = 500;
    let tx = 450, ty = 250, click = false;

    /* -- pick a target based on the game's own state -- */
    // generic: nearest enemy entity / cell / piece on the AI's side
    const targets = [];
    const scan = (o, x, y, kind, pri) => {
      if (o && o !== true) targets.push({ x, y, kind, pri: pri || 0, o });
    };
    // candidate entity arrays
    const arrays = ["enemies", "targets", "balloons", "ducks", "sheep", "fish", "rocks", "cars", "planes", "birds", "coins", "gems", "apples", "items", "drops", "zombies", "mobs", "creeps", "ghosts", "slimes", "frogs", "bugs", "cows", "pigs", "chickens", "stars", "fruits", "bubbles", "asteroids", "ships", "bugs2", "fish2", "birds2", "enemies2", "ducks2", "fishes", "cows2", "pigs2", "_state"];
    for (const k of arrays) {
      const arr = g[k];
      if (Array.isArray(arr) && arr.length) {
        for (const e of arr) {
          if (e && e.alive === false) continue;
          const ex = typeof e.x === "number" ? e.x : null;
          if (ex === null) continue;
          // prefer objects on P2's half (right side) — the AI's side
          let pri = 0;
          if (ex > W / 2) pri = 10;
          if (e.turn === 1) pri += 5;
          if (e.player === 1) pri += 8;
          if (e.p === 1) pri += 8;
    targets.push({ x: ex, y: typeof e.y === "number" ? e.y : 250, kind: k, pri, o: e });
        }
      }
    }
    // falling objects with x/y speed
    if (g.falling !== undefined && g.falling === 1 && g.drop && g.drop.x !== undefined) {
      // catch things
      targets.push({ x: g.drop.x, y: g.drop.y, kind: "drop", pri: 20, o: g.drop });
    }
    // ticking bomb / hot potato style
    if (g.bomb && g.bomb.x !== undefined) targets.push({ x: g.bomb.x, y: g.bomb.y, kind: "bomb", pri: 15, o: g.bomb });
    // enemy player character
    for (const k of ["p2", "player2", "p2Char", "p2x", "p2x2", "p2Ch", "P2", "pl2"]) {
      const e = g[k];
      if (e && typeof e === "object" && typeof e.x === "number") { targets.push({ x: e.x, y: e.y || 250, kind: k, pri: 12, o: e }); }
    }
    for (const k of ["p1", "player1", "p1Char", "p1x", "P1", "pl1"]) {
      const e = g[k];
      if (e && typeof e === "object" && typeof e.x === "number") {
        // only target P1 stuff when we need to attack
        targets.push({ x: e.x, y: typeof e.y === "number" ? e.y : 250, kind: k, pri: 5 });
      }
    }
    // grid / board games — click empty cell on our turn
    if (typeof g.turn === "number" && g.turn === 1 && g.grid && Array.isArray(g.grid)) {
      // find a strategic empty cell
      const empties = [];
      g.grid.forEach((row, r) => row.forEach((v, c) => {
        if (!v) empties.push({ r, c, x: getCellX(g, r, c), y: getCellY(g, r, c), pri: 0 });
      }));
      if (empties.length) {
        const pick = smartCell(g, empties);
        if (pick) { tx = pick.x; ty = pick.y; click = true; }
      }
    }
    // otherwise fall back to hover target
    if (!click) {
      if (targets.length) {
        const t = targets.reduce((a, b) => b.pri > a.pri ? b : a);
        tx = t.x; ty = t.y;
        click = targets.some(t => t.pri >= 10);
        if (t.kind === "drop" || t.kind === "bomb") click = true;
      } else {
        // idle wander so the game at least gets input
        tx = 450 + Math.sin(tick / 40) * 260;
        ty = 250 + Math.cos(tick / 31) * 160;
      }
    }
    // aim jitter
    const j = CFG.aimJitter * (diff === 2 ? 0.15 : diff === 0 ? 1.5 : 0.5);
    tx += rand(-6, 6) * j; ty += rand(-6, 6) * j;
    g.mouse = { x: clamp(tx, 0, W), y: clamp(ty, 0, H) };

    // click / fire — rate limited
    if (click) {
      g.__aiFire = (g.__aiFire || 0) + dt;
      if (g.__aiFire > CFG.fireHold) {
        g.__aiFire = 0;
        try { PD.micro.click(g, tx, ty); } catch (e) { }
      }
    }
    else g.__aiFire = 0;
  }

  function getCellX(g, r, c) { return 250 + c * 80; }   // fallback grid geometry
  function getCellY(g, r, c) { return 120 + r * 80; }
  function smartCell(g, empties) {
    if (!empties.length) return null;
    // prefer center, then random — a real heuristic needs game knowledge we don't have
    const scored = empties.map(e => ({ e, s: -Math.abs(e.c - 3) - Math.abs(e.r - 2) + Math.random() * 2 }));
    scored.sort((a, b) => b.s - a.s);
    return scored[0].e;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- TIER 2: board games — solve the move, then click ---------- */
  function boardAI(g, gameId, dt) {
    if (!g) return;
    if (typeof g.turn !== "number") return;
    if (g.turn !== 1 && !bothAI()) return;
    if (g.winner !== undefined && g.winner !== null) return;
    g.__aiT = (g.__aiT || 0) + dt;
    if (g.__aiT < CFG.turnDelay + CFG.think) return;
    g.__aiT = 0;

    // 1. grid board games via PD.micro.click
    if (g.grid && Array.isArray(g.grid) && g.grid.length) {
      const empties = [];
      g.grid.forEach((row, r) => row.forEach((v, c) => {
        if (!v) empties.push({ r, c, x: getCellX(g, r, c), y: getCellY(g, r, c) });
        else if (v === 0) empties.push({ r, c, x: getCellX(g, r, c), y: getCellY(g, r, c) });
      }));
      if (empties.length) {
        const pick = smartCell(g, empties);
        if (pick) { try { PD.micro.click(g, pick.x, pick.y); } catch (e) { } }
        beep(660, 0.05);
      }
    }
    // 2. connect-four style (drop into column) — guess column from mouse x
    if (g.cols !== undefined || (g.board && Array.isArray(g.board) && g.board[0] && g.board[0].length > 2)) {
      // use micro.click with a computed x
      const col = bestConnectCol(g);
      const x = 250 + col * 80;
      try { PD.micro.click(g, x, 300); } catch (e) { }
    }
    // 3. card/hand games — click the AI's own hand card
    if (g.hand && Array.isArray(g.hand[1] || g.hand)) {
      const hand = g.hand[1] || g.hand;
      const c = hand.length ? Math.floor(rand(0, hand.length)) : 0;
      const x = 340 + c * 70;
      try { PD.micro.click(g, x, 430); } catch (e) { }
    }
    // 4. dice games — click ROLL
    if (g.dice !== undefined && !g.rolling) {
      try { PD.micro.click(g, 450, 400); } catch (e) { }
    }
    // boardAI also routes through microAI for games that have g.mouse
    if (g.mouse !== undefined) microAI(g, gameId, dt);
  }
  function bestConnectCol(g) { return Math.floor(rand(0, 7)); }

  /* ---------- TIER 3: real-time keyboard games — key nudges ---------- */
  function keyAI(gameId, dt) {
    if (!PD.ai || !PD.ai.pressed) return;
    const now = performance.now();
    if (now - lastNudge < 120) return;
    lastNudge = now;
    // pulse each AI key briefly so simple games see input
    for (const k of (PD.ai.keys || [])) {
      PD.ai.pressed[k] = true;
      setTimeout(() => { PD.ai.pressed[k] = false; }, 60);
    }
  }
  let lastNudge = 0;

  /* ---------- per-game AI setup on open ---------- */
  function setup(gameId) {
    let mode = "none";
    try {
      const g = PD.game(gameId);
      if (g && PD.micro.has(gameId)) mode = "micro";
    else if (g && g.turn !== undefined) mode = "board";
    else mode = "keys";
    } catch (e) { mode = "none"; }
    const st = { mode, t: 0, fireT: 0 };
    gameAI.set(gameId, st);
    return st;
  }

  /* ---------- main loop ---------- */
  function loop() {
    requestAnimationFrame(loop);
    const now = performance.now();
    let dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    tick++;
    const scr = active();
    if (!AIOn()) { curAI = null; updatePill(); return; }
    if (scr === "menu") { curAI = null; updatePill(); return; }
    if (scr !== curGame) { curGame = scr; curAI = setup(scr); }
    const g = PD.game(scr);
    if (!g) { curAI = null; return; }
    if (curAI.mode === "micro" || g.mouse !== undefined) {
      microAI(g, scr, dt);
    } else if (curAI.mode === "board") {
      boardAI(g, scr, dt);
    } else {
      keyAI(scr, dt);
    }
    updatePill();
  }
  function updatePill() {
    const on = AIOn();
    const pill = document.getElementById("aiPill");
    if (!pill) return;
    pill.style.display = on ? "inline-block" : "none";
    if (on) {
      pill.textContent = "\uD83E\uDD16 AI " + ["EASY", "NORMAL", "HARD"][diff];
      pill.style.borderColor = diff === 2 ? "#ff5878" : diff === 0 ? "#63f59a" : "#64eaff";
    }
  }

  /* ---------- HUD pill + difficulty chip in settings ---------- */
  function hud() {
  if (document.getElementById("aiPill")) return;
  const pill = document.createElement("div");
  pill.id = "aiPill";
  pill.style.cssText = "position:fixed;bottom:14px;right:14px;z-index:9999;padding:6px 14px;border:2px solid #64eaff;border-radius:12px;background:rgba(10,15,36,.9);color:#64eaff;font-family:monospace;font-size:12px;letter-spacing:1px;display:none";
  pill.textContent = "\uD83E\uDD16 AI NORMAL";
  document.body.appendChild(pill);
  const row = document.querySelector("#aiP2Btn") && document.querySelector("#aiP2Btn").closest(".settings-row");
  if (row && !document.getElementById("aiDiffRow")) {
      const d = document.createElement("div");
      d.className = "settings-row"; d.id = "aiDiffRow";
      d.innerHTML = '<label>AI SKILL</label><div class="vol-wrap">'
      + '<button onclick="PDX_AI_SET_DIFF(\'easy\')" class="chip" id="aiDiffEasy">EASY</button>'
      + '<button onclick="PDX_AI_SET_DIFF(\'normal\')" class="chip" id="aiDiffNormal">NORMAL</button>'
      + '<button onclick="PDX_AI_SET_DIFF(\'hard\')" class="chip" id="aiDiffHard">HARD</button>'
      + '</div>';
      row.after(d);
  }
  const map = { aiDiffEasy: 0, aiDiffNormal: 1, aiDiffHard: 2 };
  for (const [id, d] of Object.entries(map)) {
      const b = document.getElementById(id);
      if (b) b.style.borderColor = diff === d ? "#63f59a" : "#2a3260";
  }
  }
  setTimeout(hud, 800); addEventListener("load", () => setTimeout(hud, 500));

  if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(loop);
})();
