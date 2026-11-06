// Mide la fluidez real: recorre la portada con la rueda del ratón y registra la duración de cada fotograma.
// Uso: NODE_PATH=<carpeta con puppeteer-core> node tools/jank-test.cjs [ruta]
const p = require('puppeteer-core');
const path = process.argv[2] || '/ca/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await p.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'] });
  const g = await b.newPage();
  await g.setViewport({ width: 1440, height: 900 });
  await g.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await g.goto('http://localhost:4173' + path, { waitUntil: 'load' });
  await wait(2000);
  await g.mouse.move(720, 450);
  await g.evaluate(() => {
    window.__f = []; let last = performance.now();
    const tick = (t) => { window.__f.push([t - last, Math.round(scrollY)]); last = t; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  const total = await g.evaluate(() => document.documentElement.scrollHeight);
  let y = 0;
  while (y < total - 900) { await g.mouse.wheel({ deltaY: 120 }); y += 120; await wait(70); if ((await g.evaluate(() => scrollY)) + 910 >= total) break; }
  await wait(600);
  const f = await g.evaluate(() => window.__f);
  const d = f.map((x) => x[0]).filter((x) => x > 0).sort((a, b) => a - b);
  const pct = (q) => Math.round(d[Math.floor(d.length * q)]);
  const over = (ms) => Math.round((d.filter((x) => x > ms).length / d.length) * 100);
  console.log(JSON.stringify({ frames: d.length, fps: Math.round(1000 / (d.reduce((a, c) => a + c, 0) / d.length)), p50: pct(0.5), p95: pct(0.95), p99: pct(0.99), max: Math.round(d[d.length - 1]), over25ms: over(25) + '%', over50ms: over(50) + '%' }));
  // Peores zonas de la página
  const zones = {};
  f.forEach(([ms, sy]) => { const z = Math.floor(sy / 1500) * 1500; (zones[z] ||= []).push(ms); });
  const rows = Object.entries(zones).map(([z, a]) => [Number(z), Math.round(a.reduce((s, c) => s + c, 0) / a.length), Math.round(Math.max(...a))]);
  console.log('zona, media ms, máx ms:', rows.map((r) => r.join('/')).join('  '));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
