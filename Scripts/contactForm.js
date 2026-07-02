/* ===== CONTACT US: validation, confirmation ===== */
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const nameInput = document.getElementById("cf-name");
  const emailInput = document.getElementById("cf-email");
  const messageInput = document.getElementById("cf-message");
  const confirmationEl = document.getElementById("contact-confirmation");

  function clearErrors() {
    form.querySelectorAll(".cf-field.invalid").forEach(f => f.classList.remove("invalid"));
    form.querySelectorAll(".cf-field-error").forEach(e => e.remove());
  }

  function showError(field, message) {
    const wrap = field.closest(".cf-field");
    if (!wrap || wrap.classList.contains("invalid")) return;
    wrap.classList.add("invalid");
    const err = document.createElement("p");
    err.className = "cf-field-error";
    err.textContent = message;
    wrap.appendChild(err);
  }

  function validate(data) {
    let valid = true;
    if (!data.name.trim()) { showError(nameInput, "Please enter your name."); valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) { showError(emailInput, "Enter a valid email address."); valid = false; }
    if (!data.message.trim()) { showError(messageInput, "Please enter a message."); valid = false; }
    return valid;
  }

  function showConfirmation(data) {
    form.hidden = true;
    confirmationEl.hidden = false;
    confirmationEl.innerHTML = `
      <h3>Message Sent</h3>
      <p>Thank you, ${data.name}. We've received your message and will get back to you shortly.</p>
      <button type="button" class="cf-close-btn" id="cf-send-another">Send Another Message</button>
    `;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();

    const fd = new FormData(form);
    const data = {
      name: fd.get("name") || "",
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
    if (e.target.closest("#cf-send-another")) {
      confirmationEl.hidden = true;
      confirmationEl.innerHTML = "";
      form.hidden = false;
      form.reset();
    }
  });
})();   