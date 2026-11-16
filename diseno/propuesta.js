/* ==========================================================================
   Leonett Community — Propuesta visual (Fase 2)
   GSAP + ScrollTrigger (alojados en /js/vendor, la política de seguridad no
   permite CDN). Solo se animan transform y opacity: nunca provocan reflow.
   Si el visitante pide "reducir movimiento" o GSAP no carga, todo se muestra
   sin animación.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var q = function (s, c) { return (c || document).querySelector(s); };
  var qa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Año del pie -------------------------------------------------------- */
  var anio = q("#anio");
  if (anio) anio.textContent = new Date().getFullYear();

  /* --- Navegación: fondo al hacer scroll y menú móvil --------------------- */
  var nav = q("#nav");
  var visible = false;
  function pintarNav() {
    var debe = window.scrollY > 24;
    if (debe !== visible) { visible = debe; nav.classList.toggle("is-scrolled", debe); }
  }
  window.addEventListener("scroll", pintarNav, { passive: true });
  pintarNav();

  var boton = q(".nav__btn");
  var menu = q("#menu");
  function cerrarMenu() {
    menu.classList.remove("is-open");
    boton.setAttribute("aria-expanded", "false");
    boton.setAttribute("aria-label", "Abrir menú");
  }
  boton.addEventListener("click", function () {
    var abierto = menu.classList.toggle("is-open");
    boton.setAttribute("aria-expanded", String(abierto));
    boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) cerrarMenu(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("is-open")) { cerrarMenu(); boton.focus(); }
  });
  window.matchMedia("(min-width: 960px)").addEventListener("change", function (e) { if (e.matches) cerrarMenu(); });

  /* --- Tarjetas: luz que sigue al cursor (solo con mouse) ------------------ */
  if (window.matchMedia("(hover: hover)").matches) {
    qa("[data-card]").forEach(function (card) {
      var pendiente = false, x = 0, y = 0;
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        x = e.clientX - r.left; y = e.clientY - r.top;
        if (pendiente) return;
        pendiente = true;
        requestAnimationFrame(function () {
          card.style.setProperty("--mx", x + "px");
          card.style.setProperty("--my", y + "px");
          pendiente = false;
        });
      });
    });
  }

  /* --- Sin movimiento: todo visible y termina aquí ------------------------- */
  if (reducir || !window.gsap || !window.ScrollTrigger) {
    root.classList.add("no-motion");
    qa("[data-paso]").forEach(function (p) { p.classList.add("is-activo"); });
    q("#pasos").style.setProperty("--prog", "1");
    return;
  }

  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  root.classList.add("anim");

  /* --- Hero: entrada con texto que se revela por líneas -------------------- */
  var tl = gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.15 });
  tl.fromTo("[data-hero].eyebrow", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 })
    .fromTo("[data-split]", { yPercent: 105 }, { yPercent: 0, duration: 1.1, stagger: 0.12 }, "-=0.5")
    .fromTo(".hero .lead", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9 }, "-=0.7")
    .fromTo(".hero .acciones", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9 }, "-=0.7")
    .fromTo(".hero .confianza", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.6");

  /* --- Hero: palabra que cambia (clientes, consultas, ventas) -------------- */
  var palabras = qa(".rota__p");
  if (palabras.length > 1) {
    var actual = 0;
    gsap.set(palabras, { opacity: 0, yPercent: 40 });
    gsap.set(palabras[0], { opacity: 1, yPercent: 0 });
    palabras.forEach(function (p) { p.classList.remove("is-on"); });
    gsap.delayedCall(3.2, function ciclo() {
      var siguiente = (actual + 1) % palabras.length;
      gsap.to(palabras[actual], { opacity: 0, yPercent: -40, duration: 0.45, ease: "power2.in" });
      gsap.fromTo(palabras[siguiente], { opacity: 0, yPercent: 40 }, { opacity: 1, yPercent: 0, duration: 0.6, ease: "power3.out", delay: 0.3 });
      actual = siguiente;
      gsap.delayedCall(2.8, ciclo);
    });
  }

  /* --- Hero: parallax moderado del fondo ----------------------------------- */
  var parallax = { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 };
  gsap.to(".blob--rojo", { y: 140, scrollTrigger: parallax });
  gsap.to(".blob--oro", { y: -90, scrollTrigger: parallax });
  gsap.to(".anillo--1", { rotation: 50, y: 60, scrollTrigger: parallax });
  gsap.to(".anillo--2", { rotation: -70, y: -40, scrollTrigger: parallax });

  /* --- Aparición al hacer scroll (títulos de sección, tarjetas, cifras) ---- */
  window.ScrollTrigger.batch("[data-rev]", {
    start: "top 88%", once: true,
    onEnter: function (lote) {
      gsap.fromTo(lote, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.95, stagger: 0.12, ease: "power3.out", overwrite: true });
    }
  });
  window.ScrollTrigger.batch("[data-card]", {
    start: "top 90%", once: true,
    onEnter: function (lote) {
      gsap.fromTo(lote, { opacity: 0, y: 52 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out", overwrite: true });
    }
  });

  /* --- Contadores ---------------------------------------------------------- */
  qa("[data-count]").forEach(function (el) {
    var meta = Number(el.getAttribute("data-count"));
    var obj = { v: 0 };
    el.textContent = "0";
    window.ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: function () {
        gsap.to(obj, {
          v: meta, duration: 1.8, ease: "power2.out",
          onUpdate: function () { el.textContent = String(Math.round(obj.v)); },
          onComplete: function () { el.textContent = String(meta); }
        });
      }
    });
  });

  /* --- Metodología: línea de progreso ligada al scroll --------------------- */
  var pasos = q("#pasos");
  window.ScrollTrigger.create({
    trigger: pasos, start: "top 65%", end: "bottom 60%", scrub: true,
    onUpdate: function (self) { pasos.style.setProperty("--prog", self.progress.toFixed(3)); }
  });
  qa("[data-paso]").forEach(function (paso) {
    window.ScrollTrigger.create({
      trigger: paso, start: "top 68%",
      toggleClass: { targets: paso, className: "is-activo" }
    });
  });
})();
