# Deepak Batra - Personal site

Static portfolio at https://deepbat.github.io/db/.

## Current design

Forest green, lime and warm cream, Lora serif headings and Inter body text. Original implementation inspired by the visual direction of tryatomiq.com, with Deepak's own identity, content, project links and existing photo archive. No Atomiq artwork, product claims or source code is used.

## Editing

- `index.html` contains the markup, SEO metadata, responsive CSS and small interaction script. No build step is needed.
- Project details use native `details` elements.
- Mobile navigation, gallery lightbox and keyboard controls are implemented in the inline script.
- `images/` contains the existing JPG and WebP photo archive.
- `robots.txt` and `sitemap.xml` are retained.
- `styles.css`, `main.js`, `portal3d.js`, `monolith.js` and `react/` are earlier design artifacts. They are not loaded by the current page, and are retained for reference rather than deleted.

The gallery opens full JPG photos from WebP thumbnails. Captions are deliberately neutral: earlier image labels did not match the actual photographs.

## Accessibility and checks

Skip link, keyboard focus styles, semantic headings, mobile navigation state, native disclosure controls and a native dialog photo viewer. Reduced-motion preferences disable animations. Local visual and interaction checks covered desktop, 390px and 320px layouts, navigation, disclosure controls, gallery controls and horizontal overflow.
