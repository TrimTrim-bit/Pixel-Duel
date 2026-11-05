/* =====================================================
   CLOCK PRO V2 — digital-only, fancy + fully customizable.
   • 12/24-hour toggle
   • timezone selector
   • 6 visual styles (neon glow, terminal, retro pixel, minimal, glass, bold)
   • accent color picker (overrides theme accent for clock only)
   • seconds toggle
   • show/hide date
   • border radius slider
   Saved in profile.clock; all applied live.
   ===================================================== */
(function () {
  "use strict";
  if (window.__PDX_CLOCK_PRO__) return; window.__PDX_CLOCK_PRO__ = true;

  function prof() { const p = window.PDX_PROFILE || {}; p.clock = p.clock || {}; return p.clock; }
  function save() { window.PDX_SAVE && window.PDX_SAVE(); }
  function defaults() { return { format: "24", tz: "local", style: "neon", showSeconds: true, showDate: false, accent: "", radius: 8 }; }

  const TZ_OPTIONS = [
    ["local", "Local time (auto)"],
    ["America/New_York", "Eastern (New York)"],
    ["America/Chicago", "Central (Chicago)"],
    ["America/Denver", "Mountain (Denver)"],
    ["America/Los_Angeles", "Pacific (Los Angeles)"],
    ["Europe/London", "London (GMT/BST)"],
    ["Europe/Paris", "Paris (CET)"],
    ["Europe/Berlin", "Berlin (CET)"],
    ["Europe/Moscow", "Moscow (MSK)"],
    ["Asia/Dubai", "Dubai (GST)"],
    ["Asia/Kolkata", "India (IST)"],
    ["Asia/Shanghai", "China (CST)"],
    ["Asia/Tokyo", "Japan (JST)"],
    ["Australia/Sydney", "Sydney (AET)"],
    ["Pacific/Auckland", "Auckland (NZT)"],
    ["UTC", "UTC"]
  ];

  const CLOCK_STYLES = {
    neon: { label: "NEON GLOW", bg: "rgba(8,11,24,.85)", border: "var(--accent)", color: "var(--accent)", shadow: "0 0 16px var(--accent)", textShadow: "0 0 8px var(--accent)", font: "'Courier New',monospace", weight: "normal", radius: 8 },
    terminal: { label: "TERMINAL", bg: "#0a1a08", border: "#2aff6a", color: "#2aff6a", shadow: "none", textShadow: "none", font: "'Consolas','Courier New',monospace", weight: "normal", radius: 4 },
    retro: { label: "RETRO PIXEL", bg: "#1a1420", border: "#ffe66d", color: "#ffe66d", shadow: "0 0 0 2px #a020f0", textShadow: "2px 2px 0 #a020f0", font: "'Courier New',monospace", weight: "bold", radius: 0 },
    minimal: { label: "MINIMAL", bg: "transparent", border: "transparent", color: "var(--text)", shadow: "none", textShadow: "none", font: "'Segoe UI',Roboto,sans-serif", weight: "300", radius: 0 },
    glass: { label: "GLASS", bg: "rgba(255,255,255,.08)", border: "rgba(255,255,255,.3)", color: "#fff", shadow: "0 4px 20px rgba(0,0,0,.4)", textShadow: "none", font: "'Segoe UI',Roboto,sans-serif", weight: "normal", radius: 16 },
    bold: { label: "BOLD BLOCK", bg: "#0d1430", border: "#ff72c8", color: "#ff72c8", shadow: "3px 3px 0 #0d1430", textShadow: "1px 1px 0 #080b18", font: "'Arial Black','Segoe UI',sans-serif", weight: "900", radius: 2 }
  };

  function nowInTZ() {
    const l = Object.assign({}, defaults(), prof());
    try {
      if (l.tz === "local") return new Date();
      const str = new Date().toLocaleString("en-US", { timeZone: l.tz });
      return new Date(str);
    } catch (e) { return new Date(); }
  }

  function fmtHours(d, format24) {
    const h = d.getHours();
    if (format24) return String(h).padStart(2, "0");
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return String(h12).padStart(2, "0");
  }
  function ampm(d) { return d.getHours() < 12 ? "AM" : "PM"; }

  function getClockAccent(l) {
    if (l.accent) return l.accent;
    return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#64eaff";
  }

  /* ---------- fancy digital clock ---------- */
  let styleEl = null;
  function applyClockStyle() {
    const l = Object.assign({}, defaults(), prof());
    const s = CLOCK_STYLES[l.style] || CLOCK_STYLES.neon;
    const el = document.getElementById("hudDigitalClock");
    if (!el) return;
    const accent = getClockAccent(l);
    if (!styleEl) { styleEl = document.createElement("style"); styleEl.id = "clockProStyle"; document.head.appendChild(styleEl); }
    const dateStr = l.showDate ? nowInTZ().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "";
    const tzLabel = l.tz !== "local" ? (() => { try { const m = l.tz.match(/\/(\w+)$/); return m ? m[1].replace(/_/g, " ").toUpperCase() : l.tz; } catch (e) { return ""; } })() : "";
    const d = nowInTZ();
    const hh = fmtHours(d, l.format === "24");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = l.showSeconds ? ":" + String(d.getSeconds()).padStart(2, "0") : "";
    const ap = l.format === "12" ? " " + ampm(d) : "";
    // fancy layout: main time big, date + tz small below
    el.innerHTML = `<span style="font-size:1.25em;letter-spacing:2px;font-weight:${s.weight}">${hh}:${mm}${ss}</span>${ap ? `<span style="font-size:.7em;opacity:.7;margin-left:4px">${ap.trim()}</span>` : ""}${(dateStr || tzLabel) ? `<span style="display:block;font-size:.6em;opacity:.55;margin-top:1px;">${[dateStr, tzLabel].filter(Boolean).join(" · ")}</span>` : ""}`;
    // style overrides
    el.style.cssText = `background:${s.bg};border:1px solid ${s.border};color:${accent};box-shadow:${s.shadow};text-shadow:${s.textShadow};font-family:${s.font};border-radius:${l.radius}px;padding:5px 14px;font-size:15px;`;
    // visibility only on menu
    const scr = (typeof activeScreen !== "undefined") ? activeScreen : window.activeScreen;
    const row = document.getElementById("sessionRow");
    if (row) row.style.visibility = (scr === "menu") ? "visible" : "hidden";
  }

  function tickDigital() {
    window.__CLOCK_PRO_ACTIVE = true;
    applyClockStyle();
  }

  /* ---------- settings section ---------- */
  function addSection() {
    const panel = document.querySelector("#settingsPanel .settings-box");
    if (!panel || document.getElementById("clockSection")) return;
    const l = Object.assign({}, defaults(), prof());
    const sec = document.createElement("div");
    sec.id = "clockSection";
    sec.style.cssText = "margin-top:14px;padding-top:12px;border-top:1px solid #2a2f63;width:100%;";
    sec.innerHTML = `
    <h3 style="color:var(--accent);margin:0 0 8px;font-size:14px;letter-spacing:1px;">🕐 CLOCK</h3>
    <div style="display:flex;flex-direction:column;gap:8px;font-size:12px;color:#9fc0ff;">
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">STYLE
        <select data-clock-style style="background:#0a0f24;border:1px solid #2a2f63;color:#e0e8ff;padding:4px 8px;width:170px;font-family:inherit;font-size:12px;">
          ${Object.entries(CLOCK_STYLES).map(([k, v]) => `<option value="${k}" ${l.style === k ? "selected" : ""}>${v.label}</option>`).join("")}
        </select></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">TIME FORMAT
        <select data-clock-format style="background:#0a0f24;border:1px solid #2a2f63;color:#e0e8ff;padding:4px 8px;width:170px;font-family:inherit;font-size:12px;">
          <option value="24" ${l.format === "24" ? "selected" : ""}>Military (23:34)</option>
          <option value="12" ${l.format === "12" ? "selected" : ""}>Standard (11:34 PM)</option>
        </select></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">TIME ZONE
        <select data-clock-tz style="background:#0a0f24;border:1px solid #2a2f63;color:#e0e8ff;padding:4px 8px;width:170px;font-family:inherit;font-size:12px;">
          ${TZ_OPTIONS.map(([v, lab]) => `<option value="${v}" ${l.tz === v ? "selected" : ""}>${lab}</option>`).join("")}
        </select></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">CLOCK ACCENT
        <input type="color" data-clock-accent value="${l.accent || "#64eaff"}" style="width:40px;height:24px;background:none;border:1px solid #2a2f63;cursor:pointer;"></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">ROUNDNESS
        <input type="range" data-clock-radius min="0" max="24" step="2" value="${l.radius !== undefined ? l.radius : 8}" style="width:170px;accent-color:var(--accent);"></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">SECONDS
        <input type="checkbox" data-clock-seconds ${l.showSeconds !== false ? "checked" : ""} style="width:18px;height:18px;accent-color:var(--accent);"></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">SHOW DATE
        <input type="checkbox" data-clock-showdate ${l.showDate ? "checked" : ""} style="width:18px;height:18px;accent-color:var(--accent);"></label>
    </div>`;
    panel.appendChild(sec);
    const rerender = () => { applyClockStyle(); };
    sec.querySelector("[data-clock-style]").addEventListener("change", e => { prof().style = e.target.value; save(); rerender(); });
    sec.querySelector("[data-clock-format]").addEventListener("change", e => { prof().format = e.target.value; save(); rerender(); });
    sec.querySelector("[data-clock-tz]").addEventListener("change", e => { prof().tz = e.target.value; save(); rerender(); });
    sec.querySelector("[data-clock-accent]").addEventListener("input", e => { prof().accent = e.target.value; save(); rerender(); });
    sec.querySelector("[data-clock-radius]").addEventListener("input", e => { prof().radius = +e.target.value; save(); rerender(); });
    sec.querySelector("[data-clock-seconds]").addEventListener("change", e => { prof().showSeconds = e.target.checked; save(); rerender(); });
    sec.querySelector("[data-clock-showdate]").addEventListener("change", e => { prof().showDate = e.target.checked; save(); rerender(); });
  }

  /* hook into settings */
  const origToggle = window.toggleSettings;
  window.toggleSettings = function () {
    if (origToggle) origToggle.apply(this, arguments);
    setTimeout(addSection, 70);
  };
  function start() {
    const panel = document.getElementById("settingsPanel");
    if (panel) {
      new MutationObserver(() => {
        if (panel.classList.contains("open")) setTimeout(addSection, 90);
      }).observe(panel, { attributes: true, attributeFilter: ["class"] });
    }
    tickDigital();
    setInterval(tickDigital, 1000);
  }
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", start);
  else start();
  setTimeout(start, 700);
})();
