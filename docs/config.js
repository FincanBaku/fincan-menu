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
  // Координаты кафе для карты и маршрутов (Google Maps / Waze).
  // Узнать: Google Maps → долгое нажатие на точку → скопировать числа.
  location: { lat: 40.3746566, lng: 49.8388982 },
  hours: "12:00–02:00",
  timezone: "Asia/Baku",    // для статуса «открыто/закрыто»
  tables: 9,                // количество столов (0 — не показывать)
  instagram: "https://www.instagram.com/fincan.teahouse",
  whatsapp: "994505738601",
  accentColor: "#f24e1e",

  // Языки сайта. Первый открывается по умолчанию; гость переключает кнопками AZ / RU / EN
  // (выбор запоминается). Переводы блюд — колонки name_ru, name_en, description_ru, … в таблице.
  languages: ["az", "ru", "en"],

  // Статистика GoatCounter (сколько людей открывают меню, какие блюда смотрят).
  // Скрипт подключён в index.html; здесь только для справки.
  // Панель: https://sarkhan999.goatcounter.com
  goatcounter: "https://sarkhan999.goatcounter.com/count",

  // Тексты интерфейса на каждом языке
  texts: {
    az: {
      search: "Axtar…",
      open: "Açıq",
      closed: "Bağlı",
      untilTime: "{t}-dək",       // «до 02:00»
      opensAt: "{t}-da açılır",   // «откроется в 12:00»
      tables: "Masa sayı",
      phone: "Telefon",
      unavailable: "bitib",
      empty: "Heç nə tapılmadı",
      error: "Menyu yüklənmədi",
      close: "Bağla",
      toTop: "Yuxarı",
      popular: "⭐ Populyar",
      badgeHit: "🔥 Ən çox sifariş",   // badge = hit
      badgeRec: "⭐ Tövsiyə edirik",    // badge = tovsiye
      badgeNew: "✨ Yeni",              // badge = yeni
      findUs: "📍 Bizi necə tapmalı",
      route: "Yol göstər",
      address: "166 Bəşir Səfəroğlu küç., Bakı",
      igTitle: "Bizi Instagram-da izləyin",   // плашка Instagram в шапке
      igFollow: "Abunə ol"
    },
    ru: {
      search: "Поиск…",
      open: "Открыто",
      closed: "Закрыто",
      untilTime: "до {t}",
      opensAt: "откроется в {t}",
      tables: "Столов",
      phone: "Телефон",
      unavailable: "закончилось",
      empty: "Ничего не найдено",
      error: "Меню не загрузилось",
      close: "Закрыть",
      toTop: "Наверх",
      popular: "⭐ Популярное",
      badgeHit: "🔥 Хит продаж",
      badgeRec: "⭐ Рекомендуем",
      badgeNew: "✨ Новинка",
      findUs: "📍 Как нас найти",
      route: "Маршрут",
      address: "ул. Бешир Сафароглу, 166, Баку",
      igTitle: "Мы в Instagram",
      igFollow: "Подписаться"
    },
    en: {
      search: "Search…",
      open: "Open",
      closed: "Closed",
      untilTime: "until {t}",
      opensAt: "opens at {t}",
      tables: "Tables",
      phone: "Phone",
      unavailable: "sold out",
      empty: "Nothing found",
      error: "Menu failed to load",
      close: "Close",
      toTop: "Top",
      popular: "⭐ Popular",
      badgeHit: "🔥 Bestseller",
      badgeRec: "⭐ Recommended",
      badgeNew: "✨ New",
      findUs: "📍 How to find us",
      route: "Directions",
      address: "166 Bashir Safaroglu St., Baku",
      igTitle: "Follow us on Instagram",
      igFollow: "Follow"
    }
  },

  // Ссылка на Google Таблицу в формате CSV.
  // Если пусто, таблица недоступна или отвечает дольше 3.5 с — показывается локальный menu.csv
  // (а когда таблица всё-таки загрузится, меню тихо обновится).
  // Таблица: https://docs.google.com/spreadsheets/d/12zG4KLU3Nz4eOA85Nh1kl5mBZL65dH-nlhilVnlR158/edit
  // (сайт читает первый лист таблицы)
  sheetCsvUrl: "https://docs.google.com/spreadsheets/d/12zG4KLU3Nz4eOA85Nh1kl5mBZL65dH-nlhilVnlR158/gviz/tq?tqx=out:csv&headers=1",
  sheetTimeoutMs: 3500
};
