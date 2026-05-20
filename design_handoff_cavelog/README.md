# Handoff: CaveLog — Höhlen-Logbuch (Mobile PWA)

## Overview

**CaveLog** ist eine private Logbuch- und Archiv-Anwendung für Höhlenforscher. Ein kleiner Personenkreis (Admins) dokumentiert Höhlenbefahrungen mit Metadaten, Fotos, Team, Gefahren und Notizen. Ein größerer Kreis (Viewer) liest mit. Die App ersetzt handgeschriebene Logbücher und verstreute Foto-Ordner durch ein durchsuchbares, geo-verknüpftes Archiv.

**Zielumgebung:** PHP + MySQL, gehostet bei all-inkl.com. Frontend als installierbare mobile PWA (Android-first, iOS-kompatibel). Karten via **Mapy.cz** (Leaflet-basiert, EU-Anbieter, outdoor-optimiert).

---

## About the Design Files

Die Dateien unter `design/` sind **Design-Referenzen in HTML/React-via-Babel** — interaktive Prototypen, die Look, Struktur und Verhalten festhalten. Sie sind **keine produktive Code-Basis zum 1:1-Kopieren**.

Die Aufgabe: Diese Designs in der Zielumgebung neu umsetzen. Vorgeschlagener Stack:

- **Backend:** PHP 8.2+ (Slim, Laravel, oder plain PHP MVC), MySQL 8
- **Frontend:** Vite + einfache JS-Library (Alpine.js, Vue 3, oder schlankes React), mobile PWA mit Service Worker
- **Karten:** Leaflet + Mapy.cz Tiles (API-Key-basiert, EU-hosted)
- **Auth:** Session-basiert (PHP-Sessions), Rollen `admin` / `viewer`
- **Foto-Storage:** Filesystem (`/uploads/trips/<trip_id>/`), thumbnails via GD/Imagick, EXIF-GPS-Parsing

Das Prototyp-HTML nutzt inline JSX über Babel-Standalone — das ist **nur für die Design-Phase**. In Produktion: richtiges Bundling.

---

## Fidelity

**High-fidelity.** Alle Farben, Typo-Skalen, Abstände, Icons und Layouts sind final und sollten pixelgenau übernommen werden. Die drei Farbthemen (Dark / Amber / Light) sind fertig und umschaltbar. Die Schwierigkeits-Darstellung hat drei Modi (Bars / Dots / Numeric) — alle drei implementieren.

---

## Screens / Views

Die App hat **7 Haupt-Screens** + FAB-Flow für neue Befahrungen. Mobile Viewport-Target: **412 × 892** (Android-Referenz). Bottom-Tab-Navigation mit 5 Reitern (Logbuch · Karte · Höhlen · Stats · Profil) + zentraler FAB für "Neue Befahrung".

### 1. Feed (Logbuch)

**Purpose:** Chronologische Liste aller Befahrungen. Einstiegs-Screen.

**Layout:**
- Header mit Titel "Logbuch" (Fraunces 28px), Handle des eingeloggten Users
- Scroll-Liste von Trip-Karten, Abstand 14px
- 3 Layout-Varianten via Tweak (`layout`):
  - `cards` — Große Karten mit generativem SVG-Cover (120px hoch), Titel, Meta, Chips, Difficulty
  - `compact` — Zwei-zeilige Zeilen mit kleinem Datum-Badge links
  - `timeline` — Vertikale Zeitachse mit Punkten + Jahreslabeln

**Komponenten pro Trip-Karte (cards):**
- Cover: `<CLCaveArt variant={heroIcon} seed={...} theme theme>` — SVG-Illustration je nach Höhlentyp (`pit`, `tunnel`, `chamber`, `maze`, `ice`)
- Datumsbadge oben-links: `CLfmt.dateShort(date)` → z.B. "11 APR" (Inter Mono-Style, Akzentfarbe)
- Titel: Fraunces 18px 600
- Höhlenname + Region: Inter 12px 500, muted
- Chips-Reihe: Typ, Nass-Status, Seil-Status (siehe **Chip-Vokabular** unten)
- Difficulty (3 Achsen T/K/P) unten-rechts, Modus via Tweak

