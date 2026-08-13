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
