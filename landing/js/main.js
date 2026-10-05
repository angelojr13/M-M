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
    catering: "Hola, quisiera cotizar el servicio de Catering Criollo - MACHES.",
    herencia: "Hola, quisiera cotizar Herencia Orgánica - MACHES.",
    chancho: "Hola MACHES, quisiera reservar un lote de chancho por mayor.",
    footer: "Hola MACHES, quisiera más información.",
    flotante: "Hola MACHES, quisiera más información.",
    promos: "Hola MACHES, quisiera saber sobre las promociones vigentes."
  };

  function buildWhatsAppLink(message) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  }

  document.querySelectorAll("[data-whatsapp-cta]").forEach(function (el) {
    var key = el.getAttribute("data-whatsapp-cta");
    var message = WHATSAPP_MESSAGES[key] || WHATSAPP_MESSAGES.header;
    el.setAttribute("href", buildWhatsAppLink(message));
  });

  document.querySelectorAll("[data-whatsapp-product]").forEach(function (el) {
    var product = el.getAttribute("data-whatsapp-product");
    el.setAttribute("href", buildWhatsAppLink("Hola MACHES, quisiera cotizar: " + product + "."));
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
     Menú desplegable "Productos"
     ============================================================ */
  var productsDropdown = document.getElementById("productsDropdown");
  var productsToggle = document.getElementById("productsToggle");
  if (productsDropdown && productsToggle) {
    productsToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = productsDropdown.classList.toggle("is-open");
      productsToggle.setAttribute("aria-expanded", String(isOpen));
    });
    document.addEventListener("click", function (e) {
      if (!productsDropdown.contains(e.target)) {
        productsDropdown.classList.remove("is-open");
        productsToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ============================================================
     Categorías circulares del catálogo (acordeón, cerrado por defecto)
     ============================================================ */
  var catButtons = Array.prototype.slice.call(document.querySelectorAll(".catalog-category-btn[data-target]"));
  var catBlocks = Array.prototype.slice.call(document.querySelectorAll(".catalog-category"));

  function openCategory(id) {
    catButtons.forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-target") === id); });
    catBlocks.forEach(function (c) { c.classList.toggle("is-open", c.id === id); });
  }

  catButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-target");
      if (btn.classList.contains("is-active")) {
        btn.classList.remove("is-active");
        var el = document.getElementById(targetId);
        if (el) el.classList.remove("is-open");
      } else {
        openCategory(targetId);
        var target = document.getElementById(targetId);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ============================================================
     Buscador de productos
     ============================================================ */
  var searchForm = document.getElementById("headerSearchForm");
  var searchInput = document.getElementById("productSearch");
  var searchResults = document.getElementById("searchResults");
  var productCards = Array.prototype.slice.call(document.querySelectorAll(".product-card[data-name]"));

  function clearHighlights() {
    productCards.forEach(function (card) { card.classList.remove("is-highlighted"); });
  }

  function highlightProduct(card) {
    clearHighlights();
    var catBlock = card.closest(".catalog-category");
    if (catBlock) openCategory(catBlock.id);
    card.classList.add("is-highlighted");
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(function () { card.classList.remove("is-highlighted"); }, 1800);
  }

  function renderSearchResults(query) {
    if (!searchResults) return;
    searchResults.innerHTML = "";
    if (!query) { searchResults.hidden = true; return; }
    var matches = productCards.filter(function (card) {
      return card.getAttribute("data-name").toLowerCase().indexOf(query) !== -1;
    });
    if (!matches.length) {
      var p = document.createElement("p");
      p.textContent = "Sin resultados para \"" + query + "\".";
      searchResults.appendChild(p);
    } else {
      matches.slice(0, 8).forEach(function (card) {
        var a = document.createElement("a");
        a.href = "#" + (card.closest(".catalog-category") ? card.closest(".catalog-category").id : "");
        a.textContent = card.getAttribute("data-name");
        a.addEventListener("click", function (e) {
          e.preventDefault();
          highlightProduct(card);
          searchResults.hidden = true;
          searchInput.blur();
        });
        searchResults.appendChild(a);
      });
    }
    searchResults.hidden = false;
  }

  if (searchForm && searchInput) {
    if (productCards.length) {
      // En index.html: filtra en vivo, sin recargar la página
      searchForm.addEventListener("submit", function (e) { e.preventDefault(); });
      searchInput.addEventListener("input", function () {
        renderSearchResults(searchInput.value.trim().toLowerCase());
      });
      document.addEventListener("click", function (e) {
        if (searchResults && !searchForm.contains(e.target)) searchResults.hidden = true;
      });

      // Si se llegó desde otra página con ?buscar=..., precarga el resultado
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("buscar");
      if (initialQuery) {
        searchInput.value = initialQuery;
        renderSearchResults(initialQuery.trim().toLowerCase());
      }
    }
    // En páginas sin catálogo (legales), el formulario navega normal a index.html?buscar=...
  }


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
     Mini-slideshows de imagenes (unit-visual)
     ============================================================ */
  document.querySelectorAll(".unit-slideshow").forEach(function (box) {
    var slides = Array.prototype.slice.call(box.querySelectorAll(".unit-slide"));
    if (slides.length < 2) return;
    var i = 0;
    window.setInterval(function () {
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active");
    }, 3000);
  });

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
