// Uso: node scripts/build.mjs .   (desde la carpeta raíz del proyecto)
// Regenera todos los index.html a partir de este archivo. Editá textos y páginas acá.
// Genera las páginas HTML estáticas de KROMA.
import fs from "node:fs";
import path from "node:path";
import { ICONS, PREVIEWS } from "./icons.mjs";

const OUT = process.argv[2];
const svgFile = fs.readFileSync(path.join(OUT, "assets/img/kroma-isotipo.svg"), "utf8");
const ISO_VB = svgFile.match(/viewBox="([^"]+)"/)[1];
const ISO_D = svgFile.match(/ d="([^"]+)"/)[1];

/* ---------------- utilidades ---------------- */
const ARROW = `<svg class="btn__arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const arrowIcon = (cls = "") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const iso = (cls = "", label = "") =>
  `<svg class="${cls}" viewBox="${ISO_VB}" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}><use href="#iso"/></svg>`;

function blob(pts, prec = 1) {
  const n = pts.length; let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c = (v) => v.toFixed(prec);
    d += `C${c(p1[0] + (p2[0] - p0[0]) / 6)} ${c(p1[1] + (p2[1] - p0[1]) / 6)} ${c(p2[0] - (p3[0] - p1[0]) / 6)} ${c(p2[1] - (p3[1] - p1[1]) / 6)} ${c(p2[0])} ${c(p2[1])}`;
  }
  return d + "Z";
}
const BLOB_1 = blob([[50, 4], [80, 12], [97, 40], [88, 72], [64, 96], [30, 92], [6, 70], [4, 36], [22, 12]]);
const BLOB_2 = blob([[40, 2], [76, 8], [98, 32], [92, 64], [70, 90], [38, 98], [10, 80], [2, 48], [14, 18]]);
// Forma viva: el contorno respira (main.js lo anima con ruido orgánico). Puntos en 0..100.
const LIVE_SHAPES = {
  orb:  [[50,4],[78,10],[96,34],[92,64],[72,90],[42,97],[14,82],[3,52],[16,20]],
  drop: [[44,2],[80,12],[98,40],[86,74],[56,98],[22,90],[4,62],[12,26]],
  wave: [[0,0],[100,0],[100,100],[60,100],[46,82],[54,62],[38,44],[46,24],[34,6]],
};
const liveShape = (kind, cls, style = "", amp = 3.2) =>
  `<div class="live ${cls}" style="${style}" aria-hidden="true"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><path data-live='${JSON.stringify({ pts: LIVE_SHAPES[kind], amp, open: kind === "wave" })}' fill="currentColor" d="${blob(LIVE_SHAPES[kind])}"/></svg></div>`;
const decoBlob = (d = BLOB_1) => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${d}" fill="currentColor"/></svg>`;

const lines = (arr, tag = "h1", cls = "", base = 0) =>
  `<${tag} class="lines ${cls}" data-lines>${arr.map((l, i) => `<span class="ln"><span style="--i:${i};--base:${base}ms">${l}</span></span>`).join("")}</${tag}>`;

const band = (fromColor, toTheme, rev = false) => `
<div class="band theme-${toTheme}" data-band${rev ? '="rev"' : ""} aria-hidden="true">
  <svg viewBox="0 0 1300 140" preserveAspectRatio="none"><path fill="${fromColor}" d="M0 0H1300V54C1170 120 1030 30 860 66C690 102 560 140 380 92C240 55 120 70 0 104Z"/></svg>
</div>`;

/* ---------------- datos ---------------- */
// Dominio público del sitio. Si Vercel te asigna otro (o usás dominio propio), cambialo y regenerá.
// Se usa para la imagen que aparece al compartir el link (WhatsApp, LinkedIn, etc.).
const SITE_URL = "https://kroma-web.vercel.app";
const EMAIL = "somoskroma@gmail.com";
const IG = "@_kromalabs";
const IG_URL = "https://www.instagram.com/_kromalabs/";
// WhatsApp: completar con el número en formato internacional, solo dígitos (ej. "59899123456").
// Mientras esté vacío, el ícono de WhatsApp no aparece.
const WA_NUMBER = "";
const WA_URL = WA_NUMBER ? `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola KROMA, quiero hacer una consulta.")}` : "";
const SOCIAL_SVG = {
  mail: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M4 7.5l8 5.6 8-5.6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="17.3" cy="6.7" r="1.25" fill="currentColor"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2.5a9.43 9.43 0 0 0-8.14 14.2L2.6 21.5l4.92-1.29A9.43 9.43 0 1 0 12.04 2.5Zm0 17.2a7.8 7.8 0 0 1-3.98-1.09l-.29-.17-2.92.77.78-2.85-.19-.3a7.82 7.82 0 1 1 6.6 3.64Zm4.29-5.85c-.24-.12-1.4-.69-1.61-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06a6.4 6.4 0 0 1-1.88-1.16 7.08 7.08 0 0 1-1.3-1.62c-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46a.89.89 0 0 0-.64.3 2.7 2.7 0 0 0-.84 2 4.68 4.68 0 0 0 .98 2.49 10.7 10.7 0 0 0 4.1 3.62c.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.1.46-.07 1.4-.57 1.6-1.13.2-.55.2-1.03.14-1.13-.06-.1-.22-.16-.46-.28Z"/></svg>`,
};
const socialIcons = (cls = "") => `<div class="social ${cls}">
  <a class="social__btn" href="mailto:${EMAIL}" aria-label="Escribir a KROMA por email: ${EMAIL}" data-tip="${EMAIL}">${SOCIAL_SVG.mail}</a>
  <a class="social__btn" href="${IG_URL}" target="_blank" rel="noopener" aria-label="Instagram de KROMA (se abre en otra pestaña)" data-tip="Instagram">${SOCIAL_SVG.instagram}</a>
  ${WA_URL ? `<a class="social__btn social__btn--wa" href="${WA_URL}" target="_blank" rel="noopener" aria-label="Escribir a KROMA por WhatsApp (se abre en otra pestaña)" data-tip="WhatsApp">${SOCIAL_SVG.whatsapp}</a>` : ""}
</div>`;
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${EMAIL}`;

const SERVICES = [
  { slug: "webs", n: "01", name: "Webs", img: "arq-esquina", short: "Sitios a medida, rápidos y pensados para convertir." },
  { slug: "automatizaciones", n: "02", name: "Automatizaciones", img: "arq-escalera", short: "Menos trabajo manual. Más tiempo para lo importante." },
  { slug: "integraciones", n: "03", name: "Integraciones", img: "arq-voladizo", short: "Conectamos tus herramientas para que todo fluya." },
  { slug: "identidad-digital", n: "04", name: "Identidad digital", img: "arq-curva", short: "Una presencia digital sólida y coherente con tu negocio." },
];

const PROJECTS = [
  {
    slug: "web-estudio-profesional", service: "webs", serviceName: "Webs", img: "arq-esquina",
    title: "Web para un estudio profesional",
    context: "Un estudio contable con una cartera estable de clientes. Su web actual fue armada hace años y casi no se actualiza.",
    need: "Las consultas llegan por teléfono y suelen repetirse: horarios, documentación necesaria, servicios. El estudio quiere que la web responda lo básico y que los contactos nuevos lleguen con la información ordenada.",
    solution: "Un sitio breve y claro, con los servicios explicados en lenguaje simple, una sección de preguntas frecuentes y un formulario que pide los datos necesarios según el tipo de consulta.",
    deliverables: ["Arquitectura de contenidos", "Diseño responsive de cinco páginas", "Formulario con campos según el tipo de consulta", "Guía breve para actualizar textos"],
  },
  {
    slug: "automatizacion-pedidos", service: "automatizaciones", serviceName: "Automatizaciones", img: "arq-escalera",
    title: "Automatización de pedidos para una distribuidora",
    context: "Una distribuidora que recibe pedidos de comercios por email y WhatsApp, y los carga a mano en una planilla.",
    need: "Reducir el tiempo de carga y los errores de transcripción, y avisarle al cliente cuando su pedido quedó registrado.",
    solution: "Un formulario de pedido para clientes frecuentes. Cada envío se valida, se registra en la planilla compartida y dispara dos avisos: la confirmación al cliente y la notificación al depósito.",
    deliverables: ["Mapa del proceso actual y del propuesto", "Formulario de pedido", "Flujo automatizado con avisos", "Documentación y alerta ante errores"],
  },
  {
    slug: "integracion-tienda-stock", service: "integraciones", serviceName: "Integraciones", img: "arq-voladizo",
    title: "Integración entre tienda online y stock",
    context: "Un comercio con local físico y tienda online, que maneja el stock en su sistema de gestión.",
    need: "Evitar ventas de productos sin stock y dejar de actualizar cantidades a mano en dos lugares.",
    solution: "Una integración que sincroniza el stock del sistema de gestión con la tienda online y registra cada venta web en el sistema, con un reporte diario de diferencias.",
    deliverables: ["Diagnóstico de ambos sistemas", "Reglas de sincronización", "Integración implementada y probada", "Reporte diario de control"],
  },
  {
    slug: "identidad-cafeteria", service: "identidad-digital", serviceName: "Identidad digital", img: "arq-curva",
    title: "Identidad digital para una cafetería de barrio",
    context: "Una cafetería que abre su segundo local y comunica en redes con piezas armadas de forma improvisada.",
    need: "Tener una imagen reconocible y poder publicar con frecuencia sin depender de un diseñador para cada pieza.",
    solution: "Una actualización de la identidad visual con paleta, tipografías y reglas simples, más un set de plantillas editables para redes y cartelería del local.",
    deliverables: ["Identidad visual actualizada", "Manual de uso breve", "Plantillas editables para redes", "Piezas para cartelería y menú"],
  },
];

/* ---------------- layout ---------------- */
function head({ title, desc, path: p }) {
  const full = p === "/" ? "KROMA — Consultoría tecnológica para empresas" : `${title} — KROMA`;
  return `<!DOCTYPE html>
