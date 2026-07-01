// ===== Cross-browser smooth scroll engine (used by everything) =====
function smoothScrollTo(targetY, duration = 700) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();
  function easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Scrolls to an element, accounting for the sticky header height
function scrollToSection(target) {
  if (!target) return;
  const header = document.querySelector('.site-header');
  const offset = header ? header.getBoundingClientRect().height : 0;
  const targetY = target.getBoundingClientRect().top + window.scrollY - offset;
  smoothScrollTo(Math.max(targetY, 0));
}

// ===== Smooth scroll for nav links =====
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (targetId && targetId.startsWith('#') && targetId.length > 1) {
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        scrollToSection(target);
      }
    }
  });
});

// ===== Smooth scroll for Get Started button =====
document.getElementById('cta-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  scrollToSection(document.querySelector('#about'));
});