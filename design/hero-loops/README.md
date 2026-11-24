# Loops de los heros (motion graphics)

Seis escenas Three.js de 8 s que explican cada servicio con el cromo de la forma KROMA,
piezas marfil y cobalto. Cada escena es una función del tiempo (`window.seek(t)`), así
el loop cierra exacto.

| Página | Qué muestra |
|---|---|
| Webs | Ventana y teléfono con la página desplazándose; un cursor hace clic en el botón |
| Automatizaciones | Una tarea recorre un riel de cromo y marca cuatro etapas |
| Integraciones | Tres herramientas sobre la cinta KROMA; una señal las recorre y las enciende |
| Identidad digital | Piezas de marca que se ordenan en un sistema alrededor de la forma |
| Consultoría | Opciones dispersas que se ordenan; una se elige |
| Nosotros | Una banda de cromo que avanza sobre el marfil |

## Volver a renderizar

1. Copiar `three.module.min.js` y las fuentes de `assets/` a esta carpeta y servirla
   (`python3 -m http.server 5300`).
2. `python3 render.py <escena> <inicio> 30` (inicio = segundo que se ve primero;
   Automatizaciones usa 6.0 para empezar con las cuatro etapas marcadas).
3. Codificar:
   `ffmpeg -framerate 30 -i frames/<escena>/f%04d.png -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" -c:v libx264 -preset veryfast -crf 21 -movflags +faststart -an <escena>.mp4`
4. Póster: el primer cuadro en WebP.

Las escenas de páginas negras se renderizan sobre negro puro y se mezclan en modo
`screen`, para que el brillo azul del hero pase por detrás sin recuadro.
