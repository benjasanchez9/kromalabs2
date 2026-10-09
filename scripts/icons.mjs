// Íconos y previews animados de los servicios.
// Las animaciones viven en main.css (sección "Íconos animados"); acá solo está el dibujo.
// Clases: .s = trazo, .f = relleno, .o = opacidad baja, .a = acento azul.

export const ICONS = {
  webs: `<svg class="ico ico--webs" viewBox="0 0 48 48" aria-hidden="true">
    <rect class="s" x="5" y="8" width="38" height="32" rx="4"/><path class="s" d="M5 15h38"/>
    <circle class="f" cx="9.5" cy="11.5" r="1.1"/><circle class="f o" cx="13.2" cy="11.5" r="1.1"/>
    <svg x="5" y="15" width="38" height="25" overflow="hidden"><g class="ico-scroll">
      <rect class="f" x="5" y="4" width="19" height="4" rx="1"/><rect class="f o" x="5" y="11" width="28" height="2" rx="1"/>
      <rect class="f o" x="5" y="15" width="22" height="2" rx="1"/><rect class="a" x="5" y="20" width="12" height="4" rx="1"/>
      <rect class="f" x="5" y="29" width="28" height="9" rx="1.5"/><rect class="f o" x="5" y="41" width="24" height="2" rx="1"/>
      <rect class="f" x="5" y="47" width="19" height="4" rx="1"/><rect class="f o" x="5" y="54" width="28" height="2" rx="1"/>
    </g></svg>
    <path class="ico-cursor" d="M31 27l9 3.5-4 1.4-1.4 4z"/>
  </svg>`,
  automatizaciones: `<svg class="ico ico--auto" viewBox="0 0 48 48" aria-hidden="true">
    <path class="s o" d="M7 32H41"/><path class="ico-progress" d="M7 32H41"/>
    <circle class="ico-node n1" cx="7" cy="32" r="3.6"/><circle class="ico-node n2" cx="18.3" cy="32" r="3.6"/>
    <circle class="ico-node n3" cx="29.6" cy="32" r="3.6"/><circle class="ico-node n4" cx="41" cy="32" r="3.6"/>
    <g class="ico-task"><rect class="a" x="1" y="12" width="12" height="9" rx="2.5"/><path class="ico-check" d="M4 16.6l2 2 3.6-3.8"/></g>
  </svg>`,
  integraciones: `<svg class="ico ico--integ" viewBox="0 0 48 48" aria-hidden="true">
    <path class="s o" d="M13 12C20 12 18 24 24 24M13 36C20 36 18 24 24 24M24 24C30 24 28 12 35 12M24 24C30 24 28 36 35 36"/>
    <path class="ico-flow" d="M13 12C20 12 18 24 24 24C30 24 28 36 35 36"/>
    <path class="ico-flow f2" d="M13 36C20 36 18 24 24 24C30 24 28 12 35 12"/>
    <rect class="s" x="4" y="7" width="9" height="9" rx="2.5"/><rect class="s" x="4" y="32" width="9" height="9" rx="2.5"/>
    <rect class="s" x="35" y="7" width="9" height="9" rx="2.5"/><rect class="s" x="35" y="32" width="9" height="9" rx="2.5"/>
    <rect class="ico-hub" x="19" y="19" width="10" height="10" rx="3"/>
  </svg>`,
  "identidad-digital": `<svg class="ico ico--ident" viewBox="0 0 48 48" aria-hidden="true">
    <rect class="s o" x="5" y="5" width="38" height="38" rx="5"/>
    <circle class="ico-p p1" cx="17" cy="17" r="6"/><rect class="ico-p p2" x="25" y="11" width="12" height="12" rx="3"/>
    <rect class="ico-p p3" x="11" y="25" width="12" height="12" rx="6"/><path class="ico-p p4" d="M31 25l6 11H25z"/>
  </svg>`,
};

