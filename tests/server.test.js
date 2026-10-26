import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createInterface } from 'node:readline';

test('static server serves the site, correct MIME types and explicit errors', async context => {
  const server = spawn(process.execPath, ['scripts/serve.js'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  context.after(async () => {
    if (server.exitCode === null) {
      const exited = once(server, 'exit');
      server.kill();
      await exited;
    }
  });
  const ready = new Promise((resolve, reject) => {
    const lines = createInterface({ input: server.stdout });
    lines.on('line', line => {
      const match = line.match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) { lines.close(); resolve(match[0]); }
    });
    server.on('error', reject);
    server.on('exit', code => reject(new Error(`Server exited before ready: ${code}`)));
    server.stderr.on('data', chunk => reject(new Error(String(chunk))));
  });
  const base = await ready;
  const home = await fetch(base);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /RCB Forever/);
  const script = await fetch(`${base}/app.js`);
  assert.match(script.headers.get('content-type'), /javascript/);
  const image = await fetch(`${base}/assets/trophy.svg`);
  assert.equal(image.status, 200);
  assert.equal(image.headers.get('content-type'), 'image/svg+xml');
  assert.equal((await fetch(`${base}/does-not-exist`)).status, 404);
  assert.equal((await fetch(`${base}/%2e%2e%5cpackage.json`)).status, 403);
});
