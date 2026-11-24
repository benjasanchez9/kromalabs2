import * as THREE from 'three';
import { K, TAU, clamp, ss, mix, eio, eout, setup, chrome, ivory, flat, panel, mark, disc, ribbonGeo, pClosed, FnCurve, textTex, textPlane, glowTex, glowSprite } from './lib.js';

const T = 8; // duración del loop (s)
const Q = new URLSearchParams(location.search);
const NAME = Q.get('s') || 'webs';
const SIZE = +(Q.get('size') || 900);

// En las páginas negras el video se mezcla en modo 'screen': fondo negro puro = transparente
const BG = { webs: 0x000000, automatizaciones: K.cobalt, integraciones: 0x000000, 'identidad-digital': K.cobalt, 'consultoria-tecnologica': 0x000000, nosotros: K.ivory };

// ---------------------------------------------------------------- WEBS
// Una ventana de navegador y un teléfono, con la página desplazándose; la cinta de cromo detrás.
function webs({ scene }) {
  const root = new THREE.Group(); scene.add(root);
  root.rotation.set(0.1, -0.42, 0.02); root.position.set(-0.05, 0.1, 0); root.scale.setScalar(1.08);

  // cinta de cromo detrás
  const band = new THREE.Mesh(ribbonGeo(new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.0, -2.2, 0.9), new THREE.Vector3(-1.9, -1.35, 0.55), new THREE.Vector3(-0.6, -1.55, -0.25),
    new THREE.Vector3(0.9, -0.7, -0.6), new THREE.Vector3(1.9, 0.6, -0.55), new THREE.Vector3(1.6, 1.6, -0.7), new THREE.Vector3(2.6, 2.6, -1.0)]), { n: 420, w: 0.5, t: 0.06, twist: 1.5 }), chrome());
  root.add(band);

  // ventana
  const win = new THREE.Group(); root.add(win);
  const W = 3.0, H = 2.05;
  const ivw = ivory(); ivw.emissive.multiplyScalar(1.22); const body = panel(W, H, 0.06, 0.09, ivw); win.add(body);
  const fz = body.userData.front;
  mark(body, W, 0.24, K.sand, 0, H / 2 - 0.12, { z: fz + 0.001 });
  [0, 1, 2].forEach((i) => disc(body, 0.03, K.black, -W / 2 + 0.16 + i * 0.1, H / 2 - 0.12, { o: 0.28, z: fz + 0.002 }));
  mark(body, 0.9, 0.09, K.ivory, -0.25, H / 2 - 0.12, { r: 0.045, z: fz + 0.002 });

  // contenido que se desplaza (dos copias para el loop), recortado al área visible
  const VT = H / 2 - 0.26, VB = -H / 2 + 0.06; // límites del área visible (local)
  const PER = 2.6;
  const content = new THREE.Group(); win.add(content);
  const clipMats = [];
  const cm = (c, o = 1) => { const m = flat(c, o); clipMats.push(m); return m; };
  let zi = 0; const blk = (w, h, c, x, y, o = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), cm(c, o)); m.position.set(x, y, fz + 0.004 + (zi++ % 40) * 0.0004); return m; };
  const L = -W / 2 + 0.22;
  const btns = [];
  for (const off of [0, -PER]) {
    const g = new THREE.Group(); g.position.y = off; content.add(g);
    // hero de la página
    g.add(blk(1.5, 0.17, K.black, L + 0.75, 0.62));
    g.add(blk(1.05, 0.17, K.black, L + 0.525, 0.4));
    g.add(blk(1.0, 0.035, K.stone, L + 0.5, 0.18));
    g.add(blk(0.8, 0.035, K.stone, L + 0.4, 0.1));
    const btn = blk(0.44, 0.13, K.cobalt, L + 0.22, -0.12); btns.push(btn); g.add(btn);
    g.add(blk(1.0, 0.92, K.sand, 0.86, 0.36));
    g.add(blk(0.5, 0.5, K.cobalt, 0.86, 0.36));
    // tarjetas
    for (let i = 0; i < 3; i++) {
      const x = L + 0.4 + i * 0.88;
      g.add(blk(0.8, 0.56, K.sand, x, -0.62));
      g.add(blk(0.5, 0.03, K.black, x - 0.1, -0.98));
      g.add(blk(0.36, 0.025, K.stone, x - 0.17, -1.05));
    }
    // franja oscura (pie de página)
    g.add(blk(W - 0.2, 0.5, K.black, 0, -1.48));
    g.add(blk(0.5, 0.03, K.ivory, L + 0.25, -1.4));
    g.add(blk(0.36, 0.03, K.ivory, L + 0.85, -1.4));
  }

  // teléfono
  const ph = new THREE.Group(); root.add(ph);
  ph.position.set(1.55, -0.62, 0.75); ph.rotation.set(0.04, 0.18, -0.04);
  const pBody = panel(0.86, 1.74, 0.09, 0.15, chrome()); ph.add(pBody);
  const scr = panel(0.76, 1.62, 0.01, 0.1, ivw); scr.position.z = pBody.userData.front; ph.add(scr);
  const sz = pBody.userData.front + scr.userData.front;
  const pc = new THREE.Group(); ph.add(pc);
  const PPER = 2.2;
  const pMats = []; const cmP = (c, o = 1) => { const m = flat(c, o); pMats.push(m); return m; };
  let zj = 0; const pblk = (w, h, c, x, y, o = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), cmP(c, o)); m.position.set(x, y, sz + 0.004 + (zj++ % 40) * 0.0004); return m; };
  for (const off of [0, -PPER]) {
    const g = new THREE.Group(); g.position.y = off; pc.add(g);
    g.add(pblk(0.52, 0.09, K.black, -0.06, 0.6)); g.add(pblk(0.36, 0.09, K.black, -0.14, 0.48));
    g.add(pblk(0.5, 0.025, K.stone, -0.07, 0.36)); g.add(pblk(0.26, 0.08, K.cobalt, -0.19, 0.24));
    g.add(pblk(0.62, 0.5, K.sand, 0, -0.1)); g.add(pblk(0.3, 0.3, K.cobalt, 0, -0.1));
    g.add(pblk(0.62, 0.3, K.sand, 0, -0.56)); g.add(pblk(0.62, 0.3, K.sand, 0, -0.92));
  }

  // cursor que hace clic en el botón
  const cur = new THREE.Group(); win.add(cur);
  const cs = new THREE.Shape(); cs.moveTo(0, 0); cs.lineTo(0, -0.2); cs.lineTo(0.055, -0.15); cs.lineTo(0.09, -0.23); cs.lineTo(0.12, -0.215); cs.lineTo(0.085, -0.14); cs.lineTo(0.15, -0.14); cs.lineTo(0, 0);
  const curM = new THREE.Mesh(new THREE.ShapeGeometry(cs), flat(K.black)); cur.add(curM);
  const curW = new THREE.Mesh(new THREE.ShapeGeometry(cs), flat(K.ivory)); curW.scale.setScalar(1.25); curW.position.set(-0.012, 0.016, -0.001); cur.add(curW);

  const planes = [new THREE.Plane(), new THREE.Plane()];
  clipMats.forEach((m) => (m.clippingPlanes = planes));
  const pPlanes = [new THREE.Plane(), new THREE.Plane()];
  pMats.forEach((m) => (m.clippingPlanes = pPlanes));
  const v = new THREE.Vector3(), nrm = new THREE.Vector3();
  const pTop = new THREE.Plane(), pBot = new THREE.Plane();

  return (t) => {
    const ph1 = (t / T) * TAU;
    // desplazamiento en dos tramos con pausa (vuelve a 0 al cerrar el loop)
    const seg = (t / T) * 2, k = Math.floor(seg), f = seg - k;
    const sc = PER * (k + eio(ss(0.6, 0.95, f))) / 2;
    content.position.y = sc % PER;
    const pseg = ((t / T + 0.25) % 1) * 2, pk = Math.floor(pseg), pf = pseg - pk;
    pc.position.y = (PPER * (pk + eio(ss(0.2, 0.8, pf))) / 2) % PPER;
    // flotación con parallax entre planos
    win.position.set(0, 0.05 * Math.sin(ph1), 0);
    win.rotation.set(0.02 * Math.sin(ph1 + 1), 0.03 * Math.cos(ph1), 0);
    ph.position.y = -0.62 + 0.09 * Math.sin(ph1 + 1.9);
    ph.rotation.y = 0.18 + 0.05 * Math.sin(ph1 + 0.6);
    band.rotation.z = 0.04 * Math.sin(ph1);
    scene.environmentRotation.set(0, 0.5 * Math.sin(ph1), 0);
    // cursor: va al botón, hace clic, recorre la página y vuelve al punto de partida
    const a = (t / T) % 1;
    const P0 = [0.55, -0.62], P1 = [L + 0.3, -0.2], P2 = [0.95, 0.15];
    const k1 = eio(ss(0.02, 0.14, a)), k2 = eio(ss(0.26, 0.42, a)), k3 = eio(ss(0.84, 0.98, a));
    const cx = P0[0] + (P1[0] - P0[0]) * k1 + (P2[0] - P1[0]) * k2 + (P0[0] - P2[0]) * k3;
    const cy = P0[1] + (P1[1] - P0[1]) * k1 + (P2[1] - P1[1]) * k2 + (P0[1] - P2[1]) * k3;
    cur.position.set(cx, cy, fz + 0.03);
    const pr = Math.sin(Math.PI * ss(0.16, 0.22, a));
    cur.scale.setScalar(1 - 0.16 * pr);
    btns.forEach((b) => b.material.color.setHex(K.cobalt).lerp(new THREE.Color(K.cobaltDeep), pr));
    // recorte al área visible de la ventana
    win.updateMatrixWorld(true);
    nrm.set(0, -1, 0).transformDirection(win.matrixWorld);
    v.set(0, VT, 0).applyMatrix4(win.matrixWorld); planes[0].setFromNormalAndCoplanarPoint(nrm, v);
    nrm.set(0, 1, 0).transformDirection(win.matrixWorld);
    v.set(0, VB, 0).applyMatrix4(win.matrixWorld); planes[1].setFromNormalAndCoplanarPoint(nrm, v);
    ph.updateMatrixWorld(true);
    nrm.set(0, -1, 0).transformDirection(ph.matrixWorld); v.set(0, 0.74, 0).applyMatrix4(ph.matrixWorld); pPlanes[0].setFromNormalAndCoplanarPoint(nrm, v);
    nrm.set(0, 1, 0).transformDirection(ph.matrixWorld); v.set(0, -0.74, 0).applyMatrix4(ph.matrixWorld); pPlanes[1].setFromNormalAndCoplanarPoint(nrm, v);
  };
}


