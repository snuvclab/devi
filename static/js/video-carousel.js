document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-video-carousel]').forEach(function (carousel) {
    var track = carousel.querySelector('.baseline-carousel-track');
    var slides = Array.from(track.children);
    var pickers = carousel.querySelectorAll('[data-carousel-slide]');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var current = 0;
    var scrollFrame = null;

    function updateSelection() {
      current = Math.max(0, Math.min(slides.length - 1,
        Math.round(track.scrollLeft / track.clientWidth)));
      pickers.forEach(function (button, index) {
        button.setAttribute('aria-pressed', String(index === current));
      });
      slides.forEach(function (slide, index) {
        // Keep keyboard and screen-reader navigation on the visible slide.
        slide.inert = index !== current;
      });
    }

    function goTo(index) {
      var next = (index + slides.length) % slides.length;
      track.scrollTo({
        left: next * track.clientWidth,
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
    }

    carousel.querySelectorAll('[data-carousel-step]').forEach(function (button) {
      button.addEventListener('click', function () {
        goTo(current + Number(button.dataset.carouselStep));
      });
    });

    pickers.forEach(function (button) {
      button.addEventListener('click', function () {
        goTo(Number(button.dataset.carouselSlide));
      });
    });

    track.addEventListener('keydown', function (event) {
      if (event.target !== track) return;
      if (event.key === 'ArrowLeft') goTo(current - 1);
      else if (event.key === 'ArrowRight') goTo(current + 1);
      else if (event.key === 'Home') goTo(0);
      else if (event.key === 'End') goTo(slides.length - 1);
      else return;
      event.preventDefault();
    });

    // Native scrolling supplies touch swiping and works without JavaScript too.
    track.addEventListener('scroll', function () {
      if (scrollFrame !== null) return;
      scrollFrame = requestAnimationFrame(function () {
        updateSelection();
        scrollFrame = null;
      });
    }, { passive: true });

    updateSelection();
    carousel.querySelectorAll('[data-carousel-controls]').forEach(function (controls) {
      controls.hidden = false;
    });
  });
});
