<?php
/**
 * Einstellungen für die Oberfläche — als JavaScript, nicht als JSON.
 *
 * Wird in index.html vor dem Anwendungsbündel eingebunden und setzt Werte auf
 * `window`. Zweck: Der Mapy.cz-Schlüssel steckt sonst fest im gebauten
 * Bündel (`VITE_MAPY_API_KEY` wird beim Bauen eingesetzt). Wer CaveLog als
 * fertiges Paket hochlädt, baut aber nichts — der käme nie an einen Schlüssel.
 * So trägt jeder seinen eigenen in `config/config.php` ein, ohne Bauwerkzeuge.
 *
 * Ohne Schlüssel bleibt der Wert leer; die Karte weicht dann selbsttätig auf
 * OpenStreetMap aus.
 *
 * Bewusst ohne Anmeldung: Das Skript lädt bereits beim Seitenaufbau, also vor
 * dem Login. Der Schlüssel wäre für Angemeldete ohnehin in den Kachel-Adressen
 * sichtbar — Mapy.cz erlaubt es, ihn auf die eigene Domain zu beschränken.
 */

declare(strict_types=1);

header('Content-Type: application/javascript; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');

$mapyKey = '';
try {
    $cfgFile = __DIR__ . '/../config/config.php';
    if (is_file($cfgFile)) {
        $cfg = require $cfgFile;
        if (is_array($cfg)) $mapyKey = (string)($cfg['mapy_key'] ?? '');
    }
} catch (Throwable $e) {
    $mapyKey = '';   // Eine unvollständige Konfiguration darf die App nicht aufhalten
}

// Maskierung für den HTML-Kontext: Ohne JSON_HEX_TAG würde ein „</script>" im
// Wert den Skriptblock der Seite beenden und alles Folgende als neues Skript
// ausführen. Die Flags wandeln < > & ' " in \uXXXX um.
echo 'window.__MAPY_API_KEY = '
   . json_encode($mapyKey, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT)
   . ";\n";
