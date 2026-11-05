/* =====================================================
   FAKE ERROR SCREEN — " crashed / no internet" disguise.
   Trigger: ` (Shift + backtick gives ~). Also F9, and the
   hidden ✕ badge via F8. Far from player keys (WASD,
   arrows, space, enter). Esc restores the game.
   Looks like a genuine OS crash screen — no instructions
   visible that reveal it's fake.
   ===================================================== */
(function () {
  "use strict";
  if (window.__FAKE_ERROR__) return; window.__FAKE_ERROR__ = true;

  const overlay = document.createElement("div");
  overlay.id = "fakeErrorScreen";
  overlay.style.cssText = "position:fixed;inset:0;z-index:200000;display:none;background:#0e0e10;color:#d8d8dc;font-family:'Segoe UI',system-ui,sans-serif;overflow:auto;";
  // neutralize any arcade CSS leaking in (glow, scanlines, fonts)
  const st=document.createElement("style");
  st.textContent="#fakeErrorScreen *{text-shadow:none !important;box-shadow:none !important;animation:none !important;letter-spacing:normal !important;}";
  document.head.appendChild(st);
  /* ---------- error type templates (all fictional & dead-ended) ---------- */
  const TYPES={
    net404:{big:"404",sub:"— page not found",head:"Hmm. This page didn't load. Maybe check your internet, or try again later.",
      codes:"ERR_CONNECTION_TIMED_OUT · dns_probe_finished_nx_domain · wsawan-3f7c.netcore.edge",
      diag:[["Trace ID","7f3c-91ab-44de-b02e-8f10c5a3d771"],["Node","edge-54.239.117.206 (us-east-2f)"],["TLS handshake","failed after 3 retries (ttl_expired)"],["Resolver","10.0.0.4 / 10.0.0.5 (both unreachable)"],["Session token","sk_live_9x27Fk2LvQ8mTzA4pR6n"],["Ref","kb/4429187-netio-rr7-cached-flush"]],
      log:[["FAIL","keepalive → ws://gateway.internal/v2 (code 1006)"],["FAIL","sync worker → shard 11 (queue overflow, 4,218 pending)"],["WARN","cert chain: intermediate missing (depth 2)"],["WARN","cache stampede on /api/v3/bootstrap (throttled)"],["INFO","fallback asset mirror unavailable — see kb/4429187"]],
      hosts:"cdn-pool-2.wsawan-3f7c.netcore.edge · mirror-1.cloudqueue.net · lb.us-east-2f.awsstatic.internal",
      foot:"If the problem continues, contact your network administrator and provide the Trace ID above.",
      ref:"NXDOMAIN_404_GATEWAY_TIMEOUT_MIXED",title:"404 — page not found"},
    gateway:{big:"502",sub:"— bad gateway",head:"The server received an invalid response from an upstream service. Our team has been notified.",
      codes:"HTTP 502 · upstream_connect_error · proxy-cluster-9.railzone.internal",
      diag:[["Trace ID","a91b-2c3d-44ef-05ab-6c7d8899e210"],["Proxy","proxy-cluster-9 (rack C, slot 12)"],["Upstream","app-worker-4 (drained, 0/8 healthy)"],["Retry budget","exhausted (5/5)"],["Correlation ID","cid-77b2f104-ae35-49d1"],["Ref","kb/3821045-upstream-502-runbook"]],
      log:[["FAIL","upstream app-worker-4 → 502 (0 bytes, 12.4s)"],["FAIL","health probe: /readyz → 500 (3 consecutive)"],["WARN","connection pool saturation: 96%"],["INFO","traffic shifted to standby region (partial)"],["INFO","incident INC-2091 auto-opened"]],
      hosts:"proxy-cluster-9.railzone.internal · app-worker-4.fleet-a · standby.usw2.shadowlane.net",
      foot:"Reference this Correlation ID if you contact support.",
      ref:"GATEWAY_502_UPSTREAM_UNAVAILABLE",title:"502 — bad gateway"},
    cert:{big:"⚠ SEC",sub:"— security warning",head:"There is a problem with this website's security certificate. Proceeding may be unsafe — the connection was closed.",
      codes:"ERR_CERT_AUTHORITY_INVALID · TLS 1.3 handshake rejected · leaf-expired-90d",
      diag:[["Certificate CN","*.wsawan-3f7c.netcore.edge"],["Issuer","R3 (Let's Encrypt legacy chain)"],["Expired","89 days ago"],["Chain depth","2 (intermediate missing)"],["Cipher","TLS_AES_256_GCM_SHA384 (negotiated, then aborted)"],["Ref","kb/5510932-cert-renewal-steps"]],
      log:[["FAIL","certificate_verify_failed (depth 2)"],["FAIL","OCSP responder unreachable"],["WARN","fallback mirror serves stale cert (same serial)"],["INFO","HSTS policy prevented bypass (max-age 31536000)"]],
      hosts:"wsawan-3f7c.netcore.edge · mirror-1.cloudqueue.net (stale cert)",
      foot:"Do not proceed unless you recognize this certificate. Contact your administrator.",
      ref:"CERT_403_AUTHORITY_INVALID",title:"Security warning"},
    crash:{big:":( ",sub:"— service stopped responding",head:"The application stopped responding and was closed. Diagnostic information is being collected.",
      codes:"APP_CRASH · heap_corruption · module: render_pipeline.dll",
      diag:[["Exception code","0xc0000374"],["Faulting module","render_pipeline.dll +0x2a41c"],["Thread","12 (gpu-submit)"],["Working set","1.42 GB at fault"],["Dump","written to C:\\diag\\dmp\\4f2a.dump"],["Ref","kb/6011277-render-crash-loop"]],
      log:[["FAIL","gpu submit → timeout (16.6ms budget exceeded)"],["FAIL","watchdog killed thread 12"],["WARN","3 frame drops in last second before fault"],["INFO","minidump uploaded (partial) — pending analysis"]],
      hosts:"render pipeline · gpu-submit queue · watchdog service",
      foot:"If this keeps happening, restart the device and check for updates.",
      ref:"APP_0xC0000374_HEAP_CORRUPT",title:"Application error"}
  };

  function render(typeKey){
    const T=TYPES[typeKey]||TYPES.net404;
    overlay.innerHTML=`
    <div style="max-width:680px;margin:10vh auto 0;padding:0 24px;">
      <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:6px;">
        <span style="font-size:56px;font-weight:700;color:#eaeaea;letter-spacing:2px;">${T.big}</span>
        <span style="font-size:15px;color:#8a8a90;">${T.sub}</span>
      </div>
      <h1 style="font-size:21px;font-weight:400;margin:0 0 16px;color:#eaeaea;">${T.head}</h1>
      <p style="font-size:13px;color:#a8a8b0;margin:0 0 24px;">${T.codes}</p>
      <div style="border:1px solid #3a3a40;padding:14px 16px;margin-bottom:18px;">
        <div style="font-size:12px;color:#8a8a90;margin-bottom:8px;">Diagnostic details (for IT support):</div>
        <div style="font-size:12px;color:#c8c8d0;line-height:1.8;">
          ${T.diag.map(([k,v])=>`${k}: <span style="color:#eaeaea">${v}</span>`).join("<br>")}
        </div>
      </div>
      <div style="border:1px solid #3a3a40;padding:12px 16px;margin-bottom:18px;">
        <div style="font-size:12px;color:#8a8a90;margin-bottom:6px;">Recent events:</div>
        <div style="font-size:11.5px;color:#a8a8b0;line-height:1.8;font-family:Consolas,monospace;">
          ${T.log.map(([lvl,msg])=>{const c=lvl==="FAIL"?"#d87878":lvl==="WARN"?"#d8a848":"#d8d8d8";return `<span style="color:${c}">[${lvl}]</span> ${msg}`;}).join("<br>")}
        </div>
      </div>
      <div style="font-size:12px;color:#6a6a72;line-height:1.8;">
        Tried: <span style="color:#8a8a90">${T.hosts}</span><br>
        ${T.foot}<br>
        Error ref: <span style="color:#8a8a90">${T.ref}</span>
      </div>
    </div>
    <div style="position:fixed;bottom:14px;right:18px;font-size:11px;color:#4a4a50;">v2.14.7-f3a9c2</div>`;
  }

  /* ---------- customization (profile.glitch) ---------- */
  function glitchCfg(){
    const p=window.PDX_PROFILE||{};
    p.glitch=p.glitch||{type:"net404",tint:"",glow:0};
    return p.glitch;
  }
  window.PDX_GLITCH_CFG=glitchCfg;
  function applyStyle(){
    const g=glitchCfg();
    overlay.style.background=g.bg||"#0e0e10";
    if(g.tint){
      overlay.style.color=g.tint;
      // apply tint to headings via inline override
      overlay.querySelectorAll("h1").forEach(h=>h.style.color=g.tint);
      overlay.querySelectorAll("span[style*='color:#eaeaea']").forEach(s=>s.style.color=g.tint);
    } else {
      overlay.style.color="#d8d8dc";
    }
    overlay.style.boxShadow=g.glow?`inset 0 0 ${120*g.glow}px ${g.tint||"#8899aa"}55`:"none";
    // scale text slightly for smaller/larger looks
    overlay.style.fontSize=(g.scale||1)+"em";
  }
  window.PDX_GLITCH_APPLY=function(){
    render(glitchCfg().type||"net404");
    applyStyle();
  };
  window.PDX_GLITCH_TYPES=TYPES;
  document.body.appendChild(overlay);

  let active = false;

  function show() {
    if (active) return; active = true;
    window.PDX_GLITCH_APPLY();
    overlay.style.display = "block";
    try { if (window.setPaused) window.setPaused(true); } catch (e) { }
    try { if (window.PDX_MUSIC_STOP) window.PDX_MUSIC_STOP(); } catch (e) { }
    document.title = (TYPES[glitchCfg().type]||TYPES.net404).title;
  }
  function hide() {
    if (!active) return; active = false;
    overlay.style.display = "none";
    try { if (window.setPaused) window.setPaused(false); } catch (e) { }
    try { if (window.PDX_MUSIC_START) window.PDX_MUSIC_START(); } catch (e) { }
    const nm=(window.PDX_SITE_NAME&&window.PDX_SITE_NAME())||"Pixel Duel";
    try { document.title = (window.PDX_titleFor && window.PDX_titleFor("Arcade")) || nm + " — Arcade"; } catch (e) { document.title = nm + " — Arcade"; }
  }
  window.PDX_FAKE_ERROR_TOGGLE = function () { active ? hide() : show(); };

  addEventListener("keydown", e => {
    // ` (backtick) or ~ (shift+backtick) toggles the glitch/error mode
    if (e.key === "`" || e.key === "~" || e.code === "Backquote") {
      // ignore while typing in an input
      const ae = document.activeElement;
      if (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) return;
      e.preventDefault(); e.stopPropagation();
      active ? hide() : show();
      return;
    }
    if (e.key === "F9" || e.code === "F9") { e.preventDefault(); e.stopPropagation(); active ? hide() : show(); return; }
    if (active && e.key === "Escape") { e.preventDefault(); e.stopPropagation(); hide(); return; }
    // eat everything while fake-error is up so it looks truly dead
    if (active) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  /* trigger hint badge: press F8 → a small ✕ appears bottom-left for 2.5s;
     clicking it toggles the error screen (extra disguised entry point) */
  const badge = document.createElement("button");
  badge.id = "feBadge";
  badge.textContent = "✕";
  badge.title = "";
  badge.style.cssText = "position:fixed;left:10px;bottom:10px;z-index:199999;width:26px;height:26px;border:none;background:transparent;color:transparent;font-size:12px;cursor:pointer;display:none;";
  document.body.appendChild(badge);
  badge.addEventListener("click", () => { show(); });
  addEventListener("keydown", e => {
    if (e.key === "F8" || e.code === "F8") {
      e.preventDefault();
      badge.style.display = "block"; badge.style.color = "#5a5a60";
      setTimeout(() => { badge.style.display = "none"; badge.style.color = "transparent"; }, 2500);
    }
  }, true);

  console.log("[FakeError] Ready — ` (tilde) toggles, Esc restores. F8 shows the hidden ✕ badge.");
})();
