/* Portfolio data. Keep this file simple so content can be edited without touching the interaction engine. */
window.SITE_CONTENT = {
  skills: [
    { name: "AI", value: 92 },
    { name: "Local LLMs", value: 85 },
    { name: "Automation", value: 88 },
    { name: "PowerShell", value: 78 },
    { name: "Web / Three.js", value: 74 },
    { name: "Desktop Software", value: 70 }
  ],
  gallery: [
    { src: "images/gallery-01", alt: "Personal photograph 01" },
    { src: "images/gallery-02", alt: "Personal photograph 02" },
    { src: "images/gallery-03", alt: "Personal photograph 03" },
    { src: "images/gallery-04", alt: "Personal photograph 04" },
    { src: "images/gallery-05", alt: "Personal photograph 05" },
    { src: "images/gallery-06", alt: "Personal photograph 06" },
    { src: "images/gallery-07", alt: "Personal photograph 07" },
    { src: "images/gallery-08", alt: "Personal photograph 08" },
    { src: "images/gallery-09", alt: "Personal photograph 09" },
    { src: "images/gallery-10", alt: "Personal photograph 10" },
    { src: "images/gallery-11", alt: "Personal photograph 11" },
    { src: "images/gallery-12", alt: "Personal photograph 12" }
  ]
};
/* Standalone interaction engine. No framework or build step is required. */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var content = window.SITE_CONTENT || { skills: [], gallery: [] };
  var audioContext = null;
  var audioArmed = false;
  var lastTone = 0;
  var surfaceStatus = document.getElementById("surfaceStatus");
  var audioStatus = document.getElementById("audioStatus");
  var audioDot = document.getElementById("audioDot");

  function setSurfaceStatus(text) {
    if (surfaceStatus) surfaceStatus.textContent = text;
  }

  function armAudio() {
    var AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioClass) return null;
    if (!audioContext) audioContext = new AudioClass();
    if (audioContext.state === "suspended") audioContext.resume();
    audioArmed = true;
    if (audioStatus) audioStatus.textContent = "Chime / live";
    if (audioDot) audioDot.classList.add("live");
    return audioContext;
  }

  function playChime(semitones, intensity) {
    var now = performance.now();
    if (now - lastTone < 90) return;
    lastTone = now;
    var ctx = armAudio();
    if (!ctx) return;
    semitones = typeof semitones === "number" ? semitones : 0;
    intensity = typeof intensity === "number" ? intensity : .5;
    var start = ctx.currentTime;
    var base = 220 * Math.pow(2, semitones / 12);
    var master = ctx.createGain();
    master.gain.setValueAtTime(.0001, start);
    master.gain.exponentialRampToValueAtTime(.035 + intensity * .055, start + .016);
    master.gain.exponentialRampToValueAtTime(.0001, start + 1.25);
    master.connect(ctx.destination);
    [1, 2.01, 3.02].forEach(function (ratio, index) {
      var oscillator = ctx.createOscillator();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = base * ratio;
      oscillator.detune.value = index === 1 ? 4 : index === 2 ? -6 : 0;
      oscillator.connect(master);
      oscillator.start(start);
      oscillator.stop(start + 1.35);
    });
  }

  function spawnVisualRipple(x, y, hue) {
    var ripple = document.createElement("span");
    ripple.className = "water-ripple" + (hue === "lime" ? " is-lime" : "");
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    document.body.appendChild(ripple);
    window.setTimeout(function () { ripple.remove(); }, 1750);
  }

  /* Water surface: a low-res responsive field keeps the page alive without hijacking controls. */
  function initWater() {
    var canvas = document.getElementById("oceanCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var width = 0, height = 0, dpr = 1, raf = 0, lastTime = performance.now();
    var pointerDown = false, sculpting = false, downAt = 0, downX = 0, downY = 0;
    var lastInteraction = performance.now(), ripples = [], grid = new Float32Array(32 * 22);
    function resize() {
      width = window.innerWidth; height = window.innerHeight; dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px"; canvas.style.height = height + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function interactive(target) { return target && target.closest && target.closest("a,button,input,textarea,select,label,video,[role='button'],[contenteditable='true']"); }
    function addRipple(x, y, speed, hue) {
      ripples.push({ x: x, y: y, radius: 0, speed: 1.6 + (speed || .5) * 1.5, alpha: .74, hue: hue || "cyan" });
      if (ripples.length > 22) ripples.shift();
    }
    function displace(x, y, strength) {
      var gx = Math.round((x / Math.max(1, width)) * 31), gy = Math.round((y / Math.max(1, height)) * 21);
      for (var j = Math.max(0, gy - 3); j <= Math.min(21, gy + 3); j++) for (var i = Math.max(0, gx - 3); i <= Math.min(31, gx + 3); i++) {
        var distance = Math.hypot(i - gx, j - gy); if (distance < 4) grid[j * 32 + i] += strength * (1 - distance / 4);
      }
    }
    function point(event) { return { x: event.clientX, y: event.clientY }; }
    function down(event) {
      if ((event.pointerType === "mouse" && event.button !== 0) || interactive(event.target)) return;
      var p = point(event); pointerDown = true; sculpting = false; downAt = performance.now(); downX = p.x; downY = p.y;
      lastInteraction = performance.now(); addRipple(p.x, p.y, .45, "cyan"); spawnVisualRipple(p.x, p.y, "cyan"); setSurfaceStatus("ripple / chime");
    }
    function move(event) {
      if (!pointerDown) return;
      var p = point(event), moved = Math.hypot(p.x - downX, p.y - downY), held = performance.now() - downAt;
      if (!sculpting && !reducedMotion && event.pointerType !== "touch" && (held > 220 || moved > 10)) sculpting = true;
      if (sculpting) { displace(p.x, p.y, .016); addRipple(p.x, p.y, .16, "lime"); lastInteraction = performance.now(); setSurfaceStatus("sculpting the surface"); }
    }
    function up(event) {
      if (!pointerDown) return;
      var p = point(event), moved = Math.hypot(p.x - downX, p.y - downY);
      if (!sculpting && moved < 11) { addRipple(p.x, p.y, .9, "lime"); spawnVisualRipple(p.x, p.y, "lime"); playChime(Math.round((p.x / Math.max(1, width)) * 15) - 7, .72); lastInteraction = performance.now(); setSurfaceStatus("ripple / chime"); }
      pointerDown = false; sculpting = false; setTimeout(function () { setSurfaceStatus("Drag the field · click to pulse"); }, 620);
    }
    function render(time) {
      var delta = Math.min(32, Math.max(0, time - lastTime)); lastTime = time; ctx.clearRect(0, 0, width, height);
      if (!pointerDown && !reducedMotion && time - lastInteraction > 5200) { addRipple(width * (.32 + Math.random() * .36), height * (.32 + Math.random() * .36), .46, Math.random() > .6 ? "lime" : "cyan"); lastInteraction = time; }
      var wash = ctx.createRadialGradient(width * .6, height * .35, 0, width * .5, height * .55, Math.max(width, height) * .72);
      wash.addColorStop(0, "rgba(25,68,72,.12)"); wash.addColorStop(.45, "rgba(8,20,24,.08)"); wash.addColorStop(1, "rgba(3,8,11,.02)"); ctx.fillStyle = wash; ctx.fillRect(0, 0, width, height);
      for (var r = ripples.length - 1; r >= 0; r--) {
        var ripple = ripples[r]; ripple.radius += ripple.speed * (delta / 16); ripple.alpha *= .992;
        if (ripple.alpha < .028 || ripple.radius < 0 || ripple.radius > Math.max(width, height) * .74) { ripples.splice(r, 1); continue; }
        var fade = ripple.alpha * Math.max(0, 1 - ripple.radius / (Math.max(width, height) * .8));
        ctx.save(); ctx.translate(ripple.x, ripple.y); ctx.scale(1, .32 + Math.sin(ripple.radius * .015) * .03); ctx.lineWidth = 1.3; ctx.shadowBlur = 12;
        ctx.strokeStyle = ripple.hue === "lime" ? "rgba(215,255,63," + fade + ")" : "rgba(111,231,255," + fade + ")"; ctx.shadowColor = ctx.strokeStyle;
        ctx.beginPath(); ctx.ellipse(0, 0, ripple.radius, ripple.radius, 0, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = .5; ctx.globalAlpha = fade * .55;
        ctx.beginPath(); ctx.ellipse(0, 0, ripple.radius * 1.34, ripple.radius * 1.34, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
      ctx.save(); ctx.globalCompositeOperation = "screen";
      for (var row = 0; row < 22; row++) { ctx.beginPath(); for (var col = 0; col < 32; col++) { var x = col / 31 * width, y = row / 21 * height, wave = Math.sin(time * .00022 + col * .33 + row * .17) * 3, shift = grid[row * 32 + col] * 16; if (col === 0) ctx.moveTo(x, y + wave + shift); else ctx.lineTo(x, y + wave + shift); } ctx.strokeStyle = "rgba(111,231,255," + (.018 + (row % 4) * .006) + ")"; ctx.stroke(); }
      for (var g = 0; g < grid.length; g++) grid[g] *= .968; ctx.restore(); raf = requestAnimationFrame(render);
    }
    resize(); addRipple(width * .42, height * .45, .65, "cyan"); addRipple(width * .68, height * .58, .42, "lime");
    window.addEventListener("resize", resize); window.addEventListener("pointerdown", down, { passive: true }); window.addEventListener("pointermove", move, { passive: true }); window.addEventListener("pointerup", up, { passive: true }); window.addEventListener("pointercancel", up, { passive: true }); raf = requestAnimationFrame(render);
    document.addEventListener("visibilitychange", function () { if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(render); });
  }

  /* Hanging droplets: verlet strands follow the pointer and can be plucked. */
  function initChimes() {
    var canvas = document.getElementById("chimeCanvas"), hero = document.querySelector(".hero");
    if (!canvas || !hero) return; var ctx = canvas.getContext("2d"); if (!ctx) return;
    var width = 0, height = 0, dpr = 1, raf = 0, pointerX = null, pointerY = null, grabbed = null, strands = [];
    function resize() { width = hero.clientWidth; height = hero.clientHeight; dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); var start = width * .6, zone = width - start, count = Math.max(5, Math.round(zone / 61)), margin = start + (zone - (count - 1) * 61) / 2; strands = []; for (var s = 0; s < count; s++) { var factor = 1 + Math.abs(Math.sin(s * 7.233)) * .48, x = margin + s * 61 + (Math.sin(s * 12.9898) * 43758.5453 % 1) * 12 - 6, particles = []; for (var p = 0; p < 13; p++) particles.push({ x: x, y: 72 + p * 25 * factor, ox: x, oy: 72 + p * 25 * factor, pinned: p === 0 }); strands.push({ rest: 25 * factor, particles: particles }); } }
    function interactive(target) { return target && target.closest && target.closest("a,button,input,textarea,select,label,video,[role='button']"); }
    function move(event) { var rect = hero.getBoundingClientRect(); pointerX = event.clientX - rect.left; pointerY = event.clientY - rect.top; if (grabbed) { grabbed.x = pointerX; grabbed.y = pointerY; } }
    function leave() { pointerX = null; pointerY = null; }
    function down(event) { if ((event.pointerType === "mouse" && event.button !== 0) || interactive(event.target)) return; var rect = hero.getBoundingClientRect(), x = event.clientX - rect.left, y = event.clientY - rect.top, nearest = null, best = 24; strands.forEach(function (strand) { strand.particles.slice(1).forEach(function (p) { var d = Math.hypot(p.x - x, p.y - y); if (d < best) { nearest = p; best = d; } }); }); if (nearest) { grabbed = nearest; grabbed.grabbed = true; grabbed.x = x; grabbed.y = y; playChime(Math.round((x / Math.max(1, width)) * 10) - 5, .6); event.preventDefault(); } }
    function up() { if (!grabbed) return; grabbed.ox = grabbed.x; grabbed.oy = grabbed.y; grabbed.grabbed = false; grabbed = null; }
    function step() { strands.forEach(function (strand) { strand.particles.forEach(function (p, index) { if (index === 0 || p.grabbed) return; var vx = (p.x - p.ox) * .986, vy = (p.y - p.oy) * .986; p.ox = p.x; p.oy = p.y; p.x += vx; p.y += vy + .28; if (pointerX !== null && pointerY !== null) { var dx = p.x - pointerX, dy = p.y - pointerY, d = Math.hypot(dx, dy); if (d < 100 && d > .001) { var force = (1 - d / 100) * 4.8; p.x += dx / d * force; p.y += dy / d * force * .35; } } }); for (var iteration = 0; iteration < 5; iteration++) strand.particles.forEach(function (a, index) { if (index === strand.particles.length - 1) return; var b = strand.particles[index + 1], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || .001, diff = (d - strand.rest) / d, ox = dx * .5 * diff, oy = dy * .5 * diff; if (!a.pinned && !a.grabbed) { a.x += ox; a.y += oy; } if (!b.grabbed) { b.x -= ox; b.y -= oy; } }); }); }
    function render() { ctx.clearRect(0, 0, width, height); strands.forEach(function (strand) { var ps = strand.particles; ctx.beginPath(); ctx.moveTo(ps[0].x, ps[0].y); ps.slice(1).forEach(function (p) { ctx.lineTo(p.x, p.y); }); ctx.strokeStyle = "rgba(111,231,255,.28)"; ctx.lineWidth = 1; ctx.stroke(); ps.forEach(function (p, index) { if (index % 3 !== 2) return; var r = 4 + index % 4, grad = ctx.createRadialGradient(p.x - r * .35, p.y - r * .4, .5, p.x, p.y, r); grad.addColorStop(0, "rgba(244,255,255,.98)"); grad.addColorStop(.45, "rgba(111,231,255,.84)"); grad.addColorStop(1, "rgba(215,255,63,0)"); ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill(); ctx.beginPath(); ctx.arc(p.x - r * .3, p.y - r * .38, r * .2, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.fill(); }); }); step(); raf = requestAnimationFrame(render); }
    resize(); window.addEventListener("resize", resize); hero.addEventListener("pointermove", move); hero.addEventListener("pointerleave", leave); hero.addEventListener("pointerdown", down, { passive: false }); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up); raf = requestAnimationFrame(render);
  }

  function initDropField() {
    var field = document.getElementById("dropField");
    var hero = document.querySelector(".hero");
    if (!field || !hero) return;
    var count = Math.max(6, Math.floor(hero.clientWidth / 88));
    for (var i = 0; i < count; i++) {
      var strand = document.createElement("span");
      strand.className = "drop-string";
      strand.style.left = (62 + (i / Math.max(1, count - 1)) * 35) + "%";
      strand.style.height = (44 + (i % 4) * 8) + "%";
      strand.style.transform = "rotate(" + ((i % 3) - 1) * 1.7 + "deg)";
      var bead = document.createElement("i");
      bead.className = "drop-bead" + (i % 4 === 2 ? " lime" : "");
      bead.style.top = (16 + (i % 6) * 12) + "%";
      bead.style.animationDelay = (i * -.32) + "s";
      strand.appendChild(bead);
      field.appendChild(strand);
    }
    hero.addEventListener("pointermove", function (event) {
      var rect = hero.getBoundingClientRect();
      field.style.transform = "translate3d(" + (((event.clientX - rect.left) / Math.max(1, rect.width) - .5) * 16).toFixed(2) + "px," + (((event.clientY - rect.top) / Math.max(1, rect.height) - .5) * 10).toFixed(2) + "px,0)";
    }, { passive: true });
  }

  function init3dGallery() {
    document.querySelectorAll(".gallery-item").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / Math.max(1, rect.width) - .5;
        var y = (event.clientY - rect.top) / Math.max(1, rect.height) - .5;
        card.style.setProperty("--tilt-x", (-y * 10).toFixed(2) + "deg");
        card.style.setProperty("--tilt-y", (x * 12).toFixed(2) + "deg");
        card.style.setProperty("--photo-x", (x * 10).toFixed(1) + "px");
        card.style.setProperty("--photo-y", (y * 10).toFixed(1) + "px");
        card.style.setProperty("--depth-shadow", (x * -10).toFixed(0) + "px " + (y * -10).toFixed(0) + "px 25px rgba(0,0,0,.3)");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--tilt-x", "0deg"); card.style.setProperty("--tilt-y", "0deg"); card.style.setProperty("--photo-x", "0px"); card.style.setProperty("--photo-y", "0px"); card.style.setProperty("--depth-shadow", "0 0 0 rgba(0,0,0,0)");
      });
    });
  }

  function renderGallery() { var grid = document.getElementById("galleryGrid"); if (!grid) return; content.gallery.forEach(function (item, index) { var button = document.createElement("button"); button.type = "button"; button.className = "gallery-item"; button.setAttribute("aria-label", "Open " + item.alt); button.innerHTML = '<picture><source srcset="' + item.src + '.webp" type="image/webp"><img src="' + item.src + '.jpg" alt="' + item.alt + '" loading="lazy"></picture><span class="mono">' + String(index + 1).padStart(2, "0") + ' / ' + item.alt + '</span>'; button.addEventListener("click", function () { openGallery(index); }); grid.appendChild(button); }); }
  var modal = document.getElementById("galleryModal"), modalImage = document.getElementById("modalImage"), modalTitle = document.getElementById("modalTitle"), modalCount = document.getElementById("modalCount"), currentPhoto = 0, _lastFocused = null;
  function openGallery(index) {
    currentPhoto = (index + content.gallery.length) % content.gallery.length;
    var item = content.gallery[currentPhoto];
    var isModernFormat = document.querySelector('picture source[type="image/webp"]');
    modalImage.src = item.src + (isModernFormat ? ".webp" : ".jpg");
    modalImage.alt = item.alt;
    modalTitle.textContent = item.alt;
    modalCount.textContent = String(currentPhoto + 1).padStart(2, "0") + " / " + String(content.gallery.length).padStart(2, "0");
    _lastFocused = document.activeElement;
    modal.setAttribute("aria-hidden", "false");
    // move focus into the modal so screen readers announce it
    var closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();
  }
  function closeGallery() {
    modal.setAttribute("aria-hidden", "true");
    // return focus to the element that opened the modal
    if (_lastFocused && _lastFocused.focus) _lastFocused.focus();
    _lastFocused = null;
  }
  function stepGallery(amount) { openGallery(currentPhoto + amount); }
  function _trapFocus(e) {
    if (modal.getAttribute("aria-hidden") !== "false") return;
    var focusable = Array.prototype.slice.call(modal.querySelectorAll("button, [href], input, [tabindex]:not([tabindex=\"-1\"])"));
    if (!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.key === "Tab") {
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    }
  }

  /* Fix 9: Case-study animated reveal */
  function initProjects() {
    document.querySelectorAll(".case-toggle").forEach(function (button) {
      var card = button.closest(".project-card");
      var detail = card ? card.querySelector(".case-detail") : null;
      if (detail) { detail.style.cssText = "overflow:hidden;max-height:0;margin-top:0;padding-top:0;opacity:0;transition:max-height .38s ease,opacity .28s ease,margin-top .28s ease,padding-top .28s ease"; }
      button.addEventListener("click", function () {
        var open = card.classList.toggle("open");
        button.setAttribute("aria-expanded", String(open));
        button.textContent = open ? "\u2212 Show less" : "+ Open the case";
        if (detail) {
          if (open) { detail.style.maxHeight = detail.scrollHeight + 40 + "px"; detail.style.opacity = "1"; detail.style.marginTop = "16px"; detail.style.paddingTop = "15px"; }
          else { detail.style.maxHeight = "0"; detail.style.opacity = "0"; detail.style.marginTop = "0"; detail.style.paddingTop = "0"; }
        }
      });
    });
  }

  /* Fix 7: Skill bars animate from 0 on scroll into view */
  function renderSkills() {
    var list = document.getElementById("skillList");
    if (!list) return;
    content.skills.forEach(function (skill, index) {
      var row = document.createElement("div");
      row.className = "skill-row";
      row.innerHTML = '<div class="skill-meta"><span class="num mono">0' + (index + 1) + '</span><h3>' + skill.name + '</h3><span class="value mono">EXPLORE</span></div><div class="skill-track"><i data-width="' + skill.value + '" style="width:0%"></i></div>';
      list.appendChild(row);
    });
    if (!("IntersectionObserver" in window)) {
      list.querySelectorAll(".skill-track i").forEach(function (b) { b.style.width = b.dataset.width + "%"; });
      list.querySelectorAll(".value[data-val]").forEach(function (e) { e.textContent = e.dataset.val + "%"; });
      return;
    }
    var skillObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        skillObs.unobserve(entry.target);
        var bar = entry.target.querySelector(".skill-track i");
        setTimeout(function () {
          if (bar) bar.style.width = (bar.dataset.width || 100) + '%';
        }, 80);
      });
    }, { threshold: 0.25 });
    list.querySelectorAll(".skill-row").forEach(function (row) { skillObs.observe(row); });
  }

  /* Fixes 1+2+3+12: Scrollspy + progress bar + back-to-top + mobile scroll-lock + Esc */
  function initNavigation() {
    var nav = document.querySelector(".site-nav");
    var menu = document.getElementById("mobileMenu");
    var toggle = document.querySelector(".menu-toggle");
    var closeBtn = document.querySelector(".mobile-close");

    var bar = document.createElement("div");
    bar.id = "scrollProgress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    var btt = document.createElement("button");
    btt.id = "backToTop";
    btt.type = "button";
    btt.setAttribute("aria-label", "Back to top");
    btt.textContent = "\u2191";
    document.body.appendChild(btt);
    btt.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

    var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
    if ("IntersectionObserver" in window) {
      var activeId = null;
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) activeId = e.target.id; });
        navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href").slice(1) === activeId); });
      }, { threshold: 0, rootMargin: "-40% 0px -55% 0px" });
      sections.forEach(function (s) { spy.observe(s); });
    }

    window.addEventListener("scroll", function () {
      var sy = window.scrollY, total = document.documentElement.scrollHeight - window.innerHeight;
      nav.classList.toggle("scrolled", sy > 20);
      bar.style.transform = "scaleX(" + (total > 0 ? sy / total : 0) + ")";
      btt.classList.toggle("visible", sy > window.innerHeight * 0.8);
    }, { passive: true });

    function closeMenu() { menu.classList.remove("open"); menu.setAttribute("aria-hidden", "true"); toggle.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; }
    function openMenu() { menu.classList.add("open"); menu.setAttribute("aria-hidden", "false"); toggle.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; }
    toggle.addEventListener("click", function () { menu.classList.contains("open") ? closeMenu() : openMenu(); });
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("open")) closeMenu(); });
  }

  function initContact() { var form = document.getElementById("contactForm"), status = document.getElementById("formStatus"); if (!form) return; form.addEventListener("submit", function (event) { event.preventDefault(); var submit = form.querySelector("button[type='submit']"); submit.disabled = true; submit.textContent = "Sending\u2026"; fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } }).then(function (response) { if (!response.ok) throw new Error("Request failed"); form.reset(); status.textContent = "Message sent \u2014 I'll get back to you soon."; status.className = "form-status success"; }).catch(function () { status.textContent = "Something went wrong. Please email deepak.batra@outlook.com directly."; status.className = "form-status error"; }).finally(function () { submit.disabled = false; submit.textContent = "Send message \u2197"; }); }); }
  function initModal() { document.querySelector(".modal-close").addEventListener("click", closeGallery); document.querySelector(".modal-prev").addEventListener("click", function () { stepGallery(-1); }); document.querySelector(".modal-next").addEventListener("click", function () { stepGallery(1); }); modal.addEventListener("click", function (event) { if (event.target === modal) closeGallery(); }); document.addEventListener("keydown", function (event) { _trapFocus(event); if (modal.getAttribute("aria-hidden") === "false") { if (event.key === "Escape") closeGallery(); if (event.key === "ArrowLeft") stepGallery(-1); if (event.key === "ArrowRight") stepGallery(1); } }); }

  /* Fix 13: Gallery touch swipe */
  function initModalSwipe() {
    var sx = 0, sy = 0;
    modal.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    modal.addEventListener("touchend", function (e) { var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) stepGallery(dx < 0 ? 1 : -1); }, { passive: true });
  }

  /* Fix 8: Hero stats count-up */
  function initHeroStats() {
    document.querySelectorAll(".hero-stats strong").forEach(function (el) {
      var raw = el.textContent, num = parseFloat(raw), suffix = raw.replace(/[\d.]/g, "");
      if (isNaN(num)) return;
      var t0 = performance.now();
      (function tick(now) { var p = Math.min((now - t0) / 1400, 1), ease = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(ease * num) + suffix; if (p < 1) requestAnimationFrame(tick); })(t0);
    });
  }

  /* Fix 6: Touch-aware hero hint */
  function initTouchHint() {
    var hint = document.getElementById("surfaceStatus");
    if (hint && window.matchMedia("(pointer: coarse)").matches) hint.textContent = "Tap the portal to step in";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
    renderSkills(); renderGallery(); initProjects(); initNavigation();
    initContact(); initModal(); initModalSwipe();
    initWater(); initChimes(); initDropField(); init3dGallery();
    initHeroStats(); initTouchHint();
  });
})();
/* Persisted dark/light theme preference with a system fallback. */
(function () {
  "use strict";
  var root = document.documentElement;
  var button = document.getElementById("themeToggle");
  var stored = localStorage.getItem("deepak-theme");
  var systemLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  var theme = stored || (systemLight ? "light" : "dark");

  function apply(next) {
    theme = next === "light" ? "light" : "dark";
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    if (!button) return;
    var light = theme === "light";
    button.setAttribute("aria-pressed", String(light));
    button.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    button.querySelector(".theme-toggle-icon").textContent = light ? "☾" : "☼";
    button.querySelector(".theme-toggle-label").textContent = light ? "Dark" : "Light";
  }

  apply(theme);
  if (button) button.addEventListener("click", function () {
    var next = theme === "light" ? "dark" : "light";
    localStorage.setItem("deepak-theme", next);
    apply(next);
  });
})();

