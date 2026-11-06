// Generador estático. Versión 2: escenas con humo interactivo.
//   node src/build.mjs                               -> vista previa en site/ (noindex, sin canónicas)
//   SITE_URL=https://dominio node src/build.mjs dist -> producción en dist/ (canónicas, hreflang, sitemap)
import { mkdirSync, writeFileSync, cpSync, rmSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import es from './content.es.mjs';
import ca from './content.ca.mjs';
import fx from './content.fx.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');
const PROD = Boolean(SITE_URL);
// En Vercel los enlaces van sin index.html aunque la vista previa siga sin indexarse.
const CLEAN = PROD || Boolean(process.env.VERCEL);
// Origen para la imagen al compartir el enlace, también en la vista previa de Vercel.
const ORIGIN = SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '');
// Actualizar al cambiar los textos: alimenta el sitemap y los datos estructurados.
const LAST_UPDATED = '2026-11-05';
// Cambia con cada versión de estilos y scripts: ningún navegador se queda con una copia antigua.
const VER = createHash('md5').update(['css/styles.css', 'js/main.js', 'js/fluid.js'].map((f) => readFileSync(join(HERE, 'static', f), 'utf8')).join('')).digest('hex').slice(0, 8);
const OUT = join(HERE, '..', process.argv[2] || (PROD ? 'dist' : 'site'));
const LANGS = { ca, es };
// El briefing exige catalán: producción solo genera /ca/ salvo que se pida WITH_ES=1.
const WITH_ES = !PROD || process.env.WITH_ES === '1';
const ACTIVE = WITH_ES ? [ca, es] : [ca];
for (const [L, X] of [[ca, fx.ca], [es, fx.es]]) {
  L.fx = X.fx;
  for (const [k, v] of Object.entries(X.services)) L.services[k] = { ...L.services[k], ...v };
  for (const [k, v] of Object.entries(X.pages)) L.pages[k] = { ...L.pages[k], ...v };
  L.pages.contact.f.opts = { ...L.pages.contact.f.opts, ...X.formOpts };
}
const SERVICE_KEYS = ['aroma', 'marketing', 'neutral', 'hogar', 'higiene'];
const PAGE_KEYS = ['home', ...SERVICE_KEYS, 'about', 'contact'];

// Datos de contacto facilitados por el cliente
const TEL = '+376 354151', TEL_HREF = 'tel:+376354151', EMAIL = 'comercial@ambinature.ad';
const IG = 'https://www.instagram.com/ambinature.and/', FB = 'https://www.facebook.com/ambinatureandorra';
const SHOP_HOST = 'https://ambinature.ad';
const TALLY = 'https://tally.so/r/mKDMpg';
const CATALOG = 'https://ambinature.com/wp-content/uploads/2024/04/catalogo_29_04_24_espanol_con_tablas_L.pdf';
const PRESENTATION = 'https://ambinature.ad/documents/Presentacio-de-lEmpresa.pdf';

const SHOP = {
  ca: { root: '/ca/categories/botiga.html', aroma: '/ca/categoria-1/aromatitzacio.html', clean: '/ca/categoria-22/ambinature-clean.html', legal: '/ca/contingut-19/avis-legal.html', privacy: '/ca/contingut-17/politica-de-privacidad.html', cookies: '/ca/contingut-18/politica-de-cookies.html', terms: '/ca/contingut-20/condicions-de-compra.html' },
  es: { root: '/es/categories/tienda.html', aroma: '/es/categoria-1/aromatizacion.html', clean: '/es/categoria-22/ambinature-clean.html', legal: '/es/contingut-19/aviso-legal.html', privacy: '/es/contingut-17/politica-de-privacidad.html', cookies: '/es/contingut-18/politica-de-cookies.html', terms: '/es/contingut-20/condiciones-de-compra.html' },
};

