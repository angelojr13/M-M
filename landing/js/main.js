(function () {
  "use strict";

  /* ============================================================
     CONFIG
     ============================================================ */
  // Número real de WhatsApp Business de MACHES
  // Formato: código de país + número, sin "+", sin espacios
  var WHATSAPP_NUMBER = "51930968933";

  var WHATSAPP_MESSAGES = {
    header: "Hola MACHES, quisiera más información.",
    pedido: "Hola MACHES, quisiera hacer un pedido.",
    carnes: "Hola, quisiera cotizar un pedido de Carnes Selectas - MACHES.",
    herencia: "Hola, quisiera cotizar Herencia Orgánica - MACHES.",
    chancho: "Hola MACHES, quisiera reservar un lote de chancho por mayor.",
    footer: "Hola MACHES, quisiera más información."
  };

  function buildWhatsAppLink(message) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  }

  document.querySelectorAll("[data-whatsapp-cta]").forEach(function (el) {
    var key = el.getAttribute("data-whatsapp-cta");
    var message = WHATSAPP_MESSAGES[key] || WHATSAPP_MESSAGES.header;
    el.setAttribute("href", buildWhatsAppLink(message));
  });

  /* ============================================================
     Header: scrolled state + mobile menu
     ============================================================ */
  var header = document.getElementById("siteHeader");
  var onScrollHeader = function () {
    if (window.scrollY > 24) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  var menuToggle = document.getElementById("menuToggle");
  var mainNav = document.getElementById("mainNav");
  menuToggle.addEventListener("click", function () {
    var isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación");
  });
  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mainNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ============================================================
     Hero slider
     ============================================================ */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var heroSection = document.querySelector(".hero");
  var heroCta = document.getElementById("heroCta");
  var current = 0;
  var AUTOPLAY_MS = 6000;
  var timer = null;

  function applyHeroCta(slide) {
    if (!heroCta) return;
    var label = slide.getAttribute("data-cta-label") || "[ Haz tu Pedido ]";
    var key = slide.getAttribute("data-cta-key") || "pedido";
    var style = slide.getAttribute("data-cta-style") || "fucsia";
    heroCta.textContent = label;
    heroCta.setAttribute("data-whatsapp-cta", key);
    heroCta.setAttribute("href", buildWhatsAppLink(WHATSAPP_MESSAGES[key] || WHATSAPP_MESSAGES.pedido));
    heroCta.classList.toggle("btn-fucsia", style === "fucsia");
    heroCta.classList.toggle("btn-primary", style !== "fucsia");
  }

  function goTo(index) {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    dots[current].setAttribute("aria-selected", "false");

    current = (index + slides.length) % slides.length;

    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
    dots[current].setAttribute("aria-selected", "true");
    applyHeroCta(slides[current]);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  if (slides.length) applyHeroCta(slides[0]);

  function startAutoplay() {
    stopAutoplay();
    timer = window.setInterval(next, AUTOPLAY_MS);
  }
  function stopAutoplay() {
    if (timer) { window.clearInterval(timer); timer = null; }
  }

  if (slides.length > 1) {
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { goTo(i); startAutoplay(); });
    });

    heroSection.addEventListener("mouseenter", stopAutoplay);
    heroSection.addEventListener("mouseleave", startAutoplay);

    // Touch swipe
    var touchStartX = 0;
    heroSection.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    heroSection.addEventListener("touchend", function (e) {
      var delta = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(delta) > 40) {
        delta < 0 ? next() : prev();
        startAutoplay();
      }
    }, { passive: true });

    // Keyboard
    heroSection.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { next(); startAutoplay(); }
      if (e.key === "ArrowLeft") { prev(); startAutoplay(); }
    });

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) startAutoplay();
  }

  /* ============================================================
     Scroll reveal
     ============================================================ */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ============================================================
     Banner de cookies
     ============================================================ */
  var COOKIE_CONSENT_KEY = "mm_cookie_consent";
  try {
    if (localStorage.getItem(COOKIE_CONSENT_KEY) !== "accepted") {
      var banner = document.createElement("div");
      banner.className = "cookie-banner";
      banner.setAttribute("role", "region");
      banner.setAttribute("aria-label", "Aviso de cookies");
      banner.innerHTML =
        '<p>Usamos cookies propias para mejorar tu experiencia de navegación. ' +
        'Al continuar navegando aceptas nuestra ' +
        '<a href="politica-privacidad.html">Política de Privacidad</a>.</p>' +
        '<div class="cookie-banner-actions">' +
        '<button type="button" class="btn btn-fucsia" id="cookieAccept">Aceptar</button>' +
        "</div>";
      document.body.appendChild(banner);
      requestAnimationFrame(function () { banner.classList.add("is-visible"); });
      document.getElementById("cookieAccept").addEventListener("click", function () {
        try { localStorage.setItem(COOKIE_CONSENT_KEY, "accepted"); } catch (err) {}
        banner.classList.remove("is-visible");
        window.setTimeout(function () { banner.remove(); }, 400);
      });
    }
  } catch (err) {
    /* localStorage no disponible (modo privado, etc.) — no mostrar el banner */
  }

  /* ============================================================
     Libro de Reclamaciones: envío del formulario
     ============================================================ */
  var complaintForm = document.getElementById("complaintForm");
  if (complaintForm) {
    complaintForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // TODO: conectar a un backend/servicio de email real (por ahora solo
      // confirma en pantalla; los datos no se envían a ningún lado todavía).
      complaintForm.hidden = true;
      var success = document.getElementById("complaintSuccess");
      if (success) success.classList.add("is-visible");
    });
  }

  /* ============================================================
     Boletín: envío del formulario
     ============================================================ */
  var newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // TODO: conectar a un servicio real de email marketing (por ahora solo
      // confirma en pantalla; los datos no se envían a ningún lado todavía).
      var success = document.getElementById("newsletterSuccess");
      newsletterForm.reset();
      if (success) success.classList.add("is-visible");
    });
  }
})();
