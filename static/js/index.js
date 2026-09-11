window.HELP_IMPROVE_VIDEOJS = false;


$(document).ready(function () {
  // Check for click events on the navbar burger icon

  var options = {
    slidesToScroll: 1,
    slidesToShow: 3,
    loop: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
  }

  // Initialize all div with carousel class
  var carousels = bulmaCarousel.attach('.carousel', options);

  bulmaSlider.attach();

})


// Keep paired clips (input egocentric video <-> simulation) aligned.
// The two <video> elements start and loop independently, so a slow first
// decode or a dropped frame leaves an offset that every loop carries over.
document.addEventListener('DOMContentLoaded', function () {
  var groups = {};
  document.querySelectorAll('video[data-sync]').forEach(function (v) {
    (groups[v.dataset.sync] = groups[v.dataset.sync] || []).push(v);
  });

  Object.keys(groups).forEach(function (name) {
    var vids = groups[name];
    if (vids.length < 2) return;

    // The heaviest clip sets the pace; the lighter ones seek to match it.
    var leader = vids.filter(function (v) { return v.hasAttribute('data-sync-lead'); })[0] || vids[0];
    var followers = vids.filter(function (v) { return v !== leader; });

    setInterval(function () {
      if (leader.readyState < 2 || leader.paused) return;
      followers.forEach(function (f) {
        if (f.readyState < 2 || f.seeking) return;
        if (Math.abs(f.currentTime - leader.currentTime) > 0.08) {
          f.currentTime = leader.currentTime;
        }
      });
    }, 250);
  });
});
