(function(){
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     Dark / light theme toggle. The initial state is already applied by the
     inline script in <head> (reads localStorage, falls back to the OS
     preference) so there's no flash; this just wires up the button.
     ========================================================================== */
  (function initThemeToggle() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    var root = document.documentElement;

    function reflect(theme) {
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }
    function apply(theme) {
      if (theme === 'light') root.setAttribute('data-theme', 'light');
      else root.removeAttribute('data-theme');
      try { localStorage.setItem('db-theme', theme); } catch (e) {}
      reflect(theme);
    }

    reflect(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    btn.addEventListener('click', function() {
      var current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      apply(current === 'light' ? 'dark' : 'light');
    });
  })();

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
    document.querySelectorAll('a, button, .g-item').forEach(function(el) {
      el.addEventListener('mouseenter', function() { cursorDot.classList.add('hover'); });
      el.addEventListener('mouseleave', function() { cursorDot.classList.remove('hover'); });
    });
  } else if (cursorDot) {
    cursorDot.style.display = 'none';
  }

  /* ==========================================================================
     THE OCEAN — a live water simulation behind the entire page, not just
     the hero. Long-press sculpts the sea floor: the center digs a pool,
     the displaced material piles up as a ridge at the rim — one gesture,
     both actions. A tap anywhere drops a ripple. Ripple speed is driven by
     local floor height, so ripples travel faster over ridges and slower
     through pools — wavefronts bend, focus, and throw bright caustic bands
     exactly like light through a liquid lens.

     Scope: on desktop, press-and-hold to sculpt works anywhere on the page
     (a mouse hold never competes with scrolling). On touch, sculpting is
     limited to the hero — the one place that already trades away
     swipe-scroll for the gesture — while a tap anywhere else on the page
     still drops a ripple without touching scroll behavior. Real controls
     (links, buttons, form fields) are always left untouched.

     Pure Canvas2D: physics run on a small grid, then the result is
     upscaled by the browser (soft, no shaders, no WebGL dependency).
     ========================================================================== */
  (function initOceanSim() {
    var canvas = document.getElementById('heroGrid');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return; // extremely old browser; canvas stays empty, rest of page unaffected

    // ---- tunables ---------------------------------------------------------
    var TARGET_LONG_AXIS = 132;   // sim-grid cells along the longer canvas side
    var SPEED_MIN = 0.34, SPEED_MAX = 0.86; // wave speed over deep water vs. over a ridge
    var DAMPING = 0.05;           // energy loss per step
    var DT = 0.6;                 // integration step (Courant-safe: SPEED_MAX*DT < 1/sqrt(2))
    var SUBSTEPS = 2;             // physics steps per animation frame
    var EDGE_BAND = 9;            // cells over which the shoreline absorbs waves
    var BRUSH_R = 10;             // sculpt brush radius in cells
    var DIG_RATE = 1.15, RIDGE_RATE = 0.55; // sculpt strength (spoil piles up as a rim)
    var TAP_MAX_MS = 220, TAP_MAX_MOVE = 9; // px thresholds separating a tap from a sculpt hold
    var AMBIENT_MS = 5200;        // idle auto-ripple cadence (skipped for reduced motion)

    var simW = 60, simH = 40;
    var height, velocity, terrain, edgeDamp, img;

    function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
    function smoothstep(e0, e1, x) {
      var t = clamp((x - e0) / (e1 - e0), 0, 1);
      return t * t * (3 - 2 * t);
    }

    function allocate(w, h) {
      simW = w; simH = h;
      height = new Float32Array(simW * simH);
      velocity = new Float32Array(simW * simH);
      terrain = new Float32Array(simW * simH);
      edgeDamp = new Float32Array(simW * simH);
      for (var j = 0; j < simH; j++) {
        for (var i = 0; i < simW; i++) {
          var d = Math.min(i, simW - 1 - i, j, simH - 1 - j);
          edgeDamp[j * simW + i] = 0.15 + 0.85 * clamp(d / EDGE_BAND, 0, 1);
        }
      }
      canvas.width = simW;
      canvas.height = simH;
      img = ctx.createImageData(simW, simH);
      var a = img.data;
      for (var p = 3; p < a.length; p += 4) a[p] = 255;
    }

    function sizeFromRect() {
      var vw = window.innerWidth, vh = window.innerHeight;
      var aspect = vw / Math.max(1, vh);
      var w, h;
      if (aspect >= 1) { w = TARGET_LONG_AXIS; h = Math.round(TARGET_LONG_AXIS / aspect); }
      else { h = TARGET_LONG_AXIS; w = Math.round(TARGET_LONG_AXIS * aspect); }
      w = clamp(w, 50, 220); h = clamp(h, 50, 220);
      allocate(w, h);
    }
    sizeFromRect();

    var resizeTimer = null;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(sizeFromRect, 220);
    });

    // ---- physics ------------------------------------------------------------
    function sculptAt(gx, gy, rate) {
      var minI = Math.max(0, Math.floor(gx - BRUSH_R - 1));
      var maxI = Math.min(simW - 1, Math.ceil(gx + BRUSH_R + 1));
      var minJ = Math.max(0, Math.floor(gy - BRUSH_R - 1));
      var maxJ = Math.min(simH - 1, Math.ceil(gy + BRUSH_R + 1));
      for (var j = minJ; j <= maxJ; j++) {
        for (var i = minI; i <= maxI; i++) {
          var dx = i - gx, dy = j - gy;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d > BRUSH_R) continue;
          var core = smoothstep(BRUSH_R * 0.55, 0, d);          // 1 at center -> 0 by mid-radius
          var rim = smoothstep(0, BRUSH_R * 0.55, d) * smoothstep(BRUSH_R, BRUSH_R * 0.55, d); // ring
          var idx = j * simW + i;
          var v = terrain[idx] + rate * (-DIG_RATE * core + RIDGE_RATE * rim);
          terrain[idx] = clamp(v, -1.3, 1.3);
        }
      }
    }

    function addRipple(gx, gy, amp, sigma) {
      amp = amp === undefined ? 1.0 : amp;
      sigma = sigma === undefined ? 2.6 : sigma;
      var r = Math.ceil(sigma * 3);
      var minI = Math.max(0, Math.floor(gx - r)), maxI = Math.min(simW - 1, Math.ceil(gx + r));
      var minJ = Math.max(0, Math.floor(gy - r)), maxJ = Math.min(simH - 1, Math.ceil(gy + r));
      for (var j = minJ; j <= maxJ; j++) {
        for (var i = minI; i <= maxI; i++) {
          var dx = i - gx, dy = j - gy;
          var d2 = dx * dx + dy * dy;
          var g = Math.exp(-d2 / (2 * sigma * sigma));
          var idx = j * simW + i;
          height[idx] += amp * g;
          velocity[idx] += amp * 0.6 * g;
        }
      }
    }

    function stepWave() {
      var w = simW;
      for (var j = 1; j < simH - 1; j++) {
        var row = j * w;
        for (var i = 1; i < w - 1; i++) {
          var idx = row + i;
          var h = height[idx];
          var lap = height[idx - 1] + height[idx + 1] + height[idx - w] + height[idx + w] - 4 * h;
          var tnorm = clamp((terrain[idx] + 1) * 0.5, 0, 1);
          var speed = SPEED_MIN + (SPEED_MAX - SPEED_MIN) * tnorm;
          var v = velocity[idx] + (speed * speed * lap - DAMPING * velocity[idx]) * DT;
          velocity[idx] = v * edgeDamp[idx];
        }
      }
      for (var k = 0; k < height.length; k++) height[k] += velocity[k] * DT;
    }

    // ---- render (low-res buffer, CSS-scaled up for a soft liquid look) ----
    var PALETTES = {
      dark:  { deep: [7, 13, 24],    shallow: [58, 168, 190],  causticCyan: [63, 224, 208],  causticViolet: [160, 122, 255] },
      light: { deep: [122, 196, 192], shallow: [246, 251, 250], causticCyan: [10, 150, 140],  causticViolet: [106, 79, 224] }
    };
    function activePalette() {
      return document.documentElement.getAttribute('data-theme') === 'light' ? PALETTES.light : PALETTES.dark;
    }
    var CAUSTIC_K = 5.2, RELIEF_K = 1.6;

    function render(now) {
      var pal = activePalette();
      var DEEP = pal.deep, SHALLOW = pal.shallow, CAUSTIC_CYAN = pal.causticCyan, CAUSTIC_VIOLET = pal.causticViolet;
      var w = simW, hgt = simH, data = img.data;
      for (var j = 0; j < hgt; j++) {
        var jU = j === 0 ? 0 : j - 1, jD = j === hgt - 1 ? hgt - 1 : j + 1;
        for (var i = 0; i < w; i++) {
          var iL = i === 0 ? 0 : i - 1, iR = i === w - 1 ? w - 1 : i + 1;
          var idx = j * w + i;
          var t = terrain[idx];

          var tL = terrain[j * w + iL], tR = terrain[j * w + iR];
          var tU = terrain[jU * w + i], tD = terrain[jD * w + i];
          var hL = height[j * w + iL], hR = height[j * w + iR];
          var hU = height[jU * w + i], hD = height[jD * w + i];

          var tgx = tR - tL, tgy = tD - tU;
          var hgx = hR - hL, hgy = hD - hU;

          var gradMag = Math.sqrt(hgx * hgx + hgy * hgy);
          var caustic = clamp(gradMag * CAUSTIC_K, 0, 1);

          var relief = clamp(0.5 - (tgx + tgy) * RELIEF_K, 0, 1);
          var reliefMul = 0.7 + relief * 0.55;

          var depthNorm = clamp((t + 1) * 0.5, 0, 1);
          var baseR = (DEEP[0] + (SHALLOW[0] - DEEP[0]) * depthNorm) * reliefMul;
          var baseG = (DEEP[1] + (SHALLOW[1] - DEEP[1]) * depthNorm) * reliefMul;
          var baseB = (DEEP[2] + (SHALLOW[2] - DEEP[2]) * depthNorm) * reliefMul;

          var angle = Math.atan2(hgy, hgx);
          var mixT = 0.5 + 0.5 * Math.sin(angle * 2.0 + now * 0.0012);
          var causR = CAUSTIC_CYAN[0] + (CAUSTIC_VIOLET[0] - CAUSTIC_CYAN[0]) * mixT;
          var causG = CAUSTIC_CYAN[1] + (CAUSTIC_VIOLET[1] - CAUSTIC_CYAN[1]) * mixT;
          var causB = CAUSTIC_CYAN[2] + (CAUSTIC_VIOLET[2] - CAUSTIC_CYAN[2]) * mixT;

          var r = baseR + (causR - baseR) * caustic * 0.85;
          var g = baseG + (causG - baseG) * caustic * 0.85;
          var b = baseB + (causB - baseB) * caustic * 0.85;

          var core = caustic * caustic;
          r += core * 42; g += core * 48; b += core * 54;

          var p = idx * 4;
          data[p] = r < 0 ? 0 : (r > 255 ? 255 : r);
          data[p + 1] = g < 0 ? 0 : (g > 255 ? 255 : g);
          data[p + 2] = b < 0 ? 0 : (b > 255 ? 255 : b);
        }
      }
      ctx.putImageData(img, 0, 0);
    }

    // ---- interaction: long-press to sculpt, tap to ripple — anywhere on
    // the page. Real controls (links, buttons, form fields) are left alone
    // so nothing here ever competes with normal site navigation. Touch
    // scrolling is precious everywhere except the hero (which already
    // trades it away via touch-action:none), so on touch, sculpting is
    // only enabled inside the hero; elsewhere a touch always resolves to
    // a single ripple on release, never a drag-scroll-eating hold.
    var heroEl = document.querySelector('.hero');
    var INTERACTIVE_SEL = 'a, button, input, textarea, select, label, [role="button"], [contenteditable]';

    var pointerActive = false, sculpting = false, allowSculpt = false;
    var downTime = 0, downClientX = 0, downClientY = 0;
    var lastGrid = { x: simW / 2, y: simH / 2 };
    var lastInteraction = performance.now(), lastAmbient = performance.now();

    function toGrid(e) {
      var relX = clamp(e.clientX / window.innerWidth, 0, 1);
      var relY = clamp(e.clientY / window.innerHeight, 0, 1);
      return { x: relX * simW, y: relY * simH };
    }

    window.addEventListener('pointerdown', function(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.target && e.target.closest && e.target.closest(INTERACTIVE_SEL)) return; // never hijack real controls

      var isHero = !!(e.target && e.target.closest && e.target.closest('.hero'));
      allowSculpt = e.pointerType !== 'touch' || isHero;

      pointerActive = true; sculpting = false;
      downTime = performance.now();
      downClientX = e.clientX; downClientY = e.clientY;
      lastGrid = toGrid(e);
      lastInteraction = downTime;

      if (e.pointerType === 'touch' && isHero) e.preventDefault(); // matches the hero's existing touch-action:none trade-off
    }, { passive: false });

    window.addEventListener('pointermove', function(e) {
      if (!pointerActive) return;
      var moved = Math.hypot(e.clientX - downClientX, e.clientY - downClientY);
      var held = performance.now() - downTime;
      if (allowSculpt && !sculpting && (held > TAP_MAX_MS || moved > TAP_MAX_MOVE)) sculpting = true;
      lastGrid = toGrid(e);
      if (sculpting) { sculptAt(lastGrid.x, lastGrid.y, 1); lastInteraction = performance.now(); }
    });

    function finishPointer(e) {
      if (pointerActive) {
        var held = performance.now() - downTime;
        var moved = Math.hypot(e.clientX - downClientX, e.clientY - downClientY);
        var withinTapTime = allowSculpt ? held <= TAP_MAX_MS : true; // outside the hero on touch, any non-drag release ripples
        if (!sculpting && moved <= TAP_MAX_MOVE && withinTapTime) {
          var p = toGrid(e);
          addRipple(p.x, p.y);
          lastInteraction = performance.now();
        }
      }
      pointerActive = false; sculpting = false;
    }
    window.addEventListener('pointerup', finishPointer);
    window.addEventListener('pointercancel', finishPointer);
    if (heroEl) heroEl.addEventListener('contextmenu', function(e) { e.preventDefault(); });

    // ---- main loop -----------------------------------------------------------
    function frame(now) {
      if (pointerActive) {
        if (sculpting) { sculptAt(lastGrid.x, lastGrid.y, 1); }
        else if (allowSculpt && now - downTime > TAP_MAX_MS) { sculpting = true; }
      }
      if (!reduceMotion && now - lastInteraction > AMBIENT_MS && now - lastAmbient > AMBIENT_MS) {
        addRipple(simW * (0.32 + Math.random() * 0.36), simH * (0.32 + Math.random() * 0.36), 0.5, 3);
        lastAmbient = now;
      }
      for (var s = 0; s < SUBSTEPS; s++) stepWave();
      render(now);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // a couple of opening ripples so the surface isn't perfectly flat on load
    addRipple(simW * 0.42, simH * 0.46, 0.7, 4);
    addRipple(simW * 0.63, simH * 0.58, 0.5, 3);
  })();

  /* ==========================================================================
     Ripple press effect for buttons — the site's core interaction (sculpt the
     floor, tap for ripples) echoed in miniature on every primary control.
     ========================================================================== */
  (function initButtonRipples() {
    var targets = document.querySelectorAll('.btn, .nav-cta, .form-submit');
    targets.forEach(function(el) {
      el.style.position = el.style.position || 'relative';
      el.style.overflow = 'hidden';
      el.addEventListener('pointerdown', function(e) {
        var rect = el.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height) * 1.6;
        var span = document.createElement('span');
        span.className = 'ripple-fx';
        span.style.width = size + 'px';
        span.style.height = size + 'px';
        span.style.left = (e.clientX - rect.left) + 'px';
        span.style.top = (e.clientY - rect.top) + 'px';
        el.appendChild(span);
        span.addEventListener('animationend', function() { span.remove(); });
      });
    });
  })();

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
