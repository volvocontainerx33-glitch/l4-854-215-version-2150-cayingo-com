(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      setSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setSlide(currentSlide + 1);
    }, 5200);
  }

  setSlide(0);

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterGenre = document.querySelector('[data-filter-genre]');
  var emptyState = document.querySelector('[data-empty-state]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function cardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-category'),
      card.textContent
    ].join(' ').toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = filterYear ? filterYear.value : '';
    var genre = filterGenre ? filterGenre.value.toLowerCase() : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = cardText(card);
      var cardYear = card.getAttribute('data-year') || '';
      var cardGenre = (card.getAttribute('data-genre') || '').toLowerCase();
      var ok = true;

      if (query && text.indexOf(query) === -1) {
        ok = false;
      }

      if (year && cardYear !== year) {
        ok = false;
      }

      if (genre && cardGenre.indexOf(genre) === -1) {
        ok = false;
      }

      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  [filterInput, filterYear, filterGenre].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  applyFilters();
})();
