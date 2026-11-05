/* =====================================================
   SCHOOL MODE V2 — improved LMS-style disguise
   + keyboard triggers far from player keys
===================================================== */
(function(){
"use strict";

if (window.__SCHOOL_MODE_V2__) return;
window.__SCHOOL_MODE_V2__ = true;

/* =========================
   STYLES
========================= */
function injectStyles() {
  if (document.getElementById("smV2Styles")) return;
  const s = document.createElement("style");
  s.id = "smV2Styles";
  s.textContent = `
  #schoolModeV2{
    position:fixed;inset:0;z-index:100000;background:#f7f9fc;color:#1a202c;
    font-family:-apple-system,"Segoe UI",Roboto,sans-serif;overflow:hidden;display:none;
    grid-template-columns:240px 1fr;grid-template-rows:56px 1fr;
    grid-template-areas:"header header" "sidebar main";
  }
  #schoolModeV2.active{display:grid;}

  .sm-header{grid-area:header;background:#1a3a5c;color:#fff;display:flex;align-items:center;padding:0 20px;gap:16px;border-bottom:3px solid #0d2947;}
  .sm-logo{font-size:17px;font-weight:600;letter-spacing:.3px;display:flex;align-items:center;gap:10px;}
  .sm-logo-icon{width:32px;height:32px;background:#fff;color:#1a3a5c;display:flex;align-items:center;justify-content:center;border-radius:4px;font-size:18px;}
  .sm-header-right{margin-left:auto;display:flex;align-items:center;gap:16px;font-size:13px;}
  .sm-bell{position:relative;cursor:pointer;font-size:16px;opacity:.85;}
  .sm-bell-badge{position:absolute;top:-4px;right:-6px;background:#dc2626;color:#fff;font-size:9px;font-weight:bold;border-radius:8px;padding:1px 5px;line-height:1.2;}
  .sm-user-chip{display:flex;align-items:center;gap:8px;font-size:13px;background:rgba(255,255,255,.12);padding:4px 10px 4px 4px;border-radius:20px;}
  .sm-avatar{width:26px;height:26px;background:#e2a84b;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;}

  .sm-sidebar{grid-area:sidebar;background:#eaeff5;border-right:1px solid #d1d9e2;overflow-y:auto;padding:12px 0;}
  .sm-nav-section{padding:8px 20px 6px;font-size:11px;font-weight:bold;color:#64748b;text-transform:uppercase;letter-spacing:1px;}
  .sm-nav-item{display:flex;align-items:center;gap:10px;padding:9px 20px;color:#1a202c;font-size:14px;cursor:pointer;border-left:3px solid transparent;transition:background .1s;}
  .sm-nav-item:hover{background:#dfe6ee;}
  .sm-nav-item.active{background:#d4e0ed;border-left-color:#1a3a5c;font-weight:bold;}
  .sm-nav-icon{width:18px;text-align:center;font-size:14px;}

  .sm-main{grid-area:main;overflow-y:auto;padding:20px 28px;background:#f7f9fc;}
  .sm-breadcrumb{color:#64748b;font-size:13px;margin-bottom:16px;}
  .sm-breadcrumb b{color:#1a202c;}
  .sm-page-title{color:#1a202c;font-size:21px;font-weight:600;margin:0 0 6px;padding-bottom:10px;border-bottom:1px solid #d1d9e2;}
  .sm-page-sub{color:#64748b;font-size:14px;margin-bottom:20px;}
  .sm-card{background:#fff;border:1px solid #d1d9e2;border-radius:6px;padding:16px 20px;margin-bottom:14px;box-shadow:0 1px 2px rgba(0,0,0,.04);}
  .sm-card h3{color:#2c5282;font-size:16px;margin:0 0 8px;}
  .sm-card p{color:#2d3748;font-size:14px;line-height:1.6;margin:0 0 8px;}
  .sm-card ul{color:#2d3748;font-size:14px;line-height:1.7;margin:8px 0;padding-left:20px;}
  .sm-card b{color:#1a3a5c;}
  .sm-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  .sm-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
  .sm-stat{background:#fff;border:1px solid #d1d9e2;border-radius:6px;padding:14px 18px;}
  .sm-stat-label{color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;}
  .sm-stat-value{color:#1a202c;font-size:22px;font-weight:700;}
  .sm-stat-sub{color:#16a34a;font-size:12px;margin-top:2px;}
  .sm-badge{display:inline-block;background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;}
  .sm-badge.green{background:#dcfce7;color:#166534;}
  .sm-badge.amber{background:#fef3c7;color:#92400e;}
  .sm-badge.red{background:#fee2e2;color:#991b1b;}

  .sm-problem{background:#f8fafc;border-left:3px solid #2c5282;padding:12px 16px;margin:10px 0;font-family:"Courier New",monospace;font-size:15px;color:#1a202c;border-radius:0 4px 4px 0;}
  .sm-problem input{border:1px solid #a0aec0;padding:6px 10px;font-size:14px;width:100px;margin-left:8px;border-radius:3px;font-family:"Courier New",monospace;}
  .sm-problem input:focus{outline:none;border-color:#2c5282;box-shadow:0 0 0 2px rgba(44,82,130,.2);}
  .sm-btn{background:#2c5282;color:#fff;border:none;padding:6px 14px;border-radius:4px;cursor:pointer;font-size:13px;margin-left:8px;font-weight:600;}
  .sm-btn:hover{background:#2a4365;}
  .sm-feedback{margin-left:8px;font-size:13px;font-weight:bold;}
  .sm-feedback.correct{color:#16a34a;}
  .sm-feedback.wrong{color:#dc2626;}

  .sm-table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #d1d9e2;border-radius:6px;overflow:hidden;}
  .sm-table th{background:#eaeff5;color:#1a3a5c;text-align:left;padding:10px 14px;font-size:13px;border-bottom:2px solid #d1d9e2;}
  .sm-table td{padding:10px 14px;font-size:14px;border-bottom:1px solid #eaeff5;color:#2d3748;}
  .sm-table tr:last-child td{border-bottom:none;}
  .sm-table tr:hover td{background:#f8fafc;}
  .sm-table .sm-grade{font-weight:700;}
  .sm-table .sm-grade.a{color:#16a34a;}
  .sm-table .sm-grade.b{color:#ca8a04;}
  .sm-table .sm-grade.c{color:#dc2626;}

  .sm-schedule-row{display:flex;padding:10px 16px;border-bottom:1px solid #eaeff5;align-items:center;gap:20px;}
  .sm-schedule-row:last-child{border-bottom:none;}
  .sm-schedule-time{font-family:"Courier New",monospace;font-size:13px;color:#64748b;width:130px;flex-shrink:0;}
  .sm-schedule-subject{font-size:15px;font-weight:600;color:#1a202c;flex:1;}

  .sm-message{padding:14px 18px;border-bottom:1px solid #eaeff5;}
  .sm-message:last-child{border-bottom:none;}
  .sm-message.unread{background:#f8fafc;}
  .sm-message-header{display:flex;justify-content:space-between;margin-bottom:4px;}
  .sm-message-from{font-weight:600;color:#1a3a5c;font-size:13px;}
  .sm-message-time{font-size:12px;color:#64748b;}
  .sm-message-subject{font-weight:600;color:#1a202c;font-size:14px;margin-bottom:4px;}
  .sm-message-body{color:#4a5568;font-size:13px;line-height:1.5;}

  .sm-activity{padding:12px 0;border-bottom:1px solid #eaeff5;font-size:13px;color:#4a5568;}
  .sm-activity:last-child{border-bottom:none;}
  .sm-activity-time{color:#64748b;font-size:12px;margin-top:2px;}

  .sm-footer{text-align:center;color:#94a3b8;font-size:11px;padding:20px 0 8px;margin-top:20px;border-top:1px solid #eaeff5;}
  .sm-example-link{font-size:12px;color:#2c5282;text-decoration:none;}
  .sm-example-link:hover{text-decoration:underline;}

  /* practice / test tabs */
  .sm-tabs{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;}
  .sm-tab{background:#fff;border:1px solid #d1d9e2;border-radius:6px;padding:8px 16px;font-size:13px;cursor:pointer;color:#2d3748;font-weight:600;}
  .sm-tab:hover{background:#eaeff5;}
  .sm-tab.active{background:#2c5282;color:#fff;border-color:#2c5282;}
  .sm-tab .sm-scorepill{margin-left:8px;font-size:11px;background:#dbeafe;color:#1e40af;padding:1px 7px;border-radius:10px;}
  .sm-tab.active .sm-scorepill{background:rgba(255,255,255,.25);color:#fff;}
  .sm-q{background:#fff;border:1px solid #d1d9e2;border-radius:6px;padding:16px 20px;margin-bottom:12px;}
  .sm-q-head{display:flex;justify-content:space-between;margin-bottom:10px;font-size:13px;color:#64748b;}
  .sm-q-text{font-size:15px;color:#1a202c;font-weight:600;margin-bottom:12px;line-height:1.5;}
  .sm-choices{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .sm-choice{background:#f8fafc;border:1px solid #d1d9e2;border-radius:4px;padding:9px 12px;font-size:14px;cursor:pointer;text-align:left;color:#2d3748;}
  .sm-choice:hover{background:#eaeff5;}
  .sm-choice.correct{background:#dcfce7;border-color:#16a34a;color:#166534;font-weight:600;}
  .sm-choice.wrong{background:#fee2e2;border-color:#dc2626;color:#991b1b;}
  .sm-choices.locked .sm-choice{cursor:default;pointer-events:none;}
  .sm-setdone{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;padding:12px 16px;border-radius:6px;font-size:14px;margin-bottom:14px;}
  .sm-progressbar{height:6px;background:#e2e8f0;border-radius:4px;overflow:hidden;}
  .sm-progressbar>div{height:100%;background:#2c5282;border-radius:4px;}
  .sm-setnote{font-size:12px;color:#64748b;margin:4px 0 14px;}

  /* RESET — undo all arcade styling inside StudyHub.
     Loaded last so it wins the cascade for every sm-* element. */
  #schoolModeV2 *:not(.sm-page-title)::before, #schoolModeV2 *:not(.sm-page-title)::after{content:none;animation:none;}
  #schoolModeV2 *:not(.sm-page-title){text-shadow:none !important;box-shadow:none !important;text-transform:none !important;letter-spacing:normal !important;
    font-family:-apple-system,"Segoe UI",Roboto,sans-serif !important;animation:none !important;}
  #schoolModeV2 h1:not(.sm-page-title), #schoolModeV2 h2:not(.sm-page-title), #schoolModeV2 h3, #schoolModeV2 p, #schoolModeV2 b, #schoolModeV2 span, #schoolModeV2 div, #schoolModeV2 li{
    color:inherit !important;font-weight:inherit;font-style:normal !important;
  }
  #schoolModeV2 h1:not(.sm-page-title), #schoolModeV2 h2:not(.sm-page-title){font-size:20px;font-weight:600;margin:0 0 6px;}
  #schoolModeV2 p{font-size:14px;line-height:1.6;}
  #schoolModeV2 h3{font-size:16px;font-weight:600;margin:0 0 8px;}
  #schoolModeV2 b{font-weight:700;}
  #schoolModeV2 button{all:unset;box-sizing:border-box;cursor:pointer;}
  #schoolModeV2 .sm-tab{display:inline-block;background:#fff;border:1px solid #d1d9e2;border-radius:6px;padding:8px 16px;font-size:13px;font-weight:600;color:#2d3748;}
  #schoolModeV2 .sm-tab:hover{background:#eaeff5;}
  #schoolModeV2 .sm-tab.active{background:#2c5282;color:#fff;border-color:#2c5282;}
  #schoolModeV2 .sm-btn{display:inline-block;background:#2c5282;color:#fff !important;border:none;padding:6px 14px;border-radius:4px;font-size:13px;font-weight:600;}
  #schoolModeV2 .sm-btn:hover{background:#2a4365;}
  #schoolModeV2 .sm-choice{display:block;width:100%;background:#f8fafc;border:1px solid #d1d9e2;border-radius:4px;padding:9px 12px;font-size:14px;color:#2d3748;text-align:left;}
  #schoolModeV2 .sm-choice:hover{background:#eaeff5;}
  #schoolModeV2 .sm-choice.correct{background:#dcfce7;border-color:#16a34a;color:#166534 !important;font-weight:600;}
  #schoolModeV2 .sm-choice.wrong{background:#fee2e2;border-color:#dc2626;color:#991b1b !important;font-weight:600;}

  @media (max-width:800px){
    #schoolModeV2{grid-template-columns:1fr;grid-template-areas:"header" "main";}
    .sm-sidebar{display:none;}
    .sm-grid,.sm-grid-3{grid-template-columns:1fr;}
  }
  `;
  document.head.appendChild(s);
}

/* =========================
   DATA
========================= */
const STUDY_TIPS = [
  "Take your time and read the explanation whenever you miss a problem — that's how SmartScore grows fastest.",
  "Try to reach a SmartScore of 80 in a skill to pass it. Challenge yourself to reach 100!",
  "Set a weekly goal with your teacher. Even 15 minutes of practice a day adds up.",
  "Stuck on a problem? Use the Learn with an Example link before you answer.",
  "Did you know? SkillZon is used in 95 of the top 100 school districts in the U.S."
];
const ANNOUNCEMENTS = [
  { icon:"🏠", text:"<b>New practice sets added</b> — Algebra Basics and Cell Biology now have three full practice rounds plus a unit test." },
  { icon:"🏠", text:"<b>Progress tracking</b> — your best score for each practice set is saved on this device automatically." },
  { icon:"🏠", text:"<b>Timed mode tip</b> — try Practice rounds untimed first, then re-attempt under a timer before the unit test." }
];
const ACTIVITY = [
  { text:"Completed <b>Practice 2 — Linear Equations</b>", time:"2 hours ago" },
  { text:"Scored <b>85%</b> on <b>Unit Test — Cell Biology</b>", time:"Yesterday" },
  { text:"Started <b>Practice 1 — Order of Operations</b>", time:"2 days ago" },
  { text:"Completed <b>Practice 3 — Newton's Laws</b>", time:"4 days ago" }
];
const SUBJECTS = ["Mathematics","Science","History","English","Physics","Chemistry","Geography","Biology","Geometry"];
/* extra subjects added by school_expand.js / identity.js — merged at runtime */
function allSubjects(){
  const extra=(window.PDX_SCHOOL_EXTRA_SUBJECTS)||[];
  return SUBJECTS.concat(extra.filter(s=>!SUBJECTS.includes(s)));
}
window.PDX_GET_SUBJECTS=allSubjects;

/* =========================
   HELPERS
========================= */
function getNow(){
  const d = new Date();
  return {
    d,
    time: d.toTimeString().slice(0,5),
    weekday: d.toLocaleDateString("en-US",{weekday:"long"}),
    dateStr: d.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})
  };
}
function todayKey(){ return getNow().d.toDateString(); }

