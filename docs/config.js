// ===== MENYU AYARLARI / НАСТРОЙКИ МЕНЮ =====
// Меняйте только этот файл (и таблицу с блюдами).
window.MENU_CONFIG = {
  cafeName: "Fincan Çay Evi",
  subtitle: "",
  logo: "img/logo-round.webp",    // путь или ссылка на логотип
  currency: "₼",
  phone: "050 573 86 01",
  address: "166 Bəşir Səfəroğlu küç., Bakı",
  mapUrl: "https://maps.google.com/?q=40.3746566,49.8388982",
  hours: "12:00–02:00",
  timezone: "Asia/Baku",    // для статуса «открыто/закрыто»
  tables: 9,                // количество столов (0 — не показывать)
  instagram: "",            // например "https://instagram.com/fincan"
  whatsapp: "994505738601",
  accentColor: "#f24e1e",

  // Тексты интерфейса (можно перевести на любой язык)
  texts: {
    search: "Axtar…",
    open: "Açıq",
    closed: "Bağlı",
    untilTime: "{t}-dək",       // «до 02:00»
    opensAt: "{t}-da açılır",   // «откроется в 12:00»
    tables: "Masa sayı",
    phone: "Telefon",
    unavailable: "bitib",
    empty: "Heç nə tapılmadı",
    loading: "Yüklənir…",
    error: "Menyu yüklənmədi",
    close: "Bağla",
    toTop: "Yuxarı",
    popular: "⭐ Populyar",
    badgeHit: "🔥 Ən çox sifariş",   // badge = hit
    badgeRec: "⭐ Tövsiyə edirik",    // badge = tovsiye
    badgeNew: "✨ Yeni"               // badge = yeni
  },

  // Ссылка на Google Таблицу, опубликованную как CSV
  // (Файл → Поделиться → Опубликовать в интернете → CSV).
  // Если пусто или таблица недоступна — берётся локальный файл menu.csv.
  // Таблица: https://docs.google.com/spreadsheets/d/1y60vCIuNcuwYnO4Q8PF8gTutTf3BiRnemnMVoWmIxTM/edit
  sheetCsvUrl: "https://docs.google.com/spreadsheets/d/1y60vCIuNcuwYnO4Q8PF8gTutTf3BiRnemnMVoWmIxTM/gviz/tq?tqx=out:csv&headers=1"
};
