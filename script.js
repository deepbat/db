(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

<<<<<<< HEAD
  /* ==========================================================================
     Theme management (dark mode toggle)
     ========================================================================== */
  var themeToggle = document.getElementById('themeToggle');
  var themeIcon = document.getElementById('themeIcon');
  var root = document.documentElement;

  function getStoredTheme() {
    return localStorage.getItem('theme');
  }
  function setStoredTheme(theme) {
    localStorage.setItem('theme', theme);
  }
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle && themeIcon) {
      themeToggle.setAttribute('aria-pressed', theme === 'dark');
      themeIcon.textContent = theme === 'dark' ? '\u2600' : '\u263E';
    }
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#12110F' : '#FAFAF7');
    }
  }
  function initTheme() {
    var stored = getStoredTheme();
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);
  }
  initTheme();

  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      var current = root.getAttribute('data-theme') || 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      setStoredTheme(next);
    });
  }

  /* ==========================================================================
     Render gallery + skills from content.js (SITE_CONTENT)
     ========================================================================== */
=======
  /* ---- Loader ---- */
  var loader = document.getElementById('loader');
  var loaderFill = loader && loader.querySelector('.loader-fill');
  document.body.classList.add('is-loading');

  function finishLoader() {
    if (!loader) return;
    loader.classList.add('is-done');
    document.body.classList.remove('is-loading');
    document.querySelector('.hero') && document.querySelector('.hero').classList.add('is-ready');
  }

  if (loaderFill && !reduceMotion) {
    var progress = 0;
    var loadTimer = setInterval(function () {
      progress += Math.random() * 18 + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(loadTimer);
        setTimeout(finishLoader, 200);
      }
      loaderFill.style.width = progress + '%';
    }, 80);
    window.addEventListener('load', function () {
      clearInterval(loadTimer);
      loaderFill.style.width = '100%';
      setTimeout(finishLoader, 300);
    });
  } else {
    finishLoader();
  }

  /* ---- Ambient grid canvas ---- */
  var gridCanvas = document.getElementById('gridCanvas');
  if (gridCanvas && !reduceMotion) {
    var gctx = gridCanvas.getContext('2d');
    var mouse = { x: 0.5, y: 0.5 };

    function resizeGrid() {
      gridCanvas.width = window.innerWidth;
      gridCanvas.height = window.innerHeight;
    }
    resizeGrid();
    window.addEventListener('resize', resizeGrid);

    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    });

    function drawGrid() {
      if (!gctx) return;
      gctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
      var spacing = 48;
      var offsetX = (mouse.x - 0.5) * 20;
      var offsetY = (mouse.y - 0.5) * 20;
      gctx.strokeStyle = 'rgba(237,232,220,0.04)';
      gctx.lineWidth = 1;
      for (var x = offsetX % spacing; x < gridCanvas.width; x += spacing) {
        gctx.beginPath();
        gctx.moveTo(x, 0);
        gctx.lineTo(x, gridCanvas.height);
        gctx.stroke();
      }
      for (var y = offsetY % spacing; y < gridCanvas.height; y += spacing) {
        gctx.beginPath();
        gctx.moveTo(0, y);
        gctx.lineTo(gridCanvas.width, y);
        gctx.stroke();
      }
      requestAnimationFrame(drawGrid);
    }
    drawGrid();
  }

  /* ---- Render content from content.js ---- */
