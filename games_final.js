/* =====================================================
   GAME PACK FINAL — 24 new games (276 → 300)
   Classic arcade + brain + party duels.
   Uses the same PD.micro API as the other packs.
===================================================== */
(function () {
  "use strict";
  const { micro, FX, W, H, C1, C2, GOLD, GREEN, RED, rnd, ri, seeded } = PD;
  const col = i => i ? C2 : C1;
  const cl = (v, a, b) => v < a ? a : v > b ? b : v;
  const mkp = (x, y, color, r = 16) => ({ x, y, r, color, vx: 0, vy: 0, fx: 1, fy: 0 });
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  /* 1. MAZE RUNNER — first to reach the maze exit 3 times */
  micro({
    id: "mazerunGame", title: "Maze Runner", desc: "Race through the maze to the exit", cat: "arcade", key: "mazerun", win: 3,
    controls: "P1: W/A/S/D　 P2: ARROWS — reach the glowing exit first",
    round(g) {
      g.cells = 15; g.cs = 30;
      g.grid = new Array(15 * 15).fill(1);
      // simple maze via random walk carving
      let x = 0, y = 0; g.grid[0] = 0; const stack = [[0, 0]];
      while (stack.length) {
        const [cx, cy] = stack[stack.length - 1];
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].sort(() => Math.random() - .5);
        let moved = false;
        for (const [dx, dy] of dirs) {
          const nx = cx + dx, ny = cy + dy;
          if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && g.grid[ny * 15 + nx] === 1) {
            g.grid[ny * 15 + nx] = 0; g.grid[(cy + ny) / 2 * 15 + (cx + nx) / 2] = 0;
            stack.push([nx, ny]); moved = true; break;
          }
        }
        if (!moved) stack.pop();
      }
      g.exit = { x: 14 * 30 + 15, y: 14 * 30 + 15 };
      g.pl = [mkp(15, 15, C1, 10), mkp(15, 15, C2, 10)];
      g.pl.forEach((p, i) => { p.px = 15; p.py = 15; });
    },
    update(g, dt) {
      g.pl.forEach((p, i) => {
        const I = g.I[i]; const sp = 110;
        const nx = p.px + (I.r ? 1 : I.l ? -1 : 0), ny = p.py + (I.d ? 1 : I.u ? -1 : 0);
        if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && g.grid[ny * 15 + nx] === 0) {
          p.px = nx; p.py = ny;
        }
        p.x = p.px * 30 + 15; p.y = p.py * 30 + 15;
        if (g.mode === "play" && p.px === 14 && p.py === 14) { g.add(i); g.banner_(`P${i + 1} ESCAPED`, col(i), 1.2); g.mode = "between"; g.timer = 1.3; }
      });
    },
    draw(g, ctx) {
      ctx.fillStyle = "#0a0e22"; ctx.fillRect(0, 0, W, H);
      const off = 225, oy = 25;
      for (let r = 0; r < 15; r++)for (let c = 0; c < 15; c++) {
        ctx.fillStyle = g.grid[r * 15 + c] ? "#2a3260" : "#12183a";
        ctx.fillRect(off + c * 30, oy + r * 30, 30, 30);
      }
      ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(off + 14 * 30 + 15, oy + 14 * 30 + 15, 10 + Math.sin(g.t * 5) * 3, 0, Math.PI * 2); ctx.fill();
      g.pl.forEach((p, i) => g.blob(p, col(i)));
      g.text("P1 " + g.score[0], 20, 30, 22, C1); g.text("P2 " + g.score[1], W - 20, 30, 22, C2, "right");
    }
  });

  /* 2. ORBIT WARS — two ships orbit a star, fire at each other */
  micro({
    id: "orbitwarsGame", title: "Orbit Wars", desc: "Orbit the star, blast your rival", cat: "action", key: "orbitwars", win: 3,
    controls: "P1: A/D change orbit, SPACE fire　 P2: ←/→ change orbit, ENTER fire",
    round(g) {
      g.pl = [{ a: 0, r: 90, cd: 0 }, { a: Math.PI, r: 150, cd: 0 }];
      g.bullets = [[], []];
    },
    update(g, dt) {
      g.pl.forEach((p, i) => {
        const I = g.I[i];
        p.r += ((I.r ? 1 : 0) - (I.l ? 1 : 0)) * 60 * dt; p.r = cl(p.r, 50, 190);
        if (i === 1) p.r += 0; // mirrored controls handled by key mapping
        p.a += (i ? -1 : 1) * (0.9 + 20 / (p.r || 60)) * dt;
        p.x = W / 2 + Math.cos(p.a) * p.r; p.y = H / 2 + Math.sin(p.a) * p.r;
        p.cd = Math.max(0, p.cd - dt);
        if (I.pa && p.cd <= 0) { p.cd = .5; const da = i ? Math.PI : 0; g.bullets[i].push({ x: p.x, y: p.y, a: p.a + (i ? Math.PI : 0), life: 2 }); FX.playShoot && FX.playShoot(); }
      });
      g.bullets.forEach((arr, i) => arr.forEach(b => {
        b.x += Math.cos(b.a) * 300 * dt; b.y += Math.sin(b.a) * 300 * dt; b.life -= dt;
        const foe = g.pl[1 - i];
        if (foe && dist(b, foe) < 14) { b.life = 0; g.add(i, "P" + (i + 1) + " HITS!"); g.burst(foe.x, foe.y, col(i), 14); }
      }));
      g.bullets.forEach((arr, i) => { g.bullets[i] = arr.filter(b => b.life > 0 && b.x > 0 && b.x < W && b.y > 0 && b.y < H); });
    },
    draw(g, ctx) {
      ctx.fillStyle = "#070b1f"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(W / 2, H / 2, 26, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(255,230,109,.2)";[90, 150].forEach(r => { ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2); ctx.stroke(); });
      g.bullets.forEach((arr, i) => arr.forEach(b => { ctx.fillStyle = col(i); ctx.fillRect(b.x - 3, b.y - 3, 6, 6); }));
      g.pl.forEach((p, i) => { if (p.x === undefined) return; ctx.fillStyle = col(i); ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#080b18"; ctx.lineWidth = 2; ctx.stroke(); });
    }
  });

  /* 3. WORD CHAIN — type words starting with the last letter */
  micro({
    id: "wordchainGame", title: "Word Chain", desc: "Type words that chain letter to letter", cat: "brain", key: "wordchain", win: 3, hud: false,
    controls: "Type a word starting with the shown letter. Used words are blocked. 3 rounds.",
    round(g) {
      g.letter = "abcdefghijklmnopqrstuvwxyz"[ri(0, 25)];
      g.used = new Set();
      g.msg = `TYPE A WORD STARTING WITH "${g.letter.toUpperCase()}" — THEN PRESS ENTER`;
      g.input = "";
    },
    update(g, dt) { },
    draw(g, ctx) {
      ctx.fillStyle = "#141a3a"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = GOLD; ctx.font = "bold 90px Courier New"; ctx.textAlign = "center";
      ctx.fillText(g.letter.toUpperCase(), W / 2, 170);
      ctx.font = "bold 24px Courier New"; ctx.fillStyle = "#fff";
      ctx.fillText((g.input || "_").toUpperCase(), W / 2, 260);
      ctx.font = "14px Courier New"; ctx.fillStyle = "#9fc0ff";
      ctx.fillText("ROUND " + (g.score[0] + g.score[1] + 1), W / 2, 330);
      const ws = [];
      g.used.forEach(w => ws.push(w));
      ctx.fillText(ws.slice(-5).join(" · "), W / 2, 380);
      ctx.textAlign = "left";
    }
  });

  /* 4. MEMORY SEQUENCE — repeat the growing color pattern */
  micro({
    id: "memseqGame", title: "Memory Sequence", desc: "Repeat the growing color pattern", cat: "brain", key: "memseq", win: 3, hud: false,
    controls: "Watch the pattern flash, then click the colors in order. P1 then P2 alternate.",
    round(g) {
      g.seq = []; g.showing = 0; g.idx = 0; g.turn = 0;
      g.colors = ["#ff5878", "#63f59a", "#64eaff", "#ffe66d", "#c07aff", "#ff9a4a"];
      g.msg.textContent = "P1'S TURN — WATCH…";
      g.pad = [0, 1, 2, 3, 4, 5].map(i => ({ x: 250 + (i % 3) * 140, y: 120 + Math.floor(i / 3) * 140, c: g.colors[i] }));
      g.seq.push(ri(0, 5)); g.flash = 0; g.flashIdx = 0;
    },
    update(g, dt) {
      if (g.flash > 0) { g.flash -= dt; if (g.flash <= 0 && g.flashIdx < g.seq.length) { g.flash = .5; g.flashIdx++; } }
      else if (g.showing === 0 && g.flashIdx < g.seq.length) { g.flash = .5; g.flashIdx++; }
      else if (g.showing === 0 && g.flashIdx >= g.seq.length) { g.showing = 1; g.idx = 0; g.msg.textContent = `P${g.turn + 1}'S TURN — REPEAT!`; }
    },
    click(g, x, y) {
      if (g.showing !== 1) return;
      for (let i = 0; i < 6; i++) {
        const p = g.pad[i];
        if (dist({ x, y }, p) < 55) {
          if (i === g.seq[g.idx]) {
            g.idx++; FX.tone(500 + i * 100, .08, "square", .05);
            if (g.idx >= g.seq.length) { g.add(g.turn, "P" + (g.turn + 1) + " NAILS IT!"); g.mode = "between"; g.timer = 1.4; }
          } else { g.end(1 - g.turn); g.banner_("WRONG ORDER!", RED, 1.4); }
          break;
        }
      }
    },
    draw(g, ctx) {
      ctx.fillStyle = "#101636"; ctx.fillRect(0, 0, W, H);
      g.pad.forEach((p, i) => {
        const lit = (g.flash > 0 && g.seq[g.flashIdx] === i);
        ctx.fillStyle = lit ? "#fff" : p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, 52, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#080b18"; ctx.lineWidth = 4; ctx.stroke();
      });
      g.text("SEQUENCE LENGTH " + g.seq.length, W / 2, 60, 20, "#fff", "center");
      g.text(g.showing === 0 ? "WATCH…" : "YOUR TURN", W / 2, 90, 16, GOLD, "center");
    }
  });

  /* 5. SLIDE DUEL — push the puck into their goal */
  micro({
    id: "slideduelGame", title: "Slide Duel", desc: "Flick the puck into their goal", cat: "sports", key: "slideduel", win: 3,
    controls: "P1: WASD move　 P2: ARROWS move — bump the puck into the goal on your right",
    round(g) {
      g.pl = [mkp(200, 250, C1, 20), mkp(700, 250, C2, 20)];
      g.puck = { x: 450, y: 250, vx: 0, vy: 0, r: 12 };
      g.goals = [{ x: 10, y: 200, h: 100 }, { x: 890, y: 200, h: 100 }];
    },
    update(g, dt) {
      g.pl.forEach((p, i) => {
        g.walk(p, i, 240, { x0: p.r, x1: W - p.r, y0: p.r + 40, y1: H - p.r });
      });
      g.puck.x += g.puck.vx * dt; g.puck.y += g.puck.vy * dt;
      g.puck.vx *= .995; g.puck.vy *= .995;
      if (g.puck.x < g.puck.r || g.puck.x > W - g.puck.r) g.puck.vx *= -1, g.puck.x = cl(g.puck.x, g.puck.r, W - g.puck.r);
      if (g.puck.y < g.puck.r || g.puck.y > H - g.puck.r) g.puck.vy *= -1, g.puck.y = cl(g.puck.y, g.puck.r, H - g.puck.r);
      const [a, b] = g.pl;
      [a, b].forEach(p => {
        const d = dist(p, g.puck);
        if (d < p.r + g.puck.r) {
          const nx = (g.puck.x - p.x) / d, ny = (g.puck.y - p.y) / d;
          g.puck.vx = nx * 380; g.puck.vy = ny * 380;
          g.puck.x = p.x + nx * (p.r + g.puck.r); g.puck.y = p.y + ny * (p.r + g.puck.r);
          FX.playBounce && FX.playBounce();
        }
      });
      if (g.puck.x < 20 && g.puck.y > 200 && g.puck.y < 300) g.point(1, "P2 SCORES!");
      if (g.puck.x > 880 && g.puck.y > 200 && g.puck.y < 300) g.point(0, "P1 SCORES!");
    },
    draw(g, ctx) {
      g.floor("#12203a", "#16264a");
      ctx.fillStyle = col(0); ctx.fillRect(0, 200, 10, 100);
      ctx.fillStyle = col(1); ctx.fillRect(890, 200, 10, 100);
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(g.puck.x, g.puck.y, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#080b18"; ctx.lineWidth = 3; ctx.stroke();
      g.pl.forEach((p, i) => g.blob(p, col(i)));
    }
  });

  /* 6. TRIVIA RACE — answer trivia to advance your runner */
  micro({
    id: "triviaraceGame", title: "Trivia Race", desc: "Answer right to dash forward", cat: "brain", key: "triviarace", win: 3, hud: false,
    controls: "Press 1-4 to answer. Correct = your runner dashes. First to the flag wins.",
    round(g) {
      const QS = [
        ["What is 7 × 8?", ["54", "56", "48", "64"], 1],
        ["Largest planet?", ["Mars", "Saturn", "Jupiter", "Venus"], 2],
        ["H₂O is…", ["Oxygen", "Water", "Salt", "Gold"], 1],
        ["Speed of light ≈", ["300,000 km/s", "150 km/h", "9.8 m/s", "60 mph"], 0],
        ["Who painted Mona Lisa?", ["Van Gogh", "Da Vinci", "Picasso", "Rembrandt"], 1],
        ["Capital of Japan?", ["Osaka", "Kyoto", "Tokyo", "Seoul"], 2],
        ["9² = ?", ["81", "72", "99", "18"], 0],
        ["Spider has legs:", ["6", "8", "10", "4"], 1],
        ["Boiling point of water:", ["50°C", "100°C", "150°C", "200°C"], 1],
        ["Largest ocean:", ["Atlantic", "Indian", "Arctic", "Pacific"], 3],
        ["Mount Everest is in…", ["Andes", "Alps", "Himalayas", "Rockies"], 2],
        ["Gold element symbol:", ["Au", "Ag", "Go", "Gd"], 0],
      ];
      g.qs = QS.sort(() => Math.random() - .5); g.qi = 0;
      g.pos = [0, 0]; g.cur = g.qs[g.qi]; g.msg.textContent = "P1: PRESS 1-4";
      g.turn = 0; g.lock = false;
    },
    update(g, dt) { },
    key(g, k) {
      if (g.lock) return;
      const n = parseInt(k);
      if (isNaN(n) || n < 1 || n > 4) return;
      if (g.turn !== 0) return;
      g.lock = true;
      const ok = (n - 1) === g.cur[2];
      if (ok) { g.pos[0] += 12; g.burst(100 + g.pos[0] * 4, 180, GOLD, 10); FX.playScore && FX.playScore(); }
      else g.banner_("WRONG!", RED, .8);
      setTimeout(() => {
        g.turn = 1; g.lock = false; g.msg.textContent = "P2: PRESS 1-4";
      }, 700);
    },
    click(g, x, y) { },
    draw(g, ctx) {
      ctx.fillStyle = "#0e1430"; ctx.fillRect(0, 0, W, H);
      // track
      [0, 1].forEach(i => {
        const y = 200 + i * 120;
        ctx.fillStyle = "rgba(255,255,255,.05)"; ctx.fillRect(60, y, 780, 70);
        ctx.fillStyle = col(i); ctx.beginPath(); ctx.arc(80 + g.pos[i] * 7, y + 35, 16, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = GOLD; ctx.fillRect(840, 180, 6, 240);
      // question
      if (g.cur) {
        g.text(g.cur[0], W / 2, 80, 22, "#fff", "center");
        g.cur[1].forEach((c, i) => g.text((i + 1) + ". " + c, 300, 420 + i * 0, 14, "#9fc0ff", "left"));
        g.cur[1].forEach((c, i) => {
          const bx = 180 + (i % 2) * 290, by = 430 + Math.floor(i / 2) * 36;
          g.text((i + 1) + ". " + c, bx, by, 15, "#c8e0ff", "left");
        });
      }
      g.text(g.turn === 0 ? "P1'S ANSWER (1-4)" : "P2'S ANSWER (1-4)", W / 2, 120, 16, col(g.turn), "center");
    }
  });

  /* 7. STACK THE RING — drop rings on your pole, tallest wins */
  micro({
    id: "stackringGame", title: "Ring Toss", desc: "Toss rings on your pole to score", cat: "reflex", key: "stackring", win: 5,
    controls: "P1: SPACE to drop　 P2: ENTER to drop — time it right",
    round(g) {
      g.rings = [[], []];
      g.armX = 450; g.dir = 1; g.speed = 260;
      g.ring = { x: 450, y: 40 };
      g.turn = ri(0, 1);
      g.msg.textContent = "P" + (g.turn + 1) + "'S TOSS";
    },
    update(g, dt) {
      g.ring.x += g.dir * g.speed * dt;
      if (g.ring.x > 870 || g.ring.x < 30) { g.dir *= -1; g.ring.x = cl(g.ring.x, 30, 870); }
      const I = g.I[g.turn];
      if (I.pa || I.pa === undefined) { }
      if (g.I[g.turn].pa) {
        // drop ring onto closest pole
        const poles = [{ x: 150, i: 0 }, { x: 750, i: 1 }];
        let bi = 0, bd = Infinity;
        poles.forEach((p, idx) => { const d = Math.abs(p.x - g.ring.x); if (d < bd) { bd = d; bi = idx; } });
        if (bd < 70) {
          const h = 40 + g.rings[bi].length * 16;
          g.rings[bi].push({ x: poles[bi].x, y: H - 40 - h });
          FX.tone(400 + g.rings[bi].length * 40, .09, "triangle", .05);
          if (g.rings[bi].length >= 5) { g.end(bi); }
          else { g.mode = "between"; g.timer = 1; g.banner_("P" + (bi + 1) + " +1", col(bi), .9); }
        } else {
          g.banner_("MISS!", RED, .7); g.mode = "between"; g.timer = .8;
        }
        g.turn = 1 - g.turn; g.ring.x = 450; g.msg.textContent = "P" + (g.turn + 1) + "'S TOSS";
      }
    },
    draw(g, ctx) {
      ctx.fillStyle = "#16123a"; ctx.fillRect(0, 0, W, H);
      [150, 750].forEach((x, i) => {
        ctx.fillStyle = "#3a2a18"; ctx.fillRect(x - 6, 80, 12, H - 120);
        g.rings[i].forEach((r, k) => { ctx.fillStyle = col(i); ctx.fillRect(x - 28, r.y, 56, 12); ctx.strokeStyle = "#080b18"; ctx.strokeRect(x - 28, r.y, 56, 12); });
      });
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(g.ring.x, g.ring.y, 16, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.stroke();
      g.text("P1 " + g.score[0], 20, 30, 22, C1); g.text("P2 " + g.score[1], W - 20, 30, 22, C2, "right");
    }
  });

  /* 8. MATH DUEL — solve the equation fastest */
  micro({
    id: "mathduelGame", title: "Math Duel", desc: "Solve equations — first to answer wins", cat: "brain", key: "mathduel", win: 5, hud: false,
    controls: "P1: type answer + ENTER　 P2: type answer + ENTER — fastest correct answer scores",
    round(g) {
      const a = ri(2, 12), b = ri(2, 12);
      g.ops = ["+", "-", "×"][ri(0, 2)];
      g.ans = g.ops === "+" ? a + b : g.ops === "-" ? a - b : a * b;
      g.q = `${a} ${g.ops} ${b} = ?`;
      g.i1 = ""; g.i2 = ""; g.lock = [false, false];
      g.msg.textContent = g.q;
    },
    update(g, dt) { },
    draw(g, ctx) {
      ctx.fillStyle = "#10162e"; ctx.fillRect(0, 0, W, H);
      ctx.font = "bold 48px Courier New"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
      ctx.fillText(g.q, W / 2, 140);
      ctx.font = "bold 22px Courier New";
      ctx.fillStyle = C1; ctx.fillText("P1: " + (g.i1 || "_"), 250, 300);
      ctx.fillStyle = C2; ctx.fillText("P2: " + (g.i2 || "_"), 650, 300);
      ctx.textAlign = "left";
    }
  });

  /* 9. BULL RUSH — charge through, knock the other off the platform */
  micro({
    id: "bullrushGame", title: "Bull Rush", desc: "Charge to knock your rival off", cat: "action", key: "bullrush", win: 3,
    controls: "P1: A/D + SPACE charge　 P2: ←/→ + ENTER charge",
    round(g) {
      g.pl = [{ x: 250, vx: 0, charge: 0, kx: 0 }, { x: 650, vx: 0, charge: 0, kx: 0 }];
      g.pl.forEach(p => p.fx = 1);
    },
    update(g, dt) {
      g.pl.forEach((p, i) => {
        const I = g.I[i];
        p.x += (I.r ? 1 : 0) * 200 * dt - (I.l ? 1 : 0) * 200 * dt;
        p.x += p.kx * dt; p.kx *= .92;
        p.cd = Math.max(0, (p.cd || 0) - dt);
        if (I.pa && p.cd <= 0) { p.cd = 1.2; p.kx = (i ? -1 : 1) * 520; FX.tone(220, .12, "sawtooth", .05); }
        p.x = cl(p.x, 40, W - 40);
      });
      const [a, b] = g.pl, d = Math.abs(a.x - b.x);
      if (d < 40) {
        const overlap = (40 - d) / 2;
        if (a.x < b.x) { a.x -= overlap; b.x += overlap; } else { a.x += overlap; b.x -= overlap; }
        if (Math.abs(a.kx) > Math.abs(b.kx)) { b.kx += a.kx * .4; }
        else { a.kx += b.kx * .4; }
        FX.playHitSound && FX.playHitSound();
      }
      g.pl.forEach((p, i) => {
        if (p.x < 45 || p.x > W - 45) { g.end(1 - i); g.burst(p.x, 250, col(i), 20); }
      });
    },
    draw(g, ctx) {
      ctx.fillStyle = "#1a1030"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#2a1a48"; ctx.fillRect(30, 300, W - 60, 80);
      ctx.fillStyle = "#0a0618"; ctx.fillRect(0, 380, W, 120);
      g.pl.forEach((p, i) => {
        ctx.fillStyle = col(i); ctx.beginPath(); ctx.arc(p.x, 270, 22, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#080b18"; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.fillRect(p.x - 8, 258, 16, 6);
      });
      g.text("KNOCK THEM OFF!", W / 2, 60, 20, "#fff", "center");
    }
  });

  /* 10. BALLOON ASCENT — pump your balloon higher than theirs */
  micro({
    id: "balloonascGame", title: "Balloon Ascent", desc: "Pump to rise — don't overinflate!", cat: "reflex", key: "balloonasc", win: 1, hud: false,
    controls: "P1: mash SPACE　 P2: mash ENTER — first balloon to the top (don't pop!)",
    round(g) {
      g.pl = [{ h: 0, size: 20, boom: false }, { h: 0, size: 20, boom: false }];
      g.time = 20;
    },
    update(g, dt) {
      g.time -= dt;
      g.pl.forEach((p, i) => {
        const I = g.I[i];
        if (I.pa) { p.h += 55 * dt; p.size += 8 * dt; }
        else { p.h += 12 * dt; p.size = Math.max(20, p.size - 3 * dt); }
        if (p.size > 58) { p.boom = true; g.end(1 - i); g.burst(i ? 700 : 200, H - 60 - p.h, col(i), 24); }
      });
      if (g.time <= 0 && !g.pl[0].boom && !g.pl[1].boom) {
        g.end(g.pl[0].h === g.pl[1].h ? -1 : (g.pl[0].h > g.pl[1].h ? 0 : 1));
      }
    },
    draw(g, ctx) {
      ctx.fillStyle = "#12204a"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,.05)"; for (let y = 0; y < H; y += 50)ctx.fillRect(0, y, W, 1);
      g.pl.forEach((p, i) => {
        if (p.boom) return;
        const x = i ? 700 : 200, y = H - 60 - p.h;
        ctx.fillStyle = col(i); ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#080b18"; ctx.lineWidth = 3; ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.beginPath(); ctx.moveTo(x, y + p.size); ctx.lineTo(x, y + p.size + 40); ctx.stroke();
      });
      g.text("P1 " + Math.round(g.pl[0].h), 20, 30, 22, C1);
      g.text("P2 " + Math.round(g.pl[1].h), W - 20, 30, 22, C2, "right");
      g.text(Math.ceil(g.time) + "s", W / 2, 32, 28, GOLD, "center");
    }
  });

  /* 11. FISHING FRENZY — catch the most fish in 30s */
  micro({
    id: "fishfrenzyGame", title: "Fishing Frenzy", desc: "Catch more fish than your rival", cat: "arcade", key: "fishfrenzy", win: 1, hud: false,
    controls: "P1: SPACE drop hook　 P2: ENTER drop hook — most fish in 30s wins",
    round(g) {
      g.time = 30; g.fish = []; g.hooks = [{ x: 200, y: 80, down: false, catch: null }, { x: 700, y: 80, down: false, catch: null }];
      g.spawn = 0; g.s = [0, 0];
    },
    update(g, dt) {
      g.time -= dt; g.spawn -= dt;
      if (g.spawn <= 0) { g.spawn = 1.1; g.fish.push({ x: ri(40, 860), y: ri(320, 460), vx: (Math.random() < .5 ? -1 : 1) * rnd(30, 80), ph: rnd(0, 6) }); }
      g.fish.forEach(f => { f.x += f.vx * dt; if (f.x < 20 || f.x > 880) f.vx *= -1; });
      g.hooks.forEach((h, i) => {
        if (g.I[i].pa && !h.down && !h.catch) { h.down = true; FX.tone(300, .08, "sine", .04); }
        if (h.down) {
          h.y += 260 * dt;
          if (!h.catch) { for (const f of g.fish) { if (Math.abs(f.x - h.x) < 20 && Math.abs(f.y - h.y) < 20) { h.catch = f; h.fy = f.vx; break; } } }
          else { h.catch.x = h.x; h.catch.y = h.y - 10; h.catch.vx = 0; }
          if (h.y >= 470 || h.catch && h.y <= 100) {
            if (h.catch) {
              g.s[i]++; g.burst(h.x, h.y, GOLD, 10); FX.playScore && FX.playScore();
              g.fish = g.fish.filter(f => f !== h.catch);
            }
            h.y = 80; h.down = false; h.catch = null;
          }
        }
      });
      if (g.time <= 0) g.byScore(g.s);
    },
    draw(g, ctx) {
      ctx.fillStyle = "#0a2a4a"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#0a1a30"; ctx.fillRect(0, 80, W, 20);
      g.fish.forEach(f => {
        ctx.fillStyle = "#ff9a4a"; ctx.beginPath(); ctx.ellipse(f.x, f.y, 14, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#080b18"; ctx.fillRect(f.x + (f.vx > 0 ? -14 : -18), f.y - 4, 6, 8);
      });
      g.hooks.forEach((h, i) => {
        ctx.strokeStyle = "#c8c8d8"; ctx.beginPath(); ctx.moveTo(h.x, 80); ctx.lineTo(h.x, h.y); ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(h.x, h.y, 5, 0, Math.PI * 2); ctx.fill();
      });
      g.timedHud(g.s, g.time);
    }
  });

  /* 12. DODGE CUBE — dodge the falling blocks */
  micro({
    id: "dodgecubeGame", title: "Dodge Cube", desc: "Dodge falling cubes — last one standing", cat: "reflex", key: "dodgecube", win: 3,
    controls: "P1: A/D　 P2: ←/→ — don't get hit by the cubes",
    round(g) {
      g.pl = [mkp(300, 450, C1, 14), mkp(600, 450, C2, 14)];
      g.cubes = []; g.spawn = 0;
    },
    update(g, dt) {
      g.pl.forEach((p, i) => g.walk(p, i, 260, { x0: p.r, x1: W - p.r, y0: H - 60, y1: H - 20 }));
      g.spawn -= dt;
      if (g.spawn <= 0) { g.spawn = Math.max(.18, .7 - g.t * .03); g.cubes.push({ x: ri(20, 880), y: -20, s: ri(14, 26), v: rnd(160, 340), c: ["#ff5878", "#ffe66d", "#63f59a", "#c07aff"][ri(0, 3)] }); }
      g.cubes.forEach(c => { c.y += c.v * dt; });
      g.cubes = g.cubes.filter(c => c.y < H + 40);
      g.pl.forEach((p, i) => {
        for (const c of g.cubes) {
          if (Math.abs(c.x - p.x) < c.s / 2 + p.r && Math.abs(c.y - p.y) < c.s / 2 + p.r) {
            g.end(1 - i); g.burst(p.x, p.y, col(i), 20); FX.playBoom && FX.playBoom(); return;
          }
        }
      });
    },
    draw(g, ctx) {
      ctx.fillStyle = "#0e0a20"; ctx.fillRect(0, 0, W, H);
      g.cubes.forEach(c => { ctx.fillStyle = c.c; ctx.fillRect(c.x - c.s / 2, c.y - c.s / 2, c.s, c.s); ctx.strokeStyle = "#080b18"; ctx.strokeRect(c.x - c.s / 2, c.y - c.s / 2, c.s, c.s); });
      g.pl.forEach((p, i) => g.blob(p, col(i)));
    }
  });

  /* 13. COPY THAT — Simon-says but with shapes */
  micro({
    id: "copythatGame", title: "Copy That", desc: "Repeat the shape sequence", cat: "brain", key: "copythat", win: 3, hud: false,
    controls: "Watch the shapes light up, then click them in the same order.",
    round(g) {
      g.shapes = [{ x: 200, y: 250, s: "circle" }, { x: 450, y: 250, s: "square" }, { x: 700, y: 250, s: "triangle" }];
      g.seq = [ri(0, 2)]; g.showing = 0; g.idx = 0; g.flash = 0; g.fi = 0;
      g.msg.textContent = "WATCH…";
    },
    update(g, dt) {
      if (g.showing === 0) {
        if (g.flash <= 0 && g.fi < g.seq.length) { g.flash = .6; g.flashI = g.seq[g.fi]; g.fi++; g.flash = .6; }
        else if (g.flash > 0) { g.flash -= dt; if (g.flash <= 0) g.flashI = -1; }
        else { g.showing = 1; g.idx = 0; g.msg.textContent = "YOUR TURN — COPY IT!"; }
      }
    },
    click(g, x, y) {
      if (g.showing !== 1) return;
      g.shapes.forEach((s, i) => {
        if (dist({ x, y }, s) < 70) {
          if (i === g.seq[g.idx]) {
            g.idx++; FX.tone(500 + i * 120, .09, "square", .05);
            if (g.idx >= g.seq.length) { g.add(0, "NICE!"); g.mode = "between"; g.timer = 1.3; }
          } else { g.end(1); g.banner_("MISMATCH!", RED, 1.4); }
        }
      });
    },
    draw(g, ctx) {
      ctx.fillStyle = "#101636"; ctx.fillRect(0, 0, W, H);
      g.shapes.forEach((s, i) => {
        const lit = g.flash > 0 && g.flashI === i;
        ctx.fillStyle = lit ? "#fff" : col(i % 2);
        ctx.beginPath();
        if (s.s === "circle") ctx.arc(s.x, s.y, 56, 0, Math.PI * 2);
        else if (s.s === "square") ctx.rect(s.x - 52, s.y - 52, 104, 104);
        else { ctx.moveTo(s.x, s.y - 60); ctx.lineTo(s.x + 58, s.y + 48); ctx.lineTo(s.x - 58, s.y + 48); ctx.closePath(); }
        ctx.fill(); ctx.strokeStyle = "#080b18"; ctx.lineWidth = 4; ctx.stroke();
      });
      g.text("SEQ " + g.seq.length, W / 2, 70, 20, "#fff", "center");
    }
  });

  /* 14. LASER MAZE — guide your beam to hit the target */
  micro({
    id: "lasermazeGame", title: "Laser Maze", desc: "Bounce your laser to hit the target", cat: "brain", key: "lasermaze", win: 3, hud: false,
    controls: "Click a mirror to rotate it. Get your beam to hit the crystal first.",
    round(g) {
      g.mirrors = [{ x: 450, y: 200, a: 0 }, { x: 450, y: 350, a: 0 }];
      g.crystal = { x: 780, y: 250 };
      g.emit = { x: 120, y: 250, a: 0 };
      g.turn = 0; g.won = false;
      g.msg.textContent = "P1: CLICK A MIRROR TO ROTATE";
    },
    update(g, dt) { },
    click(g, x, y) {
      for (const m of g.mirrors) {
        if (dist({ x, y }, m) < 40) { m.a += Math.PI / 4; FX.tone(600, .06, "sine", .04); break; }
      }
      // trace beam
      let px = g.emit.x, py = g.emit.y, a = g.emit.a, hit = false;
      for (let step = 0; step < 40 && !hit; step++) {
        px += Math.cos(a) * 20; py += Math.sin(a) * 20;
        for (const m of g.mirrors) {
          if (Math.abs(px - m.x) < 20 && Math.abs(py - m.y) < 20) { a = m.a * 2 - a; a += Math.PI; break; }
        }
        if (dist({ x: px, y: py }, g.crystal) < 24) { hit = true; g.end(g.turn); g.burst(g.crystal.x, g.crystal.y, GOLD, 20); }
        if (px < 0 || px > W || py < 0 || py > H) break;
      }
      g.beam = { px, py, a, hit };
      g.turn = 1 - g.turn; g.msg.textContent = `P${g.turn + 1}: CLICK A MIRROR`;
    },
    draw(g, ctx) {
      ctx.fillStyle = "#0a0e24"; ctx.fillRect(0, 0, W, H);
      if (g.beam) {
        ctx.strokeStyle = "#ff4a6a"; ctx.lineWidth = 3; ctx.beginPath();
        ctx.moveTo(g.emit.x, g.emit.y);
        let px = g.emit.x, py = g.emit.y, a = g.emit.a;
        for (let step = 0; step < 40; step++) {
          px += Math.cos(a) * 20; py += Math.sin(a) * 20;
          ctx.lineTo(px, py);
          let bounced = false;
          for (const m of g.mirrors) { if (Math.abs(px - m.x) < 20 && Math.abs(py - m.y) < 20) { a = m.a * 2 - a + Math.PI; bounced = true; break; } }
          if (dist({ x: px, y: py }, g.crystal) < 24 || !bounced && (px < 0 || px > W || py < 0 || py > H)) break;
        }
        ctx.stroke();
      }
      g.mirrors.forEach(m => {
        ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.a);
        ctx.fillStyle = "#c8e0ff"; ctx.fillRect(-24, -3, 48, 6); ctx.restore();
      });
      ctx.fillStyle = "#63f59a"; ctx.save(); ctx.translate(g.crystal.x, g.crystal.y); ctx.rotate(Math.PI / 4); ctx.fillRect(-16, -16, 32, 32); ctx.restore();
      ctx.fillStyle = "#64eaff"; ctx.beginPath(); ctx.arc(g.emit.x, g.emit.y, 10, 0, Math.PI * 2); ctx.fill();
    }
  });

  /* 15. SHEEP HERD 2 — herd more sheep into your pen */
  micro({
    id: "sheepherdGame", title: "Sheep Herd", desc: "Herd more sheep into your pen", cat: "arcade", key: "sheepherd", win: 1, hud: false,
    controls: "P1: WASD　 P2: ARROWS — push sheep into your side's pen",
    round(g) {
      g.time = 30; g.sheep = []; g.s = [0, 0];
      for (let i = 0; i < 10; i++)g.sheep.push({ x: rnd(300, 600), y: rnd(100, 400), vx: 0, vy: 0 });
      g.pl = [mkp(150, 250, C1, 18), mkp(750, 250, C2, 18)];
    },
    update(g, dt) {
      g.time -= dt;
      g.pl.forEach((p, i) => g.walk(p, i, 220));
      g.sheep.forEach(s => {
        // flee from nearest player
        let nd = Infinity, np = null;
        g.pl.forEach(p => { const d = dist(p, s); if (d < nd) { nd = d; np = p; } });
        if (nd < 120) { const f = (120 - nd) / 120 * 140; s.vx += (s.x - np.x) / nd * f; s.vy += (s.y - np.y) / nd * f; }
        s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= .94; s.vy *= .94;
        s.x = cl(s.x, 20, W - 20); s.y = cl(s.y, 60, H - 20);
        if (s.x < 130 && s.y > 180 && s.y < 320) { if (!s.pen) { s.pen = 0; g.s[0]++; FX.tone(700, .08, "triangle", .04); } }
        else if (s.x > 770 && s.y > 180 && s.y < 320) { if (!s.pen) { s.pen = 1; g.s[1]++; FX.tone(700, .08, "triangle", .04); } }
      });
      if (g.time <= 0) g.byScore(g.s);
    },
    draw(g, ctx) {
      g.floor("#1a2a1a", "#20321f");
      ctx.strokeStyle = GOLD; ctx.lineWidth = 4;
      ctx.strokeRect(40, 180, 90, 140); ctx.strokeRect(770, 180, 90, 140);
      g.sheep.forEach(s => {
        ctx.fillStyle = "#f0f0f0"; ctx.beginPath(); ctx.arc(s.x, s.y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#2a2a2a"; ctx.beginPath(); ctx.arc(s.x + 6, s.y - 3, 4, 0, Math.PI * 2); ctx.fill();
      });
      g.pl.forEach((p, i) => g.blob(p, col(i)));
      g.timedHud(g.s, g.time);
    }
  });

  /* 16. NUMBER HUNT — click numbers in ascending order, faster wins */
  micro({
    id: "numhuntGame", title: "Number Hunt", desc: "Click numbers 1-20 in order, fastest wins", cat: "brain", key: "numhunt", win: 1, hud: false,
    controls: "Click numbers in order 1→20. Fastest total time wins the round.",
    round(g) {
      g.nums = []; for (let i = 1; i <= 10; i++)g.nums.push({ n: i, x: rnd(60, 840), y: rnd(80, 460), found: false });
      g.next = 1; g.time = 0; g.turn = ri(0, 1);
      g.msg.textContent = "P" + (g.turn + 1) + "'S TURN — CLICK 1 FIRST";
      g.done = false;
    },
    update(g, dt) { if (!g.done) g.time += dt; },
    click(g, x, y) {
      if (g.done) return;
      for (const n of g.nums) {
        if (!n.found && dist({ x, y }, n) < 26) {
          if (n.n === g.next) {
            n.found = true; g.next++; FX.tone(500 + n.n * 30, .07, "square", .04);
            if (g.next > 10) {
              g.done = true;
              g.times[g.turn] = g.time;
              if (g.times[1 - g.turn] !== undefined) { g.end(g.times[0] < g.times[1] ? 0 : 1); }
              else { g.mode = "between"; g.timer = 1.4; g.banner_("P" + (g.turn + 1) + ": " + g.time.toFixed(1) + "s", col(g.turn), 1.3); }
            }
          } else { g.banner_("ORDER!", RED, .7); }
          break;
        }
      }
    },
    draw(g, ctx) {
      ctx.fillStyle = "#141a3a"; ctx.fillRect(0, 0, W, H);
      g.nums.forEach(n => {
        if (n.found) return;
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(n.x, n.y, 20, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#080b18"; ctx.font = "bold 18px Courier New"; ctx.textAlign = "center";
        ctx.fillText(n.n, n.x, n.y + 6); ctx.textAlign = "left";
      });
      g.text("TIME " + g.time.toFixed(1) + "s", W / 2, 40, 22, GOLD, "center");
      g.text("FIND " + g.next, W / 2, 70, 16, "#9fc0ff", "center");
      if (g.times) g.text("P1 " + (g.times[0] !== undefined ? g.times[0].toFixed(1) + "s" : "—") + "  P2 " + (g.times[1] !== undefined ? g.times[1].toFixed(1) + "s" : "—"), W / 2, 100, 14, "#9fc0ff", "center");
    }
  });

  /* 17. FIGHTING PIXELS — best-of health bars brawl */
  micro({
    id: "pixelfightGame", title: "Pixel Fighters", desc: "Punch, kick, win the brawl", cat: "action", key: "pixelfight", win: 1, hud: false,
    controls: "P1: A/D move, SPACE punch　 P2: ←/→ move, ENTER punch — best of 3 rounds",
    round(g) {
      g.pl = [{ x: 250, hp: 100, cd: 0, anim: 0 }, { x: 650, hp: 100, cd: 0, anim: 0 }];
      g.round = 1;
    },
    update(g, dt) {
      g.pl.forEach((p, i) => {
        const I = g.I[i];
        p.x += ((I.r ? 1 : 0) - (I.l ? 1 : 0)) * 180 * dt; p.x = cl(p.x, 60, W - 60);
        p.cd = Math.max(0, p.cd - dt); p.anim = Math.max(0, p.anim - dt * 4);
        if (I.pa && p.cd <= 0) {
          p.cd = .55; p.anim = 1;
          const foe = g.pl[1 - i];
          if (Math.abs(p.x - foe.x) < 70) {
            foe.hp -= 12; g.burst(foe.x, 240, col(i), 10); FX.playHitSound && FX.playHitSound();
            if (foe.hp <= 0) { g.end(i); g.banner_("P" + (i + 1) + " K.O.!", col(i), 1.5); }
          }
        }
      });
    },
    draw(g, ctx) {
      ctx.fillStyle = "#1a1230"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#2a1a48"; ctx.fillRect(0, 340, W, 160);
      g.pl.forEach((p, i) => {
        ctx.fillStyle = col(i); ctx.fillRect(p.x - 20, 200 - (p.anim ? 10 : 0), 40, 120);
        ctx.fillStyle = "#fff"; ctx.fillRect(p.x - 8, 220 - (p.anim ? 10 : 0), 16, 10);
        // health bar
        ctx.fillStyle = "#40204a"; ctx.fillRect(i ? 520 : 80, 40, 300, 20);
        ctx.fillStyle = col(i); ctx.fillRect(i ? 520 : 80, 40, 300 * p.hp / 100, 20);
      });
      g.text("KNOCK OUT!", W / 2, 80, 18, "#fff", "center");
    }
  });

  /* 18. BUBBLE LINE — shoot bubbles, match 3 colors */
  micro({
    id: "bubblelineGame", title: "Bubble Line", desc: "Shoot and match 3 bubbles", cat: "arcade", key: "bubbleline", win: 3,
    controls: "P1: A/D + SPACE　 P2: ←/→ + ENTER — pop matching bubble rows",
    round(g) {
      g.aim = 0; g.bub = { color: ["#ff5878", "#64eaff", "#63f59a", "#ffe66d"][ri(0, 3)] };
      g.row = []; for (let i = 0; i < 8; i++)g.row.push({ color: ["#ff5878", "#64eaff", "#63f59a", "#ffe66d"][ri(0, 3)] });
      g.flying = null;
    },
    update(g, dt) {
      const I = g.I[0];
      if (I.l) g.aim -= 1.6 * dt; if (I.r) g.aim += 1.6 * dt; g.aim = cl(g.aim, -1.2, 1.2);
      if (g.flying) {
        g.flying.y -= 420 * dt; g.flying.x += g.flying.vx * dt;
        if (g.flying.y < 80) {
          // find nearest matching
          let bi = 0, bd = Infinity;
          g.row.forEach((b, i) => { const d = Math.abs(b.x - g.flying.x); if (d < bd) { bd = d; bi = i; } });
          if (g.row[bi] && g.row[bi].color === g.flying.color) {
            g.row.splice(bi, 1); g.burst(g.flying.x, g.flying.y, g.flying.color, 14); FX.playScore && FX.playScore(); g.add(0);
          } else {
            g.row.push({ x: g.flying.x, color: g.flying.color });
          }
          g.flying = null; g.bub = { color: ["#ff5878", "#64eaff", "#63f59a", "#ffe66d"][ri(0, 3)] };
          if (g.row.length >= 12) g.end(1);
        }
      } else if (I.pa) {
        g.flying = { x: W / 2, y: H - 60, vx: Math.sin(g.aim) * 380, color: g.bub.color };
        FX.playShoot && FX.playShoot();
      }
    },
    draw(g, ctx) {
      ctx.fillStyle = "#0e1430"; ctx.fillRect(0, 0, W, H);
      g.row.forEach((b, i) => { ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(120 + i * 80, 120, 24, 0, Math.PI * 2); ctx.fill(); });
      if (g.flying) { ctx.fillStyle = g.flying.color; ctx.beginPath(); ctx.arc(g.flying.x, g.flying.y, 22, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(W / 2, H - 60, 22, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2, H - 60); ctx.lineTo(W / 2 + Math.sin(g.aim) * 90, H - 60 - Math.cos(g.aim) * 90); ctx.stroke();
      g.text("MATCH THE COLORS — DON'T FILL THE ROW", W / 2, 40, 14, "#9fc0ff", "center");
    }
  });

  /* 19. ROPE SWING 2 — swing and jump further */
  micro({
    id: "ropeswing2Game", title: "Rope Swing", desc: "Swing and release to fly further", cat: "reflex", key: "ropeswing2", win: 3, hud: false,
    controls: "P1: SPACE grab/release　 P2: ENTER — furthest flight wins the round",
    round(g) {
      g.phase = "swing"; g.a = -2.2; g.va = 0; g.x = 100; g.y = 200; g.flying = false; g.turn = 0; g.times = [];
    },
    update(g, dt) {
      if (g.phase === "swing") {
        g.va += (-Math.cos(g.a) * 6 - g.va * .3) * dt * 8; g.a += g.va * dt;
        if (g.I[g.turn].pa) { g.phase = "fly"; g.vx = -Math.sin(g.a) * 420; g.vy = -Math.cos(g.a) * 420; FX.tone(600, .08, "sine", .04); }
      } else {
        g.vy += 600 * dt; g.x += g.vx * dt; g.y += g.vy * dt;
        if (g.y >= 450) {
          const dist = Math.round((g.x - 100) / 10);
          g.score[g.turn] = Math.max(g.score[g.turn] || 0, 0);
          g.banner_("P" + (g.turn + 1) + ": " + dist + "m", col(g.turn), 1.2);
          g.turn = 1 - g.turn;
          if (g.times.length >= 2 || g.times[g.turn] !== undefined) { }
          g.mode = "between"; g.timer = 1.4; g.phase = "swing"; g.a = -2.2; g.x = 100; g.y = 200;
          if (g.turn === 0) { g.times = []; }
          g.times.push(dist);
          if (g.times.length >= 2) { g.end(g.times[0] > g.times[1] ? 0 : 1); g.times = []; }
        }
      }
    },
    draw(g, ctx) {
      ctx.fillStyle = "#141a3a"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#2a3260"; ctx.fillRect(0, 450, W, 50);
      ctx.strokeStyle = "#8a6a3a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(450, 0); ctx.lineTo(450 + Math.sin(g.a) * 160, 200 + Math.cos(g.a) * 160); ctx.stroke();
      ctx.fillStyle = col(g.turn); ctx.beginPath(); ctx.arc(g.x, g.y, 14, 0, Math.PI * 2); ctx.fill();
      g.text("P" + (g.turn + 1) + " SWINGING", W / 2, 50, 18, col(g.turn), "center");
      if (g.times[0] !== undefined) g.text("P1: " + g.times[0] + "m", 80, 80, 16, C1);
    }
  });

  /* 20. TOWER DEFENSE DUEL — spawn units to breach their wall */
  micro({
    id: "towerduelGame", title: "Tower Defense Duel", desc: "Send troops to break their wall", cat: "action", key: "towerduel", win: 1, hud: false,
    controls: "P1: SPACE spawn runner　 P2: ENTER — breach the enemy wall before they breach yours",
    round(g) {
      g.units = [[], []]; g.hp = [100, 100]; g.spawnCd = [0, 0]; g.time = 0;
    },
    update(g, dt) {
      g.time += dt;
      g.pl = [{}, {}];
      for (let p = 0; p < 2; p++) {
        g.spawnCd[p] = Math.max(0, g.spawnCd[p] - dt);
        if (g.I[p].pa && g.spawnCd[p] <= 0) {
          g.spawnCd[p] = 1.1;
          g.units[p].push({ x: p ? 860 : 40, y: ri(120, 420), v: (p ? -1 : 1) * rnd(70, 110), hp: 3 }); FX.tone(300 + p * 100, .07, "square", .04);
        }
      }
      g.units.forEach((arr, p) => arr.forEach(u => {
        u.x += u.v * dt;
        const foeWall = p ? 60 : W - 60;
        if ((p && u.x < foeWall) || (!p && u.x > foeWall)) {
          g.hp[1 - p] -= 8; u.hp = 0; g.burst(u.x, u.y, RED, 10); FX.playBoom && FX.playBoom();
          if (g.hp[1 - p] <= 0) g.end(p);
        }
      }));
      g.units.forEach((arr, p) => {
        // enemy units fight
        const foe = g.units[1 - p];
        arr.forEach(u => {
          foe.forEach(e => {
            if (Math.abs(u.x - e.x) < 20 && Math.abs(u.y - e.y) < 20 && u.hp > 0 && e.hp > 0) { u.hp--; e.hp--; }
          });
        });
        g.units[p] = arr.filter(u => u.hp > 0);
      });
    },
    draw(g, ctx) {
      ctx.fillStyle = "#10182e"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = col(0); ctx.fillRect(50, 100, 20, 300);
      ctx.fillStyle = col(1); ctx.fillRect(830, 100, 20, 300);
      g.units.forEach((arr, p) => arr.forEach(u => { ctx.fillStyle = col(p); ctx.fillRect(u.x - 8, u.y - 8, 16, 16); }));
      // hp bars
      ctx.fillStyle = "#40204a"; ctx.fillRect(60, 60, 300, 16); ctx.fillRect(540, 60, 300, 16);
      ctx.fillStyle = C1; ctx.fillRect(60, 60, 300 * g.hp[0] / 100, 16);
      ctx.fillStyle = C2; ctx.fillRect(540, 60, 300 * g.hp[1] / 100, 16);
      g.text("BREACH THEIR WALL", W / 2, 40, 14, "#9fc0ff", "center");
    }
  });

  /* 21. TYPE RACER 2 — typing duel */
  micro({
    id: "typeracer2Game", title: "Type Racer", desc: "Type the phrase faster", cat: "brain", key: "typeracer2", win: 3, hud: false,
    controls: "Type the shown phrase, press ENTER. Fastest correct time scores.",
    round(g) {
      const PH = ["pixel duel arcade", "neon lights forever", "retro games rule", "high score chase", "joystick warrior"];
      g.ph = PH[ri(0, PH.length - 1)]; g.i = ""; g.turn = ri(0, 1); g.times = [];
      g.msg.textContent = "P" + (g.turn + 1) + ": TYPE THE PHRASE + ENTER";
    },
    update(g, dt) { },
    draw(g, ctx) {
      ctx.fillStyle = "#10162e"; ctx.fillRect(0, 0, W, H);
      ctx.font = "bold 30px Courier New"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
      ctx.fillText(g.ph.toUpperCase(), W / 2, 180);
      ctx.font = "bold 22px Courier New"; ctx.fillStyle = col(g.turn);
      ctx.fillText((g.i || "_").toUpperCase(), W / 2, 260);
      ctx.font = "15px Courier New"; ctx.fillStyle = "#9fc0ff";
      if (g.times[0] !== undefined) ctx.fillText("P1 " + g.times[0].toFixed(1) + "s", 300, 340);
      if (g.times[1] !== undefined) ctx.fillText("P2 " + g.times[1].toFixed(1) + "s", 600, 340);
      ctx.textAlign = "left";
    }
  });

  /* 22. MAGNET PULL — drag the ball with alternating polarity */
  micro({
    id: "magnetpullGame", title: "Magnet Pull", desc: "Magnetize the ball to your goal", cat: "action", key: "magnetpull", win: 3,
    controls: "P1: hold SPACE to attract　 P2: hold ENTER — pull the ball into your goal",
    round(g) {
      g.ball = { x: 450, y: 250, vx: 0, vy: 0 };
      g.goals = [{ x: 60, y: 250 }, { x: 840, y: 250 }];
    },
    update(g, dt) {
      [0, 1].forEach(i => {
        const I = g.I[i], G = g.goals[i];
        if (I.a) {
          const d = dist(G, g.ball);
          if (d > 30) { g.ball.vx += (G.x - g.ball.x) / d * 280 * dt; g.ball.vy += (G.y - g.ball.y) / d * 280 * dt; }
        }
      });
      g.ball.x += g.ball.vx * dt; g.ball.y += g.ball.vy * dt;
      g.ball.vx *= .99; g.ball.vy *= .99;
      if (g.ball.x < 20) g.point(1, "P2 SCORES!");
      if (g.ball.x > 880) g.point(0, "P1 SCORES!");
      if (g.ball.y < 20 || g.ball.y > 480) g.ball.vy *= -1, g.ball.y = cl(g.ball.y, 20, 480);
    },
    draw(g, ctx) {
      ctx.fillStyle = "#0e1a2e"; ctx.fillRect(0, 0, W, H);
      g.goals.forEach((G, i) => { ctx.fillStyle = col(i); ctx.fillRect(G.x - 14, G.y - 50, 28, 100); });
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(g.ball.x, g.ball.y, 14, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#080b18"; ctx.lineWidth = 3; ctx.stroke();
      g.text("PULL THE BALL TO YOUR GOAL", W / 2, 40, 14, "#9fc0ff", "center");
    }
  });

  /* 23. COLOR RUSH — click your color's tiles fastest */
  micro({
    id: "colorrushGame", title: "Color Rush", desc: "Click your color tiles fast", cat: "reflex", key: "colorrush", win: 1, hud: false,
    controls: "P1 clicks CYAN tiles, P2 clicks PINK tiles — most in 25s wins",
    round(g) {
      g.time = 25; g.tiles = []; g.s = [0, 0];
      for (let i = 0; i < 12; i++)g.tiles.push({ x: rnd(60, 840), y: rnd(80, 460), p: ri(0, 1), live: true, ph: rnd(0, 6) });
    },
    update(g, dt) {
      g.time -= dt;
      g.tiles.forEach(t => { t.ph += dt * 3; t.y += Math.sin(t.ph) * .4; });
      if (g.time <= 0) g.byScore(g.s);
    },
    click(g, x, y) {
      for (const t of g.tiles) {
        if (t.live && dist({ x, y }, t) < 30) {
          // P1 clicks cyan (0), P2 clicks pink (1) — alternate turns based on click parity? simpler: whoever's turn
          t.live = false;
          g.s[t.p]++; g.burst(t.x, t.y, col(t.p), 8);
          FX.tone(600 + t.p * 200, .06, "square", .04);
          setTimeout(() => { t.live = true; t.x = rnd(60, 840); t.y = rnd(80, 460); }, 900);
          break;
        }
      }
    },
    draw(g, ctx) {
      ctx.fillStyle = "#10162e"; ctx.fillRect(0, 0, W, H);
      g.tiles.forEach(t => {
        if (!t.live) return;
        ctx.fillStyle = col(t.p); ctx.beginPath(); ctx.arc(t.x, t.y, 24, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#080b18"; ctx.lineWidth = 3; ctx.stroke();
      });
      g.timedHud(g.s, g.time);
    }
  });

  /* 24. BALANCE BRIDGE — stack blocks on a moving platform */
  micro({
    id: "balancebridgeGame", title: "Balance Bridge", desc: "Stack blocks without toppling", cat: "reflex", key: "balancebridge", win: 1, hud: false,
    controls: "P1: SPACE to drop　 P2: ENTER — tallest stable tower wins",
    round(g) {
      g.blocks = [[], []];
      g.craneX = 450; g.dir = 1; g.turn = 0; g.dropping = false; g.dropY = { 0: 400, 1: 400 }; g.speed = 240;
      g.msg.textContent = "P" + (g.turn + 1) + "'S DROP";
    },
    update(g, dt) {
      g.craneX += g.dir * g.speed * dt;
      if (g.craneX > 860 || g.craneX < 40) { g.dir *= -1; g.craneX = cl(g.craneX, 40, 860); }
      if (g.I[g.turn].pa && !g.dropping) {
        g.dropping = true; g.dy = 60; g.dx = g.craneX;
      }
      if (g.dropping) {
        g.dy += 380 * dt;
        const px = g.turn ? 700 : 200, groundY = 400 - g.blocks[g.turn].length * 24;
        if (g.dy >= groundY - 12) {
          const off = Math.abs(g.dx - px);
          if (off < 50) {
            g.blocks[g.turn].push({ x: g.dx, off }); FX.tone(300 + g.blocks[g.turn].length * 40, .08, "triangle", .05);
            if (g.blocks[g.turn].length >= 8) { g.end(g.turn); g.banner_("TOWER COMPLETE!", col(g.turn), 1.5); }
          } else {
            g.banner_("MISSED THE BASE!", RED, .8); g.mode = "between"; g.timer = .9;
          }
          g.dropping = false; g.turn = 1 - g.turn; g.msg.textContent = "P" + (g.turn + 1) + "'S DROP";
        }
      }
    },
    draw(g, ctx) {
      ctx.fillStyle = "#12183a"; ctx.fillRect(0, 0, W, H);
      [200, 700].forEach((px, i) => {
        ctx.fillStyle = "#2a3260"; ctx.fillRect(px - 40, 400, 80, 60);
        g.blocks[i].forEach((b, k) => { ctx.fillStyle = col(i); ctx.fillRect(b.x - 25, 400 - (k + 1) * 24, 50, 20); ctx.strokeStyle = "#080b18"; ctx.strokeRect(b.x - 25, 400 - (k + 1) * 24, 50, 20); });
      });
      ctx.fillStyle = "#fff"; ctx.fillRect(g.craneX - 4, 50, 8, 20);
      ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.beginPath(); ctx.moveTo(g.craneX, 70); ctx.lineTo(g.dropping ? g.dx : g.craneX, g.dropping ? g.dy : 100); ctx.stroke();
      if (g.dropping) { ctx.fillStyle = col(g.turn); ctx.fillRect(g.dx - 25, g.dy - 10, 50, 20); }
      g.text("P1 H" + g.blocks[0].length, 20, 30, 20, C1); g.text("P2 H" + g.blocks[1].length, W - 20, 30, 20, C2, "right");
    }
  });

})();
