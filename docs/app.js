(function () {
  const C = window.MENU_CONFIG || {};
  const T = Object.assign({ search: "Search…", open: "Open", tables: "Tables", phone: "Phone",
    unavailable: "sold out", empty: "Nothing found", loading: "Loading…", error: "Menu failed to load" }, C.texts);
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  document.documentElement.style.setProperty("--accent", C.accentColor || "#f24e1e");
  document.title = C.cafeName || "Menu";
  $("cafeName").textContent = C.cafeName || "";
  $("subtitle").textContent = C.subtitle || "";
  if (C.logo) { $("logo").src = C.logo; $("logo").hidden = false; }
  $("search").placeholder = T.search;
  $("menu").innerHTML = `<p class="status">${esc(T.loading)}</p>`;

  const chips = [];
  if (C.hours) chips.push(`<div class="chip open">${esc(T.open)}<small>${esc(C.hours)}</small></div>`);
  if (C.tables) chips.push(`<div class="chip">${esc(C.tables)}<small>${esc(T.tables)}</small></div>`);
  if (C.phone) chips.push(`<a class="chip" href="tel:${esc(C.phone.replace(/[^\d+]/g, ""))}">${esc(T.phone)}<small>${esc(C.phone)}</small></a>`);
  $("chips").innerHTML = chips.join("");

  // Простой CSV-парсер с поддержкой кавычек
  function parseCSV(text) {
    const rows = []; let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') q = false;
        else cell += ch;
      } else if (ch === '"') q = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    const head = (rows.shift() || []).map((h) => h.trim().toLowerCase());
    return rows.filter((r) => r.some((c) => c.trim()))
      .map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
  }

  const isOff = (v) => /^(no|нет|yox|0|false|-)$/i.test(v || "");
  const fmtPrice = (p) => { const n = Number(String(p).replace(",", ".")); return isNaN(n) ? p : n.toFixed(2); };

  const safeUrl = (u) => (/^(https?:\/\/|img\/)/i.test(u || "") ? u : "");

  function card(it) {
    it.photo = safeUrl(it.photo);
    const ph = it.photo
      ? `<img src="${esc(it.photo)}" alt="${esc(it.name)}" loading="lazy">`
      : esc((it.name || "?").trim().charAt(0).toUpperCase());
    return `<div class="item${isOff(it.available) ? " off" : ""}" data-off="${esc(T.unavailable)}" data-search="${esc((it.name + " " + (it.description || "")).toLocaleLowerCase())}">
      <div class="ph">${ph}</div>
      <h3>${esc(it.name)}</h3>
      ${it.description ? `<p>${esc(it.description)}</p>` : ""}
      ${it.price ? `<div class="price">${esc(fmtPrice(it.price))}${esc(C.currency || "")}</div>` : ""}
    </div>`;
  }

  function render(items) {
    const groups = new Map();
    items.forEach((it) => {
      const cat = it.category || "—";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(it);
    });
    const cats = [...groups.keys()];
    $("tabs").innerHTML = cats.map((c, i) => `<a href="#cat-${i}">${esc(c)}</a>`).join("");
    $("menu").innerHTML = cats.map((c, i) => `
      <section id="cat-${i}"><h2>${esc(c)}</h2><div class="grid">${groups.get(c).map(card).join("")}</div></section>`).join("")
      + `<p class="status" id="nothing" hidden>${esc(T.empty)}</p>`;
    setupTabs();
  }

  let updateTabs = () => {};
  function setupTabs() {
    const links = [...document.querySelectorAll(".tabs a")];
    let cur = null;
    updateTabs = () => {
      const secs = [...document.querySelectorAll("section:not([hidden])")];
      let active = secs[0];
      secs.forEach((s) => { if (s.getBoundingClientRect().top <= 90) active = s; });
      if (!active || active === cur) return;
      cur = active;
      links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + active.id));
      const a = links.find((l) => l.classList.contains("active"));
      a && a.parentNode.scrollTo({ left: a.offsetLeft - 60, behavior: "smooth" });
    };
    window.addEventListener("scroll", updateTabs, { passive: true });
    updateTabs();
  }

  $("searchBtn").addEventListener("click", () => {
    const s = $("search"), open = s.hidden;
    s.hidden = !open; $("tabs").hidden = open;
    if (open) s.focus(); else { s.value = ""; s.dispatchEvent(new Event("input")); }
  });

  $("search").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLocaleLowerCase();
    let total = 0;
    document.querySelectorAll("section").forEach((s) => {
      let any = false;
      s.querySelectorAll(".item").forEach((it) => {
        const ok = !q || it.dataset.search.includes(q);
        it.hidden = !ok; any = any || ok; total += ok;
      });
      s.hidden = !any;
    });
    const n = $("nothing"); if (n) n.hidden = total > 0;
  });

  $("menu").addEventListener("click", (e) => {
    if (e.target.tagName !== "IMG") return;
    const z = document.createElement("div");
    z.className = "zoom"; z.innerHTML = `<img src="${esc(e.target.src)}">`;
    z.onclick = () => z.remove();
    document.body.appendChild(z);
  });

  const f = [];
  if (C.address) f.push(C.mapUrl ? `📍 <a href="${esc(C.mapUrl)}" target="_blank" rel="noopener noreferrer">${esc(C.address)}</a>` : `📍 ${esc(C.address)}`);
  if (C.instagram) f.push(`<a href="${esc(C.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a>`);
  if (C.whatsapp) f.push(`<a href="https://wa.me/${esc(C.whatsapp)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`);
  $("footer").innerHTML = f.join("<br>");

  const load = (url) => fetch(url).then((r) => { if (!r.ok) throw 0; return r.text(); })
    .then((t) => { const items = parseCSV(t); if (!items.length || !("name" in items[0])) throw 0; return items; });
  const sheet = C.sheetCsvUrl ? load(C.sheetCsvUrl + (C.sheetCsvUrl.includes("?") ? "&" : "?") + "t=" + Date.now()) : Promise.reject();
  const local = load("menu.csv");
  sheet.then((items) => local.then((loc) => {
      // Если в таблице нет фото, берём его из menu.csv в репозитории (по названию)
      const photos = new Map(loc.filter((i) => i.photo).map((i) => [i.name.trim().toLowerCase(), i.photo]));
      items.forEach((i) => { if (!i.photo) i.photo = photos.get((i.name || "").trim().toLowerCase()) || ""; });
      return items;
    }, () => items), () => local)
    .then(render)
    .catch(() => { $("menu").innerHTML = `<p class="status">${esc(T.error)}</p>`; });
})();