**Interaktion:** Tap auf Karte → Detail-Screen.

### 2. Detail (Befahrung)

**Purpose:** Alle Metadaten und Notizen einer einzelnen Befahrung.

**Layout:**
- **Hero** (260px): Full-bleed `CLCaveArt`, Gradient-Overlay unten, Titel (Fraunces 24px 600) + Höhlenname + Datum darüber gelegt
- Back-Button oben-links (runder 36×36 Button, `bgCard` + `border`)
- **Metadaten-Grid** (2 Spalten): Start · Ende · Dauer · Tiefe · Länge · Rating
- **Chips-Reihe:** Typ, Wet, Rope, Wetter
- **Difficulty-Block:** Große Darstellung aller 3 Achsen, Modus via Tweak
- **Team-Sektion:** Avatare (Initialen in Kreisen mit Akzent-BG) + Namen
- **Gear-Liste:** Icons + Labels (2 Spalten)
- **Hazards:** Warnsymbole + Text (Danger-Farbe)
- **Notes:** Fraunces 15px, `text-wrap: pretty`, Zeilenhöhe 1.6
- **Foto-Grid-Teaser:** 3-Spalten, Platzhalter-Thumbnails mit Count

### 3. Neue Befahrung (4-Schritt-Flow)

**Purpose:** Guided Form zum Anlegen einer Befahrung.

**Layout:**
- Fullscreen-Modal (ohne Tab-Bar), oben Stepper mit 4 Punkten + Schließen-X
- Schritte:
  1. **Höhle** — Bestehende Höhle auswählen ODER neue anlegen
  2. **Datum/Zeit/Dauer**
  3. **Team/Gear/Hazards** — Multi-Select Chips + Freitext
  4. **Notizen & Fotos** — Textarea (Fraunces), Foto-Upload-Zone
- Footer: "Zurück" / "Weiter" bzw. "Speichern" (Akzent-Button, volle Breite auf Schritt 4)

**Schritt 1 — Neue Höhle Unterformular enthält:**
- Name, Region, Land, Tiefe (m), Länge (m), Typ (Dropdown), Entdeckt (Jahr)
- **Karten-Picker (Mapy.cz):** 220px Leaflet-Map, Klick setzt Pin + Koordinaten, "Hier"-Button nutzt `navigator.geolocation`
- Koordinaten-Textfeld (Mono) synchronisiert mit Pin (lat, lng — 5 Nachkommastellen)

### 4. Karte

**Purpose:** Alle eingetragenen Höhlen auf einer Übersichtskarte.

**Layout:**
- Full-height Leaflet-Map mit Mapy.cz Outdoor-Tiles
- Custom Pins: Runder Marker mit Höhlen-Icon + Badge mit Anzahl Befahrungen
- Bottom-Sheet (einklappbar, 40% Höhe): Liste der sichtbaren Höhlen, Tap → Cave-Detail
- Oben Floating-Suchfeld (Glasmorphism: `rgba(15,11,8,0.82)` + `backdrop-filter: blur(8px)`)
- Filter-Pills: Alle · DE · AT · CH · Favoriten

**Interaktion:** Tap-Pin → Popup mit Name + Befahrungszahl + "Öffnen"-CTA → Cave-Detail bzw. erste Befahrung dort.

### 5. Höhlen (Verzeichnis)

**Purpose:** Alphabetisches/gruppierbares Register aller angelegten Höhlen.

**Layout:**
- Header + Suchfeld
- Filter-Chips: Land · Typ · Sortierung (Name · Zuletzt · Tiefe · Länge)
- Listenzeile je Höhle:
  - Kleines SVG-Icon (Typ-abhängig, 40×40)
  - Name (Fraunces 16px 600)
  - Region · Land (Inter 11px muted)
  - Rechts: Tiefe/Länge (Mono) + Befahrungszähler als Chip

### 6. Dashboard (Stats)

**Purpose:** Persönliche/kollektive Statistiken.

