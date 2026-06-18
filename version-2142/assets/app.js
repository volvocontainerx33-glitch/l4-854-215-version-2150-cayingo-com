(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-scroll-top]').forEach(function (button) {
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            if (!value) {
                event.preventDefault();
                if (input) {
                    input.focus();
                }
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

    if (slides.length > 1) {
        var current = 0;
        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5800);
    }

    var searchRoot = document.querySelector('[data-search-root]');

    if (searchRoot && typeof SITE_SEARCH_DATA !== 'undefined') {
        var queryInput = document.querySelector('[data-search-input]');
        var typeSelect = document.querySelector('[data-type-filter]');
        var regionSelect = document.querySelector('[data-region-filter]');
        var yearSelect = document.querySelector('[data-year-filter]');
        var resultsNode = document.querySelector('[data-search-results]');
        var countNode = document.querySelector('[data-search-count]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var pageSize = 48;
        var page = 1;

        if (queryInput) {
            queryInput.value = initialQuery;
        }

        var normalize = function (value) {
            return String(value || '').toLowerCase();
        };

        var uniqueValues = function (key) {
            var seen = {};
            SITE_SEARCH_DATA.forEach(function (item) {
                var value = item[key] || '';
                if (value && !seen[value]) {
                    seen[value] = true;
                }
            });
            return Object.keys(seen).sort();
        };

        var fillSelect = function (select, values) {
            if (!select) {
                return;
            }
            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        };

        fillSelect(typeSelect, uniqueValues('type'));
        fillSelect(regionSelect, uniqueValues('region').slice(0, 80));
        fillSelect(yearSelect, uniqueValues('year').reverse());

        var createCard = function (item) {
            var article = document.createElement('article');
            article.className = 'movie-card';

            var link = document.createElement('a');
            link.className = 'poster-link';
            link.href = item.url;
            link.setAttribute('aria-label', '观看' + item.title);

            var image = document.createElement('img');
            image.src = item.cover;
            image.alt = item.title;
            image.loading = 'lazy';

            var gradient = document.createElement('span');
            gradient.className = 'card-gradient';

            var mark = document.createElement('span');
            mark.className = 'play-mark';
            mark.setAttribute('aria-hidden', 'true');

            var badge = document.createElement('span');
            badge.className = 'pill top-left';
            badge.textContent = item.region;

            link.appendChild(image);
            link.appendChild(gradient);
            link.appendChild(mark);
            link.appendChild(badge);

            var body = document.createElement('div');
            body.className = 'card-body';

            var title = document.createElement('h2');
            var titleLink = document.createElement('a');
            titleLink.href = item.url;
            titleLink.textContent = item.title;
            title.appendChild(titleLink);

            var desc = document.createElement('p');
            desc.textContent = item.oneLine;

            var meta = document.createElement('div');
            meta.className = 'meta-row';
            [item.year, item.type, item.genre].forEach(function (value) {
                var span = document.createElement('span');
                span.textContent = value;
                meta.appendChild(span);
            });

            body.appendChild(title);
            body.appendChild(desc);
            body.appendChild(meta);
            article.appendChild(link);
            article.appendChild(body);
            return article;
        };

        var render = function () {
            var query = normalize(queryInput ? queryInput.value : '');
            var selectedType = typeSelect ? typeSelect.value : '';
            var selectedRegion = regionSelect ? regionSelect.value : '';
            var selectedYear = yearSelect ? yearSelect.value : '';

            var matches = SITE_SEARCH_DATA.filter(function (item) {
                var haystack = normalize([
                    item.title,
                    item.oneLine,
                    item.genre,
                    item.tags,
                    item.region,
                    item.type,
                    item.year
                ].join(' '));
                return (!query || haystack.indexOf(query) !== -1) &&
                    (!selectedType || item.type === selectedType) &&
                    (!selectedRegion || item.region === selectedRegion) &&
                    (!selectedYear || item.year === selectedYear);
            });

            var visible = matches.slice(0, page * pageSize);
            resultsNode.innerHTML = '';
            visible.forEach(function (item) {
                resultsNode.appendChild(createCard(item));
            });

            countNode.textContent = '匹配到 ' + matches.length + ' 部作品';
            var moreButton = document.querySelector('[data-load-more]');
            if (moreButton) {
                moreButton.hidden = visible.length >= matches.length;
            }
        };

        [queryInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', function () {
                    page = 1;
                    render();
                });
                control.addEventListener('change', function () {
                    page = 1;
                    render();
                });
            }
        });

        var loadMore = document.querySelector('[data-load-more]');
        if (loadMore) {
            loadMore.addEventListener('click', function () {
                page += 1;
                render();
            });
        }

        render();
    }
}());
