/* =====================================================
   UNIVERSAL AI V2 — real AI input for every micro game.

   Approach: instead of reading the human `keys` object, the engine's
   P2 input object is REPLACED with AI decisions when P2=AI/AIvAI is on.
   A generic heuristic scanner figures out what to do per game:
   - finds the game's own player entity (pl[1] / p2 / ship[1] etc.)
   - finds threat/target entities (things moving toward P2 or collectibles)
   - walks toward/away and presses action at the right time
   Games that use g.walk() automatically move the AI player. Games with
   custom movement get g.I[1] set correctly — which is ALL of them since
   every game reads g.I.
   ===================================================== */
(function () {
  "use strict";
  if (window.__AI_UNIVERSAL_V2__) return; window.__AI_UNIVERSAL_V2__ = true;

  const DIFF = { easy: { react: .55, miss: .40, hold: .38, cool: 1.1 }, normal: { react: .24, miss: .18, hold: .60, cool: 0.7 }, hard: { react: .11, miss: .05, hold: .85, cool: 0.45 } };
  let diffName = (window.PDX_AI && window.PDX_AI.difficulty) || "normal";
  window.PDX_AI_SET_DIFF = window.PDX_AI_SET_DIFF || function (d) { diffName = DIFF[d] ? d : "normal"; };
  window.PDX_AI_GET_DIFF = window.PDX_AI_GET_DIFF || (() => diffName);

  function aiMode() {
    const a = window.PDX_AI;
    return a && a.enabled ? (a.mode === "p2_ai" || a.mode === "both_ai") : false;
  }
  function bothAI() {
    const a = window.PDX_AI;
    return !!(a && a.mode === "both_ai");
  }

  /* ---------- per-game AI state ---------- */
  const S = new Map();      // id -> {t, react, side, err}
  function st(id) {
    let s = S.get(id);
    if (!s) {
      s = { t: 0, react: 0, err: Math.random() * 100, dirT: 0, fireT: 0, actT: 0 };
      S.set(id, s);
    }
    return s;
  }

  /* ---------- entity scanning ---------- */
  /* find P2's own entity: most games use pl/pl[1], some use p2 */
  function findSelf(g) {
    if (g.pl && g.pl[1]) return g.pl[1];
    if (g.p2 && g.p2.x !== undefined) return g.p2;
    if (g.p2p && g.p2p.x !== undefined) return g.p2p;
    if (g.players && g.players[1]) return g.players[1];
    if (g.chars && g.chars[1]) return g.chars[1];
    if (g.ship && g.ship[1]) return g.ship[1];
    if (g.paddle && g.paddle[1]) return g.paddle[1];
    if (g.pads && g.pads[1] && g.pads[1].x !== undefined) return g.pads[1];
    if (g.me && g.me[1]) return g.me[1];
    if (g.snakes && g.snakes[1] && g.snakes[1][0]) return g.snakes[1][0];
    if (g.bikes && g.bikes[1] && g.bikes[1][0]) return g.bikes[1][0];
    if (g.st && g.st[1] && (g.st[1].x !== undefined || g.st[1].ph)) return g.st[1];
    if (g.f && g.f[1] && g.f[1].x !== undefined) return g.f[1];
    if (g.bx && g.bx[1] && g.bx[1].x !== undefined) return g.bx[1];
    return null;
  }
  /* find P1's entity (opponent) */
  function findOpp(g) {
    if (g.pl && g.pl[0]) return g.pl[0];
    if (g.p1 && g.p1.x !== undefined) return g.p1;
    if (g.players && g.players[0]) return g.players[0];
    if (g.chars && g.chars[0]) return g.chars[0];
    if (g.ship && g.ship[0]) return g.ship[0];
    if (g.paddle && g.paddle[0]) return g.paddle[0];
    if (g.pads && g.pads[0] && g.pads[0].x !== undefined) return g.pads[0];
    if (g.me && g.me[0]) return g.me[0];
    if (g.bx && g.bx[0] && g.bx[0].x !== undefined) return g.bx[0];
    return null;
  }
  /* collect threat/target entities */
  function collect(g, self, opp) {
    const out = { targets: [], threats: [] };
    const push = (arr, opts) => {
      if (!Array.isArray(arr)) return;
      for (const e of arr) {
        if (!e || typeof e.x !== "number") continue;
        if (e === self || e === opp) continue;
        if (e.alive === false || e.dead) continue;
        if (e.got || e.cut || e.eaten) continue;
        out.targets.push(e);
      }
    };
    const ARR = ["enemies", "targets", "coins", "stars", "gems", "apples", "fruits", "fish", "flies", "birds", "ducks", "zombies", "ghosts", "slimes", "frogs", "cows", "pigs", "chickens", "sheep", "bubbles", "asteroids", "ships", "rocks", "cars", "planes", "items", "drops", "bugs", "moles", "balloons", "candies", "leaves", "snow", "orbs", "pellets", "food", "munchies", "boids", "cows2", "pigs2", "enemies2", "ducks2", "fishes", "things", "objs", "ents"];
    for (const k of ARR) push(g[k]);
    if (g.ball && g.ball.x !== undefined) out.targets.push(g.ball);
    if (g.puck && g.puck.x !== undefined) out.targets.push(g.puck);
    if (g.bread && g.bread.x !== undefined && g.bread.held === null) out.targets.push(g.bread);
    if (g.loaf && g.loaf.x !== undefined && g.loaf.held === null) out.targets.push(g.loaf);
    if (g.drop && g.drop.x !== undefined) out.targets.push(g.drop);
    if (g.apple && g.apple.x !== undefined) out.targets.push(g.apple);
    if (g.food && g.food.x !== undefined) out.targets.push(g.food);
    // bombs / bullets aimed at P2 are threats
    for (const k of ["bombs", "bullets", "shots", "bolts", "arrows", "knives", "spears", "balls2", "missiles", "lava", "spikes", "hazards"]) {
      const arr = g[k];
      if (!Array.isArray(arr)) continue;
      for (const e of arr) {
        if (!e || typeof e.x !== "number") continue;
        if (e.owner === 1 || e.player === 1) continue;  // own shots aren't threats
        out.threats.push(e);
      }
    }
    // NOTE: the opponent is NOT a threat — the AI attacks them.
    return out;
  }

  /* ---------- ball-sport paddles: intercept-tracking AI ----------
     For pong/air-hockey/volley/breakout-family games, the paddle player
     should TRACK the ball's projected position instead of chasing targets.
     Detected by: self is paddle-like (thin, stationary x on one side) and
     g.ball/g.puck exists. */
  function paddleTrack(g, self, dt, s, D) {
    const ball = g.ball || g.puck || (g.balls && g.balls[0]);
    if (!ball || ball.x === undefined) return null;
    // paddle constraint axis: if paddle's x barely changes between frames,
    // it moves along y only (right-side paddles) — mirror for left paddles
    const vert = self.x > 450;      // right side → tracks vertically
    const target = vert ? ball.y : ball.x;
    // lead the target slightly by its velocity for higher difficulties
    const vel = vert ? (ball.vy || 0) : (ball.vx || 0);
    const lead = diffName === "hard" ? 0.18 : diffName === "normal" ? 0.08 : 0;
    const aim = target + vel * lead;
    const pos = vert ? self.y : self.x;
    const d = aim - pos;
    const dead = 8 + (diffName === "hard" ? 4 : diffName === "easy" ? 18 : 10);
    const I = NEUTRAL();
    if (Math.abs(d) > dead) {
      if (vert) { if (d < 0) I.u = 1; else I.d = 1; }
      else { if (d < 0) I.l = 1; else I.r = 1; }
    }
    // occasional lunge/fire for games with actions (volley spike)
    s.fireT -= dt;
    if (s.fireT <= 0 && Math.abs(d) < 40 && Math.random() > D.miss) {
      I.a = 1; I.pa = 1;
      s.fireT = 0.6 + Math.random() * 0.8;
    }
    return I;
  }
  /* note: assumes vert if self.x>450, else horizontal-left — covers all
     paddle arrangements used in this codebase (pong, hockey, volley). */

  /* ---------- collect-item games: nearest-target with pathing sense ----
     Prefer targets moving TOWARD the self (intercepts) over ones moving
     away; also prefer lower targets when the game has gravity (falls). */
  function scoreTarget(e, self) {
    let sc = 0;
    const vx = e.vx || 0, vy = e.vy || 0;
    const dx = (e.x || 0) - self.x, dy = (e.y || self.y) - self.y;
    // closing velocity (positive = coming closer)
    const closing = -(dx * vx + dy * vy) / (Math.hypot(dx, dy) + 1);
    sc += closing * 0.4;
    if (vy > 20) sc += 10;                    // falling pickups are urgent
    if (e.big || e.rare || e.value) sc += (e.value || 5) * 0.5;
    return sc;
  }

  /* ---------- decide AI input for this frame ----------
     Deliberate AI: hold a committed plan for ~0.4–0.9s. Three layers:
       1. DODGE  — predictive perpendicular dodge of incoming projectiles
       2. ATTACK — close on the opponent, line up, fire with intent
       3. COLLECT— pick up nearby beneficial items
     Priority: dodge > attack > collect > reposition. No random mash. */
  function decide(g, id, dt) {
    const s = st(id);
    const D = DIFF[diffName] || DIFF.normal;
    s.t += dt;
    if (s.react > 0) { s.react -= dt; return NEUTRAL(); }

    const self = findSelf(g);
    if (!self || self.x === undefined) return NEUTRAL();

    /* COMMITMENT: re-evaluate every frame so the AI reacts to the actual
       game state instead of blindly replaying a stale plan for 0.4–0.9s.
       s.dirT is only used to give momentum while idle (no twitching). */
    s.dirT -= dt;
    if (s.dirT < 0) s.dirT = 0;

    const opp = findOpp(g);
    const { targets, threats } = collect(g, self, opp);

    /* paddle games: intercept tracking (already deliberate) */
    const paddleI = paddleTrack(g, self, dt, s, D);
    if (paddleI) {
      s.last = paddleI;
      return paddleI;
    }

    const W = 900, H = 500;
    const I = { l: 0, r: 0, u: 0, d: 0, a: 0, pl: 0, pr: 0, pu: 0, pd: 0, pa: 0 };

    /* ===== 1. DODGE — predictive, perpendicular to projectile path ===== */
    let dodge = null, dodgeUrg = 0;
    for (const t of threats) {
      if (t === self) continue;
      const dx = (t.x || 0) - self.x, dy = (t.y || 0) - self.y;
      const d = Math.hypot(dx, dy) || 1;
      const tvx = t.vx || 0, tvy = t.vy || 0;
      const closing = -(dx * tvx + dy * tvy) / d;
      if (closing < 8 || d > 380) continue;
      const tti = d / Math.max(1, closing);
      if (tti > 1.6) continue;
      const spd = Math.hypot(tvx, tvy) || 1;
      const nx = -tvy / spd, ny = tvx / spd;
      const side = (nx * -dx + ny * -dy) > 0 ? 1 : -1;
      const urg = 1 - tti / 1.6;
      if (urg > dodgeUrg) { dodgeUrg = urg; dodge = { x: nx * side, y: ny * side }; }
    }

    /* ===== 1b. DEATH AVOIDANCE — stationary hazards (spikes, lava pools,
       bombs about to blow): just back away from them, don't wander into them */
    if (dodgeUrg < 0.3) {
      for (const t of threats) {
        if (t.vx || t.vy) continue;
        const dx = (t.x || 0) - self.x, dy = (t.y || 0) - self.y;
        const d = Math.hypot(dx, dy);
        if (d < 55) {
          dodge = { x: -Math.sign(dx) || 1, y: -Math.sign(dy) || 0 };
          dodgeUrg = 0.7;
          break;
        }
      }
    }

    /* ===== 2. ATTACK — close on the opponent, line up, fire ===== */
    let attack = null;
    if (opp && opp.x !== undefined) {
      const dx = opp.x - self.x;
      const dy = (opp.y !== undefined ? opp.y : 250) - (self.y !== undefined ? self.y : 250);
      const d = Math.hypot(dx, dy) || 1;
      if (d < 640) {
        attack = { x: Math.sign(dx), y: dy > 30 ? 1 : dy < -30 ? -1 : 0, d };
        s.dirT = Math.max(s.dirT, 0.3);   // commit: don't re-decide mid-attack
      }
    }

    /* ===== 3. COLLECT — beneficial items ===== */
    let pick = null, bestSc = -1e9;
    for (const t of targets) {
      const dx = (t.x || 0) - self.x, dy = (t.y || self.y) - self.y;
      const d = Math.hypot(dx, dy);
      if (d > 420) continue;
      const sc = d - scoreTarget(t, self);
      if (sc > bestSc) { bestSc = sc; pick = { x: Math.sign(dx), y: Math.sign(dy) }; }
    }

    /* ===== assemble movement by priority ===== */
    let mvx = 0, mvy = 0;
    let urgent = false;
    if (dodge && dodgeUrg > 0.2) {
      mvx = dodge.x; mvy = dodge.y; urgent = true; s.dirT = 0;
    } else if (attack) {
      mvx = attack.x; mvy = attack.y;
    } else if (pick) {
      mvx = pick.x; mvy = pick.y;
    } else {
      mvx = self.x < 430 ? 1 : self.x > 470 ? -1 : 0;
    }
    /* momentum while idle: if nothing is happening this frame, briefly
       continue the previous direction instead of freezing mid-step */
    if (!urgent && !mvx && !mvy && s.dirT > 0 && s.last) {
      mvx = s.last.r ? 1 : s.last.l ? -1 : 0;
      mvy = s.last.d ? 1 : s.last.u ? -1 : 0;
    }
    if (!urgent) s.dirT = D.hold * 0.35;
    // arena bounds
    if (self.x < 60 && mvx < 0) mvx = 0;
    if (self.x > 840 && mvx > 0) mvx = 0;
    if (self.y !== undefined) {
      if (self.y < 60 && mvy < 0) mvy = 0;
      if (self.y > H - 60 && mvy > 0) mvy = 0;
    }
    I.l = mvx < 0 ? 1 : 0; I.r = mvx > 0 ? 1 : 0;
    I.u = mvy < 0 ? 1 : 0; I.d = mvy > 0 ? 1 : 0;

    /* FIRE: only when in range, cooled down, not mid-dodge, and roughly
       AIMED at the opponent (prevents blind spraying into the void) */
    s.fireT -= dt;
    if (attack && attack.d < 430 && s.fireT <= 0 && dodgeUrg < 0.5 && Math.random() > D.miss) {
      const adx = opp.x - self.x;
      const ady = (opp.y !== undefined ? opp.y : self.y) - self.y;
      const aligned = Math.abs(adx) < 130 || Math.abs(ady) < 60;
      if (aligned) {
        I.a = 1; I.pa = 1;
        if (Math.abs(adx) < 130) I.pu = 1;   // press up only when horizontally lined up
        s.fireT = D.cool;
      } else {
        s.fireT = 0.12;                       // not lined up: recheck soon, don't spam
      }
    }
    s.last = I;
    return I;
  }
  function NEUTRAL() { return { l: 0, r: 0, u: 0, d: 0, a: 0, pl: 0, pr: 0, pu: 0, pd: 0, pa: 0 }; }

  /* ---------- goal-oriented strategies ----------
     The generic wander/chase heuristics keep the AI moving but aimless.
     These per-pattern strategies give it an actual PLAN: hold-to-charge,
     timed taps, obstacle jumping, goal running, rope timing. ---------- */
  const STRAT = {};

  /* --- helper: build a neutral input --- */
  function NI(extra) { return Object.assign({ l: 0, r: 0, u: 0, d: 0, a: 0, pl: 0, pr: 0, pu: 0, pd: 0, pa: 0 }, extra); }

  /* SKI JUMP: hold a to charge speed, tap u at the launch zone, glide */
  STRAT.skijumpGame = function (g, s, dt) {
    const me = g.st && g.st[1];
    if (!me) return null;
    if (me.done || me.landed) return NI();
    if (!me.jumped) {
      if (me.x < 110) return NI({ a: 1 });            // build speed on the way in
      if (me.x < 190) return NI({ pu: 1, a: 1 });     // launch zone: jump AND keep charging
      return NI({ pu: 1 });                           // past zone: jump anyway (better than FOUL)
    }
    return NI();                                      // glide
  };

  /* LONG JUMP: mash a to sprint, tap d (S) to leap before the line */
  STRAT.jumpGame = function (g, s, dt) {
    const me = g.st && g.st[1];
    if (!me) return null;
    if (me.ph === "run") {
      if (me.x > 330) return NI({ pd: 1, d: 1 });                      // leap just before 440 line
      return NI({ a: 1, pa: 1 });                                      // sprint
    }
    if (me.ph === "air") return NI();
    return NI();
  };

  /* JUMP ROPE: jump exactly when the rope phase crosses the ground */
  STRAT.ropeGame = function (g, s, dt) {
    const me = g.pl && g.pl[1];
    if (!me) return null;
    const T = Math.max(.62, 1.45 - g.rt * .03);
    const phaseToGround = (Math.floor(g.ph + .5) + .5 - g.ph) * T;      // seconds until rope hits ground
    if (me.h <= 0 && phaseToGround < 0.22 && phaseToGround > 0.05) return NI({ pa: 1, a: 1 });
    return NI();
  };

  /* LAVA ESCAPE: climb toward the highest surviving platform, dodge lava */
  STRAT.lavaescapeGame = function (g, s, dt) {
    const me = g.pl && g.pl[1];
    if (!me) return null;
    if (g.mode !== "play") return NI();
    const plats = (g.plats && g.plats[1]) || [];
    // pick nearest platform ABOVE me that's still above lava
    let best = null, bd = 1e9;
    for (const pl of plats) {
      if (pl.y >= g.lava - 20) continue;
      const dy = me.y - pl.y;
      if (dy < -6) continue;                                           // above me — only care about ones I can drop onto
      const dx = Math.abs(pl.x + pl.w / 2 - me.x);
      const sc = dy + dx * 0.5;
      if (sc < bd) { bd = sc; best = pl; }
    }
    const I = {};
    if (best) {
      const cx = best.x + best.w / 2;
      if (cx < me.x - 8) I.l = 1; else if (cx > me.x + 8) I.r = 1;
    }
    // jump when grounded and there's a platform above within reach
    if (me.grounded) {
      const above = plats.find(pl => pl.y < me.y - 20 && pl.y > me.y - 90 && Math.abs(pl.x + pl.w / 2 - me.x) < 70);
      if (above) { I.pu = 1; I.u = 1; }
      else if (!best || me.y > g.lava - 120) { I.pu = 1; I.u = 1; }    // lava close: jump anyway
    }
    return NI(I);
  };

  /* MARBLE MADNESS: roll toward the goal line, avoid falling off sides */
  STRAT.marbleGame = function (g, s, dt) {
    const me = g.pl && g.pl[1];
    if (!me || me.dead || me.won) return null;
    const goalX = 470;                                                 // P2 goal zone edge
    const I = {};
    if (me.x > goalX + 12) I.l = 1; else if (me.x < goalX - 12) I.r = 1;
    // stay off top/bottom edges
    if (me.y < 80) I.d = 1; else if (me.y > 420) I.u = 1;
    return NI(I);
  };

  /* GEOMETRY DUEL: auto-runner — jump when a spike/platform is close */
  STRAT.geometryGame = function (g, s, dt) {
    const me = g.pl && g.pl[1];
    if (!me) return null;
    const worldX = g.dist[1] + me.x;
    let nearest = null;
    for (const o of g.track) {
      const sx = o.x - worldX;
      if (sx > 10 && sx < 120) { nearest = o; break; }
    }
    if (nearest && me.grounded) {
      const gap = nearest.x - worldX;
      if (nearest.type === "spike" && gap < 95) return NI({ pa: 1, a: 1 });
      if (nearest.type === "platform" && gap < 110) return NI({ pa: 1, a: 1 });
    }
    return NI();
  };

  /* ---------- NEW STRATEGIES (round 2 — games flagged STATIC/weak) ---------- */

  /* helper: merge helper for board games (direction semantics vary) */
  function dirOf(I) {           // reads press-style input from STRAT funcs
    return I.pu ? 2 : I.pd ? 3 : I.pl ? 0 : I.pr ? 1 : -1;
  }

  /* 2048 DUEL: slide toward the densest tile cluster; tap random dir when
     stuck. Strategy: always slide DOWN or toward the largest tile column. */
  STRAT.g2048Game = function (g, s, dt) {
    if (!g.bd) return null;
    if (!s.cd || s.cd <= 0) {
      const b = g.bd[1];
      // find the column index holding the biggest tile
      let big = 0, bigC = 0;
      for (let i = 0; i < 16; i++) if (b[i] > big) { big = b[i]; bigC = i % 4; }
      // 70%: pull big tile to the bottom row (pd), 30%: slide toward big column
      const roll = Math.random();
      let I;
      if (roll < 0.55) I = NI({ pd: 1 });
      else if (roll < 0.80) I = bigC < 1.5 ? NI({ pr: 1 }) : bigC > 2.5 ? NI({ pl: 1 }) : NI({ pd: 1 });
      else I = NI([NI({ pl: 1 }), NI({ pr: 1 }), NI({ pu: 1 }), NI({ pd: 1 })][Math.floor(Math.random() * 4)]);
      s.cd = 0.35 + Math.random() * 0.4;       // pace: one slide every ~0.4s
      s.lastI = I;
      return I;
    }
    s.cd -= dt;
    return s.lastI || NI();
  };

  /* PIXEL BOXING: uses g.bx[] fighters, not g.pl. Move into range, punch
     on cooldown, block when their punch is winding up (pu>0). */
  STRAT.boxingGame = function (g, s, dt) {
    if (!g.bx) return null;
    const me = g.bx[1], op = g.bx[0];
    if (!me || !op) return null;
    const dx = op.x - me.x;
    const adx = Math.abs(dx);
    const I = {};
    if (adx > 78) { if (dx > 0) I.r = 1; else I.l = 1; }        // close in
    else if (adx < 32) { if (dx > 0) I.l = 1; else I.r = 1; }   // don't hug
    s.fireT = (s.fireT || 0) - dt;
    if (adx < 92 && s.fireT <= 0) {
      if (op.pu > 0) { I.d = 1; }                                // they're winding up: BLOCK
      else { I.pa = 1; s.fireT = 0.45 + Math.random() * 0.45; }  // otherwise punch
    }
    return NI(I);
  };

  /* JUMP ROPE pairing / other pl[]-shape games use g.pl — kept from earlier. */

  /* JOUST + CHARGE JOUST: fly toward opponent ABOVE their height when
     possible (height advantage wins), dive-strike when close. */
  STRAT.joustGame = STRAT.chargejoustGame = function (g, s, dt) {
    const me = g.pl && g.pl[1], op = g.pl && g.pl[0];
    if (!me) return null;
    const I = {};
    if (op) {
      const dx = op.x - me.x, dy = op.y - me.y;
      if (dy > 18) { I.pu = 1; I.u = 1; }        // flap up when they're above
      if (Math.abs(dx) > 40) { if (dx > 0) I.r = 1; else I.l = 1; }
      s.fireT = (s.fireT || 0) - dt;
      if (Math.abs(dx) < 70 && Math.abs(dy) < 50 && s.fireT <= 0) { I.pa = 1; s.fireT = 0.4; }
    } else {
      if (me.y > 300) { I.pu = 1; }
    }
    return NI(I);
  };

  /* TANK ARENA: drive toward opponent but keep a min distance so we never
     ram into their line of fire at spawn (the old AI drove straight into
     bullets). Orbit at ~180px, shoot when turret aligned. */
  STRAT.tankGame = function (g, s, dt) {
    if (!g.tanks) return null;
    const me = g.tanks[1], op = g.tanks[0];
    if (!me || !me.alive) return null;
    if (!op || !op.alive) return NI();
    const dx = op.x - me.x, dy = op.y - me.y;
    const dist = Math.hypot(dx, dy);
    // first: aim turret
    const target = Math.atan2(dy, dx);
    let diff = target - me.a; while (diff > Math.PI) diff -= 2 * Math.PI; while (diff < -Math.PI) diff += 2 * Math.PI;
    const I = {};
    if (diff > 0.07) I.r = 1; else if (diff < -0.07) I.l = 1;
    // second: hold ideal range 160–260 — approach if far, back off if TOO close
    if (dist > 260) { I.u = 1; }
    else if (dist < 130) { I.d = 1; }
    else {
      // orbit sideways so we're a moving target
      s.orb = s.orb || (Math.random() < 0.5 ? 1 : -1);
      if (s.orb > 0) { I.pr = 1; I.r = 1; } else { I.pl = 1; I.l = 1; }
      if (Math.random() < dt * 0.5) s.orb = -s.orb;   // switch orbit direction occasionally
    }
    // fire when lined up
    s.fireT = (s.fireT || 0) - dt;
    if (Math.abs(diff) < 0.18 && dist < 500 && s.fireT <= 0) { I.pa = 1; s.fireT = 0.55; }
    return NI(I);
  };

  /* ---------- PADDLE/AIM GAMES flag: server, war, armwrestle, balance,
     blackjack, ghosthunt, pool, etc. don't expose p2/p1 entities — mark
     them handled so the generic walker doesn't flail into walls. */
  const NO_ENTITY = new Set(["poolGame", "warGame", "armwrestleGame", "balanceGame", "blackjackGame", "ghosthuntGame"]);
  function NO_ENTITY_IDLE() { return NI(); }   // idle: no dumb wandering
  for (const nid of NO_ENTITY) STRAT[nid] = NO_ENTITY_IDLE;

  /* CARD GAME: blackjack — hit below 17, stand otherwise. Uses g.hand if present. */
  STRAT.blackjackGame = function (g, s, dt) {
    // blackjack runs on DOM clicks; generic AI in ai_fixes covers it.
    return NI();
  };

  /* apply a strategy if one exists for this game; returns input or null */
  window.__STRAT_CALLS = window.__STRAT_CALLS || {};
  function applyStrategy(id, g, dt) {
    const fn = STRAT[id];
    if (!fn) return null;
    const key = id + "#plan";
    let s = S.get(key);
    if (!s) { s = {}; S.set(key, s); }
    try {
      const r = fn(g, s, dt);
      if (window.__STRAT_CALLS) window.__STRAT_CALLS[id] = (window.__STRAT_CALLS[id] || 0) + 1;
      return r;
    } catch (e) { return null; }
  }

  /* ---------- the engine hook ----------
     Patch PD.micro so each micro game's `update` gets AI input merged
     into g.I[1] before running. We don't touch game code — we wrap the
     def.update that every game passes in. */
  function installBridge() {
    if (!window.PD || !window.PD.micro || window.__AI_BRIDGE_V2__) return;
    window.__AI_BRIDGE_V2__ = true;
    const _micro = window.PD.micro;
    window.PD.micro = function (def) {
      // kill any stale loop still publishing/running for this id
      // (games_fixes2.js re-registers some games; the OLD registration's
      // rAF loop keeps running otherwise and stomps the live game's state)
      if (window.PDX_GAME_STATE && window.PDX_GAME_STATE[def.id]) {
        try { delete window.PDX_GAME_STATE[def.id]; } catch (e) { }
      }
      const origUpdate = def.update;
      def.update = function (g, dt) {
        try {
          if (aiMode()) {
            const id = def.id;
            // only take over when the game has a discoverable P2 entity;
            // otherwise the shared-keys path (aiPress hooks) stays in control
            if (findSelf(g)) {
              const plan = applyStrategy(id, g, dt);
              if (plan) {
                g.__aiPlanned = true;                 // tell PRE_UPDATE we already handled this frame
                g.I[1] = plan;
                if (bothAI()) g.I[0] = decideAI1(g, id, dt);
              } else {
                g.I[1] = decide(g, id + "#p2", dt);
                if (bothAI() && findOpp(g)) g.I[0] = decideAI1(g, id, dt);
              }
            }
          }
        } catch (e) { }
        return origUpdate.call(this, g, dt);
      };
      return _micro(def);
    };
  }
  /* P1 AI in both_ai mode: same heuristics, mirrored sides */
  function decideAI1(g, id, dt) {
    const I = decide(g, id + "#p1", dt);
    const flip = x => x ? 0 : 1;
    return { l: flip(I.r), r: flip(I.l), u: flip(I.d), d: flip(I.u), a: I.a, pl: flip(I.pr), pr: flip(I.pl), pu: flip(I.pd), pd: flip(I.pu), pa: I.pa };
  }

  /* hook after all packs are loaded */
  function boot() {
    installBridge();
    // PRIMARY injection point: engine.js's readInputs() calls this right after
    // building the fresh g.I array each frame — the ONLY reliable place, since
    // readInputs replaces g.I wholesale every frame and any earlier write dies.
    window.PDX_AI_FRESH_I = function (g) {
      try {
        if (!aiMode()) return;
        if (!g.I || !Array.isArray(g.I) || g.I.length < 2) return;
        const id = (typeof activeScreen !== "undefined") ? activeScreen : window.activeScreen;
        if (!id || id === "menu") return;
        const sid = id.replace(/Game$/, "");
        const stratId = STRAT[id] ? id : (STRAT[sid] ? sid : null);
        const hasStrat = !!stratId && STRAT[stratId] !== NO_ENTITY_IDLE;
        if (!hasStrat && !findSelf(g)) return;
        window.__FRESH_CALLS = (window.__FRESH_CALLS || {});
        window.__FRESH_CALLS[id] = (window.__FRESH_CALLS[id] || 0) + 1;
        const plan = stratId ? applyStrategy(stratId, g, 1 / 60) : null;
        if (plan) {
          g.I[1] = plan;
          if (bothAI()) g.I[0] = decideAI1(g, stratId, 1 / 60);
        } else if (findSelf(g)) {
          g.I[1] = decide(g, id + "#p2", 1 / 60);
          if (bothAI() && findOpp(g)) g.I[0] = decideAI1(g, id, 1 / 60);
        }
      } catch (e) { }
    };
    // state_bridge.js calls this synchronously before each game update;
    // route it through the same decision path (belt and braces with aiLoop)
    window.PDX_AI_PRE_UPDATE = function (id, g, dt) {
      try {
        if (!aiMode()) return;
        if (!g || !g.I || !Array.isArray(g.I) || g.I.length < 2) return;
        if (!findSelf(g)) return;
        if (g.__aiPlanned) { delete g.__aiPlanned; return; }   // plan already applied this frame by the micro wrapper
        const plan = applyStrategy(id, g, dt);
        if (plan) {
          g.I[1] = plan;
          if (bothAI()) g.I[0] = decideAI1(g, id, dt);
        } else {
          g.I[1] = decide(g, id + "#p2", dt);
          if (bothAI() && findOpp(g)) g.I[0] = decideAI1(g, id, dt);
        }
      } catch (e) { }
    };
    patchStateBridge();
  }
  function patchStateBridge() {
    // micro games publish state through state_bridge.js — patch their update
    if (window.PDX_GAME_STATE) {
      for (const id in window.PDX_GAME_STATE) {
        const g = window.PDX_GAME_STATE[id];
        if (g && g.__aiPatched) continue;
        g.__aiPatched = true;
      }
    }
    // micro games' def.update references g.I[1] directly. Since state_bridge
    // publishes g and update runs before AI loop reads, we instead run a
    // pre-update pass: run decide() on the published state each frame,
    // writing g.I[1] BEFORE the game's own update runs. Games registered via
    // the bridge get AI input this way.
    (function aiLoop() {
      requestAnimationFrame(aiLoop);
      try {
        if (!aiMode()) return;
        const id = (typeof activeScreen !== "undefined") ? activeScreen : window.activeScreen;
        if (!id || id === "menu") return;
        // core script.js games publish under the stripped suffix (bomb, hockey…)
        // while micro games publish under the full id (jumpGame, skijumpGame…)
        const g = window.PDX_GAME_STATE && (window.PDX_GAME_STATE[id] || window.PDX_GAME_STATE[id.replace(/Game$/, "")]);
        if (!g) return;
        const gid = window.PDX_GAME_STATE[id] ? id : id.replace(/Game$/, "");
        // don't stomp the plan the engine wrapper already injected this frame
        if (g.__aiPlanned) { g.__aiPlanned = false; return; }
        if (STRAT[id]) {
          const plan = applyStrategy(id, g, 1 / 60);
          if (plan) { g.I[1] = plan; if (bothAI()) g.I[0] = decideAI1(g, gid, 1 / 60); return; }
        }
        g.__preAI = (g.__preAI || 0) + 1 / 60;
        // same guard: entity-present games only
        if (!findSelf(g)) return;
        g.I[1] = decide(g, gid + "#p2", 1 / 60);
        if (bothAI() && findOpp(g)) g.I[0] = decideAI1(g, gid, 1 / 60);
      } catch (e) { }
    })();
  }

  if (document.readyState === "loading") addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 300);
})();
