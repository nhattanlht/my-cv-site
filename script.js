/*
  Tran Nhat Tan — Online CV Scripts
  - Mobile navigation toggle
  - Smooth section reveal on scroll
  - Active link highlighting
  - Footer year injection
*/

(function () {
  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Mobile navigation toggle
  var navToggle = document.querySelector(".nav-toggle");
  var navMenu = document.getElementById("nav-menu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Reveal on scroll using IntersectionObserver
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.15 }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show everything
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  // Active nav link on scroll (IntersectionObserver preferred)
  var sections = Array.prototype.slice.call(document.querySelectorAll("main .section"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-menu a"));
  var linkById = {};
  navLinks.forEach(function (a) {
    var href = a.getAttribute("href") || "";
    if (href.startsWith("#")) linkById[href.slice(1)] = a;
  });

  function activateLinkById(id) {
    navLinks.forEach(function (a) { a.classList.remove("active"); });
    var link = linkById[id];
    if (link) link.classList.add("active");
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            activateLinkById(entry.target.id);
          }
        });
      },
      {
        root: null,
        // Center-based activation with header-aware top margin
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0.01
      }
    );
    sections.forEach(function (s) { observer.observe(s); });
  } else {
    // Fallback: basic scroll position check
    function setActiveLinkFallback() {
      var scrollPos = window.scrollY || window.pageYOffset;
      var currentId = null;
      for (var i = 0; i < sections.length; i++) {
        var rect = sections[i].getBoundingClientRect();
        var top = rect.top + window.scrollY - 100;
        if (scrollPos >= top) currentId = sections[i].id;
      }
      if (currentId) activateLinkById(currentId);
    }
    window.addEventListener("scroll", setActiveLinkFallback);
    window.addEventListener("load", setActiveLinkFallback);
  }

  // Shrink header on scroll
  var header = document.querySelector('.site-header');
  function setHeaderSize() {
    if (!header) return;
    if ((window.scrollY || window.pageYOffset) > 8) header.classList.add('shrink');
    else header.classList.remove('shrink');
  }
  window.addEventListener('scroll', setHeaderSize);
  window.addEventListener('load', setHeaderSize);
})();

// Advanced micro-utilities and enhancements (no external libraries)
(function () {
  // Utilities
  var CVUtils = {
    prefersReducedMotion: function () {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
    getHeaderOffset: function () {
      var root = document.documentElement;
      var value = getComputedStyle(root).getPropertyValue('--header-height') || '56px';
      var n = parseInt(value, 10);
      return isNaN(n) ? 56 : n;
    },
    throttle: function (fn, wait) {
      var last = 0;
      return function () {
        var now = Date.now();
        if (now - last >= wait) {
          last = now; fn.apply(this, arguments);
        }
      };
    },
    debounce: function (fn, wait) {
      var t;
      return function () {
        clearTimeout(t);
        var args = arguments, ctx = this;
        t = setTimeout(function () { fn.apply(ctx, args); }, wait);
      };
    },
    smoothScrollToId: function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var headerOffset = this.getHeaderOffset() + 16; // extra spacing
      var top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
      if (this.prefersReducedMotion()) {
        window.scrollTo(0, top);
      } else {
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
      // Make section focusable for screen readers after scroll
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
  };

  // Enhance in-page anchor clicks with precise offset
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.startsWith('#') && href.length > 1) {
      var id = href.slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        CVUtils.smoothScrollToId(id);
      }
    }
  });

  // Keyboard shortcuts: g then key
  var awaitingKey = false;
  var awaitingTimer = null;
  var keyMap = {
    o: 'objective',
    e: 'education',
    s: 'skills',
    p: 'projects',
    c: 'contact'
  };
  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    var key = e.key.toLowerCase();
    if (!awaitingKey && key === 'g') {
      awaitingKey = true;
      clearTimeout(awaitingTimer);
      awaitingTimer = setTimeout(function () { awaitingKey = false; }, 2000);
      return;
    }
    if (awaitingKey) {
      awaitingKey = false;
      clearTimeout(awaitingTimer);
      var id = keyMap[key];
      if (id) {
        e.preventDefault();
        CVUtils.smoothScrollToId(id);
      }
    }
  });

  // Inject basic JSON-LD for SEO
  try {
    var jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Tran Nhat Tan',
      jobTitle: 'Software Developer',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Thu Duc',
        addressRegion: 'Ho Chi Minh City',
        addressCountry: 'VN'
      },
      email: 'mailto:nhattanlht@gmail.com',
      telephone: '+84 703347743',
      sameAs: [
        'http://linkedin.com/in/tran-nhat-tan',
        'https://github.com/nhattanlht'
      ]
    };
    var ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.text = JSON.stringify(jsonLd);
    document.head.appendChild(ld);
  } catch (_) { /* no-op */ }
})();

