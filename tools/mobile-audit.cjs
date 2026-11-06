// Prueba móvil: 16 páginas en 7 tamaños. Busca desbordes horizontales, texto cortado, letra de menos de 12 px y elementos táctiles pequeños.
// Uso: NODE_PATH=<carpeta con puppeteer-core>/node_modules node tools/mobile-audit.cjs http://localhost:4173
const p = require('puppeteer-core');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const base = process.argv[2];
const SLUGS = ['', 'aromatitzacio-professional/', 'marqueting-olfactiu-andorra/', 'neutralitzacio-males-olors/', 'fragancies-llar/', 'higiene-neteja/', 'sobre-ambinature-andorra/', 'contacte/'].map((s) => '/ca/' + s)
  .concat(['', 'aromatizacion-profesional/', 'marketing-olfativo-andorra/', 'neutralizacion-malos-olores/', 'fragancias-hogar/', 'higiene-limpieza/', 'sobre-ambinature-andorra/', 'contacto/'].map((s) => '/es/' + s));
const SIZES = [[320, 568], [360, 640], [375, 667], [390, 844], [430, 932], [768, 1024], [844, 390]];
const AUDIT = () => {
  const vw = document.documentElement.clientWidth, res = { sw: document.documentElement.scrollWidth, vw, over: [], tap: [], clip: [], small: [] };
  const vis = (el) => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' && el.getClientRects().length; };
  const label = (el) => `${el.tagName.toLowerCase()}.${String(el.className.baseVal ?? el.className).trim().split(/\s+/).join('.')}`.slice(0, 40);
  for (const el of document.querySelectorAll('main *, header *, footer *, .mobile-bar *')) {
    if (!vis(el) || el.closest('.vh, .skip, .hover-img')) continue;
    const r = el.getBoundingClientRect();
    if (r.width && !el.closest('.marquee, .strip, .nav, [aria-hidden="true"]') && (r.right > vw + 1 || r.left < -1) && !getComputedStyle(el).transform.includes('matrix')) res.over.push(`${label(el)} [${Math.round(r.left)},${Math.round(r.right)}]`);
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (own) {
      if (parseFloat(getComputedStyle(el).fontSize) < 12) res.small.push(`${label(el)} "${el.textContent.trim().slice(0, 18)}"`);
      if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).display !== 'inline') res.clip.push(`${label(el)} ${el.scrollWidth}/${el.clientWidth} "${el.textContent.trim().slice(0, 18)}"`);
    }
    if (el.matches('a, button, summary, select, input:not([type=radio])') && !el.closest('p:not(.legal-links), dd, .nav, .strip') && r.width && (r.height < 42 || r.width < 40)) res.tap.push(`${label(el)} ${Math.round(r.width)}x${Math.round(r.height)} "${el.textContent.trim().slice(0, 16)}"`);
  }
  for (const k of ['over', 'tap', 'clip', 'small']) res[k] = [...new Set(res[k])].slice(0, 8);
  return res;
};
(async () => {
  const b = await p.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', protocolTimeout: 90000, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
  const g = await b.newPage();
  const errs = []; g.on('pageerror', (e) => errs.push(e.message));
  await g.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  let n = 0, clean = 0;
  for (const [w, h] of SIZES) {
    await g.setViewport({ width: w, height: h, isMobile: true, hasTouch: true });
    for (const u of SLUGS) {
      await g.goto(base + u, { waitUntil: 'load' }); await wait(500);
      const a = await g.evaluate(AUDIT); n++;
      const bad = a.sw > a.vw || a.over.length || a.tap.length || a.clip.length || a.small.length;
      if (bad) console.log(`${w}x${h} ${u}`, JSON.stringify(a)); else clean++;
    }
  }
  console.log(`Medidas ${n}, limpias ${clean}. Errores JS: ${JSON.stringify(errs)}`);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