// ---------------------------------------------------------------- AUTOMATIZACIONES
// Una tarea (ficha marfil) recorre un riel de cromo y pasa por cuatro etapas que se van marcando.
function automatizaciones({ scene }) {
  const root = new THREE.Group(); scene.add(root);
  root.rotation.set(0.3, -0.36, 0.05); root.position.set(-0.42, -0.3, 0); root.scale.setScalar(0.86);
  const STOPS = [[-1.55, 1.15, 0.0], [-0.45, 0.4, 0.1], [0.6, -0.35, 0.05], [1.6, -1.1, 0.0]];
  const rail = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.9, 2.0, -0.35), ...STOPS.map(([x, y, z]) => new THREE.Vector3(x, y, z - 0.32)), new THREE.Vector3(2.9, -1.85, -0.35)], false, 'centripetal');
  root.add(new THREE.Mesh(ribbonGeo(rail, { n: 420, w: 0.34, t: 0.05, twist: 0 }), chrome()));
  const ivc = ivory(); ivc.emissive.multiplyScalar(1.22);
  const LBL = ['Recibido', 'Validado', 'Registrado', 'Avisado'];
  const cards = STOPS.map(([x, y, z], i) => {
    const g = new THREE.Group(); g.position.set(x + 0.35, y + 0.42, z); root.add(g);
    const p = panel(1.12, 0.62, 0.06, 0.09, ivc); g.add(p);
    const fz = p.userData.front;
    textPlane(p, textTex(['0' + (i + 1)], { w: 256, h: 128, font: '400 64px PM', color: '#8a867c' }), 0.4, 0.2, -0.36, 0.17, fz + 0.002);
    textPlane(p, textTex([LBL[i]], { w: 512, h: 128, font: '600 78px HG', color: '#070708', ls: -2 }), 0.84, 0.21, -0.12, -0.08, fz + 0.002);
    const ring = disc(p, 0.1, K.black, 0.4, 0.15, { ring: 0.018, z: fz + 0.003, o: 0.35 });
    const dot = disc(p, 0.1, K.cobalt, 0.4, 0.15, { z: fz + 0.004 });
    const ck = new THREE.Shape(); ck.moveTo(-0.045, 0); ck.lineTo(-0.015, -0.03); ck.lineTo(0.05, 0.035); ck.lineTo(0.038, 0.047); ck.lineTo(-0.015, -0.006); ck.lineTo(-0.033, 0.012);
    const chk = new THREE.Mesh(new THREE.ShapeGeometry(ck), flat(K.ivory)); chk.position.set(0.4, 0.15, fz + 0.005); p.add(chk);
    return { g, dot, chk, ring };
  });
  // ficha de la tarea
  const tok = new THREE.Group(); root.add(tok);
  const tp = panel(0.5, 0.34, 0.05, 0.07, ivc); tok.add(tp);
  mark(tp, 0.28, 0.04, K.black, -0.06, 0.06, { z: tp.userData.front + 0.002 });
  mark(tp, 0.2, 0.03, K.stone, -0.1, -0.02, { z: tp.userData.front + 0.002 });
  mark(tp, 0.12, 0.06, K.cobalt, -0.14, -0.1, { z: tp.userData.front + 0.002, r: 0.02 });
  // posición de cada parada sobre el riel
  const uStop = STOPS.map(([x, y]) => { let best = 0, bd = 1e9; const v = new THREE.Vector3(); for (let i = 0; i <= 400; i++) { rail.getPointAt(i / 400, v); const d = (v.x - x) ** 2 + (v.y - y) ** 2; if (d < bd) { bd = d; best = i / 400; } } return best; });
  const v = new THREE.Vector3(), tg = new THREE.Vector3();
  // guion (s): entra 0–0.8, viaja entre paradas (0.9 s c/u con pausa), sostiene completo, se reinicia 7.2–8
  return (t) => {
    const ph = (t / T) * TAU;
    let u, done = -1;
    const start = 0.15, legs = [[0.3, 1.1], [1.5, 2.4], [2.8, 3.7], [4.1, 5.0]];
    if (t < legs[0][0]) u = mix(uStop[0] - 0.2, uStop[0], eout(t / legs[0][0]));
    else {
      u = uStop[0];
      for (let i = 0; i < 4; i++) {
        const [a, b] = legs[i];
        const from = i === 0 ? uStop[0] - 0.2 : uStop[i - 1];
        if (t >= a) { u = mix(i === 0 ? uStop[0] : uStop[i - 1], uStop[i], eio(ss(a, b, t))); }
        if (t >= b) done = i;
      }
      if (t > legs[0][1]) {
        u = uStop[0];
        for (let i = 1; i < 4; i++) if (t >= legs[i][0]) u = mix(uStop[i - 1], uStop[i], eio(ss(legs[i][0], legs[i][1], t)));
      }
    }
    // al final la ficha sigue y sale; al reiniciar entra de nuevo
    if (t > 6.2) u = mix(uStop[3], 1.02, eio(ss(6.2, 7.3, t)));
    rail.getPointAt(clamp(u, 0, 1), v); rail.getTangentAt(clamp(u, 0, 1), tg);
    tok.position.set(v.x, v.y + 0.04, v.z + 0.34);
    tok.rotation.z = Math.atan2(tg.y, tg.x) * 0.25;
    const fadeIn = ss(0, 0.35, t), fadeOut = 1 - ss(6.9, 7.4, t);
    tok.scale.setScalar(Math.max(0.001, fadeIn * fadeOut));
    // etapas: se marcan al llegar la ficha; se limpian al cerrar el loop
    cards.forEach((c, i) => {
      const at = legs[i][1] - 0.15;
      const on = ss(at, at + 0.25, t) * (1 - ss(7.45, 7.9, t));
      c.dot.scale.setScalar(Math.max(0.001, on)); c.chk.scale.setScalar(Math.max(0.001, ss(at + 0.1, at + 0.3, t) * (1 - ss(7.45, 7.9, t))));
      const lift = Math.sin(Math.PI * ss(at - 0.1, at + 0.6, t));
      c.g.position.z = STOPS[i][2] + 0.12 * lift;
      c.g.rotation.x = 0.04 * Math.sin(ph + i);
    });
    scene.environmentRotation.set(0, 0.4 * Math.sin(ph), 0);
  };
}

