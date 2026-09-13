// Load clips shortly before they appear, but only decode visible videos.
document.addEventListener('DOMContentLoaded', function () {
  var videos = document.querySelectorAll('video[data-autoplay]');
  var visible = new Set();

  function updatePlayback(video) {
    if (document.hidden || !visible.has(video)) {
      video.pause();
      return;
    }

    var playing = video.play();
    if (playing) {
      playing.then(function () {
        video.controls = false;
        // Scrolling away or hiding the tab can interrupt an in-flight play().
        if (document.hidden || !visible.has(video)) video.pause();
      }).catch(function (error) {
        // Keep manual playback available if the browser blocks autoplay.
        if (error.name !== 'AbortError') video.controls = true;
      });
    }
  }

  if ('IntersectionObserver' in window) {
    var preloadObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.preload = 'auto';
        preloadObserver.unobserve(entry.target);
      });
    }, { rootMargin: '300px 0px' });

    var playbackObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio > 0) {
          visible.add(entry.target);
        } else {
          visible.delete(entry.target);
        }
        updatePlayback(entry.target);
      });
    }, { threshold: [0, 0.01] });

    videos.forEach(function (video) {
      video.controls = false;
      preloadObserver.observe(video);
      playbackObserver.observe(video);
    });
  }
  // Without IntersectionObserver (or JavaScript), native controls still work.

  document.addEventListener('visibilitychange', function () {
    videos.forEach(updatePlayback);
  });

  window.addEventListener('pagehide', function () {
    videos.forEach(function (video) { video.pause(); });
  });

  window.addEventListener('pageshow', function () {
    visible.forEach(updatePlayback);
  });
});
