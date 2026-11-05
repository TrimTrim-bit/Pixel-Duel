/* =====================================================
   LOOK & FEEL — settings for:
   • Website name (menu title + tab title)
   • Menu scale (compact / normal / large)
   • Corner rounding (boxes & buttons)
   • Glow intensity
   • Accent color picker
   Saved in profile.look; applied live via CSS variables.
   ===================================================== */
(function () {
  "use strict";
  if (window.__PDX_LOOK__) return; window.__PDX_LOOK__ = true;

  function prof() { const p = window.PDX_PROFILE || {}; p.look = p.look || {}; return p.look; }
  function save() { window.PDX_SAVE && window.PDX_SAVE(); }
  function defaults() { return { name: "Pixel Duel", schoolName: "SkillZon", menuScale: "normal", rounding: 14, glow: 1, accent: "#64eaff" }; }

  function apply() {
    const l = Object.assign({}, defaults(), prof());
    const root = document.documentElement.style;
    root.setProperty("--pd-round", l.rounding + "px");
    root.setProperty("--pd-glow", l.glow);
    if (l.accent) {
      root.setProperty("--accent", l.accent);
      root.setProperty("--pd-accent-soft", l.accent + "66");
    }
    // school-mode display name (used by school_mode.js for its title)
    // school-mode display name (used by school_mode.js for its title)
  window.PDX_SCHOOL_NAME = function () { const l = Object.assign({}, defaults(), prof()); return l.schoolName || "SkillZon"; };
    // menu scale
    const grid = document.querySelector("#menu .menu-buttons");
    if (grid) {
      const w = { compact: "132px", normal: "168px", large: "210px" }[l.menuScale] || "168px";
      grid.style.setProperty("grid-template-columns", "repeat(auto-fill,minmax(" + w + ",1fr))", "important");
    }
    // menu title text
    const h = document.querySelector("#menu h1");
    if (h && l.name) h.textContent = l.name.toUpperCase();
    document.title = l.name ? l.name + " — Arcade" : "Pixel Duel Arcade";
  }

  /* dynamic stylesheet: rounding + glow for cards/buttons/panels */
  function injectCSS() {
    const l = Object.assign({}, defaults(), prof());
    const st = document.getElementById("pdLookCSS") || document.createElement("style");
    st.id = "pdLookCSS";
    const glow = l.glow;
    st.textContent = `
  #menu .game-card,.game-card,.shop-item,.shop-tab,.settings-box,.status,.chip,#cinemaGrid .cinema-card{
    border-radius:var(--pd-round,14px) !important;
  }
  .back,.game-card button,#shopGrid button{border-radius:calc(var(--pd-round,14px) * .6) !important;}
  ${glow > 0 ? `#menu .game-card:hover,.game-card:hover{box-shadow:0 0 calc(18px * ${glow}) var(--pd-accent-soft,#64eaff66) !important;border-color:var(--accent,#64eaff) !important;}
  .shop-item:hover{box-shadow:0 0 calc(14px * ${glow}) #63f59a55;}
  #menu h1{text-shadow:0 0 calc(30px * ${glow}) var(--pd-accent-soft,#64eaff66) !important;}` : ""}
  `;
    document.head.appendChild(st);
  }

  /* settings section */
  function addSection() {
    const panel = document.querySelector("#settingsPanel .settings-box");
    if (!panel || document.getElementById("lookSection")) return;
    const l = Object.assign({}, defaults(), prof());
    const sec = document.createElement("div");
    sec.id = "lookSection";
    sec.style.cssText = "margin-top:14px;padding-top:12px;border-top:1px solid var(--panel-border,#2a3260);width:100%;";
    sec.innerHTML = `
    <h3 style="color:var(--accent2,#ff72c8);margin:0 0 8px;font-size:14px;letter-spacing:1px;">🎨 LOOK &amp; FEEL</h3>
    <div style="display:flex;flex-direction:column;gap:8px;font-size:12px;color:var(--muted,#9fc0ff);">
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">WEBSITE NAME
        <input data-look-name type="text" value="${l.name}" style="background:#0a0f24;border:1px solid #2a3260;color:#e0e8ff;padding:4px 8px;width:170px;font-family:inherit;font-size:12px;"></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">SCHOOL SITE NAME
        <input data-look-schoolname type="text" value="${l.schoolName || "SkillZon"}" style="background:#0a0f24;border:1px solid #2a3260;color:#e0e8ff;padding:4px 8px;width:170px;font-family:inherit;font-size:12px;"></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">MENU SIZE
        <select data-look-scale style="background:#0a0f24;border:1px solid #2a3260;color:#e0e8ff;padding:4px 8px;width:170px;font-family:inherit;font-size:12px;">
          ${["compact", "normal", "large"].map(s => `<option value="${s}" ${l.menuScale === s ? "selected" : ""}>${s}</option>`).join("")}
        </select></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">ROUNDING
        <input data-look-round type="range" min="0" max="26" step="2" value="${l.rounding}" style="width:170px;accent-color:var(--accent,#64eaff);"></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">GLOW
        <input data-look-glow type="range" min="0" max="2" step="0.25" value="${l.glow}" style="width:170px;accent-color:var(--accent,#64eaff);"></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">ACCENT COLOR
        <input data-look-accent type="color" value="${l.accent}" style="width:56px;height:26px;background:none;border:1px solid #2a3260;cursor:pointer;"></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">THEME MOOD
        <select data-look-energy style="background:#0a0f24;border:1px solid #2a3260;color:#e0e8ff;padding:4px 8px;width:170px;font-family:inherit;font-size:12px;">
          <option value="cozy" ${(window.PDX_ENERGY_LEVEL()==="cozy")?"selected":""}>Cozy</option>
          <option value="energetic" ${(window.PDX_ENERGY_LEVEL()==="energetic")?"selected":""}>Energetic</option>
          <option value="premium" ${(window.PDX_ENERGY_LEVEL()==="premium")?"selected":""}>Premium</option>
        </select></label>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <span>CUSTOM FAVICON</span>
        <span style="display:flex;align-items:center;gap:6px;">
          <img data-look-favicon-preview src="${l.faviconData || ""}" style="width:40px;height:40px;image-rendering:pixelated;border:1px solid #2a3260;border-radius:4px;background:#0a0f24;${l.faviconData ? "" : "display:none;"}">
          <label style="background:#1a2050;border:1px solid #64eaff;color:#64eaff;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:11px;">
            UPLOAD<input type="file" accept="image/png,image/jpeg,image/gif,image/webp" data-look-favicon-file style="display:none;">
          </label>
          <button data-look-favicon-clear style="background:#5a2a2a;border:1px solid #aa4444;color:#ff8a8a;padding:3px 7px;border-radius:4px;cursor:pointer;font-size:11px;" title="Remove custom favicon">✕</button>
        </span>
      </div>
      <div style="font-size:10px;color:#6a7a99;">Upload any image as your browser tab icon. <b style="color:#9fc0ff">Click the preview</b> to set the focal point (what part gets framed) and <b style="color:#9fc0ff">scroll on it</b> to zoom in/out.</div>
    </div>`;
    panel.appendChild(sec);
    const rerender = () => { apply(); injectCSS(); };
    sec.querySelector("[data-look-name]").addEventListener("input", e => { prof().name = e.target.value; save(); rerender(); });
    sec.querySelector("[data-look-schoolname]").addEventListener("input", e => { prof().schoolName = e.target.value; save(); rerender(); });
    sec.querySelector("[data-look-scale]").addEventListener("change", e => { prof().menuScale = e.target.value; save(); rerender(); });
    sec.querySelector("[data-look-round]").addEventListener("input", e => { prof().rounding = +e.target.value; save(); rerender(); });
    sec.querySelector("[data-look-glow]").addEventListener("input", e => { prof().glow = +e.target.value; save(); rerender(); });
    sec.querySelector("[data-look-accent]").addEventListener("input", e => { prof().accent = e.target.value; save(); rerender(); });
    sec.querySelector("[data-look-energy]").addEventListener("change", e => { window.PDX_SET_ENERGY && window.PDX_SET_ENERGY(e.target.value); });

    /* favicon upload */
    const fFile = sec.querySelector("[data-look-favicon-file]");
    const fPrev = sec.querySelector("[data-look-favicon-preview]");
    const fClear = sec.querySelector("[data-look-favicon-clear]");
    const applyFavicon = () => {
      const l2 = Object.assign({}, defaults(), prof());
      if (l2.faviconData) {
        let link = document.querySelector("link[rel='icon']");
        if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
        link.href = l2.faviconData;
      }
      fPrev.style.display = l2.faviconData ? "" : "none";
      if (l2.faviconData) fPrev.src = l2.faviconData;
    };
    /* favicon upload — with focal-point framing: click on the preview to
       choose which part of the image becomes the favicon (zoom too). */
    let favImg = null;          // the loaded Image for framing
    let favFocus = { x: 0.5, y: 0.5, z: 1 }; // focal point + zoom
    const drawFavicon = () => {
      if (!favImg) return;
      const c = document.createElement("canvas"); c.width = 64; c.height = 64;
      const x = c.getContext("2d");
      x.imageSmoothingEnabled = false;
      // zoom: fraction of the image visible (1 = whole fit, 0.4 = tight crop)
      const z = favFocus.z;
      let s = Math.min(favImg.width, favImg.height) / z;
      let cx = favFocus.x * favImg.width, cy = favFocus.y * favImg.height;
      let sx = Math.max(0, Math.min(favImg.width - s, cx - s / 2));
      let sy = Math.max(0, Math.min(favImg.height - s, cy - s / 2));
      x.drawImage(favImg, sx, sy, s, s, 0, 0, 64, 64);
      const data = c.toDataURL("image/png");
      try { prof().faviconData = data; save(); applyFavicon(); }
      catch (err) { console.warn("[look_feel] favicon too large to save"); }
    };
    fFile.addEventListener("change", e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        const img = new Image();
        img.onload = () => {
          favImg = img; favFocus = { x: 0.5, y: 0.5, z: 1 };
          drawFavicon();
        };
        img.src = rd.result;
      };
      rd.readAsDataURL(f);
      e.target.value = "";
    });
    // click preview to set the focal point (framing picker)
    fPrev.title = "Click to choose the focal point for the favicon";
    fPrev.style.cursor = "crosshair";
    fPrev.addEventListener("click", e => {
      if (!favImg) return;
      const r = fPrev.getBoundingClientRect();
      favFocus.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      favFocus.y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      drawFavicon();
    });
    // wheel on preview = zoom in/out
    fPrev.addEventListener("wheel", e => {
      if (!favImg) return;
      e.preventDefault();
      favFocus.z = Math.min(4, Math.max(1, favFocus.z + (e.deltaY < 0 ? 0.15 : -0.15)));
      drawFavicon();
    }, { passive: false });
    fClear.addEventListener("click", () => { favImg = null; prof().faviconData = null; save(); applyFavicon(); });
  }

  /* hooks */
  const origToggle = window.toggleSettings;
  window.toggleSettings = function () {
    if (origToggle) origToggle.apply(this, arguments);
    setTimeout(addSection, 60);
  };
  function start() {
    const panel = document.getElementById("settingsPanel");
    if (panel) {
      new MutationObserver(() => {
        if (panel.classList.contains("open")) setTimeout(addSection, 80);
      }).observe(panel, { attributes: true, attributeFilter: ["class"] });
    }
    apply(); injectCSS();
    // website name can also be overridden per-mode by other modules:
    window.PDX_SITE_NAME = () => Object.assign({}, defaults(), prof()).name;
  }
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", start);
  else start();
  setTimeout(start, 600);
})();
