// ===== Build service cards =====
const cardGrid = document.getElementById('card-grid');
cardGrid.innerHTML = SERVICES.map(s => `
  <button class="card" type="button" aria-expanded="false" data-service="${s.id}">
    <div class="card-media"><img src="${s.icon}" alt="" loading="lazy"></div>
    <div class="card-body">
      <h3>${s.title}</h3>
      <div class="card-desc">
        <div class="card-desc-inner">
          <p>${s.summary}</p>
          <a href="#service-${s.id}" class="card-link" data-service-link="${s.id}">Learn more &rarr;</a>
        </div>
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

// ===== Expandable cards (JS-driven animation) =====
function animateCardDesc(desc, fromHeight, toHeight, fromOpacity, toOpacity, duration = 300) {
  const startTime = performance.now();
  function ease(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = ease(progress);
    desc.style.maxHeight = (fromHeight + (toHeight - fromHeight) * eased) + 'px';
    desc.style.opacity = fromOpacity + (toOpacity - fromOpacity) * eased;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else if (toHeight === 0) {
      desc.style.maxHeight = '0px';
    }
  }
  requestAnimationFrame(step);
}

const serviceCards = document.querySelectorAll('#services .card');
serviceCards.forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('[data-service-link]')) return;
    const isOpen = card.getAttribute('aria-expanded') === 'true';

    serviceCards.forEach(c => {
      const desc = c.querySelector('.card-desc');
      if (!desc) return;
      const currentHeight = desc.getBoundingClientRect().height;
      c.setAttribute('aria-expanded', 'false');
      animateCardDesc(desc, currentHeight, 0, 1, 0);
    });

    if (!isOpen) {
      card.setAttribute('aria-expanded', 'true');
      const desc = card.querySelector('.card-desc');
      const inner = card.querySelector('.card-desc-inner');
      if (desc && inner) {
        animateCardDesc(desc, 0, inner.scrollHeight, 0, 1);
      }
    }
  });
});