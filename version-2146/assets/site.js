(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var menuToggle = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuToggle && mobilePanel) {
      menuToggle.addEventListener("click", function () {
        var open = mobilePanel.hasAttribute("hidden");
        if (open) {
          mobilePanel.removeAttribute("hidden");
        } else {
          mobilePanel.setAttribute("hidden", "");
        }
        menuToggle.setAttribute("aria-expanded", String(open));
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var heroIndex = 0;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === heroIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === heroIndex);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showHero(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showHero(heroIndex + 1);
      }, 5600);
    }

    Array.prototype.forEach.call(document.querySelectorAll(".local-filter"), function (input) {
      var scope = input.closest(".section-wrap") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-row"));
      input.addEventListener("input", function () {
        var query = normalize(input.value);
        cards.forEach(function (card) {
          var text = normalize(card.textContent + " " + (card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || ""));
          card.classList.toggle("is-hidden-card", query && text.indexOf(query) === -1);
        });
      });
    });

    var searchInput = document.getElementById("searchInput");
    var categorySelect = document.getElementById("categorySelect");
    var regionSelect = document.getElementById("regionSelect");
    var searchResults = document.getElementById("searchResults");

    function cardTemplate(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return [
        "<article class="movie-card">",
        "<a class="poster-link" href="" + movie.url + "">",
        "<img src="" + movie.cover + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">",
        "<span class="poster-shade"></span>",
        "<span class="year-badge">" + escapeHtml(movie.year || "精选") + "</span>",
        "<span class="play-mark">▶</span>",
        "</a>",
        "<div class="movie-card-body">",
        "<h3><a href="" + movie.url + "">" + escapeHtml(movie.title) + "</a></h3>",
        "<p>" + escapeHtml(movie.oneLine || "") + "</p>",
        "<div class="movie-meta">" + escapeHtml(movie.meta || "") + "</div>",
        "<div class="tag-row">" + tags + "</div>",
        "</div>",
        "</article>"
      ].join("");
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function renderSearch() {
      if (!searchResults || !window.SEARCH_MOVIES) {
        return;
      }

      var query = normalize(searchInput ? searchInput.value : "");
      var category = categorySelect ? categorySelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var params = new URLSearchParams(window.location.search);
      if (!query && params.get("q") && searchInput) {
        searchInput.value = params.get("q");
        query = normalize(searchInput.value);
      }

      var results = window.SEARCH_MOVIES.filter(function (movie) {
        var content = normalize([movie.title, movie.region, movie.year, movie.genre, movie.category, movie.oneLine, (movie.tags || []).join(" ")].join(" "));
        var queryMatched = !query || content.indexOf(query) !== -1;
        var categoryMatched = !category || movie.category === category;
        var regionMatched = !region || movie.region === region;
        return queryMatched && categoryMatched && regionMatched;
      }).slice(0, 240);

      searchResults.innerHTML = results.map(cardTemplate).join("");
    }

    [searchInput, categorySelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", renderSearch);
        control.addEventListener("change", renderSearch);
      }
    });

    renderSearch();
  });
})();
