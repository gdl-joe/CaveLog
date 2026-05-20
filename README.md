# CaveLog — Höhlen-Logbuch PWA

Eine mobile Web-App für Höhlenforscher: Befahrungen dokumentieren, Höhlen verwalten, Fotos archivieren, Statistiken auswerten — alles in einer installierbaren Progressive Web App.

---

## Was ist CaveLog?

CaveLog ersetzt handgeschriebene Logbücher und verstreute Foto-Ordner durch ein durchsuchbares, geo-verknüpftes Archiv. Kleine Gruppen (Admins) dokumentieren Höhlenbefahrungen mit allen relevanten Metadaten; ein größerer Kreis (Viewer) liest mit.

**Kernfunktionen:**
- 📋 **Logbuch** — chronologische Liste aller Befahrungen (3 Layouts: Karten, Liste, Zeitachse)
- 🗺️ **Karte** — alle Höhlen auf Mapy.cz Outdoor-Karte mit Leaflet
- ⛰️ **Höhlen-Verzeichnis** — sortier- und filterbares Register
- 📊 **Statistik** — KPIs, Monatsbalken, Aktivitäts-Heatmap, Top-Höhlen
- 👤 **Profil** — Einstellungen, Team-Verwaltung, JSON-Export
- ✏️ **Neue Befahrung** — 4-Schritte-Wizard inkl. Karten-Koordinaten-Picker
- 📷 **Fotos** — Upload, Thumbnail-Generierung (GD), EXIF-GPS-Auslesen, Lightbox
- 🔒 **Rollen** — Admin (schreiben) / Viewer (lesen), Session-Auth mit CSRF-Schutz

---

## Screenshots

| Logbuch | Detail | Neue Befahrung |
|---------|--------|----------------|
| Kompakte Karten mit Foto-Thumbnail | Sticky Topbar, Section-Layout | 4-Schritte-Wizard mit Karten-Picker |

*Design: CaveLog Calm — Outdoor-Naturpalette (Moos-Grün, Terracotta, Ocker), Hell- und Dunkel-Theme, Inter + JetBrains Mono.*

---

## Tech-Stack

| Bereich | Technologie |
|---------|-------------|
| Frontend | Vite + React 18, Inline-Styles (kein CSS-Framework) |
| PWA | vite-plugin-pwa, Workbox Service Worker |
| Karte | Leaflet + Mapy.cz Outdoor-Tiles |
| Fonts | Inter + JetBrains Mono (Google Fonts) |
| Backend | PHP 8.2+, plain MVC (kein Framework) |
| Datenbank | MySQL 8 |
| Bilder | GD-Library (Thumbnails), EXIF-GPS-Parsing |
| Hosting | Shared Hosting (all-inkl.com kompatibel) |

---

## Projektstruktur

```
CaveLog/
├── frontend/          # Vite/React-Quellcode
│   ├── src/
│   │   ├── screens/   # 7 Haupt-Screens
│   │   ├── components/# MapyMap, PhotoLightbox
│   │   ├── atoms.jsx  # CLPhoto, CLChip, CLDifficulty, CLStatTile …
│   │   ├── theme.js   # Farb-Tokens (light/dark)
│   │   └── api.js     # REST-Client mit CSRF
│   └── vite.config.js
├── api/               # PHP REST-Endpunkte
│   ├── trips.php      # GET/POST/PATCH/DELETE
│   ├── caves.php
│   ├── photos.php
│   ├── stats.php
│   ├── users.php
│   └── upload.php     # Multipart, GD-Thumbs, EXIF
├── lib/               # PHP-Klassen (Database, Auth, Response)
├── config/            # config.php (DB, Mapy-Key, Upload-Pfad)
├── database/          # schema.sql (Tabellen + Demo-Daten)
├── public/            # Vite Build-Output (index.html, icons, manifest)
├── setup/             # Einmalige Setup-Scripts
└── .htaccess          # SPA-Routing + API-Rewrite
```

---

## Installation (lokal)

