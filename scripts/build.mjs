// Uso: node scripts/build.mjs .   (desde la carpeta raíz del proyecto)
// Genera todas las páginas HTML estáticas de KROMA. Los textos y las páginas se editan acá.
// Sistema visual: "Digital Matter" con la paleta de KROMA (negro, cobalto y marfil).
import fs from "node:fs";
import path from "node:path";
import { PROJECT_ART } from "./art.mjs";

const OUT = process.argv[2] || ".";
const svgFile = fs.readFileSync(path.join(OUT, "assets/img/kroma-isotipo.svg"), "utf8");
const ISO_VB = svgFile.match(/viewBox="([^"]+)"/)[1];
const ISO_D = svgFile.match(/ d="([^"]+)"/)[1];

/* ---------------- datos generales ---------------- */
// Dominio público. Si se conecta un dominio propio, cambiarlo acá y volver a generar.
const SITE_URL = "https://kromalabs2.vercel.app";
const EMAIL = "somoskromauy@gmail.com";
const IG = "@_kromalabs";
const IG_URL = "https://www.instagram.com/_kromalabs/";
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${EMAIL}`;

/* ---------------- utilidades ---------------- */
const ARROW = `<svg class="ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const iso = (cls = "") => `<svg class="${cls}" viewBox="${ISO_VB}" aria-hidden="true"><use href="#iso"/></svg>`;
const br = (arr) => arr.join("<br>");
// Botón con flecha que se reemplaza al pasar el puntero
const btn = (href, label, cls = "") => `<a class="btn ${cls}" href="${href}"><span>${label}</span><span class="btn__ar" aria-hidden="true">${ARROW}${ARROW}</span></a>`;
const linkAr = (href, label) => `<a class="lk" href="${href}">${label} ${ARROW}</a>`;
const pad = (n) => String(n).padStart(2, "0");

const SERVICES = [
  { slug: "webs", n: "01", name: "Webs", short: "Sitios a medida, rápidos y pensados para convertir." },
  { slug: "automatizaciones", n: "02", name: "Automatizaciones", short: "Menos trabajo manual. Más tiempo para lo importante." },
  { slug: "integraciones", n: "03", name: "Integraciones", short: "Conectamos tus herramientas para que todo fluya." },
  { slug: "identidad-digital", n: "04", name: "Identidad digital", short: "Una presencia digital sólida y coherente con tu negocio." },
  { slug: "consultoria-tecnologica", n: "05", name: "Consultoría tecnológica", short: "Primero entendemos tu negocio. Después elegimos la tecnología." },
];

const PROJECTS = [
  {
    slug: "web-estudio-profesional", service: "webs", serviceName: "Webs",
    title: "Web para un estudio profesional",
    context: "Un estudio contable con una cartera estable de clientes. Su web actual fue armada hace años y casi no se actualiza.",
    need: "Las consultas llegan por teléfono y suelen repetirse: horarios, documentación necesaria, servicios. El estudio quiere que la web responda lo básico y que los contactos nuevos lleguen con la información ordenada.",
    solution: "Un sitio breve y claro, con los servicios explicados en lenguaje simple, una sección de preguntas frecuentes y un formulario que pide los datos necesarios según el tipo de consulta.",
    deliverables: ["Arquitectura de contenidos", "Diseño responsive de cinco páginas", "Formulario con campos según el tipo de consulta", "Guía breve para actualizar textos"],
  },
  {
    slug: "automatizacion-pedidos", service: "automatizaciones", serviceName: "Automatizaciones",
    title: "Automatización de pedidos para una distribuidora",
    context: "Una distribuidora que recibe pedidos de comercios por email y WhatsApp, y los carga a mano en una planilla.",
    need: "Reducir el tiempo de carga y los errores de transcripción, y avisarle al cliente cuando su pedido quedó registrado.",
    solution: "Un formulario de pedido para clientes frecuentes. Cada envío se valida, se registra en la planilla compartida y dispara dos avisos: la confirmación al cliente y la notificación al depósito.",
    deliverables: ["Mapa del proceso actual y del propuesto", "Formulario de pedido", "Flujo automatizado con avisos", "Documentación y alerta ante errores"],
  },
  {
    slug: "integracion-tienda-stock", service: "integraciones", serviceName: "Integraciones",
    title: "Integración entre tienda online y stock",
    context: "Un comercio con local físico y tienda online, que maneja el stock en su sistema de gestión.",
    need: "Evitar ventas de productos sin stock y dejar de actualizar cantidades a mano en dos lugares.",
    solution: "Una integración que sincroniza el stock del sistema de gestión con la tienda online y registra cada venta web en el sistema, con un reporte diario de diferencias.",
    deliverables: ["Diagnóstico de ambos sistemas", "Reglas de sincronización", "Integración implementada y probada", "Reporte diario de control"],
  },
  {
    slug: "identidad-cafeteria", service: "identidad-digital", serviceName: "Identidad digital",
    title: "Identidad digital para una cafetería de barrio",
    context: "Una cafetería que abre su segundo local y comunica en redes con piezas armadas de forma improvisada.",
    need: "Tener una imagen reconocible y poder publicar con frecuencia sin depender de un diseñador para cada pieza.",
    solution: "Una actualización de la identidad visual con paleta, tipografías y reglas simples, más un set de plantillas editables para redes y cartelería del local.",
    deliverables: ["Identidad visual actualizada", "Manual de uso breve", "Plantillas editables para redes", "Piezas para cartelería y menú"],
  },
];

/* ---------------- SEO ---------------- */
const PAGES = [];
const clip = (t, n) => (t.length <= n ? t : t.slice(0, t.lastIndexOf(" ", n - 1)).replace(/[,.;:]$/, "") + "…");
const ORG_LD = {
  "@type": "ProfessionalService", "@id": SITE_URL + "/#kroma", name: "KROMA", url: SITE_URL + "/",
  description: "Consultoría tecnológica para empresas uruguayas: webs, automatizaciones, integraciones, identidad digital y consultoría tecnológica.",
  logo: SITE_URL + "/assets/img/logo-512.png", image: SITE_URL + "/assets/img/og-kroma.jpg",
  email: EMAIL, sameAs: [IG_URL], areaServed: { "@type": "Country", name: "Uruguay" },
  address: { "@type": "PostalAddress", addressLocality: "Montevideo", addressCountry: "UY" },
};
const crumbsLd = (items) => ({
  "@type": "BreadcrumbList",
  itemListElement: [["Inicio", "/"], ...items].map(([name, u], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE_URL + u })),
});