**Layout:**
- **KPI-Reihe** (2×2 Grid): Befahrungen · Höhlen · Gesamttiefe · Stunden — je `<CLStatTile>`
- **Balkendiagramm "Monate":** Bar-Chart der letzten 12 Monate, Y-Achse Zahl der Befahrungen, Akzentfarbe, dünne Gridlines
- **Donut "Typen":** Horizontal · Vertikal · Mixed · Labyrinth — Legende rechts
- **Heatmap "Jahr":** 52 Spalten × 7 Zeilen Grid, Farbintensität ∝ Befahrungen (GitHub-Style, aber in Akzent)
- **Top-Höhlen Liste:** Top 5 meistbesuchter Höhlen mit Zähler

### 7. Profil

**Purpose:** Eigenes Konto + Einstellungen.

**Layout:**
- Avatar-Kreis (60×60, Initialen) + Name + Handle + Rolle-Badge
- "Seit 2019" · Mitglied-Info
- Sektionen (jeweils `<CLSection title>`):
  - **Konto:** Name ändern, E-Mail, Passwort
  - **Darstellung:** Theme, Akzentfarbe, Difficulty-Modus
  - **Export:** JSON-Export · PDF-Logbuch · Höhlen-CSV
  - **Admin (nur Admins):** Nutzer verwalten, Einladungen senden
  - **Abmelden** (Danger-Farbe)

---

## Interactions & Behavior

### Navigation
- **Bottom-Tab:** 5 Reiter. FAB in der Mitte (50×50, Akzentfarbe, runder Button, -20px Top-Offset). Tab wechselt `screen` State; FAB öffnet `new`-Screen als Fullscreen-Modal.
- **Back-Button** in Detail-Screen: zurück zum letzten Tab (nicht historienbasiert, sondern zum zuletzt aktiven Tab).
- **Deep-Links nötig:** `/trip/:id`, `/cave/:id`, `/map`, `/stats`, `/profile` für PWA-Shortcuts.

### Tweaks (nur im Prototyp)
Das Tweaks-Panel in `design/tweaks-panel.jsx` ist **nur für die Design-Review**. In Produktion werden die Tweaks zu echten User-Präferenzen, gespeichert in `users.prefs` JSON-Column:
- `theme`: `dark` | `amber` | `light`
- `accent`: hex color
- `layout`: `cards` | `compact` | `timeline` (Feed-Darstellung)
- `diffMode`: `bars` | `dots` | `numeric` (Difficulty-Darstellung)

### Animationen
- **Lampen-Glow** (`@keyframes cl-lantern`): 4s ease-in-out infinite, opacity 0.9 ↔ 1.0 — auf glühenden Elementen (Akzent-Lichter im Hero, FAB).
- **Seiten-Übergänge:** Slide-in von rechts für Detail (200ms ease-out), Slide-up für "Neu"-Modal (250ms).
- **Tap-Feedback:** Scale 0.97 für 100ms auf Kartentaps.

### Form-Validierung ("Neue Befahrung")
- Schritt 1 Pflicht: Höhle (ausgewählt oder neu mit Name+Koordinaten)
- Schritt 2 Pflicht: Datum, Start, Ende (Ende muss nach Start liegen; +24h erlaubt)
- Koordinaten: `^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$`, lat ∈ [-90,90], lng ∈ [-180,180]
- Foto-Upload: JPEG/PNG/HEIC, max 10 MB, auto-rotate via EXIF, thumbs 400px + 1200px

### Offline (PWA)
- Service Worker cached App-Shell + letzte 50 Trips + Mapy-Tiles der bereits besuchten Höhlen-Regionen
- "Neue Befahrung" funktioniert offline, Queue in IndexedDB, sync bei Reconnect

---

## State Management

### Client-Side
- **Global:** `user`, `theme`, `tweaks` (Prefs), `route`
- **Per-Screen:** Trips-Liste (paginiert), Caves-Liste, gewählter Trip/Cave
- **New-Trip-Flow:** Form-Objekt mit allen 4 Schritten, persistiert in `sessionStorage` gegen versehentlichen Reload

### Server-Side (PHP Session)
- `user_id`, `role`, `csrf_token`

