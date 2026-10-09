# KROMA — sitio web

Sitio multipágina de KROMA, consultora tecnológica para empresas uruguayas.
HTML, CSS y JavaScript sin dependencias ni paso de compilación: se publica tal cual en Vercel.

## Publicar (GitHub + Vercel)

1. **Crear el repositorio en GitHub**
   - Entrá a github.com → botón **New** → nombre `kroma-web` → **Create repository**.
   - En la página del repo vacío, hacé clic en **uploading an existing file**.
   - Arrastrá **todo el contenido** de esta carpeta (no la carpeta en sí, sino lo que hay adentro: `index.html`, `assets`, `servicios`, `vercel.json`, etc.).
   - Abajo, **Commit changes**.
2. **Conectar con Vercel**
   - Entrá a vercel.com → **Add New… → Project** → elegí el repo `kroma-web` → **Import**.
   - *Framework Preset*: **Other**. No hace falta tocar nada más (sin Build Command, sin Output Directory).
   - **Deploy**. En un minuto tenés la URL pública.
3. **Revisá la dirección pública**: Vercel te da una dirección tipo `kroma-web.vercel.app`. Si es distinta (o conectás un dominio propio en **Settings → Domains**), abrí `scripts/build.mjs`, cambiá `SITE_URL` en la línea de arriba y regenerá (ver "Editar textos"). Eso hace que la vista previa al compartir el link en WhatsApp o redes muestre la imagen correcta.

Cada vez que subas cambios al repo, Vercel vuelve a publicar solo.

## Formulario de contacto

El formulario envía los mensajes a **somoskroma@gmail.com** mediante FormSubmit (formsubmit.co), sin servidor propio.

**Paso único de activación:** después de publicar, completá el formulario una vez desde el sitio. FormSubmit manda un email de activación a somoskroma@gmail.com; hacé clic en **Activate Form**. Desde ese momento, cada consulta llega a esa casilla.

Mientras no esté activado, el sitio muestra un aviso honesto ("pendiente de activación") y sugiere escribir por email o Instagram: nunca simula un envío exitoso.

## Datos incluidos

- Email: somoskroma@gmail.com (footer, menú móvil y página de contacto)
- Instagram: @_kromalabs → https://www.instagram.com/_kromalabs/
- Isotipo oficial vectorizado desde el archivo provisto (`assets/img/kroma-isotipo.svg`)
- Fotografías arquitectónicas provistas, en blanco y negro y optimizadas (`assets/img/arq-*.jpg/.webp`)

## Pendientes para revisión

| Pendiente | Dónde |
|---|---|
| **Activar el formulario** (ver arriba). | somoskroma@gmail.com |
| **Confirmar la dirección pública** (`SITE_URL`) para la vista previa al compartir el link. | `scripts/build.mjs` |
| **Proyectos**: los cuatro casos son **conceptos** y están marcados como tales. Reemplazarlos por casos reales cuando existan; el campo "Resultado" solo debe completarse con datos documentados. | `scripts/build.mjs` → `PROJECTS` |
| **Isotipo**: el SVG se vectorizó desde una imagen. Si tenés el archivo vectorial original (.svg/.ai), conviene reemplazarlo para máxima precisión. | `assets/img/kroma-isotipo.svg` |

## Editar textos y páginas

Todas las páginas se generan desde `scripts/build.mjs` (textos, servicios, proyectos, menú y footer en un solo lugar).
Después de editarlo, regenerá los HTML desde la carpeta del proyecto:

```
node scripts/build.mjs .
```

(Requiere Node.js instalado. Si preferís, también podés editar directamente los `index.html`.)

## Estructura

```
/                         index.html
/nosotros                 nosotros/index.html
/servicios                servicios/index.html
/servicios/webs …         servicios/<servicio>/index.html  (4 páginas)
/proyectos                proyectos/index.html
/proyectos/<proyecto>     proyectos/<proyecto>/index.html  (4 conceptos)
/contacto                 contacto/index.html
404.html                  página de error
assets/css/main.css       sistema visual completo (tokens, componentes, estados de movimiento)
assets/js/main.js         motor de animaciones e interacciones (sin librerías)
assets/fonts/             Plus Jakarta Sans (variable) e IBM Plex Mono, alojadas localmente
vercel.json               URLs limpias y cabeceras
```

## Sistema de movimiento

- **Duraciones**: microinteracciones 160 ms · UI 280 ms · entradas 760 ms · cortina 420 ms · ambiente 14 s+.
- **Curvas**: `--ease-out` para entradas y respuestas, `--ease-in-out` para la cortina y el menú.
- **Ligadas al scroll** (un único motor rAF que solo procesa lo visible): curvas y parallax del hero, bandas orgánicas, avance de la tarea en Automatizaciones, ensamblado de piezas en Identidad digital, profundidad en Webs, parallax de imágenes de proyectos.
- **Una vez al entrar**: titulares por líneas con máscara, recortes, fundidos y subidas (distintos según el contenido).
- **Respuesta**: filas de servicios con relleno direccional y foto que se abre, botones, enlaces, FAQ, nodos de Integraciones, isotipo del hero que sigue levemente al puntero.
- **Ambiente (flotación)**: los bordes de la banda marfil y de la foto del hero ondulan lento, la foto deriva dentro de su recorte, el isotipo y el texto flotan unos píxeles; formas decorativas de Nosotros y Servicios flotan; señal que recorre el diagrama de Integraciones. Se pausa fuera de pantalla.
- **Rastro eléctrico**: solo en secciones negras (servicios y cierre del Inicio, lista de Servicios), con puntero fino; límite de 44 puntos y 5 ramificaciones, adaptado a la densidad de pantalla, pausado fuera de pantalla, sin interceptar clics.
- **Movimiento reducido**: sin rastro, parallax, ambiente ni cortina; todo el contenido visible y las demos en su estado final.
- **Sin JavaScript**: todo el contenido se muestra igual.
