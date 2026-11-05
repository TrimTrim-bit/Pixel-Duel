(function(){
"use strict";
const EXTRA_SUBJECTS={
  biology:{
    name:"Biology",
    content:`
      <h1>Biology — Cell Division</h1>
      <p>Cells reproduce through two processes: <strong>mitosis</strong> (for body cells) and <strong>meiosis</strong> (for sex cells).</p>
      <h2>Stages of Mitosis</h2>
      <div class="school-card"><strong>Prophase:</strong> Chromosomes condense, nuclear envelope breaks down.</div>
      <div class="school-card"><strong>Metaphase:</strong> Chromosomes align at the cell's equator.</div>
      <div class="school-card"><strong>Anaphase:</strong> Sister chromatids separate and move to opposite poles.</div>
      <div class="school-card"><strong>Telophase:</strong> Two new nuclear envelopes form, chromosomes decondense.</div>
    `
  },
  geometry:{
    name:"Geometry",
    content:`
      <h1>Geometry — Triangles &amp; Angles</h1>
      <h2>Types of Triangles</h2>
      <div class="school-card"><strong>Equilateral:</strong> All three sides equal. All angles = 60°.</div>
      <div class="school-card"><strong>Isosceles:</strong> Two equal sides, two equal angles.</div>
      <div class="school-card"><strong>Scalene:</strong> No equal sides or angles.</div>
      <h2>Key Theorems</h2>
      <p><strong>Pythagorean theorem:</strong> In a right triangle, a² + b² = c².</p>
      <p><strong>Triangle angle sum:</strong> Interior angles of any triangle always sum to 180°.</p>
    `
  }
};
function tryPatch(){
  const overlay=document.getElementById("schoolMode");
  if(!overlay)return;
  const nav=overlay.querySelector("#schoolNav");
  if(nav&&!nav.dataset.extras){
    nav.dataset.extras="1";
    nav.addEventListener("click",e=>{
      if(!e.target.dataset.tab)return;
      const tab=e.target.dataset.tab;
      if(EXTRA_SUBJECTS[tab]){
        e.preventDefault();e.stopPropagation();
        const content=document.getElementById("schoolContent");
        if(content)content.innerHTML=EXTRA_SUBJECTS[tab].content;
        nav.querySelectorAll("a").forEach(a=>a.classList.toggle("active",a.dataset.tab===tab));
      }
    },true);
  }
}
setInterval(tryPatch,2000);
addEventListener("load",()=>setTimeout(tryPatch,500));
window.PDX_PATCH_SCHOOL=tryPatch;
})();