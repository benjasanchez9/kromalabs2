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

## Movimiento (GSAP 3 + ScrollTrigger + SplitText; Flip solo en Proyectos)
Todo se coordina en `assets/js/site.js`. Hay cuatro tipos de movimiento, cada uno con un rol distinto:
- **Ligado al scroll:**
  - la sección fijada "De la versión 1 a la 2": las herramientas sueltas se ordenan, se conectan al isotipo y terminan en el negocio v2;
  - el parallax del hero, el panel que se aleja en profundidad, las líneas de la declaración, la máscara orgánica de la foto en Nosotros y las ilustraciones dentro de su marco;
  - la barra de progreso de lectura.
- **Una vez al entrar:**
  - titulares por líneas con máscara;
  - divisiones que se dibujan y listas que suben;
  - tarjetas que aparecen recortadas;
  - contadores de métricas;
  - la marca grande del pie;
  - las demos de servicio, que se presentan solas una vez.
- **Respuesta a la persona:**
  - la retícula del hero sigue al puntero;
  - la vista previa de cada servicio sigue al cursor;
  - botones magnéticos;
  - preguntas que abren con altura animada;
  - el filtro de proyectos reacomoda con Flip;
  - las demos interactivas.
- **Transición entre páginas:** cortina curva azul con el isotipo. Respeta pestañas nuevas, el botón atrás y los enlaces con modificador.

Curvas:
- entradas con `power3/power4.out`;
- cambios de estado con `power2.inOut`.

Duraciones:
- microinteracciones: 0,16–0,25 s;
- entradas: 0,6–1 s;
- transición: 0,5 s.

Reglas:
- **Sin bloquear el scroll:** sin snap ni smooth scroll artificial.
- **Celular:** sin sección fijada ni respuesta al puntero.
- **Movimiento reducido o sin JavaScript:** todo queda visible en su estado final.
- **Contenido accesible:** el que espera su animación usa transparencia, no `visibility`, para que siga disponible para lectores de pantalla.

## Imagen
- Interfaces y piezas reales dibujadas en SVG: lo que KROMA entrega.
- La fotografía de arquitectura en B/N queda solo como acento de marca: Nosotros y la imagen para compartir.

## Prueba (sin inventar)
- **Métricas reales del propio sitio:** Lighthouse, peso y tiempo de carga, medidos y fechados.
- **Proyectos:** siguen marcados como conceptos.
