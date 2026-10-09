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

  function initHero() {
    const hero = $(".hero");
    if (!hero || !hero.dataset.shape) return;
    const base = JSON.parse(hero.dataset.shape);
    const clip = $("#hero-clip-path"), ivoryPath = $("#hero-ivory-path");
    const photo = $(".hero__photo"), mark = $(".hero__mark"), follow = $(".hero__mark-follow");
    if (reduce()) return;
    const TOP = base.photo[base.photo.length - 1][1];

    let scrollK = 0, t0 = performance.now(), raf = 0, inView = true, last = 0;
    // Cada punto respira con su propia fase; los extremos (bordes del hero) quedan fijos.
    const wobble = (pts, amp, speed, seed, keepFirst, keepLast) => pts.map((p, i) => {
      if ((keepFirst && i === 0) || (keepLast && i === pts.length - 1)) return p;
      const ph = seed + i * 1.7, w = (now) => Math.sin(now * speed + ph);
      return [p[0] + amp * w(tNow) , p[1] + amp * 0.6 * Math.cos(tNow * speed * 0.8 + ph)];
    });
    let tNow = 0;
    const render = () => {
      const k = scrollK;
      // Scroll: la foto se abre un poco hacia la izquierda y el lóbulo baja
      const ivory = wobble(base.ivory.map(([x, y]) => [x - 0.03 * k, y + 0.02 * k]), 0.006, 0.55, 0.0, false, true);
      const photoPts = wobble(base.photo.map(([x, y], i) => [x - 0.035 * k * (1 - i / base.photo.length), y]), 0.007, 0.5, 2.1, true, true);
      const lobe = wobble(base.lobe.map(([x, y]) => [x, y + 0.03 * k]), 0.006, 0.45, 4.2, true, true);
      // los tramos comparten extremos: el lóbulo termina donde empieza el borde de la foto
      photoPts[0] = lobe[lobe.length - 1];
      const top = photoPts[photoPts.length - 1];
      if (ivoryPath) ivoryPath.setAttribute("d", `M${ivory[0][0]} ${ivory[0][1]}${spline(ivory)}L1 ${TOP}L1 ${lobe[0][1]}${spline(lobe)}L.5 1L0 1Z`);
      if (clip) clip.setAttribute("d", `M${top[0]} ${top[1]}L1 ${TOP}L1 ${lobe[0][1]}${spline(lobe)}${spline(photoPts)}Z`);
    };
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return;          // ~30 fps alcanzan para un movimiento lento
      last = now; tNow = (now - t0) / 1000;
      render();
    };
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting; cancelAnimationFrame(raf);
      if (inView) raf = requestAnimationFrame(loop);
    });
    io.observe(hero);
    on(document, "visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden && inView) raf = requestAnimationFrame(loop); });
    cleanups.push(() => { cancelAnimationFrame(raf); io.disconnect(); });

    Scroll.add(hero, (p) => {
      scrollK = ease(clamp(p * 1.5));
      const amp = mqDesktop.matches ? 1 : 0.4;
      if (photo) photo.parentElement.style.transform = `translate3d(0, ${(p * 70 * amp).toFixed(1)}px, 0)`;
      if (mark) mark.style.translate = `0 ${(-p * 80 * amp).toFixed(1)}px`;
    }, "top");

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
        const place = (e) => {
          const r = link.getBoundingClientRect();
          const w = prev.offsetWidth;
          let x = e.clientX - r.left;
          if (x + w + 40 > r.width) x = x - w - 56;   // cerca del borde: va a la izquierda del cursor
          prev.style.setProperty("--px", `${Math.max(0, x).toFixed(0)}px`);
        };
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
    const wrap = $(".process");
    if (!wrap) return;
    const steps = $$(".process__step", wrap), nums = $$(".process__bignum span", wrap), bar = $(".process__bar", wrap);
    const set = (idx) => {
      steps.forEach((s, i) => s.classList.toggle("is-active", i === idx));
      nums.forEach((n, i) => { n.classList.toggle("is-active", i === idx); n.classList.toggle("is-past", i < idx); });
      if (bar) bar.style.setProperty("--pp", ((idx + 1) / steps.length).toFixed(3));
    };
    set(0);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) set(steps.indexOf(e.target)); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach((s) => io.observe(s));
    cleanups.push(() => io.disconnect());
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
      initParallax();
      initTrails();
      initServiceRows();
      initProcess();
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
