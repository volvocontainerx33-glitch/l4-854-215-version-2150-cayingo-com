(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  function matchItem(item, query) {
    var text = [item.title, item.meta].join(' ').toLowerCase();
    return text.indexOf(query.toLowerCase()) !== -1;
  }

  function buildResult(item) {
    var link = document.createElement('a');
    link.href = './' + item.href;

    var title = document.createElement('strong');
    title.textContent = item.title;

    var meta = document.createElement('span');
    meta.textContent = item.meta;

    link.appendChild(title);
    link.appendChild(meta);
    return link;
  }

  function setupSiteSearch(form) {
    var input = form.querySelector('.site-search-input');
    var panel = form.querySelector('.search-panel');
    if (!input || !panel || !window.SiteSearchData) {
      return;
    }

    function render() {
      var query = input.value.trim();
      panel.innerHTML = '';
      if (!query) {
        panel.classList.remove('is-open');
        return;
      }

      var results = window.SiteSearchData.filter(function (item) {
        return matchItem(item, query);
      }).slice(0, 8);

      results.forEach(function (item) {
        panel.appendChild(buildResult(item));
      });

      panel.classList.toggle('is-open', results.length > 0);
    }

    input.addEventListener('input', render);
    input.addEventListener('focus', render);

    form.addEventListener('submit', function (event) {
      var query = input.value.trim();
      if (!query) {
        event.preventDefault();
        return;
      }
      var first = window.SiteSearchData.find(function (item) {
        return matchItem(item, query);
      });
      if (first) {
        event.preventDefault();
        window.location.href = './' + first.href;
      }
    });

    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) {
        panel.classList.remove('is-open');
      }
    });
  }

  document.querySelectorAll('.site-search').forEach(setupSiteSearch);

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (slides.length <= 1) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        restart();
      });
    });

    start();
  });

  function filterScope(scope, query) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      card.classList.toggle('is-hidden-card', query && text.indexOf(query.toLowerCase()) === -1);
    });
  }

  var filterInput = document.querySelector('.filter-input');
  var filterScopeNode = document.querySelector('[data-filter-scope]');
  if (filterInput && filterScopeNode) {
    filterInput.addEventListener('input', function () {
      filterScope(filterScopeNode, filterInput.value.trim());
      document.querySelectorAll('.quick-filter').forEach(function (button) {
        button.classList.toggle('is-active', !button.getAttribute('data-filter'));
      });
    });
  }

  document.querySelectorAll('.quick-filter').forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-filter') || '';
      document.querySelectorAll('.quick-filter').forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      if (filterInput) {
        filterInput.value = value;
      }
      if (filterScopeNode) {
        filterScope(filterScopeNode, value);
      }
    });
  });

  var searchPageInput = document.querySelector('.search-page-input');
  var searchResultList = document.querySelector('.search-result-list');
  var defaultGrid = document.querySelector('.search-default-grid');
  if (searchPageInput && searchResultList && window.SiteSearchData) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchPageInput.value = initialQuery;

    function renderSearchPage() {
      var query = searchPageInput.value.trim();
      searchResultList.innerHTML = '';
      if (!query) {
        if (defaultGrid) {
          defaultGrid.style.display = '';
        }
        return;
      }
      if (defaultGrid) {
        defaultGrid.style.display = 'none';
      }
      window.SiteSearchData.filter(function (item) {
        return matchItem(item, query);
      }).slice(0, 80).forEach(function (item) {
        searchResultList.appendChild(buildResult(item));
      });
    }

    searchPageInput.addEventListener('input', renderSearchPage);
    renderSearchPage();
  }
})();
