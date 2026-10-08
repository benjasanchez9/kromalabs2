/**
 * Función serverless de Vercel para el formulario de contacto.
 *
 * Envía el mensaje por email usando Resend (https://resend.com).
 * Requiere configurar en Vercel → Project → Settings → Environment Variables:
 *   RESEND_API_KEY   clave de API de Resend
 *   CONTACT_TO       casilla que recibe los mensajes (ej.: hola@tudominio.uy)
 *   CONTACT_FROM     remitente verificado en Resend (ej.: KROMA Web <web@tudominio.uy>)
 *
 * Mientras no estén configuradas, responde 503 y el sitio muestra un error
 * honesto: nunca simula un envío exitoso.
 */
const MAX = { nombre: 120, contacto: 160, servicio: 60, mensaje: 4000 };
const SERVICIOS = ["webs", "automatizaciones", "integraciones", "identidad-digital", "no-se"];

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Método no permitido." });
  }

  let data = req.body;
  if (typeof data === "string") { try { data = JSON.parse(data); } catch { data = {}; } }
  data = data || {};

  // Honeypot anti-spam: si viene completo, se descarta en silencio
  if (data.empresa_web) return res.status(200).json({ ok: true });

  const nombre = String(data.nombre || "").trim().slice(0, MAX.nombre);
  const contacto = String(data.contacto || "").trim().slice(0, MAX.contacto);
  const servicio = String(data.servicio || "").trim().slice(0, MAX.servicio);
  const mensaje = String(data.mensaje || "").trim().slice(0, MAX.mensaje);

  const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contacto);
  const phone = /^[+()\d\s-]{7,}$/.test(contacto) && contacto.replace(/\D/g, "").length >= 7;
  if (nombre.length < 2 || !(email || phone) || !SERVICIOS.includes(servicio) || mensaje.length < 10) {
    return res.status(400).json({ ok: false, error: "Revisá los datos del formulario e intentá de nuevo." });
  }

  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) {
    return res.status(503).json({ ok: false, code: "not_configured", error: "El envío todavía no está configurado." });
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: [CONTACT_TO],
        reply_to: email ? contacto : undefined,
        subject: `Nueva consulta web — ${servicio} — ${nombre}`,
        html: `<p><strong>Nombre:</strong> ${escape(nombre)}</p>
<p><strong>Contacto:</strong> ${escape(contacto)}</p>
<p><strong>Servicio:</strong> ${escape(servicio)}</p>
<p><strong>Mensaje:</strong><br>${escape(mensaje).replace(/\n/g, "<br>")}</p>`,
      }),
    });
    if (!r.ok) throw new Error(`Resend ${r.status}`);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("contact error:", err);
    return res.status(502).json({ ok: false, error: "No pudimos enviar tu mensaje. Intentá de nuevo en unos minutos." });
  }
};
