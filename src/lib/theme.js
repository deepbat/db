import { store } from "./store";

export function applyTheme(theme) {
  store.theme = theme;
  document.documentElement.dataset.theme = theme;
  window.dispatchEvent(new CustomEvent("db:theme", { detail: theme }));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#edece7" : "#05070c");
}

export function currentTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function toggleTheme() {
  const next = currentTheme() === "light" ? "dark" : "light";
  localStorage.setItem("db-theme", next);
  if (!store.reducedMotion) {
    document.documentElement.classList.add("theme-switching");
    window.setTimeout(
      () => document.documentElement.classList.remove("theme-switching"),
      550
    );
  }
  applyTheme(next);
}
