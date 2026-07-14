# Deepak Ultimate Portfolio

A clean, professional personal portfolio styled after the University of Bath website — light theme, strong typography, Bath purple (`#512886`) accent, and card-based content blocks.

**Live Site:** [deepbat.github.io/db](https://deepbat.github.io/db)

## Features
- Bath-style **utility bar** + sticky navigation with mobile hamburger menu
- **Hero** with purple gradient overlay and scroll indicator
- **Highlights** stat strip
- About, Experience cards, Skills with animated progress bars, Projects with images
- **Showreel** video section with captions track support
- **Gallery** with lightbox (keyboard navigation, swipe gestures, counter)
- **Achievements** highlight cards
- Structured multi-column footer
- Scroll-reveal animations, back-to-top, fully responsive
- Respects `prefers-reduced-motion`
- Skip-to-content link for keyboard accessibility
- Semantic HTML5 landmarks (`main`, `nav`, `header`, `footer`, `section`, `article`, `aside`)
- ARIA roles, labels, and live regions throughout
- JSON-LD structured data (Person + WebSite schemas)
- Open Graph + Twitter Card meta tags for social sharing
- SVG favicon
- Print stylesheet
- Focus-visible styles for keyboard navigation
- Touch-friendly tap targets (minimum 44px)
- Performance optimized: `requestAnimationFrame` throttling, `contain` properties, passive scroll listeners
- IIFE-scoped JavaScript with null safety checks
- Mobile menu focus trapping and Escape key dismissal
- Lightbox swipe gesture support for mobile
- `defer` script loading to prevent render blocking

## Files
- `index.html` — structure, content, semantic markup, meta tags, structured data
- `style.css` — Bath purple light theme, layout, responsive breakpoints, print styles
- `script.js` — menu, scroll reveal, video, gallery lightbox with swipe support
- `images/` — photos & cinematic video

## Accessibility
- Full keyboard navigation with visible focus indicators
- Screen reader friendly with ARIA attributes and semantic HTML
- `prefers-reduced-motion` respected throughout
- Skip-to-content link
- Proper heading hierarchy (h1 > h2 > h3 > h4)
- Color contrast ratios meet WCAG AA standards
- Touch targets minimum 44x44px
- Image alt texts are descriptive and unique

## Usage
Open the folder in Visual Studio Code and use the **Live Server** extension, or just open `index.html`.
