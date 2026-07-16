# Deepak Batra — Portfolio

A personal portfolio built around a **futuristic tech-interface look**: dark space background, glowing gradient accents (cyan → violet), glass panels, an animated grid backdrop, a radial-gauge skills section, and a light mode that keeps the same identity in a brighter register.

**Live Site:** [deepbat.github.io/db](https://deepbat.github.io/db)

---

## How to edit this site (read this first)

This site was built to be easy to keep updating yourself, without needing to touch code you don't recognise.

### Add or change a gallery photo
1. Drop the image file into `/images` (both a `.jpg` and a `.webp` version, same filename).
2. Open `content.js`, find the `gallery` list, and add one line:
   ```js
   { src: "images/your-new-photo", alt: "Describe the photo" },
   ```
   That's it — the grid and the lightbox pick it up automatically. No HTML editing required.

### Add or change a skill
Open `content.js`, find the `skills` list, and add or edit a line:
```js
{ name: "New Skill", value: 80 },
```
The glowing radial gauge is generated automatically from `value` (0–100).

### Edit text (About, Experience, Projects, Achievements, Contact info)
Open `index.html` and search for `EDIT HERE` — every editable block is marked with a comment telling you what it is and, where relevant, what to copy to add another entry (e.g. another job in Experience, another project card, another award).

### Change the color scheme
Open `style.css` and look at the `:root{ ... }` block near the top — every color in the site is a variable there (`--accent`, `--bg`, `--text`, etc.), with a matching `[data-theme="light"]` block just below it for light mode. Change a value once and it updates everywhere.

### Change fonts
The two fonts (`Inter` for body text, `JetBrains Mono` for labels/data) are loaded via Google Fonts in the `<head>` of `index.html`. Swap the `<link>` there and the `font-family` values in `style.css` to change them.

---

## Design system
- **Palette**: near-black background (`#05060a`), glowing cyan-to-violet gradient accent (`#00e5ff` → `#7c5cff`), glass panels with soft borders and hover glow. Light mode swaps to a bright, airy version of the same identity.
- **Type**: Inter for body copy and headlines, JetBrains Mono for labels, data, and nav.
- **Signature elements**: animated grid backdrop, glowing gradient text, an SVG radial gauge per skill, a glowing vertical timeline for experience, glass-panel cards throughout, an animated logo mark in the nav.
- **Hero**: status pill ("Open to new opportunities"), gradient headline, a clean glow-ring photo treatment (no rotation/skeuomorphism), and a floating credential badge.

## Features
- Fully **data-driven gallery and skills** — see "How to edit" above
- **Light/dark mode toggle** (dark is default) with saved preference and system-preference detection
- Animated gradient hero with glowing orbs and grid backdrop
- Radial SVG skill gauges, glowing timeline for experience
- Projects with images and expandable case-study detail
- **Working contact form** (emails you directly via FormSubmit, no backend required)
- Showreel video section
- Gallery with lightbox (keyboard navigation, swipe gestures, counter)
- Scroll-spy navigation highlighting the current section
- Scroll-reveal animations, back-to-top, fully responsive
- Respects `prefers-reduced-motion` and `prefers-color-scheme`
- Skip-to-content link, semantic HTML5 landmarks, ARIA roles/labels throughout
- JSON-LD structured data (Person + WebSite schemas)
- Open Graph + Twitter Card meta tags for social sharing
- SVG favicon, print stylesheet, focus-visible styles
- **Optimized images**: resized, compressed, served as WebP with JPEG fallback — images folder is ~9.8MB, down from the original ~61MB
- `defer` script loading to prevent render blocking

## Contact form setup
The contact form posts to `https://formsubmit.co/deepak.batra@outlook.com` — no backend or account needed. **The first real submission will trigger a one-time confirmation email from FormSubmit to that address; click the link in it to activate the form.** After that, all submissions are delivered straight to the inbox. To change the destination email, edit the `action` attribute on `#contactForm` in `index.html` (and the `mailto:` links alongside it).

## Files
- `index.html` — structure, content, semantic markup, meta tags, structured data. Search `EDIT HERE` for editable content.
- `content.js` — **the file you'll touch most often**: gallery photos and skills list.
- `style.css` — design tokens (`:root`), layout, responsive breakpoints, print styles.
- `script.js` — renders gallery/skills from `content.js`, then handles nav, theme toggle, lightbox, scroll-reveal, contact form.
- `images/` — photos & showreel video.

## Accessibility
- Full keyboard navigation with visible focus indicators
- Screen reader friendly with ARIA attributes and semantic HTML
- `prefers-reduced-motion` respected throughout
- Skip-to-content link, proper heading hierarchy
- Touch targets minimum 44×44px
- Descriptive, unique image alt text

## Usage
Open the folder in Visual Studio Code and use the **Live Server** extension, or just open `index.html` directly in a browser.