// ---------------------------------------------------------------- INTEGRACIONES
// Tres herramientas sobre los lóbulos de la cinta KROMA; una señal recorre la cinta y las conecta.
function integraciones({ scene }) {
  const root = new THREE.Group(); scene.add(root);
  root.rotation.set(-0.35, 0.28, -0.1); root.scale.setScalar(0.86); root.position.set(0.12, -0.12, 0);
  const curve = new FnCurve((u, o) => pClosed(u, o, 0.55));
  root.add(new THREE.Mesh(ribbonGeo(curve, { n: 600, w: 0.3, t: 0.05, twist: 1.5, closed: true, widthFn: (u) => 1 + 0.4 * Math.sin(3 * u * TAU + 2.2) }), chrome()));
  // lóbulos: máximos de r en la curva (cos(3θ+0.35)=1)
  const lobes = [0, 1, 2].map((k) => ((-0.35 / TAU + k / 3) % 1 + 1) % 1);
  const ivc = ivory(); ivc.emissive.multiplyScalar(1.22);
  const tools = lobes.map((u, k) => {
    const g = new THREE.Group(); root.add(g);
    const p0 = pClosed(u, new THREE.Vector3(), 0.55);
    g.position.set(p0.x * 1.28, p0.y * 1.28, p0.z + 0.5);
    g.rotation.copy(new THREE.Euler(0.35, -0.28, 0.1)); // de frente a la cámara
    const p = panel(1.05, 0.78, 0.06, 0.09, ivc); g.add(p);
    const fz = p.userData.front + 0.002;
    mark(p, 1.05, 0.16, K.sand, 0, 0.31, { z: fz });
    [0, 1, 2].forEach((i) => disc(p, 0.022, K.black, -0.43 + i * 0.07, 0.31, { o: 0.3, z: fz + 0.001 }));
    let acc = [];
    if (k === 0) { // planilla
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const m = mark(p, 0.2, 0.1, r === 1 && c === 2 ? K.cobalt : K.sand, -0.33 + c * 0.22, 0.1 - r * 0.14, { z: fz + 0.001 }); if (r === 1 && c === 2) acc.push(m); }
    } else if (k === 1) { // mensajes
      mark(p, 0.55, 0.12, K.sand, -0.17, 0.1, { r: 0.06, z: fz }); acc.push(mark(p, 0.48, 0.12, K.cobalt, 0.2, -0.07, { r: 0.06, z: fz })); mark(p, 0.4, 0.12, K.sand, -0.24, -0.24, { r: 0.06, z: fz });
    } else { // gráfico
      [0.18, 0.3, 0.22, 0.42].forEach((h, i) => { const m = mark(p, 0.12, h, i === 3 ? K.cobalt : K.black, -0.3 + i * 0.2, -0.3 + h / 2, { z: fz }); if (i === 3) acc.push(m); });
      mark(p, 0.82, 0.008, K.stone, 0, -0.3, { z: fz + 0.001 });
    }
    const halo = glowSprite(glowTex(), 1.0); halo.position.set(0, 0, 0.1); halo.material.opacity = 0; g.add(halo);
    return { g, acc, halo, u };
  });
  // señal con estela
  const gt = glowTex();
  const trail = Array.from({ length: 14 }, (_, i) => { const s = glowSprite(gt, 0.5 * (1 - i / 16)); s.material.opacity = 1 - i / 14; root.add(s); return s; });
  const v = new THREE.Vector3();
  return (t) => {
    const ph = (t / T) * TAU;
    // la señal da una vuelta completa por loop, frenando apenas en cada herramienta
    const raw = t / T;
    const warp = (x) => x - 0.035 * Math.sin(3 * TAU * (x - lobes[0]));
    trail.forEach((s, i) => { const u = ((warp(raw) - i * 0.006) % 1 + 1) % 1; pClosed(u, v, 0.55); s.position.set(v.x, v.y, v.z + 0.06); });
    const cu = ((warp(raw) % 1) + 1) % 1;
    tools.forEach((tl) => {
      let d = Math.abs(cu - tl.u); d = Math.min(d, 1 - d);
      const hit = Math.exp(-((d / 0.05) ** 2));
      tl.halo.material.opacity = 0.55 * hit;
      tl.acc.forEach((m) => m.material.color.setHex(K.cobalt).lerp(new THREE.Color(K.glow), hit));
      tl.g.position.z = pClosed(tl.u, v, 0.55).z + 0.5 + 0.1 * hit;
    });
    root.rotation.y = 0.28 + 0.06 * Math.sin(ph);
    root.rotation.x = -0.35 + 0.03 * Math.cos(ph);
    scene.environmentRotation.set(0, 0.6 * Math.sin(ph), 0);
  };
}

