(function(){
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     Render gallery + skills from content.js (SITE_CONTENT)
     ========================================================================== */
  if (typeof SITE_CONTENT !== 'undefined') {
    var galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid && Array.isArray(SITE_CONTENT.gallery)) {
      galleryGrid.innerHTML = SITE_CONTENT.gallery.map(function(item, i) {
        return '<a class="g-item" href="' + item.src + '.jpg" data-full="' + item.src + '.jpg" ' +
          'data-index="' + i + '" role="listitem" tabindex="0">' +
          '<picture><source srcset="' + item.src + '.webp" type="image/webp">' +
          '<img loading="lazy" src="' + item.src + '.jpg" alt="' + item.alt + '"></picture>' +
          '<span class="g-cap mono">' + item.alt + '</span>' +
          '</a>';
      }).join('');
    }

    var skillsList = document.getElementById('skillsList');
    if (skillsList && Array.isArray(SITE_CONTENT.skills)) {
      skillsList.innerHTML = SITE_CONTENT.skills.map(function(skill) {
        var pct = Math.max(0, Math.min(100, skill.value));
        return '<div class="skill-row">' +
          '<h3>' + skill.name + '</h3>' +
          '<div class="skill-track"><div class="skill-fill" data-pct="' + pct + '"></div></div>' +
          '<span class="pct mono">' + pct + '%</span>' +
          '</div>';
      }).join('');
    }
  }

  var footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

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
    });
    mobileMenu.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        mobileMenu.classList.remove('open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        menuToggle.focus();
      }
    });
  }

  var toTop = document.getElementById('toTop');
  if (toTop) {
    toTop.addEventListener('click', function() {
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
        }
      }
    });
  });

  /* ==========================================================================
     Project card expand/collapse
     ========================================================================== */
  document.querySelectorAll('.proj-toggle').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var more = btn.nextElementSibling;
      if (!more || !more.classList.contains('proj-more')) return;
      var isOpen = more.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
      btn.innerHTML = isOpen ? 'Show less &larr;' : 'Learn more &rarr;';
    });
  });

  /* ==========================================================================
     Contact form (AJAX submit, stays on page)
     ========================================================================== */
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
    // hero h1 contains inline markup (accent span) — split only plain-text headings
    if (el.querySelector('.accent')) { el.classList.add('split-in'); return; }
    splitIntoWords(el);
  });

  /* ==========================================================================
     Scroll reveal + skill liquid-fill bars
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
            entry.target.querySelectorAll('.skill-fill').forEach(function(fill) {
              var pct = fill.getAttribute('data-pct');
              requestAnimationFrame(function() { fill.style.width = pct + '%'; });
            });
          }
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el) { io.observe(el); });
  } else {
    revealEls.forEach(function(el) { el.classList.add('visible', 'split-in'); });
    document.querySelectorAll('.skill-fill').forEach(function(fill) { fill.style.width = fill.getAttribute('data-pct') + '%'; });
  }

  /* ==========================================================================
     Lightbox
     ========================================================================== */
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
      lbImg.src = fullSrc;
      lbImg.alt = img ? img.alt : 'Gallery image ' + (i + 1);
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
      setTimeout(function() { openLightbox(next); lbImg.style.opacity = '1'; }, 150);
    }
    gItems.forEach(function(it, i) {
      it.addEventListener('click', function(e) { e.preventDefault(); openLightbox(i); });
      it.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
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
    lbImg.style.transition = 'opacity .15s ease';
  }

  /* ==========================================================================
     Nav scrollspy + glass bar strengthening on scroll
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
    document.querySelectorAll('a, button, .g-item, .dot').forEach(function(el) {
      el.addEventListener('mouseenter', function() { cursorDot.classList.add('hover'); });
      el.addEventListener('mouseleave', function() { cursorDot.classList.remove('hover'); });
    });
  } else if (cursorDot) {
    cursorDot.style.display = 'none';
  }

  /* ==========================================================================
     THE MIXER — interactive draggable blob (blobmixer-inspired)
     ========================================================================== */
  var mixer = document.getElementById('mixer');
  if (mixer) {
    var blobMain = document.getElementById('blobMain');
    var blobSheen = document.getElementById('blobSheen');
    var sats = [document.getElementById('sat1'), document.getElementById('sat2'), document.getElementById('sat3')];
    var dots = {
      coral: document.getElementById('dotCoral'),
      violet: document.getElementById('dotViolet'),
      teal: document.getElementById('dotTeal')
    };
    var baseColors = { coral: [255,107,77], violet: [139,92,246], teal: [45,212,200] };

    var rect = mixer.getBoundingClientRect();
    function refreshRect() { rect = mixer.getBoundingClientRect(); }
    window.addEventListener('resize', refreshRect);

    // Normalize every dot to explicit left/top percentages (some start
    // positioned via right/bottom in HTML) so distance math never sees NaN.
    Object.keys(dots).forEach(function(k) {
      var el = dots[k];
      if (!el) return;
      var r = el.getBoundingClientRect();
      var leftPct = ((r.left - rect.left + r.width / 2) / rect.width) * 100;
      var topPct = ((r.top - rect.top + r.height / 2) / rect.height) * 100;
      el.style.left = leftPct + '%';
      el.style.top = topPct + '%';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
    });

    var target = { x: 0, y: 0 };
    var pos = { x: 0, y: 0 };
    var idle = true;
    var t0 = performance.now();

    function pointerFromEvent(e) {
      var p = (e.touches && e.touches[0]) ? e.touches[0] : e;
      return { x: p.clientX, y: p.clientY };
    }

    mixer.addEventListener('pointermove', function(e) {
      if (e.target.classList.contains('dot')) return;
      refreshRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var maxDrift = rect.width * 0.14;
      var dx = e.clientX - cx;
      var dy = e.clientY - cy;
      var dist = Math.sqrt(dx*dx + dy*dy) || 1;
      var clamped = Math.min(dist, maxDrift);
      target.x = (dx / dist) * clamped;
      target.y = (dy / dist) * clamped;
      idle = false;
    });
    mixer.addEventListener('pointerleave', function() { idle = true; target.x = 0; target.y = 0; });

    /* ---- draggable color dots ---- */
    function clampPct(v){ return Math.max(4, Math.min(94, v)); }
    function makeDraggable(el) {
      var dragging = false;
      el.addEventListener('pointerdown', function(e) {
        dragging = true;
        el.setPointerCapture(e.pointerId);
      });
      el.addEventListener('pointermove', function(e) {
        if (!dragging) return;
        refreshRect();
        var xPct = clampPct(((e.clientX - rect.left) / rect.width) * 100);
        var yPct = clampPct(((e.clientY - rect.top) / rect.height) * 100);
        el.style.left = xPct + '%';
        el.style.top = yPct + '%';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
      });
      el.addEventListener('pointerup', function() { dragging = false; });
      el.addEventListener('pointercancel', function() { dragging = false; });
    }
    Object.keys(dots).forEach(function(k) { if (dots[k]) makeDraggable(dots[k]); });

    function dotCenterPx(el) {
      var l = parseFloat(el.style.left);
      var t = parseFloat(el.style.top);
      if (isNaN(l) || isNaN(t)) {
        var r = el.getBoundingClientRect();
        return { x: r.left - rect.left + r.width/2, y: r.top - rect.top + r.height/2 };
      }
      return { x: (l/100) * rect.width, y: (t/100) * rect.height };
    }

    function mixColor() {
      var cx = rect.width/2 + pos.x;
      var cy = rect.height/2 + pos.y;
      var maxDist = rect.width * 0.6;
      var weights = {}, sum = 0;
      Object.keys(dots).forEach(function(k) {
        if (!dots[k]) return;
        var c = dotCenterPx(dots[k]);
        var d = Math.sqrt(Math.pow(c.x-cx,2) + Math.pow(c.y-cy,2));
        var w = Math.max(0.06, 1 - d / maxDist);
        weights[k] = w; sum += w;
      });
      var r=0,g=0,b=0;
      Object.keys(weights).forEach(function(k) {
        var w = weights[k]/sum;
        r += baseColors[k][0]*w; g += baseColors[k][1]*w; b += baseColors[k][2]*w;
      });
      if (isNaN(r) || isNaN(g) || isNaN(b)) return;
      var mid = 'rgb(' + (r|0) + ',' + (g|0) + ',' + (b|0) + ')';
      var light = 'rgb(' + Math.min(255,(r+70)|0) + ',' + Math.min(255,(g+70)|0) + ',' + Math.min(255,(b+70)|0) + ')';
      var dark = 'rgb(' + Math.max(0,(r-60)|0) + ',' + Math.max(0,(g-60)|0) + ',' + Math.max(0,(b-60)|0) + ')';
      var grad = 'radial-gradient(circle at 35% 30%, ' + light + ', ' + mid + ' 55%, ' + dark + ' 100%)';
      if (blobMain) blobMain.style.background = grad;
      sats.forEach(function(s){ if (s) s.style.background = mid; });
    }

    function loop() {
      var t = (performance.now() - t0) / 1000;
      pos.x += (target.x - pos.x) * 0.09;
      pos.y += (target.y - pos.y) * 0.09;
      var wobbleX = idle ? Math.sin(t * 0.6) * (rect.width * 0.02) : 0;
      var wobbleY = idle ? Math.cos(t * 0.5) * (rect.width * 0.02) : 0;
      var breathe = 1 + Math.sin(t * 0.8) * 0.025;
      var tx = pos.x + wobbleX, ty = pos.y + wobbleY;

      if (blobMain) blobMain.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + breathe + ')';
      if (blobSheen) blobSheen.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + breathe + ')';

      sats.forEach(function(s, i) {
        if (!s) return;
        var angle = t * 0.35 + (i * (Math.PI * 2 / 3));
        var radius = rect.width * 0.24;
        var sx = Math.cos(angle) * radius + tx * 0.5;
        var sy = Math.sin(angle) * radius + ty * 0.5;
        s.style.transform = 'translate(' + sx + 'px,' + sy + 'px)';
      });

      mixColor();
      requestAnimationFrame(loop);
    }

    // Touch support: mirror touchmove to pointer-like handling for browsers needing it
    mixer.style.touchAction = 'none';

    if (!reduceMotion) {
      requestAnimationFrame(loop);
    } else {
      mixColor();
    }
  }

  /* ==========================================================================
     Video fade-in once ready
     ========================================================================== */
  var video = document.getElementById('showreelVideo');
  if (video) {
    video.style.opacity = '0';
    video.style.transition = 'opacity .5s ease';
    video.addEventListener('loadeddata', function() { video.style.opacity = '1'; });
  }

})();
