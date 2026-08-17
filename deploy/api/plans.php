<?php
require_once __DIR__ . '/bootstrap.php';

/**
 * Pläne einer Höhle — Grundrisse, Schnitte, Kartenausschnitte.
 *
 * GET    /api/plans?cave_id=…   Liste (alle Angemeldeten)
 * POST   /api/plans             Hochladen, multipart (nur Bearbeiter)
 * PATCH  /api/plans?id=…        Titel, Art oder Reihenfolge ändern
 * DELETE /api/plans?id=…        Plan samt Dateien entfernen
 *
 * Getrennt von den Fotos: Pläne gehören zur Höhle und gelten für alle
 * Befahrungen. Erlaubt sind JPEG, PNG und PDF. Für Bilder werden dieselben
 * Ableitungen erzeugt wie für Fotos; ein PDF wird unverändert abgelegt und
 * im Betrachter des Geräts geöffnet.
 */

$user   = Auth::require();
$db     = Database::get();
$method = $_SERVER['REQUEST_METHOD'];

if (!Schema::hasTable('cave_plans')) {
    Response::error('Die Datenbank ist noch nicht auf dem neuesten Stand. Bitte im Admin-Bereich unter „System" die Datenbank aktualisieren.', 409);
}

/** Zulässige Arten — bestimmen nur die Beschriftung und die Sortierung. */
const PLAN_KINDS = ['grundriss', 'schnitt', 'karte', 'sonstiges'];

// ── GET /api/plans?cave_id=… ──────────────────────────────
if ($method === 'GET') {
    $caveId = $_GET['cave_id'] ?? '';
    if ($caveId === '') Response::error('cave_id fehlt');

    $stmt = $db->prepare(
        'SELECT id, cave_id, title, kind, path, thumb_path, mime, bytes, width, height, sort_order, created_at
         FROM cave_plans WHERE cave_id = ? ORDER BY sort_order, id'
    );
    $stmt->execute([$caveId]);
    Response::json(array_map('publicPlan', $stmt->fetchAll()));
}

// ── POST /api/plans — hochladen ───────────────────────────
if ($method === 'POST') {
    Auth::requireAdmin();
    Auth::verifyCsrf();

    $caveId = $_POST['cave_id'] ?? '';
    if ($caveId === '') Response::error('cave_id fehlt');

    $exists = $db->prepare('SELECT id FROM caves WHERE id = ?');
    $exists->execute([$caveId]);
    if (!$exists->fetch()) Response::notFound('Höhle nicht gefunden.');

    $file = $_FILES['plan'] ?? null;
    if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
        Response::error('Der Upload ist unterwegs abgebrochen.');
    }

    $cfg  = require __DIR__ . '/../config/config.php';
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);

    $allowed = [
        'image/jpeg'      => 'jpg',
        'image/png'       => 'png',
        'application/pdf' => 'pdf',
    ];
    if (!isset($allowed[$mime])) {
        Response::error('Nur JPG, PNG und PDF sind möglich.');
    }

    $maxBytes = (int)($cfg['max_upload_mb'] ?? 12) * 1024 * 1024;
    if ($file['size'] > $maxBytes) {
        Response::error('Die Datei ist größer als ' . (int)($cfg['max_upload_mb'] ?? 12) . ' MB.');
    }

    $safeId = preg_replace('/[^a-z0-9\-]/', '', $caveId);
    $dir    = rtrim((string)$cfg['upload_dir'], '/') . '/plans/' . $safeId . '/';
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
        Response::error('Das Verzeichnis für Pläne konnte nicht angelegt werden.', 500);
    }

    $name = bin2hex(random_bytes(8)) . '.' . $allowed[$mime];
    $dest = $dir . $name;
    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        Response::error('Die Datei konnte nicht gespeichert werden.', 500);
    }

    $relBase = '/uploads/plans/' . $safeId;
    $relPath = $relBase . '/' . $name;

    // Nur Bilder bekommen Ableitungen; ein PDF bleibt, wie es ist.
    $thumbRel = null;
    $w = $h = null;
    if ($mime !== 'application/pdf') {
        $derived = Images::derive($dest);
        if ($derived) {
            $w = $derived['width'];
            $h = $derived['height'];
            if (!empty($derived['created']['thumb'])) $thumbRel = $relBase . '/thumb_' . $name;
        }
    }

    $title = trim((string)($_POST['title'] ?? ''));
    if ($title === '') $title = pathinfo((string)$file['name'], PATHINFO_FILENAME) ?: 'Plan';
    $title = mb_substr($title, 0, 180);

    $kind = in_array($_POST['kind'] ?? '', PLAN_KINDS, true) ? $_POST['kind'] : 'sonstiges';

    $next = $db->prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM cave_plans WHERE cave_id = ?');
    $next->execute([$caveId]);

    $db->prepare(
        'INSERT INTO cave_plans (cave_id, title, kind, path, thumb_path, mime, bytes, width, height, sort_order, created_by)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)'
    )->execute([
        $caveId, $title, $kind, $relPath, $thumbRel, $mime,
        (int)$file['size'], $w, $h, (int)$next->fetchColumn(), $user['id'],
    ]);

    $row = $db->prepare('SELECT * FROM cave_plans WHERE id = ?');
    $row->execute([(int)$db->lastInsertId()]);
    Response::json(publicPlan($row->fetch()), 201);
}

