<?php
require_once __DIR__ . '/bootstrap.php';

Auth::require();
$db     = Database::get();
$method = $_SERVER['REQUEST_METHOD'];

// ── GET /api/photos?trip_id=xxx ───────────────────────────
if ($method === 'GET') {
    $tripId = $_GET['trip_id'] ?? '';
    if (!$tripId) Response::error('trip_id fehlt');

    $stmt = $db->prepare(
        'SELECT id, path, thumb_path, large_path, caption, gps_lat, gps_lng, sort_order
         FROM photos WHERE trip_id = ? ORDER BY sort_order, id'
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

    $stmt = $db->prepare('SELECT path, thumb_path, large_path FROM photos WHERE id = ?');
    $stmt->execute([$id]);
    $photo = $stmt->fetch();
    if (!$photo) Response::notFound();

    // Dateien löschen
    $base = __DIR__ . '/..';
    foreach (['path','thumb_path','large_path'] as $col) {
        if ($photo[$col]) @unlink($base . $photo[$col]);
    }
    $db->prepare('DELETE FROM photos WHERE id = ?')->execute([$id]);
    Response::json(['ok' => true]);
}

Response::error('Method not allowed', 405);
