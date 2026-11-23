/* KROMA · comportamiento del sitio. Sin librerías: el contenido funciona aunque este archivo no cargue. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));

  /* ---------- header ---------- */
  const hd = $("[data-hd]");
  if (hd) {
    const onScroll = () => hd.classList.toggle("is-scrolled", scrollY > 8);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
  }

  // Submenú de Servicios: se abre con el botón, con hover en escritorio y se cierra con Escape o al salir.
  $$("[data-sub]").forEach((sub) => {
    const tg = $(".nav__tg", sub);
    const set = (open) => { sub.classList.toggle("is-open", open); tg.setAttribute("aria-expanded", String(open)); };
    tg.addEventListener("click", () => set(tg.getAttribute("aria-expanded") !== "true"));
    if (fine) {
      let t;
      sub.addEventListener("mouseenter", () => { clearTimeout(t); set(true); });
      sub.addEventListener("mouseleave", () => { t = setTimeout(() => set(false), 160); });
    }
    sub.addEventListener("keydown", (e) => { if (e.key === "Escape") { set(false); tg.focus(); } });
    sub.addEventListener("focusout", (e) => { if (!sub.contains(e.relatedTarget)) set(false); });
  });

  // Menú móvil
  const mb = $("[data-menu]"), mn = $("[data-mnav]");
  if (mb && mn) {
    const set = (open) => { mb.setAttribute("aria-expanded", String(open)); mn.hidden = !open; document.body.style.overflow = open ? "hidden" : ""; };
    mb.addEventListener("click", () => set(mb.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !mn.hidden) { set(false); mb.focus(); } });
    matchMedia("(min-width: 901px)").addEventListener("change", (e) => { if (e.matches) set(false); });
  }

  /* ---------- Webs: capas con profundidad (solo puntero fino) ---------- */
  $$("[data-depth]").forEach((box) => {
    if (reduce || !fine) return;
    const layers = $$("[data-layer]", box);
    let raf = 0;
    box.parentElement.addEventListener("pointermove", (e) => {
      const r = box.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => layers.forEach((l) => { const d = +l.dataset.layer; l.style.transform = `translate3d(${(-x * 18 * d).toFixed(1)}px, ${(-y * 14 * d).toFixed(1)}px, 0)`; }));
    });
    box.parentElement.addEventListener("pointerleave", () => layers.forEach((l) => (l.style.transform = "")));
  });

  /* ---------- Automatizaciones: un pedido avanza por sus etapas ---------- */
  $$("[data-demo='auto']").forEach((d) => {
    const btn = $("[data-auto-run]", d), label = $("span", btn), steps = $$(".flow__it", d), log = $("[data-auto-log]", d), state = $("[data-auto-state]", d), order = $("[data-order]", d);
    const msgs = ["Pedido recibido desde el formulario.", "Cliente y productos validados.", "Registrado en la planilla compartida.", "Avisos enviados al cliente y al depósito."];
    let n = 1042, busy = false;
    btn.addEventListener("click", async () => {
      if (busy) return;
      busy = true; btn.disabled = true; n += 1; order.textContent = n; state.textContent = "Procesando";
      steps.forEach((s) => s.classList.remove("is-done", "is-on"));
      for (const [i, s] of steps.entries()) {
        s.classList.add("is-on"); await wait(520);
        s.classList.remove("is-on"); s.classList.add("is-done"); log.textContent = msgs[i];
      }
      state.textContent = "Completado, sin intervención manual";
      label.textContent = "Registrar otro pedido"; btn.disabled = false; busy = false;
    });
  });

  /* ---------- Integraciones: una venta viaja de la tienda al sistema ---------- */
  $$("[data-demo='integ']").forEach((d) => {
    const btn = $("[data-integ-run]", d), q = (k) => $(`[data-q='${k}']`, d), pulse = $("[data-pulse]", d), status = $("[data-integ-status]", d);
    let busy = false;
    btn.addEventListener("click", async () => {
      if (busy) return;
      const shop = q("shop"), erp = q("erp"), sales = q("sales");
      if (+shop.textContent <= 0) { status.textContent = "Sin stock: la tienda ya no permite vender este producto."; return; }
      busy = true; btn.disabled = true;
      shop.textContent = +shop.textContent - 1; shop.classList.add("is-changed");
      status.textContent = "Venta registrada en la tienda. Enviando al sistema de gestión…";
      pulse.classList.remove("is-go"); void pulse.offsetWidth; pulse.classList.add("is-go");
      await wait(720);
      erp.textContent = +erp.textContent - 1; sales.textContent = +sales.textContent + 1; erp.classList.add("is-changed");
      status.textContent = `Sincronizado: los dos sistemas muestran ${erp.textContent} unidades.`;
      await wait(900);
      shop.classList.remove("is-changed"); erp.classList.remove("is-changed");
      busy = false; btn.disabled = false;
    });
  });

  /* ---------- Identidad digital: aplicar el sistema visual ---------- */
  $$("[data-demo='ident']").forEach((d) => {
    const sw = $("[data-ident-run]", d);
    sw.addEventListener("click", () => {
      const on = sw.getAttribute("aria-checked") !== "true";
      sw.setAttribute("aria-checked", String(on));
      d.dataset.on = String(on);
    });
  });

  /* ---------- Consultoría: la recomendación cambia según qué pesa más ---------- */
  $$("[data-demo='consult']").forEach((d) => {
    const rows = $$("tbody tr", d), why = $("[data-consult-why]", d);
    const pick = (w) => {
      let best = null, top = -1;
      rows.forEach((r) => {
        const score = ["u", "c", "s"].reduce((a, k) => a + Number(r.dataset[k]) * (k === w ? 2 : 1), 0);
        if (score > top) { top = score; best = r; }
      });
      rows.forEach((r) => r.classList.toggle("is-best", r === best));
      why.textContent = best.dataset.why;
    };
    $$("input[name='prio']", d).forEach((i) => i.addEventListener("change", () => pick(i.value)));
  });

  /* ---------- Proyectos: filtro por servicio ---------- */
  const filter = $("[data-filter]");
  if (filter) {
    const btns = $$("button", filter), cards = $$(".pc"), n = $("[data-filter-n]", filter);
    btns.forEach((b) => b.addEventListener("click", () => {
      btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      let c = 0;
      cards.forEach((card) => { const show = b.dataset.f === "all" || card.dataset.svc === b.dataset.f; card.hidden = !show; if (show) c++; });
      n.textContent = `${c} ${c === 1 ? "concepto" : "conceptos"}`;
    }));
  }

  /* ---------- Contacto ---------- */
  const form = $("#contact-form");
  if (form) {
    const params = new URLSearchParams(location.search);
    const pre = params.get("servicio");
    if (pre && [...form.servicio.options].some((o) => o.value === pre)) form.servicio.value = pre;
    const msg = (params.get("mensaje") || "").trim();
    if (msg && !form.mensaje.value) form.mensaje.value = msg.slice(0, 1000);

    const rules = {
      nombre: (v) => (v.trim().length < 2 ? "Escribí tu nombre." : ""),
      contacto: (v) => {
        const t = v.trim();
        if (!t) return "Dejanos un email o un teléfono para responderte.";
        const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t), phone = /^[+\d][\d\s().-]{6,}$/.test(t);
        return email || phone ? "" : "Revisá el dato: tiene que ser un email (nombre@empresa.com) o un teléfono.";
      },
      mensaje: (v) => (v.trim().length < 10 ? "Contanos un poco más: al menos una frase." : ""),
    };
    const check = (name, show = true) => {
      const el = form.elements[name], field = el.closest(".field"), err = $("[data-err]", field);
      const m = rules[name](el.value);
      if (show) {
        err.textContent = m;
        field.classList.toggle("is-invalid", !!m);
        field.classList.toggle("is-valid", !m && el.value.trim() !== "");
        el.setAttribute("aria-invalid", String(!!m));
      }
      return !m;
    };
    Object.keys(rules).forEach((name) => {
      const el = form.elements[name];
      el.addEventListener("blur", () => { if (el.value.trim()) check(name); });
      el.addEventListener("input", () => { if (el.closest(".field").classList.contains("is-invalid")) check(name); });
    });

    const status = $("[data-status]", form), submit = $("[data-submit]", form), sl = $("[data-submit-l]", form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const bad = Object.keys(rules).filter((n) => !check(n));
      if (bad.length) { form.elements[bad[0]].focus(); return; }
      if (form._honey.value) return;
      submit.disabled = true; sl.textContent = "Enviando…";
      status.className = "form__status"; status.textContent = "";
      try {
        const res = await fetch(form.dataset.endpoint, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || String(data.success) === "false") throw new Error(data.message || "error");
        form.classList.add("is-sent");
        status.className = "form__status is-ok";
        status.textContent = "Recibimos tu mensaje. Te respondemos por el medio que nos dejaste.";
        status.focus();
      } catch (err) {
        status.className = "form__status is-err";
        const mail = form.closest(".contact").querySelector(".contact__alt a");
        status.innerHTML = `No pudimos enviar el mensaje. Probá de nuevo en unos minutos o escribinos a <a href="${mail.href}">${mail.textContent}</a>.`;
        status.focus();
      } finally {
        submit.disabled = false; sl.textContent = "Enviar mensaje";
      }
    });
  }

  $$("[data-year]").forEach((y) => (y.textContent = new Date().getFullYear()));

  /* =========================================================
     Capa de movimiento con GSAP: un solo lugar coordina todo.
     ========================================================= */
  const html = document.documentElement;
  const G = window.gsap;
  if (!G || reduce) { html.classList.remove("anim"); html.classList.add("no-anim"); window.KROMA_ANIM = true; return; }
  const { ScrollTrigger: ST, SplitText: Split, Flip } = window;
  G.registerPlugin(...[ST, Split, Flip].filter(Boolean));
  window.KROMA_ANIM = true;
  html.classList.add("motion");
  const EASE = "power3.out", EASE_IO = "power2.inOut";
  const D = { micro: 0.18, ui: 0.5, reveal: 0.9 };
  const mm = G.matchMedia();
  const desktop = "(min-width: 1000px)";
  const visible = (els) => G.set(els, { visibility: "visible" });

  // Divide un titular en líneas con máscara (entrada por líneas, desplazamiento corto)
  const lines = (el) => new Split(el, { type: "lines", linesClass: "split-line", mask: "lines", autoSplit: false });

  /* ---------- transición entre páginas: cortina curva azul ---------- */
  const curtain = $("[data-curtain]");
  const enterPage = () => {
    let came = false;
    try { came = sessionStorage.getItem("kroma-nav") === "1"; sessionStorage.removeItem("kroma-nav"); } catch {}
    if (!came || !curtain) return 0;
    G.set(curtain, { visibility: "visible", yPercent: 0 });
    G.to(curtain, { yPercent: -112, duration: 0.6, ease: "power3.inOut", delay: 0.05, onComplete: () => G.set(curtain, { visibility: "hidden", yPercent: 105 }) });
    return 0.25;
  };
  const delay = enterPage();
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || !curtain || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== "_self") return;
    if (a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.protocol.indexOf("http") !== 0) return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    try { sessionStorage.setItem("kroma-nav", "1"); } catch {}
    G.set(curtain, { visibility: "visible", yPercent: 105 });
    G.to(curtain, { yPercent: 0, duration: 0.5, ease: "power3.inOut", onComplete: () => { location.href = url.href; } });
  });
  addEventListener("pageshow", (e) => { if (e.persisted && curtain) G.set(curtain, { visibility: "hidden", yPercent: 105 }); });

  /* ---------- header: progreso de lectura y ocultar al bajar ---------- */
  const prog = $("[data-progress]");
  if (prog) G.to(prog, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });
  if (hd) {
    ST.create({ start: 120, end: "max", onUpdate: (self) => hd.classList.toggle("is-hidden", self.direction === 1 && self.scroll() > 240 && !$(".nav__sub.is-open")) });
  }

  /* ---------- hero de Inicio ---------- */
  const hero = $("[data-hero]");
  if (hero) {
    const h1 = $(".h1", hero), lead = $(".lead", hero), ctas = $(".hero__ctas", hero), panel = $(".hero__panel", hero), rel = $("[data-release]", hero);
    visible([h1, lead, ctas, panel]);
    const sp = lines(h1);
    const items = $$(".rel__it", rel), bar = $("[data-rel-bar]", rel), count = $("[data-rel-count]", rel), state = $("[data-rel-state]", rel);
    items.forEach((it) => it.classList.remove("is-done"));
    bar.style.setProperty("--p", 0); count.textContent = `0 de ${items.length} cambios aplicados`; state.textContent = "Instalando la versión 2…";
    const tl = G.timeline({ delay });
    tl.from(sp.lines, { yPercent: 105, duration: D.reveal, ease: "power4.out", stagger: 0.09 })
      .from([lead, ctas], { y: 18, opacity: 0, duration: 0.7, ease: EASE, stagger: 0.08 }, "-=0.55")
      .from(panel, { y: 40, opacity: 0, rotateX: 8, duration: 1, ease: EASE }, "-=0.75")
      .from($$(".rel__it", rel), { x: -12, opacity: 0, duration: 0.4, ease: EASE, stagger: 0.05 }, "-=0.55");
    items.forEach((it, i) => tl.add(() => { it.classList.add("is-done"); bar.style.setProperty("--p", (i + 1) / items.length); count.textContent = `${i + 1} de ${items.length} cambios aplicados`; }, i === 0 ? "+=0.1" : "+=0.24"));
    tl.add(() => { state.textContent = "Versión 2 instalada"; });
    tl.fromTo($(".rel__to", rel), { scale: 1 }, { scale: 1.25, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" });

    // la retícula sigue al puntero (sobre fondo claro: respuesta sutil)
    const bg = $(".hero__bg", hero);
    if (fine && bg) {
      const sx = G.quickTo(bg, "--mx", { duration: 0.6, ease: "power3" }), sy = G.quickTo(bg, "--my", { duration: 0.6, ease: "power3" });
      G.set(bg, { "--mx": "75%", "--my": "40%" });
      hero.addEventListener("pointermove", (e) => { const r = hero.getBoundingClientRect(); sx(((e.clientX - r.left) / r.width) * 100 + "%"); sy(((e.clientY - r.top) / r.height) * 100 + "%"); });
    }
    // al bajar: el panel se aleja en profundidad y el titular sube más rápido (parallax de baja amplitud)
    mm.add(desktop, () => {
      G.to($(".hero__copy", hero), { yPercent: -14, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
      G.to(rel, { rotateX: 10, y: 60, scale: 0.96, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    });
  }

  /* ---------- encabezados de páginas internas ---------- */
  $$(".phero").forEach((ph) => {
    const h1 = $(".h1", ph), lead = $(".lead", ph), demoEl = $(".svch__demo", ph), photo = $(".about__ph", ph);
    const parts = [h1, lead, demoEl, photo].filter(Boolean);
    visible(parts);
    const sp = lines(h1);
    const tl = G.timeline({ delay });
    tl.from(sp.lines, { yPercent: 105, duration: D.reveal, ease: "power4.out", stagger: 0.08 });
    if (lead) tl.from(lead, { y: 16, opacity: 0, duration: 0.7, ease: EASE }, "-=0.6");
    tl.from($$(".hero__ctas, .case__facts, .svch__n, .crumbs", ph), { y: 12, opacity: 0, duration: 0.6, ease: EASE, stagger: 0.06 }, "<");
    if (demoEl) tl.from(demoEl, { y: 50, opacity: 0, duration: 1, ease: EASE }, "-=0.7");
    if (photo) tl.from(photo, { clipPath: "inset(100% 0% 0% 0% round 48% 52% 12px 12px)", duration: 1.2, ease: "power4.inOut" }, "-=0.9");
  });

  /* ---------- títulos de sección: entran por líneas, una vez ---------- */
  $$(".sec .h2, .close .h2, .phero .h3").forEach((h) => {
    if (h.closest("[data-story]")) return;
    const sp = lines(h);
    G.from(sp.lines, { yPercent: 105, duration: 0.85, ease: "power4.out", stagger: 0.07, scrollTrigger: { trigger: h, start: "top 88%", once: true } });
  });
  $$(".sec__intro, .problem__t, .prose p, .close__head p").forEach((el) =>
    G.from(el, { y: 20, opacity: 0, duration: 0.8, ease: EASE, scrollTrigger: { trigger: el, start: "top 90%", once: true } }));

  /* ---------- listas con divisiones: la línea se dibuja y el contenido sube ---------- */
  $$(".rows, .steps, .inc, .ex, .faq, .metrics, .guide, .proc__list").forEach((list) => {
    const kids = list.matches(".guide") ? $$("tbody tr", list) : [...list.children];
    G.fromTo(list, { "--rule": 0 }, { "--rule": 1, duration: 1, ease: EASE_IO, scrollTrigger: { trigger: list, start: "top 85%", once: true } });
    G.from(kids, { y: 26, opacity: 0, duration: 0.7, ease: EASE, stagger: 0.07, scrollTrigger: { trigger: list, start: "top 85%", once: true } });
  });

  /* ---------- filas de servicios: la vista previa sigue al puntero ---------- */
  mm.add("(hover: hover) and (min-width: 1000px)", () => {
    $$(".row__a").forEach((row) => {
      const pv = $(".row__pv", row);
      const xTo = G.quickTo(pv, "x", { duration: 0.45, ease: "power3" }), yTo = G.quickTo(pv, "y", { duration: 0.45, ease: "power3" }), rTo = G.quickTo(pv, "rotate", { duration: 0.6, ease: "power3" });
      let lastX = 0;
      row.addEventListener("pointermove", (e) => {
        const r = row.getBoundingClientRect(), w = pv.offsetWidth, h = pv.offsetHeight;
        const x = Math.min(Math.max(e.clientX - r.left - w / 2, r.width * 0.42), r.width - w - 80);
        xTo(x); yTo(e.clientY - r.top - h / 2); rTo(G.utils.clamp(-6, 6, (e.clientX - lastX) * 0.6)); lastX = e.clientX;
      });
      row.addEventListener("pointerenter", (e) => { const r = row.getBoundingClientRect(); G.set(pv, { x: Math.max(e.clientX - r.left - pv.offsetWidth / 2, r.width * 0.42), y: (r.height - pv.offsetHeight) / 2 }); lastX = e.clientX; });
      row.addEventListener("focus", () => { const r = row.getBoundingClientRect(); G.set(pv, { x: r.width * 0.55, y: (r.height - pv.offsetHeight) / 2, rotate: 0 }); });
    });
  });

  /* ---------- sección fijada: de la versión 1 a la 2 (ligada al scroll) ---------- */
  const story = $("[data-story]");
  if (story) {
    const stage = $("[data-stage]", story), chips = $$(".chip", stage), paths = $$(".stage__lines path", stage), hub = $(".stage__hub", stage), dash = $("[data-dash]", stage), cap = $("[data-cap]", stage);
    const caps = JSON.parse(stage.dataset.caps), steps = $$(".story__st", story), bar = $("[data-story-bar]", story);
    const P = {
      chaos: [[22, 20, -9], [72, 15, 7], [16, 54, 5], [80, 48, -6], [32, 83, 8], [72, 82, -4]],
      list: chips.map((_, i) => [50, 17 + i * 13.2, 0]),
      ring: chips.map((_, i) => { const a = (-90 + i * 60) * Math.PI / 180; return [50 + 36 * Math.cos(a), 50 + 36 * Math.sin(a), 0]; }),
    };
    const prio = [0.95, 0.8, 0.62, 0.5, 0.32, 0.18];
    const setStep = (i) => { steps.forEach((s, k) => s.classList.toggle("is-on", k === i)); cap.textContent = caps[i]; };
    mm.add(desktop, () => {
      // estado inicial: herramientas sueltas
      G.set(chips, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
      G.set(chips, { left: (i) => P.chaos[i][0] + "%", top: (i) => P.chaos[i][1] + "%", rotate: (i) => P.chaos[i][2] });
      G.set(paths, { strokeDashoffset: 1 }); G.set(hub, { scale: 0, autoAlpha: 0 }); G.set(dash, { autoAlpha: 0, scale: 0.9 });
      G.set($$(".chip__bar", stage), { height: 0, marginTop: -6 });
      setStep(0); cap.textContent = caps[0];
      // flotación ambiental lenta mientras están sueltas
      const drift = G.to(chips, { y: (i) => (i % 2 ? 8 : -8), duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: { each: 0.3, from: "random" } });
      const tl = G.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: story, pin: $(".story__pin", story), start: "top top", end: "+=260%", scrub: 0.8,
          onUpdate: (self) => { const i = Math.min(3, Math.floor(self.progress * 4 + 0.12)); if (!steps[i].classList.contains("is-on")) setStep(i); G.set(bar, { scaleX: 0.25 + self.progress * 0.75 }); if (self.progress > 0.02) drift.pause(); else drift.play(); },
        },
      });
      tl.addLabel("entendemos")
        .to(chips, { left: (i) => P.list[i][0] + "%", top: (i) => P.list[i][1] + "%", rotate: 0, y: 0, duration: 1, stagger: 0.04 })
        .to($$(".chip__bar", stage), { height: 4, marginTop: 0, duration: 0.4 }, "<0.5")
        .to($$(".chip__bar i", stage), { scaleX: (i) => prio[i], duration: 0.6, stagger: 0.05 }, "<0.2")
        .to({}, { duration: 0.6 })
        .addLabel("priorizamos")
        .to($$(".chip__bar", stage), { height: 0, marginTop: -6, duration: 0.3 })
        .to(chips, { left: (i) => P.ring[i][0] + "%", top: (i) => P.ring[i][1] + "%", duration: 1, stagger: 0.03 }, "<")
        .to(hub, { scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(1.6)" }, "<0.4")
        .to(paths, { strokeDashoffset: 0, duration: 0.7, stagger: 0.06 }, "<0.2")
        .to({}, { duration: 0.6 })
        .addLabel("desarrollamos")
        .to(chips, { left: "50%", top: "50%", scale: 0.4, autoAlpha: 0, duration: 0.8, stagger: 0.03 })
        .to(paths, { autoAlpha: 0, duration: 0.4 }, "<")
        .to(hub, { scale: 0.5, autoAlpha: 0, duration: 0.5 }, "<0.3")
        .to(dash, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "back.out(1.4)" }, "<0.1")
        .from($$("li", dash), { x: -14, autoAlpha: 0, duration: 0.4, stagger: 0.08 }, "<0.3")
        .to({}, { duration: 0.5 })
        .addLabel("acompanamos");
      return () => { drift.kill(); G.set([chips, paths, hub, dash, $$(".chip__bar", stage), $$(".chip__bar i", stage)], { clearProps: "all" }); steps.forEach((s) => s.classList.add("is-on")); cap.textContent = caps[2]; };
    });
    mm.add("(max-width: 999px)", () => { G.from(stage, { scale: 0.92, opacity: 0, duration: 0.9, ease: EASE, scrollTrigger: { trigger: stage, start: "top 85%", once: true } }); });
  }

  /* ---------- declaración: las palabras se encienden con el scroll ---------- */
  $$("[data-words]").forEach((el) => {
    // líneas que suben con el scroll dentro de su máscara: el texto siempre conserva el contraste completo
    const sp = lines(el);
    G.from(sp.lines, { yPercent: 100, ease: "none", stagger: 0.25, scrollTrigger: { trigger: el, start: "top 90%", end: "top 45%", scrub: 0.6 } });
    G.from($$(".stmt__body > *", el.parentElement), { y: 20, opacity: 0, duration: 0.7, ease: EASE, stagger: 0.08, scrollTrigger: { trigger: el, start: "top 70%", once: true } });
  });

  /* ---------- métricas: cuentan desde cero ---------- */
  $$("[data-count]").forEach((el) => {
    const end = +el.dataset.count, o = { v: 0 };
    G.to(o, { v: end, duration: 1.4, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%", once: true }, onUpdate: () => (el.textContent = Math.round(o.v)) });
  });

  /* ---------- proyectos: aparecen recortados y la ilustración se mueve dentro del marco ---------- */
  $$(".pc").forEach((card) => {
    const art = $(".pc__art", card), svg = $("svg", art);
    G.from(art, { clipPath: "inset(18% 8% 18% 8% round 12px)", duration: 1.1, ease: "power4.out", scrollTrigger: { trigger: card, start: "top 88%", once: true } });
    G.from($$(".pc__meta, .pc__t, .pc__d, .pc__go", card), { y: 16, opacity: 0, duration: 0.6, ease: EASE, stagger: 0.06, scrollTrigger: { trigger: card, start: "top 80%", once: true } });
    G.fromTo(svg, { scale: 1.12, yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: art, start: "top bottom", end: "bottom top", scrub: true } });
  });
  const caseArt = $(".case__art svg");
  if (caseArt) G.fromTo(caseArt, { scale: 1.1, yPercent: -3 }, { yPercent: 3, ease: "none", scrollTrigger: { trigger: caseArt.parentElement, start: "top bottom", end: "bottom top", scrub: true } });

  // filtro de proyectos: las tarjetas se reacomodan con Flip en lugar de saltar
  if (filter && Flip) {
    const grid = $(".pcs", filter.parentElement);
    filter.addEventListener("click", (e) => {
      if (!e.target.closest("button")) return;
      const state = Flip.getState($$(".pc", grid));
      requestAnimationFrame(() => Flip.from(state, { duration: 0.6, ease: "power3.inOut", absolute: true, onEnter: (els) => G.fromTo(els, { opacity: 0, scale: 0.95 }, { autoAlpha: 1, scale: 1, duration: 0.5 }), onLeave: (els) => G.to(els, { opacity: 0, scale: 0.95, duration: 0.3 }) }));
    }, true);
  }

  /* ---------- Nosotros: la máscara orgánica de la foto avanza con el scroll ---------- */
  const ph = $(".about__ph img");
  if (ph) G.to(ph, { borderRadius: "12px 12px 48% 52% / 12px 12px 30% 34%", scale: 1.04, ease: "none", scrollTrigger: { trigger: ph, start: "top 30%", end: "bottom top", scrub: true } });
  // proceso: cada etapa se activa según su posición en pantalla
  $$(".proc__it").forEach((it) => ST.create({ trigger: it, start: "top 62%", end: "bottom 62%", toggleClass: "is-on" }));

  /* ---------- demos de servicio: se presentan solas una vez, después responden a la persona ---------- */
  const once = (sel, fn) => { const el = $(sel); if (el) ST.create({ trigger: el, start: "top 70%", once: true, onEnter: () => setTimeout(fn, 600) }); };
  once("[data-demo='auto'] [data-auto-run]", () => $("[data-demo='auto'] [data-auto-run]").click());
  once("[data-demo='integ'] [data-integ-run]", () => $("[data-demo='integ'] [data-integ-run]").click());
  once("[data-demo='ident'] [data-ident-run]", () => { const s = $("[data-demo='ident'] [data-ident-run]"); if (s.getAttribute("aria-checked") !== "true") s.click(); });
  const dw = $("[data-depth]");
  if (dw) mm.add(desktop, () => { G.from($(".dw__phone", dw), { y: 80, opacity: 0, duration: 1.1, ease: EASE, delay: delay + 0.6 }); });

  /* ---------- cierre y pie ---------- */
  $$(".close").forEach((c) => G.from($$(".close__form > *", c), { y: 20, opacity: 0, duration: 0.7, ease: EASE, stagger: 0.08, scrollTrigger: { trigger: c, start: "top 75%", once: true } }));
  const word = $("[data-word]");
  if (word) {
    const chars = new Split($("span", word), { type: "chars" }).chars;
    G.from(chars, { yPercent: 110, duration: 1, ease: "power4.out", stagger: 0.05, scrollTrigger: { trigger: word, start: "top 95%", once: true } });
    G.from($(".ft__iso", word), { scale: 0.4, xPercent: -30, opacity: 0, duration: 1.1, ease: "back.out(1.4)", scrollTrigger: { trigger: word, start: "top 95%", once: true } });
  }

  /* ---------- botones con respuesta magnética (solo puntero fino) ---------- */
  if (fine) $$(".hero .btn, .close .btn, .hd__cta").forEach((b) => {
    const x = G.quickTo(b, "x", { duration: 0.4, ease: "power3" }), y = G.quickTo(b, "y", { duration: 0.4, ease: "power3" });
    b.addEventListener("pointermove", (e) => { const r = b.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.18); y((e.clientY - r.top - r.height / 2) * 0.3); });
    b.addEventListener("pointerleave", () => { x(0); y(0); });
  });

  /* ---------- preguntas frecuentes: abren con altura animada ---------- */
  $$(".faq details").forEach((d) => {
    const sum = $("summary", d), body = $("p", d);
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.open) { G.to(body, { height: 0, autoAlpha: 0, duration: 0.3, ease: EASE_IO, onComplete: () => { d.open = false; G.set(body, { clearProps: "all" }); } }); }
      else { d.open = true; G.from(body, { height: 0, opacity: 0, duration: 0.4, ease: EASE }); }
    });
  });

  // recalcular cuando cargan las fuentes o cambia el tamaño del contenido
  document.fonts && document.fonts.ready.then(() => ST.refresh());
  html.classList.remove("anim");
})();