### Daten-Fetching
- REST-Endpoints:
  - `GET /api/trips?limit=20&offset=0&cave=<id>` — paginiert
  - `GET /api/trips/:id` — Detail inkl. Fotos-URLs
  - `POST /api/trips` — neu anlegen
  - `PATCH /api/trips/:id`, `DELETE /api/trips/:id`
  - `GET /api/caves`, `POST /api/caves`
  - `GET /api/stats` — aggregierte KPIs + Zeitreihen
  - `POST /api/upload` — multipart, returns URL

---

## Design Tokens

### Farben — Dark Theme (Default)

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#0f0b08` | Hauptbackground |
| `bgElev` | `#1a120c` | Elevated (Tab-Bar, Modals) |
| `bgCard` | `#1f1610` | Karten |
| `bgCardHi` | `#2a1e14` | Karten hervorgehoben |
| `border` | `rgba(245, 165, 36, 0.12)` | Standard Border |
| `borderHi` | `rgba(245, 165, 36, 0.25)` | Hervorgehoben |
| `text` | `#f5e8c9` | Primärtext |
| `textMute` | `#9a876a` | Sekundär |
| `textDim` | `#5a4a38` | Tertiär / Placeholder |
| `accent` | `#f5a524` | Lampenlicht-Amber, CTAs, Akzente |
| `accentDim` | `#a06b10` | Gedämpft |
| `accentSoft` | `rgba(245, 165, 36, 0.14)` | Chip-Backgrounds |
| `danger` | `#e8553a` | Errors, Hazards |
| `success` | `#7cb342` | Bestätigungen |
| `wet` | `#4db8d4` | Wasser-Indikatoren, Ice-Variant |
| `rope` | `#c97d46` | Seil-Indikatoren, Difficulty Achse K |

**Amber & Light Themes:** Vollständig definiert in `design/src/theme.jsx`. Beide Themes einbauen.

### Typografie

| Rolle | Font | Weights |
|---|---|---|
| Display / Serif | **Fraunces** (Google Fonts) | 400, 500, 600, 700, 800 (opt. Italic) |
| UI / Sans | **Inter** | 300, 400, 500, 600, 700 |
| Mono / Daten | **JetBrains Mono** | 400, 500, 600 |

**Skala:**
- Hero-Titel (Screen-Headline): Fraunces 28px 600, line-height 1.1
- Card-Titel: Fraunces 18px 600
- Body: Inter 13–15px 400/500
- Label / Small-Caps: Inter 10px 700, letter-spacing 2px, uppercase, muted
- Meta / Mono: JetBrains Mono 11–13px 500
- Notizen-Prosa: Fraunces 15px 400, line-height 1.6, `text-wrap: pretty`

### Spacing
- Screen-Padding: 18px horizontal
- Card-Padding: 14–16px
- Section-Abstand: 18px oben / 10px unten
- Chip-Gap: 6px, Chip-Padding: 4px × 9px

### Radii
- Chip: `999px` (pill)
- Card: `14px`
- Large Card / Hero: `18px`
- Input: `10–12px`
- Button: `10px`, FAB: `50%`

### Shadows
- FAB: `0 8px 24px {accent}55, 0 0 0 1px {accent}22`
- Phone-Frame (Prototyp): `0 40px 120px rgba(0,0,0,0.6), 0 0 60px {accent}0a`
- Modal: `0 20px 60px rgba(0,0,0,0.5)`

### Noise-Overlay
Body hat ein subtiles SVG-Rausch-Overlay (opacity 0.04, fractalNoise baseFrequency 0.9) für Höhlen-Textur. Siehe `design/CaveLog.html` `<style>`.

---

## Chip-Vokabular

| Feld | Werte | Icon |
|---|---|---|
| **Typ** | Horizontal, Vertikal, Mixed, Labyrinth | `tunnel` / `pit` / `mix` / `maze` |
| **Nass** | Trocken, Teilweise, Nass | `droplet-off` / `droplet-half` / `droplet` |
| **Seil** | Ohne, Mit Seil, SRT | `rope` / `rope` / `rope-tech` |

