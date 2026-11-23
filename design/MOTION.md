# MOTION.md — KROMA

Leer antes de diseñar o animar cualquier pieza de KROMA (sitio, redes, video).
El archivo fija el aspecto, no la ambición.

## 1. Color
| Rol | Hex | Uso |
|---|---|---|
| Negro | #070708 | Fondo principal, escena de la forma, cierres |
| Marfil | #f5f1e8 | Texto sobre negro y cobalto; fondo de lectura |
| Cobalto | #0053fd | Acción (botones), campos de color plenos, luz de la forma |
| Cobalto profundo | #0041c9 | Hover de botones cobalto |
| Glow | #4d8bff | Detalles chicos sobre negro (señales, estados listos, foco) |
| Piedra | #6b675e | Texto secundario sobre marfil |

Cobalto nunca como texto chico sobre negro (3,5:1). Sobre cobalto, todo el texto en marfil pleno (sin transparencia).

## 2. Tipografía
- Host Grotesk 540 para titulares, en mayúsculas, interlineado 0,88–0,92, interletrado −4,5 % a −5 %.
- Host Grotesk 400–560 para texto (16–21 px, interlineado 1,4–1,55).
- IBM Plex Mono 12 px en mayúsculas solo para índices de capítulo del inicio, rutas y metadatos. Nunca como etiqueta encima de cada título.

## 3. Tiempos
| Tipo | Duración | Curva |
|---|---|---|
| Respuesta (hover, foco, presión) | 0,22 s | cubic-bezier(.16,1,.3,1) |
| Cambio de estado (fila, menú, desplegable) | 0,45 s entrada · 0,38 s salida | expo.out / in-out |
| Entrada de titulares (una vez) | 0,9 s, desfase 0,08 s por línea | expo.out |
| Recorte de imágenes de proyecto | 1,1 s | expo.out |
| Cortina entre páginas | 0,42 s entra · 0,56 s sale | cubic-bezier(.66,0,.34,1) |
| Escena del inicio | ligada al scroll, scrub 0,6 s | sin curva propia |

La salida siempre es más corta que la entrada.

## 4. Movimiento
- Un solo gran momento por página: en el inicio, la forma que se abre, se ordena y se vuelve interfaz. Es un objeto que cambia de forma, no un fundido entre imágenes.
- Titulares por líneas con máscara solo en la cabecera, en los momentos clave del inicio y en el cierre. Las secciones de lectura (qué incluye, ejemplos, preguntas) quedan quietas.
- Desfase de un pulso entre elementos hermanos; nunca todo a la vez.
- Parallax de baja amplitud (±3–8 %) solo en imágenes dentro de contenedores fijos.
- La forma reacciona al puntero con un máximo de 4°, con retardo.

## 5. Terminación
Cromo pulido con reflejos fríos y luz cobalto localizada. Sin desenfoques decorativos, sin sombras grises genéricas, sin degradados azul-violeta.

## 6. Nunca
1. Animar la misma entrada en cada sección.
2. Secuestrar la rueda o el scroll (sin smooth scroll artificial).
3. Deformar el isotipo: solo se mueve en posición y escala.
4. Dejar información esencial dependiendo de una animación.
5. Mostrar movimiento con `prefers-reduced-motion` activo.

## 7. Ejemplo correcto (inicio, escritorio)
1. Negro. La forma aparece con su luz; el titular sale por líneas desde una máscara (0,6–1,6 s).
2. Bajada y botón "Hablemos" suben 14 px (1,25 s). La forma sigue al puntero apenas.
3. Al bajar: el titular retrocede, la cámara entra al pliegue de la banda.
4. La banda se abre, se parte en sus tres lóbulos y se alinea; el fondo se inunda de cobalto.
5. Las piezas se vuelven ventana, tarjeta y control marfil; aparece "Tecnología con criterio". Fin del tramo fijado.
