(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = qs("[data-mobile-menu-button]");
    var menu = qs("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var shell = qs("[data-hero-carousel]");
    if (!shell) {
      return;
    }

    var track = qs("[data-hero-track]", shell);
    var slides = qsa("[data-hero-slide]", shell);
    var dots = qsa("[data-hero-dot]", shell);
    var prev = qs("[data-hero-prev]", shell);
    var next = qs("[data-hero-next]", shell);
    var index = 0;
    var timer = null;

    function go(to) {
      if (!slides.length) {
        return;
      }
      index = (to + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        go(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        go(i);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        go(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        go(index + 1);
        play();
      });
    }

    shell.addEventListener("mouseenter", stop);
    shell.addEventListener("mouseleave", play);
    go(0);
    play();
  }

  function initHorizontalScroll() {
    qsa("[data-scroll-section]").forEach(function (section) {
      var list = qs("[data-scroll-list]", section);
      if (!list) {
        return;
      }

      qsa("[data-scroll]", section).forEach(function (button) {
        button.addEventListener("click", function () {
          var direction = button.getAttribute("data-scroll") === "left" ? -1 : 1;
          list.scrollBy({
            left: direction * 420,
            behavior: "smooth"
          });
        });
      });
    });
  }

  function initFilters() {
    qsa("[data-filter-scope]").forEach(function (scope) {
      var input = qs("[data-filter-input]", scope);
      var year = qs("[data-year-filter]", scope);
      var type = qs("[data-type-filter]", scope);
      var empty = qs("[data-filter-empty]", scope);
      var cards = qsa("[data-card]", scope);

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedType = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-region") || ""
          ].join(" ").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            matched = false;
          }
          if (selectedType && cardType !== selectedType) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (type) {
        type.addEventListener("change", apply);
      }
      apply();
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join("");

    return [
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
      '<div class="poster-wrap">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
      '<span class="meta-badge">' + escapeHtml(movie.region || movie.type || "精选") + '</span>',
      movie.year ? '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' : "",
      '<span class="poster-shade"><span class="play-badge">▶</span></span>',
      '</div>',
      '<div class="card-body">',
      '<h3 class="card-title line-clamp-2">' + escapeHtml(movie.title) + '</h3>',
      '<p class="card-desc line-clamp-2">' + escapeHtml(movie.oneLine || movie.summary || "") + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</a>'
    ].join("");
  }

  function initSearchPage() {
    var container = qs("[data-search-results]");
    if (!container || !window.SEARCH_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim();
    var title = qs("[data-search-title]");
    var summary = qs("[data-search-summary]");

    if (title) {
      title.textContent = q ? "搜索结果：" + q : "搜索国产电视剧与热播剧集";
    }

    var results = window.SEARCH_MOVIES;
    if (q) {
      var needle = q.toLowerCase();
      results = results.filter(function (movie) {
        return [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine,
          movie.summary
        ].join(" ").toLowerCase().indexOf(needle) !== -1;
      });
    } else {
      results = results.slice(0, 60);
    }

    if (summary) {
      summary.textContent = q ? "已为你匹配相关片库内容。" : "输入剧名、类型、年份或标签，快速发现想看的内容。";
    }

    container.innerHTML = results.slice(0, 120).map(cardTemplate).join("");

    var empty = qs("[data-search-empty]");
    if (empty) {
      empty.classList.toggle("is-visible", results.length === 0);
    }
  }

  window.loadStream = function (video, streamUrl) {
    if (!video || !streamUrl) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsPlayer) {
        video._hlsPlayer.destroy();
      }

      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      video._hlsPlayer = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", function () {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }, { once: true });
    }
  };

  ready(function () {
    initMobileMenu();
    initHero();
    initHorizontalScroll();
    initFilters();
    initSearchPage();
  });
})();
