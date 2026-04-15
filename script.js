window.__app = window.__app || {};

(function () {
  var HEADER_SEL = '.l-header';
  var LOGO_SEL = '.c-logo';
  var LOGO_IMG_SEL = '.c-logo__img';
  var NAV_SEL = '.c-nav#main-nav';
  var TOGGLE_SEL = '.c-nav__toggle';
  var NAV_LIST_SEL = '.c-nav__list';
  var NAV_LINK_SEL = '.c-nav__link';
  var BP_DESKTOP = 1024;
  var BP_SM = 576;

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function getHeaderHeight() {
    var h = document.querySelector(HEADER_SEL);
    return h ? h.offsetHeight : 80;
  }

  function initAOS() {
    if (__app.aosInit) return;
    __app.aosInit = true;

    if (!window.AOS) return;

    document.querySelectorAll('[data-aos][data-avoid-layout="true"]').forEach(function (el) {
      el.removeAttribute('data-aos');
    });

    AOS.init({
      once: false,
      duration: 600,
      easing: 'ease-out',
      offset: 120,
      mirror: false,
      disable: function () {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
    });

    __app.refreshAOS = function () {
      try {
        AOS.refresh();
      } catch (e) {}
    };
  }

  function initNav() {
    if (__app.navInit) return;
    __app.navInit = true;

    var toggle = document.querySelector(TOGGLE_SEL);
    var nav = document.querySelector(NAV_SEL);
    var body = document.body;

    if (!toggle || !nav) return;

    function isOpen() {
      return nav.classList.contains('is-open');
    }

    function openMenu() {
      nav.classList.add('is-open');
      nav.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      var links = nav.querySelectorAll(NAV_LINK_SEL);
      if (links.length) links[0].focus();
    }

    function closeMenu() {
      nav.classList.remove('is-open');
      nav.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    }

    toggle.addEventListener('click', function () {
      if (isOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    nav.querySelectorAll(NAV_LINK_SEL).forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < BP_DESKTOP) {
          closeMenu();
        }
      });
    });

    var focusableQ = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

    nav.addEventListener('keydown', function (e) {
      if (!isOpen() || e.key !== 'Tab') return;
      var items = Array.prototype.slice.call(nav.querySelectorAll(focusableQ));
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    window.addEventListener('resize', debounce(function () {
      if (window.innerWidth >= BP_DESKTOP) {
        closeMenu();
      }
    }, 150));
  }

  function initAnchors() {
    if (__app.anchorsInit) return;
    __app.anchorsInit = true;

    var path = location.pathname;
    var isHome = path === '/' || path === '/index.html' || path === '';

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === '#' || href === '#!') return;

      link.addEventListener('click', function (e) {
        e.preventDefault();
        var id = href.slice(1);
        var target = document.getElementById(id);
        if (!target) return;
        var offset = getHeaderHeight();
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
        if (history.pushState) history.pushState(null, null, href);
      });
    });

    if (!isHome) {
      document.querySelectorAll('a[href^="/#"]').forEach(function (link) {
        var href = link.getAttribute('href');
        if (!href) return;
        link.addEventListener('click', function (e) {
          var hash = href.slice(1);
          if (location.pathname === '/' || location.pathname === '/index.html') {
            e.preventDefault();
            var id = hash.slice(1);
            var target = document.getElementById(id);
            if (!target) return;
            var offset = getHeaderHeight();
            var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
            if (history.pushState) history.pushState(null, null, href);
          }
        });
      });
    }
  }

  function initActiveNav() {
    if (__app.activeNavInit) return;
    __app.activeNavInit = true;

    var path = location.pathname.replace(//$/, '');
    var normalizedPath = path === '' ? '/' : path;

    document.querySelectorAll(NAV_LINK_SEL).forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var linkPath = href.split('#')[0].replace(//$/, '');
      var normalizedLinkPath = linkPath === '' ? '/' : linkPath;

      link.removeAttribute('aria-current');
      link.classList.remove('is-active');

      var onHome = normalizedPath === '/' || normalizedPath === '/index.html';

      if (onHome) {
        if (
          href === '/' ||
          href === '/index.html' ||
          href === '' ||
          href.indexOf('/#') === 0 ||
          href.indexOf('#') === 0
        ) {
          link.setAttribute('aria-current', 'page');
          link.classList.add('is-active');
        }
      } else {
        if (
          normalizedLinkPath !== '' &&
          normalizedLinkPath !== '/' &&
          normalizedPath === normalizedLinkPath
        ) {
          link.setAttribute('aria-current', 'page');
          link.classList.add('is-active');
        }
      }
    });
  }

  function initImages() {
    if (__app.imagesInit) return;
    __app.imagesInit = true;

    var svgPlaceholder =
      'data:image/svg+xml,%3Csvg xmlns%3D"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg" width%3D"400" height%3D"300" viewBox%3D"0 0 400 300"%3E%3Crect width%3D"400" height%3D"300" fill%3D"%23f3f4f6"%2F%3E%3Ctext x%3D"50%25" y%3D"50%25" dominant-baseline%3D"middle" text-anchor%3D"middle" font-family%3D"sans-serif" font-size%3D"14" fill%3D"%239ca3af"%3EBild nicht verf%C3%BCgbar%3C%2Ftext%3E%3C%2Fsvg%3E';

    document.querySelectorAll('img').forEach(function (img) {
      var isLogo = img.classList.contains('c-logo__img') || !!img.closest(LOGO_SEL);
      var isCritical = img.hasAttribute('data-critical');

      if (!img.hasAttribute('loading') && !isCritical && !isLogo) {
        img.setAttribute('loading', 'lazy');
      }

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      if (!img.dataset.fallbackBound) {
        img.dataset.fallbackBound = '1';
        img.addEventListener('error', function () {
          var failedIsLogo = img.classList.contains('c-logo__img') || !!img.closest(LOGO_SEL);
          img.src = svgPlaceholder;
          img.style.objectFit = 'contain';
          if (failedIsLogo) {
            img.style.maxHeight = '40px';
          }
        });
      }
    });
  }

  function initForms() {
    if (__app.formsInit) return;
    __app.formsInit = true;

    document.querySelectorAll('.needs-validation').forEach(function (form) {
      if (form.dataset.formInit) return;
      form.dataset.formInit = '1';

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();

        form.classList.add('was-validated');

        if (!form.checkValidity()) {
          var first = form.querySelector(':invalid');
          if (first) first.focus();
          return;
        }

        var submitBtn = form.querySelector('[type="submit"]');
        var btnText = submitBtn ? submitBtn.querySelector('.c-button__text') : null;
        var spinner = submitBtn ? submitBtn.querySelector('.c-button__spinner') : null;

        if (submitBtn) submitBtn.disabled = true;
        if (btnText) btnText.style.opacity = '0.6';
        if (spinner) spinner.classList.remove('d-none');

        var formData = {};
        var elements = form.elements;
        for (var i = 0; i < elements.length; i++) {
          var el = elements[i];
          if (el.name && el.type !== 'submit') {
            if (el.type === 'checkbox') {
              formData[el.name] = el.checked;
            } else {
              formData[el.name] = el.value;
            }
          }
        }

        var action = form.getAttribute('action') || 'process.php';
        var isThankyou = action.indexOf('.html') !== -1;

        if (isThankyou) {
          setTimeout(function () {
            window.location.href = action;
          }, 600);
          return;
        }

        fetch('process.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
          .then(function (res) {
            return res.json();
          })
          .then(function (data) {
            if (submitBtn) submitBtn.disabled = false;
            if (btnText) btnText.style.opacity = '';
            if (spinner) spinner.classList.add('d-none');
            __app.notify(
              data.message || 'Ihre Anfrage wurde erfolgreich gesendet.',
              'success'
            );
            form.reset();
            form.classList.remove('was-validated');
          })
          .catch(function () {
            if (submitBtn) submitBtn.disabled = false;
            if (btnText) btnText.style.opacity = '';
            if (spinner) spinner.classList.add('d-none');
            __app.notify(
              'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',
              'error'
            );
          });
      });
    });
  }

  function initToast() {
    if (__app.toastInit) return;
    __app.toastInit = true;

    __app.notify = function (msg, type) {
      var container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'c-toast-container';
        container.setAttribute('role', 'alert');
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
      }

      var toast = document.createElement('div');
      toast.className = 'c-toast c-toast--' + (type || 'info');
      toast.textContent = msg;

      container.appendChild(toast);

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          toast.classList.add('is-visible');
        });
      });

      setTimeout(function () {
        toast.classList.remove('is-visible');
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 400);
      }, 5000);
    };
  }

  function initYear() {
    if (__app.yearInit) return;
    __app.yearInit = true;

    var el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  function initAnime() {
    if (__app.animeInit) return;
    __app.animeInit = true;

    if (!window.anime) return;

    var targets = document.querySelectorAll(
      '.card, .feature-card, .animal-card, .c-card, .btn-primary, .btn-success, .c-button--primary, .c-button--success'
    );

    targets.forEach(function (el) {
      if (el.dataset.animeInit) return;
      el.dataset.animeInit = '1';

      el.addEventListener('mouseenter', function () {
        anime({
          targets: el,
          scale: 1.03,
          duration: 200,
          easing: 'easeOutQuad'
        });
      });

      el.addEventListener('mouseleave', function () {
        anime({
          targets: el,
          scale: 1,
          duration: 200,
          easing: 'easeOutQuad'
        });
      });
    });
  }

  function initMobileFlexGaps() {
    if (__app.flexGapsInit) return;
    __app.flexGapsInit = true;

    function applyGaps() {
      var isMobile = window.innerWidth < BP_SM;

      document.querySelectorAll('.d-flex').forEach(function (el) {
        var children = Array.prototype.slice.call(el.children);
        if (children.length <= 1) return;

        var classList = Array.prototype.slice.call(el.classList);
        var hasGap = classList.some(function (c) {
          return c.indexOf('gap-') === 0 || (c.indexOf('g-') === 0 && c !== 'g-0');
        });

        if (isMobile && !hasGap && !el.dataset.gapAdded) {
          el.classList.add('gap-3');
          el.dataset.gapAdded = '1';
        } else if (!isMobile && el.dataset.gapAdded) {
          el.classList.remove('gap-3');
          delete el.dataset.gapAdded;
        }
      });
    }

    applyGaps();
    window.addEventListener('resize', debounce(applyGaps, 200));
  }

  function initHeaderScroll() {
    if (__app.headerScrollInit) return;
    __app.headerScrollInit = true;

    var header = document.querySelector(HEADER_SEL);
    if (!header) return;

    function onScroll() {
      if (window.pageYOffset > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  __app.init = function () {
    if (__app.started) return;
    __app.started = true;

    initAOS();
    initNav();
    initAnchors();
    initActiveNav();
    initImages();
    initForms();
    initToast();
    initYear();
    initAnime();
    initMobileFlexGaps();
    initHeaderScroll();

    if (__app.refreshAOS) __app.refreshAOS();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', __app.init);
  } else {
    __app.init();
  }
})();