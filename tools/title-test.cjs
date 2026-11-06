// Comprueba que ningún título se salga de su columna ni se corte, de móvil a monitores grandes.
const p = require('puppeteer-core');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const PAGES = ['/ca/index.html', '/ca/aromatitzacio-professional/index.html', '/ca/marqueting-olfactiu-andorra/index.html', '/ca/neutralitzacio-males-olors/index.html', '/ca/fragancies-llar/index.html', '/ca/higiene-neteja/index.html', '/ca/sobre-ambinature-andorra/index.html', '/ca/contacte/index.html', '/es/index.html', '/es/aromatizacion-profesional/index.html', '/es/neutralizacion-malos-olores/index.html'];
(async () => {
  const b = await p.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const g = await b.newPage();
  await g.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  let bad = 0;
  for (const u of PAGES) for (const w of [360, 390, 768, 1024, 1280, 1440, 1680, 1920, 2560]) {
    await g.setViewport({ width: w, height: 900 });
    await g.goto('http://localhost:4173' + u, { waitUntil: 'load' });
    await wait(1500);
    const r = await g.evaluate(() => {
      const cw = document.documentElement.clientWidth, out = [];
      document.querySelectorAll('main h1, main h2, main h3, .contact-huge, .show-item strong').forEach((h) => {
        if (h.closest('.h-track')) return;
        const range = document.createRange(); range.selectNodeContents(h);
        const t = range.getBoundingClientRect(), wrap = h.closest('.wrap');
        const pr = wrap ? wrap.getBoundingClientRect().right - parseFloat(getComputedStyle(wrap).paddingRight) : cw;
        if (t.width && t.right > Math.min(pr, cw) + 2) out.push('fuera: ' + h.textContent.trim().slice(0, 26) + ' ' + Math.round(t.right) + '>' + Math.round(pr));
      });
      const h1 = document.querySelector('h1'), fig = document.querySelector('.ph-fig');
      if (h1 && fig && getComputedStyle(fig).display !== 'none') {
        const rg = document.createRange(); rg.selectNodeContents(h1);
        const a = rg.getBoundingClientRect(), c = fig.getBoundingClientRect();
        if (a.right > c.left + 2 && a.bottom > c.top && a.top < c.bottom) out.push('pisa la imagen: ' + Math.round(a.right) + '>' + Math.round(c.left));
      }
      if (document.documentElement.scrollWidth > cw) out.push('desborda página ' + document.documentElement.scrollWidth);
      return { out, h1: Math.round(parseFloat(getComputedStyle(document.querySelector('.mega-big') || h1).fontSize)) };
    });
    if (r.out.length) { bad++; console.log(u, w, r.out.join(' | ')); }
    if (u === '/ca/index.html') console.log('portada', w, 'tamaño', r.h1);
  }
  console.log('combinaciones con problemas:', bad);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
