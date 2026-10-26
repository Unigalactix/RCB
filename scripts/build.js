import { cp, mkdir, rm } from 'node:fs/promises';
const files = ['index.html', 'squad.html', 'seasons.html', 'history.html', 'moments.html', 'styles.css', 'hub.css', 'app.js', 'hub.js', 'seasonal.js', 'infographic.js', 'data.js', 'archive.js', 'media.js', '.nojekyll', 'assets'];
await mkdir('dist', { recursive: true });
await rm('dist/assets', { recursive: true, force: true });
await Promise.all(files.map(file => cp(file, `dist/${file}`, { recursive: true })));
console.log('Built static site in dist. Relative asset URLs support GitHub Pages project sites.');