/* ---------------- layout ---------------- */
function head({ title, seo, desc, path: p, ld = [], home = false }) {
  const full = p === "/" ? "KROMA — Consultoría tecnológica para empresas en Uruguay" : `${seo || title} — KROMA`;
  const url = SITE_URL + (p === "/" ? "/" : p);
  const is404 = p === "/404";
  const graph = is404 ? [] : [ORG_LD, ...ld];
  return `<!DOCTYPE html>
<html lang="es-UY">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${full}</title>
<meta name="description" content="${desc}">${is404 ? '\n<meta name="robots" content="noindex">' : `\n<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#070708">
<meta property="og:type" content="website">${is404 ? "" : `\n<meta property="og:url" content="${url}">`}
<meta property="og:title" content="${full}">
<meta property="og:description" content="${desc}">
<meta property="og:locale" content="es_UY">
<meta property="og:site_name" content="KROMA">
<meta property="og:image" content="${SITE_URL}/assets/img/og-kroma.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">${graph.length ? `\n<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>` : ""}
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/img/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/host-grotesk.woff2" as="font" type="font/woff2" crossorigin>${home ? `\n<link rel="preload" href="/assets/img/form/hero.webp" as="image" type="image/webp" media="(min-width: 761px) and (min-aspect-ratio: 9/10)" fetchpriority="high">\n<link rel="preload" href="/assets/img/form/hero-m.webp" as="image" type="image/webp" media="(max-width: 760px), (max-aspect-ratio: 9/10)" fetchpriority="high">` : ""}
<link rel="stylesheet" href="/assets/css/site.css">
<script>(function(d){var h=d.documentElement,rm=matchMedia("(prefers-reduced-motion: reduce)").matches;h.classList.add("js",rm?"rm":"anim");try{if(sessionStorage.getItem("kroma-transition")){sessionStorage.removeItem("kroma-transition");if(!rm)h.classList.add("is-entering")}}catch(e){}setTimeout(function(){if(!window.KROMA_READY)h.classList.remove("anim","is-entering")},3000)})(document);</script>
<script src="/assets/js/vendor/gsap.min.js" defer></script>
<script src="/assets/js/vendor/ScrollTrigger.min.js" defer></script>
<script src="/assets/js/vendor/SplitText.min.js" defer></script>
<script src="/assets/js/site.js" defer></script>${home ? `\n<script type="importmap">{"imports":{"three":"/assets/js/vendor/three.module.min.js"}}</script>\n<script type="module" src="/assets/js/home.js"></script>\n<link rel="modulepreload" href="/assets/js/home.js">` : ""}
<script type="speculationrules">{"prefetch":[{"source":"document","where":{"href_matches":"/*"},"eagerness":"moderate"}]}</script>
</head>`;
}

const sprite = `<svg class="sprite" width="0" height="0" aria-hidden="true" focusable="false"><defs><symbol id="iso" viewBox="${ISO_VB}"><path fill="currentColor" d="${ISO_D}"/></symbol></defs></svg>`;

function header(active) {
  const cur = (k) => (active === k ? ' aria-current="page"' : "");
  const inSvc = active.startsWith("servicios");
  return `
<a class="skip" href="#contenido">Saltar al contenido</a>
<header class="hd" id="hd">
  <div class="hd__in">
    <a class="hd__brand" href="/" aria-label="KROMA, inicio">${iso("hd__iso")}<span aria-hidden="true">KROMA<sup>®</sup></span></a>
    <span class="hd__tag mono" aria-hidden="true">Consultoría tecnológica</span>
    <nav class="hd__nav" aria-label="Principal">
      <ul>
        <li><a href="/"${cur("inicio")}>Inicio</a></li>
        <li><a href="/nosotros"${cur("nosotros")}>Nosotros</a></li>
        <li class="hd__sub${inSvc ? " is-current" : ""}">
          <a href="/servicios"${cur("servicios")}>Servicios</a>
          <button class="hd__tg" type="button" aria-expanded="false" aria-controls="sub-servicios"><span class="sr">Mostrar servicios</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
          <div class="hd__drop" id="sub-servicios">
            <ul>${SERVICES.map((s) => `<li><a href="/servicios/${s.slug}"${cur("servicios/" + s.slug)}><span class="mono">${s.n}</span><span class="hd__dn">${s.name}</span><span class="hd__dd">${s.short}</span></a></li>`).join("")}</ul>
          </div>
        </li>
        <li><a href="/proyectos"${cur("proyectos")}>Proyectos</a></li>
      </ul>
    </nav>
    <a class="btn btn--sm hd__cta" href="/contacto"${cur("contacto")}><span>Hablemos</span><span class="btn__ar" aria-hidden="true">${ARROW}${ARROW}</span></a>
    <button class="hd__menu" type="button" aria-expanded="false" aria-controls="menu"><span>Menú</span><i aria-hidden="true"></i></button>
  </div>
</header>
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menú" hidden>
  <div class="menu__top"><span class="mono">KROMA® / Menú</span><button class="menu__close" type="button">Cerrar <i aria-hidden="true"></i></button></div>
  <nav aria-label="Menú móvil">
    <ul class="menu__main">
      <li><a href="/"${cur("inicio")}><span class="mono">01</span>Inicio</a></li>
      <li><a href="/nosotros"${cur("nosotros")}><span class="mono">02</span>Nosotros</a></li>
      <li><a href="/servicios"${cur("servicios")}><span class="mono">03</span>Servicios</a></li>
      <li><a href="/proyectos"${cur("proyectos")}><span class="mono">04</span>Proyectos</a></li>
      <li><a href="/contacto"${cur("contacto")}><span class="mono">05</span>Hablemos</a></li>
    </ul>
    <ul class="menu__svc">${SERVICES.map((s) => `<li><a href="/servicios/${s.slug}">${s.name}</a></li>`).join("")}</ul>
  </nav>
  <div class="menu__foot mono"><span>${EMAIL}</span><a href="${IG_URL}" target="_blank" rel="noopener">Instagram ${IG}</a><span>Montevideo — Uruguay</span></div>
</div>`;
}

const footer = `
<footer class="ft t-black">
  <div class="wrap ft__top">
    <div class="ft__brand">
      <a class="ft__logo" href="/" aria-label="KROMA, inicio">${iso("ft__iso")}<span aria-hidden="true">KROMA<sup>®</sup></span></a>
      <p>Consultoría tecnológica para empresas. Te ayudamos a elegir herramientas y aprovecharlas bien.</p>
    </div>
    <div class="ft__col"><h2 class="mono">Sitio</h2><ul><li><a href="/">Inicio</a></li><li><a href="/nosotros">Nosotros</a></li><li><a href="/proyectos">Proyectos</a></li><li><a href="/contacto">Hablemos</a></li></ul></div>
    <div class="ft__col"><h2 class="mono">Servicios</h2><ul>${SERVICES.map((s) => `<li><a href="/servicios/${s.slug}">${s.name}</a></li>`).join("")}</ul></div>
    <div class="ft__col"><h2 class="mono">Contacto</h2><ul><li><a href="/contacto">Formulario</a></li><li><span class="ft__mail">${EMAIL}</span></li><li><a href="${IG_URL}" target="_blank" rel="noopener">Instagram ${IG}<span class="sr"> (se abre en otra pestaña)</span></a></li></ul></div>
  </div>
  <div class="wrap ft__bottom mono"><span>© <span id="year">2026</span> KROMA</span><span>Montevideo — Uruguay</span><span>Hecho en Uruguay</span></div>
</footer>
<div class="curtain" aria-hidden="true"><div class="curtain__body"></div>${iso("curtain__mark")}</div>`;

function page({ path: p, title, seo, desc, active, body, ld, home = false }) {
  PAGES.push(p);
  return `${head({ title, seo, desc, path: p, ld, home })}
<body${home ? ' class="is-home"' : ""}>
${sprite}
${header(active)}
<main id="contenido" tabindex="-1">
${body}
</main>
${footer}
</body>
</html>
`;
}

function write(rel, html) {
  const file = rel === "/" ? "index.html" : rel === "/404" ? "404.html" : path.join(rel.slice(1), "index.html");
  const full = path.join(OUT, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n"));
}

/* ---------------- componentes ---------------- */
const crumb = (items) => `<nav class="crumb mono" aria-label="Ruta"><ol>${items.map(([n, u]) => (u ? `<li><a href="${u}">${n}</a></li>` : `<li aria-current="page">${n}</li>`)).join("")}</ol></nav>`;

// Filas editoriales de servicios: toda la fila es el enlace. Relleno cobalto direccional y vista previa de la forma.
function svcRows({ numbered = true } = {}) {
  return `<ul class="rows">
  ${SERVICES.map((s) => `<li class="row" data-pv="/assets/img/form/${s.slug}.webp">
    <a href="/servicios/${s.slug}">
      ${numbered ? `<span class="row__n mono">${s.n}</span>` : ""}
      <span class="row__nm">${s.name}</span>
      <span class="row__ds">${s.short}</span>
      <span class="row__go" aria-hidden="true">${ARROW}</span>
    </a>
  </li>`).join("\n  ")}
</ul>
<div class="row-pv" aria-hidden="true"><img src="/assets/img/form/webs.webp" alt="" width="480" height="360" loading="lazy" decoding="async"></div>`;
}

function projCard(pr, hTag = "h3") {
  return `<article class="pc">
  <a class="pc__a" href="/proyectos/${pr.slug}">
    <div class="pc__media"><div class="pc__para">${PROJECT_ART[pr.slug]}</div><span class="pc__cta">Ver caso ${ARROW}</span></div>
    <div class="pc__info"><${hTag} class="pc__t">${pr.title}</${hTag}><span class="pc__k mono">Concepto · ${pr.serviceName}</span></div>
  </a>
</article>`;
}

// Cierre de página: frase propia y el primer paso del contacto a mano.
// Es un formulario GET real hacia /contacto: funciona sin JavaScript y lleva lo escrito al campo Mensaje.
const EXAMPLES = {
  webs: "renovar la web de la empresa",
  automatizaciones: "dejar de cargar pedidos a mano",
  integraciones: "conectar la tienda con el stock",
  "identidad-digital": "publicar sin depender de nadie",
  "consultoria-tecnologica": "elegir un sistema de gestión",
};
let closingN = 0;
function closing({ tone = "black", title, text, servicio = "", example = "" }) {
  const id = `cierre-${++closingN}`;
  const ej = example || EXAMPLES[servicio] || "ordenar los pedidos de WhatsApp";
  return `<section class="sec close t-${tone}" aria-labelledby="${id}-t">
  ${tone === "black" ? '<div class="close__glow" aria-hidden="true"></div>' : ""}
  <div class="wrap close__in">
    <h2 class="d2" id="${id}-t" data-split>${br(title)}</h2>
    <p class="lead close__tx">${text}</p>
    <form class="close__form" action="/contacto" method="get">
      <label class="close__lb" for="${id}-m">En una línea, ¿qué querés mejorar?</label>
      <div class="close__fd">
        <input id="${id}-m" name="mensaje" type="text" maxlength="300" autocomplete="off" placeholder="Por ejemplo: ${ej}">
        ${servicio ? `<input type="hidden" name="servicio" value="${servicio}">` : ""}
        <button class="btn ${tone === "cobalt" ? "btn--ivory" : ""}" type="submit"><span>Seguir en el formulario</span><span class="btn__ar" aria-hidden="true">${ARROW}${ARROW}</span></button>
      </div>
    </form>
  </div>
</section>`;
}

/* =========================================================
   INICIO — seis capítulos
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

write("/", page({
  path: "/", title: "Inicio", active: "inicio", home: true,
  desc: "Consultora tecnológica para empresas uruguayas: te ayudamos a elegir y aprovechar webs, automatizaciones, integraciones, identidad digital y más.",
  body: `
<section class="matter" id="matter" aria-labelledby="hero-t">
  <div class="stage" id="stage">
    <div class="stage__pool" id="pool" aria-hidden="true"></div>
    <picture><source media="(max-width: 760px), (max-aspect-ratio: 9/10)" srcset="/assets/img/form/hero-m.webp" width="780" height="1688"><img class="stage__poster" id="poster" src="/assets/img/form/hero.webp" alt="" width="2160" height="1350" fetchpriority="high" decoding="async"></picture>
    <canvas id="cBack" aria-hidden="true"></canvas>
    <h1 class="hero__t" id="hero-t">Tu negocio.<br>Su próxima<br>versión.</h1>
    <canvas id="cFront" aria-hidden="true"></canvas>
    <div class="hero__foot" id="foot">
      <p class="hero__sub">Consultoría tecnológica<br>para empresas.</p>
      <div class="hero__cta">${btn("/contacto", "Hablemos")}</div>
      <div class="hero__cue mono" aria-hidden="true"><span>Deslizá</span><span class="hero__ln"></span><span>001 / 006</span></div>
    </div>
    <div class="stage__rail" aria-hidden="true"><i></i></div>
  </div>
  <div class="mani t-cobalt" id="mani">
    <div class="mani__in">
      <p class="mono mani__k">002 — Criterio</p>
      <h2 class="mani__t"><span class="l"><span>Tecnología</span></span><span class="l"><span>con criterio.</span></span></h2>
      <p class="mani__lead">Estrategia, desarrollo e integración para que tu negocio avance con sentido.</p>
      <p class="mani__p">Hoy existe una herramienta para casi todo. El desafío ya no es encontrarla: es saber cuál conviene, cómo implementarla y lograr que tu equipo la use.</p>
    </div>
  </div>
</section>

<section class="sec t-ivory values" aria-labelledby="crit-t">
  <div class="wrap">
    <h2 class="sr" id="crit-t">Nuestro criterio</h2>
    <ol class="values__l" data-stagger>
      <li><span class="mono">01</span><h3>Primero entendemos tu operación</h3><p>Antes de proponer una herramienta, vemos cómo trabajás hoy y dónde se pierde tiempo.</p></li>
      <li><span class="mono">02</span><h3>Elegimos lo que tiene sentido</h3><p>Recomendamos soluciones a la escala de tu empresa y de tu presupuesto, no la opción más nueva.</p></li>
      <li><span class="mono">03</span><h3>Lo dejamos funcionando</h3><p>Implementamos, explicamos cómo se usa y acompañamos los primeros pasos.</p></li>
    </ol>
  </div>
</section>

<section class="sec t-black" aria-labelledby="svc-t">
  <div class="wrap">
    <div class="shead">
      <p class="mono shead__k">003 — Servicios</p>
      <h2 class="d2" id="svc-t" data-split>Herramientas que<br>mueven tu negocio.</h2>
      <div class="shead__a">${linkAr("/servicios", "Ver todos los servicios")}</div>
    </div>
    ${svcRows()}
  </div>
</section>

<section class="sec t-ivory" aria-labelledby="proj-t">
  <div class="wrap">
    <div class="shead">
      <p class="mono shead__k">004 — Proyectos</p>
      <h2 class="d2" id="proj-t" data-split>Así lo<br>resolveríamos.</h2>
      <p class="shead__note">Casos conceptuales: ejemplos de cómo abordamos necesidades frecuentes. No corresponden a clientes reales.</p>
    </div>
    <div class="pgrid">
      ${projCard(PROJECTS[0])}
      ${projCard(PROJECTS[1])}
    </div>
    <p class="more">${linkAr("/proyectos", "Ver todos los conceptos")}</p>
  </div>
</section>

<section class="sec t-cobalt proc-h" aria-labelledby="proc-t">
  <div class="wrap">
    <div class="shead">
      <p class="mono shead__k">005 — Proceso</p>
      <h2 class="d2" id="proc-t" data-split>Cómo trabajamos.</h2>
      <p class="shead__note">Cuatro etapas claras. En cada momento sabés en qué punto estamos y qué viene después.</p>
    </div>
    <ol class="layers">
      ${PROCESS.map((s, i) => `<li class="layer"><span class="mono">${pad(i + 1)}</span><h3>${s.t}</h3><p>${s.d}</p></li>`).join("\n      ")}
    </ol>
    <p class="more">${linkAr("/nosotros#proceso", "Ver el proceso completo")}</p>
  </div>
</section>

${closing({ tone: "black", title: ["¿Por dónde", "empezamos?"], text: "Contanos qué querés mejorar en tu empresa y vemos juntos cuál es el primer paso." })}
`,
}));

/* =========================================================
   NOSOTROS
   ========================================================= */
const PRINCIPLES = [
  ["Claridad", "Explicamos cada decisión sin jerga, para que puedas evaluarla."],
  ["Escala", "Proponemos soluciones acordes al tamaño y al momento de tu empresa."],
  ["Autonomía", "Buscamos que tu equipo pueda usar y mantener lo que implementamos."],
];

write("/nosotros", page({
  path: "/nosotros", title: "Nosotros", seo: "Nosotros: consultora tecnológica en Uruguay", active: "nosotros",
  desc: "KROMA nace para democratizar la digitalización de las empresas uruguayas: elegir bien las herramientas e implementarlas con criterio.",
  body: `
<section class="ph t-ivory ph--art" aria-labelledby="t">
  <div class="wrap ph__grid">
    ${crumb([["Inicio", "/"], ["Nosotros"]])}
    <h1 class="d1 ph__t" id="t" data-split>Digitalizar<br>también es<br>elegir bien.</h1>
    <div class="ph__aside" data-rise>
      <p class="lead">Somos una consultora tecnológica uruguaya. Nuestro propósito es democratizar la digitalización de las empresas.</p>
      ${linkAr("#proceso", "Ver cómo trabajamos")}
    </div>
    <div class="ph__art" aria-hidden="true"><img src="/assets/img/form/nosotros.webp" alt="" width="924" height="886" decoding="async" data-float></div>
  </div>
</section>
<div class="sweep" aria-hidden="true"><svg viewBox="0 0 1440 220" preserveAspectRatio="none"><path class="sweep__b" d="M0 120C240 40 420 30 640 90S1060 210 1440 110V220H0Z"/><path class="sweep__c" d="M0 220V170C200 120 380 110 560 150S900 220 1100 220Z"/></svg></div>
<section class="sec t-black about" aria-labelledby="proposito">
  <div class="wrap">
    <h2 id="proposito" class="d2 about__big" data-split>Nunca hubo tantas herramientas disponibles. Pero más opciones no siempre significan mejores decisiones.</h2>
    <div class="about__grid">
      <p>Para muchas empresas, digitalizarse se volvió una lista de suscripciones que nadie termina de usar. El valor no está en sumar tecnología, sino en elegirla bien e implementarla con criterio.</p>
      <p>Democratizar la digitalización es eso: que una empresa chica o mediana pueda acceder al mismo criterio que una grande, con soluciones a su escala.</p>
      <blockquote class="about__q">Tecnología que se entiende, se usa y se puede mantener. Ese es nuestro criterio.</blockquote>
    </div>
  </div>
</section>
<section class="sec t-ivory flow" id="proceso" aria-labelledby="proceso-t">
  <div class="wrap">
    <div class="shead">
      <p class="mono shead__k">Proceso</p>
      <h2 class="d2" id="proceso-t" data-split>Cómo trabajamos.</h2>
      <p class="shead__note">Cuatro etapas claras. En cada momento sabés en qué punto estamos y qué viene después.</p>
    </div>
    <div class="flow__grid">
      <div class="flow__side" aria-hidden="true">
        <div class="flow__stick">
          <span class="flow__num"><span data-flow-num>01</span><small>/ 0${PROCESS.length}</small></span>
          <span class="flow__name" data-flow-name>${PROCESS[0].t}</span>
          <span class="flow__bar"><i data-flow-bar></i></span>
        </div>
      </div>
      <ol class="flow__list">
        ${PROCESS.map((s, i) => `<li class="flow__it${i === 0 ? " is-on" : ""}" data-i="${i}">
          <p class="mono">Etapa ${pad(i + 1)} de ${pad(PROCESS.length)}</p>
          <h3>${s.t}.</h3>
          <p class="lead">${s.d}</p>
          <ul>${s.a.map((x) => `<li>${x}</li>`).join("")}</ul>
          <p class="flow__out"><span class="mono">Te llevás</span><strong>${s.out}</strong></p>
        </li>`).join("\n        ")}
      </ol>
    </div>
  </div>
</section>
<section class="sec t-black" aria-labelledby="principios">
  <div class="wrap">
    <div class="shead"><p class="mono shead__k">Principios</p><h2 class="d2" id="principios" data-split>Lo que nos guía.</h2></div>
    <ul class="princ">
      ${PRINCIPLES.map(([t, d]) => `<li><span class="princ__w">${t}</span><p>${d}</p></li>`).join("\n      ")}
    </ul>
  </div>
</section>
${closing({ tone: "cobalt", title: ["Empecemos por", "entender."], text: "Una primera conversación alcanza para identificar por dónde conviene empezar." })}
`,
}));

/* =========================================================
   SERVICIOS (índice)
   ========================================================= */
write("/servicios", page({
  path: "/servicios", title: "Servicios", seo: "Servicios de tecnología para empresas", ld: [crumbsLd([["Servicios", "/servicios"]])], active: "servicios",
  desc: "Webs, automatizaciones, integraciones, identidad digital y consultoría tecnológica para empresas uruguayas.",
  body: `
<section class="ph t-black" aria-labelledby="t">
  <div class="ph__glow" aria-hidden="true"></div>
  <div class="wrap ph__grid">
    ${crumb([["Inicio", "/"], ["Servicios"]])}
    <h1 class="d1 ph__t" id="t" data-split>Herramientas que<br>mueven tu negocio.</h1>
    <div class="ph__aside" data-rise><p class="lead">Elegimos, construimos y conectamos la tecnología que tu empresa necesita.</p></div>
  </div>
</section>
<section class="sec t-black sec--flush" aria-label="Lista de servicios">
  <div class="wrap">${svcRows()}</div>
</section>
<section class="sec t-ivory" aria-labelledby="eleccion">
  <div class="wrap split">
    <div class="split__h">
      <h2 class="d2" id="eleccion" data-split>Elegimos lo que<br>necesitás.</h2>
      <p class="lead">Tecnología útil. Sin ruido. Con impacto real.</p>
    </div>
    <div class="split__b">
      <p>Muchas veces la necesidad no encaja en un solo servicio: una web que debería cargar pedidos, una planilla que debería hablar con la facturación, una marca que necesita piezas nuevas.</p>
      <p class="muted">En la primera conversación ordenamos el problema y te decimos qué combinación tiene sentido, o si conviene esperar.</p>
      ${btn("/contacto?servicio=no-se", "Contanos tu caso")}
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
    seo: "Diseño web para empresas en Uruguay", tone: "black",
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
    seo: "Automatización de procesos para empresas", tone: "cobalt",
    title: ["Menos tareas", "repetidas.", "Más tiempo útil."],
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
    seo: "Integración de sistemas y herramientas", tone: "black",
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
    seo: "Identidad visual y diseño para redes", tone: "cobalt",
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
  "consultoria-tecnologica": {
    seo: "Consultoría tecnológica para empresas", tone: "black",
    title: ["La tecnología", "no es solo para", "las grandes."],
    cta: "Contanos tu caso",
    lead: "Primero entendemos tu negocio. Después evaluamos opciones por utilidad, costo y complejidad, sin vender ninguna herramienta en particular.",
    desc: "Consultoría tecnológica para empresas uruguayas: analizamos tu operación y te ayudamos a elegir herramientas útiles, accesibles y a la medida de tu negocio.",
    problem: "A las empresas no les faltan herramientas: <em>les sobran opciones</em>. Lo difícil es saber cuál conviene, cuánto invertir y cómo hacer que funcione con lo que ya usan.",
    includes: [
      ["Diagnóstico de procesos", "Relevamos cómo trabaja tu equipo hoy, qué herramientas usa y dónde se pierde tiempo o información."],
      ["Oportunidades de mejora", "Detectamos qué conviene digitalizar u optimizar primero y qué puede esperar."],
      ["Evaluación de herramientas", "Comparamos opciones del mercado por utilidad, costo y complejidad de adopción. No representamos a ninguna marca."],
      ["Hoja de ruta", "Una recomendación por etapas, con soluciones accesibles y escalables, que conecta lo que ya usás en lugar de sumar procesos aislados."],
    ],
    examples: [
      ["Elegir un sistema de gestión", "Una empresa que factura y controla stock en planillas y quiere un sistema que le sirva sin pagar de más."],
      ["Ordenar las consultas", "Pedidos que llegan por WhatsApp, mail y la web, sin un lugar común para seguirlos."],
      ["Revisar lo que ya se paga", "Suscripciones que se superponen o que el equipo dejó de usar."],
      ["Antes de invertir", "Una mirada independiente antes de contratar un software o un desarrollo a medida."],
    ],
    steps: [["Conversación inicial", "Qué hace tu negocio, qué te frena y qué querés resolver."], ["Relevamiento", "Procesos, herramientas actuales y lo que cuestan."], ["Evaluación", "Opciones comparadas con criterios claros."], ["Recomendación", "Hoja de ruta priorizada y acompañamiento si decidís implementarla."]],
    faq: [
      ["¿Venden o representan alguna herramienta?", "No. Recomendamos según lo que tu negocio necesita. Si algo que ya usás sirve, te lo vamos a decir."],
      ["¿Necesito conocimientos técnicos?", "No. Explicamos cada opción en términos de costo, tiempo y uso diario, sin jerga."],
      ["¿Qué recibo al final?", "Un diagnóstico y una recomendación por etapas: qué usar, en qué orden, una estimación de costos y qué implica adoptarlo."],
      ["¿Después pueden implementarlo?", "Sí, si lo necesitás. Podemos encargarnos de webs, automatizaciones, integraciones o identidad digital, o acompañar a tu equipo o a otro proveedor."],
    ],
  },
};

