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
    paginaGracias: "gracias.html"
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
    mensaje: "Cuéntanos en una o dos líneas qué necesitas."
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
    iniciarAnio();
  });
})();
