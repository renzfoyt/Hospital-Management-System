// ===== Build service cards =====
const cardGrid = document.getElementById('card-grid');
cardGrid.innerHTML = SERVICES.map(s => `
  <button class="card" type="button" aria-expanded="false" data-service="${s.id}">
    <div class="card-media"><img src="${s.icon}" alt="" loading="lazy"></div>
    <div class="card-body">
      <h3>${s.title}</h3>
      <div class="card-desc">
        <p>${s.summary}</p>
        <a href="#service-${s.id}" class="card-link" data-service-link="${s.id}">Learn more &rarr;</a>
      </div>
    </div>
  </button>
`).join('');

// ===== Build service detail panels =====
const serviceDetailsContainer = document.getElementById('service-details');
serviceDetailsContainer.innerHTML = SERVICES.map(s => `
  <div class="service-detail" id="service-${s.id}" data-service-detail="${s.id}" hidden>
    <button class="back-to-services" type="button">&larr; Back to Services</button>
    <div class="service-detail-media"><img src="${s.icon}" alt="" loading="lazy"></div>
    <h2>${s.title}</h2>
    ${s.intro.map(p => `<p>${p}</p>`).join('')}
    <h3>${s.listTitle}</h3>
    <ul>${s.list.map(item => `<li>${item}</li>`).join('')}</ul>
  </div>
`).join('');

// ===== Expandable cards =====
const serviceCards = document.querySelectorAll('#services .card');
serviceCards.forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('[data-service-link]')) return;
    const isOpen = card.getAttribute('aria-expanded') === 'true';
    serviceCards.forEach(c => c.setAttribute('aria-expanded', 'false'));
    card.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  });
});