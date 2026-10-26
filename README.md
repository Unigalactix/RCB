# RCB Forever

A responsive, independent Royal Challengers Bengaluru fan website. Vanilla HTML, CSS, and JavaScript: no framework, API keys, backend, or runtime dependencies.

## Run locally

Requires Node.js 22 or newer.

```powershell
npm run dev
```

Open http://127.0.0.1:4173. Run `npm test` for data, filters, quiz, and asset checks. Run `npm run build` to produce `dist`, then `node scripts\serve.js --dist` to preview the production site.

## Verification

Seven Node tests cover profile integrity, combined search/filter behavior, historical milestones, all 18 archived IPL finishes, quiz data and scoring bounds, asset/anchor integrity, and HTTP responses. The production build was also checked in Chromium under a repository-style subpath: player dialogs and Escape/focus restoration, mobile navigation, season selection, timeline changes, perfect-score quiz/replay, reduced motion, and widths of 320, 375, 390, 768, 1024, and 1440 pixels. No horizontal overflow or browser console errors were observed.

## Publish on GitHub Pages

1. Create a GitHub repository and push these files to its `main` branch.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions**.
3. The included [Pages workflow](.github/workflows/pages.yml) tests, builds, and deploys automatically on pushes to `main`. It can also be started manually from Actions.
4. Open the deployment URL shown by the workflow, usually `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

No custom domain or base-path configuration is required: all site assets use relative URLs. There are no SPA routes to break on refresh. If your default branch is not `main`, update the workflow branch filter. GitHub Pages availability depends on repository visibility and your GitHub plan.

Repository: [Unigalactix/RCB](https://github.com/Unigalactix/RCB). Commit and push conventions, including the required Unigalactix identity, are recorded in [AGENTS.md](AGENTS.md).

## Features

- Original trophy illustration, jersey player cards, editorial sports layout, responsive navigation.
- Searchable men's, women's, and legend profiles with accessible native dialogs.
- Interactive historical timeline and five-question quiz with feedback and replay.
- Club factfile and a season selector covering every IPL finish from 2008 through 2025.
- Historical final scorecard, curated reading links, source/credits dialog.
- Reduced-motion support, skip link, keyboard focus, semantic sections, live announcements.
- Static content remains readable without JavaScript; interactive components need JavaScript.

## Content and editorial scope

This is a **historical championship archive**, not a current squad directory, live scoreboard, or exhaustive club encyclopedia. Men's squad selections are from IPL 2025; women's selections are from WPL 2024. The timeline ends on 3 June 2025. Facts were compiled on 26 October 2026. Current news is available through links to the official club website rather than an unreliable browser-side scraper.

Historical names use Bangalore where appropriate; the current club name is Royal Challengers Bengaluru.

Sources include [RCB](https://www.royalchallengers.com/), the [official IPL 2025 final report](https://www.iplt20.com/news/article/tata-ipl-2025-final-rcb-vs-pbks-match-report), [IPL historical statistics](https://www.iplt20.com/stats/2016), [CricIndeed's season archive](https://cricindeed.com/rcb-ipl-results-every-year/), and [NDTV's WPL 2024 final coverage](https://sports.ndtv.com/cricket/delhi-capitals-vs-royal-challengers-bangalore-live-score-wpl-2024-final-dc-vs-rcb-women-live-updates-5255877). The supplied Medium reference returned HTTP 403 during research. The reference sites informed the subject and editorial direction; their designs and articles were not copied.

## Updating content

Edit [data.js](data.js) for featured players, milestones, and quiz questions. Keep statistics tied to explicit seasons and update the cutoff wording in the page and this document if extending the archive. Static match and story content lives in [index.html](index.html); visual styles are in [styles.css](styles.css).

## Rights and privacy

Unofficial fan project. Not affiliated with or endorsed by RCB, IPL, WPL, or any player. The monogram, trophy, and jersey illustrations are original graphics, not official marks or merchandise. Team and player names are used to identify the subject. Do not add protected photography or official assets without appropriate permission.

No accounts, analytics, forms, tracking, or local storage. Google Fonts is the only external render-time dependency; system fonts are used if it is unavailable. External reading links open the credited publishers. All interactive data is bundled locally.
