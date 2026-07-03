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

  checkSession();
})();
