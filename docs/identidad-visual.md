# Identidad visual de AmbiNature Andorra

Revisión del 5 de noviembre de 2026. Referencia principal: ambinature.ad. Apoyo: ambinature.com.

## Logotipo

| Versión | Origen | Uso |
|---|---|---|
| Horizontal, "AMBI" verde + "NATURE" blanco, SVG original (CorelDRAW) | ambinature.com, `ambinature_logo-2.svg` | Esta web, sin modificar. Copia: `src/static/img/logo-ambinature.svg` |
| Horizontal, PNG 295×77 sobre negro | ambinature.ad, `ambinature_logo_n.png` | Es la versión publicada en Andorra. Baja resolución para pantallas densas |
| Apilada sobre círculo negro | Perfil de Instagram | No disponible como archivo |
| Apilada, negro y verde | ambinature.mx | México. No se usa |

**A confirmar:** que el SVG de España sea el maestro válido también para Andorra. Visualmente coincide con el PNG andorrano.

## Colores

| Código | Dónde se ha observado | Uso en la web |
|---|---|---|
| `#7FB746` | Relleno del logotipo (SVG) | Acentos sobre negro |
| `#000000` | Cabecera y pie de Andorra y España, fondo de producto | Cabecera, secciones oscuras |
| `#363F4D` | Títulos en ambinature.ad | Títulos sobre claro |
| `#333333` | Texto en ambinature.ad | Texto |
| `#EAEAEA` | Fondo de ambinature.com; Andorra es visualmente equivalente | Secciones claras |
| `#CFE657` | Botones en ambinature.com | Botón principal, llamada final |
| `#56800F` | Títulos verdes en ambinature.com | Base de `#466A0B` |
| `#466A0B` | Derivado de `#56800F`, **no es un color publicado** | Enlaces y etiquetas sobre claro, para superar 4,5:1 sobre `#EAEAEA` |

Descartados por ser restos de plantilla, no marca: `#FA5A06`, `#4FC1F0`, `#EB3B60`. También `#64B243`, que solo aparece como parámetro de fondo en miniaturas de categoría, y `#87BD25`, presente en el CSS sin un uso de marca claro.

## Tipografía

Montserrat en Andorra y España (títulos en mayúsculas). La web la aloja en local, en versión variable y solo con el subconjunto latino, para no depender de Google Fonts ni enviarle datos del visitante.

## Fotografía y producto

- Tinta y humo de colores sobre negro: el vídeo `presentacion_ambinature_web.mp4` de Andorra y las imágenes del blog.
- Productos recortados sobre negro en la tienda. Las garrafas de limpieza están sobre blanco y aquí se respeta.
- Bodegón de gama sobre blanco.
- Parte de las imágenes de blog tienen aspecto de ilustración generada. Son de la marca y se han usado solo como ambiente, nunca como instalaciones o clientes.

## Componentes e interacción observados

| Observado | Fuente | En esta web |
|---|---|---|
| Cabecera negra fija | Andorra, España | Igual, con acceso persistente a la tienda |
| Transiciones de 0,3 s en enlaces y botones | CSS de Andorra | Igual |
| Apariciones al desplazarse (WOW + animate.css) | Andorra | IntersectionObserver propio, sin librerías; el contenido no se oculta sin JavaScript |
| Parallax en cabecera | España | No se aplica: se prioriza legibilidad y rendimiento |
| Vídeo a pantalla completa en portada | Andorra (con sonido de pista y 12,6 MB) | Bucle de 14 s sin sonido, menos de 600 KB, cargado tras la página |
| Botones rectos, de 0 a 3 px de radio | Andorra (0), España (3) | 3 px |
| Botón redondo de volver arriba | Andorra | Igual, oculto en móvil porque ya está la barra de contacto |
| Texto alterno con imagen | Andorra | Igual, con mejor jerarquía |

## Tono

Evocador y directo, con el lema "Fabricantes de sensaciones, nuestro lenguaje es el aroma" (Andorra lo usa en catalán y español). Se conserva como lema. Se evita el tono de superlativos ("líder", "inigualable"), porque no se puede demostrar.

## Relación entre webs

- **Andorra:** tienda propia en un CMS de KMK, en catalán y español, y parte de los textos heredados de España.
- **España:** web y tienda en WordPress, la más desarrollada y con su propio verde lima en botones.
- **México:** página de mantenimiento con formulario de aviso y redes de España.

## Versión 2: qué cambia y qué se mantiene

**Se mantiene:** logotipo original, colores de marca, Montserrat, fondo negro, productos e imágenes reales, lema.

**Cambia:** composición y movimiento, con un concepto propio: hacer visible lo invisible.

| Efecto | Dónde |
|---|---|
| Simulación de humo en WebGL2, reacciona al cursor, al dedo y al scroll | Fondo de las zonas oscuras |
| Vídeo de la marca que se abre al bajar, con el manifiesto encendiéndose palabra a palabra | Inicio |
| Servicios en scroll horizontal (móvil: cartas apiladas) | Inicio |
| Aromas reales que estallan en color al pulsarlos | Inicio |
| Colección de productos en anillo 3D guiado por el scroll | Inicio |
| Cinta de aromas que se acelera e inclina con el scroll | Inicio y aromatización |
| Productos flotantes con parallax, botones magnéticos, imagen que sigue al cursor, inclinación 3D | Varias páginas |
| Transición de tinta entre páginas | Chrome, Edge y Safari recientes |

**Accesibilidad:** por decisión del cliente, los efectos se muestran también con "reducir movimiento". El pie permite desactivarlos. Todo el texto está en el HTML y la web funciona sin JavaScript.

**Librerías locales:** GSAP y ScrollTrigger 3.13, Lenis 1.3. La versión anterior está en `versiones/v1/`.
