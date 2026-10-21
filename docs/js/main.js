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
     Viene de la hoja "Promociones" del Sheet (vía la misma API del
     catálogo). Se pinta más abajo, junto con el catálogo, después de
     consultar la API (ver "Catálogo en vivo..." al final de este archivo).
     ============================================================ */
  var promoStrip = document.getElementById("promoStrip");

  function buildPromoImage(p) {
    var img = document.createElement("img");
    img.alt = p.nombre;
    img.loading = "lazy";
    if (p.imagen && /^https:\/\//i.test(p.imagen)) {
      img.referrerPolicy = "no-referrer"; // Drive rechaza la imagen sin esto
      img.src = p.imagen;
    } else if (p.imagen) {
      img.src = "assets/" + p.imagen;
    }
    return img;
  }

  function renderPromoStrip(promociones) {
    if (!promoStrip) return;
    promoStrip.innerHTML = "";
    promoStrip.className = "catalog-promos container";

    if (!promociones || !promociones.length) {
      promoStrip.classList.add("has-0");
      var empty = document.createElement("a");
      empty.className = "promo-card promo-empty";
      empty.target = "_blank";
      empty.rel = "noopener";
      empty.href = buildWhatsAppLink(WHATSAPP_MESSAGES.promos);
      var b1 = document.createElement("span"); b1.className = "promo-badge"; b1.textContent = "Ofertas";
      var n1 = document.createElement("span"); n1.className = "promo-name"; n1.textContent = "Muy pronto nuevas promociones";
      var c1 = document.createElement("span"); c1.className = "promo-cta"; c1.textContent = "Consúltanos por WhatsApp →";
      empty.appendChild(b1); empty.appendChild(n1); empty.appendChild(c1);
      promoStrip.appendChild(empty);
      return;
    }

    var promoEl = function (tag, cls, text) {
      var el = document.createElement(tag);
      if (cls) el.className = cls;
      if (text) el.textContent = text;
      return el;
    };
    var promoPrices = function (p) {
      var wrap = promoEl("span", "promo-prices");
      if (p.antes) wrap.appendChild(promoEl("s", "promo-old", p.antes));
      wrap.appendChild(promoEl("strong", "promo-new", p.ahora || ""));
      if (p.unidad) wrap.appendChild(promoEl("span", "promo-unit", p.unidad));
      if (p.nota) {
        var frag = document.createDocumentFragment();
        frag.appendChild(wrap);
        frag.appendChild(promoEl("span", "promo-note", p.nota));
        return frag;
      }
      return wrap;
    };

    // Una tarjeta por cada fila "Publicar = Si" del Sheet, todas del mismo
    // tamaño (2 por fila, 50% cada una). No hay límite de cuántas puede haber:
    // la grilla simplemente agrega más filas al agregar más promociones.
    promociones.forEach(function (p) {
      var card = promoEl("a", "promo-card");
      card.target = "_blank";
      card.rel = "noopener";
      card.href = buildWhatsAppLink(p.mensajeWhatsapp || ("Hola MACHES, me interesa la oferta de " + p.nombre + (p.ahora ? " a " + p.ahora + (p.unidad ? " " + p.unidad : "") : "") + ". ¿Sigue disponible?"));
      var cardMedia = promoEl("span", "promo-media");
      cardMedia.appendChild(buildPromoImage(p));
      var cardCopy = promoEl("span", "promo-copy");
      cardCopy.appendChild(promoEl("span", "promo-badge", p.badge || "Oferta"));
      cardCopy.appendChild(promoEl("span", "promo-name", p.nombre));
      cardCopy.appendChild(promoPrices(p));
      cardCopy.appendChild(promoEl("span", "promo-cta", "Ver oferta →"));
      card.appendChild(cardMedia);
      card.appendChild(cardCopy);
      promoStrip.appendChild(card);
    });
  }

  /* ============================================================
     Lineas de Negocio (hoja "LineasNegocio" del Sheet)
     ============================================================ */
  var unitsSection = document.getElementById("unitsSection");
  var unitsMenu = document.getElementById("unitsMenu");

  function slugify(text) {
    return String(text || "")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "unidad";
  }

  function buildUnitImage(src, alt) {
    var img = document.createElement("img");
    img.alt = alt || "";
    img.loading = "lazy";
    if (/^https:\/\//i.test(src)) {
      img.referrerPolicy = "no-referrer"; // Drive rechaza la imagen sin esto
      img.src = src;
    } else {
      img.src = "assets/" + src;
    }
    return img;
  }

  function buildUnitBlock(item, index) {
    var slug = slugify(item.titulo);
    var art = document.createElement("article");
    art.id = slug;
    art.className = "unit-block reveal" + (index % 2 === 1 ? " unit-block-alt" : "");

    var grid = document.createElement("div");
    grid.className = "container unit-grid";

    var visual = document.createElement("div");
    visual.className = "unit-visual";
    var imagenes = (item.imagenes || []).filter(Boolean);
    if (imagenes.length > 1) {
      visual.classList.add("unit-slideshow");
      imagenes.forEach(function (src, i) {
        var img = buildUnitImage(src, item.titulo);
        img.className = "unit-slide" + (i === 0 ? " is-active" : "");
        visual.appendChild(img);
      });
    } else if (imagenes.length === 1) {
      visual.appendChild(buildUnitImage(imagenes[0], item.titulo));
    }

    var copy = document.createElement("div");
    copy.className = "unit-copy";

    var kicker = document.createElement("p");
    kicker.className = "unit-kicker";
    var num = index + 1;
    kicker.textContent = "Unidad " + (num < 10 ? "0" + num : num);
    copy.appendChild(kicker);

    var h3 = document.createElement("h3");
    h3.className = "unit-title";
    var strong = document.createElement("strong");
    strong.className = "text-guinda";
    strong.textContent = item.marca || "";
    h3.appendChild(strong);
    if (item.titulo) {
      h3.appendChild(document.createTextNode(" "));
      var sep = document.createElement("span");
      sep.className = "unit-title-sep";
      sep.textContent = "|";
      h3.appendChild(sep);
      h3.appendChild(document.createTextNode(" " + item.titulo));
    }
    copy.appendChild(h3);

    if (item.texto) {
      var p = document.createElement("p");
      p.className = "unit-text";
      p.textContent = item.texto;
      copy.appendChild(p);
    }

    if (item.boton) {
      var cta = document.createElement("a");
      cta.className = "btn btn-primary";
      cta.target = "_blank";
      cta.rel = "noopener";
      cta.textContent = item.boton;
      cta.setAttribute("data-whatsapp-cta", "unidad-" + slug);
      cta.href = buildWhatsAppLink(item.mensajeWhatsapp || WHATSAPP_MESSAGES.pedido);
      copy.appendChild(cta);
    }

    grid.appendChild(visual);
    grid.appendChild(copy);
    art.appendChild(grid);
    return art;
  }

  function renderUnitsSection(lineas) {
    if (!unitsSection) return;
    unitsSection.innerHTML = "";
    if (unitsMenu) unitsMenu.innerHTML = "";
    if (!lineas || !lineas.length) return;

    lineas.forEach(function (item, i) {
      var block = buildUnitBlock(item, i);
      unitsSection.appendChild(block);
      if (unitsMenu && item.titulo) {
        var a = document.createElement("a");
        a.href = "#" + block.id;
        a.textContent = item.titulo;
        unitsMenu.appendChild(a);
      }
    });

    observeReveal(Array.prototype.slice.call(unitsSection.querySelectorAll(".reveal")));
    initUnitSlideshows(unitsSection);
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
     Hero slider (hoja "Hero" del Sheet)
     ============================================================ */
  var slides = [];
  var dots = [];
  var heroSection = document.querySelector(".hero");
  var heroTrack = document.getElementById("heroTrack");
  var heroDots = document.getElementById("heroDots");
  var heroCta = document.getElementById("heroCta");
  var current = 0;
  var AUTOPLAY_MS = 6000;
  var timer = null;

  // Respaldo por si el Sheet no devuelve ninguna fila publicada, para que
  // el banner nunca se vea vacío.
  var HERO_FALLBACK = [{
    titulo: "MACHES — Carnes Selectas y Ganadería Sostenible",
    boton: "Haz tu Pedido",
    mensajeWhatsapp: WHATSAPP_MESSAGES.pedido
  }];

  function applyHeroCta(slide) {
    if (!heroCta || !slide) return;
    heroCta.textContent = slide.getAttribute("data-cta-label") || "Haz tu Pedido";
    heroCta.setAttribute("data-whatsapp-cta", "hero");
    heroCta.setAttribute("href", buildWhatsAppLink(slide.getAttribute("data-cta-message") || WHATSAPP_MESSAGES.pedido));
  }

  function goTo(index) {
    if (!slides.length) return;
    slides[current].classList.remove("is-active");
    if (dots.length) { dots[current].classList.remove("is-active"); dots[current].setAttribute("aria-selected", "false"); }

    current = (index + slides.length) % slides.length;

    slides[current].classList.add("is-active");
    if (dots.length) { dots[current].classList.add("is-active"); dots[current].setAttribute("aria-selected", "true"); }
    applyHeroCta(slides[current]);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAutoplay() {
    stopAutoplay();
    if (slides.length > 1) timer = window.setInterval(next, AUTOPLAY_MS);
  }
  function stopAutoplay() {
    if (timer) { window.clearInterval(timer); timer = null; }
  }

  function buildHeroImage(src) {
    var img = document.createElement("img");
    img.className = "hero-slide-img";
    img.alt = "";
    if (src && /^https:\/\//i.test(src)) {
      img.referrerPolicy = "no-referrer"; // Drive rechaza la imagen sin esto
      img.src = src;
    } else if (src) {
      img.src = "assets/" + src;
    }
    return img;
  }

  // Convierte **texto** en <strong> (resaltado en rojo), sin usar innerHTML
  function buildHeroTitle(text) {
    var h2 = document.createElement("h2");
    h2.className = "hero-title";
    String(text || "").split(/\*\*(.+?)\*\*/g).forEach(function (part, i) {
      if (!part) return;
      if (i % 2 === 1) {
        var strong = document.createElement("strong");
        strong.textContent = part;
        h2.appendChild(strong);
      } else {
        h2.appendChild(document.createTextNode(part));
      }
    });
    return h2;
  }

  function renderHero(items) {
    if (!heroTrack) return;
    stopAutoplay();
    heroTrack.innerHTML = "";
    if (heroDots) heroDots.innerHTML = "";

    var list = (items && items.length) ? items : HERO_FALLBACK;

    list.forEach(function (item, i) {
      var art = document.createElement("article");
      art.className = "hero-slide" + (i === 0 ? " is-active" : "");
      art.setAttribute("role", "group");
      art.setAttribute("aria-roledescription", "diapositiva");
      art.setAttribute("aria-label", (i + 1) + " de " + list.length);
      art.setAttribute("data-cta-label", item.boton || "Haz tu Pedido");
      art.setAttribute("data-cta-message", item.mensajeWhatsapp || WHATSAPP_MESSAGES.pedido);
      if (item.imagen) art.appendChild(buildHeroImage(item.imagen));

      var content = document.createElement("div");
      content.className = "hero-content container";
      if (item.badge) {
        var badge = document.createElement("p");
        badge.className = "hero-badge";
        badge.textContent = item.badge;
        content.appendChild(badge);
      } else if (item.eyebrow) {
        var eyebrow = document.createElement("p");
        eyebrow.className = "hero-eyebrow";
        eyebrow.textContent = item.eyebrow;
        content.appendChild(eyebrow);
      }
      content.appendChild(buildHeroTitle(item.titulo));
      if (item.subtitulo) {
        var sub = document.createElement("p");
        sub.className = "hero-subtitle";
        sub.textContent = item.subtitulo;
        content.appendChild(sub);
      }
      art.appendChild(content);
      heroTrack.appendChild(art);

      if (heroDots) {
        var dot = document.createElement("button");
        dot.className = "hero-dot" + (i === 0 ? " is-active" : "");
        dot.type = "button";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
        dot.setAttribute("aria-label", "Ir a diapositiva " + (i + 1));
        dot.addEventListener("click", function () { goTo(i); startAutoplay(); });
        heroDots.appendChild(dot);
      }
    });

    slides = Array.prototype.slice.call(heroTrack.querySelectorAll(".hero-slide"));
    dots = heroDots ? Array.prototype.slice.call(heroDots.querySelectorAll(".hero-dot")) : [];
    current = 0;
    applyHeroCta(slides[0]);

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) startAutoplay();
  }

  // Interacciones del carrusel: se enganchan una sola vez a la sección (no
  // a los slides, que se regeneran cada vez que llega data nueva del Sheet).
  if (heroSection) {
    heroSection.addEventListener("mouseenter", stopAutoplay);
    heroSection.addEventListener("mouseleave", startAutoplay);

    var touchStartX = 0;
    heroSection.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    heroSection.addEventListener("touchend", function (e) {
      var delta = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(delta) > 40 && slides.length > 1) {
        delta < 0 ? next() : prev();
        startAutoplay();
      }
    }, { passive: true });

    heroSection.addEventListener("keydown", function (e) {
      if (slides.length < 2) return;
      if (e.key === "ArrowRight") { next(); startAutoplay(); }
      if (e.key === "ArrowLeft") { prev(); startAutoplay(); }
    });
  }

  /* ============================================================
     Scroll reveal (reusable: tambien se aplica a bloques que se
     generan despues, como las Lineas de Negocio)
     ============================================================ */
  var revealObserver = ("IntersectionObserver" in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 })
    : null;
  function observeReveal(els) {
    if (revealObserver) els.forEach(function (el) { revealObserver.observe(el); });
    else els.forEach(function (el) { el.classList.add("is-visible"); });
  }
  observeReveal(Array.prototype.slice.call(document.querySelectorAll(".reveal")));

  /* ============================================================
     Mini-slideshows de imagenes (unit-visual). Reusable para que
     tambien funcione en los bloques generados dinamicamente.
     ============================================================ */
  function initUnitSlideshows(root) {
    Array.prototype.slice.call((root || document).querySelectorAll(".unit-slideshow")).forEach(function (box) {
      var slides = Array.prototype.slice.call(box.querySelectorAll(".unit-slide"));
      if (slides.length < 2) return;
      var interval = parseInt(box.getAttribute("data-interval"), 10) || 3500;
      var i = 0;
      window.setInterval(function () {
        slides[i].classList.remove("is-active");
        i = (i + 1) % slides.length;
        slides[i].classList.add("is-active");
      }, interval);
    });
  }
  initUnitSlideshows(document);

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

    if (item.incluye) art.appendChild(buildLabeledParagraph("product-includes", "Detalle:", item.incluye));
    if (item.usos) art.appendChild(buildLabeledParagraph("product-uses", "Usos recomendados:", item.usos));

    var cta = document.createElement("a");
    cta.className = "btn btn-primary product-cta";
    cta.target = "_blank";
    cta.rel = "noopener";
    cta.textContent = "Cotizar";
    cta.setAttribute("data-whatsapp-product", item.nombre);
    cta.setAttribute("data-whatsapp-category", item.categoria);
    cta.href = buildWhatsAppLink(item.mensajeWhatsapp || ("Hola MACHES, me interesa cotizar y saber disponibilidad de: " + item.nombre + ". ¿Me brindan más detalles por favor?"));
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
    if (promoStrip) {
      promoStrip.innerHTML = "";
      promoStrip.className = "catalog-promos container";
      for (var j = 0; j < 3; j++) {
        var promoSkeleton = document.createElement("div");
        promoSkeleton.className = "promo-skeleton";
        promoStrip.appendChild(promoSkeleton);
      }
    }
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
      if (!parsed || !Array.isArray(parsed.productos)) return null;
      return {
        productos: parsed.productos,
        promociones: Array.isArray(parsed.promociones) ? parsed.promociones : [],
        lineasNegocio: Array.isArray(parsed.lineasNegocio) ? parsed.lineasNegocio : [],
        hero: Array.isArray(parsed.hero) ? parsed.hero : []
      };
    } catch (err) {
      return null; // localStorage no disponible (modo privado, etc.)
    }
  }

  function saveCatalogCache(data) {
    try {
      window.localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({
        productos: data.productos, promociones: data.promociones, lineasNegocio: data.lineasNegocio, hero: data.hero, ts: Date.now()
      }));
    } catch (err) { /* sin cache, no pasa nada grave */ }
  }

  var revealCatalog = function () {
    document.body.classList.add("prices-ready");
  };

  // El hero se muestra con el respaldo de inmediato (nunca vacío) y se
  // reemplaza solo cuando llega la data real del Sheet.
  renderHero(null);

  if (Object.keys(catalogGrids).length || promoStrip || unitsSection || heroTrack) {
    var cachedCatalog = loadCatalogCache();
    if (cachedCatalog) {
      renderCatalog(cachedCatalog.productos);
      renderPromoStrip(cachedCatalog.promociones);
      renderUnitsSection(cachedCatalog.lineasNegocio);
      renderHero(cachedCatalog.hero);
      revealCatalog();
    } else {
      showCatalogSkeletons();
    }

    if (window.fetch) {
      fetch(CATALOG_API)
        .then(function (res) { return res.json(); })
        .then(function (data) {
          renderCatalog(data.productos || []);
          renderPromoStrip(data.promociones || []);
          renderUnitsSection(data.lineasNegocio || []);
          renderHero(data.hero || []);
          saveCatalogCache(data);
          revealCatalog();
        })
        .catch(function (err) {
          console.warn("No se pudo cargar el catálogo en vivo:", err);
          if (!cachedCatalog) {
            showCatalogError();
            renderPromoStrip([]);
          }
          revealCatalog();
        });
    } else {
      revealCatalog();
    }
  }
})();
