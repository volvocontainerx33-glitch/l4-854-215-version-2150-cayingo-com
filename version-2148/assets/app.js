(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var track = carousel.querySelector("[data-hero-track]");
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function render() {
            if (!track || slides.length === 0) {
                return;
            }
            track.style.transform = "translateX(-" + (index * 100) + "%)";
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function go(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            render();
        }

        function start() {
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

        if (prev) {
            prev.addEventListener("click", function () {
                go(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                go(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                go(dotIndex);
                start();
            });
        });
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        render();
        start();
    }

    function setupScrollers() {
        document.querySelectorAll("[data-scroll-button]").forEach(function (button) {
            button.addEventListener("click", function () {
                var targetName = button.getAttribute("data-scroll-button");
                var direction = button.getAttribute("data-direction") === "left" ? -1 : 1;
                var target = document.querySelector('[data-scroll-target="' + targetName + '"]');
                if (target) {
                    target.scrollBy({ left: direction * 420, behavior: "smooth" });
                }
            });
        });
    }

    function setupLocalFilter() {
        document.querySelectorAll("[data-filter-input]").forEach(function (input) {
            var scope = document.querySelector(input.getAttribute("data-filter-input"));
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var empty = document.querySelector(input.getAttribute("data-empty-target"));
            function filter() {
                var keyword = input.value.trim().toLowerCase();
                var visibleCount = 0;
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || card.textContent.toLowerCase();
                    var visible = !keyword || text.indexOf(keyword) !== -1;
                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        visibleCount += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visibleCount === 0);
                }
            }
            input.addEventListener("input", filter);
            filter();
        });
    }

    function setupSearchPage() {
        var input = document.querySelector("[data-search-page-input]");
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var keyword = params.get("q") || "";
        input.value = keyword;
        input.dispatchEvent(new Event("input"));
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupScrollers();
        setupLocalFilter();
        setupSearchPage();
    });

    window.setupMoviePlayer = function (source) {
        ready(function () {
            var player = document.querySelector("[data-player]");
            var video = document.querySelector("[data-video]");
            var cover = document.querySelector("[data-player-cover]");
            if (!player || !video || !cover || !source) {
                return;
            }
            var hls = null;
            var attached = false;

            function attachSource() {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    return;
                }
                video.src = source;
            }

            function play() {
                attachSource();
                cover.classList.add("is-hidden");
                video.setAttribute("controls", "controls");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        cover.classList.remove("is-hidden");
                    });
                }
            }

            cover.addEventListener("click", play);
            player.addEventListener("click", function (event) {
                if (event.target === video && !attached) {
                    play();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    };
})();
