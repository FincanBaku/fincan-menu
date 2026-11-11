# Backlog

Tasks parked for later. Not started yet.

## 1. Move the menu data from Google Sheets to a SQLite-like database

**Today:** `docs/app.js` downloads the first sheet of the Google Sheet as CSV
(`sheetCsvUrl` in `docs/config.js`). If that fails, it falls back to `docs/menu.csv`.
The sheet works as the database and the admin screen at the same time.

**Goal:** keep the menu in a real database (SQLite or similar) instead of the sheet.

Questions to settle first:
- Hosting. GitHub Pages only serves static files, so a server-side SQLite needs a
  backend. Options: Cloudflare D1 + Workers, Turso/libSQL, Supabase (Postgres), or a
  static `menu.sqlite` / JSON file generated at build time and read in the browser
  (e.g. sql.js).
- Editing. Who changes prices and how: a small admin page with login, or keep the
  sheet as the editor and sync it into the DB.
- Migration: import the current sheet / `menu.csv` columns (`category`, `name`,
  `description`, `price`, `photo`, `available`, `badge`, `show`, `*_ru`, `*_en`).
- Keep the offline fallback (`menu.csv` + service worker `docs/sw.js`) and the
  "show menu after 3.5 s" behaviour.
- Update `README.md`, which is written around the Google Sheet workflow.

## 2. Injection limits (input hardening)

Menu text comes from an editable external source and is rendered with `innerHTML`.
Current protections: `esc()` HTML-escapes text, and `safeUrl()` only lets `photo`
through when it starts with `https://`, `http://` or `img/` (`docs/app.js`).

To do:
- Audit every `innerHTML` / template string in `docs/app.js` and confirm all sheet
  and config values go through `esc()` / `safeUrl()`. Values from `config.js`
  (`mapUrl`, `whatsapp`, coordinates in the map iframe and other links) need the same check.
- Limit field sizes and row counts: max length per field (name, description, etc.),
  max number of items/categories, price must be a number in a sane range, `badge`
  and `available` only from the allowed values.
- Add a Content-Security-Policy (`<meta http-equiv>` in `docs/index.html`) limited to
  the hosts in use (Google Sheets, GoatCounter, Google Maps, images).
- Possibly reject `http://` photos (mixed content) and limit image hosts.
- If task 1 adds a backend or admin page: parameterised SQL queries only (no string
  concatenation), input validation on the server, authentication and rate limits on writes.