Alle Icons sind custom SVG-Strokes in `design/src/icons.jsx` (Komponente `CLIcon`). Entweder 1:1 übernehmen oder durch Lucide-Icons mit passender Anmutung ersetzen (stroke-width 1.5–1.9, amber color).

---

## Difficulty-System

3 Achsen, jeweils 1–5:
- **T** = Technisch (technische Kletter-/Abseil-Schwierigkeit) — Farbe `accent`
- **K** = Körperlich (Ausdauer, Engstellen) — Farbe `rope`
- **P** = Psychisch (Exposition, Enge, Dunkelheit) — Farbe `wet`

3 Darstellungsmodi, User-Präferenz:
- `bars` — 5 vertikale Säulen aufsteigend, farbig gefüllt bis zum Wert
- `dots` — 5 Punkte, farbig gefüllt bis zum Wert
- `numeric` — Kompakte Badges `T:5 K:4 P:3` in Mono

Komponente: `<CLDifficulty diff={{t,k,p}} mode theme size>` — siehe `design/src/atoms.jsx`.

---

## Database Schema (Vorschlag)

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  handle VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','viewer') NOT NULL DEFAULT 'viewer',
  prefs JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE caves (
  id VARCHAR(64) PRIMARY KEY,         -- slug
  name VARCHAR(180) NOT NULL,
  region VARCHAR(180),
  country CHAR(2),                    -- DE/AT/CH/...
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  depth_m INT,
  length_m INT,
  type ENUM('Horizontal','Vertikal','Mixed','Labyrinth'),
  discovered_year SMALLINT,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX (country), INDEX (lat, lng)
);

CREATE TABLE trips (
  id VARCHAR(64) PRIMARY KEY,
  cave_id VARCHAR(64) NOT NULL,
  title VARCHAR(240) NOT NULL,
  date DATE NOT NULL,
  start_time TIME, end_time TIME,
  duration_min INT,
  type ENUM('Horizontal','Vertikal','Mixed','Labyrinth'),
  wet ENUM('Trocken','Teilweise','Nass'),
  rope ENUM('Ohne','Mit Seil','SRT'),
  diff_t TINYINT, diff_k TINYINT, diff_p TINYINT,
  rating TINYINT,
  depth_m INT, length_m INT,
  weather VARCHAR(180),
  notes TEXT,
  hero_icon ENUM('pit','tunnel','chamber','maze','ice') DEFAULT 'tunnel',
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cave_id) REFERENCES caves(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX (date), INDEX (cave_id)
);

