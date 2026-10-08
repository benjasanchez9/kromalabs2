# KROMA — sitio web

Sitio multipágina de KROMA, consultora tecnológica para empresas uruguayas.
HTML, CSS y JavaScript sin dependencias ni paso de compilación: se publica tal cual en Vercel.

## Publicar (GitHub + Vercel)

1. **Crear el repositorio en GitHub**
   - Entrá a github.com → botón **New** → nombre `kroma-web` → **Create repository**.
   - En la página del repo vacío, hacé clic en **uploading an existing file**.
   - Arrastrá **todo el contenido** de esta carpeta (no la carpeta en sí, sino lo que hay adentro: `index.html`, `assets`, `api`, `servicios`, etc.).
   - Abajo, **Commit changes**.
2. **Conectar con Vercel**
   - Entrá a vercel.com → **Add New… → Project** → elegí el repo `kroma-web` → **Import**.
   - *Framework Preset*: **Other**. No hace falta tocar nada más (sin Build Command, sin Output Directory).
   - **Deploy**. En un minuto tenés la URL pública.
3. **Dominio propio** (opcional): Vercel → proyecto → **Settings → Domains**.

Cada vez que subas cambios al repo, Vercel vuelve a publicar solo.

## Formulario de contacto (pendiente de configurar)

El formulario envía a `/api/contact` (función de Vercel incluida en `api/contact.js`), que manda el mensaje por email usando **Resend**.
Mientras no esté configurado, el sitio muestra un **error honesto** ("el formulario todavía no está conectado"): nunca simula un envío exitoso.

Para activarlo:
1. Creá una cuenta en resend.com, verificá tu dominio y generá una API key.
2. En Vercel → proyecto → **Settings → Environment Variables**, agregá:
   - `RESEND_API_KEY` → la clave de Resend
   - `CONTACT_TO` → la casilla que recibe los mensajes
   - `CONTACT_FROM` → remitente verificado, ej. `KROMA Web <web@tudominio.uy>`
3. **Deployments → Redeploy**.

## Pendientes para revisión

| Pendiente | Dónde |
|---|---|
| **Isotipo oficial**: el archivo del logo no llegó con el pedido. `assets/img/kroma-isotipo.svg` es una reconstrucción provisoria de tres lóbulos conectados. Reemplazalo por el SVG oficial y copiá su `path` en `scripts/build.mjs` (o reemplazá el archivo y regenerá). | `assets/img/kroma-isotipo.svg`, `assets/img/favicon.svg` |
| **Fotografías**: las imágenes B/N arquitectónicas son placeholders generados. Reemplazalas por fotos reales con el mismo nombre (`arq-fachada`, `arq-volados`, `arq-boveda`, `arq-reticula`, en `.jpg` y `.webp`). | `assets/img/` |
| **Datos de contacto** (email, teléfono, WhatsApp, redes): no se inventaron. Hay comentarios `PENDIENTE` en el footer y en la página de contacto. | `scripts/build.mjs` |
| **Envío del formulario**: configurar Resend (ver arriba). | Vercel |
| **Proyectos**: los cuatro casos son **conceptos** y están marcados como tales. Reemplazarlos por casos reales cuando existan; el campo "Resultado" solo debe completarse con datos documentados. | `scripts/build.mjs` → `PROJECTS` |

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
api/contact.js            función serverless del formulario
assets/css/main.css       sistema visual completo (tokens, componentes, estados de movimiento)
assets/js/main.js         motor de animaciones e interacciones (sin librerías)
assets/fonts/             Archivo (variable) y IBM Plex Mono, alojadas localmente
vercel.json               URLs limpias y cabeceras
```

## Sistema de movimiento

- **Duraciones**: microinteracciones 160 ms · UI 280 ms · entradas 760 ms · cortina 420 ms · ambiente 14 s+.
- **Curvas**: `--ease-out` para entradas y respuestas, `--ease-in-out` para la cortina y el menú.
- **Ligadas al scroll** (un único motor rAF que solo procesa lo visible): máscara orgánica y parallax del hero, bandas orgánicas, avance de la tarea en Automatizaciones, ensamblado de piezas en Identidad digital, profundidad en Webs, parallax de imágenes de proyectos.
- **Una vez al entrar**: titulares por líneas con máscara, recortes, fundidos y subidas (distintos según el contenido).
- **Respuesta**: filas de servicios con relleno direccional y preview, botones, enlaces, FAQ, nodos de Integraciones.
- **Ambiente**: forma decorativa del hero, señal que recorre el diagrama de Integraciones.
- **Rastro eléctrico**: solo en las dos secciones negras del Inicio, con puntero fino; límite de 44 puntos y 5 ramificaciones, adaptado a la densidad de pantalla, pausado fuera de pantalla, sin interceptar clics.
- **Movimiento reducido**: sin rastro, parallax, ambiente ni cortina; todo el contenido visible y las demos en su estado final.
- **Sin JavaScript**: todo el contenido se muestra igual.
