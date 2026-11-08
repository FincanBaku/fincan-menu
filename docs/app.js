(function () {
  const C = window.MENU_CONFIG || {};
  const T = Object.assign({
    search: "Search…", open: "Open", closed: "Closed", untilTime: "until {t}", opensAt: "opens at {t}",
    tables: "Tables", phone: "Phone", unavailable: "sold out", empty: "Nothing found",
    loading: "Loading…", error: "Menu failed to load", close: "Close", toTop: "Top",
    popular: "⭐ Popular", badgeHit: "🔥 Bestseller", badgeRec: "⭐ Recommended", badgeNew: "✨ New",
    findUs: "📍 How to find us", route: "Directions"
  }, C.texts);
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^(https?:\/\/|img\/)/i.test(u || "") ? u : "");
  const isOff = (v) => /^(no|нет|yox|0|false|-)$/i.test(v || "");
  const fmtPrice = (p) => { const n = Number(String(p).replace(",", ".")); return isNaN(n) ? p : n.toFixed(2); };
  // Метка из колонки badge → hit | rec | new | "" (любой другой текст игнорируется)
  function badgeType(v) {
    const s = String(v || "").trim().toLocaleLowerCase();
    if (!s) return "";
    if (/^(hit|хит|top|populyar|ən çox|en cox|bestseller)/.test(s)) return "hit";
    if (/^(t[oö]vsiy|rec|рекоменд)/.test(s)) return "rec";
    if (/^(yeni|new|новинк|нов)/.test(s)) return "new";
    return "";
  }
  const BADGE_TEXT = { hit: () => T.badgeHit, rec: () => T.badgeRec, new: () => T.badgeNew };
  const tagHtml = (it) => { const b = badgeType(it.badge); return b ? `<span class="tag tag-${b}">${esc(BADGE_TEXT[b]())}</span>` : ""; };

  /* ---------- Header ---------- */
  document.documentElement.style.setProperty("--accent", C.accentColor || "#f24e1e");
  document.title = C.cafeName || "Menu";
  $("cafeName").textContent = C.cafeName || "";
  $("subtitle").textContent = C.subtitle || "";
  // «Как нас найти» под названием: адрес + ссылка, которая плавно прокручивает к карте внизу
  if (C.location && isFinite(Number(C.location.lat)) && isFinite(Number(C.location.lng))) {
    $("findAddr").textContent = C.address || T.findUs;
    $("findGo").textContent = T.route + " ›";
    $("findLink").hidden = false;
    $("findLink").addEventListener("click", (e) => {
      const t = $("findUs"); if (!t) return;
      e.preventDefault(); t.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  if (C.logo) { $("logo").src = C.logo; $("logo").hidden = false; }
  $("search").placeholder = T.search;
  $("searchBtn").setAttribute("aria-label", T.search);
  $("toTop").setAttribute("aria-label", T.toTop);

  // Открыто/закрыто по текущему времени кафе (часы вида "12:00–02:00")
  function openState() {
    const m = String(C.hours || "").match(/(\d{1,2}):(\d{2})\s*[–\-—]\s*(\d{1,2}):(\d{2})/);
    if (!m) return null;
    const from = +m[1] * 60 + +m[2], to = +m[3] * 60 + +m[4];
    let now;
    try {
      const p = new Intl.DateTimeFormat("en-GB", { timeZone: C.timezone || undefined, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
      now = +p.find((x) => x.type === "hour").value * 60 + +p.find((x) => x.type === "minute").value;
    } catch (e) { const d = new Date(); now = d.getHours() * 60 + d.getMinutes(); }
    const open = from <= to ? now >= from && now < to : now >= from || now < to;
    const t = (v) => `${String(Math.floor(v / 60) % 24).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
    return open ? { open, label: T.open, sub: T.untilTime.replace("{t}", t(to)) }
                : { open, label: T.closed, sub: T.opensAt.replace("{t}", t(from)) };
  }
  // Иконки для плашек в шапке (часы / стол / телефон)
  const chipIc = (p) => `<i class="chip-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${p}</svg></i>`;
  const IC_CLOCK = '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';
  const IC_TABLE = '<rect x="3" y="7" width="18" height="3.5" rx="1"/><path d="M6 10.5V20M18 10.5V20M9 15h6"/>';
  const IC_PHONE = '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>';
  function renderChips() {
    const chips = [];
    const st = openState();
    if (st) chips.push(`<div class="chip ${st.open ? "is-open" : "is-closed"}">${chipIc(IC_CLOCK)}<span>${esc(st.label)}</span><small>${esc(st.sub)}</small></div>`);
    else if (C.hours) chips.push(`<div class="chip">${chipIc(IC_CLOCK)}<span>${esc(T.open)}</span><small>${esc(C.hours)}</small></div>`);
    if (C.tables) chips.push(`<div class="chip">${chipIc(IC_TABLE)}<span>${esc(C.tables)}</span><small>${esc(T.tables)}</small></div>`);
    if (C.phone) chips.push(`<a class="chip" href="tel:${esc(C.phone.replace(/[^\d+]/g, ""))}">${chipIc(IC_PHONE)}<span>${esc(T.phone)}</span><small>${esc(C.phone)}</small></a>`);
    $("chips").innerHTML = chips.join("");
  }
  renderChips();
  setInterval(renderChips, 60000);

  /* ---------- Skeleton while loading ---------- */
  const skel = `<div class="item skel"><div class="ph"></div><div class="line"></div><div class="line short"></div></div>`;
  $("menu").innerHTML = `<section><h2>&nbsp;</h2><div class="grid">${skel.repeat(6)}</div></section>`;

  /* ---------- CSV ---------- */
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
    // названия колонок без учёта регистра и пробелов; лишние колонки просто не используются
    const head = (rows.shift() || []).map((h) => h.trim().toLowerCase().replace(/\s+/g, ""));
    return rows.filter((r) => r.some((c) => c.trim()))
      .map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
  }

  /* ---------- Render ---------- */
  let ITEMS = [];
  const nameHtml = (it) => esc(it.name).replace(/\//g, "/<wbr>");  // перенос после «/»
  const letter = (it) => esc((it.name || "?").trim().charAt(0).toUpperCase());
  const priceTxt = (it) => (it.price ? `${esc(fmtPrice(it.price))} ${esc(C.currency || "")}` : "");

  function card(it, idx, mini) {
    it.photo = safeUrl(it.photo);
    const off = isOff(it.available);
    const ph = it.photo ? `<img src="${esc(it.photo)}" alt="${esc(it.name)}" loading="lazy" decoding="async">` : letter(it);
    return `<button type="button" class="item${mini ? " mini" : ""}${off ? " off" : ""}" data-i="${idx}" data-search="${esc((it.name + " " + (it.description || "")).toLocaleLowerCase())}">
      <div class="ph">${ph}${tagHtml(it)}</div>
      <h3>${nameHtml(it)}</h3>
      ${it.description && !mini ? `<p>${esc(it.description)}</p>` : ""}
      <div class="price">${priceTxt(it)}${off ? `<span class="badge">${esc(T.unavailable)}</span>` : ""}</div>
    </button>`;
  }

  function render(items) {
    ITEMS = items;
    const groups = new Map();
    items.forEach((it, i) => {
      const cat = it.category || "—";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(i);
    });
    const cats = [...groups.keys()];
    // «Populyar»: сначала хиты, потом рекомендуемые, потом новинки (внутри — в порядке меню)
    const rank = { hit: 0, rec: 1, new: 2 };
    const pop = items.map((it, i) => [i, badgeType(it.badge)]).filter(([, b]) => b)
      .sort((a, b) => rank[a[1]] - rank[b[1]] || a[0] - b[0]).map(([i]) => i);
    const popHtml = pop.length ? `
      <section id="cat-pop" class="popular"><h2>${esc(T.popular)}</h2>
        <div class="strip">${pop.map((idx) => card(items[idx], idx, true)).join("")}</div>
      </section>` : "";
    $("tabs").innerHTML = (pop.length ? `<a href="#cat-pop">${esc(T.popular)}</a>` : "") +
      cats.map((c, i) => `<a href="#cat-${i}">${esc(c)}</a>`).join("");
    $("menu").innerHTML = popHtml + cats.map((c, i) => `
      <section id="cat-${i}"><h2>${esc(c)} <small>${groups.get(c).length}</small></h2>
        <div class="grid">${groups.get(c).map((idx) => card(items[idx], idx)).join("")}</div>
      </section>`).join("") + `<p class="status" id="nothing" hidden>${esc(T.empty)}</p>`;
    // плавное появление фото; необычные пропорции — показываем целиком
    document.querySelectorAll(".item .ph img").forEach((img) => {
      const done = () => {
        img.classList.add("loaded");
        const r = img.naturalWidth / img.naturalHeight;
        if (r && Math.abs(r - 0.75) > 0.2) img.classList.add("fit");
      };
      img.complete && img.naturalWidth ? done() : img.addEventListener("load", done, { once: true });
    });
    setupTabs();
  }

  /* ---------- Tabs ---------- */
  let cur = null;
  function updateTabs() {
    const links = [...document.querySelectorAll(".tabs a")];
    const secs = [...document.querySelectorAll("section[id]:not([hidden])")];
    let active = secs[0];
    secs.forEach((s) => { if (s.getBoundingClientRect().top <= 100) active = s; });
    if (!active || active === cur) return;
    cur = active;
    links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + active.id));
    const a = links.find((l) => l.classList.contains("active"));
    a && a.parentNode.scrollTo({ left: a.offsetLeft - 60, behavior: "smooth" });
  }
  function setupTabs() { cur = null; updateTabs(); }
  window.addEventListener("scroll", () => {
    updateTabs();
    $("tabsWrap").classList.toggle("stuck", $("tabsWrap").getBoundingClientRect().top <= 0 && window.scrollY > 50);
    $("toTop").hidden = window.scrollY < 700;
  }, { passive: true });
  $("toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Search ---------- */
  $("searchBtn").addEventListener("click", () => {
    const s = $("search"), open = s.hidden;
    s.hidden = !open; $("tabs").hidden = open;
    if (open) s.focus(); else { s.value = ""; s.dispatchEvent(new Event("input")); }
  });
  $("search").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLocaleLowerCase();
    let total = 0;
    document.querySelectorAll("section[id]").forEach((s) => {
      if (s.classList.contains("popular")) { s.hidden = !!q; return; }  // при поиске ленту прячем
      let any = false;
      s.querySelectorAll(".item").forEach((it) => {
        const ok = !q || it.dataset.search.includes(q);
        it.hidden = !ok; any = any || ok; total += ok;
      });
      s.hidden = !any;
    });
    const n = $("nothing"); if (n) n.hidden = total > 0;
  });

  /* ---------- Item details (bottom sheet) ---------- */
  function openSheet(it) {
    const off = isOff(it.available);
    $("sheetBody").innerHTML = `
      ${it.photo ? `<img class="big" src="${esc(it.photo)}" alt="${esc(it.name)}">` : `<div class="big letter">${letter(it)}</div>`}
      <h3>${nameHtml(it)}${tagHtml(it)}${off ? `<span class="badge">${esc(T.unavailable)}</span>` : ""}</h3>
      ${it.description ? `<p>${esc(it.description)}</p>` : ""}
      ${it.price ? `<div class="price">${priceTxt(it)}</div>` : ""}`;
    $("sheet").hidden = false;
    document.body.classList.add("lock");
    $("sheet").querySelector(".sheet-close").focus({ preventScroll: true });
  }
  function closeSheet() { $("sheet").hidden = true; document.body.classList.remove("lock"); }
  $("menu").addEventListener("click", (e) => {
    const b = e.target.closest(".item[data-i]");
    if (b) openSheet(ITEMS[+b.dataset.i]);
  });
  $("sheet").addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeSheet(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("sheet").hidden) closeSheet(); });
  // свайп вниз закрывает
  let y0 = null;
  const panel = $("sheet").querySelector(".sheet-panel");
  panel.addEventListener("touchstart", (e) => { y0 = panel.scrollTop <= 0 ? e.touches[0].clientY : null; }, { passive: true });
  panel.addEventListener("touchend", (e) => { if (y0 !== null && e.changedTouches[0].clientY - y0 > 90) closeSheet(); y0 = null; }, { passive: true });

  /* ---------- Footer ---------- */
  const ic = (p) => `<span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg></span>`;
  const f = [];
  if (C.phone) f.push(`<a href="tel:${esc(C.phone.replace(/[^\d+]/g, ""))}">${ic('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>')}${esc(C.phone)}</a>`);
  if (C.whatsapp) f.push(`<a href="https://wa.me/${esc(C.whatsapp)}" target="_blank" rel="noopener noreferrer">${ic('<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z"/>')}WhatsApp</a>`);
  if (C.instagram) f.push(`<a href="${esc(safeUrl(C.instagram))}" target="_blank" rel="noopener noreferrer">${ic('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5"/>')}Instagram</a>`);
  const hasMap = C.location && isFinite(Number(C.location.lat)) && isFinite(Number(C.location.lng));
  if (C.address && !hasMap) f.push(`<a href="${esc(safeUrl(C.mapUrl) || "#")}" target="_blank" rel="noopener noreferrer">${ic('<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>')}${esc(C.address)}</a>`);
  // Карта + маршрут: кнопки открывают приложение и строят путь от текущего места гостя до кафе
  let mapHtml = "";
  const lat = Number(C.location && C.location.lat), lng = Number(C.location && C.location.lng);
  if (isFinite(lat) && isFinite(lng) && (lat || lng)) {
    const ll = `${lat},${lng}`;
    const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${ll}`;
    const waze = `https://waze.com/ul?ll=${ll}&navigate=yes`;
    mapHtml = `<div class="map-card" id="findUs">
      <h2>${esc(T.findUs)}</h2>
      ${C.address ? `<p class="map-addr">${esc(C.address)}</p>` : ""}
      <div class="map-frame"><iframe src="https://www.google.com/maps?q=${ll}&z=16&output=embed" title="${esc(T.findUs)}"
        loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
      <div class="route-btns">
        <a class="route gmaps" href="${gmaps}" target="_blank" rel="noopener noreferrer">${ic('<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>')}<span>${esc(T.route)}<small>Google Maps</small></span></a>
        <a class="route waze" href="${waze}" target="_blank" rel="noopener noreferrer">${ic('<path d="M3 11l18-8-8 18-2-8-8-2z"/>')}<span>${esc(T.route)}<small>Waze</small></span></a>
      </div>
    </div>`;
  }
  $("footer").innerHTML = mapHtml + (f.length ? `<div class="foot-card">${f.join("")}</div>` : "") + `<div class="foot-note">© ${new Date().getFullYear()} ${esc(C.cafeName || "")}</div>`;

  /* ---------- Load data ---------- */
  const load = (url) => fetch(url, { cache: "no-cache" }).then((r) => { if (!r.ok) throw 0; return r.text(); })
    .then((t) => { const items = parseCSV(t); if (!items.length || !("name" in items[0])) throw 0; return items; });
  const sheet = C.sheetCsvUrl ? load(C.sheetCsvUrl + (C.sheetCsvUrl.includes("?") ? "&" : "?") + "t=" + Date.now()) : Promise.reject();
  const local = load("menu.csv");
  sheet.then((items) => local.then((loc) => {
      // Дополняем таблицу данными из menu.csv в репозитории (по названию блюда):
      //  • фото — если ячейка photo пустая;
      //  • метки — только если в таблице вообще нет колонки badge (если есть — таблица главная).
      const key = (i) => (i.name || "").trim().toLowerCase();
      const byName = new Map(loc.map((i) => [key(i), i]));
      const sheetHasBadge = "badge" in items[0];
      items.forEach((i) => {
        const l = byName.get(key(i)) || {};
        if (!i.photo) i.photo = l.photo || "";
        if (!sheetHasBadge) i.badge = l.badge || "";
      });
      return items;
    }, () => items), () => local)
    .then(render)
    .catch(() => { $("menu").innerHTML = `<p class="status">${esc(T.error)}</p>`; });
})();
