// ===== Hamburger toggle =====
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('active');
  menuToggle.classList.toggle('active');
  menuToggle.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu on direct nav link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', false);
  });
});

// Close mobile menu when clicking/tapping outside of it
document.addEventListener('click', (event) => {
  const isOpen = navLinks.classList.contains('active');
  if (!isOpen) return;

  const clickedInsideMenu   = navLinks.contains(event.target);
  const clickedToggleButton = menuToggle.contains(event.target);

  if (!clickedInsideMenu && !clickedToggleButton) {
    navLinks.classList.remove('active');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', false);
  }
});