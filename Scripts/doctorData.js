/* ===== DOCTOR DATABASE (localStorage-backed, with safe fallback) ===== */
(function () {
  const DOCTOR_DB_KEY = "hms_doctor_profiles_v3";

  const DEFAULT_DOCTORS = [
    {
      id: "doc-001",
      name: "Dr. Maria Santos",
      specialty: "cardiology",
      subSpecialty: "Interventional Cardiology",
      gender: "female",
      hmo: ["maxicare", "medicard"],
      clinicDays: ["monday", "wednesday", "friday"],
      clinicHourIn: "08:00",
      clinicHourOut: "12:00",
      photo: "",
      bio: "Specializes in minimally invasive cardiac procedures, 12+ years of clinical experience."
    },
    {
      id: "doc-002",
      name: "Dr. Antonio Reyes",
      specialty: "pediatrics",
      subSpecialty: "Neonatology",
      gender: "male",
      hmo: ["intellicare", "philcare"],
      clinicDays: ["tuesday", "thursday", "saturday"],
      clinicHourIn: "13:00",
      clinicHourOut: "17:00",
      photo: "",
      bio: "Dedicated to newborn and infant care, with a focus on early developmental screening."
    },
    {
      id: "doc-003",
      name: "Dr. Liza Cruz",
      specialty: "obgyn",
      subSpecialty: "High-Risk Pregnancy",
      gender: "female",
      hmo: ["maxicare"],
      clinicDays: ["monday", "tuesday", "thursday"],
      clinicHourIn: "09:00",
      clinicHourOut: "18:00",
      photo: "",
      bio: "Manages complex pregnancies and provides comprehensive women's health services."
    },
    {
      id: "doc-004",
      name: "Dr. Ramon Villanueva",
      specialty: "surgery",
      subSpecialty: "General Surgery",
      gender: "male",
      hmo: ["medicard", "philcare"],
      clinicDays: ["monday", "wednesday"],
      clinicHourIn: "08:00",
      clinicHourOut: "12:00",
      photo: "",
      bio: "Performs a wide range of general and laparoscopic surgical procedures."
    },
    {
      id: "doc-005",
      name: "Dr. Karen Bautista",
      specialty: "internal-medicine",
      subSpecialty: "Endocrinology",
      gender: "female",
      hmo: ["maxicare", "intellicare", "philcare"],
      clinicDays: ["tuesday", "thursday"],
      clinicHourIn: "14:00",
      clinicHourOut: "18:00",
      photo: "",
      bio: "Focuses on diabetes management and thyroid disorders."
    },
    {
      id: "doc-006",
      name: "Dr. Michael Tan",
      specialty: "cardiology",
      subSpecialty: "Electrophysiology",
      gender: "male",
      hmo: ["intellicare"],
      clinicDays: ["friday", "saturday"],
      clinicHourIn: "10:00",
      clinicHourOut: "17:00",
      photo: "",
      bio: "Treats heart rhythm disorders and performs catheter ablation procedures."
    },
    {
      id: "doc-007",
      name: "Dr. Grace Mendoza",
      specialty: "pediatrics",
      subSpecialty: "Pediatric Pulmonology",
      gender: "female",
      hmo: ["maxicare", "medicard"],
      clinicDays: ["monday", "friday"],
      clinicHourIn: "09:00",
      clinicHourOut: "12:00",
      photo: "",
      bio: "Manages asthma, chronic cough, and other childhood respiratory conditions."
    },
    {
      id: "doc-008",
      name: "Dr. Paolo Garcia",
      specialty: "obgyn",
      subSpecialty: "Reproductive Endocrinology",
      gender: "male",
      hmo: ["philcare", "medicard"],
      clinicDays: ["wednesday", "saturday"],
      clinicHourIn: "13:00",
      clinicHourOut: "18:00",
      photo: "",
      bio: "Specializes in fertility evaluation and treatment for couples."
    },
    {
      id: "doc-009",
      name: "Dr. Ellen Fernandez",
      specialty: "internal-medicine",
      subSpecialty: "Nephrology",
      gender: "female",
      hmo: ["maxicare", "philcare"],
      clinicDays: ["monday", "thursday"],
      clinicHourIn: "08:00",
      clinicHourOut: "12:00",
      photo: "",
      bio: "Manages chronic kidney disease and hypertension-related kidney complications."
    },
    {
      id: "doc-010",
      name: "Dr. Jose Ramirez",
      specialty: "surgery",
      subSpecialty: "Orthopedic Surgery",
      gender: "male",
      hmo: ["intellicare", "medicard"],
      clinicDays: ["tuesday", "friday"],
      clinicHourIn: "09:00",
      clinicHourOut: "17:00",
      photo: "",
      bio: "Treats fractures, joint injuries, and performs sports-related orthopedic surgery."
    },
    {
      id: "doc-011",
      name: "Dr. Patricia Lim",
      specialty: "cardiology",
      subSpecialty: "Preventive Cardiology",
      gender: "female",
      hmo: ["maxicare"],
      clinicDays: ["wednesday", "friday"],
      clinicHourIn: "13:00",
      clinicHourOut: "18:00",
      photo: "",
      bio: "Focuses on early detection and lifestyle-based prevention of heart disease."
    },
    {
      id: "doc-012",
      name: "Dr. Francis Aquino",
      specialty: "pediatrics",
      subSpecialty: "Pediatric Cardiology",
      gender: "male",
      hmo: ["philcare", "medicard"],
      clinicDays: ["monday", "wednesday", "saturday"],
      clinicHourIn: "10:00",
      clinicHourOut: "14:00",
      photo: "",
      bio: "Diagnoses and manages congenital and acquired heart conditions in children."
    },
    {
      id: "doc-013",
      name: "Dr. Rosanna Dela Cruz",
      specialty: "obgyn",
      subSpecialty: "Gynecologic Oncology",
      gender: "female",
      hmo: ["intellicare", "maxicare"],
      clinicDays: ["tuesday", "thursday", "saturday"],
      clinicHourIn: "08:00",
      clinicHourOut: "12:00",
      photo: "",
      bio: "Specializes in the diagnosis and treatment of gynecologic cancers."
    },
    {
      id: "doc-014",
      name: "Dr. Benjamin Torres",
      specialty: "internal-medicine",
      subSpecialty: "Pulmonology",
      gender: "male",
      hmo: ["medicard"],
      clinicDays: ["monday", "friday"],
      clinicHourIn: "14:00",
      clinicHourOut: "18:00",
      photo: "",
      bio: "Manages asthma, COPD, and other chronic respiratory conditions in adults."
    },
    {
      id: "doc-015",
      name: "Dr. Cecilia Navarro",
      specialty: "surgery",
      subSpecialty: "Plastic and Reconstructive Surgery",
      gender: "female",
      hmo: ["maxicare", "philcare", "intellicare"],
      clinicDays: ["wednesday", "saturday"],
      clinicHourIn: "09:00",
      clinicHourOut: "13:00",
      photo: "",
      bio: "Performs reconstructive procedures following trauma, surgery, or congenital conditions."
    },
    {
      id: "doc-016",
      name: "Dr. Victor Ocampo",
      specialty: "cardiology",
      subSpecialty: "Heart Failure Management",
      gender: "male",
      hmo: ["medicard", "philcare"],
      clinicDays: ["tuesday", "thursday", "friday"],
      clinicHourIn: "08:00",
      clinicHourOut: "11:00",
      photo: "",
      bio: "Manages advanced heart failure patients, including device therapy follow-up."
    }
  ];

  // Feature-detect localStorage so file:// or privacy-mode restrictions can't crash the page.
  // Without this guard, a blocked localStorage call throws INSIDE loadDoctors(), which is
  // uncaught by findDoctor.js's initial call, and it kills every doctor card on the page.
  let storageAvailable = true;
  try {
    const testKey = "__hms_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
  } catch (err) {
    storageAvailable = false;
    console.warn("localStorage unavailable, doctor data will not persist between visits.", err);
  }

  let memoryDoctors = [...DEFAULT_DOCTORS];

  function loadDoctors() {
    if (!storageAvailable) return [...memoryDoctors];
    try {
      const raw = localStorage.getItem(DOCTOR_DB_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(DOCTOR_DB_KEY, JSON.stringify(DEFAULT_DOCTORS));
        return [...DEFAULT_DOCTORS];
      }
      return parsed;
    } catch (err) {
      console.error("Failed to load doctor DB, resetting to defaults.", err);
      try { localStorage.setItem(DOCTOR_DB_KEY, JSON.stringify(DEFAULT_DOCTORS)); } catch (_) {}
      return [...DEFAULT_DOCTORS];
    }
  }

  function saveDoctors(doctors) {
    memoryDoctors = doctors;
    if (!storageAvailable) return;
    try {
      localStorage.setItem(DOCTOR_DB_KEY, JSON.stringify(doctors));
    } catch (err) {
      console.error("Failed to save doctor DB.", err);
    }
  }

  window.DoctorDB = { loadDoctors, saveDoctors };
})();
