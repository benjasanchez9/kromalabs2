// Contenido del sitio de KROMA: servicios, proyectos conceptuales y proceso. Los textos se editan acá.

export const SERVICES = [
  { slug: "webs", n: "01", name: "Webs", img: "arq-esquina", short: "Sitios a medida, rápidos y pensados para convertir." },
  { slug: "automatizaciones", n: "02", name: "Automatizaciones", img: "arq-escalera", short: "Menos trabajo manual. Más tiempo para lo importante." },
  { slug: "integraciones", n: "03", name: "Integraciones", img: "arq-voladizo", short: "Conectamos tus herramientas para que todo fluya." },
  { slug: "identidad-digital", n: "04", name: "Identidad digital", img: "arq-curva", short: "Una presencia digital sólida y coherente con tu negocio." },
  { slug: "consultoria-tecnologica", n: "05", name: "Consultoría tecnológica", img: "arq-escalera-curva", short: "Primero entendemos tu negocio. Después elegimos la tecnología." },
];

export const PROJECTS = [
  {
    slug: "web-estudio-profesional", service: "webs", serviceName: "Webs", img: "arq-esquina",
    title: "Web para un estudio profesional",
    context: "Un estudio contable con una cartera estable de clientes. Su web actual fue armada hace años y casi no se actualiza.",
    need: "Las consultas llegan por teléfono y suelen repetirse: horarios, documentación necesaria, servicios. El estudio quiere que la web responda lo básico y que los contactos nuevos lleguen con la información ordenada.",
    solution: "Un sitio breve y claro, con los servicios explicados en lenguaje simple, una sección de preguntas frecuentes y un formulario que pide los datos necesarios según el tipo de consulta.",
    deliverables: ["Arquitectura de contenidos", "Diseño responsive de cinco páginas", "Formulario con campos según el tipo de consulta", "Guía breve para actualizar textos"],
  },
  {
    slug: "automatizacion-pedidos", service: "automatizaciones", serviceName: "Automatizaciones", img: "arq-escalera",
    title: "Automatización de pedidos para una distribuidora",
    context: "Una distribuidora que recibe pedidos de comercios por email y WhatsApp, y los carga a mano en una planilla.",
    need: "Reducir el tiempo de carga y los errores de transcripción, y avisarle al cliente cuando su pedido quedó registrado.",
    solution: "Un formulario de pedido para clientes frecuentes. Cada envío se valida, se registra en la planilla compartida y dispara dos avisos: la confirmación al cliente y la notificación al depósito.",
    deliverables: ["Mapa del proceso actual y del propuesto", "Formulario de pedido", "Flujo automatizado con avisos", "Documentación y alerta ante errores"],
  },
  {
    slug: "integracion-tienda-stock", service: "integraciones", serviceName: "Integraciones", img: "arq-voladizo",
    title: "Integración entre tienda online y stock",
    context: "Un comercio con local físico y tienda online, que maneja el stock en su sistema de gestión.",
    need: "Evitar ventas de productos sin stock y dejar de actualizar cantidades a mano en dos lugares.",
    solution: "Una integración que sincroniza el stock del sistema de gestión con la tienda online y registra cada venta web en el sistema, con un reporte diario de diferencias.",
    deliverables: ["Diagnóstico de ambos sistemas", "Reglas de sincronización", "Integración implementada y probada", "Reporte diario de control"],
  },
  {
    slug: "identidad-cafeteria", service: "identidad-digital", serviceName: "Identidad digital", img: "arq-curva",
    title: "Identidad digital para una cafetería de barrio",
    context: "Una cafetería que abre su segundo local y comunica en redes con piezas armadas de forma improvisada.",
    need: "Tener una imagen reconocible y poder publicar con frecuencia sin depender de un diseñador para cada pieza.",
    solution: "Una actualización de la identidad visual con paleta, tipografías y reglas simples, más un set de plantillas editables para redes y cartelería del local.",
    deliverables: ["Identidad visual actualizada", "Manual de uso breve", "Plantillas editables para redes", "Piezas para cartelería y menú"],
  },
];

/* ---------------- SEO ---------------- */