// Interacción explicativa propia de cada servicio
function svcDemo(slug) {
  const head = (k, t, note) => `<div class="shead"><p class="mono shead__k">${k}</p><h2 class="d2" id="demo-t" data-split>${br(t)}</h2><p class="shead__note">${note}</p></div>`;
  if (slug === "webs") {
    const frame = (cls, depth, label, mobile = false) => `
      <div class="wl ${cls}" data-depth="${depth}">
        <div class="fr${mobile ? " fr--m" : ""}">
          ${mobile ? "" : `<div class="fr__bar"><i></i><i></i><i></i><b>${label}</b></div>`}
          <div class="fr__body"><div class="fr__img"></div><div class="fr__h"></div><div class="fr__p"></div><div class="fr__p fr__p--s"></div><div class="fr__btn"></div></div>
        </div>
      </div>`;
    return `<section class="sec t-black demo" aria-labelledby="demo-t">
  <div class="wrap">
    ${head("Previews", ["Una web,", "en cada pantalla."], "Ejemplo ilustrativo. Mové el puntero o deslizá para ver las capas.")}
    <div class="webs" role="img" aria-label="Previews ilustrativas de un sitio web en computadora y celular">
      ${frame("wl--1", 0.6, "inicio")}${frame("wl--2", 1, "servicios")}${frame("wl--3", 1.6, "", true)}
    </div>
  </div>
</section>`;
  }
  if (slug === "automatizaciones") {
    const stages = [
      ["Pedido recibido", "Llega un pedido", "Un cliente completa el formulario de tu web."],
      ["Datos revisados", "Se revisan los datos", "Se controla que estén completos y se ordenan."],
      ["Registrado", "Se registra", "El pedido queda cargado en tu planilla o sistema."],
      ["Aviso enviado", "Se avisa", "El cliente recibe la confirmación y tu equipo, el aviso."],
    ];
    return `<section class="sec t-black demo auto" aria-labelledby="demo-t">
  <div class="wrap">
    ${head("Flujo", ["Una tarea,", "de punta a punta."], "Ejemplo ilustrativo. Cada flujo se diseña según tu operación y las herramientas que usás.")}
    <div class="auto__track">
      <div class="auto__rail" aria-hidden="true"><i></i></div>
      <div class="auto__task" aria-hidden="true"><span class="auto__dot mono">01</span><span class="auto__lb">Pedido recibido</span></div>
      <ol class="auto__st">
        ${stages.map(([lab, t, d], i) => `<li class="auto__s${i === 0 ? " is-done" : ""}" data-label="${lab}"><span class="mono">${pad(i + 1)}</span><h3>${t}</h3><p>${d}</p><span class="auto__state mono"><span class="w">Pendiente</span><span class="d">Listo</span></span></li>`).join("")}
      </ol>
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
      return `<g class="ig__node${n.id === "hub" ? " ig__hub" : ""}" data-node="${n.id}" data-desc="${n.desc}" tabindex="0" aria-describedby="nd-${n.id}"><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${h}" rx="${h / 2}"/><text><tspan class="ig__k" x="${n.x + n.w / 2}" y="${n.y + h / 2 - 9}" text-anchor="middle">${n.k}</tspan><tspan class="ig__t" x="${n.x + n.w / 2}" y="${n.y + h / 2 + 15}" text-anchor="middle">${n.t}</tspan></text></g>`;
    };
    return `<section class="sec t-black demo" aria-labelledby="demo-t">
  <div class="wrap ig" data-route="p1,p2,p3,p4">
    ${head("Flujo de datos", ["Un dato,", "un solo viaje."], "Ejemplo ilustrativo. Pasá el cursor o navegá con el teclado por cada herramienta para ver qué hace.")}
    <div class="ig__scroll">
      <svg class="ig__svg" viewBox="0 0 1000 520" role="group" aria-label="Diagrama: un pedido viaja del formulario web al sistema de gestión, y de ahí a facturación, reportes y email al cliente">
        <path class="ig__path" id="p1" data-from="form" data-to="hub" d="M250 260C310 260 320 260 380 260"/>
        <path class="ig__path" id="p2" data-from="hub" data-to="fact" d="M630 260C700 260 680 88 750 88"/>
        <path class="ig__path" id="p3" data-from="hub" data-to="sheet" d="M630 260C690 260 690 260 750 260"/>
        <path class="ig__path" id="p4" data-from="hub" data-to="mail" d="M630 260C700 260 680 432 750 432"/>
        <circle class="ig__sig" r="7" cx="250" cy="260" aria-hidden="true"/>
        ${N.map(node).join("")}
      </svg>
    </div>
    <div class="sr">${N.map((n) => `<span id="nd-${n.id}">${n.desc.split(": ").slice(1).join(": ")}</span>`).join("")}</div>
    <p class="ig__cap lead" aria-live="polite" data-default="Cada herramienta cumple un rol. Pasá el cursor o navegá con el teclado por el diagrama para ver cuál.">Cada herramienta cumple un rol. Pasá el cursor o navegá con el teclado por el diagrama para ver cuál.</p>
    <ol class="ig__flow">
      <li>Un pedido entra por el formulario web.</li>
      <li>El sistema de gestión genera la factura.</li>
      <li>La venta se suma al reporte del equipo.</li>
      <li>El cliente recibe la confirmación.</li>
    </ol>
  </div>
</section>`;
  }
  if (slug === "identidad-digital") {
    return `<section class="sec t-ivory demo ident" aria-labelledby="demo-t">
  <div class="wrap">
    ${head("Sistema", ["De piezas sueltas", "a un sistema."], "Ejemplo con una marca ficticia, “Almacén Norte”. Al avanzar, cada pieza encuentra su lugar dentro del mismo sistema.")}
    <div class="ident__board" role="img" aria-label="Sistema visual de ejemplo: logo, paleta, tipografía, publicación para redes, tarjeta, cartel y perfil en redes de una marca ficticia">
      <div class="pz pz-logo" style="--dx:-120;--dy:80;--rot:-9deg"><span class="w">Almacén<br>Norte</span><span class="pz__l mono">Logo</span></div>
      <div class="pz pz-pal" style="--dx:60;--dy:140;--rot:7deg"><i></i><i></i><i></i></div>
      <div class="pz pz-type" style="--dx:180;--dy:-40;--rot:10deg"><span class="aa">Aa</span><span class="pz__l mono">Tipografía</span></div>
      <div class="pz pz-post" style="--dx:-60;--dy:-120;--rot:6deg"><span class="pz__l mono">Publicación</span><strong>Pan de masa madre, todos los jueves.</strong></div>
      <div class="pz pz-card" style="--dx:140;--dy:110;--rot:-12deg"><strong>Almacén Norte</strong><span class="pz__l mono">Tarjeta</span></div>
      <div class="pz pz-sign" style="--dx:-160;--dy:60;--rot:-5deg"><i></i>Almacén Norte</div>
      <div class="pz pz-av" style="--dx:120;--dy:-90;--rot:14deg"><span class="av"><i></i></span><span class="pz__l mono">Perfil en redes</span></div>
    </div>
  </div>
</section>`;
  }
  if (slug === "consultoria-tecnologica") {
    const PRIO = [["u", "Que resuelva más"], ["c", "Que cueste menos"], ["s", "Que sea fácil de adoptar"]];
    const CRIT = [["u", "Utilidad"], ["c", "Costo accesible"], ["s", "Simplicidad"]];
    const OPTS = [
      { t: "Planilla compartida y formulario", u: 2, c: 3, s: 2, why: "Si el presupuesto manda, una planilla compartida con un formulario ordena las consultas casi sin costo. Alcanza para empezar y se puede escalar después." },
      { t: "CRM liviano", u: 3, c: 2, s: 2, why: "Si lo que más pesa es resolver bien el problema, un CRM liviano reúne las consultas y su seguimiento en un solo lugar, con un costo mensual acotado." },
      { t: "Conectar lo que ya usás", u: 2, c: 2, s: 3, why: "Si el equipo necesita adoptar el cambio rápido, conviene llevar los canales que ya usa a una bandeja común, sin aprender un sistema nuevo." },
      { t: "Sistema a medida", u: 3, c: 1, s: 1, why: "" },
      { t: "Suite corporativa (ERP)", u: 2, c: 1, s: 1, why: "" },
    ];
    const meter = (k, v) => `<span class="ch__m" data-k="${k}"><span class="ch__mk mono" aria-hidden="true">${CRIT.find((c) => c[0] === k)[1]}</span><span class="ch__bars" aria-hidden="true">${[1, 2, 3].map((n) => `<i${n <= v ? ' class="on"' : ""}></i>`).join("")}</span><span class="sr">${CRIT.find((c) => c[0] === k)[1]}: ${v} de 3</span></span>`;
    return `<section class="sec t-black demo ch" data-prio="u" aria-labelledby="demo-t">
  <div class="wrap">
    ${head("Criterio", ["Un problema,", "varias respuestas."], "Ejemplo ilustrativo. Elegí qué pesa más y mirá cómo cambia la recomendación.")}
    <div class="ch__top">
      <div class="ch__need"><p class="mono">Necesidad</p><p class="ch__nt">Ordenar las consultas que llegan por WhatsApp, mail y la web.</p></div>
      <div class="ch__prio" role="group" aria-label="Qué priorizar">
        <p class="mono" aria-hidden="true">Priorizá</p>
        ${PRIO.map(([k, l]) => `<button type="button" class="ch__btn" data-w="${k}" aria-pressed="${k === "u"}">${l}</button>`).join("")}
      </div>
    </div>
    <div class="ch__table">
      <div class="ch__head mono" aria-hidden="true"><span>Opción</span>${CRIT.map(([k, l]) => `<span data-k="${k}">${l}</span>`).join("")}<span></span></div>
      <ol class="ch__list">
        ${OPTS.map((o) => `<li class="ch__opt${o.t === "CRM liviano" ? " is-best" : ""}" data-u="${o.u}" data-c="${o.c}" data-s="${o.s}" data-why="${o.why}"><span class="ch__name">${o.t}</span>${meter("u", o.u)}${meter("c", o.c)}${meter("s", o.s)}<span class="ch__tag mono">Recomendada</span></li>`).join("")}
      </ol>
    </div>
    <p class="ch__why lead" aria-live="polite">${OPTS[1].why}</p>
    <p class="ch__note">El sistema a medida y la suite corporativa también resolverían el problema, pero para esta necesidad son más grandes y costosos de lo necesario.</p>
  </div>
</section>`;
  }
  return "";
}

