# Deepak Batra — Personal Site

Single-page personal site. No build step, no framework.

## Structure

| File             | Owns                                                             |
| ---------------- | ---------------------------------------------------------------- |
| `index.html`     | Markup, SEO, schema.org JSON-LD, content                         |
| `styles.css`     | All styles, light/dark theme, responsive, reduced-motion         |
| `main.js`        | Navigation, scrollspy, scroll progress, back-to-top, theme, gallery, modals, project reveals, skill bars, hero stats |
| `portal3d.js`    | Three.js WebGL portal (loaded as ES module)                      |
| `monolith.js`    | Three.js WebGL monolith (loaded as ES module)                    |
| `react/`         | A single `.jsx` artifact kept for future use; **not loaded**     |
| `images/`        | JPG + WebP variants for all photos                               |
| `robots.txt`     | Crawler hints + sitemap location                                 |
| `sitemap.xml`    | Sitemap for crawlers                                             |

## Editing content

Skills and gallery items live at the top of `main.js` in `window.SITE_CONTENT`. Edit there, no JS knowledge required.

## Editing the gallery

Each entry in `SITE_CONTENT.gallery`:

```js
{ src: "images/gallery-NN", alt: "...", title: "...", place: "..." }
```

`title` is the short headline; `place` is shown in the modal.

## Performance notes

- All `<script>` tags use `defer` (module scripts defer by default).
- The hero has 3 canvases + a WebGL scene + a jungle DOM scene. They auto-pause via `IntersectionObserver` when the hero scrolls off-screen.
- `<picture>` elements prefer `.webp` and fall back to `.jpg`.
- The hero image is preloaded with `fetchpriority="high"`.

## Accessibility

- All interactive elements have `:focus-visible` rings.
- A skip link jumps to `<main>`.
- `prefers-reduced-motion` disables canvas animation, jungle DOM, drop beads, water ripples and 3D parallax.
- The gallery modal traps focus and restores it on close.
- Mobile menu traps focus and locks body scroll while open.

## To do (manual)

1. **Replace the About portrait** — currently uses `hero.jpg`. Drop a real portrait at `images/portrait.jpg` (and `.webp`) and swap the `<source>` in the About section.
2. **Confirm GitHub username** — `https://github.com/deepbat` is a placeholder. Update in: `index.html` (nav, mobile menu, footer, JSON-LD), and this README.
3. **Pick the real numbers** in `.hero-stats` — the current `6+`, `12`, `3` are illustrative.