<html lang="es-UY">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${full}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#0053fd">
<meta name="color-scheme" content="light">
<meta property="og:type" content="website">
<meta property="og:title" content="${full}">
<meta property="og:description" content="${desc}">
<meta property="og:locale" content="es_UY">
<meta property="og:site_name" content="KROMA">
<meta property="og:image" content="${SITE_URL}/assets/img/og-kroma.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/img/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/figtree-900.woff2" as="font" type="font/woff2" crossorigin>${p === "/" ? `\n<link rel="preload" as="image" type="image/webp" href="/assets/img/arq-escalera-curva.webp" imagesrcset="/assets/img/arq-escalera-curva-900.webp 900w, /assets/img/arq-escalera-curva.webp 1536w" imagesizes="(max-width: 820px) 80vw, 66vw" fetchpriority="high">` : ""}
<link rel="stylesheet" href="/assets/css/main.css">
<script>(function(d){var h=d.documentElement;h.classList.add("js");try{if(sessionStorage.getItem("kroma-transition")){sessionStorage.removeItem("kroma-transition");if(!matchMedia("(prefers-reduced-motion: reduce)").matches)h.classList.add("is-entering")}}catch(e){}setTimeout(function(){if(!window.KROMA_READY)h.classList.remove("js","is-entering")},3000)})(document);</script>
<script src="/assets/js/main.js" defer></script>
<script type="speculationrules">{"prefetch":[{"source":"document","where":{"href_matches":"/*"},"eagerness":"moderate"}]}</script>
</head>`;
}

const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><symbol id="iso" viewBox="${ISO_VB}"><path fill="currentColor" d="${ISO_D}"/></symbol></defs></svg>`;

function header(active, tone) {
  const cur = (k) => (active === k ? ' aria-current="page"' : "");
  const subCur = active.startsWith("servicios") ? " is-current" : "";
  return `
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<header class="site-header" data-on="${tone}">
  <div class="wrap">
    <a class="brand" href="/" aria-label="KROMA — Inicio"><span class="brand__word" aria-hidden="true">kroma</span></a>
    <nav class="nav" aria-label="Principal">
      <ul class="nav__list">
        <li class="nav__pill-ind" aria-hidden="true"></li>
        <li><a class="nav__link" href="/"${cur("inicio")}>Inicio</a></li>
        <li><a class="nav__link" href="/nosotros"${cur("nosotros")}>Nosotros</a></li>
        <li class="nav__item--sub${subCur}">
          <div class="nav__row">
            <a class="nav__link" href="/servicios"${cur("servicios")}>Servicios</a>
            <button class="nav__subtoggle" type="button" aria-expanded="false" aria-controls="sub-servicios" aria-label="Mostrar servicios"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
          </div>
          <div class="nav__sub mega" id="sub-servicios">
            <ul class="mega__grid">
              ${SERVICES.map((s, i) => `<li style="--i:${i}"><a class="mega__tile" href="/servicios/${s.slug}"${cur("servicios/" + s.slug)}>
                <span class="mega__ico">${ICONS[s.slug]}</span>
                <span class="mega__txt"><span class="mega__num">${s.n}</span><span class="mega__name">${s.name}</span><span class="mega__desc">${s.short}</span></span>
                <span class="mega__go" aria-hidden="true">${arrowIcon()}</span>
              </a></li>`).join("")}
            </ul>
            <div class="mega__side">
              <span class="mega__label">Servicios · 04</span>
              <p>Elegimos la herramienta según tu operación, no al revés.</p>
              <a class="mega__all" href="/servicios">Ver todos los servicios ${arrowIcon()}</a>
              <a class="mega__cta" href="/contacto?servicio=no-se">¿No sabés por dónde empezar? <strong>Hablemos</strong></a>
            </div>
          </div>
        </li>
        <li><a class="nav__link" href="/proyectos"${cur("proyectos")}>Proyectos</a></li>
      </ul>
      <a class="btn nav__cta" href="/contacto"${cur("contacto")}>Hablemos ${ARROW}</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu-movil" aria-label="Abrir menú"><span></span><span></span></button>
    </nav>
  </div>
</header>
<div class="mobile-menu" id="menu-movil">
  <nav aria-label="Menú móvil">
    <ul class="mobile-menu__main">
      <li><a href="/"${cur("inicio")}>Inicio</a></li>
      <li><a href="/nosotros"${cur("nosotros")}>Nosotros</a></li>
      <li><a href="/servicios"${cur("servicios")}>Servicios</a>
        <ul class="mobile-menu__sub">${SERVICES.map((s) => `<li><a href="/servicios/${s.slug}"><span class="mobile-menu__ico">${ICONS[s.slug]}</span>${s.name}</a></li>`).join("")}</ul>
      </li>
      <li><a href="/proyectos"${cur("proyectos")}>Proyectos</a></li>
      <li><a href="/contacto"${cur("contacto")}>Hablemos</a></li>
    </ul>
  </nav>
  <div class="mobile-menu__foot"><p>Consultoría tecnológica para empresas.</p>${socialIcons("social--menu")}</div>
</div>`;
}

const footer = `
<footer class="site-footer" data-theme="black">
  <div class="wrap">
    <div class="footer__top">
      <div class="footer__brand">
        <a class="brand" href="/" aria-label="KROMA — Inicio">${iso("brand__mark")}<span class="brand__word" aria-hidden="true">kroma</span></a>
        <p>Consultoría tecnológica para empresas. Te ayudamos a elegir herramientas y aprovecharlas bien.</p>
      </div>
      <div class="footer__col">
        <h2>Sitio</h2>
        <ul><li><a href="/">Inicio</a></li><li><a href="/nosotros">Nosotros</a></li><li><a href="/proyectos">Proyectos</a></li><li><a href="/contacto">Hablemos</a></li></ul>
      </div>
      <div class="footer__col">
        <h2>Servicios</h2>
        <ul>${SERVICES.map((s) => `<li><a href="/servicios/${s.slug}">${s.name}</a></li>`).join("")}</ul>
      </div>
      <div class="footer__col">
        <h2>Contacto</h2>
        <ul><li><a href="/contacto">Formulario</a></li></ul>
        ${socialIcons("social--footer")}
      </div>
    </div>
    <div class="footer__bottom">
      <span>© <span id="year">2026</span> KROMA</span>
      <span>Hecho en Uruguay</span>
    </div>
  </div>
</footer>
<div class="curtain" aria-hidden="true"><div class="curtain__body"></div>${iso("curtain__mark")}</div>`;

function page({ path: p, title, desc, active, tone, body }) {
  return `${head({ title, desc, path: p })}
<body>
${sprite}
${header(active, tone)}
<main id="contenido" tabindex="-1">
${body}
</main>
${footer}
</body>
</html>
`;
}

