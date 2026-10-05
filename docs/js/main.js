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
    pedido: "Hola MACHES, deseo información y cotización general de \"nuestros productos\".",
    carnes: "Hola MACHES, deseo información y cotización general de \"carnes de selección\".",
    catering: "Hola MACHES, deseo información y cotización general de \"catering criollo\".",
    herencia: "Hola MACHES, deseo información y cotización general de \"abono orgánico\".",
    chancho: "Hola MACHES, deseo información y cotización general de \"lote de chancho por mayor\".",
    footer: "Hola MACHES, quisiera más información.",
    flotante: "Hola MACHES, quisiera más información.",
    promos: "Hola MACHES, quiero ver las promociones vigentes."
  };

  // Ofertas que se muestran bajo los círculos del catálogo (rotan cada 3 segundos).
  // Para cambiarlas solo edita esta lista: nombre, precio antes, precio ahora, unidad e imagen.
  var PROMOCIONES = [
    { nombre: "Chuleta de Lomo de Cerdo", antes: "S/ 25.00", ahora: "S/ 22.00", unidad: "x kg", imagen: "assets/hero-oferta-chancho.jpg" },
    { nombre: "Pack Chicharronero", antes: "S/ 75.00", ahora: "S/ 65.00", unidad: "el pack", imagen: "assets/hero-carnes-selectas-bandejas.jpg" },
    { nombre: "Hamburguesas Artesanales", antes: "S/ 28.00", ahora: "S/ 25.00", unidad: "paquete x 4", imagen: "assets/maches-productos-granja.jpg" }
  ];
  var PROMO_INTERVAL_MS = 3000;

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
    el.setAttribute("href", buildWhatsAppLink("Hola MACHES, me interesa cotizar y saber disponibilidad de: " + product + ". ¿Me brindan más detalles por favor?"));
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
  var setMenuOpen = function (isOpen) {
    mainNav.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación");
  };
  menuToggle.addEventListener("click", function () {
    setMenuOpen(!mainNav.classList.contains("is-open"));
  });
  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setMenuOpen(false); });
  });
  // Cierra el menú móvil al tocar fuera del recuadro o al presionar Escape
  document.addEventListener("click", function (e) {
    if (mainNav.classList.contains("is-open") && !mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
      setMenuOpen(false);
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mainNav.classList.contains("is-open")) setMenuOpen(false);
  });

  /* ============================================================
     Menús desplegables del nav ("Productos", "Líneas de Negocio")
     ============================================================ */
  Array.prototype.slice.call(document.querySelectorAll(".nav-dropdown")).forEach(function (dropdown) {
    var toggle = dropdown.querySelector(".nav-dropdown-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.querySelectorAll(".nav-dropdown.is-open").forEach(function (other) {
        if (other !== dropdown) {
          other.classList.remove("is-open");
          var otherToggle = other.querySelector(".nav-dropdown-toggle");
          if (otherToggle) otherToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
    document.addEventListener("click", function (e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* ============================================================
     Categorías circulares del catálogo (acordeón, cerrado por defecto)
     ============================================================ */
  var catButtons = Array.prototype.slice.call(document.querySelectorAll(".catalog-category-btn[data-target]"));
  var catBlocks = Array.prototype.slice.call(document.querySelectorAll(".catalog-category"));

  var catCloseMs = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 260;

  function openCategory(id) {
    catButtons.forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-target") === id); });
    catBlocks.forEach(function (c) {
      window.clearTimeout(c._closeTimer);
      c.classList.remove("is-closing");
      c.classList.toggle("is-open", c.id === id);
    });
  }

  // Cierra la categoría abierta con animación (el .is-closing la desvanece antes de ocultarla)
  function closeCategories() {
    catButtons.forEach(function (b) { b.classList.remove("is-active"); });
    catBlocks.forEach(function (c) {
      if (!c.classList.contains("is-open") || c.classList.contains("is-closing")) return;
      c.classList.add("is-closing");
      c._closeTimer = window.setTimeout(function () {
        c.classList.remove("is-open", "is-closing");
      }, catCloseMs);
    });
  }

  catButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-target");
      if (btn.classList.contains("is-active")) {
        closeCategories();
      } else {
        openCategory(targetId);
        var target = document.getElementById(targetId);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Clic fuera del recuadro de la categoría (y fuera de los círculos y del header) la cierra
  document.addEventListener("click", function (e) {
    if (e.target.closest(".catalog-category, .catalog-category-btn, #siteHeader")) return;
    closeCategories();
  });

  // Enlaces del menú "Productos" del header: tambien deben abrir la categoría
  document.querySelectorAll('#productsMenu a[href^="#cat-"]').forEach(function (link) {
    link.addEventListener("click", function () {
      openCategory(link.getAttribute("href").slice(1));
    });
  });

  /* ============================================================
     Franja de ofertas (bajo los círculos del catálogo)
     ============================================================ */
  var promoStrip = document.getElementById("promoStrip");
  if (promoStrip && PROMOCIONES.length) {
    var promoEl = function (tag, cls, text) {
      var el = document.createElement(tag);
      if (cls) el.className = cls;
      if (text) el.textContent = text;
      return el;
    };
    var promoPrices = function (p) {
      var wrap = promoEl("span", "promo-prices");
      if (p.antes) wrap.appendChild(promoEl("s", "promo-old", p.antes));
      wrap.appendChild(promoEl("strong", "promo-new", p.ahora));
      if (p.unidad) wrap.appendChild(promoEl("span", "promo-unit", p.unidad));
      return wrap;
    };

    // Rectángulo grande: imágenes que se van alternando
    var promoMain = promoEl("a", "promo-main");
    promoMain.href = buildWhatsAppLink(WHATSAPP_MESSAGES.promos);
    promoMain.target = "_blank";
    promoMain.rel = "noopener";
    var promoSlides = PROMOCIONES.map(function (p, i) {
      var slide = promoEl("span", "promo-slide" + (i === 0 ? " is-active" : ""));
      slide.style.backgroundImage = "url('" + p.imagen + "')";
      var copy = promoEl("span", "promo-slide-copy");
      copy.appendChild(promoEl("span", "promo-name", p.nombre));
      copy.appendChild(promoPrices(p));
      slide.appendChild(copy);
      promoMain.appendChild(slide);
      return slide;
    });
    promoMain.appendChild(promoEl("span", "promo-badge", "Ofertas"));
    promoMain.appendChild(promoEl("span", "promo-cta", "Quiero ver las promociones →"));
    var promoDots = promoEl("span", "promo-dots");
    PROMOCIONES.forEach(function () { promoDots.appendChild(promoEl("span", "promo-dot")); });
    promoMain.appendChild(promoDots);
    promoStrip.appendChild(promoMain);

    // Cuadritos a la derecha: las siguientes ofertas de la lista
    var promoSide = [];
    for (var k = 1; k <= Math.min(2, PROMOCIONES.length - 1); k++) {
      var card = promoEl("a", "promo-card");
      card.target = "_blank";
      card.rel = "noopener";
      promoStrip.appendChild(card);
      promoSide.push(card);
    }
    promoStrip.classList.add("has-" + promoSide.length + "-side");

    var promoIndex = 0;
    var renderPromos = function () {
      promoSlides.forEach(function (s, i) { s.classList.toggle("is-active", i === promoIndex); });
      Array.prototype.forEach.call(promoDots.children, function (d, i) { d.classList.toggle("is-active", i === promoIndex); });
      promoSide.forEach(function (card, k) {
        var p = PROMOCIONES[(promoIndex + k + 1) % PROMOCIONES.length];
        card.href = buildWhatsAppLink("Hola MACHES, me interesa la oferta de " + p.nombre + " a " + p.ahora + (p.unidad ? " " + p.unidad : "") + ". ¿Sigue disponible?");
        card.style.backgroundImage = "url('" + p.imagen + "')";
        card.innerHTML = "";
        card.appendChild(promoEl("span", "promo-badge promo-badge-sm", "Oferta"));
        card.appendChild(promoEl("span", "promo-name", p.nombre));
        card.appendChild(promoPrices(p));
        card.classList.remove("is-swapping");
        void card.offsetWidth; // reinicia la animación de entrada
        card.classList.add("is-swapping");
      });
    };
    renderPromos();

    var promoTimer = null;
    var startPromos = function () {
      if (PROMOCIONES.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      window.clearInterval(promoTimer);
      promoTimer = window.setInterval(function () {
        promoIndex = (promoIndex + 1) % PROMOCIONES.length;
        renderPromos();
      }, PROMO_INTERVAL_MS);
    };
    promoStrip.addEventListener("mouseenter", function () { window.clearInterval(promoTimer); });
    promoStrip.addEventListener("mouseleave", startPromos);
    startPromos();
  }

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

  /* ============================================================
     Formulario de Contacto: arma el mensaje y abre WhatsApp
     ============================================================ */
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nombre = contactForm.nombre.value.trim();
      var correo = contactForm.correo.value.trim();
      var empresa = contactForm.empresa.value.trim();
      var ruc = contactForm.ruc.value.trim();
      var telefono = contactForm.telefono.value.trim();
      var mensaje = contactForm.mensaje.value.trim();

      var lines = ["Hola MACHES, quisiera hacer una consulta.", "Nombre: " + nombre];
      if (empresa) lines.push("Empresa: " + empresa);
      if (ruc) lines.push("RUC: " + ruc);
      lines.push("Teléfono: " + telefono);
      lines.push("Correo: " + correo);
      lines.push("Mensaje: " + mensaje);

      window.open(buildWhatsAppLink(lines.join("\n")), "_blank", "noopener");

      var success = document.getElementById("contactFormSuccess");
      contactForm.reset();
      if (success) success.classList.add("is-visible");
    });
  }
})();
