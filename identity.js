/* =====================================================
   IDENTITY SETTINGS — believable School Mode configuration
   in the Pixel Duel settings panel:
     • Student name (shown in School Mode as the user)
     • School name
     • 8 named periods, each with subject + teacher name
     • Teacher names appear in assignments/headers
   Stored in profile.identity. The School Mode (school_mode.js)
   reads window.PDX_IDENTITY.
   ===================================================== */
(function () {
  "use strict";
  if (window.__PDX_IDENTITY__) return; window.__PDX_IDENTITY__ = true;

  const DEFAULT_SUBJECTS = ["Mathematics", "Science", "History", "English", "Physics", "Chemistry", "Geography", "Biology"];
  const DEFAULT_TEACHERS = ["Ms. Rivera", "Mr. Chen", "Mrs. Okafor", "Mr. Delgado", "Ms. Whitfield", "Dr. Patel", "Mrs. Lindqvist", "Coach Barnes"];

  function prof() { return window.PDX_PROFILE || {}; }
  function identity() {
    const p = prof();
    p.identity = p.identity || {};
    const d = p.identity;
    d.name = d.name || "Alex Morgan";
    d.school = d.school || "Westbrook High School";
    d.grade = d.grade || 8;
    d.periods = d.periods || [];
    // ensure 8 periods with sensible defaults (class names from catalog)
    const DEFAULT_CLASSES = ["Math 8", "English 8", "Physical Science 8", "Civics 8", "AVID Excel 8", "Spanish Immersion 8", "PE 8", "Art 8"];
    for (let i = 0; i < 8; i++) {
      if (!d.periods[i]) d.periods[i] = { name: (i + 1) + (i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th") + " Period", subject: DEFAULT_CLASSES[i % DEFAULT_CLASSES.length], teacher: DEFAULT_TEACHERS[i % DEFAULT_TEACHERS.length] };
    }
    return d;
  }
  function save() { window.PDX_SAVE && window.PDX_SAVE(); }
  window.PDX_IDENTITY = identity;   // school_mode.js calls this to get config

  /* ---------- settings panel section ---------- */
  function addSettingsSection() {
    const panel = document.querySelector("#settingsPanel .settings-box");
    if (!panel || document.getElementById("identitySection")) return;
    const d = identity();
    const sec = document.createElement("div");
    sec.id = "identitySection";
    sec.style.cssText = "margin-top:14px;padding-top:12px;border-top:1px solid var(--panel-border,#2a3260);width:100%;";
    sec.innerHTML = `
    <h3 style="color:var(--accent,#4ef0ff);margin:0 0 8px;font-size:14px;letter-spacing:1px;">🏫 SCHOOL IDENTITY</h3>
    <div style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--muted,#9fc0ff);">
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">NAME
        <input data-id-name type="text" value="${d.name}" style="background:#0a0f24;border:1px solid #2a3260;color:#e0e8ff;padding:4px 8px;width:170px;font-family:inherit;font-size:12px;"></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">SCHOOL
        <input data-id-school type="text" value="${d.school}" style="background:#0a0f24;border:1px solid #2a3260;color:#e0e8ff;padding:4px 8px;width:170px;font-family:inherit;font-size:12px;"></label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;">GRADE
        <select data-id-grade style="background:#0a0f24;border:1px solid #2a3260;color:#e0e8ff;padding:4px 8px;width:170px;font-family:inherit;font-size:12px;">
          ${[7,8,9,10,11,12].map(g=>`<option value="${g}" ${d.grade===g?"selected":""}>Grade ${g}</option>`).join("")}
        </select></label>
    </div>
    <div data-periods style="margin-top:8px;display:flex;flex-direction:column;gap:4px;max-height:230px;overflow-y:auto;"></div>
    <div style="margin-top:6px;font-size:11px;color:var(--muted,#9fc0ff);">8 periods — pick a class from the grade catalog (core, honors, AP, electives, AVID…) and name the teacher.</div>
  `;
    panel.appendChild(sec);
    const periodsEl = sec.querySelector("[data-periods]");
    function classesFor(grade) {
      const f = window.PDX_CLASSES_FOR_GRADE;
      return f ? f(grade) : [{ name: "Free period", type: "core" }];
    }
    function typeTag(t) {
      const map = { core: ["CORE", "#64eaff"], honors: ["HONORS", "#ffe66d"], ap: ["AP", "#ff72c8"], elective: ["ELECTIVE", "#63f59a"], support: ["SUPPORT", "#b07aff"] };
      const m = map[t] || map.core;
      return `<span style="font-size:8px;padding:1px 4px;border:1px solid ${m[1]};color:${m[1]};border-radius:3px;margin-left:4px;">${m[0]}</span>`;
    }
    function renderPeriods() {
      periodsEl.innerHTML = "";
      const opts = classesFor(d.grade);
      d.periods.forEach((per, i) => {
        const row = document.createElement("div");
        row.style.cssText = "display:flex;gap:4px;align-items:center;font-size:11px;flex-wrap:wrap;";
        const selOpts = opts.map(o => `<option value="${o.name}" ${per.subject === o.name ? "selected" : ""}>${o.name}</option>`).join("");
        const cur = opts.find(o => o.name === per.subject);
        row.innerHTML = `
        <span style="width:20px;color:var(--accent,#4ef0ff);">${i + 1}</span>
        <input data-p-name type="text" value="${per.name}" placeholder="Name" style="background:#0a0f24;border:1px solid #2a3260;color:#e0e8ff;padding:3px 5px;width:74px;font-size:10px;font-family:inherit;">
        <select data-p-sub style="background:#0a0f24;border:1px solid #2a3260;color:#e0e8ff;padding:3px 5px;width:150px;font-size:10px;font-family:inherit;">
          ${cur ? "" : `<option value="${per.subject}" selected>${per.subject} (custom)</option>`}
          ${selOpts}
        </select>
        ${cur ? typeTag(cur.type) : ""}
        <input data-p-tea type="text" value="${per.teacher}" placeholder="Teacher" style="background:#0a0f24;border:1px solid #2a3260;color:#e0e8ff;padding:3px 5px;width:88px;font-size:10px;font-family:inherit;">
      `;
        row.querySelector("[data-p-name]").addEventListener("input", e => { per.name = e.target.value || d.periods[i].name; save(); });
        row.querySelector("[data-p-sub]").addEventListener("change", e => { per.subject = e.target.value; save(); renderPeriods(); });
        row.querySelector("[data-p-tea]").addEventListener("input", e => { per.teacher = e.target.value; save(); });
        periodsEl.appendChild(row);
      });
    }
    renderPeriods();
    sec.querySelector("[data-id-name]").addEventListener("input", e => { d.name = e.target.value; save(); });
    sec.querySelector("[data-id-school]").addEventListener("input", e => { d.school = e.target.value; save(); });
    sec.querySelector("[data-id-grade]").addEventListener("change", e => { d.grade = +e.target.value; save(); renderPeriods(); });
  }

  /* ---------- hook into settings open ---------- */
  const origToggle = window.toggleSettings;
  window.toggleSettings = function () {
    if (origToggle) origToggle.apply(this, arguments);
    setTimeout(addSettingsSection, 50);
  };
  const panelObserver = new MutationObserver(() => {
    const panel = document.getElementById("settingsPanel");
    if (panel && panel.classList.contains("open")) setTimeout(addSettingsSection, 80);
  });
  function startObs() {
    const panel = document.getElementById("settingsPanel");
    if (panel) panelObserver.observe(panel, { attributes: true, attributeFilter: ["class"] });
  }
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", startObs);
  else startObs();
  setTimeout(startObs, 800);

  console.log("[Identity] Settings section ready — name, school, 8 periods with teachers.");
})();
