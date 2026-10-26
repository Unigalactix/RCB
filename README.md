# RCB Forever

A responsive, independent Royal Challengers Bengaluru fan website. Vanilla HTML, CSS, and JavaScript: no framework, API keys, backend, or runtime dependencies.

## Run locally

Requires Node.js 22 or newer.

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:4173. Run `npm test` for data, filters, quiz, and asset checks. Run `npm run build` to produce `dist`, then `node scripts\serve.js --dist` to preview the production site.

## Verification

Node tests cover profile integrity, filters, milestones, league participation, source integrity, leaderboard sorting, comparisons, null handling, original image dimensions, matchday scorelines, historical roster coverage, full seasonal data, boundary/extra/dismissal aggregation, super-over exclusions, quiz scoring, local assets, and HTTP responses. Browser checks exercise hero/match controls, season tables, roster coverage, navigation, dialogs, galleries, reduced motion, and repository-subpath loading. Responsive widths: 320, 375, 390, 768, 1024, and 1440 pixels.

## Publish on GitHub Pages

1. Create a GitHub repository and push these files to its `main` branch.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions**.
3. The included [Pages workflow](.github/workflows/pages.yml) tests, builds, and deploys automatically on pushes to `main`. It can also be started manually from Actions.
4. Open the deployment URL shown by the workflow, usually `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

No custom domain or base-path configuration is required: all site assets use relative URLs. There are no SPA routes to break on refresh. If your default branch is not `main`, update the workflow branch filter. GitHub Pages availability depends on repository visibility and your GitHub plan.

If using **Deploy from a branch → main → /(root)** as in the supplied screenshot, the source files are also directly publishable; the root `.nojekyll` file disables Jekyll processing. GitHub Actions is the recommended tested deployment path. Use one deployment method consistently.

Repository: [Unigalactix/RCB](https://github.com/Unigalactix/RCB). Commit and push conventions, including the required Unigalactix identity, are recorded in [AGENTS.md](AGENTS.md).

## Features

- **Multi-page architecture** (`index.html`, `squad.html`, `seasons.html`, `history.html`, `moments.html`) with a Dribbble-inspired Club Team Page Bento Dashboard (`#club-dashboard`) and unified RCB Obsidian Black (`#0B0B0B`), Crimson Red (`#CC1F26`), and Championship Gold (`#D4AF37`) glassmorphic visual system.
- **"The Chronicles of Bold" Interactive Infographic & Fan Experience (`infographic.js`)**:
  - **Cinematic Hero & Live Season Countdown (`#season-countdown` & `#stadium-ambient-canvas`)**: Ambient M. Chinnaswamy floodlight/crowd canvas loop and real-time countdown to the next season opener.
  - **Scroll-Driven Logo & Jersey Evolution (`#vertical-evolution`)**: Vertical timeline dynamically transitioning the 2008–2026 RCB crests, SVG jersey silhouettes, and era background glow.
  - **All-Time Legends Digital Infographic (`#legends-infographic`)**: Career progression bars, interactive 360° Chinnaswamy run-scoring wagon wheels (`#wagon-wheel-svg`), milestone badges, and insider trivia for Virat Kohli, AB de Villiers, Chris Gayle, and Smriti Mandhana.
  - **Global Red & Green ("Go Green") Toggle (`#go-green-toggle`)**: Switches the entire site between Classic Red & Gold and RCB's Go Green conservation jersey theme.
  - **The 12th Man Jersey Customizer (`#jersey-customizer`)**: Live Name, Number, and Kit Edition preview with instant 1080×1350 PNG wallpaper download (`#download-jersey-btn`).
  - **125 dB Chinnaswamy Decibel Meter Engine (`#decibel-engine`)**: Press-and-hold "UNLEASH THE ROAR" visualizer scaling from 80 dB to 125 dB with screen-shake micro-animations.
  - **Fan Tribute Wall & Virtual Stadium Horn (`#fan-tribute-wall` & `#stadium-horn-btn`)**: Live fan tribute mosaic, Chinnaswamy chants, and full-screen soundwave horn ripple.
  - **Championship Star Easter Egg (`#championship-star-btn`)**: Top-navbar gold star launching full-screen red and gold canvas confetti (`#confetti-canvas`) and a glowing 4× Trophy overlay.
