/* =====================================================
   FAVICON ENGINE
   • Purchasable favicons in the Pixel Shop (FAVICONS tab)
   • Separate favicons per mode: normal / school / glitch
   • Exposes window.PDX_SET_FAVICON(mode) — modes:
       "default" | "school" | "glitch" | "<favicon id>"
   ===================================================== */
(function () {
  "use strict";
  if (window.__PDX_FAVICON__) return; window.__PDX_FAVICON__ = true;

  function makeIcon(draw) {
    const c = document.createElement("canvas");
    c.width = 32; c.height = 32;
    draw(c.getContext("2d"));
    return c.toDataURL("image/png");
  }

  /* ---------- icon painters ---------- */
  const ICONS = {
    default: {
      name: "PIXEL DUEL", price: 0, draw: x => {
        x.fillStyle = "#080b18"; x.fillRect(0, 0, 32, 32);
        x.fillStyle = "#64eaff"; x.fillRect(3, 20, 11, 9);
        x.fillStyle = "#ff72c8"; x.fillRect(18, 20, 11, 9);
        x.fillStyle = "#ffe66d"; x.fillRect(11, 6, 10, 10);
      }
    },
    school: {
      name: "SCHOOL", price: 0, draw: x => {
        x.fillStyle = "#2a5a8a"; x.fillRect(0, 0, 32, 32);
        x.fillStyle = "#f5f2e8"; x.fillRect(5, 9, 22, 15);       // book cover
        x.fillStyle = "#8a5a2a"; x.fillRect(5, 9, 22, 3);        // spine band
        x.fillStyle = "#2a5a8a"; x.fillRect(15, 9, 2, 15);       // book seam
        x.fillStyle = "#ffe66d"; x.fillRect(23, 3, 6, 6);        // star corner
      }
    },
    glitch: {
      name: "ALERT", price: 0, draw: x => {
        // believable browser-style security/alert triangle favicon
        x.fillStyle = "#fbfbfd"; x.fillRect(0, 0, 32, 32);
        x.fillStyle = "#f5a623";
        x.beginPath(); x.moveTo(16, 4); x.lineTo(29, 27); x.lineTo(3, 27); x.closePath(); x.fill();
        x.fillStyle = "#fbfbfd";
        x.fillRect(14.5, 12, 3, 9);
        x.beginPath(); x.arc(16, 24, 1.8, 0, Math.PI * 2); x.fill();
      }
    },
    school_page: {
      name: "PAGE (SCHOOL)", price: 4, draw: x => {
        x.fillStyle = "#ffffff"; x.fillRect(0, 0, 32, 32);
        x.fillStyle = "#4a7adf"; x.beginPath(); x.arc(16, 16, 11, 0, Math.PI * 2); x.fill();
        x.fillStyle = "#ffffff"; x.font = "bold 16px Arial"; x.textAlign = "center";
        x.fillText("S", 16, 22);
      }
    },
    alert_dot: {
      name: "ERROR DOT", price: 4, draw: x => {
        x.fillStyle = "#fbfbfd"; x.fillRect(0, 0, 32, 32);
        x.fillStyle = "#e8443a"; x.beginPath(); x.arc(16, 16, 11, 0, Math.PI * 2); x.fill();
        x.fillStyle = "#fbfbfd"; x.fillRect(14, 8, 4, 10);
        x.beginPath(); x.arc(16, 22, 2, 0, Math.PI * 2); x.fill();
      }
    },
    tabbed: {
      name: "NEW TAB", price: 5, draw: x => {
        x.fillStyle = "#f1f3f4"; x.fillRect(0, 0, 32, 32);
        x.strokeStyle = "#9aa0a6"; x.lineWidth = 2;
        x.strokeRect(6, 4, 20, 24);
        x.beginPath(); x.moveTo(10, 12); x.lineTo(22, 12); x.moveTo(10, 17); x.lineTo(22, 17); x.moveTo(10, 22); x.lineTo(18, 22); x.stroke();
      }
    },
    heart: {
      name: "HEART", price: 6, draw: x => {
        x.fillStyle = "#1a0e18"; x.fillRect(0, 0, 32, 32);
        x.fillStyle = "#ff4a7a";
        x.beginPath(); x.arc(12, 13, 7, 0, Math.PI * 2); x.arc(20, 13, 7, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.moveTo(5, 16); x.lineTo(16, 29); x.lineTo(27, 16); x.closePath(); x.fill();
      }
    },
    skull: {
      name: "SKULL", price: 8, draw: x => {
        x.fillStyle = "#101018"; x.fillRect(0, 0, 32, 32);
        x.fillStyle = "#e8e8e0"; x.beginPath(); x.ellipse(16, 14, 10, 9, 0, 0, Math.PI * 2); x.fill();
        x.fillRect(11, 20, 10, 7);
        x.fillStyle = "#101018"; x.fillRect(11, 11, 5, 5); x.fillRect(17, 11, 5, 5);
        x.fillRect(15, 18, 2, 3);
        x.fillStyle = "#e8e8e0"; for (let i = 0; i < 4; i++)x.fillRect(12 + i * 2.5, 24, 1.4, 3);
      }
    },
    crown: {
      name: "CROWN", price: 10, draw: x => {
        x.fillStyle = "#141018"; x.fillRect(0, 0, 32, 32);
        x.fillStyle = "#ffd24a";
        x.beginPath(); x.moveTo(5, 24); x.lineTo(5, 10); x.lineTo(11, 16); x.lineTo(16, 7); x.lineTo(21, 16); x.lineTo(27, 10); x.lineTo(27, 24); x.closePath(); x.fill();
        x.fillStyle = "#ff5878"; x.fillRect(14, 17, 4, 4);
      }
    },
    rocket: {
      name: "ROCKET", price: 8, draw: x => {
        x.fillStyle = "#0a0a1a"; x.fillRect(0, 0, 32, 32);
        for (let i = 0; i < 12; i++) { x.fillStyle = "rgba(255,255,255,.7)"; x.fillRect((i * 13) % 30, (i * 7) % 30, 1.6, 1.6); }
        x.fillStyle = "#e0e8ff"; x.beginPath(); x.moveTo(16, 4); x.quadraticCurveTo(23, 14, 20, 22); x.lineTo(12, 22); x.quadraticCurveTo(9, 14, 16, 4); x.closePath(); x.fill();
        x.fillStyle = "#ff5878"; x.beginPath(); x.moveTo(12, 22); x.lineTo(8, 28); x.lineTo(15, 24); x.closePath(); x.fill();
        x.beginPath(); x.moveTo(20, 22); x.lineTo(24, 28); x.lineTo(17, 24); x.closePath(); x.fill();
        x.fillStyle = "#64eaff"; x.beginPath(); x.arc(16, 14, 3, 0, Math.PI * 2); x.fill();
      }
    },
    diamond: {
      name: "DIAMOND", price: 12, draw: x => {
        x.fillStyle = "#0a0e22"; x.fillRect(0, 0, 32, 32);
        x.fillStyle = "#7ae0ff";
        x.beginPath(); x.moveTo(16, 4); x.lineTo(27, 13); x.lineTo(16, 28); x.lineTo(5, 13); x.closePath(); x.fill();
        x.strokeStyle = "#e0f8ff"; x.lineWidth = 1.5;
        x.beginPath(); x.moveTo(5, 13); x.lineTo(27, 13); x.moveTo(16, 4); x.lineTo(11, 13); x.lineTo(16, 28); x.moveTo(16, 4); x.lineTo(21, 13); x.lineTo(16, 28); x.stroke();
      }
    },
    ghost: {
      name: "GHOST", price: 9, draw: x => {
        x.fillStyle = "#14101e"; x.fillRect(0, 0, 32, 32);
        x.fillStyle = "#dce4ff";
        x.beginPath(); x.arc(16, 13, 9, Math.PI, 0); x.lineTo(25, 24);
        for (let i = 0; i < 4; i++)x.quadraticCurveTo(25 - i * 4.5 - 1, 24 + (i % 2 ? 3 : 0) - 1.5, 25 - (i + 1) * 4.5, 24);
        x.closePath(); x.fill();
        x.fillStyle = "#14101e"; x.fillRect(12, 11, 3, 4); x.fillRect(18, 11, 3, 4);
      }
    },
    cat: {
      name: "CAT", price: 8, draw: x => {
        x.fillStyle = "#1a1420"; x.fillRect(0, 0, 32, 32);
        x.fillStyle = "#f0c880";
        x.beginPath(); x.arc(16, 18, 10, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.moveTo(8, 12); x.lineTo(10, 3); x.lineTo(14, 10); x.closePath(); x.fill();
        x.beginPath(); x.moveTo(24, 12); x.lineTo(22, 3); x.lineTo(18, 10); x.closePath(); x.fill();
        x.fillStyle = "#1a1420"; x.fillRect(12, 15, 2.5, 4); x.fillRect(18, 15, 2.5, 4);
        x.fillStyle = "#ff8ac8"; x.fillTriangle ? 0 : x.beginPath(); x.moveTo(15, 20); x.lineTo(17, 20); x.lineTo(16, 22); x.closePath(); x.fill();
      }
    },
    rainbow: {
      name: "RAINBOW", price: 14, draw: x => {
        x.fillStyle = "#0c0c1c"; x.fillRect(0, 0, 32, 32);
        const cols = ["#ff4a4a", "#ff9a3a", "#ffe66d", "#63f59a", "#64b5f6", "#b07aff"];
        cols.forEach((c, i) => {
          x.strokeStyle = c; x.lineWidth = 2.4;
          x.beginPath(); x.arc(16, 30, 6 + i * 2.6, Math.PI, 0); x.stroke();
        });
      }
    }
  };

  const linkEl = document.querySelector("link[rel='icon']") || (() => { const l = document.createElement("link"); l.rel = "icon"; document.head.appendChild(l); return l; })();

  function apply() {
    const p = window.PDX_PROFILE || {};
    p.ownedFavicons = p.ownedFavicons || ["default", "school", "glitch"];
    p.favicon = p.favicon || "default";
    const mode = p.__faviconMode || p.favicon;
    const ic = ICONS[mode] || ICONS.default;
    try { linkEl.href = makeIcon(ic.draw); } catch (e) { }
  }
  window.PDX_SET_FAVICON = function (mode) {
    const p = window.PDX_PROFILE || {};
    p.__faviconMode = mode;
    if (ICONS[mode]) p.favicon = mode;
    window.PDX_SAVE && window.PDX_SAVE();
    apply();
  };
  window.PDX_FAVICON_ICONS = ICONS;

  /* auto-switch for school, error & panic modes */
  addEventListener("load", () => {
    apply();
    // school mode: watch its overlay
    const sm = document.getElementById("schoolModeV2");
    if (sm) {
      new MutationObserver(() => {
        const on = sm.classList.contains("active");
        window.PDX_SET_FAVICON(on ? "school" : ((window.PDX_PROFILE || {}).favicon || "default"));
      }).observe(sm, { attributes: true, attributeFilter: ["class"] });
    }
    // error screen: watch its overlay display
    const fe = document.getElementById("fakeErrorScreen");
    if (fe) {
      new MutationObserver(() => {
        const on = fe.style.display === "block";
        window.PDX_SET_FAVICON(on ? "glitch" : ((window.PDX_PROFILE || {}).favicon || "default"));
      }).observe(fe, { attributes: true, attributeFilter: ["style"] });
    }
    // panic veil: watch its display too
    const pv = document.getElementById("panicVeil");
    if (pv) {
      new MutationObserver(() => {
        const on = pv.style.display === "block";
        if (on) {
          // panic draws its own chrome-blank favicon — just save state
          const p = window.PDX_PROFILE || {};
          p.__faviconMode = "panic";
        } else {
          window.PDX_SET_FAVICON((window.PDX_PROFILE || {}).favicon || "default");
        }
      }).observe(pv, { attributes: true, attributeFilter: ["style"] });
    }
  });
  apply();
})();
