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
        // A neighboring carousel slide can touch the clip edge with zero area.
        if (!entry.isIntersecting || entry.intersectionRatio < 0.01) return;
        entry.target.preload = 'auto';
        preloadObserver.unobserve(entry.target);
      });
    }, { rootMargin: '300px 0px', threshold: 0.01 });

    var playbackObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // Match the observer threshold so a clipped edge cannot keep playing.
        if (entry.isIntersecting && entry.intersectionRatio >= 0.01) {
          visible.add(entry.target);
        } else {
          visible.delete(entry.target);
        }
        updatePlayback(entry.target);
      });
    }, { threshold: 0.01 });

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
