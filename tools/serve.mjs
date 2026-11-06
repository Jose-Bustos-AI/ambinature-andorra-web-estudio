// Servidor local mínimo para revisar site/ (node tools/serve.mjs [carpeta] [puerto])
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
const root = process.argv[2] || 'site', port = Number(process.argv[3] || 4173);
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml' };
createServer(async (req, res) => {
  let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (p.includes('..')) { res.writeHead(400); return res.end(); }
  let f = join(root, p);
  try { if ((await stat(f)).isDirectory()) f = join(f, 'index.html'); const b = await readFile(f); res.writeHead(200, { 'content-type': T[extname(f)] || 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404, { 'content-type': T['.html'] }); res.end(await readFile(join(root, '404.html')).catch(() => 'Not found')); }
}).listen(port, () => console.log(`http://localhost:${port}`));
