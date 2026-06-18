(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var button = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initLocalFilter() {
    var input = document.querySelector(".page-filter");
    var scope = document.querySelector(".filter-scope");
    if (!input || !scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .movie-row"));
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        card.classList.toggle("is-hidden-by-filter", query && text.indexOf(query) === -1);
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
    if (!players.length) {
      return;
    }
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-start");
      var source = player.getAttribute("data-source");
      var hls = null;
      var loaded = false;

      function load() {
        if (loaded || !video || !source) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function playVideo() {
        load();
        var playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
      load();
    });
  }

  function buildCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a href=\"" + movie.url + "\" class=\"movie-card-cover\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"movie-card-play\">▶</span>",
      "<span class=\"movie-card-region\">" + escapeHtml(movie.region) + "</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<div class=\"movie-card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span><a href=\"" + movie.categoryUrl + "\">" + escapeHtml(movie.categoryName) + "</a></div>",
      "<h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"movie-card-tags\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initSearchPage() {
    var results = document.getElementById("searchResults");
    var pagination = document.getElementById("searchPagination");
    var input = document.getElementById("siteSearchInput");
    if (!results || !pagination || !input || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;
    var currentPage = Number(params.get("page") || "1") || 1;
    var pageSize = 24;

    function match(movie, keyword) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(" ")
      ].join(" ").toLowerCase();
      return haystack.indexOf(keyword) !== -1;
    }

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var list = keyword ? window.SITE_MOVIES.filter(function (movie) {
        return match(movie, keyword);
      }) : window.SITE_MOVIES.slice(0, 48);
      var totalPages = Math.max(1, Math.ceil(list.length / pageSize));
      currentPage = Math.min(Math.max(1, currentPage), totalPages);
      var start = (currentPage - 1) * pageSize;
      var pageItems = list.slice(start, start + pageSize);
      results.innerHTML = pageItems.map(buildCard).join("");
      renderPagination(totalPages);
      var nextUrl = "./search.html";
      if (input.value.trim()) {
        nextUrl += "?q=" + encodeURIComponent(input.value.trim());
        if (currentPage > 1) {
          nextUrl += "&page=" + currentPage;
        }
      }
      window.history.replaceState(null, "", nextUrl);
    }

    function renderPagination(totalPages) {
      if (totalPages <= 1) {
        pagination.innerHTML = "";
        return;
      }
      var html = [];
      if (currentPage > 1) {
        html.push("<button class=\"page-link\" type=\"button\" data-page=\"" + (currentPage - 1) + "\">上一页</button>");
      }
      var start = Math.max(1, currentPage - 2);
      var end = Math.min(totalPages, currentPage + 2);
      for (var page = start; page <= end; page += 1) {
        var cls = page === currentPage ? "page-link is-current" : "page-link";
        html.push("<button class=\"" + cls + "\" type=\"button\" data-page=\"" + page + "\">" + page + "</button>");
      }
      if (currentPage < totalPages) {
        html.push("<button class=\"page-link\" type=\"button\" data-page=\"" + (currentPage + 1) + "\">下一页</button>");
      }
      pagination.innerHTML = html.join("");
    }

    input.addEventListener("input", function () {
      currentPage = 1;
      render();
    });
    pagination.addEventListener("click", function (event) {
      var target = event.target.closest("[data-page]");
      if (!target) {
        return;
      }
      currentPage = Number(target.getAttribute("data-page")) || 1;
      render();
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    render();
  }

  ready(function () {
    initMobileNav();
    initLocalFilter();
    initPlayers();
    initSearchPage();
  });
})();
