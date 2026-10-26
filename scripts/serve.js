import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve(process.argv.includes('--dist') ? 'dist' : '.');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const server = createServer(async (request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400); response.end('Invalid URL'); return; }
  const file = resolve(root, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`);
  if (!file.startsWith(root + sep)) { response.writeHead(403); response.end('Forbidden'); return; }
  try {
    if (!(await stat(file)).isFile()) { response.writeHead(404); response.end('Not found'); return; }
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(body);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') { response.writeHead(404); response.end('Not found'); }
    else { console.error(error); response.writeHead(500); response.end('Server error'); }
  }
});
server.on('error', error => { console.error(error); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`RCB Forever ready at http://127.0.0.1:${server.address().port}`));
