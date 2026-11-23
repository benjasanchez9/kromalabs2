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

  /* ---------- hero: la actualización v1 → v2 (único momento orquestado) ---------- */
  const rel = $("[data-release]");
  if (rel && !reduce) {
    const items = $$(".rel__it", rel), bar = $("[data-rel-bar]", rel), count = $("[data-rel-count]", rel), state = $("[data-rel-state]", rel);
    const total = items.length;
    const show = (n) => { bar.style.setProperty("--p", n / total); count.textContent = `${n} de ${total} cambios aplicados`; };
    items.forEach((it) => it.classList.remove("is-done"));
    state.textContent = "Instalando la versión 2…";
    show(0);
    (async () => {
      await wait(450);
      for (const [i, it] of items.entries()) { it.classList.add("is-done"); show(i + 1); await wait(260); }
      state.textContent = "Versión 2 instalada";
    })();
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
})();
