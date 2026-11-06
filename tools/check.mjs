// Comprobaciones de la web generada: node tools/check.mjs [carpeta]
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
const root = process.argv[2] || 'site';
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const pages = walk(root).filter((f) => f.endsWith('.html') && !f.endsWith('404.html') && !readFileSync(f, 'utf8').includes('http-equiv="refresh"'));
const ext = new Set(); const issues = []; const titles = {}; const descs = {};
for (const f of pages) {
  const h = readFileSync(f, 'utf8'), name = f.split('\\').join('/');
  const title = (h.match(/<title>([^<]*)/) || [])[1], desc = (h.match(/name="description" content="([^"]*)/) || [])[1];
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) issues.push(`${name}: ${h1} H1`);
  if (!title || title.length > 62) issues.push(`${name}: título ${title?.length}`);
  if (!desc || desc.length > 165 || desc.length < 70) issues.push(`${name}: descripción ${desc?.length}`);
  (titles[title] ||= []).push(name); (descs[desc] ||= []).push(name);
  if (!/<html lang="(ca|es)"/.test(h)) issues.push(`${name}: lang`);
  for (const m of h.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="/.test(m[0])) issues.push(`${name}: img sin alt ${m[0].slice(0, 60)}`);
    if (!/\bwidth="\d+"/.test(m[0]) || !/\bheight="\d+"/.test(m[0])) issues.push(`${name}: img sin tamaño ${m[0].slice(0, 60)}`);
  }
  const ids = [...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  ids.filter((x, i) => ids.indexOf(x) !== i).forEach((x) => issues.push(`${name}: id duplicado ${x}`));
  for (const m of h.matchAll(/(?:href|src|data-src|imagesrcset|srcset)="([^"]+)"/g)) {
    for (const part of m[1].split(',')) {
      const u = part.trim().split(/\s+/)[0];
      if (!u || u.startsWith('#') || u.startsWith('mailto:') || u.startsWith('tel:')) continue;
      if (/^https?:/.test(u)) { ext.add(u); continue; }
      const clean = u.split(/[?#]/)[0];
      let t = resolve(dirname(f), clean);
      if (clean.endsWith('/') || clean === '.') t = join(t, 'index.html');
      if (!existsSync(t)) issues.push(`${name}: enlace roto ${u}`);
    }
  }
  if (/[«»]/.test(h)) issues.push(`${name}: comillas angulares`);
  if (/\d+,\d\d\s?€/.test(h)) issues.push(`${name}: precio`);
  if (/antinature|wa\.me|whatsapp|354\s?131|admin@ambinature/i.test(h)) issues.push(`${name}: dato prohibido`);
}
Object.entries(titles).filter(([, v]) => v.length > 1).forEach(([k]) => issues.push(`título repetido: ${k}`));
Object.entries(descs).filter(([, v]) => v.length > 1).forEach(([k]) => issues.push(`descripción repetida: ${k}`));
console.log(`${pages.length} páginas. Incidencias internas: ${issues.length}`); issues.forEach((i) => console.log(' -', i));
const res = await Promise.all([...ext].map(async (u) => {
  try { const r = await fetch(u, { method: 'GET', redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 Chrome/126' }, signal: AbortSignal.timeout(25000) }); await r.body?.cancel(); return [r.status, u]; }
  catch (e) { return ['ERR ' + (e.cause?.code || e.name), u]; }
}));
console.log(`Enlaces externos: ${res.length}`); res.sort((a, b) => String(a[0]).localeCompare(String(b[0]))).forEach(([s, u]) => console.log(s, u));
