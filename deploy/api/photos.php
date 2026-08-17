<?php
require_once __DIR__ . '/bootstrap.php';

Auth::require();
$db     = Database::get();
$method = $_SERVER['REQUEST_METHOD'];

// ── GET /api/photos?trip_id=xxx ───────────────────────────
if ($method === 'GET') {
    $tripId = $_GET['trip_id'] ?? '';
    if (!$tripId) Response::error('trip_id fehlt');

    // full_path/width/height kommen erst mit der Migration dazu
    $cols = Schema::onlyExisting('photos', [
        'id', 'path', 'thumb_path', 'large_path', 'full_path',
        'caption', 'taken_at', 'gps_lat', 'gps_lng', 'width', 'height', 'sort_order',
    ]);
    $stmt = $db->prepare(
        'SELECT ' . implode(', ', $cols) . ' FROM photos WHERE trip_id = ? ORDER BY sort_order, id'
    );
    $stmt->execute([$tripId]);
    Response::json($stmt->fetchAll());
}

// ── DELETE /api/photos?id=xxx ─────────────────────────────
if ($method === 'DELETE') {
    Auth::requireAdmin();
    Auth::verifyCsrf();
    $id = $_GET['id'] ?? '';
    if (!$id) Response::error('id fehlt');

    $cols = Schema::onlyExisting('photos', ['path', 'thumb_path', 'large_path', 'full_path']);
    $stmt = $db->prepare('SELECT ' . implode(', ', $cols) . ' FROM photos WHERE id = ?');
    $stmt->execute([$id]);
    $photo = $stmt->fetch();
    if (!$photo) Response::notFound();

    // Alle Dateien löschen — auch die Vollbild-Ableitung.
    // Zeigen zwei Spalten auf dieselbe Datei (kleine Originale), stört das nicht.
    $base = __DIR__ . '/..';
    foreach (array_unique(array_filter([
        $photo['path'] ?? null, $photo['thumb_path'] ?? null,
        $photo['large_path'] ?? null, $photo['full_path'] ?? null,
    ])) as $rel) {
        @unlink($base . $rel);
    }
    $db->prepare('DELETE FROM photos WHERE id = ?')->execute([$id]);
    Response::json(['ok' => true]);
}

// ── PATCH /api/photos?id=xxx — Titelbild der Befahrung setzen ──
// Setzt das Foto an den Anfang (niedrigste sort_order) → es wird zum Cover.
if ($method === 'PATCH') {
    Auth::requireAdmin();
    Auth::verifyCsrf();
    $id = $_GET['id'] ?? '';
    if (!$id) Response::error('id fehlt');
    $b = getBody();
    if (!empty($b['make_cover'])) {
        $stmt = $db->prepare('SELECT trip_id FROM photos WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) Response::notFound();
        $min = $db->prepare('SELECT MIN(sort_order) FROM photos WHERE trip_id = ?');
        $min->execute([$row['trip_id']]);
        $minVal = (int)$min->fetchColumn();
        $db->prepare('UPDATE photos SET sort_order = ? WHERE id = ?')->execute([$minVal - 1, $id]);
    }
    Response::json(['ok' => true]);
}

Response::error('Method not allowed', 405);
