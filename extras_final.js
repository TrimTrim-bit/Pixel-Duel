/* =====================================================
   EXTRAS — game exclusion for random/party, daily/weekly
   rewards, calendar, house decorator, solo arcade,
   co-op levels. Each screen opens as a .screen section.
   ===================================================== */
(function () {
  "use strict";
  console.log("[EXTRAS_V6] top of file");
  if (window.__PDX_EXTRAS__) return; window.__PDX_EXTRAS__ = true;
  console.log("[EXTRAS_V6] flag set, continuing");

  /* ---------- sidebar toggle ---------- */
  window.toggleDock = function () {
    const sb = document.getElementById("dockSidebar");
    const ov = document.getElementById("dockOverlay");
    if (!sb) return;
    const open = sb.classList.toggle("open");
    if (ov) ov.style.display = open ? "block" : "none";
  };

  /* ---------- hover-to-open: sliding the mouse to the left edge
     opens the sidebar; leaving it closes. Buttons keep their inline
     onclick (toggleShop/openCinema/...) — we only ADD a close-after
     action via addEventListener so we never clobber inline handlers.
     Only active on menu-ish screens, so gameplay is never interrupted
     by an accidental edge-hover mid-match. ---------- */
  (function () {
    const sb = document.getElementById("dockSidebar");
    if (!sb) return;
    // invisible hover trigger strip along the left edge
    const strip = document.createElement("div");
    strip.id = "dockHoverStrip";
    strip.style.cssText = "position:fixed;left:0;top:0;bottom:0;width:18px;z-index:8998;background:transparent;";
    document.body.appendChild(strip);
    let closeTimer = null;
    const GAME_LIKE = /^(pong|duel|tug|bread|hockey|bomb|dodge|sumo|snake|basket|volley|mem|react|race|platform|connect|ttt|tank|space|potato)/;
    const onGameScreen = () => {
      const act = document.querySelector(".screen.active");
      return act && GAME_LIKE.test(act.id) && act.id !== "menu";
    };
    const openSidebar = () => {
      if (onGameScreen()) return;             // don't hijack the edge mid-game
      clearTimeout(closeTimer);
      if (!sb.classList.contains("open")) window.toggleDock();
    };
    const closeSidebar = () => {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        if (sb.classList.contains("open") && !sb.matches(":hover")) window.toggleDock();
      }, 260);
    };
    strip.addEventListener("mouseenter", openSidebar);
    sb.addEventListener("mouseenter", openSidebar);
    sb.addEventListener("mouseleave", closeSidebar);
    strip.addEventListener("mouseleave", closeSidebar);
    // after any sidebar button's inline onclick runs, close the sidebar
    // AND any modal overlays (settings/shop panels) left open underneath
    sb.querySelectorAll(".sidebar-btn").forEach(b => {
      b.addEventListener("click", () => {
        const sp = document.getElementById("settingsPanel");
        if (sp) sp.classList.remove("open");
        const shp = document.getElementById("shopPanel");
        if (shp) shp.classList.remove("open");
        setTimeout(() => { if (sb.classList.contains("open")) window.toggleDock(); }, 160);
      });
    });
  })();

  function prof() { const p = window.PDX_PROFILE || {}; p.excludedGames = p.excludedGames || []; return p; }
  function save() { window.PDX_SAVE && window.PDX_SAVE(); }
  function mkScreen(id, title) {
    let sec = document.getElementById(id);
    if (sec) { sec.classList.add("active"); if (window.activeScreen !== undefined) window.activeScreen = id; return sec; }
    sec = document.createElement("section");
    sec.id = id; sec.className = "screen";
    sec.style.cssText = "min-height:100vh;padding:20px;";
    document.body.insertBefore(sec, document.querySelector(".touch-pad") || document.body.firstChild);
    sec.innerHTML = `<button class="back" onclick="showMenu()">MENU</button><h1 style="text-align:center;font-size:clamp(22px,4vw,34px);color:var(--accent);margin:0 0 6px;">${title}</h1>`;
    document.querySelectorAll(".screen.active").forEach(s => { if (s !== sec) s.classList.remove("active"); });
    sec.classList.add("active");
    if (window.activeScreen !== undefined) window.activeScreen = id;
    return sec;
  }

  /* ================== GAME EXCLUSION ================== */
  window.PDX_EXCLUDED = () => prof().excludedGames;
  window.PDX_TOGGLE_EXCLUDE = function (id) {
    const p = prof();
    const i = p.excludedGames.indexOf(id);
    if (i >= 0) p.excludedGames.splice(i, 1); else p.excludedGames.push(id);
    save();
    return p.excludedGames.includes(id);
  };
  /* patch randomGame to skip excluded */
  addEventListener("load", () => {
    if (window.randomGame && !window.__rndPatched) {
      window.__rndPatched = true;
      const orig = window.randomGame;
      window.randomGame = function () {
        const ex = prof().excludedGames;
        const pool = (window.PDX_CATALOG || []).filter(g => !ex.includes(g.id) && g.id !== (window.__lastRandom || ""));
        if (!pool.length) return;
        const pick = pool[Math.floor(Math.random() * pool.length)];
        window.__lastRandom = pick.id;
        window.openGame(pick.id);
      };
    }
    /* hook startParty's nextPartyGame to skip excluded */
    const pi = setInterval(() => {
      if (window.PARTY_POOL && window.party && !window.__partyPatched) {
        window.__partyPatched = true;
        clearInterval(pi);
        const origNext = window.nextPartyGame || (() => { });
        window.nextPartyGame = function () {
          const ex = prof().excludedGames;
          const pool = PARTY_POOL.filter(g => !ex.includes(g) && g !== party.last);
          if (!pool.length) return;
          const id = pool[Math.floor(Math.random() * pool.length)];
          party.last = id; party.pending = false;
          window.openGame(id);
        };
      }
    }, 1000);
  });

  /* ================== CALENDAR + DAILY/WEEKLY REWARDS ================== */
  function claimKey(kind) {
    const d = new Date();
    return kind + "-" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }
  window.openCalendar = function () {
    const sec = mkScreen("calendarScreen", "📅 CALENDAR & REWARDS");
    const p = prof();
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth();
    const first = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();
    const claimedDaily = p.lastDailyDate === new Date().toDateString();
    const claimedWeekly = p.lastWeeklyWeek === (Math.floor(Date.now() / (7 * 864e5)));
    let monthlyRewards = 0;
    let calHtml = "<div style='display:grid;grid-template-columns:repeat(7,1fr);gap:4px;max-width:420px;margin:10px auto;'>";
    calHtml += "<div style='text-align:center;color:#9fc0ff;font-size:11px'>SUN</div><div style='text-align:center;color:#9fc0ff;font-size:11px'>MON</div><div style='text-align:center;color:#9fc0ff;font-size:11px'>TUE</div><div style='text-align:center;color:#9fc0ff;font-size:11px'>WED</div><div style='text-align:center;color:#9fc0ff;font-size:11px'>THU</div><div style='text-align:center;color:#9fc0ff;font-size:11px'>FRI</div><div style='text-align:center;color:#9fc0ff;font-size:11px'>SAT</div>";
    for (let i = 0; i < first; i++)calHtml += "<div></div>";
    for (let d = 1; d <= days; d++) {
      const isToday = d === today;
      const bg = isToday ? "#2a5a3a" : "#141a3a";
      const border = isToday ? "#63f59a" : "#2a3260";
      calHtml += `<div style='background:${bg};border:1px solid ${border};border-radius:6px;padding:6px 2px;text-align:center;font-size:12px;color:${isToday ? "#63f59a" : "#9fc0ff"};min-height:32px'>${d}</div>`;
    }
    calHtml += "</div>";
    sec.insertAdjacentHTML("beforeend", `
    <div style="max-width:600px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
      <div style="background:#141a3a;border:2px solid #3a4a8a;padding:16px;border-radius:10px;">
        <h3 style="color:#ffe66d;margin:0 0 10px;">⭐ ${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month]} ${year}</h3>
        ${calHtml}
      </div>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button id="claimDaily" style="padding:12px 24px;background:${claimedDaily ? "#1a2a1a" : "#2a5a3a"};border:2px solid ${claimedDaily ? "#2a4a2a" : "#63f59a"};color:${claimedDaily ? "#4a7a4a" : "#63f59a"};font-family:'Courier New',monospace;font-weight:bold;cursor:${claimedDaily ? "default" : "pointer"};border-radius:10px;font-size:14px;">
          ${claimedDaily ? "✓ DAILY CLAIMED" : "🎁 CLAIM DAILY (+5 🪙)"}
        </button>
        <button id="claimWeekly" style="padding:12px 24px;background:${claimedWeekly ? "#1a1a2a" : "#1a2a5a"};border:2px solid ${claimedWeekly ? "#2a2a4a" : "#64b5f6"};color:${claimedWeekly ? "#4a5a7a" : "#64b5f6"};font-family:'Courier New',monospace;font-weight:bold;cursor:${claimedWeekly ? "default" : "pointer"};border-radius:10px;font-size:14px;">
          ${claimedWeekly ? "✓ WEEKLY CLAIMED" : "🏆 CLAIM WEEKLY (+30 🪙)"}
        </button>
      </div>
    </div>`);
    sec.querySelector("#claimDaily").addEventListener("click", () => {
      if (claimedDaily) return;
      p.lastDailyDate = new Date().toDateString();
      window.PDX_ADD_COINS && window.PDX_ADD_COINS(5);
      window.showToast && showToast("Daily reward claimed!");
      window.PDX_SAVE && window.PDX_SAVE();
      window.openCalendar();
    });
    sec.querySelector("#claimWeekly").addEventListener("click", () => {
      if (claimedWeekly) return;
      p.lastWeeklyWeek = Math.floor(Date.now() / (7 * 864e5));
      window.PDX_ADD_COINS && window.PDX_ADD_COINS(30);
      window.showToast && showToast("Weekly reward claimed!");
      window.PDX_SAVE && window.PDX_SAVE();
      window.openCalendar();
    });
  };

  /* ================== SOLO ARCADE ================== */
  const SOLO_GAMES = [
    { id: "solo_frogger", name: "FROGGER", desc: "Cross the road, avoid cars", cat: "action", key: "frogger" },
    { id: "solo_tetris", name: "TETRIS", desc: "Stack blocks, clear lines", cat: "puzzle", key: "tetris" },
    { id: "solo_invaders", name: "SPACE INVADERS", desc: "Defend against alien waves", cat: "shooter", key: "invaders" },
    { id: "solo_snake", name: "CLASSIC SNAKE", desc: "Eat, grow, don't crash", cat: "arcade", key: "solosnake" },
    { id: "solo_asteroids", name: "ASTEROIDS", desc: "Blast rocks in space", cat: "shooter", key: "solostds" },
    { id: "solo_breakout", name: "BREAKOUT", desc: "Smash all the bricks", cat: "paddle", key: "breakout" },
    { id: "solo_flappy", name: "FLAPPY PIXEL", desc: "Tap through gaps", cat: "reflex", key: "flappy" },
    { id: "solo_runner", name: "ENDLESS RUNNER", desc: "Jump obstacles, keep going", cat: "runner", key: "runner" },
    { id: "solo_miner", name: "DEEP MINER", desc: "Dig down, collect gems", cat: "digger", key: "miner" },
    { id: "solo_shooter", name: "DODGE & SHOOT", desc: "Dodge bullets, return fire", cat: "shooter", key: "dodgeshoot" },
    { id: "solo_paddle", name: "SUPER PONG", desc: "Paddle vs the machine", cat: "paddle", key: "solopong" },
    { id: "solo_jump", name: "SKY HOPPER", desc: "Climb as high as you can", cat: "climber", key: "skyhop" }
  ];
  const soloScores = {};
  window.openSolo = function () {
    const sec = mkScreen("soloScreen", "🕹️ SOLO ARCADE");
    let html = "<div class='shop-grid' style='display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;max-width:1000px;margin:16px auto;'>";
    SOLO_GAMES.forEach(g => {
      const hs = localStorage.getItem("solo_hs_" + g.key) || 0;
      html += `<div class="shop-item" style="cursor:pointer;" onclick="launchSolo('${g.key}','${g.name}')">
      <div class="name">${g.name}</div><div class="desc">${g.desc}</div>
      <div class="price" style="color:#63f59a;">BEST: ${hs}</div></div>`;
    });
    html += "</div><p style='text-align:center;color:#6a7a99;font-size:11px;margin-top:8px;'>High scores saved automatically. Games work with arrow keys / WASD.</p>";
    sec.insertAdjacentHTML("beforeend", html);
  };
  window.launchSolo = function (key, name) {
    const sec = mkScreen("soloGameScreen", name.toUpperCase());
    sec.insertAdjacentHTML("beforeend", `<canvas id="soloCv" width="900" height="500" style="display:block;margin:8px auto;background:#0a0f24;border:3px solid #2a3260;border-radius:8px;"></canvas><div id="soloHud" style="text-align:center;color:#9fc0ff;font-family:'Courier New',monospace;font-size:14px;"></div>`);
    const cv = sec.querySelector("#soloCv"), ctx = cv.getContext("2d");
    const hud = sec.querySelector("#soloHud");
    let score = 0, alive = true, raf = null, gameOver = false;
    const keys = {};
    const kh = e => { keys[e.key.toLowerCase()] = true; };
    const ku = e => { keys[e.key.toLowerCase()] = false; };
    addEventListener("keydown", kh); addEventListener("keyup", ku);
    const cleanup = () => { cancelAnimationFrame(raf); removeEventListener("keydown", kh); removeEventListener("keyup", ku); };
    // observer: when menu is clicked, clean up
    const backBtn = sec.querySelector(".back");
    const origOnclick = backBtn.onclick;
    backBtn.addEventListener("click", cleanup, { once: true });

    /* generic mini-game framework with several solo game types */
    const W = 900, H = 500;
    let px = 450, py = 400, vy = 0, grounded = true, objs = [], spawnT = 0, frame = 0, dx = 0, dy = 0;
    let paddleX = 400, ballX = 450, ballY = 250, ballVX = 4, ballVY = -4, bricks = [], invaderT = 0, invDir = 1, invY = 80;
    let snakeBody = [{ x: 14, y: 12 }], snakeDir = { x: 1, y: 0 }, snakeFood = { x: 20, y: 10 };
    const CS = 22;
    let flapV = 0, pipeX = 900, pipeGapY = 200, pipes = [];
    let blocks = [], tetX = 4, tetY = 0, tetT = 0, tetShape = 0, tetRot = 0;
    let invX = 200;
    let runnerH = 0;
    let minerY = 100, minerX = 450, gems = [], minerVy = 0;
    let dodgeX = 450, dodgeBullets = [], dodgeShots = [], dodgeSpawnT = 0;
    let soloPongPaddle = 400, soloPongBall = { x: 450, y: 250, vx: 5, vy: -3 };
    let hopY = 400, hopVY = 0, hopPlat = [];

    function saveHS() { const hs = localStorage.getItem("solo_hs_" + key) || 0; if (score > hs) localStorage.setItem("solo_hs_" + key, score); }
    function die() { alive = false; saveHS(); }
    function resetGame() { score = 0; alive = true; objs = []; px = 450; py = 400; vy = 0; grounded = true; paddleX = 400; ballX = 450; ballY = 250; ballVX = 4; ballVY = -4; bricks = []; for (let r = 0; r < 5; r++)for (let c = 0; c < 12; c++)bricks.push({ x: c * 70 + 15, y: r * 24 + 40, alive: true }); snakeBody = [{ x: 14, y: 12 }]; snakeDir = { x: 1, y: 0 }; flapV = 0; pipes = []; blocks = []; tetX = 4; tetY = 0; gems = []; dodgeBullets = []; dodgeShots = []; dodgeX = 450; hopY = 400; hopVY = 0; hopPlat = []; for (let i = 0; i < 8; i++)hopPlat.push({ x: Math.random() * 700 + 100, y: 400 - i * 55, w: 80 + Math.random() * 60 }); soloPongPaddle = 400; soloPongBall = { x: 450, y: 250, vx: 5, vy: -3 }; invX = 200; invY = 80; invDir = 1; minerY = 100; minerX = 450; gems = []; dodgeSpawnT = 0; }

    function gameLoop() {
      raf = requestAnimationFrame(gameLoop);
      if (!alive) { drawEnd(); return; }
      frame++;
      update(); draw();
    }
    function drawEnd() {
      ctx.fillStyle = "rgba(8,11,24,.88)"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ffe66d"; ctx.font = "bold 36px Courier New"; ctx.textAlign = "center";
      ctx.fillText("GAME OVER", 450, 220);
      ctx.fillStyle = "#e0e8ff"; ctx.font = "18px Courier New";
      ctx.fillText("Score: " + score, 450, 260);
      ctx.fillStyle = "#9fc0ff"; ctx.font = "14px Courier New";
      ctx.fillText("Press SPACE to retry · MENU to go back", 450, 300);
      ctx.textAlign = "left";
      hud.textContent = name + " — Score: " + score;
      addEventListener("keydown", function retry(e) {
        if (!alive && e.key === " ") { e.preventDefault(); alive = true; score = 0; resetGame(); removeEventListener("keydown", retry); }
      });
    }
    function update() {
      switch (key) {
        case "frogger":
          if (keys["arrowleft"] || keys["a"]) px -= 5;
          if (keys["arrowright"] || keys["d"]) px += 5;
          if (keys["arrowup"] || keys["w"]) { py -= 40; if (py < 40) py = 40; }
          px = Math.max(20, Math.min(W - 20, px));
          spawnT--; if (spawnT <= 0) { spawnT = 60; objs.push({ x: -60, y: Math.floor(Math.random() * 4) * 80 + 100, vx: 2 + Math.random() * 3 }); }
          objs.forEach(o => { o.x += o.vx * 3; });
          objs = objs.filter(o => o.x < W + 100);
          objs.forEach(o => { if (o.y === py && Math.abs(o.x - px) < 40) die(); });
          if (py < 40) { score += 10; py = 400; }
          break;
        case "tetris":
          tetT++; if (tetT > 20) { tetT = 0; tetY++; }
          if (tetY * 30 > H - 30) { score += Math.floor(Math.random() * 10); tetY = 0; tetX = Math.floor(Math.random() * 15); }
          if (keys["arrowleft"] || keys["a"]) tetX = Math.max(0, tetX - 1);
          if (keys["arrowright"] || keys["d"]) tetX = Math.min(19, tetX + 1);
          break;
        case "invaders":
          if (keys["arrowleft"] || keys["a"]) px -= 6;
          if (keys["arrowright"] || keys["d"]) px += 6;
          px = Math.max(20, Math.min(W - 20, px));
          invaderT++;
          invX += invDir * 1.5;
          if (invX > W - 150 || invX < 50) { invDir *= -1; invY += 15; }
          if (invY > H - 60) die();
          if (invaderT % 30 === 0 && Math.random() < .5) dodgeBullets.push({ x: px + Math.random() * 600 - 300, y: invY + 40 });
          dodgeBullets.forEach(b => { b.y += 4; if (Math.abs(b.x - px) < 20 && Math.abs(b.y - py) < 20) die(); });
          dodgeBullets = dodgeBullets.filter(b => b.y < H + 20);
          if (keys[" "] && frame % 15 === 0) dodgeShots.push({ x: px, y: py - 20 });
          dodgeShots.forEach(s2 => { s2.y -= 8; if (s2.y < invY + 20 && Math.abs(s2.x - invX) < 100) { score += 5; } });
          dodgeShots = dodgeShots.filter(s2 => s2.y > 0);
          break;
        case "solosnake": {
          let nd = { ...snakeDir };
          if (keys["arrowup"] || keys["w"]) nd = { x: 0, y: -1 };
          if (keys["arrowdown"] || keys["s"]) nd = { x: 0, y: 1 };
          if (keys["arrowleft"] || keys["a"]) nd = { x: -1, y: 0 };
          if (keys["arrowright"] || keys["d"]) nd = { x: 1, y: 0 };
          if (!(nd.x === -snakeDir.x && nd.y === -snakeDir.y)) snakeDir = nd;
          const head = { x: snakeBody[0].x + snakeDir.x, y: snakeBody[0].y + snakeDir.y };
          if (head.x < 0 || head.x * CS > W || head.y < 0 || head.y * CS > H || snakeBody.some(s2 => s2.x === head.x && s2.y === head.y)) { die(); break; }
          snakeBody.unshift(head);
          if (head.x === snakeFood.x && head.y === snakeFood.y) { score += 10; snakeFood = { x: Math.floor(Math.random() * (W / CS)), y: Math.floor(Math.random() * (H / CS)) }; }
          else snakeBody.pop();
          break;
        }
        case "solostds":
          if (keys["arrowleft"] || keys["a"]) px -= 6;
          if (keys["arrowright"] || keys["d"]) px += 6;
          px = Math.max(20, Math.min(W - 20, px));
          if (keys[" "] && frame % 12 === 0) dodgeShots.push({ x: px, y: py - 20 });
          dodgeShots.forEach(s2 => { s2.y -= 9; });
          dodgeShots = dodgeShots.filter(s2 => s2.y > 0);
          spawnT--; if (spawnT <= 0) { spawnT = 80; objs.push({ x: Math.random() * (W - 60) + 30, y: -30, vy: 1 + Math.random() * 2, r: 14 + Math.random() * 14 }); }
          objs.forEach(o => { o.y += o.vy * 2; });
          objs = objs.filter(o => o.y < H + 40);
          objs.forEach(o => { if (Math.hypot(o.x - px, o.y - py) < o.r + 14) die(); });
          dodgeShots.forEach(s2 => { objs.forEach(o => { if (Math.hypot(s2.x - o.x, s2.y - o.y) < o.r + 6) { o.dead = true; score += 5; } }); });
          objs = objs.filter(o => !o.dead);
          break;
        case "breakout":
          if (keys["arrowleft"] || keys["a"]) paddleX -= 8;
          if (keys["arrowright"] || keys["d"]) paddleX += 8;
          paddleX = Math.max(0, Math.min(W - 100, paddleX));
          ballX += ballVX; ballY += ballVY;
          if (ballX < 10 || ballX > W - 10) ballVX *= -1;
          if (ballY < 10) ballVY *= -1;
          if (ballY > H - 20) die();
          if (ballY > H - 40 && Math.abs(ballX - paddleX - 50) < 60 && ballVY > 0) { ballVY *= -1; ballVX = (ballX - paddleX - 50) / 15; }
          bricks.forEach(b => { if (b.alive && ballX > b.x && ballX < b.x + 60 && ballY > b.y && ballY < b.y + 18) { b.alive = false; ballVY *= -1; score += 10; } });
          bricks = bricks.filter(b => b.alive);
          if (!bricks.length) { score += 100; for (let r = 0; r < 5; r++)for (let c = 0; c < 12; c++)bricks.push({ x: c * 70 + 15, y: r * 24 + 40, alive: true }); }
          break;
        case "flappy":
          flapV += .5; py += flapV;
          if (keys[" "] && frame % 20 === 0) { flapV = -8; }
          if (py > H || py < 0) { die(); break; }
          spawnT--; if (spawnT <= 0) { spawnT = 90; pipes.push({ x: W, y: Math.random() * (H - 180) + 60, gap: 140 }); }
          pipes.forEach(p2 => { p2.x -= 3; });
          pipes = pipes.filter(p2 => p2.x > -60);
          pipes.forEach(p2 => {
            if (px > p2.x - 20 && px < p2.x + 40 && (py < p2.y || py > p2.y + p2.gap)) die();
            if (!p2.scored && p2.x + 40 < px) { p2.scored = true; score += 5; }
          });
          break;
        case "runner":
          vy += .6; py += vy;
          if (py >= 400) { py = 400; vy = 0; grounded = true; }
          if ((keys[" "] || keys["arrowup"] || keys["w"]) && grounded) { vy = -13; grounded = false; }
          spawnT--; if (spawnT <= 0) { spawnT = 60 + Math.random() * 50; objs.push({ x: W, y: 400, w: 20 + Math.random() * 20, h: 30 + Math.random() * 40 }); }
          objs.forEach(o => { o.x -= 5; });
          objs = objs.filter(o => o.x > -40);
          objs.forEach(o => { if (px + 14 > o.x && px < o.x + o.w && py > o.y - o.h + 40 - 40) die(); });
          score++;
          break;
        case "miner":
          if (keys["arrowleft"] || keys["a"]) minerX -= 4;
          if (keys["arrowright"] || keys["d"]) minerX += 4;
          if (keys["arrowdown"] || keys["s"]) minerY += 3;
          if (keys["arrowup"] || keys["w"]) minerY -= 2;
          minerX = Math.max(20, Math.min(W - 20, minerX)); minerY = Math.max(60, Math.min(H - 20, minerY));
          spawnT--; if (spawnT <= 0) { spawnT = 100; gems.push({ x: Math.random() * (W - 60) + 30, y: Math.random() * (H - 100) + 80 }); }
          gems.forEach(g => { if (Math.hypot(g.x - minerX, g.y - minerY) < 20) { g.got = true; score += 15; } });
          gems = gems.filter(g => !g.got);
          if (gems.length < 4) gems.push({ x: Math.random() * (W - 60) + 30, y: Math.random() * (H - 100) + 80 });
          break;
        case "dodgeshoot":
          if (keys["arrowleft"] || keys["a"]) dodgeX -= 6;
          if (keys["arrowright"] || keys["d"]) dodgeX += 6;
          if (keys["arrowup"] || keys["w"]) dodgeX += 0;
          dodgeX = Math.max(20, Math.min(W - 20, dodgeX));
          dodgeSpawnT--; if (dodgeSpawnT <= 0) { dodgeSpawnT = 50; dodgeBullets.push({ x: Math.random() * W, y: -10, vy: 3 + Math.random() * 3 }); }
          dodgeBullets.forEach(b => { b.y += b.vy; });
          dodgeBullets = dodgeBullets.filter(b => b.y < H + 20);
          dodgeBullets.forEach(b => { if (Math.abs(b.x - dodgeX) < 16 && Math.abs(b.y - 420) < 16) die(); });
          if (keys[" "] && frame % 10 === 0) dodgeShots.push({ x: dodgeX, y: 410 });
          dodgeShots.forEach(s2 => { s2.y -= 10; });
          dodgeShots = dodgeShots.filter(s2 => s2.y > 0);
          if (frame % 30 === 0) score += 2;
          break;
        case "solopong":
          if (keys["arrowleft"] || keys["a"]) soloPongPaddle -= 7;
          if (keys["arrowright"] || keys["d"]) soloPongPaddle += 7;
          soloPongPaddle = Math.max(0, Math.min(W - 100, soloPongPaddle));
          soloPongBall.x += soloPongBall.vx; soloPongBall.y += soloPongBall.vy;
          if (soloPongBall.x < 10 || soloPongBall.x > W - 10) soloPongBall.vx *= -1;
          if (soloPongBall.y < 10) soloPongBall.vy *= -1;
          if (soloPongBall.y > H - 15) { score = Math.max(0, score - 1); soloPongBall.y = 250; soloPongBall.x = 450; }
          if (soloPongBall.y > H - 40 && Math.abs(soloPongBall.x - soloPongPaddle - 50) < 55 && soloPongBall.vy > 0) { soloPongBall.vy *= -1; soloPongBall.vx = (soloPongBall.x - soloPongPaddle - 50) / 12; score += 1; }
          break;
        case "skyhop":
          hopVY += .5; hopY += hopVY;
          if (keys["arrowleft"] || keys["a"]) px -= 4;
          if (keys["arrowright"] || keys["d"]) px += 4;
          px = Math.max(10, Math.min(W - 10, px));
          if (hopY > H) { die(); break; }
          hopPlat.forEach(p2 => {
            if (hopVY > 0 && Math.abs(px - p2.x - p2.w / 2) < p2.w / 2 + 12 && Math.abs(hopY - p2.y) < 10 && hopY < p2.y) { hopY = p2.y; hopVY = -10; score += 5; }
          });
          if (hopY < 0) { score += 50; hopY = 400; hopVY = 0; hopPlat = []; for (let i = 0; i < 8; i++)hopPlat.push({ x: Math.random() * 700 + 100, y: 400 - i * 55, w: 80 + Math.random() * 60 }); }
          break;
      }
      if (key !== "solosnake" && key !== "tetris" && key !== "skyhop") score += 1;
      hud.textContent = name + " — Score: " + score;
    }
    function draw() {
      ctx.fillStyle = "#0a0f24"; ctx.fillRect(0, 0, W, H);
      if (key === "frogger") {
        ctx.fillStyle = "#141a3a"; ctx.fillRect(0, 60, W, 320);
        ctx.fillStyle = "#0a3a1a"; ctx.fillRect(0, 0, W, 60);
        objs.forEach(o => { ctx.fillStyle = "#ff5a3a"; ctx.fillRect(o.x, o.y - 15, 50, 30); ctx.fillStyle = "#ffe66d"; ctx.fillRect(o.x + 10, o.y - 8, 12, 8); });
        ctx.fillStyle = "#63f59a"; ctx.fillRect(px - 10, py - 8, 20, 16);
      } else if (key === "tetris") {
        ctx.fillStyle = "#2a3260"; ctx.fillRect(tetX * 30, tetY * 30, 30, 30);
        ctx.fillStyle = "#1a2050"; for (let r = 0; r < 16; r++)for (let c = 0; c < 20; c++)ctx.fillRect(c * 30 + 1, r * 30 + 1, 28, 28);
        ctx.fillStyle = "#64eaff"; ctx.fillRect(tetX * 30, tetY * 30, 30, 30);
      } else if (key === "invaders" || key === "solostds" || key === "dodgeshoot") {
        ctx.fillStyle = "#64eaff"; ctx.fillRect(px - 10, py - 10, 20, 20);
        dodgeShots.forEach(s2 => { ctx.fillStyle = "#ffe66d"; ctx.fillRect(s2.x - 2, s2.y - 8, 4, 10); });
        if (key === "solostds") objs.forEach(o => { ctx.fillStyle = "#8a6a5a"; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill(); });
        if (key === "invaders") { ctx.fillStyle = "#ff5a5a"; for (let r = 0; r < 3; r++)for (let c = 0; c < 8; c++)ctx.fillRect(invX + c * 40, invY + r * 30, 22, 18); }
        dodgeBullets.forEach(b => { ctx.fillStyle = "#ff5a5a"; ctx.fillRect(b.x - 2, b.y, 4, 8); });
      } else if (key === "solosnake") {
        const CS2 = CS;
        ctx.fillStyle = "#ffe66d"; ctx.fillRect(snakeFood.x * CS2, snakeFood.y * CS2, CS2 - 2, CS2 - 2);
        snakeBody.forEach((s2, i) => { ctx.fillStyle = i === 0 ? "#63f59a" : "#3a8a4a"; ctx.fillRect(s2.x * CS2, s2.y * CS2, CS2 - 2, CS2 - 2); });
      } else if (key === "breakout") {
        ctx.fillStyle = "#64eaff"; ctx.fillRect(paddleX, H - 25, 100, 10);
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(ballX, ballY, 8, 0, Math.PI * 2); ctx.fill();
        bricks.forEach(b => { ctx.fillStyle = ["#ff6a8a", "#ffd24a", "#63f59a", "#64b5f6", "#c08aff"][Math.floor(b.y / 24) - 0] || "#fff"; ctx.fillRect(b.x, b.y, 58, 16); });
      } else if (key === "flappy") {
        ctx.fillStyle = "#63f59a"; ctx.fillRect(px - 8, py - 8, 16, 16);
        pipes.forEach(p2 => { ctx.fillStyle = "#2a5a3a"; ctx.fillRect(p2.x, 0, 40, p2.y); ctx.fillRect(p2.x, p2.y + p2.gap, 40, H - p2.y - p2.gap); });
      } else if (key === "runner") {
        ctx.fillStyle = "#1a2030"; ctx.fillRect(0, 420, W, 80);
        ctx.fillStyle = "#64eaff"; ctx.fillRect(px - 8, py - 16, 16, 16);
        objs.forEach(o => { ctx.fillStyle = "#ff5a3a"; ctx.fillRect(o.x, 420 - o.h, o.w, o.h); });
      } else if (key === "miner") {
        ctx.fillStyle = "#2a2a1a"; ctx.fillRect(0, 60, W, H - 60);
        gems.forEach(g => { ctx.fillStyle = "#c08aff"; ctx.fillRect(g.x - 6, g.y - 6, 12, 12); });
        ctx.fillStyle = "#ffe66d"; ctx.fillRect(minerX - 8, minerY - 8, 16, 16);
      } else if (key === "solopong") {
        ctx.fillStyle = "#64eaff"; ctx.fillRect(soloPongPaddle, H - 25, 100, 10);
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(soloPongBall.x, soloPongBall.y, 7, 0, Math.PI * 2); ctx.fill();
      } else if (key === "skyhop") {
        hopPlat.forEach(p2 => { ctx.fillStyle = "#3a4a8a"; ctx.fillRect(p2.x, p2.y, p2.w, 10); });
        ctx.fillStyle = "#ff72c8"; ctx.beginPath(); ctx.arc(px, hopY - 10, 10, 0, Math.PI * 2); ctx.fill();
      }
    }
    resetGame();
    gameLoop();
  };

  /* ================== CO-OP LEVEL MODE ================== */
  window.openCoop = function () {
    const sec = mkScreen("coopScreen", "👥 CO-OP LEVELS");
    const p = prof();
    p.coopLevel = p.coopLevel || 1;
    const levels = [];
    for (let i = 1; i <= 10; i++) {
      const unlocked = i <= p.coopLevel;
      levels.push({ n: i, unlocked, name: ["The Beginning", "Narrow Paths", "Moving Gaps", "Double Trouble", "Speed Run", "Gravity Shift", "The Vault", "Dark Descent", "Platform Palace", "Final Challenge"][i - 1] });
    }
    let html = "<div style='max-width:700px;margin:12px auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;'>";
    levels.forEach(l => {
      html += `<div class="shop-item" style="${l.unlocked ? "cursor:pointer;" : "opacity:.4;"}" onclick="${l.unlocked ? `launchCoop(${l.n})` : ""}">
      <div class="name">LEVEL ${l.n}</div><div class="desc">${l.name}</div>
      <div style="margin-top:6px;color:${l.unlocked ? "#63f59a" : "#6a7a99"};font-size:11px;">${l.unlocked ? "▶ PLAY" : "🔒 COMPLETE PREVIOUS LEVEL"}</div></div>`;
    });
    html += "</div><p style='text-align:center;color:#9fc0ff;font-size:12px;'>P1: WASD · P2: ARROWS — Both players must reach the exit door together!</p>";
    sec.insertAdjacentHTML("beforeend", html);
  };
  window.launchCoop = function (level) {
    const sec = mkScreen("coopGameScreen", "CO-OP LEVEL " + level);
    sec.insertAdjacentHTML("beforeend", `<canvas id="coopCv" width="900" height="500" style="display:block;margin:8px auto;background:#0a0f24;border:3px solid #2a3260;border-radius:8px;"></canvas><div id="coopHud" style="text-align:center;color:#9fc0ff;font-family:'Courier New',monospace;font-size:14px;"></div>`);
    const cv = sec.querySelector("#coopCv"), ctx = cv.getContext("2d");
    const hud = sec.querySelector("#coopHud");
    const backBtn = sec.querySelector(".back");
    let p1 = { x: 80, y: 400, w: 20, h: 20, vy: 0 }, p2 = { x: 140, y: 400, w: 20, h: 20, vy: 0 };
    const keys = {};
    const kh = e => { keys[e.key.toLowerCase()] = true; };
    const ku = e => { keys[e.key.toLowerCase()] = false; };
    addEventListener("keydown", kh); addEventListener("keyup", ku);
    backBtn.addEventListener("click", () => { cancelAnimationFrame(raf); removeEventListener("keydown", kh); removeEventListener("keyup", ku); }, { once: true });
    let raf = null, alive = true;
    const W = 900, H = 500;
    // platforms per level (procedural based on level number)
    const plats = [];
    const groundY = 460;
    for (let i = 0; i < 4 + level; i++) {
      plats.push({ x: Math.random() * 760 + 50, y: groundY - 40 - Math.random() * 300, w: 70 + Math.random() * 80, h: 14 });
    }
    plats.push({ x: W - 80, y: groundY - 30, w: 60, h: 14, exit: true });
    plats.push({ x: 0, y: groundY, w: W, h: 40 });
    function physics(p2, left, right, up) {
      p2.vy += .5;
      if (keys[left]) p2.x -= 4;
      if (keys[right]) p2.x += 4;
      if (keys[up] && p2.grounded) { p2.vy = -10; p2.grounded = false; }
      p2.x = Math.max(0, Math.min(W - 20, p2.x));
      p2.grounded = false;
      plats.forEach(pl => {
        if (p2.x + p2.w > pl.x && p2.x < pl.x + pl.w && p2.y + p2.h > pl.y && p2.y + p2.h < pl.y + pl.h + 14 && p2.vy >= 0) {
          p2.y = pl.y - p2.h; p2.vy = 0; p2.grounded = true;
        }
      });
    }
    function loop() {
      raf = requestAnimationFrame(loop);
      if (!alive) return;
      physics(p1, "a", "d", "w");
      physics(p2, "arrowleft", "arrowright", "arrowup");
      // both on exit?
      const exit = plats.find(p2 => p2.exit);
      if (exit && p1.x > exit.x && p2.x > exit.x && p1.y > exit.y - 40 && p2.y > exit.y - 40) {
        alive = false;
        const prof2 = window.PDX_PROFILE;
        prof2.coopLevel = Math.max(prof2.coopLevel || 1, level + 1);
        window.PDX_SAVE && window.PDX_SAVE();
        hud.textContent = "LEVEL COMPLETE! Next level unlocked!";
        setTimeout(() => window.openCoop(), 1500);
        return;
      }
      ctx.fillStyle = "#0a0f24"; ctx.fillRect(0, 0, W, H);
      plats.forEach(pl => {
        ctx.fillStyle = pl.exit ? "#63f59a" : "#2a3260";
        ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
        if (pl.exit) { ctx.fillStyle = "#0a0f24"; ctx.font = "bold 12px Courier New"; ctx.fillText("EXIT", pl.x + 12, pl.y + 12); }
      });
      ctx.fillStyle = "#64eaff"; ctx.fillRect(p1.x, p1.y, 20, 20);
      ctx.fillStyle = "#ff72c8"; ctx.fillRect(p2.x, p2.y, 20, 20);
      hud.textContent = "Level " + level + " — P1: " + Math.round(p1.x) + "," + Math.round(p1.y) + " · P2: " + Math.round(p2.x) + "," + Math.round(p2.y) + " · Get both players to the green EXIT!";
    }
    loop();
  };

  /* ================== HOUSE DECORATOR ================== */
  window.openHouse = function () {
    const sec = mkScreen("houseScreen", "🏠 MY HOUSE");
    const p = prof();
    p.house = p.house || { items: {} };
    const CATALOG2 = [
      { id: "chair", name: "CHAIR", price: 8, w: 20, h: 24 },
      { id: "bed", name: "BED", price: 20, w: 50, h: 28 },
      { id: "tv", name: "WORKING TV", price: 30, w: 42, h: 28 },
      { id: "pet_cat", name: "CAT", price: 15, w: 16, h: 14 },
      { id: "pet_dog", name: "DOG", price: 15, w: 18, h: 16 },
      { id: "window", name: "WINDOW", price: 12, w: 30, h: 24 },
      { id: "plant", name: "PLANT", price: 6, w: 14, h: 22 },
      { id: "rug", name: "RUG", price: 10, w: 60, h: 8 },
      { id: "lamp", name: "LAMP", price: 9, w: 10, h: 26 },
      { id: "table", name: "TABLE", price: 14, w: 36, h: 18 },
      { id: "bookshelf", name: "BOOKSHELF", price: 16, w: 22, h: 36 },
      { id: "sofa", name: "SOFA", price: 24, w: 56, h: 22 }
    ];
    const itemNames = { chair: "Chair", bed: "Bed", tv: "Working TV", pet_cat: "Cat", pet_dog: "Dog", window: "Window", plant: "Plant", rug: "Rug", lamp: "Lamp", table: "Table", bookshelf: "Bookshelf", sofa: "Sofa" };
    let html = "<div style='max-width:900px;margin:0 auto;display:flex;gap:16px;flex-wrap:wrap;'>";
    // shop panel
    html += "<div style='flex:1;min-width:240px;background:#141a3a;border:2px solid #3a4a8a;padding:14px;border-radius:10px;'>";
    html += "<h3 style='color:#ffe66d;margin:0 0 8px;'>🛒 BUY FURNITURE</h3><div style='font-size:11px;color:#9fc0ff;margin-bottom:8px;'>Coins: " + (p.coins || 0) + "</div>";
    CATALOG2.forEach(it => {
      const owned = (p.house.items[it.id] || []).length;
      html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #1a2050;">
      <span style="color:#e0e8ff;font-size:12px;">${it.name}</span>
      ${owned ? `<span style="color:#63f59a;font-size:11px;">×${owned}</span>`
          : `<button onclick="buyFurniture('${it.id}',${it.price})" style="background:#ffe66d;border:none;color:#080b18;padding:3px 8px;font-family:monospace;font-size:11px;cursor:pointer;border-radius:4px;">${it.price} 🪙</button>`}
    </div>`;
    });
    html += "</div>";
    // house preview panel
    html += "<div style='flex:2;min-width:360px;'><canvas id='houseCv' width='500' height='400' style='display:block;border:3px solid #3a4a8a;border-radius:10px;background:#0a0f24;'></canvas><p style='text-align:center;color:#6a7a99;font-size:10px;margin-top:6px;'>Click inside the house to place selected furniture. Right-click to remove.</p>";
    html += "<div style='margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;'>";
    CATALOG2.filter(it => (p.house.items[it.id] || []).length > 0).forEach(it => {
      html += `<button class="placeBtn" data-item="${it.id}" style="background:#2a3260;border:1px solid #64eaff;color:#64eaff;padding:4px 10px;font-family:monospace;font-size:11px;cursor:pointer;border-radius:6px;">${itemNames[it.id]} ×${(p.house.items[it.id] || []).length}</button>`;
    });
    html += "</div></div></div>";
    sec.insertAdjacentHTML("beforeend", html);
    window.__houseCat = CATALOG2;
    window.__houseItems = p.house.items;
    let selectedItem = null;
    sec.querySelectorAll(".placeBtn").forEach(b => {
      b.addEventListener("click", () => { selectedItem = b.dataset.item; window.showToast && showToast("Selected: " + itemNames[b.dataset.item]); });
    });
    window.buyFurniture = function (id, price) {
      if ((p.coins || 0) < price) { window.showToast && showToast("Not enough coins!"); return; }
      p.coins -= price;
      p.house.items[id] = p.house.items[id] || [];
      p.house.items[id].push({ x: 0, y: 0 });
      window.PDX_SAVE && window.PDX_SAVE();
      window.PDX_ADD_COINS && null;
      window.showToast && showToast("Bought " + itemNames[id] + "!");
      window.openHouse();
    };
    // draw house
    const cv2 = sec.querySelector("#houseCv"), c2 = cv2.getContext("2d");
    function drawHouse() {
      c2.clearRect(0, 0, 500, 400);
      // house walls
      c2.fillStyle = "#2a2a4a"; c2.fillRect(60, 50, 380, 320);
      c2.fillStyle = "#1a1a30"; c2.fillRect(75, 65, 350, 290);
      // floor
      c2.fillStyle = "#2a2010"; c2.fillRect(75, 305, 350, 50);
      // roof
      c2.fillStyle = "#3a2a1a"; c2.beginPath(); c2.moveTo(40, 55); c2.lineTo(250, 10); c2.lineTo(460, 55); c2.closePath(); c2.fill();
      // place owned items
      CATALOG2.forEach(cat => {
        const placements = p.house.items[cat.id] || [];
        placements.forEach(pl => {
          c2.save(); c2.translate(75 + pl.x, 65 + pl.y);
          drawFurniture(c2, cat.id, cat.w, cat.h);
          c2.restore();
        });
      });
    }
    function drawFurniture(c, id, w, h) {
      switch (id) {
        case "chair": c.fillStyle = "#8a6a3a"; c.fillRect(-w / 2, -h, w, h); c.fillStyle = "#6a4a2a"; c.fillRect(-w / 2, -h, w, 6); break;
        case "bed": c.fillStyle = "#4a3a6a"; c.fillRect(-w / 2, -h, w, h); c.fillStyle = "#c8a8d8"; c.fillRect(-w / 2 + 4, -h + 4, w - 8, 8); break;
        case "tv": c.fillStyle = "#111"; c.fillRect(-w / 2, -h, w, h); c.fillStyle = "#2a8aff"; c.fillRect(-w / 2 + 3, -h + 3, w - 6, h - 6); c.fillStyle = "#64eaff"; c.fillRect(-w / 2 + 6, -h + 6, w - 12, h - 12); break;
        case "pet_cat": c.fillStyle = "#c88a3a"; c.beginPath(); c.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = "#c88a3a"; c.beginPath(); c.arc(0, -h / 2, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = "#ffe66d"; c.fillRect(-3, -h / 2 - 2, 2, 2); c.fillRect(1, -h / 2 - 2, 2, 2); break;
        case "pet_dog": c.fillStyle = "#8a6a4a"; c.beginPath(); c.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = "#6a4a2a"; c.beginPath(); c.arc(-w / 2 - 2, -h / 2 + 2, 4, 0, Math.PI * 2); c.fill(); break;
        case "window": c.fillStyle = "#8ad0ff"; c.fillRect(-w / 2, -h, w, h); c.strokeStyle = "#c8a86a"; c.lineWidth = 2; c.strokeRect(-w / 2, -h, w, h); c.beginPath(); c.moveTo(0, -h); c.lineTo(0, 0); c.moveTo(-w / 2, -h / 2); c.lineTo(w / 2, -h / 2); c.stroke(); break;
        case "plant": c.fillStyle = "#8a5a2a"; c.fillRect(-4, -10, 8, 10); c.fillStyle = "#3a8a3a"; c.beginPath(); c.arc(0, -18, 9, 0, Math.PI * 2); c.fill(); break;
        case "rug": c.fillStyle = "#a83a5a"; c.fillRect(-w / 2, -h / 2, w, h); c.strokeStyle = "#e86a8a"; c.strokeRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4); break;
        case "lamp": c.fillStyle = "#c8a86a"; c.fillRect(-2, -8, 4, 10); c.fillStyle = "#ffe66d"; c.beginPath(); c.moveTo(-6, -8); c.lineTo(0, -h); c.lineTo(6, -8); c.closePath(); c.fill(); break;
        case "table": c.fillStyle = "#8a6a3a"; c.fillRect(-w / 2, -6, w, 4); c.fillStyle = "#6a4a2a"; c.fillRect(-w / 2 + 2, -2, 4, 8); c.fillRect(w / 2 - 6, -2, 4, 8); break;
        case "bookshelf": c.fillStyle = "#6a4a2a"; c.fillRect(-w / 2, -h, w, h); c.fillStyle = "#3a8aff"; c.fillRect(-w / 2 + 2, -h + 3, w - 4, 5); c.fillStyle = "#ff5a5a"; c.fillRect(-w / 2 + 2, -h + 11, w - 4, 5); c.fillStyle = "#63f59a"; c.fillRect(-w / 2 + 2, -h + 19, w - 4, 5); c.fillStyle = "#ffe66d"; c.fillRect(-w / 2 + 2, -h + 27, w - 4, 5); break;
        case "sofa": c.fillStyle = "#4a3a6a"; c.fillRect(-w / 2, -h, w, h); c.fillStyle = "#5a4a7a"; c.fillRect(-w / 2 + 3, -h + 3, w - 6, h / 2 - 3); c.fillStyle = "#3a2a5a"; c.fillRect(-w / 2, h - 6, w, 6); break;
      }
    }
    cv2.addEventListener("click", e => {
      if (!selectedItem) return;
      const r = cv2.getBoundingClientRect();
      const hx = e.clientX - r.left - 75, hy = e.clientY - r.top - 65;
      if (hx < 0 || hx > 350 || hy < 0 || hy > 290) return;
      const cat = CATALOG2.find(c => c.id === selectedItem);
      if (!cat) return;
      p.house.items[selectedItem].push({ x: hx, y: hy });
      window.PDX_SAVE && window.PDX_SAVE();
      drawHouse();
    });
    cv2.addEventListener("contextmenu", e => {
      e.preventDefault();
      const r = cv2.getBoundingClientRect();
      const hx = e.clientX - r.left - 75, hy = e.clientY - r.top - 65;
      // find nearest item
      for (const cat of CATALOG2) {
        const items2 = p.house.items[cat.id] || [];
        for (let i = 0; i < items2.length; i++) {
          if (Math.abs(items2[i].x - hx) < cat.w && Math.abs(items2[i].y - hy) < cat.h) {
            items2.splice(i, 1);
            window.PDX_SAVE && window.PDX_SAVE();
            drawHouse();
            return;
          }
        }
      }
    });
    drawHouse();
  };

  /* ================== end IIFE ================== */
  console.log("[Extras] game exclusion, calendar, solo arcade, co-op levels, house decorator ready.");
})();
