# Use a raw single-quoted here-string to avoid PowerShell escape hell entirely.
Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
$js = [System.IO.File]::ReadAllText("ai_universal.js")
# find the marker where the old broken tail starts, cut there, append clean tail
$marker = "/* ---------- main loop ---------- */"
$idx = $js.IndexOf($marker)
if ($idx -lt 0) { Write-Output "marker not found"; exit 1 }
$head = $js.Substring(0, $idx)
$tail = @'
/* ---------- main loop ---------- */
function loop() {
  requestAnimationFrame(loop);
  const now = performance.now();
  let dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  tick++;
  const scr = active();
  if (!AIOn()) { curAI = null; updatePill(); return; }
  if (scr === "menu") { curAI = null; updatePill(); return; }
  if (scr !== curGame) { curGame = scr; curAI = setup(scr); }
  const g = PD.game(scr);
  if (!g) { curAI = null; return; }
  if (curAI.mode === "micro" || g.mouse !== undefined) {
    microAI(g, scr, dt);
  } else if (curAI.mode === "board") {
    boardAI(g, scr, dt);
  } else {
    keyAI(scr, dt);
  }
  updatePill();
}
function updatePill() {
  const on = AIOn();
  const pill = document.getElementById("aiPill");
  if (!pill) return;
  pill.style.display = on ? "inline-block" : "none";
  if (on) {
    pill.textContent = "\uD83E\uDD16 AI " + ["EASY", "NORMAL", "HARD"][diff];
    pill.style.borderColor = diff === 2 ? "#ff5878" : diff === 0 ? "#63f59a" : "#64eaff";
  }
}

/* ---------- HUD pill + difficulty chip in settings ---------- */
function hud() {
  if (document.getElementById("aiPill")) return;
  const pill = document.createElement("div");
  pill.id = "aiPill";
  pill.style.cssText = "position:fixed;bottom:14px;right:14px;z-index:9999;padding:6px 14px;border:2px solid #64eaff;border-radius:12px;background:rgba(10,15,36,.9);color:#64eaff;font-family:monospace;font-size:12px;letter-spacing:1px;display:none";
  pill.textContent = "\uD83E\uDD16 AI NORMAL";
  document.body.appendChild(pill);
  const row = document.querySelector("#aiP2Btn") && document.querySelector("#aiP2Btn").closest(".settings-row");
  if (row && !document.getElementById("aiDiffRow")) {
    const d = document.createElement("div");
    d.className = "settings-row"; d.id = "aiDiffRow";
    d.innerHTML = '<label>AI SKILL</label><div class="vol-wrap">'
      + '<button onclick="PDX_AI_SET_DIFF(\'easy\')" class="chip" id="aiDiffEasy">EASY</button>'
      + '<button onclick="PDX_AI_SET_DIFF(\'normal\')" class="chip" id="aiDiffNormal">NORMAL</button>'
      + '<button onclick="PDX_AI_SET_DIFF(\'hard\')" class="chip" id="aiDiffHard">HARD</button>'
      + '</div>';
    row.after(d);
  }
  const map = { aiDiffEasy: 0, aiDiffNormal: 1, aiDiffHard: 2 };
  for (const [id, d] of Object.entries(map)) {
    const b = document.getElementById(id);
    if (b) b.style.borderColor = diff === d ? "#63f59a" : "#2a3260";
  }
}
setTimeout(hud, 800); addEventListener("load", () => setTimeout(hud, 500));

if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(loop);
})();
'@
[System.IO.File]::WriteAllText("ai_universal.js", $head + $tail)
node --check ai_universal.js
Write-Output "syntax: $LASTEXITCODE"
