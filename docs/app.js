(function () {
  const C = window.MENU_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  document.documentElement.style.setProperty("--accent", C.accentColor || "#c8102e");
  document.title = C.cafeName || "Меню";
  $("cafeName").textContent = C.cafeName || "Меню";
  $("subtitle").textContent = C.subtitle || "";
  if (C.logo) { $("logo").src = C.logo; $("logo").hidden = false; }

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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
    const head = rows.shift().map((h) => h.trim().toLowerCase());
    return rows.filter((r) => r.some((c) => c.trim()))
      .map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
  }

  const isOff = (v) => /^(no|нет|0|false|-)$/i.test(v || "");

  function render(items) {
    const groups = new Map();
    items.forEach((it) => {
      const cat = it.category || "Разное";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(it);
    });
    const cats = [...groups.keys()];
    $("tabs").innerHTML = cats.map((c, i) => `<a href="#cat-${i}">${esc(c)}</a>`).join("");
    $("menu").innerHTML = cats.map((c, i) => `
      <section id="cat-${i}" data-cat="${i}"><h2>${esc(c)}</h2>
        ${groups.get(c).map((it) => `
          <div class="item${isOff(it.available) ? " off" : ""}" data-search="${esc((it.name + " " + it.description).toLowerCase())}">
            ${it.photo ? `<img src="${esc(it.photo)}" alt="${esc(it.name)}" loading="lazy">` : ""}
            <div class="info">
              <h3>${esc(it.name)}</h3>
              ${it.description ? `<p>${esc(it.description)}</p>` : ""}
              ${it.price ? `<div class="price">${esc(it.price)} ${esc(C.currency || "")}</div>` : ""}
            </div>
          </div>`).join("")}
      </section>`).join("") || `<p class="status">Меню пустое</p>`;
    setupTabs();
  }

  function setupTabs() {
    const links = [...document.querySelectorAll(".tabs a")];
    let cur = null;
    const update = () => {
      const secs = [...document.querySelectorAll("section:not([hidden])")];
      let active = secs[0];
      secs.forEach((s) => { if (s.getBoundingClientRect().top <= 80) active = s; });
      if (!active || active === cur) return;
      cur = active;
      links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + active.id));
      const a = links.find((l) => l.classList.contains("active"));
      a && a.scrollIntoView({ inline: "center", block: "nearest" });
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  $("search").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll("section").forEach((s) => {
      let any = false;
      s.querySelectorAll(".item").forEach((it) => {
        const ok = !q || it.dataset.search.includes(q);
        it.hidden = !ok; any = any || ok;
      });
      s.hidden = !any;
    });
  });

  $("menu").addEventListener("click", (e) => {
    if (e.target.tagName !== "IMG") return;
    const z = document.createElement("div");
    z.className = "zoom"; z.innerHTML = `<img src="${esc(e.target.src)}">`;
    z.onclick = () => z.remove();
    document.body.appendChild(z);
  });

  const f = [];
  if (C.phone) f.push(`📞 <a href="tel:${esc(C.phone.replace(/\s/g, ""))}">${esc(C.phone)}</a>`);
  if (C.address) f.push(`📍 ${esc(C.address)}`);
  if (C.instagram) f.push(`<a href="${esc(C.instagram)}" target="_blank">Instagram</a>`);
  if (C.whatsapp) f.push(`<a href="https://wa.me/${esc(C.whatsapp)}" target="_blank">WhatsApp</a>`);
  $("footer").innerHTML = f.join("<br>");

  const url = C.sheetCsvUrl ? C.sheetCsvUrl + (C.sheetCsvUrl.includes("?") ? "&" : "?") + "t=" + Date.now() : "menu.csv";
  fetch(url).then((r) => { if (!r.ok) throw 0; return r.text(); })
    .then((t) => render(parseCSV(t)))
    .catch(() => { $("menu").innerHTML = `<p class="status">Не удалось загрузить меню</p>`; });
})();
