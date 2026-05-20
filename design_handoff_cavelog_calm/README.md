# Handoff: CaveLog Calm

Eine ruhige, outdoor-sachliche Mobile-App für Höhlenforschung — Logbuch, Höhlenverzeichnis, Karte, Statistik, Profil.

---

## Über die Design-Dateien

Die Dateien in diesem Bundle sind **Design-Referenzen, gebaut in HTML/React**. Sie zeigen Look, Verhalten, Komponenten und Inhalt der App, sind aber **kein Production-Code zum direkten Übernehmen**.

Die Aufgabe ist, diese HTML-Designs in der Ziel-Umgebung des Codebase **nachzubauen** (React Native / Expo, SwiftUI, Jetpack Compose, Flutter etc.) — unter Verwendung der dort etablierten Patterns, Theming-Systeme und Komponenten-Bibliotheken. Falls noch keine Umgebung existiert: empfohlen wird **React Native + Expo** (kommt dem aktuellen Prototyp am nächsten und passt zur Mobile-First-Natur der App).

## Fidelity

**High-Fidelity (hifi)** — die Mocks sind pixel-genau mit finalen Farben, Typografie, Spacing und Interaktionen. Werte wie Hex-Codes, Schriftgrößen, Padding, Border-Radien sind in dieser README abschließend dokumentiert und sollen **1:1** umgesetzt werden.

Layout-Entscheidungen, Komponenten-Anatomie und State-Modellierung sind ebenfalls final — keine Notwendigkeit, sie noch einmal aufzurollen.

---

## Inhalt

