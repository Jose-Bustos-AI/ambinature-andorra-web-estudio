# Guía para reproducir la web de AmbiNature Andorra

Documento de traspaso para el estudio. Explica cómo está hecha la web, con qué herramientas y con qué efectos, para construir una igual con los raíles de Dania (SEO, composición de páginas, etc.).

Actualizado el 6 de noviembre de 2026.

## Enlaces

| Qué | Dónde |
|---|---|
| Web publicada (vista previa, sin indexar) | https://ambinature-andorra.vercel.app |
| Repositorio | https://github.com/Jose-Bustos-AI/ambinature-andorra-web-estudio |

## Resumen en una frase

Web estática multipágina, sin framework ni dependencias de npm, generada con un script de Node. Los efectos se hacen con GSAP + ScrollTrigger, Lenis para el scroll suave en escritorio y una simulación de fluido propia en WebGL2 que dibuja el humo de fondo.

## Objetivo visual que hay que conservar

La clienta y el estudio han aprobado esta línea. El usuario la definió como "un cambio radical respecto a su web actual, con efecto wow, pero sin perder su marca". Para clonarla fielmente:

- **Concepto:** la aroma no se ve, así que la web la hace visible. Hay humo de tinta interactivo que sigue el dedo o el cursor y se remueve con el scroll.
- **Marca intacta:** logotipo original en SVG, sin redibujar, con los colores y la tipografía de la tienda (ambinature.ad).
- **Tipografía enorme en mayúsculas**, de peso fino (200-300), con escenas que se activan con el scroll.
- **Fotos de producto de estudio** sobre negro con humo verde, nunca recortes pegados sobre el fondo.

**Lo que el usuario rechazó** (no repetir):

| Rechazado | Alternativa adoptada |
|---|---|
| Diseño "de WordPress viejo", literal, sin movimiento | Escenas con scroll, humo y tipografía grande |
| La skill `web-dinamica` | Diseño propio para esta marca |
| Productos recortados pegados sobre el fondo | Fotos de estudio generadas con Dania a partir de las reales |
| Anillo 3D de productos recortados | Vitrina de una foto a pantalla por producto |
| Vídeo que se abre con esquinas cortadas (`clip-path`) | Fundido de opacidad con una ligera escala |
| Cualquier tirón al hacer scroll | Medición de fotogramas antes de entregar |
| Números de tarjetas cortados en móvil | Número dentro de la tarjeta, debajo de la imagen |

## Tecnologías

| Pieza | Versión o detalle | Para qué |
|---|---|---|
| Node.js | 18 o superior. Local: 24; Vercel: 26 | Ejecutar el generador `src/build.mjs` |
| HTML | Generado con plantillas de texto de JavaScript | Todo el contenido va en el HTML, también sin JavaScript |
| CSS | Un solo archivo escrito a mano, `src/static/css/styles.css`, con variables CSS | Diseño, responsive y transiciones |
| JavaScript | ES5 en funciones autoejecutables, sin módulos ni compilación | `main.js` (escenas) y `fluid.js` (humo) |
| GSAP + ScrollTrigger | 3.13.0, copia local en `src/static/js/vendor/` | Animaciones ligadas al scroll, fijados y `matchMedia` |
| Lenis | 1.3.4, copia local | Scroll suave, solo con ratón o trackpad |
| WebGL2 | Código propio, sin librerías | Simulación de fluido del humo |
| View Transitions API | CSS `@view-transition` | Transición entre páginas con un círculo de tinta |
| Montserrat | Fuente variable autoalojada, subconjunto latino (`woff2`) | Sin Google Fonts ni datos a terceros |
| Imágenes | WebP con ancho y alto declarados | Rendimiento y CLS 0 |
| Vídeo | MP4 + WebM de 14 s, sin sonido, menos de 600 KB | Escena del manifiesto |
| Vercel | `vercel.json` con compilación, redirección y cabeceras | Alojamiento de la vista previa |
| Pruebas | Puppeteer (`puppeteer-core` + Chrome) y Lighthouse | Capturas, fluidez, desbordes en móvil |
| Imágenes de producto | Dania, `edit_image_gpt2` (GPT Image 2) | Fotos de estudio a partir de las fotos reales |