const TONE_NEXT = { black: "ivory", cobalt: "ivory", ivory: "cobalt" };
for (const s of SERVICES) {
  const d = SVC_PAGES[s.slug];
  const idx = SERVICES.indexOf(s);
  const next = SERVICES[(idx + 1) % SERVICES.length];
  const body = `
<section class="ph t-${d.tone} ph--art ph--svc" aria-labelledby="t">
  ${d.tone === "black" ? '<div class="ph__glow" aria-hidden="true"></div>' : ""}
  <div class="wrap ph__grid">
    ${crumb([["Servicios", "/servicios"], [`${s.n} ${s.name}`]])}
    <h1 class="d1 ph__t" id="t" data-split>${br(d.title)}</h1>
    <div class="ph__aside" data-rise>
      <p class="lead">${d.lead}</p>
      ${btn(`/contacto?servicio=${s.slug}`, d.cta || "Consultar por " + s.name.toLowerCase(), d.tone === "cobalt" ? "btn--ivory" : "")}
    </div>
    <div class="ph__art" aria-hidden="true"><img src="/assets/img/form/${s.slug}.webp" alt="" decoding="async" data-float></div>
  </div>
</section>
<section class="sec t-${TONE_NEXT[d.tone]} prob" aria-labelledby="problema">
  <div class="wrap prob__in">
    <h2 id="problema" class="mono prob__k">Qué resuelve</h2>
    <p class="prob__t" data-split-lines>${d.problem}</p>
  </div>
</section>
${svcDemo(s.slug)}
<section class="sec t-ivory" aria-labelledby="incluye">
  <div class="wrap">
    <div class="shead"><p class="mono shead__k">Qué incluye</p><h2 class="d2" id="incluye" data-split>Lo que<br>hacemos.</h2></div>
    <ul class="incl" data-stagger>
      ${d.includes.map(([t, x]) => `<li><h3>${t}</h3><p>${x}</p></li>`).join("\n      ")}
    </ul>
  </div>
</section>
<section class="sec t-ivory sec--flush-top" aria-labelledby="ejemplos">
  <div class="wrap split">
    <div class="split__h split__h--stick"><h2 id="ejemplos" class="h3">Situaciones en las que suele aplicarse.</h2></div>
    <ol class="split__b ex">
      ${d.examples.map(([t, x]) => `<li><strong>${t}</strong><p>${x}</p></li>`).join("\n      ")}
    </ol>
  </div>
</section>
<section class="sec t-cobalt" aria-labelledby="como">
  <div class="wrap">
    <div class="shead"><p class="mono shead__k">Cómo trabajamos</p><h2 class="d2" id="como" data-split>Paso<br>a paso.</h2><div class="shead__a">${linkAr("/nosotros#proceso", "Nuestro proceso")}</div></div>
    <ol class="layers">
      ${d.steps.map(([t, x], i) => `<li class="layer"><span class="mono">${pad(i + 1)}</span><h3>${t}</h3><p>${x}</p></li>`).join("\n      ")}
    </ol>
  </div>
</section>
<section class="sec t-ivory" aria-labelledby="faq">
  <div class="wrap split">
    <div class="split__h"><h2 id="faq" class="d2" data-split>Dudas<br>habituales.</h2></div>
    <div class="split__b faq">
      ${d.faq.map(([q, a]) => `<details><summary>${q}<span class="faq__i" aria-hidden="true"></span></summary><div class="faq__a"><p>${a}</p></div></details>`).join("\n      ")}
    </div>
  </div>
</section>
${closing({ tone: "black", servicio: s.slug, title: ["Hablemos de", s.name.toLowerCase() + "."], text: `Contanos qué necesitás y te decimos cómo lo encararíamos. ¿Te interesa otro frente? Seguí por <a href="/servicios/${next.slug}">${next.name}</a>.` })}
`;
  write(`/servicios/${s.slug}`, page({ path: `/servicios/${s.slug}`, title: s.name, seo: d.seo, active: "servicios/" + s.slug, desc: d.desc, body, ld: [
    { "@type": "Service", name: s.name, serviceType: d.seo, description: d.desc, url: `${SITE_URL}/servicios/${s.slug}`, provider: { "@id": SITE_URL + "/#kroma" }, areaServed: { "@type": "Country", name: "Uruguay" } },
    crumbsLd([["Servicios", "/servicios"], [s.name, `/servicios/${s.slug}`]]),
  ] }));
}