/* =========================
   RENDER
========================= */
const overlay = document.createElement("div");
overlay.id = "schoolModeV2";
document.body.appendChild(overlay);

let schoolActiveV2 = false;
let savedStateV2 = null;
let currentTab = "dashboard";

function renderSchool(tab){
  currentTab = tab;
  const now = getNow();

  const navItems = [
    { section:"Learning" },
    { tab:"dashboard", icon:"🏠", label:"Dashboard" },
    { section:"Math" },
    { tab:"Mathematics", icon:"🏠", label:"Skills A1—A6" },
    { tab:"Geometry", icon:"🏠", label:"Geometry" },
    { section:"Science" },
    { tab:"Science", icon:"🏠", label:"Science skills" },
    { tab:"Biology", icon:"🏠", label:"Biology" },
    { tab:"Chemistry", icon:"🏠", label:"Chemistry" },
    { tab:"Physics", icon:"🏠", label:"Physics" },
    { section:"Language & More" },
    { tab:"English", icon:"🏠", label:"Language arts" },
    { tab:"Literature", icon:"🏠", label:"Literature" },
    { tab:"Spanish", icon:"🏠", label:"Spanish" },
    { tab:"History", icon:"🏠", label:"Social studies" },
    { tab:"Geography", icon:"🏠", label:"Geography" },
    { section:"Specials" },
    { tab:"Computer Science", icon:"🏠", label:"Computer science" },
    { tab:"Music", icon:"🏠", label:"Music" },
    { tab:"Health", icon:"🏠", label:"Health" },
    { tab:"Economics", icon:"🏠", label:"Economics" },
    { tab:"rewards", icon:"🏠", label:"Awards & Certificates" }
  ];
  let navHtml = "";
  for (const item of navItems) {
    if (item.section) navHtml += `<div class="sm-nav-section">${item.section}</div>`;
    else {
      const active = item.tab === tab ? " active" : "";
      const badge = item.badge ? ` <span class="sm-badge red">${item.badge}</span>` : "";
      navHtml += `<div class="sm-nav-item${active}" data-sm-tab="${item.tab}"><span class="sm-nav-icon">${item.icon}</span><span>${item.label}</span>${badge}</div>`;
    }
  }

  overlay.innerHTML = `
    <header class="sm-header">
      <div class="sm-logo"><div class="sm-logo-icon">SZ</div>SkillZon Learning</div>
      <div class="sm-header-right">
        <span>${now.weekday}, ${now.d.toLocaleDateString("en-US",{month:"long",day:"numeric"})}</span>
        <div class="sm-user-chip"><div class="sm-avatar">${getIdent().name.charAt(0).toUpperCase()}</div><span>${getIdent().name}</span></div>
      </div>
    </header>
    <nav class="sm-sidebar">${navHtml}</nav>
    <main class="sm-main" id="smContent"></main>
  `;

  overlay.querySelectorAll("[data-sm-tab]").forEach(el => {
    el.addEventListener("click", () => renderSchool(el.dataset.smTab));
  });

  const content = overlay.querySelector("#smContent");
  if (tab === "dashboard") renderDashboard(content, now);
  else if (SUBJECTS.includes(tab)) renderSubject(content, tab);
  else if (tab === "rewards") renderRewards(content, now);
  else renderDashboard(content, now);
}