- **2008–2026 RCB Crest & Logo Evolution** (`#logo-history` & `assets/logos/`): Displays all five historical RCB crests (`2008`, `2009–2015`, `2016–2019`, `2020–2023`, `2024–2026`), plus a pure-vector `assets/mark.svg` and `assets/photos/rcb-logo.png` used across the header, hero, championship cards, jerseys, and footer.
- **2026-first hero**, dedicated IPL/WPL 2026 title cards, interactive final scoreboards, and the **2024 6-Match Miracle Comeback Streak** (`#comeback-streak` covering every win from 25 April in Hyderabad to the 18 May knockout against CSK).
- **Full seasonal match-participant tables** across **IPL 2008–2026 and WPL 2023–2026**, sourced from licensed Cricsheet JSON, with search, sorting, coverage counts, and original source links.
- **Historical squad-source coverage** for **25 of 26 competition-seasons**: 18 IPL years, all four WPL years, and all three RCB CLT20 appearances.
- **Six Historical Eras (2008–2026) & 19-year IPL win-rate chart** (`#era-chronicles`), season table, captaincy, and full year-by-year chronicles.
- **25 searchable men's IPL, women's WPL, and Hall of Fame profiles** (including Virat Kohli, Rajat Patidar, Smriti Mandhana, Ellyse Perry, Lauren Bell, Grace Harris, Georgia Voll, Nadine de Klerk, Radha Yadav, Georgia Wareham, Renuka Singh Thakur, Richa Ghosh, Shreyanka Patil, AB de Villiers, Chris Gayle, Cameron Green, and Rahul Dravid) with official social handle links and accessible native dialogs.
- **Solo RCB-kit photo policy**: Solo RCB-kit portraits for Virat Kohli (`assets/photos/virat-kohli.png`), Cameron Green (`assets/photos/green.jpg`), and Rahul Dravid (`assets/photos/dravid.jpg`), plus the home stadium (`assets/photos/stadium.jpg`). Other player cards use clearly labeled jersey illustrations bearing the RCB crest and direct links to official social handles and league directories.
- Interactive IPL, WPL, and CLT20 competition explorer with separately sourced season records.
- Sortable 14-player statistical snapshots: runs, wickets, matches, and batting strike rate; missing values remain explicitly unknown.
- Same-season player comparisons, with contextual bar charts and source links.
- Nine filterable moments with a keyboard-navigable lightbox, match reports, context, and image credits.
- Nine official video destinations: the 2008 opening game, 2009 first final, 2026 player reels, champion interviews, the 2024 Chennai match, and the 2026 WPL reflection. These are categorized accurately rather than all being called match highlights.
- Direct links to the official IPL RCB squad, photo hub, and 2026 final gallery. Restricted publisher photographs are not copied or hotlinked.
- Interactive historical timeline and five-question quiz with feedback and replay.
- Club factfile and season selectors: IPL 2008–2026, WPL 2023–2026, and RCB's CLT20 appearances in 2009, 2010, and 2011.
- Historical final scorecard, curated reading links, source/credits dialog.
- Reduced-motion support, skip link, keyboard focus, semantic sections, live announcements.
- Static content remains readable without JavaScript; interactive components need JavaScript.

## Content and editorial scope

This is a **sourced historical fan hub**, not a live scoreboard or exhaustive current database. Championship coverage is verified through the completed 2026 IPL/WPL seasons. Featured comparison snapshots remain IPL 2025/WPL 2024, while the separate full-season explorer covers every IPL season from 2008 through 2026 and every WPL season from 2023 through 2026. CLT20 appearances are 2009, 2010, and 2011; no additional RCB league participation was verified.

### Complete-season statistics versus registered squads

[assets/data/seasons.json](assets/data/seasons.json) contains **all RCB participant records in the downloaded Cricsheet match files**, including zero-contribution listed players and recorded substitute fielders. It is not restricted to star players. Registry IDs retain identity across seasons. Match listings are explicitly not certified official appearances; rain/no-play fixtures can be absent. Super overs are excluded. Runs, boundaries, dismissals, batting strike rate, highest scores, bowling overs, conceded runs, wickets, economy, catches, and stumpings are computed from deliveries. Rates with no denominator are displayed as “—”. The code does not infer bench registrations from playing XIs.

[assets/data/rosters.json](assets/data/rosters.json) separately contains transformed Wikipedia squad-source tables under **CC BY-SA 4.0**, with source URLs and revision IDs, plus separately compiled factual WPL squad/replacement names attributed to reported lists and official notices. **The registered-roster gap is IPL 2009**; that year still has match-participant statistics. WPL 2025 and 2026 preserve withdrawn players and replacements, not a claim they were simultaneously active. For example, Perry's 2026 withdrawal and Sayali Satghare's replacement are explicit. Complete CLT20 player statistics were not verified; its squad tables must not be mistaken for statistical coverage.

The project owner's supplied historical summary informs the 19-year team record and era notes. Inconsistencies between league positions and final finishes are kept distinct; tied matches decided by a Super Over are included in wins/losses, not double-counted as additional fixtures.

