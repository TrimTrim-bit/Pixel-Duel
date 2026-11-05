/* =====================================================
   AI FIXES — precise hooks for games whose AI was doing
   nothing (bomb plant, fly catch, bread wars, air hockey)
   or playing badly. Loaded after ai_extra.js.
   ===================================================== */
(function () {
  "use strict";
  if (!window.PD || !window.PD.AI) return;
  const { register } = window.PD.AI;
  function aiPress(k) {
    if (typeof window.aiPress === "function") { window.aiPress(k); }
    keys[k] = true; setTimeout(() => { keys[k] = false; }, 80);
  }
  function held(k) {
    if (typeof window.aiPress === "function") { window.aiPress(k); }
    keys[k] = true;
  }
  function hard() { return window.PDX_AI && window.PDX_AI.difficulty === "hard"; }
  function easy() { return window.PDX_AI && window.PDX_AI.difficulty === "easy"; }

  /* ---------- BOMB PLANT (micro, pack R) ----------
     Roles swap each round. State: g.pl[2], g.attacker, g.sites, g.bombs.
     AI must: as ATTACKER walk to a site and press SPACE to plant;
     as DEFENDER walk to the planted bomb and HOLD SPACE to defuse. */
  register("bombplantGame", (g) => {
    if (!g || !g.pl) return;
    const me = g.pl[1], I = g.I[1];
    if (!me) return;
    const atk = g.attacker === 1;
    if (atk) {
      // go to nearest unoccupied site
      let site = null, bd = 1e9;
      for (const s of g.sites) {
        if (g.bombs.some(b => !b.defused && Math.hypot(b.x - s.x, b.y - s.y) < 50)) continue;
        const d = Math.hypot(me.x - s.x, me.y - s.y);
        if (d < bd) { bd = d; site = s; }
      }
      if (!site) return;
      if (Math.abs(site.x - me.x) > 24) I.l = site.x < me.x ? 1 : 0, I.r = site.x > me.x ? 1 : 0;
      else if (Math.abs(site.y - me.y) > 24) I.u = site.y < me.y ? 1 : 0, I.d = site.y > me.y ? 1 : 0;
      else if (bd < 60 && g.plantCd <= 0) { I.a = 1; I.pa = 1; }  // plant
    } else {
      // defender: stand at the bomb and hold defuse
      const bomb = g.bombs.find(b => !b.defused);
      if (!bomb) {/* patrol middle */ I.l = Math.sin(g.t) > 0 ? 1 : 0; I.r = I.l ? 0 : 1; return; }
      const d = Math.hypot(me.x - bomb.x, me.y - bomb.y);
      if (d > 26) { I.l = bomb.x < me.x ? 1 : 0; I.r = bomb.x > me.x ? 1 : 0; I.u = bomb.y < me.y ? 1 : 0; I.d = bomb.y > me.y ? 1 : 0; }
      else { I.a = 1; I.pa = 1; }  // defuse hold
    }
  });

  /* ---------- FLY CATCH (micro, pack G) ----------
     Real flyPos: {x: i*450+225+sin(t*f1+ph)*ax, y: 230+sin(t*f2+ph*1.7)*ay}.
     P2 frog base (675,455); tongue tip = base + (sin,-cos)*L.
     AI: pick best-value fly, aim tongue angle at predicted position, fire. */
  register("flyGame", (g) => {
    if (!g || !g.tg || !g.fl) return;
    const t = g.tg[1];
    if (!t || t.st !== "ready") return;
    const cx = 675, cy = 455;
    let best = null, bs = -1e9;
    for (let k = 0; k < g.fl.length; k++) {
      const f = g.fl[k];
      if (g.dead[1][k] > g.t) continue;
      const v = f.type === "gold" ? 30 : f.type === "wasp" ? -200 : 5;
      if (v < 0) continue;                       // never aim at wasps
      const p = flyPos2(g, f, 1);
      const d = Math.hypot(p.x - cx, p.y - cy);
      const s = v - d * 0.05;
      if (s > bs) { bs = s; best = { f }; }
    }
    if (!best) return;
    // predict fly position ~0.15s ahead (tongue travel time)
    const ft = g.t + 0.15, f = best.f;
    const px = 675 + Math.sin(ft * f.f1 + f.ph) * f.ax;
    const py = 230 + Math.sin(ft * f.f2 + f.ph * 1.7) * f.ay;
    const ang = Math.atan2(px - cx, cy - py);
    t.ang = ang;
    const dist = Math.hypot(px - cx, py - cy);
    if (dist < 430 && Math.random() < (hard() ? 0.5 : easy() ? 0.15 : 0.3)) {
      aiPress("enter");
    }
  });
  function flyPos2(g, f, i) { return { x: i * 450 + 225 + Math.sin(g.t * f.f1 + f.ph) * f.ax, y: 230 + Math.sin(g.t * f.f2 + f.ph * 1.7) * f.ay }; }

  /* ---------- BREAD WARS (core, script.js) ----------
     State: bread.p2, bread.loaf {held, x,y}. AI: grab the loaf, carry it
     to P1's home (left edge), throw with ARROWUP (the actual throw key).
     While carrying: avoid P1 body-check. While free: chase the loaf. */
  register("breadGame", (g) => {
    if (!g || !g.p2 || !g.loaf) return;
    const me = g.p2, loaf = g.loaf;
    const mine = loaf.held === "p2";
    const diff = window.PDX_AI.difficulty;
    if (loaf.held === "p1") {
      // chase the carrier and try to body-check (snatch on contact)
      const opp = g.p1; if (!opp) return;
      if (opp.x < me.x - 14) aiPress("arrowleft"); if (opp.x > me.x + 14) aiPress("arrowright");
      return;
    }
    if (!mine && !loaf.held) {
      // run to the loaf
      if (loaf.x < me.x - 12) aiPress("arrowleft");
      if (loaf.x > me.x + 12) aiPress("arrowright");
      return;
    }
    if (mine) {
      // carry toward P1's home (x<130) and throw when close
      const opp = g.p1;
      if (opp && Math.abs(opp.x - me.x) < 90) {
        // dodge: go around the defender
        if (me.x < 400) aiPress("arrowright"); else aiPress("arrowleft");
        return;
      }
      if (me.x > 130) aiPress("arrowleft");
      else if (Math.random() < (hard() ? 0.6 : 0.3)) aiPress("arrowup");  // throw key
    }
  });

  /* ---------- AIR HOCKEY (core) — smarter: guard goal + strike ----------
     Goal is at x<60 (P2 defends right side; P1's goal x<60). */
  register("hockeyGame", (g) => {
    if (!g || !g.p2 || !g.puck) return;
    const me = g.p2, p = g.puck;
    const diff = window.PDX_AI.difficulty;
    // track puck y with slight lag (imperfect)
    const lag = diff === "hard" ? 0 : diff === "easy" ? 60 : 25;
    const ty = p.y + (me.vy || 0) * lag * 0.01;
    if (ty < me.y - 12) aiPress("arrowup");
    if (ty > me.y + 12) aiPress("arrowdown");
    // when puck is in reach, strike forward toward P1 goal
    const d = Math.hypot(p.x - me.x, p.y - me.y);
    if (d < 70) {
      if (p.x < me.x - 6) aiPress("arrowleft");
      if (Math.random() < (diff === "hard" ? 0.5 : 0.25)) aiPress("arrowright");
    } else {
      // puck far away: CHASE it so the game can never deadlock at center
      if (p.x < me.x - 30) aiPress("arrowleft");
      else if (p.x > me.x + 30) aiPress("arrowright");
      if (p.y < me.y - 40) aiPress("arrowup");
      else if (p.y > me.y + 40) aiPress("arrowdown");
    }
  });

  /* ---------- HOT POTATO (extras.js) — real state: P.players[2], P.holder ----------
     AI: if I have the bomb, RUN AWAY from the opponent (don't let them tag me).
     If opponent has it, CHASE them to tag and pass the bomb off. */
  register("potatoGame", (g) => {
    if (!g || !g.players) return;
    const me = g.players[1], other = g.players[0];
    if (!me || !other || !me.x) return;
    const hasBomb = g.holder === 1;
    const d = Math.hypot(me.x - other.x, me.y - other.y);
    if (hasBomb) {
      // RUN AWAY — dodge away from the opponent, keeping distance
      const fleeX = me.x + (me.x - other.x) * 2, fleeY = me.y + (me.y - other.y) * 2;
      if (fleeX > me.x + 15) aiPress("arrowright"); else if (fleeX < me.x - 15) aiPress("arrowleft");
      if (fleeY > me.y + 15) aiPress("arrowdown"); else if (fleeY < me.y - 15) aiPress("arrowup");
      // also dash away when they're close
      if (d < 120 && Math.random() < 0.3) aiPress("enter");
    } else {
      // CHASE — run to tag the opponent and offload the bomb
      if (other.x < me.x - 14) aiPress("arrowleft"); if (other.x > me.x + 14) aiPress("arrowright");
      if (other.y < me.y - 14) aiPress("arrowup"); if (other.y > me.y + 14) aiPress("arrowdown");
      // dash to catch up
      if (d > 180 && Math.random() < 0.25) aiPress("enter");
    }
  });

  /* ---------- TANK ARENA (core) — aim turret at P1, fire ---------- */
  register("tankGame", (g) => {
    if (!g || !g.tanks) return;
    const me = g.tanks[1], them = g.tanks[0];
    if (!me || !them || !me.alive) return;
    const target = Math.atan2(them.y - me.y, them.x - me.x);
    let diff = target - me.a; while (diff > Math.PI) diff -= 2 * Math.PI; while (diff < -Math.PI) diff += 2 * Math.PI;
    if (diff > 0.08) aiPress("arrowright");
    else if (diff < -0.08) aiPress("arrowleft");
    const dist = Math.hypot(them.x - me.x, them.y - me.y);
    if (Math.abs(diff) < 0.25 && Math.random() < (hard() ? 0.3 : 0.12)) aiPress("enter");
    if (dist > 260) aiPress("arrowup");
  });

})();
