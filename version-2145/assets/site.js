(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      mobilePanel.hidden = isOpen;
      menuButton.textContent = isOpen ? '☰' : '×';
    });
  }

  document.querySelectorAll('.back-top').forEach(function (button) {
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    showSlide(0);
    start();
  });

  document.querySelectorAll('.filter-panel').forEach(function (panel) {
    var input = panel.querySelector('.local-filter');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
    var grid = document.querySelector('[data-card-grid]');
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];
    var activeFilter = '';

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var region = card.getAttribute('data-region') || '';
        var year = card.getAttribute('data-year') || '';
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchChip = !activeFilter || region === activeFilter || year === activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
        card.classList.toggle('is-hidden-card', !(matchQuery && matchChip));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter') || '';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button && activeFilter !== '');
        });
        applyFilter();
      });
    });
  });

  function createSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>#' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<a class="movie-card" href="' + item.url + '">' +
        '<span class="poster">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="play-hover">▶</span>' +
          '<span class="badge">' + escapeHtml(item.region) + '</span>' +
        '</span>' +
        '<span class="movie-info">' +
          '<strong>' + escapeHtml(item.title) + '</strong>' +
          '<small>' + escapeHtml(item.oneLine) + '</small>' +
          '<span class="tag-row">' + tags + '</span>' +
        '</span>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var searchResults = document.querySelector('[data-search-results]');
  var searchSummary = document.querySelector('[data-search-summary]');
  var searchInput = document.querySelector('.big-search input[name="q"]');

  if (searchResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();

    if (searchInput) {
      searchInput.value = query;
    }

    var normalized = query.toLowerCase();
    var results = normalized ? window.SEARCH_MOVIES.filter(function (item) {
      return item.search.indexOf(normalized) !== -1;
    }).slice(0, 120) : window.SEARCH_MOVIES.slice(0, 36);

    searchSummary.textContent = normalized ? '“' + query + '” 相关影片' : '精选影片';
    searchResults.innerHTML = results.map(createSearchCard).join('');
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var streamUrl = video ? video.getAttribute('data-stream') : '';
    var hlsInstance = null;
    var ready = false;

    function prepare() {
      if (!video || !streamUrl || ready) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      prepare();
      if (!video) {
        return;
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
