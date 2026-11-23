// KROMA FORM — live version.
// A closed three-lobed chrome band (variable width, three half-twists).
// One parameter, `state` 0..4, drives the narrative:
// 0 materia · 1 apertura · 2 fragmentación · 3 alineación · 4 interfaz
import * as THREE from 'three';

const TAU = Math.PI * 2;
export const ss = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
export const mix = (a, b, t) => a + (b - a) * t;

export const KROMA = { black: 0x070708, ivory: 0xf5f1e8, cobalt: 0x0053fd, cobaltDeep: 0x0041c9, glow: 0x4d8bff, stone: 0x8a867c };

const CFG = { tw: 1.5, zz: 0.8, bw: 0.26, bv: 0.14, bt: 0.035 };
const PANEL_D = [
  { len: 2.9, w: 1.85, x: -0.15, y: 0.25, z: -0.6 },
  { len: 1.35, w: 0.95, x: 1.25, y: -0.75, z: 0.25 },
  { len: 1.15, w: 0.3, x: -0.55, y: -0.95, z: 0.7 },
];
const PANEL_M = [
  { len: 1.8, w: 2.0, x: 0, y: 0.8, z: -0.4 },
  { len: 1.8, w: 0.85, x: 0.14, y: -0.85, z: 0.15 },
  { len: 1.8, w: 0.32, x: -0.1, y: -1.62, z: 0.55 },
];

export function pClosed(u, out = new THREE.Vector3()) {
  const th = u * TAU;
  const r = 1.18 * (1 + 0.30 * Math.cos(3 * th + 0.35) + 0.07 * Math.cos(th - 0.9));
  return out.set(r * Math.cos(th), 0.92 * r * Math.sin(th), CFG.zz * Math.sin(3 * th + 1.05));
}
const FULL = [0, 1];
const PIECES = [[0, 1 / 3], [1 / 3, 2 / 3], [2 / 3, 1]];
const ALIGN = { len: [2.7, 2.1, 1.6], x: [-0.35, 0.15, 0.55], y: [0.62, 0, -0.62], z: [-0.5, 0, 0.5] };

