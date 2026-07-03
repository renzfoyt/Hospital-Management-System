/* ===== CONTACT US: validation, confirmation ===== */
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const nameInput = document.getElementById("cf-name");
  const emailInput = document.getElementById("cf-email");
  const numberInput = document.getElementById("cf-mnumber");
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
    if (!/^[0-9+()\-\s]{7,}$/.test(data.number.trim())) { showError(numberInput, "Enter a valid mobile number."); valid = false; }
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

  function showSubmitError(message) {
    let errEl = form.querySelector(".cf-submit-error");
    if (!errEl) {
      errEl = document.createElement("p");
      errEl.className = "cf-submit-error";
      errEl.style.color = "#c0392b";
      errEl.style.marginTop = "10px";
      form.appendChild(errEl);
    }
    errEl.textContent = message;
  }

  async function saveMessage(data) {
    const { error } = await supabaseClient.from("contact_messages").insert([
      {
        name: data.name,
        email: data.email,
        number: data.number,
        message: data.message
      }
    ]);
    return error;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const fd = new FormData(form);
    const data = {
      name: fd.get("name") || "",
      email: fd.get("email") || "",
      number: fd.get("number") || "",
      message: fd.get("message") || ""
    };

    if (!validate(data)) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const error = await saveMessage(data);

    if (submitBtn) submitBtn.disabled = false;

    if (error) {
      console.error("Supabase insert error:", error);
      showSubmitError("Something went wrong sending your message. Please try again.");
      return;
    }

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