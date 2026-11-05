/* =====================================================
   MENU ORGANIZER — reorganizes the 300-game menu into
   category sections with headers, quick-jump tab bar,
   a featured row, and compacts the card grid.
   Runs after engine.js (which builds the flat grid).
   ===================================================== */
(function () {
  "use strict";
  if (window.__MENU_ORGANIZER__) return; window.__MENU_ORGANIZER__ = true;

  const SECTION_ORDER = ["classic", "action", "sports", "reflex", "brain", "board", "arcade"];
  const SECTION_META = {
    classic: { label: "⭐ CLASSICS", color: "#ffe66d" },
    action: { label: "💥 ACTION", color: "#ff5878" },
    sports: { label: "🏀 SPORTS", color: "#63f59a" },
    reflex: { label: "⚡ REFLEX", color: "#64eaff" },
    brain: { label: "🧠 BRAIN", color: "#c07aff" },
    board: { label: "🎯 BOARD", color: "#8affc0" },
    arcade: { label: "🕹️ ARCADE", color: "#ff9a4a" }
  };

  let done = false;
  /* keep the organized grid in sync with the catalog: any game that
     registers late still gets a card appended to its correct section */
  function syncMissing() {
    if (!done || !window.PDX_CATALOG) return;
    const grid = document.querySelector("#menu .menu-buttons");
    if (!grid) return;
    const have = new Set([...grid.querySelectorAll(".game-card[data-id]")].map(c => c.dataset.id));
    window.PDX_CATALOG.forEach(g => {
      if (have.has(g.id)) return;
      have.add(g.id);
      const b = document.createElement("button");
      b.className = "game-card";
      b.dataset.id = g.id;
      b.dataset.cat = g.cat || "arcade";
      b.setAttribute("onclick", `openGame('${g.id}')`);
      b.innerHTML = `<strong>${String(g.title || g.id).toUpperCase()}</strong><small>${g.desc || ""}</small>`;
      b.addEventListener("click", () => window.playSelectSound && playSelectSound());
      // insert after this section's header (or at end)
      const head = grid.querySelector(`.menu-section-head[data-section="${b.dataset.cat}"]`);
      if (head) {
        let el = head.nextElementSibling;
        while (el && !el.classList.contains("menu-section-head") && el.dataset.cat === b.dataset.cat) el = el.nextElementSibling;
        grid.insertBefore(b, el);
      } else grid.appendChild(b);
    });
  }
  setInterval(syncMissing, 1500);
  function organize() {
    const grid = document.querySelector("#menu .menu-buttons");
    if (!grid || done) return;
    const cards = [...grid.querySelectorAll(".game-card[data-id]")];
    if (cards.length < 50) return;         // wait until the catalog is built
    done = true;

    /* ---- re-create any catalog games whose card is missing ----
       (later packs can register after the snapshot; without this they
        would be wiped by grid.innerHTML = "" below) */
    if (window.PDX_CATALOG) {
      const have = new Set(cards.map(c => c.dataset.id));
      window.PDX_CATALOG.forEach(g => {
        if (have.has(g.id)) return;
        const b = document.createElement("button");
        b.className = "game-card";
        b.dataset.id = g.id;
        b.dataset.cat = g.cat || "arcade";
        b.setAttribute("onclick", `openGame('${g.id}')`);
        b.innerHTML = `<strong>${String(g.title || g.id).toUpperCase()}</strong><small>${g.desc || ""}</small>`;
        b.addEventListener("click", () => window.playSelectSound && playSelectSound());
        grid.appendChild(b);
        cards.push(b);
      });
    }

    const search = document.getElementById("gameSearch");
    const catChips = document.getElementById("catChips");

    /* ---- featured strip: PARTY, RANDOM, top classics ---- */
    const featured = document.createElement("div");
    featured.id = "featuredRow";
    featured.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin:14px auto 8px;max-width:1000px;";
    const party = grid.querySelector(".party-card");
    const randomCard = grid.querySelector(".random-card");
    const pong = grid.querySelector('[data-id="pong"]');
    const duel = grid.querySelector('[data-id="duelGame"]');
    const tank = grid.querySelector('[data-id="tankGame"]');
    const cinema = [...grid.querySelectorAll(".game-card")].find(c => (c.getAttribute("onclick") || "").includes("openCinema"));
    [party, randomCard, pong, duel, tank, cinema].forEach(c => {
      if (!c) return;
      c.style.borderColor = "#ffe66d88";
      featured.appendChild(c);
    });
    grid.parentNode.insertBefore(featured, grid);

    /* ---- build sections ---- */
    const buckets = {};
    SECTION_ORDER.forEach(k => buckets[k] = []);
    cards.forEach(c => {
      const cat = c.dataset.cat || "arcade";
      (buckets[cat] || buckets.arcade).push(c);
    });
    grid.innerHTML = "";
    SECTION_ORDER.forEach(k => {
      const list = buckets[k];
      if (!list.length) return;
      const meta = SECTION_META[k] || { label: k.toUpperCase(), color: "#64eaff" };
      const head = document.createElement("div");
      head.className = "menu-section-head";
      head.dataset.section = k;
      head.style.cssText = `grid-column:1/-1;margin:18px 0 2px;padding-bottom:6px;border-bottom:2px solid ${meta.color}55;display:flex;align-items:baseline;gap:10px;`;
      head.innerHTML = `<strong style="color:${meta.color};font-size:15px;letter-spacing:2px;">${meta.label}</strong><small style="color:var(--muted);font-size:11px;">${list.length} GAMES</small>`;
      grid.appendChild(head);
      list.forEach(c => grid.appendChild(c));
    });
    // any strays
    const stray = [...grid.children].filter(el => el.classList && el.classList.contains("game-card") && !el.dataset.cat);
    if (stray.length) {
      const head = document.createElement("div");
      head.style.cssText = "grid-column:1/-1;margin:18px 0 2px;color:var(--muted);font-size:13px;letter-spacing:2px;border-bottom:2px solid #2a326055;padding-bottom:6px;";
      head.textContent = "MORE GAMES";
      grid.insertBefore(head, stray[0]);
    }

    /* ---- quick-jump bar ---- */
    const jump = document.createElement("div");
    jump.id = "catJump";
    jump.style.cssText = "display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:8px 0;";
    SECTION_ORDER.filter(k => buckets[k].length).forEach(k => {
      const b = document.createElement("button");
      b.className = "chip";
      const meta = SECTION_META[k] || { label: k.toUpperCase(), color: "#64eaff" };
      b.textContent = meta.label + " ·" + buckets[k].length;
      b.addEventListener("click", () => {
        search.value = "";
        // dispatch input so the engine's filter resets, then scroll to the section
        search.dispatchEvent(new Event("input", { bubbles: true }));
        document.querySelectorAll("#menu .menu-section-head").forEach(h => {
          if (h.dataset.section === k) h.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
      jump.appendChild(b);
    });
    grid.parentNode.insertBefore(jump, grid);

    /* ---- compact card style ---- */
    const st = document.createElement("style");
    st.textContent = `
  #menu .menu-buttons{grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:8px;max-width:1080px;}
  #menu .game-card{padding:10px 10px;min-height:52px;}
  #menu .game-card strong{font-size:12px;}
  #menu .game-card small{font-size:10px;}
  #menu .menu-section-head{scroll-margin-top:70px;}
  #featuredRow .game-card{border-width:2px;min-height:64px;}
  `;
    document.head.appendChild(st);

    /* hook search to also hide section headers */
    if (search) {
      search.addEventListener("input", () => {
        const q = search.value.trim().toLowerCase();
        const filtering = q !== "" || activeFilterCat !== "all";
        grid.querySelectorAll(".menu-section-head").forEach(h => { h.style.display = filtering ? "none" : ""; });
        if (!filtering) {
          // re-hide sections with zero visible cards
          grid.querySelectorAll(".menu-section-head").forEach(h => {
            let el = h.nextElementSibling, any = false;
            while (el && !el.classList.contains("menu-section-head")) {
              if (el.style.display !== "none" && el.classList.contains("game-card")) { any = true; break; }
              el = el.nextElementSibling;
            }
            h.style.display = any ? "" : "none";
          });
        }
      });
    }
    let activeFilterCat = "all";
    catChips && catChips.addEventListener("click", e => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      activeFilterCat = chip.dataset.cat || "all";
      setTimeout(() => {
        const filtering = search.value.trim() !== "" || activeFilterCat !== "all";
        grid.querySelectorAll(".menu-section-head").forEach(h => { h.style.display = filtering ? "none" : ""; });
        if (!filtering) {
          grid.querySelectorAll(".menu-section-head").forEach(h => {
            let el = h.nextElementSibling, any = false;
            while (el && !el.classList.contains("menu-section-head")) {
              if (el.style.display !== "none" && el.classList.contains("game-card")) { any = true; break; }
              el = el.nextElementSibling;
            }
            h.style.display = any ? "" : "none";
          });
        }
      }, 60);
    });
  }
  setTimeout(organize, 900);
  addEventListener("load", () => setTimeout(organize, 400));
  setTimeout(organize, 2000);
})();
