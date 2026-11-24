/* =========================================================
   KROMA — interacciones y movimiento de todo el sitio
   GSAP + ScrollTrigger + SplitText coordinan el movimiento.
   Sin JS o con movimiento reducido, todo el contenido queda visible.
   ========================================================= */
(() => {
  "use strict";
  window.KROMA_READY = true;
  const root = document.documentElement;
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const G = window.gsap, ST = window.ScrollTrigger, SPLIT = window.SplitText;
  const MOTION = !RM && !!G && !!ST;
  if (MOTION) { G.registerPlugin(ST); if (SPLIT) G.registerPlugin(SPLIT); root.classList.add("motion"); }
  else root.classList.remove("anim");

  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* ---------- 1. Cabecera (opción A): transparente arriba, sólida al bajar ---------- */
  const hd = $("#hd");
  const tones = $$(".t-black, .t-ivory, .t-cobalt, .matter, .mani");
  const prog = $(".hd__prog i");
  let ticking = false;
  function headerUpdate() {
    ticking = false;
    // arriba de todo el texto toma el tono de la portada; al bajar la barra es sólida (negra)
    const probe = 34;
    let tone = "t-black";
    for (const el of tones) {
      const r = el.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) {
        if (el.classList.contains("t-ivory")) tone = "t-ivory";
        else if (el.classList.contains("t-cobalt")) tone = "t-cobalt";
        else tone = "t-black";
      }
    }
    hd.classList.toggle("is-light", tone === "t-ivory");
    hd.classList.toggle("is-solid", scrollY > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    if (prog) prog.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  }
  const reqHeader = () => { if (!ticking) { ticking = true; requestAnimationFrame(headerUpdate); } };
  addEventListener("scroll", reqHeader, { passive: true });
  addEventListener("resize", reqHeader);
  window.KROMA_HEADER = reqHeader;
  headerUpdate();

  const scrim = $(".scrim");
  const showScrim = (v) => {
    if (!scrim) return;
    if (v) { scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add("is-on")); }
    else { scrim.classList.remove("is-on"); setTimeout(() => { if (!scrim.classList.contains("is-on")) scrim.hidden = true; }, 350); }
  };

  /* Panel de Servicios (escritorio): clic, teclado y, con mouse, al pasar */
  const svc = $("#svc"), svcBtn = $(".hd__svc");
  let svcOpen = false, svcT;
  const setSvc = (v, focusBtn) => {
    if (!svc || v === svcOpen) return;
    svcOpen = v;
    svcBtn.setAttribute("aria-expanded", String(v));
    hd.classList.toggle("is-open", v);
    if (v) { svc.hidden = false; requestAnimationFrame(() => svc.classList.add("is-open")); }
    else { svc.classList.remove("is-open"); setTimeout(() => { if (!svcOpen) svc.hidden = true; }, 450); if (focusBtn) svcBtn.focus(); }
    showScrim(v);
  };
  if (svc && svcBtn) {
    let by = null; // "hover" o "click": el clic fija el panel abierto aunque el mouse se vaya
    svcBtn.addEventListener("click", () => {
      clearTimeout(svcT);
      if (!svcOpen || by === "hover") { by = "click"; setSvc(true); } else { by = null; setSvc(false); }
    });
    if (FINE) {
      const zone = [svcBtn, svc];
      zone.forEach((el) => el.addEventListener("pointerenter", () => { clearTimeout(svcT); if (!svcOpen) svcT = setTimeout(() => { by = "hover"; setSvc(true); }, 120); }));
      zone.forEach((el) => el.addEventListener("pointerleave", () => { clearTimeout(svcT); if (by === "hover") svcT = setTimeout(() => { by = null; setSvc(false); }, 240); }));
    }
    hd.addEventListener("keydown", (e) => { if (e.key === "Escape" && svcOpen) { by = null; setSvc(false, true); } });
    hd.addEventListener("focusout", (e) => { if (svcOpen && e.relatedTarget && !hd.contains(e.relatedTarget)) { by = null; setSvc(false); } });
    scrim && scrim.addEventListener("click", () => { by = null; setSvc(false); });
  }

  /* Menú del celular: sube desde abajo, con foco atrapado */
  const sheet = $("#sheet"), burger = $(".hd__burger"), sheetClose = $(".sheet__close");
  if (sheet && burger) {
    let sheetOpen = false;
    const focusables = () => $$("a, button", sheet);
    const open = (ev) => {
      const byKey = !ev || ev.detail === 0;
      sheetOpen = true;
      sheet.hidden = false;
      burger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      showScrim(true);
      requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add("is-open")));
      setTimeout(() => (byKey ? focusables()[1] : sheet).focus({ preventScroll: true }), RM ? 0 : 300);
    };
    const close = () => {
      if (!sheetOpen) return;
      sheetOpen = false;
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      sheet.classList.remove("is-open");
      showScrim(false);
      setTimeout(() => { if (!sheetOpen) sheet.hidden = true; }, RM ? 0 : 500);
      burger.focus({ preventScroll: true });
    };
    burger.addEventListener("click", open);
    sheetClose.addEventListener("click", close);
    scrim && scrim.addEventListener("click", close);
    $$("a", sheet).forEach((l) => l.addEventListener("click", () => { if (l.href && new URL(l.href).pathname === location.pathname) close(); }));
    sheet.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const f = focusables(), i = f.indexOf(document.activeElement);
        if (i === -1) { e.preventDefault(); (e.shiftKey ? f[f.length - 1] : f[0]).focus(); }
        else if (e.shiftKey && i === 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    // si se agranda la ventana con el menú abierto, se cierra
    matchMedia("(min-width: 921px)").addEventListener("change", (m) => { if (m.matches) close(); });
  }

  /* ---------- 2. Transición entre páginas: cortina curva cobalto (la de la versión publicada) ---------- */
  const DUR = 400;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // nueva pestaña, etc.
    if (a.target && a.target !== "_self") return;
    if (a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // anclas
    if (RM) return;
    e.preventDefault();
    try { sessionStorage.setItem("kroma-transition", "1"); } catch (err) {}
    root.classList.add("is-leaving");
    setTimeout(() => location.assign(url.href), DUR);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) root.classList.remove("is-leaving", "is-entering"); });
  if (root.classList.contains("is-entering")) setTimeout(() => root.classList.remove("is-entering"), 700);

  /* ---------- 3. Contacto, FAQ, filtros y demos (funcionan con o sin movimiento) ---------- */
  initForm();
  initFaq();
  initFilter();
  initChoose();
  initIntegration();

  if (!MOTION) {
    $$(".auto").forEach((el) => renderAuto(el, 1));
    return;
  }

  // En el inicio la cabecera aparece junto con la escena
  if (document.body.classList.contains("is-home")) {
    // si la escena del inicio no llega a cargar, todo aparece igual
    setTimeout(() => { if (!window.KROMA_HOME_READY) { G.to(".hero__t, .hero__sub, .hero__cta, .hero__cue, .hd__nav, .hd__cta, .hd__burger, .stage__poster", { autoAlpha: 1, duration: 0.6 }); G.to(".hd__brand", { clipPath: "inset(0 0% 0 0)", duration: 0.6 }); } }, 2500);
  }

  /* ---------- 4. Revelados ---------- */
  // Tokens de movimiento: entradas lentas y decididas, respuestas rápidas
  const T = { enter: 0.9, clip: 1.1, stagger: 0.08, ease: "expo.out" };
  const enter = { start: "top 82%", once: true };
  // Las divisiones por línea esperan a la tipografía (si tarda, siguen igual a los 1,2 s)
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]) : Promise.resolve();
  fontsReady.then(() => {
  // Titulares por líneas, con máscara (una vez al entrar)
    $$("[data-split]").forEach((el) => {
      const inHero = !!el.closest(".ph");
      let split;
      try { split = SPLIT ? SPLIT.create(el, { type: "lines", mask: "lines", linesClass: "split-line" }) : null; } catch (err) { split = null; }
      G.set(el, { visibility: "visible" });
      if (!split) return;
      const inv = el.classList.contains("close__t");
      G.from(split.lines, inv
        ? { yPercent: 130, duration: 1, stagger: 0.09, ease: "expo.out", scrollTrigger: { trigger: el.closest("section"), start: "top 70%", once: true } }
        : { yPercent: 130, duration: T.enter, stagger: T.stagger, ease: T.ease, delay: inHero ? 0.15 : 0, scrollTrigger: inHero ? undefined : { trigger: el, ...enter } });
    });
    // Texto grande de "Qué resuelve": líneas que suben desde una máscara al entrar
    $$("[data-split-lines]").forEach((el) => {
      let split;
      try { split = SPLIT.create(el, { type: "lines", mask: "lines", linesClass: "split-line", aria: "none" }); } catch (err) { return; }
      G.from(split.lines, { yPercent: 110, duration: T.enter, stagger: T.stagger, ease: T.ease, scrollTrigger: { trigger: el, ...enter } });
    });
    ST.refresh();
  });
  // Bloques que suben (cabeceras de página, laterales)
  $$("[data-rise]").forEach((el) => {
    const inHero = !!el.closest(".ph");
    G.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: T.enter, ease: T.ease, delay: inHero ? 0.45 : 0, scrollTrigger: inHero ? undefined : { trigger: el, ...enter } });
  });
  // Capas del proceso: la línea superior se dibuja y el contenido se apila
  $$(".layers").forEach((el) => {
    const items = $$(".layer", el);
    G.set(items, { "--draw": 0 });
    G.to(items, { "--draw": 1, duration: 1.1, stagger: 0.14, ease: "expo.inOut", scrollTrigger: { trigger: el, ...enter } });
    G.from(items.map((i) => i.children), { opacity: 0, y: 18, duration: 0.8, stagger: 0.05, ease: "expo.out", delay: 0.2, scrollTrigger: { trigger: el, ...enter } });
  });
  // Capacidades (inicio) y filas de servicios: como el prototipo
  G.from(".cap .shead > *", { y: 30, opacity: 0, duration: 0.9, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: ".cap", start: "top 75%", once: true } });
  $$(".rows").forEach((el) => G.from($$(".row", el), { clipPath: "inset(0 0 100% 0)", y: 20, duration: 0.9, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 80%", once: true } }));
  // Tarjetas de proyecto: recorte que se abre
  $$(".pc__media, .pl__media").forEach((el) => {
    G.from(el, { clipPath: "inset(12% 8% 12% 8% round 6px)", duration: T.clip, ease: T.ease, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  });

  /* ---------- Loops de los heros: solo se reproducen visibles y con movimiento permitido ---------- */
  const vids = $$(".ph__vid");
  if (vids.length && !RM && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause(); }), { threshold: 0.15 });
    vids.forEach((v) => io.observe(v));
    document.addEventListener("visibilitychange", () => vids.forEach((v) => (document.hidden ? v.pause() : v.getBoundingClientRect().bottom > 0 && v.play().catch(() => {}))));
  }

  /* ---------- 5. Parallax de baja amplitud ---------- */
  $$("[data-float]").forEach((el) => {
    const r = el.classList.contains("ph__art--mg") ? 0 : 2;
    G.fromTo(el, { yPercent: -4, rotate: -r }, { yPercent: 8, rotate: r, ease: "none", scrollTrigger: { trigger: el.closest("section"), start: "top top", end: "bottom top", scrub: 0.6 } });
    G.from(el, { opacity: 0, scale: 0.92, duration: 1.4, ease: "expo.out", delay: 0.2 });
  });
  $$(".pc__para, .pl__media .pc__para, [data-para]").forEach((el) => {
    G.fromTo(el, { yPercent: -3 }, { yPercent: 3, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
  });
  $$(".ph__glow, .close__glow").forEach((el) => {
    G.fromTo(el, { xPercent: -6, yPercent: 8 }, { xPercent: 4, yPercent: -6, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- 6. Filas: relleno direccional + vista previa de la forma ---------- */
  const pv = $(".row-pv");
  $$(".row").forEach((row) => {
    row.addEventListener("pointerenter", (e) => {
      const r = row.getBoundingClientRect();
      row.style.setProperty("--o", e.clientX - r.left < r.width / 2 ? "left" : "right");
      if (pv && FINE) { $$(".pv-w", pv).forEach((w) => w.classList.toggle("is-on", w.dataset.k === row.dataset.pv)); pv.classList.add("on"); }
    });
    row.addEventListener("pointerleave", () => pv && pv.classList.remove("on"));
  });
  if (pv && FINE) {
    const qx = G.quickTo(pv, "x", { duration: 0.5, ease: "power3.out" }), qy = G.quickTo(pv, "y", { duration: 0.5, ease: "power3.out" });
    addEventListener("pointermove", (e) => { qx(e.clientX + 170); qy(e.clientY); }, { passive: true });
  }

  /* ---------- 7. Nosotros: banda que avanza y proceso con columna fija ---------- */
  const sweep = $(".sweep__c");
  if (sweep) G.fromTo(sweep, { scaleX: 0.35 }, { scaleX: 1.25, ease: "none", scrollTrigger: { trigger: ".sweep", start: "top bottom", end: "bottom top", scrub: 0.6 } });
  const flowItems = $$(".flow__it");
  if (flowItems.length) {
    const num = $("[data-flow-num]"), name = $("[data-flow-name]"), bar = $("[data-flow-bar]");
    const setStep = (i) => {
      flowItems.forEach((it, k) => it.classList.toggle("is-on", k === i));
      if (num) num.textContent = String(i + 1).padStart(2, "0");
      if (name) name.textContent = $("h3", flowItems[i]).textContent.replace(/\.$/, "");
      if (bar) bar.style.transform = `scaleX(${(i + 1) / flowItems.length})`;
    };
    flowItems.forEach((it, i) => ST.create({ trigger: it, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setStep(i) }));
  }

  /* ---------- 8. Demos que dependen del scroll ---------- */
  initWebs();
  $$(".auto").forEach((el) => {
    const track = $(".auto__track", el);
    const measure = () => {
      const st = $$(".auto__s", el), last = st[st.length - 1];
      el.style.setProperty("--travel", innerWidth > 920 ? `${last.offsetLeft}px` : `${last.offsetTop}px`);
    };
    measure(); addEventListener("resize", measure);
    ST.create({ trigger: track, start: "top 75%", end: "bottom 45%", scrub: 0.5, onUpdate: (s) => renderAuto(el, s.progress) });
  });
  const board = $(".ident__board");
  if (board) G.fromTo(board, { "--p": 0 }, { "--p": 1, ease: "power2.out", scrollTrigger: { trigger: board, start: "top 85%", end: "center 55%", scrub: 0.6 } });

  /* ---------- 9. Círculo que acompaña al cursor (el cursor del sistema sigue visible) ---------- */
  const ring = $("#ring");
  if (ring && FINE) {
    const rx = G.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" }), ry = G.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });
    addEventListener("pointermove", (e) => { ring.classList.add("on"); rx(e.clientX); ry(e.clientY); }, { passive: true });
    document.addEventListener("pointerleave", () => ring.classList.remove("on"));
    document.addEventListener("pointerover", (e) => ring.classList.toggle("big", !!e.target.closest("a, button, summary, [tabindex='0']")));
  }

  /* ---------- 10. Botones magnéticos (leves; nunca escapan del puntero) ---------- */
  if (FINE) $$(".hero__cta .btn, .close .btn").forEach((el) => {
    const qx = G.quickTo(el, "x", { duration: 0.4, ease: "power3.out" }), qy = G.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); qx(clamp((e.clientX - (r.left + r.width / 2)) * 0.12, -6, 6)); qy(clamp((e.clientY - (r.top + r.height / 2)) * 0.2, -5, 5)); });
    el.addEventListener("pointerleave", () => { qx(0); qy(0); });
  });

  document.fonts?.ready.then(() => ST.refresh());

  /* =======================================================
     Funciones
     ======================================================= */
  function renderAuto(el, p) {
    el.style.setProperty("--p", p.toFixed(4));
    const st = $$(".auto__s", el), idx = Math.min(st.length - 1, Math.floor(p * (st.length - 1) + 0.04));
    st.forEach((s, i) => s.classList.toggle("is-done", i <= idx));
    const lb = $(".auto__lb", el), dot = $(".auto__dot", el);
    if (lb) lb.textContent = st[idx].dataset.label;
    if (dot) dot.textContent = String(idx + 1).padStart(2, "0");
  }

  function initWebs() {
    const stage = $(".webs");
    if (!stage) return;
    const layers = $$(".wl", stage);
    let mx = 0, my = 0, sp = 0.5;
    const apply = () => layers.forEach((l) => {
      const d = parseFloat(l.dataset.depth) || 1;
      l.style.transform = `translate3d(${mx * d * 16}px, ${(sp - 0.5) * -d * 80 + my * d * 10}px, 0) rotateY(${mx * d * 3}deg)`;
    });
    ST.create({ trigger: stage, start: "top bottom", end: "bottom top", onUpdate: (s) => { sp = s.progress; apply(); } });
    if (FINE) stage.closest("section").addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      mx = clamp((e.clientX - r.left) / r.width) - 0.5; my = clamp((e.clientY - r.top) / r.height) - 0.5; apply();
    }, { passive: true });
    G.from(layers, { y: 80, opacity: 0, duration: 1.2, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: stage, start: "top 80%", once: true } });
  }

  function initChoose() {
    const el = $(".ch");
    if (!el) return;
    const btns = $$(".ch__btn", el), opts = $$(".ch__opt", el), why = $(".ch__why", el);
    // Recomendación ilustrativa: el criterio elegido pesa el doble
    const pick = (w) => {
      let best = null, top = -1;
      opts.forEach((o) => {
        const score = ["u", "c", "s"].reduce((a, k) => a + Number(o.dataset[k]) * (k === w ? 2 : 1), 0);
        if (score > top) { top = score; best = o; }
      });
      el.dataset.prio = w;
      btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.w === w)));
      opts.forEach((o) => o.classList.toggle("is-best", o === best));
      if (why && best) why.textContent = best.dataset.why;
      if (MOTION && best) G.fromTo(best, { scale: 0.985 }, { scale: 1, duration: 0.5, ease: "expo.out" });
    };
    btns.forEach((b) => b.addEventListener("click", () => pick(b.dataset.w)));
  }

  function initIntegration() {
    const el = $(".ig");
    if (!el) return;
    const paths = $$(".ig__path", el), nodes = $$(".ig__node", el);
    const caption = $(".ig__cap", el), flow = $$(".ig__flow li", el), signal = $(".ig__sig", el);
    const route = (el.dataset.route || "").split(",").filter(Boolean);
    const hot = (ids) => paths.forEach((p) => p.classList.toggle("is-hot", ids.includes(p.id)));
    const nodeHot = (keys) => nodes.forEach((n) => n.classList.toggle("is-hot", keys.includes(n.dataset.node)));
    let step = 0, t0 = 0, raf = 0, paused = false, inView = false;
    const setStep = (i) => {
      const p = $("#" + route[i], el);
      hot([route[i]]); nodeHot([p.dataset.from, p.dataset.to]);
      flow.forEach((li, k) => li.classList.toggle("is-active", k === i));
    };
    nodes.forEach((n) => {
      const show = () => {
        paused = true;
        hot(paths.filter((p) => p.dataset.from === n.dataset.node || p.dataset.to === n.dataset.node).map((p) => p.id));
        nodeHot([n.dataset.node]);
        if (caption) caption.textContent = n.dataset.desc || "";
      };
      const hide = () => { paused = false; setStep(step); if (caption) caption.textContent = caption.dataset.default || ""; };
      n.addEventListener("pointerenter", show); n.addEventListener("focus", show);
      n.addEventListener("pointerleave", hide); n.addEventListener("blur", hide);
    });
    setStep(0);
    if (RM || !signal) { if (signal) signal.style.display = "none"; return; }
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const STEP_MS = 1900;
    const loop = (now) => {
      if (!inView) return;
      if (!t0) t0 = now;
      if (!paused) {
        const k = (now - t0) / STEP_MS;
        if (k >= 1) { step = (step + 1) % route.length; t0 = now; setStep(step); }
        const p = $("#" + route[step], el), len = p.getTotalLength(), pt = p.getPointAtLength(len * ease(clamp(k)));
        signal.setAttribute("cx", pt.x); signal.setAttribute("cy", pt.y);
        signal.style.opacity = k > 0.92 ? String(1 - (k - 0.92) / 0.08) : "1";
      } else t0 = now;
      raf = requestAnimationFrame(loop);
    };
    new IntersectionObserver(([e]) => {
      inView = e.isIntersecting; cancelAnimationFrame(raf);
      if (inView) { t0 = 0; raf = requestAnimationFrame(loop); }
    }, { threshold: 0.2 }).observe(el);
  }

  function initFaq() {
    $$(".faq details").forEach((d) => {
      const sum = $("summary", d), body = $(".faq__a", d);
      sum.addEventListener("click", (e) => {
        if (RM || !window.gsap) return;
        e.preventDefault();
        if (d.open) {
          G.to(body, { height: 0, duration: 0.4, ease: "power3.inOut", onComplete: () => { d.open = false; body.style.height = ""; } });
        } else {
          d.open = true;
          G.fromTo(body, { height: 0 }, { height: body.scrollHeight, duration: 0.5, ease: "expo.out", onComplete: () => (body.style.height = "") });
        }
      });
    });
  }

  function initFilter() {
    const chips = $$(".pf__c");
    if (!chips.length) return;
    const items = $$(".pl"), count = $("[data-count]"), empty = $(".pf__empty");
    chips.forEach((c) => c.addEventListener("click", () => {
      const f = c.dataset.filter;
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      let n = 0;
      items.forEach((it) => { const show = f === "all" || it.dataset.service === f; it.hidden = !show; if (show) n++; });
      if (count) count.textContent = String(n).padStart(2, "0");
      if (empty) empty.hidden = n > 0;
      if (MOTION) { G.fromTo(items.filter((i) => !i.hidden), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: "expo.out" }); ST.refresh(); }
    }));
  }

  function initForm() {
    const form = $("#contact-form");
    if (!form) return;
    const okBox = $("#form-ok"), errBox = $("#form-error"), errText = $("#form-error-text");
    const btn = $("button[type=submit]", form), label = $(".btn__lb", btn);
    const params = new URLSearchParams(location.search);
    const pre = params.get("servicio");
    if (pre && form.servicio && Array.from(form.servicio.options).some((o) => o.value === pre)) form.servicio.value = pre;
    // lo escrito en el cierre de cualquier página llega como primer borrador del mensaje
    const msg = (params.get("mensaje") || "").trim();
    if (msg && form.mensaje && !form.mensaje.value) form.mensaje.value = msg.slice(0, 1000);
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
      const input = form.elements[name], field = input.closest(".field"), m = rules[name](input.value);
      field.classList.toggle("is-invalid", !!m);
      field.classList.toggle("is-valid", !m);
      input.setAttribute("aria-invalid", m ? "true" : "false");
      $(".field__err", field).textContent = m;
      return !m;
    };
    Object.keys(rules).forEach((name) => {
      const input = form.elements[name];
      input.addEventListener("blur", () => { if (input.value) check(name); });
      input.addEventListener("input", () => { if (input.closest(".field").classList.contains("is-invalid")) check(name); });
      input.addEventListener("change", () => { if (name === "servicio") check(name); });
    });
    const show = (box) => { [okBox, errBox].forEach((b) => b.classList.remove("is-visible")); if (box) { box.classList.add("is-visible"); box.focus(); } };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      show(null);
      const results = Object.keys(rules).map(check);
      if (results.includes(false)) { $(".field.is-invalid input, .field.is-invalid select, .field.is-invalid textarea", form)?.focus(); return; }
      btn.setAttribute("aria-busy", "true"); btn.disabled = true; label.textContent = "Enviando…";
      const fd = Object.fromEntries(new FormData(form).entries());
      const servicioTxt = form.servicio.options[form.servicio.selectedIndex]?.text || fd.servicio;
      const payload = {
        Nombre: fd.nombre, Contacto: fd.contacto, Servicio: servicioTxt, Mensaje: fd.mensaje,
        _subject: `Nueva consulta web — ${servicioTxt} — ${fd.nombre}`, _template: "table", _captcha: "false", _honey: fd._honey || "",
      };
      if (/@/.test(fd.contacto)) payload._replyto = fd.contacto;
      try {
        const ctrl = new AbortController(), to = setTimeout(() => ctrl.abort(), 15000);
        const res = await fetch(form.dataset.endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload), signal: ctrl.signal });
        clearTimeout(to);
        let body = {};
        try { body = await res.json(); } catch (err) {}
        // Solo se muestra éxito si el servicio confirma el envío
        if (res.ok && String(body.success) === "true") { form.reset(); form.hidden = true; show(okBox); }
        else if (/activ/i.test(body.message || "")) { errText.textContent = "El formulario todavía está pendiente de activación, así que tu mensaje no se envió. Mientras tanto, escribinos directamente por email o Instagram."; show(errBox); }
        else { errText.textContent = "No pudimos enviar tu mensaje. Intentá de nuevo en unos minutos o escribinos directamente por email."; show(errBox); }
      } catch (err) {
        errText.textContent = "No pudimos enviar tu mensaje. Revisá tu conexión e intentá de nuevo, o escribinos directamente por email.";
        show(errBox);
      } finally {
        btn.removeAttribute("aria-busy"); btn.disabled = false; label.textContent = "Enviar mensaje";
      }
    });
    $("#form-retry")?.addEventListener("click", () => { show(null); btn.focus(); });
  }
})();
