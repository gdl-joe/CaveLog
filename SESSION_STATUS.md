# Projektstand — CaveLog
Zuletzt aktualisiert: 2026-04-24

## Was wurde gemacht (Session 4 — Vervollständigung)

### Foto-Upload komplett fertig
- `api/photos.php` — GET `/api/photos?trip_id=xxx` + DELETE `/api/photos?id=xxx`
- `api/index.php` — Route `photos` ergänzt
- `api.js` — `getPhotos()` und `deletePhoto()` ergänzt

### NewScreen — echte Dateiauswahl
- Schritt 4: echter `<input type="file" multiple>` mit Vorschau (via `createObjectURL`)
- Vorschau-Grid mit Entfernen-Button pro Bild
- Dateianzahl im Label (`3 Fotos ausgewählt`)
- Upload-Loop nach Trip-Speicherung, sequenziell
- Fortschrittsanzeige im Speichern-Button: `Fotos 2/5…`
- Erfolgsscreen zeigt Foto-Anzahl an

### DetailScreen — Fotos-Tab vollständig
- Fotos werden beim ersten Tab-Wechsel via API geladen (lazy, nur einmal)
- Echte Thumbnails aus DB (`thumb_path` → `path` als Fallback)
- GPS-Marker-Badge wenn EXIF-Koordinaten vorhanden
- **Upload-Button nur für Admins** (role-Check via `user`-Prop)
- Upload: mehrere Dateien, sequenziell, `uploading`-State
- Fallback auf Mock-Platzhalter wenn API keine Fotos zurückgibt
- Leer-State: "Noch keine Fotos für diese Befahrung."

### Sonstiges
- `App.jsx`: `user`-Prop an DetailScreen weitergegeben
- Build: sauber, 51 Module, 11 PWA-Precache-Entries

## Produktionsreif-Status: VOLLSTÄNDIG ✓

Alle Features implementiert:
- [x] Login / Logout / Auth
- [x] Feed (3 Layouts), Detail (4 Tabs), Karte, Höhlen, Stats, Profil
- [x] Neue Befahrung speichern (Cave + Trip via API)
- [x] Foto-Upload beim Anlegen (NewScreen)
- [x] Foto-Upload nachträglich (DetailScreen, nur Admin)
- [x] Echte Foto-Anzeige aus DB (Thumbnails)
- [x] PWA: Icons, Manifest, Service Worker, Offline-Caching
- [x] Admin-Setup-Script
- [x] Datenbank-Schema komplett

## Deploy-Checkliste (all-inkl.com)

```bash
# 1. Build
cd frontend && npm run build

# 2. Hochladen nach ~/html/ (FTP/SFTP):
#    public/* → html/
#    api/      → html/api/
#    lib/      → html/lib/
#    config/   → html/config/
#    uploads/  → html/uploads/   (Ordner, 755)
#    setup/    → html/setup/     (nach Admin-Anlegen löschen!)
#    .htaccess → html/.htaccess

# 3. DB: schema.sql via phpMyAdmin einspielen
# 4. config/config.php anpassen (DB-Zugangsdaten, Mapy-Key)
# 5. https://domain.de/setup/create-admin.php aufrufen
# 6. setup/ löschen
```

## Offen (bewusst zurückgestellt)
- Foto-Vollbild-Lightbox (Tap auf Thumbnail)
- Foto löschen in DetailScreen (API-Endpunkt ist fertig)
- Einladungs-Flow für Viewer (Magic-Link-E-Mail)
- Offline-Queue für neue Trips (IndexedDB)
