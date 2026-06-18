function setupMoviePlayer(source) {
  var video = document.getElementById('moviePlayer');
  var overlay = document.getElementById('playOverlay');
  var shell = document.getElementById('playerShell');
  var hlsInstance = null;
  var loaded = false;

  if (!video || !overlay || !source) {
    return;
  }

  function loadVideo() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      hlsInstance = new Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function startPlayback(event) {
    if (event) {
      event.preventDefault();
    }

    loadVideo();
    overlay.classList.add('is-hidden');
    video.controls = true;

    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  overlay.addEventListener('click', startPlayback);

  if (shell) {
    shell.addEventListener('click', function (event) {
      if (event.target === shell) {
        startPlayback(event);
      }
    });
  }

  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
