# CaveLog installieren — Schritt für Schritt (ohne Vorkenntnisse)

Diese Anleitung erklärt, wie du CaveLog auf deinem eigenen Webserver installierst — ohne Terminal, ohne MySQL, ohne Programmierkenntnisse.

**Was du brauchst:**
- Einen Webspace mit PHP 8+ (z.B. all-inkl.com, Strato, IONOS, Hetzner)
- Ein FTP-Programm (wir empfehlen **FileZilla** — kostenlos)
- Etwa 15 Minuten Zeit

---

## 1. Das Paket herunterladen

1. Gehe zu **https://github.com/gdl-joe/CaveLog**

2. Klicke auf den grünen Button **`<> Code`**

3. Im Dropdown wähle **„Download ZIP"**

   ![GitHub Download ZIP](https://docs.github.com/assets/cb-20363/mw-1440/images/help/repository/code-button.webp)

4. Das Zip-Archiv wird heruntergeladen (ca. 2–3 MB)

5. Entpacke das Archiv auf deinem Computer:
   - Windows: Rechtsklick → „Alle extrahieren"
   - Mac: Doppelklick auf die Zip-Datei

6. Es entsteht ein Ordner namens **`CaveLog-main`**

---

## 2. FileZilla installieren (falls noch nicht vorhanden)

1. Gehe zu **https://filezilla-project.org**
2. Klicke auf „Download FileZilla Client"
3. Installiere das Programm

---

## 3. Mit dem Server verbinden (FTP)

Du brauchst deine FTP-Zugangsdaten — diese findest du im Kundenbereich deines Hosters.

**Bei all-inkl.com:**
- KAS → Webhosting → FTP-Zugänge

**FileZilla öffnen:**

1. Oben in der Schnellverbindungsleiste eingeben:
   - **Server:** `ftp.deine-domain.de`
   - **Benutzername:** dein FTP-Benutzer
   - **Passwort:** dein FTP-Passwort
   - **Port:** `21`

2. Klicke **„Verbinden"**

3. Im rechten Bereich (Server) navigiere in den Webroot:
   - Bei all-inkl.com: `html/`
   - Bei Strato/IONOS: oft direkt das Root-Verzeichnis

---

## 4. Dateien hochladen

Jetzt lädst du die Dateien hoch. **Wichtig:** Du lädst den **Inhalt** der Ordner hoch — nicht die Ordner selbst (außer wo angegeben).

### Was aus dem Ordner `CaveLog-main/public/` hochladen:

Öffne in FileZilla links (Computer) den Ordner `CaveLog-main/public/`.
Wähle **alle Dateien und Ordner** darin aus (Strg+A / Cmd+A).
Ziehe sie in das `html/`-Verzeichnis auf dem Server (rechts).

Du lädst hoch:
```
✓ index.html
✓ manifest.webmanifest
✓ icon-192.png
✓ icon-512.png
✓ registerSW.js
✓ sw.js
✓ workbox-*.js
✓ .htaccess          ← sehr wichtig!
✓ assets/            ← ganzer Ordner
```

### Diese Ordner aus `CaveLog-main/` direkt hochladen:

Für jeden Ordner: Links navigieren, Ordner auswählen, nach rechts in `html/` ziehen.

```
✓ api/
✓ lib/
✓ config/
✓ database/
✓ setup/
✓ db/         ← leerer Ordner (wird für die Datenbank gebraucht)
```

### Ordner-Rechte setzen

Der `uploads/`-Ordner muss erst erstellt werden und benötigt Schreibrechte:

1. Im rechten Bereich (Server) in `html/` rechtsklicken → „Ordner erstellen" → `uploads`
2. Auf den `uploads`-Ordner rechtsklicken → „Dateirechte" → `755` eingeben

---

## 5. Einrichtung im Browser

Jetzt die eigentliche Magie: Öffne deinen Browser und rufe auf:

```
https://deine-domain.de/setup/init.php
```

Du siehst ein Formular mit einer System-Prüfung:

1. Alle Häkchen sollten **grün** sein ✓
2. Gib deinen **Namen** ein (z.B. Marco Kellner)
3. Gib deine **E-Mail-Adresse** ein — damit loggst du dich später ein
4. Wähle ein **sicheres Passwort** (mindestens 10 Zeichen)
5. Passwort nochmal eingeben
6. Auf **„CaveLog einrichten →"** klicken

Wenn alles klappt, erscheint ein grünes Häkchen ✅

---

## 6. Die Setup-Datei löschen (wichtig!)

Gehe zurück zu FileZilla. Auf dem Server in `html/setup/` rechtsklicke auf `init.php` und wähle **„Löschen"**.

> ⚠️ Diesen Schritt nicht vergessen — die Datei lässt sonst jeden einen neuen Admin anlegen!

---

## 7. Einloggen

Rufe deine Domain auf:

```
https://deine-domain.de
```

Du siehst den Login-Bildschirm. Gib die E-Mail und das Passwort ein, die du in Schritt 5 gewählt hast.

**Willkommen bei CaveLog!** ⛰️

---

## Häufige Probleme

### „Require all denied" oder weiße Seite
→ Die `.htaccess`-Datei aus `public/` fehlt oder wurde nicht hochgeladen. Bitte nochmal prüfen.

### „Verbindung abgelehnt" beim FTP
→ Prüfe Server-Adresse und Port. Bei all-inkl.com manchmal `ftpXX.all-inkl.com` statt der Domain.

### `setup/init.php` zeigt rote Kreuze
→ Dein Hoster hat PDO SQLite nicht aktiviert. Im Kundencenter unter PHP-Einstellungen nachschauen, oder Hoster kontaktieren.

### Seite lädt aber nichts passiert
→ JavaScript ist deaktiviert oder der Browser zu alt. Bitte Chrome oder Firefox in aktueller Version verwenden.

---

## Optionales: Mapy.cz Karte aktivieren

Ohne API-Key zeigt die Karte OpenStreetMap-Tiles — das funktioniert, aber ohne die schönen Outdoor-Topografiekarten.

Für Mapy.cz:
1. Kostenlosen Account anlegen auf **https://developer.mapy.com**
2. Dort einen API-Key erstellen
3. Die Datei `frontend/.env.local` anlegen (lokal auf deinem Computer):
   ```
   VITE_MAPY_API_KEY=dein-key-hier
   ```
4. Neu bauen: `cd frontend && npm run build`
5. Nur die Datei `html/assets/index-*.js` erneut hochladen

---

*Diese Anleitung wurde für Hoster mit PHP 8+ und aktiviertem PDO SQLite geschrieben (Standard bei den meisten Anbietern).*
