// Prueba con Chrome real: efectos activos, escenas, desbordes y errores.
// Uso: NODE_PATH=<carpeta con puppeteer-core> node tools/visual-test.cjs <carpeta de salida>
const p = require('puppeteer-core');
const out = process.argv[2];
const BASE = 'http://localhost:4173';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await p.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--autoplay-policy=no-user-gesture-required', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const g = await b.newPage();
  const errs = [];
  g.on('pageerror', (e) => errs.push(e.message));
  g.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await g.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);

  async function tour(vw, vh, tag) {
    await g.setViewport({ width: vw, height: vh, isMobile: vw < 500, hasTouch: vw < 500 });
    await g.goto(BASE + '/ca/', { waitUntil: 'load' });
    await wait(1500);
    await g.mouse.move(vw * 0.5, vh * 0.3);
    for (let i = 0; i < 24; i++) { await g.mouse.move(vw * (0.45 + 0.45 * Math.sin(i / 3)), vh * (0.35 + 0.3 * Math.cos(i / 2))); await wait(45); }
    await wait(900);
    await g.screenshot({ path: `${out}/${tag}-00-hero.png` });
    console.log(tag, JSON.stringify(await g.evaluate(() => ({ cls: document.documentElement.className, h: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, w: document.documentElement.clientWidth }))));
    const points = await g.evaluate(() => {
      const ST = window.ScrollTrigger;
      const top = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : null; };
      const pin = (s) => { const t = ST.getAll().find((x) => x.pin && x.pin.matches(s)); return t ? [t.start, t.end] : null; };
      return { man: pin('.man-stage'), hs: pin('[data-hscroll]'), ring: pin('.show-stage'), duo: top('.duo'), winter: top('.winter'), promises: top('.promises'), marquee: top('.marquee'), paint: top('.paint'), steps: top('.steps-scene'), shop: top('.shop-band'), cta: top('.cta-giant'), foot: top('.site-footer') };
    });
    console.log(tag, JSON.stringify(points));
    const shots = [];
    if (points.man) shots.push(['01-man-a', points.man[0] + (points.man[1] - points.man[0]) * 0.12], ['01b-man', points.man[0] + (points.man[1] - points.man[0]) * 0.28], ['02-man-b', points.man[0] + (points.man[1] - points.man[0]) * 0.8]);
    shots.push(['03-duo', points.duo]);
    if (points.hs) shots.push(['04-hs-a', points.hs[0] + 10], ['05-hs-b', points.hs[0] + (points.hs[1] - points.hs[0]) * 0.45]);
    else shots.push(['04-hs-m', (await g.evaluate(() => document.querySelector('.h-service').getBoundingClientRect().top + scrollY))]);
    shots.push(['06-winter', points.winter], ['07-prom', points.promises], ['08-paint', points.paint]);
    if (points.ring) shots.push(['09-ring-a', points.ring[0] + 5], ['10-ring-b', points.ring[0] + (points.ring[1] - points.ring[0]) * 0.42]);
    if (!points.ring) shots.push(['10-show-m', await g.evaluate(() => document.querySelector('.show-list').getBoundingClientRect().top + scrollY - 70)]);
    shots.push(['11-steps', points.steps], ['12-shop', points.shop], ['13-cta', points.cta], ['14-foot', points.foot]);
    for (const [name, y] of shots) {
      await g.evaluate((yy) => { const L = window.__lenis; window.scrollTo({ top: yy, behavior: 'instant' }); }, Math.round(y));
      await wait(1100);
      await g.screenshot({ path: `${out}/${tag}-${name}.png` });
    }
    if (points.paint) {
      await g.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), points.paint);
      await wait(600);
      await g.evaluate(() => document.querySelectorAll('[data-paint] button').forEach((x, i) => { if (i < 4) x.click(); }));
      await wait(900);
      await g.screenshot({ path: `${out}/${tag}-08b-paint-click.png` });
    }
  }
  await tour(1440, 900, 'd');
  await tour(390, 844, 'm');
  // Páginas interiores
  await g.setViewport({ width: 1440, height: 900 });
  for (const [u, t] of [['/ca/aromatitzacio-professional/index.html', 'i-aroma'], ['/ca/neutralitzacio-males-olors/index.html', 'i-neutral'], ['/ca/contacte/index.html', 'i-contact']]) {
    await g.goto(BASE + u, { waitUntil: 'load' });
    await wait(2000);
    await g.screenshot({ path: `${out}/${t}.png` });
  }
  // Desbordes
  const pages = ['/ca/', '/ca/aromatitzacio-professional/index.html', '/ca/marqueting-olfactiu-andorra/index.html', '/ca/neutralitzacio-males-olors/index.html', '/ca/fragancies-llar/index.html', '/ca/higiene-neteja/index.html', '/ca/sobre-ambinature-andorra/index.html', '/ca/contacte/index.html', '/es/', '/es/contacto/index.html'];
  for (const u of pages) for (const w of [360, 768, 1100, 1440]) {
    await g.setViewport({ width: w, height: 800 });
    await g.goto(BASE + u, { waitUntil: 'load' });
    await wait(300);
    const o = await g.evaluate(() => ({ sw: document.documentElement.scrollWidth, c: document.documentElement.clientWidth, h1: (() => { const h = document.querySelector('h1'); return h ? Math.round(h.getBoundingClientRect().right) : 0; })() }));
    if (o.sw > o.c || o.h1 > o.c + 1) console.log('OVERFLOW', u, w, JSON.stringify(o), JSON.stringify(await g.evaluate(() => [...document.querySelectorAll('main *, footer *')].filter((e) => e.getBoundingClientRect().right > document.documentElement.clientWidth + 1 && !e.closest('.strip,.marquee,.h-track,.ring')).slice(0, 5).map((e) => e.tagName + '.' + e.className + ':' + Math.round(e.getBoundingClientRect().right)))));
  }
  console.log('errores', JSON.stringify([...new Set(errs)].slice(0, 12)));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