/* Jungle portal scene: generated foliage, fireflies, cursor parallax and a
   "step into the jungle" portal response. Plain JS, no build step. */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var scene = document.querySelector(".jungle-scene");
  if (!scene) return;
  var stage = scene.querySelector(".jungle-stage");
  var backLayer = scene.querySelector(".jungle-layer.back");
  var frontLayer = scene.querySelector(".jungle-layer.front");
  var portalWrap = scene.querySelector(".jungle-portal-wrap");
  var portal = scene.querySelector(".jungle-portal");
  var hero = document.querySelector(".hero");
  if (!stage || !backLayer || !frontLayer || !portalWrap || !portal || !hero) return;

  /* Shared SVG defs (one instance, referenced by every generated leaf). */
  var defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  defs.setAttribute("class", "jungle-defs");
  defs.setAttribute("width", "0");
  defs.setAttribute("height", "0");
  defs.style.position = "absolute";
  defs.innerHTML =
    '<defs>' +
    '<linearGradient id="jg-grad" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#0f3320"/><stop offset=".55" stop-color="#1d5c39"/><stop offset="1" stop-color="#2f7d4b"/>' +
    '</linearGradient>' +
    '<linearGradient id="jg-grad-soft" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#0a2417"/><stop offset="1" stop-color="#123a25"/>' +
    '</linearGradient>' +
    '<path id="jg-leaf" d="M60 4 C86 22 100 58 84 92 C74 112 46 112 36 92 C20 58 34 22 60 4 Z"/>' +
    '<path id="jg-vein" d="M60 16 C57 46 57 74 61 98" fill="none"/>' +
    '</defs>';
  scene.appendChild(defs);

  var SVG_NS = "http://www.w3.org/2000/svg";

  function leafSVG(size, opts) {
    opts = opts || {};
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 120 120");
    svg.style.width = size + "px";
    svg.style.height = size + "px";
    var body = document.createElementNS(SVG_NS, "use");
    body.setAttribute("href", "#jg-leaf");
    body.setAttribute("fill", opts.soft ? "url(#jg-grad-soft)" : "url(#jg-grad)");
    svg.appendChild(body);
    var vein = document.createElementNS(SVG_NS, "use");
    vein.setAttribute("href", "#jg-vein");
    vein.setAttribute("stroke", opts.soft ? "rgba(111,231,255,.18)" : "rgba(215,255,63,.4)");
    vein.setAttribute("stroke-width", "2.2");
    svg.appendChild(vein);
    return svg;
  }

  function frondSVG(size, opts) {
    opts = opts || {};
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 120 120");
    svg.style.width = size + "px";
    svg.style.height = size + "px";
    var g = document.createElementNS(SVG_NS, "g");
    var spine = document.createElementNS(SVG_NS, "path");
    spine.setAttribute("d", "M14 106 C 36 76 58 48 104 12");
    spine.setAttribute("stroke", opts.soft ? "rgba(80,140,66,.5)" : "rgba(96,168,74,.6)");
    spine.setAttribute("stroke-width", "2.4");
    spine.setAttribute("fill", "none");
    g.appendChild(spine);
    for (var t = .12; t <= .92; t += .1) {
      var p = bezier(t);
      var dx = bezierDX(t), dy = bezierDY(t);
      var ang = Math.atan2(dy, dx) * 180 / Math.PI;
      var len = 8 + t * 26;
      [-1, 1].forEach(function (side) {
        var leaf = document.createElementNS(SVG_NS, "ellipse");
        leaf.setAttribute("cx", String(p.x));
        leaf.setAttribute("cy", String(p.y));
        leaf.setAttribute("rx", String(len));
        leaf.setAttribute("ry", String(3.2 + t * 3));
        leaf.setAttribute("fill", opts.soft ? "url(#jg-grad-soft)" : "url(#jg-grad)");
        leaf.setAttribute("transform", "rotate(" + (ang + 90 * side) + " " + p.x + " " + p.y + ")");
        g.appendChild(leaf);
      });
    }
    svg.appendChild(g);
    return svg;
    function bezier(t) {
      var u = 1 - t;
      return { x: u * u * 14 + 2 * u * t * 36 + t * t * 104, y: u * u * 106 + 2 * u * t * 76 + t * t * 12 };
    }
    function bezierDX(t) { return 2 * (1 - t) * (36 - 14) + 2 * t * (104 - 36); }
    function bezierDY(t) { return 2 * (1 - t) * (76 - 106) + 2 * t * (12 - 76); }
  }

  function place(container, el, x, y, rot, scale, z) {
    el.classList.add("jungle-leaf");
    if (z) el.style.zIndex = z;
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.transform = "translate(-50%,-50%) rotate(" + rot + "deg) scale(" + scale + ")";
    container.appendChild(el);
    return el;
  }

  var rimLeaves = [], cornerLeaves = [];

  function layoutLeaves() {
    rimLeaves.forEach(function (l) { if (l.el.parentNode) l.el.parentNode.removeChild(l.el); });
    rimLeaves = [];
    var sceneRect = scene.getBoundingClientRect();
    var pRect = portalWrap.getBoundingClientRect();
    var cx = pRect.left - sceneRect.left + pRect.width / 2;
    var cy = pRect.top - sceneRect.top + pRect.height / 2;
    var radius = pRect.width * .55;
    var count = 16;
    for (var i = 0; i < count; i++) {
      var angle = (i / count) * Math.PI * 2 + (i % 2 ? .14 : -.09);
      var x = cx + Math.cos(angle) * radius;
      var y = cy + Math.sin(angle) * radius;
      var size = 34 + ((i * 37) % 34);
      var frond = i % 3 === 0;
      var el = frond ? frondSVG(size) : leafSVG(size);
      el.classList.add(frond ? "frond" : "leaf");
      var rot = angle * 180 / Math.PI + 90 + ((i % 4) - 2) * 16;
      place(frontLayer, el, x, y, rot, .9 + ((i * 53) % 30) / 100);
      rimLeaves.push({ el: el });
    }
  }


  function buildCornerFoliage() {
    cornerLeaves.forEach(function (l) { if (l.parentNode) l.parentNode.removeChild(l); });
    cornerLeaves = [];
    var W = window.innerWidth, H = window.innerHeight;
    var clusters = [
      /* bottom-left corner cluster */
      { x: W * .045, y: H * .93, rot: -28, size: 175, scale: 1 },
      { x: W * .105, y: H * .985, rot: 14, size: 150, scale: 1.1, z: 1 },
      { x: W * .015, y: H * .86, rot: -58, size: 120, scale: 1.05, z: 1 },
      /* bottom-right foreground */
      { x: W * .985, y: H * .965, rot: 38, size: 170, scale: 1, z: 2 },
      { x: W * .925, y: H * 1.0, rot: 78, size: 135, scale: 1.05, z: 2 },
      /* top corners */
      { x: W * .015, y: H * .075, rot: -118, size: 130, scale: .95 },
      { x: W * .975, y: H * .05, rot: 128, size: 105, scale: .9 },
      /* mid-left accents */
      { x: W * .03, y: H * .42, rot: -84, size: 90, scale: .85 },
      { x: W * .165, y: H * .16, rot: -152, size: 70, scale: .8 }
    ];
    clusters.forEach(function (c, idx) {
      var el = idx % 2 ? frondSVG(c.size) : leafSVG(c.size);
      place(frontLayer, el, c.x, c.y, c.rot, c.scale, c.z || 0);
      cornerLeaves.push(el);
    });
    /* faint distant foliage in the back layer */
    var back = [
      { x: W * .8, y: H * .2, rot: -40, size: 110, scale: 1 },
      { x: W * .88, y: H * .84, rot: 66, size: 140, scale: 1 },
      { x: W * .72, y: H * .9, rot: 100, size: 90, scale: .9 }
    ];
    back.forEach(function (c) {
      var el = leafSVG(c.size, { soft: true });
      el.classList.add("back");
      place(backLayer, el, c.x, c.y, c.rot, c.scale);
      cornerLeaves.push(el);
    });
  }

  function buildVines() {
    var W = window.innerWidth, H = window.innerHeight;
    var spots = [
      { x: W * .585, len: .46, delay: 0 },
      { x: W * .645, len: .38, delay: -2.2 },
      { x: W * .705, len: .5, delay: -4.1 }
    ];
    spots.forEach(function (s) {
      var vine = document.createElement("span");
      vine.className = "jungle-vine";
      vine.style.left = s.x + "px";
      vine.style.height = (s.len * H) + "px";
      vine.style.animationDelay = s.delay + "s";
      var beads = 4 + Math.floor(Math.random() * 3);
      for (var i = 0; i < beads; i++) {
        var bead = document.createElement("i");
        bead.className = "vine-bead";
        bead.style.top = (14 + i * 16 + Math.random() * 6) + "%";
        bead.style.animationDelay = (Math.random() * 2 - 1) + "s";
        vine.appendChild(bead);
      }
      frontLayer.appendChild(vine);
    });
  }

  function buildSparks() {
    var colors = ["lime", "cyan", "pink", "lime", "cyan"];
    for (var i = 0; i < 16; i++) {
      var spark = document.createElement("i");
      spark.className = "jungle-spark " + colors[i % colors.length];
      spark.style.left = (26 + Math.random() * 70) + "%";
      spark.style.top = (14 + Math.random() * 74) + "%";
      spark.style.setProperty("--dur", (9 + Math.random() * 9).toFixed(1) + "s");
      spark.style.setProperty("--delay", (-Math.random() * 18).toFixed(1) + "s");
      spark.style.setProperty("--sway", ((Math.random() * 60) - 30).toFixed(0) + "px");
      spark.style.animationDelay = spark.style.getPropertyValue("--delay");
      scene.appendChild(spark);
    }
  }


  /* --- cursor parallax (mouse only) ----------------------------------------- */
  var target = { x: 0, y: 0 }, current = { x: 0, y: 0 }, raf = null;

  function applyParallax() {
    var x = current.x, y = current.y;
    stage.style.transform = "translate3d(" + (x * 12).toFixed(2) + "px," + (y * 8).toFixed(2) + "px,0) rotate(" + (x * .6).toFixed(2) + "deg)";
    portalWrap.style.transform = "translate3d(" + (x * 24).toFixed(2) + "px," + (y * 15).toFixed(2) + "px,0)";
    backLayer.style.transform = "translate3d(" + (x * 7).toFixed(2) + "px," + (y * 5).toFixed(2) + "px,0)";
    frontLayer.style.transform = "translate3d(" + (x * 36).toFixed(2) + "px," + (y * 23).toFixed(2) + "px,0)";
  }

  function parallaxLoop() {
    current.x += (target.x - current.x) * .07;
    current.y += (target.y - current.y) * .07;
    var settled = Math.abs(target.x - current.x) < .002 && Math.abs(target.y - current.y) < .002;
    if (settled) { current.x = target.x; current.y = target.y; }
    applyParallax();
    if (!settled) raf = requestAnimationFrame(parallaxLoop); else raf = null;
  }

  function onMove(event) {
    if (event.pointerType === "touch") return;
    var rect = hero.getBoundingClientRect();
    target.x = (event.clientX - rect.left) / Math.max(1, rect.width) - .5;
    target.y = (event.clientY - rect.top) / Math.max(1, rect.height) - .5;
    if (!raf && !reducedMotion) raf = requestAnimationFrame(parallaxLoop);
    var pRect = portal.getBoundingClientRect();
    var px = event.clientX - (pRect.left + pRect.width / 2);
    var py = event.clientY - (pRect.top + pRect.height / 2);
    var d = Math.sqrt(px * px + py * py), r = pRect.width / 2;
    if (d < r * 1.12) scene.classList.add("in");
    else if (d > r * 1.3) scene.classList.remove("in");
  }

  function onLeave() {
    target.x = 0; target.y = 0;
    if (!raf && !reducedMotion) raf = requestAnimationFrame(parallaxLoop);
    scene.classList.remove("in");
  }

  function onDown(event) {
    if (event.pointerType === "touch") return;
    if (event.target && event.target.closest && event.target.closest("a,button,input,textarea,select,label,video,[role='button']")) return;
    var pRect = portal.getBoundingClientRect();
    var px = event.clientX - (pRect.left + pRect.width / 2);
    var py = event.clientY - (pRect.top + pRect.height / 2);
    if (Math.sqrt(px * px + py * py) < pRect.width / 2 * 1.15) {
      scene.classList.add("pulse");
      window.setTimeout(function () { scene.classList.remove("pulse"); }, 540);
    }
  }


  /* Foliage accents across the rest of the page: a swaying frond on every
     section divider, corner foliage on the about photo frame, a frond on each
     project visual, and tiny leaves on the gallery tiles. */
  function buildSectionAccents() {
    document.querySelectorAll(".section-line").forEach(function (line) {
      var frond = frondSVG(26);
      frond.classList.add("jungle-accent", "sway");
      var note = line.querySelector(".section-note");
      if (note) line.insertBefore(frond, note); else line.appendChild(frond);
    });
    var frame = document.querySelector(".media-frame");
    if (frame) {
      var top = document.createElement("span");
      top.className = "jungle-frame-accent";
      top.style.top = "-15px"; top.style.right = "-11px";
      top.style.transform = "rotate(162deg)";
      var tl = leafSVG(46); tl.classList.add("jungle-accent", "sway");
      top.appendChild(tl); frame.appendChild(top);
      var bottom = document.createElement("span");
      bottom.className = "jungle-frame-accent";
      bottom.style.left = "-15px"; bottom.style.bottom = "-13px";
      bottom.style.transform = "rotate(-30deg)";
      var bl = leafSVG(62); bl.classList.add("jungle-accent", "sway");
      bottom.appendChild(bl); frame.appendChild(bottom);
    }
    document.querySelectorAll(".project-visual").forEach(function (visual) {
      var el = frondSVG(36);
      el.classList.add("jungle-leaf");
      el.style.right = "12px"; el.style.top = "10px";
      el.style.transform = "rotate(118deg)";
      el.style.opacity = ".92";
      visual.appendChild(el);
    });
    document.querySelectorAll(".gallery-item").forEach(function (item, index) {
      var el = leafSVG(20);
      el.classList.add("jungle-leaf");
      el.style.right = "8px"; el.style.top = "8px";
      el.style.transform = "translate(-50%,-50%) rotate(" + (120 + (index % 3) * 25) + "deg)";
      el.style.opacity = ".85";
      item.appendChild(el);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildCornerFoliage();
    buildVines();
    buildSparks();
    layoutLeaves();
    buildSectionAccents();
    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointerleave", onLeave);
    hero.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("resize", layoutLeaves);
    window.addEventListener("resize", buildCornerFoliage);
  });
})();

/* Scroll-triggered 3D perspective tilt on sections: each section rotates
   from a slight 3D angle into flat as it enters the viewport. */
(function () {
  "use strict";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;
  var sections = Array.prototype.slice.call(document.querySelectorAll(".section"));
  if (!sections.length || !("IntersectionObserver" in window)) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("section-visible");
        e.target.classList.remove("section-hidden");
      } else {
        e.target.classList.remove("section-visible");
        e.target.classList.add("section-hidden");
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -10% 0px" });
  sections.forEach(function (s) { obs.observe(s); });
})();

