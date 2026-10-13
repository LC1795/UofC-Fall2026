const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = {
  '/': ['index.html', 'text/html'],
  '/index.html': ['index.html', 'text/html'],
  '/grid.js': ['grid.js', 'text/javascript'],
};
const port = Number(process.env.PORT || 5174);
http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (!Object.hasOwn(files, pathname)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const [file, type] = files[pathname];
  res.writeHead(200, { 'Content-Type': type + '; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(fs.readFileSync(path.join(__dirname, 'dist', file)));
}).listen(port, '127.0.0.1', () => console.log(`LC Attractor Grid: http://127.0.0.1:${port}`));
