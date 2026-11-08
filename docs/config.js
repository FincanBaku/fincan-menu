// ===== MENYU AYARLARI / НАСТРОЙКИ МЕНЮ =====
// Меняйте только этот файл (и таблицу с блюдами).
window.MENU_CONFIG = {
  cafeName: "Fincan Çay Evi",
  subtitle: "",
  logo: "img/logo.webp",    // путь или ссылка на логотип
  currency: "₼",
  phone: "050 573 86 01",
  address: "166 Bəşir Səfəroğlu küç., Bakı",
  mapUrl: "https://maps.google.com/?q=40.3746566,49.8388982",
  hours: "12:00–02:00",
  tables: 9,                // количество столов (0 — не показывать)
  instagram: "",            // например "https://instagram.com/fincan"
  whatsapp: "994505738601",
  accentColor: "#f24e1e",

  // Тексты интерфейса (можно перевести на любой язык)
  texts: {
    search: "Axtar…",
    open: "Açıq",
    tables: "Masa sayı",
    phone: "Telefon",
    unavailable: "bitib",
    empty: "Heç nə tapılmadı",
    loading: "Yüklənir…",
    error: "Menyu yüklənmədi"
  },

  // Ссылка на Google Таблицу, опубликованную как CSV
  // (Файл → Поделиться → Опубликовать в интернете → CSV).
  // Если пусто — берётся локальный файл menu.csv.
  sheetCsvUrl: ""
};