1. [Architektur & Navigation](#architektur--navigation)
2. [Design-Tokens](#design-tokens)
3. [Globale Komponenten (Atoms)](#globale-komponenten-atoms)
4. [Screens](#screens)
   - [01 Logbuch (Feed)](#01-logbuch-feed)
   - [02 Trip-Detail](#02-trip-detail)
   - [03 Neue Befahrung (Wizard)](#03-neue-befahrung-wizard)
   - [04 Karte](#04-karte)
   - [05 Höhlen](#05-höhlen)
   - [06 Statistik](#06-statistik)
   - [07 Profil](#07-profil)
5. [Datenmodell](#datenmodell)
6. [Tweaks (Layout-Varianten)](#tweaks-layout-varianten)
7. [Assets](#assets)
8. [Dateiliste](#dateiliste)

---

## Architektur & Navigation

**Plattform:** Mobile, ausschließlich Hochformat. Design-Viewport: **390 × 844 px** (iPhone 14 Logikgröße — Layouts sind aber agnostisch und sollen für übliche Smartphone-Größen 360–430 px Breite skalieren).

**Top-Level-Navigation:** 4 Tabs in einer Bottom-TabBar, mit zentralem Floating-Action-Button (FAB) für „neue Befahrung":

| Tab | Label  | Icon       | Screen           |
|-----|--------|------------|------------------|
| 1   | Logbuch| `feed`     | Feed             |
| 2   | Karte  | `map`      | Map              |
| —   | (FAB)  | `plus`     | Neue Befahrung   |
| 3   | Höhlen | `cave`     | Höhlen-Liste     |
| 4   | Profil | `user`     | Profil           |

**Modal/Stack-Screens** (überdecken TabBar):
- `Trip-Detail` (push aus Feed)
- `Neue Befahrung` (Modal, 4-Schritte-Wizard, von FAB)
- `Statistik` (push aus Profil)

**TabBar-Verhalten:** Bei `detail` und `new` wird die TabBar ausgeblendet (full-screen). Sonst immer sichtbar. Höhe **64 px** Inhalt + **18 px** Home-Indicator-Bereich darunter (gesamt 82 px).

---

## Design-Tokens

### Farb-Palette

Zwei Themes: **Hell (Default)** und **Dunkel**. Beide folgen einer Outdoor-Naturpalette mit Moos-Grün als Primär- und Terracotta als Komplementärakzent.

#### Hell (Light)

| Token         | Hex       | Verwendung                                               |
|---------------|-----------|----------------------------------------------------------|
| `bg`          | `#f1f3ec` | App-Background (warmes Off-White, leicht grünstichig)    |
| `bgElev`      | `#fafbf6` | Erhöhte Flächen (Modals)                                 |
| `bgCard`      | `#fafbf6` | Karten, Tiles                                            |
| `bgCardHi`    | `#e6ebde` | Hervorgehobene Karten (z.B. aktive Tabs in Pickern)      |
| `bgSubtle`    | `#dfe4d4` | Sehr dezente Flächen (Heatmap-Empty-Zellen, Map-BG)      |
| `border`      | `#cdd3bf` | Standard-Borders (1px)                                   |
| `borderHi`    | `#a4ad94` | Stärkere Borders, leere Sterne                           |
| `text`        | `#1a2620` | Haupttext                                                |
| `textMute`    | `#5d6a5e` | Sekundärtext, Labels                                     |
| `textDim`     | `#94a094` | Tertiärtext, Hints                                       |
| `accent`      | `#2f5d3d` | **Primär — sattes Moos/Tannengrün**                      |
| `accentDim`   | `#1f4429` | Hover/Pressed                                            |
| `accentSoft`  | `#d4e1cc` | Sehr helles Akzent-Tint (Badge-BG)                       |
| `warm`        | `#b85d3a` | **Komplementär — Terracotta** (Daten, Wärme, Erde)       |
| `warmDim`     | `#8c421f` | Hover/Pressed-Variante warm                              |
| `warmSoft`    | `#f1d9c8` | Sehr helles Warm-Tint (Foto-Platzhalter)                 |
| `ochre`       | `#c08a2e` | **Sekundärakzent — Ocker** (Sterne, Highlights)          |
| `ochreSoft`   | `#f0e0b8` | Sehr helles Ocker-Tint                                   |
| `danger`      | `#a14b2a` | Fehler, Hazard-Chips, destruktive Aktionen               |
| `success`     | `#4f7a3e` | Erfolgsmeldungen                                         |
| `wet`         | `#3f6a82` | Wasser-Chips, Difficulty-P-Achse                         |
| `rope`        | `#8a5a30` | Seil-Chips                                               |
| `diffNeutral` | `#2f5d3d` | Standard-Difficulty-Farbe (= accent)                     |

#### Dunkel (Dark)

| Token         | Hex       |
|---------------|-----------|
| `bg`          | `#131a16` |
| `bgElev`      | `#1c2520` |
| `bgCard`      | `#1f2925` |
| `bgCardHi`    | `#26312c` |
| `bgSubtle`    | `#2a3530` |
| `border`      | `#2c3631` |
| `borderHi`    | `#475048` |
| `text`        | `#e8eee6` |
| `textMute`    | `#8d978d` |
| `textDim`     | `#5a635c` |
| `accent`      | `#7fbf8a` |
| `accentDim`   | `#5a9968` |
| `accentSoft`  | `#26352c` |
| `warm`        | `#d8825a` |
| `warmDim`     | `#a55a36` |
| `warmSoft`    | `#3a261d` |
| `ochre`       | `#dba858` |
| `ochreSoft`   | `#3a2f1c` |
| `danger`      | `#c47158` |
| `success`     | `#90a878` |
| `wet`         | `#7298ad` |
| `rope`        | `#c79872` |
| `diffNeutral` | `#7fbf8a` |

**Theme-Toggle:** in den Tweaks (Settings)-Panel verfügbar; per `prefers-color-scheme` als Default optional.

### Stage-Background (außerhalb des Phone-Frames)

- Hell: `radial-gradient(ellipse at top, #fbfbf7 0%, #e2e6da 85%)`
- Dunkel: `radial-gradient(ellipse at top, #1d2220 0%, #0d100e 85%)`

### Typografie

**Schriften** (Google Fonts):
- **Inter** — UI, Headings, Body. Gewichte: 400, 500, 600, 700
- **JetBrains Mono** — Daten (Datum, Koordinaten, Tiefen-/Längenangaben). Gewichte: 400, 500, 600

**Skala:**

| Rolle                     | Größe | Gewicht | Letter-Spacing | Line-Height |
|---------------------------|-------|---------|----------------|-------------|
| Display (Detail-H1)       | 24px  | 600     | -0.4px         | 1.18        |
| Display (Stats-H1)        | 24px  | 600     | -0.6px         | 1.1         |
| H2 / Card-Title           | 18px  | 600     | -0.2px         | 1.1         |
| H3 / Card-Title kompakt   | 14px  | 600     | 0              | 1.2         |
| Body                      | 14px  | 400     | 0              | 1.5         |
| Body small                | 13px  | 400     | 0              | 1.5         |
| Label                     | 12px  | 500     | 0              | 1.4         |
| Section-Header (uppercase)| 10–11px | 600   | 0.6–1.2px      | 1           |
| Datum/Daten (Mono)        | 11px  | 600     | 0.3px          | 1           |
| Mono Label klein          | 9px   | 400–600 | 0.5–0.8px      | 1           |
| Bottom-Tab-Label          | 9px   | 500/600 | 0.3px          | 1           |

**Convention:** Daten (Datum, Koordinaten, m/km/h-Werte, Höhen, Profile-Handle) immer in **JetBrains Mono**. Alles andere Inter.

### Spacing-Skala

`4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 40 · 64`

Standard-Padding für Screens: **horizontal 18–20 px**.
Standard-Card-Padding: **14–16 px**.
Standard-Card-Gap (Liste): **16 px** (cards), **0** (compact, nur Borders), **0** (timeline, Linie macht Trennung).

### Border-Radius

| Wert  | Verwendung                              |
|-------|-----------------------------------------|
| 0–2px | Difficulty-Bars                         |
| 4px   | Mini-Tags, Mono-Badges                  |
| 6px   | Photo-Inset (klein)                     |
| 8px   | Photo (mittel), Buttons                 |
| 10px  | Tiles, kleine Karten                    |
| 12px  | Cards                                   |
| 999px | Pills, Chips, FAB, Avatar-Badge         |

### Shadows

Sehr dezent, nur am FAB:
- FAB: `box-shadow: 0 4px 14px {accent}55`

Keine sonstigen Shadows — Hierarchie kommt durch Border + bgCard, nicht durch Schatten.

### Status-Bar / Bottom-Indicator (Phone-Frame)

- Top-Notch / Status-Bar: 44 px hoch, Inhalt: Uhrzeit, Signal, Akku
- Home-Indicator: 18 px Bereich, weiße Linie 134 × 5 px, `borderRadius: 99`

---

## Globale Komponenten (Atoms)

Alle Atoms erwarten `theme` als Prop (das aktive Theme-Objekt).

### `<CLStars value={0..5} max={5} size={13} theme />`
Bewertungsskala. Gefüllte Sterne in **`theme.ochre`**, leere in `theme.borderHi`. Stroke-Width 1.4. Gap 2px.

### `<CLChip icon={true|false} label={string} tone={'neutral'|'wet'|'rope'|'danger'|'success'|'warm'} theme />`
Kleines Pill-Tag.
- Hintergrund: `{toneColor}14` (8% Opacity)
- Border: `1px solid {toneColor}33` (20%)
- Text: `theme.text`, 11px / 500
- Padding: `3px 9px`, `borderRadius: 999`
- Tone→Color-Mapping: `neutral→accent, wet→wet, rope→rope, danger→danger, success→success, warm→warm`
- Mit Icon: 6×6 Punkt links in Tonfarbe

### `<CLDifficulty diff={{t,k,p}} mode={'bars'|'dots'|'numeric'} size={'sm'|'md'} colored={false} theme />`
Schwierigkeit auf 3 Achsen, Werte 1–5.
- **T (Technik):** `theme.accent` (Grün)
- **K (Kletterei):** `theme.warm` (Terracotta)
- **P (Passagen/Wasser):** `theme.wet` (Blau)
- `mode='bars'`: 5 ansteigende Balken, Höhe abhängig von n. Inaktiv = `theme.border`.
- `mode='dots'`: 5 Punkte, gefüllt = aktiv, ungefüllt = nur Border.
- `mode='numeric'`: kompaktes Mono-Tag pro Achse, z.B. `T 4 · K 3 · P 2`.

### `<CLPhoto theme width height={56} radius={8} label="foto" count={n|null} />`
Foto-Platzhalter. **Kein generatives SVG, kein Noise.**
- Hintergrund: `linear-gradient(135deg, theme.warmSoft 0%, theme.bgSubtle 100%)`
- Border: `1px solid theme.border`
- Mittelschrift: `JetBrains Mono`, 9px, `theme.warmDim`, Spacing 0.5
- Wenn `count` gesetzt: Label wird zu `"foto · 3"`

### `<CLStatTile icon label value unit accent={'primary'|'warm'|'ochre'} theme />`
KPI-Kachel.
- BG: `theme.bgCard`, Border `1px theme.border`, Radius 10
- **Top-Border 2px** in `accentColor` (primary=accent, warm=warm, ochre=ochre)
- Padding `14px 14px`, Flex-Spalte, Gap 6
- Label: 10px / 600, uppercase, letter-spacing 0.6, color `theme.textMute`
- Value: 24px / 600, color `theme.text`, letter-spacing -0.4
- Unit: 11px / 500, color `theme.textMute`, baseline-aligned

### `<CLSection title action theme padTop={26}>{children}</CLSection>`
Section-Wrapper. Header: 11px / 600, uppercase, letter-spacing 1.2, color `textMute`. Optional `action` (Button rechts). Padding: `{padTop}px 20px 10px`.

### `<CLRow label value hint onClick theme danger={false} last={false} />`
Settings-/Listen-Row. Padding `16px 18px`, Border-Bottom außer letzte. Label links 14px, Value rechts mono 12px, Hint darunter klein.

### `<CLIcon name={string} size={20} color strokeWidth={1.5} />`
Stroke-only SVG-Icons. Set: `feed, map, cave, user, plus, search, filter, more, chevron-right, back, star, star-filled, water, rope, hazard, depth, length, time, calendar, marker, settings, x, check`. Alle 24×24 viewBox, stroke-only.

---

## Screens

### 01 Logbuch (Feed)

**Zweck:** Liste aller Befahrungen, neueste oben. Einstiegs-Tab.

**Layout:**

```
┌─────────────────────────────────┐
│ [Status-Bar 44px]               │
├─────────────────────────────────┤
│ Logbuch                  [⚙]   │  ← Header: 64px
│ 23 Befahrungen · 12 Höhlen     │
├─────────────────────────────────┤
│ [Suche────────────────────] [⌕]│  ← Search-Bar Row
├─────────────────────────────────┤
│ [Alle][Kürzlich][Wet][Vert.][↻]│  ← Filter-Pills (horizontal scroll)
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ [📷] 14. MÄR    ★★★★☆      │ │  ← Trip-Card
│ │      Tour-Titel             │ │
│ │      Höhle · Region         │ │
│ │      [chips...] [diff]      │ │
│ └─────────────────────────────┘ │
│ ...                             │
├─────────────────────────────────┤
│ [Logbuch][Karte][+][Höhlen][👤]│  ← TabBar
└─────────────────────────────────┘
```

**Header-Block:**
- Padding `20px 18px 14px`
- Title „Logbuch" 22px / 700, color `text`, letter-spacing -0.5
- Subtitle Mono 11px, color `textMute`, Pattern: `{n} Befahrungen · {m} Höhlen`
- Settings-Button rechts: 34×34 px, BG `bgCard`, Border 1px, Radius 8

**Search-Bar:**
- Row mit 18px h-padding, 12px v-padding
- Input: BG `bgCard`, Border 1px `border`, Radius 8, Padding `8px 12px`, Placeholder „Suchen..."

**Filter-Pills:**
- Horizontale Scroll-Row, gap 6, h-padding 18, v-padding 8
- Pill: `padding: 6px 14px`, `borderRadius: 999`, 12px / 500
- Aktiv: BG `accent`, Text `bg`, Border `accent`
- Inaktiv: transparent, Text `textMute`, Border `border`
- Filter: `Alle | Kürzlich | Wet | Vertikal | Hoch | Lang`

**Trip-Card (cards-Layout):**
- Container: `bgCard`, Border 1px, Radius 12, Padding 16, Margin-bottom 16
- Flex-Row, Gap 14
- **Photo-Thumbnail links:** 72×72, Radius 8 (siehe `CLPhoto`)
- **Right-column** (flex 1):
  - Header-Row: Datum (mono 11px, **`accent`**, 600) ↔ `<CLStars>` (size 10)
  - Title: 14px / 600, color `text`, line-height 1.2
  - Subtitle: 12px, color `textMute`, Pattern `{cave.name} · {cave.region}`
  - Bottom-Row: Chips (CLChip mit tones) + `<CLDifficulty size='sm'>` rechts

**Compact-Layout** (Tweak):
- Liste ohne Cards, jede Zeile: padding `18px 20px`, Border-Bottom 1px
- Photo 48×48 links, Datum + Title + Mini-Chip-Inline rechts
- Datum-Label uppercase 9px / 600, **`accent`**, Spacing 0.8

**Timeline-Layout** (Tweak):
- Linke vertikale Linie 1px `border` bei x = 36px
- Pro Trip: Dot 9px Ø bei Linien-Position, BG `bg`, Border 1.5px **`accent`**
- Datum-Header (mono 11px, `accent`, 600) über Card
- Card selbst: BG `bgCard`, Border 1px, Radius 12, Padding 14

**TabBar-Verhalten:**
- Höhe 64px, BG `bg`, Border-Top 1px `border`
- 4 Tabs (Logbuch, Karte, Höhlen, Profil) gleichmäßig verteilt, in der Mitte ein Spacer für FAB
- Tab-Item: Icon 19px + Label 9px, Spacing 0.3, gestapelt
- Aktiv: Icon + Label in **`accent`**, Stroke-Width 1.7, Font-Weight 600
- Inaktiv: `textMute`, Stroke-Width 1.4, Weight 500
- **FAB:** absolut positioniert, top: -18, mittig, 48×48 px, Radius 50%
  - BG: `accent`, Border 2px `bg`, Icon `+` 22px in `bg`-Farbe, Stroke 2.4
  - Schatten: `0 4px 14px {accent}55`
  - onClick → screen `new`

---

### 02 Trip-Detail

**Zweck:** Volle Detailansicht einer Befahrung.

**Layout (vertikal scrollend):**

```
┌─────────────────────────────────┐
│ [< ] 14. März 2024        [⋯]  │  ← Top-Bar
├─────────────────────────────────┤
│ ━━ HERMANNSHÖHLE · HARZ        │  ← Region-Strip
│ Vermessungstour Westgang        │  ← Title H1
│ [Mixed][Trocken][Seil][Sonnig] │  ← Chips
├─────────────────────────────────┤
│ Kennzahlen                      │
│ ┌────┐┌────┐┌────┐              │
│ │08:30││17:42││9h12m│            │  ← MiniStats grid 3×2
│ │Start││Ende ││Dauer│             │
│ └────┘└────┘└────┘              │
│ ┌────┐┌────┐┌────┐              │
│ │−42m││1.8km││4 °C │             │
│ │Tief││Strck││Temp │              │
│ └────┘└────┘└────┘              │
├─────────────────────────────────┤
│ Schwierigkeit                   │
│ [Difficulty large bars/dots]    │
├─────────────────────────────────┤
│ Begleitung                      │
│ [Avatar][Avatar][Avatar]        │
├─────────────────────────────────┤
│ Fotos        [3 Fotos]          │
│ [photo][photo][photo]            │
├─────────────────────────────────┤
│ Notizen                         │
│ Lorem ipsum...                  │
├─────────────────────────────────┤
│ Ausrüstung                      │
│ • Helm · Stirn 800lm · Karbid…  │
└─────────────────────────────────┘
```

**Top-Bar:**
- Padding `12px 18px`, Flex-Row aligned
- Back-Button links: 34×34, BG `bgCard`, Border 1px, Radius 8, Icon `back`
- Datum mittig: Mono 11px / 600, color **`warm`** (Terracotta)
- More-Button rechts: idem like back

**Region-Strip + Title:**
- Padding `20px 18px 4px`
- Pre-Header-Row: 14×2 px-Strich in `accent` + Region-Label (uppercase 11px / 600, color `accent`, letter-spacing 0.4)
- H1: 24px / 600, color `text`, letter-spacing -0.4, line-height 1.18
- Chips-Row: gap 6, margin-top 12, flex-wrap

**Kennzahlen-Section:**
- 6 MiniStats in 2 Reihen × 3 Spalten, gap 8
- MiniStat: BG `bgCard`, Border 1px, Radius 10, Padding 14
- Label oben (11px, `textMute`), Value (18px / 600, mono wenn numerisch), Unit dezent

**Schwierigkeit:**
- `<CLDifficulty mode={tweak.diffMode} size='md' colored={tweak.diffColored}>` zentriert in Card

**Begleitung:**
- Horizontal-Row, 32px-Avatare (Initialen-Kreis), gap -6 (überlappend)
- Letzter: optional `+N`-Bubble

**Fotos:**
- 3-Spalten-Grid, gap 6, jeder 92px hoch, Radius 6
- Section-Header mit `action`: „3 Fotos"

**Notizen / Ausrüstung:**
- Body-Text 14px, line-height 1.5
- Ausrüstung als Bullet-Liste, mono-Highlights

**Bottom-Padding:** 90px (kein TabBar in diesem Screen — full-screen).

---

### 03 Neue Befahrung (Wizard)

**Zweck:** 4-Schritte-Wizard zum Anlegen einer Befahrung.

**Layout:**

```
┌─────────────────────────────────┐
│ [×]    Neue Befahrung          │  ← Modal-Bar
│ ━━━━──────────                  │  ← Progress 1/4
├─────────────────────────────────┤
│                                 │
│ [Step-spezifischer Inhalt]      │
│                                 │
├─────────────────────────────────┤
│ [Zurück]              [Weiter] │  ← Sticky bottom
└─────────────────────────────────┘
```

**Modal-Bar:**
- Höhe 56, Padding `12px 18px`
- Close-Button links 34×34
- Title mittig „Neue Befahrung" 16px / 600
- Progress: 4 Segmente à 25%, gap 4, Höhe 3px, Radius 99
  - Erfüllte: BG `accent`. Aktuell: BG `accent`. Künftig: BG `border`.

**Step 1 — Höhle wählen:**
- Search-Input + Liste der Höhlen (`CL_CAVES`)
- Pro Item: Name (14/600), Region (12/textMute), Mono-Badge mit `entries` Count rechts
- Empty state: „Keine Höhle? [+ Neue Höhle anlegen]"

**Step 2 — Datum & Zeit:**
- Datum-Picker (Tap → native picker)
- Start/Ende-Time in 2 nebeneinander (mono inputs)
- Computed Dauer drunter angezeigt

**Step 3 — Karte (Mapy-Picker-Mock):**
- Karten-Container 100% × 240px, `bgSubtle`-BG
- Crosshair in der Mitte
- Drag-Hint: „Karte verschieben um Position zu setzen"
- Selected-Coords: Mono unter Karte
- „Aus Cave-Datensatz übernehmen"-Toggle

**Step 4 — Details:**
- Title-Input
- Type-Picker (Mixed | Vertikal | Horizontal | Labyrinth) als Pill-Group
- Wet-Toggle (`Trocken | Feucht | Wasserführend`)
- Ratings (Sterne tap-bar)
- Difficulty (CLDifficulty input-mode → tap-bar)
- Notizen-Textarea
- Submit „Speichern" → zurück zum Feed mit dem neuen Trip oben

**Bottom-Bar:**
- Sticky, Border-Top 1px, BG `bg`, Padding `12px 18px`
- Zurück-Button (Ghost): Border `border`, Text `textMute`, 12px / 600
- Weiter-Button (Primary): BG `accent`, Text `bg`, 14px / 600, Radius 8, Padding `12px 20px`

---

### 04 Karte

**Zweck:** Geografische Übersicht aller Höhlen.

**Layout:**
- **Full-bleed Karte** (mocked: `bgSubtle` BG mit Grid-Pattern oder dezentem Topo-Linien-SVG)
- Floating Search-Bar oben (mit Inset-Drop-Shadow)
- Floating Country-Filter-Pills unter Search
- **Map-Pins:**
  - Standard: 10×10 Punkt, BG `accent`, Border 2px `bg`
  - Aktiv: 14×14, BG `warm` (Terracotta)
  - Mit Befahrungen: zusätzlicher Mono-Badge mit `entries` rechts oben am Pin
- **Bottom-Sheet** (peek 96px, expandable):
  - Beim Tap auf einen Pin: Cave-Card mit Photo, Name, Region, Stats-Strip, „Befahrungen ansehen"-Action
- **My-Location-Button** rechts oben: 40×40 Kreis, BG `bgCard`, Border 1px, Icon `target`

---

### 05 Höhlen

**Zweck:** Verzeichnis aller Höhlen, alphabetisch oder nach Region gruppiert.

**Layout:**

```
┌─────────────────────────────────┐
│ [Status-Bar]                   │
├─────────────────────────────────┤
│ Höhlen                  [⌕]    │
│ 47 Höhlen · 6 Länder           │
├─────────────────────────────────┤
│ [DE][AT][CH][SI][...]          │  ← Country-Pills
├─────────────────────────────────┤
│ HARZ, NIEDERSACHSEN              │  ← Group-Header
│ ┌─────────────────────────────┐ │
│ │ Hermannshöhle           [12]│ │  ← Cave-Row
│ │ −45m · 2.1km · Mixed        │ │
│ ├─────────────────────────────┤ │
│ │ ...                          │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Country-Pills:**
- Padding `6px 12px`, Radius 999, 11px / 500
- Aktiv: BG `accent`, Text `bg`, Border `accent`
- Inaktiv: transparent, Text `text`, Border `border`

**Group-Header:**
- 10px / 600, uppercase, letter-spacing 1.2, color `textMute`
- Padding `26px 20px 10px`

**Cave-Row:**
- Padding `18px 20px`, Border-Bottom 1px `border`
- Flex-Row, gap 14
- Name: 14px / 600
- Stats-Subtitle: Mono 11px, color `textMute`, Pattern `−{depth}m · {length} · {type}`
- **Entries-Badge rechts:** padding `3px 8px`, Radius 999, BG `accentSoft`, Border 1px `accent33`, Text `accent` mono 10px / 600

---

### 06 Statistik

**Zweck:** Aggregierte Daten über alle Befahrungen.

**Sections:**

1. **Overview-Header** — `Übersicht` Kicker + „Statistik" H1 (24/600, -0.6 spacing)

2. **KPI-Grid (2×N)** — `CLStatTile`s, gap 8, h-padding 14
   - Akzent-Rotation: index 0→primary, 1→warm, 2→ochre, 3→primary, …
   - Beispiel-KPIs: Trips, Höhlen, Stunden, Tiefe gesamt, Vert. Meter, Distanz

3. **Befahrungen pro Monat (Bars):**
   - Card BG `bgCard`, Border, Radius 10, Padding `14px 12px`
   - 12 Bars (Monate), Höhe 80, gap 4
   - **Farb-Wechsel:** gerade Indices `accent`, ungerade `warm`
   - Empty bars: opacity 0.2

4. **Heatmap (52 Wochen):**
   - 7×52 Grid, Zellen 11×11, gap 2
   - 4 Heat-Stufen:
     - 0: `bgSubtle`
     - 1: `accent` + `'40'` (alpha 25%)
     - 2: `accent` + `'90'` (alpha 56%)
     - 3: `accent` (volle Sättigung)
   - Rechts unten: Legende „weniger · mehr" mit 4 Mini-Quadraten

5. **Top-Höhlen-Bar-List:**
   - Pro Höhle: Name (14/500) + Bar (Höhe 8, Radius 4, BG `bgSubtle`) mit Füllung
   - Füllfarbe: **`warm`** (Terracotta)
   - Count rechts mono 11/600

---

### 07 Profil

**Zweck:** Nutzer-Karte + Schnellzugriff auf Statistik & Settings.

**Layout:**

**Header-Block:**
- Padding `20px 18px 14px`, Flex-Row, gap 14, aligned center
- **Avatar:** 56×56 Kreis, `linear-gradient(135deg, accent 0%, warm 100%)`, Initialen 18px / 600 in `bg`-Farbe, letter-spacing 0.5
- Name: 18px / 600, line-height 1.1
- Handle: Mono 12px, color **`warm`**, weight 600, margin-top 3
- Role-Badge: padding `2px 8px`, Radius 999, BG `accentSoft`, Border 1px `accent33`, Text `accent` 10/600 uppercase, letter-spacing 0.4

**KPI-Strip:**
- 3 `CLStatTile`s: Trips (primary) · Höhlen (warm) · Stunden (ochre)
- Padding h 14, gap 8

**Sections** (jeweils `CLSection`):
- **Mitgliedschaft:** Verein, Status, Beitragsjahr (CLRows)
- **Statistik:** „Statistik öffnen →" CLRow-Action (push)
- **Einstellungen:** Theme, Sprache, Einheiten, Privatsphäre, Daten-Export
- **Konto:** Logout (danger)

**Settings-Rows:**
- `CLRow label='Theme' value='Hell' onClick={...}` etc.
- danger: Text in `theme.danger`

---

## Datenmodell

### Cave

```ts
type Cave = {
  id: string;
  name: string;
  region: string;
  country: 'DE' | 'AT' | 'CH' | 'SI' | string;
  depth: number;     // m
  length: number;    // m
  type: 'Mixed' | 'Vertikal' | 'Horizontal' | 'Labyrinth';
  discovered: number; // year
  lat: number;
  lng: number;
  entries: number;   // count of trips
};
```

### Trip

```ts
type Trip = {
  id: string;
  caveId: string;
  date: string;       // ISO YYYY-MM-DD
  start: string;      // 'HH:MM'
  end: string;        // 'HH:MM'
  durationMin: number;
  title: string;
  type: 'Mixed' | 'Vertikal' | 'Horizontal' | 'Labyrinth';
  wet: 'Trocken' | 'Feucht' | 'Wasserführend';
  rope: string;       // e.g. 'Seil 60m'
  weather?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  diff: { t: number; k: number; p: number }; // 1..5
  depth: number;     // m, max
  distance: number;  // m, traversed
  temp?: number;     // °C
  notes?: string;
  companions: string[]; // names or initials
  photoCount: number;
  equipment: string[];
};
```

### User

```ts
type User = {
  name: string;
  handle: string;
  initials: string;   // 'MK'
  role: 'Aktiv' | 'Gast' | 'Trainer';
  trips: number;
  caves: number;
  totalHours: number;
  club?: string;
  joinedYear?: number;
};
```

Beispieldaten in `design/src/data.jsx`.

---

## Tweaks (Layout-Varianten)

Die Prototyp-App exponiert ein Tweaks-Panel. Diese Varianten sind **alle Teil des finalen Designs** — das Settings-UI der Production-App soll mindestens Theme + Layout-Modus exponieren.

| Tweak             | Werte                            | Default  | Wirkung                                              |
|-------------------|----------------------------------|----------|------------------------------------------------------|
| `theme`           | `light` / `dark`                 | `light`  | Farbpalette                                          |
| `feedLayout`      | `cards` / `compact` / `timeline` | `cards`  | Listen-Variante im Feed                              |
| `diffMode`        | `bars` / `dots` / `numeric`      | `bars`   | Difficulty-Visualisierung                            |
| `diffColored`     | `bool`                           | `true`   | Difficulty-Achsen farbig (T/K/P)                     |
| `caveListGroup`   | `region` / `country` / `alpha`   | `region` | Gruppierung in Höhlen-Liste                          |

In der Production-App sind `theme`, `feedLayout` und `caveListGroup` als User-Preference exponiert. `diffMode` / `diffColored` als Power-User-Setting.

---

## Interaktionen & Verhalten

### Navigation
- Tab-Switch: instant, kein Transition
- Push (Detail): Slide-from-right, 240ms `cubic-bezier(.2, .9, .3, 1)`
- Modal (Neue Befahrung): Slide-from-bottom, 280ms gleiche Easing
- Back: invers

### TabBar
- Icon-Stroke wechselt zwischen 1.4 (inaktiv) und 1.7 (aktiv) — instant, kein Transition
- Label-Color crossfade 120ms

### FAB
- Tap: scale(0.94) für 80ms, dann öffne Modal

### Filter-Pills / Country-Pills
- Tap → BG/Color-Swap instant. Kein Animation.

### Cards / Rows
- Tap-State: opacity 0.6 für 80ms (oder `:active` BG `bgCardHi`)
- Lange Listen sind virtualisiert (RecyclerList / FlatList)

### Suche
- Debounce 200ms, dann lokale Filterung (für jetzt)

### Wizard
- Schritt-Wechsel: Slide horizontal 200ms, mit Progress-Bar-Animation 240ms

### Map
- Pan/Zoom mit nativen Gesten
- Pin-Tap → Bottom-Sheet 320ms expand
- Bottom-Sheet drag-to-dismiss

---

## Status-Management (empfohlen)

Für React Native:
- **Zustand** oder **Jotai** für globalen State (theme, tweaks, user)
- **TanStack Query** für Daten-Fetching (Caves, Trips)
- **AsyncStorage** für Persistenz von Theme, Tweaks
- **MMKV** als schnellere Alternative für Häufig-Geschriebenes (Theme-Toggle)

---

## Assets

**Icons:** Lucide-React-Native deckt alle benötigten Icons ab (`Home, Map, Mountain, User, Plus, Search, Filter, MoreHorizontal, ChevronRight, ArrowLeft, Star, Droplet, Compass, Triangle, ArrowDown, Ruler, Clock, Calendar, MapPin, Settings, X, Check`). Die Custom-Mappings sind im Prototyp in `src/icons.jsx` dokumentiert.

**Schriften:**
- Inter (variable, woff2): https://fonts.google.com/specimen/Inter
- JetBrains Mono (variable, woff2): https://fonts.google.com/specimen/JetBrains+Mono

**Foto-Platzhalter** sind absichtlich leere Karteikarten — in der Production-App durch echte User-Uploads (von `expo-image-picker` o.ä.) zu ersetzen. Aspect-Ratios:
- Feed-Thumbnail: 1:1
- Detail-Triple: 1:1.07 (3 Spalten in 18px-padded screen, height 92)
- Map-Sheet-Photo: 16:9

**Kein Logo** definiert — falls für die App nötig, getrennt anfragen.

---

## Dateiliste

Alle Design-Files liegen in `design/`:

```
design/
├── CaveLog Calm.html        ← Einstiegsdatei. In Browser öffnen.
├── android-frame.jsx        ← Mobile-Frame (nur für Prototyp-Visualisierung)
├── tweaks-panel.jsx         ← Tweaks-Panel-UI (nur Prototyp)
└── src/
    ├── theme.jsx            ← CL_THEMES (Hell + Dunkel)
    ├── data.jsx             ← Beispieldaten (CL_CAVES, CL_TRIPS, CL_CURRENT_USER)
    ├── icons.jsx            ← Stroke-Icon-Set
    ├── atoms.jsx            ← CLStars, CLChip, CLDifficulty, CLPhoto, CLStatTile, CLSection, CLRow, CLfmt
    ├── app.jsx              ← Root + Phone-Frame + TabBar + FAB
    ├── screens-feed.jsx     ← Logbuch (3 Layouts)
    ├── screens-detail.jsx   ← Trip-Detail
    ├── screens-new.jsx      ← Wizard 4 Schritte
    ├── screens-map.jsx      ← Karte
    ├── screens-caves.jsx    ← Höhlen-Verzeichnis
    ├── screens-stats.jsx    ← Statistik
    └── screens-profile.jsx  ← Profil
```

**Zum Anschauen:** `design/CaveLog Calm.html` im Browser öffnen. Tweaks-Panel rechts unten zum Durchschalten der Varianten.

---

## Empfohlene Tech-Stack

Falls noch nichts gesetzt:

- **React Native** + **Expo SDK 51+**
- **Expo Router** für File-Based-Navigation
- **NativeWind** (Tailwind für RN) ODER **Restyle** (Shopify) für Theming — beides kommt mit dem Token-Modell hier gut klar
- **Lucide-React-Native** für Icons
- **react-native-reanimated** für Wizard-/Modal-Animationen
- **react-native-maps** + Mapy.cz Tiles oder MapLibre für Step 3 + Map-Tab
- **expo-font** für Inter + JetBrains Mono

Alle Layouts sind plattform-agnostisch — auch SwiftUI / Compose ist gangbar.

---

## Bekannte Lücken / TODOs für Implementierung

- **Echte Map-Tiles** (Prototyp zeigt Mock-BG)
- **Foto-Upload-Flow** (Prototyp hat nur Platzhalter)
- **Onboarding** (nicht designt — auf separate Anfrage)
- **Push-Benachrichtigungen** (nicht designt)
- **Offline-Sync-Strategie** (Spelunker brauchen das oft → Designentscheidung steht aus)
- **Empty-States** für leeren Feed / leere Map (nicht detailliert designt)
- **Error-States** (Form-Validation im Wizard nur skizziert)