>>>>>>> 9680fa9dc3a77ecc5dca848cceade72956a7ad73
  if (typeof SITE_CONTENT !== 'undefined') {
    var skillsBento = document.getElementById('skillsBento');
    if (skillsBento && Array.isArray(SITE_CONTENT.skills)) {
      skillsBento.innerHTML = SITE_CONTENT.skills.map(function (skill) {
        var pct = Math.max(0, Math.min(100, skill.value));
        return '<article class="skill-card reveal" style="--pct:' + pct + '">' +
          '<div class="skill-ring" aria-hidden="true">' +
          '<svg viewBox="0 0 64 64"><circle class="track" cx="32" cy="32" r="26"/><circle class="fill" cx="32" cy="32" r="26"/></svg>' +
          '</div>' +
          '<h3>' + skill.name + '</h3>' +
          '<span class="skill-pct mono">' + pct + '%</span>' +
          '</article>';
      }).join('');
    }

<<<<<<< HEAD
    var skillsList = document.getElementById('skillsList');
    if (skillsList && Array.isArray(SITE_CONTENT.skills)) {
      skillsList.innerHTML = SITE_CONTENT.skills.map(function(skill) {
        var pct = Math.max(0, Math.min(100, skill.value));
        var offset = 110 - (110 * pct / 100);
        return '<div class="skill-row">' +
          '<h3>' + skill.name + '</h3>' +
          '<div class="skill-radial">' +
            '<div class="radial-gauge">' +
              '<svg viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<circle class="radial-bg" cx="21" cy="21" r="18" stroke-width="2"></circle>' +
                '<circle class="radial-fill" cx="21" cy="21" r="18" stroke-width="2" ' +
                  'stroke-dasharray="110" stroke-dashoffset="110" ' +
                  'data-pct="' + pct + '"></circle>' +
              '</svg>' +
              '<span class="radial-value mono">' + pct + '%</span>' +
            '</div>' +
          '</div>' +
          '<span class="pct mono">' + pct + '%</span>' +
          '</div>';
      }).join('');
=======
    var galleryGrid = document.getElementById('galleryGrid');
    var galleryMarquee = document.getElementById('galleryMarquee');
    if (Array.isArray(SITE_CONTENT.gallery)) {
      if (galleryGrid) {
        galleryGrid.innerHTML = SITE_CONTENT.gallery.map(function (item, i) {
          return '<a class="g-item" href="' + item.src + '.jpg" data-full="' + item.src + '.jpg" ' +
            'data-index="' + i + '" role="listitem" tabindex="0">' +
            '<picture><source srcset="' + item.src + '.webp" type="image/webp">' +
            '<img loading="lazy" src="' + item.src + '.jpg" alt="' + item.alt + '"></picture>' +
            '<span class="g-cap mono">' + item.alt + '</span></a>';
        }).join('');
      }
      if (galleryMarquee) {
        var marqueeItems = SITE_CONTENT.gallery.slice(0, 8).map(function (item) {
          return '<img loading="lazy" src="' + item.src + '.jpg" alt="" draggable="false">';
        }).join('');
        galleryMarquee.innerHTML = marqueeItems + marqueeItems;
      }
>>>>>>> 9680fa9dc3a77ecc5dca848cceade72956a7ad73
    }
  }

  var footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

<<<<<<< HEAD
  /* ==========================================================================
     Hero reveal — trigger accent underline animation on load
     ========================================================================== */
  var hero = document.querySelector('.hero');
  if (hero) {
    requestAnimationFrame(function() {
      hero.classList.add('revealed');
    });
  }

  /* ==========================================================================
     Mobile menu
     ========================================================================== */
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      var isOpen = mobileMenu.classList.toggle('open');
      menuToggle.classList.toggle('active', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
=======
  /* ---- Hero character split ---- */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var text = el.textContent;
    el.textContent = '';
    text.split('').forEach(function (ch, i) {
      var span = document.createElement('span');
      span.className = 'char';
      span.style.setProperty('--ci', i);
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      el.appendChild(span);
>>>>>>> 9680fa9dc3a77ecc5dca848cceade72956a7ad73
    });
  });

  /* ---- Block heading word split ---- */
  function splitBlock(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = '';
    words.forEach(function (w, i) {
      var wrap = document.createElement('span');
      wrap.className = 'split-word';
      wrap.style.setProperty('--i', i);
      var inner = document.createElement('span');
      inner.textContent = w + (i < words.length - 1 ? '\u00A0' : '');
      wrap.appendChild(inner);
      el.appendChild(wrap);
    });
  }
  document.querySelectorAll('[data-split-block]').forEach(splitBlock);

  /* ---- Theme toggle ---- */
  var themeBtn = document.getElementById('themeBtn');
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }
  function applyThemeMeta() {
    var light = currentTheme() === 'light';
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', String(light));
      themeBtn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    }
    if (metaTheme) metaTheme.setAttribute('content', light ? '#f4f1ea' : '#030306');
  }
  applyThemeMeta();
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'light' ? 'dark' : 'light';
      if (next === 'light') document.documentElement.setAttribute('data-theme', 'light');
      else document.documentElement.removeAttribute('data-theme');
      try { localStorage.setItem('theme', next); } catch (e) {}
      applyThemeMeta();
    });
  }

  /* ---- Mobile nav ---- */
  var navToggle = document.getElementById('navToggle');
  var navDrawer = document.getElementById('navDrawer');
  function closeDrawer() {
    if (!navDrawer) return;
    navDrawer.classList.remove('is-open');
    navDrawer.setAttribute('aria-hidden', 'true');
    navToggle && navToggle.classList.remove('is-active');
    navToggle && navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
  if (navToggle && navDrawer) {
    navToggle.addEventListener('click', function () {
      var open = navDrawer.classList.toggle('is-open');
      navDrawer.setAttribute('aria-hidden', String(!open));
      navToggle.classList.toggle('is-active', open);
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });
    navDrawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navDrawer.classList.contains('is-open')) {
        closeDrawer();
        navToggle.focus();
      }
    });
  }

  /* ---- Smooth anchor scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length <= 1) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeDrawer();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  var toTop = document.getElementById('toTop');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

<<<<<<< HEAD
  /* ==========================================================================
     Back to top button
     ========================================================================== */
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    function toggleBackToTop() {
      var scrolled = window.scrollY > 400;
      backToTop.classList.toggle('show', scrolled);
    }
    toggleBackToTop();
    window.addEventListener('scroll', toggleBackToTop);
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ==========================================================================
     Smooth scroll for anchor links
     ========================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var id = a.getAttribute('href');
      if (id.length > 1) {
        var el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
=======
  /* ---- Scroll rail + nav state ---- */
  var scrollRail = document.getElementById('scrollRail');
  var nav = document.getElementById('nav');
  function onScroll() {
    var scrollTop = window.scrollY;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docH > 0 ? (scrollTop / docH) * 100 : 0;
    if (scrollRail) scrollRail.style.height = pct + '%';
    if (nav) nav.classList.toggle('is-scrolled', scrollTop > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Intersection reveals ---- */
  var revealEls = document.querySelectorAll('.reveal, [data-split-block], .project-panel');
  if ('IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        if (entry.target.hasAttribute('data-split-block')) {
          entry.target.classList.add('split-in');
>>>>>>> 9680fa9dc3a77ecc5dca848cceade72956a7ad73
        }
        revealIO.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible', 'split-in');
    });
  }

  /* ---- Counter animation ---- */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = target === 99 ? '%' : '+';
    if (reduceMotion || !('IntersectionObserver' in window)) {
      el.textContent = target + suffix;
      return;
    }
    var counted = false;
    var counterIO = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || counted) return;
      counted = true;
      var start = performance.now();
      var duration = 1400;
      function tick(now) {
        var t = Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - t, 3);
        var val = Math.round(target * eased);
        el.textContent = val + (t >= 1 ? suffix : '');
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterIO.disconnect();
    }, { threshold: 0.5 });
    counterIO.observe(el);
  });

  /* ---- Nav scrollspy ---- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#navMenu a[href^="#"]'));
  var spyMap = navLinks.map(function (a) {
    var el = document.querySelector(a.getAttribute('href'));
    return el ? { link: a, el: el } : null;
  }).filter(Boolean);
  if (spyMap.length && 'IntersectionObserver' in window) {
    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var match = spyMap.filter(function (s) { return s.el === entry.target; })[0];
        if (!match) return;
        spyMap.forEach(function (s) { s.link.classList.remove('is-active'); });
        match.link.classList.add('is-active');
      });
    }, { threshold: 0, rootMargin: '-45% 0px -50% 0px' });
    spyMap.forEach(function (s) { spyIO.observe(s.el); });
  }

  /* ---- Experience track progress ---- */
  var expTrack = document.getElementById('expTrack');
  var expProgress = document.getElementById('expProgress');
  if (expTrack && expProgress) {
    expTrack.addEventListener('scroll', function () {
      var cards = expTrack.querySelectorAll('.exp-card');
      if (!cards.length) return;
      var scrollLeft = expTrack.scrollLeft;
      var idx = Math.round(scrollLeft / (cards[0].offsetWidth + 24)) + 1;
      expProgress.textContent = String(Math.min(cards.length, Math.max(1, idx))).padStart(2, '0');
    }, { passive: true });
  }

  /* ---- Project expand ---- */
  document.querySelectorAll('.project-expand').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = btn.closest('.project-panel');
      var open = panel.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close case study' : 'Read case study';
    });
  });

  /* ---- Skill card spotlight ---- */
  document.querySelectorAll('.skill-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  });

  /* ---- Contact form ---- */
  var contactForm = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = contactForm.querySelector('.form-submit');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      if (formStatus) { formStatus.textContent = ''; formStatus.className = 'form-status'; }

      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          if (formStatus) {
            formStatus.textContent = 'Message sent — thank you! I\u2019ll get back to you soon.';
            formStatus.className = 'form-status success';
          }
          contactForm.reset();
        } else throw new Error('fail');
      }).catch(function () {
        if (formStatus) {
          formStatus.textContent = 'Something went wrong. Please email deepak.batra@outlook.com directly.';
          formStatus.className = 'form-status error';
        }
      }).finally(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send message'; }
      });
    });
  }