export const PREVIEWS = {
  webs: `<svg class="pv pv--webs" viewBox="0 0 240 160" aria-hidden="true">
    <rect width="240" height="160" fill="#f5f1e8"/>
    <rect x="18" y="16" width="204" height="128" rx="10" fill="#fff" stroke="#070708" stroke-opacity=".12"/>
    <rect x="18" y="16" width="204" height="18" rx="9" fill="#e8e2d4"/>
    <circle cx="30" cy="25" r="3" fill="#070708" fill-opacity=".35"/><circle cx="40" cy="25" r="3" fill="#070708" fill-opacity=".2"/>
    <rect x="60" y="21" width="90" height="8" rx="4" fill="#fff"/>
    <svg x="18" y="34" width="204" height="110" overflow="hidden"><g class="pv-scroll">
      <rect x="14" y="12" width="176" height="52" rx="6" fill="#070708"/>
      <path d="M14 52C60 30 100 70 190 26V64H14Z" fill="#0053fd"/>
      <rect x="14" y="74" width="110" height="10" rx="3" fill="#070708"/>
      <rect x="14" y="90" width="150" height="5" rx="2.5" fill="#070708" fill-opacity=".25"/>
      <rect x="14" y="100" width="128" height="5" rx="2.5" fill="#070708" fill-opacity=".25"/>
      <rect class="pv-btn" x="14" y="113" width="58" height="16" rx="2" fill="#0053fd"/>
      <rect x="14" y="142" width="84" height="56" rx="6" fill="#e8e2d4"/><rect x="106" y="142" width="84" height="56" rx="6" fill="#070708"/>
      <rect x="14" y="206" width="176" height="5" rx="2.5" fill="#070708" fill-opacity=".25"/>
    </g></svg>
    <rect x="168" y="70" width="44" height="72" rx="8" fill="#070708"/>
    <rect x="173" y="78" width="34" height="22" rx="3" fill="#0053fd"/><rect x="173" y="105" width="26" height="4" rx="2" fill="#f5f1e8" fill-opacity=".7"/>
    <rect x="173" y="113" width="20" height="4" rx="2" fill="#f5f1e8" fill-opacity=".45"/>
    <path class="pv-cursor" d="M0 0l13 5-5.6 2-2 5.6z" fill="#070708" stroke="#fff" stroke-width="1.2"/>
  </svg>`,
  automatizaciones: `<svg class="pv pv--auto" viewBox="0 0 240 160" aria-hidden="true">
    <rect width="240" height="160" fill="#070708"/>
    <path d="M30 96H210" stroke="#f5f1e8" stroke-opacity=".2" stroke-width="2"/>
    <path class="pv-progress" d="M30 96H210" stroke="#4d8bff" stroke-width="3"/>
    <g class="pv-step s1"><circle cx="30" cy="96" r="9"/><path d="M26 96l3 3 5-6"/></g>
    <g class="pv-step s2"><circle cx="90" cy="96" r="9"/><path d="M86 96l3 3 5-6"/></g>
    <g class="pv-step s3"><circle cx="150" cy="96" r="9"/><path d="M146 96l3 3 5-6"/></g>
    <g class="pv-step s4"><circle cx="210" cy="96" r="9"/><path d="M206 96l3 3 5-6"/></g>
    <g class="pv-task"><rect x="8" y="46" width="64" height="26" rx="4" fill="#0053fd"/><circle cx="22" cy="59" r="6" fill="#f5f1e8"/><rect x="32" y="56" width="30" height="6" rx="3" fill="#f5f1e8"/></g>
    <rect x="12" y="118" width="38" height="5" rx="2.5" fill="#f5f1e8" fill-opacity=".5"/><rect x="72" y="118" width="38" height="5" rx="2.5" fill="#f5f1e8" fill-opacity=".5"/>
    <rect x="132" y="118" width="38" height="5" rx="2.5" fill="#f5f1e8" fill-opacity=".5"/><rect x="192" y="118" width="38" height="5" rx="2.5" fill="#f5f1e8" fill-opacity=".5"/>
  </svg>`,
  integraciones: `<svg class="pv pv--integ" viewBox="0 0 240 160" aria-hidden="true">
    <rect width="240" height="160" fill="#f5f1e8"/>
    <path d="M60 40C96 40 92 80 120 80M60 120C96 120 92 80 120 80M120 80C148 80 144 40 180 40M120 80C148 80 144 120 180 120" fill="none" stroke="#070708" stroke-opacity=".15" stroke-width="2"/>
    <path class="pv-flow" d="M60 40C96 40 92 80 120 80C148 80 144 120 180 120"/>
    <path class="pv-flow f2" d="M60 120C96 120 92 80 120 80C148 80 144 40 180 40"/>
    <rect x="16" y="26" width="46" height="28" rx="8" fill="#fff" stroke="#070708" stroke-opacity=".2"/><rect x="26" y="37" width="26" height="6" rx="3" fill="#070708" fill-opacity=".5"/>
    <rect x="16" y="106" width="46" height="28" rx="8" fill="#fff" stroke="#070708" stroke-opacity=".2"/><rect x="26" y="117" width="26" height="6" rx="3" fill="#070708" fill-opacity=".5"/>
    <rect x="178" y="26" width="46" height="28" rx="8" fill="#fff" stroke="#070708" stroke-opacity=".2"/><rect x="188" y="37" width="26" height="6" rx="3" fill="#070708" fill-opacity=".5"/>
    <rect x="178" y="106" width="46" height="28" rx="8" fill="#fff" stroke="#070708" stroke-opacity=".2"/><rect x="188" y="117" width="26" height="6" rx="3" fill="#070708" fill-opacity=".5"/>
    <rect class="pv-hub" x="96" y="62" width="48" height="36" rx="12" fill="#070708"/>
    <rect x="108" y="77" width="24" height="6" rx="3" fill="#4d8bff"/>
  </svg>`,
  "identidad-digital": `<svg class="pv pv--ident" viewBox="0 0 240 160" aria-hidden="true">
    <rect width="240" height="160" fill="#f5f1e8"/>
    <g class="pv-piece q1"><rect x="14" y="14" width="96" height="132" rx="10" fill="#1e3a2c"/><circle cx="62" cy="68" r="20" fill="#e2572b"/><rect x="38" y="104" width="48" height="8" rx="4" fill="#f4ecdc"/></g>
    <g class="pv-piece q2"><rect x="118" y="14" width="108" height="62" rx="10" fill="#e2572b"/><rect x="130" y="28" width="62" height="10" rx="5" fill="#f4ecdc"/><rect x="130" y="44" width="44" height="10" rx="5" fill="#f4ecdc"/></g>
    <g class="pv-piece q3"><rect x="118" y="84" width="50" height="62" rx="10" fill="#fff" stroke="#1e3a2c" stroke-opacity=".2"/><text x="128" y="128" font-family="Figtree, Arial, sans-serif" font-weight="800" font-size="26" fill="#1e3a2c">Aa</text></g>
    <g class="pv-piece q4"><rect x="176" y="84" width="50" height="62" rx="10" fill="#1e3a2c"/><rect x="176" y="84" width="50" height="20" rx="10" fill="#e2572b"/></g>
  </svg>`,
};