No hay rastreadores ni analítica, y nada se carga de CDN.

## Estructura del repositorio

```
src/
  build.mjs            generador: plantillas, SEO, datos estructurados, sitemap, robots, llms.txt
  content.ca.mjs       textos base en catalán
  content.es.mjs       textos base en español
  content.fx.mjs       textos de las escenas y del briefing; se combinan encima de los anteriores
  static/
    css/styles.css     todo el CSS
    js/main.js         escenas, menú, formulario, efectos
    js/fluid.js        humo en WebGL2
    js/vendor/         gsap.min.js, ScrollTrigger.min.js, lenis.min.js
    img/               logo SVG, fotos WebP, favicon, imagen para redes
    video/             aroma.mp4, aroma.webm
    fonts/             Montserrat variable y su licencia
tools/                 servidor local y pruebas
docs/                  identidad visual, fuentes, SEO y esta guía
versiones/             copias de la v1 y la v2, solo de referencia
vercel.json            compilación, redirección de / a /ca/ y caché
```

`docs/identidad-visual.md` recoge los colores y la tipografía. Algunas notas de interacción de ese documento son de la v1; en efectos manda esta guía.

## Cómo se genera

```bash
node src/build.mjs
```

```bash
node tools/serve.mjs site 4173
```

Abre http://localhost:4173/ca/index.html. Los efectos se ven siempre, también con "reducir movimiento" activado en el sistema.

**Modos del generador:**

| Modo | Cómo | Resultado |
|---|---|---|
| Vista previa local | `node src/build.mjs` | `site/`, `noindex`, enlaces con `index.html` para abrir en local |
| Vista previa en Vercel | Lo mismo; Vercel define `VERCEL` | Enlaces limpios (`/ca/contacte/`), sigue `noindex` |
| Producción | `SITE_URL=https://dominio node src/build.mjs site` | Canónicas, sitemap, `robots.txt` abierto, `llms.txt`, datos estructurados completos. Solo catalán, salvo con `WITH_ES=1` |

**Piezas del generador** (`src/build.mjs`):

- `PAGE_KEYS` y `SERVICE_KEYS`: lista de páginas (inicio, cinco servicios, nosotros y contacto).
- `RENDER`: una función por página que compone bloques reutilizables (`innerHero`, `editorial`, `rows`, `faq`, `cta`, `bigRelated`, `systems`, `strip`, `marquee`, `showItem`).
- `head()`, `header()`, `footer()`, `mobileBar()` y `jsonLd()`: partes comunes.
- `VER`: hash de CSS y JS que se añade como `?v=` a sus URL, para que ningún navegador use una copia antigua.
- `LAST_UPDATED`: fecha de última revisión de los textos, para el sitemap y los datos estructurados.

Si el raíl de Dania tiene su propio sistema de plantillas, `build.mjs` se puede sustituir por completo. Lo que hay que conservar es el HTML que produce, con sus clases y atributos `data-*` (ver "Contrato de marcado").

## Sistema de efectos

Todo el contenido está en el HTML y se lee sin JavaScript. Los efectos se suman encima.

1. **Script en `<head>` (`FX_BOOT` en `build.mjs`).** Se ejecuta antes de pintar. Añade al `<html>`:
   - `js` siempre.
   - `fx` siempre, salvo que el visitante los haya apagado (`localStorage.ambi-fx` vale `off`) o la URL lleve `?fx=off`. Decisión del cliente: los efectos se ven aunque el sistema pida reducir movimiento.
   - `prefers-still` si el sistema pide reducir movimiento (solo informativo).
2. **`main.js`** añade `fx-ready` cuando GSAP está cargado. Sin `fx` o sin GSAP, la página se queda estática y completa.
3. **`fluid.js`** se carga 500 ms después de `load`, salvo con ahorro de datos. Si arranca, añade `fluid` y lanza el evento `ambi-fluid`.
4. **Controles para el visitante:**
   - Píldora "Activar efectes" (`.fx-pill`) si los ha apagado y su sistema pide reducir movimiento. Se oculta al hacer scroll.
   - Botón "Desactivar efectes" (`.fx-toggle`) en el pie. Guarda la preferencia en `localStorage`.

