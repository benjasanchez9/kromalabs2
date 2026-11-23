# KROMA · Sistema de diseño (rediseño noviembre 2026)

Hecho con dos skills: **frontend-design** (dirección, tipografía, restricción) y **UI/UX Pro Max** (patrón de conversión "Confianza y autoridad", reglas de accesibilidad, interacción y formularios).

## Tema, público y tarea
- **Tema:** una consultora tecnológica uruguaya que elige, construye y conecta tecnología para pymes, y que además hace webs.
- **Público:** dueños y gerentes de empresas chicas y medianas. No son técnicos. Buscan claridad, criterio y alguien confiable.
- **Tarea del sitio:** demostrar oficio con el propio sitio y llevar a una primera conversación.

## Concepto: "Tu negocio. Su próxima versión."
"Versión" es un concepto del software. El sitio lo toma literal: el hero muestra la actualización de un negocio de v1 a v2, con notas de versión y cambios que se aplican.
Es el único momento audaz del sitio. Todo lo demás es sobrio, preciso y legible.

## Color (marca)
| Token | Hex | Uso |
| --- | --- | --- |
| `--ink` | #070708 | Texto, fondos de contraste, pie |
| `--paper` | #f5f1e8 | Fondo de lectura (marfil de marca) |
| `--surface` | #ffffff | Superficies de producto: paneles, formularios, interfaces |
| `--cobalt` | #0053fd | Acciones, enlaces, estados activos. Solo para lo accionable o lo seleccionado |
| `--cobalt-deep` | #0041c9 | Hover y presión |
| `--line` | #dcd6c8 | Divisiones de 1 px |
| `--muted` | #57534a | Texto secundario (contraste 7:1 sobre marfil) |

## Tipografía
- Una sola familia: **Schibsted Grotesk** (variable, de 400 a 900). Es firme y técnica en los titulares y legible en el texto corrido.
- **Escala:**
  - H1: 44–92 px, peso 800, interletra −0,035 em.
  - H2: 32–48 px, peso 800.
  - H3: 22 px, peso 650.
  - Lead: 20 px.
  - Cuerpo: 17 px con interlínea 1,55.
  - Chico: 14 px.
- **Números:** cifras tabulares en datos y versiones.
- **No se usa:** mayúsculas en etiquetas, etiquetas sobre títulos, monoespaciada ni palabras destacadas en color.

## Layout
- Contenedor de 1240 px y grilla de 12 columnas, alineada a la izquierda.
- Secciones asimétricas: el título ocupa las columnas 1–5 y el contenido las columnas 6–12.
- Divisiones de 1 px como estructura.
- **Radios:**
  - 6 px en botones y campos;
  - 12 px en superficies de producto;
  - nada en las secciones.
- **Sombras:** solo en los paneles de producto, y sutiles.
- **Numeración:** solo donde hay secuencia real o lo pide el brief (servicios 01–05 y proceso).

## Movimiento
- **Un solo momento orquestado:** la actualización del hero, de unos 1,6 s.
- **Respuestas:** a hover, foco y clic, de 150–250 ms.
- **Demos de servicio:** se mueven solo cuando la persona actúa.
- **Transición entre páginas:** View Transitions nativas con una máscara curva corta. Conserva URLs, botón atrás y pestañas nuevas.
- **Movimiento reducido:** se muestra el estado final y no hay transiciones.
- **Lo que se quitó:** rastro eléctrico, formas flotantes, olas y entradas al hacer scroll.

## Imagen
- Interfaces y piezas reales dibujadas en SVG: lo que KROMA entrega.
- La fotografía de arquitectura en B/N queda solo como acento de marca: Nosotros y la imagen para compartir.

## Prueba (sin inventar)
- **Métricas reales del propio sitio:** Lighthouse, peso y tiempo de carga, medidos y fechados.
- **Proyectos:** siguen marcados como conceptos.
