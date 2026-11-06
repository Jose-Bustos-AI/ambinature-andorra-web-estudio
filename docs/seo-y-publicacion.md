# SEO, buscadores de IA y publicación

Actualizado el 5 de noviembre de 2026.

## Dónde está

- Código: este repositorio, rama `main`.
- Vista previa: https://ambinature-andorra.vercel.app.
- **La vista previa no se indexa** (`noindex` y `robots.txt` con `Disallow`). Es intencionado: no hay dominio definitivo.

## Pasar a producción

Cuando el dominio esté decidido:

1. Añadir el dominio al proyecto de Vercel y configurar el DNS.
2. Añadir en Vercel la variable `SITE_URL=https://dominio` solo para el entorno Production. Para publicar también en español: `WITH_ES=1`.
3. Volver a desplegar. El generador activa canónicas, `sitemap.xml`, `llms.txt`, el `robots.txt` abierto y los datos estructurados completos.
4. Redirigir `ambinature-andorra.vercel.app` al dominio definitivo.
5. Dar de alta el dominio en Google Search Console y Bing Webmaster Tools y enviar el sitemap.
6. Comprobar los datos estructurados con la prueba de resultados enriquecidos de Google.

Al cambiar textos, actualizar `LAST_UPDATED` en `src/build.mjs`.

## Qué tiene la web

- HTML estático con todo el texto: los rastreadores de IA que no ejecutan JavaScript lo leen entero.
- Título, descripción y H1 propios en cada página, URL limpias y enlazado interno.
- Datos estructurados: Organization, WebSite, WebPage, AboutPage, ContactPage, Service, FAQPage y BreadcrumbList. Se generan desde los mismos textos que se ven.
- Preguntas frecuentes en portada y servicios. Ficha de datos de la empresa en "Nosotros".
- `robots.txt` que permite de forma explícita los bots de búsqueda y de IA.
- Imágenes con texto alternativo y tamaño declarado.

## Decisiones sobre bots de IA

El `robots.txt` de producción permite también los bots que recogen datos de entrenamiento (`GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`). Si el cliente no lo quiere, se pueden bloquear sin afectar a los de búsqueda (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`).

Según las reseñas de su guía de mayo de 2026, Google no necesita `llms.txt` ni marcado especial para sus funciones de IA. Se incluye `llms.txt` porque cuesta poco y otros asistentes pueden leerlo, sin esperar de él una mejora demostrada. La palanca real son los fundamentos de SEO y la información propia y verificable.

## Lo que falta y no depende del código

Por orden de impacto:

1. **Dominio definitivo.** Sin él no se puede indexar. Propuesta: `serveis.ambinature.ad`.
2. **Ficha de Google Business** con dirección verificada. Es lo que más pesa en búsquedas locales y exige resolver antes el domicilio (Encamp o Andorra la Vella). Con la dirección confirmada se añade `LocalBusiness` y la dirección completa.
3. **Enlaces desde ambinature.ad** y resolver el solape con `menu-8` y `menu-15`.
4. **Español.** Decidir si se publica `/es/`. El briefing pide catalán, pero sin español la web no compite en búsquedas en castellano.
5. **Menciones externas**: directorios y prensa de Andorra, redes con el mismo nombre, teléfono y dominio.
6. **Reseñas reales** en la ficha de Google. En la web no se inventan.
7. **Contenido propio**: casos reales, fotos de instalaciones y artículos. Es lo que diferencia la web para Google y para los asistentes de IA.
8. **Estudio de palabras clave** con datos de volumen. Los términos actuales se han elegido por criterio, sin datos de volumen.
9. **Revisión del catalán** por una persona nativa, incluidas las preguntas añadidas.