Las secciones con la clase `.smoke` tienen fondo transparente, y el humo se ve a través de ellas. Sin fluido, `html:not(.fluid)` les pone fondo negro.

## Catálogo de efectos

Todos están en `src/static/js/main.js` salvo el humo. "Escritorio" significa 900 px o más; "móvil", menos de 900 px.

| Efecto | Dónde | Cómo funciona |
|---|---|---|
| **Humo de tinta** | Fondo de todas las páginas | `fluid.js`: canvas fijo (`#smoke`) detrás del contenido. Ver la sección siguiente |
| Paleta por página | Cada página | `window.AMBI_INK` (constante `INK` en `build.mjs`) define los colores del humo |
| Humo que se remueve con el scroll | Todas | `ScrollTrigger.onUpdate` llama a `AmbiFluid.stir(diferencia de scroll)` |
| Explosiones de color al entrar | Portada y páginas | `AmbiFluid.burst(color, x, y)` al cargar el fluido |
| Botones de aromas | Portada, escena "Fes visible una aroma" | Cada botón lanza un `burst` de su color. Al entrar se pulsan solos los tres primeros |
| Títulos letra a letra | `[data-chars]` | Se parte en letras y entran con `yPercent: 115`, `rotate: 7` y `expo.out` |
| Títulos palabra a palabra | `[data-lines]` | Palabras con `yPercent: 60` y `stagger: 0.05` |
| Bloques que suben | `[data-rise]` | `y: 36`, opacidad, `power3.out`, una sola vez |
| Portada que se desvanece | `.hero-in` | Sube un 14 % y se apaga con `scrub` |
| **Manifiesto** | Portada, `[data-manifesto]` | Escena fijada (`pin`) de 200 % de alto. El vídeo pasa de opacidad 0 y escala 1,22 a 1, y las palabras se encienden una a una. El vídeo se carga al llegar y se pausa al salir |
| Paneles duo | Portada, "Per a negocis / Per a casa teva" | Aparición, parallax de la imagen y ensanche al pasar el ratón |
| **Servicios en horizontal** | Portada, escritorio | `[data-hscroll]` fijado; la pista se desplaza en X según el scroll |
| **Cartas apiladas** | Portada, móvil | Tarjetas `position: sticky`. La anterior se escala a 0,9 y llega a opacidad 0 mientras entra la siguiente |
| Cinta de aromas | `[data-marquee]` | Bucle infinito que acelera, cambia de sentido y se inclina según la velocidad del scroll |
| **Vitrina de productos** | Portada, `[data-showcase]` | Escritorio: escena fijada y fundido de un producto al siguiente, sin que se solapen los textos. Móvil: aparición simple |
| Pasos con línea de progreso | `[data-steps]` | La variable CSS `--line` crece con el scroll; los pasos se encienden por turnos |
| Parallax de imágenes | `[data-parallax]` | La imagen se desplaza dentro de su marco |
| Imagen flotante | `[data-float]` | Entra con escala y sube al bajar |
| Tiras de productos | `[data-strip]` | Entrada escalonada desde la derecha; deslizables con el dedo |
| Pirámide olfativa | Marketing olfactiu | Pestañas accesibles y capas que se separan al entrar |
| Botones magnéticos | `[data-magnetic]`, solo ratón | Siguen ligeramente al cursor |
| Imagen que sigue al cursor | `[data-hover-img]`, solo ratón | En listas de servicios relacionados |
| Inclinación 3D | `[data-tilt]`, solo ratón | Bodegón de la franja de tienda |
| Scroll suave | Solo ratón o trackpad | Lenis (`lerp: 0.14`) conectado al ticker de GSAP. En móvil se usa el scroll nativo |
| Transición entre páginas | Todas | `@view-transition` con un círculo que se abre (`ink-open`, 0,8 s). Se omite sin efectos |
| Menú móvil | Cabecera | Se abre en círculo desde la hamburguesa con `clip-path` |

