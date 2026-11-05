/* =====================================================
   PANIC / ESCAPE — turns the page into a convincing
   "about:blank" appearance:
   • everything becomes plain white
   • title changes to "about:blank"
   • favicon changes to the browser's default blank-page icon
   Press Escape twice quickly (Esc, Esc within 700ms) or use
   the small button in the settings panel.
   While active, pressing Esc again restores the game.
   ===================================================== */
(function () {
  "use strict";
  if (window.__PDX_PANIC__) return; window.__PDX_PANIC__ = true;

  const veil = document.createElement("div");
  veil.id = "panicVeil";
  veil.style.cssText = "position:fixed;inset:0;z-index:300000;display:none;background:#ffffff;";
  document.body.appendChild(veil);

  // Chrome's default favicon for about:blank is a small gray page/globe
  function blankFavicon() {
    const c = document.createElement("canvas");
    c.width = 32; c.height = 32;
    const x = c.getContext("2d");
    x.clearRect(0, 0, 32, 32);
    x.fillStyle = "#dee1e6"; x.fillRect(6, 3, 20, 26);
    x.fillStyle = "#f1f3f4"; x.fillRect(8, 5, 16, 22);
    x.fillStyle = "#bdc1c6";
    x.fillRect(10, 9, 12, 2); x.fillRect(10, 13, 12, 2); x.fillRect(10, 17, 8, 2);
    let link = document.querySelector("link[rel='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = c.toDataURL("image/png");
  }
  let savedFaviconHref = null, savedTitle = null, savedBodyBg = null, savedBodyColor = null;
  let active = false;

  function engage() {
    if (active) return; active = true;
    const link = document.querySelector("link[rel='icon']");
    savedFaviconHref = link ? link.href : null;
    savedTitle = document.title;
    savedBodyBg = document.body.style.background;
    savedBodyColor = document.body.style.color;
    // store each screen's visibility so we can restore
    window.__panicScreens = [...document.querySelectorAll(".screen.active")].map(s => s.id);
    try { if (window.PDX_MUSIC_STOP) window.PDX_MUSIC_STOP(); } catch (e) { }
    blankFavicon();
    document.title = "about:blank";
    document.body.style.background = "#ffffff";
    document.body.style.color = "#ffffff";
    // hide everything
    document.querySelectorAll("body > *:not(#panicVeil)").forEach(el => {
      if (!el.dataset.__panicHidden) { el.dataset.__panicHidden = "1"; el.style.display = "none"; }
    });
    veil.style.display = "block";
  }
  function restore() {
    if (!active) return; active = false;
    veil.style.display = "none";
    document.querySelectorAll("[data-__panic-hidden]").forEach(el => {
      el.style.display = "";
      delete el.dataset.__panicHidden;
    });
    document.body.style.background = savedBodyBg || "";
    document.body.style.color = savedBodyColor || "";
    const link = document.querySelector("link[rel='icon']");
    if (link) link.href = savedFaviconHref || "";
    document.title = savedTitle || "Pixel Duel Arcade";
    // re-activate the screens that were open
    (window.__panicScreens || []).forEach(id => {
      const s = document.getElementById(id);
      if (s) s.classList.add("active");
    });
    try { if (window.PDX_MUSIC_START) window.PDX_MUSIC_START(); } catch (e) { }
  }
  window.PDX_PANIC_TOGGLE = () => active ? restore() : engage();

  let lastEsc = 0;
  addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    const now = performance.now();
    // double-Esc engages panic; a third Esc restores (handled below)
    if (active) { restore(); return; }
    if (now - lastEsc < 700) { e.preventDefault(); e.stopPropagation(); engage(); lastEsc = 0; }
    else lastEsc = now;
  }, true);

  // settings button
  function addPanicButton() {
    const panel = document.querySelector("#settingsPanel .settings-box");
    if (!panel || document.getElementById("panicBtn")) return;
    const b = document.createElement("button");
    b.id = "panicBtn";
    b.textContent = "🚨 PANIC (about:blank)";
    b.style.cssText = "display:block;width:100%;margin-top:10px;padding:8px;background:#5a1a1a;border:1px solid #aa4444;color:#ff8888;font-family:inherit;font-size:12px;cursor:pointer;border-radius:6px;";
    b.addEventListener("click", () => { engage(); });
    panel.appendChild(b);
  }
  const origToggle = window.toggleSettings;
  window.toggleSettings = function () {
    if (origToggle) origToggle.apply(this, arguments);
    setTimeout(addPanicButton, 80);
  };
  const panel = document.getElementById("settingsPanel");
  if (panel) new MutationObserver(() => {
    if (panel.classList.contains("open")) setTimeout(addPanicButton, 100);
  }).observe(panel, { attributes: true, attributeFilter: ["class"] });

  console.log("[Panic] Ready — double-tap Escape (or use the settings button) to disguise the page as about:blank.");
})();
