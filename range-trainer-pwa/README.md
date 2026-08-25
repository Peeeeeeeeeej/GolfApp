# Range Trainer (PWA)

A club-by-club swing trainer for the driving range — installable on Android
straight from Chrome, no app store needed.

## Install on your phone

1. Host these files somewhere reachable from your phone's browser. The
   simplest options:
   - **GitHub Pages**: push this folder to a repo, enable Pages, done.
   - **Netlify / Vercel drop**: drag the folder onto their web dashboard.
   - **Quick local test**: from this folder, run `python3 -m http.server 8000`
     on your computer, then visit `http://<your-computer's-LAN-IP>:8000` from
     your phone (same Wi-Fi network).
2. Open the site in **Chrome on Android**.
3. Tap the **⋮ menu → Install app** (or you'll see an "Add to Home screen"
   banner). Chrome installs it like a native app — own icon, own window, no
   browser chrome.

## Notes

- All your swing data and club list are stored **locally on your phone**
  (`localStorage`), nothing is sent anywhere. Data is per-device — it won't
  sync between your phone and a laptop unless you're viewing the same
  browser profile.
- The app works **offline** after the first load — a service worker caches
  the app shell (HTML/JS/icons + the React library) so you can log swings
  on the range with no signal.
- To push an update later: edit `app.js` (or re-generate it — see below),
  bump `CACHE_NAME` in `service-worker.js` (e.g. `range-trainer-v2`) so
  installed devices pick up the new version, and re-deploy.

## Regenerating app.js

`app.js` is compiled from JSX via Babel (`@babel/preset-react`, classic
runtime, script mode — no bundler, no modules). If you hand-edit the JSX
source and want to recompile it yourself elsewhere:

```
npx @babel/cli --presets @babel/preset-react app.source.jsx -o app.js
```

(with `runtime: classic` set in a `.babelrc`, since `React`/`ReactDOM` are
globals here, not imports).
