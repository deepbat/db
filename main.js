/* ─────────────────────────────────────────────────────────────
   DEEPAK BATRA — personal space
   Simple interaction engine. No framework or build step.
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  /* ── Lab data ── */
  var labItems = [
    { label: "AI", desc: "Exploring what AI can practically do — tools, assistants and workflows.", tools: "ChatGPT · Gemini · AI-assisted writing" },
    { label: "LOCAL LLM", desc: "Experimenting with local AI models, tools and workflows.", tools: "Ollama · LM Studio · small open models" },
    { label: "AUTOMATION", desc: "Scripts and workflows that quietly take over repetitive work.", tools: "Batch jobs · templates · macros" },
    { label: "WINDOWS", desc: "Home turf — tweaks, tools and what's happening under the hood.", tools: "Windows 11 · Terminal · Sysinternals" },
    { label: "POWERSHELL", desc: "My favourite hammer for quiet, repeatable work.", tools: "PowerShell 7 · modules · scheduled tasks" },
    { label: "GITHUB", desc: "Code, experiments and this site — versioned and public.", tools: "Repos · Actions · Pages" },
    { label: "GOOGLE WORKSPACE", desc: "Docs, Sheets and Drive, pushed beyond the defaults.", tools: "Apps Script · Sheets · Drive CLI" },
    { label: "WEB", desc: "Websites as a playground — layout, motion and interaction.", tools: "HTML / CSS / JS · React · Vite" },
    { label: "THREE.JS", desc: "Learning to build small 3D worlds that run in a browser tab.", tools: "WebGL · React Three Fiber · shaders" },
    { label: "DESKTOP SOFTWARE", desc: "Real apps for real desks — like the scholarship manager.", tools: "Windows · UI work · packaging" }
  ];

  /* ── Gallery data ── */
  var galleryData = [
    { src: "images/gallery-02", alt: "At a photography exhibition", caption: "At a photography exhibition" },
    { src: "images/hero", alt: "Mountains, flowers, good company", caption: "Mountains, flowers, good company" },
    { src: "images/gallery-01", alt: "Family function", caption: "Family function" },
    { src: "images/gallery-04", alt: "Jalandhariye", caption: "Jalandhariye" },
    { src: "images/gallery-06", alt: "Birthday at home", caption: "Birthday at home" },
    { src: "images/gallery-05", alt: "Rooftop, after dark", caption: "Rooftop, after dark" },
    { src: "images/gallery-08", alt: "Store mirror", caption: "Store mirror" },
    { src: "images/gallery-11", alt: "Wedding season", caption: "Wedding season" },
    { src: "images/gallery-12", alt: "Night show", caption: "Armoured vehicle, night show" }
  ];

  /* ── Theme toggle ── */
  function initTheme() {
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
  }

  /* ── Navigation ── */
  function initNavigation() {
    var nav = document.querySelector(".site-nav");
    var menu = document.getElementById("mobileMenu");
    var toggle = document.querySelector(".menu-toggle");
    var closeBtn = document.querySelector(".mobile-close");

    var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));

    // Scroll spy
    if ("IntersectionObserver" in window) {
      var activeId = null;
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) activeId = e.target.id; });
        navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href").slice(1) === activeId); });
      }, { threshold: 0, rootMargin: "-40% 0px -55% 0px" });
      sections.forEach(function (s) { spy.observe(s); });
    }

    // Nav background on scroll
    window.addEventListener("scroll", function () {
      nav.classList.toggle("scrolled", window.scrollY > 20);
    }, { passive: true });

    // Mobile menu
    function closeMenu() {
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      document.documentElement.classList.remove("menu-open");
    }
    function openMenu() {
      menu.classList.add("open");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      document.documentElement.classList.add("menu-open");
    }

    if (toggle) toggle.addEventListener("click", function () {
      menu.classList.contains("open") ? closeMenu() : openMenu();
    });
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) closeMenu();
    });
  }

  /* ── Hero section reveal ── */
  function initHeroReveal() {
    var els = document.querySelectorAll(".hero-content [data-reveal], .hero-content .eyebrow, .hero-content .hero-index, .hero-content h1, .hero-content .hero-lower, .hero-content .hero-bottom");
    if (!els.length) return;
    els.forEach(function (el, i) {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      el.style.transition = "opacity .8s ease " + (i * 0.12) + "s, transform .8s cubic-bezier(.23,1,.32,1) " + (i * 0.12) + "s";
      setTimeout(function () { el.style.opacity = "1"; el.style.transform = "none"; }, 100);
    });
  }

  /* ── Lab grid ── */
  function renderLab() {
    var grid = document.getElementById("labGrid");
    if (!grid) return;
    labItems.forEach(function (item) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "lab-card";
      card.innerHTML =
        '<span class="lab-card-label mono">' + item.label + '</span>' +
        '<span class="lab-card-desc">' + item.desc + '</span>' +
        '<span class="lab-card-tools mono">' + item.tools + '</span>';
      grid.appendChild(card);
    });
  }

  /* ── Gallery ── */
  var modal, modalImage, modalTitle, modalCount, currentPhoto = 0, _lastFocused = null;

  function openGallery(index) {
    currentPhoto = (index + galleryData.length) % galleryData.length;
    var item = galleryData[currentPhoto];
    // Try webp first, fall back to jpg
    modalImage.src = item.src + ".webp";
    modalImage.alt = item.alt;
    modalTitle.textContent = item.caption || item.alt;
    modalCount.textContent = String(currentPhoto + 1).padStart(2, "0") + " / " + String(galleryData.length).padStart(2, "0");
    _lastFocused = document.activeElement;
    modal.setAttribute("aria-hidden", "false");
    modal.style.visibility = "visible";
    var closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeGallery() {
    modal.setAttribute("aria-hidden", "true");
    modal.style.visibility = "hidden";
    if (_lastFocused && _lastFocused.focus) _lastFocused.focus();
    _lastFocused = null;
  }

  function stepGallery(amount) { openGallery(currentPhoto + amount); }

  function renderGallery() {
    var grid = document.getElementById("galleryGrid");
    if (!grid) return;
    galleryData.forEach(function (item, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-item";
      button.setAttribute("aria-label", "Open " + item.alt);
      button.innerHTML =
        '<picture><source srcset="' + item.src + '.webp" type="image/webp"><img src="' + item.src + '.jpg" alt="' + item.alt + '" loading="lazy"></picture>' +
        '<span class="mono">' + String(index + 1).padStart(2, "0") + ' / ' + (item.caption || item.alt) + '</span>';
      button.addEventListener("click", function () { openGallery(index); });
      grid.appendChild(button);
    });
  }

  function initModal() {
    modal = document.getElementById("galleryModal");
    modalImage = document.getElementById("modalImage");
    modalTitle = document.getElementById("modalTitle");
    modalCount = document.getElementById("modalCount");
    if (!modal) return;

    modal.querySelector(".modal-close").addEventListener("click", closeGallery);
    modal.querySelector(".modal-prev").addEventListener("click", function () { stepGallery(-1); });
    modal.querySelector(".modal-next").addEventListener("click", function () { stepGallery(1); });
    modal.addEventListener("click", function (event) { if (event.target === modal) closeGallery(); });
    document.addEventListener("keydown", function (event) {
      if (modal.getAttribute("aria-hidden") === "false") {
        if (event.key === "Escape") closeGallery();
        if (event.key === "ArrowLeft") stepGallery(-1);
        if (event.key === "ArrowRight") stepGallery(1);
      }
    });

    // Touch swipe
    var sx = 0;
    modal.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    modal.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) stepGallery(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* ── Project case toggles ── */
  function initProjects() {
    document.querySelectorAll(".case-toggle").forEach(function (button) {
      var card = button.closest(".project-card");
      var detail = card ? card.querySelector(".case-detail") : null;
      if (detail) {
        detail.style.cssText = "overflow:hidden;max-height:0;margin-top:0;padding-top:0;opacity:0;transition:max-height .38s ease,opacity .28s ease,margin-top .28s ease,padding-top .28s ease";
      }
      button.addEventListener("click", function () {
        var open = card.classList.toggle("open");
        button.setAttribute("aria-expanded", String(open));
        button.textContent = open ? "− Read less" : "+ Read more";
        if (detail) {
          if (open) {
            detail.style.maxHeight = detail.scrollHeight + 40 + "px";
            detail.style.opacity = "1";
            detail.style.marginTop = "16px";
            detail.style.paddingTop = "15px";
          } else {
            detail.style.maxHeight = "0";
            detail.style.opacity = "0";
            detail.style.marginTop = "0";
            detail.style.paddingTop = "0";
          }
        }
      });
    });
  }

  /* ── Contact form ── */
  function initContact() {
    var form = document.getElementById("contactForm");
    var status = document.getElementById("formStatus");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var submit = form.querySelector("button[type='submit']");
      submit.disabled = true;
      submit.textContent = "Sending…";
      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (response) {
        if (!response.ok) throw new Error("Request failed");
        form.reset();
        status.textContent = "Message sent — I'll get back to you soon.";
        status.className = "form-status success";
      }).catch(function () {
        status.textContent = "Something went wrong. Please email deepak.batra@outlook.com directly.";
        status.className = "form-status error";
      }).finally(function () {
        submit.disabled = false;
        submit.textContent = "Send message ↗";
      });
    });
  }

  /* ── Year in footer ── */
  function initYear() {
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ── Init ── */
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initNavigation();
    initHeroReveal();
    renderLab();
    renderGallery();
    initModal();
    initProjects();
    initContact();
    initYear();
  });
})();