<<<<<<< HEAD
  /* ==========================================================================
     Split text into words for scroll-triggered typography reveal
     ========================================================================== */
  function splitIntoWords(el) {
    var text = el.textContent;
    var words = text.split(/\s+/).filter(Boolean);
    el.innerHTML = '';
    var wrap = document.createElement('span');
    wrap.className = 'split-line';
    words.forEach(function(w, i) {
      var span = document.createElement('span');
      span.className = 'split-word';
      span.style.setProperty('--i', i);
      span.textContent = w + (i < words.length - 1 ? '\u00A0' : '');
      wrap.appendChild(span);
    });
    el.appendChild(wrap);
  }
  document.querySelectorAll('.split-heading').forEach(function(el){
    if (el.querySelector('.accent')) {
      el.classList.add('split-in');
      return;
    }
    splitIntoWords(el);
  });

  /* ==========================================================================
     Scroll reveal + radial gauge animation
     ========================================================================== */
  var revealEls = document.querySelectorAll('.reveal, .split-heading:not(.split-in)');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (entry.target.classList.contains('split-heading')) {
            entry.target.classList.add('split-in');
          }
          if (entry.target.id === 'skillsList') {
            entry.target.querySelectorAll('.radial-fill').forEach(function(fill) {
              var pct = fill.getAttribute('data-pct');
              var offset = 110 - (110 * pct / 100);
              requestAnimationFrame(function() {
                fill.style.strokeDashoffset = offset;
              });
            });
          }
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el) { io.observe(el); });
  } else {
    revealEls.forEach(function(el) { el.classList.add('visible', 'split-in'); });
    document.querySelectorAll('.radial-fill').forEach(function(fill) {
      var pct = fill.getAttribute('data-pct');
      var offset = 110 - (110 * pct / 100);
      fill.style.strokeDashoffset = offset;
    });
  }

  /* ==========================================================================
     Lightbox
     ========================================================================== */
