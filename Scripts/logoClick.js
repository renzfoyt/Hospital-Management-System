
logo.addEventListener('click', (e) => {
  e.preventDefault();
  const home = document.querySelector('#home');
  if (home) smoothScrollTo(home.getBoundingClientRect().top + window.scrollY);
  navLinks.classList.remove('active');
  menuToggle.classList.remove('active');
  menuToggle.setAttribute('aria-expanded', false);
});



