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
    sorteo: "Hola MACHES, quiero comprar para participar en el sorteo y ganar el Pack Chicharronero. ¿Cómo participo?",
    footer: "Hola MACHES, quisiera más información.",
    flotante: "Hola MACHES, quisiera más información.",
    promos: "Hola MACHES, quiero ver las promociones vigentes."
  };

  // Ofertas que se muestran bajo los círculos del catálogo.
  // La primera siempre va en la tarjeta grande, la segunda en la tarjeta
  // pequeña (no rotan, son fijas). Precios tomados de la propuesta de
  // catálogo (Catalogo_Propuesta_MACHES.xlsx). Para cambiarlas solo edita
  // esta lista. "antesLabel", "nota", "badge" y "mensajeWhatsapp" son
  // opcionales ("mensajeWhatsapp" reemplaza el mensaje automático de
  // WhatsApp por uno a medida, útil para sorteos o promos que no son solo
  // un cambio de precio).
  // Ejemplo de una oferta:
  // { nombre: "Chuleta de lomo", antes: "S/ 22.00", ahora: "S/ 20.90", unidad: "x kg", imagen: "assets/hero-oferta-chancho.jpg" },
  // Mientras la lista esté vacía se muestra un recuadro de "Ofertas – Muy pronto".
  var PROMOCIONES = [
    {
      nombre: "Miércoles 23/12 sorteamos un Pack Chicharronero",
      ahora: "¡Compra y participa!",
      nota: "¡Por cada compra reclama tu ticket! Pack Chicharronero (valorizado en S/ 89.90): incluye 1.5 kg de panceta + 1 kg de chuleta + 1 kg de brazuelo trozado + 250 g de manteca.",
      badge: "Sorteo Navideño",
      imagen: "assets/pack-chicharronero.jpg",
      mensajeWhatsapp: "Hola MACHES, quiero comprar para participar en el sorteo y ganar el Pack Chicharronero. ¿Cómo participo?"
    },
    {
      nombre: "Chuleta de Pierna",
      antes: "S/ 18.90",
      ahora: "S/ 16.90",
      unidad: "el kg",
      badge: "OFERTA SEMANAL",
      imagen: "assets/chuleta-de-pierna.jpg",
      mensajeWhatsapp: "Hola MACHES, quiero aprovechar la Chuleta de Pierna a S/ 16.90 el kg. ¿Está disponible?"
    }
  ];

  function buildWhatsAppLink(message) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  }

  // Manda un evento a Google Analytics (GA4) si gtag ya está cargado.
  // Sin GA4 conectado (ID real en vez del de prueba) esto no hace nada,
  // pero el código queda listo para cuando se conecte.
  function trackEvent(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params);
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

  // Mide en Google Analytics (GA4) cada clic en un botón de WhatsApp,
  // sea el CTA fijo del header/hero/footer o un botón de producto/promo
  // (incluye los que se generan dinámicamente, como las tarjetas de
  // ofertas y productos). "product_category" permite ver el interés por
  // línea de negocio (Packs, Porcino, Res, Cordero, Cabrito, Derivados),
  // no solo por producto suelto.
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    var link = e.target.closest("[data-whatsapp-cta], [data-whatsapp-product]");
    if (!link) return;
    trackEvent("whatsapp_click", {
      cta_location: link.getAttribute("data-whatsapp-cta") || "producto",
      product_name: link.getAttribute("data-whatsapp-product") || undefined,
      product_category: link.getAttribute("data-whatsapp-category") || undefined
    });
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
    // El menú móvil se abre justo debajo del header, mida lo que mida
    if (isOpen) mainNav.style.top = Math.round(header.getBoundingClientRect().bottom) + "px";
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
        // Embudo: cuántos ABREN una categoría (ven productos) vs cuántos de
        // esos terminan en "whatsapp_click" con esa misma product_category.
        trackEvent("ver_categoria", { categoria: targetId.replace(/^cat-/, "") });
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
      var targetId = link.getAttribute("href").slice(1);
      openCategory(targetId);
      trackEvent("ver_categoria", { categoria: targetId.replace(/^cat-/, "") });
    });
  });

  /* ============================================================
     Franja de ofertas (bajo los círculos del catálogo)
     ============================================================ */
  var promoStrip = document.getElementById("promoStrip");
  if (promoStrip && !PROMOCIONES.length) {
    promoStrip.classList.add("has-0-side");
    promoStrip.innerHTML =
      '<a class="promo-main promo-empty" target="_blank" rel="noopener" href="' + buildWhatsAppLink(WHATSAPP_MESSAGES.promos) + '">' +
      '<span class="promo-badge">Ofertas</span>' +
      '<span class="promo-name">Muy pronto nuevas promociones</span>' +
      '<span class="promo-cta">Consúltanos por WhatsApp →</span></a>';
  }
  if (promoStrip && PROMOCIONES.length) {
    var promoEl = function (tag, cls, text) {
      var el = document.createElement(tag);
      if (cls) el.className = cls;
      if (text) el.textContent = text;
      return el;
    };
    var promoPrices = function (p) {
      var wrap = promoEl("span", "promo-prices");
      if (p.antesLabel) wrap.appendChild(promoEl("span", "promo-old-label", p.antesLabel));
      if (p.antes) wrap.appendChild(promoEl("s", "promo-old", p.antes));
      wrap.appendChild(promoEl("strong", "promo-new", p.ahora));
      if (p.unidad) wrap.appendChild(promoEl("span", "promo-unit", p.unidad));
      if (p.nota) {
        var frag = document.createDocumentFragment();
        frag.appendChild(wrap);
        frag.appendChild(promoEl("span", "promo-note", p.nota));
        return frag;
      }
      return wrap;
    };

    // Rectángulo grande: siempre la primera oferta de la lista (fija, no rota)
    var principal = PROMOCIONES[0];
    var promoMain = promoEl("a", "promo-main");
    promoMain.href = buildWhatsAppLink(principal.mensajeWhatsapp || WHATSAPP_MESSAGES.promos);
    promoMain.target = "_blank";
    promoMain.rel = "noopener";
    var mainMedia = promoEl("span", "promo-media");
    mainMedia.style.backgroundImage = "url('" + principal.imagen + "')";
    var mainCopy = promoEl("span", "promo-copy");
    mainCopy.appendChild(promoEl("span", "promo-badge", principal.badge || "Oferta"));
    mainCopy.appendChild(promoEl("span", "promo-name", principal.nombre));
    mainCopy.appendChild(promoPrices(principal));
    mainCopy.appendChild(promoEl("span", "promo-cta", "Quiero ver las promociones →"));
    promoMain.appendChild(mainMedia);
    promoMain.appendChild(mainCopy);
    promoStrip.appendChild(promoMain);

    // Cuadritos a la derecha: el resto de ofertas de la lista (fijas, no rotan)
    var promoSide = [];
    for (var k = 1; k < PROMOCIONES.length; k++) {
      var p = PROMOCIONES[k];
      var card = promoEl("a", "promo-card");
      card.target = "_blank";
      card.rel = "noopener";
      card.href = buildWhatsAppLink(p.mensajeWhatsapp || ("Hola MACHES, me interesa la oferta de " + p.nombre + " a " + p.ahora + (p.unidad ? " " + p.unidad : "") + ". ¿Sigue disponible?"));
      var cardMedia = promoEl("span", "promo-media");
      cardMedia.style.backgroundImage = "url('" + p.imagen + "')";
      var cardCopy = promoEl("span", "promo-copy");
      cardCopy.appendChild(promoEl("span", "promo-badge promo-badge-sm", p.badge || "Oferta"));
      cardCopy.appendChild(promoEl("span", "promo-name", p.nombre));
      cardCopy.appendChild(promoPrices(p));
      card.appendChild(cardMedia);
      card.appendChild(cardCopy);
      promoStrip.appendChild(card);
      promoSide.push(card);
    }
    promoStrip.classList.add("has-" + promoSide.length + "-side");
  }

  /* ============================================================
     Buscador de productos
     ============================================================ */
  var searchForm = document.getElementById("headerSearchForm");
  var searchInput = document.getElementById("productSearch");
  var searchResults = document.getElementById("searchResults");
  var catalogRoot = document.querySelector(".catalog-categories");

  // Las tarjetas ahora las genera el catálogo dinámico (ver más abajo) después
  // de consultar la API, así que no podemos guardarlas en un array fijo acá
  // arriba: todavía no existen en el momento en que corre este script.
  // Por eso se consultan de nuevo cada vez que hacen falta.
  function getProductCards() {
    return Array.prototype.slice.call(document.querySelectorAll(".product-card[data-name]"));
  }

  function clearHighlights() {
    getProductCards().forEach(function (card) { card.classList.remove("is-highlighted"); });
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
    var matches = getProductCards().filter(function (card) {
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
    if (catalogRoot) {
      // En index.html: filtra en vivo, sin recargar la página
      searchForm.addEventListener("submit", function (e) { e.preventDefault(); });
      var searchTrackTimer = null;
      searchInput.addEventListener("input", function () {
        var query = searchInput.value.trim().toLowerCase();
        renderSearchResults(query);
        // Qué busca la gente (con un respiro para no mandar un evento por
        // cada letra mientras escriben).
        window.clearTimeout(searchTrackTimer);
        if (query.length >= 2) {
          searchTrackTimer = window.setTimeout(function () {
            trackEvent("buscar_producto", { termino: query });
          }, 600);
        }
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
    var interval = parseInt(box.getAttribute("data-interval"), 10) || 3000;
    var i = 0;
    window.setInterval(function () {
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active");
    }, interval);
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

  /* ============================================================
     Catálogo en vivo desde Google Sheets
     Fuente: Catalogo_Propuesta_MACHES (vía Apps Script, solo lectura).
     El HTML NO tiene tarjetas escritas a mano: todas se arman acá a partir
     de lo que devuelve la API, así que un producto nuevo en el Sheet (con
     "Publicar en landing" = Sí) aparece solo, sin tocar código.
     Cambia "Precio propuesto (S/)", "Publicar en landing", "Qué incluye"
     (solo hoja Packs) o "Uso recomendado" en el Sheet y se refleja aquí
     al recargar la página.
     Columna "Imagen": pega un link de Google Drive para que la foto
     se cargue desde ahí (el archivo debe estar compartido como
     "Cualquiera con el enlace - Lector"); el Apps Script lo convierte
     solo a la URL directa. También acepta el nombre de un archivo que
     ya exista en landing/assets/.
     Columna "categoria" (la pone la API, no el Sheet): dice en qué
     contenedor "cat-<categoria>" va cada producto.

     Para que no se note la carga (nada de "flash" con datos viejos): la
     primera vez que llega el catálogo se guarda en localStorage, y en
     las siguientes visitas se pinta ESE catálogo de inmediato (antes de
     llamar a la API) mientras se revisa en segundo plano si cambió algo.
     ============================================================ */
  var CATALOG_API =
    "https://script.google.com/macros/s/AKfycbyE8ayGaWK9XD9i-8yy3vMA5jCRaresObRdfzaAXE5tzmcLjlc3FKgXjDP0TXeCXkbyIA/exec";
  var CATALOG_CACHE_KEY = "maches_catalog_v1";

  // Mapa "categoria" -> <div class="catalog-grid"> donde van sus tarjetas,
  // armado una sola vez a partir de los contenedores "cat-<categoria>" que
  // ya existen en el HTML (esos sí son fijos; solo su contenido es dinámico).
  var catalogGrids = {};
  Array.prototype.slice.call(document.querySelectorAll(".catalog-category[id^='cat-']")).forEach(function (block) {
    var grid = block.querySelector(".catalog-grid");
    if (grid) catalogGrids[block.id.slice(4)] = grid;
  });

  // Reconstruye un <p><strong>Etiqueta:</strong> texto</p> sin usar innerHTML,
  // porque "texto" viene del Sheet (lo puede editar cualquiera con acceso).
  function buildLabeledParagraph(cls, label, text) {
    var p = document.createElement("p");
    p.className = cls;
    var strong = document.createElement("strong");
    strong.textContent = label;
    p.appendChild(strong);
    p.appendChild(document.createTextNode(" " + text));
    return p;
  }

  function buildProductImage(item) {
    if (item.imagen && /^https:\/\//i.test(item.imagen)) {
      var wrap = document.createElement("div");
      wrap.className = "product-img";
      var img = document.createElement("img");
      img.loading = "lazy";
      img.width = 500;
      img.height = 500;
      img.alt = item.nombre + " MACHES";
      // URL de Drive ya convertida por el Apps Script. Sin "no-referrer"
      // Google la rechaza (manda un Referer que no le gusta).
      img.referrerPolicy = "no-referrer";
      img.src = item.imagen;
      wrap.appendChild(img);
      return wrap;
    }
    if (item.imagen && /^[\w.-]+\.(jpg|jpeg|png|webp)$/i.test(item.imagen)) {
      var wrap2 = document.createElement("div");
      wrap2.className = "product-img";
      var img2 = document.createElement("img");
      img2.loading = "lazy";
      img2.width = 500;
      img2.height = 500;
      img2.alt = item.nombre + " MACHES";
      img2.src = "assets/" + item.imagen; // nombre de archivo dentro de /assets
      wrap2.appendChild(img2);
      return wrap2;
    }
    // Sin foto todavía (p. ej. un producto recién agregado al Sheet):
    // recuadro placeholder en vez de una imagen rota.
    var placeholder = document.createElement("div");
    placeholder.className = "product-img-placeholder";
    var span = document.createElement("span");
    span.textContent = "Foto próximamente";
    placeholder.appendChild(span);
    return placeholder;
  }

  function buildProductCard(item) {
    var art = document.createElement("article");
    art.className = "product-card";
    art.setAttribute("data-id", item.id);
    art.setAttribute("data-name", item.nombre);
    art.appendChild(buildProductImage(item));

    var h4 = document.createElement("h4");
    h4.className = "product-name";
    h4.textContent = item.nombre;
    art.appendChild(h4);

    var priceP = document.createElement("p");
    priceP.className = "product-price";
    var labelSpan = document.createElement("span");
    labelSpan.className = "product-price-label";
    labelSpan.textContent = "Precio referencial:";
    var valueSpan = document.createElement("span");
    valueSpan.className = "product-price-value";
    valueSpan.textContent = (typeof item.precio === "number" && item.precio > 0)
      ? "S/ " + item.precio.toFixed(2)
      : "Según tu selección";
    priceP.appendChild(labelSpan);
    priceP.appendChild(document.createTextNode(" "));
    priceP.appendChild(valueSpan);
    art.appendChild(priceP);

    var saleNote = document.createElement("p");
    saleNote.className = "product-sale-note";
    saleNote.textContent = "Cotización según Volumen";
    art.appendChild(saleNote);

    if (item.incluye) art.appendChild(buildLabeledParagraph("product-includes", "Incluye:", item.incluye));
    if (item.usos) art.appendChild(buildLabeledParagraph("product-uses", "Usos recomendados:", item.usos));

    var cta = document.createElement("a");
    cta.className = "btn btn-primary product-cta";
    cta.target = "_blank";
    cta.rel = "noopener";
    cta.textContent = "Cotizar";
    cta.setAttribute("data-whatsapp-product", item.nombre);
    cta.setAttribute("data-whatsapp-category", item.categoria);
    cta.href = buildWhatsAppLink("Hola MACHES, me interesa cotizar y saber disponibilidad de: " + item.nombre + ". ¿Me brindan más detalles por favor?");
    art.appendChild(cta);

    return art;
  }

  function forEachGrid(fn) {
    Object.keys(catalogGrids).forEach(function (key) { fn(catalogGrids[key], key); });
  }

  function showCatalogSkeletons() {
    forEachGrid(function (grid) {
      grid.innerHTML = "";
      for (var i = 0; i < 4; i++) {
        var skeleton = document.createElement("div");
        skeleton.className = "product-card-skeleton";
        grid.appendChild(skeleton);
      }
    });
  }

  function showCatalogError() {
    forEachGrid(function (grid) {
      grid.innerHTML = "";
      var p = document.createElement("p");
      p.className = "catalog-error";
      p.appendChild(document.createTextNode("No pudimos cargar el catálogo. "));
      var a = document.createElement("a");
      a.href = buildWhatsAppLink(WHATSAPP_MESSAGES.pedido);
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Escríbenos por WhatsApp";
      p.appendChild(a);
      grid.appendChild(p);
    });
  }

  function renderCatalog(items) {
    var byCategory = {};
    items.forEach(function (item) {
      if (!item.publicar || !item.categoria) return;
      (byCategory[item.categoria] || (byCategory[item.categoria] = [])).push(item);
    });
    forEachGrid(function (grid, key) {
      grid.innerHTML = "";
      var list = byCategory[key] || [];
      list.forEach(function (item) { grid.appendChild(buildProductCard(item)); });
      if (!list.length) {
        var p = document.createElement("p");
        p.className = "catalog-empty";
        p.textContent = "Muy pronto nuevos productos en esta categoría.";
        grid.appendChild(p);
      }
    });
  }

  function loadCatalogCache() {
    try {
      var raw = window.localStorage.getItem(CATALOG_CACHE_KEY);
      var parsed = raw && JSON.parse(raw);
      return (parsed && Array.isArray(parsed.items)) ? parsed.items : null;
    } catch (err) {
      return null; // localStorage no disponible (modo privado, etc.)
    }
  }

  function saveCatalogCache(items) {
    try {
      window.localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ items: items, ts: Date.now() }));
    } catch (err) { /* sin cache, no pasa nada grave */ }
  }

  var revealCatalog = function () {
    document.body.classList.add("prices-ready");
  };

  if (Object.keys(catalogGrids).length) {
    var cachedCatalog = loadCatalogCache();
    if (cachedCatalog && cachedCatalog.length) {
      renderCatalog(cachedCatalog);
      revealCatalog();
    } else {
      showCatalogSkeletons();
    }

    if (window.fetch) {
      fetch(CATALOG_API)
        .then(function (res) { return res.json(); })
        .then(function (items) {
          renderCatalog(items);
          saveCatalogCache(items);
          revealCatalog();
        })
        .catch(function (err) {
          console.warn("No se pudo cargar el catálogo en vivo:", err);
          if (!cachedCatalog) showCatalogError();
          revealCatalog();
        });
    } else {
      revealCatalog();
    }
  }
})();