=======
  /* ---- Lightbox ---- */
>>>>>>> 9680fa9dc3a77ecc5dca848cceade72956a7ad73
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbCounter = document.getElementById('lbCounter');
  var gItems = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
  var lbIndex = 0;
  var lbOpen = false;

  function openLb(i) {
    if (!lb || !lbImg || i < 0 || i >= gItems.length) return;
    lbIndex = i;
    lb.removeAttribute('hidden');
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    var src = gItems[i].dataset.full || gItems[i].href;
    lbImg.src = src;
    lbImg.alt = (gItems[i].querySelector('img') || {}).alt || 'Gallery image';
    document.body.style.overflow = 'hidden';
    lbOpen = true;
    if (lbCounter) lbCounter.textContent = (i + 1) + ' / ' + gItems.length;
    lbClose && lbClose.focus();
  }
  function closeLb() {
    if (!lb) return;
    lb.classList.remove('is-open');
    lbOpen = false;
    document.body.style.overflow = '';
    setTimeout(function () { lb.setAttribute('hidden', ''); }, 350);
    if (gItems[lbIndex]) gItems[lbIndex].focus();
  }
  function stepLb(d) {
    var next = (lbIndex + d + gItems.length) % gItems.length;
    lbImg.style.opacity = '0';
    setTimeout(function () { openLb(next); lbImg.style.opacity = '1'; }, 150);
  }

  if (lb && gItems.length) {
    gItems.forEach(function (item, i) {
      item.addEventListener('click', function (e) { e.preventDefault(); openLb(i); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); }
      });
    });
    lbClose && lbClose.addEventListener('click', closeLb);
    lbPrev && lbPrev.addEventListener('click', function () { stepLb(-1); });
    lbNext && lbNext.addEventListener('click', function () { stepLb(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lbOpen) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') stepLb(-1);
      if (e.key === 'ArrowRight') stepLb(1);
    });
    lbImg.style.transition = 'opacity .15s ease';
  }

