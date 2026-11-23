# KROMA — sitio web

Sitio multipágina de KROMA, consultora tecnológica para empresas uruguayas.
HTML, CSS y JavaScript estáticos, sin paso de compilación en Vercel. Movimiento con GSAP y la forma 3D con Three.js (ambos alojados en el propio sitio).

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

El formulario envía los mensajes a **somoskromauy@gmail.com** mediante FormSubmit (formsubmit.co), sin servidor propio.

**Paso único de activación:** después de publicar, completá el formulario una vez desde el sitio. FormSubmit manda un email de activación a somoskromauy@gmail.com; hacé clic en **Activate Form**. Desde ese momento, cada consulta llega a esa casilla.

Mientras no esté activado, el sitio muestra un aviso honesto ("pendiente de activación") y sugiere escribir por email o Instagram: nunca simula un envío exitoso.

## Datos incluidos

- Email: somoskromauy@gmail.com (pie, menú y página de contacto)
- Instagram: @_kromalabs → https://www.instagram.com/_kromalabs/
- Isotipo oficial (`assets/img/kroma-isotipo.svg`)

## Pendientes para revisión

| Pendiente | Dónde |
|---|---|
| **Activar el formulario** (ver arriba). | somoskromauy@gmail.com |
| **Dominio propio**: cuando exista, cambiar `SITE_URL` y regenerar. | `scripts/build.mjs` |
| **Proyectos**: los cuatro casos son **conceptos** y están marcados como tales. Reemplazarlos por casos reales cuando existan; "Resultado" solo con datos documentados. | `scripts/build.mjs` → `PROJECTS` |

## Editar textos y páginas

Todas las páginas se generan desde `scripts/build.mjs` (textos, servicios, proyectos, menú y pie en un solo lugar):

```
node scripts/build.mjs .
```

## Estructura

```
/                         index.html  (seis capítulos: forma, criterio, servicios, proyectos, proceso, contacto)
/nosotros                 nosotros/index.html
/servicios                servicios/index.html
/servicios/<servicio>     servicios/<servicio>/index.html  (5 páginas)
/proyectos                proyectos/index.html
/proyectos/<proyecto>     proyectos/<proyecto>/index.html  (4 conceptos)
/contacto                 contacto/index.html
404.html                  página de error
assets/css/site.css       sistema visual "Digital Matter" con la paleta KROMA (negro, cobalto, marfil)
assets/js/site.js         movimiento e interacciones de todo el sitio (GSAP + ScrollTrigger + SplitText)
assets/js/home.js         escena del inicio: KROMA FORM y transformación ligada al scroll
assets/js/kform.js        geometría, material y luz de KROMA FORM (Three.js)
assets/js/vendor/         GSAP 3.13 y Three.js, alojados localmente
assets/img/form/          imágenes de KROMA FORM para cada página
assets/fonts/             Host Grotesk e IBM Plex Mono, alojadas localmente
scripts/art.mjs           ilustraciones de los proyectos conceptuales
vercel.json               URLs limpias y cabeceras
```

## Sistema de movimiento

- **Inicio**: la forma aparece con la luz, el titular sale por líneas y la forma responde levemente al puntero. Al bajar, la escena queda fija un tramo: la cámara entra al pliegue, la banda se abre, se parte en tres, se ordena y termina en paneles de interfaz junto a "Tecnología con criterio". Todo es reversible y no secuestra la rueda.
- **Rendimiento**: Three.js se descarga recién con la primera interacción; hasta entonces se ve una imagen idéntica de la forma.
- **Una vez al entrar**: titulares por líneas con máscara, recortes en proyectos, capas del proceso que se dibujan.
- **Respuesta**: filas de servicios con relleno cobalto direccional y vista previa de la forma, botones con flecha que se reemplaza, FAQ, filtros, nodos de Integraciones.
- **Demos por servicio**: profundidad en Webs, tarea que avanza en Automatizaciones, señal entre herramientas en Integraciones, piezas que se ordenan en Identidad digital y recomendación según prioridades en Consultoría.
- **Transición entre páginas**: cortina curva cobalto con el isotipo (la misma de la versión anterior).
- **Movimiento reducido o sin JavaScript**: todo el contenido visible, sin escena fijada ni cortina.
