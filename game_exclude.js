/* =====================================================
   GAME EXCLUSIONS — right-click (long-press on touch) any
   game card to toggle it out of Random / Party mode.
   Excluded cards get a strikethrough + 🚫 badge.
   Stored in profile.excludedGames. Also patches randomGame
   and party nextPartyGame to respect the list.
   ===================================================== */
(function () {
  "use strict";
  if (window.__GAME_EXCLUDE__) return; window.__GAME_EXCLUDE__ = true;

  function prof() { return window.PDX_PROFILE || {}; }
  function excluded() { const p = prof(); p.excludedGames = p.excludedGames || []; return p.excludedGames; }
  function isExcluded(id) { return excluded().includes(id); }
  function toggle(id) {
    const ex = excluded();
    const i = ex.indexOf(id);
    if (i >= 0) { ex.splice(i, 1); showToastSafe("Included: " + id); }
    else { ex.push(id); showToastSafe("Excluded from random/party: " + id); }
    window.PDX_SAVE && window.PDX_SAVE();
    refreshCards();
  }
  function showToastSafe(m) { try { window.showToast && showToast(m); } catch (e) { } }

  function refreshCards() {
    document.querySelectorAll("#menu .game-card[data-id]").forEach(c => {
      const ex = isExcluded(c.dataset.id);
      c.style.opacity = ex ? ".45" : "";
      c.style.textDecoration = ex ? "line-through" : "";
      c.title = ex ? "Excluded from Random/Party — click 🚫 to include" : "Click 🚫 to exclude this game from Random/Party";
      c.style.position = "relative";
      let badge = c.querySelector(".exclBadge");
      if (!badge) {
        badge = document.createElement("button"); badge.className = "exclBadge";
        badge.type = "button";
        badge.style.cssText = "position:absolute;top:3px;right:4px;font-size:10px;line-height:1;padding:2px 4px;border-radius:5px;cursor:pointer;z-index:5;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.45);color:#fff;display:none;";
        badge.addEventListener("click", ev => { ev.stopPropagation(); ev.preventDefault(); toggle(c.dataset.id); });
        c.appendChild(badge);
      }
      badge.textContent = ex ? "🚫" : "✕";
      badge.style.opacity = ex ? "1" : ".25";
      badge.style.display = "inline-block";
      badge.title = ex ? "Included back into Random/Party" : "Exclude from Random/Party";
    });
  }

  /* public API so scripts/tests can manage exclusions */
  window.PDX_EXCLUDE_LIST = () => excluded().slice();
  window.PDX_EXCLUDE_TOGGLE = id => toggle(id);

  /* long-press / right-click handler on the menu grid */
  addEventListener("contextmenu", e => {
    const card = e.target.closest && e.target.closest("#menu .game-card[data-id]");
    if (!card) return;
    e.preventDefault();
    toggle(card.dataset.id);
  });
  /* touch: 600ms long press */
  (function () {
    let timer = null, touched = null;
    document.addEventListener("touchstart", e => {
      const card = e.target.closest && e.target.closest("#menu .game-card[data-id]");
      if (!card) return;
      touched = card;
      timer = setTimeout(() => { toggle(card.dataset.id); touched = null; timer = null; }, 600);
    }, { passive: true });
    document.addEventListener("touchend", () => { if (timer) { clearTimeout(timer); timer = null; } });
    document.addEventListener("touchmove", () => { if (timer) { clearTimeout(timer); timer = null; } }, { passive: true });
  })();

  /* patch randomGame to skip excluded */
  function patchRandom() {
    if (!window.randomGame || window.__randPatched) return;
    window.__randPatched = true;
    const orig = window.randomGame;
    window.randomGame = function () {
      // engine.js keeps its own catalog; re-implement respecting exclusions
      try {
        const cat = window.PDX_CATALOG || [];
        const ex = excluded();
        let pool = cat.filter(g => !ex.includes(g.id));
        if (!pool.length) { showToastSafe("All games excluded!"); return; }
        if (window.__lastRandom) { pool = pool.filter(g => g.id !== window.__lastRandom); }
        if (!pool.length) pool = cat.filter(g => !ex.includes(g.id));
        const pick = pool[Math.floor(Math.random() * pool.length)];
        window.__lastRandom = pick.id;
        window.openGame(pick.id);
      } catch (e) { orig && orig(); }
    };
  }
  /* patch party nextPartyGame to skip excluded */
  function patchParty() {
    if (window.__partyPatched) return;
    // wait until extras.js defines PARTY_POOL + party object
    const tryPatch = () => {
      try {
        const poolRef = (new Function("return typeof PARTY_POOL!=='undefined'?PARTY_POOL:null"))();
        if (!poolRef) return false;
        if (window.__partyPatched) return true;
        window.__partyPatched = true;
        // wrap window.startParty indirectly: patch the party object's behavior
        // by overriding PARTY_POOL getter — simplest: monkeypatch array filter
        const _pool = poolRef;
        // replace the global party pool with a Proxy that hides excluded games
        const handler = {
          get(t, k) {
            if (k === "filter") {
              return function (fn, ...rest) {
                return Array.prototype.filter.call(t, x => !isExcluded(x) && fn(x), ...rest);
              };
            }
            return t[k];
          }
        };
        // PARTY_POOL is a const binding — we can't reassign it, but
        // nextPartyGame uses PARTY_POOL.filter(...) — patching the filter
        // behavior on the array itself works:
        const origFilter = Array.prototype.filter;
        // (leave as-is; instead patch nextPartyGame via function binding)
        // Actually: replace window-level party game chooser if exposed.
        return true;
      } catch (e) { return false; }
    };
    // Simpler robust approach: intercept openGame during party mode.
    // nextPartyGame calls window.openGame(id) — if that id is excluded,
    // re-roll up to 20 times.
    if (!window.__partyRollPatched) {
      window.__partyRollPatched = true;
      const _open = window.openGame;
      window.openGame = function (id) {
        try {
          if (window.__partyActive !== false) { }
          // detect party mode via the party bar visibility
          const bar = document.getElementById("partyBar");
          const inParty = bar && bar.style.display !== "none";
          if (inParty && isExcluded(id)) {
            // re-roll: pick a different game not excluded
            const cat = window.PDX_CATALOG || [];
            let pool = cat.filter(g => !isExcluded(g.id));
            if (pool.length) {
              const pick = pool[Math.floor(Math.random() * pool.length)];
              return _open.call(this, pick.id);
            }
          }
        } catch (e) { }
        return _open.apply(this, arguments);
      };
    }
    // mark party bar state so openGame knows when we're in party
    const watch = () => {
      const bar = document.getElementById("partyBar");
      window.__partyActive = !!(bar && bar.style.display !== "none");
    };
    setInterval(watch, 500);
  }

  function boot() {
    patchRandom(); patchParty(); refreshCards();
    // NOTE: no MutationObserver here — refreshCards() mutates card DOM itself and
    // would trigger an infinite synchronous mutation feedback loop (page freeze).
    // The 1.5s interval below is enough to catch menu re-renders.
    setInterval(refreshCards, 1500);
  }
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 600);
  addEventListener("load", () => setTimeout(boot, 400));
})();
