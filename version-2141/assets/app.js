(function () {
  var hlsLoaderPromise = null;
  var hlsCdnUrl = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsLoaderPromise) {
      hlsLoaderPromise = new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = hlsCdnUrl;
        script.async = true;
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = function () {
          reject(new Error("HLS library failed to load"));
        };
        document.head.appendChild(script);
      });
    }

    return hlsLoaderPromise;
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var links = document.querySelector("[data-nav-links]");

    if (!toggle || !links) {
      return;
    }

    toggle.addEventListener("click", function () {
      links.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));

    if (slides.length <= 1) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    var hero = document.querySelector(".hero");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }

    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute("data-filter-panel");
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      var cards = Array.prototype.slice.call((scope || document).querySelectorAll(".movie-card"));
      var input = panel.querySelector("[data-filter-input]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var count = panel.querySelector("[data-filter-count]");

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardRegion = card.getAttribute("data-region") || "";
          var cardType = card.getAttribute("data-type") || "";
          var ok = true;

          if (keyword && text.indexOf(keyword) === -1) {
            ok = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            ok = false;
          }
          if (typeValue && cardType !== typeValue) {
            ok = false;
          }

          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible + " 部";
        }
      }

      [input, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var status = player.querySelector("[data-player-status]");
      var source = player.getAttribute("data-m3u8");
      var hasStarted = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function startPlayback() {
        if (!video || !source) {
          setStatus("播放源不可用");
          return;
        }

        if (hasStarted) {
          video.play().catch(function () {});
          return;
        }

        hasStarted = true;
        player.classList.add("is-playing");
        setStatus("正在加载播放源…");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            video.play().catch(function () {});
          }, { once: true });
          setStatus("已启用浏览器原生播放");
          return;
        }

        loadHlsLibrary()
          .then(function (Hls) {
            if (Hls && Hls.isSupported()) {
              var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
              });

              hls.loadSource(source);
              hls.attachMedia(video);
              hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus("播放源已就绪");
                video.play().catch(function () {});
              });
              hls.on(Hls.Events.ERROR, function (_, data) {
                if (data && data.fatal) {
                  setStatus("播放遇到错误，请刷新或更换浏览器重试");
                }
              });
            } else {
              video.src = source;
              setStatus("当前浏览器可能不支持该播放格式，已尝试直接播放");
              video.play().catch(function () {});
            }
          })
          .catch(function () {
            video.src = source;
            setStatus("播放组件加载失败，已尝试直接播放");
            video.play().catch(function () {});
          });
      }

      if (button) {
        button.addEventListener("click", startPlayback);
      }

      if (video) {
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
      }
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });
})();
