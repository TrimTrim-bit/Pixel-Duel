/* =====================================================
   MEGA SHOP V2 — full shop expansion replacing the tab
   set in features.js. Categories:
     THEMES (color palettes) · FONTS · BACKGROUNDS ·
     CINEMA (unlock videos) · MUSIC · SFX · AVATARS ·
     GAMES (unlock bonus games) · SCHOOL (upgrades) · PERKS
   Every purchase has a real effect via PDX_APPLY_* hooks.
   Loaded after features.js (uses its profile) and overrides
   renderShop by replacing the shop screen content.
   ===================================================== */
(function () {
  "use strict";
  if (window.__MEGA_SHOP__) return; window.__MEGA_SHOP__ = true;
  const P = window.PDX_PROFILE;
  function save() { window.PDX_SAVE && window.PDX_SAVE(); }
  function coins() { return (window.PDX_PROFILE || P).coins; }
  function pay(n) { const p = window.PDX_PROFILE; p.coins = Math.max(0, p.coins - n); save(); }

  /* theme energy level: energetic/cozy/premium affects card hover, glow intensity, borders */
  window.PDX_ENERGY_LEVEL = window.PDX_ENERGY_LEVEL || function () {
    const p = window.PDX_PROFILE;
    return (p && p.energy) || "cozy";
  };
  window.PDX_SET_ENERGY = function (level) {
    const p = window.PDX_PROFILE;
    p.energy = level;
    window.PDX_SAVE && window.PDX_SAVE();
    applyEnergy();
    showToastSafe("Theme mood: " + level.toUpperCase());
  };
  function applyEnergy() {
    const lvl = window.PDX_ENERGY_LEVEL();
    let st = document.getElementById("energyStyle");
    if (!st) { st = document.createElement("style"); st.id = "energyStyle"; document.head.appendChild(st); }
    if (lvl === "energetic") {
      st.textContent = `#menu .game-card:hover{transform:scale(1.06) rotate(1deg) !important;box-shadow:0 0 24px var(--accent) !important;}
        .shop-item:hover{transform:scale(1.04);box-shadow:0 0 20px var(--accent);}
        #dockSidebar .sidebar-btn:hover{padding-left:36px;background:rgba(100,234,255,.15);}
        #menu h1{text-shadow:0 0 30px var(--accent), 0 0 60px var(--accent);}
        .game-card{transition:all .12s;}`;
    } else if (lvl === "premium") {
      st.textContent = `#menu .game-card{background:linear-gradient(135deg,rgba(20,24,52,.95),rgba(14,18,38,.95)) !important;border:1px solid rgba(255,215,109,.15) !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06) !important;}
        #menu .game-card:hover{border-color:#ffe66d !important;box-shadow:0 8px 30px rgba(255,215,109,.08) !important;}
        .shop-item{background:linear-gradient(135deg,rgba(18,22,44,.95),rgba(12,16,32,.95));border:1px solid rgba(255,215,109,.12);}
        #dockSidebar{background:linear-gradient(180deg,#0d1428,#0a0e20) !important;border-right:2px solid rgba(255,215,109,.25) !important;}
        #menu h1{letter-spacing:4px;}`;
    } else { // cozy (default)
      st.textContent = `#menu .game-card:hover{transform:translateY(-3px) !important;box-shadow:0 4px 16px rgba(100,234,255,.12) !important;}
        .shop-item:hover{box-shadow:0 4px 14px rgba(100,234,255,.08);}
        .game-card{transition:all .2s ease;}`;
    }
  }
  addEventListener("load", () => setTimeout(applyEnergy, 800));
  applyEnergy();

  /* ---------------- webfont loading (unique fonts, not system lookalikes) */
  const WEBFONTS = {
    "Press Start 2P": "retro",
    "Playfair Display": "elegant",
    Orbitron: "futuristic",
    "Courier Prime": "typewriter",
    "Press Start 2P2": null,   // placeholder skip
    Bahnschrift: null,
    "Ink Free": null
  };
  const GF_LINK_ID = "megaShopFonts";
  function loadWebfonts() {
    if (document.getElementById(GF_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = GF_LINK_ID;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Playfair+Display:wght@400;700&family=Orbitron:wght@400;700;900&family=Courier+Prime:wght@400;700&family=Rubik+Mono+One&family=Bungee&family=Righteous&family=Fredoka+One&family=VT323&family=Silkscreen:wght@400;700&family=Monoton&family=Audiowide&family=Luckiest+Guy&family=Pacifico&family=Cinzel:wght@400;700&family=Major+Mono+Display&family=Bungee+Shade&family=Rubik+Pixels&family=Jersey+10&family=Pixelify+Sans:wght@400;700&family=Handjet:wght@400;700&display=swap";
    document.head.appendChild(link);
  }

  /* ---------------- catalog ---------------- */
  const FONTS = {
    mono: { name: "PIXEL MONO", css: "'Courier New',monospace", price: 0 },
    retro: { name: "RETRO CRT", css: "'Press Start 2P','Courier New',monospace", price: 8 },
    silks: { name: "SILKSCREEN", css: "'Silkscreen','Courier New',monospace", price: 10, weight: "700" },
    vt323: { name: "TERMINAL 323", css: "'VT323','Courier New',monospace", price: 9 },
    jersey: { name: "JERSEY 10", css: "'Jersey 10','Courier New',monospace", price: 10 },
    pixelify: { name: "PIXELIFY", css: "'Pixelify Sans','Courier New',monospace", price: 11 },
    arcade: { name: "BUNGEE BLOCK", css: "'Bungee','Arial Black',sans-serif", price: 6, weight: "900" },
    bungeeShade: { name: "BUNGEE SHADE", css: "'Bungee Shade','Arial Black',sans-serif", price: 12 },
    script: { name: "PACIFICO SCRIPT", css: "'Pacifico','Segoe Script',cursive", price: 10 },
    horror: { name: "MONOTON SPOOKY", css: "'Monoton','Impact',sans-serif", price: 9 },
    lucky: { name: "LUCKIEST GUY", css: "'Luckiest Guy','Impact',sans-serif", price: 8 },
    clean: { name: "CLEAN SANS", css: "'Segoe UI',Roboto,sans-serif", price: 5 },
    rubik: { name: "RUBIK PIXELS", css: "'Rubik Pixels','Courier New',monospace", price: 13 },
    rubikMono: { name: "RUBIK MONO ONE", css: "'Rubik Mono One','Arial Black',sans-serif", price: 12 },
    western: { name: "CINZEL WANTED", css: "'Cinzel','Georgia',serif", price: 9, weight: "700" },
    hand: { name: "HANDJET", css: "'Handjet','Segoe Print',cursive", price: 7, weight: "700" },
    bold_sans: { name: "BOLD SANS", css: "'Arial Black',sans-serif", price: 6, weight: "900" },
    serif_classic: { name: "CLASSIC SERIF", css: "'Times New Roman',serif", price: 4 },
    monospace_wide: { name: "WIDE MONO", css: "'Lucida Console','Courier New',monospace", price: 6, ls: "1px" },
    deco: { name: "ART DECO", css: "'Copperplate','Georgia',serif", price: 12, ls: "2px" },
    crystal: { name: "AUDIO WIDE", css: "'Audiowide','Segoe UI',sans-serif", price: 10 },
    righteous: { name: "RIGHTEOUS POP", css: "'Righteous','Century Gothic',sans-serif", price: 9 },
    typewriter: { name: "TYPEWRITER", css: "'Courier Prime','Courier New',monospace", price: 8 },
    elegant: { name: "ELEGANT SERIF", css: "'Playfair Display','Georgia',serif", price: 12 },
    futuristic: { name: "ORBITRON FUTURISTIC", css: "'Orbitron','Consolas','Courier New',monospace", price: 14, weight: "700", ls: "2px" },
    sticker: { name: "FREDOKA STICKER", css: "'Fredoka One','Comic Sans MS',cursive", price: 7 },
    tape: { name: "TAPE LABEL", css: "'Bahnschrift Condensed','Arial Narrow',sans-serif", price: 5, ls: "1px" },
    space_saga: { name: "SPACE SAGA", css: "'Impact','Arial Black',sans-serif", price: 18, ls: "4px" },
    branded: { name: "PIXEL DUEL BRANDED", css: "'Courier New',monospace", price: 25, weight: "900", ls: "2px" },
    night_owl: { name: "NIGHT OWL", css: "'Candara','Segoe UI',sans-serif", price: 9 },
    soft_round: { name: "SOFT ROUND", css: "'Century Gothic','Verdana',sans-serif", price: 10 }
  };
  const BACKGROUNDS = {
    none: { name: "PLAIN", desc: "No background pattern", price: 0 },
    stars: { name: "STARS", desc: "Twinkling starfield", price: 6 },
    dots: { name: "DOTS", desc: "Polka dot grid", price: 4 },
    lines: { name: "LINES", desc: "Diagonal scan stripes", price: 4 },
    grid: { name: "GRID", desc: "Blueprint grid", price: 5 },
    rain: { name: "RAIN", desc: "Falling code rain", price: 8 },
    bubbles: { name: "BUBBLES", desc: "Floating bubbles", price: 7 },
    snow: { name: "SNOW", desc: "Gentle snowfall", price: 7 },
    embers: { name: "EMBERS", desc: "Rising embers", price: 8 },
    checker: { name: "CHECKER", desc: "Dark checkerboard", price: 5 },
    waves: { name: "WAVES", desc: "Rolling sine waves", price: 8 },
    matrix: { name: "MATRIX", desc: "Digital rain, dense", price: 10 },
    nebula: { name: "NEBULA", desc: "Drifting colored dust clouds", price: 9 },
    fireflies: { name: "FIREFLIES", desc: "Slow glowing summer drifters", price: 8 },
    aurora: { name: "AURORA", desc: "Shifting northern-light bands", price: 11 },
    confetti: { name: "CONFETTI", desc: "Party colors drifting down", price: 8 },
    firework: { name: "FIREWORKS", desc: "Occasional soft bursts", price: 12 },
    Sakura: undefined,
  };
  delete BACKGROUNDS.Sakura;
  BACKGROUNDS.sakura = { name: "SAKURA", desc: "Cherry blossom petals on the breeze", price: 9 };
  BACKGROUNDS.leaves = { name: "AUTUMN LEAVES", desc: "Orange leaves tumble slowly", price: 8 };
  BACKGROUNDS.orbit = { name: "ORBIT", desc: "Planets circling far away", price: 10 };
  BACKGROUNDS.hex = { name: "HEX", desc: "Slow-pulsing honeycomb lattice", price: 9 };
  BACKGROUNDS.clouds = { name: "CLOUDS", desc: "Lazy clouds slide across", price: 7 };
  BACKGROUNDS.lightning = { name: "LIGHTNING", desc: "Occasional lightning strikes", price: 12 };
  BACKGROUNDS.crystals = { name: "CRYSTALS", desc: "Glowing crystal shards", price: 10 };
  BACKGROUNDS.datastream = { name: "DATA STREAM", desc: "Flowing data lines", price: 8 };
  BACKGROUNDS.warp = { name: "WARP SPEED", desc: "Star streaks flying past", price: 10 };
  BACKGROUNDS.dust = { name: "DUST MOTES", desc: "Floating dust in light beams", price: 7 };
  BACKGROUNDS.circuit = { name: "CIRCUIT BOARD", desc: "Slow-pulsing electronic traces", price: 11 };
  BACKGROUNDS.paintdrip = { name: "PAINT DRIP", desc: "Colored paint dripping down", price: 9 };
  const MUSIC = {
    none: { name: "SILENCE", desc: "No menu music", price: 0 },
    synthwave: { name: "SYNTHWAVE", desc: "Retro synth pad loop", price: 12 },
    chiptune: { name: "CHIPTUNE", desc: "8-bit bouncy loop", price: 12 },
    ambient: { name: "AMBIENT", desc: "Spacey drone", price: 10 },
    jazz: { name: "LOFI JAZZ", desc: "Smooth study beats", price: 14 },
    spooky: { name: "SPOOKY ORGAN", desc: "Halloween pipe-organ vibes", price: 12, season:"halloween" },
    jingle: { name: "JINGLE BELLS", desc: "Festive sleigh-bell chiptune", price: 12, season:"christmas" },
    blossom: { name:"SPRING BLOSSOM", desc:"Soft easter melody", price:12, season:"easter" },
    valentine:{ name:"SWEET WALTZ", desc:"Valentine's 3/4 lullaby", price:12, season:"valentines" },
    mario: { name:"OVERWORLD JUMP", desc:"Bouncy platformer vibes", price:14 },
    zelda: { name:"HERO'S QUEST", desc:"Adventurous flute melody", price:14 },
    tetris: { name:"BLOCK DROPPER", desc:"Falling-block Russian folk loop", price:14 },
    pac: { name:"WAKA WAKA", desc:"Maze-chaser arcade chomp", price:14 },
    space: { name:"DEEP SPACE", desc:"Cold starfield ambience", price:11 },
    piano: { name:"SOLO PIANO", desc:"Gentle midnight keys", price:12 },
    techno: { name:"NEON TECHNO", desc:"Driving dance-floor pulse", price:14 },
    blues: { name:"SMOOTH BLUES", desc:"Slow guitar riffs", price:13 },
    orchestral:{ name:"EPIC ORCHESTRA", desc:"Brass + strings fanfare", price:15 },
    acoustic: { name:"CAMPFIRE ACOUSTIC", desc:"Warm strummed guitar", price:12 },
    vapor: { name:"VAPORWAVE", desc:"Dreamy slowed tracks", price:13 }
  };
  // secret-code tracks get merged in here by secret_codes.js
  window.PDX_MERGE_SECRET_MUSIC = function (tracks) {
    Object.keys(tracks).forEach(k => {
      if (!MUSIC[k]) MUSIC[k] = tracks[k];
    });
  };
  const SFX_PACKS = {
    classic: { name: "CLASSIC BEEPS", desc: "Default square-wave set", price: 0 },
    arcade: { name: "ARCADE POP", desc: "Bright pop sounds", price: 8 },
    retro8: { name: "8-BIT DEEP", desc: "Chunky low-bit effects", price: 8 },
    soft: { name: "SOFT TONES", desc: "Gentle sine blips", price: 6 },
    arcade2: { name: "COIN MACHINE", desc: "Metallic ding-heavy", price: 9 },
    gunshot: { name: "LASER ZAP", desc: "Sci-fi laser fire", price: 7 },
    wood: { name: "WOOD BLOCK", desc: "Natural percussive clicks", price: 6 },
    metal: { name: "METAL CLANG", desc: "Heavy industrial dings", price: 8 },
    glass: { name: "GLASS TINK", desc: "Delicate crystal shatters", price: 7 }
  };
  const VIDEOS_SHOP = [
    { id: "vid_ocean", name: "DEEP OCEAN", desc: "Unlock: life in the abyss", price: 6 },
    { id: "vid_volcano", name: "VOLCANOES", desc: "Unlock: how eruptions work", price: 6 },
    { id: "vid_rome", name: "ROMAN ARMY", desc: "Unlock: legions & conquest", price: 8 },
    { id: "vid_space", name: "THE MOON", desc: "Unlock: Apollo missions", price: 8 },
    { id: "vid_dino", name: "DINOSAURS", desc: "Unlock: age of reptiles", price: 7 },
    { id: "vid_coding", name: "HOW GAMES ARE MADE", desc: "Unlock: behind the code", price: 9 },
    { id: "vid_sharks", name: "SHARKS", desc: "Unlock: ocean's top hunters", price: 7 },
    { id: "vid_weather", name: "EXTREME WEATHER", desc: "Unlock: tornadoes & lightning", price: 7 },
    { id: "vid_pyramids", name: "PYRAMIDS", desc: "Unlock: how they were built", price: 8 },
    { id: "vid_vikings", name: "VIKINGS", desc: "Unlock: raiders of the north", price: 8 },
    { id: "vid_brain", name: "YOUR BRAIN", desc: "Unlock: 86 billion neurons", price: 9 },
    { id: "vid_robotics", name: "ROBOTICS", desc: "Unlock: machines that move", price: 9 }
  ];
  const AVATARS = [
    { id: "av_robot", name: "ROBOT P1", desc: "Metal skin P1 avatar", price: 12 },
    { id: "av_alien", name: "ALIEN P1", desc: "Green skin P1 avatar", price: 12 },
    { id: "av_ghost", name: "GHOST P1", desc: "Pale translucent P1", price: 15 },
    { id: "av_robot2", name: "ROBOT P2", desc: "Metal skin P2 avatar", price: 12 },
    { id: "av_alien2", name: "ALIEN P2", desc: "Green skin P2 avatar", price: 12 },
    { id: "av_ninja", name: "NINJA P2", desc: "Shadow suit P2", price: 14 },
    { id: "av_knight", name: "KNIGHT P1", desc: "Steel helm and cape", price: 14 },
    { id: "av_astronaut", name: "ASTRONAUT P1", desc: "Space suit with dome helmet", price: 16 },
    { id: "av_wizard", name: "WIZARD P1", desc: "Pointed hat and glowing eyes", price: 16 },
    { id: "av_pilot", name: "PILOT P2", desc: "Aviator cap and goggles", price: 13 },
    { id: "av_detective", name: "DETECTIVE P2", desc: "Trench coat and fedora", price: 13 },
    { id: "av_clown", name: "CLOWN P2", desc: "Rainbow wig, red nose", price: 12 },
    { id: "av_pirate", name: "PIRATE P1", desc: "Eyepatch and tricorn hat", price: 14 },
    { id: "av_cowboy", name: "COWBOY P1", desc: "Stetson and boots", price: 13 },
    { id: "av_vampire", name: "VAMPIRE P1", desc: "Cape and fangs", price: 15 },
    { id: "av_mermaid", name: "MERMAID P2", desc: "Seashell and fin", price: 14 },
    { id: "av_dragon", name: "DRAGON P2", desc: "Scaly green skin", price: 16 },
    { id: "av_cat", name: "CAT P2", desc: "Fuzzy ears and whiskers", price: 11 },
    { id: "av_dog", name: "DOG P1", desc: "Floppy ears and tongue", price: 11 }
  ];
  const GAMES_SHOP = [
    { id: "game_gold", name: "VAULT RUN", desc: "Unlock exclusive heist game", price: 18 },
    { id: "game_sky", name: "SKY FORGE", desc: "Unlock exclusive flying game", price: 18 },
    { id: "game_sea", name: "TRENCH DUEL", desc: "Unlock exclusive ocean game", price: 18 },
    { id: "sg_ghost", name: "GHOST HUNT", desc: "Unlock: chase ghosts in the dark", price: 20 },
    { id: "sg_pizza", name: "PIZZA RUSH", desc: "Unlock: deliver pizzas against the clock", price: 20 },
    { id: "sg_maze", name: "MAZE ESCAPE", desc: "Unlock: race through shifting walls", price: 25 },
    { id: "sg_sumo2", name: "SUMO SMASH", desc: "Unlock: ring-out with power-ups", price: 22 },
    { id: "sg_karate", name: "KARATE KOMBAT", desc: "Unlock: one-hit karate duel", price: 20 },
    { id: "sg_laser", name: "LASER DODGE", desc: "Unlock: dodge sweeping laser grids", price: 20 },
    { id: "sg_farm", name: "FARM FRENZY", desc: "Unlock: harvest crops before dusk", price: 20 },
    { id: "sg_racer", name: "NEON RACER", desc: "Unlock: high-speed hover race", price: 24 }
  ];
  const SCHOOL_SHOP = [
    { id: "school_smart", name: "SMART HINTS", desc: "Shows hints in School Mode practice", price: 10 },
    { id: "school_timer", name: "SPEED MODE", desc: "Timed practice rounds", price: 10 },
    { id: "school_cert", name: "GOLD CERTS", desc: "Fancy certificate styling", price: 8 },
    { id: "school_pencil", name: "PIXEL PENCIL", desc: "Animated pencil cursor in School Mode", price: 6 },
    { id: "school_sticker", name: "STICKER PACK", desc: "Extra reward stickers for passing sets", price: 9 },
    { id: "school_leader", name: "CLASS LEADERBOARD", desc: "See a fake class ranking board", price: 14 },
    { id: "school_theme", name: "SCHOOL BLUE THEME", desc: "Light blue classroom palette", price: 10 },
    { id: "school_locker", name: "LOCKER DECOR", desc: "Personalize your locker in School Mode", price: 12 },
    { id: "school_bus", name: "BUS RIDE SKIN", desc: "Animated school-bus loading screen", price: 11 },
    { id: "school_report", name: "REPORT CARD", desc: "Get a printable report card", price: 15 },
    { id: "school_tutor", name: "AI TUTOR", desc: "Gentle AI tutor gives second hints", price: 18 }
  ];
  const PERKS = [
    { id: "perk_lucky", name: "LUCKY COINS", desc: "+25% coins from every win", price: 20 },
    { id: "perk_streak", name: "STREAK SHIELD", desc: "Keep daily streak 1 missed day", price: 15 },
    { id: "perk_ai_hard", name: "AI ELITE", desc: "Unlock hardest AI difficulty", price: 12 },
    { id: "perk_party_plus", name: "PARTY+", desc: "Party Mode: first to 5, bigger pool", price: 10 },
    { id: "perk_rematch", name: "QUICK REMATCH", desc: "One-key rematch always on", price: 8 },
    { id: "perk_gold_cursor", name: "GOLD TRAIL", desc: "Golden menu hover trail", price: 6 },
    { id: "perk_double_win", name: "DOUBLE OR NOTHING", desc: "Bet your win coins for a 2x payout", price: 22 },
    { id: "perk_lucky_start", name: "HEAD START", desc: "Small edge on random game draws", price: 16 },
    { id: "perk_daily_double", name: "DAILY DOUBLE", desc: "Daily bonus coins are doubled", price: 18 },
    { id: "perk_xp_boost", name: "XP BOOST", desc: "Level up your arcade profile faster", price: 20 },
    { id: "perk_shop_deal", name: "SHOP DEALS", desc: "10% off every purchase, forever", price: 25 },
    { id: "perk_free_spin", name: "FREE SPIN", desc: "One extra spin per day in Party Mode", price: 14 },
    { id: "perk_coin_magnet", name: "COIN MAGNET", desc: "Attract nearby pickups in any game", price: 17 },
    { id: "perk_ghost_mode", name: "GHOST MODE", desc: "Preview one random game before it starts", price: 16 },
    { id: "perk_speedrun", name: "SPEEDRUN TIMER", desc: "Show a speedrun timer in solo games", price: 12 },
    { id: "perk_vip", name: "VIP BADGE", desc: "Shiny VIP badge next to your name", price: 28 }
  ];

  /* ---- seasonal limited items (only purchasable during their event) ---- */
  function currentSeason() {
    const d = new Date(), m = d.getMonth(), day = d.getDate();
    if (m === 9 && day >= 15 && day <= 31) return "halloween";
    if ((m === 11 && day >= 15) || (m === 0 && day <= 5)) return "christmas";
    if (m === 3 && day >= 1 && day <= 29) return "easter";
    if (m === 1 && day >= 10 && day <= 14) return "valentines";
    return null;
  }
  const SEASON_NAMES = { halloween: "HALLOWEEN", christmas: "CHRISTMAS", easter: "EASTER", valentines: "VALENTINE'S" };
  const SEASON_RANGE = {
    halloween: "OCT 15–31", christmas: "DEC 15–JAN 5",
    easter: "APR 1–29", valentines: "FEB 10–14"
  };
  const LIMITED = [
    { id: "lim_pumpkin_theme", tab: "themes", name: "PUMPKIN GLOW", desc: "Warm jack-o'-lantern color scheme", price: 14, season: "halloween" },
    { id: "lim_bat_cursor", tab: "perks", name: "BAT TRAIL", desc: "Bats follow your cursor on the menu", price: 12, season: "halloween" },
    { id: "lim_spooky_organ", tab: "music", name: "HAUNTED ORGAN", desc: "Deep pipe-organ loop, all year", price: 16, season: "halloween" },
    { id: "lim_santa_theme", tab: "themes", name: "SANTA'S WORKSHOP", desc: "Red-and-green festive palette", price: 14, season: "christmas" },
    { id: "lim_gift_bg", tab: "backgrounds", name: "FALLING GIFTS", desc: "Presents drift down the menu", price: 10, season: "christmas" },
    { id: "lim_egg_bg", tab: "backgrounds", name: "EGG HUNT", desc: "Hidden eggs float past", price: 10, season: "easter" },
    { id: "lim_love_theme", tab: "themes", name: "SWEETHEART", desc: "Rosy valentine palette", price: 14, season: "valentines" },
    { id: "lim_heart_trail", tab: "perks", name: "HEART TRAIL", desc: "Hearts follow your cursor", price: 12, season: "valentines" }
  ];

  /* favicon shop list derived from the favicon engine */
  const FAVICON_LIST = window.PDX_FAVICON_ICONS
    ? Object.entries(window.PDX_FAVICON_ICONS).map(([id, v]) => ({ id, name: v.name, desc: id === "school" ? "Auto-used in School Mode" : id === "glitch" ? "Auto-used in glitch mode" : "Browser tab icon", price: v.price }))
    : [];

  const TABS = [
    ["themes", "🎨 THEMES"], ["mood", "🎭 MOOD"], ["fonts", "🔤 FONTS"], ["backgrounds", "🖼️ BACKGROUNDS"],
    ["favicons", "🔖 FAVICONS"],
    ["cinema", "🎬 VIDEOS"], ["music", "🎵 MUSIC"], ["sfx", "🔊 SFX"],
    ["avatars", "🧑‍🚀 AVATARS"], ["games", "🎮 GAMES"], ["school", "🏫 SCHOOL"], ["perks", "⚡ PERKS"]
  ];
  const MOODS = [
    { id: "cozy", name: "COZY", desc: "Soft glows, gentle hover, rounded corners (default)", price: 0 },
    { id: "energetic", name: "ENERGETIC", desc: "Bright hover pops, punchy glow, snappy motion", price: 0 },
    { id: "premium", name: "PREMIUM", desc: "Sleek gradients, gold hover accents, elegant spacing", price: 0 }
  ];

  /* owned/equip helpers */
  function isOwned(tab, item) {
    const p = window.PDX_PROFILE;
    switch (tab) {
      case "themes": return p.ownedThemes.includes(item.id);
      case "fonts": return item.price === 0 || (p.ownedFonts || []).includes(item.id);
      case "backgrounds": return item.price === 0 || (p.ownedBackgrounds || []).includes(item.id);
      case "favicons": return item.price === 0 || (p.ownedFavicons || []).includes(item.id);
      case "cinema": return p.cinemaWatched.includes(item.id) || (p.ownedVideos || []).includes(item.id);
      case "music": return item.price === 0 || (p.ownedMusic || []).includes(item.id);
      case "sfx": return item.price === 0 || (p.ownedSfx || []).includes(item.id);
      case "avatars": return (p.ownedAvatars || []).includes(item.id);
      case "games": return (p.ownedGames || []).includes(item.id);
      case "school": return (p.schoolUpgrades || []).includes(item.id);
      case "perks": return (p.perks || []).includes(item.id);
      case "mood": return true;
    }
    return false;
  }
  function isEquipped(tab, item) {
    const p = window.PDX_PROFILE;
    switch (tab) {
      case "themes": return p.theme === item.id;
      case "fonts": return (p.font || "mono") === item.id;
      case "backgrounds": return (p.background || "none") === item.id;
      case "favicons": return (p.favicon || "default") === item.id;
      case "music": return (p.music || "none") === item.id;
      case "sfx": return (p.sfx || "classic") === item.id;
      case "avatars": return (p.equippedAvatars || []).includes(item.id);
      case "games": return false;
      case "cinema": return false;
      case "school": return false;
      case "perks": return false;
      case "mood": return (p.energy || "cozy") === item.id;
    }
    return false;
  }
  function equip(tab, item) {
    const p = window.PDX_PROFILE;
    switch (tab) {
      case "themes": p.theme = item.id; window.PDX_APPLY_THEME && window.PDX_APPLY_THEME(); break;
      case "fonts": p.font = item.id; applyFont(); break;
      case "backgrounds": p.background = item.id; applyBackground(); break;
      case "favicons": p.favicon = item.id; window.PDX_SET_FAVICON && window.PDX_SET_FAVICON(item.id); break;
      case "music": p.music = item.id; applyMusic(); break;
      case "sfx": p.sfx = item.id; applySfx(); break;
      case "avatars": p.equippedAvatars = p.equippedAvatars || [];
        p.equippedAvatars = p.equippedAvatars.includes(item.id) ? p.equippedAvatars.filter(x => x !== item.id) : [...p.equippedAvatars, item.id]; break;
      case "games": case "cinema": case "school": case "perks": break;
      case "mood": p.energy = item.id; applyEnergy(); break;
    }
    save();
  }
  /* ---- real pixel-art avatar previews ---- */
  function drawDude(x, skin, shirt, pants, hair, style, extra) {
    x.imageSmoothingEnabled = false;
    const cx = 60, by = 140;
    x.fillStyle = "#141a3a"; x.fillRect(0, 0, 120, 160);
    x.fillStyle = "rgba(0,0,0,.35)"; x.beginPath(); x.ellipse(cx, by + 2, 22, 5, 0, 0, Math.PI * 2); x.fill();
    // legs
    x.fillStyle = pants; x.fillRect(cx - 11, by - 30, 9, 30); x.fillRect(cx + 2, by - 30, 9, 30);
    // shoes
    x.fillStyle = "#0c0f24"; x.fillRect(cx - 12, by - 4, 10, 5); x.fillRect(cx + 2, by - 4, 10, 5);
    // torso
    x.fillStyle = shirt; x.fillRect(cx - 16, by - 70, 32, 43);
    x.strokeStyle = "#080b18"; x.lineWidth = 2; x.strokeRect(cx - 16, by - 70, 32, 43);
    // head
    x.fillStyle = skin; x.fillRect(cx - 14, by - 110, 28, 41);
    x.strokeStyle = "#080b18"; x.strokeRect(cx - 14, by - 110, 28, 41);
    // hair
    x.fillStyle = hair;
    if (style === "short") x.fillRect(cx - 16, by - 113, 32, 8);
    else if (style === "long") { x.fillRect(cx - 16, by - 113, 32, 10); x.fillRect(cx - 16, by - 105, 5, 23); x.fillRect(cx + 11, by - 105, 5, 23); }
    else if (style === "mohawk") x.fillRect(cx - 4, by - 120, 8, 12);
    else if (style === "helmet") { x.fillStyle = "#9fc0ff"; x.fillRect(cx - 16, by - 114, 32, 12); x.fillStyle = "#64eaff"; x.fillRect(cx - 12, by - 100, 24, 4); }
    else if (style === "visor") { x.fillStyle = "#64eaff"; x.fillRect(cx - 12, by - 96, 24, 7); }
    else x.fillRect(cx - 16, by - 113, 32, 8);
    // eyes
    x.fillStyle = "#fff"; x.fillRect(cx - 9, by - 93, 5, 5); x.fillRect(cx + 4, by - 93, 5, 5);
    x.fillStyle = "#11152b"; x.fillRect(cx - 8, by - 92, 3, 3); x.fillRect(cx + 5, by - 92, 3, 3);
    if (extra) extra(x, cx, by);
  }
  const AVATAR_PREVIEWS = {
    av_robot: x => drawDude(x, "#b8c8e8", "#8a94b8", "#5a6488", "#b8c8e8", "visor", (x, cx, by) => { x.fillStyle = "#64eaff"; x.fillRect(cx - 14, by - 108, 28, 3); }),
    av_alien: x => drawDude(x, "#7ac86a", "#3a5a8a", "#2a3a5a", "#4a8a3a", "short", null),
    av_ghost: x => drawDude(x, "#dce4ff", "#8a94c8", "#5a64a8", "#dce4ff", "long", (x, cx, by) => { x.globalAlpha = .35; x.fillStyle = "#fff"; x.fillRect(cx - 16, by - 70, 32, 43); x.globalAlpha = 1; }),
    av_robot2: x => drawDude(x, "#9aa8cc", "#6a74a8", "#4a5488", "#9aa8cc", "visor", null),
    av_alien2: x => drawDude(x, "#8ad88a", "#2a4a7a", "#1a2a4a", "#3a7a2a", "mohawk", null),
    av_ninja: x => drawDude(x, "#e8c8a8", "#2a2a3a", "#1a1a2a", "#2a2a3a", "short", (x, cx, by) => { x.fillStyle = "#2a2a3a"; x.fillRect(cx - 15, by - 100, 30, 7); x.fillStyle = "#ff4a4a"; x.fillRect(cx - 2, by - 99, 4, 4); }),
    av_pirate: x => drawDude(x, "#f3bd83", "#8a2a2a", "#2a2a3a", "#8a5a2a", "bandana", (x, cx, by) => {
      x.fillStyle = "#111"; x.fillRect(cx - 10, by - 94, 12, 5);           // eyepatch
      x.strokeStyle = "#111"; x.lineWidth = 1;
      x.beginPath(); x.moveTo(cx - 10, by - 88); x.lineTo(cx + 2, by - 96); x.stroke();
      x.fillStyle = "#e8443a"; x.fillRect(cx - 17, by - 113, 34, 8);      // red bandana
    }),
    av_spartan: x => drawDude(x, "#4a8a3a", "#6aa85a", "#2a5a1a", "#4a8a3a", "helmet", (x, cx, by) => {
      x.fillStyle = "#a0ffa0"; x.fillRect(cx - 12, by - 99, 24, 5);       // glowing visor
    })
  };
  const AVATAR_INFO = {
    av_robot: "Full chrome plating. Blue visor. Applies to your P1 avatar's head + outfit.",
    av_alien: "Green skin, dark fleet uniform. Applies skin color to your avatar.",
    av_ghost: "Semi-transparent pale skin with flowing hair.",
    av_robot2: "Steel P2 variant with blue visor.",
    av_alien2: "Emerald P2 variant with a green mohawk.",
    av_ninja: "Shadow suit, red eye-slit headband. Sneaky.",
    av_pirate: "Secret: bandana, eyepatch, captain's coat. Yarr.",
    av_spartan: "Secret: MJOLNIR armor with glowing visor. Finish the fight."
  };
  // inject secret avatars into the avatar list when unlocked
  function avatarsWithSecrets() {
    const p = window.PDX_PROFILE || {};
    const list = AVATARS.slice();
    if ((p.ownedAvatars || []).includes("av_pirate") && !list.find(a => a.id === "av_pirate")) list.push({ id: "av_pirate", name: "PIRATE P1", desc: "Secret unlock", price: 0 });
    if ((p.ownedAvatars || []).includes("av_spartan") && !list.find(a => a.id === "av_spartan")) list.push({ id: "av_spartan", name: "SPARTAN P1", desc: "Secret unlock", price: 0 });
    return list;
  }
  function purchase(tab, item) {
    const p = window.PDX_PROFILE;
    if (item.limited && !item.avail) { showToastSafe("Not available right now — returns " + (SEASON_RANGE[item.season] || "next event")); return false; }
    if (coins() < item.price) { showToastSafe("Not enough coins!"); return false; }
    pay(item.price);
    switch (tab) {
      case "themes": p.ownedThemes.push(item.id); break;
      case "fonts": p.ownedFonts = [...(p.ownedFonts || []), item.id]; break;
      case "backgrounds": p.ownedBackgrounds = [...(p.ownedBackgrounds || []), item.id]; break;
      case "favicons": p.ownedFavicons = [...(p.ownedFavicons || []), item.id]; break;
      case "cinema": p.ownedVideos = [...(p.ownedVideos || []), item.id]; break;
      case "music": p.ownedMusic = [...(p.ownedMusic || []), item.id]; break;
      case "sfx": p.ownedSfx = [...(p.ownedSfx || []), item.id]; break;
      case "avatars": p.ownedAvatars.push(item.id);
        // apply to the player's actual avatar (skin/outfit change)
        try {
          const p2 = window.PDX_PROFILE;
          if (item.id.includes("robot")) { p2.avatar.skin = "#b8c8e8"; p2.avatar.shirt = "#8a94b8"; p2.avatar.pants = "#5a6488"; p2.avatar.style = "short"; }
          else if (item.id.includes("alien")) { p2.avatar.skin = "#7ac86a"; p2.avatar.shirt = "#3a5a8a"; p2.avatar.pants = "#2a3a5a"; }
          else if (item.id.includes("ghost")) { p2.avatar.skin = "#dce4ff"; p2.avatar.hair = "#dce4ff"; p2.avatar.style = "long"; }
          else if (item.id.includes("ninja")) { p2.avatar.shirt = "#2a2a3a"; p2.avatar.pants = "#1a1a2a"; }
          if (item.id.endsWith("2")) p2.equippedAvatars2 = item.id;
          window.PDX_SAVE && window.PDX_SAVE();
          // refresh avatar screen if open
          const scr = document.getElementById("avatarScreen");
          if (scr && window.PDX_RERENDER_AVATAR) window.PDX_RERENDER_AVATAR(scr);
        } catch (e) { }
        break;
      case "games": p.ownedGames = [...(p.ownedGames || []), item.id];
        // register the exclusive game immediately so it's playable now
        if (item.id === "game_gold") registerVault();
        if (item.id === "game_sky") registerSkyforge();
        if (item.id === "game_sea") registerTrench();
        break;
      case "school": p.schoolUpgrades.push(item.id); break;
      case "perks": p.perks = [...(p.perks || []), item.id];
        if (item.id === "perk_ai_hard") window.PDX_AI && (window.PDX_AI.eliteUnlocked = true);
        break;
    }
    save();
    showToastSafe(`Purchased ${item.name}! 🛒`);
    return true;
  }
  function showToastSafe(m) { try { window.showToast ? showToast(m) : console.log(m); } catch (e) { } }

  /* ---------------- apply functions ---------------- */
  function applyFont() {
    const p = window.PDX_PROFILE;
    const f = FONTS[p.font || "mono"] || FONTS.mono;
    document.documentElement.style.setProperty("--font-main", f.css);
    document.documentElement.style.setProperty("--font-weight", f.weight || "");
    document.documentElement.style.setProperty("--font-ls", f.ls || "0");
    const st = document.getElementById("megaFontStyle") || document.createElement("style");
    st.id = "megaFontStyle";
    st.textContent = `body,#menu,#menu h1,#menu p,.game-card,.status,.back,button{font-family:${f.css} !important;${f.weight ? `font-weight:${f.weight};` : ""}${f.ls ? `letter-spacing:${f.ls};` : ""}}`;
    document.head.appendChild(st);
  }
  function applyBackground() {
    const p = window.PDX_PROFILE;
    const bg = p.background || "none";
    let el = document.getElementById("megaBG");
    if (!el) {
      el = document.createElement("canvas"); el.id = "megaBG";
      el.style.cssText = "position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.18;";
      document.body.appendChild(el);
    }
    const cvs = el, ctx = cvs.getContext("2d");
    cvs.width = innerWidth; cvs.height = innerHeight;
    // stop old anim
    if (cvs.__stop) { cvs.__stop(); }
    cvs.__anim && (cancelAnimationFrame(cvs.__anim));
    const parts = [];
    function initParts(kind) {
      parts.length = 0;
      const n = kind === "matrix" ? 90 : kind === "stars" ? 110 : 70;
      for (let i = 0; i < n; i++)parts.push({
        x: Math.random() * cvs.width, y: Math.random() * cvs.height,
        vx: (Math.random() - .5) * 20, vy: 20 + Math.random() * 40,
        r: Math.random() * 2 + 1, ph: Math.random() * 6
      });
    }
    let t = 0;
    function frame() {
      if (bg === "none") { ctx.clearRect(0, 0, cvs.width, cvs.height); return; }
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      t += 1 / 90;
      const col = "rgba(120,180,255,";
      switch (bg) {
        case "stars":
          if (parts.length !== 110) initParts("stars");
          for (const p of parts) {
            p.ph += .03;
            ctx.fillStyle = col + (.25 + Math.abs(Math.sin(p.ph)) * .6) + ")";
            ctx.fillRect(p.x, p.y, p.r, p.r);
          } break;
        case "dots":
          ctx.fillStyle = col + "0.13)";
          for (let x = 0; x < cvs.width; x += 26)for (let y = 0; y < cvs.height; y += 26)ctx.fillRect(x, y, 2, 2); break;
        case "lines":
          ctx.strokeStyle = col + "0.08)"; ctx.lineWidth = 1;
          for (let x = -cvs.height; x < cvs.width; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + cvs.height, cvs.height); ctx.stroke(); } break;
        case "grid":
          ctx.strokeStyle = col + "0.10)"; ctx.lineWidth = 1;
          for (let x = 0; x < cvs.width; x += 44) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cvs.height); ctx.stroke(); }
          for (let y = 0; y < cvs.height; y += 44) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cvs.width, y); ctx.stroke(); } break;
        case "rain": case "matrix": {
          if (parts.length !== (bg === "matrix" ? 90 : 70)) initParts("matrix");
          ctx.font = "12px monospace";
          for (const p of parts) {
            ctx.fillStyle = col + ".5)";
            ctx.fillRect(p.x, (p.y % cvs.height), 1.6, 16);
            p.y += p.vy * .55;
            if (p.y > cvs.height) { p.y = -20; p.x = Math.random() * cvs.width; }
          } break;
        }
        case "bubbles":
          if (!parts.length) initParts("bubbles");
          for (const p of parts) {
            p.y -= p.vy * .4; p.ph += .02;
            if (p.y < -12) { p.y = cvs.height + 12; p.x = Math.random() * cvs.width; }
            ctx.strokeStyle = col + ".35)";
            ctx.beginPath(); ctx.arc(p.x + Math.sin(p.ph) * 8, p.y, p.r * 3, 0, Math.PI * 2); ctx.stroke();
          } break;
        case "snow":
          if (!parts.length) initParts("snow");
          for (const p of parts) {
            p.y += p.vy * .18; p.ph += .03;
            if (p.y > cvs.height + 6) { p.y = -6; p.x = Math.random() * cvs.width; }
            ctx.fillStyle = "rgba(255,255,255,.55)";
            ctx.beginPath(); ctx.arc(p.x + Math.sin(p.ph) * 12, p.y, p.r, 0, Math.PI * 2); ctx.fill();
          } break;
        case "embers":
          if (!parts.length) initParts("embers");
          for (const p of parts) {
            p.y -= p.vy * .22; p.ph += .04;
            if (p.y < -8) { p.y = cvs.height + 8; p.x = Math.random() * cvs.width; }
            ctx.fillStyle = `rgba(255,${140 + Math.floor(Math.sin(p.ph) * 60)},60,.5)`;
            ctx.beginPath(); ctx.arc(p.x + Math.sin(p.ph) * 6, p.y, p.r, 0, Math.PI * 2); ctx.fill();
          } break;
        case "checker":
          ctx.fillStyle = "rgba(255,255,255,.03)";
          for (let x = 0; x < cvs.width; x += 48)for (let y = 0; y < cvs.height; y += 48)if (((x + y) / 48) % 2 === 0) ctx.fillRect(x, y, 48, 48); break;
        case "waves": {
          ctx.strokeStyle = col + "0.15)"; ctx.lineWidth = 2;
          for (let k = 0; k < 4; k++) {
            ctx.beginPath();
            for (let x = 0; x <= cvs.width; x += 12) {
              const y = cvs.height * .25 + k * 60 + Math.sin(x / 90 + t * (.45 + k * .12)) * 10;
              x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            } ctx.stroke();
          } break;
        }
        case "nebula":
          if (!parts.length) initParts("nebula");
          for (const p of parts) {
            p.ph += .02; p.x += Math.sin(p.ph) * .3; p.y += Math.cos(p.ph * .7) * .2;
            const hue = 200 + Math.sin(p.ph) * 80;
            ctx.fillStyle = `hsla(${hue},80%,70%,.25)`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2); ctx.fill();
          } break;
        case "fireflies":
          if (!parts.length) initParts("fireflies");
          for (const p of parts) {
            p.ph += .04; p.x += Math.sin(p.ph) * .8; p.y += Math.cos(p.ph * 1.3) * .6;
            const glow = .2 + Math.abs(Math.sin(p.ph * 2)) * .7;
            ctx.fillStyle = `rgba(255,240,120,${glow})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 1, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = `rgba(255,240,120,${glow * .25})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
          } break;
        case "aurora": {
          for (let k = 0; k < 3; k++) {
            const grd = ctx.createLinearGradient(0, cvs.height * (.15 + k * .2), 0, cvs.height * (.45 + k * .2));
            const hue = 120 + k * 60 + Math.sin(t * .5) * 40;
            grd.addColorStop(0, `hsla(${hue},80%,60%,0)`);
            grd.addColorStop(.5, `hsla(${hue},80%,60%,.13)`);
            grd.addColorStop(1, `hsla(${hue},80%,60%,0)`);
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.moveTo(0, cvs.height * (.3 + k * .2));
            for (let x = 0; x <= cvs.width; x += 40) ctx.lineTo(x, cvs.height * (.3 + k * .2) + Math.sin(x / 150 + t * (0.4 + k * .2)) * 26);
            ctx.lineTo(cvs.width, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
          } break;
        }
        case "confetti":
          if (!parts.length) initParts("confetti");
          for (const p of parts) {
            p.y += p.vy * .3; p.rot = (p.rot || 0) + .04;
            if (p.y > cvs.height + 10) { p.y = -10; p.x = Math.random() * cvs.width; }
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
            ctx.fillStyle = `hsla(${(p.r * 90) % 360},80%,65%,.7)`;
            ctx.fillRect(-3, -5, 6, 10); ctx.restore();
          } break;
        case "firework": {
          if (!parts.length || Math.random() < .006) {
            const bx = Math.random() * cvs.width, by = Math.random() * cvs.height * .6;
            const burst = 14 + Math.floor(Math.random() * 8);
            for (let i = 0; i < burst; i++) {
              const a = (i / burst) * Math.PI * 2;
              parts.push({ x: bx, y: by, vx: Math.cos(a) * (30 + Math.random() * 40), vy: Math.sin(a) * (30 + Math.random() * 40), r: 1.5, ph: 0, life: 1, h: Math.random() * 360 });
            }
            while (parts.length > 200) parts.shift();
          }
          for (const p of parts) {
            if (p.h === undefined) continue;
            p.x += p.vx / 60; p.y += p.vy / 60; p.vy += 12 / 60; p.life -= .012; p.ph += .05;
            if (p.life <= 0) { p.dead = true; continue; }
            ctx.fillStyle = `hsla(${p.h},85%,70%,${p.life})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
          }
          for (let i = parts.length - 1; i >= 0; i--) if (parts[i].dead) parts.splice(i, 1);
          break;
        }
        case "sakura":
          if (!parts.length) initParts("sakura");
          for (const p of parts) {
            p.y += p.vy * .35; p.ph += .02; p.x += Math.sin(p.ph * 1.4) * 1.1;
            if (p.y > cvs.height + 8) { p.y = -8; p.x = Math.random() * cvs.width; }
            ctx.fillStyle = "rgba(255,183,197,.75)";
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.ph);
            ctx.beginPath(); ctx.ellipse(0, 0, p.r + 2, p.r - .5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
          } break;
        case "leaves":
          if (!parts.length) initParts("leaves");
          for (const p of parts) {
            p.y += p.vy * .4; p.ph += .025; p.x += Math.sin(p.ph * 1.1) * 1.3;
            if (p.y > cvs.height + 10) { p.y = -10; p.x = Math.random() * cvs.width; }
            const oc = ["rgba(230,126,34,.7)", "rgba(200,90,30,.7)", "rgba(180,140,40,.7)"][Math.floor(p.r) % 3];
            ctx.fillStyle = oc;
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.ph);
            ctx.beginPath(); ctx.ellipse(0, 0, p.r + 3, p.r, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
          } break;
        case "orbit": {
          const cx = cvs.width / 2, cy = cvs.height / 2;
          for (let k = 0; k < 4; k++) {
            const rr = 60 + k * 55;
            ctx.strokeStyle = "rgba(120,180,255,.08)"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr * .55, 0, 0, Math.PI * 2); ctx.stroke();
            const a = t * (.3 + k * .17) + k * 2;
            const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr * .55;
            const pc = ["#ff9a4a", "#63f59a", "#64b5f6", "#ff72c8"][k];
            ctx.fillStyle = pc; ctx.beginPath(); ctx.arc(px, py, 4 - k * .5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
          } break;
        }
        case "hex": {
          const s = 34, pulse = .06 + Math.abs(Math.sin(t * .8)) * .07;
          ctx.strokeStyle = `rgba(120,180,255,${pulse})`; ctx.lineWidth = 1.2;
          for (let row = 0; row * s * .87 < cvs.height + s; row++) {
            for (let cc = 0; cc * s * 1.55 < cvs.width + s; cc++) {
              const hx = cc * s * 1.55 + (row % 2 ? s * .78 : 0);
              const hy = row * s * .87;
              ctx.beginPath();
              for (let i = 0; i < 6; i++) {
                const a = Math.PI / 3 * i + Math.PI / 6;
                const px = hx + Math.cos(a) * s * .5, py = hy + Math.sin(a) * s * .5;
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
              }
              ctx.closePath(); ctx.stroke();
            }
          } break;
        }
        case "clouds":
          if (!parts.length) initParts("clouds");
          for (const p of parts) {
            p.x += (p.vx || 8) / 60;
            if (p.x > cvs.width + 80) { p.x = -80; p.y = Math.random() * cvs.height * .5; }
            ctx.fillStyle = "rgba(220,232,250,.10)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 22, 0, Math.PI * 2); ctx.arc(p.x + 20, p.y + 4, 16, 0, Math.PI * 2); ctx.arc(p.x - 20, p.y + 5, 14, 0, Math.PI * 2);
            ctx.fill();
          } break;
      }
      cvs.__anim = requestAnimationFrame(frame);
    }
    if (bg !== "none") frame(); else ctx.clearRect(0, 0, cvs.width, cvs.height);
    cvs.__stop = () => cancelAnimationFrame(cvs.__anim);
  }
  window.PDX_MUSIC_STOP = function () {
    try {
      if (window.__musicTimer) { clearInterval(window.__musicTimer); window.__musicTimer = null; }
      if (window.__musicMaster) { try { window.__musicMaster.gain.value = 0; } catch (e) { } }
      if (window.__musicNodes) { window.__musicNodes.forEach(n => { try { n.stop && n.stop(); } catch (e) { } }); window.__musicNodes = null; }
    } catch (e) { }
  };
  window.PDX_MUSIC_START = function () {
    const p = window.PDX_PROFILE || {};
    if ((p.music || "none") !== "none") applyMusic();
  };

  function applyMusic() {
    const p = window.PDX_PROFILE;
    const kind = p.music || "none";
    window.PDX_MUSIC = kind;
    // Web Audio loop generator (no external files needed)
    try {
      if (window.__musicTimer) { clearInterval(window.__musicTimer); window.__musicTimer = null; }
      if (window.__musicNodes) { window.__musicNodes.forEach(n => { try { n.stop && n.stop(); } catch (e) { } }); window.__musicNodes = null; }
      if (kind === "none") return;
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = window.__musicAC || (window.__musicAC = new AC());
      if (ctx.state === "suspended") ctx.resume().catch(() => { });
      const master = ctx.createGain(); master.gain.value = .05; master.connect(ctx.destination);
      window.__musicMaster = master;
      window.__musicNodes = [];
      const NOTES = { synthwave: [110, 164.8, 220, 277.2], chiptune: [261.6, 329.6, 392, 523.3], ambient: [82.4, 110, 123.5, 164.8], jazz: [130.8, 155.6, 196, 233.1],
        spooky: [98, 103.8, 116.5, 98], jingle: [392, 440, 493.9, 587.3], blossom: [261.6, 311.1, 349.2, 415.3], valentine: [207.7, 246.9, 277.2, 311.1],
        greenhill: [392, 440, 494, 587], badtime: [110, 116, 110, 98], epic: [130.8, 164.8, 196, 261.6],
        mario: [261.6, 329.6, 392, 523.3, 392, 329.6], zelda: [311.1, 415.3, 466.2, 415.3, 311.1], tetris: [329.6, 415.3, 493.9, 587.3, 493.9, 415.3, 329.6], pac: [440, 493.9, 523.3, 587.3, 523.3, 493.9], space: [58.3, 65.4, 82.4, 73.4], piano: [220, 261.6, 329.6, 293.7, 261.6],
        techno: [130.8, 130.8, 155.6, 174.6, 155.6, 130.8], blues: [146.8, 174.6, 196, 174.6, 146.8], orchestral: [174.6, 220, 261.6, 329.6, 261.6, 220], acoustic: [196, 246.9, 293.7, 246.9, 196], vapor: [103.8, 123.5, 138.6, 155.6, 138.6, 123.5] }[kind] || [110];
      const TYPE = { synthwave: "sawtooth", chiptune: "square", ambient: "sawtooth", jazz: "sine", spooky: "triangle", jingle: "square", blossom: "sine", valentine: "sine",
        greenhill: "square", badtime: "sawtooth", epic: "triangle", mario: "square", zelda: "triangle", tetris: "square", pac: "square", space: "sine", piano: "sine",
        techno: "sawtooth", blues: "triangle", orchestral: "triangle", acoustic: "sine", vapor: "sawtooth" }[kind] || "square";
      const SPEED = { synthwave: 300, chiptune: 220, ambient: 900, jazz: 400, spooky: 550, jingle: 200, blossom: 380, valentine: 500,
        greenhill: 170, badtime: 140, epic: 260, mario: 200, zelda: 320, tetris: 240, pac: 160, space: 800, piano: 350,
        techno: 180, blues: 350, orchestral: 250, acoustic: 380, vapor: 450 }[kind] || 300;
      let step = 0;
      window.__musicTimer = setInterval(() => {
        try {
          const f = NOTES[step % NOTES.length]; step++;
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.connect(g); g.connect(master);
          o.type = TYPE;
          o.frequency.value = f;
          const dur = kind === "ambient" ? 2 : .28;
          g.gain.setValueAtTime(.4, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + dur);
          o.start(); o.stop(ctx.currentTime + dur);
          window.__musicNodes.push(o);
        } catch (e) { }
      }, SPEED);
    } catch (e) { }
  }
  function applySfx() {
    const p = window.PDX_PROFILE;
    window.PDX_SFX_PACK = p.sfx || "classic";
  }
  // hook FX.tone to respect the sfx pack flavor
  (function () {
    if (window.__sfxHooked) return; window.__sfxHooked = true;
    addEventListener("load", () => {
      if (!window.PDX_FX || !PDX_FX.tone) return;
      const _tone = window.PDX_FX.tone;
      window.PDX_FX.tone = function (freq, dur, type, vol, slide) {
        const pack = window.PDX_SFX_PACK || "classic";
        let f = freq, t = type;
        if (pack === "arcade") { f = freq * 1.3; t = "triangle"; }
        else if (pack === "retro8") { f = Math.max(60, freq * .6); t = "square"; }
        else if (pack === "soft") { f = freq; t = "sine"; }
        else if (pack === "arcade2") { f = freq * 1.6; t = "sawtooth"; }
        return _tone.call(this, f, dur, t, vol, slide);
      };
    });
  })();

  /* ---------------- item viewer (live preview) ---------------- */
  function previewItem(tab, item, sec) {
    let modal = document.getElementById("shopPreview");
    if (modal) modal.remove();
    modal = document.createElement("div");
    modal.id = "shopPreview";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(4,6,16,.88);z-index:12000;display:flex;align-items:center;justify-content:center;padding:20px;";
    const p = window.PDX_PROFILE;
    const owned = isOwned(tab, item), equipped = isEquipped(tab, item);
    const sample = buildSample(tab, item);
    modal.innerHTML = `
      <div style="background:#0d1326;border:3px solid #64eaff;max-width:720px;width:100%;padding:22px;font-family:'Courier New',monospace;color:#e0e8ff;position:relative;">
        <button data-x style="position:absolute;top:8px;right:8px;background:transparent;border:2px solid #64eaff;color:#64eaff;cursor:pointer;padding:4px 10px;font-family:monospace;z-index:2;">✕</button>
        <h2 style="color:#64eaff;margin:0 0 4px;font-size:22px;">${item.name || item.id}</h2>
        <p style="color:#9fc0ff;font-size:13px;margin:0 0 14px;">${item.desc || ""}</p>
        <div data-stage style="border:2px solid #2a3260;border-radius:8px;overflow:hidden;min-height:220px;display:flex;align-items:center;justify-content:center;background:#05060f;position:relative;">${sample}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;">
          <span style="color:#ffe66d;font-weight:bold;font-size:17px;">${owned ? (equipped ? "EQUIPPED" : "OWNED") : "🪙 " + item.price}</span>
          <div>
            ${owned && equippable(tab) ? `<button data-eq style="background:#2a5a3a;border:2px solid #63f59a;color:#63f59a;padding:8px 18px;cursor:pointer;font-family:monospace;font-weight:bold;margin-right:8px;">${equipped ? "UNEQUIP" : "EQUIP"}</button>` : ""}
            ${owned ? "" : `<button data-buy style="background:#ffe66d;border:2px solid #ffe66d;color:#080b18;padding:8px 18px;cursor:pointer;font-family:monospace;font-weight:bold;">BUY</button>`}
            <button data-x2 style="background:#1a2050;border:2px solid #64eaff;color:#64eaff;padding:8px 18px;cursor:pointer;font-family:monospace;">CLOSE</button>
          </div>
        </div>
      </div>`;
    modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
    modal.querySelectorAll("[data-x],[data-x2]").forEach(b => b.addEventListener("click", () => modal.remove()));
    const eq = modal.querySelector("[data-eq]");
    if (eq) eq.addEventListener("click", () => { equip(tab, item); modal.remove(); megaRenderShop(sec); });
    const buy = modal.querySelector("[data-buy]");
    if (buy) buy.addEventListener("click", () => {
      if (purchase(tab, item)) { if (equippable(tab)) equip(tab, item); modal.remove(); megaRenderShop(sec); }
    });
    document.body.appendChild(modal);
    // live preview hooks: temporarily apply then restore on close
    const applied = previewApply(tab, item);
    const unapply = () => { try { applied && applied(); } catch (e) { } };
    modal.addEventListener("remove", unapply);
    const obs = new MutationObserver(() => { if (!document.getElementById("shopPreview")) { unapply(); obs.disconnect(); } });
    obs.observe(document.body, { childList: true });
  }
  function buildSample(tab, item) {
    switch (tab) {
      case "themes": {
        const T = { neon: ["#05060f", "#64eaff", "#ff72c8"], dawn: ["#1a1530", "#ffb07a", "#ff72c8"], day: ["#0e1a3a", "#7ad8ff", "#ffb0e0"], dusk: ["#2a1530", "#ff7a9a", "#b07aff"], night: ["#02030a", "#64eaff", "#ff72c8"], auto: ["#0d1430", "#64eaff", "#ff72c8"], ember: ["#1a0e08", "#ff8c42", "#ffd24a"], forest: ["#0c1a10", "#63f59a", "#a0ffa0"], candy: ["#1a0c14", "#ff8ac8", "#ffe66d"], ice: ["#0a1420", "#bfe8ff", "#8fd0f0"], sunset: ["#241028", "#ff6a8a", "#ffd24a"], void: ["#000000", "#8a2aff", "#c08aff"] }[item.id] || ["#0d1430", "#64eaff", "#ff72c8"];
        return `<div style="width:100%;height:220px;background:${T[0]};display:flex;align-items:center;justify-content:center;gap:26px;">
          <div style="width:70px;height:70px;border-radius:50%;background:${T[1]};box-shadow:0 0 26px ${T[1]}"></div>
          <div style="width:44px;height:44px;background:${T[2]};transform:rotate(45deg)"></div>
          <span style="color:${T[1]};font-weight:bold;letter-spacing:2px;">Aa</span></div>`;
      }
      case "fonts": {
        const f = FONTS[item.id] || FONTS.mono;
        return `<div style="width:100%;height:220px;background:#0a0e22;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;">
          <span style="font-family:${f.css};${f.weight ? "font-weight:" + f.weight + ";" : ""}${f.ls ? "letter-spacing:" + f.ls + ";" : ""}font-size:34px;color:#64eaff;text-shadow:0 0 14px #64eaff66;">PIXEL DUEL</span>
          <span style="font-family:${f.css};${f.weight ? "font-weight:" + f.weight + ";" : ""}font-size:15px;color:#e0e8ff;">The quick brown fox jumps over the lazy dog</span>
          <span style="font-family:${f.css};font-size:13px;color:#9fc0ff;">0123456789 · PLAYER 1 WINS!</span></div>`;
      }
      case "backgrounds": {
        return `<canvas data-bgprev width="660" height="220" style="width:100%;height:220px;display:block;"></canvas>`;
      }
      case "favicons": {
        const ic = window.PDX_FAVICON_ICONS && window.PDX_FAVICON_ICONS[item.id];
        let url = "";
        if (ic) { try { const c = document.createElement("canvas"); c.width = 64; c.height = 64; ic.draw(c.getContext("2d")); url = c.toDataURL(); } catch (e) { } }
        return `<div style="width:100%;height:220px;background:#0a0e22;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;">
          ${url ? `<img src="${url}" style="width:64px;height:64px;image-rendering:pixelated;border:2px solid #2a3260;" alt="">` : ""}
          <span style="color:#9fc0ff;font-size:12px;">Browser tab icon${item.id === "school" || item.id === "glitch" ? " (auto-switches by mode)" : ""}</span>
        </div>`;
      }
      case "cinema": {
        const icon = { vid_ocean: "🌊", vid_volcano: "🌋", vid_rome: "🛡️", vid_space: "🌙", vid_dino: "🦖", vid_coding: "💻" }[item.id] || "🎬";
        return `<div style="width:100%;height:220px;background:linear-gradient(135deg,#0a1a24,#0a0f24);display:flex;align-items:center;justify-content:center;font-size:64px;position:relative;">
          <span>${icon}</span><span style="position:absolute;font-size:56px;color:#ffffffcc;">▶</span></div>`;
      }
      case "music": case "sfx": {
        const bars = Array.from({ length: 22 }, (_, i) => `<div data-bar style="width:9px;background:${tab === "music" ? "#64eaff" : "#63f59a"};border-radius:2px;height:${10 + (i * 7) % 40}px;"></div>`).join("");
        return `<div style="width:100%;height:220px;background:#0a0e22;display:flex;align-items:center;justify-content:center;gap:5px;flex-wrap:wrap;padding:20px;">${bars}</div>`;
      }
      case "avatars": {
        const ic = AVATAR_PREVIEWS[item.id];
        let url = "";
        if (ic) { try { const c = document.createElement("canvas"); c.width = 120; c.height = 160; ic(c.getContext("2d")); url = c.toDataURL(); } catch (e) { } }
        return `<div style="width:100%;height:220px;background:#0a0e22;display:flex;align-items:center;justify-content:center;gap:18px;">
          ${url ? `<img src="${url}" style="height:180px;image-rendering:pixelated;border:2px solid #2a3260;background:#141a3a;" alt="">` : ""}
          <div style="color:#9fc0ff;font-size:11px;line-height:1.7;max-width:170px;">${AVATAR_INFO[item.id] || ""}</div>
        </div>`;
      }
      case "games": {
        const icon = { game_gold: "💎", game_sky: "🕊️", game_sea: "🐟" }[item.id] || "🎮";
        return `<div style="width:100%;height:220px;background:#0a0e22;display:flex;align-items:center;justify-content:center;font-size:72px;">${icon}</div>`;
      }
      case "school": {
        const icon = { school_smart: "💡", school_timer: "⏱️", school_cert: "🏅" }[item.id] || "🏫";
        return `<div style="width:100%;height:220px;background:#f7f9fc;display:flex;align-items:center;justify-content:center;font-size:72px;">${icon}</div>`;
      }
      case "perks": {
        const icon = { perk_lucky: "🍀", perk_streak: "🛡️", perk_ai_hard: "🤖", perk_party_plus: "🎉", perk_rematch: "🔁", perk_gold_cursor: "✨" }[item.id] || "⚡";
        return `<div style="width:100%;height:220px;background:#0a0e22;display:flex;align-items:center;justify-content:center;font-size:72px;">${icon}</div>`;
      }
    }
    return "";
  }
  function previewApply(tab, item) {
    if (tab === "backgrounds") {
      const cvs = document.querySelector("#shopPreview canvas[data-bgprev]");
      if (!cvs) return null;
      const x = cvs.getContext("2d");
      const old = window.PDX_PROFILE.background;
      window.PDX_PROFILE.background = item.id;
      const parts = [];
      let t = 0, raf;
      const n = item.id === "matrix" ? 60 : item.id === "stars" ? 70 : 44;
      for (let i = 0; i < n; i++) parts.push({ x: Math.random() * 660, y: Math.random() * 220, vy: 20 + Math.random() * 40, r: 1 + Math.random() * 2, ph: Math.random() * 6 });
      function frame() {
        t += 1 / 90;
        x.clearRect(0, 0, 660, 220);
        const col = "rgba(120,180,255,";
        switch (item.id) {
          case "stars": for (const p of parts) { p.ph += .05; x.fillStyle = col + (.3 + Math.abs(Math.sin(p.ph)) * .6) + ")"; x.fillRect(p.x, p.y, p.r, p.r); } break;
          case "dots": x.fillStyle = col + "0.16)"; for (let px = 0; px < 660; px += 22) for (let py = 0; py < 220; py += 22) x.fillRect(px, py, 2, 2); break;
          case "lines": x.strokeStyle = col + "0.10)"; for (let px = -220; px < 660; px += 24) { x.beginPath(); x.moveTo(px, 0); x.lineTo(px + 220, 220); x.stroke(); } break;
          case "grid": x.strokeStyle = col + "0.13)"; for (let px = 0; px < 660; px += 36) { x.beginPath(); x.moveTo(px, 0); x.lineTo(px, 220); x.stroke(); } for (let py = 0; py < 220; py += 36) { x.beginPath(); x.moveTo(0, py); x.lineTo(660, py); x.stroke(); } break;
          case "rain": case "matrix": x.font = "11px monospace"; for (const p of parts) { x.fillStyle = col + ".55)"; x.fillRect(p.x, p.y % 220, 1.6, 13); p.y += p.vy; if (p.y > 230) { p.y = -14; p.x = Math.random() * 660; } } break;
          case "bubbles": for (const p of parts) { p.y -= p.vy * .3; p.ph += .03; if (p.y < -10) { p.y = 230; p.x = Math.random() * 660; } x.strokeStyle = col + ".4)"; x.beginPath(); x.arc(p.x + Math.sin(p.ph) * 6, p.y, p.r * 3, 0, Math.PI * 2); x.stroke(); } break;
          case "snow": for (const p of parts) { p.y += p.vy * .14; p.ph += .04; if (p.y > 226) { p.y = -6; p.x = Math.random() * 660; } x.fillStyle = "rgba(255,255,255,.6)"; x.beginPath(); x.arc(p.x + Math.sin(p.ph) * 9, p.y, p.r, 0, Math.PI * 2); x.fill(); } break;
          case "embers": for (const p of parts) { p.y -= p.vy * .45; p.ph += .05; if (p.y < -8) { p.y = 228; p.x = Math.random() * 660; } x.fillStyle = "rgba(255,150,60,.6)"; x.beginPath(); x.arc(p.x + Math.sin(p.ph) * 5, p.y, p.r, 0, Math.PI * 2); x.fill(); } break;
          case "checker": x.fillStyle = "rgba(255,255,255,.05)"; for (let px = 0; px < 660; px += 36) for (let py = 0; py < 220; py += 36) if (((px + py) / 36) % 2 === 0) x.fillRect(px, py, 36, 36); break;
          case "waves": x.strokeStyle = col + "0.2)"; x.lineWidth = 2; for (let k = 0; k < 3; k++) { x.beginPath(); for (let px = 0; px <= 660; px += 10) { const py = 60 + k * 50 + Math.sin(px / 60 + t * (1 + k * .3)) * 12; px === 0 ? x.moveTo(px, py) : x.lineTo(px, py); } x.stroke(); } break;
        }
        raf = requestAnimationFrame(frame);
      }
      frame();
      return () => { cancelAnimationFrame(raf); window.PDX_PROFILE.background = old; applyBackground(); };
    }
    if (tab === "music") {
      const old = window.PDX_PROFILE.music;
      window.PDX_PROFILE.music = item.id; applyMusic();
      return () => { window.PDX_PROFILE.music = old; applyMusic(); };
    }
    if (tab === "sfx") {
      const old = window.PDX_PROFILE.sfx;
      window.PDX_PROFILE.sfx = item.id; applySfx();
      // play an audible sample through the new pack
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        const ctx = window.__musicAC || (window.__musicAC = new AC());
        if (ctx.state === "suspended") ctx.resume();
        [660, 880, 1100].forEach((fr, i) => setTimeout(() => {
          if (window.PDX_FX && PDX_FX.tone) PDX_FX.tone(fr, .12, "square", .06);
        }, i * 160));
      } catch (e) { }
      return () => { window.PDX_PROFILE.sfx = old; applySfx(); };
    }
    return null;
  }

  /* ---------------- render ---------------- */
  const DATA = { themes: null, mood: null, fonts: FONTS, backgrounds: BACKGROUNDS, favicons: FAVICON_LIST, cinema: VIDEOS_SHOP, music: MUSIC, sfx: SFX_PACKS, games: GAMES_SHOP, school: SCHOOL_SHOP, perks: PERKS,
    get avatars() { return avatarsWithSecrets(); } };
  let shopTab = "themes";
  function listFor(tab) {
    let base;
    if (tab === "themes") {
      const si = window.PDX_SHOP_ITEMS;
      base = si ? si.themes.slice() : [];
    } else if (tab === "mood") {
      base = MOODS.slice();
    } else {
      const d = DATA[tab] || {};
      base = Object.entries(d).map(([id, v]) => Object.assign({ id }, v));
    }
    // merge seasonal limited items into their home tab � but ONLY the
    // ones for the current season (off-season items stay hidden so the
    // shop never shows confusing locked stuff)
    const season = currentSeason();
    LIMITED.filter(l => l.tab === tab && l.season === season).forEach(l => {
      base.push(Object.assign({}, l, { limited: true, season, avail: true }));
    });
    return base;
  }
  function megaRenderShop(sec) {
    sec.innerHTML = `
    <button class="back" onclick="showMenu()">MENU</button>
    <h1 class="shop-title">🛒 PIXEL SHOP</h1>
    <p class="shop-coins">🪙 <span id="shopCoinNum">${coins()}</span> COINS · PLAYED ${(window.PDX_PROFILE || {}).gamesPlayed || 0} GAMES</p>
    <div class="shop-tabs">
      ${TABS.map(([k, label]) => `<button class="shop-tab ${shopTab === k ? "active" : ""}" data-tab="${k}">${label}</button>`).join("")}
    </div>
    <div class="shop-grid" id="shopGrid"></div>
  `;
    sec.querySelectorAll(".shop-tab").forEach(b => {
      b.addEventListener("click", () => { shopTab = b.dataset.tab; megaRenderShop(sec); });
    });
    const grid = sec.querySelector("#shopGrid");
    const items = listFor(shopTab);
    items.forEach(item => {
      const owned = isOwned(shopTab, item), equipped = isEquipped(shopTab, item);
      const lim = item.limited;
      const limBadge = lim ? (item.avail
        ? `<div class="lim-badge" style="background:#ff8c42;color:#1a0e04;font-size:9px;font-weight:bold;padding:2px 6px;border-radius:4px;margin-bottom:5px;display:inline-block;letter-spacing:1px;">${(SEASON_NAMES[item.season] || "EVENT")} LIMITED — ONLY THROUGH ${SEASON_RANGE[item.season] || "EVENT END"}</div>`
        : `<div class="lim-badge" style="background:#3a3a4a;color:#8a8a96;font-size:9px;padding:2px 6px;border-radius:4px;margin-bottom:5px;display:inline-block;letter-spacing:1px;">${(SEASON_NAMES[item.season] || "EVENT")} LIMITED — RETURNS ${SEASON_RANGE[item.season] || "NEXT EVENT"}</div>`)
        : "";
      const card = document.createElement("div");
      card.className = "shop-item" + (owned ? " owned" : "") + (equipped ? " equipped" : "") + (lim && !item.avail ? " lim-locked" : "");
      card.style.cssText = lim && !item.avail ? "opacity:.55;" : "";
      card.innerHTML = `
      ${limBadge}
      <div class="name">${item.name || item.id}</div>
      <div class="desc">${item.desc || ""}</div>
      <div class="price">${owned ? (equipped ? "EQUIPPED" : (equippable(shopTab) ? "OWNED · CLICK TO EQUIP" : "OWNED")) : (lim && !item.avail ? "🔒 UNAVAILABLE" : "🪙 " + item.price)}</div>
      <button data-view style="margin-top:8px;width:100%;padding:5px;border:1px solid #64eaff;background:transparent;color:#64eaff;font-family:monospace;font-size:11px;cursor:pointer;">👁 PREVIEW</button>
    `;
      card.querySelector("[data-view]").addEventListener("click", e => {
        e.stopPropagation();
        previewItem(shopTab, item, sec);
      });
      card.addEventListener("click", () => {
        if (lim && !item.avail) { showToastSafe(item.name + " returns " + (SEASON_RANGE[item.season] || "next event")); return; }
        if (owned) {
          if (equippable(shopTab)) { equip(shopTab, item); showToastSafe("Equipped: " + (item.name || item.id)); }
          megaRenderShop(sec);
          return;
        }
        if (purchase(shopTab, item)) {
          if (equippable(shopTab)) equip(shopTab, item);
          const n = sec.querySelector("#shopCoinNum"); if (n) n.textContent = coins();
          megaRenderShop(sec);
        }
      });
      grid.appendChild(card);
    });
  }
  function equippable(tab) { return ["themes", "fonts", "backgrounds", "favicons", "music", "sfx", "avatars"].includes(tab); }

  /* ---------------- patch openShop ---------------- */
  function patch() {
    const orig = window.openShop;
    if (!orig || window.__shopPatched) return;
    window.__shopPatched = true;
    window.openShop = function () {
      const existing = document.getElementById("shopScreen");
      if (existing) { existing.classList.add("active"); activeScreen = "shopScreen"; megaRenderShop(existing); return; }
      const sec = document.createElement("section");
      sec.id = "shopScreen"; sec.className = "screen shop-screen";
      document.body.insertBefore(sec, document.querySelector(".touch-pad"));
      activeScreen = "shopScreen";
      document.querySelectorAll(".screen.active").forEach(s => { if (s !== sec) s.classList.remove("active"); });
      sec.classList.add("active");
      megaRenderShop(sec);
    };
  }
  function boot() {
    loadWebfonts();
    patch();
    applyFont(); applyBackground(); applyMusic(); applySfx();
  }
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);

  /* unlock purchased exclusive games: register if owned */
  addEventListener("load", () => {
    setTimeout(() => {
      const p = window.PDX_PROFILE;
      if (!p.ownedGames) return;
      for (const id of p.ownedGames) {
        if (id === "game_gold" && !document.getElementById("vaultGame")) registerVault();
        if (id === "game_sky" && !document.getElementById("skyforgeGame")) registerSkyforge();
        if (id === "game_sea" && !document.getElementById("trenchGame")) registerTrench();
      }
    }, 1500);
  });

  /* -------- exclusive purchased games -------- */
  function registerVault() {
    if (!window.PD) return;
    PD.micro({
      id: "vaultGame", title: "Vault Run", desc: "Shop-exclusive heist game", cat: "action", key: "vault", win: 3,
      controls: "P1: WASD · P2: ARROWS — grab gems, avoid lasers",
      round(g) {
        g.pl = [PD.blob ? null : null, { x: 200, y: 250, r: 14 }, { x: 700, y: 250, r: 14 }]; g.gems = []; g.time = 30;
        for (let i = 0; i < 6; i++)g.gems.push({ x: PD.rnd(100, 800), y: PD.rnd(80, 440) });
      },
      update(g, dt) {
        g.time -= dt;
        g.pl.forEach((p, i) => {
          if (!p) return; const I = g.I[i];
          p.x += ((I.r ? 1 : 0) - (I.l ? 1 : 0)) * 220 * dt; p.y += ((I.d ? 1 : 0) - (I.u ? 1 : 0)) * 220 * dt;
          p.x = Math.max(20, Math.min(880, p.x)); p.y = Math.max(60, Math.min(480, p.y));
        });
        for (const gem of g.gems) { g.pl.forEach((p, i) => { if (p && !gem.got && Math.hypot(p.x - gem.x, p.y - gem.y) < 24) { gem.got = true; g.add(i, "GEM!"); } }); }
        g.gems = g.gems.filter(x => !x.got);
        if (g.gems.length < 3) g.gems.push({ x: PD.rnd(100, 800), y: PD.rnd(80, 440) });
        if (g.time <= 0) g.byScore(g.score);
      },
      draw(g, ctx) {
        ctx.fillStyle = "#1a1428"; ctx.fillRect(0, 0, 900, 500);
        for (const gem of g.gems) { ctx.fillStyle = "#c08aff"; ctx.beginPath(); ctx.moveTo(gem.x, gem.y - 10); ctx.lineTo(gem.x + 9, gem.y); ctx.lineTo(gem.x, gem.y + 10); ctx.lineTo(gem.x - 9, gem.y); ctx.fill(); }
        g.pl.forEach((p, i) => { if (!i || !p) return; ctx.fillStyle = i ? "#ff72c8" : "#64eaff"; ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx.fill(); });
      }
    });
  }
  function registerSkyforge() {
    if (!window.PD) return;
    PD.micro({
      id: "skyforgeGame", title: "Sky Forge", desc: "Shop-exclusive flying game", cat: "reflex", key: "skyforge", win: 3,
      controls: "P1: W flap · P2: ↑ flap — dodge the pillars",
      round(g) { g.pl = [null, { x: 180, y: 250, r: 12, vy: 0 }, { x: 180, y: 250, r: 12, vy: 0 }]; g.pipes = []; },
      update(g, dt) {
        g.pl.forEach((p, i) => {
          if (!p || !i) return; const I = g.I[i];
          p.vy += 700 * dt; if (I.pu) p.vy = -320; p.y += p.vy * dt;
          if (p.y > 490 || p.y < 40) g.point(1 - i);
        });
        if (Math.random() < .02) g.pipes.push({ x: 920, y: PD.rnd(80, 320), h: PD.rnd(70, 150) });
        g.pipes.forEach(p => p.x -= 180 * dt);
        g.pipes = g.pipes.filter(p => p.x > -60);
        g.pl.forEach((p, i) => {
          if (!p || !i) return;
          for (const pi of g.pipes) {
            if (Math.abs(p.x - pi.x) < 26 && (p.y < pi.y || p.y > pi.y + pi.h + 80)) { g.point(1 - i); p.y = 250; p.vy = 0; }
          }
        });
      },
      draw(g, ctx) {
        ctx.fillStyle = "#2a5a8a"; ctx.fillRect(0, 0, 900, 500);
        for (const p of g.pipes) { ctx.fillStyle = "#3a8a5a"; ctx.fillRect(p.x - 20, 0, 40, p.y); ctx.fillRect(p.x - 20, p.y + p.h + 80, 40, 500 - p.y - p.h - 80); }
        g.pl.forEach((p, i) => { if (!p || !i) return; ctx.fillStyle = i ? "#ff72c8" : "#64eaff"; ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, Math.PI * 2); ctx.fill(); });
      }
    });
  }
  function registerTrench() {
    if (!window.PD) return;
    PD.micro({
      id: "trenchGame", title: "Trench Duel", desc: "Shop-exclusive ocean game", cat: "action", key: "trench", win: 3,
      controls: "P1: WASD · P2: ARROWS — torpedo the rival sub",
      round(g) { g.pl = [null, { x: 200, y: 250, r: 14, hp: 3 }, { x: 700, y: 250, r: 14, hp: 3 }]; g.torp = []; g.cd = [0, 0]; },
      update(g, dt) {
        g.cd[0] = Math.max(0, g.cd[0] - dt); g.cd[1] = Math.max(0, g.cd[1] - dt);
        g.pl.forEach((p, i) => {
          if (!p || !i) return; const I = g.I[i];
          p.x += ((I.r ? 1 : 0) - (I.l ? 1 : 0)) * 200 * dt; p.y += ((I.d ? 1 : 0) - (I.u ? 1 : 0)) * 200 * dt;
          p.x = Math.max(20, Math.min(880, p.x)); p.y = Math.max(60, Math.min(480, p.y));
          if (I.pa && g.cd[i] <= 0) {
            g.cd[i] = .8;
            const ang = i ? Math.PI : 0;
            g.torp.push({ x: p.x + Math.cos(ang) * 20, y: p.y, vx: Math.cos(ang) * 380, owner: i });
          }
        });
        for (const t of g.torp) {
          t.x += t.vx * dt;
          const foe = g.pl[1 - t.owner];
          if (foe && Math.hypot(t.x - foe.x, t.y - foe.y) < 22) {
            t.dead = true; foe.hp--;
            g.burst(foe.x, foe.y, "#ff5878", 14, 240);
            if (foe.hp <= 0) { g.end(t.owner); return; }
          }
          if (t.x < 0 || t.x > 900) t.dead = true;
        }
        g.torp = g.torp.filter(t => !t.dead);
      },
      draw(g, ctx) {
        ctx.fillStyle = "#0a2a4a"; ctx.fillRect(0, 0, 900, 500);
        for (const t of g.torp) { ctx.fillStyle = "#ffe66d"; ctx.fillRect(t.x - 8, t.y - 3, 16, 6); }
        g.pl.forEach((p, i) => {
          if (!p || !i) return; ctx.fillStyle = i ? "#ff72c8" : "#64eaff"; ctx.beginPath(); ctx.ellipse(p.x, p.y, 18, 10, 0, 0, Math.PI * 2); ctx.fill();
          for (let h = 0; h < p.hp; h++) { ctx.fillStyle = "#63f59a"; ctx.fillRect(p.x - 12 + h * 10, p.y - 22, 8, 5); }
        });
      }
    });
  }
})();
