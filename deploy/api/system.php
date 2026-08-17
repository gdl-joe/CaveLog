<?php
require_once __DIR__ . '/bootstrap.php';

/**
 * Systemprüfung und Wartung — ausschließlich für Admins.
 *
 * GET  /api/system            Zustand: PHP, Datenbank, offene Migrationen, Altlasten
 * POST /api/system/migrate    Fehlende Spalten anlegen (MySQL und SQLite)
 * POST /api/system/cleanup    Setup-/Diagnose-Dateien vom Server löschen
 *
 * Ersetzt den Weg über phpMyAdmin und FTP. Die Liste der löschbaren Dateien ist
 * fest verdrahtet — es gibt keinen Pfad aus der Anfrage.
 */

Auth::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$parts  = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$action = $parts[count($parts) - 1];
$root   = dirname(__DIR__);   // Web-Root der App

/** Altlasten aus Setup und Fehlersuche, die live nichts zu suchen haben. */
$CLEANABLE = [
    'api/_diag.php' => [
        'label'  => 'Diagnose-Skript',
        'why'    => 'Gibt Datenbank- und Serverdetails aus. War nur zur Fehlersuche gedacht.',
        'risk'   => 'high',
    ],
    'setup/init.php' => [
        'label'  => 'Setup-Assistent',
        'why'    => 'Kann einen Admin-Zugang anlegen oder überschreiben.',
        'risk'   => 'high',
    ],
    'setup/create-admin.php' => [
        'label'  => 'Admin-Anlage (Skript)',
        'why'    => 'Legt Admin-Zugänge an. Wird nach der Einrichtung nicht mehr gebraucht.',
        'risk'   => 'high',
    ],
    'setup/generate-icons.mjs' => [
        'label'  => 'Icon-Generator',
        'why'    => 'Entwicklungswerkzeug, auf dem Server ohne Funktion.',
        'risk'   => 'low',
    ],
    'index.htm' => [
        'label'  => 'Platzhalterseite des Hosters',
        'why'    => 'Leere Startseite aus der Grundeinrichtung. Überflüssig.',
        'risk'   => 'low',
    ],
];

// ── GET /api/system ───────────────────────────────────────
if ($method === 'GET') {
    $missing = [];
    $dbError = null;
    try {
        $missing = Schema::missing();
    } catch (Throwable $e) {
        $dbError = 'Datenbank nicht erreichbar.';
    }

    $leftovers = [];
    foreach ($CLEANABLE as $rel => $info) {
        $abs = $root . '/' . $rel;
        if (is_file($abs)) {
            $leftovers[] = [
                'path'     => $rel,
                'label'    => $info['label'],
                'why'      => $info['why'],
                'risk'     => $info['risk'],
                'writable' => is_writable($abs),
            ];
        }
    }

    $uploads = $root . '/uploads';

    // Wie viele Fotos haben noch keine Vollbild-Ableitung?
    $photos = null;
    if (!$dbError && Schema::has('photos', 'full_path')) {
        try {
            $db = Database::get();
            $photos = [
                'total'   => (int)$db->query('SELECT COUNT(*) FROM photos')->fetchColumn(),
                'pending' => (int)$db->query('SELECT COUNT(*) FROM photos WHERE full_path IS NULL')->fetchColumn(),
            ];
        } catch (Throwable $e) { $photos = null; }
    }

    Response::json([
        'php'      => PHP_VERSION,
        'driver'   => Database::driver(),
        'db_error' => $dbError,
        'checks'   => [
            ['key' => 'display_errors', 'label' => 'Fehlerausgabe abgeschaltet',
             'ok'  => !filter_var(ini_get('display_errors'), FILTER_VALIDATE_BOOL),
             'hint' => 'Steht die Fehlerausgabe an, sieht jeder Besucher PHP-Meldungen im Klartext.'],
            ['key' => 'gd', 'label' => 'Bildbearbeitung (GD)',
             'ok'  => extension_loaded('gd'),
             'hint' => 'Ohne GD lassen sich keine Fotos verkleinern.'],
            ['key' => 'uploads', 'label' => 'Foto-Ordner beschreibbar',
             'ok'  => is_dir($uploads) && is_writable($uploads),
             'hint' => 'Ohne Schreibrecht auf uploads/ schlagen Foto-Uploads fehl.'],
        ],
        'migrations' => $missing,
        'leftovers'  => $leftovers,
        'photos'     => $photos,
    ]);
}

// ── POST /api/system/migrate ──────────────────────────────
if ($method === 'POST' && $action === 'migrate') {
    Auth::verifyCsrf();
    $result = Schema::migrate();
    Response::json([
        'applied' => $result['applied'],
        'failed'  => $result['failed'],
        'missing' => Schema::missing(),
    ]);
}