### Voraussetzungen
- Node.js 18+ und npm
- PHP 8.2+ (z. B. via [Herd](https://herd.laravel.com/) oder MAMP)
- MySQL 8

### 1. Repo klonen

```bash
git clone https://github.com/gdl-joe/CaveLog.git
cd CaveLog
```

### 2. Frontend-Abhängigkeiten installieren

```bash
cd frontend
npm install
```

### 3. Umgebungsvariablen anlegen

```bash
# Projektroot
cp .env.example .env

# Frontend (für Vite-Build)
cp frontend/.env.example frontend/.env.local
```

`.env` ausfüllen:
```ini
DB_HOST=127.0.0.1
DB_NAME=cavelog
DB_USER=root
DB_PASS=
MAPY_API_KEY=           # https://developer.mapy.com — optional, OSM als Fallback
APP_URL=http://localhost/CaveLog
APP_DEBUG=true
```

### 4. Datenbank anlegen

```bash
mysql -u root -e "CREATE DATABASE cavelog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root cavelog < database/schema.sql
```

### 5. Admin-Account erstellen

`setup/create-admin.php` öffnen, Name/E-Mail/Passwort eintragen, dann:

```
http://localhost/CaveLog/setup/create-admin.php
```

Danach die Datei löschen.

### 6. Entwicklungsserver starten

```bash
cd frontend
npm run dev
# → http://localhost:5173
```

---

## Deployment (Shared Hosting / all-inkl.com)

### 1. Frontend bauen

```bash
cd frontend
# Mapy.cz Key in .env.local eintragen
npm run build
# → Ausgabe in public/
```

### 2. Dateien hochladen (FTP/SFTP)

Ziel: Webroot des Servers (z. B. `html/` bei all-inkl.com)

```
public/*           → html/          (Inhalt, nicht den Ordner selbst)
api/               → html/api/
lib/               → html/lib/
config/            → html/config/
setup/             → html/setup/
uploads/           → html/uploads/  (leerer Ordner, chmod 755)
.htaccess          → html/.htaccess
```

> **Wichtig:** `public/.htaccess` aus dem Repo hochladen (enthält HTTPS-Redirect und SPA-Routing) — nicht die Root-`.htaccess`.

### 3. Datenbank auf dem Server

phpMyAdmin → neue DB anlegen → `database/schema.sql` importieren.

### 4. `config/config.php` auf dem Server anpassen

```php
return [
    'db_host' => '127.0.0.1',       // all-inkl: oft localhost oder 127.0.0.1
    'db_name' => 'w0123456_cavelog', // all-inkl-Präfix beachten!
    'db_user' => 'w0123456_user',
    'db_pass' => '...',
    'mapy_key' => '...',
    'app_url'  => 'https://deine-domain.de',
    'debug'    => false,
    // ...
];
```

### 5. Admin anlegen und `setup/` löschen

```
https://deine-domain.de/setup/create-admin.php
```

Danach `setup/` per FTP entfernen.

---

## Mapy.cz API-Key (optional)

Ohne Key funktioniert die Karte mit OpenStreetMap-Tiles als Fallback. Für die Outdoor-Karte (Topografie, Wanderwege):

1. Account auf [developer.mapy.com](https://developer.mapy.com) erstellen
2. API-Key in `.env.local` als `VITE_MAPY_API_KEY=...` eintragen
3. Neu bauen: `npm run build`

---

## PWA installieren

Nach dem ersten Aufruf im **Chrome auf Android**:
- Menü → „App installieren" oder Banner „Zum Startbildschirm hinzufügen"

Die App öffnet dann als Standalone ohne Browser-Chrome.

Auf **iOS (Safari)**:
- Teilen-Button → „Zum Home-Bildschirm"

---

## Icons neu generieren

```bash
cd frontend
npm run icons
# → public/icon-192.png und public/icon-512.png
```

Benötigt `sharp` (bereits in devDependencies).

---

## Rollen & Berechtigungen

| Aktion | Admin | Viewer |
|--------|-------|--------|
| Befahrungen lesen | ✓ | ✓ |
| Höhlen lesen | ✓ | ✓ |
| Statistik sehen | ✓ | ✓ |
| Neue Befahrung anlegen | ✓ | — |
| Befahrung bearbeiten/löschen | ✓ | — |
| Fotos hochladen/löschen | ✓ | — |
| Nutzer verwalten | ✓ | — |

Viewer-Accounts werden per Einladung angelegt (kein öffentlicher Zugang).

---

## Datenmodell (Kurzform)

```
users       — handle, name, email, password_hash, role, prefs (JSON)
caves       — slug-id, name, region, country, lat/lng, depth_m, length_m, type
trips       — cave_id, title, date, start/end, type, wet, rope, diff_t/k/p, notes …
trip_team   — trip_id ↔ member_name
trip_gear   — trip_id ↔ gear
trip_hazards— trip_id ↔ hazard
photos      — trip_id, path, thumb_path, gps_lat/lng, sort_order
```

Vollständiges Schema mit allen Constraints und Demo-Daten: [`database/schema.sql`](database/schema.sql)

---

## Lizenz

Privates Projekt — kein offizieller Lizenzrahmen. Code darf für eigene nicht-kommerzielle Zwecke adaptiert werden.
