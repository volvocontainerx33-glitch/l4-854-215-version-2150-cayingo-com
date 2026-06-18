(function () {
  document.querySelectorAll('.movie-player').forEach(function (player) {
    var video = player.querySelector('.player-video');
    var curtain = player.querySelector('.player-curtain');
    var button = player.querySelector('.player-start');
    var stream = player.getAttribute('data-stream');
    var hls = null;

    if (!video || !stream) {
      return;
    }

    function attach() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute('data-ready', '1');
    }

    function play() {
      attach();
      video.controls = true;
      if (curtain) {
        curtain.classList.add('is-hidden');
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    if (curtain) {
      curtain.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
