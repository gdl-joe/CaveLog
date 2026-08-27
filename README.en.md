# CaveLog — a caving logbook as a PWA

[Deutsch](README.md) · **English**

A mobile web app for cavers: record your trips, keep track of caves, archive photos and see where you have been — all in an installable Progressive Web App.

**Guides:**
- 📖 [Installation with no prior knowledge (step by step)](docs/installation-dummies.en.md) — no terminal, no MySQL, just download the ZIP and upload it
- 📱 [Installing it as an app on your phone](docs/pwa-installation.en.md) — Android & iPhone

> **Note on language:** the app interface itself is in German. The guides above are in English and name the German buttons where it matters.

---

## What CaveLog does

CaveLog replaces handwritten logbooks and scattered photo folders with a searchable, map-linked archive. A small group (editors) records cave trips with all the relevant detail; a wider circle (viewers) can read along.

**Main features:**
- 📋 **Logbook** — every trip in chronological order (three layouts: cards, list, timeline)
- 🗺️ **Map** — all caves on a Mapy.cz outdoor map, rendered with Leaflet
- ⛰️ **Cave register** — sortable and filterable
- 📊 **Statistics** — key figures, monthly bars, activity heatmap, most-visited caves
- 👤 **Profile** — preferences, team management, JSON export
- ✏️ **New trip** — four-step form including a map coordinate picker
- 📷 **Photos** — upload, thumbnail generation (GD), EXIF GPS extraction, lightbox
- 📐 **Surveys** — plans, sections and map extracts per cave (JPG, PNG, PDF)
- 🔒 **Roles** — editor (write) and viewer (read), session auth with CSRF protection

*Design: "CaveLog Calm" — an outdoor palette of moss green, terracotta and ochre, light and dark themes, Inter + JetBrains Mono.*

---

## Tech stack

| Area | Technology |
|------|------------|
| Frontend | Vite + React 18, inline styles (no CSS framework) |
| PWA | vite-plugin-pwa, Workbox service worker |
| Map | Leaflet + Mapy.cz outdoor tiles |
| Fonts | Inter + JetBrains Mono (Google Fonts) |
| Backend | PHP 8.2+, plain MVC (no framework) |
| Database | SQLite (default, no setup) or MySQL 8 |
| Images | GD library (thumbnails), EXIF GPS parsing |
| Hosting | Shared hosting (works on all-inkl.com) |

---

## Project layout

```
CaveLog/
│
├── deploy/            ★ EVERYTHING that goes on the server ★
│   ├── .htaccess      # SPA routing + API rewrite
│   ├── index.html     # app entry point (built by Vite)
│   ├── assets/        # JS + CSS (built by Vite)
│   ├── api/           # PHP REST endpoints
│   ├── lib/           # PHP classes (Database, Auth, Response)
│   ├── config/        # config.php — database credentials go here
│   ├── database/      # schema for MySQL and SQLite
│   ├── setup/         # browser setup script (delete after installing!)
│   └── db/            # SQLite database file (created automatically)
│
└── frontend/          # source code — for development only, never upload
    ├── src/           # React source
    └── vite.config.js # builds into deploy/
```

---

## Local installation

