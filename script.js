(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---- Preloader ---- */
  var preloader = document.getElementById('preloader');
  var preloaderCount = document.getElementById('preloaderCount');
  var preloaderBar = document.getElementById('preloaderBar');
  document.body.classList.add('is-loading');

  function endPreloader() {
    if (!preloader) return;
    preloader.classList.add('is-done');
    document.body.classList.remove('is-loading');
    document.querySelector('.fx-hero') && document.querySelector('.fx-hero').classList.add('is-ready');
  }

  if (preloader && !reduceMotion) {
    var p = 0;
    var pt = setInterval(function () {
      p += Math.random() * 12 + 6;
      if (p >= 100) {
        p = 100;
        clearInterval(pt);
        if (preloaderCount) preloaderCount.textContent = p;
        if (preloaderBar) preloaderBar.style.width = p + '%';
        setTimeout(endPreloader, 350);
      } else {
        if (preloaderCount) preloaderCount.textContent = Math.floor(p);
        if (preloaderBar) preloaderBar.style.width = p + '%';
      }
    }, 60);
    window.addEventListener('load', function () {
      clearInterval(pt);
      if (preloaderCount) preloaderCount.textContent = '100';
      if (preloaderBar) preloaderBar.style.width = '100%';
      setTimeout(endPreloader, 400);
    });
  } else {
    endPreloader();
  }

  /* ---- Film grain canvas ---- */
  var noiseCanvas = document.getElementById('noiseCanvas');
  if (noiseCanvas && !reduceMotion) {
    var nctx = noiseCanvas.getContext('2d');
    function resizeNoise() {
      noiseCanvas.width = window.innerWidth >> 1;
      noiseCanvas.height = window.innerHeight >> 1;
    }
    resizeNoise();
    window.addEventListener('resize', resizeNoise);
    (function grainLoop() {
      if (!nctx) return;
      var w = noiseCanvas.width, h = noiseCanvas.height;
      var img = nctx.createImageData(w, h);
      var d = img.data;
      for (var i = 0; i < d.length; i += 4) {
        var v = Math.random() * 255 | 0;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 28;
      }
      nctx.putImageData(img, 0, 0);
      requestAnimationFrame(grainLoop);
    })();
  }

  /* ---- Theme ---- */
  (function () {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    var root = document.documentElement;
    function reflect() {
      var light = root.getAttribute('data-theme') === 'light';
      btn.setAttribute('aria-pressed', String(light));
      btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    }
    reflect();
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      if (next === 'light') root.setAttribute('data-theme', 'light');
      else root.removeAttribute('data-theme');
      try { localStorage.setItem('db-theme', next); } catch (e) {}
      reflect();
    });
  })();

  /* ---- Mobile menu ---- */
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuToggle && menuToggle.classList.remove('is-active');
    menuToggle && menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('is-open');
      mobileMenu.setAttribute('aria-hidden', String(!open));
      menuToggle.classList.toggle('is-active', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) { closeMenu(); menuToggle.focus(); }
    });
  }

  /* ---- Typography splits ---- */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var text = el.textContent;
    el.textContent = '';
    text.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.className = 'fx-char';
      s.style.setProperty('--ci', i);
      s.textContent = ch;
      el.appendChild(s);
    });
  });

  document.querySelectorAll('[data-words]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var wrap = document.createElement('span');
      wrap.className = 'fx-word';
      wrap.style.setProperty('--wi', i);
      var inner = document.createElement('span');
      inner.className = 'fx-word-inner';
      inner.textContent = w + (i < words.length - 1 ? '\u00A0' : '');
      wrap.appendChild(inner);
      el.appendChild(wrap);
    });
  });

  /* ---- Render content.js ---- */
  if (typeof SITE_CONTENT !== 'undefined') {
    var skillsList = document.getElementById('skillsList');
    if (skillsList && Array.isArray(SITE_CONTENT.skills)) {
      skillsList.innerHTML = SITE_CONTENT.skills.map(function (sk) {
        var pct = Math.max(0, Math.min(100, sk.value));
        return '<article class="fx-skill fx-reveal" data-value="' + pct + '" style="--pct:' + pct + '%">' +
          '<h3>' + sk.name + '</h3>' +
          '<div class="fx-skill-bar"><span></span></div>' +
          '<em class="mono">' + pct + '% proficiency</em></article>';
      }).join('');
    }

    var filmstrip = document.getElementById('filmstrip');
    var galleryGrid = document.getElementById('galleryGrid');
    if (Array.isArray(SITE_CONTENT.gallery)) {
      if (filmstrip) {
        filmstrip.innerHTML = SITE_CONTENT.gallery.map(function (item, i) {
          return '<a class="fx-film-item" href="' + item.src + '.jpg" data-full="' + item.src + '.jpg" data-index="' + i + '" role="listitem">' +
            '<picture><source srcset="' + item.src + '.webp" type="image/webp">' +
            '<img loading="lazy" src="' + item.src + '.jpg" alt="' + item.alt + '" draggable="false"></picture></a>';
        }).join('');
      }
      if (galleryGrid) {
        galleryGrid.innerHTML = SITE_CONTENT.gallery.map(function (item, i) {
          return '<a class="g-item" href="' + item.src + '.jpg" data-full="' + item.src + '.jpg" data-index="' + i + '" role="listitem" tabindex="0">' +
            '<picture><source srcset="' + item.src + '.webp" type="image/webp">' +
            '<img loading="lazy" src="' + item.src + '.jpg" alt="' + item.alt + '"></picture>' +
            '<span class="g-cap mono">' + item.alt + '</span></a>';
        }).join('');
      }
    }
  }

  var footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  /* ---- Anchor scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length <= 1) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      closeMenu();
      t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  var toTop = document.getElementById('toTop');
  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---- Scroll progress + chapters ---- */
  var scrollProgress = document.getElementById('scrollProgress');
  var chapterActive = document.getElementById('chapterActive');
  var fxNav = document.getElementById('fxNav');
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-chapter]'));

  function onScroll() {
    var st = window.scrollY;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollProgress) scrollProgress.style.width = (docH > 0 ? (st / docH) * 100 : 0) + '%';
    if (fxNav) fxNav.classList.toggle('is-scrolled', st > 32);

    if (chapterActive && sections.length) {
      var current = sections[0];
      sections.forEach(function (sec) {
        if (sec.getBoundingClientRect().top <= window.innerHeight * 0.45) current = sec;
      });
      chapterActive.textContent = current.getAttribute('data-chapter') || '00';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Reveals ---- */
  var revealEls = document.querySelectorAll('.fx-reveal, [data-words]');
  if ('IntersectionObserver' in window) {
    var rIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        if (en.target.hasAttribute('data-words')) en.target.classList.add('fx-words-in');
        rIO.unobserve(en.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { rIO.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in', 'fx-words-in'); });
  }

  /* ---- Stat counters ---- */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '+';
    if (reduceMotion || !('IntersectionObserver' in window)) {
      el.textContent = target + suffix;
      return;
    }
    var done = false;
    var cIO = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || done) return;
      done = true;
      var start = performance.now();
      (function tick(now) {
        var t = Math.min(1, (now - start) / 1400);
        var eased = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(target * eased) + (t >= 1 ? suffix : '');
        if (t < 1) requestAnimationFrame(tick);
      })(start);
      cIO.disconnect();
    }, { threshold: 0.5 });
    cIO.observe(el);
  });

  /* ---- Nav spy ---- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#fxNavLinks a[href^="#"]'));
  var spyMap = navLinks.map(function (a) {
    var el = document.querySelector(a.getAttribute('href'));
    return el ? { link: a, el: el } : null;
  }).filter(Boolean);
  if (spyMap.length && 'IntersectionObserver' in window) {
    var sIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var m = spyMap.filter(function (s) { return s.el === en.target; })[0];
        if (!m) return;
        spyMap.forEach(function (s) { s.link.classList.remove('is-active'); });
        m.link.classList.add('is-active');
      });
    }, { threshold: 0, rootMargin: '-45% 0px -50% 0px' });
    spyMap.forEach(function (s) { sIO.observe(s.el); });
  }

  /* ---- Pinned horizontal experience ---- */
  var expPin = document.getElementById('expPin');
  var expTrack = document.getElementById('expTrack');
  var expHint = document.getElementById('expHint');

  function updateExpPin() {
    if (!expPin || !expTrack || window.innerWidth <= 768) {
      if (expTrack) expTrack.style.transform = '';
      return;
    }
    var rect = expPin.getBoundingClientRect();
    var total = expPin.offsetHeight - window.innerHeight;
    var progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
    var maxX = expTrack.scrollWidth - window.innerWidth + 48;
    expTrack.style.transform = 'translate3d(' + (-progress * maxX) + 'px,0,0)';
    if (expHint) expHint.textContent = 'Chapter ' + String(Math.ceil(progress * 4) || 1).padStart(2, '0') + ' / 04';
  }
  window.addEventListener('scroll', updateExpPin, { passive: true });
  window.addEventListener('resize', updateExpPin);
  updateExpPin();

  /* ---- Sticky work stack depth ---- */
  var workCards = Array.prototype.slice.call(document.querySelectorAll('.fx-work-card'));
  function updateWorkStack() {
    if (window.innerWidth <= 860) {
      workCards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; });
      return;
    }
    workCards.forEach(function (card, i) {
      var next = workCards[i + 1];
      if (!next) { card.style.transform = ''; card.style.filter = ''; return; }
      var rect = next.getBoundingClientRect();
      var navOffset = 96;
      var overlap = navOffset + 40 - rect.top;
      if (overlap > 0) {
        var scale = Math.max(0.88, 1 - overlap * 0.0008);
        var blur = Math.min(4, overlap * 0.015);
        card.style.transform = 'scale(' + scale + ')';
        card.style.filter = 'brightness(' + Math.max(0.6, 1 - overlap * 0.0015) + ') blur(' + blur + 'px)';
      } else {
        card.style.transform = '';
        card.style.filter = '';
      }
    });
  }
  window.addEventListener('scroll', updateWorkStack, { passive: true });
  window.addEventListener('resize', updateWorkStack);
  updateWorkStack();

  /* ---- Work toggle ---- */
  document.querySelectorAll('.fx-work-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.fx-work-card');
      var open = card.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close case study' : 'Read case study';
    });
  });

  /* ---- Showreel custom play ---- */
  var reelScreen = document.getElementById('reelScreen');
  var reelPlay = document.getElementById('reelPlay');
  var video = document.getElementById('showreelVideo');
  if (reelPlay && video && reelScreen) {
    reelPlay.addEventListener('click', function () {
      reelScreen.classList.add('is-playing');
      video.setAttribute('controls', '');
      video.play();
    });
    video.addEventListener('pause', function () {
      if (video.currentTime < video.duration - 0.5) reelScreen.classList.remove('is-playing');
    });
    video.addEventListener('ended', function () { reelScreen.classList.remove('is-playing'); });
  }

  /* ---- Filmstrip drag scroll ---- */
  var filmstrip = document.getElementById('filmstrip');
  if (filmstrip) {
    var dragging = false, startX = 0, scrollL = 0;
    filmstrip.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a')) return;
      dragging = true;
      startX = e.clientX;
      scrollL = filmstrip.scrollLeft;
      filmstrip.classList.add('is-dragging');
      filmstrip.setPointerCapture(e.pointerId);
    });
    filmstrip.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      filmstrip.scrollLeft = scrollL - (e.clientX - startX);
    });
    function endDrag() { dragging = false; filmstrip.classList.remove('is-dragging'); }
    filmstrip.addEventListener('pointerup', endDrag);
    filmstrip.addEventListener('pointercancel', endDrag);
  }

  /* ---- Contact form ---- */
  var contactForm = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = contactForm.querySelector('.form-submit');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      if (formStatus) { formStatus.textContent = ''; formStatus.className = 'fx-form-status'; }
      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          if (formStatus) { formStatus.textContent = 'Message sent — thank you!'; formStatus.className = 'fx-form-status ok'; }
          contactForm.reset();
        } else throw new Error();
      }).catch(function () {
        if (formStatus) { formStatus.textContent = 'Something went wrong. Email deepak.batra@outlook.com directly.'; formStatus.className = 'fx-form-status err'; }
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Send message'; }
      });
    });
  }

  /* ---- Lightbox ---- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbCounter = document.getElementById('lbCounter');
  var gItems = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
  var lbIdx = 0, lbOpen = false;

  function openLb(i) {
    if (!lb || !lbImg || i < 0 || i >= gItems.length) return;
    lbIdx = i;
    lb.removeAttribute('hidden');
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    lbImg.src = gItems[i].dataset.full || gItems[i].href;
    lbImg.alt = (gItems[i].querySelector('img') || {}).alt || 'Gallery';
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
  }
  function stepLb(d) {
    var n = (lbIdx + d + gItems.length) % gItems.length;
    lbImg.style.opacity = '0';
    setTimeout(function () { openLb(n); lbImg.style.opacity = '1'; }, 120);
  }
  if (lb && gItems.length) {
    gItems.forEach(function (it, i) {
      it.addEventListener('click', function (e) { e.preventDefault(); openLb(i); });
    });
    if (filmstrip) {
      filmstrip.querySelectorAll('.fx-film-item').forEach(function (it) {
        it.addEventListener('click', function (e) {
          e.preventDefault();
          var idx = parseInt(it.getAttribute('data-index'), 10);
          if (!isNaN(idx)) openLb(idx);
        });
      });
    }
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
    lbImg.style.transition = 'opacity .12s ease';
  }

  /* ---- Cursor with labels ---- */
  var fxCursor = document.getElementById('fxCursor');
  var cursorLabel = document.getElementById('cursorLabel');
  if (fxCursor && finePointer && !reduceMotion) {
    var cx = 0, cy = 0;
    window.addEventListener('mousemove', function (e) {
      cx = e.clientX; cy = e.clientY;
      fxCursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
    });
    document.querySelectorAll('[data-cursor], a, button, .g-item, .fx-film-item, .fx-contact-links a').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        var label = el.getAttribute('data-cursor') || (el.tagName === 'A' ? 'View' : el.tagName === 'BUTTON' ? 'Click' : '');
        if (label && cursorLabel) cursorLabel.textContent = label;
        fxCursor.classList.toggle('has-label', !!label);
      });
      el.addEventListener('mouseleave', function () {
        fxCursor.classList.remove('has-label');
        if (cursorLabel) cursorLabel.textContent = '';
      });
    });
  } else if (fxCursor) {
    fxCursor.style.display = 'none';
  }

  /* ---- Hero parallax on scroll ---- */
  var heroVisual = document.querySelector('.fx-hero-visual');
  if (heroVisual && !reduceMotion) {
    window.addEventListener('scroll', function () {
      var y = Math.min(window.scrollY, window.innerHeight);
      heroVisual.style.transform = 'translateY(' + (y * 0.18) + 'px)';
    }, { passive: true });
  }

})();
