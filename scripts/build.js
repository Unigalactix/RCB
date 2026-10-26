import { cp, mkdir } from 'node:fs/promises';
const files = ['index.html', 'styles.css', 'app.js', 'data.js', 'assets'];
await mkdir('dist', { recursive: true });
await Promise.all(files.map(file => cp(file, `dist/${file}`, { recursive: true })));
console.log('Built static site in dist. Relative asset URLs support GitHub Pages project sites.');