/* =========================================================
   PROYECTOS
   ========================================================= */
write("/proyectos", page({
  path: "/proyectos", title: "Proyectos", seo: "Proyectos conceptuales", ld: [crumbsLd([["Proyectos", "/proyectos"]])], active: "proyectos",
  desc: "Proyectos conceptuales de KROMA: ejemplos de cómo abordamos webs, automatizaciones, integraciones e identidad digital.",
  body: `
<section class="ph t-black" aria-labelledby="t">
  <div class="ph__glow" aria-hidden="true"></div>
  <div class="wrap ph__grid">
    ${crumb([["Inicio", "/"], ["Proyectos"]])}
    <h1 class="d1 ph__t" id="t" data-split>Casos<br>de ejemplo.</h1>
    <div class="ph__aside" data-rise>
      <span class="tag mono">Conceptos</span>
      <p>Estos proyectos son conceptos: muestran cómo abordaríamos necesidades frecuentes. No corresponden a clientes reales y no presentan resultados.</p>
    </div>
  </div>
</section>
<section class="sec t-black sec--flush" aria-label="Lista de proyectos">
  <div class="wrap">
    <div class="pf" role="group" aria-label="Filtrar por servicio">
      <button type="button" class="pf__c" aria-pressed="true" data-filter="all">Todos <span class="mono">${pad(PROJECTS.length)}</span></button>
      ${SERVICES.filter((s) => PROJECTS.some((p) => p.service === s.slug)).map((s) => `<button type="button" class="pf__c" aria-pressed="false" data-filter="${s.slug}">${s.name} <span class="mono">${pad(PROJECTS.filter((p) => p.service === s.slug).length)}</span></button>`).join("")}
      <p class="pf__st mono" aria-live="polite"><span data-count>${pad(PROJECTS.length)}</span> conceptos</p>
    </div>
    <ol class="plist">
      ${PROJECTS.map((pr, i) => `<li class="pl" data-service="${pr.service}">
        <article class="pl__card" aria-labelledby="pc-${i}">
          <a class="pl__media" href="/proyectos/${pr.slug}" tabindex="-1" aria-hidden="true"><div class="pc__para">${PROJECT_ART[pr.slug]}</div></a>
          <div class="pl__body">
            <p class="pl__meta mono"><span class="tag">Concepto</span><span>${pr.serviceName}</span></p>
            <h2 class="pl__t" id="pc-${i}">${pr.title}</h2>
            <p class="pl__need">${pr.need}</p>
            <p class="sr">Entregables:</p><ul class="pl__del">${pr.deliverables.map((d) => `<li>${d}</li>`).join("")}</ul>
            <a class="btn btn--ivory" href="/proyectos/${pr.slug}"><span>Ver caso<span class="sr">: ${pr.title}</span></span><span class="btn__ar" aria-hidden="true">${ARROW}${ARROW}</span></a>
          </div>
        </article>
      </li>`).join("\n      ")}
    </ol>
    <p class="pf__empty" hidden>No hay conceptos para este servicio todavía.</p>
  </div>
</section>
${closing({ tone: "cobalt", title: ["¿Tu caso", "es el próximo?"], text: "Cuando publiquemos proyectos realizados, van a estar acá. Mientras tanto, contanos el tuyo." })}
`,
}));

