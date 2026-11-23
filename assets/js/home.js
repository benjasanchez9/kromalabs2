/* =========================================================
   KROMA — escena del inicio
   KROMA FORM (Three.js) + titular + transformación ligada al scroll.
   Si WebGL o el movimiento no están disponibles, queda la imagen fija
   y el manifiesto aparece como un bloque cobalto normal.
   ========================================================= */
// Three.js y la forma se cargan recién con la primera interacción (ver boot)
let THREE = null, createForm = null;
const ss = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
const mix = (a, b, t) => a + (b - a) * t;

const { gsap, ScrollTrigger, SplitText } = window;
const doc = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (x, a, b) => clamp((x - a) / (b - a));
const sio = x => -(Math.cos(Math.PI * x) - 1) / 2;
const p3io = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

const poster = $('#poster');
const stage = $('#stage'), h1 = $('#hero-t'), foot = $('#foot'), pool = $('#pool'), mani = $('#mani');
const cBack = $('#cBack'), cFront = $('#cFront');
const MOTION = !RM && !!gsap && !!ScrollTrigger;

/* ------------------------------------------------------------------ WebGL */
let gl = null;
const isMobileLayout = () => innerWidth <= 760 || innerWidth / innerHeight < 0.9;
function makeRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  r.setClearColor(0, 0);
  return r;
}
function initGL() {
  try {
    const layout = isMobileLayout() ? 'mobile' : 'desktop';
    const rBack = gl?.rBack || makeRenderer(cBack);
    const rFront = layout === 'desktop' ? (gl?.rFront || makeRenderer(cFront)) : null;
    gl?.back.dispose(); gl?.front?.dispose();
    const seg = layout === 'mobile' ? 220 : 360;
    gl = { rBack, rFront, layout, back: createForm(rBack, { seg, layout }), front: rFront ? createForm(rFront, { seg, layout }) : null, shown: false };
    sizeGL();
  } catch (e) {
    console.warn('WebGL no disponible: se mantiene la imagen fija.', e);
    gl = null;
  }
}
function sizeGL() {
  if (!gl) return;
  const dpr = Math.min(devicePixelRatio || 1, gl.layout === 'mobile' ? 1.5 : 1.75);
  const w = stage.clientWidth, h = stage.clientHeight;
  for (const [r, f] of [[gl.rBack, gl.back], [gl.rFront, gl.front]]) if (r && f) { r.setPixelRatio(dpr); f.setSize(w, h); }
}

/* ------------------------------------------------------------------ estado */
const L = { a: 1 };                       // la forma llega encendida (la imagen fija es idéntica)
const S = { p: 0 };                       // avance por la escena fijada (0..1)
const C = { x: 0, y: 0, tx: 0, ty: 0 };   // puntero, suavizado
let dirty = true, visible = true;

function framing(W, H, mobile) {
  if (mobile) {
    const k = clamp((W / H) / 0.462, 0.85, 1.25);
    return { sc: 0.6 * k, vx: -0.18 * W, vy: 0.2 * H, px: 0.68 * W, py: 0.3 * H, pr: 0.8 * W };
  }
  const k = clamp((W / H) / 1.6, 0.72, 1.08);
  return { sc: 0.82 * k, vx: -0.2056 * W, vy: -0.0378 * H, px: 0.7056 * W, py: 0.5378 * H, pr: 0.39 * W };
}
const BLACK = [7, 7, 8], COBALT = [0, 83, 253];
const mixRGB = (a, b, t) => `rgb(${a.map((v, i) => Math.round(mix(v, b[i], t))).join(',')})`;
const mLines = $$('.mani__t .l > span');
const mK = $('.mani__k'), mLead = $('.mani__lead'), mP = $('.mani__p');

