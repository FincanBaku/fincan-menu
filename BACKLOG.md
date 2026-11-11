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
- Reject `http://` photos (mixed content). See task 3 for limiting image hosts in the CSP.
- If task 1 adds a backend or admin page: parameterised SQL queries only (no string
  concatenation), input validation on the server, authentication and rate limits on writes.

## 3. Basic security improvements

Found in a quick review of `docs/` and the setup in `README.md`. Highest value first.

### Accounts (the biggest real risk)
Whoever controls the Google Sheet or the GitHub repo controls what every guest sees,
including links and photos.
- Turn on 2-step verification for the Google account that owns the sheet and for every
  GitHub account with write access to `FincanBaku/menu`.
- Check who can edit the sheet (Share → editors) and remove anyone who doesn't need it.
  Know where version history is (File → Version history), so a bad change can be undone fast.
- GitHub: protect `main` (Settings → Branches: require a PR, block force-push and deletion).

### The sheet is readable by anyone
The sheet is shared as "anyone with the link → Viewer", and its ID is in the public
`docs/config.js`. So **every column and every sheet tab is public**, not just what the site
shows. `README.md` suggests adding private columns on the right (notes, cost price);
those are visible to anyone too.
- Never keep cost prices, supplier info, phone numbers or other private data in that
  spreadsheet. Keep them in a separate private file.
- Fix the README advice about "own columns (notes, cost price)".

### Tighten the Content-Security-Policy (`docs/index.html`)
A CSP is already there. Gaps:
- `img-src 'self' https: data:` allows images from any site. Limit it to `'self'` plus
  the photo hosts actually used, and enforce the same list in `safeUrl()` in `docs/app.js`.
- `connect-src` allows `https://*.googleusercontent.com`. Check whether it's still needed
  and remove it if not.
- `frame-ancestors` (anti-clickjacking) can't be set in a `<meta>` CSP, and GitHub Pages
  doesn't allow custom headers. Low risk for a menu. Revisit if the site moves to
  Cloudflare Pages / Netlify (which support `_headers`), along with `X-Content-Type-Options`
  and `Permissions-Policy`.

### Third-party script
`https://gc.zgo.at/count.js` (GoatCounter) loads with no integrity check, so if that host
were compromised it could run any code on the menu.
- Self-host `count.js` in `docs/` (then drop `https://gc.zgo.at` from `script-src`),
  or add `integrity` (SRI) + `crossorigin` to the `<script>` tag.

### Smaller code fixes (`docs/app.js`)
- `C.logo` is assigned to `img.src` without `safeUrl()`. It comes from `config.js`, so
  low risk, but make it consistent.
- Check the service worker (`docs/sw.js`) only caches successful same-origin responses
  (it does today), and bump `CACHE` when the file list changes.

### Hosting
- GitHub → Settings → Pages: make sure **Enforce HTTPS** is on (especially if a custom
  domain is added).

### QR codes on the tables (physical)
A common restaurant scam is a fake QR sticker stuck over the real one, pointing to a
phishing or "pay here" page.
- Every so often, check the table cards are the originals (laminated card or stand,
  not a loose sticker).
- Print the short web address under the QR (already on the A6 card? check
  `qr/qr-card-A6.png`) so guests can see where it should go.
- Never ask for payment or card data on the menu site.