export function createForm(renderer, { seg = 420, pr = 56, layout = 'desktop' } = {}) {
  const PANEL = layout === 'mobile' ? PANEL_M : PANEL_D;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;

  // ---------- path sampling
  const tmpC = new THREE.Vector3();
  function sample(s, k, v, out) {
    const [a, b] = k < 0 ? FULL : PIECES[k];
    const u = a + (b - a) * v;
    const p = pClosed(u, out);
    const t1 = ss(0, 1, s);
    if (t1 > 0) { p.x *= 1 + 0.12 * t1; p.y *= 1 + 0.12 * t1; p.z *= 1 + 0.35 * t1; }
    if (k >= 0) {
      const t2 = ss(1, 2, s);
      if (t2 > 0) { pClosed(a + (b - a) * 0.5, tmpC); tmpC.z = 0; tmpC.normalize(); p.addScaledVector(tmpC, 0.5 * t2); p.z += [0.25, -0.2, 0.05][k] * t2; }
      const t3 = ss(2 + 0.12 * k, 2.76 + 0.12 * k, s);
      if (t3 > 0) { p.x = mix(p.x, (v - 0.5) * ALIGN.len[k] + ALIGN.x[k], t3); p.y = mix(p.y, ALIGN.y[k], t3); p.z = mix(p.z, ALIGN.z[k], t3); }
      const t4 = ss(3, 4, s);
      if (t4 > 0) { const P = PANEL[k]; p.x = mix(p.x, P.x + (v - 0.5) * P.len, t4); p.y = mix(p.y, P.y, t4); p.z = mix(p.z, P.z, t4); }
    }
    return p;
  }
  function profileAt(s, k, u) {
    const th = u * TAU;
    let w = CFG.bw + CFG.bv * Math.sin(3 * th + 2.2);
    let t = CFG.bt;
    const t1 = ss(0, 1, s), t2 = ss(1, 2, s), t4 = ss(3, 4, s);
    const t3 = k >= 0 ? ss(2 + 0.12 * k, 2.76 + 0.12 * k, s) : 0;
    const t3t = k >= 0 ? ss(1.7, 2.45 + 0.12 * k, s) : 0;
    w = mix(w, w * 1.2, t1);
    w = mix(w, 0.24, t3); t = mix(t, 0.045, t3);
    if (k >= 0) { w = mix(w, PANEL[k].w / 2, t4); t = mix(t, 0.03, t4); }
    let tw = CFG.tw * TAU * u + 0.4;
    tw = mix(tw, tw + 0.7 * Math.sin(th * 3), t1);
    tw = mix(tw, tw * 0.35, t2);
    tw = mix(tw, 0, t3t);
    return { w, t, tw };
  }

  // ---------- geometry with preallocated buffers (updated in place)
  function makeGeo(k, SEG) {
    const closed = k < 0;
    const nv = (SEG + 1) * pr + (closed ? 0 : 2);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nv * 3), 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nv * 3), 3).setUsage(THREE.DynamicDrawUsage));
    const idx = [];
    for (let i = 0; i < SEG; i++) for (let j = 0; j < pr; j++) {
      let A = i * pr + j, Bn = i * pr + (j + 1) % pr, C = (i + 1) * pr + j, D = (i + 1) * pr + (j + 1) % pr;
      if (closed && i === SEG - 1) { C = (j + pr / 2) % pr; D = (j + 1 + pr / 2) % pr; }
      idx.push(A, C, Bn, Bn, C, D);
    }
    if (!closed) {
      const c0 = (SEG + 1) * pr, c1 = c0 + 1;
      for (let j = 0; j < pr; j++) { idx.push(c0, (j + 1) % pr, j); idx.push(c1, SEG * pr + j, SEG * pr + (j + 1) % pr); }
    }
    g.setIndex(idx);
    g.userData = { k, SEG };
    return g;
  }
  const Z = new THREE.Vector3(0, 0, 1), T = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3(), Bz = new THREE.Vector3(), Bpt = new THREE.Vector3();
  const P = new THREE.Vector3(), P0 = new THREE.Vector3(), P2 = new THREE.Vector3(), first = new THREE.Vector3(), last = new THREE.Vector3();
  const UX = new Float32Array(pr), UY = new Float32Array(pr); let lastN = -1;
  function profileUnit(n) {
    if (Math.abs(n - lastN) < 1e-4) return; lastN = n;
    for (let j = 0; j < pr; j++) { const a = j / pr * TAU, c = Math.cos(a), sn = Math.sin(a); UX[j] = Math.sign(c) * Math.pow(Math.abs(c), n); UY[j] = Math.sign(sn) * Math.pow(Math.abs(sn), n); }
  }
  function fill(g, s) {
    const { k, SEG } = g.userData;
    const pos = g.attributes.position.array;
    profileUnit(mix(0.28, 0.12, ss(3, 4, s)));
    const ptMix = ss(1.2, 2.0, s);
    const [a, b] = k < 0 ? FULL : PIECES[k];
    let o = 0;
    for (let i = 0; i <= SEG; i++) {
      const v = i / SEG, u = a + (b - a) * v;
      sample(s, k, v, P);
      sample(s, k, Math.min(1, v + 1e-3), P2); sample(s, k, Math.max(0, v - 1e-3), P0);
      T.subVectors(P2, P0).normalize();
      Bz.copy(Z).addScaledVector(T, -Z.dot(T)).normalize();
      if (k < 0 || i === 0) { B.copy(Bz); Bpt.copy(Bz); }
      else { Bpt.addScaledVector(T, -Bpt.dot(T)).normalize(); B.copy(Bz).lerp(Bpt, ptMix); B.addScaledVector(T, -B.dot(T)).normalize(); }
      N.crossVectors(B, T).normalize();
      const { w, t, tw } = profileAt(s, k, u);
      const ct = Math.cos(tw), st = Math.sin(tw);
      for (let j = 0; j < pr; j++) {
        const x = w * UX[j], y = t * UY[j];
        const nx = x * ct - y * st, ny = x * st + y * ct;
        pos[o++] = P.x + N.x * nx + B.x * ny; pos[o++] = P.y + N.y * nx + B.y * ny; pos[o++] = P.z + N.z * nx + B.z * ny;
      }
      if (i === 0) first.copy(P); if (i === SEG) last.copy(P);
    }
    if (k >= 0) { pos[o++] = first.x; pos[o++] = first.y; pos[o++] = first.z; pos[o++] = last.x; pos[o++] = last.y; pos[o++] = last.z; }
    g.attributes.position.needsUpdate = true;
    g.computeVertexNormals();
    g.computeBoundingSphere();
  }

  // ---------- studio environment (KROMA palette lights)
  function makeEnv() {
    const s = new THREE.Scene();
    const box = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x1b1e26).multiplyScalar(1.2), side: THREE.BackSide }));
    s.add(box);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x6d7383).multiplyScalar(2.5) }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -6; s.add(floor);
    const strip = (w, h, color, int, pos) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(int), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m); };
    strip(9, 1.1, KROMA.ivory, 3.2, [0, 8.5, 1]);
    strip(12, 4, 0xb9bfcc, 0.9, [0, 7, -6]);
    strip(0.35, 9, 0xffffff, 4, [6, 2, 6]);
    strip(0.25, 9, 0xffffff, 5, [-5, 2, -7]);
    strip(14, 0.25, 0xffffff, 4, [0, -2.5, -9]);
    strip(1.0, 7, KROMA.ivory, 2.2, [-8.5, 1, 3]);
    strip(7, 5, KROMA.cobalt, 5.2, [8, -1, -5]);   // KROMA cobalt key, back-right
    strip(5, 3, KROMA.cobalt, 2.6, [-7, -3, -6]);  // second cobalt bounce, back-left
    strip(3, 1.2, KROMA.glow, 2.0, [3, -8, 4]);
    strip(2, 2, KROMA.ivory, 1.2, [2, 3, 9]);
    const pm = new THREE.PMREMGenerator(renderer);
    const tex = pm.fromScene(s, 0.02).texture;
    pm.dispose();
    return tex;
  }

  const scene = new THREE.Scene();
  scene.environment = makeEnv();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 100);
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xdfe3ec, metalness: 1, roughness: 0.035, envMapIntensity: 1.2 });
  const group = new THREE.Group(); scene.add(group);
  const segP = Math.round(seg / 2);
  const pieces = [0, 1, 2].map(k => { const m = new THREE.Mesh(makeGeo(k, segP), chrome); group.add(m); return m; });
  const whole = new THREE.Mesh(makeGeo(-1, seg), chrome); group.add(whole);

  // interface marks (state 4), drawn on ivory panels
  const ui = new THREE.Group(); group.add(ui);
  const mark = (w, h, color, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, toneMapped: false })); m.position.set(x, y, z); ui.add(m); return m; };
  const [Q0, Q1, Q2] = PANEL;
  const f0 = Q0.z + 0.04, f1 = Q1.z + 0.04, f2 = Q2.z + 0.04;
  const L0 = Q0.x - Q0.len / 2 + 0.22, T0 = Q0.y + Q0.w / 2 - 0.2, IW = Q0.len - 0.44;
  const marks = [
    mark(IW, 0.006, KROMA.stone, Q0.x, T0 - 0.06, f0),
    mark(IW * 0.63, 0.17, KROMA.black, L0 + IW * 0.315, T0 - 0.42, f0),
    mark(IW * 0.43, 0.17, KROMA.black, L0 + IW * 0.215, T0 - 0.64, f0),
    mark(IW * 0.39, 0.035, KROMA.stone, L0 + IW * 0.195, T0 - 0.9, f0),
    mark(IW * 0.29, 0.035, KROMA.stone, L0 + IW * 0.145, T0 - 0.98, f0),
    mark(0.46, 0.14, KROMA.cobalt, L0 + 0.23, T0 - 1.26, f0),
    mark(Q1.len * 0.4, 0.02, KROMA.cobalt, Q1.x - Q1.len * 0.22, Q1.y + Q1.w * 0.3, f1),
    mark(Q1.len * 0.67, Q1.w * 0.28, KROMA.cobalt, Q1.x, Q1.y - Q1.w * 0.08, f1),
    mark(Q1.len * 0.45, 0.03, KROMA.stone, Q1.x - Q1.len * 0.11, Q1.y - Q1.w * 0.36, f1),
    mark(0.16, 0.16, KROMA.cobalt, Q2.x + Q2.len / 2 - 0.16, Q2.y, f2),
    mark(Q2.len * 0.48, 0.03, KROMA.black, Q2.x - Q2.len * 0.17, Q2.y, f2),
  ];

  const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  const cChrome = new THREE.Color(0xdfe3ec), cIvory = new THREE.Color(KROMA.ivory);
  let lastState = -1, W = 1, H = 1;

  function setSize(w, h) { W = w; H = h; renderer.setSize(w, h, false); }
  function worldPoint(u, o = {}) {
    const g = new THREE.Object3D();
    g.rotation.set(o.rx ?? -0.6, o.ry ?? 0.4, o.rz ?? -0.18); g.position.set(o.gx || 0, o.gy || 0, o.gz || 0); g.scale.setScalar(o.sc || 1);
    g.updateMatrixWorld(); return pClosed(u).applyMatrix4(g.matrixWorld);
  }
  function render(o = {}) {
    const st = o.state || 0;
    if (Math.abs(st - lastState) > 1e-4) {
      const split = st >= 1.0;
      pieces.forEach(m => { m.visible = split; if (split) fill(m.geometry, st); });
      whole.visible = !split; if (!split) fill(whole.geometry, st);
      const t4 = ss(3.2, 4, st);
      chrome.color.copy(cChrome).lerp(cIvory, t4);
      chrome.metalness = mix(1, 0.08, t4);
      chrome.roughness = mix(0.035, 0.6, ss(3, 4, st));
      chrome.emissive.copy(cIvory).multiplyScalar(0.72 * t4);
      const uiA = ss(3.55, 4, st);
      marks.forEach((m, i) => { m.material.opacity = ss(0, 1, uiA * 1.4 - i * 0.04); });
      lastState = st;
    }
    group.rotation.set(o.rx ?? -0.6, o.ry ?? 0.4, o.rz ?? -0.18);
    group.position.set(o.gx || 0, o.gy || 0, o.gz || 0);
    group.scale.setScalar(o.sc || 1);
    camera.fov = o.fov || 28; camera.aspect = W / H;
    camera.setViewOffset(W, H, o.vx || 0, o.vy || 0, W, H);
    camera.updateProjectionMatrix();
    camera.position.set(o.cx || 0, o.cy || 0, o.cz ?? 7);
    camera.lookAt(o.lx || 0, o.ly || 0, o.lz || 0);
    scene.environmentRotation.set(0, o.envRot || 0, 0);
    renderer.toneMappingExposure = o.exp ?? 1.05;
    if (o.clipDepth != null) {
      camera.updateMatrixWorld();
      const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
      const pt = camera.position.clone().addScaledVector(dir, o.clipDepth);
      clipPlane.setFromNormalAndCoplanarPoint(dir.clone().negate(), pt);
      if (!chrome.clippingPlanes || chrome.clippingPlanes.length !== 1) { chrome.clippingPlanes = [clipPlane]; chrome.needsUpdate = true; }
    } else if (chrome.clippingPlanes && chrome.clippingPlanes.length) { chrome.clippingPlanes = []; chrome.needsUpdate = true; }
    renderer.render(scene, camera);
  }
  function dispose() {
    [...pieces, whole].forEach(m => m.geometry.dispose());
    marks.forEach(m => { m.geometry.dispose(); m.material.dispose(); });
    chrome.dispose(); scene.environment?.dispose();
  }
  return { render, setSize, worldPoint, dispose };
}
