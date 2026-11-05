/* =====================================================
   GLITCH CUSTOMIZER — settings panel section for the
   fake error screen: pick error type, tint colour, glow
   intensity, text scale. Still fully believable: every
   template is a coherent fictional error with no way out.
   ===================================================== */
(function () {
  "use strict";
  if (window.__PDX_GLITCH_UI__) return; window.__PDX_GLITCH_UI__ = true;

  function cfg() {
    const p = window.PDX_PROFILE || {};
    p.glitch = p.glitch || { type: "net404", tint: "", glow: 0, scale: 1, bg: "#0e0e10" };
    return p.glitch;
  }
  function save() { window.PDX_SAVE && window.PDX_SAVE(); }

  const PRESETS = {
    "": { bg: "#0e0e10", tint: "", label: "SYSTEM GREY (default)" },
    blue: { bg: "#0a0e16", tint: "#c8d8f0", label: "COLD BLUE" },
    green: { bg: "#081208", tint: "#c8f0c8", label: "TERMINAL GREEN" },
    amber: { bg: "#141008", tint: "#f0d8a8", label: "AMBER ALERT" },
    red: { bg: "#140a0a", tint: "#f0b8b8", label: "CRITICAL RED" },
    purple: { bg: "#100a16", tint: "#d8c8f0", label: "VIOLET HAZE" }
  };

  function addSection() {
    const panel = document.querySelector("#settingsPanel .settings-box");
    if (!panel || document.getElementById("glitchSection")) return;
    const c = cfg();
    const types = window.PDX_GLITCH_TYPES || {};
    const sec = document.createElement("div");
    sec.id = "glitchSection";
    sec.style.cssText = "margin-top:14px;padding-top:12px;border-top:1px solid var(--panel-border,#2a3260);width:100%;";
    sec.innerHTML = `
    <h3 style="color:#ff8c6a;margin:0 0 8px;font-size:14px;letter-spacing:1px;">🖥️ ERROR SCREEN</h3>
    <div style="display:flex;flex-direction:column;gap:8px;font-size:12px;color:var(--muted,#9fc0ff);">
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">ERROR TYPE
        <select data-gl-type style="background:#0a0f24;border:1px solid #2a3260;color:#e0e8ff;padding:4px 8px;width:170px;font-family:inherit;font-size:12px;">
          ${Object.entries(types).map(([k, v]) => `<option value="${k}" ${c.type === k ? "selected" : ""}>${v.big.trim()} ${v.sub}</option>`).join("")}
        </select></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">COLOUR THEME
        <select data-gl-preset style="background:#0a0f24;border:1px solid #2a3260;color:#e0e8ff;padding:4px 8px;width:170px;font-family:inherit;font-size:12px;">
          ${Object.entries(PRESETS).map(([k, v]) => `<option value="${k}" ${(c.tint ? "" : c.tint === "" && k === "") || c.preset === k ? "selected" : ""}>${v.label}</option>`).join("")}
        </select></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">CUSTOM TINT
        <input data-gl-tint type="color" value="${c.tint || "#c8d8f0"}" style="width:56px;height:26px;background:none;border:1px solid #2a3260;cursor:pointer;"></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">GLOW
        <input data-gl-glow type="range" min="0" max="2" step="0.25" value="${c.glow || 0}" style="width:170px;accent-color:#ff8c6a;"></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">TEXT SIZE
        <input data-gl-scale type="range" min="0.8" max="1.4" step="0.05" value="${c.scale || 1}" style="width:170px;accent-color:#ff8c6a;"></label>
      <button data-gl-test style="align-self:flex-start;background:#241418;border:1px solid #ff8c6a;color:#ff8c6a;padding:6px 14px;font-family:inherit;font-size:11px;cursor:pointer;border-radius:6px;">👁 TEST ERROR SCREEN</button>
    </div>`;
    panel.appendChild(sec);
    const apply = () => {
      if (window.PDX_GLITCH_APPLY) window.PDX_GLITCH_APPLY();
    };
    sec.querySelector("[data-gl-type]").addEventListener("change", e => { c.type = e.target.value; save(); apply(); });
    sec.querySelector("[data-gl-preset]").addEventListener("change", e => {
      const p = PRESETS[e.target.value] || PRESETS[""];
      c.preset = e.target.value; c.bg = p.bg; c.tint = p.tint; save(); apply();
      sec.querySelector("[data-gl-tint]").value = c.tint || "#c8d8f0";
    });
    sec.querySelector("[data-gl-tint]").addEventListener("input", e => { c.tint = e.target.value; c.preset = "custom"; save(); apply(); });
    sec.querySelector("[data-gl-glow]").addEventListener("input", e => { c.glow = +e.target.value; save(); apply(); });
    sec.querySelector("[data-gl-scale]").addEventListener("input", e => { c.scale = +e.target.value; save(); apply(); });
    sec.querySelector("[data-gl-test]").addEventListener("click", () => {
      if (window.PDX_FAKE_ERROR_TOGGLE) window.PDX_FAKE_ERROR_TOGGLE();
    });
  }

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
  }
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", start);
  else start();
  setTimeout(start, 700);
})();