Statistics are comparable only within a stated competition and season. `null` is displayed as “—”, meaning unverified, never zero. Batting innings are not treated as matches. Unresolved Patidar strike-rate discrepancies and unverified match counts are deliberately omitted. Official historical stats pages did not expose usable data during research, so credited secondary statistical tables are used; the website does not present those as official IPL data. Every profile links to its actual statistical sources.

Historical names use Bangalore where appropriate; the current club name is Royal Challengers Bengaluru.

Primary reference sites are [RCB](https://www.royalchallengers.com/), [the requested Wikipedia club history](https://en.wikipedia.org/wiki/Royal_Challengers_Bengaluru), [IPLT20](https://www.iplt20.com/), and [WPL](https://www.wplt20.com/). Official match reports establish the 2025/2026 IPL and 2024/2026 WPL titles. Statistical sources include Cricbuzz's season-specific batting/bowling tables and credited secondary reports. Exact links are stored in [archive.js](archive.js) and surfaced in the source dialog and profiles. The original supplied Medium reference returned HTTP 403; no reference design or article was copied.

## Updating content

Edit [data.js](data.js) for player biographies, timeline, and quiz data; [archive.js](archive.js) for competitions, season records, stat snapshots, moments, and sources. Shared interaction/rendering logic is in [hub.js](hub.js), with styles in [hub.css](hub.css). Base content/styles remain in [index.html](index.html) and [styles.css](styles.css).

Media sources are explicitly listed in [scripts/import-media.js](scripts/import-media.js). Run `npm run media:refresh` to regenerate the local images and [media.js](media.js) attribution manifest. Before adding any player photograph, verify **both** its reusable license and that the subject is wearing **RCB franchise kit or merchandise**. Add the exact source file to the importer only after visual verification; set its manifest type to `rcb-kit`. Do not use national-team, another franchise's, or casual portraits. Remove superseded source images; the build clears only the generated `dist/assets` directory to avoid shipping stale media.

The importer downloads originals, not tiny thumbnails: Cameron Green **1287×1372**, stadium **2241×1212**. Kohli's licensed archival RCB portrait is only **281×313**, so it is displayed at restrained sizes and explicitly identified as archival, never sold as HD or enlarged into the hero. Recent 2025/2026 RCB-kit photos for all players could not be verified for reuse; official portraits are linked at their publishers rather than copied.

Run `npm run data:refresh` for Cricsheet IPL/WPL statistics and `npm run rosters:refresh` for attributed squad-source tables. Build-time dependencies (`fflate`, `csv-parse`, `cheerio`) are locked; the deployed website still has no runtime package dependency. Regeneration intentionally fails on HTTP/parse errors instead of substituting empty success-shaped data. Missing Wikipedia pages or unrecognized squad formats are explicit unresolved coverage.

## Rights and privacy

Unofficial fan project. Not affiliated with or endorsed by RCB, IPL, WPL, or any player. The monogram, trophy, and jersey illustrations are original graphics, not official marks or merchandise. Team and player names identify the subject.

Local photographs are reused under the licenses in [media.js](media.js): Virat Kohli (Bollywood Hungama, CC BY 3.0), Cameron Green (Agashe Foundation, CC BY-SA 4.0), and the stadium (Aniket Suryavanshi, CC BY 2.0). Original-file links, authors, licenses, and responsive crop notices are shown in the website. These photographs retain their original licenses; no blanket license over third-party media is implied.

No national-team or other-franchise photos remain in the asset directory. An RCB-kit photograph with reusable rights was not verified for the other featured players, so their cards show explicitly labeled jersey illustrations and link to the official team photography. Official RCB website images are not copied: its [terms](https://www.royalchallengers.com/terms-conditions) restrict reproduction without authorization. Replace illustrations with additional photos only when you have the appropriate rights.

The supplied [IPLT20 photos](https://www.iplt20.com/photos) and [official RCB squad](https://www.iplt20.com/teams/royal-challengers-bengaluru/squad) references are linked for viewing at their source. [BCCI's terms](https://www.iplt20.com/terms-and-conditions) require prior written authorization to reproduce or display its photography on another site. Their public accessibility is not a reuse license. The [Dribbble cricket reference](https://dribbble.com/shots/16517201-Indian-Premier-League-Cricket-League) informed the navy, photo-led, score-panel direction only; its design and images are not reproduced.

No accounts, analytics, forms, tracking, or local storage. Google Fonts is the only external render-time dependency; system fonts are used if it is unavailable. External reading links open the credited publishers. All interactive data is bundled locally.
