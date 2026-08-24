# Deepak Batra — personal space

A personal website: things I build, explore and find interesting.
React + Three.js (React Three Fiber) + Vite, deployed to GitHub Pages at `/db/`.

## Edit content

All text lives in **`src/data/site.js`** — about, builds, tech lab, notes, now, contact.

**Gallery** — `src/data/gallery.js`:
1. Drop an image into `public/images/` (WebP, ideally under ~400KB)
2. Add an entry: `{ src, alt, caption, category }`
3. Delete an entry to remove a photo. That's it.

**"Now" section** — update `now.items` + `now.updated` in `src/data/site.js`.

## Run locally

```bash
npm install
npm run dev
```

## Build & deploy (GitHub Pages)

The site deploys via GitHub Actions (`.github/workflows/deploy.yml`):

1. Repo **Settings → Pages → Source: GitHub Actions**
2. Push to `main` — the workflow builds and publishes automatically.

Manual check before pushing:

```bash
npm run build
npm run preview   # serves dist/ — check everything at /db/
```

## Notes

- `base: "/db/"` in `vite.config.js` must match the repo path.
- 3D quality adapts to the device (particle count, resolution, antialiasing);
  reduced-motion users get a static, calm version; no WebGL → CSS backdrop.
- `verify.mjs` is a local-only screenshot/console-error checker (not deployed).
