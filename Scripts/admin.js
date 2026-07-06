/* ===== ADMIN DASHBOARD: auth gate, data fetch, render, status updates ===== */
(function () {
  const loginWrap = document.getElementById("admin-login-wrap");
  const dashboard = document.getElementById("admin-dashboard");
  const loginForm = document.getElementById("admin-login-form");
  const loginBtn = document.getElementById("admin-login-btn");
  const loginError = document.getElementById("admin-login-error");
  const logoutBtn = document.getElementById("admin-logout-btn");

  const APPT_STATUSES = ["pending", "confirmed", "cancelled"];
  const MSG_STATUSES = ["new", "read", "archived"];

  function nextStatus(current, list) {
    const i = list.indexOf(current);
    return list[(i + 1) % list.length];
  }

  function formatDateTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit"
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  /* ===== AUTH ===== */
  async function checkSession() {
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) {
      showDashboard();
    } else {
      showLogin();
    }
  }

  function showLogin() {
    loginWrap.classList.remove("hidden");
    dashboard.classList.remove("active");
  }

  function showDashboard() {
    loginWrap.classList.add("hidden");
    dashboard.classList.add("active");
    loadAppointments();
    loadMessages();
    loadDoctors();
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";
    loginBtn.disabled = true;
    loginBtn.textContent = "Signing In…";

    const email = document.getElementById("admin-email").value.trim();
    const password = document.getElementById("admin-password").value;

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    loginBtn.disabled = false;
    loginBtn.textContent = "Sign In";

    if (error) {
      loginError.textContent = "Invalid email or password.";
      return;
    }

    loginForm.reset();
    showDashboard();
  });

  logoutBtn.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    showLogin();
  });

  /* ===== TABS ===== */
  document.querySelectorAll(".admin-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`panel-${btn.dataset.tab}`).classList.add("active");
    });
  });

  /* ===== APPOINTMENTS ===== */
  async function loadAppointments() {
    const loadingEl = document.getElementById("appt-loading");
    const tableEl = document.getElementById("appt-table");
    const tbody = document.getElementById("appt-tbody");

    loadingEl.hidden = false;
    loadingEl.textContent = "Loading appointments…";
    loadingEl.className = "admin-loading";
    tableEl.hidden = true;

    const { data, error } = await supabaseClient
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      loadingEl.textContent = "Couldn't load appointments. " + error.message;
      loadingEl.className = "admin-error";
      return;
    }

    document.getElementById("appt-count").textContent = data.length;

    if (data.length === 0) {
      loadingEl.textContent = "No appointment requests yet.";
      loadingEl.className = "admin-empty";
      return;
    }

    tbody.innerHTML = data.map(row => `
      <tr>
        <td>${formatDateTime(row.created_at)}</td>
        <td><strong>${escapeHtml(row.first_name)} ${escapeHtml(row.last_name)}</strong></td>
        <td>${escapeHtml(row.mobile)}<br><span style="color:var(--color-muted)">${escapeHtml(row.email)}</span></td>
        <td>${escapeHtml(row.department)}<br><span style="color:var(--color-muted)">${escapeHtml(row.service)}</span></td>
        <td>${escapeHtml(row.appt_date)}<br><span style="color:var(--color-muted)">${escapeHtml(row.appt_time)}</span></td>
        <td>${escapeHtml(row.message) || "—"}</td>
        <td><button class="admin-status-pill ${row.status}" data-id="${row.id}" data-current="${row.status}" data-type="appointment">${row.status}</button></td>
      </tr>
    `).join("");

    loadingEl.hidden = true;
    tableEl.hidden = false;
  }

  /* ===== MESSAGES ===== */
  async function loadMessages() {
    const loadingEl = document.getElementById("msg-loading");
    const tableEl = document.getElementById("msg-table");
    const tbody = document.getElementById("msg-tbody");

    loadingEl.hidden = false;
    loadingEl.textContent = "Loading messages…";
    loadingEl.className = "admin-loading";
    tableEl.hidden = true;

    const { data, error } = await supabaseClient
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      loadingEl.textContent = "Couldn't load messages. " + error.message;
      loadingEl.className = "admin-error";
      return;
    }

    document.getElementById("msg-count").textContent = data.length;

    if (data.length === 0) {
      loadingEl.textContent = "No messages yet.";
      loadingEl.className = "admin-empty";
      return;
    }

    tbody.innerHTML = data.map(row => `
      <tr>
        <td>${formatDateTime(row.created_at)}</td>
        <td><strong>${escapeHtml(row.name)}</strong></td>
        <td>${escapeHtml(row.number)}<br><span style="color:var(--color-muted)">${escapeHtml(row.email)}</span></td>
        <td>${escapeHtml(row.message)}</td>
        <td><button class="admin-status-pill ${row.status}" data-id="${row.id}" data-current="${row.status}" data-type="message">${row.status}</button></td>
      </tr>
    `).join("");

    loadingEl.hidden = true;
    tableEl.hidden = false;
  }

  /* ===== STATUS CLICK-TO-CYCLE ===== */
  document.addEventListener("click", async (e) => {
    const pill = e.target.closest(".admin-status-pill");
    if (!pill) return;

    const id = pill.dataset.id;
    const type = pill.dataset.type;
    const isAppt = type === "appointment";
    const list = isAppt ? APPT_STATUSES : MSG_STATUSES;
    const newStatus = nextStatus(pill.dataset.current, list);
    const table = isAppt ? "appointments" : "contact_messages";

    pill.disabled = true;
    const { error } = await supabaseClient.from(table).update({ status: newStatus }).eq("id", id);
    pill.disabled = false;

    if (error) {
      console.error("Status update failed:", error);
      return;
    }

    pill.textContent = newStatus;
    pill.dataset.current = newStatus;
    pill.className = `admin-status-pill ${newStatus}`;
  });

  document.getElementById("appt-refresh-btn").addEventListener("click", loadAppointments);
  document.getElementById("msg-refresh-btn").addEventListener("click", loadMessages);

  /* ===== DOCTORS ===== */
  const DAY_LABELS = { sunday:"Sun", monday:"Mon", tuesday:"Tue", wednesday:"Wed", thursday:"Thu", friday:"Fri", saturday:"Sat" };
  const HOUR_LABELS = { "08:00":"8:00 AM","09:00":"9:00 AM","10:00":"10:00 AM","12:00":"12:00 PM","13:00":"1:00 PM","14:00":"2:00 PM","17:00":"5:00 PM","18:00":"6:00 PM","20:00":"8:00 PM" };
  const SPECIALTY_LABELS = { cardiology:"Cardiology", pediatrics:"Pediatrics", surgery:"Surgery", obgyn:"OB-GYN", "internal-medicine":"Internal Medicine" };

  const doctorForm = document.getElementById("doctor-form");
  const doctorAddBtn = document.getElementById("doctor-add-btn");
  const doctorCancelBtn = document.getElementById("doctor-cancel-btn");
  const doctorFormError = document.getElementById("doctor-form-error");

  function checkedValues(containerId) {
    return Array.from(document.querySelectorAll(`#${containerId} input:checked`)).map(i => i.value);
  }
  function setChecked(containerId, values) {
    document.querySelectorAll(`#${containerId} input`).forEach(i => {
      i.checked = (values || []).includes(i.value);
    });
  }

  function openDoctorForm(doctor) {
    doctorForm.hidden = false;
    doctorFormError.textContent = "";
    document.getElementById("doctor-id").value = doctor ? doctor.id : "";
    document.getElementById("doctor-name").value = doctor ? doctor.name : "";
    document.getElementById("doctor-specialization").value = doctor ? doctor.specialization : "";
    document.getElementById("doctor-subspecialty").value = doctor ? (doctor.subSpecialty || "") : "";
    document.getElementById("doctor-gender").value = doctor ? (doctor.gender || "") : "";
    document.getElementById("doctor-email").value = doctor ? (doctor.email || "") : "";
    document.getElementById("doctor-contact").value = doctor ? (doctor.contact_number || "") : "";
    document.getElementById("doctor-hour-in").value = doctor ? (doctor.clinicHourIn || "") : "";
    document.getElementById("doctor-hour-out").value = doctor ? (doctor.clinicHourOut || "") : "";
    setChecked("doctor-days-group", doctor ? doctor.clinicDays : []);
    document.getElementById("doctor-save-btn").textContent = doctor ? "Update Doctor" : "Save Doctor";
    doctorForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeDoctorForm() {
    doctorForm.hidden = true;
    doctorForm.reset();
    document.querySelectorAll("#doctor-days-group input").forEach(i => i.checked = false);
  }

  doctorAddBtn.addEventListener("click", () => openDoctorForm(null));
  doctorCancelBtn.addEventListener("click", closeDoctorForm);

  doctorForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("doctor-id").value;
    const payload = {
      name: document.getElementById("doctor-name").value.trim(),
      specialization: document.getElementById("doctor-specialization").value,
      subSpecialty: document.getElementById("doctor-subspecialty").value.trim(),
      gender: document.getElementById("doctor-gender").value,
      email: document.getElementById("doctor-email").value.trim(),
      contact_number: document.getElementById("doctor-contact").value.trim(),
      clinicHourIn: document.getElementById("doctor-hour-in").value,
      clinicHourOut: document.getElementById("doctor-hour-out").value,
      clinicDays: checkedValues("doctor-days-group")
    };

    if (!payload.name || !payload.specialization) {
      doctorFormError.textContent = "Name and specialization are required.";
      return;
    }

    const saveBtn = document.getElementById("doctor-save-btn");
    saveBtn.disabled = true;

    const { error } = id
      ? await supabaseClient.from("doctors").update(payload).eq("id", id)
      : await supabaseClient.from("doctors").insert(payload);

    saveBtn.disabled = false;

    if (error) {
      doctorFormError.textContent = "Couldn't save doctor. " + error.message;
      return;
    }

    closeDoctorForm();
    loadDoctors();
  });

  async function loadDoctors() {
    const loadingEl = document.getElementById("doctor-loading");
    const tableEl = document.getElementById("doctor-table");
    const tbody = document.getElementById("doctor-tbody");

    loadingEl.hidden = false;
    loadingEl.textContent = "Loading doctors…";
    loadingEl.className = "admin-loading";
    tableEl.hidden = true;

    const { data, error } = await supabaseClient
      .from("doctors")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      loadingEl.textContent = "Couldn't load doctors. " + error.message;
      loadingEl.className = "admin-error";
      return;
    }

    document.getElementById("doctor-count").textContent = data.length;

    if (data.length === 0) {
      loadingEl.textContent = "No doctors added yet.";
      loadingEl.className = "admin-empty";
      return;
    }

    window.__doctorCache = data;

    tbody.innerHTML = data.map(doc => {
      const days = (doc.clinicDays || []).map(d => DAY_LABELS[d] || d).join(", ") || "—";
      const hours = doc.clinicHourIn && doc.clinicHourOut
        ? `${HOUR_LABELS[doc.clinicHourIn] || doc.clinicHourIn} – ${HOUR_LABELS[doc.clinicHourOut] || doc.clinicHourOut}`
        : "—";
      const specialtyLabel = SPECIALTY_LABELS[doc.specialization] || doc.specialization || "—";
      const contact = [doc.contact_number, doc.email].filter(Boolean).join("<br>") || "—";

      return `
        <tr>
          <td><strong>${escapeHtml(doc.name)}</strong>${doc.subSpecialty ? `<br><span style="color:var(--color-muted)">${escapeHtml(doc.subSpecialty)}</span>` : ""}</td>
          <td>${escapeHtml(specialtyLabel)}</td>
          <td>${escapeHtml(days)}</td>
          <td>${escapeHtml(hours)}</td>
          <td>${contact}</td>
          <td>
            <button class="admin-action-btn edit" data-id="${doc.id}">Edit</button>
            <button class="admin-action-btn delete" data-id="${doc.id}">Delete</button>
          </td>
        </tr>
      `;
    }).join("");

    loadingEl.hidden = true;
    tableEl.hidden = false;
  }

  document.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".admin-action-btn.edit");
    if (editBtn) {
      const doc = (window.__doctorCache || []).find(d => String(d.id) === editBtn.dataset.id);
      if (doc) openDoctorForm(doc);
      return;
    }

    const deleteBtn = e.target.closest(".admin-action-btn.delete");
    if (deleteBtn) {
      if (!confirm("Delete this doctor?")) return;
      deleteBtn.disabled = true;
      const { error } = await supabaseClient.from("doctors").delete().eq("id", deleteBtn.dataset.id);
      if (error) {
        console.error("Delete failed:", error);
        deleteBtn.disabled = false;
        return;
      }
      loadDoctors();
    }
  });

  checkSession(); 
})();
