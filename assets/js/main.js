/* =========================================================
   KROMA — coordinación de movimiento e interacciones
   Sin dependencias. Un único motor de scroll (rAF) y un único
   observador de entradas. Todo se degrada a contenido estático.
   ========================================================= */
(() => {
  "use strict";

  const root = document.documentElement;
  const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  const mqFine = matchMedia("(hover: hover) and (pointer: fine)");
  const mqDesktop = matchMedia("(min-width: 921px)");
  const reduce = () => mqReduce.matches;
  const fine = () => mqFine.matches && !reduce();
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* Registro de limpieza: listeners, observers y loops por página */
  const cleanups = [];
  const on = (el, ev, fn, opts) => { el.addEventListener(ev, fn, opts); cleanups.push(() => el.removeEventListener(ev, fn, opts)); };
  const teardown = () => { while (cleanups.length) { try { cleanups.pop()(); } catch (e) {} } };

  /* =======================================================
     1. Motor de scroll: progreso por elemento, sólo si es visible
     ======================================================= */
  const Scroll = (() => {
    const items = [];
    let vh = innerHeight, ticking = false;
    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      request();
    }, { rootMargin: "15% 0px 15% 0px" });

    function measure(it) {
      const r = it.el.getBoundingClientRect();
      let p;
      if (it.mode === "top") p = -r.top / Math.max(1, r.height);              // 0 al tope, 1 al salir
      else if (it.mode === "center") p = (vh * 0.85 - r.top) / (r.height + vh * 0.35); // tramo de lectura
      else p = (vh - r.top) / (vh + r.height);                                  // entra → sale
      return clamp(p);
    }
    function frame() {
      ticking = false;
      for (const it of items) {
        if (!visible.has(it.el) && !it.always) continue;
        const p = measure(it);
        if (p !== it.last) { it.last = p; it.fn(p); }
      }
    }
    function request() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    function add(el, fn, mode = "through", always = false) {
      if (!el) return;
      const it = { el, fn, mode, always, last: -1 };
      items.push(it); io.observe(el);
      fn(measure(it));
    }
    function resize() { vh = innerHeight; items.forEach((i) => (i.last = -1)); request(); }
    on(window, "scroll", request, { passive: true });
    on(window, "resize", resize);
    const ro = new ResizeObserver(() => { items.forEach((i) => (i.last = -1)); request(); });
    ro.observe(document.body);
    cleanups.push(() => { io.disconnect(); ro.disconnect(); items.length = 0; });
    return { add, request };
  })();

  /* =======================================================
     2. Revelados que se disparan una vez
     ======================================================= */
  function initReveals() {
    const els = $$("[data-reveal], .lines[data-lines], .hero__media, .hero__ivory, .hero__mark-in");
    if (reduce()) { els.forEach((el) => el.classList.add("is-in")); return; }
    // Un elemento recortado por completo con clip-path nunca "intersecta":
    // en esos casos se observa al contenedor y se revela el hijo.
    const proxy = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        [e.target, ...(proxy.get(e.target) || [])].forEach((el) => el.classList.add("is-in"));
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    els.forEach((el) => {
      const clipped = /^(clip|wipe)$/.test(el.dataset.reveal || "");
      const target = clipped ? el.parentElement : el;
      if (clipped) proxy.set(target, [...(proxy.get(target) || []), el]);
      io.observe(target);
    });
    cleanups.push(() => io.disconnect());
    // El hero arranca enseguida, sin esperar al observer
    requestAnimationFrame(() => $$(".hero .lines, .hero__media, .hero__ivory, .hero__mark-in, .page-hero .lines").forEach((el) => el.classList.add("is-in")));
  }

  /* =======================================================
     3. Header: tono según la sección debajo, fondo al scrollear
     ======================================================= */
  function initHeader() {
    const header = $(".site-header");
    if (!header) return;
    const sections = $$("[data-theme]");
    let lastY = scrollY;
    const update = () => {
      const y = scrollY;
      const probe = header.offsetHeight / 2;
      let tone = "ivory";
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) { tone = s.dataset.theme; break; }
      }
      header.dataset.on = tone;
      header.classList.toggle("is-solid", y > 24);
      const menuOpen = document.body.classList.contains("menu-open");
      const focusInHeader = header.contains(document.activeElement);
      header.classList.toggle("is-hidden", !menuOpen && !focusInHeader && y > 500 && y > lastY + 4);
      if (y < lastY - 4 || y < 500) header.classList.remove("is-hidden");
      lastY = y;
    };
    let raf = 0;
    on(window, "scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    on(window, "resize", update);
    on(header, "focusin", () => header.classList.remove("is-hidden"));
    update();

    // Indicador deslizante dentro de la cápsula de navegación
    const list = $(".nav__list"), ind = $(".nav__pill-ind");
    if (list && ind) {
      const links = $$(".nav__link", list);
      const active = links.find((a) => a.getAttribute("aria-current") === "page") || $(".nav__item--sub.is-current .nav__link", list);
      const moveTo = (el) => {
        if (!el) { list.classList.remove("has-ind"); return; }
        const target = el.closest(".nav__row") || el;
        const lr = list.getBoundingClientRect(), r = target.getBoundingClientRect();
        list.style.setProperty("--x", `${(r.left - lr.left).toFixed(1)}px`);
        list.style.setProperty("--w", `${r.width.toFixed(1)}px`);
        list.classList.add("has-ind");
      };
      // el indicador arranca en la página actual sin animar
      ind.style.transition = "none"; moveTo(active); requestAnimationFrame(() => (ind.style.transition = ""));
      links.forEach((a) => { on(a, "pointerenter", () => moveTo(a)); on(a, "focus", () => moveTo(a)); });
      const sub = $(".nav__subtoggle", list); if (sub) { on(sub, "pointerenter", () => moveTo(sub)); on(sub, "focus", () => moveTo(sub)); }
      on(list, "pointerleave", () => moveTo(active));
      on(list, "focusout", (e) => { if (!list.contains(e.relatedTarget)) moveTo(active); });
      on(window, "resize", () => moveTo(active));
      document.fonts && document.fonts.ready.then(() => moveTo(active));
    }
    // Brillo que sigue al puntero en las tarjetas del menú
    $$(".mega__tile").forEach((t) => on(t, "pointermove", (e) => {
      const r = t.getBoundingClientRect();
      t.style.setProperty("--mx", `${e.clientX - r.left}px`); t.style.setProperty("--my", `${e.clientY - r.top}px`);
    }, { passive: true }));

    // Submenú de Servicios (teclado y click)
    $$(".nav__item--sub").forEach((item) => {
      const btn = $(".nav__subtoggle", item);
      const close = () => { item.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); };
      on(btn, "click", () => {
        const open = !item.classList.contains("is-open");
        item.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
      });
      on(item, "keydown", (e) => { if (e.key === "Escape") { close(); btn.focus(); } });
      on(item, "focusout", (e) => { if (!item.contains(e.relatedTarget)) close(); });
      on(document, "click", (e) => { if (!item.contains(e.target)) close(); });
    });

    // Menú móvil
    const toggle = $(".menu-toggle"), menu = $(".mobile-menu");
    if (toggle && menu) {
      const setOpen = (open) => {
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
        menu.classList.toggle("is-open", open);
        menu.inert = !open;
        document.body.classList.toggle("menu-open", open);
        if (open) setTimeout(() => $("a", menu)?.focus(), 80);
      };
      menu.inert = true;
      on(toggle, "click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
      on(document, "keydown", (e) => {
        if (e.key === "Escape" && menu.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
        if (e.key === "Tab" && menu.classList.contains("is-open")) {
          const f = [toggle, ...$$("a", menu)];
          const i = f.indexOf(document.activeElement);
          if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
        }
      });
      on(mqDesktop, "change", () => mqDesktop.matches && setOpen(false));
    }
  }

  /* =======================================================
     4. Transición entre páginas: cortina curva azul
     ======================================================= */
  function initTransitions() {
    const DUR = 400;
    on(document, "click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // nueva pestaña, etc.
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // anclas
      if (reduce()) return; // navegación directa
      e.preventDefault();
      try { sessionStorage.setItem("kroma-transition", "1"); } catch (err) {}
      root.classList.add("is-leaving");
      setTimeout(() => location.assign(url.href), DUR);
    });
    // Al volver con bfcache, la cortina no debe quedar puesta
    on(window, "pageshow", (e) => { if (e.persisted) root.classList.remove("is-leaving", "is-entering"); });
    if (root.classList.contains("is-entering")) {
      setTimeout(() => root.classList.remove("is-entering"), 700);
    }
  }

  /* =======================================================
     5. Hero de Inicio: máscara orgánica + parallax de planos
     ======================================================= */
  // Spline Catmull-Rom abierta (misma que en build.mjs)
  function spline(pts) {
    const f = (v) => v.toFixed(4); let d = "";
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d;
  }

  /* Ruido orgánico: suma de ondas con frecuencias no múltiplos entre sí.
     El movimiento nunca se repite igual y se percibe natural, no mecánico. */
  const organic = (t, seed) =>
    Math.sin(t * 0.31 + seed) * 0.55 +
    Math.sin(t * 0.53 + seed * 1.9) * 0.3 +
    Math.sin(t * 0.97 + seed * 3.7) * 0.15;

  /* Formas vivas de los heros internos: cada punto del contorno respira con ruido orgánico,
     y la forma entera deriva y reacciona levemente al puntero. Se pausa fuera de pantalla. */
  function initLiveShapes() {
    const paths = $$("path[data-live]");
    if (!paths.length || reduce()) return;
    const items = paths.map((p, n) => {
      const cfg = JSON.parse(p.dataset.live);
      const wrap = p.closest(".live");
      return { p, wrap, cfg, seed: n * 7.3 + 1, visible: true, mx: 0, my: 0, cx: 0, cy: 0 };
    });
    const f = (v) => v.toFixed(2);
    const closed = (pts) => {
      const n = pts.length; let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
        d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
      }
      return d + "Z";
    };
    const openWave = (pts) => {
      // forma de banda: los 3 primeros puntos son esquinas fijas, el resto es el borde vivo
      const [a, b, c, ...edge] = pts;
      return `M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${c[0]} ${c[1]}L${f(edge[0][0])} ${f(edge[0][1])}${spline(edge)}Z`;
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const it = items.find((x) => x.wrap === e.target); if (it) it.visible = e.isIntersecting;
    }));
    items.forEach((it) => it.wrap && io.observe(it.wrap));
    // reacción al puntero (solo desktop): la forma se corre unos píxeles hacia el cursor
    on(window, "pointermove", (e) => {
      if (!fine()) return;
      items.forEach((it) => {
        if (!it.visible || !it.wrap) return;
        const r = it.wrap.getBoundingClientRect();
        it.mx = clamp((e.clientX - (r.left + r.width / 2)) / innerWidth, -0.5, 0.5) * 30;
        it.my = clamp((e.clientY - (r.top + r.height / 2)) / innerHeight, -0.5, 0.5) * 24;
      });
    }, { passive: true });
    const t0 = performance.now(); let raf = 0, last = 0;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 20) return; last = now;
      const t = (now - t0) / 1000;
      items.forEach((it) => {
        if (!it.visible) return;
        const { pts, amp, open } = it.cfg;
        const moved = pts.map((p, i) => {
          if (open && i < 3) return p;
          const s = it.seed + i * 1.37;
          return [p[0] + amp * organic(t * 1.25, s), p[1] + amp * organic(t * 1.1, s + 9)];
        });
        it.p.setAttribute("d", open ? openWave(moved) : closed(moved));
        it.cx = lerp(it.cx, it.mx, 0.05); it.cy = lerp(it.cy, it.my, 0.05);
        if (it.wrap) {
          it.wrap.style.translate = `${f(organic(t * 0.55, it.seed + 3) * 30 + it.cx)}px ${f(organic(t * 0.5, it.seed + 5) * 36 + it.cy)}px`;
          if (!open) it.wrap.style.rotate = `${f(organic(t * 0.35, it.seed + 8) * 14)}deg`;
        }
      });
    };
    raf = requestAnimationFrame(loop);
    on(document, "visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(loop); });
    cleanups.push(() => { cancelAnimationFrame(raf); io.disconnect(); });
  }

  /* Proyectos: filtro por servicio y tarjetas que se apilan con el scroll */
  function initProjects() {
    const stack = $(".stack");
    if (!stack) return;
    const items = $$(".stack__item", stack), chips = $$(".pfilter__chip"), count = $("[data-count]"), empty = $(".pfilter__empty");
    chips.forEach((chip) => on(chip, "click", () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      let n = 0;
      items.forEach((it) => {
        const show = f === "all" || it.dataset.service === f;
        if (show) { n++; it.hidden = false; requestAnimationFrame(() => it.classList.remove("is-out")); }
        else { it.classList.add("is-out"); setTimeout(() => { if (it.classList.contains("is-out")) it.hidden = true; }, reduce() ? 0 : 340); }
      });
      if (count) count.textContent = String(n).padStart(2, "0");
      if (empty) empty.hidden = n > 0;
      // al filtrar, se vuelve al inicio de la lista para ver el resultado
      const top = stack.getBoundingClientRect().top + scrollY - 200;
      if (scrollY > top) scrollTo({ top, behavior: reduce() ? "auto" : "smooth" });
    }));
    if (reduce()) return;
    // Cada tarjeta se achica y oscurece a medida que la siguiente la tapa; la foto tiene parallax suave.
    items.forEach((it, i) => {
      const card = $(".pcard", it), para = $(".pcard__para", it);
      Scroll.add(it, (p) => {
        if (para) para.style.transform = `translate3d(0, ${((p - 0.5) * -10).toFixed(2)}%, 0)`;
      });
      const next = items[i + 1];
      if (!next || !card) return;
      Scroll.add(next, () => {
        if (!mqDesktop.matches || it.hidden || next.hidden) { card.style.transform = ""; card.style.setProperty("--dim", 0); return; }
        const a = it.getBoundingClientRect(), b = next.getBoundingClientRect();
        // k = cuánto cubrió la siguiente tarjeta a esta (0 → nada, 1 → completa)
        const k = clamp((a.bottom - b.top) / a.height);
        card.style.transform = `scale(${(1 - k * 0.06).toFixed(4)})`;
        card.style.setProperty("--dim", (k * 0.45).toFixed(3));
      }, "through", true);
    });
  }

  function initHero() {
    const hero = $(".hero");
    if (!hero || !hero.dataset.shape) return;
    const base = JSON.parse(hero.dataset.shape);
    const clip = $("#hero-clip-path"), ivoryPath = $("#hero-ivory-path");
    const photo = $(".hero__photo"), mark = $(".hero__mark"), follow = $(".hero__mark-follow");
    const markFloat = $(".hero__mark-float"), text = $(".hero__text"), frame = $(".hero__frame picture");
    if (reduce()) return;
    const TOP = base.photo[base.photo.length - 1][1];

    // Un solo motor para todo el hero: el scroll fija un objetivo y el motor lo alcanza con inercia,
    // combinándolo con la flotación ambiental en una única transformación por elemento.
    let target = 0, sp = 0, t0 = performance.now(), raf = 0, inView = true, last = 0, tNow = 0;
    const breathe = (pts, amp, seed, keepFirst, keepLast) => pts.map((p, i) => {
      if ((keepFirst && i === 0) || (keepLast && i === pts.length - 1)) return p;
      const s = seed + i * 1.37;
      // la amplitud crece hacia el centro de la curva (los tramos cerca del borde se mueven menos)
      const w = Math.sin(Math.PI * (i + 0.5) / pts.length) * 0.7 + 0.3;
      return [p[0] + amp * w * organic(tNow, s), p[1] + amp * 0.75 * w * organic(tNow * 0.87, s + 11)];
    });
    const smooth = (x) => x * x * (3 - 2 * x); // curva suave en ambos extremos
    const render = () => {
      const t = tNow, k = smooth(clamp(sp * 1.35));
      const amp = mqDesktop.matches ? 1 : 0.45;
      // Scroll: la foto se abre apenas hacia la izquierda y el lóbulo baja
      const ivory = breathe(base.ivory.map(([x, y]) => [x - 0.025 * k, y + 0.018 * k]), 0.022, 0.0, false, true);
      const photoPts = breathe(base.photo.map(([x, y], i) => [x - 0.03 * k * (1 - i / base.photo.length), y]), 0.024, 2.1, true, true);
      const lobe = breathe(base.lobe.map(([x, y]) => [x, y + 0.025 * k]), 0.02, 4.2, true, true);
      photoPts[0] = lobe[lobe.length - 1];
      const top = photoPts[photoPts.length - 1];
      if (ivoryPath) ivoryPath.setAttribute("d", `M${ivory[0][0]} ${ivory[0][1]}${spline(ivory)}L1 ${TOP}L1 ${lobe[0][1]}${spline(lobe)}L.5 1L0 1Z`);
      if (clip) clip.setAttribute("d", `M${top[0]} ${top[1]}L1 ${TOP}L1 ${lobe[0][1]}${spline(lobe)}${spline(photoPts)}Z`);
      // Foto: deriva lenta + parallax suave del scroll, en una sola transformación
      if (frame) frame.style.transform = `translate3d(${(organic(t, 7) * 1.4).toFixed(3)}%, calc(${(organic(t * 0.8, 3) * 1.1).toFixed(3)}% + ${(sp * 56 * amp).toFixed(2)}px), 0) scale(${(1.035 + organic(t * 0.6, 9) * 0.018 - k * 0.02).toFixed(4)})`;
      // Isotipo: sube con el scroll (más rápido que la foto: separa planos) y flota
      if (mark) mark.style.translate = `0 ${(-sp * 70 * amp).toFixed(2)}px`;
      if (markFloat) markFloat.style.transform = `translate3d(${(organic(t * 1.1, 5) * 10).toFixed(2)}px, ${(organic(t * 1.3, 1) * 16).toFixed(2)}px, 0) rotate(${(organic(t * 0.9, 2) * 6).toFixed(2)}deg)`;
      if (text && mqDesktop.matches) text.style.transform = `translate3d(${(organic(t * 0.7, 13) * 3).toFixed(2)}px, ${(organic(t * 0.6, 17) * 5).toFixed(2)}px, 0)`;
    };
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now; tNow = (now - t0) / 1000;
      // inercia independiente de la frecuencia de la pantalla (60/120 Hz)
      sp += (target - sp) * (1 - Math.exp(-dt * 7));
      render();
    };
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting; cancelAnimationFrame(raf);
      if (inView) { last = 0; raf = requestAnimationFrame(loop); }
    });
    io.observe(hero);
    on(document, "visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden && inView) { last = 0; raf = requestAnimationFrame(loop); } });
    cleanups.push(() => { cancelAnimationFrame(raf); io.disconnect(); });

    // El scroll solo actualiza el objetivo; el movimiento lo resuelve el motor de arriba
    Scroll.add(hero, (p) => { target = p; }, "top");

    // Sobre azul no hay rastro: el isotipo acompaña levemente al puntero (solo posición)
    if (follow) {
      let tx = 0, ty = 0, cx = 0, cy = 0, fr = 0, running = false;
      const step = () => {
        cx = lerp(cx, tx, 0.07); cy = lerp(cy, ty, 0.07);
        follow.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
        if (Math.abs(cx - tx) > 0.1 || Math.abs(cy - ty) > 0.1) fr = requestAnimationFrame(step); else running = false;
      };
      const kick = () => { if (!running) { running = true; fr = requestAnimationFrame(step); } };
      on(hero, "pointermove", (e) => {
        if (!fine()) return;
        const r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 26;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 18;
        kick();
      }, { passive: true });
      on(hero, "pointerleave", () => { tx = 0; ty = 0; kick(); });
      cleanups.push(() => cancelAnimationFrame(fr));
    }
  }

  /* =======================================================
     6. Parallax genérico y bandas orgánicas
     ======================================================= */
  function initParallax() {
    if (reduce()) return;
    $$("[data-parallax]").forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 0.1;
      Scroll.add(el.parentElement || el, (p) => {
        const a = mqDesktop.matches ? amt : amt * 0.4;
        el.style.transform = `translate3d(0, ${(p - 0.5) * -2 * a * 100}%, 0)`;
      });
    });
    $$("[data-band]").forEach((band) => {
      const svg = $("svg", band);
      const dir = band.dataset.band === "rev" ? 1 : -1;
      Scroll.add(band, (p) => { svg.style.transform = `translate3d(${dir * p * 22 - (dir > 0 ? 22 : 0)}%, 0, 0)`; });
    });
    $$("[data-drift]").forEach((el) => {
      const amt = parseFloat(el.dataset.drift) || 60;
      Scroll.add(el.parentElement, (p) => { el.style.transform = `translate3d(0, ${(p - 0.5) * amt}px, 0) rotate(${(p - 0.5) * 20}deg)`; });
    });
    // Desplazamiento vertical suave, sin rotación (apto para el isotipo)
    $$("[data-float]").forEach((el) => {
      const amt = parseFloat(el.dataset.float) || 50;
      Scroll.add(el.parentElement, (p) => { el.style.transform = `translate3d(0, ${(p * amt).toFixed(1)}px, 0)`; }, "top");
    });
  }

  /* =======================================================
     7. Rastro eléctrico (sólo zonas negras, puntero fino)
     ======================================================= */
  function initTrails() {
    if (!fine()) return;
    $$("[data-trail]").forEach((zone) => {
      const canvas = document.createElement("canvas");
      canvas.className = "trail-canvas"; canvas.setAttribute("aria-hidden", "true");
      zone.prepend(canvas);
      const ctx = canvas.getContext("2d");
      const MAX_PTS = 44, LIFE = 460, MAX_BRANCH = 5, BRANCH_LIFE = 300;
      let pts = [], branches = [], dpr = 1, w = 0, h = 0, raf = 0, active = false, inView = false, last = null;

      const size = () => {
        dpr = Math.min(2, devicePixelRatio || 1);
        w = zone.clientWidth; h = zone.clientHeight;
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      };
      size();
      const ro = new ResizeObserver(size); ro.observe(zone);
      const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (!inView) { pts = []; branches = []; ctx.clearRect(0, 0, canvas.width, canvas.height); } });
      io.observe(zone);

      const draw = () => {
        const now = performance.now();
        pts = pts.filter((p) => now - p.t < LIFE);
        branches = branches.filter((b) => now - b.t < BRANCH_LIFE);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.shadowColor = "rgba(70,105,255,.9)"; ctx.shadowBlur = 7 * dpr;
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1], b = pts[i];
          const life = 1 - (now - b.t) / LIFE;
          const alpha = life * life * b.k;
          ctx.strokeStyle = `rgba(110,140,255,${alpha.toFixed(3)})`;
          ctx.lineWidth = (0.8 + 1.1 * life * b.k) * dpr;
          ctx.beginPath(); ctx.moveTo(a.x * dpr, a.y * dpr); ctx.lineTo(b.x * dpr, b.y * dpr); ctx.stroke();
        }
        for (const br of branches) {
          const life = 1 - (now - br.t) / BRANCH_LIFE;
          ctx.strokeStyle = `rgba(140,165,255,${(life * 0.7).toFixed(3)})`;
          ctx.lineWidth = 0.8 * dpr;
          ctx.beginPath(); ctx.moveTo(br.p[0][0] * dpr, br.p[0][1] * dpr);
          for (let i = 1; i < br.p.length; i++) ctx.lineTo(br.p[i][0] * dpr, br.p[i][1] * dpr);
          ctx.stroke();
        }
        if (pts.length || branches.length) raf = requestAnimationFrame(draw);
        else { active = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
      };

      on(zone, "pointermove", (e) => {
        if (!inView || e.pointerType !== "mouse" || reduce()) return;
        const r = zone.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top, t = performance.now();
        if (last) {
          const dx = x - last.x, dy = y - last.y, dist = Math.hypot(dx, dy);
          const speed = dist / Math.max(1, t - last.t); // px/ms
          if (dist < 2) return;
          const k = clamp(0.25 + speed * 0.35, 0.25, 0.9);         // intensidad moderada
          const j = Math.min(6, speed * 3);                          // quiebre eléctrico
          const nx = -dy / dist, ny = dx / dist, off = (Math.random() - 0.5) * j;
          pts.push({ x: x + nx * off, y: y + ny * off, t, k });
          if (speed > 1.1 && Math.random() < 0.07 && branches.length < MAX_BRANCH) {
            const ang = Math.atan2(dy, dx) + (Math.random() < 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.7);
            const seg = []; let bx = x, by = y; seg.push([bx, by]);
            const n = 3 + ((Math.random() * 3) | 0);
            for (let i = 0; i < n; i++) {
              const l = 6 + Math.random() * 12, wob = (Math.random() - 0.5) * 0.9;
              bx += Math.cos(ang + wob) * l; by += Math.sin(ang + wob) * l; seg.push([bx, by]);
            }
            branches.push({ p: seg, t });
          }
        } else pts.push({ x, y, t, k: 0.3 });
        last = { x, y, t };
        if (pts.length > MAX_PTS) pts.splice(0, pts.length - MAX_PTS);
        if (!active) { active = true; raf = requestAnimationFrame(draw); }
      }, { passive: true });
      on(zone, "pointerleave", () => { last = null; });
      cleanups.push(() => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); canvas.remove(); });
    });
  }

  /* =======================================================
     8. Filas de servicios: relleno direccional y preview
     ======================================================= */
  function initServiceRows() {
    $$(".svc-row__link").forEach((link) => {
      const prev = $(".svc-row__preview", link);
      on(link, "pointerenter", (e) => {
        const r = link.getBoundingClientRect();
        link.dataset.from = e.clientY - r.top < r.height / 2 ? "top" : "bottom";
      });
      on(link, "pointerleave", (e) => {
        const r = link.getBoundingClientRect();
        link.dataset.from = e.clientY - r.top < r.height / 2 ? "top" : "bottom";
      });
      on(link, "focus", () => { if (!link.matches(":hover")) link.dataset.from = "left"; });
      if (prev) {
        // El preview acompaña al puntero en horizontal, sin quedar fijo sobre el texto
        let raf = 0;
        let lastX = null, rot = -2;
        const place = (e) => {
          const r = link.getBoundingClientRect();
          const w = prev.offsetWidth;
          let x = e.clientX - r.left + 28;
          if (x + w + 24 > r.width) x = e.clientX - r.left - w - 28;   // cerca del borde: a la izquierda del cursor
          prev.style.setProperty("--px", `${Math.max(0, x).toFixed(0)}px`);
          // se inclina levemente según la velocidad del puntero
          if (lastX !== null) rot = clamp(lerp(rot, (e.clientX - lastX) * 0.35 - 2, 0.25), -9, 7);
          lastX = e.clientX;
          prev.style.setProperty("--rot", `${rot.toFixed(2)}deg`);
        };
        on(link, "pointerleave", () => { lastX = null; rot = -2; });
        on(link, "pointerenter", place);
        on(link, "pointermove", (e) => {
          if (!fine()) return;
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => place(e));
        }, { passive: true });
        on(link, "focus", () => { if (!link.matches(":hover")) prev.style.setProperty("--px", `${link.clientWidth * 0.42}px`); });
      }
    });
  }

  /* =======================================================
     9. Nosotros: proceso con columna sticky
     ======================================================= */
  function initProcess() {
    const flow = $(".flow");
    if (!flow) return;
    const track = $(".flow__track", flow), sticky = $(".flow__sticky", flow), panelsWrap = $(".flow__panels", flow);
    const panels = $$(".flow__panel", flow), tabs = $$(".flow__tab", flow), nodes = $$(".dial__node", flow);
    const numEl = $("[data-dial-num]", flow), nameEl = $("[data-dial-name]", flow), dial = $(".dial", flow);
    const n = panels.length;
    let idx = -1;
    const setActive = (i, fromUser = false) => {
      if (i === idx) return;
      idx = i;
      panels.forEach((p, k) => { p.classList.toggle("is-active", k === i); p.classList.toggle("is-up", k < i); });
      tabs.forEach((t, k) => { t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      nodes.forEach((nd, k) => { nd.classList.toggle("is-active", k === i); nd.classList.toggle("is-done", k < i); });
      if (numEl) numEl.textContent = String(i + 1).padStart(2, "0");
      if (nameEl) nameEl.textContent = $(".flow__tab-name", tabs[i]).textContent;
    };
    const setBars = (fn) => tabs.forEach((t, k) => t.style.setProperty("--f", fn(k).toFixed(3)));
    setActive(0);
    const pinned = () => mqDesktop.matches && !reduce();
    const isCarousel = () => !mqDesktop.matches;

    // Desktop: progreso del scroll a lo largo del tramo fijo
    const scrollable = () => track.offsetHeight - sticky.offsetHeight;
    const progress = () => clamp(-track.getBoundingClientRect().top / Math.max(1, scrollable()));
    const updatePinned = () => {
      if (!flow.classList.contains("is-pinned")) return;
      const p = progress();
      setActive(Math.min(n - 1, Math.floor(p * n * 0.999)));
      if (dial) dial.style.setProperty("--pp", (p * 100).toFixed(2));
      setBars((k) => clamp(p * n - k));
    };
    const applyMode = () => {
      flow.classList.toggle("is-pinned", pinned());
      if (!pinned()) { if (dial) dial.style.setProperty("--pp", 100); setBars((k) => (k <= idx ? 1 : 0)); }
      updatePinned();
    };
    applyMode();
    on(mqDesktop, "change", applyMode);
    Scroll.add(track, updatePinned, "through", true);

    // Pestañas: clic y teclado (flechas, Inicio, Fin)
    const goTo = (i) => {
      if (flow.classList.contains("is-pinned")) {
        const top = track.getBoundingClientRect().top + scrollY + ((i + 0.5) / n) * scrollable();
        scrollTo({ top, behavior: reduce() ? "auto" : "smooth" });
      } else if (isCarousel()) {
        panelsWrap.scrollTo({ left: panels[i].offsetLeft - panelsWrap.offsetLeft - parseFloat(getComputedStyle(panelsWrap).paddingLeft), behavior: reduce() ? "auto" : "smooth" });
        setActive(i); setBars((k) => (k <= i ? 1 : 0));
      } else {
        panels[i].scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "center" });
        setActive(i);
      }
    };
    tabs.forEach((t, i) => {
      on(t, "click", () => goTo(i));
      on(t, "keydown", (e) => {
        const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: n - 1 };
        if (!(e.key in map)) return;
        e.preventDefault();
        const k = (map[e.key] + n) % n;
        tabs[k].focus(); goTo(k);
      });
    });

    // Móvil: el carrusel actualiza la pestaña activa
    const io = new IntersectionObserver((entries) => {
      if (!isCarousel()) return;
      entries.forEach((e) => { if (e.isIntersecting) { const i = panels.indexOf(e.target); setActive(i); setBars((k) => (k <= i ? 1 : 0)); } });
    }, { root: panelsWrap, threshold: 0.6 });
    panels.forEach((p) => io.observe(p));
    cleanups.push(() => io.disconnect());
  }

  /* Manifiesto: la frase se enciende palabra por palabra con el scroll */
  function initWords() {
    $$("[data-words]").forEach((el) => {
      const ws = $$(".mw", el);
      if (reduce()) { ws.forEach((w) => w.style.setProperty("--o", 1)); return; }
      Scroll.add(el, (p) => {
        const lit = clamp((p - 0.12) / 0.5) * ws.length;
        ws.forEach((w, i) => w.style.setProperty("--o", (0.22 + 0.78 * clamp(lit - i)).toFixed(3)));
      }, "center");
    });
  }

  /* =======================================================
     10. Demos explicativas por servicio
     ======================================================= */
  function initWebs() {
    const stage = $(".webs-stage");
    if (!stage || reduce()) return;
    const layers = $$(".webs-layer", stage);
    let mx = 0, my = 0, sp = 0;
    const apply = () => layers.forEach((l) => {
      const d = parseFloat(l.dataset.depth) || 1;
      const amp = mqDesktop.matches ? 1 : 0.4;
      l.style.transform = `translate3d(${mx * d * 14}px, ${(sp - 0.5) * -d * 70 * amp + my * d * 10}px, 0) rotateY(${mx * d * 3}deg)`;
    });
    Scroll.add(stage, (p) => { sp = p; apply(); });
    on(stage.closest("section") || stage, "pointermove", (e) => {
      if (!fine()) return;
      const r = stage.getBoundingClientRect();
      mx = clamp((e.clientX - r.left) / r.width, 0, 1) - 0.5;
      my = clamp((e.clientY - r.top) / r.height, 0, 1) - 0.5;
      apply();
    }, { passive: true });
  }

  function initAutomation() {
    const el = $(".auto");
    if (!el) return;
    const track = $(".auto__track", el), task = $(".auto__task", el), stages = $$(".auto__stage", el);
    const label = $(".auto__task-label", el), dot = $(".auto__task-dot", el);
    const names = stages.map((s) => s.dataset.label);
    const measureTravel = () => {
      if (mqDesktop.matches || innerWidth > 820) {
        const col = stages[stages.length - 1];
        el.style.setProperty("--travel", `${col.offsetLeft}px`);
      } else {
        const lastStage = stages[stages.length - 1];
        el.style.setProperty("--travel", `${lastStage.offsetTop}px`);
      }
    };
    const render = (p) => {
      el.style.setProperty("--p", p.toFixed(4));
      const idx = Math.min(stages.length - 1, Math.floor(p * (stages.length - 1) + 0.04));
      stages.forEach((s, i) => s.classList.toggle("is-done", i <= idx));
      if (label) label.textContent = names[idx];
      if (dot) dot.textContent = String(idx + 1).padStart(2, "0");
    };
    measureTravel();
    on(window, "resize", measureTravel);
    if (reduce()) { render(1); return; }
    Scroll.add(track, (p) => render(clamp((p - 0.12) / 0.62)), "center");
  }

  function initIntegration() {
    const el = $(".integ");
    if (!el) return;
    const paths = $$(".integ__path", el), nodes = $$(".integ__node", el);
    const caption = $(".integ__caption", el), flow = $$(".integ__flow li", el);
    const signal = $(".integ__signal", el);
    const route = (el.dataset.route || "").split(",").map((s) => s.trim()).filter(Boolean); // ids de path en orden
    const hot = (ids) => {
      paths.forEach((p) => p.classList.toggle("is-hot", ids.includes(p.id)));
    };
    const nodeHot = (keys) => nodes.forEach((n) => n.classList.toggle("is-hot", keys.includes(n.dataset.node)));
    const setStep = (i) => {
      const pid = route[i]; const p = $("#" + pid, el);
      hot([pid]); nodeHot([p.dataset.from, p.dataset.to]);
      flow.forEach((li, k) => li.classList.toggle("is-active", k === i));
    };
    // Hover / foco en un nodo: muestra sus conexiones
    nodes.forEach((n) => {
      const show = () => {
        paused = true;
        const ids = paths.filter((p) => p.dataset.from === n.dataset.node || p.dataset.to === n.dataset.node).map((p) => p.id);
        hot(ids); nodeHot([n.dataset.node]);
        if (caption) caption.textContent = n.dataset.desc || "";
      };
      const hide = () => { paused = false; setStep(step); if (caption) caption.textContent = caption.dataset.default || ""; };
      on(n, "pointerenter", show); on(n, "focus", show);
      on(n, "pointerleave", hide); on(n, "blur", hide);
    });
    let step = 0, t0 = 0, raf = 0, paused = false, inView = false;
    setStep(0);
    if (reduce() || !signal) { if (signal) signal.style.display = "none"; return; }
    const STEP_MS = 1900;
    const loop = (now) => {
      if (!inView) return;
      if (!t0) t0 = now;
      if (!paused) {
        const k = (now - t0) / STEP_MS;
        if (k >= 1) { step = (step + 1) % route.length; t0 = now; setStep(step); }
        const p = $("#" + route[step], el);
        const len = p.getTotalLength();
        const pt = p.getPointAtLength(len * ease(clamp(k)));
        signal.setAttribute("cx", pt.x); signal.setAttribute("cy", pt.y);
        signal.style.opacity = k > 0.92 ? String(1 - (k - 0.92) / 0.08) : "1";
      } else t0 = now - 0;
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (inView) { t0 = 0; raf = requestAnimationFrame(loop); }
    }, { threshold: 0.2 });
    io.observe(el);
    cleanups.push(() => { io.disconnect(); cancelAnimationFrame(raf); });
  }

  function initIdentity() {
    const el = $(".ident");
    if (!el) return;
    if (reduce()) { el.style.setProperty("--p", "1"); return; }
    Scroll.add($(".ident__board", el), (p) => el.style.setProperty("--p", ease(clamp((p - 0.08) / 0.5)).toFixed(4)), "center");
  }

  /* =======================================================
     11. Formulario de contacto
     ======================================================= */
  function initForm() {
    const form = $("#contact-form");
    if (!form) return;
    const okBox = $("#form-ok"), errBox = $("#form-error"), errText = $("#form-error-text");
    const btn = $("button[type=submit]", form);
    const params = new URLSearchParams(location.search);
    const pre = params.get("servicio");
    if (pre && form.servicio) {
      const opt = Array.from(form.servicio.options).find((o) => o.value === pre);
      if (opt) form.servicio.value = pre;
    }
    const rules = {
      nombre: (v) => (v.trim().length >= 2 ? "" : "Contanos tu nombre."),
      contacto: (v) => {
        const s = v.trim();
        if (!s) return "Dejanos un email o un teléfono.";
        const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
        const phone = /^[+()\d\s-]{7,}$/.test(s) && s.replace(/\D/g, "").length >= 7;
        return email || phone ? "" : "Revisá el formato: puede ser un email o un teléfono.";
      },
      servicio: (v) => (v ? "" : "Elegí una opción (podés indicar que todavía no sabés)."),
      mensaje: (v) => (v.trim().length >= 10 ? "" : "Escribí al menos una línea sobre lo que necesitás."),
    };
    const check = (name) => {
      const input = form.elements[name];
      const field = input.closest(".field");
      const msg = rules[name](input.value);
      field.classList.toggle("is-invalid", !!msg);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      $(".field__error", field).textContent = msg;
      return !msg;
    };
    Object.keys(rules).forEach((name) => {
      const input = form.elements[name];
      on(input, "blur", () => { if (input.value) check(name); });
      on(input, "input", () => { if (input.closest(".field").classList.contains("is-invalid")) check(name); });
    });
    const show = (box) => { [okBox, errBox].forEach((b) => b.classList.remove("is-visible")); if (box) { box.classList.add("is-visible"); box.focus(); } };

    on(form, "submit", async (e) => {
      e.preventDefault();
      show(null);
      const results = Object.keys(rules).map(check);
      if (results.includes(false)) {
        const first = $(".field.is-invalid input, .field.is-invalid select, .field.is-invalid textarea", form);
        first?.focus();
        return;
      }
      btn.setAttribute("aria-busy", "true"); btn.disabled = true;
      $(".btn__label", btn).textContent = "Enviando…";
      const fd = Object.fromEntries(new FormData(form).entries());
      const servicioTxt = form.servicio.options[form.servicio.selectedIndex]?.text || fd.servicio;
      const payload = {
        Nombre: fd.nombre, Contacto: fd.contacto, Servicio: servicioTxt, Mensaje: fd.mensaje,
        _subject: `Nueva consulta web — ${servicioTxt} — ${fd.nombre}`,
        _template: "table", _captcha: "false", _honey: fd._honey || "",
      };
      if (/@/.test(fd.contacto)) payload._replyto = fd.contacto;
      const endpoint = form.dataset.endpoint;
      try {
        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 15000);
        const res = await fetch(endpoint, {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload), signal: ctrl.signal,
        });
        clearTimeout(to);
        let body = {};
        try { body = await res.json(); } catch (err) {}
        // Solo se muestra éxito si el servicio confirma el envío
        if (res.ok && String(body.success) === "true") {
          form.reset(); form.hidden = true; show(okBox);
        } else if (/activ/i.test(body.message || "")) {
          errText.textContent = "El formulario todavía está pendiente de activación, así que tu mensaje no se envió. Mientras tanto, escribinos directamente por email o Instagram.";
          show(errBox);
        } else {
          errText.textContent = "No pudimos enviar tu mensaje. Intentá de nuevo en unos minutos o escribinos directamente por email.";
          show(errBox);
        }
      } catch (err) {
        errText.textContent = "No pudimos enviar tu mensaje. Revisá tu conexión e intentá de nuevo, o escribinos directamente por email.";
        show(errBox);
      } finally {
        btn.removeAttribute("aria-busy"); btn.disabled = false;
        $(".btn__label", btn).textContent = "Enviar mensaje";
      }
    });
    const retry = $("#form-retry");
    if (retry) on(retry, "click", () => { show(null); btn.focus(); });
  }

  /* =======================================================
     12. Prefetch al pasar el puntero (navegación más ágil)
     ======================================================= */
  function initPrefetch() {
    const done = new Set();
    on(document, "pointerover", (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || done.has(url.pathname)) return;
      done.add(url.pathname);
      const l = document.createElement("link"); l.rel = "prefetch"; l.href = url.pathname; document.head.appendChild(l);
    }, { passive: true });
  }

  /* ======================================================= */
  function boot() {
    try {
      initTransitions();
      initHeader();
      initReveals();
      initHero();
      initLiveShapes();
      initProjects();
      initParallax();
      initTrails();
      initServiceRows();
      initProcess();
      initWords();
      initWebs();
      initAutomation();
      initIntegration();
      initIdentity();
      initForm();
      initPrefetch();
      const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
    } catch (err) {
      // Si algo falla, el contenido queda visible
      console.error(err);
      root.classList.remove("js");
    }
    window.KROMA_READY = true;
    // Si el usuario cambia la preferencia de movimiento, se recarga el estado
    on(mqReduce, "change", () => location.reload());
    on(window, "pagehide", (e) => { if (!e.persisted) teardown(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
