// Nosotros · "Cómo trabajamos": un objeto de cromo que se transforma con el scroll.
// Entendemos: piezas sueltas · Priorizamos: se ordenan · Desarrollamos: se funden en un bloque ·
// Acompañamos: una pieza (cobalto) queda en manos del cliente.
// Solo corre con movimiento permitido (clase .motion); si no, la página muestra las etapas como lista.
const doc = document.documentElement;
const track = document.querySelector('.obj__track');
const canvas = document.querySelector('.obj__c');

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a, b, t) => a + (b - a) * t;
const eio = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

function progress() {
  const r = track.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - innerHeight));
}

function start() {
  if (!track || !canvas || !doc.classList.contains('motion')) return;
  const caps = [...document.querySelectorAll('.obj__caps li')];
  const bars = [...document.querySelectorAll('.obj__bar b')];

  // textos y barra: no dependen de la escena 3D
  let cur = -1;
  const sync = () => {
    const p = progress();
    const st = Math.min(caps.length - 1, Math.floor(p * caps.length * 0.9999));
    if (st !== cur) { cur = st; caps.forEach((c, i) => c.classList.toggle('is-on', i === st)); }
    bars.forEach((b, i) => { b.style.transform = `scaleX(${clamp(p * caps.length - i).toFixed(3)})`; });
  };
  addEventListener('scroll', sync, { passive: true }); sync();

  // la escena se carga cuando la sección está cerca
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    import('three').then((THREE) => scene3d(THREE)).catch((err) => console.warn('Nosotros: sin escena 3D.', err));
  }, { rootMargin: '900px 0px' });
  io.observe(track);
}

function scene3d(THREE) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { canvas.style.display = 'none'; return; }
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();

  // mismo estudio de luz que la forma del inicio
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x1b1e26).multiplyScalar(1.2), side: THREE.BackSide })));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x6d7383).multiplyScalar(2.5) }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -6; env.add(floor);
  const strip = (w, h, c, k, pos) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m); };
  strip(9, 1.1, 0xf5f1e8, 3.2, [0, 8.5, 1]); strip(12, 4, 0xb9bfcc, 0.9, [0, 7, -6]); strip(0.35, 9, 0xffffff, 4, [6, 2, 6]);
  strip(0.25, 9, 0xffffff, 5, [-5, 2, -7]); strip(14, 0.25, 0xffffff, 4, [0, -2.5, -9]); strip(1, 7, 0xf5f1e8, 2.2, [-8.5, 1, 3]);
  strip(7, 5, 0x0053fd, 5.2, [8, -1, -5]); strip(5, 3, 0x0053fd, 2.6, [-7, -3, -6]); strip(3, 1.2, 0x4d8bff, 2, [3, -8, 4]);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(env, 0.02).texture; pm.dispose();

  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100); cam.position.set(0, 0, 10);
  const root = new THREE.Group(); scene.add(root);

  // placa de cromo con bordes redondeados
  const shape = (w, h, r) => { const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; };
  const geo = new THREE.ExtrudeGeometry(shape(1.15, 0.5, 0.12), { depth: 0.12, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3, curveSegments: 10 });
  geo.translate(0, 0, -0.06);

  const N = 12, CH = 7;
  const rnd = (i, s) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
  const cChrome = new THREE.Color(0xdfe3ec), cCobalt = new THREE.Color(0x0053fd);
  const pieces = Array.from({ length: N }, (_, i) => {
    const mat = new THREE.MeshPhysicalMaterial({ color: 0xdfe3ec, metalness: 1, roughness: 0.035, envMapIntensity: 1.2 });
    const m = new THREE.Mesh(geo, mat); root.add(m);
    const c = i % 3, r = Math.floor(i / 3);
    return {
      m, mat,
      s0: { p: [(rnd(i, 1) - 0.5) * 7, (rnd(i, 2) - 0.5) * 4.4, (rnd(i, 3) - 0.5) * 3], r: [(rnd(i, 4) - 0.5) * 2.6, (rnd(i, 5) - 0.5) * 3, (rnd(i, 6) - 0.5) * 2.4] },
      s1: { p: [(c - 1) * 1.45, (1.5 - r) * 0.72, 0], r: [0, 0, 0] },
      s2: { p: [0, (i - (N - 1) / 2) * 0.135, 0], r: [Math.PI / 2 - 0.35, 0, 0] },
    };
  });

  let base = 0.86;
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setSize(w, h, false);
    cam.aspect = w / h; cam.updateProjectionMatrix();
    base = w / h < 1 ? 0.8 : 0.86;
  };
  new ResizeObserver(resize).observe(canvas); resize();

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  const L = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
  const t0 = performance.now();
  (function frame() {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const t = (performance.now() - t0) / 1000;
    const P = progress() * 3;
    const k1 = eio(P), k2 = eio(P - 1), k3 = eio(P - 2);
    pieces.forEach((pc, i) => {
      let p = L(pc.s0.p, pc.s1.p, k1), r = L(pc.s0.r, pc.s1.r, k1);
      p = L(p, pc.s2.p, k2); r = L(r, pc.s2.r, k2);
      const loose = 1 - k1;
      p[1] += loose * 0.08 * Math.sin(t * 0.7 + i);
      r[2] += loose * 0.05 * Math.sin(t * 0.5 + i * 2);
      if (i === CH) {
        p = L(p, [1.9, -0.3, 1.6], k3); r = L(r, [-0.15, -0.5, 0.06], k3);
        pc.mat.color.copy(cChrome).lerp(cCobalt, k3); pc.mat.metalness = mix(1, 0.1, k3); pc.mat.roughness = mix(0.035, 0.45, k3);
        pc.mat.emissive.copy(cCobalt).multiplyScalar(0.55 * k3);
      }
      pc.m.position.set(...p); pc.m.rotation.set(...r);
    });
    root.scale.setScalar(base);
    root.rotation.y = -0.35 + 0.35 * k2 + 0.06 * Math.sin(t * 0.3);
    root.rotation.x = 0.12 * k2;
    root.position.x = mix(-0.25, -0.95, k3);
    scene.environmentRotation.set(0, t * 0.15, 0);
    renderer.render(scene, cam);
  })();
}

// site.js agrega .motion al cargar (es diferido); este módulo corre después
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start); else start();