// ── PATCH /api/plans?id=… ─────────────────────────────────
if ($method === 'PATCH') {
    Auth::requireAdmin();
    Auth::verifyCsrf();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) Response::error('id fehlt');
    $b = getBody();

    $sets = [];
    $vals = [];
    if (isset($b['title'])) {
        $t = trim((string)$b['title']);
        if ($t === '') Response::error('Bitte eine Bezeichnung angeben.');
        $sets[] = 'title = ?'; $vals[] = mb_substr($t, 0, 180);
    }
    if (isset($b['kind'])) {
        if (!in_array($b['kind'], PLAN_KINDS, true)) Response::error('Unbekannte Art.');
        $sets[] = 'kind = ?'; $vals[] = $b['kind'];
    }
    if (isset($b['sort_order'])) { $sets[] = 'sort_order = ?'; $vals[] = (int)$b['sort_order']; }

    if (!$sets) Response::error('Keine Änderung angegeben.');

    $vals[] = $id;
    $db->prepare('UPDATE cave_plans SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($vals);

    $row = $db->prepare('SELECT * FROM cave_plans WHERE id = ?');
    $row->execute([$id]);
    $found = $row->fetch();
    if (!$found) Response::notFound('Plan nicht gefunden.');
    Response::json(publicPlan($found));
}

// ── DELETE /api/plans?id=… ────────────────────────────────
if ($method === 'DELETE') {
    Auth::requireAdmin();
    Auth::verifyCsrf();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) Response::error('id fehlt');

    $stmt = $db->prepare('SELECT path, thumb_path FROM cave_plans WHERE id = ?');
    $stmt->execute([$id]);
    $plan = $stmt->fetch();
    if (!$plan) Response::notFound('Plan nicht gefunden.');

    $cfg = require __DIR__ . '/../config/config.php';
    foreach (array_unique(array_filter([$plan['path'], $plan['thumb_path']])) as $rel) {
        $abs = Images::toAbsolute((string)$rel, (string)$cfg['upload_dir']);
        if ($abs && is_file($abs)) @unlink($abs);
    }
    // Bei Bildern liegen daneben noch large_/full_ aus derselben Verarbeitung.
    $abs = Images::toAbsolute((string)$plan['path'], (string)$cfg['upload_dir']);
    if ($abs) {
        foreach (['large_', 'full_'] as $prefix) {
            $side = dirname($abs) . '/' . $prefix . basename($abs);
            if (is_file($side)) @unlink($side);
        }
    }

    $db->prepare('DELETE FROM cave_plans WHERE id = ?')->execute([$id]);
    Response::json(['ok' => true]);
}

Response::error('Method not allowed', 405);

// ── Helpers ───────────────────────────────────────────────

/** Datenbankzeile → API-Form, mit allem, was die Anzeige braucht. */
function publicPlan(array $p): array
{
    $isPdf = ($p['mime'] ?? '') === 'application/pdf';
    return [
        'id'      => (int)$p['id'],
        'cave_id' => $p['cave_id'],
        'title'   => $p['title'],
        'kind'    => $p['kind'],
        'url'     => $p['path'],
        'thumb'   => $p['thumb_path'] ?: ($isPdf ? null : $p['path']),
        'mime'    => $p['mime'],
        'is_pdf'  => $isPdf,
        'bytes'   => (int)$p['bytes'],
        'width'   => $p['width']  !== null ? (int)$p['width']  : null,
        'height'  => $p['height'] !== null ? (int)$p['height'] : null,
        'sort_order' => (int)$p['sort_order'],
        'created_at' => $p['created_at'] ?? null,
    ];
}
