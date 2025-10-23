// ==========================================================
// 1. HOME PAGE FADE SLIDESHOW
// ==========================================================
console.log("✅ script.js loaded successfully!");

function initHomeSlideshow() {
    const slides = document.querySelectorAll('.hero .slide');
    if (slides.length === 0) return; // Exit if not on the Home page

    let currentSlide = 0;
    const intervalTime = 5000; // 6 seconds per slide (matches 18s total cycle / 3 slides)

    function changeSlide() {
        // 1. Hide the current active slide
        slides.forEach(slide => slide.classList.remove('active'));
        
        // 2. Increment the slide index
        currentSlide = (currentSlide + 1) % slides.length; 
        
        // 3. Show the new slide
        slides[currentSlide].classList.add('active');
    }

    // Initialize the first slide to be active
    slides[currentSlide].classList.add('active');

    // Set the interval to change slides automatically
    setInterval(changeSlide, intervalTime);
}


// ==========================================================
// 2. PORTRAIT GALLERY MANUAL SLIDER
// ==========================================================

// ==========================================================
// 2. PORTRAIT GALLERY MANUAL SLIDER (UPDATED)
// ==========================================================

function initPortraitSlider() {
  const container = document.querySelector('.slider-container');
  if (!container) return;

  const track = container.querySelector('.slider-track');
  const slides = container.querySelectorAll('.slider-slide');
  const prevButton = container.querySelector('.slider-nav.prev');
  const nextButton = container.querySelector('.slider-nav.next');
  const pagination = container.querySelector('.slider-pagination');

  if (slides.length === 0) return;

  let currentIndex = 0;

  // prevent double initialization
  if (container.dataset.sliderInit === 'true') return;
  container.dataset.sliderInit = 'true';

  // 1. Create pagination dots (clear first)
  pagination.innerHTML = '';
  for (let i = 0; i < slides.length; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    dot.setAttribute('data-index', i);
    pagination.appendChild(dot);
  }
  const dots = pagination.querySelectorAll('.dot');

  // 2. Update function (smooth transition) - use pixel translation for reliability
  let slideWidth = container.clientWidth;

  function updateSizes() {
    slideWidth = container.clientWidth;
    // ensure each slide has the correct width (use flex-basis already set in CSS)
    slides.forEach(slide => {
      slide.style.width = slideWidth + 'px';
      slide.style.flex = `0 0 ${slideWidth}px`;
    });
    track.style.width = (slideWidth * slides.length) + 'px';
  }

  // 5. Autoplay helpers (define early so other init code can call them)
  let autoplayInterval = null;
  const autoplayDelay = 3500; // 3.5s

  function startAutoplay() {
    if (autoplayInterval) return;
    autoplayInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlider();
    }, autoplayDelay);
  }

  function stopAutoplay() {
    if (!autoplayInterval) return;
    clearInterval(autoplayInterval);
    autoplayInterval = null;
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Pause on hover (defined early)
  container.addEventListener('mouseenter', stopAutoplay);
  container.addEventListener('mouseleave', startAutoplay);

  function updateSlider() {
    track.style.transition = 'transform 500ms ease';
    const px = slideWidth * currentIndex;
    track.style.transform = `translate3d(-${px}px,0,0)`;

    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[currentIndex]) dots[currentIndex].classList.add('active');

    prevButton.style.opacity = currentIndex === 0 ? '0.35' : '1';
    nextButton.style.opacity = currentIndex === slides.length - 1 ? '0.35' : '1';
  }

  // recompute sizes on load and resize
  // Initialize sizes immediately so layout doesn't start blank
  updateSizes();

  // Wait for images to load, then compute sizes to avoid layout jumps
  const imgs = container.querySelectorAll('img');
  let imagesLoaded = 0;
  function tryInitAfterImages() {
    imagesLoaded++;
    if (imagesLoaded >= imgs.length) {
      // all images loaded
      updateSizes();
      updateSlider();
      startAutoplay();
    }
  }

  if (imgs.length === 0) {
    updateSizes();
    updateSlider();
    startAutoplay();
  } else {
    imgs.forEach(img => {
      if (img.complete) {
        tryInitAfterImages();
      } else {
        img.addEventListener('load', tryInitAfterImages);
        img.addEventListener('error', tryInitAfterImages);
      }
    });
  }
  window.addEventListener('resize', () => {
    updateSizes();
    updateSlider();
  });

  // 3. Arrow controls
  prevButton.addEventListener('click', () => {
    if (currentIndex > 0) currentIndex--;
    updateSlider();
    resetAutoplay();
  });

  nextButton.addEventListener('click', () => {
    if (currentIndex < slides.length - 1) currentIndex++;
    updateSlider();
    resetAutoplay();
  });

  // 4. Dot controls
  dots.forEach(dot => {
    dot.addEventListener('click', e => {
      currentIndex = parseInt(e.target.getAttribute('data-index'));
      updateSlider();
      resetAutoplay();
    });
  });
  // 6. Initialization is handled after images load above
}




// ==========================================================
// 3. INITIALIZATION (Final & Definitive Fix)
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Check for the MANUAL SLIDER page first (most specific and prioritised)
    const portraitContainer = document.querySelector('.slider-container');
    if (portraitContainer) { 
    initPortraitSlider();
    // continue initializing other UI (navbar toggle, etc.)
    }
    
    // 2. Only run the FADING SLIDESHOW if the script hasn't already returned 
    //    AND if the unique Home Page element (.hero) is present.
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        initHomeSlideshow();
    }

    // Navbar mobile toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navbar = document.querySelector('.navbar');
    const primaryNav = document.getElementById('primary-navigation');
    if (navToggle && navbar && primaryNav) {
      navToggle.addEventListener('click', () => {
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!expanded));
        primaryNav.classList.toggle('show');
        navbar.classList.toggle('nav-open');
        navbar.setAttribute('aria-expanded', String(!expanded));
      });

      // Close when a nav link is clicked
      primaryNav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          navToggle.setAttribute('aria-expanded', 'false');
          primaryNav.classList.remove('show');
          navbar.classList.remove('nav-open');
          navbar.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Lightbox functionality: intercept clicks on images in gallery and slider
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      const lbImg = lightbox.querySelector('img');
      const lbClose = lightbox.querySelector('.lightbox-close');

      function openLightbox(src, alt) {
        lbImg.src = src;
        lbImg.alt = alt || '';
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // prevent background scroll
      }

      function closeLightbox() {
        lightbox.setAttribute('aria-hidden', 'true');
        lbImg.src = '';
        document.body.style.overflow = '';
      }

      // delegate clicks from slider and gallery
      document.addEventListener('click', (e) => {
        const t = e.target;
        // check for images inside .slider-slide or .photo
        if (t.closest('.slider-slide') || t.closest('.photo')) {
          const img = t.tagName === 'IMG' ? t : t.querySelector('img');
          if (img && img.src) {
            e.preventDefault();
            openLightbox(img.src, img.alt || '');
          }
        }
      });

      lbClose.addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
    }
});