PROJECTS.forEach((pr, i) => {
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  write(`/proyectos/${pr.slug}`, page({
    path: `/proyectos/${pr.slug}`, title: pr.title, active: "proyectos",
    desc: clip(`Proyecto conceptual de KROMA: ${pr.title.toLowerCase()}. ${pr.context}`, 158),
    ld: [crumbsLd([["Proyectos", "/proyectos"], [pr.title, `/proyectos/${pr.slug}`]])],
    body: `
<section class="ph t-ivory case-h" aria-labelledby="t">
  <div class="wrap ph__grid">
    ${crumb([["Proyectos", "/proyectos"], ["Concepto"]])}
    <h1 class="d1 ph__t case-h__t" id="t" data-split>${pr.title}</h1>
    <div class="ph__aside" data-rise>
      <span class="tag mono">Concepto</span>
      <p>Servicio: <a href="/servicios/${pr.service}">${pr.serviceName}</a></p>
    </div>
  </div>
  <div class="wrap"><div class="case-h__media"><div class="pc__para" data-para>${PROJECT_ART[pr.slug]}</div></div></div>
</section>
<section class="sec t-ivory sec--flush-top" aria-label="Detalle del caso">
  <div class="wrap case">
    <p class="case__note"><strong>Proyecto conceptual.</strong> Es un ejemplo de cómo abordaríamos esta necesidad. No corresponde a un cliente real ni fue implementado.</p>
    <div class="case__row"><h2 class="mono">Contexto</h2><p class="lead">${pr.context}</p></div>
    <div class="case__row"><h2 class="mono">Necesidad</h2><p class="lead">${pr.need}</p></div>
    <div class="case__row"><h2 class="mono">Solución</h2><p class="lead">${pr.solution}</p></div>
    <div class="case__row"><h2 class="mono">Entregables</h2><ul>${pr.deliverables.map((x) => `<li>${x}</li>`).join("")}</ul></div>
    <div class="case__row"><h2 class="mono">Resultado</h2><p class="muted">No aplica: al ser un concepto, no hay resultados documentados para informar.</p></div>
  </div>
</section>
<section class="sec sec--tight t-black" aria-label="Siguiente proyecto">
  <div class="wrap nextc">
    <div><p class="mono">Siguiente concepto</p><p class="nextc__t">${next.title}</p></div>
    ${btn(`/proyectos/${next.slug}`, "Ver caso", "btn--ivory")}
  </div>
</section>
${closing({ tone: "cobalt", title: ["¿Algo", "parecido?"], text: "Si tu empresa tiene una necesidad similar, contanos y lo vemos.", servicio: pr.service })}
`,
  }));
});

