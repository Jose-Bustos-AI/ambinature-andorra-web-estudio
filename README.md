# Web corporativa de AmbiNature Andorra

Web estática, sin dependencias, en catalán y español. La compra sigue en ambinature.ad.

```
src/content.ca.mjs, content.es.mjs   textos
src/build.mjs                        plantillas y generador
src/static/                          CSS, JS, imágenes, vídeo y fuente
site/                                vista previa generada (noindex)
tools/serve.mjs, check.mjs           servidor local y comprobaciones
docs/                                identidad visual, SEO y guía para reproducir la web
```

## Uso

Vista previa (bloquea la indexación y no genera canónicas):

```bash
node src/build.mjs
```

```bash
node tools/serve.mjs site 4173
```

Comprobar enlaces, H1, metadatos, imágenes y datos prohibidos:

```bash
node tools/check.mjs site
```

Producción, solo con el dominio definitivo confirmado. Genera `dist/` con canónicas, hreflang, sitemap y robots:

```bash
SITE_URL=https://dominio-definitivo node src/build.mjs dist
```

Sube el contenido de `dist/` a la raíz del dominio.

## Documentación

- Cómo está hecha y cómo reproducirla: [docs/guia-para-el-estudio.md](docs/guia-para-el-estudio.md).
- SEO y pasos para publicar con dominio: [docs/seo-y-publicacion.md](docs/seo-y-publicacion.md).
