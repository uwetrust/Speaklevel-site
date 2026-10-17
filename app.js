/* =============================================
   SPEAKLEVEL — app.js
   ============================================= */

(function () {
  'use strict';

  /* ----- Dark Mode Toggle ----- */
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);
  updateToggleIcon();

  if (toggle) {
    toggle.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
      updateToggleIcon();
    });
  }

  function updateToggleIcon() {
    if (!toggle) return;
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

  /* ----- Hero Gauge Animation (on load) ----- */
  window.addEventListener('load', function () {
    var heroArc = document.querySelector('.hero-gauge-arc');
    if (heroArc) {
      // Score 115 of 160 = 71.875% fill, dashoffset = 534 - (534 * 0.71875) = ~150
      heroArc.style.strokeDashoffset = '534'; // start fully empty
      setTimeout(function () {
        heroArc.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1)';
        heroArc.style.strokeDashoffset = '150';
      }, 400);
    }
  });

  /* ----- Score Tool ----- */
  var scoreBtn = document.getElementById('score-btn');
  var scoreInput = document.getElementById('score-input');
  var scoreResult = document.getElementById('score-result');

  if (scoreBtn && scoreInput && scoreResult) {
    scoreBtn.addEventListener('click', checkScore);
    scoreInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') checkScore();
    });
  }

  function checkScore() {
    var value = parseInt(scoreInput.value, 10);
    if (isNaN(value) || value < 10 || value > 160) {
      scoreResult.style.display = 'block';
      scoreResult.innerHTML = '<div class="score-result-card" style="text-align:center"><p style="color:var(--color-text-muted)">Please enter a valid score between 10 and 160.</p></div>';
      return;
    }

    var level = getLevel(value);
    var pct = Math.round(((value - 10) / 150) * 100);
    var arcColor = value >= 105 ? 'var(--color-primary)' : value >= 85 ? 'var(--color-amber)' : '#B0AFA8';

    var html = '<div class="score-result-card">';
    // Animated circle gauge
    html += '<div class="score-gauge">';
    html += '<svg viewBox="0 0 200 200" class="gauge-svg">';
    html += '<circle cx="100" cy="100" r="85" fill="none" stroke="var(--color-border)" stroke-width="12" opacity="0.3" />';
    html += '<circle cx="100" cy="100" r="85" fill="none" stroke="' + arcColor + '" stroke-width="12" ';
    html += 'stroke-linecap="round" stroke-dasharray="534" stroke-dashoffset="534" ';
    html += 'transform="rotate(-90 100 100)" class="gauge-arc" />';
    html += '</svg>';
    html += '<div class="gauge-center">';
    html += '<span class="gauge-score">' + value + '</span>';
    html += '<span class="gauge-out-of">/160</span>';
    html += '</div>';
    html += '</div>';

    html += '<span class="score-badge ' + level.badge + '">' + level.name + '</span>';
    html += '<p class="score-result-level">' + level.label + '</p>';
    html += '<p class="score-result-desc">' + level.desc + '</p>';

    if (value >= 85) {
      html += '<div class="score-next-step">';
      html += '<p>Your Plan Is the Map. The Kit Is the Toolkit.</p>';
      html += '<a href="./kit.html" class="btn btn--amber">Get the Kit — A$97</a>';
      html += '</div>';
    } else if (value >= 70) {
      html += '<div class="score-next-step-gentle">';
      html += '<p>Before the Kit, a personalised plan will make the biggest difference at your level.</p>';
      html += '<a href="https://calendly.com/hello-speaklevel/job-readiness-audit" target="_blank" rel="noopener noreferrer" class="btn btn--primary">Book Free Job-Readiness Audit</a>';
      html += '</div>';
    } else {
      html += '<div class="score-next-step-foundations">';
      html += '<p class="foundations-heading">Build Your Foundation First</p>';
      html += '<p>At this level, the most effective next step is building a strong English base. Start with our Foundations Guide — 50 essential phrases, a 30-day plan, and free resources, all in one place.</p>';
      html += '<div class="foundations-kit-cta">';
      html += '<div class="foundations-kit-badge">NEW</div>';
      html += '<div class="foundations-kit-text">';
      html += '<p class="foundations-kit-title">English Foundations Guide</p>';
      html += '<p class="foundations-kit-desc">50 phrases &middot; 30-day plan &middot; Aussie cultural tips &middot; Free resource list</p>';
      html += '</div>';
      html += '<a href="https://payhip.com/b/gx4bk" target="_blank" rel="noopener noreferrer" class="btn btn--amber foundations-kit-btn">Get the Guide &mdash; A$9</a>';
      html += '</div>';
      html += '<p class="foundations-free-label">Or use these free programs while you build:</p>';
      html += '<ul class="free-resources-list">';
      html += '<li><strong>AMEP</strong> — Free English classes for eligible migrants (up to 510 hours)</li>';
      html += '<li><strong>TAFE NSW</strong> — Free and subsidised English courses across Western Sydney</li>';
      html += '<li><strong>AMES Australia</strong> — Settlement English programs and support services</li>';
      html += '<li><strong>Anglicare</strong> — Community support services including English conversation programs</li>';
      html += '</ul>';
      html += '<p class="foundations-or">Want a personalised plan?</p>';
      html += '<a href="https://calendly.com/hello-speaklevel/job-readiness-audit" target="_blank" rel="noopener noreferrer" class="btn btn--outline">Book Free Job-Readiness Audit</a>';
      html += '</div>';
    }

    html += '</div>';
    scoreResult.style.display = 'block';
    scoreResult.innerHTML = html;

    // Animate the gauge arc
    setTimeout(function() {
      var arc = scoreResult.querySelector('.gauge-arc');
      if (arc) {
        var target = 534 - (534 * pct / 100);
        arc.style.transition = 'stroke-dashoffset 1.2s ease-out';
        arc.style.strokeDashoffset = target;
      }
    }, 50);
  }

  function getLevel(score) {
    if (score >= 145) {
      return {
        name: 'Advanced',
        label: 'Score ' + score + ' — Advanced',
        badge: 'score-badge--teal',
        desc: 'You\'re near-native level. At this score, you can handle virtually any workplace conversation in Australia. Your focus should be on fine-tuning interview technique, leadership communication, and the subtle cultural nuances that distinguish a confident professional from someone who is simply fluent.'
      };
    } else if (score >= 125) {
      return {
        name: 'Upper-Intermediate',
        label: 'Score ' + score + ' — Upper-Intermediate',
        badge: 'score-badge--teal',
        desc: 'You have a strong English foundation. You can communicate clearly in most workplace scenarios. The next step is mastering Australian workplace culture — the slang, the indirect communication style, the unwritten rules. The Employment Readiness Kit is designed to bridge that gap.'
      };
    } else if (score >= 105) {
      return {
        name: 'Intermediate',
        label: 'Score ' + score + ' — Intermediate',
        badge: 'score-badge--teal',
        desc: 'You\'re in the job-ready range. This is the ideal starting point for the Employment Readiness Kit. You have enough English to work, but you need practical tools to handle real Australian workplace situations — interviews, team meetings, phone calls, and professional emails.'
      };
    } else if (score >= 85) {
      return {
        name: 'Pre-Intermediate',
        label: 'Score ' + score + ' — Pre-Intermediate',
        badge: 'score-badge--amber',
        desc: 'You can communicate in English, but interviews and fast-paced meetings are still challenging. The Kit will give you scripts and frameworks to build confidence in real workplace scenarios. Consider pairing it with a coaching session for faster progress.'
      };
    } else if (score >= 65) {
      return {
        name: 'Elementary',
        label: 'Score ' + score + ' — Elementary',
        badge: 'score-badge--grey',
        desc: 'Good start. You can handle simple workplace conversations. Before investing in the Kit, we recommend a free Score Audit to build a personalised plan that fits where you are right now.'
      };
    } else {
      return {
        name: 'Foundational',
        label: 'Score ' + score + ' — Foundational',
        badge: 'score-badge--grey',
        desc: 'You\'re at the start of your English journey. Before the Employment Kit, you need to build a stronger foundation. The good news: Australia has excellent free programs designed for exactly where you are.'
      };
    }
  }

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