### El humo (`src/static/js/fluid.js`)

Es una simulación de fluidos estable (método de Jos Stam), escrita en GLSL sobre WebGL2, en unas 200 líneas.

- **Pasos por fotograma:** advección, rotacional y confinamiento de vorticidad (`CURL 42`), divergencia, presión (iteraciones de Jacobi) y resta del gradiente. Después, se pinta el tinte con un mapeo tonal suave.
- **Parámetros:** malla de velocidad de 96 (64 en pantallas pequeñas) y tinte de 512 (384). 10 iteraciones de presión (8). Disipación de velocidad 0,22 y de tinte 0,42.
- **Rendimiento:**
  - El canvas se dibuja a 0,66 de la resolución (0,75 en móvil) y se escala.
  - Mientras se hace scroll salta fotogramas, para que el scroll tenga prioridad.
  - Si detecta fotogramas lentos, baja la calidad sola.
  - Se detiene cuando ninguna sección `.smoke` está a la vista (`IntersectionObserver` → `setActive`).
  - `stir` se limita a 160 ms.
- **Entrada:** `pointermove`, `pointerdown` y `touchmove`, pasivos.
- **API:** `window.AmbiFluid = { burst(color, x, y), stir(cantidad), setPalette(colores), setActive(bool) }`.
- Si el navegador no tiene WebGL2 o texturas de coma flotante, no se carga y la web queda con fondo negro.

### Contrato de marcado

`main.js` y `styles.css` dependen de estas clases y atributos. Si se rehace el HTML con otro sistema de plantillas, hay que mantenerlos:

- **Globales:**
  - `<canvas id="smoke">`.
  - `.site-header` y `.mobile-bar`.
  - `.fx-pill` y `.fx-toggle`.
  - `.hover-img`.
  - `window.AMBI_I18N` (textos del formulario y del interruptor) y `window.AMBI_INK` (paleta del humo).
- **Secciones:**
  - `.hero`, `.smoke`, `.scene-light` y `.scene-dark`.
  - `[data-manifesto]` con `.man-stage`, `.man-video` y `[data-words]`.
  - `[data-hscroll]` con `.h-track`, `.h-intro` y `.h-service`, que contiene `.h-num`, `figure` y `.h-body`.
  - `[data-marquee]`, `[data-paint]`, `[data-showcase]` con `.show-stage` y `.show-item`, `[data-steps]` y `[data-strip]`.
- **Animación:**
  - `[data-chars]`, `[data-lines]` y `[data-rise]`.
  - `[data-parallax]` y `[data-float]`.
  - `[data-magnetic]`, `[data-hover-img]` y `[data-tilt]`.
- **Formulario:** `#contact-form` con `data-to`, `.err` y `#form-status`. Valida, prepara un correo `mailto:` y no simula ningún envío.

## Diseño

- **Colores:**

  | Variable | Valor | Uso |
  |---|---|---|
  | `--green` | `#7fb746` | Verde del logo, acentos sobre negro |
  | `--lime` | `#cfe657` | Botón principal y números |
  | `--green-text` | `#466a0b` | Texto verde sobre claro, por contraste |
  | `--black` | `#000` | Fondo de cabecera y secciones oscuras |
  | `--grey` | `#eaeaea` | Secciones claras |
  | `--ink` y `--text` | `#363f4d` y `#333` | Títulos y texto sobre claro |

- **Tipografía:** Montserrat, títulos en mayúsculas con peso 200-300 e interletrado negativo.
  - El título de portada mide `calc(var(--content) / 9)`, donde `--content` es el ancho real del contenido, con un máximo de 1500 px. Así no se corta en pantallas anchas.
  - Los H1 interiores miden `calc(var(--content) * .068)`, o `/ 10` en móvil.
