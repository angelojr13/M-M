(function () {
  "use strict";

  /* ============================================================
     CONFIG — reemplazar antes de publicar
     ============================================================ */
  // TODO: reemplazar con el número real de WhatsApp Business de M&M Agropecuario
  // Formato: código de país + número, sin "+", sin espacios (ej: "51987654321")
  var WHATSAPP_NUMBER = "51900000000";

  var WHATSAPP_MESSAGES = {
    header: "Hola M&M Agropecuario, quisiera más información.",
    catalogo: "Hola M&M Agropecuario, quisiera solicitar su catálogo de productos.",
    anguss: "Hola, quisiera cotizar un pedido de carnes con Anguss - M&M Agropecuario.",
    herencia: "Hola, quisiera solicitar la ficha técnica de Herencia Orgánica - M&M Agropecuario.",
    footer: "Hola M&M Agropecuario, quisiera más información."
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
  var current = 0;
  var AUTOPLAY_MS = 6000;
  var timer = null;

  function goTo(index) {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    dots[current].setAttribute("aria-selected", "false");

    current = (index + slides.length) % slides.length;

    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
    dots[current].setAttribute("aria-selected", "true");
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

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
})();