/* =========================================================
   CONTACTO
   ========================================================= */
write("/contacto", page({
  path: "/contacto", title: "Hablemos", seo: "Contacto: contanos qué querés mejorar", active: "contacto",
  desc: "Contale a KROMA qué querés mejorar en tu empresa: webs, automatizaciones, integraciones, identidad digital o consultoría tecnológica.",
  body: `
<section class="ph t-ivory contact" aria-labelledby="t">
  <div class="wrap contact__grid">
    <div class="contact__intro">
      ${crumb([["Inicio", "/"], ["Hablemos"]])}
      <h1 class="d1" id="t" data-split>Contanos<br>en qué estás.</h1>
      <p class="lead" data-rise>Escribinos sobre tu empresa y lo que querés resolver. Con esa información preparamos la primera conversación.</p>
      <div class="contact__help" data-rise>
        <p class="mono">Ayuda contarnos</p>
        <ul><li>A qué se dedica tu empresa.</li><li>Qué herramientas usan hoy.</li><li>Qué te gustaría mejorar primero.</li></ul>
      </div>
      <div class="contact__ch" data-rise>
        <p class="mono">También podés escribirnos</p>
        <p>${EMAIL}<br><a href="${IG_URL}" target="_blank" rel="noopener">Instagram ${IG}<span class="sr"> (se abre en otra pestaña)</span></a></p>
      </div>
    </div>
    <div class="contact__form" data-rise>
      <form class="form" id="contact-form" action="${FORM_ENDPOINT.replace("/ajax", "")}" method="post" data-endpoint="${FORM_ENDPOINT}" novalidate aria-describedby="form-note">
        <div class="field">
          <label for="f-nombre">Nombre</label>
          <input id="f-nombre" name="nombre" type="text" autocomplete="name" required aria-describedby="e-nombre">
          <p class="field__err" id="e-nombre" aria-live="polite"></p>
        </div>
        <div class="field">
          <label for="f-contacto">Email o teléfono</label>
          <span class="field__hint" id="h-contacto">Usamos este dato solo para responderte.</span>
          <input id="f-contacto" name="contacto" type="text" autocomplete="email" inputmode="email" required aria-describedby="h-contacto e-contacto">
          <p class="field__err" id="e-contacto" aria-live="polite"></p>
        </div>
        <div class="field">
          <label for="f-servicio">Servicio de interés</label>
          <div class="field__sel"><select id="f-servicio" name="servicio" required aria-describedby="e-servicio">
            <option value="">Elegí una opción</option>
            ${SERVICES.map((s) => `<option value="${s.slug}">${s.name}</option>`).join("")}
            <option value="no-se">Todavía no sé</option>
          </select></div>
          <p class="field__err" id="e-servicio" aria-live="polite"></p>
        </div>
        <div class="field">
          <label for="f-mensaje">Mensaje</label>
          <textarea id="f-mensaje" name="mensaje" rows="5" required aria-describedby="e-mensaje"></textarea>
          <p class="field__err" id="e-mensaje" aria-live="polite"></p>
        </div>
        <div class="hp" aria-hidden="true"><label for="f-hp">No completar</label><input id="f-hp" name="_honey" type="text" tabindex="-1" autocomplete="off"></div>
        <div class="form__foot">
          <button class="btn" type="submit"><span class="btn__lb">Enviar mensaje</span><svg class="spin" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><span class="btn__ar" aria-hidden="true">${ARROW}${ARROW}</span></button>
          <p class="form__note" id="form-note">Todos los campos son obligatorios.</p>
        </div>
      </form>
      <div class="fstat fstat--ok" id="form-ok" tabindex="-1" role="status">
        <h2 class="h3">Recibimos tu mensaje.</h2>
        <p>Gracias por escribirnos. Te vamos a responder al dato de contacto que dejaste.</p>
      </div>
      <div class="fstat fstat--err" id="form-error" tabindex="-1" role="alert">
        <h2 class="h3">Tu mensaje no se envió.</h2>
        <p id="form-error-text"></p>
        <p><button class="btn btn--ivory" type="button" id="form-retry"><span>Volver al formulario</span><span class="btn__ar" aria-hidden="true">${ARROW}${ARROW}</span></button></p>
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
  path: "/404", title: "Página no encontrada", active: "",
  desc: "La página que buscás no existe.",
  body: `
<section class="ph t-cobalt nf" aria-labelledby="t">
  <div class="wrap">
    <p class="mono">Error 404</p>
    <h1 id="t" class="d1">Esta página<br>no existe.</h1>
    <p class="lead">Puede que el enlace haya cambiado. Volvé al inicio o escribinos.</p>
    <p class="nf__a">${btn("/", "Ir al inicio", "btn--ivory")}${linkAr("/contacto", "Hablemos")}</p>
  </div>
</section>`,
}));

/* ---------------- sitemap, robots, llms.txt, favicon ---------------- */
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.filter((u) => u !== "/404").map((u) => `  <url><loc>${SITE_URL}${u === "/" ? "/" : u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(OUT, "llms.txt"), `# KROMA

> KROMA es una consultora tecnológica para empresas uruguayas, con base en Montevideo. Ayuda a elegir herramientas tecnológicas y a aprovecharlas de forma eficiente. Su propósito es democratizar la digitalización de las empresas uruguayas. No vende ni representa ninguna herramienta en particular.

Contacto: ${EMAIL} · Instagram: ${IG_URL}

## Servicios

${SERVICES.map((s) => `- [${s.name}](${SITE_URL}/servicios/${s.slug}): ${SVC_PAGES[s.slug].desc}`).join("\n")}

## Sobre KROMA

- [Nosotros](${SITE_URL}/nosotros): propósito y forma de trabajo (Entendemos, Priorizamos, Desarrollamos, Acompañamos).
- [Contacto](${SITE_URL}/contacto): formulario para consultas.

## Proyectos

Los proyectos publicados son conceptos ilustrativos, no clientes reales.

${PROJECTS.map((pr) => `- [${pr.title}](${SITE_URL}/proyectos/${pr.slug})`).join("\n")}
`);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, "assets/img/favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 ${parseFloat(ISO_VB.split(" ")[2]) + 16} ${parseFloat(ISO_VB.split(" ")[3]) + 16}"><path fill="#0053fd" d="${ISO_D}"/></svg>`);
console.log("ok", PAGES.length, "páginas");