// ── POST /api/system/photos ───────────────────────────────
// Erzeugt fehlende Vollbild-Ableitungen für bereits hochgeladene Fotos.
// Arbeitet in kleinen Paketen, damit Shared Hosting nicht ins Zeitlimit läuft;
// die Oberfläche ruft so lange auf, bis `remaining` 0 ist.
if ($method === 'POST' && $action === 'photos') {
    Auth::verifyCsrf();

    if (!Schema::has('photos', 'full_path')) {
        Response::error('Bitte zuerst die Datenbank aktualisieren.', 409);
    }

    $cfg   = require __DIR__ . '/../config/config.php';
    $db    = Database::get();
    $body  = getBody();
    $batch = min(max((int)($body['batch'] ?? 5), 1), 20);
    $after = max((int)($body['after'] ?? 0), 0);

    // Vorankommen über die ID, nicht über den Füllstand der Spalte: Ein Foto,
    // das sich nicht verarbeiten lässt, hält den Lauf so nicht auf — und wird
    // auch nicht fälschlich als erledigt vermerkt.
    $todo = $db->prepare(
        'SELECT id, path FROM photos WHERE full_path IS NULL AND id > ? ORDER BY id ASC LIMIT ' . $batch
    );
    $todo->execute([$after]);
    $rows = $todo->fetchAll();

    $done    = 0;
    $lastId  = $after;
    $skipped = [];
    foreach ($rows as $row) {
        $lastId = (int)$row['id'];

        $abs = Images::toAbsolute((string)$row['path'], (string)$cfg['upload_dir']);
        if (!$abs || !is_file($abs)) {
            $skipped[] = ['id' => (int)$row['id'], 'reason' => 'Datei nicht gefunden'];
            continue;
        }

        $res = Images::derive($abs);
        if (!$res) {
            $skipped[] = ['id' => (int)$row['id'], 'reason' => 'Kein lesbares Bild'];
            continue;
        }

        // Wurde keine Ableitung erzeugt, ist das Original klein genug → dorthin zeigen.
        $full  = !empty($res['created']['full'])  ? Images::variantPath((string)$row['path'], 'full')  : $row['path'];
        $large = !empty($res['created']['large']) ? Images::variantPath((string)$row['path'], 'large') : null;
        $thumb = !empty($res['created']['thumb']) ? Images::variantPath((string)$row['path'], 'thumb') : null;

        $sets = ['full_path = ?'];
        $vals = [$full];
        // Fehlende alte Ableitungen gleich mitnehmen
        if ($large) { $sets[] = 'large_path = COALESCE(large_path, ?)'; $vals[] = $large; }
        if ($thumb) { $sets[] = 'thumb_path = COALESCE(thumb_path, ?)'; $vals[] = $thumb; }
        if (Schema::has('photos', 'width'))  { $sets[] = 'width = ?';  $vals[] = $res['width']; }
        if (Schema::has('photos', 'height')) { $sets[] = 'height = ?'; $vals[] = $res['height']; }

        $vals[] = $row['id'];
        $db->prepare('UPDATE photos SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($vals);
        $done++;
    }

    // Noch offen = alles ohne Vollbild-Fassung hinter der zuletzt geprüften ID.
    $rest = $db->prepare('SELECT COUNT(*) FROM photos WHERE full_path IS NULL AND id > ?');
    $rest->execute([$lastId]);

    Response::json([
        'processed' => $done,
        'skipped'   => $skipped,
        'remaining' => (int)$rest->fetchColumn(),
        'lastId'    => $lastId,
        'total'     => (int)$db->query('SELECT COUNT(*) FROM photos')->fetchColumn(),
        'pending'   => (int)$db->query('SELECT COUNT(*) FROM photos WHERE full_path IS NULL')->fetchColumn(),
    ]);
}

// ── POST /api/system/cleanup ──────────────────────────────
if ($method === 'POST' && $action === 'cleanup') {
    Auth::verifyCsrf();
    $b       = getBody();
    $wanted  = is_array($b['paths'] ?? null) ? $b['paths'] : array_keys($CLEANABLE);

    $deleted = [];
    $failed  = [];
    foreach ($wanted as $rel) {
        if (!isset($CLEANABLE[$rel])) continue;    // nur die feste Liste, nichts sonst
        $abs = $root . '/' . $rel;
        if (!is_file($abs)) continue;
        if (@unlink($abs)) {
            $deleted[] = $rel;
        } else {
            $failed[] = ['path' => $rel, 'error' => 'Datei konnte nicht gelöscht werden (Schreibrechte prüfen).'];
        }
    }

    Response::json(['deleted' => $deleted, 'failed' => $failed]);
}

Response::error('Method not allowed', 405);