// La fuente deja mucho aire antes del punto/coma en tamaños grandes: se compensa en títulos.
function tightPunct(html) {
  return html.replace(/<(h1|h2)([^>]*)>([\s\S]*?)<\/\1>/g, (m, tag, attrs, inner) =>
    `<${tag}${attrs}>${inner.replace(/([A-Za-zÁÉÍÓÚáéíóúñÑ])([.,])(?=[\s<]|$)/g, '$1<span class="pn">$2</span>')}</${tag}>`);
}
// La puntuación recupera el espacio que le quita el tracking negativo de los títulos.
function airPunct(html) {
  return html.replace(/<(h1|h2|h3|p)(\s[^>]*)?>([\s\S]*?)<\/\1>/g, (m, tag, attrs = "", inner) =>
    `<${tag}${attrs}>${(">" + inner).replace(/(>[^<]*)/g, (seg) => seg.replace(/([A-Za-zÁÉÍÓÚáéíóúñÑüÜ])([.,;:?!]+)(?=[\s<)]|$)/g, '$1<span class="pt">$2</span>')).slice(1)}</${tag}>`);
}
function write(rel, html) {
  html = airPunct(html).replace(/(<\/(?:em|strong|a)>)([.,;:?!]+)/g, '$1<span class="pt">$2</span>');
  const file = rel === "/" ? "index.html" : rel === "/404" ? "404.html" : path.join(rel.slice(1), "index.html");
  const full = path.join(OUT, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
}

/* ---------------- componentes ---------------- */
function svcRows() {
  return `<ul class="svc-list">
  ${SERVICES.map((s) => `<li class="svc-row">
    <a class="svc-row__link" href="/servicios/${s.slug}">
      <span class="svc-row__num"><span>${s.n}</span><span class="svc-row__ico">${ICONS[s.slug]}</span></span>
      <span class="svc-row__body"><span class="svc-row__title">${s.name}</span><span class="svc-row__desc">${s.short}</span></span>
      <span class="svc-row__thumb" aria-hidden="true"><picture><source srcset="/assets/img/${s.img}-sm.webp" type="image/webp"><img src="/assets/img/${s.img}-sm.jpg" alt="" width="640" height="427" loading="lazy" decoding="async"></picture></span>
      <span class="circle-arrow" aria-hidden="true">${arrowIcon()}</span>
      <span class="svc-row__preview" aria-hidden="true">${PREVIEWS[s.slug]}</span>
    </a>
  </li>`).join("\n  ")}
</ul>`;
}

function projCard(pr, variant, i = 0, hTag = "h3", eager = false) {
  return `<article class="proj proj--${variant}" data-reveal="rise" style="--delay:${i * 80}ms">
  <a class="proj__link" href="/proyectos/${pr.slug}">
    <div class="proj__media">
      <div class="proj__para" data-parallax="0.07">
        <picture><source srcset="/assets/img/${pr.img}-900.webp 900w, /assets/img/${pr.img}.webp 1536w" sizes="(max-width: 920px) 100vw, 60vw" type="image/webp"><img src="/assets/img/${pr.img}.jpg" srcset="/assets/img/${pr.img}-900.jpg 900w, /assets/img/${pr.img}.jpg 1536w" sizes="(max-width: 920px) 100vw, 60vw" alt="" width="1536" height="1024" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>
      </div>
      <span class="proj__cta">Ver caso ${arrowIcon()}</span>
    </div>
    <div class="proj__info">
      <${hTag} class="proj__title">${pr.title}</${hTag}>
      <span class="proj__kind">Concepto · ${pr.serviceName}</span>
    </div>
  </a>
</article>`;
}

function closing({ theme = "black", title, text, trail = false, cta = "Hablemos", href = "/contacto", size = "display" }) {
  const btn = theme === "blue" ? "" : theme === "ivory" ? "" : "btn--ivory";
  return `<section class="section closing theme-${theme}${trail ? " trail-zone" : ""}" data-theme="${theme}"${trail ? " data-trail" : ""} aria-labelledby="cierre-titulo">
  <div class="wrap closing__inner">
    ${lines(title, "h2", size + " closing__title").replace("<h2 ", '<h2 id="cierre-titulo" ')}
    <div class="closing__side" data-reveal="rise" style="--delay:200ms">
      <p class="lead">${text}</p>
      <a class="btn ${btn}" href="${href}">${cta} ${ARROW}</a>
    </div>
  </div>
</section>`;
}

/* =========================================================
   INICIO
   ========================================================= */
// Geometría del hero, medida sobre el mockup (coordenadas 0..1 de la caja del hero).
// main.js usa los mismos puntos (data-shape) para el movimiento de flotación.
const HERO_SHAPE = {
  ivory: [[0,.78],[.15,.75],[.28,.70],[.37,.62],[.45,.545],[.55,.46],[.63,.40],[.68,.31],[.71,.20],[.76,.115],[.83,.085]],
  photo: [[.50,.99],[.43,.92],[.39,.83],[.39,.72],[.43,.625],[.50,.545],[.60,.475],[.69,.40],[.73,.29],[.745,.18],[.79,.11],[.87,.085]],
  lobe:  [[1,.64],[.95,.69],[.88,.745],[.80,.81],[.72,.865],[.62,.925],[.50,.99]],
};
function spline(pts) {
  // Catmull-Rom abierta → segmentos C (sin el M inicial)
  const f = (v) => v.toFixed(4); let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}
const TOP = HERO_SHAPE.photo[HERO_SHAPE.photo.length - 1][1];
const heroIvoryD = (s) => `M${s.ivory[0][0]} ${s.ivory[0][1]}${spline(s.ivory)}L1 ${TOP}L1 ${s.lobe[0][1]}${spline(s.lobe)}L.5 1L0 1Z`;
const heroPhotoD = (s) => { const top = s.photo[s.photo.length - 1]; return `M${top[0]} ${top[1]}L1 ${TOP}L1 ${s.lobe[0][1]}${spline(s.lobe)}${spline(s.photo)}Z`; };

write("/", page({
  path: "/", title: "Inicio", active: "inicio", tone: "blue",
  desc: "KROMA es una consultora tecnológica para empresas uruguayas: webs, automatizaciones, integraciones e identidad digital, elegidas e implementadas con criterio.",
  body: `
<section class="hero theme-blue" data-theme="blue" aria-labelledby="hero-titulo" data-shape='${JSON.stringify(HERO_SHAPE)}'>
  <div class="hero__stage">
    <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><clipPath id="hero-clip" clipPathUnits="objectBoundingBox"><path id="hero-clip-path" d="${heroPhotoD(HERO_SHAPE)}"/></clipPath></svg>
    <svg class="hero__ivory" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
      <path id="hero-ivory-path" fill="var(--ivory)" d="${heroIvoryD(HERO_SHAPE)}"/>
      <path fill="var(--ivory)" d="M.48 1C.66 .993 .84 .982 1 .962L1 1Z"/>
    </svg>
    <div class="hero__media" role="img" aria-label="Escalera curva de hormigón, fotografía en blanco y negro">
      <div class="hero__frame">
        <picture><source srcset="/assets/img/arq-escalera-curva-900.webp 900w, /assets/img/arq-escalera-curva.webp 1536w" sizes="(max-width: 820px) 80vw, 66vw" type="image/webp"><img class="hero__photo" src="/assets/img/arq-escalera-curva.jpg" srcset="/assets/img/arq-escalera-curva-900.jpg 900w, /assets/img/arq-escalera-curva.jpg 1536w" sizes="(max-width: 820px) 80vw, 66vw" alt="" width="1536" height="1024" fetchpriority="high" decoding="async"></picture>
      </div>
    </div>
    <div class="hero__mark" aria-hidden="true"><div class="hero__mark-follow"><div class="hero__mark-float"><div class="hero__mark-in">${iso()}</div></div></div></div>
  </div>
  <div class="wrap hero__wrap">
    <div class="hero__text">
      ${lines(["Tu negocio.", "Su próxima", "versión."], "h1", "display hero__title", 80).replace("<h1 ", '<h1 id="hero-titulo" ')}
      <div class="hero__meta" data-reveal="fade" style="--delay:520ms">
        <p>Consultoría tecnológica<br>para empresas.</p>
        <a class="btn hero__cta" href="/contacto">Hablemos ${ARROW}</a>
      </div>
    </div>
  </div>
</section>
<section class="section statement theme-ivory" data-theme="ivory" aria-labelledby="criterio-titulo">
  <div class="wrap grid12">
    <div class="statement__title">
      ${lines(["Tecnología", "con criterio."], "h2", "h1").replace("<h2 ", '<h2 id="criterio-titulo" ')}
    </div>
    <div class="statement__body" data-reveal="rise" style="--delay:160ms">
      <p class="lead">Estrategia, desarrollo e integración para que tu negocio avance con sentido.</p>
      <p class="muted">Hoy existe una herramienta para casi todo. El desafío ya no es encontrarla: es saber cuál conviene, cómo implementarla y lograr que tu equipo la use.</p>
    </div>
    <span class="statement__rule" data-reveal="draw" aria-hidden="true"></span>
    <ul class="values">
      <li data-reveal="rise"><span class="num accent">01</span><h3>Primero entendemos tu operación</h3><p class="muted">Antes de proponer una herramienta, vemos cómo trabajás hoy y dónde se pierde tiempo.</p></li>
      <li data-reveal="rise" style="--delay:120ms"><span class="num accent">02</span><h3>Elegimos lo que tiene sentido</h3><p class="muted">Recomendamos soluciones a la escala de tu empresa y de tu presupuesto, no la opción más nueva.</p></li>
      <li data-reveal="rise" style="--delay:240ms"><span class="num accent">03</span><h3>Lo dejamos funcionando</h3><p class="muted">Implementamos, explicamos cómo se usa y acompañamos los primeros pasos.</p></li>
    </ul>
  </div>
</section>
${band("var(--ivory)", "black")}
<section class="section theme-black trail-zone" data-theme="black" data-trail aria-labelledby="servicios-titulo" style="padding-block:clamp(32px,5vw,72px)">
  <div class="wrap">
    <div class="sec-head">
      ${lines(["Herramientas que", "mueven tu negocio."], "h2", "h2").replace("<h2 ", '<h2 id="servicios-titulo" ')}
      <a class="link-arrow" href="/servicios">Ver todos los servicios ${arrowIcon()}</a>
    </div>
    ${svcRows()}
  </div>
</section>
${band("var(--black)", "ivory", true)}
<section class="section theme-ivory" data-theme="ivory" aria-labelledby="proyectos-titulo" style="padding-top:clamp(32px,5vw,72px)">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <p class="eyebrow" data-reveal="fade">Proyectos</p>
        ${lines(["Así lo", "resolveríamos."], "h2", "h2").replace("<h2 ", '<h2 id="proyectos-titulo" style="margin-top:20px" ')}
      </div>
      <p class="muted" style="max-width:38ch">Casos conceptuales: ejemplos de cómo abordamos necesidades frecuentes. No corresponden a clientes reales.</p>
    </div>
    <div class="proj-grid">
      ${projCard(PROJECTS[0], "a")}
      ${projCard(PROJECTS[1], "b", 1)}
    </div>
    <p style="margin-top:56px"><a class="link-arrow" href="/proyectos">Ver todos los conceptos ${arrowIcon()}</a></p>
  </div>
</section>
${closing({ theme: "black", trail: true, title: ["¿Por dónde", "empezamos?"], text: "Contanos qué querés mejorar en tu empresa y vemos juntos cuál es el primer paso." })}
`,
}));

/* =========================================================
   NOSOTROS
   ========================================================= */
const PROCESS = [
  { t: "Entendemos", d: "Nos sumergimos en tu negocio, tus desafíos y tus oportunidades.",
    a: ["Conversamos con quienes hacen el trabajo todos los días", "Relevamos herramientas, procesos y datos actuales", "Detectamos dónde se pierde tiempo o se repiten tareas"],
    out: "Un diagnóstico claro de tu situación" },
  { t: "Priorizamos", d: "Definimos el camino con criterio y foco en lo que genera valor.",
    a: ["Ordenamos las oportunidades por impacto y esfuerzo", "Elegimos herramientas a la escala de tu empresa", "Acordamos alcance, etapas y costos antes de empezar"],
    out: "Un plan por etapas, sin sorpresas" },
  { t: "Desarrollamos", d: "Creamos soluciones robustas, escalables y a medida.",
    a: ["Implementamos por etapas, de a una cosa por vez", "Probamos con datos y casos reales", "Revisamos juntos cada avance"],
    out: "La solución funcionando en tu operación" },
  { t: "Acompañamos", d: "Estamos en cada etapa para que tu negocio siga creciendo.",
    a: ["Capacitamos a tu equipo en el uso diario", "Dejamos documentación simple y ordenada", "Ajustamos según cómo se usa en la práctica"],
    out: "Autonomía para usar y mantener lo que hicimos" },
];
const PRINCIPLES = [
  ["Claridad", "Explicamos cada decisión sin jerga, para que puedas evaluarla."],
  ["Escala", "Proponemos soluciones acordes al tamaño y al momento de tu empresa."],
  ["Autonomía", "Buscamos que tu equipo pueda usar y mantener lo que implementamos."],
];
const words = (txt) => txt.split(" ").map((w, i) => `<span class="mw" style="--w:${i}">${w}</span>`).join(" ");
// Dial del proceso: anillo con 4 nodos (arriba, derecha, abajo, izquierda)
const DIAL_R = 168;
const dialNode = (i) => {
  const ang = -Math.PI / 2 + (i * Math.PI) / 2;
  const x = (200 + DIAL_R * Math.cos(ang)).toFixed(1), y = (200 + DIAL_R * Math.sin(ang)).toFixed(1);
  return `<g class="dial__node" data-i="${i}" transform="translate(${x} ${y})"><circle r="24"/><text dy=".35em">0${i + 1}</text></g>`;
};

write("/nosotros", page({
  path: "/nosotros", title: "Nosotros", active: "nosotros", tone: "ivory",
  desc: "KROMA nace para democratizar la digitalización de las empresas uruguayas: elegir bien las herramientas e implementarlas con criterio.",
  body: `
<section class="page-hero about-hero theme-ivory" data-theme="ivory" aria-labelledby="t">
  <div class="wrap about-hero__grid">
    <div class="about-hero__text">
      <p class="eyebrow" data-reveal="fade">Nosotros</p>
      ${lines(["Digitalizar", "también es", "elegir bien."], "h1", "display about-hero__title").replace("<h1 ", '<h1 id="t" ')}
      <div class="about-hero__intro" data-reveal="rise" style="--delay:400ms">
        <p class="lead">Somos una consultora tecnológica uruguaya. Nuestro propósito es democratizar la digitalización de las empresas.</p>
        <a class="link-arrow" href="#proceso">Ver cómo trabajamos ${arrowIcon()}</a>
      </div>
    </div>
    <div class="about-hero__visual" aria-hidden="true">
      ${liveShape("orb", "about-hero__orb", "color:var(--blue)", 6)}
      <div class="about-hero__mark"><div class="float-soft">${iso()}</div></div>
    </div>
  </div>
</section>
<div class="about-band" data-band aria-hidden="true">
  <svg viewBox="0 0 1300 320" preserveAspectRatio="none">
    <path fill="var(--black)" d="M0 150C180 120 330 40 520 70C700 98 760 230 930 240C1080 250 1180 140 1300 120V320H0Z"/>
    <path fill="var(--blue)" d="M0 320V270C110 180 200 130 330 140C460 150 520 280 690 320Z"/>
  </svg>
</div>
<section class="section theme-black manifesto" data-theme="black" aria-labelledby="proposito">
  <div class="wrap">
    <p class="eyebrow" data-reveal="fade">Propósito</p>
    <h2 id="proposito" class="manifesto__big" data-words>${words("Nunca hubo tantas herramientas disponibles. Pero más opciones no siempre significan mejores decisiones.")}</h2>
    <div class="manifesto__grid">
      <figure class="manifesto__figure" data-reveal="wipe">
        <div class="proj__media"><div class="proj__para" data-parallax="0.06"><picture><source srcset="/assets/img/arq-escalera-900.webp 900w, /assets/img/arq-escalera.webp 1536w" sizes="(max-width: 920px) 100vw, 50vw" type="image/webp"><img src="/assets/img/arq-escalera.jpg" srcset="/assets/img/arq-escalera-900.jpg 900w, /assets/img/arq-escalera.jpg 1536w" sizes="(max-width: 920px) 100vw, 50vw" alt="Escalera recta entre volúmenes de hormigón, en blanco y negro" width="1536" height="1024" loading="lazy" decoding="async"></picture></div></div>
      </figure>
      <div class="manifesto__text" data-reveal="rise" style="--delay:120ms">
        <p>Para muchas empresas, digitalizarse se volvió una lista de suscripciones que nadie termina de usar. El valor no está en sumar tecnología, sino en elegirla bien e implementarla con criterio.</p>
        <p>Democratizar la digitalización es eso: que una empresa chica o mediana pueda acceder al mismo criterio que una grande, con soluciones a su escala.</p>
        <blockquote class="manifesto__quote">Tecnología que se entiende, se usa y se puede mantener. <span>Ese es nuestro criterio.</span></blockquote>
      </div>
    </div>
  </div>
</section>
<section class="section theme-ivory flow" data-theme="ivory" aria-labelledby="proceso" id="proceso" style="--n:${PROCESS.length}">
  <div class="wrap">
    <div class="sec-head flow__head">
      <div>
        <p class="eyebrow" data-reveal="fade">Proceso</p>
        ${lines(["Cómo trabajamos."], "h2", "h2").replace("<h2 ", '<h2 id="proceso-t" style="margin-top:18px" ')}
      </div>
      <p class="muted flow__lede" data-reveal="fade">Cuatro etapas claras. En cada momento sabés en qué punto estamos y qué viene después.</p>
    </div>
  </div>
  <div class="flow__track">
    <div class="flow__sticky">
      <div class="wrap flow__grid">
        <div class="flow__dial" aria-hidden="true">
          <svg class="dial" viewBox="0 0 400 400">
            <circle class="dial__ring" cx="200" cy="200" r="${DIAL_R}"/>
            <circle class="dial__ticks" cx="200" cy="200" r="${DIAL_R - 34}"/>
            <circle class="dial__progress" cx="200" cy="200" r="${DIAL_R}" pathLength="100" transform="rotate(-90 200 200)"/>
            <g class="dial__orbit"><circle class="dial__dot" cx="200" cy="${200 - DIAL_R}" r="7"/></g>
            ${PROCESS.map((_, i) => dialNode(i)).join("")}
          </svg>
          <div class="dial__center">
            <span class="dial__num"><span data-dial-num>01</span><small>/0${PROCESS.length}</small></span>
            <span class="dial__name" data-dial-name>${PROCESS[0].t}</span>
          </div>
        </div>
        <div class="flow__main">
          <div class="flow__tabs" role="tablist" aria-label="Etapas del proceso">
            ${PROCESS.map((s, i) => `<button type="button" class="flow__tab" role="tab" id="ft-${i}" aria-controls="fp-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-i="${i}"><span class="flow__tab-num">0${i + 1}</span><span class="flow__tab-name">${s.t}</span><span class="flow__tab-bar" aria-hidden="true"><i></i></span></button>`).join("")}
          </div>
          <div class="flow__panels" tabindex="0" aria-label="Detalle de cada etapa">
            ${PROCESS.map((s, i) => `<div class="flow__panel${i === 0 ? " is-active" : ""}" role="tabpanel" id="fp-${i}" aria-labelledby="ft-${i}" data-i="${i}">
              <p class="flow__step num">Etapa 0${i + 1} de 0${PROCESS.length}</p>
              <h3 class="flow__title">${s.t}.</h3>
              <p class="flow__desc lead">${s.d}</p>
              <ul class="flow__acts">${s.a.map((x, k) => `<li style="--k:${k}"><span class="flow__check" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7"/></svg></span>${x}</li>`).join("")}</ul>
              <p class="flow__out"><span class="num">Te llevás</span><strong>${s.out}</strong></p>
            </div>`).join("")}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="section theme-black principles" data-theme="black" aria-labelledby="principios">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <p class="eyebrow" data-reveal="fade">Principios</p>
        ${lines(["Lo que nos guía."], "h2", "h2").replace("<h2 ", '<h2 id="principios" style="margin-top:18px" ')}
      </div>
    </div>
    <ol class="principles__list">
      ${PRINCIPLES.map(([t, d], i) => `<li class="principles__row" data-reveal="rise" style="--delay:${i * 90}ms"><span class="principles__num num">0${i + 1}</span><span class="principles__word">${t}</span><p class="principles__desc">${d}</p></li>`).join("")}
    </ol>
  </div>
</section>
${closing({ theme: "blue", title: ["Empecemos por", "entender."], text: "Una primera conversación alcanza para identificar por dónde conviene empezar." })}
`,
}));

/* =========================================================
   SERVICIOS (índice)
   ========================================================= */
write("/servicios", page({
  path: "/servicios", title: "Servicios", active: "servicios", tone: "black",
  desc: "Webs, automatizaciones, integraciones e identidad digital para empresas uruguayas.",
  body: `
<section class="page-hero svc-index-hero theme-black" data-theme="black" aria-labelledby="t">
  ${liveShape("wave", "svc-index-hero__shape", "color:var(--blue)", 7)}
  <div class="wrap page-hero__grid">
    <nav class="page-hero__eyebrow" aria-label="Ruta"><ol class="breadcrumb"><li><a href="/">Inicio</a></li><li aria-current="page">Servicios</li></ol></nav>
    ${lines(["Herramientas que", "mueven tu negocio."], "h1", "display svc-index-hero__title").replace("<h1 ", '<h1 id="t" ')}
    <p class="lead svc-index-hero__sub" data-reveal="rise" style="--delay:350ms">Soluciones tecnológicas a medida<br>para empresas que quieren más.</p>
  </div>
</section>
<section class="section theme-black trail-zone" data-theme="black" data-trail aria-label="Lista de servicios" style="padding-top:0;padding-bottom:clamp(32px,5vw,72px)">
  <div class="wrap">${svcRows()}</div>
</section>
${band("var(--black)", "ivory")}
<section class="section theme-ivory" data-theme="ivory" aria-labelledby="eleccion" style="padding-top:clamp(24px,4vw,56px)">
  <div class="wrap split">
    <div class="split__head split__head--wide">
      ${lines(["Elegimos lo que", "necesitás."], "h2", "h2").replace("<h2 ", '<h2 id="eleccion" ')}
      <p class="lead" style="margin-top:18px" data-reveal="fade">Tecnología útil. Sin ruido. Con impacto real.</p>
    </div>
    <div class="split__body split__body--narrow" data-reveal="rise">
      <p style="margin-bottom:18px">Muchas veces la necesidad no encaja en un solo servicio: una web que debería cargar pedidos, una planilla que debería hablar con la facturación, una marca que necesita piezas nuevas.</p>
      <p class="muted" style="margin-bottom:32px">En la primera conversación ordenamos el problema y te decimos qué combinación tiene sentido, o si conviene esperar.</p>
      <a class="btn" href="/contacto?servicio=no-se">Contanos tu caso ${ARROW}</a>
    </div>
  </div>
</section>
`,
}));

/* =========================================================
   PÁGINAS DE SERVICIO
   ========================================================= */
const SVC_PAGES = {
  webs: {
    tone: "blue", heroTheme: "blue",
    title: ["Una web que", "trabaja para", "tu negocio."],
    lead: "Diseñamos y desarrollamos sitios claros, rápidos y fáciles de actualizar, pensados para que tus clientes entiendan qué hacés y cómo contactarte.",
    desc: "Diseño y desarrollo de sitios web claros, rápidos y fáciles de actualizar para empresas uruguayas.",
    problem: "Muchas webs se ven bien pero no ayudan: <em>la información queda desactualizada</em>, cargan lento en el celular o nadie sabe cómo cambiar un texto.",
    includes: [
      ["Estrategia y contenidos", "Ordenamos qué decir, en qué orden y para quién, antes de diseñar."],
      ["Diseño a medida", "Una propuesta visual coherente con tu marca, sin plantillas genéricas."],
      ["Desarrollo responsive", "Funciona bien en celular, tablet y computadora, con atención a la velocidad y al posicionamiento básico."],
      ["Publicación y autogestión", "Dejamos el sitio publicado, con dominio configurado y una forma simple de editar lo esencial."],
    ],
    examples: [
      ["Sitio institucional", "Para un estudio o empresa de servicios que necesita explicar qué hace y recibir consultas ordenadas."],
      ["Landing de campaña", "Una página enfocada para lanzar un servicio, un producto o una convocatoria."],
      ["Catálogo con consulta", "Productos presentados con claridad y un canal directo para pedir información."],
      ["Rediseño", "Una web existente que ya no se puede mantener, migrada a una base simple."],
    ],
    steps: [["Relevamiento", "Objetivos, público y contenidos disponibles."], ["Estructura y diseño", "Mapa del sitio y diseño de las páginas clave."], ["Desarrollo", "Construcción, pruebas en dispositivos y ajustes."], ["Publicación", "Dominio, puesta en línea y guía de uso."]],
    faq: [
      ["¿Puedo actualizar la web yo mismo?", "Sí. Definimos juntos qué partes vas a querer editar y elegimos una solución que lo permita sin conocimientos técnicos."],
      ["¿Cuánto demora?", "Depende del alcance. Lo estimamos después de la primera conversación, con etapas y fechas concretas."],
      ["¿Se encargan del dominio y el hosting?", "Te ayudamos a elegirlos y configurarlos. Quedan a nombre de tu empresa."],
      ["Ya tengo una web, ¿hay que hacerla de cero?", "No necesariamente. La revisamos y te decimos qué conviene: mejorarla, migrarla o rehacerla."],
    ],
  },
  automatizaciones: {
    tone: "black", heroTheme: "black",
    title: ["Menos tareas", "repetidas.", '<span class="accent">Más tiempo útil.</span>'],
    lead: "Identificamos tareas manuales que se repiten todos los días y las resolvemos con herramientas que ya usás o que conviene sumar.",
    desc: "Automatización de tareas repetitivas para empresas: pedidos, avisos, reportes y flujos de trabajo.",
    problem: "Copiar datos de un email a una planilla, mandar el mismo aviso diez veces, armar un reporte a mano cada lunes: <em>son tareas necesarias, pero no deberían ocupar a una persona</em>.",
    includes: [
      ["Relevamiento de procesos", "Detectamos qué tareas se repiten, cuánto tiempo llevan y dónde aparecen errores."],
      ["Diseño del flujo", "Definimos qué dispara cada automatización, qué pasos sigue y quién se entera."],
      ["Implementación y pruebas", "Construimos el flujo con datos reales y lo probamos antes de dejarlo en uso."],
      ["Documentación y ajuste", "Dejamos explicado cómo funciona y lo ajustamos en las primeras semanas."],
    ],
    examples: [
      ["Pedidos sin carga manual", "Pedidos que llegan por formulario y se registran solos en una planilla o sistema."],
      ["Recordatorios automáticos", "Avisos de turnos, vencimientos o renovaciones que salen en el momento justo."],
      ["Reportes periódicos", "Resúmenes semanales que se generan y se envían sin intervención."],
      ["Respuestas iniciales", "Primeras respuestas a consultas frecuentes mientras el equipo atiende lo demás."],
    ],
    steps: [["Mapeo", "Seguimos la tarea paso a paso como se hace hoy."], ["Propuesta", "Qué se automatiza, con qué herramienta y qué costo tiene."], ["Implementación", "Construcción, pruebas y avisos ante errores."], ["Seguimiento", "Revisión en uso real y ajustes."]],
    faq: [
      ["¿Tengo que cambiar los programas que uso?", "No necesariamente. Primero vemos qué se puede automatizar con lo que ya tenés."],
      ["¿Qué pasa si algo falla?", "Diseñamos cada flujo con avisos ante errores y te explicamos cómo revisarlo."],
      ["¿Es solo para empresas grandes?", "No. En equipos chicos, donde cada hora cuenta, una automatización simple suele notarse rápido."],
      ["¿Quién mantiene la automatización?", "Te dejamos documentación y acordamos cómo acompañarte después de la entrega."],
    ],
  },
  integraciones: {
    tone: "ivory", heroTheme: "ivory",
    title: ["Tus herramientas,", "hablando", "entre sí."],
    lead: "Conectamos los sistemas que ya usás para que la información viaje sola y no haya que cargarla dos veces.",
    desc: "Integración de sistemas para empresas: tienda online, gestión, facturación, CRM y reportes conectados.",
    problem: "Cuando cada sistema funciona por separado, <em>los mismos datos se cargan varias veces</em> y aparecen diferencias entre lo que dice la tienda, la planilla y la facturación.",
    includes: [
      ["Diagnóstico de sistemas", "Revisamos qué herramientas usás, qué datos maneja cada una y cómo se pueden conectar."],
      ["Conexión", "Integramos mediante las conexiones que ofrece cada sistema o con herramientas de integración."],
      ["Reglas de sincronización", "Definimos qué dato manda en cada caso, con qué frecuencia viaja y qué pasa ante diferencias."],
      ["Monitoreo y documentación", "Dejamos registro de cada conexión y avisos para detectar problemas a tiempo."],
    ],
    examples: [
      ["Tienda y stock", "La tienda online toma el stock del sistema de gestión y cada venta vuelve a registrarse."],
      ["Formulario y CRM", "Cada consulta web crea un contacto con su origen y su estado."],
      ["Venta y facturación", "La factura se emite a partir de la venta, sin volver a tipear datos."],
      ["Reporte unificado", "Datos de varias fuentes reunidos en un solo tablero o planilla."],
    ],
    steps: [["Diagnóstico", "Sistemas, datos y posibilidades de conexión."], ["Diseño", "Flujo de datos y reglas acordadas."], ["Integración", "Implementación en un entorno de prueba y luego en uso real."], ["Control", "Monitoreo, documentación y ajustes."]],
    faq: [
      ["¿Cualquier sistema se puede integrar?", "No siempre. Depende de si el sistema permite conectarse, por ejemplo mediante una API. Lo verificamos antes de proponer una solución."],
      ["¿Es seguro?", "Usamos accesos con los permisos mínimos necesarios y documentamos qué datos viajan y hacia dónde."],
      ["¿Qué pasa si cambio de sistema?", "La integración se puede ajustar. Te explicamos qué partes dependen de cada herramienta."],
      ["¿Las herramientas tienen costo?", "Algunas herramientas de integración tienen suscripción propia. Te lo indicamos antes de empezar, con alternativas."],
    ],
  },
  "identidad-digital": {
    tone: "blue", heroTheme: "blue",
    title: ["Una marca", "que se reconoce", "en todos lados."],
    lead: "Creamos o actualizamos tu identidad visual y diseñamos las piezas que la llevan a redes, web y otros puntos de contacto.",
    desc: "Identidad visual y diseño de material para redes y otros puntos de contacto, con un sistema coherente.",
    problem: "Un logo distinto en cada lugar, colores que cambian según quién diseñe, publicaciones armadas a último momento: <em>la marca pierde fuerza cuando no hay un sistema</em>.",
    includes: [
      ["Identidad visual", "Logo, paleta de colores y tipografías pensadas para usarse en pantalla e impresión."],
      ["Manual de uso", "Reglas simples para aplicar la marca sin depender de un diseñador."],
      ["Plantillas para redes", "Formatos editables para publicar con frecuencia y mantener la coherencia."],
      ["Otros puntos de contacto", "Presentaciones, cartelería, firmas de email y lo que tu marca necesite."],
    ],
    examples: [
      ["Marca nueva", "Para un emprendimiento que necesita presentarse con claridad desde el inicio."],
      ["Actualización", "Una identidad existente modernizada sin perder lo que la gente ya reconoce."],
      ["Sistema para redes", "Plantillas y criterios para publicar seguido sin improvisar cada pieza."],
      ["Material comercial", "Presentaciones e impresos coherentes con el resto de la marca."],
    ],
    steps: [["Diagnóstico", "Qué existe, qué funciona y qué falta."], ["Concepto", "Dirección visual y primeras aplicaciones."], ["Sistema", "Desarrollo de piezas, reglas y plantillas."], ["Entrega", "Archivos ordenados y guía de uso."]],
    faq: [
      ["¿Hacen solo el logo?", "Podemos, pero recomendamos al menos definir colores, tipografías y reglas básicas para que el logo funcione en todos lados."],
      ["¿Puedo editar las plantillas?", "Sí. Las entregamos en herramientas que tu equipo pueda usar, como Canva o Figma, según prefieras."],
      ["¿Gestionan las redes sociales?", "Nos enfocamos en el sistema visual y las piezas. Si necesitás gestión de redes, te orientamos sobre cómo organizarla."],
      ["¿Cuántas instancias de revisión hay?", "Trabajamos por etapas, con revisiones acordadas al inicio para avanzar con decisiones claras."],
    ],
  },
};

function svcDemo(slug) {
  if (slug === "automatizaciones") {
    const stages = [
      ["Pedido recibido", "Llega un pedido", "Un cliente completa el formulario de tu web."],
      ["Datos revisados", "Se revisan los datos", "Se controla que estén completos y se ordenan."],
      ["Registrado", "Se registra", "El pedido queda cargado en tu planilla o sistema."],
      ["Aviso enviado", "Se avisa", "El cliente recibe la confirmación y tu equipo, el aviso."],
    ];
    return `<section class="section theme-black auto" data-theme="black" aria-labelledby="demo-t">
  <div class="wrap">
    <div class="sec-head" style="margin-bottom:0">
      <div><p class="eyebrow" data-reveal="fade">Cómo se ve</p>${lines(["Una tarea,", "de punta a punta."], "h2", "h2").replace("<h2 ", '<h2 id="demo-t" style="margin-top:20px" ')}</div>
      <p class="muted" style="max-width:34ch">Ejemplo ilustrativo. Cada flujo se diseña según tu operación y las herramientas que usás.</p>
    </div>
    <div class="auto__track">
      <div class="auto__rail" aria-hidden="true"></div><div class="auto__fill" aria-hidden="true"></div>
      <div class="auto__task" aria-hidden="true"><span class="auto__task-dot">01</span><span class="auto__task-label">Pedido recibido</span></div>
      ${stages.map(([lab, t, d], i) => `<div class="auto__stage${i === 0 ? " is-done" : ""}" data-label="${lab}"><span class="num">0${i + 1}</span><h3>${t}</h3><p class="muted">${d}</p><span class="auto__state"><span class="s-wait">Pendiente</span><span class="s-done">Listo</span></span></div>`).join("")}
    </div>
  </div>
</section>`;
  }
  if (slug === "integraciones") {
    const N = [
      { id: "form", x: 30, y: 222, w: 220, k: "Entrada", t: "Formulario web", desc: "Formulario web: es donde entra el pedido. Sus datos viajan al sistema de gestión sin volver a cargarse." },
      { id: "hub", x: 380, y: 212, w: 250, h: 96, k: "Centro", t: "Sistema de gestión", desc: "Sistema de gestión: recibe el pedido y reparte la información a facturación, reportes y avisos." },
      { id: "fact", x: 750, y: 50, w: 220, k: "Salida", t: "Facturación", desc: "Facturación: la factura se genera con los datos de la venta, sin tipearlos de nuevo." },
      { id: "sheet", x: 750, y: 222, w: 220, k: "Salida", t: "Planilla de reportes", desc: "Planilla de reportes: cada venta se suma al resumen que usa el equipo." },
      { id: "mail", x: 750, y: 394, w: 220, k: "Salida", t: "Email al cliente", desc: "Email al cliente: la confirmación sale automáticamente cuando el pedido queda registrado." },
    ];
    const node = (n) => {
      const h = n.h || 76;
      return `<g class="integ__node${n.id === "hub" ? " integ__hub" : ""}" data-node="${n.id}" data-desc="${n.desc}" tabindex="0" role="button" aria-describedby="nd-${n.id}"><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${h}" rx="${h / 2}"/><text><tspan class="k" x="${n.x + 28}" y="${n.y + h / 2 - 8}">${n.k.toUpperCase()}</tspan> <tspan x="${n.x + 28}" y="${n.y + h / 2 + 16}">${n.t}</tspan></text></g>`;
    };
    return `<section class="section theme-black" data-theme="black" aria-labelledby="demo-t">
  <div class="wrap integ" data-route="p1,p2,p3,p4">
    <div class="sec-head">
      <div><p class="eyebrow" data-reveal="fade">Cómo se ve</p>${lines(["Un dato,", "un solo viaje."], "h2", "h2").replace("<h2 ", '<h2 id="demo-t" style="margin-top:20px" ')}</div>
      <p class="muted" style="max-width:34ch">Ejemplo ilustrativo. Pasá el cursor o navegá con el teclado por cada herramienta para ver qué hace.</p>
    </div>
    <div class="integ__scroll" tabindex="-1">
    <svg class="integ__svg" viewBox="0 0 1000 520" role="group" aria-label="Diagrama: un pedido viaja del formulario web al sistema de gestión, y de ahí a facturación, reportes y email al cliente">
      <path class="integ__path" id="p1" data-from="form" data-to="hub" d="M250 260C310 260 320 260 380 260"/>
      <path class="integ__path" id="p2" data-from="hub" data-to="fact" d="M630 260C700 260 680 88 750 88"/>
      <path class="integ__path" id="p3" data-from="hub" data-to="sheet" d="M630 260C690 260 690 260 750 260"/>
      <path class="integ__path" id="p4" data-from="hub" data-to="mail" d="M630 260C700 260 680 432 750 432"/>
      <circle class="integ__signal" r="7" cx="250" cy="260" aria-hidden="true"/>
      ${N.map(node).join("")}
    </svg>
    </div>
    <p class="integ__hint num">Deslizá para ver el diagrama completo →</p>
    <div class="sr-only">${N.map((n) => `<span id="nd-${n.id}">${n.desc.split(": ").slice(1).join(": ")}</span>`).join("")}</div>
    <p class="integ__caption lead" aria-live="polite" data-default="Cada herramienta cumple un rol. Pasá el cursor o navegá con el teclado por el diagrama para ver cuál.">Cada herramienta cumple un rol. Pasá el cursor o navegá con el teclado por el diagrama para ver cuál.</p>
    <ol class="integ__flow">
      <li>Un pedido entra por el formulario web.</li>
      <li>El sistema de gestión genera la factura.</li>
      <li>La venta se suma al reporte del equipo.</li>
      <li>El cliente recibe la confirmación.</li>
    </ol>
  </div>
</section>`;
  }
  if (slug === "identidad-digital") {
    return `<section class="section theme-ivory ident" data-theme="ivory" aria-labelledby="demo-t">
  <div class="wrap">
    <div class="sec-head">
      <div><p class="eyebrow" data-reveal="fade">Cómo se ve</p>${lines(["De piezas sueltas", "a un sistema."], "h2", "h2").replace("<h2 ", '<h2 id="demo-t" style="margin-top:20px" ')}</div>
      <p class="muted" style="max-width:34ch">Ejemplo con una marca ficticia, “Almacén Norte”. Al avanzar, cada pieza encuentra su lugar dentro del mismo sistema.</p>
    </div>
    <div class="ident__board" role="img" aria-label="Sistema visual de ejemplo: logo, paleta, tipografía, publicación para redes, tarjeta, cartel y perfil en redes de una marca ficticia">
      <div class="piece pc-logo" style="--dx:-120;--dy:80;--rot:-9deg"><span class="w">Almacén<br>Norte</span><span class="piece__label">Logo</span></div>
      <div class="piece pc-palette" style="--dx:60;--dy:140;--rot:7deg"><i></i><i></i><i></i></div>
      <div class="piece pc-type" style="--dx:180;--dy:-40;--rot:10deg"><span class="aa">Aa</span><span class="piece__label" style="position:static">Tipografía</span></div>
      <div class="piece pc-post" style="--dx:-60;--dy:-120;--rot:6deg"><span class="piece__label" style="position:static">Publicación</span><strong>Pan de masa madre, todos los jueves.</strong></div>
      <div class="piece pc-card" style="--dx:140;--dy:110;--rot:-12deg"><strong>Almacén Norte</strong><span class="piece__label" style="position:static">Tarjeta</span></div>
      <div class="piece pc-sign" style="--dx:-160;--dy:60;--rot:-5deg"><i></i>Almacén Norte</div>
      <div class="piece pc-avatar" style="--dx:120;--dy:-90;--rot:14deg"><span class="av"><i></i></span><span class="piece__label" style="position:static">Perfil en redes</span></div>
    </div>
  </div>
</section>`;
  }
  return "";
}

function websHeroStage() {
  const frame = (cls, depth, label, img, mobile = false) => `
  <div class="webs-layer ${cls}" data-depth="${depth}">
    <div class="frame${mobile ? " frame--mobile" : ""}">
      ${mobile ? "" : `<div class="frame__bar"><i></i><i></i><i></i><b>${label}</b></div>`}
      <div class="frame__body">
        <div class="frame__img" style="background-image:url(/assets/img/${img}.webp)"></div>
        <div class="frame__h"></div><div class="frame__p"></div><div class="frame__p"></div><div class="frame__btn"></div>
      </div>
    </div>
  </div>`;
  return `<div class="webs-stage" role="img" aria-label="Previews ilustrativas de un sitio web en computadora y celular">
  ${frame("webs-layer--1", 0.6, "inicio", "arq-voladizo")}
  ${frame("webs-layer--2", 1, "servicios", "arq-esquina")}
  ${frame("webs-layer--3", 1.6, "", "arq-escalera-curva", true)}
</div>`;
}

for (const s of SERVICES) {
  const d = SVC_PAGES[s.slug];
  const idx = SERVICES.indexOf(s);
  const next = SERVICES[(idx + 1) % SERVICES.length];
  const heroBtn = d.heroTheme === "black" ? "btn--ivory" : "";
  const isWebs = s.slug === "webs";
  const problemTheme = d.heroTheme === "ivory" ? "blue" : "ivory";
  const body = `
<section class="page-hero theme-${d.heroTheme}" data-theme="${d.heroTheme}" aria-labelledby="t">
  ${d.heroTheme === "blue" ? liveShape("drop", "svc-hero__live svc-hero__live--onblue", "color:var(--black)", 7) : liveShape(idx % 2 ? "orb" : "drop", "svc-hero__live", "color:var(--blue)", 7)}
  <div class="wrap page-hero__grid">
    <nav class="page-hero__eyebrow" aria-label="Ruta"><ol class="breadcrumb"><li><a href="/servicios">Servicios</a></li><li aria-current="page">${s.n} ${s.name}</li></ol></nav>
    ${lines(d.title, "h1", "h1 svc-hero__title").replace("<h1 ", '<h1 id="t" ')}
    <div class="page-hero__aside svc-hero__aside" data-reveal="rise" style="--delay:380ms">
      <p class="lead">${d.lead}</p>
      <a class="btn ${heroBtn}" href="/contacto?servicio=${s.slug}">Consultar por ${s.name.toLowerCase()} ${ARROW}</a>
    </div>
  </div>
  ${isWebs ? `<div class="wrap" style="margin-top:clamp(48px,7vw,96px)">${websHeroStage()}</div>` : ""}
</section>
<section class="section section--tight theme-${problemTheme}" data-theme="${problemTheme}" aria-labelledby="problema">
  <div class="wrap problem">
    <h2 id="problema" class="eyebrow problem__label" style="font-weight:400;letter-spacing:.08em;line-height:1.4">Qué resuelve</h2>
    <p class="problem__text" data-reveal="clip">${d.problem}</p>
  </div>
</section>
${svcDemo(s.slug)}
<section class="section theme-ivory" data-theme="ivory" aria-labelledby="incluye">
  <div class="wrap">
    <div class="sec-head"><div><p class="eyebrow" data-reveal="fade">Qué incluye</p>${lines(["Lo que", "hacemos."], "h2", "h2").replace("<h2 ", '<h2 id="incluye" style="margin-top:20px" ')}</div></div>
    <ul class="includes">
      ${d.includes.map(([t, x], i) => `<li data-reveal="rise" style="--delay:${(i % 2) * 100}ms"><span class="num accent">0${i + 1}</span><h3>${t}</h3><p class="muted">${x}</p></li>`).join("\n      ")}
    </ul>
  </div>
</section>
<section class="section theme-ivory" data-theme="ivory" aria-labelledby="ejemplos" style="padding-top:0">
  <div class="wrap split">
    <div class="split__head split__head--sticky"><p class="eyebrow" data-reveal="fade">Ejemplos de aplicación</p><h2 id="ejemplos" class="h3" style="margin-top:20px" data-reveal="rise">Situaciones en las que suele aplicarse.</h2></div>
    <ol class="split__body examples">
      ${d.examples.map(([t, x]) => `<li data-reveal="fade"><strong>${t}</strong><p class="muted">${x}</p></li>`).join("\n      ")}
    </ol>
  </div>
</section>
<section class="section theme-blue" data-theme="blue" aria-labelledby="como">
  <div class="wrap">
    <div class="sec-head"><div><p class="eyebrow" data-reveal="fade">Cómo trabajamos</p>${lines(["Paso", "a paso."], "h2", "h2").replace("<h2 ", '<h2 id="como" style="margin-top:20px" ')}</div><a class="link-arrow" href="/nosotros">Nuestro proceso ${arrowIcon()}</a></div>
    <ol class="steps-inline">
      ${d.steps.map(([t, x], i) => `<li data-reveal="rise" style="--delay:${i * 110}ms"><span class="num">0${i + 1}</span><h3>${t}</h3><p class="muted">${x}</p></li>`).join("\n      ")}
    </ol>
  </div>
</section>
<section class="section theme-ivory" data-theme="ivory" aria-labelledby="faq">
  <div class="wrap split">
    <div class="split__head"><p class="eyebrow" data-reveal="fade">Preguntas frecuentes</p><h2 id="faq" class="h2" style="margin-top:20px" data-reveal="rise">Dudas habituales.</h2></div>
    <div class="split__body faq">
      ${d.faq.map(([q, a]) => `<details><summary>${q}<span class="faq__icon" aria-hidden="true"></span></summary><div class="faq__a"><p class="muted">${a}</p></div></details>`).join("\n      ")}
    </div>
  </div>
</section>
${closing({ theme: "black", size: "h1", title: ["Hablemos de", s.name.toLowerCase() + "."], text: `Contanos qué necesitás y te decimos cómo lo encararíamos. ¿Te interesa otro frente? Seguí por <a href="/servicios/${next.slug}">${next.name}</a>.`, href: `/contacto?servicio=${s.slug}` })}
`;
  write(`/servicios/${s.slug}`, page({ path: `/servicios/${s.slug}`, title: s.name, active: "servicios/" + s.slug, tone: d.tone, desc: d.desc, body }));
}

/* =========================================================
   PROYECTOS
   ========================================================= */
write("/proyectos", page({
  path: "/proyectos", title: "Proyectos", active: "proyectos", tone: "black",
  desc: "Proyectos conceptuales de KROMA: ejemplos de cómo abordamos webs, automatizaciones, integraciones e identidad digital.",
  body: `
<section class="page-hero theme-black" data-theme="black" aria-labelledby="t">
  ${liveShape("orb", "proj-hero__live", "color:var(--blue)", 7)}
  <div class="wrap page-hero__grid">
    <p class="eyebrow page-hero__eyebrow" data-reveal="fade">Proyectos</p>
    ${lines(["Casos", "de ejemplo."], "h1", "display").replace("<h1 ", '<h1 id="t" ').replace('class="lines display"', 'class="lines display page-hero__title"')}
    <div class="page-hero__aside" data-reveal="rise" style="--delay:300ms">
      <span class="tag-concept">Conceptos</span>
      <p class="muted">Estos proyectos son conceptos: muestran cómo abordaríamos necesidades frecuentes. No corresponden a clientes reales y no presentan resultados.</p>
    </div>
  </div>
</section>
<section class="section theme-black stack-section" data-theme="black" aria-label="Lista de proyectos" style="padding-top:0">
  <div class="wrap">
    <div class="pfilter" role="group" aria-label="Filtrar por servicio" data-reveal="fade">
      <button type="button" class="pfilter__chip" aria-pressed="true" data-filter="all">Todos <span>${String(PROJECTS.length).padStart(2, "0")}</span></button>
      ${SERVICES.map((s) => `<button type="button" class="pfilter__chip" aria-pressed="false" data-filter="${s.slug}"><span class="pfilter__ico">${ICONS[s.slug]}</span>${s.name} <span>${String(PROJECTS.filter((p) => p.service === s.slug).length).padStart(2, "0")}</span></button>`).join("")}
      <p class="pfilter__status num" aria-live="polite"><span data-count>${String(PROJECTS.length).padStart(2, "0")}</span> conceptos</p>
    </div>
    <ol class="stack">
      ${PROJECTS.map((pr, i) => `<li class="stack__item" data-service="${pr.service}" style="--i:${i}">
        <article class="pcard pcard--${["blue", "ivory", "ink", "sand"][i % 4]}" aria-labelledby="pc-${i}">
          <div class="pcard__media">
            <div class="pcard__para"><picture><source srcset="/assets/img/${pr.img}-900.webp 900w, /assets/img/${pr.img}.webp 1536w" sizes="(max-width: 920px) 100vw, 56vw" type="image/webp"><img src="/assets/img/${pr.img}.jpg" srcset="/assets/img/${pr.img}-900.jpg 900w, /assets/img/${pr.img}.jpg 1536w" sizes="(max-width: 920px) 100vw, 56vw" alt="" width="1536" height="1024" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture></div>
            <span class="pcard__index" aria-hidden="true">${String(i + 1).padStart(2, "0")}<small>/${String(PROJECTS.length).padStart(2, "0")}</small></span>
          </div>
          <div class="pcard__body">
            <div class="pcard__meta"><span class="tag-concept">Concepto</span><span class="pcard__svc"><span class="pcard__svc-ico">${ICONS[pr.service]}</span>${pr.serviceName}</span></div>
            <h2 class="pcard__title" id="pc-${i}">${pr.title}</h2>
            <p class="pcard__need">${pr.need}</p>
            <p class="sr-only">Entregables:</p><ul class="pcard__deliv">${pr.deliverables.map((d) => `<li>${d}</li>`).join("")}</ul>
            <a class="btn pcard__cta" href="/proyectos/${pr.slug}">Ver caso<span class="sr-only">: ${pr.title}</span> ${ARROW}</a>
          </div>
        </article>
      </li>`).join("\n      ")}
    </ol>
    <p class="pfilter__empty" hidden>No hay conceptos para este servicio todavía.</p>
  </div>
</section>
${closing({ theme: "blue", title: ["¿Tu caso", "es el próximo?"], text: "Cuando publiquemos proyectos realizados, van a estar acá. Mientras tanto, contanos el tuyo." })}
`,
}));

PROJECTS.forEach((pr, i) => {
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  write(`/proyectos/${pr.slug}`, page({
    path: `/proyectos/${pr.slug}`, title: pr.title, active: "proyectos", tone: "ivory",
    desc: `Proyecto conceptual de KROMA: ${pr.title.toLowerCase()}.`,
    body: `
<section class="page-hero theme-ivory case-hero" data-theme="ivory" aria-labelledby="t" style="padding-bottom:0">
  ${liveShape("orb", "case-hero__live", "color:var(--blue)", 7)}
  <div class="wrap page-hero__grid">
    <nav class="page-hero__eyebrow" aria-label="Ruta"><ol class="breadcrumb"><li><a href="/proyectos">Proyectos</a></li><li aria-current="page">Concepto</li></ol></nav>
    ${lines([pr.title], "h1", "h1 page-hero__title").replace("<h1 ", '<h1 id="t" ')}
    <div class="page-hero__aside case-hero__aside" data-reveal="rise" style="--delay:300ms">
      <span class="tag-concept">Concepto</span>
      <p class="muted">Servicio: <a href="/servicios/${pr.service}">${pr.serviceName}</a></p>
    </div>
  </div>
  <div class="wrap case-hero__media" data-reveal="wipe">
    <div class="proj__media"><div class="proj__para" data-parallax="0.06"><picture><source srcset="/assets/img/${pr.img}-900.webp 900w, /assets/img/${pr.img}.webp 1536w" sizes="(max-width: 920px) 100vw, 60vw" type="image/webp"><img src="/assets/img/${pr.img}.jpg" srcset="/assets/img/${pr.img}-900.jpg 900w, /assets/img/${pr.img}.jpg 1536w" sizes="(max-width: 920px) 100vw, 60vw" alt="" width="1800" height="1200" decoding="async" fetchpriority="high"></picture></div></div>
  </div>
</section>
<section class="section theme-ivory" data-theme="ivory" aria-label="Detalle del caso">
  <div class="wrap case-body">
    <div class="case-notice"><strong>Proyecto conceptual.</strong><span>Es un ejemplo de cómo abordaríamos esta necesidad. No corresponde a un cliente real ni fue implementado.</span></div>
    <div class="case-row" data-reveal="rise"><h2>Contexto</h2><div><p class="lead">${pr.context}</p></div></div>
    <div class="case-row" data-reveal="rise"><h2>Necesidad</h2><div><p class="lead">${pr.need}</p></div></div>
    <div class="case-row" data-reveal="rise"><h2>Solución</h2><div><p class="lead">${pr.solution}</p></div></div>
    <div class="case-row" data-reveal="rise"><h2>Entregables</h2><div><ul>${pr.deliverables.map((x) => `<li>${x}</li>`).join("")}</ul></div></div>
    <div class="case-row" data-reveal="rise"><h2>Resultado</h2><div><p class="muted">No aplica: al ser un concepto, no hay resultados documentados para informar.</p></div></div>
  </div>
</section>
<section class="section section--tight theme-black" data-theme="black" aria-label="Siguiente proyecto">
  <div class="wrap case-next">
    <div><p class="eyebrow">Siguiente concepto</p><p class="h3" style="margin-top:14px;font-weight:800;max-width:22ch">${next.title}</p></div>
    <a class="btn btn--ivory" href="/proyectos/${next.slug}">Ver caso ${ARROW}</a>
  </div>
</section>
${closing({ theme: "blue", title: ["¿Algo", "parecido?"], text: "Si tu empresa tiene una necesidad similar, contanos y lo vemos.", href: `/contacto?servicio=${pr.service}` })}
`,
  }));
});

/* =========================================================
   CONTACTO
   ========================================================= */
write("/contacto", page({
  path: "/contacto", title: "Hablemos", active: "contacto", tone: "ivory",
  desc: "Contale a KROMA qué querés mejorar en tu empresa: webs, automatizaciones, integraciones o identidad digital.",
  body: `
<section class="page-hero theme-ivory contact-hero" data-theme="ivory" aria-labelledby="t">
  ${liveShape("drop", "contact-hero__live", "color:var(--blue)", 7)}
  <div class="wrap contact">
    <div class="contact__intro">
      <p class="eyebrow" data-reveal="fade">Hablemos</p>
      ${lines(["Contanos", "en qué estás."], "h1", "h1").replace("<h1 ", '<h1 id="t" ')}
      <p class="lead" data-reveal="rise" style="--delay:300ms">Escribinos sobre tu empresa y lo que querés resolver. Con esa información preparamos la primera conversación.</p>
      <div data-reveal="rise" style="--delay:400ms">
        <p style="font-weight:700;margin-bottom:10px">Ayuda contarnos:</p>
        <ul class="muted" style="padding-left:1.1em;display:grid;gap:6px">
          <li>A qué se dedica tu empresa.</li>
          <li>Qué herramientas usan hoy.</li>
          <li>Qué te gustaría mejorar primero.</li>
        </ul>
      </div>
      <div class="contact__channels" data-reveal="rise" style="--delay:500ms">
        <p class="num">También podés escribirnos</p>
        ${socialIcons("social--contact")}
      </div>
    </div>
    <div class="contact__form-wrap" data-reveal="rise" style="--delay:200ms">
      <form class="form" id="contact-form" action="${FORM_ENDPOINT.replace("/ajax", "")}" method="post" data-endpoint="${FORM_ENDPOINT}" novalidate aria-describedby="form-note">
        <div class="field">
          <label for="f-nombre">Nombre</label>
          <div class="field__control"><input id="f-nombre" name="nombre" type="text" autocomplete="name" required aria-describedby="e-nombre"></div>
          <p class="field__error" id="e-nombre" aria-live="polite"></p>
        </div>
        <div class="field">
          <label for="f-contacto">Email o teléfono</label>
          <span class="hint" id="h-contacto">Usamos este dato solo para responderte.</span>
          <div class="field__control"><input id="f-contacto" name="contacto" type="text" autocomplete="email" inputmode="email" required aria-describedby="h-contacto e-contacto"></div>
          <p class="field__error" id="e-contacto" aria-live="polite"></p>
        </div>
        <div class="field">
          <label for="f-servicio">Servicio de interés</label>
          <div class="field__control"><select id="f-servicio" name="servicio" required aria-describedby="e-servicio">
            <option value="">Elegí una opción</option>
            ${SERVICES.map((s) => `<option value="${s.slug}">${s.name}</option>`).join("")}
            <option value="no-se">Todavía no sé</option>
          </select></div>
          <p class="field__error" id="e-servicio" aria-live="polite"></p>
        </div>
        <div class="field">
          <label for="f-mensaje">Mensaje</label>
          <div class="field__control"><textarea id="f-mensaje" name="mensaje" rows="5" required aria-describedby="e-mensaje"></textarea></div>
          <p class="field__error" id="e-mensaje" aria-live="polite"></p>
        </div>
        <div class="hp" aria-hidden="true"><label for="f-hp">No completar</label><input id="f-hp" name="_honey" type="text" tabindex="-1" autocomplete="off"></div>
        <div class="form__foot">
          <button class="btn" type="submit"><span class="btn__label">Enviar mensaje</span><svg class="spinner" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>${ARROW}</button>
          <p class="form__note" id="form-note">Todos los campos son obligatorios.</p>
        </div>
      </form>
      <div class="form-status form-status--ok" id="form-ok" tabindex="-1" role="status">
        <h2 class="h3">Recibimos tu mensaje.</h2>
        <p>Gracias por escribirnos. Te vamos a responder al dato de contacto que dejaste.</p>
      </div>
      <div class="form-status form-status--error" id="form-error" tabindex="-1" role="alert">
        <h2 class="h3">Tu mensaje no se envió.</h2>
        <p id="form-error-text"></p>
        <p><button class="btn btn--ivory" type="button" id="form-retry">Volver al formulario ${ARROW}</button></p>
      </div>
    </div>
  </div>
</section>
`,
}));

/* =========================================================
   404
   ========================================================= */
write("/404", page({
  path: "/404", title: "Página no encontrada", active: "", tone: "blue",
  desc: "La página que buscás no existe.",
  body: `
<section class="theme-blue" data-theme="blue" aria-labelledby="t">
  <div class="wrap nf">
    <p class="eyebrow">Error 404</p>
    <h1 id="t" class="display">Esta página<br>no existe.</h1>
    <p class="lead">Puede que el enlace haya cambiado. Volvé al inicio o escribinos.</p>
    <p style="display:flex;gap:16px;flex-wrap:wrap"><a class="btn" href="/">Ir al inicio ${ARROW}</a><a class="btn btn--ghost" href="/contacto">Hablemos</a></p>
  </div>
</section>`,
}));

// favicon
fs.writeFileSync(path.join(OUT, "assets/img/favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 ${parseFloat(ISO_VB.split(" ")[2]) + 16} ${parseFloat(ISO_VB.split(" ")[3]) + 16}"><path fill="#0053fd" d="${ISO_D}"/></svg>`);
console.log("ok");
