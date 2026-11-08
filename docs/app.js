(function () {
  const C = window.MENU_CONFIG || {};

  /* ---------- Языки / тексты ---------- */
  const LANGS = Array.isArray(C.languages) && C.languages.length ? C.languages : ["az"];
  const BASE = LANGS[0];  // язык основных колонок таблицы (name, description, category)
  const DEFAULT_T = {
    search: "Search…", open: "Open", closed: "Closed", untilTime: "until {t}", opensAt: "opens at {t}",
    tables: "Tables", phone: "Phone", unavailable: "sold out", empty: "Nothing found",
    error: "Menu failed to load", close: "Close", toTop: "Top",
    popular: "⭐ Popular", badgeHit: "🔥 Bestseller", badgeRec: "⭐ Recommended", badgeNew: "✨ New",
    findUs: "📍 How to find us", route: "Directions",
    igTitle: "Follow us on Instagram", igFollow: "Follow"
  };
  const LS_KEY = "menu-lang";
  let lang = BASE;
  try { const s = localStorage.getItem(LS_KEY); if (LANGS.includes(s)) lang = s; } catch (e) { /* приватный режим */ }
  let T = {};
  function setTexts() {
    const all = C.texts || {};
    const perLang = LANGS.some((l) => all[l] && typeof all[l] === "object");
    T = perLang ? Object.assign({}, DEFAULT_T, all[BASE], all[lang]) : Object.assign({}, DEFAULT_T, all);
  }
  setTexts();

  /* ---------- Утилиты ---------- */
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^(https?:\/\/|img\/)/i.test(u || "") ? u : "");
  const isOff = (v) => /^(no|нет|yox|0|false|-)$/i.test(v || "");
  // 22 → «22», 1.5 → «1.50»
  const fmtPrice = (p) => {
    const s = String(p ?? "").trim(), n = Number(s.replace(",", "."));
    return !s || isNaN(n) ? s : Number.isInteger(n) ? String(n) : n.toFixed(2);
  };
  // Для поиска: без регистра и диакритики, İ/ı → i, ə → e («cay» находит «Çay», «icki» — «İçki»)
  const fold = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i").replace(/ə/g, "e");
  const slug = (s) => fold(s).replace(/[^a-z0-9а-я]+/g, "-").replace(/^-+|-+$/g, "");
  // Текст поля на текущем языке: name_ru / name_en …, если пусто — основная колонка
  const tr = (it, f) => (lang !== BASE && it[`${f}_${lang}`]) || it[f] || "";
  const hasLocation = () => !!C.location && isFinite(Number(C.location.lat)) && isFinite(Number(C.location.lng)) &&
    !!(Number(C.location.lat) || Number(C.location.lng));
  // Статистика GoatCounter (если скрипт подключён и не заблокирован).
  // Каждое событие (item/…, lang/…) отправляется не больше одного раза за визит (вкладку),
  // чтобы повторные открытия одного блюда и переключения языка не раздували статистику.
  const track = (path, title) => {
    try {
      if (!window.goatcounter || !window.goatcounter.count) return;
      const sent = JSON.parse(sessionStorage.getItem("gc-sent") || "[]");
      if (sent.includes(path)) return;
      sent.push(path);
      sessionStorage.setItem("gc-sent", JSON.stringify(sent));
      window.goatcounter.count({ path, title: title || path, event: true });
    } catch (e) { /* ignore */ }
  };

  // Метка из колонки badge → hit | rec | new | "" (любой другой текст игнорируется)
  function badgeType(v) {
    const s = String(v || "").trim().toLocaleLowerCase();
    if (!s) return "";
    if (/^(hit|хит|top|populyar|ən çox|en cox|bestseller)/.test(s)) return "hit";
    if (/^(t[oö]vsiy|rec|рекоменд)/.test(s)) return "rec";
    if (/^(yeni|new|новинк|нов)/.test(s)) return "new";
    return "";
  }
  const BADGE_KEY = { hit: "badgeHit", rec: "badgeRec", new: "badgeNew" };
  const tagHtml = (it) => { const b = badgeType(it.badge); return b ? `<span class="tag tag-${b}">${esc(T[BADGE_KEY[b]])}</span>` : ""; };

  /* ---------- Фото: сначала .webp, если его нет — исходный .jpg ---------- */
  const noWebp = new Set();
  function photoAttrs(src) {
    const m = /^(img\/.+)\.jpe?g$/i.exec(src);
    if (!m || noWebp.has(src)) return `src="${esc(src)}"`;
    return `src="${esc(m[1])}.webp" data-fb="${esc(src)}"`;
  }
  function watchFallback(img) {
    const fb = () => { if (img.dataset.fb) { noWebp.add(img.dataset.fb); img.src = img.dataset.fb; delete img.dataset.fb; } };
    if (img.complete && !img.naturalWidth && img.dataset.fb) fb(); else img.addEventListener("error", fb);
  }

  /* ---------- Иконки ---------- */
  const svg = (p, s = 18, w = 2) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const IC_CLOCK = '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';
  const IC_TABLE = '<rect x="3" y="7" width="18" height="3.5" rx="1"/><path d="M6 10.5V20M18 10.5V20M9 15h6"/>';
  const IC_PHONE = '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>';
  const IC_PIN = '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>';
  const IC_CHAT = '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z"/>';
  const IC_INSTA = '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5"/>';
  const IC_WAZE = '<path d="M3 11l18-8-8 18-2-8-8-2z"/>';
  const telHref = () => `tel:${esc(String(C.phone).replace(/[^\d+]/g, ""))}`;
  const address = () => T.address || C.address || "";
  // Instagram: ссылка и подпись «@логин» из неё (instagram.com/fincan.teahouse → @fincan.teahouse)
  const igUrl = () => safeUrl(C.instagram);
  const igName = () => { const u = (String(C.instagram || "").match(/instagram\.com\/([\w.]+)/i) || [])[1]; return u ? "@" + u : "Instagram"; };
  // клики по ссылкам с data-gc (Instagram в шапке и внизу) → событие в статистике
  document.addEventListener("click", (e) => { const a = e.target.closest("a[data-gc]"); if (a) track(a.dataset.gc); });

  /* ---------- Header ---------- */
  document.documentElement.style.setProperty("--accent", C.accentColor || "#f24e1e");
  document.title = C.cafeName || "Menu";
  $("cafeName").textContent = C.cafeName || "";
  $("subtitle").textContent = C.subtitle || "";
  if (C.logo) { $("logo").src = C.logo; $("logo").hidden = false; }
  if (hasLocation()) {
    $("findLink").hidden = false;
    $("findLink").addEventListener("click", (e) => {
      const t = $("findUs"); if (!t) return;
      e.preventDefault(); t.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  // Переключатель языков
  if (LANGS.length > 1) {
    $("langs").innerHTML = LANGS.map((l) => `<button type="button" data-lang="${esc(l)}">${esc(l.toUpperCase())}</button>`).join("");
    $("langs").hidden = false;
    $("langs").addEventListener("click", (e) => {
      const b = e.target.closest("[data-lang]");
      if (!b || b.dataset.lang === lang) return;
      lang = b.dataset.lang;
      try { localStorage.setItem(LS_KEY, lang); } catch (err) { /* ignore */ }
      setTexts(); renderTexts();
      if (lastItems) render(lastItems);
      if (lang !== BASE) track(`lang/${lang}`, `Language: ${lang}`);  // возврат на основной язык не считаем
    });
  }

  function renderTexts() {
    document.documentElement.lang = lang;
    $("findAddr").textContent = address() || T.findUs;
    $("findGo").textContent = T.route + " ›";
    $("search").placeholder = T.search;
    $("searchBtn").setAttribute("aria-label", T.search);
    $("toTop").setAttribute("aria-label", T.toTop);
    $("sheet").querySelector(".sheet-close").setAttribute("aria-label", T.close);
    document.querySelectorAll("#langs [data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    renderChips();
    renderInsta();
    renderFooter();
  }

  // Плашка Instagram в шапке — зовёт подписаться
  function renderInsta() {
    const a = $("igBanner");
    if (!igUrl()) { a.hidden = true; return; }
    a.href = igUrl();
    a.innerHTML = `<span class="ig-logo">${svg(IC_INSTA, 22, 2)}</span>
      <span class="ig-text"><b>${esc(T.igTitle)}</b><small>${esc(igName())}</small></span>
      <span class="ig-btn">${esc(T.igFollow)}</span>`;
    a.hidden = false;
  }

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
  // компактная плашка: [иконка + заголовок] в одну строку, под ней мелкий текст
  const chip = (cls, icon, title, sub, href) => {
    const inner = `<span class="chip-top"><i class="chip-ic">${svg(icon, 13, 2.4)}</i><b>${esc(title)}</b></span><small>${esc(sub)}</small>`;
    return href ? `<a class="chip ${cls}" href="${href}">${inner}</a>` : `<div class="chip ${cls}">${inner}</div>`;
  };
  function renderChips() {
    const chips = [];
    const st = openState();
    if (st) chips.push(chip(st.open ? "is-open" : "is-closed", IC_CLOCK, st.label, st.sub));
    else if (C.hours) chips.push(chip("", IC_CLOCK, T.open, C.hours));
    if (C.tables) chips.push(chip("", IC_TABLE, C.tables, T.tables));
    if (C.phone) chips.push(chip("", IC_PHONE, T.phone, C.phone, telHref()));
    $("chips").innerHTML = chips.join("");
  }
  setInterval(renderChips, 60000);

  /* ---------- Footer ---------- */
  function renderFooter() {
    const ic = (p) => `<span class="ic">${svg(p)}</span>`;
    const ext = 'target="_blank" rel="noopener noreferrer"';
    const f = [];
    if (C.phone) f.push(`<a href="${telHref()}">${ic(IC_PHONE)}${esc(C.phone)}</a>`);
    if (C.whatsapp) f.push(`<a href="https://wa.me/${esc(C.whatsapp)}" ${ext}>${ic(IC_CHAT)}WhatsApp</a>`);
    if (igUrl()) f.push(`<a href="${esc(igUrl())}" ${ext} data-gc="instagram/footer">${ic(IC_INSTA)}${esc(igName())}</a>`);
    if (address() && !hasLocation()) f.push(`<a href="${esc(safeUrl(C.mapUrl) || "#")}" ${ext}>${ic(IC_PIN)}${esc(address())}</a>`);
    // Карта + маршрут: кнопки открывают приложение и строят путь от текущего места гостя до кафе
    let mapHtml = "";
    if (hasLocation()) {
      const ll = `${Number(C.location.lat)},${Number(C.location.lng)}`;
      mapHtml = `<div class="map-card" id="findUs">
        <h2>${esc(T.findUs)}</h2>
        ${address() ? `<p class="map-addr">${esc(address())}</p>` : ""}
        <div class="map-frame"><iframe src="https://www.google.com/maps?q=${ll}&z=16&hl=${esc(lang)}&output=embed" title="${esc(T.findUs)}"
          loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
        <div class="route-btns">
          <a class="route gmaps" href="https://www.google.com/maps/dir/?api=1&destination=${ll}" ${ext}>${ic(IC_PIN)}<span>${esc(T.route)}<small>Google Maps</small></span></a>
          <a class="route waze" href="https://waze.com/ul?ll=${ll}&navigate=yes" ${ext}>${ic(IC_WAZE)}<span>${esc(T.route)}<small>Waze</small></span></a>
        </div>
      </div>`;
    }
    $("footer").innerHTML = mapHtml + (f.length ? `<div class="foot-card">${f.join("")}</div>` : "") +
      `<div class="foot-note">© ${new Date().getFullYear()} ${esc(C.cafeName || "")}</div>`;
  }

  renderTexts();

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
  let ITEMS = [], lastItems = null;
  const nameHtml = (it) => esc(tr(it, "name")).replace(/\//g, "/<wbr>");  // перенос после «/»
  const letter = (it) => esc((tr(it, "name") || "?").trim().charAt(0).toUpperCase());
  const priceTxt = (it) => (it.price ? `${esc(fmtPrice(it.price))} ${esc(C.currency || "")}` : "");
  // поиск работает сразу по всем языкам
  const searchText = (it) => fold(["name", "description", "category"]
    .flatMap((f) => [it[f], ...LANGS.map((l) => it[`${f}_${l}`])]).filter(Boolean).join(" "));

  function card(it, idx, mini) {
    const off = isOff(it.available);
    const desc = tr(it, "description");
    const ph = it.photo ? `<img ${photoAttrs(it.photo)} alt="${esc(tr(it, "name"))}" loading="lazy" decoding="async">` : letter(it);
    return `<button type="button" class="item${mini ? " mini" : ""}${off ? " off" : ""}" data-i="${idx}" data-search="${esc(searchText(it))}">
      <div class="ph">${ph}${tagHtml(it)}</div>
      <h3>${nameHtml(it)}</h3>
      ${desc && !mini ? `<p>${esc(desc)}</p>` : ""}
      <div class="price">${priceTxt(it)}${off ? `<span class="badge">${esc(T.unavailable)}</span>` : ""}</div>
    </button>`;
  }

  function render(items) {
    lastItems = items;
    ITEMS = items;
    items.forEach((it) => { it.photo = safeUrl(it.photo); });
    // разделы группируются по основной колонке category — порядок и ссылки не зависят от языка
    const groups = new Map();
    items.forEach((it, i) => {
      const cat = it.category || "—";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(i);
    });
    const used = new Set();
    const cats = [...groups.keys()].map((c, i) => {
      let id = "cat-" + (slug(c) || i);
      if (used.has(id)) id += "-" + i;
      used.add(id);
      const first = items[groups.get(c)[0]];
      return { key: c, id, title: (lang !== BASE && first[`category_${lang}`]) || c };
    });
    // «Populyar»: сначала хиты, потом рекомендуемые, потом новинки (внутри — в порядке меню)
    const rank = { hit: 0, rec: 1, new: 2 };
    const pop = items.map((it, i) => [i, badgeType(it.badge)]).filter(([, b]) => b)
      .sort((a, b) => rank[a[1]] - rank[b[1]] || a[0] - b[0]).map(([i]) => i);
    const popHtml = pop.length ? `
      <section id="cat-pop" class="popular"><h2>${esc(T.popular)}</h2>
        <div class="strip">${pop.map((idx) => card(items[idx], idx, true)).join("")}</div>
      </section>` : "";
    $("tabs").innerHTML = (pop.length ? `<a href="#cat-pop">${esc(T.popular)}</a>` : "") +
      cats.map((c) => `<a href="#${c.id}">${esc(c.title)}</a>`).join("");
    $("menu").innerHTML = popHtml + cats.map((c) => `
      <section id="${c.id}"><h2>${esc(c.title)} <small>${groups.get(c.key).length}</small></h2>
        <div class="grid">${groups.get(c.key).map((idx) => card(items[idx], idx)).join("")}</div>
      </section>`).join("") + `<p class="status" id="nothing" hidden>${esc(T.empty)}</p>`;
    // плавное появление фото; необычные пропорции — показываем целиком
    document.querySelectorAll(".item .ph img").forEach((img) => {
      watchFallback(img);
      const done = () => {
        img.classList.add("loaded");
        const r = img.naturalWidth / img.naturalHeight;
        if (r && Math.abs(r - 0.75) > 0.2) img.classList.add("fit");
      };
      img.complete && img.naturalWidth ? done() : img.addEventListener("load", done);
    });
    applySearch();
    setupTabs();
  }

  /* ---------- Tabs ---------- */
  let cur = null;
  function updateTabs() {
    const links = [...document.querySelectorAll(".tabs a")];
    const secs = [...document.querySelectorAll("main section[id]:not([hidden])")];
    let active = secs[0];
    secs.forEach((s) => { if (s.getBoundingClientRect().top <= 100) active = s; });
    if (!active || active === cur) return;
    cur = active;
    links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + active.id));
    const a = links.find((l) => l.classList.contains("active"));
    a && a.parentNode.scrollTo({ left: a.offsetLeft - 60, behavior: "smooth" });
  }
  function setupTabs() { cur = null; updateTabs(); }
  // клик по разделу: прокрутка без новой записи в истории (кнопка «Назад» не листает разделы)
  $("tabs").addEventListener("click", (e) => {
    const a = e.target.closest("a[href^='#']"); if (!a) return;
    const t = document.getElementById(a.getAttribute("href").slice(1)); if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(history.state, "", a.getAttribute("href"));
  });
  window.addEventListener("scroll", () => {
    updateTabs();
    $("tabsWrap").classList.toggle("stuck", $("tabsWrap").getBoundingClientRect().top <= 0 && window.scrollY > 50);
    $("toTop").hidden = window.scrollY < 700;
  }, { passive: true });
  $("toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Search ---------- */
  function applySearch() {
    const q = fold($("search").value.trim());
    let total = 0;
    document.querySelectorAll("main section[id]").forEach((s) => {
      if (s.classList.contains("popular")) { s.hidden = !!q; return; }  // при поиске ленту прячем
      let any = false;
      s.querySelectorAll(".item").forEach((it) => {
        const ok = !q || it.dataset.search.includes(q);
        it.hidden = !ok; any = any || ok; total += ok;
      });
      s.hidden = !any;
    });
    const n = $("nothing"); if (n) n.hidden = total > 0;
  }
  $("searchBtn").addEventListener("click", () => {
    const s = $("search"), open = s.hidden;
    s.hidden = !open; $("tabs").hidden = open;
    if (open) s.focus(); else { s.value = ""; applySearch(); setupTabs(); }
  });
  $("search").addEventListener("input", () => { applySearch(); setupTabs(); });

  /* ---------- Item details (bottom sheet) ---------- */
  // Открытая карточка = запись в истории: кнопка «Назад» на телефоне закрывает её, а не сайт
  let sheetOpen = false, lastBtn = null;
  if (history.state && history.state.sheet) history.replaceState(null, "");
  function openSheet(it, btn) {
    const off = isOff(it.available);
    const desc = tr(it, "description");
    $("sheetBody").innerHTML = `
      ${it.photo ? `<img class="big" ${photoAttrs(it.photo)} alt="${esc(tr(it, "name"))}">` : `<div class="big letter">${letter(it)}</div>`}
      <h3>${nameHtml(it)}${tagHtml(it)}${off ? `<span class="badge">${esc(T.unavailable)}</span>` : ""}</h3>
      ${desc ? `<p>${esc(desc)}</p>` : ""}
      ${it.price ? `<div class="price">${priceTxt(it)}</div>` : ""}`;
    const img = $("sheetBody").querySelector("img"); if (img) watchFallback(img);
    if (!sheetOpen) history.pushState({ sheet: 1 }, "");
    sheetOpen = true; lastBtn = btn;
    $("sheet").hidden = false;
    document.body.classList.add("lock");
    $("sheet").querySelector(".sheet-close").focus({ preventScroll: true });
    track(`item/${slug(it.name) || "item"}`, it.name);
  }
  function hideSheet() {
    if (!sheetOpen) return;
    sheetOpen = false;
    $("sheet").hidden = true;
    document.body.classList.remove("lock");
    if (lastBtn && lastBtn.isConnected) lastBtn.focus({ preventScroll: true });
  }
  function closeSheet() {
    if (history.state && history.state.sheet) history.back();  // → popstate → hideSheet
    else hideSheet();
  }
  window.addEventListener("popstate", hideSheet);
  $("menu").addEventListener("click", (e) => {
    const b = e.target.closest(".item[data-i]");
    if (b) openSheet(ITEMS[+b.dataset.i], b);
  });
  $("sheet").addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeSheet(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && sheetOpen) closeSheet(); });
  // свайп вниз закрывает
  let y0 = null;
  const panel = $("sheet").querySelector(".sheet-panel");
  panel.addEventListener("touchstart", (e) => { y0 = panel.scrollTop <= 0 ? e.touches[0].clientY : null; }, { passive: true });
  panel.addEventListener("touchend", (e) => { if (y0 !== null && e.changedTouches[0].clientY - y0 > 90) closeSheet(); y0 = null; }, { passive: true });

  /* ---------- Load data ---------- */
  const load = (url) => fetch(url, { cache: "no-cache" }).then((r) => { if (!r.ok) throw 0; return r.text(); })
    .then((t) => { const items = parseCSV(t); if (!items.length || !("name" in items[0])) throw 0; return items; });
  const local = load("menu.csv");
  const sheetRaw = C.sheetCsvUrl ? load(C.sheetCsvUrl + (C.sheetCsvUrl.includes("?") ? "&" : "?") + "t=" + Date.now()) : Promise.reject(0);
  // Дополняем таблицу данными из menu.csv в репозитории (по названию блюда):
  //  • фото — если ячейка photo пустая;
  //  • метки и переводы — только если в таблице вообще нет такой колонки (если есть — таблица главная).
  const extraCols = ["badge", ...LANGS.filter((l) => l !== BASE).flatMap((l) => ["name", "description", "category"].map((f) => `${f}_${l}`))];
  const sheet = sheetRaw.then((items) => local.then((loc) => {
    const key = (i) => (i.name || "").trim().toLowerCase();
    const byName = new Map(loc.map((i) => [key(i), i]));
    const missing = extraCols.filter((c) => !(c in items[0]));
    items.forEach((i) => {
      const l = byName.get(key(i)) || {};
      if (!i.photo) i.photo = l.photo || "";
      missing.forEach((c) => { i[c] = l[c] || ""; });
    });
    return items;
  }, () => items));
  local.catch(() => {}); sheet.catch(() => {});

  // show = no → блюдо остаётся в таблице (базе), но на сайте не показывается
  let shown = false, sheetShown = false;
  const show = (items) => {
    const first = !shown; shown = true;
    render(items.filter((i) => !isOff(i.show)));
    // ссылка вида …/#cat-ickiler ведёт сразу к разделу
    const t = first && location.hash && document.getElementById(location.hash.slice(1));
    if (t && t.closest("main")) t.scrollIntoView({ block: "start" });
  };
  const showSheet = (items) => { sheetShown = true; show(items); };
  const timeout = new Promise((_, rej) => setTimeout(() => rej(0), Number(C.sheetTimeoutMs) || 3500));
  Promise.race([sheet, timeout]).then(showSheet).catch(() => {
    // таблица не ответила вовремя / недоступна → menu.csv; если таблица придёт позже — обновим тихо
    local.then((items) => { if (!sheetShown) show(items); }).catch(() => {});
    sheet.then(showSheet).catch(() => {});
    Promise.allSettled([local, sheet]).then(() => {
      if (!shown) $("menu").innerHTML = `<p class="status">${esc(T.error)}</p>`;
    });
  });

  /* ---------- Офлайн / кэш ---------- */
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
