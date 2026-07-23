(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

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
    }
  }

  var footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

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

  /* ---- Lightbox ---- */
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
    video.style.transition = 'opacity .6s ease';
    video.addEventListener('loadeddata', function () { video.style.opacity = '1'; });
  }

})();