// ---------------------------------------------------------------- IDENTIDAD DIGITAL
// La forma de cromo en el centro; piezas de marca (tarjeta, post, historia, tipografía, colores)
// se ordenan en un sistema y se sueltan.
function identidad({ scene }) {
  const root = new THREE.Group(); scene.add(root);
  root.rotation.set(0.12, -0.3, 0); root.scale.setScalar(1.0);
  const form = new THREE.Mesh(ribbonGeo(new FnCurve((u, o) => pClosed(u, o, 0.6)), { n: 600, w: 0.3, t: 0.05, twist: 1.5, closed: true, widthFn: (u) => 1 + 0.45 * Math.sin(3 * u * TAU + 2.2) }), chrome());
  form.scale.setScalar(0.6); root.add(form);
  const ivc = ivory(); ivc.emissive.multiplyScalar(1.22);
  const blackM = new THREE.MeshPhysicalMaterial({ color: K.black, metalness: 0.1, roughness: 0.5 });
  const pieces = [];
  const add = (mk, home, out) => { const g = new THREE.Group(); root.add(g); mk(g); pieces.push({ g, home, out }); };
  // tarjeta
  add((g) => { const p = panel(1.0, 0.6, 0.04, 0.05, ivc); g.add(p); const z = p.userData.front + 0.002;
    disc(p, 0.08, K.cobalt, -0.34, 0.14, { z }); mark(p, 0.42, 0.05, K.black, 0.05, 0.15, { z }); mark(p, 0.3, 0.03, K.stone, -0.01, -0.12, { z }); mark(p, 0.36, 0.03, K.stone, 0.02, -0.19, { z }); },
    [-1.25, 0.95, 0.1, 0, 0, -0.04], [-1.6, 1.25, 0.45, 0.3, -0.4, -0.25]);
  // post cuadrado
  add((g) => { const p = panel(0.86, 0.86, 0.04, 0.06, ivc); g.add(p); const z = p.userData.front + 0.002;
    mark(p, 0.86, 0.5, K.cobalt, 0, 0.18, { z }); disc(p, 0.12, K.ivory, 0.18, 0.2, { z: z + 0.001 }); mark(p, 0.5, 0.06, K.black, -0.1, -0.16, { z }); mark(p, 0.34, 0.035, K.stone, -0.18, -0.27, { z }); },
    [1.3, 0.9, 0.05, 0, 0, 0.03], [1.65, 1.3, 0.4, -0.25, 0.45, 0.3]);
  // historia 9:16
  add((g) => { const p = panel(0.56, 1.0, 0.04, 0.06, blackM); g.add(p); const z = p.userData.front + 0.002;
    mark(p, 0.4, 0.06, K.ivory, -0.02, 0.28, { z }); mark(p, 0.3, 0.06, K.ivory, -0.07, 0.18, { z }); mark(p, 0.4, 0.28, K.cobalt, 0, -0.2, { z, r: 0.03 }); },
    [1.45, -0.55, 0.2, 0, 0, 0.05], [1.8, -0.9, 0.55, 0.25, 0.5, 0.35]);
  // tipografía
  add((g) => { const p = panel(0.78, 0.78, 0.04, 0.06, blackM); g.add(p);
    textPlane(p, textTex(['Aa'], { w: 512, h: 512, font: '600 300px HG', color: '#f5f1e8', align: 'center', x: 0.5, y: 0.47, ls: -10 }), 0.78, 0.78, 0, 0, p.userData.front + 0.002); },
    [-1.35, -0.55, 0.15, 0, 0, -0.05], [-1.75, -0.95, 0.5, -0.3, -0.45, -0.3]);
  // colores
  [[K.black, -0.42], [K.cobalt, 0], [K.ivory, 0.42]].forEach(([c, dx], i) => add((g) => { const m = c === K.ivory ? ivc : c === K.black ? blackM : new THREE.MeshPhysicalMaterial({ color: K.cobalt, metalness: 0.1, roughness: 0.45, emissive: new THREE.Color(K.cobalt).multiplyScalar(0.55) }); const p = panel(0.34, 0.46, 0.04, 0.05, m); g.add(p); },
    [dx, -1.45, 0.25, 0, 0, 0], [dx * 1.7, -1.8, 0.6, 0.35 * (i - 1), 0.3, 0.25 * (i - 1)]));
  return (t) => {
    const ph = (t / T) * TAU;
    // ordenado al inicio y al final; se abre en el medio
    const k = eio(ss(1.6, 3.8, t)) * (1 - eio(ss(4.8, 7.2, t)));
    pieces.forEach(({ g, home, out }, i) => {
      const w = 0.025 * Math.sin(ph + i * 1.3);
      g.position.set(mix(home[0], out[0], k), mix(home[1], out[1], k) + w, mix(home[2], out[2], k));
      g.rotation.set(mix(home[3], out[3], k), mix(home[4], out[4], k), mix(home[5], out[5], k));
    });
    form.rotation.set(0.5 * Math.sin(ph) * 0.3, ph, 0.2);
    form.scale.setScalar(0.6 + 0.08 * k);
    scene.environmentRotation.set(0, 0.5 * Math.sin(ph), 0);
  };
}