<<<<<<< HEAD
  /* ==========================================================================
     Nav scrollspy
     ========================================================================== */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('#navLinks a[href^="#"]'));
  var spySections = navAnchors.map(function(a) {
    var id = a.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    return el ? { link: a, el: el } : null;
  }).filter(Boolean);
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

  /* ==========================================================================
     Custom cursor
     ========================================================================== */
  var cursorDot = document.getElementById('cursorDot');
  if (cursorDot && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', function(e) {
      cursorDot.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
    });
    document.querySelectorAll('a, button, .g-item').forEach(function(el) {
      el.addEventListener('mouseenter', function() { cursorDot.classList.add('hover'); });
      el.addEventListener('mouseleave', function() { cursorDot.classList.remove('hover'); });
    });
  } else if (cursorDot) {
    cursorDot.style.display = 'none';
  }

  /* ==========================================================================
     THE LEDGER GRID — WebGL hero background.
     A perspective grid recedes into the distance like ruled paper tilted
     away from the viewer; a soft red tracer follows the cursor along the
     nearest lines. Literalizes "I turn chaos into order." Degrades to the
     static CSS grid (set in style.css on .hero-canvas) if WebGL is
     unavailable, and freezes animation for reduced-motion.
     ========================================================================== */
  (function initHeroGrid() {
    var canvas = document.getElementById('heroGrid');
    if (!canvas) return;

    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    var vertSrc =
      'attribute vec2 aPos;' +
      'void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }';

    var fragSrc =
      'precision highp float;' +
      'uniform vec2 uRes;' +
      'uniform float uTime;' +
      'uniform vec2 uMouse;' +
      'uniform float uHasMouse;' +
      'uniform float uTheme;' +
      'void main(){' +
      '  vec2 uv = gl_FragCoord.xy / uRes.xy;' +
      '  vec2 p = (uv - 0.5) * vec2(uRes.x/uRes.y, 1.0);' +
      '  float persp = 1.0 / (uv.y * 1.7 + 0.32);' +
      '  vec2 gp = vec2(p.x * persp, persp * 0.62 - uTime);' +
      '  vec2 cellUv = gp / 0.9;' +
      '  vec2 gridF = abs(fract(cellUv - 0.5) - 0.5) / fwidth(cellUv);' +
      '  float line = min(gridF.x, gridF.y);' +
      '  float mask = 1.0 - clamp(line, 0.0, 1.0);' +
      '  float fadeTop = smoothstep(1.0, 0.32, uv.y);' +
      '  float fadeBottom = smoothstep(0.0, 0.12, uv.y);' +
      '  float fade = fadeTop * fadeBottom;' +
      '  vec2 mp = (uMouse - 0.5) * vec2(uRes.x/uRes.y, 1.0);' +
      '  float glow = uHasMouse * (1.0 - smoothstep(0.0, 0.42, distance(p, mp)));' +
      '  vec3 inkLight = vec3(0.067, 0.067, 0.063);' +
      '  vec3 inkDark = vec3(0.95, 0.945, 0.93);' +
      '  vec3 ink = mix(inkLight, inkDark, uTheme);' +
      '  vec3 red = vec3(0.910, 0.251, 0.165);' +
      '  vec3 color = mix(ink, red, glow * 0.85);' +
      '  float alpha = mask * fade * mix(0.10, 0.55, glow);' +
      '  gl_FragColor = vec4(color, alpha);' +
      '}';

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
      return s;
    }
    var vs = compile(gl.VERTEX_SHADER, vertSrc);
    var fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return;

    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(program, 'uRes');
    var uTime = gl.getUniformLocation(program, 'uTime');
    var uMouse = gl.getUniformLocation(program, 'uMouse');
    var uHasMouse = gl.getUniformLocation(program, 'uHasMouse');
    var uTheme = gl.getUniformLocation(program, 'uTheme');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var mouse = { x: 0.5, y: 0.35, has: 0 };

    function resize() {
      var rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    canvas.parentElement.addEventListener('pointermove', function(e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width;
      mouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
      mouse.has = 1;
    });
    canvas.parentElement.addEventListener('pointerleave', function() { mouse.has = 0; });

    var t0 = performance.now();
    function draw(now) {
      var t = reduceMotion ? 0 : (now - t0) / 1000 * 0.045;
      var theme = root.getAttribute('data-theme') === 'dark' ? 1 : 0;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uHasMouse, mouse.has);
      gl.uniform1f(uTheme, theme);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduceMotion) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();
=======
  /* ---- Custom cursor ---- */
  var cursor = document.getElementById('cursor');
  if (cursor && finePointer && !reduceMotion) {
    var ring = cursor.querySelector('.cursor-ring');
    var cx = 0, cy = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', function (e) {
      cx = e.clientX; cy = e.clientY;
      cursor.querySelector('.cursor-dot').style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
    });
    function animCursor() {
      rx += (cx - rx) * 0.15;
      ry += (cy - ry) * 0.15;
      if (ring) ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(animCursor);
    }
    animCursor();
    document.querySelectorAll('a, button, .g-item, .skill-card, .contact-link, .magnetic').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  /* ---- Magnetic buttons ---- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + (x * 0.18) + 'px,' + (y * 0.18) + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }
>>>>>>> 9680fa9dc3a77ecc5dca848cceade72956a7ad73

  /* ---- Hero orbit parallax ---- */
  var heroOrbit = document.querySelector('.hero-orbit');
  if (heroOrbit && !reduceMotion) {
    window.addEventListener('scroll', function () {
      if (window.innerWidth <= 960) {
        heroOrbit.style.transform = '';
        return;
      }
      var y = window.scrollY;
      heroOrbit.style.transform = 'translateY(calc(-50% + ' + (y * 0.12) + 'px)) rotate(' + (y * 0.02) + 'deg)';
    }, { passive: true });
  }

  /* ---- Showreel fade ---- */
  var video = document.getElementById('showreelVideo');
  if (video) {
    video.style.opacity = '0';
<<<<<<< HEAD
    video.style.transition = 'opacity .5s ease';
    video.addEventListener('loadeddata', function() {
      video.classList.add('loaded');
      video.style.opacity = '1';
    });
=======
    video.style.transition = 'opacity .6s ease';
    video.addEventListener('loadeddata', function () { video.style.opacity = '1'; });
>>>>>>> 9680fa9dc3a77ecc5dca848cceade72956a7ad73
  }

})();