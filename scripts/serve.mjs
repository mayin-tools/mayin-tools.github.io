import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../dist');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json' };

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  let target = path.join(root, pathname);
  if (pathname.endsWith('/')) target = path.join(target, 'index.html');
  if (!path.extname(target) && fs.existsSync(`${target}/index.html`)) target = `${target}/index.html`;
  if (!target.startsWith(root) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
    target = path.join(root, '404.html');
    response.statusCode = 404;
  }
  response.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
  response.setHeader('Cache-Control', 'no-store');
  fs.createReadStream(target).pipe(response);
}).listen(port, '0.0.0.0', () => console.log(`Preview: http://127.0.0.1:${port}`));