// ---------------------------------------------------------------- CONSULTORÍA
// Opciones dispersas (placas de cromo) se ordenan; una se elige y se vuelve marfil con su marca.
function consultoria({ scene }) {
  const root = new THREE.Group(); scene.add(root);
  root.rotation.set(0.15, -0.45, 0.02); root.scale.setScalar(1.05); root.position.set(0.3, -0.12, 0);
  const N = 6, CH = 2;
  const ivc = ivory(); ivc.emissive.multiplyScalar(1.22);
  const rnd = (i, s) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
  const opts = Array.from({ length: N }, (_, i) => {
    const g = new THREE.Group(); root.add(g);
    const cm = chrome();
    const p = panel(1.7, 0.36, 0.07, 0.1, cm); g.add(p);
    const z = p.userData.front + 0.002;
    const l1 = mark(p, 0.7, 0.05, K.black, -0.35, 0.04, { z, o: 0.0 });
    const l2 = mark(p, 0.45, 0.035, K.stone, -0.47, -0.07, { z, o: 0.0 });
    const dot = disc(p, 0.09, K.cobalt, 0.62, 0, { z }); dot.scale.setScalar(0.001);
    const ck = new THREE.Shape(); ck.moveTo(-0.04, 0); ck.lineTo(-0.013, -0.027); ck.lineTo(0.045, 0.031); ck.lineTo(0.034, 0.042); ck.lineTo(-0.013, -0.005); ck.lineTo(-0.029, 0.011);
    const chk = new THREE.Mesh(new THREE.ShapeGeometry(ck), flat(K.ivory)); chk.position.set(0.62, 0, z + 0.002); chk.scale.setScalar(0.001); p.add(chk);
    const scat = [ (rnd(i, 1) - 0.5) * 3.4, (rnd(i, 2) - 0.5) * 3.0, (rnd(i, 3) - 0.5) * 1.6, (rnd(i, 4) - 0.5) * 1.6, (rnd(i, 5) - 0.5) * 2.2, (rnd(i, 6) - 0.5) * 1.4 ];
    const home = [0, 1.15 - i * 0.46, 0, 0, 0, 0];
    return { g, cm, l1, l2, dot, chk, scat, home };
  });
  const cChrome = new THREE.Color(0xdfe3ec), cIv = new THREE.Color(K.ivory);
  return (t) => {
    const ph = (t / T) * TAU;
    // 0–1.6 elegido (cuadro inicial) · 1.6–3 se dispersa · 3–4.4 deriva · 4.4–6.4 se ordena · 6.4–8 se elige
    const sc = eio(ss(1.6, 3.0, t)) * (1 - eio(ss(4.2, 6.0, t)));
    const pick = 1 - eio(ss(1.0, 1.8, t)) + eio(ss(6.2, 7.4, t));
    const pk = clamp(pick);
    opts.forEach((o, i) => {
      const dr = 0.06 * Math.sin(ph * 1 + i);
      const x = mix(o.home[0], o.scat[0], sc) + (i === CH ? 0.55 * pk : -0.08 * pk);
      o.g.position.set(x, mix(o.home[1], o.scat[1], sc) + dr * sc, mix(o.home[2], o.scat[2], sc) + (i === CH ? 0.35 * pk : 0));
      o.g.rotation.set(mix(0, o.scat[3], sc), mix(0, o.scat[4], sc), mix(0, o.scat[5], sc));
      const iv = i === CH ? pk : 0;
      o.cm.color.copy(cChrome).lerp(cIv, iv); o.cm.metalness = mix(1, 0.08, iv); o.cm.roughness = mix(0.035, 0.6, iv);
      o.cm.emissive.copy(cIv).multiplyScalar(0.88 * iv);
      o.l1.material.opacity = iv; o.l2.material.opacity = iv;
      o.dot.scale.setScalar(Math.max(0.001, i === CH ? ss(0.3, 1, pk) : 0)); o.chk.scale.setScalar(Math.max(0.001, i === CH ? ss(0.5, 1, pk) : 0));
      o.l1.material.opacity = iv; o.l2.material.opacity = iv;
      if (i !== CH) { o.g.scale.setScalar(1 - 0.06 * pk); }
    });
    scene.environmentRotation.set(0, ph, 0);
  };
}