CREATE TABLE trip_team (
  trip_id VARCHAR(64), member_name VARCHAR(120),
  member_user_id INT NULL,
  PRIMARY KEY (trip_id, member_name),
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE trip_gear (
  trip_id VARCHAR(64), gear VARCHAR(120),
  PRIMARY KEY (trip_id, gear),
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE trip_hazards (
  trip_id VARCHAR(64), hazard VARCHAR(240),
  PRIMARY KEY (trip_id, hazard),
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id VARCHAR(64) NOT NULL,
  path VARCHAR(500) NOT NULL,
  thumb_path VARCHAR(500),
  caption TEXT,
  taken_at DATETIME,
  gps_lat DECIMAL(9,6), gps_lng DECIMAL(9,6),
  width INT, height INT,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);
```

---

## Mapy.cz Integration

**API-Key:** Account auf https://developer.mapy.com erstellen, Key in PHP-Config speichern, ins Frontend über `<script>window.__MAPY_API_KEY='…'</script>` oder Meta-Tag injizieren (nie ins Repo committen).

**Tile-URL:** `https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey={KEY}`

**Attribution (Pflicht):** Leaflet-Control `L.control.attribution` mit Logo-Link zu mapy.cz. Siehe `design/src/screens-map.jsx` (Komponente `CLMapyMap`) für die komplette Leaflet-Init inkl. Attribution-Control und Custom-Pin-Rendering.

**Pin-Style:** Custom `divIcon` mit inline SVG — runder Kreis in `accent`, Höhlen-Icon weiß, kleines Zähler-Badge rechts oben für Befahrungszahl.

---

## Rollen & Berechtigungen

| Action | Admin | Viewer |
|---|---|---|
| Trips lesen | ✓ | ✓ |
| Caves lesen | ✓ | ✓ |
| Stats sehen | ✓ | ✓ |
| Neue Trip anlegen | ✓ | — |
| Trip bearbeiten/löschen | ✓ (eigene + andere) | — |
| Neue Cave anlegen | ✓ | — |
| Foto-Upload | ✓ | — |
| Nutzer verwalten | ✓ | — |
| Einladungen senden | ✓ | — |

Viewer-Accounts werden per Einladung (Magic-Link-Email) erstellt. Keine öffentliche Registrierung.

---

## Assets

- **Fonts:** Google Fonts (Fraunces, Inter, JetBrains Mono) — self-hosten für DSGVO via google-webfonts-helper
- **Icons:** Custom SVG-Strokes in `design/src/icons.jsx`. Alternative: Lucide Icons mit passenden Namen.
- **Cave-Cover-Art:** Generative SVG aus 5 Varianten (`pit`, `tunnel`, `chamber`, `maze`, `ice`). Code in `design/src/atoms.jsx` → `<CLCaveArt>`. **Seed-basiert deterministisch** (trip.id als Seed-Quelle).
- **Map-Tiles:** Mapy.cz (siehe oben), keine lokalen Tiles nötig.
- **Noise-Texture:** SVG-inline in body::before, siehe `CaveLog.html`.

---

## Files

```
design/
├── CaveLog.html              # Root, lädt alle Scripts
├── android-frame.jsx         # Prototyp-only: Android-Bezel (ignorieren in Produktion)
├── tweaks-panel.jsx          # Prototyp-only: Design-Review-Panel (ignorieren)
└── src/
    ├── theme.jsx             # ★ 3 Themes (dark/amber/light) — in Produktion als CSS-Variablen
    ├── data.jsx              # Mock-Daten (Beispiel-Höhlen & Trips)
    ├── icons.jsx             # ★ Icon-Library (custom SVG)
    ├── atoms.jsx             # ★ Bausteine: CLStars, CLChip, CLDifficulty, CLCaveArt, CLStatTile, CLSection, CLfmt
    ├── screens-feed.jsx      # Feed-Screen mit 3 Layout-Varianten
    ├── screens-detail.jsx    # Detail-Screen
    ├── screens-new.jsx       # 4-Schritt-Flow inkl. Mapy-Picker
    ├── screens-map.jsx       # ★ Karten-Screen inkl. CLMapyMap-Komponente (Leaflet + Mapy.cz)
    ├── screens-caves.jsx     # Höhlen-Verzeichnis
    ├── screens-stats.jsx     # Dashboard
    ├── screens-profile.jsx   # Profil
    └── app.jsx               # Root-Component, Navigation, Tweaks-Verdrahtung
```

**★ = Kern-Dateien mit Tokens, Logik und wiederverwendbaren Komponenten.** Diese zuerst lesen.

---

## Empfohlene Umsetzungs-Reihenfolge

1. **Setup:** PHP-Projekt, DB-Schema, Auth (Session-basiert), CSRF
2. **Design-System:** Themes als CSS-Variablen, Typo, Atome (Chip, Difficulty, StatTile, Section, Stars, CaveArt)
3. **Feed + Detail:** read-only zuerst mit Seed-Daten
4. **Neue Befahrung:** 4-Schritt-Flow mit Mapy-Picker
5. **Karte:** Leaflet + Mapy-Tiles, Pins
6. **Höhlen-Verzeichnis + Filter**
7. **Dashboard:** Aggregate-Queries, Charts
8. **Profil + Admin-Tools + Einladungen**
9. **PWA-Hardening:** Service Worker, Offline-Queue, Installability
10. **Export-Funktionen:** PDF-Logbuch, JSON, CSV

---

**Kontakt für Rückfragen:** Der ursprüngliche Designer (dieses Chat-Projekt) steht für Klärungen zur Verfügung. Bei Ambiguitäten lieber nachfragen als raten — das Design ist zweckmäßig, kein Wort und kein Pixel ist Zufall.
