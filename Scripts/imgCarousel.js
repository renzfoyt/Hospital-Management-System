// ===== Set current year in footer =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Image/Video Carousel =====
const track = document.getElementById('carousel-track');
const slides = Array.from(track.children);
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
const dotsContainer = document.getElementById('carousel-dots');

let currentSlide = 0;
let autoPlayTimer;
let dotsLocked = false;

slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.classList.add('carousel-dot');
  if (i === 0) dot.classList.add('active');
  dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
  dot.addEventListener('click', () => { if (!dotsLocked) goToSlide(i); });
  dotsContainer.appendChild(dot);
});

const dots = Array.from(dotsContainer.children);

function setDotsLocked(locked) {
  dotsLocked = locked;
  dots.forEach(dot => dot.classList.toggle('carousel-dot-disabled', locked));
}

function goToSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle('active', i === currentSlide));
  dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
  syncPlayback();
}
function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

function startAutoPlay() { autoPlayTimer = setInterval(nextSlide, 5000); }
function stopAutoPlay() { clearInterval(autoPlayTimer); }

// Pauses/rewinds every video, then either plays the current slide's video
// (locking dots/swipe until it finishes) or resumes normal image autoplay.
// Arrows are never locked - they can always skip past a playing video.
function syncPlayback() {
  stopAutoPlay();

  slides.forEach((slide) => {
    const vid = slide.querySelector('video');
    if (vid) { vid.pause(); vid.currentTime = 0; vid.onended = null; }
  });

  const activeVideo = slides[currentSlide].querySelector('video');
  if (activeVideo) {
    setDotsLocked(true);
    activeVideo.play().catch(() => {});
    activeVideo.onended = () => { setDotsLocked(false); nextSlide(); };
  } else {
    setDotsLocked(false);
    startAutoPlay();
  }
}

nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

let touchStartX = 0;
track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
track.addEventListener('touchend', (e) => {
  if (dotsLocked) return;
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
});

goToSlide(0);