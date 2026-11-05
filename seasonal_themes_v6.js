/* =====================================================
   SEASONAL THEME ENGINE — makes seasonal games actually
   themed, not just renamed. Applies real gameplay/visual
   modifiers based on the current season by patching the
   micro game defs at registration time.
   ===================================================== */
(function () {
  "use strict";
  if (window.__SEASONAL_THEMES__) return; window.__SEASONAL_THEMES__ = true;

  function getSeason() {
    // secret-code override takes priority
    if (window.PDX_FORCE_SEASON) return window.PDX_FORCE_SEASON;
    const d = new Date(), m = d.getMonth(), day = d.getDate();
    if (m === 9 && day >= 15 && day <= 31) return "halloween";
    if ((m === 11 && day >= 15) || (m === 0 && day <= 5)) return "christmas";
    if (m === 3 && day >= 1 && day <= 29) return "easter";
    if (m === 1 && day >= 10 && day <= 14) return "valentines";
    return null;
  }
  window.PDX_OVERRIDE_SEASON = function (s) {
    window.PDX_FORCE_SEASON = s;
    // re-render seasonal effects if already installed
    try { maybeInstall(); } catch (e) { }
    try { window.PDX_SEASONAL_RETRY && window.PDX_SEASONAL_RETRY(); } catch (e) { }
  };

  /* per-season in-game visual modifiers */
  const MODS = {
    halloween: {
      tint: ["#ff8c42", "#a020f0"],
      particles: "#a020f0",
      speed: 1.06,
      banner: "🎃 SPOOKY MODE",
      gameBg: "#1a0d2a",
      gameTint: "rgba(160,32,240,.12)",
      swap: {
        "#0d1430": "#180b24", "#101936": "#150a20",   // pong/snake backgrounds
        "#64eaff": "#a020f0",                          // p1 color
        "#ff72c8": "#ff8c42",                          // p2 color
        "#ffffff": "#ffe9b0",                          // ball
        "#273b70": "#2a1a3a", "#39518b": "#3a2a4a",   // stars
        "#ffe66d": "#ff8c42"                           // ui accents
      }
    },
    christmas: {
      tint: ["#ff2244", "#20aa44"],
      particles: "#ffffff",
      speed: 1.0,
      banner: "🎄 FESTIVE MODE",
      gameBg: "#0a1a14",
      gameTint: "rgba(32,170,68,.10)",
      swap: {
        "#0d1430": "#0a2018", "#101936": "#0c2418",
        "#64eaff": "#ff2244",
        "#ff72c8": "#20aa44",
        "#ffffff": "#e8ffe8",
        "#273b70": "#1a3a28", "#39518b": "#2a4a38",
        "#ffe66d": "#ff2244"
      }
    },
    easter: {
      tint: ["#ffcc44", "#88cc66"],
      particles: "#ffcc44",
      speed: 0.96,
      banner: "🐰 EASTER MODE",
      gameBg: "#1a1a10",
      gameTint: "rgba(255,204,68,.10)",
      swap: {
        "#0d1430": "#201a0e", "#101936": "#1c180c",
        "#64eaff": "#88cc66",
        "#ff72c8": "#ffcc44",
        "#ffffff": "#fff4d0",
        "#273b70": "#3a3018", "#39518b": "#4a4028",
        "#ffe66d": "#ffcc44"
      }
    },
    valentines: {
      tint: ["#ff4488", "#ff88aa"],
      particles: "#ff4488",
      speed: 1.0,
      banner: "💝 LOVE MODE",
      gameBg: "#1a0a12",
      gameTint: "rgba(255,68,136,.10)",
      swap: {
        "#0d1430": "#1e0c16", "#101936": "#1c0c14",
        "#64eaff": "#ff4488",
        "#ff72c8": "#ff88aa",
        "#ffffff": "#ffe0ec",
        "#273b70": "#3a1a28", "#39518b": "#4a2a38",
        "#ffe66d": "#ff4488"
      }
    }
  };

  let season = getSeason();
  let mod = season ? MODS[season] : null;

  /* Lazy season activation: when the season turns on (or a code forces it),
     run install() once. Re-checked every 30s + on override. */
  let installed = false;
  function maybeInstall() {
    season = getSeason();
    if (!season) return;
    mod = MODS[season];
    if (installed) return;
    try {
      install();
      installed = true;
    } catch (e) {
      installed = false;   // retry in 5s — never leave the engine permanently broken
      console.warn("[SeasonalThemes] install failed, will retry:", e.message);
    }
  }
  setInterval(maybeInstall, 5000);

  /* ---- REAL in-game reskin: patch draw functions so seasonal games LOOK themed ---- */
  function install() {
  // seasonal menu ids → their real game section ids
  const SEASONAL_IDS = { halloween: ["pong", "snakeGame"], christmas: ["pong", "hockeyGame"], easter: ["memGame"], valentines: ["reactGame"] };
  // map seasonal menu ids to the actual game ids whose canvas draw runs
  const GAME_MAP = { "pong": ["pong"], "snakeGame": ["snakeGame"], "hockeyGame": ["hockeyGame"], "memGame": ["memGame"], "reactGame": ["reactGame"] };
  const targets = [];
  SEASONAL_IDS[season].forEach(mid => (GAME_MAP[mid] || []).forEach(tid => targets.push(tid)));

  // palette-swap helper: wraps ctx.fillStyle/strokeStyle through the game draw
  function themedColor(c) {
    if (typeof c !== "string") return c;
    return mod.swap[c] || c;
  }

  let fxTimer = null;
  function ensureFxOverlay() {
    const scr = document.getElementById(activeScreen);
    if (!scr) return null;
    let cv = scr.querySelector("canvas");
    if (!cv) return null;
    // overlay canvas sits EXACTLY on the game canvas (not the whole screen section)
    let ov = cv.parentElement && cv.parentElement.querySelector(".pdx-season-fx");
    if (!ov) {
      ov = document.createElement("canvas");
      ov.className = "pdx-season-fx";
      (cv.parentElement || scr).style.position = "relative";
      cv.parentElement.appendChild(ov);
    }
    // re-sync geometry every frame-ish: canvas may be resized by ui_boost
    const r = cv.getBoundingClientRect(), pr = cv.parentElement.getBoundingClientRect();
    ov.style.cssText = "position:absolute;pointer-events:none;left:" + (r.left - pr.left) + "px;top:" + (r.top - pr.top) + "px;width:" + r.width + "px;height:" + r.height + "px;";
    if (ov.width !== cv.width || ov.height !== cv.height) { ov.width = cv.width; ov.height = cv.height; }
    return ov;
  }

  // ambient in-game particles (bats flying across pong, snow falling in snake, etc.)
  const fxParts = Array.from({ length: 10 }, () => ({
    x: Math.random() * 900, y: Math.random() * 500,
    vx: (Math.random() - .5) * .4, vy: .25 + Math.random() * .5,
    ph: Math.random() * 6, kind: Math.floor(Math.random() * 5)
  }));
  function drawFxProp(c, p) {
    const M = mod;
    // small themed sprites drawn per season
    if (season === "halloween") {
      if (p.kind === 0) { // bat
        const s = 8, f = Math.sin(p.ph * 6) * .5 + .5;
        c.fillStyle = "rgba(42,26,58,.8)";
        c.beginPath(); c.ellipse(p.x, p.y, s * .5, s * .35, 0, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.moveTo(p.x - s * .4, p.y); c.quadraticCurveTo(p.x - s * 1.2, p.y - s * (.3 + f * .6), p.x - s * 1.5, p.y + s * .3);
        c.quadraticCurveTo(p.x - s, p.y + s * .1, p.x - s * .4, p.y + s * .2); c.fill();
        c.beginPath(); c.moveTo(p.x + s * .4, p.y); c.quadraticCurveTo(p.x + s * 1.2, p.y - s * (.3 + f * .6), p.x + s * 1.5, p.y + s * .3);
        c.quadraticCurveTo(p.x + s, p.y + s * .1, p.x + s * .4, p.y + s * .2); c.fill();
      } else if (p.kind === 1) { // ghost
        c.fillStyle = "rgba(220,228,255,.5)";
        c.beginPath(); c.arc(p.x, p.y, 6, Math.PI, 0); c.lineTo(p.x + 6, p.y + 7);
        for (let i = 0; i < 3; i++) c.quadraticCurveTo(p.x + 6 - (i + .5) * 4, p.y + (i % 2 ? 5 : 8), p.x + 6 - (i + 1) * 4, p.y + 7);
        c.fill();
        c.fillStyle = "#1a1a2a"; c.fillRect(p.x - 3, p.y - 2, 2, 3); c.fillRect(p.x + 1, p.y - 2, 2, 3);
      } else { // drifting ember
        c.fillStyle = "rgba(255,140,66," + (.25 + Math.sin(p.ph * 4) * .15) + ")";
        c.fillRect(p.x, p.y, 3, 3);
      }
    } else if (season === "christmas") {
      if (p.kind === 0) { // snowflake
        c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 1.2;
        c.save(); c.translate(p.x, p.y); c.rotate(p.ph);
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 5, Math.sin(a) * 5); c.stroke(); }
        c.restore();
      } else { // falling snow dot
        c.fillStyle = "rgba(255,255,255,.5)"; c.beginPath(); c.arc(p.x, p.y, 2.2, 0, Math.PI * 2); c.fill();
      }
    } else if (season === "easter") {
      c.fillStyle = "rgba(255,204,68," + (.3 + Math.sin(p.ph * 4) * .2) + ")";
      c.beginPath(); c.arc(p.x, p.y, p.kind === 0 ? 3 : 2, 0, Math.PI * 2); c.fill();
    } else if (season === "valentines") {
      const s = 5;
      c.fillStyle = "rgba(255,68,136," + (.3 + Math.sin(p.ph * 5) * .2) + ")";
      c.beginPath(); c.moveTo(p.x, p.y + s * .8);
      c.bezierCurveTo(p.x - s * 1.1, p.y, p.x - s * .6, p.y - s * .8, p.x, p.y - s * .2);
      c.bezierCurveTo(p.x + s * .6, p.y - s * .8, p.x + s * 1.1, p.y, p.x, p.y + s * .8);
      c.fill();
    }
  }

  let fxT = 0;
  (function fxLoop() {
    requestAnimationFrame(fxLoop);
    try {
      const id = (typeof activeScreen !== "undefined") ? activeScreen : window.activeScreen;
      if (!id || !targets.includes(id)) return;
      const ov = ensureFxOverlay();
      if (!ov) return;
      const c = ov.getContext("2d");
      c.clearRect(0, 0, ov.width, ov.height);
      fxT += 1 / 60;
      // seasonal colored fog
      c.fillStyle = mod.gameTint; c.fillRect(0, 0, ov.width, ov.height);
      // drifting ambient props
      const sc = ov.width / 900;
      for (const p of fxParts) {
        p.x += p.vx; p.y += p.vy; p.ph += .03;
        if (p.y > ov.height + 20) { p.y = -20; p.x = Math.random() * ov.width; }
        if (p.x < -20) p.x = ov.width + 10; if (p.x > ov.width + 20) p.x = -10;
        c.save(); c.translate((p.x * sc), (p.y * sc)); drawFxProp(c, { ...p, x: 0, y: 0 }); c.restore();
      }
      // halloween: vignette corners
      if (season === "halloween") {
        const g = c.createRadialGradient(ov.width / 2, ov.height / 2, ov.height * .3, ov.width / 2, ov.height / 2, ov.height * .75);
        g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(20,0,30,.5)");
        c.fillStyle = g; c.fillRect(0, 0, ov.width, ov.height);
      }
    } catch (e) { }
  })();

  // banner text INSIDE the game screen, drawn on the overlay once per second
  if (mod.banner) {
    const tag = document.createElement("div");
    tag.style.cssText = "position:absolute;top:6px;right:10px;font-family:'Courier New',monospace;font-size:13px;letter-spacing:1px;color:" + mod.tint[0] + ";text-shadow:0 0 8px " + mod.tint[0] + ";pointer-events:none;z-index:5;display:none;";
    tag.textContent = mod.banner;
    (function watchGame() {
      const id = (typeof activeScreen !== "undefined") ? activeScreen : window.activeScreen;
      if (id && targets.includes(id)) {
        const scr = document.getElementById(id);
        if (scr && tag.parentElement !== scr) scr.appendChild(tag);
        tag.style.display = "block";
      } else tag.style.display = "none";
      requestAnimationFrame(watchGame);
    })();
  }

  /* ---- palette swap of the actual game canvases: hook CanvasRenderingContext2D ----
     Wrapped in try/catch: if the property was already redefined by a previous
     (cached) copy with configurable:false, we skip and rely on the overlay. */
  if (!window.__PDX_SEASONAL_HOOK__) {
    window.__PDX_SEASONAL_HOOK__ = true;
    try {
      const desc = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, "fillStyle");
      const strokeDesc = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, "strokeStyle");
      let swapping = false;
      window.__PDX_SEASONAL_SWAP__ = function (on) { swapping = on; };
      Object.defineProperty(CanvasRenderingContext2D.prototype, "fillStyle", {
        get: desc.get,
        set(v) { desc.set.call(this, swapping && typeof v === "string" ? (mod.swap[v] || v) : v); },
        configurable: true
      });
      Object.defineProperty(CanvasRenderingContext2D.prototype, "strokeStyle", {
        get: strokeDesc.get,
        set(v) { strokeDesc.set.call(this, swapping && typeof v === "string" ? (mod.swap[v] || v) : v); },
        configurable: true
      });
    } catch (e) {
      console.warn("[SeasonalThemes] palette swap unavailable (property locked):", e.message);
    }
  }
  // enable swap only while a seasonal game is on screen (safe even if swap fn missing)
  (function swapWatch() {
    const id = (typeof activeScreen !== "undefined") ? activeScreen : window.activeScreen;
    if (window.__PDX_SEASONAL_SWAP__) window.__PDX_SEASONAL_SWAP__(!!(id && targets.includes(id)));
    requestAnimationFrame(swapWatch);
  })();
    // show seasonal banner on menu
    addEventListener("load", () => {
      const banner = document.createElement("div");
      banner.id = "seasonBanner";
      banner.style.cssText = "position:fixed;top:64px;right:18px;left:auto;padding:5px 14px;background:rgba(8,11,24,.85);border:2px solid " + mod.tint[0] + ";color:" + mod.tint[0] + ";font-family:'Courier New',monospace;font-size:12px;letter-spacing:1px;z-index:60;border-radius:12px;pointer-events:none;" + (season === "halloween" ? "box-shadow:0 0 14px #a020f080;" : "");
      banner.textContent = mod.banner + " ACTIVE";
      document.body.appendChild(banner);
    });
    // seasonal ambient objects on menu (real themed drawings, not dots)
    // drawn BEHIND the UI (z-index 0, menu screens sit above), slow drift,
    // bigger objects, soft opacity so they read as background decoration
    const cvs = document.createElement("canvas");
    cvs.id = "seasonFx";
    cvs.style.cssText = "position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.5;";
    document.body.insertBefore(cvs, document.body.firstChild);
    function size() { cvs.width = innerWidth; cvs.height = innerHeight; }
    size(); addEventListener("resize", size);
    const N = { halloween: 12, christmas: 12, easter: 10, valentines: 14 }[season] || 10;
    const parts = Array.from({ length: N }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      vy: 4 + Math.random() * 9,             // slow, gentle drift
      ph: Math.random() * 6,
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - .5) * .5,
      s: 1.6 + Math.random() * 1.7,          // ~2.2x bigger than before
      kind: Math.floor(Math.random() * 5)
    }));
    let t = 0;
    /* --- object painters (all drawn in code) --- */
    function pumpkin(x, p) {
      const s = 15 * p.s;
      x.fillStyle = "#e8761e";
      x.beginPath(); x.ellipse(p.x, p.y, s, s * .8, 0, 0, Math.PI * 2); x.fill();
      x.strokeStyle = "#b45a10"; x.lineWidth = 2;
      x.beginPath(); x.ellipse(p.x, p.y, s * .45, s * .8, 0, 0, Math.PI * 2); x.stroke();
      x.fillStyle = "#3a6a2a"; x.fillRect(p.x - 2, p.y - s * .8 - 6, 4, 7);
      x.fillStyle = "#1a1a1a"; // carved face
      x.beginPath(); x.moveTo(p.x - s * .4, p.y - s * .2); x.lineTo(p.x - s * .15, p.y - s * .05); x.lineTo(p.x - s * .4, p.y + s * .1); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(p.x + s * .4, p.y - s * .2); x.lineTo(p.x + s * .15, p.y - s * .05); x.lineTo(p.x + s * .4, p.y + s * .1); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(p.x - s * .35, p.y + s * .3); x.lineTo(p.x + s * .35, p.y + s * .3); x.lineTo(p.x, p.y + s * .55); x.closePath(); x.fill();
    }
    function bat(x, p) {
      const s = 11 * p.s, f = Math.sin(p.ph * 6) * .5 + .5;
      x.fillStyle = "#2a1a3a";
      x.beginPath(); x.ellipse(p.x, p.y, s * .5, s * .4, 0, 0, Math.PI * 2); x.fill();
      // wings flap
      x.beginPath(); x.moveTo(p.x - s * .4, p.y);
      x.quadraticCurveTo(p.x - s * 1.4, p.y - s * (0.4 + f * .7), p.x - s * 1.7, p.y + s * .3);
      x.quadraticCurveTo(p.x - s * 1.1, p.y + s * .1, p.x - s * .4, p.y + s * .25); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(p.x + s * .4, p.y);
      x.quadraticCurveTo(p.x + s * 1.4, p.y - s * (0.4 + f * .7), p.x + s * 1.7, p.y + s * .3);
      x.quadraticCurveTo(p.x + s * 1.1, p.y + s * .1, p.x + s * .4, p.y + s * .25); x.closePath(); x.fill();
      x.fillStyle = "#ffd24a"; x.fillRect(p.x - 3, p.y - 2, 2, 2); x.fillRect(p.x + 1, p.y - 2, 2, 2);
    }
    function ghost(x, p) {
      const s = 12 * p.s, w = Math.sin(p.ph * 3) * 2;
      x.fillStyle = "rgba(220,228,255,.75)";
      x.beginPath(); x.arc(p.x + w, p.y, s * .6, Math.PI, 0);
      x.lineTo(p.x + w + s * .6, p.y + s * .7);
      for (let i = 0; i < 3; i++) x.quadraticCurveTo(p.x + w + s * .6 - (i * .4 + .2) * s, p.y + s * (i % 2 ? .5 : .85), p.x + w + s * .6 - (i + 1) * .4 * s, p.y + s * .7);
      x.closePath(); x.fill();
      x.fillStyle = "#1a1a2a"; x.fillRect(p.x + w - 4, p.y - 3, 3, 4); x.fillRect(p.x + w + 1, p.y - 3, 3, 4);
    }
    function candy(x, p) {
      const s = 9 * p.s;
      x.save(); x.translate(p.x, p.y); x.rotate(p.rot);
      x.fillStyle = "#ff5a9a"; x.beginPath(); x.ellipse(0, 0, s, s * .62, 0, 0, Math.PI * 2); x.fill();
      x.strokeStyle = "#ffffff"; x.lineWidth = 2;
      x.beginPath(); x.moveTo(-s, 0); x.lineTo(-s * 1.5, -s * .4); x.moveTo(-s, 0); x.lineTo(-s * 1.5, s * .4);
      x.moveTo(s, 0); x.lineTo(s * 1.5, -s * .4); x.moveTo(s, 0); x.lineTo(s * 1.5, s * .4); x.stroke();
      x.fillStyle = "#ffffff"; x.beginPath(); x.ellipse(0, 0, s * .3, s * .18, 0, 0, Math.PI * 2); x.fill();
      x.restore();
    }
    function monster(x, p) {
      const s = 10 * p.s;
      x.fillStyle = ["#8a3ac8", "#3ac88a", "#c83a5a"][p.kind % 3];
      x.beginPath(); x.ellipse(p.x, p.y, s, s * .9, 0, 0, Math.PI * 2); x.fill();
      // horns/antenna
      x.strokeStyle = x.fillStyle; x.lineWidth = 2;
      x.beginPath(); x.moveTo(p.x - s * .4, p.y - s * .8); x.lineTo(p.x - s * .6, p.y - s * 1.3); x.moveTo(p.x + s * .4, p.y - s * .8); x.lineTo(p.x + s * .6, p.y - s * 1.3); x.stroke();
      x.fillStyle = "#fff"; x.beginPath(); x.arc(p.x - s * .3, p.y - s * .1, s * .18, 0, Math.PI * 2); x.arc(p.x + s * .3, p.y - s * .1, s * .18, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#1a1a1a"; x.beginPath(); x.arc(p.x - s * .28, p.y - s * .08, s * .08, 0, Math.PI * 2); x.arc(p.x + s * .32, p.y - s * .08, s * .08, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#fff"; x.fillRect(p.x - s * .3, p.y + s * .3, s * .6, s * .16);
    }
    function tree(x, p) {
      const s = 15 * p.s;
      x.fillStyle = "#6a4a2a"; x.fillRect(p.x - 2.5, p.y + s * .6, 5, s * .5);
      x.fillStyle = "#1e8a3a";
      for (let i = 0; i < 3; i++) {
        const w = s * (1.1 - i * .28), yy = p.y + s * .55 - i * s * .55;
        x.beginPath(); x.moveTo(p.x - w, yy); x.lineTo(p.x, yy - s * .75); x.lineTo(p.x + w, yy); x.closePath(); x.fill();
      }
      // ornaments
      x.fillStyle = ["#ff3a3a", "#ffd24a", "#3a8aff", "#ff8ac8"][p.kind % 4];
      x.beginPath(); x.arc(p.x - s * .3, p.y + s * .1, 2.2, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.arc(p.x + s * .25, p.y - s * .15, 2.2, 0, Math.PI * 2); x.fill();
    }
    function snowflake(x, p) {
      const s = 6 * p.s;
      x.strokeStyle = "rgba(255,255,255,.9)"; x.lineWidth = 1.4;
      x.save(); x.translate(p.x, p.y); x.rotate(p.rot);
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * s, Math.sin(a) * s);
        x.moveTo(Math.cos(a) * s * .5, Math.sin(a) * s * .5); x.lineTo(Math.cos(a + .5) * s * .7, Math.sin(a + .5) * s * .7);
        x.stroke();
      }
      x.restore();
    }
    function gift(x, p) {
      const s = 10 * p.s;
      x.save(); x.translate(p.x, p.y); x.rotate(Math.sin(p.rot) * .3);
      const c1 = ["#c83a5a", "#3a8ac8", "#8a3ac8"][p.kind % 3];
      x.fillStyle = c1; x.fillRect(-s, -s * .75, s * 2, s * 1.5);
      x.fillStyle = "#ffd24a"; x.fillRect(-s * .14, -s * .75, s * .28, s * 1.5);
      x.fillRect(-s, -s * .12, s * 2, s * .24);
      x.beginPath(); x.arc(-s * .3, -s * .85, s * .16, 0, Math.PI * 2); x.arc(s * .3, -s * .85, s * .16, 0, Math.PI * 2); x.fill();
      x.restore();
    }
    function candycane(x, p) {
      const s = 10 * p.s;
      x.save(); x.translate(p.x, p.y); x.rotate(p.rot);
      x.strokeStyle = "#ffffff"; x.lineWidth = 3.4; x.lineCap = "round";
      x.beginPath(); x.moveTo(0, s); x.lineTo(0, -s * .4); x.quadraticCurveTo(0, -s * 1.1, s * .55, -s * 1.1); x.stroke();
      x.strokeStyle = "#ff3a3a"; x.lineWidth = 3.4; x.setLineDash([3.4, 4.4]);
      x.beginPath(); x.moveTo(0, s); x.lineTo(0, -s * .4); x.quadraticCurveTo(0, -s * 1.1, s * .55, -s * 1.1); x.stroke();
      x.setLineDash([]); x.restore();
    }
    function starObj(x, p) {
      const s = 7 * p.s, tw = .6 + Math.abs(Math.sin(p.ph * 4)) * .6;
      x.fillStyle = "rgba(255,230,109," + tw + ")";
      x.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * .45 : s;
        x.lineTo(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
      } x.closePath(); x.fill();
    }
    function egg(x, p) {
      const s = 8 * p.s;
      x.save(); x.translate(p.x, p.y); x.rotate(Math.sin(p.rot) * .4);
      const cols = [["#ff8ac8", "#ffd24a"], ["#8ad0ff", "#63f59a"], ["#c8a8ff", "#ff8a8a"]][p.kind % 3];
      x.fillStyle = cols[0]; x.beginPath(); x.ellipse(0, 0, s * .75, s, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = cols[1]; x.fillRect(-s * .75, -s * .2, s * 1.5, s * .18); x.fillRect(-s * .3, -s * .55, s * .6, s * .14);
      x.restore();
    }
    function bunny(x, p) {
      const s = 9 * p.s;
      x.fillStyle = "#f0f0f5";
      x.beginPath(); x.ellipse(p.x, p.y, s * .8, s * .65, 0, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.ellipse(p.x - s * .35, p.y - s * 1.05, s * .16, s * .5, -.2, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.ellipse(p.x + s * .35, p.y - s * 1.05, s * .16, s * .5, .2, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#ff8ac8"; x.beginPath(); x.ellipse(p.x - s * .35, p.y - s * 1.02, s * .08, s * .3, -.2, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.ellipse(p.x + s * .35, p.y - s * 1.02, s * .08, s * .3, .2, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#1a1a1a"; x.fillRect(p.x - s * .35, p.y - s * .2, 2.4, 2.4); x.fillRect(p.x + s * .15, p.y - s * .2, 2.4, 2.4);
    }
    function heart(x, p) {
      const s = 8 * p.s, beat = 1 + Math.sin(p.ph * 5) * .12;
      x.fillStyle = ["#ff4a7a", "#ff7aa8", "#ff2a5a"][p.kind % 3];
      x.save(); x.translate(p.x, p.y); x.scale(beat, beat);
      x.beginPath(); x.moveTo(0, s * .9);
      x.bezierCurveTo(-s * 1.2, s * .1, -s * .7, -s * .8, 0, -s * .25);
      x.bezierCurveTo(s * .7, -s * .8, s * 1.2, s * .1, 0, s * .9);
      x.closePath(); x.fill(); x.restore();
    }
    function chocolate(x, p) {
      const s = 7 * p.s;
      x.save(); x.translate(p.x, p.y); x.rotate(p.rot);
      x.fillStyle = "#8a5a2a"; x.fillRect(-s, -s * .7, s * 2, s * 1.4);
      x.strokeStyle = "#6a4020"; x.lineWidth = 1;
      x.strokeRect(-s, -s * .7, s, s * .7); x.strokeRect(0, -s * .7, s, s * .7);
      x.strokeRect(-s, 0, s, s * .7); x.strokeRect(0, 0, s, s * .7);
      x.restore();
    }
    const PAINTERS = {
      halloween: [pumpkin, bat, ghost, candy, monster],
      christmas: [tree, snowflake, gift, candycane, starObj],
      easter: [egg, bunny, starObj, egg, bunny],
      valentines: [heart, chocolate, heart, starObj, heart]
    };
    const painters = PAINTERS[season];
    (function anim() {
      requestAnimationFrame(anim);
      const ctx = cvs.getContext("2d");
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      t += 1 / 60;
      // only on menu
      const id = (typeof activeScreen !== "undefined") ? activeScreen : window.activeScreen;
      if (id !== "menu" && id !== "undefined") return;
      for (const p of parts) {
        p.y += p.vy * .016; p.ph += .012; p.x += Math.sin(p.ph) * .35; p.rot += p.vr * .006;
        if (p.y > cvs.height + 60) { p.y = -70; p.x = Math.random() * cvs.width; p.kind = Math.floor(Math.random() * 5); }
        if (p.y < -90) p.y = cvs.height + 40;
        (painters[p.kind % painters.length])(ctx, p);
      }
    })();
    /* --- seasonal music auto-suggestion: when a seasonal track is owned, offer it --- */
    addEventListener("load", () => {
      setTimeout(() => {
        const p = window.PDX_PROFILE;
        if (!p.ownedMusic) return;
        const track = { halloween: "spooky", christmas: "jingle", easter: "blossom", valentines: "valentine" }[season];
        if (track && p.ownedMusic.includes(track) && (p.music || "none") !== track) {
          p.music = track; window.PDX_SAVE && window.PDX_SAVE();
          if (window.PDX_MUSIC_APPLY) window.PDX_MUSIC_APPLY();
        }
      }, 2000);
    });
  }
  maybeInstall();   // run if a season is already active
  window.PDX_SEASONAL_RETRY = maybeInstall;  // lets other modules force re-check after override
})();
