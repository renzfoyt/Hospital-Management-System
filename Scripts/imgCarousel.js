// ===== Set current year in footer =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Image Carousel =====
const track = document.getElementById('carousel-track');
const slides = Array.from(track.children);
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
const dotsContainer = document.getElementById('carousel-dots');

let currentSlide = 0;
let autoPlayTimer;

slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.classList.add('carousel-dot');
  if (i === 0) dot.classList.add('active');
  dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

const dots = Array.from(dotsContainer.children);
goToSlide(0);

function goToSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle('active', i === currentSlide));
  dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}
function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

nextBtn.addEventListener('click', () => { nextSlide(); restartAutoPlay(); });
prevBtn.addEventListener('click', () => { prevSlide(); restartAutoPlay(); });

function startAutoPlay() { autoPlayTimer = setInterval(nextSlide, 5000); }
function restartAutoPlay() { clearInterval(autoPlayTimer); startAutoPlay(); }
startAutoPlay();

let touchStartX = 0;
track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
track.addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); restartAutoPlay(); }
});