// ---------------------------------------------------------------- NOSOTROS
// Una banda de cromo que avanza suavemente sobre el marfil (onda viajera: vuelve a su forma en cada loop).
function nosotros({ scene }) {
  const root = new THREE.Group(); scene.add(root);
  root.rotation.set(0.2, -0.3, -0.35);
  const mat = chrome();
  const UP = new THREE.Vector3(0, 0.35, 1).normalize();
  const mk = (ph) => new THREE.CatmullRomCurve3(Array.from({ length: 13 }, (_, i) => {
    const x = -3.6 + i * 0.6;
    return new THREE.Vector3(x, 0.75 * Math.sin(x * 1.05 - ph) + 0.25 * Math.sin(x * 2.3 - 2 * ph), 0.6 * Math.cos(x * 0.9 - ph));
  }));
  let mesh = new THREE.Mesh(ribbonGeo(mk(0), { n: 420, w: 0.6, t: 0.06, twist: 1, up: UP }), mat); root.add(mesh); root.scale.setScalar(0.85);
  return (t) => {
    const ph = (t / T) * TAU;
    mesh.geometry.dispose();
    mesh.geometry = ribbonGeo(mk(ph), { n: 420, w: 0.6, t: 0.06, twist: 1, up: UP });
    scene.environmentRotation.set(0, 0.4 * Math.sin(ph), 0);
  };
}

const BUILD = { webs, automatizaciones, integraciones, 'identidad-digital': identidad, 'consultoria-tecnologica': consultoria, nosotros };

// ---------------------------------------------------------------- arranque
const ctx = setup({ size: SIZE, bg: BG[NAME] });
await document.fonts.load('600 100px HG'); await document.fonts.load('400 40px PM');
const update = BUILD[NAME](ctx);
window.T = T;
window.seek = (t) => { update(((t % T) + T) % T); ctx.renderer.render(ctx.scene, ctx.camera); };
window.seek(Number(Q.get('t') || 0));
window.ready = true;
