// Uso: node scripts/build.mjs .   (desde la carpeta raíz del proyecto)
// Genera todas las páginas estáticas de KROMA. Los textos viven en content.mjs; el diseño, en design/sistema.md.
import fs from "node:fs";
import path from "node:path";
import { SERVICES, PROJECTS, PROCESS, PRINCIPLES, SVC_PAGES } from "./content.mjs";
import { PROJECT_ART, SERVICE_ART, WEB_LAYERS } from "./art.mjs";

const OUT = process.argv[2] || ".";
const isoFile = fs.readFileSync(path.join(OUT, "assets/img/kroma-isotipo.svg"), "utf8");
const ISO_VB = isoFile.match(/viewBox="([^"]+)"/)[1];
const ISO_D = isoFile.match(/ d="([^"]+)"/)[1];

/* ---------------- datos del sitio ---------------- */
// Dominio público. Si se conecta un dominio propio, cambiarlo acá y reconstruir.
const SITE_URL = "https://kromalabs2.vercel.app";
const EMAIL = "somoskromauy@gmail.com";
const IG = "@_kromalabs";
const IG_URL = "https://www.instagram.com/_kromalabs/";
// FormSubmit envía cada consulta al email de arriba. La primera vez hay que confirmar el email de activación que llega a esa casilla.
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${EMAIL}`;
// Métricas del propio sitio (Lighthouse 12, celular simulado). Se actualizan al medir de nuevo.
const METRICS = { date: "23 de noviembre de 2026", perf: 0, a11y: 0, lcp: "—", weight: "—" };
try { Object.assign(METRICS, JSON.parse(fs.readFileSync(path.join(OUT, "design/metricas.json"), "utf8"))); } catch {}

/* ---------------- utilidades ---------------- */
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const ARROW = `<svg class="ic ic--arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>`;
const CHEV = `<svg class="ic ic--chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`;
const CHECK = `<svg class="ic ic--check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
const iso = (cls = "") => `<svg class="${cls}" viewBox="${ISO_VB}" aria-hidden="true" focusable="false"><use href="#iso"/></svg>`;
const SVC = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));
const plain = (html) => html.replace(/<\/?em>/g, "");
const btn = (href, label, cls = "") => `<a class="btn ${cls}" href="${href}"><span>${label}</span>${ARROW}</a>`;
const MAIL_SVG = `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4 7.5l8 5.6 8-5.6"/></svg>`;
const IG_SVG = `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor"/></svg>`;

/* ---------------- SEO ---------------- */
const PAGES = [];
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

