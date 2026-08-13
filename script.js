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
      lastInteraction = performance.now(); addRipple(p.x, p.y, .45, "cyan"); setSurfaceStatus("ripple / chime");
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
      if (!sculpting && moved < 11) { addRipple(p.x, p.y, .9, "lime"); playChime(Math.round((p.x / Math.max(1, width)) * 15) - 7, .72); lastInteraction = performance.now(); setSurfaceStatus("ripple / chime"); }
      pointerDown = false; sculpting = false; setTimeout(function () { setSurfaceStatus("Tap for ripples · hold to sculpt"); }, 620);
    }
    function render(time) {
      var delta = Math.min(32, time - lastTime); lastTime = time; ctx.clearRect(0, 0, width, height);
      if (!pointerDown && !reducedMotion && time - lastInteraction > 5200) { addRipple(width * (.32 + Math.random() * .36), height * (.32 + Math.random() * .36), .46, Math.random() > .6 ? "lime" : "cyan"); lastInteraction = time; }
      var wash = ctx.createRadialGradient(width * .6, height * .35, 0, width * .5, height * .55, Math.max(width, height) * .72);
      wash.addColorStop(0, "rgba(25,68,72,.12)"); wash.addColorStop(.45, "rgba(8,20,24,.08)"); wash.addColorStop(1, "rgba(3,8,11,.02)"); ctx.fillStyle = wash; ctx.fillRect(0, 0, width, height);
      for (var r = ripples.length - 1; r >= 0; r--) {
        var ripple = ripples[r]; ripple.radius += ripple.speed * (delta / 16); ripple.alpha *= .992;
        if (ripple.alpha < .028 || ripple.radius > Math.max(width, height) * .74) { ripples.splice(r, 1); continue; }
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

  function renderSkills() { var list = document.getElementById("skillList"); if (!list) return; content.skills.forEach(function (skill, index) { var row = document.createElement("div"); row.className = "skill-row"; row.innerHTML = '<div class="skill-meta"><span class="num mono">0' + (index + 1) + '</span><h3>' + skill.name + '</h3><span class="value mono">' + skill.value + '%</span></div><div class="skill-track"><i style="width:' + skill.value + '%"></i></div>'; list.appendChild(row); }); }
  function renderGallery() { var grid = document.getElementById("galleryGrid"); if (!grid) return; content.gallery.forEach(function (item, index) { var button = document.createElement("button"); button.type = "button"; button.className = "gallery-item"; button.setAttribute("aria-label", "Open " + item.alt); button.innerHTML = '<picture><source srcset="' + item.src + '.webp" type="image/webp"><img src="' + item.src + '.jpg" alt="' + item.alt + '" loading="lazy"></picture><span class="mono">' + String(index + 1).padStart(2, "0") + ' / ' + item.alt + '</span>'; button.addEventListener("click", function () { openGallery(index); }); grid.appendChild(button); }); }
  var modal = document.getElementById("galleryModal"), modalImage = document.getElementById("modalImage"), modalTitle = document.getElementById("modalTitle"), modalCount = document.getElementById("modalCount"), currentPhoto = 0;
  function openGallery(index) { currentPhoto = (index + content.gallery.length) % content.gallery.length; var item = content.gallery[currentPhoto]; modalImage.src = item.src + ".jpg"; modalImage.alt = item.alt; modalTitle.textContent = item.alt; modalCount.textContent = String(currentPhoto + 1).padStart(2, "0") + " / " + String(content.gallery.length).padStart(2, "0"); modal.setAttribute("aria-hidden", "false"); }
  function closeGallery() { modal.setAttribute("aria-hidden", "true"); }
  function stepGallery(amount) { openGallery(currentPhoto + amount); }

  function initProjects() { document.querySelectorAll(".case-toggle").forEach(function (button) { button.addEventListener("click", function () { var card = button.closest(".project-card"), open = card.classList.toggle("open"); button.setAttribute("aria-expanded", String(open)); button.textContent = open ? "− Show less" : "+ Open the case"; }); }); }
  function initNavigation() { var nav = document.querySelector(".site-nav"), menu = document.getElementById("mobileMenu"), toggle = document.querySelector(".menu-toggle"), close = document.querySelector(".mobile-close"); window.addEventListener("scroll", function () { nav.classList.toggle("scrolled", window.scrollY > 20); }, { passive: true }); function closeMenu() { menu.classList.remove("open"); menu.setAttribute("aria-hidden", "true"); toggle.setAttribute("aria-expanded", "false"); } toggle.addEventListener("click", function () { var open = menu.classList.toggle("open"); menu.setAttribute("aria-hidden", String(!open)); toggle.setAttribute("aria-expanded", String(open)); }); close.addEventListener("click", closeMenu); menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); }); }
  function initContact() { var form = document.getElementById("contactForm"), status = document.getElementById("formStatus"); if (!form) return; form.addEventListener("submit", function (event) { event.preventDefault(); var submit = form.querySelector("button[type='submit']"); submit.disabled = true; submit.textContent = "Sending…"; fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } }).then(function (response) { if (!response.ok) throw new Error("Request failed"); form.reset(); status.textContent = "Message sent — I’ll get back to you soon."; status.className = "form-status success"; }).catch(function () { status.textContent = "Something went wrong. Please email deepak.batra@outlook.com directly."; status.className = "form-status error"; }).finally(function () { submit.disabled = false; submit.textContent = "Send message ↗"; }); }); }
  function initModal() { document.querySelector(".modal-close").addEventListener("click", closeGallery); document.querySelector(".modal-prev").addEventListener("click", function () { stepGallery(-1); }); document.querySelector(".modal-next").addEventListener("click", function () { stepGallery(1); }); modal.addEventListener("click", function (event) { if (event.target === modal) closeGallery(); }); document.addEventListener("keydown", function (event) { if (modal.getAttribute("aria-hidden") === "false") { if (event.key === "Escape") closeGallery(); if (event.key === "ArrowLeft") stepGallery(-1); if (event.key === "ArrowRight") stepGallery(1); } }); }
  document.addEventListener("DOMContentLoaded", function () { var year = document.getElementById("year"); if (year) year.textContent = new Date().getFullYear(); renderSkills(); renderGallery(); initProjects(); initNavigation(); initContact(); initModal(); initWater(); initChimes(); });
})();