export const PROCESS = [
  { t: "Entendemos", d: "Nos sumergimos en tu negocio, tus desafíos y tus oportunidades.",
    a: ["Conversamos con quienes hacen el trabajo todos los días", "Relevamos herramientas, procesos y datos actuales", "Detectamos dónde se pierde tiempo o se repiten tareas"],
    out: "Un diagnóstico claro de tu situación" },
  { t: "Priorizamos", d: "Definimos el camino con criterio y foco en lo que genera valor.",
    a: ["Ordenamos las oportunidades por impacto y esfuerzo", "Elegimos herramientas a la escala de tu empresa", "Acordamos alcance, etapas y costos antes de empezar"],
    out: "Un plan por etapas, sin sorpresas" },
  { t: "Desarrollamos", d: "Creamos soluciones robustas, escalables y a medida.",
    a: ["Implementamos por etapas, de a una cosa por vez", "Probamos con datos y casos reales", "Revisamos juntos cada avance"],
    out: "La solución funcionando en tu operación" },
  { t: "Acompañamos", d: "Estamos en cada etapa para que tu negocio siga creciendo.",
    a: ["Capacitamos a tu equipo en el uso diario", "Dejamos documentación simple y ordenada", "Ajustamos según cómo se usa en la práctica"],
    out: "Autonomía para usar y mantener lo que hicimos" },
];
export const PRINCIPLES = [
  ["Claridad", "Explicamos cada decisión sin jerga, para que puedas evaluarla."],
  ["Escala", "Proponemos soluciones acordes al tamaño y al momento de tu empresa."],
  ["Autonomía", "Buscamos que tu equipo pueda usar y mantener lo que implementamos."],
];