// UI actions, integrations, and PWA
(function(){
  // Theme toggle with persistence
  var themeToggle = document.getElementById('themeToggle');
  function setTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('cv-theme', theme); } catch(_) {}
    if (themeToggle) {
      var isDark = theme === 'dark';
      var iconText = themeToggle.querySelector('.icon-text');
      if (iconText) iconText.textContent = isDark ? '☀' : '☾';
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute('title', isDark ? 'Switch to Light mode' : 'Switch to Dark mode');
    }
    
    // Update map theme
    updateMapTheme(theme === 'dark');
  }
  
  function updateMapTheme(isDark) {
    var mapContainer = document.querySelector('.map-embed');
    if (!mapContainer) return;
    
    if (isDark) {
      mapContainer.style.filter = 'invert(90%) hue-rotate(180deg)';
      mapContainer.style.transition = 'filter 300ms ease';
    } else {
      mapContainer.style.filter = 'none';
      mapContainer.style.transition = 'filter 300ms ease';
    }
  }
  var savedTheme = null;
  try { savedTheme = localStorage.getItem('cv-theme'); } catch(_) {}
  var prefersDark = false;
  try { prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; } catch(_) {}
  setTheme(savedTheme || 'dark'); // Default to dark mode
  if (themeToggle) {
    themeToggle.addEventListener('click', function(){
      var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(current);
    });
  }

  // Print/Download CV
  var printBtn = document.getElementById('printBtn');
  if (printBtn) { printBtn.addEventListener('click', function(){ window.print(); }); }

  // Parallax brand movement (subtle)
  var brand = document.querySelector('.brand');
  var ticking = false;
  function onScroll(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(function(){
      var y = (window.scrollY || window.pageYOffset);
      if (brand) brand.style.transform = 'translateY(' + Math.max(-8, -y * 0.05) + 'px)';
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', onScroll);

  // GitHub: latest repositories
  (function loadLatestRepos(){
    var container = document.getElementById('latestRepos');
    if (!container || !window.fetch) return;
    var url = 'https://api.github.com/users/nhattanlht/repos?sort=updated&per_page=6';
    fetch(url)
      .then(function(r){ return r.json(); })
      .then(function(repos){
        if (!Array.isArray(repos)) return;
        container.innerHTML = '';
        repos.slice(0, 6).forEach(function(repo){
          var card = document.createElement('article');
          card.className = 'project-card';
          var year = repo.updated_at ? new Date(repo.updated_at).getFullYear() : '';
          card.innerHTML = '\
            <header class="project-card__header">\
              <h3 class="project-card__title">' + (repo.name || 'Repository') + '</h3>\
              <span class="project-card__meta">' + year + '</span>\
            </header>\
            <p>' + (repo.description || '') + '</p>\
            <div class="project-card__links">\
              <a class="btn btn--ghost" href="' + repo.html_url + '" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> GitHub</a>\
              ' + (repo.homepage ? ('<a class="btn btn--primary" href="' + repo.homepage + '" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live</a>') : '') + '\
            </div>';
          container.appendChild(card);
        });
      })
      .catch(function(){ /* ignore */ });
  })();

  // Contact form: mailto fallback when no endpoint
  var contactForm = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e){
      var action = contactForm.getAttribute('action');
      if (!action) {
        e.preventDefault();
        var name = (document.getElementById('name')||{}).value || '';
        var email = (document.getElementById('email')||{}).value || '';
        var msg = (document.getElementById('message')||{}).value || '';
        var body = encodeURIComponent('From: ' + name + ' <' + email + '>' + '\n\n' + msg);
        window.location.href = 'mailto:nhattanlht@gmail.com?subject=Contact%20via%20CV&body=' + body;
        if (formStatus) formStatus.textContent = 'Opening email client...';
      }
    });
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('./service-worker.js').catch(function(){});
    });
  }
})();

