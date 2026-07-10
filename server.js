const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'outputs', 'qa-course-draft');
const port = Number(process.env.PORT) || 4173;
const types = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };

http.createServer((request, response) => {
  const requestPath = request.url.split('?')[0] === '/' ? '/index.html' : request.url.split('?')[0];
  if (requestPath === '/config.js') {
    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    response.writeHead(200, { 'Content-Type': types['.js'], 'Cache-Control': 'no-store' });
    return response.end(`window.STRAPI_URL = ${JSON.stringify(strapiUrl)};`);
  }
  const target = path.resolve(root, `.${requestPath}`);
  if (!target.startsWith(root)) { response.writeHead(403); return response.end('Forbidden'); }
  fs.readFile(target, (error, content) => {
    if (error) { response.writeHead(error.code === 'ENOENT' ? 404 : 500); return response.end(error.code === 'ENOENT' ? 'Not found' : 'Server error'); }
    response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
    response.end(content);
  });
}).listen(port, () => console.log(`QA Progress: http://localhost:${port}`));
