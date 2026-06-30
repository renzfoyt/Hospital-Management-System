const servicesGridView = document.getElementById('services-grid-view');
const serviceDetails   = document.querySelectorAll('.service-detail');
let lastOpenedServiceId = null;

function showServiceDetail(serviceId) {
  const target = document.querySelector(`[data-service-detail="${serviceId}"]`);
  if (!target) return;
  lastOpenedServiceId = serviceId;
  servicesGridView.hidden = true;
  serviceDetails.forEach(panel => { panel.hidden = (panel !== target); });
  document.querySelector('#services').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showServicesGrid() {
  serviceDetails.forEach(panel => { panel.hidden = true; });
  servicesGridView.hidden = false;
  serviceCards.forEach(c => {
    c.setAttribute('aria-expanded', c.dataset.service === lastOpenedServiceId ? 'true' : 'false');
  });
  document.querySelector(`[data-service="${lastOpenedServiceId}"]`)?.scrollIntoView({ block: 'center' });
}

document.querySelectorAll('[data-service-link]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showServiceDetail(link.dataset.serviceLink);
  });
});

document.querySelectorAll('.back-to-services').forEach(btn => {
  btn.addEventListener('click', showServicesGrid);
});
