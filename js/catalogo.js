// Draws the catalogue pages from window.CATALOGO (js/productos.js).
// index.html -> renderHome(); casa.html?c=<slug> -> renderHouse().

const PLACEHOLDER = "img/logos/prime-sello.png";

// Contact details (same as "Datos de la empresa" in the management app).
const CONTACT = {
  phone: "+34 673 473 114",
  whatsapp: "34673473114",            // international number without "+" or spaces, for wa.me links
  email: "administracion@chacinasprime.com",
  instagram: "marc_chacinas",
};

function whatsappLink(text) {
  return `https://wa.me/${CONTACT.whatsapp}` + (text ? `?text=${encodeURIComponent(text)}` : "");
}

const INSTAGRAM_URL = `https://www.instagram.com/${CONTACT.instagram}/`;

// Simple line icons (inline SVG, so the site loads nothing from other websites).
const ICONS = {
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.3 21.7l4.8-1.3A9.8 9.8 0 1 0 12 2.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.7 7.4c.3-.5.6-.5.9-.5h.6c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.5.7c-.1.2-.2.3 0 .6.5.9 1.2 1.6 2.1 2.1.3.2.4.2.6 0l.7-.8c.2-.2.4-.2.6-.1l1.9.9c.3.1.4.3.4.5 0 .5-.2 1.4-1 1.9-.8.5-1.9.6-3.5-.1-2-.9-3.6-2.6-4.5-4.2-.7-1.5-.5-2.7.3-3.5z" fill="currentColor"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2.1-2.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  email: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
};

function icon(name) {
  const span = el("span", { class: "icon" });
  span.innerHTML = ICONS[name];
  return span;
}

// Product photo shown next to the introduction (cut out, transparent background). Houses without one show only their logo.
const HOUSE_PHOTOS = {
  "casalba": "img/fotos/casalba-cecina-recorte.webp",
  "obach": "img/fotos/obach-embutidos-recorte.webp",
};

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "text") node.textContent = value;
    else if (key === "class") node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) if (child) node.append(child);
  return node;
}

function countProducts(house) {
  return house.categories.reduce((total, cat) => total + cat.products.length, 0);
}

function renderHome() {
  const list = document.getElementById("houses");
  for (const house of window.CATALOGO) {
    list.append(el("a", { class: "house", href: `casa.html?c=${house.slug}` }, [
      el("div", { class: "logo" }, el("img", { src: `img/logos/${house.logo}`, alt: house.name })),
      el("h3", { text: house.name }),
      el("p", { text: house.tagline }),
      el("span", { class: "more", text: `Ver ${countProducts(house)} productos →` }),
    ]));
  }
}

function productPhoto(product, className) {
  const box = el("div", { class: product.image ? className : `${className} empty` });
  box.append(el("img", { src: product.image || PLACEHOLDER, alt: product.image ? product.name : "", loading: "lazy" }));
  return box;
}

function formatChip(format) {
  return [format.label, format.size].filter(v => v && v !== "—").join(" · ");
}