function draw() {
  const W = stage.clientWidth, H = stage.clientHeight;
  const mobile = gl ? gl.layout === 'mobile' : isMobileLayout();
  const F = framing(W, H, mobile);
  const p = MOTION ? S.p : 0;
  const p1 = sio(prog(p, 0, 0.33)), p2 = p3io(prog(p, 0.33, 0.72)), p3 = p3io(prog(p, 0.72, 1));
  const a1 = p3io(L.a);
  const cur = FINE && MOTION ? (1 - p1) : 0;

  if (MOTION) {
    // DOM ligado al scroll (reversible)
    h1.style.transform = `translate3d(0,${-70 * p1}px,0) scale(${1 - 0.2 * p1})`;
    h1.style.opacity = 1 - prog(p1, 0.35, 0.85);
    foot.style.opacity = 1 - prog(p1, 0, 0.3);
    foot.style.visibility = p1 > 0.3 ? 'hidden' : '';
    const flood = ss(0.25, 0.9, p2);
    stage.style.backgroundColor = mixRGB(BLACK, COBALT, flood);
    stage.style.setProperty('--rp', p.toFixed(4));
    stage.style.setProperty('--px', mix(mix(F.px, W / 2, p1), mobile ? W / 2 : W * 0.66, p3) + 'px');
    stage.style.setProperty('--py', (mobile ? mix(F.py, H * 0.66, p3) : F.py) + 'px');
    stage.style.setProperty('--pr', F.pr + 'px');
    pool.style.opacity = a1 * (1 - 0.55 * p1 + 0.55 * p2) * (1 - flood * 0.85);
    mLines.forEach((el, i) => { const e = prog(p3, 0.3 + i * 0.08, 0.75 + i * 0.08); el.style.transform = `translate3d(0,${(1 - e) * 112}%,0)`; });
    mK.style.opacity = prog(p3, 0.2, 0.5);
    mLead.style.opacity = prog(p3, 0.6, 0.85);
    mP.style.opacity = prog(p3, 0.72, 0.97);
    mani.style.visibility = p3 > 0.01 ? 'visible' : 'hidden';
    window.KROMA_HOME_TONE = flood > 0.5 ? 't-cobalt' : 't-black';
    if (!gl && p2 > 0) poster.style.opacity = String(1 - ss(0, 0.6, p2)); // sin 3D, la imagen se retira al llegar el cobalto
  }
  if (!gl) return;

  const base = { rx: -0.62 + C.y * 0.05 * cur, ry: 0.42 + mix(0.25, 0, a1) + C.x * 0.07 * cur, rz: -0.2, sc: F.sc };
  const fold = gl.back.worldPoint(0.105, base);
  const o = { ...base, state: 0, exp: mix(0, 1.05, a1), envRot: mix(-0.9, -0.15, a1), cz: mix(8.4, 7.2, a1), vx: F.vx, vy: F.vy, fov: 28 };
  if (p1 > 0) { // la cámara entra al pliegue
    o.cx = mix(0, fold.x + 0.35, p1); o.cy = mix(0, fold.y + 0.15, p1); o.cz = mix(7.2, fold.z + 1.55, p1);
    o.lx = mix(0, fold.x, p1); o.ly = mix(0, fold.y, p1); o.lz = mix(0, fold.z, p1);
    o.vx = mix(F.vx, 0, p1); o.vy = mix(F.vy, 0, p1); o.envRot = mix(-0.15, 0.5, p1);
  }
  if (p2 > 0) { // apertura, fragmentación y alineación
    o.state = mix(0, 3, p2);
    const b = p3io(prog(p2, 0.05, 0.85));
    o.cx = mix(fold.x + 0.35, 0, b); o.cy = mix(fold.y + 0.15, 0, b); o.cz = mix(fold.z + 1.55, 8.2, b);
    o.lx = mix(fold.x, 0, b); o.ly = mix(fold.y, 0, b); o.lz = mix(fold.z, 0, b);
    o.rx = mix(base.rx, -0.1, b); o.ry = mix(base.ry, -0.28, b); o.rz = mix(-0.2, 0, b);
    o.sc = mix(F.sc, mobile ? 0.62 : 1.0, b);
    o.envRot = mix(0.5, 0.1, b);
  }
  if (p3 > 0) { // las piezas se vuelven interfaz
    o.state = 3 + p3;
    if (mobile) { o.vy = mix(0, -0.22 * H, p3); o.sc = mix(0.62, 0.6, p3); }
    else { o.vx = mix(0, -0.175 * W, p3); o.sc = mix(1.0, 0.9, p3); }
  }
  gl.back.render(o);
  // cruce de la banda con el titular: lo que queda delante del plano del texto se dibuja encima
  const weave = !!gl.front && p1 < 0.02;
  cFront.style.visibility = weave ? 'visible' : 'hidden';
  if (weave) gl.front.render({ ...o, clipDepth: o.cz - 0.25 });
  if (!gl.shown) { gl.shown = true; doc.classList.add('gl'); poster.style.opacity = ''; }
}

