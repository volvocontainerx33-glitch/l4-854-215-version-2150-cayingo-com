(function () {
  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector(".movie-video");
    var cover = document.querySelector(".player-cover");
    var button = document.querySelector(".play-button");
    var hlsInstance = null;
    var initialized = false;

    if (!video || !streamUrl) {
      return;
    }

    function attachSource() {
      if (initialized) {
        return;
      }

      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function startPlayback(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      attachSource();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", startPlayback);
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (!initialized) {
        startPlayback();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
