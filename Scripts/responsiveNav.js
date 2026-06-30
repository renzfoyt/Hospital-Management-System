const navWrap    = document.querySelector('.nav-wrap');
const logo       = document.querySelector('.logo');
const menuToggle = document.getElementById('menu-toggle');
const navLinks   = document.getElementById('nav-links');

function updateNavLayout() {
  const wasCollapsed = navWrap.classList.contains('collapsed');
  navWrap.classList.remove('collapsed');
  navLinks.classList.remove('active');

  const available = navWrap.clientWidth;
  const required  = logo.scrollWidth + navLinks.scrollWidth + 40 + 40;

  if (required > available) {
    navWrap.classList.add('collapsed');
  }
}

let resizeTimer;
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(updateNavLayout, 100); });
window.addEventListener('load', updateNavLayout);
updateNavLayout();