export const SVC_PAGES = {
  webs: {
    seo: "Diseño web para empresas en Uruguay",
    tone: "blue", heroTheme: "blue",
    title: ["Una web que", "trabaja para", "tu negocio."],
    lead: "Diseñamos y desarrollamos sitios claros, rápidos y fáciles de actualizar, pensados para que tus clientes entiendan qué hacés y cómo contactarte.",
    desc: "Diseño y desarrollo de sitios web claros, rápidos y fáciles de actualizar para empresas uruguayas.",
    problem: "Muchas webs se ven bien pero no ayudan: <em>la información queda desactualizada</em>, cargan lento en el celular o nadie sabe cómo cambiar un texto.",
    includes: [
      ["Estrategia y contenidos", "Ordenamos qué decir, en qué orden y para quién, antes de diseñar."],
      ["Diseño a medida", "Una propuesta visual coherente con tu marca, sin plantillas genéricas."],
      ["Desarrollo responsive", "Funciona bien en celular, tablet y computadora, con atención a la velocidad y al posicionamiento básico."],
      ["Publicación y autogestión", "Dejamos el sitio publicado, con dominio configurado y una forma simple de editar lo esencial."],
    ],
    examples: [
      ["Sitio institucional", "Para un estudio o empresa de servicios que necesita explicar qué hace y recibir consultas ordenadas."],
      ["Landing de campaña", "Una página enfocada para lanzar un servicio, un producto o una convocatoria."],
      ["Catálogo con consulta", "Productos presentados con claridad y un canal directo para pedir información."],
      ["Rediseño", "Una web existente que ya no se puede mantener, migrada a una base simple."],
    ],
    steps: [["Relevamiento", "Objetivos, público y contenidos disponibles."], ["Estructura y diseño", "Mapa del sitio y diseño de las páginas clave."], ["Desarrollo", "Construcción, pruebas en dispositivos y ajustes."], ["Publicación", "Dominio, puesta en línea y guía de uso."]],
    faq: [
      ["¿Puedo actualizar la web yo mismo?", "Sí. Definimos juntos qué partes vas a querer editar y elegimos una solución que lo permita sin conocimientos técnicos."],
      ["¿Cuánto demora?", "Depende del alcance. Lo estimamos después de la primera conversación, con etapas y fechas concretas."],
      ["¿Se encargan del dominio y el hosting?", "Te ayudamos a elegirlos y configurarlos. Quedan a nombre de tu empresa."],
      ["Ya tengo una web, ¿hay que hacerla de cero?", "No necesariamente. La revisamos y te decimos qué conviene: mejorarla, migrarla o rehacerla."],
    ],
  },
  automatizaciones: {
    seo: "Automatización de procesos para empresas",
    tone: "black", heroTheme: "black",
    title: ["Menos tareas", "repetidas.", "Más tiempo útil."],
    lead: "Identificamos tareas manuales que se repiten todos los días y las resolvemos con herramientas que ya usás o que conviene sumar.",
    desc: "Automatización de tareas repetitivas para empresas: pedidos, avisos, reportes y flujos de trabajo.",
    problem: "Copiar datos de un email a una planilla, mandar el mismo aviso diez veces, armar un reporte a mano cada lunes: <em>son tareas necesarias, pero no deberían ocupar a una persona</em>.",
    includes: [
      ["Relevamiento de procesos", "Detectamos qué tareas se repiten, cuánto tiempo llevan y dónde aparecen errores."],
      ["Diseño del flujo", "Definimos qué dispara cada automatización, qué pasos sigue y quién se entera."],
      ["Implementación y pruebas", "Construimos el flujo con datos reales y lo probamos antes de dejarlo en uso."],
      ["Documentación y ajuste", "Dejamos explicado cómo funciona y lo ajustamos en las primeras semanas."],
    ],
    examples: [
      ["Pedidos sin carga manual", "Pedidos que llegan por formulario y se registran solos en una planilla o sistema."],
      ["Recordatorios automáticos", "Avisos de turnos, vencimientos o renovaciones que salen en el momento justo."],
      ["Reportes periódicos", "Resúmenes semanales que se generan y se envían sin intervención."],
      ["Respuestas iniciales", "Primeras respuestas a consultas frecuentes mientras el equipo atiende lo demás."],
    ],
    steps: [["Mapeo", "Seguimos la tarea paso a paso como se hace hoy."], ["Propuesta", "Qué se automatiza, con qué herramienta y qué costo tiene."], ["Implementación", "Construcción, pruebas y avisos ante errores."], ["Seguimiento", "Revisión en uso real y ajustes."]],
    faq: [
      ["¿Tengo que cambiar los programas que uso?", "No necesariamente. Primero vemos qué se puede automatizar con lo que ya tenés."],
      ["¿Qué pasa si algo falla?", "Diseñamos cada flujo con avisos ante errores y te explicamos cómo revisarlo."],
      ["¿Es solo para empresas grandes?", "No. En equipos chicos, donde cada hora cuenta, una automatización simple suele notarse rápido."],
      ["¿Quién mantiene la automatización?", "Te dejamos documentación y acordamos cómo acompañarte después de la entrega."],
    ],
  },
  integraciones: {
    seo: "Integración de sistemas y herramientas",
    tone: "ivory", heroTheme: "ivory",
    title: ["Tus herramientas,", "hablando", "entre sí."],
    lead: "Conectamos los sistemas que ya usás para que la información viaje sola y no haya que cargarla dos veces.",
    desc: "Integración de sistemas para empresas: tienda online, gestión, facturación, CRM y reportes conectados.",
    problem: "Cuando cada sistema funciona por separado, <em>los mismos datos se cargan varias veces</em> y aparecen diferencias entre lo que dice la tienda, la planilla y la facturación.",
    includes: [
      ["Diagnóstico de sistemas", "Revisamos qué herramientas usás, qué datos maneja cada una y cómo se pueden conectar."],
      ["Conexión", "Integramos mediante las conexiones que ofrece cada sistema o con herramientas de integración."],
      ["Reglas de sincronización", "Definimos qué dato manda en cada caso, con qué frecuencia viaja y qué pasa ante diferencias."],
      ["Monitoreo y documentación", "Dejamos registro de cada conexión y avisos para detectar problemas a tiempo."],
    ],
    examples: [
      ["Tienda y stock", "La tienda online toma el stock del sistema de gestión y cada venta vuelve a registrarse."],
      ["Formulario y CRM", "Cada consulta web crea un contacto con su origen y su estado."],
      ["Venta y facturación", "La factura se emite a partir de la venta, sin volver a tipear datos."],
      ["Reporte unificado", "Datos de varias fuentes reunidos en un solo tablero o planilla."],
    ],
    steps: [["Diagnóstico", "Sistemas, datos y posibilidades de conexión."], ["Diseño", "Flujo de datos y reglas acordadas."], ["Integración", "Implementación en un entorno de prueba y luego en uso real."], ["Control", "Monitoreo, documentación y ajustes."]],
    faq: [
      ["¿Cualquier sistema se puede integrar?", "No siempre. Depende de si el sistema permite conectarse, por ejemplo mediante una API. Lo verificamos antes de proponer una solución."],
      ["¿Es seguro?", "Usamos accesos con los permisos mínimos necesarios y documentamos qué datos viajan y hacia dónde."],
      ["¿Qué pasa si cambio de sistema?", "La integración se puede ajustar. Te explicamos qué partes dependen de cada herramienta."],
      ["¿Las herramientas tienen costo?", "Algunas herramientas de integración tienen suscripción propia. Te lo indicamos antes de empezar, con alternativas."],
    ],
  },
  "identidad-digital": {
    seo: "Identidad visual y diseño para redes",
    tone: "blue", heroTheme: "blue",
    title: ["Una marca", "que se reconoce", "en todos lados."],
    lead: "Creamos o actualizamos tu identidad visual y diseñamos las piezas que la llevan a redes, web y otros puntos de contacto.",
    desc: "Identidad visual y diseño de material para redes y otros puntos de contacto, con un sistema coherente.",
    problem: "Un logo distinto en cada lugar, colores que cambian según quién diseñe, publicaciones armadas a último momento: <em>la marca pierde fuerza cuando no hay un sistema</em>.",
    includes: [
      ["Identidad visual", "Logo, paleta de colores y tipografías pensadas para usarse en pantalla e impresión."],
      ["Manual de uso", "Reglas simples para aplicar la marca sin depender de un diseñador."],
      ["Plantillas para redes", "Formatos editables para publicar con frecuencia y mantener la coherencia."],
      ["Otros puntos de contacto", "Presentaciones, cartelería, firmas de email y lo que tu marca necesite."],
    ],
    examples: [
      ["Marca nueva", "Para un emprendimiento que necesita presentarse con claridad desde el inicio."],
      ["Actualización", "Una identidad existente modernizada sin perder lo que la gente ya reconoce."],
      ["Sistema para redes", "Plantillas y criterios para publicar seguido sin improvisar cada pieza."],
      ["Material comercial", "Presentaciones e impresos coherentes con el resto de la marca."],
    ],
    steps: [["Diagnóstico", "Qué existe, qué funciona y qué falta."], ["Concepto", "Dirección visual y primeras aplicaciones."], ["Sistema", "Desarrollo de piezas, reglas y plantillas."], ["Entrega", "Archivos ordenados y guía de uso."]],
    faq: [
      ["¿Hacen solo el logo?", "Podemos, pero recomendamos al menos definir colores, tipografías y reglas básicas para que el logo funcione en todos lados."],
      ["¿Puedo editar las plantillas?", "Sí. Las entregamos en herramientas que tu equipo pueda usar, como Canva o Figma, según prefieras."],
      ["¿Gestionan las redes sociales?", "Nos enfocamos en el sistema visual y las piezas. Si necesitás gestión de redes, te orientamos sobre cómo organizarla."],
      ["¿Cuántas instancias de revisión hay?", "Trabajamos por etapas, con revisiones acordadas al inicio para avanzar con decisiones claras."],
    ],
  },
  "consultoria-tecnologica": {
    seo: "Consultoría tecnológica para empresas",
    tone: "black", heroTheme: "black",
    title: ["La tecnología", "no es solo para", "las grandes."],
    cta: "Contanos tu caso",
    lead: "Primero entendemos tu negocio. Después evaluamos opciones por utilidad, costo y complejidad, sin vender ninguna herramienta en particular.",
    desc: "Consultoría tecnológica para empresas uruguayas: analizamos tu operación y te ayudamos a elegir herramientas útiles, accesibles y a la medida de tu negocio.",
    problem: "A las empresas no les faltan herramientas: <em>les sobran opciones</em>. Lo difícil es saber cuál conviene, cuánto invertir y cómo hacer que funcione con lo que ya usan.",
    includes: [
      ["Diagnóstico de procesos", "Relevamos cómo trabaja tu equipo hoy, qué herramientas usa y dónde se pierde tiempo o información."],
      ["Oportunidades de mejora", "Detectamos qué conviene digitalizar u optimizar primero y qué puede esperar."],
      ["Evaluación de herramientas", "Comparamos opciones del mercado por utilidad, costo y complejidad de adopción. No representamos a ninguna marca."],
      ["Hoja de ruta", "Una recomendación por etapas, con soluciones accesibles y escalables, que conecta lo que ya usás en lugar de sumar procesos aislados."],
    ],
    examples: [
      ["Elegir un sistema de gestión", "Una empresa que factura y controla stock en planillas y quiere un sistema que le sirva sin pagar de más."],
      ["Ordenar las consultas", "Pedidos que llegan por WhatsApp, mail y la web, sin un lugar común para seguirlos."],
      ["Revisar lo que ya se paga", "Suscripciones que se superponen o que el equipo dejó de usar."],
      ["Antes de invertir", "Una mirada independiente antes de contratar un software o un desarrollo a medida."],
    ],
    steps: [["Conversación inicial", "Qué hace tu negocio, qué te frena y qué querés resolver."], ["Relevamiento", "Procesos, herramientas actuales y lo que cuestan."], ["Evaluación", "Opciones comparadas con criterios claros."], ["Recomendación", "Hoja de ruta priorizada y acompañamiento si decidís implementarla."]],
    faq: [
      ["¿Venden o representan alguna herramienta?", "No. Recomendamos según lo que tu negocio necesita. Si algo que ya usás sirve, te lo vamos a decir."],
      ["¿Necesito conocimientos técnicos?", "No. Explicamos cada opción en términos de costo, tiempo y uso diario, sin jerga."],
      ["¿Qué recibo al final?", "Un diagnóstico y una recomendación por etapas: qué usar, en qué orden, una estimación de costos y qué implica adoptarlo."],
      ["¿Después pueden implementarlo?", "Sí, si lo necesitás. Podemos encargarnos de webs, automatizaciones, integraciones o identidad digital, o acompañar a tu equipo o a otro proveedor."],
    ],
  },
};

