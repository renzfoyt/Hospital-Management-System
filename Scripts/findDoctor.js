/* ===== FIND A DOCTOR: live auto-search, no submit button ===== */
(function () {
  const DAY_LABELS = {
    sunday: "Sun", monday: "Mon", tuesday: "Tue", wednesday: "Wed",
    thursday: "Thu", friday: "Fri", saturday: "Sat"
  };
  const HOUR_LABELS = {
    "08:00": "8:00 AM", "09:00": "9:00 AM", "10:00": "10:00 AM",
    "12:00": "12:00 PM", "13:00": "1:00 PM", "14:00": "2:00 PM",
    "17:00": "5:00 PM", "18:00": "6:00 PM", "20:00": "8:00 PM"
  };
  const HMO_LABELS = {
    maxicare: "Maxicare", intellicare: "Intellicare",
    medicard: "Medicard", philcare: "PhilCare"
  };
  const SPECIALTY_LABELS = {
    cardiology: "Cardiology", pediatrics: "Pediatrics", surgery: "Surgery",
    obgyn: "OB-GYN", "internal-medicine": "Internal Medicine"
  };

  const VISIBLE_COUNT = 4;

  const resultsEl = document.getElementById("find-doctor-results");
  const countEl = document.getElementById("find-doctor-count");
  const form = document.getElementById("find-doctor-form");

  let currentResults = [];
  let visibleCount = VISIBLE_COUNT;

  function initials(name) {
    return name.replace(/^Dr\.?\s*/i, "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }

  function doctorCard(doc) {
    const days = (doc.clinicDays || []).map(d => DAY_LABELS[d] || d).join(", ") || "—";
    const hours = doc.clinicHourIn && doc.clinicHourOut
      ? `${HOUR_LABELS[doc.clinicHourIn] || doc.clinicHourIn} – ${HOUR_LABELS[doc.clinicHourOut] || doc.clinicHourOut}`
      : "—";
    const hmos = (doc.hmo || []).map(h => HMO_LABELS[h] || h).join(", ") || "Not specified";
    const specialtyLabel = SPECIALTY_LABELS[doc.specialty] || doc.specialty || "General";

    const bioBlock = doc.bio ? `
        <button type="button" class="doctor-bio-toggle" aria-expanded="false">
          <span>View Bio</span>
          <svg class="doctor-bio-caret" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <p class="doctor-bio" hidden>${doc.bio}</p>` : "";

    return `
      <div class="doctor-card" data-id="${doc.id}">
        <div class="doctor-avatar">
          ${doc.photo ? `<img src="${doc.photo}" alt="${doc.name}">` : `<span>${initials(doc.name)}</span>`}
        </div>
        <h3 class="doctor-name">${doc.name}</h3>
        <p class="doctor-specialty">${specialtyLabel}${doc.subSpecialty ? " · " + doc.subSpecialty : ""}</p>
        <ul class="doctor-meta">
          <li><strong>Gender:</strong> ${doc.gender ? doc.gender[0].toUpperCase() + doc.gender.slice(1) : "—"}</li>
          <li><strong>Clinic Days:</strong> ${days}</li>
          <li><strong>Clinic Hours:</strong> ${hours}</li>
          <li><strong>HMO:</strong> ${hmos}</li>
        </ul>${bioBlock}
      </div>`;
  }

  function updateCount(hasActiveFilters) {
    if (!hasActiveFilters) {
      countEl.textContent = "";
      return;
    }
    const n = currentResults.length;
    countEl.textContent = n === 0
      ? "No doctors found..."
      : `${n} doctor${n === 1 ? "" : "s"} found...`;
  }

  function render() {
    if (!currentResults.length) {
      resultsEl.innerHTML = `<p class="finddoc-empty">No doctors match your search.</p>`;
      return;
    }

    const shown = currentResults.slice(0, visibleCount);
    const remaining = currentResults.length - shown.length;
    const expanded = visibleCount > VISIBLE_COUNT;

    let html = `<div class="doctor-grid">${shown.map(doctorCard).join("")}</div>`;

    if (remaining > 0 || expanded) {
      html += `<div class="finddoc-viewmore-row">`;
      if (remaining > 0) {
        html += `<button type="button" id="finddoc-view-more" class="finddoc-view-more">View More (${remaining} more)</button>`;
      }
      if (expanded) {
        html += `<button type="button" id="finddoc-hide" class="finddoc-hide">Hide</button>`;
      }
      html += `</div>`;
    }

    resultsEl.innerHTML = html;
  }

  // Event delegation: bio toggle, view more, and hide all handled here,
  // so listeners don't need to be re-attached on every render.
  resultsEl.addEventListener("click", (e) => {
    const bioToggle = e.target.closest(".doctor-bio-toggle");
    if (bioToggle) {
      const bio = bioToggle.nextElementSibling;
      const isOpen = bioToggle.getAttribute("aria-expanded") === "true";
      bioToggle.setAttribute("aria-expanded", String(!isOpen));
      bioToggle.classList.toggle("open", !isOpen);
      if (bio) bio.hidden = isOpen;
      return;
    }

    if (e.target.closest("#finddoc-view-more")) {
      visibleCount += VISIBLE_COUNT;
      render();
      return;
    }

    if (e.target.closest("#finddoc-hide")) {
      visibleCount = VISIBLE_COUNT;
      render();
      return;
    }
  });

  function getFilters() {
    const fd = new FormData(form);
    return {
      name: (fd.get("doctorName") || "").toString().trim().toLowerCase(),
      specialty: fd.get("specialty") || "",
      subSpecialty: (fd.get("subSpecialty") || "").toString().trim().toLowerCase(),
      days: fd.getAll("clinicDay"),
      hourIn: fd.get("clinicHourIn") || "",
      hourOut: fd.get("clinicHourOut") || "",
      gender: fd.get("gender") || "",
      hmo: fd.get("hmo") || ""
    };
  }

  function hasFilters(f) {
    return !!(f.name || f.specialty || f.subSpecialty || f.days.length ||
      f.hourIn || f.hourOut || f.gender || f.hmo);
  }

  function applyFilters(doctors, f) {
    return doctors.filter(doc => {
      if (f.name && !doc.name.toLowerCase().includes(f.name)) return false;
      if (f.specialty && doc.specialty !== f.specialty) return false;
      if (f.subSpecialty && !(doc.subSpecialty || "").toLowerCase().includes(f.subSpecialty)) return false;
      if (f.days.length && !f.days.every(d => (doc.clinicDays || []).includes(d))) return false;
      if (f.hourIn && doc.clinicHourIn !== f.hourIn) return false;
      if (f.hourOut && doc.clinicHourOut !== f.hourOut) return false;
      if (f.gender && doc.gender !== f.gender) return false;
      if (f.hmo && !(doc.hmo || []).includes(f.hmo)) return false;
      return true;
    });
  }

  function runSearch() {
    const filters = getFilters();
    try {
      const doctors = window.DoctorDB.loadDoctors();
      currentResults = applyFilters(doctors, filters);
    } catch (err) {
      console.error("Failed to load/filter doctors:", err);
      currentResults = [];
    }
    visibleCount = VISIBLE_COUNT;
    updateCount(hasFilters(filters));
    render();
  }

  // Show the first 4 doctors immediately on page load, before any input
  runSearch();

  // Re-run the search live on every form change (no submit button)
  form.addEventListener("input", runSearch);
  form.addEventListener("change", runSearch);

  // Clear All: reset every field back to default, then re-run search
  const clearBtn = document.getElementById("finddoc-clear-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      form.reset();
      runSearch();
    });
  }
})();