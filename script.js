(function(){
  'use strict';

  /* --- Render gallery + skills from content.js (SITE_CONTENT) --- */
  /* This runs first so every later query for .g-item etc. finds them. */
  if (typeof SITE_CONTENT !== 'undefined') {
    var galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid && Array.isArray(SITE_CONTENT.gallery)) {
      var galleryHTML = SITE_CONTENT.gallery.map(function(item, i) {
        return '<a class="g-item" href="' + item.src + '.jpg" data-full="' + item.src + '.jpg" ' +
          'data-index="' + i + '" role="listitem" tabindex="0">' +
          '<picture><source srcset="' + item.src + '.webp" type="image/webp">' +
          '<img loading="lazy" src="' + item.src + '.jpg" alt="' + item.alt + '"></picture></a>';
      }).join('');
      galleryGrid.innerHTML = galleryHTML;
    }

    var skillsGrid = document.getElementById('skillsGrid');
    if (skillsGrid && Array.isArray(SITE_CONTENT.skills)) {
      var CIRC = 100; /* using pathLength="100" so dasharray is just the percentage */
      var skillsHTML = SITE_CONTENT.skills.map(function(skill) {
        var pct = Math.max(0, Math.min(100, skill.value));
        return '<div class="skill-gauge panel">' +
          '<svg viewBox="0 0 88 88" aria-hidden="true">' +
          '<circle class="ring-bg" cx="44" cy="44" r="38" pathLength="100"></circle>' +
          '<circle class="ring-fg" cx="44" cy="44" r="38" pathLength="100" ' +
          'style="stroke-dasharray:' + pct + ' ' + CIRC + '"></circle>' +
          '</svg>' +
          '<span class="pct mono">' + pct + '%</span>' +
          '<h3>' + skill.name + '</h3>' +
          '</div>';
      }).join('');
      skillsGrid.innerHTML = skillsHTML;
    }
  }

  var header = document.getElementById('siteHeader');
  var menuToggle = document.getElementById('menuToggle');
  var navLinks = document.getElementById('navLinks');
  var toTop = document.getElementById('toTop');
  var footerYear = document.getElementById('footerYear');

  if (footerYear) footerYear.textContent = new Date().getFullYear();

  /* --- Theme toggle (dark is the default theme; light is opt-in) --- */
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    function currentTheme() {
      return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    }
    function applyThemeLabel() {
      var isLight = currentTheme() === 'light';
      themeToggle.setAttribute('aria-pressed', String(isLight));
      themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    }
    applyThemeLabel();
    themeToggle.addEventListener('click', function() {
      var next = currentTheme() === 'light' ? 'dark' : 'light';
      if (next === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      try { localStorage.setItem('theme', next); } catch (e) {}
      applyThemeLabel();
    });
  }

  /* --- Project card expand/collapse --- */
  document.querySelectorAll('.proj-toggle').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var more = btn.nextElementSibling;
      if (!more || !more.classList.contains('proj-more')) return;
      var isOpen = more.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
      btn.innerHTML = isOpen ? 'Show less &larr;' : 'Learn more &rarr;';
    });
  });

  /* --- Contact form (AJAX submit, stays on page) --- */
  var contactForm = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var submitBtn = contactForm.querySelector('.form-submit');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
      if (formStatus) { formStatus.textContent = ''; formStatus.className = 'form-status'; }

      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      }).then(function(res) {
        if (res.ok) {
          if (formStatus) {
            formStatus.textContent = 'Message sent \u2014 thank you! I\u2019ll get back to you soon.';
            formStatus.className = 'form-status success';
          }
          contactForm.reset();
        } else {
          throw new Error('Request failed');
        }
      }).catch(function() {
        if (formStatus) {
          formStatus.textContent = 'Something went wrong. Please try emailing deepak.batra@outlook.com directly.';
          formStatus.className = 'form-status error';
        }
      }).finally(function() {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send message'; }
      });
    });
  }

  if (!header || !menuToggle || !navLinks) return;

  /* --- Mobile menu toggle --- */
  menuToggle.addEventListener('click', function() {
    var isOpen = navLinks.classList.toggle('open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      var firstLink = navLinks.querySelector('a');
      if (firstLink) firstLink.focus();
    } else {
      document.body.style.overflow = '';
    }
  });

  navLinks.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() {
      navLinks.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* Close mobile menu on Escape */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      menuToggle.focus();
    }
  });
  navLinks.addEventListener('keydown', function(e) {
    if (!navLinks.classList.contains('open')) return;
    var links = Array.prototype.slice.call(navLinks.querySelectorAll('a'));
    if (links.length === 0) return;
    var first = links[0];
    var last = links[links.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* --- Back-to-top visibility --- */
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        if (toTop) {
          toTop.style.opacity = window.scrollY > 500 ? '1' : '.85';
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* --- Back to top --- */
  if (toTop) {
    toTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --- Smooth scroll for anchor links --- */
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var id = a.getAttribute('href');
      if (id.length > 1) {
        var el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.setAttribute('tabindex', '-1');
          el.addEventListener('blur', function() { el.removeAttribute('tabindex'); });
          el.focus();
        }
      }
    });
  });

  /* --- Scroll reveal --- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el) { io.observe(el); });
  } else {
    revealEls.forEach(function(el) { el.classList.add('visible'); });
  }

  /* --- Lightbox --- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbCounter = document.getElementById('lbCounter');
  var gItems = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
  var current = 0;
  var lbOpen = false;

  if (lb && lbImg && gItems.length > 0) {

    function openLightbox(i) {
      if (i < 0 || i >= gItems.length) return;
      current = i;
      var img = gItems[i].querySelector('img');
      var fullSrc = gItems[i].dataset.full || gItems[i].href;
      var altText = img ? img.alt : 'Gallery image ' + (i + 1);
      lbImg.src = fullSrc;
      lbImg.alt = altText;
      lb.classList.add('open');
      lbOpen = true;
      document.body.style.overflow = 'hidden';
      if (lbCounter) lbCounter.textContent = (i + 1) + ' / ' + gItems.length;
      lbClose.focus();
    }

    function closeLightbox() {
      lb.classList.remove('open');
      lbOpen = false;
      document.body.style.overflow = '';
      if (gItems[current]) gItems[current].focus();
    }

    function step(d) {
      var next = (current + d + gItems.length) % gItems.length;
      lbImg.style.opacity = '0';
      setTimeout(function() {
        openLightbox(next);
        lbImg.style.opacity = '1';
      }, 150);
    }

    gItems.forEach(function(it, i) {
      it.addEventListener('click', function(e) {
        e.preventDefault();
        openLightbox(i);
      });
      it.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(i);
        }
      });
    });

    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbPrev) lbPrev.addEventListener('click', function() { step(-1); });
    if (lbNext) lbNext.addEventListener('click', function() { step(1); });
    if (lb) lb.addEventListener('click', function(e) { if (e.target === lb) closeLightbox(); });

    document.addEventListener('keydown', function(e) {
      if (!lbOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });

    /* Swipe support for lightbox */
    var touchStartX = 0;
    var touchEndX = 0;
    lb.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lb.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) step(1);
        else step(-1);
      }
    }, { passive: true });

    lbImg.style.transition = 'opacity .15s ease';
  }

  /* --- Video lazy init --- */
  var video = document.getElementById('showreelVideo');
  if (video) {
    video.addEventListener('loadeddata', function() {
      video.style.opacity = '1';
    });
    video.style.opacity = '0';
    video.style.transition = 'opacity .5s ease';
  }

  /* --- Rail nav active-tab scrollspy --- */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('#navLinks a[href^="#"]'));
  var spySections = navAnchors
    .map(function(a) {
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      return el ? { link: a, el: el } : null;
    })
    .filter(Boolean);

  if (spySections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var match = spySections.filter(function(s) { return s.el === entry.target; })[0];
        if (!match) return;
        if (entry.isIntersecting) {
          spySections.forEach(function(s) { s.link.classList.remove('is-active'); });
          match.link.classList.add('is-active');
        }
      });
    }, { threshold: 0, rootMargin: '-45% 0px -50% 0px' });
    spySections.forEach(function(s) { spy.observe(s.el); });
  }

})();
