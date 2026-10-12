/* ==========================================================================
   Leonett Community — main.js (JavaScript vanilla, sin dependencias)
   Módulos: menú móvil · header al hacer scroll · animaciones · formulario · año
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     CONFIGURACIÓN — lo único que necesitas editar en este archivo
     ------------------------------------------------------------------------ */
  var CONFIG = {
    // Número de WhatsApp en formato internacional, solo dígitos (56 + 9 + número).
    // Se usa cuando el formulario se envía por WhatsApp.
    whatsapp: "56949955184",

    // Página a la que se redirige después de enviar el formulario por Formspree.
    paginaGracias: "gracias.html",

    // Pop-up de descuento: correo que recibe los registros y segundos antes de mostrarlo.
    // TALLER: cupos que quedan disponibles. Cada vez que alguien pague, resta 1.
    // Con 0, el sitio muestra "Cupos agotados" y oculta los botones de pago.
    tallerCuposDisponibles: 6,
    tallerCuposTotales: 6,

    popupDestino: "info@leonettcommunity.com",
    // Formulario "Web 5%" de Brevo: guarda cada registro en la lista "Descuento 5%".
    brevoForm: "https://5ae0d0ec.sibforms.com/serve/MUIFAEcJuZtoJ3y3w3ap8wlTQxs7yPtEvB3KsPSTWcZMxEnJ7XDpX2rQ0bvmqDLJYaXrhvyrST30m5QljlZ9kj7UosBZEyCLY345vM9V01aElRLv0j1cILwj23ugCh0n8xSL2gsq-LTq6fdYckSI944hRgaZZuMXxrLZF_HVNhKpm_ZDfDYpR3jHNHMNe_a4G9uk01w-huK1ntmAXw==",
    popupSegundos: 10,
    // Días que el pop-up no vuelve a aparecer si la persona lo cierra.
    popupDiasPausa: 7
  };

  /* --- Menú móvil -------------------------------------------------------- */
  function iniciarMenu() {
    var boton = document.querySelector(".menu-btn");
    var nav = document.getElementById("nav");
    if (!boton || !nav) return;

    function cerrar() {
      nav.classList.remove("is-open");
      boton.setAttribute("aria-expanded", "false");
      boton.setAttribute("aria-label", "Abrir menú");
      document.body.classList.remove("menu-abierto");
    }

    function abrir() {
      nav.classList.add("is-open");
      boton.setAttribute("aria-expanded", "true");
      boton.setAttribute("aria-label", "Cerrar menú");
      document.body.classList.add("menu-abierto");
    }

    boton.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) cerrar();
      else abrir();
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) cerrar();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        cerrar();
        boton.focus();
      }
    });

    // Si la ventana crece a escritorio con el menú abierto, se cierra.
    window.matchMedia("(min-width: 960px)").addEventListener("change", function (e) {
      if (e.matches) cerrar();
    });
  }

  /* --- Sombra del header al hacer scroll --------------------------------- */
  function iniciarHeader() {
    var header = document.querySelector(".header");
    if (!header) return;
    var activo = false;
    function actualizar() {
      var debe = window.scrollY > 8;
      if (debe !== activo) {
        activo = debe;
        header.classList.toggle("is-scrolled", debe);
      }
    }
    window.addEventListener("scroll", actualizar, { passive: true });
    actualizar();
  }

  /* --- Aparición al hacer scroll ----------------------------------------- */
  function iniciarReveal() {
    var elementos = document.querySelectorAll(".reveal");
    if (!elementos.length) return;

    var sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (sinMovimiento || !("IntersectionObserver" in window)) {
      elementos.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("is-visible");
          observador.unobserve(entrada.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    elementos.forEach(function (el) { observador.observe(el); });
  }

  /* --- Formulario de contacto -------------------------------------------- */
  var MENSAJES = {
    nombre: "Escribe tu nombre.",
    email: "Escribe un email válido, por ejemplo nombre@empresa.cl.",
    empresa: "Escribe el nombre de tu empresa o marca.",
    mensaje: "Cuéntanos en una o dos líneas qué necesitas.",
    telefono: "Escribe un número de contacto válido, por ejemplo +56 9 1234 5678.",
    acepto: "Marca esta casilla para recibir las ofertas."
  };

  function mostrarError(campo, texto) {
    var caja = campo.closest(".campo");
    if (!caja) return;
    var error = caja.querySelector(".campo__error");
    caja.classList.toggle("tiene-error", Boolean(texto));
    if (texto) campo.setAttribute("aria-invalid", "true");
    else campo.removeAttribute("aria-invalid");
    if (error) error.textContent = texto || "";
  }

  function validarCampo(campo) {
    if (!campo.willValidate) return true;
    var valido = campo.checkValidity();
    mostrarError(campo, valido ? "" : (MENSAJES[campo.name] || "Revisa este campo."));
    return valido;
  }

  // Arma el mensaje de WhatsApp con texto plano (nunca se inserta como HTML).
  function armarWhatsApp(datos) {
    var lineas = [
      "Hola, quiero agendar un diagnóstico.",
      "",
      "Nombre: " + datos.get("nombre"),
      "Empresa: " + datos.get("empresa"),
      "Email: " + datos.get("email")
    ];
    if (datos.get("telefono")) lineas.push("Teléfono: " + datos.get("telefono"));
    if (datos.get("servicio")) lineas.push("Servicio: " + datos.get("servicio"));
    if (datos.get("presupuesto")) lineas.push("Presupuesto mensual: " + datos.get("presupuesto"));
    lineas.push("", String(datos.get("mensaje")));
    return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(lineas.join("\n"));
  }

  function iniciarFormulario() {
    var form = document.getElementById("form-contacto");
    if (!form) return;

    var estado = form.querySelector(".form__estado");
    var boton = form.querySelector('button[type="submit"]');
    var textoBoton = boton ? boton.textContent : "";
    var campos = form.querySelectorAll("input, select, textarea");

    // La validación propia reemplaza los globos del navegador.
    form.setAttribute("novalidate", "");

    campos.forEach(function (campo) {
      campo.addEventListener("blur", function () { validarCampo(campo); });
      campo.addEventListener("input", function () {
        if (campo.closest(".campo") && campo.closest(".campo").classList.contains("tiene-error")) {
          validarCampo(campo);
        }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      estado.textContent = "";
      estado.classList.remove("es-error");

      var primeroInvalido = null;
      campos.forEach(function (campo) {
        if (!validarCampo(campo) && !primeroInvalido) primeroInvalido = campo;
      });
      if (primeroInvalido) {
        estado.textContent = "Revisa los campos marcados antes de enviar.";
        estado.classList.add("es-error");
        primeroInvalido.focus();
        return;
      }

      var datos = new FormData(form);

      // Campo trampa: si un bot lo completa, se descarta en silencio.
      if (datos.get("_gotcha")) return;

      var destino = form.getAttribute("action") || "";
      var formspreeListo = destino.indexOf("formspree.io") !== -1 && destino.indexOf("TU_ID") === -1;

      // Sin Formspree configurado, el formulario se envía por WhatsApp.
      if (!formspreeListo) {
        window.location.href = armarWhatsApp(datos);
        return;
      }

      boton.disabled = true;
      boton.textContent = "Enviando…";

      fetch(destino, {
        method: "POST",
        body: datos,
        headers: { Accept: "application/json" }
      })
        .then(function (respuesta) {
          if (!respuesta.ok) throw new Error("Respuesta " + respuesta.status);
          window.location.href = CONFIG.paginaGracias;
        })
        .catch(function () {
          boton.disabled = false;
          boton.textContent = textoBoton;
          estado.textContent = "No pudimos enviar el formulario. Inténtalo de nuevo o escríbenos por WhatsApp.";
          estado.classList.add("es-error");
        });
    });
  }

  /* --- Pop-up de descuento --------------------------------------------- */
  var CLAVE_POPUP = "lc-popup-descuento";

  function leerPopup() {
    try { return JSON.parse(localStorage.getItem(CLAVE_POPUP) || "null"); } catch (e) { return null; }
  }
  function guardarPopup(estado) {
    try { localStorage.setItem(CLAVE_POPUP, JSON.stringify({ estado: estado, fecha: Date.now() })); } catch (e) {}
  }
  function debeMostrarPopup() {
    if (/gracias|404/.test(window.location.pathname)) return false;
    var guardado = leerPopup();
    if (!guardado) return true;
    if (guardado.estado === "registrado") return false;
    return Date.now() - guardado.fecha > CONFIG.popupDiasPausa * 86400000;
  }

  function iniciarPopup() {
    var dialogo = document.getElementById("popup-descuento");
    if (!dialogo || typeof dialogo.showModal !== "function" || !debeMostrarPopup()) return;

    var form = document.getElementById("form-popup");
    var ok = dialogo.querySelector(".popup__ok");
    var estado = form.querySelector(".form__estado");
    var boton = form.querySelector('button[type="submit"]');
    var campos = form.querySelectorAll("input:not(.trampa)");
    var mostrado = false;

    function abrir() {
      if (mostrado || document.querySelector(".nav.is-open")) return;
      mostrado = true;
      dialogo.showModal();
    }
    function cerrar() {
      if (dialogo.open) dialogo.close();
    }

    // Se muestra después de unos segundos o al recorrer la mitad de la página, lo que ocurra primero.
    var temporizador = setTimeout(abrir, CONFIG.popupSegundos * 1000);
    function alHacerScroll() {
      var alto = document.documentElement.scrollHeight - window.innerHeight;
      if (alto > 0 && window.scrollY / alto > 0.5) {
        window.removeEventListener("scroll", alHacerScroll);
        clearTimeout(temporizador);
        abrir();
      }
    }
    window.addEventListener("scroll", alHacerScroll, { passive: true });

    dialogo.addEventListener("click", function (e) {
      if (e.target.closest("[data-cerrar]") || e.target === dialogo) cerrar();
    });
    dialogo.addEventListener("close", function () {
      if (!leerPopup() || leerPopup().estado !== "registrado") guardarPopup("cerrado");
    });

    campos.forEach(function (campo) {
      campo.addEventListener("blur", function () { validarCampo(campo); });
      campo.addEventListener("input", function () {
        if (campo.closest(".campo").classList.contains("tiene-error")) validarCampo(campo);
      });
      campo.addEventListener("change", function () {
        if (campo.type === "checkbox") validarCampo(campo);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      estado.textContent = "";
      estado.classList.remove("es-error");

      var primeroInvalido = null;
      campos.forEach(function (campo) {
        if (!validarCampo(campo) && !primeroInvalido) primeroInvalido = campo;
      });
      if (primeroInvalido) { primeroInvalido.focus(); return; }

      var datos = new FormData(form);
      if (datos.get("_honey")) return;

      var cuerpo = {
        _subject: "Nuevo registro: descuento 5% (sitio web)",
        _template: "table",
        Nombre: datos.get("nombre"),
        Correo: datos.get("email"),
        Telefono: datos.get("telefono"),
        "Acepta ofertas": "Sí",
        Pagina: window.location.href
      };

      boton.disabled = true;
      boton.textContent = "Enviando…";

      // Teléfono para Brevo: prefijo de país aparte y número sin "+" ni espacios.
      var digitos = String(datos.get("telefono")).replace(/\D/g, "");
      var prefijo = "+56";
      if (digitos.indexOf("56") === 0 && digitos.length >= 11) digitos = digitos.slice(2);

      var brevo = new URLSearchParams();
      brevo.append("EMAIL", datos.get("email"));
      brevo.append("NOMBRE", datos.get("nombre"));
      brevo.append("SMS__COUNTRY_CODE", prefijo);
      brevo.append("SMS", digitos);
      brevo.append("email_address_check", "");
      brevo.append("locale", "es");
      brevo.append("html_type", "simple");

      // 1) Brevo: agrega el contacto a la lista (la respuesta no es legible desde otro dominio).
      var envioBrevo = fetch(CONFIG.brevoForm, { method: "POST", mode: "no-cors", body: brevo })
        .then(function () { return true; });

      // 2) FormSubmit: aviso por correo a info@leonettcommunity.com.
      var envioCorreo = fetch("https://formsubmit.co/ajax/" + CONFIG.popupDestino, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(cuerpo)
      })
        .then(function (r) { return r.json(); })
        .then(function (res) { return String(res.success) === "true"; })
        .catch(function () { return false; });

      Promise.all([envioBrevo.catch(function () { return false; }), envioCorreo])
        .then(function (resultados) {
          if (!resultados[0] && !resultados[1]) throw new Error("Sin envío");
          guardarPopup("registrado");
          dialogo.querySelector(".popup__paso").hidden = true;
          ok.hidden = false;
          ok.querySelector("button").focus();
        })
        .catch(function () {
          boton.disabled = false;
          boton.textContent = "Quiero mi 5% de descuento";
          estado.textContent = "No pudimos enviar tus datos. Inténtalo de nuevo o escríbenos por WhatsApp.";
          estado.classList.add("es-error");
        });
    });
  }

  /* --- Cupos del taller ------------------------------------------------- */
  function iniciarCupos() {
    var libres = Math.max(0, CONFIG.tallerCuposDisponibles);
    var total = CONFIG.tallerCuposTotales;
    document.querySelectorAll("[data-cupos-num]").forEach(function (el) { el.textContent = String(libres); });
    document.querySelectorAll("[data-cupos-barra]").forEach(function (el) {
      el.style.width = Math.round(((total - libres) / total) * 100) + "%";
    });
    if (libres === 1) {
      document.querySelectorAll("[data-cupos-texto]").forEach(function (el) {
        el.innerHTML = el.innerHTML.replace("Quedan", "Queda").replace(/(<\/strong>[^<]*?)cupos/, "$1cupo");
      });
    }
    if (libres === 0) {
      document.querySelectorAll("[data-si-cupos]").forEach(function (el) { el.hidden = true; });
      document.querySelectorAll("[data-sin-cupos]").forEach(function (el) { el.hidden = false; });
      document.querySelectorAll("[data-cupos-texto]").forEach(function (el) { el.textContent = "Cupos agotados"; });
      document.querySelectorAll(".ficha__cupos").forEach(function (el) { el.hidden = true; });
    }
  }

  /* --- Año del copyright -------------------------------------------------- */
  function iniciarAnio() {
    var el = document.getElementById("anio");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  document.addEventListener("DOMContentLoaded", function () {
    iniciarMenu();
    iniciarHeader();
    iniciarReveal();
    iniciarFormulario();
    iniciarPopup();
    iniciarCupos();
    iniciarAnio();
  });
})();
