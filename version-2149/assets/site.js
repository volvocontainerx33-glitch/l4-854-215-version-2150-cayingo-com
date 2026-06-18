(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = 0;
    let timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      start();
    }
  }

  const filters = Array.from(document.querySelectorAll('.js-card-filter'));

  filters.forEach(function (input) {
    const cards = Array.from(document.querySelectorAll('.movie-card'));

    input.addEventListener('input', function () {
      const keyword = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        const text = (card.getAttribute('data-filter-text') || card.textContent || '').toLowerCase();
        card.classList.toggle('is-filter-hidden', keyword && !text.includes(keyword));
      });
    });
  });

  function loadExternalHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    const existing = document.querySelector('script[data-hls-loader]');

    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function attachStream(video, stream, done) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.addEventListener('loadedmetadata', done, { once: true });
      return;
    }

    loadExternalHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, done);
      } else {
        video.src = stream;
        video.addEventListener('loadedmetadata', done, { once: true });
      }
    });
  }

  Array.from(document.querySelectorAll('.js-player')).forEach(function (player) {
    const video = player.querySelector('video');
    const overlay = player.querySelector('.player-overlay');

    if (!video || !overlay) {
      return;
    }

    const stream = video.getAttribute('data-stream');
    let attached = false;

    function start() {
      overlay.classList.add('is-hidden');

      const play = function () {
        const promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      };

      if (attached) {
        play();
        return;
      }

      attached = true;
      attachStream(video, stream, play);
    }

    overlay.addEventListener('click', start);

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  });

  const results = document.getElementById('search-results');
  const status = document.getElementById('search-status');
  const pageInput = document.getElementById('search-page-input');

  if (results && typeof searchIndex !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';

    if (pageInput) {
      pageInput.value = initial;
    }

    function resultCard(item) {
      const tags = item.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + item.url + '">',
        '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '  </a>',
        '  <div class="card-body">',
        '    <div class="card-meta"><a href="' + item.categoryUrl + '">' + escapeHtml(item.category) + '</a><span>' + escapeHtml(item.year) + '</span></div>',
        '    <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="card-tags">' + tags + '</div>',
        '    <div class="card-foot"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function search(keyword) {
      const query = keyword.trim().toLowerCase();
      const matched = query
        ? searchIndex.filter(function (item) {
            return item.searchText.toLowerCase().includes(query);
          })
        : searchIndex.slice(0, 48);

      results.innerHTML = matched.slice(0, 120).map(resultCard).join('');

      if (status) {
        status.textContent = query ? '找到 ' + matched.length + ' 条相关内容' : '推荐浏览以下精选内容';
      }
    }

    search(initial);

    if (pageInput) {
      pageInput.addEventListener('input', function () {
        search(pageInput.value);
      });
    }
  }
})();
