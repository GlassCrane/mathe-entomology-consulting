# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page static marketing website for Mathe Entomology Consulting LLC (independent urban entomology / IPM consulting, Patrick T. Mathe). No build step, no framework, no package.json — plain HTML/CSS/JS served as-is.

- `index.html` — the entire page (all sections: hero, marquee, statement, services, specimen gallery, about, contact/footer)
- `css/style.css` — design system via CSS custom properties in `:root` (earthy palette: bone/sand neutrals, forest green, copper accent; Fraunces serif + Inter sans from Google Fonts)
- `js/main.js` — all interactions: GSAP 3 + ScrollTrigger (loaded from cdnjs CDN) plus a vanilla-JS ant cursor trail
- `images/` — logo, headshot, and specimen photos referenced by the page

Note: "Entomology" (correct) is the spelling used everywhere on the site; the local folder name "Mathe Entymology Consulting LLC" is misspelled but harmless — do not "fix" site text to match it.

## Deployment — IMPORTANT

`main` auto-deploys to GitHub Pages at https://glasscrane.github.io/mathe-entomology-consulting/ (legacy Pages build from `main` branch root), served on the custom domain https://matheentomology.com (apex A records + `www` CNAME at GoDaddy; `CNAME` file in the repo root — do not delete it or the custom domain unsets itself). **Every push to `main` is a production deploy. Commit locally, but never `git push` unless the user explicitly asks.**

**Cache busting — IMPORTANT.** Pages serves assets with `Cache-Control: max-age=600`, so a plain browser refresh reuses a stale `style.css`/`main.js` for up to 10 minutes and the change looks like it didn't deploy. `index.html` links both with a `?v=N` query string. **Whenever you change `css/style.css` or `js/main.js`, bump `N` on that file's link in `index.html` in the same commit.**

## Developing / verifying changes

Open `index.html` directly in a browser — no server needed, but internet is required (GSAP + fonts come from CDNs).

For headless verification, Playwright is installed in the session scratchpad (not in this repo — keep it out of the repo). Pattern that works on this machine:

```js
const { chromium } = require('playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true }); // system Edge, no download
await page.goto('file:///C:/source/repos/Mathe%20Entymology%20Consulting%20LLC/index.html');
```

Wait ~2s after load for the hero intro timeline before screenshotting; wiggle the mouse via `page.mouse.move()` to make the ant trail appear; check `pageerror`/console errors before declaring success.

## Animation architecture (js/main.js)

- Everything animated is gated behind a `prefers-reduced-motion` check (`reduceMotion`); reduced-motion users get static content. New animations must respect this gate.
- Scroll reveals are driven by data attributes on markup, not selectors: `data-reveal` (generic fade-up), `data-hero-fade`, `data-parallax="<amount>"`, `data-statement` (word-by-word scrub), `data-count` (stat counter), `data-service`. Add these attributes to new elements rather than writing new tweens.
- The specimen gallery (`#specimens`) is a pinned horizontal-scroll rail on desktop only, via `gsap.matchMedia("(min-width: 981px)")`; below 981px, CSS turns it into a native swipe scroller (`.rail-wrap` overflow rules in the 980px media query). Keep the JS breakpoint and CSS breakpoint in sync.
- The ant cursor trail (bottom of main.js) is a self-contained IIFE: 6 inline-SVG ants follow the pointer in a chain, desktop `(pointer: fine)` only. It uses `gsap.ticker`, not ScrollTrigger.

## Content conventions

- The business phone number 1 (934) 226-8989 appears in the nav, contact section, and is baked into the logo image — update all together.
- Pest photos are presented as "specimen plates" with italic Latin binomials (`.latin` class) and plate numbers; keep new specimens in that format.
- The logo's navy is warmed to match the palette with a CSS filter (`sepia(...)` on `.nav-logo` / `.footer-logo`) — adjust the filter, not the PNG.