// Productos reales de la tienda. Sin precios: los mantiene la tienda.
const PRODUCTS = {
  ambiwick: { name: 'Ambiwick', path: 'producte-6/ambiwick.html', img: 'p-ambiwick', w: 800, h: 534, d: { es: 'Difusor eléctrico enchufable.', ca: 'Difusor elèctric endollable.' }, alt: { es: 'Difusor Ambiwick blanco', ca: 'Difusor Ambiwick blanc' } },
  carga: { name: { es: 'Carga Ambiwick 100 ml', ca: 'Càrrega Ambiwick 100 ml' }, path: 'producte-1/carrega-ambiwick-100ml.html', img: 'p-carga', w: 760, h: 558, d: { es: 'Recarga de fragancia para el difusor.', ca: 'Recàrrega de fragància per al difusor.' }, alt: { es: 'Dos cargas de fragancia Ambiwick negras', ca: 'Dues càrregues de fragància Ambiwick negres' } },
  dispensador: { name: 'Dispensador LCD', path: 'producte-7/dispensador-lcd-per-sprai-250ml.html', img: 'p-dispensador', w: 640, h: 640, d: { es: 'Difusión automática de aerosol.', ca: 'Difusió automàtica d\'aerosol.' }, alt: { es: 'Dispensador de aerosol blanco', ca: 'Dispensador d\'aerosol blanc' } },
  sprai: { name: 'Sprai 270 ml', path: 'producte-2/ambientador-sprai-270ml.html', img: 'p-sprai', w: 300, h: 300, d: { es: 'Ambientador en aerosol.', ca: 'Ambientador en aerosol.' }, alt: { es: 'Aerosol ambientador de uso profesional', ca: 'Aerosol ambientador d\'ús professional' } },
  turbo: { name: 'Sprai Turbo 750 ml', path: 'producte-3/sprai-turbo-750-ml.html', img: 'p-turbo', w: 400, h: 666, d: { es: 'Formato grande de aplicación manual.', ca: 'Format gran d\'aplicació manual.' }, alt: { es: 'Aerosol Turbo negro de 750 ml', ca: 'Aerosol Turbo negre de 750 ml' } },
  mikado: { name: 'Mikado 100 ml', path: 'producte-12/mikado-100-ml.html', img: 'p-mikado', w: 456, h: 800, d: { es: 'Difusión continua con varillas.', ca: 'Difusió contínua amb varetes.' }, alt: { es: 'Mikado de vidrio con varillas negras', ca: 'Mikado de vidre amb varetes negres' } },
  hs275: { name: 'Home Spray 275 ml', path: 'producte-10/home-spray-275ml.html', img: 'p-homespray', w: 640, h: 640, d: { es: 'Pulverizador para la casa.', ca: 'Polvoritzador per a casa.' }, alt: { es: 'Botella ámbar Home Spray de 275 ml', ca: 'Ampolla ambre Home Spray de 275 ml' } },
  hs500: { name: 'Home Spray 500 ml', path: 'producte-11/home-spray-500ml.html', img: 'p-hs500', w: 460, h: 690, d: { es: 'Formato medio.', ca: 'Format mitjà.' }, alt: { es: 'Botella ámbar Home Spray de 500 ml', ca: 'Ampolla ambre Home Spray de 500 ml' } },
  hs1000: { name: 'Home Spray 1000 ml', path: 'producte-9/home-spray-1000ml.html', img: 'p-whitetea', w: 320, h: 656, d: { es: 'Formato grande.', ca: 'Format gran.' }, alt: { es: 'Botella Home Spray White Tea de 1000 ml', ca: 'Ampolla Home Spray White Tea de 1000 ml' } },
  super: { name: { es: 'Superconcentrados', ca: 'Superconcentrats' }, path: 'producte-46/superconcentrats.html', img: 'p-super-banos', w: 640, h: 640, d: { es: 'Limpiadores de 250 ml para cada tarea.', ca: 'Netejadors de 250 ml per a cada tasca.' }, alt: { es: 'Superconcentrado limpiabaños Ambinature Clean', ca: 'Superconcentrat netejabanys Ambinature Clean' } },
  inhol: { name: 'Inhol Ambinature 5 L', path: 'producte-44/inhol-ambinature-5-l.html', img: 'p-inhol', w: 640, h: 640, light: true, d: { es: 'Higienizante hidroalcohólico.', ca: 'Higienitzant hidroalcohòlic.' }, alt: { es: 'Garrafa de Inhol Ambinature', ca: 'Garrafa d\'Inhol Ambinature' } },
  tensibac: { name: 'Tensibac CL 5 L', path: 'producte-45/tensibac-cl-5l.html', img: 'p-tensibac', w: 640, h: 640, light: true, d: { es: 'Detergente clorado para personal especializado.', ca: 'Detergent clorat per a personal especialitzat.' }, alt: { es: 'Garrafa blanca de Tensibac CL', ca: 'Garrafa blanca de Tensibac CL' } },
};
const IMG_SIZE = { 's-ambiwick': [1000, 1333], 's-turbo': [1000, 1333], 's-homespray': [1000, 1333], 's-mikado': [1000, 1333], 'a-odotipo': [640, 800], 'a-aromas': [512, 704], 'a-piramide': [760, 950], 'a-neutral': [760, 950], 'a-mikado': [512, 704], 'a-clean': [478, 474], 'a-bodegon': [447, 346], 'p-super': [640, 640], 'p-inhol': [640, 640], 'p-homespray': [640, 640], 'p-mikado': [456, 800], 'p-ambiwick': [800, 534], 'p-turbo': [400, 666], 'p-hs500': [460, 690], 'p-whitetea': [320, 656], 'p-dispensador': [640, 640], 'p-carga': [760, 558] };
// Ilustraciones sobre negro: se funden con el humo mediante una máscara. Los productos ya tienen transparencia.
const ON_BLACK = new Set(['a-odotipo', 'a-aromas', 'a-neutral', 'a-piramide']);
// Fotos de estudio creadas a partir de las fotos reales de la tienda.
const STUDIO = { ambiwick: ['s-ambiwick', 1000, 1333], turbo: ['s-turbo', 1000, 1333], hs275: ['s-homespray', 1000, 1333], mikado: ['s-mikado', 1000, 1333] };
const SHOWCASE = Object.keys(STUDIO);
const AROMAS = ['Green Tea', 'Caribbean Vetiver', 'Lavanda', 'Blue Silver', 'Orange Canela', 'Red Passion', 'White Tea', 'Cedar Santal', 'Vainilla', 'Green Bamboo', 'Amatista', 'Tropical Mango', 'Musc Fresh', 'Sicilian Summer', 'Seychelles', 'Forever Young'];
const PAINT = [['Green Tea', '#7fb746'], ['Lavanda', '#9a7bff'], ['Red Passion', '#ff3355'], ['Blue Silver', '#4fa8ff'], ['Orange Canela', '#ff8a2a'], ['Vainilla', '#ffe29a'], ['Tropical Mango', '#ffc02e'], ['White Tea', '#e9fff2']];
const INK = { home: ['#7fb746', '#cfe657', '#f06a8a', '#9fe8d6'], marketing: ['#f06a8a', '#ff8a2a', '#4fa8ff', '#cfe657'], aroma: ['#7fb746', '#cfe657', '#9fe8d6'], hogar: ['#ffc02e', '#f06a8a', '#7fb746'], higiene: ['#3fd0a0', '#9fe8d6', '#cfe657'], neutral: ['#8fa0a8', '#9fe8d6', '#7fb746'], about: ['#7fb746', '#cfe657'], contact: ['#cfe657', '#7fb746', '#9fe8d6'] };

