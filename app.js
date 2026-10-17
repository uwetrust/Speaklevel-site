/* =============================================
   SPEAKLEVEL — app.js
   ============================================= */

(function () {
  'use strict';

  /* ----- Dark Mode Toggle (choice remembered across pages) ----- */
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem('sl-theme'); } catch (e) { /* storage blocked: fall back to system */ }
  let theme = (saved === 'dark' || saved === 'light')
    ? saved
    : (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);
  updateToggleIcon();

  if (toggle) {
    toggle.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      try { localStorage.setItem('sl-theme', theme); } catch (e) { /* ignore */ }
      updateToggleIcon();
    });
  }

  function updateToggleIcon() {
    if (!toggle) return;
    toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    if (theme === 'dark') {
      toggle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    } else {
      toggle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
  }

  /* ----- Sticky Nav Shadow ----- */
  var nav = document.querySelector('.site-nav');
  if (nav) {
    var scrollHandler = function () {
      if (window.scrollY > 10) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });
    scrollHandler();
  }

  /* ----- Hamburger Menu ----- */
  var hamburger = document.querySelector('.hamburger');
  var mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile menu on link click
    var mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ----- Smooth Scroll for Anchor Links ----- */
  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    var id = anchor.getAttribute('href');
    if (id === '#') return;
    var target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* ----- Accordion ----- */
  var accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(function (item) {
    var trigger = item.querySelector('.accordion-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      // Close all
      accordionItems.forEach(function (i) {
        i.classList.remove('open');
        var t = i.querySelector('.accordion-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ----- Intersection Observer: Fade In on Scroll ----- */
  var observeTargets = document.querySelectorAll('.card, .step, .testimonial-card, .kit-feature-card, .section-header');

  if ('IntersectionObserver' in window) {
    var style = document.createElement('style');
    style.textContent = '.fade-in-target{opacity:0;transform:translateY(16px);transition:opacity .5s ease,transform .5s ease}.fade-in-target.visible{opacity:1;transform:translateY(0)}';
    document.head.appendChild(style);

    observeTargets.forEach(function (el) {
      el.classList.add('fade-in-target');
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    observeTargets.forEach(function (el) {
      observer.observe(el);
    });
  }


  /* ----- Intake form (intake.html) ----- */
  var intakeForm = document.getElementById('intake-form');
  if (intakeForm) {
    // Send people to the thanks page on whichever site they're on (preview or live).
    var nextField = intakeForm.querySelector('input[name="_next"][data-next-page]');
    if (nextField && /^https?:$/.test(window.location.protocol)) {
      nextField.value = new URL(nextField.getAttribute('data-next-page'), window.location.href).href;
    }

    // Pre-select the industry when arriving from a homepage industry card (?industry=...).
    var industryMap = {
      hospitality: 'Hospitality / Food Service',
      retail: 'Retail / Customer Service',
      healthcare: 'Healthcare / Nursing',
      'aged-care': 'Aged Care / Disability',
      trades: 'Construction / Trades',
      logistics: 'Warehousing / Logistics'
    };
    try {
      var wanted = industryMap[new URLSearchParams(window.location.search).get('industry')];
      var industrySelect = document.getElementById('industry');
      if (wanted && industrySelect) industrySelect.value = wanted;
    } catch (e) { /* ignore */ }

    // Stop double-submits once the browser has validated the form.
    intakeForm.addEventListener('submit', function () {
      var btn = intakeForm.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending…';
      }
    });
  }

  // ─── Booked confirmation banner ────────────────────────────────
  // When the user lands on ?booked=1 (after Calendly schedule),
  // reveal the celebratory banner and clean up the URL.
  function initBookedBanner() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (!params.has('booked')) return;

      var banner = document.getElementById('booked-banner');
      if (!banner) return;

      banner.hidden = false;
      // Allow CSS transition to fire on next frame
      requestAnimationFrame(function () {
        banner.classList.add('booked-banner--visible');
      });

      var dismiss = banner.querySelector('[data-booked-dismiss]');
      if (dismiss) {
        dismiss.addEventListener('click', function () {
          banner.classList.remove('booked-banner--visible');
          setTimeout(function () { banner.hidden = true; }, 300);
        });
      }

      // Auto-hide after 12s so it doesn't sit forever
      setTimeout(function () {
        if (!banner.hidden) {
          banner.classList.remove('booked-banner--visible');
          setTimeout(function () { banner.hidden = true; }, 300);
        }
      }, 12000);

      // Strip the query param so refresh doesn't re-trigger
      if (window.history && window.history.replaceState) {
        var url = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, url);
      }
    } catch (err) {
      // Fail silently — banner is purely additive
    }
  }
  initBookedBanner();

})();