/* ---------------- estructura ---------------- */
function head({ title, seo, desc, path: p, ld = [] }) {
  const full = p === "/" ? "KROMA — Consultoría tecnológica para empresas en Uruguay" : `${seo || title} — KROMA`;
  const url = SITE_URL + (p === "/" ? "/" : p);
  const is404 = p === "/404";
  const graph = is404 ? [] : [ORG_LD, ...ld];
  return `<!DOCTYPE html>
<html lang="es-UY">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${full}</title>
<meta name="description" content="${esc(desc)}">${is404 ? '\n<meta name="robots" content="noindex">' : `\n<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#f5f1e8">
<meta name="color-scheme" content="light">
<meta property="og:type" content="website">${is404 ? "" : `\n<meta property="og:url" content="${url}">`}
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:locale" content="es_UY">
<meta property="og:site_name" content="KROMA">
<meta property="og:image" content="${SITE_URL}/assets/img/og-kroma.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">${graph.length ? `\n<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>` : ""}
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/img/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/schibsted-grotesk-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css">
<script>(function(h){h.classList.add("js");if(!matchMedia("(prefers-reduced-motion: reduce)").matches){h.classList.add("anim");setTimeout(function(){if(!window.KROMA_ANIM)h.classList.remove("anim")},2500)}})(document.documentElement)</script>
<script src="/assets/js/vendor/gsap.min.js" defer></script>
<script src="/assets/js/vendor/ScrollTrigger.min.js" defer></script>
<script src="/assets/js/vendor/SplitText.min.js" defer></script>
${p === "/proyectos" ? '<script src="/assets/js/vendor/Flip.min.js" defer></script>\n' : ""}<script src="/assets/js/site.js" defer></script>
<script type="speculationrules">{"prefetch":[{"source":"document","where":{"href_matches":"/*"},"eagerness":"moderate"}]}</script>
</head>`;
}

const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><symbol id="iso" viewBox="${ISO_VB}"><path fill="currentColor" d="${ISO_D}"/></symbol></defs></svg>`;

function header(active) {
  const cur = (k) => (active === k || (k === "servicios" && active.startsWith("servicios")) ? ' aria-current="page"' : "");
  const svcItems = (cls) => SERVICES.map((s) => `<li><a class="${cls}" href="/servicios/${s.slug}"${active === "servicios/" + s.slug ? ' aria-current="page"' : ""}><span class="num">${s.n}</span><span class="${cls}-t">${s.name}</span><span class="${cls}-d">${s.short}</span></a></li>`).join("");
  return `<header class="hd" data-hd>
  <span class="hd__progress" aria-hidden="true" data-progress></span>
  <div class="wrap hd__in">
    <a class="brand" href="/" aria-label="KROMA, ir al inicio">${iso("brand__iso")}<span class="brand__word" aria-hidden="true">kroma</span></a>
    <nav class="nav" aria-label="Principal">
      <ul class="nav__list">
        <li><a class="nav__a" href="/"${cur("inicio")}>Inicio</a></li>
        <li><a class="nav__a" href="/nosotros"${cur("nosotros")}>Nosotros</a></li>
        <li class="nav__sub" data-sub>
          <a class="nav__a" href="/servicios"${cur("servicios")}>Servicios</a>
          <button class="nav__tg" type="button" aria-expanded="false" aria-controls="menu-servicios"><span class="sr">Mostrar los servicios</span>${CHEV}</button>
          <div class="menu" id="menu-servicios">
            <ul class="menu__list">${svcItems("menu__a")}</ul>
            <a class="menu__all" href="/servicios">Ver todos los servicios ${ARROW}</a>
          </div>
        </li>
        <li><a class="nav__a" href="/proyectos"${cur("proyectos")}>Proyectos</a></li>
      </ul>
    </nav>
    <a class="btn btn--sm hd__cta" href="/contacto"${cur("contacto")}><span>Hablemos</span>${ARROW}</a>
    <button class="hd__menu" type="button" aria-expanded="false" aria-controls="menu-movil" data-menu><span class="hd__menu-l">Menú</span><span class="hd__burger" aria-hidden="true"></span></button>
  </div>
  <div class="mnav" id="menu-movil" data-mnav hidden>
    <nav class="wrap" aria-label="Menú móvil">
      <ul class="mnav__list">
        <li><a href="/"${cur("inicio")}>Inicio</a></li>
        <li><a href="/nosotros"${cur("nosotros")}>Nosotros</a></li>
        <li><a href="/servicios"${cur("servicios")}>Servicios</a><ul class="mnav__sub">${SERVICES.map((s) => `<li><a href="/servicios/${s.slug}">${s.name}</a></li>`).join("")}</ul></li>
        <li><a href="/proyectos"${cur("proyectos")}>Proyectos</a></li>
        <li><a href="/contacto"${cur("contacto")}>Hablemos</a></li>
      </ul>
    </nav>
  </div>
</header>`;
}

const footer = `<footer class="ft">
  <div class="wrap">
    <div class="ft__top">
      <div class="ft__brand">
        <a class="brand brand--inv" href="/" aria-label="KROMA, ir al inicio">${iso("brand__iso")}<span class="brand__word" aria-hidden="true">kroma</span></a>
        <p>Consultoría tecnológica para empresas uruguayas. Te ayudamos a elegir la tecnología y a aprovecharla bien.</p>
      </div>
      <nav class="ft__col" aria-labelledby="ft-sitio"><h2 id="ft-sitio">Sitio</h2><ul><li><a href="/">Inicio</a></li><li><a href="/nosotros">Nosotros</a></li><li><a href="/servicios">Servicios</a></li><li><a href="/proyectos">Proyectos</a></li><li><a href="/contacto">Hablemos</a></li></ul></nav>
      <nav class="ft__col" aria-labelledby="ft-svc"><h2 id="ft-svc">Servicios</h2><ul>${SERVICES.map((s) => `<li><a href="/servicios/${s.slug}">${s.name}</a></li>`).join("")}</ul></nav>
      <div class="ft__col"><h2>Contacto</h2><ul>
        <li><a class="ft__ico" href="mailto:${EMAIL}">${MAIL_SVG}<span>${EMAIL}</span></a></li>
        <li><a class="ft__ico" href="${IG_URL}" target="_blank" rel="noopener">${IG_SVG}<span>${IG}</span><span class="sr"> (se abre en otra pestaña)</span></a></li>
        <li><a href="/contacto">Formulario de contacto</a></li>
      </ul></div>
    </div>
    <p class="ft__word" aria-hidden="true" data-word>${iso("ft__iso")}<span>kroma</span></p>
    <div class="ft__bottom"><span>© <span data-year>2026</span> KROMA</span><span>Hecho en Montevideo, Uruguay</span></div>
  </div>
</footer>`;

function page({ path: p, title, seo, desc, active = "", body, ld }) {
  PAGES.push(p);
  return `${head({ title, seo, desc, path: p, ld })}
<body>
${sprite}
<a class="skip" href="#contenido">Saltar al contenido</a>
${header(active)}
<main id="contenido" tabindex="-1">
${body}
</main>
${footer}
<div class="curtain" aria-hidden="true" data-curtain><svg class="curtain__edge" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0 20 C 25 0, 75 0, 100 20 Z"/></svg><div class="curtain__body">${iso("curtain__iso")}</div></div>
</body>
</html>
`;
}

function write(rel, html) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

/* ---------------- componentes ---------------- */
const crumbs = (items) => `<nav class="crumbs" aria-label="Ruta"><ol>${items.map(([t, u], i) => (i < items.length - 1 ? `<li><a href="${u}">${t}</a></li>` : `<li aria-current="page">${t}</li>`)).join("")}</ol></nav>`;

// Sección asimétrica: título a la izquierda (columnas 1–5), contenido a la derecha.
const sec = ({ id, title, intro = "", body, cls = "", tone = "" }) => `<section class="sec ${cls}${tone ? " tone-" + tone : ""}" aria-labelledby="${id}">
  <div class="wrap sec__grid">
    <div class="sec__head"><h2 id="${id}" class="h2">${title}</h2>${intro ? `<p class="sec__intro">${intro}</p>` : ""}</div>
    <div class="sec__body">${body}</div>
  </div>
</section>`;

// Filas de servicios: numeradas (lo pide el brief), toda la fila es un enlace, con vista previa en escritorio.
const svcRows = (hTag = "h3") => `<ol class="rows">
  ${SERVICES.map((s) => `<li class="row"><a class="row__a" href="/servicios/${s.slug}">
    <span class="row__n num">${s.n}</span>
    <${hTag} class="row__t">${s.name}</${hTag}>
    <span class="row__d">${s.short}</span>
    <span class="row__go" aria-hidden="true">${ARROW}</span>
    <span class="row__pv" aria-hidden="true">${SERVICE_ART[s.slug]}</span>
  </a></li>`).join("\n  ")}
</ol>`;

const projCard = (pr, hTag = "h3") => `<article class="pc" data-svc="${pr.service}">
  <a class="pc__a" href="/proyectos/${pr.slug}">
    <span class="pc__art">${PROJECT_ART[pr.slug]}</span>
    <span class="pc__meta"><span class="tag">Concepto</span><span>${pr.serviceName}</span></span>
    <${hTag} class="pc__t">${pr.title}</${hTag}>
    <span class="pc__d">${pr.context}</span>
    <span class="pc__go">Ver el concepto ${ARROW}</span>
  </a>
</article>`;

// Cierre: frase propia + primer paso del contacto. Formulario GET real hacia /contacto (funciona sin JavaScript).
const EXAMPLES = {
  webs: "renovar la web de la empresa", automatizaciones: "dejar de cargar pedidos a mano",
  integraciones: "conectar la tienda con el stock", "identidad-digital": "publicar con una imagen coherente",
  "consultoria-tecnologica": "elegir un sistema de gestión",
};
let closingN = 0;
function closing({ title = "¿Por dónde empezamos?", text = "Contanos en una línea qué querés mejorar. Te respondemos con una propuesta de primer paso, sin compromiso.", servicio = "" } = {}) {
  const id = `cierre-${++closingN}`;
  return `<section class="close" aria-labelledby="${id}-t">
  <div class="wrap close__grid">
    <div class="close__head"><h2 id="${id}-t" class="h2">${title}</h2><p>${text}</p></div>
    <form class="close__form" action="/contacto" method="get">
      <label for="${id}-m">¿Qué querés mejorar?</label>
      <div class="close__row">
        <input id="${id}-m" name="mensaje" type="text" maxlength="300" autocomplete="off" placeholder="Por ejemplo: ${EXAMPLES[servicio] || "ordenar los pedidos de WhatsApp"}">
        ${servicio ? `<input type="hidden" name="servicio" value="${servicio}">` : ""}
        <button class="btn btn--light" type="submit"><span>Continuar</span>${ARROW}</button>
      </div>
      <p class="close__note">Te lleva al formulario con tu mensaje ya escrito. También podés escribir a <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
    </form>
  </div>
</section>`;
}

/* ---------------- sección fijada: de v1 a v2 ---------------- */
const CHIPS = ["WhatsApp", "Planilla de Excel", "Email", "Facturación", "Cuaderno de pedidos", "Instagram"];
const ring = (i) => { const a = (-90 + i * 60) * Math.PI / 180; return [50 + 36 * Math.cos(a), 50 + 36 * Math.sin(a)]; };
const STAGES = ["Hoy: herramientas sueltas", "Ordenamos por impacto", "Conectamos lo que sirve", "Funcionando, con tu equipo"];
function story() {
  return `<section class="story" aria-labelledby="story-t" data-story>
  <div class="story__pin">
    <div class="wrap story__grid">
      <div class="story__copy">
        <h2 id="story-t" class="h2">De la versión 1 a la 2, en cuatro etapas.</h2>
        <div class="story__bar" aria-hidden="true"><span data-story-bar></span></div>
        <ol class="story__steps">
          ${PROCESS.map((p, i) => `<li class="story__st${i === 0 ? " is-on" : ""}" data-st="${i}"><span class="story__n num">0${i + 1}</span><div><h3 class="h3">${p.t}</h3><p>${p.d}</p><p class="step__out"><span>Recibís</span>${p.out}</p></div></li>`).join("\n          ")}
        </ol>
        <p class="story__more"><a class="link link--inv" href="/nosotros#proceso">Ver el proceso en detalle ${ARROW}</a></p>
      </div>
      <div class="story__stage" aria-hidden="true">
        <div class="stage" data-stage data-caps="${esc(JSON.stringify(STAGES))}">
          <svg class="stage__lines" viewBox="0 0 100 100" preserveAspectRatio="none">${CHIPS.map((_, i) => { const [x, y] = ring(i); return `<path pathLength="1" d="M50 50L${x.toFixed(2)} ${y.toFixed(2)}"/>`; }).join("")}</svg>
          <div class="stage__hub">${iso()}</div>
          ${CHIPS.map((c, i) => { const [x, y] = ring(i); return `<div class="chip" data-chip="${i}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%"><span class="chip__t">${c}</span><span class="chip__bar"><i></i></span></div>`; }).join("\n          ")}
          <div class="stage__dash" data-dash>
            <p class="dash__hd"><span>Tu negocio</span><span class="dash__v">v2</span></p>
            <ul>${["Pedidos que se registran solos", "Stock sincronizado con la tienda", "Consultas ordenadas en un lugar", "Equipo capacitado y autónomo"].map((t) => `<li>${CHECK}<span>${t}</span></li>`).join("")}</ul>
          </div>
          <p class="stage__cap" data-cap>${STAGES[2]}</p>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

/* ---------------- Inicio ---------------- */
const RELEASE = [
  ["webs", "Web nueva, con consultas que llegan ordenadas"],
  ["automatizaciones", "Pedidos registrados sin cargarlos a mano"],
  ["integraciones", "Stock de la tienda y del sistema, sincronizado"],
  ["identidad-digital", "Plantillas para publicar con tu marca"],
  ["consultoria-tecnologica", "Herramientas elegidas con criterio"],
];
const releasePanel = `<div class="rel" data-release>
  <div class="rel__hd">
    <span class="rel__app">${iso()}</span>
    <div class="rel__who"><p class="rel__name">Tu negocio</p><p class="rel__state" data-rel-state>Versión 2 instalada</p></div>
    <p class="rel__ver"><span class="sr">De la versión 1 a la versión 2</span><span class="rel__from" aria-hidden="true">v1</span>${ARROW}<span class="rel__to" aria-hidden="true">v2</span></p>
  </div>
  <p class="rel__label" id="rel-t">Notas de la versión</p>
  <ul class="rel__list" aria-labelledby="rel-t">
    ${RELEASE.map(([slug, t]) => `<li class="rel__it is-done"><a href="/servicios/${slug}"><span class="rel__chk">${CHECK}</span><span class="rel__txt">${t}</span><span class="rel__svc">${SVC[slug].name}</span></a></li>`).join("\n    ")}
  </ul>
  <div class="rel__ft"><span class="rel__bar"><span data-rel-bar></span></span><p class="rel__count" data-rel-count>${RELEASE.length} de ${RELEASE.length} cambios aplicados</p></div>
</div>`;

const home = page({
  path: "/", title: "Inicio", active: "inicio",
  desc: "Consultora tecnológica para empresas uruguayas: te ayudamos a elegir y aprovechar webs, automatizaciones, integraciones, identidad digital y más.",
  body: `<section class="hero" aria-labelledby="hero-t" data-hero>
  <div class="hero__bg" aria-hidden="true"></div>
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <h1 id="hero-t" class="h1">Tu negocio.<br>Su próxima versión.</h1>
      <p class="lead">Consultoría tecnológica para empresas. Elegimos, construimos y conectamos la tecnología que tu empresa necesita, a su escala.</p>
      <div class="hero__ctas">${btn("/contacto", "Hablemos")}<a class="link" href="/servicios">Ver servicios ${ARROW}</a></div>
    </div>
    <div class="hero__panel">${releasePanel}<p class="hero__note">Así se ve una actualización: cada cambio es un servicio. Tocá uno para ver cómo lo hacemos.</p></div>
  </div>
</section>
${sec({ id: "servicios-t", title: "Qué hacemos", intro: "Cinco servicios que se combinan según lo que necesita tu empresa. Empezamos por entender el problema, no por la herramienta.", body: svcRows(), cls: "sec--rows" })}
<section class="sec proof" aria-labelledby="proof-t">
  <div class="wrap sec__grid">
    <div class="sec__head"><h2 id="proof-t" class="h2">Lo que proponemos, lo aplicamos acá.</h2><p class="sec__intro">Una web lenta o difícil de usar pierde consultas. Medimos este sitio con las mismas herramientas que usamos en cada proyecto.</p></div>
    <div class="sec__body">
      <dl class="metrics">
        <div><dt>Rendimiento en celular</dt><dd><span class="num" data-count="${METRICS.perf}">${METRICS.perf}</span><small>/100</small></dd></div>
        <div><dt>Accesibilidad</dt><dd><span class="num" data-count="${METRICS.a11y}">${METRICS.a11y}</span><small>/100</small></dd></div>
        <div><dt>Contenido principal visible</dt><dd><span class="num">${METRICS.lcp}</span></dd></div>
        <div><dt>Peso de esta página</dt><dd><span class="num">${METRICS.weight}</span></dd></div>
      </dl>
      <p class="fine">Medido con Lighthouse 12 en un celular simulado con conexión 4G lenta, el ${METRICS.date}.</p>
    </div>
  </div>
</section>
${story()}
<section class="stmt tone-cobalt" aria-labelledby="stmt-t">
  <div class="wrap stmt__grid">
    <h2 id="stmt-t" class="stmt__t" data-words>La tecnología no debería ser un privilegio de las grandes empresas.</h2>
    <div class="stmt__body">
      <p>Hoy existe una herramienta para casi todo. El desafío ya no es encontrarla: es saber cuál conviene, cuánto invertir y cómo hacer que tu equipo la use.</p>
      <p>No vendemos ninguna herramienta. Te recomendamos la que tiene sentido para tu empresa, aunque sea la más simple.</p>
      <a class="link link--inv" href="/nosotros">Por qué existe KROMA ${ARROW}</a>
    </div>
  </div>
</section>
${sec({ id: "proyectos-t", title: "Así lo resolveríamos", intro: "Son conceptos: ejemplos de cómo abordamos necesidades frecuentes. No corresponden a clientes reales.", body: `<div class="pcs pcs--2">${PROJECTS.slice(0, 2).map((p) => projCard(p)).join("")}</div><p class="sec__more"><a class="link" href="/proyectos">Ver los cuatro conceptos ${ARROW}</a></p>` })}
${closing()}`,
});
write("index.html", home);

/* ---------------- Servicios ---------------- */
const GUIDE = [
  ["Mis clientes no encuentran la información o la web está desactualizada", "webs"],
  ["Mi equipo copia datos a mano o repite las mismas tareas todos los días", "automatizaciones"],
  ["Uso varios sistemas que no se hablan y cargo lo mismo dos veces", "integraciones"],
  ["Cada pieza que publicamos se ve distinta", "identidad-digital"],
  ["No sé qué herramienta elegir ni cuánto invertir", "consultoria-tecnologica"],
];
write("servicios/index.html", page({
  path: "/servicios", title: "Servicios", seo: "Servicios de tecnología para empresas", active: "servicios",
  desc: "Webs, automatizaciones, integraciones, identidad digital y consultoría tecnológica para empresas uruguayas.",
  ld: [crumbsLd([["Servicios", "/servicios"]])],
  body: `<section class="phero" aria-labelledby="t">
  <div class="wrap">
    ${crumbs([["Inicio", "/"], ["Servicios", "/servicios"]])}
    <div class="phero__grid">
      <h1 id="t" class="h1">Elegimos, construimos y conectamos la tecnología de tu empresa.</h1>
      <p class="lead">Cinco servicios que funcionan solos o combinados. Cada uno empieza por entender cómo trabaja tu equipo hoy.</p>
    </div>
  </div>
</section>
<section class="sec sec--rows sec--flush" aria-label="Lista de servicios"><div class="wrap">${svcRows("h2")}</div></section>
${sec({ id: "guia-t", title: "¿No sabés cuál necesitás?", intro: "Empezá por el problema. Si te reconocés en más de uno, es normal: en la primera conversación ordenamos por dónde conviene empezar.", body: `<table class="guide">
  <caption class="sr">Guía para elegir un servicio según el problema</caption>
  <thead><tr><th scope="col">Si te pasa esto</th><th scope="col">Empezá por</th></tr></thead>
  <tbody>${GUIDE.map(([q, s]) => `<tr><td>${q}</td><td><a href="/servicios/${s}">${SVC[s].name}</a></td></tr>`).join("")}</tbody>
</table>` })}
${closing()}`,
}));

// Demos explicativas: cada una se mueve solo cuando la persona actúa.
function demo(slug) {
  if (slug === "webs") return `<figure class="demo demo--webs" data-demo="webs">
  <div class="dw" data-depth>
    <div class="dw__browser" data-layer="0.4">${WEB_LAYERS.browser}</div>
    <div class="dw__phone" data-layer="1">${WEB_LAYERS.phone}</div>
  </div>
  <figcaption>La misma web en computadora y en celular. Concepto para un estudio contable.</figcaption>
</figure>`;
  if (slug === "automatizaciones") {
    const st = [["Recibido", "Llega el pedido por el formulario"], ["Validado", "Se revisan cliente, productos y cantidades"], ["En la planilla", "Se registra sin tipear"], ["Avisado", "Confirmación al cliente y aviso al depósito"]];
    return `<figure class="demo demo--auto" data-demo="auto">
  <div class="panel">
    <div class="panel__hd"><p class="panel__t">Pedido <span class="num" data-order>1042</span></p><p class="panel__s" data-auto-state>Listo para registrar</p></div>
    <ol class="flow">${st.map(([t, d], i) => `<li class="flow__it" data-step="${i}"><span class="flow__dot">${CHECK}</span><span class="flow__t">${t}</span><span class="flow__d">${d}</span></li>`).join("")}</ol>
    <div class="panel__ft"><button class="btn btn--sm" type="button" data-auto-run><span>Registrar un pedido de prueba</span></button><p class="panel__log" aria-live="polite" data-auto-log></p></div>
  </div>
  <figcaption>Un pedido avanza solo por sus etapas. Concepto para una distribuidora.</figcaption>
</figure>`;
  }
  if (slug === "integraciones") return `<figure class="demo demo--integ" data-demo="integ">
  <div class="sync">
    <div class="sys"><p class="sys__t">Tienda online</p><p class="sys__p">Café molido 500 g</p><p class="sys__q"><span class="num" data-q="shop">24</span> en stock</p></div>
    <div class="sync__wire" aria-hidden="true"><span class="sync__pulse" data-pulse></span></div>
    <div class="sys sys--ink"><p class="sys__t">Sistema de gestión</p><p class="sys__p">Café molido 500 g</p><p class="sys__q"><span class="num" data-q="erp">24</span> en stock</p><p class="sys__s">Ventas web hoy: <span class="num" data-q="sales">0</span></p></div>
  </div>
  <div class="demo__ctl"><button class="btn btn--sm" type="button" data-integ-run><span>Vender una unidad en la tienda</span></button><p aria-live="polite" class="demo__status" data-integ-status>Los dos sistemas muestran el mismo stock.</p></div>
  <figcaption>Una venta en la tienda actualiza el sistema de gestión, sin cargarla dos veces.</figcaption>
</figure>`;
  if (slug === "identidad-digital") {
    const pieces = [["post", "Medialunas recién salidas."], ["story", "Hoy abrimos a las 8."], ["menu", "Menú"], ["card", "ronda"]];
    return `<figure class="demo demo--ident" data-demo="ident" data-on="false">
  <div class="kit">${pieces.map(([k, t]) => `<div class="kit__p kit__p--${k}"><span class="kit__mark" aria-hidden="true"></span><span class="kit__txt">${t}</span></div>`).join("")}</div>
  <div class="demo__ctl"><button class="switch" type="button" role="switch" aria-checked="false" data-ident-run><span class="switch__track" aria-hidden="true"><span></span></span><span>Aplicar el sistema visual</span></button></div>
  <figcaption>Las mismas piezas, antes y después de tener reglas de color, tipografía y marca. Concepto para una cafetería.</figcaption>
</figure>`;
  }
  // consultoría: elegir según qué pesa más
  const OPTS = [
    ["Planilla compartida y formulario", 2, 3, 2, "Si el presupuesto manda, una planilla compartida con un formulario ordena las consultas casi sin costo. Alcanza para empezar."],
    ["CRM liviano", 3, 2, 2, "Si lo que más pesa es resolver bien el problema, un CRM liviano reúne las consultas y su seguimiento en un solo lugar."],
    ["Conectar lo que ya usás", 2, 2, 3, "Si el equipo necesita adoptar el cambio rápido, conviene llevar los canales que ya usa a una bandeja común."],
    ["Sistema a medida", 3, 1, 1, ""],
  ];
  const bars = (v, k) => `<span class="bars" role="img" aria-label="${k}: ${v} de 3">${[1, 2, 3].map((n) => `<i${n <= v ? ' class="on"' : ""}></i>`).join("")}</span>`;
  return `<figure class="demo demo--consult" data-demo="consult">
  <div class="panel">
    <div class="panel__hd"><p class="panel__t">Ordenar las consultas de clientes</p><p class="panel__s">Ejemplo ilustrativo</p></div>
    <fieldset class="prio"><legend>¿Qué pesa más para tu empresa?</legend>
      ${[["u", "Que resuelva más"], ["c", "Que cueste menos"], ["s", "Que sea fácil de adoptar"]].map(([k, l], i) => `<label><input type="radio" name="prio" value="${k}"${i === 0 ? " checked" : ""}><span>${l}</span></label>`).join("")}
    </fieldset>
    <table class="opts"><caption class="sr">Opciones evaluadas</caption><thead><tr><th scope="col">Opción</th><th scope="col">Utilidad</th><th scope="col">Costo</th><th scope="col">Adopción</th></tr></thead>
      <tbody>${OPTS.map(([t, u, c, s, why]) => `<tr data-u="${u}" data-c="${c}" data-s="${s}" data-why="${why}"${t === "CRM liviano" ? ' class="is-best"' : ""}><th scope="row">${t}</th><td>${bars(u, "Utilidad")}</td><td>${bars(c, "Costo accesible")}</td><td>${bars(s, "Facilidad de adopción")}</td></tr>`).join("")}</tbody>
    </table>
    <p class="panel__log" aria-live="polite" data-consult-why>${OPTS[1][4]}</p>
  </div>
  <figcaption>La mejor opción depende de qué pesa más. No representamos a ninguna marca.</figcaption>
</figure>`;
}

const projBySvc = (slug) => PROJECTS.filter((p) => p.service === slug);
for (const [idx, s] of SERVICES.entries()) {
  const d = SVC_PAGES[s.slug];
  const next = SERVICES[(idx + 1) % SERVICES.length];
  const rel = projBySvc(s.slug);
  write(`servicios/${s.slug}/index.html`, page({
    path: `/servicios/${s.slug}`, title: s.name, seo: d.seo, active: "servicios/" + s.slug, desc: d.desc,
    ld: [
      { "@type": "Service", name: s.name, serviceType: d.seo, description: d.desc, url: `${SITE_URL}/servicios/${s.slug}`, provider: { "@id": SITE_URL + "/#kroma" }, areaServed: { "@type": "Country", name: "Uruguay" } },
      { "@type": "FAQPage", mainEntity: d.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      crumbsLd([["Servicios", "/servicios"], [s.name, `/servicios/${s.slug}`]]),
    ],
    body: `<section class="phero phero--svc" aria-labelledby="t">
  <div class="wrap">
    ${crumbs([["Inicio", "/"], ["Servicios", "/servicios"], [s.name, `/servicios/${s.slug}`]])}
    <div class="svch">
      <div class="svch__copy">
        <p class="svch__n"><span class="num">${s.n}</span> ${s.name}</p>
        <h1 id="t" class="h1 h1--svc">${d.title.join(" ")}</h1>
        <p class="lead">${d.lead}</p>
        <div class="hero__ctas">${btn(`/contacto?servicio=${s.slug}`, d.cta || "Consultar por " + s.name.toLowerCase())}<a class="link" href="#incluye-t">Qué incluye ${ARROW}</a></div>
      </div>
      <div class="svch__demo">${demo(s.slug)}</div>
    </div>
  </div>
</section>
<section class="sec problem" aria-labelledby="problema-t">
  <div class="wrap sec__grid">
    <div class="sec__head"><h2 id="problema-t" class="h2">Qué resuelve</h2></div>
    <div class="sec__body"><p class="problem__t">${plain(d.problem)}</p></div>
  </div>
</section>
${sec({ id: "incluye-t", title: "Qué incluye", body: `<ul class="inc">${d.includes.map(([t, x]) => `<li><h3 class="h3">${t}</h3><p>${x}</p></li>`).join("")}</ul>` })}
${sec({ id: "ejemplos-t", title: "Dónde suele aplicarse", body: `<dl class="ex">${d.examples.map(([t, x]) => `<div><dt>${t}</dt><dd>${x}</dd></div>`).join("")}</dl>` })}
${sec({ id: "pasos-t", title: "Cómo lo hacemos", intro: "Cada etapa termina con algo concreto para revisar juntos.", cls: "sec--steps", body: `<ol class="steps steps--4">${d.steps.map(([t, x], i) => `<li class="step"><span class="step__n num">0${i + 1}</span><h3 class="h3">${t}</h3><p>${x}</p></li>`).join("")}</ol>` })}
${rel.length && s.slug !== "webs" ? sec({ id: "concepto-t", title: "Un ejemplo", intro: "Concepto ilustrativo, no un cliente real.", body: `<div class="pcs pcs--1">${rel.map((p) => projCard(p)).join("")}</div>` }) : ""}
${sec({ id: "faq-t", title: "Preguntas frecuentes", body: `<div class="faq">${d.faq.map(([q, a]) => `<details><summary><span>${q}</span>${CHEV}</summary><p>${a}</p></details>`).join("")}</div><p class="sec__more">Siguiente servicio: <a class="link" href="/servicios/${next.slug}">${next.name} ${ARROW}</a></p>` })}
${closing({ title: `Hablemos de ${s.name.toLowerCase()}.`, text: "Contanos en una línea qué necesitás. Te respondemos con una propuesta de primer paso, sin compromiso.", servicio: s.slug })}`,
  }));
}

/* ---------------- Proyectos ---------------- */
write("proyectos/index.html", page({
  path: "/proyectos", title: "Proyectos", seo: "Proyectos conceptuales", active: "proyectos",
  desc: "Conceptos de proyectos de KROMA: ejemplos de cómo resolveríamos necesidades frecuentes de empresas uruguayas.",
  ld: [crumbsLd([["Proyectos", "/proyectos"]])],
  body: `<section class="phero" aria-labelledby="t">
  <div class="wrap">
    ${crumbs([["Inicio", "/"], ["Proyectos", "/proyectos"]])}
    <div class="phero__grid">
      <h1 id="t" class="h1">Así lo resolveríamos.</h1>
      <p class="lead">Cuatro conceptos que muestran cómo abordamos necesidades frecuentes. Son ejemplos ilustrativos: no corresponden a clientes reales ni muestran resultados.</p>
    </div>
  </div>
</section>
<section class="sec sec--flush" aria-label="Conceptos">
  <div class="wrap">
    <div class="filter" role="group" aria-label="Filtrar por servicio" data-filter>
      <button type="button" aria-pressed="true" data-f="all">Todos</button>
      ${[...new Set(PROJECTS.map((p) => p.service))].map((k) => `<button type="button" aria-pressed="false" data-f="${k}">${SVC[k].name}</button>`).join("")}
      <p class="filter__n" aria-live="polite" data-filter-n>${PROJECTS.length} conceptos</p>
    </div>
    <div class="pcs pcs--2">${PROJECTS.map((p) => projCard(p, "h2")).join("")}</div>
  </div>
</section>
${closing()}`,
}));

for (const [i, pr] of PROJECTS.entries()) {
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  write(`proyectos/${pr.slug}/index.html`, page({
    path: `/proyectos/${pr.slug}`, title: pr.title, active: "proyectos",
    desc: (() => { const t = `Proyecto conceptual de KROMA: ${pr.title.toLowerCase()}. ${pr.context}`; return t.length <= 158 ? t : t.slice(0, t.lastIndexOf(" ", 157)).replace(/[,.;:]$/, "") + "…"; })(),
    ld: [crumbsLd([["Proyectos", "/proyectos"], [pr.title, `/proyectos/${pr.slug}`]])],
    body: `<section class="phero" aria-labelledby="t">
  <div class="wrap">
    ${crumbs([["Inicio", "/"], ["Proyectos", "/proyectos"], [pr.title, `/proyectos/${pr.slug}`]])}
    <div class="phero__grid">
      <h1 id="t" class="h1 h1--case">${pr.title}</h1>
      <div class="case__facts">
        <p><span class="tag">Concepto</span></p>
        <dl><div><dt>Servicio</dt><dd><a href="/servicios/${pr.service}">${pr.serviceName}</a></dd></div><div><dt>Resultado</dt><dd>No aplica: es un ejemplo ilustrativo, no un cliente real.</dd></div></dl>
      </div>
    </div>
    <div class="case__art">${PROJECT_ART[pr.slug]}</div>
  </div>
</section>
<section class="sec" aria-label="Detalle del concepto">
  <div class="wrap case__grid">
    <div class="case__text">
      <h2 class="h3">Contexto</h2><p>${pr.context}</p>
      <h2 class="h3">Necesidad</h2><p>${pr.need}</p>
      <h2 class="h3">Solución</h2><p>${pr.solution}</p>
    </div>
    <aside class="case__side" aria-labelledby="entregables-t"><h2 id="entregables-t" class="h3">Entregables</h2><ul class="checks">${pr.deliverables.map((x) => `<li>${CHECK}<span>${x}</span></li>`).join("")}</ul></aside>
  </div>
  <div class="wrap"><p class="sec__more">Siguiente concepto: <a class="link" href="/proyectos/${next.slug}">${next.title} ${ARROW}</a></p></div>
</section>
${closing({ title: "¿Te pasa algo parecido?", text: "Contanos tu caso en una línea y lo vemos juntos.", servicio: pr.service })}`,
  }));
}

/* ---------------- Nosotros ---------------- */
write("nosotros/index.html", page({
  path: "/nosotros", title: "Nosotros", seo: "Nosotros: consultora tecnológica en Uruguay", active: "nosotros",
  desc: "KROMA es una consultora tecnológica uruguaya. Nuestro propósito es democratizar la digitalización de las empresas: elegir bien e implementar con criterio.",
  body: `<section class="phero phero--about" aria-labelledby="t">
  <div class="wrap">
    ${crumbs([["Inicio", "/"], ["Nosotros", "/nosotros"]])}
    <div class="about__grid">
      <div>
        <h1 id="t" class="h1">Digitalizar también es elegir bien.</h1>
        <p class="lead">Somos una consultora tecnológica uruguaya. Nuestro propósito es democratizar la digitalización de las empresas.</p>
      </div>
      <figure class="about__ph">
        <picture><source type="image/webp" srcset="/assets/img/arq-escalera-curva-900.webp 900w, /assets/img/arq-escalera-curva.webp 1536w" sizes="(max-width: 900px) 92vw, 44vw"><img src="/assets/img/arq-escalera-curva-900.jpg" alt="Escalera curva de hormigón vista desde abajo, en blanco y negro" width="900" height="600" fetchpriority="high"></picture>
      </figure>
    </div>
  </div>
</section>
${sec({ id: "proposito-t", title: "Por qué existimos", body: `<div class="prose"><p class="problem__t">Nunca hubo tantas herramientas disponibles. Pero más opciones no siempre significan mejores decisiones.</p>
<p>Para muchas empresas, digitalizarse se volvió una lista de suscripciones que nadie termina de usar. El valor no está en sumar tecnología, sino en elegirla bien e implementarla con criterio.</p>
<p>Democratizar la digitalización es eso: que una empresa chica o mediana pueda acceder al mismo criterio que una grande, con soluciones a su escala.</p></div>` })}
${sec({ id: "principios-t", title: "Lo que nos guía", body: `<dl class="ex ex--3">${PRINCIPLES.map(([t, x]) => `<div><dt>${t}</dt><dd>${x}</dd></div>`).join("")}</dl>` })}
<section class="sec proc" id="proceso" aria-labelledby="proceso-t">
  <div class="wrap sec__grid">
    <div class="sec__head proc__head"><h2 id="proceso-t" class="h2">Cómo trabajamos</h2><p class="sec__intro">Cuatro etapas claras. En cada una sabés qué hacemos y qué recibís.</p></div>
    <ol class="sec__body proc__list">
      ${PROCESS.map((p, i) => `<li class="proc__it"><p class="proc__n num">0${i + 1}</p><h3 class="h3">${p.t}</h3><p>${p.d}</p><ul class="checks">${p.a.map((a) => `<li>${CHECK}<span>${a}</span></li>`).join("")}</ul><p class="step__out"><span>Recibís</span>${p.out}</p></li>`).join("\n      ")}
    </ol>
  </div>
</section>
${closing({ title: "Una primera conversación alcanza.", text: "Para identificar por dónde conviene empezar. Contanos en una línea qué querés mejorar." })}`,
}));

/* ---------------- Contacto ---------------- */
write("contacto/index.html", page({
  path: "/contacto", title: "Hablemos", seo: "Contacto: contanos qué querés mejorar", active: "contacto",
  desc: "Contale a KROMA qué querés mejorar en tu empresa: webs, automatizaciones, integraciones, identidad digital o consultoría tecnológica.",
  body: `<section class="phero phero--contact" aria-labelledby="t">
  <div class="wrap">
    ${crumbs([["Inicio", "/"], ["Hablemos", "/contacto"]])}
    <div class="contact">
      <div class="contact__intro">
        <h1 id="t" class="h1">Contanos en qué estás.</h1>
        <p class="lead">Con estos datos preparamos la primera conversación. No hace falta que sepas qué herramienta necesitás.</p>
        <h2 class="h3">Qué pasa después</h2>
        <ol class="next">
          <li>Leemos tu mensaje y vemos si podemos ayudarte.</li>
          <li>Te respondemos por el medio que nos dejes.</li>
          <li>Coordinamos una primera conversación para entender tu caso.</li>
        </ol>
        <p class="contact__alt">¿Preferís escribir directo? <a href="mailto:${EMAIL}">${EMAIL}</a> o <a href="${IG_URL}" target="_blank" rel="noopener">${IG}<span class="sr"> (se abre en otra pestaña)</span></a>.</p>
      </div>
      <form class="form" id="contact-form" action="${FORM_ENDPOINT.replace("/ajax", "")}" method="post" novalidate data-endpoint="${FORM_ENDPOINT}">
        <div class="field"><label for="f-nombre">Nombre</label><input id="f-nombre" name="nombre" type="text" autocomplete="name" required aria-describedby="e-nombre"><p class="field__err" id="e-nombre" data-err></p></div>
        <div class="field"><label for="f-contacto">Email o teléfono</label><p class="field__hint" id="h-contacto">Usamos este dato solo para responderte.</p><input id="f-contacto" name="contacto" type="text" autocomplete="email" required aria-describedby="h-contacto e-contacto"><p class="field__err" id="e-contacto" data-err></p></div>
        <div class="field"><label for="f-servicio">Servicio de interés</label><select id="f-servicio" name="servicio" aria-describedby="e-servicio"><option value="">Todavía no sé</option>${SERVICES.map((s) => `<option value="${s.slug}">${s.name}</option>`).join("")}</select><p class="field__err" id="e-servicio" data-err></p></div>
        <div class="field"><label for="f-mensaje">Mensaje</label><textarea id="f-mensaje" name="mensaje" rows="6" required aria-describedby="e-mensaje"></textarea><p class="field__err" id="e-mensaje" data-err></p></div>
        <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <input type="hidden" name="_subject" value="Nueva consulta desde la web de KROMA">
        <input type="hidden" name="_template" value="table">
        <input type="hidden" name="_captcha" value="false">
        <div class="form__ft"><button class="btn" type="submit" data-submit><span data-submit-l>Enviar mensaje</span>${ARROW}</button><p class="fine">Todos los campos son obligatorios, salvo el servicio.</p></div>
        <div class="form__status" role="status" aria-live="polite" tabindex="-1" data-status></div>
      </form>
    </div>
  </div>
</section>`,
}));

/* ---------------- 404 ---------------- */
write("404.html", page({
  path: "/404", title: "Página no encontrada", desc: "La página que buscás no existe.",
  body: `<section class="phero phero--404" aria-labelledby="t">
  <div class="wrap">
    <div class="phero__grid">
      <h1 id="t" class="h1">Esta página no existe.</h1>
      <div><p class="lead">Puede que el enlace haya cambiado o tenga un error de tipeo.</p><div class="hero__ctas">${btn("/", "Ir al inicio")}<a class="link" href="/contacto">Escribinos ${ARROW}</a></div></div>
    </div>
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
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
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
fs.writeFileSync(path.join(OUT, "assets/img/favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 ${parseFloat(ISO_VB.split(" ")[2]) + 16} ${parseFloat(ISO_VB.split(" ")[3]) + 16}"><path fill="#0053fd" d="${ISO_D}"/></svg>`);
console.log(`ok: ${PAGES.length} páginas`);
