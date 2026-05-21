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

    $db->prepare("
        INSERT INTO caves (id, name, region, country, lat, lng, depth_m, length_m, type, discovered_year, notes, created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    ")->execute([
        $id, $b['name'] ?? '', $b['region'] ?? null, $b['country'] ?? null,
        isset($b['lat']) ? (float)$b['lat'] : null,
        isset($b['lng']) ? (float)$b['lng'] : null,
        isset($b['depth_m']) ? (int)$b['depth_m'] : null,
        isset($b['length_m']) ? (int)$b['length_m'] : null,
        $b['type'] ?? null,
        isset($b['discovered_year']) ? (int)$b['discovered_year'] : null,
        $b['notes'] ?? null, $user['id'],
    ]);

    $stmt = $db->prepare('SELECT * FROM caves WHERE id = ?');
    $stmt->execute([$id]);
    Response::json($stmt->fetch(), 201);
}

// ── PATCH /api/caves/:id ──────────────────────────────────
if ($method === 'PATCH' && $caveId) {
    Auth::requireAdmin();
    Auth::verifyCsrf();
    $b = getBody();
    $allowed = ['name','region','country','lat','lng','depth_m','length_m','type','discovered_year','notes'];
    $set = []; $vals = [];
    foreach ($allowed as $col) {
        if (array_key_exists($col, $b)) { $set[] = "$col = ?"; $vals[] = $b[$col]; }
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
    $db->prepare('DELETE FROM caves WHERE id = ?')->execute([$caveId]);
    Response::json(['ok' => true]);
}

Response::error('Method not allowed', 405);
