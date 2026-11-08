// Service worker: меню открывается без интернета, а гости всегда получают свежую версию сайта.
//  • страница, js, css, menu.csv — сначала из сети (с проверкой обновлений), без сети — из кэша;
//  • фото — сразу из кэша (быстро), а в фоне проверяется, не обновилось ли.
// Запросы к Google Таблице, карте и статистике не трогаются.
const CACHE = "menu-v1";
const SHELL = ["./", "index.html", "style.css", "config.js", "app.js", "menu.csv", "img/logo-round.webp"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  if (url.pathname.includes("/img/")) {
    // stale-while-revalidate
    e.respondWith(caches.open(CACHE).then((c) => c.match(req).then((hit) => {
      const net = fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; });
      if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
      return net;
    })));
    return;
  }

  // network-first; cache: "no-cache" — браузер всегда сверяется с сервером (без 10-минутного кэша GitHub Pages)
  e.respondWith(fetch(req.url, { cache: "no-cache", credentials: "same-origin" })
    .then((r) => {
      if (r.ok) { const copy = r.clone(); e.waitUntil(caches.open(CACHE).then((c) => c.put(req, copy))); }
      return r;
    })
    .catch(() => caches.match(req, { ignoreSearch: true })
      .then((hit) => hit || (req.mode === "navigate" ? caches.match("./") : Response.error()))));
});
