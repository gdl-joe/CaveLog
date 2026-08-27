# CaveLog — Höhlen-Logbuch PWA

**Deutsch** · [English](README.en.md)

Eine mobile Web-App für Höhlenforscher: Befahrungen dokumentieren, Höhlen verwalten, Fotos archivieren, Statistiken auswerten — alles in einer installierbaren Progressive Web App.

**Anleitungen:**
- 📖 [Installation ohne Vorkenntnisse (Schritt für Schritt)](docs/installation-dummies.md) — kein Terminal, kein MySQL, einfach ZIP runterladen und hochladen
- 📱 [Als App auf dem Handy installieren](docs/pwa-installation.md) — Android & iPhone

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
- 📐 **Pläne** — Grundrisse, Schnitte und Kartenausschnitte je Höhle (JPG, PNG, PDF)
- 🔒 **Rollen** — Bearbeiter (schreiben) / Betrachter (lesen), Session-Auth mit CSRF-Schutz

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
| Datenbank | SQLite (Standard, ohne Einrichtung) oder MySQL 8 |
| Bilder | GD-Library (Thumbnails), EXIF-GPS-Parsing |
| Hosting | Shared Hosting (all-inkl.com kompatibel) |

---

## Projektstruktur

```
CaveLog/
│
├── deploy/            ★ ALLES was auf den Server kommt ★
│   ├── .htaccess      # SPA-Routing + API-Rewrite
│   ├── index.html     # App-Einstieg (von Vite gebaut)
│   ├── assets/        # JS + CSS (von Vite gebaut)
│   ├── api/           # PHP REST-Endpunkte
│   ├── lib/           # PHP-Klassen (Database, Auth, Response)
│   ├── config/        # config.php — hier DB-Zugangsdaten eintragen
│   ├── database/      # SQLite-Schema
│   ├── setup/         # Browser-Setup-Script (nach Einrichtung löschen!)
│   └── db/            # SQLite-Datenbankdatei (wird automatisch angelegt)
│
└── frontend/          # Quellcode — nur für Entwickler, nicht hochladen
    ├── src/           # React-Quellcode
    └── vite.config.js # baut nach deploy/
```

---

## Installation (lokal)