// Las fotos de estudio sustituyen a las de catálogo en bloques y tarjetas.
const TO_STUDIO = { 'p-ambiwick': 's-ambiwick', 'p-turbo': 's-turbo', 'p-homespray': 's-homespray', 'p-mikado': 's-mikado' };
for (const L of [ca, es]) {
  for (const s of Object.values(L.services)) if (TO_STUDIO[s.img]) s.img = TO_STUDIO[s.img];
  for (const P of Object.values(L.pages)) {
    if (TO_STUDIO[P.img]) { P.img = TO_STUDIO[P.img]; P.contain = false; }
    for (const b of [P.block1, P.block2]) if (b && TO_STUDIO[b.img]) { b.img = TO_STUDIO[b.img]; b.contain = false; }
  }
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const EXT = '<svg class="ext" viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 9l6-6M4 3h5v5"/></svg>';
const num = (i) => String(i + 1).padStart(2, '0');

const pagePath = (lang, key) => { const s = LANGS[lang].pages[key].slug; return s ? `${lang}/${s}/` : `${lang}/`; };
const rel = (from, to) => {
  let r = relative(from || '.', to.replace(/\/$/, '') || '.').replace(/\\/g, '/');
  if (!r) r = '.';
  if (to.endsWith('/') || to === '') return CLEAN ? `${r}/` : `${r}/index.html`;
  return r;
};
const abs = (p) => `${SITE_URL}/${p}`;
const shopUrl = (p) => SHOP_HOST + p;
const productUrl = (lang, id) => `${SHOP_HOST}/${lang}/${PRODUCTS[id].path}`;
const loc = (v, lang) => (typeof v === 'object' ? v[lang] : v);

function img(from, name, alt, opts = {}) {
  const [w, h] = opts.size || IMG_SIZE[name] || [800, 600];
  const load = opts.eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  return `<img src="${rel(from, `assets/img/${name}.webp`)}" alt="${esc(alt)}" width="${w}" height="${h}" ${load}>`;
}
const shopLink = (L, href, text, cls = 'btn btn-primary') => `<a class="${cls}" data-magnetic href="${href}" target="_blank" rel="noopener"><span>${text}</span>${EXT}<span class="vh"> ${L.ui.shopNew}</span></a>`;
const extLink = (L, href, text, cls = 'link') => `<a class="${cls}" href="${href}" target="_blank" rel="noopener">${esc(text)}<span class="vh"> ${L.ui.extNew}</span></a>`;
const adviceLink = (L, from, service, cls = 'btn btn-ghost') => `<a class="${cls}" data-magnetic href="${rel(from, pagePath(L.lang, 'contact'))}${service ? `?s=${service}` : ''}#solicitud"><span>${L.ui.adviceCta}</span></a>`;

/* -------- Bloques -------- */
function editorial(L, from, b, opts = {}) {
  const links = b.link ? `<p>${extLink(L, shopUrl(b.url), b.link)}</p>` : '';
  const blend = b.img && ON_BLACK.has(b.img);
  const fig = b.img ? `<figure class="ed-fig${b.light ? ' is-light' : ''}${blend ? ' is-blend' : ''}" data-parallax="${opts.dark ? 9 : 6}">${img(from, b.img, b.alt)}</figure>` : '';
  return `<div class="editorial${opts.reverse ? ' is-reverse' : ''}${fig ? '' : ' no-fig'}"><div class="ed-text"><h2 data-lines>${esc(b.h)}</h2><div data-rise>${b.p.map((t, i) => `<p${i === 0 ? ' class="lead"' : ''}>${esc(t)}</p>`).join('')}${links}</div></div>${fig}</div>`;
}
const section = (cls, html) => `<section class="scene ${cls}"><div class="wrap">${html}</div></section>`;
const head2 = (h, sub) => `<div class="scene-head"><h2 data-lines>${esc(h)}</h2>${sub ? `<p class="lead" data-rise>${esc(sub)}</p>` : ''}</div>`;

function rows(items, cls = '') {
  return `<ol class="rows ${cls}">${items.map(([h, t], i) => `<li class="row" data-rise><span class="row-n" aria-hidden="true">${num(i)}</span><h3>${esc(h)}</h3><p>${esc(t)}</p></li>`).join('')}</ol>`;
}
function faq(L, items) {
  return section('scene-light', `<div class="faq-grid"><h2 data-lines>${L.ui.faq}</h2><div class="faq">${items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></div>`);
}
function cta(L, from, head, text, service) {
  const href = `${rel(from, pagePath(L.lang, 'contact'))}${service ? `?s=${service}` : ''}#solicitud`;
  return `<section class="cta-giant smoke"><div class="wrap"><h2 data-chars>${esc(head)}</h2><p class="lead" data-rise>${esc(text)}</p>
  <div class="cta-actions"><a class="orb" data-magnetic href="${href}"><span>${L.ui.adviceCta}</span></a><a class="big-link" href="${TEL_HREF}">${TEL}</a></div></div></section>`;
}
function bigRelated(L, from, keys) {
  return `<section class="scene scene-light related"><div class="wrap"><p class="eyebrow">${L.ui.related}</p><ul class="big-rows">${keys.map((k) => {
    const s = L.services[k] || { label: L.pages[k].nav, card: '' };
    return `<li><a href="${rel(from, pagePath(L.lang, k))}" data-hover-img="${s.img ? rel(from, `assets/img/${s.img}.webp`) : ''}"><span class="br-t">${esc(s.label)}</span><span class="br-d">${esc(s.card)}</span><span class="br-a" aria-hidden="true">→</span></a></li>`;
  }).join('')}</ul></div></section>`;
}
function systems(L, from, P) {
  // Lista comparativa; la imagen sigue al cursor en escritorio y va en línea en móvil.
  const items = P.table.map((r, i) => {
    const pid = r.p, prod = pid && PRODUCTS[pid];
    const src = prod ? rel(from, `assets/img/${prod.img}.webp`) : '';
    const action = pid ? shopLink(L, productUrl(L.lang, pid), r.label, 'sys-link') : `<a class="sys-link" href="${rel(from, pagePath(L.lang, 'contact'))}#solicitud"><span>${esc(r.contact)}</span></a>`;
    return `<li class="sys" data-rise${src ? ` data-hover-img="${src}"` : ''}><span class="row-n" aria-hidden="true">${num(i)}</span><h3>${esc(r.n)}</h3>
      <dl><div><dt>${esc(P.tableCols[1])}</dt><dd>${esc(r.how)}</dd></div><div><dt>${esc(P.tableCols[2])}</dt><dd>${esc(r.where)}</dd></div></dl>${action}</li>`;
  }).join('');
  return `<ul class="systems" aria-label="${esc(P.tableCaption)}">${items}</ul>`;
}
function strip(L, from, ids) {
  return `<div class="strip" data-strip tabindex="0" role="region" aria-label="${esc(L.ui.shop)}">${ids.map((id) => productCard(L, from, id)).join('')}</div><p class="note">${esc(L.ui.shopNote)}</p>`;
}
function productCard(L, from, id, extra = '') {
  const p = PRODUCTS[id], lang = L.lang, st = STUDIO[id];
  return `<a class="product${p.light ? ' is-light' : ''}${st ? ' is-studio' : ''}${extra}" href="${productUrl(lang, id)}" target="_blank" rel="noopener" data-name="${esc(loc(p.name, lang))}">
    <figure>${st ? img(from, st[0], p.alt[lang], { size: [st[1], st[2]] }) : img(from, p.img, p.alt[lang], { size: [p.w, p.h] })}</figure>
    <span class="product-body"><strong>${esc(loc(p.name, lang))}</strong><span class="desc">${esc(p.d[lang])}</span>
    <span class="to-shop">${L.ui.toShop}${EXT}<span class="vh"> ${L.ui.shopNew}</span></span></span></a>`;
}
function showItem(L, from, id, i) {
  const p = PRODUCTS[id], lang = L.lang;
  const [name, w, h] = STUDIO[id];
  return `<a class="show-item" href="${productUrl(lang, id)}" target="_blank" rel="noopener"><figure>${img(from, name, p.alt[lang], { size: [w, h] })}</figure>
    <span class="show-body"><span class="show-n" aria-hidden="true">${num(i)} / ${num(SHOWCASE.length - 1)}</span><strong>${esc(loc(p.name, lang))}</strong><span class="desc">${esc(p.d[lang])}</span>
    <span class="to-shop">${L.ui.toShop}${EXT}<span class="vh"> ${L.ui.shopNew}</span></span></span></a>`;
}
function marquee(label, list = AROMAS) {
  const ul = (hidden) => `<ul${hidden ? ' aria-hidden="true"' : ''}>${list.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>`;
  return `<section class="marquee" aria-label="${esc(label)}" data-marquee><div class="marquee-track">${ul(false)}${ul(true)}</div></section>`;
}

function innerHero(L, from, key) {
  const P = L.pages[key];
  const blend = P.img && ON_BLACK.has(P.img);
  const fig = P.img ? `<figure class="ph-fig${P.light ? ' is-light' : ''}${blend ? ' is-blend' : ''}" data-float>${img(from, P.img, P.alt, { eager: true })}</figure>` : '';
  const actions = key === 'contact' ? '' : `<div class="btn-row" data-rise>${shopLink(L, shopUrl(key === 'higiene' ? SHOP[L.lang].clean : key === 'about' || key === 'marketing' ? SHOP[L.lang].root : SHOP[L.lang].aroma), L.ui.shopCta)}${adviceLink(L, from, P.ctaService)}</div>`;
  return `<section class="page-hero smoke${fig ? '' : ' no-fig'}"><div class="wrap ph-in"><div class="ph-text">
    <nav class="crumbs" aria-label="${esc(L.ui.crumbs)}"><ol><li><a href="${rel(from, pagePath(L.lang, 'home'))}">${L.ui.home}</a></li><li aria-current="page">${esc(P.nav)}</li></ol></nav>
    <span class="eyebrow">${esc(P.eyebrow)}</span><h1 data-chars>${esc(P.h1)}</h1><p class="lead" data-rise>${esc(P.lead)}</p>${actions}
  </div>${fig}</div></section>`;
}

/* -------- Páginas -------- */
const RENDER = {
  home(L, from) {
    const P = L.pages.home, lang = L.lang, F = L.fx;
    return `
<section class="hero smoke">
  <img class="hero-still" src="${rel(from, 'assets/img/hero-poster.webp')}" srcset="${rel(from, 'assets/img/hero-poster-640.webp')} 640w, ${rel(from, 'assets/img/hero-poster.webp')} 1280w" sizes="100vw" alt="" width="1280" height="720" fetchpriority="high">
  <div class="wrap hero-in">
    <span class="eyebrow">${esc(P.eyebrow)}</span>
    <h1 class="mega"><span class="mega-big" data-chars>${esc(F.h1Big)}</span> <span class="mega-small" data-rise>${esc(F.h1Small)}</span></h1>
    <p class="lead" data-rise>${esc(P.lead)}</p>
    <div class="btn-row" data-rise>${shopLink(L, shopUrl(SHOP[lang].root), L.ui.shopCta)}${adviceLink(L, from)}</div>
    <p class="hero-note" data-rise>${esc(P.shopHint)} <em>${esc(P.tagline)}</em></p>
  </div>
  <p class="hero-move" aria-hidden="true">${esc(F.move)}</p>
</section>

<section class="manifesto" data-manifesto>
  <div class="man-stage">
    <div class="man-video"><video muted loop playsinline preload="none" poster="${rel(from, 'assets/img/hero-poster.webp')}" aria-hidden="true" tabindex="-1"><source data-src="${rel(from, 'assets/video/aroma.mp4')}" type="video/mp4"><source data-src="${rel(from, 'assets/video/aroma.webm')}" type="video/webm"></video></div>
    <p class="man-text" data-words>${esc(F.manifesto)}</p>
  </div>
</section>

<section class="duo" aria-labelledby="aud-h"><h2 id="aud-h" class="vh">${esc(P.audHead)}</h2>
  ${P.aud.map((a, i) => `<a class="duo-panel" href="${rel(from, pagePath(lang, a.to))}"><figure>${img(from, i === 0 ? 'a-odotipo' : 'a-mikado', '', { size: IMG_SIZE[i === 0 ? 'a-odotipo' : 'a-mikado'] })}</figure><span class="duo-body"><h3>${esc(a.title)}</h3><ul>${a.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><span class="more">${esc(a.link)}</span></span></a>`).join('')}
</section>

<section class="hscroll" data-hscroll aria-labelledby="serv-h"><div class="h-track">
  <div class="h-panel h-intro"><h2 id="serv-h" class="display">${esc(P.servHead)}</h2><p class="lead">${esc(P.servSub)}</p><span class="h-arrow" aria-hidden="true">→</span></div>
  ${SERVICE_KEYS.map((k, i) => {
    const s = L.services[k];
    return `<a class="h-panel h-service" href="${rel(from, pagePath(lang, k))}"><span class="h-num" aria-hidden="true">${num(i)}</span><figure class="${ON_BLACK.has(s.img) ? 'is-blend' : ''}">${img(from, s.img, s.alt)}</figure><span class="h-body"><h3>${esc(s.label)}</h3><p>${esc(s.card)}</p><span class="more">+ info</span></span></a>`;
  }).join('')}
</div></section>

<section class="winter smoke" aria-labelledby="winter-h"><div class="wrap">
  <span class="eyebrow">${esc(F.winterEyebrow)}</span>
  <h2 id="winter-h" data-lines>${esc(F.winterHead)}</h2>
  <p class="lead" data-rise>${esc(F.winterText)}</p>
  <ul class="winter-list" data-rise>${F.winterList.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  <div class="btn-row" data-rise><a class="btn btn-primary" data-magnetic href="${rel(from, pagePath(lang, 'aroma'))}"><span>${esc(F.winterA)}</span></a><a class="btn btn-ghost" data-magnetic href="${rel(from, pagePath(lang, 'neutral'))}"><span>${esc(F.winterB)}</span></a></div>
</div></section>

<section class="promises"><div class="wrap"><h2 data-lines>${esc(F.promisesHead)}</h2>
  <ul class="promise-list">${F.promises.map(([h, t]) => `<li data-rise><h3>${esc(h)}</h3><p>${esc(t)}</p></li>`).join('')}</ul>
</div></section>

${marquee(P.aromasLabel)}

<section class="paint smoke" aria-labelledby="paint-h"><div class="wrap">
  <h2 id="paint-h" data-lines>${esc(F.paintHead)}</h2><p class="lead" data-rise>${esc(F.paintSub)}</p>
  <div class="paint-list" data-paint>${PAINT.map(([n, c]) => `<button type="button" data-ink="${c}" style="--ink:${c}">${esc(n)}</button>`).join('')}</div>
  <p class="note">${esc(F.paintNote)}</p>
</div></section>

<section class="showcase" data-showcase aria-labelledby="ring-h"><div class="show-stage">
  <div class="wrap show-head"><h2 id="ring-h" data-lines>${esc(P.prodHead)}</h2><p class="lead">${esc(P.prodSub)}</p></div>
  <div class="show-list">${SHOWCASE.map((id, i) => showItem(L, from, id, i)).join('')}</div>
  <div class="wrap show-foot"><p class="note">${esc(L.ui.shopNote)}</p></div>
</div></section>

<section class="scene scene-light steps-scene"><div class="wrap">${head2(P.stepsHead, P.stepsSub)}
  <ol class="steps" data-steps>${P.steps.map(([h, t], i) => `<li><span class="step-n" aria-hidden="true">${num(i)}</span><h3>${esc(h)}</h3><p>${esc(t)}</p></li>`).join('')}</ol>
</div></section>

<section class="shop-band"><div class="wrap shop-in"><div><h2 data-chars>${esc(P.bandHead)}</h2><p class="lead" data-rise>${esc(P.bandText)}</p><div class="btn-row" data-rise>${shopLink(L, shopUrl(SHOP[lang].aroma), L.services.aroma.label, 'btn btn-dark')}${shopLink(L, shopUrl(SHOP[lang].clean), 'Ambinature Clean', 'btn btn-outline')}</div></div>
  <figure class="tilt" data-tilt>${img(from, 'a-bodegon', L.pages.about.alt)}</figure></div></section>

<section class="scene posts-scene"><div class="wrap">${head2(P.postsHead)}
  <div class="posts">${P.posts.map((b) => `<a class="post" href="${shopUrl(b.u)}" target="_blank" rel="noopener"><figure>${img(from, b.img, b.alt)}</figure><span class="post-body"><strong>${esc(b.t)}</strong><span class="more">${L.ui.readMore}</span><span class="vh"> ${L.ui.extNew}</span></span></a>`).join('')}</div>
</div></section>
${faq(L, P.faq)}${cta(L, from, P.ctaHead, P.ctaText)}`;
  },

  marketing(L, from) {
    const P = L.pages.marketing;
    return `${innerHero(L, from, 'marketing')}
${section('scene-light', editorial(L, from, P.block1))}
${section('scene-dark smoke', editorial(L, from, P.block2, { reverse: true, dark: true }))}
${section('scene-light', head2(P.spacesHead, P.spacesSub) + rows(P.spaces))}
<section class="scene scene-dark smoke"><div class="wrap">${head2(P.pyrHead, P.pyrSub)}
  <div class="pyramid"><div class="pyr-levels" role="tablist" aria-label="${esc(L.ui.pyrLabel)}" aria-orientation="vertical">${P.pyr.map(([s], i) => `<button type="button" role="tab" id="pt-${i}" aria-controls="pp-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-ink="${['#cfe657', '#f06a8a', '#ff8a2a'][i]}">${esc(s)}</button>`).join('')}</div>
  <div class="pyr-panels">${P.pyr.map(([, h, t], i) => `<div class="pyr-panel" role="tabpanel" id="pp-${i}" aria-labelledby="pt-${i}"${i ? ' hidden' : ''}><h3>${esc(h)}</h3><p class="lead">${esc(t)}</p></div>`).join('')}<p>${extLink(L, shopUrl(P.pyrUrl), P.pyrLink)}</p></div></div>
</div></section>
${faq(L, P.faq)}${cta(L, from, P.ctaHead, P.ctaText, P.ctaService)}${bigRelated(L, from, P.related)}`;
  },

  aroma(L, from) {
    const P = L.pages.aroma, lang = L.lang;
    return `${innerHero(L, from, 'aroma')}
${section('scene-light', editorial(L, from, P.block1))}
${section('scene-dark smoke', head2(L.fx.processHead) + rows(L.pages.home.steps))}
${section('scene-light', head2(L.fx.promisesHead) + rows(L.fx.promises))}
${section('scene-dark smoke', head2(P.tableHead, P.tableSub) + systems(L, from, P) + `<p class="note">${extLink(L, CATALOG, P.catalog)}. ${esc(P.catalogNote)}</p>`)}
${marquee(P.aromasHead)}
${section('scene-light', `<div class="editorial no-fig"><div class="ed-text"><h2 data-lines>${esc(P.aromasHead)}</h2><div data-rise><p class="lead">${esc(P.aromasText)}</p><p>${extLink(L, shopUrl(P.odorUrl), P.odorLink)}</p></div></div></div>`)}
${section('scene-dark smoke', head2(P.prodHead, P.prodSub) + strip(L, from, ['ambiwick', 'carga', 'dispensador', 'sprai', 'turbo']) + `<div class="btn-row">${shopLink(L, shopUrl(SHOP[lang].aroma), `${L.ui.shopCta}: ${L.services.aroma.label}`)}</div>`)}
${faq(L, P.faq)}${cta(L, from, P.ctaHead, P.ctaText, P.ctaService)}${bigRelated(L, from, P.related)}`;
  },

  neutral(L, from) {
    const P = L.pages.neutral;
    return `${innerHero(L, from, 'neutral')}
${section('scene-light', editorial(L, from, P.block1))}
${section('scene-dark smoke', head2(P.spacesHead, P.spacesSub) + rows(P.spaces))}
${section('scene-light', `<div class="editorial no-fig"><div class="ed-text"><h2 data-lines>${esc(P.howHead)}</h2><p class="lead" data-rise>${esc(P.howText)}</p></div></div>`)}
${faq(L, P.faq)}${cta(L, from, P.ctaHead, P.ctaText, P.ctaService)}${bigRelated(L, from, P.related)}`;
  },

  hogar(L, from) {
    const P = L.pages.hogar, lang = L.lang;
    return `${innerHero(L, from, 'hogar')}
${section('scene-dark smoke', editorial(L, from, P.block1, { dark: true }) + editorial(L, from, P.block2, { reverse: true, dark: true }))}
${section('scene-light', head2(P.tipsHead) + rows(P.tips))}
${section('scene-dark smoke', head2(P.prodHead, P.prodSub) + strip(L, from, ['hs275', 'hs500', 'hs1000', 'mikado']) + `<div class="btn-row">${shopLink(L, shopUrl(SHOP[lang].aroma), L.ui.shopCta)}</div>`)}
${faq(L, P.faq)}${cta(L, from, P.ctaHead, P.ctaText, P.ctaService)}${bigRelated(L, from, P.related)}`;
  },

  higiene(L, from) {
    const P = L.pages.higiene, lang = L.lang;
    return `${innerHero(L, from, 'higiene')}
${section('scene-dark smoke', editorial(L, from, P.block1, { dark: true }))}
${section('scene-light', editorial(L, from, P.block2, { reverse: true }))}
${section('scene-dark smoke', head2(P.tableHead, P.tableSub) + systems(L, from, P) + `<p class="safety">${esc(P.safety)}</p>`)}
${section('scene-light', head2(P.prodHead, P.prodSub) + strip(L, from, ['super', 'inhol', 'tensibac']) + `<div class="btn-row">${shopLink(L, shopUrl(SHOP[lang].clean), `${L.ui.shopCta}: Ambinature Clean`, 'btn btn-dark')}</div>`)}
${faq(L, P.faq)}${cta(L, from, P.ctaHead, P.ctaText, P.ctaService)}${bigRelated(L, from, P.related)}`;
  },

  about(L, from) {
    const P = L.pages.about;
    return `${innerHero(L, from, 'about')}
${section('scene-light', editorial(L, from, P.block1) + `<p>${extLink(L, PRESENTATION, P.pres)}</p>`)}
${section('scene-dark smoke', head2(P.valuesHead) + rows(P.values))}
${section('scene-light', `<div class="two-notes"><div data-rise><h2>${esc(P.networkHead)}</h2><p>${esc(P.networkText)}</p><p>${P.network.map(([t, u]) => extLink(L, u, t)).join(' · ')}</p></div></div>`)}
${section('scene-light facts-scene', `<h2 data-lines>${esc(P.factsHead)}</h2><dl class="facts" data-rise>${P.facts.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}<div><dt>${esc(P.labelsTel)}</dt><dd><a href="${TEL_HREF}">${TEL}</a></dd></div><div><dt>${esc(P.labelsMail)}</dt><dd><a href="mailto:${EMAIL}">${EMAIL}</a></dd></div><div><dt>${esc(P.labelsShop)}</dt><dd><a href="${shopUrl(SHOP[L.lang].root)}" target="_blank" rel="noopener">ambinature.ad<span class="vh"> ${L.ui.shopNew}</span></a></dd></div></dl>`)}
${cta(L, from, P.ctaHead, P.ctaText)}${bigRelated(L, from, P.related)}`;
  },

  contact(L, from) {
    const P = L.pages.contact, F = P.f, lang = L.lang;
    const opts = Object.entries(F.opts).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
    const req = ` <span class="req" aria-hidden="true">*</span><span class="vh">(${F.req})</span>`;
    return `${innerHero(L, from, 'contact')}
<section class="scene scene-dark smoke contact-direct"><div class="wrap">
  <h2 class="vh">${esc(P.directHead)}</h2>
  <p class="contact-label">${esc(P.labels.tel)}</p><a class="contact-huge" data-magnetic-text href="${TEL_HREF}">${TEL}</a>
  <p class="contact-label">${esc(P.labels.mail)}</p><a class="contact-huge is-mail" data-magnetic-text href="mailto:${EMAIL}">${EMAIL}</a>
  <div class="contact-meta"><p><span class="contact-label">${esc(P.labels.addr)}</span>${esc(P.addr)}</p><p><span class="contact-label">${esc(P.labels.social)}</span>${extLink(L, IG, 'Instagram')} · ${extLink(L, FB, 'Facebook')}</p></div>
</div></section>
<section class="scene scene-light"><div class="wrap contact-grid">
  <form id="contact-form" class="form" data-to="${EMAIL}" novalidate aria-labelledby="solicitud">
    <h2 id="solicitud" data-lines>${esc(P.formHead)}</h2>
    <p class="lead">${esc(P.formIntro)}</p>
    <div class="field"><label for="f-nombre">${esc(F.name)}${req}</label><input id="f-nombre" name="nombre" type="text" autocomplete="name" required aria-describedby="f-nombre-err"><p class="err" id="f-nombre-err"></p></div>
    <div class="field"><label for="f-empresa">${esc(F.company)}</label><input id="f-empresa" name="empresa" type="text" autocomplete="organization"></div>
    <fieldset><legend>${esc(F.type)}</legend><div class="radios"><label><input type="radio" name="tipo" value="empresa" checked> ${esc(F.typeBiz)}</label><label><input type="radio" name="tipo" value="particular"> ${esc(F.typeHome)}</label></div></fieldset>
    <div class="field"><label for="f-interes">${esc(F.interest)}</label><select id="f-interes" name="interes">${opts}</select></div>
    <div class="field"><label for="f-email">${esc(F.email)}${req}</label><input id="f-email" name="email" type="email" autocomplete="email" required aria-describedby="f-email-err"><p class="err" id="f-email-err"></p></div>
    <div class="field"><label for="f-tel">${esc(F.tel)}</label><input id="f-tel" name="tel" type="tel" autocomplete="tel" aria-describedby="f-tel-err"><p class="err" id="f-tel-err"></p></div>
    <div class="field"><label for="f-mensaje">${esc(F.msg)}${req}</label><textarea id="f-mensaje" name="mensaje" required aria-describedby="f-mensaje-err"></textarea><p class="err" id="f-mensaje-err"></p></div>
    <button class="btn btn-dark" type="submit"><span>${esc(F.send)}</span></button>
    <p class="note">${esc(F.privacy)} ${extLink(L, shopUrl(SHOP[lang].privacy), L.ui.footPrivacy)}.</p>
    <p class="form-status" id="form-status" role="status" tabindex="-1" hidden>${esc(F.status)}</p>
  </form>
  <aside class="contact-side">
    <h3>${esc(P.shopHead)}</h3><p>${esc(P.shopText)}</p><p>${shopLink(L, shopUrl(SHOP[lang].root), L.ui.shopCta, 'btn btn-dark')}</p>
    <h3>${esc(L.fx.quote)}</h3><p>${esc(P.altText)}</p><p><a class="btn btn-outline" href="${TALLY}" target="_blank" rel="noopener"><span>${esc(L.fx.tally)}</span>${EXT}<span class="vh"> ${L.ui.extNew}</span></a></p>
  </aside>
</div></section>`;
  },
};

/* -------- Plantilla -------- */
function jsonLd(L, key) {
  const P = L.pages[key], lang = L.lang;
  const org = {
    '@type': 'Organization', name: 'AmbiNature Andorra', legalName: 'AMBINATURE SL', description: L.ui.footAbout, foundingDate: '2015', telephone: '+376354151', email: EMAIL,
    sameAs: [IG, FB, SHOP_HOST], areaServed: { '@type': 'Country', name: 'Andorra' },
    // Solo el país hasta resolver la diferencia entre domicilio legal y comercial.
    address: { '@type': 'PostalAddress', addressCountry: 'AD' },
    knowsAbout: SERVICE_KEYS.map((k) => L.pages[k].service),
    contactPoint: { '@type': 'ContactPoint', contactType: 'sales', telephone: '+376354151', email: EMAIL, areaServed: 'AD', availableLanguage: ['ca', 'es'] },
    identifier: { '@type': 'PropertyValue', propertyID: 'NRT', value: 'L-710381-R' },
  };
  if (PROD) { org.url = abs(pagePath(lang, 'home')); org['@id'] = `${SITE_URL}/#organization`; org.logo = abs('assets/img/logo-ambinature.svg'); org.image = abs('assets/img/og-image.jpg'); }
  const graph = [org];
  const pageUrl = abs(pagePath(lang, key));
  if (PROD) {
    graph.push({ '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: abs(pagePath(lang, 'home')), name: 'AmbiNature Andorra', inLanguage: lang, publisher: { '@id': `${SITE_URL}/#organization` } });
    const webPage = { '@type': key === 'about' ? 'AboutPage' : key === 'contact' ? 'ContactPage' : 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: P.title, description: P.desc, inLanguage: lang, dateModified: LAST_UPDATED, isPartOf: { '@id': `${SITE_URL}/#website` }, about: { '@id': `${SITE_URL}/#organization` } };
    if (key !== 'home') webPage.breadcrumb = { '@id': `${pageUrl}#breadcrumb` };
    graph.push(webPage);
  }
  if (P.service) {
    const service = { '@type': 'Service', name: P.service, serviceType: P.service, description: P.desc, areaServed: { '@type': 'Country', name: 'Andorra' }, provider: PROD ? { '@id': `${SITE_URL}/#organization` } : { '@type': 'Organization', name: 'AmbiNature Andorra' } };
    if (PROD) service.url = pageUrl;
    graph.push(service);
  }
  // Mismas preguntas y respuestas que se ven en la página.
  if (P.faq) graph.push({ '@type': 'FAQPage', mainEntity: P.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
  if (PROD && key !== 'home') {
    graph.push({ '@type': 'BreadcrumbList', '@id': `${pageUrl}#breadcrumb`, itemListElement: [
      { '@type': 'ListItem', position: 1, name: L.ui.home, item: abs(pagePath(lang, 'home')) },
      { '@type': 'ListItem', position: 2, name: P.nav, item: pageUrl },
    ] });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

// Efectos siempre activos, también con "reducir movimiento". Solo se apagan con el botón del pie (o ?fx=off).
const FX_BOOT = `(function(){var h=document.documentElement,s=null;h.classList.add('js');try{s=localStorage.getItem('ambi-fx')}catch(e){}var q=location.search.match(/[?&]fx=(on|off)/);if(q){s=q[1];try{localStorage.setItem('ambi-fx',s)}catch(e){}}var r=matchMedia('(prefers-reduced-motion: reduce)').matches;if(r)h.classList.add('prefers-still');if(s!=='off')h.classList.add('fx');addEventListener('pagereveal',function(e){if(e.viewTransition&&!h.classList.contains('fx')){e.viewTransition.ready.catch(function(){});e.viewTransition.finished.catch(function(){});e.viewTransition.skipTransition()}})})()`;

function head(L, key, from, opts = {}) {
  const P = opts.page || L.pages[key];
  const path = opts.path ?? pagePath(L.lang, key);
  const seo = PROD && !opts.noindex ? `<link rel="canonical" href="${abs(path)}">
${WITH_ES ? `<link rel="alternate" hreflang="ca" href="${abs(pagePath('ca', key))}">
<link rel="alternate" hreflang="es" href="${abs(pagePath('es', key))}">
<link rel="alternate" hreflang="x-default" href="${abs(pagePath('ca', key))}">` : ''}
<meta property="og:url" content="${abs(path)}">` : '<meta name="robots" content="noindex, nofollow">';
  const share = ORIGIN ? `<meta property="og:image" content="${ORIGIN}/assets/img/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="AmbiNature Andorra">
<meta name="twitter:card" content="summary_large_image">` : '';
  const preload = key === 'home' ? `<link rel="preload" as="image" href="${rel(from, 'assets/img/hero-poster.webp')}" imagesrcset="${rel(from, 'assets/img/hero-poster-640.webp')} 640w, ${rel(from, 'assets/img/hero-poster.webp')} 1280w" imagesizes="100vw">` : '';
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(P.title)}</title>
<meta name="description" content="${esc(P.desc)}">
<meta name="theme-color" content="#000000">
${seo}
<meta property="og:type" content="website">
<meta property="og:site_name" content="AmbiNature Andorra">
<meta property="og:locale" content="${L.lang === 'ca' ? 'ca_ES' : 'es_ES'}">
<meta property="og:title" content="${esc(P.title)}">
<meta property="og:description" content="${esc(P.desc)}">
${share}
<link rel="icon" type="image/png" sizes="32x32" href="${rel(from, 'assets/img/favicon-32.png')}">
<link rel="apple-touch-icon" href="${rel(from, 'assets/img/apple-touch.png')}">
<link rel="preload" as="font" type="font/woff2" href="${rel(from, 'assets/fonts/montserrat-latin-wght.woff2')}" crossorigin>
${preload}
<link rel="stylesheet" href="${rel(from, 'assets/css/styles.css')}?v=${VER}">
<script>${FX_BOOT}</script>`;
}

function header(L, key, from) {
  const items = PAGE_KEYS.filter((k) => k !== 'home');
  const other = LANGS[L.other];
  const langSwitch = `<div class="lang" role="group" aria-label="${L.ui.langLabel}">
    <span aria-current="true" lang="${L.lang}">${L.short}<span class="vh"> ${L.name}</span></span>
    <a href="${rel(from, pagePath(L.other, key))}" hreflang="${L.other}" lang="${L.other}">${other.short}<span class="vh"> ${other.name}</span></a></div>`;
  return `<header class="site-header"><div class="wrap header-in">
  <a class="brand" href="${rel(from, pagePath(L.lang, 'home'))}"><img src="${rel(from, 'assets/img/logo-ambinature.svg')}" alt="AmbiNature Andorra" width="172" height="19"></a>
  <nav class="nav" id="nav" aria-label="${L.ui.navLabel}"><ul>${items.map((k, i) => `<li><a href="${rel(from, pagePath(L.lang, k))}"${k === key ? ' aria-current="page"' : ''}><span class="nav-n" aria-hidden="true">${num(i)}</span>${esc(L.pages[k].nav)}</a></li>`).join('')}</ul></nav>
  ${WITH_ES ? langSwitch : ''}
  ${shopLink(L, shopUrl(SHOP[L.lang].root), L.ui.shop, 'btn btn-primary header-shop')}
  <button class="menu-btn" type="button" aria-controls="nav" aria-expanded="false" aria-label="${L.ui.menuOpen}" data-open="${L.ui.menuOpen}" data-close="${L.ui.menuClose}"><span></span><span></span><span></span></button>
</div></header>`;
}

function footer(L, from) {
  const lang = L.lang;
  return `<footer class="site-footer"><div class="wrap">
  <div class="footer-grid">
    <div class="footer-brand"><p>${esc(L.ui.footAbout)}</p><p><em>${esc(L.ui.footTagline)}</em></p></div>
    <div><h2>${L.ui.footServices}</h2><ul>${SERVICE_KEYS.map((k) => `<li><a href="${rel(from, pagePath(lang, k))}">${esc(L.services[k].label)}</a></li>`).join('')}</ul></div>
    <div><h2>${L.ui.footCompany}</h2><ul><li><a href="${rel(from, pagePath(lang, 'about'))}">${esc(L.pages.about.nav)}</a></li><li><a href="${rel(from, pagePath(lang, 'contact'))}">${esc(L.pages.contact.nav)}</a></li><li><a href="${shopUrl(SHOP[lang].root)}" target="_blank" rel="noopener">${L.ui.shop} ${EXT}<span class="vh"> ${L.ui.shopNew}</span></a></li></ul></div>
    <div><h2>${L.ui.footContact}</h2><ul><li><a href="${TEL_HREF}">${TEL}</a></li><li><a href="mailto:${EMAIL}">${EMAIL}</a></li><li><a href="${IG}" target="_blank" rel="noopener">Instagram<span class="vh"> ${L.ui.extNew}</span></a></li><li><a href="${FB}" target="_blank" rel="noopener">Facebook<span class="vh"> ${L.ui.extNew}</span></a></li></ul></div>
  </div>
  <img class="footer-logo" src="${rel(from, 'assets/img/logo-ambinature.svg')}" alt="AmbiNature Andorra" width="1200" height="130" loading="lazy">
  <div class="footer-legal"><p>${L.ui.footCompanyLine}. ${esc(L.ui.footLegalNote)}</p>
    <p class="legal-links">${[['legal', L.ui.footLegal], ['privacy', L.ui.footPrivacy], ['cookies', L.ui.footCookies], ['terms', L.ui.footTerms]].map(([k, t]) => `<a href="${shopUrl(SHOP[lang][k])}" target="_blank" rel="noopener">${esc(t)}<span class="vh"> ${L.ui.extNew}</span></a>`).join('')}<button class="fx-toggle" type="button" data-on="${esc(L.fx.fxOn)}" data-off="${esc(L.fx.fxOff)}">${esc(L.fx.fxOff)}</button></p></div>
</div></footer>`;
}

function mobileBar(L) {
  return `<nav class="mobile-bar" aria-label="${L.ui.footContact}">
  <a href="${TEL_HREF}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z"/></svg>${L.ui.call}</a>
  <a href="mailto:${EMAIL}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 6 9-6"/></svg>${L.ui.mail}</a>
  <a class="shop" href="${shopUrl(SHOP[L.lang].root)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 8h12l1 12H5L6 8z"/><path d="M9 10V6a3 3 0 016 0v4"/></svg>${L.ui.shop}<span class="vh"> ${L.ui.shopNew}</span></a>
</nav>`;
}

function scripts(from) {
  const s = ['vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js', 'vendor/lenis.min.js', 'main.js'];
  return s.map((f) => `<script src="${rel(from, `assets/js/${f}`)}?v=${VER}" defer></script>`).join('\n');
}

function page(L, key) {
  const from = pagePath(L.lang, key).replace(/\/$/, '');
  const body = RENDER[key](L, from);
  const i18n = { ...L.i18n, fxOn: L.fx.fxOn, fxOff: L.fx.fxOff };
  return `<!doctype html>
<html lang="${L.lang}">
<head>
${head(L, key, from)}
<script type="application/ld+json">${jsonLd(L, key)}</script>
</head>
<body data-page="${key}">
<a class="skip" href="#main">${L.ui.skip}</a>
<canvas id="smoke" aria-hidden="true"></canvas>
${header(L, key, from)}
<main id="main">${body}</main>
${footer(L, from)}
${mobileBar(L)}
<button class="fx-pill" type="button" hidden>${esc(L.fx.fxOn)}</button>
<div class="hover-img" aria-hidden="true"><img alt="" width="360" height="360"></div>
<script>window.AMBI_I18N=${JSON.stringify(i18n)};window.AMBI_INK=${JSON.stringify(INK[key])}</script>
${scripts(from)}
</body>
</html>
`;
}

function gate() {
  // Idioma principal confirmado en el briefing: la raíz lleva al catalán.
  // En producción conviene sustituirlo por una redirección 301 del servidor.
  const target = CLEAN ? 'ca/' : 'ca/index.html';
  return `<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8"><title>AmbiNature Andorra</title>
<meta name="robots" content="noindex">${PROD ? `<link rel="canonical" href="${abs('ca/')}">` : ''}
<meta http-equiv="refresh" content="0; url=${target}">
</head>
<body><a href="${target}">AmbiNature Andorra</a></body></html>
`;
}

function notFound() {
  return `<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(ca.notFound.title)}</title>
<link rel="stylesheet" href="/assets/css/styles.css?v=${VER}">
</head>
<body><main class="gate"><div>
<img class="brand-big" src="/assets/img/logo-ambinature.svg" alt="AmbiNature Andorra" width="340" height="37">
<h1>${esc(ca.notFound.h1)}</h1><p>${esc(ca.notFound.p)}</p><div class="btn-row"><a class="btn btn-primary" href="/ca/"><span>${esc(ca.notFound.link)}</span></a>${WITH_ES ? `<a class="btn btn-ghost" href="/es/" lang="es"><span>${esc(es.notFound.link)}</span></a>` : ''}</div>
</div></main></body></html>
`;
}

function write(path, content) {
  const full = join(OUT, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(HERE, 'static'), join(OUT, 'assets'), { recursive: true });

for (const L of ACTIVE) {
  for (const key of PAGE_KEYS) write(`${pagePath(L.lang, key)}index.html`, page(L, key));
}
write('index.html', gate());
write('404.html', notFound());

if (PROD) {
  const urls = PAGE_KEYS.flatMap((k) => ACTIVE.map((L) => `  <url>
    <loc>${abs(pagePath(L.lang, k))}</loc>
    <lastmod>${LAST_UPDATED}</lastmod>${WITH_ES ? `
    <xhtml:link rel="alternate" hreflang="ca" href="${abs(pagePath('ca', k))}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${abs(pagePath('es', k))}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(pagePath('ca', k))}"/>` : ''}
  </url>`)).join('\n');
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`);
  // Cada bot se nombra para dejar clara la decisión: la web quiere aparecer en los buscadores de IA.
  const BOTS = ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'Claude-SearchBot', 'Claude-User', 'ClaudeBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended'];
  write('robots.txt', `User-agent: *\nAllow: /\n\n${BOTS.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  // Resumen para asistentes de IA, con los mismos datos que las páginas.
  const llms = ACTIVE.map((L) => `## ${L.lang === 'ca' ? 'Pàgines' : 'Páginas'} (${L.name})

${PAGE_KEYS.map((k) => `- [${L.pages[k].nav}](${abs(pagePath(L.lang, k))}): ${L.pages[k].desc}`).join('\n')}`).join('\n\n');
  write('llms.txt', `# AmbiNature Andorra

> ${ca.pages.about.block1.p[0]}

- Raó social: AMBINATURE SL (NRT L-710381-R)
- Àmbit: Andorra
- Telèfon: ${TEL}
- Correu: ${EMAIL}
- Botiga en línia: ${SHOP_HOST}

${llms}
`);
} else {
  // Vista previa: que no se indexe mientras no haya dominio definitivo.
  write('robots.txt', 'User-agent: *\nDisallow: /\n');
}
console.log(`Generado ${PROD ? 'PRODUCCIÓN para ' + SITE_URL : 'VISTA PREVIA (noindex)'} en ${OUT}`);
