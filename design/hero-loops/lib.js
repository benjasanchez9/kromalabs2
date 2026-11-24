// Motor compartido de las escenas de los heros de KROMA.
// Mismo estudio de luz y cromo que la forma del inicio (kform.js).
import * as THREE from 'three';

export const K = { black: 0x070708, ivory: 0xf5f1e8, cobalt: 0x0053fd, cobaltDeep: 0x0041c9, glow: 0x4d8bff, stone: 0x8a867c, sand: 0xe4dccb };
export const TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ss = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
export const mix = (a, b, t) => a + (b - a) * t;
export const eio = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }; // easeInOutCubic
export const eout = (x) => 1 - Math.pow(1 - clamp(x), 4);

export function makeEnv(renderer) {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x1b1e26).multiplyScalar(1.2), side: THREE.BackSide })));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x6d7383).multiplyScalar(2.5) }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -6; s.add(floor);
  const strip = (w, h, color, int, pos) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(int), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m); };
  strip(9, 1.1, K.ivory, 3.2, [0, 8.5, 1]);
  strip(12, 4, 0xb9bfcc, 0.9, [0, 7, -6]);
  strip(0.35, 9, 0xffffff, 4, [6, 2, 6]);
  strip(0.25, 9, 0xffffff, 5, [-5, 2, -7]);
  strip(14, 0.25, 0xffffff, 4, [0, -2.5, -9]);
  strip(1.0, 7, K.ivory, 2.2, [-8.5, 1, 3]);
  strip(7, 5, K.cobalt, 5.2, [8, -1, -5]);
  strip(5, 3, K.cobalt, 2.6, [-7, -3, -6]);
  strip(3, 1.2, K.glow, 2.0, [3, -8, 4]);
  strip(2, 2, K.ivory, 1.2, [2, 3, 9]);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(s, 0.02).texture; pm.dispose();
  return tex;
}

export function setup({ size = 900, bg = K.black, fov = 28, cz = 9 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.setSize(size, size);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.localClippingEnabled = true;
  renderer.setClearColor(bg, 1);
  document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.environment = makeEnv(renderer);
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.05, 100);
  camera.position.set(0, 0, cz); camera.lookAt(0, 0, 0);
  return { renderer, scene, camera };
}

// Materiales
export const chrome = () => new THREE.MeshPhysicalMaterial({ color: 0xdfe3ec, metalness: 1, roughness: 0.035, envMapIntensity: 1.2 });
export const ivory = (c = K.ivory) => new THREE.MeshPhysicalMaterial({ color: c, metalness: 0.08, roughness: 0.6, emissive: new THREE.Color(c).multiplyScalar(0.72) });
export const flat = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, toneMapped: false });

// Panel de esquinas redondeadas con espesor
export function rrShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
export function panel(w, h, d = 0.06, r = 0.08, mat) {
  const g = new THREE.ExtrudeGeometry(rrShape(w, h, r), { depth: d, bevelEnabled: true, bevelSize: Math.min(0.02, d / 2), bevelThickness: Math.min(0.02, d / 2), bevelSegments: 3, curveSegments: 10 });
  g.translate(0, 0, -d / 2);
  const m = new THREE.Mesh(g, mat); m.userData.front = d / 2 + Math.min(0.02, d / 2) + 0.003; return m;
}
// Marca plana sobre la cara frontal de un panel (rect redondeado sin espesor)
export function mark(parent, w, h, color, x, y, { r = 0, o = 1, z = null } = {}) {
  const g = r > 0 ? new THREE.ShapeGeometry(rrShape(w, h, r), 8) : new THREE.PlaneGeometry(w, h);
  const m = new THREE.Mesh(g, flat(color, o));
  m.position.set(x, y, z ?? (parent.userData.front || 0.01)); parent.add(m); return m;
}
export function disc(parent, rad, color, x, y, { o = 1, z = null, ring = 0 } = {}) {
  const g = ring ? new THREE.RingGeometry(rad - ring, rad, 40) : new THREE.CircleGeometry(rad, 40);
  const m = new THREE.Mesh(g, flat(color, o)); m.position.set(x, y, z ?? (parent.userData.front || 0.01)); parent.add(m); return m;
}