### Requirements
- Node.js 18+ and npm
- PHP 8.2+ (for example via [Herd](https://herd.laravel.com/) or MAMP)
- MySQL 8 — **only if you want it**; without further configuration CaveLog uses SQLite and creates the database file itself

### 1. Clone the repository

```bash
git clone https://github.com/gdl-joe/CaveLog.git
cd CaveLog
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Create the environment files

```bash
# project root
cp .env.example .env

# frontend (for the Vite build)
cp frontend/.env.example frontend/.env.local
```

Fill in `.env`:
```ini
DB_HOST=127.0.0.1
DB_NAME=cavelog
DB_USER=root
DB_PASS=
MAPY_API_KEY=           # https://developer.mapy.com — optional, OSM is the fallback
APP_URL=http://localhost/CaveLog
APP_DEBUG=true
```

### 4. Set up the database

**With SQLite (the default):** nothing to do — the file is created under `deploy/db/` on first start.

**With MySQL:**
```bash
mysql -u root -e "CREATE DATABASE cavelog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root cavelog < deploy/database/schema.sql
```
Then set `DB_DRIVER=mysql` in your `.env`.

### 5. Create an admin account

Open `deploy/setup/create-admin.php`, enter name, email and password, then visit:

```
http://localhost/CaveLog/setup/create-admin.php
```

Delete the file afterwards.

### 6. Start the development server

```bash
cd frontend
npm run dev
# → http://localhost:5173
```

---

## Deployment (shared hosting)

### 1. Build the frontend

```bash
cd frontend
# put your Mapy.cz key in .env.local first
npm run build
# → output goes into deploy/
```

### 2. Upload the files (FTP/SFTP)

The `deploy/` folder already contains everything needed. Upload its **contents** into the web root (for example `html/` on all-inkl.com), not the folder itself:

```
deploy/index.html   → html/index.html
deploy/assets/      → html/assets/
deploy/api/         → html/api/
deploy/lib/         → html/lib/
deploy/config/      → html/config/
deploy/database/    → html/database/
deploy/setup/       → html/setup/
deploy/.htaccess    → html/.htaccess
                      html/uploads/   (create empty, chmod 755)
```

> Keep `frontend/` on your own machine — it only holds the source code.

### 3. Database on the server

Only needed with MySQL: create a database in phpMyAdmin and import `deploy/database/schema.sql`. With SQLite you can skip this step.

### 4. Adjust `config/config.php` on the server

```php
return [
    'db_host' => '127.0.0.1',        // all-inkl: often localhost or 127.0.0.1
    'db_name' => 'w0123456_cavelog', // mind the all-inkl prefix
    'db_user' => 'w0123456_user',
    'db_pass' => '...',
    'mapy_key' => '...',
    'app_url'  => 'https://your-domain.com',
    'debug'    => false,
    // ...
];
```

### 5. Create the admin account, then delete `setup/`

```
https://your-domain.com/setup/create-admin.php
```

Remove `setup/` via FTP afterwards.

---

## Mapy.cz API key (optional)

Without a key the map falls back to OpenStreetMap. That works, but shows less terrain detail. For the outdoor map (contour lines, hiking trails, hillshading):

1. Create a free account at [developer.mapy.com](https://developer.mapy.com)
2. Add the key to `config/config.php`:
   ```php
   'mapy_key' => 'your-key-here',
   ```
3. Done — **no rebuild required.** The page fetches it from the server through `api/settings` on load.

> During development `VITE_MAPY_API_KEY` in a `.env` file still works; the value from `config.php` takes precedence.

Mapy.cz lets you restrict the key to your own domain, which is worth doing since it is visible in the browser.

---

## Installing as an app

On **Android (Chrome)**, after opening the site once:
- menu → "Install app", or the "Add to home screen" banner

On **iOS (Safari)**:
- share button → "Add to Home Screen"

The app then opens standalone, without browser chrome.

---

## Regenerating the icons

```bash
cd frontend
npm run icons
```

Creates `icon-192.png` and `icon-512.png` straight into `deploy/`, where the manifest expects them. Requires `sharp` (already in devDependencies).

---

## Roles and permissions

| Action | Editor | Viewer |
|--------|--------|--------|
| Read trips | ✓ | ✓ |
| Read caves | ✓ | ✓ |
| See statistics | ✓ | ✓ |
| Create a trip | ✓ | — |
| Edit or delete a trip | ✓ | — |
| Upload or delete photos | ✓ | — |
| Manage accounts | ✓ | — |
| Upload or delete surveys | ✓ | — |
| View surveys | ✓ | ✓ |
| Maintain the system (database, cleanup) | ✓ | — |

### Setting up accounts

There is no public registration. Editors create accounts under **Verwaltung → Zugänge** (Administration → Accounts):

1. "Höhlenfreund einladen" (invite a caving friend) — name, email and role (default: **viewer**)
2. The app generates an **invitation link**, which you copy and pass on yourself (email, WhatsApp, Signal). The server sends no email of its own.
3. The invited person opens the link, sets their own password and is signed in. The link is then used up, and expires after 14 days in any case.

Per account you can also change the role, suspend access (any running session ends immediately), issue a new link (this replaces "forgot password") and delete the account. You cannot suspend, demote or delete your own account.

### Administration → System

Checks PHP, the database, write permissions and error reporting. Missing database columns can be added at the press of a button (MySQL as well as SQLite) — no phpMyAdmin needed. Setup and diagnostic files can also be deleted from the server here.

---

## Surveys

Plans, sections and map extracts belong to the **cave**, not to an individual trip — they apply to every visit there. You will find them on the cave page (desktop) or under "Pläne" in the trip view (mobile).

- Formats: **JPG, PNG and PDF**
- Images open full screen with zoom (double click, `+` / `−` / `0`, `Esc`)
- PDFs open in the device's own viewer, with search, printing and sharing
- Every survey has a kind (plan, section, map, other) and a title you can change with a click
- Viewers can see all surveys, but cannot upload or delete them

---

## Data model (short form)

```
users       — handle, name, email, password_hash, role, prefs (JSON)
caves       — slug-id, name, region, country, lat/lng, depth_m, length_m, type
trips       — cave_id, title, date, start/end, type, wet, rope, diff_t/k/p, notes …
trip_team   — trip_id ↔ member_name
trip_gear   — trip_id ↔ gear
trip_hazards— trip_id ↔ hazard
photos      — trip_id, path, thumb_path, large_path, full_path, width/height, gps_lat/lng
cave_plans  — cave_id, title, kind (plan|section|map|other), path, mime, bytes
```

The `diff_t`, `diff_k` and `diff_p` columns hold a difficulty rating on three axes: technical, physical and psychological.

Full schema with all constraints and demo data: [`deploy/database/schema.sql`](deploy/database/schema.sql)

---

## Licence

A private project — no formal licence framework. The code may be adapted for your own non-commercial purposes.
