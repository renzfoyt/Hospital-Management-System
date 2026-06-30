// ===== Populate header dropdown =====
const servicesMenu = document.getElementById('nav-services-menu');
servicesMenu.innerHTML = SERVICES.map(s => `
  <li role="menuitem">
    <a href="#services" data-dropdown-service="${s.id}">${s.title}</a>
  </li>
`).join('');

// ===== Dropdown open/close logic =====
const servicesDropdown = document.getElementById('nav-services-dropdown');
const chevronBtn       = document.getElementById('nav-chevron-btn');

function openDropdown() {
  servicesDropdown.classList.add('open');
  chevronBtn.setAttribute('aria-expanded', 'true');
}
function closeDropdown() {
  servicesDropdown.classList.remove('open');
  chevronBtn.setAttribute('aria-expanded', 'false');
}
function toggleDropdown() {
  servicesDropdown.classList.contains('open') ? closeDropdown() : openDropdown();
}

// Desktop: hover on the whole dropdown area
servicesDropdown.addEventListener('mouseenter', () => {
  if (!navWrap.classList.contains('collapsed')) openDropdown();
});
servicesDropdown.addEventListener('mouseleave', (e) => {
  if (!navWrap.classList.contains('collapsed')) {
    if (!servicesDropdown.contains(e.relatedTarget)) closeDropdown();
  }
});
// Chevron click: works in both desktop and mobile
chevronBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  toggleDropdown();
});

// "Services" label click in desktop: scroll to section and close
document.querySelector('.nav-dropdown-label').addEventListener('click', (e) => {
  if (!navWrap.classList.contains('collapsed')) {
    closeDropdown();
  }
});

// Dropdown item clicks
servicesMenu.querySelectorAll('[data-dropdown-service]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeDropdown();
    navLinks.classList.remove('active');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', false);
    showServiceDetail(link.dataset.dropdownService);
  });
});

// Close desktop dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!navWrap.classList.contains('collapsed') && !servicesDropdown.contains(e.target)) {
    closeDropdown();
  }
});