- **Medidas:** margen lateral `clamp(16px, 4vw, 56px)` y radio de 3 px. Cabecera de 76 px (64 en móvil).
- **Ritmo:** se alternan escenas negras con humo y escenas grises claras, con transiciones de 0,3 a 0,9 s y curva `cubic-bezier(.16, 1, .3, 1)`.
- **Móvil, por debajo de 1100 px:**
  - Menú a pantalla completa.
  - Barra fija inferior con Trucar, Correu y Botiga.
  - Cabecera opaca.
  - Todo lo táctil mide al menos 44 px.
- **Móvil, por debajo de 900 px:** las tarjetas de servicios se apilan con el número debajo de la imagen.
- **Móvil, por debajo de 860 px:** las imágenes con fondo negro se funden con el humo mediante una máscara de degradado.

## Imágenes

- **Fotos de estudio** (`s-ambiwick`, `s-turbo`, `s-homespray`, `s-mikado`):
  - Creadas con Dania (`edit_image_gpt2`, proporción 3:4, 2K) a partir de la foto real de cada producto en ambinature.ad.
  - Exportadas a WebP de 1000 × 1333.
  - Prompt base, adaptado a cada producto:

  > Professional commercial studio photograph of this exact product. Keep the product 100% identical to the reference: same shape, proportions, colors, and every label, logo and text exactly as in the reference, sharp and unaltered. Do not add, invent or change any text. Do not add other products. Scene: the product stands on a dark polished black surface with a subtle soft reflection, in a dark studio with deep black background. Soft rim light from the left and right sculpting the edges, realistic contact shadow. Thin, delicate wisps of real smoke rise softly behind the product, tinted very subtly in natural green (#7FB746). Product centered, occupying about 60% of the frame height, generous dark empty space around it. Photorealistic, high-end fragrance advertising, shallow depth of field, no people, no typography added.

  Para cada producto se añadió una descripción del objeto y se ajustó el tamaño en el encuadre: 40 % para el difusor, 55 % para el Home Spray y 60 % para el resto.

  Son recreaciones con IA y están pendientes de aprobación por la clienta.
- **Fotos `p-*`:** fotos de catálogo de la tienda, sin recortar.
- **Fotos `a-*`:** ambiente de la marca, como tinta, humo y bodegón.
- **Vídeo del manifiesto:** bucle de tinta derivado del material de la marca. Úsalo solo para este proyecto.

## SEO y buscadores de IA

El detalle está en [seo-y-publicacion.md](seo-y-publicacion.md). En resumen:

- Título, descripción y H1 únicos por página, con "Andorra" y el servicio, y URL limpias en catalán.
- Datos estructurados JSON-LD: Organization, WebSite, WebPage, AboutPage, ContactPage, Service, FAQPage y BreadcrumbList. Se generan desde los mismos textos que se ven.
- **Sin dirección** en los datos estructurados hasta resolver si el domicilio está en Encamp o en Andorra la Vella.
- Preguntas frecuentes visibles en la portada y en los servicios. Ficha de datos de la empresa en "Nosaltres".
- En producción:
  - `robots.txt` que permite de forma explícita los bots de búsqueda y de IA.
  - `sitemap.xml` con `lastmod`.
  - `llms.txt` y canónicas.
  - `hreflang` si se publica también en español.
- La vista previa lleva `noindex` y `Disallow`. **No se indexa hasta que la clienta dé el visto bueno y exista el dominio.**

## Rendimiento

- **Lighthouse móvil, última medición:** rendimiento, accesibilidad y buenas prácticas 100; LCP 1,5 s, CLS 0 y TBT 0 ms. El SEO baja solo por el `noindex` intencionado.
- **Scroll en móvil simulado:** 1.365 fotogramas a 17 ms, ninguno por encima de 25 ms.
- **Técnicas:**
  - El humo se carga tarde, salta fotogramas al hacer scroll y se para fuera de vista.
  - El vídeo se carga solo al llegar a su escena.
  - La imagen de portada y la fuente se precargan.
  - Las imágenes se cargan con `loading="lazy"` y llevan su tamaño declarado.
- **Prohibido, porque causó tirones:** `backdrop-filter`, `filter` sobre vídeo o imágenes grandes y `mix-blend-mode` sobre el canvas.
- **Caché en Vercel:**
  - HTML y CSS/JS se revalidan siempre, y CSS/JS cambian de URL con cada versión (`?v=`).
  - Imágenes, fuentes y vídeo se guardan 7 días.
  - Un primer despliegue guardó el CSS una semana y un móvil siguió viendo la versión antigua. Por eso existe `VER`.

## Accesibilidad

- Por decisión del cliente, los efectos no se apagan con "reducir movimiento". El visitante puede desactivarlos con el botón del pie.
- Los textos partidos en letras conservan `aria-label` con la frase completa.
- Enlace para saltar al contenido, foco visible, pestañas accesibles en la pirámide y menú con `aria-expanded`.
- Contraste mínimo de 4,5:1. Por eso existe `#466a0b` para el verde sobre gris.

## Pruebas

Las pruebas de navegador usan `puppeteer-core` con el Chrome instalado (ruta de Windows escrita en cada script). Instala `puppeteer-core` en una carpeta aparte y ejecútalas con `NODE_PATH` apuntando a su `node_modules`.

| Script | Qué comprueba |
|---|---|
| `tools/check.mjs` | Enlaces rotos, un H1 por página, títulos y descripciones (longitud y duplicados), `alt` y tamaño de imágenes, comillas angulares, precios y datos prohibidos |
| `tools/mobile-audit.cjs` | 16 páginas en 7 tamaños, de 320 px a tableta y móvil en horizontal: desbordes horizontales, texto cortado, letra de menos de 12 px y elementos táctiles pequeños |
| `tools/jank-test.cjs` | Fotogramas lentos al hacer scroll en escritorio |
| `tools/title-test.cjs` | Títulos que se cortan, de 360 a 2560 px |
| `tools/visual-test.cjs`, `tools/gpu-test.cjs` | Capturas y comportamiento del humo |

Lighthouse:

```bash
npx lighthouse@12 https://ambinature-andorra.vercel.app/ca/ --only-categories=performance,accessibility,best-practices,seo
```

**Método de revisión visual en móvil:** capturas de cada página a 390 × 844 cada 82 % de pantalla, unidas de cuatro en cuatro, más capturas de las tarjetas a mitad de transición. Así salieron los números cortados, los rectángulos sobre el humo y los títulos que se salían.

## Reglas de contenido

Vienen del encargo y del briefing de la clienta:

- Contacto comercial: `comercial@ambinature.ad` y `+376 354151`. No usar 354 131 ni `admin@`.
- Sin botón de WhatsApp hasta confirmar el número.
- No es una tienda: no hay precios y la compra se hace en ambinature.ad.
- No inventar testimonios, clientes, certificaciones, cifras ni garantías, ni presentar como hechos afirmaciones de salud o sostenibilidad.
- Idioma principal: catalán. El español está en la vista previa, pendiente de decisión.
- No usar nunca comillas angulares; usar comillas normales.

## Cómo pasarlo a los raíles de Dania

No conozco los raíles de Dania por dentro, así que esto es una propuesta para quien los conoce:

1. **Reutilizar sin tocar** `src/static/` (CSS, `main.js`, `fluid.js`, librerías, fuente, imágenes y vídeo). Es independiente del generador.
2. **Rehacer las páginas** con la composición de Dania, manteniendo el HTML de cada bloque y el contrato de marcado de esta guía. La forma más rápida es copiar el HTML de `site/` tras ejecutar `node src/build.mjs`.
3. **Llevar los textos** de `content.ca.mjs`, `content.es.mjs` y `content.fx.mjs` al sistema de contenido de Dania. `content.fx.mjs` va por encima de los otros dos y contiene lo último del briefing.
4. **Sustituir el SEO de `build.mjs`** por el de Dania si es más completo, sin perder:
   - Las preguntas frecuentes visibles con su `FAQPage`.
   - El `noindex` hasta tener dominio.
   - La ausencia de dirección hasta confirmarla.
5. **Comprobar al final** con `tools/check.mjs`, `tools/mobile-audit.cjs` y Lighthouse, y revisar en un iPhone real. Las pruebas automáticas solo simulan móviles con Chrome.