// Turns the price-list box code into plain words for customers:
// "C/12" -> "Caja de 12 unidades", "C/1-2" -> "Caja de 1 a 2 unidades", "C/4 o C/8" -> "Caja de 4 u 8 unidades",
// "C/10 kg" -> "Caja de 10 kg", "2 packs" -> "Caja de 2 packs".
function saleFormat(box) {
  if (!box) return "";
  if (!box.startsWith("C/")) return `Caja de ${box}`;
  const options = box.split(/\s*(?:\bo\b|ó|·)\s*/).map(part => part.replace(/^C\//, "").trim()).filter(Boolean);
  if (options.every(o => /^\d+$/.test(o))) {
    // Spanish uses "u" instead of "o" before a word starting with an "o" sound (8, 11...).
    const joined = options.reduce((text, o, i) => i === 0 ? o : `${text} ${/^(8|11)/.test(o) ? "u" : "o"} ${o}`, "");
    return `Caja de ${joined} ${options.length === 1 && options[0] === "1" ? "unidad" : "unidades"}`;
  }
  if (options.length === 1 && /^\d+-\d+$/.test(options[0])) {
    const [from, to] = options[0].split("-");
    return `Caja de ${from} a ${to} unidades`;
  }
  if (options.length === 1 && /^[\d,]+\s*kg$/i.test(options[0])) return `Caja de ${options[0]}`;
  // "C/2×0,5": two half pieces (Obach liver pâté)
  const halves = options.length === 1 && options[0].match(/^(\d+)\s*[×x]\s*0[,.]5$/i);
  if (halves) return `Caja de ${halves[1]} medias piezas`;
  return `Caja: ${box.replace(/^C\//, "")}`;
}

function normalise(text) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Short name of a product for its own link: "Turrón de yema con naranja y azahar" -> "turron-de-yema-con-naranja-y-azahar"
function productSlug(product) {
  return normalise(product.name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Address of the house page with this product already open (casa.html?c=<house>&p=<product>).
function productUrl(house, product) {
  const url = new URL(location.href);
  url.search = new URLSearchParams({ c: house.slug, p: productSlug(product) }).toString();
  url.hash = "";
  return url.toString();
}

function renderHouse() {
  const slug = new URLSearchParams(location.search).get("c");
  const house = window.CATALOGO.find(h => h.slug === slug);
  if (!house) { location.replace("index.html"); return; }

  document.title = `${house.name} · Catálogo Chacinas Prime`;
  document.getElementById("house-logo").src = `img/logos/${house.logo}`;
  document.getElementById("house-logo").alt = house.name;
  document.getElementById("house-name").textContent = house.name;
  document.getElementById("house-tagline").textContent = house.tagline;
  document.getElementById("house-intro").textContent = house.intro;
  const photo = document.getElementById("house-photo");
  if (HOUSE_PHOTOS[house.slug]) { photo.src = HOUSE_PHOTOS[house.slug]; photo.alt = house.name; }
  else photo.parentElement.remove();

  fillTopNav(house.slug);

  const chips = document.getElementById("chips");
  const container = document.getElementById("categories");
  const cards = [];
  for (const cat of house.categories) {
    chips.append(el("a", { href: `#${cat.slug}`, text: cat.name }));
    const grid = el("div", { class: "grid" });
    const section = el("section", { class: "category", id: cat.slug }, [
      el("h2", {}, [cat.name, el("small", { text: `${cat.products.length} productos` })]),
      grid,
    ]);
    for (const product of cat.products) {
      const card = el("button", { class: "card", type: "button" }, [
        productPhoto(product, "photo"),
        el("div", { class: "body" }, [
          el("h3", { text: product.name }),
          product.description ? el("p", { text: product.description }) : null,
          el("div", { class: "formats" }, product.formats.map(f => el("span", { text: formatChip(f) }))),
        ]),
      ]);
      card.addEventListener("click", () => openDetail(product, cat.name));
      grid.append(card);
      cards.push({ card, section, text: normalise(`${product.name} ${product.description} ${cat.name}`) });
    }
    container.append(section);
  }

  // Search filter
  const search = document.getElementById("search");
  search.addEventListener("input", () => {
    const query = normalise(search.value.trim());
    const visibleBySection = new Map();
    for (const { card, section, text } of cards) {
      const show = !query || text.includes(query);
      card.hidden = !show;
      visibleBySection.set(section, (visibleBySection.get(section) || 0) + (show ? 1 : 0));
    }
    let anyVisible = false;
    for (const [section, visible] of visibleBySection) {
      section.hidden = visible === 0;
      anyVisible ||= visible > 0;
    }
    document.getElementById("empty-search").style.display = anyVisible ? "none" : "block";
  });

  const dialog = document.getElementById("detail");
  document.getElementById("detail-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  // When the detail closes, the address goes back to the house page
  dialog.addEventListener("close", () => history.replaceState(null, "", `casa.html?c=${house.slug}`));
  document.getElementById("detail-share").addEventListener("click", shareProduct);

  // A link with a product (casa.html?c=...&p=...) opens that product straight away
  const wanted = new URLSearchParams(location.search).get("p");
  for (const cat of house.categories) {
    const product = cat.products.find(p => productSlug(p) === wanted);
    if (product) { openDetail(product, cat.name); break; }
  }
}

// "Compartir": the phone's share menu (WhatsApp, e-mail...) or, on a computer, copy the link.
let sharedProduct = null;
async function shareProduct() {
  if (!sharedProduct) return;
  const { house, product } = sharedProduct;
  const url = productUrl(house, product);
  const button = document.getElementById("detail-share");
  if (navigator.share) {
    try { await navigator.share({ title: product.name, text: `${product.name} · ${house.name}`, url }); } catch (e) { /* cancelled */ }
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    button.textContent = "Enlace copiado ✓";
  } catch (e) {
    window.prompt("Copia este enlace:", url);
  }
  setTimeout(() => { button.textContent = "Compartir"; }, 2500);
}

function openDetail(product, categoryName) {
  const photo = document.getElementById("detail-photo");
  photo.className = product.image ? "photo" : "photo empty";
  const img = photo.querySelector("img");
  img.src = product.image || PLACEHOLDER;
  img.alt = product.image ? product.name : "";
  document.getElementById("detail-category").textContent = categoryName;
  document.getElementById("detail-name").textContent = product.name;
  document.getElementById("detail-description").textContent = product.description || "";
  document.getElementById("detail-tags").replaceChildren(...(product.tags || []).map(t => el("span", { text: t })));

  // Longer text (history, tasting notes). Lines like "Nota de cata: ..." get their label in bold.
  const story = document.getElementById("detail-story");
  story.replaceChildren(...(product.story || "").split("\n").filter(Boolean).map(line => {
    const match = line.match(/^(Nota de cata:)\s*(.*)$/);
    return el("p", {}, match ? [el("strong", { text: match[1] }), " " + match[2]] : line);
  }));

  const formats = document.getElementById("detail-formats");
  document.getElementById("detail-formats-title").textContent =
    product.formats.length > 1 ? "Presentaciones" : "Presentación";
  // Formats with their own photo (e.g. each flavour) show a thumbnail; picking one swaps the big photo.
  const showPhoto = (src, button) => {
    img.src = src;
    formats.querySelectorAll("button.flavour").forEach(b => b.setAttribute("aria-pressed", String(b === button)));
  };
  formats.replaceChildren(...product.formats.map(f => {
    const text = [
      el("strong", { text: formatChip(f) }),
      f.box ? el("span", {}, [el("em", { text: "Formato de venta: " }), saleFormat(f.box).replace(/^C/, "c")]) : null,
    ];
    if (!f.image) return el("li", {}, text);
    const button = el("button", { type: "button", class: "flavour", "aria-pressed": "false", title: "Ver foto" }, [
      el("img", { src: f.image, alt: "", loading: "lazy" }), el("div", {}, text),
    ]);
    button.addEventListener("click", () => showPhoto(f.image, button));
    return el("li", { class: "has-photo" }, button);
  }));
  const house = window.CATALOGO.find(h => h.categories.some(c => c.products.includes(product)));
  sharedProduct = { house, product };
  document.getElementById("detail-whatsapp").href = whatsappLink(
    `Hola, me interesa ${product.name} de ${house.name} (${productUrl(house, product)}). ¿Me podéis dar precio y disponibilidad?`);
  history.replaceState(null, "", productUrl(house, product));
  const dialog = document.getElementById("detail");
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
}

// "Back to top" button, shown on every page once the visitor has scrolled down.
function addBackToTop() {
  const button = el("button", { class: "to-top", type: "button", "aria-label": "Volver arriba", title: "Volver arriba", text: "↑" });
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.body.append(button);
  const toggle = () => button.classList.toggle("visible", window.scrollY > 400);
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
}

// Top menu of the inner pages: the 4 houses and Contacto. `current` is a house slug or "contacto".
function fillTopNav(current) {
  const nav = document.getElementById("house-nav");
  if (!nav || nav.childElementCount) return;
  const links = window.CATALOGO.map(h => ({ key: h.slug, href: `casa.html?c=${h.slug}`, text: h.name }));
  links.push({ key: "contacto", href: "contacto.html", text: "Contacto" });
  for (const item of links) {
    const link = el("a", { href: item.href, text: item.text });
    if (item.key === current) link.setAttribute("aria-current", "page");
    nav.append(link);
  }
}

// On phones the top menu folds into a "Menú" button.
function setupMobileMenu() {
  const header = document.querySelector(".top");
  const nav = header && header.querySelector("nav");
  if (!nav) return;
  nav.id ||= "top-nav";
  const button = el("button", { class: "menu-toggle", type: "button", "aria-expanded": "false",
                                "aria-controls": nav.id, text: "Menú" });
  header.querySelector(".wrap").append(button);
  button.addEventListener("click", () => {
    const open = header.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", event => {
    if (event.target.closest("a")) { header.classList.remove("open"); button.setAttribute("aria-expanded", "false"); }
  });
}

// Social links in the footer (Instagram and WhatsApp icons).
function addFooterSocial() {
  const wrap = document.querySelector("footer .wrap");
  if (!wrap) return;
  wrap.append(el("span", { class: "social" }, [
    el("a", { href: INSTAGRAM_URL, target: "_blank", rel: "noopener", "aria-label": `Instagram @${CONTACT.instagram}`,
              title: `Instagram @${CONTACT.instagram}` }, icon("instagram")),
    el("a", { href: whatsappLink(), target: "_blank", rel: "noopener", "aria-label": "WhatsApp", title: "WhatsApp" },
       icon("whatsapp")),
  ]));
}

// Contact page (contacto.html).
function renderContact() {
  fillTopNav("contacto");
  const list = document.getElementById("contact-list");
  const items = [
    ["whatsapp", "WhatsApp", "Escríbenos y te respondemos lo antes posible.", "Abrir WhatsApp", whatsappLink("Hola, quería información sobre vuestros productos.")],
    ["phone", "Teléfono", CONTACT.phone, "Llamar", `tel:+${CONTACT.whatsapp}`],
    ["email", "Correo electrónico", CONTACT.email, "Escribir un correo", `mailto:${CONTACT.email}`],
    ["instagram", "Instagram", `@${CONTACT.instagram}`, "Ver perfil", INSTAGRAM_URL],
  ];
  for (const [name, title, text, action, href] of items) {
    const external = href.startsWith("http");
    list.append(el("a", { class: "contact-card", href, ...(external ? { target: "_blank", rel: "noopener" } : {}) }, [
      icon(name),
      el("h2", { text: title }),
      // let a long e-mail address wrap after the "@" instead of in the middle of a word
      el("p", {}, text.includes("@") && !text.startsWith("@")
        ? [text.split("@")[0] + "@", el("wbr"), text.split("@")[1]] : text),
      el("span", { class: "more", text: `${action} →` }),
    ]));
  }
}

// Each page says which content to draw with <body data-page="...">. (No inline scripts, so the pages can use a
// strict Content-Security-Policy that only allows our own files.)
const PAGES = { home: () => renderHome(), house: () => renderHouse(), contact: () => renderContact() };

document.addEventListener("DOMContentLoaded", () => {
  const render = PAGES[document.body.dataset.page];
  if (render) render();
  fillTopNav(null);
  setupMobileMenu();
  addFooterSocial();
  addBackToTop();
});
