/* =====================================================
   ACPS-STYLE COURSE CATALOG (Alexandria, VA inspired)
   Modeled on real Alexandria City Public Schools offerings:
   • Middle schools: Francis C. Hammond & George Washington (grades 7-8)
   • High school: Alexandria City High School (ACHS) — Minnie Howard
     (9th) & King Street (10-12) campuses, with academies, AVID Excel,
     International Academy, Governor's Health Sciences Academy and
     the Career & Technical Education (CTE) pathway list.

   Types: core · honors · ap · elective · support (AVID etc.)
   Feeds the identity.js period picker + School Mode schedule.
   ===================================================== */
(function () {
  "use strict";
  if (window.__PDX_GRADES__) return; window.__PDX_GRADES__ = true;

  const CATALOG = {
    /* ================= GRADE 7 (Hammond / GW) ================= */
    "Math 7": { grades: [7], type: "core" },
    "Accelerated Math 7": { grades: [7], type: "honors" },
    "English 7": { grades: [7], type: "core" },
    "Honors English 7": { grades: [7], type: "honors" },
    "Life Science 7": { grades: [7], type: "core" },
    "US History to 1865": { grades: [7], type: "core" },
    "AVID Excel 7": { grades: [7], type: "support" },
    "Spanish Immersion 7": { grades: [7], type: "honors" },
    "French 1 (MS)": { grades: [7, 8], type: "elective" },
    "Spanish 1 (MS)": { grades: [7, 8], type: "elective" },
    "Band 7": { grades: [7], type: "elective" },
    "Orchestra 7": { grades: [7], type: "elective" },
    "Chorus 7": { grades: [7], type: "elective" },
    "Art 7": { grades: [7], type: "elective" },
    "Technology Education 7": { grades: [7], type: "elective" },
    "PE 7": { grades: [7], type: "core" },

    /* ================= GRADE 8 (Hammond / GW) ================= */
    "Math 8": { grades: [8], type: "core" },
    "Algebra 1 (MS)": { grades: [8], type: "honors" },
    "English 8": { grades: [8], type: "core" },
    "Honors English 8": { grades: [8], type: "honors" },
    "Physical Science 8": { grades: [8], type: "core" },
    "Civics 8": { grades: [8], type: "core" },
    "Civics 8 Honors": { grades: [8], type: "honors" },
    "AVID Excel 8": { grades: [8], type: "support" },
    "Spanish Immersion 8": { grades: [8], type: "honors" },
    "Spanish 2 (MS)": { grades: [8], type: "elective" },
    "French 2 (MS)": { grades: [8], type: "elective" },
    "Band 8": { grades: [8], type: "elective" },
    "Orchestra 8": { grades: [8], type: "elective" },
    "Chorus 8": { grades: [8], type: "elective" },
    "Art 8": { grades: [8], type: "elective" },
    "Project Lead the Way 8": { grades: [8], type: "elective" },
    "PE 8": { grades: [8], type: "core" },

    /* ================= GRADE 9 (ACHS Minnie Howard) ================= */
    "Algebra 1": { grades: [9], type: "core" },
    "Geometry": { grades: [9, 10], type: "core" },
    "Honors Geometry": { grades: [9, 10], type: "honors" },
    "English 9": { grades: [9], type: "core" },
    "Honors English 9": { grades: [9], type: "honors" },
    "Biology": { grades: [9], type: "core" },
    "Honors Biology": { grades: [9], type: "honors" },
    "World History & Geography 1": { grades: [9], type: "core" },
    "Honors World History 1": { grades: [9], type: "honors" },
    "AVID 9": { grades: [9], type: "support" },
    "Health & PE 9": { grades: [9], type: "core" },
    "Spanish 1": { grades: [9], type: "elective" },
    "French 1": { grades: [9], type: "elective" },
    "Arabic 1": { grades: [9, 10], type: "elective" },
    "Concert Band": { grades: [9, 10, 11, 12], type: "elective" },
    "String Orchestra": { grades: [9, 10, 11, 12], type: "elective" },
    "Treble Choir": { grades: [9, 10], type: "elective" },
    "Art 1": { grades: [9], type: "elective" },
    "Foundations of Engineering": { grades: [9, 10], type: "elective" },
    "Computer Science Foundations": { grades: [9, 10], type: "elective" },

    /* ================= GRADE 10 ================= */
    "Algebra 2": { grades: [10, 11], type: "core" },
    "Honors Algebra 2": { grades: [10, 11], type: "honors" },
    "English 10": { grades: [10], type: "core" },
    "Honors English 10": { grades: [10], type: "honors" },
    "Chemistry": { grades: [10], type: "core" },
    "Honors Chemistry": { grades: [10], type: "honors" },
    "World History & Geography 2": { grades: [10], type: "core" },
    "AP World History": { grades: [10], type: "ap" },
    "AVID 10": { grades: [10], type: "support" },
    "Health & PE 10": { grades: [10], type: "core" },
    "Spanish 2": { grades: [10], type: "elective" },
    "French 2": { grades: [10], type: "elective" },
    "Arabic 2": { grades: [10, 11], type: "elective" },
    "Photography 1": { grades: [10, 11, 12], type: "elective" },
    "Ceramics 1": { grades: [10, 11, 12], type: "elective" },
    "Theater Arts 1": { grades: [10, 11, 12], type: "elective" },
    "Sports Medicine 1": { grades: [10, 11, 12], type: "elective" },

    /* ================= GRADE 11 ================= */
    "Pre-Calculus": { grades: [11, 12], type: "core" },
    "Honors Pre-Calculus": { grades: [11, 12], type: "honors" },
    "English 11": { grades: [11], type: "core" },
    "AP English Language": { grades: [11], type: "ap" },
    "US History": { grades: [11], type: "core" },
    "AP US History": { grades: [11], type: "ap" },
    "AP Psychology": { grades: [11, 12], type: "ap" },
    "AVID 11": { grades: [11], type: "support" },
    "Spanish 3": { grades: [11], type: "elective" },
    "French 3": { grades: [11], type: "elective" },
    "Statistics": { grades: [11, 12], type: "elective" },
    "Anatomy & Physiology": { grades: [11, 12], type: "elective" },
    "Astronomy": { grades: [11, 12], type: "elective" },
    "Oceanography": { grades: [11, 12], type: "elective" },
    "African American History": { grades: [11, 12], type: "elective" },
    "AP Computer Science Principles": { grades: [10, 11, 12], type: "ap" },
    "Cybersecurity 1": { grades: [10, 11, 12], type: "elective" },

    /* ================= GRADE 12 ================= */
    "AP Calculus AB": { grades: [12], type: "ap" },
    "AP Calculus BC": { grades: [12], type: "ap" },
    "AP Statistics": { grades: [12], type: "ap" },
    "AP English Literature": { grades: [12], type: "ap" },
    "Government": { grades: [12], type: "core" },
    "AP Government": { grades: [12], type: "ap" },
    "AP Microeconomics": { grades: [12], type: "ap" },
    "AP Macroeconomics": { grades: [12], type: "ap" },
    "AP Environmental Science": { grades: [11, 12], type: "ap" },
    "AP Physics 1": { grades: [12], type: "ap" },
    "AP Chemistry": { grades: [12], type: "ap" },
    "AP Biology": { grades: [12], type: "ap" },
    "AP Computer Science A": { grades: [12], type: "ap" },
    "AP Art History": { grades: [11, 12], type: "ap" },
    "AP Studio Art: 2D Design": { grades: [12], type: "ap" },
    "AP Music Theory": { grades: [11, 12], type: "ap" },
    "AP Spanish Language": { grades: [12], type: "ap" },
    "AP Capstone Seminar": { grades: [11], type: "ap" },
    "AP Capstone Research": { grades: [12], type: "ap" },
    "AVID 12": { grades: [12], type: "support" },
    "AP African American Studies": { grades: [12], type: "ap" },
    "Economics & Personal Finance": { grades: [12], type: "core" },
    "NOVA Dual Enrollment English": { grades: [12], type: "honors" },

    /* ================= ACHS ACADEMIES & CTE ================= */
    "Academy of Finance 1": { grades: [10, 11], type: "elective" },
    "Academy of Finance 2": { grades: [11, 12], type: "elective" },
    "Accounting": { grades: [10, 11, 12], type: "elective" },
    "Entrepreneurship": { grades: [10, 11, 12], type: "elective" },
    "Marketing 1": { grades: [10, 11, 12], type: "elective" },
    "Business Law": { grades: [11, 12], type: "elective" },
    "Culinary Arts 1": { grades: [10, 11, 12], type: "elective" },
    "Culinary Arts 2": { grades: [11, 12], type: "elective" },
    "Radio Production & Podcasting": { grades: [10, 11, 12], type: "elective" },
    "TV & Media Production 1": { grades: [10, 11, 12], type: "elective" },
    "TV & Media Production 2": { grades: [11, 12], type: "elective" },
    "Graphic Design": { grades: [10, 11, 12], type: "elective" },
    "Web Design & Development": { grades: [10, 11, 12], type: "elective" },
    "Network & Cybersecurity (Cisco 1)": { grades: [10, 11, 12], type: "elective" },
    "Network & Cybersecurity (Cisco 2)": { grades: [11, 12], type: "elective" },
    "Robotics & Automation": { grades: [10, 11, 12], type: "elective" },
    "Engineering Design & Development": { grades: [11, 12], type: "elective" },
    "Automotive Technology 1": { grades: [10, 11, 12], type: "elective" },
    "Carpentry & Construction 1": { grades: [10, 11, 12], type: "elective" },
    "Cosmetology 1": { grades: [10, 11], type: "elective" },
    "Cosmetology 2": { grades: [11, 12], type: "elective" },
    "Nursing Assistant 1": { grades: [11, 12], type: "elective" },
    "Emergency Medical Technician": { grades: [12], type: "elective" },
    "Pharmacy Technician": { grades: [11, 12], type: "elective" },
    "JROTC 1": { grades: [9, 10, 11, 12], type: "elective" },
    "JROTC 2": { grades: [10, 11, 12], type: "elective" },
    "Student Leadership": { grades: [10, 11, 12], type: "elective" },
    "Yearbook": { grades: [10, 11, 12], type: "elective" },
    "Newspaper / Theogony": { grades: [10, 11, 12], type: "elective" },
    "International Academy English": { grades: [9, 10, 11], type: "support" },
    "International Academy Science": { grades: [9, 10, 11], type: "support" },
    "Work-Based Learning (Co-op)": { grades: [12], type: "elective" },
    "Titan Time Study Hall": { grades: [9, 10, 11, 12], type: "support" }
  };

  window.PDX_GRADE_CATALOG = CATALOG;
  window.PDX_GRADE_SPANS = [7, 8, 9, 10, 11, 12];
  window.PDX_SCHOOL_META = {
    middle: ["Francis C. Hammond", "George Washington"],
    high: "Alexandria City High School",
    campuses: ["Minnie Howard (9)", "King Street (10–12)"]
  };

  /* filter helper: classes for a grade, sorted core→honors→ap→elective→support */
  window.PDX_CLASSES_FOR_GRADE = function (grade) {
    const order = { core: 0, honors: 1, ap: 2, elective: 3, support: 4 };
    return Object.entries(CATALOG)
      .filter(([, v]) => v.grades.includes(grade))
      .sort((a, b) => (order[a[1].type] - order[b[1].type]) || a[0].localeCompare(b[0]))
      .map(([name, v]) => ({ name, type: v.type }));
  };
})();