function renderDashboard(c, now){
  const activityHtml = ACTIVITY.map(a => `<div class="sm-activity">${a.text}<div class="sm-activity-time">${a.time}</div></div>`).join("");
  const tip = STUDY_TIPS[now.d.getDate() % STUDY_TIPS.length];
  const done = getProgress();
  const totalSets = SUBJECTS.length * 4;
  // SkillZon-style skill suggestions with SmartScore circles
  const suggestions = [
    { s:"Mathematics", set:"Practice 2", code:"A.2", skill:"Linear equations" },
    { s:"Science", set:"Practice 1", code:"B.1", skill:"Cells and organelles" },
    { s:"English", set:"Practice 2", code:"C.4", skill:"Theme and central idea" },
    { s:"Geometry", set:"Practice 1", code:"D.1", skill:"Classify triangles" },
    { s:"History", set:"Practice 2", code:"E.3", skill:"Industrial Revolution" }
  ];
  const suggestionsHtml = suggestions.map(sg=>{
    const best = scoreFor(sg.s + " — " + sg.set);
    const ss = best === null ? 0 : best;
    const passed = ss >= 80;
    return `<div class="sm-card" style="display:flex;align-items:center;gap:14px;margin-bottom:10px;">
      <div style="width:46px;height:46px;border-radius:50%;background:conic-gradient(${passed?"#16a34a":"#2c5282"} ${ss*3.6}deg,#e2e8f0 0deg);display:flex;align-items:center;justify-content:center;">
        <div style="width:36px;height:36px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;color:#1a202c;">${ss}</div>
      </div>
      <div style="flex:1"><b style="color:#1a3a5c">${sg.code}</b> — ${sg.skill}
        <div style="color:#64748b;font-size:12px;">${sg.s} — ${sg.set} ${passed?'<span class="sm-badge green">PASSED ?</span>':''}</div></div>
      <button class="sm-btn" data-sm-goto="${sg.s}">${best===null?"START":"CONTINUE"} ?</button>
    </div>`;
  }).join("");
  c.innerHTML = `
    <div class="sm-breadcrumb">Home / <b>Dashboard</b></div>
    <h1 class="sm-page-title">Welcome back, ${getIdent().name.split(" ")[0]}!</h1>
    <p class="sm-page-sub">${now.dateStr} — Keep practicing to raise your SmartScores — your teacher can see your progress.</p>
    <div class="sm-card" style="background:#fffbea;border:1px solid #f0d878;display:flex;align-items:center;gap:14px;">
      <div style="font-size:30px">??</div>
      <div style="flex:1"><b style="font-size:15px">Assigned by ${mainTeacher()}</b><br>
      <span style="color:#4a5568;font-size:13px">Skill A.2 — Linear equations — due Friday — <span class="sm-badge amber">IN PROGRESS</span></span></div>
      <button class="sm-btn" data-sm-goto="Mathematics">PRACTICE NOW ?</button>
    </div>
    <div class="sm-grid-3" style="margin-top:14px">
      <div class="sm-stat"><div class="sm-stat-label">Skills Passed</div><div class="sm-stat-value">${done.filter(p=>p.score>=80).length} / ${totalSets}</div><div class="sm-stat-sub">SmartScore 80+ = passed</div></div>
      <div class="sm-stat"><div class="sm-stat-label">Time Practiced</div><div class="sm-stat-value">${Math.max(done.length*4,7)} min</div><div class="sm-stat-sub">this week — keep it up!</div></div>
      <div class="sm-stat"><div class="sm-stat-label">Best SmartScore</div><div class="sm-stat-value">${done.length ? Math.max(...done.map(p=>p.score)) : "—"}</div><div class="sm-stat-sub">aim for 100 ??</div></div>
    </div>
    <h2 class="sm-page-title" style="margin-top:24px;font-size:18px;">Suggestions for you</h2>
    ${suggestionsHtml}
    <div class="sm-grid" style="margin-top:20px;">
      <div>
        <h2 class="sm-page-title" style="font-size:18px;">Recently practiced</h2>
        <div class="sm-card">${activityHtml}</div>
      </div>
      <div>
        <h2 class="sm-page-title" style="font-size:18px;">Tip of the day</h2>
        <div class="sm-card"><p>${tip}</p></div>
      </div>
    </div>
    ${(()=>{const id=getIdent();if(!id.periods||!id.periods.length)return "";
      const tag={honors:"HONORS",ap:"AP",elective:"ELECTIVE",support:"SUPPORT"};
      const rows=id.periods.map((p,i)=>{const cat=window.PDX_GRADE_CATALOG&&window.PDX_GRADE_CATALOG[p.subject];const t=cat?tag[cat.type]:null;
        return `<div class="sm-schedule-row"><span class="sm-schedule-time">Period ${i+1}</span><span class="sm-schedule-subject">${p.subject}${t?` <span class=\"sm-badge ${cat.type==='ap'?'red':cat.type==='honors'?'amber':'green'}\">${t}</span>`:""}</span><span style="color:#64748b;font-size:12px;">${p.teacher}</span></div>`;}).join("");
      return `<h2 class="sm-page-title" style="margin-top:24px;font-size:18px;">Today's schedule — Grade ${id.grade||8}</h2><div class="sm-card" style="padding:0;">${rows}</div>`;})()}
    <div class="sm-footer">SkillZon Learning — personalized skills practice — licensed to ${getIdent().school}</div>
  `;
  c.querySelectorAll("[data-sm-goto]").forEach(b=>b.addEventListener("click",()=>renderSchool(b.dataset.smGoto)));
}
/* identity helpers (configured in Pixel Duel settings) */
function getIdent(){
  try{const f=window.PDX_IDENTITY;if(typeof f==="function")return f();}catch(e){}
  return {name:"Alex Morgan",school:"Lincoln Middle School",periods:[]};
}
function mainTeacher(){
  const id=getIdent();
  const math=id.periods.find(p=>/math/i.test(p.subject));
  return math?math.teacher:(id.periods[0]?id.periods[0].teacher:"Ms. Rivera");
}

/* =========================
REWARDS / STICKERS (SkillZon-style)
========================= */
function renderRewards(c, now){
  const done = getProgress();
  const bySubject = {};
  SUBJECTS.forEach(s=>{ bySubject[s]=done.filter(p=>p.id.startsWith(s+"-")); });
  const totalSets = SUBJECTS.length * 4;
  const stickers = [];
  if (done.length>=1) stickers.push({name:"First Steps",icon:"🏠",desc:"Completed your first practice set"});
  const master = SUBJECTS.filter(s=>bySubject[s].length>=4);
  if (master.length) stickers.push({name:"Subject Master",icon:"🏠",desc:"Finished all sets in "+master.join(", ")+"."});
  if (done.some(p=>p.score>=100)) stickers.push({name:"Perfect Score",icon:"🏠",desc:"Scored 100% on a set"});
  if (done.length===totalSets) stickers.push({name:"Completionist",icon:"🏠",desc:"Completed every practice set"});
  const cert = done.length===totalSets && done.every(p=>p.score>=90);
  let stickerHtml = stickers.map(s=>`<div class="sm-card" style="display:flex;align-items:center;gap:12px;"><div style="font-size:26px">${s.icon}</div><div><div style="font-weight:bold;color:#1a3a5c">${s.name}</div><div style="color:#64748b;font-size:13px">${s.desc}</div></div></div>`).join("");
  if(!stickerHtml) stickerHtml=`<div class="sm-card"><p>Complete practice sets to earn stickers and a certificate.</p></div>`;
  c.innerHTML = `
    <div class="sm-breadcrumb">Home / <b>Rewards</b></div>
    <h1 class="sm-page-title">Rewards &amp; Progress</h1>
    <p class="sm-page-sub">${now.dateStr}</p>
    <div class="sm-grid-3">
      <div class="sm-stat"><div class="sm-stat-label">Sets Completed</div><div class="sm-stat-value">${done.length} / ${totalSets}</div><div class="sm-stat-sub">${Math.round(done.length/totalSets*100)}% of all practice</div></div>
      <div class="sm-stat"><div class="sm-stat-label">Subjects Mastered</div><div class="sm-stat-value">${master.length}</div><div class="sm-stat-sub">all 4 sets finished</div></div>
      <div class="sm-stat"><div class="sm-stat-label">Best Score</div><div class="sm-stat-value">${done.length?Math.max(...done.map(p=>p.score))+"%":"—"}</div><div class="sm-stat-sub">highest set score</div></div>
    </div>
    <h2 class="sm-page-title" style="margin-top:24px;font-size:18px;">Stickers Earned</h2>
    <div class="sm-grid">${stickerHtml}</div>
    ${cert?`<div class="sm-card" style="margin-top:16px;border:2px solid #16a34a;background:#f0fdf4;"><h3 style="color:#166534;margin-top:0">Certificate of Completion</h3><p style="margin:0">Awarded to <b>${getIdent().name}</b> for completing all practice sets at 90% or higher.</p><div style="margin-top:10px;color:#16a34a;font-weight:bold">?? SkillZon Certified</div></div>`:``}
  `;
}

/* =========================
PROGRESS STORAGE
========================= */
const SM_KEY = "skillzon-progress-v1";
function getProgress(){
  try { return JSON.parse(localStorage.getItem(SM_KEY)) || []; } catch(e){ return []; }
}
function saveProgress(entry){
  const all = getProgress();
  const existing = all.find(p => p.id === entry.id);
  if (existing) {
    if (entry.score > existing.score) existing.score = entry.score;
    existing.at = Date.now();
  } else all.push({ id: entry.id, score: entry.score, at: Date.now() });
  try { localStorage.setItem(SM_KEY, JSON.stringify(all)); } catch(e){}
}
function scoreFor(setId){
  const p = getProgress().find(p => p.id === setId);
  return p ? p.score : null;
}

/* =========================
   QUESTION BANKS
   Each set: array of {q, choices[4], a (index of correct), why}
========================= */
const QUESTION_BANKS = {
  "Mathematics": {
    "Practice 1": [
      {q:"Evaluate: 3 + 4 — 2", choices:["11","14","10","24"], a:0, why:"Multiplication before addition: 4—2 = 8, then 3 + 8 = 11."},
      {q:"Evaluate: (12 - 4) — 2", choices:["2","4","8","6"], a:1, why:"Parentheses first: 12 - 4 = 8, then 8 — 2 = 4."},
      {q:"What is 7—?", choices:["14","49","42","77"], a:1, why:"7— means 7 — 7 = 49."},
      {q:"Simplify: 5x + 3x", choices:["15x","8x","8x—","2x"], a:1, why:"Like terms add their coefficients: 5 + 3 = 8, so 8x."},
      {q:"What is 20% of 60?", choices:["12","3","6","15"], a:0, why:"20% = 0.2, and 0.2 — 60 = 12."},
      {q:"Solve: x + 9 = 17", choices:["6","8","26","9"], a:1, why:"Subtract 9 from both sides: x = 17 - 9 = 8."}
    ],
    "Practice 2": [
      {q:"Solve: 2x = 16", choices:["x = 8","x = 14","x = 32","x = 4"], a:0, why:"Divide both sides by 2: x = 16 — 2 = 8."},
      {q:"Solve: x - 7 = 3", choices:["x = 10","x = 4","x = 21","x = -4"], a:0, why:"Add 7 to both sides: x = 3 + 7 = 10."},
      {q:"What is the slope of y = 3x + 2?", choices:["2","3","5","1/3"], a:1, why:"In y = mx + b form, m is the slope, so m = 3."},
      {q:"Evaluate: 2— — 2—", choices:["26","25","45","2?"], a:1, why:"Same base multiplying: add exponents, 3 + 2 = 5, so 25."},
      {q:"Simplify: (x—)(x4)", choices:["x——","x7","x—","x?—"], a:1, why:"Add the exponents: 3 + 4 = 7, so x7."},
      {q:"Which is a solution of 2x + 1 > 7?", choices:["x = 2","x = 3","x = 4","x = 1"], a:2, why:"2x > 6 means x > 3, so any number greater than 3 works — x = 4."}
    ],
    "Practice 3": [
      {q:"A car travels 180 miles in 3 hours. Average speed?", choices:["50 mph","60 mph","55 mph","90 mph"], a:1, why:"Speed = distance — time = 180 — 3 = 60 mph."},
      {q:"Solve: 3(x + 2) = 21", choices:["x = 5","x = 7","x = 9","x = 4"], a:0, why:"Divide by 3: x + 2 = 7, then subtract 2: x = 5."},
      {q:"What is 15% of 80?", choices:["10","14","12","16"], a:2, why:"0.15 — 80 = 12."},
      {q:"The ratio of cats to dogs is 3:5. If there are 15 dogs, how many cats?", choices:["9","12","5","8"], a:0, why:"15 — 5 = 3, and 3 — 3 = 9 cats."},
      {q:"Evaluate: -4 + 10", choices:["6","-6","14","-14"], a:0, why:"Adding a positive to a negative: 10 - 4 = 6."},
      {q:"Solve: x/4 = 9", choices:["x = 13","x = 36","x = 5","x = 2.25"], a:1, why:"Multiply both sides by 4: x = 9 — 4 = 36."}
    ],
    "Unit Test": [
      {q:"Evaluate: 5 + 2 — (9 - 3)—", choices:["77","17","29","42"], a:0, why:"Parentheses: 6. Exponent: 36. Multiply: 72. Add: 77."},
      {q:"Solve: 4x - 7 = 21", choices:["x = 7","x = 3.5","x = 9","x = 5"], a:0, why:"4x = 28, so x = 7."},
      {q:"A shirt costs $40 and is on sale for 25% off. Sale price?", choices:["$15","$30","$35","$25"], a:1, why:"25% of 40 is 10; 40 - 10 = 30."},
      {q:"Which equation means 'five less than twice a number is 11'?", choices:["2n - 5 = 11","5 - 2n = 11","2(n - 5) = 11","2n + 5 = 11"], a:0, why:"Twice a number: 2n. Five less than that: 2n - 5. Equals 11."},
      {q:"Simplify: 3(2x - 4) + 5x", choices:["11x - 12","6x - 12","11x - 4","8x - 12"], a:0, why:"Distribute: 6x - 12, then add 5x: 11x - 12."},
      {q:"A train travels 240 km in 4 h, then 100 km in 2 h. Average speed?", choices:["55 km/h","56.7 km/h","60 km/h","52.5 km/h"], a:1, why:"Total 340 km over 6 h — 56.7 km/h."}
    ]
  },
  "Science": {
    "Practice 1": [
      {q:"Which organelle is the powerhouse of the cell?", choices:["Nucleus","Ribosome","Mitochondria","Cell membrane"], a:2, why:"Mitochondria produce ATP, the cell's energy currency."},
      {q:"What gas do plants absorb for photosynthesis?", choices:["Oxygen","Nitrogen","Carbon dioxide","Hydrogen"], a:2, why:"Plants take in CO2 and release O2 during photosynthesis."},
      {q:"Water freezes at what temperature in Celsius?", choices:["0—C","32—C","100—C","-10—C"], a:0, why:"Water freezes at 0—C (32—F)."},
      {q:"Which state of matter has fixed volume but no fixed shape?", choices:["Solid","Liquid","Gas","Plasma"], a:1, why:"Liquids take their container's shape but keep volume."},
      {q:"What force pulls objects toward Earth's center?", choices:["Magnetism","Friction","Gravity","Tension"], a:2, why:"Gravity pulls objects toward Earth's center."},
      {q:"The basic unit of life is the—", choices:["atom","cell","tissue","organ"], a:1, why:"The cell is the smallest unit that carries out all life processes."}
    ],
    "Practice 2": [
      {q:"Photosynthesis occurs in which organelle?", choices:["Chloroplast","Nucleus","Vacuole","Golgi body"], a:0, why:"Chloroplasts contain chlorophyll and carry out photosynthesis."},
      {q:"Chemical formula for water?", choices:["H2O","CO2","O2","NaCl"], a:0, why:"Two hydrogen atoms bonded to one oxygen: H2O."},
      {q:"Speed of light is approximately—", choices:["300,000 km/s","150,000 km/s","3,000 km/s","30,000 km/s"], a:0, why:"Light travels at about 3 — 108 m/s, or 300,000 km/s."},
      {q:"Which blood cells fight infection?", choices:["Red blood cells","White blood cells","Platelets","Plasma"], a:1, why:"White blood cells are part of the immune response."},
      {q:"Sound cannot travel through—", choices:["Water","Steel","Air","Vacuum"], a:3, why:"Sound needs a medium; a vacuum has no particles."},
      {q:"Boiling point of water at sea level in Celsius?", choices:["90—C","100—C","110—C","80—C"], a:1, why:"At standard pressure, water boils at 100—C."}
    ],
    "Practice 3": [
      {q:"Newton's third law states that—", choices:["F = ma","Objects at rest stay at rest","Every action has an equal and opposite reaction","Energy is conserved"], a:2, why:"For every action force there is an equal and opposite reaction force."},
      {q:"Which is a renewable energy source?", choices:["Coal","Natural gas","Solar","Oil"], a:2, why:"Solar energy replenishes naturally, unlike fossil fuels."},
      {q:"DNA carries—", choices:["Energy for cells","Genetic information","Oxygen in blood","Digestive enzymes"], a:1, why:"DNA stores the genetic instructions for living organisms."},
      {q:"Most abundant gas in Earth's atmosphere?", choices:["Oxygen","Carbon dioxide","Nitrogen","Argon"], a:2, why:"Nitrogen makes up about 78% of the atmosphere."},
      {q:"Acceleration due to gravity on Earth is about—", choices:["9.8 m/s—","3.7 m/s—","1.6 m/s—","12 m/s—"], a:0, why:"Falling objects accelerate at roughly 9.8 m/s— near Earth's surface."},
      {q:"Atoms of the same element always have the same number of—", choices:["Neutrons","Protons","Electrons","Particles"], a:1, why:"The number of protons defines the element."}
    ],
    "Unit Test": [
      {q:"A ball is thrown upward. At its highest point its velocity is—", choices:["Maximum","Zero","Negative","Equal to g"], a:1, why:"At the peak of motion, vertical velocity momentarily equals zero."},
      {q:"Which sequence shows increasing complexity?", choices:["Cell ? tissue ? organ ? system","Organ ? cell ? tissue ? system","Tissue ? cell ? organ ? system","System ? organ ? tissue ? cell"], a:0, why:"Cells form tissues, tissues form organs, organs form systems."},
      {q:"Balance: 2H2 + O2 ? ?", choices:["2H2O","H2O","H2O2","2HO"], a:0, why:"4 H atoms and 2 O atoms make 2 water molecules: 2H2O."},
      {q:"Convection currents in Earth's mantle are caused by—", choices:["Magnetic fields","Heat from the core","Tidal forces","Wind"], a:1, why:"Heat from the core drives slow circulation in the mantle."},
      {q:"A car accelerates from 0 to 20 m/s in 5 s. Acceleration?", choices:["2 m/s—","4 m/s—","5 m/s—","100 m/s—"], a:1, why:"a = ?v/?t = 20 — 5 = 4 m/s—."},
      {q:"Which is NOT a change of state?", choices:["Melting","Condensation","Sublimation","Combustion"], a:3, why:"Combustion is a chemical reaction, not a change of state."}
    ]
  },
  "History": {
    "Practice 1": [
      {q:"The Industrial Revolution began in which country?", choices:["France","Great Britain","Germany","United States"], a:1, why:"The Industrial Revolution started in Great Britain around 1760."},
      {q:"Who improved the steam engine in 1769?", choices:["Isaac Newton","James Watt","Benjamin Franklin","Thomas Edison"], a:1, why:"James Watt's improvements made steam engines practical for factories."},
      {q:"Before factories, most goods were made by—", choices:["Machines","Hand in homes","Robots","Steam power"], a:1, why:"The cottage industry system meant goods were handmade at home."},
      {q:"Urbanization during the Industrial Revolution refers to—", choices:["People moving to farms","Cities growing rapidly","Building ships","Declining trade"], a:1, why:"Workers moved to cities for factory jobs, causing rapid urban growth."},
      {q:"The spinning jenny was used to make—", choices:["Steel","Cloth","Coal","Paper"], a:1, why:"It spun multiple threads at once, revolutionizing textile production."},
      {q:"Railways primarily helped by—", choices:["Reducing trade","Moving goods and people quickly","Increasing farming","Slowing communication"], a:1, why:"Railroads connected cities, making transport faster and cheaper."}
    ],
    "Practice 2": [
      {q:"A push factor for immigration is—", choices:["Good jobs","Famine","Nice climate","Free land"], a:1, why:"Push factors drive people away, like famine or war."},
      {q:"The Renaissance began in which country?", choices:["England","Italy","Spain","Greece"], a:1, why:"The Renaissance started in Italian city-states like Florence."},
      {q:"Which invention most helped spread ideas in the 1400s?", choices:["Printing press","Steam engine","Compass","Telephone"], a:0, why:"Gutenberg's printing press made books cheap and widely available."},
      {q:"A primary source is—", choices:["A textbook","A letter from the time","A movie adaptation","An encyclopedia"], a:1, why:"Primary sources are firsthand records created during the period."},
      {q:"Imperialism means—", choices:["Trading fairly","One nation controlling another","Making allies","Isolating a country"], a:1, why:"Imperialism is extending a country's power over other territories."},
      {q:"World War I began in which year?", choices:["1912","1914","1918","1905"], a:1, why:"WWI started in 1914 after the assassination of Archduke Franz Ferdinand."}
    ],
    "Practice 3": [
      {q:"The Great Depression began with—", choices:["The Dust Bowl","The 1929 stock market crash","World War II","The New Deal"], a:1, why:"The 1929 stock market collapse triggered the Depression."},
      {q:"Women gained the right to vote in the US in—", choices:["1865","1920","1945","1900"], a:1, why:"The 19th Amendment was ratified in 1920."},
      {q:"The Cold War was primarily between—", choices:["France and Germany","US and Soviet Union","China and Japan","Britain and Spain"], a:1, why:"It was an ideological conflict between the US and USSR."},
      {q:"Which document begins with 'We the People'?", choices:["Declaration of Independence","US Constitution","Bill of Rights","Magna Carta"], a:1, why:"The US Constitution opens with the Preamble: 'We the People—'."},
      {q:"A secondary source is—", choices:["A diary","A history textbook","An artifact","A photograph from the era"], a:1, why:"Secondary sources interpret and analyze primary sources."},
      {q:"Feudalism was based on—", choices:["Factories","Land and loyalty exchanges","Banking","Democracy"], a:1, why:"Lords granted land to vassals in exchange for loyalty and service."}
    ],
    "Unit Test": [
      {q:"Which factor most enabled Britain to industrialize first?", choices:["Large army","Coal and iron plus capital","Tropical climate","Small population"], a:1, why:"Natural resources, money, and stable government all supported industry."},
      {q:"Nationalism contributed to WWI by—", choices:["Encouraging cooperation","Creating rivalries between nations","Reducing armies","Ending alliances"], a:1, why:"Intense national pride fueled competition and conflict."},
      {q:"The Treaty of Versailles ended—", choices:["The Cold War","World War I","The Civil War","World War II"], a:1, why:"Signed in 1919, it formally ended WWI with Germany."},
      {q:"Child labor laws during the Industrial Revolution were passed because—", choices:["Children wanted jobs","Factory conditions were dangerous","Farms needed workers","Schools were full"], a:1, why:"Reformers documented injuries and long hours, leading to legal protections."},
      {q:"The Marshall Plan provided—", choices:["Weapons to Asia","Aid to rebuild Europe","Colonies to Britain","Trade bans"], a:1, why:"The US funded European recovery after WWII to prevent communism's spread."},
      {q:"Which best describes the Enlightenment?", choices:["Religious revival","An intellectual movement emphasizing reason","A war over trade","An artistic style only"], a:1, why:"Thinkers stressed reason, individual rights, and government by consent."}
    ]
  },
  "English": {
    "Practice 1": [
      {q:"Which is a complete sentence?", choices:["Running fast.","The dog barked.","In the morning.","Because it rained."], a:1, why:"A complete sentence needs a subject and a verb: 'The dog barked.'"},
      {q:"Identify the verb: 'She quickly wrote the letter.'", choices:["She","quickly","wrote","letter"], a:2, why:"'Wrote' is the action the subject performs."},
      {q:"Which word is a synonym for 'happy'?", choices:["Gloomy","Elated","Angry","Tired"], a:1, why:"Elated means extremely happy."},
      {q:"The plural of 'child' is—", choices:["childs","children","childes","childrens"], a:1, why:"'Child' has the irregular plural 'children'."},
      {q:"Which sentence uses the correct homophone?", choices:["Their going home.","They're going home.","There going home.","Theyre going home."], a:1, why:"'They're' is the contraction of 'they are'."},
      {q:"A metaphor compares two things—", choices:["Using 'like' or 'as'","Directly, without 'like' or 'as'","With numbers","In past tense"], a:1, why:"Metaphors state one thing IS another; similes use 'like' or 'as'."}
    ],
    "Practice 2": [
      {q:"Choose the correct form: 'The book ___ on the table.'", choices:["lay","lie","lays","lied"], a:0, why:"'Lay' needs an object; here 'the book' is placed. 'Lie' is for reclining."},
      {q:"Which is an adverb?", choices:["Beautiful","Quickly","Happiness","Run"], a:1, why:"Adverbs modify verbs, adjectives, or other adverbs — often ending in -ly."},
      {q:"The theme of a story is—", choices:["The setting","Its central message or lesson","The main character","The plot twist"], a:1, why:"Theme is the underlying message the author conveys."},
      {q:"Which sentence has parallel structure?", choices:["She likes running, to swim, and biking.","She likes running, swimming, and biking.","She likes to run, swim, and she bikes.","She likes run, swimming, and bike."], a:1, why:"All items share the same grammatical form (-ing words)."},
      {q:"First person narration uses—", choices:["He, she, they","I, we","You","It"], a:1, why:"First person narrators refer to themselves as 'I' or 'we'."},
      {q:"'Her smile was sunshine' is an example of—", choices:["Simile","Metaphor","Hyperbole","Personification"], a:1, why:"A metaphor directly calls one thing another without 'like' or 'as'."}
    ],
    "Practice 3": [
      {q:"Which sentence is punctuated correctly?", choices:["Its cold today.","It's cold today.","Its' cold today.","It is'nt cold today."], a:1, why:"'It's' is the contraction of 'it is'."},
      {q:"An inference is—", choices:["A direct quote","A conclusion based on evidence","The title of the story","A random guess"], a:1, why:"Inferences combine text clues with what you already know."},
      {q:"Which is a supporting detail?", choices:["The topic sentence","A fact that explains the main idea","The conclusion","The title"], a:1, why:"Supporting details provide evidence for the main idea."},
      {q:"Foreshadowing is when an author—", choices:["Reveals the ending","Hints at future events","Describes the setting","Introduces characters"], a:1, why:"Foreshadowing plants clues about what will happen later."},
      {q:"Which transition shows contrast?", choices:["Furthermore","However","Similarly","Additionally"], a:1, why:"'However' signals an opposing idea; the others show addition."},
      {q:"A persuasive essay should—", choices:["List random facts","Present a claim supported by reasons and evidence","Tell a story only","Avoid taking a position"], a:1, why:"Persuasive writing argues a position with supporting evidence."}
    ],
    "Unit Test": [
      {q:"Identify: 'Although it was raining' is what kind of clause?", choices:["Independent clause","Dependent (subordinate) clause","Fragment","Run-on"], a:1, why:"It begins with a subordinating conjunction and cannot stand alone."},
      {q:"The point of view that knows all characters' thoughts is—", choices:["First person","Third person omniscient","Second person","Third person limited"], a:1, why:"Omniscient narrators see inside every character's mind."},
      {q:"'The wind whispered through the trees' uses—", choices:["Metaphor","Personification","Onomatopoeia","Simile"], a:1, why:"Personification gives human qualities to non-human things."},
      {q:"Which is the best thesis statement?", choices:["This essay is about dogs.","Dogs make better companions than cats because they are loyal, trainable, and social.","I will discuss dogs.","Dogs exist."], a:1, why:"A strong thesis takes a position and previews the supporting reasons."},
      {q:"Which word is spelled correctly?", choices:["recieve","receive","receeve","reicieve"], a:1, why:"'i before e except after c' — receive."},
      {q:"The climax of a plot is—", choices:["The beginning","The turning point of highest tension","The resolution","The exposition"], a:1, why:"The climax is where the conflict peaks before falling action."}
    ]
  },
  "Physics": {
    "Practice 1": [
      {q:"Newton's first law states that an object in motion—", choices:["Stays in motion unless acted on by a force","Speeds up automatically","Stops immediately","Gains mass"], a:0, why:"Inertia: objects keep their state of motion without an external force."},
      {q:"The unit of force is the—", choices:["Joule","Newton","Watt","Pascal"], a:1, why:"Force is measured in Newtons (N = kg—m/s—)."},
      {q:"Speed is calculated as—", choices:["Distance — time","Time — distance","Force — distance","Mass — velocity"], a:0, why:"Speed = distance divided by time."},
      {q:"Which is a vector quantity?", choices:["Speed","Distance","Velocity","Temperature"], a:2, why:"Velocity has both magnitude and direction."},
      {q:"Doubling the mass while keeping force constant will—", choices:["Double acceleration","Halve acceleration","Not change acceleration","Triple acceleration"], a:1, why:"a = F/m, so more mass means less acceleration."},
      {q:"Energy of motion is called—", choices:["Potential energy","Kinetic energy","Thermal energy","Chemical energy"], a:1, why:"Kinetic energy depends on mass and speed."}
    ],
    "Practice 2": [
      {q:"The unit of power is the—", choices:["Joule","Newton","Watt","Pascal"], a:2, why:"Power is measured in watts (1 W = 1 J/s)."},
      {q:"What does a free-body diagram show?", choices:["Only gravity","All forces acting on an object","Object's speed","The path of motion"], a:1, why:"It depicts every force vector acting on a single object."},
      {q:"Momentum equals—", choices:["mass — velocity","force — time","mass — acceleration","velocity — time"], a:0, why:"p = mv."},
      {q:"Friction always acts—", choices:["In the direction of motion","Opposite to motion","Perpendicular to motion","Randomly"], a:1, why:"Friction resists relative motion between surfaces."},
      {q:"An object in free fall accelerates at about—", choices:["5 m/s—","9.8 m/s—","15 m/s—","0 m/s—"], a:1, why:"Gravity accelerates falling objects at ~9.8 m/s— near Earth."},
      {q:"Work is done when—", choices:["A force causes displacement","You hold a heavy box still","An object is stationary","Time passes"], a:0, why:"W = F — d — force must actually move the object."}
    ],
    "Practice 3": [
      {q:"Conservation of energy means—", choices:["Energy can be created","Energy changes form but total stays constant","Energy disappears","Only kinetic energy matters"], a:1, why:"Energy transforms (e.g., potential ? kinetic) but is never lost."},
      {q:"Wave speed equals—", choices:["frequency — wavelength","amplitude — period","mass — velocity","wavelength — amplitude"], a:0, why:"v = f?."},
      {q:"Doubling the speed of a car multiplies its kinetic energy by—", choices:["2","3","4","8"], a:2, why:"KE = —mv—, so speed— quadruples the energy."},
      {q:"Sound travels fastest through—", choices:["Air","Water","Steel","Vacuum"], a:2, why:"Solids transmit sound fastest because particles are closest together."},
      {q:"An electric current is the flow of—", choices:["Protons","Electrons","Neutrons","Photons"], a:1, why:"Current is the flow of electric charge, usually electrons."},
      {q:"Ohm's law states—", choices:["V = IR","P = VI","F = ma","E = mc—"], a:0, why:"Voltage = current — resistance."}
    ],
    "Unit Test": [
      {q:"A 2 kg object accelerates at 3 m/s—. The net force is—", choices:["1.5 N","5 N","6 N","0.67 N"], a:2, why:"F = ma = 2 — 3 = 6 N."},
      {q:"A position vs. time graph showing constant velocity looks like—", choices:["A curved line","A straight sloped line","A flat horizontal line","A zigzag"], a:1, why:"Constant velocity means equal displacement in equal time — a straight slope."},
      {q:"A ball thrown up decelerates because—", choices:["It loses mass","Gravity acts downward","Air pushes it","No force acts"], a:1, why:"Gravity opposes upward motion, slowing it until velocity reaches zero."},
      {q:"Two objects collide and stick together. This is—", choices:["Elastic collision","Inelastic collision","Explosion","Static friction"], a:1, why:"Kinetic energy is not conserved when objects merge — inelastic."},
      {q:"A satellite stays in orbit because—", choices:["No gravity acts","Its tangential velocity balances gravity","It's weightless","Earth repels it"], a:1, why:"Gravity curves its path while forward motion keeps it falling around Earth."},
      {q:"Which law explains rocket propulsion?", choices:["Newton's first law","Newton's third law","Law of gravitation","Ohm's law"], a:1, why:"Expelling gas backward pushes the rocket forward — equal and opposite reaction."}
    ]
  },
  "Chemistry": {
    "Practice 1": [
      {q:"An atom's atomic number equals its number of—", choices:["Neutrons","Protons","Electrons only","Particles"], a:1, why:"The number of protons defines the element."},
      {q:"A compound is—", choices:["One element only","Two or more elements chemically combined","A mixture of metals","A pure gas"], a:1, why:"Compounds bond different elements in fixed ratios."},
      {q:"Which is a chemical change?", choices:["Melting ice","Tearing paper","Burning wood","Dissolving sugar"], a:2, why:"Burning creates new substances — a chemical change."},
      {q:"The periodic table is organized by—", choices:["Alphabetical order","Increasing atomic number","Color","Date discovered"], a:1, why:"Elements are arranged by increasing number of protons."},
      {q:"Electrons have what charge?", choices:["Positive","Negative","Neutral","Variable"], a:1, why:"Electrons carry a negative charge."},
      {q:"A pH of 7 means a solution is—", choices:["Acidic","Basic","Neutral","Toxic"], a:2, why:"pH 7 is neutral — neither acidic nor basic."}
    ],
    "Practice 2": [
      {q:"The mass number equals—", choices:["Protons only","Protons + neutrons","Electrons + protons","Neutrons only"], a:1, why:"Mass number counts protons and neutrons in the nucleus."},
      {q:"Ionic bonds form when atoms—", choices:["Share electrons","Transfer electrons","Collide","Heat up"], a:1, why:"Metals donate electrons to nonmetals, creating charged ions that attract."},
      {q:"A catalyst—", choices:["Gets consumed","Speeds a reaction without being consumed","Slows reactions","Adds energy only"], a:1, why:"Catalysts lower activation energy and remain unchanged."},
      {q:"Avogadro's number is about—", choices:["6.02 — 10——","3.14 — 108","9.8 — 10—","1.6 — 10?—?"], a:0, why:"One mole contains 6.02 — 10—— particles."},
      {q:"Which gas is most abundant in air?", choices:["Oxygen","Nitrogen","Carbon dioxide","Argon"], a:1, why:"Nitrogen makes up about 78% of the atmosphere."},
      {q:"The group 1 elements are called—", choices:["Halogens","Noble gases","Alkali metals","Transition metals"], a:2, why:"Lithium, sodium, potassium and friends are highly reactive alkali metals."}
    ],
    "Practice 3": [
      {q:"An endothermic reaction—", choices:["Releases heat","Absorbs heat","Produces light","Creates gas"], a:1, why:"Endothermic reactions take in heat from surroundings."},
      {q:"In H2O, the ratio of hydrogen to oxygen atoms is—", choices:["1:2","2:1","1:1","2:2"], a:1, why:"Two hydrogen atoms per one oxygen atom."},
      {q:"A solution with pH 3 is—", choices:["Strongly basic","Weakly acidic","Neutral","Weakly basic"], a:1, why:"Below 7 is acidic; 3 is fairly acidic."},
      {q:"Isotopes differ in their number of—", choices:["Protons","Electrons","Neutrons","Charge"], a:2, why:"Same element, same protons, different neutrons."},
      {q:"Balancing equations is required because of—", choices:["Conservation of mass","Conservation of energy","Ideal gas law","Boyle's law"], a:0, why:"Atoms are neither created nor destroyed — mass must balance."},
      {q:"Metals are good conductors because—", choices:["They are shiny","Electrons move freely","They are heavy","They are magnetic"], a:1, why:"Delocalized electrons carry charge and heat efficiently."}
    ],
    "Unit Test": [
      {q:"Balance: __ H2 + O2 ? 2H2O. What coefficient goes in the blank?", choices:["1","2","3","4"], a:1, why:"2H2 + O2 ? 2H2O balances H and O atoms."},
      {q:"Which is a noble gas?", choices:["Sodium","Chlorine","Neon","Iron"], a:2, why:"Group 18 elements are unreactive noble gases."},
      {q:"A covalent bond involves—", choices:["Transferring electrons","Sharing electrons","Losing protons","Gaining neutrons"], a:1, why:"Nonmetals share electron pairs in covalent bonds."},
      {q:"The reactivity of Group 1 metals increases—", choices:["Up the group","Down the group","Across periods","It stays constant"], a:1, why:"Outer electrons are farther from the nucleus, easier to lose."},
      {q:"Molarity is measured in—", choices:["Grams per liter","Moles per liter","Liters per mole","Pascals"], a:1, why:"M = mol/L."},
      {q:"Which is a physical property?", choices:["Flammability","Density","Reactivity with acid","Ability to rust"], a:1, why:"Density can be measured without changing the substance."}
    ]
  },
  "Geography": {
    "Practice 1": [
      {q:"The imaginary line at 0— latitude is called—", choices:["Prime Meridian","Equator","Tropic of Cancer","International Date Line"], a:1, why:"The Equator divides Earth into Northern and Southern Hemispheres."},
      {q:"Which is the largest ocean?", choices:["Atlantic","Indian","Pacific","Arctic"], a:2, why:"The Pacific covers more area than all land combined."},
      {q:"A compass rose shows—", choices:["Mountains","Directions","Rivers","Population"], a:1, why:"It indicates north, south, east, and west on maps."},
      {q:"Weathering is the breakdown of—", choices:["Buildings","Rocks at or near Earth's surface","Ocean currents","Stars"], a:1, why:"Wind, water, and ice wear down rock over time."},
      {q:"The Sahara is located in—", choices:["Asia","Africa","South America","Australia"], a:1, why:"The Sahara is the world's largest hot desert, in North Africa."},
      {q:"Latitude lines measure distance—", choices:["From the Equator, north or south","East to west","Between cities","Underground"], a:0, why:"Latitude runs 0— to 90— N or S from the Equator."}
    ],
    "Practice 2": [
      {q:"Mount Everest is in which mountain range?", choices:["Andes","Himalayas","Rockies","Alps"], a:1, why:"The Himalayas contain the world's tallest peaks."},
      {q:"A delta forms where—", choices:["A river meets the sea","Mountains rise","Deserts expand","Glaciers melt"], a:0, why:"Sediment deposits fan out where rivers enter oceans."},
      {q:"Which continent has the most countries?", choices:["Asia","Africa","Europe","South America"], a:1, why:"Africa contains 54 countries."},
      {q:"Longitude lines run—", choices:["Parallel to the Equator","From pole to pole","Around the poles","Diagonally"], a:1, why:"Meridians connect the poles and measure east-west position."},
      {q:"Climate differs from weather because climate is—", choices:["Daily conditions","Long-term patterns","Only temperature","Random"], a:1, why:"Climate describes averages over decades; weather changes daily."},
      {q:"The Ring of Fire is known for—", choices:["Blizzards","Volcanoes and earthquakes","Deserts","Coral reefs"], a:1, why:"Tectonic plate boundaries around the Pacific cause frequent activity."}
    ],
    "Practice 3": [
      {q:"Plate tectonics explains—", choices:["Why oceans are salty","Movement of Earth's plates causing earthquakes","Season changes","Moon phases"], a:1, why:"Shifting plates create earthquakes, mountains, and volcanoes."},
      {q:"Erosion differs from weathering because erosion—", choices:["Breaks rock down","Transports the broken material","Only happens underwater","Requires heat"], a:1, why:"Weathering breaks rock; erosion moves the pieces elsewhere."},
      {q:"A rain shadow forms—", choices:["On the windward side","On the leeward side of mountains","Only at the equator","In valleys"], a:1, why:"Mountains block moisture, creating dry zones behind them."},
      {q:"Groundwater is stored in—", choices:["Clouds","Aquifers","Oceans only","Glaciers only"], a:1, why:"Aquifers are underground layers that hold water."},
      {q:"Which factor most affects climate?", choices:["Distance from equator","Soil color","Mountain names","City size"], a:0, why:"Latitude determines sun exposure, driving climate zones."},
      {q:"Cartography is the study of—", choices:["Stars","Mapmaking","Earthquakes","Weather"], a:1, why:"Cartographers design and produce maps."}
    ],
    "Unit Test": [
      {q:"Convection currents in the mantle drive—", choices:["Ocean tides","Plate movement","Wind patterns","Rainfall"], a:1, why:"Heat from the core circulates mantle material, moving plates."},
      {q:"A topographic map shows—", choices:["Political borders","Elevation using contour lines","Weather patterns","Population density"], a:1, why:"Contour lines connect points of equal elevation."},
      {q:"Which human activity most contributes to desertification?", choices:["Fishing","Overgrazing land","Building libraries","Space exploration"], a:1, why:"Overgrazing strips vegetation, letting deserts expand."},
      {q:"Time zones exist because Earth—", choices:["Is round and rotates","Has mountains","Has seasons","Orbits the Sun"], a:0, why:"Rotation means different longitudes face the Sun at different times."},
      {q:"The water cycle's driver is—", choices:["Wind only","Solar energy","Moon gravity","Volcanoes"], a:1, why:"The Sun powers evaporation that moves water through the cycle."},
      {q:"An archipelago is—", choices:["A desert","A chain of islands","A river mouth","A mountain range"], a:1, why:"Examples include Japan, Indonesia, and the Philippines."}
    ]
  },
  "Biology": {
    "Practice 1": [
      {q:"Which organelle controls the cell's activities?", choices:["Nucleus","Mitochondria","Ribosome","Vacuole"], a:0, why:"The nucleus contains DNA and directs cell functions."},
      {q:"Photosynthesis produces which sugar?", choices:["Glucose","Sucrose only","Starch only","Cellulose"], a:0, why:"Glucose (C6H12O6) is the primary product of photosynthesis."},
      {q:"Which is a heterotroph?", choices:["Oak tree","Rose bush","Rabbit","Algae"], a:2, why:"Rabbits eat other organisms; plants make their own food."},
      {q:"Red blood cells primarily transport—", choices:["Oxygen","Nutrients","Hormones","Antibodies"], a:0, why:"Hemoglobin in red blood cells carries oxygen."},
      {q:"The cell membrane is—", choices:["Rigid and thick","Selectively permeable","Fully sealed","Only in plant cells"], a:1, why:"It controls what enters and exits the cell."},
      {q:"An organism's genotype is its—", choices:["Physical appearance","Genetic makeup","Environment","Height"], a:1, why:"Genotype refers to the actual genes; phenotype is appearance."}
    ],
    "Practice 2": [
      {q:"Mitosis produces—", choices:["Four haploid cells","Two identical diploid cells","Gametes only","Bacteria"], a:1, why:"Mitosis creates two genetically identical body cells."},
      {q:"DNA's shape is described as—", choices:["A single strand","A double helix","A flat sheet","A cube"], a:1, why:"Watson and Crick showed DNA twists into a double helix."},
      {q:"Which base pairs with adenine in DNA?", choices:["Guanine","Thymine","Cytosine","Uracil"], a:1, why:"A-T and G-C are DNA's base pairs."},
      {q:"A food chain begins with—", choices:["Consumers","Decomposers","Producers","Predators"], a:2, why:"Producers (plants/algae) capture solar energy first."},
      {q:"Enzymes are—", choices:["Proteins that speed reactions","Fats for energy","Sugars","DNA segments"], a:0, why:"Enzymes act as biological catalysts."},
      {q:"Homeostasis means—", choices:["Rapid growth","Maintaining stable internal conditions","Reproducing","Moving"], a:1, why:"Organisms regulate temperature, pH, and water balance."}
    ],
    "Practice 3": [
      {q:"Meiosis produces—", choices:["Two identical cells","Four haploid gametes","Body cells","Identical twins"], a:1, why:"Meiosis halves the chromosome number for sexual reproduction."},
      {q:"Natural selection favors traits that—", choices:["Are random","Increase survival and reproduction","Are always visible","Disappear over time"], a:1, why:"Beneficial traits become more common across generations."},
      {q:"A habitat is—", choices:["A type of food","Where an organism lives","A disease","A population count"], a:1, why:"Habitat describes the natural home/environment of a species."},
      {q:"Which is an abiotic factor?", choices:["Bacteria","Rainfall","Trees","Fungi"], a:1, why:"Abiotic factors are nonliving — like water, sunlight, and soil."},
      {q:"Antibiotics target—", choices:["Viruses","Bacteria","Fungi","Protists"], a:1, why:"Antibiotics disrupt bacterial processes; they don't work on viruses."},
      {q:"Osmosis is the diffusion of—", choices:["Salt","Water across a membrane","Oxygen in blood","Sugar"], a:1, why:"Water moves from low to high solute concentration."}
    ],
    "Unit Test": [
      {q:"Order the levels of biological organization from smallest to largest.", choices:["Cell, tissue, organ, organism","Organism, organ, tissue, cell","Tissue, cell, organism, organ","Organ, cell, tissue, organism"], a:0, why:"Cells build tissues, tissues build organs, organs build organisms."},
      {q:"DNA replication occurs during—", choices:["Prophase","S phase of interphase","Telophase","Cytokinesis"], a:1, why:"DNA is copied during the synthesis phase before mitosis."},
      {q:"A Keystone species is one that—", choices:["Is most numerous","Has a disproportionate effect on its ecosystem","Is extinct","Lives in water only"], a:1, why:"Removing a keystone species dramatically changes the ecosystem."},
      {q:"Sickle cell anemia is caused by—", choices:["A virus","A gene mutation affecting hemoglobin","Poor diet","Bacterial infection"], a:1, why:"A single DNA base change alters the hemoglobin protein's shape."},
      {q:"Which shows a mutualistic relationship?", choices:["Tick on a dog","Bee pollinating a flower","Lion hunting zebra","Mold on bread"], a:1, why:"Both the bee and the flower benefit from pollination."},
      {q:"Cellular respiration's main purpose is to—", choices:["Make glucose","Release energy from food as ATP","Produce oxygen","Store water"], a:1, why:"Mitochondria convert glucose + O2 into ATP energy."}
    ]
  },
  "Geometry": {
    "Practice 1": [
      {q:"A triangle with all sides equal is called—", choices:["Scalene","Isosceles","Equilateral","Right"], a:2, why:"Equilateral triangles have three equal sides and 60— angles."},
      {q:"The angles in a triangle sum to—", choices:["90—","180—","270—","360—"], a:1, why:"Every triangle's interior angles total 180—."},
      {q:"A square's area with side 5 is—", choices:["10","20","25","50"], a:2, why:"Area = side— = 5— = 25."},
      {q:"Complementary angles sum to—", choices:["45—","90—","180—","360—"], a:1, why:"Complementary angles form a right angle together."},
      {q:"A circle's circumference formula is—", choices:["pr—","2pr","pd—","r—"], a:1, why:"Circumference = 2pr (or pd)."},
      {q:"A right angle measures—", choices:["45—","60—","90—","120—"], a:2, why:"A right angle is exactly 90—."}
    ],
    "Practice 2": [
      {q:"The Pythagorean theorem applies to—", choices:["All triangles","Right triangles only","Circles","Squares only"], a:1, why:"a— + b— = c— holds only when one angle is 90—."},
      {q:"A rectangle's perimeter with sides 8 and 3 is—", choices:["11","22","24","16"], a:1, why:"P = 2(8 + 3) = 22."},
      {q:"Vertical angles are always—", choices:["Supplementary","Equal","Complementary","Adjacent"], a:1, why:"Opposite angles formed by intersecting lines are congruent."},
      {q:"The sum of interior angles of a quadrilateral is—", choices:["180—","270—","360—","450—"], a:2, why:"Four triangles' worth minus overlap: (4-2) — 180 = 360—."},
      {q:"A line tangent to a circle—", choices:["Passes through the center","Touches at exactly one point","Cuts through the middle","Bisects it"], a:1, why:"Tangents graze the circle at a single point."},
      {q:"The midpoint formula for points (x1,y1) and (x2,y2) is—", choices:["((x1+x2)/2, (y1+y2)/2)","(x2-x1, y2-y1)","(x1y1, x2y2)","v((x2-x1)—+(y2-y1)—)"], a:0, why:"Average the x's and average the y's."}
    ],
    "Practice 3": [
      {q:"Two lines parallel in a plane—", choices:["Intersect once","Never intersect","Form 90—","Are the same line"], a:1, why:"Parallel lines maintain equal distance and never meet."},
      {q:"The volume of a cylinder with radius r and height h is—", choices:["pr—h","2prh","prh—","—pr—h"], a:0, why:"V = (area of base) — height = pr—h."},
      {q:"Similar triangles have—", choices:["Equal areas","Equal angles and proportional sides","Equal perimeters only","The same size"], a:1, why:"Same shape, different scale — angles match, sides scale."},
      {q:"A translation moves a figure by—", choices:["Rotating it","Sliding it","Flipping it","Enlarging it"], a:1, why:"Translation slides every point the same distance and direction."},
      {q:"The distance formula is derived from—", choices:["Area of circle","Pythagorean theorem","Slope formula","Circumference"], a:1, why:"Distance = v((x2-x1)— + (y2-y1)—) comes from a— + b— = c—."},
      {q:"An exterior angle of a triangle equals—", choices:["Half the interior angle","The sum of the two remote interior angles","Always 90—","Twice the adjacent angle"], a:1, why:"Exterior angle theorem."}
    ],
    "Unit Test": [
      {q:"In a right triangle with legs 6 and 8, the hypotenuse is—", choices:["10","12","14","48"], a:0, why:"6— + 8— = 36 + 64 = 100, so c = 10."},
      {q:"A 45-45-90 triangle's sides are in the ratio—", choices:["1:1:v2","1:v3:2","3:4:5","1:2:3"], a:0, why:"Isosceles right triangles always follow 1:1:v2."},
      {q:"A circle's area with radius 3 is—", choices:["6p","9p","12p","3p"], a:1, why:"A = pr— = 9p."},
      {q:"If two polygons are congruent, they—", choices:["Have equal areas only","Are identical in shape and size","Are mirror images only","Have proportional sides only"], a:1, why:"Congruent means same shape AND same size."},
      {q:"The slope of a line through (1,2) and (4,8) is—", choices:["2","1/2","3","6"], a:0, why:"(8-2)/(4-1) = 6/3 = 2."},
      {q:"A regular hexagon has interior angles summing to—", choices:["540—","720—","900—","1080—"], a:1, why:"(6-2) — 180 = 720—, so each angle is 120—."}
    ]
  }
};

/* =========================
   SUBJECT PAGE (practice engine)
========================= */
function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderSubject(c, subject){
  const extraBanks=(window.PDX_SCHOOL_EXTRA_BANKS)||{};
  const bank = QUESTION_BANKS[subject] || extraBanks[subject];
  if (!bank) { c.innerHTML = `<h1 class="sm-page-title">${subject}</h1>`; return; }
  const sets = Object.keys(bank);
  const CODES={"Practice 1":".1","Practice 2":".2","Practice 3":".3","Unit Test":".4"};
  const SKILLNAMES={
    "Mathematics":{"Practice 1":"Order of operations","Practice 2":"Linear equations","Practice 3":"Ratios and rates","Unit Test":"Multi-step word problems"},
    "Science":{"Practice 1":"Cells and organelles","Practice 2":"Chemistry of life","Practice 3":"Forces and motion","Unit Test":"Mixed review"},
    "History":{"Practice 1":"Industrial Revolution","Practice 2":"Immigration and reform","Practice 3":"The Great Depression","Unit Test":"Modern history"},
    "English":{"Practice 1":"Sentence structure","Practice 2":"Theme and details","Practice 3":"Punctuation","Unit Test":"Reading comprehension"},
    "Physics":{"Practice 1":"Newton's laws","Practice 2":"Work and power","Practice 3":"Energy and waves","Unit Test":"Applications"},
    "Chemistry":{"Practice 1":"Atoms and elements","Practice 2":"Bonding","Practice 3":"Reactions","Unit Test":"Stoichiometry basics"},
    "Geography":{"Practice 1":"Maps and globes","Practice 2":"Landforms","Practice 3":"Climate","Unit Test":"Human geography"},
    "Biology":{"Practice 1":"Cell structure","Practice 2":"Genetics","Practice 3":"Evolution","Unit Test":"Systems"},
    "Geometry":{"Practice 1":"Triangles","Practice 2":"Circles and angles","Practice 3":"Transformations","Unit Test":"Proofs basics"}
  };

  const listHtml = sets.map(s => {
    const best = scoreFor(subject + " — " + s);
    const ss = best === null ? 0 : best;
    const passed = ss >= 80;
    return `<div class="sm-card" style="display:flex;align-items:center;gap:14px;margin-bottom:10px;">
      <div style="width:52px;height:52px;border-radius:50%;background:conic-gradient(${passed?"#16a34a":ss>0?"#f59e0b":"#c8d2dc"} ${ss*3.6}deg,#e2e8f0 0deg);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <div style="width:40px;height:40px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;color:#1a202c;">${best===null?"—":ss}</div>
      </div>
      <div style="flex:1">
        <b style="color:#1a3a5c;font-size:15px;">${subject.toUpperCase()} ${SKILLNAMES[subject][s].toUpperCase()}</b>
        <div style="color:#64748b;font-size:12.5px;">Skill code ${subject[0].toUpperCase()}${CODES[s]} — ${bank[s].length} questions — ${passed?"<span class='sm-badge green'>PASSED</span>":best!==null?"<span class='sm-badge amber'>IN PROGRESS</span>":"<span class='sm-badge'>NOT STARTED</span>"}</div>
      </div>
      <button class="sm-btn sm-skill-btn" data-set="${s}">${best===null?"PRACTICE":"IMPROVE SCORE"}</button>
    </div>`;
  }).join("");

  c.innerHTML = `
    <div class="sm-breadcrumb">Learning / <b>${subject}</b></div>
    <h1 class="sm-page-title">${subject} skills</h1>
    <p class="sm-page-sub">Click a skill to practice it. Reach a SmartScore of 80 to pass — get 100 for mastery. Your teacher can see every score.</p>
    <div id="smSkillList">${listHtml}</div>
    <div id="smSetArea" style="display:none"></div>
    <div class="sm-footer">SkillZon Learning — personalized skills practice — licensed to Lincoln Middle School</div>
  `;

  c.querySelectorAll(".sm-skill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      c.querySelector("#smSkillList").style.display = "none";
      const area = c.querySelector("#smSetArea");
      area.style.display = "block";
      renderSet(area, subject, btn.dataset.set, () => renderSubject(c, subject));
    });
  });
}

function renderSet(area, subject, setName, onBack){
  const setId = subject + " — " + setName;
  const bank = QUESTION_BANKS[subject][setName];
  const best = scoreFor(setId);
  const questions = shuffle(bank);
  area.innerHTML = `
    <button class="sm-btn" id="smBackBtn" style="margin-bottom:12px;">? Back to skills</button>
    <div class="sm-card" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <div><b style="color:#1a3a5c">${subject} — ${setName}</b>
        <div style="color:#64748b;font-size:12px;">Answer questions one at a time. Miss one and your SmartScore dips — get a streak going to climb fast!</div></div>
      <div style="text-align:center">
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">SmartScore</div>
        <div id="smSmart" style="font-size:30px;font-weight:bold;color:#2c5282;">${best===null?0:best}</div>
      </div>
    </div>
    <div id="smQuestions"></div>
  `;
  area.querySelector("#smBackBtn").addEventListener("click", onBack);

  const holder = area.querySelector("#smQuestions");
  let answered = 0, correct = 0, smart = best === null ? 0 : best, streak = 0;
  const smartEl = area.querySelector("#smSmart");

  questions.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "sm-q";
    div.innerHTML = `
      <div class="sm-q-head"><span>Question ${i + 1} of ${questions.length}</span><span>${setName}</span></div>
      <div class="sm-q-text">${q.q}</div>
      <a href="#" class="sm-example-link" style="font-size:12px;color:#2c5282;display:inline-block;margin-bottom:8px;">Learn with an example</a>
      <div class="sm-choices">${q.choices.map((ch, ci) =>
        `<button class="sm-choice" data-ci="${ci}">${ch}</button>`
      ).join("")}</div>
      <div class="sm-q-why" style="display:none;margin-top:10px;font-size:13px;color:#4a5568;"></div>
    `;
    holder.appendChild(div);
    div.querySelector(".sm-example-link").addEventListener("click", e=>{
      e.preventDefault();
      const why = div.querySelector(".sm-q-why");
      why.style.display = "block";
      why.innerHTML = `<b>Example:</b> The answer is "${q.choices[q.a]}" — ${q.why}`;
    });

    div.querySelectorAll(".sm-choice").forEach(btn => {
      btn.addEventListener("click", () => {
        if (div.dataset.done) return;
        div.dataset.done = "1";
        const ci = +btn.dataset.ci;
        const right = ci === q.a;
        if (right) correct++;
        answered++;
        div.querySelector(".sm-choices").classList.add("locked");
        div.querySelectorAll(".sm-choice").forEach((b, bi) => {
          if (bi === q.a) b.classList.add("correct");
          else if (bi === ci && !right) b.classList.add("wrong");
        });
        // SkillZon-style SmartScore: +4 per correct (bonus for streaks), -6 per miss
        if (right){ streak++; smart = Math.min(100, smart + (streak >= 3 ? 5 : 4)); }
        else { streak = 0; smart = Math.max(0, smart - 6); }
        smartEl.textContent = smart;
        smartEl.style.color = smart >= 80 ? "#16a34a" : smart >= 50 ? "#2c5282" : "#dc2626";
        const why = div.querySelector(".sm-q-why");
        why.style.display = "block";
        why.innerHTML = `<b>${right ? "Nice!" : "Not quite."}</b> ${q.why}${streak>=2&&right?` <span style="color:#16a34a">?? ${streak} in a row!</span>`:""}`;
        if (answered === questions.length) {
          const score = smart;
          saveProgress({ id: setId, score });
          const passed = score >= 80;
          const done = document.createElement("div");
          done.className = "sm-setdone";
          done.innerHTML = passed
            ? `?? <b>Skill passed!</b> SmartScore: <b>${score}</b>. Great work — your teacher will see this score.`
            : `?? Session complete. SmartScore: <b>${score}</b>. Keep practicing to reach 80 and pass this skill.`;
          holder.appendChild(done);
          done.scrollIntoView({ behavior:"smooth", block:"center" });
        }
      });
    });
  });
}

/* =========================
   ENTER / EXIT
========================= */
function enterSchoolV2(){
  if (schoolActiveV2) return;
  schoolActiveV2 = true;
  injectStyles();

  savedStateV2 = {
    sound: window.settings ? window.settings.sound : true,
    scanlines: window.settings ? window.settings.scanlines : true,
    title: document.title
  };

  if (window.settings) window.settings.sound = false;
  if (window.setPaused) window.setPaused(true);
  if (window.PDX_MUSIC_STOP) window.PDX_MUSIC_STOP();   // silence menu music

  const sl = document.getElementById("scanlineOverlay");
  if (sl) sl.style.display = "none";
  const wx = document.getElementById("weatherCanvas");
  if (wx) wx.style.display = "none";

  document.title = (window.PDX_SCHOOL_NAME && window.PDX_SCHOOL_NAME()) || "SkillZon | Personalized skills practice";  // look_feel overrides via PDX_SCHOOL_NAME
  document.querySelectorAll(".screen").forEach(s => { s.style.display = "none"; });
  document.querySelectorAll("#pixelClock, #pixelCoins, #schoolTrigger").forEach(el => { el.style.display = "none"; });

  overlay.classList.add("active");
  renderSchool("dashboard");
}

function exitSchoolV2(){
  if (!schoolActiveV2) return;
  schoolActiveV2 = false;
  overlay.classList.remove("active");

  if (savedStateV2) {
    if (window.settings) window.settings.sound = savedStateV2.sound;
    document.title = savedStateV2.title || "Pixel Duel Arcade";
  }
  if (window.PDX_MUSIC_START) window.PDX_MUSIC_START();   // resume menu music

  const sl = document.getElementById("scanlineOverlay");
  if (sl) sl.style.display = (window.settings && window.settings.scanlines) ? "block" : "none";
  const wx = document.getElementById("weatherCanvas");
  if (wx) wx.style.display = "";

  if (window.setPaused) window.setPaused(false);

  document.querySelectorAll(".screen").forEach(s => { s.style.display = ""; });
  document.querySelectorAll("#pixelClock, #pixelCoins, #schoolTrigger").forEach(el => { el.style.display = ""; });
}

window.enterSchoolV2 = enterSchoolV2;
window.exitSchoolV2 = exitSchoolV2;
window.enterSchool = enterSchoolV2;
window.exitSchool = exitSchoolV2;

/* =========================
   TRIGGERS
========================= */
// Replace the ? button with a subtle school-colored one (blends into an LMS tab)
const oldTrigger = document.getElementById("schoolTrigger");
if (oldTrigger) oldTrigger.remove();

// Hidden trigger — no visible button (user spreads it by word of mouth).
// Keyboard-only: F2, backtick, Scroll Lock, Pause. Favicon still switches
// when active so the disguise is complete.
const newTrigger = document.createElement("div");
newTrigger.id = "schoolTrigger";
// a disguised button that looks like part of the page chrome (bottom-left)
newTrigger.textContent = "±";
newTrigger.title = "";
newTrigger.style.cssText = "position:fixed;left:12px;bottom:12px;width:26px;height:26px;border:none;background:transparent;color:rgba(90,90,110,.35);font-size:13px;font-family:inherit;cursor:pointer;z-index:99998;opacity:.55;transition:opacity .15s;";
newTrigger.addEventListener("mouseenter", () => { newTrigger.style.opacity = "1"; });
newTrigger.addEventListener("mouseleave", () => { newTrigger.style.opacity = ".55"; });
newTrigger.addEventListener("click", () => { schoolActiveV2 ? exitSchoolV2() : enterSchoolV2(); });
document.body.appendChild(newTrigger);

// Keyboard triggers: F2, Scroll Lock, Pause (backtick is reserved for glitch mode)
addEventListener("keydown", (e) => {
  const k = e.key;
  const c = e.code;

  const isTrigger = k === "F2" || k === "ScrollLock" || k === "Pause"
    || c === "F2" || c === "ScrollLock" || c === "Pause";

  if (isTrigger) {
    e.preventDefault();
    e.stopPropagation();
    schoolActiveV2 ? exitSchoolV2() : enterSchoolV2();
    return;
  }

  if (k === "Escape" && schoolActiveV2) {
    e.preventDefault();
    e.stopPropagation();
    exitSchoolV2();
  }
}, true);

console.log("[School Mode V2] Loaded. Triggers: F2, Scroll Lock, Pause. Press Esc to exit. Glitch: ~");

})();
