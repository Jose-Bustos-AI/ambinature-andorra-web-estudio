// Comprueba el humo con la GPU real: fps y capturas tras mover el ratón.
const p = require('puppeteer-core');
const out = process.argv[2];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await p.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--autoplay-policy=no-user-gesture-required'] });
  const g = await b.newPage();
  await g.setViewport({ width: 1440, height: 900 });
  await g.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await g.goto('http://localhost:4173/ca/', { waitUntil: 'load' });
  await wait(1500);
  console.log(await g.evaluate(() => { const c = document.getElementById('smoke').getContext('webgl2'); const e = c.getExtension('WEBGL_debug_renderer_info'); return e ? c.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'sin datos'; }));
  const fps = () => g.evaluate(() => new Promise((res) => { let n = 0; const t = performance.now(); const f = () => { n++; if (performance.now() - t > 2000) res(Math.round(n / 2)); else requestAnimationFrame(f); }; requestAnimationFrame(f); }));
  console.log('fps reposo', await fps());
  await g.screenshot({ path: `${out}/g-1-idle.png` });
  for (let i = 0; i < 60; i++) { await g.mouse.move(720 + 560 * Math.sin(i / 6), 420 + 300 * Math.cos(i / 4)); await wait(16); }
  await wait(200);
  await g.screenshot({ path: `${out}/g-2-move.png` });
  await wait(4000);
  await g.screenshot({ path: `${out}/g-3-after.png` });
  const y = await g.evaluate(() => document.querySelector('.paint').getBoundingClientRect().top + scrollY);
  await g.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
  await wait(2000);
  await g.evaluate(() => document.querySelectorAll('[data-paint] button')[2].click());
  await wait(1200);
  await g.screenshot({ path: `${out}/g-4-paint.png` });
  console.log('fps pintura', await fps());
  await wait(1200);
  await g.evaluate(() => document.querySelectorAll('[data-paint] button')[3].click());
  await wait(1500);
  await g.screenshot({ path: `${out}/g-5-paint2.png` });
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
