# Deepak Batra — Interactive Portfolio

This is the **self-contained static version** of the redesigned portfolio. It is intentionally structured like the supplied original package: open `index.html`, keep `style.css`, `script.js`, `content.js`, and the local `images/` directory together, and commit the folder directly to GitHub.

The site does not require React, a bundler, an API key, or Manus storage. Its main interaction layer is implemented in plain JavaScript. Tapping the page creates water ripples, holding and dragging with a mouse sculpts the surface, the hanging droplets respond to the pointer, and grabbing a droplet produces a short harmonic chime through the browser’s Web Audio API. Browsers require a user gesture before audio can play; the first intentional tap arms it.

The navigation includes a **Dark / Light** theme switcher. The preference is stored in `localStorage`, and the first visit follows the visitor’s operating-system color preference when no saved choice exists.

The water instrument now has a reliable DOM/CSS visual layer in addition to its canvas texture. This keeps the droplets and surface rings visibly present in both themes even when a browser delays or suppresses a canvas frame. The gallery also uses pointer-driven 3D tilt, image parallax, highlight depth, and a reduced-motion fallback across all twelve photos.

## Run locally

You can open `index.html` directly, but a local server is recommended because browsers handle media and form requests more consistently over HTTP.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Commit to GitHub

```bash
git init
git add .
git commit -m "Add interactive Deepak Batra portfolio"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```

The contact form currently posts to `formsubmit.co` using the email address from the supplied portfolio. Replace that endpoint if you want to use a different form service.