// Cinta de cromo a lo largo de una curva (perfil superelipse, giro opcional)
export function ribbonGeo(curve, { n = 400, w = 0.28, t = 0.05, twist = 0, closed = false, prof = 16, widthFn = null, up = null } = {}) {
  let frames;
  if (up) { // marco estable respecto de un vector fijo (sin saltos al deformar la curva)
    frames = { normals: [], binormals: [] };
    const tg = new THREE.Vector3(), nn = new THREE.Vector3(), bb = new THREE.Vector3();
    for (let i = 0; i <= n; i++) {
      curve.getTangentAt(Math.min(i / n, 1), tg);
      nn.copy(up).addScaledVector(tg, -up.dot(tg)).normalize();
      bb.crossVectors(tg, nn).normalize();
      frames.normals.push(nn.clone()); frames.binormals.push(bb.clone());
    }
  } else frames = curve.computeFrenetFrames(n, closed);
  const P = [];
  for (let j = 0; j < prof; j++) {
    const a = (j / prof) * TAU, c = Math.cos(a), s = Math.sin(a);
    P.push([Math.sign(c) * Math.pow(Math.abs(c), 0.35), Math.sign(s) * Math.pow(Math.abs(s), 0.35)]);
  }
  const rows = closed ? n : n + 1;
  const pos = new Float32Array(rows * prof * 3);
  const p = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3();
  for (let i = 0; i < rows; i++) {
    const u = i / n; curve.getPointAt(u % 1 === 0 && i === n ? 1 : u, p);
    const ang = twist * u * TAU;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    N.copy(frames.normals[i % (n + 1)]).multiplyScalar(ca).addScaledVector(frames.binormals[i % (n + 1)], sa);
    B.copy(frames.binormals[i % (n + 1)]).multiplyScalar(ca).addScaledVector(frames.normals[i % (n + 1)], -sa);
    const ww = widthFn ? widthFn(u) * w : w;
    for (let j = 0; j < prof; j++) {
      const k = (i * prof + j) * 3;
      pos[k] = p.x + N.x * P[j][0] * ww / 2 + B.x * P[j][1] * t / 2;
      pos[k + 1] = p.y + N.y * P[j][0] * ww / 2 + B.y * P[j][1] * t / 2;
      pos[k + 2] = p.z + N.z * P[j][0] * ww / 2 + B.z * P[j][1] * t / 2;
    }
  }
  const idx = [];
  const segs = closed ? n : n;
  for (let i = 0; i < segs; i++) {
    const i2 = closed ? (i + 1) % n : i + 1;
    for (let j = 0; j < prof; j++) {
      const j2 = (j + 1) % prof;
      const a = i * prof + j, b = i2 * prof + j, c = i2 * prof + j2, d = i * prof + j2;
      idx.push(a, b, d, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

// Curva de la forma KROMA (tres lóbulos), la misma del inicio
export function pClosed(u, out = new THREE.Vector3(), zz = 0.8) {
  const th = u * TAU;
  const r = 1.18 * (1 + 0.30 * Math.cos(3 * th + 0.35) + 0.07 * Math.cos(th - 0.9));
  return out.set(r * Math.cos(th), 0.92 * r * Math.sin(th), zz * Math.sin(3 * th + 1.05));
}
export class FnCurve extends THREE.Curve {
  constructor(fn) { super(); this.fn = fn; }
  getPoint(u, out = new THREE.Vector3()) { return this.fn(u, out); }
}

// Textura de texto (canvas)
export function textTex(lines, { w = 512, h = 256, bg = null, color = '#070708', font = '600 120px HG', align = 'left', x = 0.08, y = 0.5, lh = 1.0, ls = 0 } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  g.fillStyle = color; g.font = font; g.textAlign = align; g.textBaseline = 'middle';
  if ('letterSpacing' in g) g.letterSpacing = ls + 'px';
  const fs = parseFloat(font.match(/(\d+)px/)[1]);
  const L = [].concat(lines);
  L.forEach((s, i) => g.fillText(s, x * w, y * h + (i - (L.length - 1) / 2) * fs * lh));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
export function textPlane(parent, tex, w, h, x, y, z = null) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
  m.position.set(x, y, z ?? (parent.userData.front || 0.01)); parent.add(m); return m;
}

// Brillo (sprite aditivo)
export function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.18, 'rgba(160,195,255,.9)'); r.addColorStop(0.45, 'rgba(77,139,255,.35)'); r.addColorStop(1, 'rgba(77,139,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function glowSprite(tex, s = 0.5) {
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  m.scale.setScalar(s); return m;
}
