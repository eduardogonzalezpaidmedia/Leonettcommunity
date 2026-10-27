/* ==========================================================================
   Leonett Community — medicion.js
   Google Tag Manager + modo de consentimiento v2 + aviso de cookies + eventos.
   Se carga en el <head> de cada página, antes que todo lo demás.
   Va en un archivo aparte (y no pegado en el HTML) para que la política de
   seguridad del sitio (_headers) no tenga que permitir código suelto.
   ========================================================================== */
(function (w, d) {
  "use strict";

  var GTM_ID = "GTM-KVX25G84";
  var CLAVE = "lc-cookies";        // dónde se guarda la decisión del visitante
  var VIGENCIA_DIAS = 365;         // después de un año se vuelve a preguntar

  w.dataLayer = w.dataLayer || [];
  function gtag() { w.dataLayer.push(arguments); }
  w.gtag = w.gtag || gtag;

  /* --- Decisión guardada ------------------------------------------------- */
  function leer() {
    try {
      var g = JSON.parse(localStorage.getItem(CLAVE) || "null");
      if (g && Date.now() - g.fecha < VIGENCIA_DIAS * 86400000) return g.estado;
    } catch (e) {}
    return null;
  }
  function guardar(estado) {
    try { localStorage.setItem(CLAVE, JSON.stringify({ estado: estado, fecha: Date.now() })); } catch (e) {}
  }
  function permisos(acepta) {
    var v = acepta ? "granted" : "denied";
    return { analytics_storage: v, ad_storage: v, ad_user_data: v, ad_personalization: v };
  }

  /* --- 1) Consentimiento por defecto: todo denegado hasta que acepte ------ */
  var decision = leer();
  var base = permisos(false);
  base.functionality_storage = "granted";
  base.security_storage = "granted";
  base.wait_for_update = 500;
  gtag("consent", "default", base);
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", true);
  if (decision === "aceptado") gtag("consent", "update", permisos(true));

  /* --- 2) Google Tag Manager --------------------------------------------- */
  w.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var s = d.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
  (d.head || d.documentElement).appendChild(s);

  /* --- 3) Aviso de cookies ------------------------------------------------ */
  function decidir(acepta, aviso) {
    guardar(acepta ? "aceptado" : "rechazado");
    gtag("consent", "update", permisos(acepta));
    w.dataLayer.push({ event: acepta ? "cookies_aceptadas" : "cookies_rechazadas" });
    if (aviso) aviso.hidden = true;
  }

  function crearAviso() {
    var aviso = d.createElement("div");
    aviso.className = "cookies";
    aviso.setAttribute("role", "region");
    aviso.setAttribute("aria-label", "Aviso de cookies");
    aviso.hidden = true;

    var texto = d.createElement("p");
    texto.className = "cookies__texto";
    texto.appendChild(d.createTextNode("Usamos cookies para medir las visitas y mejorar nuestros anuncios. Puedes aceptarlas o rechazarlas. "));
    var enlace = d.createElement("a");
    enlace.href = "privacidad.html#cookies";
    enlace.textContent = "Más información";
    texto.appendChild(enlace);

    var acciones = d.createElement("div");
    acciones.className = "cookies__acciones";
    var rechazar = d.createElement("button");
    rechazar.type = "button";
    rechazar.className = "btn btn--borde-claro btn--sm cookies__btn";
    rechazar.textContent = "Rechazar";
    var aceptar = d.createElement("button");
    aceptar.type = "button";
    aceptar.className = "btn btn--primario btn--sm cookies__btn";
    aceptar.textContent = "Aceptar";
    acciones.appendChild(rechazar);
    acciones.appendChild(aceptar);

    aviso.appendChild(texto);
    aviso.appendChild(acciones);
    d.body.appendChild(aviso);

    rechazar.addEventListener("click", function () { decidir(false, aviso); });
    aceptar.addEventListener("click", function () { decidir(true, aviso); });
    return aviso;
  }

  /* --- 4) Eventos para GTM (clics que valen como conversión) -------------- */
  function zona(el) {
    if (el.closest(".footer")) return "footer";
    if (el.closest(".header")) return "header";
    if (el.closest(".wa-flotante")) return "boton_flotante";
    return "contenido";
  }

  function escucharClics() {
    d.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      var datos = null;

      if (/wa\.me|api\.whatsapp\.com/.test(href)) {
        datos = { event: "whatsapp_click" };
      } else if (/^mailto:/i.test(href)) {
        datos = { event: "email_click" };
      } else if (/mpago\.la|mercadopago/.test(href)) {
        datos = { event: "taller_pago_click", value: 75000, currency: "CLP" };
      } else if (/instagram\.com|tiktok\.com|facebook\.com/.test(href)) {
        datos = { event: "social_click", red: (href.match(/(instagram|tiktok|facebook)/) || [])[1] };
      }
      if (!datos) return;

      datos.ubicacion = zona(a);
      datos.texto_enlace = (a.textContent || "").trim().slice(0, 80);
      w.dataLayer.push(datos);
    }, true);
  }

  d.addEventListener("DOMContentLoaded", function () {
    var aviso = crearAviso();
    if (!leer()) aviso.hidden = false;

    // Botón "Preferencias de cookies" del footer: vuelve a mostrar el aviso.
    d.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("[data-cookies]")) {
        aviso.hidden = false;
        var primero = aviso.querySelector("button");
        if (primero) primero.focus();
      }
    });

    escucharClics();
  });
})(window, document);
