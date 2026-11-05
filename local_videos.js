/* =====================================================
   LOCAL CINEMA — self-made videos (no YouTube).
   Each video is a procedural animation: canvas scene styles
   + timed caption track + generative soundtrack (WebAudio).
   Full player: play/pause, seek bar, time, captions, watched.
   Exposes window.PDX_LOCAL_VIDEOS = { id: {dur, style, caps} }
   and window.PDX_playVideo(entry) for features.js cinema.
   ===================================================== */
(function () {
  "use strict";
  if (window.__PDX_LOCAL_VIDEOS__) return; window.__PDX_LOCAL_VIDEOS__ = true;

  /* ---------- scene painters ---------- */
  const C = {
    bg: (x, a, b) => { const g = x.createLinearGradient(0, 0, 0, 500); g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, 0, 900, 500); },
    t: (x, s, tx, ty, size, col, align) => { x.font = "bold " + (size || 22) + "px Courier New"; x.textAlign = align || "left"; x.fillStyle = "rgba(0,0,0,.6)"; x.fillText(s, tx + 2, ty + 2); x.fillStyle = col || "#fff"; x.fillText(s, tx, ty); x.textAlign = "left"; },
    circle: (x, px, py, r, c) => { x.fillStyle = c; x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill(); },
    star: (x, px, py, r, c) => { x.fillStyle = c; x.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 4 * Math.PI / 5; x.lineTo(px + Math.cos(a) * r, py + Math.sin(a) * r); } x.closePath(); x.fill(); }
  };
  const STYLES = {
    rome(x, t) {
      C.bg(x, "#3a2a1a", "#1a1208");
      // empire map blob shrinking
      const w = 560 - ((t % 24) / 24) * 380;
      x.fillStyle = "#8a6a3a"; x.fillRect(170, 140, w, 220);
      x.fillStyle = "#a88a4a"; x.fillRect(170, 140, w, 220); x.strokeStyle = "#5a4020"; x.lineWidth = 4; x.strokeRect(170, 140, w, 220);
      for (let i = 0; i < 6; i++) { const px = 200 + i * 90; if (px < 170 + w) { C.circle(x, px, 250, 10, "#c830"); } }
      C.t(x, "ROME", (450 - w / 2), 130, 26, "#ffe66d", "center");
      for (let i = 0; i < 40; i++) { const fx = (i * 137 + ((t * 30) % 900)) % 900; C.circle(x, fx, (i * 53) % 500, 2, "rgba(255,120,60,.5)"); }
    },
    blackhole(x, t) {
      C.bg(x, "#050f", "#0a0a20");
      for (let i = 0; i < 70; i++) { const a = i * 2.4 + t * .5, r = 30 + ((i * 37) % 180); C.circle(x, 450 + Math.cos(a) * r, 250 + Math.sin(a) * r * .5, 1.6, "rgba(150,180,255,.7)"); }
      // accretion disk
      for (let i = 0; i < 3; i++) { x.strokeStyle = "rgba(255,180,80," + (.5 - i * .13) + ")"; x.lineWidth = 10 - i * 3; x.beginPath(); x.ellipse(450, 250, 120 + i * 24, 44 + i * 10, t * .2, 0, Math.PI * 2); x.stroke(); }
      C.circle(x, 450, 250, 58, "#000"); x.strokeStyle = "#ffd27a"; x.lineWidth = 3; x.stroke();
    },
    ai(x, t) {
      C.bg(x, "#0a1420", "#101a30");
      // neural net
      const layers = [4, 6, 6, 3];
      let px = 150; const pos = [];
      layers.forEach((n, li) => { const arr = []; for (let i = 0; i < n; i++)arr.push([px, 120 + i * (260 / n)]); pos.push(arr); px += 200; });
      for (let li = 0; li < pos.length - 1; li++)for (const a of pos[li]) for (const b of pos[li + 1]) {
        x.strokeStyle = "rgba(100,234,255," + (.12 + .1 * Math.sin(t * 2 + li + a[0])) + ")"; x.lineWidth = 1.5;
        x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
      }
      pos.forEach((arr, li) => arr.forEach(p => C.circle(x, p[0] + Math.sin(t * 3 + li) * 4, p[1], 8, li === pos.length - 1 ? "#ff72c8" : "#64eaff")));
    },
    cell(x, t) {
      C.bg(x, "#101a10", "#1a2a1a");
      x.fillStyle = "rgba(140,200,140,.25)"; x.beginPath(); x.ellipse(450, 250, 200, 150, 0, 0, Math.PI * 2); x.fill();
      // organelles drifting
      const org = [["#3a8a4a", 70], ["#c8a83a", 120], ["#8a5ac8", 170], ["#3a8ac8", 220]];
      org.forEach((o, i) => { const a = t * .4 + i * 1.6; C.circle(x, 450 + Math.cos(a) * 120, 250 + Math.sin(a * 1.3) * 80, o[1] === 70 ? 26 : 18, o[0]); });
      C.circle(x, 450 + Math.cos(t * .3) * 14, 250 + Math.sin(t * .3) * 10, 40, "#2a6a8a");
      x.fillStyle = "rgba(255,255,255,.15)"; x.beginPath(); x.ellipse(450, 250, 200, 150, 0, 0, Math.PI * 2); x.stroke();
    },
    egypt(x, t) {
      C.bg(x, "#e8c87a", "#c89848");
      x.fillStyle = "#a87a30"; x.beginPath(); x.moveTo(200, 400); x.lineTo(450, 140); x.lineTo(700, 400); x.closePath(); x.fill();
      x.fillStyle = "#c89a48"; x.beginPath(); x.moveTo(450, 140); x.lineTo(700, 400); x.lineTo(560, 400); x.closePath(); x.fill();
      C.circle(x, 750, 90, 34, "#fff8d0"); C.circle(x, 738, 80, 30, "#e8c87a");
      for (let i = 0; i < 5; i++) { const px = 100 + i * 30 + ((t * 20) % 40); C.circle(x, px, 420, 7, "#5a3a18"); }
    },
    infinity(x, t) {
      C.bg(x, "#0a0a1a", "#141430");
      x.strokeStyle = "#64eaff"; x.lineWidth = 3; x.beginPath();
      for (let s = 0; s < 200; s++) { const u = s / 200 * Math.PI * 2 + t * .3; const px = 450 + 250 * Math.sin(u), py = 250 + 120 * Math.sin(u) * Math.cos(u); s === 0 ? x.moveTo(px, py) : x.lineTo(px, py); }
      x.stroke();
      C.t(x, "∞", (440 + Math.sin(t) * 10), 250, 64, "#ffe66d", "center");
    },
    mars(x, t) {
      C.bg(x, "#2a1008", "#482010");
      x.fillStyle = "#c85828"; x.beginPath(); x.arc(450, 260, 150, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#a84820"; for (let i = 0; i < 8; i++) { x.beginPath(); x.arc(380 + i * 22, 220 + (i % 3) * 40, 12 + (i % 4) * 6, 0, Math.PI * 2); x.fill(); }
      // rocket approaching
      const rx = 200 + ((t * 60) % 420);
      x.fillStyle = "#e0e8ff"; x.fillRect(rx, 180, 26, 12); x.fillStyle = "#ff5878"; x.fillRect(rx - 8, 182, 8, 8);
      for (let i = 0; i < 3; i++)C.circle(x, 760 + i * 40, 120, 10, "rgba(255,255,255,.6)");
    },
    habits(x, t) {
      C.bg(x, "#1a1424", "#241a34");
      for (let d = 0; d < 7; d++)for (let r = 0; r < 5; r++) {
        const on = (d * 5 + r + Math.floor(t * .7)) % 7 < 3;
        x.fillStyle = on ? "#63f59a" : "#2a3260";
        x.fillRect(200 + r * 100, 110 + d * 44, 70, 32);
      }
      C.t(x, "HABIT TRACKER", 450, 80, 24, "#ffe66d", "center");
    },
    zombie(x, t) {
      C.bg(x, "#101810", "#0a0f0a");
      x.fillStyle = "#20301a"; x.fillRect(0, 430, 900, 70);
      for (let i = 0; i < 6; i++) {
        const zx = ((t * 40 + i * 160) % 1100) - 80;
        x.fillStyle = "#5a7a4a"; x.fillRect(zx, 360 + Math.sin(t * 6 + i) * 4, 22, 70);
        C.circle(x, zx + 11, 350 + Math.sin(t * 6 + i) * 4, 13, "#7a9a5a");
        x.fillStyle = "#c830"; x.fillRect(zx + 6, 346 + Math.sin(t * 6 + i) * 4, 4, 4); x.fillRect(zx + 12, 346 + Math.sin(t * 6 + i) * 4, 4, 4);
      }
      x.fillStyle = "#8a6a3a"; x.fillRect(700, 300, 120, 170); x.fillStyle = "#5a4020"; x.beginPath(); x.moveTo(690, 300); x.lineTo(760, 250); x.lineTo(830, 300); x.closePath(); x.fill();
    },
    timestop(x, t) {
      C.bg(x, "#0a0a14", "#12122a");
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2;
        x.strokeStyle = "rgba(100,234,255,.5)"; x.lineWidth = 4;
        x.beginPath(); x.moveTo(450, 250); x.lineTo(450 + Math.cos(a) * 160, 250 + Math.sin(a) * 160); x.stroke();
        C.circle(x, 450 + Math.cos(a) * 160, 250 + Math.sin(a) * 160, 6, "#64eaff");
      }
      if (Math.sin(t * .5) > .3) { C.t(x, "⏸ STOPPED", 450, 470, 20, "#ff5878", "center"); }
    },
    ocean(x, t) {
      C.bg(x, "#062038", "#0a3a5a");
      for (let i = 0; i < 8; i++) {
        x.fillStyle = "rgba(120,220,255," + (.08 + i * .02) + ")";
        x.beginPath(); x.arc(450, 560, 60 + i * 46 + Math.sin(t * 1.5 + i) * 8, Math.PI, Math.PI * 2); x.fill();
      }
      for (let i = 0; i < 7; i++) {
        const a = t * .5 + i; const fx = 450 + Math.cos(a + t) * (60 + i * 38), fy = 200 + Math.sin(a * .7) * 100 + i * 18;
        C.circle(x, fx, fy, 4, "rgba(160,255,220,.8)");
      }
      x.fillStyle = "#2a4a6a"; x.fillRect(80, 420, 120, 80); x.fillStyle = "#1a3a5a"; x.fillRect(700, 440, 140, 60);
    },
    volcano(x, t) {
      C.bg(x, "#180a08", "#2a1410");
      x.fillStyle = "#3a2418"; x.beginPath(); x.moveTo(180, 460); x.lineTo(450, 150); x.lineTo(720, 460); x.closePath(); x.fill();
      for (let i = 0; i < 10; i++) {
        const p = (t * .8 + i * .1) % 1; const px = 450 + Math.sin(i * 2.7) * p * 140, py = 150 - p * 260;
        C.circle(x, px, py + 460, 6 - p * 4, "rgba(255," + (140 - Math.floor(p * 90)) + ",40," + (1 - p) + ")");
      }
      x.fillStyle = "#ff7a30"; x.beginPath(); x.moveTo(410, 180); x.lineTo(450, 150); x.lineTo(490, 180); x.closePath(); x.fill();
    },
    army(x, t) {
      C.bg(x, "#2a2010", "#3a2c18");
      for (let r2 = 0; r2 < 4; r2++)for (let i = 0; i < 8; i++) {
        const px = 170 + i * 70 + r2 * 10, py = 180 + r2 * 60 + Math.sin(t * 2 + i * .5) * 3;
        x.fillStyle = r2 % 2 ? "#c830" : "#8a2020"; x.fillRect(px, py, 20, 36);
        x.fillStyle = "#c8a86a"; x.fillRect(px + 4, py - 10, 12, 10);
      }
      C.t(x, "legio I", 140, 150, 16, "#ffe66d");
    },
    moon(x, t) {
      C.bg(x, "#020208", "#0a0a1e");
      C.circle(x, 450, 250, 140, "#b8c0cc");
      x.fillStyle = "#8a92a0"; for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(380 + (i * 67) % 140, 190 + (i * 41) % 120, 10 + (i % 4) * 7, 0, Math.PI * 2); x.fill(); }
      // lander
      const ly = 140 + Math.sin(t) * 6;
      x.fillStyle = "#e0e8ff"; x.fillRect(160, ly, 24, 16); x.strokeStyle = "#e0e8ff"; x.lineWidth = 2;
      x.beginPath(); x.moveTo(162, ly + 16); x.lineTo(154, ly + 30); x.moveTo(182, ly + 16); x.lineTo(190, ly + 30); x.stroke();
      C.circle(x, 740, 100, 44, "#ffe9a0");
    },
    dino(x, t) {
      C.bg(x, "#2a3418", "#4a5a28");
      x.fillStyle = "#6a8a3a"; x.fillRect(0, 430, 900, 70);
      // walking dino silhouette
      const dx = ((t * 50) % 1100) - 100;
      x.fillStyle = "#3a4a20"; x.fillRect(dx, 330, 90, 50); x.fillRect(dx + 70, 300, 36, 80);
      x.fillRect(dx + 86, 290, 26, 18); x.fillRect(dx - 30, 340, 40, 14);
      x.fillRect(dx + 8, 380 + Math.sin(t * 8) * 8, 10, 50); x.fillRect(dx + 40, 380 - Math.sin(t * 8) * 8, 10, 50);
      for (let i = 0; i < 4; i++)C.t(x, "🦴", 100 + i * 200 + Math.sin(t + i) * 20, 110, 20, "#e8d8b0", "center");
    },
    gamedev(x, t) {
      C.bg(x, "#0c0c1c", "#141430");
      for (let r2 = 0; r2 < 12; r2++) {
        x.fillStyle = "rgba(100,234,255," + (.15 + (r2 % 3) * .1) + ")";
        x.font = "14px monospace";
        x.fillText(["function update(){", "  player.x += vx;", "  if(jump) vy=-9.8;", "  collide();", "  render();}", "// bug fixed :)", "level++;", "spawn(enemy);", "score++", "save();", "loop(60fps)", "ship it!"][r2], 60 + ((t * 12) % 40), 70 + r2 * 34);
      }
      C.circle(x, 780, 120 + Math.sin(t * 2) * 10, 26, "#63f59a");
    },
    pi(x, t) {
      C.bg(x, "#12101e", "#1e1a30");
      x.strokeStyle = "#64eaff"; x.lineWidth = 3;
      x.beginPath(); x.arc(450, 230, 120, 0, Math.PI * 2); x.stroke();
      x.strokeStyle = "#ffe66d"; x.beginPath(); x.moveTo(450, 230); x.lineTo(450 + 120 * Math.cos(t * .5), 230 + 120 * Math.sin(t * .5)); x.stroke();
      const unw = (Math.sin(t * .4) + 1) / 2;
      x.strokeStyle = "#63f59a"; x.lineWidth = 4;
      x.beginPath(); x.moveTo(330, 410); x.lineTo(330 + 240 * unw, 410); x.stroke();
      C.t(x, "π = 3.14159…", 450, 470, 26, "#ffe66d", "center");
      C.t(x, "C ÷ d — every circle, always", 450, 60, 18, "#c8f0ff", "center");
    },
    pompeii(x, t) {
      C.bg(x, "#1c0f0c", "#2c1812");
      x.fillStyle = "#3a2418"; x.beginPath(); x.moveTo(150, 470); x.lineTo(450, 170); x.lineTo(750, 470); x.closePath(); x.fill();
      for (let i = 0; i < 24; i++) {
        const p = ((t * .5 + i * .04) % 1);
        C.circle(x, 450 + Math.sin(i * 2.2) * p * 130, 160 - p * 180, 10 - p * 6, "rgba(200,190,180," + (0.7 - p * .7) + ")");
      }
      x.fillStyle = "#4a3a30";
      for (let i = 0; i < 9; i++) { x.fillRect(60 + i * 90, 430 - ((i % 3) * 10), 56, 40); x.fillRect(70 + i * 90, 415, 20, 18); }
      x.fillStyle = "rgba(255,120,40," + (.4 + .3 * Math.sin(t * 3)) + ")";
      x.beginPath(); x.moveTo(410, 200); x.lineTo(450, 170); x.lineTo(490, 200); x.closePath(); x.fill();
      C.t(x, "79 AD — one day of daylight left", 450, 60, 18, "#ffb090", "center");
    },
    iss(x, t) {
      C.bg(x, "#020208", "#0a0f20");
      C.circle(x, 160, 160, 90, "#2a5a9a");
      x.fillStyle = "#1a3a6a"; x.beginPath(); x.arc(140, 140, 26, 0, Math.PI * 2); x.arc(190, 190, 18, 0, Math.PI * 2); x.fill();
      const a = t * .4, sx = 450 + Math.cos(a) * 180, sy = 250 + Math.sin(a) * 60;
      x.fillStyle = "#e0e8ff"; x.fillRect(sx - 30, sy - 6, 60, 12);
      x.fillStyle = "#3a6aff"; x.fillRect(sx - 56, sy - 3, 26, 6); x.fillRect(sx + 30, sy - 3, 26, 6);
      for (let i = 0; i < 30; i++) C.circle(x, (i * 151) % 900, (i * 89) % 500, 1.4, "rgba(255,255,255,.7)");
      C.t(x, "16 sunrises a day", 450, 470, 20, "#c8f0ff", "center");
    },
    internet(x, t) {
      C.bg(x, "#0a1020", "#101a30");
      const nodes = [[150, 120], [320, 90], [500, 150], [700, 100], [820, 220], [620, 260], [380, 280], [200, 320], [450, 380], [720, 400]];
      nodes.forEach((n, i) => nodes.forEach((m, j) => {
        if (j > i && (i + j) % 3 === 0) {
          const p = (t * .5 + i * .2) % 1;
          const px = n[0] + (m[0] - n[0]) * p, py = n[1] + (m[1] - n[1]) * p;
          x.strokeStyle = "rgba(100,234,255,.15)"; x.lineWidth = 1.5; x.beginPath(); x.moveTo(n[0], n[1]); x.lineTo(m[0], m[1]); x.stroke();
          C.circle(x, px, py, 4, "#ffe66d");
        }
      }));
      nodes.forEach((n, i) => C.circle(x, n[0], n[1], 9, i % 2 ? "#ff72c8" : "#64eaff"));
      C.t(x, "your data, hopping the planet", 450, 470, 18, "#c8f0ff", "center");
    },
    dna(x, t) {
      C.bg(x, "#101828", "#182438");
      const cols = ["#63f59a", "#ff72c8", "#ffe66d", "#64eaff"];
      for (let s = 0; s < 40; s++) {
        const y = 40 + s * 11, ph = y * .05 - t * 1.5;
        const x1 = 450 + Math.sin(ph) * 130, x2 = 450 + Math.sin(ph + Math.PI) * 130;
        x.strokeStyle = "rgba(100,234,255,.5)"; x.lineWidth = 2; x.beginPath(); x.moveTo(x1, y); x.lineTo(x2, y); x.stroke();
        C.circle(x, x1, y, 5, cols[s % 4]); C.circle(x, x2, y, 5, cols[(s + 2) % 4]);
      }
      C.t(x, "A · T · G · C — 4 letters, 3 billion long", 450, 480, 16, "#c8f0ff", "center");
    },
    /* ---- multi-scene storyboard extras ---- */
    brainsim(x, t) {
      C.bg(x, "#0a1020", "#101830");
      // stylized brain with lightning thought-paths
      x.fillStyle = "#e8a0c8"; x.beginPath(); x.ellipse(450, 240, 190, 140, 0, 0, Math.PI * 2); x.fill();
      x.strokeStyle = "#c870a8"; x.lineWidth = 3;
      for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(450, 240, 30 + i * 28, .4, Math.PI - .4); x.stroke(); }
      x.fillStyle = "#3a2a4a"; x.fillRect(240, 240, 420, 12);
      for (let i = 0; i < 8; i++) {
        const sx = 260 + ((i * 137 + t * 60) % 380), sy = 170 + (i * 53) % 140;
        x.strokeStyle = "rgba(255,230,109,.8)"; x.lineWidth = 2;
        x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + 16, sy + 8); x.lineTo(sx + 4, sy + 14); x.lineTo(sx + 20, sy + 24); x.stroke();
      }
    },
    aiday(x, t) {
      C.bg(x, "#0c1424", "#121a30");
      // human + robot side by side
      x.fillStyle = "#f3bd83"; x.fillRect(240, 200, 40, 46); x.fillRect(230, 246, 60, 90);
      x.fillStyle = "#64eaff"; x.fillRect(244, 188, 32, 16);
      x.fillStyle = "#b8c8e8"; x.fillRect(620, 200, 40, 46); x.fillRect(610, 246, 60, 90);
      x.fillStyle = "#8a94b8"; x.fillRect(630, 190, 22, 8); C.circle(x, 640, 214, 9, "#4ef0ff");
      x.strokeStyle = "#ffe66d"; x.lineWidth = 2; x.setLineDash([6, 6]);
      x.beginPath(); x.moveTo(300, 250); x.lineTo(600, 250); x.stroke(); x.setLineDash([]);
      C.t(x, "partners, not replacements", 450, 130, 18, "#9fc0ff", "center");
    },
    powerplant(x, t) {
      C.bg(x, "#101a10", "#1a2a1a");
      // cell with glowing mitochondria
      x.strokeStyle = "rgba(140,200,140,.5)"; x.lineWidth = 3; x.beginPath(); x.ellipse(450, 250, 210, 150, 0, 0, Math.PI * 2); x.stroke();
      for (let i = 0; i < 6; i++) {
        const mx = 350 + (i % 3) * 90, my = 190 + Math.floor(i / 3) * 100;
        x.fillStyle = "#c8603a"; x.beginPath(); x.ellipse(mx, my, 26, 16, .5, 0, Math.PI * 2); x.fill();
        x.strokeStyle = "#ff9a4a"; x.lineWidth = 2; x.beginPath(); x.ellipse(mx, my, 26, 16, .5, 0, Math.PI * 2); x.stroke();
        const gl = .4 + .3 * Math.sin(t * 3 + i);
        x.fillStyle = "rgba(255,220,120," + gl + ")"; x.beginPath(); x.ellipse(mx, my, 10, 6, .5, 0, Math.PI * 2); x.fill();
      }
      C.t(x, "mitochondria: sugar → energy", 450, 460, 16, "#c8f0c8", "center");
    },
    celldivide(x, t) {
      C.bg(x, "#0e1810", "#162418");
      const ph = (t % 2) / 2;               // 0..1 loop: pinch then split
      const sep = ph * 120;
      for (let i = 0; i < 2; i++) {
        const dx = i ? sep / 2 : -sep / 2;
        x.fillStyle = "rgba(140,200,140,.35)"; x.beginPath(); x.ellipse(450 + dx, 250, 130 - ph * 30, 100 - ph * 20, 0, 0, Math.PI * 2); x.fill();
        x.strokeStyle = "rgba(140,200,140,.7)"; x.stroke();
        x.fillStyle = "#2a6a8a"; x.beginPath(); x.arc(450 + dx, 250, 22, 0, Math.PI * 2); x.fill();
      }
      C.t(x, ph > .5 ? "two cells" : "one cell, pinching", 450, 460, 16, "#c8f0c8", "center");
    },
    pyramidbuild(x, t) {
      C.bg(x, "#e8c87a", "#c89848");
      const stage = (t % 4) / 4;           // build-up loop
      const h = stage * 260;
      x.fillStyle = "#a87a30"; x.beginPath(); x.moveTo(180, 410); x.lineTo(450, 410 - h); x.lineTo(720, 410); x.closePath(); x.fill();
      x.fillStyle = "#c89a48"; x.beginPath(); x.moveTo(450, 410 - h); x.lineTo(720, 410); x.lineTo(560, 410); x.closePath(); x.fill();
      // block carriers
      for (let i = 0; i < 4; i++) {
        const bx = 120 + ((t * 40 + i * 60) % 500);
        x.fillStyle = "#5a3a18"; x.fillRect(bx, 396, 16, 12); x.fillStyle = "#f3bd83"; x.fillRect(bx + 2, 384, 10, 10);
      }
      C.t(x, "2.3 million blocks", 450, 120, 18, "#7a5a28", "center");
    },
    sphinx(x, t) {
      C.bg(x, "#e0c070", "#c09840");
      x.fillStyle = "#a87a30"; x.fillRect(280, 260, 340, 90);
      x.fillStyle = "#c89a48"; x.fillRect(400, 200, 100, 70);   // head
      x.fillStyle = "#8a6a28"; x.fillRect(430, 230, 40, 18);    // face hint
      // sun behind
      C.circle(x, 450, 130, 44 + Math.sin(t) * 3, "#fff0c0");
      for (let i = 0; i < 14; i++) { const fx = (i * 97 + t * 30) % 900; x.fillStyle = "rgba(160,110,40,.4)"; x.fillRect(fx, 370 + (i * 31) % 80, 3, 3); }
      C.t(x, "guarding for 4500 years", 450, 440, 17, "#7a5a28", "center");
    },
    hotel(x, t) {
      C.bg(x, "#12101e", "#1c1830");
      // rooms stacking upward forever
      for (let f = 0; f < 8; f++)for (let r = 0; r < 6; r++) {
        const lit = ((f * 6 + r + Math.floor(t * 2)) % 9) < 4;
        x.fillStyle = lit ? "#ffe66d" : "#2a2f63";
        x.fillRect(180 + r * 90, 420 - f * 48, 70, 36);
      }
      // guest moving up one room
      const gy = 420 - ((Math.floor(t) % 8) * 48);
      x.fillStyle = "#ff72c8"; x.beginPath(); x.arc(215, gy + 18, 10, 0, Math.PI * 2); x.fill();
      C.t(x, "full — yet always room for one more", 450, 60, 17, "#ffe66d", "center");
    },
    bigger(x, t) {
      C.bg(x, "#0c0a18", "#161230");
      // nested circles: infinity inside infinity
      const pulse = 1 + Math.sin(t * 1.5) * .1;
      x.strokeStyle = "#64eaff"; x.lineWidth = 3;
      for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(450, 250, (50 + i * 42) * pulse, 0, Math.PI * 2); x.stroke(); }
      x.strokeStyle = "#ff72c8"; x.beginPath();
      for (let s = 0; s < 160; s++) { const u = s / 160 * Math.PI * 2 + t * .4; const px = 450 + 60 * Math.sin(u), py = 250 + 30 * Math.sin(u) * Math.cos(u) * 2; s === 0 ? x.moveTo(px, py) : x.lineTo(px, py); }
      x.stroke();
      C.t(x, "countably < uncountably", 450, 470, 18, "#9fc0ff", "center");
    },
    rover(x, t) {
      C.bg(x, "#2a1008", "#482010");
      x.fillStyle = "#c85828"; x.beginPath(); x.arc(450, 560, 320, 0, Math.PI * 2); x.fill();
      // horizon
      x.fillStyle = "#8a3a18"; x.fillRect(0, 320, 900, 180);
      // rover on wheels
      const rx = 200 + ((t * 26) % 500);
      x.fillStyle = "#d8d8e0"; x.fillRect(rx, 280, 70, 34); x.fillRect(rx + 12, 262, 30, 20);
      x.strokeStyle = "#4ef0ff"; x.lineWidth = 2; x.beginPath(); x.moveTo(rx + 42, 262); x.lineTo(rx + 60, 238); x.stroke();
      x.fillStyle = "#333"; [8, 34, 58].forEach(wx => { x.beginPath(); x.arc(rx + wx, 318, 9, 0, Math.PI * 2); x.fill(); });
      for (let i = 0; i < 12; i++) C.circle(x, (i * 173) % 900, (i * 61) % 500, 1.4, "rgba(255,220,180,.5)");
      C.t(x, "Perseverance, still driving", 450, 100, 17, "#ffd8b0", "center");
    },
    colony(x, t) {
      C.bg(x, "#2a1008", "#3a1a0c");
      x.fillStyle = "#8a3a18"; x.fillRect(0, 340, 900, 160);
      // habitat domes
      for (let i = 0; i < 3; i++) {
        const dx = 180 + i * 240;
        x.fillStyle = "#c8d8e8"; x.globalAlpha = .85; x.beginPath(); x.arc(dx, 340, 56, Math.PI, 0); x.fill(); x.globalAlpha = 1;
        x.strokeStyle = "#4ef0ff"; x.lineWidth = 2; x.beginPath(); x.arc(dx, 340, 56, Math.PI, 0); x.stroke();
        const gl = .3 + .25 * Math.sin(t * 2 + i);
        x.fillStyle = "rgba(255,230,120," + gl + ")"; x.fillRect(dx - 30, 316, 60, 6);
      }
      C.circle(x, 760, 90, 30, "#fff0d0");
      C.t(x, "the first martians might be you", 450, 120, 18, "#ffd8b0", "center");
    },
    stack(x, t) {
      C.bg(x, "#1a1424", "#241a34");
      // existing habit + new habit stacked
      x.fillStyle = "#63f59a"; x.fillRect(220, 200, 200, 60);
      C.t(x, "brush teeth", 320, 236, 18, "#0a2418", "center");
      const blink = Math.sin(t * 4) > 0;
      x.fillStyle = blink ? "#ffe66d" : "#c8a83a"; x.fillRect(220, 280, 200, 60);
      C.t(x, "+ 10 push-ups", 320, 316, 18, "#241a04", "center");
      x.strokeStyle = "#9fc0ff"; x.lineWidth = 3; x.beginPath(); x.moveTo(320, 262); x.lineTo(320, 278); x.stroke();
      C.t(x, "stack the new on the old", 450, 420, 17, "#9fc0ff", "center");
    },
    chain(x, t) {
      C.bg(x, "#141024", "#1e1830");
      // calendar chain: X marks connecting
      for (let d = 0; d < 28; d++) {
        const cx = 140 + (d % 7) * 90, cy = 120 + Math.floor(d / 7) * 80;
        const done = d < ((t * 3) % 28);
        x.fillStyle = done ? "#63f59a" : "#2a2f63"; x.fillRect(cx, cy, 70, 60);
        if (done) { x.strokeStyle = "#0a2418"; x.lineWidth = 4; x.beginPath(); x.moveTo(cx + 14, cy + 30); x.lineTo(cx + 30, cy + 46); x.lineTo(cx + 56, cy + 14); x.stroke(); }
      }
      C.t(x, "don't break the chain", 450, 60, 18, "#ffe66d", "center");
    },
    trench(x, t) {
      C.bg(x, "#02060e", "#040a14");
      // crushing dark + depth ticks
      for (let d = 0; d < 6; d++) {
        x.fillStyle = "rgba(120,180,220," + (.5 - d * .07) + ")";
        x.font = "15px Courier New"; x.fillText((200 + d * 1800) + "m", 40, 60 + d * 80);
      }
      // lone submersible
      const sy = 120 + Math.sin(t * .8) * 30;
      x.fillStyle = "#ffe66d"; x.fillRect(400, sy, 90, 36); x.fillStyle = "#c8a83a"; x.fillRect(470, sy + 8, 22, 20);
      C.circle(x, 416, sy + 16, 12, "#4ef0ff");
      x.strokeStyle = "rgba(255,220,120,.15)"; x.lineWidth = 3; x.beginPath(); x.moveTo(445, sy + 18); x.lineTo(445, 0); x.stroke();
      C.t(x, "elephants on your car", 450, 460, 16, "#9fc0ff", "center");
    },
    biolum(x, t) {
      C.bg(x, "#010408", "#020a12");
      for (let i = 0; i < 26; i++) {
        const a = t * .6 + i * 1.1;
        const fx = 450 + Math.cos(a) * (60 + (i * 41) % 300), fy = 250 + Math.sin(a * .8) * (40 + (i * 67) % 160);
        const gl = .35 + .35 * Math.sin(t * 2.4 + i);
        C.circle(x, fx, fy, 5 + (i % 3) * 2.4, "rgba(120,255,220," + gl + ")");
      }
      // anglerfish silhouette with lure
      x.fillStyle = "#0a1410"; x.beginPath(); x.ellipse(650, 330, 70, 40, 0, 0, Math.PI * 2); x.fill();
      x.strokeStyle = "#0a1410"; x.lineWidth = 4; x.beginPath(); x.moveTo(640, 296); x.quadraticCurveTo(620, 250, 600, 240); x.stroke();
      C.circle(x, 598, 238, 8, "rgba(255,240,150,.9)");
    },
    eruption(x, t) {
      C.bg(x, "#0c0504", "#1a0a06");
      x.fillStyle = "#241410"; x.beginPath(); x.moveTo(140, 470); x.lineTo(450, 130); x.lineTo(760, 470); x.closePath(); x.fill();
      // violent ejecta
      for (let i = 0; i < 14; i++) {
        const p = (t * 1.2 + i * .07) % 1;
        const ex = 450 + Math.sin(i * 2.1) * p * 190, ey = 120 - p * 300;
        C.circle(x, ex, ey, 8 - p * 5, "rgba(255," + (150 - p * 100 | 0) + ",40," + (1 - p) + ")");
      }
      x.fillStyle = "#ff5a20"; x.beginPath(); x.arc(450, 118, 26 + Math.sin(t * 5) * 5, 0, Math.PI * 2); x.fill();
      // glowing slopes
      x.strokeStyle = "rgba(255,120,40,.6)"; x.lineWidth = 5;
      x.beginPath(); x.moveTo(430, 140); x.lineTo(300, 470); x.moveTo(470, 140); x.lineTo(600, 470); x.stroke();
    },
    aftermath(x, t) {
      C.bg(x, "#100b08", "#1c1410");
      // dark sky + drifting ash + buried rooftops
      x.fillStyle = "#241a14"; x.fillRect(0, 400, 900, 100);
      for (let i = 0; i < 4; i++) x.fillStyle = "#3a2a20", x.fillRect(120 + i * 180, 360, 120, 44);
      for (let i = 0; i < 60; i++) { const ax = (i * 149 + t * 24) % 900, ay = (i * 83 + t * 34) % 470; x.fillStyle = "rgba(200,190,180,.4)"; x.fillRect(ax, ay, 3, 3); }
      x.fillStyle = "#8a7a70"; x.fillRect(640, 330, 130, 36);   // half-buried house
      C.t(x, "the sky goes dark at noon", 450, 100, 17, "#c8b8a8", "center");
    },
    roads(x, t) {
      C.bg(x, "#2a2010", "#3a2c18");
      // radiating roads from Rome
      x.strokeStyle = "#c8a86a"; x.lineWidth = 3;
      for (let i = 0; i < 9; i++) {
        const a = i / 9 * Math.PI * 2 + .3;
        x.beginPath(); x.moveTo(450, 260); x.lineTo(450 + Math.cos(a) * 380, 260 + Math.sin(a) * 200); x.stroke();
      }
      C.circle(x, 450, 260, 44, "#ffe66d");
      // marching legion dot
      const lp = (t * .4) % 1;
      x.fillStyle = "#c83030"; x.beginPath(); x.arc(450 + Math.cos(.3 + lp * 1.2) * 380 * lp, 260 + Math.sin(.3 + lp * 1.2) * 200 * lp, 8, 0, Math.PI * 2); x.fill();
      C.t(x, "80,000 km of stone", 450, 480, 17, "#ffe66d", "center");
    },
    eagle(x, t) {
      C.bg(x, "#1a1408", "#28200f");
      // golden eagle standard, proud
      x.fillStyle = "#8a6a2a"; x.fillRect(442, 160, 16, 260);
      x.fillStyle = "#ffe66d"; x.beginPath(); x.moveTo(450, 120); x.lineTo(390, 170); x.lineTo(418, 176); x.lineTo(400, 210); x.lineTo(450, 190); x.lineTo(500, 210); x.lineTo(482, 176); x.lineTo(510, 170); x.closePath(); x.fill();
      x.fillStyle = "#c83030"; x.fillRect(430, 240, 40, 60);
      const gl = .3 + .2 * Math.sin(t * 2);
      x.fillStyle = "rgba(255,230,109," + gl + ")"; x.beginPath(); x.arc(450, 165, 70, 0, Math.PI * 2); x.fill();
      C.t(x, "never captured without a fight", 450, 470, 17, "#ffe66d", "center");
    },
    moonwalk(x, t) {
      C.bg(x, "#020208", "#06060f");
      C.circle(x, 720, 110, 60, "#b8c0cc");
      x.fillStyle = "#8a8a90"; x.fillRect(0, 400, 900, 100);
      // astronaut bounding
      const bx = 260 + Math.sin(t * .9) * 120, by = 330 - Math.abs(Math.sin(t * 1.6)) * 40;
      x.fillStyle = "#e8ecf0"; x.fillRect(bx, by, 26, 44);
      x.fillStyle = "#fff"; x.fillRect(bx + 4, by - 16, 18, 14);
      x.fillStyle = "#0a0a1a"; x.fillRect(bx + 8, by - 12, 10, 6);   // visor
      x.strokeStyle = "#e8ecf0"; x.lineWidth = 4;
      x.beginPath(); x.moveTo(bx - 8, by + 44); x.lineTo(bx + 2, by + 60); x.moveTo(bx + 22, by + 44); x.lineTo(bx + 12, by + 60); x.stroke();
      for (let i = 0; i < 30; i++) C.circle(x, (i * 211) % 900, (i * 97) % 300, 1.2, "rgba(255,255,255,.7)");
    },
    return(x, t) {
      C.bg(x, "#020208", "#0a0a18");
      // artemis rocket on pad + moon
      x.fillStyle = "#8a8a90"; x.fillRect(0, 420, 900, 80);
      x.fillStyle = "#d8d8e0"; x.fillRect(430, 180, 40, 230);
      x.fillStyle = "#ff5878"; x.fillRect(430, 165, 40, 18);
      x.fillStyle = "#c8c8d0"; x.fillRect(418, 408, 14, 12); x.fillRect(468, 408, 14, 12);
      C.circle(x, 720, 110, 54, "#b8c0cc");
      const gl = .25 + .2 * Math.sin(t * 2);
      x.fillStyle = "rgba(255,230,120," + gl + ")"; x.fillRect(448, 240, 4, 170);
      C.t(x, "Artemis — the return", 450, 120, 18, "#9fc0ff", "center");
    },
    rex(x, t) {
      C.bg(x, "#2a3418", "#4a5a28");
      x.fillStyle = "#5a7a30"; x.fillRect(0, 430, 900, 70);
      // T-rex stalking
      const rx = ((t * 44) % 1000) - 120;
      x.fillStyle = "#3a5a28"; x.fillRect(rx, 320, 110, 55);
      x.fillRect(rx + 90, 280, 42, 70);
      x.fillRect(rx + 118, 260, 34, 26);
      x.fillStyle = "#203a14"; x.fillRect(rx + 128, 268, 8, 5);
      x.fillRect(rx - 26, 330, 44, 15);
      x.fillRect(rx + 12, 375 + Math.sin(t * 7) * 8, 13, 55); x.fillRect(rx + 62, 375 - Math.sin(t * 7) * 8, 13, 55);
      C.t(x, "6 tons of muscle and teeth", 450, 100, 17, "#c8e8a0", "center");
    },
    meteor(x, t) {
      C.bg(x, "#0a0a12", "#141420");
      C.circle(x, 450, 520, 330, "#2a4a6a");   // earth curve
      x.fillStyle = "#4a8a5a"; x.beginPath(); x.arc(450, 520, 330, Math.PI * 1.15, Math.PI * 1.85); x.fill();
      // incoming rock with fire trail
      const mp = (t * .7) % 1.4;
      const mx = 100 + mp * 500, my = 60 + mp * 300;
      for (let k = 1; k < 9; k++) {
        C.circle(x, mx - k * 26, my - k * 15, 7 - k * .6, "rgba(255," + (170 - k * 16) + ",60," + (1 - k * .1) + ")");
      }
      C.circle(x, mx, my, 13, "#ff8a40");
      if (mp > 1.1) { const fl = (mp - 1.1) / .3; x.fillStyle = "rgba(255,240,200," + fl + ")"; x.fillRect(0, 0, 900, 500); }
      C.t(x, mp > 1.1 ? "one bad day" : "it's coming", 450, 470, 18, mp > 1.1 ? "#fff" : "#9fc0ff", "center");
    },
    bug(x, t) {
      C.bg(x, "#0a0a12", "#12121e");
      x.font = "14px monospace";
      for (let r2 = 0; r2 < 9; r2++) {
        x.fillStyle = r2 === 4 ? "#ff5878" : "rgba(100,234,255,.4)";
        x.fillText(["function jump(){", "  vy = -9.8;", "  // TODO fix", "  if(y > floor) y = floor;", "  y -= vy;  // BUG: inverted!", "  collide();", "}", "// build failed (1)", "// build failed (217)"][r2], 70, 80 + r2 * 40);
      }
      const blink = Math.sin(t * 6) > 0;
      x.fillStyle = blink ? "#ff5878" : "#7a2a3a"; x.font = "bold 16px monospace"; x.fillText("🐛 x" + (200 + Math.floor(t * 3)), 640, 60);
    },
    ship(x, t) {
      C.bg(x, "#0c0c1c", "#141430");
      x.fillStyle = "#63f59a"; x.font = "bold 30px 'Courier New'"; x.fillText("BUILD PASSING ✓", 200, 160);
      x.font = "14px monospace"; x.fillStyle = "rgba(100,234,255,.5)";
      x.fillText("47 tests · 0 bugs · 1 dream", 240, 200);
      // rocket lifting off
      const ry = 470 - ((t * 40) % 380);
      x.fillStyle = "#e0e8ff"; x.fillRect(435, ry, 30, 54); x.fillStyle = "#ff5878"; x.fillRect(435, ry - 14, 30, 16);
      for (let k = 0; k < 5; k++) C.circle(x, 450 + (Math.random() - .5) * 18, ry + 58 + k * 8, 6 - k, "rgba(255,180,80," + (1 - k * .18) + ")");
    },
    digits(x, t) {
      C.bg(x, "#12101e", "#1e1a30");
      const digits = "3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196";
      const charsPerFrame = 8;
      const start = Math.floor(t * charsPerFrame) % (digits.length - 60);
      x.font = "bold 26px 'Courier New'"; x.fillStyle = "#ffe66d";
      const row = digits.slice(start, start + 28);
      x.fillText(row, 130, 250);
      x.fillStyle = "rgba(100,234,255,.5)"; x.font = "13px monospace";
      x.fillText("100,000,000,000,000 digits computed", 190, 310);
      // highlight current digit
      const idx = Math.floor(t * 3) % 28;
      x.fillStyle = "#ff72c8"; x.fillRect(130 + idx * 15.6, 232, 15, 26);
      x.fillStyle = "#0a0a18"; x.font = "bold 26px 'Courier New'"; x.fillText(row[idx], 132 + idx * 15.6, 254);
    },
    everywhere(x, t) {
      C.bg(x, "#0e1220", "#161e30");
      // pi appearing in wave, circle, spiral
      const ph = Math.sin(t * 2) * .5 + .5;
      x.strokeStyle = "#64eaff"; x.lineWidth = 3;
      x.beginPath(); for (let s = 0; s < 60; s++) { const px = 100 + s * 12, py = 160 + Math.sin(s * Math.PI / 10 + t * 2) * 34; s === 0 ? x.moveTo(px, py) : x.lineTo(px, py); } x.stroke();
      x.beginPath(); x.arc(200, 320, 64, 0, Math.PI * 2); x.stroke();
      x.beginPath(); for (let s = 0; s < 120; s++) { const u = s / 120 * Math.PI * 6; x.lineTo(560 + Math.cos(u + t) * (6 + s * 1.6), 330 + Math.sin(u + t) * (6 + s * 1.6)); } x.strokeStyle = "#ff72c8"; x.stroke();
      C.t(x, "in every wave, wheel and whirl", 450, 460, 17, "#ffe66d", "center");
    },
    eruption79(x, t) {
      C.bg(x, "#1a0a08", "#2c1410");
      // vesuvius with pine-cloud top
      x.fillStyle = "#241410"; x.beginPath(); x.moveTo(150, 470); x.lineTo(430, 150); x.lineTo(470, 150); x.lineTo(750, 470); x.closePath(); x.fill();
      const grow = (Math.sin(t * .8) + 1) / 2;
      x.fillStyle = "rgba(120,90,80," + (.55 + grow * .3) + ")";
      x.beginPath(); x.moveTo(420, 150); x.quadraticCurveTo(330, 40 - grow * 20, 260, 60);
      x.lineTo(240, 110); x.quadraticCurveTo(360, 100, 420, 160); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(480, 150); x.quadraticCurveTo(560, 30, 640, 60); x.lineTo(660, 110); x.quadraticCurveTo(540, 100, 480, 160); x.closePath(); x.fill();
      for (let i = 0; i < 10; i++) C.circle(x, 440 + (i * 71 + t * 60) % 120, 100 - (i * 37) % 70, 3, "rgba(255,200,140,.6)");
      C.t(x, "the pine cloud, taller than the mountain", 450, 440, 15, "#c8a890", "center");
    },
    ashcast(x, t) {
      C.bg(x, "#241814", "#2e2018");
      // petrified figures + preserved bread
      x.fillStyle = "#4a3a30"; x.fillRect(0, 420, 900, 80);
      for (let i = 0; i < 3; i++) {
        const fx = 240 + i * 180;
        x.fillStyle = "#8a7a70"; x.fillRect(fx, 330, 20, 90); C.circle(x, fx + 10, 322, 11, "#8a7a70");
        x.strokeStyle = "#6a5a50"; x.lineWidth = 3; x.beginPath(); x.moveTo(fx + 4, 350); x.lineTo(fx - 6, 380); x.stroke();
      }
      x.fillStyle = "#c8a86a"; x.beginPath(); x.ellipse(640, 400, 34, 18, .2, 0, Math.PI * 2); x.fill();
      x.strokeStyle = "#8a6a3a"; x.lineWidth = 3; x.stroke();
      for (let i = 0; i < 4; i++) x.fillStyle = "#6a5a40", x.fillRect(614 + i * 15, 392, 10, 4);
      C.t(x, "bread still on the shelf, 1900 years later", 450, 120, 16, "#c8b8a8", "center");
    },
    cables(x, t) {
      C.bg(x, "#040a18", "#081428");
      // world map dots + cables
      for (let i = 0; i < 40; i++) C.circle(x, (i * 197) % 900, 150 + (i * 113) % 220, 2.4, "rgba(140,180,220,.5)");
      const hubs = [[150, 200], [330, 170], [520, 210], [700, 180], [820, 240]];
      for (let i = 0; i < hubs.length - 1; i++) {
        const a = hubs[i], b = hubs[i + 1];
        x.strokeStyle = "#4ef0ff"; x.lineWidth = 3;
        x.beginPath(); x.moveTo(a[0], a[1]); x.quadraticCurveTo((a[0] + b[0]) / 2, 380, b[0], b[1]); x.stroke();
        // packet pulse
        const p = (t * .5 + i * .3) % 1;
        C.circle(x, a[0] + (b[0] - a[0]) * p, 380 + (b[1] - 380) * (p < .5 ? p * 2 : (1 - p) * 2) * (p < .5 ? 1 : 1), 5, "#ffe66d");
      }
      hubs.forEach(h => C.circle(x, h[0], h[1], 7, "#ff72c8"));
      C.t(x, "sharks keep biting them", 450, 460, 16, "#9fc0ff", "center");
    },
    click(x, t) {
      C.bg(x, "#0a1020", "#101a30");
      // laptop + globe with route
      x.fillStyle = "#2a3260"; x.fillRect(330, 220, 240, 140);
      x.fillStyle = "#4ef0ff"; x.fillRect(340, 230, 220, 110);
      C.circle(x, 450, 285, 44, "#2a6a8a");
      x.strokeStyle = "#ffe66d"; x.lineWidth = 2; x.setLineDash([5, 5]);
      x.beginPath(); x.moveTo(416, 274); x.quadraticCurveTo(450, 250, 484, 274); x.quadraticCurveTo(466, 306, 428, 300); x.closePath(); x.stroke(); x.setLineDash([]);
      const p = (t * .8) % 1;
      C.circle(x, 416 + 68 * p, 274 + (p < .5 ? p : 1 - p) * -24, 5, "#ff5878");
      for (let i = 0; i < 9; i++) C.circle(x, (i * 233 + t * 30) % 900, (i * 71) % 440, 1.6, "rgba(255,255,255,.6)");
      C.t(x, "0.1 seconds around the planet", 450, 450, 17, "#9fc0ff", "center");
    },
    ladder(x, t) {
      C.bg(x, "#0e1820", "#142430");
      // big rotating double helix
      for (let s2 = 0; s2 < 30; s2++) {
        const y = 90 + s2 * 11, ph2 = y * .05 - t * 1.4;
        const x1 = 450 + Math.sin(ph2) * 140, x2 = 450 + Math.sin(ph2 + Math.PI) * 140;
        x.strokeStyle = "rgba(100,234,255,.45)"; x.lineWidth = 2.5; x.beginPath(); x.moveTo(x1, y); x.lineTo(x2, y); x.stroke();
        C.circle(x, x1, y, 6, s2 % 2 ? "#63f59a" : "#ff72c8"); C.circle(x, x2, y, 6, s2 % 2 ? "#ffe66d" : "#64eaff");
      }
      C.t(x, "A–T · G–C · the twisted ladder", 450, 440, 17, "#c8f0ff", "center");
    },
    banana(x, t) {
      C.bg(x, "#141408", "#1e2a10");
      // two figures: human + banana with shared DNA strand between
      x.fillStyle = "#f3bd83"; x.fillRect(250, 190, 44, 52); x.fillRect(238, 242, 68, 110);
      x.fillStyle = "#ffe66d"; x.beginPath(); x.ellipse(640, 290, 70, 24, -.5, 0, Math.PI * 2); x.fill();
      x.strokeStyle = "#a88a2a"; x.lineWidth = 3; x.stroke();
      x.fillStyle = "#8a6a2a"; x.fillRect(690, 250, 10, 14);
      x.strokeStyle = "#4ef0ff"; x.lineWidth = 3;
      for (let s2 = 0; s2 < 5; s2++) {
        const y = 220 + s2 * 22, ph2 = y * .3 - t * 2;
        const x1 = 400 + Math.sin(ph2) * 30, x2 = 560 + Math.sin(ph2 + Math.PI) * 30;
        x.beginPath(); x.moveTo(x1, y); x.lineTo(x2, y); x.stroke();
      }
      C.t(x, "60% the same — seriously", 450, 440, 17, "#c8f0a0", "center");
    },
    empire(x, t) {
      C.bg(x, "#2a2014", "#3a2c1c");
      x.fillStyle = "#8a6a3a";
      x.beginPath(); x.ellipse(450, 250, 300, 120, 0, 0, Math.PI * 2); x.fill();
      x.strokeStyle = "#c8a86a"; x.lineWidth = 3; x.stroke();
      // two halves split
      x.strokeStyle = "#ff5878"; x.lineWidth = 4; x.setLineDash([10, 8]);
      x.beginPath(); x.moveTo(450, 130); x.lineTo(450, 370); x.stroke(); x.setLineDash([]);
      x.fillStyle = "#ffe66d"; x.font = "bold 18px 'Courier New'"; x.textAlign = "center";
      x.fillText("WEST", 300, 250); x.fillText("EAST", 600, 250); x.textAlign = "left";
      for (let i = 0; i < 5; i++) C.circle(x, 200 + i * 130 + Math.sin(t + i) * 8, 200 + (i % 2) * 90, 5, "#ff9a4a");
    },
    legionfade(x, t) {
      C.bg(x, "#1a1410", "#241c14");
      for (let i = 0; i < 10; i++) {
        const p = Math.max(0, 1 - (t - 22 + i * .6) * .3);
        x.globalAlpha = p;
        x.fillStyle = "#c8a86a"; x.fillRect(120 + i * 70, 300, 16, 60);
        x.fillStyle = "#8a2020"; x.fillRect(120 + i * 70, 270, 16, 30);
        x.globalAlpha = 1;
      }
      C.t(x, "the legions go home", 450, 220, 20, "#c8a86a", "center");
    },
    star(x, t) {
      C.bg(x, "#050814", "#0a1024");
      for (let i = 0; i < 60; i++) C.circle(x, (i * 137) % 900, (i * 91) % 500, 1.5, "rgba(255,255,255,.8)");
      // big glowing star
      const pulse = 1 + Math.sin(t * 2) * .08;
      C.circle(x, 450, 240, 60 * pulse, "#fff4d0");
      x.fillStyle = "rgba(255,220,120,.25)";
      x.beginPath(); x.arc(450, 240, 90 * pulse, 0, Math.PI * 2); x.fill();
      C.t(x, "fusion: gravity's balance", 450, 460, 18, "#ffe9a0", "center");
    },
    collapse(x, t) {
      C.bg(x, "#04060e", "#080c18");
      // imploding layers
      for (let i = 0; i < 6; i++) {
        const r = Math.max(6, 140 - (t * 30 + i * 26) % 140);
        x.strokeStyle = "rgba(180,200,255," + (.7 - r / 200) + ")"; x.lineWidth = 3;
        x.beginPath(); x.arc(450, 250, r, 0, Math.PI * 2); x.stroke();
      }
      C.circle(x, 450, 250, 10, "#cfe0ff");
      C.t(x, "the core implodes", 450, 460, 18, "#cfe0ff", "center");
    },
    fortify(x, t) {
      C.bg(x, "#0c0f0c", "#121612");
      x.fillStyle = "#1a2418"; x.fillRect(100, 260, 700, 160);
      // boarded windows
      x.fillStyle = "#6a5230";
      for (let i = 0; i < 8; i++) { x.save(); x.translate(180 + i * 80, 300); x.rotate((i % 2 ? .2 : -.2)); x.fillRect(-20, -6, 60, 12); x.restore(); }
      x.fillStyle = "#3a4a2a"; x.fillRect(420, 200, 60, 60); // barricade
      C.t(x, "no entry", 450, 190, 16, "#63f59a", "center");
    },
    greenhouse(x, t) {
      C.bg(x, "#0c1410", "#12241a");
      x.strokeStyle = "#4a8a5a"; x.lineWidth = 3;
      for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(120 + i * 130, 340, 58, Math.PI, 0); x.stroke(); }
      x.fillStyle = "rgba(120,220,140,.15)"; x.fillRect(70, 340, 750, 100);
      for (let i = 0; i < 10; i++) { x.fillStyle = "#2a8a3a"; x.fillRect(140 + i * 66, 380 + Math.sin(t * 2 + i) * 3, 8, 40); }
      C.t(x, "the greenhouse feeds them", 450, 200, 18, "#a0e8b0", "center");
    },
    rebuild(x, t) {
      C.bg(x, "#1a2430", "#28384a");
      x.fillStyle = "#3a4a5a"; x.fillRect(0, 400, 900, 100);
      x.fillStyle = "#ffcc44"; // rising sun
      x.beginPath(); x.arc(450, 400, 90, Math.PI, 0); x.fill();
      // people silhouettes walking out
      for (let i = 0; i < 5; i++) {
        const px = 300 + i * 70 + Math.sin(t + i) * 6;
        x.fillStyle = "#1a2028"; x.fillRect(px, 340, 14, 60); C.circle(x, px + 7, 332, 8, "#1a2028");
      }
      C.t(x, "walk out into the morning", 450, 200, 20, "#ffe9a0", "center");
    },
    frozenworld(x, t) {
      C.bg(x, "#0a0c18", "#121430");
      // frozen rain / hanging objects
      for (let i = 0; i < 24; i++) {
        const px = (i * 89) % 900, py = (i * 67) % 400;
        x.strokeStyle = "rgba(150,220,255,.6)"; x.lineWidth = 2;
        x.beginPath(); x.moveTo(px, py); x.lineTo(px, py + 22); x.stroke();
      }
      // frozen person mid-stride
      x.fillStyle = "#c8e0ff"; x.fillRect(440, 300, 18, 50); C.circle(x, 449, 290, 10, "#c8e0ff");
      x.fillRect(425, 350, 14, 8); x.fillRect(458, 340, 14, 8); // mid-stride legs frozen
      C.t(x, "even the rain hangs still", 450, 200, 18, "#a0d0f0", "center");
    },
    relativemass(x, t) {
      C.bg(x, "#0a0a1a", "#141432");
      // atoms with stopped orbits
      for (let i = 0; i < 5; i++) {
        const cx = 150 + i * 150, cy = 250;
        x.strokeStyle = "rgba(100,234,255,.4)"; x.lineWidth = 1.5;
        x.beginPath(); x.ellipse(cx, cy, 44, 16, i * .5, 0, Math.PI * 2); x.stroke();
        C.circle(x, cx, cy, 8, "#ff72c8");
        // electron frozen on its track
        const a = i; // fixed angle = frozen
        C.circle(x, cx + Math.cos(a) * 44, cy + Math.sin(a) * 16, 4, "#64eaff");
      }
      C.t(x, "you are made of moving atoms", 450, 460, 18, "#c8f0ff", "center");
    },
    issdawn(x, t) {
      C.bg(x, "#020208", "#0a0f24");
      // earth limb with sunrises sweeping
      x.fillStyle = "#1a4a8a"; x.beginPath(); x.arc(450, 620, 300, 0, Math.PI * 2); x.fill();
      x.fillStyle = "rgba(140,200,255,.4)"; x.beginPath(); x.arc(450, 620, 316, 0, Math.PI * 2); x.fill();
      const sx = 450 + Math.cos(t * .8) * 320, sy = 620 - Math.abs(Math.sin(t * .8)) * 320 - 40;
      if (sy < 620) { C.circle(x, sx, sy, 22, "#ffe66d"); x.fillStyle = "rgba(255,230,109,.25)"; x.beginPath(); x.arc(sx, sy, 40, 0, Math.PI * 2); x.fill(); }
      for (let i = 0; i < 20; i++) C.circle(x, (i * 151) % 900, (i * 89) % 220, 1.5, "rgba(255,255,255,.8)");
      C.t(x, "16 sunrises, every day", 450, 80, 20, "#ffe9a0", "center");
    },
    issbody(x, t) {
      C.bg(x, "#0c1020", "#141a30");
      // floating astronaut
      const ay = 250 + Math.sin(t * .8) * 30, ar = Math.sin(t * .5) * .3;
      x.save(); x.translate(450, ay); x.rotate(ar);
      x.fillStyle = "#e8ecf4"; x.fillRect(-18, -14, 36, 46);
      C.circle(x, 0, -26, 15, "#f4f8ff");
      x.fillStyle = "#2a3a5a"; x.fillRect(-18, 4, 36, 6);
      x.fillStyle = "#c8d0e0"; x.fillRect(-34, -10, 14, 10); x.fillRect(20, -10, 14, 10);
      x.fillRect(-14, 32, 10, 18); x.fillRect(4, 32, 10, 18);
      x.restore();
      for (let i = 0; i < 8; i++) { const a = t * .5 + i; C.circle(x, 450 + Math.cos(a) * 120, 250 + Math.sin(a) * 80, 3, "rgba(140,200,255,.5)"); }
      C.t(x, "without gravity, bones forget", 450, 470, 18, "#c8d8ff", "center");
    }
  };

  /* ---------- video library ---------- */
  const LIB = {
    history_rome: { dur: 46, style: "rome", scenes: [[0, "rome", "I. The Greatest Empire"], [12, "empire", "II. Too Big to Rule"], [22, "legionfade", "III. The Long Fall"]], caps: [[0, "By 300 AD, Rome stretched from Britain to Egypt."], [7, "One emperor could not watch every border at once."], [12, "In 395 AD the empire split — East and West."], [17, "The West lost its gold, its grain, its legions."], [22, "Invasions pressed in from every direction."], [28, "In 476 AD, the last Western emperor fell."], [31, "But the East — Byzantium — carried Rome's flame for a thousand more years."]] },
    sci_blackholes: { dur: 44, style: "blackhole", scenes: [[0, "star", "I. A Dying Giant"], [10, "collapse", "II. The Collapse"], [20, "blackhole", "III. The Point of No Return"]], caps: [[0, "Stars burn by balancing gravity against fusion."], [6, "A star ten times our Sun's mass eventually runs out of fuel."], [10, "Without fusion, gravity wins — the core implodes."], [15, "Matter is crushed smaller than a city."], [20, "Past the event horizon, escape velocity exceeds light speed."], [25, "Nothing returns — not rocks, not radio, not light."], [29, "Time itself slows to a stop at the edge."]] },
    ai_future: { dur: 34, style: "ai", scenes: [[0, "ai", "I. Learning Machines"], [10, "brainsim", "II. Inside the Network"], [20, "aiday", "III. What Comes Next"]], caps: [[0, "AI learns patterns from enormous amounts of data."], [5, "Show it a million cats and it learns 'cat'."], [10, "Neural networks are loosely inspired by the brain."], [15, "Layers of simple math add up to something that looks like thought."], [20, "By 2050, AI may assist doctors, pilots and coders."], [25, "The question is not IF — but how we guide it."]] },
    bio_cells: { dur: 36, style: "cell", scenes: [[0, "cell", "I. The Busy City"], [12, "powerplant", "II. The Power Plants"], [22, "celldivide", "III. Making More"]], caps: [[0, "Your body has about 30 trillion cells."], [5, "The nucleus is the control center — it stores DNA."], [12, "Mitochondria burn sugar into usable energy."], [17, "They're tiny power plants, hundreds per cell."], [22, "Cells copy themselves — 3 million every second."], [27, "Every cell is a tiny, busy city."]] },
    hist_egypt: { dur: 36, style: "egypt", scenes: [[0, "egypt", "I. Gifts of the Nile"], [12, "pyramidbuild", "II. Building the Pyramid"], [22, "sphinx", "III. Guardians of Eternity"]], caps: [[0, "The pyramids took about 20 years to build."], [6, "Workers were paid farmers — not slaves."], [12, "Ramps, rollers, and 2.3 million blocks."], [17, "The Nile was Egypt's highway and supermarket."], [22, "Pharaohs ruled as living gods for 3000 years."]] },
    math_infinity: { dur: 34, style: "infinity", scenes: [[0, "infinity", "I. The Endless Symbol"], [10, "hotel", "II. Hilbert's Hotel"], [20, "bigger", "III. Bigger Infinities"]], caps: [[0, "Some infinities are bigger than others."], [5, "Even numbers: infinite. All numbers: also infinite… but bigger."], [10, "Hilbert's Hotel is full — yet always has room for one more."], [15, "Move every guest to the next room. Room 1 is free."], [20, "Cantor proved this shocked every mathematician."], [25, "Infinity is not a number — it's a direction."]] },
    space_mars: { dur: 36, style: "mars", scenes: [[0, "mars", "I. The Red Next Door"], [12, "rover", "II. Our Robot Explorers"], [22, "colony", "III. The First Steps"]], caps: [[0, "Mars is cold, dusty — and the most habitable planet nearby."], [6, "A day on Mars lasts 24 hours and 37 minutes."], [12, "Rovers like Perseverance are already driving there."], [17, "They drill rocks and sniff the air for signs of life."], [22, "Rockets are already testing the journey."], [27, "One day, you might watch a sunset… from Mars."]] },
    psych_habits: { dur: 34, style: "habits", scenes: [[0, "habits", "I. The Loop"], [12, "stack", "II. Habit Stacking"], [22, "chain", "III. Small Wins"]], caps: [[0, "Habits are loops: cue, routine, reward."], [6, "Repeat a loop daily and it becomes automatic."], [12, "Stack a new habit onto an old one — it sticks better."], [17, "After brushing teeth, do ten push-ups."], [22, "Small daily wins beat giant rare efforts."]] },
    zombie_school: { dur: 42, style: "zombie", scenes: [[0, "zombie", "Day 1 — Silence"], [10, "fortify", "Day 9 — The Fortress"], [19, "greenhouse", "Day 21 — Survival"], [26, "rebuild", "Day 30 — Open Doors"]], caps: [[0, "Day 1: the announcements never come."], [4, "Day 9: the gym doors are welded shut from the inside."], [10, "Water from the fountains. Food from the cafeteria freezer."], [15, "Day 21: the greenhouse behind the science wing feeds the survivors."], [19, "Rooftop garden. Rain barrels. A signal fire at dusk."], [25, "Day 30: the roads are clear, and they walk out into the morning."], [28, "School's never looked so good."]] },
    stop_time: { dur: 38, style: "timestop", scenes: [[0, "timestop", "I. The Moment"], [9, "frozenworld", "II. A Frozen World"], [19, "relativemass", "III. Why It Can't Work"]], caps: [[0, "Suppose you could stop time at will."], [4, "The first problem: light would stop too."], [9, "Air would freeze in place like glass — you couldn't walk through it."], [14, "Every photon already in flight would hang motionless."], [19, "And you? You're made of moving atoms."], [23, "No motion means no thought — no 'you' to witness it."], [26, "Time isn't a backdrop. It's the engine of existence."]] },
    vid_ocean: { dur: 38, style: "ocean", scenes: [[0, "ocean", "I. Where Light Dies"], [12, "trench", "II. The Deep"], [22, "biolum", "III. The Glow"]], caps: [[0, "Sunlight dies 200 meters down — the twilight zone."], [6, "Below that: the midnight zone, forever black."], [12, "Pressure at the trench = 1000 elephants on your car."], [17, "90% of ocean life glows in some way."], [22, "Anglerfish, jellyfish, plankton — living lanterns."], [27, "We've mapped more of Mars than our sea floor."]] },
    vid_volcano: { dur: 36, style: "volcano", scenes: [[0, "volcano", "I. The Mountain Breathes"], [12, "eruption", "II. The Unzipping"], [22, "aftermath", "III. The World Cools"]], caps: [[0, "Magma rises because it's lighter than rock."], [6, "Pressure builds until the mountain unzips."], [12, "Pyroclastic flows race at 700 km/h."], [17, "Ash clouds can circle the whole planet."], [22, "Volcanic winters have rewritten history."]] },
    vid_rome: { dur: 36, style: "army", scenes: [[0, "army", "I. The War Machine"], [12, "roads", "II. Roads of Empire"], [22, "eagle", "III. The Eagle Standard"]], caps: [[0, "A legion: 5,000 men, 10 cohorts, one eagle."], [6, "Roads moved soldiers 30 km a day — unheard of."], [12, "80,000 km of road, some still in use today."], [17, "Discipline beat numbers in almost every battle."], [22, "The eagle never fell without a fight."]] },
    vid_space: { dur: 38, style: "moon", scenes: [[0, "moon", "I. The Eagle Lands"], [13, "moonwalk", "II. One Small Step"], [24, "return", "III. We Will Return"]], caps: [[0, "July 20, 1969 — the Eagle lands."], [5, "Computers on board had less memory than a microwave."], [13, "12 humans have walked on the Moon. All between 1969–72."], [18, "Their footprints may last a million years."], [24, "Artemis plans to send the next ones — soon."]] },
    vid_dino: { dur: 36, style: "dino", scenes: [[0, "dino", "I. Rulers of Earth"], [12, "rex", "II. The Tyrant King"], [22, "meteor", "III. The Bad Day"]], caps: [[0, "Dinosaurs ruled for 165 million years."], [6, "That's 1000x longer than humans so far."], [12, "T. rex lived closer to us than to Stegosaurus."], [17, "Most dinosaurs had feathers — like giant birds."], [22, "A 10-km asteroid ended the age in one day."]] },
    vid_coding: { dur: 36, style: "gamedev", scenes: [[0, "gamedev", "I. The Loop"], [12, "bug", "II. The Hunt"], [22, "ship", "III. Ship It"]], caps: [[0, "Every game is a loop: update, draw, repeat."], [6, "Physics is just math deciding where things go."], [12, "Bugs are features that escaped."], [17, "Debugging is 80% of programming. Heroic debugging."], [22, "You are one function away from your first game."]] },
    math_pi: { dur: 34, style: "pi", scenes: [[0, "pi", "I. The Circle's Secret"], [12, "digits", "II. Endless Digits"], [22, "everywhere", "III. Pi Everywhere"]], caps: [[0, "Take any circle. Measure around it: the circumference."], [6, "Measure across it: the diameter."], [12, "Divide them. Every circle ever: 3.14159…"], [17, "Supercomputers have computed 100 trillion digits."], [22, "Pi is infinite, non-repeating, and everywhere."]] },
    hist_pompeii: { dur: 36, style: "pompeii", scenes: [[0, "pompeii", "I. A Day Like Any Other"], [12, "eruption79", "II. The Mountain Explodes"], [22, "ashcast", "III. Frozen in Time"]], caps: [[0, "79 AD: Vesuvius erupted with no warning signs."], [6, "Ash buried Pompeii in 6 meters within hours."], [12, "People ran toward the sea — the sea was boiling."], [17, "The city was preserved — bread, dogs, and all."], [22, "We know their last day better than some last week."]] },
    space_iss: { dur: 42, style: "iss", scenes: [[0, "iss", "I. Life in Orbit"], [10, "issdawn", "II. Sixteen Sunrises"], [20, "issbody", "III. Living Without Weight"]], caps: [[0, "The ISS orbits at 28,000 km/h — 90 minutes per lap."], [5, "Crews float through a football-field-sized station."], [10, "Every day they see 16 sunrises and 16 sunsets."], [15, "AstronautsVelcro themselves to walls to sleep."], [20, "In microgravity, muscles and bones weaken without exercise."], [24, "Water forms wobbling spheres you can swallow whole."], [27, "They drink recycled sweat and humidity — every drop."]] },
    tech_internet: { dur: 36, style: "internet", scenes: [[0, "internet", "I. Packets, Not Magic"], [12, "cables", "II. The Web of Cables"], [22, "click", "III. The World Tour"]], caps: [[0, "The internet is packets, not magic."], [6, "Your data splits into tiny pieces, hops routers, reassembles."], [12, "Undersea cables carry 95% of it — sharks bite them sometimes."], [17, "Every click is a world tour in 0.1 seconds."]] },
    bio_dna: { dur: 38, style: "dna", scenes: [[0, "dna", "I. The Instruction Manual"], [13, "ladder", "II. The Twisted Ladder"], [24, "banana", "III. You and a Banana"]], caps: [[0, "DNA is a 3-billion-letter instruction manual."], [6, "Four letters: A, T, G, C. Pairs form the ladder."], [13, "Every cell carries a full copy — folded into 2 meters."], [18, "Unfolded, your DNA would stretch to the Sun and back."], [24, "You share 60% of your DNA with a banana."]] }
  };
  window.PDX_LOCAL_VIDEOS = LIB;

  /* ---------- audio ---------- */
  let musTimer = null;
  function startAudio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = window.__vAudioAC || (window.__vAudioAC = new AC());
      if (ctx.state === "suspended") ctx.resume();
      stopAudio();
      const SCALE = [220, 246.9, 261.6, 293.7, 329.6, 349.2, 392, 440];
      const BASS = [110, 110, 98, 98, 123.5, 123.5, 87, 87];
      let step = 0;
      musTimer = setInterval(() => {
        try {
          // melody: wandering arpeggio
          const mel = SCALE[(step * 3 + (step % 2)) % SCALE.length];
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = "triangle"; o.frequency.value = mel;
          g.gain.setValueAtTime(.0001, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(.05, ctx.currentTime + .06);
          g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .9);
          o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 1);
          // bass every 4 steps
          if (step % 4 === 0) {
            const b = ctx.createOscillator(), bg = ctx.createGain();
            b.type = "sine"; b.frequency.value = BASS[(step / 4) % BASS.length];
            bg.gain.setValueAtTime(.0001, ctx.currentTime);
            bg.gain.exponentialRampToValueAtTime(.06, ctx.currentTime + .1);
            bg.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + 1.6);
            b.connect(bg); bg.connect(ctx.destination); b.start(); b.stop(ctx.currentTime + 1.7);
          }
          step++;
        } catch (e) { }
      }, 420);
    } catch (e) { }
  }
  function stopAudio() { if (musTimer) { clearInterval(musTimer); musTimer = null; } }

  /* ---------- player ---------- */
  function play(entry) {
    const lib = LIB[entry.id] || { dur: 32, style: "rome", caps: [[0, entry.desc || entry.title]] };
    const modal = document.createElement("div");
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;";
    modal.innerHTML = `
    <div style="background:#0a0f1c;border:3px solid #63f59a;max-width:940px;width:100%;padding:14px;font-family:'Courier New',monospace;color:#e0e8ff;position:relative;">
      <button data-x style="position:absolute;top:6px;right:6px;background:transparent;border:2px solid #63f59a;color:#63f59a;cursor:pointer;padding:2px 10px;font-family:monospace;z-index:2;">✕</button>
      <canvas width="900" height="500" style="width:100%;display:block;background:#000;"></canvas>
      <div data-cap style="min-height:44px;margin-top:10px;font-size:16px;color:#c8f0ff;text-align:center;"></div>
      <div data-bar style="height:10px;background:#1a2a3a;margin-top:6px;cursor:pointer;position:relative;">
        <div data-fill style="height:100%;width:0%;background:#63f59a;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:12px;color:#9fc0ff;">
        <button data-pp style="background:#123a24;border:2px solid #63f59a;color:#63f59a;padding:4px 16px;cursor:pointer;font-family:monospace;">❚ PAUSE</button>
        <span data-time>0:00 / ${Math.floor(lib.dur / 60)}:${String(lib.dur % 60).padStart(2, "0")}</span>
      </div>
    </div>`;
    modal.addEventListener("click", e => { if (e.target === modal) close(); });
    document.body.appendChild(modal);
    const cv = modal.querySelector("canvas"), ctx = cv.getContext("2d");
    const capEl = modal.querySelector("[data-cap]"), fill = modal.querySelector("[data-fill]");
    const timeEl = modal.querySelector("[data-time]"), pp = modal.querySelector("[data-pp]");
    const bar = modal.querySelector("[data-bar]");
    let playing = true, elapsed = 0, last = performance.now(), raf = null, closed = false;
    function fmt(s) { return Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0"); }
    function close(ended) {
      closed = true; clearInterval(raf); stopAudio();
      if (ended) {
        try {
          const pool = (typeof VIDEOS !== "undefined" ? VIDEOS : []).filter(v => v.id !== entry.id);
          const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
          const end = document.createElement("div");
          end.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.94);z-index:10001;display:flex;align-items:center;justify-content:center;";
          end.innerHTML = `<div style="text-align:center;font-family:'Courier New',monospace;color:#e0e8ff;"><div style="color:#63f59a;font-size:13px;letter-spacing:3px;margin-bottom:10px;">NEXT UP</div><div style="font-size:26px;color:#fff;margin-bottom:6px;">${pick ? pick.title : "Back to Cinema"}</div><div style="color:#9fc0ff;font-size:13px;margin-bottom:22px;">${pick ? pick.desc : ""}</div><button data-play style="background:#63f59a;border:none;color:#06140a;font-family:monospace;font-weight:bold;padding:10px 26px;cursor:pointer;margin-right:10px;">&#9654; PLAY</button><button data-back style="background:transparent;border:2px solid #63f59a;color:#63f59a;font-family:monospace;padding:8px 22px;cursor:pointer;">BACK</button></div>`;
          end.querySelector("[data-play]").addEventListener("click", () => { end.remove(); if (pick) play(pick); });
          end.querySelector("[data-back]").addEventListener("click", () => end.remove());
          end.addEventListener("click", e => { if (e.target === end) end.remove(); });
          document.body.appendChild(end);
        } catch (e) { }
      }
      if (window.PDX_PROFILE && !window.PDX_PROFILE.cinemaWatched.includes(entry.id)) {
        window.PDX_PROFILE.cinemaWatched.push(entry.id); window.PDX_SAVE && window.PDX_SAVE();
        window.PDX_ADD_COINS && window.PDX_ADD_COINS(2);
      }
      modal.remove();
    }
    modal.querySelector("[data-x]").addEventListener("click", close);
    pp.addEventListener("click", () => {
      playing = !playing;
      pp.textContent = playing ? "❚ PAUSE" : "▶ PLAY";
      playing ? startAudio() : stopAudio();
    });
    bar.addEventListener("click", e => {
      const r = bar.getBoundingClientRect();
      elapsed = Math.max(0, Math.min(lib.dur - 0.1, (e.clientX - r.left) / r.width * lib.dur));
      last = performance.now();
    });
    function frame(now) {
      if (closed) return;
      window.__fr = (window.__fr || 0) + 1;
      try {
      const dt = Math.min(.1, (now - last) / 1000); last = now;
      if (playing) { elapsed += dt; window.__el = elapsed; }
      if (elapsed >= lib.dur) { close(true); return; }
      // update HUD first so it always tracks
      try { fill.style.width = (elapsed / lib.dur * 100) + "%"; } catch (e) { }
      try { timeEl.textContent = fmt(elapsed) + " / " + fmt(lib.dur); } catch (e) { }
      // scene storyboard: optional lib.scenes = [[tEnd, styleName, title], ...]
      let style = lib.style, sceneTitle = "";
      if (lib.scenes) {
        for (const sc of lib.scenes) { if (elapsed >= sc[0]) { style = sc[1]; sceneTitle = sc[2] || ""; } }
      }
      const painter = STYLES[style] || STYLES.rome;
      // slow cinematic pan/zoom (subtle, adds motion between scene cuts)
      const pan = Math.sin(elapsed * .08) * 8, zoom = 1.04;
      ctx.save();
      ctx.translate(450 + pan, 250); ctx.scale(zoom, zoom); ctx.translate(-450, -250);
      painter(ctx, elapsed);
      ctx.restore();
      // ambient dust particles (parallax depth)
      if (!ctx.__dust) { ctx.__dust = Array.from({ length: 26 }, (_, i) => ({ x: (i * 173) % 900, y: (i * 97) % 500, v: 6 + (i % 5) * 4, r: .7 + (i % 3) })); }
      ctx.fillStyle = "rgba(255,255,255,.14)";
      for (const d of ctx.__dust) {
        d.y -= d.v / 60; if (d.y < -4) { d.y = 504; d.x = Math.random() * 900; }
        ctx.fillRect(d.x, d.y, d.r, d.r);
      }
      // film grain + vignette
      ctx.fillStyle = "rgba(255,255,255,.03)";
      for (let i = 0; i < 40; i++) ctx.fillRect(Math.random() * 900, Math.random() * 500, 2, 2);
      const vg = ctx.createRadialGradient(450, 250, 220, 450, 250, 560);
      vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.42)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, 900, 500);
      // letterbox bars (cinematic)
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 900, 34); ctx.fillRect(0, 466, 900, 34);
      // scene title card (lower-left, fades in for 2s after scene start)
      if (sceneTitle) {
        const sc = lib.scenes.find(s => s[1] === style);
        const dt2 = elapsed - (sc ? sc[0] : 0);
        if (dt2 < 2.4) {
          ctx.globalAlpha = Math.min(1, 2.4 - dt2) * .85;
          ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.fillRect(0, 430, 900, 70);
          ctx.fillStyle = "#ffe66d"; ctx.font = "bold 26px 'Courier New'"; ctx.textAlign = "left";
          ctx.fillText(sceneTitle, 24, 474);
          ctx.globalAlpha = 1; ctx.textAlign = "left";
        }
      }
      // opening title card (first 2.6s)
      if (elapsed < 2.6) {
        const a = elapsed < 2.0 ? 1 : 1 - (elapsed - 2.0) / 0.6;
        ctx.globalAlpha = a;
        ctx.fillStyle = "rgba(0,0,0,.72)"; ctx.fillRect(0, 0, 900, 500);
        ctx.fillStyle = "#63f59a"; ctx.font = "bold 44px 'Courier New'"; ctx.textAlign = "center";
        ctx.fillText(entry.title.toUpperCase(), 450, 230);
        ctx.fillStyle = "#9fc0ff"; ctx.font = "16px 'Courier New'";
        ctx.fillText(entry.desc || "", 450, 270);
        ctx.globalAlpha = 1; ctx.textAlign = "left";
      }
      // caption
      let cap = "";
      for (const [ct, txt] of lib.caps) { if (elapsed >= ct) cap = txt; }
      capEl.textContent = cap;
      // progress
      fill.style.width = (elapsed / lib.dur * 100) + "%";
      timeEl.textContent = fmt(elapsed) + " / " + fmt(lib.dur);
      } catch (e) { console.error("FRAME_ERR:", e.message); }
    }
    startAudio();
    raf = setInterval(() => frame(performance.now()), 33);
  }
  window.PDX_playLocalVideo = function(e){ try { play(e); } catch (err) { console.error("PDX_PLAY_ERROR:", err && err.message, err && err.stack && err.stack.split("\n")[1]); } };
})();
