/* ===== BOOK AN APPOINTMENT: department -> service dependent dropdowns, validation, confirmation ===== */
(function () {
  const form = document.getElementById("book-appointment-form");
  if (!form) return;

  const departmentSelect = document.getElementById("ba-department");
  const serviceSelect = document.getElementById("ba-service");
  const dateInput = document.getElementById("ba-date");
  const timeSelect = document.getElementById("ba-time");
  const confirmationEl = document.getElementById("book-appointment-confirmation");

  const TIME_SLOTS = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  function formatTime(t) {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = ((h + 11) % 12) + 1;
    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
  }

  // Service list items are sometimes "Name - description"; keep just the name for the dropdown
  function cleanServiceLabel(item) {
    return item.split(" - ")[0].trim();
  }

  function populateDepartments() {
    const services = window.SERVICES || [];
    services.forEach(dept => {
      const opt = document.createElement("option");
      opt.value = dept.id;
      opt.textContent = dept.title;
      departmentSelect.appendChild(opt);
    });
  }

  function populateServices(deptId) {
    const services = window.SERVICES || [];
    const dept = services.find(d => d.id === deptId);

    if (!dept) {
      serviceSelect.disabled = true;
      serviceSelect.innerHTML = `<option value="">Select Department First</option>`;
      return;
    }

    serviceSelect.disabled = false;
    serviceSelect.innerHTML = `<option value="">Select Service</option>`;
    (dept.list || []).forEach(item => {
      const label = cleanServiceLabel(item);
      const opt = document.createElement("option");
      opt.value = label;
      opt.textContent = label;
      serviceSelect.appendChild(opt);
    });
  }

  function populateTimes() {
    TIME_SLOTS.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = formatTime(t);
      timeSelect.appendChild(opt);
    });
  }

  function setMinDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  function clearErrors() {
    form.querySelectorAll(".ba-field.invalid").forEach(f => f.classList.remove("invalid"));
    form.querySelectorAll(".ba-field-error").forEach(e => e.remove());
  }

  function showError(field, message) {
    const wrap = field.closest(".ba-field");
    if (!wrap || wrap.classList.contains("invalid")) return;
    wrap.classList.add("invalid");
    const err = document.createElement("p");
    err.className = "ba-field-error";
    err.textContent = message;
    wrap.appendChild(err);
  }

  function validate(data) {
    let valid = true;
    if (!data.department) { showError(departmentSelect, "Please select a department."); valid = false; }
    if (!data.service) { showError(serviceSelect, "Please select a service."); valid = false; }
    if (!data.date) { showError(dateInput, "Please choose a date."); valid = false; }
    if (!data.time) { showError(timeSelect, "Please choose a time."); valid = false; }
    if (!data.firstName.trim()) { showError(form.firstName, "First name is required."); valid = false; }
    if (!data.lastName.trim()) { showError(form.lastName, "Last name is required."); valid = false; }
    if (!/^[0-9+()\-\s]{7,}$/.test(data.mobile.trim())) { showError(form.mobile, "Enter a valid mobile number."); valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) { showError(form.email, "Enter a valid email address."); valid = false; }
    return valid;
  }

  function departmentTitle(id) {
    const dept = (window.SERVICES || []).find(d => d.id === id);
    return dept ? dept.title : id;
  }

  function showConfirmation(data) {
    form.hidden = true;
    confirmationEl.hidden = false;
    confirmationEl.innerHTML = `
      <h3>Appointment Request Received</h3>
      <p>Thank you, ${data.firstName}. We've received your request and will contact you shortly to confirm.</p>
      <ul>
        <li><strong>Department:</strong> ${departmentTitle(data.department)}</li>
        <li><strong>Service:</strong> ${data.service}</li>
        <li><strong>Date:</strong> ${data.date}</li>
        <li><strong>Time:</strong> ${formatTime(data.time)}</li>
        <li><strong>Name:</strong> ${data.firstName} ${data.lastName}</li>
        <li><strong>Mobile:</strong> ${data.mobile}</li>
        <li><strong>Email:</strong> ${data.email}</li>
      </ul>
      <button type="button" class="ba-close-btn" id="ba-book-another">Book Another Appointment</button>
    `;
  }

  populateDepartments();
  populateTimes();
  setMinDate();
  populateServices("");

  departmentSelect.addEventListener("change", () => populateServices(departmentSelect.value));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();

    const fd = new FormData(form);
    const data = {
      department: fd.get("department") || "",
      service: fd.get("service") || "",
      date: fd.get("date") || "",
      time: fd.get("time") || "",
      firstName: fd.get("firstName") || "",
      lastName: fd.get("lastName") || "",
      mobile: fd.get("mobile") || "",
      email: fd.get("email") || "",
      message: fd.get("message") || ""
    };

    if (!validate(data)) return;

    showConfirmation(data);
  });

  document.addEventListener("click", (e) => {
  if (!form.hidden && !form.contains(e.target)) {
    clearErrors();
  }
});
  confirmationEl.addEventListener("click", (e) => {
    if (e.target.closest("#ba-book-another")) {
      confirmationEl.hidden = true;
      confirmationEl.innerHTML = "";
      form.hidden = false;
      form.reset();
      populateServices("");
    }
  });
})();