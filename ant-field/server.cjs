const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const port = Number(process.env.PORT || 5173);
http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname !== '/' && pathname !== '/index.html') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(fs.readFileSync(path.join(__dirname, 'dist', 'index.html')));
}).listen(port, '127.0.0.1', () => console.log(`LC Ant Field: http://127.0.0.1:${port}`));
