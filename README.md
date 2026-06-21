# Lyric Scroller

A simple, mobile-first app for pasting song lyrics and auto-scrolling through them at an adjustable speed and font size — like a basic teleprompter for singers/musicians. Songs are saved to your browser's local storage, no backend required.

Built with Vite + React + **Tailwind CSS v4** (via the `@tailwindcss/vite` plugin — no `postcss.config.js`/`autoprefixer` needed; v4 handles vendor prefixing internally via Lightning CSS, and theme tokens live in `src/index.css` under `@theme` instead of a `tailwind.config.js`).

## Features
- Paste lyrics, set a title/artist, save to your device (localStorage)
- Searchable dropdown of saved songs
- Adjustable font size and auto-scroll speed, with play/pause/restart
- Mobile-first layout, works fully offline once loaded

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## Build

```bash
npm run build
```

Outputs static files to `dist/`.

## Deploy to GitHub Pages

This project is preconfigured with `base: './'` in `vite.config.js`, so the build uses relative asset paths and works on GitHub Pages regardless of your repo name — no extra config needed.

**Option A — gh-pages package (easiest):**

1. Create a GitHub repo and push this project to it.
2. Install the deploy dependency (already in `package.json`) and run:
   ```bash
   npm install
   npm run deploy
   ```
   This builds the app and pushes `dist/` to a `gh-pages` branch.
3. In your repo on GitHub: **Settings → Pages → Build and deployment → Source**, choose **Deploy from a branch**, then branch `gh-pages` / folder `/ (root)`.
4. Your app will be live at `https://<username>.github.io/<repo-name>/`.

**Option B — GitHub Actions:**

1. Push this project to a GitHub repo.
2. In **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions** and use the included "Static HTML" / Vite workflow template (or run `npm run build` and upload `dist/` as the Pages artifact).

## Notes
- All data lives in your browser's localStorage — it does not sync between devices or browsers, and clearing site data will remove saved songs.
- No backend, accounts, or network requests are required to use the app.
