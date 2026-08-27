<?php
require_once __DIR__ . '/bootstrap.php';

$user   = Auth::require();
$method = $_SERVER['REQUEST_METHOD'];
$parts  = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$caveId = $parts[count($parts) - 1] !== 'caves' ? $parts[count($parts) - 1] : null;
$db     = Database::get();

// ── GET /api/caves ────────────────────────────────────────
if ($method === 'GET' && !$caveId) {
    $sort    = in_array($_GET['sort'] ?? '', ['name','depth_m','length_m']) ? $_GET['sort'] : 'name';
    $country = $_GET['country'] ?? null;

    $where  = $country ? 'WHERE country = ?' : '';
    $params = $country ? [$country] : [];

    $sql = "
        SELECT c.*,
               COUNT(DISTINCT t.id) AS entries
        FROM caves c
        LEFT JOIN trips t ON t.cave_id = c.id
        $where
        GROUP BY c.id
        ORDER BY $sort ASC
    ";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    Response::json($stmt->fetchAll());
}

// ── GET /api/caves/:id ────────────────────────────────────
if ($method === 'GET' && $caveId) {
    $stmt = $db->prepare("
        SELECT c.*, COUNT(DISTINCT t.id) AS entries
        FROM caves c LEFT JOIN trips t ON t.cave_id = c.id
        WHERE c.id = ? GROUP BY c.id
    ");
    $stmt->execute([$caveId]);
    $cave = $stmt->fetch();
    if (!$cave) Response::notFound('Höhle nicht gefunden');
    Response::json($cave);
}

// ── POST /api/caves ───────────────────────────────────────
if ($method === 'POST' && !$caveId) {
    Auth::requireAdmin();
    Auth::verifyCsrf();
    $b = getBody();

    $id = slugify($b['name'] ?? 'hoehle') . '-' . substr(uniqid(), -4);

    $spalten = ['id','name','region','country','lat','lng','depth_m','length_m','type','discovered_year','notes','created_by'];
    $werte   = [
        $id, $b['name'] ?? '', $b['region'] ?? null, $b['country'] ?? null,
        isset($b['lat']) ? (float)$b['lat'] : null,
        isset($b['lng']) ? (float)$b['lng'] : null,
        isset($b['depth_m']) ? (int)$b['depth_m'] : null,
        isset($b['length_m']) ? (int)$b['length_m'] : null,
        $b['type'] ?? null,
        isset($b['discovered_year']) ? (int)$b['discovered_year'] : null,
        $b['notes'] ?? null, $user['id'],
    ];

    // Herkunft mitschreiben, sobald die Spalten vorhanden sind (Verwaltung →
    // System → Datenbank aktualisieren). Fremde Daten ohne Quellenangabe zu
    // übernehmen, hat uns bereits eine Beanstandung eingebracht.
    foreach (Schema::onlyExisting('caves', ['source','source_url','source_license']) as $col) {
        if (array_key_exists($col, $b) && $b[$col] !== null && $b[$col] !== '') {
            $wert = $col === 'source_url' ? pruefeQuellAdresse((string)$b[$col]) : (string)$b[$col];
            if ($wert === null) continue;   // unbrauchbare Adresse gar nicht erst speichern
            $spalten[] = $col;
            $werte[]   = $wert;
        }
    }

    $platz = implode(',', array_fill(0, count($spalten), '?'));
    $db->prepare('INSERT INTO caves (' . implode(', ', $spalten) . ") VALUES ($platz)")
       ->execute($werte);

    $stmt = $db->prepare('SELECT * FROM caves WHERE id = ?');
    $stmt->execute([$id]);
    Response::json($stmt->fetch(), 201);
}

// ── PATCH /api/caves/:id ──────────────────────────────────
if ($method === 'PATCH' && $caveId) {
    Auth::requireAdmin();
    Auth::verifyCsrf();
    $b = getBody();
    // Nur Spalten, die es in dieser Datenbank auch gibt — cover_* kommen erst
    // mit der Migration dazu (Admin-Panel → System).
    $allowed = Schema::onlyExisting('caves', ['name','region','country','lat','lng','depth_m','length_m','type','discovered_year','notes','cover_path','cover_thumb','source','source_url','source_license']);
    $set = []; $vals = [];
    foreach ($allowed as $col) {
        if (!array_key_exists($col, $b)) continue;
        $wert = $b[$col];
        if ($col === 'source_url' && $wert !== null && $wert !== '') {
            $wert = pruefeQuellAdresse((string)$wert);
            if ($wert === null) Response::error('Der Link zur Datenquelle muss mit http:// oder https:// beginnen.');
        }
        $set[] = "$col = ?"; $vals[] = $wert;
    }
    if ($set) { $vals[] = $caveId; $db->prepare("UPDATE caves SET " . implode(', ', $set) . " WHERE id = ?")->execute($vals); }
    $stmt = $db->prepare('SELECT * FROM caves WHERE id = ?');
    $stmt->execute([$caveId]);
    Response::json($stmt->fetch());
}

// ── DELETE /api/caves/:id ─────────────────────────────────
if ($method === 'DELETE' && $caveId) {
    Auth::requireAdmin();
    Auth::verifyCsrf();

    $exists = $db->prepare('SELECT name FROM caves WHERE id = ?');
    $exists->execute([$caveId]);
    $cave = $exists->fetch();
    if (!$cave) Response::notFound('Diese Höhle gibt es nicht (mehr).');

    // Befahrungen hängen ohne Cascade daran — ohne diese Prüfung käme statt
    // einer verständlichen Meldung ein roher Datenbankfehler zurück.
    $n = $db->prepare('SELECT COUNT(*) FROM trips WHERE cave_id = ?');
    $n->execute([$caveId]);
    $anzahl = (int)$n->fetchColumn();
    if ($anzahl > 0) {
        Response::error(
            "Zu dieser Höhle " . ($anzahl === 1 ? 'gehört noch eine Befahrung' : "gehören noch $anzahl Befahrungen")
            . '. Ordne sie zuerst einer anderen Höhle zu oder lösche sie — danach lässt sich die Höhle entfernen.',
            409
        );
    }

    // Pläne verschwinden per Cascade mit; ihre Dateien räumen wir hier weg.
    if (Schema::hasTable('cave_plans')) {
        $cfg  = require __DIR__ . '/../config/config.php';
        $rows = $db->prepare('SELECT path, thumb_path FROM cave_plans WHERE cave_id = ?');
        $rows->execute([$caveId]);
        foreach ($rows->fetchAll() as $plan) {
            foreach (array_unique(array_filter([$plan['path'], $plan['thumb_path']])) as $rel) {
                $abs = Images::toAbsolute((string)$rel, (string)$cfg['upload_dir']);
                if ($abs && is_file($abs)) @unlink($abs);
                // Bildableitungen liegen daneben
                if ($abs) foreach (['large_', 'full_'] as $prefix) {
                    $side = dirname($abs) . '/' . $prefix . basename($abs);
                    if (is_file($side)) @unlink($side);
                }
            }
        }
    }

    $db->prepare('DELETE FROM caves WHERE id = ?')->execute([$caveId]);
    Response::json(['ok' => true, 'name' => $cave['name']]);
}

Response::error('Method not allowed', 405);

/**
 * Adresse einer Datenquelle prüfen.
 *
 * Gespeichert wird sie nur, wenn sie gefahrlos verlinkt werden kann: Ein
 * `javascript:`-Ziel würde beim Klick Code im Namen des Lesers ausführen. Die
 * Oberfläche prüft ebenfalls — hier steht die Prüfung, weil sie für jeden Weg
 * gilt, auch für Aufrufe an der Oberfläche vorbei.
 */
function pruefeQuellAdresse(?string $url): ?string
{
    $url = trim((string)$url);
    if ($url === '') return null;

    // Seiteneigener Pfad — kein Schema, kann nichts ausführen.
    // „//fremde.tld" liest der Browser als Protokollwechsel, deshalb ausgeschlossen.
    if (str_starts_with($url, '/') && !str_starts_with($url, '//')) return $url;

    $schema = strtolower((string)parse_url($url, PHP_URL_SCHEME));
    if ($schema !== 'http' && $schema !== 'https') return null;
    if (parse_url($url, PHP_URL_HOST) === null) return null;

    return $url;
}