function tick() {
  const dx = C.tx - C.x, dy = C.ty - C.y;
  if (Math.abs(dx) > 1e-4 || Math.abs(dy) > 1e-4) { C.x += dx * 0.07; C.y += dy * 0.07; if (S.p < 0.33) dirty = true; }
  if (!dirty || !visible) return;
  dirty = false;
  draw();
}

/* ------------------------------------------------------------------ arranque */
function boot() {
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) dirty = true; }).observe($('#matter'));
  window.KROMA_HOME_READY = true;
  if (!MOTION) return; // imagen fija, titular visible y manifiesto como bloque cobalto

  doc.classList.add('scene');
  window.KROMA_HOME_TONE = 't-black';

  // entrada (una vez): la forma aparece con la luz y el titular sale por líneas
  gsap.fromTo(poster, { opacity: 0.25, scale: 1.04 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'power3.out', clearProps: 'transform' });
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]) : Promise.resolve();
  fontsReady.then(() => {
    let split = null;
    try { split = SplitText.create(h1, { type: 'lines', mask: 'lines', linesClass: 'split-line' }); } catch (e) {}
    gsap.set(h1, { visibility: 'visible' });
    if (split) gsap.from(split.lines, { yPercent: 115, duration: 0.95, stagger: 0.1, ease: 'expo.out', delay: 0.3 });
  });
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.fromTo('.hero__sub', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 1.25)
    .fromTo('.hero__cta', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 1.35)
    .fromTo('.hero__cue', { opacity: 0 }, { opacity: 0.66, duration: 0.6, ease: 'power2.out' }, 1.6);

  // escena fijada: hero → materia → sistema (scrub, reversible, sin secuestrar la rueda)
  const mm = gsap.matchMedia();
  mm.add({ mobile: '(max-width: 760px), (max-aspect-ratio: 9/10)', desktop: '(min-width: 761px) and (min-aspect-ratio: 9/10)' }, (ctx) => {
    const len = ctx.conditions.mobile ? 150 : 220;
    const tw = gsap.to(S, {
      p: 1, ease: 'none',
      onUpdate: () => { dirty = true; window.KROMA_HEADER?.(); }, // el scrub sigue moviendo S.p después del último evento de scroll
      scrollTrigger: {
        trigger: '#matter', start: 'top top', end: `+=${len}%`, pin: true, scrub: 0.6, anticipatePin: 1,
        onUpdate: () => { dirty = true; window.KROMA_HEADER?.(); },
        onRefresh: (st) => { window.KROMA_HOME_END = st.end; },
      },
    });
    return () => { tw.scrollTrigger?.kill(); S.p = 0; };
  });

  // El 3D se crea con la primera interacción: la carga inicial queda liviana
  // y la imagen fija (idéntica) cubre hasta ese momento.
  let started = false;
  const EV = ['pointermove', 'pointerdown', 'touchstart', 'wheel', 'keydown', 'scroll'];
  const start = async () => {
    if (started) return; started = true;
    EV.forEach((e) => removeEventListener(e, start));
    try {
      const [t, k] = await Promise.all([import('three'), import('./kform.js')]);
      THREE = t; createForm = k.createForm;
      initGL(); dirty = true;
    } catch (e) { console.warn('No se pudo cargar la escena 3D: se mantiene la imagen fija.', e); }
  };
  EV.forEach((e) => addEventListener(e, start, { passive: true }));
  if (scrollY > 0) start();

  if (FINE) addEventListener('pointermove', (e) => { C.tx = (e.clientX / innerWidth) * 2 - 1; C.ty = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
  addEventListener('resize', () => {
    if (gl && (isMobileLayout() ? 'mobile' : 'desktop') !== gl.layout) initGL();
    sizeGL(); dirty = true;
  });
  gsap.ticker.add(tick);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
