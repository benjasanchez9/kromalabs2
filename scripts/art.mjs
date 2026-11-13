// Ilustraciones de entregables para los proyectos conceptuales.
// Lienzo 1200 × 800 recortado con "slice": lo esencial vive en la zona segura x 290–910 / y 150–650,
// así se lee igual en 21:9 (caso), 4:3, 1:1 y 4:5 (tarjetas).
const C = { blue: "#0053fd", glow: "#4d8bff", black: "#070708", ivory: "#f5f1e8", sand: "#e9e2d2", bar: "#ddd4c1" };
const svg = (bg, body) =>
  `<svg class="art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><rect x="-800" y="-600" width="2800" height="2000" fill="${bg}"/>${body}</svg>`;
const t = (x, y, txt, size, { w = 400, fill = C.black, o = 1, a = "start", ls = 0 } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${w}" fill="${fill}"${o < 1 ? ` fill-opacity="${o}"` : ""}${a !== "start" ? ` text-anchor="${a}"` : ""}${ls ? ` letter-spacing="${ls}"` : ""}>${txt}</text>`;

// 1 · Web para un estudio profesional: sitio en escritorio + formulario en el celular
const web = svg(C.sand, `
  <rect x="282" y="164" width="520" height="490" rx="16" fill="${C.black}" fill-opacity=".08"/>
  <rect x="270" y="150" width="520" height="490" rx="16" fill="${C.ivory}"/>
  <path d="M270 166a16 16 0 0 1 16-16h488a16 16 0 0 1 16 16v24H270z" fill="${C.bar}"/>
  <circle cx="294" cy="170" r="5" fill="${C.black}" fill-opacity=".25"/><circle cx="311" cy="170" r="5" fill="${C.black}" fill-opacity=".25"/><circle cx="328" cy="170" r="5" fill="${C.black}" fill-opacity=".25"/>
  <rect x="356" y="160" width="200" height="20" rx="10" fill="${C.ivory}"/>${t(372, 175, "estudioarce.uy", 13, { o: 0.6 })}
  ${t(300, 234, "Estudio Arce", 19, { w: 800, ls: -0.3 })}
  ${t(548, 233, "Servicios", 13, { o: 0.7 })}${t(624, 233, "Preguntas", 13, { o: 0.7 })}${t(704, 233, "Contacto", 13, { o: 0.7 })}
  ${t(300, 316, "Tus cuentas,", 54, { w: 900, ls: -2 })}${t(300, 372, "en orden.", 54, { w: 900, ls: -2 })}
  ${t(300, 410, "Contabilidad, sueldos e impuestos", 17, { o: 0.7 })}${t(300, 433, "para empresas y profesionales.", 17, { o: 0.7 })}
  <rect x="300" y="456" width="196" height="44" rx="4" fill="${C.blue}"/>${t(320, 484, "Agendar consulta", 16, { w: 700, fill: C.ivory })}
  <path d="M300 528H700M300 570H700M300 612H700" stroke="${C.black}" stroke-opacity=".14" stroke-width="1.5"/>
  ${t(300, 555, "Contabilidad mensual", 16, { w: 600 })}${t(300, 597, "Sueldos y jornales", 16, { w: 600 })}
  <path d="M684 549h14M691 542v14M684 591h14M691 584v14" stroke="${C.black}" stroke-width="2" stroke-linecap="round"/>
  <rect x="735" y="300" width="190" height="370" rx="28" fill="${C.black}"/>
  <rect x="745" y="312" width="170" height="346" rx="20" fill="${C.ivory}"/>
  <rect x="805" y="320" width="50" height="6" rx="3" fill="${C.black}" fill-opacity=".2"/>
  ${t(760, 360, "¿Qué necesitás?", 18, { w: 800, ls: -0.3 })}
  ${t(760, 392, "Tipo de consulta", 12, { o: 0.6 })}
  <rect x="760" y="400" width="140" height="36" rx="6" fill="none" stroke="${C.black}" stroke-opacity=".3" stroke-width="1.5"/>${t(772, 423, "Sueldos", 14, { w: 600 })}
  <path d="M880 414l5 5 5-5" fill="none" stroke="${C.black}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  ${t(760, 462, "Nombre", 12, { o: 0.6 })}<rect x="760" y="470" width="140" height="36" rx="6" fill="none" stroke="${C.black}" stroke-opacity=".3" stroke-width="1.5"/>
  ${t(760, 532, "Email o teléfono", 12, { o: 0.6 })}<rect x="760" y="540" width="140" height="36" rx="6" fill="none" stroke="${C.black}" stroke-opacity=".3" stroke-width="1.5"/>
  <rect x="760" y="596" width="140" height="42" rx="6" fill="${C.blue}"/>${t(830, 623, "Enviar", 15, { w: 700, fill: C.ivory, a: "middle" })}
`);

// 2 · Automatización de pedidos: un pedido avanza por sus etapas y dispara dos avisos
const nodes = [[320, "Recibido"], [506, "Validado"], [693, "En la planilla"], [880, "Avisado"]];
const pedidos = svg(C.black, `
  ${t(300, 190, "Pedidos de hoy", 16, { w: 600, fill: C.ivory, o: 0.6 })}
  <rect x="324" y="200" width="360" height="150" rx="14" fill="${C.ivory}" fill-opacity=".1"/>
  <rect x="312" y="208" width="360" height="150" rx="14" fill="${C.ivory}" fill-opacity=".18"/>
  <rect x="300" y="216" width="360" height="150" rx="14" fill="${C.ivory}"/>
  ${t(326, 258, "Pedido 1042", 26, { w: 800, ls: -0.6 })}${t(326, 286, "Almacén Lucía", 16, { o: 0.65 })}
  ${t(326, 340, "12 cajas de yerba de 1 kg", 16, { w: 600 })}
  <rect x="534" y="236" width="106" height="32" rx="16" fill="${C.blue}"/>${t(587, 257, "Validado", 14, { w: 700, fill: C.ivory, a: "middle" })}
  <path d="M320 432H880" stroke="${C.ivory}" stroke-opacity=".22" stroke-width="3"/>
  <path d="M320 432H693" stroke="${C.glow}" stroke-width="3"/>
  ${nodes.map(([x, l], i) => `<circle cx="${x}" cy="432" r="13" fill="${i < 3 ? C.glow : C.black}"${i < 3 ? "" : ` stroke="${C.ivory}" stroke-opacity=".5" stroke-width="2"`}/>${i < 3 ? `<path d="M${x - 5} 432l3.5 3.5 6.5-7" fill="none" stroke="${C.black}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>` : ""}${t(x, 474, l, 15, { w: 600, fill: C.ivory, o: i < 3 ? 1 : 0.6, a: "middle" })}`).join("")}
  <rect x="300" y="516" width="290" height="104" rx="18" fill="${C.ivory}"/>
  ${t(322, 546, "Al cliente", 13, { o: 0.6 })}${t(322, 576, "Tu pedido 1042 quedó", 17, { w: 600 })}${t(322, 600, "registrado. Llega el jueves.", 17, { w: 600 })}
  <rect x="610" y="516" width="290" height="104" rx="18" fill="${C.blue}"/>
  ${t(632, 546, "Al depósito", 13, { fill: C.ivory, o: 0.75 })}${t(632, 576, "Preparar el pedido 1042:", 17, { w: 600, fill: C.ivory })}${t(632, 600, "12 cajas de yerba de 1 kg", 17, { w: 600, fill: C.ivory })}
`);

// 3 · Integración tienda online ↔ sistema de gestión: el stock baja, las ventas suben
const prods = [["Café molido 500 g", "24"], ["Taza esmaltada", "8"], ["Filtro de tela", "0"]];
const stock = svg(C.blue, `
  <rect x="290" y="160" width="270" height="420" rx="16" fill="${C.ivory}"/>
  ${t(312, 200, "Tienda online", 19, { w: 800, ls: -0.3 })}
  ${prods.map(([n, q], i) => {
    const y = 226 + i * 84;
    return `<rect x="312" y="${y}" width="58" height="58" rx="8" fill="${C.sand}"/>${t(384, y + 24, n, 16, { w: 600 })}${
      q === "0" ? `<rect x="384" y="${y + 34}" width="82" height="24" rx="12" fill="${C.black}" fill-opacity=".1"/>${t(425, y + 51, "Sin stock", 13, { w: 600, a: "middle" })}` : t(384, y + 50, `${q} en stock`, 14, { o: 0.65 })
    }`;
  }).join("")}
  <path d="M312 494H538" stroke="${C.black}" stroke-opacity=".12" stroke-width="1.5"/>
  ${t(312, 526, "Última venta web", 13, { o: 0.6 })}${t(312, 552, "Café molido 500 g × 2", 15, { w: 600 })}
  <rect x="640" y="160" width="270" height="420" rx="16" fill="${C.black}"/>
  ${t(662, 200, "Sistema de gestión", 19, { w: 800, fill: C.ivory, ls: -0.3 })}
  ${t(662, 240, "Producto", 13, { fill: C.ivory, o: 0.55 })}${t(888, 240, "Stock", 13, { fill: C.ivory, o: 0.55, a: "end" })}
  ${prods.map(([n, q], i) => { const y = 278 + i * 40; return `<path d="M662 ${y - 26}H888" stroke="${C.ivory}" stroke-opacity=".12"/>${t(662, y, n, 15, { fill: C.ivory })}${t(888, y, q, 15, { w: 700, fill: C.ivory, a: "end" })}`; }).join("")}
  ${t(662, 430, "Ventas web de hoy", 13, { fill: C.ivory, o: 0.55 })}
  ${t(662, 462, "Café molido 500 g", 15, { fill: C.ivory })}${t(888, 462, "× 2", 15, { w: 700, fill: C.ivory, a: "end" })}
  ${t(662, 494, "Taza esmaltada", 15, { fill: C.ivory })}${t(888, 494, "× 1", 15, { w: 700, fill: C.ivory, a: "end" })}
  <path d="M636 300H572m10-9l-10 9 10 9" fill="none" stroke="${C.ivory}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M564 470H628m-10-9l10 9-10 9" fill="none" stroke="${C.ivory}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="600" cy="385" r="26" fill="${C.ivory}"/>
  <path d="M588 380a13 13 0 0 1 23-5m1 10a13 13 0 0 1-23 5" fill="none" stroke="${C.blue}" stroke-width="3" stroke-linecap="round"/>
  <path d="M612 368v8h-8M588 402v-8h8" fill="none" stroke="${C.blue}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="420" y="598" width="360" height="42" rx="21" fill="${C.black}"/>${t(600, 625, "Stock y ventas sincronizados", 15, { w: 600, fill: C.ivory, a: "middle" })}
`);

// 4 · Identidad para una cafetería: marca, vaso, menú, publicación y paleta como un mismo sistema
const ring = (cx, cy, r, sw, color) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"/>`;
const sw = [[C.blue, "#0053FD"], [C.ivory, "#F5F1E8"], [C.sand, "#E9E2D2"], [C.glow, "#4D8BFF"]];
const cafe = svg(C.black, `
  <rect x="290" y="160" width="300" height="220" rx="16" fill="${C.ivory}"/>
  ${ring(440, 222, 22, 10, C.blue)}${t(440, 312, "ronda", 60, { w: 900, a: "middle", ls: -2.5 })}${t(440, 346, "café de barrio", 15, { o: 0.6, a: "middle" })}
  <rect x="622" y="194" width="156" height="20" rx="7" fill="${C.ivory}"/>
  <path d="M632 214H768L753 382Q751 398 735 398H665Q649 398 647 382Z" fill="${C.blue}"/>
  ${ring(700, 296, 18, 7, C.ivory)}
  <rect x="790" y="160" width="130" height="300" rx="12" fill="${C.sand}"/>
  ${t(806, 198, "Menú", 19, { w: 800 })}
  ${[["Café", "120"], ["Cortado", "140"], ["Medialuna", "60"], ["Tostado", "190"]].map(([n, p], i) => `<path d="M806 ${214 + i * 34}H904" stroke="${C.black}" stroke-opacity=".12"/>${t(806, 238 + i * 34, n, 14)}${t(904, 238 + i * 34, p, 14, { w: 700, a: "end" })}`).join("")}
  <rect x="290" y="410" width="230" height="230" rx="12" fill="${C.blue}"/>
  ${ring(318, 440, 11, 5, C.ivory)}
  ${t(310, 540, "Medialunas", 31, { w: 900, fill: C.ivory, ls: -1 })}${t(310, 574, "recién salidas.", 31, { w: 900, fill: C.ivory, ls: -1 })}
  ${t(310, 620, "@ronda.cafe", 13, { fill: C.ivory, o: 0.75 })}
  ${sw.map(([c, hex], i) => `<circle cx="${600 + i * 84}" cy="540" r="34" fill="${c}"/>${t(600 + i * 84, 604, hex, 12, { fill: C.ivory, o: 0.6, a: "middle" })}`).join("")}
`);

export const PROJECT_ART = {
  "web-estudio-profesional": web,
  "automatizacion-pedidos": pedidos,
  "integracion-tienda-stock": stock,
  "identidad-cafeteria": cafe,
};