### Voraussetzungen
- Node.js 18+ und npm
- PHP 8.2+ (z. B. via [Herd](https://herd.laravel.com/) oder MAMP)
- MySQL 8 — **nur wenn gewünscht**; ohne Angabe nutzt CaveLog SQLite und legt
  die Datenbankdatei selbst an

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

**Mit SQLite (Voreinstellung):** nichts zu tun — die Datei entsteht beim ersten
Start unter `deploy/db/`.

**Mit MySQL:**
```bash
mysql -u root -e "CREATE DATABASE cavelog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root cavelog < deploy/database/schema.sql
```
Dazu in der `.env` `DB_DRIVER=mysql` setzen.

### 5. Admin-Account erstellen

`deploy/setup/create-admin.php` öffnen, Name/E-Mail/Passwort eintragen, dann:

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
# → Ausgabe in deploy/
```

### 2. Dateien hochladen (FTP/SFTP)

Ziel: Webroot des Servers (z. B. `html/` bei all-inkl.com)

Der Ordner `deploy/` enthält bereits alles Nötige — sein **Inhalt** kommt ins
Webroot (z. B. `html/` bei all-inkl.com), nicht der Ordner selbst:

```
deploy/index.html   → html/index.html
deploy/assets/      → html/assets/
deploy/api/         → html/api/
deploy/lib/         → html/lib/
deploy/config/      → html/config/
deploy/database/    → html/database/
deploy/setup/       → html/setup/
deploy/.htaccess    → html/.htaccess
                      html/uploads/   (leer anlegen, chmod 755)
```

> Der Ordner `frontend/` bleibt auf dem Rechner — er enthält nur den Quellcode.

### 3. Datenbank auf dem Server

Nur bei MySQL nötig: phpMyAdmin → neue DB anlegen → `deploy/database/schema.sql` importieren.
Mit SQLite entfällt dieser Schritt.

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

Ohne Schlüssel zeigt die Karte OpenStreetMap — das funktioniert, hat aber
weniger Geländedetail. Für die Outdoor-Karte (Höhenlinien, Wanderwege,
Geländeschummerung):

1. Kostenlosen Account auf [developer.mapy.com](https://developer.mapy.com) anlegen
2. Den Schlüssel in `config/config.php` eintragen:
   ```php
   'mapy_key' => 'dein-schlüssel-hier',
   ```
3. Fertig — **kein Neubau nötig.** Die Seite holt ihn beim Laden über
   `api/settings` vom Server.

> Für die Entwicklung geht auch weiterhin `VITE_MAPY_API_KEY` in einer `.env`;
> der Wert aus `config.php` hat Vorrang.

Bei Mapy.cz lässt sich der Schlüssel auf die eigene Domain beschränken — sinnvoll,
weil er im Browser sichtbar ist.

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
```

Erzeugt `icon-192.png` und `icon-512.png` direkt in `deploy/` — dort, wo das
Manifest sie erwartet. Benötigt `sharp` (bereits in devDependencies).

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
| Pläne hochladen/löschen | ✓ | — |
| Pläne ansehen | ✓ | ✓ |
| System pflegen (DB, Aufräumen) | ✓ | — |

### Zugänge einrichten

Es gibt keine öffentliche Registrierung. Bearbeiter legen Zugänge unter
**Verwaltung → Zugänge** an:

1. „Höhlenfreund einladen" — Name, E-Mail und Rolle (Standard: **Betrachter**)
2. Die App erzeugt einen **Einladungslink**; dieser wird kopiert und selbst
   weitergegeben (Mail, WhatsApp, Signal). Der Server verschickt keine E-Mails.
3. Die eingeladene Person öffnet den Link, setzt ihr eigenes Passwort und ist
   damit angemeldet. Der Link ist danach verbraucht und läuft ohnehin nach
   14 Tagen ab.

Weitere Möglichkeiten je Zugang: Rolle wechseln, Zugang sperren (die laufende
Sitzung endet sofort), neuen Link erzeugen (ersetzt „Passwort vergessen") und
löschen. Der eigene Zugang lässt sich nicht sperren, herabstufen oder löschen.

### Verwaltung → System

Prüft PHP, Datenbank, Schreibrechte und Fehlerausgabe. Fehlende Datenbank-Spalten
lassen sich per Knopfdruck ergänzen (MySQL wie SQLite) — phpMyAdmin ist dafür
nicht nötig. Ebenso lassen sich Setup- und Diagnose-Dateien direkt vom Server
löschen.

---

## Pläne

Grundrisse, Schnitte und Kartenausschnitte gehören zur **Höhle**, nicht zur
einzelnen Befahrung — sie gelten für alle Touren dorthin. Zu finden auf der
Höhlenseite (Desktop) bzw. in der Befahrungsansicht unter „Pläne" (Handy).

- Formate: **JPG, PNG und PDF**
- Bilder öffnen sich im Vollbild mit Zoom (Doppelklick, `+` / `−` / `0`, `Esc`)
- PDFs öffnen sich im Betrachter des Geräts — mit Suche, Drucken und Weitergeben
- Jeder Plan bekommt eine Art (Grundriss, Schnitt, Karte, Sonstiges) und eine
  Bezeichnung, die sich per Klick ändern lässt
- Betrachter sehen alle Pläne, können aber nichts hochladen oder löschen

## Datenmodell (Kurzform)

```
users       — handle, name, email, password_hash, role, prefs (JSON)
caves       — slug-id, name, region, country, lat/lng, depth_m, length_m, type
trips       — cave_id, title, date, start/end, type, wet, rope, diff_t/k/p, notes …
trip_team   — trip_id ↔ member_name
trip_gear   — trip_id ↔ gear
trip_hazards— trip_id ↔ hazard
photos      — trip_id, path, thumb_path, large_path, full_path, width/height, gps_lat/lng
cave_plans  — cave_id, title, kind (grundriss|schnitt|karte|sonstiges), path, mime, bytes
```

Vollständiges Schema mit allen Constraints und Demo-Daten: [`deploy/database/schema.sql`](deploy/database/schema.sql)

---

## Lizenz

Privates Projekt — kein offizieller Lizenzrahmen. Code darf für eigene nicht-kommerzielle Zwecke adaptiert werden.
